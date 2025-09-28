<?php
/**
 * SUT微信小程序内容管理类
 *
 * 处理WordPress内容的获取和格式化，为微信小程序提供文章、分类、标签等内容支持
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Content 类
 */
class SUT_WeChat_Mini_Content {
    
    /**
     * 内容管理实例
     *
     * @var SUT_WeChat_Mini_Content
     */
    private static $instance = null;
    
    /**
     * 默认每页显示数量
     *
     * @var int
     */
    private $default_per_page = 10;
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_Content
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化内容管理
     */
    private function init() {
        // 注册内容相关的钩子
        add_filter( 'sut_wechat_mini_api_routes', array( $this, 'add_content_routes' ) );
    }
    
    /**
     * 添加内容相关的API路由
     *
     * @param array $routes 现有路由
     * @return array 修改后的路由
     */
    public function add_content_routes( $routes ) {
        $routes['posts/search'] = array( 'callback' => array( $this, 'api_search_posts' ) );
        $routes['posts/hot'] = array( 'callback' => array( $this, 'api_get_hot_posts' ) );
        $routes['posts/latest'] = array( 'callback' => array( $this, 'api_get_latest_posts' ) );
        $routes['posts/related/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_related_posts' ) );
        $routes['categories/([0-9]+)/posts'] = array( 'callback' => array( $this, 'api_get_posts_by_category' ) );
        $routes['tags/([0-9]+)/posts'] = array( 'callback' => array( $this, 'api_get_posts_by_tag' ) );
        $routes['pages'] = array( 'callback' => array( $this, 'api_get_pages' ) );
        $routes['pages/([0-9]+)'] = array( 'callback' => array( $this, 'api_get_page' ) );
        
        return $routes;
    }
    
    /**
     * 获取文章列表
     *
     * @param array $data 请求数据
     * @return array 文章列表
     */
    public function get_posts( $data ) {
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 应用额外的查询条件
        $args = $this->apply_post_query_filters( $args, $data );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => array(
                'list' => $posts,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 获取单篇文章
     *
     * @param int $post_id 文章ID
     * @return array 文章详情
     */
    public function get_post( $post_id ) {
        // 获取文章
        $post = get_post( $post_id );
        
        if ( ! $post || 'publish' !== $post->post_status ) {
            return array(
                'code' => 104,
                'message' => __( '文章不存在或未发布', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 增加文章浏览量
        $this->increase_post_views( $post_id );
        
        // 格式化文章数据
        $formatted_post = $this->format_post( $post, true );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_post
        );
        
        return $result;
    }
    
    /**
     * 获取分类列表
     *
     * @param array $data 请求数据
     * @return array 分类列表
     */
    public function get_categories( $data ) {
        // 获取参数
        $parent = isset( $data['parent'] ) ? intval( $data['parent'] ) : 0;
        $hide_empty = isset( $data['hide_empty'] ) ? boolval( $data['hide_empty'] ) : true;
        
        // 构建查询参数
        $args = array(
            'taxonomy'   => 'category',
            'parent'     => $parent,
            'hide_empty' => $hide_empty,
            'orderby'    => 'count',
            'order'      => 'DESC',
        );
        
        // 获取分类
        $categories = get_categories( $args );
        
        // 格式化分类数据
        $formatted_categories = array();
        foreach ( $categories as $category ) {
            $formatted_categories[] = array(
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent' => $category->parent,
                'count' => $category->count,
            );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_categories
        );
        
        return $result;
    }
    
    /**
     * 获取标签列表
     *
     * @param array $data 请求数据
     * @return array 标签列表
     */
    public function get_tags( $data ) {
        // 获取参数
        $number = isset( $data['number'] ) ? intval( $data['number'] ) : 100;
        $orderby = isset( $data['orderby'] ) ? $data['orderby'] : 'count';
        $order = isset( $data['order'] ) ? $data['order'] : 'DESC';
        
        // 构建查询参数
        $args = array(
            'taxonomy' => 'post_tag',
            'number'   => $number,
            'orderby'  => $orderby,
            'order'    => $order,
        );
        
        // 获取标签
        $tags = get_tags( $args );
        
        // 格式化标签数据
        $formatted_tags = array();
        foreach ( $tags as $tag ) {
            $formatted_tags[] = array(
                'id' => $tag->term_id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'description' => $tag->description,
                'count' => $tag->count,
            );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_tags
        );
        
        return $result;
    }
    
    /**
     * 搜索文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 搜索结果
     */
    public function api_search_posts( $data, $matches ) {
        // 检查搜索关键词
        if ( ! isset( $data['keyword'] ) || empty( $data['keyword'] ) ) {
            return array(
                'code' => 100,
                'message' => __( '缺少搜索关键词', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建搜索参数
        $args = array(
            's'              => $data['keyword'],
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'relevance',
            'order'          => 'DESC',
        );
        
        // 执行搜索
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => array(
                'list' => $posts,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 获取热门文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 热门文章列表
     */
    public function api_get_hot_posts( $data, $matches ) {
        // 获取参数
        $number = isset( $data['number'] ) ? intval( $data['number'] ) : 10;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $number,
            'meta_key'       => 'post_views_count',
            'orderby'        => 'meta_value_num',
            'order'          => 'DESC',
        );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $posts
        );
        
        return $result;
    }
    
    /**
     * 获取最新文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 最新文章列表
     */
    public function api_get_latest_posts( $data, $matches ) {
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => array(
                'list' => $posts,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 获取相关文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 相关文章列表
     */
    public function api_get_related_posts( $data, $matches ) {
        $post_id = $matches[1];
        $number = isset( $data['number'] ) ? intval( $data['number'] ) : 5;
        
        // 获取当前文章的分类和标签
        $categories = wp_get_post_categories( $post_id );
        $tags = wp_get_post_tags( $post_id, array( 'fields' => 'ids' ) );
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $number,
            'post__not_in'   => array( $post_id ),
            'orderby'        => 'rand',
        );
        
        // 如果有分类或标签，使用它们来查找相关文章
        if ( ! empty( $categories ) || ! empty( $tags ) ) {
            $tax_query = array( 'relation' => 'OR' );
            
            if ( ! empty( $categories ) ) {
                $tax_query[] = array(
                    'taxonomy' => 'category',
                    'field'    => 'id',
                    'terms'    => $categories,
                );
            }
            
            if ( ! empty( $tags ) ) {
                $tax_query[] = array(
                    'taxonomy' => 'post_tag',
                    'field'    => 'id',
                    'terms'    => $tags,
                );
            }
            
            $args['tax_query'] = $tax_query;
        }
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $posts
        );
        
        return $result;
    }
    
    /**
     * 根据分类获取文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 文章列表
     */
    public function api_get_posts_by_category( $data, $matches ) {
        $category_id = $matches[1];
        
        // 检查分类是否存在
        $category = get_category( $category_id );
        if ( ! $category || is_wp_error( $category ) ) {
            return array(
                'code' => 104,
                'message' => __( '分类不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'category__in'   => array( $category_id ),
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => array(
                'list' => $posts,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 根据标签获取文章
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 文章列表
     */
    public function api_get_posts_by_tag( $data, $matches ) {
        $tag_id = $matches[1];
        
        // 检查标签是否存在
        $tag = get_tag( $tag_id );
        if ( ! $tag || is_wp_error( $tag ) ) {
            return array(
                'code' => 104,
                'message' => __( '标签不存在', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'tag__in'        => array( $tag_id ),
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化文章数据
        $posts = array();
        foreach ( $query->posts as $post ) {
            $posts[] = $this->format_post( $post );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => array(
                'list' => $posts,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 获取页面列表
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 页面列表
     */
    public function api_get_pages( $data, $matches ) {
        // 获取分页参数
        $page = isset( $data['page'] ) ? intval( $data['page'] ) : 1;
        $per_page = isset( $data['per_page'] ) ? intval( $data['per_page'] ) : $this->default_per_page;
        $offset = ( $page - 1 ) * $per_page;
        
        // 构建查询参数
        $args = array(
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'orderby'        => 'menu_order',
            'order'          => 'ASC',
        );
        
        // 执行查询
        $query = new WP_Query( $args );
        
        // 格式化页面数据
        $pages = array();
        foreach ( $query->posts as $page ) {
            $pages[] = $this->format_page( $page );
        }
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => array(
                'list' => $pages,
                'total' => $query->found_posts,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil( $query->found_posts / $per_page )
            )
        );
        
        return $result;
    }
    
    /**
     * 获取单个页面
     *
     * @param array $data 请求数据
     * @param array $matches 路由匹配结果
     * @return array 页面详情
     */
    public function api_get_page( $data, $matches ) {
        $page_id = $matches[1];
        
        // 获取页面
        $page = get_post( $page_id );
        
        if ( ! $page || 'page' !== $page->post_type || 'publish' !== $page->post_status ) {
            return array(
                'code' => 104,
                'message' => __( '页面不存在或未发布', 'sut-wechat-mini' ),
                'data' => array()
            );
        }
        
        // 格式化页面数据
        $formatted_page = $this->format_page( $page, true );
        
        // 构建返回数据
        $result = array(
            'code' => 0,
            'message' => __( '成功', 'sut-wechat-mini' ),
            'data' => $formatted_page
        );
        
        return $result;
    }
    
    /**
     * 格式化文章数据
     *
     * @param WP_Post $post 文章对象
     * @param bool $is_detail 是否为详情页
     * @return array 格式化后的文章数据
     */
    private function format_post( $post, $is_detail = false ) {
        // 获取特色图片
        $thumbnail_id = get_post_thumbnail_id( $post->ID );
        $thumbnail_url = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : '';
        
        // 获取分类
        $categories = wp_get_post_categories( $post->ID );
        $formatted_categories = array();
        foreach ( $categories as $category_id ) {
            $category = get_category( $category_id );
            if ( $category ) {
                $formatted_categories[] = array(
                    'id' => $category->term_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                );
            }
        }
        
        // 获取标签
        $tags = wp_get_post_tags( $post->ID );
        $formatted_tags = array();
        foreach ( $tags as $tag ) {
            $formatted_tags[] = array(
                'id' => $tag->term_id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            );
        }
        
        // 获取作者信息
        $author = get_user_by( 'id', $post->post_author );
        $author_info = array(
            'id' => $post->post_author,
            'name' => $author ? $author->display_name : '',
            'avatar' => $author ? get_avatar_url( $author->ID ) : '',
        );
        
        // 构建文章数据
        $post_data = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'slug' => $post->post_name,
            'excerpt' => wp_strip_all_tags( $post->post_excerpt ? $post->post_excerpt : wp_trim_words( $post->post_content, 100 ) ),
            'thumbnail' => $thumbnail_url,
            'categories' => $formatted_categories,
            'tags' => $formatted_tags,
            'author' => $author_info,
            'views' => $this->get_post_views( $post->ID ),
            'comment_count' => $post->comment_count,
            'date' => $post->post_date,
            'modified' => $post->post_modified,
        );
        
        // 如果是详情页，添加更多内容
        if ( $is_detail ) {
            $content = apply_filters( 'the_content', $post->post_content );
            
            // 处理HTML内容，转为适合小程序显示的格式
            $content = $this->process_content_for_mini_program( $content );
            
            $post_data['content'] = $content;
            $post_data['url'] = get_permalink( $post->ID );
        }
        
        return $post_data;
    }
    
    /**
     * 格式化页面数据
     *
     * @param WP_Post $page 页面对象
     * @param bool $is_detail 是否为详情页
     * @return array 格式化后的页面数据
     */
    private function format_page( $page, $is_detail = false ) {
        // 获取特色图片
        $thumbnail_id = get_post_thumbnail_id( $page->ID );
        $thumbnail_url = $thumbnail_id ? wp_get_attachment_url( $thumbnail_id ) : '';
        
        // 构建页面数据
        $page_data = array(
            'id' => $page->ID,
            'title' => $page->post_title,
            'slug' => $page->post_name,
            'thumbnail' => $thumbnail_url,
            'date' => $page->post_date,
            'modified' => $page->post_modified,
        );
        
        // 如果是详情页，添加内容
        if ( $is_detail ) {
            $content = apply_filters( 'the_content', $page->post_content );
            
            // 处理HTML内容，转为适合小程序显示的格式
            $content = $this->process_content_for_mini_program( $content );
            
            $page_data['content'] = $content;
            $page_data['url'] = get_permalink( $page->ID );
        }
        
        return $page_data;
    }
    
    /**
     * 处理内容为小程序适合的格式
     *
     * @param string $content HTML内容
     * @return string 处理后的内容
     */
    private function process_content_for_mini_program( $content ) {
        // 替换特殊字符
        $content = str_replace( array( '<', '>', '&' ), array( '&lt;', '&gt;', '&amp;' ), $content );
        
        // 处理图片
        $content = preg_replace_callback( '/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', function( $matches ) {
            $src = $matches[1];
            // 确保图片URL是绝对路径
            if ( 0 !== strpos( $src, 'http' ) ) {
                $src = site_url() . $src;
            }
            return '<img src="' . $src . '" mode="aspectFit" />';
        }, $content );
        
        // 处理链接
        $content = preg_replace_callback( '/<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)<\/a>/i', function( $matches ) {
            $href = $matches[1];
            $text = $matches[2];
            return '<text class="link" data-href="' . $href . '">' . $text . '</text>';
        }, $content );
        
        // 处理视频
        $content = preg_replace_callback( '/<video[^>]+src=["\']([^"\']+)["\'][^>]*>/i', function( $matches ) {
            $src = $matches[1];
            // 确保视频URL是绝对路径
            if ( 0 !== strpos( $src, 'http' ) ) {
                $src = site_url() . $src;
            }
            return '<video src="' . $src . '" controls></video>';
        }, $content );
        
        // 处理音频
        $content = preg_replace_callback( '/<audio[^>]+src=["\']([^"\']+)["\'][^>]*>/i', function( $matches ) {
            $src = $matches[1];
            // 确保音频URL是绝对路径
            if ( 0 !== strpos( $src, 'http' ) ) {
                $src = site_url() . $src;
            }
            return '<audio src="' . $src . '" controls></audio>';
        }, $content );
        
        // 处理代码块
        $content = preg_replace( '/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/is', '<view class="code-block"><text>$1</text></view>', $content );
        
        // 处理表格
        $content = preg_replace( '/<table[^>]*>(.*?)<\/table>/is', '<view class="table-container">$1</view>', $content );
        
        return $content;
    }
    
    /**
     * 应用文章查询过滤条件
     *
     * @param array $args 查询参数
     * @param array $data 请求数据
     * @return array 修改后的查询参数
     */
    private function apply_post_query_filters( $args, $data ) {
        // 根据分类过滤
        if ( isset( $data['category'] ) && ! empty( $data['category'] ) ) {
            $args['category__in'] = array_map( 'intval', explode( ',', $data['category'] ) );
        }
        
        // 根据标签过滤
        if ( isset( $data['tag'] ) && ! empty( $data['tag'] ) ) {
            $args['tag__in'] = array_map( 'intval', explode( ',', $data['tag'] ) );
        }
        
        // 根据作者过滤
        if ( isset( $data['author'] ) && ! empty( $data['author'] ) ) {
            $args['author'] = $data['author'];
        }
        
        // 根据发布日期过滤
        if ( isset( $data['start_date'] ) && ! empty( $data['start_date'] ) ) {
            $args['date_query'][0]['after'] = $data['start_date'];
        }
        
        if ( isset( $data['end_date'] ) && ! empty( $data['end_date'] ) ) {
            $args['date_query'][0]['before'] = $data['end_date'];
        }
        
        // 根据自定义字段过滤
        if ( isset( $data['meta_key'] ) && isset( $data['meta_value'] ) ) {
            $args['meta_key'] = $data['meta_key'];
            $args['meta_value'] = $data['meta_value'];
            
            if ( isset( $data['meta_compare'] ) ) {
                $args['meta_compare'] = $data['meta_compare'];
            }
        }
        
        // 根据排序方式过滤
        if ( isset( $data['orderby'] ) && ! empty( $data['orderby'] ) ) {
            $args['orderby'] = $data['orderby'];
            
            if ( isset( $data['order'] ) && ! empty( $data['order'] ) ) {
                $args['order'] = $data['order'];
            }
        }
        
        return $args;
    }
    
    /**
     * 获取文章浏览量
     *
     * @param int $post_id 文章ID
     * @return int 浏览量
     */
    private function get_post_views( $post_id ) {
        $views = get_post_meta( $post_id, 'post_views_count', true );
        return $views ? intval( $views ) : 0;
    }
    
    /**
     * 增加文章浏览量
     *
     * @param int $post_id 文章ID
     */
    private function increase_post_views( $post_id ) {
        $views = $this->get_post_views( $post_id );
        update_post_meta( $post_id, 'post_views_count', $views + 1 );
    }
}