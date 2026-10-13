<?php
/**
 * 鉴权守卫：解析 Authorization: Bearer <token> 并提供 permission_callback（BE-002）。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Bearer Token 校验。
 */
class Sutwx_Auth_Guard {

	/**
	 * 无 token 时的错误码。
	 */
	const ERR_MISSING = 'authorization_missing';

	/**
	 * permission_callback：校验通过返回 true，否则返回 WP_Error。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return bool|WP_Error
	 */
	public static function permission( $request ) {
		$result = self::authorize( $request );
		if ( $result['ok'] ) {
			return true;
		}

		if ( ! class_exists( 'WP_Error' ) ) {
			return false;
		}

		return new WP_Error(
			'sutwx_unauthorized',
			self::message( $result['error'] ),
			array( 'status' => 401 )
		);
	}

	/**
	 * 校验请求并返回声明。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array{ok:bool,payload:array,error:string}
	 */
	public static function authorize( $request ) {
		$token = self::extract_token( $request );
		if ( '' === $token ) {
			return array( 'ok' => false, 'payload' => array(), 'error' => self::ERR_MISSING );
		}

		$result = Sutwx_Jwt::decode( $token, Sutwx_Credentials::get_jwt_secret() );
		if ( ! $result['ok'] ) {
			return $result;
		}
		if ( 'access' !== ( isset( $result['payload']['type'] ) ? $result['payload']['type'] : '' ) ) {
			return array( 'ok' => false, 'payload' => array(), 'error' => 'invalid_token_type' );
		}
		if ( Sutwx_Auth_Service::is_revoked( isset( $result['payload']['jti'] ) ? $result['payload']['jti'] : '' ) ) {
			return array( 'ok' => false, 'payload' => array(), 'error' => 'token_revoked' );
		}

		return $result;
	}

	/**
	 * 从请求头提取 Bearer Token。
	 *
	 * REST 服务器未必透传 Authorization，故回落读取 $_SERVER。
	 *
	 * @param WP_REST_Request|null $request 请求对象。
	 * @return string
	 */
	public static function extract_token( $request = null ) {
		$header = '';

		if ( $request && is_object( $request ) && method_exists( $request, 'get_header' ) ) {
			$header = (string) $request->get_header( 'Authorization' );
		}
		if ( '' === $header && isset( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
			$header = (string) wp_unslash_safe( $_SERVER['HTTP_AUTHORIZATION'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		}
		if ( '' === $header && function_exists( 'getallheaders' ) ) {
			$headers = getallheaders();
			foreach ( array( 'Authorization', 'authorization' ) as $key ) {
				if ( isset( $headers[ $key ] ) ) {
					$header = (string) $headers[ $key ];
					break;
				}
			}
		}

		$header = trim( $header );
		if ( '' === $header ) {
			return '';
		}
		if ( 0 === stripos( $header, 'bearer ' ) ) {
			return trim( substr( $header, 7 ) );
		}
		return $header;
	}

	/**
	 * 取当前用户 ID（已校验请求）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return int
	 */
	public static function current_user_id( $request ) {
		$result = self::authorize( $request );
		return $result['ok'] && isset( $result['payload']['sub'] ) ? (int) $result['payload']['sub'] : 0;
	}

	/**
	 * 错误码 → 中文提示（不泄露内部细节）。
	 *
	 * @param string $error 错误码。
	 * @return string
	 */
	private static function message( $error ) {
		$messages = array(
			self::ERR_MISSING       => '缺少 Authorization 请求头',
			'token_expired'         => '登录已过期，请重新登录',
			'signature_mismatch'    => 'Token 签名校验失败',
			'token_revoked'         => 'Token 已失效，请重新登录',
			'invalid_token_type'    => 'Token 类型不正确',
			'unsupported_alg'       => '不支持的 Token 算法',
			'malformed_payload'     => 'Token 格式错误',
			'invalid_token'         => '无效的 Token',
			'token_not_active'      => 'Token 尚未生效',
		);

		$key = isset( $messages[ $error ] ) ? $error : 'invalid_token';
		$text = $messages[ $key ];
		return function_exists( '__' ) ? __( $text, 'sutwx-app-api' ) : $text;
	}
}

/**
 * wp_unslash 的安全包装（独立运行环境可能缺失）。
 *
 * @param mixed $value 原值。
 * @return mixed
 */
function wp_unslash_safe( $value ) {
	return function_exists( 'wp_unslash' ) ? wp_unslash( $value ) : $value;
}
