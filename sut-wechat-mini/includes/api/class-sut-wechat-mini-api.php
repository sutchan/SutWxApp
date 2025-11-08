<?php
/**
 * SUT寰俊灏忕▼搴廇PI鏍稿績绫? *
 * 澶勭悊寰俊灏忕▼搴忕殑鎵€鏈堿PI璇锋眰鍜屽搷搴旓紝鎻愪緵缁熶竴鐨勬帴鍙ｇ鐞? *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_API 绫? */
class SUT_WeChat_Mini_API {
    
    /**
     * API瀹炰緥
     *
     * @var SUT_WeChat_Mini_API
     */
    private static $instance = null;
    
    /**
     * 璺敱瑙勫垯
     *
     * @var array
     */
    private $routes = array();
    
    /**
     * 閿欒浠ｇ爜鏄犲皠
     *
     * @var array
     */
    private $error_codes = array(
        0   => 'success',
        100 => '鍙傛暟閿欒',
        101 => '鏈巿鏉?,
        102 => 'Token杩囨湡',
        103 => '鎿嶄綔澶辫触',
        104 => '璧勬簮涓嶅瓨鍦?,
        105 => '鏈嶅姟鍣ㄩ敊璇?,
        106 => '璇锋眰棰戠巼杩囬珮',
        107 => '鐧诲綍澶辫触',
        108 => '鏉冮檺涓嶈冻',
        109 => '鏁版嵁搴撻敊璇?,
    );
    
    /**
     * 鏋勯€犲嚱鏁?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
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
     * 鍒濆鍖朅PI
     */
    private function init() {
        // 娉ㄥ唽閲嶅啓瑙勫垯
        add_action( 'init', array( $this, 'register_rewrite_rules' ) );
        
        // 澶勭悊API璇锋眰
        add_action( 'template_redirect', array( $this, 'handle_api_requests' ) );
        
        // 娉ㄥ唽API璺敱
        $this->register_routes();
        
        // 娣诲姞REST API鏀寔
        add_filter( 'rest_pre_serve_request', array( $this, 'rest_pre_serve_request' ), 10, 4 );
    }
    
    /**
     * 娉ㄥ唽閲嶅啓瑙勫垯
     */
    public function register_rewrite_rules() {
        add_rewrite_rule( '^sut-wxapp-api/([^/]*)/?', 'index.php?sut_wxa_action=$matches[1]', 'top' );
        add_rewrite_tag( '%sut_wxa_action%', '([^&]+)' );
    }
    
    /**
     * 娉ㄥ唽API璺敱
     */
    private function register_routes() {
        // 鍩虹API
        $this->routes['ping'] = array( 'callback' => array( $this, 'api_ping' ) );
        $this->routes['login'] = array( 'callback' => array( $this, 'api_login' ) );
        
        // 鐢ㄦ埛鐩稿叧API
        $this->routes['user/profile'] = array( 'callback' => array( $this, 'api_user_profile' ), 'auth' => true );
        $this->routes['user/update'] = array( 'callback' => array( $this, 'api_user_update' ), 'auth' => true );
        
        // 鍐呭鐩稿叧API
        $this->routes['posts'] = array( 'callback' => array( $this, 'api_get_posts' ) );
        $this->routes['posts/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_post' ) );
        $this->routes['categories'] = array( 'callback' => array( $this, 'api_get_categories' ) );
        $this->routes['tags'] = array( 'callback' => array( $this, 'api_get_tags' ) );
        
        // 鍏佽鍏朵粬妯″潡娣诲姞璺敱
        $this->routes = apply_filters( 'sut_wechat_mini_api_routes', $this->routes );
    }
    
    /**
     * 澶勭悊API璇锋眰
     */
    public function handle_api_requests() {
        global $wp;
        
        // 妫€鏌ユ槸鍚︿负API璇锋眰
        if ( ! isset( $wp->query_vars['sut_wxa_action'] ) ) {
            return;
        }
        
        $action = $wp->query_vars['sut_wxa_action'];
        $request_data = $this->get_request_data();
        
        // 鏌ユ壘鍖归厤鐨勮矾鐢?        $route_matched = false;
        foreach ( $this->routes as $route_pattern => $route_info ) {
            $pattern = '^' . str_replace( '\/', '\\/', $route_pattern ) . '$';
            if ( preg_match( "/$pattern/", $action, $matches ) ) {
                $route_matched = true;
                
                // 妫€鏌ユ槸鍚﹂渶瑕佹巿鏉?                if ( isset( $route_info['auth'] ) && $route_info['auth'] ) {
                    $user_id = $this->authenticate_request();
                    if ( ! $user_id ) {
                        $this->send_response( array(), 101, __( '鏈巿鏉?, 'sut-wechat-mini' ) );
                        exit;
                    }
                    $request_data['user_id'] = $user_id;
                }
                
                // 璋冪敤鍥炶皟鍑芥暟
                $response_data = call_user_func_array( $route_info['callback'], array( $request_data, $matches ) );
                
                // 鍙戦€佸搷搴?                if ( is_array( $response_data ) && isset( $response_data['code'] ) ) {
                    $this->send_response( $response_data['data'], $response_data['code'], $response_data['message'] );
                } else {
                    $this->send_response( $response_data );
                }
                
                exit;
            }
        }
        
        // 濡傛灉娌℃湁鍖归厤鐨勮矾鐢?        if ( ! $route_matched ) {
            $this->send_response( array(), 104, __( '璧勬簮涓嶅瓨鍦?, 'sut-wechat-mini' ) );
            exit;
        }
    }
    
    /**
     * 鑾峰彇璇锋眰鏁版嵁
     *
     * @return array
     */
    private function get_request_data() {
        $method = $_SERVER['REQUEST_METHOD'];
        $data = array();
        
        if ( 'GET' === $method ) {
            $data = $_GET;
        } elseif ( 'POST' === $method ) {
            // 灏濊瘯鑾峰彇JSON鏁版嵁
            $json_data = file_get_contents( 'php://input' );
            if ( $json_data ) {
                $data = json_decode( $json_data, true );
            }
            
            // 濡傛灉JSON瑙ｆ瀽澶辫触锛屼娇鐢ㄨ〃鍗曟暟鎹?            if ( ! $data ) {
                $data = $_POST;
            }
        }
        
        return $data;
    }
    
    /**
     * 楠岃瘉璇锋眰
     *
     * @return int|false 鐢ㄦ埛ID鎴杅alse
     */
    private function authenticate_request() {
        // 浠庤姹傚ご涓幏鍙朤oken
        $headers = getallheaders();
        $token = isset( $headers['Authorization'] ) ? str_replace( 'Bearer ', '', $headers['Authorization'] ) : '';
        
        // 浠庤姹傚弬鏁颁腑鑾峰彇Token
        if ( empty( $token ) ) {
            $token = isset( $_REQUEST['token'] ) ? $_REQUEST['token'] : '';
        }
        
        if ( empty( $token ) ) {
            return false;
        }
        
        // 楠岃瘉Token
        $user_id = $this->verify_token( $token );
        
        return $user_id;
    }
    
    /**
     * 楠岃瘉Token
     *
     * @param string $token Token鍊?     * @return int|false 鐢ㄦ埛ID鎴杅alse
     */
    private function verify_token( $token ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 鏌ユ壘Token瀵瑰簲鐨勭敤鎴?        $user = $wpdb->get_row( $wpdb->prepare( "SELECT user_id FROM $table_name WHERE token = %s", $token ) );
        
        if ( $user && $user->user_id ) {
            return $user->user_id;
        }
        
        return false;
    }
    
    /**
     * 鍙戦€丄PI鍝嶅簲
     *
     * @param mixed $data 鍝嶅簲鏁版嵁
     * @param int $code 鐘舵€佺爜
     * @param string $message 娑堟伅
     */
    private function send_response( $data = array(), $code = 0, $message = '' ) {
        // 璁剧疆鍝嶅簲澶?        header( 'Content-Type: application/json; charset=utf-8' );
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
        
        // 濡傛灉娑堟伅涓虹┖锛屼娇鐢ㄩ粯璁ゆ秷鎭?        if ( empty( $message ) && isset( $this->error_codes[$code] ) ) {
            $message = $this->error_codes[$code];
        }
        
        // 鏋勫缓鍝嶅簲鏁版嵁
        $response = array(
            'code'    => $code,
            'message' => $message,
            'data'    => $data,
            'time'    => time(),
        );
        
        // 鍙戦€佸搷搴?        echo json_encode( $response, JSON_UNESCAPED_UNICODE );
        exit;
    }
    
    /**
     * REST API鍝嶅簲澶勭悊
     *
     * @param bool $served 鍝嶅簲鏄惁宸插彂閫?     * @param WP_HTTP_Response $result 鍝嶅簲缁撴灉
     * @param WP_REST_Request $request 璇锋眰瀵硅薄
     * @param WP_REST_Server $server 鏈嶅姟鍣ㄥ璞?     * @return bool
     */
    public function rest_pre_serve_request( $served, $result, $request, $server ) {
        // 妫€鏌ユ槸鍚︿负灏忕▼搴忚姹?        $user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? $_SERVER['HTTP_USER_AGENT'] : '';
        if ( strpos( $user_agent, 'miniProgram' ) !== false ) {
            // 淇敼鍝嶅簲鏍煎紡
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
            
            // 鍙戦€佷慨鏀瑰悗鐨勫搷搴?            header( 'Content-Type: application/json; charset=utf-8' );
            echo json_encode( $response, JSON_UNESCAPED_UNICODE );
            
            return true;
        }
        
        return $served;
    }
    
    /*************************
     * API鏂规硶瀹炵幇
     *************************/
    
    /**
     * 娴嬭瘯API杩炴帴
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_ping( $data, $matches ) {
        return array(
            'pong' => time(),
            'version' => SUT_WECHAT_MINI_VERSION,
            'message' => __( 'API杩炴帴鎴愬姛', 'sut-wechat-mini' )
        );
    }
    
    /**
     * 鐢ㄦ埛鐧诲綍
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_login( $data, $matches ) {
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['code'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '鍙傛暟閿欒', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇寰俊灏忕▼搴忕敤鎴蜂俊鎭?        $code = $data['code'];
        $user_info = isset( $data['user_info'] ) ? $data['user_info'] : array();
        
        // 璋冪敤寰俊鐧诲綍鎺ュ彛
        $wx_user = $this->wechat_login( $code );
        if ( is_wp_error( $wx_user ) ) {
            return array(
                'code' => 107,
                'message' => $wx_user->get_error_message(),
                'data' => array()
            );
        }
        
        // 澶勭悊鐢ㄦ埛鐧诲綍
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $result = $sut_wxa_users->login_user( $wx_user, $user_info );
        
        return $result;
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛淇℃伅
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_user_profile( $data, $matches ) {
        $user_id = $data['user_id'];
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $profile = $sut_wxa_users->get_user_profile( $user_id );
        
        return $profile;
    }
    
    /**
     * 鏇存柊鐢ㄦ埛淇℃伅
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
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
     * 鑾峰彇鏂囩珷鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_get_posts( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $posts = $sut_wxa_content->get_posts( $data );
        
        return $posts;
    }
    
    /**
     * 鑾峰彇鍗曠瘒鏂囩珷
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_get_post( $data, $matches ) {
        $post_id = $matches[1];
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $post = $sut_wxa_content->get_post( $post_id );
        
        return $post;
    }
    
    /**
     * 鑾峰彇鍒嗙被鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_get_categories( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $categories = $sut_wxa_content->get_categories( $data );
        
        return $categories;
    }
    
    /**
     * 鑾峰彇鏍囩鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array
     */
    public function api_get_tags( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $tags = $sut_wxa_content->get_tags( $data );
        
        return $tags;
    }
    
    /**
     * 寰俊鐧诲綍
     *
     * @param string $code 鐧诲綍鍑瘉
     * @return array|WP_Error
     */
    private function wechat_login( $code ) {
        $appid = get_option( 'sut_wechat_mini_appid' );
        $appsecret = get_option( 'sut_wechat_mini_appsecret' );
        
        if ( empty( $appid ) || empty( $appsecret ) ) {
            return new WP_Error( 'wechat_config_error', __( '寰俊灏忕▼搴忛厤缃湭瀹屾垚', 'sut-wechat-mini' ) );
        }
        
        // 璋冪敤寰俊鐧诲綍鎺ュ彛
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