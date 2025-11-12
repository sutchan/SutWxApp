/**
 * notification-service.js - 通知服务模块
 * 提供通知列表、未读消息管理、通知点击处理等功能
 */

const USE_MOCK_DATA = true;

const api = require('./api');
const { getStorage, setStorage } = require('./global');

// 模拟数据服务
let mockService;
if (USE_MOCK_DATA) {
  try {
    mockService = require('./notification-mock');
  } catch (e) {
    console.warn('加载模拟数据服务失败:', e);
  }
}

// 缓存时长设置
const CACHE_DURATION = {
  NOTIFICATIONS: 1 * 60 * 1000 // 1分钟缓存
};

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @param {string} params.type - 通知类型，可选
 * @param {boolean} params.unread_only - 是否只获取未读通知，默认为false
 * @returns {Promise<Object>} - 返回通知列表和分页信息
 */
const getNotifications = async (params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 添加可选参数
    if (params.type) {
      queryParams.type = params.type;
    }
    
    if (params.unread_only) {
      queryParams.unread_only = true;
    }
    
    // 生成缓存键
    const cacheKey = `cache_notifications_${JSON.stringify(queryParams)}`;
    
    // 首页数据缓存处理
    if (queryParams.page === 1 && !params.unread_only) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.NOTIFICATIONS)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const result = await api.get('/api/notifications', queryParams);
    
    // 缓存结果
    if (queryParams.page === 1 && !params.unread_only) {
      setStorage(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error('获取通知列表失败:', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.getNotifications) {
      console.log('使用模拟数据服务获取通知列表');
      return await mockService.getNotifications(params);
    }
    throw error;
  }
};

/**
 * 获取未读通知数量
 * @returns {Promise<number>} - 未读通知数量
 */
const getUnreadNotificationCount = async () => {
  try {
    // 调用API
    const result = await api.get('/api/notifications/unread-count');
    return result.count || 0;
  } catch (error) {
    console.error('获取未读通知数量失败', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.getUnreadNotificationCount) {
      console.log('使用模拟数据服务获取未读通知数量');
      return await mockService.getUnreadNotificationCount();
    }
    // 失败时返回0
    return 0;
  }
};

/**
 * 标记通知为已读
 * @param {number|string} notificationId - 通知ID
 * @returns {Promise<Object>} - 返回操作结果
 */
const markAsRead = async (notificationId) => {
  try {
    // 调用API
    const result = await api.put(`/api/notifications/${notificationId}/read`);
    
    // 清除相关缓存
    clearNotificationCache();
    
    return result;
  } catch (error) {
    console.error('标记通知已读失败:', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.markAsRead) {
      console.log('使用模拟数据服务标记通知已读');
      const result = await mockService.markAsRead(notificationId);
      clearNotificationCache();
      return result;
    }
    throw error;
  }
};

/**
 * 标记所有通知为已读
 * @returns {Promise<boolean>} - 返回操作结果
 */
const markAllAsRead = async () => {
  try {
    // 调用API
    await api.put('/api/notifications/read-all');
    
    // 清除缓存
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.markAllAsRead) {
      console.log('使用模拟数据服务标记所有通知已读');
      await mockService.markAllAsRead();
      clearNotificationCache();
      return true;
    }
    throw error;
  }
};

/**
 * 删除通知
 * @param {number|string} notificationId - 通知ID
 * @returns {Promise<boolean>} - 返回操作结果
 */
const deleteNotification = async (notificationId) => {
  try {
    // 调用API
    await api.delete(`/api/notifications/${notificationId}`);
    
    // 清除缓存
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('删除通知失败:', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.deleteNotification) {
      console.log('使用模拟数据服务删除通知');
      await mockService.deleteNotification(notificationId);
      clearNotificationCache();
      return true;
    }
    throw error;
  }
};

/**
 * 删除所有通知
 * @returns {Promise<boolean>} - 返回操作结果
 */
const deleteAllNotifications = async () => {
  try {
    // 调用API
    await api.delete('/api/notifications/all');
    
    // 清除缓存
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('删除所有通知失败:', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.deleteAllNotifications) {
      console.log('使用模拟数据服务删除所有通知');
      await mockService.deleteAllNotifications();
      clearNotificationCache();
      return true;
    }
    throw error;
  }
};

/**
 * 获取通知详情
 * @param {number|string} notificationId - 通知ID
 * @returns {Promise<Object>} - 返回通知详情
 */
const getNotificationDetail = async (notificationId) => {
  try {
    // 调用API
    const notification = await api.get(`/api/notifications/${notificationId}`);
    
    // 如果通知未读，自动标记为已读
    if (!notification.is_read) {
      try {
        await api.put(`/api/notifications/${notificationId}/read`);
      } catch (e) {
        // 标记已读失败不影响返回结果
        console.warn('自动标记通知已读失败:', e);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('获取通知详情失败:', error);
    // 失败时尝试使用模拟数据
    if (USE_MOCK_DATA && mockService && mockService.getNotificationDetail) {
      console.log('使用模拟数据服务获取通知详情');
      return await mockService.getNotificationDetail(notificationId);
    }
    throw error;
  }
};

/**
 * 更新通知设置
 * @param {Object} options - 设置选项
 * @returns {Promise<Object>} - 返回更新后的设置
 */
const updateNotificationSettings = async (options = {}) => {
  try {
    // 调用API
    return await api.put('/api/notifications/settings', options);
  } catch (error) {
    console.error('更新通知设置失败:', error);
    throw error;
  }
};

/**
 * 获取通知设置
 * @returns {Promise<Object>} - 返回通知设置
 */
const getNotificationSettings = async () => {
  try {
    // 调用API
    return await api.get('/api/notifications/settings');
  } catch (error) {
    console.error('获取通知设置失败:', error);
    
    // 失败时返回默认设置
    return {
      enable_push: true,
      enable_email: false,
      notification_types: {
        system: true,
        comment: true,
        like: true,
        favorite: true
      }
    };
  }
};

/**
 * 处理通知点击
 * @param {Object} notification - 通知对象
 */
const handleNotificationClick = (notification) => {
  try {
    // 解析通知数据
    const notificationData = notification.data || {};
    const type = notification.type;
    
    // 根据不同类型跳转到相应页面
    switch (type) {
      case 'system':
        // 系统通知，跳转到通知列表
        wx.navigateTo({
          url: '/pages/notification/notification'
        });
        break;
        
      case 'comment':
        // 评论通知，跳转到文章详情并滚动到评论区
        if (notificationData.post_id) {
          wx.navigateTo({
            url: `/pages/article/detail?id=${notificationData.post_id}&scrollTo=comments`
          });
        }
        break;
        
      case 'like':
        // 点赞通知，跳转到文章详情
        if (notificationData.post_id) {
          wx.navigateTo({
            url: `/pages/article/detail?id=${notificationData.post_id}`
          });
        }
        break;
        
      case 'favorite':
        // 收藏通知，跳转到用户收藏页面
        wx.navigateTo({
          url: '/pages/user/favorites'
        });
        break;
        
      case 'following':
        // 关注通知，跳转到用户主页
        if (notificationData.user_id) {
          wx.navigateTo({
            url: `/pages/user/profile?id=${notificationData.user_id}`
          });
        }
        break;
        
      case 'activity':
        // 活动通知，跳转到活动详情
        if (notificationData.activity_id) {
          wx.navigateTo({
            url: `/pages/activity/detail?id=${notificationData.activity_id}`
          });
        }
        break;
        
      default:
        // 默认跳转到通知详情
        if (notification.id) {
          wx.navigateTo({
            url: `/pages/notification/detail?id=${notification.id}`
          });
        } else {
          wx.navigateTo({
            url: '/pages/notification/notification'
          });
        }
    }
    
    // 标记通知为已读
    if (!notification.is_read && notification.id) {
      markAsRead(notification.id).catch(err => {
        console.warn('标记通知已读失败:', err);
      });
    }
  } catch (error) {
    console.error('处理通知点击失败:', error);
    // 失败时跳转到通知列表
    wx.navigateTo({
      url: '/pages/notification/notification'
    });
  }
};

/**
 * 清除通知相关缓存
 */
const clearNotificationCache = () => {
  try {
    // 获取所有存储键
    const keys = Object.keys(getStorage() || {});
    
    // 找出所有通知相关的缓存键
    const notificationKeys = keys.filter(key => 
      key.startsWith('cache_notifications_')
    );
    
    // 清除每个缓存键
    notificationKeys.forEach(key => {
      try {
        wx.removeStorageSync(key);
      } catch (e) {
        console.warn(`清除缓存键 ${key} 失败:`, e);
      }
    });
    
  } catch (error) {
    console.error('清除通知缓存失败:', error);
  }
};

// 导出模块
module.exports = {
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
