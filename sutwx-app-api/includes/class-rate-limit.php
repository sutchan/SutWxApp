<?php
/**
 * API 限频与防刷保护（BE-005）：按 IP + 桶计数，响应头回传 X-RateLimit-*。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! trait_exists( 'Sutwx_Rate_Limit_Ip' ) ) {
	// 用 __DIR__ 而非插件常量：独立单测可能未定义 SUTWX_API_DIR。
	require_once __DIR__ . '/rate-limit/class-rate-limit-ip.php';
}

/**
 * 限频器。
 */
class Sutwx_Rate_Limit {

	use Sutwx_Rate_Limit_Ip;

	/**
	 * 计数窗口（秒）。
	 */
	const WINDOW = 60;

	/**
	 * 公开内容端点：每分钟 60 次（SEC-001 生产分档）。
	 */
	const LIMIT_PUBLIC = 60;

	/**
	 * 鉴权/写端点：每分钟 30 次（防 code2session 爆破）。
	 */
	const LIMIT_AUTH = 30;

	/**
	 * 支付端点：每分钟 10 次。
	 */
	const LIMIT_PAY = 10;

	/**
	 * 监控上报端点：每分钟 10 次。
	 */
	const LIMIT_MONITOR = 10;

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

		// SEC-001：按端点分档（支付/监控/鉴权更严格，公开内容宽松）。
		// /pay/notify 为微信支付服务端回调，回调 IP 集中，不做限频以免误伤支付通知。
		if ( '/pay/notify' === substr( $route, -strlen( '/pay/notify' ) ) ) {
			return $response;
		}

		if ( false !== strpos( $route, '/pay' ) ) {
			$bucket = 'pay';
			$limit  = self::LIMIT_PAY;
		} elseif ( false !== strpos( $route, '/monitor/' ) ) {
			$bucket = 'monitor';
			$limit  = self::LIMIT_MONITOR;
		} elseif ( false !== strpos( $route, '/auth/' ) ) {
			$bucket = 'auth';
			$limit  = self::LIMIT_AUTH;
		} else {
			$bucket = 'public';
			$limit  = self::LIMIT_PUBLIC;
		}

		$result = self::check( $bucket, $limit, self::WINDOW );

		self::send_headers( $result );

		if ( $result['ok'] || ! class_exists( 'WP_Error' ) ) {
			return $response;
		}

		// 429 统一 {code,message,data.status} 包络（与小程序 unwrap 错误分支一致）。
		if ( class_exists( 'Sutwx_Error_Log' ) ) {
			Sutwx_Error_Log::log(
				'rate_limited',
				array(
					'route' => $route,
					'code'  => 'sutwx_rate_limited',
					'status' => 429,
					'ip'    => self::client_ip(),
				)
			);
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

		$count = self::increment( $key, max( 1, $reset - $now ) );

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
	 * 自增计数器：存在持久对象缓存时用原子 incr（并发安全），
	 * 否则退回 transient 读改写（默认 WP 对象缓存不跨请求持久，不能替代 transient）。
	 *
	 * @param string $key 计数键。
	 * @param int    $ttl 剩余窗口秒数。
	 * @return int 自增后的计数值。
	 */
	private static function increment( $key, $ttl ) {
		$has_persistent_cache = function_exists( 'wp_using_ext_object_cache' )
			&& function_exists( 'wp_cache_add' )
			&& function_exists( 'wp_cache_incr' )
			&& wp_using_ext_object_cache();

		if ( $has_persistent_cache ) {
			wp_cache_add( $key, 0, 'sutwx_rate_limit', max( 1, (int) $ttl ) );
			$count = wp_cache_incr( $key, 1, 'sutwx_rate_limit' );
			if ( false !== $count ) {
				return (int) $count;
			}
		}

		$count = self::counter( $key ) + 1;
		self::store( $key, $count, $ttl );
		return $count;
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
