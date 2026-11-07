# 用户指南与开发者手册

> **文档版本**: v4.0.0
> **更新时间**: 2026-11-07 (UTC+8)
> **对齐版本**: 小程序 `3.5.13` · WordPress 插件 `0.7.1`
> **关联文档**: [文档索引](../../README.md) · [工程规范](../development/spec.md) · [API 规范](../api/spec.md) · [运维规范](../ops/spec.md)

---

## 概述

本仓库包含**小程序端**（`SutWxApp/`，原生 JavaScript）、**WordPress 插件端**（`sutwx-app-api/`，PHP）与仓库根基于 Express 的静态站点预览服务（`server.js`）。插件把 WooCommerce 商品/分类与 WordPress 文章映射为 DTO，经 `/api/*` REST 端点提供给小程序；WordPress 运行时与数据库由站点侧提供，不在本仓库内。

本文分两部分：第一部分面向开发者（环境与代码结构），第二部分面向小程序使用者（操作流程）。

## 第一部分：开发者指南

### 1. 环境与工具

| 项 | 要求 | 说明 |
|----|------|------|
| 微信开发者工具 | 最新稳定版 | 导入、预览、真机调试、上传代码包 |
| Node.js | 20（与 CI 一致） | 运行 ESLint、Jest、构建与校验脚本 |
| npm | 随 Node 附带 | **唯一包管理器**；`SutWxApp/package-lock.json` 已入库，用 `npm ci` |
| PHP | 8.1+（可选） | 跑插件单测；本地无 PHP 时由 CI 的 `php` Job 承担 |
| VS Code | 可选 | 推荐 ESLint 插件；项目**未引入 Prettier**，格式化以 ESLint 与工程规范为准 |
| WordPress + WooCommerce | 站点侧 | 安装 `sutwx-app-api/` 插件后才能联调真实数据 |

> 无需 Bun、TypeScript 编译器、Docker、MySQL 本地实例；历史 `bun.lock` 已清理。

### 2. 本地起步

```bash
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp               # 仓库根下的小程序工程目录
npm ci                    # 安装锁定依赖
npm run ci                # lint + 八项 check + test，提交前必须全绿
```

微信开发者工具「导入项目」时选择**仓库根下的 `SutWxApp/` 目录**（不是仓库根，也不存在 `SutWxApp/SutWxApp`），填写真实 AppID 或使用测试号。

后端对接：插件上传至 `/wp-content/plugins/sutwx-app-api/` 并启用（需先启用 WooCommerce），在「设置 → 固定链接」保存一次刷新 `/api/*` 重写规则。小程序由 `utils/env.js` 按 `develop` / `trial` / `release` 环境自动注入站点根地址（HTTPS），不再手工修改 `app.js` 的 `globalData.baseUrl`。

### 3. 代码结构

```
SutWxApp/
├── app.js / app.json / app.wxss / sitemap.json / project.config.json
├── pages/            # 8 个主包页（home/category/product/cart/order/*/user）
│   └── address/ settings/ help/ article/   # 分包
├── components/       # empty-state、product-card（四件套）
├── services/         # 业务编排：auth/product/category/cart/order/pay/post/theme/address + *.mock.js
├── models/           # DTO 兜底映射：product/post/category/order/theme
├── utils/            # 请求、令牌、监控、i18n、store、richtext、env、离线快照等
├── behaviors/        # 跨页面复用行为
├── styles/           # 全局样式分片（app.wxss 通过 @import 汇聚）
├── scripts/          # check-* 门禁、build/deploy、图标生成、e2e
├── locales/          # zh-CN.json / en-US.json 等运行时词条 + .po/.pot 模板
├── images/           # PNG 图标（微信 image 不支持 SVG）
└── __tests__/        # Jest 用例（10 套件 / 137 用例）

sutwx-app-api/
├── sutwx-app-api.php / readme.txt
├── includes/         # 类与 trait，class-modules.php 为加载清单（顺序敏感）
│   ├── rest/         # 13 个控制器，共 24 个端点
│   ├── mappings/     # map-*.php 输出 DTO
│   ├── auth/ order/ pay/ cache/ rate-limit/
├── admin/            # 主题、支付凭证、轮播设置页
└── tests/            # PHP 8 套件
```

### 4. 分层与调用方式

- **视图层**（`pages/` + `components/`）只负责渲染与交互；**服务层**（`services/`）编排请求；**工具层**（`utils/`）提供请求、缓存、令牌、监控等基础能力；**模型层**（`models/`）做 DTO 兜底映射。
- 所有源码为 JavaScript（CommonJS），使用 `require` / `module.exports`；无 TypeScript、无 `routes/` `controllers/` `repositories/` 后端分层。
- 调用示例（`services/productService.js` 的实际模式）：

```javascript
const request = require("../utils/request");
const { unwrap } = require("../utils/api");

async function getProductList(params) {
  const res = await request.get("/api/product/list", params, { needAuth: false });
  return unwrap(res); // 取出包络中的 data
}
```

- 权限模型：**按 `openid` 做资源归属校验 + Bearer JWT**，无角色体系（不使用 RBAC）；仅后台发货要求 `manage_woocommerce` 权限。

### 5. 常见问题（开发者）

| 问题 | 处理 |
|------|------|
| 微信开发者工具提示「没有找到 app.json」 | 导入目录应为仓库根下的 `SutWxApp/`，不是仓库根 |
| 安装依赖慢或失败 | 统一 `npm`；可切国内镜像 `npm config set registry https://registry.npmmirror.com`；异常时删 `node_modules` 重装。不要用 Bun |
| 接口请求 404 | 小程序端点必须带 `/api` 前缀（后端 rewrite 仅匹配 `^api/`）；确认插件已启用且固定链接已保存刷新 |
| 图片显示破图 | 微信 `image` 不支持 SVG；用 `scripts/generate-ui-icons.js` 生成 PNG，并跑 `npm run check:images` |
| `check` 失败 | 按八项子门禁逐个定位（`check:version` / `config` / `images` / `ids` / `contract` / `bundle` / `plugin-version` / `docs`） |
| 本地无 PHP | 插件单测交由 CI 的 `php` Job（8.1 / 8.3 矩阵）执行 |

## 第二部分：用户操作手册

### 6. 快速入门

首次打开小程序即完成**微信静默授权**（无需注册、无需手机号、无需密码）。首页展示商品流、分类入口与运营轮播；底部 tabBar 可切换首页、分类、购物车、我的。

### 7. 购物指南

1. 首页搜索框输入关键词，或从分类页按分类浏览。
2. 进入商品详情查看价格、规格、库存与图文详情，点击「加入购物车」。
3. 在购物车调整数量、勾选商品，点击「去结算」。
4. 订单确认页选择/填写收货地址（保存在本机），提交订单后调起微信支付。

> 无优惠券、积分抵扣、收藏、评价与商品推荐功能；搜索复用商品列表的 `keyword` 参数，不提供搜索建议。

### 8. 账户与设置

- 个人中心展示微信头像、昵称与订单概览；`points` / `memberLevel` 等为接口占位字段，不对应实际积分或会员体系。
- 设置页可切换语言（简体中文 / 英文）、查看版本信息、设置隐私浏览开关。
- 帮助中心提供常见问题与反馈入口；收货地址在「地址管理」（分包页）增删改，数据保存在本机。

### 9. 订单管理

| 状态 | 含义 | 可执行操作 |
|------|------|-----------|
| 0 | 已取消 | — |
| 1 | 待付款 | 继续支付 / 取消订单 |
| 2 | 待发货 | 等待商家发货（后台 `/api/order/ship`） |
| 3 | 待收货 | 确认收货 |
| 4 | 已完成 | — |
| 5 | 已退款 | — |

共 **6 种状态**。支付结果以服务端通知为准：若支付成功但订单未更新，小程序主动查单与服务端每 5 分钟的定时任务会自动补齐，无需重复付款。已支付订单取消会自动发起整单退款。

### 10. 常见问题（使用者）

| 问题 | 说明 |
|------|------|
| 需要注册账号吗 | 不需要，微信授权即完成登录 |
| 收不到支付结果 | 稍等片刻或下拉刷新订单列表；系统有掉单兜底 |
| 换了手机地址还在吗 | 地址保存在本机，不跨设备同步 |
| 如何切换主题配色 | 由 WordPress 后台配置后下发，小程序自动应用 |
| 断网时能否浏览 | 首页/分类有离线快照降级，下单与支付需联网 |

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 4.0.0 | 2026-11-07 | 按 `3.5.13` / `0.7.1` 代码实况重写：目录树改为真实结构，删除 TypeScript 服务层、RBAC、手机号登录、积分/优惠券等虚构内容；补 `utils/env.js` 多环境配置、八项门禁 FAQ、真实订单状态机与权限模型 | Sut |
| 1.0.0 | 2025-12-27 | 初始版本 | Sut |
