<?php
/**
 * SUT微信小程序WooCommerce集成类
 *
 * 处理WooCommerce产品的显示、购物车、订单管理等电商功能
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_WooCommerce 类
 */
class SUT_WeChat_Mini_WooCommerce {
    
    /**
     * WooCommerce集成实例
     *
     * @var SUT_WeChat_Mini_WooCommerce
     */
    private static $instance = null;
    
    /**
     * 默认每页显示数量
     *
     * @var int
     */
    private $default_per_page = 10;
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 获取单例实例
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
     * 初始化WooCommerce集成
     */
    private function init() {
        // 注册WooCommerce相关的API路由
        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_woocommerce_routes' ) );
        
        // 确保WooCommerce已激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }
    }
    
    /**
     * 添加WooCommerce相关的API路由
     *
     * @param array $routes 现有路由
     * @return array 修改后的路由
     */
    public function add_woocommerce_routes( $routes ) {
        // 产品相关API
        $routes['products'] = array( 'callback' => array( $this, 'api_get_products' ) );
        $routes['products/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_product' ) );
        $routes['products/search'] = array( 'callback' => array( $this, 'api_search_products' ) );
        $routes['products/categories'] = array( 'callback' => array( $this, 'api_get_product_categories' ) );
        $routes['products/categories/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_products_by_category' ) );
        $routes['products/related/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_related_products' ) );
        $routes['products/featured'] = array( 'callback' => array( $this, 'api_get_featured_products' ) );
        $routes['products/sale'] = array( 'callback' => array( $this, 'api_get_sale_products' ) );
        
        // 购物车相关API
        $routes['cart'] = array( 'callback' => array( $this, 'api_get_cart' ), 'auth' => true );
        $routes['cart/add'] = array( 'callback' => array( $this, 'api_add_to_cart' ), 'auth' => true );
        $routes['cart/update'] = array( 'callback' => array( $this, 'api_update_cart' ), 'auth' => true );
        $routes['cart/remove'] = array( 'callback' => array( $this, 'api_remove_from_cart' ), 'auth' => true );
        $routes['cart/clear'] = array( 'callback' => array( $this, 'api_clear_cart' ), 'auth' => true );
        
        // 订单相关API
        $routes['orders'] = array( 'callback' => array( $this, 'api_get_orders' ), 'auth' => true );
        $routes['orders/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_order' ), 'auth' => true );
        $routes['orders/create'] = array( 'callback' => array( $this, 'api_create_order' ), 'auth' => true );
        $routes['orders/cancel/([0-9]+)'] = array( 'callback' => array( $this, 'api_cancel_order' ), 'auth' => true );
        $routes['orders/confirm/([0-9]+)'] = array( 'callback' => array( $this, 'api_confirm_order' ), 'auth' => true );
        
        // 支付相关API
        $routes['payment/create'] = array( 'callback' => array( $this, 'api_create_payment' ), 'auth' => true );
        $routes['payment/notify'] = array( 'callback' => array( $this, 'api_payment_notify' ) );
        
        return $routes;
    }
    
    /**
     * 获取产品列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 产品列表
     */
    public function api_get_products( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 应用额外的查询条件
        $args = $this->apply_product_query_filters( $args, $data );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化产品数据
        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 获取单个产品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 产品详情
     */
    public function api_get_product( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $product_id = $matches[1];
        
        // 获取产品
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '产品不存在或未发布', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 格式化产品数据
        $formatted_product = $this->format_product( $product, true );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_product
        );
        
        return $result;
    }
    
    /**
     * 搜索产品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 搜索结果
     */
    public function api_search_products( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查搜索关键词
        if ( ! isset( $data['keyword'] ) || empty( $data['keyword'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少搜索关键词', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建搜索参数
        $args = array(
            's'              => $data['keyword'],
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'relevance',
            'order'          => 'DESC',
        );
        
        // 执行搜索
        $query = new WP_Query( $args );
        
        // 格式化产品数据
        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 获取产品分类列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 产品分类列表
     */
    public function api_get_product_categories( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取参数
        $parent = isset( $data['parent'] ) ? intval( $data['parent'] ) : 0;
        $hide_empty = isset( $data['hide_empty'] ) ? boolval( $data['hide_empty'] ) : true;
        
        // 构建查询参数
        $args = array(
            'taxonomy'   => 'product_cat',
            'parent'     => $parent,
            'hide_empty' => $hide_empty,
            'orderby'    => 'count',
            'order'      => 'DESC',
        );
        
        // 获取分类
        $categories = get_categories( $args );
        
        // 格式化分类数据
        $formatted_categories = array();
        foreach ( $categories as $category ) {
            // 获取分类图片
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
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_categories
        );
        
        return $result;
    }
    
    /**
     * 根据分类获取产品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 产品列表
     */
    public function api_get_products_by_category( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $category_id = $matches[1];
        
        // 检查分类是否存在
        $category = get_term( $category_id, 'product_cat' );
        if ( ! $category || is_wp_error( $category ) ) {
            return array(
                'code' => 104,
                'message' => __( '分类不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
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
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化产品数据
        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 获取相关产品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 相关产品列表
     */
    public function api_get_related_products( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $product_id = $matches[1];
        $number = isset( $data['number'] ) ? intval( $data['number'] ) : 5;
        
        // 获取产品
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '产品不存在或未发布', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取相关产品
        $related_ids = wc_get_related_products( $product_id, $number );
        
        // 格式化产品数据
        $products = array();
        foreach ( $related_ids as $related_id ) {
            $related_product = wc_get_product( $related_id );
            if ( $related_product && $related_product->is_published() ) {
                $products[] = $this->format_product( $related_product );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $products
        );
        
        return $result;
    }
    
    /**
     * 获取特色产品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 特色产品列表
     */
    public function api_get_featured_products( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
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
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化产品数据
        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 获取促销产品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 促销产品列表
     */
    public function api_get_sale_products( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
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
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化产品数据
        $products = array();
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            if ( $product && $product->is_on_sale() ) {
                $products[] = $this->format_product( $product );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 获取购物车
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 购物车数据
     */
    public function api_get_cart( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 获取用户购物车
        $cart = $this->get_user_cart( $user_id );
        
        // 计算购物车总价
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
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 添加商品到购物车
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 添加结果
     */
    public function api_add_to_cart( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查必要参数
        if ( ! isset( $data['product_id'] ) || ! isset( $data['quantity'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：product_id 或 quantity', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $product_id = $data['product_id'];
        $quantity = intval( $data['quantity'] );
        $variation_id = isset( $data['variation_id'] ) ? $data['variation_id'] : 0;
        $variation = isset( $data['variation'] ) ? $data['variation'] : array();
        
        // 检查产品是否存在
        $product = wc_get_product( $product_id );
        if ( ! $product || ! $product->is_published() ) {
            return array(
                'code' => 104,
                'message' => __( '产品不存在或未发布', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查库存
        if ( ! $product->has_enough_stock( $quantity ) ) {
            return array(
                'code' => 103,
                'message' => __( '库存不足', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取用户购物车
        $cart = $this->get_user_cart( $user_id );
        
        // 生成商品唯一ID
        $item_key = $product_id;
        if ( $variation_id || ! empty( $variation ) ) {
            $item_key .= '-' . md5( json_encode( $variation ) );
        }
        
        // 添加或更新购物车
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
        
        // 保存购物车
        $this->save_user_cart( $user_id, $cart );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '添加成功', 'sut-wechat-mini' ),
            'data' => array(
                'item_id' => $item_key,
                'quantity' => $cart[$item_key]['quantity']
            )
        );
        
        return $result;
    }
    
    /**
     * 更新购物车商品数量
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 更新结果
     */
    public function api_update_cart( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查必要参数
        if ( ! isset( $data['item_id'] ) || ! isset( $data['quantity'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：item_id 或 quantity', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $item_id = $data['item_id'];
        $quantity = intval( $data['quantity'] );
        
        // 获取用户购物车
        $cart = $this->get_user_cart( $user_id );
        
        // 检查商品是否在购物车中
        if ( ! isset( $cart[$item_id] ) ) {
            return array(
                'code' => 104,
                'message' => __( '购物车中没有此商品', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查库存
        $product_id = $cart[$item_id]['product_id'];
        $product = wc_get_product( $product_id );
        if ( $product && ! $product->has_enough_stock( $quantity ) ) {
            return array(
                'code' => 103,
                'message' => __( '库存不足', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 更新购物车
        $cart[$item_id]['quantity'] = $quantity;
        $cart[$item_id]['updated_at'] = current_time( 'mysql' );
        
        // 保存购物车
        $this->save_user_cart( $user_id, $cart );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '更新成功', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 从购物车移除商品
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 移除结果
     */
    public function api_remove_from_cart( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查必要参数
        if ( ! isset( $data['item_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：item_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $item_id = $data['item_id'];
        
        // 获取用户购物车
        $cart = $this->get_user_cart( $user_id );
        
        // 检查商品是否在购物车中
        if ( ! isset( $cart[$item_id] ) ) {
            return array(
                'code' => 104,
                'message' => __( '购物车中没有此商品', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 移除商品
        unset( $cart[$item_id] );
        
        // 保存购物车
        $this->save_user_cart( $user_id, $cart );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '移除成功', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 清空购物车
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 清空结果
     */
    public function api_clear_cart( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 清空购物车
        $this->save_user_cart( $user_id, array() );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '购物车已清空', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 获取用户订单列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 订单列表
     */
    public function api_get_orders( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
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
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化订单数据
        $orders = array();
        foreach ( $query->posts as $post ) {
            $order = wc_get_order( $post->ID );
            if ( $order ) {
                $orders[] = $this->format_order( $order );
            }
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 获取单个订单
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 订单详情
     */
    public function api_get_order( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 获取订单
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '订单不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单是否属于当前用户
        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '无权访问该订单', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 格式化订单数据
        $formatted_order = $this->format_order( $order, true );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_order
        );
        
        return $result;
    }
    
    /**
     * 创建订单
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 创建结果
     */
    public function api_create_order( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查必要参数
        if ( ! isset( $data['address_id'] ) || ! isset( $data['payment_method'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：address_id 或 payment_method', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $address_id = $data['address_id'];
        $payment_method = $data['payment_method'];
        $coupon_code = isset( $data['coupon_code'] ) ? $data['coupon_code'] : '';
        $remark = isset( $data['remark'] ) ? $data['remark'] : '';
        
        // 获取用户购物车
        $cart = $this->get_user_cart( $user_id );
        
        if ( empty( $cart ) ) {
            return array(
                'code' => 103,
                'message' => __( '购物车为空', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取用户地址
        $address = $this->get_user_address( $user_id, $address_id );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '地址不存在或不属于该用户', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 创建订单
        $order = wc_create_order();
        
        if ( ! $order ) {
            return array(
                'code' => 103,
                'message' => __( '订单创建失败', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 添加订单项
        foreach ( $cart as $item_key => $item ) {
            $product = wc_get_product( $item['product_id'] );
            
            if ( $product && $product->is_published() ) {
                // 检查库存
                if ( ! $product->has_enough_stock( $item['quantity'] ) ) {
                    $order->delete();
                    return array(
                        'code' => 103,
                        'message' => sprintf( __( '%s 库存不足', 'sut-wechat-mini' ), $product->get_name() ),
                        'data' => array()
                    );
                }
                
                // 添加商品到订单
                $order->add_product( $product, $item['quantity'] );
            }
        }
        
        // 设置订单地址
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
        
        // 设置支付方式
        $order->set_payment_method( $payment_method );
        
        // 应用优惠券
        if ( ! empty( $coupon_code ) ) {
            $coupon = new WC_Coupon( $coupon_code );
            if ( $coupon->is_valid() ) {
                $order->apply_coupon( $coupon_code );
            }
        }
        
        // 设置订单备注
        if ( ! empty( $remark ) ) {
            $order->add_order_note( $remark );
        }
        
        // 设置订单状态为待付款
        $order->set_status( 'pending' );
        
        // 设置订单客户
        $order->set_customer_id( $user_id );
        
        // 计算订单总价
        $order->calculate_totals();
        
        // 保存订单
        $order->save();
        
        // 清空购物车
        $this->save_user_cart( $user_id, array() );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '订单创建成功', 'sut-wechat-mini' ),
            'data' => array(
                'order_id' => $order->get_id(),
                'total_price' => $order->get_total(),
                'order_status' => $order->get_status()
            )
        );
        
        return $result;
    }
    
    /**
     * 取消订单
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 取消结果
     */
    public function api_cancel_order( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 获取订单
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '订单不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单是否属于当前用户
        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '无权访问该订单', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单状态是否可以取消
        $current_status = $order->get_status();
        if ( ! in_array( $current_status, array( 'pending', 'processing' ) ) ) {
            return array(
                'code' => 103,
                'message' => __( '该订单状态不允许取消', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 取消订单
        $order->update_status( 'cancelled', __( '用户取消订单', 'sut-wechat-mini' ) );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '订单已取消', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 确认收货
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 确认结果
     */
    public function api_confirm_order( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $matches[1];
        
        // 获取订单
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '订单不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单是否属于当前用户
        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '无权访问该订单', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单状态是否可以确认收货
        $current_status = $order->get_status();
        if ( 'completed' === $current_status ) {
            return array(
                'code' => 103,
                'message' => __( '订单已完成', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        if ( 'processing' !== $current_status && 'on-hold' !== $current_status ) {
            return array(
                'code' => 103,
                'message' => __( '该订单状态不允许确认收货', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 确认收货
        $order->update_status( 'completed', __( '用户确认收货', 'sut-wechat-mini' ) );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '确认收货成功', 'sut-wechat-mini' ),
            'data' => array()
        );
        
        return $result;
    }
    
    /**
     * 创建支付
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 支付信息
     */
    public function api_create_payment( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return array(
                'code' => 105,
                'message' => __( 'WooCommerce未激活', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查必要参数
        if ( ! isset( $data['order_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：order_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $user_id = $data['user_id'];
        $order_id = $data['order_id'];
        
        // 获取订单
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return array(
                'code' => 104,
                'message' => __( '订单不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单是否属于当前用户
        if ( $order->get_customer_id() != $user_id ) {
            return array(
                'code' => 108,
                'message' => __( '无权访问该订单', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单状态
        if ( 'pending' !== $order->get_status() ) {
            return array(
                'code' => 103,
                'message' => __( '订单状态不正确', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查订单金额
        $total = $order->get_total();
        if ( $total <= 0 ) {
            return array(
                'code' => 103,
                'message' => __( '订单金额不正确', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 创建微信支付
        $wechat_pay = SUT_WeChat_Mini_Pay::get_instance();
        $payment_params = $wechat_pay->create_payment( $order, $user_id );
        
        if ( is_wp_error( $payment_params ) ) {
            return array(
                'code' => 103,
                'message' => $payment_params->get_error_message(),
                'data' => array()
            );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '支付参数生成成功', 'sut-wechat-mini' ),
            'data' => $payment_params
        );
        
        return $result;
    }
    
    /**
     * 支付回调
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 回调结果
     */
    public function api_payment_notify( $data, $matches ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[WooCommerce未激活]]></return_msg></xml>';
            exit;
        }
        
        // 解析微信支付回调数据
        $xml_data = file_get_contents( 'php://input' );
        $data = $this->xml_to_array( $xml_data );
        
        // 验证签名
        $wechat_pay = SUT_WeChat_Mini_Pay::get_instance();
        $is_valid = $wechat_pay->verify_notify_sign( $data );
        
        if ( ! $is_valid ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>';
            exit;
        }
        
        // 获取订单信息
        $order_id = $data['out_trade_no'];
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>';
            exit;
        }
        
        // 检查订单状态
        if ( 'processing' === $order->get_status() || 'completed' === $order->get_status() ) {
            echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
            exit;
        }
        
        // 检查支付金额
        $total_fee = $data['total_fee'] / 100; // 微信支付金额是分
        if ( $total_fee != $order->get_total() ) {
            echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付金额不匹配]]></return_msg></xml>';
            exit;
        }
        
        // 更新订单状态
        $order->update_status( 'processing', __( '微信支付成功', 'sut-wechat-mini' ) );
        
        // 添加支付信息
        $order->add_meta_data( '_wechat_transaction_id', $data['transaction_id'], true );
        $order->add_meta_data( '_wechat_pay_time', $data['time_end'], true );
        $order->save();
        
        // 发送成功响应
        echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
        exit;
    }
    
    /**
     * 格式化产品数据
     *
     * @param WC_Product $product 产品对象
     * @param bool $is_detail 是否为详情页
     * @return array 格式化后的产品数据
     */
    private function format_product( $product, $is_detail = false ) {
        // 获取产品基本信息
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
        
        // 获取产品图片
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
        
        // 获取产品图库
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
        
        // 获取产品分类
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
        
        // 获取产品标签
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
        
        // 如果是详情页，添加更多信息
        if ( $is_detail ) {
            // 获取产品属性
            $attributes = array();
            $product_attributes = $product->get_attributes();
            foreach ( $product_attributes as $attribute_name => $attribute ) {
                $attributes[] = array(
                    'name' => wc_attribute_label( $attribute_name ),
                    'value' => $attribute->get_options(),
                );
            }
            
            $product_data['attributes'] = $attributes;
            
            // 处理产品类型
            if ( $product->is_type( 'variable' ) ) {
                // 获取产品变体
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
     * 格式化订单数据
     *
     * @param WC_Order $order 订单对象
     * @param bool $is_detail 是否为详情页
     * @return array 格式化后的订单数据
     */
    private function format_order( $order, $is_detail = false ) {
        // 获取订单基本信息
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
        
        // 获取订单商品
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
        
        // 获取账单地址
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
        
        // 获取配送地址
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
        
        // 如果是详情页，添加更多信息
        if ( $is_detail ) {
            // 获取订单备注
            $order_data['notes'] = $order->get_customer_note();
            
            // 获取订单操作历史
            $order_data['order_history'] = $this->get_order_history( $order->get_id() );
            
            // 获取优惠券信息
            $coupons = array();
            foreach ( $order->get_coupon_codes() as $coupon_code ) {
                $coupons[] = $coupon_code;
            }
            
            $order_data['coupons'] = $coupons;
        }
        
        return $order_data;
    }
    
    /**
     * 获取用户购物车
     *
     * @param int $user_id 用户ID
     * @return array 购物车数据
     */
    private function get_user_cart( $user_id ) {
        $cart = get_user_meta( $user_id, '_sut_wechat_mini_cart', true );
        return $cart ? $cart : array();
    }
    
    /**
     * 保存用户购物车
     *
     * @param int $user_id 用户ID
     * @param array $cart 购物车数据
     */
    private function save_user_cart( $user_id, $cart ) {
        update_user_meta( $user_id, '_sut_wechat_mini_cart', $cart );
    }
    
    /**
     * 获取用户地址
     *
     * @param int $user_id 用户ID
     * @param int $address_id 地址ID
     * @return object|null 用户地址对象
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
     * 应用产品查询过滤器
     *
     * @param array $args 查询参数
     * @param array $data 请求数据
     * @return array 过滤后的查询参数
     */
    private function apply_product_query_filters( $args, $data ) {
        // 按价格排序
        if ( isset( $data['sort_by'] ) && 'price' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_price';
            $args['order'] = isset( $data['sort_order'] ) && 'desc' === $data['sort_order'] ? 'DESC' : 'ASC';
        }
        
        // 按销量排序
        if ( isset( $data['sort_by'] ) && 'sales' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = 'total_sales';
            $args['order'] = 'DESC';
        }
        
        // 按评分排序
        if ( isset( $data['sort_by'] ) && 'rating' === $data['sort_by'] ) {
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_wc_average_rating';
            $args['order'] = 'DESC';
        }
        
        // 价格范围过滤
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
     * 获取订单历史
     *
     * @param int $order_id 订单ID
     * @return array 订单历史记录
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
     * XML转数组
     *
     * @param string $xml XML字符串
     * @return array 转换后的数组
     */
    private function xml_to_array( $xml ) {
        $obj = simplexml_load_string( $xml, 'SimpleXMLElement', LIBXML_NOCDATA );
        $json = json_encode( $obj );
        $array = json_decode( $json, true );
        
        return $array;
    }
}

/**
 * 初始化WooCommerce集成
 */
function sut_wechat_mini_woocommerce_init() {
    SUT_WeChat_Mini_WooCommerce::get_instance();
}

add_action( 'plugins_loaded', 'sut_wechat_mini_woocommerce_init' );