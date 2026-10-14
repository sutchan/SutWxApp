<?php
/**
 * /api/pay/prepay 与 /api/pay/notify 路由：微信支付 V3 对接（BE-007；查单见 class-rest-pay-query.php）。
 *
 * - prepay：鉴权；校验订单归属与待付款状态后发起 JSAPI 预支付，返回 wx.requestPayment 参数。
 * - notify：公开；验签解密后将订单置为「待发货」，幂等处理重复通知。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}

/**
 * 支付路由控制器。
 */
class Sutwx_Rest_Pay extends Sutwx_Rest_Base {

	/**
	 * 订单 meta：商户订单号。
	 */
	const META_OUT_TRADE_NO = '_sutwx_out_trade_no';

	/**
	 * 订单 meta：微信支付交易号。
	 */
	const META_TRANSACTION_ID = '_sutwx_transaction_id';

	/**
	 * 注册预支付与通知路由（查单见 class-rest-pay-query.php）。
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
		$out_trade_no = (string) $order->get_meta( self::META_OUT_TRADE_NO );
		if ( '' === $out_trade_no ) {
			$out_trade_no = 'SUT' . $order->get_id() . 'T' . time();
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
			return $this->error( $result['error'], 502, 'sutwx_prepay_failed' );
		}

		$pay_params = Sutwx_Wechat_Pay::build_pay_params( $result['prepay_id'] );
		$pay_params['orderId'] = $order->get_id();

		return $this->success( $pay_params );
	}

	/**
	 * 异步通知：验签解密 → 订单置「待发货」（幂等）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array
	 */
	public function notify( $request ) {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( false ) );
		}

		$body   = (string) $request->get_body();
		$parsed = Sutwx_Wechat_Pay_Notify::parse( $this->request_headers( $request ), $body );

		if ( empty( $parsed['ok'] ) ) {
			return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( false ) );
		}

		$ok = Sutwx_Pay_Order_Sync::apply_paid( $parsed['data'] );

		return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( $ok ) );
	}

	/**
	 * 提取请求头（兼容 REST 服务器不透传的场景）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array
	 */
	private function request_headers( $request ) {
		$headers = array();
		foreach ( array( 'Wechatpay-Signature', 'Wechatpay-Timestamp', 'Wechatpay-Nonce', 'Wechatpay-Serial' ) as $name ) {
			$value = $request->get_header( $name );
			if ( '' !== $value ) {
				$headers[ $name ] = $value;
			}
		}
		return $headers;
	}
}
