<?php
/**
 * /api/category/* 路由：WC product_cat → 分类 DTO（P1 实现）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 分类路由控制器。
 */
class Sutwx_Rest_Categories extends Sutwx_Rest_Base {

	/**
	 * 注册 /category/list 与 /category/detail。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/category/list',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list_items' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'parentId' => array( 'sanitize_callback' => 'absint' ),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/category/detail',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'detail' ),
				'permission_callback' => '__return_true',
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
	 * 分类列表：get_terms(product_cat) → DTO。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array|WP_Error
	 */
	public function list_items( $request ) {
		$parentId = (int) $request->get_param( 'parentId' );

		$args = array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'orderby'    => 'menu_order',
			'order'      => 'ASC',
		);
		if ( $parentId > 0 ) {
			$args['parent'] = $parentId;
		}

		$payload = Sutwx_Cache::remember(
			'category',
			array( 'parentId' => $parentId ),
			function () use ( $args ) {
				$terms = get_terms( $args );
				if ( is_wp_error( $terms ) ) {
					return null;
				}
				$items = sutwx_map_categories( $terms );

				return array(
					'list'     => $items,
					'total'    => count( $items ),
					'page'     => 1,
					'pageSize' => 50,
				);
			},
			Sutwx_Cache::TTL
		);

		if ( null === $payload ) {
			return $this->error( __( '分类读取失败', 'sutwx-app-api' ), 500, 'sutwx_terms_error' );
		}

		return $this->success( $payload );
	}

	/**
	 * 分类详情：单个 DTO。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array|WP_Error
	 */
	public function detail( $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return $this->error( __( '分类 ID 无效', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
		}

		$term = get_term( $id );
		if ( ! $term || is_wp_error( $term ) || 'product_cat' !== $term->taxonomy ) {
			return $this->error( __( '分类不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		$mapped = Sutwx_Cache::remember(
			'category',
			array( 'detail' => $id ),
			function () use ( $term ) {
				return sutwx_map_category( $term );
			},
			Sutwx_Cache::TTL_DETAIL
		);

		if ( ! $mapped ) {
			return $this->error( __( '分类数据映射失败', 'sutwx-app-api' ), 500, 'sutwx_map_failed' );
		}

		return $this->success( $mapped );
	}
}
