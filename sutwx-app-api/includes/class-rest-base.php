<?php
/**
 * REST 基类：统一 {code,data} 响应包络与错误处理。
 *
 * @package SutwxAppApi
 * @version 0.1.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 抽象基类，供各 REST 控制器继承。
 */
abstract class Sutwx_Rest_Base {

	/**
	 * 成功包络（与小程序 utils/api.unwrap 兼容）。
	 *
	 * @param mixed $data 业务数据。
	 * @return array
	 */
	protected function success( $data ) {
		return array(
			'code'      => 200,
			'message'   => 'success',
			'data'      => $data,
			'timestamp' => (int) round( microtime( true ) * 1000 ),
			'requestId' => wp_generate_uuid4(),
		);
	}

	/**
	 * 错误响应（WP_Error，data.status 决定 HTTP 状态码）。
	 *
	 * @param string $message 错误信息。
	 * @param int    $status  HTTP 状态码。
	 * @param string $code    错误码。
	 * @return WP_Error
	 */
	protected function error( $message, $status = 400, $code = 'sutwx_error' ) {
		return new WP_Error( $code, $message, array( 'status' => $status ) );
	}

	/**
	 * 空列表包络。
	 *
	 * @param int $page     页码。
	 * @param int $page_size 每页数量。
	 * @return array
	 */
	protected function empty_list( $page, $page_size ) {
		return array(
			'list'     => array(),
			'total'    => 0,
			'page'     => $page,
			'pageSize' => $page_size,
		);
	}

	/**
	 * 从请求中取分页参数（page/pageSize，pageSize 强制上限 50）。
	 *
	 * @param WP_REST_Request $request 请求对象。
	 * @return array{page:int,pageSize:int}
	 */
	protected function get_paging_args( $request ) {
		$page      = max( 1, (int) $request->get_param( 'page' ) );
		$page_size = (int) $request->get_param( 'pageSize' );
		$page_size = 0 === $page_size ? 20 : $page_size;
		$page_size = max( 1, min( 50, $page_size ) );

		return array(
			'page'     => $page,
			'pageSize' => $page_size,
		);
	}
}
