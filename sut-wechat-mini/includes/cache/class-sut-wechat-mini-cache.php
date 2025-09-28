<?php
/**
 * SUT微信小程序缓存管理类
 *
 * 负责微信小程序的缓存管理、缓存清理、缓存预热等功能
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Cache 类
 */
class SUT_WeChat_Mini_Cache {
    
    /**
     * 单例实例
     *
     * @var SUT_WeChat_Mini_Cache
     */
    private static $instance = null;
    
    /**
     * 默认缓存时间（秒）
     *
     * @var int
     */
    private $default_ttl = 3600;
    
    /**
     * 缓存前缀
     *
     * @var string
     */
    private $cache_prefix = 'sut_wechat_mini_';
    
    /**
     * 构造函数
     */
    private function __construct() {
        // 注册钩子
        $this->register_hooks();
        
        // 设置缓存时间
        $this->set_default_ttl();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_Cache
     */
    public static function get_instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 注册钩子
     */
    private function register_hooks() {
        // 清理缓存
        add_action( 'sut_wechat_mini_clear_cache', array( $this, 'clear_all_cache' ) );
        
        // 文章更新时清理相关缓存
        add_action( 'save_post', array( $this, 'on_post_updated' ), 10, 3 );
        
        // 文章删除时清理相关缓存
        add_action( 'delete_post', array( $this, 'on_post_deleted' ), 10, 1 );
        
        // 产品更新时清理相关缓存
        add_action( 'woocommerce_update_product', array( $this, 'on_product_updated' ), 10, 1 );
        
        // 产品删除时清理相关缓存
        add_action( 'before_delete_post', array( $this, 'on_product_deleted' ), 10, 1 );
        
        // 订单状态变更时清理相关缓存
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 3 );
        
        // 用户更新时清理相关缓存
        add_action( 'profile_update', array( $this, 'on_user_updated' ), 10, 2 );
        
        // 每日定时清理过期缓存
        if ( ! wp_next_scheduled( 'sut_wechat_mini_daily_cleanup' ) ) {
            wp_schedule_event( time(), 'daily', 'sut_wechat_mini_daily_cleanup' );
        }
        
        add_action( 'sut_wechat_mini_daily_cleanup', array( $this, 'daily_cleanup' ) );
    }
    
    /**
     * 设置默认缓存时间
     */
    private function set_default_ttl() {
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        if ( isset( $settings['cache_ttl'] ) && $settings['cache_ttl'] > 0 ) {
            $this->default_ttl = intval( $settings['cache_ttl'] );
        }
    }
    
    /**
     * 生成缓存键
     *
     * @param string $key 原始键名
     * @param array $args 参数数组
     * @return string 完整的缓存键
     */
    private function get_cache_key( $key, $args = array() ) {
        // 如果参数不为空，将参数序列化并添加到键中
        if ( ! empty( $args ) ) {
            $key .= '_' . md5( serialize( $args ) );
        }
        
        // 添加缓存前缀
        return $this->cache_prefix . $key;
    }
    
    /**
     * 获取缓存
     *
     * @param string $key 缓存键
     * @param array $args 参数数组
     * @return mixed 缓存数据或false
     */
    public function get( $key, $args = array() ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 尝试从WordPress缓存获取
        $data = wp_cache_get( $cache_key );
        
        if ( $data !== false ) {
            return $data;
        }
        
        // 如果WordPress缓存未命中，尝试从自定义表获取
        global $wpdb;
        
        $sql = "SELECT data, expire_time FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key = %s";
        $result = $wpdb->get_row( $wpdb->prepare( $sql, $cache_key ), ARRAY_A );
        
        if ( ! $result ) {
            return false;
        }
        
        // 检查缓存是否过期
        $current_time = time();
        
        if ( $result['expire_time'] > 0 && $current_time > $result['expire_time'] ) {
            // 删除过期缓存
            $this->delete_cache_from_db( $cache_key );
            return false;
        }
        
        // 反序列化缓存数据
        $data = maybe_unserialize( $result['data'] );
        
        // 存储到WordPress缓存中
        wp_cache_set( $cache_key, $data, '', $result['expire_time'] > 0 ? $result['expire_time'] - $current_time : 0 );
        
        return $data;
    }
    
    /**
     * 设置缓存
     *
     * @param string $key 缓存键
     * @param mixed $data 缓存数据
     * @param array $args 参数数组
     * @param int $ttl 缓存时间（秒）
     * @return bool 操作结果
     */
    public function set( $key, $data, $args = array(), $ttl = null ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 使用默认缓存时间（如果未指定）
        if ( is_null( $ttl ) ) {
            $ttl = $this->default_ttl;
        }
        
        // 计算过期时间
        $expire_time = $ttl > 0 ? time() + $ttl : 0;
        
        // 序列化缓存数据
        $serialized_data = maybe_serialize( $data );
        
        // 存储到WordPress缓存
        wp_cache_set( $cache_key, $data, '', $ttl );
        
        // 存储到自定义表
        global $wpdb;
        
        // 检查缓存是否已存在
        $sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key = %s";
        $count = $wpdb->get_var( $wpdb->prepare( $sql, $cache_key ) );
        
        if ( $count > 0 ) {
            // 更新缓存
            $result = $wpdb->update(
                $wpdb->prefix . 'sut_wechat_mini_cache',
                array(
                    'data' => $serialized_data,
                    'expire_time' => $expire_time,
                    'update_time' => current_time( 'mysql' )
                ),
                array(
                    'cache_key' => $cache_key
                ),
                array( '%s', '%d', '%s' ),
                array( '%s' )
            );
        } else {
            // 插入缓存
            $result = $wpdb->insert(
                $wpdb->prefix . 'sut_wechat_mini_cache',
                array(
                    'cache_key' => $cache_key,
                    'data' => $serialized_data,
                    'expire_time' => $expire_time,
                    'create_time' => current_time( 'mysql' ),
                    'update_time' => current_time( 'mysql' )
                ),
                array( '%s', '%s', '%d', '%s', '%s' )
            );
        }
        
        return $result !== false;
    }
    
    /**
     * 删除缓存
     *
     * @param string $key 缓存键
     * @param array $args 参数数组
     * @return bool 操作结果
     */
    public function delete( $key, $args = array() ) {
        $cache_key = $this->get_cache_key( $key, $args );
        
        // 从WordPress缓存删除
        wp_cache_delete( $cache_key );
        
        // 从自定义表删除
        return $this->delete_cache_from_db( $cache_key );
    }
    
    /**
     * 从数据库删除缓存
     *
     * @param string $cache_key 完整的缓存键
     * @return bool 操作结果
     */
    private function delete_cache_from_db( $cache_key ) {
        global $wpdb;
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'sut_wechat_mini_cache',
            array(
                'cache_key' => $cache_key
            ),
            array( '%s' )
        );
        
        return $result !== false;
    }
    
    /**
     * 清理所有缓存
     */
    public function clear_all_cache() {
        // 清理WordPress对象缓存
        wp_cache_flush();
        
        // 清理自定义缓存表
        global $wpdb;
        
        $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}sut_wechat_mini_cache" );
    }
    
    /**
     * 清理指定类型的缓存
     *
     * @param string $cache_type 缓存类型
     */
    public function clear_cache_by_type( $cache_type ) {
        // 构建缓存键前缀
        $cache_key_prefix = $this->cache_prefix . $cache_type . '_';
        
        // 清理WordPress缓存（这里无法精确清理，需要借助第三方插件或自定义实现）
        
        // 清理自定义表中指定类型的缓存
        global $wpdb;
        
        $sql = $wpdb->prepare( "DELETE FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE cache_key LIKE %s", $cache_key_prefix . '%' );
        $wpdb->query( $sql );
    }
    
    /**
     * 清理过期缓存
     */
    public function clear_expired_cache() {
        global $wpdb;
        
        $current_time = time();
        
        $sql = $wpdb->prepare( "DELETE FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE expire_time > 0 AND expire_time < %d", $current_time );
        $wpdb->query( $sql );
    }
    
    /**
     * 清理与文章相关的缓存
     *
     * @param int $post_id 文章ID
     */
    public function clear_post_cache( $post_id ) {
        // 清理文章详情缓存
        $this->delete( 'post_detail', array( 'id' => $post_id ) );
        
        // 清理相关文章列表缓存
        $this->delete( 'related_posts', array( 'post_id' => $post_id ) );
        
        // 清理热门文章缓存
        $this->clear_cache_by_type( 'hot_posts' );
        
        // 清理最新文章缓存
        $this->clear_cache_by_type( 'latest_posts' );
        
        // 清理分类文章缓存
        $categories = wp_get_post_categories( $post_id );
        
        foreach ( $categories as $category_id ) {
            $this->delete( 'category_posts', array( 'category_id' => $category_id ) );
        }
        
        // 清理标签文章缓存
        $tags = wp_get_post_tags( $post_id, array( 'fields' => 'ids' ) );
        
        foreach ( $tags as $tag_id ) {
            $this->delete( 'tag_posts', array( 'tag_id' => $tag_id ) );
        }
    }
    
    /**
     * 清理与产品相关的缓存
     *
     * @param int $product_id 产品ID
     */
    public function clear_product_cache( $product_id ) {
        // 清理产品详情缓存
        $this->delete( 'product_detail', array( 'id' => $product_id ) );
        
        // 清理相关产品缓存
        $this->delete( 'related_products', array( 'product_id' => $product_id ) );
        
        // 清理热门产品缓存
        $this->clear_cache_by_type( 'hot_products' );
        
        // 清理最新产品缓存
        $this->clear_cache_by_type( 'latest_products' );
        
        // 清理分类产品缓存
        $terms = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
        
        foreach ( $terms as $term_id ) {
            $this->delete( 'category_products', array( 'category_id' => $term_id ) );
        }
        
        // 清理标签产品缓存
        $terms = wp_get_post_terms( $product_id, 'product_tag', array( 'fields' => 'ids' ) );
        
        foreach ( $terms as $term_id ) {
            $this->delete( 'tag_products', array( 'tag_id' => $term_id ) );
        }
    }
    
    /**
     * 清理与订单相关的缓存
     *
     * @param int $order_id 订单ID
     */
    public function clear_order_cache( $order_id ) {
        // 清理订单详情缓存
        $this->delete( 'order_detail', array( 'id' => $order_id ) );
        
        // 清理用户订单列表缓存
        $order = wc_get_order( $order_id );
        
        if ( $order ) {
            $user_id = $order->get_user_id();
            
            if ( $user_id > 0 ) {
                $this->delete( 'user_orders', array( 'user_id' => $user_id ) );
            }
        }
    }
    
    /**
     * 清理与用户相关的缓存
     *
     * @param int $user_id 用户ID
     */
    public function clear_user_cache( $user_id ) {
        // 清理用户信息缓存
        $this->delete( 'user_info', array( 'id' => $user_id ) );
        
        // 清理用户订单缓存
        $this->delete( 'user_orders', array( 'user_id' => $user_id ) );
        
        // 清理用户收藏缓存
        $this->delete( 'user_favorites', array( 'user_id' => $user_id ) );
        
        // 清理用户积分缓存
        $this->delete( 'user_points', array( 'user_id' => $user_id ) );
        
        // 清理用户地址缓存
        $this->delete( 'user_addresses', array( 'user_id' => $user_id ) );
    }
    
    /**
     * 预热文章缓存
     *
     * @param int $limit 预热文章数量
     */
    public function warmup_post_cache( $limit = 100 ) {
        // 获取最新的文章
        $args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query( $args );
        
        // 导入SUT_WeChat_Mini_Content类
        if ( ! class_exists( 'SUT_WeChat_Mini_Content' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/content/class-sut-wechat-mini-content.php';
        }
        
        $content_helper = SUT_WeChat_Mini_Content::get_instance();
        
        // 预热每篇文章的缓存
        foreach ( $query->posts as $post ) {
            $post_data = $content_helper->get_post_data( $post->ID );
            
            if ( $post_data ) {
                $this->set( 'post_detail', $post_data, array( 'id' => $post->ID ) );
            }
        }
        
        // 重置查询
        wp_reset_postdata();
    }
    
    /**
     * 预热产品缓存
     *
     * @param int $limit 预热产品数量
     */
    public function warmup_product_cache( $limit = 100 ) {
        // 检查WooCommerce是否激活
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }
        
        // 获取最新的产品
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $query = new WP_Query( $args );
        
        // 导入SUT_WeChat_Mini_WooCommerce类
        if ( ! class_exists( 'SUT_WeChat_Mini_WooCommerce' ) ) {
            require_once SUT_WECHAT_MINI_PLUGIN_DIR . 'includes/woocommerce/class-sut-wechat-mini-woocommerce.php';
        }
        
        $wc_helper = SUT_WeChat_Mini_WooCommerce::get_instance();
        
        // 预热每个产品的缓存
        foreach ( $query->posts as $post ) {
            $product_data = $wc_helper->get_product_data( $post->ID );
            
            if ( $product_data ) {
                $this->set( 'product_detail', $product_data, array( 'id' => $post->ID ) );
            }
        }
        
        // 重置查询
        wp_reset_postdata();
    }
    
    /**
     * 处理文章更新事件
     *
     * @param int $post_id 文章ID
     * @param WP_Post $post 文章对象
     * @param bool $update 是否是更新
     */
    public function on_post_updated( $post_id, $post, $update ) {
        // 只处理发布状态的文章
        if ( $post->post_status !== 'publish' ) {
            return;
        }
        
        // 只处理文章类型
        if ( $post->post_type !== 'post' ) {
            return;
        }
        
        // 清理相关缓存
        $this->clear_post_cache( $post_id );
    }
    
    /**
     * 处理文章删除事件
     *
     * @param int $post_id 文章ID
     */
    public function on_post_deleted( $post_id ) {
        $post = get_post( $post_id );
        
        if ( ! $post || $post->post_type !== 'post' ) {
            return;
        }
        
        // 清理相关缓存
        $this->clear_post_cache( $post_id );
    }
    
    /**
     * 处理产品更新事件
     *
     * @param int $product_id 产品ID
     */
    public function on_product_updated( $product_id ) {
        // 清理相关缓存
        $this->clear_product_cache( $product_id );
    }
    
    /**
     * 处理产品删除事件
     *
     * @param int $post_id 产品ID
     */
    public function on_product_deleted( $post_id ) {
        $post = get_post( $post_id );
        
        if ( ! $post || $post->post_type !== 'product' ) {
            return;
        }
        
        // 清理相关缓存
        $this->clear_product_cache( $post_id );
    }
    
    /**
     * 处理订单状态变更事件
     *
     * @param int $order_id 订单ID
     * @param string $old_status 旧状态
     * @param string $new_status 新状态
     */
    public function on_order_status_changed( $order_id, $old_status, $new_status ) {
        // 清理相关缓存
        $this->clear_order_cache( $order_id );
        
        // 如果订单状态变更会影响统计数据，清理统计缓存
        $this->clear_cache_by_type( 'stats' );
    }
    
    /**
     * 处理用户更新事件
     *
     * @param int $user_id 用户ID
     * @param WP_User $old_user_data 旧用户数据
     */
    public function on_user_updated( $user_id, $old_user_data ) {
        // 清理相关缓存
        $this->clear_user_cache( $user_id );
    }
    
    /**
     * 每日清理任务
     */
    public function daily_cleanup() {
        // 清理过期缓存
        $this->clear_expired_cache();
        
        // 清理缓存表中的大量数据
        $this->optimize_cache_table();
    }
    
    /**
     * 优化缓存表
     */
    private function optimize_cache_table() {
        global $wpdb;
        
        // 检查缓存表大小
        $sql = "SELECT table_name, data_length + index_length as size FROM information_schema.TABLES WHERE table_schema = DATABASE() AND table_name = '{$wpdb->prefix}sut_wechat_mini_cache'";
        $table_info = $wpdb->get_row( $sql, ARRAY_A );
        
        if ( $table_info && $table_info['size'] > 1024 * 1024 * 10 ) { // 如果表大小超过10MB
            // 清理所有缓存
            $this->clear_all_cache();
        }
        
        // 优化表
        $sql = "OPTIMIZE TABLE {$wpdb->prefix}sut_wechat_mini_cache";
        $wpdb->query( $sql );
    }
    
    /**
     * 获取缓存统计信息
     *
     * @return array 缓存统计信息
     */
    public function get_cache_stats() {
        global $wpdb;
        
        // 获取缓存总数
        $total_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache";
        $total = $wpdb->get_var( $total_sql );
        
        // 获取过期缓存数
        $expired_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->prefix}sut_wechat_mini_cache WHERE expire_time > 0 AND expire_time < %d", time() );
        $expired = $wpdb->get_var( $expired_sql );
        
        // 获取不同类型的缓存数
        $types = array();
        $type_sql = "SELECT SUBSTRING_INDEX(cache_key, '_', 3) as cache_type, COUNT(*) as count FROM {$wpdb->prefix}sut_wechat_mini_cache GROUP BY cache_type";
        $type_results = $wpdb->get_results( $type_sql, ARRAY_A );
        
        foreach ( $type_results as $result ) {
            $types[$result['cache_type']] = $result['count'];
        }
        
        return array(
            'total' => $total,
            'expired' => $expired,
            'types' => $types
        );
    }
    
    /**
     * 缓存回调函数
     *
     * @param string $key 缓存键
     * @param callable $callback 回调函数
     * @param array $args 参数数组
     * @param int $ttl 缓存时间
     * @return mixed 缓存数据
     */
    public function cache_callback( $key, $callback, $args = array(), $ttl = null ) {
        // 尝试获取缓存
        $data = $this->get( $key, $args );
        
        // 如果缓存命中，返回缓存数据
        if ( $data !== false ) {
            return $data;
        }
        
        // 调用回调函数获取数据
        $data = call_user_func( $callback );
        
        // 如果获取到数据，设置缓存
        if ( $data !== false && $data !== null ) {
            $this->set( $key, $data, $args, $ttl );
        }
        
        return $data;
    }
}