<?php
/**
 * 文件名: class-sut-wechat-mini-messages.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 消息管理类
 * 
 * 提供插件消息管理功能，包括系统消息、用户消息、模板消息等
 * 支持消息发送、接收、查询、删除等功能
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 消息管理类
 */
class Sut_WeChat_Mini_Messages {
    
    /**
     * 消息类型常量
     */
    const MESSAGE_TYPE_SYSTEM = 'system';
    const MESSAGE_TYPE_USER = 'user';
    const MESSAGE_TYPE_ORDER = 'order';
    const MESSAGE_TYPE_PAYMENT = 'payment';
    const MESSAGE_TYPE_SHIPPING = 'shipping';
    const MESSAGE_TYPE_POINTS = 'points';
    const MESSAGE_TYPE_PROMOTION = 'promotion';
    const MESSAGE_TYPE_TEMPLATE = 'template';
    
    /**
     * 消息状态常量
     */
    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';
    const STATUS_DELETED = 'deleted';
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 缓存实例
     */
    private $cache = null;
    
    /**
     * 微信小程序API实例
     */
    private $wechat_api = null;
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Messages 消息管理实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 初始化缓存
        $this->cache = Sut_WeChat_Mini_Cache::get_instance();
        
        // 初始化微信小程序API
        $this->wechat_api = Sut_WeChat_Mini_API::get_instance();
        
        // 注册消息相关钩子
        $this->register_hooks();
    }
    
    /**
     * 注册钩子
     */
    private function register_hooks() {
        // 注册REST API端点
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // 订单状态变更时发送消息
        add_action('woocommerce_order_status_changed', array($this, 'send_order_status_message'), 10, 4);
        
        // 支付完成时发送消息
        add_action('woocommerce_payment_complete', array($this, 'send_payment_complete_message'), 10, 1);
        
        // 积分变动时发送消息
        add_action('sut_wechat_mini_points_updated', array($this, 'send_points_update_message'), 10, 3);
    }
    
    /**
     * 注册REST API路由
     */
    public function register_rest_routes() {
        // 注册消息列表路由
        register_rest_route('sut-wechat-mini/v1', '/messages', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_messages'),
                'permission_callback' => array($this, 'check_message_permission'),
                'args' => array(
                    'type' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::MESSAGE_TYPE_SYSTEM,
                                self::MESSAGE_TYPE_USER,
                                self::MESSAGE_TYPE_ORDER,
                                self::MESSAGE_TYPE_PAYMENT,
                                self::MESSAGE_TYPE_SHIPPING,
                                self::MESSAGE_TYPE_POINTS,
                                self::MESSAGE_TYPE_PROMOTION,
                                self::MESSAGE_TYPE_TEMPLATE
                            ));
                        }
                    ),
                    'status' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::STATUS_UNREAD,
                                self::STATUS_READ
                            ));
                        }
                    ),
                    'page' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    ),
                    'per_page' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0 && $param <= 100;
                        },
                        'sanitize_callback' => 'absint'
                    )
                )
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_message'),
                'permission_callback' => array($this, 'check_message_permission'),
                'args' => array(
                    'receiver_id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    ),
                    'type' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::MESSAGE_TYPE_SYSTEM,
                                self::MESSAGE_TYPE_USER,
                                self::MESSAGE_TYPE_ORDER,
                                self::MESSAGE_TYPE_PAYMENT,
                                self::MESSAGE_TYPE_SHIPPING,
                                self::MESSAGE_TYPE_POINTS,
                                self::MESSAGE_TYPE_PROMOTION
                            ));
                        }
                    ),
                    'title' => array(
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field'
                    ),
                    'content' => array(
                        'required' => true,
                        'sanitize_callback' => 'sanitize_textarea_field'
                    ),
                    'data' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_array($param);
                        }
                    )
                )
            )
        ));
        
        // 注册消息详情路由
        register_rest_route('sut-wechat-mini/v1', '/messages/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_message_detail'),
                'permission_callback' => array($this, 'check_message_permission'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    )
                )
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_message'),
                'permission_callback' => array($this, 'check_message_permission'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    ),
                    'status' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::STATUS_READ,
                                self::STATUS_DELETED
                            ));
                        }
                    )
                )
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_message'),
                'permission_callback' => array($this, 'check_message_permission'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    )
                )
            )
        ));
        
        // 注册批量操作路由
        register_rest_route('sut-wechat-mini/v1', '/messages/batch', array(
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'batch_update_messages'),
                'permission_callback' => array($this, 'check_message_permission'),
                'args' => array(
                    'ids' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_array($param) && !empty($param);
                        }
                    ),
                    'action' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return in_array($param, array('mark_read', 'mark_unread', 'delete'));
                        }
                    )
                )
            )
        ));
        
        // 注册未读消息数量路由
        register_rest_route('sut-wechat-mini/v1', '/messages/unread-count', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_unread_count'),
                'permission_callback' => array($this, 'check_message_permission')
            )
        ));
    }
    
    /**
     * 检查消息权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 是否有权限
     */
    public function check_message_permission($request) {
        // 检查用户是否已认证
        if (!is_user_logged_in()) {
            return new WP_Error(
                'rest_forbidden',
                __('您需要登录才能访问此功能', 'sut-wechat-mini'),
                array('status' => 401)
            );
        }
        
        // 检查用户是否有查看消息的权限
        if (!current_user_can('read')) {
            return new WP_Error(
                'rest_forbidden',
                __('您没有权限查看消息', 'sut-wechat-mini'),
                array('status' => 403)
            );
        }
        
        return true;
    }
    
    /**
     * 获取消息列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_messages($request) {
        // 获取当前用户ID
        $user_id = get_current_user_id();
        
        // 获取请求参数
        $type = $request->get_param('type');
        $status = $request->get_param('status') ?: self::STATUS_UNREAD;
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        // 构建缓存键
        $cache_key = 'messages_' . $user_id . '_' . md5(serialize(array(
            'type' => $type,
            'status' => $status,
            'page' => $page,
            'per_page' => $per_page
        )));
        
        // 尝试从缓存获取
        $cached_data = $this->cache->get($cache_key, 'messages');
        if ($cached_data) {
            return rest_ensure_response($cached_data);
        }
        
        global $wpdb;
        
        // 构建查询
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        $where_conditions = array('receiver_id = %d');
        $where_values = array($user_id);
        
        // 添加类型过滤
        if ($type) {
            $where_conditions[] = 'type = %s';
            $where_values[] = $type;
        }
        
        // 添加状态过滤
        if ($status) {
            $where_conditions[] = 'status = %s';
            $where_values[] = $status;
        }
        
        $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        
        // 获取总数
        $total_query = "SELECT COUNT(*) FROM {$table_name} {$where_clause}";
        $total = (int) $wpdb->get_var($wpdb->prepare($total_query, $where_values));
        
        // 计算分页
        $offset = ($page - 1) * $per_page;
        $total_pages = ceil($total / $per_page);
        
        // 获取消息列表
        $query = "SELECT * FROM {$table_name} {$where_clause} ORDER BY created_at DESC LIMIT %d OFFSET %d";
        $where_values[] = $per_page;
        $where_values[] = $offset;
        
        $messages = $wpdb->get_results($wpdb->prepare($query, $where_values));
        
        // 格式化数据
        $formatted_messages = array();
        foreach ($messages as $message) {
            $formatted_messages[] = $this->format_message_data($message);
        }
        
        // 构建响应数据
        $response_data = array(
            'messages' => $formatted_messages,
            'pagination' => array(
                'page' => $page,
                'per_page' => $per_page,
                'total' => $total,
                'total_pages' => $total_pages
            )
        );
        
        // 缓存数据
        $this->cache->set($cache_key, $response_data, 300, 'messages');
        
        return rest_ensure_response($response_data);
    }
    
    /**
     * 获取消息详情
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_message_detail($request) {
        // 获取当前用户ID
        $user_id = get_current_user_id();
        
        // 获取消息ID
        $message_id = $request->get_param('id');
        
        // 构建缓存键
        $cache_key = 'message_detail_' . $message_id;
        
        // 尝试从缓存获取
        $cached_data = $this->cache->get($cache_key, 'messages');
        if ($cached_data) {
            return rest_ensure_response($cached_data);
        }
        
        global $wpdb;
        
        // 获取消息
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        $message = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d AND receiver_id = %d",
            $message_id, $user_id
        ));
        
        // 检查消息是否存在
        if (!$message) {
            return new WP_Error(
                'message_not_found',
                __('消息不存在', 'sut-wechat-mini'),
                array('status' => 404)
            );
        }
        
        // 格式化数据
        $formatted_message = $this->format_message_data($message);
        
        // 如果消息是未读状态，更新为已读
        if ($message->status === self::STATUS_UNREAD) {
            $this->mark_message_as_read($message_id);
            $formatted_message['status'] = self::STATUS_READ;
            
            // 清除未读数量缓存
            $this->cache->delete('unread_count_' . $user_id, 'messages');
        }
        
        // 缓存数据
        $this->cache->set($cache_key, $formatted_message, 3600, 'messages');
        
        return rest_ensure_response($formatted_message);
    }
    
    /**
     * 创建消息
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function create_message($request) {
        // 获取请求参数
        $receiver_id = $request->get_param('receiver_id');
        $type = $request->get_param('type');
        $title = $request->get_param('title');
        $content = $request->get_param('content');
        $data = $request->get_param('data') ?: array();
        
        // 获取发送者ID
        $sender_id = get_current_user_id();
        
        // 创建消息
        $message_id = $this->create_new_message(
            $sender_id,
            $receiver_id,
            $type,
            $title,
            $content,
            $data
        );
        
        if (is_wp_error($message_id)) {
            return $message_id;
        }
        
        // 获取创建的消息
        global $wpdb;
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        $message = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d",
            $message_id
        ));
        
        // 清除相关缓存
        $this->clear_user_messages_cache($receiver_id);
        
        // 发送微信模板消息
        $this->send_wechat_template_message($message);
        
        return rest_ensure_response($this->format_message_data($message));
    }
    
    /**
     * 更新消息
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function update_message($request) {
        // 获取当前用户ID
        $user_id = get_current_user_id();
        
        // 获取请求参数
        $message_id = $request->get_param('id');
        $status = $request->get_param('status');
        
        // 更新消息状态
        $result = $this->update_message_status($message_id, $user_id, $status);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // 清除相关缓存
        $this->clear_user_messages_cache($user_id);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => __('消息状态已更新', 'sut-wechat-mini')
        ));
    }
    
    /**
     * 删除消息
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function delete_message($request) {
        // 获取当前用户ID
        $user_id = get_current_user_id();
        
        // 获取消息ID
        $message_id = $request->get_param('id');
        
        // 删除消息
        $result = $this->delete_message_by_id($message_id, $user_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // 清除相关缓存
        $this->clear_user_messages_cache($user_id);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => __('消息已删除', 'sut-wechat-mini')
        ));
    }
    
    /**
     * 批量更新消息
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function batch_update_messages($request) {
        // 获取当前用户ID
        $user_id = get_current_user_id();
        
        // 获取请求参数
        $ids = $request->get_param('ids');
        $action = $request->get_param('action');
        
        // 验证消息ID
        $valid_ids = array();
        foreach ($ids as $id) {
            if (is_numeric($id) && $id > 0) {
                $valid_ids[] = intval($id);
            }
        }
        
        if (empty($valid_ids)) {
            return new WP_Error(
                'invalid_ids',
                __('无效的消息ID', 'sut-wechat-mini'),
                array('status' => 400)
            );
        }
        
        // 执行批量操作
        $result = $this->batch_update_message_status($valid_ids, $user_id, $action);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // 清除相关缓存
        $this->clear_user_messages_cache($user_id);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => __('批量操作成功', 'sut-wechat-mini'),
            'updated_count' => $result
        ));
    }
    
    /**
     * 获取未读消息数量
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_unread_count($request) {
        // 获取当前用户ID
        $user_id = get_current_user_id();
        
        // 构建缓存键
        $cache_key = 'unread_count_' . $user_id;
        
        // 尝试从缓存获取
        $cached_count = $this->cache->get($cache_key, 'messages');
        if ($cached_count !== false) {
            return rest_ensure_response(array('count' => $cached_count));
        }
        
        global $wpdb;
        
        // 查询未读消息数量
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        $count = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE receiver_id = %d AND status = %s",
            $user_id, self::STATUS_UNREAD
        ));
        
        // 缓存数据
        $this->cache->set($cache_key, $count, 300, 'messages');
        
        return rest_ensure_response(array('count' => $count));
    }
    
    /**
     * 创建新消息
     * 
     * @param int $sender_id 发送者ID
     * @param int $receiver_id 接收者ID
     * @param string $type 消息类型
     * @param string $title 消息标题
     * @param string $content 消息内容
     * @param array $data 附加数据
     * @return int|WP_Error 消息ID或错误
     */
    public function create_new_message($sender_id, $receiver_id, $type, $title, $content, $data = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        // 插入消息
        $result = $wpdb->insert(
            $table_name,
            array(
                'sender_id' => $sender_id,
                'receiver_id' => $receiver_id,
                'type' => $type,
                'title' => $title,
                'content' => $content,
                'data' => maybe_serialize($data),
                'status' => self::STATUS_UNREAD,
                'created_at' => current_time('mysql')
            )
        );
        
        if ($result === false) {
            return new WP_Error(
                'message_create_failed',
                __('消息创建失败', 'sut-wechat-mini'),
                array('status' => 500)
            );
        }
        
        return $wpdb->insert_id;
    }
    
    /**
     * 更新消息状态
     * 
     * @param int $message_id 消息ID
     * @param int $user_id 用户ID
     * @param string $status 状态
     * @return bool|WP_Error 是否成功或错误
     */
    public function update_message_status($message_id, $user_id, $status) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        // 更新消息状态
        $result = $wpdb->update(
            $table_name,
            array('status' => $status),
            array('id' => $message_id, 'receiver_id' => $user_id),
            array('%s'),
            array('%d', '%d')
        );
        
        if ($result === false) {
            return new WP_Error(
                'message_update_failed',
                __('消息状态更新失败', 'sut-wechat-mini'),
                array('status' => 500)
            );
        }
        
        if ($result === 0) {
            return new WP_Error(
                'message_not_found',
                __('消息不存在或无权限更新', 'sut-wechat-mini'),
                array('status' => 404)
            );
        }
        
        return true;
    }
    
    /**
     * 标记消息为已读
     * 
     * @param int $message_id 消息ID
     * @return bool|WP_Error 是否成功或错误
     */
    public function mark_message_as_read($message_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        // 更新消息状态
        $result = $wpdb->update(
            $table_name,
            array('status' => self::STATUS_READ),
            array('id' => $message_id),
            array('%s'),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * 删除消息
     * 
     * @param int $message_id 消息ID
     * @param int $user_id 用户ID
     * @return bool|WP_Error 是否成功或错误
     */
    public function delete_message_by_id($message_id, $user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        // 删除消息
        $result = $wpdb->delete(
            $table_name,
            array('id' => $message_id, 'receiver_id' => $user_id),
            array('%d', '%d')
        );
        
        if ($result === false) {
            return new WP_Error(
                'message_delete_failed',
                __('消息删除失败', 'sut-wechat-mini'),
                array('status' => 500)
            );
        }
        
        if ($result === 0) {
            return new WP_Error(
                'message_not_found',
                __('消息不存在或无权限删除', 'sut-wechat-mini'),
                array('status' => 404)
            );
        }
        
        return true;
    }
    
    /**
     * 批量更新消息状态
     * 
     * @param array $message_ids 消息ID数组
     * @param int $user_id 用户ID
     * @param string $action 操作类型
     * @return int|WP_Error 更新的数量或错误
     */
    public function batch_update_message_status($message_ids, $user_id, $action) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_messages';
        
        // 根据操作类型确定状态
        $status = '';
        switch ($action) {
            case 'mark_read':
                $status = self::STATUS_READ;
                break;
            case 'mark_unread':
                $status = self::STATUS_UNREAD;
                break;
            case 'delete':
                // 删除操作
                $placeholders = implode(',', array_fill(0, count($message_ids), '%d'));
                $sql = "DELETE FROM {$table_name} WHERE id IN ({$placeholders}) AND receiver_id = %d";
                $params = array_merge($message_ids, array($user_id));
                
                $result = $wpdb->query($wpdb->prepare($sql, $params));
                
                if ($result === false) {
                    return new WP_Error(
                        'batch_update_failed',
                        __('批量操作失败', 'sut-wechat-mini'),
                        array('status' => 500)
                    );
                }
                
                return $result;
            default:
                return new WP_Error(
                    'invalid_action',
                    __('无效的操作类型', 'sut-wechat-mini'),
                    array('status' => 400)
                );
        }
        
        // 更新状态操作
        $placeholders = implode(',', array_fill(0, count($message_ids), '%d'));
        $sql = "UPDATE {$table_name} SET status = %s WHERE id IN ({$placeholders}) AND receiver_id = %d";
        $params = array_merge(array($status), $message_ids, array($user_id));
        
        $result = $wpdb->query($wpdb->prepare($sql, $params));
        
        if ($result === false) {
            return new WP_Error(
                'batch_update_failed',
                __('批量操作失败', 'sut-wechat-mini'),
                array('status' => 500)
            );
        }
        
        return $result;
    }
    
    /**
     * 格式化消息数据
     * 
     * @param object $message 消息对象
     * @return array 格式化后的消息数据
     */
    private function format_message_data($message) {
        // 解析附加数据
        $data = array();
        if (!empty($message->data)) {
            $data = maybe_unserialize($message->data);
        }
        
        // 获取发送者信息
        $sender = null;
        if ($message->sender_id > 0) {
            $sender_user = get_userdata($message->sender_id);
            if ($sender_user) {
                $sender = array(
                    'id' => $sender_user->ID,
                    'name' => $sender_user->display_name,
                    'avatar' => get_avatar_url($sender_user->ID, array('size' => 96))
                );
            }
        }
        
        return array(
            'id' => $message->id,
            'sender' => $sender,
            'type' => $message->type,
            'title' => $message->title,
            'content' => $message->content,
            'data' => $data,
            'status' => $message->status,
            'created_at' => $message->created_at,
            'read_at' => $message->read_at
        );
    }
    
    /**
     * 发送订单状态变更消息
     * 
     * @param int $order_id 订单ID
     * @param string $old_status 旧状态
     * @param string $new_status 新状态
     * @param WC_Order $order 订单对象
     */
    public function send_order_status_message($order_id, $old_status, $new_status, $order) {
        // 获取用户ID
        $user_id = $order->get_user_id();
        
        if (!$user_id) {
            return;
        }
        
        // 构建消息内容
        $status_text = wc_get_order_status_name($new_status);
        $title = sprintf(__('订单状态更新：%s', 'sut-wechat-mini'), $status_text);
        $content = sprintf(__('您的订单 #%d 状态已更新为：%s', 'sut-wechat-mini'), $order_id, $status_text);
        
        // 附加数据
        $data = array(
            'order_id' => $order_id,
            'order_status' => $new_status,
            'order_total' => $order->get_total(),
            'order_currency' => $order->get_currency()
        );
        
        // 创建消息
        $this->create_new_message(
            0, // 系统消息
            $user_id,
            self::MESSAGE_TYPE_ORDER,
            $title,
            $content,
            $data
        );
    }
    
    /**
     * 发送支付完成消息
     * 
     * @param int $order_id 订单ID
     */
    public function send_payment_complete_message($order_id) {
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return;
        }
        
        // 获取用户ID
        $user_id = $order->get_user_id();
        
        if (!$user_id) {
            return;
        }
        
        // 构建消息内容
        $title = __('支付成功', 'sut-wechat-mini');
        $content = sprintf(__('您的订单 #%d 支付成功，感谢您的购买！', 'sut-wechat-mini'), $order_id);
        
        // 附加数据
        $data = array(
            'order_id' => $order_id,
            'payment_method' => $order->get_payment_method(),
            'order_total' => $order->get_total(),
            'order_currency' => $order->get_currency()
        );
        
        // 创建消息
        $this->create_new_message(
            0, // 系统消息
            $user_id,
            self::MESSAGE_TYPE_PAYMENT,
            $title,
            $content,
            $data
        );
    }
    
    /**
     * 发送积分变动消息
     * 
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $reason 变动原因
     */
    public function send_points_update_message($user_id, $points, $reason) {
        // 构建消息内容
        $title = __('积分变动通知', 'sut-wechat-mini');
        
        if ($points > 0) {
            $content = sprintf(__('您获得了 %d 积分，原因：%s', 'sut-wechat-mini'), $points, $reason);
        } else {
            $content = sprintf(__('您消费了 %d 积分，原因：%s', 'sut-wechat-mini'), abs($points), $reason);
        }
        
        // 附加数据
        $data = array(
            'points' => $points,
            'reason' => $reason
        );
        
        // 创建消息
        $this->create_new_message(
            0, // 系统消息
            $user_id,
            self::MESSAGE_TYPE_POINTS,
            $title,
            $content,
            $data
        );
    }
    
    /**
     * 发送微信模板消息
     * 
     * @param object $message 消息对象
     */
    private function send_wechat_template_message($message) {
        // 检查是否启用微信模板消息
        $template_enabled = get_option('sut_wechat_mini_template_message_enabled', false);
        if (!$template_enabled) {
            return;
        }
        
        // 获取用户openid
        $user_id = $message->receiver_id;
        $openid = get_user_meta($user_id, 'wechat_openid', true);
        
        if (empty($openid)) {
            return;
        }
        
        // 根据消息类型获取模板ID
        $template_id = $this->get_template_id_by_message_type($message->type);
        if (empty($template_id)) {
            return;
        }
        
        // 构建模板数据
        $template_data = $this->build_template_data($message);
        if (empty($template_data)) {
            return;
        }
        
        // 发送模板消息
        $this->wechat_api->send_template_message($openid, $template_id, $template_data);
    }
    
    /**
     * 根据消息类型获取模板ID
     * 
     * @param string $message_type 消息类型
     * @return string 模板ID
     */
    private function get_template_id_by_message_type($message_type) {
        $template_ids = get_option('sut_wechat_mini_template_message_ids', array());
        
        switch ($message_type) {
            case self::MESSAGE_TYPE_ORDER:
                return isset($template_ids['order']) ? $template_ids['order'] : '';
            case self::MESSAGE_TYPE_PAYMENT:
                return isset($template_ids['payment']) ? $template_ids['payment'] : '';
            case self::MESSAGE_TYPE_POINTS:
                return isset($template_ids['points']) ? $template_ids['points'] : '';
            case self::MESSAGE_TYPE_SYSTEM:
                return isset($template_ids['system']) ? $template_ids['system'] : '';
            default:
                return '';
        }
    }
    
    /**
     * 构建模板数据
     * 
     * @param object $message 消息对象
     * @return array 模板数据
     */
    private function build_template_data($message) {
        $data = maybe_unserialize($message->data);
        
        switch ($message->type) {
            case self::MESSAGE_TYPE_ORDER:
                return array(
                    'thing1' => array('value' => $message->title),
                    'character_string2' => array('value' => isset($data['order_id']) ? $data['order_id'] : ''),
                    'phrase3' => array('value' => isset($data['order_status']) ? wc_get_order_status_name($data['order_status']) : ''),
                    'time4' => array('value' => date('Y-m-d H:i:s', strtotime($message->created_at)))
                );
                
            case self::MESSAGE_TYPE_PAYMENT:
                return array(
                    'thing1' => array('value' => $message->title),
                    'character_string2' => array('value' => isset($data['order_id']) ? $data['order_id'] : ''),
                    'amount3' => array('value' => isset($data['order_total']) ? $data['order_total'] : ''),
                    'time4' => array('value' => date('Y-m-d H:i:s', strtotime($message->created_at)))
                );
                
            case self::MESSAGE_TYPE_POINTS:
                return array(
                    'thing1' => array('value' => $message->title),
                    'number2' => array('value' => isset($data['points']) ? $data['points'] : ''),
                    'thing3' => array('value' => isset($data['reason']) ? $data['reason'] : ''),
                    'time4' => array('value' => date('Y-m-d H:i:s', strtotime($message->created_at)))
                );
                
            case self::MESSAGE_TYPE_SYSTEM:
                return array(
                    'thing1' => array('value' => $message->title),
                    'thing2' => array('value' => $message->content),
                    'time3' => array('value' => date('Y-m-d H:i:s', strtotime($message->created_at)))
                );
                
            default:
                return array();
        }
    }
    
    /**
     * 清除用户消息缓存
     * 
     * @param int $user_id 用户ID
     */
    private function clear_user_messages_cache($user_id) {
        // 清除未读数量缓存
        $this->cache->delete('unread_count_' . $user_id, 'messages');
        
        // 清除消息列表缓存
        $this->cache->clear_group('messages');
    }
}