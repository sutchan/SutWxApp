锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒璺虹暔鐟佸懏鏋冩禒? *
 * 鐠愮喕鐭楅幓鎺嶆濠碘偓濞茬粯妞傞惃鍕殶閹诡喖绨辩悰銊ュ灡瀵ゆ亽鈧礁鍨垫慨瀣啎缂冾喚鐡戦幙宥勭稊
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Install 缁? */
class SUT_WeChat_Mini_Install {
    
    /**
     * 閹绘帊娆㈠┑鈧ú缁樻閹笛嗩攽
     */
    public static function activate() {
        // 濡偓閺岊櫀HP閻楀牊婀?        self::check_php_version();
        
        // 濡偓閺岊櫇ordPress閻楀牊婀?        self::check_wordpress_version();
        
        // 閸掓稑缂撻弫鐗堝祦鎼存捁銆?        self::create_tables();
        
        // 閸掓繂顫愰崠鏍啎缂冾噣鈧銆?        self::init_settings();
        
        // 濞夈劌鍞介柌宥呭晸鐟欏嫬鍨?        self::register_rewrite_rules();
        
        // 閸掗攱鏌婇柌宥呭晸鐟欏嫬鍨?        flush_rewrite_rules();
        
        // 鐠佹澘缍嶅┑鈧ú缁樻）韫?        self::log_activation();
    }
    
    /**
     * 閹绘帊娆㈤崑婊呮暏/閸楁瓕娴囬弮鑸靛⒔鐞?     */
    public static function deactivate() {
        // 閸掗攱鏌婇柌宥呭晸鐟欏嫬鍨?        flush_rewrite_rules();
        
        // 鐠佹澘缍嶉崑婊呮暏閺冦儱绻?        self::log_deactivation();
    }
    
    /**
     * 閹绘帊娆㈤崡姝屾祰閺冭埖澧界悰?     */
    public static function uninstall() {
        // 閸掔娀娅庨弫鐗堝祦鎼存捁銆?        self::drop_tables();
        
        // 閸掔娀娅庣拋鍓х枂闁銆?        self::delete_settings();
        
        // 閸掔娀娅庢稉濠佺炊閻ㄥ嫭鏋冩禒?        self::delete_uploads();
        
        // 閸掔娀娅庢稉瀛樻閺傚洣娆?        self::delete_temp_files();
        
        // 鐠佹澘缍嶉崡姝屾祰閺冦儱绻?        self::log_uninstall();
    }
    
    /**
     * 濡偓閺岊櫀HP閻楀牊婀?     */
    private static function check_php_version() {
        $required_php_version = '7.0';
        $current_php_version = phpversion();
        
        if ( version_compare( $current_php_version, $required_php_version, '<' ) ) {
            deactivate_plugins( plugin_basename( SUT_WECHAT_MINI_PLUGIN_FILE ) );
            wp_die( 
                sprintf( 
                    __( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒鍫曟付鐟曚赋HP %s閹存牗娲挎妯煎閺堫兙鈧倹鍋嶈ぐ鎾冲閻ㄥ嚤HP閻楀牊婀伴弰?%s閿涘矁顕崡鍥╅獓PHP閻楀牊婀伴崥搴″晙閸氼垳鏁ら幓鎺嶆閵?, 'sut-wechat-mini' ), 
                    $required_php_version, 
                    $current_php_version 
                ),
                __( '濠碘偓濞茶銇戠拹?, 'sut-wechat-mini' ),
                array( 'back_link' => true )
            );
        }
    }
    
    /**
     * 濡偓閺岊櫇ordPress閻楀牊婀?     */
    private static function check_wordpress_version() {
        $required_wp_version = '5.0';
        global $wp_version;
        
        if ( version_compare( $wp_version, $required_wp_version, '<' ) ) {
            deactivate_plugins( plugin_basename( SUT_WECHAT_MINI_PLUGIN_FILE ) );
            wp_die( 
                sprintf( 
                    __( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒鍫曟付鐟曚箘ordPress %s閹存牗娲挎妯煎閺堫兙鈧倹鍋嶈ぐ鎾冲閻ㄥ垑ordPress閻楀牊婀伴弰?%s閿涘矁顕崡鍥╅獓WordPress閻楀牊婀伴崥搴″晙閸氼垳鏁ら幓鎺嶆閵?, 'sut-wechat-mini' ), 
                    $required_wp_version, 
                    $wp_version 
                ),
                __( '濠碘偓濞茶銇戠拹?, 'sut-wechat-mini' ),
                array( 'back_link' => true )
            );
        }
    }
    
    /**
     * 閸掓稑缂撻弫鐗堝祦鎼存捁銆?     */
    private static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        // 鐏忓繒鈻兼惔蹇曟暏閹寸柉銆?        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
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
        
        // 閻劍鍩涢崷鏉挎絻鐞?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        
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
        
        // 閻劍鍩涢弨鎯版鐞?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
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
        
        // 閻劍鍩涚粵鎯у煂鐞?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_checkins';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            checkin_time datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id_checkin_time (user_id,checkin_time),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta( $sql );
        
        // 鐠併垹宕熺悰?        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        
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
        
        // 鐠愵厾澧挎潪锕併€?        $table_name = $wpdb->prefix . 'sut_wechat_mini_cart';
        
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
        
        // 濞村繗顫嶉崢鍡楀蕉鐞?        $table_name = $wpdb->prefix . 'sut_wechat_mini_browse_history';
        
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
        
        // API閺冦儱绻旂悰?        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        
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
        
        // 閺€顖欑帛閺冦儱绻旂悰?        $table_name = $wpdb->prefix . 'sut_wechat_mini_payment_logs';
        
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
        
        // 濞戝牊浼呴幒銊┾偓浣姐€?        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
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
        
        // 娴兼艾鎲崇粔顖氬瀻鐞?        $table_name = $wpdb->prefix . 'sut_wechat_mini_points';
        
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
     * 閸掓繂顫愰崠鏍啎缂冾噣鈧銆?     */
    private static function init_settings() {
        // 閼惧嘲褰囧鍙夋箒閻ㄥ嫯顔曠純?        $existing_settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 鐎规矮绠熸妯款吇鐠佸墽鐤?        $default_settings = array(
            // 閸╄櫣顢呯拋鍓х枂
            'app_id' => '',
            'app_secret' => '',
            'token' => '',
            'encoding_aes_key' => '',
            
            // 閸愬懎顔愮拋鍓х枂
            'enable_content' => 1,
            'content_per_page' => 10,
            'enable_comments' => 1,
            'enable_share' => 1,
            'enable_collect' => 1,
            
            // 閻㈤潧鏅㈢拋鍓х枂
            'enable_ecommerce' => 1,
            'enable_woocommerce' => 1,
            'enable_cart' => 1,
            'enable_favorites' => 1,
            
            // 閺€顖欑帛鐠佸墽鐤?            'enable_pay' => 1,
            'mch_id' => '',
            'api_key' => '',
            'notify_url' => '',
            'ssl_cert_path' => '',
            'ssl_key_path' => '',
            
            // 閻劍鍩涚拋鍓х枂
            'enable_user' => 1,
            'enable_user_center' => 1,
            'enable_address' => 1,
            'enable_checkin' => 1,
            
            // 缂傛挸鐡ㄧ拋鍓х枂
            'enable_cache' => 1,
            'cache_time' => 3600,
            
            // 閺冦儱绻旂拋鍓х枂
            'enable_log' => 0,
            'log_level' => 'error',
            
            // 妤傛楠囩拋鍓х枂
            'enable_debug' => 0,
            'ip_whitelist' => '',
            'api_rate_limit' => 0,
            
            // 濡剝婢樺☉鍫熶紖鐠佸墽鐤?            'enable_template_message' => 0,
            'template_message_order_paid' => '',
            'template_message_order_shipped' => '',
            'template_message_order_completed' => '',
            'template_message_refund_success' => '',
            
            // 缂佺喕顓哥拋鍓х枂
            'enable_statistics' => 1,
            'statistics_retention_days' => 30,
            
            // 閸ヤ粙妾崠鏍啎缂?            'default_language' => 'zh_CN',
            'enable_multi_language' => 0,
            
            // CDN鐠佸墽鐤?            'enable_cdn' => 0,
            'cdn_domain' => '',
            
            // 鐎瑰鍙忕拋鍓х枂
            'enable_https' => 1,
            'enable_signature' => 1,
            
            // 閸忔湹绮拋鍓х枂
            'version' => SUT_WECHAT_MINI_VERSION,
            'installed_time' => current_time( 'mysql' ),
            'last_updated_time' => current_time( 'mysql' ),
        );
        
        // 閸氬牆鑻熺拋鍓х枂閿涘牅绻氶悾娆忓嚒閺堝娈戠拋鍓х枂閿涘矁藟閸忓懐宸辩亸鎴犳畱鐠佸墽鐤嗛敍?        $settings = array_merge( $default_settings, $existing_settings );
        
        // 閺囧瓨鏌婄拋鍓х枂
        update_option( 'sut_wechat_mini_settings', $settings );
        
        // 鐠佸墽鐤嗛悧鍫熸拱閸?        update_option( 'sut_wechat_mini_version', SUT_WECHAT_MINI_VERSION );
        
        // 鐠佸墽鐤嗗┑鈧ú缁樻闂?        if ( ! get_option( 'sut_wechat_mini_activated_time' ) ) {
            update_option( 'sut_wechat_mini_activated_time', current_time( 'mysql' ) );
        }
    }
    
    /**
     * 濞夈劌鍞介柌宥呭晸鐟欏嫬鍨?     */
    private static function register_rewrite_rules() {
        // 濞夈劌鍞紸PI闁插秴鍟撶憴鍕灟
        add_rewrite_rule( '^sut-wechat-mini-api/?$', 'index.php?sut_wechat_mini_api=1', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-api/([^/]+)/?$', 'index.php?sut_wechat_mini_api=1&sut_wechat_mini_endpoint=$matches[1]', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-api/([^/]+)/([^/]+)/?$', 'index.php?sut_wechat_mini_api=1&sut_wechat_mini_endpoint=$matches[1]&sut_wechat_mini_action=$matches[2]', 'top' );
        
        // 濞夈劌鍞介弨顖欑帛閸ョ偠鐨熼柌宥呭晸鐟欏嫬鍨?        add_rewrite_rule( '^sut-wechat-mini-pay-notify/?$', 'index.php?sut_wechat_mini_pay_notify=1', 'top' );
        
        // 濞夈劌鍞藉顔讳繆濞戝牊浼呴崶鐐剁殶闁插秴鍟撶憴鍕灟
        add_rewrite_rule( '^sut-wechat-mini-message/?$', 'index.php?sut_wechat_mini_message=1', 'top' );
        
        // 濞夈劌鍞界亸蹇曗柤鎼村繒鐖滈柌宥呭晸鐟欏嫬鍨?        add_rewrite_rule( '^sut-wechat-mini-qrcode/?$', 'index.php?sut_wechat_mini_qrcode=1', 'top' );
        
        // 濞夈劌鍞絉EST API闁插秴鍟撶憴鍕灟閿涘牆顩ч弸婊堟付鐟曚緤绱?        add_rewrite_rule( '^sut-wechat-mini-rest/([^/]+)/?$', 'index.php?sut_wechat_mini_rest=1&sut_wechat_mini_resource=$matches[1]', 'top' );
        add_rewrite_rule( '^sut-wechat-mini-rest/([^/]+)/([^/]+)/?$', 'index.php?sut_wechat_mini_rest=1&sut_wechat_mini_resource=$matches[1]&sut_wechat_mini_resource_id=$matches[2]', 'top' );
        
        // 濞ｈ濮為弻銉嚄閸欐﹢鍣?        add_filter( 'query_vars', function( $vars ) {
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
     * 閸掔娀娅庨弫鐗堝祦鎼存捁銆?     */
    private static function drop_tables() {
        global $wpdb;
        
        // 閼惧嘲褰囬幍鈧張澶庮洣閸掔娀娅庨惃鍕€?        $tables = array(
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
        
        // 閸掔娀娅庡В蹇庨嚋鐞?        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS $table" );
        }
    }
    
    /**
     * 閸掔娀娅庣拋鍓х枂闁銆?     */
    private static function delete_settings() {
        // 閼惧嘲褰囬幍鈧張澶庮洣閸掔娀娅庨惃鍕偓澶愩€?        $options = array(
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
        
        // 閸掔娀娅庡В蹇庨嚋闁銆?        foreach ( $options as $option ) {
            delete_option( $option );
        }
    }
    
    /**
     * 閸掔娀娅庢稉濠佺炊閻ㄥ嫭鏋冩禒?     */
    private static function delete_uploads() {
        // 閼惧嘲褰囨稉濠佺炊閻╊喖缍?        $upload_dir = wp_upload_dir();
        $sut_wechat_mini_dir = $upload_dir['basedir'] . '/sut-wechat-mini';
        
        // 濡偓閺屻儳娲拌ぐ鏇熸Ц閸氾箑鐡ㄩ崷?        if ( is_dir( $sut_wechat_mini_dir ) ) {
            // 閸掔娀娅庨惄顔肩秿閸欏﹤鍙鹃崘鍛啇
            self::delete_directory( $sut_wechat_mini_dir );
        }
    }
    
    /**
     * 閸掔娀娅庢稉瀛樻閺傚洣娆?     */
    private static function delete_temp_files() {
        // 閼惧嘲褰囨稉瀛樻閻╊喖缍?        $temp_dir = sys_get_temp_dir() . '/sut-wechat-mini';
        
        // 濡偓閺屻儳娲拌ぐ鏇熸Ц閸氾箑鐡ㄩ崷?        if ( is_dir( $temp_dir ) ) {
            // 閸掔娀娅庨惄顔肩秿閸欏﹤鍙鹃崘鍛啇
            self::delete_directory( $temp_dir );
        }
    }
    
    /**
     * 闁帒缍婇崚鐘绘珟閻╊喖缍?     *
     * @param string $dir 閻╊喖缍嶇捄顖氱窞
     * @return bool 閸掔娀娅庣紒鎾寸亯
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
     * 鐠佹澘缍嶅┑鈧ú缁樻）韫?     */
    private static function log_activation() {
        // 閸掓稑缂撻弮銉ョ箶閺佺増宓?        $log_data = array(
            'action' => 'activate',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'php_version' => phpversion(),
            'wp_version' => get_bloginfo( 'version' ),
            'site_url' => site_url(),
            'admin_email' => get_option( 'admin_email' ),
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 娣囨繂鐡ㄩ弮銉ョ箶
        update_option( 'sut_wechat_mini_install_data', $log_data );
        
        // 婵″倹鐏夐崥顖滄暏娴滃棜鐨熺拠鏇熌佸蹇ョ礉鐠佹澘缍嶇拠锔剧矎閺冦儱绻?        if ( WP_DEBUG ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒璺哄嚒濠碘偓濞? ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 鐠佹澘缍嶉崑婊呮暏閺冦儱绻?     */
    private static function log_deactivation() {
        // 閸掓稑缂撻弮銉ョ箶閺佺増宓?        $log_data = array(
            'action' => 'deactivate',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 娣囨繂鐡ㄩ崑婊呮暏閺冨爼妫?        update_option( 'sut_wechat_mini_deactivated_time', current_time( 'mysql' ) );
        
        // 婵″倹鐏夐崥顖滄暏娴滃棜鐨熺拠鏇熌佸蹇ョ礉鐠佹澘缍嶇拠锔剧矎閺冦儱绻?        if ( WP_DEBUG ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒璺哄嚒閸嬫粎鏁? ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 鐠佹澘缍嶉崡姝屾祰閺冦儱绻?     */
    private static function log_uninstall() {
        // 閸掓稑缂撻弮銉ョ箶閺佺増宓?        $log_data = array(
            'action' => 'uninstall',
            'plugin_version' => SUT_WECHAT_MINI_VERSION,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 娣囨繂鐡ㄩ崡姝屾祰閺冨爼妫?        update_option( 'sut_wechat_mini_uninstalled_time', current_time( 'mysql' ) );
        
        // 婵″倹鐏夐崥顖滄暏娴滃棜鐨熺拠鏇熌佸蹇ョ礉鐠佹澘缍嶇拠锔剧矎閺冦儱绻?        if ( WP_DEBUG ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒璺哄嚒閸楁瓕娴? ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 閹绘帊娆㈤弴瀛樻煀閺冭埖澧界悰?     *
     * @param string $old_version 閺冄呭閺堫剙褰?     * @param string $new_version 閺傛壆澧楅張顒€褰?     */
    public static function update( $old_version, $new_version ) {
        // 濡偓閺屻儳澧楅張顒€鑻熼幍褑顢戦惄绋跨安閻ㄥ嫭娲块弬鐗堟惙娴?        if ( version_compare( $old_version, '1.0.0', '<' ) ) {
            // 閻楀牊婀?.0.0閻ㄥ嫭娲块弬鐗堟惙娴?            self::update_to_1_0_0();
        }
        
        if ( version_compare( $old_version, '1.1.0', '<' ) ) {
            // 閻楀牊婀?.1.0閻ㄥ嫭娲块弬鐗堟惙娴?            self::update_to_1_1_0();
        }
        
        if ( version_compare( $old_version, '1.2.0', '<' ) ) {
            // 閻楀牊婀?.2.0閻ㄥ嫭娲块弬鐗堟惙娴?            self::update_to_1_2_0();
        }
        
        // 閺囧瓨鏌婇悧鍫熸拱閸?        update_option( 'sut_wechat_mini_version', $new_version );
        
        // 閺囧瓨鏌婇張鈧崥搴㈡纯閺傜増妞傞梻?        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $settings['last_updated_time'] = current_time( 'mysql' );
        update_option( 'sut_wechat_mini_settings', $settings );
        
        // 閸掗攱鏌婇柌宥呭晸鐟欏嫬鍨?        flush_rewrite_rules();
        
        // 鐠佹澘缍嶉弴瀛樻煀閺冦儱绻?        self::log_update( $old_version, $new_version );
    }
    
    /**
     * 閺囧瓨鏌婇崚鎵閺?.0.0
     */
    private static function update_to_1_0_0() {
        // 閸︺劏绻栭柌灞惧潑閸旂姷澧楅張?.0.0閻ㄥ嫭娲块弬鐗堟惙娴?        // 娓氬顩ч敍姘潑閸旂姵鏌婇惃鍕殶閹诡喖绨辩悰銊ｂ偓浣锋叏閺€鍦箛閺堝銆冪紒鎾寸€妴浣规纯閺傛媽顔曠純顕€鈧銆嶇粵?        global $wpdb;
        
        // 缁€杞扮伐閿涙碍鍧婇崝鐘虫煀閻ㄥ嫯顔曠純顕€鈧銆?        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_template_message'] ) ) {
            $settings['enable_template_message'] = 0;
        }
        
        if ( ! isset( $settings['template_message_order_paid'] ) ) {
            $settings['template_message_order_paid'] = '';
        }
        
        update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 閺囧瓨鏌婇崚鎵閺?.1.0
     */
    private static function update_to_1_1_0() {
        // 閸︺劏绻栭柌灞惧潑閸旂姷澧楅張?.1.0閻ㄥ嫭娲块弬鐗堟惙娴?        global $wpdb;
        
        // 缁€杞扮伐閿涙矮鎱ㄩ弨鍦箛閺堝銆冪紒鎾寸€?        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 濡偓閺屻儱鐡у▓鍨Ц閸氾箑鐡ㄩ崷?        $column_exists = $wpdb->get_var( "SHOW COLUMNS FROM $table_name LIKE 'session_key'" );
        
        if ( ! $column_exists ) {
            $wpdb->query( "ALTER TABLE $table_name ADD COLUMN session_key varchar(100) DEFAULT NULL AFTER language" );
        }
        
        // 缁€杞扮伐閿涙碍鍧婇崝鐘虫煀閻ㄥ嫯顔曠純顕€鈧銆?        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_multi_language'] ) ) {
            $settings['enable_multi_language'] = 0;
        }
        
        if ( ! isset( $settings['default_language'] ) ) {
            $settings['default_language'] = 'zh_CN';
        }
        
        update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 閺囧瓨鏌婇崚鎵閺?.2.0
     */
    private static function update_to_1_2_0() {
        // 閸︺劏绻栭柌灞惧潑閸旂姷澧楅張?.2.0閻ㄥ嫭娲块弬鐗堟惙娴?        global $wpdb;
        
        // 缁€杞扮伐閿涙碍鍧婇崝鐘虫煀閻ㄥ嫭鏆熼幑顔肩氨鐞?        $table_name = $wpdb->prefix . 'sut_wechat_mini_points';
        
        // 濡偓閺屻儴銆冮弰顖氭儊鐎涙ê婀?        $table_exists = $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" );
        
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
        
        // 缁€杞扮伐閿涙碍鍧婇崝鐘虫煀閻ㄥ嫯顔曠純顕€鈧銆?        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_statistics'] ) ) {
            $settings['enable_statistics'] = 1;
        }
        
        if ( ! isset( $settings['statistics_retention_days'] ) ) {
            $settings['statistics_retention_days'] = 30;
        }
        
        update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 鐠佹澘缍嶉弴瀛樻煀閺冦儱绻?     *
     * @param string $old_version 閺冄呭閺堫剙褰?     * @param string $new_version 閺傛壆澧楅張顒€褰?     */
    private static function log_update( $old_version, $new_version ) {
        // 閸掓稑缂撻弮銉ョ箶閺佺増宓?        $log_data = array(
            'action' => 'update',
            'old_version' => $old_version,
            'new_version' => $new_version,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 娣囨繂鐡ㄩ弴瀛樻煀閺冦儱绻?        $update_logs = get_option( 'sut_wechat_mini_update_logs', array() );
        $update_logs[] = $log_data;
        update_option( 'sut_wechat_mini_update_logs', $update_logs );
        
        // 婵″倹鐏夐崥顖滄暏娴滃棜鐨熺拠鏇熌佸蹇ョ礉鐠佹澘缍嶇拠锔剧矎閺冦儱绻?        if ( WP_DEBUG ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒璺哄嚒閺囧瓨鏌? ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 濡偓閺屻儲妲搁崥锕傛付鐟曚焦娲块弬?     *
     * @return array 閺囧瓨鏌婃穱鈩冧紖
     */
    public static function check_for_updates() {
        // 閼惧嘲褰囪ぐ鎾冲閻楀牊婀?        $current_version = SUT_WECHAT_MINI_VERSION;
        
        // 濡偓閺屻儲妲搁崥锕€鍑＄紒蹇旑梾閺屻儴绻冮弴瀛樻煀閿涘牓浼╅崗宥夘暥缁讳焦顥呴弻銉礆
        $last_check = get_option( 'sut_wechat_mini_last_update_check', 0 );
        $check_interval = 24 * 60 * 60; // 24鐏忓繑妞?        
        if ( time() - $last_check < $check_interval ) {
            // 娴犲海绱︾€涙骞忛崣鏍ㄦ纯閺傞淇婇幁?            $update_available = get_option( 'sut_wechat_mini_update_available', false );
            
            return array(
                'update_available' => $update_available,
                'checked_recently' => true,
            );
        }
        
        // 閺囧瓨鏌婇張鈧崥搴㈩梾閺屻儲妞傞梻?        update_option( 'sut_wechat_mini_last_update_check', time() );
        
        // 濡剝瀚欏Λ鈧弻銉︽纯閺傚府绱欑€圭偤妾い鍦窗娑擃厼绨茬拠銉ょ矤鐎规ɑ鏌熼張宥呭閸ｃ劍顥呴弻銉礆
        $update_available = false;
        $new_version = $current_version;
        $update_url = '';
        $update_description = '';
        
        // 鏉╂瑩鍣锋惔鏃囶嚉閺勵垰鐤勯梽鍛畱閺囧瓨鏌婂Λ鈧弻銉┾偓鏄忕帆
        // 娓氬顩ч敍姘絺闁浇顕Ч鍌氬煂鐎规ɑ鏌熼張宥呭閸ｃ劍顥呴弻銉︽Ц閸氾附婀侀弬鎵閺?        /*
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
        
        // 娣囨繂鐡ㄩ弴瀛樻煀娣団剝浼?        update_option( 'sut_wechat_mini_update_available', $update_available );
        
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
     * 濞撳懐鎮婇幓鎺嶆閺佺増宓?     */
    public static function clean_data() {
        global $wpdb;
        
        // 閼惧嘲褰囨穱婵堟殌婢垛晜鏆熺拋鍓х枂
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $retention_days = isset( $settings['statistics_retention_days'] ) ? intval( $settings['statistics_retention_days'] ) : 30;
        
        // 鐠侊紕鐣婚幋顏咁剾閺冦儲婀?        $cutoff_date = date( 'Y-m-d H:i:s', strtotime( "-$retention_days days" ) );
        
        // 濞撳懐鎮夾PI閺冦儱绻?        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE request_time < %s", $cutoff_date ) );
        
        // 濞撳懐鎮婇弨顖欑帛閺冦儱绻?        $table_name = $wpdb->prefix . 'sut_wechat_mini_payment_logs';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE create_time < %s AND status != 'pending'", $cutoff_date ) );
        
        // 濞撳懐鎮婂ù蹇氼潔閸樺棗褰?        $table_name = $wpdb->prefix . 'sut_wechat_mini_browse_history';
        $wpdb->query( $wpdb->prepare( "DELETE FROM $table_name WHERE browse_time < %s", $cutoff_date ) );
        
        // 鐠佹澘缍嶅〒鍛倞閺冦儱绻?        self::log_clean_data( $retention_days, $cutoff_date );
        
        return true;
    }
    
    /**
     * 鐠佹澘缍嶅〒鍛倞閺佺増宓侀弮銉ョ箶
     *
     * @param int $retention_days 娣囨繄鏆€婢垛晜鏆?     * @param string $cutoff_date 閹搭亝顒涢弮銉︽埂
     */
    private static function log_clean_data( $retention_days, $cutoff_date ) {
        // 閸掓稑缂撻弮銉ョ箶閺佺増宓?        $log_data = array(
            'action' => 'clean_data',
            'retention_days' => $retention_days,
            'cutoff_date' => $cutoff_date,
            'timestamp' => current_time( 'mysql' ),
        );
        
        // 娣囨繂鐡ㄥ〒鍛倞閺冦儱绻?        $clean_logs = get_option( 'sut_wechat_mini_clean_logs', array() );
        $clean_logs[] = $log_data;
        update_option( 'sut_wechat_mini_clean_logs', $clean_logs );
        
        // 婵″倹鐏夐崥顖滄暏娴滃棜鐨熺拠鏇熌佸蹇ョ礉鐠佹澘缍嶇拠锔剧矎閺冦儱绻?        if ( WP_DEBUG ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑褰冩禒鑸垫殶閹诡喖鍑″〒鍛倞: ' . json_encode( $log_data ) );
        }
    }
    
    /**
     * 閼惧嘲褰囬幓鎺嶆缂佺喕顓告穱鈩冧紖
     *
     * @return array 缂佺喕顓告穱鈩冧紖
     */
    public static function get_statistics() {
        global $wpdb;
        
        $statistics = array();
        
        // 閼惧嘲褰囬悽銊﹀煕閺佷即鍣?        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $statistics['total_users'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 閼惧嘲褰囨禒濠冩）閺傛澘顤冮悽銊﹀煕閺佷即鍣?        $today = date( 'Y-m-d 00:00:00' );
        $statistics['today_new_users'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE create_time >= %s", $today ) );
        
        // 閼惧嘲褰囩拋銏犲礋閺佷即鍣?        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $statistics['total_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 閼惧嘲褰囨禒濠冩）鐠併垹宕熼弫浼村櫤
        $statistics['today_orders'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE create_time >= %s", $today ) );
        
        // 閼惧嘲褰囬幀濠氭敘閸烆噣顤?        $statistics['total_sales'] = $wpdb->get_var( "SELECT SUM(total_amount) FROM $table_name WHERE status NOT IN ('cancelled', 'failed')" );
        
        // 閼惧嘲褰囨禒濠冩）闁库偓閸烆噣顤?        $statistics['today_sales'] = $wpdb->get_var( $wpdb->prepare( "SELECT SUM(total_amount) FROM $table_name WHERE create_time >= %s AND status NOT IN ('cancelled', 'failed')", $today ) );
        
        // 閼惧嘲褰嘇PI鐠囬攱鐪伴弫浼村櫤
        $table_name = $wpdb->prefix . 'sut_wechat_mini_api_logs';
        $statistics['total_api_requests'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 閼惧嘲褰囨禒濠冩）API鐠囬攱鐪伴弫浼村櫤
        $statistics['today_api_requests'] = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE request_time >= %s", $today ) );
        
        // 閼惧嘲褰囬柨娆掝嚖鐠囬攱鐪伴弫浼村櫤
        $statistics['error_api_requests'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status_code >= 400" );
        
        // 閼惧嘲褰囬弨顖欑帛閹存劕濮涢惃鍕吂閸楁洘鏆熼柌?        $table_name = $wpdb->prefix . 'sut_wechat_mini_orders';
        $statistics['paid_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'paid'" );
        
        // 閼惧嘲褰囩€瑰本鍨氶惃鍕吂閸楁洘鏆熼柌?        $statistics['completed_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'completed'" );
        
        // 閼惧嘲褰囬崣鏍ㄧХ閻ㄥ嫯顓归崡鏇熸殶闁?        $statistics['cancelled_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'cancelled'" );
        
        // 閼惧嘲褰囨径杈Е閻ㄥ嫯顓归崡鏇熸殶闁?        $statistics['failed_orders'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'failed'" );
        
        // 閼惧嘲褰囬弨鎯版閺佷即鍣?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        $statistics['total_favorites'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 閼惧嘲褰囩粵鎯у煂閺佷即鍣?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_checkins';
        $statistics['total_checkins'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 閼惧嘲褰囬崷鏉挎絻閺佷即鍣?        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        $statistics['total_addresses'] = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        // 閼惧嘲褰囩紓鎾崇摠缂佺喕顓搁敍鍫濐洤閺嬫粌鎯庨悽銊ょ啊缂傛挸鐡ㄩ敍?        if ( function_exists( 'wp_cache_get_stats' ) ) {
            $cache_stats = wp_cache_get_stats();
            $statistics['cache_size'] = isset( $cache_stats['cache_size'] ) ? $cache_stats['cache_size'] : 0;
            $statistics['cache_hits'] = isset( $cache_stats['cache_hits'] ) ? $cache_stats['cache_hits'] : 0;
            $statistics['cache_misses'] = isset( $cache_stats['cache_misses'] ) ? $cache_stats['cache_misses'] : 0;
        }
        
        // 绾喕绻氱紒鐔活吀閺佺増宓佺猾璇茬€峰锝団€?        foreach ( $statistics as $key => $value ) {
            if ( is_null( $value ) ) {
                $statistics[$key] = 0;
            } else if ( is_numeric( $value ) ) {
                $statistics[$key] = floatval( $value );
            }
        }
        
        return $statistics;
    }
}\n