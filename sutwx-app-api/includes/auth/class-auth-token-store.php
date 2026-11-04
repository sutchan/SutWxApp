<?php
/**
 * 鉴权服务的「Token 黑名单」职责（自 class-auth-service.php 拆出）。
 * 通过 trait 合并进 Sutwx_Auth_Service，调用方式与私有方法保持完全一致。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * jti 黑名单与声明读取。
 */
trait Sutwx_Auth_Token_Store {

	/**
	 * 吊销 token（登出）：按 jti 写入黑名单至过期时间。
	 *
	 * @param array $payload 已校验的 token 声明。
	 * @return bool
	 */
	public static function revoke( $payload ) {
		$jti = (string) self::claim( $payload, 'jti' );
		$exp = (int) self::claim( $payload, 'exp' );
		if ( '' === $jti || $exp <= time() ) {
			return false;
		}
		return self::store_blacklist( $jti, $exp );
	}

	/**
	 * 判断 jti 是否已吊销。
	 *
	 * @param string $jti token id。
	 * @return bool
	 */
	public static function is_revoked( $jti ) {
		if ( '' === (string) $jti ) {
			return false;
		}
		if ( function_exists( 'get_transient' ) ) {
			return (bool) get_transient( 'sutwx_jti_' . md5( $jti ) );
		}
		return false;
	}

	/**
	 * 安全地取声明值。
	 *
	 * @param array  $payload 声明数组。
	 * @param string $key     键名。
	 * @return mixed
	 */
	private static function claim( $payload, $key ) {
		return is_array( $payload ) && isset( $payload[ $key ] ) ? $payload[ $key ] : '';
	}

	/**
	 * 写入 jti 黑名单。
	 *
	 * @param string $jti token id。
	 * @param int    $exp 过期时间戳。
	 * @return bool
	 */
	private static function store_blacklist( $jti, $exp ) {
		if ( ! function_exists( 'set_transient' ) ) {
			return false;
		}
		return set_transient( 'sutwx_jti_' . md5( $jti ), 1, max( 1, $exp - time() ) );
	}
}
