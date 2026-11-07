<?php
/**
 * 支付落库单元测试（独立运行，无需 WP/WC 环境）：
 *   php tests/run-pay-sync-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖：通知回执 HTTP 状态码、金额交叉校验、重复通知幂等、
 *       并发生成同一订单的第二次处理被互斥租约拦截（BE-007 缺陷回归）。
 *
 * @package SutwxAppApi
 * @version 0.5.4
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/stubs-runtime.php';

if ( ! defined( 'SUTWX_API_DIR' ) ) {
	define( 'SUTWX_API_DIR', dirname( __DIR__ ) . '/' );
}

// 仅声明常量载体，避免加载完整的 REST 控制器依赖链。
if ( ! class_exists( 'Sutwx_Rest_Pay' ) ) {
	class Sutwx_Rest_Pay {
		const META_OUT_TRADE_NO   = '_sutwx_out_trade_no';
		const META_TRANSACTION_ID = '_sutwx_transaction_id';
	}
}

require dirname( __DIR__ ) . '/includes/class-wechat-pay-notify.php';
require dirname( __DIR__ ) . '/includes/class-pay-order-sync.php';

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

/**
 * 假订单：记录状态流转次数，用于验证幂等与并发拦截。
 */
class Fake_Paid_Order {
	public $status   = 'pending';
	public $transitions = 0;
	public $saves    = 0;
	public $total    = 100.0;
	public $meta     = array();

	public function get_id() {
		return 1001;
	}
	public function get_total() {
		return $this->total;
	}
	public function get_status() {
		return $this->status;
	}
	public function set_payment_method_title( $title ) {
		return $this;
	}
	public function set_date_paid( $time ) {
		return $this;
	}
	public function update_status( $status, $note = '' ) {
		$this->status = $status;
		$this->transitions++;
		return $this;
	}
	public function update_meta_data( $key, $value ) {
		$this->meta[ $key ] = $value;
		return $this;
	}
	public function save() {
		$this->saves++;
		return $this->get_id();
	}
}

$GLOBALS['fake_paid_order'] = new Fake_Paid_Order();

if ( ! function_exists( 'wc_get_orders' ) ) {
	function wc_get_orders( $args ) {
		return array( $GLOBALS['fake_paid_order'] );
	}
}

/**
 * 假 $wpdb：用进程内数组模拟 options 表的唯一键 INSERT IGNORE + SELECT + 归属校验。
 */
class Fake_WPDB {
	public $options   = 'wp_options';
	public $rows      = array();
	private $last_args = array();

	public function prepare( $query, ...$args ) {
		$this->last_args = $args;
		return $query;
	}

	public function get_var( $query ) {
		$args = $this->last_args;
		$name = (string) $args[0];
		return isset( $this->rows[ $name ] ) ? (string) $this->rows[ $name ] : null;
	}

	public function query( $query ) {
		$args = $this->last_args;
		if ( false !== strpos( $query, 'INSERT IGNORE' ) ) {
			$name  = (string) $args[0];
			$value = (string) $args[1];
			if ( isset( $this->rows[ $name ] ) ) {
				return 0; // 唯一键冲突：未抢到锁。
			}
			$this->rows[ $name ] = $value;
			return 1;
		}
		if ( false !== strpos( $query, 'DELETE' ) ) {
			$name = (string) $args[0];
			if ( count( $args ) >= 2 ) {
				$expected = (string) $args[1];
				if ( isset( $this->rows[ $name ] ) && (string) $this->rows[ $name ] === $expected ) {
					unset( $this->rows[ $name ] );
					return 1;
				}
				return 0; // value 不匹配，不删除。
			}
			if ( isset( $this->rows[ $name ] ) ) {
				unset( $this->rows[ $name ] );
			}
			return 1;
		}
		return 0;
	}
}

$GLOBALS['wpdb'] = new Fake_WPDB();

$acquire = new ReflectionMethod( 'Sutwx_Pay_Order_Sync', 'acquire_lock' );
$release = new ReflectionMethod( 'Sutwx_Pay_Order_Sync', 'release_lock' );
$acquire->setAccessible( true );
$release->setAccessible( true );

echo "== 通知回执状态码 ==\n";

check( 200 === Sutwx_Wechat_Pay_Notify::receipt_status( true ), '处理成功 → HTTP 200' );
check( 500 === Sutwx_Wechat_Pay_Notify::receipt_status( false ), '处理失败 → HTTP 500（微信才会重试）' );

echo "== 金额校验与幂等 ==\n";

$order = $GLOBALS['fake_paid_order'];

$paid = array(
	'out_trade_no'   => 'SUT1001XABCDEF12',
	'trade_state'    => 'SUCCESS',
	'transaction_id' => '4200000000202601010000000001',
	'amount'         => array( 'total' => 10000 ),
);
check( true === Sutwx_Pay_Order_Sync::apply_paid( $paid ), '金额一致 → 落库成功' );
check( 'processing' === $order->status, '待付款 → 待发货' );
check( 1 === $order->transitions, '首次通知只发生一次状态流转' );
check( '4200000000202601010000000001' === $order->meta[ Sutwx_Rest_Pay::META_TRANSACTION_ID ], '交易号已回写' );

check( true === Sutwx_Pay_Order_Sync::apply_paid( $paid ), '重复通知仍返回成功（幂等）' );
check( 1 === $order->transitions, '重复通知不再发生状态流转（库存不会被二次扣减）' );

$order->status = 'pending';
$mismatch      = $paid;
$mismatch['amount']['total'] = 1;
check( false === Sutwx_Pay_Order_Sync::apply_paid( $mismatch ), '金额不一致 → 拒绝落库' );
check( 'pending' === $order->status, '金额不一致时状态不变' );
$order->status = 'processing';

echo "== 并发互斥租约 ==\n";

$out_trade_no = 'SUT1001XABCDEF12';
$lock_key     = 'sutwx_pay_lock_' . md5( $out_trade_no );

check( true === $acquire->invoke( null, $out_trade_no ), '首个请求抢到锁' );
check( false === $acquire->invoke( null, $out_trade_no ), '并发第二个请求抢锁失败' );
check( isset( $GLOBALS['wpdb']->rows[ $lock_key ] ), '租约已写入 options 表' );

$release->invoke( null, 'SUT9999XOTHER' ); // 释放未持有的锁：应为空操作。
check( isset( $GLOBALS['wpdb']->rows[ $lock_key ] ), '释放未持有的锁不会误删他人租约' );

$release->invoke( null, $out_trade_no );
check( ! isset( $GLOBALS['wpdb']->rows[ $lock_key ] ), '释放后租约被清理' );

// 并发场景：锁被其他请求持有时，apply_paid 应返回 false（让微信重试）且不改订单。
$acquire->invoke( null, $out_trade_no );
$order->status = 'pending';
$order->transitions = 0;
check( false === Sutwx_Pay_Order_Sync::apply_paid( $paid ), '锁被占用时本次处理返回失败（触发微信重试）' );
check( 0 === $order->transitions, '锁被占用时不发生状态流转（避免重复扣库存）' );
$release->invoke( null, $out_trade_no );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );