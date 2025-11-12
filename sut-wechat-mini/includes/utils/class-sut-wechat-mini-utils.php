锘??php
/**
 * SUT瀵邦喕淇婄亸蹇曗柤鎼村繐浼愰崗宄板毐閺佹壆琚? *
 * 閸栧懎鎯堥崥鍕潚闁氨鏁ら惃鍕紣閸忓嘲鍤遍弫? *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Utils 缁? */
class SUT_WeChat_Mini_Utils {
    
    /**
     * 閻㈢喐鍨氶崬顖欑ID
     *
     * @param string $prefix 閸撳秶绱?     * @return string 閸烆垯绔碔D
     */
    public static function generate_unique_id( $prefix = '' ) {
        return $prefix . uniqid() . '-' . substr( md5( microtime() . rand() ), 0, 8 );
    }
    
    /**
     * 閸旂姴鐦戦弫鐗堝祦
     *
     * @param string $data 鐟曚礁濮炵€靛棛娈戦弫鐗堝祦
     * @param string $key 閸旂姴鐦戠€靛棝鎸?     * @return string 閸旂姴鐦戦崥搴ｆ畱閺佺増宓?     */
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
     * 鐟欙絽鐦戦弫鐗堝祦
     *
     * @param string $data 鐟曚浇袙鐎靛棛娈戦弫鐗堝祦
     * @param string $key 鐟欙絽鐦戠€靛棝鎸?     * @return string 鐟欙絽鐦戦崥搴ｆ畱閺佺増宓?     */
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
     * 閻㈢喐鍨氱粵鎯ф倳
     *
     * @param array $params 閸欏倹鏆熼弫鎵矋
     * @param string $key 鐎靛棝鎸?     * @return string 缁涙儳鎮?     */
    public static function generate_signature( $params, $key ) {
        // 閹稿寮弫鏉挎倳ASCII閻椒绮犵亸蹇撳煂婢堆勫笓鎼?        ksort( $params );
        
        // 閹峰吋甯撮崣鍌涙殶
        $str = '';
        foreach ( $params as $k => $v ) {
            if ( $v !== '' && $k !== 'sign' ) {
                $str .= $k . '=' . $v . '&';
            }
        }
        
        // 濞ｈ濮炵€靛棝鎸滈獮绂5閸旂姴鐦?        $str .= 'key=' . $key;
        $sign = strtoupper( md5( $str ) );
        
        return $sign;
    }
    
    /**
     * 妤犲矁鐦夌粵鎯ф倳
     *
     * @param array $params 閸欏倹鏆熼弫鎵矋
     * @param string $key 鐎靛棝鎸?     * @return bool 妤犲矁鐦夌紒鎾寸亯
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
     * 閸欐垿鈧笭TTP鐠囬攱鐪?     *
     * @param string $url 鐠囬攱鐪癠RL
     * @param array $params 鐠囬攱鐪伴崣鍌涙殶
     * @param array $options 鐠囬攱鐪伴柅澶愩€?     * @return array 閸濆秴绨茬紒鎾寸亯
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
        
        // 閺嬪嫬缂撶拠閿嬬湴
        if ( $options['method'] === 'GET' && ! empty( $params ) ) {
            $url = add_query_arg( $params, $url );
        } elseif ( in_array( $options['method'], array( 'POST', 'PUT', 'DELETE' ) ) && ! empty( $params ) ) {
            $body = '';
            
            // 濡偓閺岊檳ontent-Type
            $content_type = isset( $options['headers']['Content-Type'] ) ? $options['headers']['Content-Type'] : '';
            
            if ( $content_type === 'application/json' ) {
                $body = wp_json_encode( $params );
            } else {
                $body = http_build_query( $params );
            }
            
            $options['body'] = $body;
        }
        
        // 閸欐垿鈧浇顕Ч?        $response = wp_remote_request( $url, $options );
        
        // 濡偓閺屻儵鏁婄拠?        if ( is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
                'data' => null,
            );
        }
        
        // 鐟欙絾鐎介崫宥呯安
        $code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        $headers = wp_remote_retrieve_headers( $response );
        
        // 鐏忔繆鐦憴锝嗙€絁SON
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
     * 閸欐垿鈧笩ET鐠囬攱鐪?     *
     * @param string $url 鐠囬攱鐪癠RL
     * @param array $params 鐠囬攱鐪伴崣鍌涙殶
     * @param array $options 鐠囬攱鐪伴柅澶愩€?     * @return array 閸濆秴绨茬紒鎾寸亯
     */
    public static function send_get_request( $url, $params = array(), $options = array() ) {
        $options['method'] = 'GET';
        return self::send_request( $url, $params, $options );
    }
    
    /**
     * 閸欐垿鈧赋OST鐠囬攱鐪?     *
     * @param string $url 鐠囬攱鐪癠RL
     * @param array $params 鐠囬攱鐪伴崣鍌涙殶
     * @param array $options 鐠囬攱鐪伴柅澶愩€?     * @return array 閸濆秴绨茬紒鎾寸亯
     */
    public static function send_post_request( $url, $params = array(), $options = array() ) {
        $options['method'] = 'POST';
        return self::send_request( $url, $params, $options );
    }
    
    /**
     * 閼惧嘲褰囩€广垺鍩涚粩鐤楶閸︽澘娼?     *
     * @return string IP閸︽澘娼?     */
    public static function get_client_ip() {
        if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // 婢跺嫮鎮婃径姘嚋IP閸︽澘娼冮惃鍕剰閸?        if ( strpos( $ip, ',' ) !== false ) {
            $ips = explode( ',', $ip );
            $ip = trim( $ips[0] );
        }
        
        return $ip;
    }
    
    /**
     * 濡偓閺岊檹P閺勵垰鎯侀崷銊ф閸氬秴宕熸稉?     *
     * @param string $ip IP閸︽澘娼?     * @param array $whitelist IP閻ц棄鎮曢崡?     * @return bool 濡偓閺屻儳绮ㄩ弸?     */
    public static function is_ip_whitelisted( $ip, $whitelist ) {
        if ( empty( $whitelist ) ) {
            return true;
        }
        
        foreach ( $whitelist as $whitelisted_ip ) {
            $whitelisted_ip = trim( $whitelisted_ip );
            
            // 濡偓閺屻儲妲搁崥锔芥Ц鐎瑰苯鍙忛崠褰掑帳
            if ( $ip === $whitelisted_ip ) {
                return true;
            }
            
            // 濡偓閺屻儲妲搁崥锔芥ЦCIDR閺嶇厧绱?            if ( strpos( $whitelisted_ip, '/' ) !== false ) {
                list( $subnet, $mask ) = explode( '/', $whitelisted_ip, 2 );
                
                if ( self::ip_in_range( $ip, $subnet, $mask ) ) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 濡偓閺岊檹P閺勵垰鎯侀崷銊﹀瘹鐎规艾鐡欑純鎴ｅ瘱閸ユ潙鍞?     *
     * @param string $ip IP閸︽澘娼?     * @param string $subnet 鐎涙劗缍夐崷鏉挎絻
     * @param int $mask 鐎涙劗缍夐幒鈺冪垳
     * @return bool 濡偓閺屻儳绮ㄩ弸?     */
    private static function ip_in_range( $ip, $subnet, $mask ) {
        $ip = ip2long( $ip );
        $subnet = ip2long( $subnet );
        $mask = -1 << ( 32 - $mask );
        
        return ( $ip & $mask ) === ( $subnet & $mask );
    }
    
    /**
     * 閺嶇厧绱￠崠鏍ㄦ闂?     *
     * @param string|int $timestamp 閺冨爼妫块幋?     * @param string $format 閺冨爼妫块弽鐓庣础
     * @return string 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫭妞傞梻?     */
    public static function format_time( $timestamp, $format = 'Y-m-d H:i:s' ) {
        if ( is_numeric( $timestamp ) ) {
            return date( $format, $timestamp );
        }
        
        return date( $format, strtotime( $timestamp ) );
    }
    
    /**
     * 閼惧嘲褰囬惄绋款嚠閺冨爼妫?     *
     * @param string|int $timestamp 閺冨爼妫块幋?     * @return string 閻╃顕弮鍫曟？
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
            return sprintf( __( '%d缁夋帒澧?, 'sut-wechat-mini' ), $diff );
        } elseif ( $diff < 3600 ) {
            $minutes = floor( $diff / 60 );
            return sprintf( __( '%d閸掑棝鎸撻崜?, 'sut-wechat-mini' ), $minutes );
        } elseif ( $diff < 86400 ) {
            $hours = floor( $diff / 3600 );
            return sprintf( __( '%d鐏忓繑妞傞崜?, 'sut-wechat-mini' ), $hours );
        } elseif ( $diff < 2592000 ) {
            $days = floor( $diff / 86400 );
            return sprintf( __( '%d婢垛晛澧?, 'sut-wechat-mini' ), $days );
        } else {
            return self::format_time( $time, 'Y-m-d' );
        }
    }
    
    /**
     * 閹搭亜褰囩€涙顑佹稉?     *
     * @param string $str 閸樼喎顫愮€涙顑佹稉?     * @param int $length 閹搭亜褰囬梹鍨
     * @param string $suffix 閸氬海绱?     * @return string 閹搭亜褰囬崥搴ｆ畱鐎涙顑佹稉?     */
    public static function truncate_string( $str, $length = 100, $suffix = '...' ) {
        if ( mb_strlen( $str, 'UTF-8' ) <= $length ) {
            return $str;
        }
        
        return mb_substr( $str, 0, $length, 'UTF-8' ) . $suffix;
    }
    
    /**
     * 濞撳懐鎮奌TML閺嶅洨顒?     *
     * @param string $html HTML閸愬懎顔?     * @param array $allowed_tags 閸忎浇顔忛惃鍕垼缁?     * @return string 濞撳懐鎮婇崥搴ｆ畱閸愬懎顔?     */
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
     * 鏉烆剚宕睭TML閸掔檿arkdown
     *
     * @param string $html HTML閸愬懎顔?     * @return string Markdown閸愬懎顔?     */
    public static function html_to_markdown( $html ) {
        // 缁犫偓閸栨牜娈慔TML閸掔檿arkdown鏉烆剚宕?        $html = str_replace( '<h1>', '# ', $html );
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
        
        // 婢跺嫮鎮婇柧鐐复
        $html = preg_replace( '/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/i', '[\2](\1)', $html );
        
        // 婢跺嫮鎮婇崶鍓у
        $html = preg_replace( '/<img\s+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i', '![\2](\1)', $html );
        $html = preg_replace( '/<img\s+src="([^"]+)"[^>]*>/i', '![閸ュ墽澧朷(\1)', $html );
        
        // 婢跺嫮鎮婇弮鐘茬碍閸掓銆?        $html = str_replace( '<ul>', '\n\n', $html );
        $html = str_replace( '</ul>', '\n\n', $html );
        $html = str_replace( '<li>', '- ', $html );
        $html = str_replace( '</li>', '\n', $html );
        
        // 婢跺嫮鎮婇張澶婄碍閸掓銆?        $html = str_replace( '<ol>', '\n\n', $html );
        $html = str_replace( '</ol>', '\n\n', $html );
        
        // 婢跺嫮鎮婃禒锝囩垳閸?        $html = str_replace( '<pre><code>', '```\n', $html );
        $html = str_replace( '</code></pre>', '\n```\n\n', $html );
        $html = str_replace( '<code>', '`', $html );
        $html = str_replace( '</code>', '`', $html );
        
        // 缁夊娅庨崜鈺€缍戦惃鍑ML閺嶅洨顒?        $html = strip_tags( $html );
        
        // 濞撳懐鎮婃径姘稇閻ㄥ嫮鈹栫悰?        $html = preg_replace( '/\n{3,}/', '\n\n', $html );
        
        return trim( $html );
    }
    
    /**
     * 鏉烆剚宕睭TML娑撳搫鐨粙瀣碍閺€顖涘瘮閻ㄥ嫭鐗稿?     *
     * @param string $html HTML閸愬懎顔?     * @return array 鏉烆剚宕查崥搴ｆ畱閸愬懎顔愰弫鎵矋
     */
    public static function html_to_mini_program( $html ) {
        // 濞撳懐鎮奌TML閺嶅洨顒?        $html = self::clean_html( $html );
        
        // 鏉烆剚宕查崶鍓у鐠侯垰绶?        $html = preg_replace_callback( '/<img\s+src="([^"]+)"([^>]*)>/i', function( $matches ) {
            $src = $matches[1];
            $attrs = $matches[2];
            
            // 绾喕绻氶崶鍓у鐠侯垰绶為弰顖滅卜鐎电鐭惧?            if ( strpos( $src, 'http' ) !== 0 ) {
                $src = home_url( $src );
            }
            
            return '<img src="' . $src . '"' . $attrs . ' />';
        }, $html );
        
        // 鏉烆剚宕查柧鐐复
        $html = preg_replace_callback( '/<a\s+href="([^"]+)"([^>]*)>(.*?)<\/a>/i', function( $matches ) {
            $href = $matches[1];
            $attrs = $matches[2];
            $text = $matches[3];
            
            // 绾喕绻氶柧鐐复閺勵垳绮风€电鐭惧?            if ( strpos( $href, 'http' ) !== 0 ) {
                $href = home_url( $href );
            }
            
            return '<a href="' . $href . '"' . $attrs . '>' . $text . '</a>';
        }, $html );
        
        // 閸掑棗澹婇崘鍛啇娑撶儤顔岄拃?        $segments = array();
        $dom = new DOMDocument();
        
        // 濞ｈ濮為弽鐟板帗缁辩姳浜掔涵顔荤箽HTML閺堝鏅?        $wrapper = '<div id="content-wrapper">' . $html . '</div>';
        
        // 婢跺嫮鎮奌TML鐎圭偘缍嬮崪瀛禩F-8缂傛牜鐖?        $wrapper = mb_convert_encoding( $wrapper, 'HTML-ENTITIES', 'UTF-8' );
        
        // 閸旂姾娴嘓TML
        @$dom->loadHTML( $wrapper );
        
        // 閼惧嘲褰囬幍鈧張澶夌缁狙冪摍閸忓啰绀?        $wrapper_element = $dom->getElementById( 'content-wrapper' );
        if ( $wrapper_element ) {
            $children = $wrapper_element->childNodes;
            
            foreach ( $children as $child ) {
                if ( $child->nodeType === XML_ELEMENT_NODE || $child->nodeType === XML_TEXT_NODE ) {
                    $node_name = strtolower( $child->nodeName );
                    $content = trim( $dom->saveHTML( $child ) );
                    
                    if ( ! empty( $content ) ) {
                        // 閺嶈宓侀懞鍌滃仯缁鐎峰ǎ璇插閸掔増顔岄拃鑺ユ殶缂?                        switch ( $node_name ) {
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
                                // 婢跺嫮鎮婇弬鍥ㄦ拱閼哄倻鍋ｉ崪灞藉従娴犳牕鍘撶槐?                                if ( ! empty( $content ) && $node_name !== '#text' ) {
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
     * 閼惧嘲褰囬弬鍥╃彿閻楃澹婇崶鍓у
     *
     * @param int $post_id 閺傚洨鐝稩D
     * @param string $size 閸ュ墽澧栫亸鍝勵嚟
     * @return array 閸ュ墽澧栨穱鈩冧紖
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
     * 閺嶇厧绱￠崠鏍︾幆閺?     *
     * @param float $price 娴犻攱鐗?     * @param string $currency 鐠愌冪缁楋箑褰?     * @return string 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫪鐜弽?     */
    public static function format_price( $price, $currency = '妤? ) {
        if ( class_exists( 'WooCommerce' ) ) {
            return wc_price( $price );
        }
        
        return $currency . number_format( $price, 2, '.', ',' );
    }
    
    /**
     * 妤犲矁鐦夌悰銊ュ礋閺佺増宓?     *
     * @param array $data 鐞涖劌宕熼弫鐗堝祦
     * @param array $rules 妤犲矁鐦夌憴鍕灟
     * @return array 妤犲矁鐦夌紒鎾寸亯
     */
    public static function validate_form( $data, $rules ) {
        $errors = array();
        
        foreach ( $rules as $field => $rule ) {
            $value = isset( $data[$field] ) ? $data[$field] : '';
            
            // 閸掑棗澹婄憴鍕灟
            $rule_parts = explode( '|', $rule );
            
            foreach ( $rule_parts as $rule_part ) {
                // 濡偓閺屻儲妲搁崥锔芥箒閸欏倹鏆?                $rule_args = explode( ':', $rule_part );
                $rule_name = $rule_args[0];
                $rule_params = array_slice( $rule_args, 1 );
                
                switch ( $rule_name ) {
                    case 'required':
                        if ( empty( $value ) ) {
                            $errors[$field] = sprintf( __( '%s閺勵垰绻€婵夘偊銆?, 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'email':
                        if ( ! empty( $value ) && ! is_email( $value ) ) {
                            $errors[$field] = __( '鐠囩柉绶崗銉︽箒閺佸牏娈戦柇顔绢唸閸︽澘娼?, 'sut-wechat-mini' );
                        }
                        break;
                    case 'url':
                        if ( ! empty( $value ) && ! filter_var( $value, FILTER_VALIDATE_URL ) ) {
                            $errors[$field] = __( '鐠囩柉绶崗銉︽箒閺佸牏娈慤RL閸︽澘娼?, 'sut-wechat-mini' );
                        }
                        break;
                    case 'min':
                        if ( ! empty( $value ) && strlen( $value ) < $rule_params[0] ) {
                            $errors[$field] = sprintf( __( '%s闂€鍨娑撳秷鍏樼亸鎴滅艾%d娑擃亜鐡х粭?, 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'max':
                        if ( ! empty( $value ) && strlen( $value ) > $rule_params[0] ) {
                            $errors[$field] = sprintf( __( '%s闂€鍨娑撳秷鍏樼搾鍛扮箖%d娑擃亜鐡х粭?, 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'numeric':
                        if ( ! empty( $value ) && ! is_numeric( $value ) ) {
                            $errors[$field] = sprintf( __( '%s韫囧懘銆忛弰顖涙殶鐎?, 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'integer':
                        if ( ! empty( $value ) && ! filter_var( $value, FILTER_VALIDATE_INT ) ) {
                            $errors[$field] = sprintf( __( '%s韫囧懘銆忛弰顖涙殻閺?, 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'equals':
                        if ( isset( $data[$rule_params[0]] ) && $value !== $data[$rule_params[0]] ) {
                            $errors[$field] = sprintf( __( '%s閸?s韫囧懘銆忛惄绋挎倱', 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'regex':
                        if ( ! empty( $value ) && ! preg_match( $rule_params[0], $value ) ) {
                            $errors[$field] = sprintf( __( '%s閺嶇厧绱℃稉宥嗩劀绾?, 'sut-wechat-mini' ), $field );
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
     * 閼惧嘲褰囬弬鍥︽婢堆冪毈閻ㄥ嫬褰茬拠璇茶埌瀵?     *
     * @param int $bytes 閺傚洣娆㈡径褍鐨敍鍫濈摟閼哄偊绱?     * @return string 閸欘垵顕伴惃鍕瀮娴犺泛銇囩亸?     */
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
     * 閼惧嘲褰囬悽銊﹀煕濞村繗顫嶉崳銊や繆閹?     *
     * @return array 濞村繗顫嶉崳銊や繆閹?     */
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
        
        // 閼惧嘲褰囬獮鍐插酱
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
        
        // 閼惧嘲褰囧ù蹇氼潔閸?        if ( strpos( $user_agent, 'Edge' ) !== false ) {
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
     * 濡偓濞村妲搁崥锔芥Ц瀵邦喕淇婂ù蹇氼潔閸?     *
     * @return bool 濡偓濞村绮ㄩ弸?     */
    public static function is_wechat_browser() {
        if ( ! isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
            return false;
        }
        
        $user_agent = strtolower( $_SERVER['HTTP_USER_AGENT'] );
        return strpos( $user_agent, 'micromessenger' ) !== false;
    }
    
    /**
     * 濡偓濞村妲搁崥锔芥Ц缁夎濮╃拋鎯ь槵
     *
     * @return bool 濡偓濞村绮ㄩ弸?     */
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
     * 閼惧嘲褰囬幓鎺嶆鐠佸墽鐤?     *
     * @param string $key 鐠佸墽鐤嗛柨?     * @param mixed $default 姒涙顓婚崐?     * @return mixed 鐠佸墽鐤嗛崐?     */
    public static function get_setting( $key, $default = null ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings[$key] ) ) {
            return $settings[$key];
        }
        
        return $default;
    }
    
    /**
     * 閺囧瓨鏌婇幓鎺嶆鐠佸墽鐤?     *
     * @param string $key 鐠佸墽鐤嗛柨?     * @param mixed $value 鐠佸墽鐤嗛崐?     * @return bool 閺囧瓨鏌婄紒鎾寸亯
     */
    public static function update_setting( $key, $value ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $settings[$key] = $value;
        
        return update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 閸掔娀娅庨幓鎺嶆鐠佸墽鐤?     *
     * @param string $key 鐠佸墽鐤嗛柨?     * @return bool 閸掔娀娅庣紒鎾寸亯
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
     * 缂傛挸鐡ㄧ粻锛勬倞 - 鐠佸墽鐤嗙紓鎾崇摠
     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @param mixed $data 缂傛挸鐡ㄩ弫鐗堝祦
     * @param int $expire 鏉╁洦婀￠弮鍫曟？閿涘牏顫楅敍?     * @return bool 鐠佸墽鐤嗙紒鎾寸亯
     */
    public static function set_cache( $key, $data, $expire = 3600 ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_set( $cache_key, $data, 'sut-wechat-mini', $expire );
    }
    
    /**
     * 缂傛挸鐡ㄧ粻锛勬倞 - 閼惧嘲褰囩紓鎾崇摠
     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @return mixed 缂傛挸鐡ㄩ弫鐗堝祦
     */
    public static function get_cache( $key ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_get( $cache_key, 'sut-wechat-mini' );
    }
    
    /**
     * 缂傛挸鐡ㄧ粻锛勬倞 - 閸掔娀娅庣紓鎾崇摠
     *
     * @param string $key 缂傛挸鐡ㄩ柨?     * @return bool 閸掔娀娅庣紒鎾寸亯
     */
    public static function delete_cache( $key ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_delete( $cache_key, 'sut-wechat-mini' );
    }
    
    /**
     * 缂傛挸鐡ㄧ粻锛勬倞 - 濞撳懐鎮婇幍鈧張澶岀处鐎?     *
     * @return bool 濞撳懐鎮婄紒鎾寸亯
     */
    public static function flush_cache() {
        return wp_cache_flush_group( 'sut-wechat-mini' );
    }
    
    /**
     * 鐠佹澘缍嶉弮銉ョ箶
     *
     * @param string $message 閺冦儱绻斿☉鍫熶紖
     * @param string $level 閺冦儱绻旂痪褍鍩?     * @param array $context 娑撳﹣绗呴弬鍥︿繆閹?     * @return bool 鐠佹澘缍嶇紒鎾寸亯
     */
    public static function log( $message, $level = 'info', $context = array() ) {
        // 濡偓閺屻儲妲搁崥锕€鎯庨悽銊ょ啊鐠嬪啳鐦Ο鈥崇础
        if ( ! WP_DEBUG ) {
            return false;
        }
        
        $levels = array('debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency');
        $level = strtolower( $level );
        
        // 妤犲矁鐦夐弮銉ョ箶缁狙冨焼
        if ( ! in_array( $level, $levels ) ) {
            $level = 'info';
        }
        
        // 閺嬪嫬缂撻弮銉ョ箶濞戝牊浼?        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[$timestamp] [$level] $message";
        
        // 濞ｈ濮炴稉濠佺瑓閺傚洣淇婇幁?        if ( ! empty( $context ) ) {
            $log_message .= ' ' . json_encode( $context );
        }
        
        // 閸愭瑥鍙嗛弮銉ョ箶閺傚洣娆?        $log_file = WP_CONTENT_DIR . '/sut-wechat-mini.log';
        
        return error_log( $log_message . "\n", 3, $log_file );
    }
    
    /**
     * 鐠佹澘缍嶉柨娆掝嚖閺冦儱绻?     *
     * @param string $message 闁挎瑨顕ゅ☉鍫熶紖
     * @param array $context 娑撳﹣绗呴弬鍥︿繆閹?     * @return bool 鐠佹澘缍嶇紒鎾寸亯
     */
    public static function log_error( $message, $context = array() ) {
        return self::log( $message, 'error', $context );
    }
    
    /**
     * 鐠佹澘缍嶇拫鍐槸閺冦儱绻?     *
     * @param string $message 鐠嬪啳鐦☉鍫熶紖
     * @param array $context 娑撳﹣绗呴弬鍥︿繆閹?     * @return bool 鐠佹澘缍嶇紒鎾寸亯
     */
    public static function log_debug( $message, $context = array() ) {
        return self::log( $message, 'debug', $context );
    }
    
    /**
     * 闁帒缍婇崚娑樼紦閻╊喖缍?     *
     * @param string $path 閻╊喖缍嶇捄顖氱窞
     * @param int $mode 閻╊喖缍嶉弶鍐
     * @return bool 閸掓稑缂撶紒鎾寸亯
     */
    public static function create_directory( $path, $mode = 0755 ) {
        if ( is_dir( $path ) ) {
            return true;
        }
        
        return wp_mkdir_p( $path, $mode );
    }
    
    /**
     * 濡偓閺屻儳娲拌ぐ鏇熸Ц閸氾箑褰查崘?     *
     * @param string $path 閻╊喖缍嶇捄顖氱窞
     * @return bool 濡偓閺屻儳绮ㄩ弸?     */
    public static function is_directory_writable( $path ) {
        if ( ! is_dir( $path ) ) {
            return false;
        }
        
        return wp_is_writable( $path );
    }
    
    /**
     * 閼惧嘲褰囬惄顔肩秿婢堆冪毈
     *
     * @param string $path 閻╊喖缍嶇捄顖氱窞
     * @return int 閻╊喖缍嶆径褍鐨敍鍫濈摟閼哄偊绱?     */
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
     * 閻㈢喐鍨氶梾蹇旀簚鐎涙顑佹稉?     *
     * @param int $length 鐎涙顑佹稉鏌ユ毐鎼?     * @param string $chars 鐎涙顑侀梿?     * @return string 闂呭繑婧€鐎涙顑佹稉?     */
    public static function generate_random_string( $length = 16, $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ) {
        $chars_length = strlen( $chars );
        $random_string = '';
        
        for ( $i = 0; $i < $length; $i++ ) {
            $random_string .= $chars[ rand( 0, $chars_length - 1 ) ];
        }
        
        return $random_string;
    }
    
    /**
     * 濞ｅ崬瀹抽崥鍫濊嫙閺佹壆绮?     *
     * @param array $array1 缁楊兛绔存稉顏呮殶缂?     * @param array $array2 缁楊兛绨╂稉顏呮殶缂?     * @return array 閸氬牆鑻熼崥搴ｆ畱閺佹壆绮?     */
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
     * 閼惧嘲褰囬弬鍥︽閹碘晛鐫嶉崥?     *
     * @param string $filename 閺傚洣娆㈤崥?     * @return string 閺傚洣娆㈤幍鈺佺潔閸?     */
    public static function get_file_extension( $filename ) {
        return strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
    }
    
    /**
     * 濡偓閺屻儲鏋冩禒鍓佽閸ㄥ妲搁崥锕€鍘戠拋?     *
     * @param string $filename 閺傚洣娆㈤崥?     * @param array $allowed_types 閸忎浇顔忛惃鍕瀮娴犲墎琚崹?     * @return bool 濡偓閺屻儳绮ㄩ弸?     */
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
     * 閼惧嘲褰囬崘鍛摠娴ｈ法鏁ら幆鍛枌
     *
     * @return array 閸愬懎鐡ㄦ担璺ㄦ暏閹懎鍠?     */
    public static function get_memory_usage() {
        $usage = array(
            'current' => memory_get_usage(),
            'peak' => memory_get_peak_usage(),
        );
        
        return $usage;
    }
    
    /**
     * 閼惧嘲褰囬幍褑顢戦弮鍫曟？
     *
     * @return array 閹笛嗩攽閺冨爼妫?     */
    public static function get_execution_time() {
        $time = array(
            'current' => microtime( true ),
            'start' => $_SERVER['REQUEST_TIME_FLOAT'],
        );
        
        $time['elapsed'] = $time['current'] - $time['start'];
        
        return $time;
    }
}\n