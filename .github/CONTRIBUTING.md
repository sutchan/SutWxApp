<!--
文件名: CONTRIBUTING.md
版本号: 1.0.0
更新日期: 2026-09-12
作者: Sut
描述: 苏铁微信小程序（SutWxApp）贡献指南，涵盖开发环境、分支策略、提交规范与版本管理
-->

# 贡献指南

感谢你考虑为 **苏铁微信小程序（SutWxApp）** 做出贡献！本文档说明如何参与开发与提交变更。

> 本项目为**纯前端微信小程序**，使用 JavaScript（ES6+）开发，不含后端服务与数据库。数据接口由外部 REST API 提供，前端通过 `services/*` 与 `utils/request.js` 调用。

## 开发环境

- **微信开发者工具**：最新稳定版（用于预览、调试、上传代码包）
- **VS Code**：最新稳定版（用于代码编辑，推荐安装 ESLint、Prettier）
- **Node.js**：LTS（仅用于运行可选脚本工具，如图片压缩、i18n 处理）
- **Git**：最新稳定版

无需 Bun、TypeScript 编译器或数据库。

### 本地起步

```bash
# 克隆仓库
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp

# 用微信开发者工具导入 SutWxApp/SutWxApp 目录，填写 AppID（或测试号）
```

本地联调时，将 `app.js` 的 `globalData.baseUrl` 指向后端测试环境地址（需 HTTPS）。

## 分支策略

| 分支 | 用途 |
|------|------|
| `main` | 生产环境代码，保持稳定 |
| `dev` | 集成分支 |
| `feature/*` | 新功能开发 |
| `fix/*` | 缺陷修复 |
| `hotfix/*` | 紧急生产修复（可选） |

- 从 `dev`（或 `main`）切出 `feature/*` / `fix/*` 分支进行开发
- 完成后向 `dev` 或 `main` 发起 Pull Request
- 保留提交历史，不做 squash 合并，便于快速回滚

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>: <description>

[可选正文]

[可选页脚]
```

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `docs` | 文档更新 |
| `style` | 代码风格调整（不影响逻辑） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建 / 依赖 / 配置变更 |
| `ci` | CI/CD 配置变更 |
| `revert` | 回滚提交 |

- 描述简短明了（≤72 字符），首字母小写，以动词开头，无句号结尾
- 示例：`feat: 新增商品收藏入口`

## 版本管理

项目采用语义化版本（SemVer：`MAJOR.MINOR.PATCH`）：

- **patch**：修复、文档、重构、样式、配置、依赖等任意修改 → 第三位 +1
- **minor**：新功能、向下兼容的变更 → 第二位 +1
- **major**：破坏性变更 → 第一位 +1

**每次修改都应同步升级一次最小版本号**，并：

1. 更新 `SutWxApp/app.js` 的 `globalData.version`
2. 在 `CHANGELOG.md` 追加对应版本小节（含变更总结、动机、测试说明）
3. 提交信息在正文或页脚标注新版本号（如 `chore: 同步文档并更新版本至 v3.0.2`）

## Pull Request 流程

1. `git add` → `git commit`（遵循提交规范）
2. `git push` 到你的分支
3. 创建 PR 到 `main` 或 `dev`
4. PR 标题遵循提交规范；描述包含：变更总结 + 动机 + 测试说明
5. 通过以下检查后由维护者合并：
   - [ ] ESLint + Prettier 检查通过
   - [ ] 代码逻辑正确，无遗留 `console.log` / `debugger`
   - [ ] 涉及变更时补充/更新测试
   - [ ] `CHANGELOG.md` 已更新
   - [ ] 版本号已同步

## 编码约定

- 缩进：2 空格；每行 ≤ 100 字符；文件末尾保留空行
- 命名：变量/函数小驼峰（camelCase），类/构造函数大驼峰（PascalCase），常量全大写下划线（UPPER_SNAKE_CASE）
- 关键逻辑添加中文注释；文件头部标注路径与版本号
- UI 遵循 Apple 极简设计风格（见 `app.wxss` 全局 CSS 变量）

## 提问与讨论

- 提交 Issue 前请先检索是否已有相同或相关问题
- Bug 反馈请使用 Bug Report 模板，功能建议请使用 Feature Request 模板
- 其他问题可在 Discussion 或 Issue 中提出

再次感谢你的贡献！
