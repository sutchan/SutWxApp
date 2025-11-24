/**
 * 文件名: request.js
 * 版本号: 1.1.0
 * 更新日期: 2025-11-25
 * 描述: 网络请求工具类，集成安全验证和离线缓存
 */

const signature = require('./signature.js');
const i18n = require('./i18n.js');
const store = require('./store.js');
const cacheService = require('./cacheService.js').instance;
const CACHE_POLICY = require('./cacheService.js').CACHE_POLICY;

// 配置信息
const API_CONFIG = {
  BASE_URL: 'https://api.example.com/v1', // 生产环境API地址
  TEST_URL: 'https://test-api.example.com/v1', // 测试环境API地址
  USE_TEST: false, // 是否使用测试环境
  TIMEOUT: 30000, // 请求超时时间
  RETRY_COUNT: 3, // 重试次数
  SECRET_KEY: 'your_secret_key_here' // 签名密钥（生产环境应从安全存储获取）
};

/**
 * 网络请求工具类
 */
class Request {
  /**
   * 发起API请求
   * @param {Object} options - 请求选项
   * @param {string} options.url - 请求URL
   * @param {string} options.method - 请求方法
   * @param {Object} options.data - 请求数据
   * @param {Object} options.header - 请求头
   * @param {boolean} options.needAuth - 是否需要认证
   * @param {boolean} options.needSign - 是否需要签名
   * @returns {Promise} 请求结果
   */
  /**
   * 发起API请求
   * @param {Object} options - 请求选项
   * @param {string} options.url - 请求URL
   * @param {string} options.method - 请求方法
   * @param {Object} options.data - 请求数据
   * @param {Object} options.header - 请求头
   * @param {boolean} options.needAuth - 是否需要认证
   * @param {boolean} options.needSign - 是否需要签名
   * @param {Object} options.cache - 缓存配置
   * @param {string} options.cache.policy - 缓存策略: 'NETWORK_FIRST', 'CACHE_FIRST', 'STALE_WHILE_REVALIDATE', 'ONLY_NETWORK', 'ONLY_CACHE'
   * @param {number} options.cache.maxAge - 缓存最大生命周期（毫秒）
   * @returns {Promise} 请求结果
   */
  static async request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needAuth = true,
      needSign = true,
      cache = {}
    } = options;
    
    // 构建请求配置
    let requestOptions = {
      url: this._buildUrl(url),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: API_CONFIG.TIMEOUT
    };
    
    // 添加认证信息
    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        requestOptions.header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 添加请求签名
    if (needSign) {
      requestOptions = signature.addSignatureToHeaders(
        requestOptions,
        API_CONFIG.SECRET_KEY
      );
    }
    
    // 处理缓存
    const cacheEnabled = method === 'GET' && cacheService && cache.policy;
    const cacheKey = this._generateCacheKey(requestOptions);
    
    // 根据缓存策略决定是否先返回缓存数据
    if (cacheEnabled) {
      switch (cache.policy) {
        case CACHE_POLICY.CACHE_FIRST:
          // 优先使用缓存
          const cachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (cachedData) {
            return cachedData;
          }
          // 缓存不存在，执行网络请求
          const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          await cacheService.set(cacheKey, result, cache.maxAge);
          return result;
          
        case CACHE_POLICY.ONLY_CACHE:
          // 只使用缓存
          const onlyCachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (onlyCachedData) {
            return onlyCachedData;
          }
          throw new Error(i18n.translate('offline_data_unavailable') || '离线数据不可用');
          
        case CACHE_POLICY.NETWORK_FIRST:
          try {
            // 优先使用网络
            const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
            await cacheService.set(cacheKey, result, cache.maxAge);
            return result;
          } catch (error) {
            // 网络请求失败，尝试使用缓存
            const fallbackData = await cacheService.get(cacheKey);
            if (fallbackData) {
              return fallbackData;
            }
            throw error;
          }
          
        case CACHE_POLICY.STALE_WHILE_REVALIDATE:
          // 同时返回缓存和发起网络请求更新缓存
          const staleData = await cacheService.get(cacheKey);
          
          // 无论缓存是否存在，都发起网络请求更新缓存
          this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT)
            .then(result => {
              cacheService.set(cacheKey, result, cache.maxAge);
            })
            .catch(error => {
              console.warn('刷新缓存失败:', error);
            });
          
          // 如果有缓存，直接返回缓存数据
          if (staleData) {
            return staleData;
          }
          
          // 否则等待网络请求完成
          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          
        case CACHE_POLICY.ONLY_NETWORK:
        default:
          // 只使用网络，不缓存
          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
      }
    }
    
    // 未启用缓存，直接执行请求
    return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
  }
  
  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求结果
   */
  static get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    });
  }
  
  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求结果
   */
  static post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }
  
  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求结果
   */
  static put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }
  
  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求结果
   */
  static delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
  
  /**
   * 构建完整URL
   * @private
   * @param {string} url - 相对URL
   * @returns {string} 完整URL
   */
  static _buildUrl(url) {
    // 如果是完整URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 否则拼接基础URL
    const baseUrl = API_CONFIG.USE_TEST ? API_CONFIG.TEST_URL : API_CONFIG.BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  /**
   * 获取认证令牌
   * @private
   * @returns {string|null} 令牌
   */
  /**
   * 生成缓存键
   * @private
   * @param {Object} requestOptions - 请求选项
   * @returns {string} 缓存键
   */
  static _generateCacheKey(requestOptions) {
    const { url, data, method } = requestOptions;
    // 将URL和数据序列化，生成唯一的缓存键
    const dataString = typeof data === 'string' ? data : JSON.stringify(data || {});
    return `${method}:${url}:${dataString}`;
  }
  
  static _getAuthToken() {
    try {
      // 从store中获取token
      const token = store.getState('user.token');
      if (token) {
        return token;
      }
      
      // 降级：从本地存储获取
      return wx.getStorageSync('token') || null;
    } catch (error) {
      console.error('获取认证令牌失败:', error);
      return null;
    }
  }
  
  /**
   * 执行请求并处理重试
   * @private
   * @param {Object} options - 请求选项
   * @param {number} retryCount - 剩余重试次数
   * @returns {Promise} 请求结果
   */
  static _executeWithRetry(options, retryCount) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          // 处理响应
          if (res.statusCode === 401) {
            // 未授权，清除token并提示登录
            this._handleUnauthorized();
            reject(new Error(i18n.translate('login_required')));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // 请求失败
            const errorMsg = res.data?.message || 
                            i18n.translate('network_error') || 
                            '网络请求失败';
            reject(new Error(errorMsg));
          }
        },
        fail: (err) => {
          // 处理网络错误
          if (retryCount > 0) {
            // 重试请求
            setTimeout(() => {
              this._executeWithRetry(options, retryCount - 1)
                .then(resolve)
                .catch(reject);
            }, 1000 * Math.pow(2, API_CONFIG.RETRY_COUNT - retryCount)); // 指数退避
          } else {
            // 重试次数用完，抛出错误
            reject(new Error(i18n.translate('network_error') || '网络请求失败'));
          }
        },
        complete: () => {
          // 请求完成后的处理
          if (store) {
            store.commit('SET_LOADING', false);
          }
        }
      });
    });
  }
  
  /**
   * 处理未授权情况
   * @private
   */
  static _handleUnauthorized() {
    // 清除用户信息和token
    store.commit('SET_USER_INFO', null);
    store.commit('SET_TOKEN', null);
    
    // 清除本地存储
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    } catch (error) {
      console.error('清除认证信息失败:', error);
    }
    
    // 提示用户需要登录
    wx.showToast({
      title: i18n.translate('login_required'),
      icon: 'none'
    });
  }
  
  /**
   * 上传文件
   * @param {string} url - 上传URL
   * @param {string} filePath - 文件路径
   * @param {Object} options - 其他选项
   * @returns {Promise} 上传结果
   */
  /**
   * 清除特定URL的缓存
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据（可选）
   * @returns {Promise<boolean>} 是否清除成功
   */
  static async clearCache(url, data = {}) {
    if (!cacheService) return false;
    
    const requestOptions = {
      url: this._buildUrl(url),
      method: 'GET',
      data
    };
    
    const cacheKey = this._generateCacheKey(requestOptions);
    return await cacheService.remove(cacheKey);
  }
  
  /**
   * 清除所有请求缓存
   * @returns {Promise<boolean>} 是否清除成功
   */
  static async clearAllCache() {
    if (!cacheService) return false;
    return await cacheService.clear('request');
  }
  
  static uploadFile(url, filePath, options = {}) {
    const {
      name = 'file',
      formData = {},
      header = {},
      needAuth = true
    } = options;
    
    // 添加认证信息
    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: this._buildUrl(url),
        filePath,
        name,
        formData,
        header,
        timeout: API_CONFIG.TIMEOUT,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || '上传失败'));
            }
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        },
        fail: (err) => {
          reject(new Error('上传文件失败'));
        }
      });
    });
  }
}

module.exports = Request;