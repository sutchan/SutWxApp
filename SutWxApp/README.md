# SUT微信小程序

这是一个基于WordPress开发的微信小程序前端项目，用于展示和管理SUT（School of Urban Technology）相关的文章、分类等内容。

## 项目结构

```
SutWxApp/
├── app.js              # 小程序入口文件
├── app.json            # 全局配置文件
├── app.wxss            # 全局样式文件
├── images/             # 图片资源目录
│   ├── default-avatar.png    # 默认头像图片
│   └── tabbar/               # 底部标签栏图标
└── pages/              # 页面目录
    ├── index/          # 首页
    ├── category/       # 分类页
    ├── article/        # 文章相关页面
    │   └── detail/     # 文章详情页
    └── user/           # 用户相关页面
        ├── login/      # 登录页
        └── profile/    # 个人中心页
```

## 功能模块

### 首页（index）
- 轮播图展示
- 搜索功能
- 分类导航
- 热门文章推荐
- 最新文章列表

### 分类页（category）
- 分类列表展示
- 子分类筛选
- 分类下文章列表
- 下拉刷新和上拉加载更多

### 文章详情页（article/detail）
- 文章内容展示
- 作者信息显示
- 点赞功能
- 收藏功能
- 评论功能
- 分享功能
- 相关文章推荐

### 用户模块
- 用户登录（微信授权登录）
- 个人中心（用户信息展示）
- 收藏管理
- 地址管理
- 签到功能

## 开发环境配置

1. 安装微信开发者工具
2. 导入项目
3. 配置小程序AppID
4. 设置服务器域名

## 接口配置

在`app.js`中配置API基础地址：

```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1'
  }
  // ...其他配置
})
```

## 注意事项

1. 确保WordPress端已安装并激活了`sut-wechat-mini`插件
2. 确保服务器域名已在微信开发者工具中配置
3. 开发时请使用测试环境，发布前切换到生产环境
4. 遵循微信小程序开发规范和设计指南

## 更新日志

- v1.0.0: 初始版本，实现基本功能

## License

MIT