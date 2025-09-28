<?php
/**
 * SUT微信小程序插件设置页面模板
 *
 * 用于显示插件的配置选项
 *
 * @package SUT_WeChat_Mini
 */

// 防止直接访问
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// 获取插件设置
$options = get_option( 'sut_wechat_mini_settings', array() );

// 获取当前页面的标签
$tab = isset( $_GET['tab'] ) ? sanitize_text_field( $_GET['tab'] ) : 'basic';

// 检查用户权限
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( esc_html__( '您没有足够的权限访问此页面。', 'sut-wechat-mini' ) );
}

// 保存设置
if ( isset( $_POST['save_settings'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sut_wechat_mini_nonce'] ) ), 'sut_wechat_mini_save_settings' ) ) {
    // 保存基础设置
    $new_options = array();
    
    // 基本设置
    if ( $tab === 'basic' ) {
        $new_options['app_id'] = isset( $_POST['app_id'] ) ? sanitize_text_field( wp_unslash( $_POST['app_id'] ) ) : '';
        $new_options['app_secret'] = isset( $_POST['app_secret'] ) ? sanitize_text_field( wp_unslash( $_POST['app_secret'] ) ) : '';
        $new_options['mch_id'] = isset( $_POST['mch_id'] ) ? sanitize_text_field( wp_unslash( $_POST['mch_id'] ) ) : '';
        $new_options['api_key'] = isset( $_POST['api_key'] ) ? sanitize_text_field( wp_unslash( $_POST['api_key'] ) ) : '';
        $new_options['token'] = isset( $_POST['token'] ) ? sanitize_text_field( wp_unslash( $_POST['token'] ) ) : '';
        $new_options['encoding_aes_key'] = isset( $_POST['encoding_aes_key'] ) ? sanitize_text_field( wp_unslash( $_POST['encoding_aes_key'] ) ) : '';
        $new_options['debug_mode'] = isset( $_POST['debug_mode'] ) ? 1 : 0;
        $new_options['api_timeout'] = isset( $_POST['api_timeout'] ) ? intval( $_POST['api_timeout'] ) : 30;
        $new_options['user_sync_enabled'] = isset( $_POST['user_sync_enabled'] ) ? 1 : 0;
        $new_options['content_sync_enabled'] = isset( $_POST['content_sync_enabled'] ) ? 1 : 0;
        $new_options['thumbnail_size'] = isset( $_POST['thumbnail_size'] ) ? sanitize_text_field( wp_unslash( $_POST['thumbnail_size'] ) ) : 'medium';
    }
    
    // 支付设置
    elseif ( $tab === 'payment' ) {
        $new_options['payment_enabled'] = isset( $_POST['payment_enabled'] ) ? 1 : 0;
        $new_options['refund_enabled'] = isset( $_POST['refund_enabled'] ) ? 1 : 0;
        $new_options['order_expire_time'] = isset( $_POST['order_expire_time'] ) ? intval( $_POST['order_expire_time'] ) : 15;
        $new_options['currency_symbol'] = isset( $_POST['currency_symbol'] ) ? sanitize_text_field( wp_unslash( $_POST['currency_symbol'] ) ) : '¥';
        $new_options['price_format'] = isset( $_POST['price_format'] ) ? sanitize_text_field( wp_unslash( $_POST['price_format'] ) ) : '%1$s%2$s';
        $new_options['notify_url'] = isset( $_POST['notify_url'] ) ? esc_url_raw( wp_unslash( $_POST['notify_url'] ) ) : '';
    }
    
    // 消息设置
    elseif ( $tab === 'messages' ) {
        $new_options['messages_enabled'] = isset( $_POST['messages_enabled'] ) ? 1 : 0;
        $new_options['template_messages_enabled'] = isset( $_POST['template_messages_enabled'] ) ? 1 : 0;
        $new_options['subscription_messages_enabled'] = isset( $_POST['subscription_messages_enabled'] ) ? 1 : 0;
        $new_options['customer_service_enabled'] = isset( $_POST['customer_service_enabled'] ) ? 1 : 0;
        $new_options['order_template_id'] = isset( $_POST['order_template_id'] ) ? sanitize_text_field( wp_unslash( $_POST['order_template_id'] ) ) : '';
        $new_options['refund_template_id'] = isset( $_POST['refund_template_id'] ) ? sanitize_text_field( wp_unslash( $_POST['refund_template_id'] ) ) : '';
        $new_options['comment_template_id'] = isset( $_POST['comment_template_id'] ) ? sanitize_text_field( wp_unslash( $_POST['comment_template_id'] ) ) : '';
    }
    
    // 积分设置
    elseif ( $tab === 'points' ) {
        $new_options['points_enabled'] = isset( $_POST['points_enabled'] ) ? 1 : 0;
        $new_options['points_name'] = isset( $_POST['points_name'] ) ? sanitize_text_field( wp_unslash( $_POST['points_name'] ) ) : '积分';
        $new_options['points_rate'] = isset( $_POST['points_rate'] ) ? floatval( $_POST['points_rate'] ) : 1.0;
        $new_options['signin_points'] = isset( $_POST['signin_points'] ) ? intval( $_POST['signin_points'] ) : 10;
        $new_options['comment_points'] = isset( $_POST['comment_points'] ) ? intval( $_POST['comment_points'] ) : 5;
        $new_options['share_points'] = isset( $_POST['share_points'] ) ? intval( $_POST['share_points'] ) : 5;
        $new_options['daily_points_limit'] = isset( $_POST['daily_points_limit'] ) ? intval( $_POST['daily_points_limit'] ) : 100;
    }
    
    // 缓存设置
    elseif ( $tab === 'cache' ) {
        $new_options['cache_enabled'] = isset( $_POST['cache_enabled'] ) ? 1 : 0;
        $new_options['cache_expiration'] = isset( $_POST['cache_expiration'] ) ? intval( $_POST['cache_expiration'] ) : 3600;
        $new_options['cache_type'] = isset( $_POST['cache_type'] ) ? sanitize_text_field( wp_unslash( $_POST['cache_type'] ) ) : 'transient';
        $new_options['content_cache_enabled'] = isset( $_POST['content_cache_enabled'] ) ? 1 : 0;
        $new_options['user_cache_enabled'] = isset( $_POST['user_cache_enabled'] ) ? 1 : 0;
        $new_options['api_cache_enabled'] = isset( $_POST['api_cache_enabled'] ) ? 1 : 0;
    }
    
    // 合并新的选项到现有选项
    $options = array_merge( $options, $new_options );
    
    // 保存选项
    update_option( 'sut_wechat_mini_settings', $options );
    
    // 显示成功消息
    add_settings_error( 'sut_wechat_mini_messages', 'sut_wechat_mini_settings_saved', esc_html__( '设置已成功保存。', 'sut-wechat-mini' ), 'updated' );
}

// 显示错误和成功消息
settings_errors( 'sut_wechat_mini_messages' );

// 渲染页面头部
?>
<div class="wrap">
    <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
    
    <div class="sut-wechat-mini-settings-container">
        <!-- 导航标签 -->
        <nav class="sut-wechat-mini-settings-tabs">
            <a href="?page=sut-wechat-mini-settings&tab=basic" class="tab<?php echo $tab === 'basic' ? ' active' : ''; ?>">
                <?php esc_html_e( '基础设置', 'sut-wechat-mini' ); ?>
            </a>
            <a href="?page=sut-wechat-mini-settings&tab=payment" class="tab<?php echo $tab === 'payment' ? ' active' : ''; ?>">
                <?php esc_html_e( '支付设置', 'sut-wechat-mini' ); ?>
            </a>
            <a href="?page=sut-wechat-mini-settings&tab=messages" class="tab<?php echo $tab === 'messages' ? ' active' : ''; ?>">
                <?php esc_html_e( '消息设置', 'sut-wechat-mini' ); ?>
            </a>
            <a href="?page=sut-wechat-mini-settings&tab=points" class="tab<?php echo $tab === 'points' ? ' active' : ''; ?>">
                <?php esc_html_e( '积分设置', 'sut-wechat-mini' ); ?>
            </a>
            <a href="?page=sut-wechat-mini-settings&tab=cache" class="tab<?php echo $tab === 'cache' ? ' active' : ''; ?>">
                <?php esc_html_e( '缓存设置', 'sut-wechat-mini' ); ?>
            </a>
        </nav>
        
        <!-- 设置表单 -->
        <form method="post" class="sut-wechat-mini-settings-form">
            <?php wp_nonce_field( 'sut_wechat_mini_save_settings', 'sut_wechat_mini_nonce' ); ?>
            
            <!-- 基础设置 -->
            <?php if ( $tab === 'basic' ) : ?>
                <div class="settings-section">
                    <h2><?php esc_html_e( '微信小程序基础配置', 'sut-wechat-mini' ); ?></h2>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">
                                <label for="app_id"><?php esc_html_e( '小程序AppID', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="app_id" name="app_id" value="<?php echo isset( $options['app_id'] ) ? esc_attr( $options['app_id'] ) : ''; ?>" class="regular-text" required>
                                <p class="description"><?php esc_html_e( '您的微信小程序的AppID', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="app_secret"><?php esc_html_e( '小程序AppSecret', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="app_secret" name="app_secret" value="<?php echo isset( $options['app_secret'] ) ? esc_attr( $options['app_secret'] ) : ''; ?>" class="regular-text" required>
                                <p class="description"><?php esc_html_e( '您的微信小程序的AppSecret', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="token"><?php esc_html_e( 'Token', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="token" name="token" value="<?php echo isset( $options['token'] ) ? esc_attr( $options['token'] ) : ''; ?>" class="regular-text">
                                <p class="description"><?php esc_html_e( '用于消息验证的Token，可自定义', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="settings-section">
                    <h2><?php esc_html_e( '功能设置', 'sut-wechat-mini' ); ?></h2>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '调试模式', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="debug_mode"<?php echo isset( $options['debug_mode'] ) && $options['debug_mode'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '启用调试模式', 'sut-wechat-mini' ); ?>
                                </label>
                                <p class="description"><?php esc_html_e( '调试模式下将记录更多的日志信息', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '用户同步', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="user_sync_enabled"<?php echo isset( $options['user_sync_enabled'] ) && $options['user_sync_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '启用用户数据同步', 'sut-wechat-mini' ); ?>
                                </label>
                                <p class="description"><?php esc_html_e( '启用后将同步微信用户数据到WordPress', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '内容同步', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="content_sync_enabled"<?php echo isset( $options['content_sync_enabled'] ) && $options['content_sync_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '启用内容数据同步', 'sut-wechat-mini' ); ?>
                                </label>
                                <p class="description"><?php esc_html_e( '启用后将同步WordPress内容到微信小程序', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endif; ?>
            
            <!-- 支付设置 -->
            <?php if ( $tab === 'payment' ) : ?>
                <div class="settings-section">
                    <h2><?php esc_html_e( '微信支付配置', 'sut-wechat-mini' ); ?></h2>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '启用支付功能', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="payment_enabled"<?php echo isset( $options['payment_enabled'] ) && $options['payment_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '开启微信支付功能', 'sut-wechat-mini' ); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="mch_id"><?php esc_html_e( '商户号', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="mch_id" name="mch_id" value="<?php echo isset( $options['mch_id'] ) ? esc_attr( $options['mch_id'] ) : ''; ?>" class="regular-text">
                                <p class="description"><?php esc_html_e( '微信支付商户号', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="api_key"><?php esc_html_e( 'API密钥', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="api_key" name="api_key" value="<?php echo isset( $options['api_key'] ) ? esc_attr( $options['api_key'] ) : ''; ?>" class="regular-text">
                                <p class="description"><?php esc_html_e( '微信支付API密钥', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="order_expire_time"><?php esc_html_e( '订单过期时间', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="number" id="order_expire_time" name="order_expire_time" value="<?php echo isset( $options['order_expire_time'] ) ? esc_attr( $options['order_expire_time'] ) : '15'; ?>" class="small-text">
                                <span class="description"><?php esc_html_e( '分钟', 'sut-wechat-mini' ); ?></span>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endif; ?>
            
            <!-- 消息设置 -->
            <?php if ( $tab === 'messages' ) : ?>
                <div class="settings-section">
                    <h2><?php esc_html_e( '消息推送配置', 'sut-wechat-mini' ); ?></h2>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '启用消息功能', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="messages_enabled"<?php echo isset( $options['messages_enabled'] ) && $options['messages_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '开启消息推送功能', 'sut-wechat-mini' ); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '模板消息', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="template_messages_enabled"<?php echo isset( $options['template_messages_enabled'] ) && $options['template_messages_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '启用模板消息', 'sut-wechat-mini' ); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="order_template_id"><?php esc_html_e( '订单模板ID', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="order_template_id" name="order_template_id" value="<?php echo isset( $options['order_template_id'] ) ? esc_attr( $options['order_template_id'] ) : ''; ?>" class="regular-text">
                                <p class="description"><?php esc_html_e( '订单状态变更的模板消息ID', 'sut-wechat-mini' ); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endif; ?>
            
            <!-- 积分设置 -->
            <?php if ( $tab === 'points' ) : ?>
                <div class="settings-section">
                    <h2><?php esc_html_e( '积分系统配置', 'sut-wechat-mini' ); ?></h2>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '启用积分系统', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="points_enabled"<?php echo isset( $options['points_enabled'] ) && $options['points_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '开启积分系统', 'sut-wechat-mini' ); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="points_name"><?php esc_html_e( '积分名称', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="text" id="points_name" name="points_name" value="<?php echo isset( $options['points_name'] ) ? esc_attr( $options['points_name'] ) : '积分'; ?>" class="regular-text">
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="signin_points"><?php esc_html_e( '签到积分', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="number" id="signin_points" name="signin_points" value="<?php echo isset( $options['signin_points'] ) ? esc_attr( $options['signin_points'] ) : '10'; ?>" class="small-text">
                                <span class="description"><?php esc_html_e( '每日签到获得的积分', 'sut-wechat-mini' ); ?></span>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endif; ?>
            
            <!-- 缓存设置 -->
            <?php if ( $tab === 'cache' ) : ?>
                <div class="settings-section">
                    <h2><?php esc_html_e( '缓存配置', 'sut-wechat-mini' ); ?></h2>
                    
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">
                                <?php esc_html_e( '启用缓存', 'sut-wechat-mini' ); ?>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="cache_enabled"<?php echo isset( $options['cache_enabled'] ) && $options['cache_enabled'] ? ' checked' : ''; ?>>
                                    <?php esc_html_e( '开启缓存功能', 'sut-wechat-mini' ); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="cache_expiration"><?php esc_html_e( '缓存过期时间', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <input type="number" id="cache_expiration" name="cache_expiration" value="<?php echo isset( $options['cache_expiration'] ) ? esc_attr( $options['cache_expiration'] ) : '3600'; ?>" class="small-text">
                                <span class="description"><?php esc_html_e( '秒', 'sut-wechat-mini' ); ?></span>
                            </td>
                        </tr>
                        
                        <tr valign="top">
                            <th scope="row">
                                <label for="cache_type"><?php esc_html_e( '缓存类型', 'sut-wechat-mini' ); ?></label>
                            </th>
                            <td>
                                <select id="cache_type" name="cache_type">
                                    <option value="transient"<?php echo isset( $options['cache_type'] ) && $options['cache_type'] === 'transient' ? ' selected' : ''; ?>>
                                        <?php esc_html_e( 'Transient缓存', 'sut-wechat-mini' ); ?>
                                    </option>
                                    <option value="file"<?php echo isset( $options['cache_type'] ) && $options['cache_type'] === 'file' ? ' selected' : ''; ?>>
                                        <?php esc_html_e( '文件缓存', 'sut-wechat-mini' ); ?>
                                    </option>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endif; ?>
            
            <!-- 保存按钮 -->
            <div class="submit">
                <input type="submit" name="save_settings" class="button-primary" value="<?php esc_attr_e( '保存设置', 'sut-wechat-mini' ); ?>">
            </div>
        </form>
        
        <!-- 插件信息 -->
        <div class="sut-wechat-mini-plugin-info">
            <h3><?php esc_html_e( '插件信息', 'sut-wechat-mini' ); ?></h3>
            <p><?php esc_html_e( '版本:', 'sut-wechat-mini' ); ?> <?php echo esc_html( SUT_WECHAT_MINI_VERSION ); ?></p>
            <p><?php esc_html_e( '作者:', 'sut-wechat-mini' ); ?> <?php echo esc_html( SUT_WECHAT_MINI_AUTHOR ); ?></p>
            <p><?php esc_html_e( '感谢您使用SUT微信小程序插件！', 'sut-wechat-mini' ); ?></p>
        </div>
    </div>
</div>