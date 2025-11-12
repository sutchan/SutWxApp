锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村粐PI閺嶇绺剧猾? *
 * 婢跺嫮鎮婂顔讳繆鐏忓繒鈻兼惔蹇曟畱閹碘偓閺堝牽PI鐠囬攱鐪伴崪灞芥惙鎼存棑绱濋幓鎰返缂佺喍绔撮惃鍕复閸欙絿顓搁悶? *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_API 缁? */
class SUT_WeChat_Mini_API {
    
    /**
     * API鐎圭偘绶?     *
     * @var SUT_WeChat_Mini_API
     */
    private static $instance = null;
    
    /**
     * 鐠侯垳鏁辩憴鍕灟
     *
     * @var array
     */
    private $routes = array();
    
    /**
     * 闁挎瑨顕ゆ禒锝囩垳閺勭姴鐨?     *
     * @var array
     */
    private $error_codes = array(
        0   => 'success',
        100 => '閸欏倹鏆熼柨娆掝嚖',
        101 => '閺堫亝宸块弶?,
        102 => 'Token鏉╁洦婀?,
        103 => '閹垮秳缍旀径杈Е',
        104 => '鐠у嫭绨稉宥呯摠閸?,
        105 => '閺堝秴濮熼崳銊╂晩鐠?,
        106 => '鐠囬攱鐪版０鎴犲芳鏉╁洭鐝?,
        107 => '閻ц缍嶆径杈Е',
        108 => '閺夊啴妾烘稉宥堝喕',
        109 => '閺佺増宓佹惔鎾绘晩鐠?,
    );
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_API
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 閸掓繂顫愰崠鏈匬I
     */
    private function init() {
        // 濞夈劌鍞介柌宥呭晸鐟欏嫬鍨?        add_action( 'init', array( $this, 'register_rewrite_rules' ) );
        
        // 婢跺嫮鎮夾PI鐠囬攱鐪?        add_action( 'template_redirect', array( $this, 'handle_api_requests' ) );
        
        // 濞夈劌鍞紸PI鐠侯垳鏁?        $this->register_routes();
        
        // 濞ｈ濮濺EST API閺€顖涘瘮
        add_filter( 'rest_pre_serve_request', array( $this, 'rest_pre_serve_request' ), 10, 4 );
    }
    
    /**
     * 濞夈劌鍞介柌宥呭晸鐟欏嫬鍨?     */
    public function register_rewrite_rules() {
        add_rewrite_rule( '^sut-wxapp-api/([^/]*)/?', 'index.php?sut_wxa_action=$matches[1]', 'top' );
        add_rewrite_tag( '%sut_wxa_action%', '([^&]+)' );
    }
    
    /**
     * 濞夈劌鍞紸PI鐠侯垳鏁?     */
    private function register_routes() {
        // 閸╄櫣顢匒PI
        $this->routes['ping'] = array( 'callback' => array( $this, 'api_ping' ) );
        $this->routes['login'] = array( 'callback' => array( $this, 'api_login' ) );
        
        // 閻劍鍩涢惄绋垮彠API
        $this->routes['user/profile'] = array( 'callback' => array( $this, 'api_user_profile' ), 'auth' => true );
        $this->routes['user/update'] = array( 'callback' => array( $this, 'api_user_update' ), 'auth' => true );
        
        // 閸愬懎顔愰惄绋垮彠API
        $this->routes['posts'] = array( 'callback' => array( $this, 'api_get_posts' ) );
        $this->routes['posts/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_post' ) );
        $this->routes['categories'] = array( 'callback' => array( $this, 'api_get_categories' ) );
        $this->routes['tags'] = array( 'callback' => array( $this, 'api_get_tags' ) );
        
        // 閸忎浇顔忛崗鏈电铂濡€虫健濞ｈ濮炵捄顖滄暠
        $this->routes = apply_filters( 'sut_wechat_mini_api_routes', $this->routes );
    }
    
    /**
     * 婢跺嫮鎮夾PI鐠囬攱鐪?     */
    public function handle_api_requests() {
        global $wp;
        
        // 濡偓閺屻儲妲搁崥锔胯礋API鐠囬攱鐪?        if ( ! isset( $wp->query_vars['sut_wxa_action'] ) ) {
            return;
        }
        
        $action = $wp->query_vars['sut_wxa_action'];
        $request_data = $this->get_request_data();
        
        // 閺屻儲澹橀崠褰掑帳閻ㄥ嫯鐭鹃悽?        $route_matched = false;
        foreach ( $this->routes as $route_pattern => $route_info ) {
            $pattern = '^' . str_replace( '\/', '\\/', $route_pattern ) . '$';
            if ( preg_match( "/$pattern/", $action, $matches ) ) {
                $route_matched = true;
                
                // 濡偓閺屻儲妲搁崥锕傛付鐟曚焦宸块弶?                if ( isset( $route_info['auth'] ) && $route_info['auth'] ) {
                    $user_id = $this->authenticate_request();
                    if ( ! $user_id ) {
                        $this->send_response( array(), 101, __( '閺堫亝宸块弶?, 'sut-wechat-mini' ) );
                        exit;
                    }
                    $request_data['user_id'] = $user_id;
                }
                
                // 鐠嬪啰鏁ら崶鐐剁殶閸戣姤鏆?                $response_data = call_user_func_array( $route_info['callback'], array( $request_data, $matches ) );
                
                // 閸欐垿鈧礁鎼锋惔?                if ( is_array( $response_data ) && isset( $response_data['code'] ) ) {
                    $this->send_response( $response_data['data'], $response_data['code'], $response_data['message'] );
                } else {
                    $this->send_response( $response_data );
                }
                
                exit;
            }
        }
        
        // 婵″倹鐏夊▽鈩冩箒閸栧綊鍘ら惃鍕熅閻?        if ( ! $route_matched ) {
            $this->send_response( array(), 104, __( '鐠у嫭绨稉宥呯摠閸?, 'sut-wechat-mini' ) );
            exit;
        }
    }
    
    /**
     * 閼惧嘲褰囩拠閿嬬湴閺佺増宓?     *
     * @return array
     */
    private function get_request_data() {
        $method = $_SERVER['REQUEST_METHOD'];
        $data = array();
        
        if ( 'GET' === $method ) {
            $data = $_GET;
        } elseif ( 'POST' === $method ) {
            // 鐏忔繆鐦懢宄板絿JSON閺佺増宓?            $json_data = file_get_contents( 'php://input' );
            if ( $json_data ) {
                $data = json_decode( $json_data, true );
            }
            
            // 婵″倹鐏塉SON鐟欙絾鐎芥径杈Е閿涘奔濞囬悽銊ㄣ€冮崡鏇熸殶閹?            if ( ! $data ) {
                $data = $_POST;
            }
        }
        
        return $data;
    }
    
    /**
     * 妤犲矁鐦夌拠閿嬬湴
     *
     * @return int|false 閻劍鍩汭D閹存潊alse
     */
    private function authenticate_request() {
        // 娴犲氦顕Ч鍌氥仈娑擃叀骞忛崣鏈ken
        $headers = getallheaders();
        $token = isset( $headers['Authorization'] ) ? str_replace( 'Bearer ', '', $headers['Authorization'] ) : '';
        
        // 娴犲氦顕Ч鍌氬棘閺侀鑵戦懢宄板絿Token
        if ( empty( $token ) ) {
            $token = isset( $_REQUEST['token'] ) ? $_REQUEST['token'] : '';
        }
        
        if ( empty( $token ) ) {
            return false;
        }
        
        // 妤犲矁鐦塗oken
        $user_id = $this->verify_token( $token );
        
        return $user_id;
    }
    
    /**
     * 妤犲矁鐦塗oken
     *
     * @param string $token Token閸?     * @return int|false 閻劍鍩汭D閹存潊alse
     */
    private function verify_token( $token ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 閺屻儲澹楾oken鐎电懓绨查惃鍕暏閹?        $user = $wpdb->get_row( $wpdb->prepare( "SELECT user_id FROM $table_name WHERE token = %s", $token ) );
        
        if ( $user && $user->user_id ) {
            return $user->user_id;
        }
        
        return false;
    }
    
    /**
     * 閸欐垿鈧竸PI閸濆秴绨?     *
     * @param mixed $data 閸濆秴绨查弫鐗堝祦
     * @param int $code 閻樿埖鈧胶鐖?     * @param string $message 濞戝牊浼?     */
    private function send_response( $data = array(), $code = 0, $message = '' ) {
        // 鐠佸墽鐤嗛崫宥呯安婢?        header( 'Content-Type: application/json; charset=utf-8' );
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
        
        // 婵″倹鐏夊☉鍫熶紖娑撹櫣鈹栭敍灞煎▏閻劑绮拋銈嗙Х閹?        if ( empty( $message ) && isset( $this->error_codes[$code] ) ) {
            $message = $this->error_codes[$code];
        }
        
        // 閺嬪嫬缂撻崫宥呯安閺佺増宓?        $response = array(
            'code'    => $code,
            'message' => $message,
            'data'    => $data,
            'time'    => time(),
        );
        
        // 閸欐垿鈧礁鎼锋惔?        echo json_encode( $response, JSON_UNESCAPED_UNICODE );
        exit;
    }
    
    /**
     * REST API閸濆秴绨叉径鍕倞
     *
     * @param bool $served 閸濆秴绨查弰顖氭儊瀹告彃褰傞柅?     * @param WP_HTTP_Response $result 閸濆秴绨茬紒鎾寸亯
     * @param WP_REST_Request $request 鐠囬攱鐪扮€电钖?     * @param WP_REST_Server $server 閺堝秴濮熼崳銊ヮ嚠鐠?     * @return bool
     */
    public function rest_pre_serve_request( $served, $result, $request, $server ) {
        // 濡偓閺屻儲妲搁崥锔胯礋鐏忓繒鈻兼惔蹇氼嚞濮?        $user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? $_SERVER['HTTP_USER_AGENT'] : '';
        if ( strpos( $user_agent, 'miniProgram' ) !== false ) {
            // 娣囶喗鏁奸崫宥呯安閺嶇厧绱?            $data = $result->get_data();
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
            
            // 閸欐垿鈧椒鎱ㄩ弨鐟版倵閻ㄥ嫬鎼锋惔?            header( 'Content-Type: application/json; charset=utf-8' );
            echo json_encode( $response, JSON_UNESCAPED_UNICODE );
            
            return true;
        }
        
        return $served;
    }
    
    /*************************
     * API閺傝纭剁€圭偟骞?     *************************/
    
    /**
     * 濞村鐦疉PI鏉╃偞甯?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_ping( $data, $matches ) {
        return array(
            'pong' => time(),
            'version' => SUT_WECHAT_MINI_VERSION,
            'message' => __( 'API鏉╃偞甯撮幋鎰', 'sut-wechat-mini' )
        );
    }
    
    /**
     * 閻劍鍩涢惂璇茬秿
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_login( $data, $matches ) {
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['code'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '閸欏倹鏆熼柨娆掝嚖', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囧顔讳繆鐏忓繒鈻兼惔蹇曟暏閹磋渹淇婇幁?        $code = $data['code'];
        $user_info = isset( $data['user_info'] ) ? $data['user_info'] : array();
        
        // 鐠嬪啰鏁ゅ顔讳繆閻ц缍嶉幒銉ュ經
        $wx_user = $this->wechat_login( $code );
        if ( is_wp_error( $wx_user ) ) {
            return array(
                'code' => 107,
                'message' => $wx_user->get_error_message(),
                'data' => array()
            );
        }
        
        // 婢跺嫮鎮婇悽銊﹀煕閻ц缍?        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $result = $sut_wxa_users->login_user( $wx_user, $user_info );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕娣団剝浼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_user_profile( $data, $matches ) {
        $user_id = $data['user_id'];
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $profile = $sut_wxa_users->get_user_profile( $user_id );
        
        return $profile;
    }
    
    /**
     * 閺囧瓨鏌婇悽銊﹀煕娣団剝浼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_user_update( $data, $matches ) {
        $user_id = $data['user_id'];
        unset( $data['user_id'] );
        
        $sut_wxa_users = SUT_WeChat_Mini_Users::get_instance();
        $result = $sut_wxa_users->update_user_profile( $user_id, $data );
        
        return $result;
    }
    
    /**
     * 閼惧嘲褰囬弬鍥╃彿閸掓銆?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_get_posts( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $posts = $sut_wxa_content->get_posts( $data );
        
        return $posts;
    }
    
    /**
     * 閼惧嘲褰囬崡鏇犵槖閺傚洨鐝?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_get_post( $data, $matches ) {
        $post_id = $matches[1];
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $post = $sut_wxa_content->get_post( $post_id );
        
        return $post;
    }
    
    /**
     * 閼惧嘲褰囬崚鍡欒閸掓銆?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_get_categories( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $categories = $sut_wxa_content->get_categories( $data );
        
        return $categories;
    }
    
    /**
     * 閼惧嘲褰囬弽鍥╊劮閸掓銆?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array
     */
    public function api_get_tags( $data, $matches ) {
        $sut_wxa_content = SUT_WeChat_Mini_Content::get_instance();
        $tags = $sut_wxa_content->get_tags( $data );
        
        return $tags;
    }
    
    /**
     * 瀵邦喕淇婇惂璇茬秿
     *
     * @param string $code 閻ц缍嶉崙顓＄槈
     * @return array|WP_Error
     */
    private function wechat_login( $code ) {
        $appid = get_option( 'sut_wechat_mini_appid' );
        $appsecret = get_option( 'sut_wechat_mini_appsecret' );
        
        if ( empty( $appid ) || empty( $appsecret ) ) {
            return new WP_Error( 'wechat_config_error', __( '瀵邦喕淇婄亸蹇曗柤鎼村繘鍘ょ純顔芥弓鐎瑰本鍨?, 'sut-wechat-mini' ) );
        }
        
        // 鐠嬪啰鏁ゅ顔讳繆閻ц缍嶉幒銉ュ經
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
}\n