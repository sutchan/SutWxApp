<?php
/**
 * WC 商品分类（product_cat）→ 小程序分类 DTO。
 * 字段契约：openspec/specs/backend/spec.md 与 SutWxApp/models/category.js（mapWooCommerceCategory）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'sutwx_map_category' ) ) {
	/**
	 * 单个分类 → 分类 DTO（无效输入返回 null）。
	 *
	 * @param WP_Term $term 分类项。
	 * @return array|null
	 */
	function sutwx_map_category( $term ) {
		if ( ! is_object( $term ) || empty( $term->term_id ) ) {
			return null;
		}
		if ( isset( $term->taxonomy ) && 'product_cat' !== $term->taxonomy ) {
			return null;
		}

		// 图标：WC 分类缩略图（thumbnail_id 元数据）。
		$icon = '';
		if ( function_exists( 'get_term_meta' ) ) {
			$thumb_id = (int) get_term_meta( $term->term_id, 'thumbnail_id', true );
			$icon     = sutwx_attachment_url( $thumb_id );
		}

		$permalink = '';
		if ( function_exists( 'get_term_link' ) ) {
			$link = get_term_link( $term );
			$permalink = is_wp_error( $link ) ? '' : (string) $link;
		}

		return array(
			'id'          => (int) $term->term_id,
			'name'        => isset( $term->name ) ? (string) $term->name : '',
			'icon'        => $icon,
			'count'       => isset( $term->count ) ? (int) $term->count : 0,
			'description' => sutwx_strip_text( isset( $term->description ) ? $term->description : '' ),
			'parentId'    => isset( $term->parent ) ? (int) $term->parent : 0,
			'slug'        => isset( $term->slug ) ? (string) $term->slug : '',
			'permalink'   => $permalink,
		);
	}
}

if ( ! function_exists( 'sutwx_map_categories' ) ) {
	/**
	 * 批量映射（过滤无效项）。
	 *
	 * @param array $terms WP_Term 数组。
	 * @return array
	 */
	function sutwx_map_categories( $terms ) {
		if ( ! is_array( $terms ) ) {
			return array();
		}
		$mapped = array();
		foreach ( $terms as $term ) {
			$item = sutwx_map_category( $term );
			if ( $item ) {
				$mapped[] = $item;
			}
		}
		return $mapped;
	}
}
