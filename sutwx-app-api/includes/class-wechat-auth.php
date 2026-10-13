<?php
/**
 * 微信小程序 code2session：用 wx.login 的 code 换取 openid / session_key（BE-001）。
 *
 * 网络调用走 WP HTTP API，并提供过滤器便于单测注入桩响应。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 微信登录凭证校验。
 */
class Sutwx_Wechat_Auth {

	/**
	 * code2session 接口地址。
	 */
	const ENDPOINT = 'https://api.weixin.qq.com/sns/jscode2session';

	/**
	 * 请求超时（秒）。
	 */
	const TIMEOUT = 8;

	/**
	 * 用 code 换取 openid / session_key。
	 *
	 * @param string $code wx.login 返回的临时凭证。
	 * @return array{ok:bool,openid:string,sessionKey:string,error:string,raw:array}
	 */
	public static function code2session( $code ) {
		$fail = array(
			'ok'         => false,
			'openid'     => '',
			'sessionKey' => '',
			'error'      => 'code2session_failed',
			'raw'        => array(),
		);

		$code = is_string( $code ) ? trim( $code ) : '';
		if ( '' === $code ) {
			$fail['error'] = 'missing_code';
			return $fail;
		}

		$app_id     = Sutwx_Credentials::get_app_id();
		$app_secret = Sutwx_Credentials::get_app_secret();
		if ( '' === $app_id || '' === $app_secret ) {
			$fail['error'] = 'credentials_missing';
			return $fail;
		}

		$url = add_query_arg_safe(
			array(
				'appid'      => $app_id,
				'secret'     => $app_secret,
				'js_code'    => $code,
				'grant_type' => 'authorization_code',
			),
			self::ENDPOINT
		);

		$body = self::request( $url );
		if ( ! is_array( $body ) ) {
			return $fail;
		}

		if ( isset( $body['errcode'] ) && 0 !== (int) $body['errcode'] ) {
			$fail['error'] = 'wechat_error_' . (int) $body['errcode'];
			$fail['raw']   = $body;
			return $fail;
		}

		if ( empty( $body['openid'] ) ) {
			$fail['raw'] = $body;
			return $fail;
		}

		return array(
			'ok'         => true,
			'openid'     => (string) $body['openid'],
			'sessionKey' => isset( $body['session_key'] ) ? (string) $body['session_key'] : '',
			'error'      => '',
			'raw'        => $body,
		);
	}

	/**
	 * 发起 HTTP 请求并解析 JSON。
	 *
	 * 优先使用过滤器 `sutwx_code2session_response` 注入的桩响应（单测/离线环境）。
	 *
	 * @param string $url 完整请求地址。
	 * @return array|null
	 */
	private static function request( $url ) {
		if ( function_exists( 'apply_filters' ) ) {
			$stub = apply_filters( 'sutwx_code2session_response', null, $url );
			if ( is_array( $stub ) ) {
				return $stub;
			}
		}

		if ( ! function_exists( 'wp_remote_get' ) ) {
			return null;
		}

		$response = wp_remote_get(
			$url,
			array(
				'timeout' => self::TIMEOUT,
				'headers' => array( 'Accept' => 'application/json' ),
			)
		);

		if ( function_exists( 'is_wp_error' ) && is_wp_error( $response ) ) {
			return null;
		}

		$code = function_exists( 'wp_remote_retrieve_response_code' )
			? (int) wp_remote_retrieve_response_code( $response )
			: 200;
		if ( $code < 200 || $code >= 300 ) {
			return null;
		}

		$raw = function_exists( 'wp_remote_retrieve_body' )
			? wp_remote_retrieve_body( $response )
			: '';
		$body = json_decode( (string) $raw, true );

		return is_array( $body ) ? $body : null;
	}
}

/**
 * URL 拼参（无 WP 依赖版本，避免单测环境缺少 add_query_arg）。
 *
 * @param array  $args  查询参数。
 * @param string $url   基础地址。
 * @return string
 */
function add_query_arg_safe( $args, $url ) {
	if ( function_exists( 'add_query_arg' ) ) {
		return add_query_arg( $args, $url );
	}
	$parts = is_array( $args ) ? $args : array();
	return $url . ( false === strpos( $url, '?' ) ? '?' : '&' ) . http_build_query( $parts );
}
