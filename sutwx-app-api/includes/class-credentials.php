<?php
/**
 * 小程序凭证配置：AppID / AppSecret / JWT 密钥读写与校验（BE-003）。
 *
 * 优先级：wp-config.php 常量 > option；常量存在时后台只读，避免密钥落库。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 凭证配置读写。
 */
class Sutwx_Credentials {

	/**
	 * option 键名。
	 */
	const OPTION = 'sutwx_credentials';

	/**
	 * JWT 密钥 option 键名（独立于业务凭证，便于单独轮换）。
	 */
	const SECRET_OPTION = 'sutwx_jwt_secret';

	/**
	 * access token 有效期（秒）。
	 */
	const ACCESS_TTL = 7200;

	/**
	 * refresh token 有效期（秒）。
	 */
	const REFRESH_TTL = 2592000; // 30 天。

	/**
	 * 读取 AppID。
	 *
	 * @return string
	 */
	public static function get_app_id() {
		if ( defined( 'SUTWX_WX_APPID' ) ) {
			return (string) SUTWX_WX_APPID;
		}
		$option = self::get_option();
		return isset( $option['appId'] ) ? (string) $option['appId'] : '';
	}

	/**
	 * 读取 AppSecret（脱敏展示用 mask）。
	 *
	 * @param bool $mask 是否脱敏。
	 * @return string
	 */
	public static function get_app_secret( $mask = false ) {
		$secret = '';
		if ( defined( 'SUTWX_WX_APPSECRET' ) ) {
			$secret = (string) SUTWX_WX_APPSECRET;
		} else {
			$option = self::get_option();
			$secret = isset( $option['appSecret'] ) ? (string) $option['appSecret'] : '';
		}
		return $mask ? self::mask( $secret ) : $secret;
	}

	/**
	 * 读取 JWT 签名密钥；缺省时自动生成并落库。
	 *
	 * @return string
	 */
	public static function get_jwt_secret() {
		if ( defined( 'SUTWX_JWT_SECRET' ) ) {
			return (string) SUTWX_JWT_SECRET;
		}

		$secret = get_option( self::SECRET_OPTION, '' );
		if ( ! is_string( $secret ) || strlen( $secret ) < 32 ) {
			$secret = self::generate_secret();
			update_option( self::SECRET_OPTION, $secret );
		}
		return $secret;
	}

	/**
	 * 凭证是否已配置完整（决定 /auth/login 是否可用）。
	 *
	 * @return bool
	 */
	public static function is_configured() {
		return '' !== self::get_app_id() && '' !== self::get_app_secret();
	}

	/**
	 * 凭证是否来自常量（后台只读）。
	 *
	 * @return bool
	 */
	public static function is_locked() {
		return defined( 'SUTWX_WX_APPID' ) && defined( 'SUTWX_WX_APPSECRET' );
	}

	/**
	 * 写入凭证（清洗后仅保留合法字段；锁定态直接返回 false）。
	 *
	 * @param array $raw 原始提交。
	 * @return bool
	 */
	public static function update( $raw ) {
		if ( self::is_locked() ) {
			return false;
		}

		$raw = is_array( $raw ) ? $raw : array();
		$out = array();

		if ( isset( $raw['appId'] ) ) {
			$out['appId'] = self::sanitize_text( $raw['appId'] );
		}
		if ( isset( $raw['appSecret'] ) ) {
			$secret = self::sanitize_text( $raw['appSecret'] );
			// 脱敏值（如 wx****abcd）视为「未修改」，保留原值。
			if ( '' !== $secret && false === strpos( $secret, '*' ) ) {
				$out['appSecret'] = $secret;
			} else {
				$out['appSecret'] = self::get_app_secret();
			}
		}

		return update_option( self::OPTION, $out );
	}

	/**
	 * 读取原始 option。
	 *
	 * @return array
	 */
	public static function get_option() {
		$option = get_option( self::OPTION, array() );
		return is_array( $option ) ? $option : array();
	}

	/**
	 * 密钥脱敏：保留首尾各 4 位。
	 *
	 * @param string $value 原文。
	 * @return string
	 */
	public static function mask( $value ) {
		$len = strlen( (string) $value );
		if ( $len <= 8 ) {
			return $len > 0 ? str_repeat( '*', $len ) : '';
		}
		return substr( $value, 0, 4 ) . str_repeat( '*', max( 3, $len - 8 ) ) . substr( $value, -4 );
	}

	/**
	 * 生成高强度随机密钥。
	 *
	 * @return string
	 */
	private static function generate_secret() {
		if ( function_exists( 'random_bytes' ) ) {
			try {
				return bin2hex( random_bytes( 32 ) );
			} catch ( Exception $e ) {
				return '';
			}
		}
		return md5( uniqid( 'sutwx', true ) . mt_rand() );
	}

	/**
	 * 文本清洗（兼容无 WP 函数环境）。
	 *
	 * @param mixed $value 原值。
	 * @return string
	 */
	private static function sanitize_text( $value ) {
		if ( function_exists( 'sanitize_text_field' ) ) {
			return sanitize_text_field( (string) $value );
		}
		return trim( strip_tags( (string) $value ) );
	}
}
