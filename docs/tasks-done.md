# 苏铁微信小程序 (SutWxApp) 已完成任务归档

> **文档版本**: v1.5.0
> **创建时间**: 2026-10-13
> **更新时间戳**: 2026-11-07
> **说明**: 本文件归档所有已完成的任务项与历史更新说明，从 [`tasks.md`](./tasks.md) 迁移而来，保留验收结论与交付物位置，便于追溯。

---

## 2026-11-07 归档批次

### FE-011 — 修复本地图标引用缺失（含 QA-010 审计范围外的新增破图）

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-11-07 |
| 交付物 | `SutWxApp/scripts/generate-ui-icons.js`、`SutWxApp/scripts/ui-icons/shapes.js`、`SutWxApp/scripts/check-images.js`、`SutWxApp/images/*.png`（14 个） |

**问题**：WXML 共引用 14 个本地 PNG 图标，资源从未入库（仓库仅有同名 `arrow-right.svg` 等 SVG，而微信 `image` 组件不支持 SVG）。涉及用户中心箭头、商品规格/服务/评价箭头与星标、操作栏客服/购物车、图集分享/收藏、弹层关闭、首页搜索/分类/空态等，运行时全部破图。

**方案**：复用项目既有 `scripts/tabbar-icons/draw.js` 纯 Node 光栅化能力，新增 `generate-ui-icons.js` 一次性生成 14 个 PNG（含 `star-active`、`favorite-active`、`collect-active` 等动态模板展开态），不改动任何 WXML 结构。新增 `check:images` 门禁校验所有 `/images/*` 引用并接入 `npm run check` 与 CI，防止回归。

**连带修复**：`draw.js` 的 Bresenham 直线以浮点终点 `===` 判等，星形/心形浮点顶点导致生成器死循环挂起；改为整数归一化 + 步数上限。`POST /api/order/create` 失败路径未释放幂等短锁，导致用户重试被误挡。

**验证**：`node scripts/check-images.js` 扫描 21 个 WXML 全部通过；14 个 PNG 文件头校验合法；`npm test` 137 用例全绿；`npm run lint` 与 `npm run check` 全绿。

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
| 交付物 | `SutWxApp/scripts/package-plugin.js`（根 `package.json` 增加 `package:plugin`） |

**实现要点**：解析并校验 `SUTWX_API_VERSION`（SemVer）；排除 `tests/` 等开发目录；自包含 store-only ZIP 写器（含 CRC32，无外部依赖）生成 `dist/sutwx-app-api-v<version>.zip`。

**验收结论**：`npm run package:plugin` 可一键产出标准插件包。

---

### BE-006 — 订单管理接口

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-10-14 |
| 交付物 | `sutwx-app-api/includes/rest/class-rest-orders.php`、`class-rest-order-actions.php`、`includes/order/class-order-items.php`、`includes/mappings/map-order.php`/`map-order-parts.php`、`tests/run-order-tests.php` |

**实现要点**：`/api/order/list|detail|create|cancel|confirm` 全套落地；Bearer 鉴权 + WC 订单 DTO 映射 + 订单归属与状态机校验；商品装配（`class-order-items.php`）含库存校验与地址快照。2026-11-04 重构（QA-005）将写操作拆为独立装配类，并新增商家发货控制器 `rest/class-rest-order-ship.php`。

**验收结论**：`run-order-tests.php` 通过；联调验收待 WooCommerce 真实站点。

---

### BE-007 — 微信支付 V3 对接

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `sutwx-app-api/includes/class-wechat-pay*.php`（签名/工具/下单/通知/查单同步）、`class-pay-credentials.php`（+ `pay/class-pay-credentials-store.php`）、`rest/class-rest-pay.php`、`class-rest-pay-query.php`、`admin/settings-pay.php`、`tests/run-pay-tests.php` |

**实现要点**：V3 签名 / 预支付 / 通知验签解密 / 查单 / 退款；查单结果同步订单状态（`class-pay-order-sync.php`）；商户凭证支持 `wp-config` 常量锁定或后台加密存储。

**验收结论**：`run-pay-tests.php` 通过；联调需微信商户号 + API 证书（外部资质，非代码问题）。

---

### FE-004 — 订单全流程与支付闭环

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `SutWxApp/models/order.js`、`services/payService.js`、`services/orderService.js`（woocommerce 分支，`orderService.api.js`）、订单列表/详情/确认三页接入支付 |

**实现要点**：`models/order.js` 完成 WC 订单 DTO 映射；`payService.js` 串联 prepay → `wx.requestPayment` → 查单兜底；`orderService` 接入 woocommerce 分支，下单 items 兼容 `productId`/`id`（3.5.10 修复）。

**验收结论**：`__tests__/order.test.js`、`pay-service.test.js` 覆盖订单 DTO 与支付流程；实机支付待商户资质。

---

### QA-003 — E2E 核心流程测试

| 项 | 内容 |
|----|------|
| 优先级 | P2 |
| 完成日期 | 2026-10-14 |
| 交付物 | `SutWxApp/scripts/e2e/`（`e2e-config.js`、`e2e-home.js`、`e2e-product.js`、`e2e-cart.js`、`e2e-auth.js`）、根 `package.json` 增加 `test:e2e` |

**实现要点**：基于 `miniprogram-automator` 的四套件脚本（首页 / 商品 / 购物车 / 登录守卫），覆盖核心用户路径。

**验收结论**：脚本交付完整并纳入 `npm run test:e2e`；运行需本地微信开发者工具开启自动化端口（环境依赖，非代码问题）。

---

### QA-005 — 全量代码审查、契约对齐与 >200 行源码拆分

| 项 | 内容 |
|----|------|
| 优先级 | P1 |
| 完成日期 | 2026-11-04 |
| 交付物 | 前端 `pages/home/*`、`services/*`、`models/*`、8 个商品页 WXML；插件 `includes/auth|cache|order|pay|rate-limit/*`、`class-modules.php`、`rest/class-rest-order-ship.php`；`__tests__/regression-2026-11.test.js` |

**实现要点**：
1. 契约对齐：首页统一解包 `{code,data}`、分页参数改 `page`、分类/轮播取 `{list}`、`hasMore` 按 `total` 推算；认证服务补 `/api` 前缀并 `unwrap`；分类 `icon`、商品 DTO 判别、下单 items 字段兼容。
2. 缺陷修复：购物车静默加错商品、主题缓存无 TTL、SQL 校验误杀门牌号/备注、订单筛选 `status=0`、12 处 `eqeqeq`。
3. 拆分：鉴权服务 → 3 trait；JWT → 编码 trait；缓存 → 失效 trait；限频 → IP trait；支付凭证 → 写入 trait；订单写操作 → 装配类 + 发货控制器；加载器 → 模块清单；首页搜索 → `search-handlers.js`（含延时器清理）。
4. 语义化 ID：商品页 8 个 WXML 分片补齐根 ID。
5. `prototype/*.html` 与 build 产物按「单文件自包含、浏览器直接打开可交互」规范保留不拆。

**验收结论**：137 个 Jest 用例通过、ESLint 0 error / 0 warning、`check:version`/`check:config`/`check:contract` 通过；所有运行时源码 ≤200 行。

---

## 历史更新说明（2026-10-13 ~ 2026-11-04，自 tasks.md 迁移）

> 以下为原 `tasks.md` 中的历次「本次更新说明」与已完成项验收标准，作为已完成工作的过程记录归档于此。

### 2026-10-13

1. 原 `REMAINING_TASKS.md` 迁移为 `tasks.md` + `tasks-done.md` 双文件结构。
2. 逐项核对代码实况，标注已完成项：`OPS-001`（CI 流水线）、`OPS-002`（miniprogram-ci 自动预览/上传）。
3. 上调优先级：`QA-001` 由 P1 → **P0**（根因：仓库根 `/tests` 被 `.gitignore` 忽略，CI 用例 0 通过"假绿"）；`BE-001/002/003` 保持 P1 且为里程碑 1 关键路径。
4. 下调优先级：`BE-006/007`、`FE-004`（交易闭环）由 P3 → **P2（阻塞）**，依赖微信商户号与证书，本期不具备落地条件。
5. 新增阻塞标记：`FE-002`（11 语种翻译）、`QA-003`（E2E 需微信开发者工具环境）拆分为可落地部分 + 阻塞部分。

### 2026-10-14

1. **收尾 QA-001（P0 假绿）**：将根 `tests/` 被 `.gitignore` 忽略的有效 Jest 用例迁移至受控目录 `SutWxApp/__tests__/`；删除引用已移除 API 的失效 ESM 测试（`authService.test.ts`/`cache.test.ts`/`security.test.ts`）；重写 `request.test.js` 对齐 `request.js v3.5.0` 当前语义；移除 `.gitignore` 的 `/tests` 忽略规则，CI 至此纳入真实用例。
2. **复核并标记 QA-002 完成**：后端 PHP 单测（`run-auth-tests.php`/`run-cache-tests.php`/`run-mapping-tests.php`/`run-settings-tests.php`）经核实已完整落地。
3. **新增 QA-004 契约校验**：`scripts/check-contract.js` 比对插件 DTO 映射字段与 `models/` 期望字段、列表端点分页包络，接入 `npm run check`。
4. **新增 OPS-003 插件打包脚本**：`SutWxApp/scripts/package-plugin.js`（版本校验 + 清理测试代码 + 生成标准 zip），根 `package.json` 增加 `package:plugin`。
5. **完成 FE-002（运行时部分）**：新增 `utils/i18n.js` + `locales/zh-CN.json`/`en-US.json`，`app.js` 启动时 `i18n.initLocale()` 初始化；其余 9 语种资源另列阻塞子项 `FE-002-b`。
6. **完成 FE-003**：新增 `utils/offline-snapshot.js`，`request` 层在重试耗尽后回退离线快照（默认关闭，按需开启）。
7. **完成 FE-005**：用户中心登录态下拉取真实 `/user/info`，登出统一调用 `authService.logout()` 清理令牌。
8. **版本同步**：小程序前端 `v3.5.0` → **`v3.5.1`**（`package.json` / `app.js` / 头注释 / README 徽章 / CHANGELOG）。

### 2026-10-14 14:25

1. **进度核对**：逐项对照代码实况复核，`BE-001~005`、`FE-001/002/003/005`、`QA-001/002/004`、`OPS-001~003` 均确认已完成；期间仓库已推进至 `v3.5.2`（QA 收尾）与 `v3.5.3`（>200 行源文件拆分重构），头部「当前状态」同步至 `v3.5.3`。
2. **优先级调整**：`BE-006`（订单管理接口）由 P2 → **P1**（`FE-004` 交易闭环的关键路径，且代码侧可完整落地，不再以「联调环境」整体阻塞）；`FE-004`（订单全流程）维持 **P2**；`BE-007`（微信支付 V3）维持 **P2**（联调需商户资质，代码本轮补齐）；`QA-003`（E2E）维持 **P2**（运行需本地微信开发者工具，脚本本轮补齐）；`FE-002-b`（9 语种）由 P2 下调为 **P3**（依赖专业翻译资源，优先级最低）。
3. **状态更新**：上述 5 项未完成任务统一置为 **进行中**（本轮迭代启动代码交付），阻塞原因保留在「说明」列，区分「代码可完成部分」与「外部资源阻塞部分」。
4. **本轮目标**：完成 `BE-006`/`BE-007`/`FE-004`/`QA-003` 的代码与单测交付；`FE-002-b` 视翻译资源情况推进。

### 2026-10-14 20:30

1. **BE-006 完成**：订单管理接口全套落地（列表/详情/创建/取消/确认收货，鉴权 + WC DTO 映射 + 归属与状态机校验 + PHP 单测）。
2. **BE-007 完成**：微信支付 V3 代码与单测交付（签名/预支付/通知验签解密/查单/退款）；联调需微信商户号与 API 证书（外部资质）。
3. **FE-004 完成**：新增 `models/order.js` 与 `services/payService.js`，`orderService` 接入 woocommerce 分支，订单三页接入支付全流程。
4. **QA-003 完成**：`scripts/e2e/` 四套件脚本交付，新增 `npm run test:e2e`。
5. **版本同步**：插件 0.4.0 → 0.5.0；前端 3.5.3 → 3.5.4。

### 2026-10-14 21:40

1. **规范目录合订（3.5.4 → 3.5.5）**：`openspec/` 目录内容整体合入 `docs/specs/`（11 类规范），`docs/AGENTS.md` 标注 OpenSpec CLI 工作流已弃用，规范改由 Git 分支 + PR 直接维护；批量修复 80+ 处陈旧 `openspec/` 路径引用（README、PROJECT_OVERVIEW、AGENTS、DEVELOPMENT_PLAN、specs 交叉引用、原型页、插件映射注释等 24 个文件），移除 README 两条死链；CHANGELOG 历史条目中的旧路径作为历史记录保留。
2. **文档状态核对（3.5.5 → 3.5.6）**：`tasks.md` 头部「当前状态」同步至真实版本；`FE-002-b`（9 语种翻译）仍为唯一阻塞项，属外部资源依赖，非代码问题。

### 2026-11-04 全量审查与重构（QA-005）

1. **核心流程缺陷修复**：首页取数（解包络 / `page` 参数 / `{list}` 结构 / `hasMore` 推算 / banner `imageUrl`）、认证服务（`/api` 前缀、`unwrap`、登出清理）、分类图标 `icon` 契约、商品 DTO 判别（`type` 误判）、下单 items（`productId`/`id` 兼容）、购物车静默加错商品、主题缓存 TTL、SQL 校验误杀门牌号、订单筛选 `status=0`、12 处 `eqeqeq`。
2. **>200 行源码拆分**：插件侧鉴权/JWT/缓存/限频/支付凭证/订单写操作/加载器按职责拆为 trait 或独立类（对外调用不变）；小程序首页搜索交互拆至 `search-handlers.js`。`prototype/*.html` 与 build 产物按「单文件自包含」规范保留不拆。
3. **语义化 ID**：商品页 8 个 WXML 分片补齐语义化根 ID。
4. **测试**：新增 `__tests__/regression-2026-11.test.js`，覆盖本轮修复；全量 137 用例通过，ESLint 0 error / 0 warning。
5. **版本同步**：前端 `3.5.9 → 3.5.10`；插件 `0.5.2 → 0.5.3`；CHANGELOG / readme.txt / tasks.md 同步。

### 2026-11-04 任务归档

1. **任务归档**：将已完成且已验收的 `BE-006`（订单管理接口）、`BE-007`（微信支付 V3）、`FE-004`（订单全流程与支付闭环）、`QA-003`（E2E 核心流程测试）迁移至本文件 2026-10-14 归档批次（含交付物与验收结论）。
2. **活动任务清零**：至此 `tasks.md` 仅剩唯一活动项 `FE-002-b`（9 语种翻译资源，外部资源阻塞）。后续新任务在 `tasks.md` 登记，完成即归档。

### 已完成项验收标准（原 tasks.md §6）

1. **鉴权**：`wx.login` → `/auth/login` 返回 JWT；携带 `Bearer` 访问 `/user/info` 返回 200；伪造/过期 Token 返回 401 统一错误包络。
2. **性能**：缓存命中后列表响应显著下降；后台改价/发文后缓存精准失效。
3. **限频**：超阈值返回 429，响应头带 `X-RateLimit-Limit/Remaining/Reset`。
4. **质量**：前端用例纳入版本控制，`npm test` 非空跑；契约脚本纳入 `npm run check`。
5. **离线**：断网时列表页回退离线快照并提示，不出现白屏。

---

## 2026-11-05 归档批次（16 项，自 tasks.md 移入）

> 本批次包含两轮生产化工作：第一批 11 项（无外部依赖）+ 第二批 5 项（支付链路生产化）。
> 版本：小程序前端 `3.5.10 → 3.5.11`，WordPress 插件 `0.5.3 → 0.7.0`；CI PHP 套件由 6 套增至 8 套。

### 发布工程 REL

#### REL-001 — 修复 `.gitignore` 误忽略插件 readme.txt

| 项 | 内容 |
|----|------|
| 优先级 | **P0** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 加例外 `!sutwx-app-api/readme.txt`；`git add -f` 入库；`node SutWxApp/scripts/package-plugin.js` 产物含 readme.txt（本地与 CI 各验一次） |
| 依赖项 | 无 |

#### REL-002 — 修复 CI 依赖安装链路断裂

| 项 | 内容 |
|----|------|
| 优先级 | **P0** |
| 完成日期 | 2026-11-05 |
| 验收口径 | `ci.yml` 的 lint/test Job 用 `npm ci` 但仓库无 `package-lock.json`（`npm ci` 无 lockfile 直接报错退出）；提交 `SutWxApp/package-lock.json` 锁定版本，或改用 `npm install`；CI 两个 Job 恢复绿灯 |
| 依赖项 | 无 |

### 后端插件 BE

#### BE-008 — 新增 `/api/banner/list` 运营端点

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | option 存储轮播配置 + 后台设置页 Tab + DTO 映射 + 分组缓存 + `run-settings-tests.php` 补用例；前端取消空轮播降级 |
| 依赖项 | 无 |

#### BE-009 — `/api/health` 健康检查端点

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 返回 `{version, php, wcActive, payConfigured}`；公开免鉴权但走限频；供运维拨测与 INF-002 验证 |
| 依赖项 | 无 |

#### BE-010 — REST 层结构化错误日志

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | `class-rest-base.php` 增加 `log_error()`：错误码、路由、耗时、脱敏 IP；`error_log` 落盘可开关；鉴权失败、限频命中、支付异常三类必记 |
| 依赖项 | 无 |

#### BE-011 — 下单幂等（防重复提交）

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | `create` 接受 `clientRequestId`，以 transient 短锁 10 秒去重，重复请求返回原订单号；补并发与重复用例 |
| 依赖项 | 无 |

#### BE-012 — WP-Cron 掉单兜底定时查单

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 每 5 分钟扫描「待付款且有 prepay_id」订单调查单同步；注册 cron 生命周期钩子（激活与卸载清理）；单测覆盖状态流转 |
| 依赖项 | INF-005 |

#### BE-013 — 实现 `/api/monitor/data` 接收端点

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 接收客户端监控与错误上报（前端 `utils/monitor*.js` 的上报目标即此路径，当前 404）；限频 10 次/分钟、字段白名单校验、长度上限；与服务端日志管道（BE-010）打通 |
| 依赖项 | BE-010 |

#### BE-014 — 退款接入订单取消流程

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 已支付订单取消时调用 `Sutwx_Wechat_Pay::refund()`；金额取 WC 订单实付；退款回调更新状态 5；补退款回调验签用例 |
| 依赖项 | INF-006 |

### 小程序前端 FE

#### FE-006 — 启用客户端监控链路

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | `app.js` 调用 `monitorUtil.init()` 启动网络、FPS、内存、页面加载、API 五类采集器与自动上报调度；`onError`/`onUnhandledRejection` 已有调用需补采样与批量节流；本地开发模式仅 console |
| 依赖项 | BE-013 |

#### FE-007 — 多环境配置表（开发/预发/生产）

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | `utils/env.js` 按 `accountInfo.miniProgram.envVersion` 自动选 baseURL；`app.js` 的 `globalData.baseUrl` 从 env 注入；`check` 脚本校验生产域名非空 |
| 依赖项 | INF-002 |

#### FE-008 — 包体预算与分包预下载

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | `check` 脚本统计主包体积（阈值 1.5M）并接入 CI；`app.json` 配 `preloadRule`；接入 BE-008 后 banner 取消空轮播降级 |
| 依赖项 | BE-008 |

### 安全加固 SEC

#### SEC-001 — 限频参数生产校准

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 按端点分档（公开 60 次/分、鉴权 30 次/分、支付 10 次/分、监控上报 10 次/分）；429 响应体统一包络；staging 压测验证并记录到运维规范 |
| 依赖项 | INF-003 |

#### SEC-002 — 支付安全审计

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 核对：通知金额与订单一致性校验、重复通知幂等、验签失败返回 4xx 且不落库、退款金额上限等于实付；形成审计清单并入 `run-pay-tests.php` |
| 依赖项 | BE-014 |

### 测试与质量 QA

#### QA-006 — 支付异常路径单测补齐

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 掉单（通知丢失后 cron 兜底）、重复通知、金额不符、验签失败、退款回调五类场景桩测试 |
| 依赖项 | BE-012/014 |

#### QA-007 — 修复 Jest worker 泄漏告警

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 定位 `request.test.js` 遗留定时器，`--detectOpenHandles` 验证无泄漏；全量跑无「worker 未优雅退出」告警 |
| 依赖项 | 无 |

**批次验收结论**：前端 lint 0 error、`check` 四项（版本/配置/契约/包体）通过、137 用例全绿；后端新增 `run-platform-tests.php`（日志/banner/限频分档，30+ 断言）与 `run-pay-exception-tests.php`（支付异常五类场景 + 幂等锁 + cron，30+ 断言）两套件并接入 CI；`.gitignore` 例外修复使插件打包元数据完整；`package-lock.json` 入库解除 CI `npm ci` 断裂。

---

## 2026-11-05 归档批次（第三批：8 项，自 tasks.md 移入）

> 本轮为工程化与安全加固收尾：部署 runbook、监控告警与拨测、发布流水线串联、文档一致性巡检、密钥管理、WordPress 安全基线、冗余资产清理。

### 发布工程与运维 OPS

#### OPS-004 — 生产部署 runbook

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 运维规范新增 runbook：插件安装与升级步骤、`wp-config` 常量全表、HTTPS 要求、缓存预热、回滚步骤、常见故障处置 |
| 依赖项 | INF-003 |

#### OPS-005 — 监控告警与拨测

| 项 | 内容 |
|----|------|
| 优先级 | **P1** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 服务器 `error_log` 转告警通道（企业微信机器人或邮件）；外部拨测 `/api/health` 每 5 分钟；告警阈值与值班响应写入 runbook |
| 依赖项 | BE-009/010 |

#### OPS-006 — 发布流水线串联

| 项 | 内容 |
|----|------|
| 优先级 | **P2** |
| 完成日期 | 2026-11-05 |
| 验收口径 | release 工作流增加版本一致性校验（`check:version`）、`package:plugin` 产物归档、小程序 CI 上传体验版；CHANGELOG 抽取（`changelog-section.js`）自动附到 Release Notes |
| 依赖项 | REL-001 |

#### OPS-007 — 文档一致性修正

| 项 | 内容 |
|----|------|
| 优先级 | **P3** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 修正 `tasks-done.md` 中 `package-plugin.js` 位置描述（实际在 `SutWxApp/scripts/`）；核对规范目录树与实际文件差异 |
| 依赖项 | 无 |

#### OPS-008 — 文档与代码一致性巡检

| 项 | 内容 |
|----|------|
| 优先级 | **P2** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 脚本自动比对规范中的端点清单、文件路径、版本号与代码实况（可扩展 `check-config.js`）；纳入 CI，偏差即失败 |
| 依赖项 | 无 |

### 安全加固 SEC

#### SEC-003 — 密钥轮换与应急预案文档

| 项 | 内容 |
|----|------|
| 优先级 | **P2** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 运维规范补：JWT 密钥轮换步骤（双密钥过渡）、支付凭证泄露处置、令牌黑名单全量失效操作；附演练记录模板 |
| 依赖项 | 无 |

#### SEC-004 — WordPress 安全基线核查

| 项 | 内容 |
|----|------|
| 优先级 | **P2** |
| 完成日期 | 2026-11-05 |
| 验收口径 | CORS 白名单仅放行小程序 API 路由；免鉴权端点清单最小化复核（theme、banner、health）；wp-admin 访问限制建议写入 runbook |
| 依赖项 | INF-003 |

### 测试与质量 QA

#### QA-010 — 冗余资产清理执行

| 项 | 内容 |
|----|------|
| 优先级 | **P3** |
| 完成日期 | 2026-11-05 |
| 验收口径 | 执行 2026-11-04 冗余审计中的人工确认项：14 张未引用图片、`bun.lock`（同步 CI 注释）、`metadata.json` 取舍、两个未注册组件去留 |
| 依赖项 | 无 |

**批次验收结论**：`npm run check` 七项全绿（新增插件版本、文档一致性两项）；137 用例通过；`check-docs.js` 首次运行即发现 10 个端点未在 `api/spec.md` 登记并已补全 24 端点总表；`health-probe.yml` 每 5 分钟拨测，失败推送企业微信机器人；Release 流水线改用 `package-plugin.js` 产物并校验包内 `readme.txt`，新增可选体验版上传 Job。

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
