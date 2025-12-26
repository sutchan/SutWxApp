# API规范

## 目的
本规范定义了苏铁微信小程序（SutWxApp）项目的API设计和使用，包括API架构、设计原则、认证机制、核心接口、错误处理和版本管理。

## 要求

### 要求：RESTful API设计
系统应对所有端点实现RESTful API设计原则。

#### 场景：RESTful端点结构
- **当**开发人员设计API端点时
- **则**他们应使用小写字母加连字符作为路径段（例如：`/api/v1/user-info`）

#### 场景：HTTP方法使用
- **当**实现CRUD操作时
- **则**开发人员应使用适当的HTTP方法：GET（读取）、POST（创建）、PUT（更新）、DELETE（删除）、PATCH（部分更新）

### 要求：API架构
系统应具有分层API架构，客户端、API层、服务层和数据层之间有明确的分离。

#### 场景：API调用流程
- **当**客户端发送请求时
- **则**请求应流经API层 → 服务层 → 数据访问层 → 数据存储，并返回

#### 场景：API技术栈
- **当**实现API层时
- **则**开发人员应使用JavaScript和Express.js框架
- **并**使用MySQL/MongoDB进行数据存储
- **并**实现JWT进行认证
- **并**使用Swagger/OpenAPI进行文档编制

### 要求：请求格式
系统应支持一致的请求格式，包括URL参数、查询参数和JSON请求体。

#### 场景：URL参数
- **当**标识特定资源时
- **则**开发人员应使用URL参数（例如：`/api/v1/users/{id}`）

#### 场景：查询参数
- **当**过滤、排序或分页结果时
- **则**开发人员应使用查询参数（例如：`/api/v1/users?page=1&pageSize=10`）

#### 场景：JSON请求体
- **当**创建或更新资源时
- **则**系统应接受JSON格式的请求体

### 要求：响应格式
系统应为所有API端点返回一致的JSON响应格式。

#### 场景：成功响应
- **当**API请求成功时
- **则**系统应返回包含`code`、`message`、`data`、`timestamp`和`requestId`字段的响应

#### 场景：错误响应
- **当**API请求失败时
- **则**系统应返回包含`code`、`message`、`data`、`timestamp`、`requestId`和可选`errors`字段的响应

### 要求：认证和授权
系统应实现JWT认证和基于角色的访问控制（RBAC）。

#### 场景：JWT认证
- **当**访问受保护资源时
- **则**客户端应在Authorization头中提供有效的JWT令牌

#### 场景：基于角色的授权
- **当**验证访问权限时
- **则**系统应检查用户角色（普通用户、管理员）是否符合所需权限

### 要求：核心API端点
系统应为用户、产品、订单和通知实现核心API端点。

#### 场景：用户管理
- **当**用户注册、登录或管理其账户时
- **则**系统应提供用户注册、登录、个人资料管理等端点

#### 场景：产品管理
- **当**用户浏览或搜索产品时
- **则**系统应提供产品列表、详情查看等端点

#### 场景：订单管理
- **当**用户创建或跟踪订单时
- **则**系统应提供订单创建、列表和状态跟踪等端点

#### 场景：通知管理
- **当**用户管理通知时
- **则**系统应提供通知列表和状态更新等端点

### 要求：错误处理
系统应实现一致的错误处理，包括适当的状态码和错误消息。

#### 场景：参数验证
- **当**客户端发送无效参数时
- **则**系统应返回400 Bad Request，并附带详细的错误消息

#### 场景：认证失败
- **当**客户端提供无效或缺失的认证信息时
- **则**系统应返回401 Unauthorized

#### 场景：授权失败
- **当**客户端尝试访问未授权资源时
- **则**系统应返回403 Forbidden

#### 场景：资源未找到
- **当**客户端请求不存在的资源时
- **则**系统应返回404 Not Found

#### 场景：服务器错误
- **当**服务器发生意外错误时
- **则**系统应返回500 Internal Server Error

### 要求：API测试
系统应支持使用手动和自动化方法进行API测试。

#### 场景：手动测试
- **当**开发人员手动测试API时
- **则**他们应使用Postman或Swagger UI等工具

#### 场景：自动化测试
- **当**实现自动化测试时
- **则**开发人员应使用Jest和Supertest框架

### 要求：API版本管理
系统应使用URL路径和语义化版本控制实现API版本管理。

#### 场景：版本化端点
- **当**访问API时
- **则**客户端应使用版本化端点（例如：`/api/v1/users`）

#### 场景：版本升级策略
- **当**升级API时
- **则**开发人员应遵循语义化版本控制：MAJOR（破坏性更改）、MINOR（新功能）、PATCH（错误修复）

## API设计原则

1. **RESTful设计**：遵循RESTful API设计规范
2. **简洁性**：易于理解和使用
3. **高可用性**：容错且可靠
4. **安全性**：防止常见漏洞
5. **可扩展性**：易于扩展以满足未来需求
6. **一致性**：所有端点具有一致的命名和响应格式
7. **文档化**：为开发人员提供全面的API文档

## API设计规范

### 要求：命名约定
系统应对API路径、HTTP方法、参数和响应字段遵循一致的命名约定。

#### 场景：API路径命名
- **当**设计API路径时
- **则**应使用小写字母加连字符作为路径段（例如：`/api/v1/user-info`）

#### 场景：HTTP方法使用
- **当**实现CRUD操作时
- **则**应使用HTTP方法使用表中定义的适当HTTP方法

#### 场景：参数命名
- **当**定义参数时
- **则**应使用camelCase命名参数

#### 场景：响应字段命名
- **当**定义响应字段时
- **则**应使用camelCase命名响应字段

### HTTP方法使用表

| HTTP方法 | 用途 | 示例 |
|----------|------|------|
| GET | 获取资源 | GET /api/v1/users |
| POST | 创建资源 | POST /api/v1/users |
| PUT | 更新资源 | PUT /api/v1/users/{id} |
| DELETE | 删除资源 | DELETE /api/v1/users/{id} |
| PATCH | 部分更新资源 | PATCH /api/v1/users/{id} |

### 状态码使用表

| 状态码 | 含义 | 示例 |
|--------|------|------|
| 200 | OK - 请求成功 | GET /api/v1/users |
| 201 | Created - 资源已创建 | POST /api/v1/users |
| 204 | No Content - 请求成功，无响应体 | DELETE /api/v1/users/{id} |
| 400 | Bad Request - 参数无效 | POST /api/v1/users（缺少必填字段） |
| 401 | Unauthorized - 缺失或无效的认证 | GET /api/v1/users（无令牌） |
| 403 | Forbidden - 权限不足 | GET /api/v1/admin（普通用户） |
| 404 | Not Found - 资源未找到 | GET /api/v1/users/999 |
| 500 | Internal Server Error - 服务器错误 | 任何服务器异常的API |

## 认证

### JWT认证
客户端必须在Authorization头中包含有效的JWT令牌：
```
Authorization: Bearer {token}
```

### 基于角色的访问控制
- **普通用户**：访问公共资源和自己的私人资源
- **管理员**：访问所有资源

## 核心API端点

### 用户API

#### 注册用户
- **URL**：`POST /api/v1/users/register`
- **描述**：注册新用户账户
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

#### 用户登录
- **URL**：`POST /api/v1/users/login`
- **描述**：认证用户并返回JWT令牌
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

#### 获取用户信息
- **URL**：`GET /api/v1/users/{id}`
- **描述**：通过ID获取用户信息
- **认证**：必需
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

#### 更新用户信息
- **URL**：`PUT /api/v1/users/{id}`
- **描述**：更新用户信息
- **认证**：必需
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

#### 删除用户
- **URL**：`DELETE /api/v1/users/{id}`
- **描述**：删除用户账户
- **认证**：必需
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

### 产品API

#### 获取产品列表
- **URL**：`GET /api/v1/products`
- **描述**：获取产品列表，支持分页和过滤
- **查询参数**：
  - `page`：页码，默认为1
  - `pageSize`：每页数量，默认为10
  - `categoryId`：用于过滤的分类ID
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

#### 获取产品详情
- **URL**：`GET /api/v1/products/{id}`
- **描述**：获取产品详细信息
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

### 订单API

#### 创建订单
- **URL**：`POST /api/v1/orders`
- **描述**：创建新订单
- **认证**：必需
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

#### 获取订单列表
- **URL**：`GET /api/v1/orders`
- **描述**：获取认证用户的订单列表
- **认证**：必需
- **查询参数**：
  - `page`：页码，默认为1
  - `pageSize`：每页数量，默认为10
  - `status`：用于过滤的订单状态
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

### 通知API

#### 获取通知列表
- **URL**：`GET /api/v1/notifications`
- **描述**：获取认证用户的通知列表
- **认证**：必需
- **查询参数**：
  - `type`：通知类型（all/system/order/promotion/activity）
  - `status`：通知状态（all/read/unread）
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

#### 标记通知为已读
- **URL**：`PUT /api/v1/notifications/{id}/read`
- **描述**：将通知标记为已读
- **认证**：必需
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

## API测试

### 手动测试工具
- **Postman**：用于交互式API测试
- **Swagger UI**：用于API文档和测试

### 自动化测试
- **Jest**：用于单元测试和集成测试
- **Supertest**：用于HTTP API测试

### 自动化测试示例
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

## API调用示例

### 使用Axios
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
```

### 使用Fetch
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

## 版本管理

### 版本格式
- **语义化版本控制**：MAJOR.MINOR.PATCH（例如：v1.0.0）

### 版本控制
- **URL路径版本控制**：`/api/v{version}/resources`

### 升级策略
- **MAJOR**：破坏性更改，与以前版本不兼容
- **MINOR**：新功能，向后兼容
- **PATCH**：错误修复，向后兼容

## 错误处理

### 错误类型
- **参数错误**：无效的请求参数
- **认证错误**：缺失或无效的认证
- **授权错误**：权限不足
- **资源未找到**：请求的资源不存在
- **服务器内部错误**：意外的服务器错误

### 错误响应格式
所有API错误都遵循标准的错误响应格式，详细的错误信息在`errors`数组中。