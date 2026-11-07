<?php
/**
 * 支付/退款异步通知处理（自 class-rest-pay.php 拆出）。
 * 通过 trait 合并进 Sutwx_Rest_Pay，调用方式保持不变。
 *
 * @package SutwxAppApi
 * @version 0.7.1
 */

defined( 'ABSPATH' ) || exit;

/**
 * 微信回调：验签解密 → 落库 → 回执（幂等）。
 */
trait Sutwx_Rest_Pay_Notify {

	/**
	 * 退款结果异步通知：验签解密后按 out_refund_no 落库（BE-014，幂等）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return WP_REST_Response
	 */
	public function refund_notify( $request ) {
		$body   = (string) $request->get_body();
		$parsed = Sutwx_Wechat_Pay_Notify::parse( $this->request_headers( $request ), $body );

		if ( empty( $parsed['ok'] ) ) {
			$this->log_error(
				'pay_exception',
				array(
					'code'   => isset( $parsed['error'] ) ? $parsed['error'] : 'refund_notify_failed',
					'status' => 422,
					'route'  => '/pay/refund-notify',
				)
			);
			return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( false ) );
		}

		$ok = Sutwx_Pay_Refund::apply_refund_notified( $parsed['data'] );
		if ( ! $ok ) {
			$this->log_error(
				'pay_exception',
				array(
					'code'   => 'apply_refund_failed',
					'status' => 500,
					'route'  => '/pay/refund-notify',
				)
			);
		}

		return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( $ok ) );
	}

	/**
	 * 异步通知：验签解密 → 订单置「待发货」（幂等）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array
	 */
	public function notify( $request ) {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( false ) );
		}

		$body   = (string) $request->get_body();
		$parsed = Sutwx_Wechat_Pay_Notify::parse( $this->request_headers( $request ), $body );

		if ( empty( $parsed['ok'] ) ) {
			// BE-010：支付回调验签/解密失败必记（pay_exception），含失败原因。
			$this->log_error(
				'pay_exception',
				array(
					'code'   => $parsed['error'],
					'status' => 422,
					'route'  => '/pay/notify',
					'detail' => array( 'bodyBytes' => strlen( $body ) ),
				)
			);
			return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( false ) );
		}

		$ok = Sutwx_Pay_Order_Sync::apply_paid( $parsed['data'] );
		if ( ! $ok ) {
			$this->log_error(
				'pay_exception',
				array(
					'code'   => 'apply_paid_failed',
					'status' => 500,
					'route'  => '/pay/notify',
				)
			);
		}

		return rest_ensure_response( Sutwx_Wechat_Pay_Notify::receipt( $ok ) );
	}

	/**
	 * 提取请求头（兼容 REST 服务器不透传的场景）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array
	 */
	private function request_headers( $request ) {
		$headers = array();
		foreach ( array( 'Wechatpay-Signature', 'Wechatpay-Timestamp', 'Wechatpay-Nonce', 'Wechatpay-Serial' ) as $name ) {
			$value = $request->get_header( $name );
			if ( '' !== $value ) {
				$headers[ $name ] = $value;
			}
		}
		return $headers;
	}
}
