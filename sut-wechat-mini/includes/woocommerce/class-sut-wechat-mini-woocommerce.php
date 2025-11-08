<?php
/**
 * SUT寰俊灏忕▼搴廤ooCommerce闆嗘垚绫? *
 * 澶勭悊WooCommerce浜у搧鐨勬樉绀恒€佽喘鐗╄溅銆佽鍗曠鐞嗙瓑鐢靛晢鍔熻兘
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_WooCommerce 绫? */
class SUT_WeChat_Mini_WooCommerce {
    
    /**
     * WooCommerce闆嗘垚瀹炰緥
     *
     * @var SUT_WeChat_Mini_WooCommerce
     */
    private static $instance = null;
    
    /**
     * 榛樿姣忛〉鏄剧ず鏁伴噺
     *
     * @var int
     */
    private $default_per_page = 10;
    
    /**
     * 鏋勯€犲嚱鏁?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
     *
     * @return SUT_WeChat_Mini_WooCommerce
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 鍒濆鍖朩ooCommerce闆嗘垚
     */
    private function init() {
        // 娉ㄥ唽WooCommerce鐩稿叧鐨凙PI璺敱
        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_woocommerce_routes' ) );
        
        // 纭繚WooCommerce宸叉縺娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }
    }
    
    /**
     * 娣诲姞WooCommerce鐩稿叧鐨凙PI璺敱
     *
     * @param array $routes 鐜版湁璺敱
     * @return array 淇敼鍚庣殑璺敱
     */
    public function add_woocommerce_routes( $routes ) {
        // 浜у搧鐩稿叧API
        $routes['products'] = array( 'callback' => array( $this, 'api_get_products' ) );
        $routes['products/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_product' ) );
        $routes['products/search'] = array( 'callback' => array( $this, 'api_search_products' ) );
        $routes['products/categories'] = array( 'callback' => array( $this, 'api_get_product_categories' ) );
        $routes['products/categories/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_products_by_category' ) );
        $routes['products/related/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_related_products' ) );
        $routes['products/featured'] = array( 'callback' => array( $this, 'api_get_featured_products' ) );
        $routes['products/sale'] = array( 'callback' => array( $this, 'api_get_sale_products' ) );
        
        // 璐墿杞︾浉鍏矨PI
        $routes['cart'] = array( 'callback' => array( $this, 'api_get_cart' ), 'auth' => true );
        $routes['cart/add'] = array( 'callback' => array( $this, 'api_add_to_cart' ), 'auth' => true );
        $routes['cart/update'] = array( 'callback' => array( $this, 'api_update_cart' ), 'auth' => true );
        $routes['cart/remove'] = array( 'callback' => array( $this, 'api_remove_from_cart' ), 'auth' => true );
        $routes['cart/clear'] = array( 'callback' => array( $this, 'api_clear_cart' ), 'auth' => true );
        
        // 璁㈠崟鐩稿叧API
        $routes['orders'] = array( 'callback' => array( $this, 'api_get_orders' ), 'auth' => true );
        $routes['orders/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_order' ), 'auth' => true );
        $routes['orders/create'] = array( 'callback' => array( $this, 'api_create_order' ), 'auth' => true );
        $routes['orders/cancel/([0-9]+)'] = array( 'callback' => array( $this, 'api_cancel_order' ), 'auth' => true );
        $routes['orders/confirm/([0-9]+)'] = array( 'callback' => array( $this, 'api_confirm_order' ), 'auth' => true );
        
        // 鏀粯鐩稿叧API
        $routes['payment/create'] = array( 'callback' => array( $this, 'api_create_payment' ), 'auth' => true );
        $routes['payment/notify'] = array( 'callback' => array( $this, 'api_payment_notify' ) );
        
        return $routes;
    }
    
    /**
     * 鑾峰彇浜у搧鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 浜у搧鍒楄〃
     */
    public function api_get_products( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鍒嗛〉鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 搴旂敤棰濆鐨勬煡璇㈡潯浠?        $args = $this->apply_product_query_filters( $args, $data );
        
        // 鎵ц鏌ヨ
        $query = new WP_Query( $args );
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 鑾峰彇鍗曚釜浜у搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 浜у搧璇︽儏
     */
    public function api_get_product( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $product_id = $matches[1];
        
        // 鑾峰彇浜у搧
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '浜у搧涓嶅瓨鍦ㄦ垨鏈彂甯?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $formatted_product = $this->format_product( $product, true );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $formatted_product
        );
        
        return $result;
    }
    
    /**
     * 鎼滅储浜у搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鎼滅储缁撴灉
     */
    public function api_search_products( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ユ悳绱㈠叧閿瘝
        if ( ! isset( $data['keyword'] ) || empty( $data['keyword'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯鎼滅储鍏抽敭璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鍒嗛〉鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏋勫缓鎼滅储鍙傛暟
        $args = array(
            's'              => $data['keyword'],
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'relevance',
            'order'          => 'DESC',
        );
        
        // 鎵ц鎼滅储
        $query = new WP_Query( $args );
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 鑾峰彇浜у搧鍒嗙被鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 浜у搧鍒嗙被鍒楄〃
     */
    public function api_get_product_categories( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鍙傛暟
        $parent = isset( $data['parent'] ) ? intval( $data['parent'] ) : 0;
        $hide_empty = isset( $data['hide_empty'] ) ? boolval( $data['hide_empty'] ) : true;
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $args = array(
            'taxonomy'   => 'product_cat',
            'parent'     => $parent,
            'hide_empty' => $hide_empty,
            'orderby'    => 'count',
            'order'      => 'DESC',
        );
        
        // 鑾峰彇鍒嗙被
        $categories = get_categories( $args );
        
        // 鏍煎紡鍖栧垎绫绘暟鎹?        $formatted_categories = array();
        foreach ( $categories as $category ) {
            // 鑾峰彇鍒嗙被鍥剧墖
            $thumbnail_id = get_term_meta( $category->term_id, 'thumbnail_id', true );
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
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $formatted_categories
        );
        
        return $result;
    }
    
    /**
     * 鏍规嵁鍒嗙被鑾峰彇浜у搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 浜у搧鍒楄〃
     */
    public function api_get_products_by_category( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $category_id = $matches[1];
        
        // 妫€鏌ュ垎绫绘槸鍚﹀瓨鍦?        $category = get_term( $category_id, 'product_cat' );
        if ( ! $category || is_wp_error( $category ) ) {
            return array(
                'code' => 104,
                'message' => __( '鍒嗙被涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鍒嗛〉鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $args = array(
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
        
        // 鎵ц鏌ヨ
        $query = new WP_Query( $args );
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 鑾峰彇鐩稿叧浜у搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鐩稿叧浜у搧鍒楄〃
     */
    public function api_get_related_products( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $product_id = $matches[1];
        $number = isset( $data['number'] ) ? intval( $data['number'] ) : 5;
        
        // 鑾峰彇浜у搧
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '浜у搧涓嶅瓨鍦ㄦ垨鏈彂甯?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鐩稿叧浜у搧
        $related_ids = wc_get_related_products( $product_id, $number );
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $products = array();
        foreach ( $related_ids as $related_id ) {
            $related_product = wc_get_product( $related_id );
            if ( $related_product && $related_product->is_published() ) {
                $products[] = $this->format_product( $related_product );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $products
        );
        
        return $result;
    }
    
    /**
     * 鑾峰彇鐗硅壊浜у搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鐗硅壊浜у搧鍒楄〃
     */
    public function api_get_featured_products( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $args = array(
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
        
        // 鎵ц鏌ヨ
        $query = new WP_Query( $args );
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 鑾峰彇淇冮攢浜у搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 淇冮攢浜у搧鍒楄〃
     */
    public function api_get_sale_products( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $args = array(
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
        
        // 鎵ц鏌ヨ
        $query = new WP_Query( $args );
        
        // 鏍煎紡鍖栦骇鍝佹暟鎹?        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product && $product->is_on_sale() ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 鑾峰彇璐墿杞?     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 璐墿杞︽暟鎹?     */
    public function api_get_cart( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 鑾峰彇鐢ㄦ埛璐墿杞?        $cart = $this->get_user_cart( $user_id );
        
        // 璁＄畻璐墿杞︽€讳环
        $total_price = 0;
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
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 娣诲姞鍟嗗搧鍒拌喘鐗╄溅
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 娣诲姞缁撴灉
     */
    public function api_add_to_cart( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['product_id'] ) || ! isset( $data['quantity'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歱roduct_id 鎴?quantity', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $product_id = $data['product_id'];
        $quantity = intval( $data['quantity'] );
        $variation_id = isset( $data['variation_id'] ) ? $data['variation_id'] : 0;
        $variation = isset( $data['variation'] ) ? $data['variation'] : array();
        
        // 妫€鏌ヤ骇鍝佹槸鍚﹀瓨鍦?        $product = wc_get_product( $product_id );
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '浜у搧涓嶅瓨鍦ㄦ垨鏈彂甯?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ簱瀛?        if ( ! $product->has_enough_stock( $quantity ) ) {
            return array(
                'code' => 103,
                'message' => __( '搴撳瓨涓嶈冻', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鐢ㄦ埛璐墿杞?        $cart = $this->get_user_cart( $user_id );
        
        // 鐢熸垚鍟嗗搧鍞竴ID
        $item_key = $product_id;
        if ( $variation_id || ! empty( $variation ) ) {
            $item_key .= '-' . md5( json_encode( $variation ) );
        }
        
        // 娣诲姞鎴栨洿鏂拌喘鐗╄溅
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
        
        // 淇濆瓨璐墿杞?        $this->save_user_cart( $user_id, $cart );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '娣诲姞鎴愬姛', 'sut-wechat-mini' ),
            'data' => array(
                'item_id' => $item_key,
                'quantity' => $cart[$item_key]['quantity']
            )
        );
        
        return $result;
    }
    
    /**
     * 鏇存柊璐墿杞﹀晢鍝佹暟閲?     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鏇存柊缁撴灉
     */
    public function api_update_cart( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['item_id'] ) || ! isset( $data['quantity'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歩tem_id 鎴?quantity', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $item_id = $data['item_id'];
        $quantity = intval( $data['quantity'] );
        
        // 鑾峰彇鐢ㄦ埛璐墿杞?        $cart = $this->get_user_cart( $user_id );
        
        // 妫€鏌ュ晢鍝佹槸鍚﹀湪璐墿杞︿腑
        if ( ! isset( $cart[$item_id] ) ) {
            return array(
                'code' => 104,
                'message' => __( '璐墿杞︿腑娌℃湁姝ゅ晢鍝?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ簱瀛?        $product_id = $cart[$item_id]['product_id'];
        $product = wc_get_product( $product_id );
        if ( $product && ! $product->has_enough_stock( $quantity ) ) {
            return array(
                'code' => 103,
                'message' => __( '搴撳瓨涓嶈冻', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鏇存柊璐墿杞?        $cart[$item_id]['quantity'] = $quantity;
        $cart[$item_id]['updated_at'] = current_time( 'mysql' );
        
        // 淇濆瓨璐墿杞?        $this->save_user_cart( $user_id, $cart );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鏇存柊鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 浠庤喘鐗╄溅绉婚櫎鍟嗗搧
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 绉婚櫎缁撴灉
     */
    public function api_remove_from_cart( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['item_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歩tem_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $item_id = $data['item_id'];
        
        // 鑾峰彇鐢ㄦ埛璐墿杞?        $cart = $this->get_user_cart( $user_id );
        
        // 妫€鏌ュ晢鍝佹槸鍚﹀湪璐墿杞︿腑
        if ( ! isset( $cart[$item_id] ) ) {
            return array(
                'code' => 104,
                'message' => __( '璐墿杞︿腑娌℃湁姝ゅ晢鍝?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 绉婚櫎鍟嗗搧
        unset( $cart[$item_id] );
        
        // 淇濆瓨璐墿杞?        $this->save_user_cart( $user_id, $cart );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '绉婚櫎鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 娓呯┖璐墿杞?     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 娓呯┖缁撴灉
     */
    public function api_clear_cart( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 娓呯┖璐墿杞?        $this->save_user_cart( $user_id, array() );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '璐墿杞﹀凡娓呯┖', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛璁㈠崟鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 璁㈠崟鍒楄〃
     */
    public function api_get_orders( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 鑾峰彇鍒嗛〉鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $args = array(
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
        
        // 鎵ц鏌ヨ
        $query = new WP_Query( $args );
        
        // 鏍煎紡鍖栬鍗曟暟鎹?        $orders = array();
        foreach ( $query->posts as $post ) {
            $order = wc_get_order( $post->ID );
            if ( $order ) {
                $orders[] = $this->format_order( $order );
            }
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 鑾峰彇鍗曚釜璁㈠崟
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 璁㈠崟璇︽儏
     */
    public function api_get_order( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 鑾峰彇璁㈠崟
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '璁㈠崟涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曟槸鍚﹀睘浜庡綋鍓嶇敤鎴?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '鏃犳潈璁块棶璇ヨ鍗?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鏍煎紡鍖栬鍗曟暟鎹?        $formatted_order = $this->format_order( $order, true );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $formatted_order
        );
        
        return $result;
    }
    
    /**
     * 鍒涘缓璁㈠崟
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鍒涘缓缁撴灉
     */
    public function api_create_order( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['address_id'] ) || ! isset( $data['payment_method'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歛ddress_id 鎴?payment_method', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $address_id = $data['address_id'];
        $payment_method = $data['payment_method'];
        $coupon_code = isset( $data['coupon_code'] ) ? $data['coupon_code'] : '';
        $remark = isset( $data['remark'] ) ? $data['remark'] : '';
        
        // 鑾峰彇鐢ㄦ埛璐墿杞?        $cart = $this->get_user_cart( $user_id );
        
        if ( empty( $cart ) ) {
            return array(
                'code' => 103,
                'message' => __( '璐墿杞︿负绌?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇鐢ㄦ埛鍦板潃
        $address = $this->get_user_address( $user_id, $address_id );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '鍦板潃涓嶅瓨鍦ㄦ垨涓嶅睘浜庤鐢ㄦ埛', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鍒涘缓璁㈠崟
        $order = wc_create_order();
        
        if ( ! $order ) {
            return array(
                'code' => 103,
                'message' => __( '璁㈠崟鍒涘缓澶辫触', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 娣诲姞璁㈠崟椤?        foreach ( $cart as $item_key => $item ) {
            $product = wc_get_product( $item['product_id'] );
            
            if ( $product && $product->is_published() ) {
                // 妫€鏌ュ簱瀛?                if ( ! $product->has_enough_stock( $item['quantity'] ) ) {
                    $order->delete();
                    return array(
                        'code' => 103,
                        'message' => sprintf( __( '%s 搴撳瓨涓嶈冻', 'sut-wechat-mini' ), $product->get_name() ),
                        'data' => array()
                    );
                }
                
                // 娣诲姞鍟嗗搧鍒拌鍗?                $order->add_product( $product, $item['quantity'] );
            }
        }
        
        // 璁剧疆璁㈠崟鍦板潃
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
        
        // 璁剧疆鏀粯鏂瑰紡
        $order->set_payment_method( $payment_method );
        
        // 搴旂敤浼樻儬鍒?        if ( ! empty( $coupon_code ) ) {
            $coupon = new WC_Coupon( $coupon_code );
            if ( $coupon->is_valid() ) {
                $order->apply_coupon( $coupon_code );
            }
        }
        
        // 璁剧疆璁㈠崟澶囨敞
        if ( ! empty( $remark ) ) {
            $order->add_order_note( $remark );
        }
        
        // 璁剧疆璁㈠崟鐘舵€佷负寰呬粯娆?        $order->set_status( 'pending' );
        
        // 璁剧疆璁㈠崟瀹㈡埛
        $order->set_customer_id( $user_id );
        
        // 璁＄畻璁㈠崟鎬讳环
        $order->calculate_totals();
        
        // 淇濆瓨璁㈠崟
        $order->save();
        
        // 娓呯┖璐墿杞?        $this->save_user_cart( $user_id, array() );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '璁㈠崟鍒涘缓鎴愬姛', 'sut-wechat-mini' ),
            'data' => array(
                'order_id' => $order->get_id(),
                'total_price' => $order->get_total(),
                'order_status' => $order->get_status()
            )
        );
        
        return $result;
    }
    
    /**
     * 鍙栨秷璁㈠崟
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鍙栨秷缁撴灉
     */
    public function api_cancel_order( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 鑾峰彇璁㈠崟
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '璁㈠崟涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曟槸鍚﹀睘浜庡綋鍓嶇敤鎴?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '鏃犳潈璁块棶璇ヨ鍗?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曠姸鎬佹槸鍚﹀彲浠ュ彇娑?        $current_status = $order->get_status();
        if ( ! in_array( $current_status, array( 'pending', 'processing' ) ) ) {
            return array(
                'code' => 103,
                'message' => __( '璇ヨ鍗曠姸鎬佷笉鍏佽鍙栨秷', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鍙栨秷璁㈠崟
        $order->update_status( 'cancelled', __( '鐢ㄦ埛鍙栨秷璁㈠崟', 'sut-wechat-mini' ) );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '璁㈠崟宸插彇娑?, 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 纭鏀惰揣
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 纭缁撴灉
     */
    public function api_confirm_order( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 鑾峰彇璁㈠崟
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '璁㈠崟涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曟槸鍚﹀睘浜庡綋鍓嶇敤鎴?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '鏃犳潈璁块棶璇ヨ鍗?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曠姸鎬佹槸鍚﹀彲浠ョ‘璁ゆ敹璐?        $current_status = $order->get_status();
        if ( 'completed' === $current_status ) {
            return array(
                'code' => 103,
                'message' => __( '璁㈠崟宸插畬鎴?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        if ( 'processing' !== $current_status && 'on-hold' !== $current_status ) {
            return array(
                'code' => 103,
                'message' => __( '璇ヨ鍗曠姸鎬佷笉鍏佽纭鏀惰揣', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 纭鏀惰揣
        $order->update_status( 'completed', __( '鐢ㄦ埛纭鏀惰揣', 'sut-wechat-mini' ) );
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '纭鏀惰揣鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 鍒涘缓鏀粯
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鏀粯淇℃伅
     */
    public function api_create_payment( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce鏈縺娲?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['order_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歰rder_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $data['order_id'];
        
        // 鑾峰彇璁㈠崟
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '璁㈠崟涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曟槸鍚﹀睘浜庡綋鍓嶇敤鎴?        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '鏃犳潈璁块棶璇ヨ鍗?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曠姸鎬?        if ( 'pending' !== $order->get_status() ) {
            return array(
                'code' => 103,
                'message' => __( '璁㈠崟鐘舵€佷笉姝ｇ‘', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ヨ鍗曢噾棰?        $total = $order->get_total();
        if ( $total <= 0 ) {
            return array(
                'code' => 103,
                'message' => __( '璁㈠崟閲戦涓嶆纭?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鍒涘缓寰俊鏀粯
        $wechat_pay = SUT_WeChat_Mini_Pay::get_instance();
        $payment_params = $wechat_pay->create_payment( $order, $user_id );
        
        if ( is_wp_error( $payment_params ) ) {
            return array(
                'code' => 103,
                'message' => $payment_params->get_error_message(),
                'data' => array()
            );
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $result = array(
            'code' => 0,
            'message' => __( '鏀粯鍙傛暟鐢熸垚鎴愬姛', 'sut-wechat-mini' ),
            'data' => $payment_params
        );
        
        return $result;
    }
    
    /**
     * 鏀粯鍥炶皟
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鍥炶皟缁撴灉
     */
    public function api_payment_notify( $data, $matches ) {
        // 妫€鏌ooCommerce鏄惁婵€娲?        if ( ! class_exists( 'WooCommerce' ) ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[WooCommerce鏈縺娲籡]></return_msg></xml>';
            exit;
        }
        
        // 瑙ｆ瀽寰俊鏀粯鍥炶皟鏁版嵁
        $xml_data = file_get_contents( 'php://input' );
        $data = $this->xml_to_array( $xml_data );
        
        // 楠岃瘉绛惧悕
        $wechat_pay = SUT_WeChat_Mini_Pay::get_instance();
        $is_valid = $wechat_pay->verify_notify_sign( $data );
        
        if ( ! $is_valid ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[绛惧悕楠岃瘉澶辫触]]></return_msg></xml>';
            exit;
        }
        
        // 鑾峰彇璁㈠崟淇℃伅
        $order_id = $data['out_trade_no'];
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[璁㈠崟涓嶅瓨鍦╙]></return_msg></xml>';
            exit;
        }
        
        // 妫€鏌ヨ鍗曠姸鎬?        if ( 'processing' === $order->get_status() || 'completed' === $order->get_status() ) {
            echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
            exit;
        }
        
        // 妫€鏌ユ敮浠橀噾棰?        $total_fee = $data['total_fee'] / 100; // 寰俊鏀粯閲戦鏄垎
        if ( $total_fee != $order->get_total() ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[鏀粯閲戦涓嶅尮閰峕]></return_msg></xml>';
            exit;
        }
        
        // 鏇存柊璁㈠崟鐘舵€?        $order->update_status( 'processing', __( '寰俊鏀粯鎴愬姛', 'sut-wechat-mini' ) );
        
        // 娣诲姞鏀粯淇℃伅
        $order->add_meta_data( '_wechat_transaction_id', $data['transaction_id'], true );
        $order->add_meta_data( '_wechat_pay_time', $data['time_end'], true );
        $order->save();
        
        // 鍙戦€佹垚鍔熷搷搴?        echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
        exit;
    }
    
    /**
     * 鏍煎紡鍖栦骇鍝佹暟鎹?     *
     * @param WC_Product $product 浜у搧瀵硅薄
     * @param bool $is_detail 鏄惁涓鸿鎯呴〉
     * @return array 鏍煎紡鍖栧悗鐨勪骇鍝佹暟鎹?     */
    private function format_product( $product, $is_detail = false ) {
        // 鑾峰彇浜у搧鍩烘湰淇℃伅
        $product_data = array(
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
        
        // 鑾峰彇浜у搧鍥剧墖
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
        
        // 鑾峰彇浜у搧鍥惧簱
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
        
        // 鑾峰彇浜у搧鍒嗙被
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
        
        // 鑾峰彇浜у搧鏍囩
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
        
        // 濡傛灉鏄鎯呴〉锛屾坊鍔犳洿澶氫俊鎭?        if ( $is_detail ) {
            // 鑾峰彇浜у搧灞炴€?            $attributes = array();
            $product_attributes = $product->get_attributes();
            foreach ( $product_attributes as $attribute_name => $attribute ) {
                $attributes[] = array(
                    'name' => wc_attribute_label( $attribute_name ),
                    'value' => $attribute->get_options(),
                );
            }
            
            $product_data['attributes'] = $attributes;
            
            // 澶勭悊浜у搧绫诲瀷
            if ( $product->is_type( 'variable' ) ) {
                // 鑾峰彇浜у搧鍙樹綋
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
     * 鏍煎紡鍖栬鍗曟暟鎹?     *
     * @param WC_Order $order 璁㈠崟瀵硅薄
     * @param bool $is_detail 鏄惁涓鸿鎯呴〉
     * @return array 鏍煎紡鍖栧悗鐨勮鍗曟暟鎹?     */
    private function format_order( $order, $is_detail = false ) {
        // 鑾峰彇璁㈠崟鍩烘湰淇℃伅
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
        
        // 鑾峰彇璁㈠崟鍟嗗搧
        $order_items = array();
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
        
        // 鑾峰彇璐﹀崟鍦板潃
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
        
        // 鑾峰彇閰嶉€佸湴鍧€
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
        
        // 濡傛灉鏄鎯呴〉锛屾坊鍔犳洿澶氫俊鎭?        if ( $is_detail ) {
            // 鑾峰彇璁㈠崟澶囨敞
            $order_data['notes'] = $order->get_customer_note();
            
            // 鑾峰彇璁㈠崟鎿嶄綔鍘嗗彶
            $order_data['order_history'] = $this->get_order_history( $order->get_id() );
            
            // 鑾峰彇浼樻儬鍒镐俊鎭?            $coupons = array();
            foreach ( $order->get_coupon_codes() as $coupon_code ) {
                $coupons[] = $coupon_code;
            }
            
            $order_data['coupons'] = $coupons;
        }
        
        return $order_data;
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛璐墿杞?     *
     * @param int $user_id 鐢ㄦ埛ID
     * @return array 璐墿杞︽暟鎹?     */
    private function get_user_cart( $user_id ) {
        $cart = get_user_meta( $user_id, '_sut_wechat_mini_cart', true );
        return $cart ? $cart : array();
    }
    
    /**
     * 淇濆瓨鐢ㄦ埛璐墿杞?     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param array $cart 璐墿杞︽暟鎹?     */
    private function save_user_cart( $user_id, $cart ) {
        update_user_meta( $user_id, '_sut_wechat_mini_cart', $cart );
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛鍦板潃
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $address_id 鍦板潃ID
     * @return object|null 鐢ㄦ埛鍦板潃瀵硅薄
     */
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
     * 搴旂敤浜у搧鏌ヨ杩囨护鍣?     *
     * @param array $args 鏌ヨ鍙傛暟
     * @param array $data 璇锋眰鏁版嵁
     * @return array 杩囨护鍚庣殑鏌ヨ鍙傛暟
     */
    private function apply_product_query_filters( $args, $data ) {
        // 鎸変环鏍兼帓搴?        if ( isset( $data['sort_by'] ) && 'price' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_price';
            $args['order'] = isset( $data['sort_order'] ) && 'desc' === $data['sort_order'] ? 'DESC' : 'ASC';
        }
        
        // 鎸夐攢閲忔帓搴?        if ( isset( $data['sort_by'] ) && 'sales' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = 'total_sales';
            $args['order'] = 'DESC';
        }
        
        // 鎸夎瘎鍒嗘帓搴?        if ( isset( $data['sort_by'] ) && 'rating' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_wc_average_rating';
            $args['order'] = 'DESC';
        }
        
        // 浠锋牸鑼冨洿杩囨护
        if ( isset( $data['min_price'] ) && isset( $data['max_price'] ) ) {
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
     * 鑾峰彇璁㈠崟鍘嗗彶
     *
     * @param int $order_id 璁㈠崟ID
     * @return array 璁㈠崟鍘嗗彶璁板綍
     */
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
     * XML杞暟缁?     *
     * @param string $xml XML瀛楃涓?     * @return array 杞崲鍚庣殑鏁扮粍
     */
    private function xml_to_array( $xml ) {
        $obj = simplexml_load_string( $xml, 'SimpleXMLElement', LIBXML_NOCDATA );
        $json = json_encode( $obj );
        $array = json_decode( $json, true );
        
        return $array;
    }
}

/**
 * 鍒濆鍖朩ooCommerce闆嗘垚
 */
function sut_wechat_mini_woocommerce_init() {
    SUT_WeChat_Mini_WooCommerce::get_instance();
}

add_action( 'plugins_loaded', 'sut_wechat_mini_woocommerce_init' );\n