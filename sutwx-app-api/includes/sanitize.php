<?php
/**
 * 字段净化辅助：文本去标签、摘要截断、附件 URL 解析。
 * （颜色校验器于 P2 主题设置页阶段补充）
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'sutwx_strip_text' ) ) {
	/**
	 * 去除 HTML 标签并修剪空白（测试环境无 WP 时回退正则）。
	 *
	 * @param string $text 原始文本。
	 * @return string
	 */
	function sutwx_strip_text( $text ) {
		$text = (string) $text;
		if ( function_exists( 'wp_strip_all_tags' ) ) {
			return wp_strip_all_tags( $text );
		}
		return trim( preg_replace( '/<[^>]*>/', '', $text ) );
	}
}

if ( ! function_exists( 'sutwx_excerpt' ) ) {
	/**
	 * 截取纯文本摘要（与小程序 models/post.js 的 60 字截断对齐）。
	 *
	 * @param string $text   原始文本。
	 * @param int    $length 最大长度。
	 * @return string
	 */
	function sutwx_excerpt( $text, $length = 60 ) {
		$text = sutwx_strip_text( $text );
		if ( function_exists( 'mb_substr' ) ) {
			return mb_substr( $text, 0, $length, 'UTF-8' );
		}
		return substr( $text, 0, $length );
	}
}

if ( ! function_exists( 'sutwx_attachment_url' ) ) {
	/**
	 * 附件 ID → URL（无效 ID 返回空串）。
	 *
	 * @param int $attachment_id 附件 ID。
	 * @return string
	 */
	function sutwx_attachment_url( $attachment_id ) {
		$id = (int) $attachment_id;
		if ( $id <= 0 ) {
			return '';
		}
		if ( function_exists( 'wp_get_attachment_url' ) ) {
			$url = wp_get_attachment_url( $id );
			return is_string( $url ) ? $url : '';
		}
		return '';
	}

	if ( ! function_exists( 'sutwx_is_valid_color' ) ) {
		/**
		 * 校验十六进制颜色字符串（#RGB 或 #RRGGBB）。
		 *
		 * @param string $value 颜色值。
		 * @return bool
		 */
		function sutwx_is_valid_color( $value ) {
			return is_string( $value )
				&& preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', trim( $value ) ) === 1;
		}
	}

	if ( ! function_exists( 'sutwx_sanitize_color' ) ) {
		/**
		 * 标准化颜色：合法返回小写十六进制，非法返回 null。
		 *
		 * @param string $value 颜色值。
		 * @return string|null
		 */
		function sutwx_sanitize_color( $value ) {
			if ( ! is_string( $value ) ) {
				return null;
			}
			$value = trim( $value );
			if ( ! sutwx_is_valid_color( $value ) ) {
				return null;
			}
			return strtolower( $value );
		}
	}
}
