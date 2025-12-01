/**
 * 文件名: request.js
 * 版本号: 1.1.1
 * 更新日期: 2025-11-27
 * 作者: Sut
 * 描述: 网络请求工具类，处理API请求、缓存策略、签名验证等
 */

const signature = require('./signature.js');
const i18n = require('./i18n.js');
const store = require('./store.js');
const cacheService = require('./cacheService.js').instance;
const CACHE_POLICY = require('./cacheService.js').CACHE_POLICY;

// API配置信息
const API_CONFIG = {
  BASE_URL: 'https://api.example.com/v1', // 生产环境API地址
  TEST_URL: 'https://test-api.example.com/v1', // 测试环境API地址
  USE_TEST: false, // 是否使用测试环境
  TIMEOUT: 30000, // 请求超时时间，单位毫秒
  RETRY_COUNT: 3, // 请求重试次数
  SECRET_KEY: '' // API密钥，用于签名验证
};

// 初始化API密钥
(function initApiSecretKey() {
  try {
    // 从本地存储获取API密钥
    const secretKey = wx.getStorageSync('api_secret_key');
    if (secretKey) {
      API_CONFIG.SECRET_KEY = secretKey;
    } else {
      // 非测试环境下，API密钥不存在时输出警告
      if (!API_CONFIG.USE_TEST) {
        console.error('API密钥未找到，请确保已在本地存储中设置api_secret_key');
      }
    }
  } catch (error) {
    console.error('初始化API密钥失败:', error);
  }
})();

/**
   * 网络请求类
   */
class Request {
  /**
   * 发起API请求
   * @param {Object} options - 请求配置选项
   * @param {string} options.url - 请求URL
   * @param {string} options.method - 请求方法: GET/POST/PUT/DELETE
   * @param {Object} options.data - 请求数据
   * @param {Object} options.header - 请求头
   * @param {boolean} options.needAuth - 是否需要认证
   * @param {boolean} options.needSign - 是否需要签名
   * @param {Object} options.cache - 缓存配置
   * @param {string} options.cache.policy - 缓存策略: 'NETWORK_FIRST', 'CACHE_FIRST', 'STALE_WHILE_REVALIDATE', 'ONLY_NETWORK', 'ONLY_CACHE'
   * @param {number} options.cache.maxAge - 缓存最大有效期，单位毫秒
   * @returns {Promise} 请求结果Promise
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
    
    // 构建请求选项
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
    
    // 添加签名信息
    if (needSign) {
      requestOptions = signature.addSignatureToHeaders(
        requestOptions,
        API_CONFIG.SECRET_KEY
      );
    }
    
    // 检查是否启用缓存
    const cacheEnabled = method === 'GET' && cacheService && cache.policy;
    const cacheKey = this._generateCacheKey(requestOptions);
    
    // 根据缓存策略处理请求
    if (cacheEnabled) {
      switch (cache.policy) {
        case CACHE_POLICY.CACHE_FIRST:
          // 优先使用缓存
          const cachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (cachedData) {
            return cachedData;
          }
          // 缓存不存在时从网络获取并缓存
          const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          await cacheService.set(cacheKey, result, cache.maxAge);
          return result;
          
        case CACHE_POLICY.ONLY_CACHE:
          // 仅使用缓存
          const onlyCachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (onlyCachedData) {
            return onlyCachedData;
          }
          throw new Error(i18n.translate('offline_data_unavailable') || '离线数据不可用');
          
        case CACHE_POLICY.NETWORK_FIRST:
          try {
            // 优先从网络获取
            const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
            await cacheService.set(cacheKey, result, cache.maxAge);
            return result;
          } catch (error) {
            // 网络请求失败时使用缓存
            const fallbackData = await cacheService.get(cacheKey);
            if (fallbackData) {
              return fallbackData;
            }
            throw error;
          }
          
        case CACHE_POLICY.STALE_WHILE_REVALIDATE:
          // 返回过期数据并异步更新
          const staleData = await cacheService.get(cacheKey);
          
          // 异步更新缓存
          this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT)
            .then(result => {
              cacheService.set(cacheKey, result, cache.maxAge);
            })
            .catch(error => {
              console.warn('异步更新缓存失败:', error);
            });
          
          // 如果有过期数据则返回，否则从网络获取
          if (staleData) {
            return staleData;
          }
          
          // 没有过期数据时从网络获取
          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          
        case CACHE_POLICY.ONLY_NETWORK:
        default:
          // 仅从网络获取
          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
      }
    }
    
    // 不使用缓存时直接从网络获取
    return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
  }
  
  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他配置选项
   * @returns {Promise} 请求结果Promise
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
   * @param {Object} options - 其他配置选项
   * @returns {Promise} 请求结果Promise
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
   * @param {Object} options - 其他配置选项
   * @returns {Promise} 请求结果Promise
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
   * @param {Object} options - 其他配置选项
   * @returns {Promise} 请求结果Promise
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
   * 构建完整的请求URL
   * @private
   * @param {string} url - 相对或绝对URL
   * @returns {string} 完整URL
   */
  static _buildUrl(url) {
    // 如果是绝对URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 根据环境选择基础URL
    const baseUrl = API_CONFIG.USE_TEST ? API_CONFIG.TEST_URL : API_CONFIG.BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  /**
   * 生成缓存键
   * @private
   * @param {Object} requestOptions - 请求配置选项
   * @returns {string} 缓存键
   */
  static _generateCacheKey(requestOptions) {
    const { url, data, method } = requestOptions;
    // 将请求数据转换为字符串
    const dataString = typeof data === 'string' ? data : JSON.stringify(data || {});
    // 使用MD5生成缓存键
    const hash = require('./crypto.js').md5(`${method}:${url}:${dataString}`);
    return hash;
  }
  
  /**
   * 获取认证令牌
   * @private
   * @returns {string|null} 认证令牌
   */
  static _getAuthToken() {
    try {
      // 从store获取令牌
      const token = store.getState('user.token');
      if (token) {
        return token;
      }
      
      // 从本地存储获取令牌
      return wx.getStorageSync('token') || null;
    } catch (error) {
      console.error('获取认证令牌失败:', error);
      return null;
    }
  }
  
  /**
   * 执行请求并处理重试
   * @private
   * @param {Object} options - 请求配置选项
   * @param {number} retryCount - 剩余重试次数
   * @returns {Promise} 请求结果Promise
   */
  static _executeWithRetry(options, retryCount) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          // 处理响应
          if (res.statusCode === 401) {
            // 未授权，清除用户信息和令牌
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
          // 请求失败，处理重试
          if (retryCount > 0) {
            // 指数退避重试
            setTimeout(() => {
              this._executeWithRetry(options, retryCount - 1)
                .then(resolve)
                .catch(reject);
            }, 1000 * Math.pow(2, API_CONFIG.RETRY_COUNT - retryCount)); // 指数退避
          } else {
            // 达到最大重试次数
            reject(new Error(i18n.translate('network_error') || '网络请求失败'));
          }
        },
        complete: () => {
          // 请求完成，更新加载状态
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
    // 清除用户信息和令牌
    store.commit('SET_USER_INFO', null);
    store.commit('SET_TOKEN', null);
    
    // 清除本地存储中的令牌和用户信息
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    } catch (error) {
      console.error('清除本地存储失败:', error);
    }
    
    // 显示登录提示
    wx.showToast({
      title: i18n.translate('login_required'),
      icon: 'none'
    });
  }
  
  /**
   * 清除指定URL的缓存
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @returns {Promise<boolean>} 清除结果
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
   * 清除所有缓存
   * @returns {Promise<boolean>} 清除结果
   */
  static async clearAllCache() {
    if (!cacheService) return false;
    return await cacheService.clear('request');
  }
  
  /**
   * 上传文件
   * @param {string} url - 上传URL
   * @param {string} filePath - 文件路径
   * @param {Object} options - 其他配置选项
   * @returns {Promise} 上传结果Promise
   */
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
              reject(new Error(data.message || '文件上传失败'));
            }
          } catch (error) {
            reject(new Error('上传响应解析失败'));
          }
        },
        fail: (err) => {
          reject(new Error('文件上传失败'));
        }
      });
    });
  }
}

module.exports = Request;