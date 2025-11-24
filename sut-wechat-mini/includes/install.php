<?php
/**
 * 文件名: install.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 插件安装脚本，负责创建数据库表和设置默认选项
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 插件安装类
 * 处理插件的安装和卸载过程
 */
class Sut_WeChat_Mini_Install {
    
    /**
     * 插件版本号
     * @var string
     */
    private static $version = '1.0.0';
    
    /**
     * 数据库表前缀
     * @var string
     */
    private static $table_prefix = 'sut_wxmini_';
    
    /**
     * 安装插件
     */
    public static function install() {
        global $wpdb;
        
        // 检查WordPress版本
        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            deactivate_plugins(plugin_basename(SUT_WECHAT_MINI_PLUGIN_FILE));
            wp_die(__('此插件需要WordPress 5.0或更高版本。', 'sut-wechat-mini'));
        }
        
        // 设置默认选项
        self::set_default_options();
        
        // 创建数据库表
        self::create_tables();
        
        // 添加自定义角色
        self::add_custom_roles();
        
        // 添加自定义能力
        self::add_custom_capabilities();
        
        // 设置重写规则
        self::setup_rewrite_rules();
        
        // 刷新重写规则
        flush_rewrite_rules();
        
        // 记录安装日志
        self::log_installation();
        
        // 标记安装完成
        update_option('sut_wechat_mini_installed', true);
        update_option('sut_wechat_mini_version', self::$version);
    }
    
    /**
     * 卸载插件
     */
    public static function uninstall() {
        global $wpdb;
        
        // 检查是否保留数据
        $keep_data = get_option('sut_wechat_mini_keep_data', false);
        
        if (!$keep_data) {
            // 删除数据库表
            self::drop_tables();
            
            // 删除选项
            self::delete_options();
            
            // 删除自定义角色
            self::remove_custom_roles();
            
            // 删除上传的文件
            self::delete_uploaded_files();
        }
        
        // 刷新重写规则
        flush_rewrite_rules();
        
        // 记录卸载日志
        self::log_uninstallation();
    }
    
    /**
     * 设置默认选项
     */
    private static function set_default_options() {
        $default_options = array(
            'sut_wechat_mini_app_id' => '',
            'sut_wechat_mini_app_secret' => '',
            'sut_wechat_mini_token' => '',
            'sut_wechat_mini_encoding_aes_key' => '',
            'sut_wechat_mini_debug_mode' => false,
            'sut_wechat_mini_cache_expire' => 3600,
            'sut_wechat_mini_api_version' => 'v1',
            'sut_wechat_mini_payment_enabled' => false,
            'sut_wechat_mini_points_enabled' => true,
            'sut_wechat_mini_social_enabled' => true,
            'sut_wechat_mini_notification_enabled' => true,
            'sut_wechat_mini_keep_data' => false,
            'sut_wechat_mini_installed_time' => current_time('mysql'),
        );
        
        foreach ($default_options as $option => $value) {
            if (get_option($option) === false) {
                add_option($option, $value);
            }
        }
    }
    
    /**
     * 创建数据库表
     */
    private static function create_tables() {
        // 使用数据库类创建表
        $database = Sut_WeChat_Mini_Database::get_instance();
        $database->create_tables();
    }
    
    /**
     * 删除数据库表
     */
    private static function drop_tables() {
        // 使用数据库类删除表
        $database = Sut_WeChat_Mini_Database::get_instance();
        $database->drop_tables();
    }
    
    /**
     * 删除选项
     */
    private static function delete_options() {
        $options = array(
            'sut_wechat_mini_app_id',
            'sut_wechat_mini_app_secret',
            'sut_wechat_mini_token',
            'sut_wechat_mini_encoding_aes_key',
            'sut_wechat_mini_debug_mode',
            'sut_wechat_mini_cache_expire',
            'sut_wechat_mini_api_version',
            'sut_wechat_mini_payment_enabled',
            'sut_wechat_mini_points_enabled',
            'sut_wechat_mini_social_enabled',
            'sut_wechat_mini_notification_enabled',
            'sut_wechat_mini_keep_data',
            'sut_wechat_mini_installed',
            'sut_wechat_mini_installed_time',
            'sut_wechat_mini_version'
        );
        
        foreach ($options as $option) {
            delete_option($option);
        }
    }
    
    /**
     * 添加自定义角色
     */
    private static function add_custom_roles() {
        // 微信小程序用户角色
        add_role(
            'wechat_mini_user',
            __('微信小程序用户', 'sut-wechat-mini'),
            array(
                'read' => true,
                'wechat_mini_access' => true,
            )
        );
        
        // 微信小程序VIP用户角色
        add_role(
            'wechat_mini_vip',
            __('微信小程序VIP用户', 'sut-wechat-mini'),
            array(
                'read' => true,
                'wechat_mini_access' => true,
                'wechat_mini_vip_access' => true,
            )
        );
    }
    
    /**
     * 删除自定义角色
     */
    private static function remove_custom_roles() {
        remove_role('wechat_mini_user');
        remove_role('wechat_mini_vip');
    }
    
    /**
     * 添加自定义能力
     */
    private static function add_custom_capabilities() {
        $roles = array('administrator', 'editor', 'author');
        
        foreach ($roles as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                $role->add_cap('wechat_mini_manage');
                $role->add_cap('wechat_mini_settings');
                $role->add_cap('wechat_mini_analytics');
            }
        }
    }
    
    /**
     * 设置重写规则
     */
    private static function setup_rewrite_rules() {
        // API重写规则
        add_rewrite_rule(
            '^wxapp/api/([^/]+)/([^/]+)/?$',
            'index.php?wxapp_api=$matches[1]&wxapp_action=$matches[2]',
            'top'
        );
        
        // 添加查询变量
        add_filter('query_vars', function($vars) {
            $vars[] = 'wxapp_api';
            $vars[] = 'wxapp_action';
            return $vars;
        });
    }
    
    /**
     * 删除上传的文件
     */
    private static function delete_uploaded_files() {
        $upload_dir = wp_upload_dir();
        $plugin_dir = $upload_dir['basedir'] . '/sut-wechat-mini';
        
        if (is_dir($plugin_dir)) {
            self::delete_directory($plugin_dir);
        }
    }
    
    /**
     * 递归删除目录
     *
     * @param string $dir 目录路径
     */
    private static function delete_directory($dir) {
        if (!is_dir($dir)) {
            return;
        }
        
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? self::delete_directory($path) : unlink($path);
        }
        rmdir($dir);
    }
    
    /**
     * 记录安装日志
     */
    private static function log_installation() {
        $log_data = array(
            'action' => 'install',
            'version' => self::$version,
            'wp_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'timestamp' => current_time('mysql'),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        );
        
        update_option('sut_wechat_mini_install_log', $log_data);
    }
    
    /**
     * 记录卸载日志
     */
    private static function log_uninstallation() {
        $log_data = array(
            'action' => 'uninstall',
            'version' => self::$version,
            'wp_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'timestamp' => current_time('mysql'),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        );
        
        update_option('sut_wechat_mini_uninstall_log', $log_data);
    }
    
    /**
     * 检查是否需要更新数据库
     */
    public static function maybe_update_database() {
        $installed_version = get_option('sut_wechat_mini_version', '0');
        
        if (version_compare($installed_version, self::$version, '<')) {
            self::update_database($installed_version);
            update_option('sut_wechat_mini_version', self::$version);
        }
    }
    
    /**
     * 更新数据库
     *
     * @param string $from_version 当前版本
     */
    private static function update_database($from_version) {
        global $wpdb;
        
        // 根据版本执行相应的更新操作
        if (version_compare($from_version, '1.0.0', '<')) {
            // 1.0.0版本的更新操作
            // 例如：添加新字段、创建新表等
        }
        
        // 未来版本的更新操作
    }
}