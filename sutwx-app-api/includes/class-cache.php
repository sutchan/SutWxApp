<?php
/**
 * Transients 缓存与精准失效（BE-004）。
 *
 * 采用「分组版本号」策略：清缓存只需递增版本号，避免遍历删除 transient。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * 只读端点缓存。
 */
class Sutwx_Cache {

	/**
	 * 默认 TTL（秒）：5 分钟。
	 */
	const TTL = 300;

	/**
	 * 详情端点 TTL（秒）：10 分钟。
	 */
	const TTL_DETAIL = 600;

	/**
	 * 分组版本号 option 键。
	 */
	const VERSIONS_OPTION = 'sutwx_cache_versions';

	/**
	 * 受管分组。
	 */
	const GROUPS = array( 'product', 'post', 'category', 'theme' );

	/**
	 * 缓存语义：命中直接返回，未命中执行回调并写入。
	 *
	 * @param string   $group    分组（product/post/category/theme）。
	 * @param array    $params   影响结果的参数（参与缓存键计算）。
	 * @param callable $callback 未命中时的数据生成回调。
	 * @param int      $ttl      有效期（秒）。
	 * @return mixed
	 */
	public static function remember( $group, $params, $callback, $ttl = self::TTL ) {
		if ( ! is_callable( $callback ) ) {
			return null;
		}
		if ( ! function_exists( 'get_transient' ) || ! function_exists( 'set_transient' ) ) {
			return call_user_func( $callback );
		}

		$key      = self::key( $group, $params );
		$cached   = get_transient( $key );
		$hit_flag = false;

		if ( is_array( $cached ) && isset( $cached['__sutwx_cached'] ) ) {
			$hit_flag = true;
			self::flag_hit( true );
			return $cached['data'];
		}

		self::flag_hit( $hit_flag );
		$data = call_user_func( $callback );

		// 空结果不落缓存：避免「不存在」被长时间固化（如商品刚发布但尚未索引）。
		if ( null === $data ) {
			return $data;
		}

		set_transient(
			$key,
			array( '__sutwx_cached' => 1, 'data' => $data ),
			max( 1, (int) $ttl )
		);

		return $data;
	}

	/**
	 * 生成缓存键（含分组版本号）。
	 *
	 * @param string $group  分组。
	 * @param array  $params 参数。
	 * @return string
	 */
	public static function key( $group, $params ) {
		$params = is_array( $params ) ? $params : array( $params );
		ksort( $params );
		return 'sutwx_' . $group . '_v' . self::version( $group ) . '_' . md5( wp_json_encode_safe( $params ) );
	}

	/**
	 * 取分组版本号。
	 *
	 * @param string $group 分组。
	 * @return int
	 */
	public static function version( $group ) {
		$versions = self::versions();
		return isset( $versions[ $group ] ) ? (int) $versions[ $group ] : 1;
	}

	/**
	 * 递增分组版本号（即精准清缓存）。
	 *
	 * @param string $group 分组。
	 * @return int 新版本号。
	 */
	public static function bump( $group ) {
		$versions = self::versions();
		$next     = self::version( $group ) + 1;
		$versions[ $group ] = $next;

		if ( function_exists( 'update_option' ) ) {
			update_option( self::VERSIONS_OPTION, $versions );
		} else {
			$GLOBALS['sutwx_cache_versions'] = $versions;
		}
		return $next;
	}

	/**
	 * 注册内容变更钩子：文章/商品/分类/主题变更时精准失效对应分组。
	 */
	public static function register_invalidation_hooks() {
		add_action( 'save_post', array( __CLASS__, 'on_save_post' ), 10, 2 );
		add_action( 'woocommerce_update_product', array( __CLASS__, 'on_product_change' ) );
		add_action( 'woocommerce_new_product', array( __CLASS__, 'on_product_change' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'on_category_change' ) );
		add_action( 'edited_product_cat', array( __CLASS__, 'on_category_change' ) );
		add_action( 'update_option_' . SUTWX_API_THEME_OPTION, array( __CLASS__, 'on_theme_change' ) );
	}

	/**
	 * 文章/商品保存：按 post_type 失效对应分组。
	 *
	 * @param int    $post_id 文章 ID。
	 * @param object $post    文章对象。
	 */
	public static function on_save_post( $post_id, $post = null ) {
		$type = is_object( $post ) && isset( $post->post_type ) ? $post->post_type : '';
		if ( 'product' === $type ) {
			self::bump( 'product' );
			self::bump( 'category' );
			return;
		}
		if ( 'post' === $type || 'page' === $type ) {
			self::bump( 'post' );
		}
	}

	/**
	 * 商品变更。
	 *
	 * @param mixed $product_id 商品 ID（不同钩子签名不同，未使用）。
	 */
	public static function on_product_change( $product_id = 0 ) {
		self::bump( 'product' );
		self::bump( 'category' );
	}

	/**
	 * 分类变更。
	 */
	public static function on_category_change() {
		self::bump( 'category' );
	}

	/**
	 * 主题配置变更。
	 */
	public static function on_theme_change() {
		self::bump( 'theme' );
	}

	/**
	 * 读取全部分组版本号。
	 *
	 * @return array
	 */
	private static function versions() {
		if ( function_exists( 'get_option' ) ) {
			$versions = get_option( self::VERSIONS_OPTION, array() );
			return is_array( $versions ) ? $versions : array();
		}
		return isset( $GLOBALS['sutwx_cache_versions'] ) && is_array( $GLOBALS['sutwx_cache_versions'] )
			? $GLOBALS['sutwx_cache_versions']
			: array();
	}

	/**
	 * 记录本次命中状态（供响应头与单测读取）。
	 *
	 * @param bool $hit 是否命中。
	 */
	private static function flag_hit( $hit ) {
		$GLOBALS['sutwx_cache_last_hit'] = (bool) $hit;
	}

	/**
	 * 读取最近一次 remember 是否命中缓存。
	 *
	 * @return bool
	 */
	public static function last_hit() {
		return isset( $GLOBALS['sutwx_cache_last_hit'] ) ? (bool) $GLOBALS['sutwx_cache_last_hit'] : false;
	}
}

/**
 * JSON 编码包装（单测环境可能没有 wp_json_encode）。
 *
 * @param mixed $data 数据。
 * @return string
 */
function wp_json_encode_safe( $data ) {
	if ( function_exists( 'wp_json_encode' ) ) {
		return wp_json_encode( $data );
	}
	$json = json_encode( $data );
	return false === $json ? '' : $json;
}
