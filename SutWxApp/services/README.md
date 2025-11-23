# 服务层架构文档

## 概述

SutWxApp服务层是小程序的核心业务逻辑层，负责处理数据获取、业务逻辑处理和状态管理。

## 目录结构

```
services/
├── index.js               # 服务入口和导出
├── service-manager.js     # 服务管理器，负责服务的注册和初始化
├── service-adapter.js     # 服务适配器，用于统一不同服务的接口
├── service-integration.js # 服务集成，处理服务间的依赖关系
├── app-initializer.js     # 应用初始化器，负责整个应用的初始化流程
└── README.md              # 本文档
```

## 核心服务

### 1. 认证服务 (authService.js)

认证服务负责处理用户登录、登出和会话管理。

**主要功能：**
- 用户登录验证
- 用户登出处理
- 认证令牌管理
- 登录状态检查

**使用示例：**
```javascript
// 导入认证服务
const authService = require('./services/authService');

// 用户登录
authService.login('username', 'password')
  .then(user => {
    console.log('登录成功', user);
  })
  .catch(error => {
    console.error('登录失败', error);
  });

// 检查登录状态
if (authService.isLoggedIn()) {
  // 用户已登录
}

// 用户登出
authService.logout().then(() => {
  console.log('已登出');
});
```

## 服务依赖关系

服务之间存在依赖关系，初始化时需要按照正确的顺序加载：

```
cache -> api -> config -> auth -> 业务服务
```

### 核心依赖顺序

- **基础服务：**
  - cache: []
  - api: [cache]
  - config: [cache, api]

- **用户相关服务：**
  - auth: [api, cache, config]
  - user: [api, cache, auth]
  - following: [api, auth]

- **内容相关服务：**
  - category: [api, cache]
  - article: [api, cache, category]
  - comment: [api, auth, article]

- **电商相关服务：**
  - product: [api, cache, category]
  - cart: [api, auth, cache]
  - address: [api, auth, cache]
  - payment: [api, auth, config]
  - order: [api, auth, cache, payment, address]
  - points: [api, auth, cache]

- **其他服务：**
  - file: [api, auth]
  - feedback: [api, auth]
  - analytics: [api, cache, config]
  - notification: [api, cache, auth]
  - search: [api, cache, config]

## 在应用中使用服务

### 在app.js中初始化服务

```javascript
// app.js
const { initializeApp } = require('./services/app-initializer');

App({
  onLaunch: async function() {
    // 初始化所有服务
    const success = await initializeApp({
      services: {
        useAdapters: true,
        enableCache: true
      },
      api: {
        baseUrl: getApp().globalData.baseUrl
      }
    });
    
    if (success) {
      console.log('服务初始化成功');
    } else {
      console.error('服务初始化失败');
    }
  },
  
  // 提供获取服务的全局方法
  getService: function(serviceName) {
    const { getService } = require('./services/service-integration');
    return getService(serviceName);
  }
});
```

### 在页面中使用服务

```javascript
// pages/index/index.js
const app = getApp();

Page({
  data: {
    articles: []
  },
  
  onLoad: async function() {
    try {
      // 获取文章服务实例
      const articleService = app.getService('article');
      
      // 使用服务获取文章列表
      const articles = await articleService.getArticles({ page: 1, limit: 10 });
      
      this.setData({ articles });
    } catch (error) {
      console.error('获取文章列表失败', error);
    }
  }
});
```

## 最佳实践

1. **服务设计原则：**
   - 单一职责原则
   - 依赖注入
   - 接口统一
   - 错误处理

2. **性能优化：**
   - 合理使用缓存
   - 避免重复请求
   - 数据预加载

3. **错误处理：**
   - 统一错误处理
   - 用户友好的错误提示
   - 错误日志记录