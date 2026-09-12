# SutWxApp 项目长期记忆

## 项目概况
- 苏铁微信小程序（电商），位于 `SutWxApp/` 子目录（纯前端原生小程序：WXML/WXSS/JS，无后端代码），数据来自外部 REST API（`app.js` 的 `globalData.baseUrl`）。
- 界面 Apple 极简风格 + 品牌绿（#2E7D32 / #1B5E20 / #F1F8E9）。
- 文档体系：`openspec/`（`specs/` 10 个规范：api/architecture/data/design/development/features/ops/project/testing/user-guide，另有 `archive/`、`项目概述.md`、`README.md`、`AGENTS.md`、`IMPROVEMENTS_REPORT.md`、`TECH_STACK_REPORT.md`、`docs_mapping_plan.md`）。

## 目录约定（2026-09-12 起）
- **原型目录统一为仓库根 `/prototype/`**：唯一原型文件 `prototype/prototype.html`（单文件自包含，所有样式/脚本/图形内联，无外部资源引用）。
- 已删除根目录 `prototype.html` 重定向占位页；已移除 `openspec/prototype/`（规范目录只放规范文档）。
- 引用原型时使用相对路径 `prototype/prototype.html`（README「相关文档」已指向该路径）。
- 根目录 `SutWxApp.code-workspace` 受 `.gitignore` 忽略但**必须保留在磁盘，不得删除**。

## 版本管理
- 版本单一来源：`SutWxApp/package.json` 的 `version` 字段与 `SutWxApp/app.js` 的 `globalData.version`（两者须一致），当前 **3.0.3**。
- 同步展示位：根 `README.md` 版本徽章、`CHANGELOG.md` 顶部新版本小节。
- 仅更新被改动文件的 `// 版本号: x.y.z` 头注释，禁止全仓库批量刷写。
- 每次修改至少 bump patch；变更记录写入根 `CHANGELOG.md`（倒序，`## [x.y.z] - YYYY-MM-DD`，无版本比较链接）。

## 工程与质量
- 质量门禁在 `SutWxApp/package.json`：`npm run lint`（eslint . --ext .js）、`npm test`（jest，testMatch `**/__tests__/**/*.test.js`，`__tests__/` 下为纯函数单测）。
- 源文件单文件 ≤200 行，超出按职责拆分（如 `pages/product/parts.js`、`pages/home/utils.js`）。
- 约定为业务逻辑加中文注释，未启用 i18n 代码层（多语言走 `locales/` 的 .po/.pot）。

## 工具链坑（Windows/PowerShell）
- `node -e "..."` 内嵌正则/中文易被 PowerShell 破坏，复杂脚本改用临时 `.mjs` 文件。
- `git mv` 到不存在的目录会失败（需先建目录）；移动后若源路径残留文件，需实查磁盘状态。
- 会话间隙项目可能被外部（并行会话/用户）大改：动文件前先实查磁盘真实内容与版本，勿信旧快照。
