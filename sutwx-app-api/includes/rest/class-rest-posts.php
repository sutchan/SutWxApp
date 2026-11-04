<?php
/**
 * /api/post/* 路由：WP 文章 → 文章 DTO（P1 实现）。
 *
 * @package SutwxAppApi
 * @version 0.5.3
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
		$keyword = $this->normalize_keyword( $request );

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

		// 搜索请求缓存键无限扩张：带关键词时用短 TTL，避免灌爆 transient 表。
		$cache_ttl = '' !== $keyword ? 60 : Sutwx_Cache::TTL;

		$payload = Sutwx_Cache::remember(
			'post',
			array(
				'page'     => $paging['page'],
				'pageSize' => $paging['pageSize'],
				'keyword'  => $keyword,
			),
			function () use ( $query_args ) {
				$query = new WP_Query( $query_args );

				return array(
					'list'     => sutwx_map_posts( $query->posts ),
					'total'    => (int) $query->found_posts,
					'page'     => (int) $query_args['paged'],
					'pageSize' => (int) $query_args['posts_per_page'],
				);
			},
			$cache_ttl
		);

		return $this->success( $payload );
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

		$mapped = Sutwx_Cache::remember(
			'post',
			array( 'detail' => $id ),
			function () use ( $id ) {
				$post = get_post( $id );
				return $post ? sutwx_map_post( $post ) : null;
			},
			Sutwx_Cache::TTL_DETAIL
		);

		if ( ! $mapped ) {
			return $this->error( __( '文章不存在或未发布', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		return $this->success( $mapped );
	}
}
