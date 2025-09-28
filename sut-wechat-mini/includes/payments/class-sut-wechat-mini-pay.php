<?php
/**
 * SUT微信小程序支付集成类
 *
 * 处理微信支付相关功能，包括支付创建、回调处理等
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Pay 类
 */
class SUT_WeChat_Mini_Pay {
    
    /**
     * 支付集成实例
     *
     * @var SUT_WeChat_Mini_Pay
     */
    private static $instance = null;
    
    /**
     * 微信支付配置
     *
     * @var array
     */
    private $config = array();
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_Pay
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化支付配置
     */
    private function init() {
        // 获取支付配置
        $this->config = array(
            'app_id' => get_option( 'sut_wechat_mini_app_id', '' ),
            'mch_id' => get_option( 'sut_wechat_mini_mch_id', '' ),
            'api_key' => get_option( 'sut_wechat_mini_api_key', '' ),
            'notify_url' => home_url( '/sut-wechat-mini-api/payment/notify' ),
            'cert_path' => get_option( 'sut_wechat_mini_cert_path', '' ),
            'key_path' => get_option( 'sut_wechat_mini_key_path', '' ),
            'sandbox' => get_option( 'sut_wechat_mini_pay_sandbox', false ),
        );
        
        // 注册支付相关的设置项
        add_filter( 'sut_wechat_mini_settings', array( $this, 'add_payment_settings' ) );
        
        // 注册支付相关的API路由
        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_payment_routes' ) );
    }
    
    /**
     * 添加支付相关的设置项
     *
     * @param array $settings 现有设置项
     * @return array 修改后的设置项
     */
    public function add_payment_settings( $settings ) {
        $payment_settings = array(
            'title' => __( '支付设置', 'sut-wechat-mini' ),
            'fields' => array(
                array(
                    'id' => 'mch_id',
                    'title' => __( '商户ID', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '微信支付商户ID', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'api_key',
                    'title' => __( 'API密钥', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '微信支付API密钥', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'cert_path',
                    'title' => __( '证书路径', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '微信支付证书路径（绝对路径）', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'key_path',
                    'title' => __( '密钥路径', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '微信支付密钥路径（绝对路径）', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'pay_sandbox',
                    'title' => __( '沙箱模式', 'sut-wechat-mini' ),
                    'type' => 'checkbox',
                    'desc' => __( '开启沙箱测试模式', 'sut-wechat-mini' ),
                    'default' => false,
                ),
            ),
        );
        
        $settings['payment'] = $payment_settings;
        
        return $settings;
    }
    
    /**
     * 添加支付相关的API路由
     *
     * @param array $routes 现有路由
     * @return array 修改后的路由
     */
    public function add_payment_routes( $routes ) {
        // 支付相关API路由已经在WooCommerce集成类中添加
        return $routes;
    }
    
    /**
     * 创建支付
     *
     * @param WC_Order $order 订单对象
     * @param int $user_id 用户ID
     * @return array|WP_Error 支付参数或错误对象
     */
    public function create_payment( $order, $user_id ) {
        // 检查支付配置是否完整
        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '支付配置不完整', 'sut-wechat-mini' ) );
        }
        
        // 获取用户的openid
        $openid = get_user_meta( $user_id, '_sut_wechat_mini_openid', true );
        
        if ( empty( $openid ) ) {
            return new WP_Error( 'openid_not_found', __( '用户微信信息未找到', 'sut-wechat-mini' ) );
        }
        
        // 构建统一下单参数
        $nonce_str = $this->generate_nonce_str();
        $total_fee = intval( $order->get_total() * 100 ); // 转换为分
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
            'body' => $this->get_order_description( $order ),
            'out_trade_no' => $order->get_order_number(),
            'total_fee' => $total_fee,
            'spbill_create_ip' => $this->get_client_ip(),
            'notify_url' => $this->config['notify_url'],
            'trade_type' => 'JSAPI',
            'openid' => $openid,
        );
        
        // 添加沙箱模式参数
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 生成签名
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 转换为XML
        $xml = $this->array_to_xml( $params );
        
        // 发送请求到微信支付服务器
        $gateway_url = $this->get_gateway_url( 'unifiedorder' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 解析XML响应
        $result = $this->xml_to_array( $response );
        
        // 检查响应结果
        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '请求失败', 'sut-wechat-mini' );
            return new WP_Error( 'payment_request_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '业务处理失败', 'sut-wechat-mini' );
            return new WP_Error( 'payment_business_failed', $error_msg );
        }
        
        // 生成小程序支付参数
        $time_stamp = (string) time();
        $package = 'prepay_id=' . $result['prepay_id'];
        $pay_sign = $this->generate_pay_sign( $time_stamp, $nonce_str, $package );
        
        $payment_params = array(
            'timeStamp' => $time_stamp,
            'nonceStr' => $nonce_str,
            'package' => $package,
            'signType' => 'MD5',
            'paySign' => $pay_sign,
            'appId' => $this->config['app_id'],
        );
        
        return $payment_params;
    }
    
    /**
     * 验证支付回调签名
     *
     * @param array $data 回调数据
     * @return bool 验证结果
     */
    public function verify_notify_sign( $data ) {
        // 复制数据，移除sign字段
        $params = $data;
        if ( isset( $params['sign'] ) ) {
            unset( $params['sign'] );
        }
        
        // 生成签名
        $sign = $this->generate_sign( $params );
        
        // 比较签名
        return $sign === $data['sign'];
    }
    
    /**
     * 查询订单
     *
     * @param string $out_trade_no 商户订单号
     * @return array|WP_Error 查询结果或错误对象
     */
    public function query_order( $out_trade_no ) {
        // 检查支付配置是否完整
        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '支付配置不完整', 'sut-wechat-mini' ) );
        }
        
        // 构建查询参数
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $out_trade_no,
            'nonce_str' => $nonce_str,
        );
        
        // 添加沙箱模式参数
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 生成签名
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 转换为XML
        $xml = $this->array_to_xml( $params );
        
        // 发送请求到微信支付服务器
        $gateway_url = $this->get_gateway_url( 'orderquery' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 解析XML响应
        $result = $this->xml_to_array( $response );
        
        // 检查响应结果
        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '查询失败', 'sut-wechat-mini' );
            return new WP_Error( 'query_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '业务处理失败', 'sut-wechat-mini' );
            return new WP_Error( 'query_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 关闭订单
     *
     * @param string $out_trade_no 商户订单号
     * @return array|WP_Error 关闭结果或错误对象
     */
    public function close_order( $out_trade_no ) {
        // 检查支付配置是否完整
        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '支付配置不完整', 'sut-wechat-mini' ) );
        }
        
        // 构建关闭参数
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $out_trade_no,
            'nonce_str' => $nonce_str,
        );
        
        // 添加沙箱模式参数
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 生成签名
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 转换为XML
        $xml = $this->array_to_xml( $params );
        
        // 发送请求到微信支付服务器
        $gateway_url = $this->get_gateway_url( 'closeorder' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 解析XML响应
        $result = $this->xml_to_array( $response );
        
        // 检查响应结果
        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '关闭失败', 'sut-wechat-mini' );
            return new WP_Error( 'close_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '业务处理失败', 'sut-wechat-mini' );
            return new WP_Error( 'close_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 申请退款
     *
     * @param string $out_trade_no 商户订单号
     * @param string $out_refund_no 商户退款单号
     * @param float $total_fee 订单总金额
     * @param float $refund_fee 退款金额
     * @return array|WP_Error 退款结果或错误对象
     */
    public function refund( $out_trade_no, $out_refund_no, $total_fee, $refund_fee ) {
        // 检查支付配置是否完整
        if ( ! $this->is_config_valid( true ) ) {
            return new WP_Error( 'payment_config_invalid', __( '支付配置不完整或证书不存在', 'sut-wechat-mini' ) );
        }
        
        // 转换金额为分
        $total_fee = intval( $total_fee * 100 );
        $refund_fee = intval( $refund_fee * 100 );
        
        // 构建退款参数
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
            'out_trade_no' => $out_trade_no,
            'out_refund_no' => $out_refund_no,
            'total_fee' => $total_fee,
            'refund_fee' => $refund_fee,
            'refund_desc' => __( '用户申请退款', 'sut-wechat-mini' ),
        );
        
        // 添加沙箱模式参数
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 生成签名
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 转换为XML
        $xml = $this->array_to_xml( $params );
        
        // 发送请求到微信支付服务器（需要证书）
        $gateway_url = $this->get_gateway_url( 'refund' );
        $response = $this->send_request_with_cert( $gateway_url, $xml );
        
        // 解析XML响应
        $result = $this->xml_to_array( $response );
        
        // 检查响应结果
        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '退款申请失败', 'sut-wechat-mini' );
            return new WP_Error( 'refund_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '业务处理失败', 'sut-wechat-mini' );
            return new WP_Error( 'refund_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 检查支付配置是否有效
     *
     * @param bool $check_cert 是否检查证书
     * @return bool 配置是否有效
     */
    private function is_config_valid( $check_cert = false ) {
        // 检查基本配置
        if ( empty( $this->config['app_id'] ) || empty( $this->config['mch_id'] ) || empty( $this->config['api_key'] ) ) {
            return false;
        }
        
        // 检查证书配置（如果需要）
        if ( $check_cert && ( empty( $this->config['cert_path'] ) || empty( $this->config['key_path'] ) || ! file_exists( $this->config['cert_path'] ) || ! file_exists( $this->config['key_path'] ) ) ) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 生成随机字符串
     *
     * @param int $length 字符串长度
     * @return string 随机字符串
     */
    private function generate_nonce_str( $length = 32 ) {
        $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        $str = "";
        for ( $i = 0; $i < $length; $i++ ) {
            $str .= substr( $chars, mt_rand( 0, strlen( $chars ) - 1 ), 1 );
        }
        return $str;
    }
    
    /**
     * 生成签名
     *
     * @param array $params 参数数组
     * @return string 签名
     */
    private function generate_sign( $params ) {
        // 按字典序排序
        ksort( $params );
        
        // 拼接字符串
        $string = '';
        foreach ( $params as $key => $value ) {
            if ( $value && $key != 'sign' ) {
                $string .= $key . '=' . $value . '&';
            }
        }
        
        // 添加API密钥
        $string .= 'key=' . $this->config['api_key'];
        
        // MD5加密并转换为大写
        $sign = strtoupper( md5( $string ) );
        
        return $sign;
    }
    
    /**
     * 生成支付签名（小程序端使用）
     *
     * @param string $time_stamp 时间戳
     * @param string $nonce_str 随机字符串
     * @param string $package 订单包
     * @return string 支付签名
     */
    private function generate_pay_sign( $time_stamp, $nonce_str, $package ) {
        // 构建签名参数
        $params = array(
            'appId' => $this->config['app_id'],
            'timeStamp' => $time_stamp,
            'nonceStr' => $nonce_str,
            'package' => $package,
            'signType' => 'MD5',
        );
        
        // 按字典序排序
        ksort( $params );
        
        // 拼接字符串
        $string = '';
        foreach ( $params as $key => $value ) {
            $string .= $key . '=' . $value . '&';
        }
        
        // 添加API密钥
        $string .= 'key=' . $this->config['api_key'];
        
        // MD5加密并转换为大写
        $sign = strtoupper( md5( $string ) );
        
        return $sign;
    }
    
    /**
     * 获取订单描述
     *
     * @param WC_Order $order 订单对象
     * @return string 订单描述
     */
    private function get_order_description( $order ) {
        $site_name = get_bloginfo( 'name' );
        $description = sprintf( __( '%s - 订单 %s', 'sut-wechat-mini' ), $site_name, $order->get_order_number() );
        
        // 限制描述长度
        if ( strlen( $description ) > 127 ) {
            $description = substr( $description, 0, 124 ) . '...';
        }
        
        return $description;
    }
    
    /**
     * 获取客户端IP地址
     *
     * @return string IP地址
     */
    private function get_client_ip() {
        $ip = '';
        if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // 处理多个IP地址的情况
        if ( strpos( $ip, ',' ) !== false ) {
            $ips = explode( ',', $ip );
            $ip = trim( $ips[0] );
        }
        
        return $ip;
    }
    
    /**
     * 获取微信支付网关URL
     *
     * @param string $api_name API名称
     * @return string 网关URL
     */
    private function get_gateway_url( $api_name ) {
        $base_url = $this->config['sandbox'] ? 'https://api.mch.weixin.qq.com/sandboxnew/' : 'https://api.mch.weixin.qq.com/pay/';
        return $base_url . $api_name . '.php';
    }
    
    /**
     * 获取沙箱环境的signkey
     *
     * @return string 沙箱signkey
     */
    private function get_sandbox_signkey() {
        // 构建请求参数
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
        );
        
        // 生成签名
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 转换为XML
        $xml = $this->array_to_xml( $params );
        
        // 发送请求
        $url = 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey';
        $response = $this->send_request( $url, $xml );
        
        // 解析响应
        $result = $this->xml_to_array( $response );
        
        // 返回signkey
        if ( $result && $result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS' ) {
            return $result['sandbox_signkey'];
        }
        
        return '';
    }
    
    /**
     * 发送HTTP请求
     *
     * @param string $url 请求URL
     * @param string $data 请求数据
     * @return string 响应数据
     */
    private function send_request( $url, $data ) {
        $ch = curl_init();
        
        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_POST, 1 );
        curl_setopt( $ch, CURLOPT_POSTFIELDS, $data );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 0 );
        curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
        
        $response = curl_exec( $ch );
        
        if ( curl_errno( $ch ) ) {
            error_log( 'SUT微信小程序支付请求错误: ' . curl_error( $ch ) );
        }
        
        curl_close( $ch );
        
        return $response;
    }
    
    /**
     * 发送带证书的HTTP请求
     *
     * @param string $url 请求URL
     * @param string $data 请求数据
     * @return string 响应数据
     */
    private function send_request_with_cert( $url, $data ) {
        $ch = curl_init();
        
        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_POST, 1 );
        curl_setopt( $ch, CURLOPT_POSTFIELDS, $data );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 0 );
        curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
        
        // 设置证书
        curl_setopt( $ch, CURLOPT_SSLCERTTYPE, 'PEM' );
        curl_setopt( $ch, CURLOPT_SSLCERT, $this->config['cert_path'] );
        curl_setopt( $ch, CURLOPT_SSLKEYTYPE, 'PEM' );
        curl_setopt( $ch, CURLOPT_SSLKEY, $this->config['key_path'] );
        
        $response = curl_exec( $ch );
        
        if ( curl_errno( $ch ) ) {
            error_log( 'SUT微信小程序支付证书请求错误: ' . curl_error( $ch ) );
        }
        
        curl_close( $ch );
        
        return $response;
    }
    
    /**
     * 数组转XML
     *
     * @param array $arr 数组
     * @return string XML字符串
     */
    private function array_to_xml( $arr ) {
        $xml = '<xml>';
        foreach ( $arr as $key => $val ) {
            if ( is_numeric( $val ) ) {
                $xml .= '<' . $key . '>' . $val . '</' . $key . '>';
            } else {
                $xml .= '<' . $key . '><![CDATA[' . $val . ']]></' . $key . '>';
            }
        }
        $xml .= '</xml>';
        
        return $xml;
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
 * 初始化支付集成
 */
function sut_wechat_mini_pay_init() {
    SUT_WeChat_Mini_Pay::get_instance();
}

add_action( 'plugins_loaded', 'sut_wechat_mini_pay_init' );