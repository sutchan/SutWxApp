/**
 * 服务适配器
 * 用于统一适配不同环境下的服务调用
 */

class ServiceAdapter {
  constructor(options = {}) {
    // 环境类型（'development' | 'production' | 'testing'）
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    // API基础URL
    this.baseUrl = options.baseUrl || '';
    // 默认请求超时时间（毫秒）
    this.defaultTimeout = options.defaultTimeout || 10000;
    // 请求头配置
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    // 拦截器
    this.interceptors = {
      request: [],
      response: []
    };
    // 请求队列
    this.requestQueue = new Map();
  }

  /**
   * 设置基础URL
   * @param {string} url - 基础URL
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    return this;
  }

  /**
   * 设置环境
   * @param {string} env - 环境名称
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  setEnvironment(env) {
    this.environment = env;
    return this;
  }

  /**
   * 设置默认超时时间
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  setDefaultTimeout(timeout) {
    this.defaultTimeout = timeout;
    return this;
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  addRequestInterceptor(interceptor) {
    if (typeof interceptor === 'function') {
      this.interceptors.request.push(interceptor);
    }
    return this;
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor - 拦截器函数
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  addResponseInterceptor(interceptor) {
    if (typeof interceptor === 'function') {
      this.interceptors.response.push(interceptor);
    }
    return this;
  }

  /**
   * 清除请求队列
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  clearRequestQueue() {
    this.requestQueue.clear();
    return this;
  }

  /**
   * 取消请求
   * @param {string} requestId - 请求ID
   * @returns {ServiceAdapter} 当前实例，支持链式调用
   */
  cancelRequest(requestId) {
    const controller = this.requestQueue.get(requestId);
    if (controller) {
      controller.abort();
      this.requestQueue.delete(requestId);
    }
    return this;
  }

  /**
   * 生成唯一的请求ID
   * @returns {string} 请求ID
   * @private
   */
  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 构建完整的请求URL
   * @param {string} url - 相对URL或完整URL
   * @returns {string} 完整的请求URL
   * @private
   */
  _buildUrl(url) {
    // 如果已经是完整URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 拼接基础URL和相对路径
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  }

  /**
   * 应用请求拦截器
   * @param {Object} config - 请求配置
   * @returns {Promise<Object>} 处理后的请求配置
   * @private
   */
  async _applyRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of this.interceptors.request) {
      try {
        processedConfig = await interceptor(processedConfig) || processedConfig;
      } catch (error) {
        console.error('请求拦截器执行失败:', error);
      }
    }
    
    return processedConfig;
  }

  /**
   * 应用响应拦截器
   * @param {*} response - 响应数据
   * @param {Object} config - 请求配置
   * @returns {Promise<*>} 处理后的响应数据
   * @private
   */
  async _applyResponseInterceptors(response, config) {
    let processedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      try {
        processedResponse = await interceptor(processedResponse, config) || processedResponse;
      } catch (error) {
        console.error('响应拦截器执行失败:', error);
      }
    }
    
    return processedResponse;
  }

  /**
   * 处理请求错误
   * @param {Error} error - 错误对象
   * @param {string} requestId - 请求ID
   * @returns {Promise<Error>} 格式化后的错误
   * @private
   */
  _handleRequestError(error, requestId) {
    // 从请求队列中移除
    if (requestId) {
      this.requestQueue.delete(requestId);
    }
    
    // 处理不同类型的错误
    const formattedError = new Error(error.message || '网络请求失败');
    formattedError.originalError = error;
    formattedError.code = error.code || 'NETWORK_ERROR';
    
    // 处理超时错误
    if (error.name === 'AbortError') {
      formattedError.code = 'TIMEOUT';
      formattedError.message = '请求超时';
    }
    
    return Promise.reject(formattedError);
  }

  /**
   * 发送GET请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<*>} 响应数据
   */
  async get(url, options = {}) {
    return this.request({
      ...options,
      method: 'GET',
      url
    });
  }

  /**
   * 发送POST请求
   * @param {string} url - 请求URL
   * @param {*} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise<*>} 响应数据
   */
  async post(url, data, options = {}) {
    return this.request({
      ...options,
      method: 'POST',
      url,
      data
    });
  }

  /**
   * 发送PUT请求
   * @param {string} url - 请求URL
   * @param {*} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise<*>} 响应数据
   */
  async put(url, data, options = {}) {
    return this.request({
      ...options,
      method: 'PUT',
      url,
      data
    });
  }

  /**
   * 发送DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<*>} 响应数据
   */
  async delete(url, options = {}) {
    return this.request({
      ...options,
      method: 'DELETE',
      url
    });
  }

  /**
   * 发送请求
   * @param {Object} config - 请求配置
   * @param {string} config.url - 请求URL
   * @param {string} config.method - 请求方法
   * @param {*} config.data - 请求数据
   * @param {Object} config.headers - 请求头
   * @param {number} config.timeout - 请求超时时间
   * @param {Object} config.params - URL参数
   * @param {string} config.requestId - 请求ID
   * @returns {Promise<*>} 响应数据
   */
  async request(config = {}) {
    // 生成请求ID
    const requestId = config.requestId || this._generateRequestId();
    
    try {
      // 合并默认配置和用户配置
      const mergedConfig = {
        method: 'GET',
        headers: this.headers,
        timeout: this.defaultTimeout,
        ...config,
        url: this._buildUrl(config.url || ''),
        requestId
      };
      
      // 应用请求拦截器
      const finalConfig = await this._applyRequestInterceptors(mergedConfig);
      
      // 准备请求参数
      const { url, method, headers, timeout, params, data } = finalConfig;
      
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 将请求添加到队列
      this.requestQueue.set(requestId, controller);
      
      // 设置超时
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // 构建查询字符串
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      
      // 准备请求选项
      const fetchOptions = {
        method,
        headers,
        signal,
        // 根据方法决定是否包含请求体
        ...(['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data ? {
          body: JSON.stringify(data)
        } : {})
      };
      
      // 发送请求
      const response = await fetch(url + queryString, fetchOptions);
      
      // 清除超时定时器
      clearTimeout(timeoutId);
      // 从请求队列中移除
      this.requestQueue.delete(requestId);
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 解析响应数据
      const responseData = await response.json();
      
      // 应用响应拦截器
      return await this._applyResponseInterceptors(responseData, finalConfig);
    } catch (error) {
      // 处理请求错误
      return this._handleRequestError(error, requestId);
    }
  }

  /**
   * 获取当前环境
   * @returns {string} 当前环境
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * 判断是否为开发环境
   * @returns {boolean} 是否为开发环境
   */
  isDevelopment() {
    return this.environment === 'development';
  }

  /**
   * 判断是否为生产环境
   * @returns {boolean} 是否为生产环境
   */
  isProduction() {
    return this.environment === 'production';
  }

  /**
   * 判断是否为测试环境
   * @returns {boolean} 是否为测试环境
   */
  isTesting() {
    return this.environment === 'testing';
  }
}

// 导出服务适配器类
module.exports = ServiceAdapter;
