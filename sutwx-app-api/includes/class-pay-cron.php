<?php
/**
 * WP-Cron 掉单兜底（BE-012）：每 5 分钟扫描「待付款且有商户订单号」的订单，
 * 主动调查单接口同步支付状态 —— 覆盖 notify 丢失/延迟场景。
 *
 * 生命周期：
 * - init 时自愈式调度（未注册则注册，避免依赖激活时序）；
 * - deactivate 时清理定时任务（Loader::deactivate 调用 clear()）。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 掉单兜底定时查单。
 */
class Sutwx_Pay_Cron {

	/**
	 * 定时事件名。
	 */
	const EVENT = 'sutwx_pay_query_cron';

	/**
	 * 扫描间隔（秒）。
	 */
	const INTERVAL = 300;

	/**
	 * 单次扫描上限（防止首启积压拖垮请求）。
	 */
	const BATCH = 20;

	/**
	 * 注册 cron 事件与回调（init 自愈式调度）。
	 */
	public static function init() {
		if ( ! function_exists( 'add_action' ) ) {
			return;
		}
		add_action( self::EVENT, array( __CLASS__, 'sync_pending' ) );
		add_action( 'init', array( __CLASS__, 'schedule' ) );
	}

	/**
	 * 自愈式调度：事件未注册时补注册（激活、代码更新后自动恢复）。
	 */
	public static function schedule() {
		if ( ! function_exists( 'wp_next_scheduled' ) || ! function_exists( 'wp_schedule_event' ) ) {
			return;
		}
		if ( ! wp_next_scheduled( self::EVENT ) ) {
			wp_schedule_event( time() + self::INTERVAL, 'sutwx_5min', self::EVENT );
		}
	}

	/**
	 * 清理定时任务（插件停用时调用）。
	 */
	public static function clear() {
		if ( function_exists( 'wp_clear_scheduled_hook' ) ) {
			wp_clear_scheduled_hook( self::EVENT );
		}
	}

	/**
	 * 注册自定义 5 分钟间隔（WP-Cron 需显式提供 cron_schedules）。
	 *
	 * @param array $schedules 现有间隔表。
	 * @return array
	 */
	public static function intervals( $schedules ) {
		$schedules = is_array( $schedules ) ? $schedules : array();
		if ( ! isset( $schedules['sutwx_5min'] ) ) {
			$schedules['sutwx_5min'] = array(
				'interval' => self::INTERVAL,
				'display'  => __( '每 5 分钟（SutWxApp 掉单兜底）', 'sutwx-app-api' ),
			);
		}
		return $schedules;
	}

	/**
	 * 扫描待付款订单并调查单同步（notify 丢失兜底）。
	 *
	 * @return int 本次实际推进为已支付的订单数。
	 */
	public static function sync_pending() {
		if ( ! function_exists( 'wc_get_orders' ) || ! class_exists( 'Sutwx_Pay_Credentials' )
			|| ! Sutwx_Pay_Credentials::is_configured() ) {
			return 0;
		}

		$orders = wc_get_orders(
			array(
				'status'  => array( 'pending', 'on-hold' ),
				'limit'   => self::BATCH,
				'orderby' => 'date',
				'order'   => 'ASC',
			)
		);

		$paid = 0;
		foreach ( (array) $orders as $order ) {
			$out_trade_no = (string) $order->get_meta( Sutwx_Rest_Pay::META_OUT_TRADE_NO );
			if ( '' === $out_trade_no ) {
				continue; // 未发起过支付的订单不在兜底范围。
			}

			$query = Sutwx_Wechat_Pay::query_out_trade( $out_trade_no );
			if ( empty( $query['ok'] ) || empty( $query['trade_state'] ) ) {
				continue; // 查单失败下次再试。
			}

			if ( 'SUCCESS' === $query['trade_state'] ) {
				// 与 notify 同一落库通道（金额校验/幂等在 apply_paid 内统一保证）。
				$applied = Sutwx_Pay_Order_Sync::apply_paid(
					array(
						'out_trade_no'   => $out_trade_no,
						'trade_state'    => 'SUCCESS',
						'transaction_id' => isset( $query['transaction_id'] ) ? $query['transaction_id'] : '',
					)
				);
				if ( $applied ) {
					$paid++;
				}
			}
		}

		return $paid;
	}
}