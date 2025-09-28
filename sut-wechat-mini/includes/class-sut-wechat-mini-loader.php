<?php
/**
 * SUT微信小程序加载器类
 *
 * 负责加载和初始化插件的各个功能模块
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Loader 类
 */
class SUT_WeChat_Mini_Loader {
    
    /**
     * 单例实例
     *
     * @var SUT_WeChat_Mini_Loader
     */
    private static $instance = null;
    
    /**
     * 已注册的钩子列表
     *
     * @var array
     */
    protected $hooks = array();
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 注册自动加载
        $this->register_autoloader();
        
        // 初始化插件
        $this->init();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_Loader
     */
    public static function get_instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 注册自动加载
     */
    private function register_autoloader() {
        spl_autoload_register( array( $this, 'autoload' ) );
    }
    
    /**
     * 自动加载类文件
     *
     * @param string $class 类名
     */
    public function autoload( $class ) {
        // 只处理SUT_WeChat_Mini开头的类
        if ( 0 !== strpos( $class, 'SUT_WeChat_Mini_' ) ) {
            return;
        }
        
        // 转换类名为文件路径
        $class_path = str_replace( 'SUT_WeChat_Mini_', '', $class );
        $class_path = strtolower( str_replace( '_', '-', $class_path ) );
        
        // 构建文件路径
        $parts = explode( '-', $class_path );
        $module = '';
        $file_name = '';
        
        if ( count( $parts ) > 1 ) {
            $module = $parts[0];
            $file_name = 'class-sut-wechat-mini-' . $class_path . '.php';
        } else {
            $file_name = 'class-sut-wechat-mini-' . $class_path . '.php';
        }
        
        // 确定文件位置
        $file_path = '';
        
        if ( ! empty( $module ) ) {
            // 检查模块目录
            $module_dir = SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/' . $module . '/';
            
            if ( file_exists( $module_dir . $file_name ) ) {
                $file_path = $module_dir . $file_name;
            }
        }
        
        // 检查根目录
        if ( empty( $file_path ) ) {
            $root_dir = SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/';
            
            if ( file_exists( $root_dir . $file_name ) ) {
                $file_path = $root_dir . $file_name;
            }
        }
        
        // 加载文件
        if ( ! empty( $file_path ) && file_exists( $file_path ) ) {
            require_once $file_path;
        }
    }
    
    /**
     * 初始化插件
     */
    private function init() {
        // 加载文本域
        $this->load_textdomain();
        
        // 注册钩子
        $this->register_hooks();
        
        // 加载API模块
        $this->load_api();
        
        // 加载用户模块
        $this->load_users();
        
        // 加载内容模块
        $this->load_content();
        
        // 加载WooCommerce模块（如果安装了WooCommerce）
        $this->load_woocommerce();
        
        // 加载支付模块
        $this->load_payments();
        
        // 加载消息模块
        $this->load_messages();
        
        // 加载积分模块
        $this->load_points();
        
        // 加载缓存模块
        $this->load_cache();
        
        // 加载管理模块
        $this->load_admin();
    }
    
    /**
     * 加载文本域
     */
    private function load_textdomain() {
        load_plugin_textdomain( 'sut-wechat-mini', false, basename( SUT_WECHAT_MINI_PLUGIN_DIR ) . '/languages' );
    }
    
    /**
     * 注册钩子
     */
    private function register_hooks() {
        // 激活钩子
        register_activation_hook( SUT_WECHAT_MINI_PLUGIN_FILE, array( 'SUT_WeChat_Mini_Install', 'activate' ) );
        
        // 停用钩子
        register_deactivation_hook( SUT_WECHAT_MINI_PLUGIN_FILE, array( 'SUT_WeChat_Mini_Install', 'deactivate' ) );
        
        // 卸载钩子
        register_uninstall_hook( SUT_WECHAT_MINI_PLUGIN_FILE, array( 'SUT_WeChat_Mini_Install', 'uninstall' ) );
        
        // WordPress初始化钩子
        add_action( 'init', array( $this, 'on_init' ) );
        
        // 插件加载完成钩子
        add_action( 'plugins_loaded', array( $this, 'on_plugins_loaded' ) );
        
        // 模板重定向钩子
        add_action( 'template_redirect', array( $this, 'on_template_redirect' ) );
    }
    
    /**
     * 加载API模块
     */
    private function load_api() {
        // 导入API类
        if ( ! class_exists( 'SUT_WeChat_Mini_API' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/api/class-sut-wechat-mini-api.php';
        }
        
        // 初始化API
        $api = SUT_WeChat_Mini_API::get_instance();
        // 注意：init()方法在构造函数中已自动调用，无需再次调用
    }
    
    /**
     * 加载用户模块
     */
    private function load_users() {
        // 导入用户类
        if ( ! class_exists( 'SUT_WeChat_Mini_Users' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/users/class-sut-wechat-mini-users.php';
        }
        
        // 初始化用户模块
        $users = SUT_WeChat_Mini_Users::get_instance();
        // 注意：init()方法在构造函数中已自动调用，无需再次调用
    }
    
    /**
     * 加载内容模块
     */
    private function load_content() {
        // 导入内容类
        if ( ! class_exists( 'SUT_WeChat_Mini_Content' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/content/class-sut-wechat-mini-content.php';
        }
        
        // 初始化内容模块
        $content = SUT_WeChat_Mini_Content::get_instance();
        // 注意：init()方法在构造函数中已自动调用，无需再次调用
    }
    
    /**
     * 加载WooCommerce模块
     */
    private function load_woocommerce() {
        // 检查WooCommerce是否激活
        if ( class_exists( 'WooCommerce' ) ) {
            // 导入WooCommerce类
            if ( ! class_exists( 'SUT_WeChat_Mini_WooCommerce' ) ) {
                require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/woocommerce/class-sut-wechat-mini-woocommerce.php';
            }
            
            // 初始化WooCommerce模块
            $woocommerce = SUT_WeChat_Mini_WooCommerce::get_instance();
            $woocommerce->init();
        }
    }
    
    /**
     * 加载支付模块
     */
    private function load_payments() {
        // 导入支付类
        if ( ! class_exists( 'SUT_WeChat_Mini_Pay' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/payments/class-sut-wechat-mini-pay.php';
        }
        
        // 初始化支付模块
        $pay = SUT_WeChat_Mini_Pay::get_instance();
        // 注意：init()方法在构造函数中已自动调用，无需再次调用
    }
    
    /**
     * 加载消息模块
     */
    private function load_messages() {
        // 导入消息类
        if ( ! class_exists( 'SUT_WeChat_Mini_Messages' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/messages/class-sut-wechat-mini-messages.php';
        }
        
        // 初始化消息模块
        $messages = SUT_WeChat_Mini_Messages::get_instance();
        // 消息模块不需要单独的init方法，构造函数已经处理了初始化
    }
    
    /**
     * 加载积分模块
     */
    private function load_points() {
        // 导入积分类
        if ( ! class_exists( 'SUT_WeChat_Mini_Points' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/points/class-sut-wechat-mini-points.php';
        }
        
        // 初始化积分模块
        $points = SUT_WeChat_Mini_Points::get_instance();
        // 积分模块不需要单独的init方法，构造函数已经处理了初始化
    }
    
    /**
     * 加载缓存模块
     */
    private function load_cache() {
        // 导入缓存类
        if ( ! class_exists( 'SUT_WeChat_Mini_Cache' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/cache/class-sut-wechat-mini-cache.php';
        }
        
        // 初始化缓存模块
        $cache = SUT_WeChat_Mini_Cache::get_instance();
        // 缓存模块不需要单独的init方法，构造函数已经处理了初始化
    }
    
    /**
     * 加载管理模块
     */
    private function load_admin() {
        // 只在后台加载管理模块
        if ( is_admin() ) {
            // 导入管理类
            if ( ! class_exists( 'SUT_WeChat_Mini_Admin' ) ) {
                require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/admin/class-sut-wechat-mini-admin.php';
            }
            
            // 初始化管理模块
            $admin = SUT_WeChat_Mini_Admin::get_instance();
            // 注意：init()方法在构造函数中已自动调用，无需再次调用
        }
    }
    
    /**
     * 处理WordPress初始化事件
     */
    public function on_init() {
        // 注册重写规则
        $this->register_rewrite_rules();
        
        // 注册自定义查询变量
        $this->register_query_vars();
        
        // 注册自定义文章类型和分类法
        $this->register_post_types_and_taxonomies();
    }
    
    /**
     * 处理插件加载完成事件
     */
    public function on_plugins_loaded() {
        // 触发插件加载完成钩子
        do_action( 'sut_wechat_mini_loaded' );
    }
    
    /**
     * 处理模板重定向事件
     */
    public function on_template_redirect() {
        // 检查是否是API请求
        if ( $this->is_api_request() ) {
            // 不执行模板重定向
            return;
        }
    }
    
    /**
     * 注册重写规则
     */
    private function register_rewrite_rules() {
        // API重写规则由API模块处理
    }
    
    /**
     * 注册自定义查询变量
     */
    private function register_query_vars() {
        global $wp;
        
        $wp->add_query_var( 'sut_wechat_mini_api' );
        $wp->add_query_var( 'sut_wechat_mini_action' );
        $wp->add_query_var( 'sut_wechat_mini_token' );
    }
    
    /**
     * 注册自定义文章类型和分类法
     */
    private function register_post_types_and_taxonomies() {
        // 注册小程序页面文章类型
        register_post_type( 'sut_wechat_mini_page', array(
            'labels' => array(
                'name' => __( '小程序页面', 'sut-wechat-mini' ),
                'singular_name' => __( '小程序页面', 'sut-wechat-mini' ),
                'add_new' => __( '添加新页面', 'sut-wechat-mini' ),
                'add_new_item' => __( '添加新小程序页面', 'sut-wechat-mini' ),
                'edit_item' => __( '编辑小程序页面', 'sut-wechat-mini' ),
                'new_item' => __( '新小程序页面', 'sut-wechat-mini' ),
                'view_item' => __( '查看小程序页面', 'sut-wechat-mini' ),
                'search_items' => __( '搜索小程序页面', 'sut-wechat-mini' ),
                'not_found' => __( '未找到小程序页面', 'sut-wechat-mini' ),
                'not_found_in_trash' => __( '回收站中未找到小程序页面', 'sut-wechat-mini' ),
                'parent_item_colon' => __( '父级页面:', 'sut-wechat-mini' ),
                'menu_name' => __( '小程序页面', 'sut-wechat-mini' ),
            ),
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => 'sut-wechat-mini',
            'query_var' => true,
            'rewrite' => array( 'slug' => 'sut-wechat-mini-page' ),
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => null,
            'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' )
        ) );
        
        // 注册小程序模板分类法
        register_taxonomy( 'sut_wechat_mini_template', 'sut_wechat_mini_page', array(
            'labels' => array(
                'name' => __( '页面模板', 'sut-wechat-mini' ),
                'singular_name' => __( '页面模板', 'sut-wechat-mini' ),
                'search_items' => __( '搜索页面模板', 'sut-wechat-mini' ),
                'all_items' => __( '所有页面模板', 'sut-wechat-mini' ),
                'parent_item' => __( '父级模板', 'sut-wechat-mini' ),
                'parent_item_colon' => __( '父级模板:', 'sut-wechat-mini' ),
                'edit_item' => __( '编辑页面模板', 'sut-wechat-mini' ),
                'update_item' => __( '更新页面模板', 'sut-wechat-mini' ),
                'add_new_item' => __( '添加新页面模板', 'sut-wechat-mini' ),
                'new_item_name' => __( '新页面模板名称', 'sut-wechat-mini' ),
                'menu_name' => __( '页面模板', 'sut-wechat-mini' ),
            ),
            'hierarchical' => true,
            'public' => true,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_nav_menus' => true,
            'show_tagcloud' => false,
            'rewrite' => array( 'slug' => 'sut-wechat-mini-template' ),
        ) );
    }
    
    /**
     * 检查是否是API请求
     *
     * @return bool 是否是API请求
     */
    private function is_api_request() {
        global $wp;
        
        $api_var = get_query_var( 'sut_wechat_mini_api', '' );
        
        return ! empty( $api_var );
    }
    
    /**
     * 注册一个动作钩子
     *
     * @param string $tag 钩子标签
     * @param callable $function_to_add 要添加的函数
     * @param int $priority 优先级
     * @param int $accepted_args 接受的参数数量
     * @return bool 操作结果
     */
    public function add_action( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
        $this->hooks[] = array(
            'type' => 'action',
            'tag' => $tag,
            'function_to_add' => $function_to_add,
            'priority' => $priority,
            'accepted_args' => $accepted_args
        );
        
        return add_action( $tag, $function_to_add, $priority, $accepted_args );
    }
    
    /**
     * 注册一个过滤器钩子
     *
     * @param string $tag 钩子标签
     * @param callable $function_to_add 要添加的函数
     * @param int $priority 优先级
     * @param int $accepted_args 接受的参数数量
     * @return bool 操作结果
     */
    public function add_filter( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
        $this->hooks[] = array(
            'type' => 'filter',
            'tag' => $tag,
            'function_to_add' => $function_to_add,
            'priority' => $priority,
            'accepted_args' => $accepted_args
        );
        
        return add_filter( $tag, $function_to_add, $priority, $accepted_args );
    }
    
    /**
     * 获取已注册的钩子
     *
     * @return array 钩子列表
     */
    public function get_hooks() {
        return $this->hooks;
    }
    
    /**
     * 获取插件设置
     *
     * @return array 插件设置
     */
    public function get_settings() {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 合并默认设置
        $default_settings = $this->get_default_settings();
        $settings = array_merge( $default_settings, $settings );
        
        return $settings;
    }
    
    /**
     * 获取默认设置
     *
     * @return array 默认设置
     */
    private function get_default_settings() {
        return array(
            'app_id' => '',
            'app_secret' => '',
            'mch_id' => '',
            'api_key' => '',
            'notify_url' => '',
            'cache_ttl' => 3600,
            'enable_log' => 0,
            'enable_template_message' => 1,
            'template_message_order_paid' => '',
            'template_message_order_shipped' => '',
            'template_message_refund_success' => '',
        );
    }
    
    /**
     * 检查插件是否配置正确
     *
     * @return bool 是否配置正确
     */
    public function is_configured() {
        $settings = $this->get_settings();
        
        // 检查必要的配置项
        if ( empty( $settings['app_id'] ) || empty( $settings['app_secret'] ) ) {
            return false;
        }
        
        // 如果启用了支付功能，检查支付配置
        if ( class_exists( 'WooCommerce' ) && empty( $settings['mch_id'] ) && empty( $settings['api_key'] ) ) {
            // 支付配置不完整，但不是致命错误
        }
        
        return true;
    }
    
    /**
     * 获取插件版本号
     *
     * @return string 版本号
     */
    public function get_version() {
        return SUT_WECHAT_MINI_VERSION;
    }
    
    /**
     * 获取插件目录路径
     *
     * @return string 目录路径
     */
    public function get_plugin_dir() {
        return SUT_WECHAT_MINI_PLUGIN_DIR;
    }
    
    /**
     * 获取插件URL
     *
     * @return string 插件URL
     */
    public function get_plugin_url() {
        return SUT_WECHAT_MINI_PLUGIN_URL;
    }
    
    /**
     * 获取插件文件路径
     *
     * @return string 文件路径
     */
    public function get_plugin_file() {
        return SUT_WECHAT_MINI_PLUGIN_FILE;
    }
    
    /**
     * 获取插件基本URL
     *
     * @return string 基本URL
     */
    public function get_base_url() {
        return home_url();
    }
    
    /**
     * 获取API基础URL
     *
     * @return string API基础URL
     */
    public function get_api_base_url() {
        return home_url( 'sut-wechat-mini-api/' );
    }
    
    /**
     * 获取资源文件URL
     *
     * @param string $path 资源路径
     * @return string 资源URL
     */
    public function get_asset_url( $path ) {
        return $this->get_plugin_url() . 'assets/' . ltrim( $path, '/' );
    }
    
    /**
     * 获取模板文件路径
     *
     * @param string $template_name 模板名称
     * @return string 模板文件路径
     */
    public function get_template_path( $template_name ) {
        $template_path = $this->get_plugin_dir() . 'templates/' . $template_name;
        
        // 检查主题是否有覆盖模板
        $theme_template_path = get_stylesheet_directory() . '/sut-wechat-mini/' . $template_name;
        
        if ( file_exists( $theme_template_path ) ) {
            $template_path = $theme_template_path;
        }
        
        return $template_path;
    }
    
    /**
     * 加载模板文件
     *
     * @param string $template_name 模板名称
     * @param array $args 参数数组
     * @return bool 是否加载成功
     */
    public function load_template( $template_name, $args = array() ) {
        $template_path = $this->get_template_path( $template_name );
        
        if ( ! file_exists( $template_path ) ) {
            return false;
        }
        
        // 提取参数变量
        if ( ! empty( $args ) && is_array( $args ) ) {
            extract( $args );
        }
        
        // 加载模板
        include $template_path;
        
        return true;
    }
}