# 开发规范

> **文档版本**: v3.0.0
> **更新时间戳**: 2026-11-04
> **适用范围**: `SutWxApp/`（小程序）与 `sutwx-app-api/`（WordPress 插件）全部源码
> **定位**: 本文件是**工程规范的单一事实来源**。`specs/project/spec.md` 只保留项目定位与设计风格，涉及命名/提交/分支/审查/测试/门禁的条款一律以本文件为准。
> **配套**: 协作流程与红线见 [`../../AGENTS.md`](../../AGENTS.md)；任务见 [`../../tasks.md`](../../tasks.md)。

---

## 1. 环境要求

| 工具 | 版本 | 必需 | 说明 |
|------|------|------|------|
| Node.js | ≥ 18（CI 固定 20） | 是 | 校验脚本、测试、构建、部署 |
| 微信开发者工具 | 最新稳定版 | 是 | 预览、真机调试、上传、自动化端口 |
| PHP | 8.1 / 8.3 | 否 | 插件单测与 `php -l`；本地无 PHP 时由 CI 承担 |
| Git | 最新稳定版 | 是 | — |

**包管理器统一 npm**。历史 `bun.lock` 已清理，不得引入 Bun 流程。

```bash
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp && npm install     # 安装 ESLint / Jest / miniprogram-automator
```

> `SutWxApp/package-lock.json` 已入库，本地与 CI 统一使用 `npm ci` 锁定安装依赖。

微信开发者工具**导入 `SutWxApp/`**（即仓库根下的 `SutWxApp` 子目录，不是 `SutWxApp/SutWxApp`）。

---

## 2. 目录组织

### 2.1 顶层

```
SutWxApp/                      # 仓库根
├── SutWxApp/                  # 小程序工程（微信开发者工具导入此目录）
├── sutwx-app-api/             # WordPress 插件
├── prototype/                 # 单文件交互原型（源）
├── docs/                      # 规范与任务文档
├── scripts/                   # 仓库级脚本（changelog 抽取）
├── build.js                   # 站点构建：由 prototype/ 生成根目录站点文件
├── server.js                  # 本地静态站点服务（原型预览）
├── index.html / prototype-extra.html / wireframes.html   # 构建产物，勿手改
└── package.json               # 根包（站点服务 + 插件打包）
```

### 2.2 小程序分层与落位

| 层 | 目录 | 职责 | 禁止 |
|----|------|------|------|
| 入口 | `app.js` / `app.json` / `app.wxss` | 生命周期、全局数据、路由、全局样式 | 在 `app.js` 写业务逻辑（应下沉到 `helpers.js` / `services/`） |
| 页面 | `pages/<name>/` | 每页一个目录，四件套 `.js/.json/.wxml/.wxss` | 页面间直接互相调用，必须经 `services/` |
| 组件 | `components/<PascalCase>/` | 可复用 UI，四件套 | 组件内直接调 `wx.request`（必须经 `utils/request.js`） |
| 行为 | `behaviors/` | 跨页面复用的 mixin | 存放业务数据（应放 `services/`） |
| 服务 | `services/` | 领域业务（一个领域一文件） | 直接 `wx.request`（必须经 `utils/request.js`） |
| 模型 | `models/` | 后端 DTO → 视图模型 | 发起网络请求 |
| 工具 | `utils/` | 无业务语义基础设施 | 引入业务判断 |
| 全局样式 | `styles/` | 由 `app.wxss` 用 `@import` 汇聚的分片 | 在分片里写 `@import` 之外的副作用 |
| 脚本 | `scripts/` | Node CLI（校验、部署、图标、打包） | 被小程序运行时代码 `require` |
| 静态资源 | `images/`、`locales/` | 图片、`tabbar/` 图标、语言包 | 存放业务数据 |

**新增文件落位决策树**：

```
是页面吗？        → pages/<name>/四件套
是复用 UI 吗？    → components/<PascalCase>/四件套
是领域业务吗？    → services/xxxService.js（+ 可选 xxxService.mock.js）
是字段转换吗？    → models/xxx.js
是通用能力吗？    → utils/xxx.js
是构建期工具吗？  → SutWxApp/scripts/xxx.js

### 可执行脚本清单（与 `SutWxApp/scripts/` 实况对应，OPS-007）

| 脚本 | 用途 | 调用方 |
|------|------|--------|
| `check-version.js` | 前端版本四处一致（package.json / app.js / README 徽章 / CHANGELOG） | `npm run check`、CI、Release |
| `check-plugin-version.js` | 插件版本三源一致（`SUTWX_API_VERSION` / 插件头 / readme） | `npm run check`、CI、Release |
| `check-config.js` | `app.json` 页面与资源配置、tabBar 图标体积 | `npm run check`、CI |
| `check-contract.js` | 前后端 DTO 字段与分页包络 | `npm run check`、CI |
| `check-bundle.js` | 主包体积预算（1.5MB） | `npm run check`、CI |
| `check-docs.js` | 端点/免鉴权清单/版本声明与代码一致性 | `npm run check`、CI |
| `package-plugin.js` | 生成插件 zip（排除 tests，含 readme） | Release、发布前手动 |
| `deploy.js` | 小程序预览/上传（`miniprogram-ci`） | `npm run deploy:*`、部署工作流 |
| `generate-tabbar-icons.js` | 生成 tabBar 图标 | 手动（一次性） |

> 新增脚本须同时更新本表，并优先实现为纯 Node 内置模块（零依赖，CI 秒级）。

```

### 2.3 插件分层与落位

| 层 | 目录 | 职责 |
|----|------|------|
| 入口 | `sutwx-app-api.php` | 插件头、版本常量、依赖声明、加载 `class-loader.php` |
| 加载 | `includes/class-loader.php` | 常量、钩子、路由注册 |
| 清单 | `includes/class-modules.php` | **唯一**的类加载清单（顺序敏感：trait 必须先于使用它的类） |
| 基础类 | `includes/class-*.php` | JWT、凭证、鉴权、缓存、限频、支付、设置 |
| 职责子目录 | `includes/auth|cache|order|pay|rate-limit/` | 拆出的 trait（按职责而非按类） |
| REST | `includes/rest/class-rest-*.php` | 一个端点组一个类 |
| 映射 | `includes/mappings/map-*.php` | WordPress/WooCommerce → 小程序 DTO |
| 后台 | `admin/` | 设置页 |
| 测试 | `tests/` | `run-*-tests.php` 八套件 + `bootstrap.php` + `stubs-runtime.php` |

**新增插件类**：在 `includes/class-modules.php` 中登记；被拆分为 trait 时，trait 文件必须先于使用它的类被 require。

---

## 3. 命名约定

> 命名按「层」区分，不是全仓库一刀切。以现有代码为准，新增代码必须落在既有约定内。

### 3.1 JavaScript

| 对象 | 约定 | 示例 |
|------|------|------|
| 变量、函数、方法 | camelCase | `loadTheme()`、`cacheToken` |
| 常量 | UPPER_SNAKE_CASE | `THEME_CACHE_TTL_MS`、`STORAGE_KEY` |
| 服务文件 | camelCase + `Service` 后缀 | `authService.js`、`orderService.js`、`payService.js` |
| 模型文件 | camelCase 单数 | `product.js`、`order.js`、`category.js` |
| 工具文件 | kebab-case | `request-cache.js`、`auth-token.js`、`i18n.js`、`search-handlers.js` |
| 页面目录 | kebab-case | `pages/order/confirm/`、`pages/article/list/` |
| 组件目录 | PascalCase | `components/product-card/` → **例外**：现有为 kebab-case，新增组件统一 kebab-case 以与 `components/` 现状一致 |
| Behavior 文件 | kebab-case | `product-actions.js` |
| 脚本文件 | kebab-case | `check-config.js`、`package-plugin.js` |
| 常量引用 | 静态 import | `const { unwrap } = require("../utils/api");` |
| 私有成员 | 前缀 `_`（仅组件/类内部约定） | `this._timer` |

**布尔命名**：`is` / `has` / `can` 前缀（`isStale`、`hasMore`、`canRetry`）。

### 3.2 PHP

| 对象 | 约定 | 示例 |
|------|------|------|
| 类名 | `Sutwx_` 前缀 + Studly_Case | `Sutwx_Cache`、`Sutwx_Rate_Limit`、`Sutwx_Wechat_Pay` |
| trait 名 | `Sutwx_` 前缀 + Studly_Case | `Sutwx_Cache_Invalidation`、`Sutwx_Auth_Token_Store` |
| 方法 / 函数 | snake_case | `register_invalidation_hooks()`、`on_save_post()` |
| 常量 | `UPPER_SNAKE_CASE` + 插件前缀 | `SUTWX_API_VERSION`、`SUTWX_API_REST_NS` |
| 类文件 | kebab-case，`class-` 前缀 | `class-rest-order-ship.php`、`class-jwt-codec.php` |
| trait 文件 | kebab-case，**按职责而非按类** | `auth/class-auth-token-store.php` |
| REST 控制器 | `class-rest-<域>-<动作>.php` | `class-rest-order-actions.php`、`class-rest-pay-query.php` |
| 映射文件 | `map-<域>.php` | `map-order-parts.php` |
| 数组键（下划线） | snake_case | `billing_state`、`product_id` |
| 数组键（REST 出参） | camelCase | `productId`、`billingState` |

### 3.3 WXML / WXSS

| 对象 | 约定 | 示例 |
|------|------|------|
| `id` | kebab-case **语义化**（禁止 `id="box1"`、`id="a"`） | `product-actionbar`、`product-info-section`、`product-spec-popup` |
| `class` | kebab-case，组件根用组件名 | `product-card`、`action-icon` |
| 组件根节点 | 必须有语义化 `id` | `<view id="product-actionbar" class="bottom-action-bar">` |
| CSS 变量 | kebab-case | `--primary-color`、`--spacing-md` |
| 分片文件名 | kebab-case，与被 `@import` 的父文件对应 | `styles/layout-flex.wxss` |

**语义化 ID 规则**：ID 用于调试定位与自动化测试选择器，必须能回答「这是哪个区块」。新增 include 分片时同步补 ID。

---

## 4. 编码风格

### 4.1 强制门禁（由 ESLint 裁决，`npm run lint`）

| 规则 | 级别 | 实际含义 |
|------|------|---------|
| `no-unused-vars` | error | 未使用变量/导入即失败（未使用函数参数不报） |
| `no-console` | error | 生产代码禁止 `console.log`，**允许 `console.error` / `console.warn`**；`scripts/**` 全放开 |
| `no-debugger` | error | 禁止遗留断点 |
| `no-empty` | error | 禁止空块（`catch {}` 允许为空） |
| `eqeqeq` | warn | 禁止 `==`/`!=`（`null` 比较豁免）。需要类型宽容时显式 `String(a) === String(b)`，不要加 `eslint-disable` |

`npm run lint` 必须 **0 error / 0 warning**。`eqeqeq` 的 warn 视为未完成。

### 4.2 JavaScript 风格

- 缩进 **2 空格**；文件末尾保留换行；单行 ≤ 100 字符（超长提取常量或换行）
- 字符串用**双引号**；对象键用双引号包裹（`{ "code": 1 }`）
- 语句结尾带分号
- `const` 优先，`let` 仅在需重赋值时使用，禁止 `var`
- 早期返回替代嵌套；单个函数只做一件事，**单文件 ≤ 200 行**（`prototype/*.html` 与生成物除外）
- 注释解释**为什么**，不复述代码；复杂分支用中文单行注释标注原因
- 禁止提交注释掉的死代码（版本历史由 Git 承担）
- 空值处理：优先返回空集合/默认值并显式抛错，不返回 `null` 让调用方到处判空

### 4.3 文件头注释（统一模板）

```javascript
/**
 * 文件名: example.js
 * 版本号: 3.5.13
 * 更新日期: 2026-11-04
 * 描述: 一句话说明本文件职责（复杂模块注明「实现在 xxx」）
 */
```

```php
/**
 * 职责说明。
 *
 * @package SutwxAppApi
 * @version 0.7.1
 */
```

PHP 注释块之间空一行；类内方法之间空一行。PHP 缩进用 **Tab**（WordPress 编码规范），行内注释对齐代码。

### 4.4 PHP 风格

- 缩进 **Tab**；遵循 WordPress 编码规范（`Yoda` 条件、`array()` 长语法、SQL 需 `prepare()`）
- 所有对外输入必须经 `sanitize_*` / `absint()` 处理；SQL 必须使用 `$wpdb->prepare()`
- 直接读取 `$_SERVER` / `$_GET` 等超全局需附 `// phpcs:ignore` 说明理由
- 类常量统一用 `const`；配置项通过 `get_option()` 读取并提供默认值
- 副作用（写 option、发请求、触发钩子）不放在查询方法里；命令与查询分离
- 公开方法必须有 `@param` / `@return`；数组返回标注形状 `@return array{ok:bool,error:string}`

### 4.5 WXML / WXSS 风格

- 缩进 2 空格；属性顺序 `class` → `id` → 数据绑定 → 事件
- 事件处理函数命名 `handle<Event>`（如 `handleAddToCart`）；组件对外事件 `on<Event>`
- 数据源字段用 `models/` 产出的 camelCase 字段，禁止在 WXML 里做复杂运算
- 样式全部走 `styles/` 的 CSS 变量，不写死颜色与间距（设计令牌见 `specs/design/spec.md`）
- 列表项必须带 `wx:key`

---

## 5. 提交信息格式

采用 Conventional Commits，并**强制带 scope**（本仓库多模块并行，无 scope 无法定位影响面）。

```
<type>(<scope>): <祈使句标题>

<正文：为什么改、改了什么、影响范围与验证方式>
```

**type**：`feat` 新功能 · `fix` 缺陷修复 · `docs` 文档 · `refactor` 重构（行为不变）· `test` 测试 · `perf` 性能 · `chore` 杂项 · `build` 构建 · `ci` 流水线

**scope**（与模块对应）：`首页` `分类` `商品` `购物车` `订单` `用户` `auth` `order` `pay` `cache` `theme` `request` `monitor` `插件` `docs` `ci`

**规则**

- 标题 ≤ 50 字，现在时祈使句，不加句号，不写「修复了」「修改了」
- 正文说明**为什么**；多段用空行分隔，附影响范围与验证方式
- 一个提交只做一件事；重构与功能改动分开提交
- 引用任务编号：`FE-008`、`BE-011`

**示例**

```
feat(order): 新增商家发货端点与小程序发货入口

商家此前无法在小程序侧标记发货，订单只能在线下流转。
新增 /api/order/ship（归属与状态机校验）+ 订单详情页发货按钮，
并补 run-order-tests.php 用例覆盖非本人订单与状态非法两条路径。

关联：BE-006
```

---

## 6. 分支管理

| 分支 | 用途 | 保护 |
|------|------|------|
| `main` | 生产发布分支，始终可发布 | 只接受 `hotfix/` 与发版合并；禁止直接 push |
| `dev` | 集成分支，日常合并目标 | 禁止直接 push |
| `feature/<简述>` | 新功能/重构 | PR → `dev` |
| `fix/<简述>` | 缺陷修复 | PR → `dev` |
| `hotfix/<简述>` | 线上紧急修复 | PR → `main` **并**回合 `dev` |

**命名**：短横线分隔、小写、动词开头（`feature/order-ship`、`fix/home-unwrap`）。

**规则**

1. 分支从 `dev` 切出，从 `dev` 合并回；`hotfix` 从 `main` 切出。
2. 分支存活不超过 3 天；超过需在 PR 中说明原因。
3. 一个分支只做一件事；规模超出「一次评审可覆盖」时拆分。
4. 合并方式：**Squash merge**（保持主线历史线性），PR 标题即最终提交信息。
5. 合并前必须满足：CI 全绿 + 至少 1 人批准 + PR 自检清单勾选。
6. 提交 `main` 后打 Tag `v<version>`，Tag 必须与 `package.json` 版本一致（`npm run check:version` 校验）。

**CI 触发的分支**（`.github/workflows/ci.yml`）：`push` 于 `main` / `dev` / `feature/**` / `fix/**` / `hotfix/**`；`pull_request` 目标 `main` / `dev`。

---

## 7. 代码审查流程

### 7.1 流程

```
提交 PR → CI 自动跑 lint/check/test → 评审人按清单审查 → 作者响应 → 全部通过 → Squash 合并
```

- 评审人 ≥ 1 名；作者不能自审（单人项目例外，但需自述验证证据）
- 评审意见分为**必须修改（blocking）**与**建议（non-blocking）**，作者逐条回应
- 24 小时内给出首轮意见；PR 超过 3 天无响应自动提醒
- 合并后 24 小时内发现问题 → 直接 revert，不做 hotfix 流程

### 7.2 审查清单

**正确性**
- [ ] 边界条件（空数组、0、null、并发）是否处理
- [ ] 分页/加载更多是否可能重复或漏数据
- [ ] 错误路径是否有明确反馈，而非静默失败

**契约一致性**
- [ ] 接口路径带 `/api` 前缀（后端 rewrite 仅匹配 `^api/`）
- [ ] 前端已 `unwrap` `{code,data}` 包络
- [ ] DTO 字段与 `models/`、`mappings/` 一致，且 `npm run check:contract` 通过

**安全**
- [ ] 用户输入经校验/清洗；SQL 使用 `prepare()`
- [ ] 鉴权与归属校验存在（不可只校验登录态）
- [ ] 敏感信息不入日志、不入响应

**可观测**
- [ ] 关键失败路径有日志或可定位的错误信息

**质量**
- [ ] 新增逻辑有测试；缺陷修复先有失败用例
- [ ] 单文件 ≤ 200 行；无重复代码；无注释掉的死代码
- [ ] 命名符合 §3；注释解释「为什么」
- [ ] 无 `eslint-disable` 滥用；`eqeqeq` 零告警

**文档与版本**
- [ ] 涉及接口/页面/脚本的变更已同步对应 spec（见 `AGENTS.md` §7 联动矩阵）
- [ ] 版本号与 `CHANGELOG.md` 已同步

### 7.3 缺陷分级与响应

| 级别 | 定义 | 响应 |
|------|------|------|
| P0 | 线上不可用、数据错误、资金/鉴权失效 | 立即 hotfix，当日闭环 |
| P1 | 核心流程不可用但有绕过 | 1 个工作日内修复 |
| P2 | 体验问题、非核心功能异常 | 进入 `docs/tasks.md` 排期 |
| P3 | 优化、重构、文档 | 择机处理 |

---

## 8. 测试要求

| 层级 | 工具 | 位置 | 要求 |
|------|------|------|------|
| 单元测试 | Jest | `SutWxApp/__tests__/*.test.js` | 新增逻辑必须有覆盖；缺陷修复先写失败用例 |
| 契约测试 | `npm run check:contract` | `scripts/check-contract.js` | 改动 DTO 必须同步，否则 CI 红 |
| 配置测试 | `npm run check:config` | `scripts/check-config.js` | 页面四件套、路由、tabBar 图标完整 |
| 版本测试 | `npm run check:version` | `scripts/check-version.js` | 版本号四处一致 |
| 后端单测 | `php tests/run-*.php` | `sutwx-app-api/tests/` | 新增端点/映射必须补用例；不依赖 WordPress |
| E2E | `npm run test:e2e` | `scripts/e2e/` | 核心链路（首页/商品/购物车/登录守卫）改动后跑 |

**覆盖率**：不设硬性百分比门槛，但新增模块应覆盖正常路径 + 至少一条失败路径。

**测试风格**：一个用例只测一个行为；用例名描述行为（`shouldRejectExpiredToken`）；不 mock 被测逻辑本身；不依赖执行顺序。

---

## 9. CI/CD 与门禁

| 工作流 | 触发 | 内容 |
|--------|------|------|
| `ci.yml` | push / PR / 手动 | 5 个 Job：`lint`、`test`、`checks`、`site`（构建+冒烟）、`php`（8.1/8.3 语法检查 + 6 套单测） |
| `miniprogram-deploy.yml` | 手动 | `miniprogram-ci` 上传体验版/正式版（私钥走 Secrets） |
| `release.yml` | Tag `v*.*.*` | 构建插件 ZIP 并创建 GitHub Release |
| `site.yml` | push（站点相关路径） | 构建并发布 GitHub Pages |

**本地等价命令**：`cd SutWxApp && npm run ci`（= lint + check + test）。

**门禁失败处理**：修实现，不改断言；确需放宽规则时，先在 PR 中说明理由并同步本文件。

---

## 10. 版本管理

语义化版本 `MAJOR.MINOR.PATCH`：

- **MAJOR**：不兼容的 API/数据结构变更（如 DTO 字段删除）
- **MINOR**：向后兼容的功能新增（如新端点、新页面）
- **PATCH**：向后兼容的缺陷修复与文档修正

**双版本号**：小程序 `SutWxApp/package.json` 与插件 `sutwx-app-api/sutwx-app-api.php`（`SUTWX_API_VERSION`）各自独立。

**版本号四处必须一致**（`npm run check:version` 校验）：`package.json`、`app.js` 的 `globalData.version`、`README.md` 徽章、`CHANGELOG.md` 首个版本小节。插件侧另需同步 `readme.txt` 的 `Stable tag` 与 `Changelog`。

**改动文件的头注释版本号**同步更新为当次版本。

**发布流程**：更新版本号 → 更新 `CHANGELOG.md` → `npm run ci` → `npm run package:plugin` 验证产物 → 合并 `dev` → 发版合并 `main` → 打 Tag → 平台审核发布。

---

## 11. 文档管理

| 文档类型 | 位置 | 更新时机 |
|----------|------|---------|
| 工程规范 | `docs/specs/development/spec.md`（本文件） | 工具链、命令、规范变更时 |
| 接口契约 | `docs/specs/api/spec.md`、`backend/spec.md`、`data/spec.md` | 端点/DTO 变更时 |
| 功能说明 | `docs/specs/features/spec.md`、`user-guide/spec.md` | 页面/交互变更时 |
| 设计规范 | `docs/specs/design/spec.md` | 令牌、组件视觉变更时 |
| 运维 | `docs/specs/ops/spec.md` | 部署、监控、备份流程变更时 |
| 任务 | `docs/tasks.md`（活动）→ `docs/tasks-done.md`（归档） | 任务状态变化时 |
| 变更记录 | `CHANGELOG.md` | 每次发版 |

**规则**

- 文件名用英文 kebab-case，文档标题与正文用中文（`docs/项目概述.md` 为历史保留名，不再新增中文文件名）
- 文档头部维护「文档版本 / 更新时间戳 / 定位」三项元信息
- 代码变更与文档同 PR 提交；不在后续 PR 里「顺手补文档」
- 文档内引用代码位置用 `路径:行号`，引用文件用相对链接
- 同一事实只在一处定义，其他位置用链接引用，避免复制粘贴

---

## 12. 调试技巧

**小程序**
- 微信开发者工具 → 调试器（Console / Network / AppData）
- Network 面板确认请求是否带 `Authorization`、是否命中缓存
- Storage 面板核对 `token`、`userInfo`、`appTheme` 及 `appThemeFetchedAt`
- 真机调试验证基础库差异与授权弹窗行为
- 监控数据在 `utils/monitor.js`（`monitorUtil.error()` / `mark()` / `measure()`）

**插件**
- `error_log` / `wp_debug_log()` 输出（生产环境受 `WP_DEBUG` 控制）
- `WP_CLI` 或临时 REST 端点验证 DTO
- 用 `tests/stubs-runtime.php` 在无 WordPress 环境复现问题

**通用**
- `node .tmp-check.cjs` 之类的临时脚本做静态自检（用完即删，不入库）

---

## 13. 常见问题

**Q：`npm run check:contract` 报字段不一致**
A：后端 `mappings/*.php` 与前端 `models/*` 漂移。以契约为准同步另一侧，并同步 `docs/specs/data/spec.md`。

**Q：本地没有 PHP，跑不了插件测试**
A：交给 CI 的 PHP 8.1/8.3 矩阵。本地可用脚本做括号配平与结构自检，但**不能替代** `php -l`。

**Q：接口 404**
A：后端 rewrite 仅匹配 `^api/`，端点必须写 `/api/xxx`；同时确认 `class-modules.php` 已登记对应 REST 类。

**Q：Jest 报「worker 未优雅退出」**
A：有未清理的定时器。`npx jest --detectOpenHandles` 定位，对定时器调用 `unref()` 或在 `afterEach` 清理。

**Q：请求返回 `{code,data}` 但页面空白**
A：前端未 `unwrap`（`utils/api.js`）；或字段名与 `models/` 不一致。

**Q：提交被 CI 拦在 `check:version`**
A：版本号四处（`package.json` / `app.js` / `README.md` 徽章 / `CHANGELOG.md`）未同步。

**Q：改了代码但真机行为没变**
A：检查 `project.config.json` 的 `packOptions.ignore` 是否把该文件排除在打包外；重新上传体验版再验证。

---

## 14. 附录

**提交前速查**

```bash
cd SutWxApp
npm run lint          # 0 error / 0 warning
npm run check         # 版本 / 配置 / 契约
npm test              # 全绿
```

**规范速查**

| 项 | 约定 |
|----|------|
| 缩进 | JS/WXML/WXSS 2 空格；PHP Tab |
| 引号 | 双引号 |
| 文件长度 | ≤ 200 行（原型与生成物除外） |
| 文件命名 | 工具/脚本/插件类 kebab-case；服务/模型 camelCase + 语义后缀 |
| 提交 | `<type>(<scope>): <标题>` + 正文 |
| 分支 | `feature/` `fix/` `hotfix/` → `dev`；`main` 只接发版与 hotfix |
| 合并 | Squash merge，需 CI 绿 + 1 人批准 |
| 注释 | 解释「为什么」，中文 |
| 文档 | 与代码同 PR；同一事实只在一处定义 |

**参考**

- 微信小程序开发文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- WordPress Coding Standards：https://developer.wordpress.org/coding-standards/wordpress-coding-standards/
- Conventional Commits：https://www.conventionalcommits.org/zh-hans/
