<?php
/**
 * 鉴权服务的「用户资料」职责（自 class-auth-service.php 拆出）。
 * 通过 trait 合并进 Sutwx_Auth_Service，调用方式与私有方法保持完全一致。
 *
 * 用户 meta 读取与文本工具见 includes/auth/class-auth-user-meta.php。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * 用户查找、绑定与资料同步。
 */
trait Sutwx_Auth_User_Profile {

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
			'id'          => $user_id,
			'openid'      => '' !== $openid ? $openid : (string) self::get_openid( $user_id ),
			'nickName'    => $user ? $user->display_name : '',
			'avatarUrl'   => function_exists( 'get_avatar_url' ) ? get_avatar_url( $user_id ) : '',
			'points'      => (int) self::get_user_number( $user_id, 'sutwx_points' ),
			'memberLevel' => (string) self::get_user_text( $user_id, 'sutwx_member_level' ),
			'orderStats'  => array(
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
				'user_pass'    => function_exists( 'wp_generate_password' )
					? wp_generate_password( 24, true, true )
					: bin2hex( self::random( 12 ) ),
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
}
