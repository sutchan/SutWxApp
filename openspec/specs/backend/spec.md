# 后端（WordPress 插件）规范

## 目的

本规范定义苏铁微信小程序（SutWxApp）的配套 **WordPress 后端插件**（`sutwx-app-api`）的技术设计、目录结构、REST 端点契约、主题配置、鉴权与部署要求。

> 小程序为纯前端（见 `openspec/specs/architecture/spec.md`），所有内容由 WordPress 作为 headless CMS 经 REST API 提供。当前小程序已按以下端点调用（均免鉴权）：
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
├── sutwx-app-api.php            # 插件入口（注册钩子、加载类、声明依赖）
├── readme.txt                  # WP 插件目录元数据
├── composer.json               # 可选：自动加载（PSR-4）
├── includes/
│   ├── class-loader.php        # 钩子/路由统一注册
│   ├── class-settings.php      # 主题配置（后台设置页 + option 读写）
│   ├── class-rest-base.php     # 响应包络与错误处理基类
│   ├── rest/
│   │   ├── class-rest-products.php   # /api/product/*
│   │   ├── class-rest-posts.php      # /api/post/*
│   │   ├── class-rest-categories.php # /api/category/*
│   │   ├── class-rest-theme.php      # /api/theme
│   │   └── class-rest-auth.php       # 预留：/api/v1/users（wx.login）
│   ├── mappings/
│   │   ├── map-product.php     # WC 商品 → 小程序商品 DTO
│   │   ├── map-post.php        # WP 文章 → 小程序文章 DTO
│   │   └── map-category.php    # WC 分类 → 小程序分类 DTO
│   └── sanitize.php            # 颜色/字段校验
├── admin/
│   └── settings-page.php       # 后台「小程序设置」页（主题预设 + 自定义色）
└── tests/
    └── rest-api-test.php       # WP 单元测试 / Codeception 集成测试
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

所有端点统一返回包络（与 `openspec/specs/api/spec.md` 一致），小程序 `utils/api.unwrap` 兼容此包络或裸数据：

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

## 鉴权（后续阶段，本期预留）

- `class-rest-auth.php` 预留 `POST /api/v1/users/login`：`wx.login` code → 微信 `code2session` → 换取自签 JWT（`Authorization: Bearer <token>`）。
- 与小程序 `utils/request.requestWithToken`、`app.js` 的 `requestWithToken` 对齐。
- v1 内容端点保持 `permission_callback => __return_true`（免登录）。

## 订单与支付（后续阶段，本期仅预留契约）

- `POST /api/v1/orders` 创建订单、`GET /api/v1/orders/{id}` 查询（鉴权）。
- 微信支付对接需商户号 + 证书，独立阶段实施。
- 小程序当前订单/购物车为本地逻辑，待后端就绪后切换为接口驱动。

## 安全、缓存与性能

- **安全**：内容端点公开但限频（`X-RateLimit`）；校验/转义所有输出；文章 HTML 服务端预清洗 + 小程序 `sanitizeArticleHtml` 双重把关；禁止直接 `echo` 未转义内容。
- **缓存**：列表/详情端点建议 `cache` 层（WP Transients，TTL 5–10 分钟）或反向代理；商品/文章变更时清缓存（`save_post`/`woocommerce_update_product` 钩子）。
- **性能**：仅返回 DTO 必要字段；图片走 WP 媒体缩略图；分页强制上限 `pageSize<=50`。
- **监控**：记录响应耗时与异常（可对接小程序 `utils/monitor` 上报通道，后续扩展）。

## 部署与版本管理

- 插件独立版本号，与小程序 `globalData.version` 在 CHANGELOG 中对应记录。
- 通过 WP 后台上传或 Composer 安装；`rest_route` 重写需在「设置 → 固定链接」保存一次以刷新。
- 变更需同步更新 `openspec/specs/api/spec.md` 与本规范。

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.0 | 2026-09-13 | 初始版本：定义插件架构、v1 只读端点契约、主题配置与后续阶段预留 | Sut |
