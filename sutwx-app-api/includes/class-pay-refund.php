<?php
/**
 * 退款服务（BE-014）：已支付订单取消时发起微信退款，回调更新订单状态为已退款（5）。
 *
 * 金额规则（SEC-002）：退款金额上限 = 订单实付金额；当前业务为整单退款，
 * refund_fen 恒等于实付，不接受客户端传入金额。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 微信退款与订单状态同步。
 */
class Sutwx_Pay_Refund {

	/**
	 * 订单 meta：商户退款单号。
	 */
	const META_REFUND_NO = '_sutwx_refund_no';

	/**
	 * 发起整单退款（实付金额全额退回）。
	 *
	 * @param object $order WC_Order。
	 * @return array{ok:bool,error:string}
	 */
	public static function refund_order( $order ) {
		if ( ! $order || ! function_exists( 'wc_get_order' ) ) {
			return array( 'ok' => false, 'error' => 'order_missing' );
		}

		$out_trade_no = (string) $order->get_meta( Sutwx_Rest_Pay::META_OUT_TRADE_NO );
		if ( '' === $out_trade_no ) {
			return array( 'ok' => false, 'error' => 'out_trade_no_missing' );
		}

		// 已在退款流程中则幂等返回成功（重复点击取消）。
		$refund_no = (string) $order->get_meta( self::META_REFUND_NO );
		if ( '' !== $refund_no ) {
			return array( 'ok' => true, 'error' => '' );
		}

		$total_fen  = (int) round( (float) $order->get_total() * 100 );
		$refund_fen = $total_fen; // 整单退款：上限即实付（SEC-002）。
		if ( $total_fen <= 0 || $refund_fen > $total_fen ) {
			return array( 'ok' => false, 'error' => 'refund_amount_invalid' );
		}

		$refund_no = 'rf' . $order->get_id() . '' . gmdate( 'YmdHis' );
		$notify_url = home_url( '/api/pay/refund-notify' );
		$result     = Sutwx_Wechat_Pay::refund( $out_trade_no, $refund_no, $total_fen, $refund_fen, $notify_url );

		if ( empty( $result['ok'] ) ) {
			return array( 'ok' => false, 'error' => isset( $result['error'] ) ? (string) $result['error'] : 'refund_request_failed' );
		}

		$order->update_meta_data( self::META_REFUND_NO, $refund_no );
		$order->update_status( 'refunded', __( '用户取消已支付订单，退款已受理', 'sutwx-app-api' ) );
		$order->save();

		return array( 'ok' => true, 'error' => '' );
	}

	/**
	 * 退款回调落库：校验退款单号归属与状态后置「已退款」（幂等）。
	 *
	 * @param array $data 解密后的退款通知（out_refund_no/refund_status/out_trade_no）。
	 * @return bool
	 */
	public static function apply_refund_notified( $data ) {
		$refund_no     = isset( $data['out_refund_no'] ) ? (string) $data['out_refund_no'] : '';
		$refund_status = isset( $data['refund_status'] ) ? (string) $data['refund_status'] : '';
		if ( '' === $refund_no || 'SUCCESS' !== $refund_status ) {
			return true; // 非成功类回调直接确认。
		}

		$order = self::by_refund_no( $refund_no );
		if ( ! $order ) {
			return false;
		}

		// 幂等：已是 refunded 不重复流转。
		if ( 'refunded' !== (string) $order->get_status() ) {
			$order->update_status( 'refunded', __( '微信退款成功回调', 'sutwx-app-api' ) );
			$order->save();
		}

		return true;
	}

	/**
	 * 按商户退款单号反查订单。
	 *
	 * @param string $refund_no 商户退款单号。
	 * @return object|null
	 */
	public static function by_refund_no( $refund_no ) {
		if ( ! function_exists( 'wc_get_orders' ) || '' === (string) $refund_no ) {
			return null;
		}
		$result = wc_get_orders(
			array(
				'limit'      => 1,
				'meta_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'   => self::META_REFUND_NO,
						'value' => (string) $refund_no,
					),
				),
			)
		);
		return ! empty( $result[0] ) ? $result[0] : null;
	}
}