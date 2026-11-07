<?php
/**
 * 创建订单流程（自 class-rest-order-actions.php 拆出）。
 * 通过 trait 合并进 Sutwx_Rest_Order_Actions，保持对外调用方式不变。
 *
 * @package SutwxAppApi
 * @version 0.7.1
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

/**
 * 下单：幂等锁 + 商品/地址装配 + 落库。
 */
trait Sutwx_Rest_Order_Create {

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
			$this->release_idempotency( $user_id, $client_request_id );
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
			$this->release_idempotency( $user_id, $client_request_id );
			return $this->error( $applied['error'], $applied['status'], $applied['code'] );
		}

		Sutwx_Order_Items::apply_address( $order, $address );
		$order->set_customer_note( $remark );

		$order->calculate_totals();
		$order_id = $order->save();

		if ( ! $order_id ) {
			$this->release_idempotency( $user_id, $client_request_id );
			return $this->error( __( '下单失败，请稍后重试', 'sutwx-app-api' ), 500, 'sutwx_order_create_failed' );
		}

		if ( '' !== $client_request_id ) {
			Sutwx_Order_Idempotency::commit( $user_id, $client_request_id, (int) $order_id );
		}

		return $this->success( sutwx_map_order( wc_get_order( $order_id ) ) );
	}

	/**
	 * 失败路径释放幂等锁，避免短锁把后续重试全部挡在门外。
	 *
	 * @param int    $user_id           用户 ID。
	 * @param string $client_request_id 客户端请求 ID。
	 */
	private function release_idempotency( $user_id, $client_request_id ) {
		if ( '' !== $client_request_id ) {
			Sutwx_Order_Idempotency::release( $user_id, $client_request_id );
		}
	}
}
