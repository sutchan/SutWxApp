<?php
/**
 * 文件名: class-sut-wechat-mini-content.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 内容管理类
 * 
 * 提供插件内容管理功能，包括文章、页面、分类、标签等内容的管理
 * 支持内容同步、内容推送、内容搜索等功能
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 内容管理类
 */
class Sut_WeChat_Mini_Content {
    
    /**
     * 内容类型常量
     */
    const CONTENT_TYPE_ARTICLE = 'article';
    const CONTENT_TYPE_PAGE = 'page';
    const CONTENT_TYPE_CATEGORY = 'category';
    const CONTENT_TYPE_TAG = 'tag';
    const CONTENT_TYPE_BANNER = 'banner';
    const CONTENT_TYPE_NOTICE = 'notice';
    
    /**
     * 内容状态常量
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_PRIVATE = 'private';
    const STATUS_TRASH = 'trash';
    
    /**
     * 单例实例
     */
    private static $instance = null;
    
    /**
     * 缓存实例
     */
    private $cache = null;
    
    /**
     * 获取单例实例
     * 
     * @return Sut_WeChat_Mini_Content 内容管理实例
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
        // 初始化缓存
        $this->cache = Sut_WeChat_Mini_Cache::get_instance();
        
        // 注册内容相关钩子
        $this->register_hooks();
    }
    
    /**
     * 注册钩子
     */
    private function register_hooks() {
        // 文章发布时同步到小程序
        add_action('publish_post', array($this, 'sync_post_to_mini_program'), 10, 2);
        
        // 文章更新时同步到小程序
        add_action('post_updated', array($this, 'sync_updated_post_to_mini_program'), 10, 3);
        
        // 文章删除时从小程序移除
        add_action('wp_trash_post', array($this, 'remove_post_from_mini_program'));
        
        // 注册自定义文章类型
        add_action('init', array($this, 'register_custom_post_types'));
        
        // 注册自定义分类法
        add_action('init', array($this, 'register_custom_taxonomies'));
        
        // 注册REST API端点
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * 注册自定义文章类型
     */
    public function register_custom_post_types() {
        // 注册小程序文章类型
        register_post_type('wx_article', array(
            'label' => __('小程序文章', 'sut-wechat-mini'),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'author', 'comments'),
            'menu_icon' => 'dashicons-smartphone',
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'wx-article'),
            'capability_type' => 'post',
        ));
        
        // 注册小程序横幅类型
        register_post_type('wx_banner', array(
            'label' => __('小程序横幅', 'sut-wechat-mini'),
            'public' => true,
            'has_archive' => false,
            'supports' => array('title', 'thumbnail'),
            'menu_icon' => 'dashicons-images-alt2',
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'wx-banner'),
            'capability_type' => 'post',
        ));
        
        // 注册小程序公告类型
        register_post_type('wx_notice', array(
            'label' => __('小程序公告', 'sut-wechat-mini'),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'author'),
            'menu_icon' => 'dashicons-megaphone',
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'wx-notice'),
            'capability_type' => 'post',
        ));
    }
    
    /**
     * 注册自定义分类法
     */
    public function register_custom_taxonomies() {
        // 为小程序文章注册分类
        register_taxonomy('wx_category', array('wx_article'), array(
            'label' => __('小程序分类', 'sut-wechat-mini'),
            'hierarchical' => true,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'wx-category'),
        ));
        
        // 为小程序文章注册标签
        register_taxonomy('wx_tag', array('wx_article'), array(
            'label' => __('小程序标签', 'sut-wechat-mini'),
            'hierarchical' => false,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'wx-tag'),
        ));
    }
    
    /**
     * 注册REST API路由
     */
    public function register_rest_routes() {
        // 注册内容列表路由
        register_rest_route('sut-wechat-mini/v1', '/content', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_content_list'),
                'permission_callback' => array($this, 'check_content_permission'),
                'args' => array(
                    'type' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::CONTENT_TYPE_ARTICLE, 
                                self::CONTENT_TYPE_PAGE,
                                self::CONTENT_TYPE_BANNER,
                                self::CONTENT_TYPE_NOTICE
                            ));
                        }
                    ),
                    'page' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    ),
                    'per_page' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0 && $param <= 100;
                        },
                        'sanitize_callback' => 'absint'
                    ),
                    'category' => array(
                        'required' => false,
                        'sanitize_callback' => 'sanitize_text_field'
                    ),
                    'tag' => array(
                        'required' => false,
                        'sanitize_callback' => 'sanitize_text_field'
                    ),
                    'search' => array(
                        'required' => false,
                        'sanitize_callback' => 'sanitize_text_field'
                    )
                )
            )
        ));
        
        // 注册内容详情路由
        register_rest_route('sut-wechat-mini/v1', '/content/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_content_detail'),
                'permission_callback' => array($this, 'check_content_permission'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    )
                )
            )
        ));
        
        // 注册分类列表路由
        register_rest_route('sut-wechat-mini/v1', '/categories', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_categories'),
                'permission_callback' => array($this, 'check_content_permission'),
                'args' => array(
                    'type' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::CONTENT_TYPE_ARTICLE,
                                self::CONTENT_TYPE_CATEGORY,
                                self::CONTENT_TYPE_TAG
                            ));
                        }
                    )
                )
            )
        ));
        
        // 注册内容搜索路由
        register_rest_route('sut-wechat-mini/v1', '/search', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'search_content'),
                'permission_callback' => array($this, 'check_content_permission'),
                'args' => array(
                    'keyword' => array(
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field'
                    ),
                    'type' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return in_array($param, array(
                                self::CONTENT_TYPE_ARTICLE,
                                self::CONTENT_TYPE_PAGE,
                                self::CONTENT_TYPE_CATEGORY,
                                self::CONTENT_TYPE_TAG
                            ));
                        }
                    ),
                    'page' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0;
                        },
                        'sanitize_callback' => 'absint'
                    ),
                    'per_page' => array(
                        'required' => false,
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0 && $param <= 100;
                        },
                        'sanitize_callback' => 'absint'
                    )
                )
            )
        ));
    }
    
    /**
     * 检查内容权限
     * 
     * @param WP_REST_Request $request 请求对象
     * @return bool|WP_Error 是否有权限
     */
    public function check_content_permission($request) {
        // 检查用户是否已认证
        if (!is_user_logged_in()) {
            return new WP_Error(
                'rest_forbidden',
                __('您需要登录才能访问此内容', 'sut-wechat-mini'),
                array('status' => 401)
            );
        }
        
        // 检查用户是否有查看内容的权限
        if (!current_user_can('read')) {
            return new WP_Error(
                'rest_forbidden',
                __('您没有权限查看此内容', 'sut-wechat-mini'),
                array('status' => 403)
            );
        }
        
        return true;
    }
    
    /**
     * 获取内容列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_content_list($request) {
        // 获取请求参数
        $type = $request->get_param('type') ?: self::CONTENT_TYPE_ARTICLE;
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $category = $request->get_param('category');
        $tag = $request->get_param('tag');
        $search = $request->get_param('search');
        
        // 构建缓存键
        $cache_key = 'content_list_' . md5(serialize(array(
            'type' => $type,
            'page' => $page,
            'per_page' => $per_page,
            'category' => $category,
            'tag' => $tag,
            'search' => $search
        )));
        
        // 尝试从缓存获取
        $cached_data = $this->cache->get($cache_key, 'content');
        if ($cached_data) {
            return rest_ensure_response($cached_data);
        }
        
        // 构建查询参数
        $args = array(
            'post_type' => $this->get_post_type_by_content_type($type),
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        // 添加分类过滤
        if ($category) {
            $args['tax_query'][] = array(
                'taxonomy' => $this->get_taxonomy_by_content_type($type),
                'field' => 'slug',
                'terms' => $category
            );
        }
        
        // 添加标签过滤
        if ($tag) {
            $args['tax_query'][] = array(
                'taxonomy' => 'wx_tag',
                'field' => 'slug',
                'terms' => $tag
            );
        }
        
        // 添加搜索条件
        if ($search) {
            $args['s'] = $search;
        }
        
        // 执行查询
        $query = new WP_Query($args);
        $posts = $query->get_posts();
        $total = $query->found_posts;
        $total_pages = $query->max_num_pages;
        
        // 格式化数据
        $formatted_posts = array();
        foreach ($posts as $post) {
            $formatted_posts[] = $this->format_post_data($post, $type);
        }
        
        // 构建响应数据
        $response_data = array(
            'posts' => $formatted_posts,
            'pagination' => array(
                'page' => $page,
                'per_page' => $per_page,
                'total' => $total,
                'total_pages' => $total_pages
            )
        );
        
        // 缓存数据
        $this->cache->set($cache_key, $response_data, 3600, 'content');
        
        return rest_ensure_response($response_data);
    }
    
    /**
     * 获取内容详情
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_content_detail($request) {
        // 获取文章ID
        $post_id = $request->get_param('id');
        
        // 构建缓存键
        $cache_key = 'content_detail_' . $post_id;
        
        // 尝试从缓存获取
        $cached_data = $this->cache->get($cache_key, 'content');
        if ($cached_data) {
            return rest_ensure_response($cached_data);
        }
        
        // 获取文章
        $post = get_post($post_id);
        
        // 检查文章是否存在
        if (!$post || $post->post_status !== 'publish') {
            return new WP_Error(
                'content_not_found',
                __('内容不存在', 'sut-wechat-mini'),
                array('status' => 404)
            );
        }
        
        // 获取内容类型
        $type = $this->get_content_type_by_post_type($post->post_type);
        
        // 格式化数据
        $formatted_post = $this->format_post_data($post, $type, true);
        
        // 缓存数据
        $this->cache->set($cache_key, $formatted_post, 3600, 'content');
        
        return rest_ensure_response($formatted_post);
    }
    
    /**
     * 获取分类列表
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function get_categories($request) {
        // 获取请求参数
        $type = $request->get_param('type') ?: self::CONTENT_TYPE_ARTICLE;
        
        // 构建缓存键
        $cache_key = 'categories_' . $type;
        
        // 尝试从缓存获取
        $cached_data = $this->cache->get($cache_key, 'content');
        if ($cached_data) {
            return rest_ensure_response($cached_data);
        }
        
        // 获取分类法
        $taxonomy = $this->get_taxonomy_by_content_type($type);
        
        // 获取分类
        $categories = get_terms(array(
            'taxonomy' => $taxonomy,
            'hide_empty' => false,
            'orderby' => 'name',
            'order' => 'ASC'
        ));
        
        // 格式化数据
        $formatted_categories = array();
        foreach ($categories as $category) {
            $formatted_categories[] = array(
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'count' => $category->count,
                'parent' => $category->parent,
                'image' => get_term_meta($category->term_id, 'image', true)
            );
        }
        
        // 缓存数据
        $this->cache->set($cache_key, $formatted_categories, 86400, 'content');
        
        return rest_ensure_response($formatted_categories);
    }
    
    /**
     * 搜索内容
     * 
     * @param WP_REST_Request $request 请求对象
     * @return WP_REST_Response|WP_Error 响应对象
     */
    public function search_content($request) {
        // 获取请求参数
        $keyword = $request->get_param('keyword');
        $type = $request->get_param('type') ?: self::CONTENT_TYPE_ARTICLE;
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        // 构建缓存键
        $cache_key = 'search_' . md5(serialize(array(
            'keyword' => $keyword,
            'type' => $type,
            'page' => $page,
            'per_page' => $per_page
        )));
        
        // 尝试从缓存获取
        $cached_data = $this->cache->get($cache_key, 'content');
        if ($cached_data) {
            return rest_ensure_response($cached_data);
        }
        
        // 构建查询参数
        $args = array(
            'post_type' => $this->get_post_type_by_content_type($type),
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'orderby' => 'relevance',
            'order' => 'DESC',
            's' => $keyword
        );
        
        // 执行查询
        $query = new WP_Query($args);
        $posts = $query->get_posts();
        $total = $query->found_posts;
        $total_pages = $query->max_num_pages;
        
        // 格式化数据
        $formatted_posts = array();
        foreach ($posts as $post) {
            $formatted_posts[] = $this->format_post_data($post, $type);
        }
        
        // 构建响应数据
        $response_data = array(
            'posts' => $formatted_posts,
            'pagination' => array(
                'page' => $page,
                'per_page' => $per_page,
                'total' => $total,
                'total_pages' => $total_pages
            ),
            'keyword' => $keyword
        );
        
        // 缓存数据
        $this->cache->set($cache_key, $response_data, 1800, 'content');
        
        return rest_ensure_response($response_data);
    }
    
    /**
     * 根据内容类型获取文章类型
     * 
     * @param string $content_type 内容类型
     * @return string 文章类型
     */
    private function get_post_type_by_content_type($content_type) {
        switch ($content_type) {
            case self::CONTENT_TYPE_ARTICLE:
                return 'wx_article';
            case self::CONTENT_TYPE_BANNER:
                return 'wx_banner';
            case self::CONTENT_TYPE_NOTICE:
                return 'wx_notice';
            case self::CONTENT_TYPE_PAGE:
                return 'page';
            default:
                return 'post';
        }
    }
    
    /**
     * 根据文章类型获取内容类型
     * 
     * @param string $post_type 文章类型
     * @return string 内容类型
     */
    private function get_content_type_by_post_type($post_type) {
        switch ($post_type) {
            case 'wx_article':
                return self::CONTENT_TYPE_ARTICLE;
            case 'wx_banner':
                return self::CONTENT_TYPE_BANNER;
            case 'wx_notice':
                return self::CONTENT_TYPE_NOTICE;
            case 'page':
                return self::CONTENT_TYPE_PAGE;
            default:
                return self::CONTENT_TYPE_ARTICLE;
        }
    }
    
    /**
     * 根据内容类型获取分类法
     * 
     * @param string $content_type 内容类型
     * @return string 分类法
     */
    private function get_taxonomy_by_content_type($content_type) {
        switch ($content_type) {
            case self::CONTENT_TYPE_ARTICLE:
                return 'wx_category';
            case self::CONTENT_TYPE_CATEGORY:
                return 'category';
            case self::CONTENT_TYPE_TAG:
                return 'post_tag';
            default:
                return 'wx_category';
        }
    }
    
    /**
     * 格式化文章数据
     * 
     * @param WP_Post $post 文章对象
     * @param string $type 内容类型
     * @param bool $full 是否获取完整内容
     * @return array 格式化后的文章数据
     */
    private function format_post_data($post, $type, $full = false) {
        // 基础数据
        $data = array(
            'id' => $post->ID,
            'title' => get_the_title($post),
            'excerpt' => get_the_excerpt($post),
            'date' => get_the_date('Y-m-d H:i:s', $post),
            'date_gmt' => get_the_date('Y-m-d H:i:s', $post, true),
            'modified' => get_the_modified_date('Y-m-d H:i:s', $post),
            'modified_gmt' => get_the_modified_date('Y-m-d H:i:s', $post, true),
            'author' => array(
                'id' => $post->post_author,
                'name' => get_the_author_meta('display_name', $post->post_author),
                'avatar' => get_avatar_url($post->post_author, array('size' => 96))
            ),
            'type' => $type,
            'status' => $post->post_status,
            'comment_count' => $post->comment_count,
            'view_count' => get_post_meta($post->ID, 'view_count', true) ?: 0
        );
        
        // 添加缩略图
        if (has_post_thumbnail($post)) {
            $thumbnail_id = get_post_thumbnail_id($post);
            $thumbnail = wp_get_attachment_image_src($thumbnail_id, 'full');
            $data['thumbnail'] = array(
                'id' => $thumbnail_id,
                'url' => $thumbnail[0],
                'width' => $thumbnail[1],
                'height' => $thumbnail[2]
            );
        } else {
            $data['thumbnail'] = null;
        }
        
        // 添加分类和标签
        if ($type === self::CONTENT_TYPE_ARTICLE) {
            // 获取分类
            $categories = get_the_terms($post, 'wx_category');
            $data['categories'] = array();
            if ($categories && !is_wp_error($categories)) {
                foreach ($categories as $category) {
                    $data['categories'][] = array(
                        'id' => $category->term_id,
                        'name' => $category->name,
                        'slug' => $category->slug
                    );
                }
            }
            
            // 获取标签
            $tags = get_the_terms($post, 'wx_tag');
            $data['tags'] = array();
            if ($tags && !is_wp_error($tags)) {
                foreach ($tags as $tag) {
                    $data['tags'][] = array(
                        'id' => $tag->term_id,
                        'name' => $tag->name,
                        'slug' => $tag->slug
                    );
                }
            }
        }
        
        // 如果需要完整内容，添加内容字段
        if ($full) {
            $data['content'] = apply_filters('the_content', $post->post_content);
            
            // 增加浏览量
            $view_count = intval(get_post_meta($post->ID, 'view_count', true)) + 1;
            update_post_meta($post->ID, 'view_count', $view_count);
            $data['view_count'] = $view_count;
        }
        
        // 添加自定义字段
        $custom_fields = get_post_custom($post->ID);
        $data['meta'] = array();
        foreach ($custom_fields as $key => $values) {
            if (strpos($key, '_') !== 0) {
                $data['meta'][$key] = maybe_unserialize($values[0]);
            }
        }
        
        return apply_filters('sut_wechat_mini_format_post_data', $data, $post, $type, $full);
    }
    
    /**
     * 同步文章到小程序
     * 
     * @param int $post_id 文章ID
     * @param WP_Post $post 文章对象
     */
    public function sync_post_to_mini_program($post_id, $post) {
        // 只同步公开的文章
        if ($post->post_status !== 'publish') {
            return;
        }
        
        // 清除相关缓存
        $this->clear_content_cache();
        
        // 发送推送通知
        $this->send_push_notification($post);
        
        // 记录同步日志
        $this->log_sync_action($post_id, 'sync_to_mini_program');
    }
    
    /**
     * 同步更新的文章到小程序
     * 
     * @param int $post_id 文章ID
     * @param WP_Post $post_after 更新后的文章对象
     * @param WP_Post $post_before 更新前的文章对象
     */
    public function sync_updated_post_to_mini_program($post_id, $post_after, $post_before) {
        // 只同步公开的文章
        if ($post_after->post_status !== 'publish') {
            return;
        }
        
        // 清除相关缓存
        $this->clear_content_cache();
        
        // 记录同步日志
        $this->log_sync_action($post_id, 'sync_updated_to_mini_program');
    }
    
    /**
     * 从小程序移除文章
     * 
     * @param int $post_id 文章ID
     */
    public function remove_post_from_mini_program($post_id) {
        // 清除相关缓存
        $this->clear_content_cache();
        
        // 记录同步日志
        $this->log_sync_action($post_id, 'remove_from_mini_program');
    }
    
    /**
     * 清除内容缓存
     */
    private function clear_content_cache() {
        $this->cache->clear_group('content');
    }
    
    /**
     * 发送推送通知
     * 
     * @param WP_Post $post 文章对象
     */
    private function send_push_notification($post) {
        // 检查是否启用推送通知
        $push_enabled = get_option('sut_wechat_mini_push_enabled', false);
        if (!$push_enabled) {
            return;
        }
        
        // 获取推送服务
        $push_service = Sut_WeChat_Mini_Push_Service::get_instance();
        
        // 构建推送消息
        $message = array(
            'title' => get_the_title($post),
            'content' => get_the_excerpt($post),
            'url' => get_permalink($post),
            'image' => get_the_post_thumbnail_url($post, 'thumbnail')
        );
        
        // 发送推送
        $push_service->send_to_all($message);
    }
    
    /**
     * 记录同步日志
     * 
     * @param int $post_id 文章ID
     * @param string $action 操作类型
     */
    private function log_sync_action($post_id, $action) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_content_sync_log';
        
        $wpdb->insert(
            $table_name,
            array(
                'post_id' => $post_id,
                'action' => $action,
                'created_at' => current_time('mysql')
            )
        );
    }
    
    /**
     * 获取内容统计信息
     * 
     * @param string $type 内容类型
     * @return array 统计信息
     */
    public function get_content_stats($type = null) {
        global $wpdb;
        
        // 构建缓存键
        $cache_key = 'content_stats_' . ($type ?: 'all');
        
        // 尝试从缓存获取
        $cached_stats = $this->cache->get($cache_key, 'content');
        if ($cached_stats) {
            return $cached_stats;
        }
        
        $stats = array();
        
        if ($type) {
            // 获取特定类型的统计
            $post_type = $this->get_post_type_by_content_type($type);
            $stats[$type] = array(
                'total' => wp_count_posts($post_type)->publish,
                'today' => $this->get_today_post_count($post_type),
                'this_week' => $this->get_this_week_post_count($post_type),
                'this_month' => $this->get_this_month_post_count($post_type)
            );
        } else {
            // 获取所有类型的统计
            $types = array(
                self::CONTENT_TYPE_ARTICLE,
                self::CONTENT_TYPE_BANNER,
                self::CONTENT_TYPE_NOTICE,
                self::CONTENT_TYPE_PAGE
            );
            
            foreach ($types as $content_type) {
                $post_type = $this->get_post_type_by_content_type($content_type);
                $stats[$content_type] = array(
                    'total' => wp_count_posts($post_type)->publish,
                    'today' => $this->get_today_post_count($post_type),
                    'this_week' => $this->get_this_week_post_count($post_type),
                    'this_month' => $this->get_this_month_post_count($post_type)
                );
            }
        }
        
        // 缓存数据
        $this->cache->set($cache_key, $stats, 3600, 'content');
        
        return $stats;
    }
    
    /**
     * 获取今日文章数量
     * 
     * @param string $post_type 文章类型
     * @return int 文章数量
     */
    private function get_today_post_count($post_type) {
        global $wpdb;
        
        $today = date('Y-m-d');
        
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->posts} 
            WHERE post_type = %s 
            AND post_status = 'publish' 
            AND DATE(post_date) = %s",
            $post_type, $today
        ));
    }
    
    /**
     * 获取本周文章数量
     * 
     * @param string $post_type 文章类型
     * @return int 文章数量
     */
    private function get_this_week_post_count($post_type) {
        global $wpdb;
        
        $start_of_week = date('Y-m-d', strtotime('monday this week'));
        $end_of_week = date('Y-m-d', strtotime('sunday this week'));
        
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->posts} 
            WHERE post_type = %s 
            AND post_status = 'publish' 
            AND DATE(post_date) BETWEEN %s AND %s",
            $post_type, $start_of_week, $end_of_week
        ));
    }
    
    /**
     * 获取本月文章数量
     * 
     * @param string $post_type 文章类型
     * @return int 文章数量
     */
    private function get_this_month_post_count($post_type) {
        global $wpdb;
        
        $start_of_month = date('Y-m-01');
        $end_of_month = date('Y-m-t');
        
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->posts} 
            WHERE post_type = %s 
            AND post_status = 'publish' 
            AND DATE(post_date) BETWEEN %s AND %s",
            $post_type, $start_of_month, $end_of_month
        ));
    }
}