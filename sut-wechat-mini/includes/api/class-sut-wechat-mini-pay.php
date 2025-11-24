<?php
/**
 * 文件名: class-sut-wechat-mini-pay.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 支付功能类，处理微信小程序支付相关操作
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 支付功能类
 * 处理微信小程序支付相关操作
 */
class Sut_WeChat_Mini_Pay {
    
    /**
     * 支付订单表名
     * @var string
     */
    private $orders_table;
    
    /**
     * 支付记录表名
     * @var string
     */
    private $payments_table;
    
    /**
     * 支付配置
     * @var array
     */
    private $config;
    
    /**
     * 构造函数
     */
    public function __construct() {
        global $wpdb;
        $this->orders_table = $wpdb->prefix . 'sut_wxmini_orders';
        $this->payments_table = $wpdb->prefix . 'sut_wxmini_payments';
        
        // 获取支付配置
        $this->config = $this->get_pay_config();
        
        // 初始化钩子
        $this->init_hooks();
    }
    
    /**
     * 初始化钩子
     */
    private function init_hooks() {
        // 注册激活钩子，创建数据表
        register_activation_hook(SUT_WECHAT_MINI_PLUGIN_FILE, array($this, 'create_tables'));
        
        // 注册支付网关
        add_filter('sut_wechat_mini_payment_gateways', array($this, 'register_payment_gateways'));
        
        // 处理支付回调
        add_action('wp_ajax_sut_wechat_mini_pay_notify', array($this, 'handle_payment_notify'));
        add_action('wp_ajax_nopriv_sut_wechat_mini_pay_notify', array($this, 'handle_payment_notify'));
        
        // 处理退款回调
        add_action('wp_ajax_sut_wechat_mini_refund_notify', array($this, 'handle_refund_notify'));
        add_action('wp_ajax_nopriv_sut_wechat_mini_refund_notify', array($this, 'handle_refund_notify'));
    }
    
    /**
     * 创建数据表
     */
    public function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        // 支付订单表
        $orders_sql = "CREATE TABLE IF NOT EXISTS {$this->orders_table} (
            id int(11) NOT NULL AUTO_INCREMENT,
            order_no varchar(50) NOT NULL,
            user_id int(11) NOT NULL,
            product_id int(11) DEFAULT NULL,
            product_name varchar(255) DEFAULT NULL,
            product_price decimal(10,2) DEFAULT 0.00,
            product_quantity int(11) DEFAULT 1,
            total_amount decimal(10,2) DEFAULT 0.00,
            discount_amount decimal(10,2) DEFAULT 0.00,
            points_used int(11) DEFAULT 0,
            points_amount decimal(10,2) DEFAULT 0.00,
            payment_method varchar(20) DEFAULT 'wechat' COMMENT 'wechat:微信支付 balance:余额支付',
            payment_status varchar(20) DEFAULT 'pending' COMMENT 'pending:待支付 paid:已支付 cancelled:已取消 refunded:已退款',
            shipping_status varchar(20) DEFAULT 'unshipped' COMMENT 'unshipped:未 shipped:已送达',
            address_id int(11) DEFAULT NULL,
            contact_name varchar(50) DEFAULT NULL,
            contact_phone varchar(20) DEFAULT NULL,
            address varchar(255) DEFAULT NULL,
            remark text DEFAULT NULL,
            created_at datetime DEFAULT NULL,
            updated_at datetime DEFAULT NULL,
            paid_at datetime DEFAULT NULL,
            shipped_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY order_no (order_no),
            KEY user_id (user_id),
            KEY payment_status (payment_status),
            KEY shipping_status (shipping_status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        // 支付记录表
        $payments_sql = "CREATE TABLE IF NOT EXISTS {$this->payments_table} (
            id int(11) NOT NULL AUTO_INCREMENT,
            order_id int(11) NOT NULL,
            payment_no varchar(50) DEFAULT NULL COMMENT '支付流水号',
            transaction_id varchar(50) DEFAULT NULL COMMENT '微信支付交易号',
            payment_method varchar(20) DEFAULT 'wechat',
            payment_amount decimal(10,2) DEFAULT 0.00,
            payment_status varchar(20) DEFAULT 'pending',
            payment_data text DEFAULT NULL COMMENT '支付相关数据',
            created_at datetime DEFAULT NULL,
            updated_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY payment_no (payment_no),
            KEY order_id (order_id),
            KEY transaction_id (transaction_id),
            KEY payment_status (payment_status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($orders_sql);
        dbDelta($payments_sql);
    }
    
    /**
     * 获取支付配置
     *
     * @return array 支付配置
     */
    private function get_pay_config() {
        return array(
            'appid' => get_option('sut_wechat_mini_appid', ''),
            'mch_id' => get_option('sut_wechat_mini_mch_id', ''),
            'key' => get_option('sut_wechat_mini_pay_key', ''),
            'cert_path' => get_option('sut_wechat_mini_cert_path', ''),
            'key_path' => get_option('sut_wechat_mini_key_path', ''),
            'notify_url' => home_url('/wp-admin/admin-ajax.php?action=sut_wechat_mini_pay_notify'),
            'refund_notify_url' => home_url('/wp-admin/admin-ajax.php?action=sut_wechat_mini_refund_notify'),
            'sandbox' => get_option('sut_wechat_mini_sandbox', 0) == 1,
        );
    }
    
    /**
     * 注册支付网关
     *
     * @param array $gateways 支付网关列表
     * @return array 支付网关列表
     */
    public function register_payment_gateways($gateways) {
        $gateways['wechat'] = array(
            'name' => __('微信支付', 'sut-wechat-mini'),
            'description' => __('使用微信支付进行付款', 'sut-wechat-mini'),
            'callback' => array($this, 'process_wechat_payment')
        );
        
        $gateways['balance'] = array(
            'name' => __('余额支付', 'sut-wechat-mini'),
            'description' => __('使用账户余额进行付款', 'sut-wechat-mini'),
            'callback' => array($this, 'process_balance_payment')
        );
        
        return $gateways;
    }
    
    /**
     * 创建订单
     *
     * @param array $order_data 订单数据
     * @return int|false 订单ID或false
     */
    public function create_order($order_data) {
        global $wpdb;
        
        $default_data = array(
            'order_no' => $this->generate_order_no(),
            'user_id' => 0,
            'product_id' => null,
            'product_name' => '',
            'product_price' => 0.00,
            'product_quantity' => 1,
            'total_amount' => 0.00,
            'discount_amount' => 0.00,
            'points_used' => 0,
            'points_amount' => 0.00,
            'payment_method' => 'wechat',
            'payment_status' => 'pending',
            'shipping_status' => 'unshipped',
            'address_id' => null,
            'contact_name' => '',
            'contact_phone' => '',
            'address' => '',
            'remark' => '',
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $order_data = wp_parse_args($order_data, $default_data);
        
        // 计算实际支付金额
        $order_data['total_amount'] = $order_data['product_price'] * $order_data['product_quantity'] - $order_data['discount_amount'] - $order_data['points_amount'];
        
        $result = $wpdb->insert(
            $this->orders_table,
            $order_data,
            array('%s', '%d', '%d', '%s', '%f', '%d', '%f', '%f', '%d', '%f', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        $order_id = $wpdb->insert_id;
        
        // 触发订单创建钩子
        do_action('sut_wechat_mini_order_created', $order_id, $order_data);
        
        return $order_id;
    }
    
    /**
     * 生成订单号
     *
     * @return string 订单号
     */
    private function generate_order_no() {
        return date('YmdHis') . rand(1000, 9999);
    }
    
    /**
     * 生成支付流水号
     *
     * @return string 支付流水号
     */
    private function generate_payment_no() {
        return 'PAY' . date('YmdHis') . rand(1000, 9999);
    }
    
    /**
     * 获取订单
     *
     * @param int $order_id 订单ID
     * @return object|null 订单对象
     */
    public function get_order($order_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->orders_table} WHERE id = %d",
            $order_id
        ));
    }
    
    /**
     * 根据订单号获取订单
     *
     * @param string $order_no 订单号
     * @return object|null 订单对象
     */
    public function get_order_by_no($order_no) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->orders_table} WHERE order_no = %s",
            $order_no
        ));
    }
    
    /**
     * 更新订单
     *
     * @param int $order_id 订单ID
     * @param array $order_data 订单数据
     * @return bool 是否更新成功
     */
    public function update_order($order_id, $order_data) {
        global $wpdb;
        
        if (empty($order_data)) {
            return false;
        }
        
        $order_data['updated_at'] = current_time('mysql');
        
        $format = array();
        foreach ($order_data as $key => $value) {
            if ($key === 'updated_at' || $key === 'paid_at' || $key === 'shipped_at') {
                $format[] = '%s';
            } elseif (in_array($key, array('user_id', 'product_id', 'product_quantity', 'points_used', 'address_id'))) {
                $format[] = '%d';
            } elseif (in_array($key, array('product_price', 'total_amount', 'discount_amount', 'points_amount'))) {
                $format[] = '%f';
            } else {
                $format[] = '%s';
            }
        }
        
        $result = $wpdb->update(
            $this->orders_table,
            $order_data,
            array('id' => $order_id),
            $format,
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 触发订单更新钩子
        do_action('sut_wechat_mini_order_updated', $order_id, $order_data);
        
        return true;
    }
    
    /**
     * 获取用户订单列表
     *
     * @param int $user_id 用户ID
     * @param string $payment_status 支付状态
     * @param string $shipping_status 发货状态
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 订单列表和分页信息
     */
    public function get_user_orders($user_id, $payment_status = '', $shipping_status = '', $page = 1, $per_page = 20) {
        global $wpdb;
        
        $where = "WHERE user_id = %d";
        $params = array($user_id);
        
        if (!empty($payment_status)) {
            $where .= " AND payment_status = %s";
            $params[] = $payment_status;
        }
        
        if (!empty($shipping_status)) {
            $where .= " AND shipping_status = %s";
            $params[] = $shipping_status;
        }
        
        $offset = ($page - 1) * $per_page;
        $limit = "LIMIT %d OFFSET %d";
        $params[] = $per_page;
        $params[] = $offset;
        
        $sql = "SELECT * FROM {$this->orders_table} $where ORDER BY created_at DESC $limit";
        $orders = $wpdb->get_results($wpdb->prepare($sql, $params));
        
        // 获取总数
        $count_sql = "SELECT COUNT(*) FROM {$this->orders_table} $where";
        $total = $wpdb->get_var($wpdb->prepare($count_sql, array_slice($params, 0, -2)));
        
        return array(
            'orders' => $orders,
            'total' => $total,
            'pages' => ceil($total / $per_page),
            'current_page' => $page
        );
    }
    
    /**
     * 创建支付记录
     *
     * @param int $order_id 订单ID
     * @param string $payment_method 支付方式
     * @param float $payment_amount 支付金额
     * @return int|false 支付记录ID或false
     */
    public function create_payment($order_id, $payment_method, $payment_amount) {
        global $wpdb;
        
        $order = $this->get_order($order_id);
        if (!$order) {
            return false;
        }
        
        $payment_data = array(
            'order_id' => $order_id,
            'payment_no' => $this->generate_payment_no(),
            'payment_method' => $payment_method,
            'payment_amount' => $payment_amount,
            'payment_status' => 'pending',
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $result = $wpdb->insert(
            $this->payments_table,
            $payment_data,
            array('%d', '%s', '%s', '%f', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        $payment_id = $wpdb->insert_id;
        
        // 触发支付记录创建钩子
        do_action('sut_wechat_mini_payment_created', $payment_id, $payment_data);
        
        return $payment_id;
    }
    
    /**
     * 获取支付记录
     *
     * @param int $payment_id 支付记录ID
     * @return object|null 支付记录对象
     */
    public function get_payment($payment_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->payments_table} WHERE id = %d",
            $payment_id
        ));
    }
    
    /**
     * 根据支付流水号获取支付记录
     *
     * @param string $payment_no 支付流水号
     * @return object|null 支付记录对象
     */
    public function get_payment_by_no($payment_no) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->payments_table} WHERE payment_no = %s",
            $payment_no
        ));
    }
    
    /**
     * 根据交易号获取支付记录
     *
     * @param string $transaction_id 交易号
     * @return object|null 支付记录对象
     */
    public function get_payment_by_transaction_id($transaction_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->payments_table} WHERE transaction_id = %s",
            $transaction_id
        ));
    }
    
    /**
     * 更新支付记录
     *
     * @param int $payment_id 支付记录ID
     * @param array $payment_data 支付数据
     * @return bool 是否更新成功
     */
    public function update_payment($payment_id, $payment_data) {
        global $wpdb;
        
        if (empty($payment_data)) {
            return false;
        }
        
        $payment_data['updated_at'] = current_time('mysql');
        
        $format = array();
        foreach ($payment_data as $key => $value) {
            if ($key === 'updated_at') {
                $format[] = '%s';
            } elseif ($key === 'order_id') {
                $format[] = '%d';
            } elseif ($key === 'payment_amount') {
                $format[] = '%f';
            } else {
                $format[] = '%s';
            }
        }
        
        $result = $wpdb->update(
            $this->payments_table,
            $payment_data,
            array('id' => $payment_id),
            $format,
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 触发支付记录更新钩子
        do_action('sut_wechat_mini_payment_updated', $payment_id, $payment_data);
        
        return true;
    }
    
    /**
     * 处理微信支付
     *
     * @param int $order_id 订单ID
     * @return array|false 支付参数或false
     */
    public function process_wechat_payment($order_id) {
        $order = $this->get_order($order_id);
        if (!$order) {
            return false;
        }
        
        // 创建支付记录
        $payment_id = $this->create_payment($order_id, 'wechat', $order->total_amount);
        if (!$payment_id) {
            return false;
        }
        
        $payment = $this->get_payment($payment_id);
        
        // 调用微信支付统一下单API
        $result = $this->wechat_unified_order($order, $payment);
        
        if ($result && isset($result['return_code']) && $result['return_code'] === 'SUCCESS') {
            // 更新支付记录
            $this->update_payment($payment_id, array(
                'payment_data' => json_encode($result)
            ));
            
            // 返回小程序支付参数
            return array(
                'payment_id' => $payment_id,
                'payment_no' => $payment->payment_no,
                'payment_params' => array(
                    'appId' => $this->config['appid'],
                    'timeStamp' => (string)time(),
                    'nonceStr' => md5(uniqid(mt_rand(), true)),
                    'package' => 'prepay_id=' . $result['prepay_id'],
                    'signType' => 'MD5'
                )
            );
        }
        
        return false;
    }
    
    /**
     * 处理余额支付
     *
     * @param int $order_id 订单ID
     * @return array|false 支付结果或false
     */
    public function process_balance_payment($order_id) {
        global $wpdb;
        
        $order = $this->get_order($order_id);
        if (!$order) {
            return false;
        }
        
        // 获取用户信息
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}sut_wxmini_users WHERE id = %d",
            $order->user_id
        ));
        
        if (!$user || $user->balance < $order->total_amount) {
            return false;
        }
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 创建支付记录
            $payment_id = $this->create_payment($order_id, 'balance', $order->total_amount);
            if (!$payment_id) {
                throw new Exception('创建支付记录失败');
            }
            
            // 扣除用户余额
            $result = $wpdb->query($wpdb->prepare(
                "UPDATE {$wpdb->prefix}sut_wxmini_users SET balance = balance - %f WHERE id = %d",
                $order->total_amount, $order->user_id
            ));
            
            if ($result === false) {
                throw new Exception('扣除用户余额失败');
            }
            
            // 更新支付记录状态
            $this->update_payment($payment_id, array(
                'payment_status' => 'paid',
                'transaction_id' => 'BALANCE_' . $payment_id
            ));
            
            // 更新订单状态
            $this->update_order($order_id, array(
                'payment_status' => 'paid',
                'paid_at' => current_time('mysql')
            ));
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 触发支付成功钩子
            do_action('sut_wechat_mini_payment_success', $payment_id, $order_id);
            
            return array(
                'payment_id' => $payment_id,
                'payment_no' => $this->get_payment($payment_id)->payment_no,
                'payment_status' => 'paid'
            );
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            return false;
        }
    }
    
    /**
     * 微信支付统一下单
     *
     * @param object $order 订单对象
     * @param object $payment 支付记录对象
     * @return array|false 统一下单结果或false
     */
    private function wechat_unified_order($order, $payment) {
        $url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        
        $params = array(
            'appid' => $this->config['appid'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => md5(uniqid(mt_rand(), true)),
            'body' => $order->product_name,
            'out_trade_no' => $payment->payment_no,
            'total_fee' => intval($order->total_amount * 100), // 转换为分
            'spbill_create_ip' => $_SERVER['REMOTE_ADDR'],
            'notify_url' => $this->config['notify_url'],
            'trade_type' => 'JSAPI',
            'openid' => $this->get_user_openid($order->user_id)
        );
        
        // 生成签名
        $params['sign'] = $this->generate_wechat_sign($params);
        
        // 转换为XML
        $xml = $this->array_to_xml($params);
        
        // 发送请求
        $response = wp_remote_post($url, array(
            'body' => $xml,
            'headers' => array('Content-Type' => 'text/xml'),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        // 解析响应
        $result = $this->xml_to_array($response['body']);
        
        // 验证签名
        if (!$this->verify_wechat_sign($result)) {
            return false;
        }
        
        return $result;
    }
    
    /**
     * 获取用户openid
     *
     * @param int $user_id 用户ID
     * @return string|null 用户openid
     */
    private function get_user_openid($user_id) {
        global $wpdb;
        
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT openid FROM {$wpdb->prefix}sut_wxmini_users WHERE id = %d",
            $user_id
        ));
        
        return $user ? $user->openid : null;
    }
    
    /**
     * 生成微信支付签名
     *
     * @param array $params 参数数组
     * @return string 签名
     */
    private function generate_wechat_sign($params) {
        // 过滤空值
        $params = array_filter($params, 'strlen');
        
        // 排序
        ksort($params);
        
        // 拼接
        $string = '';
        foreach ($params as $key => $value) {
            if ($key !== 'sign') {
                $string .= $key . '=' . $value . '&';
            }
        }
        $string .= 'key=' . $this->config['key'];
        
        // MD5加密并转为大写
        return strtoupper(md5($string));
    }
    
    /**
     * 验证微信支付签名
     *
     * @param array $params 参数数组
     * @return bool 是否验证通过
     */
    private function verify_wechat_sign($params) {
        if (!isset($params['sign'])) {
            return false;
        }
        
        $sign = $params['sign'];
        unset($params['sign']);
        
        return $sign === $this->generate_wechat_sign($params);
    }
    
    /**
     * 数组转XML
     *
     * @param array $array 数组
     * @return string XML字符串
     */
    private function array_to_xml($array) {
        $xml = '<xml>';
        foreach ($array as $key => $value) {
            $xml .= '<' . $key . '>' . $value . '</' . $key . '>';
        }
        $xml .= '</xml>';
        
        return $xml;
    }
    
    /**
     * XML转数组
     *
     * @param string $xml XML字符串
     * @return array 数组
     */
    private function xml_to_array($xml) {
        return json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);
    }
    
    /**
     * 处理支付回调
     */
    public function handle_payment_notify() {
        $xml = file_get_contents('php://input');
        $data = $this->xml_to_array($xml);
        
        // 验证签名
        if (!$this->verify_wechat_sign($data)) {
            echo $this->array_to_xml(array('return_code' => 'FAIL', 'return_msg' => '签名失败'));
            exit;
        }
        
        // 检查支付结果
        if ($data['return_code'] !== 'SUCCESS' || $data['result_code'] !== 'SUCCESS') {
            echo $this->array_to_xml(array('return_code' => 'FAIL', 'return_msg' => '支付失败'));
            exit;
        }
        
        // 获取支付记录
        $payment = $this->get_payment_by_no($data['out_trade_no']);
        if (!$payment) {
            echo $this->array_to_xml(array('return_code' => 'FAIL', 'return_msg' => '支付记录不存在'));
            exit;
        }
        
        // 检查支付状态
        if ($payment->payment_status === 'paid') {
            echo $this->array_to_xml(array('return_code' => 'SUCCESS', 'return_msg' => 'OK'));
            exit;
        }
        
        global $wpdb;
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 更新支付记录
            $this->update_payment($payment->id, array(
                'payment_status' => 'paid',
                'transaction_id' => $data['transaction_id'],
                'payment_data' => json_encode($data)
            ));
            
            // 更新订单状态
            $this->update_order($payment->order_id, array(
                'payment_status' => 'paid',
                'paid_at' => current_time('mysql')
            ));
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 触发支付成功钩子
            do_action('sut_wechat_mini_payment_success', $payment->id, $payment->order_id);
            
            echo $this->array_to_xml(array('return_code' => 'SUCCESS', 'return_msg' => 'OK'));
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            echo $this->array_to_xml(array('return_code' => 'FAIL', 'return_msg' => '处理失败'));
        }
        
        exit;
    }
    
    /**
     * 处理退款回调
     */
    public function handle_refund_notify() {
        $xml = file_get_contents('php://input');
        $data = $this->xml_to_array($xml);
        
        // 解密退款信息
        if (isset($data['req_info'])) {
            $req_info = $this->decrypt_wechat_data($data['req_info']);
            $refund_data = $this->xml_to_array($req_info);
            
            // 获取支付记录
            $payment = $this->get_payment_by_transaction_id($refund_data['out_trade_no']);
            if (!$payment) {
                echo $this->array_to_xml(array('return_code' => 'FAIL', 'return_msg' => '支付记录不存在'));
                exit;
            }
            
            // 更新支付记录
            $this->update_payment($payment->id, array(
                'payment_data' => json_encode($refund_data)
            ));
            
            // 更新订单状态
            $this->update_order($payment->order_id, array(
                'payment_status' => 'refunded'
            ));
            
            // 触发退款成功钩子
            do_action('sut_wechat_mini_refund_success', $payment->id, $payment->order_id);
        }
        
        echo $this->array_to_xml(array('return_code' => 'SUCCESS', 'return_msg' => 'OK'));
        exit;
    }
    
    /**
     * 解密微信数据
     *
     * @param string $data 加密数据
     * @return string 解密后数据
     */
    private function decrypt_wechat_data($data) {
        $key = md5($this->config['key']);
        $data = base64_decode($data);
        
        return openssl_decrypt($data, 'AES-256-ECB', $key, OPENSSL_RAW_DATA);
    }
    
    /**
     * 申请退款
     *
     * @param int $payment_id 支付记录ID
     * @param float $refund_amount 退款金额
     * @param string $reason 退款原因
     * @return array|false 退款结果或false
     */
    public function refund($payment_id, $refund_amount, $reason = '') {
        $payment = $this->get_payment($payment_id);
        if (!$payment || $payment->payment_status !== 'paid') {
            return false;
        }
        
        if ($refund_amount > $payment->payment_amount) {
            return false;
        }
        
        $order = $this->get_order($payment->order_id);
        if (!$order) {
            return false;
        }
        
        // 如果是余额支付，直接退款
        if ($payment->payment_method === 'balance') {
            global $wpdb;
            
            // 开始事务
            $wpdb->query('START TRANSACTION');
            
            try {
                // 退还用户余额
                $result = $wpdb->query($wpdb->prepare(
                    "UPDATE {$wpdb->prefix}sut_wxmini_users SET balance = balance + %f WHERE id = %d",
                    $refund_amount, $order->user_id
                ));
                
                if ($result === false) {
                    throw new Exception('退还用户余额失败');
                }
                
                // 更新支付记录
                $this->update_payment($payment_id, array(
                    'payment_status' => 'refunded',
                    'payment_data' => json_encode(array(
                        'refund_amount' => $refund_amount,
                        'refund_reason' => $reason,
                        'refund_time' => current_time('mysql')
                    ))
                ));
                
                // 更新订单状态
                $this->update_order($order->id, array(
                    'payment_status' => 'refunded'
                ));
                
                // 提交事务
                $wpdb->query('COMMIT');
                
                // 触发退款成功钩子
                do_action('sut_wechat_mini_refund_success', $payment_id, $order->id);
                
                return array(
                    'success' => true,
                    'refund_amount' => $refund_amount
                );
            } catch (Exception $e) {
                // 回滚事务
                $wpdb->query('ROLLBACK');
                return false;
            }
        }
        
        // 微信支付退款
        $url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';
        
        $params = array(
            'appid' => $this->config['appid'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => md5(uniqid(mt_rand(), true)),
            'out_trade_no' => $payment->payment_no,
            'out_refund_no' => 'REFUND' . date('YmdHis') . rand(1000, 9999),
            'total_fee' => intval($payment->payment_amount * 100), // 转换为分
            'refund_fee' => intval($refund_amount * 100), // 转换为分
            'refund_desc' => $reason
        );
        
        // 生成签名
        $params['sign'] = $this->generate_wechat_sign($params);
        
        // 转换为XML
        $xml = $this->array_to_xml($params);
        
        // 使用证书发送请求
        $cert_file = $this->config['cert_path'];
        $key_file = $this->config['key_path'];
        
        $response = wp_remote_post($url, array(
            'body' => $xml,
            'headers' => array('Content-Type' => 'text/xml'),
            'timeout' => 30,
            'sslcertificates' => $cert_file,
            'sslkey' => $key_file
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        // 解析响应
        $result = $this->xml_to_array($response['body']);
        
        // 验证签名
        if (!$this->verify_wechat_sign($result)) {
            return false;
        }
        
        // 检查退款结果
        if ($result['return_code'] !== 'SUCCESS' || $result['result_code'] !== 'SUCCESS') {
            return false;
        }
        
        // 更新支付记录
        $this->update_payment($payment_id, array(
            'payment_data' => json_encode($result)
        ));
        
        // 更新订单状态
        $this->update_order($order->id, array(
            'payment_status' => 'refunding'
        ));
        
        return array(
            'success' => true,
            'refund_id' => $result['refund_id'],
            'refund_amount' => $refund_amount
        );
    }
    
    /**
     * 查询支付状态
     *
     * @param string $payment_no 支付流水号
     * @return array|false 支付状态或false
     */
    public function query_payment($payment_no) {
        $url = 'https://api.mch.weixin.qq.com/pay/orderquery';
        
        $params = array(
            'appid' => $this->config['appid'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $payment_no,
            'nonce_str' => md5(uniqid(mt_rand(), true))
        );
        
        // 生成签名
        $params['sign'] = $this->generate_wechat_sign($params);
        
        // 转换为XML
        $xml = $this->array_to_xml($params);
        
        // 发送请求
        $response = wp_remote_post($url, array(
            'body' => $xml,
            'headers' => array('Content-Type' => 'text/xml'),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        // 解析响应
        $result = $this->xml_to_array($response['body']);
        
        // 验证签名
        if (!$this->verify_wechat_sign($result)) {
            return false;
        }
        
        return $result;
    }
    
    /**
     * 查询退款状态
     *
     * @param string $refund_no 退款单号
     * @return array|false 退款状态或false
     */
    public function query_refund($refund_no) {
        $url = 'https://api.mch.weixin.qq.com/pay/refundquery';
        
        $params = array(
            'appid' => $this->config['appid'],
            'mch_id' => $this->config['mch_id'],
            'out_refund_no' => $refund_no,
            'nonce_str' => md5(uniqid(mt_rand(), true))
        );
        
        // 生成签名
        $params['sign'] = $this->generate_wechat_sign($params);
        
        // 转换为XML
        $xml = $this->array_to_xml($params);
        
        // 发送请求
        $response = wp_remote_post($url, array(
            'body' => $xml,
            'headers' => array('Content-Type' => 'text/xml'),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        // 解析响应
        $result = $this->xml_to_array($response['body']);
        
        // 验证签名
        if (!$this->verify_wechat_sign($result)) {
            return false;
        }
        
        return $result;
    }
}