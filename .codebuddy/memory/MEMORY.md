# SutWxApp 项目长期记忆

## 项目与架构
- 苏铁/苏小糖微信小程序。小程序代码在仓库 `SutWxApp/` 子目录（原生 WXML/WXSS/JS，纯前端 CommonJS）；仓库根另有静态展示站（`build.js`/`server.js`/`index.html`/`prototype/`）与 WordPress 插件 `sutwx-app-api/`。
- 后端为 **WordPress（headless CMS）**，REST 约定 `/api/*` + 鉴权 `/auth/*`，由 `app.js` 的 `globalData.baseUrl` 提供。当前默认数据源 `productSource:"mock"`，可切 `woocommerce`。
- 界面 Apple 极简 + 品牌绿（#2E7D32 / #1B5E20 / #F1F8E9）。
- 文档体系 `openspec/`（`specs/` 10 类）；`design/spec.md` 为 UI 权威源（以 `app.wxss` 为事实）。
- WP 对接：WooCommerce 商品/分类、主题换肤、文章渲染。公共模块：`utils/text.js`、`utils/api.js`（`unwrap` 解包 `{code,data}`）、`services/dataSource.js`（`getDataSource`）。

## 版本（单一来源）
- 权威：`SutWxApp/package.json` 的 `version` 与 `SutWxApp/app.js` 的 `globalData.version`，当前 **3.4.1**（`npm run check:version` 校验 4 处：两者 + README 徽章 + CHANGELOG 首个数字小节）。
- 展示位同步：README 徽章、CHANGELOG 顶节；根 `package.json` 版本一并同进。
- 每次改动 bump 最小版本（patch）；**仅更新被改文件的 `// 版本号:` 头注释**，禁止全仓库批量刷写。改文档前先实查版本（会话间隙常被外部 bump）。
- `scripts/check-version.js` 读取 REPO_ROOT=仓库根、PROJECT_ROOT=SutWxApp。

## 原型目录
- 统一为仓库根 `/prototype/`（`prototype.html` 主 + `prototype-extra.html` 二级页 + `wireframes.html` 组件库，彼此相对跳转、无 CDN）。截图流程：Chromium + `playwright-core` 渲染 `.phone` 存 `docs/screenshots/`。

## 后端插件 sutwx-app-api（独立版本 0.3.0，2026-09-13 立项，P0/P1/P2 已落地）
- 入口声明 `Requires Plugins: woocommerce`；`sutwx/v1` 命名空间 + rewrite `/api/*` → `rest_route=/sutwx/v1/$1`；响应包络 `{code,message,data,timestamp,requestId}`（pageSize≤50）。
- 决策基线：商品数据源=WooCommerce；v1=只读 MVP（内容免登录）；鉴权=wx.login→JWT（基建本期落地，内容端点仍公开）；订单/支付本期不做仅预留契约。
- P2：`class-settings.php`（`THEME_PRESETS` 5 套 / `THEME_KEYS` 11 字段，与 `SutWxApp/models/theme.js` 严格对齐）+ 后台「设置 → 小程序设置」页 + 颜色校验器。预设/字段为双向同步事实源。
- 小程序实际公开端点：`/api/product/{list,detail}`、`/api/post/{list,detail}`、`/api/category/{list,detail}`、`/api/theme`。
- **本机无 PHP 环境**：`php -l` 与 `php tests/run-*-tests.php` 无法本地跑，靠人工审查 + CI（PHP 8.1/8.3 矩阵）保证。

## 工程与质量
- 门禁：`npm run lint`（eslint 10 纯声明式 flat config，**零外部 require**；规则集/全局变量已抽至 `eslint.presets.js`）/ `npm test`（jest，`tests/**/*.test.js`）/ `npm run check`（版本+配置）/ `npm run ci`（lint+check+test）。
- **jest 已有真实用例**（2026-10-02 修正）：仓库根 `tests/` 下 `integration.test.js`/`store.test.js`/`request.test.js` 三套真实 Jest 用例（共 92 例，77 通过）；其中 `request.test.js` 15 例失败（根因见 daily `2026-10-02.md`：401 跳转目标 bug + 无 token 阻断匿名请求 + 测试拦截器污染/mock 写法/错误对象契约）。`--passWithNoTests` 已失必要性但可保留防退化；覆盖率 ≥80% 未强制。
- **ESLint 关键坑**：eslint 10 已把 `@eslint/js`/`globals`/`@eslint/eslintrc` 移出运行时依赖，配置必须**自包含**（规则与全局变量全内联）。基线 0 error / 12 warning（全 `eqeqeq`，故意保留）。
- 源文件 `.js` 单文件 **≤200 行**（超出按职责拆分；已拆：`monitor-*`、`request-queue`/`request-methods`、`productService.mock` 等）。
- `images/tabbar/` 由 `scripts/generate-tabbar-icons.js` 生成。

## Git 推送流程（实测）
- 本地活动分支 **`dev`**，其上游 = **`origin/main`**（`git branch -vv` 显示 `[origin/main: ahead N]`）。团队把 `dev` 直接推到 `origin/main`。
- **勿用 `git push origin main`**（本地 `main` 陈旧，报 `src refspec main does not match any`）。正确：`git push origin dev:main`。
- 会话间隙常由外部在 `dev` 上 bump 版本；提交前先 `git status` 确认范围。

## CI/CD
- `.github/workflows/`：`ci.yml`（lint/test/checks/site/php 五 Job）、`release.yml`（推 `v*.*.*` Tag 发 Release，附 site/miniprogram 插件三份 zip）、`miniprogram-deploy.yml`（手动 + miniprogram-ci）、`site.yml`（Pages 发布）。`release` 抽 CHANGELOG 用 `scripts/changelog-section.js`。
- **CI 缓存依赖**：`ci.yml`/`miniprogram-deploy.yml` 用 `cache: npm` + `cache-dependency-path: SutWxApp/package-lock.json`；该 lockfile **必须入库**（曾因未提交报 `Some specified paths were not resolved, unable to cache dependencies`，commit `dbe1a81` 恢复后解决）。
- `project.config.json` 的 `packOptions.ignore` 须与部署 ignores 一致（含 `eslint.config.js`/`eslint.presets.js`/`package*.json`/`scripts`/`__tests__`/`node_modules`/`coverage`/`utils/compress-images.js`）。
- 仓库存在**自动提交机制**；临时文件 `*.txt` 已被 .gitignore 忽略。

## 小程序运行时已知缺陷
- （v3.0.13 已修）WXML 实体转义、首页/用户页 JS↔WXML 契约、跳转目标缺失、require 越级。
- （v3.0.14 已修）`unwrap`×3 / 数据源判定×3 / `stripHtml`×3 / `toNumber`×2 重复代码已抽公共模块。
- （v3.4.1 已修）**地址页服务引用错配**：`pages/address/*` 曾 `require` authService 却调用仅存在于 addressService 的地址方法 → 运行时 `TypeError`；现改 `addressService` + Promise/`await`，`addressService` 全部响应 `unwrap`。
- 遗留：`.wxss`/部分 `.wxml` >200 行（`.js` 均 ≤200）；appid `touristappid`、`baseUrl https://api.example.com`、大量 `/images/placeholder.svg`；支付/物流/客服/评价/登录为"开发中"占位。
- `utils/request.js` 的 `process.env.NODE_ENV` 由 `typeof process !== "undefined"` 守卫，小程序运行时安全。

## 工具链坑（Windows/PowerShell）
- PowerShell 不支持 bash 的 `for ... do ... done` 循环；统计行数/批量处理改用 `node -e` 或临时 `.mjs` 脚本。
- `node -e "..."` 内嵌 `$`/正则/中文易被 PowerShell 破坏；长任务/文件操作用 node 脚本绕过。
- 会话间隙项目可能被外部大改：动文件前先实查磁盘真实内容与版本，勿信旧快照。

## 用户偏好（跨项目）
- 始终中文、回复精简。
- 源文件 >200 行须拆分；**文档文件不拆分**。
- 每次改动 bump 最小版本，仅更新被改文件头注释，禁止全仓库批量刷写。
- 为关键 DOM/容器添加语义化 id。
- 推荐回复（Suggestions）保持使用中文显示。
- 加载与等待卡片（如 "Enjoy these tips while you wait" 等提示）保持使用中文显示。
- 具备自动诊断与自我修复应用问题（编译/Lint/运行时错误自动修复）的自动化规程。
