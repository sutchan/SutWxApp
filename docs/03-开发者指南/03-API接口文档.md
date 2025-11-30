# API接口文档

<!--
文件名: 03-API接口文档.md
版本号: 1.0.0
更新日期: 2025-11-30
作者: Sut
描述: API接口规范和使用方法
-->

## 目录

[TOC]

## 1. 概述

### 1.1 文档目的

本文档旨在介绍SutWxApp项目的API接口规范和使用方法，帮助开发者正确调用API接口。

### 1.2 API设计原则

- RESTful设计：遵循RESTful API设计规范
- 统一接口：所有API接口使用统一的格式和规范
- 版本控制：支持API版本控制，便于升级和兼容
- 安全性：确保API接口的安全性
- 可读性：API接口名称清晰，易于理解和使用
- 可测试性：API接口易于测试和调试

## 2. API基础信息

### 2.1 接口地址

- 开发环境：http://localhost:3000/api/v1
- 测试环境：https://test-api.sutwxapp.com/api/v1
- 生产环境：https://api.sutwxapp.com/api/v1

### 2.2 版本控制

API使用URL路径进行版本控制，例如：

```
/api/v1/users
/api/v2/users
```

### 2.3 请求方式

支持以下HTTP请求方式：

- GET：获取资源
- POST：创建资源
- PUT：更新资源
- DELETE：删除资源
- PATCH：部分更新资源

### 2.4 数据格式

- 请求数据格式：JSON
- 响应数据格式：JSON

### 2.5 认证方式

- 使用JWT认证，在请求头中添加Authorization字段：
  ```
  Authorization: Bearer <token>
  ```

## 3. 响应格式

### 3.1 成功响应

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

### 3.2 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null,
  "timestamp": 1638316800000
}
```

### 3.3 错误码说明

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 方法未实现 |
| 502 | 网关错误 |
| 503 | 服务不可用 |
| 504 | 网关超时 |

## 4. 接口列表

### 4.1 用户服务API

#### 4.1.1 用户注册

**接口地址**：`/api/v1/users/register`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| email | string | 是 | 邮箱 |
| phone | string | 否 | 手机号 |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "phone": "13800138000",
    "created_at": "2025-11-30T15:00:00.000Z",
    "updated_at": "2025-11-30T15:00:00.000Z"
  },
  "timestamp": 1638316800000
}
```

#### 4.1.2 用户登录

**接口地址**：`/api/v1/users/login`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "test",
      "email": "test@example.com",
      "phone": "13800138000"
    }
  },
  "timestamp": 1638316800000
}
```

#### 4.1.3 获取用户信息

**接口地址**：`/api/v1/users/me`

**请求方式**：GET

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer <token> |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "phone": "13800138000",
    "created_at": "2025-11-30T15:00:00.000Z",
    "updated_at": "2025-11-30T15:00:00.000Z"
  },
  "timestamp": 1638316800000
}
```

### 4.2 商品服务API

#### 4.2.1 获取商品列表

**接口地址**：`/api/v1/products`

**请求方式**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| page | number | 否 | 页码，默认1 |
| page_size | number | 否 | 每页数量，默认10 |
| category_id | number | 否 | 分类ID |
| keyword | string | 否 | 搜索关键词 |
| sort | string | 否 | 排序字段，默认created_at |
| order | string | 否 | 排序方式，asc或desc，默认desc |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10,
    "items": [
      {
        "id": 1,
        "name": "商品名称",
        "description": "商品描述",
        "price": 99.99,
        "stock": 100,
        "category_id": 1,
        "created_at": "2025-11-30T15:00:00.000Z",
        "updated_at": "2025-11-30T15:00:00.000Z"
      }
    ]
  },
  "timestamp": 1638316800000
}
```

#### 4.2.2 获取商品详情

**接口地址**：`/api/v1/products/:id`

**请求方式**：GET

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| id | number | 是 | 商品ID |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "商品名称",
    "description": "商品描述",
    "price": 99.99,
    "stock": 100,
    "category_id": 1,
    "images": [
      "https://example.com/images/product1.jpg"
    ],
    "created_at": "2025-11-30T15:00:00.000Z",
    "updated_at": "2025-11-30T15:00:00.000Z"
  },
  "timestamp": 1638316800000
}
```

### 4.3 订单服务API

#### 4.3.1 创建订单

**接口地址**：`/api/v1/orders`

**请求方式**：POST

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer <token> |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| products | array | 是 | 商品列表 |
| shipping_address_id | number | 是 | 收货地址ID |
| payment_method | string | 是 | 支付方式 |

**请求示例**：

```json
{
  "products": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address_id": 1,
  "payment_method": "wechat"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "order_no": "20251130150000001",
    "user_id": 1,
    "total_amount": 199.98,
    "status": "pending",
    "payment_method": "wechat",
    "shipping_address_id": 1,
    "products": [
      {
        "product_id": 1,
        "name": "商品名称",
        "price": 99.99,
        "quantity": 2
      }
    ],
    "created_at": "2025-11-30T15:00:00.000Z",
    "updated_at": "2025-11-30T15:00:00.000Z"
  },
  "timestamp": 1638316800000
}
```

#### 4.3.2 获取订单列表

**接口地址**：`/api/v1/orders`

**请求方式**：GET

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| Authorization | string | 是 | Bearer <token> |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| page | number | 否 | 页码，默认1 |
| page_size | number | 否 | 每页数量，默认10 |
| status | string | 否 | 订单状态 |

**响应示例**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "page_size": 10,
    "total_pages": 1,
    "items": [
      {
        "id": 1,
        "order_no": "20251130150000001",
        "total_amount": 199.98,
        "status": "pending",
        "payment_method": "wechat",
        "created_at": "2025-11-30T15:00:00.000Z",
        "updated_at": "2025-11-30T15:00:00.000Z"
      }
    ]
  },
  "timestamp": 1638316800000
}
```

## 5. API调用示例

### 5.1 使用Axios调用API

```javascript
// 安装axios
// npm install axios

const axios = require('axios');

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response.data;
  },
  error => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

// 调用API示例
async function login() {
  try {
    const response = await apiClient.post('/users/login', {
      username: 'test',
      password: 'password'
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

login();
```

### 5.2 使用curl调用API

```bash
# 用户登录
curl -X POST \
  http://localhost:3000/api/v1/users/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "test", "password": "password"}'

# 获取用户信息
curl -X GET \
  http://localhost:3000/api/v1/users/me \
  -H 'Authorization: Bearer <token>'
```

## 6. 相关链接

- [API开发指南.md](./04-API开发指南.md)
- [服务层API文档.md](./05-服务层API文档.md)
