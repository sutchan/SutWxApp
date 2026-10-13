<?php
/**
 * 鉴权单测（独立运行，无需 WP/WC 环境）：
 *   php tests/run-auth-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖：JWT 签发/校验/过期/算法混淆、凭证配置与脱敏、code2session、Bearer 解析、
 *       登录→绑定用户→双 Token、刷新与吊销（QA-002 / BE-001~003）。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

require __DIR__ . '/stubs-runtime.php';

require dirname( __DIR__ ) . '/includes/class-jwt.php';
require dirname( __DIR__ ) . '/includes/class-credentials.php';
require dirname( __DIR__ ) . '/includes/class-wechat-auth.php';
require dirname( __DIR__ ) . '/includes/class-auth-service.php';
require dirname( __DIR__ ) . '/includes/class-auth-guard.php';

$failures = 0;

function check( $condition, $message ) {
	global $failures;
	if ( $condition ) {
		echo "  [PASS] {$message}\n";
	} else {
		$failures++;
		echo "  [FAIL] {$message}\n";
	}
}

$secret = 'unit-test-secret-key-0123456789abcdef';

echo "== JWT 签发与校验 ==\n";

$token = Sutwx_Jwt::encode( array( 'sub' => 7, 'openid' => 'oXy123', 'type' => 'access' ), $secret, 3600 );
$ok    = Sutwx_Jwt::decode( $token, $secret );
check( $ok['ok'], '正常 token 校验通过' );
check( 7 === (int) $ok['payload']['sub'], 'payload.sub 正确' );
check( 'oXy123' === $ok['payload']['openid'], 'payload.openid 正确' );
check( ! empty( $ok['payload']['jti'] ), '自动生成 jti' );
check( Sutwx_Jwt::expires_at( $token ) > time(), 'expires_at 为未来时间' );

$bad = Sutwx_Jwt::decode( $token, 'wrong-secret' );
check( ! $bad['ok'] && 'signature_mismatch' === $bad['error'], '密钥错误 → signature_mismatch' );

$tampered = substr( $token, 0, -3 ) . 'AAA';
check( ! Sutwx_Jwt::decode( $tampered, $secret )['ok'], '签名被篡改 → 校验失败' );

echo "== JWT 边界条件 ==\n";

check( ! Sutwx_Jwt::decode( '', $secret )['ok'], '空 token 被拒' );
check( ! Sutwx_Jwt::decode( 'a.b', $secret )['ok'], '段数不足被拒' );

$none_token = Sutwx_Jwt::base64url_encode( '{"alg":"none","typ":"JWT"}' ) . '.'
	. Sutwx_Jwt::base64url_encode( '{"sub":1}' ) . '.';
$none = Sutwx_Jwt::decode( $none_token, $secret );
check( ! $none['ok'] && 'unsupported_alg' === $none['error'], 'alg=none 攻击被拒' );

$expired = Sutwx_Jwt::encode( array( 'sub' => 1, 'type' => 'access' ), $secret, 1 );
sleep( 2 );
$exp = Sutwx_Jwt::decode( $expired, $secret );
check( ! $exp['ok'] && 'token_expired' === $exp['error'], '过期 token → token_expired' );

echo "== 凭证配置（BE-003） ==\n";

check( ! Sutwx_Credentials::is_configured(), '初始未配置凭证' );
Sutwx_Credentials::update( array( 'appId' => 'wxappid123456', 'appSecret' => 'secret-abcdefgh-1234' ) );
check( Sutwx_Credentials::is_configured(), '写入后已配置' );
check( 'wxappid123456' === Sutwx_Credentials::get_app_id(), 'AppID 读回一致' );
check( 'secret-abcdefgh-1234' === Sutwx_Credentials::get_app_secret(), 'AppSecret 读回一致' );

$masked = Sutwx_Credentials::get_app_secret( true );
check( false !== strpos( $masked, '*' ) && false === strpos( $masked, 'cdefgh' ), 'AppSecret 脱敏不泄露中段' );

Sutwx_Credentials::update( array( 'appSecret' => $masked ) );
check( 'secret-abcdefgh-1234' === Sutwx_Credentials::get_app_secret(), '提交脱敏值视为未修改' );

$jwt_secret = Sutwx_Credentials::get_jwt_secret();
check( strlen( $jwt_secret ) >= 32, 'JWT 密钥自动生成且长度足够' );
check( $jwt_secret === Sutwx_Credentials::get_jwt_secret(), 'JWT 密钥持久化复用' );

echo "== code2session（BE-001） ==\n";

check( 'missing_code' === Sutwx_Wechat_Auth::code2session( '' )['error'], '缺 code → missing_code' );

$GLOBALS['sutwx_code2session_stub'] = array( 'errcode' => 40029, 'errmsg' => 'invalid code' );
$wx_fail = Sutwx_Wechat_Auth::code2session( 'bad-code' );
check( ! $wx_fail['ok'] && 'wechat_error_40029' === $wx_fail['error'], '微信返回 errcode → 映射为具体错误码' );

$GLOBALS['sutwx_code2session_stub'] = array( 'openid' => 'oOPENID_001', 'session_key' => 'sk_001' );
$wx_ok = Sutwx_Wechat_Auth::code2session( 'good-code' );
check( $wx_ok['ok'] && 'oOPENID_001' === $wx_ok['openid'], '正常换取 openid' );
check( 'sk_001' === $wx_ok['sessionKey'], '解析 session_key' );

echo "== Bearer 解析与权限守卫（BE-002） ==\n";

class Fake_Rest_Request {
	private $headers;
	public function __construct( $headers = array() ) {
		$this->headers = $headers;
	}
	public function get_header( $key ) {
		return isset( $this->headers[ $key ] ) ? $this->headers[ $key ] : '';
	}
}

check( '' === Sutwx_Auth_Guard::extract_token( new Fake_Rest_Request() ), '无 Authorization → 空' );
check(
	'abc.def.ghi' === Sutwx_Auth_Guard::extract_token( new Fake_Rest_Request( array( 'Authorization' => 'Bearer abc.def.ghi' ) ) ),
	'正确解析 Bearer'
);

$anonymous = Sutwx_Auth_Guard::authorize( new Fake_Rest_Request() );
check( ! $anonymous['ok'] && 'authorization_missing' === $anonymous['error'], '匿名请求 → authorization_missing' );

echo "== 登录 / 刷新 / 吊销闭环 ==\n";

$login = Sutwx_Auth_Service::login( 'good-code', array( 'nickName' => '苏小糖', 'avatarUrl' => 'https://cdn/a.png' ) );
check( $login['ok'], '登录成功' );
check( ! empty( $login['data']['token'] ) && ! empty( $login['data']['refreshToken'] ), '返回双 Token' );
check( 7200 === $login['data']['expiresIn'], 'expiresIn=7200' );
check( '苏小糖' === $login['data']['userInfo']['nickName'], '用户昵称来自上报资料' );
check( 'oOPENID_001' === $login['data']['userInfo']['openid'], '用户 DTO 带 openid' );

$login_again = Sutwx_Auth_Service::login( 'good-code', array() );
check( $login_again['ok'] && $login_again['data']['userInfo']['id'] === $login['data']['userInfo']['id'], '同一 openid 复用同一用户' );

$refresh = Sutwx_Auth_Service::refresh( $login['data']['refreshToken'] );
check( $refresh['ok'], 'refresh token 可换取新 access token' );

$wrong_type = Sutwx_Auth_Service::refresh( $login['data']['token'] );
check( ! $wrong_type['ok'] && 'invalid_token_type' === $wrong_type['error'], '用 access token 刷新 → invalid_token_type' );

check( ! Sutwx_Auth_Service::refresh( 'not-a-token' )['ok'], '非法 refresh token 被拒' );

$access_payload = Sutwx_Jwt::decode( $login['data']['token'], Sutwx_Credentials::get_jwt_secret() )['payload'];
check( ! Sutwx_Auth_Service::is_revoked( $access_payload['jti'] ), '吊销前 jti 有效' );
Sutwx_Auth_Service::revoke( $access_payload );
check( Sutwx_Auth_Service::is_revoked( $access_payload['jti'] ), '吊销后 jti 进入黑名单' );

$revoked = Sutwx_Auth_Guard::authorize(
	new Fake_Rest_Request( array( 'Authorization' => 'Bearer ' . $login['data']['token'] ) )
);
check( ! $revoked['ok'] && 'token_revoked' === $revoked['error'], '已吊销 token 无法通过守卫' );

$valid = Sutwx_Auth_Guard::authorize(
	new Fake_Rest_Request( array( 'Authorization' => 'Bearer ' . $refresh['data']['token'] ) )
);
check( $valid['ok'], '新签发 token 通过守卫' );
check( (int) $valid['payload']['sub'] === (int) $login['data']['userInfo']['id'], '守卫解析出正确用户 ID' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );
