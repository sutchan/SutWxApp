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
     * 渲染设置页面
     */
    public function render_settings_page() {
        // 检查用户权限
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( __( '您没有足够的权限访问此页面。', 'sut-wechat-mini' ) );
        }
        
        // 获取当前设置值
        $settings = get_option( 'sut_wechat_mini_settings', array() );
        
        // 输出页面标题和说明
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php _e( '微信小程序设置', 'sut-wechat-mini' ); ?></h1>
            <p class="description"><?php _e( '配置您的微信小程序相关设置。', 'sut-wechat-mini' ); ?></p>
            
            <?php if ( isset( $_GET['settings-updated'] ) ) : ?>
                <div class="notice notice-success is-dismissible">
                    <p><?php _e( '设置已保存。', 'sut-wechat-mini' ); ?></p>
                </div>
            <?php endif; ?>
            
            <div class="sut-wechat-mini-content">
                <form method="post" action="options.php">
                    <?php settings_fields( 'sut_wechat_mini_settings_group' ); ?>
                    <?php $this->render_settings_form( $settings ); ?>
                    <?php submit_button(); ?>
                </form>
            </div>
        </div>
        <?php
    }
    
    /**
     * 渲染用户页面
     */
    public function render_users_page() {
        // 检查用户权限
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( __( '您没有足够的权限访问此页面。', 'sut-wechat-mini' ) );
        }
        
        // 输出页面标题和说明
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php _e( '用户管理', 'sut-wechat-mini' ); ?></h1>
            <p class="description"><?php _e( '管理微信小程序的用户。', 'sut-wechat-mini' ); ?></p>
            
            <div class="sut-wechat-mini-content">
                <?php $this->render_users_table(); ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * 渲染订单页面
     */
    public function render_orders_page() {
        // 检查用户权限
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( __( '您没有足够的权限访问此页面。', 'sut-wechat-mini' ) );
        }
        
        // 输出页面标题和说明
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php _e( '订单管理', 'sut-wechat-mini' ); ?></h1>
            <p class="description"><?php _e( '管理微信小程序的订单。', 'sut-wechat-mini' ); ?></p>
            
            <div class="sut-wechat-mini-content">
                <?php $this->render_orders_table(); ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * 渲染设置表单
     *
     * @param array $settings 当前设置值
     */
    private function render_settings_form( $settings ) {
        $all_settings = $this->get_all_settings();
        
        // 检查是否有高优先级的必填字段
        $has_high_priority_fields = false;
        foreach ( $all_settings as $section ) {
            foreach ( $section['fields'] as $field ) {
                if ( isset( $field['priority'] ) && $field['priority'] === 'high' ) {
                    $has_high_priority_fields = true;
                    break 2;
                }
            }
        }
        
        // 输出设置表单
        foreach ( $all_settings as $section_id => $section ) {
            ?>
            <div class="sut-wechat-mini-section">
                <h2 class="sut-wechat-mini-section-title"><span class="dashicons <?php echo esc_attr( $section['icon'] ); ?>"></span> <?php echo esc_html( $section['title'] ); ?></h2>
                <p class="sut-wechat-mini-section-desc"><?php echo esc_html( $section['desc'] ); ?></p>
                
                <table class="form-table">
                    <?php foreach ( $section['fields'] as $field ) : ?>
                        <tr<?php echo isset( $field['priority'] ) && $field['priority'] === 'high' ? ' class="sut-wechat-mini-field-high-priority"' : ''; ?>>
                            <th scope="row">
                                <label for="<?php echo esc_attr( $field['id'] ); ?>"><?php echo esc_html( $field['title'] ); ?></label>
                                <?php if ( isset( $field['required'] ) && $field['required'] ) : ?>
                                    <span class="description required">*</span>
                                <?php endif; ?>
                            </th>
                            <td>
                                <?php $this->render_field( $field, isset( $settings[$field['id']] ) ? $settings[$field['id']] : ( isset( $field['default'] ) ? $field['default'] : '' ) ); ?>
                                <?php if ( isset( $field['desc'] ) ) : ?>
                                    <p class="description"><?php echo esc_html( $field['desc'] ); ?></p>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </table>
            </div>
            <?php
        }
        
        // 显示必填字段说明
        if ( $has_high_priority_fields ) {
            ?>
            <p class="sut-wechat-mini-required-note">
                <span class="description required">*</span> <?php _e( '表示必填字段', 'sut-wechat-mini' ); ?>
            </p>
            <?php
        }
    }
    
    /**
     * 根据字段类型渲染相应的字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_field( $field, $value ) {
        switch ( $field['type'] ) {
            case 'text':
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
             default:
                 $this->render_input_field( $field, $value );
         }
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
     * 在插件列表页面添加额外的链接
     *
     * @param array $links 现有链接数组
     * @return array 修改后的链接数组
     */
    public function add_plugin_links( $links ) {
        // 添加设置链接
        $settings_link = '<a href="admin.php?page=sut-wechat-mini">' . __( '设置', 'sut-wechat-mini' ) . '</a>';
        array_unshift( $links, $settings_link );
        
        return $links;
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
     * 渲染输入框字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_input_field( $field, $value ) {
        // 初始化属性数组，设置默认值
        $attrs = array(
            'type' => $field['type'],
            'class' => 'regular-text',
        );
        
        // 如果存在自定义属性数组，合并它们
        if ( isset( $field['attrs'] ) && is_array( $field['attrs'] ) ) {
            $attrs = array_merge( $attrs, $field['attrs'] );
        }
        
        // 处理特定属性
        if ( isset( $field['placeholder'] ) ) {
            $attrs['placeholder'] = $field['placeholder'];
        }
        
        if ( isset( $field['readonly'] ) && $field['readonly'] ) {
            $attrs['readonly'] = 'readonly';
        }
        
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $attrs['disabled'] = 'disabled';
        }
        
        if ( isset( $field['min'] ) ) {
            $attrs['min'] = $field['min'];
        }
        
        if ( isset( $field['max'] ) ) {
            $attrs['max'] = $field['max'];
        }
        
        if ( isset( $field['step'] ) ) {
            $attrs['step'] = $field['step'];
        }
        
        // 构建属性字符串
        $attr_str = '';
        foreach ( $attrs as $attr_name => $attr_value ) {
            $attr_str .= sprintf( ' %s="%s"', esc_attr( $attr_name ), esc_attr( $attr_value ) );
        }
        
        // 输出输入框
        printf(
            '<input id="sut_wechat_mini_field_%s" name="%s[%s]" value="%s"%s />',
            esc_attr( $field['id'] ),
            esc_attr( $this->option_name ),
            esc_attr( $field['id'] ),
            esc_attr( $value ),
            $attr_str
        );
    }
    
    /**
     * 渲染文本域字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_textarea_field( $field, $value ) {
        // 初始化属性数组，设置默认值
        $attrs = array(
            'class' => 'large-text',
        );
        
        // 如果存在自定义属性数组，合并它们
        if ( isset( $field['attrs'] ) && is_array( $field['attrs'] ) ) {
            $attrs = array_merge( $attrs, $field['attrs'] );
        }
        
        // 处理特定属性
        if ( isset( $field['placeholder'] ) ) {
            $attrs['placeholder'] = $field['placeholder'];
        }
        
        if ( isset( $field['readonly'] ) && $field['readonly'] ) {
            $attrs['readonly'] = 'readonly';
        }
        
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $attrs['disabled'] = 'disabled';
        }
        
        // 处理行数和列数
        $rows = isset( $attrs['rows'] ) ? $attrs['rows'] : ( isset( $field['rows'] ) ? $field['rows'] : 5 );
        $cols = isset( $attrs['cols'] ) ? $attrs['cols'] : 50;
        unset( $attrs['rows'], $attrs['cols'] );
        
        // 构建属性字符串
        $attr_str = '';
        foreach ( $attrs as $attr_name => $attr_value ) {
            $attr_str .= sprintf( ' %s="%s"', esc_attr( $attr_name ), esc_attr( $attr_value ) );
        }
        
        // 输出文本域
        printf(
            '<textarea id="sut_wechat_mini_field_%s" name="%s[%s]" rows="%s" cols="%s"%s>%s</textarea>',
            esc_attr( $field['id'] ),
            esc_attr( $this->option_name ),
            esc_attr( $field['id'] ),
            esc_attr( $rows ),
            esc_attr( $cols ),
            $attr_str,
            esc_textarea( $value )
        );
    }
    
    /**
     * 渲染复选框字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_checkbox_field( $field, $value ) {
        // 获取基础属性
        $id = $field['id'];
        $checked = checked( $value, 1, false );
        
        // 构建属性数组
        $attrs = array();
        
        // 检查是否有自定义属性数组
        if ( isset( $field['attrs'] ) && is_array( $field['attrs'] ) ) {
            $attrs = $field['attrs'];
        }
        
        // 处理禁用属性
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $attrs['disabled'] = 'disabled';
        }
        
        // 构建属性字符串
        $attr_str = '';
        foreach ( $attrs as $attr_name => $attr_value ) {
            $attr_str .= sprintf( ' %s="%s"', esc_attr( $attr_name ), esc_attr( $attr_value ) );
        }
        
        // 输出复选框
        printf(
            '<input type="checkbox" id="sut_wechat_mini_field_%s" name="%s[%s]" value="1" %s%s />',
            esc_attr( $id ),
            esc_attr( $this->option_name ),
            esc_attr( $id ),
            $checked,
            $attr_str
        );
    }
    
    /**
     * 渲染下拉选择字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_select_field( $field, $value ) {
        // 验证选项数组是否存在
        if ( ! isset( $field['options'] ) || ! is_array( $field['options'] ) ) {
            return;
        }
        
        // 获取基础属性
        $id = $field['id'];
        $options = $field['options'];
        
        // 初始化属性数组，设置默认值
        $attrs = array(
            'class' => 'regular-text',
        );
        
        // 如果存在自定义属性数组，合并它们
        if ( isset( $field['attrs'] ) && is_array( $field['attrs'] ) ) {
            $attrs = array_merge( $attrs, $field['attrs'] );
        }
        
        // 处理多选属性
        $multiple = false;
        if ( ( isset( $attrs['multiple'] ) && $attrs['multiple'] ) || 
             ( isset( $field['multiple'] ) && $field['multiple'] ) ) {
            $multiple = true;
            $attrs['multiple'] = 'multiple';
        }
        
        // 处理禁用属性
        if ( isset( $field['disabled'] ) && $field['disabled'] ) {
            $attrs['disabled'] = 'disabled';
        }
        
        // 构建属性字符串
        $attr_str = '';
        foreach ( $attrs as $attr_name => $attr_value ) {
            $attr_str .= sprintf( ' %s="%s"', esc_attr( $attr_name ), esc_attr( $attr_value ) );
        }
        
        // 输出选择框开始标签
        printf(
            '<select id="sut_wechat_mini_field_%s" name="%s[%s]%s" %s>',
            esc_attr( $id ),
            esc_attr( $this->option_name ),
            esc_attr( $id ),
            $multiple ? '[]' : '',
            $attr_str
        );
        
        // 输出选项
        foreach ( $options as $option_value => $option_label ) {
            if ( is_array( $value ) ) {
                $selected = selected( in_array( $option_value, $value ), true, false );
            } else {
                $selected = selected( $value, $option_value, false );
            }
            
            printf(
                '<option value="%s" %s>%s</option>',
                esc_attr( $option_value ),
                $selected,
                esc_html( $option_label )
            );
        }
        
        echo '</select>';
    }
    
    /**
     * 渲染单选框字段
     *
     * @param array $field 字段配置
     * @param mixed $value 字段值
     */
    private function render_radio_field( $field, $value ) {
        // 验证选项数组是否存在
        if ( ! isset( $field['options'] ) || ! is_array( $field['options'] ) ) {
            return;
        }
        
        $id = $field['id'];
        $options = $field['options'];
        $i = 0;
        
        foreach ( $options as $option_value => $option_label ) {
            // 生成唯一的选项ID
            $option_id = sprintf( '%s_%s', $id, $i );
            $checked = checked( $value, $option_value, false );
            
            // 构建属性数组
            $atts = array(
                'type' => 'radio',
                'id' => 'sut_wechat_mini_field_' . $option_id,
                'name' => $this->option_name . '[' . $id . ']',
                'value' => $option_value,
                'checked' => $checked,
            );
            
            // 处理禁用属性
            if ( isset( $field['disabled'] ) && $field['disabled'] ) {
                $atts['disabled'] = 'disabled';
            }
            
            // 使用printf格式化输出单选框
            printf(
                '<label><input type="radio" id="%s" name="%s" value="%s" %s%s /> %s</label><br/>',
                esc_attr( $atts['id'] ),
                esc_attr( $atts['name'] ),
                esc_attr( $atts['value'] ),
                $atts['checked'],
                isset( $atts['disabled'] ) ? ' disabled="disabled"' : '',
                esc_html( $option_label )
            );
            
            $i++;
        }
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
        $users = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY create_time DESC" );
        
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
                            <?php echo esc_html( $user->create_time ); ?>
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
     * 渲染数据统计页面
     */
    public function render_stats_page() {
        // 检查用户权限
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( __( '您没有足够的权限访问此页面。', 'sut-wechat-mini' ) );
        }
        
        // 输出页面标题和说明
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php _e( '数据统计', 'sut-wechat-mini' ); ?></h1>
            <p class="description"><?php _e( '查看您的微信小程序使用统计数据。', 'sut-wechat-mini' ); ?></p>
            
            <div class="sut-wechat-mini-content">
                <?php $this->render_stats_dashboard(); ?>
            </div>
        </div>
        <?php
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
     * 获取所有设置结构
     *
     * @return array 设置结构数组
     */
    private function get_all_settings() {
        return array(
            'basic' => array(
                'title' => '基础设置',
                'desc'  => '微信小程序的基本配置信息',
                'icon'  => 'dashicons-admin-generic',
                'fields' => array(
                    array(
                        'id'      => 'appid',
                        'title'   => '小程序AppID',
                        'type'    => 'text',
                        'desc'    => '微信小程序的AppID，用于身份验证',
                        'default' => '',
                        'attrs'   => array(
                            'placeholder' => '请输入小程序AppID',
                            'class'       => 'regular-text sut-wechat-mini-input-primary'
                        ),
                        'required' => true,
                        'priority' => 'high'
                    ),
                    array(
                        'id'      => 'appsecret',
                        'title'   => '小程序AppSecret',
                        'type'    => 'text',
                        'desc'    => '微信小程序的AppSecret，用于API调用',
                        'default' => '',
                        'attrs'   => array(
                            'placeholder' => '请输入小程序AppSecret',
                            'class'       => 'regular-text'
                        ),
                        'required' => true,
                        'priority' => 'high'
                    ),
                    array(
                        'id'      => 'status',
                        'title'   => '启用状态',
                        'type'    => 'checkbox',
                        'desc'    => '是否启用小程序功能',
                        'default' => 1,
                        'priority' => 'high'
                    ),
                    array(
                        'id'      => 'qrcode',
                        'title'   => '小程序二维码',
                        'type'    => 'image',
                        'desc'    => '小程序二维码图片，用于在前台显示',
                        'default' => '',
                        'attrs'   => array(
                            'button_text' => '上传二维码'
                        )
                    )
                )
            ),
            'payment' => array(
                'title' => '支付设置',
                'desc'  => '微信支付相关配置',
                'icon'  => 'dashicons-cart',
                'fields' => array(
                    array(
                        'id'      => 'mch_id',
                        'title'   => '微信支付商户号',
                        'type'    => 'text',
                        'desc'    => '微信支付商户号，用于微信支付功能',
                        'default' => '',
                        'attrs'   => array(
                            'placeholder' => '请输入微信支付商户号',
                            'class'       => 'regular-text'
                        )
                    ),
                    array(
                        'id'      => 'api_key',
                        'title'   => '微信支付API密钥',
                        'type'    => 'text',
                        'desc'    => '微信支付API密钥，用于签名验证',
                        'default' => '',
                        'attrs'   => array(
                            'placeholder' => '请输入微信支付API密钥',
                            'class'       => 'regular-text'
                        )
                    ),
                    array(
                        'id'      => 'payment_status',
                        'title'   => '启用支付功能',
                        'type'    => 'checkbox',
                        'desc'    => '是否启用微信支付功能',
                        'default' => 1
                    )
                )
            ),
            'message' => array(
                'title' => '消息通知',
                'desc'  => '微信小程序消息通知配置',
                'icon'  => 'dashicons-email',
                'fields' => array(
                    array(
                        'id'      => 'template_id',
                        'title'   => '消息通知模板ID',
                        'type'    => 'text',
                        'desc'    => '用于订单通知等消息的模板ID',
                        'default' => '',
                        'attrs'   => array(
                            'placeholder' => '请输入模板ID',
                            'class'       => 'regular-text'
                        )
                    ),
                    array(
                        'id'      => 'message_status',
                        'title'   => '启用消息通知',
                        'type'    => 'checkbox',
                        'desc'    => '是否启用消息通知功能',
                        'default' => 1
                    )
                )
            ),
            'display' => array(
                'title' => '显示设置',
                'desc'  => '小程序内容显示相关配置',
                'icon'  => 'dashicons-format-image',
                'fields' => array(
                    array(
                        'id'      => 'display_items_per_page',
                        'title'   => '每页显示数量',
                        'type'    => 'number',
                        'desc'    => '小程序中每页显示的内容数量',
                        'default' => 10,
                        'attrs'   => array(
                            'min'   => 1,
                            'max'   => 100,
                            'step'  => 1,
                            'class' => 'small-text'
                        )
                    ),
                    array(
                        'id'      => 'display_cover_image',
                        'title'   => '显示封面图',
                        'type'    => 'checkbox',
                        'desc'    => '是否在列表中显示内容封面图',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'theme_color',
                        'title'   => '主题颜色',
                        'type'    => 'color',
                        'desc'    => '小程序的主题颜色',
                        'default' => '#1DA57A'
                    ),
                    array(
                        'id'      => 'custom_css',
                        'title'   => '自定义CSS',
                        'type'    => 'textarea',
                        'desc'    => '添加自定义CSS样式来自定义小程序外观',
                        'default' => '',
                        'attrs'   => array(
                            'rows'  => 5,
                            'cols'  => 50,
                            'placeholder' => '例如：body { color: #333; }',
                            'class' => 'code'
                        )
                    )
                )
            ),
            'user_management' => array(
                'title' => '用户管理',
                'desc'  => '微信小程序用户管理相关配置',
                'icon'  => 'dashicons-users',
                'fields' => array(
                    array(
                        'id'      => 'user_sync_status',
                        'title'   => '启用用户同步',
                        'type'    => 'checkbox',
                        'desc'    => '是否启用微信用户与WordPress用户的同步功能',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'auto_register_users',
                        'title'   => '自动注册用户',
                        'type'    => 'checkbox',
                        'desc'    => '新的微信用户首次登录时是否自动注册为WordPress用户',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'default_user_role',
                        'title'   => '默认用户角色',
                        'type'    => 'select',
                        'desc'    => '自动注册的用户默认角色',
                        'default' => 'subscriber',
                        'options' => $this->get_user_roles_options(),
                        'attrs'   => array(
                            'class' => 'regular-text'
                        )
                    ),
                    array(
                        'id'      => 'display_user_avatar',
                        'title'   => '显示用户头像',
                        'type'    => 'checkbox',
                        'desc'    => '是否在用户列表中显示微信头像',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'user_data_retention',
                        'title'   => '用户数据保留期限',
                        'type'    => 'number',
                        'desc'    => '未活跃用户数据保留的天数（0表示永久保留）',
                        'default' => 0,
                        'attrs'   => array(
                            'min'   => 0,
                            'step'  => 1,
                            'class' => 'small-text'
                        )
                    )
                )
            ),
            'order_management' => array(
                'title' => '订单管理',
                'desc'  => '微信小程序订单管理相关配置',
                'icon'  => 'dashicons-list-alt',
                'fields' => array(
                    array(
                        'id'      => 'order_sync_status',
                        'title'   => '启用订单同步',
                        'type'    => 'checkbox',
                        'desc'    => '是否启用小程序订单与WordPress/WooCommerce订单的同步',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'auto_update_order_status',
                        'title'   => '自动更新订单状态',
                        'type'    => 'checkbox',
                        'desc'    => '支付成功后是否自动更新订单状态为已完成',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'order_notification_admin',
                        'title'   => '管理员订单通知',
                        'type'    => 'checkbox',
                        'desc'    => '新订单创建时是否通知管理员',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'order_notification_user',
                        'title'   => '用户订单通知',
                        'type'    => 'checkbox',
                        'desc'    => '订单状态更新时是否通知用户',
                        'default' => 1
                    ),
                    array(
                        'id'      => 'order_cancellation_period',
                        'title'   => '订单取消期限',
                        'type'    => 'number',
                        'desc'    => '未支付订单自动取消的小时数（0表示不自动取消）',
                        'default' => 24,
                        'attrs'   => array(
                            'min'   => 0,
                            'step'  => 1,
                            'class' => 'small-text'
                        )
                    ),
                    array(
                        'id'      => 'order_export_format',
                        'title'   => '订单导出格式',
                        'type'    => 'select',
                        'desc'    => '订单数据导出的默认格式',
                        'default' => 'csv',
                        'options' => array(
                            'csv' => 'CSV格式',
                            'excel' => 'Excel格式',
                            'pdf' => 'PDF格式'
                        ),
                        'attrs'   => array(
                            'class' => 'regular-text'
                        )
                    )
                )
            )
        );
    }
    
    /**
     * 获取用户角色选项
     *
     * @return array 用户角色选项
     */
    private function get_user_roles_options() {
        global $wp_roles;
        
        if ( ! isset( $wp_roles ) ) {
            $wp_roles = new WP_Roles();
        }
        
        $roles = $wp_roles->get_names();
        
        return $roles;
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
    
    /**
     * 注册设置选项
     */
    public function register_settings() {
        // 注册设置组和字段
        register_setting(
            'sut_wechat_mini_settings_group',
            'sut_wechat_mini_settings',
            array(
                'type' => 'array',
                'sanitize_callback' => array( $this, 'sanitize_settings' ),
                'default' => array()
            )
        );
    }
    
    /**
     * 加载管理员脚本和样式
     */
    public function enqueue_admin_scripts() {
        // 只在插件页面加载脚本
        $screen = get_current_screen();
        if ( $screen && $screen->id === 'toplevel_page_sut-wechat-mini' ) {
            // 加载插件样式
            wp_enqueue_style(
                'sut-wechat-mini-admin',
                SUT_WECHAT_MINI_PLUGIN_URL . 'includes/admin/assets/css/admin.css',
                array(),
                SUT_WECHAT_MINI_VERSION
            );
            
            // 加载插件脚本
            wp_enqueue_script(
                'sut-wechat-mini-admin',
                SUT_WECHAT_MINI_PLUGIN_URL . 'includes/admin/assets/js/admin.js',
                array( 'jquery' ),
                SUT_WECHAT_MINI_VERSION,
                true
            );
            
            // 传递必要的数据到JavaScript
            wp_localize_script(
                'sut-wechat-mini-admin',
                'sutWechatMiniAdmin',
                array(
                    'ajax_url' => admin_url( 'admin-ajax.php' ),
                    'nonce' => wp_create_nonce( 'sut-wechat-mini-nonce' ),
                    'i18n' => array(
                        'confirm_delete' => __( '确定要删除吗？', 'sut-wechat-mini' ),
                        'delete_success' => __( '删除成功', 'sut-wechat-mini' ),
                        'delete_failed' => __( '删除失败', 'sut-wechat-mini' )
                    )
                )
            );
        }
    }
}

/**
 * 初始化管理功能
 */
function sut_wechat_mini_admin_init() {
    SUT_WeChat_Mini_Admin::get_instance();
}

add_action( 'admin_init', 'sut_wechat_mini_admin_init' );