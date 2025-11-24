<?php
/**
 * 文件名: class-sut-wechat-mini-security.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 安全功能类
 * 
 * 提供微信小程序的安全功能
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 安全功能类
 */
class Sut_WeChat_Mini_Security {
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 加密密钥
     */
    private $secret_key;
    
    /**
     * 加密方法
     */
    private $cipher_method;
    
    /**
     * 构造函数
     */
    private function __construct() {
        $this->secret_key = $this->get_secret_key();
        $this->cipher_method = 'AES-256-CBC';
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Security 安全功能实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 获取加密密钥
     * 
     * @return string 加密密钥
     */
    private function get_secret_key() {
        // 尝试从WordPress选项中获取密钥
        $secret_key = get_option('sut_wechat_mini_secret_key', '');
        
        if (empty($secret_key)) {
            // 如果没有密钥，生成一个新的
            $secret_key = $this->generate_secret_key();
            update_option('sut_wechat_mini_secret_key', $secret_key);
        }
        
        return $secret_key;
    }
    
    /**
     * 生成加密密钥
     * 
     * @return string 加密密钥
     */
    private function generate_secret_key() {
        return wp_generate_password(64, false);
    }
    
    /**
     * 加密数据
     * 
     * @param string $data 要加密的数据
     * @return string 加密后的数据
     */
    public function encrypt($data) {
        if (empty($data)) {
            return '';
        }
        
        $iv_length = openssl_cipher_iv_length($this->cipher_method);
        $iv = openssl_random_pseudo_bytes($iv_length);
        
        $encrypted = openssl_encrypt($data, $this->cipher_method, $this->secret_key, 0, $iv);
        
        if ($encrypted === false) {
            return false;
        }
        
        // 将IV和加密数据组合
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * 解密数据
     * 
     * @param string $data 要解密的数据
     * @return string|false 解密后的数据或false
     */
    public function decrypt($data) {
        if (empty($data)) {
            return '';
        }
        
        $data = base64_decode($data);
        
        if ($data === false) {
            return false;
        }
        
        $iv_length = openssl_cipher_iv_length($this->cipher_method);
        $iv = substr($data, 0, $iv_length);
        $encrypted = substr($data, $iv_length);
        
        $decrypted = openssl_decrypt($encrypted, $this->cipher_method, $this->secret_key, 0, $iv);
        
        if ($decrypted === false) {
            return false;
        }
        
        return $decrypted;
    }
    
    /**
     * 生成随机字符串
     * 
     * @param int $length 字符串长度
     * @return string 随机字符串
     */
    public function generate_random_string($length = 32) {
        return wp_generate_password($length, false);
    }
    
    /**
     * 生成数字验证码
     * 
     * @param int $length 验证码长度
     * @return string 数字验证码
     */
    public function generate_numeric_code($length = 6) {
        $code = '';
        
        for ($i = 0; $i < $length; $i++) {
            $code .= mt_rand(0, 9);
        }
        
        return $code;
    }
    
    /**
     * 生成字母数字验证码
     * 
     * @param int $length 验证码长度
     * @return string 字母数字验证码
     */
    public function generate_alphanumeric_code($length = 8) {
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $code = '';
        
        for ($i = 0; $i < $length; $i++) {
            $code .= $chars[mt_rand(0, strlen($chars) - 1)];
        }
        
        return $code;
    }
    
    /**
     * 生成UUID
     * 
     * @return string UUID
     */
    public function generate_uuid() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    /**
     * 生成Token
     * 
     * @param int $user_id 用户ID
     * @param int $expires_in 过期时间（秒）
     * @return array Token信息
     */
    public function generate_token($user_id, $expires_in = 7200) {
        $token = $this->generate_random_string(64);
        $refresh_token = $this->generate_random_string(64);
        $expires_at = date('Y-m-d H:i:s', time() + $expires_in);
        
        // 存储Token到数据库
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        $data = array(
            'user_id' => $user_id,
            'token' => $token,
            'refresh_token' => $refresh_token,
            'expires_at' => $expires_at,
            'ip_address' => $this->get_client_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'status' => 1,
        );
        
        $database->insert('sessions', $data);
        
        return array(
            'token' => $token,
            'refresh_token' => $refresh_token,
            'expires_in' => $expires_in,
            'expires_at' => $expires_at,
        );
    }
    
    /**
     * 验证Token
     * 
     * @param string $token Token
     * @return array|false 用户信息或false
     */
    public function verify_token($token) {
        if (empty($token)) {
            return false;
        }
        
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        $session = $database->get_row('sessions', array(
            'token' => $token,
            'status' => 1,
        ));
        
        if (!$session) {
            return false;
        }
        
        // 检查Token是否过期
        if (strtotime($session->expires_at) < time()) {
            // 更新Token状态为失效
            $database->update('sessions', array('status' => 0), array('id' => $session->id));
            return false;
        }
        
        // 获取用户信息
        $user = $database->get_row('users', array('id' => $session->user_id));
        
        if (!$user || $user->status != 1) {
            return false;
        }
        
        return $user;
    }
    
    /**
     * 刷新Token
     * 
     * @param string $refresh_token 刷新Token
     * @param int $expires_in 过期时间（秒）
     * @return array|false 新Token信息或false
     */
    public function refresh_token($refresh_token, $expires_in = 7200) {
        if (empty($refresh_token)) {
            return false;
        }
        
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        $session = $database->get_row('sessions', array(
            'refresh_token' => $refresh_token,
            'status' => 1,
        ));
        
        if (!$session) {
            return false;
        }
        
        // 获取用户信息
        $user = $database->get_row('users', array('id' => $session->user_id));
        
        if (!$user || $user->status != 1) {
            return false;
        }
        
        // 使旧Token失效
        $database->update('sessions', array('status' => 0), array('id' => $session->id));
        
        // 生成新Token
        return $this->generate_token($user->id, $expires_in);
    }
    
    /**
     * 撤销Token
     * 
     * @param string $token Token
     * @return bool 是否成功
     */
    public function revoke_token($token) {
        if (empty($token)) {
            return false;
        }
        
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        $result = $database->update('sessions', array('status' => 0), array('token' => $token));
        
        return $result !== false;
    }
    
    /**
     * 撤销用户所有Token
     * 
     * @param int $user_id 用户ID
     * @return bool 是否成功
     */
    public function revoke_user_tokens($user_id) {
        if (empty($user_id)) {
            return false;
        }
        
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        $result = $database->update('sessions', array('status' => 0), array('user_id' => $user_id));
        
        return $result !== false;
    }
    
    /**
     * 获取客户端IP
     * 
     * @return string IP地址
     */
    public function get_client_ip() {
        $ip_keys = array(
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR',
        );
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);
                
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }
    
    /**
     * 验证IP地址
     * 
     * @param string $ip IP地址
     * @return bool 是否有效
     */
    public function validate_ip($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }
    
    /**
     * 检查IP是否在白名单中
     * 
     * @param string $ip IP地址
     * @param array $whitelist IP白名单
     * @return bool 是否在白名单中
     */
    public function is_ip_whitelisted($ip, $whitelist = array()) {
        if (empty($whitelist)) {
            // 如果没有提供白名单，使用默认白名单
            $whitelist = $this->get_default_ip_whitelist();
        }
        
        foreach ($whitelist as $allowed_ip) {
            if ($this->ip_matches($ip, $allowed_ip)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检查IP是否在黑名单中
     * 
     * @param string $ip IP地址
     * @param array $blacklist IP黑名单
     * @return bool 是否在黑名单中
     */
    public function is_ip_blacklisted($ip, $blacklist = array()) {
        if (empty($blacklist)) {
            // 如果没有提供黑名单，使用默认黑名单
            $blacklist = $this->get_default_ip_blacklist();
        }
        
        foreach ($blacklist as $blocked_ip) {
            if ($this->ip_matches($ip, $blocked_ip)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检查IP是否匹配
     * 
     * @param string $ip IP地址
     * @param string $pattern IP模式（支持CIDR表示法）
     * @return bool 是否匹配
     */
    private function ip_matches($ip, $pattern) {
        // 如果是单个IP地址
        if (strpos($pattern, '/') === false) {
            return $ip === $pattern;
        }
        
        // 如果是CIDR表示法
        list($subnet, $mask) = explode('/', $pattern);
        
        // 转换为整数
        $ip_long = ip2long($ip);
        $subnet_long = ip2long($subnet);
        $mask_long = -1 << (32 - $mask);
        
        // 检查是否匹配
        return ($ip_long & $mask_long) === ($subnet_long & $mask_long);
    }
    
    /**
     * 获取默认IP白名单
     * 
     * @return array IP白名单
     */
    private function get_default_ip_whitelist() {
        return array(
            '127.0.0.1',
            '::1',
        );
    }
    
    /**
     * 获取默认IP黑名单
     * 
     * @return array IP黑名单
     */
    private function get_default_ip_blacklist() {
        return array();
    }
    
    /**
     * 生成密码哈希
     * 
     * @param string $password 密码
     * @return string 密码哈希
     */
    public function hash_password($password) {
        return wp_hash_password($password);
    }
    
    /**
     * 验证密码
     * 
     * @param string $password 密码
     * @param string $hash 密码哈希
     * @return bool 是否匹配
     */
    public function verify_password($password, $hash) {
        return wp_check_password($password, $hash);
    }
    
    /**
     * 生成签名
     * 
     * @param array $data 数据
     * @param string $key 密钥
     * @return string 签名
     */
    public function generate_signature($data, $key = '') {
        if (empty($key)) {
            $key = $this->secret_key;
        }
        
        // 排序数据
        ksort($data);
        
        // 构建签名字符串
        $string_to_sign = '';
        
        foreach ($data as $k => $v) {
            if ($v !== '' && !is_array($v)) {
                $string_to_sign .= $k . '=' . $v . '&';
            }
        }
        
        $string_to_sign = rtrim($string_to_sign, '&');
        
        // 生成签名
        return hash_hmac('sha256', $string_to_sign, $key);
    }
    
    /**
     * 验证签名
     * 
     * @param array $data 数据
     * @param string $signature 签名
     * @param string $key 密钥
     * @return bool 是否有效
     */
    public function verify_signature($data, $signature, $key = '') {
        $expected_signature = $this->generate_signature($data, $key);
        
        return hash_equals($expected_signature, $signature);
    }
    
    /**
     * 过滤输入数据
     * 
     * @param mixed $data 输入数据
     * @param string $type 数据类型
     * @return mixed 过滤后的数据
     */
    public function sanitize_input($data, $type = 'text') {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sanitize_input($value, $type);
            }
            return $data;
        }
        
        switch ($type) {
            case 'email':
                return sanitize_email($data);
                
            case 'url':
                return esc_url_raw($data);
                
            case 'filename':
                return sanitize_file_name($data);
                
            case 'html':
                return wp_kses_post($data);
                
            case 'text':
            default:
                return sanitize_text_field($data);
        }
    }
    
    /**
     * 验证输入数据
     * 
     * @param mixed $data 输入数据
     * @param array $rules 验证规则
     * @return array 验证结果
     */
    public function validate_input($data, $rules) {
        $result = array(
            'valid' => true,
            'errors' => array(),
        );
        
        foreach ($rules as $field => $field_rules) {
            $value = isset($data[$field]) ? $data[$field] : '';
            
            foreach ($field_rules as $rule => $rule_value) {
                switch ($rule) {
                    case 'required':
                        if ($rule_value && empty($value)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '此字段是必填的';
                        }
                        break;
                        
                    case 'min_length':
                        if (mb_strlen($value) < $rule_value) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = "长度不能少于 {$rule_value} 个字符";
                        }
                        break;
                        
                    case 'max_length':
                        if (mb_strlen($value) > $rule_value) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = "长度不能超过 {$rule_value} 个字符";
                        }
                        break;
                        
                    case 'email':
                        if (!empty($value) && !is_email($value)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '请输入有效的邮箱地址';
                        }
                        break;
                        
                    case 'url':
                        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '请输入有效的URL地址';
                        }
                        break;
                        
                    case 'numeric':
                        if (!empty($value) && !is_numeric($value)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '请输入有效的数字';
                        }
                        break;
                        
                    case 'integer':
                        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_INT)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '请输入有效的整数';
                        }
                        break;
                        
                    case 'regex':
                        if (!empty($value) && !preg_match($rule_value, $value)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '格式不正确';
                        }
                        break;
                        
                    case 'in':
                        if (!empty($value) && !in_array($value, $rule_value)) {
                            $result['valid'] = false;
                            $result['errors'][$field][] = '值不在允许的范围内';
                        }
                        break;
                }
            }
        }
        
        return $result;
    }
    
    /**
     * 生成CSRF令牌
     * 
     * @param string $key 令牌键
     * @return string CSRF令牌
     */
    public function generate_csrf_token($key = 'default') {
        $token = $this->generate_random_string(32);
        
        // 存储令牌到会话
        $_SESSION['sut_wechat_mini_csrf_tokens'][$key] = array(
            'token' => $token,
            'expires_at' => time() + 3600, // 1小时后过期
        );
        
        return $token;
    }
    
    /**
     * 验证CSRF令牌
     * 
     * @param string $token 令牌
     * @param string $key 令牌键
     * @return bool 是否有效
     */
    public function verify_csrf_token($token, $key = 'default') {
        if (empty($token) || empty($_SESSION['sut_wechat_mini_csrf_tokens'][$key])) {
            return false;
        }
        
        $stored_token = $_SESSION['sut_wechat_mini_csrf_tokens'][$key];
        
        // 检查令牌是否过期
        if (time() > $stored_token['expires_at']) {
            unset($_SESSION['sut_wechat_mini_csrf_tokens'][$key]);
            return false;
        }
        
        // 验证令牌
        if (hash_equals($stored_token['token'], $token)) {
            // 验证成功，删除令牌
            unset($_SESSION['sut_wechat_mini_csrf_tokens'][$key]);
            return true;
        }
        
        return false;
    }
    
    /**
     * 清理过期的CSRF令牌
     * 
     * @return void
     */
    public function cleanup_csrf_tokens() {
        if (empty($_SESSION['sut_wechat_mini_csrf_tokens'])) {
            return;
        }
        
        $current_time = time();
        
        foreach ($_SESSION['sut_wechat_mini_csrf_tokens'] as $key => $token) {
            if ($current_time > $token['expires_at']) {
                unset($_SESSION['sut_wechat_mini_csrf_tokens'][$key]);
            }
        }
    }
    
    /**
     * 速率限制检查
     * 
     * @param string $key 限制键
     * @param int $max_requests 最大请求数
     * @param int $window 时间窗口（秒）
     * @return array 检查结果
     */
    public function rate_limit_check($key, $max_requests = 60, $window = 60) {
        $cache = Sut_WeChat_Mini_Cache::get_instance();
        
        $cache_key = 'rate_limit:' . $key;
        $current = $cache->get($cache_key, 0);
        
        if ($current >= $max_requests) {
            return array(
                'allowed' => false,
                'remaining' => 0,
                'reset_time' => time() + $window,
            );
        }
        
        // 增加计数
        $new_count = $current + 1;
        $cache->set($cache_key, $new_count, $window);
        
        return array(
            'allowed' => true,
            'remaining' => $max_requests - $new_count,
            'reset_time' => time() + $window,
        );
    }
    
    /**
     * 生成验证码图片
     * 
     * @param string $code 验证码
     * @param int $width 图片宽度
     * @param int $height 图片高度
     * @return string 图片Base64数据
     */
    public function generate_captcha_image($code, $width = 120, $height = 40) {
        // 创建画布
        $image = imagecreatetruecolor($width, $height);
        
        // 设置背景色
        $bg_color = imagecolorallocate($image, 255, 255, 255);
        imagefill($image, 0, 0, $bg_color);
        
        // 设置文字颜色
        $text_color = imagecolorallocate($image, 0, 0, 0);
        
        // 添加干扰线
        for ($i = 0; $i < 5; $i++) {
            $line_color = imagecolorallocate($image, mt_rand(150, 200), mt_rand(150, 200), mt_rand(150, 200));
            imageline($image, mt_rand(0, $width), mt_rand(0, $height), mt_rand(0, $width), mt_rand(0, $height), $line_color);
        }
        
        // 添加干扰点
        for ($i = 0; $i < 50; $i++) {
            $dot_color = imagecolorallocate($image, mt_rand(150, 200), mt_rand(150, 200), mt_rand(150, 200));
            imagesetpixel($image, mt_rand(0, $width), mt_rand(0, $height), $dot_color);
        }
        
        // 添加验证码文字
        $font_size = 20;
        $font_file = ABSPATH . WPINC . '/fonts/arial.ttf'; // 使用WordPress默认字体
        
        if (file_exists($font_file)) {
            // 使用TrueType字体
            $text_width = $width / (strlen($code) + 1);
            
            for ($i = 0; $i < strlen($code); $i++) {
                $x = $text_width * ($i + 0.5);
                $y = $height / 2 + $font_size / 2;
                $angle = mt_rand(-15, 15);
                
                imagettftext($image, $font_size, $angle, $x, $y, $text_color, $font_file, $code[$i]);
            }
        } else {
            // 使用内置字体
            $text_width = $width / (strlen($code) + 1);
            
            for ($i = 0; $i < strlen($code); $i++) {
                $x = $text_width * ($i + 0.5) - 5;
                $y = $height / 2 + 5;
                
                imagestring($image, 5, $x, $y, $code[$i], $text_color);
            }
        }
        
        // 输出图片
        ob_start();
        imagepng($image);
        $image_data = ob_get_contents();
        ob_end_clean();
        
        // 释放资源
        imagedestroy($image);
        
        // 返回Base64编码的图片数据
        return 'data:image/png;base64,' . base64_encode($image_data);
    }
}