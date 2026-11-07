# 测试规范

> **文档版本**: v4.0.0
> **更新时间**: 2026-11-07 (UTC+8)
> **对齐版本**: 小程序 `3.5.13` · WordPress 插件 `0.7.1`
> **关联文档**: [工程规范](../development/spec.md) · [API 规范](../api/spec.md) · [运维规范](../ops/spec.md) · [AGENTS 指南](../../AGENTS.md)

---

## 1. 目的与范围

定义本项目的测试分层、目录与命名、用例编写标准、覆盖率要求、CI 门禁与本地复现命令。项目为**纯 JavaScript（CommonJS）+ PHP**，无 TypeScript、无 Vitest、无 Bun 测试框架。

## 2. 测试分层

| 层次 | 工具 | 位置 | 现状 |
|------|------|------|------|
| 小程序单元 / 集成 | Jest 30（`jest ^30.5.1`，`testEnvironment: node`） | `SutWxApp/__tests__/*.test.js` | 10 个套件、137 个用例 |
| 插件单元 | 自研 PHP runner | `sutwx-app-api/tests/run-*-tests.php` | 8 套件，独立运行不依赖 WordPress |
| 契约与静态校验 | Node CLI | `SutWxApp/scripts/check-*.js` | 8 项门禁（见 §5） |
| E2E | `miniprogram-automator ^0.13.0` | `SutWxApp/scripts/e2e/` | 4 套件，需微信开发者工具，未接入 CI |
| 站点冒烟 | HTTP 200 探测 | `.github/workflows/ci.yml` 的 `site` Job | 构建 `dist/` 后启动 `server.js` 冒烟 |

### 2.1 目录与命名

- Jest 用例：`<主题>.test.js`，置于 `SutWxApp/__tests__/`，与被测模块同名或同主题（如 `order.test.js` 对应 `services/orderService.js`）。
- 缺陷回归：`regression-YYYY-MM.test.js`，一个文件覆盖该批次全部回归点。
- PHP 单测：`run-<主题>-tests.php`，8 套件分别为 `mapping` / `settings` / `auth` / `cache` / `order` / `pay` / `platform` / `pay-exception`。
- E2E：`SutWxApp/scripts/e2e/e2e-<场景>.js`（home / product / cart / auth），由 `run-e2e.js` 编排。
- Jest 配置位于 `SutWxApp/package.json` 的 `jest` 字段：`rootDir` 为仓库根，`testMatch` 同时包含 `tests/**/*.test.js` 与 `SutWxApp/__tests__/**/*.test.js`；**新用例一律放 `SutWxApp/__tests__/`**（根 `tests/` 属历史兼容路径）。

## 3. 用例编写标准

- 使用 CommonJS（`require` / `module.exports`）、2 空格缩进、双引号、语句以分号结尾；关键逻辑加中文注释。
- 结构遵循 Arrange–Act–Assert，`describe` 按模块分组，`test` 名称描述预期行为。
- Mock 一律使用 Jest 内置能力：`jest.fn()` / `jest.spyOn()` / `jest.mock()`；微信 API（`wx.*`）用轻量桩注入，不引入额外 Mock 库。
- 异步用例使用 `async` / `await`，并显式覆盖 Promise rejected 分支；定时器与网络桩需在 `afterEach` 中清理，避免 Jest worker 泄漏告警。
- 每个网络相关用例显式关闭 CSRF / XSS / 缓存副作用以聚焦主流程（见 `__tests__/request.test.js`）。
- PHP 单测由 `tests/bootstrap.php` + `stubs-runtime.php` 提供 WP/WC 桩，可用 `php <文件>` 单独执行。

## 4. 覆盖率

- 生成报告：`npm run test:coverage`（等价于 `jest --ci --coverage --passWithNoTests`），输出到 `SutWxApp/coverage/`。
- CI 的 `test` Job 用 `actions/upload-artifact@v7` 归档覆盖率报告 7 天；项目**未接入** Codecov / Coveralls 等第三方托管服务。
- 覆盖率不作为硬性阻断阈值；用例数量与稳定性由 PR 审查把关（`docs/AGENTS.md` 的 PR 自检清单要求补充或更新测试）。
- `--passWithNoTests` 是为兼容双 `testMatch` 路径保留的开关；CI 的 `test` Job 额外检查「受版本控制的 Jest 用例是否存在」，防止「假绿」。

## 5. CI 门禁（`.github/workflows/ci.yml`）

`ci.yml` 在 push（main / dev / feature / fix / hotfix）、PR 与 `workflow_dispatch` 时触发，运行环境 `ubuntu-latest` + Node.js 20，工作目录 `SutWxApp/`；`concurrency` 会取消同分支的重复运行。共 **5 个 Job**，任一失败即阻断合并：

| Job | 内容 |
|-----|------|
| `lint` | `npm run lint`（ESLint 全量 `.js`） |
| `test` | Jest 单元测试 + 覆盖率归档 + 用例受控性检查 |
| `checks` | 逐个执行 8 项校验脚本（见下） |
| `site` | 仓库根 `node build.js` 构建 `dist/`，校验产物与元信息，安装 express 后启动 `server.js` 做 HTTP 200 冒烟 |
| `php` | PHP 8.1 / 8.3 矩阵：`php -l` 全量语法检查 + 逐一运行 8 套 PHP 单测 |

`npm run check` 串联 **8 项校验**：

| 脚本 | 校验内容 |
|------|---------|
| `check:version` | 两个 `package.json` / `app.js` / README 徽章的版本一致性 |
| `check:config` | JSON 可解析、页面四件套、tabBar 图标 ≤40KB、分包与 sitemap 指向文件存在 |
| `check:images` | WXML 中所有 `/images/*`（含 `{{}}` 动态展开）引用真实存在，防止破图回归 |
| `check:ids` | WXML 根容器语义化 id 与全量 id 唯一性 |
| `check:contract` | 后端 `map-*.php` 与前端 `models/*.js` 的 DTO 字段及分页包络一致 |
| `check:bundle` | 主包体积预算 ≤1.5MB |
| `check:plugin-version` | 插件三源（主文件 `Version` / `SUTWX_API_VERSION` / `readme.txt`）版本一致 |
| `check:docs` | `api/spec.md` 端点清单、`ops/spec.md` 免鉴权清单、`tasks.md` 版本声明与代码一致 |

> 依赖安装统一 `npm ci`（`SutWxApp/package-lock.json` 已入库并用作 npm 缓存键）；根站点 Job 用 `npm install --omit=dev`（根包依赖 `express ^5.2.1`）。

## 6. 本地复现

```bash
cd SutWxApp
npm ci                 # 安装锁定依赖
npm run lint           # ESLint
npm test               # Jest 全部用例
npm run test:coverage  # Jest + 覆盖率
npm run check          # 8 项校验
npm run ci             # 等价于 CI 全流程：lint + check + test

# 单个用例或单个门禁
npx jest SutWxApp/__tests__/order.test.js
npm run check:images
npm run check:contract

# 插件单测（需本地 PHP 8.1+；无 PHP 时由 CI 承担）
php ../sutwx-app-api/tests/run-mapping-tests.php

# E2E（需微信开发者工具并开启自动化端口）
npm run test:e2e
```

## 7. 新增功能的测试要求

1. 改动 `services/` / `utils/` / `models/` 时，在 `SutWxApp/__tests__/` 补充对应用例，覆盖成功与失败分支。
2. 改动 REST 端点或 DTO：同步补 PHP runner 用例，并确认 `check:contract` / `check:docs` 通过。
3. 缺陷修复：在 `regression-YYYY-MM.test.js` 留回归用例，防止复发。
4. 新增/变更 `/images/*` 引用：确认 `check:images` 通过；新增 WXML 根容器须带语义化 id 并通过 `check:ids`。
5. 提交前本地 `npm run ci` 全绿；PR 描述须写明测试说明。

## 8. 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 4.0.0 | 2026-11-07 | 按 `3.5.13` / `0.7.1` 代码实况重写：清除 TypeScript / Vitest / Bun / Codecov / miniprogram-simulate 残留，改为 Jest + PHP 8 套件 + 8 项静态门禁 + CI 五 Job，补 `npm ci`、覆盖率归档与本地复现命令 | Sut |
| 1.0.1 | 2026-09-12 | 持续集成章节改写为 GitHub Actions 流水线 | Sut |
| 1.0.0 | 2025-12-27 | 初始版本 | Sut |
