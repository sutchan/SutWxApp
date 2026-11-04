# WordPress 插件（sutwx-app-api）开发计划

> 配套文档：[后端规范](../specs/backend/spec.md) · [API 规范](../specs/api/spec.md) · [架构规范](../specs/architecture/spec.md)
>
> 决策基线（已与产品确认）：
> 1. 商品数据源 = **WooCommerce**
> 2. v1 范围 = **只读 MVP**（文章/页面 + 商品 + 主题，全部免登录公开接口）
> 3. 鉴权 = **wx.login → JWT**（基建本期落地，内容端点仍公开）
> 4. 订单/支付 = **已实现**（BE-006/007：订单创建/查询/取消/确认/发货，微信支付 V3 预支付/通知/查单）。

## 目标

交付一个标准 WordPress 插件，使小程序在 `globalData.productSource = "woocommerce"` 与 `baseUrl` 指向站点后，能够真实消费文章、商品、分类与主题数据，替代当前 `mock` 数据源。

## 技术决策

| 项 | 决策 | 理由 |
|----|------|------|
| 插件形态 | 独立自研插件，不依赖微慕等第三方 | 与小程序版本/契约强绑定，可控 |
| 路由映射 | 注册 `sutwx/v1` + rewrite `/api/*` | 让 `api/spec.md` 的 `/api/*` 即真实路径 |
| 商品/分类来源 | WooCommerce REST（直接 `WP_Query` 或 `wc_get_products`） | 与 `mapWooCommerceProduct` 对齐，零改造 |
| 文章来源 | WP 核心 `wp/v2/posts`（含 `_embedded` 特色图） | 小程序 `mapWpPost` 已就绪 |
| 响应格式 | 统一 `{code,data}` 包络 | 兼容小程序 `unwrap` |
| DTO 策略 | 插件返回**已规整 DTO** | 解耦 WC 内部结构变化（映射函数幂等） |
| 鉴权 | 预留 `wx.login`→JWT；内容端点免登录 | 渐进式，先出可用后端 |

## 里程碑

### P0 — 脚手架与环境（约 1–2 天）

- [x] 初始化插件 `sutwx-app-api.php`、声明 `Requires: WooCommerce`。
- [x] `class-loader.php` 统一注册 `rest_api_init` 与后台菜单。
- [x] 注册命名空间 `sutwx/v1` 与 6 个路由骨架（返回占位包络）。
- [x] 加入 `/api/*` rewrite 规则，`baseUrl` 配置说明写入插件 readme。
- [ ] 本地 WP + WC 测试环境就绪（含示例商品/文章/分类）。

**验收**：`GET /api/theme` 返回 `{code:200,data:{presetId:"sut-green"}}`。

### P1 — 内容只读 MVP（约 3–4 天）

- [x] `map-product.php`：WC 商品 → 商品 DTO（字段见后端规范）。
- [x] `map-post.php`：WP 文章（含特色图）→ 文章 DTO。
- [x] `map-category.php`：WC `product_cat` → 分类 DTO。
- [x] 实现 `product/list`、`product/detail`、`post/list`、`post/detail`、`category/list`、`category/detail` 六个回调 + 分页/筛选/关键词。
- [x] 单元测试：各映射函数字段完整性（`tests/run-mapping-tests.php`，独立运行无需 WP 环境）。

**验收**：小程序 `app.js` 改 `productSource:"woocommerce"`、`baseUrl` 指向本地，首页/分类/文章列表与详情展示真实数据。

### P2 — 主题后台配置（约 1–2 天）

- [x] `admin/settings-page.php`：预设下拉（5 套）+ 自定义色选择器。
- [x] `class-settings.php`：option 读写 + 十六进制校验（`sanitize.php`）。
- [x] `class-rest-theme.php`：读取 option 返回 `{presetId,custom}`。
- [x] 预设列表与小程序 `models/theme.js` 对齐检查。

**验收**：后台切换预设/自定义色后，小程序重启即应用新主题（导航栏 + tabBar + 全站 CSS 变量）。

### P3 — 鉴权基建（已实现，BE-003）

- [x] `class-rest-auth.php`：`POST /api/users/login`，`wx.login` code → `code2session` → 自签 JWT。
- [x] JWT 签发/校验工具（HS256，密钥存 `wp-config` 常量或 option）。
- [x] 小程序侧 `requestWithToken` 联通验证（token 流程，内容接口仍免登录）。

**验收**：小程序 `wx.login` 拿到 code → 插件返回 JWT → 后续请求可携 `Authorization: Bearer`。

### P4 — 联调、缓存与测试（已实现）

- [x] 列表/详情端点加 Transients 缓存（TTL 5–10 分钟），`save_post`/`woocommerce_update_product` 精准清缓存。
- [x] 限频（IP 维度，公开端点）。
- [x] 独立单测：映射/设置/鉴权/订单/支付（`tests/run-*-tests.php`，CI PHP 矩阵运行）。
- [x] 文档：已在 `api/spec.md` 标注各端点「已实现」状态。

**验收**：联调通过，缓存命中正确，异常有统一错误包络。

### P5 — 订单与支付（已实现，BE-006/007）

- [x] `POST /api/order/create`、`GET /api/order/detail`、`GET /api/order/list`、`POST /api/order/cancel`、`POST /api/order/confirm`（鉴权）。
- [x] 微信支付 V3：`POST /api/pay/prepay`、异步通知 `/api/pay/notify`、主动查单 `/api/pay/query`（需商户号 + 证书）。
- [x] 新增 `POST /api/order/ship`（商家发货）与自定义状态 `wc-shipped`，补全「待收货」生命周期。
- [x] 小程序购物车/订单在 `productSource="woocommerce"` 下切换为接口驱动（`orderService`/`payService`）。

## 风险与对策

| 风险 | 对策 |
|------|------|
| WC 内部结构升级导致映射失效 | 插件返回已规整 DTO + 映射单测覆盖 |
| 文章 HTML 含危险标签 | 服务端预清洗 + 小程序 `sanitizeArticleHtml` 双重把关 |
| rewrite 不生效 | 备选直连 `wp-json/sutwx/v1`；固定链接保存刷新 |
| 主题预设两端不一致 | 后台下拉与 `models/theme.js` 同步变更并单测 |

## 测试策略

- **单元**：`tests/` 覆盖 `map-*.php` 字段映射、颜色校验、JWT 签发/校验。
- **集成**：本地 WP 环境启动后，用小程序预览（或 curl）验证 6 个端点包络与字段。
- **回归**：每次 WC/WP 升级后重跑映射单测。

## 验收总览

- [ ] 6 个只读端点返回符合 DTO 的 `{code,data}` 包络
- [ ] 小程序切 `woocommerce` 源后全站展示真实数据
- [ ] 后台主题配置即时下发并全站生效
- [ ] `wx.login`→JWT 流程联通（P3）
- [ ] 缓存/限频生效，异常统一错误包络
