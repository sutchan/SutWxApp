<?php
/**
 * 支付订单同步：归属校验、商户订单号反查与支付成功落库（BE-007，拆自 class-rest-pay.php）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 支付与订单状态同步。
 */
class Sutwx_Pay_Order_Sync {

	/**
	 * 支付成功落库：状态流转 + 交易号回写（幂等，重复通知安全）。
	 *
	 * @param array $data 解密后的通知数据（out_trade_no/trade_state/transaction_id/amount）。
	 * @return bool
	 */
	public static function apply_paid( $data ) {
		if ( empty( $data['out_trade_no'] ) || 'SUCCESS' !== ( isset( $data['trade_state'] ) ? $data['trade_state'] : '' ) ) {
			return true; // 非支付成功类通知直接确认收到。
		}

		$order = self::order_by_out_trade_no( (string) $data['out_trade_no'] );
		if ( ! $order ) {
			return false;
		}

		// 金额校验：通知金额必须与订单金额一致（分）。
		$notify_fen = isset( $data['amount']['total'] ) ? (int) $data['amount']['total'] : 0;
		if ( $notify_fen !== (int) round( (float) $order->get_total() * 100 ) ) {
			return false;
		}

		if ( 'processing' !== (string) $order->get_status() ) {
			$order->set_payment_method_title( __( '微信支付', 'sutwx-app-api' ) );
			$order->set_date_paid( time() );
			$order->update_status( 'processing', __( '用户已完成支付', 'sutwx-app-api' ) );
		}
		if ( ! empty( $data['transaction_id'] ) ) {
			$order->update_meta_data( Sutwx_Rest_Pay::META_TRANSACTION_ID, (string) $data['transaction_id'] );
		}
		$order->save();

		return true;
	}

	/**
	 * 取指定用户的订单（越权返回 null）。
	 *
	 * @param int $user_id 用户 ID。
	 * @param int $order_id 订单 ID。
	 * @return object|null
	 */
	public static function own_order( $user_id, $order_id ) {
		if ( $user_id <= 0 || $order_id <= 0 || ! function_exists( 'wc_get_order' ) ) {
			return null;
		}
		$order = wc_get_order( $order_id );
		if ( ! $order || (int) $order->get_customer_id() !== $user_id ) {
			return null;
		}
		return $order;
	}

	/**
	 * 按商户订单号反查订单。
	 *
	 * @param string $out_trade_no 商户订单号。
	 * @return object|null
	 */
	public static function order_by_out_trade_no( $out_trade_no ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return null;
		}
		$result = wc_get_orders(
			array(
				'limit'      => 1,
				'meta_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'   => Sutwx_Rest_Pay::META_OUT_TRADE_NO,
						'value' => (string) $out_trade_no,
					),
				),
			)
		);
		return ! empty( $result[0] ) ? $result[0] : null;
	}
}
