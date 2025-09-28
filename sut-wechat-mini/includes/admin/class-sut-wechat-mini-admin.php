<?php
/**
 * SUT微信小程序管理类
 *
 * 处理插件的后台管理功能，包括设置页面、菜单等
 *
 * @package SUT_WeChat_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SUT_WeChat_Mini_Admin 类
 */
class SUT_WeChat_Mini_Admin {
    
    /**
     * 管理类实例
     *
     * @var SUT_WeChat_Mini_Admin
     */
    private static $instance = null;
    
    /**
     * 插件设置选项名称
     *
     * @var string
     */
    private $option_name = 'sut_wechat_mini_settings';
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init();
    }
    
    /**
     * 获取单例实例
     *
     * @return SUT_WeChat_Mini_Admin
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * 初始化管理功能
     */
    private function init() {
        // 添加菜单项
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        
        // 注册设置
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        
        // 添加插件设置链接
        add_filter( 'plugin_action_links_' . SUT_WECHAT_MINI_PLUGIN_BASENAME, array( $this, 'add_plugin_links' ) );
        
        // 加载管理脚本和样式
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
    }
    
    /**
     * 添加管理菜单项
     */
    public function add_admin_menu() {
        // 添加主菜单项
        add_menu_page(
            __( 'SUT微信小程序', 'sut-wechat-mini' ),
            __( '微信小程序', 'sut-wechat-mini' ),
            'manage_options',
            'sut-wechat-mini',
            array( $this, 'render_settings_page' ),
            'dashicons-smartphone',
            80
        );
        
        // 添加子菜单项
        add_submenu_page(
            'sut-wechat-mini',
            __( '基础设置', 'sut-wechat-mini' ),
            __( '基础设置', 'sut-wechat-mini' ),
            'manage_options',
            'sut-wechat-mini',
            array( $this, 'render_settings_page' )
        );
        
        add_submenu_page(
            'sut-wechat-mini',
            __( '用户管理', 'sut-wechat-mini' ),
            __( '用户管理', 'sut-wechat-mini' ),
            'manage_options',
            'sut-wechat-mini-users',
            array( $this, 'render_users_page' )
        );
        
        add_submenu_page(
            'sut-wechat-mini',
            __( '订单管理', 'sut-wechat-mini' ),
            __( '订单管理', 'sut-wechat-mini' ),
            'manage_options',
            'sut-wechat-mini-orders',
            array( $this, 'render_orders_page' )
        );
        
        add_submenu_page(
            'sut-wechat-mini',
            __( '数据统计', 'sut-wechat-mini' ),
            __( '数据统计', 'sut-wechat-mini' ),
            'manage_options',
            'sut-wechat-mini-stats',
            array( $this, 'render_stats_page' )
        );
    }
    
    /**
     * 注册设置
     */
    public function register_settings() {
        // 注册主设置组
        register_setting(
            'sut_wechat_mini_settings_group',
            $this->option_name,
            array( $this, 'sanitize_settings' )
        );
        
        // 获取所有设置选项
        $settings = $this->get_all_settings();
        
        // 为每个设置部分添加设置字段
        foreach ( $settings as $section_id => $section ) {
            // 添加设置部分
            add_settings_section(
                'sut_wechat_mini_section_' . $section_id,
                $section['title'],
                array( $this, 'render_section_callback' ),
                'sut-wechat-mini-settings',
                array( 'section' => $section )
            );
            
            // 添加设置字段
            foreach ( $section['fields'] as $field ) {
                add_settings_field(
                    'sut_wechat_mini_field_' . $field['id'],
                    $field['title'],
                    array( $this, 'render_field_callback' ),
                    'sut-wechat-mini-settings',
                    'sut_wechat_mini_section_' . $section_id,
                    array( 'field' => $field )
                );
            }
        }
    }
    
    /**
     * 添加插件设置链接
     *
     * @param array $links 现有链接
     * @return array 修改后的链接
     */
    public function add_plugin_links( $links ) {
        $settings_link = '<a href="admin.php?page=sut-wechat-mini">' . __( '设置', 'sut-wechat-mini' ) . '</a>';
        array_unshift( $links, $settings_link );
        return $links;
    }
    
    /**
     * 加载管理脚本和样式
     *
     * @param string $hook 当前页面钩子
     */
    public function enqueue_admin_scripts( $hook ) {
        // 仅在插件页面加载脚本和样式
        if ( strpos( $hook, 'sut-wechat-mini' ) === false ) {
            return;
        }
        
        // 加载jQuery
        wp_enqueue_script( 'jquery' );
        
        // 加载WordPress媒体上传
        wp_enqueue_media();
        
        // 加载自定义脚本
        wp_enqueue_script(
            'sut-wechat-mini-admin-js',
            SUT_WECHAT_MINI_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            SUT_WECHAT_MINI_VERSION,
            true
        );
        
        // 加载自定义样式
        wp_enqueue_style(
            'sut-wechat-mini-admin-css',
            SUT_WECHAT_MINI_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            SUT_WECHAT_MINI_VERSION
        );
    }
    
    /**
     * 渲染设置页面
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            
            <form method="post" action="options.php">
                <?php
                // 输出设置字段
                settings_fields( 'sut_wechat_mini_settings_group' );
                do_settings_sections( 'sut-wechat-mini-settings' );
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * 渲染用户管理页面
     */
    public function render_users_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            
            <div class="sut-wechat-mini-users-wrapper">
                <?php $this->render_users_table(); ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * 渲染订单管理页面
     */
    public function render_orders_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            
            <div class="sut-wechat-mini-orders-wrapper">
                <?php $this->render_orders_table(); ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * 渲染数据统计页面
     */
    public function render_stats_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            
            <div class="sut-wechat-mini-stats-wrapper">
                <?php $this->render_stats_dashboard(); ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * 渲染设置部分回调
     *
     * @param array $args 部分参数
     */
    public function render_section_callback( $args ) {
        $section = $args['section'];
        if ( isset( $section['desc'] ) && ! empty( $section['desc'] ) ) {
            echo '<p class="description">' . esc_html( $section['desc'] ) . '</p>';
        }
    }
    
    /**
     * 渲染设置字段回调
     *
     * @param array $args 字段参数
     */
    public function render_field_callback( $args ) {
        $field = $args['field'];
        $options = get_option( $this->option_name, array() );
        $value = isset( $options[$field['id']] ) ? $options[$field['id']] : ( isset( $field['default'] ) ? $field['default'] : '' );
        
        switch ( $field['type'] ) {
            case 'text':
            case 'password':
            case 'number':
            case 'email':
            case 'url':
                $this->render_input_field( $field, $value );
                break;
            case 'textarea':
                $this->render_textarea_field( $field, $value );
                break;
            case 'checkbox':
                $this->render_checkbox_field( $field, $value );
                break;
            case 'select':
                $this->render_select_field( $field, $value );
                break;
            case 'radio':
                $this->render_radio_field( $field, $value );
                break;
            case 'image':
                $this->render_image_field( $field, $value );
                break;
            case 'color':
                $this->render_color_field( $field, $value );
                break;
            case 'editor':
                $this->render_editor_field( $field, $value );
                break;
            case 'custom':
                if ( isset( $field['callback'] ) && is_callable( $field['callback'] ) ) {
                    call_user_func( $field['callback'], $field, $value );
                }
                break;
            default:
                $this->render_input_field( $field, $value );
        }
        
        if ( isset( $field['desc'] ) && ! empty( $field['desc'] ) ) {
            echo '<p class="description">' . esc_html( $field['desc'] ) . '</p>';
        }
    }
    
    /**
     * 渲染输入框字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_input_field( $field, $value ) {
        $atts = array(
            'type' => $field['type'],
            'id' => 'sut_wechat_mini_field_' . $field['id'],
            'name' => $this->option_name . '[' . $field['id'] . ']',
            'value' => esc_attr( $value ),
            'class' => 'regular-text',
        );
        
        if ( isset( $field['placeholder'] ) ) {
            $atts['placeholder'] = $field['placeholder'];
        }
        
        if ( isset( $field['readonly'] ) && $field['readonly'] ) {
            $atts['readonly'] = 'readonly';
        }
        
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $atts['disabled'] = 'disabled';
        }
        
        if ( isset( $field['min'] ) ) {
            $atts['min'] = $field['min'];
        }
        
        if ( isset( $field['max'] ) ) {
            $atts['max'] = $field['max'];
        }
        
        if ( isset( $field['step'] ) ) {
            $atts['step'] = $field['step'];
        }
        
        $html = '<input ';
        foreach ( $atts as $key => $val ) {
            $html .= $key . '="' . $val . '" ';
        }
        $html .= '/>';
        
        echo $html;
    }
    
    /**
     * 渲染文本域字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_textarea_field( $field, $value ) {
        $atts = array(
            'id' => 'sut_wechat_mini_field_' . $field['id'],
            'name' => $this->option_name . '[' . $field['id'] . ']',
            'class' => 'large-text',
            'rows' => isset( $field['rows'] ) ? $field['rows'] : 5,
        );
        
        if ( isset( $field['placeholder'] ) ) {
            $atts['placeholder'] = $field['placeholder'];
        }
        
        if ( isset( $field['readonly'] ) && $field['readonly'] ) {
            $atts['readonly'] = 'readonly';
        }
        
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $atts['disabled'] = 'disabled';
        }
        
        $html = '<textarea ';
        foreach ( $atts as $key => $val ) {
            $html .= $key . '="' . $val . '" ';
        }
        $html .= '>' . esc_textarea( $value ) . '</textarea>';
        
        echo $html;
    }
    
    /**
     * 渲染复选框字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_checkbox_field( $field, $value ) {
        $atts = array(
            'type' => 'checkbox',
            'id' => 'sut_wechat_mini_field_' . $field['id'],
            'name' => $this->option_name . '[' . $field['id'] . ']',
            'value' => 1,
            'checked' => checked( $value, 1, false ),
        );
        
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $atts['disabled'] = 'disabled';
        }
        
        $html = '<input ';
        foreach ( $atts as $key => $val ) {
            if ( $val !== false ) {
                $html .= $key . '="' . $val . '" ';
            }
        }
        $html .= '/>';
        
        echo $html;
    }
    
    /**
     * 渲染下拉选择字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_select_field( $field, $value ) {
        if ( ! isset( $field['options'] ) || ! is_array( $field['options'] ) ) {
            return;
        }
        
        $atts = array(
            'id' => 'sut_wechat_mini_field_' . $field['id'],
            'name' => $this->option_name . '[' . $field['id'] . ']',
            'class' => 'regular-text',
        );
        
        if ( isset( $field['multiple'] ) && $field['multiple'] ) {
            $atts['multiple'] = 'multiple';
            $atts['name'] .= '[]';
        }
        
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $atts['disabled'] = 'disabled';
        }
        
        $html = '<select ';
        foreach ( $atts as $key => $val ) {
            $html .= $key . '="' . $val . '" ';
        }
        $html .= '>';
        
        foreach ( $field['options'] as $option_value => $option_label ) {
            $selected = '';
            if ( is_array( $value ) ) {
                $selected = selected( in_array( $option_value, $value ), true, false );
            } else {
                $selected = selected( $option_value, $value, false );
            }
            
            $html .= '<option value="' . esc_attr( $option_value ) . '" ' . $selected . '>' . esc_html( $option_label ) . '</option>';
        }
        
        $html .= '</select>';
        
        echo $html;
    }
    
    /**
     * 渲染单选按钮字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_radio_field( $field, $value ) {
        if ( ! isset( $field['options'] ) || ! is_array( $field['options'] ) ) {
            return;
        }
        
        $html = '';
        $i = 0;
        
        foreach ( $field['options'] as $option_value => $option_label ) {
            $atts = array(
                'type' => 'radio',
                'id' => 'sut_wechat_mini_field_' . $field['id'] . '_' . $i,
                'name' => $this->option_name . '[' . $field['id'] . ']',
                'value' => $option_value,
                'checked' => checked( $option_value, $value, false ),
            );
            
            if ( isset( $field['disabled'] ) && $field['disabled'] ) {
                $atts['disabled'] = 'disabled';
            }
            
            $html .= '<label><input ';
            foreach ( $atts as $key => $val ) {
                if ( $val !== false ) {
                    $html .= $key . '="' . $val . '" ';
                }
            }
            $html .= '/> ' . esc_html( $option_label ) . '</label><br/>';
            
            $i++;
        }
        
        echo $html;
    }
    
    /**
     * 渲染图片上传字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_image_field( $field, $value ) {
        $image_url = '';
        if ( $value ) {
            $image_url = wp_get_attachment_url( $value );
        }
        
        $html = '<div class="sut-wechat-mini-image-upload">';
        $html .= '<input type="hidden" id="sut_wechat_mini_field_' . $field['id'] . '" name="' . $this->option_name . '[' . $field['id'] . ']" value="' . esc_attr( $value ) . '" />';
        $html .= '<div class="image-preview">';
        if ( $image_url ) {
            $html .= '<img src="' . esc_url( $image_url ) . '" style="max-width: 200px; max-height: 200px;" />';
        }
        $html .= '</div>';
        $html .= '<button type="button" class="button sut-wechat-mini-upload-image">' . __( '上传图片', 'sut-wechat-mini' ) . '</button>';
        $html .= '<button type="button" class="button sut-wechat-mini-remove-image" ' . ( $value ? '' : 'style="display: none;"' ) . '>' . __( '移除图片', 'sut-wechat-mini' ) . '</button>';
        $html .= '</div>';
        
        echo $html;
    }
    
    /**
     * 渲染颜色选择字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_color_field( $field, $value ) {
        // 确保加载颜色选择器
        wp_enqueue_style( 'wp-color-picker' );
        wp_enqueue_script( 'wp-color-picker' );
        
        $atts = array(
            'type' => 'text',
            'id' => 'sut_wechat_mini_field_' . $field['id'],
            'name' => $this->option_name . '[' . $field['id'] . ']',
            'value' => esc_attr( $value ),
            'class' => 'sut-wechat-mini-color-picker',
            'data-default-color' => isset( $field['default'] ) ? $field['default'] : '',
        );
        
        $html = '<input ';
        foreach ( $atts as $key => $val ) {
            $html .= $key . '="' . $val . '" ';
        }
        $html .= '/>';
        
        echo $html;
    }
    
    /**
     * 渲染编辑器字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_editor_field( $field, $value ) {
        $editor_args = array(
            'textarea_name' => $this->option_name . '[' . $field['id'] . ']',
            'textarea_rows' => isset( $field['rows'] ) ? $field['rows'] : 10,
            'media_buttons' => isset( $field['media_buttons'] ) ? $field['media_buttons'] : true,
            'tinymce' => isset( $field['tinymce'] ) ? $field['tinymce'] : true,
            'quicktags' => isset( $field['quicktags'] ) ? $field['quicktags'] : true,
        );
        
        wp_editor( $value, 'sut_wechat_mini_field_' . $field['id'], $editor_args );
    }
    
    /**
     * 渲染用户表格
     */
    private function render_users_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        
        // 获取用户列表
        $users = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY created_at DESC" );
        
        if ( empty( $users ) ) {
            echo '<div class="notice notice-info"><p>' . __( '暂无微信小程序用户', 'sut-wechat-mini' ) . '</p></div>';
            return;
        }
        
        ?>
        <table class="widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col" class="manage-column column-primary"><?php _e( '微信昵称', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '微信头像', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( 'OpenID', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( 'UnionID', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '关联用户', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '创建时间', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '操作', 'sut-wechat-mini' ); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ( $users as $user ) : ?>
                    <tr>
                        <td class="column-primary">
                            <?php echo esc_html( $user->nickname ); ?>
                            <button type="button" class="toggle-row"><span class="screen-reader-text"><?php _e( '显示更多详情', 'sut-wechat-mini' ); ?></span></button>
                        </td>
                        <td>
                            <?php if ( $user->avatar_url ) : ?>
                                <img src="<?php echo esc_url( $user->avatar_url ); ?>" style="width: 40px; height: 40px; border-radius: 50%;" />
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php echo esc_html( $user->openid ); ?>
                        </td>
                        <td>
                            <?php echo esc_html( $user->unionid ? $user->unionid : '-' ); ?>
                        </td>
                        <td>
                            <?php if ( $user->wp_user_id ) : ?>
                                <?php $wp_user = get_user_by( 'id', $user->wp_user_id ); ?>
                                <?php if ( $wp_user ) : ?>
                                    <a href="user-edit.php?user_id=<?php echo $user->wp_user_id; ?>"><?php echo esc_html( $wp_user->user_login ); ?></a>
                                <?php endif; ?>
                            <?php else : ?>
                                -
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php echo esc_html( $user->created_at ); ?>
                        </td>
                        <td>
                            <a href="#" class="sut-wechat-mini-delete-user" data-id="<?php echo $user->id; ?>"><?php _e( '删除', 'sut-wechat-mini' ); ?></a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }
    
    /**
     * 渲染订单表格
     */
    private function render_orders_table() {
        if ( ! class_exists( 'WooCommerce' ) ) {
            echo '<div class="notice notice-error"><p>' . __( 'WooCommerce未激活，无法查看订单', 'sut-wechat-mini' ) . '</p></div>';
            return;
        }
        
        // 获取订单列表
        $args = array(
            'post_type' => 'shop_order',
            'post_status' => array_keys( wc_get_order_statuses() ),
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'DESC',
        );
        
        $orders_query = new WP_Query( $args );
        
        if ( ! $orders_query->have_posts() ) {
            echo '<div class="notice notice-info"><p>' . __( '暂无订单', 'sut-wechat-mini' ) . '</p></div>';
            return;
        }
        
        ?>
        <table class="widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col" class="manage-column column-primary"><?php _e( '订单编号', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '订单总额', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '订单状态', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '客户信息', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '创建时间', 'sut-wechat-mini' ); ?></th>
                    <th scope="col" class="manage-column"><?php _e( '操作', 'sut-wechat-mini' ); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php while ( $orders_query->have_posts() ) : $orders_query->the_post(); ?>
                    <?php $order = wc_get_order( get_the_ID() ); ?>
                    <tr>
                        <td class="column-primary">
                            <a href="post.php?post=<?php echo get_the_ID(); ?>&action=edit"><?php echo esc_html( $order->get_order_number() ); ?></a>
                            <button type="button" class="toggle-row"><span class="screen-reader-text"><?php _e( '显示更多详情', 'sut-wechat-mini' ); ?></span></button>
                        </td>
                        <td>
                            <?php echo esc_html( $order->get_formatted_order_total() ); ?>
                        </td>
                        <td>
                            <mark class="order-status status-<?php echo sanitize_title( $order->get_status() ); ?>"><span><?php echo esc_html( wc_get_order_status_name( $order->get_status() ) ); ?></span></mark>
                        </td>
                        <td>
                            <?php if ( $order->get_billing_first_name() || $order->get_billing_last_name() ) : ?>
                                <?php echo esc_html( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ); ?><br/>
                            <?php endif; ?>
                            <?php if ( $order->get_billing_phone() ) : ?>
                                <?php echo esc_html( $order->get_billing_phone() ); ?><br/>
                            <?php endif; ?>
                            <?php if ( $order->get_billing_email() ) : ?>
                                <?php echo esc_html( $order->get_billing_email() ); ?><br/>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php echo esc_html( $order->get_date_created()->format( 'Y-m-d H:i:s' ) ); ?>
                        </td>
                        <td>
                            <a href="post.php?post=<?php echo get_the_ID(); ?>&action=edit" class="button button-small"><?php _e( '编辑', 'sut-wechat-mini' ); ?></a>
                        </td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
        <?php
        
        wp_reset_postdata();
    }
    
    /**
     * 渲染数据统计仪表盘
     */
    private function render_stats_dashboard() {
        global $wpdb;
        
        // 获取统计数据
        $table_name = $wpdb->prefix . 'sut_wechat_mini_users';
        $total_users = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
        
        $total_orders = 0;
        $total_sales = 0;
        if ( class_exists( 'WooCommerce' ) ) {
            $total_orders = wc_get_orders( array(
                'status' => array_keys( wc_get_order_statuses() ),
                'return' => 'ids',
            ) );
            $total_orders = count( $total_orders );
            
            $total_sales = $wpdb->get_var( "
                SELECT SUM(meta_value)
                FROM $wpdb->postmeta
                WHERE meta_key = '_order_total'
                AND post_id IN (
                    SELECT ID
                    FROM $wpdb->posts
                    WHERE post_type = 'shop_order'
                    AND post_status IN ('wc-processing', 'wc-completed')
                )
            " );
        }
        
        $total_views = get_option( 'sut_wechat_mini_total_views', 0 );
        
        ?>
        <div class="sut-wechat-mini-stats-cards">
            <div class="stat-card">
                <div class="stat-value"><?php echo number_format( $total_users ); ?></div>
                <div class="stat-label"><?php _e( '小程序用户', 'sut-wechat-mini' ); ?></div>
            </div>
            
            <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                <div class="stat-card">
                    <div class="stat-value"><?php echo number_format( $total_orders ); ?></div>
                    <div class="stat-label"><?php _e( '订单总数', 'sut-wechat-mini' ); ?></div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value"><?php echo wc_price( $total_sales ); ?></div>
                    <div class="stat-label"><?php _e( '销售总额', 'sut-wechat-mini' ); ?></div>
                </div>
            <?php endif; ?>
            
            <div class="stat-card">
                <div class="stat-value"><?php echo number_format( $total_views ); ?></div>
                <div class="stat-label"><?php _e( '页面浏览量', 'sut-wechat-mini' ); ?></div>
            </div>
        </div>
        
        <div class="sut-wechat-mini-stats-charts">
            <div class="chart-container">
                <h3><?php _e( '用户增长趋势', 'sut-wechat-mini' ); ?></h3>
                <div id="users-chart" style="height: 300px;"></div>
            </div>
            
            <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                <div class="chart-container">
                    <h3><?php _e( '销售额趋势', 'sut-wechat-mini' ); ?></h3>
                    <div id="sales-chart" style="height: 300px;"></div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * 获取所有设置选项
     *
     * @return array 设置选项
     */
    public function get_all_settings() {
        // 基本设置
        $basic_settings = array(
            'title' => __( '基本设置', 'sut-wechat-mini' ),
            'fields' => array(
                array(
                    'id' => 'app_id',
                    'title' => __( '小程序AppID', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '微信小程序的AppID', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'app_secret',
                    'title' => __( '小程序AppSecret', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '微信小程序的AppSecret', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'token',
                    'title' => __( '消息推送Token', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '用于验证消息推送的Token', 'sut-wechat-mini' ),
                    'default' => '',
                ),
                array(
                    'id' => 'encoding_aes_key',
                    'title' => __( '消息加解密密钥', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( '消息加解密密钥，43位字符', 'sut-wechat-mini' ),
                    'default' => '',
                ),
            ),
        );
        
        // API设置
        $api_settings = array(
            'title' => __( 'API设置', 'sut-wechat-mini' ),
            'fields' => array(
                array(
                    'id' => 'api_prefix',
                    'title' => __( 'API前缀', 'sut-wechat-mini' ),
                    'type' => 'text',
                    'desc' => __( 'API路由前缀，默认为sut-wechat-mini-api', 'sut-wechat-mini' ),
                    'default' => 'sut-wechat-mini-api',
                ),
                array(
                    'id' => 'api_rate_limit',
                    'title' => __( 'API请求限制', 'sut-wechat-mini' ),
                    'type' => 'number',
                    'desc' => __( '每小时允许的最大API请求数，0表示不限制', 'sut-wechat-mini' ),
                    'default' => 1000,
                    'min' => 0,
                ),
                array(
                    'id' => 'api_whitelist',
                    'title' => __( 'IP白名单', 'sut-wechat-mini' ),
                    'type' => 'textarea',
                    'desc' => __( '允许访问API的IP地址，一行一个', 'sut-wechat-mini' ),
                    'default' => '',
                    'rows' => 3,
                ),
            ),
        );
        
        // 内容设置
        $content_settings = array(
            'title' => __( '内容设置', 'sut-wechat-mini' ),
            'fields' => array(
                array(
                    'id' => 'post_types',
                    'title' => __( '启用的文章类型', 'sut-wechat-mini' ),
                    'type' => 'select',
                    'desc' => __( '选择在小程序中显示的文章类型', 'sut-wechat-mini' ),
                    'default' => array( 'post', 'page' ),
                    'multiple' => true,
                    'options' => $this->get_post_types_options(),
                ),
                array(
                    'id' => 'posts_per_page',
                    'title' => __( '每页显示数量', 'sut-wechat-mini' ),
                    'type' => 'number',
                    'desc' => __( '小程序中每页显示的文章数量', 'sut-wechat-mini' ),
                    'default' => 10,
                    'min' => 1,
                    'max' => 100,
                ),
                array(
                    'id' => 'enable_html_parser',
                    'title' => __( '启用HTML解析', 'sut-wechat-mini' ),
                    'type' => 'checkbox',
                    'desc' => __( '是否将文章HTML内容转换为小程序支持的格式', 'sut-wechat-mini' ),
                    'default' => true,
                ),
            ),
        );
        
        // 调用其他模块的设置
        $settings = array(
            'basic' => $basic_settings,
            'api' => $api_settings,
            'content' => $content_settings,
        );
        
        // 允许其他模块添加设置
        $settings = apply_filters( 'sut_wechat_mini_settings', $settings );
        
        return $settings;
    }
    
    /**
     * 获取文章类型选项
     *
     * @return array 文章类型选项
     */
    private function get_post_types_options() {
        $post_types = get_post_types( array( 'public' => true ), 'objects' );
        $options = array();
        
        foreach ( $post_types as $post_type ) {
            $options[$post_type->name] = $post_type->labels->name;
        }
        
        return $options;
    }
    
    /**
     * 验证和清理设置数据
     *
     * @param array $input 输入数据
     * @return array 清理后的数据
     */
    public function sanitize_settings( $input ) {
        $output = array();
        
        // 获取所有设置选项
        $settings = $this->get_all_settings();
        
        // 验证每个设置字段
        foreach ( $settings as $section_id => $section ) {
            foreach ( $section['fields'] as $field ) {
                $field_id = $field['id'];
                
                // 检查字段是否存在于输入中
                if ( isset( $input[$field_id] ) ) {
                    // 根据字段类型进行验证
                    switch ( $field['type'] ) {
                        case 'text':
                        case 'password':
                        case 'email':
                        case 'url':
                            $output[$field_id] = sanitize_text_field( $input[$field_id] );
                            break;
                        case 'textarea':
                            $output[$field_id] = sanitize_textarea_field( $input[$field_id] );
                            break;
                        case 'number':
                            $output[$field_id] = intval( $input[$field_id] );
                            break;
                        case 'checkbox':
                            $output[$field_id] = boolval( $input[$field_id] );
                            break;
                        case 'select':
                        case 'radio':
                            if ( isset( $field['options'] ) && is_array( $field['options'] ) ) {
                                if ( isset( $field['multiple'] ) && $field['multiple'] ) {
                                    $output[$field_id] = array();
                                    if ( is_array( $input[$field_id] ) ) {
                                        foreach ( $input[$field_id] as $value ) {
                                            if ( array_key_exists( $value, $field['options'] ) ) {
                                                $output[$field_id][] = $value;
                                            }
                                        }
                                    }
                                } else {
                                    if ( array_key_exists( $input[$field_id], $field['options'] ) ) {
                                        $output[$field_id] = $input[$field_id];
                                    }
                                }
                            }
                            break;
                        case 'editor':
                            $output[$field_id] = wp_kses_post( $input[$field_id] );
                            break;
                        case 'image':
                            $output[$field_id] = intval( $input[$field_id] );
                            break;
                        default:
                            $output[$field_id] = sanitize_text_field( $input[$field_id] );
                    }
                }
            }
        }
        
        return $output;
    }
}

/**
 * 初始化管理功能
 */
function sut_wechat_mini_admin_init() {
    SUT_WeChat_Mini_Admin::get_instance();
}

add_action( 'admin_init', 'sut_wechat_mini_admin_init' );