<?php
/**
 * Banner DTO 映射（BE-008）：后台配置行 → 小程序展示结构。
 *
 * 输出：{id,title,image,url,type}；url 为 /pages/ 开头时 type=page，否则 type=web。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 映射单条 banner。
 *
 * @param array $row 后台配置行（Sutwx_Banner_Settings::sanitize_row 产物）。
 * @return array{id:string,title:string,image:string,url:string,type:string}
 */
function sutwx_map_banner( array $row ) {
	$url  = isset( $row['url'] ) ? (string) $row['url'] : '';
	$type = ( 0 === strpos( $url, '/pages/' ) ) ? 'page' : 'web';

	return array(
		'id'    => isset( $row['id'] ) ? (string) $row['id'] : '',
		'title' => isset( $row['title'] ) ? (string) $row['title'] : '',
		'image' => isset( $row['image'] ) ? (string) $row['image'] : '',
		'url'   => $url,
		'type'  => $type,
	);
}
