/**
 * api.js - 网络请求API封装工具
 * 用于统一管理和处理所有网络请求，提供缓存、重试、错误处理等功能
 */

const { showToast, handleApiResponse } = require('./global');
const { CACHE_KEYS, CACHE_DURATION, setCache, getCache, removeCache, clearCacheByPrefix } = require('./cache');

// API基础URL配置
const baseURL = 'https://api.example.com/api';

// 默认请求头
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API缓存前缀
const API_CACHE_PREFIX = 'api_cache_';

// 请求取消控制器映射
const abortControllers = new Map();

// 默认Token
let defaultToken = '';

/**
 * 生成缓存键
 * @param {string} url - 请求URL
 * @param {Object} params - 请求参数
 * @returns {string} 缓存键
 */
const generateCacheKey = (url, params) => {
  if (!params || Object.keys(params).length === 0) {
    return `${API_CACHE_PREFIX}${url}`;
  }
  return `${API_CACHE_PREFIX}${url}_${JSON.stringify(params)}`;
};

/**
 * 网络请求API封装
 * @param {string} url - API接口路径
 * @param {Object} options - 请求配置选项
 * @param {string} options.method - 请求方法，默认'GET'
 * @param {Object} options.data - 请求数据
 * @param {Object} options.headers - 请求头
 * @param {number} options.timeout - 请求超时时间，默认30000ms
 * @param {number} options.retryCount - 重试次数，默认0
 * @param {boolean} options.useCache - 是否使用缓存，仅GET请求有效
 * @param {number} options.cacheDuration - 缓存持续时间
 * @param {string} options.abortKey - 请求取消标识
 * @returns {Promise} - 返回Promise对象
 */
const request = async (url, options = {}) => {
  // 获取token，从默认值或本地存储中
  const token = defaultToken || wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token') || '';
  
  // 处理请求头
  const headers = {
    ...defaultHeaders,
    ...options.headers
  };
  
  // 如果有token，添加到请求头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 构建完整URL
  const fullUrl = `${baseURL}${url}`;
  
  // 处理GET请求的缓存
  const method = options.method || 'GET';
  if (method === 'GET' && options.useCache) {
    const cacheKey = generateCacheKey(url, options.data);
    try {
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        console.log('使用缓存数据', cacheKey);
        return cachedData;
      }
    } catch (error) {
      console.warn('获取缓存失败', error);
    }
  }
  
  // 处理请求取消
  let abortController;
  if (options.abortKey) {
    // 取消之前的相同key的请求
    if (abortControllers.has(options.abortKey)) {
      abortControllers.get(options.abortKey).abort();
      abortControllers.delete(options.abortKey);
    }
    
    // 创建新的取消控制器
    abortController = new AbortController();
    abortControllers.set(options.abortKey, abortController);
  }
  
  try {
    const response = await wx.request({
      url: fullUrl,
      method: method,
      data: options.data,
      header: headers,
      timeout: options.timeout || 30000,
      enableHttp2: true,
      enableQuic: true,
      enableCache: false, // 禁用系统缓存
      ...(abortController ? { signal: abortController.signal } : {})
    });
    
    // 移除取消控制器
    if (options.abortKey) {
      abortControllers.delete(options.abortKey);
    }
    
    // 处理响应
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // 使用统一的API响应处理
      const processedResult = handleApiResponse(response.data);
      
      // 处理未授权错误
      if (response.data.code === 401) {
        wx.removeStorageSync('userToken');
        wx.removeStorageSync('jwt_token');
        wx.removeStorageSync('userInfo');
        defaultToken = '';
        wx.redirectTo({ url: '/pages/user/login/login' });
      }
      
      const result = processedResult.data || response.data; // 返回data字段或整个响应
      
      // 设置缓存
      if (method === 'GET' && options.useCache) {
        const cacheKey = generateCacheKey(url, options.data);
        const duration = options.cacheDuration || CACHE_DURATION.MEDIUM;
        try {
          setCache(cacheKey, result, duration);
        } catch (error) {
          console.warn('设置缓存失败', error);
        }
      }
      
      return result;
    } else {
      throw new Error(`请求失败: ${response.statusCode}`);
    }
  } catch (error) {
    // 处理请求取消
    if (error.name === 'AbortError') {
      console.log('请求已取消');
      return null;
    }
    
    // 处理网络错误
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      throw new Error('网络请求失败');
    }
    
    // 处理重试逻辑
    if (options.retryCount === undefined) {
      options.retryCount = 0;
    }
    
    // 如果未达到最大重试次数，进行重试
    if (options.retryCount < 2) {
      options.retryCount++;
      console.log(`请求重试，第${options.retryCount}次`);
      return request(url, options);
    }
    
    // 显示错误提示
    if (!options.noErrorToast) {
      showToast(error.message || '网络请求失败', 'none');
    }
    throw error;
  }
};

/**
 * 设置默认Token
 * @param {string} token - 用户Token
 */
const setToken = (token) => {
  defaultToken = token;
};

/**
 * 取消请求
 * @param {string} abortKey - 请求标识
 */
const cancelRequest = (abortKey) => {
  if (abortControllers.has(abortKey)) {
    abortControllers.get(abortKey).abort();
    abortControllers.delete(abortKey);
    console.log('请求已取消', abortKey);
  }
};

/**
 * 取消所有请求
 */
const cancelAllRequests = () => {
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
  console.log('所有请求已取消');
};

/**
 * 清除缓存
 * @param {string} url - API接口路径
 * @param {Object} params - 请求参数
 */
const clearCache = (url, params) => {
  try {
    const cacheKey = generateCacheKey(url, params);
    removeCache(cacheKey);
    console.log('缓存已清除', cacheKey);
  } catch (error) {
    console.error('清除缓存失败', error);
  }
};

/**
 * 清除所有API缓存
 */
const clearAllCache = () => {
  try {
    clearCacheByPrefix(API_CACHE_PREFIX);
    console.log('所有API缓存已清除');
  } catch (error) {
    console.error('清除所有缓存失败', error);
  }
};

/**
 * 文件上传功能封装
 * @param {string} url - 上传API路径
 * @param {Object} data - 表单数据
 * @param {Object} file - 文件对象 {path: string, name?: string}
 * @param {Object} options - 上传选项
 * @returns {Promise} - 返回Promise对象
 */
const uploadFile = (url, data, file, options = {}) => {
  return new Promise((resolve, reject) => {
    const token = defaultToken || wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token') || '';
    
    // 处理请求取消
    if (options.abortKey) {
      // 取消之前的相同key的请求
      if (abortControllers.has(options.abortKey)) {
        abortControllers.get(options.abortKey).abort();
        abortControllers.delete(options.abortKey);
      }
    }
    
    wx.uploadFile({
      url: `${baseURL}${url}`,
      filePath: file.path,
      name: file.name || 'file',
      formData: data,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        // 移除取消控制器
        if (options.abortKey) {
          abortControllers.delete(options.abortKey);
        }
        
        try {
          const response = JSON.parse(res.data);
          const processedResult = handleApiResponse(response);
          
          if (processedResult.success) {
            resolve(processedResult.data || response);
          } else {
            showToast(processedResult.message || '上传失败', 'none');
            reject(new Error(processedResult.message || '上传失败'));
          }
        } catch (error) {
          showToast('上传失败，请重试', 'none');
          reject(error);
        }
      },
      fail: (error) => {
        // 移除取消控制器
        if (options.abortKey) {
          abortControllers.delete(options.abortKey);
        }
        
        // 处理网络错误
        if (error.errMsg && error.errMsg.includes('uploadFile:fail')) {
          reject(new Error('上传请求失败'));
          return;
        }
        
        showToast('网络连接异常，请稍后重试', 'none');
        reject(error);
      }
    });
  });
};

/**
 * 批量上传文件
 * @param {string} url - 上传API路径
 * @param {Object} data - 表单数据
 * @param {Array} files - 文件对象数组 [{path: string, name?: string}]
 * @param {Object} options - 上传选项
 * @returns {Promise} - 返回Promise对象
 */
const uploadFiles = (url, data, files, options = {}) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return Promise.resolve([]);
  }
  
  const uploadPromises = files.map((file, index) => {
    const fileData = { ...data, fileIndex: index };
    return uploadFile(url, fileData, file, options);
  });
  
  return Promise.all(uploadPromises);
};

// API模块对象
const apiModule = {
  // GET请求
  get: (url, params, options = {}) => request(url, { ...options, method: 'GET', data: params }),
  
  // POST请求
  post: (url, data, options = {}) => request(url, { ...options, method: 'POST', data }),
  
  // PUT请求
  put: (url, data, options = {}) => request(url, { ...options, method: 'PUT', data }),
  
  // DELETE请求
  delete: (url, data, options = {}) => request(url, { ...options, method: 'DELETE', data }),
  
  // PATCH请求
  patch: (url, data, options = {}) => request(url, { ...options, method: 'PATCH', data }),
  
  // 文件上传
  upload: uploadFile,
  
  // 批量文件上传
  uploadFiles: uploadFiles,
  
  // 工具方法
  setToken,
  cancelRequest,
  cancelAllRequests,
  clearCache,
  clearAllCache
};

// 导出模块
module.exports = apiModule;
// 为了兼容性，额外导出单个方法
module.exports.setToken = setToken;
module.exports.cancelRequest = cancelRequest;
module.exports.cancelAllRequests = cancelAllRequests;
module.exports.clearCache = clearCache;
module.exports.clearAllCache = clearAllCache;