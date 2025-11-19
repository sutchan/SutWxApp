# SutWxApp 购物功能API文档

## 1. 接口概述

本文档详细描述了SutWxApp微信小程序中购物功能相关的API接口，包括商品管理、购物车、订单管理、支付等模块。所有接口遵循RESTful设计风格，提供统一的请求/响应格式。

### 1.1 基础信息

- **API基础URL**: `https://api.sutwxapp.com/v1`
- **请求格式**: `application/json`
- **响应格式**: `application/json`
- **认证方式**: JWT Token认证

### 1.2 通用请求头

```
Authorization: Bearer {token}
Content-Type: application/json
X-Request-Time: {timestamp}
X-Client-Version: {version}
```

### 1.3 通用响应格式

```json
{
  "code": 0,             // 状态码：0-成功，非0-失败
  "message": "success", // 状态描述
  "data": {},           // 业务数据
  "meta": {}            // 元数据（如分页信息）
}
```

### 1.4 错误码说明

| 错误码 | 说明 | 解决方案 |
|-------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式和内容 |
| 401 | 未授权或Token无效 | 重新登录获取有效Token |
| 403 | 权限不足 | 检查用户权限 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 500 | 服务器内部错误 | 稍后重试或联系管理员 |
| 5001 | 商品不存在 | 检查商品ID是否正确 |
| 5002 | 库存不足 | 减少购买数量或选择其他商品 |
| 5003 | 购物车为空 | 添加商品到购物车后再结算 |
| 5004 | 订单不存在 | 检查订单ID是否正确 |
| 5005 | 支付失败 | 检查支付信息或稍后重试 |

## 2. 商品模块接口

### 2.1 获取商品分类列表

- **URL**: `/products/categories`
- **Method**: `GET`
- **Query Parameters**:
  - `parentId`: 父分类ID（可选，不传则获取一级分类）
  - `status`: 分类状态，0-禁用 1-启用（可选）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "categories": [
        {
          "_id": "string",         // 分类ID
          "name": "string",       // 分类名称
          "icon": "string",       // 分类图标
          "parentId": "string",   // 父分类ID
          "level": 1,              // 分类级别
          "sort": 0,               // 排序
          "status": 1,             // 状态
          "children": []           // 子分类（如果有）
        }
        // 更多分类
      ]
    }
  }
  ```

### 2.2 获取商品列表

- **URL**: `/products`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `categoryId`: 分类ID（可选）
  - `keyword`: 搜索关键词（可选）
  - `sortBy`: 排序字段（price, sales, createdAt），默认createdAt
  - `sortOrder`: 排序方向（asc, desc），默认desc
  - `minPrice`: 最低价格（可选）
  - `maxPrice`: 最高价格（可选）
  - `status`: 商品状态，0-下架 1-上架（可选）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "products": [
        {
          "_id": "string",         // 商品ID
          "name": "string",       // 商品名称
          "coverImage": "string", // 封面图片
          "price": 0,              // 价格
          "originalPrice": 0,      // 原价
          "sales": 0,              // 销量
          "stock": 0,              // 库存
          "category": {
            "_id": "string",
            "name": "string"
          }
        }
        // 更多商品
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

### 2.3 获取商品详情

- **URL**: `/products/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "product": {
        "_id": "string",         // 商品ID
        "name": "string",       // 商品名称
        "description": "string", // 商品描述
        "coverImage": "string", // 封面图片
        "images": ["string"],   // 商品图片列表
        "price": 0,              // 价格
        "originalPrice": 0,      // 原价
        "sales": 0,              // 销量
        "stock": 0,              // 库存
        "category": {
          "_id": "string",
          "name": "string"
        },
        "specifications": [      // 商品规格
          {
            "name": "颜色",
            "values": ["红色", "蓝色", "黑色"]
          },
          {
            "name": "尺码",
            "values": ["M", "L", "XL"]
          }
        ],
        "skus": [                // 商品SKU
          {
            "_id": "string",
            "attributes": {      // 规格属性组合
              "颜色": "红色",
              "尺码": "M"
            },
            "price": 0,          // SKU价格
            "stock": 0,          // SKU库存
            "skuCode": "string"  // SKU编码
          }
        ],
        "details": "string",     // 商品详情（HTML格式）
        "status": 1,             // 商品状态，0-下架 1-上架
        "createdAt": "string",  // 创建时间
        "updatedAt": "string"   // 更新时间
      }
    }
  }
  ```

### 2.4 获取商品推荐

- **URL**: `/products/recommendations`
- **Method**: `GET`
- **Query Parameters**:
  - `productId`: 商品ID（可选，用于获取相关推荐）
  - `limit`: 返回数量，默认10
  - `type`: 推荐类型（hot-热门, new-新品, related-相关）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "products": [
        {
          "_id": "string",         // 商品ID
          "name": "string",       // 商品名称
          "coverImage": "string", // 封面图片
          "price": 0,              // 价格
          "originalPrice": 0,      // 原价
          "sales": 0               // 销量
        }
        // 更多推荐商品
      ]
    }
  }
  ```

## 3. 购物车模块接口

### 3.1 获取购物车列表

- **URL**: `/cart`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "items": [
        {
          "_id": "string",         // 购物车项ID
          "product": {
            "_id": "string",
            "name": "string",
            "coverImage": "string",
            "price": 0,
            "originalPrice": 0
          },
          "sku": {
            "_id": "string",
            "attributes": {
              "颜色": "红色",
              "尺码": "M"
            },
            "price": 0,
            "stock": 0
          },
          "quantity": 1,           // 数量
          "checked": true,         // 是否选中
          "selectedPrice": 0       // 选中时的小计价格
        }
        // 更多购物车项
      ],
      "totalQuantity": 0,         // 总数量
      "totalPrice": 0,            // 总价格
      "selectedQuantity": 0,      // 选中数量
      "selectedPrice": 0          // 选中价格
    }
  }
  ```

### 3.2 添加商品到购物车

- **URL**: `/cart`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "productId": "string",     // 商品ID
    "skuId": "string",         // SKU ID
    "quantity": 1,              // 数量
    "attributes": {}            // 规格属性（如果未提供skuId）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "item": {
        // 购物车项详情
      }
    }
  }
  ```

### 3.3 更新购物车项

- **URL**: `/cart/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "quantity": 2,              // 更新的数量
    "checked": true             // 更新的选中状态（可选）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "item": {
        // 更新后的购物车项详情
      }
    }
  }
  ```

### 3.4 删除购物车项

- **URL**: `/cart/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 3.5 批量删除购物车项

- **URL**: `/cart/batch-delete`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "ids": ["string", "string"] // 购物车项ID列表
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "deletedCount": 2         // 删除的数量
    }
  }
  ```

### 3.6 切换购物车项选中状态

- **URL**: `/cart/toggle-check`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "ids": ["string", "string"], // 购物车项ID列表
    "checked": true                // 选中状态
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "updatedCount": 2         // 更新的数量
    }
  }
  ```

### 3.7 清空购物车

- **URL**: `/cart/clear`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

## 4. 订单模块接口

### 4.1 创建订单

- **URL**: `/orders`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "cartIds": ["string"],      // 购物车项ID列表
    "addressId": "string",     // 收货地址ID
    "paymentMethod": "wechat", // 支付方式（wechat, alipay）
    "remark": "string",        // 订单备注
    "couponId": "string",      // 优惠券ID（可选）
    "items": [                  // 如果不是从购物车创建订单，直接传入商品项
      {
        "productId": "string",
        "skuId": "string",
        "quantity": 1
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "order": {
        "_id": "string",         // 订单ID
        "orderNo": "string",     // 订单号
        "totalPrice": 0,          // 总价格
        "actualPrice": 0,         // 实付价格
        "status": 0,              // 订单状态：0-待付款 1-待发货 2-待收货 3-待评价 4-已完成 5-已取消
        "createdAt": "string",   // 创建时间
        "expireAt": "string"     // 订单过期时间
      }
    }
  }
  ```

### 4.2 获取订单列表

- **URL**: `/orders`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `status`: 订单状态（可选）
  - `startDate`: 开始日期（可选，格式：YYYY-MM-DD）
  - `endDate`: 结束日期（可选，格式：YYYY-MM-DD）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "orders": [
        {
          "_id": "string",         // 订单ID
          "orderNo": "string",     // 订单号
          "totalPrice": 0,          // 总价格
          "actualPrice": 0,         // 实付价格
          "quantity": 0,            // 商品总数
          "status": 0,              // 订单状态
          "statusText": "待付款",  // 订单状态文本
          "createdAt": "string",   // 创建时间
          "products": [             // 商品列表（简化信息）
            {
              "name": "string",
              "coverImage": "string",
              "price": 0,
              "quantity": 1
            }
          ]
        }
        // 更多订单
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

### 4.3 获取订单详情

- **URL**: `/orders/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "order": {
        "_id": "string",             // 订单ID
        "orderNo": "string",         // 订单号
        "userId": "string",          // 用户ID
        "totalPrice": 0,              // 总价格
        "actualPrice": 0,             // 实付价格
        "discount": 0,                // 优惠金额
        "shippingFee": 0,             // 运费
        "paymentMethod": "wechat",   // 支付方式
        "status": 0,                  // 订单状态
        "statusText": "待付款",      // 订单状态文本
        "remark": "string",          // 订单备注
        "createdAt": "string",       // 创建时间
        "paidAt": "string",          // 支付时间
        "shippedAt": "string",       // 发货时间
        "receivedAt": "string",      // 收货时间
        "completedAt": "string",     // 完成时间
        "canceledAt": "string",      // 取消时间
        "expireAt": "string",        // 过期时间
        "address": {                  // 收货地址
          "name": "string",          // 收货人
          "phone": "string",         // 电话
          "province": "string",      // 省份
          "city": "string",          // 城市
          "district": "string",      // 区县
          "detailAddress": "string"   // 详细地址
        },
        "items": [                    // 订单商品项
          {
            "_id": "string",
            "productId": "string",
            "productName": "string",
            "productImage": "string",
            "skuId": "string",
            "skuAttributes": {
              "颜色": "红色",
              "尺码": "M"
            },
            "price": 0,
            "quantity": 1,
            "totalPrice": 0
          }
        ],
        "paymentInfo": {              // 支付信息
          "transactionId": "string", // 支付交易ID
          "paidAmount": 0,            // 支付金额
          "paidAt": "string"         // 支付时间
        },
        "shippingInfo": {             // 物流信息
          "expressCompany": "string", // 快递公司
          "trackingNumber": "string", // 快递单号
          "shippingStatus": 0,        // 物流状态
          "tracks": [                 // 物流轨迹
            {
              "time": "string",      // 时间
              "description": "string" // 描述
            }
          ]
        }
      }
    }
  }
  ```

### 4.4 取消订单

- **URL**: `/orders/:id/cancel`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "reason": "string" // 取消原因
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 4.5 确认收货

- **URL**: `/orders/:id/confirm-receipt`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 4.6 申请退款/退货

- **URL**: `/orders/:id/refund`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "reason": "string",          // 退款原因
    "amount": 0,                 // 退款金额
    "description": "string",     // 退款描述
    "images": ["string"],       // 凭证图片
    "type": 0                    // 退款类型：0-仅退款 1-退款退货
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "refund": {
        "_id": "string",         // 退款单ID
        "orderId": "string",     // 订单ID
        "amount": 0,              // 退款金额
        "status": 0               // 退款状态：0-待审核 1-审核通过 2-审核拒绝 3-退款中 4-退款完成 5-退款失败
      }
    }
  }
  ```

### 4.7 删除订单

- **URL**: `/orders/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

## 5. 支付模块接口

### 5.1 创建支付订单

- **URL**: `/payments`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "orderId": "string",         // 订单ID
    "paymentMethod": "wechat",   // 支付方式（wechat, alipay）
    "clientType": "miniprogram"  // 客户端类型（miniprogram, h5, app）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "paymentId": "string",      // 支付ID
      "orderId": "string",        // 订单ID
      "amount": 0,                 // 支付金额
      "status": "pending",        // 支付状态
      "payUrl": "string",         // 支付链接（H5支付）
      "wechatPayParams": {         // 微信支付参数（小程序支付）
        "timeStamp": "string",
        "nonceStr": "string",
        "package": "string",
        "signType": "MD5",
        "paySign": "string"
      }
    }
  }
  ```

### 5.2 查询支付状态

- **URL**: `/payments/:id/status`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "payment": {
        "_id": "string",           // 支付ID
        "orderId": "string",       // 订单ID
        "amount": 0,                // 支付金额
        "status": "success",       // 支付状态（pending, success, failed, refunded）
        "transactionId": "string", // 支付交易ID
        "paidAt": "string"         // 支付时间
      }
    }
  }
  ```

### 5.3 支付回调（仅限服务器调用）

- **URL**: `/payments/notify`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    // 支付平台回调数据
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

## 6. 地址模块接口

### 6.1 获取地址列表

- **URL**: `/addresses`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "addresses": [
        {
          "_id": "string",           // 地址ID
          "name": "string",         // 收货人
          "phone": "string",        // 电话
          "province": "string",     // 省份
          "city": "string",         // 城市
          "district": "string",     // 区县
          "detailAddress": "string", // 详细地址
          "postalCode": "string",   // 邮政编码
          "isDefault": true,         // 是否默认地址
          "createdAt": "string",    // 创建时间
          "updatedAt": "string"     // 更新时间
        }
        // 更多地址
      ]
    }
  }
  ```

### 6.2 添加地址

- **URL**: `/addresses`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "string",           // 收货人
    "phone": "string",          // 电话
    "province": "string",       // 省份
    "city": "string",           // 城市
    "district": "string",       // 区县
    "detailAddress": "string",  // 详细地址
    "postalCode": "string",     // 邮政编码（可选）
    "isDefault": true            // 是否设为默认地址
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "address": {
        // 新增地址详情
      }
    }
  }
  ```

### 6.3 更新地址

- **URL**: `/addresses/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "name": "string",           // 收货人
    "phone": "string",          // 电话
    "province": "string",       // 省份
    "city": "string",           // 城市
    "district": "string",       // 区县
    "detailAddress": "string",  // 详细地址
    "postalCode": "string",     // 邮政编码（可选）
    "isDefault": true            // 是否设为默认地址
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "address": {
        // 更新后的地址详情
      }
    }
  }
  ```

### 6.4 删除地址

- **URL**: `/addresses/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 6.5 设置默认地址

- **URL**: `/addresses/:id/set-default`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

## 7. 优惠券模块接口

### 7.1 获取可用优惠券列表

- **URL**: `/coupons/available`
- **Method**: `GET`
- **Query Parameters**:
  - `productId`: 商品ID（可选，用于获取适用于特定商品的优惠券）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "coupons": [
        {
          "_id": "string",           // 优惠券ID
          "name": "string",         // 优惠券名称
          "type": 0,                 // 优惠券类型：0-满减券 1-折扣券
          "value": 0,                // 优惠值（满减金额或折扣比例）
          "minOrderAmount": 0,       // 最低消费金额
          "maxDiscount": 0,          // 最大优惠金额（针对折扣券）
          "startAt": "string",      // 有效期开始时间
          "endAt": "string",        // 有效期结束时间
          "status": 0,               // 状态：0-未使用 1-已使用 2-已过期
          "applicableProducts": []   // 适用商品（为空表示全部商品）
        }
        // 更多优惠券
      ]
    }
  }
  ```

### 7.2 获取优惠券详情

- **URL**: `/coupons/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "coupon": {
        "_id": "string",           // 优惠券ID
        "name": "string",         // 优惠券名称
        "type": 0,                 // 优惠券类型
        "value": 0,                // 优惠值
        "minOrderAmount": 0,       // 最低消费金额
        "maxDiscount": 0,          // 最大优惠金额
        "startAt": "string",      // 有效期开始时间
        "endAt": "string",        // 有效期结束时间
        "status": 0,               // 状态
        "applicableProducts": [],  // 适用商品
        "applicableCategories": [], // 适用分类
        "usageRules": "string",    // 使用规则说明
        "receivedAt": "string",   // 领取时间
        "usedAt": "string",       // 使用时间
        "orderId": "string"       // 使用的订单ID
      }
    }
  }
  ```

### 7.3 领取优惠券

- **URL**: `/coupons/:id/receive`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "coupon": {
        // 领取的优惠券详情
      }
    }
  }
  ```

### 7.4 获取优惠券活动列表

- **URL**: `/coupon-activities`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "activities": [
        {
          "_id": "string",           // 活动ID
          "name": "string",         // 活动名称
          "description": "string",  // 活动描述
          "startAt": "string",      // 开始时间
          "endAt": "string",        // 结束时间
          "coupons": [               // 活动包含的优惠券
            {
              "_id": "string",
              "name": "string",
              "type": 0,
              "value": 0,
              "minOrderAmount": 0
            }
          ],
          "status": 0,               // 活动状态：0-未开始 1-进行中 2-已结束
          "received": false          // 是否已领取
        }
        // 更多活动
      ]
    }
  }
  ```

## 8. 收藏模块接口

### 8.1 获取收藏列表

- **URL**: `/favorites`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `type`: 收藏类型（product-商品，店铺等）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "favorites": [
        {
          "_id": "string",           // 收藏记录ID
          "type": "product",        // 收藏类型
          "targetId": "string",     // 收藏目标ID
          "product": {               // 商品信息（收藏类型为商品时）
            "_id": "string",
            "name": "string",
            "coverImage": "string",
            "price": 0,
            "originalPrice": 0,
            "stock": 0
          },
          "createdAt": "string"     // 收藏时间
        }
        // 更多收藏
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

### 8.2 收藏商品

- **URL**: `/favorites`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "type": "product",        // 收藏类型
    "targetId": "string"     // 收藏目标ID
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "favorite": {
        // 收藏记录详情
      }
    }
  }
  ```

### 8.3 取消收藏

- **URL**: `/favorites/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 8.4 批量取消收藏

- **URL**: `/favorites/batch-delete`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "ids": ["string", "string"] // 收藏记录ID列表
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "deletedCount": 2         // 删除的数量
    }
  }
  ```

### 8.5 检查是否已收藏

- **URL**: `/favorites/check`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: 收藏类型
  - `targetId`: 收藏目标ID
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "isFavorite": true,       // 是否已收藏
      "favoriteId": "string"   // 收藏记录ID（如果已收藏）
    }
  }
  ```

## 9. 评价模块接口

### 9.1 创建商品评价

- **URL**: `/reviews`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "productId": "string",     // 商品ID
    "orderId": "string",       // 订单ID
    "score": 5,                 // 评分（1-5）
    "content": "string",       // 评价内容
    "images": ["string"],     // 评价图片
    "specifications": {},       // 购买时的规格信息
    "anonymous": false          // 是否匿名评价
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "review": {
        // 评价详情
      }
    }
  }
  ```

### 9.2 获取商品评价列表

- **URL**: `/products/:id/reviews`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `score`: 评分筛选（可选）
  - `hasImage`: 是否有图（可选，true/false）
  - `sortBy`: 排序字段（createdAt, helpfulCount），默认createdAt
  - `sortOrder`: 排序方向（asc, desc），默认desc
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "reviews": [
        {
          "_id": "string",           // 评价ID
          "productId": "string",     // 商品ID
          "userId": "string",        // 用户ID
          "userName": "string",      // 用户名（匿名时会脱敏）
          "userAvatar": "string",    // 用户头像
          "score": 5,                 // 评分
          "content": "string",       // 评价内容
          "images": ["string"],     // 评价图片
          "specifications": {},       // 规格信息
          "anonymous": false,         // 是否匿名
          "helpfulCount": 0,          // 有用数量
          "createdAt": "string",     // 评价时间
          "hasHelpful": false         // 当前用户是否已点赞
        }
        // 更多评价
      ],
      "statistics": {
        "total": 100,               // 评价总数
        "fiveStar": 80,             // 五星评价数
        "fourStar": 15,             // 四星评价数
        "threeStar": 3,             // 三星评价数
        "twoStar": 1,               // 两星评价数
        "oneStar": 1,               // 一星评价数
        "averageScore": 4.8,        // 平均评分
        "hasImage": 30              // 有图评价数
      }
    },
    "meta": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
  ```

### 9.3 点赞评价

- **URL**: `/reviews/:id/helpful`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "helpfulCount": 11         // 更新后的点赞数量
    }
  }
  ```

### 9.4 取消点赞评价

- **URL**: `/reviews/:id/helpful`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "helpfulCount": 10         // 更新后的点赞数量
    }
  }
  ```

## 10. 搜索模块接口

### 10.1 搜索商品

- **URL**: `/search/products`
- **Method**: `GET`
- **Query Parameters**:
  - `keyword`: 搜索关键词
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `sortBy`: 排序字段（price, sales, createdAt, relevance），默认relevance
  - `sortOrder`: 排序方向（asc, desc），默认desc
  - `filters`: 过滤条件（JSON字符串格式）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "products": [
        {
          "_id": "string",         // 商品ID
          "name": "string",       // 商品名称
          "coverImage": "string", // 封面图片
          "price": 0,              // 价格
          "originalPrice": 0,      // 原价
          "sales": 0,              // 销量
          "stock": 0               // 库存
        }
        // 更多商品
      ],
      "facets": {
        "categories": [
          {"name": "分类1", "count": 50},
          {"name": "分类2", "count": 30}
        ],
        "prices": [
          {"range": "0-100", "count": 40},
          {"range": "100-500", "count": 30}
        ]
      }
    },
    "meta": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
  ```

### 10.2 获取搜索历史

- **URL**: `/search/history`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "history": ["关键词1", "关键词2", "关键词3"]
    }
  }
  ```

### 10.3 清除搜索历史

- **URL**: `/search/history`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 10.4 获取热门搜索词

- **URL**: `/search/hot-words`
- **Method**: `GET`
- **Query Parameters**:
  - `limit`: 返回数量，默认10
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "hotWords": [
        {"word": "关键词1", "count": 1000},
        {"word": "关键词2", "count": 800},
        {"word": "关键词3", "count": 600}
      ]
    }
  }
  ```

### 10.5 获取搜索建议

- **URL**: `/search/suggestions`
- **Method**: `GET`
- **Query Parameters**:
  - `keyword`: 搜索关键词前缀
  - `limit`: 返回数量，默认10
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "suggestions": [
        {"word": "关键词建议1", "type": "product"},
        {"word": "关键词建议2", "type": "category"},
        {"word": "关键词建议3", "type": "brand"}
      ]
    }
  }
  ```

## 11. 常见问题

### 11.1 如何处理商品库存不足的情况？

当用户购买商品时，如果库存不足，系统会返回错误码5002。前端应该在用户点击购买或添加购物车时，先检查商品库存，并给用户相应的提示信息。

### 11.2 如何处理订单过期？

微信小程序支付订单通常有2小时的有效期。当订单过期时，系统会自动将订单状态设置为已取消。前端需要在订单列表和详情页中显示订单过期信息，并引导用户重新下单。

### 11.3 如何处理支付失败的情况？

当支付失败时，系统会返回错误码5005。前端应该显示友好的错误提示，并提供重试支付的选项。

### 11.4 如何获取物流信息？

当订单状态为已发货时，可以通过`/orders/:id`接口获取订单详情，其中包含物流信息。

### 11.5 如何计算订单的实际支付金额？

订单的实际支付金额计算公式：

```
实际支付金额 = 商品总价 + 运费 - 优惠券折扣 - 积分抵扣
```

系统会在创建订单时自动计算并返回实际支付金额。

## 12. 附录

### 12.1 订单状态说明

| 状态码 | 状态文本 | 说明 |
|-------|---------|------|
| 0 | 待付款 | 用户已创建订单，等待支付 |
| 1 | 待发货 | 用户已付款，等待商家发货 |
| 2 | 待收货 | 商家已发货，等待用户收货 |
| 3 | 待评价 | 用户已收货，等待评价 |
| 4 | 已完成 | 订单已完成 |
| 5 | 已取消 | 订单已取消 |
| 6 | 退款中 | 订单正在退款处理 |
| 7 | 已退款 | 订单已退款 |

### 12.2 优惠券类型说明

| 类型码 | 类型名称 | 说明 |
|-------|---------|------|
| 0 | 满减券 | 满一定金额减指定金额 |
| 1 | 折扣券 | 按指定折扣比例计算优惠金额 |
| 2 | 代金券 | 直接抵扣指定金额，无最低消费限制 |
| 3 | 运费券 | 抵扣订单运费 |

### 12.3 支付方式说明

| 支付方式 | 说明 |
|---------|------|
| wechat | 微信支付 |
| alipay | 支付宝支付（如适用） |
| balance | 余额支付 |

---

*本文档将根据业务需求和接口变更持续更新*
