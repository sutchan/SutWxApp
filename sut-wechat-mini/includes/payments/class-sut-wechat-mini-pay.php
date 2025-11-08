<?php
/**
 * SUT寰俊灏忕▼搴忔敮浠橀泦鎴愮被
 *
 * 澶勭悊寰俊鏀粯鐩稿叧鍔熻兘锛屽寘鎷敮浠樺垱寤恒€佸洖璋冨鐞嗙瓑
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Pay 绫? */
class SUT_WeChat_Mini_Pay {
    
    /**
     * 鏀粯闆嗘垚瀹炰緥
     *
     * @var SUT_WeChat_Mini_Pay
     */
    private static $instance = null;
    
    /**
     * 寰俊鏀粯閰嶇疆
     *
     * @var array
     */
    private $config = array();
    
    /**
     * 鏋勯€犲嚱鏁?     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 鑾峰彇鍗曚緥瀹炰緥
     *
     * @return SUT_WeChat_Mini_Pay
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 鍒濆鍖栨敮浠橀厤缃?     */
    private function init() {
        // 鑾峰彇鏀粯閰嶇疆
        $this->config = array(
            'app_id' => get_option( 'sut_wechat_mini_app_id', '' ),
            'mch_id' => get_option( 'sut_wechat_mini_mch_id', '' ),
            'api_key' => get_option( 'sut_wechat_mini_api_key', '' ),
            'notify_url' => home_url( '/sut-wechat-mini-api/payment/notify' ),
            'cert_path' => get_option( 'sut_wechat_mini_cert_path', '' ),
            'key_path' => get_option( 'sut_wechat_mini_key_path', '' ),
            'sandbox' => get_option( 'sut_wechat_mini_pay_sandbox', false ),
        );
        
        // 娉ㄥ唽鏀粯鐩稿叧鐨勮缃」
        add_filter( 'sut_wechat_mini_settings', array( $this, 'add_payment_settings' ) );
        
        // 娉ㄥ唽鏀粯鐩稿叧鐨凙PI璺敱
        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_payment_routes' ) );
    }
    
    /**
     * 娣诲姞鏀粯鐩稿叧鐨勮缃」
     *
     * @param array $settings 鐜版湁璁剧疆椤?     * @return array 淇敼鍚庣殑璁剧疆椤?     */
    public function add_payment_settings( $settings ) {
        $payment_settings = array(
            'title' => __( '鏀粯璁剧疆', 'sut-wechat-mini' ),
            'fields' => array(
                array(
                    'id' => 'mch_id',
                    'title' => __( '鍟嗘埛ID', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '寰俊鏀粯鍟嗘埛ID', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'api_key',
                    'title' => __( 'API瀵嗛挜', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '寰俊鏀粯API瀵嗛挜', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'cert_path',
                    'title' => __( '璇佷功璺緞', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '寰俊鏀粯璇佷功璺緞锛堢粷瀵硅矾寰勶級', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'key_path',
                    'title' => __( '瀵嗛挜璺緞', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '寰俊鏀粯瀵嗛挜璺緞锛堢粷瀵硅矾寰勶級', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'pay_sandbox',
                    'title' => __( '娌欑妯″紡', 'sut-wechat-mini' ),
                    'type' => 'checkbox',
                    'desc' => __( '寮€鍚矙绠辨祴璇曟ā寮?, 'sut-wechat-mini' ),
                    'default' => false,
                ),
            ),
        );
        
        $settings['payment'] = $payment_settings;
        
        return $settings;
    }
    
    /**
     * 娣诲姞鏀粯鐩稿叧鐨凙PI璺敱
     *
     * @param array $routes 鐜版湁璺敱
     * @return array 淇敼鍚庣殑璺敱
     */
    public function add_payment_routes( $routes ) {
        // 鏀粯鐩稿叧API璺敱宸茬粡鍦╓ooCommerce闆嗘垚绫讳腑娣诲姞
        return $routes;
    }
    
    /**
     * 鍒涘缓鏀粯
     *
     * @param WC_Order $order 璁㈠崟瀵硅薄
     * @param int $user_id 鐢ㄦ埛ID
     * @return array|WP_Error 鏀粯鍙傛暟鎴栭敊璇璞?     */
    public function create_payment( $order, $user_id ) {
        // 妫€鏌ユ敮浠橀厤缃槸鍚﹀畬鏁?        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '鏀粯閰嶇疆涓嶅畬鏁?, 'sut-wechat-mini' ) );
        }
        
        // 鑾峰彇鐢ㄦ埛鐨刼penid
        $openid = get_user_meta( $user_id, '_sut_wechat_mini_openid', true );
        
        if ( empty( $openid ) ) {
            return new WP_Error( 'openid_not_found', __( '鐢ㄦ埛寰俊淇℃伅鏈壘鍒?, 'sut-wechat-mini' ) );
        }
        
        // 鏋勫缓缁熶竴涓嬪崟鍙傛暟
        $nonce_str = $this->generate_nonce_str();
        $total_fee = intval( $order->get_total() * 100 ); // 杞崲涓哄垎
        
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
        
        // 娣诲姞娌欑妯″紡鍙傛暟
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 鐢熸垚绛惧悕
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 杞崲涓篨ML
        $xml = $this->array_to_xml( $params );
        
        // 鍙戦€佽姹傚埌寰俊鏀粯鏈嶅姟鍣?        $gateway_url = $this->get_gateway_url( 'unifiedorder' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 瑙ｆ瀽XML鍝嶅簲
        $result = $this->xml_to_array( $response );
        
        // 妫€鏌ュ搷搴旂粨鏋?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '璇锋眰澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'payment_request_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '涓氬姟澶勭悊澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'payment_business_failed', $error_msg );
        }
        
        // 鐢熸垚灏忕▼搴忔敮浠樺弬鏁?        $time_stamp = (string) time();
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
     * 楠岃瘉鏀粯鍥炶皟绛惧悕
     *
     * @param array $data 鍥炶皟鏁版嵁
     * @return bool 楠岃瘉缁撴灉
     */
    public function verify_notify_sign( $data ) {
        // 澶嶅埗鏁版嵁锛岀Щ闄ign瀛楁
        $params = $data;
        if ( isset( $params['sign'] ) ) {
            unset( $params['sign'] );
        }
        
        // 鐢熸垚绛惧悕
        $sign = $this->generate_sign( $params );
        
        // 姣旇緝绛惧悕
        return $sign === $data['sign'];
    }
    
    /**
     * 鏌ヨ璁㈠崟
     *
     * @param string $out_trade_no 鍟嗘埛璁㈠崟鍙?     * @return array|WP_Error 鏌ヨ缁撴灉鎴栭敊璇璞?     */
    public function query_order( $out_trade_no ) {
        // 妫€鏌ユ敮浠橀厤缃槸鍚﹀畬鏁?        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '鏀粯閰嶇疆涓嶅畬鏁?, 'sut-wechat-mini' ) );
        }
        
        // 鏋勫缓鏌ヨ鍙傛暟
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $out_trade_no,
            'nonce_str' => $nonce_str,
        );
        
        // 娣诲姞娌欑妯″紡鍙傛暟
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 鐢熸垚绛惧悕
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 杞崲涓篨ML
        $xml = $this->array_to_xml( $params );
        
        // 鍙戦€佽姹傚埌寰俊鏀粯鏈嶅姟鍣?        $gateway_url = $this->get_gateway_url( 'orderquery' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 瑙ｆ瀽XML鍝嶅簲
        $result = $this->xml_to_array( $response );
        
        // 妫€鏌ュ搷搴旂粨鏋?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '鏌ヨ澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'query_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '涓氬姟澶勭悊澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'query_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 鍏抽棴璁㈠崟
     *
     * @param string $out_trade_no 鍟嗘埛璁㈠崟鍙?     * @return array|WP_Error 鍏抽棴缁撴灉鎴栭敊璇璞?     */
    public function close_order( $out_trade_no ) {
        // 妫€鏌ユ敮浠橀厤缃槸鍚﹀畬鏁?        if ( ! $this->is_config_valid() ) {
            return new WP_Error( 'payment_config_invalid', __( '鏀粯閰嶇疆涓嶅畬鏁?, 'sut-wechat-mini' ) );
        }
        
        // 鏋勫缓鍏抽棴鍙傛暟
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'out_trade_no' => $out_trade_no,
            'nonce_str' => $nonce_str,
        );
        
        // 娣诲姞娌欑妯″紡鍙傛暟
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 鐢熸垚绛惧悕
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 杞崲涓篨ML
        $xml = $this->array_to_xml( $params );
        
        // 鍙戦€佽姹傚埌寰俊鏀粯鏈嶅姟鍣?        $gateway_url = $this->get_gateway_url( 'closeorder' );
        $response = $this->send_request( $gateway_url, $xml );
        
        // 瑙ｆ瀽XML鍝嶅簲
        $result = $this->xml_to_array( $response );
        
        // 妫€鏌ュ搷搴旂粨鏋?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '鍏抽棴澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'close_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '涓氬姟澶勭悊澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'close_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 鐢宠閫€娆?     *
     * @param string $out_trade_no 鍟嗘埛璁㈠崟鍙?     * @param string $out_refund_no 鍟嗘埛閫€娆惧崟鍙?     * @param float $total_fee 璁㈠崟鎬婚噾棰?     * @param float $refund_fee 閫€娆鹃噾棰?     * @return array|WP_Error 閫€娆剧粨鏋滄垨閿欒瀵硅薄
     */
    public function refund( $out_trade_no, $out_refund_no, $total_fee, $refund_fee ) {
        // 妫€鏌ユ敮浠橀厤缃槸鍚﹀畬鏁?        if ( ! $this->is_config_valid( true ) ) {
            return new WP_Error( 'payment_config_invalid', __( '鏀粯閰嶇疆涓嶅畬鏁存垨璇佷功涓嶅瓨鍦?, 'sut-wechat-mini' ) );
        }
        
        // 杞崲閲戦涓哄垎
        $total_fee = intval( $total_fee * 100 );
        $refund_fee = intval( $refund_fee * 100 );
        
        // 鏋勫缓閫€娆惧弬鏁?        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'appid' => $this->config['app_id'],
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
            'out_trade_no' => $out_trade_no,
            'out_refund_no' => $out_refund_no,
            'total_fee' => $total_fee,
            'refund_fee' => $refund_fee,
            'refund_desc' => __( '鐢ㄦ埛鐢宠閫€娆?, 'sut-wechat-mini' ),
        );
        
        // 娣诲姞娌欑妯″紡鍙傛暟
        if ( $this->config['sandbox'] ) {
            $params['sandbox_signkey'] = $this->get_sandbox_signkey();
        }
        
        // 鐢熸垚绛惧悕
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 杞崲涓篨ML
        $xml = $this->array_to_xml( $params );
        
        // 鍙戦€佽姹傚埌寰俊鏀粯鏈嶅姟鍣紙闇€瑕佽瘉涔︼級
        $gateway_url = $this->get_gateway_url( 'refund' );
        $response = $this->send_request_with_cert( $gateway_url, $xml );
        
        // 瑙ｆ瀽XML鍝嶅簲
        $result = $this->xml_to_array( $response );
        
        // 妫€鏌ュ搷搴旂粨鏋?        if ( ! $result || $result['return_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['return_msg'] ) ? $result['return_msg'] : __( '閫€娆剧敵璇峰け璐?, 'sut-wechat-mini' );
            return new WP_Error( 'refund_failed', $error_msg );
        }
        
        if ( $result['result_code'] != 'SUCCESS' ) {
            $error_msg = isset( $result['err_code_des'] ) ? $result['err_code_des'] : __( '涓氬姟澶勭悊澶辫触', 'sut-wechat-mini' );
            return new WP_Error( 'refund_business_failed', $error_msg );
        }
        
        return $result;
    }
    
    /**
     * 妫€鏌ユ敮浠橀厤缃槸鍚︽湁鏁?     *
     * @param bool $check_cert 鏄惁妫€鏌ヨ瘉涔?     * @return bool 閰嶇疆鏄惁鏈夋晥
     */
    private function is_config_valid( $check_cert = false ) {
        // 妫€鏌ュ熀鏈厤缃?        if ( empty( $this->config['app_id'] ) || empty( $this->config['mch_id'] ) || empty( $this->config['api_key'] ) ) {
            return false;
        }
        
        // 妫€鏌ヨ瘉涔﹂厤缃紙濡傛灉闇€瑕侊級
        if ( $check_cert && ( empty( $this->config['cert_path'] ) || empty( $this->config['key_path'] ) || ! file_exists( $this->config['cert_path'] ) || ! file_exists( $this->config['key_path'] ) ) ) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 鐢熸垚闅忔満瀛楃涓?     *
     * @param int $length 瀛楃涓查暱搴?     * @return string 闅忔満瀛楃涓?     */
    private function generate_nonce_str( $length = 32 ) {
        $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        $str = "";
        for ( $i = 0; $i < $length; $i++ ) {
            $str .= substr( $chars, mt_rand( 0, strlen( $chars ) - 1 ), 1 );
        }
        return $str;
    }
    
    /**
     * 鐢熸垚绛惧悕
     *
     * @param array $params 鍙傛暟鏁扮粍
     * @return string 绛惧悕
     */
    private function generate_sign( $params ) {
        // 鎸夊瓧鍏稿簭鎺掑簭
        ksort( $params );
        
        // 鎷兼帴瀛楃涓?        $string = '';
        foreach ( $params as $key => $value ) {
            if ( $value && $key != 'sign' ) {
                $string .= $key . '=' . $value . '&';
            }
        }
        
        // 娣诲姞API瀵嗛挜
        $string .= 'key=' . $this->config['api_key'];
        
        // MD5鍔犲瘑骞惰浆鎹负澶у啓
        $sign = strtoupper( md5( $string ) );
        
        return $sign;
    }
    
    /**
     * 鐢熸垚鏀粯绛惧悕锛堝皬绋嬪簭绔娇鐢級
     *
     * @param string $time_stamp 鏃堕棿鎴?     * @param string $nonce_str 闅忔満瀛楃涓?     * @param string $package 璁㈠崟鍖?     * @return string 鏀粯绛惧悕
     */
    private function generate_pay_sign( $time_stamp, $nonce_str, $package ) {
        // 鏋勫缓绛惧悕鍙傛暟
        $params = array(
            'appId' => $this->config['app_id'],
            'timeStamp' => $time_stamp,
            'nonceStr' => $nonce_str,
            'package' => $package,
            'signType' => 'MD5',
        );
        
        // 鎸夊瓧鍏稿簭鎺掑簭
        ksort( $params );
        
        // 鎷兼帴瀛楃涓?        $string = '';
        foreach ( $params as $key => $value ) {
            $string .= $key . '=' . $value . '&';
        }
        
        // 娣诲姞API瀵嗛挜
        $string .= 'key=' . $this->config['api_key'];
        
        // MD5鍔犲瘑骞惰浆鎹负澶у啓
        $sign = strtoupper( md5( $string ) );
        
        return $sign;
    }
    
    /**
     * 鑾峰彇璁㈠崟鎻忚堪
     *
     * @param WC_Order $order 璁㈠崟瀵硅薄
     * @return string 璁㈠崟鎻忚堪
     */
    private function get_order_description( $order ) {
        $site_name = get_bloginfo( 'name' );
        $description = sprintf( __( '%s - 璁㈠崟 %s', 'sut-wechat-mini' ), $site_name, $order->get_order_number() );
        
        // 闄愬埗鎻忚堪闀垮害
        if ( strlen( $description ) > 127 ) {
            $description = substr( $description, 0, 124 ) . '...';
        }
        
        return $description;
    }
    
    /**
     * 鑾峰彇瀹㈡埛绔疘P鍦板潃
     *
     * @return string IP鍦板潃
     */
    private function get_client_ip() {
        $ip = '';
        if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // 澶勭悊澶氫釜IP鍦板潃鐨勬儏鍐?        if ( strpos( $ip, ',' ) !== false ) {
            $ips = explode( ',', $ip );
            $ip = trim( $ips[0] );
        }
        
        return $ip;
    }
    
    /**
     * 鑾峰彇寰俊鏀粯缃戝叧URL
     *
     * @param string $api_name API鍚嶇О
     * @return string 缃戝叧URL
     */
    private function get_gateway_url( $api_name ) {
        $base_url = $this->config['sandbox'] ? 'https://api.mch.weixin.qq.com/sandboxnew/' : 'https://api.mch.weixin.qq.com/pay/';
        return $base_url . $api_name . '.php';
    }
    
    /**
     * 鑾峰彇娌欑鐜鐨剆ignkey
     *
     * @return string 娌欑signkey
     */
    private function get_sandbox_signkey() {
        // 鏋勫缓璇锋眰鍙傛暟
        $nonce_str = $this->generate_nonce_str();
        
        $params = array(
            'mch_id' => $this->config['mch_id'],
            'nonce_str' => $nonce_str,
        );
        
        // 鐢熸垚绛惧悕
        $sign = $this->generate_sign( $params );
        $params['sign'] = $sign;
        
        // 杞崲涓篨ML
        $xml = $this->array_to_xml( $params );
        
        // 鍙戦€佽姹?        $url = 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey';
        $response = $this->send_request( $url, $xml );
        
        // 瑙ｆ瀽鍝嶅簲
        $result = $this->xml_to_array( $response );
        
        // 杩斿洖signkey
        if ( $result && $result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS' ) {
            return $result['sandbox_signkey'];
        }
        
        return '';
    }
    
    /**
     * 鍙戦€丠TTP璇锋眰
     *
     * @param string $url 璇锋眰URL
     * @param string $data 璇锋眰鏁版嵁
     * @return string 鍝嶅簲鏁版嵁
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
            error_log( 'SUT寰俊灏忕▼搴忔敮浠樿姹傞敊璇? ' . curl_error( $ch ) );
        }
        
        curl_close( $ch );
        
        return $response;
    }
    
    /**
     * 鍙戦€佸甫璇佷功鐨凥TTP璇锋眰
     *
     * @param string $url 璇锋眰URL
     * @param string $data 璇锋眰鏁版嵁
     * @return string 鍝嶅簲鏁版嵁
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
        
        // 璁剧疆璇佷功
        curl_setopt( $ch, CURLOPT_SSLCERTTYPE, 'PEM' );
        curl_setopt( $ch, CURLOPT_SSLCERT, $this->config['cert_path'] );
        curl_setopt( $ch, CURLOPT_SSLKEYTYPE, 'PEM' );
        curl_setopt( $ch, CURLOPT_SSLKEY, $this->config['key_path'] );
        
        $response = curl_exec( $ch );
        
        if ( curl_errno( $ch ) ) {
            error_log( 'SUT寰俊灏忕▼搴忔敮浠樿瘉涔﹁姹傞敊璇? ' . curl_error( $ch ) );
        }
        
        curl_close( $ch );
        
        return $response;
    }
    
    /**
     * 鏁扮粍杞琗ML
     *
     * @param array $arr 鏁扮粍
     * @return string XML瀛楃涓?     */
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
     * XML杞暟缁?     *
     * @param string $xml XML瀛楃涓?     * @return array 杞崲鍚庣殑鏁扮粍
     */
    private function xml_to_array( $xml ) {
        $obj = simplexml_load_string( $xml, 'SimpleXMLElement', LIBXML_NOCDATA );
        $json = json_encode( $obj );
        $array = json_decode( $json, true );
        
        return $array;
    }
}

/**
 * 鍒濆鍖栨敮浠橀泦鎴? */
function sut_wechat_mini_pay_init() {
    SUT_WeChat_Mini_Pay::get_instance();
}

add_action( 'plugins_loaded', 'sut_wechat_mini_pay_init' );\n