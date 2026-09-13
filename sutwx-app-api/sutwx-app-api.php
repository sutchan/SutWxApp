<?php
/**
 * Plugin Name:       苏铁小程序 API
 * Plugin URI:        https://github.com/sutchan/SutWxApp
 * Description:       为「苏铁」微信小程序提供 headless REST API（/api/* 路径、{code,data} 包络）。商品与分类数据源为 WooCommerce，文章为 WP 核心。v1 为只读 MVP。
 * Version:           0.3.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * Author:            Sut
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       sutwx-app-api
 *
 * @package SutwxAppApi
 * @version 0.3.0
 */

defined( 'ABSPATH' ) || exit;

define( 'SUTWX_API_VERSION', '0.3.0' );
define( 'SUTWX_API_FILE', __FILE__ );
define( 'SUTWX_API_DIR', plugin_dir_path( __FILE__ ) );
define( 'SUTWX_API_REST_NS', 'sutwx/v1' );
define( 'SUTWX_API_THEME_OPTION', 'sutwx_theme' );

require_once SUTWX_API_DIR . 'includes/class-rest-base.php';
require_once SUTWX_API_DIR . 'includes/class-settings.php';
require_once SUTWX_API_DIR . 'includes/class-loader.php';

register_activation_hook( __FILE__, array( 'Sutwx_Loader', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Sutwx_Loader', 'deactivate' ) );

Sutwx_Loader::init();
