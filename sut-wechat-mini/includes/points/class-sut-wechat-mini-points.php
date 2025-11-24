<?php
/**
 * 文件名: class-sut-wechat-mini-points.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 积分系统类
 * 
 * 提供微信小程序积分管理功能，包括积分获取、消费、兑换等
 * 支持积分任务、积分商城、积分等级等功能
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 积分系统类
 */
class Sut_WeChat_Mini_Points {
    
    /**
     * 积分任务类型常量
     */
    const TASK_TYPE_DAILY = 'daily';      // 每日任务
    const TASK_TYPE_WEEKLY = 'weekly';    // 每周任务
    const TASK_TYPE_MONTHLY = 'monthly';  // 每月任务
    const TASK_TYPE_ONCE = 'once';        // 一次性任务
    
    /**
     * 积分任务状态常量
     */
    const TASK_STATUS_PENDING = 'pending';    // 待完成
    const TASK_STATUS_COMPLETED = 'completed'; // 已完成
    const TASK_STATUS_CLAIMED = 'claimed';     // 已领取
    
    /**
     * 积分记录类型常量
     */
    const RECORD_TYPE_EARN = 'earn';       // 获取
    const RECORD_TYPE_SPEND = 'spend';     // 消费
    const RECORD_TYPE_EXPIRE = 'expire';   // 过期
    const RECORD_TYPE_REFUND = 'refund';   // 退还
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 注册积分相关钩子
        add_action('init', array($this, 'init_points_hooks'));
        
        // 注册AJAX处理程序
        add_action('wp_ajax_sut_wechat_mini_get_points_tasks', array($this, 'ajax_get_points_tasks'));
        add_action('wp_ajax_sut_wechat_mini_complete_points_task', array($this, 'ajax_complete_points_task'));
        add_action('wp_ajax_sut_wechat_mini_claim_points_reward', array($this, 'ajax_claim_points_reward'));
        add_action('wp_ajax_sut_wechat_mini_get_points_records', array($this, 'ajax_get_points_records'));
        add_action('wp_ajax_sut_wechat_mini_get_points_shop_items', array($this, 'ajax_get_points_shop_items'));
        add_action('wp_ajax_sut_wechat_mini_exchange_points_item', array($this, 'ajax_exchange_points_item'));
        
        // 注册用户相关事件钩子
        add_action('sut_wechat_mini_user_registered', array($this, 'award_register_points'), 10, 2);
        add_action('sut_wechat_mini_user_login', array($this, 'award_login_points'), 10, 2);
        add_action('sut_wechat_mini_order_completed', array($this, 'award_order_points'), 10, 2);
        add_action('sut_wechat_mini_comment_posted', array($this, 'award_comment_points'), 10, 2);
        add_action('sut_wechat_mini_article_shared', array($this, 'award_share_points'), 10, 2);
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Points 积分系统实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化积分钩子
     */
    public function init_points_hooks() {
        // 创建积分相关数据表
        $this->create_points_tables();
        
        // 创建默认积分任务
        $this->create_default_points_tasks();
        
        // 检查并处理过期积分
        $this->check_expired_points();
        
        // 重置每日/每周/每月任务
        $this->reset_periodic_tasks();
    }
    
    /**
     * 创建积分相关数据表
     */
    private function create_points_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // 积分任务表
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        $sql_tasks = "CREATE TABLE IF NOT EXISTS {$tasks_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text DEFAULT '',
            type varchar(20) NOT NULL,
            points int(11) NOT NULL,
            icon varchar(255) DEFAULT '',
            action varchar(100) DEFAULT '',
            params text DEFAULT '',
            is_active tinyint(1) DEFAULT 1,
            sort_order int(11) DEFAULT 0,
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            updated_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY type (type),
            KEY is_active (is_active),
            KEY sort_order (sort_order)
        ) $charset_collate;";
        
        // 用户积分任务表
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        $sql_user_tasks = "CREATE TABLE IF NOT EXISTS {$user_tasks_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            task_id bigint(20) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            progress int(11) DEFAULT 0,
            target int(11) DEFAULT 1,
            completed_at datetime DEFAULT '0000-00-00 00:00:00',
            claimed_at datetime DEFAULT '0000-00-00 00:00:00',
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            updated_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            UNIQUE KEY user_task (user_id, task_id),
            KEY user_id (user_id),
            KEY task_id (task_id),
            KEY status (status)
        ) $charset_collate;";
        
        // 积分记录表
        $records_table = $wpdb->prefix . 'sut_wechat_mini_points_records';
        $sql_records = "CREATE TABLE IF NOT EXISTS {$records_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            type varchar(20) NOT NULL,
            points int(11) NOT NULL,
            balance int(11) NOT NULL,
            source varchar(100) DEFAULT '',
            description text DEFAULT '',
            related_id bigint(20) DEFAULT 0,
            related_type varchar(50) DEFAULT '',
            expires_at datetime DEFAULT '0000-00-00 00:00:00',
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY type (type),
            KEY created_at (created_at),
            KEY expires_at (expires_at)
        ) $charset_collate;";
        
        // 积分商城表
        $shop_table = $wpdb->prefix . 'sut_wechat_mini_points_shop';
        $sql_shop = "CREATE TABLE IF NOT EXISTS {$shop_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text DEFAULT '',
            image varchar(255) DEFAULT '',
            type varchar(50) NOT NULL DEFAULT 'coupon',
            points int(11) NOT NULL,
            stock int(11) DEFAULT -1,
            sales int(11) DEFAULT 0,
            value text DEFAULT '',
            is_active tinyint(1) DEFAULT 1,
            sort_order int(11) DEFAULT 0,
            start_date datetime DEFAULT '0000-00-00 00:00:00',
            end_date datetime DEFAULT '0000-00-00 00:00:00',
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            updated_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY type (type),
            KEY is_active (is_active),
            KEY sort_order (sort_order),
            KEY start_date (start_date),
            KEY end_date (end_date)
        ) $charset_collate;";
        
        // 积分兑换记录表
        $exchange_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange';
        $sql_exchange = "CREATE TABLE IF NOT EXISTS {$exchange_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            item_id bigint(20) NOT NULL,
            points int(11) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            order_no varchar(100) DEFAULT '',
            delivery_info text DEFAULT '',
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            updated_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            UNIQUE KEY order_no (order_no),
            KEY user_id (user_id),
            KEY item_id (item_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_tasks);
        dbDelta($sql_user_tasks);
        dbDelta($sql_records);
        dbDelta($sql_shop);
        dbDelta($sql_exchange);
    }
    
    /**
     * 创建默认积分任务
     */
    private function create_default_points_tasks() {
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 检查是否已有任务
        $task_count = $wpdb->get_var("SELECT COUNT(*) FROM {$tasks_table}");
        
        if ($task_count > 0) {
            return;
        }
        
        // 默认任务
        $default_tasks = array(
            array(
                'title' => __('每日签到', 'sut-wechat-mini'),
                'description' => __('每天登录小程序即可获得积分', 'sut-wechat-mini'),
                'type' => self::TASK_TYPE_DAILY,
                'points' => 5,
                'icon' => 'calendar-check',
                'action' => 'daily_signin',
                'sort_order' => 1
            ),
            array(
                'title' => __('每日阅读', 'sut-wechat-mini'),
                'description' => __('每天阅读一篇文章', 'sut-wechat-mini'),
                'type' => self::TASK_TYPE_DAILY,
                'points' => 10,
                'icon' => 'book-open',
                'action' => 'daily_read',
                'sort_order' => 2
            ),
            array(
                'title' => __('每日分享', 'sut-wechat-mini'),
                'description' => __('每天分享一篇文章', 'sut-wechat-mini'),
                'type' => self::TASK_TYPE_DAILY,
                'points' => 15,
                'icon' => 'share',
                'action' => 'daily_share',
                'sort_order' => 3
            ),
            array(
                'title' => __('完善资料', 'sut-wechat-mini'),
                'description' => __('完善个人资料', 'sut-wechat-mini'),
                'type' => self::TASK_TYPE_ONCE,
                'points' => 50,
                'icon' => 'user-check',
                'action' => 'complete_profile',
                'sort_order' => 10
            ),
            array(
                'title' => __('首次购买', 'sut-wechat-mini'),
                'description' => __('完成首次购买', 'sut-wechat-mini'),
                'type' => self::TASK_TYPE_ONCE,
                'points' => 100,
                'icon' => 'shopping-cart',
                'action' => 'first_purchase',
                'sort_order' => 11
            ),
            array(
                'title' => __('每周评论', 'sut-wechat-mini'),
                'description' => __('每周发表3条评论', 'sut-wechat-mini'),
                'type' => self::TASK_TYPE_WEEKLY,
                'points' => 30,
                'icon' => 'message-square',
                'action' => 'weekly_comment',
                'params' => json_encode(array('target' => 3)),
                'sort_order' => 20
            )
        );
        
        foreach ($default_tasks as $task) {
            $wpdb->insert(
                $tasks_table,
                array(
                    'title' => $task['title'],
                    'description' => $task['description'],
                    'type' => $task['type'],
                    'points' => $task['points'],
                    'icon' => $task['icon'],
                    'action' => $task['action'],
                    'params' => isset($task['params']) ? $task['params'] : '',
                    'sort_order' => $task['sort_order'],
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql')
                ),
                array('%s', '%s', '%s', '%d', '%s', '%s', '%s', '%d', '%s', '%s')
            );
        }
    }
    
    /**
     * 检查并处理过期积分
     */
    private function check_expired_points() {
        global $wpdb;
        
        $records_table = $wpdb->prefix . 'sut_wechat_mini_points_records';
        $users_table = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 获取过期积分记录
        $expired_records = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$records_table} WHERE type = %s AND expires_at > '0000-00-00 00:00:00' AND expires_at < %s",
            self::RECORD_TYPE_EARN, current_time('mysql')
        ));
        
        foreach ($expired_records as $record) {
            // 扣除过期积分
            $this->deduct_user_points($record->user_id, $record->points, '积分过期');
            
            // 记录过期
            $wpdb->insert(
                $records_table,
                array(
                    'user_id' => $record->user_id,
                    'type' => self::RECORD_TYPE_EXPIRE,
                    'points' => -$record->points,
                    'balance' => $this->get_user_points_balance($record->user_id),
                    'source' => 'expire',
                    'description' => sprintf(__('积分过期：%s', 'sut-wechat-mini'), $record->description),
                    'related_id' => $record->id,
                    'related_type' => 'points_record',
                    'created_at' => current_time('mysql')
                ),
                array('%d', '%s', '%d', '%d', '%s', '%s', '%d', '%s', '%s')
            );
        }
    }
    
    /**
     * 重置周期性任务
     */
    private function reset_periodic_tasks() {
        global $wpdb;
        
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 重置每日任务
        $wpdb->query($wpdb->prepare(
            "UPDATE {$user_tasks_table} ut 
            INNER JOIN {$tasks_table} t ON ut.task_id = t.id 
            SET ut.status = %s, ut.progress = 0, ut.updated_at = %s 
            WHERE t.type = %s AND DATE(ut.updated_at) < %s",
            self::TASK_STATUS_PENDING, current_time('mysql'), self::TASK_TYPE_DAILY, date('Y-m-d')
        ));
        
        // 重置每周任务
        $this_week_start = date('Y-m-d', strtotime('monday this week'));
        $wpdb->query($wpdb->prepare(
            "UPDATE {$user_tasks_table} ut 
            INNER JOIN {$tasks_table} t ON ut.task_id = t.id 
            SET ut.status = %s, ut.progress = 0, ut.updated_at = %s 
            WHERE t.type = %s AND DATE(ut.updated_at) < %s",
            self::TASK_STATUS_PENDING, current_time('mysql'), self::TASK_TYPE_WEEKLY, $this_week_start
        ));
        
        // 重置每月任务
        $this_month_start = date('Y-m-01');
        $wpdb->query($wpdb->prepare(
            "UPDATE {$user_tasks_table} ut 
            INNER JOIN {$tasks_table} t ON ut.task_id = t.id 
            SET ut.status = %s, ut.progress = 0, ut.updated_at = %s 
            WHERE t.type = %s AND DATE(ut.updated_at) < %s",
            self::TASK_STATUS_PENDING, current_time('mysql'), self::TASK_TYPE_MONTHLY, $this_month_start
        ));
    }
    
    /**
     * 获取用户积分余额
     * 
     * @param int $user_id 用户ID
     * @return int 积分余额
     */
    public function get_user_points_balance($user_id) {
        global $wpdb;
        
        $users_table = $wpdb->prefix . 'sut_wechat_mini_users';
        
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT points FROM {$users_table} WHERE id = %d",
            $user_id
        ));
    }
    
    /**
     * 增加用户积分
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 来源
     * @param string $description 描述
     * @param int $related_id 关联ID
     * @param string $related_type 关联类型
     * @param int $expire_days 过期天数
     * @return bool 是否成功
     */
    public function add_user_points($user_id, $points, $source = '', $description = '', $related_id = 0, $related_type = '', $expire_days = 0) {
        global $wpdb;
        
        if ($points <= 0) {
            return false;
        }
        
        $users_table = $wpdb->prefix . 'sut_wechat_mini_users';
        $records_table = $wpdb->prefix . 'sut_wechat_mini_points_records';
        
        // 获取当前积分
        $current_points = $this->get_user_points_balance($user_id);
        
        // 更新用户积分
        $result = $wpdb->query($wpdb->prepare(
            "UPDATE {$users_table} SET points = points + %d WHERE id = %d",
            $points, $user_id
        ));
        
        if ($result === false) {
            return false;
        }
        
        // 计算过期时间
        $expires_at = '0000-00-00 00:00:00';
        if ($expire_days > 0) {
            $expires_at = date('Y-m-d H:i:s', strtotime("+{$expire_days} days"));
        }
        
        // 记录积分变化
        $wpdb->insert(
            $records_table,
            array(
                'user_id' => $user_id,
                'type' => self::RECORD_TYPE_EARN,
                'points' => $points,
                'balance' => $current_points + $points,
                'source' => $source,
                'description' => $description,
                'related_id' => $related_id,
                'related_type' => $related_type,
                'expires_at' => $expires_at,
                'created_at' => current_time('mysql')
            ),
            array('%d', '%s', '%d', '%d', '%s', '%s', '%d', '%s', '%s', '%s')
        );
        
        // 触发积分变化事件
        do_action('sut_wechat_mini_points_added', $user_id, $points, $source, $description);
        
        return true;
    }
    
    /**
     * 扣除用户积分
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $description 描述
     * @param int $related_id 关联ID
     * @param string $related_type 关联类型
     * @return bool 是否成功
     */
    public function deduct_user_points($user_id, $points, $description = '', $related_id = 0, $related_type = '') {
        global $wpdb;
        
        if ($points <= 0) {
            return false;
        }
        
        $users_table = $wpdb->prefix . 'sut_wechat_mini_users';
        $records_table = $wpdb->prefix . 'sut_wechat_mini_points_records';
        
        // 获取当前积分
        $current_points = $this->get_user_points_balance($user_id);
        
        // 检查积分是否足够
        if ($current_points < $points) {
            return false;
        }
        
        // 更新用户积分
        $result = $wpdb->query($wpdb->prepare(
            "UPDATE {$users_table} SET points = points - %d WHERE id = %d",
            $points, $user_id
        ));
        
        if ($result === false) {
            return false;
        }
        
        // 记录积分变化
        $wpdb->insert(
            $records_table,
            array(
                'user_id' => $user_id,
                'type' => self::RECORD_TYPE_SPEND,
                'points' => -$points,
                'balance' => $current_points - $points,
                'source' => 'deduct',
                'description' => $description,
                'related_id' => $related_id,
                'related_type' => $related_type,
                'created_at' => current_time('mysql')
            ),
            array('%d', '%s', '%d', '%d', '%s', '%s', '%d', '%s', '%s')
        );
        
        // 触发积分变化事件
        do_action('sut_wechat_mini_points_deducted', $user_id, $points, $description);
        
        return true;
    }
    
    /**
     * 获取用户积分任务列表
     * 
     * @param int $user_id 用户ID
     * @param string $type 任务类型
     * @return array 任务列表
     */
    public function get_user_points_tasks($user_id, $type = 'all') {
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        
        // 构建查询
        $where = "WHERE t.is_active = 1";
        $sql_args = array();
        
        if ($type !== 'all') {
            $where .= " AND t.type = %s";
            $sql_args[] = $type;
        }
        
        $sql = "
            SELECT t.*, 
                   ut.id as user_task_id, 
                   ut.status as user_status, 
                   ut.progress, 
                   ut.target, 
                   ut.completed_at, 
                   ut.claimed_at
            FROM {$tasks_table} t
            LEFT JOIN {$user_tasks_table} ut ON t.id = ut.task_id AND ut.user_id = %d
            {$where}
            ORDER BY t.sort_order ASC, t.id ASC
        ";
        
        array_unshift($sql_args, $user_id);
        
        $tasks = $wpdb->get_results($wpdb->prepare($sql, $sql_args));
        
        // 处理任务数据
        foreach ($tasks as &$task) {
            // 如果用户任务不存在，创建一个
            if (!$task->user_task_id) {
                $this->create_user_task($user_id, $task->id);
                $task->user_task_id = $wpdb->insert_id;
                $task->user_status = self::TASK_STATUS_PENDING;
                $task->progress = 0;
                $task->target = $this->get_task_target($task);
                $task->completed_at = '0000-00-00 00:00:00';
                $task->claimed_at = '0000-00-00 00:00:00';
            }
            
            // 解析任务参数
            $task->params = !empty($task->params) ? json_decode($task->params, true) : array();
            
            // 计算进度百分比
            $task->progress_percent = $task->target > 0 ? min(100, round(($task->progress / $task->target) * 100)) : 0;
            
            // 检查是否可以领取
            $task->can_claim = ($task->user_status === self::TASK_STATUS_COMPLETED && empty($task->claimed_at));
            
            // 格式化时间
            $task->completed_at = !empty($task->completed_at) && $task->completed_at !== '0000-00-00 00:00:00' ? $task->completed_at : '';
            $task->claimed_at = !empty($task->claimed_at) && $task->claimed_at !== '0000-00-00 00:00:00' ? $task->claimed_at : '';
        }
        
        return $tasks;
    }
    
    /**
     * 创建用户任务
     * 
     * @param int $user_id 用户ID
     * @param int $task_id 任务ID
     * @return int|false 用户任务ID或false
     */
    private function create_user_task($user_id, $task_id) {
        global $wpdb;
        
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 获取任务信息
        $task = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$tasks_table} WHERE id = %d",
            $task_id
        ));
        
        if (!$task) {
            return false;
        }
        
        // 获取任务目标
        $target = $this->get_task_target($task);
        
        // 插入用户任务
        $result = $wpdb->insert(
            $user_tasks_table,
            array(
                'user_id' => $user_id,
                'task_id' => $task_id,
                'status' => self::TASK_STATUS_PENDING,
                'progress' => 0,
                'target' => $target,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ),
            array('%d', '%d', '%s', '%d', '%d', '%s', '%s')
        );
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * 获取任务目标
     * 
     * @param object $task 任务对象
     * @return int 目标值
     */
    private function get_task_target($task) {
        $params = !empty($task->params) ? json_decode($task->params, true) : array();
        
        return isset($params['target']) ? intval($params['target']) : 1;
    }
    
    /**
     * 更新用户任务进度
     * 
     * @param int $user_id 用户ID
     * @param string $action 任务动作
     * @param int $progress 进度值
     * @param bool $increment 是否累加
     * @return bool 是否成功
     */
    public function update_user_task_progress($user_id, $action, $progress = 1, $increment = true) {
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        
        // 获取任务信息
        $task = $wpdb->get_row($wpdb->prepare(
            "SELECT t.*, ut.id as user_task_id, ut.status, ut.progress, ut.target 
             FROM {$tasks_table} t 
             INNER JOIN {$user_tasks_table} ut ON t.id = ut.task_id 
             WHERE t.action = %s AND ut.user_id = %d",
            $action, $user_id
        ));
        
        if (!$task) {
            return false;
        }
        
        // 如果任务已完成或已领取，不更新
        if ($task->status === self::TASK_STATUS_COMPLETED || $task->status === self::TASK_STATUS_CLAIMED) {
            return false;
        }
        
        // 计算新进度
        $new_progress = $increment ? $task->progress + $progress : $progress;
        $new_progress = min($new_progress, $task->target);
        
        // 更新进度
        $result = $wpdb->update(
            $user_tasks_table,
            array(
                'progress' => $new_progress,
                'status' => $new_progress >= $task->target ? self::TASK_STATUS_COMPLETED : self::TASK_STATUS_PENDING,
                'completed_at' => $new_progress >= $task->target ? current_time('mysql') : '0000-00-00 00:00:00',
                'updated_at' => current_time('mysql')
            ),
            array('id' => $task->user_task_id),
            array('%d', '%s', '%s', '%s'),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        // 如果任务完成，触发事件
        if ($new_progress >= $task->target) {
            do_action('sut_wechat_mini_points_task_completed', $user_id, $task->id, $action);
        }
        
        return true;
    }
    
    /**
     * 领取任务奖励
     * 
     * @param int $user_id 用户ID
     * @param int $user_task_id 用户任务ID
     * @return array 结果
     */
    public function claim_task_reward($user_id, $user_task_id) {
        global $wpdb;
        
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 获取用户任务信息
        $user_task = $wpdb->get_row($wpdb->prepare(
            "SELECT ut.*, t.title, t.points 
             FROM {$user_tasks_table} ut 
             INNER JOIN {$tasks_table} t ON ut.task_id = t.id 
             WHERE ut.id = %d AND ut.user_id = %d",
            $user_task_id, $user_id
        ));
        
        if (!$user_task) {
            return array(
                'success' => false,
                'message' => __('任务不存在', 'sut-wechat-mini')
            );
        }
        
        // 检查任务状态
        if ($user_task->status !== self::TASK_STATUS_COMPLETED) {
            return array(
                'success' => false,
                'message' => __('任务未完成', 'sut-wechat-mini')
            );
        }
        
        if ($user_task->status === self::TASK_STATUS_CLAIMED) {
            return array(
                'success' => false,
                'message' => __('奖励已领取', 'sut-wechat-mini')
            );
        }
        
        // 发放积分
        $result = $this->add_user_points(
            $user_id,
            $user_task->points,
            'task_reward',
            sprintf(__('完成任务：%s', 'sut-wechat-mini'), $user_task->title),
            $user_task->task_id,
            'points_task'
        );
        
        if (!$result) {
            return array(
                'success' => false,
                'message' => __('积分发放失败', 'sut-wechat-mini')
            );
        }
        
        // 更新任务状态
        $wpdb->update(
            $user_tasks_table,
            array(
                'status' => self::TASK_STATUS_CLAIMED,
                'claimed_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ),
            array('id' => $user_task_id),
            array('%s', '%s', '%s'),
            array('%d')
        );
        
        return array(
            'success' => true,
            'message' => __('奖励领取成功', 'sut-wechat-mini'),
            'points' => $user_task->points
        );
    }
    
    /**
     * 获取用户积分记录
     * 
     * @param int $user_id 用户ID
     * @param string $type 记录类型
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 积分记录
     */
    public function get_user_points_records($user_id, $type = 'all', $page = 1, $per_page = 20) {
        global $wpdb;
        
        $records_table = $wpdb->prefix . 'sut_wechat_mini_points_records';
        
        // 构建查询
        $where = "WHERE user_id = %d";
        $sql_args = array($user_id);
        
        if ($type !== 'all') {
            $where .= " AND type = %s";
            $sql_args[] = $type;
        }
        
        // 分页
        $offset = ($page - 1) * $per_page;
        
        // 查询记录
        $records = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$records_table} {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d",
            array_merge($sql_args, array($per_page, $offset))
        ));
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$records_table} {$where}",
            $sql_args
        ));
        
        return array(
            'records' => $records,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        );
    }
    
    /**
     * 获取积分商城商品列表
     * 
     * @param string $type 商品类型
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 商品列表
     */
    public function get_points_shop_items($type = 'all', $page = 1, $per_page = 20) {
        global $wpdb;
        
        $shop_table = $wpdb->prefix . 'sut_wechat_mini_points_shop';
        
        // 构建查询
        $where = "WHERE is_active = 1";
        $sql_args = array();
        
        if ($type !== 'all') {
            $where .= " AND type = %s";
            $sql_args[] = $type;
        }
        
        // 检查时间范围
        $current_time = current_time('mysql');
        $where .= " AND (start_date = '0000-00-00 00:00:00' OR start_date <= %s) AND (end_date = '0000-00-00 00:00:00' OR end_date >= %s)";
        $sql_args[] = $current_time;
        $sql_args[] = $current_time;
        
        // 分页
        $offset = ($page - 1) * $per_page;
        
        // 查询商品
        $items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$shop_table} {$where} ORDER BY sort_order ASC, id DESC LIMIT %d OFFSET %d",
            array_merge($sql_args, array($per_page, $offset))
        ));
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$shop_table} {$where}",
            $sql_args
        ));
        
        // 处理商品数据
        foreach ($items as &$item) {
            // 解析商品价值
            $item->value = !empty($item->value) ? json_decode($item->value, true) : array();
            
            // 检查库存
            $item->in_stock = ($item->stock < 0 || $item->stock > 0);
            
            // 格式化时间
            $item->start_date = !empty($item->start_date) && $item->start_date !== '0000-00-00 00:00:00' ? $item->start_date : '';
            $item->end_date = !empty($item->end_date) && $item->end_date !== '0000-00-00 00:00:00' ? $item->end_date : '';
        }
        
        return array(
            'items' => $items,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        );
    }
    
    /**
     * 兑换积分商品
     * 
     * @param int $user_id 用户ID
     * @param int $item_id 商品ID
     * @return array 结果
     */
    public function exchange_points_item($user_id, $item_id) {
        global $wpdb;
        
        $shop_table = $wpdb->prefix . 'sut_wechat_mini_points_shop';
        $exchange_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange';
        
        // 获取商品信息
        $item = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$shop_table} WHERE id = %d AND is_active = 1",
            $item_id
        ));
        
        if (!$item) {
            return array(
                'success' => false,
                'message' => __('商品不存在', 'sut-wechat-mini')
            );
        }
        
        // 检查时间范围
        $current_time = current_time('mysql');
        if (($item->start_date !== '0000-00-00 00:00:00' && $item->start_date > $current_time) ||
            ($item->end_date !== '0000-00-00 00:00:00' && $item->end_date < $current_time)) {
            return array(
                'success' => false,
                'message' => __('商品不在兑换时间范围内', 'sut-wechat-mini')
            );
        }
        
        // 检查库存
        if ($item->stock >= 0 && $item->stock <= 0) {
            return array(
                'success' => false,
                'message' => __('商品库存不足', 'sut-wechat-mini')
            );
        }
        
        // 检查用户积分
        $user_points = $this->get_user_points_balance($user_id);
        if ($user_points < $item->points) {
            return array(
                'success' => false,
                'message' => __('积分不足', 'sut-wechat-mini')
            );
        }
        
        // 检查是否已兑换过（针对一次性商品）
        if ($item->type === 'once') {
            $exchanged = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$exchange_table} WHERE user_id = %d AND item_id = %d AND status != %s",
                $user_id, $item_id, 'cancelled'
            ));
            
            if ($exchanged > 0) {
                return array(
                    'success' => false,
                    'message' => __('该商品只能兑换一次', 'sut-wechat-mini')
                );
            }
        }
        
        // 扣除积分
        $result = $this->deduct_user_points(
            $user_id,
            $item->points,
            sprintf(__('兑换商品：%s', 'sut-wechat-mini'), $item->title),
            $item_id,
            'points_shop_item'
        );
        
        if (!$result) {
            return array(
                'success' => false,
                'message' => __('积分扣除失败', 'sut-wechat-mini')
            );
        }
        
        // 更新商品库存和销量
        if ($item->stock > 0) {
            $wpdb->query($wpdb->prepare(
                "UPDATE {$shop_table} SET stock = stock - 1, sales = sales + 1 WHERE id = %d",
                $item_id
            ));
        } else {
            $wpdb->query($wpdb->prepare(
                "UPDATE {$shop_table} SET sales = sales + 1 WHERE id = %d",
                $item_id
            ));
        }
        
        // 生成订单号
        $order_no = 'PX' . date('YmdHis') . mt_rand(1000, 9999);
        
        // 创建兑换记录
        $wpdb->insert(
            $exchange_table,
            array(
                'user_id' => $user_id,
                'item_id' => $item_id,
                'points' => $item->points,
                'status' => 'pending',
                'order_no' => $order_no,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ),
            array('%d', '%d', '%d', '%s', '%s', '%s', '%s')
        );
        
        $exchange_id = $wpdb->insert_id;
        
        // 触发兑换事件
        do_action('sut_wechat_mini_points_item_exchanged', $user_id, $item_id, $exchange_id, $order_no);
        
        return array(
            'success' => true,
            'message' => __('兑换成功', 'sut-wechat-mini'),
            'order_no' => $order_no,
            'exchange_id' => $exchange_id
        );
    }
    
    /**
     * 获取用户兑换记录
     * 
     * @param int $user_id 用户ID
     * @param string $status 状态
     * @param int $page 页码
     * @param int $per_page 每页数量
     * @return array 兑换记录
     */
    public function get_user_exchange_records($user_id, $status = 'all', $page = 1, $per_page = 20) {
        global $wpdb;
        
        $exchange_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange';
        $shop_table = $wpdb->prefix . 'sut_wechat_mini_points_shop';
        
        // 构建查询
        $where = "WHERE e.user_id = %d";
        $sql_args = array($user_id);
        
        if ($status !== 'all') {
            $where .= " AND e.status = %s";
            $sql_args[] = $status;
        }
        
        // 分页
        $offset = ($page - 1) * $per_page;
        
        // 查询记录
        $records = $wpdb->get_results($wpdb->prepare(
            "SELECT e.*, s.title, s.image, s.type 
             FROM {$exchange_table} e 
             INNER JOIN {$shop_table} s ON e.item_id = s.id 
             {$where} 
             ORDER BY e.created_at DESC 
             LIMIT %d OFFSET %d",
            array_merge($sql_args, array($per_page, $offset))
        ));
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) 
             FROM {$exchange_table} e 
             INNER JOIN {$shop_table} s ON e.item_id = s.id 
             {$where}",
            $sql_args
        ));
        
        // 处理记录数据
        foreach ($records as &$record) {
            // 解析配送信息
            $record->delivery_info = !empty($record->delivery_info) ? json_decode($record->delivery_info, true) : array();
        }
        
        return array(
            'records' => $records,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        );
    }
    
    /**
     * 注册奖励积分
     * 
     * @param int $user_id 用户ID
     * @param array $user_data 用户数据
     */
    public function award_register_points($user_id, $user_data) {
        $this->update_user_task_progress($user_id, 'register', 1, false);
        $this->add_user_points(
            $user_id,
            20,
            'register',
            __('注册奖励', 'sut-wechat-mini'),
            0,
            'user_register',
            365 // 1年过期
        );
    }
    
    /**
     * 登录奖励积分
     * 
     * @param int $user_id 用户ID
     * @param array $login_data 登录数据
     */
    public function award_login_points($user_id, $login_data) {
        $this->update_user_task_progress($user_id, 'daily_signin', 1, false);
        $this->add_user_points(
            $user_id,
            5,
            'daily_signin',
            __('每日签到', 'sut-wechat-mini'),
            0,
            'daily_signin',
            30 // 30天过期
        );
    }
    
    /**
     * 订单完成奖励积分
     * 
     * @param int $user_id 用户ID
     * @param array $order_data 订单数据
     */
    public function award_order_points($user_id, $order_data) {
        $order_amount = isset($order_data['amount']) ? floatval($order_data['amount']) : 0;
        $points = intval($order_amount * 10); // 每消费1元获得10积分
        
        // 首次购买任务
        $this->update_user_task_progress($user_id, 'first_purchase', 1, false);
        
        // 奖励积分
        $this->add_user_points(
            $user_id,
            $points,
            'order',
            sprintf(__('订单奖励：订单金额￥%.2f', 'sut-wechat-mini'), $order_amount),
            isset($order_data['order_id']) ? $order_data['order_id'] : 0,
            'order',
            365 // 1年过期
        );
    }
    
    /**
     * 评论奖励积分
     * 
     * @param int $user_id 用户ID
     * @param array $comment_data 评论数据
     */
    public function award_comment_points($user_id, $comment_data) {
        // 每日阅读任务
        $this->update_user_task_progress($user_id, 'daily_read', 1, true);
        
        // 每周评论任务
        $this->update_user_task_progress($user_id, 'weekly_comment', 1, true);
        
        // 奖励积分
        $this->add_user_points(
            $user_id,
            5,
            'comment',
            __('评论奖励', 'sut-wechat-mini'),
            isset($comment_data['comment_id']) ? $comment_data['comment_id'] : 0,
            'comment',
            30 // 30天过期
        );
    }
    
    /**
     * 分享奖励积分
     * 
     * @param int $user_id 用户ID
     * @param array $share_data 分享数据
     */
    public function award_share_points($user_id, $share_data) {
        // 每日分享任务
        $this->update_user_task_progress($user_id, 'daily_share', 1, false);
        
        // 奖励积分
        $this->add_user_points(
            $user_id,
            10,
            'share',
            __('分享奖励', 'sut-wechat-mini'),
            isset($share_data['article_id']) ? $share_data['article_id'] : 0,
            'article_share',
            30 // 30天过期
        );
    }
    
    /**
     * AJAX获取积分任务列表处理
     */
    public function ajax_get_points_tasks() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_get_points_tasks_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'all';
        
        if (empty($user_id)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 获取任务列表
        $tasks = $this->get_user_points_tasks($user_id, $type);
        
        wp_send_json_success($tasks);
    }
    
    /**
     * AJAX完成积分任务处理
     */
    public function ajax_complete_points_task() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_complete_points_task_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $action = isset($_POST['action_name']) ? sanitize_text_field($_POST['action_name']) : '';
        $progress = isset($_POST['progress']) ? intval($_POST['progress']) : 1;
        
        if (empty($user_id) || empty($action)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 更新任务进度
        $result = $this->update_user_task_progress($user_id, $action, $progress, true);
        
        if ($result) {
            wp_send_json_success(array('message' => __('任务进度更新成功', 'sut-wechat-mini')));
        } else {
            wp_send_json_error(array('message' => __('任务进度更新失败', 'sut-wechat-mini')));
        }
    }
    
    /**
     * AJAX领取积分奖励处理
     */
    public function ajax_claim_points_reward() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_claim_points_reward_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $user_task_id = isset($_POST['user_task_id']) ? intval($_POST['user_task_id']) : 0;
        
        if (empty($user_id) || empty($user_task_id)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 领取奖励
        $result = $this->claim_task_reward($user_id, $user_task_id);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error(array('message' => $result['message']));
        }
    }
    
    /**
     * AJAX获取积分记录处理
     */
    public function ajax_get_points_records() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_get_points_records_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'all';
        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $per_page = isset($_POST['per_page']) ? intval($_POST['per_page']) : 20;
        
        if (empty($user_id)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 获取积分记录
        $records = $this->get_user_points_records($user_id, $type, $page, $per_page);
        
        wp_send_json_success($records);
    }
    
    /**
     * AJAX获取积分商城商品处理
     */
    public function ajax_get_points_shop_items() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_get_points_shop_items_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'all';
        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $per_page = isset($_POST['per_page']) ? intval($_POST['per_page']) : 20;
        
        // 获取商品列表
        $items = $this->get_points_shop_items($type, $page, $per_page);
        
        wp_send_json_success($items);
    }
    
    /**
     * AJAX兑换积分商品处理
     */
    public function ajax_exchange_points_item() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sut_wechat_mini_exchange_points_item_nonce')) {
            wp_die(__('安全验证失败', 'sut-wechat-mini'));
        }
        
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
        
        if (empty($user_id) || empty($item_id)) {
            wp_send_json_error(array('message' => __('参数错误', 'sut-wechat-mini')));
        }
        
        // 兑换商品
        $result = $this->exchange_points_item($user_id, $item_id);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error(array('message' => $result['message']));
        }
    }
    
    /**
     * 获取积分统计信息
     * 
     * @return array 统计信息
     */
    public function get_points_stats() {
        global $wpdb;
        
        $users_table = $wpdb->prefix . 'sut_wechat_mini_users';
        $records_table = $wpdb->prefix . 'sut_wechat_mini_points_records';
        $exchange_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange';
        
        // 总积分发放量
        $total_earned = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$records_table} WHERE type = %s",
            self::RECORD_TYPE_EARN
        ));
        
        // 总积分消费量
        $total_spent = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(ABS(points)) FROM {$records_table} WHERE type IN (%s, %s)",
            self::RECORD_TYPE_SPEND, self::RECORD_TYPE_EXPIRE
        ));
        
        // 当前总积分余额
        $total_balance = $wpdb->get_var("SELECT SUM(points) FROM {$users_table}");
        
        // 今日积分发放量
        $today_earned = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$records_table} WHERE type = %s AND DATE(created_at) = %s",
            self::RECORD_TYPE_EARN, date('Y-m-d')
        ));
        
        // 本月积分发放量
        $month_earned = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$records_table} WHERE type = %s AND YEAR(created_at) = %s AND MONTH(created_at) = %s",
            self::RECORD_TYPE_EARN, date('Y'), date('m')
        ));
        
        // 兑换商品数量
        $total_exchanges = $wpdb->get_var("SELECT COUNT(*) FROM {$exchange_table}");
        
        // 今日兑换数量
        $today_exchanges = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$exchange_table} WHERE DATE(created_at) = %s",
            date('Y-m-d')
        ));
        
        return array(
            'total_earned' => (int) $total_earned,
            'total_spent' => (int) $total_spent,
            'total_balance' => (int) $total_balance,
            'today_earned' => (int) $today_earned,
            'month_earned' => (int) $month_earned,
            'total_exchanges' => (int) $total_exchanges,
            'today_exchanges' => (int) $today_exchanges
        );
    }
}