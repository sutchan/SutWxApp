锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繑鏁禒姗€娉﹂幋鎰
 *
 * 婢跺嫮鎮婂顔讳繆閺€顖欑帛閻╃鍙ч崝鐔诲厴閿涘苯瀵橀幏顒佹暜娴犳ê鍨卞鎭掆偓浣告礀鐠嬪啫顦╅悶鍡欑搼
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Pay 缁? */
class SUT_WeChat_Mini_Pay {
    
    /**
     * 閺€顖欑帛闂嗗棙鍨氱€圭偘绶?     *
     * @var SUT_WeChat_Mini_Pay
     */
    private static $instance = null;
    
    /**
     * 瀵邦喕淇婇弨顖欑帛闁板秶鐤?     *
     * @var array
     */
    private $config = array();
    
    /**
     * 閺嬪嫰鈧姴鍤遍弫?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 閼惧嘲褰囬崡鏇氱伐鐎圭偘绶?     *
     * @return SUT_WeChat_Mini_Pay
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 閸掓繂顫愰崠鏍ㄦ暜娴犳﹢鍘ょ純?     */
    private function init() {
        // 閼惧嘲褰囬弨顖欑帛闁板秶鐤?        $this->config = array(
            'app_id' => get_option( 'sut_wechat_mini_app_id', '' ),
            'mch_id' => get_option( 'sut_wechat_mini_mch_id', '' ),
            'api_key' => get_option( 'sut_wechat_mini_api_key', '' ),
            'notify_url' => home_url( '/sut-wechat-mini-api/payment/notify' ),
            'cert_path' => get_option( 'sut_wechat_mini_cert_path', '' ),
            'key_path' => get_option( 'sut_wechat_mini_key_path', '' ),
            'sandbox' => get_option( 'sut_wechat_mini_pay_sandbox', false ),
        );
        
        // 濞夈劌鍞介弨顖欑帛閻╃鍙ч惃鍕啎缂冾噣銆?        add_filter( 'sut_wechat_mini_settings', array( $this, 'add_payment_settings' ) );
        
        // 濞夈劌鍞介弨顖欑帛閻╃鍙ч惃鍑橮I鐠侯垳鏁?        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_payment_routes' ) );
    }
    
    /**
     * 濞ｈ濮為弨顖欑帛閻╃鍙ч惃鍕啎缂冾噣銆?     *
     * @param array $settings 閻滅増婀佺拋鍓х枂妞?     * @return array 娣囶喗鏁奸崥搴ｆ畱鐠佸墽鐤嗘い?     */
    public function add_payment_settings( $settings ) {
        $payment_settings = array(
            'title' => __( '閺€顖欑帛鐠佸墽鐤?, 'sut-wechat-mini' ),
            'fields' => array(
                array(
                    'id' => 'mch_id',
                    'title' => __( '閸熷棙鍩汭D', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '瀵邦喕淇婇弨顖欑帛閸熷棙鍩汭D', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'api_key',
                    'title' => __( 'API鐎靛棝鎸?, 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '瀵邦喕淇婇弨顖欑帛API鐎靛棝鎸?, 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'cert_path',
                    'title' => __( '鐠囦椒鍔熺捄顖氱窞', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '瀵邦喕淇婇弨顖欑帛鐠囦椒鍔熺捄顖氱窞閿涘牏绮风€电鐭惧鍕剁礆', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'key_path',
                    'title' => __( '鐎靛棝鎸滅捄顖氱窞', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '瀵邦喕淇婇弨顖欑帛鐎靛棝鎸滅捄顖氱窞閿涘牏绮风€电鐭惧鍕剁礆', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'pay_sandbox',
                    'title' => __( '濞屾瑧顔堝Ο鈥崇础', 'sut-wechat-mini' ),
                    'type' => 'checkbox',
                    'desc' => __( '瀵偓閸氼垱鐭欑粻杈ㄧゴ鐠囨洘膩瀵?, 'sut-wechat-mini' ),
                    'default' => false,
                ),
            ),
        );
        
        $settings['payment'] = $payment_settings;
        
        return $settings;
    }
    
    /**
     * 濞ｈ濮為弨顖欑帛閻╃鍙ч惃鍑橮I鐠侯垳鏁?     *
     * @param array $routes 閻滅増婀佺捄顖滄暠
     * @return array 娣囶喗鏁奸崥搴ｆ畱鐠侯垳鏁?     */
    public function add_payment_routes( $routes ) {
        // 閺€顖欑帛閻╃鍙PI鐠侯垳鏁卞鑼病閸︹晸ooCommerce闂嗗棙鍨氱猾璁宠厬濞ｈ濮?        return $routes;
    }
    
    /**
     * 閸掓稑缂撻弨顖欑帛
     *
     * @param WC_Order $order 鐠併垹宕熺€电钖?     * @param int $user_id 閻劍鍩汭D
     * @return array|WP_Error 閺€顖欑帛閸欏倹鏆熼幋鏍晩鐠囶垰顕挒?     */
    public function create_payment( $order, $user_id ) {
        // 濡偓閺屻儲鏁禒姗€鍘ょ純顔芥Ц閸氾箑鐣弫?        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '閺€顖欑帛闁板秶鐤嗘稉宥呯暚閺?, 'sut-wechat-mini' ) );
        }
        
        // 閼惧嘲褰囬悽銊﹀煕閻ㄥ埣penid
        $openid = get_user_meta( $user_id, '_sut_wechat_mini_openid', true );
        
        if ( empty( $openid ) ) {
            return new WP_Error( 'openid_not_found', __( '閻劍鍩涘顔讳繆娣団剝浼呴張顏呭閸?, 'sut-wechat-mini' ) );
        }
        
        // 閺嬪嫬缂撶紒鐔剁娑撳宕熼崣鍌涙殶
        $nonce_str = $this->generate_nonce_str();
        $total_fee = intval( $order->get_total() * 100 ); // 鏉烆剚宕叉稉鍝勫瀻
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
            'body' => $this->get_order_description( $order ),
            'out_trade_no' => $order->get_order_number(),
            'total_fee' => $total_fee,
            'spbill_create_ip' => $this->get_client_ip(),
            'notify_url' => $this->config['notify_url'],
            'trade_type' => 'JSAPI',
            'openid' => $openid,
        );
        
        // 濞ｈ濮炲▽娆戭唸濡€崇础閸欏倹鏆?        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 閻㈢喐鍨氱粵鎯ф倳
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 鏉烆剚宕叉稉绡∕L
        $xml = $this->array_to_xml( $params );
        
        // 閸欐垿鈧浇顕Ч鍌氬煂瀵邦喕淇婇弨顖欑帛閺堝秴濮熼崳?        $gateway_url = $this->get_gateway_url( 'unifiedorder' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 鐟欙絾鐎絏ML閸濆秴绨?        $result = $this->xml_to_array( $response );
        
        // 濡偓閺屻儱鎼锋惔鏃傜波閺?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '鐠囬攱鐪版径杈Е', 'sut-wechat-mini' );
            return new WP_Error( 'payment_request_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '娑撴艾濮熸径鍕倞婢惰精瑙?, 'sut-wechat-mini' );
            return new WP_Error( 'payment_business_failed', $error_msg );
        }
        
        // 閻㈢喐鍨氱亸蹇曗柤鎼村繑鏁禒妯哄棘閺?        $time_stamp = (string) time();
        $package = 'prepay_id=' . $result['prepay_id'];
        $pay_sign = $this->generate_pay_sign( $time_stamp, $nonce_str, $package );
        
        $payment_params = array(
            'timeStamp' => $time_stamp,
            'nonceStr' => $nonce_str,
            'package' => $package,
            'signType' => 'MD5',
            'paySign' => $pay_sign,
            'appId' => $this->config['app_id'],
        );
        
        return $payment_params;
    }
    
    /**
     * 妤犲矁鐦夐弨顖欑帛閸ョ偠鐨熺粵鎯ф倳
     *
     * @param array $data 閸ョ偠鐨熼弫鐗堝祦
     * @return bool 妤犲矁鐦夌紒鎾寸亯
     */
    public function verify_notify_sign( $data ) {
        // 婢跺秴鍩楅弫鐗堝祦閿涘瞼些闂勵槞ign鐎涙顔?        $params = $data;
        if ( isset( $params['sign'] ) ) {
            unset( $params['sign'] );
        }
        
        // 閻㈢喐鍨氱粵鎯ф倳
        $sign = $this->generate_sign( $params );
        
        // 濮ｆ棁绶濈粵鎯ф倳
        return $sign === $data['sign'];
    }
    
    /**
     * 閺屻儴顕楃拋銏犲礋
     *
     * @param string $out_trade_no 閸熷棙鍩涚拋銏犲礋閸?     * @return array|WP_Error 閺屻儴顕楃紒鎾寸亯閹存牠鏁婄拠顖氼嚠鐠?     */
    public function query_order( $out_trade_no ) {
        // 濡偓閺屻儲鏁禒姗€鍘ょ純顔芥Ц閸氾箑鐣弫?        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '閺€顖欑帛闁板秶鐤嗘稉宥呯暚閺?, 'sut-wechat-mini' ) );
        }
        
        // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $out_trade_no,
            'nonce_str' => $nonce_str,
        );
        
        // 濞ｈ濮炲▽娆戭唸濡€崇础閸欏倹鏆?        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 閻㈢喐鍨氱粵鎯ф倳
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 鏉烆剚宕叉稉绡∕L
        $xml = $this->array_to_xml( $params );
        
        // 閸欐垿鈧浇顕Ч鍌氬煂瀵邦喕淇婇弨顖欑帛閺堝秴濮熼崳?        $gateway_url = $this->get_gateway_url( 'orderquery' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 鐟欙絾鐎絏ML閸濆秴绨?        $result = $this->xml_to_array( $response );
        
        // 濡偓閺屻儱鎼锋惔鏃傜波閺?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '閺屻儴顕楁径杈Е', 'sut-wechat-mini' );
            return new WP_Error( 'query_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '娑撴艾濮熸径鍕倞婢惰精瑙?, 'sut-wechat-mini' );
            return new WP_Error( 'query_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 閸忔娊妫寸拋銏犲礋
     *
     * @param string $out_trade_no 閸熷棙鍩涚拋銏犲礋閸?     * @return array|WP_Error 閸忔娊妫寸紒鎾寸亯閹存牠鏁婄拠顖氼嚠鐠?     */
    public function close_order( $out_trade_no ) {
        // 濡偓閺屻儲鏁禒姗€鍘ょ純顔芥Ц閸氾箑鐣弫?        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '閺€顖欑帛闁板秶鐤嗘稉宥呯暚閺?, 'sut-wechat-mini' ) );
        }
        
        // 閺嬪嫬缂撻崗鎶芥４閸欏倹鏆?        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $out_trade_no,
            'nonce_str' => $nonce_str,
        );
        
        // 濞ｈ濮炲▽娆戭唸濡€崇础閸欏倹鏆?        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 閻㈢喐鍨氱粵鎯ф倳
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 鏉烆剚宕叉稉绡∕L
        $xml = $this->array_to_xml( $params );
        
        // 閸欐垿鈧浇顕Ч鍌氬煂瀵邦喕淇婇弨顖欑帛閺堝秴濮熼崳?        $gateway_url = $this->get_gateway_url( 'closeorder' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 鐟欙絾鐎絏ML閸濆秴绨?        $result = $this->xml_to_array( $response );
        
        // 濡偓閺屻儱鎼锋惔鏃傜波閺?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '閸忔娊妫存径杈Е', 'sut-wechat-mini' );
            return new WP_Error( 'close_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '娑撴艾濮熸径鍕倞婢惰精瑙?, 'sut-wechat-mini' );
            return new WP_Error( 'close_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 閻㈠疇顕柅鈧▎?     *
     * @param string $out_trade_no 閸熷棙鍩涚拋銏犲礋閸?     * @param string $out_refund_no 閸熷棙鍩涢柅鈧▎鎯у礋閸?     * @param float $total_fee 鐠併垹宕熼幀濠氬櫨妫?     * @param float $refund_fee 闁偓濞嗛箖鍣炬０?     * @return array|WP_Error 闁偓濞嗗墽绮ㄩ弸婊勫灗闁挎瑨顕ょ€电钖?     */
    public function refund( $out_trade_no, $out_refund_no, $total_fee, $refund_fee ) {
        // 濡偓閺屻儲鏁禒姗€鍘ょ純顔芥Ц閸氾箑鐣弫?        if ( ! $this->is_config_valid( true ) ) {
            return new WP_Error( 'payment_config_invalid', __( '閺€顖欑帛闁板秶鐤嗘稉宥呯暚閺佸瓨鍨ㄧ拠浣峰姛娑撳秴鐡ㄩ崷?, 'sut-wechat-mini' ) );
        }
        
        // 鏉烆剚宕查柌鎴︻杺娑撳搫鍨?        $total_fee = intval( $total_fee * 100 );
        $refund_fee = intval( $refund_fee * 100 );
        
        // 閺嬪嫬缂撻柅鈧▎鎯у棘閺?        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
            'out_trade_no' => $out_trade_no,
            'out_refund_no' => $out_refund_no,
            'total_fee' => $total_fee,
            'refund_fee' => $refund_fee,
            'refund_desc' => __( '閻劍鍩涢悽瀹狀嚞闁偓濞?, 'sut-wechat-mini' ),
        );
        
        // 濞ｈ濮炲▽娆戭唸濡€崇础閸欏倹鏆?        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 閻㈢喐鍨氱粵鎯ф倳
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 鏉烆剚宕叉稉绡∕L
        $xml = $this->array_to_xml( $params );
        
        // 閸欐垿鈧浇顕Ч鍌氬煂瀵邦喕淇婇弨顖欑帛閺堝秴濮熼崳顭掔礄闂団偓鐟曚浇鐦夋稊锔肩礆
        $gateway_url = $this->get_gateway_url( 'refund' );
        $response = $this->send_request_with_cert( $gateway_url, $xml );
        
        // 鐟欙絾鐎絏ML閸濆秴绨?        $result = $this->xml_to_array( $response );
        
        // 濡偓閺屻儱鎼锋惔鏃傜波閺?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '闁偓濞嗗墽鏁电拠宄般亼鐠?, 'sut-wechat-mini' );
            return new WP_Error( 'refund_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '娑撴艾濮熸径鍕倞婢惰精瑙?, 'sut-wechat-mini' );
            return new WP_Error( 'refund_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 濡偓閺屻儲鏁禒姗€鍘ょ純顔芥Ц閸氾附婀侀弫?     *
     * @param bool $check_cert 閺勵垰鎯佸Λ鈧弻銉ㄧ槈娑?     * @return bool 闁板秶鐤嗛弰顖氭儊閺堝鏅?     */
    private function is_config_valid( $check_cert = false ) {
        // 濡偓閺屻儱鐔€閺堫剟鍘ょ純?        if ( empty( $this->config['app_id'] ) || empty( $this->config['mch_id'] ) || empty( $this->config['api_key'] ) ) {
            return false;
        }
        
        // 濡偓閺屻儴鐦夋稊锕傚帳缂冾噯绱欐俊鍌涚亯闂団偓鐟曚緤绱?        if ( $check_cert && ( empty( $this->config['cert_path'] ) || empty( $this->config['key_path'] ) || ! file_exists( $this->config['cert_path'] ) || ! file_exists( $this->config['key_path'] ) ) ) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 閻㈢喐鍨氶梾蹇旀簚鐎涙顑佹稉?     *
     * @param int $length 鐎涙顑佹稉鏌ユ毐鎼?     * @return string 闂呭繑婧€鐎涙顑佹稉?     */
    private function generate_nonce_str( $length = 32 ) {
        $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        $str = "";
        for ( $i = 0; $i < $length; $i++ ) {
            $str .= substr( $chars, mt_rand( 0, strlen( $chars ) - 1 ), 1 );
        }
        return $str;
    }
    
    /**
     * 閻㈢喐鍨氱粵鎯ф倳
     *
     * @param array $params 閸欏倹鏆熼弫鎵矋
     * @return string 缁涙儳鎮?     */
    private function generate_sign( $params ) {
        // 閹稿鐡ч崗绋跨碍閹烘帒绨?        ksort( $params );
        
        // 閹峰吋甯寸€涙顑佹稉?        $string = '';
        foreach ( $params as $key => $value ) {
            if ( $value && $key != 'sign' ) {
                $string .= $key . '=' . $value . '&';
            }
        }
        
        // 濞ｈ濮濧PI鐎靛棝鎸?        $string .= 'key=' . $this->config['api_key'];
        
        // MD5閸旂姴鐦戦獮鎯版祮閹诡澀璐熸径褍鍟?        $sign = strtoupper( md5( $string ) );
        
        return $sign;
    }
    
    /**
     * 閻㈢喐鍨氶弨顖欑帛缁涙儳鎮曢敍鍫濈毈缁嬪绨粩顖欏▏閻㈩煉绱?     *
     * @param string $time_stamp 閺冨爼妫块幋?     * @param string $nonce_str 闂呭繑婧€鐎涙顑佹稉?     * @param string $package 鐠併垹宕熼崠?     * @return string 閺€顖欑帛缁涙儳鎮?     */
    private function generate_pay_sign( $time_stamp, $nonce_str, $package ) {
        // 閺嬪嫬缂撶粵鎯ф倳閸欏倹鏆?        $params = array(
            'appId' => $this->config['app_id'],
            'timeStamp' => $time_stamp,
            'nonceStr' => $nonce_str,
            'package' => $package,
            'signType' => 'MD5',
        );
        
        // 閹稿鐡ч崗绋跨碍閹烘帒绨?        ksort( $params );
        
        // 閹峰吋甯寸€涙顑佹稉?        $string = '';
        foreach ( $params as $key => $value ) {
            $string .= $key . '=' . $value . '&';
        }
        
        // 濞ｈ濮濧PI鐎靛棝鎸?        $string .= 'key=' . $this->config['api_key'];
        
        // MD5閸旂姴鐦戦獮鎯版祮閹诡澀璐熸径褍鍟?        $sign = strtoupper( md5( $string ) );
        
        return $sign;
    }
    
    /**
     * 閼惧嘲褰囩拋銏犲礋閹诲繗鍫?     *
     * @param WC_Order $order 鐠併垹宕熺€电钖?     * @return string 鐠併垹宕熼幓蹇氬牚
     */
    private function get_order_description( $order ) {
        $site_name = get_bloginfo( 'name' );
        $description = sprintf( __( '%s - 鐠併垹宕?%s', 'sut-wechat-mini' ), $site_name, $order->get_order_number() );
        
        // 闂勬劕鍩楅幓蹇氬牚闂€鍨
        if ( strlen( $description ) > 127 ) {
            $description = substr( $description, 0, 124 ) . '...';
        }
        
        return $description;
    }
    
    /**
     * 閼惧嘲褰囩€广垺鍩涚粩鐤楶閸︽澘娼?     *
     * @return string IP閸︽澘娼?     */
    private function get_client_ip() {
        $ip = '';
        if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // 婢跺嫮鎮婃径姘嚋IP閸︽澘娼冮惃鍕剰閸?        if ( strpos( $ip, ',' ) !== false ) {
            $ips = explode( ',', $ip );
            $ip = trim( $ips[0] );
        }
        
        return $ip;
    }
    
    /**
     * 閼惧嘲褰囧顔讳繆閺€顖欑帛缂冩垵鍙RL
     *
     * @param string $api_name API閸氬秶袨
     * @return string 缂冩垵鍙RL
     */
    private function get_gateway_url( $api_name ) {
        $base_url = $this->config['sandbox'] ? 'https://api.mch.weixin.qq.com/sandboxnew/' : 'https://api.mch.weixin.qq.com/pay/';
        return $base_url . $api_name . '.php';
    }
    
    /**
     * 閼惧嘲褰囧▽娆戭唸閻滎垰顣ㄩ惃鍓唅gnkey
     *
     * @return string 濞屾瑧顔坰ignkey
     */
    private function get_sandbox_signkey() {
        // 閺嬪嫬缂撶拠閿嬬湴閸欏倹鏆?        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
        );
        
        // 閻㈢喐鍨氱粵鎯ф倳
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 鏉烆剚宕叉稉绡∕L
        $xml = $this->array_to_xml( $params );
        
        // 閸欐垿鈧浇顕Ч?        $url = 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey';
        $response = $this->send_request( $url, $xml );
        
        // 鐟欙絾鐎介崫宥呯安
        $result = $this->xml_to_array( $response );
        
        // 鏉╂柨娲杝ignkey
        if ( $result && $result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS' ) {
            return $result['sandbox_signkey'];
        }
        
        return '';
    }
    
    /**
     * 閸欐垿鈧笭TTP鐠囬攱鐪?     *
     * @param string $url 鐠囬攱鐪癠RL
     * @param string $data 鐠囬攱鐪伴弫鐗堝祦
     * @return string 閸濆秴绨查弫鐗堝祦
     */
    private function send_request( $url, $data ) {
        $ch = curl_init();
        
        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_POST, 1 );
        curl_setopt( $ch, CURLOPT_POSTFIELDS, $data );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 0 );
        curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
        
        $response = curl_exec( $ch );
        
        if ( curl_errno( $ch ) ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑鏁禒妯款嚞濮瑰倿鏁婄拠? ' . curl_error( $ch ) );
        }
        
        curl_close( $ch );
        
        return $response;
    }
    
    /**
     * 閸欐垿鈧礁鐢拠浣峰姛閻ㄥ嚗TTP鐠囬攱鐪?     *
     * @param string $url 鐠囬攱鐪癠RL
     * @param string $data 鐠囬攱鐪伴弫鐗堝祦
     * @return string 閸濆秴绨查弫鐗堝祦
     */
    private function send_request_with_cert( $url, $data ) {
        $ch = curl_init();
        
        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_POST, 1 );
        curl_setopt( $ch, CURLOPT_POSTFIELDS, $data );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 0 );
        curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
        
        // 鐠佸墽鐤嗙拠浣峰姛
        curl_setopt( $ch, CURLOPT_SSLCERTTYPE, 'PEM' );
        curl_setopt( $ch, CURLOPT_SSLCERT, $this->config['cert_path'] );
        curl_setopt( $ch, CURLOPT_SSLKEYTYPE, 'PEM' );
        curl_setopt( $ch, CURLOPT_SSLKEY, $this->config['key_path'] );
        
        $response = curl_exec( $ch );
        
        if ( curl_errno( $ch ) ) {
            error_log( 'SUT瀵邦喕淇婄亸蹇曗柤鎼村繑鏁禒妯跨槈娑旓箒顕Ч鍌炴晩鐠? ' . curl_error( $ch ) );
        }
        
        curl_close( $ch );
        
        return $response;
    }
    
    /**
     * 閺佹壆绮嶆潪鐞桵L
     *
     * @param array $arr 閺佹壆绮?     * @return string XML鐎涙顑佹稉?     */
    private function array_to_xml( $arr ) {
        $xml = '<xml>';
        foreach ( $arr as $key => $val ) {
            if ( is_numeric( $val ) ) {
                $xml .= '<' . $key . '>' . $val . '</' . $key . '>';
            } else {
                $xml .= '<' . $key . '><![CDATA[' . $val . ']]></' . $key . '>';
            }
        }
        $xml .= '</xml>';
        
        return $xml;
    }
    
    /**
     * XML鏉烆剚鏆熺紒?     *
     * @param string $xml XML鐎涙顑佹稉?     * @return array 鏉烆剚宕查崥搴ｆ畱閺佹壆绮?     */
    private function xml_to_array( $xml ) {
        $obj = simplexml_load_string( $xml, 'SimpleXMLElement', LIBXML_NOCDATA );
        $json = json_encode( $obj );
        $array = json_decode( $json, true );
        
        return $array;
    }
}

/**
 * 閸掓繂顫愰崠鏍ㄦ暜娴犳﹢娉﹂幋? */
function sut_wechat_mini_pay_init() {
    SUT_WeChat_Mini_Pay::get_instance();
}

add_action( 'plugins_loaded', 'sut_wechat_mini_pay_init' );\n