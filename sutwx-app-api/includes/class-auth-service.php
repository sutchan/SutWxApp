<?php
/**
 * 鉴权业务服务：openid ↔ WP 用户绑定、双 Token 签发/刷新/吊销、用户 DTO（BE-001/002）。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 鉴权服务。
 */
class Sutwx_Auth_Service {

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
	 * 吊销 token（登出）：按 jti 写入黑名单至过期时间。
	 *
	 * @param array $payload 已校验的 token 声明。
	 * @return bool
	 */
	public static function revoke( $payload ) {
		$jti = (string) self::claim( $payload, 'jti' );
		$exp = (int) self::claim( $payload, 'exp' );
		if ( '' === $jti || $exp <= time() ) {
			return false;
		}
		return self::store_blacklist( $jti, $exp );
	}

	/**
	 * 判断 jti 是否已吊销。
	 *
	 * @param string $jti token id。
	 * @return bool
	 */
	public static function is_revoked( $jti ) {
		if ( '' === (string) $jti ) {
			return false;
		}
		if ( function_exists( 'get_transient' ) ) {
			return (bool) get_transient( 'sutwx_jti_' . md5( $jti ) );
		}
		return false;
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
	 * 用户 DTO（字段与小程序 pages/user 预期对齐）。
	 *
	 * @param int    $user_id WP 用户 ID。
	 * @param string $openid  微信 openid。
	 * @return array
	 */
	public static function user_dto( $user_id, $openid = '' ) {
		$user_id = (int) $user_id;
		$user    = function_exists( 'get_userdata' ) ? get_userdata( $user_id ) : null;

		$dto = array(
			'id'         => $user_id,
			'openid'     => '' !== $openid ? $openid : (string) self::get_openid( $user_id ),
			'nickName'   => $user ? $user->display_name : '',
			'avatarUrl'  => function_exists( 'get_avatar_url' ) ? get_avatar_url( $user_id ) : '',
			'points'     => (int) self::get_user_number( $user_id, 'sutwx_points' ),
			'memberLevel' => (string) self::get_user_text( $user_id, 'sutwx_member_level' ),
			'orderStats' => array(
				'pendingPayment'  => 0,
				'pendingShipment' => 0,
				'pendingReceive'  => 0,
				'pendingReview'   => 0,
			),
		);

		if ( function_exists( 'apply_filters' ) ) {
			$dto = apply_filters( 'sutwx_user_dto', $dto, $user_id );
		}
		return $dto;
	}

	/**
	 * 按 openid 解析（或创建）本地 WP 用户。
	 *
	 * @param string $openid  openid。
	 * @param array  $profile 用户资料。
	 * @return int 用户 ID；失败返回 0。
	 */
	public static function resolve_user( $openid, $profile = array() ) {
		if ( '' === (string) $openid ) {
			return 0;
		}

		$existing = self::find_user_by_openid( $openid );
		if ( $existing ) {
			self::sync_profile( $existing, $profile );
			return $existing;
		}

		if ( ! function_exists( 'wp_insert_user' ) ) {
			return 0;
		}

		$login    = 'wx_' . substr( $openid, -12 );
		$nickname = isset( $profile['nickName'] ) ? self::sanitize( $profile['nickName'] ) : '';
		$email    = $login . '@weixin.invalid';

		$user_id = wp_insert_user(
			array(
				'user_login'   => $login,
				'user_pass'    => function_exists( 'wp_generate_password' ) ? wp_generate_password( 24, true, true ) : bin2hex( self::random( 12 ) ),
				'user_email'   => $email,
				'display_name' => '' !== $nickname ? $nickname : $login,
				'role'         => 'subscriber',
			)
		);

		if ( function_exists( 'is_wp_error' ) && is_wp_error( $user_id ) ) {
			return 0;
		}

		$user_id = (int) $user_id;
		if ( function_exists( 'update_user_meta' ) ) {
			update_user_meta( $user_id, self::OPENID_META, $openid );
		}
		self::sync_profile( $user_id, $profile );

		return $user_id;
	}

	/**
	 * 同步昵称/头像到用户资料（仅当有值且发生变化时）。
	 *
	 * @param int   $user_id 用户 ID。
	 * @param array $profile 用户资料。
	 */
	private static function sync_profile( $user_id, $profile ) {
		if ( ! is_array( $profile ) || ! function_exists( 'update_user_meta' ) ) {
			return;
		}
		if ( ! empty( $profile['nickName'] ) ) {
			update_user_meta( $user_id, 'nickname', self::sanitize( $profile['nickName'] ) );
		}
		if ( ! empty( $profile['avatarUrl'] ) ) {
			update_user_meta( $user_id, 'sutwx_avatar', self::sanitize( $profile['avatarUrl'] ) );
		}
	}

	/**
	 * 按 openid 查找用户。
	 *
	 * @param string $openid openid。
	 * @return int
	 */
	private static function find_user_by_openid( $openid ) {
		if ( ! function_exists( 'get_users' ) ) {
			return 0;
		}
		$found = get_users(
			array(
				'meta_key'   => self::OPENID_META, // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value' => $openid, // phpcs:ignore WordPress.DB.SlowDBQuery
				'number'     => 1,
				'fields'     => array( 'ID' ),
			)
		);
		return empty( $found ) ? 0 : (int) $found[0]->ID;
	}

	/**
	 * 读取用户 openid。
	 *
	 * @param int $user_id 用户 ID。
	 * @return string
	 */
	private static function get_openid( $user_id ) {
		return function_exists( 'get_user_meta' ) ? (string) get_user_meta( $user_id, self::OPENID_META, true ) : '';
	}

	/**
	 * 读取数值型用户 meta。
	 *
	 * @param int    $user_id 用户 ID。
	 * @param string $key     meta 键。
	 * @return int
	 */
	private static function get_user_number( $user_id, $key ) {
		if ( ! function_exists( 'get_user_meta' ) ) {
			return 0;
		}
		return (int) get_user_meta( $user_id, $key, true );
	}

	/**
	 * 读取文本型用户 meta。
	 *
	 * @param int    $user_id 用户 ID。
	 * @param string $key     meta 键。
	 * @return string
	 */
	private static function get_user_text( $user_id, $key ) {
		if ( ! function_exists( 'get_user_meta' ) ) {
			return '';
		}
		return (string) get_user_meta( $user_id, $key, true );
	}

	/**
	 * 安全地取声明值。
	 *
	 * @param array  $payload 声明数组。
	 * @param string $key     键名。
	 * @return mixed
	 */
	private static function claim( $payload, $key ) {
		return is_array( $payload ) && isset( $payload[ $key ] ) ? $payload[ $key ] : '';
	}

	/**
	 * 写入 jti 黑名单。
	 *
	 * @param string $jti token id。
	 * @param int    $exp 过期时间戳。
	 * @return bool
	 */
	private static function store_blacklist( $jti, $exp ) {
		if ( ! function_exists( 'set_transient' ) ) {
			return false;
		}
		return set_transient( 'sutwx_jti_' . md5( $jti ), 1, max( 1, $exp - time() ) );
	}

	/**
	 * 文本清洗（兼容无 WP 环境）。
	 *
	 * @param mixed $value 原值。
	 * @return string
	 */
	private static function sanitize( $value ) {
		if ( function_exists( 'sanitize_text_field' ) ) {
			return sanitize_text_field( (string) $value );
		}
		return trim( strip_tags( (string) $value ) );
	}

	/**
	 * 随机字节（仅用于生成初始密码）。
	 *
	 * @param int $length 长度。
	 * @return string
	 */
	private static function random( $length ) {
		return function_exists( 'random_bytes' ) ? random_bytes( $length ) : str_repeat( 'a', $length );
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
