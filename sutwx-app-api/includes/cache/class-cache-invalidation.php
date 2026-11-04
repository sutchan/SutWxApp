<?php
/**
 * 缓存失效钩子（自 class-cache.php 拆出）。
 * 通过 trait 合并进 Sutwx_Cache，调用方式保持不变。
 *
 * @package SutwxAppApi
 * @version 0.5.3
 */

defined( 'ABSPATH' ) || exit;

/**
 * 内容变更 → 分组版本号递增。
 */
trait Sutwx_Cache_Invalidation {

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
}
