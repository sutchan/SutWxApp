<!--
文件名 README.md
版本号 1.0.0
更新日期: 2025-11-24
作者 Sut
描述: README 文档文件，提供项目概述、安装指导和快速入门信息
-->
# SutWxApp 微信小程序项目 [![GitHub release](https://img.shields.io/github/release/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/releases)
[![License](https://img.shields.io/github/license/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)

**版本号：1.0.0**
*最后更新时间：2025年11月24日*

SutWxApp 是一个基于微信小程序平台开发的电商应用，旨在为用户提供便捷的在线购物、积分管理和社交互动功能。该项目结合了现代化的前端开发技术与后端服务，为用户提供流畅的移动端购物体验。
## 项目文档

项目文档位于 `docs/` 目录下，按用户角色和功能模块组织，包括：

- **[项目概述](docs/00-项目概述/)** - 项目简介和快速入门指导
- **[开发者指导](docs/03-开发者指导/)** - 开发人员技术文档
- **[用户指南](docs/04-用户指南/)** - 小程序终端用户使用文档
- **[API文档](docs/03-开发者指导/03-API接口文档.md)** - 完整的接口规范和使用示例
- **[功能模块说明](docs/05-功能模块/)** - 各功能模块的详细说明和使用方法
- **[文档指南](docs/01-文档指南/)** - 文档组织方式和编写说明

所有文档均保持版本一致，当前版本号：1.0.0

## 项目结构

```
SutWxApp/
├── SutWxApp/              # 微信小程序前端项目
├── docs/                  # 项目文档
├── tests/                 # 测试代码
└── utils/                 # 工具类
```

### 微信小程序前端（SutWxApp）
```
SutWxApp/
├── app.js                 # 小程序入口文件
├── app.json               # 全局配置文件
├── app.wxss               # 全局样式文件
├── components/            # 自定义组件
├── images/                # 图片资源
├── pages/                 # 页面文件
│   ├── index/             # 首页
│   ├── category/          # 分类页
│   ├── product/           # 产品相关页面
│   ├── cart/              # 购物车
│   ├── order/             # 订单相关页面
│   ├── user/              # 用户相关页面
│   ├── search/            # 搜索页面
│   └── ...                # 其他页面
├── services/              # 服务层
├── utils/                 # 工具类
└── package.json           # 项目依赖配置
```

## 功能特性
### 微信小程序功能
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

### 微信小程序环境要求
- 微信开发者工具
- 微信小程序AppID
- 已配置的服务器域名
- Node.js 16.0.0 或更高版本（用于开发环境）

## 安装与配置
### 1. 环境准备

1. 安装微信开发者工具
2. 注册微信小程序账号，获取AppID
3. 准备后端API服务地址
4. 安装Node.js 16.0.0或更高版本（用于开发环境）

### 2. 项目安装

1. 克隆项目到本地：

```bash
git clone https://github.com/sutchan/SutWxApp.git
```

2. 进入项目目录：
```bash
cd SutWxApp
```

3. 安装依赖：
```bash
npm install
```

### 3. 项目配置

1. 打开微信开发者工具，导入项目
2. 在project.config.json中配置小程序AppID
3. 在app.js中配置API基础地址，如：
```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-api-server.com/api/v1'
  }
  // ...其他配置
})
```

4. 在微信开发者工具中配置服务器域名
5. 编译并运行小程序

## API接口说明

小程序通过API接口与后端服务进行数据交互。所有API接口的基础URL由开发者在app.js中配置。
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
2. 确保服务器域名已在微信开发者工具中配置
3. 开发时请使用测试环境，发布前切换到生产环境
4. 遵循微信小程序开发规范和设计指南
5. 代码提交前请执行代码检查和测试
6. 确保所有API接口调用都有适当的错误处理
7. 注意小程序包体积限制，合理使用分包加载

## 常见问题解决

### API连接失败

如果小程序无法连接到API，请检查：
- 后端API服务是否正常运行
- 小程序的API基础地址是否正确
- 服务器域名是否已在微信开发者工具中配置
- 网络请求是否在request合法域名列表中

### 小程序编译失败
如果小程序编译失败，可能是由于：
- Node.js版本不符合要求（请使用16.0.0或更高版本）
- 依赖包未正确安装（请尝试删除node_modules并重新执行npm install）
- 代码语法错误（请查看控制台错误信息）

### 页面加载缓慢

如果页面加载缓慢，可以尝试：
- 检查网络请求是否过多或过大
- 优化图片资源大小和格式
- 使用小程序提供的缓存策略
- 实现懒加载和分页加载

## 版本更新信息

- v1.0.0: 初始版本，实现基本功能
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
