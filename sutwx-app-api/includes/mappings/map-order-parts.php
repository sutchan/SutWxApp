<?php
/**
 * 订单 DTO 辅助函数：商品行、地址与日期格式化（被 map-order.php 引用，BE-006）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'sutwx_order_item_dto' ) ) {
	/**
	 * 订单商品行 → DTO。
	 *
	 * @param object $item WC_Order_Item_Product。
	 * @return array|null
	 */
	function sutwx_order_item_dto( $item ) {
		if ( ! is_object( $item ) || ! method_exists( $item, 'get_product_id' ) ) {
			return null;
		}

		$product_id = (int) $item->get_product_id();
		$name       = method_exists( $item, 'get_name' ) ? (string) $item->get_name() : '';
		$image      = '';
		$product    = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;
		if ( $product && method_exists( $product, 'get_image_id' ) ) {
			$image = (string) sutwx_attachment_url( $product->get_image_id() );
		}

		$spec = '';
		if ( method_exists( $item, 'get_variation_attributes' ) ) {
			$attrs = (array) $item->get_variation_attributes();
			$spec  = implode( ' / ', array_filter( array_map( 'strval', $attrs ) ) );
		}

		$total = method_exists( $item, 'get_total' ) ? (float) $item->get_total() : 0.0;
		$qty   = method_exists( $item, 'get_quantity' ) ? (int) $item->get_quantity() : 0;
		$price = $qty > 0 ? round( $total / $qty, 2 ) : round( $total, 2 );

		return array(
			'id'       => $product_id,
			'name'     => $name,
			'image'    => $image,
			'price'    => $price,
			'quantity' => $qty,
			'spec'     => $spec,
		);
	}
}

if ( ! function_exists( 'sutwx_order_address_dto' ) ) {
	/**
	 * 账单地址 → {name, phone, detail}（与小程序地址结构对齐）。
	 *
	 * @param object $order WC_Order。
	 * @return array
	 */
	function sutwx_order_address_dto( $order ) {
		$first = method_exists( $order, 'get_billing_first_name' ) ? (string) $order->get_billing_first_name() : '';
		$last  = method_exists( $order, 'get_billing_last_name' ) ? (string) $order->get_billing_last_name() : '';
		$name  = trim( $first . ' ' . $last );

		$phone = method_exists( $order, 'get_billing_phone' ) ? (string) $order->get_billing_phone() : '';

		$parts = array();
		foreach ( array( 'get_billing_state', 'get_billing_city', 'get_billing_address_1', 'get_billing_address_2' ) as $getter ) {
			if ( method_exists( $order, $getter ) ) {
				$value = trim( (string) $order->$getter() );
				if ( '' !== $value ) {
					$parts[] = $value;
				}
			}
		}

		return array(
			'name'   => $name,
			'phone'  => $phone,
			'detail' => implode( ' ', $parts ),
		);
	}
}

if ( ! function_exists( 'sutwx_order_datetime' ) ) {
	/**
	 * WC 日期对象 → 'Y-m-d H:i:s' 字符串（无则返回空串）。
	 *
	 * @param mixed $date WC_DateTime。
	 * @return string
	 */
	function sutwx_order_datetime( $date ) {
		if ( is_object( $date ) && method_exists( $date, 'date' ) ) {
			return (string) $date->date( 'Y-m-d H:i:s' );
		}
		return '';
	}
}
