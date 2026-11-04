<?php
/**
 * /api/order/ship 路由：商家标记发货（自 class-rest-order-actions.php 拆出）。
 *
 * 该端点供商家/WC 后台侧调用（需 manage_woocommerce 权限），非小程序顾客 JWT。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Rest_Base' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-rest-base.php';
}

if ( ! class_exists( 'Sutwx_Rest_Order_Ship' ) ) {
	/**
	 * 订单发货控制器。
	 */
	class Sutwx_Rest_Order_Ship extends Sutwx_Rest_Base {

		/**
		 * 注册发货路由。
		 */
		public function register_routes() {
			register_rest_route(
				SUTWX_API_REST_NS,
				'/order/ship',
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'ship' ),
					'permission_callback' => array( __CLASS__, 'permission_manage_orders' ),
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
		 * 商家标记发货：仅「待发货」可发货，已发货幂等返回（BE-006 补全 shipped 状态）。
		 *
		 * @param WP_REST_Request $request 请求对象。
		 * @return array|WP_Error
		 */
		public function ship( $request ) {
			$id = (int) $request->get_param( 'id' );
			if ( $id <= 0 ) {
				return $this->error( __( '订单 ID 无效', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
			}
			if ( ! function_exists( 'wc_get_order' ) ) {
				return $this->error(
					__( 'WooCommerce 未启用', 'sutwx-app-api' ),
					503,
					'sutwx_woocommerce_missing'
				);
			}

			$order = wc_get_order( $id );
			if ( ! $order ) {
				return $this->error( __( '订单不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
			}

			$current = (string) $order->get_status();
			if ( 'shipped' === $current ) {
				return $this->success( sutwx_map_order( $order ) ); // 已发货，幂等。
			}
			if ( ! sutwx_order_can_ship( $current ) ) {
				return $this->error(
					__( '仅待发货订单可标记发货', 'sutwx-app-api' ),
					409,
					'sutwx_invalid_status'
				);
			}

			$order->update_status( 'shipped', __( '商家已发货', 'sutwx-app-api' ) );

			return $this->success( sutwx_map_order( wc_get_order( $id ) ) );
		}

		/**
		 * 商家/WC 后台权限：需 manage_woocommerce 能力（标记发货等后台操作）。
		 *
		 * @return bool
		 */
		public static function permission_manage_orders() {
			return (bool) current_user_can( 'manage_woocommerce' );
		}
	}
}
