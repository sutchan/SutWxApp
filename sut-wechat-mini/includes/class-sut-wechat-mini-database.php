<?php
/**
 * 文件名: class-sut-wechat-mini-database.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 数据库操作类
 * 
 * 提供微信小程序的数据库操作功能
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 数据库操作类
 */
class Sut_WeChat_Mini_Database {
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 数据库表前缀
     */
    private $prefix;
    
    /**
     * 构造函数
     */
    private function __construct() {
        global $wpdb;
        $this->prefix = $wpdb->prefix . 'sut_wechat_mini_';
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Database 数据库操作实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化数据库表
     * 
     * @return void
     */
    public function init_tables() {
        $this->create_users_table();
        $this->create_sessions_table();
        $this->create_messages_table();
        $this->create_points_table();
        $this->create_points_tasks_table();
        $this->create_points_user_tasks_table();
        $this->create_points_exchange_items_table();
        $this->create_points_exchange_records_table();
        $this->create_orders_table();
        $this->create_order_items_table();
        $this->create_payments_table();
        $this->create_logs_table();
    }
    
    /**
     * 创建用户表
     * 
     * @return void
     */
    private function create_users_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'users';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            wp_user_id bigint(20) unsigned NOT NULL,
            openid varchar(100) NOT NULL,
            unionid varchar(100) DEFAULT '',
            session_key varchar(100) DEFAULT '',
            nickname varchar(100) DEFAULT '',
            avatar_url varchar(500) DEFAULT '',
            gender tinyint(1) DEFAULT 0 COMMENT '0:未知 1:男 2:女',
            country varchar(50) DEFAULT '',
            province varchar(50) DEFAULT '',
            city varchar(50) DEFAULT '',
            language varchar(20) DEFAULT '',
            phone varchar(20) DEFAULT '',
            email varchar(100) DEFAULT '',
            points int(11) DEFAULT 0,
            level int(11) DEFAULT 1,
            total_points int(11) DEFAULT 0,
            status tinyint(1) DEFAULT 1 COMMENT '0:禁用 1:正常',
            last_login_time datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY openid (openid),
            KEY wp_user_id (wp_user_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建会话表
     * 
     * @return void
     */
    private function create_sessions_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'sessions';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            token varchar(255) NOT NULL,
            refresh_token varchar(255) NOT NULL,
            expires_at datetime NOT NULL,
            ip_address varchar(45) DEFAULT '',
            user_agent varchar(500) DEFAULT '',
            status tinyint(1) DEFAULT 1 COMMENT '0:失效 1:有效',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY token (token),
            KEY user_id (user_id),
            KEY expires_at (expires_at),
            KEY status (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建消息表
     * 
     * @return void
     */
    private function create_messages_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'messages';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            type varchar(20) NOT NULL COMMENT 'system:系统通知 order:订单通知 points:积分通知',
            title varchar(200) NOT NULL,
            content text NOT NULL,
            extra_data longtext DEFAULT NULL COMMENT '额外数据，JSON格式',
            is_read tinyint(1) DEFAULT 0 COMMENT '0:未读 1:已读',
            read_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY type (type),
            KEY is_read (is_read),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建积分表
     * 
     * @return void
     */
    private function create_points_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'points_history';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            type varchar(20) NOT NULL COMMENT 'earn:获取 spend:消费 expire:过期',
            points int(11) NOT NULL COMMENT '正数为获得，负数为消费',
            description varchar(200) NOT NULL,
            extra_data longtext DEFAULT NULL COMMENT '额外数据，JSON格式',
            expires_at datetime DEFAULT NULL COMMENT '积分过期时间',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY type (type),
            KEY created_at (created_at),
            KEY expires_at (expires_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建积分任务表
     * 
     * @return void
     */
    private function create_points_tasks_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'points_tasks';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            description text NOT NULL,
            type varchar(20) NOT NULL COMMENT 'once:一次性 daily:每日 weekly:每周 monthly:每月',
            points int(11) NOT NULL,
            max_completions int(11) DEFAULT 0 COMMENT '最大完成次数，0为无限制',
            icon varchar(200) DEFAULT '',
            order_num int(11) DEFAULT 0 COMMENT '排序',
            status tinyint(1) DEFAULT 1 COMMENT '0:禁用 1:启用',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY type (type),
            KEY status (status),
            KEY order_num (order_num)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建用户积分任务表
     * 
     * @return void
     */
    private function create_points_user_tasks_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'points_user_tasks';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            task_id bigint(20) unsigned NOT NULL,
            status varchar(20) NOT NULL COMMENT 'pending:待完成 completed:已完成',
            completions int(11) DEFAULT 0 COMMENT '完成次数',
            completed_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_task (user_id, task_id),
            KEY user_id (user_id),
            KEY task_id (task_id),
            KEY status (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建积分兑换商品表
     * 
     * @return void
     */
    private function create_points_exchange_items_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'points_exchange_items';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            description text NOT NULL,
            category varchar(50) NOT NULL COMMENT '商品分类',
            points int(11) NOT NULL COMMENT '所需积分',
            stock int(11) NOT NULL DEFAULT 0 COMMENT '库存',
            image varchar(500) DEFAULT '' COMMENT '商品图片',
            order_num int(11) DEFAULT 0 COMMENT '排序',
            status varchar(20) DEFAULT 'active' COMMENT 'active:激活 inactive:禁用',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY category (category),
            KEY status (status),
            KEY order_num (order_num)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建积分兑换记录表
     * 
     * @return void
     */
    private function create_points_exchange_records_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'points_exchange_records';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            item_id bigint(20) unsigned NOT NULL,
            quantity int(11) NOT NULL DEFAULT 1 COMMENT '兑换数量',
            points int(11) NOT NULL COMMENT '消耗积分',
            status varchar(20) DEFAULT 'processing' COMMENT 'processing:处理中 completed:已完成 cancelled:已取消',
            shipping_info longtext DEFAULT NULL COMMENT '配送信息，JSON格式',
            tracking_number varchar(100) DEFAULT '' COMMENT '快递单号',
            completed_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY item_id (item_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建订单表
     * 
     * @return void
     */
    private function create_orders_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'orders';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            order_number varchar(50) NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'pending:待付款 paid:已付款 shipped:已发货 completed:已完成 cancelled:已取消',
            payment_method varchar(20) DEFAULT '',
            payment_status varchar(20) DEFAULT 'unpaid' COMMENT 'unpaid:未支付 paid:已支付 refunded:已退款',
            total_amount decimal(10,2) NOT NULL DEFAULT 0.00,
            discount_amount decimal(10,2) NOT NULL DEFAULT 0.00,
            shipping_amount decimal(10,2) NOT NULL DEFAULT 0.00,
            points_used int(11) NOT NULL DEFAULT 0 COMMENT '使用的积分',
            points_amount decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '积分抵扣金额',
            final_amount decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '实际支付金额',
            currency varchar(10) NOT NULL DEFAULT 'CNY',
            receiver_name varchar(50) DEFAULT '',
            receiver_phone varchar(20) DEFAULT '',
            receiver_address varchar(500) DEFAULT '',
            receiver_province varchar(50) DEFAULT '',
            receiver_city varchar(50) DEFAULT '',
            receiver_district varchar(50) DEFAULT '',
            receiver_zip_code varchar(10) DEFAULT '',
            note varchar(500) DEFAULT '',
            paid_at datetime DEFAULT NULL,
            shipped_at datetime DEFAULT NULL,
            completed_at datetime DEFAULT NULL,
            cancelled_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY order_number (order_number),
            KEY user_id (user_id),
            KEY status (status),
            KEY payment_status (payment_status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建订单项表
     * 
     * @return void
     */
    private function create_order_items_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'order_items';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            order_id bigint(20) unsigned NOT NULL,
            product_id bigint(20) unsigned NOT NULL,
            product_name varchar(200) NOT NULL,
            product_image varchar(500) DEFAULT '',
            product_sku varchar(100) DEFAULT '',
            product_price decimal(10,2) NOT NULL DEFAULT 0.00,
            quantity int(11) NOT NULL DEFAULT 1,
            total_price decimal(10,2) NOT NULL DEFAULT 0.00,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY order_id (order_id),
            KEY product_id (product_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建支付表
     * 
     * @return void
     */
    private function create_payments_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'payments';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            order_id bigint(20) unsigned NOT NULL,
            payment_id varchar(100) NOT NULL COMMENT '支付平台返回的支付ID',
            payment_method varchar(20) NOT NULL COMMENT 'wechat:微信支付 alipay:支付宝',
            amount decimal(10,2) NOT NULL DEFAULT 0.00,
            status varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'pending:待支付 success:支付成功 failed:支付失败 cancelled:已取消',
            transaction_id varchar(100) DEFAULT '' COMMENT '第三方支付交易号',
            prepay_id varchar(100) DEFAULT '' COMMENT '微信预支付ID',
            pay_time datetime DEFAULT NULL COMMENT '支付时间',
            notify_data longtext DEFAULT NULL COMMENT '支付回调数据，JSON格式',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY payment_id (payment_id),
            KEY order_id (order_id),
            KEY payment_method (payment_method),
            KEY status (status),
            KEY transaction_id (transaction_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 创建日志表
     * 
     * @return void
     */
    private function create_logs_table() {
        global $wpdb;
        
        $table_name = $this->prefix . 'logs';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            level varchar(20) NOT NULL COMMENT 'debug:调试 info:信息 warning:警告 error:错误',
            channel varchar(50) NOT NULL COMMENT '日志通道',
            message text NOT NULL COMMENT '日志消息',
            context longtext DEFAULT NULL COMMENT '上下文数据，JSON格式',
            user_id bigint(20) unsigned DEFAULT NULL COMMENT '用户ID',
            ip_address varchar(45) DEFAULT '' COMMENT 'IP地址',
            user_agent varchar(500) DEFAULT '' COMMENT '用户代理',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY level (level),
            KEY channel (channel),
            KEY user_id (user_id),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 获取表名
     * 
     * @param string $table 表名
     * @return string 完整表名
     */
    public function get_table_name($table) {
        return $this->prefix . $table;
    }
    
    /**
     * 插入数据
     * 
     * @param string $table 表名
     * @param array $data 数据
     * @param array $format 格式
     * @return int|false 插入的ID或false
     */
    public function insert($table, $data, $format = null) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        return $wpdb->insert($table_name, $data, $format);
    }
    
    /**
     * 更新数据
     * 
     * @param string $table 表名
     * @param array $data 数据
     * @param array $where 条件
     * @param array $format 数据格式
     * @param array $where_format 条件格式
     * @return int|false 影响的行数或false
     */
    public function update($table, $data, $where, $format = null, $where_format = null) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        return $wpdb->update($table_name, $data, $where, $format, $where_format);
    }
    
    /**
     * 删除数据
     * 
     * @param string $table 表名
     * @param array $where 条件
     * @param array $format 格式
     * @return int|false 影响的行数或false
     */
    public function delete($table, $where, $format = null) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        return $wpdb->delete($table_name, $where, $format);
    }
    
    /**
     * 获取单行数据
     * 
     * @param string $table 表名
     * @param array $where 条件
     * @param string $output 输出类型
     * @return object|array|null 单行数据或null
     */
    public function get_row($table, $where, $output = OBJECT) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        $where_clause = '';
        $values = array();
        
        foreach ($where as $key => $value) {
            if (!empty($where_clause)) {
                $where_clause .= ' AND ';
            }
            $where_clause .= $key . ' = %s';
            $values[] = $value;
        }
        
        $sql = "SELECT * FROM $table_name WHERE $where_clause";
        
        return $wpdb->get_row($wpdb->prepare($sql, $values), $output);
    }
    
    /**
     * 获取多行数据
     * 
     * @param string $table 表名
     * @param array $where 条件
     * @param string $order 排序
     * @param int $limit 限制
     * @param string $output 输出类型
     * @return array 多行数据
     */
    public function get_results($table, $where = array(), $order = '', $limit = 0, $output = OBJECT) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        $where_clause = '';
        $values = array();
        
        foreach ($where as $key => $value) {
            if (!empty($where_clause)) {
                $where_clause .= ' AND ';
            }
            $where_clause .= $key . ' = %s';
            $values[] = $value;
        }
        
        $sql = "SELECT * FROM $table_name";
        
        if (!empty($where_clause)) {
            $sql .= " WHERE $where_clause";
        }
        
        if (!empty($order)) {
            $sql .= " ORDER BY $order";
        }
        
        if ($limit > 0) {
            $sql .= " LIMIT $limit";
        }
        
        return $wpdb->get_results($wpdb->prepare($sql, $values), $output);
    }
    
    /**
     * 获取变量值
     * 
     * @param string $table 表名
     * @param string $column 列名
     * @param array $where 条件
     * @return string|null 变量值或null
     */
    public function get_var($table, $column, $where = array()) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        $where_clause = '';
        $values = array();
        
        foreach ($where as $key => $value) {
            if (!empty($where_clause)) {
                $where_clause .= ' AND ';
            }
            $where_clause .= $key . ' = %s';
            $values[] = $value;
        }
        
        $sql = "SELECT $column FROM $table_name";
        
        if (!empty($where_clause)) {
            $sql .= " WHERE $where_clause";
        }
        
        return $wpdb->get_var($wpdb->prepare($sql, $values));
    }
    
    /**
     * 执行自定义查询
     * 
     * @param string $sql SQL语句
     * @param array $values 参数值
     * @return mixed 查询结果
     */
    public function query($sql, $values = array()) {
        global $wpdb;
        
        if (!empty($values)) {
            $sql = $wpdb->prepare($sql, $values);
        }
        
        return $wpdb->get_results($sql);
    }
    
    /**
     * 获取最后插入的ID
     * 
     * @return int 最后插入的ID
     */
    public function get_insert_id() {
        global $wpdb;
        
        return $wpdb->insert_id;
    }
    
    /**
     * 开始事务
     * 
     * @return bool 是否成功
     */
    public function start_transaction() {
        global $wpdb;
        
        return $wpdb->query('START TRANSACTION');
    }
    
    /**
     * 提交事务
     * 
     * @return bool 是否成功
     */
    public function commit() {
        global $wpdb;
        
        return $wpdb->query('COMMIT');
    }
    
    /**
     * 回滚事务
     * 
     * @return bool 是否成功
     */
    public function rollback() {
        global $wpdb;
        
        return $wpdb->query('ROLLBACK');
    }
    
    /**
     * 获取分页数据
     * 
     * @param string $table 表名
     * @param array $where 条件
     * @param string $order 排序
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 分页数据
     */
    public function get_paginated_results($table, $where = array(), $order = '', $page = 1, $per_page = 20) {
        global $wpdb;
        
        $table_name = $this->get_table_name($table);
        
        $where_clause = '';
        $values = array();
        
        foreach ($where as $key => $value) {
            if (!empty($where_clause)) {
                $where_clause .= ' AND ';
            }
            $where_clause .= $key . ' = %s';
            $values[] = $value;
        }
        
        // 获取总数
        $sql = "SELECT COUNT(*) FROM $table_name";
        
        if (!empty($where_clause)) {
            $sql .= " WHERE $where_clause";
        }
        
        $total = $wpdb->get_var($wpdb->prepare($sql, $values));
        
        // 计算分页
        $total_pages = ceil($total / $per_page);
        $offset = ($page - 1) * $per_page;
        
        // 获取数据
        $sql = "SELECT * FROM $table_name";
        
        if (!empty($where_clause)) {
            $sql .= " WHERE $where_clause";
        }
        
        if (!empty($order)) {
            $sql .= " ORDER BY $order";
        }
        
        $sql .= " LIMIT %d OFFSET %d";
        
        $results = $wpdb->get_results($wpdb->prepare($sql, array_merge($values, array($per_page, $offset))));
        
        return array(
            'data' => $results,
            'total' => $total,
            'total_pages' => $total_pages,
            'current_page' => $page,
            'per_page' => $per_page,
        );
    }
}