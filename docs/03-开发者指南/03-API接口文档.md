<!--
文件名: 03-API接口文档.md
版本号: 1.0.1
更新日期: 2025-11-24
作者: Sut
描述: API接口文档，详细说明小程序与后端服务的接口规范、参数定义和返回格式
-->
# API 接口文档

**版本号：1.0.1**
*最后更新时间：2025-11-24*

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
    | `birthday` | `string` | 否   | 生日 (格式：YYYY-MM-DD) |
    | `signature`| `string` | 否   | 个性签名   |

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

#### 4.1.4 修改头像

*   **接口地址**：`/user/avatar`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：修改用户头像
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `avatarUrl`| `string` | 是   | 头像URL（通常是上传到云存储后的URL） |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "avatarUrl": "https://example.com/new-avatar.png"
      }
    }
    ```

#### 4.1.5 绑定手机号

*   **接口地址**：`/user/bind-phone`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：绑定用户手机号
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `code`    | `string` | 是   | 微信获取手机号的code |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "phone": "13800138000"
      }
    }
    ```

#### 4.1.6 绑定邮箱

*   **接口地址**：`/user/bind-email`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：绑定用户邮箱
*   **请求参数**：

    | 参数名        | 类型   | 必填 | 说明       |
    | :------------ | :----- | :--- | :--------- |
    | `email`       | `string` | 是   | 邮箱地址   |
    | `verifyCode`  | `string` | 是   | 验证码     |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "email": "user@example.com"
      }
    }
    ```

#### 4.1.7 发送邮箱验证码

*   **接口地址**：`/user/send-email-code`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：发送邮箱验证码
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `email`   | `string` | 是   | 邮箱地址   |
    | `type`    | `string` | 是   | 验证码类型：bind-绑定邮箱，reset-重置密码 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "验证码已发送",
      "data": {
        "expireAt": "2023-11-01 16:00:00"
      }
    }
    ```

#### 4.1.8 获取用户统计信息

*   **接口地址**：`/user/stats`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取用户统计信息
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "stats": {
          "orderCount": 10,
          "favoriteCount": 5,
          "addressCount": 2,
          "couponCount": 3,
          "points": 1500,
          "level": 2,
          "experience": 1500,
          "nextLevelExp": 2000,
          "unreadMessageCount": 3
        }
      }
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

### 4.6 优惠券模块

#### 4.6.1 获取可用优惠券列表

*   **接口地址**：`/coupons/available`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取用户可用的优惠券列表
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `productId` | `string` | 否   | 商品ID（用于获取适用于特定商品的优惠券） |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "coupons": [
          {
            "_id": "string",
            "name": "满100减10优惠券",
            "type": 0,
            "value": 10,
            "minOrderAmount": 100,
            "maxDiscount": 0,
            "startAt": "string",
            "endAt": "string",
            "status": 0,
            "applicableProducts": []
          }
        ]
      }
    }
    ```

#### 4.6.2 获取优惠券详情

*   **接口地址**：`/coupons/:id`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取优惠券详情
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `id`      | `string` | 是   | 优惠券ID   |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "coupon": {
          "_id": "string",
          "name": "满100减10优惠券",
          "type": 0,
          "value": 10,
          "minOrderAmount": 100,
          "maxDiscount": 0,
          "startAt": "string",
          "endAt": "string",
          "status": 0,
          "applicableProducts": [],
          "applicableCategories": [],
          "usageRules": "string",
          "receivedAt": "string",
          "usedAt": "string",
          "orderId": "string"
        }
      }
    }
    ```

#### 4.6.3 领取优惠券

*   **接口地址**：`/coupons/:id/receive`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：领取优惠券
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `id`      | `string` | 是   | 优惠券ID   |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "coupon": {
          "_id": "string",
          "name": "满100减10优惠券",
          "type": 0,
          "value": 10,
          "minOrderAmount": 100
        }
      }
    }
    ```

#### 4.6.4 获取优惠券活动列表

*   **接口地址**：`/coupon-activities`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取优惠券活动列表
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "activities": [
          {
            "_id": "string",
            "name": "新用户优惠券活动",
            "description": "string",
            "startAt": "string",
            "endAt": "string",
            "coupons": [
              {
                "_id": "string",
                "name": "新人立减券",
                "type": 0,
                "value": 20,
                "minOrderAmount": 0
              }
            ],
            "status": 1,
            "received": false
          }
        ]
      }
    }
    ```

### 4.7 收藏模块

#### 4.7.1 获取收藏列表

*   **接口地址**：`/favorites`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取用户收藏列表
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `page`    | `number` | 否   | 页码，默认为1 |
    | `pageSize` | `number` | 否   | 每页数量，默认为20 |
    | `type`    | `string` | 否   | 收藏类型（product-商品） |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "favorites": [
          {
            "_id": "string",
            "type": "product",
            "targetId": "string",
            "product": {
              "_id": "string",
              "name": "商品名称",
              "coverImage": "string",
              "price": 0,
              "originalPrice": 0,
              "stock": 0
            },
            "createdAt": "string"
          }
        ]
      },
      "meta": {
        "total": 100,
        "page": 1,
        "pageSize": 20,
        "totalPages": 5
      }
    }
    ```

#### 4.7.2 收藏商品

*   **接口地址**：`/favorites`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：收藏商品
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 是   | 收藏类型（product-商品） |
    | `targetId` | `string` | 是   | 收藏目标ID |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "favorite": {
          "_id": "string",
          "type": "product",
          "targetId": "string",
          "createdAt": "string"
        }
      }
    }
    ```

#### 4.7.3 取消收藏

*   **接口地址**：`/favorites/:id`
*   **请求方法**：`DELETE`
*   **是否需要认证**：是
*   **功能描述**：取消收藏
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `id`      | `string` | 是   | 收藏记录ID |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success"
    }
    ```

#### 4.7.4 批量取消收藏

*   **接口地址**：`/favorites/batch-delete`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：批量取消收藏
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `ids`     | `array` | 是   | 收藏记录ID数组 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "deletedCount": 2
      }
    }
    ```

#### 4.7.5 检查是否已收藏

*   **接口地址**：`/favorites/check`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：检查是否已收藏指定商品
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 是   | 收藏类型 |
    | `targetId` | `string` | 是   | 收藏目标ID |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "isFavorite": true,
        "favoriteId": "string"
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

#### 4.6.3 完成积分任务

*   **接口地址**：`/points/task/complete`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：完成积分任务，获取相应积分
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `taskId`  | `string` | 是   | 任务ID     |

*   **请求示例**：

    ```json
    {
      "taskId": "task001"
    }
    ```

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "taskId": "task001",
        "taskName": "每日签到",
        "earnedPoints": 10,
        "totalPoints": 1510,
        "completedTimes": 6,
        "maxTimes": 7
      }
    }
    ```

#### 4.6.4 获取积分明细

*   **接口地址**：`/points/history`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取用户积分获取和消费明细
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 否   | 明细类型 (all, earn, consume) |
    | `page`    | `number` | 否   | 页码，默认为1 |
    | `pageSize`| `number` | 否   | 每页数量，默认为20 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 50,
        "page": 1,
        "pageSize": 20,
        "list": [
          {
            "id": "p001",
            "type": "earn",
            "points": 10,
            "description": "每日签到",
            "createTime": "2023-11-01 09:00:00",
            "balance": 1510
          },
          {
            "id": "p002",
            "type": "consume",
            "points": -50,
            "description": "积分兑换商品",
            "createTime": "2023-10-30 15:30:00",
            "balance": 1500
          }
        ]
      }
    }
    ```

#### 4.6.5 积分兑换商品

*   **接口地址**：`/points/exchange`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：使用积分兑换商品或优惠券
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `goodsId` | `string` | 是   | 兑换商品ID |
    | `quantity`| `number` | 否   | 兑换数量，默认为1 |

*   **请求示例**：

    ```json
    {
      "goodsId": "pg001",
      "quantity": 1
    }
    ```

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "exchangeId": "e001",
        "goodsId": "pg001",
        "goodsName": "10元优惠券",
        "pointsUsed": 100,
        "quantity": 1,
        "totalPoints": 1410
      }
    }
    ```

#### 4.6.6 获取积分商城商品列表

*   **接口地址**：`/points/goods`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取积分商城可兑换商品列表
*   **请求参数**：

    | 参数名    | 类型   | 必填 | 说明       |
    | :-------- | :----- | :--- | :--------- |
    | `categoryId`| `string` | 否   | 分类ID     |
    | `page`    | `number` | 否   | 页码，默认为1 |
    | `pageSize`| `number` | 否   | 每页数量，默认为10 |

*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 20,
        "page": 1,
        "pageSize": 10,
        "list": [
          {
            "goodsId": "pg001",
            "goodsName": "10元优惠券",
            "description": "满50元可用，有效期30天",
            "points": 100,
            "stock": 500,
            "image": "https://example.com/goods/pg001.jpg",
            "category": "优惠券"
          },
          {
            "goodsId": "pg002",
            "goodsName": "精美水杯",
            "description": "不锈钢材质，350ml容量",
            "points": 500,
            "stock": 100,
            "image": "https://example.com/goods/pg002.jpg",
            "category": "实物商品"
          }
        ]
      }
    }
    ```

#### 4.6.7 签到获取积分

*   **接口地址**：`/points/signin`
*   **请求方法**：`POST`
*   **是否需要认证**：是
*   **功能描述**：每日签到获取积分
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "earnedPoints": 10,
        "totalPoints": 1520,
        "continuousDays": 5,
        "isTodaySigned": true,
        "nextDayBonus": 15
      }
    }
    ```

#### 4.6.8 获取签到状态

*   **接口地址**：`/points/signin/status`
*   **请求方法**：`GET`
*   **是否需要认证**：是
*   **功能描述**：获取用户签到状态和连续签到信息
*   **请求参数**：无
*   **响应示例**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "isTodaySigned": true,
        "continuousDays": 5,
        "totalSignedDays": 30,
        "monthSignedDays": 15,
        "calendar": [
          {
            "date": "2023-11-01",
            "signed": true,
            "points": 10
          },
          {
            "date": "2023-11-02",
            "signed": false,
            "points": 0
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

**版本号：1.0.0**
*最后更新时间：2025-11-24*