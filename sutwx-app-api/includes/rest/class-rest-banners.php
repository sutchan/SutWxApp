<?php
/**
 * /api/banner/list 运营端点（BE-008）：返回后台配置的启用轮播。
 *
 * 公开免鉴权；banner 分组缓存（后台保存即失效）；空配置返回空列表包络。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Banner_Settings' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-banner-settings.php';
}
if ( ! function_exists( 'sutwx_map_banner' ) ) {
	require_once SUTWX_API_DIR . 'includes/mappings/map-banner.php';
}

/**
 * Banner 路由控制器。
 */
class Sutwx_Rest_Banners extends Sutwx_Rest_Base {

	/**
	 * 注册 /banner/list。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/banner/list',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * 返回 {list,total,page,pageSize} 列表包络（单页全量，最多 10 条）。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array
	 */
	public function get_items( $request ) {
		$paging = $this->get_paging_args( $request );

		$rows = Sutwx_Cache::remember(
			'banner',
			array( 'enabled' => 1 ),
			static function () {
				return Sutwx_Banner_Settings::get_enabled();
			},
			Sutwx_Cache::TTL
		);

		$list = array_map( 'sutwx_map_banner', is_array( $rows ) ? $rows : array() );

		return array(
			'code'      => 200,
			'message'   => 'success',
			'data'      => array(
				'list'     => $list,
				'total'    => count( $list ),
				'page'     => $paging['page'],
				'pageSize' => $paging['pageSize'],
			),
			'timestamp' => (int) round( microtime( true ) * 1000 ),
			'requestId' => wp_generate_uuid4(),
		);
	}
}
