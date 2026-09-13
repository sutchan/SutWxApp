<?php
/**
 * /api/theme 路由：读取后台主题配置返回（P0 已可用，P2 补后台设置页）。
 *
 * @package SutwxAppApi
 * @version 0.1.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 主题路由控制器。
 */
class Sutwx_Rest_Theme extends Sutwx_Rest_Base {

	/**
	 * 默认预设（与小程序 models/theme.js 的 THEME_PRESETS 对齐）。
	 */
	const DEFAULT_PRESET = 'sut-green';

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
	 * 返回主题配置：{ presetId, custom? }。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array
	 */
	public function get_item( $request ) {
		$option = get_option( SUTWX_API_THEME_OPTION, array() );

		$preset_id = isset( $option['presetId'] ) && is_string( $option['presetId'] )
			? $option['presetId']
			: self::DEFAULT_PRESET;

		$data = array( 'presetId' => $preset_id );

		// 自定义色按字段覆盖（P2 在设置页做 sanitize 后写入，此处原样透出）。
		if ( isset( $option['custom'] ) && is_array( $option['custom'] ) && ! empty( $option['custom'] ) ) {
			$data['custom'] = $option['custom'];
		}

		return $this->success( $data );
	}
}
