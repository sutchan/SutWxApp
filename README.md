<!--
文件名 README.md
版本号 2.0.0
更新日期: 2025-12-29
作者 Sut
描述: README 文档文件，提供项目概述、安装指导和快速入门信息
-->
# SutWxApp Flutter应用 [![GitHub release](https://img.shields.io/github/release/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/releases)
[![License](https://img.shields.io/github/license/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)

**版本号：2.0.0**
*最后更新时间：2025年12月29日*

SutWxApp 是一个基于Flutter框架开发的跨平台电商应用，旨在为用户提供便捷的在线购物、积分管理和社交互动功能。该项目结合了现代化的前端开发技术与后端服务，为用户提供流畅的移动端购物体验，支持iOS、Android等多个平台。
## 项目文档

项目文档位于 `docs/` 目录下，按用户角色和功能模块组织，包括：

- **[API文档](docs/api/)** - 完整的接口规范和使用示例

## 项目结构

```
SutWxApp/
├── android/               # Android平台代码
├── assets/                # 静态资源文件
├── docs/                  # 项目文档
├── ios/                   # iOS平台代码
├── lib/                   # Flutter核心代码
├── linux/                 # Linux平台代码
├── macos/                 # macOS平台代码
├── test/                  # 测试代码
├── web/                   # Web平台代码
├── windows/               # Windows平台代码
├── .gitignore             # Git忽略文件
├── pubspec.yaml           # Flutter项目依赖配置
├── pubspec.lock           # 依赖版本锁定文件
├── README.md              # 项目说明文档
└── README_en.md           # 英文版本说明文档
```

### Flutter核心代码（lib）
```
lib/
├── main.dart              # 应用入口文件
├── components/            # 自定义组件
├── models/                # 数据模型
├── pages/                 # 页面文件
│   ├── home/              # 首页
│   ├── category/          # 分类页
│   ├── cart/              # 购物车
│   ├── user/              # 用户相关页面
│   └── ...                # 其他页面
├── services/              # 服务层
└── utils/                 # 工具类
```

## 功能特性
### Flutter应用功能
- **跨平台支持**：同时支持iOS、Android等多个平台
- **首页**：轮播图展示、搜索功能、分类导航、热门商品推荐、最新商品列表
- **分类页**：分类列表展示、子分类选择、分类下商品列表、下拉加载更多和上拉刷新更多
- **商品详情页**：商品内容展示、规格选择、加入购物车、收藏功能、分享功能、相关商品推荐
- **购物车**：添加/删除商品、修改数量、选择结算、优惠操作
- **订单管理**：订单创建、支付、状态跟踪、历史订单查询、订单评价
- **用户模块**：用户注册（微信授权登录）、个人中心（用户信息展示）、收藏管理、地址管理、签到功能
- **积分系统**：积分获取、积分兑换、积分商城、积分记录
- **社交功能**：商品评论、用户关注、分享功能
- **通知系统**：系统通知、订单通知、活动通知
- **支付系统**：微信支付集成、订单支付状态管理

## 环境要求

### Flutter开发环境要求
- Flutter SDK 3.x 或更高版本
- Dart SDK 3.x 或更高版本
- Android Studio 或 Visual Studio Code（推荐）
- Android SDK（用于Android开发）
- Xcode（用于iOS开发，仅macOS）

## 安装与配置
### 1. 环境准备

1. 安装Flutter SDK：访问 [Flutter官网](https://flutter.dev/docs/get-started/install) 下载并安装适合您操作系统的Flutter SDK
2. 配置Flutter环境变量
3. 安装Android Studio或Visual Studio Code，并安装Flutter扩展
4. 准备后端API服务地址

### 2. 项目安装

1. 克隆项目到本地：

```bash
git clone https://github.com/sutchan/SutWxApp.git
```

2. 进入项目目录：
```bash
cd SutWxApp
```

3. 获取依赖：
```bash
flutter pub get
```

### 3. 项目配置

1. 打开项目：
   - 使用Android Studio：直接打开项目目录
   - 使用Visual Studio Code：打开项目目录并安装推荐的扩展

2. 配置API基础地址：在`lib/services/http_service.dart`中配置API基础地址

3. 运行项目：
   - Android Studio：点击运行按钮
   - Visual Studio Code：使用快捷键F5或运行命令`flutter run`
   - 命令行：执行`flutter run`

## API接口说明

应用通过API接口与后端服务进行数据交互。所有API接口的基础URL在`lib/services/http_service.dart`中配置。
### 基础API

- `ping`：检测API连接是否正常
- `login`：用户登录
- `user/profile`：获取用户信息

### 用户相关API

- `user/address/list`：获取用户地址列表
- `user/address/add`：添加用户地址
- `user/address/update`：更新用户地址
- `user/address/delete`：删除用户地址
- `user/favorite/list`：获取用户收藏列表
- `user/favorite/add`：添加收藏
- `user/favorite/delete`：取消收藏
- `user/signin`：用户签到
- `user/signin/history`：获取签到记录

### 商品相关API

- `product/list`：获取商品列表
- `product/detail`：获取商品详情
- `product/search`：搜索商品
- `product/hot`：获取热门商品
- `product/latest`：获取最新商品
- `product/recommend`：获取推荐商品

### 分类相关API

- `category/list`：获取分类列表
- `category/detail`：获取分类详情
- `category/products`：获取分类下的商品

### 订单相关API

- `order/create`：创建订单
- `order/list`：获取订单列表
- `order/detail`：获取订单详情
- `order/pay`：支付订单
- `order/cancel`：取消订单
- `order/confirm`：确认收货
- `order/comment`：评价订单

### 积分相关API

- `points/balance`：获取用户积分余额
- `points/tasks`：获取积分任务列表
- `points/record`：获取积分记录
- `points/exchange/list`：获取积分兑换商品列表
- `points/exchange`：积分兑换商品

### 通知相关API

- `notification/list`：获取通知列表
- `notification/read`：标记通知为已读
- `notification/delete`：删除通知

## 开发注意事项
1. 确保后端API服务正常运行
2. 开发时请使用测试环境，发布前切换到生产环境
3. 遵循Flutter开发规范和设计指南
4. 代码提交前请执行代码检查和测试
5. 确保所有API接口调用都有适当的错误处理
6. 注意应用包体积优化
7. 实现响应式设计，适配不同屏幕尺寸

## 常见问题解决

### Flutter运行失败
如果Flutter运行失败，可能是由于：
- Flutter SDK版本不符合要求（请使用3.x或更高版本）
- 依赖包未正确安装（请尝试执行`flutter pub get`）
- 设备未正确连接或模拟器未启动
- 代码语法错误（请查看控制台错误信息）

### 页面加载缓慢

如果页面加载缓慢，可以尝试：
- 检查网络请求是否过多或过大
- 优化图片资源大小和格式
- 使用Flutter提供的缓存策略
- 实现懒加载和分页加载
- 优化Widget树结构，减少不必要的重建

## 版本更新信息

- v2.0.0: 项目迁移到Flutter框架，支持跨平台
- v1.0.0: 微信小程序初始版本，实现基本功能
- v0.9.0: 项目重构，优化代码结构和性能
- v0.8.0: 添加积分系统和社交功能
- v0.7.0: 实现电商功能，包括商品、购物车和订单管理
- v0.6.0: 优化用户体验和界面设计
- v0.5.0: 添加用户系统和通知功能
- v0.4.0: 实现登录页面和功能模块
- v0.3.0: 项目初始化和登录架构搭建

## 许可证
本项目采用MIT许可证开源。详情请见[LICENSE](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)文件。

## 联系我们

如果您在使用过程中遇到任何问题或有任何建议，欢迎通过以下方式联系我们：
- GitHub: [https://github.com/sutchan/SutWxApp](https://github.com/sutchan/SutWxApp)
