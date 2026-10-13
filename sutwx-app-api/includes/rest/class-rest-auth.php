<?php
/**
 * /api/auth/* 与 /api/user/info 路由：微信登录、Token 刷新、登出与个人资料（BE-001/002）。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}

/**
 * 鉴权路由控制器。
 */
class Sutwx_Rest_Auth extends Sutwx_Rest_Base {

	/**
	 * 注册登录/刷新/登出/用户信息四个路由。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/auth/login',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'login' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'code' => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/auth/refresh-token',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'refresh_token' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'refreshToken' => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/auth/logout',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'logout' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
			)
		);

		register_rest_route(
			SUTWX_API_REST_NS,
			'/user/info',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'user_info' ),
				'permission_callback' => array( 'Sutwx_Auth_Guard', 'permission' ),
			)
		);
	}

	/**
	 * 微信登录：code → openid → 双 Token。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function login( $request ) {
		if ( ! Sutwx_Credentials::is_configured() ) {
			return $this->error( '后台尚未配置小程序 AppID / AppSecret', 503, 'sutwx_credentials_missing' );
		}

		$code    = (string) $request->get_param( 'code' );
		$profile = $request->get_param( 'userInfo' );
		$profile = is_array( $profile ) ? $profile : array();

		$result = Sutwx_Auth_Service::login( $code, $profile );
		if ( ! $result['ok'] ) {
			return $this->error( self::error_text( $result['error'] ), $result['status'], $result['error'] );
		}

		return $this->success( $result['data'] );
	}

	/**
	 * 刷新 access token。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array|WP_Error
	 */
	public function refresh_token( $request ) {
		$refresh = (string) $request->get_param( 'refreshToken' );
		$result  = Sutwx_Auth_Service::refresh( $refresh );

		if ( ! $result['ok'] ) {
			return $this->error( self::error_text( $result['error'] ), $result['status'], $result['error'] );
		}
		return $this->success( $result['data'] );
	}

	/**
	 * 登出：吊销当前 access token。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array
	 */
	public function logout( $request ) {
		$authorized = Sutwx_Auth_Guard::authorize( $request );
		if ( $authorized['ok'] ) {
			Sutwx_Auth_Service::revoke( $authorized['payload'] );
		}
		return $this->success( array( 'loggedOut' => true ) );
	}

	/**
	 * 当前登录用户资料。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array
	 */
	public function user_info( $request ) {
		$authorized = Sutwx_Auth_Guard::authorize( $request );
		$user_id    = isset( $authorized['payload']['sub'] ) ? (int) $authorized['payload']['sub'] : 0;
		$openid     = isset( $authorized['payload']['openid'] ) ? (string) $authorized['payload']['openid'] : '';

		return $this->success( Sutwx_Auth_Service::user_dto( $user_id, $openid ) );
	}

	/**
	 * 错误码 → 面向客户端的安全提示（不回显微信原始错误细节）。
	 *
	 * @param string $error 错误码。
	 * @return string
	 */
	private static function error_text( $error ) {
		$map = array(
			'missing_code'         => '缺少登录凭证 code',
			'credentials_missing'  => '后台尚未配置小程序 AppID / AppSecret',
			'code2session_failed'  => '登录失败，请重试',
			'wechat_error_40029'   => '登录凭证无效，请重新登录',
			'wechat_error_45011'   => '请求过于频繁，请稍后重试',
			'user_bind_failed'     => '用户绑定失败，请重试',
			'token_expired'        => '登录已过期，请重新登录',
			'token_revoked'        => 'Token 已失效，请重新登录',
			'invalid_token_type'   => 'Token 类型不正确',
			'signature_mismatch'   => 'Token 签名校验失败',
		);

		return isset( $map[ $error ] ) ? $map[ $error ] : '登录失败，请重试';
	}
}
