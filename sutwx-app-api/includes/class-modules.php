<?php
/**
 * 插件模块加载清单（自 class-loader.php 拆出）。
 *
 * 顺序敏感：
 * - trait 文件必须先于使用它的类（auth / cache / rate-limit / pay / jwt）；
 * - 映射层先于 REST 控制器；
 * - REST 控制器统一在 class-loader.php 中实例化并注册路由。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

require_once SUTWX_API_DIR . 'includes/sanitize.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-product.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-post.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-category.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-order-parts.php';
require_once SUTWX_API_DIR . 'includes/mappings/map-order.php';
require_once SUTWX_API_DIR . 'includes/class-jwt-codec.php';
require_once SUTWX_API_DIR . 'includes/class-jwt.php';
require_once SUTWX_API_DIR . 'includes/class-credentials.php';
require_once SUTWX_API_DIR . 'includes/class-wechat-auth.php';
require_once SUTWX_API_DIR . 'includes/auth/class-auth-user-meta.php';
require_once SUTWX_API_DIR . 'includes/auth/class-auth-user-profile.php';
require_once SUTWX_API_DIR . 'includes/auth/class-auth-token-store.php';
require_once SUTWX_API_DIR . 'includes/class-auth-service.php';
require_once SUTWX_API_DIR . 'includes/class-auth-guard.php';
require_once SUTWX_API_DIR . 'includes/cache/class-cache-invalidation.php';
require_once SUTWX_API_DIR . 'includes/class-cache.php';
require_once SUTWX_API_DIR . 'includes/rate-limit/class-rate-limit-ip.php';
require_once SUTWX_API_DIR . 'includes/class-rate-limit.php';
require_once SUTWX_API_DIR . 'includes/pay/class-pay-credentials-store.php';
require_once SUTWX_API_DIR . 'includes/class-pay-credentials.php';
require_once SUTWX_API_DIR . 'includes/class-wechat-pay-sign.php';
require_once SUTWX_API_DIR . 'includes/class-wechat-pay-util.php';
require_once SUTWX_API_DIR . 'includes/class-wechat-pay.php';
require_once SUTWX_API_DIR . 'includes/class-wechat-pay-trade.php';
require_once SUTWX_API_DIR . 'includes/class-wechat-pay-notify.php';
require_once SUTWX_API_DIR . 'includes/class-pay-order-sync.php';
require_once SUTWX_API_DIR . 'includes/order/class-order-items.php';
require_once SUTWX_API_DIR . 'includes/class-error-log.php';
require_once SUTWX_API_DIR . 'includes/class-banner-settings.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-products.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-posts.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-categories.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-theme.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-banners.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-health.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-monitor.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-auth.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-orders.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-order-actions.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-order-ship.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-pay.php';
require_once SUTWX_API_DIR . 'includes/rest/class-rest-pay-query.php';
