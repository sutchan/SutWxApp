<?php
/**
 * /api/monitor/data 监控与错误上报接收端点（BE-013）。
 *
 * 接收小程序 utils/monitor*.js 的批量上报（appId + sessionId + data 数组），
 * 字段白名单校验 + 长度上限，落 Sutwx_Error_Log 结构化日志管道。
 * 公开免鉴权；限频器按 monitor 桶限流（每分钟 10 次）。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Error_Log' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-error-log.php';
}

/**
 * 监控上报路由控制器。
 */
class Sutwx_Rest_Monitor extends Sutwx_Rest_Base {

	/**
	 * 单批最大条数（与前端 maxBatchSize=20 对齐）。
	 */
	const MAX_BATCH = 20;

	/**
	 * 注册 /monitor/data。
	 */
	public function register_routes() {
		register_rest_route(
			SUTWX_API_REST_NS,
			'/monitor/data',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * 接收一批监控事件，逐条落日志。
	 *
	 * @param WP_REST_Request $request 请求。
	 * @return array|WP_Error
	 */
	public function create_item( $request ) {
		$body   = $request->get_json_params();
		$body   = is_array( $body ) ? $body : array();
		$items  = isset( $body['data'] ) && is_array( $body['data'] ) ? $body['data'] : array();
		$opened = microtime( true );

		if ( empty( $items ) && isset( $body['type'] ) ) {
			$items = array( $body );
		}
		if ( empty( $items ) ) {
			return $this->error( '缺少上报数据 data', 400, 'sutwx_monitor_empty' );
		}
		if ( count( $items ) > self::MAX_BATCH ) {
			$items = array_slice( $items, 0, self::MAX_BATCH );
		}

		$session  = $this->bounded( $body, 'sessionId', 64 );
		$accepted = 0;
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$type = $this->bounded( $item, 'type', 32 );
			if ( '' === $type ) {
				continue;
			}
			$accepted++;
			Sutwx_Error_Log::log(
				'monitor',
				array(
					'code'      => $type,
					'sessionId' => '' !== $session ? $session : $this->bounded( $item, 'sessionId', 64 ),
					'page'      => $this->bounded( $item, 'page', 128 ),
					'detail'    => $this->extract_detail( $item ),
				)
			);
		}

		Sutwx_Error_Log::log(
			'monitor_batch',
			array(
				'code'       => 'accepted',
				'status'     => $accepted,
				'durationMs' => (int) round( ( microtime( true ) - $opened ) * 1000 ),
			)
		);

		return $this->success( array( 'accepted' => $accepted ) );
	}

	/**
	 * 提取条目详情（仅白名单字段），避免任意结构落盘。
	 *
	 * @param array $item 上报条目。
	 * @return array
	 */
	private function extract_detail( array $item ) {
		$inner = isset( $item['data'] ) && is_array( $item['data'] ) ? $item['data'] : array();
		$keep  = array_intersect_key(
			$inner,
			array_flip( array( 'message', 'name', 'value', 'action', 'context', 'stack' ) )
		);
		return array(
			'category' => $this->bounded( $item, 'category', 32 ),
			'data'     => $keep,
		);
	}

	/**
	 * 读取字符串字段并限制长度。
	 *
	 * @param array  $data   数据。
	 * @param string $key    键名。
	 * @param int    $maxlen 最大长度。
	 * @return string
	 */
	private function bounded( array $data, $key, $maxlen ) {
		if ( ! isset( $data[ $key ] ) || ! is_scalar( $data[ $key ] ) ) {
			return '';
		}
		$value = (string) $data[ $key ];
		return function_exists( 'mb_substr' )
			? mb_substr( $value, 0, $maxlen, 'UTF-8' )
			: substr( $value, 0, $maxlen );
	}
}
