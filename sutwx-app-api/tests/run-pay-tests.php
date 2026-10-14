<?php
/**
 * 微信支付 V3 签名/验签/解密/通知解析单测（独立运行，无需 WP/WC/微信环境）：
 *   php tests/run-pay-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖：待签串格式（5 行/3 行/4 行均含尾部换行）、RSA-SHA256 签名验签 roundtrip、
 *       Authorization 头构造、paySign 构造、AES-256-GCM 资源解密、通知验签+解密
 *       全链路与防篡改、错误文案映射（BE-007）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/stubs-runtime.php';

if ( ! defined( 'SUTWX_API_DIR' ) ) {
	define( 'SUTWX_API_DIR', dirname( __DIR__ ) . '/' );
}
if ( ! defined( 'SUTWX_API_VERSION' ) ) {
	define( 'SUTWX_API_VERSION', '0.5.0' );
}
if ( ! defined( 'SUTWX_API_REST_NS' ) ) {
	define( 'SUTWX_API_REST_NS', 'sutwx/v1' );
}
if ( ! defined( 'HOUR_IN_SECONDS' ) ) {
	define( 'HOUR_IN_SECONDS', 3600 );
}
if ( ! function_exists( 'home_url' ) ) {
	function home_url( $path = '' ) {
		return 'https://example.com' . $path;
	}
}
if ( ! function_exists( 'wp_json_encode_safe' ) ) {
	function wp_json_encode_safe( $data ) {
		$json = json_encode( $data );
		return false === $json ? '' : $json;
	}
}

require dirname( __DIR__ ) . '/includes/class-credentials.php';
require dirname( __DIR__ ) . '/includes/class-pay-credentials.php';
require dirname( __DIR__ ) . '/includes/class-wechat-pay-sign.php';
require dirname( __DIR__ ) . '/includes/class-wechat-pay-util.php';
require dirname( __DIR__ ) . '/includes/class-wechat-pay.php';
require dirname( __DIR__ ) . '/includes/class-wechat-pay-notify.php';

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

// ---------------------------------------------------------------------------
// 测试密钥对（商户 API 证书私钥 + 对应公钥充当平台证书）
// ---------------------------------------------------------------------------

$res = openssl_pkey_new(
	array(
		'private_key_bits' => 2048,
		'private_key_type' => OPENSSL_KEYTYPE_RSA,
	)
);
if ( ! $res ) {
	echo "openssl 不可用，跳过支付单测\n";
	exit( 0 );
}
openssl_pkey_export( $res, $private_key_pem );
$public_key_pem = openssl_pkey_get_details( $res )['key'];

update_option( 'sutwx_pay_credentials', array(
	'mchId'      => '1900007291',
	'serialNo'   => '408B07E79B8269FEC3D5D3E6AB8ED163A6A380DB',
	'privateKey' => $private_key_pem,
	'apiV3Key'   => 'abcdefghijklmnopqrstuvwxyz012345',
) );
update_option( 'sutwx_credentials', array( 'appId' => 'wx2421b1c4370ec43b' ) );

echo "== 凭证读取 ==\n";

check( '1900007291' === Sutwx_Pay_Credentials::get_mch_id(), '商户号读取' );
check( 'wx2421b1c4370ec43b' === Sutwx_Credentials::get_app_id(), '小程序 AppID 读取' );
check( Sutwx_Pay_Credentials::is_configured(), '支付凭证配置完整判定' );
check( false === strpos( Sutwx_Pay_Credentials::get_platform_cert(), 'BEGIN' ), '未缓存平台证书时返回空' );
check( Sutwx_Pay_Credentials::set_platform_cert( $public_key_pem ), '平台证书缓存写入' );
check( false !== strpos( Sutwx_Pay_Credentials::get_platform_cert(), 'BEGIN PUBLIC KEY' ), '平台证书缓存读取' );

echo "== 待签串格式 ==\n";

$auth_msg = Sutwx_Wechat_Pay_Sign::authorization_message( 'post', '/v3/pay/transactions/jsapi', '1554208460', 'ABC123', '{"a":1}' );
check( "POST\n/v3/pay/transactions/jsapi\n1554208460\nABC123\n{\"a\":1}\n" === $auth_msg, '接口待签串 5 行（含尾部换行，方法大写）' );

$notify_msg = Sutwx_Wechat_Pay_Sign::notify_message( '1554208460', 'ABC123', '{"id":"x"}' );
check( "1554208460\nABC123\n{\"id\":\"x\"}\n" === $notify_msg, '通知待签串 3 行（含尾部换行）' );

$pay_msg = Sutwx_Wechat_Pay_Sign::pay_sign_message( 'wx2421b1c4370ec43b', '1554208460', 'ABC123', 'prepay_id=wx201410272009395522657a690389285100' );
check( "wx2421b1c4370ec43b\n1554208460\nABC123\nprepay_id=wx201410272009395522657a690389285100\n" === $pay_msg, 'paySign 待签串 4 行（含尾部换行，不含 signType）' );

echo "== 签名与验签 ==\n";

$signature = Sutwx_Wechat_Pay_Sign::sign( $pay_msg, $private_key_pem );
check( '' !== $signature && base64_decode( $signature, true ) !== false, 'RSA-SHA256 签名输出 Base64' );
check( Sutwx_Wechat_Pay_Sign::verify( $pay_msg, $signature, $public_key_pem ), '对应公钥验签通过' );
check( ! Sutwx_Wechat_Pay_Sign::verify( $pay_msg . 'x', $signature, $public_key_pem ), '篡改报文验签失败' );
check( ! Sutwx_Wechat_Pay_Sign::verify( $pay_msg, $signature, 'not-a-cert' ), '非法证书验签失败' );
check( '' === Sutwx_Wechat_Pay_Sign::sign( $pay_msg, 'not-a-key' ), '非法私钥签名返回空' );

echo "== Authorization 头构造 ==\n";

$auth_header = Sutwx_Wechat_Pay_Sign::build_authorization( 'POST', 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi', '{"a":1}' );
check( 0 === strpos( $auth_header, 'WECHATPAY2-SHA256-RSA2048 mchid="1900007291"' ), 'Authorization 方案与商户号' );
check( false !== strpos( $auth_header, 'serial_no="408B07E79B8269FEC3D5D3E6AB8ED163A6A380DB"' ), 'Authorization 证书序列号' );

preg_match( '/nonce_str="([^"]+)",signature="([^"]+)",timestamp="([^"]+)"/', $auth_header, $m );
check( 3 === count( $m ), 'Authorization 含 nonce/signature/timestamp' );
if ( 3 === count( $m ) ) {
	$rebuild = Sutwx_Wechat_Pay_Sign::authorization_message( 'POST', 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi', $m[3], $m[1], '{"a":1}' );
	check( Sutwx_Wechat_Pay_Sign::verify( $rebuild, $m[2], $public_key_pem ), 'Authorization 签名可被对应公钥验签' );
}

echo "== 小程序调起支付参数 ==\n";

$pay_params = Sutwx_Wechat_Pay::build_pay_params( 'wx201410272009395522657a690389285100' );
check( 'RSA' === $pay_params['signType'], 'signType 固定 RSA' );
check( 'prepay_id=wx201410272009395522657a690389285100' === $pay_params['package'], 'package 为 prepay_id=xxx' );
check( 32 === strlen( $pay_params['nonceStr'] ), 'nonceStr 长度 32' );

$pay_sign_msg = Sutwx_Wechat_Pay_Sign::pay_sign_message( 'wx2421b1c4370ec43b', $pay_params['timeStamp'], $pay_params['nonceStr'], $pay_params['package'] );
check( Sutwx_Wechat_Pay_Sign::verify( $pay_sign_msg, $pay_params['paySign'], $public_key_pem ), 'paySign 验签通过（证明签名串格式一致）' );

echo "== 通知资源解密（AES-256-GCM） ==\n";

$key    = 'abcdefghijklmnopqrstuvwxyz012345';
$iv     = random_bytes( 12 );
$aad    = 'transaction';
$plain  = wp_json_encode_safe( array( 'out_trade_no' => 'SUT55T1554208460', 'trade_state' => 'SUCCESS' ) );
$tag    = '';
$cipher = openssl_encrypt( $plain, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, $aad );

$decrypted = Sutwx_Wechat_Pay_Sign::decrypt_resource( base64_encode( $cipher ), base64_encode( $iv ), $aad, $key );
check( $plain === $decrypted, 'AES-256-GCM 加解密 roundtrip' );
check( '' === Sutwx_Wechat_Pay_Sign::decrypt_resource( base64_encode( $cipher ), base64_encode( $iv ), 'wrong-aad', $key ), '关联数据不符解密失败' );
check( '' === Sutwx_Wechat_Pay_Sign::decrypt_resource( '!!!not-base64!!!', base64_encode( $iv ), $aad, $key ), '非法 Base64 密文返回空' );

echo "== 通知解析全链路 ==\n";

$notify_body = wp_json_encode_safe(
	array(
		'id'          => 'EV-1',
		'event_type'  => 'TRANSACTION.SUCCESS',
		'resource_type' => 'encrypt-resource',
		'resource'    => array(
			'original_type'   => 'transaction',
			'algorithm'       => 'AEAD_AES_256_GCM',
			'ciphertext'      => base64_encode( $cipher ),
			'associated_data' => $aad,
			'nonce'           => base64_encode( $iv ),
		),
	)
);
$ts      = (string) time();
$nonce   = Sutwx_Wechat_Pay_Sign::nonce();
$sig     = Sutwx_Wechat_Pay_Sign::sign( Sutwx_Wechat_Pay_Sign::notify_message( $ts, $nonce, $notify_body ), $private_key_pem );
$headers = array(
	'Wechatpay-Signature' => $sig,
	'Wechatpay-Timestamp' => $ts,
	'Wechatpay-Nonce'     => $nonce,
	'Wechatpay-Serial'    => '408B07E79B8269FEC3D5D3E6AB8ED163A6A380DB',
);

$parsed = Sutwx_Wechat_Pay_Notify::parse( $headers, $notify_body );
check( ! empty( $parsed['ok'] ), '合法通知验签+解密成功' );
check( isset( $parsed['data']['trade_state'] ) && 'SUCCESS' === $parsed['data']['trade_state'], '解密出交易状态' );
check( isset( $parsed['data']['_serial'] ) && '' !== $parsed['data']['_serial'], '通知携带证书序列号' );
check( array( 'code' => 'SUCCESS' ) === Sutwx_Wechat_Pay_Notify::receipt( true ), '回执 SUCCESS' );

$bad = $headers;
$bad['Wechatpay-Signature'] = 'tampered' . $sig;
$parsed_bad = Sutwx_Wechat_Pay_Notify::parse( $bad, $notify_body );
check( ! empty( $parsed_bad['error'] ) && 'signature_mismatch' === $parsed_bad['error'], '篡改签名被拒绝' );

$body_bad = str_replace( 'EV-1', 'EV-2', $notify_body );
$parsed_body = Sutwx_Wechat_Pay_Notify::parse( $headers, $body_bad );
check( 'signature_mismatch' === $parsed_body['error'], '篡改报文被拒绝（签名与报文绑定）' );

echo "== 错误文案归一化 ==\n";

check( '支付参数错误' === Sutwx_Wechat_Pay_Util::error_text( array( 'data' => array( 'code' => 'PARAM_ERROR' ) ) ), 'PARAM_ERROR 映射' );
check( '订单已支付' === Sutwx_Wechat_Pay_Util::error_text( array( 'data' => array( 'code' => 'ORDERPAID' ) ) ), 'ORDERPAID 映射' );
check( '支付服务暂时不可用，请稍后重试' === Sutwx_Wechat_Pay_Util::error_text( array( 'data' => array( 'code' => 'UNKNOWN' ) ) ), '未知错误走兜底文案' );
check( 'wechatpay-signature' === strtolower( 'Wechatpay-Signature' ) && 'v' === Sutwx_Wechat_Pay_Util::header_value( array( 'wechatpay-nonce' => 'v' ), 'Wechatpay-Nonce' ), '请求头大小写不敏感提取' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );
