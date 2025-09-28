<?php
/**
 * SUT微信小程序用户管理类
 *
 * 处理微信小程序用户的登录、信息管理、权限控制等功能
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Users 类
 */
class SUT_WeChat_Mini_Users {
    
    /**
     * 用户管理实例
     *
     * @var SUT_WeChat_Mini_Users
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 获取单例实例
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
     * 初始化用户管理
     */
    private function init() {
        // 注册用户相关的钩子
        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_user_routes' ) );
    }
    
    /**
     * 添加用户相关的API路由
     *
     * @param array $routes 现有路由
     * @return array 修改后的路由
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
     * 用户登录处理
     *
     * @param array $wx_user 微信用户信息
     * @param array $user_info 用户提交的信息
     * @return array 登录结果
     */
    public function login_user( $wx_user, $user_info ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $openid = $wx_user['openid'];
        $unionid = isset( $wx_user['unionid'] ) ? $wx_user['unionid'] : '';
        
        // 检查是否存在该用户
        $existing_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE openid = %s", $openid ) );
        
        // 生成用户Token
        $token = $this->generate_token();
        
        // 更新或插入用户信息
        if ( $existing_user ) {
            // 更新现有用户
            $data = array(
                'token' => $token,
                'updated_at' => current_time( 'mysql' ),
            );
            
            // 如果有用户信息，更新用户信息
            if ( ! empty( $user_info ) ) {
                $data = array_merge( $data, $this->prepare_user_info( $user_info ) );
            }
            
            $where = array( 'id' => $existing_user->id );
            $result = $wpdb->update( $table_name, $data, $where );
            
            if ( false === $result ) {
                return array(
                    'code' => 109,
                    'message' => __( '数据库错误', 'sut-wechat-mini' ),
                    'data' => array()
                );
            }
            
            $user_id = $existing_user->user_id;
        } else {
            // 插入新用户
            $data = array(
                'openid' => $openid,
                'unionid' => $unionid,
                'token' => $token,
                'created_at' => current_time( 'mysql' ),
                'updated_at' => current_time( 'mysql' ),
            );
            
            // 如果有用户信息，添加用户信息
            if ( ! empty( $user_info ) ) {
                $data = array_merge( $data, $this->prepare_user_info( $user_info ) );
            }
            
            $result = $wpdb->insert( $table_name, $data );
            
            if ( false === $result ) {
                return array(
                    'code' => 109,
                    'message' => __( '数据库错误', 'sut-wechat-mini' ),
                    'data' => array()
                );
            }
            
            $user_id = null;
        }
        
        // 构建返回数据
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
            'message' => __( '登录成功', 'sut-wechat-mini' ),
            'data' => $return_data
        );
    }
    
    /**
     * 准备用户信息数据
     *
     * @param array $user_info 用户信息
     * @return array 准备好的用户信息
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
     * 生成用户Token
     *
     * @return string Token值
     */
    private function generate_token() {
        return md5( uniqid( 'sut_wxa_', true ) . time() . mt_rand( 1000, 9999 ) );
    }
    
    /**
     * 获取用户信息
     *
     * @param int $user_id 用户ID
     * @return array 用户信息
     */
    public function get_user_profile( $user_id ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 查询用户信息
        $user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d", $user_id ) );
        
        if ( ! $user ) {
            return array(
                'code' => 104,
                'message' => __( '用户不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取WordPress用户信息
        $wp_user = get_user_by( 'id', $user_id );
        
        // 构建用户信息
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
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $profile
        );
    }
    
    /**
     * 更新用户信息
     *
     * @param int $user_id 用户ID
     * @param array $data 更新数据
     * @return array 更新结果
     */
    public function update_user_profile( $user_id, $data ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 检查用户是否存在
        $user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d", $user_id ) );
        
        if ( ! $user ) {
            return array(
                'code' => 104,
                'message' => __( '用户不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 准备更新数据
        $update_data = array(
            'updated_at' => current_time( 'mysql' ),
        );
        
        // 过滤可以更新的字段
        $allowed_fields = array( 'nickname', 'avatar', 'gender', 'country', 'province', 'city' );
        foreach ( $allowed_fields as $field ) {
            if ( isset( $data[$field] ) ) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // 更新用户信息
        $where = array( 'id' => $user->id );
        $result = $wpdb->update( $table_name, $update_data, $where );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '更新成功', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 获取用户地址列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 地址列表
     */
    public function api_get_address_list( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 确保表存在
        $this->ensure_address_table_exists();
        
        // 查询地址列表
        $addresses = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_name WHERE user_id = %d ORDER BY is_default DESC, updated_at DESC", $user_id ) );
        
        // 格式化地址数据
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
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_addresses
        );
    }
    
    /**
     * 添加用户地址
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 添加结果
     */
    public function api_add_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 确保表存在
        $this->ensure_address_table_exists();
        
        // 检查必要参数
        $required_fields = array( 'consignee', 'phone', 'province', 'city', 'district', 'detail_address' );
        foreach ( $required_fields as $field ) {
            if ( ! isset( $data[$field] ) || empty( $data[$field] ) ) {
                return array(
                    'code' => 100,
                    'message' => sprintf( __( '缺少必要参数：%s', 'sut-wechat-mini' ), $field ),
                    'data' => array()
                );
            }
        }
        
        // 如果设置为默认地址，取消其他地址的默认状态
        if ( isset( $data['is_default'] ) && $data['is_default'] ) {
            $wpdb->update( 
                $table_name,
                array( 'is_default' => 0 ),
                array( 'user_id' => $user_id )
            );
        }
        
        // 插入地址
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
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '添加成功', 'sut-wechat-mini' ),
            'data' => array( 'address_id' => $wpdb->insert_id )
        );
    }
    
    /**
     * 更新用户地址
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 更新结果
     */
    public function api_update_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 确保表存在
        $this->ensure_address_table_exists();
        
        // 检查必要参数
        if ( ! isset( $data['address_id'] ) || empty( $data['address_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：address_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $address_id = $data['address_id'];
        
        // 检查地址是否属于该用户
        $address = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE id = %d AND user_id = %d", 
            $address_id, $user_id
        ) );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '地址不存在或不属于该用户', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 准备更新数据
        $update_data = array(
            'updated_at' => current_time( 'mysql' ),
        );
        
        // 允许更新的字段
        $allowed_fields = array( 'consignee', 'phone', 'province', 'city', 'district', 'detail_address', 'is_default' );
        foreach ( $allowed_fields as $field ) {
            if ( isset( $data[$field] ) ) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // 如果设置为默认地址，取消其他地址的默认状态
        if ( isset( $update_data['is_default'] ) && $update_data['is_default'] ) {
            $wpdb->update( 
                $table_name,
                array( 'is_default' => 0 ),
                array( 'user_id' => $user_id )
            );
        }
        
        // 更新地址
        $result = $wpdb->update( $table_name, $update_data, array( 'id' => $address_id ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '更新成功', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 删除用户地址
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 删除结果
     */
    public function api_delete_address( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 确保表存在
        $this->ensure_address_table_exists();
        
        // 检查必要参数
        if ( ! isset( $data['address_id'] ) || empty( $data['address_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：address_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $address_id = $data['address_id'];
        
        // 检查地址是否属于该用户
        $address = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE id = %d AND user_id = %d", 
            $address_id, $user_id
        ) );
        
        if ( ! $address ) {
            return array(
                'code' => 104,
                'message' => __( '地址不存在或不属于该用户', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 删除地址
        $result = $wpdb->delete( $table_name, array( 'id' => $address_id ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '删除成功', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 获取收藏列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 收藏列表
     */
    public function api_get_favorite_list( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 确保表存在
        $this->ensure_favorite_table_exists();
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : 10;
        $offset = ( $page - 1 ) * $per_page;
        
        // 查询收藏列表
        $favorites = $wpdb->get_results( $wpdb->prepare( "
            SELECT f.*, p.ID as post_id, p.post_title, p.post_excerpt, 
                   (SELECT meta_value FROM {$wpdb->prefix}postmeta WHERE post_id = p.ID AND meta_key = '_thumbnail_id') as thumbnail_id
            FROM $table_name f
            LEFT JOIN {$wpdb->prefix}posts p ON f.post_id = p.ID
            WHERE f.user_id = %d AND p.post_status = 'publish'
            ORDER BY f.created_at DESC
            LIMIT %d, %d
        ", $user_id, $offset, $per_page ) );
        
        // 获取总条数
        $total = $wpdb->get_var( $wpdb->prepare( "
            SELECT COUNT(*) 
            FROM $table_name f
            LEFT JOIN {$wpdb->prefix}posts p ON f.post_id = p.ID
            WHERE f.user_id = %d AND p.post_status = 'publish'
        ", $user_id ) );
        
        // 格式化收藏数据
        $formatted_favorites = array();
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
            'message' => __( '成功', 'sut-wechat-mini' ),
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
     * 添加收藏
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 添加结果
     */
    public function api_add_favorite( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 确保表存在
        $this->ensure_favorite_table_exists();
        
        // 检查必要参数
        if ( ! isset( $data['post_id'] ) || empty( $data['post_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：post_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        $post_id = $data['post_id'];
        
        // 检查文章是否存在
        $post = get_post( $post_id );
        if ( ! $post || 'publish' !== $post->post_status ) {
            return array(
                'code' => 104,
                'message' => __( '文章不存在或未发布', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 检查是否已经收藏
        $existing = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE user_id = %d AND post_id = %d", 
            $user_id, $post_id
        ) );
        
        if ( $existing ) {
            return array(
                'code' => 103,
                'message' => __( '已经收藏过了', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 添加收藏
        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'post_id' => $post_id,
            'created_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '收藏成功', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 删除收藏
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 删除结果
     */
    public function api_delete_favorite( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 确保表存在
        $this->ensure_favorite_table_exists();
        
        // 检查必要参数
        if ( ! isset( $data['favorite_id'] ) && ! isset( $data['post_id'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少必要参数：favorite_id 或 post_id', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 构建查询条件
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
        
        // 删除收藏
        $result = $wpdb->delete( $table_name, $where );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '取消收藏成功', 'sut-wechat-mini' ),
            'data' => array()
        );
    }
    
    /**
     * 用户签到
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 签到结果
     */
    public function api_signin( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 确保表存在
        $this->ensure_signin_table_exists();
        
        // 检查今天是否已经签到
        $today = date( 'Y-m-d' );
        $existing = $wpdb->get_row( $wpdb->prepare( 
            "SELECT id FROM $table_name WHERE user_id = %d AND signin_date = %s", 
            $user_id, $today
        ) );
        
        if ( $existing ) {
            return array(
                'code' => 103,
                'message' => __( '今天已经签到过了', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取连续签到天数
        $last_signin = $wpdb->get_row( $wpdb->prepare( 
            "SELECT signin_date FROM $table_name WHERE user_id = %d ORDER BY signin_date DESC LIMIT 1", 
            $user_id
        ) );
        
        $continuous_days = 1;
        if ( $last_signin ) {
            $last_date = strtotime( $last_signin->signin_date );
            $yesterday = strtotime( '-1 day', strtotime( $today ) );
            
            if ( $last_date == $yesterday ) {
                // 获取连续签到天数
                $continuous_days = $wpdb->get_var( $wpdb->prepare( "
                    SELECT COUNT(*) 
                    FROM $table_name 
                    WHERE user_id = %d 
                    AND signin_date >= DATE_SUB( %s, INTERVAL (COUNT(*) - 1) DAY )
                    ORDER BY signin_date DESC
                ", $user_id, $today ) );
            }
        }
        
        // 添加签到记录
        $result = $wpdb->insert( $table_name, array(
            'user_id' => $user_id,
            'signin_date' => $today,
            'continuous_days' => $continuous_days,
            'created_at' => current_time( 'mysql' ),
        ) );
        
        if ( false === $result ) {
            return array(
                'code' => 109,
                'message' => __( '数据库错误', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 签到奖励积分（如果有积分系统）
        $this->award_signin_points( $user_id, $continuous_days );
        
        return array(
            'code' => 0,
            'message' => __( '签到成功', 'sut-wechat-mini' ),
            'data' => array(
                'continuous_days' => $continuous_days,
                'signin_date' => $today
            )
        );
    }
    
    /**
     * 获取签到历史
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 签到历史
     */
    public function api_get_signin_history( $data, $matches ) {
        global $wpdb;
        $user_id = $data['user_id'];
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 确保表存在
        $this->ensure_signin_table_exists();
        
        // 获取参数
        $month = isset( $data['month'] ) ? $data['month'] : date( 'Y-m' );
        
        // 查询签到记录
        $signin_records = $wpdb->get_results( $wpdb->prepare( 
            "SELECT signin_date, continuous_days FROM $table_name WHERE user_id = %d AND signin_date LIKE %s ORDER BY signin_date ASC", 
            $user_id, $month . '%'
        ) );
        
        // 格式化签到数据
        $formatted_records = array();
        foreach ( $signin_records as $record ) {
            $formatted_records[] = array(
                'signin_date' => $record->signin_date,
                'continuous_days' => $record->continuous_days,
            );
        }
        
        return array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_records
        );
    }
    
    /**
     * 确保地址表存在
     */
    private function ensure_address_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_address';
        
        // 检查表是否存在
        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 创建地址表
            $sql = "CREATE TABLE $table_name (
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
     * 确保收藏表存在
     */
    private function ensure_favorite_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_favorites';
        
        // 检查表是否存在
        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 创建收藏表
            $sql = "CREATE TABLE $table_name (
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
     * 确保签到表存在
     */
    private function ensure_signin_table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_user_signin';
        
        // 检查表是否存在
        if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
            $charset_collate = $wpdb->get_charset_collate();
            
            // 创建签到表
            $sql = "CREATE TABLE $table_name (
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
     * 签到奖励积分
     *
     * @param int $user_id 用户ID
     * @param int $continuous_days 连续签到天数
     */
    private function award_signin_points( $user_id, $continuous_days ) {
        // 这里可以根据连续签到天数设置不同的积分奖励
        // 例如：连续1天奖励5积分，连续3天奖励10积分，连续7天奖励20积分等
        // 这个功能需要积分系统支持，可以根据实际需求实现
    }
}