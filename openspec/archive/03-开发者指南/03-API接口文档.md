﻿# API接口文档

<!--

文件名: 03-API接口文档.md

版本号: 1.0.0

更新日期: 2025-12-01

作者: Sut

描述: API接口设计和使用方法
-->

## 目录

[TOC]

## 1. 概述

### 1.1 文档目的

本文档旨在介绍SutWxApp项目的API接口设计和使用方法，帮助开发者理解和使用API接口。

### 1.2 API设计原则

- **RESTful设计**：遵循RESTful API设计规范
- **简洁易用**：接口设计简洁，易于理解和使用
- **高可用性**：API设计具有高可用性和容错能力
- **安全性**：API设计考虑安全性，防止常见的安全漏洞
- **可扩展性**：API设计具有良好的可扩展性，便于未来扩展

## 2. API架构

### 2.1 API层级结构

API层位于客户端和服务层之间，负责处理客户端请求，调用服务层API，返回结果给客户端。

### 2.2 API调用流程

1. 客户端发送请求到API层
2. API层进行请求验证和认证
3. API层调用服务层API
4. 服务层API处理业务逻辑
5. 服务层API调用数据访问层
6. 数据访问层与数据存储交互
7. 数据访问层返回结果给服务层API
8. 服务层API处理结果，返回给API层
9. API层格式化结果，返回给客户端

### 2.3 API技术栈

- **开发语言**：JavaScript
- **框架**：Express.js
- **数据库**：MySQL/MongoDB
- **认证**：JWT
- **文档**：Swagger/OpenAPI

## 3. API设计规范

### 3.1 命名规范

- API路径使用小写字母，单词之间用连字符分隔，例如：`/api/v1/user-info`
- HTTP方法使用标准的RESTful方法：GET、POST、PUT、DELETE、PATCH
- 参数名称使用小驼峰命名法，例如：`userId`
- 响应字段名称使用小驼峰命名法，例如：`userName`

### 3.2 HTTP方法使用

| HTTP方法 | 用途 | 示例 |
|---------|------|------|
| GET | 获取资源 | GET /api/v1/users |
| POST | 创建资源 | POST /api/v1/users |
| PUT | 更新资源 | PUT /api/v1/users/{id} |
| DELETE | 删除资源 | DELETE /api/v1/users/{id} |
| PATCH | 部分更新资源 | PATCH /api/v1/users/{id} |

### 3.3 状态码使用

| 状态码 | 含义 | 示例 |
|-------|------|------|
| 200 | 请求成功 | GET /api/v1/users |
| 201 | 资源创建成功 | POST /api/v1/users |
| 204 | 请求成功，无响应体 | DELETE /api/v1/users/{id} |
| 400 | 请求参数错误 | POST /api/v1/users（缺少必填参数） |
| 401 | 未认证 | GET /api/v1/users（未提供认证信息） |
| 403 | 禁止访问 | GET /api/v1/admin（权限不足） |
| 404 | 资源不存在 | GET /api/v1/users/{id}（id不存在） |
| 500 | 服务器内部错误 | 所有API（服务器异常） |

### 3.4 请求格式

- **URL参数**：用于标识资源，例如：`/api/v1/users/{id}`
- **查询参数**：用于过滤、排序和分页，例如：`/api/v1/users?page=1&pageSize=10&sort=createTime`
- **请求体**：用于创建和更新资源，使用JSON格式，例如：
  ```json
  {
    "username": "test",
    "password": "password",
    "email": "test@example.com"
  }
  ```

### 3.5 响应格式

所有API响应使用统一的JSON格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  },
  "timestamp": 1609459200000,
  "requestId": "uuid"
}
```

- **code**：响应状态码，与HTTP状态码一致
- **message**：响应消息，成功时为"success"，失败时为错误信息
- **data**：响应数据，成功时为具体的数据，失败时为null
- **timestamp**：响应时间戳
- **requestId**：请求ID，用于跟踪请求

## 4. 认证与授权

### 4.1 JWT认证

API使用JWT（JSON Web Token）进行认证，客户端需要在请求头中携带Authorization字段：

```
Authorization: Bearer {token}
```

### 4.2 权限控制

API使用基于角色的权限控制（RBAC），不同角色拥有不同的权限：

- **普通用户**：可以访问公共资源和自己的私有资源
- **管理员**：可以访问所有资源

## 5. 核心API接口

### 5.1 用户API

#### 5.1.1 注册用户

- **URL**：`/api/v1/users/register`
- **HTTP方法**：POST
- **请求体**：
  ```json
  {
    "username": "test",
    "password": "password",
    "email": "test@example.com",
    "phone": "13800138000"
  }
  ```
- **响应**：
  ```json
  {
    "code": 201,
    "message": "success",
    "data": {
      "id": 1,
      "username": "test",
      "email": "test@example.com",
      "phone": "13800138000",
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.1.2 用户登录

- **URL**：`/api/v1/users/login`
- **HTTP方法**：POST
- **请求体**：
  ```json
  {
    "username": "test",
    "password": "password"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "token": "jwt-token",
      "user": {
        "id": 1,
        "username": "test",
        "email": "test@example.com",
        "phone": "13800138000",
        "createdAt": "2025-12-01T00:00:00.000Z"
      }
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.1.3 获取用户信息

- **URL**：`/api/v1/users/{id}`
- **HTTP方法**：GET
- **认证**：需要
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "username": "test",
      "email": "test@example.com",
      "phone": "13800138000",
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.1.4 更新用户信息

- **URL**：`/api/v1/users/{id}`
- **HTTP方法**：PUT
- **认证**：需要
- **请求体**：
  ```json
  {
    "email": "new-test@example.com",
    "phone": "13900139000"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "username": "test",
      "email": "new-test@example.com",
      "phone": "13900139000",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-02T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.1.5 删除用户

- **URL**：`/api/v1/users/{id}`
- **HTTP方法**：DELETE
- **认证**：需要
- **响应**：
  ```json
  {
    "code": 204,
    "message": "success",
    "data": null,
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

### 5.2 产品API

#### 5.2.1 获取产品列表

- **URL**：`/api/v1/products`
- **HTTP方法**：GET
- **查询参数**：
  - `page`：页码，默认为1
  - `pageSize`：每页数量，默认为10
  - `categoryId`：分类ID
  - `keyword`：搜索关键词
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "list": [
        {
          "id": 1,
          "name": "产品1",
          "price": 100,
          "categoryId": 1,
          "createdAt": "2025-12-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "name": "产品2",
          "price": 200,
          "categoryId": 1,
          "createdAt": "2025-12-01T00:00:00.000Z"
        }
      ],
      "total": 2,
      "page": 1,
      "pageSize": 10
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.2.2 获取产品详情

- **URL**：`/api/v1/products/{id}`
- **HTTP方法**：GET
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "name": "产品1",
      "price": 100,
      "categoryId": 1,
      "description": "产品描述",
      "images": ["image1.jpg", "image2.jpg"],
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

### 5.3 订单API

#### 5.3.1 创建订单

- **URL**：`/api/v1/orders`
- **HTTP方法**：POST
- **认证**：需要
- **请求体**：
  ```json
  {
    "products": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
        "quantity": 1
      }
    ],
    "addressId": 1,
    "paymentMethod": "alipay"
  }
  ```
- **响应**：
  ```json
  {
    "code": 201,
    "message": "success",
    "data": {
      "id": 1,
      "orderNo": "ORD20251201000001",
      "totalAmount": 400,
      "status": "pending",
      "products": [
        {
          "productId": 1,
          "name": "产品1",
          "price": 100,
          "quantity": 2
        },
        {
          "productId": 2,
          "name": "产品2",
          "price": 200,
          "quantity": 1
        }
      ],
      "addressId": 1,
      "paymentMethod": "alipay",
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.3.2 获取订单列表

- **URL**：`/api/v1/orders`
- **HTTP方法**：GET
- **认证**：需要
- **查询参数**：
  - `page`：页码，默认为1
  - `pageSize`：每页数量，默认为10
  - `status`：订单状态
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "list": [
        {
          "id": 1,
          "orderNo": "ORD20251201000001",
          "totalAmount": 400,
          "status": "pending",
          "createdAt": "2025-12-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "orderNo": "ORD20251201000002",
          "totalAmount": 200,
          "status": "completed",
          "createdAt": "2025-12-01T00:00:00.000Z"
        }
      ],
      "total": 2,
      "page": 1,
      "pageSize": 10
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

### 5.4 通知API

#### 5.4.1 获取通知列表

- **URL**：`/api/v1/notifications`
- **HTTP方法**：GET
- **认证**：需要
- **查询参数**：
  - `type`：通知类型：all/system/order/promotion/activity
  - `status`：通知状态：all/read/unread
  - `page`：页码，默认为1
  - `pageSize`：每页数量，默认为20
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "list": [
        {
          "id": 1,
          "title": "系统通知",
          "content": "系统维护通知",
          "type": "system",
          "status": "unread",
          "createdAt": "2025-12-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "title": "订单通知",
          "content": "您的订单已发货",
          "type": "order",
          "status": "read",
          "createdAt": "2025-12-01T00:00:00.000Z"
        }
      ],
      "total": 2,
      "page": 1,
      "pageSize": 20
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 5.4.2 标记通知为已读

- **URL**：`/api/v1/notifications/{id}/read`
- **HTTP方法**：PUT
- **认证**：需要
- **响应**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "title": "系统通知",
      "content": "系统维护通知",
      "type": "system",
      "status": "read",
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

## 5. 错误处理

### 5.1 错误类型

API使用统一的错误格式，错误类型包括：

- **参数错误**：请求参数不符合要求
- **认证错误**：未提供认证信息或认证失败
- **授权错误**：没有权限访问资源
- **资源不存在**：请求的资源不存在
- **服务器内部错误**：服务器发生错误

### 5.2 错误响应格式

```json
{
  "code": 400,
  "message": "参数错误",
  "data": null,
  "timestamp": 1609459200000,
  "requestId": "uuid",
  "errors": [
    {
      "field": "username",
      "message": "用户名不能为空"
    },
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

## 6. API调用示例

### 6.1 使用Axios调用API

```javascript
const axios = require('axios');

// 设置基础URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加认证拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 登录
async function login(username, password) {
  try {
    const response = await api.post('/users/login', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('登录失败:', error.response.data);
    throw error;
  }
}

// 获取用户信息
async function getUserInfo(userId) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error.response.data);
    throw error;
  }
}
```

### 6.2 使用Fetch调用API

```javascript
// 设置基础URL
const baseURL = 'http://localhost:3000/api/v1';

// 登录
async function login(username, password) {
  try {
    const response = await fetch(`${baseURL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}
```

## 7. API测试

### 7.1 测试工具

- **Postman**：用于手动测试API
- **Swagger UI**：用于查看和测试API文档
- **Jest**：用于自动化测试
- **Supertest**：用于测试HTTP API

### 7.2 自动化测试示例

```javascript
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  let token;

  // 登录获取token
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'test',
        password: 'password'
      });
    token = response.body.data.token;
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user info', async () => {
      const response = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('username', 'test');
    });
  });
});
```

## 8. API版本管理

### 8.1 版本号格式

API版本号使用语义化版本规范（SemVer）：MAJOR.MINOR.PATCH，例如：v1.0.0

### 8.2 版本控制方式

API版本通过URL路径进行控制，例如：`/api/v1/users`

### 8.3 版本升级策略

- **MAJOR版本**：不兼容的破坏性变更
- **MINOR版本**：向下兼容的新功能
- **PATCH版本**：向下兼容的问题修复

## 9. 相关链接

- [服务层API文档](./05-服务层API文档.md)
- [API开发指南](./04-API开发指南.md)
- [权限配置文档](./06-权限配置文档.md)
- [Swagger文档](http://localhost:3000/api-docs)
