# 苏铁微信小程序 (SutWxApp) 开发任务清单

> **文档版本**: v2.3.0
> **更新时间戳**: 2026-10-14 21:40 (UTC+8)
> **项目作者**: Sut
> **当前状态**: 小程序前端 `v3.5.6` · WordPress 插件 `v0.5.0`
> **关联规范**: [项目概述](./项目概述.md) · [功能规范](./specs/features/spec.md) · [后端规范](./specs/backend/spec.md) · [API 规范](./specs/api/spec.md) · [测试规范](./specs/testing/spec.md) · [运维规范](./specs/ops/spec.md)
> **归档**: 已完成任务见 [tasks-done.md](./tasks-done.md)

---

## 本次更新说明（2026-10-13）

1. 原 `REMAINING_TASKS.md` 迁移为本文件，统一为「活动任务 (`tasks.md`) + 归档 (`tasks-done.md`)」双文件结构。
2. 逐项核对代码实况，**标注已完成项**：`OPS-001`（CI 流水线）、`OPS-002`（miniprogram-ci 自动预览/上传）。
3. **上调优先级**：`QA-001` 由 P1 → **P0**（根因：仓库根 `/tests` 被 `.gitignore` 忽略，CI 用例 0 通过"假绿"）；`BE-001/002/003` 保持 P1 且为里程碑 1 关键路径。
4. **下调优先级**：`BE-006/007`、`FE-004`（交易闭环）由 P3 → **P2（阻塞）**，依赖微信商户号与证书，本期不具备落地条件。
5. **新增阻塞标记**：`FE-002`（11 语种翻译）、`QA-003`（E2E 需微信开发者工具环境）拆分为可落地部分 + 阻塞部分。

---

## 本次更新说明（2026-10-14）

1. **收尾 QA-001（P0 假绿）**：将根 `tests/` 被 `.gitignore` 忽略的有效 Jest 用例迁移至受控目录 `SutWxApp/__tests__/`；删除引用已移除 API 的失效 ESM 测试（`authService.test.ts`/`cache.test.ts`/`security.test.ts`）；重写 `request.test.js` 对齐 `request.js v3.5.0` 当前语义；移除 `.gitignore` 的 `/tests` 忽略规则，CI 至此纳入真实用例。
2. **复核并标记 QA-002 完成**：后端 PHP 单测（`run-auth-tests.php`/`run-cache-tests.php`/`run-mapping-tests.php`/`run-settings-tests.php`）经核实已完整落地。
3. **新增 QA-004 契约校验**：`scripts/check-contract.js` 比对插件 DTO 映射字段与 `models/` 期望字段、列表端点分页包络，接入 `npm run check`。
4. **新增 OPS-003 插件打包脚本**：`scripts/package-plugin.js`（版本校验 + 清理测试代码 + 生成标准 zip），根 `package.json` 增加 `package:plugin`。
5. **完成 FE-002（运行时部分）**：新增 `utils/i18n.js` + `locales/zh-CN.json`/`en-US.json`，`app.js` 启动时 `i18n.initLocale()` 初始化；其余 9 语种资源另列阻塞子项 `FE-002-b`。
6. **完成 FE-003**：新增 `utils/offline-snapshot.js`，`request` 层在重试耗尽后回退离线快照（默认关闭，按需开启）。
7. **完成 FE-005**：用户中心登录态下拉取真实 `/user/info`，登出统一调用 `authService.logout()` 清理令牌。
8. **版本同步**：小程序前端 `v3.5.0` → **`v3.5.1`**（`package.json` / `app.js` / 头注释 / README 徽章 / CHANGELOG）。

---

## 本次更新说明（2026-10-14 14:25）

1. **进度核对**：逐项对照代码实况复核，`BE-001~005`、`FE-001/002/003/005`、`QA-001/002/004`、`OPS-001~003` 均确认已完成；期间仓库已推进至 `v3.5.2`（QA 收尾）与 `v3.5.3`（>200 行源文件拆分重构），头部「当前状态」同步至 `v3.5.3`。
2. **优先级调整**：`BE-006`（订单管理接口）由 P2 → **P1**（`FE-004` 交易闭环的关键路径，且代码侧可完整落地，不再以「联调环境」整体阻塞）；`FE-004`（订单全流程）维持 **P2**；`BE-007`（微信支付 V3）维持 **P2**（联调需商户资质，代码本轮补齐）；`QA-003`（E2E）维持 **P2**（运行需本地微信开发者工具，脚本本轮补齐）；`FE-002-b`（9 语种）由 P2 下调为 **P3**（依赖专业翻译资源，优先级最低）。
3. **状态更新**：上述 5 项未完成任务统一置为 **进行中**（本轮迭代启动代码交付），阻塞原因保留在「说明」列，区分「代码可完成部分」与「外部资源阻塞部分」。
4. **本轮目标**：完成 `BE-006`/`BE-007`/`FE-004`/`QA-003` 的代码与单测交付；`FE-002-b` 视翻译资源情况推进。

---

## 本次更新说明（2026-10-14 20:30）

1. **BE-006 完成**：订单管理接口全套落地（列表/详情/创建/取消/确认收货，鉴权 + WC DTO 映射 + 归属与状态机校验 + PHP 单测）。
2. **BE-007 完成**：微信支付 V3 代码与单测交付（签名/预支付/通知验签解密/查单/退款）；联调需微信商户号与 API 证书（外部资质）。
3. **FE-004 完成**：新增 `models/order.js` 与 `services/payService.js`，`orderService` 接入 woocommerce 分支，订单三页接入支付全流程。
4. **QA-003 完成**：`scripts/e2e/` 四套件脚本交付，新增 `npm run test:e2e`。
5. **版本同步**：插件 0.4.0 → 0.5.0；前端 3.5.3 → 3.5.4。

---

## 本次更新说明（2026-10-14 21:40）

1. **规范目录合订（3.5.4 → 3.5.5）**：`openspec/` 目录内容整体合入 `docs/specs/`（11 类规范），`docs/AGENTS.md` 标注 OpenSpec CLI 工作流已弃用，规范改由 Git 分支 + PR 直接维护；批量修复 80+ 处陈旧 `openspec/` 路径引用（README、PROJECT_OVERVIEW、AGENTS、DEVELOPMENT_PLAN、specs 交叉引用、原型页、插件映射注释等 24 个文件），移除 README 两条死链；CHANGELOG 历史条目中的旧路径作为历史记录保留。
2. **文档状态核对（3.5.5 → 3.5.6）**：本文件头部「当前状态」同步至真实版本；`FE-002-b`（9 语种翻译）仍为唯一阻塞项，属外部资源依赖，非代码问题。

---

## 进度总览

| 分类 | 总数 | 已完成 | 进行中 | 待开发 | 阻塞 |
|------|------|--------|--------|--------|------|
| 后端插件 BE | 7 | 7 | 0 | 0 | 0 |
| 小程序前端 FE | 6 | 5 | 0 | 0 | 1 |
| 测试 QA | 4 | 4 | 0 | 0 | 0 |
| 工程化 OPS | 3 | 3 | 0 | 0 | 0 |

---

## 1. 后端插件 (sutwx-app-api)

> 配套文档：[`docs/specs/backend/spec.md`](./specs/backend/spec.md) · [`docs/wordpress-plugin/DEVELOPMENT_PLAN.md`](./wordpress-plugin/DEVELOPMENT_PLAN.md)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **BE-001** | 微信登录与 JWT 签发 | **P1** | ✅ **已完成** | `class-jwt.php`（HS256）+ `class-wechat-auth.php`（code2session）+ `POST /auth/login` | 无 |
| **BE-002** | JWT 校验与权限中间件 | **P1** | ✅ **已完成** | 解析 `Authorization: Bearer`，`permission_callback` 守卫，`POST /auth/refresh-token`、`/auth/logout`、`GET /user/info` | BE-001 |
| **BE-003** | AppID/AppSecret 后台配置 | **P1** | ✅ **已完成** | `wp-config.php` 常量优先，回落加密 option；后台设置页表单 | 无 |
| **BE-004** | Transients 缓存与失效 | **P2** | ✅ **已完成** | 列表/详情端点缓存 TTL 5~10 分钟，`save_post`/`woocommerce_update_product` 精准清缓存 | 无 |
| **BE-005** | API 限频与防刷 | **P2** | ✅ **已完成** | IP 限频 + `X-RateLimit-*` 响应头 | 无 |
| **BE-006** | 订单管理接口 | **P1** | ✅ **已完成** | `/api/order/list|detail|create|cancel|confirm`（鉴权 + WC 订单 DTO 映射 + 归属/状态机校验 + `run-order-tests.php`）；联调验收待 WooCommerce 真实站点 | BE-002 |
| **BE-007** | 微信支付 V3 对接 | **P2** | ✅ **已完成** | V3 签名 / 预支付 / 通知验签解密 / 查单 / 退款 + `run-pay-tests.php`；联调需微信商户号 + API 证书（外部资质） | BE-006 |

## 2. 小程序前端 (SutWxApp)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **FE-001** | Token 管理与自动刷新 | **P1** | ✅ **已完成** | `utils/auth-token.js`（exp 解析/过期预判/刷新锁）+ `request-auth.js`（401 无感刷新后重放） | BE-001 |
| **FE-002** | 国际化 i18n 补全（运行时 + zh-CN/en-US） | **P2** | ✅ **已完成** | 新增 `utils/i18n.js` + `locales/zh-CN.json`/`en-US.json`；`app.js` 启动初始化；其余 9 语种见子项 `FE-002-b` | 无 |
| **FE-002-b** | i18n 补充 9 语种资源 | **P3（阻塞）** | 阻塞 | zh-CN/en-US 之外的 9 语种需专业翻译（外部资源，非代码问题） | FE-002 |
| **FE-003** | 离线与网络异常降级 | **P2** | ✅ **已完成** | 新增 `utils/offline-snapshot.js`，`request` 层重试耗尽后回退离线快照（默认关闭，按需开启） | 无 |
| **FE-004** | 订单全流程与支付闭环 | **P2** | ✅ **已完成** | `models/order.js` DTO 映射 + `payService.js`（prepay → `wx.requestPayment` → 查单兜底）+ `orderService` woocommerce 分支；订单三页接入支付；实调待商户资质 | BE-006/007 |
| **FE-005** | 用户中心真实数据接入 | **P2** | ✅ **已完成** | 登录态下拉取真实 `/user/info`，登出统一清理令牌 | BE-002 |

## 3. 测试与质量保障 (QA)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **QA-001** | 前端核心工具库单测 | **P0** | ✅ **已完成** | 用例迁入 `SutWxApp/__tests__/` 受控目录并修正 `.gitignore`，消除 CI 假绿；`request.test.js` 重写对齐当前语义 | 无 |
| **QA-002** | 后端 JWT/鉴权/缓存单测 | **P1** | ✅ **已完成** | `run-auth-tests.php`/`run-cache-tests.php`/`run-mapping-tests.php`/`run-settings-tests.php` 经复核已完整落地 | BE-001 |
| **QA-003** | E2E 核心流程测试 | **P2** | ✅ **已完成** | `scripts/e2e/` 四套件（首页/商品/购物车/登录守卫，`npm run test:e2e`）；运行需本地微信开发者工具开启自动化端口 | 无 |
| **QA-004** | 接口契约一致性测试 | **P2** | ✅ **已完成** | 新增 `scripts/check-contract.js` 比对插件 DTO 与 `models/`，接入 `npm run check` | 无 |

## 4. 工程化与运维 (OPS)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **OPS-001** | GitHub Actions 自动化流水线 | **P1** | ✅ **已完成** | `.github/workflows/ci.yml` 五 Job：lint / test / checks / site / php（PHP 8.1+8.3 矩阵） | — |
| **OPS-002** | 小程序体验版自动预览与上传 | **P2** | ✅ **已完成** | `.github/workflows/miniprogram-deploy.yml` 已配置 `miniprogram-ci` + Secrets | — |
| **OPS-003** | 插件打包与发布脚本 | **P2** | ✅ **已完成** | 新增 `scripts/package-plugin.js`（版本校验 + 清理测试代码 + 生成标准 zip），根 `package.json` 增加 `package:plugin` | 无 |

---

## 5. 执行顺序（本次迭代）

```
P1  BE-006  订单管理接口 ← 已完成（联调验收待 WooCommerce 真实站点）
P2  BE-007  微信支付 V3 ← 已完成（联调待商户资质）
P2  FE-004  订单全流程 + 支付闭环 ← 已完成
P2  QA-003  E2E 脚本 ← 已完成（运行待本地开发者工具）
P3  FE-002-b 9 语种资源（待专业翻译，外部资源）← 唯一剩余阻塞项
已完成 BE-001~007、FE-001~005、QA-001~004、OPS-001~003
```

---

## 6. 验收标准

1. **鉴权**：`wx.login` → `/auth/login` 返回 JWT；携带 `Bearer` 访问 `/user/info` 返回 200；伪造/过期 Token 返回 401 统一错误包络。
2. **性能**：缓存命中后列表响应显著下降；后台改价/发文后缓存精准失效。
3. **限频**：超阈值返回 429，响应头带 `X-RateLimit-Limit/Remaining/Reset`。
4. **质量**：前端用例纳入版本控制，`npm test` 非空跑；契约脚本纳入 `npm run check`。
5. **离线**：断网时列表页回退离线快照并提示，不出现白屏。
