<?php
/**
 * /api/health 健康检查端点（BE-009）：供运维拨测与上线验证。
 *
 * 公开免鉴权（限频器按 public 桶自动限流），返回插件版本、PHP 版本、
 * WooCommerce 是否启用、支付凭证是否配置完整。不暴露任何敏感值。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Pay_Credentials' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-pay-credentials.php';
}

/**
 * 健康检查路由控制器。
 */
class Sutwx_Rest_Health extends Sutwx_Rest_Base {

	/**
	 * 注册 /health。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/health',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * 返回健康状态：{version, php, wcActive, payConfigured}。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array
	 */
	public function get_item( $request ) {
		return $this->success(
			array(
				'version'       => defined( 'SUTWX_API_VERSION' ) ? SUTWX_API_VERSION : '',
				'php'           => PHP_VERSION,
				'wcActive'      => class_exists( 'WooCommerce' ),
				'payConfigured' => class_exists( 'Sutwx_Pay_Credentials' ) && Sutwx_Pay_Credentials::is_configured(),
			)
		);
	}
}
