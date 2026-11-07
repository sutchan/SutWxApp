# 文档全面审查与更新 — 变更清单

> 审查日期：2026-11-07
> 审查范围：仓库根 `.md`、`docs/` 全部文档、`.github/` 社区文档、代码侧版本展示位
> 审查方法：先实查代码建立事实基线，再逐份比对文档；所有结论均以文件实读、脚本输出与门禁结果为准

---

## 一、审查基线（实查所得）

- 版本：小程序 `3.5.14`（本轮文档变更后 patch bump 至 `3.5.15`）；WordPress 插件 `0.7.1`；仓库根包 `sut-wx-app` 为独立 workspace 包。
- 端点：插件注册 WP REST 命名空间 `sutwx/v1`，`add_rewrite_rule` 把 `/api/*` 重写至此，共 **24 个端点**（免鉴权 14 个）。
- 鉴权：`wx.login` → code2session → JWT（HS256，access 2h + refresh + jti 黑名单）；按 openid 做资源归属校验；无角色体系。
- 订单支付：状态机 0~5；微信支付 V3；`clientRequestId` 10 秒幂等短锁；WP-Cron 每 5 分钟掉单兜底；已支付订单取消自动退款。
- 运营/监控：`/api/banner/list`、`/api/monitor/data`、`/api/health` 均已实现；`class-error-log.php` 结构化日志；`health-probe.yml` 每 5 分钟拨测。
- 门禁：`npm run check` 串联 **8 项**校验（version / config / images / ids / contract / bundle / plugin-version / docs）。
- CI/CD：`ci.yml` 五 Job（lint / test / checks / site / php，PHP 8.1 & 8.3 矩阵共 8 套件）；`auto-release.yml` 五 Job 全绿后自动按版本号打 Tag，`release.yml` 打包发版；另有 `site.yml`、`health-probe.yml`、`miniprogram-deploy.yml`，共 6 个工作流。
- 依赖：`npm ci`（`SutWxApp/package-lock.json` 已入库）；根站点 `express ^5.2.1`；Jest 30、ESLint 10、miniprogram-automator 0.10；无 TypeScript / Bun / Docker / MySQL / Vitest / Codecov。
- 前端：主包 8 页 + 分包 5 页；`utils/env.js` 按 develop/trial/release 注入 baseUrl；`utils/monitor*.js` 8 模块由 `monitorUtil.init()` 启用；隐私授权链路（`utils/privacy.js` + `pages/privacy/`）代码侧已就绪。
- 测试：Jest 10 套件 / 137 用例；PHP 8 套件；E2E 4 套件（未进 CI）。

## 二、逐份文档变更清单

### A. 根级与社区文档

| 文档 | 更新内容 | 原因 / 依据 |
|------|---------|------------|
| `README.md` | 版本表格 `3.5.9`/`0.5.1` → `3.5.15`/`0.7.1`；术语改为「小程序端 / 插件端」；导入目录 `SutWxApp/SutWxApp/` → `SutWxApp/`；根站点构建从「零依赖」改为「依赖 express，需 npm install」；Tag 示例 `v3.0.8` → `v3.5.15`；多语言补 JSON 词条说明；baseUrl 改为 `utils/env.js` 自动注入 | 版本徽章、路径、依赖与运行步骤均与实况不符；`server.js` 实际 `require("express")` |
| `CHANGELOG.md` | 新增 `[3.5.15]` 小节（本次文档变更）；把错位的 `[Unreleased]` 移到文件头并标注「暂无未发布变更」；合并重复的 `## [3.2.0] - 2026-09-13` 标题；补 `[Unreleased]` / `[3.5.13]` 比较链接；补近两版 3.5.12 / 3.5.13 / 3.5.14 变更记录 | `[Unreleased]` 夹在 3.0.8 与 3.0.7 之间且内容重复；3.2.0 标题重复两次；历史条目保留原样不改 |
| `.github/CONTRIBUTING.md` | 项目定位改为双端同仓（去掉「纯前端、无后端」）；导入路径改 `SutWxApp/`；补 PHP 8.1+ 与插件单测说明；去掉 Prettier 推荐；`baseUrl` 改 `utils/env.js`；提交格式 `<type>:` → `<type>(<scope>):` 且 scope 必填；合并方式由「保留提交历史、不做 squash」改为 **Squash merge**；CI 工作流表补齐 6 个工作流与五 Job；版本同步清单补根包与插件三源；自检改为八项门禁 | 与实际 Git 工作流、CI、依赖、`package.json` scripts 不符 |
| `.github/PULL_REQUEST_TEMPLATE.md` | 提交规范要求补 scope；`ESLint + Prettier` → `npm run lint` + `npm run check`（八项）；版本同步清单补两个 `package.json`、README 徽章/表格、CHANGELOG、插件三源 | 项目未引入 Prettier；`check:version` 校验 4 处、`check:plugin-version` 校验插件 3 处 |
| `.github/SECURITY.md` | 「纯前端、不含后端与密钥」改为「双端同仓；凭证由 wp-config 常量或后台设置配置，不入库」；「外部 REST API」改为「同仓插件 `/api/*` 端点」 | 插件端与凭证治理机制实际存在 |
| `.github/SUPPORT.md` | **未改动** | 实查链接与流程均有效，无失真 |

### B. `docs/` 根级文档

| 文档 | 更新内容 | 原因 / 依据 |
|------|---------|------------|
| `docs/README.md` | 版本 v2.0.0 → v2.1.0；活动任务描述由「34 项」改为「12 项未完成」；`api/spec.md` 要点「未实现端点」→「24 端点唯一总表」；`features/spec.md` 要点改为「当前未实现能力清单」；版本历史补 2026-11-07 行 | 大量任务已完成归档，表述滞后；端点已全部实现 |
| `docs/AGENTS.md` | 插件注记 `PHP 7.4+ / /api/v1` → `PHP 8.1+ / sutwx/v1 + /api/* 重写`；硬红线中「三件套门禁」→「八项校验」；`readme.txt` 条目改为 REL-001 已修复；`globalData.baseUrl` 改为 `utils/env.js` 多环境注入；`check:version` 清单补两个 `package.json`；头部补对齐版本 3.5.15 | CI 实际为 PHP 8.1/8.3 矩阵、八项 check、锁文件已入库 |
| `docs/GLOSSARY.md` | v1.0.0 → v1.1.0；新增 §5.1「近期新增概念」10 条（八项门禁、资源门禁、语义化 ID 门禁、自动发布、健康拨测、隐私保护指引、环境配置表、幂等短锁、掉单兜底、锁文件） | 3.5.11~3.5.15 新增能力未登记标准术语 |
| `docs/PROJECT_OVERVIEW.md` | 分支 `develop` → `dev`、`bugfix` → `fix/hotfix`；导入路径改 `SutWxApp/`；删除「支持 Flutter 跨平台」虚构条目；v2.0.0 历史条目标注初期规划已实现 | 分支与目录实况；本仓库从未引入 Flutter |
| `docs/tasks.md` | 当前状态同步 `3.5.15`；补 3.5.12（源码拆分 / 幂等锁修复 / 两门禁 / 根包更名）、3.5.13（自动发布）、3.5.14（隐私授权 COM-001 / FE-010 / FE-009 代码侧）更新说明；REL-002 标注「已关闭，仅历史记录」；六大差距加「评估快照，不代表当前状态」注记并逐条标注差距 4/5/6 已关闭、差距 2 代码侧已就绪、差距 3 仍待外部资源；后端单测 6 → 8 套件；客户端监控「未启用」改为「已启用」 | 评估快照停留在 2026-11-04，与 3.5.14 代码实况严重脱节 |
| `docs/tasks-done.md` | **未改动** | 归档记录属历史，按约定保留原术语与旧版本号 |

### C. `docs/specs/` 规范文档

| 文档 | 更新内容 | 原因 / 依据 |
|------|---------|------------|
| `api/spec.md` | 删除旧版「产品 API」「订单 API」两整段 `/api/v1/*` 契约（约 121 行）；头部改为 `sutwx/v1` + `/api/*` 24 端点；URL 结构模板改 `/api/<业务域>/<动作>`；删除用户名密码注册登录 JSON 示例，改 `wx.login` code 请求体；错误响应示例改为 `WP_Error` 包络；鉴权命名空间改 `sutwx/v1`；监控上报 API 由「规划中 / 后端 404」改为「已实现」并补真实请求体与响应；支付回调注明免鉴权验签；`check:docs` 行为描述改为实际三处比对；单测六套件→八套件；`user/info` 的 `points` 标注为 DTO 占位字段；版本历史补 3.5.13 | 插件 `includes/rest/` 实为 24 个端点；`/api/v1` 契约、用户名密码体系从未存在；`class-rest-monitor.php` 已实现 |
| `backend/spec.md` | 引言由「v1 只读 MVP、鉴权/订单支付仅预留」改为「24 端点完整电商闭环」；PHP ≥7.4 → ≥8.1（CI 8.1/8.3）；「独立仓库」改为「本仓库 `sutwx-app-api/` 子目录」；目录树按实际重画（补 `class-error-log.php`、`class-pay-cron.php`、`class-pay-refund.php`、banner/health/monitor 控制器、8 套件等）；商品 DTO 补 `isFavorite`/`rating`/`reviewCount` 并注明 `check:contract` 22 字段；订单支付段补幂等短锁、Cron 兜底、自动退款、退款回调；「未实现端点」表改为「已实现端点」表；监控段由「零日志」改为结构化日志 + 客户端上报 + 健康拨测；版本管理补插件三源与 `check:plugin-version`；版本历史补 0.7.1 | 代码已实现 BE-008~014、OPS-005 等任务，文档仍停在 2026-11-04 |
| `features/spec.md` | **整篇按代码实况重写**（611 行 → 约 150 行）：删除 30+ 个 `/api/v1/*` 契约、积分系统/社交功能/消息通知三整章、手机号登录、RBAC、优惠券/评价/收藏等虚构能力；改为 10 章：内容与商品、用户与登录、购物车与订单、支付与退款、主题换肤、监控与可观测、性能与安全、当前未实现能力清单 | 原文档过半内容无代码实现，补丁式修改会留下内部矛盾；新增第 9 节明确列出未实现能力以免再次误读 |
| `data/spec.md` | **整篇按代码实况重写**（672 行 → 约 155 行）：删除 MySQL 建表 / InnoDB 外键 / Spring 事务传播 / mysqldump 备份 / 数据库账号授权、TypeScript 装饰器与 `class-validator` / bcrypt 示例；改为 DTO 与包络、分页约定、订单状态机、本地存储键与 LRU 缓存、WP 侧 sanitize 校验、`check:contract` 变更流程 | 项目无本地数据库、无 TypeScript、无 ORM；数据由 WP+WC 站点侧持久化 |
| `testing/spec.md` | **整篇按代码实况重写**（549 行 → 约 110 行）：清除 `.test.ts` / `vi.fn()` / Vitest / Codecov / miniprogram-simulate / `bun test` 残留；改为 Jest（CommonJS）+ PHP 8 套件 + 8 项静态门禁 + CI 五 Job + 本地复现命令；补 `npm ci`、覆盖率归档、E2E 4 套件、「假绿」防护与新增功能测试要求 | 项目为纯 JS + Jest 30，第三方覆盖率托管与 Vitest 均不存在 |
| `user-guide/spec.md` | **整篇按代码实况重写**（290 行 → 约 150 行）：目录树改为真实结构（补 `models/` `behaviors/` `styles/` `scripts/` `__tests__/` 与插件端）；服务层示例改 `require` + `unwrap`；删除 TypeScript 服务层、RBAC、手机号登录、积分/优惠券章节；补 `utils/env.js` 多环境配置、八项门禁 FAQ、真实订单状态机与权限模型 | 原「代码结构」含 `routes/` `controllers/` `repositories/` 等不存在的目录 |
| `design/spec.md` | 版本 v3.1.1 → v3.5.3 并注明「设计规范版本独立于产品版本」；令牌事实来源 `app.wxss v3.0.0` → `styles/tokens.wxss v3.5.3`（`app.wxss` 仅 8 行 `@import`）；补品牌衍生渐变令牌说明；「核心 6 页」→「主包 8 页 + 分包 5 页」；§8 脏值纠正清单（约 55 行历史行号）归档为「已完成」并作废旧行号；版本历史补 3.5.3 | 令牌定义在 `styles/tokens.wxss`；旧红橙脏值已清零；原清单行号随样式分片失效 |
| `architecture/spec.md` | 项目定位改双端同仓；多语言补 JSON 词条；baseUrl 改 `utils/env.js`；鉴权 `/auth/*` → `/api/auth/*` 并注明 24 端点；阶段基线由「v1 只读 MVP、订单支付预留」改为当前能力清单；`sanitizeHtml()` 位置 `utils/request.js` → `utils/request-security.js`（补 `richtext.js`）；401 由「清空登录态跳首页」改为「单飞刷新重放，失败才登出」；`monitor.js` → 8 模块 + `init()`；部署段补 CI 上传与自动发布；版本历史补 3.5.13 | 与 `request-auth.js`、`monitor*.js`、工作流实况不符（CSRF 处理经核实确实存在，予以保留） |
| `development/spec.md` | v3.0.0 → v3.1.0 并补对齐版本；修复 §2 代码块围栏错位（表格被包进代码块）；脚本清单补 `check:images` / `check:ids` / `generate-ui-icons.js` / `e2e/run-e2e.js`，去掉重复行并注明 8 项 check；`bun.lock` 表述改为已清理、lockfile 已入库、统一 `npm ci`；模板示例版本 `3.5.10` / `0.5.3` → 当前版本；六套件 → 八套件 | 门禁脚本已扩至 8 项；格式破损影响渲染 |
| `ops/spec.md` | 版本 3.0.8 → 3.1.0；运维范围由「纯前端、无后端」改为含同仓插件端；三项门禁 → 五 Job；删除「lockfile 未提交」已知问题；发布流程改为 **自动发布为主、手动 Tag 兜底**；dependabot 由「未配置」改为「`.github/dependabot.yml` 每周检查」；健康拨测与告警、凭证治理补入；PR 必需检查由 3 项 → 5 Job；版本历史补 3.1.0 | `auto-release.yml` / `dependabot.yml` / `health-probe.yml` 均已存在且运行 |
| `project/spec.md` | 技术定位改双端同仓；去「纯前端」表述；接口约定改 `sutwx/v1` + `/api/*` 24 端点 + `/api/auth/*`；规划能力段把支付/监控列为已实现并指向 `features/spec.md` 第 9 节；规范索引表 19 端点 → 24；PHP 单测 6 → 8 套件；版本记录补 2.1.0 | 与插件端、端点总数与测试套件实况不符 |
| `wordpress-plugin/DEVELOPMENT_PLAN.md` | v1 只读 MVP → 完整电商闭环 24 端点；鉴权「预留」改为 BE-003 已实现；`/api/users/login` → `/api/auth/login`；「验证 6 个端点」改为「验证内容端点」；测试策略补 PHP 8 套件；验收总览 5 项勾选更新（真实站点联调仍标未完成并指向 INF-003/INF-001） | 计划文档停留在初期只读阶段，与已实现能力脱节 |

### D. 代码侧版本展示位（随 patch bump 同步）

| 文件 | 更新内容 | 原因 |
|------|---------|------|
| `SutWxApp/package.json` | `version` 3.5.14 → **3.5.15** | 按用户规则：任何文件修改须 bump 一次最小版本 |
| `SutWxApp/package-lock.json` | 顶层 `version` 与 `packages[""].version` 由 3.5.10 → **3.5.15**（原停在 3.5.10，属历史漂移） | 锁文件与 package.json 版本一致 |
| `SutWxApp/app.js` | `globalData.version` → 3.5.15；头注释版本号 3.5.12 → 3.5.15 | 仅被改动文件的头注释同步（用户规则） |
| `README.md` / `CHANGELOG.md` / `docs/tasks.md` | 徽章、表格、Tag 示例、首个版本小节、当前状态声明全部同步 3.5.15 | `check:version` 与 `check:docs` 的校验点 |

## 三、删除的废弃 / 虚构内容汇总

1. **旧接口契约**：`/api/v1/*` 全套路径、`/api/users/login`、用户名密码注册登录、手机号验证码登录、用户名密码 / 邮箱 / 手机号的请求与错误示例。
2. **虚构功能模块**：积分系统（获取/使用/明细/规则/过期清理）、社交（点赞/收藏/评价/关注）、消息通知、优惠券、服务端购物车与地址簿、搜索建议、三级分类独立契约、RBAC 角色权限。
3. **虚构技术栈**：MySQL 建表与 InnoDB 外键、Spring 事务传播、mysqldump 备份、数据库账号授权、TypeScript 接口与装饰器、`class-validator` / `class-transformer` / bcrypt、Vitest / `vi.fn()` / `.test.ts`、Codecov / Coveralls、miniprogram-simulate、Bun 测试框架、Docker、Express 之外的后端分层（`routes/` `controllers/` `repositories/`）、Flutter。
4. **过时状态**：「服务层零日志」「监控端点 404」「banner / health 未实现」「鉴权与订单支付仅预留」「仓库无 lockfile，`npm ci` 失败」「dependabot 未配置」「手动打 Tag 发版」「六套件 PHP 单测」「三项门禁 / 三件套」「核心 6 页」「不做 Squash merge」。
5. **失效路径与格式**：`SutWxApp/SutWxApp/`、根 `tests/` 作为测试目录、`bun.lock` 作为现存文件、`v3.0.8` 示例、`design/spec.md` 的历史脏值行号、`development/spec.md` 错位的 Markdown 代码围栏、`CHANGELOG.md` 重复的 3.2.0 标题与错位的 `[Unreleased]`。
6. **保留的历史记录**（按「历史不回改」处理）：`CHANGELOG.md` 历史版本条目、`docs/tasks-done.md` 归档、`tasks.md` 的 2026-11-04 评估快照（已加醒目注记说明不代表当前状态）。

## 四、验证结果

| 校验 | 命令 | 结果 |
|------|------|------|
| 八项一致性门禁 | `npm run check` | 全绿（version / config / images / ids / contract / bundle / plugin-version / docs） |
| 端点与版本声明 | `node SutWxApp/scripts/check-docs.js` | PASS：扫描 24 端点（免鉴权 14），文档端点引用 30 条，版本声明一致 |
| 版本四处一致 | `node SutWxApp/scripts/check-version.js` | PASS：3.5.15（package.json / app.js / README 徽章 / CHANGELOG 首节） |
| ESLint | `npm run lint` | 0 error |
| Jest | `npx jest --silent` | 10 套件 / 137 用例通过 |

**未执行**：干净环境 `npm ci`（本机已有 `node_modules`）、E2E（需微信开发者工具自动化端口）、PHP 本地单测（本机无 PHP，由 CI 的 8.1 / 8.3 矩阵承担）。

## 五、仍存在疑问或需人工确认的部分

| # | 事项 | 说明与建议 |
|---|------|-----------|
| 1 | **四份文档为整篇重写** | `features/data/testing/user-guide/spec.md` 由 611/672/549/290 行重写为 150/155/110/150 行，删除的历史章节若原本是「未来路线图」而非「已实现描述」，建议确认是否另建独立路线图文档保存，本轮按「与代码实况一致」优先处理 |
| 2 | **仓库根 `package.json` 版本独立** | 根包 `sut-wx-app` 仍为 `3.5.13`，小程序包为 `3.5.15`；`check:version` 只校验小程序四处，不校验根包。是否要求两者统一？统一需明确根包是否参与发版 |
| 3 | **插件版本未随本轮 bump** | 插件仍为 `0.7.1`（三源由 `check:plugin-version` 校验通过）。本轮未改插件代码或三源，仅对齐 `backend/spec.md`；若按「任何文件修改都 bump」的严格解读，插件应同步到 `0.7.2` 并连带 `tasks.md` 声明，请确认口径 |
| 4 | **设计规范版本语义** | `design/spec.md` 标注 v3.5.3（对应 `styles/tokens.wxss` 头注释），与产品版本 3.5.15 双轨。已注明「设计规范版本独立于产品版本」，是否保留双轨请确认 |
| 5 | **原型产物版本标注** | `prototype/README.md` 与原型 HTML 的 v3.1.1 等标注本轮仅做路径级校验，未逐行核对；原型是独立单文件产物，是否纳入版本同步清单（用户规则要求原型 title/README 同步）需确认 |
| 6 | **文档入口重叠** | `docs/PROJECT_OVERVIEW.md` 与 `docs/README.md` 内容部分重叠（项目定位、目录结构、版本历史）。是否合并为单一入口，避免再次出现两份文档各自漂移 |
| 7 | **历史术语保留** | `CHANGELOG.md` 历史条目、`docs/tasks-done.md` 中的旧术语（前端/后端、6 套件等）按「历史记录不回改」保留。若希望全仓术语零残留，需另做一次历史文本批量替换 |
| 8 | **并行会话交错** | 会话间隙有外部提交 `667bad0`（隐私指引 + COM-001 / FE-010 / FE-009 代码侧），本轮部分文档修改已随该提交入库，剩余 19 个文件为工作区变更。若并行会话继续修改同一批文档，提交后建议复核合并结果 |
| 9 | **外部资源仍未闭环（非文档缺陷）** | 真实 AppID、ICP 备案与 request 合法域名、微信支付商户号与 API 证书、WooCommerce staging 联调、电商类目资质、mp 后台《用户隐私保护指引》发布仍待外部条件；已在 `docs/tasks.md` 标注为 12 项未完成任务中的阻塞项 |
| 10 | **lockfile 格式** | `SutWxApp/package-lock.json` 经 JSON 重排写入（仅 version 两处变化，name 与依赖树未改），换行符由 CRLF 变 LF；建议在 CI 干净 checkout 上跑一次 `npm ci` 做最终确认 |

## 六、提交与版本

- 本轮按用户规则 bump 一次 patch：小程序 `3.5.14` → **`3.5.15`**；插件保持 `0.7.1`（见待确认 #3）。
- 版本同步覆盖：两个 `package.json`、`package-lock.json`、`app.js`（含头注释）、README 徽章/表格/Tag 示例、`CHANGELOG.md` 首个版本小节、`docs/tasks.md` 当前状态，以及各文档头部的「对齐版本」行。
- 变更清单本身为交付物，不写入仓库。

