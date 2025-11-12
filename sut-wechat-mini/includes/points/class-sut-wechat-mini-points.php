锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繒袧閸掑棛閮寸紒鐔鸿
 *
 * 鐠愮喕鐭楀顔讳繆鐏忓繒鈻兼惔蹇曟畱娴兼艾鎲崇粔顖氬瀻缁狅紕鎮婇妴浣盒濋崚鍡氼潐閸掓瑨顔曠純顔衡偓浣盒濋崚鍡楀幀閹广垻鐡戦崝鐔诲厴
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Points 缁? */
class SUT_WeChat_Mini_Points {
    
    /**
     * 閸楁洑绶ョ€圭偘绶?     *
     * @var SUT_WeChat_Mini_Points
     */
    private static $instance = null;
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    private function __construct() {
        // 濞夈劌鍞介柦鈺佺摍
        $this->register_hooks();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_Points
     */
    public static function get_instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 濞夈劌鍞介柦鈺佺摍
     */
    private function register_hooks() {
        // 鐠併垹宕熺€瑰本鍨氶弮璺侯杻閸旂姷袧閸?        add_action( 'woocommerce_order_status_completed', array( $this, 'on_order_completed' ), 10, 1 );
        
        // 閻劍鍩涚粵鎯у煂閺冭泛顤冮崝鐘敌濋崚?        add_action( 'sut_wechat_mini_user_checked_in', array( $this, 'on_user_checked_in' ), 10, 1 );
        
        // 閻劍鍩涚拠鍕啈閺冭泛顤冮崝鐘敌濋崚?        add_action( 'comment_post', array( $this, 'on_comment_post' ), 10, 3 );
        
        // 閻劍鍩涢崚鍡曢煩閺冭泛顤冮崝鐘敌濋崚?        add_action( 'sut_wechat_mini_user_shared', array( $this, 'on_user_shared' ), 10, 2 );
        
        // 濮ｅ繑妫╂＃鏍偧閻ц缍嶉弮璺侯杻閸旂姷袧閸?        add_action( 'sut_wechat_mini_user_logged_in', array( $this, 'on_user_logged_in' ), 10, 1 );
        
        // 濞夈劌鍞界粔顖氬瀻鐟欏嫬鍨拋鍓х枂
        add_filter( 'sut_wechat_mini_admin_settings', array( $this, 'add_points_settings' ), 10, 1 );
        
        // 缁夘垰鍨庨崗鎴炲床閸熷棗鎼уǎ璇插閸掓媽顓归崡鏇€嶉惄?        add_action( 'woocommerce_add_order_item_meta', array( $this, 'add_order_item_points_meta' ), 10, 3 );
        
        // 鐠併垹宕熼弨顖欑帛閹存劕濮涢崥搴㈠⒏闂勩倗袧閸?        add_action( 'woocommerce_payment_complete', array( $this, 'on_payment_complete' ), 10, 1 );
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕缁夘垰鍨?     *
     * @param int $user_id 閻劍鍩汭D
     * @return int 閻劍鍩涚粔顖氬瀻
     */
    public function get_user_points( $user_id ) {
        global $wpdb;
        
        $sql = "SELECT points FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d";
        $points = $wpdb->get_var( $wpdb->prepare( $sql, $user_id ) );
        
        return $points ? intval( $points ) : 0;
    }
    
    /**
     * 婢х偛濮為悽銊﹀煕缁夘垰鍨?     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $points 缁夘垰鍨庨弫浼村櫤
     * @param string $source 缁夘垰鍨庨弶銉︾爱
     * @param array $meta 閸忓啯鏆熼幑?     * @return bool 閹垮秳缍旂紒鎾寸亯
     */
    public function add_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        global $wpdb;
        
        // 濡偓閺屻儳鏁ら幋閿嬫Ц閸氾箑鐡ㄩ崷?        $user = get_user_by( 'id', $user_id );
        
        if ( ! $user ) {
            return false;
        }
        
        // 瀵偓婵绨ㄩ崝?        $wpdb->query( 'START TRANSACTION' );
        
        // 閺囧瓨鏌婇悽銊﹀煕缁夘垰鍨?        $result = $wpdb->query( $wpdb->prepare( 
            "UPDATE {$wpdb->prefix}sut_wechat_mini_users SET points = points + %d WHERE user_id = %d", 
            $points, 
            $user_id 
        ) );
        
        if ( $result === false ) {
            $wpdb->query( 'ROLLBACK' );
            return false;
        }
        
        // 鐠佹澘缍嶇粔顖氬瀻閸欐ê濮╅弮銉ョ箶
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
        
        // 閹绘劒姘︽禍瀣
        $wpdb->query( 'COMMIT' );
        
        // 鐟欙箑褰傜粔顖氬瀻婢х偛濮為柦鈺佺摍
        do_action( 'sut_wechat_mini_user_points_added', $user_id, $points, $source );
        
        return true;
    }
    
    /**
     * 閸戝繐鐨悽銊﹀煕缁夘垰鍨?     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $points 缁夘垰鍨庨弫浼村櫤
     * @param string $source 缁夘垰鍨庨弶銉︾爱
     * @param array $meta 閸忓啯鏆熼幑?     * @return bool 閹垮秳缍旂紒鎾寸亯
     */
    public function reduce_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        // 濡偓閺屻儳袧閸掑棙妲搁崥锕佸喕婢?        $current_points = $this->get_user_points( $user_id );
        
        if ( $current_points < $points ) {
            return false;
        }
        
        // 鐠嬪啰鏁ゆ晶鐐插閻劍鍩涚粔顖氬瀻閸戣姤鏆熼敍灞肩稻娴ｈ法鏁ょ拹鐔告殶
        return $this->add_user_points( $user_id, -$points, $source, $meta );
    }
    
    /**
     * 鐠佸墽鐤嗛悽銊﹀煕缁夘垰鍨?     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $points 缁夘垰鍨庨弫浼村櫤
     * @param string $source 缁夘垰鍨庨弶銉︾爱
     * @param array $meta 閸忓啯鏆熼幑?     * @return bool 閹垮秳缍旂紒鎾寸亯
     */
    public function set_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        global $wpdb;
        
        // 濡偓閺屻儳鏁ら幋閿嬫Ц閸氾箑鐡ㄩ崷?        $user = get_user_by( 'id', $user_id );
        
        if ( ! $user ) {
            return false;
        }
        
        // 閼惧嘲褰囪ぐ鎾冲缁夘垰鍨?        $current_points = $this->get_user_points( $user_id );
        
        // 鐠侊紕鐣荤粔顖氬瀻閸欐ê濮╅柌?        $points_change = $points - $current_points;
        
        if ( $points_change == 0 ) {
            return true;
        }
        
        if ( $points_change > 0 ) {
            // 婢х偛濮炵粔顖氬瀻
            return $this->add_user_points( $user_id, $points_change, $source, $meta );
        } else {
            // 閸戝繐鐨粔顖氬瀻
            return $this->reduce_user_points( $user_id, abs( $points_change ), $source, $meta );
        }
    }
    
    /**
     * 閼惧嘲褰囩粔顖氬瀻閸欐ê濮╅弮銉ョ箶
     *
     * @param int $user_id 閻劍鍩汭D
     * @param array $args 閺屻儴顕楅崣鍌涙殶
     * @return array 缁夘垰鍨庨弮銉ョ箶閸掓銆?     */
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
        
        // 閺嬪嫬缂撻弻銉嚄閺夆€叉
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
        
        // 閺嬪嫬缂撻幒鎺戠碍
        $orderby = esc_sql( $args['orderby'] );
        $order = esc_sql( $args['order'] );
        
        // 閺嬪嫬缂撻梽鎰煑
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );
        
        // 閹笛嗩攽閺屻儴顕?        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_points_log {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_args = array_merge( $query_args, array( $limit, $offset ) );
        
        $logs = $wpdb->get_results( $wpdb->prepare( $sql, $query_args ), ARRAY_A );
        
        // 閺嶇厧绱￠崠鏍у帗閺佺増宓?        foreach ( $logs as &$log ) {
            if ( ! empty( $log['meta'] ) ) {
                $log['meta'] = json_decode( $log['meta'], true );
            }
        }
        
        // 閼惧嘲褰囬幀缁樻殶
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
     * 缁夘垰鍨庨崗鎴炲床閸熷棗鎼?     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $product_id 閸熷棗鎼D
     * @param int $quantity 閺佷即鍣?     * @return array 閸忔垶宕茬紒鎾寸亯
     */
    public function exchange_points_for_product( $user_id, $product_id, $quantity = 1 ) {
        // 閼惧嘲褰囬崯鍡楁惂
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_purchasable() ) {
            return array(
                'success' => false,
                'error' => __( '閸熷棗鎼ф稉宥呯摠閸︺劍鍨ㄦ稉宥呭讲鐠愵厺鎷?, 'sut-wechat-mini' )
            );
        }
        
        // 閼惧嘲褰囬崯鍡楁惂閹碘偓闂団偓缁夘垰鍨?        $points_required = get_post_meta( $product_id, '_points_required', true );
        
        if ( ! $points_required || $points_required <= 0 ) {
            return array(
                'success' => false,
                'error' => __( '鐠囥儱鏅㈤崫浣风瑝閼崇晫鏁ょ粔顖氬瀻閸忔垶宕?, 'sut-wechat-mini' )
            );
        }
        
        // 鐠侊紕鐣婚幀鑽ば濋崚鍡涙付濮?        $total_points_required = $points_required * $quantity;
        
        // 濡偓閺屻儳鏁ら幋椋幮濋崚鍡樻Ц閸氾箒鍐绘径?        $current_points = $this->get_user_points( $user_id );
        
        if ( $current_points < $total_points_required ) {
            return array(
                'success' => false,
                'error' => __( '缁夘垰鍨庢稉宥堝喕', 'sut-wechat-mini' ),
                'current_points' => $current_points,
                'required_points' => $total_points_required
            );
        }
        
        // 閸掓稑缂撶粔顖氬瀻鐠併垹宕?        $order = wc_create_order( array(
            'customer_id' => $user_id,
            'status' => 'pending'
        ) );
        
        if ( ! $order ) {
            return array(
                'success' => false,
                'error' => __( '閸掓稑缂撶拋銏犲礋婢惰精瑙?, 'sut-wechat-mini' )
            );
        }
        
        // 濞ｈ濮為崯鍡楁惂閸掓媽顓归崡?        $order->add_product( $product, $quantity );
        
        // 鐠佸墽鐤嗙拋銏犲礋娑撹櫣袧閸掑棗鍘幑?        $order->update_meta_data( '_payment_method', 'points' );
        $order->update_meta_data( '_payment_method_title', __( '缁夘垰鍨庨崗鎴炲床', 'sut-wechat-mini' ) );
        $order->update_meta_data( '_points_exchange', true );
        $order->update_meta_data( '_points_used', $total_points_required );
        
        // 鐠侊紕鐣荤拋銏犲礋閹鐜敍鍫滆礋0閿?        $order->set_total( 0 );
        $order->save();
        
        // 婢跺嫮鎮婄拋銏犲礋
        $order->payment_complete();
        
        return array(
            'success' => true,
            'order_id' => $order->get_id(),
            'points_used' => $total_points_required
        );
    }
    
    /**
     * 閼惧嘲褰囩粔顖氬瀻閸忔垶宕查崯鍡楁惂閸掓銆?     *
     * @param array $args 閺屻儴顕楅崣鍌涙殶
     * @return array 閸熷棗鎼ч崚妤勩€?     */
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
     * 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨拋鍓х枂
     *
     * @return array 缁夘垰鍨庣憴鍕灟鐠佸墽鐤?     */
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
        
        // 閸氬牆鑻熸妯款吇鐟欏嫬鍨崪宀冾啎缂冾喛顫夐崚?        $rules = array_merge( $default_rules, isset( $settings['points_rules'] ) ? $settings['points_rules'] : array() );
        
        return $rules;
    }
    
    /**
     * 濡偓閺屻儳鏁ら幋铚傜矕閺冦儳袧閸掑棙妲搁崥锕€鍑℃潏鍙ョ瑐闂?     *
     * @param int $user_id 閻劍鍩汭D
     * @return bool 閺勵垰鎯佸鑼舵彧娑撳﹪妾?     */
    public function is_user_points_reached_daily_limit( $user_id ) {
        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗閺堫亣顔曠純顔界槨閺冦儰绗傞梽鎰剁礉鏉╂柨娲杅alse
        if ( ! $rules['enabled'] || $rules['max_points_per_day'] <= 0 ) {
            return false;
        }
        
        global $wpdb;
        
        // 閼惧嘲褰囨禒濠冩）缁夘垰鍨庨懢宄板絿閹鍣?        $today = date( 'Y-m-d' );
        $tomorrow = date( 'Y-m-d', strtotime( '+1 day' ) );
        
        $sql = "SELECT SUM(points) FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE user_id = %d AND points > 0 AND create_time >= %s AND create_time < %s";
        $today_points = $wpdb->get_var( $wpdb->prepare( $sql, $user_id, $today, $tomorrow ) );
        
        $today_points = $today_points ? intval( $today_points ) : 0;
        
        return $today_points >= $rules['max_points_per_day'];
    }
    
    /**
     * 婢跺嫮鎮婄拋銏犲礋鐎瑰本鍨氭禍瀣╂閿涘苯顤冮崝鐘敌濋崚?     *
     * @param int $order_id 鐠併垹宕烮D
     */
    public function on_order_completed( $order_id ) {
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锔芥Ц缁夘垰鍨庨崗鎴炲床鐠併垹宕?        $is_points_exchange = $order->get_meta( '_points_exchange', true );
        
        if ( $is_points_exchange ) {
            return;
        }
        
        // 閼惧嘲褰囬悽銊﹀煕ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗鐠併垹宕熺粔顖氬瀻濮ｆ柧绶ユ稉?閿涘瞼娲块幒銉ㄧ箲閸?        if ( ! $rules['enabled'] || $rules['order_points_rate'] <= 0 ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锕€鍑＄紒蹇庤礋鐠囥儴顓归崡鏇熷潑閸旂姷袧閸?        $points_added = $order->get_meta( '_points_added', true );
        
        if ( $points_added ) {
            return;
        }
        
        // 鐠侊紕鐣荤拋銏犲礋鎼存柨绶辩粔顖氬瀻
        $order_total = $order->get_total();
        $points = round( $order_total * $rules['order_points_rate'] );
        
        if ( $points <= 0 ) {
            return;
        }
        
        // 婢х偛濮為悽銊﹀煕缁夘垰鍨?        $result = $this->add_user_points( 
            $user_id, 
            $points, 
            'order', 
            array( 'order_id' => $order_id, 'order_total' => $order_total ) 
        );
        
        if ( $result ) {
            // 閺嶅洩顔囩拋銏犲礋瀹稿弶鍧婇崝鐘敌濋崚?            $order->update_meta_data( '_points_added', true );
            $order->update_meta_data( '_points_added_amount', $points );
            $order->save();
        }
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕缁涙儳鍩屾禍瀣╂閿涘苯顤冮崝鐘敌濋崚?     *
     * @param int $user_id 閻劍鍩汭D
     */
    public function on_user_checked_in( $user_id ) {
        // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗缁涙儳鍩岀粔顖氬瀻閺堫亣顔曠純顕嗙礉閻╁瓨甯存潻鏂挎礀
        if ( ! $rules['enabled'] || $rules['checkin_points'] <= 0 ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锕€鍑℃潏鎯у煂濮ｅ繑妫╂稉濠囨
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 婢х偛濮為悽銊﹀煕缁夘垰鍨?        $this->add_user_points( $user_id, $rules['checkin_points'], 'checkin' );
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕鐠囧嫯顔戞禍瀣╂閿涘苯顤冮崝鐘敌濋崚?     *
     * @param int $comment_id 鐠囧嫯顔慖D
     * @param int $comment_approved 鐠囧嫯顔戦弰顖氭儊鐞氼偅澹掗崙?     * @param array $commentdata 鐠囧嫯顔戦弫鐗堝祦
     */
    public function on_comment_post( $comment_id, $comment_approved, $commentdata ) {
        // 婵″倹鐏夌拠鍕啈閺堫亣顫﹂幍鐟板櫙閿涘奔绗夋晶鐐插缁夘垰鍨?        if ( $comment_approved != 1 ) {
            return;
        }
        
        // 閼惧嘲褰囩拠鍕啈
        $comment = get_comment( $comment_id );
        
        if ( ! $comment ) {
            return;
        }
        
        // 閼惧嘲褰囬悽銊﹀煕ID
        $user_id = $comment->user_id;
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗鐠囧嫯顔戠粔顖氬瀻閺堫亣顔曠純顕嗙礉閻╁瓨甯存潻鏂挎礀
        if ( ! $rules['enabled'] || $rules['comment_points'] <= 0 ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锕€鍑℃潏鎯у煂濮ｅ繑妫╂稉濠囨
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 婢х偛濮為悽銊﹀煕缁夘垰鍨?        $this->add_user_points( 
            $user_id, 
            $rules['comment_points'], 
            'comment', 
            array( 'comment_id' => $comment_id, 'post_id' => $comment->comment_post_ID ) 
        );
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕閸掑棔闊╂禍瀣╂閿涘苯顤冮崝鐘敌濋崚?     *
     * @param int $user_id 閻劍鍩汭D
     * @param array $meta 閸忓啯鏆熼幑?     */
    public function on_user_shared( $user_id, $meta = array() ) {
        // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗閸掑棔闊╃粔顖氬瀻閺堫亣顔曠純顕嗙礉閻╁瓨甯存潻鏂挎礀
        if ( ! $rules['enabled'] || $rules['share_points'] <= 0 ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锕€鍑℃潏鎯у煂濮ｅ繑妫╂稉濠囨
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 婢х偛濮為悽銊﹀煕缁夘垰鍨?        $this->add_user_points( $user_id, $rules['share_points'], 'share', $meta );
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕閻ц缍嶆禍瀣╂閿涘苯顤冮崝鐘敌濋崚?     *
     * @param int $user_id 閻劍鍩汭D
     */
    public function on_user_logged_in( $user_id ) {
        // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗閻ц缍嶇粔顖氬瀻閺堫亣顔曠純顕嗙礉閻╁瓨甯存潻鏂挎礀
        if ( ! $rules['enabled'] || $rules['daily_login_points'] <= 0 ) {
            return;
        }
        
        global $wpdb;
        
        // 濡偓閺屻儰绮栭弮銉︽Ц閸氾箑鍑＄紒蹇氬箯閸欐牜娅ヨぐ鏇犘濋崚?        $today = date( 'Y-m-d' );
        $tomorrow = date( 'Y-m-d', strtotime( '+1 day' ) );
        
        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE user_id = %d AND source = 'login' AND create_time >= %s AND create_time < %s";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $user_id, $today, $tomorrow ) );
        
        if ( $count > 0 ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锕€鍑℃潏鎯у煂濮ｅ繑妫╂稉濠囨
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 婢х偛濮為悽銊﹀煕缁夘垰鍨?        $this->add_user_points( $user_id, $rules['daily_login_points'], 'login' );
    }
    
    /**
     * 濞ｈ濮炵粔顖氬瀻鐠佸墽鐤嗘い?     *
     * @param array $settings 閸樼喐婀佺拋鍓х枂
     * @return array 閺囧瓨鏌婇崥搴ｆ畱鐠佸墽鐤?     */
    public function add_points_settings( $settings ) {
        $points_rules = $this->get_points_rules();
        
        $settings['points'] = array(
            'title' => __( '缁夘垰鍨庣拋鍓х枂', 'sut-wechat-mini' ),
            'sections' => array(
                array(
                    'title' => __( '閸╄櫣顢呯拋鍓х枂', 'sut-wechat-mini' ),
                    'fields' => array(
                        array(
                            'name' => 'points_rules[enabled]',
                            'label' => __( '閸氼垳鏁ょ粔顖氬瀻缁崵绮?, 'sut-wechat-mini' ),
                            'type' => 'checkbox',
                            'value' => isset( $points_rules['enabled'] ) ? $points_rules['enabled'] : 1
                        ),
                        array(
                            'name' => 'points_rules[max_points_per_day]',
                            'label' => __( '濮ｅ繑妫╅張鈧径褏袧閸掑棜骞忛崣鏍櫤', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['max_points_per_day'] ) ? $points_rules['max_points_per_day'] : 50,
                            'description' => __( '鐠佸墽鐤嗘稉?鐞涖劎銇氭稉宥夋閸?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[points_expire_days]',
                            'label' => __( '缁夘垰鍨庨張澶嬫櫏閺?婢?', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['points_expire_days'] ) ? $points_rules['points_expire_days'] : 365,
                            'description' => __( '鐠佸墽鐤嗘稉?鐞涖劎銇氬闀愮瑝鏉╁洦婀?, 'sut-wechat-mini' )
                        )
                    )
                ),
                array(
                    'title' => __( '缁夘垰鍨庨懢宄板絿鐟欏嫬鍨?, 'sut-wechat-mini' ),
                    'fields' => array(
                        array(
                            'name' => 'points_rules[order_points_rate]',
                            'label' => __( '鐠併垹宕熺粔顖氬瀻濮ｆ柧绶?, 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['order_points_rate'] ) ? $points_rules['order_points_rate'] : 1,
                            'description' => __( '濮ｅ繑绉风拹?閸忓啳骞忓妤冩畱缁夘垰鍨庨弫浼村櫤', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[checkin_points]',
                            'label' => __( '缁涙儳鍩岀粔顖氬瀻', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['checkin_points'] ) ? $points_rules['checkin_points'] : 5,
                            'description' => __( '濮ｅ繑妫╃粵鎯у煂閼惧嘲绶遍惃鍕濋崚鍡樻殶闁?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[comment_points]',
                            'label' => __( '鐠囧嫯顔戠粔顖氬瀻', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['comment_points'] ) ? $points_rules['comment_points'] : 2,
                            'description' => __( '閸欐垼銆冪拠鍕啈閼惧嘲绶遍惃鍕濋崚鍡樻殶闁?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[share_points]',
                            'label' => __( '閸掑棔闊╃粔顖氬瀻', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['share_points'] ) ? $points_rules['share_points'] : 3,
                            'description' => __( '閸掑棔闊╅崘鍛啇閼惧嘲绶遍惃鍕濋崚鍡樻殶闁?, 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[daily_login_points]',
                            'label' => __( '濮ｅ繑妫╅惂璇茬秿缁夘垰鍨?, 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['daily_login_points'] ) ? $points_rules['daily_login_points'] : 1,
                            'description' => __( '濮ｅ繑妫╂＃鏍偧閻ц缍嶉懢宄扮繁閻ㄥ嫮袧閸掑棙鏆熼柌?, 'sut-wechat-mini' )
                        )
                    )
                )
            )
        );
        
        return $settings;
    }
    
    /**
     * 濞ｈ濮炵拋銏犲礋妞ゅ湱娲伴惃鍕濋崚鍡楀帗閺佺増宓?     *
     * @param int $item_id 鐠併垹宕熸い绗紻
     * @param object $item 鐠併垹宕熸い鐟邦嚠鐠?     * @param int $order_id 鐠併垹宕烮D
     */
    public function add_order_item_points_meta( $item_id, $item, $order_id ) {
        $product_id = $item->get_product_id();
        $points_required = get_post_meta( $product_id, '_points_required', true );
        
        if ( $points_required && $points_required > 0 ) {
            wc_add_order_item_meta( $item_id, __( '閹碘偓闂団偓缁夘垰鍨?, 'sut-wechat-mini' ), $points_required );
        }
    }
    
    /**
     * 婢跺嫮鎮婇弨顖欑帛鐎瑰本鍨氭禍瀣╂閿涘本澧搁梽銈囆濋崚?     *
     * @param int $order_id 鐠併垹宕烮D
     */
    public function on_payment_complete( $order_id ) {
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 濡偓閺屻儲妲搁崥锔芥Ц缁夘垰鍨庨崗鎴炲床鐠併垹宕?        $is_points_exchange = $order->get_meta( '_points_exchange', true );
        
        if ( ! $is_points_exchange ) {
            return;
        }
        
        // 閼惧嘲褰囬悽銊﹀煕ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 閼惧嘲褰囬棁鈧憰浣瑰⒏闂勩倗娈戠粔顖氬瀻
        $points_used = $order->get_meta( '_points_used', true );
        
        if ( ! $points_used || $points_used <= 0 ) {
            return;
        }
        
        // 閹碉綁娅庨悽銊﹀煕缁夘垰鍨?        $this->reduce_user_points( 
            $user_id, 
            $points_used, 
            'exchange', 
            array( 'order_id' => $order_id ) 
        );
    }
    
    /**
     * 濞撳懐鎮婃潻鍥ㄦ埂缁夘垰鍨?     */
    public function cleanup_expired_points() {
        global $wpdb;
        
        // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?        $rules = $this->get_points_rules();
        
        // 婵″倹鐏夐張顏勬儙閻劎袧閸掑棛閮寸紒鐔稿灗缁夘垰鍨庡闀愮瑝鏉╁洦婀￠敍宀€娲块幒銉ㄧ箲閸?        if ( ! $rules['enabled'] || $rules['points_expire_days'] <= 0 ) {
            return;
        }
        
        // 鐠侊紕鐣绘潻鍥ㄦ埂閺冦儲婀?        $expire_date = date( 'Y-m-d', strtotime( '-' . $rules['points_expire_days'] . ' days' ) );
        
        // 閼惧嘲褰囬幍鈧張澶屾暏閹撮袧閸掑棙妫╄箛?        $sql = "SELECT user_id, SUM(points) as total_points FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE points > 0 AND create_time < %s GROUP BY user_id";
        $expired_points = $wpdb->get_results( $wpdb->prepare( $sql, $expire_date ), ARRAY_A );
        
        // 閹碉綁娅庢潻鍥ㄦ埂缁夘垰鍨?        foreach ( $expired_points as $item ) {
            $this->reduce_user_points( 
                $item['user_id'], 
                $item['total_points'], 
                'expired', 
                array( 'expire_date' => $expire_date ) 
            );
        }
    }
}\n