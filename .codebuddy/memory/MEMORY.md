# SutWxApp 项目长期记忆

## 项目与架构
- 苏铁微信小程序，代码在 `SutWxApp/`（原生 WXML/WXSS/JS，纯前端）。后端为 **WordPress（headless CMS）**，REST 约定 `/api/*` + 鉴权 `/auth/*`，由 `app.js` 的 `globalData.baseUrl` 提供。当前默认数据源 `productSource:"mock"`，可切 `woocommerce`。
- 界面 Apple 极简 + 品牌绿（#2E7D32 / #1B5E20 / #F1F8E9）。
- 文档体系 `openspec/`（`specs/` 10 类 + 多个 md）；`design/spec.md` 为 UI 权威源（以 `app.wxss` 为事实）。
- WP 对接已落地：WooCommerce 商品（`models/product.js` mapWooCommerceProduct，v3.0.6）、分类（`models/category.js`，v3.0.11）、主题换肤（v3.0.7，`models/theme.js`+`themeService.js`+`behaviors/theme.js`）、文章渲染（v3.0.12，`utils/richtext.js`+`models/post.js`+`services/postService.js`+`pages/article/{list,detail}`）。
- 去重公共模块（v3.0.14 抽出）：`utils/text.js`（`toNumber`/`stripHtml`）、`utils/api.js`（`unwrap`）、`services/dataSource.js`（`getDataSource`）；各 service/model 改引用，导出契约不变。

## 版本（单一来源）
- 权威：`SutWxApp/package.json` 的 `version` 与 `SutWxApp/app.js` 的 `globalData.version`，当前 **3.1.0**（`npm run check:version` 校验）。展示位同步 README 徽章 + `CHANGELOG.md` 顶节。
- 每次改动 bump 最小版本（≥patch）；仅更新被改文件的 `// 版本号:` 头注释，禁止全仓库批量刷写。改文档前先实查版本（会话间隙常被外部 bump）。

## 原型目录
- 统一为仓库根 `/prototype/`（`prototype.html` 主 + `prototype-extra.html` 二级页 + `wireframes.html` 组件库，彼此相对跳转、无 CDN）。引用用相对路径 `prototype/prototype.html`。
- 截图流程：缓存 Chromium + `playwright-core` 渲染后截 `.phone` 元素存 `docs/screenshots/`；临时依赖装仓库外 `.shots/`，用完删。

## 后端插件（2026-09-13 立项并落地 P0，插件独立版本 0.1.0）
- 插件名 `sutwx-app-api`（独立 WP 插件，自研不依赖微慕），代码在仓库根 `sutwx-app-api/`。规范 `openspec/specs/backend/spec.md`，开发计划 `docs/wordpress-plugin/DEVELOPMENT_PLAN.md`。
- 决策基线（已与产品确认）：① 商品数据源=**WooCommerce**；② v1=**只读 MVP**（文章/商品/分类/主题，全部免登录）；③ 鉴权=**wx.login→JWT**（基建本期落地，内容端点仍公开）；④ 订单/支付=**本期不做，仅预留契约**。
- **P0 已落地（v3.1.0）**：入口声明 `Requires Plugins: woocommerce`；常量 `SUTWX_API_REST_NS=sutwx/v1`、`SUTWX_API_THEME_OPTION=sutwx_theme`；`class-loader.php` 注册路由 + `/api/*`→`rest_route=/sutwx/v1/$1` 重写 + 激活 flush + 默认主题 option；`class-rest-base.php` 提供 `{code,message,data,timestamp,requestId}` 包络与分页规整（pageSize≤50）；7 路由骨架中 `theme` 已真实返回 `{"presetId":"sut-green"}`（P0 验收达成），其余 6 个为占位。本机无 PHP，`php -l` 未跑。
- 小程序实际公开端点：`/api/product/{list,detail}`、`/api/post/{list,detail}`、`/api/category/{list,detail}`、`/api/theme`（均在 `services/*.js` + `models/*.js` 有映射，DTO 字段见 backend/spec.md）。`utils/api.unwrap` 兼容 `{code,data}` 包络或裸数据。
- 命名空间映射：插件注册 `sutwx/v1` + rewrite `/api/*` → `rest_route=/sutwx/v1/$1`（推荐，使 spec 路径即真实路径）；备选直连 `wp-json/sutwx/v1`。预设列表（`sut-green` 等 5 套）须与 `models/theme.js` 同步。
- **P0 待办**：本地 WP+WC 测试环境就绪（含示例商品/文章/分类）。**P1**：`mappings/map-{product,post,category}.php` + 6 端点真实回调 + 映射单测。

## 工程与质量
- 门禁：`npm run lint`（eslint 10 纯声明式 flat config `eslint.config.js`，**零外部 require**）/ `npm test`（jest，`__tests__/**/*.test.js`）/ `npm run check`（版本+配置）/ `npm run ci`（lint+check+test）。
- **ESLint 关键坑**：eslint 10 已把 `@eslint/js`/`globals`/`@eslint/eslintrc` 移出运行时依赖，`npm ci` 树无这些包；配置必须**自包含**（recommended 规则与全局变量全内联，`__tests__` 内联 jest 全局）。基线 0 error / 12 warning（全 `eqeqeq`，故意保留）。升级 ESLint 主版本勿依赖 `@eslint/js`/FlatCompat。
- 源文件 `.js` 单文件 ≤200 行，超出按职责拆分（如 `pages/product/parts.js`、`pages/home/utils.js`）。
- `images/tabbar/` 由 `scripts/generate-tabbar-icons.js` 生成 8 个品牌线性 PNG（v3.0.12）。

## CI/CD（v3.0.8 落地）
- `.github/workflows/`：`ci.yml`（lint/test/checks）、`release.yml`（推 `v*.*.*` Tag 发 GitHub Release）、`miniprogram-deploy.yml`（`workflow_dispatch` + miniprogram-ci，Secret `MINIPROGRAM_PRIVATE_KEY`/`MINIPROGRAM_APPID`）。`release` 抽 CHANGELOG 小节用 `scripts/changelog-section.js`。**仓库尚无 Tag，deploy 未真实跑过。**
- `project.config.json` 的 `packOptions.ignore` 与 `scripts/deploy.js` ignores 须一致（曾列已删的 `.eslintrc.js`，应改 `eslint.config.js`）。
- 仓库存在**自动提交机制**（会话中自动 commit）；临时文件 `SutWxApp/ci-*.txt` 曾被误提交，事后用 node 脚本删。

## 小程序运行时已知缺陷（2026-09-13 审查，逐条实测；需后续修复）
- P0：① 7 个 WXML 被 HTML 实体转义（`&lt;view`）：`pages/category|cart/index.wxml`、`pages/order/{index,detail,confirm}.wxml`、`components/{product-card,empty-state}/index.wxml` → 无法渲染（category/cart 是 tabBar 页）。② 首页 JS↔WXML 契约不符（WXML 用 `categoryList/currentCategory/productList`+`handleSearchBarTap/handleFavorite/handleShare`；JS 用 `categories/selectedCategory/products`+`handleSearchTap`）。③ 用户页同理（WXML 引 `handleLogin/handlePointsTap/handleFollowingTap/handleFollowersTap/handleLogout/followStats`+`userInfo.avatar/nickname`；JS 未定义且字段为 `nickName/avatarUrl`）。④ 请求层 `baseURL:""` 且 `setBaseURL` 无调用、服务层用相对 `/api/*`。⑤ `pages/settings|address/index.js` require 越级 `../../../services/authService`（应 `../../`）。⑥ 跳转目标不存在：`/pages/product/detail`（实际 `pages/product/index`）、`/pages/search/index`、`/pages/auth/login`、`/pages/product/poster`、`/pages/settings/{password,phone,about,feedback}/index`。（**P0 ①~⑥ 已于 v3.0.13 全部修复**）
- P1/P2：`utils/richtext.js` 把 `</a>` 无条件换 `</span>`；`models/post.js:24` 正则 `/\\s+/`（应 `/\s+/`）；`components/` 两组件无人引用；`pages/user/index.wxml` 硬编码"苏铁 v1.0.18"；`utils/request.js:72` 用 `process.env.NODE_ENV`（小程序无 `process` 全局风险）；重复代码（`unwrap`×3、数据源判定×3、`stripHtml`×3、`toNumber`×2）。（**richtext/post/request/version/两组件 项已于 v3.0.13 修复；重复代码 unwrap×3/数据源判定×3/stripHtml×3/toNumber×2 已于 v3.0.14 抽出公共模块**）
- P3：`.wxss`/部分 `.wxml` >200 行（`.js` 均 ≤200）；`project.config.json` ignore 漂移；appid `touristappid`/baseUrl `api.example.com`/大量 `/images/placeholder.svg`；支付/物流/客服/评价/登录为"开发中"占位。

## 工具链坑（Windows/PowerShell）
- `node -e "..."` 内嵌正则/中文易被 PowerShell 破坏 → 改临时 `.mjs` 文件；长任务/文件操作用 node 脚本绕过。
- 会话间隙项目可能被外部（并行会话/用户）大改：动文件前先实查磁盘真实内容与版本，勿信旧快照。
- `category/cart/order` 等 wxml 实体转义存储，编辑须用属性片段精确匹配（勿整段替换引入二次转义）。
