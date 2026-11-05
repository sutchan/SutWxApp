<?php
/**
 * 轮播 Banner 配置管理（BE-008）：option 读写与字段校验。
 *
 * 存储结构：option `sutwx_banners` = 数组，每项 {id,title,image,url,sort,enabled}。
 * 后台「设置 → 小程序设置 → 轮播管理」维护；保存后 bump `banner` 缓存分组。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

require_once SUTWX_API_DIR . 'includes/sanitize.php';

/**
 * Banner 配置。
 */
class Sutwx_Banner_Settings {

	/**
	 * option 键名。
	 */
	const OPTION = 'sutwx_banners';

	/**
	 * 最多条数。
	 */
	const MAX_ITEMS = 10;

	/**
	 * 读取清洗后的 banner 列表（仅 enabled，按 sort 升序）。
	 *
	 * @return array[]
	 */
	public static function get_enabled() {
		$rows = self::all();
		$out  = array();
		foreach ( $rows as $row ) {
			if ( ! empty( $row['enabled'] ) ) {
				$out[] = $row;
			}
		}
		usort(
			$out,
			static function ( $a, $b ) {
				return (int) $a['sort'] - (int) $b['sort'];
			}
		);
		return $out;
	}

	/**
	 * 读取全部原始配置（后台编辑用）。
	 *
	 * @return array[]
	 */
	public static function all() {
		$rows = get_option( self::OPTION, array() );
		return is_array( $rows ) ? array_values( $rows ) : array();
	}

	/**
	 * 清洗单条 banner（id/title/image/url/sort/enabled 白名单）。
	 *
	 * @param array $raw 原始行。
	 * @return array
	 */
	public static function sanitize_row( $raw ) {
		$raw = is_array( $raw ) ? $raw : array();

		$id    = self::bounded_text( isset( $raw['id'] ) ? $raw['id'] : '', 32 );
		$title = self::bounded_text( isset( $raw['title'] ) ? $raw['title'] : '', 64 );
		$image = self::bounded_text( isset( $raw['image'] ) ? $raw['image'] : '', 500 );
		$url   = self::bounded_text( isset( $raw['url'] ) ? $raw['url'] : '', 500 );
		$sort  = isset( $raw['sort'] ) ? max( 0, (int) $raw['sort'] ) : 0;

		if ( '' === $id ) {
			$id = 'banner-' . substr( md5( $title . $image . $url . wp_json_encode_safe( $sort ) ), 0, 8 );
		}

		return array(
			'id'      => $id,
			'title'   => $title,
			'image'   => '' !== $image && self::is_url( $image ) ? $image : '',
			'url'     => '' !== $url && self::is_url( $url ) ? $url : '',
			'sort'    => $sort,
			'enabled' => ! empty( $raw['enabled'] ),
		);
	}

	/**
	 * 清洗并写入整份配置（最多 MAX_ITEMS 条；自动剔除 image 为空的行）。
	 *
	 * @param array $rows 原始行数组。
	 * @return bool
	 */
	public static function update_all( $rows ) {
		$clean = array();
		foreach ( (array) $rows as $row ) {
			$item = self::sanitize_row( $row );
			if ( '' === $item['image'] ) {
				continue;
			}
			$clean[] = $item;
			if ( count( $clean ) >= self::MAX_ITEMS ) {
				break;
			}
		}

		$saved = update_option( self::OPTION, $clean );
		if ( class_exists( 'Sutwx_Cache' ) ) {
			Sutwx_Cache::bump( 'banner' );
		}
		return $saved;
	}

	/**
	 * 是否合法 URL（https 绝对地址或小程序页内路径 /pages/...）。
	 *
	 * @param string $value 待校验值。
	 * @return bool
	 */
	public static function is_url( $value ) {
		if ( 0 === strpos( $value, '/pages/' ) ) {
			return true;
		}
		return (bool) preg_match( '#^https://[^\s]+$#i', $value );
	}

	/**
	 * 截断文本。
	 *
	 * @param mixed $value  原文。
	 * @param int   $maxlen 最大长度。
	 * @return string
	 */
	private static function bounded_text( $value, $maxlen ) {
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';
		return function_exists( 'mb_substr' )
			? mb_substr( $value, 0, $maxlen, 'UTF-8' )
			: substr( $value, 0, $maxlen );
	}
}

