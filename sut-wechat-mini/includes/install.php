<?php
/**
 * SUT寰俊灏忕▼搴忔彃浠跺畨瑁呮枃浠? *
 * 璐熻矗鎻掍欢婵€娲绘椂鐨勬暟鎹簱琛ㄥ垱寤恒€佸垵濮嬭缃瓑鎿嶄綔
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Install 绫? */
class SUT_WeChat_Mini_Install {
    
    /**
     * 鎻掍欢婵€娲绘椂鎵ц
     */
    public static function activate() {
        // 妫€鏌HP鐗堟湰
        self::check_php_version();
        
        // 妫€鏌ordPress鐗堟湰
        self::check_wordpress_version();
        
        // 鍒涘缓鏁版嵁搴撹〃
        self::create_tables();
        
        // 鍒濆鍖栬缃€夐」
        self::init_settings();
        
        // 娉ㄥ唽閲嶅啓瑙勫垯
        self::register_rewrite_rules();
        
        // 鍒锋柊閲嶅啓瑙勫垯
        flush_rewrite_rules();
        
        // 璁板綍婵€娲绘棩蹇?        self::log_activation();
    }
    
    /**
     * 鎻掍欢鍋滅敤/鍗歌浇鏃舵墽琛?     */
    public static function deactivate() {
        // 鍒锋柊閲嶅啓瑙勫垯
        flush_rewrite_rules();
        
        // 璁板綍鍋滅敤鏃ュ織
        self::log_deactivation();
    }
    
    /**
     * 鎻掍欢鍗歌浇鏃舵墽琛?     */
    public static function uninstall() {
        // 鍒犻櫎鏁版嵁搴撹〃
        self::drop_tables();
        
        // 鍒犻櫎璁剧疆閫夐」
        self::delete_settings();
        
        // 鍒犻櫎涓婁紶鐨勬枃浠?        self::delete_uploads();
        
        // 鍒犻櫎涓存椂鏂囦欢
        self::delete_temp_files();
        
        // 璁板綍鍗歌浇鏃ュ織
        self::log_uninstall();
    }
    
    /**
     * 妫€鏌HP鐗堟湰
     */
    private static function check_php_version() {
        $required_php_version = '7.0';
        $current_php_version = phpversion();
        
        if ( version_compare( $current_php_version, $required_php_version, '<' ) ) {
            deactivate_plugins( plugin_basename( SUT_WECHAT_MINI_PLUGIN_FILE ) );
            wp_die( 
                sprintf( 
                    __( 'SUT寰俊灏忕▼搴忔彃浠堕渶瑕丳HP %s鎴栨洿楂樼増鏈€傛偍褰撳墠鐨凱HP鐗堟湰鏄?%s锛岃鍗囩骇PHP鐗堟湰鍚庡啀鍚敤鎻掍欢銆?, 'sut-wechat-mini' ), 
                    $required_php_version, 
                    $current_php_version 
                ),
                __( '婵€娲诲け璐?, 'sut-wechat-mini' ),
                array( 'back_link' => true )
            );
        }
    }
    
    /**
     * 妫€鏌ordPress鐗堟湰
     */
    private static function check_wordpress_version() {
        $required_wp_version = '5.0';
        global $wp_version;
        
        if ( version_compare( $wp_version, $required_wp_version, '<' ) ) {
            deactivate_plugins( plugin_basename( SUT_WECHAT_MINI_PLUGIN_FILE ) );
            wp_die( 
                sprintf( 
                    __( 'SUT寰俊灏忕▼搴忔彃浠堕渶瑕乄ordPress %s鎴栨洿楂樼増鏈€傛偍褰撳墠鐨刉ordPress鐗堟湰鏄?%s锛岃鍗囩骇WordPress鐗堟湰鍚庡啀鍚敤鎻掍欢銆?, 'sut-wechat-mini' ), 
                    $required_wp_version, 
                    $wp_version 
                ),
                __( '婵€娲诲け璐?, 'sut-wechat-mini' ),
                array( 'back_link' => true )
            );
        }
    }
    
    /**
     * 鍒涘缓鏁版嵁搴撹〃
     */
    private static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        // 灏忕▼搴忕敤鎴疯〃
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
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY openid (openid),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
        
        // 鐢ㄦ埛鍦板潃琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        
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
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 鐢ㄦ埛鏀惰棌琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            object_id bigint(20) NOT NULL,
            object_type varchar(20) NOT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_object_id_object_type (user_id,object_id,object_type),
            KEY user_id (user_id),
            KEY object_id (object_id),
            KEY object_type (object_type)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 鐢ㄦ埛绛惧埌琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_checkins';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            checkin_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_checkin_time (user_id,checkin_time),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 璁㈠崟琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        
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
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY order_id (order_id),
            KEY user_id (user_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 璐墿杞﹁〃
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cart';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            product_id bigint(20) NOT NULL,
            quantity int(11) NOT NULL,
            variation_id bigint(20) DEFAULT NULL,
            attributes text DEFAULT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_product_id_variation_id (user_id,product_id,variation_id),
            KEY user_id (user_id),
            KEY product_id (product_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 娴忚鍘嗗彶琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_browse_history';
        
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
        
        // API鏃ュ織琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        
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
        
        // 鏀粯鏃ュ織琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_payment_logs';
        
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
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY payment_id (payment_id),
            KEY order_id (order_id),
            KEY user_id (user_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 娑堟伅鎺ㄩ€佽〃
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            message_id varchar(50) NOT NULL,
            user_id bigint(20) NOT NULL,
            type varchar(20) NOT NULL,
            title varchar(100) NOT NULL,
            content text NOT NULL,
            is_read tinyint(1) DEFAULT 0,
            created_at datetime NOT NULL,
            read_time datetime DEFAULT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY message_id (message_id),
            KEY user_id (user_id),
            KEY type (type),
            KEY is_read (is_read),
            KEY create_time (create_time)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 浼氬憳绉垎琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_points';
        
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
     * 鍒濆鍖栬缃€夐」
     */
    private static function init_settings() {
        // 鑾峰彇宸叉湁鐨勮缃?        $existing_settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 瀹氫箟榛樿璁剧疆
        $default_settings = array(
            // 鍩虹璁剧疆
            'app_id' => '',
            'app_secret' => '',
            'token' => '',
            'encoding_aes_key' => '',
            
            // 鍐呭璁剧疆
            'enable_content' => 1,
            'content_per_page' => 10,
            'enable_comments' => 1,
            'enable_share' => 1,
            'enable_collect' => 1,
            
            // 鐢靛晢璁剧疆
            'enable_ecommerce' => 1,
            'enable_woocommerce' => 1,
            'enable_cart' => 1,
            'enable_favorites' => 1,
            
            // 鏀粯璁剧疆
            'enable_pay' => 1,
            'mch_id' => '',
            'api_key' => '',
            'notify_url' => '',
            'ssl_cert_path' => '',
            'ssl_key_path' => '',
            
            // 鐢ㄦ埛璁剧疆
            'enable_user' => 1,
            'enable_user_center' => 1,
            'enable_address' => 1,
            'enable_checkin' => 1,
            
            // 缂撳瓨璁剧疆
            'enable_cache' => 1,
            'cache_time' => 3600,
            
            // 鏃ュ織璁剧疆
            'enable_log' => 0,
            'log_level' => 'error',
            
            // 楂樼骇璁剧疆
            'enable_debug' => 0,
            'ip_whitelist' => '',
            'api_rate_limit' => 0,
            
            // 妯℃澘娑堟伅璁剧疆
            'enable_template_message' => 0,
            'template_message_order_paid' => '',
            'template_message_order_shipped' => '',
            'template_message_order_completed' => '',
            'template_message_refund_success' => '',
            
            // 缁熻璁剧疆
            'enable_statistics' => 1,
            'statistics_retention_days' => 30,
            
            // 鍥介檯鍖栬缃?            'default_language' => 'zh_CN',
            'enable_multi_language' => 0,
            
            // CDN璁剧疆
            'enable_cdn' => 0,
            'cdn_domain' => '',
            
            // 瀹夊叏璁剧疆
            'enable_https' => 1,
            'enable_signature' => 1,
            
            // 鍏朵粬璁剧疆
            'version' => SUT_WECHAT_MINI_VERSION,
            'installed_time' => current_time( 'mysql' ),
            'last_updated_time' => current_time( 'mysql' ),
        );
        
        // 鍚堝苟璁剧疆锛堜繚鐣欏凡鏈夌殑璁剧疆锛岃ˉ鍏呯己灏戠殑璁剧疆锛?        $settings = array_merge( $default_settings, $existing_settings );
        
        // 鏇存柊璁剧疆
        update_option( 'sut_wechat_mini_settings', $settings );
        
        // 璁剧疆鐗堟湰鍙?        update_option( 'sut_wechat_mini_version', SUT_WECHAT_MINI_VERSION );
        
        // 璁剧疆婵€娲绘椂闂?        if ( ! get_option( 'sut_wechat_mini_activated_time' ) ) {
            update_option( 'sut_wechat_mini_activated_time', current_time( 'mysql' ) );
        }
    }
    
    /**
     * 娉ㄥ唽閲嶅啓瑙勫垯
     */
    private static function register_rewrite_rules() {
        // 娉ㄥ唽API閲嶅啓瑙勫垯
        add_rewrite_rule( '^sut-wechat-mini-api/?$', 'index.php?sut_wechat_mini_api=1', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-api/([^/]+)/?$', 'index.php?sut_wechat_mini_api=1&sut_wechat_mini_endpoint=$matches[1]', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-api/([^/]+)/([^/]+)/?$', 'index.php?sut_wechat_mini_api=1&sut_wechat_mini_endpoint=$matches[1]&sut_wechat_mini_action=$matches[2]', 'top' );
        
        // 娉ㄥ唽鏀粯鍥炶皟閲嶅啓瑙勫垯
        add_rewrite_rule( '^sut-wechat-mini-pay-notify/?$', 'index.php?sut_wechat_mini_pay_notify=1', 'top' );
        
        // 娉ㄥ唽寰俊娑堟伅鍥炶皟閲嶅啓瑙勫垯
        add_rewrite_rule( '^sut-wechat-mini-message/?$', 'index.php?sut_wechat_mini_message=1', 'top' );
        
        // 娉ㄥ唽灏忕▼搴忕爜閲嶅啓瑙勫垯
        add_rewrite_rule( '^sut-wechat-mini-qrcode/?$', 'index.php?sut_wechat_mini_qrcode=1', 'top' );
        
        // 娉ㄥ唽REST API閲嶅啓瑙勫垯锛堝鏋滈渶瑕侊級
        add_rewrite_rule( '^sut-wechat-mini-rest/([^/]+)/?$', 'index.php?sut_wechat_mini_rest=1&sut_wechat_mini_resource=$matches[1]', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-rest/([^/]+)/([^/]+)/?$', 'index.php?sut_wechat_mini_rest=1&sut_wechat_mini_resource=$matches[1]&sut_wechat_mini_resource_id=$matches[2]', 'top' );
        
        // 娣诲姞鏌ヨ鍙橀噺
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
     * 鍒犻櫎鏁版嵁搴撹〃
     */
    private static function drop_tables() {
        global $wpdb;
        
        // 鑾峰彇鎵€鏈夎鍒犻櫎鐨勮〃
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
        
        // 鍒犻櫎姣忎釜琛?        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS $table" );
        }
    }
    
    /**
     * 鍒犻櫎璁剧疆閫夐」
     */
    private static function delete_settings() {
        // 鑾峰彇鎵€鏈夎鍒犻櫎鐨勯€夐」
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
        
        // 鍒犻櫎姣忎釜閫夐」
        foreach ( $options as $option ) {
            delete_option( $option );
        }
    }
    
    /**
     * 鍒犻櫎涓婁紶鐨勬枃浠?     */
    private static function delete_uploads() {
        // 鑾峰彇涓婁紶鐩綍
        $upload_dir = wp_upload_dir();
        $sut_wechat_mini_dir = $upload_dir['basedir'] . '/sut-wechat-mini';
        
        // 妫€鏌ョ洰褰曟槸鍚﹀瓨鍦?        if ( is_dir( $sut_wechat_mini_dir ) ) {
            // 鍒犻櫎鐩綍鍙婂叾鍐呭
            self::delete_directory( $sut_wechat_mini_dir );
        }
    }
    
    /**
     * 鍒犻櫎涓存椂鏂囦欢
     */
    private static function delete_temp_files() {
        // 鑾峰彇涓存椂鐩綍
        $temp_dir = sys_get_temp_dir() . '/sut-wechat-mini';
        
        // 妫€鏌ョ洰褰曟槸鍚﹀瓨鍦?        if ( is_dir( $temp_dir ) ) {
            // 鍒犻櫎鐩綍鍙婂叾鍐呭
            self::delete_directory( $temp_dir );
        }
    }
    
    /**
     * 閫掑綊鍒犻櫎鐩綍
     *
     * @param string $dir 鐩綍璺緞
     * @return bool 鍒犻櫎缁撴灉
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
     * 璁板綍婵€娲绘棩蹇?     */
    private static function log_activation() {
        // 鍒涘缓鏃ュ織鏁版嵁
        $log_data = array(
            'action' => 'activate',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'php_version' => phpversion(),
            'wp_version' => get_bloginfo( 'version' ),
            'site_url' => site_url(),
            'admin_email' => get_option( 'admin_email' ),
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 淇濆瓨鏃ュ織
        update_option( 'sut_wechat_mini_install_data', $log_data );
        
        // 濡傛灉鍚敤浜嗚皟璇曟ā寮忥紝璁板綍璇︾粏鏃ュ織
        if ( WP_DEBUG ) {
            error_log( 'SUT寰俊灏忕▼搴忔彃浠跺凡婵€娲? ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 璁板綍鍋滅敤鏃ュ織
     */
    private static function log_deactivation() {
        // 鍒涘缓鏃ュ織鏁版嵁
        $log_data = array(
            'action' => 'deactivate',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 淇濆瓨鍋滅敤鏃堕棿
        update_option( 'sut_wechat_mini_deactivated_time', current_time( 'mysql' ) );
        
        // 濡傛灉鍚敤浜嗚皟璇曟ā寮忥紝璁板綍璇︾粏鏃ュ織
        if ( WP_DEBUG ) {
            error_log( 'SUT寰俊灏忕▼搴忔彃浠跺凡鍋滅敤: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 璁板綍鍗歌浇鏃ュ織
     */
    private static function log_uninstall() {
        // 鍒涘缓鏃ュ織鏁版嵁
        $log_data = array(
            'action' => 'uninstall',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 淇濆瓨鍗歌浇鏃堕棿
        update_option( 'sut_wechat_mini_uninstalled_time', current_time( 'mysql' ) );
        
        // 濡傛灉鍚敤浜嗚皟璇曟ā寮忥紝璁板綍璇︾粏鏃ュ織
        if ( WP_DEBUG ) {
            error_log( 'SUT寰俊灏忕▼搴忔彃浠跺凡鍗歌浇: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 鎻掍欢鏇存柊鏃舵墽琛?     *
     * @param string $old_version 鏃х増鏈彿
     * @param string $new_version 鏂扮増鏈彿
     */
    public static function update( $old_version, $new_version ) {
        // 妫€鏌ョ増鏈苟鎵ц鐩稿簲鐨勬洿鏂版搷浣?        if ( version_compare( $old_version, '1.0.0', '<' ) ) {
            // 鐗堟湰1.0.0鐨勬洿鏂版搷浣?            self::update_to_1_0_0();
        }
        
        if ( version_compare( $old_version, '1.1.0', '<' ) ) {
            // 鐗堟湰1.1.0鐨勬洿鏂版搷浣?            self::update_to_1_1_0();
        }
        
        if ( version_compare( $old_version, '1.2.0', '<' ) ) {
            // 鐗堟湰1.2.0鐨勬洿鏂版搷浣?            self::update_to_1_2_0();
        }
        
        // 鏇存柊鐗堟湰鍙?        update_option( 'sut_wechat_mini_version', $new_version );
        
        // 鏇存柊鏈€鍚庢洿鏂版椂闂?        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $settings['last_updated_time'] = current_time( 'mysql' );
        update_option( 'sut_wechat_mini_settings', $settings );
        
        // 鍒锋柊閲嶅啓瑙勫垯
        flush_rewrite_rules();
        
        // 璁板綍鏇存柊鏃ュ織
        self::log_update( $old_version, $new_version );
    }
    
    /**
     * 鏇存柊鍒扮増鏈?.0.0
     */
    private static function update_to_1_0_0() {
        // 鍦ㄨ繖閲屾坊鍔犵増鏈?.0.0鐨勬洿鏂版搷浣?        // 渚嬪锛氭坊鍔犳柊鐨勬暟鎹簱琛ㄣ€佷慨鏀圭幇鏈夎〃缁撴瀯銆佹洿鏂拌缃€夐」绛?        global $wpdb;
        
        // 绀轰緥锛氭坊鍔犳柊鐨勮缃€夐」
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
     * 鏇存柊鍒扮増鏈?.1.0
     */
    private static function update_to_1_1_0() {
        // 鍦ㄨ繖閲屾坊鍔犵増鏈?.1.0鐨勬洿鏂版搷浣?        global $wpdb;
        
        // 绀轰緥锛氫慨鏀圭幇鏈夎〃缁撴瀯
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 妫€鏌ュ瓧娈垫槸鍚﹀瓨鍦?        $column_exists = $wpdb->get_var( "SHOW COLUMNS FROM $table_name LIKE 'session_key'" );
        
        if ( ! $column_exists ) {
            $wpdb->query( "ALTER TABLE $table_name ADD COLUMN session_key varchar(100) DEFAULT NULL AFTER language" );
        }
        
        // 绀轰緥锛氭坊鍔犳柊鐨勮缃€夐」
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
     * 鏇存柊鍒扮増鏈?.2.0
     */
    private static function update_to_1_2_0() {
        // 鍦ㄨ繖閲屾坊鍔犵増鏈?.2.0鐨勬洿鏂版搷浣?        global $wpdb;
        
        // 绀轰緥锛氭坊鍔犳柊鐨勬暟鎹簱琛?        $table_name = $wpdb->prefix . 'sut_wechat_mini_points';
        
        // 妫€鏌ヨ〃鏄惁瀛樺湪
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
        
        // 绀轰緥锛氭坊鍔犳柊鐨勮缃€夐」
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
     * 璁板綍鏇存柊鏃ュ織
     *
     * @param string $old_version 鏃х増鏈彿
     * @param string $new_version 鏂扮増鏈彿
     */
    private static function log_update( $old_version, $new_version ) {
        // 鍒涘缓鏃ュ織鏁版嵁
        $log_data = array(
            'action' => 'update',
            'old_version' => $old_version,
            'new_version' => $new_version,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 淇濆瓨鏇存柊鏃ュ織
        $update_logs = get_option( 'sut_wechat_mini_update_logs', array() );
        $update_logs[] = $log_data;
        update_option( 'sut_wechat_mini_update_logs', $update_logs );
        
        // 濡傛灉鍚敤浜嗚皟璇曟ā寮忥紝璁板綍璇︾粏鏃ュ織
        if ( WP_DEBUG ) {
            error_log( 'SUT寰俊灏忕▼搴忔彃浠跺凡鏇存柊: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 妫€鏌ユ槸鍚﹂渶瑕佹洿鏂?     *
     * @return array 鏇存柊淇℃伅
     */
    public static function check_for_updates() {
        // 鑾峰彇褰撳墠鐗堟湰
        $current_version = SUT_WECHAT_MINI_VERSION;
        
        // 妫€鏌ユ槸鍚﹀凡缁忔鏌ヨ繃鏇存柊锛堥伩鍏嶉绻佹鏌ワ級
        $last_check = get_option( 'sut_wechat_mini_last_update_check', 0 );
        $check_interval = 24 * 60 * 60; // 24灏忔椂
        
        if ( time() - $last_check < $check_interval ) {
            // 浠庣紦瀛樿幏鍙栨洿鏂颁俊鎭?            $update_available = get_option( 'sut_wechat_mini_update_available', false );
            
            return array(
                'update_available' => $update_available,
                'checked_recently' => true,
            );
        }
        
        // 鏇存柊鏈€鍚庢鏌ユ椂闂?        update_option( 'sut_wechat_mini_last_update_check', time() );
        
        // 妯℃嫙妫€鏌ユ洿鏂帮紙瀹為檯椤圭洰涓簲璇ヤ粠瀹樻柟鏈嶅姟鍣ㄦ鏌ワ級
        $update_available = false;
        $new_version = $current_version;
        $update_url = '';
        $update_description = '';
        
        // 杩欓噷搴旇鏄疄闄呯殑鏇存柊妫€鏌ラ€昏緫
        // 渚嬪锛氬彂閫佽姹傚埌瀹樻柟鏈嶅姟鍣ㄦ鏌ユ槸鍚︽湁鏂扮増鏈?        /*
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
        
        // 淇濆瓨鏇存柊淇℃伅
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
     * 娓呯悊鎻掍欢鏁版嵁
     */
    public static function clean_data() {
        global $wpdb;
        
        // 鑾峰彇淇濈暀澶╂暟璁剧疆
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $retention_days = isset( $settings['statistics_retention_days'] ) ? intval( $settings['statistics_retention_days'] ) : 30;
        
        // 璁＄畻鎴鏃ユ湡
        $cutoff_date = date( 'Y-m-d H:i:s', strtotime( "-$retention_days days" ) );
        
        // 娓呯悊API鏃ュ織
        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE request_time < %s", $cutoff_date ) );
        
        // 娓呯悊鏀粯鏃ュ織
        $table_name = $wpdb->prefix . 'sut_wechat_mini_payment_logs';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE create_time < %s AND status != 'pending'", $cutoff_date ) );
        
        // 娓呯悊娴忚鍘嗗彶
        $table_name = $wpdb->prefix . 'sut_wechat_mini_browse_history';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE browse_time < %s", $cutoff_date ) );
        
        // 璁板綍娓呯悊鏃ュ織
        self::log_clean_data( $retention_days, $cutoff_date );
        
        return true;
    }
    
    /**
     * 璁板綍娓呯悊鏁版嵁鏃ュ織
     *
     * @param int $retention_days 淇濈暀澶╂暟
     * @param string $cutoff_date 鎴鏃ユ湡
     */
    private static function log_clean_data( $retention_days, $cutoff_date ) {
        // 鍒涘缓鏃ュ織鏁版嵁
        $log_data = array(
            'action' => 'clean_data',
            'retention_days' => $retention_days,
            'cutoff_date' => $cutoff_date,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 淇濆瓨娓呯悊鏃ュ織
        $clean_logs = get_option( 'sut_wechat_mini_clean_logs', array() );
        $clean_logs[] = $log_data;
        update_option( 'sut_wechat_mini_clean_logs', $clean_logs );
        
        // 濡傛灉鍚敤浜嗚皟璇曟ā寮忥紝璁板綍璇︾粏鏃ュ織
        if ( WP_DEBUG ) {
            error_log( 'SUT寰俊灏忕▼搴忔彃浠舵暟鎹凡娓呯悊: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 鑾峰彇鎻掍欢缁熻淇℃伅
     *
     * @return array 缁熻淇℃伅
     */
    public static function get_statistics() {
        global $wpdb;
        
        $statistics = array();
        
        // 鑾峰彇鐢ㄦ埛鏁伴噺
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $statistics['total_users'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 鑾峰彇浠婃棩鏂板鐢ㄦ埛鏁伴噺
        $today = date( 'Y-m-d 00:00:00' );
        $statistics['today_new_users'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE create_time >= %s", $today ) );
        
        // 鑾峰彇璁㈠崟鏁伴噺
        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $statistics['total_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 鑾峰彇浠婃棩璁㈠崟鏁伴噺
        $statistics['today_orders'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE create_time >= %s", $today ) );
        
        // 鑾峰彇鎬婚攢鍞
        $statistics['total_sales'] = $wpdb->get_var( "SELECT SUM(total_amount) FROM $table_name WHERE status NOT IN ('cancelled', 'failed')" );
        
        // 鑾峰彇浠婃棩閿€鍞
        $statistics['today_sales'] = $wpdb->get_var( $wpdb->prepare( "SELECT SUM(total_amount) FROM $table_name WHERE create_time >= %s AND status NOT IN ('cancelled', 'failed')", $today ) );
        
        // 鑾峰彇API璇锋眰鏁伴噺
        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        $statistics['total_api_requests'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 鑾峰彇浠婃棩API璇锋眰鏁伴噺
        $statistics['today_api_requests'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE request_time >= %s", $today ) );
        
        // 鑾峰彇閿欒璇锋眰鏁伴噺
        $statistics['error_api_requests'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status_code >= 400" );
        
        // 鑾峰彇鏀粯鎴愬姛鐨勮鍗曟暟閲?        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $statistics['paid_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'paid'" );
        
        // 鑾峰彇瀹屾垚鐨勮鍗曟暟閲?        $statistics['completed_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'completed'" );
        
        // 鑾峰彇鍙栨秷鐨勮鍗曟暟閲?        $statistics['cancelled_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'cancelled'" );
        
        // 鑾峰彇澶辫触鐨勮鍗曟暟閲?        $statistics['failed_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'failed'" );
        
        // 鑾峰彇鏀惰棌鏁伴噺
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        $statistics['total_favorites'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 鑾峰彇绛惧埌鏁伴噺
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_checkins';
        $statistics['total_checkins'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 鑾峰彇鍦板潃鏁伴噺
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        $statistics['total_addresses'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 鑾峰彇缂撳瓨缁熻锛堝鏋滃惎鐢ㄤ簡缂撳瓨锛?        if ( function_exists( 'wp_cache_get_stats' ) ) {
            $cache_stats = wp_cache_get_stats();
            $statistics['cache_size'] = isset( $cache_stats['cache_size'] ) ? $cache_stats['cache_size'] : 0;
            $statistics['cache_hits'] = isset( $cache_stats['cache_hits'] ) ? $cache_stats['cache_hits'] : 0;
            $statistics['cache_misses'] = isset( $cache_stats['cache_misses'] ) ? $cache_stats['cache_misses'] : 0;
        }
        
        // 纭繚缁熻鏁版嵁绫诲瀷姝ｇ‘
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