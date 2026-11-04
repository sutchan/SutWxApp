<?php
/**
 * 鉴权服务的「用户 meta 与文本工具」职责（自 class-auth-user-profile.php 拆出）。
 * 通过 trait 合并进 Sutwx_Auth_Service，调用方式与私有方法保持完全一致。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * 用户 meta 读取、文本清洗与随机字节。
 */
trait Sutwx_Auth_User_Meta {

	/**
	 * 读取用户 openid。
	 *
	 * @param int $user_id 用户 ID。
	 * @return string
	 */
	private static function get_openid( $user_id ) {
		return function_exists( 'get_user_meta' )
			? (string) get_user_meta( $user_id, self::OPENID_META, true )
			: '';
	}

	/**
	 * 读取数值型用户 meta。
	 *
	 * @param int    $user_id 用户 ID。
	 * @param string $key     meta 键。
	 * @return int
	 */
	private static function get_user_number( $user_id, $key ) {
		if ( ! function_exists( 'get_user_meta' ) ) {
			return 0;
		}
		return (int) get_user_meta( $user_id, $key, true );
	}

	/**
	 * 读取文本型用户 meta。
	 *
	 * @param int    $user_id 用户 ID。
	 * @param string $key     meta 键。
	 * @return string
	 */
	private static function get_user_text( $user_id, $key ) {
		if ( ! function_exists( 'get_user_meta' ) ) {
			return '';
		}
		return (string) get_user_meta( $user_id, $key, true );
	}

	/**
	 * 文本清洗（兼容无 WP 环境）。
	 *
	 * @param mixed $value 原值。
	 * @return string
	 */
	private static function sanitize( $value ) {
		if ( function_exists( 'sanitize_text_field' ) ) {
			return sanitize_text_field( (string) $value );
		}
		return trim( strip_tags( (string) $value ) );
	}

	/**
	 * 随机字节（仅用于生成初始密码）。
	 *
	 * @param int $length 长度。
	 * @return string
	 */
	private static function random( $length ) {
		if ( ! function_exists( 'random_bytes' ) ) {
			throw new RuntimeException( 'CSPRNG unavailable: cannot create user password' );
		}
		try {
			return random_bytes( $length );
		} catch ( Exception $e ) {
			throw new RuntimeException( 'CSPRNG failed: cannot create user password', 0, $e );
		}
	}
}
