<?php
/**
 * 鉴权业务服务：openid ↔ WP 用户绑定、双 Token 签发/刷新/吊销、用户 DTO（BE-001/002）。
 *
 * 职责拆分（保持对外调用方式不变）：
 * - 用户查找/绑定/资料同步 → includes/auth/class-auth-user-profile.php
 * - jti 黑名单与声明读取   → includes/auth/class-auth-token-store.php
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

// 自保护：任何单独 include 本类的场景（含独立单测）都能加载到 trait。
if ( ! trait_exists( 'Sutwx_Auth_User_Profile' ) ) {
	require_once __DIR__ . '/auth/class-auth-user-meta.php';
	require_once __DIR__ . '/auth/class-auth-user-profile.php';
}
if ( ! trait_exists( 'Sutwx_Auth_Token_Store' ) ) {
	require_once __DIR__ . '/auth/class-auth-token-store.php';
}

/**
 * 鉴权服务。
 */
class Sutwx_Auth_Service {

	use Sutwx_Auth_User_Profile;
	use Sutwx_Auth_User_Meta;
	use Sutwx_Auth_Token_Store;

	/**
	 * openid 存储的用户 meta 键。
	 */
	const OPENID_META = 'sutwx_openid';

	/**
	 * 登录：code → openid → 绑定/创建用户 → 签发双 Token。
	 *
	 * @param string $code    wx.login code。
	 * @param array  $profile 客户端上报的用户资料（nickName / avatarUrl）。
	 * @return array{ok:bool,data:array,error:string,status:int}
	 */
	public static function login( $code, $profile = array() ) {
		$session = Sutwx_Wechat_Auth::code2session( $code );
		if ( ! $session['ok'] ) {
			return self::fail( $session['error'], 401 );
		}

		$user_id = self::resolve_user( $session['openid'], $profile );
		if ( ! $user_id ) {
			return self::fail( 'user_bind_failed', 500 );
		}

		return array(
			'ok'     => true,
			'data'   => self::issue_tokens( $user_id, $session['openid'] ),
			'error'  => '',
			'status' => 200,
		);
	}

	/**
	 * 刷新 access token。
	 *
	 * @param string $refresh_token refresh token。
	 * @return array{ok:bool,data:array,error:string,status:int}
	 */
	public static function refresh( $refresh_token ) {
		$result = Sutwx_Jwt::decode( $refresh_token, Sutwx_Credentials::get_jwt_secret() );

		if ( ! $result['ok'] ) {
			return self::fail( $result['error'], 401 );
		}
		if ( 'refresh' !== self::claim( $result['payload'], 'type' ) ) {
			return self::fail( 'invalid_token_type', 401 );
		}
		if ( self::is_revoked( self::claim( $result['payload'], 'jti' ) ) ) {
			return self::fail( 'token_revoked', 401 );
		}

		$user_id = (int) self::claim( $result['payload'], 'sub' );
		$openid  = (string) self::claim( $result['payload'], 'openid' );

		return array(
			'ok'     => true,
			'data'   => self::issue_tokens( $user_id, $openid ),
			'error'  => '',
			'status' => 200,
		);
	}

	/**
	 * 签发双 Token（access + refresh）。
	 *
	 * @param int    $user_id WP 用户 ID。
	 * @param string $openid  微信 openid。
	 * @return array{token:string,refreshToken:string,expiresIn:int,refreshExpiresIn:int,userInfo:array}
	 */
	public static function issue_tokens( $user_id, $openid ) {
		$secret = Sutwx_Credentials::get_jwt_secret();
		$base   = array(
			'sub'    => (int) $user_id,
			'openid' => (string) $openid,
		);

		return array(
			'token'            => Sutwx_Jwt::encode(
				array_merge( $base, array( 'type' => 'access' ) ),
				$secret,
				Sutwx_Credentials::ACCESS_TTL
			),
			'refreshToken'     => Sutwx_Jwt::encode(
				array_merge( $base, array( 'type' => 'refresh' ) ),
				$secret,
				Sutwx_Credentials::REFRESH_TTL
			),
			'expiresIn'        => Sutwx_Credentials::ACCESS_TTL,
			'refreshExpiresIn' => Sutwx_Credentials::REFRESH_TTL,
			'userInfo'         => self::user_dto( $user_id, $openid ),
		);
	}

	/**
	 * 统一失败返回。
	 *
	 * @param string $error  错误码。
	 * @param int    $status HTTP 状态码。
	 * @return array
	 */
	private static function fail( $error, $status ) {
		return array(
			'ok'     => false,
			'data'   => array(),
			'error'  => $error,
			'status' => $status,
		);
	}
}
