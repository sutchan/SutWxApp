# 功能规范

> **文档版本**: v4.0.0
> **更新时间**: 2026-11-07 (UTC+8)
> **对齐版本**: 小程序 `3.5.13` · WordPress 插件 `0.7.1`
> **关联文档**: [API 规范](../api/spec.md)（端点唯一事实来源）· [架构规范](../architecture/spec.md) · [数据规范](../data/spec.md) · [测试规范](../testing/spec.md)

---

## 目录

1. 概述
2. 内容与商品
3. 用户与登录
4. 购物车与订单
5. 支付与退款
6. 主题换肤
7. 监控与可观测
8. 性能与安全要求
9. 当前未实现能力
10. 版本历史

---

## 1. 概述

### 1.1 文档目的

定义本仓库**当前已实现**的功能范围、行为约束与验收要点。接口路径、参数与返回值一律以 [API 规范](../api/spec.md) 的「端点总览」为准，本文只描述功能语义，不重复定义接口契约。

### 1.2 功能模块概览

| 模块 | 已实现能力 | 主要代码位置 |
|------|-----------|-------------|
| 内容与商品 | 首页商品流、分类浏览、关键词搜索、商品详情、文章列表/详情、运营轮播 | `pages/home/`、`pages/category/`、`pages/product/`、`pages/article/`、`services/*Service.js` |
| 用户与登录 | 微信静默授权（`wx.login` → code2session → JWT）、个人中心、本地收货地址 | `services/authService.js`、`utils/auth-token.js`、`pages/user/`、`pages/address/` |
| 购物车与订单 | 本地购物车、下单（库存校验 + 幂等）、订单列表/详情/取消/确认收货、商家发货 | `services/cartService.js`、`services/orderService.js`、`sutwx-app-api/includes/order/` |
| 支付与退款 | 微信支付 V3 预支付、支付/退款通知验签、主动查单、掉单 Cron 兜底、已支付订单取消自动退款 | `services/payService.js`、`sutwx-app-api/includes/pay/` |
| 主题换肤 | 后台下发 5 套预设 + 自定义色，小程序动态应用导航栏 / tabBar / CSS 变量 | `services/themeService.js`、`models/theme.js` |
| 监控与可观测 | 8 个采集模块 + 自动上报、服务端结构化日志、健康拨测 | `utils/monitor*.js`、`includes/class-error-log.php` |
| 多语言 | 简体中文 / 英文运行时词条与语言切换 | `locales/*.json`、`utils/i18n.js` |

> **未在表中的能力**（积分、社交、评价、优惠券、消息通知、收藏接口等）当前**未实现**，见第 9 节，不作为验收范围。

## 2. 内容与商品

### 2.1 商品与分类

- **首页**：商品瀑布流、分类导航、关键词搜索、运营轮播（`/api/banner/list`）；分页参数统一 `page` / `pageSize`，`hasMore` 由 `total` 推算。
- **分类**：`GET /api/category/list` 返回 DTO 列表，`icon` 字段兼容字符串与 WC 原始 `image` 对象；分类详情走 `/api/category/detail?id=`。
- **商品列表/详情**：`/api/product/list`（支持 `categoryId`、`keyword` 过滤）、`/api/product/detail?id=`；DTO 由 `models/product.js` 兜底映射，共 22 字段（`check:contract` 校验）。
- **数据来源**：`services/dataSource.js` 提供 `mock` / `woocommerce` 切换，线上使用 WooCommerce；DTO 由插件 `includes/mappings/map-product.php` 规整后输出。
- **文章**：`/api/post/list`、`/api/post/detail?id=`；正文 HTML 由 `utils/richtext.js` 的 `sanitizeArticleHtml()` 清洗后交给 `rich-text` 渲染。

> 分类层级由 WC `parentId` 决定，当前 UI 展示一级/二级；「三级分类」未作为独立验收要求。

### 2.2 搜索

- 首页搜索框提交后以 `keyword` 参数请求 `/api/product/list`，不单独注册搜索端点。
- 无搜索建议（suggestions）、无独立商品评价（reviews）与相关推荐（related）接口；相关推荐由前端本地数据实现。

## 3. 用户与登录

### 3.1 登录方式

- **仅微信静默授权**：`wx.login` 拿 `code` → `POST /api/auth/login` → 后端 `code2session` 换 `openid` → 签发 JWT（access 2 小时 + refresh token）。
- **无**用户名密码注册、手机号验证码登录、邮箱注册，也不采集手机号与邮箱。
- 登录态由 `utils/auth-token.js` 持久化（token / refreshToken / userInfo / openid）；`POST /api/auth/logout` 将 `jti` 加入黑名单，前端在 `finally` 中清除本地状态。
- 401 处理：`utils/request-auth.js` 单飞刷新令牌并重放原请求（用户无感）；无 refresh token 或刷新失败才清除登录态并跳转首页。
- 写操作按 `openid` 做**资源归属校验**，项目**无角色体系（不使用 RBAC）**；仅后台发货接口要求 `manage_woocommerce` 权限。

### 3.2 个人中心与地址

- `GET /api/user/info` 返回 `user_dto()` 资料；`points` / `memberLevel` / `orderStats` 是 DTO 占位字段，无独立积分模块与页面。
- 设置页提供语言切换、隐私浏览开关与版本信息；帮助中心提供常见问题与反馈入口。
- **收货地址为本地存储**（`pages/address/`，分包），无 `/api/user/addresses` 系列端点；下单时把地址快照随订单提交。

## 4. 购物车与订单

### 4.1 购物车

- 购物车为**本地状态**（`services/cartService.js` + `utils/store.js` + 本地存储），无服务端购物车端点。
- 支持加入、数量调整、勾选、价格合计与清空；结算时把选中项装配为订单 `items`。

### 4.2 订单创建

- `POST /api/order/create`：商品装配 + 库存与可购买性校验 + 收货地址快照；`clientRequestId` 做 10 秒幂等短锁，所有失败路径均释放锁（3.5.12 修复）。
- 订单列表 `/api/order/list`（支持 `status` 过滤）与详情 `/api/order/detail?id=` 仅返回本人订单（openid 归属校验）。
- 状态机：`0` 已取消 / `1` 待付款 / `2` 待发货 / `3` 待收货 / `4` 已完成 / `5` 已退款；共 **6 种状态**。
- `POST /api/order/cancel`：待付款订单取消；已支付订单取消触发整单自动退款。
- `POST /api/order/confirm`：确认收货；`POST /api/order/ship`：商家发货（后台权限）。

### 4.3 订单支付

- 下单后由 `services/payService.js` 串联 `POST /api/pay/prepay` → `wx.requestPayment` → 查单兜底。
- 支付成功但通知丢失时，`POST /api/pay/query` 主动查单与 `Sutwx_Pay_Cron`（每 5 分钟）共同兜底，避免掉单。

## 5. 支付与退款

- 微信支付 V3：JSAPI 预支付、平台证书验签与解密、金额一致性校验、重复通知幂等（终态不回退）。
- `POST /api/pay/notify`、`POST /api/pay/refund-notify` 为免鉴权回调，验签失败返回 `{code:"FAIL"}` 且不落库。
- 退款金额上限等于订单实付，不接受客户端传入金额；退款回调按 `out_refund_no` 落「已退款」。
- **外部依赖**：真实商户号、APIv3 密钥与商户证书尚未联调（见 `docs/tasks.md` INF-004~006），代码实现与 PHP 单测已完成。

## 6. 主题换肤

- 后台「小程序设置」配置 5 套预设（苏铁绿 / 天空蓝 / 暖阳橙 / 紫罗兰 / 石墨黑）与自定义主色、浅色、深色（十六进制校验）。
- `GET /api/theme` 下发配置，`models/theme.js` 解析合并后经 `toCssVars` 转 CSS 变量，作用于导航栏、tabBar 与各页面根容器。
- 后端不可用时回退内置默认预设；配置在 `app.js` 启动时加载并缓存为 `appTheme`。

## 7. 监控与可观测

- 小程序端 `utils/monitor*.js` 共 8 个模块（网络 / FPS / 内存 / 页面加载 / API 采集、自动上报调度、行为标记、配置与工具），`app.js` 通过 `monitorUtil.init()` 启用；`onError` / `onUnhandledRejection` 统一汇聚。develop 环境默认不上报。
- 上报目标 `POST /api/monitor/data`：批量 `data` 最多 20 条，字段白名单与长度上限校验，限频 10 次/分钟。
- 服务端 `includes/class-error-log.php` 落结构化日志（错误码、路由、耗时、脱敏 IP）；REST 错误、鉴权失败、限频命中、支付异常均记录；监控数据逐条落 `monitor` 并汇总 `monitor_batch`。
- `GET /api/health` 返回 `version` / `php` / `wcActive` / `payConfigured`；`health-probe.yml` 每 5 分钟拨测，失败推送企业微信机器人。

## 8. 性能与安全要求

### 8.1 性能

- 请求层 `utils/request.js`：LRU 缓存（50 条 / 5 分钟 TTL）、并发队列（默认 5）、超时 10 秒、失败重试 1 次、取消令牌。
- 分页 `pageSize` 上限 50；主包体积预算 1.5MB（`check:bundle`），`app.json` 配置 `preloadRule` 与 `lazyCodeLoading`，地址/设置/帮助/文章为分包。
- 图片资源由 `check:images` 校验 WXML 中所有 `/images/*` 引用真实存在；微信 `image` 不支持 SVG，新增图标须用 `scripts/generate-ui-icons.js` 生成 PNG。

### 8.2 安全

- 全链路 HTTPS；JWT Bearer 鉴权 + openid 归属校验；无角色体系。
- 限频按端点分档（公开 / 鉴权 / 支付 / 监控），响应带 `X-RateLimit-*` 头。
- 请求层 CSRF 开关与 XSS 清洗（`utils/request-security.js`）；文章正文由 `sanitizeArticleHtml()` 做渲染前清洗。
- 敏感凭证（AppSecret、支付证书、JWT 密钥）不入库，经 `wp-config` 常量或后台设置项配置，支持常量锁定只读；轮换与泄露处置见 [运维规范](../ops/spec.md)。
- 合规前置（未闭环，见 `docs/tasks.md`）：微信《小程序用户隐私保护指引》接入、电商类目资质报备。

## 9. 当前未实现能力

> 以下能力**从未实现**，历史版本功能规范曾以「P1 已完成」描述并配套虚构的 `/api/v1/*` 端点，现已从本规范删除；若后续立项，须先补接口契约与页面，再更新本文。

| 能力 | 现状 | 说明 |
|------|------|------|
| 积分系统 / 积分中心 | 未实现 | `user_dto()` 的 `points` 仅为占位字段，无获取/使用/明细端点与页面 |
| 社交功能（关注 / 点赞 / 评价） | 未实现 | 无对应 Service、页面与端点 |
| 消息通知（订单 / 活动推送） | 未实现 | 无订阅消息与站内信 |
| 优惠券、收藏、商品推荐接口 | 未实现 | 无对应端点 |
| 手机号验证码登录、用户名密码注册 | 未实现且不在规划 | 登录仅微信静默授权 |
| 服务端购物车 / 地址簿 | 未实现 | 均为本地存储 |
| 搜索建议、三级分类独立契约 | 未实现 | 搜索复用商品列表 `keyword` 参数 |

## 10. 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 4.0.0 | 2026-11-07 | 按 `3.5.13` / `0.7.1` 代码实况重写：删除虚构的 `/api/v1/*` 契约与积分/社交/消息通知整章，补齐支付 V3、退款、幂等、掉单兜底、监控链路、主题换肤与 8 项资源/体积门禁，新增「当前未实现能力」清单 | Sut |
| 3.0.0 | 2025-12-27 | 初始功能需求规范（含后续未落地的规划章节） | Sut |
