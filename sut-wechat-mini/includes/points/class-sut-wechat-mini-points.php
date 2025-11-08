<?php
/**
 * SUT寰俊灏忕▼搴忕Н鍒嗙郴缁熺被
 *
 * 璐熻矗寰俊灏忕▼搴忕殑浼氬憳绉垎绠＄悊銆佺Н鍒嗚鍒欒缃€佺Н鍒嗗厬鎹㈢瓑鍔熻兘
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Points 绫? */
class SUT_WeChat_Mini_Points {
    
    /**
     * 鍗曚緥瀹炰緥
     *
     * @var SUT_WeChat_Mini_Points
     */
    private static $instance = null;
    
    /**
     * 鏋勯€犲嚱鏁?     */
    private function __construct() {
        // 娉ㄥ唽閽╁瓙
        $this->register_hooks();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
     *
     * @return SUT_WeChat_Mini_Points
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
        // 璁㈠崟瀹屾垚鏃跺鍔犵Н鍒?        add_action( 'woocommerce_order_status_completed', array( $this, 'on_order_completed' ), 10, 1 );
        
        // 鐢ㄦ埛绛惧埌鏃跺鍔犵Н鍒?        add_action( 'sut_wechat_mini_user_checked_in', array( $this, 'on_user_checked_in' ), 10, 1 );
        
        // 鐢ㄦ埛璇勮鏃跺鍔犵Н鍒?        add_action( 'comment_post', array( $this, 'on_comment_post' ), 10, 3 );
        
        // 鐢ㄦ埛鍒嗕韩鏃跺鍔犵Н鍒?        add_action( 'sut_wechat_mini_user_shared', array( $this, 'on_user_shared' ), 10, 2 );
        
        // 姣忔棩棣栨鐧诲綍鏃跺鍔犵Н鍒?        add_action( 'sut_wechat_mini_user_logged_in', array( $this, 'on_user_logged_in' ), 10, 1 );
        
        // 娉ㄥ唽绉垎瑙勫垯璁剧疆
        add_filter( 'sut_wechat_mini_admin_settings', array( $this, 'add_points_settings' ), 10, 1 );
        
        // 绉垎鍏戞崲鍟嗗搧娣诲姞鍒拌鍗曢」鐩?        add_action( 'woocommerce_add_order_item_meta', array( $this, 'add_order_item_points_meta' ), 10, 3 );
        
        // 璁㈠崟鏀粯鎴愬姛鍚庢墸闄ょН鍒?        add_action( 'woocommerce_payment_complete', array( $this, 'on_payment_complete' ), 10, 1 );
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛绉垎
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @return int 鐢ㄦ埛绉垎
     */
    public function get_user_points( $user_id ) {
        global $wpdb;
        
        $sql = "SELECT points FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d";
        $points = $wpdb->get_var( $wpdb->prepare( $sql, $user_id ) );
        
        return $points ? intval( $points ) : 0;
    }
    
    /**
     * 澧炲姞鐢ㄦ埛绉垎
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $points 绉垎鏁伴噺
     * @param string $source 绉垎鏉ユ簮
     * @param array $meta 鍏冩暟鎹?     * @return bool 鎿嶄綔缁撴灉
     */
    public function add_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        global $wpdb;
        
        // 妫€鏌ョ敤鎴锋槸鍚﹀瓨鍦?        $user = get_user_by( 'id', $user_id );
        
        if ( ! $user ) {
            return false;
        }
        
        // 寮€濮嬩簨鍔?        $wpdb->query( 'START TRANSACTION' );
        
        // 鏇存柊鐢ㄦ埛绉垎
        $result = $wpdb->query( $wpdb->prepare( 
            "UPDATE {$wpdb->prefix}sut_wechat_mini_users SET points = points + %d WHERE user_id = %d", 
            $points, 
            $user_id 
        ) );
        
        if ( $result === false ) {
            $wpdb->query( 'ROLLBACK' );
            return false;
        }
        
        // 璁板綍绉垎鍙樺姩鏃ュ織
        $log_id = 'point_' . date( 'YmdHis' ) . '_' . wp_generate_password( 8, false );
        
        $log_result = $wpdb->insert(
            $wpdb->prefix . 'sut_wechat_mini_points_log',
            array(
                'log_id' => $log_id,
                'user_id' => $user_id,
                'points' => $points,
                'source' => $source,
                'meta' => json_encode( $meta ),
                'create_time' => current_time( 'mysql' )
            ),
            array( '%s', '%d', '%d', '%s', '%s', '%s' )
        );
        
        if ( $log_result === false ) {
            $wpdb->query( 'ROLLBACK' );
            return false;
        }
        
        // 鎻愪氦浜嬪姟
        $wpdb->query( 'COMMIT' );
        
        // 瑙﹀彂绉垎澧炲姞閽╁瓙
        do_action( 'sut_wechat_mini_user_points_added', $user_id, $points, $source );
        
        return true;
    }
    
    /**
     * 鍑忓皯鐢ㄦ埛绉垎
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $points 绉垎鏁伴噺
     * @param string $source 绉垎鏉ユ簮
     * @param array $meta 鍏冩暟鎹?     * @return bool 鎿嶄綔缁撴灉
     */
    public function reduce_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        // 妫€鏌ョН鍒嗘槸鍚﹁冻澶?        $current_points = $this->get_user_points( $user_id );
        
        if ( $current_points < $points ) {
            return false;
        }
        
        // 璋冪敤澧炲姞鐢ㄦ埛绉垎鍑芥暟锛屼絾浣跨敤璐熸暟
        return $this->add_user_points( $user_id, -$points, $source, $meta );
    }
    
    /**
     * 璁剧疆鐢ㄦ埛绉垎
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $points 绉垎鏁伴噺
     * @param string $source 绉垎鏉ユ簮
     * @param array $meta 鍏冩暟鎹?     * @return bool 鎿嶄綔缁撴灉
     */
    public function set_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        global $wpdb;
        
        // 妫€鏌ョ敤鎴锋槸鍚﹀瓨鍦?        $user = get_user_by( 'id', $user_id );
        
        if ( ! $user ) {
            return false;
        }
        
        // 鑾峰彇褰撳墠绉垎
        $current_points = $this->get_user_points( $user_id );
        
        // 璁＄畻绉垎鍙樺姩閲?        $points_change = $points - $current_points;
        
        if ( $points_change == 0 ) {
            return true;
        }
        
        if ( $points_change > 0 ) {
            // 澧炲姞绉垎
            return $this->add_user_points( $user_id, $points_change, $source, $meta );
        } else {
            // 鍑忓皯绉垎
            return $this->reduce_user_points( $user_id, abs( $points_change ), $source, $meta );
        }
    }
    
    /**
     * 鑾峰彇绉垎鍙樺姩鏃ュ織
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param array $args 鏌ヨ鍙傛暟
     * @return array 绉垎鏃ュ織鍒楄〃
     */
    public function get_points_logs( $user_id, $args = array() ) {
        global $wpdb;
        
        $defaults = array(
            'source' => '',
            'start_date' => '',
            'end_date' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'create_time',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args( $args, $defaults );
        
        // 鏋勫缓鏌ヨ鏉′欢
        $where = "WHERE user_id = %d";
        $query_args = array( $user_id );
        
        if ( ! empty( $args['source'] ) ) {
            $where .= " AND source = %s";
            $query_args[] = $args['source'];
        }
        
        if ( ! empty( $args['start_date'] ) ) {
            $where .= " AND create_time >= %s";
            $query_args[] = $args['start_date'];
        }
        
        if ( ! empty( $args['end_date'] ) ) {
            $where .= " AND create_time <= %s";
            $query_args[] = $args['end_date'];
        }
        
        // 鏋勫缓鎺掑簭
        $orderby = esc_sql( $args['orderby'] );
        $order = esc_sql( $args['order'] );
        
        // 鏋勫缓闄愬埗
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );
        
        // 鎵ц鏌ヨ
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_points_log {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_args = array_merge( $query_args, array( $limit, $offset ) );
        
        $logs = $wpdb->get_results( $wpdb->prepare( $sql, $query_args ), ARRAY_A );
        
        // 鏍煎紡鍖栧厓鏁版嵁
        foreach ( $logs as &$log ) {
            if ( ! empty( $log['meta'] ) ) {
                $log['meta'] = json_decode( $log['meta'], true );
            }
        }
        
        // 鑾峰彇鎬绘暟
        $total_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_points_log {$where}";
        $total = $wpdb->get_var( $wpdb->prepare( $total_sql, array_slice( $query_args, 0, -2 ) ) );
        
        return array(
            'logs' => $logs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        );
    }
    
    /**
     * 绉垎鍏戞崲鍟嗗搧
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $product_id 鍟嗗搧ID
     * @param int $quantity 鏁伴噺
     * @return array 鍏戞崲缁撴灉
     */
    public function exchange_points_for_product( $user_id, $product_id, $quantity = 1 ) {
        // 鑾峰彇鍟嗗搧
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_purchasable() ) {
            return array(
                'success' => false,
                'error' => __( '鍟嗗搧涓嶅瓨鍦ㄦ垨涓嶅彲璐拱', 'sut-wechat-mini' )
            );
        }
        
        // 鑾峰彇鍟嗗搧鎵€闇€绉垎
        $points_required = get_post_meta( $product_id, '_points_required', true );
        
        if ( ! $points_required || $points_required <= 0 ) {
            return array(
                'success' => false,
                'error' => __( '璇ュ晢鍝佷笉鑳界敤绉垎鍏戞崲', 'sut-wechat-mini' )
            );
        }
        
        // 璁＄畻鎬荤Н鍒嗛渶姹?        $total_points_required = $points_required * $quantity;
        
        // 妫€鏌ョ敤鎴风Н鍒嗘槸鍚﹁冻澶?        $current_points = $this->get_user_points( $user_id );
        
        if ( $current_points < $total_points_required ) {
            return array(
                'success' => false,
                'error' => __( '绉垎涓嶈冻', 'sut-wechat-mini' ),
                'current_points' => $current_points,
                'required_points' => $total_points_required
            );
        }
        
        // 鍒涘缓绉垎璁㈠崟
        $order = wc_create_order( array(
            'customer_id' => $user_id,
            'status' => 'pending'
        ) );
        
        if ( ! $order ) {
            return array(
                'success' => false,
                'error' => __( '鍒涘缓璁㈠崟澶辫触', 'sut-wechat-mini' )
            );
        }
        
        // 娣诲姞鍟嗗搧鍒拌鍗?        $order->add_product( $product, $quantity );
        
        // 璁剧疆璁㈠崟涓虹Н鍒嗗厬鎹?        $order->update_meta_data( '_payment_method', 'points' );
        $order->update_meta_data( '_payment_method_title', __( '绉垎鍏戞崲', 'sut-wechat-mini' ) );
        $order->update_meta_data( '_points_exchange', true );
        $order->update_meta_data( '_points_used', $total_points_required );
        
        // 璁＄畻璁㈠崟鎬讳环锛堜负0锛?        $order->set_total( 0 );
        $order->save();
        
        // 澶勭悊璁㈠崟
        $order->payment_complete();
        
        return array(
            'success' => true,
            'order_id' => $order->get_id(),
            'points_used' => $total_points_required
        );
    }
    
    /**
     * 鑾峰彇绉垎鍏戞崲鍟嗗搧鍒楄〃
     *
     * @param array $args 鏌ヨ鍙傛暟
     * @return array 鍟嗗搧鍒楄〃
     */
    public function get_points_products( $args = array() ) {
        $defaults = array(
            'category' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'meta_value_num',
            'order' => 'ASC'
        );
        
        $args = wp_parse_args( $args, $defaults );
        
        $query_args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $args['limit'],
            'offset' => $args['offset'],
            'meta_key' => '_points_required',
            'meta_query' => array(
                array(
                    'key' => '_points_required',
                    'value' => 0,
                    'compare' => '>',
                    'type' => 'NUMERIC'
                )
            ),
            'orderby' => $args['orderby'],
            'order' => $args['order']
        );
        
        if ( ! empty( $args['category'] ) ) {
            $query_args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $args['category']
                )
            );
        }
        
        $query = new WP_Query( $query_args );
        
        $products = array();
        
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            $products[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'excerpt' => $post->post_excerpt,
                'thumbnail' => get_the_post_thumbnail_url( $post->ID, 'medium' ),
                'points_required' => get_post_meta( $post->ID, '_points_required', true ),
                'price' => $product->get_price(),
                'stock_quantity' => $product->get_stock_quantity(),
                'stock_status' => $product->get_stock_status()
            );
        }
        
        return array(
            'products' => $products,
            'total' => $query->found_posts,
            'limit' => $args['limit'],
            'offset' => $args['offset']
        );
    }
    
    /**
     * 鑾峰彇绉垎瑙勫垯璁剧疆
     *
     * @return array 绉垎瑙勫垯璁剧疆
     */
    public function get_points_rules() {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        $default_rules = array(
            'enabled' => 1,
            'order_points_rate' => 1,
            'checkin_points' => 5,
            'comment_points' => 2,
            'share_points' => 3,
            'daily_login_points' => 1,
            'max_points_per_day' => 50,
            'points_expire_days' => 365
        );
        
        // 鍚堝苟榛樿瑙勫垯鍜岃缃鍒?        $rules = array_merge( $default_rules, isset( $settings['points_rules'] ) ? $settings['points_rules'] : array() );
        
        return $rules;
    }
    
    /**
     * 妫€鏌ョ敤鎴蜂粖鏃ョН鍒嗘槸鍚﹀凡杈句笂闄?     *
     * @param int $user_id 鐢ㄦ埛ID
     * @return bool 鏄惁宸茶揪涓婇檺
     */
    public function is_user_points_reached_daily_limit( $user_id ) {
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨鏈缃瘡鏃ヤ笂闄愶紝杩斿洖false
        if ( ! $rules['enabled'] || $rules['max_points_per_day'] <= 0 ) {
            return false;
        }
        
        global $wpdb;
        
        // 鑾峰彇浠婃棩绉垎鑾峰彇鎬婚噺
        $today = date( 'Y-m-d' );
        $tomorrow = date( 'Y-m-d', strtotime( '+1 day' ) );
        
        $sql = "SELECT SUM(points) FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE user_id = %d AND points > 0 AND create_time >= %s AND create_time < %s";
        $today_points = $wpdb->get_var( $wpdb->prepare( $sql, $user_id, $today, $tomorrow ) );
        
        $today_points = $today_points ? intval( $today_points ) : 0;
        
        return $today_points >= $rules['max_points_per_day'];
    }
    
    /**
     * 澶勭悊璁㈠崟瀹屾垚浜嬩欢锛屽鍔犵Н鍒?     *
     * @param int $order_id 璁㈠崟ID
     */
    public function on_order_completed( $order_id ) {
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚︽槸绉垎鍏戞崲璁㈠崟
        $is_points_exchange = $order->get_meta( '_points_exchange', true );
        
        if ( $is_points_exchange ) {
            return;
        }
        
        // 鑾峰彇鐢ㄦ埛ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 鑾峰彇绉垎瑙勫垯
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨璁㈠崟绉垎姣斾緥涓?锛岀洿鎺ヨ繑鍥?        if ( ! $rules['enabled'] || $rules['order_points_rate'] <= 0 ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚﹀凡缁忎负璇ヨ鍗曟坊鍔犵Н鍒?        $points_added = $order->get_meta( '_points_added', true );
        
        if ( $points_added ) {
            return;
        }
        
        // 璁＄畻璁㈠崟搴斿緱绉垎
        $order_total = $order->get_total();
        $points = round( $order_total * $rules['order_points_rate'] );
        
        if ( $points <= 0 ) {
            return;
        }
        
        // 澧炲姞鐢ㄦ埛绉垎
        $result = $this->add_user_points( 
            $user_id, 
            $points, 
            'order', 
            array( 'order_id' => $order_id, 'order_total' => $order_total ) 
        );
        
        if ( $result ) {
            // 鏍囪璁㈠崟宸叉坊鍔犵Н鍒?            $order->update_meta_data( '_points_added', true );
            $order->update_meta_data( '_points_added_amount', $points );
            $order->save();
        }
    }
    
    /**
     * 澶勭悊鐢ㄦ埛绛惧埌浜嬩欢锛屽鍔犵Н鍒?     *
     * @param int $user_id 鐢ㄦ埛ID
     */
    public function on_user_checked_in( $user_id ) {
        // 鑾峰彇绉垎瑙勫垯
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨绛惧埌绉垎鏈缃紝鐩存帴杩斿洖
        if ( ! $rules['enabled'] || $rules['checkin_points'] <= 0 ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚﹀凡杈惧埌姣忔棩涓婇檺
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 澧炲姞鐢ㄦ埛绉垎
        $this->add_user_points( $user_id, $rules['checkin_points'], 'checkin' );
    }
    
    /**
     * 澶勭悊鐢ㄦ埛璇勮浜嬩欢锛屽鍔犵Н鍒?     *
     * @param int $comment_id 璇勮ID
     * @param int $comment_approved 璇勮鏄惁琚壒鍑?     * @param array $commentdata 璇勮鏁版嵁
     */
    public function on_comment_post( $comment_id, $comment_approved, $commentdata ) {
        // 濡傛灉璇勮鏈鎵瑰噯锛屼笉澧炲姞绉垎
        if ( $comment_approved != 1 ) {
            return;
        }
        
        // 鑾峰彇璇勮
        $comment = get_comment( $comment_id );
        
        if ( ! $comment ) {
            return;
        }
        
        // 鑾峰彇鐢ㄦ埛ID
        $user_id = $comment->user_id;
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 鑾峰彇绉垎瑙勫垯
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨璇勮绉垎鏈缃紝鐩存帴杩斿洖
        if ( ! $rules['enabled'] || $rules['comment_points'] <= 0 ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚﹀凡杈惧埌姣忔棩涓婇檺
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 澧炲姞鐢ㄦ埛绉垎
        $this->add_user_points( 
            $user_id, 
            $rules['comment_points'], 
            'comment', 
            array( 'comment_id' => $comment_id, 'post_id' => $comment->comment_post_ID ) 
        );
    }
    
    /**
     * 澶勭悊鐢ㄦ埛鍒嗕韩浜嬩欢锛屽鍔犵Н鍒?     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param array $meta 鍏冩暟鎹?     */
    public function on_user_shared( $user_id, $meta = array() ) {
        // 鑾峰彇绉垎瑙勫垯
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨鍒嗕韩绉垎鏈缃紝鐩存帴杩斿洖
        if ( ! $rules['enabled'] || $rules['share_points'] <= 0 ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚﹀凡杈惧埌姣忔棩涓婇檺
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 澧炲姞鐢ㄦ埛绉垎
        $this->add_user_points( $user_id, $rules['share_points'], 'share', $meta );
    }
    
    /**
     * 澶勭悊鐢ㄦ埛鐧诲綍浜嬩欢锛屽鍔犵Н鍒?     *
     * @param int $user_id 鐢ㄦ埛ID
     */
    public function on_user_logged_in( $user_id ) {
        // 鑾峰彇绉垎瑙勫垯
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨鐧诲綍绉垎鏈缃紝鐩存帴杩斿洖
        if ( ! $rules['enabled'] || $rules['daily_login_points'] <= 0 ) {
            return;
        }
        
        global $wpdb;
        
        // 妫€鏌ヤ粖鏃ユ槸鍚﹀凡缁忚幏鍙栫櫥褰曠Н鍒?        $today = date( 'Y-m-d' );
        $tomorrow = date( 'Y-m-d', strtotime( '+1 day' ) );
        
        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE user_id = %d AND source = 'login' AND create_time >= %s AND create_time < %s";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $user_id, $today, $tomorrow ) );
        
        if ( $count > 0 ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚﹀凡杈惧埌姣忔棩涓婇檺
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 澧炲姞鐢ㄦ埛绉垎
        $this->add_user_points( $user_id, $rules['daily_login_points'], 'login' );
    }
    
    /**
     * 娣诲姞绉垎璁剧疆椤?     *
     * @param array $settings 鍘熸湁璁剧疆
     * @return array 鏇存柊鍚庣殑璁剧疆
     */
    public function add_points_settings( $settings ) {
        $points_rules = $this->get_points_rules();
        
        $settings['points'] = array(
            'title' => __( '绉垎璁剧疆', 'sut-wechat-mini' ),
            'sections' => array(
                array(
                    'title' => __( '鍩虹璁剧疆', 'sut-wechat-mini' ),
                    'fields' => array(
                        array(
                            'name' => 'points_rules[enabled]',
                            'label' => __( '鍚敤绉垎绯荤粺', 'sut-wechat-mini' ),
                            'type' => 'checkbox',
                            'value' => isset( $points_rules['enabled'] ) ? $points_rules['enabled'] : 1
                        ),
                        array(
                            'name' => 'points_rules[max_points_per_day]',
                            'label' => __( '姣忔棩鏈€澶хН鍒嗚幏鍙栭噺', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['max_points_per_day'] ) ? $points_rules['max_points_per_day'] : 50,
                            'description' => __( '璁剧疆涓?琛ㄧず涓嶉檺鍒?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[points_expire_days]',
                            'label' => __( '绉垎鏈夋晥鏈?澶?', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['points_expire_days'] ) ? $points_rules['points_expire_days'] : 365,
                            'description' => __( '璁剧疆涓?琛ㄧず姘镐笉杩囨湡', 'sut-wechat-mini' )
                        )
                    )
                ),
                array(
                    'title' => __( '绉垎鑾峰彇瑙勫垯', 'sut-wechat-mini' ),
                    'fields' => array(
                        array(
                            'name' => 'points_rules[order_points_rate]',
                            'label' => __( '璁㈠崟绉垎姣斾緥', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['order_points_rate'] ) ? $points_rules['order_points_rate'] : 1,
                            'description' => __( '姣忔秷璐?鍏冭幏寰楃殑绉垎鏁伴噺', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[checkin_points]',
                            'label' => __( '绛惧埌绉垎', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['checkin_points'] ) ? $points_rules['checkin_points'] : 5,
                            'description' => __( '姣忔棩绛惧埌鑾峰緱鐨勭Н鍒嗘暟閲?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[comment_points]',
                            'label' => __( '璇勮绉垎', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['comment_points'] ) ? $points_rules['comment_points'] : 2,
                            'description' => __( '鍙戣〃璇勮鑾峰緱鐨勭Н鍒嗘暟閲?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[share_points]',
                            'label' => __( '鍒嗕韩绉垎', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['share_points'] ) ? $points_rules['share_points'] : 3,
                            'description' => __( '鍒嗕韩鍐呭鑾峰緱鐨勭Н鍒嗘暟閲?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[daily_login_points]',
                            'label' => __( '姣忔棩鐧诲綍绉垎', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['daily_login_points'] ) ? $points_rules['daily_login_points'] : 1,
                            'description' => __( '姣忔棩棣栨鐧诲綍鑾峰緱鐨勭Н鍒嗘暟閲?, 'sut-wechat-mini' )
                        )
                    )
                )
            )
        );
        
        return $settings;
    }
    
    /**
     * 娣诲姞璁㈠崟椤圭洰鐨勭Н鍒嗗厓鏁版嵁
     *
     * @param int $item_id 璁㈠崟椤笽D
     * @param object $item 璁㈠崟椤瑰璞?     * @param int $order_id 璁㈠崟ID
     */
    public function add_order_item_points_meta( $item_id, $item, $order_id ) {
        $product_id = $item->get_product_id();
        $points_required = get_post_meta( $product_id, '_points_required', true );
        
        if ( $points_required && $points_required > 0 ) {
            wc_add_order_item_meta( $item_id, __( '鎵€闇€绉垎', 'sut-wechat-mini' ), $points_required );
        }
    }
    
    /**
     * 澶勭悊鏀粯瀹屾垚浜嬩欢锛屾墸闄ょН鍒?     *
     * @param int $order_id 璁㈠崟ID
     */
    public function on_payment_complete( $order_id ) {
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 妫€鏌ユ槸鍚︽槸绉垎鍏戞崲璁㈠崟
        $is_points_exchange = $order->get_meta( '_points_exchange', true );
        
        if ( ! $is_points_exchange ) {
            return;
        }
        
        // 鑾峰彇鐢ㄦ埛ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 鑾峰彇闇€瑕佹墸闄ょ殑绉垎
        $points_used = $order->get_meta( '_points_used', true );
        
        if ( ! $points_used || $points_used <= 0 ) {
            return;
        }
        
        // 鎵ｉ櫎鐢ㄦ埛绉垎
        $this->reduce_user_points( 
            $user_id, 
            $points_used, 
            'exchange', 
            array( 'order_id' => $order_id ) 
        );
    }
    
    /**
     * 娓呯悊杩囨湡绉垎
     */
    public function cleanup_expired_points() {
        global $wpdb;
        
        // 鑾峰彇绉垎瑙勫垯
        $rules = $this->get_points_rules();
        
        // 濡傛灉鏈惎鐢ㄧН鍒嗙郴缁熸垨绉垎姘镐笉杩囨湡锛岀洿鎺ヨ繑鍥?        if ( ! $rules['enabled'] || $rules['points_expire_days'] <= 0 ) {
            return;
        }
        
        // 璁＄畻杩囨湡鏃ユ湡
        $expire_date = date( 'Y-m-d', strtotime( '-' . $rules['points_expire_days'] . ' days' ) );
        
        // 鑾峰彇鎵€鏈夌敤鎴风Н鍒嗘棩蹇?        $sql = "SELECT user_id, SUM(points) as total_points FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE points > 0 AND create_time < %s GROUP BY user_id";
        $expired_points = $wpdb->get_results( $wpdb->prepare( $sql, $expire_date ), ARRAY_A );
        
        // 鎵ｉ櫎杩囨湡绉垎
        foreach ( $expired_points as $item ) {
            $this->reduce_user_points( 
                $item['user_id'], 
                $item['total_points'], 
                'expired', 
                array( 'expire_date' => $expire_date ) 
            );
        }
    }
}