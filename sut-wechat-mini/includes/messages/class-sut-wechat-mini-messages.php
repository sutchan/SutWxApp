<?php
/**
 * SUT寰俊灏忕▼搴忔秷鎭帹閫佺被
 *
 * 璐熻矗寰俊灏忕▼搴忕殑娑堟伅鎺ㄩ€併€佹ā鏉挎秷鎭彂閫佺瓑鍔熻兘
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Messages 绫? */
class SUT_WeChat_Mini_Messages {
    
    /**
     * 鍗曚緥瀹炰緥
     *
     * @var SUT_WeChat_Mini_Messages
     */
    private static $instance = null;
    
    /**
     * 鏋勯€犲嚱鏁?     */
    private function __construct() {
        // 娉ㄥ唽閽╁瓙
        $this->register_hooks();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
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
     * 娉ㄥ唽閽╁瓙
     */
    private function register_hooks() {
        // 璁㈠崟鐘舵€佸彉鏇存椂鍙戦€侀€氱煡
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 3 );
        
        // 閫€娆炬垚鍔熸椂鍙戦€侀€氱煡
        add_action( 'woocommerce_refund_created', array( $this, 'on_refund_created' ), 10, 2 );
        
        // 鐢ㄦ埛璇勮琚壒鍑嗘椂鍙戦€侀€氱煡
        add_action( 'comment_post', array( $this, 'on_comment_post' ), 10, 3 );
        
        // 鏂版枃绔犲彂甯冩椂鍙戦€侀€氱煡
        add_action( 'publish_post', array( $this, 'on_post_published' ), 10, 2 );
        
        // 鐢ㄦ埛绛惧埌鎴愬姛鏃跺彂閫侀€氱煡
        add_action( 'sut_wechat_mini_user_checked_in', array( $this, 'on_user_checked_in' ), 10, 1 );
        
        // 鐢ㄦ埛鑾峰緱绉垎鏃跺彂閫侀€氱煡
        add_action( 'sut_wechat_mini_user_points_added', array( $this, 'on_user_points_added' ), 10, 3 );
    }
    
    /**
     * 鍙戦€佹ā鏉挎秷鎭?     *
     * @param string $openid 鐢ㄦ埛openid
     * @param string $template_id 妯℃澘ID
     * @param array $data 妯℃澘鏁版嵁
     * @param string $page 璺宠浆椤甸潰
     * @param array $miniprogram 灏忕▼搴忎俊鎭?     * @return array 鍙戦€佺粨鏋?     */
    public function send_template_message( $openid, $template_id, $data = array(), $page = '', $miniprogram = array() ) {
        // 妫€鏌ユ槸鍚﹀惎鐢ㄤ簡妯℃澘娑堟伅
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_template_message'] ) || $settings['enable_template_message'] != 1 ) {
            return array(
                'success' => false,
                'error' => __( '妯℃澘娑堟伅鍔熻兘鏈惎鐢?, 'sut-wechat-mini' )
            );
        }
        
        // 鑾峰彇access_token
        $access_token = $this->get_access_token();
        
        if ( ! $access_token ) {
            return array(
                'success' => false,
                'error' => __( '鑾峰彇access_token澶辫触', 'sut-wechat-mini' )
            );
        }
        
        // 鏋勫缓璇锋眰URL
        $url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token={$access_token}";
        
        // 鏋勫缓璇锋眰鏁版嵁
        $request_data = array(
            'touser' => $openid,
            'template_id' => $template_id,
            'data' => $this->format_template_data( $data ),
        );
        
        // 娣诲姞椤甸潰淇℃伅
        if ( ! empty( $page ) ) {
            $request_data['page'] = $page;
        }
        
        // 娣诲姞灏忕▼搴忎俊鎭?        if ( ! empty( $miniprogram ) ) {
            $request_data['miniprogram'] = $miniprogram;
        }
        
        // 鍙戦€佽姹?        $response = $this->send_request( $url, $request_data );
        
        // 璁板綍鏃ュ織
        $this->log_message( 'template', $openid, $template_id, $data, $response );
        
        return $response;
    }
    
    /**
     * 鏍煎紡鍖栨ā鏉挎暟鎹?     *
     * @param array $data 鍘熷鏁版嵁
     * @return array 鏍煎紡鍖栧悗鐨勬暟鎹?     */
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
     * 鍙戦€佽闃呮秷鎭?     *
     * @param string $openid 鐢ㄦ埛openid
     * @param string $template_id 妯℃澘ID
     * @param array $data 妯℃澘鏁版嵁
     * @param string $page 璺宠浆椤甸潰
     * @return array 鍙戦€佺粨鏋?     */
    public function send_subscribe_message( $openid, $template_id, $data = array(), $page = '' ) {
        // 瀹為檯涓婏紝璁㈤槄娑堟伅灏辨槸妯℃澘娑堟伅鐨勪竴绉?        return $this->send_template_message( $openid, $template_id, $data, $page );
    }
    
    /**
     * 鍙戦€佸鏈嶆秷鎭?     *
     * @param string $openid 鐢ㄦ埛openid
     * @param array $message 娑堟伅鍐呭
     * @return array 鍙戦€佺粨鏋?     */
    public function send_customer_message( $openid, $message ) {
        // 鑾峰彇access_token
        $access_token = $this->get_access_token();
        
        if ( ! $access_token ) {
            return array(
                'success' => false,
                'error' => __( '鑾峰彇access_token澶辫触', 'sut-wechat-mini' )
            );
        }
        
        // 鏋勫缓璇锋眰URL
        $url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={$access_token}";
        
        // 鏋勫缓璇锋眰鏁版嵁
        $request_data = array(
            'touser' => $openid,
        );
        
        // 鍚堝苟娑堟伅鍐呭
        $request_data = array_merge( $request_data, $message );
        
        // 鍙戦€佽姹?        $response = $this->send_request( $url, $request_data );
        
        // 璁板綍鏃ュ織
        $this->log_message( 'customer', $openid, '', $message, $response );
        
        return $response;
    }
    
    /**
     * 鍙戦€佹枃鏈鏈嶆秷鎭?     *
     * @param string $openid 鐢ㄦ埛openid
     * @param string $content 娑堟伅鍐呭
     * @return array 鍙戦€佺粨鏋?     */
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
     * 鍙戦€佸浘鐗囧鏈嶆秷鎭?     *
     * @param string $openid 鐢ㄦ埛openid
     * @param string $media_id 濯掍綋ID
     * @return array 鍙戦€佺粨鏋?     */
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
     * 鍙戦€佸浘鏂囧鏈嶆秷鎭?     *
     * @param string $openid 鐢ㄦ埛openid
     * @param array $articles 鏂囩珷鍒楄〃
     * @return array 鍙戦€佺粨鏋?     */
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
     * 鍙戦€佸皬绋嬪簭鍗＄墖瀹㈡湇娑堟伅
     *
     * @param string $openid 鐢ㄦ埛openid
     * @param string $title 鏍囬
     * @param string $pagepath 椤甸潰璺緞
     * @param string $thumb_media_id 缂╃暐鍥惧獟浣揑D
     * @return array 鍙戦€佺粨鏋?     */
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
     * 鍙戦€佸唴閮ㄦ秷鎭?     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param string $type 娑堟伅绫诲瀷
     * @param string $title 娑堟伅鏍囬
     * @param string $content 娑堟伅鍐呭
     * @param array $meta 鍏冩暟鎹?     * @return array 鍙戦€佺粨鏋?     */
    public function send_internal_message( $user_id, $type, $title, $content, $meta = array() ) {
        global $wpdb;
        
        // 鐢熸垚娑堟伅ID
        $message_id = 'msg_' . date( 'YmdHis' ) . '_' . wp_generate_password( 8, false );
        
        // 鎻掑叆娑堟伅璁板綍
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
        
        // 璁板綍鏃ュ織
        $this->log_message( 'internal', '', '', compact( 'user_id', 'type', 'title', 'content', 'meta' ), array( 'success' => true ) );
        
        return array(
            'success' => true,
            'message_id' => $message_id
        );
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛娑堟伅鍒楄〃
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param array $args 鏌ヨ鍙傛暟
     * @return array 娑堟伅鍒楄〃
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
        
        // 鏋勫缓鏌ヨ鏉′欢
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
        
        // 鏋勫缓鎺掑簭
        $orderby = esc_sql( $args['orderby'] );
        $order = esc_sql( $args['order'] );
        
        // 鏋勫缓闄愬埗
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );
        
        // 鎵ц鏌ヨ
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_messages {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_args = array_merge( $query_args, array( $limit, $offset ) );
        
        $messages = $wpdb->get_results( $wpdb->prepare( $sql, $query_args ), ARRAY_A );
        
        // 鑾峰彇鎬绘暟
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
     * 鑾峰彇娑堟伅璇︽儏
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param string $message_id 娑堟伅ID
     * @return array|bool 娑堟伅璇︽儏
     */
    public function get_message_detail( $user_id, $message_id ) {
        global $wpdb;
        
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_messages WHERE user_id = %d AND message_id = %s";
        $message = $wpdb->get_row( $wpdb->prepare( $sql, $user_id, $message_id ), ARRAY_A );
        
        if ( $message && $message['is_read'] == 0 ) {
            // 鏍囪涓哄凡璇?            $this->mark_message_as_read( $user_id, $message_id );
        }
        
        return $message;
    }
    
    /**
     * 鏍囪娑堟伅涓哄凡璇?     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param string $message_id 娑堟伅ID
     * @return bool 鎿嶄綔缁撴灉
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
     * 鏍囪鎵€鏈夋秷鎭负宸茶
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @return bool 鎿嶄綔缁撴灉
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
     * 鍒犻櫎娑堟伅
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param string $message_id 娑堟伅ID
     * @return bool 鎿嶄綔缁撴灉
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
     * 鑾峰彇鏈娑堟伅鏁伴噺
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param string $type 娑堟伅绫诲瀷
     * @return int 鏈娑堟伅鏁伴噺
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
     * 澶勭悊璁㈠崟鐘舵€佸彉鏇?     *
     * @param int $order_id 璁㈠崟ID
     * @param string $old_status 鏃х姸鎬?     * @param string $new_status 鏂扮姸鎬?     */
    public function on_order_status_changed( $order_id, $old_status, $new_status ) {
        // 鑾峰彇璁㈠崟
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 鑾峰彇鐢ㄦ埛ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 鑾峰彇灏忕▼搴忕敤鎴蜂俊鎭?        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $user_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        $openid = $mini_user['openid'];
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 鏍规嵁璁㈠崟鐘舵€佸彂閫佷笉鍚岀殑閫氱煡
        switch ( $new_status ) {
            case 'processing':
            case 'on-hold':
                // 璁㈠崟宸叉敮浠?                if ( $old_status !== $new_status && in_array( $old_status, array( 'pending', 'failed' ) ) ) {
                    $template_id = isset( $settings['template_message_order_paid'] ) ? $settings['template_message_order_paid'] : '';
                    
                    if ( ! empty( $template_id ) ) {
                        $data = array(
                            'thing1' => array('value' => $order->get_order_number()),
                            'amount2' => array('value' => wc_price( $order->get_total() )),
                            'time3' => array('value' => $order->get_date_paid()->format( 'Y-m-d H:i:s' )),
                            'thing4' => array('value' => __( '鎮ㄧ殑璁㈠崟宸叉敮浠樻垚鍔燂紝鎴戜滑灏嗗敖蹇负鎮ㄥ彂璐?, 'sut-wechat-mini' ))
                        );
                        
                        $page = 'pages/order/detail?id=' . $order_id;
                        
                        $this->send_template_message( $openid, $template_id, $data, $page );
                    }
                    
                    // 鍙戦€佸唴閮ㄦ秷鎭?                    $this->send_internal_message(
                        $user_id,
                        'order_paid',
                        __( '璁㈠崟宸叉敮浠?, 'sut-wechat-mini' ),
                        sprintf( __( '鎮ㄧ殑璁㈠崟 %s 宸叉敮浠樻垚鍔燂紝鎴戜滑灏嗗敖蹇负鎮ㄥ彂璐с€?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'shipped':
            case 'completed':
                // 璁㈠崟宸插彂璐?                if ( $old_status !== $new_status && in_array( $old_status, array( 'processing', 'on-hold' ) ) ) {
                    $template_id = isset( $settings['template_message_order_shipped'] ) ? $settings['template_message_order_shipped'] : '';
                    
                    if ( ! empty( $template_id ) ) {
                        $data = array(
                            'thing1' => array('value' => $order->get_order_number()),
                            'thing2' => array('value' => $order->get_shipping_method() ? $order->get_shipping_method() : __( '蹇€?, 'sut-wechat-mini' )),
                            'thing3' => array('value' => $order->get_meta( '_tracking_number', true ) ? $order->get_meta( '_tracking_number', true ) : __( '寰呰ˉ鍏?, 'sut-wechat-mini' )),
                            'time4' => array('value' => current_time( 'mysql' ))
                        );
                        
                        $page = 'pages/order/detail?id=' . $order_id;
                        
                        $this->send_template_message( $openid, $template_id, $data, $page );
                    }
                    
                    // 鍙戦€佸唴閮ㄦ秷鎭?                    $this->send_internal_message(
                        $user_id,
                        'order_shipped',
                        __( '璁㈠崟宸插彂璐?, 'sut-wechat-mini' ),
                        sprintf( __( '鎮ㄧ殑璁㈠崟 %s 宸插彂璐э紝璇锋敞鎰忔煡鏀躲€?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'completed':
                // 璁㈠崟宸插畬鎴?                if ( $old_status !== $new_status ) {
                    // 鍙戦€佸唴閮ㄦ秷鎭?                    $this->send_internal_message(
                        $user_id,
                        'order_completed',
                        __( '璁㈠崟宸插畬鎴?, 'sut-wechat-mini' ),
                        sprintf( __( '鎮ㄧ殑璁㈠崟 %s 宸插畬鎴愶紝鎰熻阿鎮ㄧ殑璐拱锛?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'cancelled':
                // 璁㈠崟宸插彇娑?                if ( $old_status !== $new_status ) {
                    // 鍙戦€佸唴閮ㄦ秷鎭?                    $this->send_internal_message(
                        $user_id,
                        'order_cancelled',
                        __( '璁㈠崟宸插彇娑?, 'sut-wechat-mini' ),
                        sprintf( __( '鎮ㄧ殑璁㈠崟 %s 宸插彇娑堬紝濡傛湁鐤戦棶璇疯仈绯诲鏈嶃€?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'refunded':
                // 璁㈠崟宸查€€娆?                if ( $old_status !== $new_status ) {
                    // 鍙戦€佸唴閮ㄦ秷鎭?                    $this->send_internal_message(
                        $user_id,
                        'order_refunded',
                        __( '璁㈠崟宸查€€娆?, 'sut-wechat-mini' ),
                        sprintf( __( '鎮ㄧ殑璁㈠崟 %s 宸查€€娆撅紝閫€娆惧皢鍦?-7涓伐浣滄棩鍐呭師璺繑鍥炴偍鐨勬敮浠樿处鎴枫€?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
        }
    }
    
    /**
     * 澶勭悊閫€娆惧垱寤?     *
     * @param int $refund_id 閫€娆綢D
     * @param WC_Order $order 璁㈠崟瀵硅薄
     */
    public function on_refund_created( $refund_id, $order ) {
        // 鑾峰彇鐢ㄦ埛ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 鑾峰彇灏忕▼搴忕敤鎴蜂俊鎭?        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $user_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        $openid = $mini_user['openid'];
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 鍙戦€侀€€娆炬垚鍔熼€氱煡
        $template_id = isset( $settings['template_message_refund_success'] ) ? $settings['template_message_refund_success'] : '';
        
        if ( ! empty( $template_id ) ) {
            $refund = wc_get_refund( $refund_id );
            $refund_amount = $refund ? $refund->get_amount() : 0;
            
            $data = array(
                'thing1' => array('value' => $order->get_order_number()),
                'amount2' => array('value' => wc_price( $refund_amount )),
                'time3' => array('value' => current_time( 'mysql' )),
                'thing4' => array('value' => __( '鎮ㄧ殑閫€娆惧凡澶勭悊瀹屾垚锛岄€€娆惧皢鍦?-7涓伐浣滄棩鍐呭師璺繑鍥炴偍鐨勬敮浠樿处鎴?, 'sut-wechat-mini' ))
            );
            
            $page = 'pages/order/detail?id=' . $order->get_id();
            
            $this->send_template_message( $openid, $template_id, $data, $page );
        }
    }
    
    /**
     * 澶勭悊璇勮鍙戝竷
     *
     * @param int $comment_id 璇勮ID
     * @param int $comment_approved 璇勮鏄惁琚壒鍑?     * @param array $commentdata 璇勮鏁版嵁
     */
    public function on_comment_post( $comment_id, $comment_approved, $commentdata ) {
        // 濡傛灉璇勮鏈鎵瑰噯锛屼笉鍙戦€侀€氱煡
        if ( $comment_approved != 1 ) {
            return;
        }
        
        // 鑾峰彇璇勮
        $comment = get_comment( $comment_id );
        
        if ( ! $comment ) {
            return;
        }
        
        // 鑾峰彇鏂囩珷浣滆€匢D
        $post_id = $comment->comment_post_ID;
        $post = get_post( $post_id );
        
        if ( ! $post ) {
            return;
        }
        
        $author_id = $post->post_author;
        
        // 鑾峰彇灏忕▼搴忕敤鎴蜂俊鎭?        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $author_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        // 鍙戦€佸唴閮ㄦ秷鎭?        $this->send_internal_message(
            $author_id,
            'comment',
            __( '鏈夋柊鐨勮瘎璁?, 'sut-wechat-mini' ),
            sprintf( 
                __( '鎮ㄧ殑鏂囩珷銆?s銆嬫敹鍒颁簡涓€鏉℃柊璇勮锛?s', 'sut-wechat-mini' ), 
                $post->post_title, 
                $comment->comment_content 
            ),
            array( 'post_id' => $post_id, 'comment_id' => $comment_id )
        );
    }
    
    /**
     * 澶勭悊鏂囩珷鍙戝竷
     *
     * @param int $post_id 鏂囩珷ID
     * @param WP_Post $post 鏂囩珷瀵硅薄
     */
    public function on_post_published( $post_id, $post ) {
        // 妫€鏌ユ槸鍚︽槸棣栨鍙戝竷
        if ( $post->post_date !== $post->post_modified ) {
            return;
        }
        
        // 鑾峰彇鎵€鏈夎闃呰鍒嗙被鐨勭敤鎴?        $categories = wp_get_post_categories( $post_id );
        
        if ( empty( $categories ) ) {
            return;
        }
        
        global $wpdb;
        
        // 鏌ヨ璁㈤槄浜嗚繖浜涘垎绫荤殑鐢ㄦ埛
        $category_placeholders = implode( ',', array_fill( 0, count( $categories ), '%d' ) );
        $sql = "SELECT DISTINCT user_id FROM {$wpdb->prefix}sut_wechat_mini_user_favorites WHERE object_type = 'category' AND object_id IN ({$category_placeholders})";
        $user_ids = $wpdb->get_col( $wpdb->prepare( $sql, $categories ) );
        
        if ( empty( $user_ids ) ) {
            return;
        }
        
        // 鍚戞瘡涓敤鎴峰彂閫侀€氱煡
        foreach ( $user_ids as $user_id ) {
            $this->send_internal_message(
                $user_id,
                'new_post',
                __( '鏈夋柊鏂囩珷鍙戝竷', 'sut-wechat-mini' ),
                sprintf( __( '鎮ㄨ闃呯殑鍒嗙被鏈夋柊鏂囩珷鍙戝竷锛氥€?s銆?, 'sut-wechat-mini' ), $post->post_title ),
                array( 'post_id' => $post_id )
            );
        }
    }
    
    /**
     * 澶勭悊鐢ㄦ埛绛惧埌
     *
     * @param int $user_id 鐢ㄦ埛ID
     */
    public function on_user_checked_in( $user_id ) {
        // 鍙戦€佸唴閮ㄦ秷鎭?        $this->send_internal_message(
            $user_id,
            'checkin',
            __( '绛惧埌鎴愬姛', 'sut-wechat-mini' ),
            __( '鎭枩鎮ㄧ鍒版垚鍔燂紝鑾峰緱绉垎濂栧姳锛?, 'sut-wechat-mini' )
        );
    }
    
    /**
     * 澶勭悊鐢ㄦ埛绉垎澧炲姞
     *
     * @param int $user_id 鐢ㄦ埛ID
     * @param int $points 绉垎鏁伴噺
     * @param string $source 绉垎鏉ユ簮
     */
    public function on_user_points_added( $user_id, $points, $source ) {
        // 鍙戦€佸唴閮ㄦ秷鎭?        $this->send_internal_message(
            $user_id,
            'points',
            __( '绉垎鍙樺姩', 'sut-wechat-mini' ),
            sprintf( __( '鎮ㄧ殑璐︽埛鑾峰緱浜?%d 绉垎锛屾潵婧愶細%s', 'sut-wechat-mini' ), $points, $source )
        );
    }
    
    /**
     * 鑾峰彇access_token
     *
     * @return string|bool access_token鎴杅alse
     */
    private function get_access_token() {
        // 灏濊瘯浠庣紦瀛樿幏鍙?        $access_token = get_transient( 'sut_wechat_mini_access_token' );
        
        if ( $access_token ) {
            return $access_token;
        }
        
        // 鑾峰彇app_id鍜宎pp_secret
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $app_id = isset( $settings['app_id'] ) ? $settings['app_id'] : '';
        $app_secret = isset( $settings['app_secret'] ) ? $settings['app_secret'] : '';
        
        if ( empty( $app_id ) || empty( $app_secret ) ) {
            return false;
        }
        
        // 鍙戦€佽姹傝幏鍙朼ccess_token
        $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$app_id}&secret={$app_secret}";
        $response = wp_remote_get( $url, array( 'timeout' => 10 ) );
        
        if ( is_wp_error( $response ) ) {
            return false;
        }
        
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        if ( isset( $data['access_token'] ) ) {
            // 缂撳瓨access_token锛堟湁鏁堟湡鍑?0鍒嗛挓锛岄伩鍏嶈繃鏈燂級
            $expires_in = isset( $data['expires_in'] ) ? $data['expires_in'] : 7200;
            set_transient( 'sut_wechat_mini_access_token', $data['access_token'], $expires_in - 600 );
            
            return $data['access_token'];
        }
        
        return false;
    }
    
    /**
     * 鍙戦€丠TTP璇锋眰
     *
     * @param string $url 璇锋眰URL
     * @param array $data 璇锋眰鏁版嵁
     * @return array 鍝嶅簲缁撴灉
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
                'error' => isset( $result['errmsg'] ) ? $result['errmsg'] : __( '鏈煡閿欒', 'sut-wechat-mini' ),
                'errcode' => $result['errcode']
            );
        }
        
        return array(
            'success' => true,
            'data' => $result
        );
    }
    
    /**
     * 璁板綍娑堟伅鏃ュ織
     *
     * @param string $type 娑堟伅绫诲瀷
     * @param string $openid 鐢ㄦ埛openid
     * @param string $template_id 妯℃澘ID
     * @param array $data 娑堟伅鏁版嵁
     * @param array $response 鍝嶅簲缁撴灉
     */
    private function log_message( $type, $openid, $template_id, $data, $response ) {
        // 濡傛灉鏈惎鐢ㄦ棩蹇楋紝鐩存帴杩斿洖
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_log'] ) || $settings['enable_log'] != 1 ) {
            return;
        }
        
        // 璁板綍鏃ュ織
        $log_data = array(
            'type' => $type,
            'openid' => $openid,
            'template_id' => $template_id,
            'data' => $data,
            'response' => $response,
            'timestamp' => current_time( 'mysql' )
        );
        
        error_log( 'SUT寰俊灏忕▼搴忔秷鎭帹閫? ' . json_encode( $log_data ) );
    }
}