/**
 * 文件名: request-api.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: request.js 的配置组装、响应处理与公共 API 注册（保持 request 主文件精简）
 */

const CONFIG = require("./request-config");
const security = require("./request-security");
const cache = require("./request-cache");

/**
 * 组装请求配置（合并默认配置、CSRF 头、缓存开关）
 * @param {Object} options 请求配置
 * @param {Object} config 共享默认配置
 * @param {string} csrfToken 当前 CSRF 令牌
 * @returns {Object}
 */
function buildRequestConfig(options, config, csrfToken) {
  return {
    ...config,
    ...options,
    method: options.method || "GET",
    header: {
      "content-type": "application/json",
      ...options.header,
      ...(config.enableCsrf && { "X-CSRF-Token": csrfToken }),
    },
    useCache: options.useCache !== undefined ? options.useCache : true,
  };
}

/**
 * 根据状态码映射错误消息
 * @param {number} statusCode HTTP 状态码
 * @param {Object} processedResponse 响应对象
 * @returns {string}
 */
function mapStatusCodeErrorMessage(statusCode, processedResponse) {
  if (statusCode === 401) return "未授权，请重新登录";
  if (statusCode === 403) return "权限不足，无法访问该资源";
  if (statusCode === 404) return "请求的资源不存在";
  if (statusCode === 500) return "服务器内部错误";
  if (processedResponse.data && processedResponse.data.message) {
    return processedResponse.data.message;
  }
  return `请求失败：${statusCode || "未知状态"}`;
}

/**
 * 处理成功响应（XSS 清洗、缓存写入、状态码分发与 401 跳转）
 * @param {Object} processedResponse 经响应拦截器处理后的响应
 * @param {Object} config 请求配置
 * @param {string} cacheKey 缓存键
 * @param {Function} resolve Promise resolve
 * @param {Function} reject Promise reject
 * @param {Object} processedConfig 实际发送配置
 * @param {Object} wxInstance wx 实例（用于 401 跳转）
 */
function handleResponse(processedResponse, config, cacheKey, resolve, reject, processedConfig, wxInstance) {
  if (CONFIG.enableXssProtection && processedResponse.data !== undefined) {
    processedResponse.data = security.deepSanitize(processedResponse.data);
  }

  if (
    processedResponse.statusCode &&
    processedResponse.statusCode >= 200 &&
    processedResponse.statusCode < 300
  ) {
    if (config.useCache && config.method === "GET") {
      cache.cacheSet(cacheKey, processedResponse.data);
    }
    resolve(processedResponse.data);
  } else {
    const errorMessage = mapStatusCodeErrorMessage(processedResponse.statusCode, processedResponse);
    if (processedResponse.statusCode === 401) {
      if (wxInstance.removeStorageSync && wxInstance.navigateTo) {
        try {
          wxInstance.removeStorageSync("token");
          wxInstance.removeStorageSync("userInfo");
          setTimeout(() => {
            wxInstance.navigateTo({ url: "/pages/home/index" });
          }, 500);
        } catch (error) {
          console.warn("清除存储和跳转失败:", error);
        }
      }
    }
    reject(new Error(errorMessage));
  }
}

/**
 * 将公共方法挂载到 request 函数对象上（配置 setter / HTTP 动词 / 拦截器）
 * @param {Function} request request 主函数
 * @param {Object} config 共享默认配置
 * @param {Array} requestInterceptors 请求拦截器数组
 * @param {Array} responseInterceptors 响应拦截器数组
 */
function registerRequestApi(request, config, requestInterceptors, responseInterceptors) {
  request.clearCache = function () {
    cache.clearCache();
  };

  request.removeCache = function (key) {
    cache.removeCache(key);
  };

  request.getCacheSize = function () {
    return cache.getCacheSize();
  };

  request.cleanupExpiredCache = function () {
    cache.cleanupExpiredCache();
  };

  request.stopCacheCleanup = function () {
    cache.stopCacheCleanup();
  };

  request.setBaseURL = function (baseURL) {
    config.baseURL = baseURL;
  };

  request.setTimeout = function (timeout) {
    config.timeout = timeout;
  };

  request.setRetry = function (retry) {
    config.retry = retry;
  };

  request.setRetryDelay = function (delay) {
    config.retryDelay = delay;
  };

  request.enableCache = function (enable) {
    config.enableCache = enable;
  };

  request.setCacheTimeout = function (timeout) {
    config.cacheTimeout = timeout;
  };

  request.setMaxCacheSize = function (size) {
    config.maxCacheSize = size;
  };

  request.enableQueue = function (enable) {
    config.enableQueue = enable;
  };

  request.setMaxConcurrent = function (max) {
    config.maxConcurrent = max;
  };

  request.enableCsrf = function (enable) {
    config.enableCsrf = enable;
  };

  request.enableXssProtection = function (enable) {
    config.enableXssProtection = enable;
  };

  request.get = function (url, params, options) {
    return request({ url, method: "GET", data: params, ...options });
  };

  request.post = function (url, data, options) {
    return request({ url, method: "POST", data, ...options });
  };

  request.put = function (url, data, options) {
    return request({ url, method: "PUT", data, ...options });
  };

  request.delete = function (url, params, options) {
    return request({ url, method: "DELETE", data: params, ...options });
  };

  request.addRequestInterceptor = function (interceptor) {
    if (typeof interceptor === "function") {
      requestInterceptors.push(interceptor);
    }
  };

  request.addResponseInterceptor = function (interceptor) {
    if (typeof interceptor === "function") {
      responseInterceptors.push(interceptor);
    }
  };
}

module.exports = {
  buildRequestConfig,
  mapStatusCodeErrorMessage,
  handleResponse,
  registerRequestApi,
};
