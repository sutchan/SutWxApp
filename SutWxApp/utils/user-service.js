// 用户服务模块
// 提供用户相关的API调用功能
import { request } from './api';
import { showToast } from './global';

// 常量定义
const USER_INFO_KEY = 'user_info';
const USER_PREFERENCES_KEY = 'user_preferences';
const CACHE_PREFIX = 'user_cache_';
const DEFAULT_CACHE_EXPIRY = 300; // 默认缓存5分钟

// 缓存键定义
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

// 缓存管理工具函数
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
      console.error('设置缓存失败:', error);
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
        // 缓存已过期，清除缓存
        this.remove(key);
        return null;
      }

      return cacheData.value;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  },

  // 移除缓存
  remove(key) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      wx.removeStorageSync(cacheKey);
    } catch (error) {
      console.error('移除缓存失败:', error);
    }
  },

  // 清除所有用户相关缓存
  clearAll() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('清除缓存失败:', error);
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
      
      // 如果是最后一次重试，抛出错误
      if (i === maxRetries) break;
      
      // 指数退避
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// 数据验证工具
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
   * 获取用户个人资料
   * @param {boolean} forceRefresh - 是否强制刷新，不使用缓存
   * @returns {Promise} 返回用户资料
   */
  async getUserProfile(forceRefresh = false) {
    // 尝试从缓存获取
    if (!forceRefresh) {
      const cachedProfile = cacheManager.get(CACHE_KEYS.USER_PROFILE);
      if (cachedProfile) {
        return cachedProfile;
      }
    }

    try {
      const profile = await retryRequest(() => 
        request({
          url: '/user/profile',
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(CACHE_KEYS.USER_PROFILE, profile, 300); // 5分钟缓存
      
      // 更新用户信息缓存
      this.cacheUserInfo(profile);
      
      return profile;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      // 如果请求失败，尝试返回缓存数据
      const cachedProfile = cacheManager.get(CACHE_KEYS.USER_PROFILE);
      if (cachedProfile) {
        console.log('使用缓存的用户资料');
        return cachedProfile;
      }
      throw error;
    }
  },

  /**
   * 更新用户个人资料
   * @param {Object} profileData - 用户资料数据
   * @returns {Promise} 返回更新结果
   */
  async updateUserProfile(profileData) {
    // 数据验证
    if (!validator.isObject(profileData)) {
      throw new Error('用户资料数据格式不正确');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/profile',
          method: 'POST',
          data: profileData
        })
      );
      
      // 清除缓存，下次获取会重新加载
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      // 更新本地用户信息缓存
      const currentUser = this.getCachedUserInfo() || {};
      const updatedUser = { ...currentUser, ...profileData };
      this.cacheUserInfo(updatedUser);
      
      // 显示成功提示
      showToast('更新成功');
      
      return result;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      showToast(error.message || '更新失败，请重试');
      throw error;
    }
  },

  /**
   * 获取用户设置
   * @returns {Promise} 返回用户设置
   */
  async getUserSettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/user/settings',
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
   * @returns {Promise} 返回更新结果
   */
  async updateUserSettings(settings) {
    // 数据验证
    if (!validator.isObject(settings)) {
      throw new Error('设置数据格式不正确');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/settings',
          method: 'POST',
          data: settings
        })
      );
      
      showToast('设置已更新');
      return result;
    } catch (error) {
      console.error('更新用户设置失败:', error);
      showToast(error.message || '更新失败，请重试');
      throw error;
    }
  },

  /**
   * 获取用户隐私设置
   * @returns {Promise} 返回隐私设置
   */
  async getUserPrivacySettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/user/privacy-settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('获取隐私设置失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户隐私设置
   * @param {Object} privacySettings - 隐私设置数据
   * @returns {Promise} 返回更新结果
   */
  async updateUserPrivacySettings(privacySettings) {
    // 数据验证
    if (!validator.isObject(privacySettings)) {
      throw new Error('隐私设置数据格式不正确');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/privacy-settings',
          method: 'POST',
          data: privacySettings
        })
      );
      
      showToast('隐私设置已更新');
      return result;
    } catch (error) {
      console.error('更新隐私设置失败:', error);
      showToast(error.message || '更新失败，请重试');
      throw error;
    }
  },

  /**
   * 获取用户统计数据
   * @returns {Promise} 返回用户统计数据
   */
  async getUserStats() {
    const cacheKey = 'user_stats';
    
    // 尝试从缓存获取
    const cachedStats = cacheManager.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    try {
      const stats = await retryRequest(() => 
        request({
          url: '/user/stats',
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(cacheKey, stats, 300); // 5分钟缓存
      
      return stats;
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      throw error;
    }
  },

  /**
   * 上传用户头像
   * @param {string} filePath - 头像文件路径
   * @returns {Promise} 返回上传结果
   */
  async uploadAvatar(filePath) {
    if (!validator.isString(filePath)) {
      throw new Error('头像文件路径不能为空');
    }

    try {
      // 定义上传文件函数，用于重试机制
      const uploadFn = () => {
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            url: request.getBaseUrl() + '/user/avatar',
            filePath: filePath,
            name: 'avatar',
            header: {
              'content-type': 'multipart/form-data',
              'Authorization': `Bearer ${request.getToken()}`
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data);
                if (data.code === 200) {
                  resolve(data);
                } else {
                  reject(new Error(data.message || '上传头像失败'));
                }
              } catch (e) {
                reject(new Error('解析响应失败'));
              }
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      };

      const result = await retryRequest(uploadFn);
      
      // 清除用户资料缓存
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      // 更新本地用户信息缓存
      const currentUser = this.getCachedUserInfo() || {};
      if (result.data && result.data.avatar_url) {
        currentUser.avatar_url = result.data.avatar_url;
        this.cacheUserInfo(currentUser);
      }
      
      showToast('头像上传成功');
      return result;
    } catch (error) {
      console.error('上传头像失败:', error);
      showToast(error.message || '上传失败，请重试');
      throw error;
    }
  },

  /**
   * 绑定用户账号
   * @param {Object} bindData - 绑定数据
   * @param {string} bindData.type - 绑定类型 (phone, email)
   * @param {string} bindData.value - 绑定值
   * @param {string} bindData.code - 验证码
   * @returns {Promise} 返回绑定结果
   */
  async bindAccount(bindData) {
    // 数据验证
    if (!validator.isObject(bindData) || !bindData.type || !bindData.value) {
      throw new Error('绑定数据不完整');
    }
    
    // 验证绑定值格式
    if (bindData.type === 'phone' && !validator.isValidPhone(bindData.value)) {
      throw new Error('请输入正确的手机号');
    } else if (bindData.type === 'email' && !validator.isValidEmail(bindData.value)) {
      throw new Error('请输入正确的邮箱地址');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/bind-account',
          method: 'POST',
          data: bindData
        })
      );
      
      // 清除用户资料缓存
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      showToast('账号绑定成功');
      return result;
    } catch (error) {
      console.error('绑定账号失败:', error);
      showToast(error.message || '绑定失败，请重试');
      throw error;
    }
  },

  /**
   * 解绑用户账号
   * @param {string} type - 解绑类型 (phone, email)
   * @returns {Promise} 返回解绑结果
   */
  async unbindAccount(type) {
    // 数据验证
    if (!validator.isString(type) || !['phone', 'email'].includes(type)) {
      throw new Error('解绑类型不正确');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/unbind-account/${type}`,
          method: 'POST'
        })
      );
      
      // 清除用户资料缓存
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      showToast('账号解绑成功');
      return result;
    } catch (error) {
      console.error('解绑账号失败:', error);
      showToast(error.message || '解绑失败，请重试');
      throw error;
    }
  },

  /**
   * 获取用户消息通知设置
   * @returns {Promise} 返回通知设置
   */
  async getNotificationSettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/user/notification-settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('获取通知设置失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户消息通知设置
   * @param {Object} notificationSettings - 通知设置
   * @returns {Promise} 返回更新结果
   */
  async updateNotificationSettings(notificationSettings) {
    // 数据验证
    if (!validator.isObject(notificationSettings)) {
      throw new Error('通知设置数据格式不正确');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/notification-settings',
          method: 'POST',
          data: notificationSettings
        })
      );
      
      showToast('通知设置已更新');
      return result;
    } catch (error) {
      console.error('更新通知设置失败:', error);
      showToast(error.message || '更新失败，请重试');
      throw error;
    }
  },

  /**
   * 收藏文章
   * @param {string} articleId - 文章ID
   * @returns {Promise} 返回收藏结果
   */
  async favoriteArticle(articleId) {
    if (!articleId) {
      throw new Error('文章ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/favorite/article',
          method: 'POST',
          data: { article_id: articleId }
        })
      );
      
      // 清除收藏列表缓存
      cacheManager.remove('user_favorites_1');
      // 清除文章收藏状态缓存
      cacheManager.remove(`favorite_status_${articleId}`);
      
      showToast('收藏成功');
      return result;
    } catch (error) {
      console.error('收藏文章失败:', error);
      showToast(error.message || '收藏失败，请重试');
      throw error;
    }
  },

  /**
   * 取消收藏文章
   * @param {string} articleId - 文章ID
   * @returns {Promise} 返回取消收藏结果
   */
  async unfavoriteArticle(articleId) {
    if (!articleId) {
      throw new Error('文章ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/favorite/article',
          method: 'DELETE',
          data: { article_id: articleId }
        })
      );
      
      // 清除收藏列表缓存
      cacheManager.remove('user_favorites_1');
      // 清除文章收藏状态缓存
      cacheManager.remove(`favorite_status_${articleId}`);
      
      showToast('已取消收藏');
      return result;
    } catch (error) {
      console.error('取消收藏失败:', error);
      showToast(error.message || '取消收藏失败，请重试');
      throw error;
    }
  },

  /**
   * 检查文章是否被收藏
   * @param {string} articleId - 文章ID
   * @returns {Promise} 返回收藏状态
   */
  async checkFavorite(articleId) {
    if (!articleId) {
      throw new Error('文章ID不能为空');
    }

    const cacheKey = `favorite_status_${articleId}`;
    
    // 尝试从缓存获取
    const cachedStatus = cacheManager.get(cacheKey);
    if (cachedStatus !== undefined) {
      return cachedStatus;
    }

    try {
      const status = await retryRequest(() => 
        request({
          url: `/user/favorite/article/${articleId}/check`,
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(cacheKey, status, 300); // 5分钟缓存
      
      return status;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户收藏的文章列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @returns {Promise} 返回收藏文章列表
   */
  async getUserFavorites(params = { page: 1, page_size: 10 }) {
    // 数据验证
    if (!validator.isObject(params)) {
      params = { page: 1, page_size: 10 };
    }
    
    // 只有第一页才使用缓存
    const queryParams = { page: params.page || 1, page_size: params.page_size || 10 };
    const cacheKey = `user_favorites_${queryParams.page}`;
    
    if (queryParams.page === 1) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const favorites = await retryRequest(() => 
        request({
          url: '/user/favorites',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 只缓存第一页数据
      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, favorites, 180); // 3分钟缓存
      }
      
      return favorites;
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      // 如果是第一页且请求失败，尝试返回缓存数据
      if (queryParams.page === 1) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的收藏列表');
          return cachedData;
        }
      }
      throw error;
    }
  },

  /**
   * 获取用户评论列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @returns {Promise} 返回用户评论列表
   */
  async getUserComments(params = { page: 1, page_size: 10 }) {
    // 数据验证
    if (!validator.isObject(params)) {
      params = { page: 1, page_size: 10 };
    }
    
    // 只有第一页才使用缓存
    const queryParams = { page: params.page || 1, page_size: params.page_size || 10 };
    const cacheKey = `user_comments_${queryParams.page}`;
    
    if (queryParams.page === 1) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const comments = await retryRequest(() => 
        request({
          url: '/user/comments',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 只缓存第一页数据
      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, comments, 180); // 3分钟缓存
      }
      
      return comments;
    } catch (error) {
      console.error('获取评论列表失败:', error);
      // 如果是第一页且请求失败，尝试返回缓存数据
      if (queryParams.page === 1) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的评论列表');
          return cachedData;
        }
      }
      throw error;
    }
  },

  /**
   * 获取用户地址列表
   * @param {boolean} forceRefresh - 是否强制刷新，不使用缓存
   * @returns {Promise} 返回地址列表
   */
  async getUserAddresses(forceRefresh = false) {
    // 尝试从缓存获取
    if (!forceRefresh) {
      const cachedAddresses = cacheManager.get(CACHE_KEYS.USER_ADDRESSES);
      if (cachedAddresses) {
        return cachedAddresses;
      }
    }

    try {
      const addresses = await retryRequest(() => 
        request({
          url: '/user/addresses',
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(CACHE_KEYS.USER_ADDRESSES, addresses, 300); // 5分钟缓存
      
      return addresses;
    } catch (error) {
      console.error('获取用户地址列表失败:', error);
      // 如果请求失败，尝试返回缓存数据
      const cachedAddresses = cacheManager.get(CACHE_KEYS.USER_ADDRESSES);
      if (cachedAddresses) {
        console.log('使用缓存的地址列表');
        return cachedAddresses;
      }
      throw error;
    }
  },

  /**
   * 添加新地址
   * @param {Object} addressData - 地址数据
   * @returns {Promise} 返回添加结果
   */
  async addAddress(addressData) {
    // 数据验证
    if (!validator.isObject(addressData)) {
      throw new Error('地址数据格式不正确');
    }
    
    // 基本字段验证
    const requiredFields = ['name', 'phone', 'province', 'city', 'district', 'detail_address'];
    for (const field of requiredFields) {
      if (!addressData[field] || !validator.isString(addressData[field])) {
        throw new Error(`地址信息不完整，请填写${field === 'detail_address' ? '详细地址' : field}`);
      }
    }
    
    // 手机号验证
    if (!validator.isValidPhone(addressData.phone)) {
      throw new Error('请输入正确的手机号');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/addresses',
          method: 'POST',
          data: addressData
        })
      );
      
      // 清除地址列表缓存
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      // 显示成功提示
      showToast('添加地址成功');
      
      return result;
    } catch (error) {
      console.error('添加地址失败:', error);
      showToast(error.message || '添加地址失败，请重试');
      throw error;
    }
  },

  /**
   * 更新地址
   * @param {string} addressId - 地址ID
   * @param {Object} addressData - 地址数据
   * @returns {Promise} 返回更新结果
   */
  async updateAddress(addressId, addressData) {
    // 数据验证
    if (!addressId) {
      throw new Error('地址ID不能为空');
    }
    
    if (!validator.isObject(addressData)) {
      throw new Error('地址数据格式不正确');
    }
    
    // 基本字段验证
    const requiredFields = ['name', 'phone', 'province', 'city', 'district', 'detail_address'];
    for (const field of requiredFields) {
      if (addressData.hasOwnProperty(field) && (!addressData[field] || !validator.isString(addressData[field]))) {
        throw new Error(`地址信息不完整，请填写${field === 'detail_address' ? '详细地址' : field}`);
      }
    }
    
    // 手机号验证
    if (addressData.phone && !validator.isValidPhone(addressData.phone)) {
      throw new Error('请输入正确的手机号');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/addresses/${addressId}`,
          method: 'PUT',
          data: addressData
        })
      );
      
      // 清除地址列表缓存
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      showToast('地址更新成功');
      return result;
    } catch (error) {
      console.error('更新地址失败:', error);
      showToast(error.message || '更新地址失败，请重试');
      throw error;
    }
  },

  /**
   * 删除地址
   * @param {string} addressId - 地址ID
   * @returns {Promise} 返回删除结果
   */
  async deleteAddress(addressId) {
    if (!addressId) {
      throw new Error('地址ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/addresses/${addressId}`,
          method: 'DELETE'
        })
      );
      
      // 清除地址列表缓存
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      showToast('地址已删除');
      return result;
    } catch (error) {
      console.error('删除地址失败:', error);
      showToast(error.message || '删除地址失败，请重试');
      throw error;
    }
  },

  /**
   * 设置默认地址
   * @param {string} addressId - 地址ID
   * @returns {Promise} 返回设置结果
   */
  async setDefaultAddress(addressId) {
    if (!addressId) {
      throw new Error('地址ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/addresses/${addressId}/default`,
          method: 'POST'
        })
      );
      
      // 清除地址列表缓存
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      showToast('已设置为默认地址');
      return result;
    } catch (error) {
      console.error('设置默认地址失败:', error);
      showToast(error.message || '设置默认地址失败，请重试');
      throw error;
    }
  },

  /**
   * 获取用户积分信息
   * @param {boolean} forceRefresh - 是否强制刷新，不使用缓存
   * @returns {Promise} 返回积分信息
   */
  async getUserPoints(forceRefresh = false) {
    // 尝试从缓存获取
    if (!forceRefresh) {
      const cachedPoints = cacheManager.get(CACHE_KEYS.USER_POINTS);
      if (cachedPoints) {
        return cachedPoints;
      }
    }

    try {
      const points = await retryRequest(() => 
        request({
          url: '/user/points',
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(CACHE_KEYS.USER_POINTS, points, 180); // 3分钟缓存
      
      return points;
    } catch (error) {
      console.error('获取积分信息失败:', error);
      // 如果请求失败，尝试返回缓存数据
      const cachedPoints = cacheManager.get(CACHE_KEYS.USER_POINTS);
      if (cachedPoints) {
        console.log('使用缓存的积分信息');
        return cachedPoints;
      }
      throw error;
    }
  },

  /**
   * 获取用户积分历史
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @returns {Promise} 返回积分历史
   */
  async getUserPointsHistory(params = { page: 1, page_size: 10 }) {
    // 数据验证
    if (!validator.isObject(params)) {
      params = { page: 1, page_size: 10 };
    }
    
    // 只有第一页才使用缓存
    const queryParams = { page: params.page || 1, page_size: params.page_size || 10 };
    const cacheKey = `user_points_history_${queryParams.page}`;
    
    if (queryParams.page === 1) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const history = await retryRequest(() => 
        request({
          url: '/user/points/history',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 只缓存第一页数据
      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, history, 180); // 3分钟缓存
      }
      
      return history;
    } catch (error) {
      console.error('获取积分历史失败:', error);
      // 如果是第一页且请求失败，尝试返回缓存数据
      if (queryParams.page === 1) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的积分历史');
          return cachedData;
        }
      }
      throw error;
    }
  },

  /**
   * 签到功能
   * @returns {Promise} 返回签到结果
   */
  async signIn() {
    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/signin',
          method: 'POST'
        })
      );
      
      // 清除签到相关缓存
      cacheManager.remove(CACHE_KEYS.USER_SIGNIN_HISTORY);
      cacheManager.remove('user_checkin_status');
      
      showToast(`签到成功，获得${result.points || 0}积分`);
      return result;
    } catch (error) {
      console.error('用户签到失败:', error);
      showToast(error.message || '签到失败，请重试');
      throw error;
    }
  },

  /**
   * 获取签到状态
   * @returns {Promise} 返回签到状态
   */
  async getSignInStatus() {
    const cacheKey = 'user_checkin_status';
    
    // 尝试从缓存获取
    const cachedStatus = cacheManager.get(cacheKey);
    if (cachedStatus) {
      return cachedStatus;
    }

    try {
      const status = await retryRequest(() => 
        request({
          url: '/user/signin/status',
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(cacheKey, status, 60); // 1分钟缓存
      
      return status;
    } catch (error) {
      console.error('获取签到状态失败:', error);
      throw error;
    }
  },

  /**
   * 获取签到历史
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {boolean} forceRefresh - 是否强制刷新，不使用缓存
   * @returns {Promise} 返回签到历史
   */
  async getSignInHistory(params = { page: 1, page_size: 30 }, forceRefresh = false) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 30
    };

    // 只有第一页才使用缓存
    if (!forceRefresh && queryParams.page === 1) {
      const cacheKey = `${CACHE_KEYS.USER_SIGNIN_HISTORY}`;
      const cachedHistory = cacheManager.get(cacheKey);
      if (cachedHistory) {
        return cachedHistory;
      }
    }

    try {
      const history = await retryRequest(() => 
        request({
          url: '/user/signin/history',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 只有第一页才缓存
      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_SIGNIN_HISTORY}`;
        cacheManager.set(cacheKey, history, 180); // 3分钟缓存
      }
      
      return history;
    } catch (error) {
      console.error('获取签到历史失败:', error);
      // 如果是第一页且请求失败，尝试返回缓存数据
      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_SIGNIN_HISTORY}`;
        const cachedHistory = cacheManager.get(cacheKey);
        if (cachedHistory) {
          console.log('使用缓存的签到历史');
          return cachedHistory;
        }
      }
      throw error;
    }
  },

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return request.getToken() !== null;
  },

  /**
   * 获取缓存的用户信息
   * @returns {Object|null} 用户信息对象或null
   */
  getCachedUserInfo() {
    try {
      const userInfo = wx.getStorageSync(USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('获取缓存用户信息失败:', error);
      return null;
    }
  },

  /**
   * 缓存用户信息
   * @param {Object} userInfo - 用户信息
   */
  cacheUserInfo(userInfo) {
    try {
      wx.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error('缓存用户信息失败:', error);
    }
  },

  /**
   * 清除用户登录状态和缓存
   * @returns {boolean} 操作是否成功
   */
  clearLoginStatus() {
    try {
      // 清除用户信息缓存
      wx.removeStorageSync(USER_INFO_KEY);
      
      // 清除用户偏好设置缓存
      wx.removeStorageSync(USER_PREFERENCES_KEY);
      
      // 清除用户相关缓存
      cacheManager.clearAll();
      
      // 清除认证令牌
      request.removeToken();
      
      console.log('用户登录状态已清除');
      return true;
    } catch (error) {
      console.error('清除登录状态失败:', error);
      // 尝试清理特定的缓存键，确保关键数据被清除
      try {
        wx.removeStorageSync(USER_INFO_KEY);
        request.removeToken();
      } catch (e) {
        console.error('清除关键缓存失败:', e);
      }
      return false;
    }
  },

  /**
   * 获取用户关注列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @returns {Promise} 返回关注列表
   */
  async getUserFollowing(params = { page: 1, page_size: 20 }) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 20
    };

    try {
      return await retryRequest(() => 
        request({
          url: '/user/following',
          method: 'GET',
          data: queryParams
        })
      );
    } catch (error) {
      console.error('获取关注列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户粉丝列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @returns {Promise} 返回粉丝列表
   */
  async getUserFollowers(params = { page: 1, page_size: 20 }) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 20
    };

    try {
      return await retryRequest(() => 
        request({
          url: '/user/followers',
          method: 'GET',
          data: queryParams
        })
      );
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      throw error;
    }
  },

  /**
   * 关注用户
   * @param {number|string} userId - 要关注的用户ID
   * @returns {Promise} 返回关注结果
   */
  async followUser(userId) {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/follow',
          method: 'POST',
          data: { user_id: userId }
        })
      );
      
      showToast('关注成功');
      return result;
    } catch (error) {
      console.error('关注用户失败:', error);
      showToast(error.message || '关注失败，请重试');
      throw error;
    }
  },

  /**
   * 取消关注
   * @param {number|string} userId - 要取消关注的用户ID
   * @returns {Promise} 返回取消关注结果
   */
  async unfollowUser(userId) {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/unfollow',
          method: 'POST',
          data: { user_id: userId }
        })
      );
      
      showToast('已取消关注');
      return result;
    } catch (error) {
      console.error('取消关注失败:', error);
      showToast(error.message || '取消关注失败，请重试');
      throw error;
    }
  },

  /**
   * 检查是否已关注用户
   * @param {number|string} userId - 用户ID
   * @returns {Promise} 返回关注状态
   */
  async checkFollowing(userId) {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }

    const cacheKey = `following_status_${userId}`;
    
    // 尝试从缓存获取
    const cachedStatus = cacheManager.get(cacheKey);
    if (cachedStatus !== undefined) {
      return cachedStatus;
    }

    try {
      const status = await retryRequest(() => 
        request({
          url: `/user/check-following/${userId}`,
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(cacheKey, status, 300); // 5分钟缓存
      
      return status;
    } catch (error) {
      console.error('检查关注状态失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户推荐列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {boolean} forceRefresh - 是否强制刷新，不使用缓存
   * @returns {Promise} 返回推荐用户列表
   */
  async getUserRecommendations(params = { page: 1, page_size: 20 }, forceRefresh = false) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 20
    };

    // 只有第一页才使用缓存
    const cacheKey = `user_recommendations_${queryParams.page}`;
    
    if (!forceRefresh && queryParams.page === 1) {
      const cachedRecommendations = cacheManager.get(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
    }

    try {
      const recommendations = await retryRequest(() => 
        request({
          url: '/user/recommendations',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 只缓存第一页数据
      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, recommendations, 300); // 5分钟缓存
      }
      
      return recommendations;
    } catch (error) {
      console.error('获取推荐用户失败:', error);
      // 如果是第一页且请求失败，尝试返回缓存数据
      if (queryParams.page === 1) {
        const cachedRecommendations = cacheManager.get(cacheKey);
        if (cachedRecommendations) {
          console.log('使用缓存的用户推荐');
          return cachedRecommendations;
        }
      }
      throw error;
    }
  },

  /**
   * 清除指定类型的缓存
   * @param {string} cacheType - 缓存类型，可选值：'profile', 'coupons', 'addresses', 'points'
   */
  clearCache(cacheType) {
    switch (cacheType) {
      case 'profile':
        cacheManager.remove(CACHE_KEYS.USER_PROFILE);
        break;
      case 'coupons':
        // 清除所有状态的优惠券缓存
        ['valid', 'used', 'expired', 'all'].forEach(status => {
          cacheManager.remove(`${CACHE_KEYS.USER_COUPONS}_${status}`);
        });
        break;
      case 'addresses':
        cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
        break;
      case 'points':
        cacheManager.remove(CACHE_KEYS.USER_POINTS);
        break;
      default:
        // 清除所有缓存
        cacheManager.clearAll();
    }
  },
  
  /**
   * 清除所有缓存
   * @returns {boolean} 操作是否成功
   */
  clearAllCache() {
    try {
      cacheManager.clearAll();
      console.log('所有缓存已清除');
      return true;
    } catch (error) {
      console.error('清除缓存失败:', error);
      return false;
    }
  },
  
  /**
   * 清除特定类型的缓存
   * @param {string|Array} cacheType - 缓存类型，可以是单个键名或键名数组
   * @returns {boolean} 操作是否成功
   */
  clearSpecificCache(cacheType) {
    try {
      if (Array.isArray(cacheType)) {
        cacheType.forEach(key => {
          if (typeof key === 'string') {
            cacheManager.remove(key);
          }
        });
      } else if (typeof cacheType === 'string') {
        cacheManager.remove(cacheType);
      } else {
        throw new Error('缓存类型必须是字符串或字符串数组');
      }
      console.log(`缓存已清除: ${cacheType}`);
      return true;
    } catch (error) {
      console.error('清除指定缓存失败:', error);
      return false;
    }
  },
  
  /**
   * 清除用户相关所有缓存
   * @returns {boolean} 操作是否成功
   */
  clearUserCache() {
    try {
      // 清除所有预定义的用户缓存键
      Object.values(CACHE_KEYS).forEach(key => {
        cacheManager.remove(key);
      });
      
      // 清除可能的动态缓存键（如收藏状态、关注状态等）
      const cacheKeys = wx.getStorageInfoSync().keys || [];
      cacheKeys.forEach(key => {
        // 清除以特定前缀开头的缓存键
        if (key.startsWith('favorite_status_') || 
            key.startsWith('following_status_') ||
            key.startsWith('coupon_detail_') ||
            key.startsWith('user_favorites_') ||
            key.startsWith('user_comments_') ||
            key.startsWith('user_points_history_') ||
            key.startsWith('user_recommendations_') ||
            key.startsWith('user_following_') ||
            key.startsWith('user_followers_')) {
          cacheManager.remove(key);
        }
      });
      
      console.log('用户相关缓存已清除');
      return true;
    } catch (error) {
      console.error('清除用户缓存失败:', error);
      return false;
    }
  },

  /**
   * 获取用户偏好设置
   * @returns {Object} 用户偏好设置
   */
  getUserPreferences() {
    try {
      const preferences = wx.getStorageSync(USER_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : {};
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
      wx.setStorageSync(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('设置用户偏好设置失败:', error);
    }
  },

  /**
   * 更新单个用户偏好设置
   * @param {string} key - 偏好设置键名
   * @param {*} value - 偏好设置值
   */
  updateUserPreference(key, value) {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    this.setUserPreferences(preferences);
  },

  /**
   * 获取用户优惠券列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页数量
   * @param {string} params.status - 优惠券状态 (all, valid, used, expired)
   * @param {boolean} forceRefresh - 是否强制刷新，不使用缓存
   * @returns {Promise} 返回优惠券列表
   */
  async getUserCoupons(params = { page: 1, page_size: 10, status: 'valid' }, forceRefresh = false) {
    // 默认参数处理
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 10,
      status: params.status || 'valid'
    };

    // 只有第一页才使用缓存
    if (!forceRefresh && queryParams.page === 1) {
      const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${queryParams.status}`;
      const cachedCoupons = cacheManager.get(cacheKey);
      if (cachedCoupons) {
        return cachedCoupons;
      }
    }

    try {
      const coupons = await retryRequest(() => 
        request({
          url: '/user/coupons',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 只有第一页才缓存
      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${queryParams.status}`;
        cacheManager.set(cacheKey, coupons, 180); // 3分钟缓存
      }
      
      return coupons;
    } catch (error) {
      console.error('获取优惠券列表失败:', error);
      // 如果是第一页且请求失败，尝试返回缓存数据
      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${queryParams.status}`;
        const cachedCoupons = cacheManager.get(cacheKey);
        if (cachedCoupons) {
          console.log('使用缓存的优惠券列表');
          return cachedCoupons;
        }
      }
      throw error;
    }
  },

  /**
   * 获取优惠券详情
   * @param {string} couponId - 优惠券ID
   * @returns {Promise} 返回优惠券详情
   */
  async getCouponDetail(couponId) {
    if (!couponId) {
      throw new Error('优惠券ID不能为空');
    }

    const cacheKey = `coupon_detail_${couponId}`;
    
    // 尝试从缓存获取
    const cachedDetail = cacheManager.get(cacheKey);
    if (cachedDetail) {
      return cachedDetail;
    }

    try {
      const detail = await retryRequest(() => 
        request({
          url: `/user/coupons/${couponId}`,
          method: 'GET'
        })
      );
      
      // 更新缓存
      cacheManager.set(cacheKey, detail, 300); // 5分钟缓存
      
      return detail;
    } catch (error) {
      console.error('获取优惠券详情失败:', error);
      throw error;
    }
  },

  /**
   * 兑换优惠券
   * @param {string} couponCode - 优惠券兑换码
   * @returns {Promise} 返回兑换结果
   */
  async redeemCoupon(couponCode) {
    if (!validator.isString(couponCode) || couponCode.trim() === '') {
      throw new Error('优惠券码不能为空');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/coupons/redeem',
          method: 'POST',
          data: { coupon_code: couponCode.trim() }
        })
      );
      
      // 清除优惠券列表缓存
      cacheManager.remove(`${CACHE_KEYS.USER_COUPONS}_valid`);
      cacheManager.remove(`${CACHE_KEYS.USER_COUPONS}_all`);
      
      showToast('兑换成功');
      return result;
    } catch (error) {
      console.error('兑换优惠券失败:', error);
      showToast(error.message || '兑换失败，请检查优惠券码是否正确');
      throw error;
    }
  },

  /**
   * 获取可用的优惠券列表（用于订单页面）
   * @param {Object} params - 查询参数
   * @param {number} params.total - 订单总金额
   * @param {Array} params.productIds - 产品ID列表
   * @returns {Promise} 返回可用优惠券列表
   */
  async getAvailableCoupons(params = {}) {
    // 数据验证
    if (!validator.isObject(params)) {
      params = {};
    }
    
    const cacheKey = 'available_coupons';
    
    // 尝试从缓存获取
    const cachedCoupons = cacheManager.get(cacheKey);
    if (cachedCoupons) {
      return cachedCoupons;
    }

    try {
      const coupons = await retryRequest(() => 
        request({
          url: '/user/coupons/available',
          method: 'GET',
          data: params
        })
      );
      
      // 更新缓存
      cacheManager.set(cacheKey, coupons, 120); // 2分钟缓存
      
      return coupons;
    } catch (error) {
      console.error('获取可用优惠券失败:', error);
      // 如果请求失败，尝试返回缓存数据
      if (cachedCoupons) {
        console.log('使用缓存的可用优惠券');
        return cachedCoupons;
      }
      throw error;
    }
  }
};

export default userService;
