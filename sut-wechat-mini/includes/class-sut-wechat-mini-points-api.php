<?php
/**
 * 文件名: class-sut-wechat-mini-points-api.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 积分系统API类
 * 
 * 提供微信小程序的积分管理API接口
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 积分系统API类
 */
class Sut_WeChat_Mini_Points_API {
    
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
     * @return Sut_WeChat_Mini_Points_API 积分系统API实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化积分系统API
     * 
     * @return void
     */
    public function init() {
        // 注册REST API路由
        $this->register_api_routes();
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
        
        // 积分管理路由（管理员权限）
        register_rest_route('sut-wechat-mini/v1', '/admin/points', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'admin_add_points'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/admin/points/tasks', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'admin_create_task'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'admin_update_task'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/admin/points/tasks/(?P<id>\d+)', array(
            array(
                'methods' => 'DELETE',
                'callback' => array($this, 'admin_delete_task'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/admin/points/exchange/items', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'admin_create_exchange_item'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'admin_update_exchange_item'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/admin/points/exchange/items/(?P<id>\d+)', array(
            array(
                'methods' => 'DELETE',
                'callback' => array($this, 'admin_delete_exchange_item'),
                'permission_callback' => array($this, 'check_admin_permission'),
            ),
        ));
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
     * 检查管理员权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 是否有权限
     */
    public function check_admin_permission($request) {
        // 先检查API权限
        $api_permission = $this->check_api_permission($request);
        
        if (is_wp_error($api_permission)) {
            return $api_permission;
        }
        
        // 获取用户ID
        $user_id = $request->get_param('user_id');
        
        // 检查是否为管理员
        if (!user_can($user_id, 'manage_options')) {
            return new WP_Error('forbidden', '权限不足', array('status' => 403));
        }
        
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
        
        // 获取积分系统实例
        $points_system = Sut_WeChat_Mini_Points::get_instance();
        
        // 获取用户积分
        $points = $points_system->get_user_total_points($user_id);
        
        // 获取用户等级
        $level = $points_system->get_user_level($user_id);
        
        // 获取下一等级信息
        $next_level = $points_system->get_next_level_info($level);
        
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
            
            // 获取积分系统实例
            $points_system = Sut_WeChat_Mini_Points::get_instance();
            
            // 检查任务是否可完成
            $can_complete = $points_system->can_complete_task($user_id, $task);
            
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
        
        // 获取积分系统实例
        $points_system = Sut_WeChat_Mini_Points::get_instance();
        
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
        if (!$points_system->can_complete_task($user_id, $task)) {
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
            $points_system->add_points($user_id, $task->points, 'task', $task->name, array(
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
        
        // 获取积分系统实例
        $points_system = Sut_WeChat_Mini_Points::get_instance();
        
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
        $user_points = $points_system->get_user_total_points($user_id);
        
        if ($user_points < $required_points) {
            return new WP_Error('insufficient_points', '积分不足', array('status' => 400));
        }
        
        // 开始事务
        $wpdb->query('START TRANSACTION');
        
        try {
            // 扣除积分
            $points_system->deduct_points($user_id, $required_points, 'exchange', $item->name, array(
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
     * 管理员添加积分
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_add_points($request) {
        $admin_id = $request->get_param('user_id');
        $target_user_id = $request->get_param('target_user_id');
        $points = $request->get_param('points');
        $description = $request->get_param('description');
        
        // 验证参数
        if (!$target_user_id || !$points || !$description) {
            return new WP_Error('invalid_params', '参数不完整', array('status' => 400));
        }
        
        // 获取积分系统实例
        $points_system = Sut_WeChat_Mini_Points::get_instance();
        
        // 添加积分
        $success = $points_system->add_points($target_user_id, $points, 'admin', $description, array(
            'admin_id' => $admin_id,
        ));
        
        if (!$success) {
            return new WP_Error('add_points_failed', '添加积分失败', array('status' => 500));
        }
        
        // 返回结果
        $data = array(
            'success' => true,
            'message' => '积分添加成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 管理员创建任务
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_create_task($request) {
        $name = $request->get_param('name');
        $description = $request->get_param('description');
        $type = $request->get_param('type');
        $points = $request->get_param('points');
        $max_completions = $request->get_param('max_completions');
        $icon = $request->get_param('icon');
        $order = $request->get_param('order');
        
        // 验证参数
        if (!$name || !$description || !$type || !$points) {
            return new WP_Error('invalid_params', '参数不完整', array('status' => 400));
        }
        
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 创建任务
        $result = $wpdb->insert(
            $tasks_table,
            array(
                'name' => $name,
                'description' => $description,
                'type' => $type,
                'points' => $points,
                'max_completions' => $max_completions ?: 0,
                'icon' => $icon ?: '',
                'order' => $order ?: 0,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%d', '%d', '%s', '%d', '%s', '%s')
        );
        
        if (!$result) {
            return new WP_Error('create_task_failed', '创建任务失败', array('status' => 500));
        }
        
        $task_id = $wpdb->insert_id;
        
        // 返回结果
        $data = array(
            'success' => true,
            'task_id' => $task_id,
            'message' => '任务创建成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 管理员更新任务
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_update_task($request) {
        $task_id = $request->get_param('task_id');
        $name = $request->get_param('name');
        $description = $request->get_param('description');
        $type = $request->get_param('type');
        $points = $request->get_param('points');
        $max_completions = $request->get_param('max_completions');
        $icon = $request->get_param('icon');
        $order = $request->get_param('order');
        
        // 验证参数
        if (!$task_id) {
            return new WP_Error('invalid_params', '任务ID不能为空', array('status' => 400));
        }
        
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 构建更新数据
        $update_data = array(
            'updated_at' => current_time('mysql'),
        );
        
        $update_format = array('%s');
        
        if ($name !== null) {
            $update_data['name'] = $name;
            $update_format[] = '%s';
        }
        
        if ($description !== null) {
            $update_data['description'] = $description;
            $update_format[] = '%s';
        }
        
        if ($type !== null) {
            $update_data['type'] = $type;
            $update_format[] = '%s';
        }
        
        if ($points !== null) {
            $update_data['points'] = $points;
            $update_format[] = '%d';
        }
        
        if ($max_completions !== null) {
            $update_data['max_completions'] = $max_completions;
            $update_format[] = '%d';
        }
        
        if ($icon !== null) {
            $update_data['icon'] = $icon;
            $update_format[] = '%s';
        }
        
        if ($order !== null) {
            $update_data['order'] = $order;
            $update_format[] = '%d';
        }
        
        // 更新任务
        $result = $wpdb->update(
            $tasks_table,
            $update_data,
            array('id' => $task_id),
            $update_format,
            array('%d')
        );
        
        if ($result === false) {
            return new WP_Error('update_task_failed', '更新任务失败', array('status' => 500));
        }
        
        // 返回结果
        $data = array(
            'success' => true,
            'message' => '任务更新成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 管理员删除任务
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_delete_task($request) {
        $task_id = $request->get_param('id');
        
        // 验证参数
        if (!$task_id) {
            return new WP_Error('invalid_params', '任务ID不能为空', array('status' => 400));
        }
        
        global $wpdb;
        
        $tasks_table = $wpdb->prefix . 'sut_wechat_mini_points_tasks';
        
        // 删除任务
        $result = $wpdb->delete(
            $tasks_table,
            array('id' => $task_id),
            array('%d')
        );
        
        if (!$result) {
            return new WP_Error('delete_task_failed', '删除任务失败', array('status' => 500));
        }
        
        // 返回结果
        $data = array(
            'success' => true,
            'message' => '任务删除成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 管理员创建兑换商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_create_exchange_item($request) {
        $name = $request->get_param('name');
        $description = $request->get_param('description');
        $category = $request->get_param('category');
        $points = $request->get_param('points');
        $stock = $request->get_param('stock');
        $image = $request->get_param('image');
        $order = $request->get_param('order');
        
        // 验证参数
        if (!$name || !$description || !$category || !$points || !$stock) {
            return new WP_Error('invalid_params', '参数不完整', array('status' => 400));
        }
        
        global $wpdb;
        
        $exchange_items_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange_items';
        
        // 创建兑换商品
        $result = $wpdb->insert(
            $exchange_items_table,
            array(
                'name' => $name,
                'description' => $description,
                'category' => $category,
                'points' => $points,
                'stock' => $stock,
                'image' => $image ?: '',
                'order' => $order ?: 0,
                'status' => 'active',
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%d', '%d', '%s', '%d', '%s', '%s', '%s')
        );
        
        if (!$result) {
            return new WP_Error('create_exchange_item_failed', '创建兑换商品失败', array('status' => 500));
        }
        
        $item_id = $wpdb->insert_id;
        
        // 返回结果
        $data = array(
            'success' => true,
            'item_id' => $item_id,
            'message' => '兑换商品创建成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 管理员更新兑换商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_update_exchange_item($request) {
        $item_id = $request->get_param('item_id');
        $name = $request->get_param('name');
        $description = $request->get_param('description');
        $category = $request->get_param('category');
        $points = $request->get_param('points');
        $stock = $request->get_param('stock');
        $image = $request->get_param('image');
        $order = $request->get_param('order');
        $status = $request->get_param('status');
        
        // 验证参数
        if (!$item_id) {
            return new WP_Error('invalid_params', '商品ID不能为空', array('status' => 400));
        }
        
        global $wpdb;
        
        $exchange_items_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange_items';
        
        // 构建更新数据
        $update_data = array(
            'updated_at' => current_time('mysql'),
        );
        
        $update_format = array('%s');
        
        if ($name !== null) {
            $update_data['name'] = $name;
            $update_format[] = '%s';
        }
        
        if ($description !== null) {
            $update_data['description'] = $description;
            $update_format[] = '%s';
        }
        
        if ($category !== null) {
            $update_data['category'] = $category;
            $update_format[] = '%s';
        }
        
        if ($points !== null) {
            $update_data['points'] = $points;
            $update_format[] = '%d';
        }
        
        if ($stock !== null) {
            $update_data['stock'] = $stock;
            $update_format[] = '%d';
        }
        
        if ($image !== null) {
            $update_data['image'] = $image;
            $update_format[] = '%s';
        }
        
        if ($order !== null) {
            $update_data['order'] = $order;
            $update_format[] = '%d';
        }
        
        if ($status !== null) {
            $update_data['status'] = $status;
            $update_format[] = '%s';
        }
        
        // 更新兑换商品
        $result = $wpdb->update(
            $exchange_items_table,
            $update_data,
            array('id' => $item_id),
            $update_format,
            array('%d')
        );
        
        if ($result === false) {
            return new WP_Error('update_exchange_item_failed', '更新兑换商品失败', array('status' => 500));
        }
        
        // 返回结果
        $data = array(
            'success' => true,
            'message' => '兑换商品更新成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
    
    /**
     * 管理员删除兑换商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function admin_delete_exchange_item($request) {
        $item_id = $request->get_param('id');
        
        // 验证参数
        if (!$item_id) {
            return new WP_Error('invalid_params', '商品ID不能为空', array('status' => 400));
        }
        
        global $wpdb;
        
        $exchange_items_table = $wpdb->prefix . 'sut_wechat_mini_points_exchange_items';
        
        // 删除兑换商品
        $result = $wpdb->delete(
            $exchange_items_table,
            array('id' => $item_id),
            array('%d')
        );
        
        if (!$result) {
            return new WP_Error('delete_exchange_item_failed', '删除兑换商品失败', array('status' => 500));
        }
        
        // 返回结果
        $data = array(
            'success' => true,
            'message' => '兑换商品删除成功',
        );
        
        return new WP_REST_Response($data, 200);
    }
}