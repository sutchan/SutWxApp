<?php
/**
 * REST 层结构化错误日志（BE-010）。
 *
 * 单行 JSON 落盘（error_log），字段：时间、事件、路由、错误码、HTTP 状态、脱敏 IP、耗时。
 * 可通过 option `sutwx_error_log_enabled` 开关（默认开）；
 * 鉴权失败 / 限频命中 / 支付异常三类事件必记，不受开关影响。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 结构化错误日志。
 */
class Sutwx_Error_Log {

	/**
	 * 开关 option 键。
	 */
	const OPTION = 'sutwx_error_log_enabled';

	/**
	 * 单条日志最大字节数（防超长上下文刷爆日志）。
	 */
	const MAX_BYTES = 2048;

	/**
	 * 必记事件（不受开关影响）。
	 */
	const ALWAYS = array( 'auth_failed', 'rate_limited', 'pay_exception' );

	/**
	 * 记录一条结构化日志。
	 *
	 * @param string $event   事件名（auth_failed / rate_limited / pay_exception / monitor / rest_error ...）。
	 * @param array  $context 上下文（code/status/durationMs/ip/...）。
	 * @return bool 是否写入。
	 */
	public static function log( $event, array $context = array() ) {
		$event = (string) $event;
		if ( '' === $event ) {
			return false;
		}

		$always = in_array( $event, self::ALWAYS, true );
		if ( ! $always && ! self::enabled() ) {
			return false;
		}

		$record = array(
			'ts'    => gmdate( 'c' ),
			'event' => $event,
			'route' => isset( $context['route'] ) ? (string) $context['route'] : self::current_route(),
		);
		foreach ( array( 'code', 'status', 'durationMs', 'orderId', 'openid', 'sessionId', 'page' ) as $key ) {
			if ( isset( $context[ $key ] ) && '' !== $context[ $key ] ) {
				$record[ $key ] = $context[ $key ];
			}
		}
		if ( isset( $context['ip'] ) ) {
			$record['ip'] = self::anonymize_ip( (string) $context['ip'] );
		}
		if ( isset( $context['detail'] ) ) {
			$record['detail'] = self::truncate( wp_json_encode_safe( $context['detail'] ) );
		}

		$line = wp_json_encode_safe( $record );
		if ( '' === $line ) {
			return false;
		}
		// 结构化日志唯一落盘通道。
		return false !== error_log( '[sutwx] ' . $line );
	}

	/**
	 * 日志开关（默认开）。
	 *
	 * @return bool
	 */
	public static function enabled() {
		if ( ! function_exists( 'get_option' ) ) {
			return true;
		}
		return (string) get_option( self::OPTION, '1' ) !== '0';
	}

	/**
	 * 写入开关状态。
	 *
	 * @param bool $enabled 是否启用。
	 * @return bool
	 */
	public static function set_enabled( $enabled ) {
		if ( ! function_exists( 'update_option' ) ) {
			$GLOBALS['sutwx_options'][ self::OPTION ] = $enabled ? '1' : '0';
			return true;
		}
		return update_option( self::OPTION, $enabled ? '1' : '0' );
	}

	/**
	 * IP 脱敏：IPv4 去末段，IPv6 取前 4 组（保留网段即可定位，不存完整地址）。
	 *
	 * @param string $ip 原始 IP。
	 * @return string
	 */
	public static function anonymize_ip( $ip ) {
		$ip = trim( (string) $ip );
		if ( false !== strpos( $ip, ':' ) ) {
			$groups = explode( ':', $ip );
			return implode( ':', array_slice( $groups, 0, 4 ) ) . ':*';
		}
		$parts = explode( '.', $ip );
		if ( 4 === count( $parts ) ) {
			return $parts[0] . '.' . $parts[1] . '.' . $parts[2] . '.*';
		}
		return 'unknown';
	}

	/**
	 * 截断超长字段。
	 *
	 * @param string $value 原文。
	 * @return string
	 */
	public static function truncate( $value ) {
		$value = (string) $value;
		if ( strlen( $value ) <= self::MAX_BYTES ) {
			return $value;
		}
		return substr( $value, 0, self::MAX_BYTES );
	}

	/**
	 * 当前请求路由（REQUEST_URI 去查询串；取不到返回空串）。
	 *
	 * @return string
	 */
	public static function current_route() {
		if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
			return '';
		}
		$uri = (string) $_SERVER['REQUEST_URI'];
		$pos = strpos( $uri, '?' );
		return false === $pos ? $uri : substr( $uri, 0, $pos );
	}
}
