<?php
/**
 * 统一注册 REST 路由、/api/* rewrite 与后台菜单（设置页 P2 实现）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

require_once SUTWX_API_DIR . 'includes/sanitize.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-product.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-post.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-category.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-products.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-posts.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-categories.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-theme.php';

/**
 * 插件加载器。
 */
final class Sutwx_Loader {

	/**
	 * 注册运行时钩子。
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		add_action( 'init', array( __CLASS__, 'register_rewrite_rules' ) );
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_menu' ) );
		add_action( 'admin_notices', array( __CLASS__, 'woocommerce_missing_notice' ) );
	}

	/**
	 * 注册 REST 路由（命名空间 sutwx/v1）。
	 */
	public static function register_rest_routes() {
		$controllers = array(
			new Sutwx_Rest_Products(),
			new Sutwx_Rest_Posts(),
			new Sutwx_Rest_Categories(),
			new Sutwx_Rest_Theme(),
		);
		foreach ( $controllers as $controller ) {
			$controller->register_routes();
		}
	}

	/**
	 * /api/* → index.php?rest_route=/sutwx/v1/$1（需「固定链接」非 plain）。
	 */
	public static function register_rewrite_rules() {
		add_rewrite_rule( '^api/?$', 'index.php?rest_route=/sutwx/v1', 'top' );
		add_rewrite_rule( '^api/(.*)', 'index.php?rest_route=/sutwx/v1/$matches[1]', 'top' );
	}

	/**
	 * 激活：写入默认主题配置并刷新 rewrite。
	 */
	public static function activate() {
		add_option(
			SUTWX_API_THEME_OPTION,
			array( 'presetId' => 'sut-green' )
		);
		self::register_rewrite_rules();
		flush_rewrite_rules();
	}

	/**
	 * 停用：刷新 rewrite 清理规则。
	 */
	public static function deactivate() {
		flush_rewrite_rules();
	}

	/**
	 * 后台菜单占位（设置页于 P2 实现）。
	 */
	public static function register_admin_menu() {
		// P2：add_options_page( '小程序设置', '小程序设置', 'manage_options', 'sutwx-app-api', ... )。
	}

	/**
	 * WooCommerce 未启用时给出后台提示。
	 */
	public static function woocommerce_missing_notice() {
		if ( class_exists( 'WooCommerce' ) ) {
			return;
		}
		printf(
			'<div class="notice notice-error"><p>%s</p></div>',
			esc_html__( '苏铁小程序 API：需要启用 WooCommerce 才能提供商品与分类数据。', 'sutwx-app-api' )
		);
	}
}
