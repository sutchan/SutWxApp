<?php
/**
 * 订单商品/地址装配（自 class-rest-order-actions.php 拆出）。
 *
 * 把「聚合数量 → 库存校验 → 加入订单」与「收货地址写入」收拢在此，
 * 让 REST 控制器只负责参数解析与响应。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Order_Items' ) ) {
	/**
	 * 订单装配助手。
	 */
	class Sutwx_Order_Items {

		/**
		 * 聚合商品、校验库存与可购买性，并加入订单。
		 *
		 * @param WC_Order $order 订单对象。
		 * @param array    $items 原始 items（[{productId,quantity}]）。
		 * @return array{ok:bool,error:string,code:string,status:int}
		 */
		public static function apply( $order, $items ) {
			// 库存聚合：同一商品分多条出现时按总数量校验，避免分项各自通过但合计超库存。
			$quantities = array();
			foreach ( (array) $items as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$product_id = isset( $item['productId'] ) ? (int) $item['productId'] : 0;
				$quantity   = isset( $item['quantity'] ) ? (int) $item['quantity'] : 0;
				if ( $product_id <= 0 || $quantity <= 0 ) {
					continue;
				}
				$quantities[ $product_id ] = ( isset( $quantities[ $product_id ] )
					? (int) $quantities[ $product_id ]
					: 0 ) + $quantity;
			}

			$has_item = false;
			foreach ( $quantities as $product_id => $quantity ) {
				$product = wc_get_product( $product_id );
				if ( ! $product || ! $product->is_purchasable() ) {
					return self::fail( __( '存在不可购买的商品', 'sutwx-app-api' ), 400, 'sutwx_invalid_product' );
				}
				if ( ! $product->is_in_stock() ) {
					return self::fail(
						sprintf( __( '商品「%s」已售罄', 'sutwx-app-api' ), $product->get_name() ),
						409,
						'sutwx_out_of_stock'
					);
				}
				if ( $product->managing_stock() ) {
					$available = (int) $product->get_stock_quantity();
					if ( $quantity > $available ) {
						return self::fail(
							sprintf(
								__( '商品「%s」库存不足，仅剩 %d 件', 'sutwx-app-api' ),
								$product->get_name(),
								$available
							),
							409,
							'sutwx_insufficient_stock'
						);
					}
				}
				$order->add_product( $product, $quantity );
				$has_item = true;
			}

			if ( ! $has_item ) {
				return self::fail( __( '订单商品不能为空', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
			}

			return array(
				'ok'     => true,
				'error'  => '',
				'code'   => '',
				'status' => 200,
			);
		}

		/**
		 * 写入收货地址快照（省/市/区/详细地址）。
		 *
		 * @param WC_Order $order   订单对象。
		 * @param array    $address 地址数组。
		 */
		public static function apply_address( $order, $address ) {
			$address = is_array( $address ) ? $address : array();
			$order->set_billing_first_name( isset( $address['name'] ) ? (string) $address['name'] : '' );
			$order->set_billing_phone( isset( $address['phone'] ) ? (string) $address['phone'] : '' );
			$order->set_billing_state( isset( $address['province'] ) ? (string) $address['province'] : '' );
			$order->set_billing_city( isset( $address['city'] ) ? (string) $address['city'] : '' );
			$order->set_billing_address_1( isset( $address['detail'] ) ? (string) $address['detail'] : '' );
			$order->set_billing_address_2( isset( $address['district'] ) ? (string) $address['district'] : '' );
		}

		/**
		 * 统一失败结构。
		 *
		 * @param string $error  错误文案。
		 * @param int    $status HTTP 状态码。
		 * @param string $code   错误码。
		 * @return array
		 */
		private static function fail( $error, $status, $code ) {
			return array(
				'ok'     => false,
				'error'  => $error,
				'code'   => $code,
				'status' => $status,
			);
		}
	}
}
