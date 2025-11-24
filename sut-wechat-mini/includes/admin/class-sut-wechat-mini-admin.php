<?php
/**
 * 文件名: class-sut-wechat-mini-admin.php
 * 版本号: 1.0.0
 * 更新日期: 2025-06-23
 * 管理员功能类
 * 
 * 负责处理WordPress后台管理界面相关功能
 * 包括设置页面、数据统计、用户管理等
 *
 * @package SutWeChatMini
 * @subpackage Admin
 * @author Sut
 * @copyright Copyright (c) 2025, Sut
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 管理员功能类
 */
class Sut_WeChat_Mini_Admin {

    /**
     * 单例实例
     *
     * @var Sut_WeChat_Mini_Admin
     */
    private static $instance = null;

    /**
     * 插件设置页面标识
     *
     * @var string
     */
    private $settings_page_slug = 'sut-wechat-mini-settings';

    /**
     * 获取单例实例
     *
     * @return Sut_WeChat_Mini_Admin
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
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // 添加管理栏快捷菜单
        add_action('admin_bar_menu', array($this, 'add_admin_bar_menu'), 100);
        
        // 添加小工具
        add_action('wp_dashboard_setup', array($this, 'add_dashboard_widgets'));
    }

    /**
     * 添加管理菜单
     */
    public function add_admin_menu() {
        // 主菜单
        add_menu_page(
            __('微信小程序设置', 'sut-wechat-mini'),
            __('微信小程序', 'sut-wechat-mini'),
            'manage_options',
            $this->settings_page_slug,
            array($this, 'render_settings_page'),
            'dashicons-smartphone',
            30
        );
        
        // 子菜单 - 基本设置
        add_submenu_page(
            $this->settings_page_slug,
            __('基本设置', 'sut-wechat-mini'),
            __('基本设置', 'sut-wechat-mini'),
            'manage_options',
            $this->settings_page_slug,
            array($this, 'render_settings_page')
        );
        
        // 子菜单 - 数据统计
        add_submenu_page(
            $this->settings_page_slug,
            __('数据统计', 'sut-wechat-mini'),
            __('数据统计', 'sut-wechat-mini'),
            'manage_options',
            'sut-wechat-mini-stats',
            array($this, 'render_stats_page')
        );
        
        // 子菜单 - 用户管理
        add_submenu_page(
            $this->settings_page_slug,
            __('小程序用户', 'sut-wechat-mini'),
            __('小程序用户', 'sut-wechat-mini'),
            'manage_options',
            'sut-wechat-mini-users',
            array($this, 'render_users_page')
        );
        
        // 子菜单 - 积分管理
        add_submenu_page(
            $this->settings_page_slug,
            __('积分管理', 'sut-wechat-mini'),
            __('积分管理', 'sut-wechat-mini'),
            'manage_options',
            'sut-wechat-mini-points',
            array($this, 'render_points_page')
        );
    }

    /**
     * 注册设置
     */
    public function register_settings() {
        // 基本设置
        register_setting('sut_wechat_mini_settings', 'sut_wechat_mini_app_id');
        register_setting('sut_wechat_mini_settings', 'sut_wechat_mini_app_secret');
        register_setting('sut_wechat_mini_settings', 'sut_wechat_mini_token');
        register_setting('sut_wechat_mini_settings', 'sut_wechat_mini_encoding_aes_key');
        register_setting('sut_wechat_mini_settings', 'sut_wechat_mini_api_base_url');
        register_setting('sut_wechat_mini_settings', 'sut_wechat_mini_enable_debug');
        
        // 支付设置
        register_setting('sut_wechat_mini_payment_settings', 'sut_wechat_mini_mch_id');
        register_setting('sut_wechat_mini_payment_settings', 'sut_wechat_mini_mch_key');
        register_setting('sut_wechat_mini_payment_settings', 'sut_wechat_mini_cert_path');
        register_setting('sut_wechat_mini_payment_settings', 'sut_wechat_mini_key_path');
        
        // 添加设置节
        add_settings_section(
            'sut_wechat_mini_basic_settings',
            __('基本设置', 'sut-wechat-mini'),
            array($this, 'render_basic_settings_section'),
            'sut-wechat-mini-settings'
        );
        
        add_settings_section(
            'sut_wechat_mini_payment_settings',
            __('支付设置', 'sut-wechat-mini'),
            array($this, 'render_payment_settings_section'),
            'sut-wechat-mini-settings'
        );
        
        // 添加设置字段
        add_settings_field(
            'sut_wechat_mini_app_id',
            __('小程序AppID', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_basic_settings',
            array('name' => 'sut_wechat_mini_app_id', 'description' => __('微信小程序的AppID', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_app_secret',
            __('小程序AppSecret', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_basic_settings',
            array('name' => 'sut_wechat_mini_app_secret', 'description' => __('微信小程序的AppSecret', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_token',
            __('服务器验证Token', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_basic_settings',
            array('name' => 'sut_wechat_mini_token', 'description' => __('用于验证微信服务器的Token', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_encoding_aes_key',
            __('消息加解密密钥', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_basic_settings',
            array('name' => 'sut_wechat_mini_encoding_aes_key', 'description' => __('消息加解密密钥，可选', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_api_base_url',
            __('API基础URL', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_basic_settings',
            array('name' => 'sut_wechat_mini_api_base_url', 'description' => __('API基础URL，如：https://api.example.com/wxapp/v1', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_enable_debug',
            __('启用调试模式', 'sut-wechat-mini'),
            array($this, 'render_checkbox_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_basic_settings',
            array('name' => 'sut_wechat_mini_enable_debug', 'description' => __('启用调试模式将记录更多日志信息', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_mch_id',
            __('微信支付商户号', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_payment_settings',
            array('name' => 'sut_wechat_mini_mch_id', 'description' => __('微信支付商户号', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_mch_key',
            __('微信支付API密钥', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_payment_settings',
            array('name' => 'sut_wechat_mini_mch_key', 'description' => __('微信支付API密钥', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_cert_path',
            __('证书路径', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_payment_settings',
            array('name' => 'sut_wechat_mini_cert_path', 'description' => __('微信支付证书路径，如：/path/to/cert/apiclient_cert.pem', 'sut-wechat-mini'))
        );
        
        add_settings_field(
            'sut_wechat_mini_key_path',
            __('私钥路径', 'sut-wechat-mini'),
            array($this, 'render_text_field'),
            'sut-wechat-mini-settings',
            'sut_wechat_mini_payment_settings',
            array('name' => 'sut_wechat_mini_key_path', 'description' => __('微信支付私钥路径，如：/path/to/cert/apiclient_key.pem', 'sut-wechat-mini'))
        );
    }

    /**
     * 渲染基本设置节
     */
    public function render_basic_settings_section() {
        echo '<p>' . __('配置微信小程序的基本信息', 'sut-wechat-mini') . '</p>';
    }

    /**
     * 渲染支付设置节
     */
    public function render_payment_settings_section() {
        echo '<p>' . __('配置微信支付相关信息', 'sut-wechat-mini') . '</p>';
    }

    /**
     * 渲染文本字段
     *
     * @param array $args 字段参数
     */
    public function render_text_field($args) {
        $name = $args['name'];
        $value = get_option($name);
        $description = isset($args['description']) ? $args['description'] : '';
        $type = isset($args['type']) ? $args['type'] : 'text';
        
        echo '<input type="' . esc_attr($type) . '" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '" class="regular-text" />';
        if ($description) {
            echo '<p class="description">' . esc_html($description) . '</p>';
        }
    }

    /**
     * 渲染复选框字段
     *
     * @param array $args 字段参数
     */
    public function render_checkbox_field($args) {
        $name = $args['name'];
        $value = get_option($name);
        $description = isset($args['description']) ? $args['description'] : '';
        $checked = $value ? 'checked="checked"' : '';
        
        echo '<input type="checkbox" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="1" ' . $checked . ' />';
        if ($description) {
            echo '<label for="' . esc_attr($name) . '"> ' . esc_html($description) . '</label>';
        }
    }

    /**
     * 渲染设置页面
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="sut-wechat-mini-admin-wrapper">
                <div class="sut-wechat-mini-admin-content">
                    <form method="post" action="options.php">
                        <?php
                        settings_fields('sut_wechat_mini_settings');
                        do_settings_sections('sut-wechat-mini-settings');
                        submit_button();
                        ?>
                    </form>
                </div>
                
                <div class="sut-wechat-mini-admin-sidebar">
                    <div class="sut-wechat-mini-admin-card">
                        <h3><?php _e('快速操作', 'sut-wechat-mini'); ?></h3>
                        <ul>
                            <li><a href="<?php echo admin_url('admin.php?page=sut-wechat-mini-stats'); ?>"><?php _e('查看数据统计', 'sut-wechat-mini'); ?></a></li>
                            <li><a href="<?php echo admin_url('admin.php?page=sut-wechat-mini-users'); ?>"><?php _e('管理小程序用户', 'sut-wechat-mini'); ?></a></li>
                            <li><a href="<?php echo admin_url('admin.php?page=sut-wechat-mini-points'); ?>"><?php _e('管理积分系统', 'sut-wechat-mini'); ?></a></li>
                        </ul>
                    </div>
                    
                    <div class="sut-wechat-mini-admin-card">
                        <h3><?php _e('相关链接', 'sut-wechat-mini'); ?></h3>
                        <ul>
                            <li><a href="https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/" target="_blank"><?php _e('微信小程序开发文档', 'sut-wechat-mini'); ?></a></li>
                            <li><a href="https://pay.weixin.qq.com/wiki/doc/apiv3/open/pay/chapter1_1_1.shtml" target="_blank"><?php _e('微信支付开发文档', 'sut-wechat-mini'); ?></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .sut-wechat-mini-admin-wrapper {
            display: flex;
            flex-wrap: wrap;
        }
        
        .sut-wechat-mini-admin-content {
            flex: 2;
            min-width: 600px;
            padding-right: 20px;
        }
        
        .sut-wechat-mini-admin-sidebar {
            flex: 1;
            min-width: 250px;
        }
        
        .sut-wechat-mini-admin-card {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
            margin-bottom: 20px;
            padding: 15px;
        }
        
        .sut-wechat-mini-admin-card h3 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        .sut-wechat-mini-admin-card ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .sut-wechat-mini-admin-card li {
            margin-bottom: 8px;
        }
        
        @media (max-width: 900px) {
            .sut-wechat-mini-admin-content,
            .sut-wechat-mini-admin-sidebar {
                flex: 100%;
                min-width: 100%;
            }
            
            .sut-wechat-mini-admin-content {
                padding-right: 0;
            }
        }
        </style>
        <?php
    }

    /**
     * 渲染数据统计页面
     */
    public function render_stats_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('数据统计', 'sut-wechat-mini'); ?></h1>
            
            <div class="sut-wechat-mini-stats-wrapper">
                <div class="sut-wechat-mini-stats-cards">
                    <div class="sut-wechat-mini-stats-card">
                        <h3><?php _e('用户统计', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-stats-number"><?php echo $this->get_user_count(); ?></div>
                        <p><?php _e('总用户数', 'sut-wechat-mini'); ?></p>
                    </div>
                    
                    <div class="sut-wechat-mini-stats-card">
                        <h3><?php _e('订单统计', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-stats-number"><?php echo $this->get_order_count(); ?></div>
                        <p><?php _e('总订单数', 'sut-wechat-mini'); ?></p>
                    </div>
                    
                    <div class="sut-wechat-mini-stats-card">
                        <h3><?php _e('今日活跃用户', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-stats-number"><?php echo $this->get_today_active_users(); ?></div>
                        <p><?php _e('今日活跃用户数', 'sut-wechat-mini'); ?></p>
                    </div>
                    
                    <div class="sut-wechat-mini-stats-card">
                        <h3><?php _e('今日订单', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-stats-number"><?php echo $this->get_today_orders(); ?></div>
                        <p><?php _e('今日订单数', 'sut-wechat-mini'); ?></p>
                    </div>
                </div>
                
                <div class="sut-wechat-mini-stats-charts">
                    <div class="sut-wechat-mini-stats-chart">
                        <h3><?php _e('最近7天用户增长', 'sut-wechat-mini'); ?></h3>
                        <div id="sut-wechat-mini-user-growth-chart" style="height: 300px;"></div>
                    </div>
                    
                    <div class="sut-wechat-mini-stats-chart">
                        <h3><?php _e('最近7天订单趋势', 'sut-wechat-mini'); ?></h3>
                        <div id="sut-wechat-mini-order-trend-chart" style="height: 300px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .sut-wechat-mini-stats-wrapper {
            margin-top: 20px;
        }
        
        .sut-wechat-mini-stats-cards {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        
        .sut-wechat-mini-stats-card {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
            margin-right: 20px;
            margin-bottom: 20px;
            padding: 20px;
            text-align: center;
            width: calc(25% - 20px);
            box-sizing: border-box;
        }
        
        .sut-wechat-mini-stats-card h3 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        .sut-wechat-mini-stats-number {
            font-size: 32px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 10px;
        }
        
        .sut-wechat-mini-stats-charts {
            display: flex;
            flex-wrap: wrap;
        }
        
        .sut-wechat-mini-stats-chart {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
            margin-right: 20px;
            margin-bottom: 20px;
            padding: 20px;
            width: calc(50% - 20px);
            box-sizing: border-box;
        }
        
        .sut-wechat-mini-stats-chart h3 {
            margin-top: 0;
            margin-bottom: 20px;
        }
        
        @media (max-width: 1200px) {
            .sut-wechat-mini-stats-card {
                width: calc(50% - 20px);
            }
            
            .sut-wechat-mini-stats-chart {
                width: 100%;
                margin-right: 0;
            }
        }
        
        @media (max-width: 768px) {
            .sut-wechat-mini-stats-card {
                width: 100%;
                margin-right: 0;
            }
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            // 这里可以添加图表渲染代码，例如使用Chart.js或其他图表库
            // 由于依赖问题，这里只是占位代码
            $('#sut-wechat-mini-user-growth-chart').html('<p><?php _e('图表加载中...', 'sut-wechat-mini'); ?></p>');
            $('#sut-wechat-mini-order-trend-chart').html('<p><?php _e('图表加载中...', 'sut-wechat-mini'); ?></p>');
        });
        </script>
        <?php
    }

    /**
     * 渲染用户管理页面
     */
    public function render_users_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('小程序用户管理', 'sut-wechat-mini'); ?></h1>
            
            <div class="sut-wechat-mini-users-wrapper">
                <div class="sut-wechat-mini-users-filters">
                    <form method="get">
                        <input type="hidden" name="page" value="sut-wechat-mini-users" />
                        
                        <label for="sut-wechat-mini-search"><?php _e('搜索用户', 'sut-wechat-mini'); ?>:</label>
                        <input type="text" id="sut-wechat-mini-search" name="search" value="<?php echo isset($_GET['search']) ? esc_attr($_GET['search']) : ''; ?>" />
                        
                        <label for="sut-wechat-mini-status"><?php _e('状态', 'sut-wechat-mini'); ?>:</label>
                        <select id="sut-wechat-mini-status" name="status">
                            <option value=""><?php _e('全部', 'sut-wechat-mini'); ?></option>
                            <option value="active" <?php selected(isset($_GET['status']) && $_GET['status'] === 'active'); ?>><?php _e('活跃', 'sut-wechat-mini'); ?></option>
                            <option value="inactive" <?php selected(isset($_GET['status']) && $_GET['status'] === 'inactive'); ?>><?php _e('不活跃', 'sut-wechat-mini'); ?></option>
                        </select>
                        
                        <?php submit_button(__('筛选', 'sut-wechat-mini'), 'secondary', 'submit', false); ?>
                    </form>
                </div>
                
                <div class="sut-wechat-mini-users-table">
                    <?php
                    $this->render_users_table();
                    ?>
                </div>
            </div>
        </div>
        
        <style>
        .sut-wechat-mini-users-filters {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
            margin-bottom: 20px;
            padding: 15px;
        }
        
        .sut-wechat-mini-users-filters form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
        }
        
        .sut-wechat-mini-users-filters label {
            margin-right: 5px;
        }
        
        .sut-wechat-mini-users-filters input[type="text"],
        .sut-wechat-mini-users-filters select {
            margin-right: 15px;
        }
        
        .sut-wechat-mini-users-table {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
            padding: 15px;
        }
        
        @media (max-width: 768px) {
            .sut-wechat-mini-users-filters form {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .sut-wechat-mini-users-filters input[type="text"],
            .sut-wechat-mini-users-filters select {
                width: 100%;
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
        </style>
        <?php
    }

    /**
     * 渲染用户表格
     */
    private function render_users_table() {
        // 获取查询参数
        $search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
        $status = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
        $paged = isset($_GET['paged']) ? absint($_GET['paged']) : 1;
        $per_page = 20;
        
        // 构建查询
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        $where = 'WHERE 1=1';
        if ($search) {
            $where .= $wpdb->prepare(' AND (nickname LIKE %s OR openid LIKE %s)', '%' . $wpdb->esc_like($search) . '%', '%' . $wpdb->esc_like($search) . '%');
        }
        
        if ($status) {
            if ($status === 'active') {
                $where .= ' AND last_active > DATE_SUB(NOW(), INTERVAL 30 DAY)';
            } elseif ($status === 'inactive') {
                $where .= ' AND (last_active IS NULL OR last_active <= DATE_SUB(NOW(), INTERVAL 30 DAY))';
            }
        }
        
        // 获取总数
        $total_query = "SELECT COUNT(*) FROM $table_name $where";
        $total = $wpdb->get_var($total_query);
        
        // 获取用户列表
        $offset = ($paged - 1) * $per_page;
        $users_query = "SELECT * FROM $table_name $where ORDER BY created_at DESC LIMIT $offset, $per_page";
        $users = $wpdb->get_results($users_query);
        
        // 显示表格
        ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col" class="manage-column"><?php _e('ID', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('头像', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('昵称', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('OpenID', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('积分', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('注册时间', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('最后活跃', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('操作', 'sut-wechat-mini'); ?></th>
                </tr>
            </thead>
            
            <tbody>
                <?php if ($users) : ?>
                    <?php foreach ($users as $user) : ?>
                        <tr>
                            <td><?php echo esc_html($user->id); ?></td>
                            <td>
                                <?php if ($user->avatar_url) : ?>
                                    <img src="<?php echo esc_url($user->avatar_url); ?>" alt="<?php esc_attr_e('用户头像', 'sut-wechat-mini'); ?>" width="40" height="40" style="border-radius: 50%;" />
                                <?php else : ?>
                                    <div class="avatar avatar-40" style="width: 40px; height: 40px; border-radius: 50%; background-color: #eee; display: flex; align-items: center; justify-content: center;"><?php _e('无头像', 'sut-wechat-mini'); ?></div>
                                <?php endif; ?>
                            </td>
                            <td><?php echo esc_html($user->nickname); ?></td>
                            <td><?php echo esc_html(substr($user->openid, 0, 8)) . '...'; ?></td>
                            <td><?php echo esc_html($user->points); ?></td>
                            <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($user->created_at))); ?></td>
                            <td>
                                <?php 
                                if ($user->last_active) {
                                    $last_active = strtotime($user->last_active);
                                    $now = time();
                                    $diff = $now - $last_active;
                                    
                                    if ($diff < 60) {
                                        echo __('刚刚', 'sut-wechat-mini');
                                    } elseif ($diff < 3600) {
                                        echo floor($diff / 60) . __('分钟前', 'sut-wechat-mini');
                                    } elseif ($diff < 86400) {
                                        echo floor($diff / 3600) . __('小时前', 'sut-wechat-mini');
                                    } else {
                                        echo esc_html(date_i18n(get_option('date_format'), $last_active));
                                    }
                                } else {
                                    echo __('从未', 'sut-wechat-mini');
                                }
                                ?>
                            </td>
                            <td>
                                <a href="<?php echo admin_url('admin.php?page=sut-wechat-mini-user-detail&id=' . $user->id); ?>" class="button"><?php _e('查看', 'sut-wechat-mini'); ?></a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else : ?>
                    <tr>
                        <td colspan="8"><?php _e('没有找到用户', 'sut-wechat-mini'); ?></td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
        
        <?php
        // 显示分页
        if ($total > $per_page) {
            $this->render_pagination($paged, $total, $per_page);
        }
    }

    /**
     * 渲染分页
     *
     * @param int $current 当前页
     * @param int $total 总数
     * @param int $per_page 每页数量
     */
    private function render_pagination($current, $total, $per_page) {
        $total_pages = ceil($total / $per_page);
        
        if ($total_pages <= 1) {
            return;
        }
        
        $base_url = admin_url('admin.php?page=sut-wechat-mini-users');
        $search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
        $status = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
        
        $query_args = array();
        if ($search) {
            $query_args['search'] = $search;
        }
        if ($status) {
            $query_args['status'] = $status;
        }
        
        $query_string = !empty($query_args) ? '&' . http_build_query($query_args) : '';
        
        echo '<div class="tablenav bottom">';
        echo '<div class="tablenav-pages">';
        
        $pagination_args = array(
            'base' => add_query_arg('paged', '%#%', $base_url . $query_string),
            'format' => '',
            'prev_text' => __('&laquo; 上一页', 'sut-wechat-mini'),
            'next_text' => __('下一页 &raquo;', 'sut-wechat-mini'),
            'total' => $total_pages,
            'current' => $current,
        );
        
        echo paginate_links($pagination_args);
        
        echo '</div>';
        echo '</div>';
    }

    /**
     * 渲染积分管理页面
     */
    public function render_points_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('积分管理', 'sut-wechat-mini'); ?></h1>
            
            <div class="sut-wechat-mini-points-wrapper">
                <div class="sut-wechat-mini-points-stats">
                    <div class="sut-wechat-mini-points-stat-card">
                        <h3><?php _e('总积分发放', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-points-stat-number"><?php echo $this->get_total_points_issued(); ?></div>
                    </div>
                    
                    <div class="sut-wechat-mini-points-stat-card">
                        <h3><?php _e('总积分消耗', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-points-stat-number"><?php echo $this->get_total_points_consumed(); ?></div>
                    </div>
                    
                    <div class="sut-wechat-mini-points-stat-card">
                        <h3><?php _e('当前流通积分', 'sut-wechat-mini'); ?></h3>
                        <div class="sut-wechat-mini-points-stat-number"><?php echo $this->get_current_points_in_circulation(); ?></div>
                    </div>
                </div>
                
                <div class="sut-wechat-mini-points-tabs">
                    <div class="sut-wechat-mini-points-tab-nav">
                        <a href="#points-tasks" class="sut-wechat-mini-points-tab-nav-item active"><?php _e('积分任务', 'sut-wechat-mini'); ?></a>
                        <a href="#points-records" class="sut-wechat-mini-points-tab-nav-item"><?php _e('积分记录', 'sut-wechat-mini'); ?></a>
                        <a href="#points-settings" class="sut-wechat-mini-points-tab-nav-item"><?php _e('积分设置', 'sut-wechat-mini'); ?></a>
                    </div>
                    
                    <div class="sut-wechat-mini-points-tab-content">
                        <div id="points-tasks" class="sut-wechat-mini-points-tab-pane active">
                            <?php $this->render_points_tasks_tab(); ?>
                        </div>
                        
                        <div id="points-records" class="sut-wechat-mini-points-tab-pane">
                            <?php $this->render_points_records_tab(); ?>
                        </div>
                        
                        <div id="points-settings" class="sut-wechat-mini-points-tab-pane">
                            <?php $this->render_points_settings_tab(); ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .sut-wechat-mini-points-wrapper {
            margin-top: 20px;
        }
        
        .sut-wechat-mini-points-stats {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        
        .sut-wechat-mini-points-stat-card {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
            margin-right: 20px;
            margin-bottom: 20px;
            padding: 20px;
            text-align: center;
            width: calc(33.33% - 20px);
            box-sizing: border-box;
        }
        
        .sut-wechat-mini-points-stat-card h3 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        .sut-wechat-mini-points-stat-number {
            font-size: 32px;
            font-weight: bold;
            line-height: 1;
        }
        
        .sut-wechat-mini-points-tabs {
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        
        .sut-wechat-mini-points-tab-nav {
            display: flex;
            border-bottom: 1px solid #ccd0d4;
        }
        
        .sut-wechat-mini-points-tab-nav-item {
            padding: 15px 20px;
            text-decoration: none;
            color: #555;
            border-bottom: 3px solid transparent;
            margin-bottom: -1px;
        }
        
        .sut-wechat-mini-points-tab-nav-item.active {
            color: #23282d;
            border-bottom-color: #0073aa;
            font-weight: 600;
        }
        
        .sut-wechat-mini-points-tab-content {
            padding: 20px;
        }
        
        .sut-wechat-mini-points-tab-pane {
            display: none;
        }
        
        .sut-wechat-mini-points-tab-pane.active {
            display: block;
        }
        
        @media (max-width: 768px) {
            .sut-wechat-mini-points-stat-card {
                width: 100%;
                margin-right: 0;
            }
            
            .sut-wechat-mini-points-tab-nav {
                flex-wrap: wrap;
            }
            
            .sut-wechat-mini-points-tab-nav-item {
                width: 100%;
                text-align: center;
                border-bottom: 1px solid #ccd0d4;
                border-right: none;
                margin-bottom: 0;
            }
            
            .sut-wechat-mini-points-tab-nav-item.active {
                border-bottom-color: #0073aa;
            }
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            $('.sut-wechat-mini-points-tab-nav-item').on('click', function(e) {
                e.preventDefault();
                
                var target = $(this).attr('href');
                
                // 更新导航状态
                $('.sut-wechat-mini-points-tab-nav-item').removeClass('active');
                $(this).addClass('active');
                
                // 更新内容显示
                $('.sut-wechat-mini-points-tab-pane').removeClass('active');
                $(target).addClass('active');
            });
        });
        </script>
        <?php
    }

    /**
     * 渲染积分任务标签页
     */
    private function render_points_tasks_tab() {
        ?>
        <div class="sut-wechat-mini-points-tasks-wrapper">
            <h2><?php _e('积分任务管理', 'sut-wechat-mini'); ?></h2>
            
            <div class="sut-wechat-mini-points-tasks-actions">
                <button type="button" class="button button-primary" id="add-points-task"><?php _e('添加任务', 'sut-wechat-mini'); ?></button>
            </div>
            
            <div class="sut-wechat-mini-points-tasks-table">
                <?php $this->render_points_tasks_table(); ?>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#add-points-task').on('click', function() {
                // 这里可以添加弹窗或跳转到添加任务页面的逻辑
                alert('<?php _e('添加任务功能待实现', 'sut-wechat-mini'); ?>');
            });
        });
        </script>
        <?php
    }

    /**
     * 渲染积分任务表格
     */
    private function render_points_tasks_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        $tasks = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
        
        if (!$tasks) {
            echo '<p>' . __('暂无积分任务', 'sut-wechat-mini') . '</p>';
            return;
        }
        
        ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col" class="manage-column"><?php _e('ID', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('任务名称', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('任务类型', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('奖励积分', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('状态', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('创建时间', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('操作', 'sut-wechat-mini'); ?></th>
                </tr>
            </thead>
            
            <tbody>
                <?php foreach ($tasks as $task) : ?>
                    <tr>
                        <td><?php echo esc_html($task->id); ?></td>
                        <td><?php echo esc_html($task->title); ?></td>
                        <td><?php echo esc_html($this->get_task_type_label($task->type)); ?></td>
                        <td><?php echo esc_html($task->points); ?></td>
                        <td>
                            <?php
                            if ($task->status === 'active') {
                                echo '<span style="color: green;">' . __('启用', 'sut-wechat-mini') . '</span>';
                            } else {
                                echo '<span style="color: red;">' . __('禁用', 'sut-wechat-mini') . '</span>';
                            }
                            ?>
                        </td>
                        <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($task->created_at))); ?></td>
                        <td>
                            <button type="button" class="button edit-points-task" data-id="<?php echo esc_attr($task->id); ?>"><?php _e('编辑', 'sut-wechat-mini'); ?></button>
                            <button type="button" class="button delete-points-task" data-id="<?php echo esc_attr($task->id); ?>"><?php _e('删除', 'sut-wechat-mini'); ?></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        
        <script>
        jQuery(document).ready(function($) {
            $('.edit-points-task').on('click', function() {
                var taskId = $(this).data('id');
                alert('<?php _e('编辑任务功能待实现，任务ID：', 'sut-wechat-mini'); ?>' + taskId);
            });
            
            $('.delete-points-task').on('click', function() {
                var taskId = $(this).data('id');
                if (confirm('<?php _e('确定要删除这个任务吗？', 'sut-wechat-mini'); ?>')) {
                    // 这里可以添加删除任务的AJAX请求
                    alert('<?php _e('删除任务功能待实现，任务ID：', 'sut-wechat-mini'); ?>' + taskId);
                }
            });
        });
        </script>
        <?php
    }

    /**
     * 渲染积分记录标签页
     */
    private function render_points_records_tab() {
        ?>
        <div class="sut-wechat-mini-points-records-wrapper">
            <h2><?php _e('积分记录', 'sut-wechat-mini'); ?></h2>
            
            <div class="sut-wechat-mini-points-records-filters">
                <form method="get">
                    <input type="hidden" name="page" value="sut-wechat-mini-points" />
                    
                    <label for="points-record-user"><?php _e('用户', 'sut-wechat-mini'); ?>:</label>
                    <input type="text" id="points-record-user" name="user" value="<?php echo isset($_GET['user']) ? esc_attr($_GET['user']) : ''; ?>" />
                    
                    <label for="points-record-type"><?php _e('类型', 'sut-wechat-mini'); ?>:</label>
                    <select id="points-record-type" name="type">
                        <option value=""><?php _e('全部', 'sut-wechat-mini'); ?></option>
                        <option value="earn" <?php selected(isset($_GET['type']) && $_GET['type'] === 'earn'); ?>><?php _e('获得', 'sut-wechat-mini'); ?></option>
                        <option value="spend" <?php selected(isset($_GET['type']) && $_GET['type'] === 'spend'); ?>><?php _e('消费', 'sut-wechat-mini'); ?></option>
                    </select>
                    
                    <label for="points-record-date-from"><?php _e('开始日期', 'sut-wechat-mini'); ?>:</label>
                    <input type="date" id="points-record-date-from" name="date_from" value="<?php echo isset($_GET['date_from']) ? esc_attr($_GET['date_from']) : ''; ?>" />
                    
                    <label for="points-record-date-to"><?php _e('结束日期', 'sut-wechat-mini'); ?>:</label>
                    <input type="date" id="points-record-date-to" name="date_to" value="<?php echo isset($_GET['date_to']) ? esc_attr($_GET['date_to']) : ''; ?>" />
                    
                    <?php submit_button(__('筛选', 'sut-wechat-mini'), 'secondary', 'submit', false); ?>
                </form>
            </div>
            
            <div class="sut-wechat-mini-points-records-table">
                <?php $this->render_points_records_table(); ?>
            </div>
        </div>
        
        <style>
        .sut-wechat-mini-points-records-filters {
            background: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .sut-wechat-mini-points-records-filters form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
        }
        
        .sut-wechat-mini-points-records-filters label {
            margin-right: 5px;
        }
        
        .sut-wechat-mini-points-records-filters input[type="text"],
        .sut-wechat-mini-points-records-filters select,
        .sut-wechat-mini-points-records-filters input[type="date"] {
            margin-right: 15px;
        }
        
        @media (max-width: 768px) {
            .sut-wechat-mini-points-records-filters form {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .sut-wechat-mini-points-records-filters input[type="text"],
            .sut-wechat-mini-points-records-filters select,
            .sut-wechat-mini-points-records-filters input[type="date"] {
                width: 100%;
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
        </style>
        <?php
    }

    /**
     * 渲染积分记录表格
     */
    private function render_points_records_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_records';
        
        // 获取查询参数
        $user = isset($_GET['user']) ? sanitize_text_field($_GET['user']) : '';
        $type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
        $date_from = isset($_GET['date_from']) ? sanitize_text_field($_GET['date_from']) : '';
        $date_to = isset($_GET['date_to']) ? sanitize_text_field($_GET['date_to']) : '';
        $paged = isset($_GET['paged']) ? absint($_GET['paged']) : 1;
        $per_page = 20;
        
        // 构建查询
        $where = 'WHERE 1=1';
        $join = '';
        
        if ($user) {
            $join .= " LEFT JOIN {$wpdb->prefix}sut_wechat_mini_users u ON pr.user_id = u.id";
            $where .= $wpdb->prepare(' AND (u.nickname LIKE %s OR u.openid LIKE %s)', '%' . $wpdb->esc_like($user) . '%', '%' . $wpdb->esc_like($user) . '%');
        }
        
        if ($type) {
            $where .= $wpdb->prepare(' AND pr.type = %s', $type);
        }
        
        if ($date_from) {
            $where .= $wpdb->prepare(' AND pr.created_at >= %s', $date_from . ' 00:00:00');
        }
        
        if ($date_to) {
            $where .= $wpdb->prepare(' AND pr.created_at <= %s', $date_to . ' 23:59:59');
        }
        
        // 获取总数
        $total_query = "SELECT COUNT(*) FROM $table_name pr $join $where";
        $total = $wpdb->get_var($total_query);
        
        // 获取记录列表
        $offset = ($paged - 1) * $per_page;
        $records_query = "SELECT pr.*, u.nickname, u.openid FROM $table_name pr $join $where ORDER BY pr.created_at DESC LIMIT $offset, $per_page";
        $records = $wpdb->get_results($records_query);
        
        // 显示表格
        ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col" class="manage-column"><?php _e('ID', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('用户', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('类型', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('积分', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('描述', 'sut-wechat-mini'); ?></th>
                    <th scope="col" class="manage-column"><?php _e('时间', 'sut-wechat-mini'); ?></th>
                </tr>
            </thead>
            
            <tbody>
                <?php if ($records) : ?>
                    <?php foreach ($records as $record) : ?>
                        <tr>
                            <td><?php echo esc_html($record->id); ?></td>
                            <td>
                                <?php
                                if ($record->nickname) {
                                    echo esc_html($record->nickname);
                                } elseif ($record->openid) {
                                    echo esc_html(substr($record->openid, 0, 8)) . '...';
                                } else {
                                    echo __('未知用户', 'sut-wechat-mini');
                                }
                                ?>
                            </td>
                            <td>
                                <?php
                                if ($record->type === 'earn') {
                                    echo '<span style="color: green;">' . __('获得', 'sut-wechat-mini') . '</span>';
                                } elseif ($record->type === 'spend') {
                                    echo '<span style="color: red;">' . __('消费', 'sut-wechat-mini') . '</span>';
                                } else {
                                    echo esc_html($record->type);
                                }
                                ?>
                            </td>
                            <td>
                                <?php
                                if ($record->type === 'earn') {
                                    echo '<span style="color: green;">+' . esc_html($record->points) . '</span>';
                                } elseif ($record->type === 'spend') {
                                    echo '<span style="color: red;">-' . esc_html($record->points) . '</span>';
                                } else {
                                    echo esc_html($record->points);
                                }
                                ?>
                            </td>
                            <td><?php echo esc_html($record->description); ?></td>
                            <td><?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($record->created_at))); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else : ?>
                    <tr>
                        <td colspan="6"><?php _e('没有找到积分记录', 'sut-wechat-mini'); ?></td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
        
        <?php
        // 显示分页
        if ($total > $per_page) {
            $this->render_pagination($paged, $total, $per_page);
        }
    }

    /**
     * 渲染积分设置标签页
     */
    private function render_points_settings_tab() {
        ?>
        <div class="sut-wechat-mini-points-settings-wrapper">
            <h2><?php _e('积分设置', 'sut-wechat-mini'); ?></h2>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('sut_wechat_mini_points_settings');
                do_settings_sections('sut-wechat-mini-points-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    /**
     * 加载管理页面脚本
     *
     * @param string $hook 当前页面钩子
     */
    public function enqueue_admin_scripts($hook) {
        // 只在插件页面加载脚本
        if (strpos($hook, 'sut-wechat-mini') === false) {
            return;
        }
        
        // 加载样式
        wp_enqueue_style(
            'sut-wechat-mini-admin',
            plugins_url('assets/css/admin.css', SUT_WECHAT_MINI_PLUGIN_FILE),
            array(),
            SUT_WECHAT_MINI_VERSION
        );
        
        // 加载脚本
        wp_enqueue_script(
            'sut-wechat-mini-admin',
            plugins_url('assets/js/admin.js', SUT_WECHAT_MINI_PLUGIN_FILE),
            array('jquery'),
            SUT_WECHAT_MINI_VERSION,
            true
        );
        
        // 本地化脚本
        wp_localize_script(
            'sut-wechat-mini-admin',
            'sutWeChatMiniAdmin',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('sut_wechat_mini_admin_nonce'),
                'confirmDelete' => __('确定要删除这个项目吗？', 'sut-wechat-mini'),
                'loading' => __('加载中...', 'sut-wechat-mini'),
            )
        );
    }

    /**
     * 添加管理栏菜单
     *
     * @param WP_Admin_Bar $wp_admin_bar 管理栏对象
     */
    public function add_admin_bar_menu($wp_admin_bar) {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // 添加主菜单
        $wp_admin_bar->add_node(array(
            'id' => 'sut-wechat-mini',
            'title' => __('微信小程序', 'sut-wechat-mini'),
            'href' => admin_url('admin.php?page=' . $this->settings_page_slug),
        ));
        
        // 添加子菜单
        $wp_admin_bar->add_node(array(
            'id' => 'sut-wechat-mini-settings',
            'parent' => 'sut-wechat-mini',
            'title' => __('基本设置', 'sut-wechat-mini'),
            'href' => admin_url('admin.php?page=' . $this->settings_page_slug),
        ));
        
        $wp_admin_bar->add_node(array(
            'id' => 'sut-wechat-mini-stats',
            'parent' => 'sut-wechat-mini',
            'title' => __('数据统计', 'sut-wechat-mini'),
            'href' => admin_url('admin.php?page=sut-wechat-mini-stats'),
        ));
        
        $wp_admin_bar->add_node(array(
            'id' => 'sut-wechat-mini-users',
            'parent' => 'sut-wechat-mini',
            'title' => __('小程序用户', 'sut-wechat-mini'),
            'href' => admin_url('admin.php?page=sut-wechat-mini-users'),
        ));
    }

    /**
     * 添加仪表盘小工具
     */
    public function add_dashboard_widgets() {
        // 添加用户统计小工具
        wp_add_dashboard_widget(
            'sut_wechat_mini_user_stats_widget',
            __('微信小程序用户统计', 'sut-wechat-mini'),
            array($this, 'render_user_stats_widget')
        );
        
        // 添加订单统计小工具
        wp_add_dashboard_widget(
            'sut_wechat_mini_order_stats_widget',
            __('微信小程序订单统计', 'sut-wechat-mini'),
            array($this, 'render_order_stats_widget')
        );
    }

    /**
     * 渲染用户统计小工具
     */
    public function render_user_stats_widget() {
        $total_users = $this->get_user_count();
        $today_active = $this->get_today_active_users();
        $new_users_today = $this->get_new_users_today();
        
        ?>
        <div class="sut-wechat-mini-dashboard-stats">
            <div class="sut-wechat-mini-dashboard-stat">
                <span class="sut-wechat-mini-dashboard-stat-label"><?php _e('总用户数', 'sut-wechat-mini'); ?>:</span>
                <span class="sut-wechat-mini-dashboard-stat-value"><?php echo esc_html($total_users); ?></span>
            </div>
            
            <div class="sut-wechat-mini-dashboard-stat">
                <span class="sut-wechat-mini-dashboard-stat-label"><?php _e('今日活跃', 'sut-wechat-mini'); ?>:</span>
                <span class="sut-wechat-mini-dashboard-stat-value"><?php echo esc_html($today_active); ?></span>
            </div>
            
            <div class="sut-wechat-mini-dashboard-stat">
                <span class="sut-wechat-mini-dashboard-stat-label"><?php _e('今日新增', 'sut-wechat-mini'); ?>:</span>
                <span class="sut-wechat-mini-dashboard-stat-value"><?php echo esc_html($new_users_today); ?></span>
            </div>
        </div>
        
        <style>
        .sut-wechat-mini-dashboard-stats {
            display: flex;
            flex-wrap: wrap;
        }
        
        .sut-wechat-mini-dashboard-stat {
            flex: 1;
            min-width: 100px;
            margin-bottom: 10px;
            padding-right: 15px;
        }
        
        .sut-wechat-mini-dashboard-stat-label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .sut-wechat-mini-dashboard-stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #0073aa;
        }
        </style>
        <?php
    }

    /**
     * 渲染订单统计小工具
     */
    public function render_order_stats_widget() {
        $total_orders = $this->get_order_count();
        $today_orders = $this->get_today_orders();
        $today_revenue = $this->get_today_revenue();
        
        ?>
        <div class="sut-wechat-mini-dashboard-stats">
            <div class="sut-wechat-mini-dashboard-stat">
                <span class="sut-wechat-mini-dashboard-stat-label"><?php _e('总订单数', 'sut-wechat-mini'); ?>:</span>
                <span class="sut-wechat-mini-dashboard-stat-value"><?php echo esc_html($total_orders); ?></span>
            </div>
            
            <div class="sut-wechat-mini-dashboard-stat">
                <span class="sut-wechat-mini-dashboard-stat-label"><?php _e('今日订单', 'sut-wechat-mini'); ?>:</span>
                <span class="sut-wechat-mini-dashboard-stat-value"><?php echo esc_html($today_orders); ?></span>
            </div>
            
            <div class="sut-wechat-mini-dashboard-stat">
                <span class="sut-wechat-mini-dashboard-stat-label"><?php _e('今日收入', 'sut-wechat-mini'); ?>:</span>
                <span class="sut-wechat-mini-dashboard-stat-value"><?php echo esc_html($today_revenue); ?></span>
            </div>
        </div>
        <?php
    }

    /**
     * 获取用户总数
     *
     * @return int 用户总数
     */
    private function get_user_count() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        return $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
    }

    /**
     * 获取订单总数
     *
     * @return int 订单总数
     */
    private function get_order_count() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        return $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
    }

    /**
     * 获取今日活跃用户数
     *
     * @return int 今日活跃用户数
     */
    private function get_today_active_users() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $today = date('Y-m-d');
        return $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE DATE(last_active) = '$today'");
    }

    /**
     * 获取今日订单数
     *
     * @return int 今日订单数
     */
    private function get_today_orders() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $today = date('Y-m-d');
        return $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE DATE(created_at) = '$today'");
    }

    /**
     * 获取今日新增用户数
     *
     * @return int 今日新增用户数
     */
    private function get_new_users_today() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $today = date('Y-m-d');
        return $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE DATE(created_at) = '$today'");
    }

    /**
     * 获取今日收入
     *
     * @return float 今日收入
     */
    private function get_today_revenue() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $today = date('Y-m-d');
        $revenue = $wpdb->get_var("SELECT SUM(total_amount) FROM $table_name WHERE DATE(created_at) = '$today' AND status = 'paid'");
        return $revenue ? number_format($revenue, 2) : '0.00';
    }

    /**
     * 获取总积分发放量
     *
     * @return int 总积分发放量
     */
    private function get_total_points_issued() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_records';
        return $wpdb->get_var("SELECT SUM(points) FROM $table_name WHERE type = 'earn'");
    }

    /**
     * 获取总积分消耗量
     *
     * @return int 总积分消耗量
     */
    private function get_total_points_consumed() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_records';
        return $wpdb->get_var("SELECT SUM(points) FROM $table_name WHERE type = 'spend'");
    }

    /**
     * 获取当前流通积分
     *
     * @return int 当前流通积分
     */
    private function get_current_points_in_circulation() {
        $issued = $this->get_total_points_issued();
        $consumed = $this->get_total_points_consumed();
        return $issued - $consumed;
    }

    /**
     * 获取任务类型标签
     *
     * @param string $type 任务类型
     * @return string 任务类型标签
     */
    private function get_task_type_label($type) {
        $labels = array(
            'daily' => __('每日任务', 'sut-wechat-mini'),
            'weekly' => __('每周任务', 'sut-wechat-mini'),
            'monthly' => __('每月任务', 'sut-wechat-mini'),
            'once' => __('一次性任务', 'sut-wechat-mini'),
        );
        
        return isset($labels[$type]) ? $labels[$type] : $type;
    }
}