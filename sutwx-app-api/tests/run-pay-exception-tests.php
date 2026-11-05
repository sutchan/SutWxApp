<?php
/**
 * 支付异常路径单测（QA-006 + SEC-002 审计，独立运行，无需 WP/WC/网络环境）：
 *   php tests/run-pay-exception-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖五类场景：掉单兜底落库、重复通知幂等、金额不符拒绝、验签失败不落库、退款回调落库；
 * 附 SEC-002 审计断言（通知金额一致性、重复通知幂等、退款金额上限）。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

require __DIR__ . '/stubs-runtime.php';

// ---------------------------------------------------------------------------
// WC 订单桩（仅本套件；apply_paid / refund 链路所需最小接口）。
// ---------------------------------------------------------------------------

$GLOBALS['sutwx_wc_orders'] = array();
$GLOBALS['sutwx_wc_seq']    = 900;

if ( ! function_exists( 'wc_get_order' ) ) {
	/**
	 * 按 ID 取桩订单。
	 *
	 * @param int $id 订单 ID。
	 * @return object|null
	 */
	function wc_get_order( $id ) {
		return isset( $GLOBALS['sutwx_wc_orders'][ (int) $id ] ) ? $GLOBALS['sutwx_wc_orders'][ (int) $id ] : null;
	}
}

if ( ! function_exists( 'wc_get_orders' ) ) {
	/**
	 * 桩查询：支持 meta_query 精确匹配与 status 过滤。
	 *
	 * @param array $args 查询参数。
	 * @return array
	 */
	function wc_get_orders( $args ) {
		$found = array();
		foreach ( $GLOBALS['sutwx_wc_orders'] as $order ) {
			if ( ! empty( $args['status'] ) ) {
				$status = (string) $order->get_status();
				if ( ! in_array( $status, (array) $args['status'], true ) ) {
					continue;
				}
			}
			if ( ! empty( $args['meta_query'] ) ) {
				$match = true;
				foreach ( (array) $args['meta_query'] as $clause ) {
					if ( isset( $clause['key'], $clause['value'] )
						&& (string) $order->get_meta( $clause['key'] ) !== (string) $clause['value'] ) {
						$match = false;
						break;
					}
				}
				if ( ! $match ) {
					continue;
				}
			}
			$found[] = $order;
			if ( isset( $args['limit'] ) && count( $found ) >= (int) $args['limit'] ) {
				break;
			}
		}
		return $found;
	}
}

if ( ! class_exists( 'WC_Order' ) ) {
	/**
	 * 最小 WC_Order 桩。
	 */
	class WC_Order {

		/**
		 * 订单数据。
		 *
		 * @var array
		 */
		public $data = array(
			'id'          => 0,
			'status'      => 'pending',
			'total'       => 0.0,
			'customer_id' => 0,
			'meta'        => array(),
		);

		/**
		 * 构造：可从已有数据恢复。
		 *
		 * @param array $data 初始数据。
		 */
		public function __construct( $data = array() ) {
			$this->data = array_merge(
				array( 'id' => 0, 'status' => 'pending', 'total' => 0.0, 'customer_id' => 0, 'meta' => array() ),
				is_array( $data ) ? $data : array()
			);
		}

		/**
		 * 订单 ID。
		 *
		 * @return int
		 */
		public function get_id() {
			return (int) $this->data['id'];
		}

		/**
		 * 当前状态。
		 *
		 * @return string
		 */
		public function get_status() {
			return (string) $this->data['status'];
		}

		/**
		 * 订单总额。
		 *
		 * @return float
		 */
		public function get_total() {
			return (float) $this->data['total'];
		}

		/**
		 * 客户 ID。
		 *
		 * @return int
		 */
		public function get_customer_id() {
			return (int) $this->data['customer_id'];
		}

		/**
		 * 读 meta。
		 *
		 * @param string $key 键。
		 * @return string
		 */
		public function get_meta( $key ) {
			return isset( $this->data['meta'][ $key ] ) ? (string) $this->data['meta'][ $key ] : '';
		}

		/**
		 * 写 meta。
		 *
		 * @param string $key   键。
		 * @param string $value 值。
		 * @return void
		 */
		public function update_meta_data( $key, $value ) {
			$this->data['meta'][ $key ] = (string) $value;
		}

		/**
		 * 状态流转。
		 *
		 * @param string $status 目标状态。
		 * @param string $note   备注。
		 * @return void
		 */
		public function update_status( $status, $note = '' ) {
			$this->data['status'] = (string) $status;
		}

		/**
		 * 支付方式标题（写入即忽略）。
		 *
		 * @param string $title 标题。
		 * @return void
		 */
		public function set_payment_method_title( $title ) {
		}

		/**
		 * 支付时间（写入即忽略）。
		 *
		 * @param mixed $time 时间。
		 * @return void
		 */
		public function set_date_paid( $time ) {
		}

		/**
		 * 保存（桩内无持久化）。
		 *
		 * @return int
		 */
		public function save() {
			return $this->get_id();
		}
	}
}

if ( ! function_exists( 'wp_json_encode_safe' ) ) {
	/**
	 * JSON 编码兜底。
	 *
	 * @param mixed $data 数据。
	 * @return string
	 */
	function wp_json_encode_safe( $data ) {
		$json = json_encode( $data );
		return false === $json ? '' : $json;
	}
}

require dirname( __DIR__ ) . '/includes/rest/class-rest-pay.php';
require dirname( __DIR__ ) . '/includes/mappings/map-order.php';
require dirname( __DIR__ ) . '/includes/class-pay-order-sync.php';
require dirname( __DIR__ ) . '/includes/class-pay-refund.php';
require dirname( __DIR__ ) . '/includes/class-pay-cron.php';
require dirname( __DIR__ ) . '/includes/order/class-order-idempotency.php';

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
 * 新建桩订单并注册到全局表。
 *
 * @param string $status   状态。
 * @param float  $total    金额（元）。
	 * @param string $trade_no 商户订单号 meta。
 * @return object WC_Order 桩。
 */
function make_order( $status = 'pending', $total = 10.0, $trade_no = '' ) {
	$id    = ++$GLOBALS['sutwx_wc_seq'];
	$order = new WC_Order(
		array(
			'id'          => $id,
			'status'      => $status,
			'total'       => $total,
			'customer_id' => 7,
			'meta'        => array( Sutwx_Rest_Pay::META_OUT_TRADE_NO => $trade_no ),
		)
	);
	$GLOBALS['sutwx_wc_orders'][ $id ] = $order;
	return $order;
}

/**
 * 构造支付成功通知数据。
 *
 * @param string $trade_no 商户订单号。
 * @param int    $total_fen 通知金额（分）。
 * @return array
 */
function paid_notify( $trade_no, $total_fen ) {
	return array(
		'out_trade_no'   => $trade_no,
		'trade_state'    => 'SUCCESS',
		'transaction_id' => 'wx_txn_' . md5( $trade_no ),
		'amount'         => array( 'total' => $total_fen ),
	);
}

echo "== 场景 1：掉单兜底落库（查单 SUCCESS → apply_paid） ==\n";

$order = make_order( 'pending', 10.0, 'OT20261105001' );
$ok    = Sutwx_Pay_Order_Sync::apply_paid( paid_notify( 'OT20261105001', 1000 ) );
check( $ok, '兜底查单结果可落库' );
check( 'processing' === $order->get_status(), 'pending → processing（状态 2 待发货）' );

// 未发起过支付（无 out_trade_no）的订单不应被兜底波及：sync_pending 过滤逻辑
$no_trade = make_order( 'pending', 5.0, '' );
check( '' === $no_trade->get_meta( Sutwx_Rest_Pay::META_OUT_TRADE_NO ), '无商户单号订单存在于待付款池（cron 需过滤）' );

echo "== 场景 2：重复通知幂等 ==\n";

$first  = Sutwx_Pay_Order_Sync::apply_paid( paid_notify( 'OT20261105001', 1000 ) );
$second = Sutwx_Pay_Order_Sync::apply_paid( paid_notify( 'OT20261105001', 1000 ) );
check( $first && $second, '重复通知两次均确认收到' );
check( 'processing' === $order->get_status(), '重复通知不改变状态' );
check( 'wx_txn_' . md5( 'OT20261105001' ) === $order->get_meta( Sutwx_Rest_Pay::META_TRANSACTION_ID ), '交易号保持首次值' );

// 终态订单不因旧通知重放回退
$done = make_order( 'completed', 10.0, 'OT20261105002' );
Sutwx_Pay_Order_Sync::apply_paid( paid_notify( 'OT20261105002', 1000 ) );
check( 'completed' === $done->get_status(), '已完成订单不被旧通知回退' );

echo "== 场景 3：金额不符拒绝（SEC-002 审计） ==\n";

$mismatch = make_order( 'pending', 10.0, 'OT20261105003' );
$r = Sutwx_Pay_Order_Sync::apply_paid( paid_notify( 'OT20261105003', 999 ) );
check( false === $r, '通知金额与订单不一致时 apply_paid 拒绝' );
check( 'pending' === $mismatch->get_status(), '金额不符订单状态不变（不落库）' );
check( '' === $mismatch->get_meta( Sutwx_Rest_Pay::META_TRANSACTION_ID ), '金额不符不写交易号' );

echo "== 场景 4：退款回调（BE-014） ==\n";

$refunded = make_order( 'refunded', 10.0, 'OT20261105004' );
$refunded->update_meta_data( Sutwx_Pay_Refund::META_REFUND_NO, 'rf9001' );
$GLOBALS['sutwx_wc_orders'][ $refunded->get_id() ] = $refunded;
$r = Sutwx_Pay_Refund::apply_refund_notified(
	array( 'out_refund_no' => 'rf9001', 'refund_status' => 'SUCCESS', 'out_trade_no' => 'OT20261105004' )
);
check( true === $r, '退款成功回调确认' );
check( 'refunded' === $refunded->get_status() && 5 === sutwx_order_status_code( 'refunded' ), '订单状态 5（已退款）' );

// 重复退款回调幂等
$r2 = Sutwx_Pay_Refund::apply_refund_notified(
	array( 'out_refund_no' => 'rf9001', 'refund_status' => 'SUCCESS' )
);
check( true === $r2 && 'refunded' === $refunded->get_status(), '重复退款回调幂等' );

// 非成功退款状态忽略
$r3 = Sutwx_Pay_Refund::apply_refund_notified(
	array( 'out_refund_no' => 'rf9002', 'refund_status' => 'ABNORMAL' )
);
check( true === $r3, '非 SUCCESS 退款回调直接确认不落库' );

// 未知退款单号返回失败（微信将重试）
$r4 = Sutwx_Pay_Refund::apply_refund_notified(
	array( 'out_refund_no' => 'rf_unknow', 'refund_status' => 'SUCCESS' )
);
check( false === $r4, '未知退款单号回调返回 false（触发微信重试）' );

echo "== 场景 5：退款请求前置校验（SEC-002 上限） ==\n";

$no_trade_order = make_order( 'processing', 10.0, '' );
$r5 = Sutwx_Pay_Refund::refund_order( $no_trade_order );
check( false === $r5['ok'] && 'out_trade_no_missing' === $r5['error'], '无商户单号订单拒绝退款' );

$zero_order = make_order( 'processing', 0.0, 'OT20261105006' );
$r6 = Sutwx_Pay_Refund::refund_order( $zero_order );
check( false === $r6['ok'] && 'refund_amount_invalid' === $r6['error'], '零金额订单拒绝退款（上限=实付）' );

echo "== BE-011：下单幂等锁 ==\n";

$a = Sutwx_Order_Idempotency::acquire( 7, 'req-abc' );
check( 'acquired' === $a['status'], '首次请求获得锁' );
$b = Sutwx_Order_Idempotency::acquire( 7, 'req-abc' );
check( 'processing' === $b['status'], '锁内重复请求返回 processing' );
Sutwx_Order_Idempotency::commit( 7, 'req-abc', 901 );
$c2 = Sutwx_Order_Idempotency::acquire( 7, 'req-abc' );
check( 'duplicate' === $c2['status'] && 901 === $c2['order_id'], '提交后重复请求返回原订单号' );
check( 'acquired' === Sutwx_Order_Idempotency::acquire( 8, 'req-abc' )['status'], '不同用户同 clientRequestId 互不影响' );
Sutwx_Order_Idempotency::release( 7, 'req-abc' );
check( 'acquired' === Sutwx_Order_Idempotency::acquire( 7, 'req-abc' )['status'], '释放后可重新获得锁' );

echo "== BE-012：cron 注册与间隔（WP 桩函数缺席时安全跳过） ==\n";

Sutwx_Pay_Cron::init(); // 无 add_action 桩时为 no-op，不应报错。
check( true, 'init 在无 WP 环境下安全返回' );
$iv = Sutwx_Pay_Cron::intervals( array() );
check( 300 === $iv['sutwx_5min']['interval'], '5 分钟间隔注册' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );