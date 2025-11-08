<?php
/**
 * SUT寰俊灏忕▼搴忓伐鍏峰嚱鏁扮被
 *
 * 鍖呭惈鍚勭閫氱敤鐨勫伐鍏峰嚱鏁? *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Utils 绫? */
class SUT_WeChat_Mini_Utils {
    
    /**
     * 鐢熸垚鍞竴ID
     *
     * @param string $prefix 鍓嶇紑
     * @return string 鍞竴ID
     */
    public static function generate_unique_id( $prefix = '' ) {
        return $prefix . uniqid() . '-' . substr( md5( microtime() . rand() ), 0, 8 );
    }
    
    /**
     * 鍔犲瘑鏁版嵁
     *
     * @param string $data 瑕佸姞瀵嗙殑鏁版嵁
     * @param string $key 鍔犲瘑瀵嗛挜
     * @return string 鍔犲瘑鍚庣殑鏁版嵁
     */
    public static function encrypt( $data, $key ) {
        if ( ! function_exists( 'openssl_encrypt' ) ) {
            return $data;
        }
        
        $method = 'AES-256-CBC';
        $iv = openssl_random_pseudo_bytes( openssl_cipher_iv_length( $method ) );
        $encrypted = openssl_encrypt( $data, $method, $key, 0, $iv );
        
        return base64_encode( $iv . $encrypted );
    }
    
    /**
     * 瑙ｅ瘑鏁版嵁
     *
     * @param string $data 瑕佽В瀵嗙殑鏁版嵁
     * @param string $key 瑙ｅ瘑瀵嗛挜
     * @return string 瑙ｅ瘑鍚庣殑鏁版嵁
     */
    public static function decrypt( $data, $key ) {
        if ( ! function_exists( 'openssl_decrypt' ) ) {
            return $data;
        }
        
        $method = 'AES-256-CBC';
        $decoded = base64_decode( $data );
        $iv_length = openssl_cipher_iv_length( $method );
        $iv = substr( $decoded, 0, $iv_length );
        $encrypted = substr( $decoded, $iv_length );
        
        return openssl_decrypt( $encrypted, $method, $key, 0, $iv );
    }
    
    /**
     * 鐢熸垚绛惧悕
     *
     * @param array $params 鍙傛暟鏁扮粍
     * @param string $key 瀵嗛挜
     * @return string 绛惧悕
     */
    public static function generate_signature( $params, $key ) {
        // 鎸夊弬鏁板悕ASCII鐮佷粠灏忓埌澶ф帓搴?        ksort( $params );
        
        // 鎷兼帴鍙傛暟
        $str = '';
        foreach ( $params as $k => $v ) {
            if ( $v !== '' && $k !== 'sign' ) {
                $str .= $k . '=' . $v . '&';
            }
        }
        
        // 娣诲姞瀵嗛挜骞禡D5鍔犲瘑
        $str .= 'key=' . $key;
        $sign = strtoupper( md5( $str ) );
        
        return $sign;
    }
    
    /**
     * 楠岃瘉绛惧悕
     *
     * @param array $params 鍙傛暟鏁扮粍
     * @param string $key 瀵嗛挜
     * @return bool 楠岃瘉缁撴灉
     */
    public static function verify_signature( $params, $key ) {
        if ( ! isset( $params['sign'] ) ) {
            return false;
        }
        
        $sign = $params['sign'];
        unset( $params['sign'] );
        
        return $sign === self::generate_signature( $params, $key );
    }
    
    /**
     * 鍙戦€丠TTP璇锋眰
     *
     * @param string $url 璇锋眰URL
     * @param array $params 璇锋眰鍙傛暟
     * @param array $options 璇锋眰閫夐」
     * @return array 鍝嶅簲缁撴灉
     */
    public static function send_request( $url, $params = array(), $options = array() ) {
        $default_options = array(
            'method' => 'GET',
            'timeout' => 30,
            'sslverify' => true,
            'headers' => array(),
        );
        
        $options = wp_parse_args( $options, $default_options );
        $options['method'] = strtoupper( $options['method'] );
        
        // 鏋勫缓璇锋眰
        if ( $options['method'] === 'GET' && ! empty( $params ) ) {
            $url = add_query_arg( $params, $url );
        } elseif ( in_array( $options['method'], array( 'POST', 'PUT', 'DELETE' ) ) && ! empty( $params ) ) {
            $body = '';
            
            // 妫€鏌ontent-Type
            $content_type = isset( $options['headers']['Content-Type'] ) ? $options['headers']['Content-Type'] : '';
            
            if ( $content_type === 'application/json' ) {
                $body = wp_json_encode( $params );
            } else {
                $body = http_build_query( $params );
            }
            
            $options['body'] = $body;
        }
        
        // 鍙戦€佽姹?        $response = wp_remote_request( $url, $options );
        
        // 妫€鏌ラ敊璇?        if ( is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
                'data' => null,
            );
        }
        
        // 瑙ｆ瀽鍝嶅簲
        $code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        $headers = wp_remote_retrieve_headers( $response );
        
        // 灏濊瘯瑙ｆ瀽JSON
        $data = null;
        $content_type = $headers['content-type'] ?? '';
        
        if ( strpos( $content_type, 'application/json' ) !== false ) {
            $data = json_decode( $body, true );
        }
        
        return array(
            'success' => $code >= 200 && $code < 300,
            'code' => $code,
            'headers' => $headers,
            'body' => $body,
            'data' => $data,
        );
    }
    
    /**
     * 鍙戦€丟ET璇锋眰
     *
     * @param string $url 璇锋眰URL
     * @param array $params 璇锋眰鍙傛暟
     * @param array $options 璇锋眰閫夐」
     * @return array 鍝嶅簲缁撴灉
     */
    public static function send_get_request( $url, $params = array(), $options = array() ) {
        $options['method'] = 'GET';
        return self::send_request( $url, $params, $options );
    }
    
    /**
     * 鍙戦€丳OST璇锋眰
     *
     * @param string $url 璇锋眰URL
     * @param array $params 璇锋眰鍙傛暟
     * @param array $options 璇锋眰閫夐」
     * @return array 鍝嶅簲缁撴灉
     */
    public static function send_post_request( $url, $params = array(), $options = array() ) {
        $options['method'] = 'POST';
        return self::send_request( $url, $params, $options );
    }
    
    /**
     * 鑾峰彇瀹㈡埛绔疘P鍦板潃
     *
     * @return string IP鍦板潃
     */
    public static function get_client_ip() {
        if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // 澶勭悊澶氫釜IP鍦板潃鐨勬儏鍐?        if ( strpos( $ip, ',' ) !== false ) {
            $ips = explode( ',', $ip );
            $ip = trim( $ips[0] );
        }
        
        return $ip;
    }
    
    /**
     * 妫€鏌P鏄惁鍦ㄧ櫧鍚嶅崟涓?     *
     * @param string $ip IP鍦板潃
     * @param array $whitelist IP鐧藉悕鍗?     * @return bool 妫€鏌ョ粨鏋?     */
    public static function is_ip_whitelisted( $ip, $whitelist ) {
        if ( empty( $whitelist ) ) {
            return true;
        }
        
        foreach ( $whitelist as $whitelisted_ip ) {
            $whitelisted_ip = trim( $whitelisted_ip );
            
            // 妫€鏌ユ槸鍚︽槸瀹屽叏鍖归厤
            if ( $ip === $whitelisted_ip ) {
                return true;
            }
            
            // 妫€鏌ユ槸鍚︽槸CIDR鏍煎紡
            if ( strpos( $whitelisted_ip, '/' ) !== false ) {
                list( $subnet, $mask ) = explode( '/', $whitelisted_ip, 2 );
                
                if ( self::ip_in_range( $ip, $subnet, $mask ) ) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 妫€鏌P鏄惁鍦ㄦ寚瀹氬瓙缃戣寖鍥村唴
     *
     * @param string $ip IP鍦板潃
     * @param string $subnet 瀛愮綉鍦板潃
     * @param int $mask 瀛愮綉鎺╃爜
     * @return bool 妫€鏌ョ粨鏋?     */
    private static function ip_in_range( $ip, $subnet, $mask ) {
        $ip = ip2long( $ip );
        $subnet = ip2long( $subnet );
        $mask = -1 << ( 32 - $mask );
        
        return ( $ip & $mask ) === ( $subnet & $mask );
    }
    
    /**
     * 鏍煎紡鍖栨椂闂?     *
     * @param string|int $timestamp 鏃堕棿鎴?     * @param string $format 鏃堕棿鏍煎紡
     * @return string 鏍煎紡鍖栧悗鐨勬椂闂?     */
    public static function format_time( $timestamp, $format = 'Y-m-d H:i:s' ) {
        if ( is_numeric( $timestamp ) ) {
            return date( $format, $timestamp );
        }
        
        return date( $format, strtotime( $timestamp ) );
    }
    
    /**
     * 鑾峰彇鐩稿鏃堕棿
     *
     * @param string|int $timestamp 鏃堕棿鎴?     * @return string 鐩稿鏃堕棿
     */
    public static function get_relative_time( $timestamp ) {
        if ( is_numeric( $timestamp ) ) {
            $time = $timestamp;
        } else {
            $time = strtotime( $timestamp );
        }
        
        $now = time();
        $diff = $now - $time;
        
        if ( $diff < 60 ) {
            return sprintf( __( '%d绉掑墠', 'sut-wechat-mini' ), $diff );
        } elseif ( $diff < 3600 ) {
            $minutes = floor( $diff / 60 );
            return sprintf( __( '%d鍒嗛挓鍓?, 'sut-wechat-mini' ), $minutes );
        } elseif ( $diff < 86400 ) {
            $hours = floor( $diff / 3600 );
            return sprintf( __( '%d灏忔椂鍓?, 'sut-wechat-mini' ), $hours );
        } elseif ( $diff < 2592000 ) {
            $days = floor( $diff / 86400 );
            return sprintf( __( '%d澶╁墠', 'sut-wechat-mini' ), $days );
        } else {
            return self::format_time( $time, 'Y-m-d' );
        }
    }
    
    /**
     * 鎴彇瀛楃涓?     *
     * @param string $str 鍘熷瀛楃涓?     * @param int $length 鎴彇闀垮害
     * @param string $suffix 鍚庣紑
     * @return string 鎴彇鍚庣殑瀛楃涓?     */
    public static function truncate_string( $str, $length = 100, $suffix = '...' ) {
        if ( mb_strlen( $str, 'UTF-8' ) <= $length ) {
            return $str;
        }
        
        return mb_substr( $str, 0, $length, 'UTF-8' ) . $suffix;
    }
    
    /**
     * 娓呯悊HTML鏍囩
     *
     * @param string $html HTML鍐呭
     * @param array $allowed_tags 鍏佽鐨勬爣绛?     * @return string 娓呯悊鍚庣殑鍐呭
     */
    public static function clean_html( $html, $allowed_tags = array() ) {
        if ( empty( $allowed_tags ) ) {
            $allowed_tags = array(
                'p' => array(),
                'br' => array(),
                'strong' => array(),
                'em' => array(),
                'u' => array(),
                's' => array(),
                'ul' => array(),
                'ol' => array(),
                'li' => array(),
                'h1' => array(),
                'h2' => array(),
                'h3' => array(),
                'h4' => array(),
                'h5' => array(),
                'h6' => array(),
                'a' => array(
                    'href' => array(),
                    'title' => array(),
                    'target' => array(),
                ),
                'img' => array(
                    'src' => array(),
                    'alt' => array(),
                    'title' => array(),
                    'width' => array(),
                    'height' => array(),
                ),
                'blockquote' => array(),
                'code' => array(),
                'pre' => array(),
            );
        }
        
        return wp_kses( $html, $allowed_tags );
    }
    
    /**
     * 杞崲HTML鍒癕arkdown
     *
     * @param string $html HTML鍐呭
     * @return string Markdown鍐呭
     */
    public static function html_to_markdown( $html ) {
        // 绠€鍖栫殑HTML鍒癕arkdown杞崲
        $html = str_replace( '<h1>', '# ', $html );
        $html = str_replace( '</h1>', '\n\n', $html );
        $html = str_replace( '<h2>', '## ', $html );
        $html = str_replace( '</h2>', '\n\n', $html );
        $html = str_replace( '<h3>', '### ', $html );
        $html = str_replace( '</h3>', '\n\n', $html );
        $html = str_replace( '<p>', '', $html );
        $html = str_replace( '</p>', '\n\n', $html );
        $html = str_replace( '<br>', '\n', $html );
        $html = str_replace( '<br/>', '\n', $html );
        $html = str_replace( '<br />', '\n', $html );
        $html = str_replace( '<strong>', '**', $html );
        $html = str_replace( '</strong>', '**', $html );
        $html = str_replace( '<em>', '*', $html );
        $html = str_replace( '</em>', '*', $html );
        $html = str_replace( '<blockquote>', '> ', $html );
        $html = str_replace( '</blockquote>', '\n\n', $html );
        
        // 澶勭悊閾炬帴
        $html = preg_replace( '/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/i', '[\2](\1)', $html );
        
        // 澶勭悊鍥剧墖
        $html = preg_replace( '/<img\s+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i', '![\2](\1)', $html );
        $html = preg_replace( '/<img\s+src="([^"]+)"[^>]*>/i', '![鍥剧墖](\1)', $html );
        
        // 澶勭悊鏃犲簭鍒楄〃
        $html = str_replace( '<ul>', '\n\n', $html );
        $html = str_replace( '</ul>', '\n\n', $html );
        $html = str_replace( '<li>', '- ', $html );
        $html = str_replace( '</li>', '\n', $html );
        
        // 澶勭悊鏈夊簭鍒楄〃
        $html = str_replace( '<ol>', '\n\n', $html );
        $html = str_replace( '</ol>', '\n\n', $html );
        
        // 澶勭悊浠ｇ爜鍧?        $html = str_replace( '<pre><code>', '```\n', $html );
        $html = str_replace( '</code></pre>', '\n```\n\n', $html );
        $html = str_replace( '<code>', '`', $html );
        $html = str_replace( '</code>', '`', $html );
        
        // 绉婚櫎鍓╀綑鐨凥TML鏍囩
        $html = strip_tags( $html );
        
        // 娓呯悊澶氫綑鐨勭┖琛?        $html = preg_replace( '/\n{3,}/', '\n\n', $html );
        
        return trim( $html );
    }
    
    /**
     * 杞崲HTML涓哄皬绋嬪簭鏀寔鐨勬牸寮?     *
     * @param string $html HTML鍐呭
     * @return array 杞崲鍚庣殑鍐呭鏁扮粍
     */
    public static function html_to_mini_program( $html ) {
        // 娓呯悊HTML鏍囩
        $html = self::clean_html( $html );
        
        // 杞崲鍥剧墖璺緞
        $html = preg_replace_callback( '/<img\s+src="([^"]+)"([^>]*)>/i', function( $matches ) {
            $src = $matches[1];
            $attrs = $matches[2];
            
            // 纭繚鍥剧墖璺緞鏄粷瀵硅矾寰?            if ( strpos( $src, 'http' ) !== 0 ) {
                $src = home_url( $src );
            }
            
            return '<img src="' . $src . '"' . $attrs . ' />';
        }, $html );
        
        // 杞崲閾炬帴
        $html = preg_replace_callback( '/<a\s+href="([^"]+)"([^>]*)>(.*?)<\/a>/i', function( $matches ) {
            $href = $matches[1];
            $attrs = $matches[2];
            $text = $matches[3];
            
            // 纭繚閾炬帴鏄粷瀵硅矾寰?            if ( strpos( $href, 'http' ) !== 0 ) {
                $href = home_url( $href );
            }
            
            return '<a href="' . $href . '"' . $attrs . '>' . $text . '</a>';
        }, $html );
        
        // 鍒嗗壊鍐呭涓烘钀?        $segments = array();
        $dom = new DOMDocument();
        
        // 娣诲姞鏍瑰厓绱犱互纭繚HTML鏈夋晥
        $wrapper = '<div id="content-wrapper">' . $html . '</div>';
        
        // 澶勭悊HTML瀹炰綋鍜孶TF-8缂栫爜
        $wrapper = mb_convert_encoding( $wrapper, 'HTML-ENTITIES', 'UTF-8' );
        
        // 鍔犺浇HTML
        @$dom->loadHTML( $wrapper );
        
        // 鑾峰彇鎵€鏈変竴绾у瓙鍏冪礌
        $wrapper_element = $dom->getElementById( 'content-wrapper' );
        if ( $wrapper_element ) {
            $children = $wrapper_element->childNodes;
            
            foreach ( $children as $child ) {
                if ( $child->nodeType === XML_ELEMENT_NODE || $child->nodeType === XML_TEXT_NODE ) {
                    $node_name = strtolower( $child->nodeName );
                    $content = trim( $dom->saveHTML( $child ) );
                    
                    if ( ! empty( $content ) ) {
                        // 鏍规嵁鑺傜偣绫诲瀷娣诲姞鍒版钀芥暟缁?                        switch ( $node_name ) {
                            case 'p':
                                $segments[] = array(
                                    'type' => 'paragraph',
                                    'content' => $content,
                                );
                                break;
                            case 'h1':
                            case 'h2':
                            case 'h3':
                            case 'h4':
                            case 'h5':
                            case 'h6':
                                $segments[] = array(
                                    'type' => 'heading',
                                    'level' => intval( substr( $node_name, 1 ) ),
                                    'content' => $content,
                                );
                                break;
                            case 'img':
                                $src = $child->getAttribute( 'src' );
                                $alt = $child->getAttribute( 'alt' );
                                $width = $child->getAttribute( 'width' );
                                $height = $child->getAttribute( 'height' );
                                
                                $segments[] = array(
                                    'type' => 'image',
                                    'src' => $src,
                                    'alt' => $alt,
                                    'width' => $width,
                                    'height' => $height,
                                );
                                break;
                            case 'a':
                                $href = $child->getAttribute( 'href' );
                                $text = trim( $child->nodeValue );
                                
                                $segments[] = array(
                                    'type' => 'link',
                                    'href' => $href,
                                    'text' => $text,
                                );
                                break;
                            case 'ul':
                            case 'ol':
                                $list_items = array();
                                $li_elements = $child->getElementsByTagName( 'li' );
                                
                                foreach ( $li_elements as $li ) {
                                    $list_items[] = trim( $li->nodeValue );
                                }
                                
                                $segments[] = array(
                                    'type' => 'list',
                                    'style' => $node_name === 'ul' ? 'unordered' : 'ordered',
                                    'items' => $list_items,
                                );
                                break;
                            case 'blockquote':
                                $segments[] = array(
                                    'type' => 'blockquote',
                                    'content' => trim( $child->nodeValue ),
                                );
                                break;
                            case 'pre':
                                $code = '';
                                $code_element = $child->getElementsByTagName( 'code' )->item( 0 );
                                if ( $code_element ) {
                                    $code = trim( $code_element->nodeValue );
                                } else {
                                    $code = trim( $child->nodeValue );
                                }
                                
                                $segments[] = array(
                                    'type' => 'code',
                                    'content' => $code,
                                );
                                break;
                            default:
                                // 澶勭悊鏂囨湰鑺傜偣鍜屽叾浠栧厓绱?                                if ( ! empty( $content ) && $node_name !== '#text' ) {
                                    $segments[] = array(
                                        'type' => 'paragraph',
                                        'content' => $content,
                                    );
                                } else if ( $node_name === '#text' && ! empty( $content ) ) {
                                    $segments[] = array(
                                        'type' => 'paragraph',
                                        'content' => '<p>' . $content . '</p>',
                                    );
                                }
                        }
                    }
                }
            }
        }
        
        return $segments;
    }
    
    /**
     * 鑾峰彇鏂囩珷鐗硅壊鍥剧墖
     *
     * @param int $post_id 鏂囩珷ID
     * @param string $size 鍥剧墖灏哄
     * @return array 鍥剧墖淇℃伅
     */
    public static function get_post_thumbnail( $post_id, $size = 'medium' ) {
        $thumbnail_id = get_post_thumbnail_id( $post_id );
        
        if ( ! $thumbnail_id ) {
            return null;
        }
        
        $thumbnail = wp_get_attachment_image_src( $thumbnail_id, $size );
        
        if ( ! $thumbnail ) {
            return null;
        }
        
        return array(
            'id' => $thumbnail_id,
            'url' => $thumbnail[0],
            'width' => $thumbnail[1],
            'height' => $thumbnail[2],
        );
    }
    
    /**
     * 鏍煎紡鍖栦环鏍?     *
     * @param float $price 浠锋牸
     * @param string $currency 璐у竵绗﹀彿
     * @return string 鏍煎紡鍖栧悗鐨勪环鏍?     */
    public static function format_price( $price, $currency = '楼' ) {
        if ( class_exists( 'WooCommerce' ) ) {
            return wc_price( $price );
        }
        
        return $currency . number_format( $price, 2, '.', ',' );
    }
    
    /**
     * 楠岃瘉琛ㄥ崟鏁版嵁
     *
     * @param array $data 琛ㄥ崟鏁版嵁
     * @param array $rules 楠岃瘉瑙勫垯
     * @return array 楠岃瘉缁撴灉
     */
    public static function validate_form( $data, $rules ) {
        $errors = array();
        
        foreach ( $rules as $field => $rule ) {
            $value = isset( $data[$field] ) ? $data[$field] : '';
            
            // 鍒嗗壊瑙勫垯
            $rule_parts = explode( '|', $rule );
            
            foreach ( $rule_parts as $rule_part ) {
                // 妫€鏌ユ槸鍚︽湁鍙傛暟
                $rule_args = explode( ':', $rule_part );
                $rule_name = $rule_args[0];
                $rule_params = array_slice( $rule_args, 1 );
                
                switch ( $rule_name ) {
                    case 'required':
                        if ( empty( $value ) ) {
                            $errors[$field] = sprintf( __( '%s鏄繀濉」', 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'email':
                        if ( ! empty( $value ) && ! is_email( $value ) ) {
                            $errors[$field] = __( '璇疯緭鍏ユ湁鏁堢殑閭鍦板潃', 'sut-wechat-mini' );
                        }
                        break;
                    case 'url':
                        if ( ! empty( $value ) && ! filter_var( $value, FILTER_VALIDATE_URL ) ) {
                            $errors[$field] = __( '璇疯緭鍏ユ湁鏁堢殑URL鍦板潃', 'sut-wechat-mini' );
                        }
                        break;
                    case 'min':
                        if ( ! empty( $value ) && strlen( $value ) < $rule_params[0] ) {
                            $errors[$field] = sprintf( __( '%s闀垮害涓嶈兘灏戜簬%d涓瓧绗?, 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'max':
                        if ( ! empty( $value ) && strlen( $value ) > $rule_params[0] ) {
                            $errors[$field] = sprintf( __( '%s闀垮害涓嶈兘瓒呰繃%d涓瓧绗?, 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'numeric':
                        if ( ! empty( $value ) && ! is_numeric( $value ) ) {
                            $errors[$field] = sprintf( __( '%s蹇呴』鏄暟瀛?, 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'integer':
                        if ( ! empty( $value ) && ! filter_var( $value, FILTER_VALIDATE_INT ) ) {
                            $errors[$field] = sprintf( __( '%s蹇呴』鏄暣鏁?, 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'equals':
                        if ( isset( $data[$rule_params[0]] ) && $value !== $data[$rule_params[0]] ) {
                            $errors[$field] = sprintf( __( '%s鍜?s蹇呴』鐩稿悓', 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'regex':
                        if ( ! empty( $value ) && ! preg_match( $rule_params[0], $value ) ) {
                            $errors[$field] = sprintf( __( '%s鏍煎紡涓嶆纭?, 'sut-wechat-mini' ), $field );
                        }
                        break;
                }
            }
        }
        
        return array(
            'valid' => empty( $errors ),
            'errors' => $errors,
        );
    }
    
    /**
     * 鑾峰彇鏂囦欢澶у皬鐨勫彲璇诲舰寮?     *
     * @param int $bytes 鏂囦欢澶у皬锛堝瓧鑺傦級
     * @return string 鍙鐨勬枃浠跺ぇ灏?     */
    public static function format_file_size( $bytes ) {
        if ( $bytes < 1024 ) {
            return $bytes . ' B';
        } elseif ( $bytes < 1048576 ) {
            return round( $bytes / 1024, 2 ) . ' KB';
        } elseif ( $bytes < 1073741824 ) {
            return round( $bytes / 1048576, 2 ) . ' MB';
        } else {
            return round( $bytes / 1073741824, 2 ) . ' GB';
        }
    }
    
    /**
     * 鑾峰彇鐢ㄦ埛娴忚鍣ㄤ俊鎭?     *
     * @return array 娴忚鍣ㄤ俊鎭?     */
    public static function get_browser_info() {
        if ( ! isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
            return array(
                'browser' => 'Unknown',
                'version' => 'Unknown',
                'platform' => 'Unknown',
            );
        }
        
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        $browser = 'Unknown';
        $version = 'Unknown';
        $platform = 'Unknown';
        
        // 鑾峰彇骞冲彴
        if ( strpos( $user_agent, 'Windows' ) !== false ) {
            $platform = 'Windows';
        } elseif ( strpos( $user_agent, 'Macintosh' ) !== false ) {
            $platform = 'Mac';
        } elseif ( strpos( $user_agent, 'Linux' ) !== false ) {
            $platform = 'Linux';
        } elseif ( strpos( $user_agent, 'iPhone' ) !== false ) {
            $platform = 'iPhone';
        } elseif ( strpos( $user_agent, 'iPad' ) !== false ) {
            $platform = 'iPad';
        } elseif ( strpos( $user_agent, 'Android' ) !== false ) {
            $platform = 'Android';
        }
        
        // 鑾峰彇娴忚鍣?        if ( strpos( $user_agent, 'Edge' ) !== false ) {
            $browser = 'Edge';
            preg_match( '/Edge\/(\d+\.\d+)/', $user_agent, $matches );
            if ( isset( $matches[1] ) ) {
                $version = $matches[1];
            }
        } elseif ( strpos( $user_agent, 'Chrome' ) !== false && strpos( $user_agent, 'Safari' ) !== false ) {
            $browser = 'Chrome';
            preg_match( '/Chrome\/(\d+\.\d+)/', $user_agent, $matches );
            if ( isset( $matches[1] ) ) {
                $version = $matches[1];
            }
        } elseif ( strpos( $user_agent, 'Firefox' ) !== false ) {
            $browser = 'Firefox';
            preg_match( '/Firefox\/(\d+\.\d+)/', $user_agent, $matches );
            if ( isset( $matches[1] ) ) {
                $version = $matches[1];
            }
        } elseif ( strpos( $user_agent, 'Safari' ) !== false ) {
            $browser = 'Safari';
            preg_match( '/Version\/(\d+\.\d+)/', $user_agent, $matches );
            if ( isset( $matches[1] ) ) {
                $version = $matches[1];
            }
        } elseif ( strpos( $user_agent, 'MSIE' ) !== false || strpos( $user_agent, 'Trident' ) !== false ) {
            $browser = 'Internet Explorer';
            preg_match( '/(?:MSIE|rv:)\s*(\d+\.\d+)/', $user_agent, $matches );
            if ( isset( $matches[1] ) ) {
                $version = $matches[1];
            }
        }
        
        return array(
            'browser' => $browser,
            'version' => $version,
            'platform' => $platform,
        );
    }
    
    /**
     * 妫€娴嬫槸鍚︽槸寰俊娴忚鍣?     *
     * @return bool 妫€娴嬬粨鏋?     */
    public static function is_wechat_browser() {
        if ( ! isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
            return false;
        }
        
        $user_agent = strtolower( $_SERVER['HTTP_USER_AGENT'] );
        return strpos( $user_agent, 'micromessenger' ) !== false;
    }
    
    /**
     * 妫€娴嬫槸鍚︽槸绉诲姩璁惧
     *
     * @return bool 妫€娴嬬粨鏋?     */
    public static function is_mobile_device() {
        if ( ! isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
            return false;
        }
        
        $user_agent = strtolower( $_SERVER['HTTP_USER_AGENT'] );
        $mobile_keywords = array(
            'mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone',
            'nokia', 'samsung', 'opera mini', 'mobile safari', 'webos', 'palm', 'iemobile'
        );
        
        foreach ( $mobile_keywords as $keyword ) {
            if ( strpos( $user_agent, $keyword ) !== false ) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 鑾峰彇鎻掍欢璁剧疆
     *
     * @param string $key 璁剧疆閿?     * @param mixed $default 榛樿鍊?     * @return mixed 璁剧疆鍊?     */
    public static function get_setting( $key, $default = null ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings[$key] ) ) {
            return $settings[$key];
        }
        
        return $default;
    }
    
    /**
     * 鏇存柊鎻掍欢璁剧疆
     *
     * @param string $key 璁剧疆閿?     * @param mixed $value 璁剧疆鍊?     * @return bool 鏇存柊缁撴灉
     */
    public static function update_setting( $key, $value ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $settings[$key] = $value;
        
        return update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 鍒犻櫎鎻掍欢璁剧疆
     *
     * @param string $key 璁剧疆閿?     * @return bool 鍒犻櫎缁撴灉
     */
    public static function delete_setting( $key ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings[$key] ) ) {
            unset( $settings[$key] );
            return update_option( 'sut_wechat_mini_settings', $settings );
        }
        
        return true;
    }
    
    /**
     * 缂撳瓨绠＄悊 - 璁剧疆缂撳瓨
     *
     * @param string $key 缂撳瓨閿?     * @param mixed $data 缂撳瓨鏁版嵁
     * @param int $expire 杩囨湡鏃堕棿锛堢锛?     * @return bool 璁剧疆缁撴灉
     */
    public static function set_cache( $key, $data, $expire = 3600 ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_set( $cache_key, $data, 'sut-wechat-mini', $expire );
    }
    
    /**
     * 缂撳瓨绠＄悊 - 鑾峰彇缂撳瓨
     *
     * @param string $key 缂撳瓨閿?     * @return mixed 缂撳瓨鏁版嵁
     */
    public static function get_cache( $key ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_get( $cache_key, 'sut-wechat-mini' );
    }
    
    /**
     * 缂撳瓨绠＄悊 - 鍒犻櫎缂撳瓨
     *
     * @param string $key 缂撳瓨閿?     * @return bool 鍒犻櫎缁撴灉
     */
    public static function delete_cache( $key ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_delete( $cache_key, 'sut-wechat-mini' );
    }
    
    /**
     * 缂撳瓨绠＄悊 - 娓呯悊鎵€鏈夌紦瀛?     *
     * @return bool 娓呯悊缁撴灉
     */
    public static function flush_cache() {
        return wp_cache_flush_group( 'sut-wechat-mini' );
    }
    
    /**
     * 璁板綍鏃ュ織
     *
     * @param string $message 鏃ュ織娑堟伅
     * @param string $level 鏃ュ織绾у埆
     * @param array $context 涓婁笅鏂囦俊鎭?     * @return bool 璁板綍缁撴灉
     */
    public static function log( $message, $level = 'info', $context = array() ) {
        // 妫€鏌ユ槸鍚﹀惎鐢ㄤ簡璋冭瘯妯″紡
        if ( ! WP_DEBUG ) {
            return false;
        }
        
        $levels = array('debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency');
        $level = strtolower( $level );
        
        // 楠岃瘉鏃ュ織绾у埆
        if ( ! in_array( $level, $levels ) ) {
            $level = 'info';
        }
        
        // 鏋勫缓鏃ュ織娑堟伅
        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[$timestamp] [$level] $message";
        
        // 娣诲姞涓婁笅鏂囦俊鎭?        if ( ! empty( $context ) ) {
            $log_message .= ' ' . json_encode( $context );
        }
        
        // 鍐欏叆鏃ュ織鏂囦欢
        $log_file = WP_CONTENT_DIR . '/sut-wechat-mini.log';
        
        return error_log( $log_message . "\n", 3, $log_file );
    }
    
    /**
     * 璁板綍閿欒鏃ュ織
     *
     * @param string $message 閿欒娑堟伅
     * @param array $context 涓婁笅鏂囦俊鎭?     * @return bool 璁板綍缁撴灉
     */
    public static function log_error( $message, $context = array() ) {
        return self::log( $message, 'error', $context );
    }
    
    /**
     * 璁板綍璋冭瘯鏃ュ織
     *
     * @param string $message 璋冭瘯娑堟伅
     * @param array $context 涓婁笅鏂囦俊鎭?     * @return bool 璁板綍缁撴灉
     */
    public static function log_debug( $message, $context = array() ) {
        return self::log( $message, 'debug', $context );
    }
    
    /**
     * 閫掑綊鍒涘缓鐩綍
     *
     * @param string $path 鐩綍璺緞
     * @param int $mode 鐩綍鏉冮檺
     * @return bool 鍒涘缓缁撴灉
     */
    public static function create_directory( $path, $mode = 0755 ) {
        if ( is_dir( $path ) ) {
            return true;
        }
        
        return wp_mkdir_p( $path, $mode );
    }
    
    /**
     * 妫€鏌ョ洰褰曟槸鍚﹀彲鍐?     *
     * @param string $path 鐩綍璺緞
     * @return bool 妫€鏌ョ粨鏋?     */
    public static function is_directory_writable( $path ) {
        if ( ! is_dir( $path ) ) {
            return false;
        }
        
        return wp_is_writable( $path );
    }
    
    /**
     * 鑾峰彇鐩綍澶у皬
     *
     * @param string $path 鐩綍璺緞
     * @return int 鐩綍澶у皬锛堝瓧鑺傦級
     */
    public static function get_directory_size( $path ) {
        $size = 0;
        
        if ( ! is_dir( $path ) ) {
            return $size;
        }
        
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator( $path, RecursiveDirectoryIterator::SKIP_DOTS ),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ( $files as $file ) {
            if ( $file->isFile() ) {
                $size += $file->getSize();
            }
        }
        
        return $size;
    }
    
    /**
     * 鐢熸垚闅忔満瀛楃涓?     *
     * @param int $length 瀛楃涓查暱搴?     * @param string $chars 瀛楃闆?     * @return string 闅忔満瀛楃涓?     */
    public static function generate_random_string( $length = 16, $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ) {
        $chars_length = strlen( $chars );
        $random_string = '';
        
        for ( $i = 0; $i < $length; $i++ ) {
            $random_string .= $chars[ rand( 0, $chars_length - 1 ) ];
        }
        
        return $random_string;
    }
    
    /**
     * 娣卞害鍚堝苟鏁扮粍
     *
     * @param array $array1 绗竴涓暟缁?     * @param array $array2 绗簩涓暟缁?     * @return array 鍚堝苟鍚庣殑鏁扮粍
     */
    public static function deep_merge_arrays( $array1, $array2 ) {
        foreach ( $array2 as $key => $value ) {
            if ( is_array( $value ) && isset( $array1[$key] ) && is_array( $array1[$key] ) ) {
                $array1[$key] = self::deep_merge_arrays( $array1[$key], $value );
            } else {
                $array1[$key] = $value;
            }
        }
        
        return $array1;
    }
    
    /**
     * 鑾峰彇鏂囦欢鎵╁睍鍚?     *
     * @param string $filename 鏂囦欢鍚?     * @return string 鏂囦欢鎵╁睍鍚?     */
    public static function get_file_extension( $filename ) {
        return strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
    }
    
    /**
     * 妫€鏌ユ枃浠剁被鍨嬫槸鍚﹀厑璁?     *
     * @param string $filename 鏂囦欢鍚?     * @param array $allowed_types 鍏佽鐨勬枃浠剁被鍨?     * @return bool 妫€鏌ョ粨鏋?     */
    public static function is_allowed_file_type( $filename, $allowed_types = array() ) {
        if ( empty( $allowed_types ) ) {
            $allowed_types = array(
                'jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'
            );
        }
        
        $extension = self::get_file_extension( $filename );
        
        return in_array( $extension, $allowed_types );
    }
    
    /**
     * 鑾峰彇鍐呭瓨浣跨敤鎯呭喌
     *
     * @return array 鍐呭瓨浣跨敤鎯呭喌
     */
    public static function get_memory_usage() {
        $usage = array(
            'current' => memory_get_usage(),
            'peak' => memory_get_peak_usage(),
        );
        
        return $usage;
    }
    
    /**
     * 鑾峰彇鎵ц鏃堕棿
     *
     * @return array 鎵ц鏃堕棿
     */
    public static function get_execution_time() {
        $time = array(
            'current' => microtime( true ),
            'start' => $_SERVER['REQUEST_TIME_FLOAT'],
        );
        
        $time['elapsed'] = $time['current'] - $time['start'];
        
        return $time;
    }
}\n