# 苏铁微信小程序 (SutWxApp) 开发任务清单

> **文档版本**: v2.1.0
> **更新时间戳**: 2026-10-14 00:00 (UTC+8)
> **项目作者**: Sut
> **当前状态**: 小程序前端 `v3.5.1` · WordPress 插件 `v0.4.0`
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

## 进度总览

| 分类 | 总数 | 已完成 | 进行中 | 待开发 | 阻塞 |
|------|------|--------|--------|--------|------|
| 后端插件 BE | 7 | 5 | 0 | 0 | 2 |
| 小程序前端 FE | 6 | 4 | 0 | 0 | 2 |
| 测试 QA | 4 | 3 | 0 | 0 | 1 |
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
| **BE-006** | 订单管理接口 | **P2（阻塞）** | 阻塞 | 需 WooCommerce 真实站点联调环境 + 鉴权链路验收 | BE-002 |
| **BE-007** | 微信支付 V3 对接 | **P2（阻塞）** | 阻塞 | 需微信商户号 + API 证书（外部资质，非代码问题） | BE-006 |

## 2. 小程序前端 (SutWxApp)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **FE-001** | Token 管理与自动刷新 | **P1** | ✅ **已完成** | `utils/auth-token.js`（exp 解析/过期预判/刷新锁）+ `request-auth.js`（401 无感刷新后重放） | BE-001 |
| **FE-002** | 国际化 i18n 补全（运行时 + zh-CN/en-US） | **P2** | ✅ **已完成** | 新增 `utils/i18n.js` + `locales/zh-CN.json`/`en-US.json`；`app.js` 启动初始化；其余 9 语种见子项 `FE-002-b` | 无 |
| **FE-002-b** | i18n 补充 9 语种资源 | **P2（阻塞）** | 阻塞 | zh-CN/en-US 之外的 9 语种需专业翻译（外部资源，非代码问题） | FE-002 |
| **FE-003** | 离线与网络异常降级 | **P2** | ✅ **已完成** | 新增 `utils/offline-snapshot.js`，`request` 层重试耗尽后回退离线快照（默认关闭，按需开启） | 无 |
| **FE-004** | 订单全流程与支付闭环 | **P2（阻塞）** | 阻塞 | 依赖 `wx.requestPayment` 商户资质 | BE-007 |
| **FE-005** | 用户中心真实数据接入 | **P2** | ✅ **已完成** | 登录态下拉取真实 `/user/info`，登出统一清理令牌 | BE-002 |

## 3. 测试与质量保障 (QA)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **QA-001** | 前端核心工具库单测 | **P0** | ✅ **已完成** | 用例迁入 `SutWxApp/__tests__/` 受控目录并修正 `.gitignore`，消除 CI 假绿；`request.test.js` 重写对齐当前语义 | 无 |
| **QA-002** | 后端 JWT/鉴权/缓存单测 | **P1** | ✅ **已完成** | `run-auth-tests.php`/`run-cache-tests.php`/`run-mapping-tests.php`/`run-settings-tests.php` 经复核已完整落地 | BE-001 |
| **QA-003** | E2E 核心流程测试 | **P2（阻塞）** | 阻塞 | `miniprogram-automator` 需本地微信开发者工具开启自动化端口 | 无 |
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
P0  QA-001  测试迁入受控目录（消除 CI 假绿）
P1  BE-003  后台凭证配置        ┐
P1  BE-001  JWT 签发 + code2session ├─ 鉴权闭环
P1  BE-002  JWT 校验中间件      ┘
P1  FE-001  前端 Token 自动刷新 ┘
P2  BE-004  Transients 缓存 ┐
P2  BE-005  IP 限频         ┴─ 性能与稳定性
P2  FE-003  离线降级
P2  FE-005  用户中心真实数据
P2  FE-002  i18n 运行时（zh-CN/en-US）
P2  QA-002  后端单测
P2  QA-004  契约校验脚本
P2  OPS-003 插件打包脚本
阻塞 BE-006/007、FE-004、QA-003、FE-002(9 语种)
```

---

## 6. 验收标准

1. **鉴权**：`wx.login` → `/auth/login` 返回 JWT；携带 `Bearer` 访问 `/user/info` 返回 200；伪造/过期 Token 返回 401 统一错误包络。
2. **性能**：缓存命中后列表响应显著下降；后台改价/发文后缓存精准失效。
3. **限频**：超阈值返回 429，响应头带 `X-RateLimit-Limit/Remaining/Reset`。
4. **质量**：前端用例纳入版本控制，`npm test` 非空跑；契约脚本纳入 `npm run check`。
5. **离线**：断网时列表页回退离线快照并提示，不出现白屏。
