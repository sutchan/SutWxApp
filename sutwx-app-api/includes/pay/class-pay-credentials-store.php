<?php
/**
 * 支付凭证的写入/锁定/读取（自 class-pay-credentials.php 拆出）。
 * 通过 trait 合并进 Sutwx_Pay_Credentials，调用方式保持不变。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * 支付凭证写操作。
 */
trait Sutwx_Pay_Credentials_Store {

	/**
	 * 写入支付凭证（锁定态与脱敏值处理同 BE-003）。
	 *
	 * @param array $raw 原始提交。
	 * @return bool
	 */
	public static function update( $raw ) {
		if ( self::is_locked() ) {
			return false;
		}

		$raw = is_array( $raw ) ? $raw : array();
		// 基于原值按字段合并，避免只改商户号就清空私钥与 APIv3 密钥。
		$out = self::get_option();

		$fields = array( 'mchId', 'serialNo', 'apiV3Key' );
		foreach ( $fields as $field ) {
			if ( isset( $raw[ $field ] ) ) {
				$value = self::sanitize_text( $raw[ $field ] );
				// 脱敏值视为「未修改」，保留原值。
				if ( '' !== $value && false === strpos( $value, '*' ) ) {
					$out[ $field ] = $value;
				}
			}
		}
		// 私钥为多行长文本，单独处理（脱敏值视为未修改）。
		if ( isset( $raw['privateKey'] ) ) {
			$key = (string) $raw['privateKey'];
			if ( '' !== $key && false === strpos( $key, '*' ) ) {
				$out['privateKey'] = $key;
			}
		}

		return update_option( self::OPTION, $out );
	}

	/**
	 * 支付凭证是否来自 wp-config 常量（后台只读）。
	 *
	 * @return bool
	 */
	public static function is_locked() {
		return defined( 'SUTWX_WX_MCHID' )
			&& defined( 'SUTWX_WX_MCH_SERIAL' )
			&& defined( 'SUTWX_WX_MCH_KEY' )
			&& defined( 'SUTWX_WX_API_V3_KEY' );
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
