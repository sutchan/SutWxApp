<?php
/**
 * JWT（HS256）签发与校验：无第三方依赖，可脱离 WordPress 独立单测。
 *
 * 编解码基建（Base64URL/JSON/随机字节）见 includes/class-jwt-codec.php。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

if ( ! trait_exists( 'Sutwx_Jwt_Codec' ) ) {
	// 用 __DIR__ 而非插件常量：独立单测可能未定义 SUTWX_API_DIR。
	require_once __DIR__ . '/class-jwt-codec.php';
}

/**
 * JWT 编解码工具。
 */
class Sutwx_Jwt {

	use Sutwx_Jwt_Codec;

	/**
	 * 支持的算法（仅 HS256，避免 alg=none 混淆攻击）。
	 */
	const ALGO = 'HS256';

	/**
	 * 签发 token。
	 *
	 * @param array  $claims 业务声明（不含 iat/exp，由本方法填充）。
	 * @param string $secret 签名密钥。
	 * @param int    $ttl    有效期（秒）。
	 * @return string
	 */
	public static function encode( $claims, $secret, $ttl = 7200 ) {
		$header = array(
			'alg' => self::ALGO,
			'typ' => 'JWT',
		);

		$now              = time();
		$payload          = is_array( $claims ) ? $claims : array();
		$payload['iat']   = $now;
		$payload['exp']   = $now + max( 1, (int) $ttl );
		$payload['iss']   = 'sutwx-app-api';
		if ( ! isset( $payload['jti'] ) ) {
			$payload['jti'] = self::generate_jti();
		}

		$segments = array(
			self::base64url_encode( self::json_encode( $header ) ),
			self::base64url_encode( self::json_encode( $payload ) ),
		);

		$signing_input = implode( '.', $segments );
		$signature     = hash_hmac( 'sha256', $signing_input, (string) $secret, true );
		$segments[]    = self::base64url_encode( $signature );

		return implode( '.', $segments );
	}

	/**
	 * 校验并解析 token。
	 *
	 * @param string $token  原始 token。
	 * @param string $secret 签名密钥。
	 * @return array{ok:bool,payload:array,error:string}
	 */
	public static function decode( $token, $secret ) {
		$fail = array( 'ok' => false, 'payload' => array(), 'error' => 'invalid_token' );

		if ( ! is_string( $token ) || '' === $token ) {
			return $fail;
		}

		$parts = explode( '.', $token );
		if ( 3 !== count( $parts ) ) {
			return $fail;
		}

		list( $h_b64, $p_b64, $s_b64 ) = $parts;

		$header = json_decode( self::base64url_decode( $h_b64 ), true );
		if ( ! is_array( $header ) || self::ALGO !== ( isset( $header['alg'] ) ? $header['alg'] : '' ) ) {
			$fail['error'] = 'unsupported_alg';
			return $fail;
		}

		$expected = self::base64url_encode(
			hash_hmac( 'sha256', $h_b64 . '.' . $p_b64, (string) $secret, true )
		);
		if ( ! self::hash_equals( $expected, $s_b64 ) ) {
			$fail['error'] = 'signature_mismatch';
			return $fail;
		}

		$payload = json_decode( self::base64url_decode( $p_b64 ), true );
		if ( ! is_array( $payload ) ) {
			$fail['error'] = 'malformed_payload';
			return $fail;
		}

		// 强制要求 exp：缺失或非法一律拒绝，避免构造永不过期的 token。
		if ( ! isset( $payload['exp'] ) || ! is_numeric( $payload['exp'] ) ) {
			$fail['error'] = 'invalid_token';
			return $fail;
		}
		if ( time() >= (int) $payload['exp'] ) {
			$fail['error'] = 'token_expired';
			return $fail;
		}

		if ( isset( $payload['nbf'] ) && time() < (int) $payload['nbf'] ) {
			$fail['error'] = 'token_not_active';
			return $fail;
		}

		return array( 'ok' => true, 'payload' => $payload, 'error' => '' );
	}

	/**
	 * 仅读取过期时间（不校验签名，用于客户端侧过期预判）。
	 *
	 * @param string $token token。
	 * @return int 过期时间戳（秒）；解析失败返回 0。
	 */
	public static function expires_at( $token ) {
		$parts = explode( '.', (string) $token );
		if ( 3 !== count( $parts ) ) {
			return 0;
		}
		$payload = json_decode( self::base64url_decode( $parts[1] ), true );
		return is_array( $payload ) && isset( $payload['exp'] ) ? (int) $payload['exp'] : 0;
	}

	/**
	 * 生成 jti（无 WP 依赖，便于单测）。
	 *
	 * @return string
	 */
	public static function generate_jti() {
		if ( function_exists( 'wp_generate_uuid4' ) ) {
			return wp_generate_uuid4();
		}
		$jti = bin2hex( self::random_bytes( 16 ) );
		if ( '' === $jti ) {
			// 空 jti 会导致 token 无法被吊销，直接中止签发。
			throw new RuntimeException( 'Unable to generate token id' );
		}
		return $jti;
	}
}
