<?php
/**
 * /api/order/list 与 /api/order/detail 路由：订单查询（BE-006，鉴权）。
 *
 * 用户维度数据（非公开内容），不做 Transients 缓存，避免跨用户串数与状态陈旧。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}

/**
 * 订单查询路由控制器。
 */
class Sutwx_Rest_Orders extends Sutwx_Rest_Base {

	/**
	 * 注册 /order/list 与 /order/detail。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/order/list',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list_items' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
				'args'                => array(
					'page'     => array( 'sanitize_callback' => 'absint' ),
					'pageSize' => array( 'sanitize_callback' => 'absint' ),
					'status'   => array( 'sanitize_callback' => 'absint' ),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/order/detail',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'detail' ),
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
	 * 订单列表：按当前用户分页查询。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function list_items( $request ) {
		$user_id = Sutwx_Auth_Guard::current_user_id( $request );
		if ( $user_id <= 0 ) {
			return $this->error( __( '登录已过期，请重新登录', 'sutwx-app-api' ), 401, 'sutwx_unauthorized' );
		}
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return $this->error( __( 'WooCommerce 未启用', 'sutwx-app-api' ), 503, 'sutwx_woocommerce_missing' );
		}

		$paging  = $this->get_paging_args( $request );
		$status  = (int) $request->get_param( 'status' );
		$statuses = sutwx_order_statuses_for_code( $status );

		$query = array(
			'customer_id' => $user_id,
			'limit'       => $paging['pageSize'],
			'paged'       => $paging['page'],
			'orderby'     => 'date',
			'order'       => 'DESC',
			'paginate'    => true,
		);
		if ( $statuses ) {
			$query['status'] = $statuses;
		}

		$result = wc_get_orders( $query );
		$orders = isset( $result->orders ) ? (array) $result->orders : array();
		$total  = isset( $result->total ) ? (int) $result->total : count( $orders );

		return $this->success(
			array(
				'list'     => sutwx_map_orders( $orders ),
				'total'    => $total,
				'page'     => $paging['page'],
				'pageSize' => $paging['pageSize'],
			)
		);
	}

	/**
	 * 订单详情：仅允许查看本人订单。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function detail( $request ) {
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

		$mapped = sutwx_map_order( $order );
		if ( ! $mapped ) {
			return $this->error( __( '订单不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		return $this->success( $mapped );
	}
}
