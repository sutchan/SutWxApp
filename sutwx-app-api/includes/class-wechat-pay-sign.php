<?php
/**
 * 微信支付 V3 签名/验签/资源解密（BE-007）。
 *
 * 规则（官方文档核实）：
 * - 接口请求 Authorization：WECHATPAY2-SHA256-RSA2048，待签串为
 *   「HTTP方法\nURL\n时间戳\n随机串\n请求报文主体\n」（每行含尾部换行）。
 * - 小程序调起支付 paySign：待签串为「appId\ntimeStamp\nnonceStr\nprepay_id=xxx\n」，
 *   注意最后一行同样以换行结尾，且 signType 不参与签名。
 * - 通知验签：平台证书公钥校验「时间戳\n随机串\n请求报文主体\n」。
 * - 通知资源解密：AEAD_AES_256_GCM，密钥为 APIv3 密钥（32 字节）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 支付签名工具。
 */
class Sutwx_Wechat_Pay_Sign {

	/**
	 * 授权签名方案标识。
	 */
	const SCHEME = 'WECHATPAY2-SHA256-RSA2048';

	/**
	 * 随机字符串（大写十六进制，长度 32）。
	 *
	 * @return string
	 */
	public static function nonce() {
		try {
			return strtoupper( bin2hex( random_bytes( 16 ) ) );
		} catch ( Exception $e ) {
			return strtoupper( md5( uniqid( 'sutwx', true ) . mt_rand() ) );
		}
	}

	/**
	 * 接口请求待签串（5 行，每行含尾部换行）。
	 *
	 * @param string $method    HTTP 方法（大写）。
	 * @param string $url       请求 URL（含 query）。
	 * @param string $timestamp 秒级时间戳。
	 * @param string $nonce     随机串。
	 * @param string $body      请求报文主体（GET 为空串）。
	 * @return string
	 */
	public static function authorization_message( $method, $url, $timestamp, $nonce, $body ) {
		return strtoupper( (string) $method ) . "\n"
			. (string) $url . "\n"
			. (string) $timestamp . "\n"
			. (string) $nonce . "\n"
			. (string) $body . "\n";
	}

	/**
	 * 通知验签待签串（3 行，每行含尾部换行）。
	 *
	 * @param string $timestamp 时间戳。
	 * @param string $nonce     随机串。
	 * @param string $body      通知报文主体。
	 * @return string
	 */
	public static function notify_message( $timestamp, $nonce, $body ) {
		return (string) $timestamp . "\n" . (string) $nonce . "\n" . (string) $body . "\n";
	}

	/**
	 * 小程序调起支付待签串（4 行，每行含尾部换行，不含 signType）。
	 *
	 * @param string $app_id    小程序 appId。
	 * @param string $timestamp 秒级时间戳。
	 * @param string $nonce     随机串。
	 * @param string $package   prepay_id=xxx。
	 * @return string
	 */
	public static function pay_sign_message( $app_id, $timestamp, $nonce, $package ) {
		return (string) $app_id . "\n"
			. (string) $timestamp . "\n"
			. (string) $nonce . "\n"
			. (string) $package . "\n";
	}

	/**
	 * RSA-SHA256 签名并 Base64 编码（失败返回空串）。
	 *
	 * @param string $message        待签串。
	 * @param string $private_key_pem 商户 API 私钥 PEM。
	 * @return string
	 */
	public static function sign( $message, $private_key_pem ) {
		$key = openssl_pkey_get_private( (string) $private_key_pem );
		if ( ! $key ) {
			return '';
		}
		$signature = '';
		if ( ! openssl_sign( $message, $signature, $key, OPENSSL_ALGO_SHA256 ) ) {
			openssl_free_key( $key );
			return '';
		}
		openssl_free_key( $key );
		return base64_encode( $signature );
	}

	/**
	 * 构造接口请求 Authorization 头（自动取商户凭证）。
	 *
	 * @param string $method HTTP 方法。
	 * @param string $url    URL（含 query）。
	 * @param string $body   请求体（GET 为空串）。
	 * @return string
	 */
	public static function build_authorization( $method, $url, $body ) {
		$timestamp = (string) time();
		$nonce     = self::nonce();
		$message   = self::authorization_message( $method, $url, $timestamp, $nonce, $body );
		$signature = self::sign( $message, Sutwx_Pay_Credentials::get_private_key() );

		if ( '' === $signature ) {
			return '';
		}

		return self::SCHEME
			. ' mchid="' . Sutwx_Pay_Credentials::get_mch_id() . '"'
			. ',serial_no="' . Sutwx_Pay_Credentials::get_serial_no() . '"'
			. ',nonce_str="' . $nonce . '"'
			. ',signature="' . $signature . '"'
			. ',timestamp="' . $timestamp . '"';
	}

	/**
	 * 平台证书公钥验签。
	 *
	 * @param string $message      待签串。
	 * @param string $signature_b64 Base64 签名。
	 * @param string $cert_pem     平台证书 PEM。
	 * @return bool
	 */
	public static function verify( $message, $signature_b64, $cert_pem ) {
		$key = openssl_pkey_get_public( (string) $cert_pem );
		if ( ! $key ) {
			return false;
		}
		$signature = base64_decode( (string) $signature_b64, true );
		if ( false === $signature ) {
			openssl_free_key( $key );
			return false;
		}
		$ok = openssl_verify( $message, $signature, $key, OPENSSL_ALGO_SHA256 );
		openssl_free_key( $key );
		return 1 === $ok;
	}

	/**
	 * 通知资源解密（AEAD_AES_256_GCM）。
	 *
	 * @param string $ciphertext_b64  Base64 密文。
	 * @param string $nonce           加密随机串。
	 * @param string $associated_data 关联数据。
	 * @param string $key             APIv3 密钥。
	 * @return string 明文 JSON（失败返回空串）。
	 */
	public static function decrypt_resource( $ciphertext_b64, $nonce, $associated_data, $key ) {
		$ciphertext = base64_decode( (string) $ciphertext_b64, true );
		if ( false === $ciphertext || '' === $ciphertext ) {
			return '';
		}

		$tag = '';
		$plain = openssl_decrypt(
			$ciphertext,
			'aes-256-gcm',
			(string) $key,
			OPENSSL_RAW_DATA,
			(string) $nonce,
			$tag,
			(string) $associated_data
		);

		return false === $plain ? '' : (string) $plain;
	}
}
