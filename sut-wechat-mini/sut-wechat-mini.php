<?php
/**
 * Plugin Name: SUT微信小程序
 * Plugin URI: https://github.com/woniu336/SutWxApp
 * Description: 为WordPress网站提供微信小程序对接功能，支持内容展示、电商功能、用户管理、消息推送等。
 * Version: 1.0.0
 * Author: SUT
 * Author URI: https://github.com/woniu336
 * License: GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: sut-wechat-mini
 * Domain Path: /languages
 *
 * SUT微信小程序是一个为WordPress网站提供微信小程序对接功能的插件，
 * 支持内容展示、电商功能、用户管理、消息推送等功能。
 *
 * @package SUT_WeChat_Mini
 */

// 防止直接访问
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * 插件版本号
 */
define( 'SUT_WECHAT_MINI_VERSION', '1.0.0' );

/**
 * 插件目录绝对路径
 */
define( 'SUT_WECHAT_MINI_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * 插件URL
 */
define( 'SUT_WECHAT_MINI_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * 插件主文件路径
 */
define( 'SUT_WECHAT_MINI_PLUGIN_FILE', __FILE__ );

/**
 * 插件根目录名
 */
define( 'SUT_WECHAT_MINI_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * 加载工具函数
 */
if ( ! class_exists( 'SUT_WeChat_Mini_Utils' ) ) {
    require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/utils/class-sut-wechat-mini-utils.php';
}

/**
 * 加载安装类
 */
if ( ! class_exists( 'SUT_WeChat_Mini_Install' ) ) {
    require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/install.php';
}

/**
 * 加载加载器类
 */
if ( ! class_exists( 'SUT_WeChat_Mini_Loader' ) ) {
    require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/class-sut-wechat-mini-loader.php';
}

/**
 * 初始化插件
 *
 * @return SUT_WeChat_Mini_Loader 插件加载器实例
 */
function sut_wechat_mini_init() {
    // 检查PHP版本
    if ( version_compare( PHP_VERSION, '5.6.0', '<' ) ) {
        add_action( 'admin_notices', 'sut_wechat_mini_php_version_notice' );
        return;
    }
    
    // 检查WordPress版本
    if ( version_compare( get_bloginfo( 'version' ), '4.7', '<' ) ) {
        add_action( 'admin_notices', 'sut_wechat_mini_wp_version_notice' );
        return;
    }
    
    // 初始化加载器
    $loader = SUT_WeChat_Mini_Loader::get_instance();
    
    return $loader;
}

/**
 * 显示PHP版本不兼容通知
 */
function sut_wechat_mini_php_version_notice() {
    $notice = sprintf( 
        esc_html__( 'SUT微信小程序插件需要PHP 5.6.0或更高版本才能运行。当前您的PHP版本是 %s。请升级您的PHP版本。', 'sut-wechat-mini' ), 
        PHP_VERSION
    );
    
    echo '<div class="notice notice-error"><p>' . esc_html( $notice ) . '</p></div>';
}

/**
 * 显示WordPress版本不兼容通知
 */
function sut_wechat_mini_wp_version_notice() {
    $notice = sprintf( 
        esc_html__( 'SUT微信小程序插件需要WordPress 4.7或更高版本才能运行。当前您的WordPress版本是 %s。请升级您的WordPress版本。', 'sut-wechat-mini' ), 
        get_bloginfo( 'version' )
    );
    
    echo '<div class="notice notice-error"><p>' . esc_html( $notice ) . '</p></div>';
}

/**
 * 显示插件未配置通知
 */
function sut_wechat_mini_config_notice() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }
    
    $settings_url = admin_url( 'admin.php?page=sut-wechat-mini' );
    $notice = sprintf( 
        esc_html__( 'SUT微信小程序插件已激活，但尚未配置。请前往 %s 完成配置。', 'sut-wechat-mini' ),
        '<a href="' . esc_url( $settings_url ) . '">' . esc_html__( '设置页面', 'sut-wechat-mini' ) . '</a>'
    );
    
    echo '<div class="notice notice-warning"><p>' . wp_kses_post( $notice ) . '</p></div>';
}

/**
 * 插件激活钩子
 *
 * @param bool $network_wide 是否在网络范围内激活
 */
function sut_wechat_mini_activate( $network_wide ) {
    // 初始化安装
    SUT_WeChat_Mini_Install::activate( $network_wide );
}

/**
 * 插件停用钩子
 */
function sut_wechat_mini_deactivate() {
    // 执行停用操作
    SUT_WeChat_Mini_Install::deactivate();
}

/**
 * 插件卸载钩子
 */
function sut_wechat_mini_uninstall() {
    // 执行卸载操作
    SUT_WeChat_Mini_Install::uninstall();
}

// 注册激活、停用和卸载钩子
register_activation_hook( __FILE__, 'sut_wechat_mini_activate' );
register_deactivation_hook( __FILE__, 'sut_wechat_mini_deactivate' );
register_uninstall_hook( __FILE__, 'sut_wechat_mini_uninstall' );

/**
 * 获取插件实例
 *
 * @return SUT_WeChat_Mini_Loader|null 插件实例
 */
function sut_wechat_mini() {
    static $instance = null;
    
    if ( is_null( $instance ) ) {
        $instance = sut_wechat_mini_init();
    }
    
    return $instance;
}

/**
 * 当WordPress加载完成后初始化插件
 */
add_action( 'plugins_loaded', 'sut_wechat_mini' );

/**
 * 获取插件设置
 *
 * @return array 插件设置
 */
function sut_wechat_mini_get_settings() {
    $loader = sut_wechat_mini();
    
    if ( $loader instanceof SUT_WeChat_Mini_Loader ) {
        return $loader->get_settings();
    }
    
    return array();
}

/**
 * 检查插件是否配置正确
 *
 * @return bool 是否配置正确
 */
function sut_wechat_mini_is_configured() {
    $loader = sut_wechat_mini();
    
    if ( $loader instanceof SUT_WeChat_Mini_Loader ) {
        return $loader->is_configured();
    }
    
    return false;
}

/**
 * 获取插件版本号
 *
 * @return string 版本号
 */
function sut_wechat_mini_get_version() {
    return SUT_WECHAT_MINI_VERSION;
}

/**
 * 获取插件目录路径
 *
 * @return string 目录路径
 */
function sut_wechat_mini_get_plugin_dir() {
    return SUT_WECHAT_MINI_PLUGIN_DIR;
}

/**
 * 获取插件URL
 *
 * @return string 插件URL
 */
function sut_wechat_mini_get_plugin_url() {
    return SUT_WECHAT_MINI_PLUGIN_URL;
}

/**
 * 获取资源文件URL
 *
 * @param string $path 资源路径
 * @return string 资源URL
 */
function sut_wechat_mini_get_asset_url( $path ) {
    $loader = sut_wechat_mini();
    
    if ( $loader instanceof SUT_WeChat_Mini_Loader ) {
        return $loader->get_asset_url( $path );
    }
    
    return SUT_WECHAT_MINI_PLUGIN_URL . 'assets/' . ltrim( $path, '/' );
}

/**
 * 获取API基础URL
 *
 * @return string API基础URL
 */
function sut_wechat_mini_get_api_base_url() {
    $loader = sut_wechat_mini();
    
    if ( $loader instanceof SUT_WeChat_Mini_Loader ) {
        return $loader->get_api_base_url();
    }
    
    return home_url( 'sut-wechat-mini-api/' );
}

/**
 * 日志记录函数
 *
 * @param mixed $message 日志消息
 * @param string $level 日志级别
 */
function sut_wechat_mini_log( $message, $level = 'info' ) {
    $settings = sut_wechat_mini_get_settings();
    
    // 检查是否启用日志
    if ( empty( $settings['enable_log'] ) ) {
        return;
    }
    
    // 如果是对象或数组，转换为JSON
    if ( is_object( $message ) || is_array( $message ) ) {
        $message = json_encode( $message, JSON_UNESCAPED_UNICODE );
    }
    
    // 构建日志内容
    $log_content = date( 'Y-m-d H:i:s' ) . ' [' . strtoupper( $level ) . '] ' . $message . "\n";
    
    // 写入日志文件
    $log_file = SUT_WECHAT_MINI_PLUGIN_DIR . 'logs/' . date( 'Y-m-d' ) . '.log';
    
    // 确保日志目录存在
    $log_dir = dirname( $log_file );
    
    if ( ! is_dir( $log_dir ) ) {
        wp_mkdir_p( $log_dir );
    }
    
    // 写入日志
    file_put_contents( $log_file, $log_content, FILE_APPEND );
}

/**
 * 显示API请求的错误信息
 *
 * @param string $message 错误消息
 * @param int $code 错误代码
 */
function sut_wechat_mini_api_error( $message, $code = 1 ) {
    wp_send_json_error( array(
        'code' => $code,
        'message' => $message
    ) );
}

/**
 * 显示API请求的成功信息
 *
 * @param mixed $data 响应数据
 * @param string $message 成功消息
 */
function sut_wechat_mini_api_success( $data = array(), $message = '操作成功' ) {
    wp_send_json_success( array(
        'code' => 0,
        'message' => $message,
        'data' => $data
    ) );
}

/**
 * 检查用户是否登录（微信小程序用户）
 *
 * @return bool 是否登录
 */
function sut_wechat_mini_is_user_logged_in() {
    $user_id = get_current_user_id();
    
    if ( $user_id <= 0 ) {
        return false;
    }
    
    // 检查用户是否有小程序用户meta数据
    $wechat_openid = get_user_meta( $user_id, 'sut_wechat_mini_openid', true );
    
    return ! empty( $wechat_openid );
}

/**
 * 获取当前登录的小程序用户ID
 *
 * @return int 用户ID
 */
function sut_wechat_mini_get_current_user_id() {
    if ( sut_wechat_mini_is_user_logged_in() ) {
        return get_current_user_id();
    }
    
    return 0;
}

/**
 * 获取小程序用户信息
 *
 * @param int $user_id 用户ID
 * @return array 用户信息
 */
function sut_wechat_mini_get_user_info( $user_id = 0 ) {
    if ( empty( $user_id ) ) {
        $user_id = sut_wechat_mini_get_current_user_id();
    }
    
    if ( empty( $user_id ) ) {
        return array();
    }
    
    $user = get_user_by( 'id', $user_id );
    
    if ( ! $user ) {
        return array();
    }
    
    // 获取用户基本信息
    $user_info = array(
        'id' => $user->ID,
        'username' => $user->user_login,
        'nickname' => $user->display_name,
        'avatar' => get_avatar_url( $user->ID ),
        'email' => $user->user_email,
        'register_date' => $user->user_registered,
    );
    
    // 获取小程序特定的用户信息
    $wechat_info = array(
        'openid' => get_user_meta( $user_id, 'sut_wechat_mini_openid', true ),
        'unionid' => get_user_meta( $user_id, 'sut_wechat_mini_unionid', true ),
        'nickname' => get_user_meta( $user_id, 'sut_wechat_mini_nickname', true ),
        'avatar' => get_user_meta( $user_id, 'sut_wechat_mini_avatar', true ),
        'gender' => get_user_meta( $user_id, 'sut_wechat_mini_gender', true ),
        'country' => get_user_meta( $user_id, 'sut_wechat_mini_country', true ),
        'province' => get_user_meta( $user_id, 'sut_wechat_mini_province', true ),
        'city' => get_user_meta( $user_id, 'sut_wechat_mini_city', true ),
        'language' => get_user_meta( $user_id, 'sut_wechat_mini_language', true ),
    );
    
    // 合并信息
    $user_info['wechat_info'] = $wechat_info;
    
    return $user_info;
}

/**
 * 检查是否启用了电商功能
 *
 * @return bool 是否启用
 */
function sut_wechat_mini_is_ecommerce_enabled() {
    return class_exists( 'WooCommerce' );
}

/**
 * 获取插件支持的功能列表
 *
 * @return array 功能列表
 */
function sut_wechat_mini_get_supported_features() {
    $features = array(
        'content' => true,       // 内容展示
        'users' => true,         // 用户管理
        'messages' => true,      // 消息推送
        'points' => true,        // 积分系统
        'cache' => true,         // 缓存系统
    );
    
    // 检查电商功能
    $features['ecommerce'] = sut_wechat_mini_is_ecommerce_enabled();
    
    // 检查支付功能
    if ( $features['ecommerce'] ) {
        $settings = sut_wechat_mini_get_settings();
        $features['payment'] = ! empty( $settings['mch_id'] ) && ! empty( $settings['api_key'] );
    } else {
        $features['payment'] = false;
    }
    
    return $features;
}

/**
 * 检查功能是否可用
 *
 * @param string $feature 功能名称
 * @return bool 是否可用
 */
function sut_wechat_mini_is_feature_available( $feature ) {
    $features = sut_wechat_mini_get_supported_features();
    
    return isset( $features[ $feature ] ) && $features[ $feature ];
}

/**
 * 获取插件的状态信息
 *
 * @return array 状态信息
 */
function sut_wechat_mini_get_status() {
    $status = array(
        'version' => SUT_WECHAT_MINI_VERSION,
        'configured' => sut_wechat_mini_is_configured(),
        'php_version' => PHP_VERSION,
        'wp_version' => get_bloginfo( 'version' ),
        'features' => sut_wechat_mini_get_supported_features(),
        'multisite' => is_multisite(),
        'ssl' => is_ssl(),
    );
    
    return $status;
}

/**
 * 获取插件的调试信息
 *
 * @return array 调试信息
 */
function sut_wechat_mini_get_debug_info() {
    $debug_info = array(
        'status' => sut_wechat_mini_get_status(),
        'settings' => sut_wechat_mini_get_settings(),
        'constants' => array(
            'SUT_WECHAT_MINI_VERSION' => SUT_WECHAT_MINI_VERSION,
            'SUT_WECHAT_MINI_PLUGIN_DIR' => SUT_WECHAT_MINI_PLUGIN_DIR,
            'SUT_WECHAT_MINI_PLUGIN_URL' => SUT_WECHAT_MINI_PLUGIN_URL,
            'SUT_WECHAT_MINI_PLUGIN_FILE' => SUT_WECHAT_MINI_PLUGIN_FILE,
            'SUT_WECHAT_MINI_PLUGIN_BASENAME' => SUT_WECHAT_MINI_PLUGIN_BASENAME,
            'ABSPATH' => ABSPATH,
        ),
        'server' => array(
            'PHP_OS' => PHP_OS,
            'SERVER_SOFTWARE' => isset( $_SERVER['SERVER_SOFTWARE'] ) ? $_SERVER['SERVER_SOFTWARE'] : '',
            'PHP_MAX_INPUT_VARS' => ini_get( 'max_input_vars' ),
            'PHP_MAX_EXECUTION_TIME' => ini_get( 'max_execution_time' ),
            'PHP_MEMORY_LIMIT' => ini_get( 'memory_limit' ),
        ),
        'active_plugins' => get_option( 'active_plugins', array() ),
        'theme' => wp_get_theme()->get( 'Name' ) . ' ' . wp_get_theme()->get( 'Version' ),
    );
    
    return $debug_info;
}