<?php
/**
 * /api/pay/prepay、/api/pay/notify、/api/pay/refund-notify 路由：微信支付 V3（BE-007/014）。
 *
 * 职责拆分（保持对外调用方式不变）：
 * - 支付/退款异步通知（验签解密/落库/回执）→ includes/pay/class-pay-notify-handler.php
 * - 预支付参数生成与路由注册 → 本文件
 * - 主动查单 → includes/rest/class-rest-pay-query.php
 *
 * @package SutwxAppApi
 * @version 0.7.1
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}
// 自保护：独立 include 本类（含单测）时也能加载到通知处理 trait。
if ( ! trait_exists( 'Sutwx_Rest_Pay_Notify' ) ) {
	require_once SUTWX_API_DIR . 'includes/pay/class-pay-notify-handler.php';
}

/**
 * 支付路由控制器。
 */
class Sutwx_Rest_Pay extends Sutwx_Rest_Base {

	use Sutwx_Rest_Pay_Notify;

	/**
	 * 订单 meta：商户订单号。
	 */
	const META_OUT_TRADE_NO = '_sutwx_out_trade_no';

	/**
	 * 订单 meta：微信支付交易号。
	 */
	const META_TRANSACTION_ID = '_sutwx_transaction_id';

	/**
	 * 注册预支付、支付通知与退款通知路由（查单见 class-rest-pay-query.php）。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/pay/prepay',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'prepay' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
				'args'                => array(
					'orderId' => array(
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/pay/notify',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'notify' ),
				'permission_callback' => '__return_true', // 微信回调，靠验签保证安全。
			)
		);

		// BE-014：退款结果异步通知（公开，微信服务端调用；验签解密后更新订单为已退款）。
		register_rest_route(
			SUTWX_API_REST_NS,
			'/pay/refund-notify',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'refund_notify' ),
				'permission_callback' => '__return_true', // 微信回调，靠验签保证安全。
			)
		);
	}

	/**
	 * 预支付：返回小程序调起支付参数。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function prepay( $request ) {
		$auth = Sutwx_Auth_Guard::authorize( $request );
		if ( ! $auth['ok'] ) {
			return $this->error( __( '登录已过期，请重新登录', 'sutwx-app-api' ), 401, 'sutwx_unauthorized' );
		}
		if ( ! Sutwx_Pay_Credentials::is_configured() ) {
			return $this->error( __( '支付未配置，请联系管理员', 'sutwx-app-api' ), 503, 'sutwx_pay_not_configured' );
		}

		$user_id = isset( $auth['payload']['sub'] ) ? (int) $auth['payload']['sub'] : 0;
		$order   = Sutwx_Pay_Order_Sync::own_order( $user_id, (int) $request->get_param( 'orderId' ) );
		if ( ! $order ) {
			return $this->error( __( '订单不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}
		if ( 'pending' !== (string) $order->get_status() ) {
			return $this->error( __( '订单当前状态不可支付', 'sutwx-app-api' ), 409, 'sutwx_invalid_status' );
		}

		$openid = isset( $auth['payload']['openid'] ) ? (string) $auth['payload']['openid'] : '';
		if ( '' === $openid ) {
			return $this->error( __( '缺少用户标识', 'sutwx-app-api' ), 400, 'sutwx_openid_missing' );
		}

		// out_trade_no 首试生成并固化，重试复用（避免 OUT_TRADE_NO_USED）。
		// 采用「订单 ID + 确定性短签名」而非 time()：并发预支付不会各自生成不同单号
		// 并互相覆盖，微信侧也就不会残留无效商户单。
		$out_trade_no = (string) $order->get_meta( self::META_OUT_TRADE_NO );
		if ( '' === $out_trade_no ) {
			$salt = defined( 'SECURE_AUTH_KEY' ) ? (string) SECURE_AUTH_KEY : 'sutwx';
			$out_trade_no = 'SUT' . $order->get_id() . 'X' . strtoupper( substr( md5( $salt . ':' . $order->get_id() ), 0, 8 ) );
			$order->update_meta_data( self::META_OUT_TRADE_NO, $out_trade_no );
			$order->save();
		}

		$amount_fen = (int) round( (float) $order->get_total() * 100 );
		$notify_url = home_url( '/api/pay/notify' );
		$result     = Sutwx_Wechat_Pay::jsapi_prepay(
			$openid,
			$out_trade_no,
			$amount_fen,
			'苏铁小程序订单-' . $order->get_order_number(),
			$notify_url
		);

		if ( empty( $result['ok'] ) ) {
			// BE-010：预支付失败必记（pay_exception）。
			$this->log_error(
				'pay_exception',
				array(
					'code'    => 'sutwx_prepay_failed',
					'status'  => 502,
					'route'   => '/pay/prepay',
					'orderId' => $order->get_id(),
					'detail'  => array( 'error' => (string) $result['error'] ),
				)
			);
			return $this->error( $result['error'], 502, 'sutwx_prepay_failed' );
		}

		$pay_params = Sutwx_Wechat_Pay::build_pay_params( $result['prepay_id'] );
		$pay_params['orderId'] = $order->get_id();

		return $this->success( $pay_params );
	}
}
