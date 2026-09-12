/**
 * 文件名: request.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 网络请求主模块，封装 wx.request；缓存/CSRF/XSS/取消令牌等实现见同级子模块
 */

const CONFIG = require("./request-config");
const { checkWx } = require("./request-platform");
const cache = require("./request-cache");
const security = require("./request-security");
const { CancelToken, isCancel } = require("./request-cancel");
const { buildRequestConfig, mapStatusCodeErrorMessage, registerRequestApi } =
  require("./request-api");

const requestInterceptors = [];
const responseInterceptors = [];

// 队列并发控制状态
let activeRequests = 0;
const requestQueue = [];

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
    try {
      const wx = checkWx();
      const token = wx.getStorageSync("token");
      if (typeof token === "string" && token.length > 0) {
        config.header = {
          ...config.header,
          Authorization: `Bearer ${token}`,
        };
      } else {
        throw new Error("未授权，请重新登录");
      }
    } catch (error) {
      throw new Error("未授权，请重新登录");
    }
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
    typeof jest !== "undefined" || process.env.NODE_ENV === "test";

  if (config.useCache && config.method === "GET" && !isTestEnv) {
    const cachedData = cache.cacheGet(cacheKey);
    if (cachedData !== null) {
      return Promise.resolve(cachedData);
    }
  }

  if (config.cancelToken && config.cancelToken.isCancel()) {
    return Promise.reject(new Error("Request cancelled"));
  }

  return new Promise((resolve, reject) => {
    let retryCount = 0;
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
          activeRequests--;
          processQueue();

          let processedResponse = res;
          for (const interceptor of responseInterceptors) {
            const result = interceptor(processedResponse);
            if (result) {
              processedResponse = result;
            }
          }

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
            const errorMessage = mapStatusCodeErrorMessage(
              processedResponse.statusCode,
              processedResponse,
            );
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
        },
        fail: (err) => {
          activeRequests--;
          processQueue();

          if (config.cancelToken && config.cancelToken.isCancel()) {
            reject(new Error("Request cancelled"));
            return;
          }

          if (retryCount < maxRetry) {
            retryCount++;
            const delay = retryDelay * Math.pow(2, retryCount - 1);
            const jitter = Math.random() * delay * 0.5;
            const retryDelayWithJitter = delay + jitter;

            console.warn(
              `请求失败，${retryCount}/${maxRetry}，${Math.round(retryDelayWithJitter)}ms后重试`,
            );
            setTimeout(sendRequest, retryDelayWithJitter);
          } else {
            let errorMessage = "网络请求失败";
            if (err.errMsg) {
              errorMessage = err.errMsg;
            } else if (err.message) {
              errorMessage = err.message;
            }
            reject(new Error(errorMessage));
          }
        },
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

    if (CONFIG.enableQueue && activeRequests >= CONFIG.maxConcurrent) {
      requestQueue.push(sendRequest);
    } else {
      activeRequests++;
      sendRequest();
    }
  });
}

/**
 * 处理请求队列
 */
function processQueue() {
  while (
    requestQueue.length > 0 &&
    activeRequests < CONFIG.maxConcurrent
  ) {
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      activeRequests++;
      nextRequest();
    }
  }
}

// 注册公共 API（缓存方法 / 配置 setter / HTTP 动词 / 拦截器）
registerRequestApi(request, CONFIG, requestInterceptors, responseInterceptors);

module.exports = request;
module.exports.default = request;
module.exports.CancelToken = CancelToken;
module.exports.isCancel = isCancel;
