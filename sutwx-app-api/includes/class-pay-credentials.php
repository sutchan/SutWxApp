<?php
/**
 * 微信支付商户凭证：商户号 / 证书序列号 / API 私钥 / APIv3 密钥 / 平台证书（BE-007）。
 *
 * 优先级：wp-config.php 常量 > option（与 BE-003 一致的密钥治理策略）。
 * 常量：SUTWX_WX_MCHID / SUTWX_WX_MCH_SERIAL / SUTWX_WX_MCH_KEY（PEM 内容或文件路径）
 *       SUTWX_WX_API_V3_KEY。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

if ( ! trait_exists( 'Sutwx_Pay_Credentials_Store' ) ) {
	// 用 __DIR__ 而非插件常量：独立单测可能未定义 SUTWX_API_DIR。
	require_once __DIR__ . '/pay/class-pay-credentials-store.php';
}

/**
 * 支付凭证读写。
 */
class Sutwx_Pay_Credentials {

	use Sutwx_Pay_Credentials_Store;

	/**
	 * 支付凭证 option 键名。
	 */
	const OPTION = 'sutwx_pay_credentials';

	/**
	 * 平台证书缓存 option 键名（{pem, expire_at}）。
	 */
	const PLATFORM_CERT_OPTION = 'sutwx_pay_platform_cert';

	/**
	 * 商户号。
	 *
	 * @return string
	 */
	public static function get_mch_id() {
		if ( defined( 'SUTWX_WX_MCHID' ) ) {
			return (string) SUTWX_WX_MCHID;
		}
		$option = self::get_option();
		return isset( $option['mchId'] ) ? (string) $option['mchId'] : '';
	}

	/**
	 * API 证书序列号。
	 *
	 * @return string
	 */
	public static function get_serial_no() {
		if ( defined( 'SUTWX_WX_MCH_SERIAL' ) ) {
			return (string) SUTWX_WX_MCH_SERIAL;
		}
		$option = self::get_option();
		return isset( $option['serialNo'] ) ? (string) $option['serialNo'] : '';
	}

	/**
	 * 商户 API 私钥（PEM 内容；常量可为文件路径）。
	 *
	 * @return string
	 */
	public static function get_private_key() {
		if ( defined( 'SUTWX_WX_MCH_KEY' ) ) {
			$key = (string) SUTWX_WX_MCH_KEY;
			// 常量形态为文件路径时读取文件内容。
			if ( ! preg_match( '/BEGIN (RSA )?PRIVATE KEY/', $key ) && is_readable( $key ) ) {
				$content = file_get_contents( $key );
				if ( is_string( $content ) ) {
					return $content;
				}
			}
			return $key;
		}
		$option = self::get_option();
		return isset( $option['privateKey'] ) ? (string) $option['privateKey'] : '';
	}

	/**
	 * APIv3 密钥（32 字节，用于证书与通知资源解密）。
	 *
	 * @return string
	 */
	public static function get_api_v3_key() {
		if ( defined( 'SUTWX_WX_API_V3_KEY' ) ) {
			return (string) SUTWX_WX_API_V3_KEY;
		}
		$option = self::get_option();
		return isset( $option['apiV3Key'] ) ? (string) $option['apiV3Key'] : '';
	}

	/**
	 * 支付凭证是否配置完整。
	 *
	 * @return bool
	 */
	public static function is_configured() {
		return '' !== self::get_mch_id()
			&& '' !== self::get_serial_no()
			&& '' !== self::get_private_key()
			&& '' !== self::get_api_v3_key();
	}

	/**
	 * 读取平台证书缓存（未缓存或过期返回空串）。
	 *
	 * @return string
	 */
	public static function get_platform_cert() {
		$cached = get_option( self::PLATFORM_CERT_OPTION, array() );
		if ( ! is_array( $cached ) || empty( $cached['pem'] ) ) {
			return '';
		}
		$expire_at = isset( $cached['expire_at'] ) ? (int) $cached['expire_at'] : 0;
		if ( $expire_at > 0 && $expire_at < time() ) {
			return '';
		}
		return (string) $cached['pem'];
	}

	/**
	 * 缓存平台证书（默认 12 小时后过期重新拉取）。
	 *
	 * @param string $pem 证书 PEM。
	 * @return bool
	 */
	public static function set_platform_cert( $pem ) {
		if ( '' === (string) $pem ) {
			return false;
		}
		return update_option(
			self::PLATFORM_CERT_OPTION,
			array(
				'pem'       => (string) $pem,
				'expire_at' => time() + 12 * HOUR_IN_SECONDS,
			)
		);
	}

}
