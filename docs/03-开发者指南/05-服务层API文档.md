﻿﻿﻿﻿# 服务层API文档

<!--

文件名: 05-服务层API文档.md

版本号: 1.0.0

更新日期: 2025-11-30

作者: Sut

描述: 服务层API设计和使用方法
-->

## 目录

[TOC]

## 1. 概述

### 1.1 文档目的

本文档旨在介绍SutWxApp项目的服务层API设计和使用方法，帮助开发者理解和使用服务层API。

### 1.2 服务层设计原则

- **单一职责原则**：每个服务只负责一个功能模块
- **依赖倒置原则**：依赖抽象，不依赖具体实现
- **接口隔离原则**：使用多个专用的接口，而不是一个统一的接口
- **开闭原则**：对扩展开放，对修改关闭
- **可测试性**：服务层API易于测试和调试
- **可扩展性**：服务层API设计具有良好的扩展性

## 2. 服务层架构

### 2.1 服务层定义

服务层位于API层和数据层之间，负责处理业务逻辑，协调多个数据层操作，为API层提供服务支持。

### 2.2 服务层组成

服务层包含以下组件：

- **服务接口**：定义服务的方法和参数
- **服务实现**：实现服务接口的业务逻辑
- **数据访问层**：负责与数据存储交互
- **工具类**：提供通用的辅助方法

### 2.3 服务层调用流程

1. API层调用服务层API
2. 服务层API处理业务逻辑
3. 服务层API调用数据访问层
4. 数据访问层与数据存储交互
5. 数据访问层返回结果给服务层API
6. 服务层API处理结果，返回给API层
7. API层返回结果给客户端

## 3. 服务层API设计规范

### 3.1 命名规范

- 服务接口名称使用大驼峰命名法，后缀为Service，例如：`UserService`
- 服务实现类名称使用大驼峰命名法，后缀为ServiceImpl，例如：`UserServiceImpl`
- 服务方法名称使用小驼峰命名法，动词开头，例如：`getUserById`

### 3.2 方法设计

- 方法参数清晰，类型明确
- 方法返回值类型明确，避免使用Object类型
- 方法抛出明确的异常，避免使用RuntimeException
- 方法注释完整，说明方法的功能、参数、返回值和异常

### 3.3 事务管理

- 服务层方法使用事务管理
- 事务边界清晰，避免长事务
- 事务回滚机制完善

### 3.4 异常处理

- 服务层方法抛出明确的业务异常
- 异常信息清晰，易于理解和调试
- 异常处理机制完善

## 4. 核心服务API

### 4.1 用户服务

#### 4.1.1 接口定义

```javascript
/**
 * 用户服务接口
 */
class UserService {
  /**
   * 根据ID获取用户信息
   * @param {number} id - 用户ID
   * @returns {Promise<User>} 用户信息
   * @throws {Error} 当用户不存在时抛出错误
   */
  async getUserById(id) {}

  /**
   * 根据用户名获取用户信息
   * @param {string} username - 用户名
   * @returns {Promise<User>} 用户信息
   * @throws {Error} 当用户不存在时抛出错误
   */
  async getUserByUsername(username) {}

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<User>} 创建的用户信息
   * @throws {Error} 当用户名已存在时抛出错误
   */
  async createUser(userData) {}

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise<User>} 更新后的用户信息
   * @throws {Error} 当用户不存在时抛出错误
   */
  async updateUser(id, userData) {}

  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise<boolean>} 删除结果
   * @throws {Error} 当用户不存在时抛出错误
   */
  async deleteUser(id) {}
}
```

#### 4.1.2 实现示例

```javascript
/**
 * 用户服务实现
 */
class UserServiceImpl extends UserService {
  constructor(userRepository) {
    super();
    this.userRepository = userRepository;
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`用户不存在，ID: ${id}`);
    }
    return user;
  }

  async getUserByUsername(username) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error(`用户不存在，用户名：${username}`);
    }
    return user;
  }

  async createUser(userData) {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error(`用户名已存在：${userData.username}`);
    }

    // 创建用户
    const user = await this.userRepository.create(userData);
    return user;
  }

  async updateUser(id, userData) {
    // 检查用户是否存在
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error(`用户不存在，ID: ${id}`);
    }

    // 更新用户
    const user = await this.userRepository.update(id, userData);
    return user;
  }

  async deleteUser(id) {
    // 检查用户是否存在
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error(`用户不存在，ID: ${id}`);
    }

    // 删除用户
    const result = await this.userRepository.delete(id);
    return result;
  }
}
```

### 4.2 产品服务

#### 4.2.1 接口定义

```javascript
/**
 * 产品服务接口
 */
class ProductService {
  /**
   * 获取产品列表
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.pageSize - 每页数量
   * @param {number} options.categoryId - 分类ID
   * @param {string} options.keyword - 搜索关键词
   * @returns {Promise<Object>} 产品列表和分页信息
   */
  async getProducts(options) {}

  /**
   * 根据ID获取产品信息
   * @param {number} id - 产品ID
   * @returns {Promise<Product>} 产品信息
   * @throws {Error} 当产品不存在时抛出错误
   */
  async getProductById(id) {}

  /**
   * 创建产品
   * @param {Object} productData - 产品数据
   * @returns {Promise<Product>} 创建的产品信息
   */
  async createProduct(productData) {}

  /**
   * 更新产品信息
   * @param {number} id - 产品ID
   * @param {Object} productData - 产品数据
   * @returns {Promise<Product>} 更新后的产品信息
   * @throws {Error} 当产品不存在时抛出错误
   */
  async updateProduct(id, productData) {}

  /**
   * 删除产品
   * @param {number} id - 产品ID
   * @returns {Promise<boolean>} 删除结果
   * @throws {Error} 当产品不存在时抛出错误
   */
  async deleteProduct(id) {}
}
```

### 4.3 订单服务

#### 4.3.1 接口定义

```javascript
/**
 * 订单服务接口
 */
class OrderService {
  /**
   * 创建订单
   * @param {Object} orderData - 订单数据
   * @returns {Promise<Order>} 创建的订单信息
   * @throws {Error} 当产品库存不足时抛出错误
   */
  async createOrder(orderData) {}

  /**
   * 根据ID获取订单信息
   * @param {number} id - 订单ID
   * @returns {Promise<Order>} 订单信息
   * @throws {Error} 当订单不存在时抛出错误
   */
  async getOrderById(id) {}

  /**
   * 根据用户ID获取订单列表
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.pageSize - 每页数量
   * @param {string} options.status - 订单状态
   * @returns {Promise<Object>} 订单列表和分页信息
   */
  async getOrdersByUserId(userId, options) {}

  /**
   * 更新订单状态
   * @param {number} id - 订单ID
   * @param {string} status - 订单状态
   * @returns {Promise<Order>} 更新后的订单信息
   * @throws {Error} 当订单不存在时抛出错误
   */
  async updateOrderStatus(id, status) {}
}
```

### 4.4 社交服务

#### 4.4.1 接口定义

```javascript
/**
 * 社交服务接口
 */
class SocialService {
  /**
   * 分享产品
   * @param {Object} options - 分享参数
   * @param {string} options.productId - 产品ID
   * @param {string} options.title - 分享标题
   * @param {string} options.description - 分享描述
   * @param {string} options.imageUrl - 分享图片URL
   * @param {string} options.shareChannel - 分享渠道：wechat/friend/circle/qq/weibo
   * @returns {Promise<Object>} 分享结果
   */
  async shareProduct(options) {}

  /**
   * 获取分享记录
   * @param {Object} options - 查询参数
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @param {string} options.sort - 排序方式：newest/oldest
   * @returns {Promise<Object>} 分享记录列表和分页信息
   */
  async getShareRecords(options) {}

  /**
   * 获取分享统计
   * @param {string} productId - 产品ID，不传则获取用户全部记录
   * @returns {Promise<Object>} 分享统计信息
   */
  async getShareStats(productId) {}

  /**
   * 获取产品评论列表
   * @param {Object} options - 查询参数
   * @param {string} options.productId - 产品ID
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @param {string} options.sort - 排序方式：newest/oldest/highest/lowest
   * @param {number} options.minRating - 最低评分，1-5
   * @param {boolean} options.withImages - 是否只启用可见图的评论
   * @returns {Promise<Object>} 评论列表和分页信息
   */
  async getProductComments(options) {}

  /**
   * 添加产品评论
   * @param {Object} data - 评论数据
   * @param {string} data.productId - 产品ID
   * @param {string} data.content - 评论内容
   * @param {number} data.rating - 评分，1-5
   * @param {Array} data.images - 评论图片URL数组
   * @param {boolean} data.anonymous - 是否匿名评论
   * @returns {Promise<Object>} 评论结果
   */
  async addProductComment(data) {}

  /**
   * 添加文章评论
   * @param {Object} data - 评论数据
   * @param {string} data.articleId - 文章ID
   * @param {string} data.content - 评论内容
   * @param {boolean} data.anonymous - 是否匿名评论
   * @returns {Promise<Object>} 评论结果
   */
  async addArticleComment(data) {}

  /**
   * 回复评论
   * @param {Object} data - 回复数据
   * @param {string} data.commentId - 评论ID
   * @param {string} data.content - 回复内容
   * @param {boolean} data.anonymous - 是否匿名回复
   * @returns {Promise<Object>} 回复结果
   */
  async replyComment(data) {}

  /**
   * 删除评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteComment(commentId) {}

  /**
   * 点赞评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<Object>} 点赞结果
   */
  async likeComment(commentId) {}

  /**
   * 取消点赞评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<Object>} 取消点赞结果
   */
  async unlikeComment(commentId) {}

  /**
   * 点赞产品
   * @param {string} productId - 产品ID
   * @returns {Promise<Object>} 点赞结果
   */
  async likeProduct(productId) {}

  /**
   * 取消点赞产品
   * @param {string} productId - 产品ID
   * @returns {Promise<Object>} 取消点赞结果
   */
  async unlikeProduct(productId) {}

  /**
   * 点赞文章
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object>} 点赞结果
   */
  async likeArticle(articleId) {}

  /**
   * 取消点赞文章
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object>} 取消点赞结果
   */
  async unlikeArticle(articleId) {}

  /**
   * 检查是否已点赞
   * @param {Object} options - 检查参数
   * @param {string} options.targetId - 目标ID
   * @param {string} options.targetType - 目标类型：product/article/comment
   * @returns {Promise<Object>} 检查结果
   */
  async checkLikeStatus(options) {}

  /**
   * 获取点赞记录
   * @param {Object} options - 查询参数
   * @param {string} options.targetType - 目标类型：product/article/comment/all
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 点赞记录列表和分页信息
   */
  async getLikeRecords(options) {}
}
```

### 4.5 通知服务

#### 4.5.1 接口定义

```javascript
/**
 * 通知服务接口
 */
class NotificationService {
  /**
   * 获取通知列表
   * @param {Object} options - 查询参数
   * @param {string} options.type - 通知类型：all/system/order/promotion/activity
   * @param {string} options.status - 通知状态：all/read/unread
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 通知列表和分页信息
   */
  async getNotificationList(options) {}

  /**
   * 获取通知详情
   * @param {string} id - 通知ID
   * @returns {Promise<Object>} 通知详情
   * @throws {Error} 当请求的通知不存在时抛出错误
   */
  async getNotificationDetail(id) {}

  /**
   * 标记通知为已读
   * @param {string} id - 通知ID，如果不提供则标记所有未读通知为已读
   * @returns {Promise<Object>} 操作结果
   */
  async markAsRead(id) {}

  /**
   * 删除通知
   * @param {string} id - 通知ID，如果不提供则删除所有已读通知
   * @returns {Promise<Object>} 操作结果
   */
  async deleteNotification(id) {}

  /**
   * 获取未读通知数量
   * @returns {Promise<Object>} 未读通知数量
   */
  async getUnreadCount() {}

  /**
   * 获取通知设置
   * @returns {Promise<Object>} 通知设置
   */
  async getNotificationSettings() {}

  /**
   * 更新通知设置
   * @param {Object} settings - 通知设置
   * @param {boolean} settings.systemNotification - 是否接收系统通知
   * @param {boolean} settings.orderNotification - 是否接收订单通知
   * @param {boolean} settings.promotionNotification - 是否接收促销通知
   * @param {boolean} settings.activityNotification - 是否接收活动通知
   * @returns {Promise<Object>} 更新结果
   */
  async updateNotificationSettings(settings) {}

  /**
   * 订阅推送通知
   * @param {Object} subscription - 订阅信息
   * @param {string} subscription.platform - 平台：ios/android/web
   * @param {string} subscription.token - 设备令牌
   * @param {string} subscription.userId - 用户ID
   * @returns {Promise<Object>} 订阅结果
   * @throws {Error} 当请求的平台或设备令牌为空时抛出错误
   */
  async subscribePushNotification(subscription) {}

  /**
   * 取消订阅推送通知
   * @param {string} token - 设备令牌
   * @returns {Promise<Object>} 取消订阅结果
   * @throws {Error} 当请求的设备令牌为空时抛出错误
   */
  async unsubscribePushNotification(token) {}

  /**
   * 发送自定义通知（管理员功能）
   * @param {Object} notification - 通知内容
   * @param {string} notification.title - 通知标题
   * @param {string} notification.content - 通知内容
   * @param {string} notification.type - 通知类型
   * @param {Array} notification.targetUsers - 目标用户ID列表，为空则发送给所有用户
   * @returns {Promise<Object>} 发送结果
   * @throws {Error} 当请求的通知标题、内容和类型为空时抛出错误
   */
  async sendNotification(notification) {}

  /**
   * 发送订阅消息
   * @param {Object} message - 消息内容
   * @param {string} message.templateId - 模板ID
   * @param {Object} message.data - 消息数据
   * @param {string} message.openId - 用户openId
   * @param {number} retries - 当前重试次数
   * @returns {Promise<Object>} 发送结果
   * @throws {Error} 当请求的模板ID、消息数据和用户openId为空时抛出错误
   */
  async sendSubscribeMessage(message, retries) {}

  /**
   * 将消息加入重试队列
   * @param {Object} message - 消息内容
   * @param {number} retries - 当前重试次数
   */
  addToRetryQueue(message, retries) {}

  /**
   * 处理重试队列
   */
  processRetryQueue() {}

  /**
   * 获取重试队列状态
   * @returns {Object} 重试队列状态
   */
  getRetryQueueStatus() {}

  /**
   * 清空重试队列
   */
  clearRetryQueue() {}
}
```

## 5. 服务层API使用示例

### 5.1 依赖注入

服务层API使用依赖注入的方式进行实例化和调用，例如：

```javascript
// 使用依赖注入容器
const container = require('../config/container');

// 获取用户服务实例
const userService = container.get('UserService');

// 调用用户服务方法
const user = await userService.getUserById(1);
```

### 5.2 事务管理

服务层API使用事务管理，例如：

```javascript
/**
 * 创建订单（包含事务）
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Order>} 创建的订单信息
 */
async createOrder(orderData) {
  // 开启事务
  return this.transaction(async (transaction) => {
    // 检查产品库存
    for (const item of orderData.products) {
      const product = await this.productRepository.findById(item.productId, transaction);
      if (!product) {
        throw new Error(`产品不存在，ID: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`产品库存不足，ID: ${item.productId}`);
      }
      // 扣减库存
      await this.productRepository.updateStock(item.productId, product.stock - item.quantity, transaction);
    }

    // 创建订单
    const order = await this.orderRepository.create(orderData, transaction);
    return order;
  });
}
```

### 5.3 异常处理

服务层API使用异常处理，例如：

```javascript
// API层调用服务层API
try {
  const order = await orderService.createOrder(orderData);
  res.json({
    code: 200,
    message: 'success',
    data: order
  });
} catch (error) {
  res.status(400).json({
    code: 400,
    message: error.message,
    data: null
  });
}
```

## 6. 服务层API测试

### 6.1 单元测试

服务层API的单元测试使用测试框架，例如：Jest、Mocha，测试服务层API的业务逻辑，例如：

```javascript
const { expect } = require('chai');
const sinon = require('sinon');
const UserServiceImpl = require('../services/impl/UserServiceImpl');
const UserRepository = require('../repositories/UserRepository');

describe('UserService', () => {
  let userService;
  let userRepository;

  beforeEach(() => {
    // 创建用户仓库模拟
    userRepository = sinon.createStubInstance(UserRepository);
    // 创建用户服务实例
    userService = new UserServiceImpl(userRepository);
  });

  describe('getUserById', () => {
    it('should return user when user exists', async () => {
      // 模拟用户仓库返回用户
      const user = { id: 1, username: 'test', email: 'test@example.com' };
      userRepository.findById.resolves(user);

      // 调用用户服务方法
      const result = await userService.getUserById(1);

      // 验证结果
      expect(result).to.deep.equal(user);
      expect(userRepository.findById.calledOnceWith(1)).to.be.true;
    });

    it('should throw error when user does not exist', async () => {
      // 模拟用户仓库返回null
      userRepository.findById.resolves(null);

      // 调用用户服务方法，验证是否抛出错误
      try {
        await userService.getUserById(1);
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error.message).to.equal('用户不存在，ID: 1');
      }
    });
  });
});
```

### 6.2 集成测试

服务层API的集成测试测试服务层API与数据访问层的交互，例如：

```javascript
const { expect } = require('chai');
const UserService = require('../services/UserService');
const UserRepository = require('../repositories/UserRepository');
const db = require('../config/database');

describe('UserService Integration Test', () => {
  let userService;
  let userRepository;

  beforeEach(async () => {
    // 初始化数据库连接
    await db.connect();
    // 创建用户仓库实例
    userRepository = new UserRepository(db);
    // 创建用户服务实例
    userService = new UserService(userRepository);
    // 清空用户表
    await db.query('DELETE FROM users');
  });

  afterEach(async () => {
    // 关闭数据库连接
    await db.disconnect();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // 准备测试数据
      const userData = {
        username: 'test',
        password: 'password',
        email: 'test@example.com'
      };

      // 调用用户服务方法
      const user = await userService.createUser(userData);

      // 验证结果
      expect(user).to.have.property('id');
      expect(user.username).to.equal(userData.username);
      expect(user.email).to.equal(userData.email);

      // 验证数据库中是否存在该用户
      const dbUser = await userRepository.findByUsername(userData.username);
      expect(dbUser).to.not.be.null;
      expect(dbUser.id).to.equal(user.id);
    });
  });
});
```

## 7. 相关链接

- [API接口文档.md](./03-API接口文档.md)
- [API开发指南.md](./04-API开发指南.md)
- [权限配置文档.md](./06-权限配置文档.md)