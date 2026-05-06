
&lt;!--
文件名 README.md
版本号: 3.0.0
更新日期: 2026-05-06
作者 Sut
描述: README 文档文件，提供项目概述、安装指导和快速入门信息
--&gt;
# SutWxApp 项目 [![GitHub release](https://img.shields.io/github/release/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/releases)
[![License](https://img.shields.io/github/license/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)

**版本号：3.0.0**
*最后更新时间：2026年5月6日*

SutWxApp 是苏铁微信小程序电商平台，同时支持微信小程序原生框架和 Flutter 跨平台框架。该项目为用户提供便捷的在线购物、积分管理和社交互动功能，采用现代化开发技术，为用户提供流畅的购物体验。

## 项目文档

项目文档位于多个位置：

- **[项目规范](openspec/)** - 完整的项目开发规范
- **[API文档](docs/api/)** - 完整的接口规范和使用示例
- **[归档文档](openspec/archive/)** - 历史文档归档

## 项目结构

```
SutWxApp/
├── SutWxApp/                # 微信小程序项目
│   ├── app.js            # 小程序入口文件
│   ├── app.json            # 全局配置
│   ├── app.wxss            # 全局样式
│   ├── components/          # 自定义组件
│   ├── images/            # 图片资源
│   ├── pages/             # 页面文件
│   │   ├── home/         # 首页
│   │   ├── category/   # 分类页
│   │   ├── product/    # 商品页
│   │   ├── cart/       # 购物车
│   │   ├── order/       # 订单页
│   │   └── user/      # 用户中心
│   ├── services/          # 服务层
│   ├── utils/           # 工具类
│   ├── types/           # 类型定义
│   └── locales/         # 多语言文件
├── build/flutter/        # Flutter 跨平台应用
├── tests/            # 测试文件
├── docs/             # 项目文档
├── openspec/         # 规范文档
└── .trae/           # 项目规则
```

## 功能特性

### 微信小程序功能

- **首页**：轮播图展示、搜索功能、分类导航、热门商品推荐、最新商品列表
- **分类页**：分类列表展示、子分类选择、分类下商品列表
- **商品详情页**：商品内容展示、规格选择、加入购物车、收藏功能、分享功能、相关商品推荐
- **购物车**：添加/删除商品、修改数量、选择结算、优惠操作
- **订单管理**：订单创建、支付、状态跟踪、历史订单查询、订单评价
- **用户模块**：用户注册（微信授权登录）、个人中心、收藏管理、地址管理、签到功能
- **积分系统**：积分获取、积分兑换、积分商城、积分记录
- **支付系统**：微信支付集成、订单支付状态管理

## 环境要求

### 微信小程序开发环境要求

- **微信开发者工具**：最新稳定版
- **Bun**：v1.0.0+
- **TypeScript**：v5.3.0+
- **Git**：最新稳定版
- **VS Code**：最新稳定版（用于代码编辑）

### Flutter 开发环境要求

- Flutter SDK 3.x 或更高版本
- Dart SDK 3.x 或更高版本
- Android Studio 或 Visual Studio Code
- Android SDK（用于 Android 开发）
- Xcode（用于 iOS 开发，仅 macOS）

## 安装与配置

### 1. 环境准备

1. 克隆项目到本地：
```bash
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp
```

2. 安装依赖：
```bash
npm install
```

### 2. 微信小程序开发

1. 打开微信开发者工具
2. 从 `SutWxApp/SutWxApp` 目录导入项目
3. 在微信开发者工具中配置 AppID
4. 在 `app.js` 中配置 API 基础 URL
5. 点击"编译"按钮运行项目

### 3. Flutter 开发

1. 进入 Flutter 项目目录：
```bash
cd build/flutter
```

2. 获取依赖：
```bash
flutter pub get
```

3. 运行项目：
```bash
flutter run
```

## 开发规范

请参考 [项目规范文档](openspec/) 了解详细的开发规范：

- **[项目规范](openspec/specs/project/spec.md)** - 项目概述和基本规范
- **[架构规范](openspec/specs/architecture/spec.md)** - 技术架构规范
- **[开发规范](openspec/specs/development/spec.md)** - 开发环境和流程
- **[功能规范](openspec/specs/features/spec.md)** - 功能模块规范

## 主要脚本

```bash
npm run test          # 运行测试
npm run lint          # 代码检查
npm run typecheck     # TypeScript 类型检查
npm run build         # 项目构建
```

## Git 工作流

### 分支策略

- **main/master**：生产分支，保持稳定
- **develop**：集成分支，用于测试
- **feature/xxx**：功能开发分支
- **bugfix/xxx**：bug 修复分支

### 提交规范

使用语义化提交消息，格式为：`<type>: <description>`

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码样式修改
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或辅助工具的变动

## 版本历史

- **v3.0.0** (2026-05-06): 项目重构，完善项目规范和完整开发
- **v2.0.0**: 项目迁移到 Flutter 框架，支持跨平台
- **v1.0.0**: 微信小程序初始版本，实现基本功能

## 许可证

本项目采用 MIT 许可证开源。详情请见 [LICENSE](https://github.com/sutchan/SutWxApp/blob/master/LICENSE) 文件。

## 联系我们

如果您在使用过程中遇到任何问题或有任何建议，欢迎通过以下方式联系我们：
- GitHub: [https://github.com/sutchan/SutWxApp](https://github.com/sutchan/SutWxApp)

