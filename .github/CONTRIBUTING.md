<!--
文件名: CONTRIBUTING.md
版本号: 1.0.1
更新日期: 2026-09-12
作者: Sut
描述: 苏铁微信小程序（SutWxApp）贡献指南，涵盖开发环境、分支策略、提交规范、CI/CD 与版本管理
-->

# 贡献指南

感谢你考虑为 **苏铁微信小程序（SutWxApp）** 做出贡献！本文档说明如何参与开发与提交变更。

> 本仓库包含**小程序端**（原生 JavaScript，ES6+）与 **WordPress 插件端**（PHP），另有基于 Express 的仓库根静态站点预览服务；不含 WordPress 运行时与数据库。小程序通过 `services/*` 与 `utils/request.js` 调用插件提供的 `/api/*` REST 端点。

## 开发环境

- **微信开发者工具**：最新稳定版（用于预览、调试、上传代码包）
- **VS Code**：最新稳定版（用于代码编辑，推荐安装 ESLint；项目未引入 Prettier）
- **Node.js**：LTS（仅用于运行可选脚本工具，如图片压缩、i18n 处理）
- **Git**：最新稳定版

无需 Bun 与 TypeScript 编译器；插件端单测需 PHP 8.1+（本地无 PHP 时由 CI 承担）。

### 本地起步

```bash
# 克隆仓库
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp

# 用微信开发者工具导入仓库根下的 SutWxApp/ 目录，填写 AppID（或测试号）
```

本地联调时由 `utils/env.js` 按 develop / trial / release 环境自动注入 baseUrl，指向已部署的 WordPress 站点根（需 HTTPS）。

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
- 合并方式统一为 **Squash merge**，保持主线历史线性，PR 标题即最终提交信息

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <说明>

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

- 描述简短明了（≤50 字符），首字母小写，以动词开头，无句号结尾；scope 必填（如 `api` / `product` / `plugin` / `docs`）
- 示例：`feat(product): 新增商品收藏入口`

## 版本管理

项目采用语义化版本（SemVer：`MAJOR.MINOR.PATCH`）：

- **patch**：修复、文档、重构、样式、配置、依赖等任意修改 → 第三位 +1
- **minor**：新功能、向下兼容的变更 → 第二位 +1
- **major**：破坏性变更 → 第一位 +1

**每次修改都应同步升级一次最小版本号**，并：

1. 更新 `package.json`（仓库根与 `SutWxApp/`）与 `SutWxApp/app.js` 的 `globalData.version`（须一致）
2. 更新 `README.md` 版本徽章与「项目组成」表；插件侧同步 `sutwx-app-api.php`、`@version` 常量与 `readme.txt`（由 `check:plugin-version` 校验）
3. 在 `CHANGELOG.md` 追加对应版本小节（含变更总结、动机、测试说明）
4. 提交信息在正文或页脚标注新版本号（如 `chore(release): 同步文档并更新版本至 v3.5.13`）

执行 `npm run check:version` 可一键校验上述版本号是否一致，CI 也会强制拦截。

## 持续集成与交付

仓库使用 GitHub Actions 建立质量门禁与交付流水线（配置位于 `.github/workflows/`）：

| 工作流 | 触发方式 | 作用 |
|--------|----------|------|
| `ci.yml` | push（main / dev / feature / fix / hotfix）、PR、手动 | 五 Job：ESLint、Jest（覆盖率归档）、八项一致性校验、站点构建冒烟、PHP 语法与八套件单测 |
| `auto-release.yml` | `ci.yml` 在 `main` 全绿后自动触发 | 按 `package.json` 版本自动创建并推送 `v*.*.*` Tag（幂等跳过） |
| `release.yml` | 推送 `v*.*.*` Tag（含自动推送）、手动补发 | 校验版本一致性，打包站点 / 小程序 / 插件三份交付物，抽取 `CHANGELOG.md` 小节创建 Release |
| `site.yml` | push `main` 命中 `prototype/`、`docs/` 等路径、手动 | 构建静态站点并发布 GitHub Pages |
| `health-probe.yml` | 定时（每 5 分钟） | 拨测 `/api/health`，失败推送企业微信机器人 |
| `miniprogram-deploy.yml` | 手动触发 | 经 `miniprogram-ci` 生成预览二维码或上传体验版 |

提交 PR 前请在本地执行等价的完整自检（`npm run ci` = lint + 八项 check + test）：

```bash
cd SutWxApp
npm ci
npm run ci          # lint + check + test
```

上传到微信公众平台由维护者在 Actions 中手动触发 `Deploy MiniProgram`，需要仓库 Secrets 配置 `MINIPROGRAM_PRIVATE_KEY`（上传密钥）与 `MINIPROGRAM_APPID`（AppID）。上传私钥严禁入库，`.gitignore` 已屏蔽 `private.*.key` 等文件。

## Pull Request 流程

1. `git add` → `git commit`（遵循提交规范）
2. `git push` 到你的分支
3. 创建 PR 到 `main` 或 `dev`
4. PR 标题遵循提交规范；描述包含：变更总结 + 动机 + 测试说明
5. 通过以下检查后由维护者合并：
   - [ ] CI 五个 Job（lint / test / checks / site / php）绿灯
   - [ ] 代码逻辑正确，无遗留 `console.log` / `debugger`
   - [ ] 涉及变更时补充/更新 `SutWxApp/__tests__/` 下的单元测试
   - [ ] `CHANGELOG.md` 已更新
   - [ ] 版本号已同步（`npm run check:version` 通过）

## 编码约定

- 缩进：2 空格；每行 ≤ 100 字符；文件末尾保留空行
- 命名：变量/函数小驼峰（camelCase），类/构造函数大驼峰（PascalCase），常量全大写下划线（UPPER_SNAKE_CASE）
- 关键逻辑添加中文注释；文件头部标注路径与版本号
- UI 遵循 Apple 极简设计风格（见 `app.wxss` 全局 CSS 变量）

## 临时文件

- 一次性脚本、分析产物、备份、截图一律放入根目录 `.tmp/`（已被 git 忽略），文件名带日期前缀；任务结束后删除
- **不要在仓库根目录散落临时文件**；根 `index.html`、`prototype-extra.html`、`wireframes.html` 是 `build.js` 的生成物，请改 `prototype/` 下的源文件，不要手工编辑
- 提交前确认 `git status` 干净：临时文件已删除或已归入 `.tmp/`

## 提问与讨论

- 提交 Issue 前请先检索是否已有相同或相关问题
- Bug 反馈请使用 Bug Report 模板，功能建议请使用 Feature Request 模板
- 其他问题可在 Discussion 或 Issue 中提出

再次感谢你的贡献！
