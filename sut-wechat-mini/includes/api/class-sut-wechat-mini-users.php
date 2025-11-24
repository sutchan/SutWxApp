<?php
/**
 * 文件名: class-sut-wechat-mini-users.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 用户管理类，处理微信小程序用户相关操作
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 用户管理类
 * 处理微信小程序用户的增删改查操作
 */
class Sut_WeChat_Mini_Users {
    
    /**
     * 用户表名
     * @var string
     */
    private $users_table;
    
    /**
     * 用户积分表名
     * @var string
     */
    private $points_table;
    
    /**
     * 用户地址表名
     * @var string
     */
    private $address_table;
    
    /**
     * 构造函数
     */
    public function __construct() {
        global $wpdb;
        $this->users_table = $wpdb->prefix . 'sut_wxmini_users';
        $this->points_table = $wpdb->prefix . 'sut_wxmini_points';
        $this->address_table = $wpdb->prefix . 'sut_wxmini_addresses';
        
        // 初始化钩子
        $this->init_hooks();
    }
    
    /**
     * 初始化钩子
     */
    private function init_hooks() {
        // 注册激活钩子，创建数据表
        register_activation_hook(SUT_WECHAT_MINI_PLUGIN_FILE, array($this, 'create_tables'));
        
        // 用户注册时创建小程序用户记录
        add_action('user_register', array($this, 'sync_wp_user_to_mini'));
        
        // 用户更新时同步小程序用户信息
        add_action('profile_update', array($this, 'sync_wp_user_to_mini'));
        
        // 用户删除时删除小程序用户记录
        add_action('delete_user', array($this, 'delete_mini_user'));
    }
    
    /**
     * 创建数据表
     */
    public function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        // 用户表
        $users_sql = "CREATE TABLE IF NOT EXISTS {$this->users_table} (
            id int(11) NOT NULL AUTO_INCREMENT,
            wp_user_id int(11) DEFAULT NULL,
            openid varchar(100) NOT NULL,
            unionid varchar(100) DEFAULT NULL,
            session_key varchar(100) DEFAULT NULL,
            nickname varchar(100) DEFAULT NULL,
            avatar_url text DEFAULT NULL,
            gender tinyint(1) DEFAULT 0 COMMENT '0:未知 1:男 2:女',
            city varchar(50) DEFAULT NULL,
            province varchar(50) DEFAULT NULL,
            country varchar(50) DEFAULT NULL,
            language varchar(20) DEFAULT NULL,
            phone varchar(20) DEFAULT NULL,
            email varchar(100) DEFAULT NULL,
            points int(11) DEFAULT 0,
            balance decimal(10,2) DEFAULT 0.00,
            status tinyint(1) DEFAULT 1 COMMENT '0:禁用 1:正常',
            last_login datetime DEFAULT NULL,
            created_at datetime DEFAULT NULL,
            updated_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY openid (openid),
            KEY wp_user_id (wp_user_id),
            KEY unionid (unionid)
        ) $charset_collate;";
        
        // 用户积分表
        $points_sql = "CREATE TABLE IF NOT EXISTS {$this->points_table} (
            id int(11) NOT NULL AUTO_INCREMENT,
            user_id int(11) NOT NULL,
            points int(11) NOT NULL,
            type varchar(20) NOT NULL COMMENT 'earn:获得 spend:消费',
            source varchar(50) NOT NULL COMMENT '来源:register,login,order,task,admin等',
            source_id int(11) DEFAULT NULL COMMENT '来源ID',
            description varchar(255) DEFAULT NULL,
            created_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY type (type),
            KEY source (source),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        // 用户地址表
        $address_sql = "CREATE TABLE IF NOT EXISTS {$this->address_table} (
            id int(11) NOT NULL AUTO_INCREMENT,
            user_id int(11) NOT NULL,
            contact_name varchar(50) NOT NULL,
            phone varchar(20) NOT NULL,
            province varchar(50) NOT NULL,
            city varchar(50) NOT NULL,
            district varchar(50) NOT NULL,
            address varchar(255) NOT NULL,
            postal_code varchar(10) DEFAULT NULL,
            is_default tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT NULL,
            updated_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($users_sql);
        dbDelta($points_sql);
        dbDelta($address_sql);
    }
    
    /**
     * 根据openid获取用户
     *
     * @param string $openid 微信openid
     * @return object|null 用户对象
     */
    public function get_user_by_openid($openid) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->users_table} WHERE openid = %s",
            $openid
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
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->users_table} WHERE unionid = %s",
            $unionid
        ));
    }
    
    /**
     * 根据token获取用户
     *
     * @param string $token 用户token
     * @return object|null 用户对象
     */
    public function get_user_by_token($token) {
        global $wpdb;
        
        // 这里应该使用JWT库解析token，为了简化示例，我们使用base64解码
        $payload = json_decode(base64_decode($token), true);
        
        if (!$payload || !isset($payload['user_id']) || !isset($payload['exp'])) {
            return null;
        }
        
        // 检查token是否过期
        if ($payload['exp'] < time()) {
            return null;
        }
        
        $user_id = $payload['user_id'];
        
        return $this->get_user($user_id);
    }
    
    /**
     * 根据refresh_token获取用户
     *
     * @param string $refresh_token 刷新token
     * @return object|null 用户对象
     */
    public function get_user_by_refresh_token($refresh_token) {
        global $wpdb;
        
        // 这里应该使用JWT库解析refresh_token，为了简化示例，我们使用base64解码
        $payload = json_decode(base64_decode($refresh_token), true);
        
        if (!$payload || !isset($payload['user_id']) || !isset($payload['exp'])) {
            return null;
        }
        
        // 检查refresh_token是否过期
        if ($payload['exp'] < time()) {
            return null;
        }
        
        $user_id = $payload['user_id'];
        
        return $this->get_user($user_id);
    }
    
    /**
     * 根据ID获取用户
     *
     * @param int $user_id 用户ID
     * @return object|null 用户对象
     */
    public function get_user($user_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->users_table} WHERE id = %d",
            $user_id
        ));
    }
    
    /**
     * 根据WordPress用户ID获取小程序用户
     *
     * @param int $wp_user_id WordPress用户ID
     * @return object|null 用户对象
     */
    public function get_user_by_wp_id($wp_user_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->users_table} WHERE wp_user_id = %d",
            $wp_user_id
        ));
    }
    
    /**
     * 创建用户
     *
     * @param array $user_data 用户数据
     * @return int|false 用户ID或false
     */
    public function create_user($user_data) {
        global $wpdb;
        
        $default_data = array(
            'wp_user_id' => null,
            'openid' => '',
            'unionid' => null,
            'session_key' => null,
            'nickname' => null,
            'avatar_url' => null,
            'gender' => 0,
            'city' => null,
            'province' => null,
            'country' => null,
            'language' => null,
            'phone' => null,
            'email' => null,
            'points' => 0,
            'balance' => 0.00,
            'status' => 1,
            'last_login' => null,
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $user_data = wp_parse_args($user_data, $default_data);
        
        $result = $wpdb->insert(
            $this->users_table,
            $user_data,
            array('%d', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%f', '%d', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        $user_id = $wpdb->insert_id;
        
        // 触发用户创建钩子
        do_action('sut_wechat_mini_user_created', $user_id, $user_data);
        
        return $user_id;
    }
    
    /**
     * 更新用户
     *
     * @param int $user_id 用户ID
     * @param array $user_data 用户数据
     * @return bool 是否更新成功
     */
    public function update_user($user_id, $user_data) {
        global $wpdb;
        
        if (empty($user_data)) {
            return false;
        }
        
        $user_data['updated_at'] = current_time('mysql');
        
        $format = array();
        foreach ($user_data as $key => $value) {
            if ($key === 'updated_at') {
                $format[] = '%s';
            } elseif (in_array($key, array('wp_user_id', 'gender', 'points', 'status'))) {
                $format[] = '%d';
            } elseif ($key === 'balance') {
                $format[] = '%f';
            } else {
                $format[] = '%s';
            }
        }
        
        $result = $wpdb->update(
            $this->users_table,
            $user_data,
            array('id' => $user_id),
            $format,
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 触发用户更新钩子
        do_action('sut_wechat_mini_user_updated', $user_id, $user_data);
        
        return true;
    }
    
    /**
     * 删除用户
     *
     * @param int $user_id 用户ID
     * @return bool 是否删除成功
     */
    public function delete_user($user_id) {
        global $wpdb;
        
        // 删除用户地址
        $wpdb->delete(
            $this->address_table,
            array('user_id' => $user_id),
            array('%d')
        );
        
        // 删除用户积分记录
        $wpdb->delete(
            $this->points_table,
            array('user_id' => $user_id),
            array('%d')
        );
        
        // 删除用户
        $result = $wpdb->delete(
            $this->users_table,
            array('id' => $user_id),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 触发用户删除钩子
        do_action('sut_wechat_mini_user_deleted', $user_id);
        
        return true;
    }
    
    /**
     * 保存用户token
     *
     * @param int $user_id 用户ID
     * @param string $token 用户token
     * @return bool 是否保存成功
     */
    public function save_user_token($user_id, $token) {
        // 生成refresh_token
        $refresh_payload = array(
            'user_id' => $user_id,
            'exp' => time() + (30 * 24 * 60 * 60), // 30天有效期
            'iat' => time()
        );
        $refresh_token = base64_encode(json_encode($refresh_payload));
        
        // 保存token到用户表
        return $this->update_user($user_id, array(
            'token' => $token,
            'refresh_token' => $refresh_token,
            'token_expires_at' => date('Y-m-d H:i:s', time() + (7 * 24 * 60 * 60)), // 7天有效期
            'refresh_token_expires_at' => date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)) // 30天有效期
        ));
    }
    
    /**
     * 增加用户积分
     *
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 来源
     * @param int $source_id 来源ID
     * @param string $description 描述
     * @return bool 是否增加成功
     */
    public function add_points($user_id, $points, $source, $source_id = null, $description = '') {
        global $wpdb;
        
        if ($points <= 0) {
            return false;
        }
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 更新用户积分
            $result = $wpdb->query($wpdb->prepare(
                "UPDATE {$this->users_table} SET points = points + %d, updated_at = %s WHERE id = %d",
                $points, current_time('mysql'), $user_id
            ));
            
            if ($result === false) {
                throw new Exception('更新用户积分失败');
            }
            
            // 记录积分变化
            $result = $wpdb->insert(
                $this->points_table,
                array(
                    'user_id' => $user_id,
                    'points' => $points,
                    'type' => 'earn',
                    'source' => $source,
                    'source_id' => $source_id,
                    'description' => $description,
                    'created_at' => current_time('mysql')
                ),
                array('%d', '%d', '%s', '%s', '%d', '%s', '%s')
            );
            
            if ($result === false) {
                throw new Exception('记录积分变化失败');
            }
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 触发积分增加钩子
            do_action('sut_wechat_mini_points_added', $user_id, $points, $source, $source_id, $description);
            
            return true;
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            return false;
        }
    }
    
    /**
     * 扣除用户积分
     *
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 来源
     * @param int $source_id 来源ID
     * @param string $description 描述
     * @return bool 是否扣除成功
     */
    public function deduct_points($user_id, $points, $source, $source_id = null, $description = '') {
        global $wpdb;
        
        if ($points <= 0) {
            return false;
        }
        
        // 检查用户积分是否足够
        $user = $this->get_user($user_id);
        if (!$user || $user->points < $points) {
            return false;
        }
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 更新用户积分
            $result = $wpdb->query($wpdb->prepare(
                "UPDATE {$this->users_table} SET points = points - %d, updated_at = %s WHERE id = %d",
                $points, current_time('mysql'), $user_id
            ));
            
            if ($result === false) {
                throw new Exception('更新用户积分失败');
            }
            
            // 记录积分变化
            $result = $wpdb->insert(
                $this->points_table,
                array(
                    'user_id' => $user_id,
                    'points' => $points,
                    'type' => 'spend',
                    'source' => $source,
                    'source_id' => $source_id,
                    'description' => $description,
                    'created_at' => current_time('mysql')
                ),
                array('%d', '%d', '%s', '%s', '%d', '%s', '%s')
            );
            
            if ($result === false) {
                throw new Exception('记录积分变化失败');
            }
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 触发积分扣除钩子
            do_action('sut_wechat_mini_points_deducted', $user_id, $points, $source, $source_id, $description);
            
            return true;
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            return false;
        }
    }
    
    /**
     * 获取用户积分记录
     *
     * @param int $user_id 用户ID
     * @param string $type 类型：earn/spend
     * @param string $source 来源
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 积分记录和分页信息
     */
    public function get_user_points($user_id, $type = '', $source = '', $page = 1, $per_page = 20) {
        global $wpdb;
        
        $where = "WHERE user_id = %d";
        $params = array($user_id);
        
        if (!empty($type)) {
            $where .= " AND type = %s";
            $params[] = $type;
        }
        
        if (!empty($source)) {
            $where .= " AND source = %s";
            $params[] = $source;
        }
        
        $offset = ($page - 1) * $per_page;
        $limit = "LIMIT %d OFFSET %d";
        $params[] = $per_page;
        $params[] = $offset;
        
        $sql = "SELECT * FROM {$this->points_table} $where ORDER BY created_at DESC $limit";
        $points = $wpdb->get_results($wpdb->prepare($sql, $params));
        
        // 获取总数
        $count_sql = "SELECT COUNT(*) FROM {$this->points_table} $where";
        $total = $wpdb->get_var($wpdb->prepare($count_sql, array_slice($params, 0, -2)));
        
        return array(
            'points' => $points,
            'total' => $total,
            'pages' => ceil($total / $per_page),
            'current_page' => $page
        );
    }
    
    /**
     * 添加用户地址
     *
     * @param int $user_id 用户ID
     * @param array $address_data 地址数据
     * @return int|false 地址ID或false
     */
    public function add_address($user_id, $address_data) {
        global $wpdb;
        
        $default_data = array(
            'contact_name' => '',
            'phone' => '',
            'province' => '',
            'city' => '',
            'district' => '',
            'address' => '',
            'postal_code' => '',
            'is_default' => 0,
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $address_data = wp_parse_args($address_data, $default_data);
        $address_data['user_id'] = $user_id;
        
        // 如果设置为默认地址，先将其他地址设为非默认
        if ($address_data['is_default']) {
            $wpdb->update(
                $this->address_table,
                array('is_default' => 0, 'updated_at' => current_time('mysql')),
                array('user_id' => $user_id),
                array('%d', '%s'),
                array('%d')
            );
        }
        
        $result = $wpdb->insert(
            $this->address_table,
            $address_data,
            array('%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        $address_id = $wpdb->insert_id;
        
        // 触发地址添加钩子
        do_action('sut_wechat_mini_address_added', $address_id, $user_id, $address_data);
        
        return $address_id;
    }
    
    /**
     * 更新用户地址
     *
     * @param int $address_id 地址ID
     * @param array $address_data 地址数据
     * @return bool 是否更新成功
     */
    public function update_address($address_id, $address_data) {
        global $wpdb;
        
        if (empty($address_data)) {
            return false;
        }
        
        // 获取地址信息
        $address = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->address_table} WHERE id = %d",
            $address_id
        ));
        
        if (!$address) {
            return false;
        }
        
        // 如果设置为默认地址，先将其他地址设为非默认
        if (isset($address_data['is_default']) && $address_data['is_default']) {
            $wpdb->update(
                $this->address_table,
                array('is_default' => 0, 'updated_at' => current_time('mysql')),
                array('user_id' => $address->user_id),
                array('%d', '%s'),
                array('%d')
            );
        }
        
        $address_data['updated_at'] = current_time('mysql');
        
        $format = array();
        foreach ($address_data as $key => $value) {
            if ($key === 'updated_at') {
                $format[] = '%s';
            } elseif ($key === 'is_default') {
                $format[] = '%d';
            } else {
                $format[] = '%s';
            }
        }
        
        $result = $wpdb->update(
            $this->address_table,
            $address_data,
            array('id' => $address_id),
            $format,
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 触发地址更新钩子
        do_action('sut_wechat_mini_address_updated', $address_id, $address->user_id, $address_data);
        
        return true;
    }
    
    /**
     * 删除用户地址
     *
     * @param int $address_id 地址ID
     * @return bool 是否删除成功
     */
    public function delete_address($address_id) {
        global $wpdb;
        
        // 获取地址信息
        $address = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->address_table} WHERE id = %d",
            $address_id
        ));
        
        if (!$address) {
            return false;
        }
        
        $result = $wpdb->delete(
            $this->address_table,
            array('id' => $address_id),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 如果删除的是默认地址，将第一个地址设为默认
        if ($address->is_default) {
            $first_address = $wpdb->get_row($wpdb->prepare(
                "SELECT id FROM {$this->address_table} WHERE user_id = %d ORDER BY id ASC LIMIT 1",
                $address->user_id
            ));
            
            if ($first_address) {
                $wpdb->update(
                    $this->address_table,
                    array('is_default' => 1, 'updated_at' => current_time('mysql')),
                    array('id' => $first_address->id),
                    array('%d', '%s'),
                    array('%d')
                );
            }
        }
        
        // 触发地址删除钩子
        do_action('sut_wechat_mini_address_deleted', $address_id, $address->user_id);
        
        return true;
    }
    
    /**
     * 获取用户地址
     *
     * @param int $address_id 地址ID
     * @return object|null 地址对象
     */
    public function get_address($address_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->address_table} WHERE id = %d",
            $address_id
        ));
    }
    
    /**
     * 获取用户地址列表
     *
     * @param int $user_id 用户ID
     * @return array 地址列表
     */
    public function get_user_addresses($user_id) {
        global $wpdb;
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$this->address_table} WHERE user_id = %d ORDER BY is_default DESC, id ASC",
            $user_id
        ));
    }
    
    /**
     * 获取用户默认地址
     *
     * @param int $user_id 用户ID
     * @return object|null 默认地址对象
     */
    public function get_user_default_address($user_id) {
        global $wpdb;
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->address_table} WHERE user_id = %d AND is_default = 1",
            $user_id
        ));
    }
    
    /**
     * 设置默认地址
     *
     * @param int $address_id 地址ID
     * @return bool 是否设置成功
     */
    public function set_default_address($address_id) {
        global $wpdb;
        
        // 获取地址信息
        $address = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->address_table} WHERE id = %d",
            $address_id
        ));
        
        if (!$address) {
            return false;
        }
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 将用户所有地址设为非默认
            $wpdb->update(
                $this->address_table,
                array('is_default' => 0, 'updated_at' => current_time('mysql')),
                array('user_id' => $address->user_id),
                array('%d', '%s'),
                array('%d')
            );
            
            // 将指定地址设为默认
            $wpdb->update(
                $this->address_table,
                array('is_default' => 1, 'updated_at' => current_time('mysql')),
                array('id' => $address_id),
                array('%d', '%s'),
                array('%d')
            );
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 触发默认地址设置钩子
            do_action('sut_wechat_mini_default_address_set', $address_id, $address->user_id);
            
            return true;
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            return false;
        }
    }
    
    /**
     * 同步WordPress用户到小程序用户
     *
     * @param int $wp_user_id WordPress用户ID
     * @return bool 是否同步成功
     */
    public function sync_wp_user_to_mini($wp_user_id) {
        $wp_user = get_userdata($wp_user_id);
        
        if (!$wp_user) {
            return false;
        }
        
        // 检查是否已存在小程序用户记录
        $mini_user = $this->get_user_by_wp_id($wp_user_id);
        
        $user_data = array(
            'wp_user_id' => $wp_user_id,
            'nickname' => $wp_user->display_name,
            'email' => $wp_user->user_email,
            'updated_at' => current_time('mysql')
        );
        
        if ($mini_user) {
            // 更新现有记录
            return $this->update_user($mini_user->id, $user_data);
        } else {
            // 创建新记录
            return $this->create_user($user_data) !== false;
        }
    }
    
    /**
     * 删除小程序用户
     *
     * @param int $wp_user_id WordPress用户ID
     * @return bool 是否删除成功
     */
    public function delete_mini_user($wp_user_id) {
        $mini_user = $this->get_user_by_wp_id($wp_user_id);
        
        if (!$mini_user) {
            return false;
        }
        
        return $this->delete_user($mini_user->id);
    }
}