#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新创建功能模块目录下的 Markdown 文件
用于修复无法通过编码转换解决的乱码问题
"""

import os

def recreate_file(file_path, content):
    """
    重新创建文件
    :param file_path: 文件路径
    :param content: 文件内容
    :return: 是否成功
    """
    try:
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f"✓ 成功重新创建文件: {file_path}")
        return True
    except Exception as e:
        print(f"✗ 重新创建文件失败: {file_path}, 错误: {e}")
        return False

def main():
    """
    主函数，重新创建功能模块目录下的所有 Markdown 文件
    """
    target_dir = 'e:\\Dropbox\\GitHub\\SutWxApp\\docs\\05-功能模块'
    
    # README.md 内容
    readme_content = '''<!--
文件名: README.md
版本号: 1.0.0
更新日期: 2025-11-24
作者: Sut
描述: 功能模块目录说明文档，提供模块索引与文档约定
-->
# 功能模块目录说明

本目录包含 SutWxApp 的核心业务模块文档，涵盖用户、内容、电商、支付、积分、会员、活动、消息等。用于指导开发、测试与运维协作。
## 快速索引
- 《01-积分系统功能说明》：积分获取/消耗、规则/接口与交互。
- 《02-功能模块说明文档》：模块概览、依赖关系、数据流与扩展规范。
## 文档约定
- 统一使用 UTF-8 无 BOM、Unix LF。
- 路径与引用以 `docs/` 为根，避免中文命名及冗余层级。
- 详细接口请参考：`docs/03-开发者指南/03-API接口文档.md`。
## 维护与规范
- 新增/修改模块需同时更新本目录 README 与相关文档。
- 保持术语一致性、接口统一性与规则可扩展性。
- 建议在变更时附带影响分析与测试要点。
'''
    
    # 01-积分系统功能说明.md 内容
    points_content = '''<!--
文件名: 01-积分系统功能说明.md
版本号: 1.0.1
更新日期: 2025-11-24
描述: 01-积分系统功能说明 文档文件
-->
# 积分系统功能说明

## 1. 概述
积分系统用于提高用户活跃度与留存，为电商、会员、活动等业务提供统一的激励与兑换机制。本文档介绍积分的获取、消耗、规则、接口定义及前端交互。
## 2. 业务术语
- 积分余额：当前可用积分，支持正整数。
- 冻结积分：待结算或风险管控中的积分，不可用。
- 积分流水：积分变动的记录，包括获取、消耗、过期、调整等类型。
- 获取来源：签到、购物、评价、任务、活动、运营手动发放等。
## 3. 积分获取
- 每日签到：固定或随机奖励，可配置上限与叠加规则。
- 购物行为：按订单实际支付额或商品阶梯给予积分，支持分类/品牌/单品倍率。
- 内容互动：评价、点赞、分享、关注等行为奖励，限频与反作弊。
- 任务中心：完成任务发放积分，支持一次/每日/每周/每月任务。
- 活动奖励：运营活动发放，如节日、会员日、拉新等。
## 4. 积分消耗
- 积分商城：兑换商品、券码/会员福利。
- 订单抵扣：按比例抵扣订单金额，支持上限与黑名单商品排除。
- 抵扣服务费：用于付费、包装费等附加项（如需）。
## 5. 规则说明
- 有效期：支持指定有效期（发放日+N天过期）或自然年+1年过期。
- 上限与下限：用户积分余额与单次获取/消耗可设置阈值与上限。
- 过期处理：到期自动生成过期流水并扣减余额；可配置提醒与预警。
- 结算/解冻：购物积分在订单完成后释放；退款积分退还与扣减。
- 手动调整：管理员可增减积分并填写原因，写入流水并触发通知。
- 反作弊：限频、设备指纹、黑名单、异常行为预警。
## 6. 数据模型（建议）
- 用户积分账户：
  - userId：用户唯一ID
  - pointsBalance：当前可用积分
  - pointsFrozen：冻结积分
  - totalEarned：累计获取积分
  - totalSpent：累计消耗积分
  - updatedAt：最近更新时间
- 积分流水：
  - logId：流水ID
  - userId：用户ID
  - type：earn/spend/expire/adjust/freeze/unfreeze
  - amount：积分变动金额（正负）
  - source：order/sign/task/activity/manual
  - orderId：关联订单（可选）
  - memo：备注或原因
  - createdAt：创建时间
  - status：pending/success/failed

## 7. 事件与流程
- 购物发放：下单→支付→订单完成→按规则发放积分（可冻结后释放）。
- 退款处理：退款完成→按比例回收积分或再次冻结→更新流水与余额。
- 签到任务：每日校验与限频→发放积分→写入流水。
- 兑换抵扣：下单使用积分→预冻结→扣减→订单取消时返回。
## 8. 接口定义（参考）

积分系统的完整API接口请参考 `docs/03-开发者指南/03-API接口文档.md` 中的"4.6 积分模块"部分，该文档提供了完整的接口说明，包括：

- 获取用户积分：`GET /points/balance`
- 获取积分任务列表：`GET /points/tasks`
- 完成积分任务：`POST /points/task/complete`
- 获取积分明细：`GET /points/history`
- 积分兑换商品：`POST /points/exchange`
- 获取积分商城商品列表：`GET /points/goods`
- 签到获取积分：`POST /points/signin`
- 获取签到状态：`GET /points/signin/status`

前端服务层的接口调用请参考 `docs/03-开发者指南/05-服务层API文档.md` 中的"3. 积分服务 (PointsService)"部分。
## 9. 前端页面与交互
- 我的积分：显示余额、冻结、到期提醒与获取方式。
- 积分明细：按类型筛选、分页加载、支持跳转关联订单。
- 兑换中心：兑换商品/券，展示规则、库存与可用性。
- 下单抵扣：实时计算抵扣上限、校验规则与错误提示。
## 10. 权限与风险
- 管理端操作需管理员角色与操作记录。
- 用户限额与风控规则统一接入（黑名单、设备指纹等）。
## 11. 异常与容错
- 接口错误处理：写错误流水并保持数据一致性；提供重试机制。
- 并发扣减：使用事务或分布式锁，保证幂等与一致性。
- 时间边界：过期处理需幂等、可重入，确保处理进度。
## 12. 测试要点
- 购物积分计算与退款返回的边界用例。
- 大额抵扣与上限校验、并发下单扣减一致性。
- 过期自动处理与提醒通知正确性。
- 任务/活动限频与反作弊规则验证。
## 13. 版本规划
- v1：基础积分获取/消耗、规则/接口与交互。
- v2：积分商城、会员等级关联、活动联动。
- v3：积分过期提醒、风控体系完善。
'''
    
    # 02-功能模块说明文档.md 内容
    modules_content = '''<!--
文件名: 02-功能模块说明文档.md
版本号: 1.0.0
更新日期: 2025-11-23
描述: 02-功能模块说明文档 文档文件
-->
# 功能模块说明文档

**版本**: 1.0.0  
**最后更新**: 2025-11-24

## 1. 概述
本文档汇总了 SutWxApp 的主要功能模块、依赖关系、数据流与接口定义，作为开发与协作的概览参考。
## 2. 模块清单
- 用户与认证：注册/登录、信息、权限、Token 管理。
- 内容与文档：文章列表/详情、评论、收藏、分享。
- 商品与分类：商品详情、规格、库存、分类管理。
- 购物车：增删改查、价格计算、优惠叠加规则。
- 订单管理：创建、支付、发货、售后、退款。
- 支付中心：聚合支付、支付状态回调、对账。
- 积分系统：获取、消耗、扣减/过期与风险（详见《积分系统功能说明》）。
- 会员体系：等级、权限、成长值、升级规则。
- 消息中心：站内消息、模板消息、订阅消息。
- 活动运营：优惠券、满减、砍价、拼团、抽奖。
- 客服与工单：在线客服、问题工单、反馈处理。
- 多语言支持：国际化 `.po/.pot` 字符串维护与一致性。
## 3. 依赖关系（示例）
- 订单依赖：商品、库存、价格、优惠、支付、积分。
- 支付依赖：订单、用户、风险、消息通知。
- 积分依赖：订单事件、任务中心、活动配置、会员体系。
- 会员依赖：积分、订单、活动。
## 4. 数据流与事件
- 下单：购物车→订单→支付→发货→完成→（积分发放/会员成长）。
- 退款：退款→资金回滚→积分退还/结算→消息通知。
- 任务：用户行为事件→触发限频→发放积分/福利→写入流水。
## 5. 接口定义
统一参考 `docs/03-开发者指南/03-API接口文档.md`，各模块应：
- 使用 RESTful 设计、统一响应格式与错误码。
- 明确认证与权限边界（RBAC）。
- 提供分页、过滤、排序能力。
- 关键写操作需幂等与操作日志。
## 6. 配置与开关
- 运营开关：活动、券、任务、积分扣减、消息发送。
- 规则配置：积分倍率、支付限额、风控策略、黑名单。
- 灰度发布：按用户/地区/版本进行开关控制。
## 7. 性能与可靠性
- 缓存：热点数据缓存、列表分页缓存、状态缓存。
- 异步：消息与事件队列、异步任务（过期、清理）。
- 可用性：业务/数据库幂等、重试与降级、降级策略。
## 8. 测试建议
- 单元测试：服务与工具函数、规则校验。
- 集成测试：下单→支付/售后闭环、积分变动与对账。
- 接口测试：认证、权限、错误码与边界。
- 性能测试：并发下单、支付、异步任务压力测试。
## 9. 风险与边界
- 资金相关：支付、退款对账、异常返回。
- 风控：积分套利、防刷、设备指纹与限频。
- 数据一致性：并发扣减、库存与积分一致性维护。
## 10. 版本演进（示例）
- v1：核心电商闭环与基础积分。
- v2：会员权限、活动营销与消息中心。
- v3：性能扩展与风控体系完善。
## 11. 模块详细说明

### 11.1 用户与认证模块
#### 核心功能
- 用户注册：支持手机号、微信授权等多种注册方式
- 用户登录：密码登录、验证码登录、微信授权登录
- 个人资料管理：基本信息、头像、收货地址等
- 权限管理：基于角色的访问控制(RBAC)
- Token管理：JWT令牌生成、验证、失效
#### 实现示例
```javascript
// 用户登录示例
async function login(credentials) {
  // 1. 验证用户数据
  const user = await userService.validateCredentials(credentials);
  
  // 2. 生成JWT令牌
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });
  
  // 3. 更新最后登录时间
  await userService.updateLastLogin(user.id);
  
  // 4. 返回用户信息和令牌
  return {
    user: sanitizeUser(user),
    token: token,
    expiresIn: 604800 // 7天
  };
}
```

#### 关键接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料

### 11.2 商品与分类模块
#### 核心功能
- 商品管理：商品信息、规格、库存、分类管理
- 分类管理：多级分类、分类属性
- 商品搜索：关键词搜索、筛选、排序
- 商品推荐：基于用户行为的个性化推荐

#### 实现示例
```javascript
// 商品搜索服务示例
class ProductService {
  async searchProducts(params) {
    const {
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20
    } = params;
    
    // 构建查询条件
    const query = {};
    
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    
    // 执行查询
    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('categoryId', 'name');
    
    // 获取总数
    const total = await Product.countDocuments(query);
    
    return {
      products,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    };
  }
}
```

#### 关键接口
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `GET /api/categories` - 获取分类列表
- `GET /api/products/search` - 搜索商品

### 11.3 购物车模块
#### 核心功能
- 商品添加：将商品加入购物车
- 数量修改：增减购物车中商品数量
- 商品删除：从购物车移除商品
- 价格计算：实时计算购物车总价
- 优惠应用：应用优惠券、满减等优惠

#### 实现示例
```javascript
// 购物车服务示例
class CartService {
  async addToCart(userId, productId, quantity, specs = {}) {
    // 1. 验证商品是否存在且有库存
    const product = await productService.getProductById(productId);
    if (!product || product.stock < quantity) {
      throw new Error('商品不存在或库存不足');
    }
    
    // 2. 查找用户购物车中是否已有该商品
    let cartItem = await Cart.findOne({
      userId,
      productId,
      specs: { $eq: specs }
    });
    
    if (cartItem) {
      // 3. 如果已存在，更新数量
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error('超过商品库存数量');
      }
      
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // 4. 如果不存在，创建购物车项
      cartItem = new Cart({
        userId,
        productId,
        quantity,
        specs,
        price: product.price,
        addedAt: new Date()
      });
      
      await cartItem.save();
    }
    
    // 5. 返回更新后的购物车
    return this.getCartByUserId(userId);
  }
  
  async calculateCartTotal(userId) {
    const cartItems = await Cart.find({ userId }).populate('productId');
    
    let subtotal = 0;
    let discount = 0;
    
    // 计算商品总价
    for (const item of cartItems) {
      subtotal += item.productId.price * item.quantity;
    }
    
    // 应用优惠规则
    const coupon = await couponService.getBestAvailableCoupon(userId, subtotal);
    if (coupon) {
      discount = couponService.calculateDiscount(coupon, subtotal);
    }
    
    // 计算最终总价
    const total = Math.max(0, subtotal - discount);
    
    return {
      subtotal,
      discount,
      total,
      coupon: coupon ? {
        id: coupon.id,
        code: coupon.code,
        discount: discount
      } : null
    };
  }
}
```

#### 关键接口
- `POST /api/cart/items` - 添加商品到购物车
- `PUT /api/cart/items/:id` - 更新购物车商品数量
- `DELETE /api/cart/items/:id` - 从购物车删除商品
- `GET /api/cart` - 获取用户购物车
- `POST /api/cart/apply-coupon` - 应用优惠券
### 11.4 订单管理模块

#### 核心功能
- 订单创建：从购物车生成订单
- 订单支付：集成支付渠道
- 订单状态管理：待支付、已支付、已发货、已完成、已取消等
- 订单查询：用户订单列表、订单详情
- 售后处理：退款、退货
#### 实现示例
```javascript
// 订单服务示例
class OrderService {
  async createOrder(userId, addressId, items, couponId = null) {
    // 1. 验证用户地址
    const address = await addressService.getAddressById(addressId);
    if (!address || address.userId.toString() !== userId) {
      throw new Error('无效的收货地址');
    }
    
    // 2. 验证商品并计算价格
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await productService.getProductById(item.productId);
      
      if (!product || product.stock < item.quantity) {
        throw new Error(`商品 ${product.name} 库存不足`);
      }
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        specs: item.specs || {}
      });
    }
    
    // 3. 应用优惠券
    let discount = 0;
    let coupon = null;
    
    if (couponId) {
      coupon = await couponService.getCouponById(couponId);
      if (coupon && couponService.canUseCoupon(coupon, userId, subtotal)) {
        discount = couponService.calculateDiscount(coupon, subtotal);
      }
    }
    
    // 4. 计算运费和总价
    const shipping = this.calculateShipping(subtotal);
    const total = Math.max(0, subtotal - discount + shipping);
    
    // 5. 创建订单
    const order = new Order({
      orderNo: this.generateOrderNo(),
      userId,
      items: orderItems,
      address: {
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail
      },
      subtotal,
      discount,
      shipping,
      total,
      coupon: coupon ? {
        id: coupon.id,
        code: coupon.code,
        discount: discount
      } : null,
      status: 'pending_payment',
      createdAt: new Date()
    });
    
    await order.save();
    
    // 6. 扣减商品库存
    for (const item of orderItems) {
      await productService.decreaseStock(item.productId, item.quantity);
    }
    
    // 7. 如果使用了优惠券，标记为已使用
    if (coupon) {
      await couponService.markCouponAsUsed(coupon.id, userId, order.id);
    }
    
    return order;
  }
  
  generateOrderNo() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${dateStr}${random}`;
  }
}
```

#### 关键接口
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取用户订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders/:id/pay` - 支付订单
- `POST /api/orders/:id/cancel` - 取消订单
- `POST /api/orders/:id/refund` - 申请退款
### 11.5 支付中心模块

#### 核心功能
- 微信支付：集成微信支付API
- 支付回调：处理支付结果通知
- 支付状态查询：查询订单支付状态
- 退款处理：处理退款请求和结果
- 对账功能：定期对账确保数据一致性
#### 实现示例
```javascript
// 支付服务示例
class PaymentService {
  async createPayment(orderId) {
    // 1. 获取订单信息
    const order = await orderService.getOrderById(orderId);
    if (!order || order.status !== 'pending_payment') {
      throw new Error('订单不存在或状态不正确');
    }
    
    // 2. 调用微信支付统一下单API
    const paymentParams = {
      appid: config.wechat.appId,
      mch_id: config.wechat.mchId,
      nonce_str: this.generateNonceStr(),
      body: `SutWxApp订单-${order.orderNo}`,
      out_trade_no: order.orderNo,
      total_fee: Math.round(order.total * 100), // 转换为分
      spbill_create_ip: this.getClientIP(),
      notify_url: config.wechat.paymentNotifyUrl,
      trade_type: 'JSAPI',
      openid: order.userOpenId
    };
    
    // 3. 添加签名
    paymentParams.sign = this.generateSign(paymentParams);
    
    // 4. 调用微信支付API
    const response = await this.callWechatPayAPI(paymentParams);
    
    if (response.return_code !== 'SUCCESS' || response.result_code !== 'SUCCESS') {
      throw new Error(`微信支付失败: ${response.return_msg || response.err_code_des}`);
    }
    
    // 5. 生成前端支付参数
    const paymentParamsForFrontend = {
      appId: paymentParams.appid,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: this.generateNonceStr(),
      package: `prepay_id=${response.prepay_id}`,
      signType: 'MD5'
    };
    
    // 6. 添加前端签名
    paymentParamsForFrontend.paySign = this.generateSign(paymentParamsForFrontend);
    
    // 7. 保存支付记录
    const payment = new Payment({
      orderId,
      orderNo: order.orderNo,
      paymentNo: response.prepay_id,
      amount: order.total,
      status: 'pending',
      paymentMethod: 'wechat',
      createdAt: new Date()
    });
    
    await payment.save();
    
    return paymentParamsForFrontend;
  }
  
  async handlePaymentNotify(notifyData) {
    // 1. 验证签名
    if (!this.verifyNotifySign(notifyData)) {
      throw new Error('支付通知签名验证失败');
    }
    
    // 2. 查找支付记录
    const payment = await Payment.findOne({
      orderNo: notifyData.out_trade_no
    });
    
    if (!payment) {
      throw new Error('支付记录不存在');
    }
    
    // 3. 更新支付状态
    if (notifyData.result_code === 'SUCCESS' && notifyData.return_code === 'SUCCESS') {
      payment.status = 'paid';
      payment.transactionId = notifyData.transaction_id;
      payment.paidAt = new Date();
      await payment.save();
      
      // 4. 更新订单状态
      await orderService.updateOrderStatus(payment.orderId, 'paid');
      
      // 5. 发送支付成功通知
      await notificationService.sendPaymentSuccessNotification(payment.orderId);
      
      // 6. 发放积分
      await pointsService.awardPointsForOrder(payment.orderId);
    } else {
      payment.status = 'failed';
      payment.failureReason = notifyData.err_code_des || notifyData.return_msg;
      await payment.save();
      
      // 7. 恢复商品库存
      await orderService.restoreProductStock(payment.orderId);
    }
    
    return { success: true };
  }
}
```

#### 关键接口
- `POST /api/payments` - 创建支付
- `POST /api/payments/notify` - 支付回调通知
- `GET /api/payments/:id/status` - 查询支付状态
- `POST /api/payments/:id/refund` - 申请退款
- `GET /api/payments/reconciliation` - 对账接口

### 11.6 积分系统模块

#### 核心功能
- 积分获取：签到、购物等获取积分
- 积分消耗：兑换商品、抵扣现金等
- 积分过期：设置积分有效期并自动过期
- 积分历史：记录用户积分变动历程
- 积分任务：设置积分获取任务
#### 实现示例
```javascript
// 积分服务示例
class PointsService {
  async awardPoints(userId, points, reason, relatedId = null, type = 'reward') {
    // 1. 验证参数
    if (points <= 0) {
      throw new Error('积分数量必须大于0');
    }
    
    // 2. 创建积分记录
    const pointsRecord = new Points({
      userId,
      points,
      reason,
      relatedId,
      type,
      status: 'active',
      createdAt: new Date(),
      expiresAt: this.calculateExpiryDate() // 计算过期时间
    });
    
    await pointsRecord.save();
    
    // 3. 更新用户总积分
    await userService.updateUserPoints(userId, points);
    
    // 4. 发送积分变动通知
    await notificationService.sendPointsChangeNotification(userId, points, reason);
    
    return pointsRecord;
  }
  
  async consumePoints(userId, points, reason, relatedId = null) {
    // 1. 验证用户积分是否足够
    const user = await userService.getUserById(userId);
    if (user.points < points) {
      throw new Error('积分不足');
    }
    
    // 2. 获取用户可用的积分记录（按过期时间排序，先使用即将过期的）
    const availablePoints = await Points.find({
      userId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).sort({ expiresAt: 1 });
    
    // 3. 计算需要消耗的积分记录
    let remainingPoints = points;
    const consumedRecords = [];
    
    for (const record of availablePoints) {
      if (remainingPoints <= 0) break;
      
      const consumeAmount = Math.min(record.points, remainingPoints);
      
      // 如果消耗部分积分，需要拆分记录
      if (consumeAmount < record.points) {
        // 创建新的记录表示剩余积分
        const remainingRecord = new Points({
          userId,
          points: record.points - consumeAmount,
          reason: record.reason,
          relatedId: record.relatedId,
          type: record.type,
          status: 'active',
          createdAt: record.createdAt,
          expiresAt: record.expiresAt
        });
        
        await remainingRecord.save();
      }
      
      // 更新原记录为已消耗
      record.points = consumeAmount;
      record.status = 'consumed';
      record.consumedAt = new Date();
      record.consumeReason = reason;
      record.consumeRelatedId = relatedId;
      
      await record.save();
      
      consumedRecords.push(record);
      remainingPoints -= consumeAmount;
    }
    
    // 4. 更新用户总积分
    await userService.updateUserPoints(userId, -points);
    
    // 5. 创建积分消耗记录
    const consumeRecord = new Points({
      userId,
      points: -points,
      reason,
      relatedId,
      type: 'consume',
      status: 'consumed',
      createdAt: new Date(),
      consumedAt: new Date(),
      consumeReason: reason,
      consumeRelatedId: relatedId
    });
    
    await consumeRecord.save();
    
    // 6. 发送积分变动通知
    await notificationService.sendPointsChangeNotification(userId, -points, reason);
    
    return {
      consumedRecords,
      totalConsumed: points
    };
  }
  
  async expirePoints() {
    // 1. 查找所有过期的积分记录
    const expiredPoints = await Points.find({
      status: 'active',
      expiresAt: { $lte: new Date() }
    });
    
    // 2. 按用户分组
    const expiredByUser = {};
    for (const record of expiredPoints) {
      if (!expiredByUser[record.userId]) {
        expiredByUser[record.userId] = [];
      }
      expiredByUser[record.userId].push(record);
    }
    
    // 3. 批量处理过期积分
    for (const userId in expiredByUser) {
      const userExpiredPoints = expiredByUser[userId];
      let totalExpired = 0;
      
      // 更新积分记录状态
      for (const record of userExpiredPoints) {
        record.status = 'expired';
        record.expiredAt = new Date();
        await record.save();
        
        totalExpired += record.points;
      }
      
      // 更新用户总积分
      await userService.updateUserPoints(userId, -totalExpired);
      
      // 发送过期通知
      await notificationService.sendPointsExpiredNotification(userId, totalExpired);
    }
    
    return {
      expiredCount: expiredPoints.length,
      expiredUsers: Object.keys(expiredByUser).length
    };
  }
}
```

#### 关键接口
- `POST /api/points/award` - 奖励积分
- `POST /api/points/consume` - 消耗积分
- `GET /api/points/history` - 获取积分历史
- `GET /api/points/tasks` - 获取积分任务列表
- `POST /api/points/signin` - 签到获取积分

## 版本历史

| 版本号 | 更新日期 | 更新内容 |
|--------|----------|----------|
| 1.0.0 | 2025-11-24 | 统一项目文档版本号 |
| 1.0.16 | 2024-11-01 | 添加版本号和最后更新时间，完善模块详细说明 |
| 1.0.15 | 2024-10-25 | 添加积分系统模块详细说明 |
| 1.0.14 | 2024-10-20 | 添加支付中心模块详细说明 |
| 1.0.13 | 2024-10-15 | 添加订单管理模块详细说明 |
| 1.0.12 | 2024-10-10 | 添加购物车模块详细说明 |
| 1.0.11 | 2024-10-05 | 添加商品与分类模块详细说明 |
| 1.0.10 | 2024-09-30 | 添加用户与认证模块详细说明 |
| 1.0.9 | 2024-09-25 | 完善风险与边界说明 |
| 1.0.8 | 2024-09-20 | 更新测试建议 |
| 1.0.7 | 2024-09-15 | 添加性能与可靠性说明 |
| 1.0.6 | 2024-09-10 | 完善配置与开关说明 |
| 1.0.5 | 2024-09-05 | 更新接口定义 |
| 1.0.4 | 2024-08-30 | 完善数据流与事件 |
| 1.0.3 | 2024-08-25 | 添加依赖关系说明 |
| 1.0.2 | 2024-08-20 | 完善模块清单 |
| 1.0.1 | 2024-08-15 | 初始版本 |
'''
    
    # 重新创建所有文件
    files_to_recreate = [
        (os.path.join(target_dir, 'README.md'), readme_content),
        (os.path.join(target_dir, '01-积分系统功能说明.md'), points_content),
        (os.path.join(target_dir, '02-功能模块说明文档.md'), modules_content)
    ]
    
    print(f"开始重新创建 {len(files_to_recreate)} 个 Markdown 文件...")
    print("=" * 50)
    
    success_count = 0
    for file_path, content in files_to_recreate:
        if recreate_file(file_path, content):
            success_count += 1
    
    print("=" * 50)
    print(f"重新创建完成！成功创建: {success_count}/{len(files_to_recreate)} 个文件")

if __name__ == "__main__":
    main()