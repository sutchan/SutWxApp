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
