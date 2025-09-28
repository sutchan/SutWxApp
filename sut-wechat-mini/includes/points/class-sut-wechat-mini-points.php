<?php
/**
 * SUT微信小程序积分系统类
 *
 * 负责微信小程序的会员积分管理、积分规则设置、积分兑换等功能
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Points 类
 */
class SUT_WeChat_Mini_Points {
    
    /**
     * 单例实例
     *
     * @var SUT_WeChat_Mini_Points
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 注册钩子
        $this->register_hooks();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_Points
     */
    public static function get_instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 注册钩子
     */
    private function register_hooks() {
        // 订单完成时增加积分
        add_action( 'woocommerce_order_status_completed', array( $this, 'on_order_completed' ), 10, 1 );
        
        // 用户签到时增加积分
        add_action( 'sut_wechat_mini_user_checked_in', array( $this, 'on_user_checked_in' ), 10, 1 );
        
        // 用户评论时增加积分
        add_action( 'comment_post', array( $this, 'on_comment_post' ), 10, 3 );
        
        // 用户分享时增加积分
        add_action( 'sut_wechat_mini_user_shared', array( $this, 'on_user_shared' ), 10, 2 );
        
        // 每日首次登录时增加积分
        add_action( 'sut_wechat_mini_user_logged_in', array( $this, 'on_user_logged_in' ), 10, 1 );
        
        // 注册积分规则设置
        add_filter( 'sut_wechat_mini_admin_settings', array( $this, 'add_points_settings' ), 10, 1 );
        
        // 积分兑换商品添加到订单项目
        add_action( 'woocommerce_add_order_item_meta', array( $this, 'add_order_item_points_meta' ), 10, 3 );
        
        // 订单支付成功后扣除积分
        add_action( 'woocommerce_payment_complete', array( $this, 'on_payment_complete' ), 10, 1 );
    }
    
    /**
     * 获取用户积分
     *
     * @param int $user_id 用户ID
     * @return int 用户积分
     */
    public function get_user_points( $user_id ) {
        global $wpdb;
        
        $sql = "SELECT points FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d";
        $points = $wpdb->get_var( $wpdb->prepare( $sql, $user_id ) );
        
        return $points ? intval( $points ) : 0;
    }
    
    /**
     * 增加用户积分
     *
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 积分来源
     * @param array $meta 元数据
     * @return bool 操作结果
     */
    public function add_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        global $wpdb;
        
        // 检查用户是否存在
        $user = get_user_by( 'id', $user_id );
        
        if ( ! $user ) {
            return false;
        }
        
        // 开始事务
        $wpdb->query( 'START TRANSACTION' );
        
        // 更新用户积分
        $result = $wpdb->query( $wpdb->prepare( 
            "UPDATE {$wpdb->prefix}sut_wechat_mini_users SET points = points + %d WHERE user_id = %d", 
            $points, 
            $user_id 
        ) );
        
        if ( $result === false ) {
            $wpdb->query( 'ROLLBACK' );
            return false;
        }
        
        // 记录积分变动日志
        $log_id = 'point_' . date( 'YmdHis' ) . '_' . wp_generate_password( 8, false );
        
        $log_result = $wpdb->insert(
            $wpdb->prefix . 'sut_wechat_mini_points_log',
            array(
                'log_id' => $log_id,
                'user_id' => $user_id,
                'points' => $points,
                'source' => $source,
                'meta' => json_encode( $meta ),
                'create_time' => current_time( 'mysql' )
            ),
            array( '%s', '%d', '%d', '%s', '%s', '%s' )
        );
        
        if ( $log_result === false ) {
            $wpdb->query( 'ROLLBACK' );
            return false;
        }
        
        // 提交事务
        $wpdb->query( 'COMMIT' );
        
        // 触发积分增加钩子
        do_action( 'sut_wechat_mini_user_points_added', $user_id, $points, $source );
        
        return true;
    }
    
    /**
     * 减少用户积分
     *
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 积分来源
     * @param array $meta 元数据
     * @return bool 操作结果
     */
    public function reduce_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        // 检查积分是否足够
        $current_points = $this->get_user_points( $user_id );
        
        if ( $current_points < $points ) {
            return false;
        }
        
        // 调用增加用户积分函数，但使用负数
        return $this->add_user_points( $user_id, -$points, $source, $meta );
    }
    
    /**
     * 设置用户积分
     *
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 积分来源
     * @param array $meta 元数据
     * @return bool 操作结果
     */
    public function set_user_points( $user_id, $points, $source = 'system', $meta = array() ) {
        global $wpdb;
        
        // 检查用户是否存在
        $user = get_user_by( 'id', $user_id );
        
        if ( ! $user ) {
            return false;
        }
        
        // 获取当前积分
        $current_points = $this->get_user_points( $user_id );
        
        // 计算积分变动量
        $points_change = $points - $current_points;
        
        if ( $points_change == 0 ) {
            return true;
        }
        
        if ( $points_change > 0 ) {
            // 增加积分
            return $this->add_user_points( $user_id, $points_change, $source, $meta );
        } else {
            // 减少积分
            return $this->reduce_user_points( $user_id, abs( $points_change ), $source, $meta );
        }
    }
    
    /**
     * 获取积分变动日志
     *
     * @param int $user_id 用户ID
     * @param array $args 查询参数
     * @return array 积分日志列表
     */
    public function get_points_logs( $user_id, $args = array() ) {
        global $wpdb;
        
        $defaults = array(
            'source' => '',
            'start_date' => '',
            'end_date' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'create_time',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args( $args, $defaults );
        
        // 构建查询条件
        $where = "WHERE user_id = %d";
        $query_args = array( $user_id );
        
        if ( ! empty( $args['source'] ) ) {
            $where .= " AND source = %s";
            $query_args[] = $args['source'];
        }
        
        if ( ! empty( $args['start_date'] ) ) {
            $where .= " AND create_time >= %s";
            $query_args[] = $args['start_date'];
        }
        
        if ( ! empty( $args['end_date'] ) ) {
            $where .= " AND create_time <= %s";
            $query_args[] = $args['end_date'];
        }
        
        // 构建排序
        $orderby = esc_sql( $args['orderby'] );
        $order = esc_sql( $args['order'] );
        
        // 构建限制
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );
        
        // 执行查询
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_points_log {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_args = array_merge( $query_args, array( $limit, $offset ) );
        
        $logs = $wpdb->get_results( $wpdb->prepare( $sql, $query_args ), ARRAY_A );
        
        // 格式化元数据
        foreach ( $logs as &$log ) {
            if ( ! empty( $log['meta'] ) ) {
                $log['meta'] = json_decode( $log['meta'], true );
            }
        }
        
        // 获取总数
        $total_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_points_log {$where}";
        $total = $wpdb->get_var( $wpdb->prepare( $total_sql, array_slice( $query_args, 0, -2 ) ) );
        
        return array(
            'logs' => $logs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        );
    }
    
    /**
     * 积分兑换商品
     *
     * @param int $user_id 用户ID
     * @param int $product_id 商品ID
     * @param int $quantity 数量
     * @return array 兑换结果
     */
    public function exchange_points_for_product( $user_id, $product_id, $quantity = 1 ) {
        // 获取商品
        $product = wc_get_product( $product_id );
        
        if ( ! $product || ! $product->is_purchasable() ) {
            return array(
                'success' => false,
                'error' => __( '商品不存在或不可购买', 'sut-wechat-mini' )
            );
        }
        
        // 获取商品所需积分
        $points_required = get_post_meta( $product_id, '_points_required', true );
        
        if ( ! $points_required || $points_required <= 0 ) {
            return array(
                'success' => false,
                'error' => __( '该商品不能用积分兑换', 'sut-wechat-mini' )
            );
        }
        
        // 计算总积分需求
        $total_points_required = $points_required * $quantity;
        
        // 检查用户积分是否足够
        $current_points = $this->get_user_points( $user_id );
        
        if ( $current_points < $total_points_required ) {
            return array(
                'success' => false,
                'error' => __( '积分不足', 'sut-wechat-mini' ),
                'current_points' => $current_points,
                'required_points' => $total_points_required
            );
        }
        
        // 创建积分订单
        $order = wc_create_order( array(
            'customer_id' => $user_id,
            'status' => 'pending'
        ) );
        
        if ( ! $order ) {
            return array(
                'success' => false,
                'error' => __( '创建订单失败', 'sut-wechat-mini' )
            );
        }
        
        // 添加商品到订单
        $order->add_product( $product, $quantity );
        
        // 设置订单为积分兑换
        $order->update_meta_data( '_payment_method', 'points' );
        $order->update_meta_data( '_payment_method_title', __( '积分兑换', 'sut-wechat-mini' ) );
        $order->update_meta_data( '_points_exchange', true );
        $order->update_meta_data( '_points_used', $total_points_required );
        
        // 计算订单总价（为0）
        $order->set_total( 0 );
        $order->save();
        
        // 处理订单
        $order->payment_complete();
        
        return array(
            'success' => true,
            'order_id' => $order->get_id(),
            'points_used' => $total_points_required
        );
    }
    
    /**
     * 获取积分兑换商品列表
     *
     * @param array $args 查询参数
     * @return array 商品列表
     */
    public function get_points_products( $args = array() ) {
        $defaults = array(
            'category' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'meta_value_num',
            'order' => 'ASC'
        );
        
        $args = wp_parse_args( $args, $defaults );
        
        $query_args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $args['limit'],
            'offset' => $args['offset'],
            'meta_key' => '_points_required',
            'meta_query' => array(
                array(
                    'key' => '_points_required',
                    'value' => 0,
                    'compare' => '>',
                    'type' => 'NUMERIC'
                )
            ),
            'orderby' => $args['orderby'],
            'order' => $args['order']
        );
        
        if ( ! empty( $args['category'] ) ) {
            $query_args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $args['category']
                )
            );
        }
        
        $query = new WP_Query( $query_args );
        
        $products = array();
        
        foreach ( $query->posts as $post ) {
            $product = wc_get_product( $post->ID );
            $products[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'excerpt' => $post->post_excerpt,
                'thumbnail' => get_the_post_thumbnail_url( $post->ID, 'medium' ),
                'points_required' => get_post_meta( $post->ID, '_points_required', true ),
                'price' => $product->get_price(),
                'stock_quantity' => $product->get_stock_quantity(),
                'stock_status' => $product->get_stock_status()
            );
        }
        
        return array(
            'products' => $products,
            'total' => $query->found_posts,
            'limit' => $args['limit'],
            'offset' => $args['offset']
        );
    }
    
    /**
     * 获取积分规则设置
     *
     * @return array 积分规则设置
     */
    public function get_points_rules() {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        $default_rules = array(
            'enabled' => 1,
            'order_points_rate' => 1,
            'checkin_points' => 5,
            'comment_points' => 2,
            'share_points' => 3,
            'daily_login_points' => 1,
            'max_points_per_day' => 50,
            'points_expire_days' => 365
        );
        
        // 合并默认规则和设置规则
        $rules = array_merge( $default_rules, isset( $settings['points_rules'] ) ? $settings['points_rules'] : array() );
        
        return $rules;
    }
    
    /**
     * 检查用户今日积分是否已达上限
     *
     * @param int $user_id 用户ID
     * @return bool 是否已达上限
     */
    public function is_user_points_reached_daily_limit( $user_id ) {
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或未设置每日上限，返回false
        if ( ! $rules['enabled'] || $rules['max_points_per_day'] <= 0 ) {
            return false;
        }
        
        global $wpdb;
        
        // 获取今日积分获取总量
        $today = date( 'Y-m-d' );
        $tomorrow = date( 'Y-m-d', strtotime( '+1 day' ) );
        
        $sql = "SELECT SUM(points) FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE user_id = %d AND points > 0 AND create_time >= %s AND create_time < %s";
        $today_points = $wpdb->get_var( $wpdb->prepare( $sql, $user_id, $today, $tomorrow ) );
        
        $today_points = $today_points ? intval( $today_points ) : 0;
        
        return $today_points >= $rules['max_points_per_day'];
    }
    
    /**
     * 处理订单完成事件，增加积分
     *
     * @param int $order_id 订单ID
     */
    public function on_order_completed( $order_id ) {
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 检查是否是积分兑换订单
        $is_points_exchange = $order->get_meta( '_points_exchange', true );
        
        if ( $is_points_exchange ) {
            return;
        }
        
        // 获取用户ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 获取积分规则
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或订单积分比例为0，直接返回
        if ( ! $rules['enabled'] || $rules['order_points_rate'] <= 0 ) {
            return;
        }
        
        // 检查是否已经为该订单添加积分
        $points_added = $order->get_meta( '_points_added', true );
        
        if ( $points_added ) {
            return;
        }
        
        // 计算订单应得积分
        $order_total = $order->get_total();
        $points = round( $order_total * $rules['order_points_rate'] );
        
        if ( $points <= 0 ) {
            return;
        }
        
        // 增加用户积分
        $result = $this->add_user_points( 
            $user_id, 
            $points, 
            'order', 
            array( 'order_id' => $order_id, 'order_total' => $order_total ) 
        );
        
        if ( $result ) {
            // 标记订单已添加积分
            $order->update_meta_data( '_points_added', true );
            $order->update_meta_data( '_points_added_amount', $points );
            $order->save();
        }
    }
    
    /**
     * 处理用户签到事件，增加积分
     *
     * @param int $user_id 用户ID
     */
    public function on_user_checked_in( $user_id ) {
        // 获取积分规则
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或签到积分未设置，直接返回
        if ( ! $rules['enabled'] || $rules['checkin_points'] <= 0 ) {
            return;
        }
        
        // 检查是否已达到每日上限
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 增加用户积分
        $this->add_user_points( $user_id, $rules['checkin_points'], 'checkin' );
    }
    
    /**
     * 处理用户评论事件，增加积分
     *
     * @param int $comment_id 评论ID
     * @param int $comment_approved 评论是否被批准
     * @param array $commentdata 评论数据
     */
    public function on_comment_post( $comment_id, $comment_approved, $commentdata ) {
        // 如果评论未被批准，不增加积分
        if ( $comment_approved != 1 ) {
            return;
        }
        
        // 获取评论
        $comment = get_comment( $comment_id );
        
        if ( ! $comment ) {
            return;
        }
        
        // 获取用户ID
        $user_id = $comment->user_id;
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 获取积分规则
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或评论积分未设置，直接返回
        if ( ! $rules['enabled'] || $rules['comment_points'] <= 0 ) {
            return;
        }
        
        // 检查是否已达到每日上限
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 增加用户积分
        $this->add_user_points( 
            $user_id, 
            $rules['comment_points'], 
            'comment', 
            array( 'comment_id' => $comment_id, 'post_id' => $comment->comment_post_ID ) 
        );
    }
    
    /**
     * 处理用户分享事件，增加积分
     *
     * @param int $user_id 用户ID
     * @param array $meta 元数据
     */
    public function on_user_shared( $user_id, $meta = array() ) {
        // 获取积分规则
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或分享积分未设置，直接返回
        if ( ! $rules['enabled'] || $rules['share_points'] <= 0 ) {
            return;
        }
        
        // 检查是否已达到每日上限
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 增加用户积分
        $this->add_user_points( $user_id, $rules['share_points'], 'share', $meta );
    }
    
    /**
     * 处理用户登录事件，增加积分
     *
     * @param int $user_id 用户ID
     */
    public function on_user_logged_in( $user_id ) {
        // 获取积分规则
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或登录积分未设置，直接返回
        if ( ! $rules['enabled'] || $rules['daily_login_points'] <= 0 ) {
            return;
        }
        
        global $wpdb;
        
        // 检查今日是否已经获取登录积分
        $today = date( 'Y-m-d' );
        $tomorrow = date( 'Y-m-d', strtotime( '+1 day' ) );
        
        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE user_id = %d AND source = 'login' AND create_time >= %s AND create_time < %s";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $user_id, $today, $tomorrow ) );
        
        if ( $count > 0 ) {
            return;
        }
        
        // 检查是否已达到每日上限
        if ( $this->is_user_points_reached_daily_limit( $user_id ) ) {
            return;
        }
        
        // 增加用户积分
        $this->add_user_points( $user_id, $rules['daily_login_points'], 'login' );
    }
    
    /**
     * 添加积分设置项
     *
     * @param array $settings 原有设置
     * @return array 更新后的设置
     */
    public function add_points_settings( $settings ) {
        $points_rules = $this->get_points_rules();
        
        $settings['points'] = array(
            'title' => __( '积分设置', 'sut-wechat-mini' ),
            'sections' => array(
                array(
                    'title' => __( '基础设置', 'sut-wechat-mini' ),
                    'fields' => array(
                        array(
                            'name' => 'points_rules[enabled]',
                            'label' => __( '启用积分系统', 'sut-wechat-mini' ),
                            'type' => 'checkbox',
                            'value' => isset( $points_rules['enabled'] ) ? $points_rules['enabled'] : 1
                        ),
                        array(
                            'name' => 'points_rules[max_points_per_day]',
                            'label' => __( '每日最大积分获取量', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['max_points_per_day'] ) ? $points_rules['max_points_per_day'] : 50,
                            'description' => __( '设置为0表示不限制', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[points_expire_days]',
                            'label' => __( '积分有效期(天)', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['points_expire_days'] ) ? $points_rules['points_expire_days'] : 365,
                            'description' => __( '设置为0表示永不过期', 'sut-wechat-mini' )
                        )
                    )
                ),
                array(
                    'title' => __( '积分获取规则', 'sut-wechat-mini' ),
                    'fields' => array(
                        array(
                            'name' => 'points_rules[order_points_rate]',
                            'label' => __( '订单积分比例', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['order_points_rate'] ) ? $points_rules['order_points_rate'] : 1,
                            'description' => __( '每消费1元获得的积分数量', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[checkin_points]',
                            'label' => __( '签到积分', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['checkin_points'] ) ? $points_rules['checkin_points'] : 5,
                            'description' => __( '每日签到获得的积分数量', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[comment_points]',
                            'label' => __( '评论积分', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['comment_points'] ) ? $points_rules['comment_points'] : 2,
                            'description' => __( '发表评论获得的积分数量', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[share_points]',
                            'label' => __( '分享积分', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['share_points'] ) ? $points_rules['share_points'] : 3,
                            'description' => __( '分享内容获得的积分数量', 'sut-wechat-mini' )
                        ),
                        array(
                            'name' => 'points_rules[daily_login_points]',
                            'label' => __( '每日登录积分', 'sut-wechat-mini' ),
                            'type' => 'number',
                            'value' => isset( $points_rules['daily_login_points'] ) ? $points_rules['daily_login_points'] : 1,
                            'description' => __( '每日首次登录获得的积分数量', 'sut-wechat-mini' )
                        )
                    )
                )
            )
        );
        
        return $settings;
    }
    
    /**
     * 添加订单项目的积分元数据
     *
     * @param int $item_id 订单项ID
     * @param object $item 订单项对象
     * @param int $order_id 订单ID
     */
    public function add_order_item_points_meta( $item_id, $item, $order_id ) {
        $product_id = $item->get_product_id();
        $points_required = get_post_meta( $product_id, '_points_required', true );
        
        if ( $points_required && $points_required > 0 ) {
            wc_add_order_item_meta( $item_id, __( '所需积分', 'sut-wechat-mini' ), $points_required );
        }
    }
    
    /**
     * 处理支付完成事件，扣除积分
     *
     * @param int $order_id 订单ID
     */
    public function on_payment_complete( $order_id ) {
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 检查是否是积分兑换订单
        $is_points_exchange = $order->get_meta( '_points_exchange', true );
        
        if ( ! $is_points_exchange ) {
            return;
        }
        
        // 获取用户ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 获取需要扣除的积分
        $points_used = $order->get_meta( '_points_used', true );
        
        if ( ! $points_used || $points_used <= 0 ) {
            return;
        }
        
        // 扣除用户积分
        $this->reduce_user_points( 
            $user_id, 
            $points_used, 
            'exchange', 
            array( 'order_id' => $order_id ) 
        );
    }
    
    /**
     * 清理过期积分
     */
    public function cleanup_expired_points() {
        global $wpdb;
        
        // 获取积分规则
        $rules = $this->get_points_rules();
        
        // 如果未启用积分系统或积分永不过期，直接返回
        if ( ! $rules['enabled'] || $rules['points_expire_days'] <= 0 ) {
            return;
        }
        
        // 计算过期日期
        $expire_date = date( 'Y-m-d', strtotime( '-' . $rules['points_expire_days'] . ' days' ) );
        
        // 获取所有用户积分日志
        $sql = "SELECT user_id, SUM(points) as total_points FROM {$wpdb->prefix}sut_wechat_mini_points_log WHERE points > 0 AND create_time < %s GROUP BY user_id";
        $expired_points = $wpdb->get_results( $wpdb->prepare( $sql, $expire_date ), ARRAY_A );
        
        // 扣除过期积分
        foreach ( $expired_points as $item ) {
            $this->reduce_user_points( 
                $item['user_id'], 
                $item['total_points'], 
                'expired', 
                array( 'expire_date' => $expire_date ) 
            );
        }
    }
}