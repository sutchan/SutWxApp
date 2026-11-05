<?php
/**
 * 下单幂等（BE-011）：以 clientRequestId 短锁去重，防重复提交产生重复订单。
 *
 * 语义：
 * - 首次请求：占锁（值为 0，10 秒过期）→ 创建成功后回写订单号；
 * - 10 秒内重复请求：锁存在且值 >0 → 直接返回原订单（复购同单）；
 *   值为 0 → 返回 409 处理中，引导稍后重试；
 * - 锁过期：允许重新下单（用户超时重试是合法路径）。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 下单幂等锁。
 */
class Sutwx_Order_Idempotency {

	/**
	 * 锁有效期（秒）。
	 */
	const TTL = 10;

	/**
	 * 幂等键前缀。
	 */
	const KEY_PREFIX = 'sutwx_creql_';

	/**
	 * 计算幂等键。
	 *
	 * @param int    $user_id            用户 ID。
	 * @param string $client_request_id  客户端请求唯一标识。
	 * @return string
	 */
	public static function key( $user_id, $client_request_id ) {
		return self::KEY_PREFIX . md5( (int) $user_id . '|' . (string) $client_request_id );
	}

	/**
	 * 尝试获取幂等锁。
	 *
	 * @param int    $user_id           用户 ID。
	 * @param string $client_request_id 客户端请求唯一标识。
	 * @return array{status:string,order_id:int} status: acquired|duplicate|processing。
	 */
	public static function acquire( $user_id, $client_request_id ) {
		$key = self::key( $user_id, $client_request_id );
		$existing = function_exists( 'get_transient' ) ? get_transient( $key ) : false;

		if ( false !== $existing ) {
			$existing = (int) $existing;
			if ( $existing > 0 ) {
				return array( 'status' => 'duplicate', 'order_id' => $existing );
			}
			return array( 'status' => 'processing', 'order_id' => 0 );
		}

		if ( function_exists( 'set_transient' ) ) {
			set_transient( $key, 0, self::TTL );
		}
		return array( 'status' => 'acquired', 'order_id' => 0 );
	}

	/**
	 * 创建成功后回写订单号（供重复请求复用）。
	 *
	 * @param int    $user_id           用户 ID。
	 * @param string $client_request_id 客户端请求唯一标识。
	 * @param int    $order_id          订单 ID。
	 * @return bool
	 */
	public static function commit( $user_id, $client_request_id, $order_id ) {
		if ( $order_id <= 0 ) {
			return false;
		}
		return function_exists( 'set_transient' )
			? set_transient( self::key( $user_id, $client_request_id ), (int) $order_id, self::TTL )
			: false;
	}

	/**
	 * 创建失败时释放锁（允许用户立即重试）。
	 *
	 * @param int    $user_id           用户 ID。
	 * @param string $client_request_id 客户端请求唯一标识。
	 * @return bool
	 */
	public static function release( $user_id, $client_request_id ) {
		return function_exists( 'delete_transient' )
			? delete_transient( self::key( $user_id, $client_request_id ) )
			: false;
	}
}