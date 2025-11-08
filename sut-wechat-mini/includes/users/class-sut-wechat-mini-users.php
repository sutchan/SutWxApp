<?php
/**
 * SUT寰俊灏忕▼搴忕敤鎴风鐞嗙被
 *
 * 澶勭悊寰俊灏忕▼搴忕敤鎴风殑鐧诲綍銆佷俊鎭鐞嗐€佹潈闄愭帶鍒剁瓑鍔熻兘
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Users 绫? */
class SUT_WeChat_Mini_Users {
    
    /**
     * 鐢ㄦ埛绠＄悊瀹炰緥
     *
     * @var SUT_WeChat_Mini_Users
     */
    private static $instance = null;
    
    /**
     * 鏋勯€犲嚱鏁?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
     *
     * @return SUT_WeChat_Mini_Users
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 鍒濆鍖栫敤鎴风鐞?     */
    private function init() {
        // 娉ㄥ唽鐢ㄦ埛鐩稿叧鐨勯挬瀛?        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_user_routes' ) );
    }
    
    /**
     * 娣诲姞鐢ㄦ埛鐩稿叧鐨凙PI璺敱
     *
     * @param array $routes 鐜版湁璺敱
     * @return array 淇敼鍚庣殑璺敱
     */
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
     * 鐢ㄦ埛鐧诲綍澶勭悊
     *
     * @param array $wx_user 寰俊鐢ㄦ埛淇℃伅
     * @param array $user_info 鐢ㄦ埛鎻愪氦鐨勪俊鎭?     * @return array 鐧诲綍缁撴灉
     */
    public function login_user( $wx_user, $user_info ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $openid = $wx_user['openid'];
        $unionid = isset( $wx_user['unionid'] ) ? $wx_user['unionid'] : '';
        
        // 妫€鏌ユ槸鍚﹀瓨鍦ㄨ鐢ㄦ埛
        $existing_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE openid = %s", $openid ) );
        
        // 鐢熸垚鐢ㄦ埛Token
        $token = $this->generate_token();
        
        // 鏇存柊鎴栨彃鍏ョ敤鎴蜂俊鎭?        if ( $existing_user ) {
            // 鏇存柊鐜版湁鐢ㄦ埛
            $data = array(
                'token' => $token,
                'updated_at' => current_time( 'mysql' ),
            );
            
            // 濡傛灉鏈夌敤鎴蜂俊鎭紝鏇存柊鐢ㄦ埛淇℃伅
            if ( ! empty( $user_info ) ) {
                $data = array_merge( $data, $this->prepare_user_info( $user_info ) );
            }
            
            $where = array( 'id' => $existing_user->id );
            $result = $wpdb->update( $table_name, $data, $where );
            
            if ( false === $result ) {
                return array(
                    'code' => 109,
                    'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                    'data' => array()
                );
            }
            
            $user_id = $existing_user->user_id;
        } else {
            // 鎻掑叆鏂扮敤鎴?            $data = array(
                'openid' => $openid,
                'unionid' => $unionid,
                'token' => $token,
                'created_at' => current_time( 'mysql' ),
                'updated_at' => current_time( 'mysql' ),
            );
            
            // 濡傛灉鏈夌敤鎴蜂俊鎭紝娣诲姞鐢ㄦ埛淇℃伅
            if ( ! empty( $user_info ) ) {
                $data = array_merge( $data, $this->prepare_user_info( $user_info ) );
            }
            
            $result = $wpdb->insert( $table_name, $data );
            
            if ( false === $result ) {
                return array(
                    'code' => 109,
                    'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                    'data' => array()
                );
            }
            
            $user_id = null;
        }
        
        // 鏋勫缓杩斿洖鏁版嵁
        $return_data = array(
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
            'message' => __( '鐧诲綍鎴愬姛', 'sut-wechat-mini' ),
            'data' => $return_data
        );
    }
    
    /**
     * 鍑嗗鐢ㄦ埛淇℃伅鏁版嵁
     *
     * @param array $user_info 鐢ㄦ埛淇℃伅
     * @return array 鍑嗗濂界殑鐢ㄦ埛淇℃伅
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
     * 鐢熸垚鐢ㄦ埛Token
     *
     * @return string Token鍊?     */
    private function generate_token() {
        return md5( uniqid( 'sut_wxa_', true ) . time() . mt_rand( 1000, 9999 ) );
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛淇℃伅
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @return array 鐢ㄦ埛淇℃伅
     */
    public function get_user_profile( $user_id ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 鏌ヨ鐢ㄦ埛淇℃伅
        $user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d", $user_id ) );
        
        if ( ! $user ) {
            return array(
                'code' => 104,
                'message' => __( '鐢ㄦ埛涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇WordPress鐢ㄦ埛淇℃伅
        $wp_user = get_user_by( 'id', $user_id );
        
        // 鏋勫缓鐢ㄦ埛淇℃伅
        $profile = array(
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
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $profile
        );
    }
    
    /**
     * 鏇存柊鐢ㄦ埛淇℃伅
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param array $data 鏇存柊鏁版嵁
     * @return array 鏇存柊缁撴灉
     */
    public function update_user_profile( $user_id, $data ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 妫€鏌ョ敤鎴锋槸鍚﹀瓨鍦?        $user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d", $user_id ) );
        
        if ( ! $user ) {
            return array(
                'code' => 104,
                'message' => __( '鐢ㄦ埛涓嶅瓨鍦?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鍑嗗鏇存柊鏁版嵁
        $update_data = array(
            'updated_at' => current_time( 'mysql' ),
        );
        
        // 杩囨护鍙互鏇存柊鐨勫瓧娈?        $allowed_fields = array( 'nickname', 'avatar', 'gender', 'country', 'province', 'city' );
        foreach ( $allowed_fields as $field ) {
            if ( isset( $data[$field] ) ) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // 鏇存柊鐢ㄦ埛淇℃伅
        $where = array( 'id' => $user->id );
        $result = $wpdb->update( $table_name, $update_data, $where );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '鏇存柊鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛鍦板潃鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鍦板潃鍒楄〃
     */
    public function api_get_address_list( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_address_table_exists();
        
        // 鏌ヨ鍦板潃鍒楄〃
        $addresses = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d ORDER BY is_default DESC, updated_at DESC", $user_id ) );
        
        // 鏍煎紡鍖栧湴鍧€鏁版嵁
        $formatted_addresses = array();
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
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $formatted_addresses
        );
    }
    
    /**
     * 娣诲姞鐢ㄦ埛鍦板潃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 娣诲姞缁撴灉
     */
    public function api_add_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_address_table_exists();
        
        // 妫€鏌ュ繀瑕佸弬鏁?        $required_fields = array( 'consignee', 'phone', 'province', 'city', 'district', 'detail_address' );
        foreach ( $required_fields as $field ) {
            if ( ! isset( $data[$field] ) || empty( $data[$field] ) ) {
                return array(
                    'code' => 100,
                    'message' => sprintf( __( '缂哄皯蹇呰鍙傛暟锛?s', 'sut-wechat-mini' ), $field ),
                    'data' => array()
                );
            }
        }
        
        // 濡傛灉璁剧疆涓洪粯璁ゅ湴鍧€锛屽彇娑堝叾浠栧湴鍧€鐨勯粯璁ょ姸鎬?        if ( isset( $data['is_default'] ) && $data['is_default'] ) {
            $wpdb->update( 
                $table_name,
                array( 'is_default' => 0 ),
                array( 'user_id' => $user_id )
            );
        }
        
        // 鎻掑叆鍦板潃
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
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '娣诲姞鎴愬姛', 'sut-wechat-mini' ),
            'data' => array( 'address_id' => $wpdb->insert_id )
        );
    }
    
    /**
     * 鏇存柊鐢ㄦ埛鍦板潃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鏇存柊缁撴灉
     */
    public function api_update_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_address_table_exists();
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['address_id'] ) || empty( $data['address_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歛ddress_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $address_id = $data['address_id'];
        
        // 妫€鏌ュ湴鍧€鏄惁灞炰簬璇ョ敤鎴?        $address = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE id = %d AND user_id = %d", 
            $address_id, $user_id
        ) );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '鍦板潃涓嶅瓨鍦ㄦ垨涓嶅睘浜庤鐢ㄦ埛', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鍑嗗鏇存柊鏁版嵁
        $update_data = array(
            'updated_at' => current_time( 'mysql' ),
        );
        
        // 鍏佽鏇存柊鐨勫瓧娈?        $allowed_fields = array( 'consignee', 'phone', 'province', 'city', 'district', 'detail_address', 'is_default' );
        foreach ( $allowed_fields as $field ) {
            if ( isset( $data[$field] ) ) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // 濡傛灉璁剧疆涓洪粯璁ゅ湴鍧€锛屽彇娑堝叾浠栧湴鍧€鐨勯粯璁ょ姸鎬?        if ( isset( $update_data['is_default'] ) && $update_data['is_default'] ) {
            $wpdb->update( 
                $table_name,
                array( 'is_default' => 0 ),
                array( 'user_id' => $user_id )
            );
        }
        
        // 鏇存柊鍦板潃
        $result = $wpdb->update( $table_name, $update_data, array( 'id' => $address_id ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '鏇存柊鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 鍒犻櫎鐢ㄦ埛鍦板潃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鍒犻櫎缁撴灉
     */
    public function api_delete_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_address_table_exists();
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['address_id'] ) || empty( $data['address_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歛ddress_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $address_id = $data['address_id'];
        
        // 妫€鏌ュ湴鍧€鏄惁灞炰簬璇ョ敤鎴?        $address = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE id = %d AND user_id = %d", 
            $address_id, $user_id
        ) );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '鍦板潃涓嶅瓨鍦ㄦ垨涓嶅睘浜庤鐢ㄦ埛', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鍒犻櫎鍦板潃
        $result = $wpdb->delete( $table_name, array( 'id' => $address_id ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '鍒犻櫎鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 鑾峰彇鏀惰棌鍒楄〃
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鏀惰棌鍒楄〃
     */
    public function api_get_favorite_list( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_favorite_table_exists();
        
        // 鑾峰彇鍒嗛〉鍙傛暟
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : 10;
        $offset = ( $page - 1 ) * $per_page;
        
        // 鏌ヨ鏀惰棌鍒楄〃
        $favorites = $wpdb->get_results( $wpdb->prepare( "
            SELECT f.*, p.ID as post_id, p.post_title, p.post_excerpt, 
                   (SELECT meta_value FROM {$wpdb->prefix}postmeta WHERE post_id = p.ID AND meta_key = '_thumbnail_id') as thumbnail_id
            FROM $table_name f
            LEFT JOIN {$wpdb->prefix}posts p ON f.post_id = p.ID
            WHERE f.user_id = %d AND p.post_status = 'publish'
            ORDER BY f.created_at DESC
            LIMIT %d, %d
        ", $user_id, $offset, $per_page ) );
        
        // 鑾峰彇鎬绘潯鏁?        $total = $wpdb->get_var( $wpdb->prepare( "
            SELECT COUNT(*) 
            FROM $table_name f
            LEFT JOIN {$wpdb->prefix}posts p ON f.post_id = p.ID
            WHERE f.user_id = %d AND p.post_status = 'publish'
        ", $user_id ) );
        
        // 鏍煎紡鍖栨敹钘忔暟鎹?        $formatted_favorites = array();
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
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
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
     * 娣诲姞鏀惰棌
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 娣诲姞缁撴灉
     */
    public function api_add_favorite( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_favorite_table_exists();
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['post_id'] ) || empty( $data['post_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歱ost_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $post_id = $data['post_id'];
        
        // 妫€鏌ユ枃绔犳槸鍚﹀瓨鍦?        $post = get_post( $post_id );
        if ( ! $post || 'publish' !== $post->post_status ) {
            return array(
                'code' => 104,
                'message' => __( '鏂囩珷涓嶅瓨鍦ㄦ垨鏈彂甯?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 妫€鏌ユ槸鍚﹀凡缁忔敹钘?        $existing = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE user_id = %d AND post_id = %d", 
            $user_id, $post_id
        ) );
        
        if ( $existing ) {
            return array(
                'code' => 103,
                'message' => __( '宸茬粡鏀惰棌杩囦簡', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 娣诲姞鏀惰棌
        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'post_id' => $post_id,
            'created_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '鏀惰棌鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 鍒犻櫎鏀惰棌
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 鍒犻櫎缁撴灉
     */
    public function api_delete_favorite( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_favorite_table_exists();
        
        // 妫€鏌ュ繀瑕佸弬鏁?        if ( ! isset( $data['favorite_id'] ) && ! isset( $data['post_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缂哄皯蹇呰鍙傛暟锛歠avorite_id 鎴?post_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鏋勫缓鏌ヨ鏉′欢
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
        
        // 鍒犻櫎鏀惰棌
        $result = $wpdb->delete( $table_name, $where );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '鍙栨秷鏀惰棌鎴愬姛', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 鐢ㄦ埛绛惧埌
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 绛惧埌缁撴灉
     */
    public function api_signin( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_signin_table_exists();
        
        // 妫€鏌ヤ粖澶╂槸鍚﹀凡缁忕鍒?        $today = date( 'Y-m-d' );
        $existing = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE user_id = %d AND signin_date = %s", 
            $user_id, $today
        ) );
        
        if ( $existing ) {
            return array(
                'code' => 103,
                'message' => __( '浠婂ぉ宸茬粡绛惧埌杩囦簡', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 鑾峰彇杩炵画绛惧埌澶╂暟
        $last_signin = $wpdb->get_row( $wpdb->prepare( 
            "SELECT signin_date FROM $table_name WHERE user_id = %d ORDER BY signin_date DESC LIMIT 1", 
            $user_id
        ) );
        
        $continuous_days = 1;
        if ( $last_signin ) {
            $last_date = strtotime( $last_signin->signin_date );
            $yesterday = strtotime( '-1 day', strtotime( $today ) );
            
            if ( $last_date == $yesterday ) {
                // 鑾峰彇杩炵画绛惧埌澶╂暟
                $continuous_days = $wpdb->get_var( $wpdb->prepare( "
                    SELECT COUNT(*) 
                    FROM $table_name 
                    WHERE user_id = %d 
                    AND signin_date >= DATE_SUB( %s, INTERVAL (COUNT(*) - 1) DAY )
                    ORDER BY signin_date DESC
                ", $user_id, $today ) );
            }
        }
        
        // 娣诲姞绛惧埌璁板綍
        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'signin_date' => $today,
            'continuous_days' => $continuous_days,
            'created_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '鏁版嵁搴撻敊璇?, 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 绛惧埌濂栧姳绉垎锛堝鏋滄湁绉垎绯荤粺锛?        $this->award_signin_points( $user_id, $continuous_days );
        
        return array(
            'code' => 0,
            'message' => __( '绛惧埌鎴愬姛', 'sut-wechat-mini' ),
            'data' => array(
                'continuous_days' => $continuous_days,
                'signin_date' => $today
            )
        );
    }
    
    /**
     * 鑾峰彇绛惧埌鍘嗗彶
     *
     * @param array $data 璇锋眰鏁版嵁
     * @param array $matches 璺敱鍖归厤缁撴灉
     * @return array 绛惧埌鍘嗗彶
     */
    public function api_get_signin_history( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 纭繚琛ㄥ瓨鍦?        $this->ensure_signin_table_exists();
        
        // 鑾峰彇鍙傛暟
        $month = isset( $data['month'] ) ? $data['month'] : date( 'Y-m' );
        
        // 鏌ヨ绛惧埌璁板綍
        $signin_records = $wpdb->get_results( $wpdb->prepare( 
            "SELECT signin_date, continuous_days FROM $table_name WHERE user_id = %d AND signin_date LIKE %s ORDER BY signin_date ASC", 
            $user_id, $month . '%'
        ) );
        
        // 鏍煎紡鍖栫鍒版暟鎹?        $formatted_records = array();
        foreach ( $signin_records as $record ) {
            $formatted_records[] = array(
                'signin_date' => $record->signin_date,
                'continuous_days' => $record->continuous_days,
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '鎴愬姛', 'sut-wechat-mini' ),
            'data' => $formatted_records
        );
    }
    
    /**
     * 纭繚鍦板潃琛ㄥ瓨鍦?     */
    private function ensure_address_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 妫€鏌ヨ〃鏄惁瀛樺湪
        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 鍒涘缓鍦板潃琛?            $sql = "CREATE TABLE $table_name (
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
     * 纭繚鏀惰棌琛ㄥ瓨鍦?     */
    private function ensure_favorite_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 妫€鏌ヨ〃鏄惁瀛樺湪
        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 鍒涘缓鏀惰棌琛?            $sql = "CREATE TABLE $table_name (
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
     * 纭繚绛惧埌琛ㄥ瓨鍦?     */
    private function ensure_signin_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 妫€鏌ヨ〃鏄惁瀛樺湪
        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 鍒涘缓绛惧埌琛?            $sql = "CREATE TABLE $table_name (
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
     * 绛惧埌濂栧姳绉垎
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $continuous_days 杩炵画绛惧埌澶╂暟
     */
    private function award_signin_points( $user_id, $continuous_days ) {
        // 杩欓噷鍙互鏍规嵁杩炵画绛惧埌澶╂暟璁剧疆涓嶅悓鐨勭Н鍒嗗鍔?        // 渚嬪锛氳繛缁?澶╁鍔?绉垎锛岃繛缁?澶╁鍔?0绉垎锛岃繛缁?澶╁鍔?0绉垎绛?        // 杩欎釜鍔熻兘闇€瑕佺Н鍒嗙郴缁熸敮鎸侊紝鍙互鏍规嵁瀹為檯闇€姹傚疄鐜?    }
}\n