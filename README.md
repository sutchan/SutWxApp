# SUT微信小程序项目

[![GitHub release](https://img.shields.io/github/release/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/releases)
[![License](https://img.shields.io/github/license/sutchan/SutWxApp.svg)](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)

SUT微信小程序项目是一个完整的WordPress+微信小程序解决方案，包括WordPress插件和微信小程序前端两部分，用于将WordPress网站内容和功能同步到微信小程序中展示。

## 项目结构

项目由两个主要部分组成：

```
SutWxApp/
├── sut-wechat-mini/       # WordPress插件，提供后端API和管理功能
└── SutWxApp/              # 微信小程序前端项目
```

### WordPress插件（sut-wechat-mini）

```
sut-wechat-mini/
├── includes/              # 核心功能代码
├── assets/                # 静态资源
├── languages/             # 语言文件
├── templates/             # 模板文件
├── sut-wechat-mini.php    # 插件主文件
└── README.md              # 插件说明文档
```

### 微信小程序前端（SutWxApp）

```
SutWxApp/
├── app.js                 # 小程序入口文件
├── app.json               # 全局配置文件
├── app.wxss               # 全局样式文件
├── images/                # 图片资源
├── pages/                 # 页面文件
│   ├── index/             # 首页
│   ├── category/          # 分类页
│   ├── article/           # 文章相关页面
│   └── user/              # 用户相关页面
└── project.config.json    # 项目配置文件
```

## 功能特性

### 1. WordPress插件功能

- **内容同步**：将WordPress文章、页面、分类等内容同步到微信小程序
- **用户管理**：支持微信小程序用户登录、注册、个人信息管理等
- **电商功能**：与WooCommerce集成，支持商品展示、购物车、订单管理等
- **微信支付**：集成微信支付功能，支持小程序内支付
- **消息推送**：支持模板消息、订阅消息、客服消息等多种消息推送方式
- **积分系统**：内置积分系统，支持签到、评论、分享等行为获取积分
- **缓存管理**：内置缓存系统，提升小程序访问速度
- **数据统计**：提供用户增长、销售额等数据统计功能
- **多语言支持**：支持中文等多种语言

### 2. 微信小程序前端功能

- **首页**：轮播图展示、搜索功能、分类导航、热门文章推荐、最新文章列表
- **分类页**：分类列表展示、子分类筛选、分类下文章列表、下拉刷新和上拉加载更多
- **文章详情页**：文章内容展示、作者信息显示、点赞功能、收藏功能、评论功能、分享功能、相关文章推荐
- **用户模块**：用户登录（微信授权登录）、个人中心（用户信息展示）、收藏管理、地址管理、签到功能

## 环境要求

### WordPress插件环境要求

- WordPress 4.7 或更高版本
- PHP 5.6 或更高版本（推荐 PHP 7.0+）
- MySQL 5.6 或更高版本
- 微信小程序账号
- 微信支付商户号（如需电商功能）
- WooCommerce 3.0 或更高版本（如需电商功能）

### 微信小程序环境要求

- 微信开发者工具
- 微信小程序AppID
- 已配置的服务器域名

## 安装与配置

### 1. WordPress插件安装

#### 方法一：直接上传安装

1. 下载插件的ZIP文件
2. 登录WordPress后台，进入"插件" > "安装插件"
3. 点击"上传插件"，选择下载的ZIP文件，点击"现在安装"
4. 安装完成后，点击"启用插件"

#### 方法二：使用Git克隆

```bash
cd /path/to/wordpress/wp-content/plugins
git clone https://github.com/sutchan/SutWxApp.git sut-wechat-mini
```

然后在WordPress后台启用插件。

### 2. WordPress插件配置

1. 安装并启用插件后，在WordPress后台侧边栏会出现"SUT微信小程序"菜单项
2. 点击进入"基础设置"页面，填写以下必要信息：
   - 小程序AppID：在微信公众平台获取
   - 小程序AppSecret：在微信公众平台获取
   - 微信支付商户号（MCH_ID）：如需电商功能，在微信支付商户平台获取
   - 微信支付API密钥：在微信支付商户平台设置
3. 保存设置后，插件将自动创建所需的数据库表
4. 如需启用消息推送功能，请配置相应的消息模板ID

### 3. 微信小程序配置

1. 安装微信开发者工具
2. 导入SutWxApp项目
3. 在project.config.json中配置小程序AppID
4. 在app.js中配置API基础地址：

```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1'
  }
  // ...其他配置
})
```

5. 在微信开发者工具中设置服务器域名
6. 编译并运行小程序

## API接口说明

插件提供了丰富的API接口，供微信小程序调用。所有API接口的基础URL为：`http://your-site.com/sut-wechat-mini-api/`

### 基础API

- `ping`：检查API连接是否正常
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
- `user/signin/history`：获取签到历史

### 内容相关API

- `content/articles`：获取文章列表
- `content/article/detail`：获取文章详情
- `content/article/search`：搜索文章
- `content/article/hot`：获取热门文章
- `content/article/latest`：获取最新文章
- `content/categories`：获取分类列表
- `content/category/articles`：获取分类下的文章
- `content/tags`：获取标签列表
- `content/tag/articles`：获取标签下的文章
- `content/pages`：获取页面列表
- `content/page/detail`：获取页面详情

### 电商相关API

（需要安装并启用WooCommerce）

- `product/list`：获取产品列表
- `product/detail`：获取产品详情
- `product/search`：搜索产品

## 开发注意事项

1. 确保WordPress端已安装并激活了`sut-wechat-mini`插件
2. 确保服务器域名已在微信开发者工具中配置
3. 开发时请使用测试环境，发布前切换到生产环境
4. 遵循微信小程序开发规范和设计指南
5. 如需自定义功能，请参考插件提供的扩展接口

## 常见问题解决

### 插件激活失败

如果插件激活失败，可能是由于PHP版本过低或WordPress版本不符合要求。请确保：
- PHP版本不低于5.6.0（推荐7.0+）
- WordPress版本不低于4.7.0

### API连接失败

如果小程序无法连接到API，请检查：
- WordPress网站是否正常运行
- 小程序的API基础地址是否正确
- 服务器域名是否已在微信开发者工具中配置

## 版本更新日志

- v1.0.0: 初始版本，实现基本功能

## 许可证

本项目采用MIT许可证开源。详情请见[LICENSE](https://github.com/sutchan/SutWxApp/blob/master/LICENSE)文件。

## 联系我们

如果您在使用过程中遇到任何问题或有任何建议，欢迎通过以下方式联系我们：

- GitHub: [https://github.com/sutchan/SutWxApp](https://github.com/sutchan/SutWxApp)