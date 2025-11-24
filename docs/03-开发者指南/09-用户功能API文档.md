/**
 * 文件名: 09-用户功能API文档.md
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 09-用户功能API文档 文档文件
 */
# SutWxApp 用户功能API文档

## 1. 接口概述

本文档详细描述了SutWxApp微信小程序中用户功能相关的API接口，包括用户注册登录、用户信息管理、认证授权等模块。所有接口遵循RESTful设计风格，提供统一的请求/响应格式。

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
| 4001 | 用户已存在 | 请使用其他账号注册或尝试找回密码 |
| 4002 | 用户名或密码错误 | 请检查用户名和密码是否正确 |
| 4003 | 验证码错误或已过期 | 请重新获取验证码并正确输入 |
| 4004 | 手机号格式错误 | 请输入正确的手机号 |
| 4005 | 用户名长度不符要求 | 用户名长度应在3-20个字符之间 |
| 4006 | 密码强度不符合要求 | 密码应包含字母、数字，长度不少于6位 |

## 2. 用户认证模块接口

### 2.1 微信登录

- **URL**: `/auth/wechat-login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "string",         // 微信登录code
    "userInfo": {              // 微信用户信息（可选，授权时提供）
      "nickName": "string",   // 用户昵称
      "avatarUrl": "string",  // 头像URL
      "gender": 0,             // 性别，0-未知，1-男，2-女
      "city": "string",       // 城市
      "province": "string",   // 省份
      "country": "string",    // 国家
      "language": "string"    // 语言
    },
    "encryptedData": "string", // 加密数据（可选，获取手机号等敏感信息时）
    "iv": "string"            // 加密算法的初始向量（可选）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "user": {
        "_id": "string",         // 用户ID
        "openid": "string",      // 微信openid
        "nickName": "string",    // 昵称
        "avatarUrl": "string",   // 头像URL
        "gender": 0,              // 性别
        "phone": "string",       // 手机号（如果已绑定）
        "isNewUser": true,        // 是否新用户
        "status": 1               // 用户状态
      },
      "token": {
        "accessToken": "string",  // 访问令牌
        "refreshToken": "string", // 刷新令牌
        "expiresIn": 3600          // 过期时间（秒）
      }
    }
  }
  ```

### 2.2 刷新Token

- **URL**: `/auth/refresh-token`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"    // 刷新令牌
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "token": {
        "accessToken": "string",  // 新的访问令牌
        "refreshToken": "string", // 新的刷新令牌
        "expiresIn": 3600          // 过期时间（秒）
      }
    }
  }
  ```

### 2.3 退出登录

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"    // 刷新令牌（可选，用于服务端失效处理）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success"
  }
  ```

### 2.4 获取手机号（微信一键登录）

- **URL**: `/auth/get-phone`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "string"           // 微信获取手机号的code
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "phoneNumber": "string",   // 手机号码
      "countryCode": "string"    // 国家码
    }
  }
  ```

## 3. 用户信息模块接口

### 3.1 获取用户基本信息

- **URL**: `/user/profile`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "user": {
        "_id": "string",           // 用户ID
        "openid": "string",        // 微信openid
        "nickName": "string",      // 昵称
        "avatarUrl": "string",     // 头像URL
        "gender": 0,                // 性别
        "phone": "string",         // 手机号
        "email": "string",         // 邮箱
        "birthday": "string",      // 生日
        "city": "string",          // 城市
        "province": "string",      // 省份
        "country": "string",       // 国家
        "language": "string",      // 语言
        "signature": "string",      // 个性签名
        "registerTime": "string",  // 注册时间
        "lastLoginTime": "string"  // 最后登录时间
      }
    }
  }
  ```

### 3.2 更新用户基本信息

- **URL**: `/user/profile`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "nickName": "string",        // 昵称（可选）
    "gender": 1,                  // 性别（可选）
    "birthday": "string",        // 生日（可选，格式：YYYY-MM-DD）
    "signature": "string",       // 个性签名（可选）
    "language": "string"         // 语言（可选）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "user": {
        // 更新后的用户信息
      }
    }
  }
  ```

### 3.3 修改头像

- **URL**: `/user/avatar`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "avatarUrl": "string"       // 头像URL（通常是上传到云存储后的URL）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "avatarUrl": "string"     // 更新后的头像URL
    }
  }
  ```

### 3.4 绑定手机号

- **URL**: `/user/bind-phone`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "string"           // 微信获取手机号的code
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "phone": "string"         // 绑定的手机号
    }
  }
  ```

### 3.5 绑定邮箱

- **URL**: `/user/bind-email`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",          // 邮箱地址
    "verifyCode": "string"      // 验证码
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "email": "string"         // 绑定的邮箱
    }
  }
  ```

### 3.6 发送邮箱验证码

- **URL**: `/user/send-email-code`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",          // 邮箱地址
    "type": "bind"             // 验证码类型：bind-绑定邮箱，reset-重置密码
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "验证码已发送",
    "data": {
      "expireAt": "string"      // 验证码过期时间
    }
  }
  ```

### 3.7 获取用户统计信息

- **URL**: `/user/stats`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "stats": {
        "orderCount": 0,           // 订单总数
        "favoriteCount": 0,        // 收藏总数
        "addressCount": 0,         // 地址总数
        "couponCount": 0,          // 优惠券总数
        "points": 0,               // 积分
        "level": 0,                // 用户等级
        "experience": 0,           // 经验值
        "nextLevelExp": 0,         // 升级所需经验
        "unreadMessageCount": 0    // 未读消息数
      }
    }
  }
  ```

## 4. 用户安全模块接口

### 4.1 修改密码

- **URL**: `/user/change-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "oldPassword": "string",     // 旧密码
    "newPassword": "string"      // 新密码
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "密码修改成功"
  }
  ```

### 4.2 重置密码（通过邮箱）

- **URL**: `/user/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",          // 邮箱地址
    "verifyCode": "string",     // 验证码
    "newPassword": "string"     // 新密码
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "密码重置成功"
  }
  ```

### 4.3 实名认证

- **URL**: `/user/verify-real-name`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "realName": "string",       // 真实姓名
    "idCardNumber": "string",   // 身份证号码
    "frontImage": "string",     // 身份证正面照URL
    "backImage": "string"       // 身份证反面照URL
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "实名认证申请已提交",
    "data": {
      "verifyStatus": 0           // 认证状态：0-待审核，1-审核通过，2-审核拒绝
    }
  }
  ```

### 4.4 获取实名认证状态

- **URL**: `/user/verify-status`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "verifyStatus": 0,          // 认证状态：0-待审核，1-审核通过，2-审核拒绝
      "realName": "string",      // 真实姓名（已脱敏）
      "idCardNumber": "string",  // 身份证号（已脱敏）
      "reason": "string",        // 拒绝原因（如果被拒绝）
      "applyTime": "string",     // 申请时间
      "verifyTime": "string"     // 审核时间
    }
  }
  ```

### 4.5 绑定第三方账号

- **URL**: `/user/bind-third-party`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "type": "weibo",            // 第三方平台类型：weibo-微博，qq-QQ，alipay-支付宝
    "openid": "string",         // 第三方openid
    "unionid": "string",        // 第三方unionid（可选）
    "accessToken": "string",    // 第三方访问令牌
    "expiresIn": 7200            // 过期时间（秒）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "绑定成功"
  }
  ```

### 4.6 解绑第三方账号

- **URL**: `/user/unbind-third-party/:type`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "解绑成功"
  }
  ```

### 4.7 获取绑定的第三方账号

- **URL**: `/user/third-parties`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "thirdParties": [
        {
          "type": "weibo",        // 第三方平台类型
          "nickName": "string",   // 第三方昵称
          "avatarUrl": "string",  // 第三方头像
          "bindTime": "string"    // 绑定时间
        }
        // 更多绑定的第三方账号
      ]
    }
  }
  ```

## 5. 用户偏好设置模块接口

### 5.1 获取用户偏好设置

- **URL**: `/user/preferences`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "preferences": {
        "language": "zh_CN",       // 语言偏好
        "theme": "light",          // 主题偏好：light-浅色，dark-深色
        "notifications": {
          "order": true,            // 订单通知
          "promotion": true,        // 促销通知
          "system": true,           // 系统通知
          "comment": true           // 评论通知
        },
        "privacy": {
          "showPhone": false,       // 显示手机号
          "showEmail": false,       // 显示邮箱
          "showBirthday": false     // 显示生日
        }
      }
    }
  }
  ```

### 5.2 更新用户偏好设置

- **URL**: `/user/preferences`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "language": "zh_CN",         // 语言偏好（可选）
    "theme": "light",            // 主题偏好（可选）
    "notifications": {            // 通知设置（可选）
      "order": true,
      "promotion": false,
      "system": true,
      "comment": true
    },
    "privacy": {                  // 隐私设置（可选）
      "showPhone": false,
      "showEmail": false,
      "showBirthday": false
    }
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "设置更新成功",
    "data": {
      "preferences": {
        // 更新后的偏好设置
      }
    }
  }
  ```

### 5.3 设置接收消息提醒

- **URL**: `/user/notification-settings`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "types": ["order", "promotion"], // 要开启的通知类型
    "enabled": true                     // 是否开启
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "通知设置已更新"
  }
  ```

### 5.4 获取用户浏览历史

- **URL**: `/user/browse-history`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `type`: 浏览类型（product-商品，article-文章，等）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "history": [
        {
          "_id": "string",           // 历史记录ID
          "type": "product",        // 浏览类型
          "targetId": "string",     // 目标ID
          "targetInfo": {
            "name": "string",       // 名称
            "image": "string",      // 图片
            "url": "string",        // 链接
            "price": 0               // 价格（如果是商品）
          },
          "browseTime": "string"    // 浏览时间
        }
        // 更多浏览记录
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

### 5.5 清除浏览历史

- **URL**: `/user/browse-history`
- **Method**: `DELETE`
- **Request Body**:
  ```json
  {
    "ids": ["string"],          // 要删除的历史记录ID列表，不传则清空全部
    "type": "product"          // 要删除的浏览类型，不传则删除全部类型
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "浏览历史已清除",
    "data": {
      "deletedCount": 10         // 删除的记录数
    }
  }
  ```

## 6. 用户等级与积分模块接口

### 6.1 获取用户等级信息

- **URL**: `/user/level`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "levelInfo": {
        "currentLevel": 1,          // 当前等级
        "levelName": "新用户",     // 当前等级名称
        "nextLevel": 2,             // 下一等级
        "nextLevelName": "初级会员", // 下一等级名称
        "currentExp": 150,          // 当前经验值
        "nextLevelExp": 500,        // 升级所需经验值
        "progress": 30,             // 升级进度（百分比）
        "levelBenefits": [          // 当前等级权益
          "购物享受9.8折优惠",
          "生日礼包"
        ],
        "levelRules": "string"      // 等级规则说明
      }
    }
  }
  ```

### 6.2 获取积分明细

- **URL**: `/user/points/history`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `type`: 积分类型（income-收入，expense-支出）
  - `source`: 积分来源（order-订单，sign-签到，activity-活动）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "pointsRecords": [
        {
          "_id": "string",           // 记录ID
          "points": 100,              // 积分数量（正数为增加，负数为减少）
          "balance": 500,             // 积分余额
          "type": "income",          // 类型：income-收入，expense-支出
          "source": "order",         // 来源：order-订单，sign-签到，activity-活动，exchange-兑换
          "description": "订单号XXX获得积分", // 描述
          "createdAt": "string"      // 发生时间
        }
        // 更多积分记录
      ],
      "totalPoints": 500            // 总积分
    },
    "meta": {
      "total": 50,
      "page": 1,
      "pageSize": 20,
      "totalPages": 3
    }
  }
  ```

### 6.3 签到获取积分

- **URL**: `/user/sign-in`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "签到成功",
    "data": {
      "points": 5,                  // 获得的积分
      "totalPoints": 505,           // 总积分
      "signInDays": 3,              // 连续签到天数
      "signInRecords": [            // 本月签到记录
        {"date": "2024-01-01", "signed": true},
        {"date": "2024-01-02", "signed": true},
        {"date": "2024-01-03", "signed": true}
      ]
    }
  }
  ```

### 6.4 积分兑换

- **URL**: `/user/points/exchange`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "itemId": "string",          // 兑换物品ID
    "quantity": 1                 // 兑换数量
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "兑换成功",
    "data": {
      "exchangeId": "string",     // 兑换记录ID
      "pointsUsed": 100,           // 消耗的积分
      "remainingPoints": 405,      // 剩余积分
      "item": {
        "name": "优惠券",          // 兑换物品名称
        "value": "满100减10"
      }
    }
  }
  ```

### 6.5 获取积分兑换商品列表

- **URL**: `/user/points/exchange-items`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `category`: 兑换商品分类
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "items": [
        {
          "_id": "string",           // 物品ID
          "name": "满100减10优惠券", // 物品名称
          "description": "全场通用优惠券", // 物品描述
          "image": "string",         // 物品图片
          "points": 100,              // 所需积分
          "stock": 1000,              // 库存
          "type": "coupon",          // 物品类型：coupon-优惠券，product-商品，gift-礼品
          "limitPerDay": 1,           // 每日兑换限制
          "myExchangeCount": 0        // 我的兑换次数
        }
        // 更多兑换商品
      ]
    },
    "meta": {
      "total": 20,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
  ```

### 6.6 获取我的兑换记录

- **URL**: `/user/points/exchange-records`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `status`: 状态（pending-待处理，completed-已完成，canceled-已取消）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "records": [
        {
          "_id": "string",           // 记录ID
          "itemId": "string",        // 物品ID
          "itemName": "优惠券",      // 物品名称
          "points": 100,              // 消耗的积分
          "quantity": 1,              // 数量
          "status": "completed",     // 状态
          "exchangeTime": "string",  // 兑换时间
          "deliverTime": "string",   // 发货时间
          "orderNo": "string",       // 订单号（如果兑换的是实物商品）
          "couponCode": "string"     // 优惠券码（如果兑换的是优惠券）
        }
        // 更多兑换记录
      ]
    },
    "meta": {
      "total": 5,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
  ```

## 7. 用户黑名单模块接口

### 7.1 添加到黑名单

- **URL**: `/user/blacklist`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "targetId": "string",       // 目标用户ID或内容ID
    "targetType": "user",       // 目标类型：user-用户，shop-店铺，product-商品
    "reason": "string"          // 添加原因（可选）
  }
  ```
- **Response**:
  ```json
  {
    "code": 0,
    "message": "添加成功"
  }
  ```

### 7.2 移除黑名单

- **URL**: `/user/blacklist/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 0,
    "message": "移除成功"
  }
  ```

### 7.3 获取黑名单列表

- **URL**: `/user/blacklist`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `type`: 目标类型（user-用户，shop-店铺，product-商品）
- **Response**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "blacklist": [
        {
          "_id": "string",           // 黑名单记录ID
          "targetId": "string",     // 目标ID
          "targetType": "user",     // 目标类型
          "targetInfo": {
            "name": "string",       // 目标名称
            "avatar": "string"      // 目标头像（如果有）
          },
          "reason": "string",       // 添加原因
          "addTime": "string"       // 添加时间
        }
        // 更多黑名单记录
      ]
    },
    "meta": {
      "total": 10,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
  ```

## 8. 常见问题

### 8.1 如何处理Token过期的情况？

当Token过期时，API会返回401错误。此时前端需要调用`/auth/refresh-token`接口使用refreshToken获取新的accessToken。如果refreshToken也已过期，则需要用户重新登录。

### 8.2 如何安全地存储用户Token？

在微信小程序中，建议使用`wx.setStorageSync`来存储Token，并在每次请求时从存储中获取并添加到请求头中。同时，需要在用户退出登录时清除存储的Token。

### 8.3 如何处理用户敏感信息？

所有用户敏感信息（如密码、身份证号）在传输和存储时都应该进行加密处理。API返回用户敏感信息时，需要进行脱敏处理，如手机号显示为138****8888，身份证号显示为110***********1234。

### 8.4 如何获取用户的位置信息？

微信小程序中可以使用`wx.getLocation`接口获取用户位置信息，然后调用后台API保存用户位置信息或进行相关业务处理。注意需要在app.json中配置位置权限。

### 8.5 如何实现用户授权流程？

1. 用户进入需要授权的页面
2. 前端调用`wx.getSetting`检查用户是否已授权
3. 如果未授权，引导用户点击授权按钮
4. 用户点击授权按钮后，调用相应的授权接口（如`wx.getUserProfile`、`wx.chooseAddress`等）
5. 获取到授权信息后，调用后台API保存或更新用户信息

## 9. 附录

### 9.1 用户状态说明

| 状态码 | 状态文本 | 说明 |
|-------|---------|------|
| 0 | 禁用 | 用户账号已被禁用 |
| 1 | 正常 | 用户账号状态正常 |
| 2 | 待审核 | 用户账号待审核（如新注册用户或修改资料后） |
| 3 | 已锁定 | 用户账号因安全原因被锁定 |

### 9.2 积分来源说明

| 来源类型 | 说明 | 示例 |
|---------|------|------|
| order | 订单消费 | 购物获得积分 |
| sign | 每日签到 | 连续签到获得额外积分 |
| activity | 活动奖励 | 参与活动获得积分 |
| review | 商品评价 | 评价商品获得积分 |
| share | 分享推广 | 分享商品或活动获得积分 |
| invite | 邀请好友 | 成功邀请新用户获得积分 |

### 9.3 通知类型说明

| 类型 | 说明 |
|-----|------|
| order | 订单通知（状态变更、发货等） |
| payment | 支付通知（支付成功、退款等） |
| promotion | 促销通知（活动、优惠等） |
| system | 系统通知（公告、更新等） |
| comment | 评论通知（回复、点赞等） |
| message | 私信通知 |

---

*本文档将根据业务需求和接口变更持续更新*
