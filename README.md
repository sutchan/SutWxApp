# SutWxApp - 苏铁微信小程序

![版本](https://img.shields.io/badge/version-2.0.0-blue)
![设计风格](https://img.shields.io/badge/design-Apple%20Style-green)

## 简介

苏铁微信小程序是一款面向消费者的电商平台，提供植物和园艺相关商品的浏览、购物车、订单管理、用户中心等核心功能。界面设计采用 Apple 极简风格，提供优质的用户体验。

## 设计风格

### Apple 极简设计

采用 Apple 官网设计风格，核心特点：

- **极简主义**：减少视觉干扰，突出核心内容
- **大图展示**：商品图片采用大尺寸展示
- **充足留白**：使用合理的间距创造清爽感
- **清晰层次**：通过字体大小、颜色深浅建立视觉层级
- **微妙动效**：悬停效果、点击反馈、平滑过渡

### 颜色系统

| 颜色 | 用途 |
|------|------|
| #2E7D32 | 主色调（绿色） |
| #1B5E20 | 深绿色 |
| #F1F8E9 | 浅绿色背景 |
| #1D1D1F | 主要文字 |
| #86868B | 次要文字 |
| #F5F5F7 | 页面背景 |

## 快速开始

### 环境准备

1. **下载微信开发者工具**

   前往 [微信开发者工具官网](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 下载并安装适合你操作系统的版本。

2. **导入项目**

   - 打开微信开发者工具
   - 点击「导入项目」或「+」号
   - 选择项目目录：`SutWxApp/`
   - 填写项目名称和 AppID（如果没有 AppID，可以选择「测试号」）
   - 点击「导入」或「确定」

3. **开始开发**

   项目导入后，你可以在微信开发者工具中：
   - 预览小程序效果
   - 修改代码实时预览
   - 使用真机调试功能

## 项目结构

```
SutWxApp/
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式（Apple风格）
├── components/             # 自定义组件
├── images/                 # 图片资源
│   └── tabbar/             # tabBar图标
├── locales/                # 多语言文件
├── pages/                  # 页面文件
│   ├── cart/               # 购物车页
│   ├── category/           # 分类页
│   ├── home/               # 首页
│   ├── order/              # 订单相关
│   └── user/               # 用户中心
├── services/               # 服务层
├── types/                  # 类型定义
└── utils/                  # 工具类
```

## 页面导航

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/home/index | 商品展示、分类导航、搜索 |
| 分类 | pages/category/index | 商品分类浏览 |
| 购物车 | pages/cart/index | 购物车管理 |
| 用户中心 | pages/user/index | 个人中心、设置 |

## 核心功能

- 商品浏览与搜索
- 商品分类导航
- 购物车管理
- 订单管理
- 用户中心
- 地址管理
- 设置页面

## 技术栈

- **框架**：微信小程序原生框架
- **开发语言**：JavaScript / TypeScript
- **UI风格**：Apple极简设计
- **开发工具**：微信开发者工具

## 相关文档

- [项目规范](openspec/README.md)
- [高保真原型](openspec/prototype/prototype.html)
- [项目概览](docs/PROJECT_OVERVIEW.md)

## 版本历史

详细变更请查看 [CHANGELOG.md](CHANGELOG.md)

## 许可证

MIT License
