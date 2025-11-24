<?php
/**
 * 文件名: class-sut-wechat-mini-points.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 积分系统类
 * 
 * 提供微信小程序的积分管理功能，包括积分获取、消费、查询等
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
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 初始化
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
     * 初始化积分系统
     * 
     * @return void
     */
    public function init() {
        // 注册REST API路由
        $this->register_api_routes();
        
        // 注册钩子
        $this->register_hooks();
    }
    
    /**
     * 注册REST API路由
     * 
     * @return void
     */
    private function register_api_routes() {
        // 积分相关路由
        register_rest_route('sut-wechat-mini/v1', '/points', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_user_points'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/history', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_points_history'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/tasks', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_points_tasks'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/tasks/(?P<id>\d+)/complete', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'complete_points_task'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/exchange', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'exchange_points'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/exchange/items', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_exchange_items'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/rankings', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_points_rankings'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
    }
    
    /**
     * 注册钩子
     * 
     * @return void
     */
    private function register_hooks() {
        // 用户注册钩子
        add_action('user_register', array($this, 'on_user_register'), 10, 1);
        
        // 用户登录钩子
        add_action('wp_login', array($this, 'on_user_login'), 10, 2);
        
        // 文章发布钩子
        add_action('publish_post', array($this, 'on_post_published'), 10, 2);
        
        // 评论发布钩子
        add_action('comment_post', array($this, 'on_comment_posted'), 10, 2);
        
        // 分享钩子
        add_action('sut_wechat_mini_share', array($this, 'on_user_share'), 10, 2);
    }
    
    /**
     * 检查API权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 是否有权限
     */
    public function check_api_permission($request) {
        // 获取JWT令牌
        $token = $request->get_header('Authorization');
        
        if (!$token) {
            return new WP_Error('unauthorized', '缺少授权令牌', array('status' => 401));
        }
        
        // 移除Bearer前缀
        $token = str_replace('Bearer ', '', $token);
        
        // 获取工具函数实例
        $utils = Sut_WeChat_Mini_Utils::get_instance();
        
        // 获取JWT密钥
        $jwt_key = get_option('sut_wechat_mini_jwt_key', '');
        
        if (empty($jwt_key)) {
            return new WP_Error('unauthorized', 'JWT密钥未设置', array('status' => 401));
        }
        
        // 验证令牌
        $payload = $utils->verify_jwt($token, $jwt_key);
        
        if (!$payload) {
            return new WP_Error('unauthorized', '无效的授权令牌', array('status' => 401));
        }
        
        // 将用户ID添加到请求中
        $request->set_param('user_id', $payload->user_id);
        
        return true;
    }
    
    /**
     * 获取用户积分
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_user_points($request) {
        $user_id = $request->get_param('user_id');
        
        // 获取用户积分
        $points = $this->get_user_total_points($user_id);
        
        // 获取用户等级
        $level = $this->get_user_level($user_id);
        
        // 获取下一等级信息
        $next_level = $this->get_next_level_info($level);
        
        $data = array(
            'points' => $points,
            'level' => $level,
            'next_level' => $next_level,
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 获取积分历史
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_points_history($request) {
        $user_id = $request->get_param('user_id');
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $type = $request->get_param('type');
        $start_date = $request->get_param('start_date');
        $end_date = $request->get_param('end_date');
        
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_history';
        
        // 构建查询
        $where = "user_id = %d";
        $params = array($user_id);
        
        if ($type) {
            $where .= " AND type = %s";
            $params[] = $type;
        }
        
        if ($start_date) {
            $where .= " AND created_at >= %s";
            $params[] = $start_date;
        }
        
        if ($end_date) {
            $where .= " AND created_at <= %s";
            $params[] = $end_date;
        }
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE $where",
            $params
        ));
        
        // 获取分页数据
        $offset = ($page - 1) * $per_page;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE $where ORDER BY created_at DESC LIMIT %d OFFSET %d",
            array_merge($params, array($per_page, $offset))
        ));
        
        $data = array();
        
        foreach ($results as $result) {
            $data[] = array(
                'id' => $result->id,
                'type' => $result->type,
                'points' => intval($result->points),
                'description' => $result->description,
                'extra_data' => maybe_unserialize($result->extra_data),
                'created_at' => $result->created_at,
            );
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total_pages = ceil($total / $per_page);
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 获取积分任务
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_points_tasks($request) {
        $user_id = $request->get_param('user_id');
        $type = $request->get_param('type') ?: 'all';
        $status = $request->get_param('status') ?: 'all';
        
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        
        // 构建查询
        $where = "1=1";
        $params = array();
        
        if ($type !== 'all') {
            $where .= " AND t.type = %s";
            $params[] = $type;
        }
        
        // 获取任务列表
        $tasks = $wpdb->get_results($wpdb->prepare(
            "SELECT t.*, ut.status, ut.completed_at, ut.completions 
            FROM $tasks_table t
            LEFT JOIN $user_tasks_table ut ON t.id = ut.task_id AND ut.user_id = %d
            WHERE $where
            ORDER BY t.type, t.order",
            array_merge(array($user_id), $params)
        ));
        
        $data = array();
        
        foreach ($tasks as $task) {
            // 检查任务状态
            $task_status = $task->status ?: 'pending';
            
            // 如果指定了状态过滤
            if ($status !== 'all' && $task_status !== $status) {
                continue;
            }
            
            // 检查任务是否可完成
            $can_complete = $this->can_complete_task($user_id, $task);
            
            $data[] = array(
                'id' => $task->id,
                'name' => $task->name,
                'description' => $task->description,
                'type' => $task->type,
                'points' => intval($task->points),
                'max_completions' => intval($task->max_completions),
                'completions' => intval($task->completions),
                'status' => $task_status,
                'completed_at' => $task->completed_at,
                'can_complete' => $can_complete,
                'icon' => $task->icon,
                'order' => intval($task->order),
            );
        }
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 完成积分任务
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function complete_points_task($request) {
        $user_id = $request->get_param('user_id');
        $task_id = $request->get_param('id');
        
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        $user_tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_user_tasks';
        
        // 获取任务信息
        $task = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $tasks_table WHERE id = %d",
            $task_id
        ));
        
        if (!$task) {
            return new WP_Error('not_found', '任务不存在', array('status' => 404));
        }
        
        // 检查任务是否可完成
        if (!$this->can_complete_task($user_id, $task)) {
            return new WP_Error('cannot_complete', '任务无法完成', array('status' => 400));
        }
        
        // 获取用户任务信息
        $user_task = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $user_tasks_table WHERE user_id = %d AND task_id = %d",
            $user_id,
            $task_id
        ));
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            if ($user_task) {
                // 更新用户任务
                $wpdb->update(
                    $user_tasks_table,
                    array(
                        'status' => 'completed',
                        'completed_at' => current_time('mysql'),
                        'completions' => $user_task->completions + 1,
                    ),
                    array(
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                    ),
                    array('%s', '%s', '%d'),
                    array('%d', '%d')
                );
            } else {
                // 创建用户任务
                $wpdb->insert(
                    $user_tasks_table,
                    array(
                        'user_id' => $user_id,
                        'task_id' => $task_id,
                        'status' => 'completed',
                        'completed_at' => current_time('mysql'),
                        'completions' => 1,
                    ),
                    array('%d', '%d', '%s', '%s', '%d')
                );
            }
            
            // 添加积分
            $this->add_points($user_id, $task->points, 'task', $task->name, array(
                'task_id' => $task_id,
                'task_name' => $task->name,
            ));
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 返回结果
            $data = array(
                'success' => true,
                'points' => intval($task->points),
                'message' => '任务完成，获得 ' . $task->points . ' 积分',
            );
            
            return new WP_REST_Response($data, 200);
            
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            
            return new WP_Error('task_complete_failed', '任务完成失败: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * 积分兑换
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function exchange_points($request) {
        $user_id = $request->get_param('user_id');
        $item_id = $request->get_param('item_id');
        $quantity = $request->get_param('quantity') ?: 1;
        
        global $wpdb;
        
        $exchange_items_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange_items';
        
        // 获取兑换商品信息
        $item = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $exchange_items_table WHERE id = %d AND status = 'active'",
            $item_id
        ));
        
        if (!$item) {
            return new WP_Error('not_found', '兑换商品不存在或已下架', array('status' => 404));
        }
        
        // 检查库存
        if ($item->stock < $quantity) {
            return new WP_Error('insufficient_stock', '库存不足', array('status' => 400));
        }
        
        // 计算所需积分
        $required_points = intval($item->points) * $quantity;
        
        // 检查用户积分
        $user_points = $this->get_user_total_points($user_id);
        
        if ($user_points < $required_points) {
            return new WP_Error('insufficient_points', '积分不足', array('status' => 400));
        }
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 扣除积分
            $this->deduct_points($user_id, $required_points, 'exchange', $item->name, array(
                'item_id' => $item_id,
                'item_name' => $item->name,
                'quantity' => $quantity,
            ));
            
            // 更新库存
            $wpdb->update(
                $exchange_items_table,
                array('stock' => $item->stock - $quantity),
                array('id' => $item_id),
                array('%d'),
                array('%d')
            );
            
            // 创建兑换记录
            $exchange_records_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange_records';
            $wpdb->insert(
                $exchange_records_table,
                array(
                    'user_id' => $user_id,
                    'item_id' => $item_id,
                    'quantity' => $quantity,
                    'points' => $required_points,
                    'status' => 'processing',
                    'created_at' => current_time('mysql'),
                ),
                array('%d', '%d', '%d', '%d', '%s', '%s')
            );
            
            $exchange_id = $wpdb->insert_id;
            
            // 提交事务
            $wpdb->query('COMMIT');
            
            // 返回结果
            $data = array(
                'success' => true,
                'exchange_id' => $exchange_id,
                'points' => $required_points,
                'message' => '兑换成功，消耗 ' . $required_points . ' 积分',
            );
            
            return new WP_REST_Response($data, 200);
            
        } catch (Exception $e) {
            // 回滚事务
            $wpdb->query('ROLLBACK');
            
            return new WP_Error('exchange_failed', '兑换失败: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * 获取兑换商品列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_exchange_items($request) {
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $category = $request->get_param('category');
        
        global $wpdb;
        
        $exchange_items_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange_items';
        
        // 构建查询
        $where = "status = 'active'";
        $params = array();
        
        if ($category) {
            $where .= " AND category = %s";
            $params[] = $category;
        }
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $exchange_items_table WHERE $where",
            $params
        ));
        
        // 获取分页数据
        $offset = ($page - 1) * $per_page;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $exchange_items_table WHERE $where ORDER BY category, order LIMIT %d OFFSET %d",
            array_merge($params, array($per_page, $offset))
        ));
        
        $data = array();
        
        foreach ($results as $result) {
            $data[] = array(
                'id' => $result->id,
                'name' => $result->name,
                'description' => $result->description,
                'category' => $result->category,
                'points' => intval($result->points),
                'stock' => intval($result->stock),
                'image' => $result->image,
                'order' => intval($result->order),
            );
        }
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total_pages = ceil($total / $per_page);
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', $total_pages);
        
        return $response;
    }
    
    /**
     * 获取积分排行榜
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_points_rankings($request) {
        $user_id = $request->get_param('user_id');
        $type = $request->get_param('type') ?: 'total';
        $period = $request->get_param('period') ?: 'all';
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        global $wpdb;
        
        $users_table = $wpdb->prefix . 'users';
        $points_table = $wpdb->prefix . 'sut_wechat_mini_points_history';
        
        // 构建查询
        $where = "1=1";
        $params = array();
        
        if ($period !== 'all') {
            switch ($period) {
                case 'daily':
                    $where .= " AND DATE(created_at) = DATE(NOW())";
                    break;
                case 'weekly':
                    $where .= " AND YEARWEEK(created_at) = YEARWEEK(NOW())";
                    break;
                case 'monthly':
                    $where .= " AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())";
                    break;
            }
        }
        
        if ($type === 'earned') {
            $where .= " AND points > 0";
        } elseif ($type === 'spent') {
            $where .= " AND points < 0";
        }
        
        // 获取排行榜数据
        $offset = ($page - 1) * $per_page;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT u.ID, u.display_name, u.user_email, SUM(h.points) as total_points
            FROM $users_table u
            INNER JOIN $points_table h ON u.ID = h.user_id
            WHERE $where
            GROUP BY u.ID, u.display_name, u.user_email
            ORDER BY total_points DESC
            LIMIT %d OFFSET %d",
            array_merge($params, array($per_page, $offset))
        ));
        
        $data = array();
        $rank = $offset + 1;
        
        foreach ($results as $result) {
            $is_current_user = $result->ID == $user_id;
            
            $data[] = array(
                'rank' => $rank++,
                'user_id' => $result->ID,
                'display_name' => $result->display_name,
                'avatar' => get_avatar_url($result->ID),
                'total_points' => intval($result->total_points),
                'is_current_user' => $is_current_user,
            );
        }
        
        // 如果当前用户不在当前页，获取其排名
        $current_user_rank = null;
        $current_user_points = 0;
        $found = false;
        
        foreach ($data as $item) {
            if ($item['is_current_user']) {
                $current_user_rank = $item['rank'];
                $current_user_points = $item['total_points'];
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $current_user_data = $wpdb->get_row($wpdb->prepare(
                "SELECT u.ID, u.display_name, SUM(h.points) as total_points
                FROM $users_table u
                INNER JOIN $points_table h ON u.ID = h.user_id
                WHERE u.ID = %d AND $where
                GROUP BY u.ID, u.display_name",
                array_merge(array($user_id), $params)
            ));
            
            if ($current_user_data) {
                $current_user_rank = $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) + 1
                    FROM (
                        SELECT u.ID, SUM(h.points) as total_points
                        FROM $users_table u
                        INNER JOIN $points_table h ON u.ID = h.user_id
                        WHERE $where
                        GROUP BY u.ID
                        HAVING total_points > %d
                    ) as subquery",
                    array_merge($params, array($current_user_data->total_points))
                ));
                
                $current_user_points = intval($current_user_data->total_points);
            }
        }
        
        // 获取总数
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT u.ID)
            FROM $users_table u
            INNER JOIN $points_table h ON u.ID = h.user_id
            WHERE $where",
            $params
        ));
        
        $response = new WP_REST_Response($data, 200);
        
        // 添加分页信息
        $total_pages = ceil($total / $per_page);
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', $total_pages);
        
        // 添加当前用户信息
        $response->header('X-Current-User-Rank', $current_user_rank ?: 0);
        $response->header('X-Current-User-Points', $current_user_points);
        
        return $response;
    }
    
    /**
     * 获取用户总积分
     * 
     * @param int $user_id 用户ID
     * @return int 总积分
     */
    public function get_user_total_points($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_history';
        
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM $table_name WHERE user_id = %d",
            $user_id
        ));
        
        return intval($total) ?: 0;
    }
    
    /**
     * 获取用户等级
     * 
     * @param int $user_id 用户ID
     * @return int 用户等级
     */
    public function get_user_level($user_id) {
        $points = $this->get_user_total_points($user_id);
        
        // 等级计算规则
        if ($points >= 10000) {
            return 5; // 钻石会员
        } elseif ($points >= 5000) {
            return 4; // 白金会员
        } elseif ($points >= 2000) {
            return 3; // 黄金会员
        } elseif ($points >= 500) {
            return 2; // 白银会员
        } else {
            return 1; // 青铜会员
        }
    }
    
    /**
     * 获取下一等级信息
     * 
     * @param int $current_level 当前等级
     * @return array 下一等级信息
     */
    public function get_next_level_info($current_level) {
        $levels = array(
            1 => array('name' => '青铜会员', 'min_points' => 0, 'max_points' => 499),
            2 => array('name' => '白银会员', 'min_points' => 500, 'max_points' => 1999),
            3 => array('name' => '黄金会员', 'min_points' => 2000, 'max_points' => 4999),
            4 => array('name' => '白金会员', 'min_points' => 5000, 'max_points' => 9999),
            5 => array('name' => '钻石会员', 'min_points' => 10000, 'max_points' => PHP_INT_MAX),
        );
        
        if ($current_level >= 5) {
            return null; // 已经是最高等级
        }
        
        $next_level = $current_level + 1;
        
        return array(
            'level' => $next_level,
            'name' => $levels[$next_level]['name'],
            'min_points' => $levels[$next_level]['min_points'],
        );
    }
    
    /**
     * 检查任务是否可完成
     * 
     * @param int $user_id 用户ID
     * @param object $task 任务对象
     * @return bool 是否可完成
     */
    private function can_complete_task($user_id, $task) {
        // 检查是否已完成
        if ($task->status === 'completed') {
            // 检查是否可以重复完成
            if ($task->max_completions > 0 && $task->completions >= $task->max_completions) {
                return false;
            }
            
            // 检查是否是每日任务
            if ($task->type === 'daily') {
                // 检查今天是否已完成
                $today = date('Y-m-d');
                $completed_at = date('Y-m-d', strtotime($task->completed_at));
                
                if ($completed_at === $today) {
                    return false;
                }
            }
        }
        
        // 根据任务类型进行特定检查
        switch ($task->type) {
            case 'daily':
                // 每日任务检查
                return $this->check_daily_task($user_id, $task);
                
            case 'weekly':
                // 每周任务检查
                return $this->check_weekly_task($user_id, $task);
                
            case 'monthly':
                // 每月任务检查
                return $this->check_monthly_task($user_id, $task);
                
            case 'once':
                // 一次性任务检查
                return $this->check_once_task($user_id, $task);
                
            default:
                return true;
        }
    }
    
    /**
     * 检查每日任务
     * 
     * @param int $user_id 用户ID
     * @param object $task 任务对象
     * @return bool 是否可完成
     */
    private function check_daily_task($user_id, $task) {
        // 根据任务ID进行特定检查
        switch ($task->id) {
            case 1: // 每日登录
                // 检查今天是否已登录
                $last_login = get_user_meta($user_id, 'sut_wechat_mini_last_login', true);
                $today = date('Y-m-d');
                
                return $last_login !== $today;
                
            case 2: // 每日分享
                // 检查今天是否已分享
                $last_share = get_user_meta($user_id, 'sut_wechat_mini_last_share', true);
                $today = date('Y-m-d');
                
                return $last_share !== $today;
                
            default:
                return true;
        }
    }
    
    /**
     * 检查每周任务
     * 
     * @param int $user_id 用户ID
     * @param object $task 任务对象
     * @return bool 是否可完成
     */
    private function check_weekly_task($user_id, $task) {
        // 根据任务ID进行特定检查
        switch ($task->id) {
            case 101: // 每周发布文章
                // 检查本周是否已发布文章
                global $wpdb;
                
                $week_start = date('Y-m-d', strtotime('monday this week'));
                $week_end = date('Y-m-d', strtotime('sunday this week'));
                
                $count = $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->posts} 
                    WHERE post_author = %d AND post_type = 'post' AND post_status = 'publish'
                    AND DATE(post_date) BETWEEN %s AND %s",
                    $user_id, $week_start, $week_end
                ));
                
                return intval($count) >= 1;
                
            default:
                return true;
        }
    }
    
    /**
     * 检查每月任务
     * 
     * @param int $user_id 用户ID
     * @param object $task 任务对象
     * @return bool 是否可完成
     */
    private function check_monthly_task($user_id, $task) {
        // 根据任务ID进行特定检查
        switch ($task->id) {
            case 201: // 每月消费
                // 检查本月是否有消费记录
                global $wpdb;
                
                $month_start = date('Y-m-01');
                $month_end = date('Y-m-t');
                
                if (class_exists('WC_Order')) {
                    $count = $wpdb->get_var($wpdb->prepare(
                        "SELECT COUNT(*) FROM {$wpdb->posts} p
                        INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                        WHERE p.post_type = 'shop_order' AND p.post_status = 'wc-completed'
                        AND pm.meta_key = '_customer_user' AND pm.meta_value = %d
                        AND DATE(p.post_date) BETWEEN %s AND %s",
                        $user_id, $month_start, $month_end
                    ));
                    
                    return intval($count) >= 1;
                }
                
                return false;
                
            default:
                return true;
        }
    }
    
    /**
     * 检查一次性任务
     * 
     * @param int $user_id 用户ID
     * @param object $task 任务对象
     * @return bool 是否可完成
     */
    private function check_once_task($user_id, $task) {
        // 根据任务ID进行特定检查
        switch ($task->id) {
            case 301: // 完善个人资料
                // 检查是否已完善个人资料
                $user_info = get_userdata($user_id);
                
                return !empty($user_info->display_name) && !empty($user_info->user_email);
                
            case 302: // 绑定手机号
                // 检查是否已绑定手机号
                $phone = get_user_meta($user_id, 'phone', true);
                
                return !empty($phone);
                
            default:
                return true;
        }
    }
    
    /**
     * 添加积分
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $type 类型
     * @param string $description 描述
     * @param array $extra_data 额外数据
     * @return bool 是否成功
     */
    public function add_points($user_id, $points, $type, $description, $extra_data = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_points_history';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'type' => $type,
                'points' => $points,
                'description' => $description,
                'extra_data' => maybe_serialize($extra_data),
                'created_at' => current_time('mysql'),
            ),
            array('%d', '%s', '%d', '%s', '%s', '%s')
        );
        
        return $result !== false;
    }
    
    /**
     * 扣除积分
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $type 类型
     * @param string $description 描述
     * @param array $extra_data 额外数据
     * @return bool 是否成功
     */
    public function deduct_points($user_id, $points, $type, $description, $extra_data = array()) {
        return $this->add_points($user_id, -$points, $type, $description, $extra_data);
    }
    
    /**
     * 用户注册处理
     * 
     * @param int $user_id 用户ID
     * @return void
     */
    public function on_user_register($user_id) {
        // 添加注册奖励积分
        $this->add_points($user_id, 100, 'register', '注册奖励');
    }
    
    /**
     * 用户登录处理
     * 
     * @param string $user_login 用户名
     * @param WP_User $user 用户对象
     * @return void
     */
    public function on_user_login($user_login, $user) {
        $user_id = $user->ID;
        
        // 更新最后登录时间
        update_user_meta($user_id, 'sut_wechat_mini_last_login', date('Y-m-d'));
        
        // 检查是否是今日首次登录
        $last_login = get_user_meta($user_id, 'sut_wechat_mini_last_login', true);
        $today = date('Y-m-d');
        
        if ($last_login !== $today) {
            // 添加登录奖励积分
            $this->add_points($user_id, 5, 'login', '每日登录奖励');
        }
    }
    
    /**
     * 文章发布处理
     * 
     * @param int $post_id 文章ID
     * @param WP_Post $post 文章对象
     * @return void
     */
    public function on_post_published($post_id, $post) {
        if ($post->post_type !== 'post') {
            return;
        }
        
        $user_id = $post->post_author;
        
        // 添加发布文章奖励积分
        $this->add_points($user_id, 20, 'post', '发布文章奖励', array(
            'post_id' => $post_id,
            'post_title' => $post->post_title,
        ));
    }
    
    /**
     * 评论发布处理
     * 
     * @param int $comment_id 评论ID
     * @param WP_Comment $comment 评论对象
     * @return void
     */
    public function on_comment_posted($comment_id, $comment) {
        if ($comment->comment_type !== '') {
            return;
        }
        
        $user_id = $comment->user_id;
        
        if (!$user_id) {
            return;
        }
        
        // 添加评论奖励积分
        $this->add_points($user_id, 10, 'comment', '发表评论奖励', array(
            'comment_id' => $comment_id,
            'post_id' => $comment->comment_post_ID,
        ));
    }
    
    /**
     * 用户分享处理
     * 
     * @param int $user_id 用户ID
     * @param string $type 分享类型
     * @return void
     */
    public function on_user_share($user_id, $type) {
        // 更新最后分享时间
        update_user_meta($user_id, 'sut_wechat_mini_last_share', date('Y-m-d'));
        
        // 检查是否是今日首次分享
        $last_share = get_user_meta($user_id, 'sut_wechat_mini_last_share', true);
        $today = date('Y-m-d');
        
        if ($last_share !== $today) {
            // 添加分享奖励积分
            $this->add_points($user_id, 5, 'share', '每日分享奖励', array(
                'share_type' => $type,
            ));
        }
    }
}