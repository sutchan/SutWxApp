<?php
/**
 * 订单状态流转（自 class-rest-order-actions.php 拆出）：取消 / 确认收货。
 * 通过 trait 合并进 Sutwx_Rest_Order_Actions，保持对外调用方式不变。
 *
 * @package SutwxAppApi
 * @version 0.7.1
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Auth_Guard' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
}
if ( ! class_exists( 'Sutwx_Pay_Refund' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-pay-refund.php';
}

/**
 * 订单状态流转：校验归属与当前状态后执行。
 */
trait Sutwx_Rest_Order_Transition {

	/**
	 * 状态流转统一入口（校验归属与当前状态后执行）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @param string          $action  cancel|confirm。
	 * @return array|WP_Error
	 */
	private function transition( $request, $action ) {
		$user_id = Sutwx_Auth_Guard::current_user_id( $request );
		if ( $user_id <= 0 ) {
			return $this->error( __( '登录已过期，请重新登录', 'sutwx-app-api' ), 401, 'sutwx_unauthorized' );
		}

		$id = (int) $request->get_param( 'id' );
		if ( $id <= 0 ) {
			return $this->error( __( '订单 ID 无效', 'sutwx-app-api' ), 400, 'sutwx_invalid_param' );
		}
		if ( ! function_exists( 'wc_get_order' ) ) {
			return $this->error( __( 'WooCommerce 未启用', 'sutwx-app-api' ), 503, 'sutwx_woocommerce_missing' );
		}

		$order = wc_get_order( $id );
		if ( ! $order || (int) $order->get_customer_id() !== $user_id ) {
			return $this->error( __( '订单不存在', 'sutwx-app-api' ), 404, 'sutwx_not_found' );
		}

		$current = (string) $order->get_status();
		if ( 'cancel' === $action ) {
			$result = $this->cancel_transition( $order, $current, $id );
			if ( null !== $result ) {
				return $result;
			}
		} else {
			if ( ! sutwx_order_can_confirm( $current ) ) {
				return $this->error( __( '订单状态不可确认收货', 'sutwx-app-api' ), 409, 'sutwx_invalid_status' );
			}
			$order->update_status( 'completed', __( '用户确认收货', 'sutwx-app-api' ) );
		}

		return $this->success( sutwx_map_order( wc_get_order( $id ) ) );
	}

	/**
	 * 取消分支：已支付订单发起整单退款，未支付订单直接置取消。
	 *
	 * @param WC_Order $order   订单对象。
	 * @param string   $current 当前状态。
	 * @param int      $id      订单 ID。
	 * @return array|WP_Error|null 需要提前返回时返回响应，否则 null 继续主流程。
	 */
	private function cancel_transition( $order, $current, $id ) {
		if ( 'processing' === $current ) {
			// BE-014：已支付订单取消 → 发起微信整单退款（金额=实付，SEC-002）。
			$refund = Sutwx_Pay_Refund::refund_order( $order );
			if ( empty( $refund['ok'] ) ) {
				$this->log_error(
					'pay_exception',
					array(
						'code'    => 'refund_' . $refund['error'],
						'status'  => 502,
						'route'   => '/order/cancel',
						'orderId' => $id,
					)
				);
				return $this->error( __( '退款发起失败，请稍后重试', 'sutwx-app-api' ), 502, 'sutwx_refund_failed' );
			}
			return $this->success( sutwx_map_order( wc_get_order( $id ) ) );
		}
		if ( ! in_array( $current, array( 'pending', 'on-hold', 'failed' ), true ) ) {
			return $this->error( __( '当前订单状态不可取消', 'sutwx-app-api' ), 409, 'sutwx_invalid_status' );
		}
		$order->update_status( 'cancelled', __( '用户主动取消', 'sutwx-app-api' ) );
		return null;
	}
}
