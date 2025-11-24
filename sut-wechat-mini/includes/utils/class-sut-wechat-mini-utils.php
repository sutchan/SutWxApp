<?php
/**
 * 文件名: class-sut-wechat-mini-utils.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 工具函数类
 * 
 * 提供微信小程序通用工具函数，包括字符串处理、数组处理、文件处理等
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 工具函数类
 */
class Sut_WeChat_Mini_Utils {
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 初始化
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Utils 工具函数实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 生成随机字符串
     * 
     * @param int $length 字符串长度
     * @param string $type 字符串类型：numeric, alpha, alnum, hex
     * @return string 随机字符串
     */
    public function generate_random_string($length = 16, $type = 'alnum') {
        $chars = '';
        
        switch ($type) {
            case 'numeric':
                $chars = '0123456789';
                break;
            case 'alpha':
                $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'alnum':
                $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'hex':
                $chars = '0123456789abcdef';
                break;
            default:
                $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
        }
        
        $chars_length = strlen($chars);
        $random_string = '';
        
        for ($i = 0; $i < $length; $i++) {
            $random_string .= $chars[random_int(0, $chars_length - 1)];
        }
        
        return $random_string;
    }
    
    /**
     * 生成唯一ID
     * 
     * @param string $prefix 前缀
     * @param bool $more_entropy 是否使用更多熵
     * @return string 唯一ID
     */
    public function generate_unique_id($prefix = '', $more_entropy = false) {
        return uniqid($prefix, $more_entropy);
    }
    
    /**
     * 生成UUID
     * 
     * @param int $version UUID版本：1, 3, 4, 5
     * @return string UUID
     */
    public function generate_uuid($version = 4) {
        switch ($version) {
            case 1:
                // 基于时间的UUID
                return sprintf(
                    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(0, 0xffff),
                    mt_rand(0, 0x0fff) | 0x1000,
                    mt_rand(0, 0x3fff) | 0x8000,
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                );
            case 3:
            case 5:
                // 基于命名空间的UUID（简化版）
                return $this->generate_uuid(4);
            case 4:
            default:
                // 随机UUID
                return sprintf(
                    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(0, 0xffff),
                    mt_rand(0, 0x0fff) | 0x4000,
                    mt_rand(0, 0x3fff) | 0x8000,
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                );
        }
    }
    
    /**
     * 加密字符串
     * 
     * @param string $string 原始字符串
     * @param string $key 加密密钥
     * @param string $method 加密方法
     * @return string 加密后的字符串
     */
    public function encrypt_string($string, $key, $method = 'AES-256-CBC') {
        $iv_length = openssl_cipher_iv_length($method);
        $iv = openssl_random_pseudo_bytes($iv_length);
        
        $encrypted = openssl_encrypt($string, $method, $key, 0, $iv);
        
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * 解密字符串
     * 
     * @param string $string 加密后的字符串
     * @param string $key 解密密钥
     * @param string $method 解密方法
     * @return string|false 解密后的字符串或false
     */
    public function decrypt_string($string, $key, $method = 'AES-256-CBC') {
        $data = base64_decode($string);
        $iv_length = openssl_cipher_iv_length($method);
        $iv = substr($data, 0, $iv_length);
        $encrypted = substr($data, $iv_length);
        
        return openssl_decrypt($encrypted, $method, $key, 0, $iv);
    }
    
    /**
     * 生成哈希值
     * 
     * @param string $string 原始字符串
     * @param string $algorithm 哈希算法
     * @return string 哈希值
     */
    public function hash_string($string, $algorithm = 'sha256') {
        return hash($algorithm, $string);
    }
    
    /**
     * 验证哈希值
     * 
     * @param string $string 原始字符串
     * @param string $hash 哈希值
     * @param string $algorithm 哈希算法
     * @return bool 验证结果
     */
    public function verify_hash($string, $hash, $algorithm = 'sha256') {
        return hash_equals($hash, hash($algorithm, $string));
    }
    
    /**
     * 格式化文件大小
     * 
     * @param int $bytes 字节数
     * @param int $precision 小数位数
     * @return string 格式化后的文件大小
     */
    public function format_file_size($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
    
    /**
     * 格式化数字
     * 
     * @param float $number 数字
     * @param int $decimals 小数位数
     * @param string $dec_point 小数点
     * @param string $thousands_sep 千位分隔符
     * @return string 格式化后的数字
     */
    public function format_number($number, $decimals = 0, $dec_point = '.', $thousands_sep = ',') {
        return number_format($number, $decimals, $dec_point, $thousands_sep);
    }
    
    /**
     * 格式化货币
     * 
     * @param float $amount 金额
     * @param string $currency 货币代码
     * @param string $locale 区域设置
     * @return string 格式化后的货币
     */
    public function format_currency($amount, $currency = 'CNY', $locale = 'zh_CN') {
        // 简化版实现，实际项目中可使用NumberFormatter类
        $symbols = array(
            'CNY' => '¥',
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
        );
        
        $symbol = isset($symbols[$currency]) ? $symbols[$currency] : $currency;
        
        if ($locale === 'zh_CN') {
            return $symbol . number_format($amount, 2, '.', '');
        } else {
            return $symbol . number_format($amount, 2);
        }
    }
    
    /**
     * 格式化日期时间
     * 
     * @param string|int $datetime 日期时间字符串或时间戳
     * @param string $format 格式
     * @return string 格式化后的日期时间
     */
    public function format_datetime($datetime, $format = 'Y-m-d H:i:s') {
        if (is_numeric($datetime)) {
            return date($format, $datetime);
        } else {
            return date($format, strtotime($datetime));
        }
    }
    
    /**
     * 计算两个日期之间的差值
     * 
     * @param string|int $date1 日期1
     * @param string|int $date2 日期2
     * @param string $unit 单位：days, hours, minutes, seconds
     * @return int 差值
     */
    public function date_diff($date1, $date2, $unit = 'days') {
        $timestamp1 = is_numeric($date1) ? $date1 : strtotime($date1);
        $timestamp2 = is_numeric($date2) ? $date2 : strtotime($date2);
        
        $diff = abs($timestamp2 - $timestamp1);
        
        switch ($unit) {
            case 'seconds':
                return $diff;
            case 'minutes':
                return floor($diff / 60);
            case 'hours':
                return floor($diff / 3600);
            case 'days':
            default:
                return floor($diff / 86400);
        }
    }
    
    /**
     * 获取客户端IP地址
     * 
     * @return string IP地址
     */
    public function get_client_ip() {
        $ip_keys = array('HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    }
    
    /**
     * 获取用户代理字符串
     * 
     * @return string 用户代理字符串
     */
    public function get_user_agent() {
        return isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    }
    
    /**
     * 判断是否为移动设备
     * 
     * @return bool 是否为移动设备
     */
    public function is_mobile() {
        $user_agent = $this->get_user_agent();
        
        $mobile_agents = array(
            'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 
            'Windows Phone', 'webOS', 'Opera Mini', 'IEMobile', 'Mobile Safari'
        );
        
        foreach ($mobile_agents as $agent) {
            if (strpos($user_agent, $agent) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 判断是否为微信浏览器
     * 
     * @return bool 是否为微信浏览器
     */
    public function is_wechat_browser() {
        $user_agent = $this->get_user_agent();
        
        return strpos($user_agent, 'MicroMessenger') !== false;
    }
    
    /**
     * 获取数组中的值
     * 
     * @param array $array 数组
     * @param string|int $key 键
     * @param mixed $default 默认值
     * @return mixed 值
     */
    public function array_get($array, $key, $default = null) {
        if (!is_array($array)) {
            return $default;
        }
        
        if (isset($array[$key])) {
            return $array[$key];
        }
        
        foreach (explode('.', $key) as $segment) {
            if (!is_array($array) || !array_key_exists($segment, $array)) {
                return $default;
            }
            $array = $array[$segment];
        }
        
        return $array;
    }
    
    /**
     * 设置数组中的值
     * 
     * @param array $array 数组（引用）
     * @param string|int $key 键
     * @param mixed $value 值
     * @return void
     */
    public function array_set(&$array, $key, $value) {
        if (is_null($key)) {
            $array[] = $value;
            return;
        }
        
        $keys = explode('.', $key);
        
        while (count($keys) > 1) {
            $key = array_shift($keys);
            
            if (!isset($array[$key]) || !is_array($array[$key])) {
                $array[$key] = array();
            }
            
            $array = &$array[$key];
        }
        
        $array[array_shift($keys)] = $value;
    }
    
    /**
     * 检查数组中是否存在指定的键
     * 
     * @param array $array 数组
     * @param string|int $key 键
     * @return bool 是否存在
     */
    public function array_has($array, $key) {
        if (!is_array($array)) {
            return false;
        }
        
        if (array_key_exists($key, $array)) {
            return true;
        }
        
        foreach (explode('.', $key) as $segment) {
            if (!is_array($array) || !array_key_exists($segment, $array)) {
                return false;
            }
            $array = $array[$segment];
        }
        
        return true;
    }
    
    /**
     * 从数组中移除指定的键
     * 
     * @param array $array 数组（引用）
     * @param string|int $key 键
     * @return void
     */
    public function array_forget(&$array, $key) {
        $keys = explode('.', $key);
        
        while (count($keys) > 1) {
            $key = array_shift($keys);
            
            if (!isset($array[$key]) || !is_array($array[$key])) {
                return;
            }
            
            $array = &$array[$key];
        }
        
        unset($array[array_shift($keys)]);
    }
    
    /**
     * 数组排序
     * 
     * @param array $array 数组
     * @param string $key 排序键
     * @param int $direction 排序方向：SORT_ASC, SORT_DESC
     * @param int $sort_flag 排序标志
     * @return array 排序后的数组
     */
    public function array_sort($array, $key, $direction = SORT_ASC, $sort_flag = SORT_REGULAR) {
        if (!is_array($array)) {
            return array();
        }
        
        $sortable = array();
        
        foreach ($array as $k => $v) {
            if (is_array($v) && array_key_exists($key, $v)) {
                $sortable[$k] = $v[$key];
            } else {
                $sortable[$k] = $v;
            }
        }
        
        if ($direction === SORT_ASC) {
            asort($sortable, $sort_flag);
        } else {
            arsort($sortable, $sort_flag);
        }
        
        $result = array();
        foreach ($sortable as $k => $v) {
            $result[$k] = $array[$k];
        }
        
        return $result;
    }
    
    /**
     * 多维数组转一维数组
     * 
     * @param array $array 多维数组
     * @param string $separator 分隔符
     * @return array 一维数组
     */
    public function array_flatten($array, $separator = '.') {
        $result = array();
        
        $this->array_flatten_recursive($array, $result, '', $separator);
        
        return $result;
    }
    
    /**
     * 递归扁平化数组
     * 
     * @param array $array 数组
     * @param array $result 结果数组（引用）
     * @param string $prefix 前缀
     * @param string $separator 分隔符
     * @return void
     */
    private function array_flatten_recursive($array, &$result, $prefix = '', $separator = '.') {
        foreach ($array as $key => $value) {
            $new_key = $prefix ? $prefix . $separator . $key : $key;
            
            if (is_array($value) && $value) {
                $this->array_flatten_recursive($value, $result, $new_key, $separator);
            } else {
                $result[$new_key] = $value;
            }
        }
    }
    
    /**
     * 获取文件扩展名
     * 
     * @param string $filename 文件名
     * @return string 扩展名
     */
    public function get_file_extension($filename) {
        return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    }
    
    /**
     * 获取不带扩展名的文件名
     * 
     * @param string $filename 文件名
     * @return string 不带扩展名的文件名
     */
    public function get_file_name_without_extension($filename) {
        return pathinfo($filename, PATHINFO_FILENAME);
    }
    
    /**
     * 创建目录
     * 
     * @param string $directory 目录路径
     * @param int $permissions 权限
     * @return bool 是否创建成功
     */
    public function create_directory($directory, $permissions = 0755) {
        if (is_dir($directory)) {
            return true;
        }
        
        return mkdir($directory, $permissions, true);
    }
    
    /**
     * 删除目录及其内容
     * 
     * @param string $directory 目录路径
     * @return bool 是否删除成功
     */
    public function delete_directory($directory) {
        if (!is_dir($directory)) {
            return true;
        }
        
        $files = array_diff(scandir($directory), array('.', '..'));
        
        foreach ($files as $file) {
            $path = $directory . '/' . $file;
            
            if (is_dir($path)) {
                $this->delete_directory($path);
            } else {
                unlink($path);
            }
        }
        
        return rmdir($directory);
    }
    
    /**
     * 复制目录及其内容
     * 
     * @param string $source 源目录
     * @param string $destination 目标目录
     * @return bool 是否复制成功
     */
    public function copy_directory($source, $destination) {
        if (!is_dir($source)) {
            return false;
        }
        
        if (!is_dir($destination)) {
            $this->create_directory($destination);
        }
        
        $files = array_diff(scandir($source), array('.', '..'));
        
        foreach ($files as $file) {
            $source_path = $source . '/' . $file;
            $destination_path = $destination . '/' . $file;
            
            if (is_dir($source_path)) {
                $this->copy_directory($source_path, $destination_path);
            } else {
                copy($source_path, $destination_path);
            }
        }
        
        return true;
    }
    
    /**
     * 获取目录大小
     * 
     * @param string $directory 目录路径
     * @return int 目录大小（字节）
     */
    public function get_directory_size($directory) {
        if (!is_dir($directory)) {
            return 0;
        }
        
        $size = 0;
        $files = array_diff(scandir($directory), array('.', '..'));
        
        foreach ($files as $file) {
            $path = $directory . '/' . $file;
            
            if (is_dir($path)) {
                $size += $this->get_directory_size($path);
            } else {
                $size += filesize($path);
            }
        }
        
        return $size;
    }
    
    /**
     * 发送HTTP请求
     * 
     * @param string $url 请求URL
     * @param array $args 请求参数
     * @return array|WP_Error 响应数据
     */
    public function http_request($url, $args = array()) {
        $default_args = array(
            'method' => 'GET',
            'timeout' => 30,
            'headers' => array(),
            'body' => null,
            'sslverify' => true,
        );
        
        $args = wp_parse_args($args, $default_args);
        
        return wp_remote_request($url, $args);
    }
    
    /**
     * 发送GET请求
     * 
     * @param string $url 请求URL
     * @param array $params 查询参数
     * @param array $args 请求参数
     * @return array|WP_Error 响应数据
     */
    public function http_get($url, $params = array(), $args = array()) {
        if (!empty($params)) {
            $url = add_query_arg($params, $url);
        }
        
        $args['method'] = 'GET';
        
        return $this->http_request($url, $args);
    }
    
    /**
     * 发送POST请求
     * 
     * @param string $url 请求URL
     * @param array $data 请求数据
     * @param array $args 请求参数
     * @return array|WP_Error 响应数据
     */
    public function http_post($url, $data = array(), $args = array()) {
        $args['method'] = 'POST';
        $args['body'] = $data;
        
        return $this->http_request($url, $args);
    }
    
    /**
     * 发送JSON请求
     * 
     * @param string $url 请求URL
     * @param array $data 请求数据
     * @param string $method 请求方法
     * @param array $args 请求参数
     * @return array|WP_Error 响应数据
     */
    public function http_json($url, $data = array(), $method = 'POST', $args = array()) {
        $args['method'] = $method;
        $args['body'] = json_encode($data);
        $args['headers']['Content-Type'] = 'application/json';
        
        return $this->http_request($url, $args);
    }
    
    /**
     * 生成JWT令牌
     * 
     * @param array $payload 载荷
     * @param string $key 密钥
     * @param string $algorithm 算法
     * @return string JWT令牌
     */
    public function generate_jwt($payload, $key, $algorithm = 'HS256') {
        // 获取JWT实例
        $jwt = Sut_WeChat_Mini_JWT::get_instance();
        
        return $jwt->encode($payload, $key, $algorithm);
    }
    
    /**
     * 验证JWT令牌
     * 
     * @param string $jwt JWT令牌
     * @param string $key 密钥
     * @return object|false 载荷或false
     */
    public function verify_jwt($jwt, $key) {
        // 获取JWT实例
        $jwt_instance = Sut_WeChat_Mini_JWT::get_instance();
        
        return $jwt_instance->validate($jwt, $key);
    }
    
    /**
     * 记录日志
     * 
     * @param string $message 日志消息
     * @param string $level 日志级别：debug, info, notice, warning, error, critical, alert, emergency
     * @param array $context 上下文
     * @return void
     */
    public function log($message, $level = 'info', $context = array()) {
        // 获取日志实例
        $logger = Sut_WeChat_Mini_Logger::get_instance();
        
        $logger->log($level, $message, $context);
    }
    
    /**
     * 调试日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文
     * @return void
     */
    public function debug($message, $context = array()) {
        $this->log($message, 'debug', $context);
    }
    
    /**
     * 信息日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文
     * @return void
     */
    public function info($message, $context = array()) {
        $this->log($message, 'info', $context);
    }
    
    /**
     * 警告日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文
     * @return void
     */
    public function warning($message, $context = array()) {
        $this->log($message, 'warning', $context);
    }
    
    /**
     * 错误日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文
     * @return void
     */
    public function error($message, $context = array()) {
        $this->log($message, 'error', $context);
    }
    
    /**
     * 创建缩略图
     * 
     * @param string $source_path 源图片路径
     * @param string $target_path 目标图片路径
     * @param int $width 宽度
     * @param int $height 高度
     * @param bool $crop 是否裁剪
     * @return bool 是否创建成功
     */
    public function create_thumbnail($source_path, $target_path, $width, $height, $crop = false) {
        if (!file_exists($source_path)) {
            return false;
        }
        
        // 获取图片信息
        $image_info = getimagesize($source_path);
        
        if (!$image_info) {
            return false;
        }
        
        $source_width = $image_info[0];
        $source_height = $image_info[1];
        $image_type = $image_info[2];
        
        // 计算缩略图尺寸
        if ($crop) {
            // 裁剪模式
            $ratio = max($width / $source_width, $height / $source_height);
            $new_width = $width;
            $new_height = $height;
            
            $source_x = ($source_width - $width / $ratio) / 2;
            $source_y = ($source_height - $height / $ratio) / 2;
        } else {
            // 适应模式
            $ratio = min($width / $source_width, $height / $source_height);
            $new_width = $source_width * $ratio;
            $new_height = $source_height * $ratio;
            
            $source_x = 0;
            $source_y = 0;
        }
        
        // 创建目标图片
        $target_image = imagecreatetruecolor($new_width, $new_height);
        
        // 创建源图片
        switch ($image_type) {
            case IMAGETYPE_GIF:
                $source_image = imagecreatefromgif($source_path);
                break;
            case IMAGETYPE_JPEG:
                $source_image = imagecreatefromjpeg($source_path);
                break;
            case IMAGETYPE_PNG:
                $source_image = imagecreatefrompng($source_path);
                break;
            default:
                return false;
        }
        
        // 复制并调整大小
        imagecopyresampled(
            $target_image, $source_image,
            0, 0, $source_x, $source_y,
            $new_width, $new_height, $source_width, $source_height
        );
        
        // 保存缩略图
        $result = false;
        
        // 确保目标目录存在
        $target_dir = dirname($target_path);
        if (!is_dir($target_dir)) {
            wp_mkdir_p($target_dir);
        }
        
        switch ($image_type) {
            case IMAGETYPE_GIF:
                $result = imagegif($target_image, $target_path);
                break;
            case IMAGETYPE_JPEG:
                $result = imagejpeg($target_image, $target_path, 90);
                break;
            case IMAGETYPE_PNG:
                $result = imagepng($target_image, $target_path, 9);
                break;
        }
        
        // 释放内存
        imagedestroy($source_image);
        imagedestroy($target_image);
        
        return $result;
    }
    
    /**
     * 获取图片信息
     * 
     * @param string $image_path 图片路径
     * @return array|false 图片信息
     */
    public function get_image_info($image_path) {
        if (!file_exists($image_path)) {
            return false;
        }
        
        $image_info = getimagesize($image_path);
        
        if (!$image_info) {
            return false;
        }
        
        return array(
            'width' => $image_info[0],
            'height' => $image_info[1],
            'type' => $image_info[2],
            'mime' => $image_info['mime'],
            'size' => filesize($image_path),
            'extension' => $this->get_file_extension($image_path),
        );
    }
    
    /**
     * 压缩图片
     * 
     * @param string $source_path 源图片路径
     * @param string $target_path 目标图片路径
     * @param int $quality 质量（0-100）
     * @return bool 是否压缩成功
     */
    public function compress_image($source_path, $target_path, $quality = 75) {
        if (!file_exists($source_path)) {
            return false;
        }
        
        // 获取图片信息
        $image_info = getimagesize($source_path);
        
        if (!$image_info) {
            return false;
        }
        
        $image_type = $image_info[2];
        
        // 创建源图片
        switch ($image_type) {
            case IMAGETYPE_GIF:
                $source_image = imagecreatefromgif($source_path);
                break;
            case IMAGETYPE_JPEG:
                $source_image = imagecreatefromjpeg($source_path);
                break;
            case IMAGETYPE_PNG:
                $source_image = imagecreatefrompng($source_path);
                break;
            default:
                return false;
        }
        
        // 确保目标目录存在
        $target_dir = dirname($target_path);
        if (!is_dir($target_dir)) {
            wp_mkdir_p($target_dir);
        }
        
        // 保存压缩后的图片
        $result = false;
        
        switch ($image_type) {
            case IMAGETYPE_GIF:
                $result = imagegif($source_image, $target_path);
                break;
            case IMAGETYPE_JPEG:
                $result = imagejpeg($source_image, $target_path, $quality);
                break;
            case IMAGETYPE_PNG:
                // PNG质量参数是0-9，0表示无压缩，9表示最大压缩
                $png_quality = 9 - round($quality / 11);
                $result = imagepng($source_image, $target_path, $png_quality);
                break;
        }
        
        // 释放内存
        imagedestroy($source_image);
        
        return $result;
    }
}