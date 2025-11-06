// notification-service.js - 消息通知相关服务模块
// 处理系统消息、评论通知等功能

// 是否使用模拟数据（开发阶段使用）
const USE_MOCK_DATA = true;

import api from './api';
import { getStorage, setStorage } from './global';

// 如果使用模拟数据，则导入模拟数据服务
let mockService;
if (USE_MOCK_DATA) {
  try {
    mockService = require('./notification-mock');
  } catch (e) {
    console.warn('无法导入模拟通知服务:', e);
  }
}

// 缓存配置
const CACHE_DURATION = {
  NOTIFICATIONS: 1 * 60 * 1000 // 1分钟
};

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {string} params.type - 通知类型筛选
 * @param {boolean} params.unread_only - 是否只获取未读通知，默认false
 * @returns {Promise<Object>} - 包含通知列表和总数的对象
 */
export const getNotifications = async (params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 添加可选筛选参数
    if (params.type) {
      queryParams.type = params.type;
    }
    
    if (params.unread_only) {
      queryParams.unread_only = true;
    }
    
    // 生成缓存键（仅第一页使用缓存）
    const cacheKey = `cache_notifications_${JSON.stringify(queryParams)}`;
    
    // 尝试从缓存获取数据（仅第一页且不是只看未读时使用缓存）
    if (queryParams.page === 1 && !params.unread_only) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.NOTIFICATIONS)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const result = await api.get('/notifications', queryParams);
    
    // 缓存第一页数据
    if (queryParams.page === 1 && !params.unread_only) {
      setStorage(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error('获取通知列表失败:', error);
    // 如果启用了模拟数据且有可用的模拟服务，则使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.getNotifications) {
      console.log('使用模拟数据获取通知列表');
      return await mockService.getNotifications(params);
    }
    throw error;
  }
};

/**
 * 获取未读通知数量
 * @returns {Promise<number>} - 未读通知数量
 */
export const getUnreadNotificationCount = async () => {
  try {
    // 调用API
    const result = await api.get('/notifications/unread-count');
    return result.count || 0;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    // 如果启用了模拟数据且有可用的模拟服务，则使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.getUnreadNotificationCount) {
      console.log('使用模拟数据获取未读通知数量');
      return await mockService.getUnreadNotificationCount();
    }
    // 失败时返回0，不影响用户体验
    return 0;
  }
};

/**
 * 标记通知为已读
 * @param {number|string} notificationId - 通知ID
 * @returns {Promise<Object>} - 返回更新后的通知对象
 */
export const markAsRead = async (notificationId) => {
  try {
    // 调用API
    const result = await api.put(`/notifications/${notificationId}/read`);
    
    // 清除缓存，确保下次获取最新数据
    clearNotificationCache();
    
    // 确保结果中包含正确的is_read字段
    if (result && typeof result === 'object') {
      return { ...result, is_read: true };
    }
    
    return result;
  } catch (error) {
    console.error('标记通知已读失败:', error);
    // 如果启用了模拟数据且有可用的模拟服务，则使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.markAsRead) {
      console.log('使用模拟数据标记通知已读');
      clearNotificationCache();
      const mockResult = await mockService.markAsRead(notificationId);
      // 确保模拟结果也包含正确的is_read字段
      if (mockResult && typeof mockResult === 'object') {
        return { ...mockResult, is_read: true };
      }
      return mockResult;
    }
    throw error;
  }
};

/**
 * 标记所有通知为已读
 * @returns {Promise<boolean>} - 是否标记成功
 */
export const markAllAsRead = async () => {
  try {
    // 调用API
    await api.put('/notifications/read-all');
    
    // 清除缓存
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    // 如果启用了模拟数据且有可用的模拟服务，则使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.markAllAsRead) {
      console.log('使用模拟数据标记所有通知已读');
      clearNotificationCache();
      await mockService.markAllAsRead();
      return true;
    }
    throw error;
  }
};

/**
 * 删除通知
 * @param {number|string} notificationId - 通知ID
 * @returns {Promise<boolean>} - 是否删除成功
 */
export const deleteNotification = async (notificationId) => {
  try {
    // 调用API
    await api.delete(`/notifications/${notificationId}`);
    
    // 清除缓存
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('删除通知失败:', error);
    throw error;
  }
};

/**
 * 删除所有通知
 * @returns {Promise<boolean>} - 是否删除成功
 */
export const deleteAllNotifications = async () => {
  try {
    // 调用API
    await api.delete('/notifications');
    
    // 清除缓存
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('删除所有通知失败:', error);
    throw error;
  }
};

/**
 * 获取通知详情
 * @param {number|string} notificationId - 通知ID
 * @returns {Promise<Object>} - 返回通知详情
 */
export const getNotificationDetail = async (notificationId) => {
  try {
    // 尝试从缓存获取
    const cacheKey = `notification_detail_${notificationId}`;
    const cachedData = getStorage(cacheKey);
    if (cachedData) {
      // 异步标记为已读
      if (!cachedData.is_read) {
        markAsRead(notificationId).catch(err => {
          console.error('异步标记已读失败:', err);
        });
      }
      return cachedData;
    }

    // 调用API
    const result = await api.get(`/notifications/${notificationId}`);
    
    // 缓存通知详情
    setStorage(cacheKey, result);
    
    // 自动标记为已读
    if (!result.is_read) {
      await markAsRead(notificationId);
    }
    
    return result;
  } catch (error) {
    console.error('获取通知详情失败:', error);
    // 如果启用了模拟数据且有可用的模拟服务，则使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.getNotificationDetail) {
      console.log('使用模拟数据获取通知详情');
      return await mockService.getNotificationDetail(notificationId);
    }
    throw error;
  }
};

/**
 * 订阅系统通知
 * @param {Object} options - 订阅选项
 * @param {boolean} options.system - 是否订阅系统通知
 * @param {boolean} options.comment - 是否订阅评论通知
 * @param {boolean} options.follow - 是否订阅关注通知
 * @param {boolean} options.like - 是否订阅点赞通知
 * @returns {Promise<Object>} - 返回更新后的订阅设置
 */
export const updateNotificationSettings = async (options = {}) => {
  try {
    // 构建订阅数据
    const settingsData = {
      system: options.system !== undefined ? options.system : true,
      comment: options.comment !== undefined ? options.comment : true,
      follow: options.follow !== undefined ? options.follow : true,
      like: options.like !== undefined ? options.like : true
    };
    
    // 调用API
    return await api.put('/notifications/settings', settingsData);
  } catch (error) {
    console.error('更新通知设置失败:', error);
    throw error;
  }
};

/**
 * 获取通知设置
 * @returns {Promise<Object>} - 返回当前通知设置
 */
export const getNotificationSettings = async () => {
  try {
    // 调用API
    return await api.get('/notifications/settings');
  } catch (error) {
    console.error('获取通知设置失败:', error);
    // 返回默认设置
    return {
      system: true,
      comment: true,
      follow: true,
      like: true
    };
  }
};

/**
 * 处理通知点击事件
 * @param {Object} notification - 通知对象
 * @returns {boolean} - 是否成功处理
 */
export const handleNotificationClick = (notification) => {
  try {
    // 根据通知类型跳转到相应页面
    switch (notification.type) {
      case 'comment':
        // 跳转到评论所在的文章页面，并滚动到评论位置
        wx.navigateTo({
          url: `/pages/article/article?id=${notification.post_id}&comment_id=${notification.comment_id}`
        });
        break;
      
      case 'follow':
        // 跳转到关注者的用户页面
        wx.navigateTo({
          url: `/pages/user/profile?id=${notification.user_id}`
        });
        break;
      
      case 'system':
        // 跳转到系统通知详情页
        wx.navigateTo({
          url: `/pages/notification/detail?id=${notification.id}`
        });
        break;
      
      case 'like':
        // 跳转到点赞所在的内容页面
        if (notification.post_id) {
          wx.navigateTo({
            url: `/pages/article/article?id=${notification.post_id}`
          });
        } else {
          // 默认跳转到通知列表
          wx.navigateTo({
            url: '/pages/notification/list'
          });
        }
        break;
      
      default:
        // 默认跳转到通知列表
        wx.navigateTo({
          url: '/pages/notification/list'
        });
    }
    
    // 标记为已读
    if (!notification.is_read) {
      markAsRead(notification.id).catch(err => {
        console.error('自动标记通知已读失败:', err);
      });
    }
    
    return true;
  } catch (error) {
    console.error('处理通知点击失败:', error);
    return false;
  }
};

/**
 * 清除通知相关缓存
 */
export const clearNotificationCache = () => {
  try {
    const storage = wx.getStorageSync() || {};
    
    // 清除所有通知相关的缓存
    for (const key in storage) {
      if (key.startsWith('cache_notifications_') || key.startsWith('notification_detail_')) {
        wx.removeStorageSync(key);
      }
    }
  } catch (error) {
    console.error('清除通知缓存失败:', error);
  }
};

// 导出所有方法
export default {
  getNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationDetail,
  updateNotificationSettings,
  getNotificationSettings,
  handleNotificationClick,
  clearNotificationCache
};