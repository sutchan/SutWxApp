# API规范

## 目的
本规范定义了苏铁微信小程序（SutWxApp）项目的API设计和使用，包括API结构、设计原则、认证机制、核心接口、错误处理和版本管理。

## 设计原则

### 1. RESTful设计
- 遵循RESTful API设计原则
- 使用HTTP方法表示操作类型
- 资源路径使用名词复数形式
- 状态码表示操作结果

### 2. 简洁易用
- 接口命名简洁明了
- 减少不必要的参数
- 提供清晰的错误信息
- 支持常见的请求格式

### 3. 高可靠性
- 提供适当的超时机制
- 实现幂等性设计
- 支持重试机制
- 提供合理的缓存策略

### 4. 安全性
- 防止常见的安全漏洞
- 实现适当的认证和授权
- 加密敏感数据
- 限制请求频率

### 5. 可扩展性
- 支持版本管理
- 模块化设计
- 支持参数扩展
- 考虑未来需求

### 6. 一致性
- 统一的命名规范
- 一致的响应格式
- 统一的错误处理
- 一致的认证方式

### 7. 文档化
- 提供完整的API文档
- 包含示例请求和响应
- 描述参数和返回值
- 更新及时

## API结构

### URL结构
```
https://api.example.com/v{version}/{resource}/{id}?{query_parameters}
```

- **version**: API版本号，如v1, v2
- **resource**: 资源名称，使用复数形式，如users, products
- **id**: 资源ID，用于标识特定资源
- **query_parameters**: 查询参数，用于过滤、排序等

### HTTP方法

| HTTP方法 | 描述 | 幂等性 |
|----------|------|--------|
| GET | 获取资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 更新资源 | 是 |
| PATCH | 部分更新资源 | 是 |
| DELETE | 删除资源 | 是 |

### 状态码

| 状态码 | 描述 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 请求成功，无内容返回 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |
| 504 | Gateway Timeout | 网关超时 |

## 认证与授权

### JWT认证
- 所有需要认证的API请求必须在Authorization头中携带JWT令牌
- 令牌格式：`Authorization: Bearer {token}`
- 令牌有效期：24小时
- 刷新机制：支持令牌刷新

### RBAC授权
- 基于角色的访问控制
- 支持角色：普通用户、管理员
- 细粒度权限控制
- 动态权限分配

## 请求格式

### URL参数
- 用于标识资源或过滤、排序
- 示例：`/api/v1/users?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc`

### 查询参数
- 用于过滤、排序、分页等
- 支持多种比较运算符：=, >, <, >=, <=, in, like
- 支持逻辑运算符：and, or

### JSON请求体
- 用于创建或更新资源
- 示例：
```json
{
  "username": "test",
  "password": "password",
  "email": "test@example.com",
  "phone": "13800138000"
}
```

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1609459200000,
  "requestId": "uuid"
}
```

### 列表响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1609459200000,
  "requestId": "uuid"
}
```

### 错误响应
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

## 核心API接口

### 用户API

#### 注册用户
- **URL**: `POST /api/v1/users/register`
- **描述**: 注册新用户账号
- **请求体**: 
  ```json
  {
    "username": "test",
    "password": "password",
    "email": "test@example.com",
    "phone": "13800138000"
  }
  ```
- **响应**: 
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

#### 用户登录
- **URL**: `POST /api/v1/users/login`
- **描述**: 认证用户并返回JWT令牌
- **请求体**: 
  ```json
  {
    "username": "test",
    "password": "password"
  }
  ```
- **响应**: 
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

#### 获取用户信息
- **URL**: `GET /api/v1/users/{id}`
- **描述**: 通过ID获取用户信息
- **认证**: 需要
- **响应**: 
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

### 产品API

#### 获取产品列表
- **URL**: `GET /api/v1/products`
- **描述**: 获取产品列表，支持分页和搜索
- **查询参数**: 
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `categoryId`: 用于过滤的分类ID
  - `keyword`: 搜索关键词
- **响应**: 
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

#### 获取产品详情
- **URL**: `GET /api/v1/products/{id}`
- **描述**: 获取产品详细信息
- **响应**: 
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

### 订单API

#### 创建订单
- **URL**: `POST /api/v1/orders`
- **描述**: 创建新订单
- **认证**: 需要
- **请求体**: 
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
- **响应**: 
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

## 错误处理

### 错误类型

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| 40001 | 参数错误 | 400 |
| 40101 | 未认证 | 401 |
| 40102 | 认证过期 | 401 |
| 40103 | 认证无效 | 401 |
| 40301 | 无权限 | 403 |
| 40401 | 资源不存在 | 404 |
| 50001 | 服务器错误 | 500 |
| 50002 | 数据库错误 | 500 |
| 50003 | 第三方服务错误 | 500 |

### 错误响应格式

```json
{
  "code": 40001,
  "message": "参数错误",
  "data": null,
  "timestamp": 1609459200000,
  "requestId": "uuid",
  "errors": [
    {
      "field": "username",
      "message": "用户名不能为空"
    }
  ]
}
```

## 版本管理

### 版本格式
- **语义化版本号**: MAJOR.MINOR.PATCH（例如：v1.0.0）

### 版本控制
- **URL路径版本控制**: `/api/v{version}/resources`

### 升级策略
- **MAJOR**: 破坏性变更，与以前版本不兼容
- **MINOR**: 新功能，向后兼容
- **PATCH**: 错误修复，向后兼容

### 版本支持
- 同时支持2个主要版本
- 旧版本在新版本发布后6个月内支持
- 提供版本迁移指南

## API测试

### 手动测试工具
- **Postman**: 用于交互式API测试
- **Swagger UI**: 用于API文档和测试
- **curl**: 命令行HTTP客户端

### 自动化测试
- **Jest**: 用于单元测试和集成测试
- **Supertest**: 用于HTTP API测试
- **Newman**: 用于Postman集合自动化测试

### 测试示例

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

## API使用示例

### 使用Axios

```javascript
const axios = require('axios');

// 设置基础URL
const api = axios.create({
  baseURL: 'https://api.example.com/api/v1',
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

### 使用Fetch

```javascript
// 设置基础URL
const baseURL = 'https://api.example.com/api/v1';

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

// 获取用户信息
async function getUserInfo(userId, token) {
  try {
    const response = await fetch(`${baseURL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}
```

## 性能优化

### 请求优化
- 减少请求次数
- 使用批量请求
- 合理使用缓存
- 压缩请求数据

### 响应优化
- 只返回必要数据
- 压缩响应数据
- 使用适当的数据格式
- 优化数据库查询

### 并发控制
- 限制请求频率
- 使用队列处理高并发
- 实现熔断机制
- 使用负载均衡

## 安全措施

### 认证与授权
- 使用JWT进行认证
- 基于角色的访问控制
- 定期更换密钥
- 限制令牌有效期

### 数据安全
- 加密敏感数据
- 使用HTTPS
- 防止SQL注入
- 防止XSS攻击
- 防止CSRF攻击

### 访问控制
- IP白名单
- 限制请求频率
- 防止DDoS攻击
- 监控异常访问

## 监控与日志

### 监控指标
- 请求量
- 响应时间
- 错误率
- 成功率
- 并发数

### 日志记录
- 请求日志
- 响应日志
- 错误日志
- 性能日志

### 日志格式

```json
{
  "timestamp": "2025-12-01T00:00:00.000Z",
  "requestId": "uuid",
  "method": "GET",
  "url": "/api/v1/users/1",
  "statusCode": 200,
  "responseTime": 100,
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0",
  "userId": 1
}
```

## 变更管理

### 变更流程
1. 提出API变更需求
2. 设计API变更方案
3. 编写API文档
4. 实现API变更
5. 测试API变更
6. 发布API变更
7. 更新API文档
8. 通知相关方

### 变更类型
- **新增API**: 添加新的API端点
- **修改API**: 修改现有API的行为
- **废弃API**: 标记API为废弃
- **删除API**: 移除不再使用的API

## 最佳实践

1. **使用RESTful设计原则**
2. **保持API简洁易用**
3. **提供完整的文档**
4. **实现适当的认证和授权**
5. **处理错误和异常**
6. **支持版本管理**
7. **优化性能**
8. **确保安全性**
9. **测试API**
10. **监控和日志**

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.0 | 2025-12-26 | 初始版本 | Sut |