# API 接口文档

**版本号：1.0.16**
*最后更新时间：2024年11月1日*

## 1. 概述

本文档旨在提供 SutWxApp 微信小程序后端 API 接口的详细说明，包括接口地址、请求方法、参数、响应示例以及错误码等信息。开发者可以根据本文档进行前端开发和后端接口联调。

### 1.1 文档目的

- 提供完整的API接口说明
- 指导前端开发人员进行接口调用
- 便于后端开发人员维护和更新接口
- 确保前后端开发协作的顺利进行

### 1.2 适用范围

本文档适用于SutWxApp微信小程序项目的所有API接口，包括用户模块、商品模块、订单模块、支付模块等。

## 2. 认证与授权

所有需要用户身份的 API 接口都采用 Bearer Token 进行认证。前端在发起请求时，需要在请求头中携带 `Authorization` 字段，格式为 `Bearer <Your_Token>`。

Token 的获取和刷新机制请参考 [架构设计文档 - 身份认证](#/docs/03-开发者指南/02-架构设计文档.md#身份认证)。

### 2.1 认证流程

1. 用户登录获取Token
2. 前端存储Token（建议使用wx.setStorageSync）
3. 每次请求携带Token
4. Token过期时自动刷新
5. 刷新失败则引导用户重新登录

### 2.2 Token使用示例

```javascript
// API请求示例
wx.request({
  url: 'https://api.example.com/wxapp/v1/user/info',
  method: 'GET',
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + wx.getStorageSync('token')
  },
  success: function(res) {
    // 处理响应数据
  },
  fail: function(err) {
    // 处理请求失败
  }
});
```

## 3. 基础信息

*   **API 基础 URL**：`https://api.example.com/wxapp/v1` (示例，请替换为实际后端地址)
*   **请求方法**：GET, POST, PUT, DELETE
*   **请求头**：
    *   `Content-Type`: `application/json` (POST/PUT 请求)
    *   `Authorization`: `Bearer <Your_Token>` (需要认证的接口)
*   **数据格式**：JSON
*   **字符编码**：UTF-8

## 4. 接口列表

### 4.1 用户模块

#### 4.1.1 获取用户信息

*   **接口地址**：`/user/info`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取当前登录用户的详细信息
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "userId": "12345",
        "openid": "ox1234567890abcdef",
        "nickname": "Sut",
        "avatarUrl": "https://example.com/avatar.png",
        "gender": 1,
        "city": "Guangzhou",
        "province": "Guangdong",
        "country": "China",
        "language": "zh_CN",
        "phoneNumber": "138****5678",
        "registerTime": "2023-01-01 10:00:00",
        "lastLoginTime": "2023-11-01 15:30:00",
        "userLevel": "VIP",
        "points": 1500
      }
    }
    ```

#### 4.1.2 更新用户信息

*   **接口地址**：`/user/update`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：更新当前登录用户的信息
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `nickname` | `string` | 否   | 用户昵称   |
    | `avatarUrl`| `string` | 否   | 头像 URL   |
    | `gender`   | `number` | 否   | 性别 (0:未知, 1:男, 2:女) |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": null
    }
    ```

#### 4.1.3 获取用户收货地址列表

*   **接口地址**：`/user/address/list`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取当前用户的收货地址列表
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": [
        {
          "addressId": "addr001",
          "receiverName": "张三",
          "phoneNumber": "13800138000",
          "province": "广东省",
          "city": "广州市",
          "district": "天河区",
          "detailAddress": "天河路123号",
          "isDefault": true
        },
        {
          "addressId": "addr002",
          "receiverName": "李四",
          "phoneNumber": "13900139000",
          "province": "广东省",
          "city": "深圳市",
          "district": "南山区",
          "detailAddress": "科技园路456号",
          "isDefault": false
        }
      ]
    }
    ```

### 4.2 商品模块

#### 4.2.1 获取商品列表

*   **接口地址**：`/product/list`
*   **请求方法**：`GET`
*   **是否需要认证**：否
*   **功能描述**：获取商品列表，支持分页和筛选
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `categoryId`| `string` | 否   | 分类ID     |
    | `keyword`  | `string` | 否   | 搜索关键词 |
    | `sortType` | `string` | 否   | 排序类型 (price_asc, price_desc, sales_desc, newest) |
    | `page`     | `number` | 否   | 页码，默认为1 |
    | `pageSize` | `number` | 否   | 每页数量，默认为10 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 100,
        "page": 1,
        "pageSize": 10,
        "list": [
          {
            "productId": "p001",
            "productName": "商品A",
            "categoryId": "c001",
            "categoryName": "数码产品",
            "price": 199.00,
            "originalPrice": 299.00,
            "stock": 50,
            "sales": 120,
            "mainImage": "https://example.com/product/p001.jpg",
            "tags": ["热销", "新品"]
          },
          {
            "productId": "p002",
            "productName": "商品B",
            "categoryId": "c002",
            "categoryName": "生活用品",
            "price": 99.00,
            "originalPrice": 149.00,
            "stock": 30,
            "sales": 80,
            "mainImage": "https://example.com/product/p002.jpg",
            "tags": ["特价"]
          }
        ]
      }
    }
    ```

#### 4.2.2 获取商品详情

*   **接口地址**：`/product/detail/:productId`
*   **请求方法**：`GET`
*   **是否需要认证**：否
*   **功能描述**：获取指定商品的详细信息
*   **请求参数**：

    | 参数名      | 类型   | 必填 | 说明       |
    | :---------- | :----- | :--- | :--------- |
    | `productId` | `string` | 是   | 商品ID     |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "productId": "p001",
        "productName": "商品A",
        "categoryId": "c001",
        "categoryName": "数码产品",
        "price": 199.00,
        "originalPrice": 299.00,
        "stock": 50,
        "sales": 120,
        "description": "<p>商品详细描述...</p>",
        "images": [
          "https://example.com/product/p001_1.jpg",
          "https://example.com/product/p001_2.jpg",
          "https://example.com/product/p001_3.jpg"
        ],
        "specifications": [
          {
            "specId": "spec001",
            "specName": "颜色",
            "options": [
              {"optionId": "opt001", "optionName": "红色", "price": 0},
              {"optionId": "opt002", "optionName": "蓝色", "price": 10}
            ]
          },
          {
            "specId": "spec002",
            "specName": "尺寸",
            "options": [
              {"optionId": "opt003", "optionName": "S", "price": 0},
              {"optionId": "opt004", "optionName": "M", "price": 5}
            ]
          }
        ],
        "tags": ["热销", "新品"],
        "createTime": "2023-10-01 10:00:00",
        "updateTime": "2023-10-15 15:30:00"
      }
    }
    ```

### 4.3 购物车模块

#### 4.3.1 获取购物车列表

*   **接口地址**：`/cart/list`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取当前用户的购物车商品列表
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": [
        {
          "cartItemId": "ci001",
          "productId": "p001",
          "productName": "商品A",
          "mainImage": "https://example.com/product/p001.jpg",
          "price": 199.00,
          "quantity": 2,
          "selected": true,
          "stock": 50,
          "specifications": [
            {"specName": "颜色", "optionName": "红色"},
            {"specName": "尺寸", "optionName": "M"}
          ]
        },
        {
          "cartItemId": "ci002",
          "productId": "p002",
          "productName": "商品B",
          "mainImage": "https://example.com/product/p002.jpg",
          "price": 99.00,
          "quantity": 1,
          "selected": false,
          "stock": 30,
          "specifications": [
            {"specName": "颜色", "optionName": "蓝色"},
            {"specName": "尺寸", "optionName": "L"}
          ]
        }
      ],
      "totalAmount": 497.00,
      "selectedAmount": 398.00
    }
    ```

#### 4.3.2 添加商品到购物车

*   **接口地址**：`/cart/add`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：将商品添加到购物车
*   **请求参数**：

    | 参数名        | 类型   | 必填 | 说明       |
    | :------------ | :----- | :--- | :--------- |
    | `productId`   | `string` | 是   | 商品ID     |
    | `quantity`    | `number` | 是   | 商品数量   |
    | `specifications`| `array` | 否   | 商品规格   |

*   **请求示例**：

    ```json
    {
      "productId": "p001",
      "quantity": 2,
      "specifications": [
        {"specName": "颜色", "optionName": "红色"},
        {"specName": "尺寸", "optionName": "M"}
      ]
    }
    ```

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "cartItemId": "ci001"
      }
    }
    ```

### 4.4 订单模块

#### 4.4.1 创建订单

*   **接口地址**：`/order/create`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：创建新订单
*   **请求参数**：

    | 参数名        | 类型   | 必填 | 说明       |
    | :------------ | :----- | :--- | :--------- |
    | `addressId`   | `string` | 是   | 收货地址ID |
    | `cartItemIds` | `array` | 是   | 购物车商品ID列表 |
    | `remark`      | `string` | 否   | 订单备注   |

*   **请求示例**：

    ```json
    {
      "addressId": "addr001",
      "cartItemIds": ["ci001", "ci002"],
      "remark": "请在工作日配送"
    }
    ```

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "orderId": "o001",
        "orderSn": "20231101123456",
        "totalAmount": 497.00,
        "payAmount": 497.00
      }
    }
    ```

#### 4.4.2 获取订单列表

*   **接口地址**：`/order/list`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取当前用户的订单列表
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `status`   | `string` | 否   | 订单状态 (all, pending, paid, shipped, completed, cancelled) |
    | `page`     | `number` | 否   | 页码，默认为1 |
    | `pageSize` | `number` | 否   | 每页数量，默认为10 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 50,
        "page": 1,
        "pageSize": 10,
        "list": [
          {
            "orderId": "o001",
            "orderSn": "20231101123456",
            "totalAmount": 497.00,
            "status": "pending",
            "statusText": "待支付",
            "createTime": "2023-11-01 10:00:00",
            "goodsList": [
              {
                "productId": "p001",
                "productName": "商品A",
                "mainImage": "https://example.com/product/p001.jpg",
                "price": 199.00,
                "quantity": 2
              }
            ]
          }
        ]
      }
    }
    ```

### 4.5 支付模块

#### 4.5.1 创建支付订单

*   **接口地址**：`/pay/create`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：为指定订单创建支付
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `orderId` | `string` | 是   | 订单ID     |

*   **请求示例**：

    ```json
    {
      "orderId": "o001"
    }
    ```

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "payId": "pay001",
        "timeStamp": "1698792000",
        "nonceStr": "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
        "package": "prepay_id=wx201410272009395522657a690389285100",
        "signType": "RSA",
        "paySign": "oR9d8PuhnIc+YZ8cBHFCwA..."
      }
    }
    ```

### 4.6 积分模块

#### 4.6.1 获取用户积分

*   **接口地址**：`/points/balance`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取当前用户的积分余额
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "totalPoints": 1500,
        "availablePoints": 1200,
        "frozenPoints": 300
      }
    }
    ```

#### 4.6.2 获取积分任务列表

*   **接口地址**：`/points/tasks`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取积分任务列表
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 否   | 任务类型 (all, once, daily, weekly, monthly) |
    | `status`  | `string` | 否   | 任务状态 (all, pending, completed, unclaimed) |
    | `page`    | `number` | 否   | 页码，默认为1 |
    | `pageSize`| `number` | 否   | 每页数量，默认为20 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 10,
        "list": [
          {
            "taskId": "task001",
            "taskName": "每日签到",
            "taskDescription": "每日登录小程序即可获得积分",
            "taskType": "daily",
            "points": 10,
            "status": "completed",
            "completedTimes": 5,
            "maxTimes": 7
          },
          {
            "taskId": "task002",
            "taskName": "首次购买商品",
            "taskDescription": "首次购买任意商品即可获得积分",
            "taskType": "once",
            "points": 100,
            "status": "pending",
            "completedTimes": 0,
            "maxTimes": 1
          }
        ]
      }
    }
    ```

## 5. 错误码

| 错误码 | 说明         | 解决方案 |
| :----- | :----------- | :------- |
| `0`    | 成功         | -        |
| `10001`| 未认证       | 重新登录获取Token |
| `10002`| 参数错误     | 检查请求参数格式和必填项 |
| `10003`| 资源不存在   | 确认资源ID是否正确 |
| `10004`| 权限不足     | 联系管理员分配相应权限 |
| `10005`| Token已过期  | 刷新Token或重新登录 |
| `20001`| 商品库存不足 | 选择其他商品或等待补货 |
| `20002`| 订单已取消   | 重新创建订单 |
| `20003`| 支付失败     | 检查支付参数或重试 |
| `30001`| 购物车为空   | 添加商品到购物车 |
| `30002`| 收货地址不存在 | 添加或选择有效收货地址 |
| `99999`| 系统内部错误 | 联系技术支持 |

## 6. 接口调用最佳实践

### 6.1 错误处理

```javascript
// 统一错误处理示例
function apiRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.data.code === 10001 || res.data.code === 10005) {
          // Token失效，重新登录
          wx.removeStorageSync('token');
          wx.navigateTo({
            url: '/pages/login/login'
          });
          reject(new Error('登录已过期，请重新登录'));
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}
```

### 6.2 请求拦截

```javascript
// 请求拦截器示例
const requestInterceptor = (options) => {
  // 添加公共参数
  if (!options.data) {
    options.data = {};
  }
  
  // 添加Token
  const token = wx.getStorageSync('token');
  if (token) {
    options.header = options.header || {};
    options.header.Authorization = `Bearer ${token}`;
  }
  
  // 添加时间戳防止缓存
  options.data._t = Date.now();
  
  return options;
};
```

### 6.3 响应数据缓存

```javascript
// 响应数据缓存示例
function requestWithCache(options, cacheTime = 5 * 60 * 1000) {
  const cacheKey = JSON.stringify(options);
  const cachedData = wx.getStorageSync(cacheKey);
  
  if (cachedData && (Date.now() - cachedData.timestamp < cacheTime)) {
    return Promise.resolve(cachedData.data);
  }
  
  return apiRequest(options).then(data => {
    wx.setStorageSync(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  });
}
```

## 7. 总结

本文档提供了 SutWxApp 微信小程序后端 API 接口的详细说明。开发者应严格遵循接口规范进行开发，并注意错误处理和安全机制。如有疑问，请联系后端开发人员。

---

**版本号：1.0.16**
*最后更新时间：2024年11月1日*