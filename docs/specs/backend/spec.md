# 后端（WordPress 插件）规范

## 目的

本规范定义苏铁微信小程序（SutWxApp）的配套 **WordPress 后端插件**（`sutwx-app-api`）的技术设计、目录结构、REST 端点契约、主题配置、鉴权与部署要求。

> 本仓库包含小程序端与插件端；插件注册 WP REST 命名空间 `sutwx/v1`，并把 `/api/*` 重写到该命名空间，当前共 **24 个端点**（完整清单见 `../api/spec.md` 的「端点总览」）。内容端点免鉴权：
> - `GET /api/product/list`、`GET /api/product/detail` —— 商品（WooCommerce）
> - `GET /api/post/list`、`GET /api/post/detail` —— 文章（WordPress 文章）
> - `GET /api/category/list`、`GET /api/category/detail` —— 分类（WooCommerce 商品分类）
> - `GET /api/theme`、`GET /api/banner/list`、`GET /api/health` —— 主题、轮播、健康检查
>
> 鉴权 / 订单 / 支付 / 监控端点均已实现（见下文「鉴权（已实现）」「订单与支付（已实现）」）。

## 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| PHP | ≥ 8.1（CI 在 8.1 / 8.3 矩阵验证） | WordPress 运行环境 |
| WordPress | ≥ 6.0 | 核心 REST 框架 |
| WooCommerce | ≥ 8.0 | 商品/分类数据源（必装） |
| MySQL / MariaDB | ≥ 5.7 | WP 站点数据库（由 WP 站点提供，不在本仓库内） |
| 微信公众平台 | 小程序 AppID + Secret | `wx.login` 鉴权已使用；支付商户号与 API 证书为真实联调前置（见 `docs/tasks.md` INF-004） |

## 插件形态与目录结构

标准 WordPress 插件，位于**本仓库的 `sutwx-app-api/` 子目录**（与小程序端同仓，CI 的 php Job 直接扫描该目录，`check:plugin-version` 校验插件三源版本一致），不依赖微慕等第三方插件，自研 REST 层。

```
sutwx-app-api/
├── sutwx-app-api.php            # 插件入口（常量、加载类、声明依赖）
├── readme.txt                  # WP 插件目录元数据
├── includes/
│   ├── class-modules.php       # 模块加载清单（顺序敏感，trait 先于类）
│   ├── class-loader.php        # 13 个 REST 控制器注册 + /api/* rewrite + Cron 初始化
│   ├── class-rest-base.php     # {code,message,data,timestamp,requestId} 包络 + WP_Error + log_error
│   ├── class-error-log.php     # 结构化日志（error_log；monitor / rest_error / auth_failed 等事件）
│   ├── class-settings.php / class-banner-settings.php  # 主题与轮播配置
│   ├── class-cache.php         # Transients 缓存（分组版本号）
│   ├── class-rate-limit.php    # IP 限频（按端点分档）
│   ├── class-credentials.php / class-pay-credentials.php  # JWT 密钥与支付凭证治理
│   ├── class-jwt.php / class-jwt-codec.php / class-auth-service.php
│   ├── class-wechat-auth.php / class-auth-guard.php      # code2session / Bearer 中间件
│   ├── class-pay-cron.php      # WP-Cron 每 5 分钟掉单兜底查单
│   ├── class-pay-refund.php    # 已支付订单取消自动退款
│   ├── class-wechat-pay*.php / class-pay-order-sync.php  # 微信支付 V3（签名 / 下单 / 通知 / 查单）
│   ├── auth/                   # 用户资料 / meta / jti 黑名单（trait）
│   ├── cache/                  # 缓存失效钩子
│   ├── rate-limit/             # IP 解析与计数器读写
│   ├── pay/                    # 凭证存储、支付与退款回调通知处理
│   ├── order/                  # 下单装配、幂等短锁、状态流转
│   ├── rest/                   # 13 个控制器，共 24 个 register_rest_route
│   │   ├── class-rest-{products,posts,categories,theme,banners,health,monitor}.php
│   │   ├── class-rest-{auth,orders,order-actions,order-ship}.php
│   │   └── class-rest-{pay,pay-query}.php
│   └── mappings/               # map-{product,post,category,order,order-parts,banner}.php
├── admin/
│   ├── settings-page.php       # 后台「小程序设置」页（主题预设 + 自定义色）
│   ├── settings-pay.php        # 微信支付凭证（wp-config 常量锁定时只读）
│   └── settings-banners.php    # 运营轮播位
└── tests/
    ├── bootstrap.php / stubs-runtime.php   # 单测引导与 WP/WC 运行时桩
    └── run-*-tests.php         # 8 套件：mapping/settings/auth/cache/order/pay/platform/pay-exception
```

## REST 路由与命名空间映射

小程序调用路径统一为 `/api/*`。插件落地方式二选一：

- **推荐（路径直连）**：插件注册 WP REST 命名空间 `sutwx/v1`（路由 `product/list`、`post/list`、`theme` 等），并用 `add_rewrite_rule` 将 `/api/(.*)` 重写到 `index.php?rest_route=/sutwx/v1/$1`；小程序 `globalData.baseUrl` 设为站点根（如 `https://example.com`）。此时 `/api/*` 即为真实可访问路径。
- **备选（直连 wp-json）**：小程序 `baseUrl` 设为 `https://example.com/wp-json/sutwx/v1`，跳过重写层。

路由注册示例（PHP）：

```php
add_action('rest_api_init', function () {
    register_rest_route('sutwx/v1', '/product/list', [
        'methods'  => 'GET',
        'callback' => [new Sutwx\Rest\Products(), 'list'],
        'permission_callback' => '__return_true', // v1 内容端点免鉴权
    ]);
    // ... product/detail, post/list, post/detail, category/list, category/detail, theme
});
```

## 响应格式约定

所有端点统一返回包络（与 `../api/spec.md` 一致），小程序 `utils/api.unwrap` 兼容此包络或裸数据：

```json
{ "code": 200, "message": "success", "data": {}, "timestamp": 1609459200000, "requestId": "uuid" }
```

列表端点 `data` 结构：`{ "list": [...], "total": 100, "page": 1, "pageSize": 20 }`。

## 端点契约（v1 只读 MVP）

### 商品 `GET /api/product/list`

查询参数：`page`(默认1)、`pageSize`(默认20)、`categoryId`、`keyword`。

`data.list[]` 为小程序商品 DTO（`models/product.js` 字段）：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | WC 商品 ID |
| name | string | 商品名 |
| price | number | 现价 |
| originPrice | number\|null | 原价（划线价） |
| image | string | 主图 URL |
| images | string[] | 图集 |
| categoryId | int | 末级分类 ID |
| categoryName | string | 分类名 |
| sales | int | 销量 |
| stock | int | 库存（缺省 99） |
| stockStatus | string | `instock`/`outofstock` |
| sku | string | 货号 |
| desc | string | 短描述（纯文本） |
| description | string | 长描述（HTML） |
| specs | array | `[{id,name,price,stock}]` |
| type | string | `simple`/`variable` |
| permalink | string | 商品链接 |
| onSale | bool | 是否在售折扣 |
| featured | bool | 是否精选 |
| isFavorite | bool | 是否已收藏（DTO 占位字段，无独立收藏接口） |
| rating | number | 评分（DTO 占位字段） |
| reviewCount | int | 评价数（DTO 占位字段） |

> 以上字段由 `includes/mappings/map-product.php` 输出，与 `SutwxApp/models/product.js` 消费字段一致，并由 `npm run check:contract` 自动比对（当前 22 字段一致）。

> 插件可直接返回 WC 原始 JSON（由小程序 `mapWooCommerceProduct` 转换），或返回上述已规整 DTO（该映射函数为幂等透传）。**推荐返回已规整 DTO**，以解耦 WC 内部结构变化。

### 商品详情 `GET /api/product/detail?id={id}`

返回单个商品 DTO（`data` 即对象，非数组）。

### 文章 `GET /api/post/list`

查询参数同商品列表。`data.list[]` 为小程序文章 DTO（`models/post.js` 字段）：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 文章 ID |
| title | string | 标题（去 HTML） |
| content | string | 正文 HTML（插件侧应做基础清洗，最终由小程序 `sanitizeArticleHtml` 把关） |
| excerpt | string | 摘要（前 60 字） |
| cover | string | 特色图 URL（`_embedded['wp:featuredmedia'][0].source_url`） |
| date | string | `YYYY-MM-DD` |
| link | string | 原文链接 |
| author | string\|int | 作者 |
| category | int | 末级分类 ID |

### 文章详情 `GET /api/post/detail?id={id}`

返回单个文章 DTO。

### 分类 `GET /api/category/list`

`data.list[]` 为小程序分类 DTO（`models/category.js` 字段）：`id`、`name`、`icon`、`count`、`description`、`parentId`、`slug`、`permalink`。

### 分类详情 `GET /api/category/detail?id={id}`

返回单个分类 DTO。

### 主题 `GET /api/theme`

免鉴权。响应（`data` 即对象）：

```json
{
  "presetId": "sky-blue",
  "custom": {
    "primaryColor": "#E91E63",
    "primaryLight": "#FCE4EC",
    "primaryDark": "#AD1457"
  }
}
```

- `presetId`：内置预设 id（`sut-green` 默认 / `sky-blue` / `sunny-orange` / `violet` / `graphite`）。
- `custom`：可选，按字段覆盖主题色值（仅接受合法十六进制色 `#RGB`/`#RRGGBB`），支持 `primaryColor`、`primaryLight`、`primaryDark` 等全部 `THEME_KEYS`（见 `models/theme.js`）。
- 后端不可用时小程序回退内置默认预设；主题在 `app.js` 启动时加载并缓存到本地 `appTheme`。

## 主题配置（后台设置页）

`admin/settings-page.php` 在 WP 后台「设置 → 小程序设置」提供：

1. **主题预设下拉**：5 套内置预设（与 `models/theme.js` 的 `THEME_PRESETS` 保持一致）。
2. **自定义色选择器**：主色 / 浅色 / 深色（及可选中性色），保存前经 `sanitize.php` 校验十六进制格式。
3. 存储于 `options` 表（如 `sutwx_theme`），`class-rest-theme.php` 读取并返回上包络。

> 预设列表变动时需同步更新小程序 `models/theme.js` 与后台下拉，保持双向一致。

## 鉴权（已实现）

- `POST /api/auth/login`：`wx.login` code → 微信 `code2session` → 换取 `openid` → 签发 JWT（access 2 小时 + refresh 令牌），返回用户资料
- `POST /api/auth/refresh-token`：用 refresh 令牌换新令牌对
- `POST /api/auth/logout`：令牌 `jti` 加入黑名单（`includes/auth/class-auth-token-store.php`）
- `GET /api/user/info`：返回 `user_dto()` 用户资料（`points` / `memberLevel` 为 DTO 占位字段，项目无独立积分模块）
- 令牌格式 `Authorization: Bearer <token>`；小程序侧由 `utils/request-auth.js` 在 401 时自动刷新并重放
- 越权防护依赖**资源归属校验**（按 `openid`），不使用角色体系
- v1 内容端点（product/post/category/theme）保持 `permission_callback => __return_true`（免登录）

## 订单与支付（已实现）

- `GET /api/order/list`、`GET /api/order/detail`（鉴权 + 归属校验）
- `POST /api/order/create`（商品装配 + 库存校验 + 收货地址快照）、`/api/order/cancel`、`/api/order/confirm`
- `POST /api/order/ship`（商家发货，独立控制器 `rest/class-rest-order-ship.php`）
- 微信支付 V3：签名 / 预支付 / 通知验签解密 / 查单 / 退款（`class-wechat-pay*.php`、`class-pay-order-sync.php`）
- `POST /api/pay/prepay`、`POST /api/pay/notify`（支付回调）、`POST /api/pay/refund-notify`（退款回调）、`POST /api/pay/query`（主动查单）
- 订单状态机：`0` 已取消 / `1` 待付款 / `2` 待发货 / `3` 待收货 / `4` 已完成 / `5` 已退款
- 下单幂等：`clientRequestId` 10 秒短锁，失败路径均释放锁（`includes/order/class-order-idempotency.php`）
- 掉单兜底：`class-pay-cron.php` 注册 WP-Cron 每 5 分钟扫描待付款订单调查单；`class-pay-refund.php` 在已支付订单取消时自动退款
- 小程序侧对应 `services/orderService.js`（woocommerce 分支）、`services/payService.js`
- **仍待外部资源**：真实商户号 / API 证书与 WooCommerce 站点联调（见 `docs/tasks.md` INF-004~006），代码实现与单测已完成

## 运营、监控与健康端点（已实现）

| 端点 | 实现 | 说明 |
|------|------|------|
| `GET /api/banner/list` | `rest/class-rest-banners.php` + `admin/settings-banners.php` + `mappings/map-banner.php` | 后台可配运营轮播位；前端 `pages/home/parts-data.js` 正常消费 |
| `POST /api/monitor/data` | `rest/class-rest-monitor.php` | 接收客户端批量上报（≤20 条），逐条经 `Sutwx_Error_Log` 落日志；限频 10 次/分钟 |
| `GET /api/health` | `rest/class-rest-health.php` | 返回 `version/php/wcActive/payConfigured`；`health-probe.yml` 每 5 分钟拨测 |
| `POST /api/pay/refund-notify` | `rest/class-rest-pay.php` | 退款结果通知，平台证书验签后按 `out_refund_no` 落「已退款」 |

## 安全、缓存与性能

- **安全**：内容端点公开但限频（`X-RateLimit-*`）；校验/转义所有输出；文章 HTML 服务端预清洗 + 小程序 `sanitizeArticleHtml` 双重把关；禁止直接 `echo` 未转义内容。
- **缓存**：已实现 `class-cache.php`（WP Transients，TTL 5–10 分钟 + 分组版本号），内容变更钩子精准失效（`save_post` / `woocommerce_update_product` / `edited_product_cat` / 主题选项更新），失效逻辑见 `includes/cache/class-cache-invalidation.php`。
- **性能**：仅返回 DTO 必要字段；图片走 WP 媒体缩略图；分页强制上限 `pageSize<=50`。
- **监控**：`includes/class-error-log.php` 提供结构化日志（错误码、路由、耗时、脱敏 IP），`class-rest-base.php` 的 `error()` / `log_error()` 在鉴权失败、限频命中、支付异常与 REST 错误时落盘；`/api/monitor/data` 接收客户端 8 模块采集数据并逐条落 `monitor` 日志；`health-probe.yml` 每 5 分钟拨测健康端点，失败推送企业微信机器人（详见 `../ops/spec.md`）。

## 部署与版本管理

- 插件独立版本号（当前 **0.7.1**），三处须一致：`sutwx-app-api.php` 的 `Version` 头 / `@version`、`SUTWX_API_VERSION` 常量、`readme.txt` 的 `Stable tag`；由 `npm run check:plugin-version` 与 CI 校验。
- 与小程序 `globalData.version` 在 `CHANGELOG.md` 中对应记录；版本号变更同步 `../api/spec.md` 与本规范。
- 通过 WP 后台上传或 `npm run package:plugin` 产物安装；`rest_route` 重写需在「设置 → 固定链接」保存一次以刷新。
- 部署 runbook、`wp-config` 常量全表与回滚步骤见 `../ops/spec.md`。

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 0.7.1 | 2026-11-07 | 对齐当前实现：24 端点与 `sutwx/v1` 命名空间、运营/监控/健康端点已实现、结构化日志、下单幂等、WP-Cron 掉单兜底与自动退款、8 套 PHP 单测、目录树按实际重画 | Sut |
| 1.0.0 | 2026-09-13 | 初始版本：定义插件架构、v1 只读端点契约、主题配置与后续阶段预留 | Sut |
| 0.3.0 | 2026-09-13 | P2 主题后台配置：`class-settings.php`（配置读写 + 颜色/预设校验）、`admin/settings-page.php`（后台设置页）、`/api/theme` 经清洗返回 | Sut |
