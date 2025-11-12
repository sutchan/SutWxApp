锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繑绉烽幁顖涘腹闁胶琚? *
 * 鐠愮喕鐭楀顔讳繆鐏忓繒鈻兼惔蹇曟畱濞戝牊浼呴幒銊┾偓浣碘偓浣鼓侀弶鎸庣Х閹垰褰傞柅浣虹搼閸旂喕鍏? *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Messages 缁? */
class SUT_WeChat_Mini_Messages {
    
    /**
     * 閸楁洑绶ョ€圭偘绶?     *
     * @var SUT_WeChat_Mini_Messages
     */
    private static $instance = null;
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    private function __construct() {
        // 濞夈劌鍞介柦鈺佺摍
        $this->register_hooks();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_Messages
     */
    public static function get_instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 濞夈劌鍞介柦鈺佺摍
     */
    private function register_hooks() {
        // 鐠併垹宕熼悩鑸碘偓浣稿綁閺囧瓨妞傞崣鎴︹偓渚€鈧氨鐓?        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 3 );
        
        // 闁偓濞嗙偓鍨氶崝鐔告閸欐垿鈧線鈧氨鐓?        add_action( 'woocommerce_refund_created', array( $this, 'on_refund_created' ), 10, 2 );
        
        // 閻劍鍩涚拠鍕啈鐞氼偅澹掗崙鍡樻閸欐垿鈧線鈧氨鐓?        add_action( 'comment_post', array( $this, 'on_comment_post' ), 10, 3 );
        
        // 閺傜増鏋冪粩鐘插絺鐢啯妞傞崣鎴︹偓渚€鈧氨鐓?        add_action( 'publish_post', array( $this, 'on_post_published' ), 10, 2 );
        
        // 閻劍鍩涚粵鎯у煂閹存劕濮涢弮璺哄絺闁線鈧氨鐓?        add_action( 'sut_wechat_mini_user_checked_in', array( $this, 'on_user_checked_in' ), 10, 1 );
        
        // 閻劍鍩涢懢宄扮繁缁夘垰鍨庨弮璺哄絺闁線鈧氨鐓?        add_action( 'sut_wechat_mini_user_points_added', array( $this, 'on_user_points_added' ), 10, 3 );
    }
    
    /**
     * 閸欐垿鈧焦膩閺夋寧绉烽幁?     *
     * @param string $openid 閻劍鍩沷penid
     * @param string $template_id 濡剝婢業D
     * @param array $data 濡剝婢橀弫鐗堝祦
     * @param string $page 鐠哄疇娴嗘い鐢告桨
     * @param array $miniprogram 鐏忓繒鈻兼惔蹇庝繆閹?     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
    public function send_template_message( $openid, $template_id, $data = array(), $page = '', $miniprogram = array() ) {
        // 濡偓閺屻儲妲搁崥锕€鎯庨悽銊ょ啊濡剝婢樺☉鍫熶紖
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_template_message'] ) || $settings['enable_template_message'] != 1 ) {
            return array(
                'success' => false,
                'error' => __( '濡剝婢樺☉鍫熶紖閸旂喕鍏橀張顏勬儙閻?, 'sut-wechat-mini' )
            );
        }
        
        // 閼惧嘲褰嘺ccess_token
        $access_token = $this->get_access_token();
        
        if ( ! $access_token ) {
            return array(
                'success' => false,
                'error' => __( '閼惧嘲褰嘺ccess_token婢惰精瑙?, 'sut-wechat-mini' )
            );
        }
        
        // 閺嬪嫬缂撶拠閿嬬湴URL
        $url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token={$access_token}";
        
        // 閺嬪嫬缂撶拠閿嬬湴閺佺増宓?        $request_data = array(
            'touser' => $openid,
            'template_id' => $template_id,
            'data' => $this->format_template_data( $data ),
        );
        
        // 濞ｈ濮炴い鐢告桨娣団剝浼?        if ( ! empty( $page ) ) {
            $request_data['page'] = $page;
        }
        
        // 濞ｈ濮炵亸蹇曗柤鎼村繋淇婇幁?        if ( ! empty( $miniprogram ) ) {
            $request_data['miniprogram'] = $miniprogram;
        }
        
        // 閸欐垿鈧浇顕Ч?        $response = $this->send_request( $url, $request_data );
        
        // 鐠佹澘缍嶉弮銉ョ箶
        $this->log_message( 'template', $openid, $template_id, $data, $response );
        
        return $response;
    }
    
    /**
     * 閺嶇厧绱￠崠鏍侀弶鎸庢殶閹?     *
     * @param array $data 閸樼喎顫愰弫鐗堝祦
     * @return array 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫭鏆熼幑?     */
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
     * 閸欐垿鈧浇顓归梼鍛Х閹?     *
     * @param string $openid 閻劍鍩沷penid
     * @param string $template_id 濡剝婢業D
     * @param array $data 濡剝婢橀弫鐗堝祦
     * @param string $page 鐠哄疇娴嗘い鐢告桨
     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
    public function send_subscribe_message( $openid, $template_id, $data = array(), $page = '' ) {
        // 鐎圭偤妾稉濠忕礉鐠併垽妲勫☉鍫熶紖鐏忚鲸妲稿Ο鈩冩緲濞戝牊浼呴惃鍕缁?        return $this->send_template_message( $openid, $template_id, $data, $page );
    }
    
    /**
     * 閸欐垿鈧礁顓归張宥嗙Х閹?     *
     * @param string $openid 閻劍鍩沷penid
     * @param array $message 濞戝牊浼呴崘鍛啇
     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
    public function send_customer_message( $openid, $message ) {
        // 閼惧嘲褰嘺ccess_token
        $access_token = $this->get_access_token();
        
        if ( ! $access_token ) {
            return array(
                'success' => false,
                'error' => __( '閼惧嘲褰嘺ccess_token婢惰精瑙?, 'sut-wechat-mini' )
            );
        }
        
        // 閺嬪嫬缂撶拠閿嬬湴URL
        $url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={$access_token}";
        
        // 閺嬪嫬缂撶拠閿嬬湴閺佺増宓?        $request_data = array(
            'touser' => $openid,
        );
        
        // 閸氬牆鑻熷☉鍫熶紖閸愬懎顔?        $request_data = array_merge( $request_data, $message );
        
        // 閸欐垿鈧浇顕Ч?        $response = $this->send_request( $url, $request_data );
        
        // 鐠佹澘缍嶉弮銉ョ箶
        $this->log_message( 'customer', $openid, '', $message, $response );
        
        return $response;
    }
    
    /**
     * 閸欐垿鈧焦鏋冮張顒€顓归張宥嗙Х閹?     *
     * @param string $openid 閻劍鍩沷penid
     * @param string $content 濞戝牊浼呴崘鍛啇
     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
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
     * 閸欐垿鈧礁娴橀悧鍥ь吂閺堝秵绉烽幁?     *
     * @param string $openid 閻劍鍩沷penid
     * @param string $media_id 婵帊缍婭D
     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
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
     * 閸欐垿鈧礁娴橀弬鍥ь吂閺堝秵绉烽幁?     *
     * @param string $openid 閻劍鍩沷penid
     * @param array $articles 閺傚洨鐝烽崚妤勩€?     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
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
     * 閸欐垿鈧礁鐨粙瀣碍閸楋紕澧栫€广垺婀囧☉鍫熶紖
     *
     * @param string $openid 閻劍鍩沷penid
     * @param string $title 閺嶅洭顣?     * @param string $pagepath 妞ょ敻娼扮捄顖氱窞
     * @param string $thumb_media_id 缂傗晝鏆愰崶鎯х崯娴ｆ彂D
     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
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
     * 閸欐垿鈧礁鍞撮柈銊︾Х閹?     *
     * @param int $user_id 閻劍鍩汭D
     * @param string $type 濞戝牊浼呯猾璇茬€?     * @param string $title 濞戝牊浼呴弽鍥暯
     * @param string $content 濞戝牊浼呴崘鍛啇
     * @param array $meta 閸忓啯鏆熼幑?     * @return array 閸欐垿鈧胶绮ㄩ弸?     */
    public function send_internal_message( $user_id, $type, $title, $content, $meta = array() ) {
        global $wpdb;
        
        // 閻㈢喐鍨氬☉鍫熶紖ID
        $message_id = 'msg_' . date( 'YmdHis' ) . '_' . wp_generate_password( 8, false );
        
        // 閹绘帒鍙嗗☉鍫熶紖鐠佹澘缍?        $result = $wpdb->insert(
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
        
        // 鐠佹澘缍嶉弮銉ョ箶
        $this->log_message( 'internal', '', '', compact( 'user_id', 'type', 'title', 'content', 'meta' ), array( 'success' => true ) );
        
        return array(
            'success' => true,
            'message_id' => $message_id
        );
    }
    
    /**
     * 閼惧嘲褰囬悽銊﹀煕濞戝牊浼呴崚妤勩€?     *
     * @param int $user_id 閻劍鍩汭D
     * @param array $args 閺屻儴顕楅崣鍌涙殶
     * @return array 濞戝牊浼呴崚妤勩€?     */
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
        
        // 閺嬪嫬缂撻弻銉嚄閺夆€叉
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
        
        // 閺嬪嫬缂撻幒鎺戠碍
        $orderby = esc_sql( $args['orderby'] );
        $order = esc_sql( $args['order'] );
        
        // 閺嬪嫬缂撻梽鎰煑
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );
        
        // 閹笛嗩攽閺屻儴顕?        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_messages {$where} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_args = array_merge( $query_args, array( $limit, $offset ) );
        
        $messages = $wpdb->get_results( $wpdb->prepare( $sql, $query_args ), ARRAY_A );
        
        // 閼惧嘲褰囬幀缁樻殶
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
     * 閼惧嘲褰囧☉鍫熶紖鐠囷附鍎?     *
     * @param int $user_id 閻劍鍩汭D
     * @param string $message_id 濞戝牊浼匢D
     * @return array|bool 濞戝牊浼呯拠锔藉剰
     */
    public function get_message_detail( $user_id, $message_id ) {
        global $wpdb;
        
        $sql = "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_messages WHERE user_id = %d AND message_id = %s";
        $message = $wpdb->get_row( $wpdb->prepare( $sql, $user_id, $message_id ), ARRAY_A );
        
        if ( $message && $message['is_read'] == 0 ) {
            // 閺嶅洩顔囨稉鍝勫嚒鐠?            $this->mark_message_as_read( $user_id, $message_id );
        }
        
        return $message;
    }
    
    /**
     * 閺嶅洩顔囧☉鍫熶紖娑撳搫鍑＄拠?     *
     * @param int $user_id 閻劍鍩汭D
     * @param string $message_id 濞戝牊浼匢D
     * @return bool 閹垮秳缍旂紒鎾寸亯
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
     * 閺嶅洩顔囬幍鈧張澶嬬Х閹垯璐熷鑼额嚢
     *
     * @param int $user_id 閻劍鍩汭D
     * @return bool 閹垮秳缍旂紒鎾寸亯
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
     * 閸掔娀娅庡☉鍫熶紖
     *
     * @param int $user_id 閻劍鍩汭D
     * @param string $message_id 濞戝牊浼匢D
     * @return bool 閹垮秳缍旂紒鎾寸亯
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
     * 閼惧嘲褰囬張顏囶嚢濞戝牊浼呴弫浼村櫤
     *
     * @param int $user_id 閻劍鍩汭D
     * @param string $type 濞戝牊浼呯猾璇茬€?     * @return int 閺堫亣顕板☉鍫熶紖閺佷即鍣?     */
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
     * 婢跺嫮鎮婄拋銏犲礋閻樿埖鈧礁褰夐弴?     *
     * @param int $order_id 鐠併垹宕烮D
     * @param string $old_status 閺冄呭Ц閹?     * @param string $new_status 閺傛壆濮搁幀?     */
    public function on_order_status_changed( $order_id, $old_status, $new_status ) {
        // 閼惧嘲褰囩拋銏犲礋
        $order = wc_get_order( $order_id );
        
        if ( ! $order ) {
            return;
        }
        
        // 閼惧嘲褰囬悽銊﹀煕ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 閼惧嘲褰囩亸蹇曗柤鎼村繒鏁ら幋铚備繆閹?        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $user_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        $openid = $mini_user['openid'];
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 閺嶈宓佺拋銏犲礋閻樿埖鈧礁褰傞柅浣风瑝閸氬瞼娈戦柅姘辩叀
        switch ( $new_status ) {
            case 'processing':
            case 'on-hold':
                // 鐠併垹宕熷鍙夋暜娴?                if ( $old_status !== $new_status && in_array( $old_status, array( 'pending', 'failed' ) ) ) {
                    $template_id = isset( $settings['template_message_order_paid'] ) ? $settings['template_message_order_paid'] : '';
                    
                    if ( ! empty( $template_id ) ) {
                        $data = array(
                            'thing1' => array('value' => $order->get_order_number()),
                            'amount2' => array('value' => wc_price( $order->get_total() )),
                            'time3' => array('value' => $order->get_date_paid()->format( 'Y-m-d H:i:s' )),
                            'thing4' => array('value' => __( '閹劎娈戠拋銏犲礋瀹稿弶鏁禒妯诲灇閸旂噦绱濋幋鎴滄粦鐏忓棗鏁栬箛顐¤礋閹劌褰傜拹?, 'sut-wechat-mini' ))
                        );
                        
                        $page = 'pages/order/detail?id=' . $order_id;
                        
                        $this->send_template_message( $openid, $template_id, $data, $page );
                    }
                    
                    // 閸欐垿鈧礁鍞撮柈銊︾Х閹?                    $this->send_internal_message(
                        $user_id,
                        'order_paid',
                        __( '鐠併垹宕熷鍙夋暜娴?, 'sut-wechat-mini' ),
                        sprintf( __( '閹劎娈戠拋銏犲礋 %s 瀹稿弶鏁禒妯诲灇閸旂噦绱濋幋鎴滄粦鐏忓棗鏁栬箛顐¤礋閹劌褰傜拹褋鈧?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'shipped':
            case 'completed':
                // 鐠併垹宕熷鎻掑絺鐠?                if ( $old_status !== $new_status && in_array( $old_status, array( 'processing', 'on-hold' ) ) ) {
                    $template_id = isset( $settings['template_message_order_shipped'] ) ? $settings['template_message_order_shipped'] : '';
                    
                    if ( ! empty( $template_id ) ) {
                        $data = array(
                            'thing1' => array('value' => $order->get_order_number()),
                            'thing2' => array('value' => $order->get_shipping_method() ? $order->get_shipping_method() : __( '韫囶偊鈧?, 'sut-wechat-mini' )),
                            'thing3' => array('value' => $order->get_meta( '_tracking_number', true ) ? $order->get_meta( '_tracking_number', true ) : __( '瀵板懓藟閸?, 'sut-wechat-mini' )),
                            'time4' => array('value' => current_time( 'mysql' ))
                        );
                        
                        $page = 'pages/order/detail?id=' . $order_id;
                        
                        $this->send_template_message( $openid, $template_id, $data, $page );
                    }
                    
                    // 閸欐垿鈧礁鍞撮柈銊︾Х閹?                    $this->send_internal_message(
                        $user_id,
                        'order_shipped',
                        __( '鐠併垹宕熷鎻掑絺鐠?, 'sut-wechat-mini' ),
                        sprintf( __( '閹劎娈戠拋銏犲礋 %s 瀹告彃褰傜拹褝绱濈拠閿嬫暈閹板繑鐓￠弨韬测偓?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'completed':
                // 鐠併垹宕熷鎻掔暚閹?                if ( $old_status !== $new_status ) {
                    // 閸欐垿鈧礁鍞撮柈銊︾Х閹?                    $this->send_internal_message(
                        $user_id,
                        'order_completed',
                        __( '鐠併垹宕熷鎻掔暚閹?, 'sut-wechat-mini' ),
                        sprintf( __( '閹劎娈戠拋銏犲礋 %s 瀹告彃鐣幋鎰剁礉閹扮喕闃块幃銊ф畱鐠愵厺鎷遍敍?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'cancelled':
                // 鐠併垹宕熷鎻掑絿濞?                if ( $old_status !== $new_status ) {
                    // 閸欐垿鈧礁鍞撮柈銊︾Х閹?                    $this->send_internal_message(
                        $user_id,
                        'order_cancelled',
                        __( '鐠併垹宕熷鎻掑絿濞?, 'sut-wechat-mini' ),
                        sprintf( __( '閹劎娈戠拋銏犲礋 %s 瀹告彃褰囧☉鍫礉婵″倹婀侀悿鎴︽６鐠囩柉浠堢化璇差吂閺堝秲鈧?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
                
            case 'refunded':
                // 鐠併垹宕熷鏌モ偓鈧▎?                if ( $old_status !== $new_status ) {
                    // 閸欐垿鈧礁鍞撮柈銊︾Х閹?                    $this->send_internal_message(
                        $user_id,
                        'order_refunded',
                        __( '鐠併垹宕熷鏌モ偓鈧▎?, 'sut-wechat-mini' ),
                        sprintf( __( '閹劎娈戠拋銏犲礋 %s 瀹告煡鈧偓濞嗘拝绱濋柅鈧▎鎯х殺閸?-7娑擃亜浼愭担婊勬）閸愬懎甯捄顖濈箲閸ョ偞鍋嶉惃鍕暜娴犳澶勯幋鏋偓?, 'sut-wechat-mini' ), $order->get_order_number() )
                    );
                }
                break;
        }
    }
    
    /**
     * 婢跺嫮鎮婇柅鈧▎鎯у灡瀵?     *
     * @param int $refund_id 闁偓濞嗙盯D
     * @param WC_Order $order 鐠併垹宕熺€电钖?     */
    public function on_refund_created( $refund_id, $order ) {
        // 閼惧嘲褰囬悽銊﹀煕ID
        $user_id = $order->get_user_id();
        
        if ( $user_id <= 0 ) {
            return;
        }
        
        // 閼惧嘲褰囩亸蹇曗柤鎼村繒鏁ら幋铚備繆閹?        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $user_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        $openid = $mini_user['openid'];
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 閸欐垿鈧線鈧偓濞嗙偓鍨氶崝鐔尖偓姘辩叀
        $template_id = isset( $settings['template_message_refund_success'] ) ? $settings['template_message_refund_success'] : '';
        
        if ( ! empty( $template_id ) ) {
            $refund = wc_get_refund( $refund_id );
            $refund_amount = $refund ? $refund->get_amount() : 0;
            
            $data = array(
                'thing1' => array('value' => $order->get_order_number()),
                'amount2' => array('value' => wc_price( $refund_amount )),
                'time3' => array('value' => current_time( 'mysql' )),
                'thing4' => array('value' => __( '閹劎娈戦柅鈧▎鎯у嚒婢跺嫮鎮婄€瑰本鍨氶敍宀勨偓鈧▎鎯х殺閸?-7娑擃亜浼愭担婊勬）閸愬懎甯捄顖濈箲閸ョ偞鍋嶉惃鍕暜娴犳澶勯幋?, 'sut-wechat-mini' ))
            );
            
            $page = 'pages/order/detail?id=' . $order->get_id();
            
            $this->send_template_message( $openid, $template_id, $data, $page );
        }
    }
    
    /**
     * 婢跺嫮鎮婄拠鍕啈閸欐垵绔?     *
     * @param int $comment_id 鐠囧嫯顔慖D
     * @param int $comment_approved 鐠囧嫯顔戦弰顖氭儊鐞氼偅澹掗崙?     * @param array $commentdata 鐠囧嫯顔戦弫鐗堝祦
     */
    public function on_comment_post( $comment_id, $comment_approved, $commentdata ) {
        // 婵″倹鐏夌拠鍕啈閺堫亣顫﹂幍鐟板櫙閿涘奔绗夐崣鎴︹偓渚€鈧氨鐓?        if ( $comment_approved != 1 ) {
            return;
        }
        
        // 閼惧嘲褰囩拠鍕啈
        $comment = get_comment( $comment_id );
        
        if ( ! $comment ) {
            return;
        }
        
        // 閼惧嘲褰囬弬鍥╃彿娴ｆ粏鈧將D
        $post_id = $comment->comment_post_ID;
        $post = get_post( $post_id );
        
        if ( ! $post ) {
            return;
        }
        
        $author_id = $post->post_author;
        
        // 閼惧嘲褰囩亸蹇曗柤鎼村繒鏁ら幋铚備繆閹?        global $wpdb;
        $mini_user = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}sut_wechat_mini_users WHERE user_id = %d", $author_id ), ARRAY_A );
        
        if ( ! $mini_user || empty( $mini_user['openid'] ) ) {
            return;
        }
        
        // 閸欐垿鈧礁鍞撮柈銊︾Х閹?        $this->send_internal_message(
            $author_id,
            'comment',
            __( '閺堝鏌婇惃鍕槑鐠?, 'sut-wechat-mini' ),
            sprintf( 
                __( '閹劎娈戦弬鍥╃彿閵?s閵嗗鏁归崚棰佺啊娑撯偓閺夆剝鏌婄拠鍕啈閿?s', 'sut-wechat-mini' ), 
                $post->post_title, 
                $comment->comment_content 
            ),
            array( 'post_id' => $post_id, 'comment_id' => $comment_id )
        );
    }
    
    /**
     * 婢跺嫮鎮婇弬鍥╃彿閸欐垵绔?     *
     * @param int $post_id 閺傚洨鐝稩D
     * @param WP_Post $post 閺傚洨鐝风€电钖?     */
    public function on_post_published( $post_id, $post ) {
        // 濡偓閺屻儲妲搁崥锔芥Ц妫ｆ牗顐奸崣鎴濈
        if ( $post->post_date !== $post->post_modified ) {
            return;
        }
        
        // 閼惧嘲褰囬幍鈧張澶庮吂闂冨懓顕氶崚鍡欒閻ㄥ嫮鏁ら幋?        $categories = wp_get_post_categories( $post_id );
        
        if ( empty( $categories ) ) {
            return;
        }
        
        global $wpdb;
        
        // 閺屻儴顕楃拋銏ゆ娴滃棜绻栨禍娑樺瀻缁崵娈戦悽銊﹀煕
        $category_placeholders = implode( ',', array_fill( 0, count( $categories ), '%d' ) );
        $sql = "SELECT DISTINCT user_id FROM {$wpdb->prefix}sut_wechat_mini_user_favorites WHERE object_type = 'category' AND object_id IN ({$category_placeholders})";
        $user_ids = $wpdb->get_col( $wpdb->prepare( $sql, $categories ) );
        
        if ( empty( $user_ids ) ) {
            return;
        }
        
        // 閸氭垶鐦℃稉顏嗘暏閹村嘲褰傞柅渚€鈧氨鐓?        foreach ( $user_ids as $user_id ) {
            $this->send_internal_message(
                $user_id,
                'new_post',
                __( '閺堝鏌婇弬鍥╃彿閸欐垵绔?, 'sut-wechat-mini' ),
                sprintf( __( '閹劏顓归梼鍛畱閸掑棛琚張澶嬫煀閺傚洨鐝烽崣鎴濈閿涙哎鈧?s閵?, 'sut-wechat-mini' ), $post->post_title ),
                array( 'post_id' => $post_id )
            );
        }
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕缁涙儳鍩?     *
     * @param int $user_id 閻劍鍩汭D
     */
    public function on_user_checked_in( $user_id ) {
        // 閸欐垿鈧礁鍞撮柈銊︾Х閹?        $this->send_internal_message(
            $user_id,
            'checkin',
            __( '缁涙儳鍩岄幋鎰', 'sut-wechat-mini' ),
            __( '閹厼鏋╅幃銊ь劮閸掔増鍨氶崝鐕傜礉閼惧嘲绶辩粔顖氬瀻婵傛牕濮抽敍?, 'sut-wechat-mini' )
        );
    }
    
    /**
     * 婢跺嫮鎮婇悽銊﹀煕缁夘垰鍨庢晶鐐插
     *
     * @param int $user_id 閻劍鍩汭D
     * @param int $points 缁夘垰鍨庨弫浼村櫤
     * @param string $source 缁夘垰鍨庨弶銉︾爱
     */
    public function on_user_points_added( $user_id, $points, $source ) {
        // 閸欐垿鈧礁鍞撮柈銊︾Х閹?        $this->send_internal_message(
            $user_id,
            'points',
            __( '缁夘垰鍨庨崣妯哄З', 'sut-wechat-mini' ),
            sprintf( __( '閹劎娈戠拹锔藉煕閼惧嘲绶辨禍?%d 缁夘垰鍨庨敍灞炬降濠ф劧绱?s', 'sut-wechat-mini' ), $points, $source )
        );
    }
    
    /**
     * 閼惧嘲褰嘺ccess_token
     *
     * @return string|bool access_token閹存潊alse
     */
    private function get_access_token() {
        // 鐏忔繆鐦禒搴ｇ处鐎涙骞忛崣?        $access_token = get_transient( 'sut_wechat_mini_access_token' );
        
        if ( $access_token ) {
            return $access_token;
        }
        
        // 閼惧嘲褰嘺pp_id閸滃畮pp_secret
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $app_id = isset( $settings['app_id'] ) ? $settings['app_id'] : '';
        $app_secret = isset( $settings['app_secret'] ) ? $settings['app_secret'] : '';
        
        if ( empty( $app_id ) || empty( $app_secret ) ) {
            return false;
        }
        
        // 閸欐垿鈧浇顕Ч鍌濆箯閸欐溂ccess_token
        $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$app_id}&secret={$app_secret}";
        $response = wp_remote_get( $url, array( 'timeout' => 10 ) );
        
        if ( is_wp_error( $response ) ) {
            return false;
        }
        
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        if ( isset( $data['access_token'] ) ) {
            // 缂傛挸鐡╝ccess_token閿涘牊婀侀弫鍫熸埂閸?0閸掑棝鎸撻敍宀勪缉閸忓秷绻冮張鐕傜礆
            $expires_in = isset( $data['expires_in'] ) ? $data['expires_in'] : 7200;
            set_transient( 'sut_wechat_mini_access_token', $data['access_token'], $expires_in - 600 );
            
            return $data['access_token'];
        }
        
        return false;
    }
    
    /**
     * 閸欐垿鈧笭TTP鐠囬攱鐪?     *
     * @param string $url 鐠囬攱鐪癠RL
     * @param array $data 鐠囬攱鐪伴弫鐗堝祦
     * @return array 閸濆秴绨茬紒鎾寸亯
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
                'error' => isset( $result['errmsg'] ) ? $result['errmsg'] : __( '閺堫亞鐓￠柨娆掝嚖', 'sut-wechat-mini' ),
                'errcode' => $result['errcode']
            );
        }
        
        return array(
            'success' => true,
            'data' => $result
        );
    }
    
    /**
     * 鐠佹澘缍嶅☉鍫熶紖閺冦儱绻?     *
     * @param string $type 濞戝牊浼呯猾璇茬€?     * @param string $openid 閻劍鍩沷penid
     * @param string $template_id 濡剝婢業D
     * @param array $data 濞戝牊浼呴弫鐗堝祦
     * @param array $response 閸濆秴绨茬紒鎾寸亯
     */
    private function log_message( $type, $openid, $template_id, $data, $response ) {
        // 婵″倹鐏夐張顏勬儙閻劍妫╄箛妤嬬礉閻╁瓨甯存潻鏂挎礀
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( ! isset( $settings['enable_log'] ) || $settings['enable_log'] != 1 ) {
            return;
        }
        
        // 鐠佹澘缍嶉弮銉ョ箶
        $log_data = array(
            'type' => $type,
            'openid' => $openid,
            'template_id' => $template_id,
            'data' => $data,
            'response' => $response,
            'timestamp' => current_time( 'mysql' )
        );
        
        error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑绉烽幁顖涘腹闁? ' . json_encode( $log_data ) );
    }
}\n