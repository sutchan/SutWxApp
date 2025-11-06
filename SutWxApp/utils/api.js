// api.js - 统一API请求模块
// 基于技术设计文档实现的增强版API请求模块

import { showToast } from './global';
import { CACHE_KEYS, CACHE_DURATION } from './cache';
import { setCache, getCache, removeCache, clearCacheByPrefix } from './cache';

// API基础地址，可根据环境配置
const baseURL = 'https://您的网站域名/wp-json/sut-wechat-mini/v1';

// 默认请求头
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API缓存前缀
const API_CACHE_PREFIX = 'api_cache_';

// 请求取消控制器存储
const abortControllers = new Map();

// 默认token
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
 * 统一API请求方法
 * @param {string} url - API接口路径
 * @param {Object} options - 请求配置项
 * @param {string} options.method - 请求方法，默认'GET'
 * @param {Object} options.data - 请求数据
 * @param {Object} options.headers - 请求头
 * @param {number} options.timeout - 请求超时时间，默认30000ms
 * @param {number} options.retryCount - 重试次数，内部使用
 * @param {boolean} options.useCache - 是否使用缓存，仅GET请求有效
 * @param {number} options.cacheDuration - 缓存持续时间（毫秒）
 * @param {string} options.abortKey - 请求取消标识
 * @returns {Promise} - 返回Promise对象
 */
const request = async (url, options = {}) => {
  // 获取token（优先使用默认token，其次是本地存储）
  const token = defaultToken || wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token') || '';
  
  // 设置请求头
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
        console.log('使用缓存数据:', cacheKey);
        return cachedData;
      }
    } catch (error) {
      console.warn('获取缓存失败:', error);
    }
  }
  
  // 处理请求取消
  let abortController;
  if (options.abortKey) {
    // 取消同一key的之前的请求
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
      enableCache: false, // 让我们自己管理缓存
      ...(abortController ? { signal: abortController.signal } : {})
    });
    
    // 清理取消控制器
    if (options.abortKey) {
      abortControllers.delete(options.abortKey);
    }
    
    // 处理响应
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // 检查响应数据格式
      if (response.data && typeof response.data === 'object') {
        // 统一错误处理
        if (response.data.code !== 200 && response.data.code) {
          // 401表示未授权，清除token并跳转到登录
          if (response.data.code === 401) {
            wx.removeStorageSync('userToken');
            wx.removeStorageSync('jwt_token');
            wx.removeStorageSync('userInfo');
            defaultToken = '';
            wx.redirectTo({ url: '/pages/user/login/login' });
          }
          // 抛出业务错误
          throw new Error(response.data.message || '请求失败');
        }
        
        const result = response.data.data || response.data; // 返回data部分或整个响应
        
        // 缓存GET请求结果
        if (method === 'GET' && options.useCache) {
          const cacheKey = generateCacheKey(url, options.data);
          const duration = options.cacheDuration || CACHE_DURATION.MEDIUM;
          try {
            setCache(cacheKey, result, duration);
          } catch (error) {
            console.warn('设置缓存失败:', error);
          }
        }
        
        return result;
      }
      return response.data;
    } else {
      throw new Error(`请求失败: ${response.statusCode}`);
    }
  } catch (error) {
    // 清理取消控制器
    if (options.abortKey) {
      abortControllers.delete(options.abortKey);
    }
    
    // 处理取消错误
    if (error.name === 'AbortError') {
      throw new Error('请求已取消');
    }
    
    // 重试逻辑
    if (options.retryCount === undefined) {
      options.retryCount = 0;
    }
    
    // 最多重试2次，仅对特定错误码重试
    if (options.retryCount < 2 && [408, 500, 502, 503, 504].includes(error.statusCode)) {
      options.retryCount++;
      // 指数退避重试
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, options.retryCount)));
      return request(url, options);
    }
    
    // 显示错误提示，但避免重复显示
    if (!error.silent) {
      showToast(error.message || '网络请求失败', { icon: 'none' });
    }
    throw error;
  }
};

/**
 * 设置默认token
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  defaultToken = token;
};

/**
 * 取消指定key的请求
 * @param {string} abortKey - 请求取消标识
 */
export const cancelRequest = (abortKey) => {
  if (abortControllers.has(abortKey)) {
    abortControllers.get(abortKey).abort();
    abortControllers.delete(abortKey);
    return true;
  }
  return false;
};

/**
 * 取消所有请求
 */
export const cancelAllRequests = () => {
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
};

/**
 * 清除指定URL的缓存
 * @param {string} url - API接口路径
 * @param {Object} params - 请求参数
 * @returns {boolean} 操作是否成功
 */
export const clearCache = (url, params) => {
  const cacheKey = generateCacheKey(url, params);
  try {
    removeCache(cacheKey);
    return true;
  } catch (error) {
    console.warn('清除缓存失败:', error);
    return false;
  }
};

/**
 * 清除所有API缓存
 * @returns {boolean} 操作是否成功
 */
export const clearAllCache = () => {
  try {
    clearCacheByPrefix(API_CACHE_PREFIX);
    return true;
  } catch (error) {
    console.warn('清除所有缓存失败:', error);
    return false;
  }
};

// 导出常用请求方法
export default {
  /**
   * GET请求
   * @param {string} url - 请求路径
   * @param {Object} params - 请求参数
   * @param {Object} options - 额外配置项
   * @param {boolean} options.useCache - 是否使用缓存
   * @param {number} options.cacheDuration - 缓存持续时间
   * @param {string} options.abortKey - 请求取消标识
   * @returns {Promise} - 返回Promise对象
   */
  get: (url, params, options = {}) => request(url, { 
    method: 'GET', 
    data: params, 
    ...options 
  }),
  
  /**
   * POST请求
   * @param {string} url - 请求路径
   * @param {Object} data - 请求数据
   * @param {Object} options - 额外配置项
   * @param {string} options.abortKey - 请求取消标识
   * @returns {Promise} - 返回Promise对象
   */
  post: (url, data, options = {}) => request(url, { 
    method: 'POST', 
    data, 
    ...options 
  }),
  
  /**
   * PUT请求
   * @param {string} url - 请求路径
   * @param {Object} data - 请求数据
   * @param {Object} options - 额外配置项
   * @param {string} options.abortKey - 请求取消标识
   * @returns {Promise} - 返回Promise对象
   */
  put: (url, data, options = {}) => request(url, { 
    method: 'PUT', 
    data, 
    ...options 
  }),
  
  /**
   * DELETE请求
   * @param {string} url - 请求路径
   * @param {Object} data - 请求数据
   * @param {Object} options - 额外配置项
   * @param {string} options.abortKey - 请求取消标识
   * @returns {Promise} - 返回Promise对象
   */
  delete: (url, data, options = {}) => request(url, { 
    method: 'DELETE', 
    data, 
    ...options 
  }),
  
  /**
   * 上传文件
   * @param {string} url - 请求路径
   * @param {Object} data - 表单数据
   * @param {Object} file - 文件对象 {name, path}
   * @param {Object} options - 额外配置项
   * @param {string} options.abortKey - 请求取消标识
   * @returns {Promise} - 返回Promise对象
   */
  upload: (url, data, file, options = {}) => {
    return new Promise((resolve, reject) => {
      const token = defaultToken || wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token') || '';
      
      // 处理请求取消
      let abortController;
      if (options.abortKey) {
        // 取消同一key的之前的请求
        if (abortControllers.has(options.abortKey)) {
          abortControllers.get(options.abortKey).abort();
          abortControllers.delete(options.abortKey);
        }
        
        // 创建新的取消控制器
        abortController = new AbortController();
        abortControllers.set(options.abortKey, abortController);
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
          // 清理取消控制器
          if (options.abortKey) {
            abortControllers.delete(options.abortKey);
          }
          
          try {
            const response = JSON.parse(res.data);
            if (response.code === 200) {
              resolve(response.data || response);
            } else {
              showToast(response.message || '上传失败', { icon: 'none' });
              reject(new Error(response.message || '上传失败'));
            }
          } catch (error) {
            showToast('上传失败，请重试', { icon: 'none' });
            reject(error);
          }
        },
        fail: (error) => {
          // 清理取消控制器
          if (options.abortKey) {
            abortControllers.delete(options.abortKey);
          }
          
          // 处理取消错误
          if (error.name === 'AbortError') {
            reject(new Error('上传已取消'));
            return;
          }
          
          showToast('网络错误，请稍后重试', { icon: 'none' });
          reject(error);
        }
      });
    });
  },
  
  // 工具方法
  setToken,
  cancelRequest,
  cancelAllRequests,
  clearCache,
  clearAllCache
};

// 导出默认实例
export const api = {
  get: default.get,
  post: default.post,
  put: default.put,
  delete: default.delete,
  upload: default.upload,
  setToken,
  cancelRequest,
  cancelAllRequests,
  clearCache,
  clearAllCache
};