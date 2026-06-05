
# 苏铁微信小程序 - 项目概览

## 项目简介

苏铁微信小程序是一个专注于精品植物和园艺用品的电商平台，为用户提供便捷的购物体验。

## 技术栈

### 前端技术栈
- 微信小程序原生框架
- JavaScript / TypeScript
- 微信开发者工具

### 后端技术栈
- Bun 1.x
- TypeScript
- MySQL 8.x
- Redis 7.x
- MongoDB 6.x

## 项目结构

```
SutWxApp/
├── app.js                  # 小程序入口文件
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── components/             # 自定义组件
│   ├── empty-state/        # 空状态组件
│   └── product-card/       # 产品卡片组件
├── images/                 # 图片资源
│   └── tabbar/             # 底部导航图片
├── pages/                  # 页面文件
│   ├── home/               # 首页
│   ├── category/           # 分类页
│   ├── product/            # 商品详情页
│   ├── cart/               # 购物车
│   ├── order/              # 订单模块
│   │   ├── index/          # 订单列表
│   │   ├── detail/         # 订单详情
│   │   └── confirm/        # 订单确认
│   ├── user/               # 用户中心
│   ├── address/            # 地址管理
│   ├── settings/           # 设置页
│   └── help/               # 帮助中心
├── services/               # 服务层
│   ├── authService.ts      # 认证服务
│   ├── cartService.js      # 购物车服务
│   ├── categoryService.ts   # 分类服务
│   ├── logisticsService.ts  # 物流服务
│   ├── notificationService.ts # 通知服务
│   ├── orderService.js     # 订单服务
│   ├── orderService.ts     # 订单服务
│   ├── pointsService.ts     # 积分服务
│   ├── productService.js    # 产品服务
│   ├── productService.ts    # 产品服务
│   ├── socialService.ts    # 社交服务
│   └── userService.ts      # 用户服务
├── utils/                  # 工具类
│   ├── request.ts          # 请求封装
│   ├── cache.ts           # 缓存工具
│   ├── security.ts        # 安全工具
│   ├── monitor.ts         # 监控工具
│   └── store.js           # 状态管理
├── types/                 # 类型定义
│   └── wechat-miniprogram.d.ts
└── locales/               # 多语言文件
    ├── sut-wechat-mini.pot     # 翻译模板
    ├── sut-wechat-mini-zh_CN.po # 中文翻译
    └── sut-wechat-mini-en_US.po # 英文翻译
```

## 核心功能模块

### 1. 首页模块
- 轮播图展示
- 分类导航
- 推荐商品列表
- 热门商品展示

### 2. 分类模块
- 分类列表展示
- 分类商品列表
- 商品筛选功能

### 3. 商品详情模块
- 商品信息展示
- 规格选择
- 加入购物车
- 商品收藏
- 商品评价

### 4. 购物车模块
- 商品列表展示
- 数量调整
- 删除商品
- 商品选择
- 价格计算
- 结算功能

### 5. 订单模块
- 订单列表
- 订单详情
- 订单确认
- 取消订单
- 确认收货
- 订单评价

### 6. 用户中心模块
- 用户信息管理
- 地址管理
- 收藏管理
- 积分系统
- 设置页面

## 开发规范

### 代码规范
- 使用 2 空格缩进
- 每行不超过 100 字符
- 文件末尾添加空行
- 使用 const/let，避免 var

### 命名规范
- 文件/变量/函数：小驼峰（camelCase）
- 类/构造函数：大驼峰（PascalCase）
- 常量：全大写下划线（UPPER_SNAKE_CASE）

### 注释规范
- 每个函数必须添加注释
- 注释使用中文
- 文件头部添加说明注释

### Git 工作流
- main：生产分支，保持稳定
- develop：集成分支
- feature/xxx：功能开发分支
- bugfix/xxx：bug 修复分支

## 项目配置

### 环境要求
- 微信开发者工具：最新稳定版
- Bun：1.x
- Node.js：16+
- Git：最新稳定版

### 安装依赖
```bash
npm install
```

### 开发运行
1. 打开微信开发者工具
2. 导入 SutWxApp 目录
3. 配置 AppID
4. 点击编译运行

### 主要命令
```bash
npm run test           # 运行测试
npm run lint           # 代码检查
npm run typecheck      # TypeScript 类型检查
npm run build          # 项目构建
```

## 版本历史

### v3.0.0 (2026-05-06)
- 完善项目规范文档
- 创建缺失的页面模块（购物车、订单、分类）
- 创建自定义组件
- 完善服务层实现
- 添加模拟数据支持

### v2.0.0
- 支持 Flutter 跨平台

### v1.0.0
- 微信小程序初始版本
- 实现基础购物功能

## 联系我们

- GitHub：https://github.com/sutchan
- 项目负责人：Sut

## 许可证

MIT License

