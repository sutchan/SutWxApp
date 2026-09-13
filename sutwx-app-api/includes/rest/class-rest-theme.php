<?php
/**
 * /api/theme 路由：读取后台主题配置返回（P2 接入 Sutwx_Settings 校验后输出）。
 *
 * @package SutwxAppApi
 * @version 0.3.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Settings' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-settings.php';
}

/**
 * 主题路由控制器。
 */
class Sutwx_Rest_Theme extends Sutwx_Rest_Base {

	/**
	 * 注册 /theme。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/theme',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * 返回主题配置：{ presetId, custom? }（custom 已由 Sutwx_Settings 清洗）。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array
	 */
	public function get_item( $request ) {
		$config = Sutwx_Settings::get_theme_config();
		return $this->success( $config );
	}
}
