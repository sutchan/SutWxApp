# Changelog

所有重要的项目变更都将记录在此文件中。

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
