<?php
/**
 * WP 文章 → 小程序文章 DTO。
 * 字段契约：openspec/specs/backend/spec.md 与 SutWxApp/models/post.js（mapWpPost）。
 * 正文服务端经 wp_kses_post 基础清洗；小程序侧 sanitizeArticleHtml 二次把关。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'sutwx_map_post' ) ) {
	/**
	 * 单个 WP 文章 → 文章 DTO（非发布文章或无效输入返回 null）。
	 *
	 * @param WP_Post|int|string $post 文章对象或 ID。
	 * @return array|null
	 */
	function sutwx_map_post( $post ) {
		if ( is_int( $post ) || is_string( $post ) ) {
			$post = function_exists( 'get_post' ) ? get_post( (int) $post ) : null;
		}
		if ( ! is_object( $post ) || empty( $post->ID ) ) {
			return null;
		}
		if ( isset( $post->post_type ) && 'post' !== $post->post_type ) {
			return null;
		}
		if ( isset( $post->post_status ) && 'publish' !== $post->post_status ) {
			return null;
		}

		$title   = sutwx_strip_text( $post->post_title );
		$content = function_exists( 'wp_kses_post' )
			? wp_kses_post( $post->post_content )
			: (string) $post->post_content;
		$excerpt = sutwx_excerpt(
			'' !== trim( (string) $post->post_excerpt ) ? $post->post_excerpt : $post->post_content,
			60
		);

		// 特色图（_thumbnail_id → 附件 URL）。
		$cover = '';
		if ( function_exists( 'get_post_meta' ) ) {
			$thumb_id = (int) get_post_meta( $post->ID, '_thumbnail_id', true );
			$cover    = sutwx_attachment_url( $thumb_id );
		}

		// 分类：取第一个（小程序取 categories[0]）。
		$category = 0;
		if ( function_exists( 'wp_get_post_categories' ) ) {
			$cats = wp_get_post_categories( $post->ID );
			if ( is_array( $cats ) && $cats ) {
				$category = (int) $cats[0];
			}
		}

		// 作者：优先显示名，测试环境回退 ID。
		$author = isset( $post->post_author ) ? (int) $post->post_author : 0;
		if ( $author > 0 && function_exists( 'get_the_author_meta' ) ) {
			$author = get_the_author_meta( 'display_name', $author );
		}

		return array(
			'id'       => (int) $post->ID,
			'title'    => $title,
			'content'  => $content,
			'excerpt'  => $excerpt,
			'cover'    => $cover,
			'date'     => isset( $post->post_date ) ? substr( (string) $post->post_date, 0, 10 ) : '',
			'link'     => function_exists( 'get_permalink' ) ? (string) get_permalink( $post->ID ) : '',
			'author'   => $author,
			'category' => $category,
		);
	}
}

if ( ! function_exists( 'sutwx_map_posts' ) ) {
	/**
	 * 批量映射（过滤无效项）。
	 *
	 * @param array $posts WP_Post 数组。
	 * @return array
	 */
	function sutwx_map_posts( $posts ) {
		if ( ! is_array( $posts ) ) {
			return array();
		}
		$mapped = array();
		foreach ( $posts as $post ) {
			$item = sutwx_map_post( $post );
			if ( $item ) {
				$mapped[] = $item;
			}
		}
		return $mapped;
	}
}
