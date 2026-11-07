 项目规范

## 项目规范

## 版本记录
| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 2.1.0 | 2026-11-07 | 对齐 3.5.16 / 插件 0.7.1：技术定位改为双端同仓、24 端点契约、支付与监控列为已实现、术语表指向 GLOSSARY、目录树按实况重画 | Sut |
| 2.0.0 | 2026-06-08 | 采用Apple极简设计风格，更新全局样式和页面样式 | Sut |
| 1.0.0 | 2025-12-26 | 初始版本 | Sut |

## 目的
本规范定义了苏铁微信小程序（SutWxApp）项目的基本信息、架构设计、开发流程和文档规范，旨在确保项目的一致性、可维护性和可扩展性。

## 项目概述

### 项目背景
苏铁微信小程序（SutWxApp）以 **WordPress 网站作为后端（headless CMS）**，在微信侧对网站内容进行「优化排版并显示」，为读者提供接近原生 App 的阅读与浏览体验。网站的文章、页面、分类、媒体乃至商品（WordPress + WooCommerce）等内容，均由 WordPress 通过 REST API 提供给小程序；小程序只负责内容渲染、交互与本地状态。

### 项目定位
- **目标用户**：微信内读者与消费者
- **核心价值**：在微信中优化排版、清晰呈现网站内容（文章/商品等）
- **技术定位**：微信小程序端 + 同仓 WordPress 插件端（REST 桥接 WooCommerce 商品/分类与 WP 文章）

### 项目目标
- 稳定呈现 WordPress 网站内容，保证排版一致与阅读体验
- 打通文章/商品/分类等内容在微信内的浏览与跳转
- 构建可扩展的前端架构，便于对接 WordPress 内容模型演进

## 设计风格规范

### Apple极简设计风格
采用 Apple 官网设计风格，核心特点：

#### 1. 颜色系统
| 颜色变量 | 值 | 用途 |
|----------|-----|------|
| `--primary-color` | #2E7D32 | 主色调（绿色系） |
| `--primary-light` | #F1F8E9 | 主色浅色调 |
| `--primary-dark` | #1B5E20 | 主色深色调 |
| `--text-primary` | #1D1D1F | 主要文字 |
| `--text-secondary` | #86868B | 次要文字 |
| `--text-tertiary` | #AEAEB2 | 辅助文字 |
| `--border-color` | #E8E8ED | 边框颜色 |
| `--background-primary` | #FFFFFF | 主背景 |
| `--background-secondary` | #F5F5F7 | 次背景 |
| `--background-tertiary` | #FAFAFA | 三级背景 |

#### 2. 设计原则
- **极简主义**：减少视觉干扰，突出核心内容
- **大图展示**：商品图片采用大尺寸展示
- **充足留白**：使用合理的间距创造清爽感
- **清晰层次**：通过字体大小、颜色深浅建立视觉层级
- **微妙动效**：悬停效果、点击反馈、平滑过渡

#### 3. 字体规范
- 字体族：-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC'
- 字重：300(light)、400(normal)、500(medium)、600(semibold)、700(bold)
- 字号：10px(xs)、12px(sm)、14px(md)、16px(lg)、18px(xl)、24px(xxl)

#### 4. 间距规范
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 20px, xxl: 24px

#### 5. 圆角规范
- sm: 8px, md: 12px, lg: 16px, xl: 24px

#### 6. 阴影规范
- sm: `0 1px 3px rgba(0, 0, 0, 0.05)`
- md: `0 4px 12px rgba(0, 0, 0, 0.08)`
- lg: `0 12px 32px rgba(0, 0, 0, 0.1)`

#### 7. 过渡动画
- 快速：0.15s cubic-bezier(0.4, 0, 0.2, 1)
- 正常：0.3s cubic-bezier(0.4, 0, 0.2, 1)
- 慢速：0.5s cubic-bezier(0.4, 0, 0.2, 1)

## 技术栈

> 本仓库包含**小程序端**（原生 JavaScript）与 **WordPress 插件端**（PHP，`sutwx-app-api/`），另有仓库根基于 Express 的站点预览服务；不含 WordPress 运行时与数据库。
> 后端为 **WordPress 网站（headless CMS）**，内容经 REST API 提供；网络请求通过 `utils/request.js` 封装，基地址见 `app.js` 的 `globalData.baseUrl`。

### 前端技术栈
- **框架**：微信小程序原生框架（WXML / WXSS / JS）
- **开发语言**：JavaScript（ES6+），不使用 TypeScript
- **UI**：自定义组件 + 全局 CSS 变量设计系统（遵循 Apple 极简设计风格）
- **状态管理**：基于 `wx.setStorageSync` 的本地存储 + `utils/store.js` 轻量状态管理
- **路由**：微信小程序原生路由（`app.json` 中声明）
- **网络请求**：`wx.request` + `utils/request.js` 封装（拦截器、重试、LRU 缓存、请求取消、并发队列）
- **开发工具**：微信开发者工具、VS Code
- **多语言**：`.po` / `.pot` 文件（gettext 风格）配合 `i18n` 工具

### 后端说明（WordPress 无头 CMS）
- 小程序本身不含后端代码；内容源为 **WordPress 网站**，经 REST API 提供。
- 当前接口以 `/api/*` 暴露（插件注册 `sutwx/v1` 命名空间并重写 `/api/*`），共 24 个端点；鉴权走 `/api/auth/*`（`wx.login` code → JWT）。
- 文章、页面、分类、媒体、自定义文章类型（含 WooCommerce 商品/订单）均由 WordPress 持久化，小程序仅消费与渲染。
- 请求封装统一在 `services/*` 中，便于对接上述后端。

## 项目结构

### 目录结构
```
仓库根/
├── SutWxApp/                 # 小程序工程（微信开发者工具导入此目录）
│   ├── app.js                # 小程序入口（生命周期、全局数据、错误上报挂载）
│   ├── app.json              # 全局配置（页面路由、subpackages、tabBar、窗口样式）
│   ├── app.wxss              # 全局样式（汇聚 styles/ 分片 + 设计令牌变量）
│   ├── sitemap.json          # 索引配置
│   ├── project.config.json   # 开发者工具项目配置（appid、packOptions）
│   ├── components/           # 自定义组件（四件套）
│   │   ├── empty-state/      # 空状态
│   │   └── product-card/     # 商品卡片
│   ├── pages/                # 页面（每页一个目录，四件套）
│   │   ├── home/             # 首页（搜索、轮播、分类、商品瀑布流）
│   │   ├── category/         # 分类页
│   │   ├── product/          # 商品详情（8 个 include 分片）
│   │   ├── cart/             # 购物车
│   │   ├── order/            # 订单模块（index / detail / confirm）
│   │   ├── user/             # 用户中心
│   │   ├── address/          # 地址管理（分包）
│   │   ├── settings/         # 设置页（分包）
│   │   ├── help/             # 帮助中心（分包）
│   │   └── article/          # 文章列表（分包）
│   ├── services/             # 服务层（按业务域拆分）
│   │   ├── authService.js / productService.js / categoryService.js
│   │   ├── cartService.js / orderService.js / orderService.api.js
│   │   ├── payService.js / postService.js / themeService.js
│   │   ├── addressService.js / dataSource.js
│   │   └── *.mock.js         # mock 数据源
│   ├── models/               # DTO 映射（product / order / post / category / page）
│   ├── utils/                # 基础设施（request*、auth-token*、monitor*、api、store、i18n）
│   ├── behaviors/            # 跨页面复用行为
│   ├── styles/               # 全局样式分片（由 app.wxss @import）
│   ├── scripts/              # 构建与校验脚本（check-*、deploy、compress-images、e2e）
│   ├── locales/              # 多语言（zh-CN.json、en-US.json 等 JSON + .po/.pot 模板）
│   ├── images/               # 图片资源（tabbar/ 子目录）
│   ├── __tests__/            # Jest 测试（137 用例）
│   ├── helpers.js            # 全局助手
│   └── eslint.config.js      # ESLint 配置（规则集在 eslint.presets.js）
├── sutwx-app-api/            # WordPress 插件
│   ├── sutwx-app-api.php     # 插件入口（版本常量、依赖声明）
│   ├── includes/             # 类与 trait（class-modules.php 为加载清单，顺序敏感）
│   │   ├── auth/ cache/ order/ pay/ rate-limit/ rest/ mappings/
│   ├── admin/                # 后台设置页
│   └── tests/                # PHP 单测（8 套件）
├── prototype/                # 单文件交互原型（源，浏览器直接打开可交互）
├── docs/                     # 规范与任务文档（索引见 docs/README.md）
├── build.js / server.js      # 站点构建与本地静态服务
└── package.json              # 根包（站点服务 + 插件打包）
```

### 模块划分

> 以下为产品功能模块划分。**当前代码基线已实现**：首页、分类、商品详情、购物车、订单、用户中心、地址、设置、帮助、文章、主题换肤、微信支付 V3 与退款、监控与可观测。支付模块已实现并纳入后端单测；积分、社交、评价、优惠券、消息通知、客服与管理后台等**未实现**，见 `../features/spec.md` 第 9 节。

#### 1. 首页模块
- 轮播图展示
- 推荐商品
- 分类导航
- 活动专区

#### 2. 分类模块
- 分类层级展示
- 商品筛选
- 商品排序
- 商品视图切换

#### 3. 商品模块
- 商品详情展示
- 商品规格选择
- 商品评价
- 商品操作（加入购物车、立即购买、收藏、分享）

#### 4. 购物车模块
- 商品管理
- 数量调整
- 价格计算
- 结算功能

#### 5. 订单模块
- 订单列表
- 订单详情
- 订单状态跟踪
- 订单操作（支付、取消、退款、评价）

#### 6. 用户模块
- 个人信息管理
- 收货地址管理
- 收藏夹
- 优惠券
- 积分管理
- 客服中心
- 设置

#### 7. 积分模块
- 积分获取
- 积分兑换
- 积分记录

#### 8. 支付模块
- 微信支付集成
- 支付流程管理
- 支付结果处理

#### 9. 物流模块
- 物流信息查询
- 物流状态更新

#### 10. 客服模块
- 在线客服
- 常见问题
- 联系方式

#### 11. 管理后台
- 商品管理
- 订单管理
- 用户管理
- 数据统计

## 相关规范索引

> 本节原「开发流程 / 代码规范 / Git 工作流 / 文档规范 / 质量保证 / 部署策略 / 监控与运维 / 安全策略 / 性能优化 / 团队协作 / 版本管理 / 变更管理」等章节已迁移至下列规范文档。同一主题只在唯一文档中定义，此处仅保留索引，避免内容重复与前后矛盾。

| 主题 | 规范文档 | 要点 |
|------|---------|------|
| 目录组织、命名约定、编码风格、文件头注释 | [development/spec.md](../development/spec.md) | 工程规范的**单一事实来源** |
| 提交信息格式、分支管理、代码审查流程与清单 | [development/spec.md](../development/spec.md) | 提交 `<type>(<scope>):`；分支 `feature/` `fix/` `hotfix/` |
| 测试分层、门禁命令、缺陷分级 | [testing/spec.md](../testing/spec.md)、[development/spec.md](../development/spec.md) | 四道门禁：lint / check / test / e2e |
| 部署、配置常量、监控告警、备份与故障处理 | [ops/spec.md](../ops/spec.md) | runbook、拨测与值班响应 |
| 接口契约、响应包络、错误码 | [api/spec.md](../api/spec.md) | 24 个已实现端点的唯一总表 |
| 插件目录、路由注册与部署 | [backend/spec.md](../backend/spec.md) | `class-modules.php` 加载顺序敏感 |
| 数据字段、DTO、订单状态机 | [data/spec.md](../data/spec.md) | 前后端字段一致性依据 |
| 术语统一 | [GLOSSARY.md](../../GLOSSARY.md) | 标准术语与禁用叫法 |
| 协作流程、硬性红线、排障速查 | [AGENTS.md](../../AGENTS.md) | 贡献与 AI 助手指南 |

### 需求到上线的一般流程（简版）

1. **立项**：在 [tasks.md](../../tasks.md) 登记，写明优先级、最小交付物与依赖。
2. **设计**：涉及接口或数据结构时，先更新 `api/spec.md` 与 `data/spec.md`，再写实现。
3. **开发**：按 [development/spec.md](../development/spec.md) 的目录与命名规范落地，同步测试与版本号。
4. **自测**：本地跑通四道门禁；改动端点时同步补后端单测。
5. **评审**：PR 需 1 人批准且 CI 全绿，按工程规范的审查清单逐项核对。
6. **发布**：版本号与 `CHANGELOG.md` 同步，打 Tag 发版；线上问题按 P0 至 P3 分级响应。

<!-- BLOCK -->
## 交互、多语言提示与自我修复规范

1. **Suggestions（推荐回复）中文显示**：所有对话提示与 Suggestions 引导保持使用中文显示。
2. **加载等待卡片中文显示**：加载与等待卡片提示（如 "Enjoy these tips while you wait" 等卡片文案）统一保持中文显示。
3. **应用问题自动修复**：当检测到应用构建、编译（compile_applet）、Lint 检查或运行时报错时，启动自动定位并尝试修复，确保应用处于稳定可运行状态。

## 术语表

> 完整术语表见 [GLOSSARY.md](../../GLOSSARY.md)（含标准术语与禁用叫法）。此处仅列项目级核心概念。

| 术语 | 解释 |
|------|------|
| SutWxApp | 苏铁微信小程序；仓库内含小程序端（`SutWxApp/`）与插件端（`sutwx-app-api/`） |
| 小程序端 | 微信小程序工程，原生 JavaScript，无框架、无 TypeScript、无 npm 运行时依赖 |
| 插件端 | WordPress 插件，把 WooCommerce 数据经 REST 暴露给小程序 |
| JWT | JSON Web Token，本项目用于小程序登录态（HS256），含 access 与 refresh 两类令牌 |
| openid | 微信用户在本应用下的唯一标识，用于登录建档与资源归属校验 |
| 归属校验 | 按 openid 校验资源归属以防越权；本项目**无角色体系** |
| RESTful | 一种 API 设计风格，本项目端点统一走 `/api/*` 前缀 |
| CI/CD | 持续集成与持续部署，本项目含 lint、test、checks、site、php 五类 Job |
| DTO | 后端映射后输出给小程序的数据结构，与前端 `models/` 一一对应 |
| 包络 | 后端统一响应结构 `{code, message, data, timestamp, requestId}` |
| 契约校验 | `npm run check:contract` 比对后端映射与前端模型的字段一致性 |
| 门禁 | 提交前必须通过的自动检查（lint / check / test） |

## 附录

### 参考文档
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Node.js官方文档](https://nodejs.org/en/docs/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [RESTful API设计指南](https://restfulapi.net/)
- [JWT官方文档](https://jwt.io/)

### 联系方式
- **项目负责人**：Sut
- **微信**：sutwxapp
- **问题反馈**：[GitHub Issues](https://github.com/sutchan/SutWxApp/issues)
- **代码仓库**：https://github.com/sutchan/SutWxApp
