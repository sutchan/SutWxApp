# 苏铁微信小程序 - 项目概览

> 本文档为项目的高层概览。详细的规范（架构、数据、开发、设计、运维、测试）见 [`openspec/specs/`](../openspec/specs/)。

## 项目简介

苏铁微信小程序（SutWxApp）以 **WordPress 网站为后端（headless CMS）**，在微信侧对网站内容进行「优化排版并显示」，为用户提供文章/商品浏览、搜索、加购、下单、订单跟踪与个人中心等核心体验。界面采用 Apple 极简设计风格，支持中英文多语言。

> 本项目为**纯前端微信小程序**，使用 JavaScript 开发，代码仓库内不含后端服务与数据库。后端为 **WordPress 网站（headless CMS）**，内容经 REST API 提供，网络层统一封装于 `utils/request.js` 与 `services/*`。

## 技术栈

### 前端技术栈
- 微信小程序原生框架（WXML / WXSS / JS）
- JavaScript（ES6+），不使用 TypeScript
- Apple 极简设计（全局 CSS 变量设计系统，见 `app.wxss`）
- 状态管理：`utils/store.js` + `wx.setStorageSync`
- 网络请求：`wx.request` + `utils/request.js`（拦截器 / 重试 / LRU 缓存 / 取消 / 并发队列）
- 多语言：gettext 风格 `.po` / `.pot`（见 `locales/`）
- 开发工具：微信开发者工具、VS Code

### 后端说明（WordPress 无头 CMS）
- 小程序通过 `services/*` 调用 WordPress 提供的 REST API，基地址见 `app.js` 的 `globalData.baseUrl`
- 当前接口以 `/api/*` 暴露（由 WordPress 插件或反向代理桥接 WP REST API `/wp-json/wp/v2/`），鉴权 `/auth/*`（JWT）
- 认证：`Authorization: Bearer <token>`（本地存储键 `TOKEN`）
- 后端（WordPress 站点）的实现与运维由对应团队负责，不在本仓库内

## 项目结构

```
SutWxApp/
├── app.js                  # 小程序入口（App 实例、生命周期、全局数据）
├── app.json                # 全局配置（页面路由、tabBar、窗口）
├── app.wxss                # 全局样式（Apple 风格 CSS 变量）
├── components/             # 自定义组件
│   ├── empty-state/        # 空状态组件
│   └── product-card/       # 商品卡片组件
├── images/                 # 图片资源
│   └── tabbar/             # tabBar 图标
├── pages/                  # 页面文件（每页含 .js/.wxml/.wxss/.json）
│   ├── home/               # 首页
│   ├── category/           # 分类页
│   ├── product/            # 商品详情页
│   ├── cart/               # 购物车
│   ├── order/              # 订单模块
│   │   ├── index/          # 订单列表
│   │   ├── detail/         # 订单详情
│   │   └── confirm/        # 订单确认
│   ├── user/               # 用户中心
│   ├── address/            # 地址管理（分包）
│   ├── settings/           # 设置页（分包）
│   └── help/               # 帮助中心（分包）
├── services/               # 服务层（API 调用封装）
│   ├── authService.js      # 认证服务
│   ├── productService.js   # 商品服务
│   ├── categoryService.js  # 分类服务
│   ├── cartService.js      # 购物车服务
│   ├── orderService.js     # 订单服务
│   └── addressService.js   # 地址服务
├── utils/                  # 工具类
│   ├── request.js          # 网络请求封装（拦截器/重试/缓存/取消/队列）
│   ├── format.js           # 格式化工具（价格、日期等）
│   ├── monitor.js          # 监控与错误上报
│   ├── store.js            # 轻量状态管理
│   └── compress-images.js  # 图片压缩工具
└── locales/                # 多语言文件
    ├── sut-wechat-mini.pot     # 翻译模板
    ├── sut-wechat-mini-zh_CN.po # 中文翻译
    └── sut-wechat-mini-en_US.po # 英文翻译
```

## 核心功能模块

### 1. 首页模块（pages/home）
- 轮播图展示
- 分类导航
- 推荐商品列表
- 热门商品展示

### 2. 分类模块（pages/category）
- 分类列表展示
- 分类商品列表
- 商品筛选

### 3. 商品详情模块（pages/product）
- 商品信息展示
- 规格选择
- 加入购物车
- 商品收藏

### 4. 购物车模块（pages/cart）
- 商品列表展示
- 数量调整
- 删除商品
- 价格计算
- 结算功能

### 5. 订单模块（pages/order）
- 订单列表
- 订单详情
- 订单确认
- 取消订单 / 确认收货

### 6. 用户中心模块（pages/user）
- 用户信息管理
- 地址管理（pages/address）
- 设置页面（pages/settings）
- 帮助中心（pages/help）

## 开发规范

### 代码规范
- 使用 2 空格缩进
- 每行不超过 100 字符
- 文件末尾添加空行
- 使用 `const` / `let`，避免 `var`

### 命名规范
- 文件 / 变量 / 函数：小驼峰（camelCase）
- 类 / 构造函数：大驼峰（PascalCase）
- 常量：全大写下划线（UPPER_SNAKE_CASE）
- 本地存储键：全大写下划线（如 `TOKEN`、`CART`）

### 注释规范
- 关键函数添加中文注释
- 文件头部标注路径与版本号
- 避免无意义注释

### Git 工作流
- main：生产分支，保持稳定
- develop：集成分支
- feature/xxx：功能开发分支
- bugfix/xxx：缺陷修复分支

### 提交规范
遵循 Conventional Commits：`type: 描述`，类型含 feat / fix / docs / refactor / style / test / chore / perf 等。详见仓库根 [`README.md`](../README.md) 与相关规范。

## 项目配置

### 环境要求
- 微信开发者工具：最新稳定版
- Node.js：仅用于运行可选脚本工具（如图片压缩、i18n 处理）
- Git：最新稳定版

> 本项目无需 Bun、TypeScript 编译器或数据库。

### 开发运行
1. 打开微信开发者工具
2. 导入 `SutWxApp/SutWxApp` 目录
3. 配置 AppID（或使用测试号）
4. 在 `app.js` 的 `globalData.baseUrl` 配置后端地址
5. 点击「编译」运行，可「预览」真机调试

### 主要命令
```bash
# 在微信开发者工具中：编译 / 预览 / 上传 / 上传时自动压缩
# 可选：Node 环境下运行工具脚本（如 i18n 校验、图片压缩）
```

## 版本历史

### v3.0.1 (2026-08-13)
- 清理 TypeScript 死代码，统一为 JavaScript
- 完善项目规范文档，修正技术栈描述与真实代码一致

### v3.0.0 (2026-05-06)
- 完善项目规范文档
- 创建缺失的页面模块（购物车、订单、分类）
- 创建自定义组件
- 完善服务层实现

### v2.0.0
- 支持 Flutter 跨平台

### v1.0.0
- 微信小程序初始版本
- 实现基础购物功能

## 相关链接

- 仓库：https://github.com/sutchan/SutWxApp
- 规范文档：`openspec/README.md`
- 变更记录：[`CHANGELOG.md`](../CHANGELOG.md)

## 许可证

MIT License
