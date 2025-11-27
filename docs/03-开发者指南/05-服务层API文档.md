<!--
文件名: 05-服务层API文档.md
版本号: 1.0.0
更新日期: 2025-11-24
作者: Sut
描述: 服务层API文档，详细说明小程序服务层的接口定义、功能实现和使用方法
-->

# 服务层API文档

**版本号：1.0.0**
*最后更新时间：2025年11月23日*

## 1. 概述

本文档详细描述了SutWxApp微信小程序项目中服务层的API接口，包括认证服务、积分服务、支付服务等各个模块的接口说明、参数、返回值和使用示例。

### 1.1 文档目的

- 提供完整的服务层API接口说明
- 指导前端开发人员进行服务层调用
- 便于后端开发人员维护和更新接口
- 确保前后端开发协作的顺利进行

### 1.2 适用范围

本文档适用于SutWxApp微信小程序项目的所有服务层API接口，包括认证模块、积分模块、支付模块、通知模块等。

## 2. 认证服务 (authService)

认证服务模块负责处理用户登录、登出、会话管理等功能。

### 2.1 用户登录

**接口地址**: `authService.login(username, password)`

**功能描述**: 用户登录验证

**参数**:
- `username` (string): 用户名
- `password` (string): 密码

**返回值**: Promise<Object> - 包含用户信息的对象

**使用示例**:
```javascript
try {
  const user = await authService.login('test', '123456');
  console.log('登录成功:', user);
  // 输出: { id: 1, username: 'test', token: 'mock_token_123' }
} catch (error) {
  console.error('登录失败:', error.message);
}
```

### 2.2 用户登出

**接口地址**: `authService.logout()`

**功能描述**: 用户登出，清除本地存储的token

**返回值**: Promise<void>

**使用示例**:
```javascript
try {
  await authService.logout();
  console.log('登出成功');
} catch (error) {
  console.error('登出失败:', error.message);
}
```

### 2.3 获取认证Token

**接口地址**: `authService.getToken()`

**功能描述**: 获取当前存储的认证token

**返回值**: string | null - 返回token或null

**使用示例**:
```javascript
const token = authService.getToken();
if (token) {
  console.log('用户已登录');
} else {
  console.log('用户未登录');
}
```

### 2.4 检查登录状态

**接口地址**: `authService.isLoggedIn()`

**功能描述**: 检查用户是否已登录

**返回值**: boolean - 是否已登录

**使用示例**:
```javascript
if (authService.isLoggedIn()) {
  // 用户已登录，执行相关操作
  navigateToUserCenter();
} else {
  // 用户未登录，跳转到登录页
  navigateToLogin();
}
```

### 2.5 检查会话状态

**接口地址**: `authService.checkSession()`

**功能描述**: 检查会话状态是否有效

**返回值**: Promise<boolean> - 会话是否有效

**使用示例**:
```javascript
try {
  const isValid = await authService.checkSession();
  if (isValid) {
    console.log('会话有效');
  } else {
    console.log('会话已过期');
  }
} catch (error) {
  console.error('检查会话失败:', error.message);
}
```

### 2.6 获取用户收藏列表

**接口地址**: `authService.getUserFavorites()`

**功能描述**: 获取当前用户的收藏列表

**返回值**: Promise<Array> - 用户收藏列表

**使用示例**:
```javascript
try {
  const favorites = await authService.getUserFavorites();
  console.log('用户收藏列表:', favorites);
} catch (error) {
  console.error('获取收藏列表失败:', error.message);
}
```

### 2.7 获取用户地址列表

**接口地址**: `authService.getUserAddresses()`

**功能描述**: 获取当前用户的收货地址列表

**返回值**: Promise<Array> - 用户地址列表

**使用示例**:
```javascript
try {
  const addresses = await authService.getUserAddresses();
  console.log('用户地址列表:', addresses);
} catch (error) {
  console.error('获取地址列表失败:', error.message);
}
```

### 2.8 添加用户地址

**接口地址**: `authService.addUserAddress(address)`

**功能描述**: 添加新的收货地址

**参数**:
- `address` (Object): 地址信息对象

**返回值**: Promise<Object> - 添加结果

**使用示例**:
```javascript
try {
  const newAddress = {
    receiverName: '张三',
    phoneNumber: '13800138000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detailAddress: '天河路123号',
    isDefault: true
  };
  
  const result = await authService.addUserAddress(newAddress);
  console.log('添加地址成功:', result);
} catch (error) {
  console.error('添加地址失败:', error.message);
}
```

### 2.9 更新用户地址

**接口地址**: `authService.updateUserAddress(addressId, address)`

**功能描述**: 更新指定的收货地址

**参数**:
- `addressId` (number): 地址ID
- `address` (Object): 更新的地址信息

**返回值**: Promise<Object> - 更新结果

**使用示例**:
```javascript
try {
  const updatedAddress = {
    receiverName: '李四',
    phoneNumber: '13900139000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detailAddress: '科技园路456号',
    isDefault: false
  };
  
  const result = await authService.updateUserAddress(1, updatedAddress);
  console.log('更新地址成功:', result);
} catch (error) {
  console.error('更新地址失败:', error.message);
}
```

### 2.10 删除用户地址

**接口地址**: `authService.deleteUserAddress(addressId)`

**功能描述**: 删除指定的收货地址

**参数**:
- `addressId` (number): 地址ID

**返回值**: Promise<Object> - 删除结果

**使用示例**:
```javascript
try {
  const result = await authService.deleteUserAddress(1);
  console.log('删除地址成功:', result);
} catch (error) {
  console.error('删除地址失败:', error.message);
}
```

## 3. 积分服务 (PointsService)

积分服务模块负责处理用户积分相关的操作，包括积分查询、任务管理、积分兑换等功能。

### 3.1 获取用户积分信息

**接口地址**: `PointsService.getUserPoints()`

**功能描述**: 获取当前用户的积分信息

**返回值**: Promise<Object> - 用户积分信息

**使用示例**:
```javascript
try {
  const pointsInfo = await PointsService.getUserPoints();
  console.log('用户积分信息:', pointsInfo);
  // 示例输出: { totalPoints: 1500, availablePoints: 1200, frozenPoints: 300 }
} catch (error) {
  console.error('获取积分信息失败:', error.message);
}
```

### 3.2 获取积分任务列表

**接口地址**: `PointsService.getPointsTasks(options)`

**功能描述**: 获取积分任务列表，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `type` (string): 任务类型 (all/once/daily/weekly/monthly)
  - `status` (string): 任务状态 (all/pending/completed/unclaimed)
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 任务列表和分页信息

**使用示例**:
```javascript
try {
  // 获取每日任务
  const dailyTasks = await PointsService.getPointsTasks({
    type: 'daily',
    status: 'pending'
  });
  console.log('每日任务:', dailyTasks);
  
  // 获取所有已完成但未领取的任务
  const unclaimedTasks = await PointsService.getPointsTasks({
    status: 'unclaimed'
  });
  console.log('未领取奖励的任务:', unclaimedTasks);
} catch (error) {
  console.error('获取任务列表失败:', error.message);
}
```

### 3.3 完成积分任务

**接口地址**: `PointsService.completeTask(taskId)`

**功能描述**: 标记指定任务为已完成

**参数**:
- `taskId` (string): 任务ID

**返回值**: Promise<Object> - 完成结果

**使用示例**:
```javascript
try {
  const result = await PointsService.completeTask('task001');
  console.log('任务完成:', result);
} catch (error) {
  console.error('完成任务失败:', error.message);
}
```

### 3.4 领取任务奖励

**接口地址**: `PointsService.claimTaskReward(taskId)`

**功能描述**: 领取已完成任务的积分奖励

**参数**:
- `taskId` (string): 任务ID

**返回值**: Promise<Object> - 领取结果

**使用示例**:
```javascript
try {
  const result = await PointsService.claimTaskReward('task001');
  console.log('奖励领取成功:', result);
} catch (error) {
  console.error('领取奖励失败:', error.message);
}
```

### 3.5 获取积分记录列表

**接口地址**: `PointsService.getPointsRecords(options)`

**功能描述**: 获取用户积分变动记录，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `type` (string): 记录类型 (all/earn/spend)
  - `source` (string): 积分来源
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20
  - `startDate` (string): 开始日期
  - `endDate` (string): 结束日期

**返回值**: Promise<Object> - 积分记录列表和分页信息

**使用示例**:
```javascript
try {
  // 获取最近获得的积分记录
  const earnedPoints = await PointsService.getPointsRecords({
    type: 'earn',
    page: 1,
    pageSize: 10
  });
  console.log('获得积分记录:', earnedPoints);
  
  // 获取指定日期范围内的积分记录
  const dateRangeRecords = await PointsService.getPointsRecords({
    startDate: '2023-10-01',
    endDate: '2023-10-31'
  });
  console.log('10月积分记录:', dateRangeRecords);
} catch (error) {
  console.error('获取积分记录失败:', error.message);
}
```

### 3.6 每日签到

**接口地址**: `PointsService.dailySignin()`

**功能描述**: 执行每日签到操作，获取积分奖励

**返回值**: Promise<Object> - 签到结果

**使用示例**:
```javascript
try {
  const result = await PointsService.dailySignin();
  console.log('签到成功:', result);
  // 示例输出: { success: true, points: 10, continuousDays: 5 }
} catch (error) {
  console.error('签到失败:', error.message);
}
```

### 3.7 获取签到信息

**接口地址**: `PointsService.getSigninInfo()`

**功能描述**: 获取用户签到状态和连续签到天数

**返回值**: Promise<Object> - 签到信息

**使用示例**:
```javascript
try {
  const signinInfo = await PointsService.getSigninInfo();
  console.log('签到信息:', signinInfo);
  // 示例输出: { 
  //   canSignin: true, 
  //   continuousDays: 5, 
  //   totalSigninDays: 30,
  //   todayReward: 10 
  // }
} catch (error) {
  console.error('获取签到信息失败:', error.message);
}
```

### 3.8 获取积分商城商品列表

**接口地址**: `PointsService.getPointsMallProducts(options)`

**功能描述**: 获取积分商城商品列表，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `categoryId` (string): 分类ID
  - `sort` (string): 排序方式 (default/points_asc/points_desc/sales)
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 商品列表和分页信息

**使用示例**:
```javascript
try {
  // 获取积分商城商品列表，按积分从低到高排序
  const products = await PointsService.getPointsMallProducts({
    sort: 'points_asc',
    page: 1,
    pageSize: 10
  });
  console.log('积分商城商品:', products);
  
  // 获取指定分类的商品
  const categoryProducts = await PointsService.getPointsMallProducts({
    categoryId: 'cat001'
  });
  console.log('分类商品:', categoryProducts);
} catch (error) {
  console.error('获取商品列表失败:', error.message);
}
```

### 3.9 积分兑换商品

**接口地址**: `PointsService.exchangeProduct(data)`

**功能描述**: 使用积分兑换商品

**参数**:
- `data` (Object): 兑换数据
  - `productId` (string): 商品ID
  - `quantity` (number): 兑换数量
  - `addressId` (string, 可选): 收货地址ID
  - `remark` (string, 可选): 备注

**返回值**: Promise<Object> - 兑换结果

**使用示例**:
```javascript
try {
  const exchangeData = {
    productId: 'prod001',
    quantity: 1,
    addressId: 'addr001',
    remark: '请尽快发货'
  };
  
  const result = await PointsService.exchangeProduct(exchangeData);
  console.log('兑换成功:', result);
} catch (error) {
  console.error('兑换失败:', error.message);
}
```

### 3.10 获取积分兑换记录

**接口地址**: `PointsService.getExchangeRecords(options)`

**功能描述**: 获取用户的积分兑换记录，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `status` (string): 兑换状态 (all/pending/shipped/completed/cancelled)
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 兑换记录列表和分页信息

**使用示例**:
```javascript
try {
  // 获取所有兑换记录
  const allRecords = await PointsService.getExchangeRecords({
    page: 1,
    pageSize: 10
  });
  console.log('兑换记录:', allRecords);
  
  // 获取已完成的兑换记录
  const completedRecords = await PointsService.getExchangeRecords({
    status: 'completed'
  });
  console.log('已完成兑换:', completedRecords);
} catch (error) {
  console.error('获取兑换记录失败:', error.message);
}
```

## 4. 支付服务 (PaymentService)

支付服务模块负责处理订单支付、退款、支付方式管理等支付相关功能。

### 4.1 创建支付订单

**接口地址**: `PaymentService.createPayment(data)`

**功能描述**: 创建新的支付订单

**参数**:
- `data` (Object): 支付数据
  - `items` (Array): 商品列表
  - `totalAmount` (number): 总金额
  - `couponId` (string, 可选): 优惠券ID
  - `addressId` (string, 可选): 收货地址ID
  - `remark` (string, 可选): 订单备注

**返回值**: Promise<Object> - 创建结果

**使用示例**:
```javascript
try {
  const paymentData = {
    items: [
      { productId: 'p001', quantity: 2, price: 199.00 },
      { productId: 'p002', quantity: 1, price: 99.00 }
    ],
    totalAmount: 497.00,
    addressId: 'addr001',
    remark: '请在工作日配送'
  };
  
  const result = await PaymentService.createPayment(paymentData);
  console.log('支付订单创建成功:', result);
} catch (error) {
  console.error('创建支付订单失败:', error.message);
}
```

### 4.2 获取支付方式列表

**接口地址**: `PaymentService.getPaymentMethods(options)`

**功能描述**: 获取可用的支付方式列表

**参数**:
- `options` (Object, 可选): 查询参数

**返回值**: Promise<Object> - 支付方式列表

**使用示例**:
```javascript
try {
  const paymentMethods = await PaymentService.getPaymentMethods();
  console.log('支付方式列表:', paymentMethods);
  // 示例输出: {
  //   methods: [
  //     { id: 'wechat', name: '微信支付', icon: 'wechat.png' },
  //     { id: 'alipay', name: '支付宝', icon: 'alipay.png' }
  //   ]
  // }
} catch (error) {
  console.error('获取支付方式失败:', error.message);
}
```

### 4.3 发起支付请求

**接口地址**: `PaymentService.initiatePayment(data)`

**功能描述**: 发起支付请求，获取支付参数

**参数**:
- `data` (Object): 支付参数
  - `orderId` (string): 订单ID
  - `paymentMethod` (string): 支付方式
  - `returnUrl` (string, 可选): 支付成功返回URL
  - `notifyUrl` (string, 可选): 支付结果通知URL

**返回值**: Promise<Object> - 支付请求结果

**使用示例**:
```javascript
try {
  const paymentData = {
    orderId: 'order001',
    paymentMethod: 'wechat'
  };
  
  const result = await PaymentService.initiatePayment(paymentData);
  console.log('支付请求发起成功:', result);
  // 使用返回的支付参数调用微信支付API
  wx.requestPayment({
    ...result.paymentParams,
    success: (res) => {
      console.log('支付成功:', res);
    },
    fail: (err) => {
      console.error('支付失败:', err);
    }
  });
} catch (error) {
  console.error('发起支付请求失败:', error.message);
}
```

### 4.4 查询支付状态

**接口地址**: `PaymentService.getPaymentStatus(paymentId)`

**功能描述**: 查询指定支付的状态

**参数**:
- `paymentId` (string): 支付ID

**返回值**: Promise<Object> - 支付状态

**使用示例**:
```javascript
try {
  const status = await PaymentService.getPaymentStatus('pay001');
  console.log('支付状态:', status);
  // 示例输出: { 
  //   paymentId: 'pay001',
  //   status: 'success', // pending/success/failed/cancelled
  //   paidAt: '2023-11-01 15:30:00'
  // }
} catch (error) {
  console.error('查询支付状态失败:', error.message);
}
```

### 4.5 申请退款

**接口地址**: `PaymentService.requestRefund(data)`

**功能描述**: 为已支付的订单申请退款

**参数**:
- `data` (Object): 退款数据
  - `orderId` (string): 订单ID
  - `refundAmount` (number): 退款金额
  - `reason` (string): 退款原因

**返回值**: Promise<Object> - 退款申请结果

**使用示例**:
```javascript
try {
  const refundData = {
    orderId: 'order001',
    refundAmount: 199.00,
    reason: '商品质量问题'
  };
  
  const result = await PaymentService.requestRefund(refundData);
  console.log('退款申请成功:', result);
} catch (error) {
  console.error('申请退款失败:', error.message);
}
```

### 4.6 获取支付记录列表

**接口地址**: `PaymentService.getPaymentHistory(options)`

**功能描述**: 获取用户的支付记录，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20
  - `status` (string): 支付状态筛选
  - `startDate` (string): 开始日期
  - `endDate` (string): 结束日期

**返回值**: Promise<Object> - 支付记录列表和分页信息

**使用示例**:
```javascript
try {
  // 获取最近10条支付记录
  const recentPayments = await PaymentService.getPaymentHistory({
    page: 1,
    pageSize: 10
  });
  console.log('最近支付记录:', recentPayments);
  
  // 获取指定日期范围内的支付记录
  const dateRangePayments = await PaymentService.getPaymentHistory({
    startDate: '2023-10-01',
    endDate: '2023-10-31'
  });
  console.log('10月支付记录:', dateRangePayments);
} catch (error) {
  console.error('获取支付记录失败:', error.message);
}
```

## 5. 通知服务 (notificationService)

通知服务模块负责处理应用通知、消息推送、通知设置等功能。

### 5.1 获取通知列表

**接口地址**: `notificationService.getNotificationList(options)`

**功能描述**: 获取用户通知列表，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `type` (string): 通知类型 (all/system/order/promotion/activity)
  - `status` (string): 通知状态 (all/read/unread)
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 通知列表和分页信息

**使用示例**:
```javascript
try {
  // 获取未读通知
  const unreadNotifications = await notificationService.getNotificationList({
    status: 'unread',
    page: 1,
    pageSize: 10
  });
  console.log('未读通知:', unreadNotifications);
  
  // 获取订单相关通知
  const orderNotifications = await notificationService.getNotificationList({
    type: 'order'
  });
  console.log('订单通知:', orderNotifications);
} catch (error) {
  console.error('获取通知列表失败:', error.message);
}
```

### 5.2 获取通知详情

**接口地址**: `notificationService.getNotificationDetail(notificationId)`

**功能描述**: 获取指定通知的详细信息

**参数**:
- `notificationId` (string): 通知ID

**返回值**: Promise<Object> - 通知详情

**使用示例**:
```javascript
try {
  const detail = await notificationService.getNotificationDetail('notif001');
  console.log('通知详情:', detail);
} catch (error) {
  console.error('获取通知详情失败:', error.message);
}
```

### 5.3 标记通知为已读

**接口地址**: `notificationService.markAsRead(notificationId)`

**功能描述**: 将指定通知标记为已读

**参数**:
- `notificationId` (string): 通知ID

**返回值**: Promise<Object> - 标记结果

**使用示例**:
```javascript
try {
  const result = await notificationService.markAsRead('notif001');
  console.log('标记已读成功:', result);
} catch (error) {
  console.error('标记已读失败:', error.message);
}
```

### 5.4 批量标记通知为已读

**接口地址**: `notificationService.markMultipleAsRead(notificationIds)`

**功能描述**: 批量将通知标记为已读

**参数**:
- `notificationIds` (Array): 通知ID数组

**返回值**: Promise<Object> - 标记结果

**使用示例**:
```javascript
try {
  const result = await notificationService.markMultipleAsRead(['notif001', 'notif002', 'notif003']);
  console.log('批量标记已读成功:', result);
} catch (error) {
  console.error('批量标记已读失败:', error.message);
}
```

### 5.5 删除通知

**接口地址**: `notificationService.deleteNotification(notificationId)`

**功能描述**: 删除指定通知

**参数**:
- `notificationId` (string): 通知ID

**返回值**: Promise<Object> - 删除结果

**使用示例**:
```javascript
try {
  const result = await notificationService.deleteNotification('notif001');
  console.log('删除通知成功:', result);
} catch (error) {
  console.error('删除通知失败:', error.message);
}
```

### 5.6 获取未读通知数量

**接口地址**: `notificationService.getUnreadCount()`

**功能描述**: 获取当前用户的未读通知数量

**返回值**: Promise<Object> - 未读通知数量

**使用示例**:
```javascript
try {
  const result = await notificationService.getUnreadCount();
  console.log('未读通知数量:', result.count);
} catch (error) {
  console.error('获取未读通知数量失败:', error.message);
}
```

### 5.7 清空所有通知

**接口地址**: `notificationService.clearAllNotifications()`

**功能描述**: 清空用户的所有通知

**返回值**: Promise<Object> - 清空结果

**使用示例**:
```javascript
try {
  const result = await notificationService.clearAllNotifications();
  console.log('清空通知成功:', result);
} catch (error) {
  console.error('清空通知失败:', error.message);
}
```

## 6. 购物车服务 (CartService)

购物车服务模块负责处理购物车商品管理、结算等功能。

### 6.1 获取购物车列表

**接口地址**: `CartService.getCartList()`

**功能描述**: 获取当前用户的购物车商品列表

**返回值**: Promise<Object> - 购物车商品列表

**使用示例**:
```javascript
try {
  const cartList = await CartService.getCartList();
  console.log('购物车列表:', cartList);
} catch (error) {
  console.error('获取购物车列表失败:', error.message);
}
```

### 6.2 添加商品到购物车

**接口地址**: `CartService.addToCart(productId, quantity, specs)`

**功能描述**: 添加商品到购物车

**参数**:
- `productId` (string): 商品ID
- `quantity` (number): 商品数量
- `specs` (Object, 可选): 商品规格

**返回值**: Promise<Object> - 添加结果

**使用示例**:
```javascript
try {
  const result = await CartService.addToCart('prod001', 2, { color: 'red', size: 'L' });
  console.log('添加到购物车成功:', result);
} catch (error) {
  console.error('添加到购物车失败:', error.message);
}
```

### 6.3 更新购物车商品数量

**接口地址**: `CartService.updateCartItem(itemId, quantity)`

**功能描述**: 更新购物车中指定商品的数量

**参数**:
- `itemId` (string): 购物车项ID
- `quantity` (number): 新的数量

**返回值**: Promise<Object> - 更新结果

**使用示例**:
```javascript
try {
  const result = await CartService.updateCartItem('item001', 3);
  console.log('更新购物车商品数量成功:', result);
} catch (error) {
  console.error('更新购物车商品数量失败:', error.message);
}
```

### 6.4 删除购物车商品

**接口地址**: `CartService.removeFromCart(itemId)`

**功能描述**: 从购物车中删除指定商品

**参数**:
- `itemId` (string): 购物车项ID

**返回值**: Promise<Object> - 删除结果

**使用示例**:
```javascript
try {
  const result = await CartService.removeFromCart('item001');
  console.log('删除购物车商品成功:', result);
} catch (error) {
  console.error('删除购物车商品失败:', error.message);
}
```

### 6.5 清空购物车

**接口地址**: `CartService.clearCart()`

**功能描述**: 清空当前用户的购物车

**返回值**: Promise<Object> - 清空结果

**使用示例**:
```javascript
try {
  const result = await CartService.clearCart();
  console.log('清空购物车成功:', result);
} catch (error) {
  console.error('清空购物车失败:', error.message);
}
```

### 6.6 获取购物车商品数量

**接口地址**: `CartService.getCartItemCount()`

**功能描述**: 获取购物车中商品的总数量

**返回值**: Promise<Object> - 商品总数量

**使用示例**:
```javascript
try {
  const result = await CartService.getCartItemCount();
  console.log('购物车商品数量:', result.count);
} catch (error) {
  console.error('获取购物车商品数量失败:', error.message);
}
```

### 6.7 选择/取消选择购物车商品

**接口地址**: `CartService.selectCartItem(itemId, selected)`

**功能描述**: 选择或取消选择购物车中的商品

**参数**:
- `itemId` (string): 购物车项ID
- `selected` (boolean): 是否选择

**返回值**: Promise<Object> - 操作结果

**使用示例**:
```javascript
try {
  // 选择商品
  const result1 = await CartService.selectCartItem('item001', true);
  console.log('选择商品成功:', result1);
  
  // 取消选择商品
  const result2 = await CartService.selectCartItem('item001', false);
  console.log('取消选择商品成功:', result2);
} catch (error) {
  console.error('操作失败:', error.message);
}
```

### 6.8 全选/取消全选购物车商品

**接口地址**: `CartService.selectAllItems(selected)`

**功能描述**: 全选或取消全选购物车中的所有商品

**参数**:
- `selected` (boolean): 是否全选

**返回值**: Promise<Object> - 操作结果

**使用示例**:
```javascript
try {
  // 全选商品
  const result1 = await CartService.selectAllItems(true);
  console.log('全选商品成功:', result1);
  
  // 取消全选商品
  const result2 = await CartService.selectAllItems(false);
  console.log('取消全选商品成功:', result2);
} catch (error) {
  console.error('操作失败:', error.message);
}
```

### 6.9 获取选中商品总价

**接口地址**: `CartService.getSelectedItemsTotal()`

**功能描述**: 计算购物车中选中商品的总价

**返回值**: Promise<Object> - 选中商品总价

**使用示例**:
```javascript
try {
  const result = await CartService.getSelectedItemsTotal();
  console.log('选中商品总价:', result.total);
} catch (error) {
  console.error('获取选中商品总价失败:', error.message);
}
```

### 6.10 应用优惠券

**接口地址**: `CartService.applyCoupon(couponCode)`

**功能描述**: 应用优惠券到购物车

**参数**:
- `couponCode` (string): 优惠券代码

**返回值**: Promise<Object> - 应用结果

**使用示例**:
```javascript
try {
  const result = await CartService.applyCoupon('DISCOUNT10');
  console.log('应用优惠券成功:', result);
} catch (error) {
  console.error('应用优惠券失败:', error.message);
}
```

## 7. 商品服务 (ProductService)

商品服务模块负责处理商品信息查询、搜索、分类等功能。

### 7.1 获取商品列表

**接口地址**: `ProductService.getProducts(options)`

**功能描述**: 获取商品列表，支持分页和筛选

**参数**:
- `options` (Object, 可选): 查询参数
  - `categoryId` (string): 分类ID
  - `keyword` (string): 搜索关键词
  - `sort` (string): 排序方式 (default/sales_asc/sales_desc/price_asc/price_desc)
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 商品列表和分页信息

**使用示例**:
```javascript
try {
  // 获取商品列表
  const products = await ProductService.getProducts({
    page: 1,
    pageSize: 10
  });
  console.log('商品列表:', products);
  
  // 按价格从低到高排序
  const sortedProducts = await ProductService.getProducts({
    sort: 'price_asc'
  });
  console.log('按价格排序的商品:', sortedProducts);
} catch (error) {
  console.error('获取商品列表失败:', error.message);
}
```

### 7.2 获取商品详情

**接口地址**: `ProductService.getProductDetail(productId)`

**功能描述**: 获取指定商品的详细信息

**参数**:
- `productId` (string): 商品ID

**返回值**: Promise<Object> - 商品详情

**使用示例**:
```javascript
try {
  const detail = await ProductService.getProductDetail('prod001');
  console.log('商品详情:', detail);
} catch (error) {
  console.error('获取商品详情失败:', error.message);
}
```

### 7.3 搜索商品

**接口地址**: `ProductService.searchProducts(keyword, options)`

**功能描述**: 根据关键词搜索商品

**参数**:
- `keyword` (string): 搜索关键词
- `options` (Object, 可选): 搜索参数
  - `categoryId` (string): 分类ID
  - `minPrice` (number): 最低价格
  - `maxPrice` (number): 最高价格
  - `sort` (string): 排序方式
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 搜索结果

**使用示例**:
```javascript
try {
  const result = await ProductService.searchProducts('手机', {
    minPrice: 1000,
    maxPrice: 5000,
    sort: 'price_asc'
  });
  console.log('搜索结果:', result);
} catch (error) {
  console.error('搜索商品失败:', error.message);
}
```

### 7.4 获取商品分类

**接口地址**: `ProductService.getCategories()`

**功能描述**: 获取商品分类列表

**返回值**: Promise<Object> - 分类列表

**使用示例**:
```javascript
try {
  const categories = await ProductService.getCategories();
  console.log('商品分类:', categories);
} catch (error) {
  console.error('获取商品分类失败:', error.message);
}
```

### 7.5 获取商品评价

**接口地址**: `ProductService.getProductReviews(productId, options)`

**功能描述**: 获取指定商品的评价列表

**参数**:
- `productId` (string): 商品ID
- `options` (Object, 可选): 查询参数
  - `rating` (number): 评分筛选
  - `sort` (string): 排序方式 (default/newest/oldest/rating_high/rating_low)
  - `page` (number): 页码，默认为1
  - `pageSize` (number): 每页数量，默认为20

**返回值**: Promise<Object> - 评价列表

**使用示例**:
```javascript
try {
  const reviews = await ProductService.getProductReviews('prod001', {
    rating: 5,
    sort: 'newest'
  });
  console.log('商品评价:', reviews);
} catch (error) {
  console.error('获取商品评价失败:', error.message);
}
```

### 7.6 获取商品推荐

**接口地址**: `ProductService.getRecommendedProducts(productId, options)`

**功能描述**: 获取与指定商品相关的推荐商品

**参数**:
- `productId` (string): 商品ID
- `options` (Object, 可选): 查询参数
  - `type` (string): 推荐类型 (related/bestSeller/newArrival)
  - `limit` (number): 推荐数量，默认为10

**返回值**: Promise<Object> - 推荐商品列表

**使用示例**:
```javascript
try {
  const recommended = await ProductService.getRecommendedProducts('prod001', {
    type: 'related',
    limit: 5
  });
  console.log('推荐商品:', recommended);
} catch (error) {
  console.error('获取推荐商品失败:', error.message);
}
```

## 8. 设置服务 (SettingsService)

设置服务模块负责处理系统设置、应用设置、用户设置等功能。

### 8.1 获取系统设置

**接口地址**: `settingsService.getSystemSettings()`

**功能描述**: 获取系统级别的设置信息

**返回值**: Promise<Object> - 系统设置信息

**使用示例**:
```javascript
try {
  const settings = await settingsService.getSystemSettings();
  console.log('系统设置:', settings);
} catch (error) {
  console.error('获取系统设置失败:', error.message);
}
```

### 8.2 获取应用设置

**接口地址**: `settingsService.getAppSettings()`

**功能描述**: 获取应用级别的设置信息

**返回值**: Promise<Object> - 应用设置信息

**使用示例**:
```javascript
try {
  const settings = await settingsService.getAppSettings();
  console.log('应用设置:', settings);
} catch (error) {
  console.error('获取应用设置失败:', error.message);
}
```

### 8.3 获取用户设置

**接口地址**: `settingsService.getUserSettings()`

**功能描述**: 获取当前用户的个人设置

**返回值**: Promise<Object> - 用户设置信息

**使用示例**:
```javascript
try {
  const settings = await settingsService.getUserSettings();
  console.log('用户设置:', settings);
} catch (error) {
  console.error('获取用户设置失败:', error.message);
}
```

### 8.4 更新用户设置

**接口地址**: `settingsService.updateUserSettings(settings)`

**功能描述**: 更新当前用户的个人设置

**参数**:
- `settings` (Object): 设置信息

**返回值**: Promise<Object> - 更新结果

**使用示例**:
```javascript
try {
  const newSettings = {
    theme: 'dark',
    language: 'zh_CN',
    notifications: {
      push: true,
      email: false
    }
  };
  
  const result = await settingsService.updateUserSettings(newSettings);
  console.log('更新用户设置成功:', result);
} catch (error) {
  console.error('更新用户设置失败:', error.message);
}
```

### 8.5 获取隐私设置

**接口地址**: `settingsService.getPrivacySettings()`

**功能描述**: 获取用户的隐私设置

**返回值**: Promise<Object> - 隐私设置信息

**使用示例**:
```javascript
try {
  const privacySettings = await settingsService.getPrivacySettings();
  console.log('隐私设置:', privacySettings);
} catch (error) {
  console.error('获取隐私设置失败:', error.message);
}
```

### 8.6 更新隐私设置

**接口地址**: `settingsService.updatePrivacySettings(settings)`

**功能描述**: 更新用户的隐私设置

**参数**:
- `settings` (Object): 隐私设置信息

**返回值**: Promise<Object> - 更新结果

**使用示例**:
```javascript
try {
  const newPrivacySettings = {
    profileVisibility: 'public',
    showOnlineStatus: false,
    allowDirectMessages: true
  };
  
  const result = await settingsService.updatePrivacySettings(newPrivacySettings);
  console.log('更新隐私设置成功:', result);
} catch (error) {
  console.error('更新隐私设置失败:', error.message);
}
```

## 9. 最佳实践

### 9.1 错误处理

所有服务方法都应该使用try-catch块进行错误处理，并向调用方提供有意义的错误信息。

```javascript
try {
  const result = await someService.someMethod(params);
  // 处理成功结果
} catch (error) {
  console.error('操作失败:', error.message);
  // 可以根据错误类型进行不同的处理
  if (error.code === 'NETWORK_ERROR') {
    wx.showToast({
      title: '网络错误，请检查网络连接',
      icon: 'none'
    });
  } else if (error.code === 'AUTH_ERROR') {
    wx.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    });
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
}
```

### 9.2 参数验证

在调用服务方法前，应该对参数进行验证，确保参数的有效性。

```javascript
// 添加商品到购物车前验证参数
function addToCart(productId, quantity) {
  if (!productId) {
    wx.showToast({
      title: '商品ID不能为空',
      icon: 'none'
    });
    return;
  }
  
  if (!quantity || quantity <= 0) {
    wx.showToast({
      title: '商品数量必须大于0',
      icon: 'none'
    });
    return;
  }
  
  // 参数验证通过，调用服务方法
  CartService.addToCart(productId, quantity)
    .then(result => {
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
    })
    .catch(error => {
      wx.showToast({
        title: error.message || '添加失败',
        icon: 'none'
      });
    });
}
```

### 9.3 加载状态管理

在调用异步服务方法时，应该管理加载状态，提升用户体验。

```javascript
// 在页面中管理加载状态
Page({
  data: {
    loading: false,
    products: []
  },
  
  onLoad() {
    this.loadProducts();
  },
  
  async loadProducts() {
    this.setData({ loading: true });
    
    try {
      const result = await ProductService.getProducts();
      this.setData({ products: result.list });
    } catch (error) {
      console.error('加载商品失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

### 9.4 缓存策略

对于不经常变化的数据，可以实现缓存策略，减少网络请求。

```javascript
// 带缓存的数据获取
async function getCachedData(key, fetchFunction, cacheTime = 5 * 60 * 1000) {
  const cacheKey = `cache_${key}`;
  const cachedData = wx.getStorageSync(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
    return cachedData.data;
  }
  
  try {
    const data = await fetchFunction();
    wx.setStorageSync(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    // 如果有缓存数据但网络请求失败，返回缓存数据
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
}

// 使用示例
async function loadCategories() {
  try {
    const categories = await getCachedData(
      'categories',
      () => ProductService.getCategories(),
      10 * 60 * 1000 // 缓存10分钟
    );
    this.setData({ categories });
  } catch (error) {
    console.error('加载分类失败:', error);
  }
}
```

### 9.5 请求重试机制

对于重要的网络请求，可以实现重试机制，提高请求成功率。

```javascript
// 带重试机制的请求
async function requestWithRetry(requestFunction, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFunction();
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试，直接抛出错误
      if (i === maxRetries) {
        throw error;
      }
      
      // 如果是网络错误，进行重试
      if (error.code === 'NETWORK_ERROR') {
        console.log(`请求失败，${i + 1}/${maxRetries}次重试...`);
        // 指数退避策略
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } else {
        // 非网络错误，直接抛出
        throw error;
      }
    }
  }
  
  throw lastError;
}

// 使用示例
async function loadUserData() {
  try {
    const userData = await requestWithRetry(() => authService.getUserInfo());
    this.setData({ userData });
  } catch (error) {
    console.error('加载用户数据失败:', error);
    wx.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  }
}
```

### 9.6 服务方法组合

对于复杂的业务逻辑，可以组合多个服务方法，提供更高级的业务功能。

```javascript
// 组合多个服务方法实现下单流程
async function placeOrder(orderData) {
  try {
    // 1. 验证用户登录状态
    if (!authService.isLoggedIn()) {
      throw new Error('用户未登录');
    }
    
    // 2. 获取用户默认地址
    let addressId = orderData.addressId;
    if (!addressId) {
      const addresses = await authService.getUserAddresses();
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (!defaultAddress) {
        throw new Error('请选择收货地址');
      }
      addressId = defaultAddress.id;
    }
    
    // 3. 创建订单
    const order = await OrderService.createOrder({
      ...orderData,
      addressId
    });
    
    // 4. 创建支付订单
    const payment = await PaymentService.createPayment({
      orderId: order.id,
      totalAmount: order.totalAmount,
      items: order.items
    });
    
    // 5. 发起支付
    const paymentResult = await PaymentService.initiatePayment({
      orderId: order.id,
      paymentMethod: orderData.paymentMethod
    });
    
    // 6. 调用微信支付
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...paymentResult.paymentParams,
        success: (res) => {
          resolve({ order, payment: paymentResult, result: res });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('下单失败:', error);
    throw error;
  }
}
```

---

**文档版本**: 1.0.0  
**最后更新时间**: 2025年11月23日  
**维护人员**: Sut  
**联系方式**: sut@example.com

### 5.7 获取通知设置

**接口地址**: `notificationService.getNotificationSettings()`

**功能描述**: 获取用户的通知设置

**返回值**: Promise<Object> - 通知设置

**使用示例**:
```javascript
try {
  const settings = await notificationService.getNotificationSettings();
  console.log('通知设置:', settings);
  // 示例输出: {
  //   system: true,
  //   order: true,
  //   promotion: false,
  //   activity: true
  // }
} catch (error) {
  console.error('获取通知设置失败:', error.message);
}
```

### 5.8 更新通知设置

**接口地址**: `notificationService.updateNotificationSettings(settings)`

**功能描述**: 更新用户的通知设置

**参数**:
- `settings` (Object): 通知设置
  - `system` (boolean): 系统通知开关
  - `order` (boolean): 订单通知开关
  - `promotion` (boolean): 促销通知开关
  - `activity` (boolean): 活动通知开关

**返回值**: Promise<Object> - 更新结果

**使用示例**:
```javascript
try {
  const newSettings = {
    system: true,
    order: true,
    promotion: true,  // 开启促销通知
    activity: false   // 关闭活动通知
  };
  
  const result = await notificationService.updateNotificationSettings(newSettings);
  console.log('更新通知设置成功:', result);
} catch (error) {
  console.error('更新通知设置失败:', error.message);
}
```

## 6. 最佳实践

### 6.1 错误处理

所有服务方法都可能抛出异常，建议使用try-catch进行错误处理：

```javascript
try {
  const result = await SomeService.someMethod(params);
  // 处理成功结果
} catch (error) {
  // 统一错误处理
  console.error('操作失败:', error.message);
  wx.showToast({
    title: error.message || '操作失败',
    icon: 'none'
  });
}
```

### 6.2 请求拦截

可以在request工具中添加拦截器，统一处理认证、错误等：

```javascript
// 在utils/request.js中添加请求拦截器
const requestInterceptor = (options) => {
  // 添加Token
  const token = authService.getToken();
  if (token) {
    options.header = options.header || {};
    options.header.Authorization = `Bearer ${token}`;
  }
  
  return options;
};

// 响应拦截器处理通用错误
const responseInterceptor = (response) => {
  if (response.data.code === 401) {
    // Token过期，重新登录
    authService.logout();
    wx.navigateTo({ url: '/pages/login/login' });
  }
  return response;
};
```

### 6.3 数据缓存

对于不经常变化的数据，可以添加缓存机制：

```javascript
// 带缓存的请求封装
async function requestWithCache(key, requestFn, cacheTime = 5 * 60 * 1000) {
  const cachedData = wx.getStorageSync(key);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < cacheTime)) {
    return cachedData.data;
  }
  
  try {
    const data = await requestFn();
    wx.setStorageSync(key, {
      data,
      timestamp: now
    });
    return data;
  } catch (error) {
    // 如果有缓存数据且请求失败，返回缓存数据
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
}

// 使用示例
const categories = await requestWithCache(
  'categories',
  () => CategoryService.getCategoryList(),
  10 * 60 * 1000 // 缓存10分钟
);
```

## 7. 总结

本文档详细描述了SutWxApp微信小程序项目中服务层的API接口，包括认证服务、积分服务、支付服务、通知服务等各个模块的接口说明、参数、返回值和使用示例。开发者应严格遵循接口规范进行开发，并注意错误处理和性能优化。

---

**版本号：1.0.0**
*最后更新时间：2025年11月23日*