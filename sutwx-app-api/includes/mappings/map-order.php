<?php
/**
 * WC 订单 → 小程序订单 DTO。
 * 字段契约：docs/specs/backend/spec.md 与 SutWxApp/models/order.js（mapWooCommerceOrder）。
 *
 * 状态码约定（与小程序 orderService 一致）：
 *   0 已取消 / 1 待付款 / 2 待发货 / 3 待收货 / 4 已完成 / 5 已退款
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'sutwx_order_status_code' ) ) {
	/**
	 * WC 订单状态 → 小程序状态码。
	 *
	 * @param string $wc_status WC 状态（不含 wc- 前缀）。
	 * @return int
	 */
	function sutwx_order_status_code( $wc_status ) {
		$map = array(
			'pending'    => 1,
			'on-hold'    => 1,
			'failed'     => 0,
			'cancelled'  => 0,
			'processing' => 2,
			'shipped'    => 3,
			'completed'  => 4,
			'refunded'   => 5,
		);
		$key = (string) $wc_status;
		return isset( $map[ $key ] ) ? $map[ $key ] : 0;
	}
}

if ( ! function_exists( 'sutwx_order_statuses_for_code' ) ) {
	/**
	 * 小程序状态码 → WC 状态集合（供列表筛选；0/全部返回空数组表示不限）。
	 *
	 * @param int $code 小程序状态码（0 表示全部）。
	 * @return array
	 */
	function sutwx_order_statuses_for_code( $code ) {
		$map = array(
			0 => array(),
			1 => array( 'pending', 'on-hold' ),
			2 => array( 'processing' ),
			3 => array( 'shipped' ),
			4 => array( 'completed' ),
			5 => array( 'refunded' ),
		);
		$key = (int) $code;
		return isset( $map[ $key ] ) ? $map[ $key ] : array();
	}
}

if ( ! function_exists( 'sutwx_order_status_text' ) ) {
	/**
	 * 状态码 → 中文状态文案。
	 *
	 * @param int $code 状态码。
	 * @return string
	 */
	function sutwx_order_status_text( $code ) {
		$map = array(
			0 => '已取消',
			1 => '待付款',
			2 => '待发货',
			3 => '待收货',
			4 => '已完成',
			5 => '已退款',
		);
		$key = (int) $code;
		return isset( $map[ $key ] ) ? $map[ $key ] : '未知状态';
	}
}

if ( ! function_exists( 'sutwx_map_order' ) ) {
	/**
	 * 单个 WC 订单 → 订单 DTO（无效输入返回 null）。
	 *
	 * @param object $order WC_Order。
	 * @return array|null
	 */
	function sutwx_map_order( $order ) {
		if ( ! is_object( $order ) || ! method_exists( $order, 'get_id' ) ) {
			return null;
		}

		$wc_status = method_exists( $order, 'get_status' ) ? (string) $order->get_status() : '';
		$status    = sutwx_order_status_code( $wc_status );

		$products = array();
		$quantity = 0;
		if ( method_exists( $order, 'get_items' ) ) {
			foreach ( (array) $order->get_items() as $item ) {
				$dto = sutwx_order_item_dto( $item );
				if ( $dto ) {
					$products[] = $dto;
					$quantity  += $dto['quantity'];
				}
			}
		}

		$total = method_exists( $order, 'get_total' ) ? (float) $order->get_total() : 0.0;
		$ship  = method_exists( $order, 'get_shipping_total' ) ? (float) $order->get_shipping_total() : 0.0;

		return array(
			'id'            => (int) $order->get_id(),
			'orderNo'       => method_exists( $order, 'get_order_number' ) ? (string) $order->get_order_number() : '',
			'status'        => $status,
			'statusText'    => sutwx_order_status_text( $status ),
			'totalPrice'    => round( $total, 2 ),
			'productPrice'  => round( $total - $ship, 2 ),
			'shippingFee'   => round( $ship, 2 ),
			'totalQuantity' => $quantity,
			'createTime'    => sutwx_order_datetime( method_exists( $order, 'get_date_created' ) ? $order->get_date_created() : null ),
			'products'      => $products,
			'address'       => sutwx_order_address_dto( $order ),
			'remark'        => method_exists( $order, 'get_customer_note' ) ? (string) $order->get_customer_note() : '',
			'payTime'       => sutwx_order_datetime( method_exists( $order, 'get_date_paid' ) ? $order->get_date_paid() : null ),
			'completeTime'  => sutwx_order_datetime( method_exists( $order, 'get_date_completed' ) ? $order->get_date_completed() : null ),
		);
	}
}

if ( ! function_exists( 'sutwx_map_orders' ) ) {
	/**
	 * 批量映射（过滤无效项）。
	 *
	 * @param array $orders WC_Order 数组。
	 * @return array
	 */
	function sutwx_map_orders( $orders ) {
		if ( ! is_array( $orders ) ) {
			return array();
		}
		$mapped = array();
		foreach ( $orders as $order ) {
			$item = sutwx_map_order( $order );
			if ( $item ) {
				$mapped[] = $item;
			}
		}
		return $mapped;
	}
}
