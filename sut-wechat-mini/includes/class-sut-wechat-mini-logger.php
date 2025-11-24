<?php
/**
 * 文件名: class-sut-wechat-mini-logger.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 日志记录类
 * 
 * 提供微信小程序的日志记录功能
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 日志记录类
 */
class Sut_WeChat_Mini_Logger {
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 日志级别
     */
    const LEVEL_DEBUG = 'debug';
    const LEVEL_INFO = 'info';
    const LEVEL_WARNING = 'warning';
    const LEVEL_ERROR = 'error';
    
    /**
     * 默认通道
     */
    const DEFAULT_CHANNEL = 'sut_wechat_mini';
    
    /**
     * 日志级别映射
     */
    private $level_map = array(
        self::LEVEL_DEBUG => 0,
        self::LEVEL_INFO => 1,
        self::LEVEL_WARNING => 2,
        self::LEVEL_ERROR => 3,
    );
    
    /**
     * 当前日志级别
     */
    private $log_level;
    
    /**
     * 是否记录到数据库
     */
    private $log_to_database;
    
    /**
     * 是否记录到文件
     */
    private $log_to_file;
    
    /**
     * 日志文件路径
     */
    private $log_file_path;
    
    /**
     * 构造函数
     */
    private function __construct() {
        $this->log_level = $this->get_log_level();
        $this->log_to_database = $this->should_log_to_database();
        $this->log_to_file = $this->should_log_to_file();
        $this->log_file_path = $this->get_log_file_path();
        
        // 确保日志目录存在
        if ($this->log_to_file && !file_exists(dirname($this->log_file_path))) {
            wp_mkdir_p(dirname($this->log_file_path));
        }
    }
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Logger 日志记录实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 获取日志级别
     * 
     * @return string 日志级别
     */
    private function get_log_level() {
        return get_option('sut_wechat_mini_log_level', self::LEVEL_INFO);
    }
    
    /**
     * 是否记录到数据库
     * 
     * @return bool 是否记录到数据库
     */
    private function should_log_to_database() {
        return (bool) get_option('sut_wechat_mini_log_to_database', true);
    }
    
    /**
     * 是否记录到文件
     * 
     * @return bool 是否记录到文件
     */
    private function should_log_to_file() {
        return (bool) get_option('sut_wechat_mini_log_to_file', false);
    }
    
    /**
     * 获取日志文件路径
     * 
     * @return string 日志文件路径
     */
    private function get_log_file_path() {
        $upload_dir = wp_upload_dir();
        $log_dir = $upload_dir['basedir'] . '/sut-wechat-mini/logs';
        
        return $log_dir . '/app-' . date('Y-m-d') . '.log';
    }
    
    /**
     * 记录调试日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文数据
     * @param string $channel 日志通道
     * @return bool 是否成功
     */
    public function debug($message, $context = array(), $channel = self::DEFAULT_CHANNEL) {
        return $this->log(self::LEVEL_DEBUG, $message, $context, $channel);
    }
    
    /**
     * 记录信息日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文数据
     * @param string $channel 日志通道
     * @return bool 是否成功
     */
    public function info($message, $context = array(), $channel = self::DEFAULT_CHANNEL) {
        return $this->log(self::LEVEL_INFO, $message, $context, $channel);
    }
    
    /**
     * 记录警告日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文数据
     * @param string $channel 日志通道
     * @return bool 是否成功
     */
    public function warning($message, $context = array(), $channel = self::DEFAULT_CHANNEL) {
        return $this->log(self::LEVEL_WARNING, $message, $context, $channel);
    }
    
    /**
     * 记录错误日志
     * 
     * @param string $message 日志消息
     * @param array $context 上下文数据
     * @param string $channel 日志通道
     * @return bool 是否成功
     */
    public function error($message, $context = array(), $channel = self::DEFAULT_CHANNEL) {
        return $this->log(self::LEVEL_ERROR, $message, $context, $channel);
    }
    
    /**
     * 记录日志
     * 
     * @param string $level 日志级别
     * @param string $message 日志消息
     * @param array $context 上下文数据
     * @param string $channel 日志通道
     * @return bool 是否成功
     */
    public function log($level, $message, $context = array(), $channel = self::DEFAULT_CHANNEL) {
        // 检查日志级别
        if (!$this->should_log($level)) {
            return false;
        }
        
        // 准备日志数据
        $log_data = array(
            'level' => $level,
            'channel' => $channel,
            'message' => $message,
            'context' => $context,
            'user_id' => get_current_user_id(),
            'ip_address' => $this->get_client_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'created_at' => current_time('mysql'),
        );
        
        // 记录到数据库
        if ($this->log_to_database) {
            $this->log_to_database($log_data);
        }
        
        // 记录到文件
        if ($this->log_to_file) {
            $this->log_to_file($log_data);
        }
        
        return true;
    }
    
    /**
     * 检查是否应该记录日志
     * 
     * @param string $level 日志级别
     * @return bool 是否应该记录
     */
    private function should_log($level) {
        if (!isset($this->level_map[$level]) || !isset($this->level_map[$this->log_level])) {
            return false;
        }
        
        return $this->level_map[$level] >= $this->level_map[$this->log_level];
    }
    
    /**
     * 记录到数据库
     * 
     * @param array $log_data 日志数据
     * @return bool 是否成功
     */
    private function log_to_database($log_data) {
        try {
            $database = Sut_WeChat_Mini_Database::get_instance();
            
            $data = array(
                'level' => $log_data['level'],
                'channel' => $log_data['channel'],
                'message' => $log_data['message'],
                'context' => !empty($log_data['context']) ? json_encode($log_data['context']) : null,
                'user_id' => $log_data['user_id'],
                'ip_address' => $log_data['ip_address'],
                'user_agent' => $log_data['user_agent'],
            );
            
            return $database->insert('logs', $data) !== false;
        } catch (Exception $e) {
            // 防止日志记录失败导致应用崩溃
            return false;
        }
    }
    
    /**
     * 记录到文件
     * 
     * @param array $log_data 日志数据
     * @return bool 是否成功
     */
    private function log_to_file($log_data) {
        try {
            $log_entry = $this->format_log_entry($log_data);
            
            return file_put_contents($this->log_file_path, $log_entry . PHP_EOL, FILE_APPEND | LOCK_EX) !== false;
        } catch (Exception $e) {
            // 防止日志记录失败导致应用崩溃
            return false;
        }
    }
    
    /**
     * 格式化日志条目
     * 
     * @param array $log_data 日志数据
     * @return string 格式化的日志条目
     */
    private function format_log_entry($log_data) {
        $timestamp = $log_data['created_at'];
        $level = strtoupper($log_data['level']);
        $channel = $log_data['channel'];
        $message = $log_data['message'];
        $context = !empty($log_data['context']) ? json_encode($log_data['context']) : '';
        
        $entry = "[{$timestamp}] {$level}.{$channel}: {$message}";
        
        if (!empty($context)) {
            $entry .= " {$context}";
        }
        
        return $entry;
    }
    
    /**
     * 获取客户端IP
     * 
     * @return string IP地址
     */
    private function get_client_ip() {
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
     * 获取日志列表
     * 
     * @param array $args 查询参数
     * @return array 日志列表
     */
    public function get_logs($args = array()) {
        $defaults = array(
            'level' => '',
            'channel' => '',
            'user_id' => 0,
            'date_from' => '',
            'date_to' => '',
            'search' => '',
            'per_page' => 20,
            'page' => 1,
            'orderby' => 'created_at',
            'order' => 'DESC',
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $database = Sut_WeChat_Mini_Database::get_instance();
        $table_name = $database->get_table_name('logs');
        
        global $wpdb;
        
        $where = array();
        $values = array();
        
        // 添加条件
        if (!empty($args['level'])) {
            $where[] = "level = %s";
            $values[] = $args['level'];
        }
        
        if (!empty($args['channel'])) {
            $where[] = "channel = %s";
            $values[] = $args['channel'];
        }
        
        if (!empty($args['user_id'])) {
            $where[] = "user_id = %d";
            $values[] = $args['user_id'];
        }
        
        if (!empty($args['date_from'])) {
            $where[] = "created_at >= %s";
            $values[] = $args['date_from'] . ' 00:00:00';
        }
        
        if (!empty($args['date_to'])) {
            $where[] = "created_at <= %s";
            $values[] = $args['date_to'] . ' 23:59:59';
        }
        
        if (!empty($args['search'])) {
            $where[] = "(message LIKE %s OR context LIKE %s)";
            $search_term = '%' . $wpdb->esc_like($args['search']) . '%';
            $values[] = $search_term;
            $values[] = $search_term;
        }
        
        // 构建SQL
        $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        
        // 获取总数
        $sql = "SELECT COUNT(*) FROM {$table_name} {$where_clause}";
        $total = $wpdb->get_var($wpdb->prepare($sql, $values));
        
        // 计算分页
        $total_pages = ceil($total / $args['per_page']);
        $offset = ($args['page'] - 1) * $args['per_page'];
        
        // 获取数据
        $sql = "SELECT * FROM {$table_name} {$where_clause} ORDER BY {$orderby} LIMIT %d OFFSET %d";
        $results = $wpdb->get_results($wpdb->prepare($sql, array_merge($values, array($args['per_page'], $offset))));
        
        // 格式化结果
        foreach ($results as $result) {
            if (!empty($result->context)) {
                $result->context = json_decode($result->context, true);
            }
        }
        
        return array(
            'data' => $results,
            'total' => $total,
            'total_pages' => $total_pages,
            'current_page' => $args['page'],
            'per_page' => $args['per_page'],
        );
    }
    
    /**
     * 获取日志详情
     * 
     * @param int $log_id 日志ID
     * @return object|null 日志详情
     */
    public function get_log($log_id) {
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        $log = $database->get_row('logs', array('id' => $log_id));
        
        if ($log && !empty($log->context)) {
            $log->context = json_decode($log->context, true);
        }
        
        return $log;
    }
    
    /**
     * 删除日志
     * 
     * @param int $log_id 日志ID
     * @return bool 是否成功
     */
    public function delete_log($log_id) {
        $database = Sut_WeChat_Mini_Database::get_instance();
        
        return $database->delete('logs', array('id' => $log_id)) !== false;
    }
    
    /**
     * 批量删除日志
     * 
     * @param array $log_ids 日志ID数组
     * @return int 删除的日志数量
     */
    public function delete_logs($log_ids) {
        if (empty($log_ids)) {
            return 0;
        }
        
        $database = Sut_WeChat_Mini_Database::get_instance();
        $table_name = $database->get_table_name('logs');
        
        global $wpdb;
        
        $placeholders = implode(',', array_fill(0, count($log_ids), '%d'));
        
        $sql = "DELETE FROM {$table_name} WHERE id IN ({$placeholders})";
        
        return $wpdb->query($wpdb->prepare($sql, $log_ids));
    }
    
    /**
     * 清理过期日志
     * 
     * @param int $days 保留天数
     * @return int 删除的日志数量
     */
    public function cleanup_logs($days = 30) {
        $database = Sut_WeChat_Mini_Database::get_instance();
        $table_name = $database->get_table_name('logs');
        
        global $wpdb;
        
        $cutoff_date = date('Y-m-d H:i:s', time() - ($days * 24 * 60 * 60));
        
        $sql = "DELETE FROM {$table_name} WHERE created_at < %s";
        
        return $wpdb->query($wpdb->prepare($sql, $cutoff_date));
    }
    
    /**
     * 获取日志统计
     * 
     * @param int $days 统计天数
     * @return array 统计数据
     */
    public function get_log_stats($days = 7) {
        $database = Sut_WeChat_Mini_Database::get_instance();
        $table_name = $database->get_table_name('logs');
        
        global $wpdb;
        
        $start_date = date('Y-m-d H:i:s', time() - ($days * 24 * 60 * 60));
        
        // 按级别统计
        $sql = "SELECT level, COUNT(*) as count FROM {$table_name} WHERE created_at >= %s GROUP BY level";
        $level_stats = $wpdb->get_results($wpdb->prepare($sql, $start_date));
        
        $stats = array();
        foreach ($level_stats as $stat) {
            $stats['by_level'][$stat->level] = (int) $stat->count;
        }
        
        // 按日期统计
        $sql = "SELECT DATE(created_at) as date, COUNT(*) as count FROM {$table_name} WHERE created_at >= %s GROUP BY DATE(created_at) ORDER BY date";
        $date_stats = $wpdb->get_results($wpdb->prepare($sql, $start_date));
        
        $stats['by_date'] = array();
        foreach ($date_stats as $stat) {
            $stats['by_date'][$stat->date] = (int) $stat->count;
        }
        
        // 按通道统计
        $sql = "SELECT channel, COUNT(*) as count FROM {$table_name} WHERE created_at >= %s GROUP BY channel ORDER BY count DESC LIMIT 10";
        $channel_stats = $wpdb->get_results($wpdb->prepare($sql, $start_date));
        
        $stats['by_channel'] = array();
        foreach ($channel_stats as $stat) {
            $stats['by_channel'][$stat->channel] = (int) $stat->count;
        }
        
        // 总数
        $sql = "SELECT COUNT(*) as total FROM {$table_name} WHERE created_at >= %s";
        $total = $wpdb->get_var($wpdb->prepare($sql, $start_date));
        
        $stats['total'] = (int) $total;
        
        return $stats;
    }
    
    /**
     * 导出日志
     * 
     * @param array $args 查询参数
     * @param string $format 导出格式
     * @return string 导出内容
     */
    public function export_logs($args = array(), $format = 'csv') {
        $args['per_page'] = 10000; // 设置一个较大的值
        $logs = $this->get_logs($args);
        
        if ($format === 'csv') {
            return $this->export_logs_to_csv($logs['data']);
        } elseif ($format === 'json') {
            return $this->export_logs_to_json($logs['data']);
        }
        
        return '';
    }
    
    /**
     * 导出日志为CSV
     * 
     * @param array $logs 日志数据
     * @return string CSV内容
     */
    private function export_logs_to_csv($logs) {
        $output = fopen('php://temp', 'r+');
        
        // 添加BOM以支持中文
        fwrite($output, "\xEF\xBB\xBF");
        
        // 添加表头
        fputcsv($output, array(
            'ID',
            '级别',
            '通道',
            '消息',
            '上下文',
            '用户ID',
            'IP地址',
            '用户代理',
            '创建时间',
        ));
        
        // 添加数据
        foreach ($logs as $log) {
            fputcsv($output, array(
                $log->id,
                $log->level,
                $log->channel,
                $log->message,
                $log->context ? json_encode($log->context, JSON_UNESCAPED_UNICODE) : '',
                $log->user_id,
                $log->ip_address,
                $log->user_agent,
                $log->created_at,
            ));
        }
        
        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);
        
        return $content;
    }
    
    /**
     * 导出日志为JSON
     * 
     * @param array $logs 日志数据
     * @return string JSON内容
     */
    private function export_logs_to_json($logs) {
        return json_encode($logs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}