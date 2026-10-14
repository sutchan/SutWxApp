<?php
/**
 * 微信支付 V3 交易查询与退款（BE-007，拆自 class-wechat-pay.php）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 交易查询与退款。
 */
class Sutwx_Wechat_Pay_Trade {

	/**
	 * 按商户订单号查询订单状态。
	 *
	 * @param string $order_no 商户订单号。
	 * @return array{ok:bool,trade_state:string,transaction_id:string,error:string}
	 */
	public static function query_out_trade( $order_no ) {
		$mch_id = Sutwx_Pay_Credentials::get_mch_id();
		$path   = '/pay/transactions/out-trade-number/' . rawurlencode( (string) $order_no ) . '?mchid=' . rawurlencode( $mch_id );

		$result = Sutwx_Wechat_Pay::request( 'GET', $path, '' );
		if ( ! $result['ok'] ) {
			return array(
				'ok'             => false,
				'trade_state'    => '',
				'transaction_id' => '',
				'error'          => Sutwx_Wechat_Pay_Util::error_text( $result ),
			);
		}

		return array(
			'ok'             => true,
			'trade_state'    => isset( $result['data']['trade_state'] ) ? (string) $result['data']['trade_state'] : '',
			'transaction_id' => isset( $result['data']['transaction_id'] ) ? (string) $result['data']['transaction_id'] : '',
			'error'          => '',
		);
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
		$body = array(
			'out_trade_no'  => (string) $order_no,
			'out_refund_no' => (string) $refund_no,
			'notify_url'    => (string) $notify_url,
			'amount'        => array(
				'refund'   => (int) $refund_fen,
				'total'    => (int) $total_fen,
				'currency' => 'CNY',
			),
		);

		$result = Sutwx_Wechat_Pay::request( 'POST', '/refund/domestic/refunds', $body );
		if ( ! $result['ok'] ) {
			return array( 'ok' => false, 'error' => Sutwx_Wechat_Pay_Util::error_text( $result ) );
		}

		return array( 'ok' => true, 'error' => '' );
	}
}
