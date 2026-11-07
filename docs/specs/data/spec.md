# 数据规范

> **文档版本**: v4.0.0
> **更新时间**: 2026-11-07 (UTC+8)
> **对齐版本**: 小程序 `3.5.13` · WordPress 插件 `0.7.1`
> **关联文档**: [API 规范](../api/spec.md) · [后端规范](../backend/spec.md) · [架构规范](../architecture/spec.md) · [术语表](../../GLOSSARY.md)

---

## 1. 目的与边界

定义小程序端与插件端之间传输的数据结构、字段命名、分页与包络约定、本地存储与缓存策略。

**本项目不含本地数据库**：小程序端无建表、事务、索引或 ORM；数据由 WordPress + WooCommerce 在站点侧持久化，插件 `sutwx-app-api/` 负责查询、映射与输出 DTO。因此本规范不涉及 SQL、数据库迁移、备份脚本或数据库账号权限——这些属于 WP 站点运维范畴，见 [运维规范](../ops/spec.md)。

## 2. 数据来源

| 数据 | 站点侧来源 | 插件映射 | 小程序消费 |
|------|-----------|---------|-----------|
| 商品 | WooCommerce Product | `includes/mappings/map-product.php` | `services/productService.js` → `models/product.js` |
| 商品分类 | WooCommerce `product_cat` | `map-category.php` | `categoryService.js` → `models/category.js` |
| 文章 | WordPress Post | `map-post.php` | `postService.js` → `models/post.js` |
| 运营轮播 | 插件 option | `map-banner.php` | `pages/home/parts-data.js` |
| 订单 | WooCommerce Order | `map-order.php` / `map-order-parts.php` | `orderService.js` → `models/order.js` |
| 主题 | 插件 option | `class-rest-theme.php` | `themeService.js` → `models/theme.js` |
| 用户资料 | WP User + meta | `class-auth-user-profile.php::user_dto()` | `authService.js` |

`services/dataSource.js` 提供 `mock` / `woocommerce` 两种数据源；线上使用 WooCommerce，mock 仅用于无后端时的本地预览。

## 3. 字段命名与 DTO 约定

- **DTO 字段统一 camelCase**：`originPrice`、`categoryId`、`stockStatus`、`reviewCount` 等由插件映射函数直接输出，前端 `models/` 做兜底映射与默认值填充。
- 不存在 snake_case ↔ camelCase 的服务层转换；`services/*` 只负责请求编排与 `unwrap` 解包。
- 插件输出的是**已规整 DTO**（与 WC 原始结构解耦）；`mapWooCommerceProduct()` 对 DTO 幂等透传。
- 字段清单以 `npm run check:contract` 的比对结果为准（当前 product 22 字段、post 9 字段、category 8 字段一致），接口字段变更须同步 `map-*.php` 与 `models/*.js`，否则门禁失败。

### 3.1 商品 DTO 要点

`id` / `name` / `price` / `originPrice` / `cover` / `images` / `categoryId` / `stock` / `stockStatus` / `specs` / `type` / `desc` / `description` / `permalink` / `onSale` / `featured` / `isFavorite` / `rating` / `reviewCount` 等。

> `isFavorite`、`rating`、`reviewCount` 为 DTO 占位字段（无收藏 / 评价接口），不得据此推断存在对应业务模块。

### 3.2 用户 DTO 要点

`id` / `openid` / `nickName` / `avatarUrl` / `points` / `memberLevel` / `orderStats`。其中 `points`、`memberLevel` 同为占位字段，项目无独立积分模块。

## 4. 响应包络与分页

### 4.1 包络

后端 `Sutwx_Rest_Base::success()` 输出：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1609459200000,
  "requestId": "uuid"
}
```

错误由 `WP_Error` 承载，形如 `{ "code": "sutwx_error", "message": "...", "data": { "status": 400 } }`。小程序 `utils/api.js` 的 `unwrap()` 负责解包并抛出错误，业务代码只处理 `data`。

### 4.2 列表（分页）包络

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

- 分页参数统一 `page`（从 1 开始）与 `pageSize`（默认 20，上限 50）；不使用 `pageNum` / `limit`。
- 后端不返回 `hasMore`，前端按 `total` 与已加载条数推算。
- 列表端点：`/api/product/list`、`/api/post/list`、`/api/category/list`、`/api/order/list`。

## 5. 订单状态机

| 码 | 含义 | 允许的后继 |
|----|------|-----------|
| 0 | 已取消 | 终态 |
| 1 | 待付款 | 0（取消）/ 2（支付成功） |
| 2 | 待发货 | 3（发货）/ 5（退款） |
| 3 | 待收货 | 4（确认收货）/ 5（退款） |
| 4 | 已完成 | 终态 |
| 5 | 已退款 | 终态 |

共 **6 种状态**（`0`~`5`）。插件 `includes/order/class-order-transition.php` 负责流转，重复支付通知只在「待付款 / 挂起 / 失败」可推进为「待发货」，终态不回退。已支付订单取消由 `class-pay-refund.php` 触发整单退款，退款回调按 `out_refund_no` 落 `5`。

## 6. 本地存储与缓存

### 6.1 小程序本地存储（`wx.setStorageSync` / `getStorageSync`）

| 数据 | 用途 | 清理时机 |
|------|------|---------|
| token / refreshToken / userInfo / openid | 登录态（`utils/auth-token.js`） | 登出、刷新失败、令牌过期 |
| 购物车 | 选中商品与数量（`services/cartService.js`） | 用户清空或下单成功后移除已购项 |
| `appTheme` | 主题配置缓存 | 后台主题变更或用户切换语言 |
| 语言偏好 | i18n 当前语种 | 用户主动切换 |
| 离线快照 | 断网时首页/分类降级数据（`utils/offline-snapshot.js`） | TTL 到期 |
| csrfToken | 请求层 CSRF 令牌 | 由 `request-security.js` 管理 |

> 本地仅保存上述轻量数据，**不缓存订单与商品全量数据**；收货地址同样存于本地。

### 6.2 请求层缓存

`utils/request.js` 的 LRU 缓存：容量 50 条、TTL 5 分钟、并发队列默认 5、超时 10 秒、失败重试 1 次。缓存键由 URL + 参数构成；写操作不缓存。

### 6.3 服务端缓存

插件 `class-cache.php` 使用 WP Transients（TTL 5–10 分钟）+ 分组版本号；`save_post` / `woocommerce_update_product` / `edited_product_cat` / 主题选项更新时精准失效（`cache/class-cache-invalidation.php`）。

## 7. 数据校验

### 7.1 小程序侧

- `utils/request-security.js`：CSRF 令牌生成/携带、接口响应字段的 XSS 清洗（`sanitizeHtml`）、SQL 注入特征串拦截（`request-security-sql.js`）。
- 文章正文另由 `utils/richtext.js` 的 `sanitizeArticleHtml()` 按白名单标签清洗后交给 `rich-text` 渲染。
- 表单类输入（地址、下单信息）由页面与 `services/` 做必填与格式校验，不引入 `class-validator` / `class-transformer` / Joi 等库。
- 项目为**纯 JavaScript（CommonJS）**，无 TypeScript 类型系统与装饰器校验。

### 7.2 插件侧

- `sanitize.php` 校验主题色十六进制格式、预设 id 白名单。
- REST 控制器对参数做类型与范围校验（`absint`、`sanitize_text_field`、分页上限 50），失败返回 `WP_Error`（`data.status` 决定 HTTP 状态码）。
- 写操作按 `openid` 做资源归属校验；支付通知验签 + 金额一致性校验；退款金额取 WC 订单实付，不接受客户端传入。
- 密码哈希、BCrypt、ORM 事务传播等概念**不适用于本项目**（用户由 `wx.login` 静默建档，无密码体系）。

## 8. 数据安全

- 传输强制 HTTPS；小程序 `app.json` 开启 `urlCheck`；生产域名需在微信公众平台配置 request 合法域名。
- 令牌、AppSecret、支付证书、JWT 密钥不写入日志、不入库；服务端日志对 IP 做脱敏处理（`class-error-log.php`）。
- 监控上报不得含 openid / 手机号等可直接识别字段，允许会话级 `sessionId`。
- 限频按端点分档，响应带 `X-RateLimit-*` 头；密钥轮换、凭证泄露处置与黑名单全量失效流程见 [运维规范](../ops/spec.md)。

## 9. 契约变更流程

1. 改动 `includes/mappings/map-*.php` 或 `SutwxApp/models/*.js` 任一侧，必须同步另一侧字段。
2. 新增/删除端点时同步 [API 规范](../api/spec.md) 端点总览、[运维规范](../ops/spec.md) 免鉴权清单；`npm run check:docs` 会在 CI 校验。
3. 本地执行 `npm run check`（含 `check:contract`、`check:docs`、`check:version` 等八项）与 `npm test` 全绿后方可提交。
4. 包络或分页结构变更属破坏性变更，须在 `CHANGELOG.md` 标注并在 PR 描述中说明兼容性。

## 10. 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 4.0.0 | 2026-11-07 | 按 `3.5.13` / `0.7.1` 代码实况重写：删除 MySQL 建表/InnoDB 外键、Spring 事务传播、mysqldump 备份、数据库账号授权及 TypeScript/class-validator/bcrypt 示例；改为实际 DTO 与包络、分页约定、本地存储、WP 侧校验、订单状态机与契约校验流程 | Sut |
| 3.0.1 | 2025-12-27 | 初始数据规范（含大量未落地的服务端数据库设计） | Sut |
