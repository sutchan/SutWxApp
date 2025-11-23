/**
 * 通知服务
 * 提供通知相关的API调用封装
 */

const request = require('../utils/request');

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
  }
};

module.exports = notificationService;