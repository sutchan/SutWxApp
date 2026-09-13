# Changelog

所有重要的项目变更都将记录在此文件中。

## [Unreleased]

### 文档（后端插件规划）
- 新增 `openspec/specs/backend/spec.md`：定义配套 WordPress 插件 `sutwx-app-api` 的架构、目录结构、REST 命名空间映射（`/api/*` ↔ `wp-json/sutwx/v1`）、v1 只读端点契约（商品/文章/分类/主题）、主题后台配置、鉴权与订单预留、安全/缓存/部署要求。
- 新增 `docs/wordpress-plugin/DEVELOPMENT_PLAN.md`：后端插件分阶段开发计划（P0 脚手架 → P1 只读 MVP → P2 主题配置 → P3 鉴权基建 → P4 联调测试 → P5 订单支付预留），含技术决策、验收与风险对策。
- 完善 `openspec/specs/api/spec.md`：补全缺失的「文章 API」「分类 API」契约（与 `services/{post,category}Service.js`、`models/{post,category}.js` 对齐），并新增「端点与后端命名空间映射」说明与后续阶段标注。
- 更新 `openspec/README.md`、`README.md` 索引，链接后端规范与插件开发计划。

## [3.0.14] - 2026-09-13

### 重构（去重，导出契约不变）
- 抽出公共模块：`utils/text.js`（`toNumber`/`stripHtml`）、`utils/api.js`（`unwrap`）、`services/dataSource.js`（`getDataSource`）。
- `services/{product,category,post,theme}Service.js` 移除本地 `unwrap` / `getXxxSource`，改引用共享模块；调用处 `getXxxSource()==="woocommerce"` 统一为 `getDataSource()==="woocommerce"`。
- `models/{product,category}.js` 移除本地 `toNumber` / `stripHtml`；`models/post.js` 的 `stripHtmlToText` 改用共享 `stripHtml`（保留同名导出别名）。既有单测依赖的 `module.exports` 导出名保持不变。

## [3.0.13] - 2026-09-13

### 修复（运行时可用性与一致性）

- 解码 7 个被 HTML 实体转义的 WXML（`pages/category|cart/index.wxml`、`pages/order/{index,detail,confirm}.wxml`、`components/{product-card,empty-state}/index.wxml`），恢复页面可渲染。
- 对齐首页与用户页 JS↔WXML 契约（字段名与方法名），补全缺失事件处理函数，修复分类/商品列表为空问题。
- 修复 `pages/settings|address/index.js` 的 require 越级（`../../../services` → `../../services`）。
- 接线请求层 `baseURL`（`app.js` 启动时注入 `globalData.baseUrl`，`buildRequestConfig` 拼接相对路径），并守卫 `process.env` 访问避免小程序环境抛错。
- 修复失效跳转目标：`/pages/product/detail` → `pages/product/index`；`/pages/auth/login` → `pages/user/index`；不存在的 `search/poster/settings` 子页改为「功能开发中」提示。
- 修复 `utils/richtext.js` 锚点闭合标签不匹配（`<a>` 整体配对处理）与 `models/post.js` 空白折叠正则转义错误。
- 修正 `project.config.json` 的 `packOptions.ignore`（已删的 `.eslintrc.js` → `eslint.config.js`）。
- 用户页版本文案「苏铁 v1.0.18」→「苏铁 v3.0.13」。

## [3.0.12] - 2026-09-13

### 变更内容

#### 文章 HTML 渲染层（WordPress 内容展示）
- 新增 `utils/richtext.js`：`sanitizeArticleHtml` 文章正文安全清洗，保留 `<img src>`/`<a href>`（仅 http(s)），移除危险标签/事件属性/危险协议；区别于 `request-security.sanitizeHtml`（激进移除所有 src/href，用于接口字段）。
- 新增 `models/post.js`（`mapWpPost`/`mapWpPosts`）与 `services/postService.js`（mock/woocommerce 切换，调 `/api/post/list`、`/api/post/detail`），演示数据抽至 `postService.mock.js`。
- 新增文章列表页与详情页 `pages/article/{list,detail}`，详情页用 `rich-text` 渲染安全清洗后的 HTML；`app.json` 分包注册两页，`pages/help/index` 增加「养护文章」入口。

#### tabBar 图标
- 新增 `scripts/tabbar-icons/`（draw.js 无依赖 PNG 编码器 + shapes.js 形状定义）与 `scripts/generate-tabbar-icons.js`，生成 8 个品牌线性 PNG 图标（home/category/cart/user × 灰/绿）覆盖原占位图（微信原生 tabBar 仅支持本地 PNG）。

## [3.0.11] - 2026-09-13

### 变更内容

#### 后端对接：分类服务对接 WooCommerce（对称商品服务）
- 新增 `models/category.js`：将 WordPress/WooCommerce REST 分类对象映射为统一分类 DTO（`mapWooCommerceCategory` / `mapWooCommerceCategories`，含图标、数量、父级、slug、permalink）。
- `categoryService.js` 由纯 mock（v3.0.0）升级为支持 `mock` / `woocommerce` 数据源切换（读取 `globalData.productSource`），WooCommerce 路径调用 `/api/category/list`、`/api/category/detail`（由配套 WP 插件映射）。
- 演示数据抽离至 `categoryService.mock.js`（与 `productService.mock.js` 结构对齐）。
- 新增 `__tests__/category.mapper.test.js` 覆盖映射纯函数（含缺省/无效项过滤），单测基线 +7 用例。

## [3.0.10] - 2026-09-13

### 变更内容

#### 工程配置
- 新增 `SutWxApp/eslint.config.js`（ESLint 10 扁平配置，完全自包含、不含任何外部 `require`）：因 eslint 10 已将 `@eslint/js`/`globals`/`@eslint/eslintrc` 移出运行时依赖（仅留在 devDependencies），`npm ci` 树中不存在这些包，故 recommended 规则与 node / 微信小程序全局变量全部就地内联，精确复刻原 `.eslintrc.js` 在 eslint 8 下的行为；原 `.eslintrc.js` 删除（避免双规则源）。`npm run lint` 恢复至 0 error / 11 warning 基线。
- `package.json` 的 `lint` / `lint:fix` 脚本移除 flat config 下已废除的 `--ext .js` 参数。
- 版本单一来源同步：package.json / app.js globalData.version / README 徽章统一至 3.0.10。

## [3.0.9] - 2026-09-12

### 变更内容

#### 源代码按职责拆分（单文件 ≤200 行）
- `utils/request.js`（738 行）拆分为：`request-config.js`（共享配置）、`request-platform.js`（wx 环境辅助）、`request-cache.js`（LRU 缓存）、`request-security.js`（CSRF / XSS / SQL 注入防护）、`request-cancel.js`（取消令牌）、`request-api.js`（配置组装与公共 API 注册）、`request.js`（主模块编排）。
- `utils/monitor.js`（557 行）拆分为：`monitor-config.js`、`monitor-utils.js`（会话/系统信息工具）、`monitor-core.js`（上报核心）、`monitor-collectors.js`（网络/FPS/内存/页面/API 采集器）、`monitor.js`（主模块编排）。
- `services/productService.js` 与 `services/orderService.js` 的商品/订单演示数据抽离至 `*.mock.js`。
- `pages/product/index.js`（410 行）加载与交互逻辑分别下沉到 `behaviors/product-loaders.js` 与 `behaviors/product-actions.js`。
- `pages/address/index.js` 校验/格式化/回调抽离至 `validators.js` / `format.js` / `handlers.js`。
- `pages/cart/index.js` 金额与数量计算抽离至 `calc.js`。
- `app.js` 存储/主题/登录/带鉴权请求逻辑抽离至 `helpers.js`。
- 拆分后各模块保持导出契约不变，ESLint 与 Jest 门禁全绿。

## [3.0.8] - 2026-09-12

### 变更内容

#### 项目结构精简：原型目录归一
- 高保真原型三件套统一归集至仓库根 `prototype/` 目录，作为项目唯一原型目录：
  - `prototype.html`：核心 6 页（首页 / 分类 / 商品详情 / 购物车 / 订单确认 / 我的）
  - `prototype-extra.html`：扩展 5 页（订单列表 / 订单详情 / 地址管理 / 设置 / 帮助中心）
  - `wireframes.html`：组件库规范（基础 10 / 复合 6 / 业务 6 组件 + 使用规则）
- 根目录旧版 `prototype/prototype.html`（v3.1.0 首轮版）由 v3.1.1 最新版覆盖
- 删除空的 `openspec/prototype/` 目录，`openspec/` 回归规范文档单一职责
- 新增 `prototype/README.md` 原型目录索引：文件清单、设计依据（设计令牌与语义色策略）、维护约定
- README「相关文档」区补充原型三件套链接

### 新增功能：CI/CD 流水线

#### 持续集成（GitHub Actions）
- 新增 `.github/workflows/ci.yml`：push（main / dev / feature / fix / hotfix）、PR 与手动触发，执行 ESLint 检查、Jest 单元测试（覆盖率报告归档）、版本号与小程序配置校验三项门禁。
- 新增 `SutWxApp/scripts/check-version.js`：比对 `package.json`、`app.js` 的 `globalData.version`、README 版本徽章、`CHANGELOG.md` 首个版本小节，并支持校验发布 Tag 与版本号一致。
- 新增 `SutWxApp/scripts/check-config.js`：校验全部 JSON 可解析、页面四件套完整、tabBar 图标存在且不超过 40KB、分包与 sitemap 指向文件存在、页面是否被 `app.json` 引用。
- 修复 `app.json` tabBar 引用的 `images/tabbar/cart.png`、`cart-active.png` 缺失（会导致开发者工具资源缺失报错），补齐为与其余图标一致的占位图。

#### 持续交付
- 新增 `.github/workflows/release.yml`：推送 `v*.*.*` Tag 时校验 Tag 与版本号一致，并抽取 `CHANGELOG.md` 对应小节自动创建 GitHub Release。
- 新增 `.github/workflows/miniprogram-deploy.yml`：手动触发，经 `miniprogram-ci` 生成预览二维码或上传体验版，需配置 `MINIPROGRAM_PRIVATE_KEY`（必填）与 `MINIPROGRAM_APPID` Secret；私钥运行期临时落盘并在结束后清理。
- 新增仓库根 `scripts/changelog-section.js`（发布说明抽取）与 `SutWxApp/scripts/deploy.js`（预览 / 上传实现）。

#### 工程与依赖治理
- `SutWxApp/package.json` 新增 `check`、`ci`、`test:coverage`、`deploy:preview`、`deploy:upload` 脚本，并声明 `engines.node >= 18`。
- `project.config.json` 补充 `packOptions.ignore`，上传时忽略 `__tests__`、`scripts`、`node_modules`、`package*.json` 等开发文件，减小代码包体积。
- 新增 `.github/dependabot.yml`：npm 开发依赖与 GitHub Actions 每周检查更新。
- `.gitignore` 增加上传私钥、预览二维码与覆盖率产物忽略规则。
- `.eslintrc.js` 为工程脚本放开 `no-console`，并忽略 `coverage/` 产物。

#### 代码质量：ESLint 门禁清零
- 修复历史遗留的 138 个 ESLint error，使 CI 代码检查门禁可直接启用：
  - 单元测试文件补充 Jest 环境声明，消除批量 `no-undef`
  - 补充 `Behavior`、`getCurrentPages`、`window`、`requestAnimationFrame` 等小程序与宿主环境全局声明
  - `utils/compress-images.js` 按 Node ESM 构建脚本单独处理，并加入上传忽略清单（不随代码包上传）
  - 清理未使用变量（`app` / `that` / `request` / `addressId` / 订单操作空回调中的 `id`）与失效的 TypeScript 注释指令
- 当前状态：`npm run lint` 0 error / 11 warning（warning 均为 `eqeqeq` 松比较，源于小程序 dataset 取值为字符串的场景，保留原逻辑）

### 文件变更
```
新增:
- prototype/README.md
- prototype/prototype-extra.html
- prototype/wireframes.html
- .github/workflows/ci.yml
- .github/workflows/release.yml
- .github/workflows/miniprogram-deploy.yml
- .github/dependabot.yml
- scripts/changelog-section.js
- SutWxApp/scripts/check-version.js
- SutWxApp/scripts/check-config.js
- SutWxApp/scripts/deploy.js
- SutWxApp/images/tabbar/cart.png
- SutWxApp/images/tabbar/cart-active.png

修改:
- prototype/prototype.html（覆盖为 v3.1.1 最新版）
- README.md
- CHANGELOG.md
- .gitignore
- .github/CONTRIBUTING.md
- SutWxApp/package.json
- SutWxApp/app.js
- SutWxApp/.eslintrc.js
- SutWxApp/project.config.json
- SutWxApp/pages/address/index.js
- SutWxApp/pages/order/index.js
- SutWxApp/pages/settings/index.js
- SutWxApp/pages/user/index.js
- SutWxApp/services/cartService.js
- SutWxApp/services/orderService.js
- SutWxApp/utils/store.js
- openspec/specs/ops/spec.md
- openspec/specs/testing/spec.md
- openspec/specs/development/spec.md

删除:
- openspec/prototype/（空目录）
```

## [3.0.7] - 2026-09-12

### 新增功能：WordPress 后台可配置主题换肤

#### 内置多套默认配色预设
- 新增 `models/theme.js`：内置 5 套默认配色预设（苏铁绿 / 天空蓝 / 暖阳橙 / 紫罗兰 / 石墨黑），并支持后端 `presetId` + `custom` 色值合并解析（`resolveTheme`）、CSS 变量字符串生成（`toCssVars`）。
- 新增 `services/themeService.js`：从 `/api/theme` 拉取主题配置（缓存优先、失败回退默认），并在 `app.js` 启动时写入 `globalData.theme` / `themeStyle`，动态下发到导航栏（`wx.setNavigationBarColor`）与 tabBar（`wx.setTabBarStyle`）。
- 新增 `behaviors/theme.js`：页面 Behavior，从 `globalData.themeStyle` 读取 CSS 变量声明并注入页面根容器，实现全站动态换肤。

#### 全站页面接入
- 11 个页面（首页 / 分类 / 商品详情 / 购物车 / 订单列表 / 订单详情 / 订单确认 / 用户中心 / 地址 / 设置 / 帮助）根容器绑定 `themeStyle`，并在 JS 注册 `themeBehavior`。

#### 文档与测试
- 新增单元测试 `__tests__/theme.mapper.test.js` 覆盖预设解析、后端配置合并、CSS 变量生成。
- `api/spec.md` 新增「主题接口」端点与契约。
- `features/spec.md` 新增「2.5 主题换肤」功能需求。
- README 补充主题换肤说明与项目结构。

### 文件变更
```
新增:
- SutWxApp/models/theme.js
- SutWxApp/services/themeService.js
- SutWxApp/behaviors/theme.js
- SutWxApp/__tests__/theme.mapper.test.js

修改:
- SutWxApp/app.js
- SutWxApp/pages/home/index.js + .wxml
- SutWxApp/pages/category/index.js + .wxml
- SutWxApp/pages/product/index.js + .wxml
- SutWxApp/pages/cart/index.js + .wxml
- SutWxApp/pages/order/index.js + .wxml
- SutWxApp/pages/order/detail.js + .wxml
- SutWxApp/pages/order/confirm.js + .wxml
- SutWxApp/pages/user/index.js + .wxml
- SutWxApp/pages/address/index.js + .wxml
- SutWxApp/pages/settings/index.js + .wxml
- SutWxApp/pages/help/index.js + .wxml
- SutWxApp/package.json
- openspec/specs/api/spec.md
- openspec/specs/features/spec.md
- README.md
- CHANGELOG.md
```

## [3.0.6] - 2026-09-12

### 新增功能：支持 WordPress WooCommerce 商品

#### 商品数据接入 WooCommerce
- 新增 `models/product.js`：`mapWooCommerceProduct` / `mapWooCommerceProducts` 将 WooCommerce 商品（WP REST `wp-json/wc/v3/products`）映射为小程序统一商品 DTO（价格、原价、图集、分类、库存、SKU、规格、评分、富文本详情）。
- `services/productService.js` 增加数据源开关：默认 `mock`；当 `app.js` 的 `globalData.productSource` 设为 `woocommerce` 时，调用 `/api/product/list`、`/api/product/detail`（由配套 WP 插件映射）并经 `models/product.js` 映射后返回。
- 商品详情页 `pages/product/index.js` 改为经 `productService.getProductDetail` 获取并映射，统一列表与详情的数据来源；mock 商品补充 `specs` 以保证规格/加购可用。
- 新增单元测试 `__tests__/product.mapper.test.js` 覆盖映射与容错。

#### 文档同步
- `data/spec.md` 新增「WooCommerce 商品实体映射」字段对照表。
- `api/spec.md` 新增「WooCommerce 商品接口」端点与契约说明。
- `features/spec.md` 新增「2.4 WooCommerce 商品」功能需求。
- `architecture/spec.md` / `user-guide/spec.md` 补充 WooCommerce 数据源说明。

### 文件变更
```
新增:
- SutWxApp/models/product.js
- SutWxApp/__tests__/product.mapper.test.js

修改:
- SutWxApp/services/productService.js
- SutWxApp/pages/product/index.js
- SutWxApp/app.js
- SutWxApp/package.json
- openspec/specs/data/spec.md
- openspec/specs/api/spec.md
- openspec/specs/features/spec.md
- openspec/specs/architecture/spec.md
- openspec/specs/user-guide/spec.md
- README.md
- CHANGELOG.md
```

## [3.0.5] - 2026-09-12

### 文档完善（WordPress 对接准确性）

#### 校正接口与鉴权描述（参考微慕 Minapper/Watch-Life）
- 架构规范、API 规范将「裸 `wp-json/wp/v2/` 桥接」更正为「配套 WordPress 插件注册的自定义 REST 命名空间（如 `wp-json/<plugin>/v1/`；核心 `wp-json/wp/v2/` 亦可复用）」
- 鉴权说明由「JWT」补充为「微信 `wx.login` code 换取 token 或 JWT」
- 架构规范「WordPress 后端与内容渲染」补充参考实现链接（微慕 Minapper/Watch-Life + 配套插件 `rest-api-to-miniprogram`；文章 HTML 渲染采用 `wxParse`）
- README「相关文档」新增 WordPress 对接参考实现链接

### 文件变更
```
新增:
（无）

修改:
- openspec/specs/architecture/spec.md
- openspec/specs/api/spec.md
- README.md
- SutWxApp/app.js
- SutWxApp/package.json
- CHANGELOG.md
```

## [3.0.4] - 2026-09-12

### 文档完善

#### 明确 WordPress 后端定位
- 在项目规范、架构规范、README、项目概览、API 规范、数据规范中补充「后端为 WordPress 网站（headless CMS）」说明
- 说明接口约定：内容以 `/api/*` 暴露（由 WordPress 插件或反向代理桥接 WP REST API `/wp-json/wp/v2/`），鉴权 `/auth/*`（JWT）
- 架构规范新增「WordPress 后端与内容渲染」章节，补全「内容渲染与排版优化（核心能力）」：HTML→WXML 渲染、`sanitizeHtml` 安全清洗、排版规范与图片优化
- 数据规范新增「WordPress 内容实体映射」（文章/页面/分类/媒体/自定义文章类型）
- 修正陈旧的 `openspec/项目概述.md` 技术栈（原 Node.js+Express+MySQL 等虚构内容）与项目背景，对齐 WordPress 内容展示定位

### 文件变更
```
新增:
（无）

修改:
- README.md
- openspec/specs/project/spec.md
- openspec/specs/architecture/spec.md
- openspec/specs/data/spec.md
- openspec/specs/api/spec.md
- openspec/项目概述.md
- docs/PROJECT_OVERVIEW.md
- SutWxApp/app.js
- SutWxApp/package.json
- CHANGELOG.md
```

## [3.0.3] - 2026-09-12

### 变更内容

#### 项目结构精简
- 高保真原型统一迁移至仓库根 `prototype/` 目录，作为项目唯一原型目录
- 删除仓库根 `prototype.html` 重定向占位页（迁移后已无必要）
- 删除空的 `openspec/prototype/` 目录，规范文档目录职责更单一
- README 原型链接同步更新为 `prototype/prototype.html`

#### 版本同步
- `SutWxApp/package.json` 版本号升至 3.0.3
- `SutWxApp/app.js` 头注释与 `globalData.version` 同步至 3.0.3

### 文件变更
```
新增:
- prototype/prototype.html

删除:
- prototype.html（根目录重定向占位页）
- openspec/prototype/prototype.html

修改:
- README.md
- CHANGELOG.md
- SutWxApp/package.json
- SutWxApp/app.js
```

## [3.0.2] - 2026-08-13

### 修复内容

#### 安全与存储统一
- 移除 utils/store.js 中 XOR 混淆伪安全层，统一 token 为明文单键存储
- 解决 authService 写明文、store.commit 写混淆、request.js 读明文三者路径不一致的隐患
- app.js 关闭调试日志（debug:false），清理生产相关 console.log

#### 监控修复
- 修复 utils/monitor.js 监控上报递归陷阱（上报请求被 monitorApi 包裹器递归触发）
- 清理 addToBuffer 中 reportData 浮空 Promise

#### 请求层重构
- pages/product/index.js、pages/home/index.js 改用 utils/request.js 封装（真实 CancelToken + 自动鉴权/CSRF）
- product/index.js、home/index.js 按职责拆分为 parts.js / utils.js 子模块（单文件≤200行）
- utils/request.js 新增 isCancel 静态方法，统一取消判定

#### 工程化
- 新增 package.json（lint/test 脚本）、.eslintrc.js 质量门禁
- 新增 __tests__ 纯函数单元测试（product/home utils、format）

### 文件变更
```
新增:
- SutWxApp/package.json
- SutWxApp/.eslintrc.js
- SutWxApp/__tests__/product.utils.test.js
- SutWxApp/__tests__/product.parts.test.js
- SutWxApp/__tests__/home.utils.test.js
- SutWxApp/pages/product/utils.js
- SutWxApp/pages/product/parts.js
- SutWxApp/pages/home/utils.js
- SutWxApp/pages/home/parts.js

修改:
- SutWxApp/utils/store.js
- SutWxApp/utils/monitor.js
- SutWxApp/utils/request.js
- SutWxApp/app.js
- SutWxApp/pages/product/index.js
- SutWxApp/pages/home/index.js
- SutWxApp/pages/order/confirm.js
- README.md
```

## [3.0.1] - 2026-08-13

### 修复内容

#### 构建与死代码清理
- 删除未引用的 TypeScript 死代码（services/*.ts、utils/request.ts、security.ts、monitor.ts、cache.ts、types/），统一运行体系为 JavaScript
- 补齐缺失的 JS 运行依赖文件：utils/request.js（网络请求）、utils/monitor.js（监控上报）、services/authService.js（认证服务）
- 新增缺失配置：sitemap.json、project.config.json（此前 app.json 引用 sitemap.json 但文件不存在）

#### 安全加固
- 移除 services/authService.ts 中硬编码的 appSecret 密钥，认证改为由后端签发 token
- utils/store.js 接入敏感字段（token）混淆存储，避免明文落盘被直接读取
- utils/request.js 保留 XSS/SQL 注入防护与 CSRF 校验能力

#### 配置治理
- 清理 app.json 中未使用的定位权限（scope.userLocation、requiredPrivateInfos）及冗余 scope/key 字段
- 修正 appid 占位，移除非标准 app.json 字段（name/versionName/versionCode/description/main/bundleName）

#### 版本统一
- README 版本徽章与文件头注释统一至 3.0.1

### 文件变更
```
新增:
- SutWxApp/utils/request.js
- SutWxApp/utils/monitor.js
- SutWxApp/services/authService.js
- SutWxApp/sitemap.json
- SutWxApp/project.config.json

删除（未引用死代码）:
- SutWxApp/services/*.ts
- SutWxApp/utils/request.ts
- SutWxApp/utils/security.ts
- SutWxApp/utils/monitor.ts
- SutWxApp/utils/cache.ts
- SutWxApp/types/wechat-miniprogram.d.ts

已修改:
- SutWxApp/app.json
- SutWxApp/app.js
- SutWxApp/utils/store.js
- README.md
- CHANGELOG.md
```

---

## [3.0.0] - 2026-07-01

### 重大更新

#### 代码质量优化
- 修复 WXML 模板中 `.toFixed()` 方法不兼容问题（微信小程序 WXML 不支持直接调用对象方法）
- 新增价格格式化工具函数 `utils/format.js`，统一管理价格显示逻辑
- 所有页面价格显示改为预格式化的文本字段，提升性能和兼容性

#### 版本升级
- 全局版本号统一升级至 3.0.0
- 更新所有文件头部版本号和更新日期
- app.json versionCode 更新为 300

### 修复内容
- 修复购物车页面价格显示问题
- 修复商品列表页价格显示问题
- 修复订单相关页面价格显示问题
- 修复商品卡片组件价格显示问题

### 文件变更
```
新增:
- SutWxApp/utils/format.js

已修改:
- SutWxApp/app.js
- SutWxApp/app.json
- SutWxApp/pages/cart/index.js
- SutWxApp/pages/cart/index.wxml
- SutWxApp/pages/category/index.js
- SutWxApp/pages/category/index.wxml
- SutWxApp/pages/order/index.js
- SutWxApp/pages/order/index.wxml
- SutWxApp/pages/order/detail.js
- SutWxApp/pages/order/detail.wxml
- SutWxApp/pages/order/confirm.js
- SutWxApp/pages/order/confirm.wxml
- SutWxApp/components/product-card/index.wxml
- CHANGELOG.md
```

---

## [2.0.0] - 2026-06-08

### 重大更新

#### 设计风格重构
- 采用 Apple 极简设计风格
- 重新设计全局颜色系统
- 更新字体、间距、圆角、阴影规范
- 添加流畅的过渡动画效果

#### 界面优化
- 首页采用 Apple 风格布局
- 优化商品卡片设计
- 改进购物车页面样式
- 优化用户中心界面

### 新增功能
- 完整的 Apple 风格高保真原型
- 设计系统变量（CSS Variables）
- 统一的过渡动画规范

### 技术更新
- 全局样式 `app.wxss` 重构为设计系统
- 首页样式 `pages/home/index.wxss` 优化
- 购物车样式 `pages/cart/index.wxss` 优化
- 项目规范文档 `openspec/specs/project/spec.md` 更新

### 文件变更
```
已修改:
- README.md
- SutWxApp/app.wxss
- SutWxApp/pages/home/index.wxss
- SutWxApp/pages/cart/index.wxss
- openspec/specs/project/spec.md
- openspec/prototype/prototype.html
```

---

## [1.0.0] - 2025-12-26

### 初始版本

- 项目基础结构搭建
- 核心页面开发
  - 首页
  - 分类页
  - 购物车
  - 订单页
  - 用户中心
- 基础组件开发
- 项目规范文档
- 基础原型设计
