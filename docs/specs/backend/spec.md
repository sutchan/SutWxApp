# 后端（WordPress 插件）规范

## 目的

本规范定义苏铁微信小程序（SutWxApp）的配套 **WordPress 后端插件**（`sutwx-app-api`）的技术设计、目录结构、REST 端点契约、主题配置、鉴权与部署要求。

> 小程序为纯前端（见 `../architecture/spec.md`），所有内容由 WordPress 作为 headless CMS 经 REST API 提供。当前小程序已按以下端点调用（均免鉴权）：
> - `GET /api/product/list`、`GET /api/product/detail` —— 商品（WooCommerce）
> - `GET /api/post/list`、`GET /api/post/detail` —— 文章（WordPress 文章）
> - `GET /api/category/list`、`GET /api/category/detail` —— 分类（WooCommerce 商品分类）
> - `GET /api/theme` —— 主题配置（后台可配）
>
> 本插件即为这些端点的 WP 侧实现。用户/订单等鉴权端点为后续阶段，本期仅预留契约（见文末）。

## 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| PHP | ≥ 7.4（推荐 8.1+） | WordPress 运行环境 |
| WordPress | ≥ 6.0 | 核心 REST 框架 |
| WooCommerce | ≥ 8.0 | 商品/分类数据源（必装） |
| MySQL / MariaDB | ≥ 5.7 | WP 数据库 |
| 微信公众平台 | 小程序 AppID + Secret | 后续 `wx.login` 鉴权阶段使用 |

## 插件形态与目录结构

标准 WordPress 插件，独立仓库（建议 `sutwx-app-api/`），不依赖微慕等第三方插件，自研 REST 层，便于与小程序版本号对齐。

```
sutwx-app-api/
├── sutwx-app-api.php            # 插件入口（常量、加载类、声明依赖）
├── readme.txt                  # WP 插件目录元数据
├── includes/
│   ├── class-modules.php       # 模块加载清单（顺序敏感，trait 先于类）
│   ├── class-loader.php        # 钩子/路由统一注册（含 /api/* rewrite）
│   ├── class-settings.php      # 主题配置（后台设置页 + option 读写）
│   ├── class-rest-base.php     # 响应包络与错误处理基类
│   ├── sanitize.php            # 颜色/字段校验
│   ├── class-jwt.php           # JWT 签发/校验（HS256）
│   ├── class-jwt-codec.php     # JWT 编码基建（trait）
│   ├── class-credentials.php   # JWT 密钥治理
│   ├── class-wechat-auth.php   # code2session
│   ├── class-auth-service.php  # 登录/刷新/签发
│   ├── auth/                   # 鉴权职责拆分（trait）
│   │   ├── class-auth-user-profile.php  # 用户查找/绑定/资料
│   │   ├── class-auth-user-meta.php     # 用户 meta 与文本工具
│   │   └── class-auth-token-store.php   # jti 黑名单
│   ├── class-auth-guard.php    # Bearer 鉴权中间件
│   ├── class-cache.php         # Transients 缓存（分组版本号）
│   ├── cache/
│   │   └── class-cache-invalidation.php # 内容变更失效钩子（trait）
│   ├── class-rate-limit.php    # IP 限频
│   ├── rate-limit/
│   │   └── class-rate-limit-ip.php      # 客户端 IP / 可信代理（trait）
│   ├── class-pay-credentials.php        # 支付凭证读写
│   ├── pay/
│   │   └── class-pay-credentials-store.php # 凭证写入/锁定（trait）
│   ├── class-wechat-pay*.php   # 微信支付 V3（签名/工具/下单/通知）
│   ├── class-pay-order-sync.php# 查单同步订单状态
│   ├── order/
│   │   └── class-order-items.php        # 订单商品装配 + 库存校验 + 地址
│   ├── rest/
│   │   ├── class-rest-products.php      # /api/product/*
│   │   ├── class-rest-posts.php         # /api/post/*
│   │   ├── class-rest-categories.php    # /api/category/*
│   │   ├── class-rest-theme.php         # /api/theme
│   │   ├── class-rest-auth.php          # /api/auth/* 与 /api/user/info
│   │   ├── class-rest-orders.php        # /api/order/list|detail
│   │   ├── class-rest-order-actions.php # /api/order/create|cancel|confirm
│   │   ├── class-rest-order-ship.php    # /api/order/ship（商家发货）
│   │   ├── class-rest-pay.php           # /api/pay/prepay|notify
│   │   └── class-rest-pay-query.php     # /api/pay/query
│   └── mappings/
│       ├── map-product.php     # WC 商品 → 小程序商品 DTO
│       ├── map-post.php        # WP 文章 → 小程序文章 DTO
│       ├── map-category.php    # WC 分类 → 小程序分类 DTO
│       └── map-order*.php      # WC 订单 → 小程序订单 DTO
├── admin/
│   ├── settings-page.php       # 后台「小程序设置」页（主题预设 + 自定义色）
│   └── settings-pay.php        # 微信支付凭证设置页
└── tests/
    ├── bootstrap.php           # 单测引导
    ├── stubs-runtime.php       # WP/WC 运行时桩
    └── run-*-tests.php         # 映射/设置/鉴权/订单/支付/缓存单测
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
- `GET /api/user/info`：返回当前用户资料与积分
- 令牌格式 `Authorization: Bearer <token>`；小程序侧由 `utils/request-auth.js` 在 401 时自动刷新并重放
- 越权防护依赖**资源归属校验**（按 `openid`），不使用角色体系
- v1 内容端点（product/post/category/theme）保持 `permission_callback => __return_true`（免登录）

## 订单与支付（已实现）

- `GET /api/order/list`、`GET /api/order/detail`（鉴权 + 归属校验）
- `POST /api/order/create`（商品装配 + 库存校验 + 收货地址快照）、`/api/order/cancel`、`/api/order/confirm`
- `POST /api/order/ship`（商家发货，独立控制器 `rest/class-rest-order-ship.php`）
- 微信支付 V3：签名 / 预支付 / 通知验签解密 / 查单 / 退款（`class-wechat-pay*.php`、`class-pay-order-sync.php`）
- `POST /api/pay/prepay`、`POST /api/pay/notify`（服务端回调）、`GET /api/pay/query`
- 订单状态机：`0` 已取消 / `1` 待付款 / `2` 待发货 / `3` 待收货 / `4` 已完成 / `5` 已退款
- 小程序侧对应 `services/orderService.js`（woocommerce 分支）、`services/payService.js`
- **待落地**：真实商户号与 API 证书联调、退款接入订单取消流程、掉单 cron 兜底（见 `docs/tasks.md` INF-005/INF-006、BE-012/BE-014）

## 未实现端点（缺口）

| 端点 | 状态 | 说明 |
|------|------|------|
| `GET /api/banner/list` | **未实现** | 前端 `pages/home/parts-data.js` 已请求并静默降级为空轮播；首页运营位不可用（`docs/tasks.md` BE-008） |
| `POST /api/monitor/data` | **未实现** | 小程序 `utils/monitor*.js` 上报目标，当前 404，监控数据不落地（`docs/tasks.md` BE-013） |
| `GET /api/health` | **未实现** | 运维拨测端点缺失（`docs/tasks.md` BE-009） |

## 安全、缓存与性能

- **安全**：内容端点公开但限频（`X-RateLimit-*`）；校验/转义所有输出；文章 HTML 服务端预清洗 + 小程序 `sanitizeArticleHtml` 双重把关；禁止直接 `echo` 未转义内容。
- **缓存**：已实现 `class-cache.php`（WP Transients，TTL 5–10 分钟 + 分组版本号），内容变更钩子精准失效（`save_post` / `woocommerce_update_product` / `edited_product_cat` / 主题选项更新），失效逻辑见 `includes/cache/class-cache-invalidation.php`。
- **性能**：仅返回 DTO 必要字段；图片走 WP 媒体缩略图；分页强制上限 `pageSize<=50`。
- **监控**：**服务端当前无日志与错误上报**（`includes/` 内无 `error_log` 调用），线上问题只能靠响应包络与 WordPress 错误日志定位；结构化日志与 `/api/monitor/data` 接收端点为待建项（`docs/tasks.md` BE-010 / BE-013）。

## 部署与版本管理

- 插件独立版本号，与小程序 `globalData.version` 在 CHANGELOG 中对应记录。
- 通过 WP 后台上传或 Composer 安装；`rest_route` 重写需在「设置 → 固定链接」保存一次以刷新。
- 变更需同步更新 `../api/spec.md` 与本规范。

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.0 | 2026-09-13 | 初始版本：定义插件架构、v1 只读端点契约、主题配置与后续阶段预留 | Sut |
| 0.3.0 | 2026-09-13 | P2 主题后台配置：`class-settings.php`（配置读写 + 颜色/预设校验）、`admin/settings-page.php`（后台设置页）、`/api/theme` 经清洗返回 | Sut |
