/**
 * points-service.js - 用户积分服务模块
 * 提供积分相关的API调用、缓存管理和业务逻辑处理
 * 用户积分操作服务
 */
const api = require('./api');
const { showToast, getStorage, setStorage } = require('./global');

/**
 * 缓存配置常量
 */
const CACHE_CONFIG = {
  DURATION: {
    USER_POINTS_INFO: 1 * 60 * 1000, // 1分钟缓存
    USER_POINTS: 1 * 60 * 1000, // 1分钟缓存
    POINTS_RULES: 5 * 60 * 1000, // 5分钟缓存
    POINTS_TASKS: 30 * 60 * 1000, // 30分钟缓存
    SIGNIN_STATUS: 10 * 60 * 1000, // 10分钟缓存
    SIGNIN_RECORDS: 10 * 60 * 1000, // 10分钟缓存
    MALL_PRODUCTS: 30 * 60 * 1000, // 30分钟缓存
    MALL_PRODUCT_DETAIL: 15 * 60 * 1000 // 15分钟缓存
  },
  PREFIX: 'cache_points_',
  KEYS: {
    USER_POINTS: 'cache_user_points',
    USER_POINTS_INFO: 'cache_user_points_info',
    POINTS_RULES: 'cache_points_rules',
    SIGNIN_STATUS: 'cache_signin_status',
    TASKS_PREFIX: 'cache_points_tasks_',
    MALL_PREFIX: 'cache_points_mall_'
  }
};

/**
 * 请求节流管理器类
 * 用于管理API请求的节流和缓存
 */
class RequestThrottleManager {
  constructor() {
    this.pendingRequests = new Map(); // 存储待处理的请求
    this.throttleTimers = new Map(); // 存储节流计时器
  }

  /**
   * 创建请求键值
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @returns {string} - 请求唯一标识
   */
  _createRequestKey(url, params = {}) {
    return `${url}_${JSON.stringify(params)}`;
  }

  /**
   * 节流请求处理
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @param {Function} requestFn - 请求函数
   * @param {number} throttleMs - 节流时间（毫秒）
   * @returns {Promise} - 请求结果Promise
   */
  throttleRequest(url, params = {}, requestFn, throttleMs = 500) {
    const requestKey = this._createRequestKey(url, params);
    
    // 如果有相同的请求正在处理中，返回该请求的Promise
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // 如果有节流缓存且缓存结果有效，直接返回缓存结果
    if (this.throttleTimers.has(requestKey)) {
      const timerObj = this.throttleTimers.get(requestKey);
      // 如果缓存有结果，直接返回
      if (timerObj.result !== undefined) {
        return Promise.resolve(timerObj.result);
      }
    }

    // 创建新的请求Promise
    const requestPromise = requestFn();
    
    // 存储待处理请求
    this.pendingRequests.set(requestKey, requestPromise);
    
    // 请求完成后清理待处理状态
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey);
    });
    
    // 更新节流缓存（在实际场景中可能需要额外的定时器处理）
    
    return requestPromise;
  }

  /**
   * 更新节流缓存
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @param {*} result - 请求结果
   */
  updateThrottleCache(url, params, result) {
    const requestKey = this._createRequestKey(url, params);
    if (this.throttleTimers.has(requestKey)) {
      this.throttleTimers.get(requestKey).result = result;
    }
  }

  /**
   * 清理指定URL前缀的节流缓存
   * @param {string} url - 请求URL前缀
   */
  clearThrottleCache(url) {
    for (const key of this.throttleTimers.keys()) {
      if (key.startsWith(url)) {
        clearTimeout(this.throttleTimers.get(key).timer);
        this.throttleTimers.delete(key);
      }
    }
  }
}

// 创建请求管理器实例
const requestManager = new RequestThrottleManager();

/**
 * 缓存管理器类
 */
class CacheManager {
  /**
   * 获取缓存
   * @param {string} key - 缓存键名
   * @param {number} maxAge - 最大缓存时间（毫秒）
   * @returns {*} - 缓存数据或null
   */
  static getCache(key, maxAge) {
    try {
      const cachedData = wx.getStorageSync(key);
      if (cachedData) {
        const now = Date.now();
        if (!maxAge || now - cachedData.timestamp < maxAge) {
          return cachedData.data;
        }
      }
    } catch (error) {
      console.error('获取缓存失败:', error);
    }
    return null;
  }

  static setCache(key, data) {
    try {
      wx.setStorageSync(key, {
        data: data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  }

  static clearCache(key) {
    try {
      wx.removeStorageSync(key);
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  static clearAllPointsCache() {
    try {
      const allKeys = wx.getStorageInfoSync().keys || [];
      allKeys.forEach(key => {
        if (key && key.includes(CACHE_CONFIG.PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('清除所有积分相关缓存失败:', error);
    }
  }

  static get(key) {
    return this.getCache(key);
  }
}

/**
 * 错误处理类
 */
class ErrorHandler {
  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} operation - 操作名称
   * @param {boolean} showMessage - 是否显示错误消息
   */
  static handleError(error, operation, showMessage = false) {
    console.error(`${operation}失败:`, error);
    
    if (showMessage) {
      let errorMessage = '操作失败，请稍后重试';
      
      // 根据错误类型或状态码显示不同的错误信息
      if (error && error.statusCode === 401) {
        errorMessage = '登录状态已过期，请重新登录';
      } else if (error && error.statusCode === 403) {
        errorMessage = '您没有权限执行此操作';
      } else if (error && error.statusCode === 429) {
        errorMessage = '操作过于频繁，请稍后重试';
      } else if (error && error.statusCode >= 500) {
        errorMessage = '服务器繁忙，请稍后重试';
      }
      
      showToast(errorMessage);
    }
    
    return error;
  }
}

/**
 * 构建API URL
 * @param {string} path - API路径
 * @returns {string} - 完整的API URL
 */
function buildApiUrl(path) {
  // 确保路径以/开头
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  // 确保路径以/api开头
  if (!path.startsWith('/api')) {
    path = '/api' + path;
  }
  return path;
}

/**
 * 积分服务对象
 */
const pointsService = {
  /**
   * 获取用户积分信息
   * @returns {Promise<Object>} 用户积分信息
   */
  getUserPointsInfo: async () => {
    const url = '/api/points/info';
    const cacheKey = CACHE_CONFIG.KEYS.USER_POINTS_INFO;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.USER_POINTS_INFO);
      if (cachedData) {
        return cachedData;
      }
      
      // 发送请求
      const result = await api.get(buildApiUrl(url));
      
      // 缓存结果
      CacheManager.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取用户积分信息', true);
      throw error;
    }
  },

  /**
   * 获取积分规则
   * @returns {Promise<Object>} 积分规则
   */
  getPointsRules: async () => {
    const url = '/api/points/rules';
    const cacheKey = CACHE_CONFIG.KEYS.POINTS_RULES;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.POINTS_RULES);
      if (cachedData) {
        return cachedData;
      }
      
      // 发送请求
      const result = await api.get(buildApiUrl(url));
      
      // 缓存结果
      CacheManager.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取积分规则', true);
      throw error;
    }
  },

  /**
   * 获取积分任务列表
   * @param {Object} params - 查询参数
   * @param {string} params.type - 任务类型：all/once/daily/weekly/monthly
   * @param {string} params.status - 任务状态：all/pending/completed/unclaimed
   * @param {number} params.page - 页码，默认为1
   * @param {number} params.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 任务列表和分页信息
   */
  getPointsTasks: async (params = {}) => {
    const url = '/api/points/tasks';
    const queryParams = {
      type: params.type || 'all',
      status: params.status || 'all',
      page: params.page || 1,
      pageSize: params.pageSize || 20
    };
    
    const cacheKey = `${CACHE_CONFIG.KEYS.TASKS_PREFIX}${queryParams.type}_${queryParams.status}_${queryParams.page}`;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.POINTS_TASKS);
      if (cachedData) {
        return cachedData;
      }
      
      // 发送请求
      const result = await api.get(buildApiUrl(url), queryParams);
      
      // 格式化结果
      const formattedResult = {
        list: result.tasks || [],
        total: result.total || 0,
        page: queryParams.page,
        pageSize: queryParams.pageSize,
        hasMore: (result.tasks && result.tasks.length === queryParams.pageSize) || false
      };
      
      // 缓存结果
      CacheManager.setCache(cacheKey, formattedResult);
      
      return formattedResult;
    } catch (error) {
      ErrorHandler.handleError(error, '获取积分任务列表', true);
      throw error;
    }
  },

  /**
   * 获取任务详情
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务详情
   */
  getTaskDetail: async (taskId) => {
    const url = `/api/points/tasks/${taskId}`;
    
    try {
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl(url),
          method: 'GET',
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve(res.data.data || { id: taskId, title: '测试任务' });
            } else {
              reject(new Error(res.data && res.data.message || '获取任务详情失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '获取任务详情', true);
      throw error;
    }
  },

  /**
   * 提交任务进度
   * @param {string} taskId - 任务ID
   * @param {Object} progressData - 进度数据
   * @returns {Promise<Object>} 提交结果
   */
  submitTaskProgress: async (taskId, progressData) => {
    try {
      const url = `/api/points/tasks/${taskId}/progress`;
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl(url),
          method: 'POST',
          data: progressData,
          header: { 'content-type': 'application/json' },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve({ 
                success: true, 
                taskId: taskId, 
                progress: progressData.progress 
              });
            } else {
              reject(new Error(res.data && res.data.message || '提交任务进度失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '提交任务进度', true);
      throw error;
    }
  },

  /**
   * 领取任务奖励
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 领取结果
   */
  claimTaskReward: async (taskId) => {
    try {
      const url = `/api/points/tasks/${taskId}/claim`;
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl(url),
          method: 'POST',
          success: (res) => {
            if (res.data && res.data.code === 0) {
              // 清除用户积分缓存
              wx.removeStorageSync('user_points');
              CacheManager.clearCache(CACHE_CONFIG.KEYS.USER_POINTS_INFO);
              resolve(res.data.data);
            } else {
              reject(new Error(res.data && res.data.message || '领取奖励失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '领取任务奖励', true);
      throw error;
    }
  },

  /**
   * 获取任务历史记录
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 历史记录
   */
  getTaskHistory: async (params = {}) => {
    const url = '/points/tasks/history';
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20
    };
    
    try {
      const result = await api.get(buildApiUrl(url), queryParams);
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取任务历史记录', true);
      throw error;
    }
  },

  /**
   * 完成积分任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 完成结果
   */
  completePointsTask: async (taskId) => {
    try {
      const url = `/points/tasks/${taskId}/complete`;
      const result = await api.post(buildApiUrl(url));
      
      // 清除任务缓存
      pointsService.clearTaskCache();
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '完成积分任务', true);
      throw error;
    }
  },

  /**
   * 清除任务缓存
   */
  clearTaskCache: () => {
    try {
      // 兼容旧版本缓存清除
      try {
        const allKeys = wx.getStorageInfoSync().keys || [];
        allKeys.forEach(key => {
          if (key && key.includes('tasks_')) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('清除旧任务缓存失败:', error);
      }
      
      // 清除新版本缓存
      try {
        const allKeys = wx.getStorageInfoSync().keys || [];
        allKeys.forEach(key => {
          if (key.startsWith(CACHE_CONFIG.KEYS.TASKS_PREFIX)) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('清除任务缓存失败:', error);
      }
    } catch (error) {
      console.error('清除任务缓存异常:', error);
    }
  },

  /**
   * 清除积分缓存
   */
  clearPointsCache: () => {
    try {
      // 兼容旧版本缓存清除
      try {
        wx.removeStorageSync('user_points');
        wx.removeStorageSync('points_info');
      } catch (error) {
        console.error('清除旧积分缓存失败:', error);
      }
      
      // 清除新版本缓存
      try {
        wx.removeStorageSync(CACHE_CONFIG.KEYS.USER_POINTS);
        wx.removeStorageSync(CACHE_CONFIG.KEYS.USER_POINTS_INFO);
      } catch (error) {
        console.error('清除积分缓存失败:', error);
      }
    } catch (error) {
      console.error('清除积分缓存异常:', error);
    }
  },

  /**
   * 积分兑换
   * @param {string} productId - 产品ID
   * @param {number} quantity - 数量
   * @returns {Promise<Object>} 兑换结果
   */
  exchangePoints: async (productId, quantity = 1) => {
    try {
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl('/api/points/exchange'),
          method: 'POST',
          data: { productId, quantity },
          header: { 'content-type': 'application/json' },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              // 清除用户积分缓存
              wx.removeStorageSync('user_points');
              CacheManager.clearCache(CACHE_CONFIG.KEYS.USER_POINTS_INFO);
              resolve(res.data.data);
            } else {
              reject(new Error(res.data && res.data.message || '积分兑换失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '积分兑换', true);
      throw error;
    }
  },

  /**
   * 获取用户积分历史记录
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 积分历史记录
   */
  getUserPointsHistory: async (params = {}) => {
    const url = '/api/points/records';
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      type: params.type || 'all'
    };
    
    if (params.dateRange) {
      queryParams.dateRange = params.dateRange;
    }
    
    try {
      const result = await api.get(buildApiUrl(url), queryParams);
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取积分历史记录', true);
      throw error;
    }
  },

  /**
   * 获取积分商城产品列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 产品列表
   */
  getPointsMallProducts: async (params = {}) => {
    const url = '/api/points/mall/products';
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      type: params.type || 'all'
    };
    
    const cacheKey = `${CACHE_CONFIG.KEYS.MALL_PREFIX}products_${queryParams.type}_${queryParams.page}`;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.MALL_PRODUCTS);
      if (cachedData) {
        return cachedData;
      }
      
      const result = await api.get(buildApiUrl(url), queryParams);
      
      // 缓存结果
      CacheManager.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取积分商城产品列表', true);
      throw error;
    }
  },

  /**
   * 获取积分商城产品详情
   * @param {string} productId - 产品ID
   * @returns {Promise<Object>} 产品详情
   */
  getPointsMallProductDetail: async (productId) => {
    const url = `/api/points/mall/products/${productId}`;
    const cacheKey = `${CACHE_CONFIG.KEYS.MALL_PREFIX}product_${productId}`;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.MALL_PRODUCT_DETAIL);
      if (cachedData) {
        return cachedData;
      }
      
      const result = await api.get(buildApiUrl(url));
      
      // 缓存结果
      CacheManager.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, `获取积分商城产品详情[${productId}]`, true);
      throw error;
    }
  },

  /**
   * 兑换积分产品
   * @param {Object} params - 兑换参数
   * @returns {Promise<Object>} 兑换结果
   */
  exchangePointsProduct: async (params) => {
    try {
      const url = '/api/points/exchange';
      const requestData = {
        productId: params.productId,
        addressId: params.addressId
      };
      
      const result = await api.post(buildApiUrl(url), requestData);
      
      // 清除相关缓存
      requestManager.clearThrottleCache('/api/user/profile');
      requestManager.clearThrottleCache('/api/points/info');
      
      // 清除商城相关缓存
      try {
        const allKeys = wx.getStorageInfoSync().keys || [];
        allKeys.forEach(key => {
          if (key && (key.includes('mall') || key.includes('products'))) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('清除商城缓存失败:', error);
      }
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '积分兑换产品', true);
      throw error;
    }
  },

  /**
   * 获取积分兑换记录
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 兑换记录
   */
  getPointsExchangeRecords: async (params = {}) => {
    const url = '/api/points/exchange-records';
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      status: params.status || ''
    };
    
    try {
      const result = await api.get(buildApiUrl(url), queryParams);
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取积分兑换记录', true);
      throw error;
    }
  },

  /**
   * 用户签到
   * @returns {Promise<Object>} 签到结果
   */
  signIn: async () => {
    try {
      const url = '/api/points/signin';
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl(url),
          method: 'POST',
          header: { 'content-type': 'application/json' },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              // 清除签到状态缓存
              CacheManager.clearCache(CACHE_CONFIG.KEYS.SIGNIN_STATUS);
              // 清除用户积分缓存
              CacheManager.clearCache(CACHE_CONFIG.KEYS.USER_POINTS_INFO);
              resolve(res.data.data);
            } else {
              reject(new Error(res.data && res.data.message || '签到失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '用户签到', true);
      throw error;
    }
  },

  /**
   * 获取用户签到状态
   * @returns {Promise<Object>} 签到状态
   */
  getUserSignInStatus: async () => {
    const url = '/api/points/signin';
    const cacheKey = CACHE_CONFIG.KEYS.SIGNIN_STATUS;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.SIGNIN_STATUS);
      if (cachedData) {
        return cachedData;
      }
      
      const result = await api.get(buildApiUrl(url));
      
      // 缓存结果
      CacheManager.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取签到状态', true);
      throw error;
    }
  },

  /**
   * 获取用户签到记录
   * @returns {Promise<Object>} 签到记录
   */
  getUserSignInRecords: async () => {
    const url = '/api/points/signin-records';
    const cacheKey = `${CACHE_CONFIG.KEYS.PREFIX}signin_records`;
    
    try {
      // 尝试从缓存获取
      const cachedData = CacheManager.getCache(cacheKey, CACHE_CONFIG.DURATION.SIGNIN_RECORDS);
      if (cachedData) {
        return cachedData;
      }
      
      const result = await api.get(buildApiUrl(url));
      
      // 缓存结果
      CacheManager.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '获取签到记录', true);
      throw error;
    }
  },

  /**
   * 使用积分抵扣订单
   * @param {string} orderId - 订单ID
   * @param {number} points - 使用积分数量
   * @returns {Promise<Object>} 使用结果
   */
  usePointsForOrder: async (orderId, points) => {
    try {
      const url = '/api/points/use-for-order';
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl(url),
          method: 'POST',
          data: { orderId, points },
          header: { 'content-type': 'application/json' },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              // 清除用户积分缓存
              CacheManager.clearCache(CACHE_CONFIG.KEYS.USER_POINTS_INFO);
              resolve(res.data.data);
            } else {
              reject(new Error(res.data && res.data.message || '使用积分抵扣失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '使用积分抵扣订单', true);
      throw error;
    }
  },

  /**
   * 兑换优惠券
   * @param {string} couponId - 优惠券ID
   * @returns {Promise<Object>} 兑换结果
   */
  exchangeCoupon: async (couponId) => {
    try {
      const url = `/points/coupons/${couponId}/exchange`;
      const result = await api.post(buildApiUrl(url));
      
      // 清除相关缓存
      requestManager.clearThrottleCache('/api/user/profile');
      requestManager.clearThrottleCache('/api/points/info');
      
      return result;
    } catch (error) {
      ErrorHandler.handleError(error, '兑换优惠券', true);
      throw error;
    }
  },

  /**
   * 处理分享任务
   * @param {string} taskId - 任务ID
   * @param {Object} shareData - 分享数据
   * @returns {Promise<Object>} 处理结果
   */
  handleShareTask: async (taskId, shareData = {}) => {
    try {
      const url = `/api/points/tasks/${taskId}/share`;
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: buildApiUrl(url),
          method: 'POST',
          data: shareData,
          header: { 'content-type': 'application/json' },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              resolve(res.data.data);
            } else {
              reject(new Error(res.data && res.data.message || '处理分享任务失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '处理分享任务', true);
      throw error;
    }
  }
};

// 兼容旧版API名称
pointsService.getPointsHistory = pointsService.getUserPointsHistory;
pointsService.getPointsProducts = pointsService.getPointsMallProducts;
pointsService.getPointsProductDetail = pointsService.getPointsMallProductDetail;
pointsService.getExchangeRecords = pointsService.getPointsExchangeRecords;
pointsService.getExchangeHistory = pointsService.getExchangeRecords;
pointsService.checkIn = pointsService.signIn;
pointsService.doUserSignIn = pointsService.signIn;
pointsService.getSignInRecords = pointsService.getUserSignInRecords;
pointsService.getCheckInHistory = pointsService.getSignInRecords;

// 默认导出
module.exports = pointsService;

// 单独导出各个方法（便于按需引入）
module.exports.getUserPointsInfo = pointsService.getUserPointsInfo;
module.exports.getPointsRules = pointsService.getPointsRules;
module.exports.getPointsTasks = pointsService.getPointsTasks;
module.exports.getTaskDetail = pointsService.getTaskDetail;
module.exports.submitTaskProgress = pointsService.submitTaskProgress;
module.exports.claimTaskReward = pointsService.claimTaskReward;
module.exports.getTaskHistory = pointsService.getTaskHistory;
module.exports.completePointsTask = pointsService.completePointsTask;
module.exports.clearTaskCache = pointsService.clearTaskCache;
module.exports.getUserPointsHistory = pointsService.getUserPointsHistory;
module.exports.getPointsMallProducts = pointsService.getPointsMallProducts;
module.exports.getPointsMallProductDetail = pointsService.getPointsMallProductDetail;
module.exports.exchangePointsProduct = pointsService.exchangePointsProduct;
module.exports.getPointsExchangeRecords = pointsService.getPointsExchangeRecords;
module.exports.signIn = pointsService.signIn;
module.exports.getUserSignInStatus = pointsService.getUserSignInStatus;
module.exports.getUserSignInRecords = pointsService.getUserSignInRecords;
module.exports.usePointsForOrder = pointsService.usePointsForOrder;
module.exports.exchangeCoupon = pointsService.exchangeCoupon;
module.exports.clearPointsCache = pointsService.clearPointsCache;
module.exports.handleShareTask = pointsService.handleShareTask;

// 兼容旧版方法名
module.exports.getPointsHistory = pointsService.getUserPointsHistory;
module.exports.getExchangeHistory = pointsService.getPointsExchangeRecords;
module.exports.checkIn = pointsService.signIn;
module.exports.doUserSignIn = pointsService.signIn;
module.exports.getSignInRecords = pointsService.getUserSignInRecords;
module.exports.getCheckInHistory = pointsService.getUserSignInRecords;
