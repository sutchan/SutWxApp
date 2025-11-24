<?php
/**
 * 文件名: class-sut-wechat-mini-api.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: API接口类，处理微信小程序的API请求
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API接口类
 * 处理微信小程序的API请求和响应
 */
class Sut_WeChat_Mini_API {
    
    /**
     * API版本
     * @var string
     */
    private $api_version = 'v1';
    
    /**
     * 支持的API版本
     * @var array
     */
    private $supported_versions = ['v1'];
    
    /**
     * 请求方法
     * @var string
     */
    private $request_method;
    
    /**
     * 请求路径
     * @var string
     */
    private $request_path;
    
    /**
     * 请求参数
     * @var array
     */
    private $request_params;
    
    /**
     * 响应数据
     * @var array
     */
    private $response_data;
    
    /**
     * 响应状态码
     * @var int
     */
    private $response_code = 200;
    
    /**
     * 响应消息
     * @var string
     */
    private $response_message = 'success';
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init_hooks();
    }
    
    /**
     * 初始化钩子
     */
    private function init_hooks() {
        // 注册API路由
        add_action('rest_api_init', array($this, 'register_api_routes'));
        
        // 处理自定义API请求
        add_action('template_redirect', array($this, 'handle_custom_api_request'));
        
        // 处理微信服务器验证
        add_action('init', array($this, 'handle_wechat_verification'));
    }
    
    /**
     * 注册REST API路由
     */
    public function register_api_routes() {
        register_rest_route('sut-wxapp/' . $this->api_version, '/auth/login', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_login'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/auth/refresh', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_token_refresh'),
            'permission_callback' => array($this, 'check_api_key')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/user/profile', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_get_user_profile'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/user/profile', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_update_user_profile'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/products', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_get_products'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/products/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_get_product'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/orders', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_get_orders'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/orders', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_create_order'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/payment/create', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_create_payment'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/payment/notify', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_payment_notify'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/points/tasks', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_get_points_tasks'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/points/tasks/(?P<task_id>\d+)/complete', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_complete_points_task'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/messages', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_get_messages'),
            'permission_callback' => array($this, 'check_user_token')
        ));
        
        register_rest_route('sut-wxapp/' . $this->api_version, '/messages/(?P<id>\d+)/read', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_read_message'),
            'permission_callback' => array($this, 'check_user_token')
        ));
    }
    
    /**
     * 处理自定义API请求
     */
    public function handle_custom_api_request() {
        // 检查是否是API请求
        if (!isset($_GET['wxapp_api']) || !isset($_GET['wxapp_action'])) {
            return;
        }
        
        $this->request_method = $_SERVER['REQUEST_METHOD'];
        $this->request_path = sanitize_text_field($_GET['wxapp_api']);
        $this->request_params = $this->get_request_params();
        
        // 根据API路径和动作处理请求
        $this->process_api_request();
        
        // 发送响应
        $this->send_response();
        exit;
    }
    
    /**
     * 处理微信服务器验证
     */
    public function handle_wechat_verification() {
        // 检查是否是微信验证请求
        if (!isset($_GET['signature']) || !isset($_GET['timestamp']) || 
            !isset($_GET['nonce']) || !isset($_GET['echostr'])) {
            return;
        }
        
        $signature = $_GET['signature'];
        $timestamp = $_GET['timestamp'];
        $nonce = $_GET['nonce'];
        $echostr = $_GET['echostr'];
        
        // 获取微信配置
        $token = get_option('sut_wechat_mini_token', '');
        
        if (empty($token)) {
            return;
        }
        
        // 验证签名
        $tmp_arr = array($token, $timestamp, $nonce);
        sort($tmp_arr, SORT_STRING);
        $tmp_str = implode($tmp_arr);
        $tmp_str = sha1($tmp_str);
        
        if ($tmp_str == $signature) {
            echo $echostr;
            exit;
        }
    }
    
    /**
     * 处理登录请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_login($request) {
        $code = $request->get_param('code');
        
        if (empty($code)) {
            return $this->error_response('缺少code参数', 400);
        }
        
        // 获取微信配置
        $app_id = get_option('sut_wechat_mini_app_id', '');
        $app_secret = get_option('sut_wechat_mini_app_secret', '');
        
        if (empty($app_id) || empty($app_secret)) {
            return $this->error_response('微信配置不完整', 500);
        }
        
        // 请求微信API获取session_key和openid
        $url = "https://api.weixin.qq.com/sns/jscode2session?appid={$app_id}&secret={$app_secret}&js_code={$code}&grant_type=authorization_code";
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return $this->error_response('请求微信API失败', 500);
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['errcode'])) {
            return $this->error_response($data['errmsg'], 400);
        }
        
        $openid = $data['openid'];
        $session_key = $data['session_key'];
        $unionid = isset($data['unionid']) ? $data['unionid'] : '';
        
        // 查找或创建用户
        $user_service = new Sut_WeChat_Mini_Users();
        $user = $user_service->get_user_by_openid($openid);
        
        if (!$user) {
            $user = $user_service->create_user(array(
                'openid' => $openid,
                'unionid' => $unionid,
                'session_key' => $session_key
            ));
        } else {
            $user_service->update_user($user->id, array(
                'session_key' => $session_key,
                'last_login' => current_time('mysql')
            ));
        }
        
        // 生成自定义token
        $token = $this->generate_token($user->id);
        
        // 保存token到数据库
        $user_service->save_user_token($user->id, $token);
        
        return $this->success_response(array(
            'token' => $token,
            'user_id' => $user->id,
            'openid' => $user->openid
        ));
    }
    
    /**
     * 处理token刷新请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_token_refresh($request) {
        $refresh_token = $request->get_param('refresh_token');
        
        if (empty($refresh_token)) {
            return $this->error_response('缺少refresh_token参数', 400);
        }
        
        // 验证refresh token
        $user_service = new Sut_WeChat_Mini_Users();
        $user = $user_service->get_user_by_refresh_token($refresh_token);
        
        if (!$user) {
            return $this->error_response('无效的refresh_token', 401);
        }
        
        // 生成新的token
        $token = $this->generate_token($user->id);
        
        // 保存新token
        $user_service->save_user_token($user->id, $token);
        
        return $this->success_response(array(
            'token' => $token,
            'user_id' => $user->id
        ));
    }
    
    /**
     * 处理获取用户资料请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_get_user_profile($request) {
        $user_id = $request->get_param('user_id');
        
        $user_service = new Sut_WeChat_Mini_Users();
        $user = $user_service->get_user($user_id);
        
        if (!$user) {
            return $this->error_response('用户不存在', 404);
        }
        
        return $this->success_response(array(
            'id' => $user->id,
            'nickname' => $user->nickname,
            'avatar_url' => $user->avatar_url,
            'gender' => $user->gender,
            'city' => $user->city,
            'province' => $user->province,
            'country' => $user->country,
            'language' => $user->language,
            'phone' => $user->phone,
            'email' => $user->email,
            'points' => $user->points,
            'balance' => $user->balance
        ));
    }
    
    /**
     * 处理更新用户资料请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_update_user_profile($request) {
        $user_id = $request->get_param('user_id');
        $nickname = $request->get_param('nickname');
        $avatar_url = $request->get_param('avatar_url');
        $gender = $request->get_param('gender');
        $city = $request->get_param('city');
        $province = $request->get_param('province');
        $country = $request->get_param('country');
        $language = $request->get_param('language');
        $phone = $request->get_param('phone');
        $email = $request->get_param('email');
        
        $user_service = new Sut_WeChat_Mini_Users();
        $user = $user_service->get_user($user_id);
        
        if (!$user) {
            return $this->error_response('用户不存在', 404);
        }
        
        $update_data = array();
        
        if (!empty($nickname)) $update_data['nickname'] = $nickname;
        if (!empty($avatar_url)) $update_data['avatar_url'] = $avatar_url;
        if (!is_null($gender)) $update_data['gender'] = $gender;
        if (!empty($city)) $update_data['city'] = $city;
        if (!empty($province)) $update_data['province'] = $province;
        if (!empty($country)) $update_data['country'] = $country;
        if (!empty($language)) $update_data['language'] = $language;
        if (!empty($phone)) $update_data['phone'] = $phone;
        if (!empty($email)) $update_data['email'] = $email;
        
        if (empty($update_data)) {
            return $this->error_response('没有提供更新数据', 400);
        }
        
        $result = $user_service->update_user($user_id, $update_data);
        
        if (!$result) {
            return $this->error_response('更新用户资料失败', 500);
        }
        
        return $this->success_response(array(), '更新成功');
    }
    
    /**
     * 处理获取商品列表请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_get_products($request) {
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $category = $request->get_param('category');
        $search = $request->get_param('search');
        $sort = $request->get_param('sort') ?: 'date';
        $order = $request->get_param('order') ?: 'desc';
        
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'orderby' => $sort,
            'order' => $order
        );
        
        if (!empty($category)) {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'slug',
                    'terms' => $category
                )
            );
        }
        
        if (!empty($search)) {
            $args['s'] = $search;
        }
        
        $products_query = new WP_Query($args);
        $products = array();
        
        if ($products_query->have_posts()) {
            while ($products_query->have_posts()) {
                $products_query->the_post();
                $product_id = get_the_ID();
                
                $products[] = array(
                    'id' => $product_id,
                    'title' => get_the_title(),
                    'description' => get_the_excerpt(),
                    'price' => get_post_meta($product_id, '_price', true),
                    'regular_price' => get_post_meta($product_id, '_regular_price', true),
                    'sale_price' => get_post_meta($product_id, '_sale_price', true),
                    'image' => wp_get_attachment_url(get_post_thumbnail_id($product_id)),
                    'category' => wp_get_post_terms($product_id, 'product_cat'),
                    'tags' => wp_get_post_terms($product_id, 'product_tag'),
                    'stock_status' => get_post_meta($product_id, '_stock_status', true),
                    'rating' => get_post_meta($product_id, '_wc_average_rating', true),
                    'rating_count' => get_post_meta($product_id, '_wc_rating_count', true)
                );
            }
        }
        
        wp_reset_postdata();
        
        return $this->success_response(array(
            'products' => $products,
            'total' => $products_query->found_posts,
            'pages' => $products_query->max_num_pages,
            'current_page' => $page
        ));
    }
    
    /**
     * 处理获取商品详情请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_get_product($request) {
        $product_id = $request->get_param('id');
        
        $product = get_post($product_id);
        
        if (!$product || $product->post_type !== 'product' || $product->post_status !== 'publish') {
            return $this->error_response('商品不存在', 404);
        }
        
        $product_data = array(
            'id' => $product_id,
            'title' => get_the_title($product_id),
            'description' => get_the_content(null, false, $product_id),
            'short_description' => get_the_excerpt($product_id),
            'price' => get_post_meta($product_id, '_price', true),
            'regular_price' => get_post_meta($product_id, '_regular_price', true),
            'sale_price' => get_post_meta($product_id, '_sale_price', true),
            'images' => $this->get_product_images($product_id),
            'category' => wp_get_post_terms($product_id, 'product_cat'),
            'tags' => wp_get_post_terms($product_id, 'product_tag'),
            'attributes' => $this->get_product_attributes($product_id),
            'variations' => $this->get_product_variations($product_id),
            'stock_status' => get_post_meta($product_id, '_stock_status', true),
            'stock_quantity' => get_post_meta($product_id, '_stock', true),
            'rating' => get_post_meta($product_id, '_wc_average_rating', true),
            'rating_count' => get_post_meta($product_id, '_wc_rating_count', true),
            'related_products' => $this->get_related_products($product_id)
        );
        
        return $this->success_response($product_data);
    }
    
    /**
     * 处理获取订单列表请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_get_orders($request) {
        $user_id = $request->get_param('user_id');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $status = $request->get_param('status');
        
        global $wpdb;
        $orders_table = $wpdb->prefix . 'sut_wxmini_orders';
        
        $where = "WHERE user_id = %d";
        $params = array($user_id);
        
        if (!empty($status)) {
            $where .= " AND order_status = %s";
            $params[] = $status;
        }
        
        $offset = ($page - 1) * $per_page;
        $limit = "LIMIT %d OFFSET %d";
        $params[] = $per_page;
        $params[] = $offset;
        
        $sql = "SELECT * FROM $orders_table $where ORDER BY created_at DESC $limit";
        $orders = $wpdb->get_results($wpdb->prepare($sql, $params));
        
        // 获取总数
        $count_sql = "SELECT COUNT(*) FROM $orders_table $where";
        $total = $wpdb->get_var($wpdb->prepare($count_sql, array_slice($params, 0, -2)));
        
        $order_list = array();
        
        foreach ($orders as $order) {
            $order_items = json_decode($order->order_items, true);
            $shipping_address = json_decode($order->shipping_address, true);
            
            $order_list[] = array(
                'id' => $order->id,
                'order_no' => $order->order_no,
                'total_amount' => $order->total_amount,
                'discount_amount' => $order->discount_amount,
                'points_used' => $order->points_used,
                'points_earned' => $order->points_earned,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'order_status' => $order->order_status,
                'order_items' => $order_items,
                'shipping_address' => $shipping_address,
                'remark' => $order->remark,
                'created_at' => $order->created_at,
                'paid_at' => $order->paid_at,
                'shipped_at' => $order->shipped_at,
                'completed_at' => $order->completed_at,
                'cancelled_at' => $order->cancelled_at
            );
        }
        
        return $this->success_response(array(
            'orders' => $order_list,
            'total' => $total,
            'pages' => ceil($total / $per_page),
            'current_page' => $page
        ));
    }
    
    /**
     * 处理创建订单请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_create_order($request) {
        $user_id = $request->get_param('user_id');
        $order_items = $request->get_param('order_items');
        $shipping_address = $request->get_param('shipping_address');
        $payment_method = $request->get_param('payment_method');
        $points_used = $request->get_param('points_used') ?: 0;
        $remark = $request->get_param('remark');
        
        if (empty($order_items) || !is_array($order_items)) {
            return $this->error_response('订单商品不能为空', 400);
        }
        
        if (empty($shipping_address) || !is_array($shipping_address)) {
            return $this->error_response('收货地址不能为空', 400);
        }
        
        // 验证商品信息
        $total_amount = 0;
        foreach ($order_items as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity']) || $item['quantity'] <= 0) {
                return $this->error_response('商品信息不完整', 400);
            }
            
            $product = get_post($item['product_id']);
            if (!$product || $product->post_type !== 'product' || $product->post_status !== 'publish') {
                return $this->error_response('商品不存在', 400);
            }
            
            $price = get_post_meta($item['product_id'], '_price', true);
            $total_amount += $price * $item['quantity'];
        }
        
        // 检查用户积分
        $user_service = new Sut_WeChat_Mini_Users();
        $user = $user_service->get_user($user_id);
        
        if (!$user) {
            return $this->error_response('用户不存在', 404);
        }
        
        if ($points_used > $user->points) {
            return $this->error_response('积分不足', 400);
        }
        
        // 计算折扣金额
        $discount_amount = 0;
        if ($points_used > 0) {
            // 假设100积分抵扣1元
            $discount_amount = min($points_used / 100, $total_amount);
        }
        
        // 生成订单号
        $order_no = 'WX' . date('YmdHis') . mt_rand(1000, 9999);
        
        // 创建订单
        global $wpdb;
        $orders_table = $wpdb->prefix . 'sut_wxmini_orders';
        
        $result = $wpdb->insert(
            $orders_table,
            array(
                'order_no' => $order_no,
                'user_id' => $user_id,
                'total_amount' => $total_amount,
                'discount_amount' => $discount_amount,
                'points_used' => $points_used,
                'payment_method' => $payment_method,
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'order_items' => json_encode($order_items),
                'shipping_address' => json_encode($shipping_address),
                'remark' => $remark,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%d', '%f', '%f', '%d', '%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if (!$result) {
            return $this->error_response('创建订单失败', 500);
        }
        
        $order_id = $wpdb->insert_id;
        
        // 扣除用户积分
        if ($points_used > 0) {
            $user_service->deduct_points($user_id, $points_used, 'order_payment', $order_id, '订单支付使用积分');
        }
        
        return $this->success_response(array(
            'order_id' => $order_id,
            'order_no' => $order_no,
            'total_amount' => $total_amount,
            'discount_amount' => $discount_amount,
            'payment_amount' => $total_amount - $discount_amount
        ));
    }
    
    /**
     * 处理创建支付请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_create_payment($request) {
        $user_id = $request->get_param('user_id');
        $order_id = $request->get_param('order_id');
        $payment_method = $request->get_param('payment_method');
        
        if (empty($order_id) || empty($payment_method)) {
            return $this->error_response('缺少必要参数', 400);
        }
        
        // 获取订单信息
        global $wpdb;
        $orders_table = $wpdb->prefix . 'sut_wxmini_orders';
        $order = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $orders_table WHERE id = %d AND user_id = %d",
            $order_id, $user_id
        ));
        
        if (!$order) {
            return $this->error_response('订单不存在', 404);
        }
        
        if ($order->payment_status !== 'pending') {
            return $this->error_response('订单已支付', 400);
        }
        
        // 计算支付金额
        $payment_amount = $order->total_amount - $order->discount_amount;
        
        // 根据支付方式创建支付
        $payment_service = new Sut_WeChat_Mini_Pay();
        
        if ($payment_method === 'wechat') {
            $payment_result = $payment_service->create_wechat_payment($order_id, $payment_amount);
        } else {
            return $this->error_response('不支持的支付方式', 400);
        }
        
        if (!$payment_result) {
            return $this->error_response('创建支付失败', 500);
        }
        
        return $this->success_response($payment_result);
    }
    
    /**
     * 处理支付通知请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_payment_notify($request) {
        $payment_method = $request->get_param('payment_method');
        
        if ($payment_method === 'wechat') {
            $payment_service = new Sut_WeChat_Mini_Pay();
            $result = $payment_service->handle_wechat_notify();
            
            if ($result) {
                return $this->success_response(array(), 'success');
            } else {
                return $this->error_response('处理支付通知失败', 500);
            }
        } else {
            return $this->error_response('不支持的支付方式', 400);
        }
    }
    
    /**
     * 处理获取积分任务列表请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_get_points_tasks($request) {
        $user_id = $request->get_param('user_id');
        $type = $request->get_param('type') ?: 'all';
        $status = $request->get_param('status') ?: 'all';
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        $points_service = new Sut_WeChat_Mini_Points();
        $tasks = $points_service->get_user_tasks($user_id, $type, $status, $page, $per_page);
        
        return $this->success_response($tasks);
    }
    
    /**
     * 处理完成积分任务请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_complete_points_task($request) {
        $user_id = $request->get_param('user_id');
        $task_id = $request->get_param('task_id');
        
        $points_service = new Sut_WeChat_Mini_Points();
        $result = $points_service->complete_task($user_id, $task_id);
        
        if (!$result) {
            return $this->error_response('完成任务失败', 500);
        }
        
        return $this->success_response($result);
    }
    
    /**
     * 处理获取消息列表请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_get_messages($request) {
        $user_id = $request->get_param('user_id');
        $type = $request->get_param('type');
        $is_read = $request->get_param('is_read');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        $message_service = new Sut_WeChat_Mini_Messages();
        $messages = $message_service->get_user_messages($user_id, $type, $is_read, $page, $per_page);
        
        return $this->success_response($messages);
    }
    
    /**
     * 处理标记消息已读请求
     *
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function handle_read_message($request) {
        $user_id = $request->get_param('user_id');
        $message_id = $request->get_param('id');
        
        $message_service = new Sut_WeChat_Mini_Messages();
        $result = $message_service->mark_as_read($message_id, $user_id);
        
        if (!$result) {
            return $this->error_response('标记消息已读失败', 500);
        }
        
        return $this->success_response(array(), '标记成功');
    }
    
    /**
     * 检查API密钥
     *
     * @param WP_REST_Request $request 请求对象
     * @return bool 是否有权限
     */
    public function check_api_key($request) {
        $api_key = $request->get_header('X-API-Key');
        
        if (empty($api_key)) {
            return false;
        }
        
        // 验证API密钥
        $valid_api_key = get_option('sut_wechat_mini_api_key', '');
        
        return $api_key === $valid_api_key;
    }
    
    /**
     * 检查用户token
     *
     * @param WP_REST_Request $request 请求对象
     * @return bool 是否有权限
     */
    public function check_user_token($request) {
        $token = $request->get_header('Authorization');
        
        if (empty($token)) {
            return false;
        }
        
        // 移除Bearer前缀
        $token = str_replace('Bearer ', '', $token);
        
        // 验证token
        $user_service = new Sut_WeChat_Mini_Users();
        $user = $user_service->get_user_by_token($token);
        
        if (!$user) {
            return false;
        }
        
        // 将用户ID添加到请求参数中
        $request->set_param('user_id', $user->id);
        
        return true;
    }
    
    /**
     * 处理API请求
     */
    private function process_api_request() {
        // 根据API路径和动作处理请求
        switch ($this->request_path) {
            case 'auth':
                $this->process_auth_request();
                break;
            case 'user':
                $this->process_user_request();
                break;
            case 'product':
                $this->process_product_request();
                break;
            case 'order':
                $this->process_order_request();
                break;
            case 'payment':
                $this->process_payment_request();
                break;
            case 'points':
                $this->process_points_request();
                break;
            case 'message':
                $this->process_message_request();
                break;
            default:
                $this->response_code = 404;
                $this->response_message = 'API路径不存在';
                break;
        }
    }
    
    /**
     * 处理认证请求
     */
    private function process_auth_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'login':
                $this->handle_login_request();
                break;
            case 'refresh':
                $this->handle_token_refresh_request();
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '认证动作不存在';
                break;
        }
    }
    
    /**
     * 处理用户请求
     */
    private function process_user_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'profile':
                if ($this->request_method === 'GET') {
                    $this->handle_get_user_profile_request();
                } elseif ($this->request_method === 'POST') {
                    $this->handle_update_user_profile_request();
                } else {
                    $this->response_code = 405;
                    $this->response_message = '不支持的请求方法';
                }
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '用户动作不存在';
                break;
        }
    }
    
    /**
     * 处理商品请求
     */
    private function process_product_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'list':
                $this->handle_get_products_request();
                break;
            case 'detail':
                $this->handle_get_product_request();
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '商品动作不存在';
                break;
        }
    }
    
    /**
     * 处理订单请求
     */
    private function process_order_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'list':
                $this->handle_get_orders_request();
                break;
            case 'create':
                $this->handle_create_order_request();
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '订单动作不存在';
                break;
        }
    }
    
    /**
     * 处理支付请求
     */
    private function process_payment_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'create':
                $this->handle_create_payment_request();
                break;
            case 'notify':
                $this->handle_payment_notify_request();
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '支付动作不存在';
                break;
        }
    }
    
    /**
     * 处理积分请求
     */
    private function process_points_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'tasks':
                if ($this->request_method === 'GET') {
                    $this->handle_get_points_tasks_request();
                } elseif ($this->request_method === 'POST') {
                    $this->handle_complete_points_task_request();
                } else {
                    $this->response_code = 405;
                    $this->response_message = '不支持的请求方法';
                }
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '积分动作不存在';
                break;
        }
    }
    
    /**
     * 处理消息请求
     */
    private function process_message_request() {
        $action = $this->request_params['action'] ?? '';
        
        switch ($action) {
            case 'list':
                $this->handle_get_messages_request();
                break;
            case 'read':
                $this->handle_read_message_request();
                break;
            default:
                $this->response_code = 404;
                $this->response_message = '消息动作不存在';
                break;
        }
    }
    
    /**
     * 获取请求参数
     *
     * @return array 请求参数
     */
    private function get_request_params() {
        $params = array();
        
        // 获取GET参数
        if (!empty($_GET)) {
            foreach ($_GET as $key => $value) {
                if ($key !== 'wxapp_api' && $key !== 'wxapp_action') {
                    $params[$key] = sanitize_text_field($value);
                }
            }
        }
        
        // 获取POST参数
        if ($this->request_method === 'POST' && !empty($_POST)) {
            foreach ($_POST as $key => $value) {
                $params[$key] = sanitize_text_field($value);
            }
        }
        
        // 获取JSON参数
        if ($this->request_method === 'POST' && empty($_POST)) {
            $json_input = file_get_contents('php://input');
            if (!empty($json_input)) {
                $json_data = json_decode($json_input, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
                    $params = array_merge($params, $json_data);
                }
            }
        }
        
        return $params;
    }
    
    /**
     * 生成用户token
     *
     * @param int $user_id 用户ID
     * @return string 生成的token
     */
    private function generate_token($user_id) {
        $payload = array(
            'user_id' => $user_id,
            'exp' => time() + (7 * 24 * 60 * 60), // 7天有效期
            'iat' => time()
        );
        
        // 这里应该使用JWT库，为了简化示例，我们使用简单的base64编码
        return base64_encode(json_encode($payload));
    }
    
    /**
     * 获取商品图片
     *
     * @param int $product_id 商品ID
     * @return array 商品图片列表
     */
    private function get_product_images($product_id) {
        $images = array();
        
        // 获取主图
        $thumbnail_id = get_post_thumbnail_id($product_id);
        if ($thumbnail_id) {
            $images[] = array(
                'id' => $thumbnail_id,
                'url' => wp_get_attachment_url($thumbnail_id),
                'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
                'main' => true
            );
        }
        
        // 获取图库图片
        $gallery_ids = get_post_meta($product_id, '_product_image_gallery', true);
        if (!empty($gallery_ids)) {
            $gallery_ids = explode(',', $gallery_ids);
            foreach ($gallery_ids as $image_id) {
                if ($image_id && $image_id != $thumbnail_id) {
                    $images[] = array(
                        'id' => $image_id,
                        'url' => wp_get_attachment_url($image_id),
                        'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                        'main' => false
                    );
                }
            }
        }
        
        return $images;
    }
    
    /**
     * 获取商品属性
     *
     * @param int $product_id 商品ID
     * @return array 商品属性列表
     */
    private function get_product_attributes($product_id) {
        $attributes = array();
        
        $product_attributes = get_post_meta($product_id, '_product_attributes', true);
        
        if (is_array($product_attributes)) {
            foreach ($product_attributes as $attribute_name => $attribute) {
                if ($attribute['is_taxonomy']) {
                    $terms = wp_get_post_terms($product_id, $attribute_name);
                    $options = wp_list_pluck($terms, 'name', 'term_id');
                } else {
                    $options = $attribute['value'];
                    $options = explode('|', $options);
                    $options = array_map('trim', $options);
                }
                
                $attributes[] = array(
                    'name' => $attribute['name'],
                    'slug' => $attribute_name,
                    'options' => $options,
                    'variation' => $attribute['is_variation'],
                    'visible' => $attribute['is_visible']
                );
            }
        }
        
        return $attributes;
    }
    
    /**
     * 获取商品变体
     *
     * @param int $product_id 商品ID
     * @return array 商品变体列表
     */
    private function get_product_variations($product_id) {
        $variations = array();
        
        $args = array(
            'post_type' => 'product_variation',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'post_parent' => $product_id
        );
        
        $variations_query = new WP_Query($args);
        
        if ($variations_query->have_posts()) {
            while ($variations_query->have_posts()) {
                $variations_query->the_post();
                $variation_id = get_the_ID();
                
                $variation_data = array(
                    'id' => $variation_id,
                    'sku' => get_post_meta($variation_id, '_sku', true),
                    'price' => get_post_meta($variation_id, '_price', true),
                    'regular_price' => get_post_meta($variation_id, '_regular_price', true),
                    'sale_price' => get_post_meta($variation_id, '_sale_price', true),
                    'stock_status' => get_post_meta($variation_id, '_stock_status', true),
                    'stock_quantity' => get_post_meta($variation_id, '_stock', true),
                    'image' => wp_get_attachment_url(get_post_thumbnail_id($variation_id)),
                    'attributes' => array()
                );
                
                // 获取变体属性
                $variation_attributes = get_post_meta($variation_id, '_product_attributes', true);
                if (is_array($variation_attributes)) {
                    foreach ($variation_attributes as $attr_name => $attr_value) {
                        $variation_data['attributes'][$attr_name] = $attr_value;
                    }
                }
                
                $variations[] = $variation_data;
            }
        }
        
        wp_reset_postdata();
        
        return $variations;
    }
    
    /**
     * 获取相关商品
     *
     * @param int $product_id 商品ID
     * @param int $limit 数量限制
     * @return array 相关商品列表
     */
    private function get_related_products($product_id, $limit = 4) {
        $related_products = array();
        
        // 获取商品分类
        $categories = wp_get_post_terms($product_id, 'product_cat');
        if (empty($categories)) {
            return $related_products;
        }
        
        $category_ids = wp_list_pluck($categories, 'term_id');
        
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'post__not_in' => array($product_id),
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $category_ids
                )
            ),
            'orderby' => 'rand'
        );
        
        $related_query = new WP_Query($args);
        
        if ($related_query->have_posts()) {
            while ($related_query->have_posts()) {
                $related_query->the_post();
                $related_id = get_the_ID();
                
                $related_products[] = array(
                    'id' => $related_id,
                    'title' => get_the_title(),
                    'price' => get_post_meta($related_id, '_price', true),
                    'regular_price' => get_post_meta($related_id, '_regular_price', true),
                    'sale_price' => get_post_meta($related_id, '_sale_price', true),
                    'image' => wp_get_attachment_url(get_post_thumbnail_id($related_id))
                );
            }
        }
        
        wp_reset_postdata();
        
        return $related_products;
    }
    
    /**
     * 发送响应
     */
    private function send_response() {
        if (!headers_sent()) {
            status_header($this->response_code);
            header('Content-Type: application/json; charset=' . get_option('blog_charset'));
        }
        
        $response = array(
            'code' => $this->response_code,
            'message' => $this->response_message,
            'data' => $this->response_data
        );
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * 成功响应
     *
     * @param array $data 响应数据
     * @param string $message 响应消息
     * @return WP_REST_Response REST响应对象
     */
    private function success_response($data = array(), $message = 'success') {
        return new WP_REST_Response(array(
            'code' => 200,
            'message' => $message,
            'data' => $data
        ), 200);
    }
    
    /**
     * 错误响应
     *
     * @param string $message 错误消息
     * @param int $code 错误代码
     * @return WP_REST_Response REST响应对象
     */
    private function error_response($message, $code = 400) {
        return new WP_REST_Response(array(
            'code' => $code,
            'message' => $message,
            'data' => array()
        ), $code);
    }
}