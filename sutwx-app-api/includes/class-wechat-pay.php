<?php
/**
 * 微信支付 V3 API 客户端：JSAPI 预支付与调起支付参数（BE-007）。
 *
 * 交易查询/退款委托 class-wechat-pay-trade.php，通知解析见 class-wechat-pay-notify.php。
 * 网络层使用 wp_remote_request（无 WP 环境时由单测桩替换，不直连微信）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 微信支付 V3 客户端。
 */
class Sutwx_Wechat_Pay {

	/**
	 * API 基础地址。
	 */
	const BASE_URL = 'https://api.mch.weixin.qq.com/v3';

	/**
	 * JSAPI 预支付（小程序下单）。
	 *
	 * @param string $openid      用户 openid。
	 * @param string $order_no    商户订单号（out_trade_no）。
	 * @param int    $amount_fen  金额（分）。
	 * @param string $description 商品描述。
	 * @param string $notify_url  回调地址。
	 * @return array{ok:bool,prepay_id:string,error:string}
	 */
	public static function jsapi_prepay( $openid, $order_no, $amount_fen, $description, $notify_url ) {
		$body = array(
			'appid'       => Sutwx_Credentials::get_app_id(),
			'mchid'       => Sutwx_Pay_Credentials::get_mch_id(),
			'description' => (string) $description,
			'out_trade_no' => (string) $order_no,
			'notify_url'  => (string) $notify_url,
			'amount'      => array(
				'total'    => (int) $amount_fen,
				'currency' => 'CNY',
			),
			'payer'       => array( 'openid' => (string) $openid ),
		);

		$result = self::request( 'POST', '/pay/transactions/jsapi', $body );
		if ( ! $result['ok'] ) {
			return array(
				'ok'        => false,
				'prepay_id' => '',
				'error'     => Sutwx_Wechat_Pay_Util::error_text( $result ),
			);
		}

		$prepay_id = isset( $result['data']['prepay_id'] ) ? (string) $result['data']['prepay_id'] : '';
		if ( '' === $prepay_id ) {
			return array( 'ok' => false, 'prepay_id' => '', 'error' => 'prepay_id_missing' );
		}

		return array( 'ok' => true, 'prepay_id' => $prepay_id, 'error' => '' );
	}

	/**
	 * 构造小程序 wx.requestPayment 参数（含二次签名 paySign）。
	 *
	 * @param string $prepay_id 预支付会话标识。
	 * @return array{timeStamp:string,nonceStr:string,package:string,signType:string,paySign:string}
	 */
	public static function build_pay_params( $prepay_id ) {
		$app_id    = Sutwx_Credentials::get_app_id();
		$timestamp = (string) time();
		$nonce     = Sutwx_Wechat_Pay_Sign::nonce();
		$package   = 'prepay_id=' . (string) $prepay_id;

		$message   = Sutwx_Wechat_Pay_Sign::pay_sign_message( $app_id, $timestamp, $nonce, $package );
		$pay_sign  = Sutwx_Wechat_Pay_Sign::sign( $message, Sutwx_Pay_Credentials::get_private_key() );

		return array(
			'timeStamp' => $timestamp,
			'nonceStr'  => $nonce,
			'package'   => $package,
			'signType'  => 'RSA',
			'paySign'   => $pay_sign,
		);
	}

	/**
	 * 商户订单号查询与退款（委托交易模块，保持对外调用不变）。
	 *
	 * @param string $order_no 商户订单号。
	 * @return array{ok:bool,trade_state:string,transaction_id:string,error:string}
	 */
	public static function query_out_trade( $order_no ) {
		return Sutwx_Wechat_Pay_Trade::query_out_trade( $order_no );
	}

	/**
	 * 退款（需真实商户资质联调）。
	 *
	 * @param string $order_no    商户订单号。
	 * @param string $refund_no   商户退款单号。
	 * @param int    $total_fen   原单金额（分）。
	 * @param int    $refund_fen  退款金额（分）。
	 * @param string $notify_url  退款回调地址。
	 * @return array{ok:bool,error:string}
	 */
	public static function refund( $order_no, $refund_no, $total_fen, $refund_fen, $notify_url ) {
		return Sutwx_Wechat_Pay_Trade::refund( $order_no, $refund_no, $total_fen, $refund_fen, $notify_url );
	}

	/**
	 * 统一请求封装（Authorization 自动签名；交易模块复用）。
	 *
	 * @param string $method HTTP 方法。
	 * @param string $path   /v3 下的路径（GET 含 query）。
	 * @param array|string $body 请求体。
	 * @return array{ok:bool,status:int,data:array}
	 */
	public static function request( $method, $path, $body ) {
		$url      = self::BASE_URL . $path;
		$json     = is_array( $body ) ? wp_json_encode_safe( $body ) : (string) $body;
		$auth     = Sutwx_Wechat_Pay_Sign::build_authorization( $method, $url, $json );

		if ( '' === $auth ) {
			return array( 'ok' => false, 'status' => 0, 'data' => array() );
		}

		$response = wp_remote_request(
			$url,
			array(
				'method'  => strtoupper( (string) $method ),
				'timeout' => 15,
				'headers' => array(
					'Authorization' => $auth,
					'Accept'        => 'application/json',
					'Content-Type'  => 'application/json',
					'User-Agent'    => 'SutWxApp-API/' . SUTWX_API_VERSION,
				),
				'body'    => '' === $json ? null : $json,
			)
		);

		if ( is_wp_error( $response ) ) {
			return array( 'ok' => false, 'status' => 0, 'data' => array() );
		}

		$status = (int) wp_remote_retrieve_response_code( $response );
		$raw    = (string) wp_remote_retrieve_body( $response );
		$data   = json_decode( $raw, true );

		return array(
			'ok'     => $status >= 200 && $status < 300 && is_array( $data ),
			'status' => $status,
			'data'   => is_array( $data ) ? $data : array(),
		);
	}

	/**
	 * 大小写不敏感取请求头（委托工具类，保持对外兼容）。
	 *
	 * @param array  $headers 请求头。
	 * @param string $name    头名。
	 * @return string
	 */
	public static function header_value( $headers, $name ) {
		return Sutwx_Wechat_Pay_Util::header_value( $headers, $name );
	}

	/**
	 * 错误归一化（委托工具类，保持对外兼容）。
	 *
	 * @param array $result request 结果。
	 * @return string
	 */
	public static function error_text( $result ) {
		return Sutwx_Wechat_Pay_Util::error_text( $result );
	}
}
