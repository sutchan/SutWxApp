<?php
/**
 * 支付订单同步：归属校验、商户订单号反查与支付成功落库（BE-007，拆自 class-rest-pay.php）。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * 支付与订单状态同步。
 */
class Sutwx_Pay_Order_Sync {

	/**
	 * 商户订单号维度的互斥租约时长（秒）。请求异常中断时锁会残留，超时后自动可被接管。
	 */
	const LOCK_TTL = 30;

	/**
	 * 本请求持有的锁（避免误删其他请求持有的租约）。
	 *
	 * @var array<string,bool>
	 */
	private static $held_locks = array();

	/**
	 * 支付成功落库：状态流转 + 交易号回写（幂等，重复通知安全）。
	 *
	 * 处理期间按商户订单号加互斥租约：/pay/notify 与 /pay/query 可能同时到达
	 * （小程序支付成功回调会立即发起查单），若两个请求都读到「待付款」再各自推进状态，
	 * WooCommerce 的 _order_stock_reduced 标记是「先读后写」，库存会被重复扣减。
	 *
	 * @param array $data 解密后的通知数据（out_trade_no/trade_state/transaction_id/amount）。
	 * @return bool
	 */
	public static function apply_paid( $data ) {
		if ( empty( $data['out_trade_no'] ) || 'SUCCESS' !== ( isset( $data['trade_state'] ) ? $data['trade_state'] : '' ) ) {
			return true; // 非支付成功类通知直接确认收到。
		}

		$out_trade_no = (string) $data['out_trade_no'];
		if ( ! self::acquire_lock( $out_trade_no ) ) {
			// 另一请求正在处理该订单：让微信稍后重试，避免重复扣库存与重复状态流转。
			return false;
		}

		try {
			return self::apply_paid_locked( $data );
		} finally {
			self::release_lock( $out_trade_no );
		}
	}

	/**
	 * 持锁执行的落库逻辑。
	 *
	 * @param array $data 解密后的通知数据。
	 * @return bool
	 */
	private static function apply_paid_locked( $data ) {
		$order = self::order_by_out_trade_no( (string) $data['out_trade_no'] );
		if ( ! $order ) {
			return false;
		}

		// 金额校验：通知金额必须与订单金额一致（分）。
		$notify_fen = isset( $data['amount']['total'] ) ? (int) $data['amount']['total'] : 0;
		if ( $notify_fen !== (int) round( (float) $order->get_total() * 100 ) ) {
			return false;
		}

		// 仅「待付款类」状态可推进到「待发货」；已取消/已完成/已发货等终态
		// 不因旧通知重放而状态回退（重放只补写交易号，保持幂等）。
		$status = (string) $order->get_status();
		if ( in_array( $status, array( 'pending', 'on-hold', 'failed' ), true ) ) {
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
	 * 抢占商户订单号维度的互斥租约。
	 *
	 * 用 options 表的唯一键做原子 INSERT IGNORE：并发的第二个请求插入失败即视为未抢到锁。
	 * 无 $wpdb（单测/CLI）时退化为不互斥，保持可测试性。
	 *
	 * @param string $out_trade_no 商户订单号。
	 * @return bool
	 */
	private static function acquire_lock( $out_trade_no ) {
		global $wpdb;
		if ( empty( $wpdb ) || ! is_object( $wpdb ) || ! method_exists( $wpdb, 'query' ) ) {
			return true;
		}

		$name = self::lock_name( $out_trade_no );
		$now  = time();
		// 清理过期租约：请求异常中断时锁会残留。
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value < %d",
				$name,
				$now - self::LOCK_TTL
			)
		);
		$inserted = $wpdb->query(
			$wpdb->prepare(
				"INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'no')",
				$name,
				$now
			)
		);
		if ( 1 !== (int) $inserted ) {
			return false;
		}

		self::$held_locks[ $out_trade_no ] = true;
		return true;
	}

	/**
	 * 释放本请求持有的租约（只删除自己抢到的锁，避免误删他人租约）。
	 *
	 * @param string $out_trade_no 商户订单号。
	 */
	private static function release_lock( $out_trade_no ) {
		if ( empty( self::$held_locks[ $out_trade_no ] ) ) {
			return;
		}
		unset( self::$held_locks[ $out_trade_no ] );

		global $wpdb;
		if ( empty( $wpdb ) || ! is_object( $wpdb ) || ! method_exists( $wpdb, 'query' ) ) {
			return;
		}
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name = %s",
				self::lock_name( $out_trade_no )
			)
		);
	}

	/**
	 * 锁名（订单号哈希，避免超长 option_name 与特殊字符）。
	 *
	 * @param string $out_trade_no 商户订单号。
	 * @return string
	 */
	private static function lock_name( $out_trade_no ) {
		return 'sutwx_pay_lock_' . md5( (string) $out_trade_no );
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
