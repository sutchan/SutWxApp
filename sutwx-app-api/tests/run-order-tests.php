<?php
/**
 * 订单映射单元测试（独立运行，无需 WP/WC 环境）：
 *   php tests/run-order-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖：WC 状态码映射、商品行 DTO（均价/规格/图）、地址 DTO、日期格式化、
 *       订单 DTO 金额关系（totalPrice = productPrice + shippingFee）（BE-006）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

require __DIR__ . '/bootstrap.php';
require dirname( __DIR__ ) . '/includes/sanitize.php';
require dirname( __DIR__ ) . '/includes/mappings/map-order-parts.php';
require dirname( __DIR__ ) . '/includes/mappings/map-order.php';

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
// 假对象
// ---------------------------------------------------------------------------

/**
 * WC_Order_Item_Product 假对象。
 */
class Fake_Order_Item {
	private $data;

	public function __construct( $data = array() ) {
		$this->data = array_merge(
			array(
				'product_id' => 1,
				'name'       => '',
				'total'      => 0.0,
				'quantity'   => 0,
				'variation'  => array(),
			),
			$data
		);
	}
	public function get_product_id() {
		return $this->data['product_id'];
	}
	public function get_name() {
		return $this->data['name'];
	}
	public function get_total() {
		return $this->data['total'];
	}
	public function get_quantity() {
		return $this->data['quantity'];
	}
	public function get_variation_attributes() {
		return $this->data['variation'];
	}
}

/**
 * WC_DateTime 假对象。
 */
class Fake_DateTime {
	public function date( $format ) {
		return '2026-10-14 12:00:00';
	}
}

/**
 * WC_Order 假对象。
 */
class Fake_Order {
	private $data;

	public function __construct( $data = array() ) {
		$this->data = array_merge(
			array(
				'id'                => 0,
				'status'            => 'pending',
				'order_number'      => '',
				'total'             => 0.0,
				'shipping_total'    => 0.0,
				'customer_id'       => 7,
				'billing_first'     => '',
				'billing_last'      => '',
				'billing_phone'     => '',
				'billing_state'     => '',
				'billing_city'      => '',
				'billing_address_1' => '',
				'billing_address_2' => '',
				'customer_note'     => '',
				'date_created'      => null,
				'date_paid'         => null,
				'date_completed'    => null,
				'items'             => array(),
			),
			$data
		);
	}
	public function get_id() {
		return $this->data['id'];
	}
	public function get_status() {
		return $this->data['status'];
	}
	public function get_order_number() {
		return $this->data['order_number'];
	}
	public function get_total() {
		return $this->data['total'];
	}
	public function get_shipping_total() {
		return $this->data['shipping_total'];
	}
	public function get_customer_id() {
		return $this->data['customer_id'];
	}
	public function get_billing_first_name() {
		return $this->data['billing_first'];
	}
	public function get_billing_last_name() {
		return $this->data['billing_last'];
	}
	public function get_billing_phone() {
		return $this->data['billing_phone'];
	}
	public function get_billing_state() {
		return $this->data['billing_state'];
	}
	public function get_billing_city() {
		return $this->data['billing_city'];
	}
	public function get_billing_address_1() {
		return $this->data['billing_address_1'];
	}
	public function get_billing_address_2() {
		return $this->data['billing_address_2'];
	}
	public function get_customer_note() {
		return $this->data['customer_note'];
	}
	public function get_date_created() {
		return $this->data['date_created'];
	}
	public function get_date_paid() {
		return $this->data['date_paid'];
	}
	public function get_date_completed() {
		return $this->data['date_completed'];
	}
	public function get_items() {
		return $this->data['items'];
	}
}

if ( ! function_exists( 'wc_get_product' ) ) {
	function wc_get_product( $id ) {
		return $GLOBALS['sutwx_fake_product'][ (int) $id ] ?? null;
	}
}

echo "== 状态码映射 ==\n";

check( 1 === sutwx_order_status_code( 'pending' ), 'pending → 1 待付款' );
check( 1 === sutwx_order_status_code( 'on-hold' ), 'on-hold → 1 待付款' );
check( 0 === sutwx_order_status_code( 'cancelled' ), 'cancelled → 0 已取消' );
check( 0 === sutwx_order_status_code( 'failed' ), 'failed → 0 已取消' );
check( 2 === sutwx_order_status_code( 'processing' ), 'processing → 2 待发货' );
check( 3 === sutwx_order_status_code( 'shipped' ), 'shipped → 3 待收货' );
check( 4 === sutwx_order_status_code( 'completed' ), 'completed → 4 已完成' );
check( 5 === sutwx_order_status_code( 'refunded' ), 'refunded → 5 已退款' );
check( 0 === sutwx_order_status_code( 'unknown' ), '未知状态回落 0' );
check( '待付款' === sutwx_order_status_text( 1 ) && '已完成' === sutwx_order_status_text( 4 ), '状态文案映射' );
check( '未知状态' === sutwx_order_status_text( 99 ), '未知状态码文案兜底' );

check( array( 'pending', 'on-hold' ) === sutwx_order_statuses_for_code( 1 ), '待付款筛选含 pending/on-hold' );
check( array() === sutwx_order_statuses_for_code( 0 ), '全部（0）不限状态' );
check( array( 'completed' ) === sutwx_order_statuses_for_code( 4 ), '已完成筛选 completed' );

echo "== 商品行 DTO ==\n";

$GLOBALS['sutwx_fake_product'][11] = new Fake_Product( array( 'id' => 11, 'image_id' => 3 ) );

$item = new Fake_Order_Item(
	array(
		'product_id' => 11,
		'name'       => '苏铁盆栽',
		'total'      => 160.0,
		'quantity'   => 2,
		'variation'  => array( 'attribute_pa_size' => '中号' ),
	)
);
$dto = sutwx_order_item_dto( $item );

check( 80.0 === $dto['price'], '行均价 = total / quantity' );
check( 2 === $dto['quantity'] && 11 === $dto['id'], '数量与商品 ID 透传' );
check( '中号' === $dto['spec'], '规格取 variation 选项' );
check( false !== strpos( $dto['image'], 'img-3.jpg' ), '商品图来自 WC 商品主图' );

$no_img = sutwx_order_item_dto( new Fake_Order_Item( array( 'product_id' => 99, 'total' => 10.0, 'quantity' => 1 ) ) );
check( '' === $no_img['image'], '商品不存在时图片为空串' );
check( null === sutwx_order_item_dto( 'not-an-object' ), '非对象返回 null' );

echo "== 地址与日期 DTO ==\n";

$order = new Fake_Order(
	array(
		'billing_first'     => '三',
		'billing_last'      => '张',
		'billing_phone'     => '13800138000',
		'billing_state'     => '广东省',
		'billing_city'      => '深圳市',
		'billing_address_1' => '南山区某某路 1 号',
		'billing_address_2' => '',
	)
);
$addr = sutwx_order_address_dto( $order );

check( '张 三' === $addr['name'], '姓名 = 姓 + 名' );
check( '13800138000' === $addr['phone'], '电话透传' );
check( '广东省 深圳市 南山区某某路 1 号' === $addr['detail'], '详情按 省/市/地址1/地址2 拼接' );

check( '2026-10-14 12:00:00' === sutwx_order_datetime( new Fake_DateTime() ), '日期格式化为 Y-m-d H:i:s' );
check( '' === sutwx_order_datetime( null ), '空日期回落空串' );

echo "== 订单 DTO ==\n";

$full = new Fake_Order(
	array(
		'id'             => 55,
		'order_number'   => 'SU20261014001',
		'status'         => 'processing',
		'total'          => 168.9,
		'shipping_total' => 10.0,
		'customer_note'  => '放前台',
		'date_created'   => new Fake_DateTime(),
		'items'          => array(
			new Fake_Order_Item( array( 'product_id' => 11, 'name' => '苏铁盆栽', 'total' => 158.9, 'quantity' => 2 ) ),
			new Fake_Order_Item( array( 'product_id' => 12, 'name' => '营养土', 'total' => 0.0, 'quantity' => 1 ) ),
		),
	)
);
$d = sutwx_map_order( $full );

check( 55 === $d['id'] && 'SU20261014001' === $d['orderNo'], '订单 ID 与单号透传' );
check( 2 === $d['status'] && '待发货' === $d['statusText'], 'processing → 待发货' );
check( 168.9 === $d['totalPrice'], 'totalPrice 取订单总额' );
check( 158.9 === $d['productPrice'] && 10.0 === $d['shippingFee'], 'productPrice = total - shipping' );
check( 3 === $d['totalQuantity'], '商品件数累加' );
check( 2 === count( $d['products'] ), '商品行数量正确' );
check( '放前台' === $d['remark'] && '2026-10-14 12:00:00' === $d['createTime'], '备注与创建时间透传' );

$empty = new Fake_Order( array( 'id' => 56, 'status' => 'completed', 'total' => 0.0 ) );
$d2    = sutwx_map_order( $empty );
check( 4 === $d2['status'] && 0.0 === $d2['totalPrice'] && 0 === count( $d2['products'] ), '无商品订单回落空列表' );

check( null === sutwx_map_order( 'nope' ), '无效输入返回 null' );
check( 1 === count( sutwx_map_orders( array( $full, 'bad' ) ) ), '批量映射过滤无效项' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );
