<?php
/**
 * /api/post/* 路由：WP 文章 → 文章 DTO（P1 实现）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 文章路由控制器。
 */
class Sutwx_Rest_Posts extends Sutwx_Rest_Base {

	/**
	 * 注册 /post/list 与 /post/detail。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/post/list',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list_items' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'page'     => array( 'sanitize_callback' => 'absint' ),
					'pageSize' => array( 'sanitize_callback' => 'absint' ),
					'keyword'  => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/post/detail',
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
	 * 文章列表：WP_Query（post）→ DTO（含特色图）。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array
	 */
	public function list_items( $request ) {
		$paging  = $this->get_paging_args( $request );
		$keyword = (string) ( $request->get_param( 'keyword' ) ? $request->get_param( 'keyword' ) : '' );

		$query_args = array(
			'post_type'           => 'post',
			'post_status'         => 'publish',
			'posts_per_page'      => $paging['pageSize'],
			'paged'               => $paging['page'],
			'ignore_sticky_posts' => true,
			'orderby'             => 'date',
			'order'               => 'DESC',
		);
		if ( '' !== $keyword ) {
			$query_args['s'] = $keyword;
		}

		$query = new WP_Query( $query_args );
		$items = sutwx_map_posts( $query->posts );

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
	 * 文章详情：单个 DTO。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array|WP_Error
	 */
	public function detail( $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return $this->error( __( '文章 ID 无效', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
		}

		$post  = get_post( $id );
		$mapped = $post ? sutwx_map_post( $post ) : null;
		if ( ! $mapped ) {
			return $this->error( __( '文章不存在或未发布', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		return $this->success( $mapped );
	}
}
