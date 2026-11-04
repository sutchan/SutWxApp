<?php
/**
 * 限频的客户端 IP 解析（自 class-rate-limit.php 拆出）。
 * 通过 trait 合并进 Sutwx_Rate_Limit，调用方式保持不变。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * 客户端 IP 与可信代理解析。
 */
trait Sutwx_Rate_Limit_Ip {

	/**
	 * 获取客户端 IP。
	 *
	 * 安全：X-Forwarded-For / CF-Connecting-IP 等代理头可被客户端任意伪造，
	 * 仅当 REMOTE_ADDR 命中可信代理白名单时才解析，否则一律使用 REMOTE_ADDR。
	 * 白名单可通过 wp-config 常量 SUTWX_TRUSTED_PROXIES（逗号分隔）配置。
	 *
	 * @return string
	 */
	public static function client_ip() {
		$remote = isset( $_SERVER['REMOTE_ADDR'] )
			? trim( (string) $_SERVER['REMOTE_ADDR'] ) // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			: '';
		$proxy  = '';

		$trusted = self::trusted_proxies();
		if ( '' !== $remote && in_array( $remote, $trusted, true ) ) {
			$keys = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP' );
			foreach ( $keys as $key ) {
				if ( empty( $_SERVER[ $key ] ) ) {
					continue;
				}
				$value = trim( (string) $_SERVER[ $key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
				if ( 'HTTP_X_FORWARDED_FOR' === $key && false !== strpos( $value, ',' ) ) {
					$value = trim( explode( ',', $value )[0] );
				}
				if ( '' !== $value && ( ! function_exists( 'inet_pton' ) || false !== inet_pton( $value ) ) ) {
					$proxy = $value;
					break;
				}
			}
		}

		$ip = '' !== $proxy ? $proxy : $remote;
		return '' !== $ip ? $ip : 'unknown';
	}

	/**
	 * 可信代理白名单（仅常量配置，不接受请求头自证）。
	 *
	 * @return array
	 */
	private static function trusted_proxies() {
		$raw = defined( 'SUTWX_TRUSTED_PROXIES' ) ? (string) SUTWX_TRUSTED_PROXIES : '';
		if ( '' === $raw ) {
			return array();
		}
		return array_filter( array_map( 'trim', explode( ',', $raw ) ), 'strlen' );
	}
}
