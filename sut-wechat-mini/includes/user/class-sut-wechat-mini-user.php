<?php
/**
 * 文件名: class-sut-wechat-mini-user.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 用户管理类
 * 
 * 提供微信小程序用户管理功能，包括用户注册、登录、信息管理等
 * 支持微信授权登录、用户信息同步、用户权限管理等
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 用户管理类
 */
class Sut_WeChat_Mini_User {
    
    /**
     * 用户角色常量
     */
    const ROLE_SUBSCRIBER = 'subscriber';
    const ROLE_CUSTOMER = 'customer';
    const ROLE_VIP = 'vip';
    
    /**
     * 用户状态常量
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_BANNED = 'banned';
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 注册用户相关钩子
        add_action('init', array($this, 'init_user_hooks'));
        
        // 注册AJAX处理程序
        add_action('wp_ajax_sut_wechat_mini_login', array($this, 'ajax_login'));
        add_action('wp_ajax_nopriv_sut_wechat_mini_login', array($this, 'ajax_login'));
        add_action('wp_ajax_sut_wechat_mini_update_profile', array($this, 'ajax_update_profile'));
        add_action('wp_ajax_sut_wechat_mini_get_user_info', array($this, 'ajax_get_user_info'));
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_User 用户管理实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化用户钩子
     */
    public function init_user_hooks() {
        // 创建用户表
        $this->create_user_tables();
        
        // 注册用户状态
        $this->register_user_statuses();
    }
    
    /**
     * 创建用户相关数据表
     */
    private function create_user_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            wp_user_id bigint(20) NOT NULL,
            openid varchar(100) NOT NULL,
            unionid varchar(100) DEFAULT '',
            session_key varchar(100) DEFAULT '',
            nickname varchar(100) DEFAULT '',
            avatar_url text DEFAULT '',
            gender tinyint(1) DEFAULT 0,
            city varchar(50) DEFAULT '',
            province varchar(50) DEFAULT '',
            country varchar(50) DEFAULT '',
            language varchar(20) DEFAULT '',
            phone varchar(20) DEFAULT '',
            email varchar(100) DEFAULT '',
            role varchar(20) DEFAULT 'subscriber',
            status varchar(20) DEFAULT 'active',
            points int(11) DEFAULT 0,
            balance decimal(10,2) DEFAULT 0.00,
            last_login_time datetime DEFAULT '0000-00-00 00:00:00',
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            updated_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            UNIQUE KEY openid (openid),
            KEY wp_user_id (wp_user_id),
            KEY unionid (unionid),
            KEY role (role),
            KEY status (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 注册用户状态
     */
    private function register_user_statuses() {
        // 注册自定义用户状态
        register_post_status('sut_wechat_mini_active', array(
            'label'                     => _x('Active', 'user status', 'sut-wechat-mini'),
            'public'                    => true,
            'exclude_from_search'       => false,
            'show_in_admin_all_list'    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Active <span class="count">(%s)</span>', 'Active <span class="count">(%s)</span>', 'sut-wechat-mini'),
        ));
        
        register_post_status('sut_wechat_mini_inactive', array(
            'label'                     => _x('Inactive', 'user status', 'sut-wechat-mini'),
            'public'                    => false,
            'exclude_from_search'       => false,
            'show_in_admin_all_list'    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Inactive <span class="count">(%s)</span>', 'Inactive <span class="count">(%s)</span>', 'sut-wechat-mini'),
        ));
        
        register_post_status('sut_wechat_mini_banned', array(
            'label'                     => _x('Banned', 'user status', 'sut-wechat-mini'),
            'public'                    => false,
            'exclude_from_search'       => true,
            'show_in_admin_all_list'    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Banned <span class="count">(%s)</span>', 'Banned <span class="count">(%s)</span>', 'sut-wechat-mini'),
        ));
    }
    
    /**
     * 微信小程序登录
     * 
     * @param string $code 微信登录凭证
     * @param string $encrypted_data 加密数据
     * @param string $iv 加密算法的初始向量
     * @return array 登录结果
     */
    public function wechat_login($code, $encrypted_data = '', $iv = '') {
        // 获取微信配置
        $app_id = get_option('sut_wechat_mini_app_id', '');
        $app_secret = get_option('sut_wechat_mini_app_secret', '');
        
        if (empty($app_id) || empty($app_secret)) {
            return array(
                'success' => false,
                'message' => __('微信配置不完整', 'sut-wechat-mini')
            );
        }
        
        // 通过code获取session_key和openid
        $session_data = $this->get_wechat_session($code, $app_id, $app_secret);
        
        if (!$session_data || !isset($session_data['openid'])) {
            return array(
                'success' => false,
                'message' => __('微信登录失败', 'sut-wechat-mini')
            );
        }
        
        $openid = $session_data['openid'];
        $session_key = isset($session_data['session_key']) ? $session_data['session_key'] : '';
        $unionid = isset($session_data['unionid']) ? $session_data['unionid'] : '';
        
        // 查找或创建用户
        $user = $this->get_user_by_openid($openid);
        
        if (!$user) {
            // 创建新用户
            $user = $this->create_wechat_user($openid, $unionid, $session_key);
            
            if (!$user) {
                return array(
                    'success' => false,
                    'message' => __('用户创建失败', 'sut-wechat-mini')
                );
            }
        } else {
            // 更新用户session_key
            $this->update_user_session($user->id, $session_key);
        }
        
        // 如果提供了加密数据，解密获取用户信息
        if (!empty($encrypted_data) && !empty($iv) && !empty($session_key)) {
            $user_info = $this->decrypt_wechat_data($encrypted_data, $iv, $session_key, $app_id);
            
            if ($user_info && isset($user_info['openId']) && $user_info['openId'] === $openid) {
                // 更新用户信息
                $this->update_user_info($user->id, $user_info);
            }
        }
        
        // 生成登录令牌
        $token = $this->generate_user_token($user->id);
        
        // 更新最后登录时间
        $this->update_last_login($user->id);
        
        return array(
            'success' => true,
            'user_id' => $user->wp_user_id,
            'token' => $token,
            'user_info' => $this->get_user_info($user->id)
        );
    }
    
    /**
     * 获取微信会话信息
     * 
     * @param string $code 登录凭证
     * @param string $app_id 小程序AppID
     * @param string $app_secret 小程序AppSecret
     * @return array 会话信息
     */
    private function get_wechat_session($code, $app_id, $app_secret) {
        $url = "https://api.weixin.qq.com/sns/jscode2session?appid={$app_id}&secret={$app_secret}&js_code={$code}&grant_type=authorization_code";
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['errcode']) && $data['errcode'] !== 0) {
            return false;
        }
        
        return $data;
    }
    
    /**
     * 解密微信数据
     * 
     * @param string $encrypted_data 加密数据
     * @param string $iv 初始向量
     * @param string $session_key 会话密钥
     * @param string $app_id 小程序AppID
     * @return array 解密后的数据
     */
    private function decrypt_wechat_data($encrypted_data, $iv, $session_key, $app_id) {
        if (function_exists('openssl_decrypt')) {
            $session_key = base64_decode($session_key);
            $iv = base64_decode($iv);
            $encrypted_data = base64_decode($encrypted_data);
            
            $decrypted = openssl_decrypt(
                $encrypted_data,
                'AES-128-CBC',
                $session_key,
                OPENSSL_RAW_DATA,
                $iv
            );
            
            if ($decrypted === false) {
                return false;
            }
            
            $data = json_decode($decrypted, true);
            
            // 验证水印
            if (isset($data['watermark']['appid']) && $data['watermark']['appid'] === $app_id) {
                return $data;
            }
        }
        
        return false;
    }
    
    /**
     * 根据openid获取用户
     * 
     * @param string $openid 微信openid
     * @return object|null 用户对象
     */
    private function get_user_by_openid($openid) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE openid = %s",
            $openid
        ));
    }
    
    /**
     * 创建微信用户
     * 
     * @param string $openid 微信openid
     * @param string $unionid 微信unionid
     * @param string $session_key 会话密钥
     * @return object|null 用户对象
     */
    private function create_wechat_user($openid, $unionid, $session_key) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 生成用户名
        $username = 'wx_' . substr($openid, -8);
        $counter = 1;
        
        while (username_exists($username)) {
            $username = 'wx_' . substr($openid, -8) . '_' . $counter;
            $counter++;
        }
        
        // 创建WordPress用户
        $wp_user_id = wp_create_user($username, wp_generate_password(), '');
        
        if (is_wp_error($wp_user_id)) {
            return null;
        }
        
        // 更新用户角色
        $wp_user = new WP_User($wp_user_id);
        $wp_user->set_role(self::ROLE_SUBSCRIBER);
        
        // 插入微信用户信息
        $result = $wpdb->insert(
            $table_name,
            array(
                'wp_user_id' => $wp_user_id,
                'openid' => $openid,
                'unionid' => $unionid,
                'session_key' => $session_key,
                'role' => self::ROLE_SUBSCRIBER,
                'status' => self::STATUS_ACTIVE,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ),
            array('%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            // 删除WordPress用户
            wp_delete_user($wp_user_id);
            return null;
        }
        
        return $this->get_user_by_openid($openid);
    }
    
    /**
     * 更新用户会话密钥
     * 
     * @param int $user_id 用户ID
     * @param string $session_key 会话密钥
     * @return bool 是否更新成功
     */
    private function update_user_session($user_id, $session_key) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return $wpdb->update(
            $table_name,
            array('session_key' => $session_key, 'updated_at' => current_time('mysql')),
            array('id' => $user_id),
            array('%s', '%s'),
            array('%d')
        ) !== false;
    }
    
    /**
     * 更新用户信息
     * 
     * @param int $user_id 用户ID
     * @param array $user_info 用户信息
     * @return bool 是否更新成功
     */
    private function update_user_info($user_id, $user_info) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        $update_data = array(
            'updated_at' => current_time('mysql')
        );
        
        $update_format = array('%s');
        
        // 映射微信用户信息到数据库字段
        if (isset($user_info['nickName'])) {
            $update_data['nickname'] = $user_info['nickName'];
            $update_format[] = '%s';
        }
        
        if (isset($user_info['avatarUrl'])) {
            $update_data['avatar_url'] = $user_info['avatarUrl'];
            $update_format[] = '%s';
        }
        
        if (isset($user_info['gender'])) {
            $update_data['gender'] = $user_info['gender'];
            $update_format[] = '%d';
        }
        
        if (isset($user_info['city'])) {
            $update_data['city'] = $user_info['city'];
            $update_format[] = '%s';
        }
        
        if (isset($user_info['province'])) {
            $update_data['province'] = $user_info['province'];
            $update_format[] = '%s';
        }
        
        if (isset($user_info['country'])) {
            $update_data['country'] = $user_info['country'];
            $update_format[] = '%s';
        }
        
        if (isset($user_info['language'])) {
            $update_data['language'] = $user_info['language'];
            $update_format[] = '%s';
        }
        
        return $wpdb->update(
            $table_name,
            $update_data,
            array('id' => $user_id),
            $update_format,
            array('%d')
        ) !== false;
    }
    
    /**
     * 生成用户令牌
     * 
     * @param int $user_id 用户ID
     * @return string 用户令牌
     */
    private function generate_user_token($user_id) {
        $token = wp_generate_password(32, false);
        $hashed_token = wp_hash_password($token);
        
        // 存储令牌
        update_user_meta($user_id, 'sut_wechat_mini_token', $hashed_token);
        update_user_meta($user_id, 'sut_wechat_mini_token_time', time());
        
        return $token;
    }
    
    /**
     * 验证用户令牌
     * 
     * @param int $user_id 用户ID
     * @param string $token 用户令牌
     * @return bool 是否有效
     */
    public function verify_user_token($user_id, $token) {
        $hashed_token = get_user_meta($user_id, 'sut_wechat_mini_token', true);
        $token_time = get_user_meta($user_id, 'sut_wechat_mini_token_time', true);
        
        if (empty($hashed_token) || empty($token_time)) {
            return false;
        }
        
        // 检查令牌是否过期（7天）
        if (time() - $token_time > 7 * 24 * 60 * 60) {
            return false;
        }
        
        return wp_check_password($token, $hashed_token);
    }
    
    /**
     * 更新最后登录时间
     * 
     * @param int $user_id 用户ID
     * @return bool 是否更新成功
     */
    private function update_last_login($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return $wpdb->update(
            $table_name,
            array('last_login_time' => current_time('mysql')),
            array('id' => $user_id),
            array('%s'),
            array('%d')
        ) !== false;
    }
    
    /**
     * 获取用户信息
     * 
     * @param int $user_id 用户ID
     * @return array 用户信息
     */
    public function get_user_info($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d",
            $user_id
        ));
        
        if (!$user) {
            return array();
        }
        
        return array(
            'id' => $user->id,
            'wp_user_id' => $user->wp_user_id,
            'nickname' => $user->nickname,
            'avatar_url' => $user->avatar_url,
            'gender' => $user->gender,
            'city' => $user->city,
            'province' => $user->province,
            'country' => $user->country,
            'language' => $user->language,
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'points' => $user->points,
            'balance' => $user->balance,
            'last_login_time' => $user->last_login_time,
            'created_at' => $user->created_at
        );
    }
    
    /**
     * 更新用户资料
     * 
     * @param int $user_id 用户ID
     * @param array $profile_data 用户资料
     * @return bool 是否更新成功
     */
    public function update_user_profile($user_id, $profile_data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        $update_data = array(
            'updated_at' => current_time('mysql')
        );
        
        $update_format = array('%s');
        
        // 允许更新的字段
        $allowed_fields = array(
            'nickname' => '%s',
            'avatar_url' => '%s',
            'gender' => '%d',
            'city' => '%s',
            'province' => '%s',
            'country' => '%s',
            'language' => '%s',
            'phone' => '%s',
            'email' => '%s'
        );
        
        foreach ($allowed_fields as $field => $format) {
            if (isset($profile_data[$field])) {
                $update_data[$field] = $profile_data[$field];
                $update_format[] = $format;
            }
        }
        
        $result = $wpdb->update(
            $table_name,
            $update_data,
            array('id' => $user_id),
            $update_format,
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 如果更新了邮箱，同时更新WordPress用户邮箱
        if (isset($profile_data['email'])) {
            $wp_user_id = $wpdb->get_var($wpdb->prepare(
                "SELECT wp_user_id FROM {$table_name} WHERE id = %d",
                $user_id
            ));
            
            if ($wp_user_id) {
                wp_update_user(array(
                    'ID' => $wp_user_id,
                    'user_email' => $profile_data['email']
                ));
            }
        }
        
        return true;
    }
    
    /**
     * 更新用户角色
     * 
     * @param int $user_id 用户ID
     * @param string $role 用户角色
     * @return bool 是否更新成功
     */
    public function update_user_role($user_id, $role) {
        global $wpdb;
        
        // 验证角色
        $allowed_roles = array(self::ROLE_SUBSCRIBER, self::ROLE_CUSTOMER, self::ROLE_VIP);
        if (!in_array($role, $allowed_roles)) {
            return false;
        }
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        $result = $wpdb->update(
            $table_name,
            array('role' => $role, 'updated_at' => current_time('mysql')),
            array('id' => $user_id),
            array('%s', '%s'),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 同时更新WordPress用户角色
        $wp_user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT wp_user_id FROM {$table_name} WHERE id = %d",
            $user_id
        ));
        
        if ($wp_user_id) {
            $wp_user = new WP_User($wp_user_id);
            $wp_user->set_role($role);
        }
        
        return true;
    }
    
    /**
     * 更新用户状态
     * 
     * @param int $user_id 用户ID
     * @param string $status 用户状态
     * @return bool 是否更新成功
     */
    public function update_user_status($user_id, $status) {
        global $wpdb;
        
        // 验证状态
        $allowed_statuses = array(self::STATUS_ACTIVE, self::STATUS_INACTIVE, self::STATUS_BANNED);
        if (!in_array($status, $allowed_statuses)) {
            return false;
        }
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return $wpdb->update(
            $table_name,
            array('status' => $status, 'updated_at' => current_time('mysql')),
            array('id' => $user_id),
            array('%s', '%s'),
            array('%d')
        ) !== false;
    }
    
    /**
     * 更新用户积分
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分变化量
     * @param string $reason 变化原因
     * @return bool 是否更新成功
     */
    public function update_user_points($user_id, $points, $reason = '') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 获取当前积分
        $current_points = $wpdb->get_var($wpdb->prepare(
            "SELECT points FROM {$table_name} WHERE id = %d",
            $user_id
        ));
        
        if ($current_points === null) {
            return false;
        }
        
        // 计算新积分
        $new_points = max(0, $current_points + $points);
        
        $result = $wpdb->update(
            $table_name,
            array('points' => $new_points, 'updated_at' => current_time('mysql')),
            array('id' => $user_id),
            array('%d', '%s'),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 记录积分变化日志
        $this->add_points_log($user_id, $points, $reason, $current_points, $new_points);
        
        return true;
    }
    
    /**
     * 更新用户余额
     * 
     * @param int $user_id 用户ID
     * @param float $balance 余额变化量
     * @param string $reason 变化原因
     * @return bool 是否更新成功
     */
    public function update_user_balance($user_id, $balance, $reason = '') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 获取当前余额
        $current_balance = $wpdb->get_var($wpdb->prepare(
            "SELECT balance FROM {$table_name} WHERE id = %d",
            $user_id
        ));
        
        if ($current_balance === null) {
            return false;
        }
        
        // 计算新余额
        $new_balance = max(0, $current_balance + $balance);
        
        $result = $wpdb->update(
            $table_name,
            array('balance' => $new_balance, 'updated_at' => current_time('mysql')),
            array('id' => $user_id),
            array('%f', '%s'),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 记录余额变化日志
        $this->add_balance_log($user_id, $balance, $reason, $current_balance, $new_balance);
        
        return true;
    }
    
    /**
     * 添加积分变化日志
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分变化量
     * @param string $reason 变化原因
     * @param int $before 变化前积分
     * @param int $after 变化后积分
     */
    private function add_points_log($user_id, $points, $reason, $before, $after) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_log';
        
        // 创建日志表（如果不存在）
        $this->create_points_log_table();
        
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'points' => $points,
                'reason' => $reason,
                'before' => $before,
                'after' => $after,
                'created_at' => current_time('mysql')
            ),
            array('%d', '%d', '%s', '%d', '%d', '%s')
        );
    }
    
    /**
     * 添加余额变化日志
     * 
     * @param int $user_id 用户ID
     * @param float $balance 余额变化量
     * @param string $reason 变化原因
     * @param float $before 变化前余额
     * @param float $after 变化后余额
     */
    private function add_balance_log($user_id, $balance, $reason, $before, $after) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_balance_log';
        
        // 创建日志表（如果不存在）
        $this->create_balance_log_table();
        
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'balance' => $balance,
                'reason' => $reason,
                'before' => $before,
                'after' => $after,
                'created_at' => current_time('mysql')
            ),
            array('%d', '%f', '%s', '%f', '%f', '%s')
        );
    }
    
    /**
     * 创建积分日志表
     */
    private function create_points_log_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_log';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            points int(11) NOT NULL,
            reason varchar(255) DEFAULT '',
            before int(11) NOT NULL DEFAULT 0,
            after int(11) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建余额日志表
     */
    private function create_balance_log_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_balance_log';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            balance decimal(10,2) NOT NULL,
            reason varchar(255) DEFAULT '',
            before decimal(10,2) NOT NULL DEFAULT 0.00,
            after decimal(10,2) NOT NULL DEFAULT 0.00,
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 获取用户积分日志
     * 
     * @param int $user_id 用户ID
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 积分日志
     */
    public function get_user_points_log($user_id, $page = 1, $per_page = 20) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_log';
        
        $offset = ($page - 1) * $per_page;
        
        $logs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $user_id, $per_page, $offset
        ));
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE user_id = %d",
            $user_id
        ));
        
        return array(
            'logs' => $logs,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        );
    }
    
    /**
     * 获取用户余额日志
     * 
     * @param int $user_id 用户ID
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 余额日志
     */
    public function get_user_balance_log($user_id, $page = 1, $per_page = 20) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_balance_log';
        
        $offset = ($page - 1) * $per_page;
        
        $logs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $user_id, $per_page, $offset
        ));
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE user_id = %d",
            $user_id
        ));
        
        return array(
            'logs' => $logs,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        );
    }
    
    /**
     * AJAX登录处理
     */
    public function ajax_login() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_login_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $code = isset($_POST['code']) ? sanitize_text_field($_POST['code']) : '';
        $encrypted_data = isset($_POST['encrypted_data']) ? sanitize_text_field($_POST['encrypted_data']) : '';
        $iv = isset($_POST['iv']) ? sanitize_text_field($_POST['iv']) : '';
        
        if (empty($code)) {
            wp_send_json_error(array('message' => __('缺少登录凭证', 'sut-wechat-mini')));
        }
        
        $result = $this->wechat_login($code, $encrypted_data, $iv);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error(array('message' => $result['message']));
        }
    }
    
    /**
     * AJAX更新用户资料处理
     */
    public function ajax_update_profile() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_update_profile_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $token = isset($_POST['token']) ? sanitize_text_field($_POST['token']) : '';
        
        if (empty($user_id) || empty($token)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 验证令牌
        if (!$this->verify_user_token($user_id, $token)) {
            wp_send_json_error(array('message' => __('令牌无效', 'sut-wechat-mini')));
        }
        
        // 获取更新数据
        $profile_data = array();
        
        if (isset($_POST['nickname'])) {
            $profile_data['nickname'] = sanitize_text_field($_POST['nickname']);
        }
        
        if (isset($_POST['avatar_url'])) {
            $profile_data['avatar_url'] = esc_url_raw($_POST['avatar_url']);
        }
        
        if (isset($_POST['gender'])) {
            $profile_data['gender'] = intval($_POST['gender']);
        }
        
        if (isset($_POST['city'])) {
            $profile_data['city'] = sanitize_text_field($_POST['city']);
        }
        
        if (isset($_POST['province'])) {
            $profile_data['province'] = sanitize_text_field($_POST['province']);
        }
        
        if (isset($_POST['country'])) {
            $profile_data['country'] = sanitize_text_field($_POST['country']);
        }
        
        if (isset($_POST['language'])) {
            $profile_data['language'] = sanitize_text_field($_POST['language']);
        }
        
        if (isset($_POST['phone'])) {
            $profile_data['phone'] = sanitize_text_field($_POST['phone']);
        }
        
        if (isset($_POST['email'])) {
            $profile_data['email'] = sanitize_email($_POST['email']);
        }
        
        if (empty($profile_data)) {
            wp_send_json_error(array('message' => __('没有更新数据', 'sut-wechat-mini')));
        }
        
        // 更新用户资料
        $result = $this->update_user_profile($user_id, $profile_data);
        
        if ($result) {
            wp_send_json_success(array('message' => __('更新成功', 'sut-wechat-mini')));
        } else {
            wp_send_json_error(array('message' => __('更新失败', 'sut-wechat-mini')));
        }
    }
    
    /**
     * AJAX获取用户信息处理
     */
    public function ajax_get_user_info() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_get_user_info_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $token = isset($_POST['token']) ? sanitize_text_field($_POST['token']) : '';
        
        if (empty($user_id) || empty($token)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 验证令牌
        if (!$this->verify_user_token($user_id, $token)) {
            wp_send_json_error(array('message' => __('令牌无效', 'sut-wechat-mini')));
        }
        
        // 获取用户信息
        $user_info = $this->get_user_info($user_id);
        
        if (empty($user_info)) {
            wp_send_json_error(array('message' => __('用户不存在', 'sut-wechat-mini')));
        }
        
        wp_send_json_success($user_info);
    }
    
    /**
     * 获取用户列表
     * 
     * @param array $args 查询参数
     * @return array 用户列表
     */
    public function get_users($args = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 默认参数
        $defaults = array(
            'role' => '',
            'status' => '',
            'search' => '',
            'orderby' => 'created_at',
            'order' => 'DESC',
            'page' => 1,
            'per_page' => 20
        );
        
        $args = wp_parse_args($args, $defaults);
        
        // 构建查询
        $where = array();
        $sql_args = array();
        
        if (!empty($args['role'])) {
            $where[] = "role = %s";
            $sql_args[] = $args['role'];
        }
        
        if (!empty($args['status'])) {
            $where[] = "status = %s";
            $sql_args[] = $args['status'];
        }
        
        if (!empty($args['search'])) {
            $where[] = "(nickname LIKE %s OR phone LIKE %s OR email LIKE %s)";
            $search = '%' . $wpdb->esc_like($args['search']) . '%';
            $sql_args[] = $search;
            $sql_args[] = $search;
            $sql_args[] = $search;
        }
        
        $where_clause = '';
        if (!empty($where)) {
            $where_clause = 'WHERE ' . implode(' AND ', $where);
        }
        
        // 排序
        $orderby = in_array($args['orderby'], array('id', 'nickname', 'points', 'balance', 'created_at', 'last_login_time')) ? $args['orderby'] : 'created_at';
        $order = in_array(strtoupper($args['order']), array('ASC', 'DESC')) ? strtoupper($args['order']) : 'DESC';
        
        // 分页
        $offset = ($args['page'] - 1) * $args['per_page'];
        
        // 查询用户
        $users = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_name} {$where_clause} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d",
            array_merge($sql_args, array($args['per_page'], $offset))
        ));
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} {$where_clause}",
            $sql_args
        ));
        
        return array(
            'users' => $users,
            'total' => (int) $total,
            'page' => $args['page'],
            'per_page' => $args['per_page'],
            'total_pages' => ceil($total / $args['per_page'])
        );
    }
    
    /**
     * 删除用户
     * 
     * @param int $user_id 用户ID
     * @return bool 是否删除成功
     */
    public function delete_user($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 获取WordPress用户ID
        $wp_user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT wp_user_id FROM {$table_name} WHERE id = %d",
            $user_id
        ));
        
        if (!$wp_user_id) {
            return false;
        }
        
        // 删除微信用户记录
        $result = $wpdb->delete(
            $table_name,
            array('id' => $user_id),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 删除WordPress用户
        wp_delete_user($wp_user_id);
        
        return true;
    }
    
    /**
     * 根据WordPress用户ID获取微信用户信息
     * 
     * @param int $wp_user_id WordPress用户ID
     * @return object|null 微信用户对象
     */
    public function get_user_by_wp_user_id($wp_user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE wp_user_id = %d",
            $wp_user_id
        ));
    }
    
    /**
     * 根据unionid获取用户
     * 
     * @param string $unionid 微信unionid
     * @return object|null 用户对象
     */
    public function get_user_by_unionid($unionid) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE unionid = %s",
            $unionid
        ));
    }
    
    /**
     * 获取用户统计信息
     * 
     * @return array 统计信息
     */
    public function get_user_stats() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 总用户数
        $total_users = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
        
        // 活跃用户数
        $active_users = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} WHERE status = 'active'");
        
        // 今日新增用户数
        $today_users = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE DATE(created_at) = %s",
            date('Y-m-d')
        ));
        
        // 本月新增用户数
        $month_users = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE YEAR(created_at) = %s AND MONTH(created_at) = %s",
            date('Y'), date('m')
        ));
        
        // 按角色统计
        $role_stats = $wpdb->get_results("SELECT role, COUNT(*) as count FROM {$table_name} GROUP BY role");
        
        // 按状态统计
        $status_stats = $wpdb->get_results("SELECT status, COUNT(*) as count FROM {$table_name} GROUP BY status");
        
        return array(
            'total_users' => (int) $total_users,
            'active_users' => (int) $active_users,
            'today_users' => (int) $today_users,
            'month_users' => (int) $month_users,
            'role_stats' => $role_stats,
            'status_stats' => $status_stats
        );
    }
}