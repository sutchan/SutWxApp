# API开发指南
<!--
文件名: 04-API开发指南.md
版本号: 1.0.0
更新日期: 2025-11-30
作者: Sut
描述: API开发流程和规范
-->

## 目录

[TOC]

## 1. 概述

### 1.1 文档目的

本文档旨在介绍SutWxApp项目的API开发流程和规范，帮助开发者正确开发和维护API接口。
### 1.2 开发原则
- **RESTful设计**：遵循RESTful API设计规范
- **统一接口**：所有API接口使用统一的格式和规范
- **版本控制**：支持API版本控制，便于升级和兼容
- **安全性**：确保API接口的安全性
- **可读性**：API接口名称清晰，易于理解和使用
- **可测试性**：API接口易于测试和调试
- **可扩展性**：API接口设计具有良好的扩展性
## 2. API开发流程
### 2.1 需求分析
1. 理解业务需求
2. 确定API接口的功能和用途
3. 分析API接口的输入和输出
4. 确定API接口的权限要求

### 2.2 设计

1. 设计API接口的URL路径
2. 设计API接口的请求方法
3. 设计API接口的请求参数
4. 设计API接口的响应格式
5. 设计API接口的错误处理
6. 设计API接口的权限控制

### 2.3 开发
1. 创建API路由
2. 实现API接口的业务逻辑
3. 添加请求验证
4. 添加限流控制
5. 添加错误处理
6. 添加日志记录

### 2.4 测试

1. 编写单元测试
2. 编写集成测试
3. 测试API接口的功能
4. 测试API接口的性能
5. 测试API接口的安全性

### 2.5 文档编写

1. 编写API接口文档
2. 说明API接口的功能和用途
3. 说明API接口的URL路径和请求方法
4. 说明API接口的请求参数和响应格式
5. 提供API接口的调用示例

### 2.6 代码审查

1. 提交代码审查
2. 修复代码审查中发现的问题
3. 确保代码符合规范

### 2.7 部署

1. 部署API接口到测试环境
2. 进行验收测试
3. 部署API接口到生产环境

## 3. API设计规范

### 3.1 URL设计

- 使用小写字母和连字符 `-` 分隔单词，例如：`/api/v1/users`
- 使用名词复数表示资源集合，例如：`/api/v1/users`
- 使用名词单数表示单个资源，例如：`/api/v1/users/1`
- 使用版本号前缀，例如：`/api/v1/users`
- 避免使用动词，例如：`/api/v1/get-users`（错误），`/api/v1/users`（正确）

### 3.2 请求方法

- **GET**：获取资源
- **POST**：创建资源
- **PUT**：更新资源
- **DELETE**：删除资源
- **PATCH**：部分更新资源

### 3.3 请求参数

- **路径参数**：用于标识资源，例如：`/api/v1/users/:id`
- **查询参数**：用于过滤、排序和分页，例如：`/api/v1/users?page=1&page_size=10`
- **请求体参数**：用于创建或更新资源，使用JSON格式

### 3.4 响应格式

- 统一使用JSON格式
- 包含状态码、消息和数据
- 成功响应示例：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      // 响应数据
    },
    "timestamp": 1638316800000
  }
  ```
- 错误响应示例：
  ```json
  {
    "code": 400,
    "message": "错误信息",
    "data": null,
    "timestamp": 1638316800000
  }
  ```

### 3.5 错误处理

- 使用HTTP状态码表示错误类型
- 提供清晰的错误信息
- 包含错误码和错误描述
- 错误码示例：
  | 错误码 | 说明 |
  |-------|------|
  | 200 | 成功 |
  | 400 | 请求参数错误 |
  | 401 | 未授权 |
  | 403 | 禁止访问 |
  | 404 | 资源不存在 |
  | 500 | 服务器内部错误 |

### 3.6 权限控制

- 使用JWT进行认证
- 基于角色的权限控制(RBAC)
- 细粒度的权限管理
- 权限检查示例：
  ```javascript
  // 检查用户是否有权限访问资源
  if (!user.hasPermission('read:users')) {
    return res.status(403).json({
      code: 403,
      message: 'Forbidden',
      data: null
    });
  }
  ```

## 4. API开发最佳实践

### 4.1 代码组织

- 按功能模块组织API路由
- 分离路由和业务逻辑
- 使用中间件处理公共逻辑
- 示例：
  ```
  routes/
  ├── users.js
  ├── products.js
  ├── orders.js
  └── index.js
  ```

### 4.2 请求验证

- 使用验证中间件验证请求参数
- 验证请求参数的类型、格式和范围
- 提供清晰的验证错误信息
- 示例：
  ```javascript
  const { body, validationResult } = require('express-validator');
  
  router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('用户名长度不能少于3个字符'),
    body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6个字符'),
    body('email').isEmail().withMessage('邮箱格式不正确')
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '请求参数错误',
        data: errors.array()
      });
    }
    // 处理注册逻辑
  });
  ```

### 4.3 日志记录

- 记录API请求和响应日志
- 记录错误日志
- 记录性能日志
- 示例：
  ```javascript
  // 记录请求日志
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
  ```

### 4.4 缓存

- 使用缓存提高API性能
- 缓存热点数据
- 设置合理的缓存过期时间
- 示例：
  ```javascript
  // 使用Redis缓存
  const redisClient = require('../config/redis');
  
  router.get('/users', async (req, res) => {
    const cacheKey = 'users:list';
    
    // 尝试从缓存获取数据
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({
        code: 200,
        message: 'success',
        data: JSON.parse(cachedData)
      });
    }
    
    // 从数据库获取数据
    const users = await User.find();
    
    // 缓存数据，过期时间10分钟
    await redisClient.setex(cacheKey, 600, JSON.stringify(users));
    
    res.json({
      code: 200,
      message: 'success',
      data: users
    });
  });
  ```

### 4.5 分页

- 对列表接口实现分页
- 提供分页参数：page（页码）和page_size（每页数量）
- 返回分页信息：total（总数量）、page（当前页码）、page_size（每页数量）、total_pages（总页数）
- 示例：
  ```javascript
  router.get('/users', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const page_size = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * page_size;
    
    const total = await User.countDocuments();
    const users = await User.find().skip(skip).limit(page_size);
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        total,
        page,
        page_size,
        total_pages: Math.ceil(total / page_size),
        items: users
      }
    });
  });
  ```

### 4.6 错误处理

- 使用全局错误处理中间件
- 统一错误响应格式
- 记录错误日志
- 示例：
  ```javascript
  // 全局错误处理中间件
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  });
  ```

## 5. API测试

### 5.1 单元测试

- 测试API接口的业务逻辑
- 使用测试框架，例如：Jest、Mocha
- 示例：
  ```javascript
  const request = require('supertest');
  const app = require('../app');
  
  describe('GET /api/v1/users', () => {
    it('should return a list of users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.code).toEqual(200);
      expect(res.body.data).toHaveProperty('items');
    });
  });
  ```

### 5.2 集成测试

- 测试API接口的集成情况
- 测试API接口与数据库、缓存等的交互
- 示例：
  ```javascript
  describe('POST /api/v1/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({
          username: 'test',
          password: 'password',
          email: 'test@example.com'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.code).toEqual(200);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.username).toEqual('test');
    });
  });
  ```

### 5.3 性能测试

- 测试API接口的性能
- 测试API接口的并发处理能力
- 使用性能测试工具，例如：JMeter、Artillery
- 示例：
  ```bash
  # 使用Artillery进行性能测试
  artillery run performance-test.yml
  ```

## 6. 相关链接

- [API接口文档.md](./03-API接口文档.md)
- [服务层API文档.md](./05-服务层API文档.md)
- [代码规范.md](./08-代码规范.md)
