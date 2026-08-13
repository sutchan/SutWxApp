# Changelog

所有重要的项目变更都将记录在此文件中。

## [3.0.2] - 2026-08-13

### 修复内容

#### 安全与存储统一
- 移除 utils/store.js 中 XOR 混淆伪安全层，统一 token 为明文单键存储
- 解决 authService 写明文、store.commit 写混淆、request.js 读明文三者路径不一致的隐患
- app.js 关闭调试日志（debug:false），清理生产相关 console.log

#### 监控修复
- 修复 utils/monitor.js 监控上报递归陷阱（上报请求被 monitorApi 包裹器递归触发）
- 清理 addToBuffer 中 reportData 浮空 Promise

#### 请求层重构
- pages/product/index.js、pages/home/index.js 改用 utils/request.js 封装（真实 CancelToken + 自动鉴权/CSRF）
- product/index.js、home/index.js 按职责拆分为 parts.js / utils.js 子模块（单文件≤200行）
- utils/request.js 新增 isCancel 静态方法，统一取消判定

#### 工程化
- 新增 package.json（lint/test 脚本）、.eslintrc.js 质量门禁
- 新增 __tests__ 纯函数单元测试（product/home utils、format）

### 文件变更
```
新增:
- SutWxApp/package.json
- SutWxApp/.eslintrc.js
- SutWxApp/__tests__/product.utils.test.js
- SutWxApp/__tests__/product.parts.test.js
- SutWxApp/__tests__/home.utils.test.js
- SutWxApp/pages/product/utils.js
- SutWxApp/pages/product/parts.js
- SutWxApp/pages/home/utils.js
- SutWxApp/pages/home/parts.js

修改:
- SutWxApp/utils/store.js
- SutWxApp/utils/monitor.js
- SutWxApp/utils/request.js
- SutWxApp/app.js
- SutWxApp/pages/product/index.js
- SutWxApp/pages/home/index.js
- SutWxApp/pages/order/confirm.js
- README.md
```

## [3.0.1] - 2026-08-13

### 修复内容

#### 构建与死代码清理
- 删除未引用的 TypeScript 死代码（services/*.ts、utils/request.ts、security.ts、monitor.ts、cache.ts、types/），统一运行体系为 JavaScript
- 补齐缺失的 JS 运行依赖文件：utils/request.js（网络请求）、utils/monitor.js（监控上报）、services/authService.js（认证服务）
- 新增缺失配置：sitemap.json、project.config.json（此前 app.json 引用 sitemap.json 但文件不存在）

#### 安全加固
- 移除 services/authService.ts 中硬编码的 appSecret 密钥，认证改为由后端签发 token
- utils/store.js 接入敏感字段（token）混淆存储，避免明文落盘被直接读取
- utils/request.js 保留 XSS/SQL 注入防护与 CSRF 校验能力

#### 配置治理
- 清理 app.json 中未使用的定位权限（scope.userLocation、requiredPrivateInfos）及冗余 scope/key 字段
- 修正 appid 占位，移除非标准 app.json 字段（name/versionName/versionCode/description/main/bundleName）

#### 版本统一
- README 版本徽章与文件头注释统一至 3.0.1

### 文件变更
```
新增:
- SutWxApp/utils/request.js
- SutWxApp/utils/monitor.js
- SutWxApp/services/authService.js
- SutWxApp/sitemap.json
- SutWxApp/project.config.json

删除（未引用死代码）:
- SutWxApp/services/*.ts
- SutWxApp/utils/request.ts
- SutWxApp/utils/security.ts
- SutWxApp/utils/monitor.ts
- SutWxApp/utils/cache.ts
- SutWxApp/types/wechat-miniprogram.d.ts

已修改:
- SutWxApp/app.json
- SutWxApp/app.js
- SutWxApp/utils/store.js
- README.md
- CHANGELOG.md
```

---

## [3.0.0] - 2026-07-01

### 重大更新

#### 代码质量优化
- 修复 WXML 模板中 `.toFixed()` 方法不兼容问题（微信小程序 WXML 不支持直接调用对象方法）
- 新增价格格式化工具函数 `utils/format.js`，统一管理价格显示逻辑
- 所有页面价格显示改为预格式化的文本字段，提升性能和兼容性

#### 版本升级
- 全局版本号统一升级至 3.0.0
- 更新所有文件头部版本号和更新日期
- app.json versionCode 更新为 300

### 修复内容
- 修复购物车页面价格显示问题
- 修复商品列表页价格显示问题
- 修复订单相关页面价格显示问题
- 修复商品卡片组件价格显示问题

### 文件变更
```
新增:
- SutWxApp/utils/format.js

已修改:
- SutWxApp/app.js
- SutWxApp/app.json
- SutWxApp/pages/cart/index.js
- SutWxApp/pages/cart/index.wxml
- SutWxApp/pages/category/index.js
- SutWxApp/pages/category/index.wxml
- SutWxApp/pages/order/index.js
- SutWxApp/pages/order/index.wxml
- SutWxApp/pages/order/detail.js
- SutWxApp/pages/order/detail.wxml
- SutWxApp/pages/order/confirm.js
- SutWxApp/pages/order/confirm.wxml
- SutWxApp/components/product-card/index.wxml
- CHANGELOG.md
```

---

## [2.0.0] - 2026-06-08

### 重大更新

#### 设计风格重构
- 采用 Apple 极简设计风格
- 重新设计全局颜色系统
- 更新字体、间距、圆角、阴影规范
- 添加流畅的过渡动画效果

#### 界面优化
- 首页采用 Apple 风格布局
- 优化商品卡片设计
- 改进购物车页面样式
- 优化用户中心界面

### 新增功能
- 完整的 Apple 风格高保真原型
- 设计系统变量（CSS Variables）
- 统一的过渡动画规范

### 技术更新
- 全局样式 `app.wxss` 重构为设计系统
- 首页样式 `pages/home/index.wxss` 优化
- 购物车样式 `pages/cart/index.wxss` 优化
- 项目规范文档 `openspec/specs/project/spec.md` 更新

### 文件变更
```
已修改:
- README.md
- SutWxApp/app.wxss
- SutWxApp/pages/home/index.wxss
- SutWxApp/pages/cart/index.wxss
- openspec/specs/project/spec.md
- openspec/prototype/prototype.html
```

---

## [1.0.0] - 2025-12-26

### 初始版本

- 项目基础结构搭建
- 核心页面开发
  - 首页
  - 分类页
  - 购物车
  - 订单页
  - 用户中心
- 基础组件开发
- 项目规范文档
- 基础原型设计
