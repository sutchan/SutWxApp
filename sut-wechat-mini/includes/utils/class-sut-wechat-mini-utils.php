<?php
/**
 * SUT微信小程序工具函数类
 *
 * 包含各种通用的工具函数
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Utils 类
 */
class SUT_WeChat_Mini_Utils {
    
    /**
     * 生成唯一ID
     *
     * @param string $prefix 前缀
     * @return string 唯一ID
     */
    public static function generate_unique_id( $prefix = '' ) {
        return $prefix . uniqid() . '-' . substr( md5( microtime() . rand() ), 0, 8 );
    }
    
    /**
     * 加密数据
     *
     * @param string $data 要加密的数据
     * @param string $key 加密密钥
     * @return string 加密后的数据
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
     * 解密数据
     *
     * @param string $data 要解密的数据
     * @param string $key 解密密钥
     * @return string 解密后的数据
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
     * 生成签名
     *
     * @param array $params 参数数组
     * @param string $key 密钥
     * @return string 签名
     */
    public static function generate_signature( $params, $key ) {
        // 按参数名ASCII码从小到大排序
        ksort( $params );
        
        // 拼接参数
        $str = '';
        foreach ( $params as $k => $v ) {
            if ( $v !== '' && $k !== 'sign' ) {
                $str .= $k . '=' . $v . '&';
            }
        }
        
        // 添加密钥并MD5加密
        $str .= 'key=' . $key;
        $sign = strtoupper( md5( $str ) );
        
        return $sign;
    }
    
    /**
     * 验证签名
     *
     * @param array $params 参数数组
     * @param string $key 密钥
     * @return bool 验证结果
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
     * 发送HTTP请求
     *
     * @param string $url 请求URL
     * @param array $params 请求参数
     * @param array $options 请求选项
     * @return array 响应结果
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
        
        // 构建请求
        if ( $options['method'] === 'GET' && ! empty( $params ) ) {
            $url = add_query_arg( $params, $url );
        } elseif ( in_array( $options['method'], array( 'POST', 'PUT', 'DELETE' ) ) && ! empty( $params ) ) {
            $body = '';
            
            // 检查Content-Type
            $content_type = isset( $options['headers']['Content-Type'] ) ? $options['headers']['Content-Type'] : '';
            
            if ( $content_type === 'application/json' ) {
                $body = wp_json_encode( $params );
            } else {
                $body = http_build_query( $params );
            }
            
            $options['body'] = $body;
        }
        
        // 发送请求
        $response = wp_remote_request( $url, $options );
        
        // 检查错误
        if ( is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
                'data' => null,
            );
        }
        
        // 解析响应
        $code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        $headers = wp_remote_retrieve_headers( $response );
        
        // 尝试解析JSON
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
     * 发送GET请求
     *
     * @param string $url 请求URL
     * @param array $params 请求参数
     * @param array $options 请求选项
     * @return array 响应结果
     */
    public static function send_get_request( $url, $params = array(), $options = array() ) {
        $options['method'] = 'GET';
        return self::send_request( $url, $params, $options );
    }
    
    /**
     * 发送POST请求
     *
     * @param string $url 请求URL
     * @param array $params 请求参数
     * @param array $options 请求选项
     * @return array 响应结果
     */
    public static function send_post_request( $url, $params = array(), $options = array() ) {
        $options['method'] = 'POST';
        return self::send_request( $url, $params, $options );
    }
    
    /**
     * 获取客户端IP地址
     *
     * @return string IP地址
     */
    public static function get_client_ip() {
        if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // 处理多个IP地址的情况
        if ( strpos( $ip, ',' ) !== false ) {
            $ips = explode( ',', $ip );
            $ip = trim( $ips[0] );
        }
        
        return $ip;
    }
    
    /**
     * 检查IP是否在白名单中
     *
     * @param string $ip IP地址
     * @param array $whitelist IP白名单
     * @return bool 检查结果
     */
    public static function is_ip_whitelisted( $ip, $whitelist ) {
        if ( empty( $whitelist ) ) {
            return true;
        }
        
        foreach ( $whitelist as $whitelisted_ip ) {
            $whitelisted_ip = trim( $whitelisted_ip );
            
            // 检查是否是完全匹配
            if ( $ip === $whitelisted_ip ) {
                return true;
            }
            
            // 检查是否是CIDR格式
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
     * 检查IP是否在指定子网范围内
     *
     * @param string $ip IP地址
     * @param string $subnet 子网地址
     * @param int $mask 子网掩码
     * @return bool 检查结果
     */
    private static function ip_in_range( $ip, $subnet, $mask ) {
        $ip = ip2long( $ip );
        $subnet = ip2long( $subnet );
        $mask = -1 << ( 32 - $mask );
        
        return ( $ip & $mask ) === ( $subnet & $mask );
    }
    
    /**
     * 格式化时间
     *
     * @param string|int $timestamp 时间戳
     * @param string $format 时间格式
     * @return string 格式化后的时间
     */
    public static function format_time( $timestamp, $format = 'Y-m-d H:i:s' ) {
        if ( is_numeric( $timestamp ) ) {
            return date( $format, $timestamp );
        }
        
        return date( $format, strtotime( $timestamp ) );
    }
    
    /**
     * 获取相对时间
     *
     * @param string|int $timestamp 时间戳
     * @return string 相对时间
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
            return sprintf( __( '%d秒前', 'sut-wechat-mini' ), $diff );
        } elseif ( $diff < 3600 ) {
            $minutes = floor( $diff / 60 );
            return sprintf( __( '%d分钟前', 'sut-wechat-mini' ), $minutes );
        } elseif ( $diff < 86400 ) {
            $hours = floor( $diff / 3600 );
            return sprintf( __( '%d小时前', 'sut-wechat-mini' ), $hours );
        } elseif ( $diff < 2592000 ) {
            $days = floor( $diff / 86400 );
            return sprintf( __( '%d天前', 'sut-wechat-mini' ), $days );
        } else {
            return self::format_time( $time, 'Y-m-d' );
        }
    }
    
    /**
     * 截取字符串
     *
     * @param string $str 原始字符串
     * @param int $length 截取长度
     * @param string $suffix 后缀
     * @return string 截取后的字符串
     */
    public static function truncate_string( $str, $length = 100, $suffix = '...' ) {
        if ( mb_strlen( $str, 'UTF-8' ) <= $length ) {
            return $str;
        }
        
        return mb_substr( $str, 0, $length, 'UTF-8' ) . $suffix;
    }
    
    /**
     * 清理HTML标签
     *
     * @param string $html HTML内容
     * @param array $allowed_tags 允许的标签
     * @return string 清理后的内容
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
     * 转换HTML到Markdown
     *
     * @param string $html HTML内容
     * @return string Markdown内容
     */
    public static function html_to_markdown( $html ) {
        // 简化的HTML到Markdown转换
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
        
        // 处理链接
        $html = preg_replace( '/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/i', '[\2](\1)', $html );
        
        // 处理图片
        $html = preg_replace( '/<img\s+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i', '![\2](\1)', $html );
        $html = preg_replace( '/<img\s+src="([^"]+)"[^>]*>/i', '![图片](\1)', $html );
        
        // 处理无序列表
        $html = str_replace( '<ul>', '\n\n', $html );
        $html = str_replace( '</ul>', '\n\n', $html );
        $html = str_replace( '<li>', '- ', $html );
        $html = str_replace( '</li>', '\n', $html );
        
        // 处理有序列表
        $html = str_replace( '<ol>', '\n\n', $html );
        $html = str_replace( '</ol>', '\n\n', $html );
        
        // 处理代码块
        $html = str_replace( '<pre><code>', '```\n', $html );
        $html = str_replace( '</code></pre>', '\n```\n\n', $html );
        $html = str_replace( '<code>', '`', $html );
        $html = str_replace( '</code>', '`', $html );
        
        // 移除剩余的HTML标签
        $html = strip_tags( $html );
        
        // 清理多余的空行
        $html = preg_replace( '/\n{3,}/', '\n\n', $html );
        
        return trim( $html );
    }
    
    /**
     * 转换HTML为小程序支持的格式
     *
     * @param string $html HTML内容
     * @return array 转换后的内容数组
     */
    public static function html_to_mini_program( $html ) {
        // 清理HTML标签
        $html = self::clean_html( $html );
        
        // 转换图片路径
        $html = preg_replace_callback( '/<img\s+src="([^"]+)"([^>]*)>/i', function( $matches ) {
            $src = $matches[1];
            $attrs = $matches[2];
            
            // 确保图片路径是绝对路径
            if ( strpos( $src, 'http' ) !== 0 ) {
                $src = home_url( $src );
            }
            
            return '<img src="' . $src . '"' . $attrs . ' />';
        }, $html );
        
        // 转换链接
        $html = preg_replace_callback( '/<a\s+href="([^"]+)"([^>]*)>(.*?)<\/a>/i', function( $matches ) {
            $href = $matches[1];
            $attrs = $matches[2];
            $text = $matches[3];
            
            // 确保链接是绝对路径
            if ( strpos( $href, 'http' ) !== 0 ) {
                $href = home_url( $href );
            }
            
            return '<a href="' . $href . '"' . $attrs . '>' . $text . '</a>';
        }, $html );
        
        // 分割内容为段落
        $segments = array();
        $dom = new DOMDocument();
        
        // 添加根元素以确保HTML有效
        $wrapper = '<div id="content-wrapper">' . $html . '</div>';
        
        // 处理HTML实体和UTF-8编码
        $wrapper = mb_convert_encoding( $wrapper, 'HTML-ENTITIES', 'UTF-8' );
        
        // 加载HTML
        @$dom->loadHTML( $wrapper );
        
        // 获取所有一级子元素
        $wrapper_element = $dom->getElementById( 'content-wrapper' );
        if ( $wrapper_element ) {
            $children = $wrapper_element->childNodes;
            
            foreach ( $children as $child ) {
                if ( $child->nodeType === XML_ELEMENT_NODE || $child->nodeType === XML_TEXT_NODE ) {
                    $node_name = strtolower( $child->nodeName );
                    $content = trim( $dom->saveHTML( $child ) );
                    
                    if ( ! empty( $content ) ) {
                        // 根据节点类型添加到段落数组
                        switch ( $node_name ) {
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
                                // 处理文本节点和其他元素
                                if ( ! empty( $content ) && $node_name !== '#text' ) {
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
     * 获取文章特色图片
     *
     * @param int $post_id 文章ID
     * @param string $size 图片尺寸
     * @return array 图片信息
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
     * 格式化价格
     *
     * @param float $price 价格
     * @param string $currency 货币符号
     * @return string 格式化后的价格
     */
    public static function format_price( $price, $currency = '¥' ) {
        if ( class_exists( 'WooCommerce' ) ) {
            return wc_price( $price );
        }
        
        return $currency . number_format( $price, 2, '.', ',' );
    }
    
    /**
     * 验证表单数据
     *
     * @param array $data 表单数据
     * @param array $rules 验证规则
     * @return array 验证结果
     */
    public static function validate_form( $data, $rules ) {
        $errors = array();
        
        foreach ( $rules as $field => $rule ) {
            $value = isset( $data[$field] ) ? $data[$field] : '';
            
            // 分割规则
            $rule_parts = explode( '|', $rule );
            
            foreach ( $rule_parts as $rule_part ) {
                // 检查是否有参数
                $rule_args = explode( ':', $rule_part );
                $rule_name = $rule_args[0];
                $rule_params = array_slice( $rule_args, 1 );
                
                switch ( $rule_name ) {
                    case 'required':
                        if ( empty( $value ) ) {
                            $errors[$field] = sprintf( __( '%s是必填项', 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'email':
                        if ( ! empty( $value ) && ! is_email( $value ) ) {
                            $errors[$field] = __( '请输入有效的邮箱地址', 'sut-wechat-mini' );
                        }
                        break;
                    case 'url':
                        if ( ! empty( $value ) && ! filter_var( $value, FILTER_VALIDATE_URL ) ) {
                            $errors[$field] = __( '请输入有效的URL地址', 'sut-wechat-mini' );
                        }
                        break;
                    case 'min':
                        if ( ! empty( $value ) && strlen( $value ) < $rule_params[0] ) {
                            $errors[$field] = sprintf( __( '%s长度不能少于%d个字符', 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'max':
                        if ( ! empty( $value ) && strlen( $value ) > $rule_params[0] ) {
                            $errors[$field] = sprintf( __( '%s长度不能超过%d个字符', 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'numeric':
                        if ( ! empty( $value ) && ! is_numeric( $value ) ) {
                            $errors[$field] = sprintf( __( '%s必须是数字', 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'integer':
                        if ( ! empty( $value ) && ! filter_var( $value, FILTER_VALIDATE_INT ) ) {
                            $errors[$field] = sprintf( __( '%s必须是整数', 'sut-wechat-mini' ), $field );
                        }
                        break;
                    case 'equals':
                        if ( isset( $data[$rule_params[0]] ) && $value !== $data[$rule_params[0]] ) {
                            $errors[$field] = sprintf( __( '%s和%s必须相同', 'sut-wechat-mini' ), $field, $rule_params[0] );
                        }
                        break;
                    case 'regex':
                        if ( ! empty( $value ) && ! preg_match( $rule_params[0], $value ) ) {
                            $errors[$field] = sprintf( __( '%s格式不正确', 'sut-wechat-mini' ), $field );
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
     * 获取文件大小的可读形式
     *
     * @param int $bytes 文件大小（字节）
     * @return string 可读的文件大小
     */
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
     * 获取用户浏览器信息
     *
     * @return array 浏览器信息
     */
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
        
        // 获取平台
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
        
        // 获取浏览器
        if ( strpos( $user_agent, 'Edge' ) !== false ) {
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
     * 检测是否是微信浏览器
     *
     * @return bool 检测结果
     */
    public static function is_wechat_browser() {
        if ( ! isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
            return false;
        }
        
        $user_agent = strtolower( $_SERVER['HTTP_USER_AGENT'] );
        return strpos( $user_agent, 'micromessenger' ) !== false;
    }
    
    /**
     * 检测是否是移动设备
     *
     * @return bool 检测结果
     */
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
     * 获取插件设置
     *
     * @param string $key 设置键
     * @param mixed $default 默认值
     * @return mixed 设置值
     */
    public static function get_setting( $key, $default = null ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings[$key] ) ) {
            return $settings[$key];
        }
        
        return $default;
    }
    
    /**
     * 更新插件设置
     *
     * @param string $key 设置键
     * @param mixed $value 设置值
     * @return bool 更新结果
     */
    public static function update_setting( $key, $value ) {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        $settings[$key] = $value;
        
        return update_option( 'sut_wechat_mini_settings', $settings );
    }
    
    /**
     * 删除插件设置
     *
     * @param string $key 设置键
     * @return bool 删除结果
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
     * 缓存管理 - 设置缓存
     *
     * @param string $key 缓存键
     * @param mixed $data 缓存数据
     * @param int $expire 过期时间（秒）
     * @return bool 设置结果
     */
    public static function set_cache( $key, $data, $expire = 3600 ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_set( $cache_key, $data, 'sut-wechat-mini', $expire );
    }
    
    /**
     * 缓存管理 - 获取缓存
     *
     * @param string $key 缓存键
     * @return mixed 缓存数据
     */
    public static function get_cache( $key ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_get( $cache_key, 'sut-wechat-mini' );
    }
    
    /**
     * 缓存管理 - 删除缓存
     *
     * @param string $key 缓存键
     * @return bool 删除结果
     */
    public static function delete_cache( $key ) {
        $cache_key = 'sut_wechat_mini_' . $key;
        return wp_cache_delete( $cache_key, 'sut-wechat-mini' );
    }
    
    /**
     * 缓存管理 - 清理所有缓存
     *
     * @return bool 清理结果
     */
    public static function flush_cache() {
        return wp_cache_flush_group( 'sut-wechat-mini' );
    }
    
    /**
     * 记录日志
     *
     * @param string $message 日志消息
     * @param string $level 日志级别
     * @param array $context 上下文信息
     * @return bool 记录结果
     */
    public static function log( $message, $level = 'info', $context = array() ) {
        // 检查是否启用了调试模式
        if ( ! WP_DEBUG ) {
            return false;
        }
        
        $levels = array('debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency');
        $level = strtolower( $level );
        
        // 验证日志级别
        if ( ! in_array( $level, $levels ) ) {
            $level = 'info';
        }
        
        // 构建日志消息
        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[$timestamp] [$level] $message";
        
        // 添加上下文信息
        if ( ! empty( $context ) ) {
            $log_message .= ' ' . json_encode( $context );
        }
        
        // 写入日志文件
        $log_file = WP_CONTENT_DIR . '/sut-wechat-mini.log';
        
        return error_log( $log_message . "\n", 3, $log_file );
    }
    
    /**
     * 记录错误日志
     *
     * @param string $message 错误消息
     * @param array $context 上下文信息
     * @return bool 记录结果
     */
    public static function log_error( $message, $context = array() ) {
        return self::log( $message, 'error', $context );
    }
    
    /**
     * 记录调试日志
     *
     * @param string $message 调试消息
     * @param array $context 上下文信息
     * @return bool 记录结果
     */
    public static function log_debug( $message, $context = array() ) {
        return self::log( $message, 'debug', $context );
    }
    
    /**
     * 递归创建目录
     *
     * @param string $path 目录路径
     * @param int $mode 目录权限
     * @return bool 创建结果
     */
    public static function create_directory( $path, $mode = 0755 ) {
        if ( is_dir( $path ) ) {
            return true;
        }
        
        return wp_mkdir_p( $path, $mode );
    }
    
    /**
     * 检查目录是否可写
     *
     * @param string $path 目录路径
     * @return bool 检查结果
     */
    public static function is_directory_writable( $path ) {
        if ( ! is_dir( $path ) ) {
            return false;
        }
        
        return wp_is_writable( $path );
    }
    
    /**
     * 获取目录大小
     *
     * @param string $path 目录路径
     * @return int 目录大小（字节）
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
     * 生成随机字符串
     *
     * @param int $length 字符串长度
     * @param string $chars 字符集
     * @return string 随机字符串
     */
    public static function generate_random_string( $length = 16, $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ) {
        $chars_length = strlen( $chars );
        $random_string = '';
        
        for ( $i = 0; $i < $length; $i++ ) {
            $random_string .= $chars[ rand( 0, $chars_length - 1 ) ];
        }
        
        return $random_string;
    }
    
    /**
     * 深度合并数组
     *
     * @param array $array1 第一个数组
     * @param array $array2 第二个数组
     * @return array 合并后的数组
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
     * 获取文件扩展名
     *
     * @param string $filename 文件名
     * @return string 文件扩展名
     */
    public static function get_file_extension( $filename ) {
        return strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
    }
    
    /**
     * 检查文件类型是否允许
     *
     * @param string $filename 文件名
     * @param array $allowed_types 允许的文件类型
     * @return bool 检查结果
     */
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
     * 获取内存使用情况
     *
     * @return array 内存使用情况
     */
    public static function get_memory_usage() {
        $usage = array(
            'current' => memory_get_usage(),
            'peak' => memory_get_peak_usage(),
        );
        
        return $usage;
    }
    
    /**
     * 获取执行时间
     *
     * @return array 执行时间
     */
    public static function get_execution_time() {
        $time = array(
            'current' => microtime( true ),
            'start' => $_SERVER['REQUEST_TIME_FLOAT'],
        );
        
        $time['elapsed'] = $time['current'] - $time['start'];
        
        return $time;
    }
}