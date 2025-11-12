# SutWxApp 微信小程序项目

## 项目结构

```
SutWxApp/
├── app.js              # 小程序入口文件
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── images/             # 图片资源
│   ├── default-avatar.png    # 默认头像图片
│   ├── tabbar/               # 底部导航栏图标
├── pages/              # 页面文件
    ├── index/          # 首页
    ├── category/       # 分类页
    ├── article/        # 文章相关页面
    │   ├── detail/     # 文章详情页
    ├── user/           # 用户相关页面
        ├── login/      # 登录页
        ├── profile/    # 个人中心页
```

## 功能模块

### 首页(index)
- 轮播图展示
- 搜索功能
- 分类入口
- 热门文章推荐

### 分类页(category)
- 分类列表展示
- 子分类筛选
- 分类下文章列表
- 下拉刷新和上拉加载更多

### 文章详情页(article/detail)
- 文章内容展示
- 作者信息展示
- 点赞功能
- 收藏功能
- 评论功能
- 分享功能
- 相关文章推荐

### 个人中心
- 个人中心首页
- 用户信息展示与编辑
- 收藏管理
- 地址管理
- 消息中心

## 开发环境配置
1. 下载并安装微信开发者工具
2. 克隆项目代码
3. 配置小程序appID
4. 配置项目基本信息

## API配置
在`app.js`中配置API基础路径：
```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1'
  }
```

## 技术栈
- 微信小程序框架
- WordPress REST API

## 开发依赖
- 微信开发者工具
- Node.js环境
- WordPress网站

## 版本信息
版本号：1.0.16
最后更新时间：2024年11月1日

## 版权信息
版权所有 © Sut 2024