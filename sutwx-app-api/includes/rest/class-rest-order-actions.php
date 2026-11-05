<?php
/**
 * /api/order/create|cancel|confirm 路由：订单创建与状态流转（BE-006，鉴权）。
 *
 * @package SutwxAppApi
 * @version 0.7.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}
if ( ! class_exists( 'Sutwx_Order_Items' ) ) {
	require_once SUTWX_API_DIR . 'includes/order/class-order-items.php';
}
if ( ! class_exists( 'Sutwx_Order_Idempotency' ) ) {
	require_once SUTWX_API_DIR . 'includes/order/class-order-idempotency.php';
}
if ( ! class_exists( 'Sutwx_Pay_Refund' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-pay-refund.php';
}

/**
 * 订单写操作路由控制器。
 */
class Sutwx_Rest_Order_Actions extends Sutwx_Rest_Base {

	/**
	 * 注册创建/取消/确认收货三个路由。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/order/create',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/order/cancel',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'cancel' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/order/confirm',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'confirm' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

	}

	/**
	 * 创建订单：购物车商品 + 收货地址快照 → WC 挂起订单（pending）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function create( $request ) {
		$user_id = Sutwx_Auth_Guard::current_user_id( $request );
		if ( $user_id <= 0 ) {
			return $this->error( __( '登录已过期，请重新登录', 'sutwx-app-api' ), 401, 'sutwx_unauthorized' );
		}
		if ( ! class_exists( 'WC_Order' ) || ! function_exists( 'wc_get_product' ) ) {
			return $this->error( __( 'WooCommerce 未启用', 'sutwx-app-api' ), 503, 'sutwx_woocommerce_missing' );
		}

		// BE-011：下单幂等 —— clientRequestId 短锁去重，重复请求返回原订单。
		$client_request_id = (string) ( $request->get_param( 'clientRequestId' ) ? $request->get_param( 'clientRequestId' ) : '' );
		$idem = array( 'status' => 'acquired', 'order_id' => 0 );
		if ( '' !== $client_request_id ) {
			$idem = Sutwx_Order_Idempotency::acquire( $user_id, $client_request_id );
			if ( 'duplicate' === $idem['status'] ) {
				$duplicate = wc_get_order( $idem['order_id'] );
				if ( $duplicate && (int) $duplicate->get_customer_id() === $user_id ) {
					return $this->success( sutwx_map_order( $duplicate ) );
				}
			}
			if ( 'processing' === $idem['status'] ) {
				return $this->error( __( '订单正在创建中，请稍后重试', 'sutwx-app-api' ), 409, 'sutwx_order_processing' );
			}
		}
		$items   = $request->get_param( 'items' );
		$address = $request->get_param( 'address' );
		$remark  = (string) ( $request->get_param( 'remark' ) ? $request->get_param( 'remark' ) : '' );

		if ( ! is_array( $items ) || empty( $items ) ) {
			return $this->error( __( '订单商品不能为空', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
		}
		$address = is_array( $address ) ? $address : array();

		$order = new WC_Order();
		$order->set_status( 'pending' );
		$order->set_customer_id( $user_id );
		$order->set_currency( function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : 'CNY' );

		// 商品聚合 + 库存校验（细节见 includes/order/class-order-items.php）。
		$applied = Sutwx_Order_Items::apply( $order, $items );
		if ( ! $applied['ok'] ) {
			return $this->error( $applied['error'], $applied['status'], $applied['code'] );
		}

		Sutwx_Order_Items::apply_address( $order, $address );
		$order->set_customer_note( $remark );

		$order->calculate_totals();
		$order_id = $order->save();

		if ( ! $order_id ) {
			if ( '' !== $client_request_id ) {
				Sutwx_Order_Idempotency::release( $user_id, $client_request_id );
			}
			return $this->error( __( '下单失败，请稍后重试', 'sutwx-app-api' ), 500, 'sutwx_order_create_failed' );
		}

		if ( '' !== $client_request_id ) {
			Sutwx_Order_Idempotency::commit( $user_id, $client_request_id, (int) $order_id );
		}

		return $this->success( sutwx_map_order( wc_get_order( $order_id ) ) );
	}

	/**
	 * 取消订单：仅本人待付款订单可取消。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function cancel( $request ) {
		return $this->transition( $request, 'cancel' );
	}

	/**
	 * 确认收货：本人「待发货」或「待收货」订单均可确认（兼容 shipped）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function confirm( $request ) {
		return $this->transition( $request, 'confirm' );
	}

	/**
	 * 状态流转统一入口（校验归属与当前状态后执行）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @param string          $action  cancel|confirm。
	 * @return array|WP_Error
	 */
	private function transition( $request, $action ) {
		$user_id = Sutwx_Auth_Guard::current_user_id( $request );
		if ( $user_id <= 0 ) {
			return $this->error( __( '登录已过期，请重新登录', 'sutwx-app-api' ), 401, 'sutwx_unauthorized' );
		}

		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return $this->error( __( '订单 ID 无效', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
		}
		if ( ! function_exists( 'wc_get_order' ) ) {
			return $this->error( __( 'WooCommerce 未启用', 'sutwx-app-api' ), 503, 'sutwx_woocommerce_missing' );
		}

		$order = wc_get_order( $id );
		if ( ! $order || (int) $order->get_customer_id() !== $user_id ) {
			return $this->error( __( '订单不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		$current = (string) $order->get_status();
		if ( 'cancel' === $action ) {
			if ( 'processing' === $current ) {
				// BE-014：已支付订单取消 → 发起微信整单退款（金额=实付，SEC-002）。
				$refund = Sutwx_Pay_Refund::refund_order( $order );
				if ( empty( $refund['ok'] ) ) {
					$this->log_error(
						'pay_exception',
						array(
							'code'    => 'refund_' . $refund['error'],
							'status'  => 502,
							'route'   => '/order/cancel',
							'orderId' => $id,
						)
					);
					return $this->error( __( '退款发起失败，请稍后重试', 'sutwx-app-api' ), 502, 'sutwx_refund_failed' );
				}
				return $this->success( sutwx_map_order( wc_get_order( $id ) ) );
			}
			if ( ! in_array( $current, array( 'pending', 'on-hold', 'failed' ), true ) ) {
				return $this->error( __( '当前订单状态不可取消', 'sutwx-app-api' ), 409, 'sutwx_invalid_status' );
			}
			$order->update_status( 'cancelled', __( '用户主动取消', 'sutwx-app-api' ) );
		} else {
			if ( ! sutwx_order_can_confirm( $current ) ) {
				return $this->error( __( '订单状态不可确认收货', 'sutwx-app-api' ), 409, 'sutwx_invalid_status' );
			}
			$order->update_status( 'completed', __( '用户确认收货', 'sutwx-app-api' ) );
		}

		return $this->success( sutwx_map_order( wc_get_order( $id ) ) );
	}

}
