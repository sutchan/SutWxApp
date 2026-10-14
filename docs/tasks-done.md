# 苏铁微信小程序 (SutWxApp) 已完成任务归档

> **文档版本**: v1.0.0
> **创建时间**: 2026-10-13
> **说明**: 本文件归档所有已完成的任务项，从 [`tasks.md`](./tasks.md) 迁移而来，保留验收结论与交付物位置，便于追溯。

---

## 2026-10-13 归档批次

### OPS-001 — GitHub Actions 自动化测试流水线

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-09-15（CI 落地） / 2026-10-13（核实归档） |
| 交付物 | `.github/workflows/ci.yml` |

**实现要点**

- 触发：`push`（main/dev/feature/fix/hotfix）+ `pull_request` + `workflow_dispatch`；`concurrency` 取消重复运行。
- 五个 Job：`lint`（ESLint）、`test`（Jest + 覆盖率归档）、`checks`（`check-version.js` + `check-config.js`）、`site`（`build.js` 构建 + 启动 `server.js` 冒烟五条路由）、`php`（PHP 8.1/8.3 矩阵，`php -l` 语法检查 + 映射/主题单测）。
- 依赖缓存使用 `SutWxApp/package-lock.json`（曾因 lockfile 未入库导致缓存失败，commit `dbe1a81` 修复）。

**验收结论**：五个 Job 定义完整，覆盖前端、后端、站点与配置校验全链路。

---

### OPS-002 — 小程序体验版自动预览与上传

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-09-15（CI 落地） / 2026-10-13（核实归档） |
| 交付物 | `.github/workflows/miniprogram-deploy.yml`、`SutWxApp/scripts/deploy.js` |

**实现要点**

- 手动触发（`workflow_dispatch`），支持 `preview` / `upload` 两种动作与版本号、备注入参。
- 通过 `miniprogram-ci` 上传，私钥由 GitHub Secrets 注入；`.gitignore` 已排除 `private.*.key`、`*.private.key`、`.miniprogram-ci/`。
- `deploy.js` 封装上传逻辑，`package.json` 提供 `deploy:preview` / `deploy:upload` 脚本。

**验收结论**：自动预览与上传链路已打通，仅需配置 Secrets 即可运行。

---

## 2026-10-14 归档批次

### BE-001 — 微信登录与 JWT 签发

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-10-13 |
| 交付物 | `sutwx-app-api/includes/class-jwt.php`、`class-wechat-auth.php` |

**实现要点**：`class-jwt.php` 以 HS256 签发/校验 JWT；`class-wechat-auth.php` 调用微信 `code2session` 换取 openid；`POST /api/auth/login` 返回 access/refresh 双令牌。

**验收结论**：`wx.login` → `/auth/login` 返回 JWT；Bearer 访问受保护端点正常。

---

### BE-002 — JWT 校验与权限中间件

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-10-13 |
| 交付物 | `sutwx-app-api/includes/class-auth-guard.php`、`class-rest-auth.php` |

**实现要点**：解析 `Authorization: Bearer`，`permission_callback` 守卫；`POST /auth/refresh-token`、`/auth/logout`、`GET /user/info`。

**验收结论**：伪造/过期 Token 返回 401 统一包络；刷新与登出链路完整。

---

### BE-003 — AppID/AppSecret 后台配置

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-10-13 |
| 交付物 | `sutwx-app-api/includes/class-credentials.php`、后台设置页 |

**实现要点**：`wp-config.php` 常量优先，回落加密 option；后台表单与校验。

**验收结论**：凭证配置可持久化，代码内无明文密钥。

---

### BE-004 — Transients 缓存与失效

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-13 |
| 交付物 | `sutwx-app-api/includes/class-cache.php` |

**实现要点**：列表/详情端点缓存 TTL 5~10 分钟；`save_post`/`woocommerce_update_product`/`edited_product_cat`/`update_option_sutwx_theme` 精准失效。

**验收结论**：后台改价/发文后缓存精准失效。

---

### BE-005 — API 限频与防刷

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-13 |
| 交付物 | `sutwx-app-api/includes/class-rate-limit.php` |

**实现要点**：IP 限频 + `X-RateLimit-*` 响应头；公开 120/min、鉴权 20/min。

**验收结论**：超阈值返回 429 并携带限频头。

---

### FE-001 — Token 管理与自动刷新

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-10-13 |
| 交付物 | `utils/auth-token.js`、`utils/request-auth.js`、`__tests__/auth-token.test.js`、`__tests__/request-auth.test.js` |

**实现要点**：`auth-token.js` 统一存储、JWT `exp` 解析、过期预判与刷新锁；`request-auth.js` 401 无感刷新后单飞重放原请求。

**验收结论**：令牌读写单测通过；401 刷新/兜底跳转路径覆盖。

---

### FE-002 — 国际化 i18n 补全（运行时 + zh-CN/en-US）

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `utils/i18n.js`、`locales/zh-CN.json`、`locales/en-US.json`、`__tests__/i18n.test.js` |

**实现要点**：轻量 i18n 运行时，支持 `{var}` 插值与按系统语言/本地偏好自动选语；`app.js` 启动 `i18n.initLocale()` 写入 `globalData.locale`。其余 9 语种资源列为阻塞子项 `FE-002-b`。

**验收结论**：`__tests__/i18n.test.js` 覆盖默认/切换/缺失/插值/规范化；多语言资源随专业翻译补齐。

---

### FE-003 — 离线与网络异常降级

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `utils/offline-snapshot.js`、`__tests__/offline-snapshot.test.js`（接入点：`utils/request.js`、`utils/request-api.js`、`utils/request-config.js`、`utils/request-methods.js`） |

**实现要点**：成功 GET 响应持久化为离线快照；`request` 层重试耗尽后回退快照（`CONFIG.enableOffline` 默认关闭，按需 `request.enableOffline(true)` 开启）。

**验收结论**：`__tests__/offline-snapshot.test.js` 覆盖保存/读取/删除/清空/无 wx 降级；断网回退路径就绪。

---

### FE-005 — 用户中心真实数据接入

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `pages/user/index.js` |

**实现要点**：登录态下 `authService.getUserInfo()` 从 `/user/info` 拉取真实资料与积分，本地缓存作兜底；登出统一 `authService.logout()` 清理令牌。

**验收结论**：用户中心接真实数据源就绪；网络异常时保留本地缓存不阻断页面。

---

### QA-001 — 前端核心工具库单测（消除 CI 假绿）

| 项 | 内容 |
|----|------|
| 优先级 | P0 |
| 完成日期 | 2026-10-14 |
| 交付物 | `SutWxApp/__tests__/request.test.js`（重写）、`store.test.js`、`integration.test.js`、`i18n.test.js`、`offline-snapshot.test.js`；`.gitignore` 移除 `/tests` |

**实现要点**：根 `tests/` 被 `.gitignore` 忽略的有效用例迁入受控目录；删除引用已移除 API 的失效 ESM 测试；`request.test.js` 重写对齐 `request.js v3.5.0` 语义（鉴权头、无 token 拦截、401 兜底、状态码分发、重试、拦截器、baseURL、异常边界）。

**验收结论**：`npm test` 纳入真实 Jest 用例（不再空跑）；CI 假绿消除。

---

### QA-002 — 后端 JWT/鉴权/缓存单测

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-10-14（复核归档） |
| 交付物 | `sutwx-app-api/tests/run-auth-tests.php`、`run-cache-tests.php`、`run-mapping-tests.php`、`run-settings-tests.php`、`stubs-runtime.php` |

**实现要点**：覆盖 JWT 编解码/校验、401 无感刷新、缓存命中/失效、映射与主题字段；独立运行无需 WP（桩 option/transient/user）。

**验收结论**：经 10-14 复核已完整落地，标记完成（本地无 PHP 运行时，由 CI PHP 8.1/8.3 矩阵执行）。

---

### QA-004 — 接口契约一致性测试

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `scripts/check-contract.js`（接入 `npm run check` 的 `check:contract`） |

**实现要点**：解析插件 `includes/mappings/*.php` 映射字段，比对 `models/product.js`/`post.js`/`category.js` 期望字段；校验列表端点 `list/total/page/pageSize` 包络。

**验收结论**：前后端 DTO 字段一致，契约漂移可被 `npm run check` 捕获。

---

### OPS-003 — 插件打包与发布脚本

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `scripts/package-plugin.js`（根 `package.json` 增加 `package:plugin`） |

**实现要点**：解析并校验 `SUTWX_API_VERSION`（SemVer）；排除 `tests/` 等开发目录；自包含 store-only ZIP 写器（含 CRC32，无外部依赖）生成 `dist/sutwx-app-api-v<version>.zip`。

**验收结论**：`npm run package:plugin` 可一键产出标准插件包。

---

## 历史完成成果（v3.4.1 之前，供追溯）

| 模块 | 阶段 | 主要交付成果 | 版本 |
|------|------|--------------|------|
| 后端插件 | P0 脚手架与环境 | 插件主入口、类加载器、`/api/*` rewrite 路由映射 | v0.1.0 |
| 后端插件 | P1 只读 MVP | 商品/文章/分类 REST 接口、字段清洗与 DTO 映射、映射单测 | v0.2.0 |
| 后端插件 | P2 主题后台配置 | WP 后台设置页、Option 存储、颜色校验、`/api/theme`、设置单测 | v0.3.0 |
| 小程序前端 | UI 设计系统 | 全局 Token 升级、Apple 风格组件库、5 套主题动态加载 Behavior | v3.3.0 |
| 小程序前端 | 页面与业务层 | 首页、商品、文章、分类、购物车、订单、个人中心、地址、设置 | v3.4.0 |
| 规范文档体系 | OpenSpec 迁移 | `/docs/` 规范文档集（架构/API/后端/功能/测试/运维等） | v1.0.0 |
| 小程序前端 | 地址页修复 | 修复 `pages/address/*` 服务引用错配导致的运行时崩溃 | v3.4.1 |
