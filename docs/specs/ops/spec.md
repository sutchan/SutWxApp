<!--
文件名: spec.md
版本号: 3.1.1
更新日期: 2026-11-14
作者: Sut
描述: SutWxApp 运维与发布规范，含 CI/CD 五 Job 与自动发布、工作流复用组件、八项质量门禁、生产部署 Runbook、wp-config 常量全表、监控告警与健康拨测、凭证治理与 WordPress 安全基线
-->

# 运维与发布规范

## 目的

本规范定义苏铁微信小程序（SutWxApp）的发布流程、版本管理、线上监控、团队权限与常见故障处理，确保小程序稳定、可回溯地交付。

> 本仓库包含小程序端、同仓 WordPress 插件端（`sutwx-app-api/`）与站点预览服务；WordPress 运行时与数据库不在仓库内，由站点侧承载。运维范围因此同时覆盖：小程序发布、插件部署与升级、站点健康拨测、凭证治理与故障处置。

## 发布流程

微信小程序的发布依托微信公众平台，整体流程如下：

### 1. 本地开发与构建
- 在微信开发者工具中完成功能开发与自测
- 开启「上传时自动压缩」「代码压缩」
- 通过「编译」「预览」在模拟器与真机验证

### 2. 上传代码包
- 点击开发者工具「上传」按钮，填写版本号与项目备注
- 上传后代码包出现在公众平台「版本管理 > 开发版本」

### 3. 提交审核
- 在公众平台将开发版本提交审核
- 填写功能页面路径与测试账号（如涉及登录态）
- 审核周期通常为数小时至 1–2 个工作日

### 4. 发布上线
- 审核通过后，在「审核版本」点击「发布」
- 发布后全量用户可见；可选择「分阶段发布」灰度放量

### 5. 回滚
- 小程序不支持直接回滚到旧版代码，但可：
  - 重新上传并发布上一稳定版本代码包
  - 或利用「体验版」先验证再全量发布
- 建议每次发布前在 Git 打 Tag，保留可重打的源码版本

## CI/CD 流水线

### 持续集成（GitHub Actions）

工作流 `ci.yml` 在 push（main / dev）、PR（目标 main / dev）与手动触发时执行五个 Job（lint / test / checks / site / php）的质量门禁，任一失败即阻断合并；特性分支由 PR 覆盖：

| 阶段 | 命令 | 说明 |
|------|------|------|
| 代码检查 | `npm run lint` | ESLint 校验全部 `.js` 源码与工程脚本 |
| 单元测试 | `npm run test:coverage` | Jest 运行 `__tests__/` 用例，覆盖率报告归档为 Artifact |
| 一致性校验 | `npm run check` | 八项门禁：版本、配置、图片资源、语义化 ID、前后端契约、包体、插件版本、文档一致性 |

运行环境为 `ubuntu-latest` + Node.js 20，工作目录 `SutWxApp/`；`ci.yml` 的 push 触发仅覆盖 `main` / `dev`，特性分支由 PR 触发（避免同一提交重复运行），同一分支的重复推送会取消上一次未完成的运行。

> `SutWxApp/package-lock.json` 已入库，`lint` 与 `test` Job 使用 `npm ci` 锁定安装依赖，并以该锁文件作为 npm 缓存键。环境准备统一由 `.github/actions/setup-node` 提供；站点构建与产物校验由 `.github/actions/build-site`（调用 `scripts/check-site-dist.js`）提供，CI 冒烟与 Pages 发布共用同一套校验。`release.yml` 为兼容「手动补发旧 Tag」保持自包含，不引用本地组件。

### 持续交付

- **Release（自动发布，默认路径）**：`ci.yml` 在 `main` 五个 Job 全绿后触发 `auto-release.yml`，按 `SutWxApp/package.json` 版本号、用 CI 已验证的提交 SHA 创建并推送 `v*.*.*` Tag（Tag 已存在或 CI 运行已过期则幂等跳过），随后显式派发 `release.yml`——`GITHUB_TOKEN` 推送的 Tag 不会再触发 push 事件工作流，必须走 `workflow_dispatch` 派发。`release.yml` 统一检出目标 Tag 代码、校验 Tag 与版本号一致、打包三份交付物（站点 / 小程序 / 插件）、抽取 `CHANGELOG.md` 对应小节创建 GitHub Release。手动推 Tag 或 `workflow_dispatch` 仅作补发兜底。
- **小程序上传**：`miniprogram-deploy.yml` 手动触发，经 `miniprogram-ci` 生成预览二维码（`preview`）或上传体验版（`upload`）；`release.yml` 在创建 Release 后于密钥齐备时自动执行一次 `upload`（未配置则跳过，不阻断发布）。两条链路共用 `.github/actions/upload-miniprogram` 的密钥校验与部署逻辑（Release 侧为兼容补发旧 Tag 保留等价的内联实现）。须在仓库 Secrets 配置 `MINIPROGRAM_PRIVATE_KEY`（上传密钥，必填）与 `MINIPROGRAM_APPID`（AppID，`project.config.json` 仍为占位值 `touristappid` 时必填）。
- **密钥安全**：上传私钥仅写入 `RUNNER_TEMP`（权限 600）、由 `trap`/结束步骤保证删除；`.gitignore` 已屏蔽 `private.*.key` 等文件，禁止入库。Secrets 一律经 `env` 或组件 `inputs` 传入，不直接插值进 shell。
- **代码包精简**：`project.config.json` 的 `packOptions.ignore` 与部署脚本的 `ignores` 保持一致，上传时忽略 `__tests__`、`scripts`、`node_modules`、`package*.json` 等开发文件。
- **依赖治理**：`.github/dependabot.yml` 每周检查 npm 开发依赖与 GitHub Actions 版本，以 PR 形式提出更新；Actions 的 minor/patch 更新聚合为单个 PR（`actions-updates` 分组），主版本更新仍单独评审。

### 质量门禁与合并要求

- 提交前本地执行 `npm run ci`（等价于 CI 全流程，需先 `npm ci` 安装依赖）
- PR 须 CI 全绿方可合并；建议在分支保护中将 `lint` / `test` / `checks` / `site` / `php` 五 Job 设为必需检查
- 发布 Tag 必须与项目版本号一致，由 `check-version.js` 强制校验

## 版本管理

### 版本号格式
采用语义化版本号 `MAJOR.MINOR.PATCH`：
- **MAJOR**：不兼容的接口/体验变更
- **MINOR**：向下兼容的新功能
- **PATCH**：向下兼容的问题修正

### 版本来源（单一来源）
- `SutWxApp/package.json` 的 `version`：工程与 CI 的权威版本号
- `app.js` 的 `globalData.version`：运行时展示版本（须与 `package.json` 一致）
- README 版本徽章与 `CHANGELOG.md` 首个版本小节：对外展示版本
- 上传代码包时填写的版本号：公众平台显示版本
- 以上各处由 `npm run check:version` 强制校验一致性，并在 CHANGELOG 中记录

### 发布检查清单
- [ ] 代码已合并至发布分支并打 Tag（Tag 名与版本号一致，如 `v3.5.13`）
- [ ] `package.json` 与 `globalData.version` 已更新，README 徽章与 CHANGELOG 已同步
- [ ] CI 流水线全部通过（lint / test / checks）
- [ ] 真机预览核心流程通过（登录、浏览、加购、下单）
- [ ] 线上监控无异常告警
- [ ] CHANGELOG 已追加本次版本说明

## 线上监控



### 监控指标



**客户端**（`utils/monitor*.js` 采集，经 `POST /api/monitor/data` 上报）：



- **JS 错误率**：`onError`、`onUnhandledRejection` 捕获的异常

- **请求成功率**：`utils/request.js` 返回的失败请求占比

- **平均响应时间**：网络请求耗时

- **白屏/启动耗时**：首屏渲染时间



**服务端**（`includes/class-error-log.php` 单行 JSON，落 `error_log`）：



| 事件 | 含义 | 来源 |

|------|------|------|

| `auth_failed` | 登录/刷新/鉴权失败 | `/api/auth/*`、受保护端点 |

| `rate_limited` | 触发限频 | 所有走限频的端点 |

| `pay_exception` | 支付异常（验签失败、金额不符、落库失败、退款失败） | `/api/pay/*`、`/api/order/cancel` |

| `rest_error` | 其他 5xx/4xx 业务错误 | REST 基类 `log_error()` |

| `monitor` | 客户端上报聚合 | `/api/monitor/data` |



**可用性**：`GET /api/health` 返回 `{version, php, wcActive, payConfigured}`，供拨测与发布验证。



### 告警规则



| 告警类型 | 阈值 | 严重程度 | 处置 |

|----------|------|----------|------|

| JS 错误率 | >1% | 严重 | 查 `monitor` 事件按页面聚合定位 |

| 请求错误率 | >5% | 警告 | 对照 `rest_error` 与网络错误分布 |

| 平均响应时间 | >2s | 警告 | 检查缓存命中与数据库慢查询 |

| `/api/health` 拨测失败 | 单轮重试 3 次仍失败 | 严重 | 先看 HTTPS 与 PHP-FPM，再看插件是否被停用 |

| `pay_exception` 频率 | >5 次/5 分钟 | 严重 | 区分验签失败（疑似伪造）与超时（微信侧） |

| `auth_failed` 突增 | >50 次/5 分钟 | 警告 | 疑似撞库，临时收紧限频或封 IP |

| `rate_limited` 突增 | >200 次/5 分钟 | 警告 | 判断是否被刷或前端重试风暴 |



### 告警通道



1. **外部拨测**：`.github/workflows/health-probe.yml` 每 15 分钟请求 `vars.PROBE_URL`（约 96 次/天），单轮最多重试 3 次以过滤网络抖动；非 200 或 `wcActive!=true` 即失败，并向 `secrets.WECOM_WEBHOOK`（企业微信机器人）推送含 HTTP 状态码的文本告警。未配置 `vars.PROBE_URL` 时定时运行不创建 Job（手动触发仍可用）；未配置 Webhook 时仅保留 Actions 失败记录。

2. **服务端日志告警**：主机侧用 `logtail`/`filebeat` 订阅 `error_log`，按上表关键字匹配后推送同一机器人；样例规则（rsyslog + curl）见下：



   ```bash

   # 逐行匹配 [sutwx] 日志中的严重事件并推送（示例，按实际日志路径调整）

   tail -F /var/log/php/error.log | grep --line-buffered -E '"event":"(pay_exception|auth_failed)"' | \

     while read -r line; do

       curl -sS -H 'Content-Type: application/json' \

         -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"[sutwx] ${line}\"}}" "$WECOM_WEBHOOK" > /dev/null

     done

   ```



3. **发布期**：Release 工作流失败同样推送机器人，避免带缺陷发版。



### 值班响应



| 级别 | 响应时限 | 动作 |

|------|----------|------|

| 严重（拨测失败 / `pay_exception` 突增） | 15 分钟 | 确认影响面 → 执行回滚或限流 → 记录时间线 |

| 警告（错误率 / 响应时间 / 限频突增） | 2 小时 | 定位根因，必要时排入当日修复 |

| 观察项（`payConfigured=false` 等配置类） | 次工作日 | 核对配置并补全会话记录 |



值班交接需包含：未闭环告警、当班已执行操作、次日待验证项。



### 日志管理



- 开发期：带 `[模块]` 前缀的 `console` 日志便于定位

- 生产期：经 `monitor.js` 收敛上报，避免敏感信息（Token、openid）外泄

- 服务端：单行 JSON、IP 脱敏（IPv4 去末段 / IPv6 取前 4 组）、字段截断 2048 字节

- 版本与错误上下文随上报一并记录，便于归因



## 团队权限管理

### 权限管理原则
- **最小权限原则**：成员仅拥有完成工作所需权限
- **职责分离原则**：开发、审核、发布由不同角色承担
- **定期审查原则**：定期检查成员权限，及时回收

### 公众平台角色
| 角色 | 说明 |
|------|------|
| 管理员 | 拥有账号全部权限，包括成员管理与发布 |
| 开发 | 可上传代码、体验预览，不可发布 |
| 体验者 | 可访问体验版，用于测试 |
| 运维/运营 | 可提交审核与发布（按需分配） |

### 权限分配流程
1. 管理员在公众平台「成员管理」中添加成员
2. 按职责分配角色（开发 / 体验者 / 运营）
3. 发布操作建议由管理员或受权运营执行
4. 人员变动时及时移除或调整权限

## 常见故障与处理

### 接口请求失败（网络/域名）
**症状**：`utils/request.js` 返回网络错误或持续失败。

**处理流程**：
1. 检查公众平台「服务器域名」是否已配置 request 合法域名（需 HTTPS）
2. 确认 `app.js` 的 `globalData.baseUrl` 指向正确的后端地址
3. 验证后端服务可用性与鉴权（Token 是否过期，401 会自动登出）

### 白屏 / 页面无法打开
**症状**：`onPageNotFound` 触发或页面空白。

**处理流程**：
1. 检查 `app.json` 的 `pages` / `subpackages` 路径是否与文件实际位置一致
2. 查看开发者工具编译报错，修复语法或引用错误
3. 真机清除小程序缓存后重试

### 登录态失效
**症状**：请求返回 401，用户被跳转首页。

**处理流程**：
1. 确认 `wx.login` 流程与后端登录接口正常
2. 检查本地存储的 `token` 是否被正确清除与写入
3. 重新触发登录流程

### 性能相关问题
**症状**：首屏慢、列表滚动卡顿。

**处理流程**：
1. 利用 `utils/request.js` 的 LRU 缓存减少重复请求
2. 检查是否大图未压缩（使用 `utils/compress-images.js`）
3. 确认分包页面已正确拆分为 `subpackages`，减小主包体积

## 生产部署 Runbook（OPS-004）



> 适用：WooCommerce 生产站点首次部署与日常升级。全部命令以站点根目录为工作目录。



### 1. 环境前置



| 项 | 要求 | 校验方式 |

|----|------|----------|

| PHP | 8.1 或 8.3（与 CI 矩阵同版本） | `php -v` |

| WordPress | 6.4+ | 后台「关于」页 |

| WooCommerce | 8.0+ | `wp plugin list` |

| HTTPS | 强制，证书链完整 | `curl -I https://<域名>/api/health` |

| 伪静态 | Apache `mod_rewrite` / Nginx `try_files` | `/api/health` 返回 200 而非 404 |



### 2. 首次安装



1. 上传 `sutwx-app-api-v<version>.zip`（由 `node SutWxApp/scripts/package-plugin.js` 生成，含 `readme.txt`）到 `wp-content/plugins/`，后台「插件」页启用。

2. 在 `wp-config.php` 写入常量（见下表），**常量优先于后台设置**，写入后设置页对应字段转为只读。

3. 后台「设置 → SutWxApp」核对：AppID 与小程序一致、支付凭证齐备、主题配置可选。

4. 冒烟：`GET /api/health` 返回 `{version, php, wcActive:true, payConfigured:true}`。

5. 微信公众平台配置 request 合法域名（`https://<域名>`），真机验证登录与商品列表。



### 3. `wp-config.php` 常量全表



| 常量 | 必填 | 说明 |

|------|------|------|

| `SUTWX_WX_APPID` | 是 | 小程序 AppID |

| `SUTWX_WX_APPSECRET` | 是 | 小程序 AppSecret（泄露即需重置） |

| `SUTWX_JWT_SECRET` | 是 | JWT 签名密钥，≥32 字符随机串 |

| `SUTWX_WX_MCHID` | 支付必填 | 微信支付商户号 |

| `SUTWX_WX_MCH_SERIAL` | 支付必填 | 商户 API 证书序列号 |

| `SUTWX_WX_MCH_KEY` | 支付必填 | 商户私钥 PEM（`apiclient_key.pem` 内容） |

| `SUTWX_WX_API_V3_KEY` | 支付必填 | APIv3 密钥（32 字节） |

| `SUTWX_WX_PLATFORM_SERIAL` | 建议 | 平台证书序列号，配置后强校验回调来源证书 |

| `SUTWX_TRUSTED_PROXIES` | 按需 | 反向代理 IP 列表，限频取真实 IP 用 |



> 未定义支付四项常量时 `/api/health` 的 `payConfigured` 为 `false`，支付端点返回 503。



### 4. 升级步骤



1. 备份：`wp db export backup-$(date +%F).sql`，并打包现有插件目录。

2. 停用插件 → 上传新版 zip 覆盖 → 启用（`wp plugin deactivate sutwx-app-api && wp plugin activate sutwx-app-api`）。

3. 校验版本：设置页头部版本号 = zip 版本 = `SUTWX_API_VERSION`。

4. 冒烟四连：`/api/health`、`/api/theme`、`/api/product/list`、下单到 prepay（0.01 元）。

5. 观察 30 分钟：`error_log` 无 `pay_exception` / `rest_error` 持续刷屏。



### 5. 缓存预热



分组缓存（theme / product / post / banner / category）在插件启用与配置保存时自动失效，首屏为冷启动。部署后按序预热：



```bash

curl -sf https://<域名>/api/theme > /dev/null

curl -sf "https://<域名>/api/banner/list" > /dev/null

curl -sf "https://<域名>/api/product/list?page=1&pageSize=10" > /dev/null

curl -sf "https://<域名>/api/category/list" > /dev/null

```



### 6. 回滚



1. 停用插件 → 恢复上一版插件目录 → 启用。

2. 数据库回滚仅在新版含不可逆变更时执行（`wp db import backup-<date>.sql`）。

3. 小程序端回滚：微信后台「版本管理 → 版本回退」至上一线上版本（仅支持回退一版）。

4. 回滚后必须重跑冒烟四连，并在 CHANGELOG 记录回滚原因。



## 密钥与凭证管理（SEC-003）



### 1. JWT 密钥轮换（双密钥过渡）



目标：轮换 `SUTWX_JWT_SECRET` 时在线用户不掉线。



| 步骤 | 操作 | 观察点 |

|------|------|--------|

| 1 | `openssl rand -base64 48` 生成新密钥，写入 `SUTWX_JWT_SECRET`，旧值暂存为过渡密钥 | `/api/health` 正常 |

| 2 | 观察 24 小时：新令牌用新密钥签发，旧令牌经过渡密钥校验 | 401 比例不上升 |

| 3 | 过渡窗口结束（建议 7 天，上限为 refresh 有效期 30 天）移除旧密钥 | 401 仅来自过期令牌 |

| 4 | 记录轮换时间与操作人至演练表 | — |



> 强制全量失效：移除过渡密钥后所有旧令牌立即失效，用于密钥泄露场景。



### 2. 支付凭证泄露处置



1. **立即**在微信支付商户平台「API 安全 → 重置 APIv3 密钥」，同时作废并重新申请商户 API 证书。

2. 更新 `wp-config.php` 的 `SUTWX_WX_API_V3_KEY` / `SUTWX_WX_MCH_SERIAL` / `SUTWX_WX_MCH_KEY`，停用再启用插件使平台证书缓存重建。

3. 导出近 7 天支付与退款记录，与商户平台账单逐笔核对，标记异常退款。

4. 检索 `error_log` 中 `pay_exception`（含 `signature_mismatch`、`serial_mismatch`）确认是否存在伪造回调尝试。

5. 48 小时内提交事件报告：泄露途径、影响范围、处置动作、加固项。



### 3. 令牌黑名单全量失效



- 触发条件：账号被盗、密钥疑似泄露、`auth_failed` 日志突增。

- 操作：清空黑名单 option（`sutwx_token_blacklist`）并轮换 JWT 密钥 → 全部会话失效。

- 恢复：通知用户重新登录；观察 `/api/auth/login` 成功率与错误率 30 分钟。



### 4. 演练记录模板



| 日期 | 演练项 | 执行人 | 耗时 | 用户影响 | 结论与改进 |

|------|--------|--------|------|----------|------------|

| YYYY-MM-DD | JWT 双密钥轮换 | | | 无感 | |

| YYYY-MM-DD | 支付凭证重置 | | | 支付暂停 N 分钟 | |

| YYYY-MM-DD | 黑名单全量失效 | | | 全员重登 | |



## WordPress 安全基线（SEC-004）



### 1. CORS 策略



- **当前实现：不输出任何 `Access-Control-Allow-Origin` 头**。小程序 `wx.request` 不受浏览器同源策略约束，无需 CORS；不开放跨域可避免接口被第三方网页脚本盗用。

- 若未来接入 Web 端，只对 `/wp-json/sutwx/v1/*` 中明确的公开读端点输出白名单来源，禁止 `*`，禁止携带 `Authorization` 的跨域预检。

- 复核周期：每次新增对外端点时同步评估是否需要 CORS。



### 2. 免鉴权端点清单（最小化复核）



| 端点 | 免鉴权理由 | 防护手段 |

|------|------------|----------|

| `GET /api/theme` | 小程序首屏主题 | 公开限频 60/分 |

| `GET /api/banner/list` | 运营位内容 | 公开限频 60/分 |

| `GET /api/product/list` `GET /api/product/detail` | 商品目录公开 | 公开限频 60/分 |

| `GET /api/category/list` `GET /api/category/detail` | 分类导航公开 | 公开限频 60/分 |

| `GET /api/post/list` `GET /api/post/detail` | 内容公开 | 公开限频 60/分 |

| `GET /api/health` | 运维拨测 | 公开限频 60/分，仅暴露版本与布尔量 |

| `POST /api/auth/login` | 换取令牌入口 | 公开限频 + code2session 校验 |

| `POST /api/auth/refresh-token` | 刷新入口 | refresh token 校验 |

| `POST /api/pay/notify` | 微信支付回调 | 平台证书验签 + 5 分钟时间窗 + 金额校验 |

| `POST /api/pay/refund-notify` | 微信退款回调 | 同上 |

| `POST /api/monitor/data` | 客户端监控上报 | 监控限频 10/分 + 字段白名单 |



> 新增免鉴权端点必须同步登记本表与安全审计清单，未登记即视为缺陷（由 `check-docs.js` 巡检）。



### 3. 后台与主机加固



| 项 | 要求 |

|----|------|

| wp-admin 访问限制 | 仅允许运维固定 IP 或 VPN 访问（Nginx `allow/deny` 或 Cloudflare Access），小程序 API 不受影响 |

| 登录保护 | 强口令 + 登录尝试限制 + 管理员二次验证 |

| 目录权限 | 插件目录 755 / 文件 644，`wp-config.php` 600 |

| 文件编辑 | `DISALLOW_FILE_EDIT` 置 `true` |

| 调试输出 | 生产 `WP_DEBUG=false`、`WP_DEBUG_DISPLAY=false`，错误只入 `error_log` |

| 插件治理 | 仅保留在用插件，删除未使用插件与主题 |



## 负载与缓存演练预案（QA-009）



> 依赖 INF-003 staging 环境就绪后执行，结果填入记录表并作为生产容量基线。



### 1. 演练项与判定



| 演练 | 方法 | 判定标准 |

|------|------|----------|

| 缓存命中 | 连续请求 `/api/product/list` 与 `/api/theme` 100 次 | 第 2 次起耗时 < 首次 30% |

| 分组失效 | 后台保存 banner 配置后立即请求 `/api/banner/list` | 返回新配置，其他分组缓存不受影响 |

| 公开限频 | 1 分钟对 `/api/theme` 发 70 次 | 第 61 次起 429，`X-RateLimit-Remaining` 为 0 |

| 鉴权限频 | 单 IP 1 分钟发 35 次 `/api/order/list` | 第 31 次起 429 |

| 支付限频 | 1 分钟发 15 次 `/api/pay/prepay` | 第 11 次起 429，且不计入公开桶 |

| 限频响应体 | 读取 429 响应 | 统一包络 `sutwx_rate_limited`，含 `Retry-After` |



### 2. 记录表



| 日期 | 环境 | 演练项 | 实测值 | 结论 |

|------|------|--------|--------|------|

| | staging | | | |



## 小程序隐私合规清单（COM-001 / FE-010）



> 代码侧已就绪；**仍待外部项**：mp 后台填写《用户隐私保护指引》并发布、真实 AppID（INF-001）、真机授权与拒绝路径回归。未完成后 COM-001 / FE-010 不得标记完成。



### 1. 配置与全局链路



| 项 | 实现 | 位置 |

|----|------|------|

| 隐私校验开关 | `__usePrivacyCheck__: true` | `app.json` 根与 `setting`、`project.config.json` 的 `setting` |

| 最低基础库 | 2.32.3（运行时 `wx.getSystemInfoSync().SDKVersion` 比对，低版本弹窗提示） | `app.js` → `checkBaseLibrary()` |

| 全局授权监听 | `wx.onNeedPrivacyAuthorization` → 存 `globalData.privacyResolve` → 跳 `/pages/privacy/index` | `app.js` → `registerPrivacyGuard()` |

| 授权页同意按钮 | `<button id="privacy-agree-btn" open-type="agreePrivacyAuthorization" bindagreeprivacyauthorization="onAgree">`，回传 `buttonId` 给官方 resolve | `pages/privacy/index.*` |

| 低版本降级 | 能力探测失败时不注册监听，`ensurePrivacyAuthorization()` 返回 true，业务按旧逻辑执行 | `utils/privacy.js` |

| 提前离开兜底 | 授权页 `onUnload` 释放 resolve（`event: disagree`），避免隐私接口调用永久挂起 | `pages/privacy/index.js` |



### 2. 隐私接口清单（与 `utils/privacy.js` 的 `PRIVACY_APIS` 一一对应）



| 接口 | 使用场景 | 调用位置 | 前置检查 | 拒绝兜底 |

|------|----------|----------|----------|----------|

| `wx.getUserProfile` | 完善用户资料 | `helpers-auth.js` | `ensurePrivacyAuthorization()` | reject `用户未同意隐私保护指引` |

| `chooseAvatar` | 用户中心选择头像 | `pages/user/index` | 微信按 `__usePrivacyCheck__` 自动触发 | 回调无 `avatarUrl` 时 toast「需同意隐私指引后设置头像」 |

| `input[type=nickname]` | 用户中心填写昵称 | `pages/user/index` | 用户主动输入，不主动取值 | 空值不覆盖已有昵称 |

| `wx.makePhoneCall` | 帮助中心联系客服 | `pages/help/index.js` | `withPrivacy()` | toast「需同意隐私指引后拨打」 |

| `wx.openCustomerServiceChat` | 商品页客服会话 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |

| `wx.setClipboardData` | 商品页复制链接 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |



> 新增隐私接口必须先登记 `PRIVACY_APIS` 与本表，并在 mp 后台同步勾选对应信息类型，否则上线后接口会被微信拦截。



### 3. mp 后台待填字段（外部）



| 字段 | 对应接口 | 建议填写 |

|------|----------|----------|

| 头像、昵称 | `getUserProfile` / `chooseAvatar` / `nickname` | 仅用于展示个人中心资料，不用于其他目的 |

| 手机号 | `makePhoneCall` | 拨打客服电话，不回传、不存储号码 |

| 订单与交易信息 | `/api/order/*`（服务端，非微信隐私接口） | 用于下单、发货与售后 |

| 剪贴板 | `setClipboardData` | 仅写入分享链接，不读取剪贴板内容 |



### 4. 设置页对齐结果



- 保留「隐私浏览模式」本地开关，并明确标注「仅本地保存浏览偏好，不影响微信隐私授权」。

- 移除伪装成权限开关的「位置授权」，改为三个真实入口：隐私授权页、`wx.openSetting()` 系统权限页、`wx.openPrivacyContract()` 官方指引。

- 用户中心头像改为 `chooseAvatar` 选择器、昵称改为 `type="nickname"` 输入框；本地编辑结果存 `userProfile`，与 `/api/user/info` 远端资料解耦，退出登录时清除。



## E2E 发版前手动清单（QA-008 降级方案）



> `miniprogram-automator` 依赖微信开发者工具 CI 授权，当前无法稳定进 CI，按任务口径降级为发版前人工执行清单。执行人须逐项签核，未通过不得提交审核。



### 1. 执行前准备



1. 本地微信开发者工具已登录具备调试权限的账号，打开 `SutWxApp/` 项目并开启服务端口。

2. `npm ci` 安装依赖；`npm run ci` 全绿（lint / check / 137 Jest 用例）。

3. `npm run check:images`、`npm run check:bundle` 单独复跑；上传前可按需执行 `npm run assets:compress`（`sharp` 未安装时跳过，不阻断）。

4. `npm run deploy:upload -- --compress` 会用 `check-images.js` 做上传前门禁；真实 AppID 与私钥就绪后执行。



### 2. 四套件（`npm run test:e2e`）



| 套件 | 覆盖 | 通过标准 |

|------|------|----------|

| 首页与搜索 | 首屏渲染、分类跳转、搜索 | 无报错，列表非空 |

| 商品详情 | 详情加载、加购、收藏、客服入口 | 加购后购物车角标 +1 |

| 购物车 | 数量增减、删除、结算跳转 | 金额与数量一致 |

| 登录守卫 | 未登录拦截、登录后回跳 | 401 清理登录态且无残留 |



### 3. 核心页面回归（iOS / Android 各 2 台）



| # | 页面路径 | 检查点 |

|---|----------|--------|

| 1 | `pages/home/index` | 主题、轮播、商品列表、下拉刷新 |

| 2 | `pages/category/index` | 分类切换、商品筛选 |

| 3 | `pages/product/index` | 详情、SKU、加购、分享、客服 |

| 4 | `pages/cart/index` | 数量、金额、去结算 |

| 5 | `pages/order/confirm` | 地址、金额、提交订单 |

| 6 | `pages/order/index` | 订单列表与状态筛选 |

| 7 | `pages/order/detail` | 状态、物流、取消/确认收货 |

| 8 | `pages/user/index` | 登录态、头像/昵称选择器、隐私授权弹窗、设置页入口 |

| 9 | `pages/privacy/index` | 同意 / 拒绝 / 查看指引 / 手势返回四条路径 |



### 4. 签核表



| 版本 | 日期 | 执行人 | 四套件 | 真机矩阵 | 遗留问题 | 结论 |

|------|------|--------|--------|----------|----------|------|

| | | | | | | |



## 小程序隐私合规清单（COM-001 / FE-010）



> 代码侧已就绪；**仍待外部项**：mp 后台填写《用户隐私保护指引》并发布、真实 AppID（INF-001）、真机授权与拒绝路径回归。未完成后 COM-001 / FE-010 不得标记完成。



### 1. 配置与全局链路



| 项 | 实现 | 位置 |

|----|------|------|

| 隐私校验开关 | `__usePrivacyCheck__: true` | `app.json` 根与 `setting`、`project.config.json` 的 `setting` |

| 最低基础库 | 2.32.3（运行时 `wx.getSystemInfoSync().SDKVersion` 比对，低版本弹窗提示） | `app.js` → `checkBaseLibrary()` |

| 全局授权监听 | `wx.onNeedPrivacyAuthorization` → 存 `globalData.privacyResolve` → 跳 `/pages/privacy/index` | `app.js` → `registerPrivacyGuard()` |

| 授权页同意按钮 | `<button id="privacy-agree-btn" open-type="agreePrivacyAuthorization" bindagreeprivacyauthorization="onAgree">`，回传 `buttonId` 给官方 resolve | `pages/privacy/index.*` |

| 低版本降级 | 能力探测失败时不注册监听，`ensurePrivacyAuthorization()` 返回 true，业务按旧逻辑执行 | `utils/privacy.js` |

| 提前离开兜底 | 授权页 `onUnload` 释放 resolve（`event: disagree`），避免隐私接口调用永久挂起 | `pages/privacy/index.js` |



### 2. 隐私接口清单（与 `utils/privacy.js` 的 `PRIVACY_APIS` 一一对应）



| 接口 | 使用场景 | 调用位置 | 前置检查 | 拒绝兜底 |

|------|----------|----------|----------|----------|

| `wx.getUserProfile` | 完善用户资料 | `helpers-auth.js` | `ensurePrivacyAuthorization()` | reject `用户未同意隐私保护指引` |

| `chooseAvatar` | 用户中心选择头像 | `pages/user/index` | 微信按 `__usePrivacyCheck__` 自动触发 | 回调无 `avatarUrl` 时 toast「需同意隐私指引后设置头像」 |

| `input[type=nickname]` | 用户中心填写昵称 | `pages/user/index` | 用户主动输入，不主动取值 | 空值不覆盖已有昵称 |

| `wx.makePhoneCall` | 帮助中心联系客服 | `pages/help/index.js` | `withPrivacy()` | toast「需同意隐私指引后拨打」 |

| `wx.openCustomerServiceChat` | 商品页客服会话 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |

| `wx.setClipboardData` | 商品页复制链接 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |



> 新增隐私接口必须先登记 `PRIVACY_APIS` 与本表，并在 mp 后台同步勾选对应信息类型，否则上线后接口会被微信拦截。



### 3. mp 后台待填字段（外部）



| 字段 | 对应接口 | 建议填写 |

|------|----------|----------|

| 头像、昵称 | `getUserProfile` / `chooseAvatar` / `nickname` | 仅用于展示个人中心资料，不用于其他目的 |

| 手机号 | `makePhoneCall` | 拨打客服电话，不回传、不存储号码 |

| 订单与交易信息 | `/api/order/*`（服务端，非微信隐私接口） | 用于下单、发货与售后 |

| 剪贴板 | `setClipboardData` | 仅写入分享链接，不读取剪贴板内容 |



### 4. 设置页对齐结果



- 保留「隐私浏览模式」本地开关，并明确标注「仅本地保存浏览偏好，不影响微信隐私授权」。

- 移除伪装成权限开关的「位置授权」，改为三个真实入口：隐私授权页、`wx.openSetting()` 系统权限页、`wx.openPrivacyContract()` 官方指引。

- 用户中心头像改为 `chooseAvatar` 选择器、昵称改为 `type="nickname"` 输入框；本地编辑结果存 `userProfile`，与 `/api/user/info` 远端资料解耦，退出登录时清除。



## E2E 发版前手动清单（QA-008 降级方案）



> `miniprogram-automator` 依赖微信开发者工具 CI 授权，当前无法稳定进 CI，按任务口径降级为发版前人工执行清单。执行人须逐项签核，未通过不得提交审核。



### 1. 执行前准备



1. 本地微信开发者工具已登录具备调试权限的账号，打开 `SutWxApp/` 项目并开启服务端口。

2. `npm ci` 安装依赖；`npm run ci` 全绿（lint / check / 137 Jest 用例）。

3. `npm run check:images`、`npm run check:bundle` 单独复跑；上传前可按需执行 `npm run assets:compress`（`sharp` 未安装时跳过，不阻断）。

4. `npm run deploy:upload -- --compress` 会用 `check-images.js` 做上传前门禁；真实 AppID 与私钥就绪后执行。



### 2. 四套件（`npm run test:e2e`）



| 套件 | 覆盖 | 通过标准 |

|------|------|----------|

| 首页与搜索 | 首屏渲染、分类跳转、搜索 | 无报错，列表非空 |

| 商品详情 | 详情加载、加购、收藏、客服入口 | 加购后购物车角标 +1 |

| 购物车 | 数量增减、删除、结算跳转 | 金额与数量一致 |

| 登录守卫 | 未登录拦截、登录后回跳 | 401 清理登录态且无残留 |



### 3. 核心页面回归（iOS / Android 各 2 台）



| # | 页面路径 | 检查点 |

|---|----------|--------|

| 1 | `pages/home/index` | 主题、轮播、商品列表、下拉刷新 |

| 2 | `pages/category/index` | 分类切换、商品筛选 |

| 3 | `pages/product/index` | 详情、SKU、加购、分享、客服 |

| 4 | `pages/cart/index` | 数量、金额、去结算 |

| 5 | `pages/order/confirm` | 地址、金额、提交订单 |

| 6 | `pages/order/index` | 订单列表与状态筛选 |

| 7 | `pages/order/detail` | 状态、物流、取消/确认收货 |

| 8 | `pages/user/index` | 登录态、头像/昵称选择器、隐私授权弹窗、设置页入口 |

| 9 | `pages/privacy/index` | 同意 / 拒绝 / 查看指引 / 手势返回四条路径 |



### 4. 签核表



| 版本 | 日期 | 执行人 | 四套件 | 真机矩阵 | 遗留问题 | 结论 |

|------|------|--------|--------|----------|----------|------|

| | | | | | | |



## 小程序隐私合规清单（COM-001 / FE-010）



> 代码侧已就绪；**仍待外部项**：mp 后台填写《用户隐私保护指引》并发布、真实 AppID（INF-001）、真机授权与拒绝路径回归。未完成后 COM-001 / FE-010 不得标记完成。



### 1. 配置与全局链路



| 项 | 实现 | 位置 |

|----|------|------|

| 隐私校验开关 | `__usePrivacyCheck__: true` | `app.json` 根与 `setting`、`project.config.json` 的 `setting` |

| 最低基础库 | 2.32.3（运行时 `wx.getSystemInfoSync().SDKVersion` 比对，低版本弹窗提示） | `app.js` → `checkBaseLibrary()` |

| 全局授权监听 | `wx.onNeedPrivacyAuthorization` → 存 `globalData.privacyResolve` → 跳 `/pages/privacy/index` | `app.js` → `registerPrivacyGuard()` |

| 授权页同意按钮 | `<button id="privacy-agree-btn" open-type="agreePrivacyAuthorization" bindagreeprivacyauthorization="onAgree">`，回传 `buttonId` 给官方 resolve | `pages/privacy/index.*` |

| 低版本降级 | 能力探测失败时不注册监听，`ensurePrivacyAuthorization()` 返回 true，业务按旧逻辑执行 | `utils/privacy.js` |

| 提前离开兜底 | 授权页 `onUnload` 释放 resolve（`event: disagree`），避免隐私接口调用永久挂起 | `pages/privacy/index.js` |



### 2. 隐私接口清单（与 `utils/privacy.js` 的 `PRIVACY_APIS` 一一对应）



| 接口 | 使用场景 | 调用位置 | 前置检查 | 拒绝兜底 |

|------|----------|----------|----------|----------|

| `wx.getUserProfile` | 完善用户资料 | `helpers-auth.js` | `ensurePrivacyAuthorization()` | reject `用户未同意隐私保护指引` |

| `chooseAvatar` | 用户中心选择头像 | `pages/user/index` | 微信按 `__usePrivacyCheck__` 自动触发 | 回调无 `avatarUrl` 时 toast「需同意隐私指引后设置头像」 |

| `input[type=nickname]` | 用户中心填写昵称 | `pages/user/index` | 用户主动输入，不主动取值 | 空值不覆盖已有昵称 |

| `wx.makePhoneCall` | 帮助中心联系客服 | `pages/help/index.js` | `withPrivacy()` | toast「需同意隐私指引后拨打」 |

| `wx.openCustomerServiceChat` | 商品页客服会话 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |

| `wx.setClipboardData` | 商品页复制链接 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |



> 新增隐私接口必须先登记 `PRIVACY_APIS` 与本表，并在 mp 后台同步勾选对应信息类型，否则上线后接口会被微信拦截。



### 3. mp 后台待填字段（外部）



| 字段 | 对应接口 | 建议填写 |

|------|----------|----------|

| 头像、昵称 | `getUserProfile` / `chooseAvatar` / `nickname` | 仅用于展示个人中心资料，不用于其他目的 |

| 手机号 | `makePhoneCall` | 拨打客服电话，不回传、不存储号码 |

| 订单与交易信息 | `/api/order/*`（服务端，非微信隐私接口） | 用于下单、发货与售后 |

| 剪贴板 | `setClipboardData` | 仅写入分享链接，不读取剪贴板内容 |



### 4. 设置页对齐结果



- 保留「隐私浏览模式」本地开关，并明确标注「仅本地保存浏览偏好，不影响微信隐私授权」。

- 移除伪装成权限开关的「位置授权」，改为三个真实入口：隐私授权页、`wx.openSetting()` 系统权限页、`wx.openPrivacyContract()` 官方指引。

- 用户中心头像改为 `chooseAvatar` 选择器、昵称改为 `type="nickname"` 输入框；本地编辑结果存 `userProfile`，与 `/api/user/info` 远端资料解耦，退出登录时清除。



## E2E 发版前手动清单（QA-008 降级方案）



> `miniprogram-automator` 依赖微信开发者工具 CI 授权，当前无法稳定进 CI，按任务口径降级为发版前人工执行清单。执行人须逐项签核，未通过不得提交审核。



### 1. 执行前准备



1. 本地微信开发者工具已登录具备调试权限的账号，打开 `SutWxApp/` 项目并开启服务端口。

2. `npm ci` 安装依赖；`npm run ci` 全绿（lint / check / 137 Jest 用例）。

3. `npm run check:images`、`npm run check:bundle` 单独复跑；上传前可按需执行 `npm run assets:compress`（`sharp` 未安装时跳过，不阻断）。

4. `npm run deploy:upload -- --compress` 会用 `check-images.js` 做上传前门禁；真实 AppID 与私钥就绪后执行。



### 2. 四套件（`npm run test:e2e`）



| 套件 | 覆盖 | 通过标准 |

|------|------|----------|

| 首页与搜索 | 首屏渲染、分类跳转、搜索 | 无报错，列表非空 |

| 商品详情 | 详情加载、加购、收藏、客服入口 | 加购后购物车角标 +1 |

| 购物车 | 数量增减、删除、结算跳转 | 金额与数量一致 |

| 登录守卫 | 未登录拦截、登录后回跳 | 401 清理登录态且无残留 |



### 3. 核心页面回归（iOS / Android 各 2 台）



| # | 页面路径 | 检查点 |

|---|----------|--------|

| 1 | `pages/home/index` | 主题、轮播、商品列表、下拉刷新 |

| 2 | `pages/category/index` | 分类切换、商品筛选 |

| 3 | `pages/product/index` | 详情、SKU、加购、分享、客服 |

| 4 | `pages/cart/index` | 数量、金额、去结算 |

| 5 | `pages/order/confirm` | 地址、金额、提交订单 |

| 6 | `pages/order/index` | 订单列表与状态筛选 |

| 7 | `pages/order/detail` | 状态、物流、取消/确认收货 |

| 8 | `pages/user/index` | 登录态、头像/昵称选择器、隐私授权弹窗、设置页入口 |

| 9 | `pages/privacy/index` | 同意 / 拒绝 / 查看指引 / 手势返回四条路径 |



### 4. 签核表



| 版本 | 日期 | 执行人 | 四套件 | 真机矩阵 | 遗留问题 | 结论 |

|------|------|--------|--------|----------|----------|------|

| | | | | | | |



## 小程序隐私合规清单（COM-001 / FE-010）

> 代码侧已就绪；**仍待外部项**：mp 后台填写《用户隐私保护指引》并发布、真实 AppID（INF-001）、真机授权与拒绝路径回归。未完成后 COM-001 / FE-010 不得标记完成。

### 1. 配置与全局链路

| 项 | 实现 | 位置 |
|----|------|------|
| 隐私校验开关 | `__usePrivacyCheck__: true` | `app.json` 根与 `setting`、`project.config.json` 的 `setting` |
| 最低基础库 | 2.32.3（运行时 `wx.getSystemInfoSync().SDKVersion` 比对，低版本弹窗提示） | `app.js` → `checkBaseLibrary()` |
| 全局授权监听 | `wx.onNeedPrivacyAuthorization` → 存 `globalData.privacyResolve` → 跳 `/pages/privacy/index` | `app.js` → `registerPrivacyGuard()` |
| 授权页同意按钮 | `<button id="privacy-agree-btn" open-type="agreePrivacyAuthorization" bindagreeprivacyauthorization="onAgree">`，回传 `buttonId` 给官方 resolve | `pages/privacy/index.*` |
| 低版本降级 | 能力探测失败时不注册监听，`ensurePrivacyAuthorization()` 返回 true，业务按旧逻辑执行 | `utils/privacy.js` |
| 提前离开兜底 | 授权页 `onUnload` 释放 resolve（`event: disagree`），避免隐私接口调用永久挂起 | `pages/privacy/index.js` |

### 2. 隐私接口清单（与 `utils/privacy.js` 的 `PRIVACY_APIS` 一一对应）

| 接口 | 使用场景 | 调用位置 | 前置检查 | 拒绝兜底 |
|------|----------|----------|----------|----------|
| `wx.getUserProfile` | 完善用户资料 | `helpers-auth.js` | `ensurePrivacyAuthorization()` | reject `用户未同意隐私保护指引` |
| `chooseAvatar` | 用户中心选择头像 | `pages/user/index` | 微信按 `__usePrivacyCheck__` 自动触发 | 回调无 `avatarUrl` 时 toast「需同意隐私指引后设置头像」 |
| `input[type=nickname]` | 用户中心填写昵称 | `pages/user/index` | 用户主动输入，不主动取值 | 空值不覆盖已有昵称 |
| `wx.makePhoneCall` | 帮助中心联系客服 | `pages/help/index.js` | `withPrivacy()` | toast「需同意隐私指引后拨打」 |
| `wx.openCustomerServiceChat` | 商品页客服会话 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |
| `wx.setClipboardData` | 商品页复制链接 | `behaviors/product-actions.js` | `withPrivacy()` | `withPrivacy` 默认拒绝提示 |

> 新增隐私接口必须先登记 `PRIVACY_APIS` 与本表，并在 mp 后台同步勾选对应信息类型，否则上线后接口会被微信拦截。

### 3. mp 后台待填字段（外部）

| 字段 | 对应接口 | 建议填写 |
|------|----------|----------|
| 头像、昵称 | `getUserProfile` / `chooseAvatar` / `nickname` | 仅用于展示个人中心资料，不用于其他目的 |
| 手机号 | `makePhoneCall` | 拨打客服电话，不回传、不存储号码 |
| 订单与交易信息 | `/api/order/*`（服务端，非微信隐私接口） | 用于下单、发货与售后 |
| 剪贴板 | `setClipboardData` | 仅写入分享链接，不读取剪贴板内容 |

### 4. 设置页对齐结果

- 保留「隐私浏览模式」本地开关，并明确标注「仅本地保存浏览偏好，不影响微信隐私授权」。
- 移除伪装成权限开关的「位置授权」，改为三个真实入口：隐私授权页、`wx.openSetting()` 系统权限页、`wx.openPrivacyContract()` 官方指引。
- 用户中心头像改为 `chooseAvatar` 选择器、昵称改为 `type="nickname"` 输入框；本地编辑结果存 `userProfile`，与 `/api/user/info` 远端资料解耦，退出登录时清除。

## E2E 发版前手动清单（QA-008 降级方案）

> `miniprogram-automator` 依赖微信开发者工具 CI 授权，当前无法稳定进 CI，按任务口径降级为发版前人工执行清单。执行人须逐项签核，未通过不得提交审核。

### 1. 执行前准备

1. 本地微信开发者工具已登录具备调试权限的账号，打开 `SutWxApp/` 项目并开启服务端口。
2. `npm ci` 安装依赖；`npm run ci` 全绿（lint / check / 137 Jest 用例）。
3. `npm run check:images`、`npm run check:bundle` 单独复跑；上传前可按需执行 `npm run assets:compress`（`sharp` 未安装时跳过，不阻断）。
4. `npm run deploy:upload -- --compress` 会用 `check-images.js` 做上传前门禁；真实 AppID 与私钥就绪后执行。

### 2. 四套件（`npm run test:e2e`）

| 套件 | 覆盖 | 通过标准 |
|------|------|----------|
| 首页与搜索 | 首屏渲染、分类跳转、搜索 | 无报错，列表非空 |
| 商品详情 | 详情加载、加购、收藏、客服入口 | 加购后购物车角标 +1 |
| 购物车 | 数量增减、删除、结算跳转 | 金额与数量一致 |
| 登录守卫 | 未登录拦截、登录后回跳 | 401 清理登录态且无残留 |

### 3. 核心页面回归（iOS / Android 各 2 台）

| # | 页面路径 | 检查点 |
|---|----------|--------|
| 1 | `pages/home/index` | 主题、轮播、商品列表、下拉刷新 |
| 2 | `pages/category/index` | 分类切换、商品筛选 |
| 3 | `pages/product/index` | 详情、SKU、加购、分享、客服 |
| 4 | `pages/cart/index` | 数量、金额、去结算 |
| 5 | `pages/order/confirm` | 地址、金额、提交订单 |
| 6 | `pages/order/index` | 订单列表与状态筛选 |
| 7 | `pages/order/detail` | 状态、物流、取消/确认收货 |
| 8 | `pages/user/index` | 登录态、头像/昵称选择器、隐私授权弹窗、设置页入口 |
| 9 | `pages/privacy/index` | 同意 / 拒绝 / 查看指引 / 手势返回四条路径 |

### 4. 签核表

| 版本 | 日期 | 执行人 | 四套件 | 真机矩阵 | 遗留问题 | 结论 |
|------|------|--------|--------|----------|----------|------|
| | | | | | | |

## 小程序隐私合规清单（COM-001 / FE-010）

> 代码侧已就绪；**仍待外部项**：mp 后台填写《用户隐私保护指引》并发布、真实 AppID（INF-001）、真机授权与拒绝路径回归。未完成后 COM-001 / FE-010 不得标记完成。

### 1. 配置与全局链路

| 项 | 实现 | 位置 |
|----|------|------|
| 隐私校验开关 | `__usePrivacyCheck__: true` | `app.json` 根与 `setting`、`project.config.json` 的 `setting` |
| 最低基础库 | 2.32.3（运行时比对 `SDKVersion`，低版本弹窗提示） | `app.js` → `checkBaseLibrary()` |
| 全局授权监听 | `wx.onNeedPrivacyAuthorization` → 存 `globalData.privacyResolve` → 跳 `/pages/privacy/index` | `app.js` → `registerPrivacyGuard()` |
| 授权页同意按钮 | `id="privacy-agree-btn"` + `open-type="agreePrivacyAuthorization"`，回传 `buttonId` 给官方 resolve | `pages/privacy/index.*` |
| 低版本降级 | 能力探测失败不注册监听，`ensurePrivacyAuthorization()` 返回 true | `utils/privacy.js` |
| 提前离开兜底 | 授权页 `onUnload` 释放 resolve（`event: disagree`），避免接口调用挂起 | `pages/privacy/index.js` |

### 2. 隐私接口清单（与 `utils/privacy.js` 的 `PRIVACY_APIS` 一一对应）

| 接口 | 使用场景 | 调用位置 | 前置检查 | 拒绝兜底 |
|------|----------|----------|----------|----------|
| `wx.getUserProfile` | 完善用户资料 | `helpers-auth.js` | `ensurePrivacyAuthorization()` | reject `用户未同意隐私保护指引` |
| `chooseAvatar` | 用户中心选择头像 | `pages/user/index` | 微信按 `__usePrivacyCheck__` 自动触发 | 回调无 `avatarUrl` 时 toast 提示 |
| `input[type=nickname]` | 用户中心填写昵称 | `pages/user/index` | 用户主动输入，不主动取值 | 空值不覆盖已有昵称 |
| `wx.makePhoneCall` | 帮助中心联系客服 | `pages/help/index.js` | `withPrivacy()` | toast「需同意隐私指引后拨打」 |
| `wx.openCustomerServiceChat` | 商品页客服会话 | `behaviors/product-actions.js` | `withPrivacy()` | 默认拒绝提示 |
| `wx.setClipboardData` | 商品页复制链接 | `behaviors/product-actions.js` | `withPrivacy()` | 默认拒绝提示 |

> 新增隐私接口必须先登记 `PRIVACY_APIS` 与本表，并在 mp 后台同步勾选对应信息类型，否则上线后接口会被微信拦截。

### 3. mp 后台待填字段（外部）

| 字段 | 对应接口 | 建议填写 |
|------|----------|----------|
| 头像、昵称 | `getUserProfile` / `chooseAvatar` / `nickname` | 仅用于展示个人中心资料，不用于其他目的 |
| 手机号 | `makePhoneCall` | 拨打客服电话，不回传、不存储号码 |
| 订单与交易信息 | `/api/order/*`（服务端，非微信隐私接口） | 用于下单、发货与售后 |
| 剪贴板 | `setClipboardData` | 仅写入分享链接，不读取剪贴板内容 |

### 4. 设置页对齐结果

- 保留「隐私浏览模式」本地开关，明确标注「仅本地保存浏览偏好，不影响微信隐私授权」。
- 移除伪装成权限开关的「位置授权」，改为三个真实入口：隐私授权页、`wx.openSetting()` 系统权限页、`wx.openPrivacyContract()` 官方指引。
- 用户中心头像改 `chooseAvatar` 选择器、昵称改 `type="nickname"` 输入框；本地资料存 `userProfile`，与 `/api/user/info` 远端资料解耦，退出登录时清除。

## E2E 发版前手动清单（QA-008 降级方案）

> `miniprogram-automator` 依赖微信开发者工具 CI 授权，当前无法稳定进 CI，按任务口径降级为发版前人工执行清单。执行人须逐项签核，未通过不得提交审核。

### 1. 执行前准备

1. 本地微信开发者工具已登录具备调试权限的账号，打开 `SutWxApp/` 项目并开启服务端口。
2. `npm ci` 安装依赖；`npm run ci` 全绿（lint / check / 137 Jest 用例）。
3. `npm run check:images`、`npm run check:bundle` 单独复跑；上传前可按需执行 `npm run assets:compress`（`sharp` 未安装时跳过，不阻断）。
4. `npm run deploy:upload -- --compress` 会用 `check-images.js` 做上传前门禁；真实 AppID 与私钥就绪后执行。

### 2. 四套件（`npm run test:e2e`）

| 套件 | 覆盖 | 通过标准 |
|------|------|----------|
| 首页与搜索 | 首屏渲染、分类跳转、搜索 | 无报错，列表非空 |
| 商品详情 | 详情加载、加购、收藏、客服入口 | 加购后购物车角标 +1 |
| 购物车 | 数量增减、删除、结算跳转 | 金额与数量一致 |
| 登录守卫 | 未登录拦截、登录后回跳 | 401 清理登录态且无残留 |

### 3. 核心页面回归（iOS / Android 各 2 台）

| # | 页面路径 | 检查点 |
|---|----------|--------|
| 1 | `pages/home/index` | 主题、轮播、商品列表、下拉刷新 |
| 2 | `pages/category/index` | 分类切换、商品筛选 |
| 3 | `pages/product/index` | 详情、SKU、加购、分享、客服 |
| 4 | `pages/cart/index` | 数量、金额、去结算 |
| 5 | `pages/order/confirm` | 地址、金额、提交订单 |
| 6 | `pages/order/index` | 订单列表与状态筛选 |
| 7 | `pages/order/detail` | 状态、物流、取消/确认收货 |
| 8 | `pages/user/index` | 登录态、头像/昵称选择器、隐私授权弹窗、设置页入口 |
| 9 | `pages/privacy/index` | 同意 / 拒绝 / 查看指引 / 手势返回四条路径 |

### 4. 签核表

| 版本 | 日期 | 执行人 | 四套件 | 真机矩阵 | 遗留问题 | 结论 |
|------|------|--------|--------|----------|----------|------|
| | | | | | | |

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 3.1.0 | 2026-11-07 | 对齐 3.5.16 / 插件 0.7.1：CI 五 Job 与八项门禁、自动发布为主路径、dependabot 与 lockfile 实况、运维范围改为含同仓插件端；补生产部署 Runbook、健康拨测与凭证治理 | Sut |
| 3.0.8 | 2026-09-12 | 新增「CI/CD 流水线」章节：GitHub Actions 质量门禁、Tag 自动发布、miniprogram-ci 预览/上传与密钥安全要求 | Sut |
| 3.0.1 | 2026-08-13 | 重写为小程序真实发布与运维规范，去除虚构的 Docker/K8s/数据库运维内容 | Sut |
| 1.0.0 | 2025-12-26 | 初始版本 | Sut |
