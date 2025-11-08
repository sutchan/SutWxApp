<?php
/**
 * SUT寰俊灏忕▼搴忕紦瀛樼鐞嗙被
 *
 * 璐熻矗寰俊灏忕▼搴忕殑缂撳瓨绠＄悊銆佺紦瀛樻竻鐞嗐€佺紦瀛橀鐑瓑鍔熻兘
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Cache 绫? */
class SUT_WeChat_Mini_Cache {
    
    /**
     * 鍗曚緥瀹炰緥
     *
     * @var SUT_WeChat_Mini_Cache
     */
    private static $instance = null;
    
    /**
     * 榛樿缂撳瓨鏃堕棿锛堢锛?     *
     * @var int
     */
    private $default_ttl = 3600;
    
    /**
     * 缂撳瓨鍓嶇紑
     *
     * @var string
     */
    private $cache_prefix = 'sut_wechat_mini_';
    
    /**
     * 鏋勯€犲嚱鏁?     */
    private function __construct() {
        // 娉ㄥ唽閽╁瓙
        $this->register_hooks();
        
        // 璁剧疆缂撳瓨鏃堕棿
        $this->set_default_ttl();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
     *
     * @return SUT_WeChat_Mini_Cache
     */
    public static function get_instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 娉ㄥ唽閽╁瓙
     */
    private function register_hooks() {
        // 娓呯悊缂撳瓨
        add_action( 'sut_wechat_mini_clear_cache', array( $this, 'clear_all_cache' ) );
        
        // 鏂囩珷鏇存柊鏃舵竻鐞嗙浉鍏崇紦瀛?        add_action( 'save_post', array( $this, 'on_post_updated' ), 10, 3 );
        
        // 鏂囩珷鍒犻櫎鏃舵竻鐞嗙浉鍏崇紦瀛?        add_action( 'delete_post', array( $this, 'on_post_deleted' ), 10, 1 );
        
        // 浜у搧鏇存柊鏃舵竻鐞嗙浉鍏崇紦瀛?        add_action( 'woocommerce_update_product', array( $this, 'on_product_updated' ), 10, 1 );
        
        // 浜у搧鍒犻櫎鏃舵竻鐞嗙浉鍏崇紦瀛?        add_action( 'before_delete_post', array( $this, 'on_product_deleted' ), 10, 1 );
        
        // 璁㈠崟鐘舵€佸彉鏇存椂娓呯悊鐩稿叧缂撳瓨
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 3 );
        
        // 鐢ㄦ埛鏇存柊鏃舵竻鐞嗙浉鍏崇紦瀛?        add_action( 'profile_update', array( $this, 'on_user_updated' ), 10, 2 );
        
        // 姣忔棩瀹氭椂娓呯悊杩囨湡缂撳瓨
        if ( ! wp_next_scheduled( 'sut_wechat_mini_daily_cleanup' ) ) {
            wp_schedule_event( time(), 'daily', 'sut_wechat_mini_daily_cleanup' );
        }
        
        add_action( 'sut_wechat_mini_daily_cleanup', array( $this, 'daily_cleanup' ) );
    }
    
    /**
     * 璁剧疆榛樿缂撳瓨鏃堕棿
     */
    private function set_default_ttl() {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings['cache_ttl'] ) && $settings['cache_ttl'] > 0 ) {
            $this->default_ttl = intval( $settings['cache_ttl'] );
        }
    }
    
    /**
     * 鐢熸垚缂撳瓨閿?     *
     * @param string $key 鍘熷閿悕
     * @param array $args 鍙傛暟鏁扮粍
     * @return string 瀹屾暣鐨勭紦瀛橀敭
     */
    private function get_cache_key( $key, $args = array() ) {
        // 濡傛灉鍙傛暟涓嶄负绌猴紝灏嗗弬鏁板簭鍒楀寲骞舵坊鍔犲埌閿腑
        if ( ! empty( $args ) ) {
            $key .= '_' . md5( serialize( $args ) );
        }
        
        // 娣诲姞缂撳瓨鍓嶇紑
        return $this->cache_prefix . $key;
    }
    
    /**
     * 鑾峰彇缂撳瓨
     *
     * @param string $key 缂撳瓨閿?     * @param array $args 鍙傛暟鏁扮粍
     * @return mixed 缂撳瓨鏁版嵁鎴杅alse
     */
    public function get( $key, $args = array() ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 灏濊瘯浠嶹ordPress缂撳瓨鑾峰彇
        $data = wp_cache_get( $cache_key );
        
        if ( $data !== false ) {
            return $data;
        }
        
        // 濡傛灉WordPress缂撳瓨鏈懡涓紝灏濊瘯浠庤嚜瀹氫箟琛ㄨ幏鍙?        global $wpdb;
        
        $sql = "SELECT data, expire_time FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key = %s";
        $result = $wpdb->get_row( $wpdb->prepare( $sql, $cache_key ), ARRAY_A );
        
        if ( ! $result ) {
            return false;
        }
        
        // 妫€鏌ョ紦瀛樻槸鍚﹁繃鏈?        $current_time = time();
        
        if ( $result['expire_time'] > 0 && $current_time > $result['expire_time'] ) {
            // 鍒犻櫎杩囨湡缂撳瓨
            $this->delete_cache_from_db( $cache_key );
            return false;
        }
        
        // 鍙嶅簭鍒楀寲缂撳瓨鏁版嵁
        $data = maybe_unserialize( $result['data'] );
        
        // 瀛樺偍鍒癢ordPress缂撳瓨涓?        wp_cache_set( $cache_key, $data, '', $result['expire_time'] > 0 ? $result['expire_time'] - $current_time : 0 );
        
        return $data;
    }
    
    /**
     * 璁剧疆缂撳瓨
     *
     * @param string $key 缂撳瓨閿?     * @param mixed $data 缂撳瓨鏁版嵁
     * @param array $args 鍙傛暟鏁扮粍
     * @param int $ttl 缂撳瓨鏃堕棿锛堢锛?     * @return bool 鎿嶄綔缁撴灉
     */
    public function set( $key, $data, $args = array(), $ttl = null ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 浣跨敤榛樿缂撳瓨鏃堕棿锛堝鏋滄湭鎸囧畾锛?        if ( is_null( $ttl ) ) {
            $ttl = $this->default_ttl;
        }
        
        // 璁＄畻杩囨湡鏃堕棿
        $expire_time = $ttl > 0 ? time() + $ttl : 0;
        
        // 搴忓垪鍖栫紦瀛樻暟鎹?        $serialized_data = maybe_serialize( $data );
        
        // 瀛樺偍鍒癢ordPress缂撳瓨
        wp_cache_set( $cache_key, $data, '', $ttl );
        
        // 瀛樺偍鍒拌嚜瀹氫箟琛?        global $wpdb;
        
        // 妫€鏌ョ紦瀛樻槸鍚﹀凡瀛樺湪
        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key = %s";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $cache_key ) );
        
        if ( $count > 0 ) {
            // 鏇存柊缂撳瓨
            $result = $wpdb->update(
                $wpdb->prefix . 'sut_wechat_mini_cache',
                array(
                    'data' => $serialized_data,
                    'expire_time' => $expire_time,
                    'update_time' => current_time( 'mysql' )
                ),
                array(
                    'cache_key' => $cache_key
                ),
                array( '%s', '%d', '%s' ),
                array( '%s' )
            );
        } else {
            // 鎻掑叆缂撳瓨
            $result = $wpdb->insert(
                $wpdb->prefix . 'sut_wechat_mini_cache',
                array(
                    'cache_key' => $cache_key,
                    'data' => $serialized_data,
                    'expire_time' => $expire_time,
                    'create_time' => current_time( 'mysql' ),
                    'update_time' => current_time( 'mysql' )
                ),
                array( '%s', '%s', '%d', '%s', '%s' )
            );
        }
        
        return $result !== false;
    }
    
    /**
     * 鍒犻櫎缂撳瓨
     *
     * @param string $key 缂撳瓨閿?     * @param array $args 鍙傛暟鏁扮粍
     * @return bool 鎿嶄綔缁撴灉
     */
    public function delete( $key, $args = array() ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 浠嶹ordPress缂撳瓨鍒犻櫎
        wp_cache_delete( $cache_key );
        
        // 浠庤嚜瀹氫箟琛ㄥ垹闄?        return $this->delete_cache_from_db( $cache_key );
    }
    
    /**
     * 浠庢暟鎹簱鍒犻櫎缂撳瓨
     *
     * @param string $cache_key 瀹屾暣鐨勭紦瀛橀敭
     * @return bool 鎿嶄綔缁撴灉
     */
    private function delete_cache_from_db( $cache_key ) {
        global $wpdb;
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'sut_wechat_mini_cache',
            array(
                'cache_key' => $cache_key
            ),
            array( '%s' )
        );
        
        return $result !== false;
    }
    
    /**
     * 娓呯悊鎵€鏈夌紦瀛?     */
    public function clear_all_cache() {
        // 娓呯悊WordPress瀵硅薄缂撳瓨
        wp_cache_flush();
        
        // 娓呯悊鑷畾涔夌紦瀛樿〃
        global $wpdb;
        
        $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}sut_wechat_mini_cache" );
    }
    
    /**
     * 娓呯悊鎸囧畾绫诲瀷鐨勭紦瀛?     *
     * @param string $cache_type 缂撳瓨绫诲瀷
     */
    public function clear_cache_by_type( $cache_type ) {
        // 鏋勫缓缂撳瓨閿墠缂€
        $cache_key_prefix = $this->cache_prefix . $cache_type . '_';
        
        // 娓呯悊WordPress缂撳瓨锛堣繖閲屾棤娉曠簿纭竻鐞嗭紝闇€瑕佸€熷姪绗笁鏂规彃浠舵垨鑷畾涔夊疄鐜帮級
        
        // 娓呯悊鑷畾涔夎〃涓寚瀹氱被鍨嬬殑缂撳瓨
        global $wpdb;
        
        $sql = $wpdb->prepare( "DELETE FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key LIKE %s", $cache_key_prefix . '%' );
        $wpdb->query( $sql );
    }
    
    /**
     * 娓呯悊杩囨湡缂撳瓨
     */
    public function clear_expired_cache() {
        global $wpdb;
        
        $current_time = time();
        
        $sql = $wpdb->prepare( "DELETE FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE expire_time > 0 AND expire_time < %d", $current_time );
        $wpdb->query( $sql );
    }
    
    /**
     * 娓呯悊涓庢枃绔犵浉鍏崇殑缂撳瓨
     *
     * @param int $post_id 鏂囩珷ID
     */
    public function clear_post_cache( $post_id ) {
        // 娓呯悊鏂囩珷璇︽儏缂撳瓨
        $this->delete( 'post_detail', array( 'id' => $post_id ) );
        
        // 娓呯悊鐩稿叧鏂囩珷鍒楄〃缂撳瓨
        $this->delete( 'related_posts', array( 'post_id' => $post_id ) );
        
        // 娓呯悊鐑棬鏂囩珷缂撳瓨
        $this->clear_cache_by_type( 'hot_posts' );
        
        // 娓呯悊鏈€鏂版枃绔犵紦瀛?        $this->clear_cache_by_type( 'latest_posts' );
        
        // 娓呯悊鍒嗙被鏂囩珷缂撳瓨
        $categories = wp_get_post_categories( $post_id );
        
        foreach ( $categories as $category_id ) {
            $this->delete( 'category_posts', array( 'category_id' => $category_id ) );
        }
        
        // 娓呯悊鏍囩鏂囩珷缂撳瓨
        $tags = wp_get_post_tags( $post_id, array( 'fields' => 'ids' ) );
        
        foreach ( $tags as $tag_id ) {
            $this->delete( 'tag_posts', array( 'tag_id' => $tag_id ) );
        }
    }
    
    /**
     * 娓呯悊涓庝骇鍝佺浉鍏崇殑缂撳瓨
     *
     * @param int $product_id 浜у搧ID
     */
    public function clear_product_cache( $product_id ) {
        // 娓呯悊浜у搧璇︽儏缂撳瓨
        $this->delete( 'product_detail', array( 'id' => $product_id ) );
        
        // 娓呯悊鐩稿叧浜у搧缂撳瓨
        $this->delete( 'related_products', array( 'product_id' => $product_id ) );
        
        // 娓呯悊鐑棬浜у搧缂撳瓨
        $this->clear_cache_by_type( 'hot_products' );
        
        // 娓呯悊鏈€鏂颁骇鍝佺紦瀛?        $this->clear_cache_by_type( 'latest_products' );
        
        // 娓呯悊鍒嗙被浜у搧缂撳瓨
        $terms = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
        
        foreach ( $terms as $term_id ) {
            $this->delete( 'category_products', array( 'category_id' => $term_id ) );
        }
        
        // 娓呯悊鏍囩浜у搧缂撳瓨
        $terms = wp_get_post_terms( $product_id, 'product_tag', array( 'fields' => 'ids' ) );
        
        foreach ( $terms as $term_id ) {
            $this->delete( 'tag_products', array( 'tag_id' => $term_id ) );
        }
    }
    
    /**
     * 娓呯悊涓庤鍗曠浉鍏崇殑缂撳瓨
     *
     * @param int $order_id 璁㈠崟ID
     */
    public function clear_order_cache( $order_id ) {
        // 娓呯悊璁㈠崟璇︽儏缂撳瓨
        $this->delete( 'order_detail', array( 'id' => $order_id ) );
        
        // 娓呯悊鐢ㄦ埛璁㈠崟鍒楄〃缂撳瓨
        $order = wc_get_order( $order_id );
        
        if ( $order ) {
            $user_id = $order->get_user_id();
            
            if ( $user_id > 0 ) {
                $this->delete( 'user_orders', array( 'user_id' => $user_id ) );
            }
        }
    }
    
    /**
     * 娓呯悊涓庣敤鎴风浉鍏崇殑缂撳瓨
     *
     * @param int $user_id 鐢ㄦ埛ID
     */
    public function clear_user_cache( $user_id ) {
        // 娓呯悊鐢ㄦ埛淇℃伅缂撳瓨
        $this->delete( 'user_info', array( 'id' => $user_id ) );
        
        // 娓呯悊鐢ㄦ埛璁㈠崟缂撳瓨
        $this->delete( 'user_orders', array( 'user_id' => $user_id ) );
        
        // 娓呯悊鐢ㄦ埛鏀惰棌缂撳瓨
        $this->delete( 'user_favorites', array( 'user_id' => $user_id ) );
        
        // 娓呯悊鐢ㄦ埛绉垎缂撳瓨
        $this->delete( 'user_points', array( 'user_id' => $user_id ) );
        
        // 娓呯悊鐢ㄦ埛鍦板潃缂撳瓨
        $this->delete( 'user_addresses', array( 'user_id' => $user_id ) );
    }
    
    /**
     * 棰勭儹鏂囩珷缂撳瓨
     *
     * @param int $limit 棰勭儹鏂囩珷鏁伴噺
     */
    public function warmup_post_cache( $limit = 100 ) {
        // 鑾峰彇鏈€鏂扮殑鏂囩珷
        $args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query( $args );
        
        // 瀵煎叆SUT_WeChat_Mini_Content绫?        if ( ! class_exists( 'SUT_WeChat_Mini_Content' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/content/class-sut-wechat-mini-content.php';
        }
        
        $content_helper = SUT_WeChat_Mini_Content::get_instance();
        
        // 棰勭儹姣忕瘒鏂囩珷鐨勭紦瀛?        foreach ( $query->posts as $post ) {
            $post_data = $content_helper->get_post_data( $post->ID );
            
            if ( $post_data ) {
                $this->set( 'post_detail', $post_data, array( 'id' => $post->ID ) );
            }
        }
        
        // 閲嶇疆鏌ヨ
        wp_reset_postdata();
    }
    
    /**
     * 棰勭儹浜у搧缂撳瓨
     *
     * @param int $limit 棰勭儹浜у搧鏁伴噺
     */
    public function warmup_product_cache( $limit = 100 ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }
        
        // 鑾峰彇鏈€鏂扮殑浜у搧
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query( $args );
        
        // 瀵煎叆SUT_WeChat_Mini_WooCommerce绫?        if ( ! class_exists( 'SUT_WeChat_Mini_WooCommerce' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/woocommerce/class-sut-wechat-mini-woocommerce.php';
        }
        
        $wc_helper = SUT_WeChat_Mini_WooCommerce::get_instance();
        
        // 棰勭儹姣忎釜浜у搧鐨勭紦瀛?        foreach ( $query->posts as $post ) {
            $product_data = $wc_helper->get_product_data( $post->ID );
            
            if ( $product_data ) {
                $this->set( 'product_detail', $product_data, array( 'id' => $post->ID ) );
            }
        }
        
        // 閲嶇疆鏌ヨ
        wp_reset_postdata();
    }
    
    /**
     * 澶勭悊鏂囩珷鏇存柊浜嬩欢
     *
     * @param int $post_id 鏂囩珷ID
     * @param WP_Post $post 鏂囩珷瀵硅薄
     * @param bool $update 鏄惁鏄洿鏂?     */
    public function on_post_updated( $post_id, $post, $update ) {
        // 鍙鐞嗗彂甯冪姸鎬佺殑鏂囩珷
        if ( $post->post_status !== 'publish' ) {
            return;
        }
        
        // 鍙鐞嗘枃绔犵被鍨?        if ( $post->post_type !== 'post' ) {
            return;
        }
        
        // 娓呯悊鐩稿叧缂撳瓨
        $this->clear_post_cache( $post_id );
    }
    
    /**
     * 澶勭悊鏂囩珷鍒犻櫎浜嬩欢
     *
     * @param int $post_id 鏂囩珷ID
     */
    public function on_post_deleted( $post_id ) {
        $post = get_post( $post_id );
        
        if ( ! $post || $post->post_type !== 'post' ) {
            return;
        }
        
        // 娓呯悊鐩稿叧缂撳瓨
        $this->clear_post_cache( $post_id );
    }
    
    /**
     * 澶勭悊浜у搧鏇存柊浜嬩欢
     *
     * @param int $product_id 浜у搧ID
     */
    public function on_product_updated( $product_id ) {
        // 娓呯悊鐩稿叧缂撳瓨
        $this->clear_product_cache( $product_id );
    }
    
    /**
     * 澶勭悊浜у搧鍒犻櫎浜嬩欢
     *
     * @param int $post_id 浜у搧ID
     */
    public function on_product_deleted( $post_id ) {
        $post = get_post( $post_id );
        
        if ( ! $post || $post->post_type !== 'product' ) {
            return;
        }
        
        // 娓呯悊鐩稿叧缂撳瓨
        $this->clear_product_cache( $post_id );
    }
    
    /**
     * 澶勭悊璁㈠崟鐘舵€佸彉鏇翠簨浠?     *
     * @param int $order_id 璁㈠崟ID
     * @param string $old_status 鏃х姸鎬?     * @param string $new_status 鏂扮姸鎬?     */
    public function on_order_status_changed( $order_id, $old_status, $new_status ) {
        // 娓呯悊鐩稿叧缂撳瓨
        $this->clear_order_cache( $order_id );
        
        // 濡傛灉璁㈠崟鐘舵€佸彉鏇翠細褰卞搷缁熻鏁版嵁锛屾竻鐞嗙粺璁＄紦瀛?        $this->clear_cache_by_type( 'stats' );
    }
    
    /**
     * 澶勭悊鐢ㄦ埛鏇存柊浜嬩欢
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param WP_User $old_user_data 鏃х敤鎴锋暟鎹?     */
    public function on_user_updated( $user_id, $old_user_data ) {
        // 娓呯悊鐩稿叧缂撳瓨
        $this->clear_user_cache( $user_id );
    }
    
    /**
     * 姣忔棩娓呯悊浠诲姟
     */
    public function daily_cleanup() {
        // 娓呯悊杩囨湡缂撳瓨
        $this->clear_expired_cache();
        
        // 娓呯悊缂撳瓨琛ㄤ腑鐨勫ぇ閲忔暟鎹?        $this->optimize_cache_table();
    }
    
    /**
     * 浼樺寲缂撳瓨琛?     */
    private function optimize_cache_table() {
        global $wpdb;
        
        // 妫€鏌ョ紦瀛樿〃澶у皬
        $sql = "SELECT table_name, data_length + index_length as size FROM information_schema.TABLES WHERE table_schema = DATABASE() AND table_name = '{$wpdb->prefix}sut_wechat_mini_cache'";
        $table_info = $wpdb->get_row( $sql, ARRAY_A );
        
        if ( $table_info && $table_info['size'] > 1024 * 1024 * 10 ) { // 濡傛灉琛ㄥぇ灏忚秴杩?0MB
            // 娓呯悊鎵€鏈夌紦瀛?            $this->clear_all_cache();
        }
        
        // 浼樺寲琛?        $sql = "OPTIMIZE TABLE {$wpdb->prefix}sut_wechat_mini_cache";
        $wpdb->query( $sql );
    }
    
    /**
     * 鑾峰彇缂撳瓨缁熻淇℃伅
     *
     * @return array 缂撳瓨缁熻淇℃伅
     */
    public function get_cache_stats() {
        global $wpdb;
        
        // 鑾峰彇缂撳瓨鎬绘暟
        $total_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache";
        $total = $wpdb->get_var( $total_sql );
        
        // 鑾峰彇杩囨湡缂撳瓨鏁?        $expired_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE expire_time > 0 AND expire_time < %d", time() );
        $expired = $wpdb->get_var( $expired_sql );
        
        // 鑾峰彇涓嶅悓绫诲瀷鐨勭紦瀛樻暟
        $types = array();
        $type_sql = "SELECT SUBSTRING_INDEX(cache_key, '_', 3) as cache_type, COUNT(*) as count FROM {$wpdb->prefix}sut_wechat_mini_cache GROUP BY cache_type";
        $type_results = $wpdb->get_results( $type_sql, ARRAY_A );
        
        foreach ( $type_results as $result ) {
            $types[$result['cache_type']] = $result['count'];
        }
        
        return array(
            'total' => $total,
            'expired' => $expired,
            'types' => $types
        );
    }
    
    /**
     * 缂撳瓨鍥炶皟鍑芥暟
     *
     * @param string $key 缂撳瓨閿?     * @param callable $callback 鍥炶皟鍑芥暟
     * @param array $args 鍙傛暟鏁扮粍
     * @param int $ttl 缂撳瓨鏃堕棿
     * @return mixed 缂撳瓨鏁版嵁
     */
    public function cache_callback( $key, $callback, $args = array(), $ttl = null ) {
        // 灏濊瘯鑾峰彇缂撳瓨
        $data = $this->get( $key, $args );
        
        // 濡傛灉缂撳瓨鍛戒腑锛岃繑鍥炵紦瀛樻暟鎹?        if ( $data !== false ) {
            return $data;
        }
        
        // 璋冪敤鍥炶皟鍑芥暟鑾峰彇鏁版嵁
        $data = call_user_func( $callback );
        
        // 濡傛灉鑾峰彇鍒版暟鎹紝璁剧疆缂撳瓨
        if ( $data !== false && $data !== null ) {
            $this->set( $key, $data, $args, $ttl );
        }
        
        return $data;
    }
}\n