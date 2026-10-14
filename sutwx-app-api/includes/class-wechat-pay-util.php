<?php
/**
 * 微信支付通用工具：请求头提取与错误文案归一化（拆自 class-wechat-pay.php，BE-007）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 支付通用工具。
 */
class Sutwx_Wechat_Pay_Util {

	/**
	 * 大小写不敏感取请求头。
	 *
	 * @param array  $headers 请求头。
	 * @param string $name    头名。
	 * @return string
	 */
	public static function header_value( $headers, $name ) {
		foreach ( (array) $headers as $key => $value ) {
			if ( strtolower( (string) $key ) === strtolower( $name ) ) {
				return is_array( $value ) ? (string) reset( $value ) : (string) $value;
			}
		}
		return '';
	}

	/**
	 * 错误归一化：微信 code 映射为安全文案（不回显原始细节）。
	 *
	 * @param array $result request 结果。
	 * @return string
	 */
	public static function error_text( $result ) {
		$code = isset( $result['data']['code'] ) ? (string) $result['data']['code'] : '';
		$map  = array(
			'PARAM_ERROR'       => '支付参数错误',
			'ORDERPAID'         => '订单已支付',
			'ORDERCLOSED'       => '订单已关闭',
			'NOTENOUGH'         => '余额不足',
			'OUT_TRADE_NO_USED' => '商户订单号重复',
			'NOAUTH'            => '商户未开通支付权限',
			'SIGN_ERROR'        => '支付签名错误',
		);
		if ( isset( $map[ $code ] ) ) {
			return $map[ $code ];
		}
		return '支付服务暂时不可用，请稍后重试';
	}
}
