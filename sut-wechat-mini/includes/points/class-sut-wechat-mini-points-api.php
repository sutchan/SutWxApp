<?php
/**
 * 文件名: class-sut-wechat-mini-points-api.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 积分系统API类
 * 
 * 提供微信小程序积分系统API接口，包括积分任务、积分记录、积分商城等
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
     * 积分系统实例
     */
    private $points_system = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        $this->points_system = Sut_WeChat_Mini_Points::get_instance();
        
        // 注册API路由
        add_action('rest_api_init', array($this, 'register_api_routes'));
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
     * 注册API路由
     */
    public function register_api_routes() {
        // 积分任务相关路由
        register_rest_route('sut-wechat-mini/v1', '/points/tasks', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_points_tasks'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'type' => array(
                        'type' => 'string',
                        'enum' => array('all', 'daily', 'weekly', 'monthly', 'once'),
                        'default' => 'all',
                        'description' => __('任务类型', 'sut-wechat-mini'),
                    ),
                ),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/tasks/complete', array(
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'complete_points_task'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'action_name' => array(
                        'type' => 'string',
                        'required' => true,
                        'description' => __('任务动作名称', 'sut-wechat-mini'),
                    ),
                    'progress' => array(
                        'type' => 'integer',
                        'default' => 1,
                        'minimum' => 1,
                        'description' => __('进度值', 'sut-wechat-mini'),
                    ),
                ),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/tasks/(?P<user_task_id>\d+)/claim', array(
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'claim_points_reward'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
        ));
        
        // 积分记录相关路由
        register_rest_route('sut-wechat-mini/v1', '/points/records', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_points_records'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'type' => array(
                        'type' => 'string',
                        'enum' => array('all', 'earn', 'spend', 'expire', 'refund'),
                        'default' => 'all',
                        'description' => __('记录类型', 'sut-wechat-mini'),
                    ),
                    'page' => array(
                        'type' => 'integer',
                        'default' => 1,
                        'minimum' => 1,
                        'description' => __('页码', 'sut-wechat-mini'),
                    ),
                    'per_page' => array(
                        'type' => 'integer',
                        'default' => 20,
                        'minimum' => 1,
                        'maximum' => 100,
                        'description' => __('每页数量', 'sut-wechat-mini'),
                    ),
                ),
            ),
        ));
        
        // 积分商城相关路由
        register_rest_route('sut-wechat-mini/v1', '/points/shop', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_points_shop_items'),
                'permission_callback' => array($this, 'check_api_permission'),
                'args' => array(
                    'type' => array(
                        'type' => 'string',
                        'default' => 'all',
                        'description' => __('商品类型', 'sut-wechat-mini'),
                    ),
                    'page' => array(
                        'type' => 'integer',
                        'default' => 1,
                        'minimum' => 1,
                        'description' => __('页码', 'sut-wechat-mini'),
                    ),
                    'per_page' => array(
                        'type' => 'integer',
                        'default' => 20,
                        'minimum' => 1,
                        'maximum' => 100,
                        'description' => __('每页数量', 'sut-wechat-mini'),
                    ),
                ),
            ),
        ));
        
        register_rest_route('sut-wechat-mini/v1', '/points/shop/exchange', array(
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'exchange_points_item'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'item_id' => array(
                        'type' => 'integer',
                        'required' => true,
                        'minimum' => 1,
                        'description' => __('商品ID', 'sut-wechat-mini'),
                    ),
                ),
            ),
        ));
        
        // 兑换记录相关路由
        register_rest_route('sut-wechat-mini/v1', '/points/exchanges', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_user_exchange_records'),
                'permission_callback' => array($this, 'check_user_permission'),
                'args' => array(
                    'status' => array(
                        'type' => 'string',
                        'enum' => array('all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'),
                        'default' => 'all',
                        'description' => __('状态', 'sut-wechat-mini'),
                    ),
                    'page' => array(
                        'type' => 'integer',
                        'default' => 1,
                        'minimum' => 1,
                        'description' => __('页码', 'sut-wechat-mini'),
                    ),
                    'per_page' => array(
                        'type' => 'integer',
                        'default' => 20,
                        'minimum' => 1,
                        'maximum' => 100,
                        'description' => __('每页数量', 'sut-wechat-mini'),
                    ),
                ),
            ),
        ));
        
        // 积分统计相关路由
        register_rest_route('sut-wechat-mini/v1', '/points/stats', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_points_stats'),
                'permission_callback' => array($this, 'check_api_permission'),
            ),
        ));
        
        // 用户积分信息路由
        register_rest_route('sut-wechat-mini/v1', '/points/balance', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_user_points_balance'),
                'permission_callback' => array($this, 'check_user_permission'),
            ),
        ));
    }
    
    /**
     * 检查用户权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 权限检查结果
     */
    public function check_user_permission($request) {
        // 获取用户ID
        $user_id = $this->get_user_id_from_request($request);
        
        if (!$user_id) {
            return new WP_Error(
                'rest_forbidden',
                __('请先登录', 'sut-wechat-mini'),
                array('status' => 401)
            );
        }
        
        return true;
    }
    
    /**
     * 检查API权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 权限检查结果
     */
    public function check_api_permission($request) {
        // 这里可以添加API密钥验证等
        // 目前简单返回true，允许公开访问
        return true;
    }
    
    /**
     * 从请求中获取用户ID
     * 
     * @param WP_REST_Request $request 请求对象
     * @return int 用户ID
     */
    private function get_user_id_from_request($request) {
        // 优先从请求参数中获取
        $user_id = $request->get_param('user_id');
        
        if ($user_id) {
            return intval($user_id);
        }
        
        // 从JWT令牌中获取
        $token = $request->get_header('Authorization');
        if ($token && strpos($token, 'Bearer ') === 0) {
            $jwt = substr($token, 7);
            $payload = Sut_WeChat_Mini_JWT::get_instance()->validate($jwt);
            
            if ($payload && isset($payload->user_id)) {
                return intval($payload->user_id);
            }
        }
        
        return 0;
    }
    
    /**
     * 获取积分任务列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function get_points_tasks($request) {
        $user_id = $this->get_user_id_from_request($request);
        $type = $request->get_param('type');
        
        // 获取任务列表
        $tasks = $this->points_system->get_user_points_tasks($user_id, $type);
        
        return new WP_REST_Response($tasks, 200);
    }
    
    /**
     * 完成积分任务
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function complete_points_task($request) {
        $user_id = $this->get_user_id_from_request($request);
        $action_name = $request->get_param('action_name');
        $progress = $request->get_param('progress');
        
        // 更新任务进度
        $result = $this->points_system->update_user_task_progress($user_id, $action_name, $progress, true);
        
        if ($result) {
            return new WP_REST_Response(
                array(
                    'success' => true,
                    'message' => __('任务进度更新成功', 'sut-wechat-mini')
                ),
                200
            );
        } else {
            return new WP_Error(
                'task_update_failed',
                __('任务进度更新失败', 'sut-wechat-mini'),
                array('status' => 400)
            );
        }
    }
    
    /**
     * 领取积分奖励
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function claim_points_reward($request) {
        $user_id = $this->get_user_id_from_request($request);
        $user_task_id = $request->get_param('user_task_id');
        
        // 领取奖励
        $result = $this->points_system->claim_task_reward($user_id, $user_task_id);
        
        if ($result['success']) {
            return new WP_REST_Response($result, 200);
        } else {
            return new WP_Error(
                'claim_failed',
                $result['message'],
                array('status' => 400)
            );
        }
    }
    
    /**
     * 获取积分记录
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function get_points_records($request) {
        $user_id = $this->get_user_id_from_request($request);
        $type = $request->get_param('type');
        $page = $request->get_param('page');
        $per_page = $request->get_param('per_page');
        
        // 获取积分记录
        $records = $this->points_system->get_user_points_records($user_id, $type, $page, $per_page);
        
        return new WP_REST_Response($records, 200);
    }
    
    /**
     * 获取积分商城商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function get_points_shop_items($request) {
        $type = $request->get_param('type');
        $page = $request->get_param('page');
        $per_page = $request->get_param('per_page');
        
        // 获取商品列表
        $items = $this->points_system->get_points_shop_items($type, $page, $per_page);
        
        return new WP_REST_Response($items, 200);
    }
    
    /**
     * 兑换积分商品
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function exchange_points_item($request) {
        $user_id = $this->get_user_id_from_request($request);
        $item_id = $request->get_param('item_id');
        
        // 兑换商品
        $result = $this->points_system->exchange_points_item($user_id, $item_id);
        
        if ($result['success']) {
            return new WP_REST_Response($result, 200);
        } else {
            return new WP_Error(
                'exchange_failed',
                $result['message'],
                array('status' => 400)
            );
        }
    }
    
    /**
     * 获取用户兑换记录
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function get_user_exchange_records($request) {
        $user_id = $this->get_user_id_from_request($request);
        $status = $request->get_param('status');
        $page = $request->get_param('page');
        $per_page = $request->get_param('per_page');
        
        // 获取兑换记录
        $records = $this->points_system->get_user_exchange_records($user_id, $status, $page, $per_page);
        
        return new WP_REST_Response($records, 200);
    }
    
    /**
     * 获取积分统计信息
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function get_points_stats($request) {
        // 获取统计信息
        $stats = $this->points_system->get_points_stats();
        
        return new WP_REST_Response($stats, 200);
    }
    
    /**
     * 获取用户积分余额
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response 响应对象
     */
    public function get_user_points_balance($request) {
        $user_id = $this->get_user_id_from_request($request);
        
        // 获取积分余额
        $balance = $this->points_system->get_user_points_balance($user_id);
        
        return new WP_REST_Response(
            array(
                'user_id' => $user_id,
                'points_balance' => $balance
            ),
            200
        );
    }
}