# SutWxApp - 苏铁微信小程序

苏铁微信小程序是一款面向消费者的电商平台，提供商品浏览、购物车、订单管理、用户中心等核心购物功能。

## 快速开始

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，点击「导入项目」
3. 选择 `SutWxApp/` 目录作为项目路径
4. 填写 AppID（可使用测试号）
5. 点击「确定」完成导入

## 项目结构

```
SutWxApp/
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── components/         # 自定义组件
├── images/             # 图片资源
├── locales/            # 多语言文件
├── pages/              # 页面文件
├── services/           # 服务层
├── types/              # 类型定义
└── utils/              # 工具类
```

## 页面导航

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/home/index | 商品展示、分类导航、搜索 |
| 分类 | pages/category/index | 商品分类浏览 |
| 购物车 | pages/cart/index | 购物车管理 |
| 订单 | pages/order/index | 订单列表 |
| 用户中心 | pages/user/index | 个人中心、设置 |

## 相关文档

- [项目规范](openspec/README.md)
- [高保真原型](openspec/prototype/prototype.html)
- [项目概览](docs/PROJECT_OVERVIEW.md)

## 技术说明

- 微信小程序原生框架
- JavaScript / TypeScript
- 微信开发者工具
