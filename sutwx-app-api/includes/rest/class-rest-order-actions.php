<?php
/**
 * /api/order/create|cancel|confirm 路由：订单创建与状态流转（BE-006，鉴权）。
 *
 * 职责拆分（保持对外调用方式不变）：
 * - 创建订单（幂等/装配/落库）→ includes/order/class-order-create.php
 * - 状态流转（取消/确认收货）→ includes/order/class-order-transition.php
 * - 商家发货 → includes/rest/class-rest-order-ship.php
 *
 * @package SutwxAppApi
 * @version 0.7.1
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}
// 自保护：独立 include 本类（含单测）时也能加载到 trait。
if ( ! trait_exists( 'Sutwx_Rest_Order_Create' ) ) {
	require_once SUTWX_API_DIR . 'includes/order/class-order-create.php';
}
if ( ! trait_exists( 'Sutwx_Rest_Order_Transition' ) ) {
	require_once SUTWX_API_DIR . 'includes/order/class-order-transition.php';
}

/**
 * 订单写操作路由控制器。
 */
class Sutwx_Rest_Order_Actions extends Sutwx_Rest_Base {

	use Sutwx_Rest_Order_Create;
	use Sutwx_Rest_Order_Transition;

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
}
