<?php
/**
 * 文件名: sut-wechat-mini.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: Sut微信小程序WordPress插件主文件
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

// 检查WordPress环境和必要函数
if (!function_exists('plugin_dir_path') || 
    !function_exists('plugin_dir_url') || 
    !function_exists('plugin_basename') || 
    !function_exists('add_action') || 
    !function_exists('register_activation_hook') || 
    !function_exists('register_deactivation_hook')) {
    exit('This plugin requires WordPress to be installed properly.');
}

// 检查PHP版本
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    exit('This plugin requires PHP version 7.4.0 or higher.');
}

// 定义插件常量
define('SUT_WECHAT_MINI_VERSION', '1.0.0');
define('SUT_WECHAT_MINI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SUT_WECHAT_MINI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SUT_WECHAT_MINI_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * 主插件类
 */
class Sut_WeChat_Mini {
    
    /**
     * 插件实例
     * @var Sut_WeChat_Mini
     */
    private static $instance = null;
    
    /**
     * 插件加载器
     * @var Sut_WeChat_Mini_Loader
     */
    private $loader;
    
    /**
     * 获取插件单例实例
     * @return Sut_WeChat_Mini
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 构造函数
     */
    private function __construct() {
        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->define_api_hooks();
    }
    
    /**
     * 加载插件依赖文件
     */
    private function load_dependencies() {
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/class-sut-wechat-mini-loader.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/install.php';
        
        // 核心功能模块
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/admin/class-sut-wechat-mini-admin.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/api/class-sut-wechat-mini-api.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/users/class-sut-wechat-mini-users.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/payments/class-sut-wechat-mini-pay.php';
        
        // 功能模块
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/cache/class-sut-wechat-mini-cache.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/content/class-sut-wechat-mini-content.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/messages/class-sut-wechat-mini-messages.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/points/class-sut-wechat-mini-points.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/utils/class-sut-wechat-mini-utils.php';
        
        // 新增的核心类
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/class-sut-wechat-mini-database.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/class-sut-wechat-mini-security.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/class-sut-wechat-mini-logger.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/class-sut-wechat-mini-points-api.php';
        require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/user/class-sut-wechat-mini-user.php';
        
        // 如果WooCommerce存在，加载WooCommerce集成
        if (class_exists('WooCommerce')) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/woocommerce/class-sut-wechat-mini-woocommerce.php';
        }
        
        $this->loader = new Sut_WeChat_Mini_Loader();
    }
    
    /**
     * 设置本地化
     */
    private function set_locale() {
        if (function_exists('add_action')) {
            add_action('plugins_loaded', array($this, 'load_plugin_textdomain'));
        }
    }
    
    /**
     * 加载插件文本域
     */
    public function load_plugin_textdomain() {
        if (function_exists('load_plugin_textdomain')) {
            load_plugin_textdomain(
                'sut-wechat-mini',
                false,
                dirname(SUT_WECHAT_MINI_PLUGIN_BASENAME) . '/languages/'
            );
        }
    }
    
    /**
     * 注册管理员钩子
     */
    private function define_admin_hooks() {
        if (!class_exists('Sut_WeChat_Mini_Admin')) {
            return;
        }
        
        $plugin_admin = new Sut_WeChat_Mini_Admin($this->get_version());
        
        // 添加管理菜单
        $this->loader->add_action('admin_menu', $plugin_admin, 'add_plugin_admin_menu');
        
        // 注册设置
        $this->loader->add_action('admin_init', $plugin_admin, 'register_settings');
        
        // 加载管理员样式和脚本
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');
    }
    
    /**
     * 注册公共钩子
     */
    private function define_public_hooks() {
        // 加载公共样式和脚本
        $this->loader->add_action('wp_enqueue_scripts', $this, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $this, 'enqueue_scripts');
        
        // 注册REST API路由
        $this->loader->add_action('rest_api_init', $this, 'register_api_routes');
    }
    
    /**
     * 注册API钩子
     */
    private function define_api_hooks() {
        if (!class_exists('Sut_WeChat_Mini_API')) {
            return;
        }
        
        $plugin_api = new Sut_WeChat_Mini_API($this->get_version());
        
        // 注册API端点
        $this->loader->add_action('rest_api_init', $plugin_api, 'register_routes');
    }
    
    /**
     * 加载公共样式
     */
    public function enqueue_styles() {
        if (function_exists('wp_enqueue_style')) {
            wp_enqueue_style(
                'sut-wechat-mini-public',
                SUT_WECHAT_MINI_PLUGIN_URL . 'assets/css/public.css',
                array(),
                $this->get_version(),
                'all'
            );
        }
    }
    
    /**
     * 加载公共脚本
     */
    public function enqueue_scripts() {
        if (function_exists('wp_enqueue_script')) {
            wp_enqueue_script(
                'sut-wechat-mini-public',
                SUT_WECHAT_MINI_PLUGIN_URL . 'assets/js/public.js',
                array('jquery'),
                $this->get_version(),
                true
            );
        }
    }
    
    /**
     * 注册API路由
     */
    public function register_api_routes() {
        // API路由将在API类中注册
    }
    
    /**
     * 插件激活
     */
    public static function activate() {
        // 执行安装逻辑
        Sut_WeChat_Mini_Install::install();
        
        // 添加重写规则
        if (function_exists('flush_rewrite_rules')) {
            flush_rewrite_rules();
        }
    }
    
    /**
     * 插件停用
     */
    public static function deactivate() {
        // 清理重写规则
        if (function_exists('flush_rewrite_rules')) {
            flush_rewrite_rules();
        }
    }
    
    /**
     * 运行插件加载器
     */
    public function run() {
        $this->loader->run();
    }
    
    /**
     * 获取插件版本
     * @return string
     */
    public function get_version() {
        return SUT_WECHAT_MINI_VERSION;
    }
}

// 初始化插件
function sut_wechat_mini_run() {
    $plugin = Sut_WeChat_Mini::get_instance();
    $plugin->run();
    return $plugin;
}

// 注册激活和停用钩子
if (function_exists('register_activation_hook')) {
    register_activation_hook(__FILE__, array('Sut_WeChat_Mini', 'activate'));
}
if (function_exists('register_deactivation_hook')) {
    register_deactivation_hook(__FILE__, array('Sut_WeChat_Mini', 'deactivate'));
}

// 让插件开始工作
if (function_exists('add_action')) {
    add_action('plugins_loaded', 'sut_wechat_mini_run');
} else {
    // 如果add_action函数不存在，直接运行插件
    sut_wechat_mini_run();
}