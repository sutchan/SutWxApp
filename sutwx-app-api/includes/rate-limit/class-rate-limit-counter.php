<?php
/**
 * 限频计数器读写（自 class-rate-limit.php 拆出）。
 * 通过 trait 合并进 Sutwx_Rate_Limit，调用方式保持不变。
 *
 * @package SutwxAppApi
 * @version 0.7.1
 */

defined( 'ABSPATH' ) || exit;

/**
 * 计数器：优先持久化对象缓存的原子自增，否则退回 transient 读改写。
 */
trait Sutwx_Rate_Limit_Counter {

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
	 * @param string $key   计数键。
	 * @param int    $count 计数值。
	 * @param int    $ttl   剩余窗口秒数。
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
