/**
 * 文件名: notificationService.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 描述: 通知服务，包含用户通知重试机制 */

const request = require('../utils/request');

// 订阅消息重试配置
const RETRY_CONFIG = {
  MAX_RETRIES: 3, // 最大重试次数
  INITIAL_DELAY: 1000, // 初始重试延迟（毫秒）
  BACKOFF_FACTOR: 2, // 指数退避因子
  MAX_DELAY: 30000 // 最大重试延迟（毫秒）
};

// 重试队列
let retryQueue = [];
// 重试队列是否正在处理
let isProcessingRetryQueue = false;

const notificationService = {
  /**
   * 获取通知列表
   * @param {Object} options - 查询参数
   * @param {string} options.type - 通知类型：all/system/order/promotion/activity
   * @param {string} options.status - 通知状态：all/read/unread
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 通知列表和分页信息
   */
  getNotificationList(options = {}) {
    const params = {
      type: options.type || 'all',
      status: options.status || 'all',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get('/notifications', params);
  },

  /**
   * 获取通知详情
   * @param {string} id - 通知ID
   * @returns {Promise<Object>} 通知详情
   */
  getNotificationDetail(id) {
    if (!id) {
      return Promise.reject(new Error('通知ID不能为空'));
    }
    
    return request.get(`/notifications/${id}`);
  },

  /**
   * 标记通知为已读
   * @param {string} id - 通知ID，如果不提供则标记所有未读通知为已读
   * @returns {Promise<Object>} 操作结果
   */
  markAsRead(id) {
    if (id) {
      return request.put(`/notifications/${id}/read`);
    } else {
      return request.put('/notifications/read-all');
    }
  },

  /**
   * 删除通知
   * @param {string} id - 通知ID，如果不提供则删除所有已读通知
   * @returns {Promise<Object>} 操作结果
   */
  deleteNotification(id) {
    if (id) {
      return request.delete(`/notifications/${id}`);
    } else {
      return request.delete('/notifications/clear-read');
    }
  },

  /**
   * 获取未读通知数量
   * @returns {Promise<Object>} 未读通知数量
   */
  getUnreadCount() {
    return request.get('/notifications/unread-count');
  },

  /**
   * 获取通知设置
   * @returns {Promise<Object>} 通知设置
   */
  getNotificationSettings() {
    return request.get('/notifications/settings');
  },

  /**
   * 更新通知设置
   * @param {Object} settings - 通知设置
   * @param {boolean} settings.systemNotification - 是否接收系统通知
   * @param {boolean} settings.orderNotification - 是否接收订单通知
   * @param {boolean} settings.promotionNotification - 是否接收促销通知
   * @param {boolean} settings.activityNotification - 是否接收活动通知
   * @returns {Promise<Object>} 更新结果
   */
  updateNotificationSettings(settings) {
    return request.put('/notifications/settings', settings);
  },

  /**
   * 订阅推送通知
   * @param {Object} subscription - 订阅信息
   * @param {string} subscription.platform - 平台：ios/android/web
   * @param {string} subscription.token - 设备令牌
   * @param {string} subscription.userId - 用户ID
   * @returns {Promise<Object>} 订阅结果
   */
  subscribePushNotification(subscription) {
    if (!subscription.platform || !subscription.token) {
      return Promise.reject(new Error('平台和设备令牌不能为空'));
    }
    
    return request.post('/notifications/subscribe', subscription);
  },

  /**
   * 取消订阅推送通知
   * @param {string} token - 设备令牌
   * @returns {Promise<Object>} 取消订阅结果
   */
  unsubscribePushNotification(token) {
    if (!token) {
      return Promise.reject(new Error('设备令牌不能为空'));
    }
    
    return request.post('/notifications/unsubscribe', { token });
  },

  /**
   * 发送自定义通知（管理员功能）
   * @param {Object} notification - 通知内容
   * @param {string} notification.title - 通知标题
   * @param {string} notification.content - 通知内容
   * @param {string} notification.type - 通知类型
   * @param {Array} notification.targetUsers - 目标用户ID列表，为空则发送给所有用户
   * @returns {Promise<Object>} 发送结果
   */
  sendNotification(notification) {
    if (!notification.title || !notification.content || !notification.type) {
      return Promise.reject(new Error('通知标题、内容和类型不能为空'));
    }
    
    return request.post('/notifications/send', notification);
  },

  /**
   * 发送订阅消息
   * @param {Object} message - 消息内容
   * @param {string} message.templateId - 模板ID
   * @param {Object} message.data - 消息数据
   * @param {string} message.openId - 用户openId
   * @param {number} retries - 当前重试次数
   * @returns {Promise<Object>} 发送结果
   */
  sendSubscribeMessage(message, retries = 0) {
    if (!message.templateId || !message.data || !message.openId) {
      return Promise.reject(new Error('模板ID、消息数据和用户openId不能为空'));
    }
    
    return request.post('/notifications/subscribe-message', message)
      .catch(error => {
        // 如果重试次数未达到最大值，将消息加入重试队列
        if (retries < RETRY_CONFIG.MAX_RETRIES) {
          this.addToRetryQueue(message, retries + 1);
          return Promise.resolve({ success: false, retry: true, retryCount: retries + 1 });
        }
        // 重试次数达到最大值，返回错误
        return Promise.reject(new Error(`发送订阅消息失败，已重试${retries}次: ${error.message}`));
      });
  },

  /**
   * 将消息加入重试队列
   * @param {Object} message - 消息内容
   * @param {number} retries - 当前重试次数
   */
  addToRetryQueue(message, retries) {
    const delay = Math.min(
      RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retries - 1),
      RETRY_CONFIG.MAX_DELAY
    );
    
    retryQueue.push({
      message,
      retries,
      delay,
      timestamp: Date.now() + delay
    });
    
    // 如果重试队列未在处理中，启动处理
    if (!isProcessingRetryQueue) {
      this.processRetryQueue();
    }
  },

  /**
   * 处理重试队列
   */
  processRetryQueue() {
    if (isProcessingRetryQueue || retryQueue.length === 0) {
      return;
    }
    
    isProcessingRetryQueue = true;
    
    // 按时间戳排序，先处理最早需要重试的消息
    retryQueue.sort((a, b) => a.timestamp - b.timestamp);
    
    const processNext = () => {
      if (retryQueue.length === 0) {
        isProcessingRetryQueue = false;
        return;
      }
      
      const now = Date.now();
      const nextItem = retryQueue[0];
      
      // 如果还没到重试时间，设置定时器
      if (nextItem.timestamp > now) {
        setTimeout(() => {
          this.sendSubscribeMessage(nextItem.message, nextItem.retries)
            .finally(processNext);
          retryQueue.shift();
        }, nextItem.timestamp - now);
      } else {
        // 到了重试时间，立即发送
        this.sendSubscribeMessage(nextItem.message, nextItem.retries)
          .finally(processNext);
        retryQueue.shift();
      }
    };
    
    processNext();
  },

  /**
   * 获取重试队列状态
   * @returns {Object} 重试队列状态
   */
  getRetryQueueStatus() {
    return {
      queueLength: retryQueue.length,
      isProcessing: isProcessingRetryQueue
    };
  },

  /**
   * 清空重试队列
   */
  clearRetryQueue() {
    retryQueue = [];
    isProcessingRetryQueue = false;
  }
};

module.exports = notificationService;