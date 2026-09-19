/**
 * 文件名: request-methods.js
 * 版本号: 3.4.1
 * 更新日期: 2026-09-19
 * 描述: request 公共 API 注册（缓存方法 / 配置 setter / HTTP 动词 / 拦截器），从 request-api.js 抽离
 */

const cache = require("./request-cache");

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

module.exports = { registerRequestApi };
