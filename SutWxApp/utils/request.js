/**
 * 文件名: request.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 网络请求工具，封装wx.request，支持拦截器、重试机制等
 */

// 默认配置
const DEFAULT_CONFIG = {
  baseURL: '',
  timeout: 10000,
  retry: 1,
  retryDelay: 1000
};

// 请求拦截器列表
const requestInterceptors = [];
// 响应拦截器列表
const responseInterceptors = [];

/**
 * 发送网络请求
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求数据
 * @param {Object} [options.header] - 请求头
 * @param {number} [options.timeout] - 超时时间
 * @param {boolean} [options.needAuth=true] - 是否需要认证
 * @param {number} [options.retry] - 重试次数
 * @param {number} [options.retryDelay] - 重试延迟
 * @returns {Promise} 请求结果
 */
function request(options) {
  // 合并配置
  const config = {
    ...DEFAULT_CONFIG,
    ...options,
    header: {
      'content-type': 'application/json',
      ...options.header
    }
  };

  // 如果需要认证，添加token
  if (config.needAuth !== false) {
    const token = wx.getStorageSync('token');
    if (token) {
      config.header['Authorization'] = `Bearer ${token}`;
    }
  }

  // 应用请求拦截器
  let processedConfig = { ...config };
  for (const interceptor of requestInterceptors) {
    processedConfig = interceptor(processedConfig) || processedConfig;
  }

  // 发送请求
  return new Promise((resolve, reject) => {
    let retryCount = 0;

    function sendRequest() {
      wx.request({
        ...processedConfig,
        success: (res) => {
          // 应用响应拦截器
          let processedResponse = res;
          for (const interceptor of responseInterceptors) {
            processedResponse = interceptor(processedResponse) || processedResponse;
          }

          // 处理响应
          if (processedResponse.statusCode >= 200 && processedResponse.statusCode < 300) {
            resolve(processedResponse.data);
          } else if (processedResponse.statusCode === 401) {
            // 未授权，清除token并跳转到登录页
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.navigateTo({ url: '/pages/login/login' });
            reject(new Error('未授权，请重新登录'));
          } else {
            reject(new Error(processedResponse.data.message || `请求失败：${processedResponse.statusCode}`));
          }
        },
        fail: (err) => {
          // 重试机制
          if (retryCount < processedConfig.retry) {
            retryCount++;
            setTimeout(sendRequest, processedConfig.retryDelay);
          } else {
            reject(err);
          }
        }
      });
    }

    sendRequest();
  });
}

/**
 * GET请求
 * @param {string} url - 请求地址
 * @param {Object} [params] - 请求参数
 * @param {Object} [options] - 请求配置
 * @returns {Promise} 请求结果
 */
request.get = function (url, params, options) {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  });
};

/**
 * POST请求
 * @param {string} url - 请求地址
 * @param {Object} [data] - 请求数据
 * @param {Object} [options] - 请求配置
 * @returns {Promise} 请求结果
 */
request.post = function (url, data, options) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT请求
 * @param {string} url - 请求地址
 * @param {Object} [data] - 请求数据
 * @param {Object} [options] - 请求配置
 * @returns {Promise} 请求结果
 */
request.put = function (url, data, options) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE请求
 * @param {string} url - 请求地址
 * @param {Object} [params] - 请求参数
 * @param {Object} [options] - 请求配置
 * @returns {Promise} 请求结果
 */
request.delete = function (url, params, options) {
  return request({
    url,
    method: 'DELETE',
    data: params,
    ...options
  });
};

/**
 * 添加请求拦截器
 * @param {Function} interceptor - 拦截器函数
 */
request.addRequestInterceptor = function (interceptor) {
  if (typeof interceptor === 'function') {
    requestInterceptors.push(interceptor);
  }
};

/**
 * 添加响应拦截器
 * @param {Function} interceptor - 拦截器函数
 */
request.addResponseInterceptor = function (interceptor) {
  if (typeof interceptor === 'function') {
    responseInterceptors.push(interceptor);
  }
};

/**
 * 设置基础URL
 * @param {string} baseURL - 基础URL
 */
request.setBaseURL = function (baseURL) {
  DEFAULT_CONFIG.baseURL = baseURL;
};

module.exports = request;
