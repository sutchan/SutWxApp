<?php
/**
 * API 限频与防刷保护（BE-005）：按 IP + 桶计数，响应头回传 X-RateLimit-*。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 限频器。
 */
class Sutwx_Rate_Limit {

	/**
	 * 计数窗口（秒）。
	 */
	const WINDOW = 60;

	/**
	 * 公开内容端点：每分钟 120 次。
	 */
	const LIMIT_PUBLIC = 120;

	/**
	 * 鉴权/写端点：每分钟 20 次（防 code2session 爆破）。
	 */
	const LIMIT_AUTH = 20;

	/**
	 * 最近一次检查结果（供响应头与单测读取）。
	 */
	private static $last = array();

	/**
	 * 注册限频钩子（rest_pre_dispatch 早于业务逻辑，可在超限时直接拒绝）。
	 */
	public static function init() {
		if ( function_exists( 'add_filter' ) ) {
			add_filter( 'rest_pre_dispatch', array( __CLASS__, 'guard' ), 10, 3 );
		}
	}

	/**
	 * 拦截本插件命名空间下超限的请求。
	 *
	 * @param mixed            $response 已有响应（通常为 null）。
	 * @param WP_REST_Server  $server    REST 服务器。
	 * @param WP_REST_Request $request   请求对象。
	 * @return mixed 原样返回，或 WP_Error(429)。
	 */
	public static function guard( $response, $server, $request ) {
		if ( null !== $response || ! is_object( $request ) || ! method_exists( $request, 'get_route' ) ) {
			return $response;
		}

		$route = (string) $request->get_route();
		if ( 0 !== strpos( $route, '/' . SUTWX_API_REST_NS ) ) {
			return $response;
		}

		$is_auth = false !== strpos( $route, '/auth/' );
		$result  = self::check(
			$is_auth ? 'auth' : 'public',
			$is_auth ? self::LIMIT_AUTH : self::LIMIT_PUBLIC,
			self::WINDOW
		);

		self::send_headers( $result );

		if ( $result['ok'] || ! class_exists( 'WP_Error' ) ) {
			return $response;
		}

		return new WP_Error(
			'sutwx_rate_limited',
			'请求过于频繁，请稍后再试',
			array( 'status' => 429 )
		);
	}

	/**
	 * 计数检查（不产生副作用之外的 IO）。
	 *
	 * @param string $bucket 桶名（public/auth）。
	 * @param int    $limit  窗口内上限。
	 * @param int    $window 窗口秒数。
	 * @return array{ok:bool,limit:int,remaining:int,reset:int}
	 */
	public static function check( $bucket = 'public', $limit = self::LIMIT_PUBLIC, $window = self::WINDOW ) {
		$now     = time();
		$window  = max( 1, (int) $window );
		$limit   = max( 1, (int) $limit );
		$slot    = (int) floor( $now / $window );
		$reset   = ( $slot + 1 ) * $window;
		$key     = 'sutwx_rl_' . $bucket . '_' . md5( self::client_ip() ) . '_' . $slot;

		$count = self::counter( $key );
		$count++;
		self::store( $key, $count, max( 1, $reset - $now ) );

		$result = array(
			'ok'        => $count <= $limit,
			'limit'     => $limit,
			'remaining' => max( 0, $limit - $count ),
			'reset'     => $reset,
		);
		self::$last = $result;

		return $result;
	}

	/**
	 * 输出 X-RateLimit-* 响应头。
	 *
	 * @param array $result check() 的返回值。
	 */
	public static function send_headers( $result ) {
		if ( function_exists( 'headers_sent' ) && headers_sent() ) {
			return;
		}
		header( 'X-RateLimit-Limit: ' . (int) $result['limit'] );
		header( 'X-RateLimit-Remaining: ' . (int) $result['remaining'] );
		header( 'X-RateLimit-Reset: ' . (int) $result['reset'] );
	}

	/**
	 * 读取最近一次检查结果。
	 *
	 * @return array
	 */
	public static function last() {
		return self::$last;
	}

	/**
	 * 获取客户端 IP（兼容代理头，仅取首个）。
	 *
	 * @return string
	 */
	public static function client_ip() {
		$keys = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR' );
		foreach ( $keys as $key ) {
			if ( empty( $_SERVER[ $key ] ) ) {
				continue;
			}
			$value = trim( (string) $_SERVER[ $key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			if ( '' === $value ) {
				continue;
			}
			if ( 'HTTP_X_FORWARDED_FOR' === $key && false !== strpos( $value, ',' ) ) {
				$value = trim( explode( ',', $value )[0] );
			}
			if ( function_exists( 'inet_pton' ) && false === inet_pton( $value ) ) {
				continue;
			}
			return $value;
		}
		return 'unknown';
	}

	/**
	 * 读取计数器。
	 *
	 * @param string $key 计数键。
	 * @return int
	 */
	private static function counter( $key ) {
		if ( function_exists( 'get_transient' ) ) {
			return (int) get_transient( $key );
		}
		return isset( $GLOBALS['sutwx_rate_limit'][ $key ] ) ? (int) $GLOBALS['sutwx_rate_limit'][ $key ] : 0;
	}

	/**
	 * 写入计数器。
	 *
	 * @param string $key  计数键。
	 * @param int    $count 计数值。
	 * @param int    $ttl  剩余窗口秒数。
	 */
	private static function store( $key, $count, $ttl ) {
		if ( function_exists( 'set_transient' ) ) {
			set_transient( $key, $count, $ttl );
			return;
		}
		if ( ! isset( $GLOBALS['sutwx_rate_limit'] ) || ! is_array( $GLOBALS['sutwx_rate_limit'] ) ) {
			$GLOBALS['sutwx_rate_limit'] = array();
		}
		$GLOBALS['sutwx_rate_limit'][ $key ] = $count;
	}
}
