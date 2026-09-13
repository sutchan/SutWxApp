# SutWxApp 项目长期记忆

## 项目概况
- 苏铁微信小程序，位于 `SutWxApp/` 子目录（纯前端原生小程序：WXML/WXSS/JS，无后端代码）。**后端为 WordPress（headless CMS）**，内容经 REST API 提供（`app.js` 的 `globalData.baseUrl`）；当前代码接口约定 `/api/*`、鉴权 `/auth/*`；`productService` 与 `categoryService` 均已支持 `mock`/`woocommerce` 数据源切换（v3.0.11 起分类亦对接 WC），但 `baseUrl` 仍占位未真对接。
- 界面 Apple 极简风格 + 品牌绿（#2E7D32 / #1B5E20 / #F1F8E9）。
- 文档体系：`openspec/`（`specs/` 10 个规范：api/architecture/data/design/development/features/ops/project/testing/user-guide，另有 `archive/`、`项目概述.md`、`README.md`、`AGENTS.md`、`IMPROVEMENTS_REPORT.md`、`TECH_STACK_REPORT.md`、`docs_mapping_plan.md`）。

## 目录约定（2026-09-12 起）
- **原型目录统一为仓库根 `/prototype/`**，含 3 个文件（彼此相对跳转，均为本地文件、无网络依赖）：
  - `prototype/prototype.html`：主原型（设计规范 v3.1.1 + v3.2 动效：骨架屏/Ken Burns/飞入购物车/涟漪/`prefers-reduced-motion`；13 个商品 + 脱敏评价数据；渐变走 `--grad-*` token；原型内部构建版本 v3.1.2）。
  - `prototype/prototype-extra.html`：地址/订单/设置/帮助等二级页。
  - `prototype/wireframes.html`：组件库。
  - 注：文件头注释仍写"单文件自包含 / 无外部依赖"，实际已依赖两个兄弟页（"无外部"= 无 CDN/网络资源），注释轻微过时，未修。
- 已删除根目录 `prototype.html` 重定向占位页；已移除 `openspec/prototype/`（规范目录只放规范文档）。
- 引用主原型时使用相对路径 `prototype/prototype.html`（README「相关文档」已指向该路径）。
- 根目录 `SutWxApp.code-workspace` 受 `.gitignore` 忽略但**必须保留在磁盘，不得删除**。
- 原型审查与修复（2026-09-12）：②`phImg()` 渐变 `id="g"` 经复核为**误报**——其产物均为 `<img src="data:...svg">` 引用，SVG 在图片上下文内隔离解析，`url(#g)` 不会跨图串色，无需修改。①商品详情图轮播**已修复**：dots 绑 `onclick="goDetailSlide(k);startDetailAuto()"`，进入商品页经 `setPage` 启动 `startDetailAuto()` 自动播放（3.5s/张，匹配 `prefers-reduced-motion` 时停止），离开页面 `stopDetailAuto()`；同时 bump 原型构建版本至 v3.1.2（仅改原型内版本徽章与文件头，未动设计规范 v3.1.1 与小程序版本 3.0.4）。P3 项（文件头"单文件自包含"注释因两个兄弟页略过时、可点击元素缺 role/tabindex/aria）维持原型演示级，未改。

## 版本管理
- 版本单一来源：`SutWxApp/package.json` 的 `version` 字段与 `SutWxApp/app.js` 的 `globalData.version`（两者须一致），当前 **3.0.10**（2026-09-13 实测 `npm run check:version` 四处一致通过）。
- 规范文档完成度（2026-09-13 核实）：openspec/specs 共 10 类，已全部有内容——原空文档 `testing`（v1.0.1）、`user-guide`（v1.0.0）已填充；IMPROVEMENTS_REPORT 中建议新增的 `data`（v3.0.1）、`design`（v3.1.1）已新建落地；`design/spec.md` 为 UI 设计权威源（以 app.wxss 代码为事实来源）。IMPROVEMENTS_REPORT.md 自身为 2025-12-27 旧文档，其"测试/用户指南为空、data/design 建议新增"等结论已过时。
- 同步展示位：根 `README.md` 版本徽章（`badge/version-x.y.z`）、`CHANGELOG.md` 顶部新版本小节；由 `npm run check:version` 强制校验（CI 亦拦截）。
- 仅更新被改动文件的 `// 版本号: x.y.z` 头注释，禁止全仓库批量刷写。
- 每次修改至少 bump patch；变更记录写入根 `CHANGELOG.md`（倒序，`## [x.y.z] - YYYY-MM-DD`，无版本比较链接）。
- 踩坑：`CHANGELOG.md` 可能先出现新版本小节而 `package.json`/`app.js`/README 未 bump（3.0.8 即如此，本次已补齐）——写文档前先跑 `npm run check:version` 实查。

## 工程与质量
- 质量门禁在 `SutWxApp/package.json`：`npm run lint`（eslint .，ESLint 10 纯声明式扁平配置 `eslint.config.js`，无 `--ext`）、`npm test`（jest，testMatch `**/__tests__/**/*.test.js`，`__tests__/` 下为纯函数单测）、`npm run check`（版本+配置校验）、`npm run ci`（= lint + check + test）。
- **ESLint 基线（2026-09-12 实测）**：0 error / 11 warning（warning 全是 `eqeqeq` 松比较，属 dataset 字符串场景，故意保留）。若出现 error，优先检查：`__tests__` 的 `env.jest`、globals（`Behavior`/`getCurrentPages`/`window`/`requestAnimationFrame`）、`utils/compress-images.js` 的 Node ESM override 是否被覆盖。
- 单测基线：5 suites / 32 tests 通过，语句覆盖率 ~82%（`npm run test:coverage`）。
- 源文件单文件 ≤200 行，超出按职责拆分（如 `pages/product/parts.js`、`pages/home/utils.js`）。
- 约定为业务逻辑加中文注释，未启用 i18n 代码层（多语言走 `locales/` 的 .po/.pot）。
- `SutWxApp/images/tabbar/` 现由 `scripts/generate-tabbar-icons.js`（无依赖 PNG 光栅化）生成 8 个品牌线性图标（home/category/cart/user × 未选中灰 #9E9E9E / 选中绿 #2E7D32，81×81），覆盖原占位图（v3.0.12）。

## CI/CD（2026-09-12 落地，v3.0.8）
- `.github/workflows/ci.yml`：push（main/dev/feature/fix/hotfix）+ PR + 手动；jobs = `lint` / `test`（`test:coverage` + 覆盖率 Artifact）/ `checks`（纯 Node 校验，无需装依赖）；Node 20、npm 缓存指向 `SutWxApp/package-lock.json`、`defaults.run.working-directory: SutWxApp`、concurrency 取消旧运行。
- `.github/workflows/release.yml`：推送 `v*.*.*` Tag（或手动输入 tag）→ 校验 Tag 与版本一致 → 抽 `CHANGELOG.md` 小节（`scripts/changelog-section.js`）→ `softprops/action-gh-release@v2`。仓库目前**尚无 Tag**。
- `.github/workflows/miniprogram-deploy.yml`：`workflow_dispatch`（preview/upload）→ 私钥写 `$RUNNER_TEMP` → `npm install --no-save miniprogram-ci@^2` → `node scripts/deploy.js` → 结束清理私钥。Secret：`MINIPROGRAM_PRIVATE_KEY`（必填）、`MINIPROGRAM_APPID`（`project.config.json` 仍为占位 `touristappid` 时必填）。**尚未在 GitHub 上真实执行过**。
- `.github/dependabot.yml`：npm（`/SutWxApp`）+ github-actions，每周一 09:00 Asia/Shanghai。
- 校验脚本：`SutWxApp/scripts/check-version.js`、`SutWxApp/scripts/check-config.js`（JSON 可解析/页面 js+wxml 必需/tabBar 图标 ≤40KB/sitemap/未引用页面告警）；`SutWxApp/scripts/deploy.js`；仓库根 `scripts/changelog-section.js`。
- `project.config.json` 的 `packOptions.ignore` 忽略 `__tests__`/`scripts`/`node_modules`/`coverage`/`package*.json`/`.eslintrc.js`/`utils/compress-images.js`（与 deploy.js 的 ignores 保持一致）；`.gitignore` 屏蔽上传私钥与 `preview.jpg`。
- 仓库根 `/tests`（.ts/.js）被 `.gitignore` 忽略，是本地遗留、不参与 CI；真实测试在 `SutWxApp/__tests__/`。
- 本仓库存在**自动提交机制**：会话过程中会自动 commit（如 `ci: 新增 CI/CD 流水线与版本配置校验`）。副作用：排查时产生的临时输出文件（`SutWxApp/ci-*.txt`）曾被一并提交，需事后用 node 脚本删除。

## WordPress 后端对接（参考实现）
- 项目以 WordPress 为后端（headless CMS），在微信侧优化排版显示网站内容（文章/商品等）。
- 经典开源参考：**微慕 Minapper / Watch-Life**（`https://github.com/iamxjb/winxin-app-watch-life.net`），配套 WP 插件 `rest-api-to-miniprogram`（gitee：iamxjb/rest-api-to-miniprogram）。
- 真实对接形态（来自参考项目源码）：配套 WP 插件在 WP 侧注册**自定义 REST 命名空间**（如 `wp-json/minapper/v1/`、`wp-json/watch-life-net/v1/`），小程序直接调用该命名空间路由（如 `posts`/`categories`/`comments`/`wechatshop/product/getlist`），而非裸 `wp-json/wp/v2/`；核心 `wp-json/wp/v2/` 亦可复用。
- 鉴权：典型为微信 `wx.login` 拿 code → 插件签发 token（非通用 JWT）；用户以 openid 关联 WP 用户。
- 文章 HTML 渲染：参考项目用 `wxParse`（HTML→WXML）；本项目 `utils/request.js` 的 `sanitizeHtml()` 做接口字段清洗（激进移除所有 src/href）。文章正文渲染层已接入（v3.0.12）：`utils/richtext.js` 的 `sanitizeArticleHtml` 仅保留安全 `img`/`a`（http(s)），`pages/article/detail` 用 `rich-text` 组件渲染，`postService` 经 `globalData.productSource` 切换 mock/woocommerce。
- 本项目当前用自定义 `/api/*` + `/auth/*`（占位 baseUrl、部分 mock），属于"插件/代理命名空间"的等价约定；接入真实 WP 时建议采用插件命名空间方案并补齐渲染层。
- 已落地 WooCommerce 商品支持（v3.0.6）：`SutWxApp/models/product.js` 的 `mapWooCommerceProduct` 将 WC 商品（`wp-json/wc/v3/products`）映射为统一商品 DTO（price/originPrice/images/category/stock/sku/specs/rating/description 等）；`services/productService.js` 用 `globalData.productSource`（`mock` 默认 / `woocommerce`）切换数据源，WooCommerce 路径调 `/api/product/list`、`/api/product/detail`（由配套 WP 插件映射）；详情页 `pages/product/index.js` 改为经 `productService.getProductDetail` 获取。单测 `__tests__/product.mapper.test.js`。
- 已落地 WooCommerce 分类对接（v3.0.11）：`models/category.js` 的 `mapWooCommerceCategory`/`mapWooCommerceCategories` 将 WC 分类（`wp-json/wc/v3/products/categories` 或插件 `/api/category/list`）映射为统一分类 DTO（id/name/icon/count/parentId/slug/permalink）；`categoryService.js` 经 `globalData.productSource` 切换，`woocommerce` 路径调 `/api/category/list`、`/api/category/detail`，演示数据抽至 `categoryService.mock.js`；单测 `__tests__/category.mapper.test.js`。

- 已落地主题换肤（v3.0.7）：`SutWxApp/models/theme.js` 内置 5 套默认配色预设（`THEME_PRESETS`：sut-green/sky-blue/sunny-orange/violet/graphite），`resolveTheme({presetId,custom})` 合并后台自定义色值，`toCssVars` 生成对应 `app.wxss` CSS 变量的声明字符串；`services/themeService.js` 从 `/api/theme` 拉取（缓存优先、失败回退默认）并经 `globalData.theme`/`themeStyle` + `wx.setNavigationBarColor`/`wx.setTabBarStyle` 全站下发；`behaviors/theme.js` 注入页面根容器 `style="{{themeStyle}}"`，`app.js` 启动加载。配套 WP 插件实现 `/api/theme`（返回 `presetId` 或 `custom` 色值）。category/cart/order 等 wxml 为 HTML 实体转义存储，编辑须用属性片段精确匹配。

- 原型截图流程（README 界面预览）：用缓存 Chromium（`C:\Users\Admin\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe`）+ `playwright-core` 渲染 `prototype/prototype.html`，`switchTab()/openProduct()/goOrder()` 切屏后截取 `.phone` 元素存至 `docs/screenshots/`（home/category/product/cart/order/user + theme-green/blue/orange）。临时依赖装在仓库外 `.shots/`，用完删除，勿提交。

## 工具链坑（Windows/PowerShell）
- `node -e "..."` 内嵌正则/中文易被 PowerShell 破坏，复杂脚本改用临时 `.mjs` 文件。
- `git mv` 到不存在的目录会失败（需先建目录）；移动后若源路径残留文件，需实查磁盘状态。
- 会话间隙项目可能被外部（并行会话/用户）大改：动文件前先实查磁盘真实内容与版本，勿信旧快照。
