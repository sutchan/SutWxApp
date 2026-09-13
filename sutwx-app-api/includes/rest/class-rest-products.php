<?php
/**
 * /api/product/* 路由：WC 商品 → 商品 DTO（P1 实现）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 商品路由控制器。
 */
class Sutwx_Rest_Products extends Sutwx_Rest_Base {

	/**
	 * 注册 /product/list 与 /product/detail。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/product/list',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list_items' ),
				'permission_callback' => '__return_true', // v1 内容端点免鉴权。
				'args'                => array(
					'page'       => array( 'sanitize_callback' => 'absint' ),
					'pageSize'   => array( 'sanitize_callback' => 'absint' ),
					'categoryId' => array( 'sanitize_callback' => 'absint' ),
					'keyword'    => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/product/detail',
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
	 * 商品列表：WP_Query 查 product → wc_get_product → DTO。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array
	 */
	public function list_items( $request ) {
		$paging     = $this->get_paging_args( $request );
		$keyword    = (string) ( $request->get_param( 'keyword' ) ? $request->get_param( 'keyword' ) : '' );
		$categoryId = (int) $request->get_param( 'categoryId' );

		$query_args = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => $paging['pageSize'],
			'paged'          => $paging['page'],
			'fields'         => 'ids',
			'orderby'        => 'date',
			'order'          => 'DESC',
		);
		if ( '' !== $keyword ) {
			$query_args['s'] = $keyword;
		}
		if ( $categoryId > 0 ) {
			$query_args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy' => 'product_cat',
					'field'    => 'term_id',
					'terms'    => $categoryId,
				),
			);
		}

		$query = new WP_Query( $query_args );
		$items = array();
		foreach ( $query->posts as $product_id ) {
			$product = function_exists( 'wc_get_product' ) ? wc_get_product( (int) $product_id ) : null;
			if ( ! $product ) {
				continue;
			}
			$mapped = sutwx_map_product( $product );
			if ( $mapped ) {
				$items[] = $mapped;
			}
		}

		return $this->success(
			array(
				'list'     => $items,
				'total'    => (int) $query->found_posts,
				'page'     => $paging['page'],
				'pageSize' => $paging['pageSize'],
			)
		);
	}

	/**
	 * 商品详情：单个 DTO（data 即对象）。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array|WP_Error
	 */
	public function detail( $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return $this->error( __( '商品 ID 无效', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
		}

		$product = function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : null;
		if ( ! $product || ! $product->get_id() || 'publish' !== $product->get_status() ) {
			return $this->error( __( '商品不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		$mapped = sutwx_map_product( $product );
		if ( ! $mapped ) {
			return $this->error( __( '商品数据映射失败', 'sutwx-app-api' ), 500, 'sutwx_map_failed' );
		}

		return $this->success( $mapped );
	}
}
