锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村护ooCommerce闂嗗棙鍨氱猾? *
 * 婢跺嫮鎮奧ooCommerce娴溠冩惂閻ㄥ嫭妯夌粈鎭掆偓浣藉枠閻椻晞婧呴妴浣筋吂閸楁洜顓搁悶鍡欑搼閻㈤潧鏅㈤崝鐔诲厴
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_WooCommerce 缁? */
class SUT_WeChat_Mini_WooCommerce {
    
    /**
     * WooCommerce闂嗗棙鍨氱€圭偘绶?     *
     * @var SUT_WeChat_Mini_WooCommerce
     */
    private static $instance = null;
    
    /**
     * 姒涙顓诲В蹇涖€夐弰鍓с仛閺佷即鍣?     *
     * @var int
     */
    private $default_per_page = 10;
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_WooCommerce
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 閸掓繂顫愰崠鏈﹐oCommerce闂嗗棙鍨?     */
    private function init() {
        // 濞夈劌鍞絎ooCommerce閻╃鍙ч惃鍑橮I鐠侯垳鏁?        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_woocommerce_routes' ) );
        
        // 绾喕绻歐ooCommerce瀹稿弶绺哄ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }
    }
    
    /**
     * 濞ｈ濮濿ooCommerce閻╃鍙ч惃鍑橮I鐠侯垳鏁?     *
     * @param array $routes 閻滅増婀佺捄顖滄暠
     * @return array 娣囶喗鏁奸崥搴ｆ畱鐠侯垳鏁?     */
    public function add_woocommerce_routes( $routes ) {
        // 娴溠冩惂閻╃鍙PI
        $routes['products'] = array( 'callback' => array( $this, 'api_get_products' ) );
        $routes['products/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_product' ) );
        $routes['products/search'] = array( 'callback' => array( $this, 'api_search_products' ) );
        $routes['products/categories'] = array( 'callback' => array( $this, 'api_get_product_categories' ) );
        $routes['products/categories/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_products_by_category' ) );
        $routes['products/related/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_related_products' ) );
        $routes['products/featured'] = array( 'callback' => array( $this, 'api_get_featured_products' ) );
        $routes['products/sale'] = array( 'callback' => array( $this, 'api_get_sale_products' ) );
        
        // 鐠愵厾澧挎潪锔炬祲閸忕煥PI
        $routes['cart'] = array( 'callback' => array( $this, 'api_get_cart' ), 'auth' => true );
        $routes['cart/add'] = array( 'callback' => array( $this, 'api_add_to_cart' ), 'auth' => true );
        $routes['cart/update'] = array( 'callback' => array( $this, 'api_update_cart' ), 'auth' => true );
        $routes['cart/remove'] = array( 'callback' => array( $this, 'api_remove_from_cart' ), 'auth' => true );
        $routes['cart/clear'] = array( 'callback' => array( $this, 'api_clear_cart' ), 'auth' => true );
        
        // 鐠併垹宕熼惄绋垮彠API
        $routes['orders'] = array( 'callback' => array( $this, 'api_get_orders' ), 'auth' => true );
        $routes['orders/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_order' ), 'auth' => true );
        $routes['orders/create'] = array( 'callback' => array( $this, 'api_create_order' ), 'auth' => true );
        $routes['orders/cancel/([0-9]+)'] = array( 'callback' => array( $this, 'api_cancel_order' ), 'auth' => true );
        $routes['orders/confirm/([0-9]+)'] = array( 'callback' => array( $this, 'api_confirm_order' ), 'auth' => true );
        
        // 閺€顖欑帛閻╃鍙PI
        $routes['payment/create'] = array( 'callback' => array( $this, 'api_create_payment' ), 'auth' => true );
        $routes['payment/notify'] = array( 'callback' => array( $this, 'api_payment_notify' ) );
        
        return $routes;
    }
    
    /**
     * 閼惧嘲褰囨禍褍鎼ч崚妤勩€?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 娴溠冩惂閸掓銆?     */
    public function api_get_products( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬崚鍡涖€夐崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 鎼存梻鏁ゆ０婵嗩樆閻ㄥ嫭鐓＄拠銏℃蒋娴?        $args = $this->apply_product_query_filters( $args, $data );
        
        // 閹笛嗩攽閺屻儴顕?        $query = new WP_Query( $args );
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $products,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氶嚋娴溠冩惂
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 娴溠冩惂鐠囷附鍎?     */
    public function api_get_product( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $product_id = $matches[1];
        
        // 閼惧嘲褰囨禍褍鎼?        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '娴溠冩惂娑撳秴鐡ㄩ崷銊﹀灗閺堫亜褰傜敮?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $formatted_product = $this->format_product( $product, true );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $formatted_product
        );
        
        return $result;
    }
    
    /**
     * 閹兼粎鍌ㄦ禍褍鎼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閹兼粎鍌ㄧ紒鎾寸亯
     */
    public function api_search_products( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儲鎮崇槐銏犲彠闁款喛鐦?        if ( ! isset( $data['keyword'] ) || empty( $data['keyword'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨幖婊呭偍閸忔娊鏁拠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬崚鍡涖€夐崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺嬪嫬缂撻幖婊呭偍閸欏倹鏆?        $args = array(
            's'              => $data['keyword'],
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'relevance',
            'order'          => 'DESC',
        );
        
        // 閹笛嗩攽閹兼粎鍌?        $query = new WP_Query( $args );
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $products,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囨禍褍鎼ч崚鍡欒閸掓銆?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 娴溠冩惂閸掑棛琚崚妤勩€?     */
    public function api_get_product_categories( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬崣鍌涙殶
        $parent = isset( $data['parent'] ) ? intval( $data['parent'] ) : 0;
        $hide_empty = isset( $data['hide_empty'] ) ? boolval( $data['hide_empty'] ) : true;
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $args = array(
            'taxonomy'   => 'product_cat',
            'parent'     => $parent,
            'hide_empty' => $hide_empty,
            'orderby'    => 'count',
            'order'      => 'DESC',
        );
        
        // 閼惧嘲褰囬崚鍡欒
        $categories = get_categories( $args );
        
        // 閺嶇厧绱￠崠鏍у瀻缁粯鏆熼幑?        $formatted_categories = array();
        foreach ( $categories as $category ) {
            // 閼惧嘲褰囬崚鍡欒閸ュ墽澧?            $thumbnail_id = get_term_meta( $category->term_id, 'thumbnail_id', true );
            $thumbnail_url = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : '';
            
            $formatted_categories[] = array(
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent' => $category->parent,
                'count' => $category->count,
                'thumbnail' => $thumbnail_url,
            );
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $formatted_categories
        );
        
        return $result;
    }
    
    /**
     * 閺嶈宓侀崚鍡欒閼惧嘲褰囨禍褍鎼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 娴溠冩惂閸掓銆?     */
    public function api_get_products_by_category( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $category_id = $matches[1];
        
        // 濡偓閺屻儱鍨庣猾缁樻Ц閸氾箑鐡ㄩ崷?        $category = get_term( $category_id, 'product_cat' );
        if ( ! $category || is_wp_error( $category ) ) {
            return array(
                'code' => 104,
                'message' => __( '閸掑棛琚稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬崚鍡涖€夐崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'tax_query'      => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field'    => 'id',
                    'terms'    => $category_id,
                    'operator' => 'IN'
                )
            ),
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 閹笛嗩攽閺屻儴顕?        $query = new WP_Query( $args );
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $products,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬惄绋垮彠娴溠冩惂
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閻╃鍙ф禍褍鎼ч崚妤勩€?     */
    public function api_get_related_products( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $product_id = $matches[1];
        $number = isset( $data['number'] ) ? intval( $data['number'] ) : 5;
        
        // 閼惧嘲褰囨禍褍鎼?        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '娴溠冩惂娑撳秴鐡ㄩ崷銊﹀灗閺堫亜褰傜敮?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬惄绋垮彠娴溠冩惂
        $related_ids = wc_get_related_products( $product_id, $number );
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $products = array();
        foreach ( $related_ids as $related_id ) {
            $related_product = wc_get_product( $related_id );
            if ( $related_product && $related_product->is_published() ) {
                $products[] = $this->format_product( $related_product );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $products
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬悧纭呭娴溠冩惂
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閻楃澹婃禍褍鎼ч崚妤勩€?     */
    public function api_get_featured_products( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'meta_query'     => array(
                array(
                    'key'   => '_featured',
                    'value' => 'yes'
                )
            ),
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 閹笛嗩攽閺屻儴顕?        $query = new WP_Query( $args );
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $products,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囨穱鍐敘娴溠冩惂
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 娣囧啴鏀㈡禍褍鎼ч崚妤勩€?     */
    public function api_get_sale_products( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'meta_query'     => array(
                'relation' => 'OR',
                array(
                    'key'           => '_sale_price',
                    'value'         => 0,
                    'compare'       => '>',
                    'type'          => 'numeric'
                ),
                array(
                    'key'           => '_min_variation_sale_price',
                    'value'         => 0,
                    'compare'       => '>',
                    'type'          => 'numeric'
                )
            ),
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 閹笛嗩攽閺屻儴顕?        $query = new WP_Query( $args );
        
        // 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product && $product->is_on_sale() ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $products,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囩拹顓犲⒖鏉?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 鐠愵厾澧挎潪锔芥殶閹?     */
    public function api_get_cart( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 閼惧嘲褰囬悽銊﹀煕鐠愵厾澧挎潪?        $cart = $this->get_user_cart( $user_id );
        
        // 鐠侊紕鐣荤拹顓犲⒖鏉烇附鈧鐜?        $total_price = 0;
        $total_quantity = 0;
        $cart_items = array();
        
        foreach ( $cart as $item_id => $item ) {
            $product = wc_get_product( $item['product_id'] );
            if ( $product && $product->is_published() ) {
                $price = $product->get_price();
                $item_total = $price * $item['quantity'];
                
                $cart_items[] = array(
                    'item_id' => $item_id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'total' => $item_total,
                    'product_name' => $product->get_name(),
                    'product_image' => $product->get_image_id() ? wp_get_attachment_url( $product->get_image_id() ) : '',
                    'variation_id' => isset( $item['variation_id'] ) ? $item['variation_id'] : 0,
                    'variation' => isset( $item['variation'] ) ? $item['variation'] : array(),
                );
                
                $total_price += $item_total;
                $total_quantity += $item['quantity'];
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'items' => $cart_items,
                'total_price' => $total_price,
                'total_quantity' => $total_quantity,
                'item_count' => count( $cart_items )
            )
        );
        
        return $result;
    }
    
    /**
     * 濞ｈ濮為崯鍡楁惂閸掓媽鍠橀悧鈺勬簠
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 濞ｈ濮炵紒鎾寸亯
     */
    public function api_add_to_cart( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['product_id'] ) || ! isset( $data['quantity'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝眗oduct_id 閹?quantity', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $product_id = $data['product_id'];
        $quantity = intval( $data['quantity'] );
        $variation_id = isset( $data['variation_id'] ) ? $data['variation_id'] : 0;
        $variation = isset( $data['variation'] ) ? $data['variation'] : array();
        
        // 濡偓閺屻儰楠囬崫浣规Ц閸氾箑鐡ㄩ崷?        $product = wc_get_product( $product_id );
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '娴溠冩惂娑撳秴鐡ㄩ崷銊﹀灗閺堫亜褰傜敮?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绨辩€?        if ( ! $product->has_enough_stock( $quantity ) ) {
            return array(
                'code' => 103,
                'message' => __( '鎼存挸鐡ㄦ稉宥堝喕', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬悽銊﹀煕鐠愵厾澧挎潪?        $cart = $this->get_user_cart( $user_id );
        
        // 閻㈢喐鍨氶崯鍡楁惂閸烆垯绔碔D
        $item_key = $product_id;
        if ( $variation_id || ! empty( $variation ) ) {
            $item_key .= '-' . md5( json_encode( $variation ) );
        }
        
        // 濞ｈ濮為幋鏍ㄦ纯閺傛媽鍠橀悧鈺勬簠
        if ( isset( $cart[$item_key] ) ) {
            $cart[$item_key]['quantity'] += $quantity;
        } else {
            $cart[$item_key] = array(
                'product_id' => $product_id,
                'quantity' => $quantity,
                'variation_id' => $variation_id,
                'variation' => $variation,
                'added_at' => current_time( 'mysql' ),
            );
        }
        
        // 娣囨繂鐡ㄧ拹顓犲⒖鏉?        $this->save_user_cart( $user_id, $cart );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '濞ｈ濮為幋鎰', 'sut-wechat-mini' ),
            'data' => array(
                'item_id' => $item_key,
                'quantity' => $cart[$item_key]['quantity']
            )
        );
        
        return $result;
    }
    
    /**
     * 閺囧瓨鏌婄拹顓犲⒖鏉烇箑鏅㈤崫浣规殶闁?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閺囧瓨鏌婄紒鎾寸亯
     */
    public function api_update_cart( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['item_id'] ) || ! isset( $data['quantity'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝﹖em_id 閹?quantity', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $item_id = $data['item_id'];
        $quantity = intval( $data['quantity'] );
        
        // 閼惧嘲褰囬悽銊﹀煕鐠愵厾澧挎潪?        $cart = $this->get_user_cart( $user_id );
        
        // 濡偓閺屻儱鏅㈤崫浣规Ц閸氾箑婀拹顓犲⒖鏉烇缚鑵?        if ( ! isset( $cart[$item_id] ) ) {
            return array(
                'code' => 104,
                'message' => __( '鐠愵厾澧挎潪锔胯厬濞屸剝婀佸銈呮櫌閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绨辩€?        $product_id = $cart[$item_id]['product_id'];
        $product = wc_get_product( $product_id );
        if ( $product && ! $product->has_enough_stock( $quantity ) ) {
            return array(
                'code' => 103,
                'message' => __( '鎼存挸鐡ㄦ稉宥堝喕', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閺囧瓨鏌婄拹顓犲⒖鏉?        $cart[$item_id]['quantity'] = $quantity;
        $cart[$item_id]['updated_at'] = current_time( 'mysql' );
        
        // 娣囨繂鐡ㄧ拹顓犲⒖鏉?        $this->save_user_cart( $user_id, $cart );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閺囧瓨鏌婇幋鎰', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 娴犲氦鍠橀悧鈺勬簠缁夊娅庨崯鍡楁惂
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 缁夊娅庣紒鎾寸亯
     */
    public function api_remove_from_cart( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['item_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝﹖em_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $item_id = $data['item_id'];
        
        // 閼惧嘲褰囬悽銊﹀煕鐠愵厾澧挎潪?        $cart = $this->get_user_cart( $user_id );
        
        // 濡偓閺屻儱鏅㈤崫浣规Ц閸氾箑婀拹顓犲⒖鏉烇缚鑵?        if ( ! isset( $cart[$item_id] ) ) {
            return array(
                'code' => 104,
                'message' => __( '鐠愵厾澧挎潪锔胯厬濞屸剝婀佸銈呮櫌閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 缁夊娅庨崯鍡楁惂
        unset( $cart[$item_id] );
        
        // 娣囨繂鐡ㄧ拹顓犲⒖鏉?        $this->save_user_cart( $user_id, $cart );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '缁夊娅庨幋鎰', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 濞撳懐鈹栫拹顓犲⒖鏉?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 濞撳懐鈹栫紒鎾寸亯
     */
    public function api_clear_cart( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 濞撳懐鈹栫拹顓犲⒖鏉?        $this->save_user_cart( $user_id, array() );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '鐠愵厾澧挎潪锕€鍑″〒鍛敄', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕鐠併垹宕熼崚妤勩€?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 鐠併垹宕熼崚妤勩€?     */
    public function api_get_orders( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 閼惧嘲褰囬崚鍡涖€夐崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $args = array(
            'post_type'      => 'shop_order',
            'post_status'    => array_keys( wc_get_order_statuses() ),
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
            'meta_query'     => array(
                array(
                    'key'   => '_customer_user',
                    'value' => $user_id
                )
            )
        );
        
        // 閹笛嗩攽閺屻儴顕?        $query = new WP_Query( $args );
        
        // 閺嶇厧绱￠崠鏍吂閸楁洘鏆熼幑?        $orders = array();
        foreach ( $query->posts as $post ) {
            $order = wc_get_order( $post->ID );
            if ( $order ) {
                $orders[] = $this->format_order( $order );
            }
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $orders,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氶嚋鐠併垹宕?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 鐠併垹宕熺拠锔藉剰
     */
    public function api_get_order( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 閼惧嘲褰囩拋銏犲礋
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '鐠併垹宕熸稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇熸Ц閸氾箑鐫樻禍搴＄秼閸撳秶鏁ら幋?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '閺冪姵娼堢拋鍧楁６鐠囥儴顓归崡?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閺嶇厧绱￠崠鏍吂閸楁洘鏆熼幑?        $formatted_order = $this->format_order( $order, true );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $formatted_order
        );
        
        return $result;
    }
    
    /**
     * 閸掓稑缂撶拋銏犲礋
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閸掓稑缂撶紒鎾寸亯
     */
    public function api_create_order( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['address_id'] ) || ! isset( $data['payment_method'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝沝dress_id 閹?payment_method', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $address_id = $data['address_id'];
        $payment_method = $data['payment_method'];
        $coupon_code = isset( $data['coupon_code'] ) ? $data['coupon_code'] : '';
        $remark = isset( $data['remark'] ) ? $data['remark'] : '';
        
        // 閼惧嘲褰囬悽銊﹀煕鐠愵厾澧挎潪?        $cart = $this->get_user_cart( $user_id );
        
        if ( empty( $cart ) ) {
            return array(
                'code' => 103,
                'message' => __( '鐠愵厾澧挎潪锔胯礋缁?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囬悽銊﹀煕閸︽澘娼?        $address = $this->get_user_address( $user_id, $address_id );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '閸︽澘娼冩稉宥呯摠閸︺劍鍨ㄦ稉宥呯潣娴滃氦顕氶悽銊﹀煕', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閸掓稑缂撶拋銏犲礋
        $order = wc_create_order();
        
        if ( ! $order ) {
            return array(
                'code' => 103,
                'message' => __( '鐠併垹宕熼崚娑樼紦婢惰精瑙?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濞ｈ濮炵拋銏犲礋妞?        foreach ( $cart as $item_key => $item ) {
            $product = wc_get_product( $item['product_id'] );
            
            if ( $product && $product->is_published() ) {
                // 濡偓閺屻儱绨辩€?                if ( ! $product->has_enough_stock( $item['quantity'] ) ) {
                    $order->delete();
                    return array(
                        'code' => 103,
                        'message' => sprintf( __( '%s 鎼存挸鐡ㄦ稉宥堝喕', 'sut-wechat-mini' ), $product->get_name() ),
                        'data' => array()
                    );
                }
                
                // 濞ｈ濮為崯鍡楁惂閸掓媽顓归崡?                $order->add_product( $product, $item['quantity'] );
            }
        }
        
        // 鐠佸墽鐤嗙拋銏犲礋閸︽澘娼?        $order->set_address( array(
            'first_name' => $address->consignee,
            'last_name' => '',
            'company' => '',
            'email' => '',
            'phone' => $address->phone,
            'address_1' => $address->detail_address,
            'address_2' => '',
            'city' => $address->city,
            'state' => $address->province,
            'postcode' => '',
            'country' => $address->country,
        ), 'billing' );
        
        $order->set_address( array(
            'first_name' => $address->consignee,
            'last_name' => '',
            'company' => '',
            'email' => '',
            'phone' => $address->phone,
            'address_1' => $address->detail_address,
            'address_2' => '',
            'city' => $address->city,
            'state' => $address->province,
            'postcode' => '',
            'country' => $address->country,
        ), 'shipping' );
        
        // 鐠佸墽鐤嗛弨顖欑帛閺傜懓绱?        $order->set_payment_method( $payment_method );
        
        // 鎼存梻鏁ゆ导妯诲劕閸?        if ( ! empty( $coupon_code ) ) {
            $coupon = new WC_Coupon( $coupon_code );
            if ( $coupon->is_valid() ) {
                $order->apply_coupon( $coupon_code );
            }
        }
        
        // 鐠佸墽鐤嗙拋銏犲礋婢跺洦鏁?        if ( ! empty( $remark ) ) {
            $order->add_order_note( $remark );
        }
        
        // 鐠佸墽鐤嗙拋銏犲礋閻樿埖鈧椒璐熷鍛帛濞?        $order->set_status( 'pending' );
        
        // 鐠佸墽鐤嗙拋銏犲礋鐎广垺鍩?        $order->set_customer_id( $user_id );
        
        // 鐠侊紕鐣荤拋銏犲礋閹鐜?        $order->calculate_totals();
        
        // 娣囨繂鐡ㄧ拋銏犲礋
        $order->save();
        
        // 濞撳懐鈹栫拹顓犲⒖鏉?        $this->save_user_cart( $user_id, array() );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '鐠併垹宕熼崚娑樼紦閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'order_id' => $order->get_id(),
                'total_price' => $order->get_total(),
                'order_status' => $order->get_status()
            )
        );
        
        return $result;
    }
    
    /**
     * 閸欐牗绉风拋銏犲礋
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閸欐牗绉风紒鎾寸亯
     */
    public function api_cancel_order( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 閼惧嘲褰囩拋銏犲礋
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '鐠併垹宕熸稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇熸Ц閸氾箑鐫樻禍搴＄秼閸撳秶鏁ら幋?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '閺冪姵娼堢拋鍧楁６鐠囥儴顓归崡?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇犲Ц閹焦妲搁崥锕€褰叉禒銉ュ絿濞?        $current_status = $order->get_status();
        if ( ! in_array( $current_status, array( 'pending', 'processing' ) ) ) {
            return array(
                'code' => 103,
                'message' => __( '鐠囥儴顓归崡鏇犲Ц閹椒绗夐崗浣筋啅閸欐牗绉?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閸欐牗绉风拋銏犲礋
        $order->update_status( 'cancelled', __( '閻劍鍩涢崣鏍ㄧХ鐠併垹宕?, 'sut-wechat-mini' ) );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '鐠併垹宕熷鎻掑絿濞?, 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 绾喛顓婚弨鎯版彛
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 绾喛顓荤紒鎾寸亯
     */
    public function api_confirm_order( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 閼惧嘲褰囩拋銏犲礋
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '鐠併垹宕熸稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇熸Ц閸氾箑鐫樻禍搴＄秼閸撳秶鏁ら幋?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '閺冪姵娼堢拋鍧楁６鐠囥儴顓归崡?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇犲Ц閹焦妲搁崥锕€褰叉禒銉р€樼拋銈嗘暪鐠?        $current_status = $order->get_status();
        if ( 'completed' === $current_status ) {
            return array(
                'code' => 103,
                'message' => __( '鐠併垹宕熷鎻掔暚閹?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        if ( 'processing' !== $current_status && 'on-hold' !== $current_status ) {
            return array(
                'code' => 103,
                'message' => __( '鐠囥儴顓归崡鏇犲Ц閹椒绗夐崗浣筋啅绾喛顓婚弨鎯版彛', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 绾喛顓婚弨鎯版彛
        $order->update_status( 'completed', __( '閻劍鍩涚涵顔款吇閺€鎯版彛', 'sut-wechat-mini' ) );
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '绾喛顓婚弨鎯版彛閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 閸掓稑缂撻弨顖欑帛
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閺€顖欑帛娣団剝浼?     */
    public function api_create_payment( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce閺堫亝绺哄ú?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['order_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝皉der_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $data['order_id'];
        
        // 閼惧嘲褰囩拋銏犲礋
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '鐠併垹宕熸稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇熸Ц閸氾箑鐫樻禍搴＄秼閸撳秶鏁ら幋?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '閺冪姵娼堢拋鍧楁６鐠囥儴顓归崡?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇犲Ц閹?        if ( 'pending' !== $order->get_status() ) {
            return array(
                'code' => 103,
                'message' => __( '鐠併垹宕熼悩鑸碘偓浣风瑝濮濓絿鈥?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儴顓归崡鏇㈠櫨妫?        $total = $order->get_total();
        if ( $total <= 0 ) {
            return array(
                'code' => 103,
                'message' => __( '鐠併垹宕熼柌鎴︻杺娑撳秵顒滅涵?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閸掓稑缂撳顔讳繆閺€顖欑帛
        $wechat_pay = SUT_WeChat_Mini_Pay::get_instance();
        $payment_params = $wechat_pay->create_payment( $order, $user_id );
        
        if ( is_wp_error( $payment_params ) ) {
            return array(
                'code' => 103,
                'message' => $payment_params->get_error_message(),
                'data' => array()
            );
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $result = array(
            'code' => 0,
            'message' => __( '閺€顖欑帛閸欏倹鏆熼悽鐔稿灇閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $payment_params
        );
        
        return $result;
    }
    
    /**
     * 閺€顖欑帛閸ョ偠鐨?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閸ョ偠鐨熺紒鎾寸亯
     */
    public function api_payment_notify( $data, $matches ) {
        // 濡偓閺岊櫇ooCommerce閺勵垰鎯佸┑鈧ú?        if ( ! class_exists( 'WooCommerce' ) ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[WooCommerce閺堫亝绺哄ú绫></return_msg></xml>';
            exit;
        }
        
        // 鐟欙絾鐎藉顔讳繆閺€顖欑帛閸ョ偠鐨熼弫鐗堝祦
        $xml_data = file_get_contents( 'php://input' );
        $data = $this->xml_to_array( $xml_data );
        
        // 妤犲矁鐦夌粵鎯ф倳
        $wechat_pay = SUT_WeChat_Mini_Pay::get_instance();
        $is_valid = $wechat_pay->verify_notify_sign( $data );
        
        if ( ! $is_valid ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[缁涙儳鎮曟宀冪槈婢惰精瑙]></return_msg></xml>';
            exit;
        }
        
        // 閼惧嘲褰囩拋銏犲礋娣団剝浼?        $order_id = $data['out_trade_no'];
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[鐠併垹宕熸稉宥呯摠閸︹暀]></return_msg></xml>';
            exit;
        }
        
        // 濡偓閺屻儴顓归崡鏇犲Ц閹?        if ( 'processing' === $order->get_status() || 'completed' === $order->get_status() ) {
            echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
            exit;
        }
        
        // 濡偓閺屻儲鏁禒姗€鍣炬０?        $total_fee = $data['total_fee'] / 100; // 瀵邦喕淇婇弨顖欑帛闁叉垿顤傞弰顖氬瀻
        if ( $total_fee != $order->get_total() ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[閺€顖欑帛闁叉垿顤傛稉宥呭爱闁板硶]></return_msg></xml>';
            exit;
        }
        
        // 閺囧瓨鏌婄拋銏犲礋閻樿埖鈧?        $order->update_status( 'processing', __( '瀵邦喕淇婇弨顖欑帛閹存劕濮?, 'sut-wechat-mini' ) );
        
        // 濞ｈ濮為弨顖欑帛娣団剝浼?        $order->add_meta_data( '_wechat_transaction_id', $data['transaction_id'], true );
        $order->add_meta_data( '_wechat_pay_time', $data['time_end'], true );
        $order->save();
        
        // 閸欐垿鈧焦鍨氶崝鐔锋惙鎼?        echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
        exit;
    }
    
    /**
     * 閺嶇厧绱￠崠鏍﹂獓閸濅焦鏆熼幑?     *
     * @param WC_Product $product 娴溠冩惂鐎电钖?     * @param bool $is_detail 閺勵垰鎯佹稉楦款嚊閹懘銆?     * @return array 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫪楠囬崫浣规殶閹?     */
    private function format_product( $product, $is_detail = false ) {
        // 閼惧嘲褰囨禍褍鎼ч崺鐑樻拱娣団剝浼?        $product_data = array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'price' => floatval( $product->get_price() ),
            'regular_price' => floatval( $product->get_regular_price() ),
            'sale_price' => floatval( $product->get_sale_price() ),
            'stock_quantity' => $product->get_stock_quantity(),
            'stock_status' => $product->get_stock_status(),
            'on_sale' => $product->is_on_sale(),
            'featured' => $product->is_featured(),
            'catalog_visibility' => $product->get_catalog_visibility(),
            'description' => $product->get_description(),
            'short_description' => $product->get_short_description(),
            'sku' => $product->get_sku(),
            'permalink' => $product->get_permalink(),
            'date_created' => $product->get_date_created() ? $product->get_date_created()->format( 'Y-m-d H:i:s' ) : '',
            'date_modified' => $product->get_date_modified() ? $product->get_date_modified()->format( 'Y-m-d H:i:s' ) : '',
        );
        
        // 閼惧嘲褰囨禍褍鎼ч崶鍓у
        $images = array();
        $featured_image_id = $product->get_image_id();
        if ( $featured_image_id ) {
            $images[] = array(
                'id' => $featured_image_id,
                'src' => wp_get_attachment_url( $featured_image_id ),
                'thumbnail' => wp_get_attachment_image_url( $featured_image_id, 'thumbnail' ),
                'medium' => wp_get_attachment_image_url( $featured_image_id, 'medium' ),
                'large' => wp_get_attachment_image_url( $featured_image_id, 'large' ),
            );
        }
        
        // 閼惧嘲褰囨禍褍鎼ч崶鎯х氨
        $gallery_image_ids = $product->get_gallery_image_ids();
        foreach ( $gallery_image_ids as $gallery_image_id ) {
            $images[] = array(
                'id' => $gallery_image_id,
                'src' => wp_get_attachment_url( $gallery_image_id ),
                'thumbnail' => wp_get_attachment_image_url( $gallery_image_id, 'thumbnail' ),
                'medium' => wp_get_attachment_image_url( $gallery_image_id, 'medium' ),
                'large' => wp_get_attachment_image_url( $gallery_image_id, 'large' ),
            );
        }
        
        $product_data['images'] = $images;
        
        // 閼惧嘲褰囨禍褍鎼ч崚鍡欒
        $categories = array();
        $product_categories = get_the_terms( $product->get_id(), 'product_cat' );
        if ( $product_categories && ! is_wp_error( $product_categories ) ) {
            foreach ( $product_categories as $category ) {
                $categories[] = array(
                    'id' => $category->term_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                );
            }
        }
        
        $product_data['categories'] = $categories;
        
        // 閼惧嘲褰囨禍褍鎼ч弽鍥╊劮
        $tags = array();
        $product_tags = get_the_terms( $product->get_id(), 'product_tag' );
        if ( $product_tags && ! is_wp_error( $product_tags ) ) {
            foreach ( $product_tags as $tag ) {
                $tags[] = array(
                    'id' => $tag->term_id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                );
            }
        }
        
        $product_data['tags'] = $tags;
        
        // 婵″倹鐏夐弰顖濐嚊閹懘銆夐敍灞惧潑閸旂姵娲挎径姘繆閹?        if ( $is_detail ) {
            // 閼惧嘲褰囨禍褍鎼х仦鐐粹偓?            $attributes = array();
            $product_attributes = $product->get_attributes();
            foreach ( $product_attributes as $attribute_name => $attribute ) {
                $attributes[] = array(
                    'name' => wc_attribute_label( $attribute_name ),
                    'value' => $attribute->get_options(),
                );
            }
            
            $product_data['attributes'] = $attributes;
            
            // 婢跺嫮鎮婃禍褍鎼х猾璇茬€?            if ( $product->is_type( 'variable' ) ) {
                // 閼惧嘲褰囨禍褍鎼ч崣妯圭秼
                $variations = array();
                $available_variations = $product->get_available_variations();
                foreach ( $available_variations as $variation ) {
                    $variations[] = array(
                        'id' => $variation['variation_id'],
                        'price' => floatval( $variation['display_price'] ),
                        'regular_price' => floatval( $variation['display_regular_price'] ),
                        'stock_quantity' => $variation['max_qty'],
                        'attributes' => $variation['attributes'],
                        'image' => isset( $variation['image'] ) ? $variation['image']['url'] : '',
                    );
                }
                
                $product_data['variations'] = $variations;
            }
        }
        
        return $product_data;
    }
    
    /**
     * 閺嶇厧绱￠崠鏍吂閸楁洘鏆熼幑?     *
     * @param WC_Order $order 鐠併垹宕熺€电钖?     * @param bool $is_detail 閺勵垰鎯佹稉楦款嚊閹懘銆?     * @return array 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫯顓归崡鏇熸殶閹?     */
    private function format_order( $order, $is_detail = false ) {
        // 閼惧嘲褰囩拋銏犲礋閸╃儤婀版穱鈩冧紖
        $order_data = array(
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'status_text' => wc_get_order_status_name( $order->get_status() ),
            'total' => floatval( $order->get_total() ),
            'subtotal' => floatval( $order->get_subtotal() ),
            'shipping_total' => floatval( $order->get_shipping_total() ),
            'tax_total' => floatval( $order->get_total_tax() ),
            'discount_total' => floatval( $order->get_discount_total() ),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),
            'date_created' => $order->get_date_created() ? $order->get_date_created()->format( 'Y-m-d H:i:s' ) : '',
            'date_modified' => $order->get_date_modified() ? $order->get_date_modified()->format( 'Y-m-d H:i:s' ) : '',
            'date_completed' => $order->get_date_completed() ? $order->get_date_completed()->format( 'Y-m-d H:i:s' ) : '',
            'date_paid' => $order->get_date_paid() ? $order->get_date_paid()->format( 'Y-m-d H:i:s' ) : '',
        );
        
        // 閼惧嘲褰囩拋銏犲礋閸熷棗鎼?        $order_items = array();
        foreach ( $order->get_items() as $item_id => $item ) {
            $product = $item->get_product();
            if ( $product ) {
                $order_items[] = array(
                    'id' => $item_id,
                    'product_id' => $item->get_product_id(),
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'price' => floatval( $item->get_subtotal() / $item->get_quantity() ),
                    'subtotal' => floatval( $item->get_subtotal() ),
                    'image' => $product->get_image_id() ? wp_get_attachment_url( $product->get_image_id() ) : '',
                    'variation_id' => $item->get_variation_id(),
                );
            }
        }
        
        $order_data['items'] = $order_items;
        
        // 閼惧嘲褰囩拹锕€宕熼崷鏉挎絻
        $billing = $order->get_address( 'billing' );
        $order_data['billing'] = array(
            'first_name' => $billing['first_name'],
            'last_name' => $billing['last_name'],
            'company' => $billing['company'],
            'address_1' => $billing['address_1'],
            'address_2' => $billing['address_2'],
            'city' => $billing['city'],
            'state' => $billing['state'],
            'postcode' => $billing['postcode'],
            'country' => $billing['country'],
            'email' => $billing['email'],
            'phone' => $billing['phone'],
        );
        
        // 閼惧嘲褰囬柊宥夆偓浣告勾閸р偓
        $shipping = $order->get_address( 'shipping' );
        $order_data['shipping'] = array(
            'first_name' => $shipping['first_name'],
            'last_name' => $shipping['last_name'],
            'company' => $shipping['company'],
            'address_1' => $shipping['address_1'],
            'address_2' => $shipping['address_2'],
            'city' => $shipping['city'],
            'state' => $shipping['state'],
            'postcode' => $shipping['postcode'],
            'country' => $shipping['country'],
        );
        
        // 婵″倹鐏夐弰顖濐嚊閹懘銆夐敍灞惧潑閸旂姵娲挎径姘繆閹?        if ( $is_detail ) {
            // 閼惧嘲褰囩拋銏犲礋婢跺洦鏁?            $order_data['notes'] = $order->get_customer_note();
            
            // 閼惧嘲褰囩拋銏犲礋閹垮秳缍旈崢鍡楀蕉
            $order_data['order_history'] = $this->get_order_history( $order->get_id() );
            
            // 閼惧嘲褰囨导妯诲劕閸掗晲淇婇幁?            $coupons = array();
            foreach ( $order->get_coupon_codes() as $coupon_code ) {
                $coupons[] = $coupon_code;
            }
            
            $order_data['coupons'] = $coupons;
        }
        
        return $order_data;
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕鐠愵厾澧挎潪?     *
     * @param int $user_id 閻劍鍩汭D
     * @return array 鐠愵厾澧挎潪锔芥殶閹?     */
    private function get_user_cart( $user_id ) {
        $cart = get_user_meta( $user_id, '_sut_wechat_mini_cart', true );
        return $cart ? $cart : array();
    }
    
    /**
     * 娣囨繂鐡ㄩ悽銊﹀煕鐠愵厾澧挎潪?     *
     * @param int $user_id 閻劍鍩汭D
     * @param array $cart 鐠愵厾澧挎潪锔芥殶閹?     */
    private function save_user_cart( $user_id, $cart ) {
        update_user_meta( $user_id, '_sut_wechat_mini_cart', $cart );
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕閸︽澘娼?     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $address_id 閸︽澘娼僆D
     * @return object|null 閻劍鍩涢崷鏉挎絻鐎电钖?     */
    private function get_user_address( $user_id, $address_id ) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_addresses';
        
        $address = $wpdb->get_row( $wpdb->prepare( "
            SELECT * FROM $table_name 
            WHERE id = %d AND user_id = %d
        ", $address_id, $user_id ) );
        
        return $address;
    }
    
    /**
     * 鎼存梻鏁ゆ禍褍鎼ч弻銉嚄鏉╁洦鎶ら崳?     *
     * @param array $args 閺屻儴顕楅崣鍌涙殶
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @return array 鏉╁洦鎶ら崥搴ｆ畱閺屻儴顕楅崣鍌涙殶
     */
    private function apply_product_query_filters( $args, $data ) {
        // 閹稿鐜弽鍏煎笓鎼?        if ( isset( $data['sort_by'] ) && 'price' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_price';
            $args['order'] = isset( $data['sort_order'] ) && 'desc' === $data['sort_order'] ? 'DESC' : 'ASC';
        }
        
        // 閹稿鏀㈤柌蹇斿笓鎼?        if ( isset( $data['sort_by'] ) && 'sales' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = 'total_sales';
            $args['order'] = 'DESC';
        }
        
        // 閹稿鐦庨崚鍡樺笓鎼?        if ( isset( $data['sort_by'] ) && 'rating' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_wc_average_rating';
            $args['order'] = 'DESC';
        }
        
        // 娴犻攱鐗搁懠鍐ㄦ纯鏉╁洦鎶?        if ( isset( $data['min_price'] ) && isset( $data['max_price'] ) ) {
            $args['meta_query'][] = array(
                'key'     => '_price',
                'value'   => array( floatval( $data['min_price'] ), floatval( $data['max_price'] ) ),
                'compare' => 'BETWEEN',
                'type'    => 'NUMERIC',
            );
        }
        
        return $args;
    }
    
    /**
     * 閼惧嘲褰囩拋銏犲礋閸樺棗褰?     *
     * @param int $order_id 鐠併垹宕烮D
     * @return array 鐠併垹宕熼崢鍡楀蕉鐠佹澘缍?     */
    private function get_order_history( $order_id ) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'comments';
        
        $history = $wpdb->get_results( $wpdb->prepare( "
            SELECT comment_date, comment_content FROM $table_name 
            WHERE comment_post_ID = %d AND comment_type = 'order_note' AND comment_approved = '1'
            ORDER BY comment_date ASC
        ", $order_id ) );
        
        $formatted_history = array();
        foreach ( $history as $record ) {
            $formatted_history[] = array(
                'date' => $record->comment_date,
                'content' => $record->comment_content,
            );
        }
        
        return $formatted_history;
    }
    
    /**
     * XML鏉烆剚鏆熺紒?     *
     * @param string $xml XML鐎涙顑佹稉?     * @return array 鏉烆剚宕查崥搴ｆ畱閺佹壆绮?     */
    private function xml_to_array( $xml ) {
        $obj = simplexml_load_string( $xml, 'SimpleXMLElement', LIBXML_NOCDATA );
        $json = json_encode( $obj );
        $array = json_decode( $json, true );
        
        return $array;
    }
}

/**
 * 閸掓繂顫愰崠鏈﹐oCommerce闂嗗棙鍨? */
function sut_wechat_mini_woocommerce_init() {
    SUT_WeChat_Mini_WooCommerce::get_instance();
}

add_action( 'plugins_loaded', 'sut_wechat_mini_woocommerce_init' );\n