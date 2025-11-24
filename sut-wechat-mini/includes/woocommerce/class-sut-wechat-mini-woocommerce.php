<?php
/**
 * 文件名: class-sut-wechat-mini-woocommerce.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * WooCommerce集成类
 * 
 * 提供微信小程序与WooCommerce的集成功能，包括商品同步、订单处理、支付集成等
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * WooCommerce集成类
 */
class Sut_WeChat_Mini_WooCommerce {
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 初始化
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_WooCommerce WooCommerce集成实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化WooCommerce集成
     * 
     * @return void
     */
    public function init() {
        // 检查WooCommerce是否激活
        if (!$this->is_woocommerce_active()) {
            return;
        }
        
        // 注册钩子
        $this->register_hooks();
        
        // 注册REST API路由
        $this->register_api_routes();
    }
    
    /**
     * 检查WooCommerce是否激活
     * 
     * @return bool 是否激活
     */
    public function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }
    
    /**
     * 注册钩子
     * 
     * @return void
     */
    private function register_hooks() {
        // 订单状态变更钩子
        add_action('woocommerce_order_status_changed', array($this, 'on_order_status_changed'), 10, 4);
        
        // 新订单创建钩子
        add_action('woocommerce_new_order', array($this, 'on_new_order'), 10, 1);
        
        // 支付完成钩子
        add_action('woocommerce_payment_complete', array($this, 'on_payment_complete'), 10, 1);
        
        // 商品更新钩子
        add_action('woocommerce_update_product', array($this, 'on_product_updated'), 10, 2);
        
        // 商品删除钩子
        add_action('woocommerce_before_delete_product', array($this, 'on_product_deleted'), 10, 1);
        
        // 用户注册钩子
        add_action('woocommerce_new_customer', array($this, 'on_new_customer'), 10, 1);
        
        // 购物车更新钩子
        add_action('woocommerce_add_to_cart', array($this, 'on_cart_updated'), 10, 6);
        add_action('woocommerce_cart_item_removed', array($this, 'on_cart_updated'), 10, 0);
        
        // 优惠券使用钩子
        add_action('woocommerce_applied_coupon', array($this, 'on_coupon_applied'), 10, 1);
        
        // 评价钩子
        add_action('woocommerce_review_status_approved', array($this, 'on_review_approved'), 10, 1);
        add_action('woocommerce_review_status_pending', array($this, 'on_review_pending'), 10, 1);
    }
    
    /**
     * 注册REST API路由
     * 
     * @return void
     */
    private function register_api_routes() {
        // 商品相关路由
        register_rest_route('sut-wechat-mini/v1', '/products', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_products'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/products/(?P<id>\d+)', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_product'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/products/search', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'search_products'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 订单相关路由
        register_rest_route('sut-wechat-mini/v1', '/orders', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_orders'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
            array(
                'methods' => 'POST',
                'callback' => array($this, 'create_order'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/orders/(?P<id>\d+)', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_order'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 购物车相关路由
        register_rest_route('sut-wechat-mini/v1', '/cart', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_cart'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
            array(
                'methods' => 'POST',
                'callback' => array($this, 'update_cart'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/cart/add', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'add_to_cart'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/cart/remove', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'remove_from_cart'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 优惠券相关路由
        register_rest_route('sut-wechat-mini/v1', '/coupons/validate', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'validate_coupon'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 支付相关路由
        register_rest_route('sut-wechat-mini/v1', '/payment/methods', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_payment_methods'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/payment/process', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'process_payment'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 分类相关路由
        register_rest_route('sut-wechat-mini/v1', '/categories', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_categories'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/categories/(?P<id>\d+)/products', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_category_products'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 评价相关路由
        register_rest_route('sut-wechat-mini/v1', '/reviews', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'create_review'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/products/(?P<id>\d+)/reviews', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_product_reviews'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
    }
    
    /**
     * 检查API权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 是否有权限
     */
    public function check_api_permission($request) {
        // 获取JWT令牌
        $token = $request->get_header('Authorization');
        
        if (!$token) {
            return new WP_Error('unauthorized', '缺少授权令牌', array('status' => 401));
        }
        
        // 移除Bearer前缀
        $token = str_replace('Bearer ', '', $token);
        
        // 获取工具函数实例
        $utils = Sut_WeChat_Mini_Utils::get_instance();
        
        // 获取JWT密钥
        $jwt_key = get_option('sut_wechat_mini_jwt_key', '');
        
        if (empty($jwt_key)) {
            return new WP_Error('unauthorized', 'JWT密钥未设置', array('status' => 401));
        }
        
        // 验证令牌
        $payload = $utils->verify_jwt($token, $jwt_key);
        
        if (!$payload) {
            return new WP_Error('unauthorized', '无效的授权令牌', array('status' => 401));
        }
        
        // 将用户ID添加到请求中
        $request->set_param('user_id', $payload->user_id);
        
        return true;
    }
    
    /**
     * 获取商品列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_products($request) {
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $category = $request->get_param('category');
        $orderby = $request->get_param('orderby') ?: 'date';
        $order = $request->get_param('order') ?: 'DESC';
        $featured = $request->get_param('featured');
        $on_sale = $request->get_param('on_sale');
        
        $args = array(
            'status' => 'publish',
            'limit' => $per_page,
            'page' => $page,
            'orderby' => $orderby,
            'order' => $order,
        );
        
        if ($category) {
            $args['category'] = array($category);
        }
        
        if ($featured) {
            $args['featured'] = true;
        }
        
        if ($on_sale) {
            $args['on_sale'] = true;
        }
        
        $products = wc_get_products($args);
        
        $data = array();
        
        foreach ($products as $product) {
            $data[] = $this->format_product_data($product);
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total = wc_get_products(array('status' => 'publish', 'limit' => -1));
        $total_pages = ceil(count($total) / $per_page);
        
        $response->header('X-WP-Total', count($total));
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 获取单个商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_product($request) {
        $product_id = $request->get_param('id');
        
        $product = wc_get_product($product_id);
        
        if (!$product) {
            return new WP_Error('not_found', '商品不存在', array('status' => 404));
        }
        
        $data = $this->format_product_data($product, true);
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 搜索商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function search_products($request) {
        $keyword = $request->get_param('keyword');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        if (empty($keyword)) {
            return new WP_Error('missing_parameter', '缺少搜索关键词', array('status' => 400));
        }
        
        $args = array(
            'status' => 'publish',
            'limit' => $per_page,
            'page' => $page,
            's' => $keyword,
        );
        
        $products = wc_get_products($args);
        
        $data = array();
        
        foreach ($products as $product) {
            $data[] = $this->format_product_data($product);
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total = wc_get_products(array('status' => 'publish', 'limit' => -1, 's' => $keyword));
        $total_pages = ceil(count($total) / $per_page);
        
        $response->header('X-WP-Total', count($total));
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 格式化商品数据
     * 
     * @param WC_Product $product 商品对象
     * @param bool $detailed 是否获取详细信息
     * @return array 格式化后的商品数据
     */
    private function format_product_data($product, $detailed = false) {
        $data = array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'on_sale' => $product->is_on_sale(),
            'featured' => $product->is_featured(),
            'stock_status' => $product->get_stock_status(),
            'stock_quantity' => $product->get_stock_quantity(),
            'manage_stock' => $product->get_manage_stock(),
            'average_rating' => $product->get_average_rating(),
            'rating_count' => $product->get_rating_count(),
            'categories' => array(),
            'tags' => array(),
            'images' => array(),
            'date_created' => $product->get_date_created()->format('Y-m-d H:i:s'),
            'date_modified' => $product->get_date_modified()->format('Y-m-d H:i:s'),
        );
        
        // 获取分类
        $categories = wp_get_post_terms($product->get_id(), 'product_cat');
        foreach ($categories as $category) {
            $data['categories'][] = array(
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
            );
        }
        
        // 获取标签
        $tags = wp_get_post_terms($product->get_id(), 'product_tag');
        foreach ($tags as $tag) {
            $data['tags'][] = array(
                'id' => $tag->term_id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            );
        }
        
        // 获取图片
        $image_id = $product->get_image_id();
        if ($image_id) {
            $image = wp_get_attachment_image_src($image_id, 'full');
            if ($image) {
                $data['images'][] = array(
                    'id' => $image_id,
                    'src' => $image[0],
                    'width' => $image[1],
                    'height' => $image[2],
                );
            }
        }
        
        // 获取图库图片
        $gallery_ids = $product->get_gallery_image_ids();
        foreach ($gallery_ids as $gallery_id) {
            $gallery_image = wp_get_attachment_image_src($gallery_id, 'full');
            if ($gallery_image) {
                $data['images'][] = array(
                    'id' => $gallery_id,
                    'src' => $gallery_image[0],
                    'width' => $gallery_image[1],
                    'height' => $gallery_image[2],
                );
            }
        }
        
        // 如果是变体商品，获取变体
        if ($product->is_type('variable') && $detailed) {
            $variations = $product->get_available_variations();
            $data['variations'] = array();
            
            foreach ($variations as $variation) {
                $variation_obj = wc_get_product($variation['variation_id']);
                $variation_data = array(
                    'id' => $variation['variation_id'],
                    'sku' => $variation['sku'],
                    'price' => $variation['display_price'],
                    'regular_price' => $variation['display_regular_price'],
                    'sale_price' => $variation['display_price'] < $variation['display_regular_price'] ? $variation['display_price'] : '',
                    'attributes' => $variation['attributes'],
                    'image' => $variation['image'],
                    'is_in_stock' => $variation['is_in_stock'],
                    'max_qty' => $variation['max_qty'],
                );
                
                $data['variations'][] = $variation_data;
            }
            
            // 获取属性
            $attributes = $product->get_attributes();
            $data['attributes'] = array();
            
            foreach ($attributes as $attribute) {
                $attribute_data = array(
                    'id' => $attribute->get_id(),
                    'name' => $attribute->get_name(),
                    'options' => $attribute->get_options(),
                    'position' => $attribute->get_position(),
                    'visible' => $attribute->get_visible(),
                    'variation' => $attribute->get_variation(),
                );
                
                $data['attributes'][] = $attribute_data;
            }
        }
        
        // 如果需要详细信息，添加描述
        if ($detailed) {
            $data['description'] = $product->get_description();
            $data['short_description'] = $product->get_short_description();
            $data['sku'] = $product->get_sku();
            $data['weight'] = $product->get_weight();
            $data['dimensions'] = array(
                'length' => $product->get_length(),
                'width' => $product->get_width(),
                'height' => $product->get_height(),
            );
            $data['shipping_class'] = $product->get_shipping_class();
            $data['shipping_class_id'] = $product->get_shipping_class_id();
            $data['purchase_note'] = $product->get_purchase_note();
            $data['menu_order'] = $product->get_menu_order();
            $data['reviews_allowed'] = $product->get_reviews_allowed();
            $data['backorders_allowed'] = $product->get_backorders_allowed();
            $data['sold_individually'] = $product->is_sold_individually();
            $data['virtual'] = $product->is_virtual();
            $data['downloadable'] = $product->is_downloadable();
            
            // 如果是可下载商品，获取下载信息
            if ($product->is_downloadable()) {
                $downloads = $product->get_downloads();
                $data['downloads'] = array();
                
                foreach ($downloads as $download) {
                    $data['downloads'][] = array(
                        'id' => $download->get_id(),
                        'name' => $download->get_name(),
                        'file' => $download->get_file(),
                    );
                }
            }
        }
        
        return $data;
    }
    
    /**
     * 获取订单列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_orders($request) {
        $user_id = $request->get_param('user_id');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $status = $request->get_param('status');
        
        $args = array(
            'customer_id' => $user_id,
            'limit' => $per_page,
            'page' => $page,
        );
        
        if ($status) {
            $args['status'] = $status;
        }
        
        $orders = wc_get_orders($args);
        
        $data = array();
        
        foreach ($orders as $order) {
            $data[] = $this->format_order_data($order);
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total = wc_get_orders(array('customer_id' => $user_id, 'limit' => -1));
        $total_pages = ceil(count($total) / $per_page);
        
        $response->header('X-WP-Total', count($total));
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 获取单个订单
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_order($request) {
        $order_id = $request->get_param('id');
        $user_id = $request->get_param('user_id');
        
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return new WP_Error('not_found', '订单不存在', array('status' => 404));
        }
        
        // 检查订单是否属于当前用户
        if ($order->get_customer_id() != $user_id) {
            return new WP_Error('forbidden', '无权访问此订单', array('status' => 403));
        }
        
        $data = $this->format_order_data($order, true);
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 创建订单
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function create_order($request) {
        $user_id = $request->get_param('user_id');
        $cart_data = $request->get_param('cart_data');
        $shipping_address = $request->get_param('shipping_address');
        $billing_address = $request->get_param('billing_address');
        $payment_method = $request->get_param('payment_method');
        $coupon_code = $request->get_param('coupon_code');
        
        // 验证必要参数
        if (empty($cart_data) || empty($shipping_address) || empty($billing_address)) {
            return new WP_Error('missing_parameter', '缺少必要参数', array('status' => 400));
        }
        
        // 创建订单
        $order = wc_create_order(array(
            'customer_id' => $user_id,
            'status' => 'pending',
        ));
        
        // 添加商品到订单
        foreach ($cart_data as $item) {
            $product = wc_get_product($item['product_id']);
            
            if (!$product) {
                $order->delete(true);
                return new WP_Error('invalid_product', '商品不存在: ' . $item['product_id'], array('status' => 400));
            }
            
            $quantity = isset($item['quantity']) ? $item['quantity'] : 1;
            
            $order->add_product($product, $quantity);
        }
        
        // 设置收货地址
        $order->set_address($shipping_address, 'shipping');
        $order->set_address($billing_address, 'billing');
        
        // 设置支付方式
        if ($payment_method) {
            $order->set_payment_method($payment_method);
        }
        
        // 应用优惠券
        if ($coupon_code) {
            $order->apply_coupon($coupon_code);
        }
        
        // 计算总额
        $order->calculate_totals();
        
        // 保存订单
        $order->save();
        
        // 返回订单数据
        $data = $this->format_order_data($order, true);
        
        return new WP_REST_Response($data, 201);
    }
    
    /**
     * 格式化订单数据
     * 
     * @param WC_Order $order 订单对象
     * @param bool $detailed 是否获取详细信息
     * @return array 格式化后的订单数据
     */
    private function format_order_data($order, $detailed = false) {
        $data = array(
            'id' => $order->get_id(),
            'status' => $order->get_status(),
            'total' => $order->get_total(),
            'subtotal' => $order->get_subtotal(),
            'total_tax' => $order->get_total_tax(),
            'shipping_total' => $order->get_shipping_total(),
            'discount_total' => $order->get_discount_total(),
            'currency' => $order->get_currency(),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),
            'transaction_id' => $order->get_transaction_id(),
            'customer_id' => $order->get_customer_id(),
            'customer_note' => $order->get_customer_note(),
            'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'date_modified' => $order->get_date_modified()->format('Y-m-d H:i:s'),
        );
        
        // 如果需要详细信息，添加更多信息
        if ($detailed) {
            // 获取订单商品
            $items = $order->get_items();
            $data['line_items'] = array();
            
            foreach ($items as $item_id => $item) {
                $product = $item->get_product();
                
                $data['line_items'][] = array(
                    'id' => $item_id,
                    'name' => $item->get_name(),
                    'product_id' => $item->get_product_id(),
                    'variation_id' => $item->get_variation_id(),
                    'quantity' => $item->get_quantity(),
                    'subtotal' => $item->get_subtotal(),
                    'subtotal_tax' => $item->get_subtotal_tax(),
                    'total' => $item->get_total(),
                    'total_tax' => $item->get_total_tax(),
                    'tax_class' => $item->get_tax_class(),
                    'tax_status' => $item->get_tax_status(),
                    'product' => $product ? array(
                        'id' => $product->get_id(),
                        'name' => $product->get_name(),
                        'sku' => $product->get_sku(),
                        'price' => $product->get_price(),
                        'image' => wp_get_attachment_image_src($product->get_image_id(), 'thumbnail'),
                    ) : null,
                );
            }
            
            // 获取收货地址
            $data['shipping'] = array(
                'first_name' => $order->get_shipping_first_name(),
                'last_name' => $order->get_shipping_last_name(),
                'company' => $order->get_shipping_company(),
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
                'country' => $order->get_shipping_country(),
            );
            
            // 获取账单地址
            $data['billing'] = array(
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'company' => $order->get_billing_company(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
            );
            
            // 获取优惠券信息
            $coupons = $order->get_coupons();
            $data['coupon_lines'] = array();
            
            foreach ($coupons as $coupon) {
                $data['coupon_lines'][] = array(
                    'code' => $coupon->get_code(),
                    'discount' => $coupon->get_discount(),
                    'discount_tax' => $coupon->get_discount_tax(),
                );
            }
            
            // 获取运费信息
            $shipping_methods = $order->get_shipping_methods();
            $data['shipping_lines'] = array();
            
            foreach ($shipping_methods as $shipping_method) {
                $data['shipping_lines'][] = array(
                    'id' => $shipping_method->get_id(),
                    'method_title' => $shipping_method->get_method_title(),
                    'total' => $shipping_method->get_total(),
                    'total_tax' => $shipping_method->get_total_tax(),
                );
            }
            
            // 获取费用信息
            $fees = $order->get_fees();
            $data['fee_lines'] = array();
            
            foreach ($fees as $fee) {
                $data['fee_lines'][] = array(
                    'id' => $fee->get_id(),
                    'name' => $fee->get_name(),
                    'total' => $fee->get_total(),
                    'total_tax' => $fee->get_total_tax(),
                    'tax_class' => $fee->get_tax_class(),
                    'tax_status' => $fee->get_tax_status(),
                );
            }
            
            // 获取税费信息
            $tax_lines = $order->get_tax_lines();
            $data['tax_lines'] = array();
            
            foreach ($tax_lines as $tax) {
                $data['tax_lines'][] = array(
                    'id' => $tax->get_id(),
                    'rate_id' => $tax->get_rate_id(),
                    'label' => $tax->get_label(),
                    'tax_total' => $tax->get_tax_total(),
                    'shipping_tax_total' => $tax->get_shipping_tax_total(),
                );
            }
        }
        
        return $data;
    }
    
    /**
     * 获取购物车
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_cart($request) {
        $user_id = $request->get_param('user_id');
        
        // 初始化购物车
        WC()->cart->empty_cart();
        
        // 加载用户的购物车
        $this->load_user_cart($user_id);
        
        // 格式化购物车数据
        $data = $this->format_cart_data();
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 更新购物车
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function update_cart($request) {
        $user_id = $request->get_param('user_id');
        $cart_key = $request->get_param('cart_key');
        $quantity = $request->get_param('quantity');
        
        // 初始化购物车
        WC()->cart->empty_cart();
        
        // 加载用户的购物车
        $this->load_user_cart($user_id);
        
        // 更新商品数量
        if ($cart_key && $quantity !== null) {
            $result = WC()->cart->set_quantity($cart_key, $quantity);
            
            if (!$result) {
                return new WP_Error('invalid_cart_key', '无效的购物车商品键', array('status' => 400));
            }
        }
        
        // 保存购物车
        $this->save_user_cart($user_id);
        
        // 格式化购物车数据
        $data = $this->format_cart_data();
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 添加商品到购物车
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function add_to_cart($request) {
        $user_id = $request->get_param('user_id');
        $product_id = $request->get_param('product_id');
        $quantity = $request->get_param('quantity') ?: 1;
        $variation_id = $request->get_param('variation_id');
        $variation = $request->get_param('variation');
        
        // 验证商品
        $product = wc_get_product($product_id);
        
        if (!$product) {
            return new WP_Error('invalid_product', '商品不存在', array('status' => 400));
        }
        
        // 初始化购物车
        WC()->cart->empty_cart();
        
        // 加载用户的购物车
        $this->load_user_cart($user_id);
        
        // 添加商品到购物车
        $result = WC()->cart->add_to_cart($product_id, $quantity, $variation_id, $variation);
        
        if (!$result) {
            return new WP_Error('add_to_cart_failed', '添加到购物车失败', array('status' => 400));
        }
        
        // 保存购物车
        $this->save_user_cart($user_id);
        
        // 格式化购物车数据
        $data = $this->format_cart_data();
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 从购物车移除商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function remove_from_cart($request) {
        $user_id = $request->get_param('user_id');
        $cart_key = $request->get_param('cart_key');
        
        if (!$cart_key) {
            return new WP_Error('missing_parameter', '缺少购物车商品键', array('status' => 400));
        }
        
        // 初始化购物车
        WC()->cart->empty_cart();
        
        // 加载用户的购物车
        $this->load_user_cart($user_id);
        
        // 移除商品
        $result = WC()->cart->remove_cart_item($cart_key);
        
        if (!$result) {
            return new WP_Error('invalid_cart_key', '无效的购物车商品键', array('status' => 400));
        }
        
        // 保存购物车
        $this->save_user_cart($user_id);
        
        // 格式化购物车数据
        $data = $this->format_cart_data();
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 格式化购物车数据
     * 
     * @return array 格式化后的购物车数据
     */
    private function format_cart_data() {
        $data = array(
            'cart_contents' => array(),
            'cart_contents_total' => WC()->cart->get_cart_contents_total(),
            'cart_contents_weight' => WC()->cart->get_cart_contents_weight(),
            'subtotal' => WC()->cart->get_subtotal(),
            'subtotal_ex_tax' => WC()->cart->get_subtotal_ex_tax(),
            'subtotal_tax' => WC()->cart->get_subtotal_tax(),
            'total' => WC()->cart->get_total('edit'),
            'total_tax' => WC()->cart->get_total_tax(),
            'shipping_total' => WC()->cart->get_shipping_total(),
            'shipping_tax' => WC()->cart->get_shipping_tax(),
            'discount_total' => WC()->cart->get_discount_total(),
            'discount_cart' => WC()->cart->get_discount_total(),
            'discount_tax' => WC()->cart->get_discount_tax(),
            'fees_total' => WC()->cart->get_fees_total(),
            'fees_tax' => WC()->cart->get_fee_tax(),
            'applied_coupons' => WC()->cart->get_applied_coupons(),
            'coupon_discount_totals' => WC()->cart->get_coupon_discount_totals(),
            'coupon_discount_tax_totals' => WC()->cart->get_coupon_discount_tax_totals(),
        );
        
        // 获取购物车商品
        foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
            $product = $cart_item['data'];
            
            $data['cart_contents'][$cart_item_key] = array(
                'key' => $cart_item_key,
                'product_id' => $cart_item['product_id'],
                'variation_id' => $cart_item['variation_id'],
                'variation' => $cart_item['variation'],
                'quantity' => $cart_item['quantity'],
                'data_hash' => $cart_item['data_hash'],
                'line_tax_data' => $cart_item['line_tax_data'],
                'line_subtotal' => $cart_item['line_subtotal'],
                'line_subtotal_tax' => $cart_item['line_subtotal_tax'],
                'line_total' => $cart_item['line_total'],
                'line_tax' => $cart_item['line_tax'],
                'product_name' => $product->get_name(),
                'product_price' => $product->get_price(),
                'product_image' => wp_get_attachment_image_src($product->get_image_id(), 'thumbnail'),
                'product_permalink' => get_permalink($product->get_id()),
            );
        }
        
        return $data;
    }
    
    /**
     * 加载用户购物车
     * 
     * @param int $user_id 用户ID
     * @return void
     */
    private function load_user_cart($user_id) {
        // 获取用户购物车数据
        $cart_data = get_user_meta($user_id, '_sut_wechat_mini_cart', true);
        
        if (!empty($cart_data)) {
            // 恢复购物车
            WC()->cart->restore_cart($cart_data);
        }
    }
    
    /**
     * 保存用户购物车
     * 
     * @param int $user_id 用户ID
     * @return void
     */
    private function save_user_cart($user_id) {
        // 获取购物车数据
        $cart_data = WC()->cart->get_cart_for_session();
        
        // 保存到用户元数据
        update_user_meta($user_id, '_sut_wechat_mini_cart', $cart_data);
    }
    
    /**
     * 验证优惠券
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function validate_coupon($request) {
        $coupon_code = $request->get_param('coupon_code');
        
        if (empty($coupon_code)) {
            return new WP_Error('missing_parameter', '缺少优惠券代码', array('status' => 400));
        }
        
        // 验证优惠券
        $coupon = new WC_Coupon($coupon_code);
        
        if (!$coupon->get_id()) {
            return new WP_Error('invalid_coupon', '优惠券不存在', array('status' => 400));
        }
        
        // 检查优惠券是否有效
        if (!$coupon->is_valid()) {
            return new WP_Error('invalid_coupon', '优惠券无效', array('status' => 400));
        }
        
        // 返回优惠券信息
        $data = array(
            'id' => $coupon->get_id(),
            'code' => $coupon->get_code(),
            'amount' => $coupon->get_amount(),
            'discount_type' => $coupon->get_discount_type(),
            'description' => $coupon->get_description(),
            'expiry_date' => $coupon->get_date_expires() ? $coupon->get_date_expires()->format('Y-m-d H:i:s') : null,
            'usage_limit' => $coupon->get_usage_limit(),
            'usage_limit_per_user' => $coupon->get_usage_limit_per_user(),
            'usage_count' => $coupon->get_usage_count(),
            'minimum_amount' => $coupon->get_minimum_amount(),
            'maximum_amount' => $coupon->get_maximum_amount(),
            'product_ids' => $coupon->get_product_ids(),
            'excluded_product_ids' => $coupon->get_excluded_product_ids(),
            'product_categories' => $coupon->get_product_categories(),
            'excluded_product_categories' => $coupon->get_excluded_product_categories(),
            'exclude_sale_items' => $coupon->get_exclude_sale_items(),
            'email_restrictions' => $coupon->get_email_restrictions(),
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 获取支付方式
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_payment_methods($request) {
        $available_gateways = WC()->payment_gateways->get_available_payment_gateways();
        
        $data = array();
        
        foreach ($available_gateways as $gateway_id => $gateway) {
            $data[$gateway_id] = array(
                'id' => $gateway->id,
                'title' => $gateway->get_title(),
                'description' => $gateway->get_description(),
                'enabled' => $gateway->enabled,
                'icon' => $gateway->get_icon(),
                'supports' => $gateway->supports,
                'has_fields' => $gateway->has_fields(),
                'method_title' => $gateway->method_title,
                'method_description' => $gateway->method_description,
            );
        }
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 处理支付
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function process_payment($request) {
        $order_id = $request->get_param('order_id');
        $payment_method = $request->get_param('payment_method');
        
        if (empty($order_id) || empty($payment_method)) {
            return new WP_Error('missing_parameter', '缺少必要参数', array('status' => 400));
        }
        
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return new WP_Error('not_found', '订单不存在', array('status' => 404));
        }
        
        // 设置支付方式
        $order->set_payment_method($payment_method);
        $order->save();
        
        // 处理支付
        $payment_gateways = WC()->payment_gateways->payment_gateways();
        
        if (isset($payment_gateways[$payment_method])) {
            $gateway = $payment_gateways[$payment_method];
            
            // 处理支付
            $result = $gateway->process_payment($order_id);
            
            if (isset($result['result']) && $result['result'] === 'success') {
                return new WP_REST_Response($result, 200);
            } else {
                return new WP_Error('payment_failed', '支付失败', array('status' => 400));
            }
        } else {
            return new WP_Error('invalid_payment_method', '无效的支付方式', array('status' => 400));
        }
    }
    
    /**
     * 获取商品分类
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_categories($request) {
        $parent = $request->get_param('parent');
        $hide_empty = $request->get_param('hide_empty') ?: false;
        
        $args = array(
            'taxonomy' => 'product_cat',
            'hide_empty' => $hide_empty,
        );
        
        if ($parent !== null) {
            $args['parent'] = $parent;
        }
        
        $categories = get_terms($args);
        
        $data = array();
        
        foreach ($categories as $category) {
            $thumbnail_id = get_term_meta($category->term_id, 'thumbnail_id', true);
            $image = $thumbnail_id ? wp_get_attachment_image_src($thumbnail_id, 'full') : null;
            
            $data[] = array(
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent' => $category->parent,
                'count' => $category->count,
                'image' => $image ? array(
                    'id' => $thumbnail_id,
                    'src' => $image[0],
                    'width' => $image[1],
                    'height' => $image[2],
                ) : null,
            );
        }
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 获取分类商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_category_products($request) {
        $category_id = $request->get_param('id');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $orderby = $request->get_param('orderby') ?: 'date';
        $order = $request->get_param('order') ?: 'DESC';
        
        $args = array(
            'status' => 'publish',
            'limit' => $per_page,
            'page' => $page,
            'orderby' => $orderby,
            'order' => $order,
            'category' => array($category_id),
        );
        
        $products = wc_get_products($args);
        
        $data = array();
        
        foreach ($products as $product) {
            $data[] = $this->format_product_data($product);
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total = wc_get_products(array('status' => 'publish', 'limit' => -1, 'category' => array($category_id)));
        $total_pages = ceil(count($total) / $per_page);
        
        $response->header('X-WP-Total', count($total));
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 创建商品评价
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function create_review($request) {
        $user_id = $request->get_param('user_id');
        $product_id = $request->get_param('product_id');
        $rating = $request->get_param('rating');
        $comment = $request->get_param('comment');
        
        // 验证必要参数
        if (empty($product_id) || empty($rating) || empty($comment)) {
            return new WP_Error('missing_parameter', '缺少必要参数', array('status' => 400));
        }
        
        // 验证商品
        $product = wc_get_product($product_id);
        
        if (!$product) {
            return new WP_Error('invalid_product', '商品不存在', array('status' => 400));
        }
        
        // 验证评分
        if ($rating < 1 || $rating > 5) {
            return new WP_Error('invalid_rating', '评分必须在1-5之间', array('status' => 400));
        }
        
        // 检查用户是否已购买商品
        $customer_orders = get_posts(array(
            'numberposts' => -1,
            'meta_key' => '_customer_user',
            'meta_value' => $user_id,
            'post_type' => 'shop_order',
            'post_status' => 'wc-completed',
        ));
        
        $has_purchased = false;
        
        foreach ($customer_orders as $order) {
            $order_obj = wc_get_order($order->ID);
            $items = $order_obj->get_items();
            
            foreach ($items as $item) {
                if ($item->get_product_id() == $product_id) {
                    $has_purchased = true;
                    break 2;
                }
            }
        }
        
        if (!$has_purchased) {
            return new WP_Error('not_purchased', '您必须购买此商品才能评价', array('status' => 400));
        }
        
        // 检查用户是否已评价
        $args = array(
            'post_id' => $product_id,
            'user_id' => $user_id,
            'post_type' => 'product',
            'status' => 'approve',
        );
        
        $user_comments = get_comments($args);
        
        if (!empty($user_comments)) {
            return new WP_Error('already_reviewed', '您已经评价过此商品', array('status' => 400));
        }
        
        // 创建评价
        $comment_data = array(
            'comment_post_ID' => $product_id,
            'comment_author' => get_userdata($user_id)->display_name,
            'comment_author_email' => get_userdata($user_id)->user_email,
            'comment_content' => $comment,
            'comment_type' => 'review',
            'user_id' => $user_id,
            'comment_approved' => 0, // 待审核
            'comment_meta' => array(
                'rating' => $rating,
            ),
        );
        
        $comment_id = wp_insert_comment($comment_data);
        
        if (!$comment_id) {
            return new WP_Error('create_review_failed', '创建评价失败', array('status' => 500));
        }
        
        // 更新商品评分
        $product->set_review_count($product->get_review_count() + 1);
        $product->set_average_rating(($product->get_average_rating() * $product->get_review_count() + $rating) / ($product->get_review_count() + 1));
        $product->save();
        
        // 返回评价数据
        $comment = get_comment($comment_id);
        
        $data = array(
            'id' => $comment->comment_ID,
            'product_id' => $comment->comment_post_ID,
            'reviewer' => $comment->comment_author,
            'reviewer_email' => $comment->comment_author_email,
            'rating' => get_comment_meta($comment_id, 'rating', true),
            'comment' => $comment->comment_content,
            'date_created' => $comment->comment_date,
            'status' => $comment->comment_approved,
        );
        
        return new WP_REST_Response($data, 201);
    }
    
    /**
     * 获取商品评价
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_product_reviews($request) {
        $product_id = $request->get_param('id');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $rating = $request->get_param('rating');
        
        $args = array(
            'post_id' => $product_id,
            'post_type' => 'product',
            'status' => 'approve',
            'number' => $per_page,
            'offset' => ($page - 1) * $per_page,
        );
        
        if ($rating) {
            $args['meta_query'] = array(
                array(
                    'key' => 'rating',
                    'value' => $rating,
                    'compare' => '=',
                ),
            );
        }
        
        $comments = get_comments($args);
        
        $data = array();
        
        foreach ($comments as $comment) {
            $data[] = array(
                'id' => $comment->comment_ID,
                'product_id' => $comment->comment_post_ID,
                'reviewer' => $comment->comment_author,
                'reviewer_email' => $comment->comment_author_email,
                'rating' => get_comment_meta($comment->comment_ID, 'rating', true),
                'comment' => $comment->comment_content,
                'date_created' => $comment->comment_date,
                'verified' => wc_customer_bought_product($comment->comment_author_email, $comment->user_id, $product_id),
            );
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total_args = array(
            'post_id' => $product_id,
            'post_type' => 'product',
            'status' => 'approve',
            'count' => true,
        );
        
        if ($rating) {
            $total_args['meta_query'] = array(
                array(
                    'key' => 'rating',
                    'value' => $rating,
                    'compare' => '=',
                ),
            );
        }
        
        $total = get_comments($total_args);
        $total_pages = ceil($total / $per_page);
        
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 订单状态变更处理
     * 
     * @param int $order_id 订单ID
     * @param string $old_status 旧状态
     * @param string $new_status 新状态
     * @param WC_Order $order 订单对象
     * @return void
     */
    public function on_order_status_changed($order_id, $old_status, $new_status, $order) {
        // 获取用户ID
        $user_id = $order->get_customer_id();
        
        if (!$user_id) {
            return;
        }
        
        // 发送消息通知
        $message_service = Sut_WeChat_Mini_Message::get_instance();
        
        // 根据状态发送不同的消息
        switch ($new_status) {
            case 'processing':
                $message_service->send_order_status_message($user_id, $order_id, '订单处理中', '您的订单正在处理中，请耐心等待。');
                break;
                
            case 'completed':
                $message_service->send_order_status_message($user_id, $order_id, '订单已完成', '您的订单已完成，感谢您的购买。');
                
                // 如果有积分系统，添加积分奖励
                if (class_exists('Sut_WeChat_Mini_Points')) {
                    $points_service = Sut_WeChat_Mini_Points::get_instance();
                    $order_total = $order->get_total();
                    $points = intval($order_total * 0.01); // 1%的积分奖励
                    
                    $points_service->add_points($user_id, $points, 'order_completed', '订单完成奖励', array(
                        'order_id' => $order_id,
                    ));
                }
                break;
                
            case 'cancelled':
                $message_service->send_order_status_message($user_id, $order_id, '订单已取消', '您的订单已取消。');
                break;
                
            case 'refunded':
                $message_service->send_order_status_message($user_id, $order_id, '订单已退款', '您的订单已退款。');
                break;
        }
    }
    
    /**
     * 新订单创建处理
     * 
     * @param int $order_id 订单ID
     * @return void
     */
    public function on_new_order($order_id) {
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return;
        }
        
        // 获取用户ID
        $user_id = $order->get_customer_id();
        
        if (!$user_id) {
            return;
        }
        
        // 发送消息通知
        $message_service = Sut_WeChat_Mini_Message::get_instance();
        $message_service->send_order_status_message($user_id, $order_id, '订单已创建', '您的订单已创建，请尽快完成支付。');
    }
    
    /**
     * 支付完成处理
     * 
     * @param int $order_id 订单ID
     * @return void
     */
    public function on_payment_complete($order_id) {
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return;
        }
        
        // 获取用户ID
        $user_id = $order->get_customer_id();
        
        if (!$user_id) {
            return;
        }
        
        // 发送消息通知
        $message_service = Sut_WeChat_Mini_Message::get_instance();
        $message_service->send_order_status_message($user_id, $order_id, '支付已完成', '您的订单支付已完成，我们将尽快为您发货。');
        
        // 如果有积分系统，添加积分奖励
        if (class_exists('Sut_WeChat_Mini_Points')) {
            $points_service = Sut_WeChat_Mini_Points::get_instance();
            $order_total = $order->get_total();
            $points = intval($order_total * 0.01); // 1%的积分奖励
            
            $points_service->add_points($user_id, $points, 'payment_completed', '支付完成奖励', array(
                'order_id' => $order_id,
            ));
        }
    }
    
    /**
     * 商品更新处理
     * 
     * @param int $product_id 商品ID
     * @param WC_Product $product 商品对象
     * @return void
     */
    public function on_product_updated($product_id, $product) {
        // 同步商品信息到小程序
        $this->sync_product_to_miniprogram($product);
    }
    
    /**
     * 商品删除处理
     * 
     * @param int $product_id 商品ID
     * @return void
     */
    public function on_product_deleted($product_id) {
        // 从小程序中删除商品
        $this->delete_product_from_miniprogram($product_id);
    }
    
    /**
     * 新用户注册处理
     * 
     * @param int $customer_id 客户ID
     * @return void
     */
    public function on_new_customer($customer_id) {
        // 发送欢迎消息
        $message_service = Sut_WeChat_Mini_Message::get_instance();
        $message_service->send_welcome_message($customer_id);
        
        // 如果有积分系统，添加注册奖励积分
        if (class_exists('Sut_WeChat_Mini_Points')) {
            $points_service = Sut_WeChat_Mini_Points::get_instance();
            $points_service->add_points($customer_id, 100, 'register', '注册奖励');
        }
    }
    
    /**
     * 购物车更新处理
     * 
     * @return void
     */
    public function on_cart_updated() {
        // 购物车更新时的处理逻辑
    }
    
    /**
     * 优惠券应用处理
     * 
     * @param string $coupon_code 优惠券代码
     * @return void
     */
    public function on_coupon_applied($coupon_code) {
        // 优惠券应用时的处理逻辑
    }
    
    /**
     * 评价审核通过处理
     * 
     * @param int $comment_id 评论ID
     * @return void
     */
    public function on_review_approved($comment_id) {
        $comment = get_comment($comment_id);
        
        if (!$comment) {
            return;
        }
        
        $user_id = $comment->user_id;
        $product_id = $comment->comment_post_ID;
        
        if (!$user_id || !$product_id) {
            return;
        }
        
        // 发送消息通知
        $message_service = Sut_WeChat_Mini_Message::get_instance();
        $message_service->send_review_approved_message($user_id, $product_id);
        
        // 如果有积分系统，添加评价奖励积分
        if (class_exists('Sut_WeChat_Mini_Points')) {
            $points_service = Sut_WeChat_Mini_Points::get_instance();
            $points_service->add_points($user_id, 10, 'review_approved', '评价奖励');
        }
    }
    
    /**
     * 评价待审核处理
     * 
     * @param int $comment_id 评论ID
     * @return void
     */
    public function on_review_pending($comment_id) {
        $comment = get_comment($comment_id);
        
        if (!$comment) {
            return;
        }
        
        $user_id = $comment->user_id;
        
        if (!$user_id) {
            return;
        }
        
        // 发送消息通知
        $message_service = Sut_WeChat_Mini_Message::get_instance();
        $message_service->send_review_pending_message($user_id);
    }
    
    /**
     * 同步商品到小程序
     * 
     * @param WC_Product $product 商品对象
     * @return void
     */
    private function sync_product_to_miniprogram($product) {
        // 实现商品同步到小程序的逻辑
        // 可以调用小程序API或者更新缓存
    }
    
    /**
     * 从小程序删除商品
     * 
     * @param int $product_id 商品ID
     * @return void
     */
    private function delete_product_from_miniprogram($product_id) {
        // 实现从小程序删除商品的逻辑
        // 可以调用小程序API或者更新缓存
    }
}