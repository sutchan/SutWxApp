<?php
/**
 * 文件名: class-sut-wechat-mini-cache.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 缓存管理类
 * 
 * 提供插件缓存管理功能，支持多种缓存驱动
 * 包括文件缓存、数据库缓存、Redis缓存等
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 缓存管理类
 */
class Sut_WeChat_Mini_Cache {
    
    /**
     * 缓存驱动类型常量
     */
    const DRIVER_FILE = 'file';
    const DRIVER_DB = 'db';
    const DRIVER_REDIS = 'redis';
    const DRIVER_MEMCACHED = 'memcached';
    
    /**
     * 默认缓存时间（秒）
     */
    const DEFAULT_EXPIRE = 3600; // 1小时
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 当前使用的缓存驱动
     */
    private $driver = null;
    
    /**
     * 缓存驱动类型
     */
    private $driver_type = null;
    
    /**
     * 缓存前缀
     */
    private $prefix = 'sut_wechat_mini_';
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Cache 缓存管理实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 获取缓存驱动类型
        $this->driver_type = get_option('sut_wechat_mini_cache_driver', self::DRIVER_FILE);
        
        // 初始化缓存驱动
        $this->init_driver();
    }
    
    /**
     * 初始化缓存驱动
     */
    private function init_driver() {
        switch ($this->driver_type) {
            case self::DRIVER_REDIS:
                $this->driver = new Sut_WeChat_Mini_Cache_Redis($this->prefix);
                break;
            case self::DRIVER_MEMCACHED:
                $this->driver = new Sut_WeChat_Mini_Cache_Memcached($this->prefix);
                break;
            case self::DRIVER_DB:
                $this->driver = new Sut_WeChat_Mini_Cache_DB($this->prefix);
                break;
            case self::DRIVER_FILE:
            default:
                $this->driver = new Sut_WeChat_Mini_Cache_File($this->prefix);
                break;
        }
    }
    
    /**
     * 获取缓存值
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return mixed 缓存值，不存在时返回false
     */
    public function get($key, $group = 'default') {
        return $this->driver->get($key, $group);
    }
    
    /**
     * 设置缓存值
     * 
     * @param string $key 缓存键
     * @param mixed $value 缓存值
     * @param int $expire 过期时间（秒），默认为1小时
     * @param string $group 缓存组
     * @return bool 是否设置成功
     */
    public function set($key, $value, $expire = self::DEFAULT_EXPIRE, $group = 'default') {
        return $this->driver->set($key, $value, $expire, $group);
    }
    
    /**
     * 删除缓存
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否删除成功
     */
    public function delete($key, $group = 'default') {
        return $this->driver->delete($key, $group);
    }
    
    /**
     * 清除缓存组
     * 
     * @param string $group 缓存组
     * @return bool 是否清除成功
     */
    public function clear_group($group) {
        return $this->driver->clear_group($group);
    }
    
    /**
     * 清除所有缓存
     * 
     * @return bool 是否清除成功
     */
    public function clear_all() {
        return $this->driver->clear_all();
    }
    
    /**
     * 检查缓存是否存在
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否存在
     */
    public function exists($key, $group = 'default') {
        return $this->driver->exists($key, $group);
    }
    
    /**
     * 获取缓存统计信息
     * 
     * @return array 统计信息
     */
    public function get_stats() {
        return $this->driver->get_stats();
    }
    
    /**
     * 获取当前缓存驱动类型
     * 
     * @return string 驱动类型
     */
    public function get_driver_type() {
        return $this->driver_type;
    }
}

/**
 * 文件缓存驱动
 */
class Sut_WeChat_Mini_Cache_File {
    
    /**
     * 缓存目录
     */
    private $cache_dir = '';
    
    /**
     * 缓存前缀
     */
    private $prefix = '';
    
    /**
     * 构造函数
     * 
     * @param string $prefix 缓存前缀
     */
    public function __construct($prefix) {
        $this->prefix = $prefix;
        $this->cache_dir = WP_CONTENT_DIR . '/cache/sut-wechat-mini/';
        
        // 创建缓存目录
        if (!file_exists($this->cache_dir)) {
            wp_mkdir_p($this->cache_dir);
        }
    }
    
    /**
     * 获取缓存值
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return mixed 缓存值，不存在时返回false
     */
    public function get($key, $group = 'default') {
        $file_path = $this->get_file_path($key, $group);
        
        if (!file_exists($file_path)) {
            return false;
        }
        
        // 读取缓存文件
        $data = file_get_contents($file_path);
        if ($data === false) {
            return false;
        }
        
        // 解析数据
        $cache_data = unserialize($data);
        if ($cache_data === false || !is_array($cache_data)) {
            return false;
        }
        
        // 检查是否过期
        if ($cache_data['expire'] > 0 && $cache_data['expire'] < time()) {
            @unlink($file_path);
            return false;
        }
        
        return $cache_data['value'];
    }
    
    /**
     * 设置缓存值
     * 
     * @param string $key 缓存键
     * @param mixed $value 缓存值
     * @param int $expire 过期时间（秒）
     * @param string $group 缓存组
     * @return bool 是否设置成功
     */
    public function set($key, $value, $expire = 3600, $group = 'default') {
        $file_path = $this->get_file_path($key, $group);
        
        // 准备缓存数据
        $cache_data = array(
            'value' => $value,
            'expire' => $expire > 0 ? time() + $expire : 0,
            'created' => time()
        );
        
        // 写入缓存文件
        $result = file_put_contents($file_path, serialize($cache_data), LOCK_EX);
        
        return $result !== false;
    }
    
    /**
     * 删除缓存
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否删除成功
     */
    public function delete($key, $group = 'default') {
        $file_path = $this->get_file_path($key, $group);
        
        if (file_exists($file_path)) {
            return @unlink($file_path);
        }
        
        return true;
    }
    
    /**
     * 清除缓存组
     * 
     * @param string $group 缓存组
     * @return bool 是否清除成功
     */
    public function clear_group($group) {
        $group_dir = $this->cache_dir . $group;
        
        if (!is_dir($group_dir)) {
            return true;
        }
        
        // 删除组目录下的所有文件
        $files = glob($group_dir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                @unlink($file);
            }
        }
        
        return true;
    }
    
    /**
     * 清除所有缓存
     * 
     * @return bool 是否清除成功
     */
    public function clear_all() {
        // 删除所有缓存目录
        $this->delete_directory($this->cache_dir);
        
        // 重新创建缓存目录
        wp_mkdir_p($this->cache_dir);
        
        return true;
    }
    
    /**
     * 检查缓存是否存在
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否存在
     */
    public function exists($key, $group = 'default') {
        $file_path = $this->get_file_path($key, $group);
        
        if (!file_exists($file_path)) {
            return false;
        }
        
        // 检查是否过期
        $data = file_get_contents($file_path);
        if ($data === false) {
            return false;
        }
        
        $cache_data = unserialize($data);
        if ($cache_data === false || !is_array($cache_data)) {
            return false;
        }
        
        if ($cache_data['expire'] > 0 && $cache_data['expire'] < time()) {
            @unlink($file_path);
            return false;
        }
        
        return true;
    }
    
    /**
     * 获取缓存统计信息
     * 
     * @return array 统计信息
     */
    public function get_stats() {
        $stats = array(
            'driver' => 'file',
            'cache_dir' => $this->cache_dir,
            'total_files' => 0,
            'total_size' => 0,
            'groups' => array()
        );
        
        // 遍历缓存目录
        if (is_dir($this->cache_dir)) {
            $groups = scandir($this->cache_dir);
            foreach ($groups as $group) {
                if ($group === '.' || $group === '..') {
                    continue;
                }
                
                $group_path = $this->cache_dir . $group;
                if (!is_dir($group_path)) {
                    continue;
                }
                
                $group_stats = array(
                    'name' => $group,
                    'files' => 0,
                    'size' => 0
                );
                
                $files = scandir($group_path);
                foreach ($files as $file) {
                    if ($file === '.' || $file === '..') {
                        continue;
                    }
                    
                    $file_path = $group_path . '/' . $file;
                    if (is_file($file_path)) {
                        $file_size = filesize($file_path);
                        $group_stats['files']++;
                        $group_stats['size'] += $file_size;
                        
                        $stats['total_files']++;
                        $stats['total_size'] += $file_size;
                    }
                }
                
                $stats['groups'][] = $group_stats;
            }
        }
        
        $stats['total_size_formatted'] = size_format($stats['total_size']);
        
        return $stats;
    }
    
    /**
     * 获取缓存文件路径
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return string 文件路径
     */
    private function get_file_path($key, $group) {
        // 创建组目录
        $group_dir = $this->cache_dir . $group;
        if (!file_exists($group_dir)) {
            wp_mkdir_p($group_dir);
        }
        
        // 生成文件名
        $filename = $this->prefix . md5($key) . '.cache';
        
        return $group_dir . '/' . $filename;
    }
    
    /**
     * 递归删除目录
     * 
     * @param string $dir 目录路径
     */
    private function delete_directory($dir) {
        if (!is_dir($dir)) {
            return;
        }
        
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->delete_directory($path);
                rmdir($path);
            } else {
                unlink($path);
            }
        }
    }
}

/**
 * 数据库缓存驱动
 */
class Sut_WeChat_Mini_Cache_DB {
    
    /**
     * 缓存前缀
     */
    private $prefix = '';
    
    /**
     * 构造函数
     * 
     * @param string $prefix 缓存前缀
     */
    public function __construct($prefix) {
        $this->prefix = $prefix;
        
        // 创建缓存表
        $this->create_cache_table();
    }
    
    /**
     * 创建缓存表
     */
    private function create_cache_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            cache_key varchar(255) NOT NULL,
            cache_group varchar(50) NOT NULL DEFAULT 'default',
            cache_value longtext NOT NULL,
            cache_expire bigint(20) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT '0000-00-00 00:00:00',
            updated_at datetime DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            UNIQUE KEY cache_key_group (cache_key, cache_group),
            KEY cache_group (cache_group),
            KEY cache_expire (cache_expire)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * 获取缓存值
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return mixed 缓存值，不存在时返回false
     */
    public function get($key, $group = 'default') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        $cache_key = $this->prefix . $key;
        
        // 查询缓存
        $cache = $wpdb->get_row($wpdb->prepare(
            "SELECT cache_value, cache_expire FROM {$table_name} WHERE cache_key = %s AND cache_group = %s",
            $cache_key, $group
        ));
        
        if (!$cache) {
            return false;
        }
        
        // 检查是否过期
        if ($cache->cache_expire > 0 && $cache->cache_expire < time()) {
            $wpdb->delete(
                $table_name,
                array('cache_key' => $cache_key, 'cache_group' => $group),
                array('%s', '%s')
            );
            return false;
        }
        
        return unserialize($cache->cache_value);
    }
    
    /**
     * 设置缓存值
     * 
     * @param string $key 缓存键
     * @param mixed $value 缓存值
     * @param int $expire 过期时间（秒）
     * @param string $group 缓存组
     * @return bool 是否设置成功
     */
    public function set($key, $value, $expire = 3600, $group = 'default') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        $cache_key = $this->prefix . $key;
        $cache_value = serialize($value);
        $cache_expire = $expire > 0 ? time() + $expire : 0;
        $now = current_time('mysql');
        
        // 检查缓存是否已存在
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table_name} WHERE cache_key = %s AND cache_group = %s",
            $cache_key, $group
        ));
        
        if ($exists) {
            // 更新现有缓存
            $result = $wpdb->update(
                $table_name,
                array(
                    'cache_value' => $cache_value,
                    'cache_expire' => $cache_expire,
                    'updated_at' => $now
                ),
                array('cache_key' => $cache_key, 'cache_group' => $group),
                array('%s', '%d', '%s'),
                array('%s', '%s')
            );
        } else {
            // 插入新缓存
            $result = $wpdb->insert(
                $table_name,
                array(
                    'cache_key' => $cache_key,
                    'cache_group' => $group,
                    'cache_value' => $cache_value,
                    'cache_expire' => $cache_expire,
                    'created_at' => $now,
                    'updated_at' => $now
                ),
                array('%s', '%s', '%s', '%d', '%s', '%s')
            );
        }
        
        return $result !== false;
    }
    
    /**
     * 删除缓存
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否删除成功
     */
    public function delete($key, $group = 'default') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        $cache_key = $this->prefix . $key;
        
        $result = $wpdb->delete(
            $table_name,
            array('cache_key' => $cache_key, 'cache_group' => $group),
            array('%s', '%s')
        );
        
        return $result !== false;
    }
    
    /**
     * 清除缓存组
     * 
     * @param string $group 缓存组
     * @return bool 是否清除成功
     */
    public function clear_group($group) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        
        $result = $wpdb->delete(
            $table_name,
            array('cache_group' => $group),
            array('%s')
        );
        
        return $result !== false;
    }
    
    /**
     * 清除所有缓存
     * 
     * @return bool 是否清除成功
     */
    public function clear_all() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        
        $result = $wpdb->query("TRUNCATE TABLE {$table_name}");
        
        return $result !== false;
    }
    
    /**
     * 检查缓存是否存在
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否存在
     */
    public function exists($key, $group = 'default') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        $cache_key = $this->prefix . $key;
        
        // 查询缓存
        $cache = $wpdb->get_row($wpdb->prepare(
            "SELECT cache_expire FROM {$table_name} WHERE cache_key = %s AND cache_group = %s",
            $cache_key, $group
        ));
        
        if (!$cache) {
            return false;
        }
        
        // 检查是否过期
        if ($cache->cache_expire > 0 && $cache->cache_expire < time()) {
            $wpdb->delete(
                $table_name,
                array('cache_key' => $cache_key, 'cache_group' => $group),
                array('%s', '%s')
            );
            return false;
        }
        
        return true;
    }
    
    /**
     * 获取缓存统计信息
     * 
     * @return array 统计信息
     */
    public function get_stats() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_cache';
        
        // 获取总记录数
        $total_records = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
        
        // 获取各组的记录数
        $groups = $wpdb->get_results(
            "SELECT cache_group, COUNT(*) as count FROM {$table_name} GROUP BY cache_group"
        );
        
        $group_stats = array();
        foreach ($groups as $group) {
            $group_stats[] = array(
                'name' => $group->cache_group,
                'records' => $group->count
            );
        }
        
        // 获取表大小
        $table_size = $wpdb->get_var(
            "SELECT ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'MB' 
             FROM information_schema.TABLES 
             WHERE table_schema = '" . DB_NAME . "' 
             AND table_name = '{$table_name}'"
        );
        
        return array(
            'driver' => 'database',
            'table_name' => $table_name,
            'total_records' => $total_records,
            'table_size_mb' => $table_size ? $table_size : 0,
            'groups' => $group_stats
        );
    }
}

/**
 * Redis缓存驱动
 */
class Sut_WeChat_Mini_Cache_Redis {
    
    /**
     * Redis连接实例
     */
    private $redis = null;
    
    /**
     * 缓存前缀
     */
    private $prefix = '';
    
    /**
     * 构造函数
     * 
     * @param string $prefix 缓存前缀
     */
    public function __construct($prefix) {
        $this->prefix = $prefix;
        
        // 尝试连接Redis
        $this->connect_redis();
    }
    
    /**
     * 连接Redis
     */
    private function connect_redis() {
        // 检查Redis扩展是否安装
        if (!class_exists('Redis')) {
            return;
        }
        
        try {
            $this->redis = new Redis();
            
            // 获取Redis配置
            $host = get_option('sut_wechat_mini_redis_host', '127.0.0.1');
            $port = get_option('sut_wechat_mini_redis_port', 6379);
            $password = get_option('sut_wechat_mini_redis_password', '');
            $database = get_option('sut_wechat_mini_redis_database', 0);
            
            // 连接Redis
            $this->redis->connect($host, $port);
            
            // 设置密码
            if (!empty($password)) {
                $this->redis->auth($password);
            }
            
            // 选择数据库
            if ($database > 0) {
                $this->redis->select($database);
            }
        } catch (Exception $e) {
            $this->redis = null;
        }
    }
    
    /**
     * 检查Redis是否可用
     * 
     * @return bool 是否可用
     */
    private function is_redis_available() {
        return $this->redis !== null;
    }
    
    /**
     * 获取缓存键
     * 
     * @param string $key 原始键
     * @param string $group 缓存组
     * @return string 完整键
     */
    private function get_cache_key($key, $group) {
        return $this->prefix . $group . ':' . $key;
    }
    
    /**
     * 获取缓存值
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return mixed 缓存值，不存在时返回false
     */
    public function get($key, $group = 'default') {
        if (!$this->is_redis_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        $value = $this->redis->get($cache_key);
        
        if ($value === false) {
            return false;
        }
        
        return unserialize($value);
    }
    
    /**
     * 设置缓存值
     * 
     * @param string $key 缓存键
     * @param mixed $value 缓存值
     * @param int $expire 过期时间（秒）
     * @param string $group 缓存组
     * @return bool 是否设置成功
     */
    public function set($key, $value, $expire = 3600, $group = 'default') {
        if (!$this->is_redis_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        $serialized_value = serialize($value);
        
        if ($expire > 0) {
            return $this->redis->setex($cache_key, $expire, $serialized_value);
        } else {
            return $this->redis->set($cache_key, $serialized_value);
        }
    }
    
    /**
     * 删除缓存
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否删除成功
     */
    public function delete($key, $group = 'default') {
        if (!$this->is_redis_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        return $this->redis->del($cache_key) > 0;
    }
    
    /**
     * 清除缓存组
     * 
     * @param string $group 缓存组
     * @return bool 是否清除成功
     */
    public function clear_group($group) {
        if (!$this->is_redis_available()) {
            return false;
        }
        
        $pattern = $this->prefix . $group . ':*';
        $keys = $this->redis->keys($pattern);
        
        if (!empty($keys)) {
            return $this->redis->del($keys) > 0;
        }
        
        return true;
    }
    
    /**
     * 清除所有缓存
     * 
     * @return bool 是否清除成功
     */
    public function clear_all() {
        if (!$this->is_redis_available()) {
            return false;
        }
        
        $pattern = $this->prefix . '*';
        $keys = $this->redis->keys($pattern);
        
        if (!empty($keys)) {
            return $this->redis->del($keys) > 0;
        }
        
        return true;
    }
    
    /**
     * 检查缓存是否存在
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否存在
     */
    public function exists($key, $group = 'default') {
        if (!$this->is_redis_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        return $this->redis->exists($cache_key) > 0;
    }
    
    /**
     * 获取缓存统计信息
     * 
     * @return array 统计信息
     */
    public function get_stats() {
        if (!$this->is_redis_available()) {
            return array(
                'driver' => 'redis',
                'status' => 'disconnected'
            );
        }
        
        // 获取Redis信息
        $info = $this->redis->info();
        
        // 获取当前数据库的键数量
        $pattern = $this->prefix . '*';
        $keys = $this->redis->keys($pattern);
        
        // 统计各组的键数量
        $groups = array();
        foreach ($keys as $key) {
            // 移除前缀
            $key_without_prefix = substr($key, strlen($this->prefix));
            
            // 提取组名
            $parts = explode(':', $key_without_prefix, 2);
            $group_name = isset($parts[0]) ? $parts[0] : 'default';
            
            if (!isset($groups[$group_name])) {
                $groups[$group_name] = 0;
            }
            
            $groups[$group_name]++;
        }
        
        $group_stats = array();
        foreach ($groups as $name => $count) {
            $group_stats[] = array(
                'name' => $name,
                'keys' => $count
            );
        }
        
        return array(
            'driver' => 'redis',
            'status' => 'connected',
            'total_keys' => count($keys),
            'memory_used' => isset($info['used_memory_human']) ? $info['used_memory_human'] : 'unknown',
            'groups' => $group_stats
        );
    }
}

/**
 * Memcached缓存驱动
 */
class Sut_WeChat_Mini_Cache_Memcached {
    
    /**
     * Memcached连接实例
     */
    private $memcached = null;
    
    /**
     * 缓存前缀
     */
    private $prefix = '';
    
    /**
     * 构造函数
     * 
     * @param string $prefix 缓存前缀
     */
    public function __construct($prefix) {
        $this->prefix = $prefix;
        
        // 尝试连接Memcached
        $this->connect_memcached();
    }
    
    /**
     * 连接Memcached
     */
    private function connect_memcached() {
        // 检查Memcached扩展是否安装
        if (!class_exists('Memcached')) {
            return;
        }
        
        try {
            $this->memcached = new Memcached();
            
            // 获取Memcached配置
            $servers = get_option('sut_wechat_mini_memcached_servers', array(
                array('127.0.0.1', 11211, 1)
            ));
            
            // 添加服务器
            foreach ($servers as $server) {
                $this->memcached->addServer($server[0], $server[1], $server[2]);
            }
            
            // 测试连接
            $version = $this->memcached->getVersion();
            if (!$version) {
                $this->memcached = null;
            }
        } catch (Exception $e) {
            $this->memcached = null;
        }
    }
    
    /**
     * 检查Memcached是否可用
     * 
     * @return bool 是否可用
     */
    private function is_memcached_available() {
        return $this->memcached !== null;
    }
    
    /**
     * 获取缓存键
     * 
     * @param string $key 原始键
     * @param string $group 缓存组
     * @return string 完整键
     */
    private function get_cache_key($key, $group) {
        return $this->prefix . $group . ':' . $key;
    }
    
    /**
     * 获取缓存值
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return mixed 缓存值，不存在时返回false
     */
    public function get($key, $group = 'default') {
        if (!$this->is_memcached_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        $value = $this->memcached->get($cache_key);
        
        if ($this->memcached->getResultCode() === Memcached::RES_NOTFOUND) {
            return false;
        }
        
        return $value;
    }
    
    /**
     * 设置缓存值
     * 
     * @param string $key 缓存键
     * @param mixed $value 缓存值
     * @param int $expire 过期时间（秒）
     * @param string $group 缓存组
     * @return bool 是否设置成功
     */
    public function set($key, $value, $expire = 3600, $group = 'default') {
        if (!$this->is_memcached_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        return $this->memcached->set($cache_key, $value, $expire);
    }
    
    /**
     * 删除缓存
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否删除成功
     */
    public function delete($key, $group = 'default') {
        if (!$this->is_memcached_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        return $this->memcached->delete($cache_key);
    }
    
    /**
     * 清除缓存组
     * 
     * @param string $group 缓存组
     * @return bool 是否清除成功
     */
    public function clear_group($group) {
        if (!$this->is_memcached_available()) {
            return false;
        }
        
        // Memcached不支持按模式删除，这里使用一个技巧
        // 存储一个组键，包含该组的所有键
        $group_key = $this->prefix . 'group:' . $group;
        $keys = $this->memcached->get($group_key);
        
        if ($keys && is_array($keys)) {
            foreach ($keys as $key) {
                $this->memcached->delete($key);
            }
        }
        
        // 删除组键
        $this->memcached->delete($group_key);
        
        return true;
    }
    
    /**
     * 清除所有缓存
     * 
     * @return bool 是否清除成功
     */
    public function clear_all() {
        if (!$this->is_memcached_available()) {
            return false;
        }
        
        return $this->memcached->flush();
    }
    
    /**
     * 检查缓存是否存在
     * 
     * @param string $key 缓存键
     * @param string $group 缓存组
     * @return bool 是否存在
     */
    public function exists($key, $group = 'default') {
        if (!$this->is_memcached_available()) {
            return false;
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        $this->memcached->get($cache_key);
        
        return $this->memcached->getResultCode() !== Memcached::RES_NOTFOUND;
    }
    
    /**
     * 获取缓存统计信息
     * 
     * @return array 统计信息
     */
    public function get_stats() {
        if (!$this->is_memcached_available()) {
            return array(
                'driver' => 'memcached',
                'status' => 'disconnected'
            );
        }
        
        // 获取Memcached统计信息
        $stats = $this->memcached->getStats();
        $server_stats = reset($stats);
        
        return array(
            'driver' => 'memcached',
            'status' => 'connected',
            'version' => isset($server_stats['version']) ? $server_stats['version'] : 'unknown',
            'total_items' => isset($server_stats['curr_items']) ? $server_stats['curr_items'] : 0,
            'bytes' => isset($server_stats['bytes']) ? $server_stats['bytes'] : 0,
            'bytes_formatted' => isset($server_stats['bytes']) ? size_format($server_stats['bytes']) : '0 B'
        );
    }
}