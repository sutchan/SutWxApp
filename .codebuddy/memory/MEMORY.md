# SutWxApp 项目长期记忆

## 项目概况
- 苏铁微信小程序，位于 `SutWxApp/` 子目录（纯前端原生小程序：WXML/WXSS/JS，无后端代码）。**后端为 WordPress（headless CMS）**，内容经 REST API 提供（`app.js` 的 `globalData.baseUrl`）；当前代码接口约定 `/api/*`、鉴权 `/auth/*`，但 `productService`/`categoryService` 仍为 mock、baseUrl 占位未真对接。
- 界面 Apple 极简风格 + 品牌绿（#2E7D32 / #1B5E20 / #F1F8E9）。
- 文档体系：`openspec/`（`specs/` 10 个规范：api/architecture/data/design/development/features/ops/project/testing/user-guide，另有 `archive/`、`项目概述.md`、`README.md`、`AGENTS.md`、`IMPROVEMENTS_REPORT.md`、`TECH_STACK_REPORT.md`、`docs_mapping_plan.md`）。

## 目录约定（2026-09-12 起）
- **原型目录统一为仓库根 `/prototype/`**：唯一原型文件 `prototype/prototype.html`（单文件自包含，所有样式/脚本/图形内联，无外部资源引用）。
- 已删除根目录 `prototype.html` 重定向占位页；已移除 `openspec/prototype/`（规范目录只放规范文档）。
- 引用原型时使用相对路径 `prototype/prototype.html`（README「相关文档」已指向该路径）。
- 根目录 `SutWxApp.code-workspace` 受 `.gitignore` 忽略但**必须保留在磁盘，不得删除**。

## 版本管理
- 版本单一来源：`SutWxApp/package.json` 的 `version` 字段与 `SutWxApp/app.js` 的 `globalData.version`（两者须一致），当前 **3.0.4**。
- 同步展示位：根 `README.md` 版本徽章、`CHANGELOG.md` 顶部新版本小节。
- 仅更新被改动文件的 `// 版本号: x.y.z` 头注释，禁止全仓库批量刷写。
- 每次修改至少 bump patch；变更记录写入根 `CHANGELOG.md`（倒序，`## [x.y.z] - YYYY-MM-DD`，无版本比较链接）。

## 工程与质量
- 质量门禁在 `SutWxApp/package.json`：`npm run lint`（eslint . --ext .js）、`npm test`（jest，testMatch `**/__tests__/**/*.test.js`，`__tests__/` 下为纯函数单测）。
- 源文件单文件 ≤200 行，超出按职责拆分（如 `pages/product/parts.js`、`pages/home/utils.js`）。
- 约定为业务逻辑加中文注释，未启用 i18n 代码层（多语言走 `locales/` 的 .po/.pot）。

## WordPress 后端对接（参考实现）
- 项目以 WordPress 为后端（headless CMS），在微信侧优化排版显示网站内容（文章/商品等）。
- 经典开源参考：**微慕 Minapper / Watch-Life**（`https://github.com/iamxjb/winxin-app-watch-life.net`），配套 WP 插件 `rest-api-to-miniprogram`（gitee：iamxjb/rest-api-to-miniprogram）。
- 真实对接形态（来自参考项目源码）：配套 WP 插件在 WP 侧注册**自定义 REST 命名空间**（如 `wp-json/minapper/v1/`、`wp-json/watch-life-net/v1/`），小程序直接调用该命名空间路由（如 `posts`/`categories`/`comments`/`wechatshop/product/getlist`），而非裸 `wp-json/wp/v2/`；核心 `wp-json/wp/v2/` 亦可复用。
- 鉴权：典型为微信 `wx.login` 拿 code → 插件签发 token（非通用 JWT）；用户以 openid 关联 WP 用户。
- 文章 HTML 渲染：参考项目用 `wxParse`（HTML→WXML）；本项目 `utils/request.js` 的 `sanitizeHtml()` 做安全清洗，渲染层待补（建议 rich-text / towxml / wxParse）。
- 本项目当前用自定义 `/api/*` + `/auth/*`（占位 baseUrl、部分 mock），属于"插件/代理命名空间"的等价约定；接入真实 WP 时建议采用插件命名空间方案并补齐渲染层。
- 已落地 WooCommerce 商品支持（v3.0.6）：`SutWxApp/models/product.js` 的 `mapWooCommerceProduct` 将 WC 商品（`wp-json/wc/v3/products`）映射为统一商品 DTO（price/originPrice/images/category/stock/sku/specs/rating/description 等）；`services/productService.js` 用 `globalData.productSource`（`mock` 默认 / `woocommerce`）切换数据源，WooCommerce 路径调 `/api/product/list`、`/api/product/detail`（由配套 WP 插件映射）；详情页 `pages/product/index.js` 改为经 `productService.getProductDetail` 获取。单测 `__tests__/product.mapper.test.js`。

- 已落地主题换肤（v3.0.7）：`SutWxApp/models/theme.js` 内置 5 套默认配色预设（`THEME_PRESETS`：sut-green/sky-blue/sunny-orange/violet/graphite），`resolveTheme({presetId,custom})` 合并后台自定义色值，`toCssVars` 生成对应 `app.wxss` CSS 变量的声明字符串；`services/themeService.js` 从 `/api/theme` 拉取（缓存优先、失败回退默认）并经 `globalData.theme`/`themeStyle` + `wx.setNavigationBarColor`/`wx.setTabBarStyle` 全站下发；`behaviors/theme.js` 注入页面根容器 `style="{{themeStyle}}"`，`app.js` 启动加载。配套 WP 插件实现 `/api/theme`（返回 `presetId` 或 `custom` 色值）。category/cart/order 等 wxml 为 HTML 实体转义存储，编辑须用属性片段精确匹配。

## 工具链坑（Windows/PowerShell）
- `node -e "..."` 内嵌正则/中文易被 PowerShell 破坏，复杂脚本改用临时 `.mjs` 文件。
- `git mv` 到不存在的目录会失败（需先建目录）；移动后若源路径残留文件，需实查磁盘状态。
- 会话间隙项目可能被外部（并行会话/用户）大改：动文件前先实查磁盘真实内容与版本，勿信旧快照。
