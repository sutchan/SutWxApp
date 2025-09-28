<?php
/**
 * SUT微信小程序插件安装文件
 *
 * 负责插件激活时的数据库表创建、初始设置等操作
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Install 类
 */
class SUT_WeChat_Mini_Install {
    
    /**
     * 插件激活时执行
     */
    public static function activate() {
        // 检查PHP版本
        self::check_php_version();
        
        // 检查WordPress版本
        self::check_wordpress_version();
        
        // 创建数据库表
        self::create_tables();
        
        // 初始化设置选项
        self::init_settings();
        
        // 注册重写规则
        self::register_rewrite_rules();
        
        // 刷新重写规则
        flush_rewrite_rules();
        
        // 记录激活日志
        self::log_activation();
    }
    
    /**
     * 插件停用/卸载时执行
     */
    public static function deactivate() {
        // 刷新重写规则
        flush_rewrite_rules();
        
        // 记录停用日志
        self::log_deactivation();
    }
    
    /**
     * 插件卸载时执行
     */
    public static function uninstall() {
        // 删除数据库表
        self::drop_tables();
        
        // 删除设置选项
        self::delete_settings();
        
        // 删除上传的文件
        self::delete_uploads();
        
        // 删除临时文件
        self::delete_temp_files();
        
        // 记录卸载日志
        self::log_uninstall();
    }
    
    /**
     * 检查PHP版本
     */
    private static function check_php_version() {
        $required_php_version = '7.0';
        $current_php_version = phpversion();
        
        if ( version_compare( $current_php_version, $required_php_version, '<' ) ) {
            deactivate_plugins( plugin_basename( SUT_WECHAT_MINI_PLUGIN_FILE ) );
            wp_die( 
                sprintf( 
                    __( 'SUT微信小程序插件需要PHP %s或更高版本。您当前的PHP版本是 %s，请升级PHP版本后再启用插件。', 'sut-wechat-mini' ), 
                    $required_php_version, 
                    $current_php_version 
                ),
                __( '激活失败', 'sut-wechat-mini' ),
                array( 'back_link' => true )
            );
        }
    }
    
    /**
     * 检查WordPress版本
     */
    private static function check_wordpress_version() {
        $required_wp_version = '5.0';
        global $wp_version;
        
        if ( version_compare( $wp_version, $required_wp_version, '<' ) ) {
            deactivate_plugins( plugin_basename( SUT_WECHAT_MINI_PLUGIN_FILE ) );
            wp_die( 
                sprintf( 
                    __( 'SUT微信小程序插件需要WordPress %s或更高版本。您当前的WordPress版本是 %s，请升级WordPress版本后再启用插件。', 'sut-wechat-mini' ), 
                    $required_wp_version, 
                    $wp_version 
                ),
                __( '激活失败', 'sut-wechat-mini' ),
                array( 'back_link' => true )
            );
        }
    }
    
    /**
     * 创建数据库表
     */
    private static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        // 小程序用户表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            openid varchar(100) NOT NULL,
            unionid varchar(100) DEFAULT NULL,
            user_id bigint(20) DEFAULT NULL,
            nickname varchar(50) DEFAULT NULL,
            avatar varchar(255) DEFAULT NULL,
            gender tinyint(1) DEFAULT NULL,
            country varchar(50) DEFAULT NULL,
            province varchar(50) DEFAULT NULL,
            city varchar(50) DEFAULT NULL,
            language varchar(20) DEFAULT NULL,
            session_key varchar(100) DEFAULT NULL,
            create_time datetime NOT NULL,
            update_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY openid (openid),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
        
        // 用户地址表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            consignee varchar(50) NOT NULL,
            phone varchar(20) NOT NULL,
            province varchar(50) NOT NULL,
            city varchar(50) NOT NULL,
            district varchar(50) NOT NULL,
            address varchar(255) NOT NULL,
            zipcode varchar(20) DEFAULT NULL,
            is_default tinyint(1) DEFAULT 0,
            create_time datetime NOT NULL,
            update_time datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 用户收藏表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            object_id bigint(20) NOT NULL,
            object_type varchar(20) NOT NULL,
            create_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_object_id_object_type (user_id,object_id,object_type),
            KEY user_id (user_id),
            KEY object_id (object_id),
            KEY object_type (object_type)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 用户签到表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_checkins';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            checkin_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_checkin_time (user_id,checkin_time),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 订单表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            order_id varchar(50) NOT NULL,
            user_id bigint(20) NOT NULL,
            product_ids text NOT NULL,
            total_amount decimal(10,2) NOT NULL,
            status varchar(20) NOT NULL,
            payment_method varchar(20) DEFAULT NULL,
            payment_time datetime DEFAULT NULL,
            delivery_type varchar(20) DEFAULT NULL,
            delivery_status varchar(20) DEFAULT NULL,
            consignee varchar(50) DEFAULT NULL,
            phone varchar(20) DEFAULT NULL,
            address varchar(255) DEFAULT NULL,
            remark text DEFAULT NULL,
            create_time datetime NOT NULL,
            update_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY order_id (order_id),
            KEY user_id (user_id),
            KEY status (status),
            KEY create_time (create_time)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 购物车表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cart';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            product_id bigint(20) NOT NULL,
            quantity int(11) NOT NULL,
            variation_id bigint(20) DEFAULT NULL,
            attributes text DEFAULT NULL,
            create_time datetime NOT NULL,
            update_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_product_id_variation_id (user_id,product_id,variation_id),
            KEY user_id (user_id),
            KEY product_id (product_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 浏览历史表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_browse_history';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            object_id bigint(20) NOT NULL,
            object_type varchar(20) NOT NULL,
            browse_time datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY object_id (object_id),
            KEY object_type (object_type),
            KEY browse_time (browse_time)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // API日志表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            request_id varchar(50) NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            endpoint varchar(100) NOT NULL,
            method varchar(10) NOT NULL,
            params text DEFAULT NULL,
            response text DEFAULT NULL,
            status_code int(11) NOT NULL,
            request_time datetime NOT NULL,
            response_time datetime DEFAULT NULL,
            execution_time float DEFAULT NULL,
            ip varchar(50) DEFAULT NULL,
            user_agent text DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY request_id (request_id),
            KEY user_id (user_id),
            KEY endpoint (endpoint),
            KEY request_time (request_time),
            KEY ip (ip)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 支付日志表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_payment_logs';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            payment_id varchar(50) NOT NULL,
            order_id varchar(50) NOT NULL,
            user_id bigint(20) NOT NULL,
            amount decimal(10,2) NOT NULL,
            type varchar(20) NOT NULL,
            status varchar(20) NOT NULL,
            transaction_id varchar(100) DEFAULT NULL,
            request_data text DEFAULT NULL,
            response_data text DEFAULT NULL,
            create_time datetime NOT NULL,
            update_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY payment_id (payment_id),
            KEY order_id (order_id),
            KEY user_id (user_id),
            KEY status (status),
            KEY create_time (create_time)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 消息推送表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            message_id varchar(50) NOT NULL,
            user_id bigint(20) NOT NULL,
            type varchar(20) NOT NULL,
            title varchar(100) NOT NULL,
            content text NOT NULL,
            is_read tinyint(1) DEFAULT 0,
            create_time datetime NOT NULL,
            read_time datetime DEFAULT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY message_id (message_id),
            KEY user_id (user_id),
            KEY type (type),
            KEY is_read (is_read),
            KEY create_time (create_time)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 会员积分表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            points int(11) NOT NULL,
            change_type varchar(20) NOT NULL,
            source_id varchar(50) DEFAULT NULL,
            source_type varchar(20) DEFAULT NULL,
            change_time datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY change_type (change_type),
            KEY change_time (change_time)
        ) $charset_collate;";
        
        dbDelta( $sql );
    }
    
    /**
     * 初始化设置选项
     */
    private static function init_settings() {
        // 获取已有的设置
        $existing_settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 定义默认设置
        $default_settings = array(
            // 基础设置
            'app_id' => '',
            'app_secret' => '',
            'token' => '',
            'encoding_aes_key' => '',
            
            // 内容设置
            'enable_content' => 1,
            'content_per_page' => 10,
            'enable_comments' => 1,
            'enable_share' => 1,
            'enable_collect' => 1,
            
            // 电商设置
            'enable_ecommerce' => 1,
            'enable_woocommerce' => 1,
            'enable_cart' => 1,
            'enable_favorites' => 1,
            
            // 支付设置
            'enable_pay' => 1,
            'mch_id' => '',
            'api_key' => '',
            'notify_url' => '',
            'ssl_cert_path' => '',
            'ssl_key_path' => '',
            
            // 用户设置
            'enable_user' => 1,
            'enable_user_center' => 1,
            'enable_address' => 1,
            'enable_checkin' => 1,
            
            // 缓存设置
            'enable_cache' => 1,
            'cache_time' => 3600,
            
            // 日志设置
            'enable_log' => 0,
            'log_level' => 'error',
            
            // 高级设置
            'enable_debug' => 0,
            'ip_whitelist' => '',
            'api_rate_limit' => 0,
            
            // 模板消息设置
            'enable_template_message' => 0,
            'template_message_order_paid' => '',
            'template_message_order_shipped' => '',
            'template_message_order_completed' => '',
            'template_message_refund_success' => '',
            
            // 统计设置
            'enable_statistics' => 1,
            'statistics_retention_days' => 30,
            
            // 国际化设置
            'default_language' => 'zh_CN',
            'enable_multi_language' => 0,
            
            // CDN设置
            'enable_cdn' => 0,
            'cdn_domain' => '',
            
            // 安全设置
            'enable_https' => 1,
            'enable_signature' => 1,
            
            // 其他设置
            'version' => SUT_WECHAT_MINI_VERSION,
            'installed_time' => current_time( 'mysql' ),
            'last_updated_time' => current_time( 'mysql' ),
        );
        
        // 合并设置（保留已有的设置，补充缺少的设置）
        $settings = array_merge( $default_settings, $existing_settings );
        
        // 更新设置
        update_option( 'sut_wechat_mini_settings', $settings );
        
        // 设置版本号
        update_option( 'sut_wechat_mini_version', SUT_WECHAT_MINI_VERSION );
        
        // 设置激活时间
        if ( ! get_option( 'sut_wechat_mini_activated_time' ) ) {
            update_option( 'sut_wechat_mini_activated_time', current_time( 'mysql' ) );
        }
    }
    
    /**
     * 注册重写规则
     */
    private static function register_rewrite_rules() {
        // 注册API重写规则
        add_rewrite_rule( '^sut-wechat-mini-api/?$', 'index.php?sut_wechat_mini_api=1', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-api/([^/]+)/?$', 'index.php?sut_wechat_mini_api=1&sut_wechat_mini_endpoint=$matches[1]', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-api/([^/]+)/([^/]+)/?$', 'index.php?sut_wechat_mini_api=1&sut_wechat_mini_endpoint=$matches[1]&sut_wechat_mini_action=$matches[2]', 'top' );
        
        // 注册支付回调重写规则
        add_rewrite_rule( '^sut-wechat-mini-pay-notify/?$', 'index.php?sut_wechat_mini_pay_notify=1', 'top' );
        
        // 注册微信消息回调重写规则
        add_rewrite_rule( '^sut-wechat-mini-message/?$', 'index.php?sut_wechat_mini_message=1', 'top' );
        
        // 注册小程序码重写规则
        add_rewrite_rule( '^sut-wechat-mini-qrcode/?$', 'index.php?sut_wechat_mini_qrcode=1', 'top' );
        
        // 注册REST API重写规则（如果需要）
        add_rewrite_rule( '^sut-wechat-mini-rest/([^/]+)/?$', 'index.php?sut_wechat_mini_rest=1&sut_wechat_mini_resource=$matches[1]', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-rest/([^/]+)/([^/]+)/?$', 'index.php?sut_wechat_mini_rest=1&sut_wechat_mini_resource=$matches[1]&sut_wechat_mini_resource_id=$matches[2]', 'top' );
        
        // 添加查询变量
        add_filter( 'query_vars', function( $vars ) {
            $vars[] = 'sut_wechat_mini_api';
            $vars[] = 'sut_wechat_mini_endpoint';
            $vars[] = 'sut_wechat_mini_action';
            $vars[] = 'sut_wechat_mini_pay_notify';
            $vars[] = 'sut_wechat_mini_message';
            $vars[] = 'sut_wechat_mini_qrcode';
            $vars[] = 'sut_wechat_mini_rest';
            $vars[] = 'sut_wechat_mini_resource';
            $vars[] = 'sut_wechat_mini_resource_id';
            return $vars;
        } );
    }
    
    /**
     * 删除数据库表
     */
    private static function drop_tables() {
        global $wpdb;
        
        // 获取所有要删除的表
        $tables = array(
            $wpdb->prefix . 'sut_wechat_mini_users',
            $wpdb->prefix . 'sut_wechat_mini_user_addresses',
            $wpdb->prefix . 'sut_wechat_mini_user_favorites',
            $wpdb->prefix . 'sut_wechat_mini_user_checkins',
            $wpdb->prefix . 'sut_wechat_mini_orders',
            $wpdb->prefix . 'sut_wechat_mini_cart',
            $wpdb->prefix . 'sut_wechat_mini_browse_history',
            $wpdb->prefix . 'sut_wechat_mini_api_logs',
            $wpdb->prefix . 'sut_wechat_mini_payment_logs',
            $wpdb->prefix . 'sut_wechat_mini_messages',
            $wpdb->prefix . 'sut_wechat_mini_points',
        );
        
        // 删除每个表
        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS $table" );
        }
    }
    
    /**
     * 删除设置选项
     */
    private static function delete_settings() {
        // 获取所有要删除的选项
        $options = array(
            'sut_wechat_mini_settings',
            'sut_wechat_mini_version',
            'sut_wechat_mini_activated_time',
            'sut_wechat_mini_deactivated_time',
            'sut_wechat_mini_uninstalled_time',
            'sut_wechat_mini_last_update_check',
            'sut_wechat_mini_update_available',
            'sut_wechat_mini_cache_flushed',
            'sut_wechat_mini_logs_cleaned',
            'sut_wechat_mini_install_data',
        );
        
        // 删除每个选项
        foreach ( $options as $option ) {
            delete_option( $option );
        }
    }
    
    /**
     * 删除上传的文件
     */
    private static function delete_uploads() {
        // 获取上传目录
        $upload_dir = wp_upload_dir();
        $sut_wechat_mini_dir = $upload_dir['basedir'] . '/sut-wechat-mini';
        
        // 检查目录是否存在
        if ( is_dir( $sut_wechat_mini_dir ) ) {
            // 删除目录及其内容
            self::delete_directory( $sut_wechat_mini_dir );
        }
    }
    
    /**
     * 删除临时文件
     */
    private static function delete_temp_files() {
        // 获取临时目录
        $temp_dir = sys_get_temp_dir() . '/sut-wechat-mini';
        
        // 检查目录是否存在
        if ( is_dir( $temp_dir ) ) {
            // 删除目录及其内容
            self::delete_directory( $temp_dir );
        }
    }
    
    /**
     * 递归删除目录
     *
     * @param string $dir 目录路径
     * @return bool 删除结果
     */
    private static function delete_directory( $dir ) {
        if ( ! is_dir( $dir ) ) {
            return false;
        }
        
        $files = array_diff( scandir( $dir ), array( '.', '..' ) );
        
        foreach ( $files as $file ) {
            $path = $dir . '/' . $file;
            
            if ( is_dir( $path ) ) {
                self::delete_directory( $path );
            } else {
                unlink( $path );
            }
        }
        
        return rmdir( $dir );
    }
    
    /**
     * 记录激活日志
     */
    private static function log_activation() {
        // 创建日志数据
        $log_data = array(
            'action' => 'activate',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'php_version' => phpversion(),
            'wp_version' => get_bloginfo( 'version' ),
            'site_url' => site_url(),
            'admin_email' => get_option( 'admin_email' ),
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 保存日志
        update_option( 'sut_wechat_mini_install_data', $log_data );
        
        // 如果启用了调试模式，记录详细日志
        if ( WP_DEBUG ) {
            error_log( 'SUT微信小程序插件已激活: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 记录停用日志
     */
    private static function log_deactivation() {
        // 创建日志数据
        $log_data = array(
            'action' => 'deactivate',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 保存停用时间
        update_option( 'sut_wechat_mini_deactivated_time', current_time( 'mysql' ) );
        
        // 如果启用了调试模式，记录详细日志
        if ( WP_DEBUG ) {
            error_log( 'SUT微信小程序插件已停用: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 记录卸载日志
     */
    private static function log_uninstall() {
        // 创建日志数据
        $log_data = array(
            'action' => 'uninstall',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 保存卸载时间
        update_option( 'sut_wechat_mini_uninstalled_time', current_time( 'mysql' ) );
        
        // 如果启用了调试模式，记录详细日志
        if ( WP_DEBUG ) {
            error_log( 'SUT微信小程序插件已卸载: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 插件更新时执行
     *
     * @param string $old_version 旧版本号
     * @param string $new_version 新版本号
     */
    public static function update( $old_version, $new_version ) {
        // 检查版本并执行相应的更新操作
        if ( version_compare( $old_version, '1.0.0', '<' ) ) {
            // 版本1.0.0的更新操作
            self::update_to_1_0_0();
        }
        
        if ( version_compare( $old_version, '1.1.0', '<' ) ) {
            // 版本1.1.0的更新操作
            self::update_to_1_1_0();
        }
        
        if ( version_compare( $old_version, '1.2.0', '<' ) ) {
            // 版本1.2.0的更新操作
            self::update_to_1_2_0();
        }
        
        // 更新版本号
        update_option( 'sut_wechat_mini_version', $new_version );
        
        // 更新最后更新时间
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $settings['last_updated_time'] = current_time( 'mysql' );
        update_option( 'sut_wechat_mini_settings', $settings );
        
        // 刷新重写规则
        flush_rewrite_rules();
        
        // 记录更新日志
        self::log_update( $old_version, $new_version );
    }
    
    /**
     * 更新到版本1.0.0
     */
    private static function update_to_1_0_0() {
        // 在这里添加版本1.0.0的更新操作
        // 例如：添加新的数据库表、修改现有表结构、更新设置选项等
        global $wpdb;
        
        // 示例：添加新的设置选项
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_template_message'] ) ) {
            $settings['enable_template_message'] = 0;
        }
        
        if ( ! isset( $settings['template_message_order_paid'] ) ) {
            $settings['template_message_order_paid'] = '';
        }
        
        update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 更新到版本1.1.0
     */
    private static function update_to_1_1_0() {
        // 在这里添加版本1.1.0的更新操作
        global $wpdb;
        
        // 示例：修改现有表结构
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 检查字段是否存在
        $column_exists = $wpdb->get_var( "SHOW COLUMNS FROM $table_name LIKE 'session_key'" );
        
        if ( ! $column_exists ) {
            $wpdb->query( "ALTER TABLE $table_name ADD COLUMN session_key varchar(100) DEFAULT NULL AFTER language" );
        }
        
        // 示例：添加新的设置选项
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_multi_language'] ) ) {
            $settings['enable_multi_language'] = 0;
        }
        
        if ( ! isset( $settings['default_language'] ) ) {
            $settings['default_language'] = 'zh_CN';
        }
        
        update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 更新到版本1.2.0
     */
    private static function update_to_1_2_0() {
        // 在这里添加版本1.2.0的更新操作
        global $wpdb;
        
        // 示例：添加新的数据库表
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points';
        
        // 检查表是否存在
        $table_exists = $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" );
        
        if ( ! $table_exists ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            $sql = "CREATE TABLE $table_name (
                id bigint(20) NOT NULL AUTO_INCREMENT,
                user_id bigint(20) NOT NULL,
                points int(11) NOT NULL,
                change_type varchar(20) NOT NULL,
                source_id varchar(50) DEFAULT NULL,
                source_type varchar(20) DEFAULT NULL,
                change_time datetime NOT NULL,
                PRIMARY KEY  (id),
                KEY user_id (user_id),
                KEY change_type (change_type),
                KEY change_time (change_time)
            ) $charset_collate;";
            
            require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
            dbDelta( $sql );
        }
        
        // 示例：添加新的设置选项
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_statistics'] ) ) {
            $settings['enable_statistics'] = 1;
        }
        
        if ( ! isset( $settings['statistics_retention_days'] ) ) {
            $settings['statistics_retention_days'] = 30;
        }
        
        update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 记录更新日志
     *
     * @param string $old_version 旧版本号
     * @param string $new_version 新版本号
     */
    private static function log_update( $old_version, $new_version ) {
        // 创建日志数据
        $log_data = array(
            'action' => 'update',
            'old_version' => $old_version,
            'new_version' => $new_version,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 保存更新日志
        $update_logs = get_option( 'sut_wechat_mini_update_logs', array() );
        $update_logs[] = $log_data;
        update_option( 'sut_wechat_mini_update_logs', $update_logs );
        
        // 如果启用了调试模式，记录详细日志
        if ( WP_DEBUG ) {
            error_log( 'SUT微信小程序插件已更新: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 检查是否需要更新
     *
     * @return array 更新信息
     */
    public static function check_for_updates() {
        // 获取当前版本
        $current_version = SUT_WECHAT_MINI_VERSION;
        
        // 检查是否已经检查过更新（避免频繁检查）
        $last_check = get_option( 'sut_wechat_mini_last_update_check', 0 );
        $check_interval = 24 * 60 * 60; // 24小时
        
        if ( time() - $last_check < $check_interval ) {
            // 从缓存获取更新信息
            $update_available = get_option( 'sut_wechat_mini_update_available', false );
            
            return array(
                'update_available' => $update_available,
                'checked_recently' => true,
            );
        }
        
        // 更新最后检查时间
        update_option( 'sut_wechat_mini_last_update_check', time() );
        
        // 模拟检查更新（实际项目中应该从官方服务器检查）
        $update_available = false;
        $new_version = $current_version;
        $update_url = '';
        $update_description = '';
        
        // 这里应该是实际的更新检查逻辑
        // 例如：发送请求到官方服务器检查是否有新版本
        /*
        $response = wp_remote_get( 'https://example.com/wp-json/sut-wechat-mini/v1/update-check', array(
            'timeout' => 10,
            'sslverify' => true,
            'headers' => array(
                'Accept' => 'application/json',
            ),
        ) );
        
        if ( ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) === 200 ) {
            $body = wp_remote_retrieve_body( $response );
            $data = json_decode( $body, true );
            
            if ( isset( $data['version'] ) && version_compare( $data['version'], $current_version, '>' ) ) {
                $update_available = true;
                $new_version = $data['version'];
                $update_url = isset( $data['url'] ) ? $data['url'] : '';
                $update_description = isset( $data['description'] ) ? $data['description'] : '';
            }
        }
        */
        
        // 保存更新信息
        update_option( 'sut_wechat_mini_update_available', $update_available );
        
        if ( $update_available ) {
            update_option( 'sut_wechat_mini_latest_version', $new_version );
            update_option( 'sut_wechat_mini_update_url', $update_url );
            update_option( 'sut_wechat_mini_update_description', $update_description );
        }
        
        return array(
            'update_available' => $update_available,
            'new_version' => $new_version,
            'update_url' => $update_url,
            'description' => $update_description,
            'checked_recently' => false,
        );
    }
    
    /**
     * 清理插件数据
     */
    public static function clean_data() {
        global $wpdb;
        
        // 获取保留天数设置
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $retention_days = isset( $settings['statistics_retention_days'] ) ? intval( $settings['statistics_retention_days'] ) : 30;
        
        // 计算截止日期
        $cutoff_date = date( 'Y-m-d H:i:s', strtotime( "-$retention_days days" ) );
        
        // 清理API日志
        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE request_time < %s", $cutoff_date ) );
        
        // 清理支付日志
        $table_name = $wpdb->prefix . 'sut_wechat_mini_payment_logs';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE create_time < %s AND status != 'pending'", $cutoff_date ) );
        
        // 清理浏览历史
        $table_name = $wpdb->prefix . 'sut_wechat_mini_browse_history';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE browse_time < %s", $cutoff_date ) );
        
        // 记录清理日志
        self::log_clean_data( $retention_days, $cutoff_date );
        
        return true;
    }
    
    /**
     * 记录清理数据日志
     *
     * @param int $retention_days 保留天数
     * @param string $cutoff_date 截止日期
     */
    private static function log_clean_data( $retention_days, $cutoff_date ) {
        // 创建日志数据
        $log_data = array(
            'action' => 'clean_data',
            'retention_days' => $retention_days,
            'cutoff_date' => $cutoff_date,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 保存清理日志
        $clean_logs = get_option( 'sut_wechat_mini_clean_logs', array() );
        $clean_logs[] = $log_data;
        update_option( 'sut_wechat_mini_clean_logs', $clean_logs );
        
        // 如果启用了调试模式，记录详细日志
        if ( WP_DEBUG ) {
            error_log( 'SUT微信小程序插件数据已清理: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 获取插件统计信息
     *
     * @return array 统计信息
     */
    public static function get_statistics() {
        global $wpdb;
        
        $statistics = array();
        
        // 获取用户数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $statistics['total_users'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 获取今日新增用户数量
        $today = date( 'Y-m-d 00:00:00' );
        $statistics['today_new_users'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE create_time >= %s", $today ) );
        
        // 获取订单数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $statistics['total_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 获取今日订单数量
        $statistics['today_orders'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE create_time >= %s", $today ) );
        
        // 获取总销售额
        $statistics['total_sales'] = $wpdb->get_var( "SELECT SUM(total_amount) FROM $table_name WHERE status NOT IN ('cancelled', 'failed')" );
        
        // 获取今日销售额
        $statistics['today_sales'] = $wpdb->get_var( $wpdb->prepare( "SELECT SUM(total_amount) FROM $table_name WHERE create_time >= %s AND status NOT IN ('cancelled', 'failed')", $today ) );
        
        // 获取API请求数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        $statistics['total_api_requests'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 获取今日API请求数量
        $statistics['today_api_requests'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE request_time >= %s", $today ) );
        
        // 获取错误请求数量
        $statistics['error_api_requests'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status_code >= 400" );
        
        // 获取支付成功的订单数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $statistics['paid_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'paid'" );
        
        // 获取完成的订单数量
        $statistics['completed_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'completed'" );
        
        // 获取取消的订单数量
        $statistics['cancelled_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'cancelled'" );
        
        // 获取失败的订单数量
        $statistics['failed_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'failed'" );
        
        // 获取收藏数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        $statistics['total_favorites'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 获取签到数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_checkins';
        $statistics['total_checkins'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 获取地址数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        $statistics['total_addresses'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 获取缓存统计（如果启用了缓存）
        if ( function_exists( 'wp_cache_get_stats' ) ) {
            $cache_stats = wp_cache_get_stats();
            $statistics['cache_size'] = isset( $cache_stats['cache_size'] ) ? $cache_stats['cache_size'] : 0;
            $statistics['cache_hits'] = isset( $cache_stats['cache_hits'] ) ? $cache_stats['cache_hits'] : 0;
            $statistics['cache_misses'] = isset( $cache_stats['cache_misses'] ) ? $cache_stats['cache_misses'] : 0;
        }
        
        // 确保统计数据类型正确
        foreach ( $statistics as $key => $value ) {
            if ( is_null( $value ) ) {
                $statistics[$key] = 0;
            } else if ( is_numeric( $value ) ) {
                $statistics[$key] = floatval( $value );
            }
        }
        
        return $statistics;
    }
}