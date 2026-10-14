<?php
/**
 * /api/pay/query 路由：主动查单同步（BE-007，拆自 class-rest-pay.php）。
 *
 * 支付回调延迟时由前端主动触发：查微信订单状态，成功则幂等落库并返回最新订单。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}

/**
 * 查单路由控制器。
 */
class Sutwx_Rest_Pay_Query extends Sutwx_Rest_Base {

	/**
	 * 注册 /pay/query。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/pay/query',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'query' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
				'args'                => array(
					'orderId' => array(
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}

	/**
	 * 查单并同步状态。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function query( $request ) {
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

		$out_trade_no = (string) $order->get_meta( Sutwx_Rest_Pay::META_OUT_TRADE_NO );
		$result       = array( 'ok' => false, 'trade_state' => '' );
		if ( '' !== $out_trade_no ) {
			$result = Sutwx_Wechat_Pay::query_out_trade( $out_trade_no );
			if ( ! empty( $result['ok'] ) && 'SUCCESS' === $result['trade_state'] ) {
				Sutwx_Pay_Order_Sync::apply_paid(
					array(
						'out_trade_no'   => $out_trade_no,
						'trade_state'    => 'SUCCESS',
						'transaction_id' => $result['transaction_id'],
						'amount'         => array( 'total' => (int) round( (float) $order->get_total() * 100 ) ),
					)
				);
			}
		}

		return $this->success(
			array(
				'tradeState' => isset( $result['trade_state'] ) ? $result['trade_state'] : '',
				'order'      => sutwx_map_order( wc_get_order( $order->get_id() ) ),
			)
		);
	}
}
