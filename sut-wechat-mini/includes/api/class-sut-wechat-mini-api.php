<?php
/**
 * SUT微信小程序API核心类
 *
 * 处理微信小程序的所有API请求和响应，提供统一的接口管理
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_API 类
 */
class SUT_WeChat_Mini_API {
    
    /**
     * API实例
     *
     * @var SUT_WeChat_Mini_API
     */
    private static $instance = null;
    
    /**
     * 路由规则
     *
     * @var array
     */
    private $routes = array();
    
    /**
     * 错误代码映射
     *
     * @var array
     */
    private $error_codes = array(
        0   => 'success',
        100 => '参数错误',
        101 => '未授权',
        102 => 'Token过期',
        103 => '操作失败',
        104 => '资源不存在',
        105 => '服务器错误',
        106 => '请求频率过高',
        107 => '登录失败',
        108 => '权限不足',
        109 => '数据库错误',
    );
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_API
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化API
     */
    private function init() {
        // 注册重写规则
        add_action( 'init', array( $this, 'register_rewrite_rules' ) );
        
        // 处理API请求
        add_action( 'template_redirect', array( $this, 'handle_api_requests' ) );
        
        // 注册API路由
        $this->register_routes();
        
        // 添加REST API支持
        add_filter( 'rest_pre_serve_request', array( $this, 'rest_pre_serve_request' ), 10, 4 );
    }
    
    /**
     * 注册重写规则
     */
    public function register_rewrite_rules() {
        add_rewrite_rule( '^sut-wxapp-api/([^/]*)/?', 'index.php?sut_wxa_action=$matches[1]', 'top' );
        add_rewrite_tag( '%sut_wxa_action%', '([^&]+)' );
    }
    
    /**
     * 注册API路由
     */
    private function register_routes() {
        // 基础API
        $this->routes['ping'] = array( 'callback' => array( $this, 'api_ping' ) );
        $this->routes['login'] = array( 'callback' => array( $this, 'api_login' ) );
        
        // 用户相关API
        $this->routes['user/profile'] = array( 'callback' => array( $this, 'api_user_profile' ), 'auth' => true );
        $this->routes['user/update'] = array( 'callback' => array( $this, 'api_user_update' ), 'auth' => true );
        
        // 内容相关API
        $this->routes['posts'] = array( 'callback' => array( $this, 'api_get_posts' ) );
        $this->routes['posts/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_post' ) );
        $this->routes['categories'] = array( 'callback' => array( $this, 'api_get_categories' ) );
        $this->routes['tags'] = array( 'callback' => array( $this, 'api_get_tags' ) );
        
        // 允许其他模块添加路由
        $this->routes = apply_filters( 'sut_wechat_mini_api_routes', $this->routes );
    }
    
    /**
     * 处理API请求
     */
    public function handle_api_requests() {
        global $wp;
        
        // 检查是否为API请求
        if ( ! isset( $wp->query_vars['sut_wxa_action'] ) ) {
            return;
        }
        
        $action = $wp->query_vars['sut_wxa_action'];
        $request_data = $this->get_request_data();
        
        // 查找匹配的路由
        $route_matched = false;
        foreach ( $this->routes as $route_pattern => $route_info ) {
            $pattern = '^' . str_replace( '\/', '\\/', $route_pattern ) . '$';
            if ( preg_match( "/$pattern/", $action, $matches ) ) {
                $route_matched = true;
                
                // 检查是否需要授权
                if ( isset( $route_info['auth'] ) && $route_info['auth'] ) {
                    $user_id = $this->authenticate_request();
                    if ( ! $user_id ) {
                        $this->send_response( array(), 101, __( '未授权', 'sut-wechat-mini' ) );
                        exit;
                    }
                    $request_data['user_id'] = $user_id;
                }
                
                // 调用回调函数
                $response_data = call_user_func_array( $route_info['callback'], array( $request_data, $matches ) );
                
                // 发送响应
                if ( is_array( $response_data ) && isset( $response_data['code'] ) ) {
                    $this->send_response( $response_data['data'], $response_data['code'], $response_data['message'] );
                } else {
                    $this->send_response( $response_data );
                }
                
                exit;
            }
        }
        
        // 如果没有匹配的路由
        if ( ! $route_matched ) {
            $this->send_response( array(), 104, __( '资源不存在', 'sut-wechat-mini' ) );
            exit;
        }
    }
    
    /**
     * 获取请求数据
     *
     * @return array
     */
    private function get_request_data() {
        $method = $_SERVER['REQUEST_METHOD'];
        $data = array();
        
        if ( 'GET' === $method ) {
            $data = $_GET;
        } elseif ( 'POST' === $method ) {
            // 尝试获取JSON数据
            $json_data = file_get_contents( 'php://input' );
            if ( $json_data ) {
                $data = json_decode( $json_data, true );
            }
            
            // 如果JSON解析失败，使用表单数据
            if ( ! $data ) {
                $data = $_POST;
            }
        }
        
        return $data;
    }
    
    /**
     * 验证请求
     *
     * @return int|false 用户ID或false
     */
    private function authenticate_request() {
        // 从请求头中获取Token
        $headers = getallheaders();
        $token = isset( $headers['Authorization'] ) ? str_replace( 'Bearer ', '', $headers['Authorization'] ) : '';
        
        // 从请求参数中获取Token
        if ( empty( $token ) ) {
            $token = isset( $_REQUEST['token'] ) ? $_REQUEST['token'] : '';
        }
        
        if ( empty( $token ) ) {
            return false;
        }
        
        // 验证Token
        $user_id = $this->verify_token( $token );
        
        return $user_id;
    }
    
    /**
     * 验证Token
     *
     * @param string $token Token值
     * @return int|false 用户ID或false
     */
    private function verify_token( $token ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 查找Token对应的用户
        $user = $wpdb->get_row( $wpdb->prepare( "SELECT user_id FROM $table_name WHERE token = %s", $token ) );
        
        if ( $user && $user->user_id ) {
            return $user->user_id;
        }
        
        return false;
    }
    
    /**
     * 发送API响应
     *
     * @param mixed $data 响应数据
     * @param int $code 状态码
     * @param string $message 消息
     */
    private function send_response( $data = array(), $code = 0, $message = '' ) {
        // 设置响应头
        header( 'Content-Type: application/json; charset=utf-8' );
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
        
        // 如果消息为空，使用默认消息
        if ( empty( $message ) && isset( $this->error_codes[$code] ) ) {
            $message = $this->error_codes[$code];
        }
        
        // 构建响应数据
        $response = array(
            'code'    => $code,
            'message' => $message,
            'data'    => $data,
            'time'    => time(),
        );
        
        // 发送响应
        echo json_encode( $response, JSON_UNESCAPED_UNICODE );
        exit;
    }
    
    /**
     * REST API响应处理
     *
     * @param bool $served 响应是否已发送
     * @param WP_HTTP_Response $result 响应结果
     * @param WP_REST_Request $request 请求对象
     * @param WP_REST_Server $server 服务器对象
     * @return bool
     */
    public function rest_pre_serve_request( $served, $result, $request, $server ) {
        // 检查是否为小程序请求
        $user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? $_SERVER['HTTP_USER_AGENT'] : '';
        if ( strpos( $user_agent, 'miniProgram' ) !== false ) {
            // 修改响应格式
            $data = $result->get_data();
            $code = 0;
            $message = 'success';
            
            if ( is_wp_error( $data ) ) {
                $code = 103;
                $message = $data->get_error_message();
                $data = array();
            }
            
            $response = array(
                'code'    => $code,
                'message' => $message,
                'data'    => $data,
                'time'    => time(),
            );
            
            // 发送修改后的响应
            header( 'Content-Type: application/json; charset=utf-8' );
            echo json_encode( $response, JSON_UNESCAPED_UNICODE );
            
            return true;
        }
        
        return $served;
    }
    
    /*************************
     * API方法实现
     *************************/
    
    /**
     * 测试API连接
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_ping( $data, $matches ) {
        return array(
            'pong' => time(),
            'version' => SUT_WECHAT_MINI_VERSION,
            'message' => __( 'API连接成功', 'sut-wechat-mini' )
        );
    }
    
    /**
     * 用户登录
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_login( $data, $matches ) {
        // 检查必要参数
        if ( ! isset( $data['code'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '参数错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取微信小程序用户信息
        $code = $data['code'];
        $user_info = isset( $data['user_info'] ) ? $data['user_info'] : array();
        
        // 调用微信登录接口
        $wx_user = $this->wechat_login( $code );
        if ( is_wp_error( $wx_user ) ) {
            return array(
                'code' => 107,
                'message' => $wx_user->get_error_message(),
                'data' => array()
            );
        }
        
        // 处理用户登录
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $result = $sut_wxa_users->login_user( $wx_user, $user_info );
        
        return $result;
    }
    
    /**
     * 获取用户信息
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_user_profile( $data, $matches ) {
        $user_id = $data['user_id'];
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $profile = $sut_wxa_users->get_user_profile( $user_id );
        
        return $profile;
    }
    
    /**
     * 更新用户信息
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_user_update( $data, $matches ) {
        $user_id = $data['user_id'];
        unset( $data['user_id'] );
        
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $result = $sut_wxa_users->update_user_profile( $user_id, $data );
        
        return $result;
    }
    
    /**
     * 获取文章列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_get_posts( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $posts = $sut_wxa_content->get_posts( $data );
        
        return $posts;
    }
    
    /**
     * 获取单篇文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_get_post( $data, $matches ) {
        $post_id = $matches[1];
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $post = $sut_wxa_content->get_post( $post_id );
        
        return $post;
    }
    
    /**
     * 获取分类列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_get_categories( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $categories = $sut_wxa_content->get_categories( $data );
        
        return $categories;
    }
    
    /**
     * 获取标签列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array
     */
    public function api_get_tags( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $tags = $sut_wxa_content->get_tags( $data );
        
        return $tags;
    }
    
    /**
     * 微信登录
     *
     * @param string $code 登录凭证
     * @return array|WP_Error
     */
    private function wechat_login( $code ) {
        $appid = get_option( 'sut_wechat_mini_appid' );
        $appsecret = get_option( 'sut_wechat_mini_appsecret' );
        
        if ( empty( $appid ) || empty( $appsecret ) ) {
            return new WP_Error( 'wechat_config_error', __( '微信小程序配置未完成', 'sut-wechat-mini' ) );
        }
        
        // 调用微信登录接口
        $url = "https://api.weixin.qq.com/sns/jscode2session?appid={$appid}&secret={$appsecret}&js_code={$code}&grant_type=authorization_code";
        $response = wp_remote_get( $url );
        
        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'wechat_api_error', $response->get_error_message() );
        }
        
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        if ( isset( $data['errcode'] ) && $data['errcode'] != 0 ) {
            return new WP_Error( 'wechat_login_error', $data['errmsg'] );
        }
        
        return $data;
    }
}