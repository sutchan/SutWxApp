/**
 * user-service.js - 用户服务模块
 * 提供用户信息管理、设置管理等API调用功能
 */

const { request } = require('./api');
const { showToast } = require('./global');

// 存储键定义
const USER_INFO_KEY = 'user_info';
const USER_PREFERENCES_KEY = 'user_preferences';
const CACHE_PREFIX = 'user_cache_';
const DEFAULT_CACHE_EXPIRY = 300; // 默认缓存5分钟

// 缓存键常量
const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_COUPONS: 'user_coupons',
  USER_ADDRESSES: 'user_addresses',
  USER_POINTS: 'user_points',
  USER_SIGNIN_HISTORY: 'user_signin_history',
  USER_SIGNIN_STATUS: 'user_signin_status',
  USER_SETTINGS: 'user_settings',
  USER_PRIVACY_SETTINGS: 'user_privacy_settings',
  USER_STATS: 'user_stats',
  USER_NOTIFICATION_SETTINGS: 'user_notification_settings',
  USER_FOLLOWING: 'user_following',
  USER_FOLLOWERS: 'user_followers',
  USER_FAVORITES: 'user_favorites',
  USER_COMMENTS: 'user_comments',
  USER_POINTS_HISTORY: 'user_points_history',
  USER_RECOMMENDATIONS: 'user_recommendations',
  AVAILABLE_COUPONS: 'available_coupons'
};

// 缓存管理器
const cacheManager = {
  // 设置缓存
  set(key, value, expiry = DEFAULT_CACHE_EXPIRY) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheData = {
        value,
        expiry: Date.now() + expiry * 1000
      };
      wx.setStorageSync(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('设置缓存失败', error);
    }
  },

  // 获取缓存
  get(key) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheDataStr = wx.getStorageSync(cacheKey);
      if (!cacheDataStr) return null;

      const cacheData = JSON.parse(cacheDataStr);
      if (cacheData.expiry && Date.now() > cacheData.expiry) {
        // 缓存过期，移除缓存
        this.remove(key);
        return null;
      }

      return cacheData.value;
    } catch (error) {
      console.error('获取缓存失败', error);
      return null;
    }
  },

  // 移除缓存
  remove(key) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      wx.removeStorageSync(cacheKey);
    } catch (error) {
      console.error('移除缓存失败', error);
    }
  },

  // 清空所有缓存
  clearAll() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('清空缓存失败', error);
    }
  }
};

// 重试请求函数
const retryRequest = async (requestFn, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试，则不再重试
      if (i === maxRetries) break;
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// 验证器工具
const validator = {
  isString(value) {
    return typeof value === 'string' && value.trim() !== '';
  },
  
  isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  },
  
  isArray(value) {
    return Array.isArray(value);
  },
  
  isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  },
  
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

const userService = {
  /**
   * 获取用户资料
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 用户资料
   */
  async getUserProfile(forceRefresh = false) {
    // 如果不强制刷新，先尝试从缓存获取
    if (!forceRefresh) {
      const cachedProfile = cacheManager.get(CACHE_KEYS.USER_PROFILE);
      if (cachedProfile) {
        return cachedProfile;
      }
    }

    try {
      const profile = await retryRequest(() => 
        request({
          url: '/api/user/profile',
          method: 'GET'
        })
      );
      
      // 存入缓存
      cacheManager.set(CACHE_KEYS.USER_PROFILE, profile, 300); // 5分钟缓存
      
      // 更新用户信息
      this.cacheUserInfo(profile);
      
      return profile;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      // 如果是网络错误，尝试使用缓存
      if (error.message && error.message.includes('网络')) {
        const cachedProfile = cacheManager.get(CACHE_KEYS.USER_PROFILE);
        if (cachedProfile) {
          console.log('使用缓存中的用户资料');
          return cachedProfile;
        }
      }
      throw error;
    }
  },

  /**
   * 更新用户资料
   * @param {Object} profileData - 用户资料数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserProfile(profileData) {
    // 参数验证
    if (!validator.isObject(profileData)) {
      throw new Error('用户资料数据格式不正确');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/api/user/profile',
          method: 'PUT',
          data: profileData
        })
      );
      
      // 清除缓存，下次需要重新获取
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      // 更新缓存的用户信息
      const userInfo = this.getCachedUserInfo();
      if (userInfo) {
        this.cacheUserInfo({ ...userInfo, ...profileData });
      }
      
      return result;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户设置
   * @returns {Promise<Object>} 用户设置
   */
  async getUserSettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('获取用户设置失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户设置
   * @param {Object} settings - 设置数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserSettings(settings) {
    // 参数验证
    if (!validator.isObject(settings)) {
      throw new Error('设置数据格式不正确');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/settings',
          method: 'PUT',
          data: settings
        })
      );
    } catch (error) {
      console.error('更新用户设置失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户隐私设置
   * @returns {Promise<Object>} 用户隐私设置
   */
  async getUserPrivacySettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/privacy',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('获取用户隐私设置失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户隐私设置
   * @param {Object} privacySettings - 隐私设置数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserPrivacySettings(privacySettings) {
    // 参数验证
    if (!validator.isObject(privacySettings)) {
      throw new Error('隐私设置数据格式不正确');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/privacy',
          method: 'PUT',
          data: privacySettings
        })
      );
    } catch (error) {
      console.error('更新用户隐私设置失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>} 用户统计信息
   */
  async getUserStats() {
    try {
      const stats = await retryRequest(() => 
        request({
          url: '/api/user/stats',
          method: 'GET'
        })
      );
      
      // 存入缓存
      cacheManager.set(CACHE_KEYS.USER_STATS, stats, 300); // 5分钟缓存
      
      return stats;
    } catch (error) {
      console.error('获取用户统计信息失败:', error);
      // 尝试使用缓存
      const cachedStats = cacheManager.get(CACHE_KEYS.USER_STATS);
      if (cachedStats) {
        return cachedStats;
      }
      throw error;
    }
  },

  /**
   * 上传用户头像
   * @param {string} filePath - 图片文件路径
   * @returns {Promise<Object>} 上传结果
   */
  async uploadAvatar(filePath) {
    // 参数验证
    if (!validator.isString(filePath)) {
      throw new Error('文件路径不能为空');
    }

    try {
      // 使用微信上传文件API
      return await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: wx.getStorageSync('apiBaseUrl') + '/api/user/avatar',
          filePath: filePath,
          name: 'avatar',
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (data.code === 0) {
                // 清除用户资料缓存
                cacheManager.remove(CACHE_KEYS.USER_PROFILE);
                resolve(data.data);
              } else {
                reject(new Error(data.message || '上传头像失败'));
              }
            } catch (e) {
              reject(new Error('服务器返回数据格式错误'));
            }
          },
          fail: (err) => {
            reject(new Error('上传头像失败: ' + (err.errMsg || '未知错误')));
          }
        });
      });
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  },

  /**
   * 绑定账号
   * @param {Object} bindData - 绑定数据
   * @returns {Promise<Object>} 绑定结果
   */
  async bindAccount(bindData) {
    // 参数验证
    if (!validator.isObject(bindData)) {
      throw new Error('绑定数据格式不正确');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/bind',
          method: 'POST',
          data: bindData
        })
      );
    } catch (error) {
      console.error('绑定账号失败:', error);
      throw error;
    }
  },

  /**
   * 解绑账号
   * @param {string} type - 解绑类型
   * @returns {Promise<Object>} 解绑结果
   */
  async unbindAccount(type) {
    // 参数验证
    if (!validator.isString(type)) {
      throw new Error('解绑类型不能为空');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/unbind',
          method: 'POST',
          data: { type }
        })
      );
    } catch (error) {
      console.error('解绑账号失败:', error);
      throw error;
    }
  },

  /**
   * 获取通知设置
   * @returns {Promise<Object>} 通知设置
   */
  async getNotificationSettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/notifications/settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('获取通知设置失败:', error);
      throw error;
    }
  },

  /**
   * 更新通知设置
   * @param {Object} notificationSettings - 通知设置数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateNotificationSettings(notificationSettings) {
    // 参数验证
    if (!validator.isObject(notificationSettings)) {
      throw new Error('通知设置数据格式不正确');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/notifications/settings',
          method: 'PUT',
          data: notificationSettings
        })
      );
    } catch (error) {
      console.error('更新通知设置失败:', error);
      throw error;
    }
  },

  /**
   * 收藏文章
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object>} 收藏结果
   */
  async favoriteArticle(articleId) {
    // 参数验证
    if (!validator.isString(articleId)) {
      throw new Error('文章ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/api/user/favorites',
          method: 'POST',
          data: { article_id: articleId }
        })
      );
      
      // 清除收藏缓存
      this.clearSpecificCache('favorites');
      
      return result;
    } catch (error) {
      console.error('收藏文章失败:', error);
      throw error;
    }
  },

  /**
   * 取消收藏文章
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object>} 取消收藏结果
   */
  async unfavoriteArticle(articleId) {
    // 参数验证
    if (!validator.isString(articleId)) {
      throw new Error('文章ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/api/user/favorites',
          method: 'DELETE',
          data: { article_id: articleId }
        })
      );
      
      // 清除收藏缓存
      this.clearSpecificCache('favorites');
      
      return result;
    } catch (error) {
      console.error('取消收藏文章失败:', error);
      throw error;
    }
  },

  /**
   * 检查文章是否已收藏
   * @param {string} articleId - 文章ID
   * @returns {Promise<boolean>} 是否已收藏
   */
  async checkFavorite(articleId) {
    // 参数验证
    if (!validator.isString(articleId)) {
      throw new Error('文章ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/api/user/favorites/check`,
          method: 'GET',
          params: { article_id: articleId }
        })
      );
      
      return result.data.is_favorite || false;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户收藏列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页数量，默认10
   * @returns {Promise<Object>} 收藏列表和分页信息
   */
  async getUserFavorites(params = { page: 1, page_size: 10 }) {
    try {
      // 构建缓存键
      const cacheKey = `${CACHE_KEYS.USER_FAVORITES}_${params.page}_${params.page_size}`;
      
      // 尝试从缓存获取
      const cachedFavorites = cacheManager.get(cacheKey);
      if (cachedFavorites) {
        return cachedFavorites;
      }
      
      const result = await retryRequest(() => 
        request({
          url: '/api/user/favorites',
          method: 'GET',
          params: params
        })
      );
      
      // 存入缓存
      cacheManager.set(cacheKey, result, 300); // 5分钟缓存
      
      return result;
    } catch (error) {
      console.error('获取用户收藏列表失败:', error);
      throw error;
    }
  },

  /**
   * 缓存用户信息到本地存储
   * @param {Object} userInfo - 用户信息
   */
  cacheUserInfo(userInfo) {
    try {
      wx.setStorageSync(USER_INFO_KEY, userInfo);
    } catch (error) {
      console.error('缓存用户信息失败:', error);
    }
  },

  /**
   * 获取缓存的用户信息
   * @returns {Object|null} 用户信息
   */
  getCachedUserInfo() {
    try {
      return wx.getStorageSync(USER_INFO_KEY) || null;
    } catch (error) {
      console.error('获取缓存的用户信息失败:', error);
      return null;
    }
  },

  /**
   * 清除缓存的用户信息
   */
  clearCachedUserInfo() {
    try {
      wx.removeStorageSync(USER_INFO_KEY);
      this.clearUserCache();
    } catch (error) {
      console.error('清除缓存的用户信息失败:', error);
    }
  },

  /**
   * 获取用户关注列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页数量，默认20
   * @returns {Promise<Object>} 关注列表和分页信息
   */
  async getUserFollowing(params = { page: 1, page_size: 20 }) {
    try {
      const result = await retryRequest(() => 
        request({
          url: '/api/user/following',
          method: 'GET',
          params: params
        })
      );
      
      return result;
    } catch (error) {
      console.error('获取用户关注列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户粉丝列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页数量，默认20
   * @returns {Promise<Object>} 粉丝列表和分页信息
   */
  async getUserFollowers(params = { page: 1, page_size: 20 }) {
    try {
      const result = await retryRequest(() => 
        request({
          url: '/api/user/followers',
          method: 'GET',
          params: params
        })
      );
      
      return result;
    } catch (error) {
      console.error('获取用户粉丝列表失败:', error);
      throw error;
    }
  },

  /**
   * 关注用户
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 关注结果
   */
  async followUser(userId) {
    // 参数验证
    if (!validator.isString(userId)) {
      throw new Error('用户ID不能为空');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/follow',
          method: 'POST',
          data: { user_id: userId }
        })
      );
    } catch (error) {
      console.error('关注用户失败:', error);
      throw error;
    }
  },

  /**
   * 取消关注用户
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 取消关注结果
   */
  async unfollowUser(userId) {
    // 参数验证
    if (!validator.isString(userId)) {
      throw new Error('用户ID不能为空');
    }

    try {
      return await retryRequest(() => 
        request({
          url: '/api/user/follow',
          method: 'DELETE',
          data: { user_id: userId }
        })
      );
    } catch (error) {
      console.error('取消关注用户失败:', error);
      throw error;
    }
  },

  /**
   * 检查是否已关注用户
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 是否已关注
   */
  async checkFollowing(userId) {
    // 参数验证
    if (!validator.isString(userId)) {
      throw new Error('用户ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/api/user/following/check`,
          method: 'GET',
          params: { user_id: userId }
        })
      );
      
      return result.data.is_following || false;
    } catch (error) {
      console.error('检查关注状态失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户推荐
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页数量，默认20
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 推荐列表和分页信息
   */
  async getUserRecommendations(params = { page: 1, page_size: 20 }, forceRefresh = false) {
    try {
      // 构建缓存键
      const cacheKey = `${CACHE_KEYS.USER_RECOMMENDATIONS}_${JSON.stringify(params)}`;
      
      // 如果不强制刷新，尝试从缓存获取
      if (!forceRefresh) {
        const cachedRecommendations = cacheManager.get(cacheKey);
        if (cachedRecommendations) {
          return cachedRecommendations;
        }
      }
      
      const result = await retryRequest(() => 
        request({
          url: '/api/user/recommendations',
          method: 'GET',
          params: params
        })
      );
      
      // 存入缓存
      cacheManager.set(cacheKey, result, 300); // 5分钟缓存
      
      return result;
    } catch (error) {
      console.error('获取用户推荐失败:', error);
      throw error;
    }
  },

  /**
   * 清除指定类型的缓存
   * @param {string} cacheType - 缓存类型
   */
  clearCache(cacheType) {
    try {
      if (cacheType) {
        this.clearSpecificCache(cacheType);
      } else {
        this.clearAllCache();
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  },
  
  /**
   * 清除所有缓存
   */
  clearAllCache() {
    try {
      cacheManager.clearAll();
    } catch (error) {
      console.error('清除所有缓存失败:', error);
    }
  },
  
  /**
   * 清除特定类型的缓存
   * @param {string} cacheType - 缓存类型
   */
  clearSpecificCache(cacheType) {
    try {
      const cacheKeys = Object.keys(CACHE_KEYS);
      cacheKeys.forEach(key => {
        if (CACHE_KEYS[key].toLowerCase().includes(cacheType.toLowerCase())) {
          cacheManager.remove(CACHE_KEYS[key]);
        }
      });
    } catch (error) {
      console.error('清除特定缓存失败:', error);
    }
  },
  
  /**
   * 清除用户相关缓存
   */
  clearUserCache() {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        cacheManager.remove(key);
      });
    } catch (error) {
      console.error('清除用户缓存失败:', error);
    }
  },

  /**
   * 获取用户偏好设置
   * @returns {Object} 用户偏好设置
   */
  getUserPreferences() {
    try {
      return wx.getStorageSync(USER_PREFERENCES_KEY) || {};
    } catch (error) {
      console.error('获取用户偏好设置失败:', error);
      return {};
    }
  },

  /**
   * 设置用户偏好设置
   * @param {Object} preferences - 偏好设置对象
   */
  setUserPreferences(preferences) {
    try {
      wx.setStorageSync(USER_PREFERENCES_KEY, preferences);
    } catch (error) {
      console.error('设置用户偏好设置失败:', error);
    }
  },

  /**
   * 更新单个用户偏好设置
   * @param {string} key - 偏好键
   * @param {*} value - 偏好值
   */
  updateUserPreference(key, value) {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    this.setUserPreferences(preferences);
  },

  /**
   * 获取用户优惠券
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页数量，默认10
   * @param {string} params.status - 状态，默认valid
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 优惠券列表和分页信息
   */
  async getUserCoupons(params = { page: 1, page_size: 10, status: 'valid' }, forceRefresh = false) {
    try {
      // 构建缓存键
      const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${JSON.stringify(params)}`;
      
      // 如果不强制刷新，尝试从缓存获取
      if (!forceRefresh) {
        const cachedCoupons = cacheManager.get(cacheKey);
        if (cachedCoupons) {
          return cachedCoupons;
        }
      }
      
      const result = await retryRequest(() => 
        request({
          url: '/api/user/coupons',
          method: 'GET',
          params: params
        })
      );
      
      // 存入缓存
      cacheManager.set(cacheKey, result, 300); // 5分钟缓存
      
      return result;
    } catch (error) {
      console.error('获取用户优惠券失败:', error);
      throw error;
    }
  },

  /**
   * 获取优惠券详情
   * @param {string} couponId - 优惠券ID
   * @returns {Promise<Object>} 优惠券详情
   */
  async getCouponDetail(couponId) {
    // 参数验证
    if (!validator.isString(couponId)) {
      throw new Error('优惠券ID不能为空');
    }

    try {
      return await retryRequest(() => 
        request({
          url: `/api/user/coupons/${couponId}`,
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('获取优惠券详情失败:', error);
      throw error;
    }
  },

  /**
   * 领取优惠券
   * @param {string} couponCode - 优惠券代码
   * @returns {Promise<Object>} 领取结果
   */
  async redeemCoupon(couponCode) {
    // 参数验证
    if (!validator.isString(couponCode)) {
      throw new Error('优惠券代码不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/api/user/coupons/redeem',
          method: 'POST',
          data: { coupon_code: couponCode }
        })
      );
      
      // 清除优惠券缓存
      this.clearSpecificCache('coupons');
      
      return result;
    } catch (error) {
      console.error('领取优惠券失败:', error);
      throw error;
    }
  },

  /**
   * 获取可用优惠券
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 可用优惠券列表
   */
  async getAvailableCoupons(params = {}) {
    try {
      const cacheKey = `${CACHE_KEYS.AVAILABLE_COUPONS}_${JSON.stringify(params)}`;
      
      // 尝试从缓存获取
      const cachedCoupons = cacheManager.get(cacheKey);
      if (cachedCoupons) {
        return cachedCoupons;
      }
      
      const result = await retryRequest(() => 
        request({
          url: '/api/user/coupons/available',
          method: 'GET',
          params: params
        })
      );
      
      // 存入缓存
      cacheManager.set(cacheKey, result, 300); // 5分钟缓存
      
      return result;
    } catch (error) {
      console.error('获取可用优惠券失败:', error);
      throw error;
    }
  }
};

module.exports = userService;