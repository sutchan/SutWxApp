锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繒鏁ら幋椋庮吀閻炲棛琚? *
 * 婢跺嫮鎮婂顔讳繆鐏忓繒鈻兼惔蹇曟暏閹撮娈戦惂璇茬秿閵嗕椒淇婇幁顖滎吀閻炲棎鈧焦娼堥梽鎰付閸掑墎鐡戦崝鐔诲厴
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Users 缁? */
class SUT_WeChat_Mini_Users {
    
    /**
     * 閻劍鍩涚粻锛勬倞鐎圭偘绶?     *
     * @var SUT_WeChat_Mini_Users
     */
    private static $instance = null;
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_Users
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 閸掓繂顫愰崠鏍暏閹撮顓搁悶?     */
    private function init() {
        // 濞夈劌鍞介悽銊﹀煕閻╃鍙ч惃鍕尙鐎?        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_user_routes' ) );
    }
    
    /**
     * 濞ｈ濮為悽銊﹀煕閻╃鍙ч惃鍑橮I鐠侯垳鏁?     *
     * @param array $routes 閻滅増婀佺捄顖滄暠
     * @return array 娣囶喗鏁奸崥搴ｆ畱鐠侯垳鏁?     */
    public function add_user_routes( $routes ) {
        $routes['user/address/list'] = array( 'callback' => array( $this, 'api_get_address_list' ), 'auth' => true );
        $routes['user/address/add'] = array( 'callback' => array( $this, 'api_add_address' ), 'auth' => true );
        $routes['user/address/update'] = array( 'callback' => array( $this, 'api_update_address' ), 'auth' => true );
        $routes['user/address/delete'] = array( 'callback' => array( $this, 'api_delete_address' ), 'auth' => true );
        $routes['user/favorite/list'] = array( 'callback' => array( $this, 'api_get_favorite_list' ), 'auth' => true );
        $routes['user/favorite/add'] = array( 'callback' => array( $this, 'api_add_favorite' ), 'auth' => true );
        $routes['user/favorite/delete'] = array( 'callback' => array( $this, 'api_delete_favorite' ), 'auth' => true );
        $routes['user/signin'] = array( 'callback' => array( $this, 'api_signin' ), 'auth' => true );
        $routes['user/signin/history'] = array( 'callback' => array( $this, 'api_get_signin_history' ), 'auth' => true );
        
        return $routes;
    }
    
    /**
     * 閻劍鍩涢惂璇茬秿婢跺嫮鎮?     *
     * @param array $wx_user 瀵邦喕淇婇悽銊﹀煕娣団剝浼?     * @param array $user_info 閻劍鍩涢幓鎰唉閻ㄥ嫪淇婇幁?     * @return array 閻ц缍嶇紒鎾寸亯
     */
    public function login_user( $wx_user, $user_info ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $openid = $wx_user['openid'];
        $unionid = isset( $wx_user['unionid'] ) ? $wx_user['unionid'] : '';
        
        // 濡偓閺屻儲妲搁崥锕€鐡ㄩ崷銊嚉閻劍鍩?        $existing_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE openid = %s", $openid ) );
        
        // 閻㈢喐鍨氶悽銊﹀煕Token
        $token = $this->generate_token();
        
        // 閺囧瓨鏌婇幋鏍ㄥ絻閸忋儳鏁ら幋铚備繆閹?        if ( $existing_user ) {
            // 閺囧瓨鏌婇悳鐗堟箒閻劍鍩?            $data = array(
                'token' => $token,
                'updated_at' => current_time( 'mysql' ),
            );
            
            // 婵″倹鐏夐張澶屾暏閹磋渹淇婇幁顖ょ礉閺囧瓨鏌婇悽銊﹀煕娣団剝浼?            if ( ! empty( $user_info ) ) {
                $data = array_merge( $data, $this->prepare_user_info( $user_info ) );
            }
            
            $where = array( 'id' => $existing_user->id );
            $result = $wpdb->update( $table_name, $data, $where );
            
            if ( false === $result ) {
                return array(
                    'code' => 109,
                    'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                    'data' => array()
                );
            }
            
            $user_id = $existing_user->user_id;
        } else {
            // 閹绘帒鍙嗛弬鎵暏閹?            $data = array(
                'openid' => $openid,
                'unionid' => $unionid,
                'token' => $token,
                'created_at' => current_time( 'mysql' ),
                'updated_at' => current_time( 'mysql' ),
            );
            
            // 婵″倹鐏夐張澶屾暏閹磋渹淇婇幁顖ょ礉濞ｈ濮為悽銊﹀煕娣団剝浼?            if ( ! empty( $user_info ) ) {
                $data = array_merge( $data, $this->prepare_user_info( $user_info ) );
            }
            
            $result = $wpdb->insert( $table_name, $data );
            
            if ( false === $result ) {
                return array(
                    'code' => 109,
                    'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                    'data' => array()
                );
            }
            
            $user_id = null;
        }
        
        // 閺嬪嫬缂撴潻鏂挎礀閺佺増宓?        $return_data = array(
            'token' => $token,
            'openid' => $openid,
            'unionid' => $unionid,
        );
        
        if ( $user_id ) {
            $wp_user = get_user_by( 'id', $user_id );
            if ( $wp_user ) {
                $return_data['user_id'] = $user_id;
                $return_data['username'] = $wp_user->user_login;
                $return_data['nickname'] = $wp_user->display_name;
            }
        }
        
        return array(
            'code' => 0,
            'message' => __( '閻ц缍嶉幋鎰', 'sut-wechat-mini' ),
            'data' => $return_data
        );
    }
    
    /**
     * 閸戝棗顦悽銊﹀煕娣団剝浼呴弫鐗堝祦
     *
     * @param array $user_info 閻劍鍩涙穱鈩冧紖
     * @return array 閸戝棗顦總鐣屾畱閻劍鍩涙穱鈩冧紖
     */
    private function prepare_user_info( $user_info ) {
        $data = array();
        
        if ( isset( $user_info['nickName'] ) ) {
            $data['nickname'] = $user_info['nickName'];
        }
        
        if ( isset( $user_info['avatarUrl'] ) ) {
            $data['avatar'] = $user_info['avatarUrl'];
        }
        
        if ( isset( $user_info['gender'] ) ) {
            $data['gender'] = $user_info['gender'];
        }
        
        if ( isset( $user_info['country'] ) ) {
            $data['country'] = $user_info['country'];
        }
        
        if ( isset( $user_info['province'] ) ) {
            $data['province'] = $user_info['province'];
        }
        
        if ( isset( $user_info['city'] ) ) {
            $data['city'] = $user_info['city'];
        }
        
        return $data;
    }
    
    /**
     * 閻㈢喐鍨氶悽銊﹀煕Token
     *
     * @return string Token閸?     */
    private function generate_token() {
        return md5( uniqid( 'sut_wxa_', true ) . time() . mt_rand( 1000, 9999 ) );
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕娣団剝浼?     *
     * @param int $user_id 閻劍鍩汭D
     * @return array 閻劍鍩涙穱鈩冧紖
     */
    public function get_user_profile( $user_id ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 閺屻儴顕楅悽銊﹀煕娣団剝浼?        $user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d", $user_id ) );
        
        if ( ! $user ) {
            return array(
                'code' => 104,
                'message' => __( '閻劍鍩涙稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰嘩ordPress閻劍鍩涙穱鈩冧紖
        $wp_user = get_user_by( 'id', $user_id );
        
        // 閺嬪嫬缂撻悽銊﹀煕娣団剝浼?        $profile = array(
            'nickname' => $user->nickname,
            'avatar' => $user->avatar,
            'gender' => $user->gender,
            'country' => $user->country,
            'province' => $user->province,
            'city' => $user->city,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        );
        
        if ( $wp_user ) {
            $profile['username'] = $wp_user->user_login;
            $profile['email'] = $wp_user->user_email;
            $profile['display_name'] = $wp_user->display_name;
        }
        
        return array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $profile
        );
    }
    
    /**
     * 閺囧瓨鏌婇悽銊﹀煕娣団剝浼?     *
     * @param int $user_id 閻劍鍩汭D
     * @param array $data 閺囧瓨鏌婇弫鐗堝祦
     * @return array 閺囧瓨鏌婄紒鎾寸亯
     */
    public function update_user_profile( $user_id, $data ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 濡偓閺屻儳鏁ら幋閿嬫Ц閸氾箑鐡ㄩ崷?        $user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d", $user_id ) );
        
        if ( ! $user ) {
            return array(
                'code' => 104,
                'message' => __( '閻劍鍩涙稉宥呯摠閸?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閸戝棗顦弴瀛樻煀閺佺増宓?        $update_data = array(
            'updated_at' => current_time( 'mysql' ),
        );
        
        // 鏉╁洦鎶ら崣顖欎簰閺囧瓨鏌婇惃鍕摟濞?        $allowed_fields = array( 'nickname', 'avatar', 'gender', 'country', 'province', 'city' );
        foreach ( $allowed_fields as $field ) {
            if ( isset( $data[$field] ) ) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // 閺囧瓨鏌婇悽銊﹀煕娣団剝浼?        $where = array( 'id' => $user->id );
        $result = $wpdb->update( $table_name, $update_data, $where );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閺囧瓨鏌婇幋鎰', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕閸︽澘娼冮崚妤勩€?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閸︽澘娼冮崚妤勩€?     */
    public function api_get_address_list( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_address_table_exists();
        
        // 閺屻儴顕楅崷鏉挎絻閸掓銆?        $addresses = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d ORDER BY is_default DESC, updated_at DESC", $user_id ) );
        
        // 閺嶇厧绱￠崠鏍ф勾閸р偓閺佺増宓?        $formatted_addresses = array();
        foreach ( $addresses as $address ) {
            $formatted_addresses[] = array(
                'id' => $address->id,
                'consignee' => $address->consignee,
                'phone' => $address->phone,
                'province' => $address->province,
                'city' => $address->city,
                'district' => $address->district,
                'detail_address' => $address->detail_address,
                'is_default' => $address->is_default,
                'created_at' => $address->created_at,
                'updated_at' => $address->updated_at,
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $formatted_addresses
        );
    }
    
    /**
     * 濞ｈ濮為悽銊﹀煕閸︽澘娼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 濞ｈ濮炵紒鎾寸亯
     */
    public function api_add_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_address_table_exists();
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        $required_fields = array( 'consignee', 'phone', 'province', 'city', 'district', 'detail_address' );
        foreach ( $required_fields as $field ) {
            if ( ! isset( $data[$field] ) || empty( $data[$field] ) ) {
                return array(
                    'code' => 100,
                    'message' => sprintf( __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍?s', 'sut-wechat-mini' ), $field ),
                    'data' => array()
                );
            }
        }
        
        // 婵″倹鐏夌拋鍓х枂娑撴椽绮拋銈呮勾閸р偓閿涘苯褰囧☉鍫濆従娴犳牕婀撮崸鈧惃鍕帛鐠併倗濮搁幀?        if ( isset( $data['is_default'] ) && $data['is_default'] ) {
            $wpdb->update( 
                $table_name,
                array( 'is_default' => 0 ),
                array( 'user_id' => $user_id )
            );
        }
        
        // 閹绘帒鍙嗛崷鏉挎絻
        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'consignee' => $data['consignee'],
            'phone' => $data['phone'],
            'province' => $data['province'],
            'city' => $data['city'],
            'district' => $data['district'],
            'detail_address' => $data['detail_address'],
            'is_default' => isset( $data['is_default'] ) ? $data['is_default'] : 0,
            'created_at' => current_time( 'mysql' ),
            'updated_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '濞ｈ濮為幋鎰', 'sut-wechat-mini' ),
            'data' => array( 'address_id' => $wpdb->insert_id )
        );
    }
    
    /**
     * 閺囧瓨鏌婇悽銊﹀煕閸︽澘娼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閺囧瓨鏌婄紒鎾寸亯
     */
    public function api_update_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_address_table_exists();
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['address_id'] ) || empty( $data['address_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝沝dress_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $address_id = $data['address_id'];
        
        // 濡偓閺屻儱婀撮崸鈧弰顖氭儊鐏炵偘绨拠銉ф暏閹?        $address = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE id = %d AND user_id = %d", 
            $address_id, $user_id
        ) );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '閸︽澘娼冩稉宥呯摠閸︺劍鍨ㄦ稉宥呯潣娴滃氦顕氶悽銊﹀煕', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閸戝棗顦弴瀛樻煀閺佺増宓?        $update_data = array(
            'updated_at' => current_time( 'mysql' ),
        );
        
        // 閸忎浇顔忛弴瀛樻煀閻ㄥ嫬鐡у▓?        $allowed_fields = array( 'consignee', 'phone', 'province', 'city', 'district', 'detail_address', 'is_default' );
        foreach ( $allowed_fields as $field ) {
            if ( isset( $data[$field] ) ) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // 婵″倹鐏夌拋鍓х枂娑撴椽绮拋銈呮勾閸р偓閿涘苯褰囧☉鍫濆従娴犳牕婀撮崸鈧惃鍕帛鐠併倗濮搁幀?        if ( isset( $update_data['is_default'] ) && $update_data['is_default'] ) {
            $wpdb->update( 
                $table_name,
                array( 'is_default' => 0 ),
                array( 'user_id' => $user_id )
            );
        }
        
        // 閺囧瓨鏌婇崷鏉挎絻
        $result = $wpdb->update( $table_name, $update_data, array( 'id' => $address_id ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閺囧瓨鏌婇幋鎰', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 閸掔娀娅庨悽銊﹀煕閸︽澘娼?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閸掔娀娅庣紒鎾寸亯
     */
    public function api_delete_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_address_table_exists();
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['address_id'] ) || empty( $data['address_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝沝dress_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $address_id = $data['address_id'];
        
        // 濡偓閺屻儱婀撮崸鈧弰顖氭儊鐏炵偘绨拠銉ф暏閹?        $address = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE id = %d AND user_id = %d", 
            $address_id, $user_id
        ) );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '閸︽澘娼冩稉宥呯摠閸︺劍鍨ㄦ稉宥呯潣娴滃氦顕氶悽銊﹀煕', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閸掔娀娅庨崷鏉挎絻
        $result = $wpdb->delete( $table_name, array( 'id' => $address_id ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閸掔娀娅庨幋鎰', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 閼惧嘲褰囬弨鎯版閸掓銆?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閺€鎯版閸掓銆?     */
    public function api_get_favorite_list( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_favorite_table_exists();
        
        // 閼惧嘲褰囬崚鍡涖€夐崣鍌涙殶
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : 10;
        $offset = ( $page - 1 ) * $per_page;
        
        // 閺屻儴顕楅弨鎯版閸掓銆?        $favorites = $wpdb->get_results( $wpdb->prepare( "
            SELECT f.*, p.ID as post_id, p.post_title, p.post_excerpt, 
                   (SELECT meta_value FROM {$wpdb->prefix}postmeta WHERE post_id = p.ID AND meta_key = '_thumbnail_id') as thumbnail_id
            FROM $table_name f
            LEFT JOIN {$wpdb->prefix}posts p ON f.post_id = p.ID
            WHERE f.user_id = %d AND p.post_status = 'publish'
            ORDER BY f.created_at DESC
            LIMIT %d, %d
        ", $user_id, $offset, $per_page ) );
        
        // 閼惧嘲褰囬幀缁樻蒋閺?        $total = $wpdb->get_var( $wpdb->prepare( "
            SELECT COUNT(*) 
            FROM $table_name f
            LEFT JOIN {$wpdb->prefix}posts p ON f.post_id = p.ID
            WHERE f.user_id = %d AND p.post_status = 'publish'
        ", $user_id ) );
        
        // 閺嶇厧绱￠崠鏍ㄦ暪閽樺繑鏆熼幑?        $formatted_favorites = array();
        foreach ( $favorites as $favorite ) {
            $thumbnail_url = '';
            if ( $favorite->thumbnail_id ) {
                $thumbnail_url = wp_get_attachment_url( $favorite->thumbnail_id );
            }
            
            $formatted_favorites[] = array(
                'id' => $favorite->id,
                'post_id' => $favorite->post_id,
                'title' => $favorite->post_title,
                'excerpt' => $favorite->post_excerpt,
                'thumbnail' => $thumbnail_url,
                'created_at' => $favorite->created_at,
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array(
                'list' => $formatted_favorites,
                'total' => intval( $total ),
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $total / $per_page )
            )
        );
    }
    
    /**
     * 濞ｈ濮為弨鎯版
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 濞ｈ濮炵紒鎾寸亯
     */
    public function api_add_favorite( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_favorite_table_exists();
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['post_id'] ) || empty( $data['post_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝眔st_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $post_id = $data['post_id'];
        
        // 濡偓閺屻儲鏋冪粩鐘虫Ц閸氾箑鐡ㄩ崷?        $post = get_post( $post_id );
        if ( ! $post || 'publish' !== $post->post_status ) {
            return array(
                'code' => 104,
                'message' => __( '閺傚洨鐝锋稉宥呯摠閸︺劍鍨ㄩ張顏勫絺鐢?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濡偓閺屻儲妲搁崥锕€鍑＄紒蹇旀暪閽?        $existing = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE user_id = %d AND post_id = %d", 
            $user_id, $post_id
        ) );
        
        if ( $existing ) {
            return array(
                'code' => 103,
                'message' => __( '瀹歌尙绮￠弨鎯版鏉╁洣绨?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 濞ｈ濮為弨鎯版
        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'post_id' => $post_id,
            'created_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閺€鎯版閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 閸掔娀娅庨弨鎯版
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 閸掔娀娅庣紒鎾寸亯
     */
    public function api_delete_favorite( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_favorite_table_exists();
        
        // 濡偓閺屻儱绻€鐟曚礁寮弫?        if ( ! isset( $data['favorite_id'] ) && ! isset( $data['post_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂傚搫鐨箛鍛邦洣閸欏倹鏆熼敍姝燼vorite_id 閹?post_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閺嬪嫬缂撻弻銉嚄閺夆€叉
        if ( isset( $data['favorite_id'] ) ) {
            $where = array(
                'id' => $data['favorite_id'],
                'user_id' => $user_id
            );
        } else {
            $where = array(
                'post_id' => $data['post_id'],
                'user_id' => $user_id
            );
        }
        
        // 閸掔娀娅庨弨鎯版
        $result = $wpdb->delete( $table_name, $where );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閸欐牗绉烽弨鎯版閹存劕濮?, 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 閻劍鍩涚粵鎯у煂
     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 缁涙儳鍩岀紒鎾寸亯
     */
    public function api_signin( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_signin_table_exists();
        
        // 濡偓閺屻儰绮栨径鈺傛Ц閸氾箑鍑＄紒蹇曨劮閸?        $today = date( 'Y-m-d' );
        $existing = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE user_id = %d AND signin_date = %s", 
            $user_id, $today
        ) );
        
        if ( $existing ) {
            return array(
                'code' => 103,
                'message' => __( '娴犲﹤銇夊鑼病缁涙儳鍩屾潻鍥︾啊', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 閼惧嘲褰囨潻鐐电敾缁涙儳鍩屾径鈺傛殶
        $last_signin = $wpdb->get_row( $wpdb->prepare( 
            "SELECT signin_date FROM $table_name WHERE user_id = %d ORDER BY signin_date DESC LIMIT 1", 
            $user_id
        ) );
        
        $continuous_days = 1;
        if ( $last_signin ) {
            $last_date = strtotime( $last_signin->signin_date );
            $yesterday = strtotime( '-1 day', strtotime( $today ) );
            
            if ( $last_date == $yesterday ) {
                // 閼惧嘲褰囨潻鐐电敾缁涙儳鍩屾径鈺傛殶
                $continuous_days = $wpdb->get_var( $wpdb->prepare( "
                    SELECT COUNT(*) 
                    FROM $table_name 
                    WHERE user_id = %d 
                    AND signin_date >= DATE_SUB( %s, INTERVAL (COUNT(*) - 1) DAY )
                    ORDER BY signin_date DESC
                ", $user_id, $today ) );
            }
        }
        
        // 濞ｈ濮炵粵鎯у煂鐠佹澘缍?        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'signin_date' => $today,
            'continuous_days' => $continuous_days,
            'created_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '閺佺増宓佹惔鎾绘晩鐠?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 缁涙儳鍩屾總鏍уС缁夘垰鍨庨敍鍫濐洤閺嬫粍婀佺粔顖氬瀻缁崵绮洪敍?        $this->award_signin_points( $user_id, $continuous_days );
        
        return array(
            'code' => 0,
            'message' => __( '缁涙儳鍩岄幋鎰', 'sut-wechat-mini' ),
            'data' => array(
                'continuous_days' => $continuous_days,
                'signin_date' => $today
            )
        );
    }
    
    /**
     * 閼惧嘲褰囩粵鎯у煂閸樺棗褰?     *
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @param array $matches 鐠侯垳鏁遍崠褰掑帳缂佹挻鐏?     * @return array 缁涙儳鍩岄崢鍡楀蕉
     */
    public function api_get_signin_history( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 绾喕绻氱悰銊ョ摠閸?        $this->ensure_signin_table_exists();
        
        // 閼惧嘲褰囬崣鍌涙殶
        $month = isset( $data['month'] ) ? $data['month'] : date( 'Y-m' );
        
        // 閺屻儴顕楃粵鎯у煂鐠佹澘缍?        $signin_records = $wpdb->get_results( $wpdb->prepare( 
            "SELECT signin_date, continuous_days FROM $table_name WHERE user_id = %d AND signin_date LIKE %s ORDER BY signin_date ASC", 
            $user_id, $month . '%'
        ) );
        
        // 閺嶇厧绱￠崠鏍劮閸掔増鏆熼幑?        $formatted_records = array();
        foreach ( $signin_records as $record ) {
            $formatted_records[] = array(
                'signin_date' => $record->signin_date,
                'continuous_days' => $record->continuous_days,
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '閹存劕濮?, 'sut-wechat-mini' ),
            'data' => $formatted_records
        );
    }
    
    /**
     * 绾喕绻氶崷鏉挎絻鐞涖劌鐡ㄩ崷?     */
    private function ensure_address_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 濡偓閺屻儴銆冮弰顖氭儊鐎涙ê婀?        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 閸掓稑缂撻崷鏉挎絻鐞?            $sql = "CREATE TABLE $table_name (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                user_id mediumint(9) NOT NULL,
                consignee varchar(50) NOT NULL,
                phone varchar(20) NOT NULL,
                province varchar(50) NOT NULL,
                city varchar(50) NOT NULL,
                district varchar(50) NOT NULL,
                detail_address text NOT NULL,
                is_default tinyint(1) DEFAULT 0,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY  (id),
                KEY user_id (user_id)
            ) $charset_collate;";
            
            require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
            dbDelta( $sql );
        }
    }
    
    /**
     * 绾喕绻氶弨鎯版鐞涖劌鐡ㄩ崷?     */
    private function ensure_favorite_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 濡偓閺屻儴銆冮弰顖氭儊鐎涙ê婀?        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 閸掓稑缂撻弨鎯版鐞?            $sql = "CREATE TABLE $table_name (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                user_id mediumint(9) NOT NULL,
                post_id mediumint(9) NOT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY  (id),
                UNIQUE KEY user_post (user_id, post_id),
                KEY post_id (post_id)
            ) $charset_collate;";
            
            require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
            dbDelta( $sql );
        }
    }
    
    /**
     * 绾喕绻氱粵鎯у煂鐞涖劌鐡ㄩ崷?     */
    private function ensure_signin_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 濡偓閺屻儴銆冮弰顖氭儊鐎涙ê婀?        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 閸掓稑缂撶粵鎯у煂鐞?            $sql = "CREATE TABLE $table_name (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                user_id mediumint(9) NOT NULL,
                signin_date date NOT NULL,
                continuous_days smallint(6) NOT NULL DEFAULT 1,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY  (id),
                UNIQUE KEY user_date (user_id, signin_date)
            ) $charset_collate;";
            
            require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
            dbDelta( $sql );
        }
    }
    
    /**
     * 缁涙儳鍩屾總鏍уС缁夘垰鍨?     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $continuous_days 鏉╃偟鐢荤粵鎯у煂婢垛晜鏆?     */
    private function award_signin_points( $user_id, $continuous_days ) {
        // 鏉╂瑩鍣烽崣顖欎簰閺嶈宓佹潻鐐电敾缁涙儳鍩屾径鈺傛殶鐠佸墽鐤嗘稉宥呮倱閻ㄥ嫮袧閸掑棗顨涢崝?        // 娓氬顩ч敍姘崇箾缂?婢垛晛顨涢崝?缁夘垰鍨庨敍宀冪箾缂?婢垛晛顨涢崝?0缁夘垰鍨庨敍宀冪箾缂?婢垛晛顨涢崝?0缁夘垰鍨庣粵?        // 鏉╂瑤閲滈崝鐔诲厴闂団偓鐟曚胶袧閸掑棛閮寸紒鐔告暜閹镐緤绱濋崣顖欎簰閺嶈宓佺€圭偤妾棁鈧Ч鍌氱杽閻?    }
}\n