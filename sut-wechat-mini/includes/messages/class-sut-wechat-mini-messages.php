<?php
/**
 * SUT微信小程序消息推送类
 *
 * 负责微信小程序的消息推送、模板消息发送等功能
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Messages 类
 */
class SUT_WeChat_Mini_Messages {
    
    /**
     * 单例实例
     *
     * @var SUT_WeChat_Mini_Messages
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
     * @return SUT_WeChat_Mini_Messages
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
        // 订单状态变更时发送通知
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 3 );
        
        // 退款成功时发送通知
        add_action( 'woocommerce_refund_created', array( $this, 'on_refund_created' ), 10, 2 );
        
        // 用户评论被批准时发送通知
        add_action( 'comment_post', array( $this, 'on_comment_post' ), 10, 3 );
        
        // 新文章发布时发送通知
        add_action( 'publish_post', array( $this, 'on_post_published' ), 10, 2 );
        
        // 用户签到成功时发送通知
        add_action( 'sut_wechat_mini_user_checked_in', array( $this, 'on_user_checked_in' ), 10, 1 );
        
        // 用户获得积分时发送通知
        add_action( 'sut_wechat_mini_user_points_added', array( $this, 'on_user_points_added' ), 10, 3 );
    }
    
    /**
     * 发送模板消息
     *
     * @param string $openid 用户openid
     * @param string $template_id 模板ID
     * @param array $data 模板数据
     * @param string $page 跳转页面
     * @param array $miniprogram 小程序信息
     * @return array 发送结果
     */
    public function send_template_message( $openid, $template_id, $data = array(), $page = '', $miniprogram = array() ) {
        // 检查是否启用了模板消息
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_template_message'] ) || $settings['enable_template_message'] != 1 ) {
            return array(
                'success' => false,
                'error' => __( '模板消息功能未启用', 'sut-wechat-mini' )
            );
        }
        
        // 获取access_token
        $access_token = $this->get_access_token();
        
        if ( ! $access_token ) {
            return array(
                'success' => false,
                'error' => __( '获取access_token失败', 'sut-wechat-mini' )
            );
        }
        
        // 构建请求URL
        $url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token={$access_token}";
        
        // 构建请求数据
        $request_data = array(
            'touser' => $openid,
            'template_id' => $template_id,
            'data' => $this->format_template_data( $data ),
        );
        
        // 添加页面信息
        if ( ! empty( $page ) ) {
            $request_data['page'] = $page;
        }
        
        // 添加小程序信息
        if ( ! empty( $miniprogram ) ) {
            $request_data['miniprogram'] = $miniprogram;
        }
        
        // 发送请求
        $response = $this->send_request( $url, $request_data );
        
        // 记录日志
        $this->log_message( 'template', $openid, $template_id, $data, $response );
        
        return $response;
    }
    
    /**
     * 格式化模板数据
     *
     * @param array $data 原始数据
     * @return array 格式化后的数据
     */
    private function format_template_data( $data ) {
        $formatted_data = array();
        
        foreach ( $data as $key => $value ) {
            if ( is_array( $value ) ) {
                $formatted_data[$key] = $value;
            } else {
                $formatted_data[$key] = array(
                    'value' => $value
                );
            }
        }
        
        return $formatted_data;
    }
    
    /**
     * 发送订阅消息
     *
     * @param string $openid 用户openid
     * @param string $template_id 模板ID
     * @param array $data 模板数据
     * @param string $page 跳转页面
     * @return array 发送结果
     */
    public function send_subscribe_message( $openid, $template_id, $data = array(), $page = '' ) {
        // 实际上，订阅消息就是模板消息的一种
        return $this->send_template_message( $openid, $template_id, $data, $page );
    }
    
    /**
     * 发送客服消息
     *
     * @param string $openid 用户openid
     * @param array $message 消息内容
     * @return array 发送结果
     */
    public function send_customer_message( $openid, $message ) {
        // 获取access_token
        $access_token = $this->get_access_token();
        
        if ( ! $access_token ) {
            return array(
                'success' => false,
                'error' => __( '获取access_token失败', 'sut-wechat-mini' )
            );
        }
        
        // 构建请求URL
        $url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={$access_token}";
        
        // 构建请求数据
        $request_data = array(
            'touser' => $openid,
        );
        
        // 合并消息内容
        $request_data = array_merge( $request_data, $message );
        
        // 发送请求
        $response = $this->send_request( $url, $request_data );
        
        // 记录日志
        $this->log_message( 'customer', $openid, '', $message, $response );
        
        return $response;
    }
    
    /**
     * 发送文本客服消息
     *
     * @param string $openid 用户openid
     * @param string $content 消息内容
     * @return array 发送结果
     */
    public function send_text_customer_message( $openid, $content ) {
        $message = array(
            'msgtype' => 'text',
            'text' => array(
                'content' => $content
            )
        );
        
        return $this->send_customer_message( $openid, $message );
    }
    
    /**
     * 发送图片客服消息
     *
     * @param string $openid 用户openid
     * @param string $media_id 媒体ID
     * @return array 发送结果
     */
    public function send_image_customer_message( $openid, $media_id ) {
        $message = array(
            'msgtype' => 'image',
            'image' => array(
                'media_id' => $media_id
            )
        );
        
        return $this->send_customer_message( $openid, $message );
    }
    
    /**
     * 发送图文客服消息
     *
     * @param string $openid 用户openid
     * @param array $articles 文章列表
     * @return array 发送结果
     */
    public function send_news_customer_message( $openid, $articles ) {
        $message = array(
            'msgtype' => 'news',
            'news' => array(
                'articles' => $articles
            )
        );
        
        return $this->send_customer_message( $openid, $message );
    }
    
    /**
     * 发送小程序卡片客服消息
     *
     * @param string $openid 用户openid
     * @param string $title 标题
     * @param string $pagepath 页面路径
     * @param string $thumb_media_id 缩略图媒体ID
     * @return array 发送结果
     */
    public function send_miniprogram_page_customer_message( $openid, $title, $pagepath, $thumb_media_id ) {
        $message = array(
            'msgtype' => 'miniprogrampage',
            'miniprogrampage' => array(
                'title' => $title,
                'pagepath' => $pagepath,
                'thumb_media_id' => $thumb_media_id
            )
        );
        
        return $this->send_customer_message( $openid, $message );
    }
    
    /**
     * 发送内部消息
     *
     * @param int $user_id 用户ID
     * @param string $type 消息类型
     * @param string $title 消息标题
     * @param string $content 消息内容
     * @param array $meta 元数据
     * @return array 发送结果
     */
    public function send_internal_message( $user_id, $type, $title, $content, $meta = array() ) {
        global $wpdb;
        
        // 生成消息ID
        $message_id = 'msg_' . date( 'YmdHis' ) . '_' . wp_generate_password( 8, false );
        
        // 插入消息记录
        $result = $wpdb->insert(
            $wpdb->prefix . 'sut_wechat_mini_messages',
            array(
                'message_id' => $message_id,
                'user_id' => $user_id,
                'type' => $type,
                'title' => $title,
                'content' => $content,
                'is_read' => 0,
                'create_time' => current_time( 'mysql' ),
                'read_time' => null,
            ),
            array( '%s', '%d', '%s', '%s', '%s', '%d', '%s', '%s' )
        );
        
        if ( $result === false ) {
            return array(
                'success' => false,
                'error' => $wpdb->last_error
            );
        }
        
        // 记录日志
        $this->log_message( 'internal', '', '', compact( 'user_id', 'type', 'title', 'content', 'meta' ), array( 'success' => true ) );
        
        return array(
            'success' => true,
            'message_id' => $message_id
        );
    }
    
    /**
     * 获取用户消息列表
     *
     * @param int $user_id 用户ID
     * @param array $args 查询参数
     * @return array 消息列表
     */
    public function get_user_messages( $user_id, $args = array() ) {
        global $wpdb;
        
        $defaults = array(
            'type' => '',
            'is_read' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'create_time',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args( $args, $defaults );
        
        // 构建查询条件
        $where = "WHERE user_id = %d";
        $query_args = array( $user_id );
        
        if ( ! empty( $args['type'] ) ) {
            $where .= " AND type = %s";
            $query_args[] = $args['type'];
        }
        
        if ( $args['is_read'] !== '' ) {
            $where .= " AND is_read = %d";
            $query_args[] = intval( $args['is_read'] );
        }
        
        // 构建排序
        $orderby = esc_sql( $args['orderby'] );
        $order = esc_sql( $args['order'] );
        
        // 构建限制
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );
        
        // 执行查询
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_messages {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_args = array_merge( $query_args, array( $limit, $offset ) );
        
        $messages = $wpdb->get_results( $wpdb->prepare( $sql, $query_args ), ARRAY_A );
        
        // 获取总数
        $total_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_messages {$where}";
        $total = $wpdb->get_var( $wpdb->prepare( $total_sql, array_slice( $query_args, 0, -2 ) ) );
        
        return array(
            'messages' => $messages,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        );
    }
    
    /**
     * 获取消息详情
     *
     * @param int $user_id 用户ID
     * @param string $message_id 消息ID
     * @return array|bool 消息详情
     */
    public function get_message_detail( $user_id, $message_id ) {
        global $wpdb;
        
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_messages WHERE user_id = %d AND message_id = %s";
        $message = $wpdb->get_row( $wpdb->prepare( $sql, $user_id, $message_id ), ARRAY_A );
        
        if ( $message && $message['is_read'] == 0 ) {
            // 标记为已读
            $this->mark_message_as_read( $user_id, $message_id );
        }
        
        return $message;
    }
    
    /**
     * 标记消息为已读
     *
     * @param int $user_id 用户ID
     * @param string $message_id 消息ID
     * @return bool 操作结果
     */
    public function mark_message_as_read( $user_id, $message_id ) {
        global $wpdb;
        
        $result = $wpdb->update(
            $wpdb->prefix . 'sut_wechat_mini_messages',
            array(
                'is_read' => 1,
                'read_time' => current_time( 'mysql' )
            ),
            array(
                'user_id' => $user_id,
                'message_id' => $message_id
            ),
            array( '%d', '%s' ),
            array( '%d', '%s' )
        );
        
        return $result !== false;
    }
    
    /**
     * 标记所有消息为已读
     *
     * @param int $user_id 用户ID
     * @return bool 操作结果
     */
    public function mark_all_messages_as_read( $user_id ) {
        global $wpdb;
        
        $result = $wpdb->update(
            $wpdb->prefix . 'sut_wechat_mini_messages',
            array(
                'is_read' => 1,
                'read_time' => current_time( 'mysql' )
            ),
            array(
                'user_id' => $user_id,
                'is_read' => 0
            ),
            array( '%d', '%s' ),
            array( '%d', '%d' )
        );
        
        return $result !== false;
    }
    
    /**
     * 删除消息
     *
     * @param int $user_id 用户ID
     * @param string $message_id 消息ID
     * @return bool 操作结果
     */
    public function delete_message( $user_id, $message_id ) {
        global $wpdb;
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'sut_wechat_mini_messages',
            array(
                'user_id' => $user_id,
                'message_id' => $message_id
            ),
            array( '%d', '%s' )
        );
        
        return $result !== false;
    }
    
    /**
     * 获取未读消息数量
     *
     * @param int $user_id 用户ID
     * @param string $type 消息类型
     * @return int 未读消息数量
     */
    public function get_unread_message_count( $user_id, $type = '' ) {
        global $wpdb;
        
        $where = "WHERE user_id = %d AND is_read = 0";
        $query_args = array( $user_id );
        
        if ( ! empty( $type ) ) {
            $where .= " AND type = %s";
            $query_args[] = $type;
        }
        
        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_messages {$where}";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $query_args ) );
        
        return intval( $count );
    }
    
    /**
     * 处理订单状态变更
     *
     * @param int $order_id 订单ID
     * @param string $old_status 旧状态
     * @param string $new_status 新状态
     */
    public function on_order_status_changed( $order_id, $old_status, $new_status ) {
        // 获取订单
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 获取用户ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 获取小程序用户信息
        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $user_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        $openid = $mini_user['openid'];
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 根据订单状态发送不同的通知
        switch ( $new_status ) {
            case 'processing':
            case 'on-hold':
                // 订单已支付
                if ( $old_status !== $new_status && in_array( $old_status, array( 'pending', 'failed' ) ) ) {
                    $template_id = isset( $settings['template_message_order_paid'] ) ? $settings['template_message_order_paid'] : '';
                    
                    if ( ! empty( $template_id ) ) {
                        $data = array(
                            'thing1' => array('value' => $order->get_order_number()),
                            'amount2' => array('value' => wc_price( $order->get_total() )),
                            'time3' => array('value' => $order->get_date_paid()->format( 'Y-m-d H:i:s' )),
                            'thing4' => array('value' => __( '您的订单已支付成功，我们将尽快为您发货', 'sut-wechat-mini' ))
                        );
                        
                        $page = 'pages/order/detail?id=' . $order_id;
                        
                        $this->send_template_message( $openid, $template_id, $data, $page );
                    }
                    
                    // 发送内部消息
                    $this->send_internal_message(
                        $user_id,
                        'order_paid',
                        __( '订单已支付', 'sut-wechat-mini' ),
                        sprintf( __( '您的订单 %s 已支付成功，我们将尽快为您发货。', 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'shipped':
            case 'completed':
                // 订单已发货
                if ( $old_status !== $new_status && in_array( $old_status, array( 'processing', 'on-hold' ) ) ) {
                    $template_id = isset( $settings['template_message_order_shipped'] ) ? $settings['template_message_order_shipped'] : '';
                    
                    if ( ! empty( $template_id ) ) {
                        $data = array(
                            'thing1' => array('value' => $order->get_order_number()),
                            'thing2' => array('value' => $order->get_shipping_method() ? $order->get_shipping_method() : __( '快递', 'sut-wechat-mini' )),
                            'thing3' => array('value' => $order->get_meta( '_tracking_number', true ) ? $order->get_meta( '_tracking_number', true ) : __( '待补充', 'sut-wechat-mini' )),
                            'time4' => array('value' => current_time( 'mysql' ))
                        );
                        
                        $page = 'pages/order/detail?id=' . $order_id;
                        
                        $this->send_template_message( $openid, $template_id, $data, $page );
                    }
                    
                    // 发送内部消息
                    $this->send_internal_message(
                        $user_id,
                        'order_shipped',
                        __( '订单已发货', 'sut-wechat-mini' ),
                        sprintf( __( '您的订单 %s 已发货，请注意查收。', 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'completed':
                // 订单已完成
                if ( $old_status !== $new_status ) {
                    // 发送内部消息
                    $this->send_internal_message(
                        $user_id,
                        'order_completed',
                        __( '订单已完成', 'sut-wechat-mini' ),
                        sprintf( __( '您的订单 %s 已完成，感谢您的购买！', 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'cancelled':
                // 订单已取消
                if ( $old_status !== $new_status ) {
                    // 发送内部消息
                    $this->send_internal_message(
                        $user_id,
                        'order_cancelled',
                        __( '订单已取消', 'sut-wechat-mini' ),
                        sprintf( __( '您的订单 %s 已取消，如有疑问请联系客服。', 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'refunded':
                // 订单已退款
                if ( $old_status !== $new_status ) {
                    // 发送内部消息
                    $this->send_internal_message(
                        $user_id,
                        'order_refunded',
                        __( '订单已退款', 'sut-wechat-mini' ),
                        sprintf( __( '您的订单 %s 已退款，退款将在1-7个工作日内原路返回您的支付账户。', 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
        }
    }
    
    /**
     * 处理退款创建
     *
     * @param int $refund_id 退款ID
     * @param WC_Order $order 订单对象
     */
    public function on_refund_created( $refund_id, $order ) {
        // 获取用户ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 获取小程序用户信息
        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $user_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        $openid = $mini_user['openid'];
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 发送退款成功通知
        $template_id = isset( $settings['template_message_refund_success'] ) ? $settings['template_message_refund_success'] : '';
        
        if ( ! empty( $template_id ) ) {
            $refund = wc_get_refund( $refund_id );
            $refund_amount = $refund ? $refund->get_amount() : 0;
            
            $data = array(
                'thing1' => array('value' => $order->get_order_number()),
                'amount2' => array('value' => wc_price( $refund_amount )),
                'time3' => array('value' => current_time( 'mysql' )),
                'thing4' => array('value' => __( '您的退款已处理完成，退款将在1-7个工作日内原路返回您的支付账户', 'sut-wechat-mini' ))
            );
            
            $page = 'pages/order/detail?id=' . $order->get_id();
            
            $this->send_template_message( $openid, $template_id, $data, $page );
        }
    }
    
    /**
     * 处理评论发布
     *
     * @param int $comment_id 评论ID
     * @param int $comment_approved 评论是否被批准
     * @param array $commentdata 评论数据
     */
    public function on_comment_post( $comment_id, $comment_approved, $commentdata ) {
        // 如果评论未被批准，不发送通知
        if ( $comment_approved != 1 ) {
            return;
        }
        
        // 获取评论
        $comment = get_comment( $comment_id );
        
        if ( ! $comment ) {
            return;
        }
        
        // 获取文章作者ID
        $post_id = $comment->comment_post_ID;
        $post = get_post( $post_id );
        
        if ( ! $post ) {
            return;
        }
        
        $author_id = $post->post_author;
        
        // 获取小程序用户信息
        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $author_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        // 发送内部消息
        $this->send_internal_message(
            $author_id,
            'comment',
            __( '有新的评论', 'sut-wechat-mini' ),
            sprintf( 
                __( '您的文章《%s》收到了一条新评论：%s', 'sut-wechat-mini' ), 
                $post->post_title, 
                $comment->comment_content 
            ),
            array( 'post_id' => $post_id, 'comment_id' => $comment_id )
        );
    }
    
    /**
     * 处理文章发布
     *
     * @param int $post_id 文章ID
     * @param WP_Post $post 文章对象
     */
    public function on_post_published( $post_id, $post ) {
        // 检查是否是首次发布
        if ( $post->post_date !== $post->post_modified ) {
            return;
        }
        
        // 获取所有订阅该分类的用户
        $categories = wp_get_post_categories( $post_id );
        
        if ( empty( $categories ) ) {
            return;
        }
        
        global $wpdb;
        
        // 查询订阅了这些分类的用户
        $category_placeholders = implode( ',', array_fill( 0, count( $categories ), '%d' ) );
        $sql = "SELECT DISTINCT user_id FROM {$wpdb->prefix}sut_wechat_mini_user_favorites WHERE object_type = 'category' AND object_id IN ({$category_placeholders})";
        $user_ids = $wpdb->get_col( $wpdb->prepare( $sql, $categories ) );
        
        if ( empty( $user_ids ) ) {
            return;
        }
        
        // 向每个用户发送通知
        foreach ( $user_ids as $user_id ) {
            $this->send_internal_message(
                $user_id,
                'new_post',
                __( '有新文章发布', 'sut-wechat-mini' ),
                sprintf( __( '您订阅的分类有新文章发布：《%s》', 'sut-wechat-mini' ), $post->post_title ),
                array( 'post_id' => $post_id )
            );
        }
    }
    
    /**
     * 处理用户签到
     *
     * @param int $user_id 用户ID
     */
    public function on_user_checked_in( $user_id ) {
        // 发送内部消息
        $this->send_internal_message(
            $user_id,
            'checkin',
            __( '签到成功', 'sut-wechat-mini' ),
            __( '恭喜您签到成功，获得积分奖励！', 'sut-wechat-mini' )
        );
    }
    
    /**
     * 处理用户积分增加
     *
     * @param int $user_id 用户ID
     * @param int $points 积分数量
     * @param string $source 积分来源
     */
    public function on_user_points_added( $user_id, $points, $source ) {
        // 发送内部消息
        $this->send_internal_message(
            $user_id,
            'points',
            __( '积分变动', 'sut-wechat-mini' ),
            sprintf( __( '您的账户获得了 %d 积分，来源：%s', 'sut-wechat-mini' ), $points, $source )
        );
    }
    
    /**
     * 获取access_token
     *
     * @return string|bool access_token或false
     */
    private function get_access_token() {
        // 尝试从缓存获取
        $access_token = get_transient( 'sut_wechat_mini_access_token' );
        
        if ( $access_token ) {
            return $access_token;
        }
        
        // 获取app_id和app_secret
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $app_id = isset( $settings['app_id'] ) ? $settings['app_id'] : '';
        $app_secret = isset( $settings['app_secret'] ) ? $settings['app_secret'] : '';
        
        if ( empty( $app_id ) || empty( $app_secret ) ) {
            return false;
        }
        
        // 发送请求获取access_token
        $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$app_id}&secret={$app_secret}";
        $response = wp_remote_get( $url, array( 'timeout' => 10 ) );
        
        if ( is_wp_error( $response ) ) {
            return false;
        }
        
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        if ( isset( $data['access_token'] ) ) {
            // 缓存access_token（有效期减10分钟，避免过期）
            $expires_in = isset( $data['expires_in'] ) ? $data['expires_in'] : 7200;
            set_transient( 'sut_wechat_mini_access_token', $data['access_token'], $expires_in - 600 );
            
            return $data['access_token'];
        }
        
        return false;
    }
    
    /**
     * 发送HTTP请求
     *
     * @param string $url 请求URL
     * @param array $data 请求数据
     * @return array 响应结果
     */
    private function send_request( $url, $data ) {
        $response = wp_remote_post( $url, array(
            'timeout' => 30,
            'sslverify' => true,
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode( $data, JSON_UNESCAPED_UNICODE ),
        ) );
        
        if ( is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'error' => $response->get_error_message()
            );
        }
        
        $body = wp_remote_retrieve_body( $response );
        $result = json_decode( $body, true );
        
        if ( isset( $result['errcode'] ) && $result['errcode'] != 0 ) {
            return array(
                'success' => false,
                'error' => isset( $result['errmsg'] ) ? $result['errmsg'] : __( '未知错误', 'sut-wechat-mini' ),
                'errcode' => $result['errcode']
            );
        }
        
        return array(
            'success' => true,
            'data' => $result
        );
    }
    
    /**
     * 记录消息日志
     *
     * @param string $type 消息类型
     * @param string $openid 用户openid
     * @param string $template_id 模板ID
     * @param array $data 消息数据
     * @param array $response 响应结果
     */
    private function log_message( $type, $openid, $template_id, $data, $response ) {
        // 如果未启用日志，直接返回
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_log'] ) || $settings['enable_log'] != 1 ) {
            return;
        }
        
        // 记录日志
        $log_data = array(
            'type' => $type,
            'openid' => $openid,
            'template_id' => $template_id,
            'data' => $data,
            'response' => $response,
            'timestamp' => current_time( 'mysql' )
        );
        
        error_log( 'SUT微信小程序消息推送: ' . json_encode( $log_data ) );
    }
}