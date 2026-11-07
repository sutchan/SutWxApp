# 贡献与 AI 助手指南

> **适用对象**：本仓库的人类贡献者，以及在本地执行编码任务的 AI 助手。
> **规范定位**：本文件只讲「怎么在这个仓库里干活」。工程细则（编码风格、命名、提交、分支、审查）见 [`specs/development/spec.md`](./specs/development/spec.md)；文档体系总览见 [`README.md`](./README.md)。
> **规范演进**：3.5.5 起 OpenSpec CLI 工作流已废弃，变更一律走 **Git 分支 + PR**。仓库内不存在 `openspec/` 与 `docs/changes/`，任何文档都不得再引用它们。

---

## 1. 项目一句话定位

**SutWxApp** = 微信小程序（`SutWxApp/`）+ WordPress 插件（`sutwx-app-api/`）的电商桥接方案：小程序负责展示与交易，插件负责把 WordPress/WooCommerce 数据经 REST 暴露给小程序。

```
浏览器/微信 ──> SutWxApp/            小程序前端（原生 JS，无框架、无 TypeScript）
                        │  HTTPS /api/*
                        ▼
                sutwx-app-api/      WordPress 插件（PHP 7.4+，REST 命名空间 /api/v1）
                        │
                        ▼
                WordPress + WooCommerce   内容与订单存储（不在本仓库）
```

---

## 2. 仓库地图

| 路径 | 职责 | 关键约束 |
|------|------|---------|
| `SutWxApp/` | 小程序工程（微信开发者工具导入此目录） | 入口 `app.js`；页面在 `pages/`；**不得引入 npm 依赖**（`miniprogram_npm/` 除外） |
| `SutWxApp/utils/` | 无业务语义的基础设施 | `request*.js` 请求层、`auth-token*.js` 令牌、`monitor*.js` 监控、`store.js` 状态、`i18n.js` 多语言 |
| `SutWxApp/services/` | 业务服务层（一个领域一个文件） | `xxxService.js` camelCase；`*.mock.js` 为 mock 数据源 |
| `SutWxApp/models/` | DTO 映射层 | 后端字段 → 前端视图模型的唯一转换点 |
| `SutWxApp/pages/` | 页面目录 | 每页一个目录，含 `.js/.json/.wxml/.wxss` 四件套；分包页面放 `article/`、`address/` 等 |
| `SutWxApp/components/` | 自定义组件 | `PascalCase/index.*` 四件套；注册在页面 `.json` 的 `usingComponents` |
| `SutWxApp/styles/` | 全局样式分片 | 由 `app.wxss` 用 `@import` 汇聚；`styles/` 下只放分片 |
| `SutWxApp/scripts/` | 构建与校验脚本 | Node CLI；`check-*.js` 三件套是 CI 门禁 |
| `sutwx-app-api/` | WordPress 插件 | 入口 `sutwx-app-api.php`；`includes/class-modules.php` 是加载清单（顺序敏感） |
| `sutwx-app-api/includes/` | 插件类与 trait | `class-*.php`；按职责子目录 `auth/`、`cache/`、`order/`、`pay/`、`rate-limit/`、`rest/`、`mappings/` |
| `sutwx-app-api/tests/` | PHP 单测（6 套件） | `run-*-tests.php`，独立运行不依赖 WordPress |
| `prototype/` | 单文件交互原型 | 浏览器直接打开即可交互；`build.js` 由其生成根目录站点文件 |
| `docs/` | 规范与任务文档 | 索引见 `docs/README.md` |
| `scripts/` | 仓库级脚本 | `changelog-section.js`（发布说明抽取） |

---

## 3. 环境与工具

| 工具 | 版本 | 用途 | 必需 |
|------|------|------|------|
| Node.js | ≥ 18（CI 用 20） | 跑校验脚本、测试、构建、部署 | 是 |
| 微信开发者工具 | 最新稳定版 | 小程序预览、真机调试、上传 | 是 |
| PHP | 8.1 / 8.3 | 仅用于跑插件单测与 `php -l`；**本地无 PHP 时由 CI 承担** | 否 |
| Git | 最新稳定版 | 版本控制 | 是 |

> **包管理器统一用 npm**。仓库根的 `bun.lock` 是历史残留，CI 使用 npm；不要新增 Bun 相关流程，也不要在文档中建议 `bun install`。
> **注意**：仓库当前未提交 `package-lock.json`，本地请用 `npm install` 安装依赖（`npm ci` 无 lockfile 会直接报错）；CI 的 `lint`/`test` Job 因此处于失败状态，修复计划见 `docs/tasks.md` 的 REL-002。

---

## 4. 四道门禁（提交前必须全绿）

```bash
cd SutWxApp

npm run lint          # ESLint（0 error / 0 warning 为基线）
npm run check         # check:version + check:config + check:contract
npm test              # Jest（当前 137 用例）
npm run test:e2e      # E2E（需本地微信开发者工具，开自动化端口）
```

一条命令跑前三道：`npm run ci`。

插件侧单测（需 PHP 8.1+）：

```bash
php sutwx-app-api/tests/run-mapping-tests.php
php sutwx-app-api/tests/run-settings-tests.php
php sutwx-app-api/tests/run-auth-tests.php
php sutwx-app-api/tests/run-cache-tests.php
php sutwx-app-api/tests/run-order-tests.php
php sutwx-app-api/tests/run-pay-tests.php
```

**门禁失败时的第一动作**：读报错，不要绕过。`check:contract` 失败几乎总是「后端 DTO 与前端 `models/` 字段漂移」，改生产代码而不是改断言。

---

## 5. 变更流程（Git 分支 + PR）

1. **认领任务**：在 `docs/tasks.md` 找到条目并把状态改为「进行中」；找不到对应任务时先在 `docs/tasks.md` 新增一行。
2. **开分支**：从 `dev` 切出 `feature/<简述>` / `fix/<简述>` / `hotfix/<简述>`（见开发规范的分支管理）。
3. **先写测试**：修复缺陷时，先让新测试失败（红），再改实现（绿）。新增 `__tests__/<主题>.test.js`。
4. **同步版本与文档**：改动文件头注释的版本号、涉及的功能文档、`CHANGELOG.md` 一并更新。
5. **本地跑门禁**：`npm run ci` 全绿。
6. **提 PR**：正文写清「问题 → 方案 → 影响面 → 验证方式」，勾选自检清单（见 §8）。
7. **合并**：至少 1 人批准且 CI 全绿 → 合并到 `dev`；`main` 仅由 `hotfix/` 与发版合并进入。

**不需要**提案文件、变更目录或任何 OpenSpec 产物。

---

## 6. 提交信息格式

```
<type>(<scope>): <一句话说明>

<正文：为什么改、改了什么、影响与验证>
```

- `type`：`feat` / `fix` / `docs` / `refactor` / `test` / `perf` / `chore` / `build` / `ci`
- `scope`：受影响模块（`首页`/`auth`/`order`/`pay`/`cache`/`docs`…），可省略
- 标题 ≤ 50 字，祈使句现在时，不加句号
- 正文说明**为什么**，不重复标题

示例：

```
fix(首页): 解包 {code,data} 包络并按 total 推算 hasMore

后端列表端点统一返回 {code,data}，前端直接读 data.list 导致商品恒空；
分页参数后端用 page 而非 pageNum。修正后首页商品与分类恢复正常渲染。
```

---

## 7. 文档联动矩阵

| 改动类型 | 必须同步的文档 |
|----------|----------------|
| 接口路径 / DTO 字段 | `docs/specs/api/spec.md`、`docs/specs/backend/spec.md`、`docs/specs/data/spec.md`、`models/*`、契约测试 |
| 新增/下线页面、组件 | `docs/specs/features/spec.md`、`docs/specs/user-guide/spec.md`、`app.json` |
| 样式与设计令牌 | `docs/specs/design/spec.md`、`SutWxApp/styles/*` |
| 新增端点或改响应结构 | `docs/specs/backend/spec.md` + 对应 `run-*-tests.php` |
| 工具链 / 脚本 / 门禁 | `docs/specs/development/spec.md`、`docs/README.md` |
| 部署、监控、备份 | `docs/specs/ops/spec.md` |
| 版本号 | `SutWxApp/package.json`、`app.js` `globalData.version`、文件头注释、`README.md` 徽章、`CHANGELOG.md`、插件 `readme.txt` 与 `SUTWX_API_VERSION`（`npm run check:version` 校验） |

---

## 8. 硬性红线（不要做这些）

| # | 红线 | 原因 |
|---|------|------|
| 1 | 不提交 `node_modules/`、`dist/`、`coverage/`、`*.key`、`private.*.key` | `.gitignore` 已排除；密钥泄露即事故 |
| 2 | 不把 `sutwx-app-api/readme.txt` 留在工作区不入库 | `.gitignore` 的 `*.txt` 规则会误伤它；插件发布包必须含该文件（详见 `docs/tasks.md` REL-001） |
| 3 | 不修改 `app.js` 的 `globalData.baseUrl` 为真实域名后提交 | 真实域名属环境配置，占位 `https://api.example.com` 保持入库，由环境变量/发布流程注入 |
| 4 | 不在 `SutWxApp/` 引入 npm 运行时依赖 | 小程序包体限制；构建期脚本放 `SutWxApp/scripts/` |
| 5 | 不删除或放宽 `check-version` / `check-config` / `check-contract` | 它们是版本一致性与前后端契约的唯一自动防线 |
| 6 | 不修改 `ci.yml` 的 PHP 版本矩阵（8.1 / 8.3） | 兼容性基线，变更需同步 `docs/specs/backend/spec.md` |
| 7 | 不在 `includes/class-modules.php` 之外零散 `require` 插件类 | 加载顺序敏感（trait 必须先于类） |
| 8 | 不提交 `prototype/*.html` 的构建产物以外的生成文件到 `prototype/` | `prototype/` 是源，`build.js` 产出根目录站点文件 |

---

## 9. 排障速查

| 现象 | 排查路径 |
|------|---------|
| `npm run check:contract` 失败 | 对比 `sutwx-app-api/includes/mappings/*.php` 与 `SutWxApp/models/*` 的字段名；改生产代码而非断言 |
| `npm run check:version` 失败 | `package.json` / `app.js` / `README.md` 徽章 / `CHANGELOG.md` 四处版本号未同步 |
| `npm run check:config` 失败 | 页面四件套缺失、`app.json` 路由与磁盘不一致、tabBar 图标缺失 |
| `npm run check:images` 失败 | WXML 引用了不存在的 `/images/*` 资源；运行 `node scripts/generate-ui-icons.js` 补齐资产，不要改用 SVG（微信 `image` 不支持） |
| `npm run check:ids` 失败 | WXML 根容器缺少语义化 id、用了 `page-root` 等通用名，或模板/原型内存在重复 id |
| Jest 报「worker 未优雅退出」 | 有定时器未 `unref()`；用 `npx jest --detectOpenHandles` 定位（见 `docs/tasks.md` QA-007） |
| 本地无 PHP 跑不了插件测试 | 交由 CI 的 PHP 8.1/8.3 矩阵执行；本地可用 `node .tmp-*` 脚本做括号配平自检 |
| 小程序请求 404 | 后端 rewrite 仅匹配 `^api/`，端点必须带 `/api` 前缀 |
| 接口返回 `{code,data}` 但页面空 | 前端未调 `unwrap`（`SutWxApp/utils/api.js`） |

---

## 10. PR 自检清单

- [ ] 任务已在 `docs/tasks.md` 标记为「进行中」，完成后移入 `docs/tasks-done.md`
- [ ] `npm run ci` 全绿（lint / check / test）
- [ ] 新增或修改的逻辑有对应测试（缺陷修复需先有失败用例）
- [ ] 版本号与 `CHANGELOG.md` 已同步（`npm run check:version` 通过）
- [ ] 涉及接口变更时，`docs/specs/api/spec.md`、`backend/spec.md` 与契约测试已同步
- [ ] 未提交任何密钥、构建产物、`node_modules`
- [ ] 提交信息符合 `<type>(<scope>): <说明>`，正文解释「为什么」
- [ ] 单文件**运行时源码** ≤ 200 行（例外：测试套件 `*.test.js` / `run-*-tests.php`、`prototype/*.html` 单文件原型、生成物）；按职责拆为 trait / helpers 子模块，并在 `includes/class-modules.php` 登记加载顺序
- [ ] 新增/修改本地图片资源后运行 `npm run check:images`；新增 WXML 区块补语义化 id 并运行 `npm run check:ids`
