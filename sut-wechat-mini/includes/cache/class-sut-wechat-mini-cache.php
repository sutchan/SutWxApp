锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繒绱︾€涙顓搁悶鍡欒
 *
 * 鐠愮喕鐭楀顔讳繆鐏忓繒鈻兼惔蹇曟畱缂傛挸鐡ㄧ粻锛勬倞閵嗕胶绱︾€涙ɑ绔婚悶鍡愨偓浣虹处鐎涙﹢顣╅悜顓犵搼閸旂喕鍏? *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Cache 缁? */
class SUT_WeChat_Mini_Cache {
    
    /**
     * 閸楁洑绶ョ€圭偘绶?     *
     * @var SUT_WeChat_Mini_Cache
     */
    private static $instance = null;
    
    /**
     * 姒涙顓荤紓鎾崇摠閺冨爼妫块敍鍫㈩潡閿?     *
     * @var int
     */
    private $default_ttl = 3600;
    
    /**
     * 缂傛挸鐡ㄩ崜宥囩磻
     *
     * @var string
     */
    private $cache_prefix = 'sut_wechat_mini_';
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    private function __construct() {
        // 濞夈劌鍞介柦鈺佺摍
        $this->register_hooks();
        
        // 鐠佸墽鐤嗙紓鎾崇摠閺冨爼妫?        $this->set_default_ttl();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_Cache
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
        // 濞撳懐鎮婄紓鎾崇摠
        add_action( 'sut_wechat_mini_clear_cache', array( $this, 'clear_all_cache' ) );
        
        // 閺傚洨鐝烽弴瀛樻煀閺冭埖绔婚悶鍡欐祲閸忓磭绱︾€?        add_action( 'save_post', array( $this, 'on_post_updated' ), 10, 3 );
        
        // 閺傚洨鐝烽崚鐘绘珟閺冭埖绔婚悶鍡欐祲閸忓磭绱︾€?        add_action( 'delete_post', array( $this, 'on_post_deleted' ), 10, 1 );
        
        // 娴溠冩惂閺囧瓨鏌婇弮鑸电閻炲棛娴夐崗宕囩处鐎?        add_action( 'woocommerce_update_product', array( $this, 'on_product_updated' ), 10, 1 );
        
        // 娴溠冩惂閸掔娀娅庨弮鑸电閻炲棛娴夐崗宕囩处鐎?        add_action( 'before_delete_post', array( $this, 'on_product_deleted' ), 10, 1 );
        
        // 鐠併垹宕熼悩鑸碘偓浣稿綁閺囧瓨妞傚〒鍛倞閻╃鍙х紓鎾崇摠
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 3 );
        
        // 閻劍鍩涢弴瀛樻煀閺冭埖绔婚悶鍡欐祲閸忓磭绱︾€?        add_action( 'profile_update', array( $this, 'on_user_updated' ), 10, 2 );
        
        // 濮ｅ繑妫╃€规碍妞傚〒鍛倞鏉╁洦婀＄紓鎾崇摠
        if ( ! wp_next_scheduled( 'sut_wechat_mini_daily_cleanup' ) ) {
            wp_schedule_event( time(), 'daily', 'sut_wechat_mini_daily_cleanup' );
        }
        
        add_action( 'sut_wechat_mini_daily_cleanup', array( $this, 'daily_cleanup' ) );
    }
    
    /**
     * 鐠佸墽鐤嗘妯款吇缂傛挸鐡ㄩ弮鍫曟？
     */
    private function set_default_ttl() {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings['cache_ttl'] ) && $settings['cache_ttl'] > 0 ) {
            $this->default_ttl = intval( $settings['cache_ttl'] );
        }
    }
    
    /**
     * 閻㈢喐鍨氱紓鎾崇摠闁?     *
     * @param string $key 閸樼喎顫愰柨顔兼倳
     * @param array $args 閸欏倹鏆熼弫鎵矋
     * @return string 鐎瑰本鏆ｉ惃鍕处鐎涙﹢鏁?     */
    private function get_cache_key( $key, $args = array() ) {
        // 婵″倹鐏夐崣鍌涙殶娑撳秳璐熺粚鐚寸礉鐏忓棗寮弫鏉跨碍閸掓瀵查獮鑸靛潑閸旂姴鍩岄柨顔昏厬
        if ( ! empty( $args ) ) {
            $key .= '_' . md5( serialize( $args ) );
        }
        
        // 濞ｈ濮炵紓鎾崇摠閸撳秶绱?        return $this->cache_prefix . $key;
    }
    
    /**
     * 閼惧嘲褰囩紓鎾崇摠
     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @param array $args 閸欏倹鏆熼弫鎵矋
     * @return mixed 缂傛挸鐡ㄩ弫鐗堝祦閹存潊alse
     */
    public function get( $key, $args = array() ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 鐏忔繆鐦禒宥筼rdPress缂傛挸鐡ㄩ懢宄板絿
        $data = wp_cache_get( $cache_key );
        
        if ( $data !== false ) {
            return $data;
        }
        
        // 婵″倹鐏塛ordPress缂傛挸鐡ㄩ張顏勬嚒娑擃叏绱濈亸婵婄槸娴犲氦鍤滅€规矮绠熺悰銊ㄥ箯閸?        global $wpdb;
        
        $sql = "SELECT data, expire_time FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key = %s";
        $result = $wpdb->get_row( $wpdb->prepare( $sql, $cache_key ), ARRAY_A );
        
        if ( ! $result ) {
            return false;
        }
        
        // 濡偓閺屻儳绱︾€涙ɑ妲搁崥锕佺箖閺?        $current_time = time();
        
        if ( $result['expire_time'] > 0 && $current_time > $result['expire_time'] ) {
            // 閸掔娀娅庢潻鍥ㄦ埂缂傛挸鐡?            $this->delete_cache_from_db( $cache_key );
            return false;
        }
        
        // 閸欏秴绨崚妤€瀵茬紓鎾崇摠閺佺増宓?        $data = maybe_unserialize( $result['data'] );
        
        // 鐎涙ê鍋嶉崚鐧rdPress缂傛挸鐡ㄦ稉?        wp_cache_set( $cache_key, $data, '', $result['expire_time'] > 0 ? $result['expire_time'] - $current_time : 0 );
        
        return $data;
    }
    
    /**
     * 鐠佸墽鐤嗙紓鎾崇摠
     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @param mixed $data 缂傛挸鐡ㄩ弫鐗堝祦
     * @param array $args 閸欏倹鏆熼弫鎵矋
     * @param int $ttl 缂傛挸鐡ㄩ弮鍫曟？閿涘牏顫楅敍?     * @return bool 閹垮秳缍旂紒鎾寸亯
     */
    public function set( $key, $data, $args = array(), $ttl = null ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 娴ｈ法鏁ゆ妯款吇缂傛挸鐡ㄩ弮鍫曟？閿涘牆顩ч弸婊勬弓閹稿洤鐣鹃敍?        if ( is_null( $ttl ) ) {
            $ttl = $this->default_ttl;
        }
        
        // 鐠侊紕鐣绘潻鍥ㄦ埂閺冨爼妫?        $expire_time = $ttl > 0 ? time() + $ttl : 0;
        
        // 鎼村繐鍨崠鏍处鐎涙ɑ鏆熼幑?        $serialized_data = maybe_serialize( $data );
        
        // 鐎涙ê鍋嶉崚鐧rdPress缂傛挸鐡?        wp_cache_set( $cache_key, $data, '', $ttl );
        
        // 鐎涙ê鍋嶉崚鎷屽殰鐎规矮绠熺悰?        global $wpdb;
        
        // 濡偓閺屻儳绱︾€涙ɑ妲搁崥锕€鍑＄€涙ê婀?        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key = %s";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $cache_key ) );
        
        if ( $count > 0 ) {
            // 閺囧瓨鏌婄紓鎾崇摠
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
            // 閹绘帒鍙嗙紓鎾崇摠
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
     * 閸掔娀娅庣紓鎾崇摠
     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @param array $args 閸欏倹鏆熼弫鎵矋
     * @return bool 閹垮秳缍旂紒鎾寸亯
     */
    public function delete( $key, $args = array() ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 娴犲豆ordPress缂傛挸鐡ㄩ崚鐘绘珟
        wp_cache_delete( $cache_key );
        
        // 娴犲氦鍤滅€规矮绠熺悰銊ュ灩闂?        return $this->delete_cache_from_db( $cache_key );
    }
    
    /**
     * 娴犲孩鏆熼幑顔肩氨閸掔娀娅庣紓鎾崇摠
     *
     * @param string $cache_key 鐎瑰本鏆ｉ惃鍕处鐎涙﹢鏁?     * @return bool 閹垮秳缍旂紒鎾寸亯
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
     * 濞撳懐鎮婇幍鈧張澶岀处鐎?     */
    public function clear_all_cache() {
        // 濞撳懐鎮奧ordPress鐎电钖勭紓鎾崇摠
        wp_cache_flush();
        
        // 濞撳懐鎮婇懛顏勭暰娑斿绱︾€涙銆?        global $wpdb;
        
        $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}sut_wechat_mini_cache" );
    }
    
    /**
     * 濞撳懐鎮婇幐鍥х暰缁鐎烽惃鍕处鐎?     *
     * @param string $cache_type 缂傛挸鐡ㄧ猾璇茬€?     */
    public function clear_cache_by_type( $cache_type ) {
        // 閺嬪嫬缂撶紓鎾崇摠闁款喖澧犵紓鈧?        $cache_key_prefix = $this->cache_prefix . $cache_type . '_';
        
        // 濞撳懐鎮奧ordPress缂傛挸鐡ㄩ敍鍫ｇ箹闁插本妫ゅ▔鏇犵翱绾喗绔婚悶鍡礉闂団偓鐟曚礁鈧喎濮粭顑跨瑏閺傝褰冩禒鑸靛灗閼奉亜鐣炬稊澶婄杽閻滃府绱?        
        // 濞撳懐鎮婇懛顏勭暰娑斿銆冩稉顓熷瘹鐎规氨琚崹瀣畱缂傛挸鐡?        global $wpdb;
        
        $sql = $wpdb->prepare( "DELETE FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key LIKE %s", $cache_key_prefix . '%' );
        $wpdb->query( $sql );
    }
    
    /**
     * 濞撳懐鎮婃潻鍥ㄦ埂缂傛挸鐡?     */
    public function clear_expired_cache() {
        global $wpdb;
        
        $current_time = time();
        
        $sql = $wpdb->prepare( "DELETE FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE expire_time > 0 AND expire_time < %d", $current_time );
        $wpdb->query( $sql );
    }
    
    /**
     * 濞撳懐鎮婃稉搴㈡瀮缁旂姷娴夐崗宕囨畱缂傛挸鐡?     *
     * @param int $post_id 閺傚洨鐝稩D
     */
    public function clear_post_cache( $post_id ) {
        // 濞撳懐鎮婇弬鍥╃彿鐠囷附鍎忕紓鎾崇摠
        $this->delete( 'post_detail', array( 'id' => $post_id ) );
        
        // 濞撳懐鎮婇惄绋垮彠閺傚洨鐝烽崚妤勩€冪紓鎾崇摠
        $this->delete( 'related_posts', array( 'post_id' => $post_id ) );
        
        // 濞撳懐鎮婇悜顓㈡，閺傚洨鐝风紓鎾崇摠
        $this->clear_cache_by_type( 'hot_posts' );
        
        // 濞撳懐鎮婇張鈧弬鐗堟瀮缁旂姷绱︾€?        $this->clear_cache_by_type( 'latest_posts' );
        
        // 濞撳懐鎮婇崚鍡欒閺傚洨鐝风紓鎾崇摠
        $categories = wp_get_post_categories( $post_id );
        
        foreach ( $categories as $category_id ) {
            $this->delete( 'category_posts', array( 'category_id' => $category_id ) );
        }
        
        // 濞撳懐鎮婇弽鍥╊劮閺傚洨鐝风紓鎾崇摠
        $tags = wp_get_post_tags( $post_id, array( 'fields' => 'ids' ) );
        
        foreach ( $tags as $tag_id ) {
            $this->delete( 'tag_posts', array( 'tag_id' => $tag_id ) );
        }
    }
    
    /**
     * 濞撳懐鎮婃稉搴濋獓閸濅胶娴夐崗宕囨畱缂傛挸鐡?     *
     * @param int $product_id 娴溠冩惂ID
     */
    public function clear_product_cache( $product_id ) {
        // 濞撳懐鎮婃禍褍鎼х拠锔藉剰缂傛挸鐡?        $this->delete( 'product_detail', array( 'id' => $product_id ) );
        
        // 濞撳懐鎮婇惄绋垮彠娴溠冩惂缂傛挸鐡?        $this->delete( 'related_products', array( 'product_id' => $product_id ) );
        
        // 濞撳懐鎮婇悜顓㈡，娴溠冩惂缂傛挸鐡?        $this->clear_cache_by_type( 'hot_products' );
        
        // 濞撳懐鎮婇張鈧弬棰侀獓閸濅胶绱︾€?        $this->clear_cache_by_type( 'latest_products' );
        
        // 濞撳懐鎮婇崚鍡欒娴溠冩惂缂傛挸鐡?        $terms = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
        
        foreach ( $terms as $term_id ) {
            $this->delete( 'category_products', array( 'category_id' => $term_id ) );
        }
        
        // 濞撳懐鎮婇弽鍥╊劮娴溠冩惂缂傛挸鐡?        $terms = wp_get_post_terms( $product_id, 'product_tag', array( 'fields' => 'ids' ) );
        
        foreach ( $terms as $term_id ) {
            $this->delete( 'tag_products', array( 'tag_id' => $term_id ) );
        }
    }
    
    /**
     * 濞撳懐鎮婃稉搴ゎ吂閸楁洜娴夐崗宕囨畱缂傛挸鐡?     *
     * @param int $order_id 鐠併垹宕烮D
     */
    public function clear_order_cache( $order_id ) {
        // 濞撳懐鎮婄拋銏犲礋鐠囷附鍎忕紓鎾崇摠
        $this->delete( 'order_detail', array( 'id' => $order_id ) );
        
        // 濞撳懐鎮婇悽銊﹀煕鐠併垹宕熼崚妤勩€冪紓鎾崇摠
        $order = wc_get_order( $order_id );
        
        if ( $order ) {
            $user_id = $order->get_user_id();
            
            if ( $user_id > 0 ) {
                $this->delete( 'user_orders', array( 'user_id' => $user_id ) );
            }
        }
    }
    
    /**
     * 濞撳懐鎮婃稉搴ｆ暏閹撮娴夐崗宕囨畱缂傛挸鐡?     *
     * @param int $user_id 閻劍鍩汭D
     */
    public function clear_user_cache( $user_id ) {
        // 濞撳懐鎮婇悽銊﹀煕娣団剝浼呯紓鎾崇摠
        $this->delete( 'user_info', array( 'id' => $user_id ) );
        
        // 濞撳懐鎮婇悽銊﹀煕鐠併垹宕熺紓鎾崇摠
        $this->delete( 'user_orders', array( 'user_id' => $user_id ) );
        
        // 濞撳懐鎮婇悽銊﹀煕閺€鎯版缂傛挸鐡?        $this->delete( 'user_favorites', array( 'user_id' => $user_id ) );
        
        // 濞撳懐鎮婇悽銊﹀煕缁夘垰鍨庣紓鎾崇摠
        $this->delete( 'user_points', array( 'user_id' => $user_id ) );
        
        // 濞撳懐鎮婇悽銊﹀煕閸︽澘娼冪紓鎾崇摠
        $this->delete( 'user_addresses', array( 'user_id' => $user_id ) );
    }
    
    /**
     * 妫板嫮鍎归弬鍥╃彿缂傛挸鐡?     *
     * @param int $limit 妫板嫮鍎归弬鍥╃彿閺佷即鍣?     */
    public function warmup_post_cache( $limit = 100 ) {
        // 閼惧嘲褰囬張鈧弬鎵畱閺傚洨鐝?        $args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query( $args );
        
        // 鐎电厧鍙哠UT_WeChat_Mini_Content缁?        if ( ! class_exists( 'SUT_WeChat_Mini_Content' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/content/class-sut-wechat-mini-content.php';
        }
        
        $content_helper = SUT_WeChat_Mini_Content::get_instance();
        
        // 妫板嫮鍎瑰В蹇曠槖閺傚洨鐝烽惃鍕处鐎?        foreach ( $query->posts as $post ) {
            $post_data = $content_helper->get_post_data( $post->ID );
            
            if ( $post_data ) {
                $this->set( 'post_detail', $post_data, array( 'id' => $post->ID ) );
            }
        }
        
        // 闁插秶鐤嗛弻銉嚄
        wp_reset_postdata();
    }
    
    /**
     * 妫板嫮鍎规禍褍鎼х紓鎾崇摠
     *
     * @param int $limit 妫板嫮鍎规禍褍鎼ч弫浼村櫤
     */
    public function warmup_product_cache( $limit = 100 ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }
        
        // 閼惧嘲褰囬張鈧弬鎵畱娴溠冩惂
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query( $args );
        
        // 鐎电厧鍙哠UT_WeChat_Mini_WooCommerce缁?        if ( ! class_exists( 'SUT_WeChat_Mini_WooCommerce' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/woocommerce/class-sut-wechat-mini-woocommerce.php';
        }
        
        $wc_helper = SUT_WeChat_Mini_WooCommerce::get_instance();
        
        // 妫板嫮鍎瑰В蹇庨嚋娴溠冩惂閻ㄥ嫮绱︾€?        foreach ( $query->posts as $post ) {
            $product_data = $wc_helper->get_product_data( $post->ID );
            
            if ( $product_data ) {
                $this->set( 'product_detail', $product_data, array( 'id' => $post->ID ) );
            }
        }
        
        // 闁插秶鐤嗛弻銉嚄
        wp_reset_postdata();
    }
    
    /**
     * 婢跺嫮鎮婇弬鍥╃彿閺囧瓨鏌婃禍瀣╂
     *
     * @param int $post_id 閺傚洨鐝稩D
     * @param WP_Post $post 閺傚洨鐝风€电钖?     * @param bool $update 閺勵垰鎯侀弰顖涙纯閺?     */
    public function on_post_updated( $post_id, $post, $update ) {
        // 閸欘亜顦╅悶鍡楀絺鐢啰濮搁幀浣烘畱閺傚洨鐝?        if ( $post->post_status !== 'publish' ) {
            return;
        }
        
        // 閸欘亜顦╅悶鍡樻瀮缁旂姷琚崹?        if ( $post->post_type !== 'post' ) {
            return;
        }
        
        // 濞撳懐鎮婇惄绋垮彠缂傛挸鐡?        $this->clear_post_cache( $post_id );
    }
    
    /**
     * 婢跺嫮鎮婇弬鍥╃彿閸掔娀娅庢禍瀣╂
     *
     * @param int $post_id 閺傚洨鐝稩D
     */
    public function on_post_deleted( $post_id ) {
        $post = get_post( $post_id );
        
        if ( ! $post || $post->post_type !== 'post' ) {
            return;
        }
        
        // 濞撳懐鎮婇惄绋垮彠缂傛挸鐡?        $this->clear_post_cache( $post_id );
    }
    
    /**
     * 婢跺嫮鎮婃禍褍鎼ч弴瀛樻煀娴滃娆?     *
     * @param int $product_id 娴溠冩惂ID
     */
    public function on_product_updated( $product_id ) {
        // 濞撳懐鎮婇惄绋垮彠缂傛挸鐡?        $this->clear_product_cache( $product_id );
    }
    
    /**
     * 婢跺嫮鎮婃禍褍鎼ч崚鐘绘珟娴滃娆?     *
     * @param int $post_id 娴溠冩惂ID
     */
    public function on_product_deleted( $post_id ) {
        $post = get_post( $post_id );
        
        if ( ! $post || $post->post_type !== 'product' ) {
            return;
        }
        
        // 濞撳懐鎮婇惄绋垮彠缂傛挸鐡?        $this->clear_product_cache( $post_id );
    }
    
    /**
     * 婢跺嫮鎮婄拋銏犲礋閻樿埖鈧礁褰夐弴缈犵皑娴?     *
     * @param int $order_id 鐠併垹宕烮D
     * @param string $old_status 閺冄呭Ц閹?     * @param string $new_status 閺傛壆濮搁幀?     */
    public function on_order_status_changed( $order_id, $old_status, $new_status ) {
        // 濞撳懐鎮婇惄绋垮彠缂傛挸鐡?        $this->clear_order_cache( $order_id );
        
        // 婵″倹鐏夌拋銏犲礋閻樿埖鈧礁褰夐弴缈犵窗瑜板崬鎼风紒鐔活吀閺佺増宓侀敍灞剧閻炲棛绮虹拋锛勭处鐎?        $this->clear_cache_by_type( 'stats' );
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕閺囧瓨鏌婃禍瀣╂
     *
     * @param int $user_id 閻劍鍩汭D
     * @param WP_User $old_user_data 閺冄呮暏閹撮攱鏆熼幑?     */
    public function on_user_updated( $user_id, $old_user_data ) {
        // 濞撳懐鎮婇惄绋垮彠缂傛挸鐡?        $this->clear_user_cache( $user_id );
    }
    
    /**
     * 濮ｅ繑妫╁〒鍛倞娴犺濮?     */
    public function daily_cleanup() {
        // 濞撳懐鎮婃潻鍥ㄦ埂缂傛挸鐡?        $this->clear_expired_cache();
        
        // 濞撳懐鎮婄紓鎾崇摠鐞涖劋鑵戦惃鍕亣闁插繑鏆熼幑?        $this->optimize_cache_table();
    }
    
    /**
     * 娴兼ê瀵茬紓鎾崇摠鐞?     */
    private function optimize_cache_table() {
        global $wpdb;
        
        // 濡偓閺屻儳绱︾€涙銆冩径褍鐨?        $sql = "SELECT table_name, data_length + index_length as size FROM information_schema.TABLES WHERE table_schema = DATABASE() AND table_name = '{$wpdb->prefix}sut_wechat_mini_cache'";
        $table_info = $wpdb->get_row( $sql, ARRAY_A );
        
        if ( $table_info && $table_info['size'] > 1024 * 1024 * 10 ) { // 婵″倹鐏夌悰銊ャ亣鐏忓繗绉存潻?0MB
            // 濞撳懐鎮婇幍鈧張澶岀处鐎?            $this->clear_all_cache();
        }
        
        // 娴兼ê瀵茬悰?        $sql = "OPTIMIZE TABLE {$wpdb->prefix}sut_wechat_mini_cache";
        $wpdb->query( $sql );
    }
    
    /**
     * 閼惧嘲褰囩紓鎾崇摠缂佺喕顓告穱鈩冧紖
     *
     * @return array 缂傛挸鐡ㄧ紒鐔活吀娣団剝浼?     */
    public function get_cache_stats() {
        global $wpdb;
        
        // 閼惧嘲褰囩紓鎾崇摠閹粯鏆?        $total_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache";
        $total = $wpdb->get_var( $total_sql );
        
        // 閼惧嘲褰囨潻鍥ㄦ埂缂傛挸鐡ㄩ弫?        $expired_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE expire_time > 0 AND expire_time < %d", time() );
        $expired = $wpdb->get_var( $expired_sql );
        
        // 閼惧嘲褰囨稉宥呮倱缁鐎烽惃鍕处鐎涙ɑ鏆?        $types = array();
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
     * 缂傛挸鐡ㄩ崶鐐剁殶閸戣姤鏆?     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @param callable $callback 閸ョ偠鐨熼崙鑺ユ殶
     * @param array $args 閸欏倹鏆熼弫鎵矋
     * @param int $ttl 缂傛挸鐡ㄩ弮鍫曟？
     * @return mixed 缂傛挸鐡ㄩ弫鐗堝祦
     */
    public function cache_callback( $key, $callback, $args = array(), $ttl = null ) {
        // 鐏忔繆鐦懢宄板絿缂傛挸鐡?        $data = $this->get( $key, $args );
        
        // 婵″倹鐏夌紓鎾崇摠閸涙垝鑵戦敍宀冪箲閸ョ偟绱︾€涙ɑ鏆熼幑?        if ( $data !== false ) {
            return $data;
        }
        
        // 鐠嬪啰鏁ら崶鐐剁殶閸戣姤鏆熼懢宄板絿閺佺増宓?        $data = call_user_func( $callback );
        
        // 婵″倹鐏夐懢宄板絿閸掔増鏆熼幑顕嗙礉鐠佸墽鐤嗙紓鎾崇摠
        if ( $data !== false && $data !== null ) {
            $this->set( $key, $data, $args, $ttl );
        }
        
        return $data;
    }
}\n