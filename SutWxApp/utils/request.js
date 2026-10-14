/**
 * 文件名: request.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 网络请求主模块（编排层），封装 wx.request；缓存/并发队列/CSRF/XSS/取消令牌
 *       见同级子模块，鉴权头注入见 request-auth-header.js，重试与离线降级见
 *       request-retry.js，401 无感刷新兜底见 request-401.js
 */

const CONFIG = require("./request-config");
const { checkWx } = require("./request-platform");
const cache = require("./request-cache");
const security = require("./request-security");
const { CancelToken, isCancel } = require("./request-cancel");
const { buildRequestConfig, handleResponse } = require("./request-api");
const { registerRequestApi } = require("./request-methods");
const { createQueueController } = require("./request-queue");
const { applyAuthHeader } = require("./request-auth-header");
const { createFailHandler } = require("./request-retry");
const { withUnauthorizedFallback } = require("./request-401");

const requestInterceptors = [];
const responseInterceptors = [];

// 并发队列控制器（并发上限与排队逻辑见 request-queue.js）
const queue = createQueueController(CONFIG);

/**
 * 网络请求主函数
 * @param {Object} options 请求配置选项
 * @returns {Promise<*>} 请求结果的 Promise 对象
 */
function request(options) {
  if (CONFIG.enableCsrf) {
    security.initCsrfToken();
  }

  const config = buildRequestConfig(options, CONFIG, security.getCsrfToken());

  if (config.data && typeof config.data === "object") {
    security.validateRequestData(config.data);
  }

  if (config.needAuth !== false) {
    const auth = applyAuthHeader(config);
    if (!auth.ok) {
      return Promise.reject(auth.error);
    }
    config.header = auth.header;
  }

  let processedConfig = { ...config };
  for (const interceptor of requestInterceptors) {
    const result = interceptor(processedConfig);
    if (result) {
      processedConfig = result;
    }
  }

  const cacheKey =
    config.cacheKey ||
    `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;

  const isTestEnv =
    typeof jest !== "undefined" ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "test");

  if (config.useCache && config.method === "GET" && !isTestEnv) {
    const cachedData = cache.cacheGet(cacheKey);
    if (cachedData !== null) {
      return Promise.resolve(cachedData);
    }
  }

  if (config.cancelToken && config.cancelToken.isCancel()) {
    return Promise.reject(new Error("Request cancelled"));
  }

  const promise = new Promise((resolve, reject) => {
    const retryState = { count: 0 };
    const maxRetry =
      processedConfig.retry !== undefined ? processedConfig.retry : CONFIG.retry;
    const retryDelay =
      processedConfig.retryDelay !== undefined
        ? processedConfig.retryDelay
        : CONFIG.retryDelay;
    let requestTask = null;

    function sendRequest() {
      if (config.cancelToken && config.cancelToken.isCancel()) {
        reject(new Error("Request cancelled"));
        return;
      }

      const wxInstance = checkWx();
      if (!wxInstance.request) {
        reject(new Error("wx.request未定义"));
        return;
      }

      const requestParams = {
        ...processedConfig,
        success: (res) => {
          queue.release();

          let processedResponse = res;
          for (const interceptor of responseInterceptors) {
            const result = interceptor(processedResponse);
            if (result) {
              processedResponse = result;
            }
          }
          handleResponse(
            processedResponse,
            config,
            cacheKey,
            resolve,
            reject,
            processedConfig,
            wxInstance,
          );
        },
        fail: createFailHandler({
          config,
          maxRetry,
          retryDelay,
          cacheKey,
          retryState,
          sendRequest,
          resolve,
          reject,
        }),
        complete: () => {
          requestTask = null;
        },
      };

      requestTask = wxInstance.request(requestParams);
    }

    if (config.cancelToken) {
      config.cancelToken.register(() => {
        if (requestTask && requestTask.abort) {
          requestTask.abort();
        }
        reject(new Error("Request cancelled"));
      });
    }

    queue.acquire(sendRequest);
  });

  return withUnauthorizedFallback(promise, options, processedConfig, request);
}

// 注册公共 API（缓存方法 / 配置 setter / HTTP 动词 / 拦截器）
registerRequestApi(request, CONFIG, requestInterceptors, responseInterceptors);

module.exports = request;
module.exports.default = request;
module.exports.CancelToken = CancelToken;
module.exports.isCancel = isCancel;
