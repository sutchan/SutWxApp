<?php
/**
 * JWT 编解码基建（自 class-jwt.php 拆出）：Base64URL、JSON、随机字节与恒定时间比较。
 *
 * 通过 trait 合并进 Sutwx_Jwt，对外方法签名与调用方式保持不变。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * JWT 底层编码工具。
 */
trait Sutwx_Jwt_Codec {

	/**
	 * 安全随机字节：仅使用 CSPRNG，不可用时中止（绝不退化到可预测值）。
	 *
	 * @param int $length 字节数。
	 * @return string
	 * @throws RuntimeException CSPRNG 不可用或失败时。
	 */
	private static function random_bytes( $length ) {
		if ( ! function_exists( 'random_bytes' ) ) {
			throw new RuntimeException( 'CSPRNG unavailable' );
		}
		try {
			return random_bytes( $length );
		} catch ( Exception $e ) {
			throw new RuntimeException( 'CSPRNG failed', 0, $e );
		}
	}

	/**
	 * 恒定时间字符串比较（兼容无 hash_equals 环境）。
	 *
	 * @param string $a 期望值。
	 * @param string $b 实际值。
	 * @return bool
	 */
	private static function hash_equals( $a, $b ) {
		if ( function_exists( 'hash_equals' ) ) {
			return hash_equals( $a, $b );
		}
		return $a === $b;
	}

	/**
	 * JSON 编码（失败时回落为空对象，避免签名空串）。
	 *
	 * @param mixed $data 数据。
	 * @return string
	 */
	private static function json_encode( $data ) {
		$json = json_encode( $data );
		return false === $json ? '{}' : $json;
	}

	/**
	 * Base64URL 编码。
	 *
	 * @param string $data 原始数据。
	 * @return string
	 */
	public static function base64url_encode( $data ) {
		return rtrim( strtr( base64_encode( (string) $data ), '+/', '-_' ), '=' );
	}

	/**
	 * Base64URL 解码。
	 *
	 * @param string $data 编码数据。
	 * @return string
	 */
	public static function base64url_decode( $data ) {
		$remainder = strlen( $data ) % 4;
		if ( $remainder ) {
			$data .= str_repeat( '=', 4 - $remainder );
		}
		$decoded = base64_decode( strtr( $data, '-_', '+/' ), true );
		return false === $decoded ? '' : $decoded;
	}
}
