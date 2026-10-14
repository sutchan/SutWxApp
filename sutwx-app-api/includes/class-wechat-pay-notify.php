<?php
/**
 * 微信支付 V3 异步通知解析：平台证书验签 + APIv3 密钥解密（BE-007，拆自 class-wechat-pay.php）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 异步通知验签与资源解密。
 */
class Sutwx_Wechat_Pay_Notify {

	/**
	 * 解析异步通知：平台证书验签 + APIv3 密钥解密资源。
	 *
	 * @param array  $headers 请求头（Wechatpay-Signature / -Timestamp / -Nonce / -Serial）。
	 * @param string $body    原始报文。
	 * @return array{ok:bool,data:array,error:string}
	 */
	public static function parse( $headers, $body ) {
		$headers   = is_array( $headers ) ? $headers : array();
		$signature = Sutwx_Wechat_Pay::header_value( $headers, 'Wechatpay-Signature' );
		$timestamp = Sutwx_Wechat_Pay::header_value( $headers, 'Wechatpay-Timestamp' );
		$nonce     = Sutwx_Wechat_Pay::header_value( $headers, 'Wechatpay-Nonce' );
		$serial    = Sutwx_Wechat_Pay::header_value( $headers, 'Wechatpay-Serial' );
		$cert      = Sutwx_Pay_Credentials::get_platform_cert();

		if ( '' === $cert ) {
			return array( 'ok' => false, 'data' => array(), 'error' => 'platform_cert_missing' );
		}

		$message = Sutwx_Wechat_Pay_Sign::notify_message( $timestamp, $nonce, $body );
		if ( ! Sutwx_Wechat_Pay_Sign::verify( $message, $signature, $cert ) ) {
			return array( 'ok' => false, 'data' => array(), 'error' => 'signature_mismatch' );
		}

		$payload  = json_decode( (string) $body, true );
		$resource = is_array( $payload ) && isset( $payload['resource'] ) ? $payload['resource'] : array();
		if ( ! is_array( $resource ) || empty( $resource['ciphertext'] ) ) {
			return array( 'ok' => false, 'data' => array(), 'error' => 'resource_missing' );
		}

		$plain = Sutwx_Wechat_Pay_Sign::decrypt_resource(
			$resource['ciphertext'],
			isset( $resource['nonce'] ) ? $resource['nonce'] : '',
			isset( $resource['associated_data'] ) ? $resource['associated_data'] : '',
			Sutwx_Pay_Credentials::get_api_v3_key()
		);

		$data = json_decode( $plain, true );
		if ( ! is_array( $data ) ) {
			return array( 'ok' => false, 'data' => array(), 'error' => 'decrypt_failed' );
		}

		$data['_serial'] = $serial;
		return array( 'ok' => true, 'data' => $data, 'error' => '' );
	}

	/**
	 * 通知回执（微信要求 200 + {code:'SUCCESS'}，失败回传 FAIL）。
	 *
	 * @param bool $ok 是否处理成功。
	 * @return array
	 */
	public static function receipt( $ok ) {
		return array(
			'code' => $ok ? 'SUCCESS' : 'FAIL',
		);
	}
}
