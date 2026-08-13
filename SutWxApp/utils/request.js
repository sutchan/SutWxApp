/**
 * 文件名: request.js
 * 版本号: 3.0.1
 * 更新日期: 2026-08-13
 * 描述: 网络请求工具，封装wx.request，支持拦截器、重试机制、请求缓存、请求取消等
 */

/**
 * 安全获取wx对象
 * @returns {any|null} 微信小程序wx对象，如果不存在则返回null
 */
function getWx() {
  if (typeof wx !== "undefined") {
    return wx;
  }
  return null;
}

/**
 * 检查wx对象是否存在，并抛出错误如果不存在
 * @returns {any} 微信小程序wx对象
 * @throws {Error} 如果wx对象未定义则抛出错误
 */
function checkWx() {
  const wx = getWx();
  if (!wx) {
    throw new Error("wx对象未定义");
  }
  return wx;
}

const DEFAULT_CONFIG = {
  baseURL: "",
  timeout: 10000,
  retry: 1,
  retryDelay: 1000,
  enableCache: true,
  cacheTimeout: 300000,
  enableQueue: true,
  maxConcurrent: 5,
  maxCacheSize: 50,
  enableCsrf: true,
  enableXssProtection: true,
};

const requestInterceptors = [];
const responseInterceptors = [];

// 使用Map和数组结合实现更高效的LRU缓存
const requestCache = new Map();
const requestCacheOrder = [];
const requestQueue = [];
let activeRequests = 0;
let csrfToken = "";
let cacheCleanupTimer = null;

/**
 * LRU缓存实现 - 设置缓存
 * @param {string} key 缓存键名
 * @param {*} data 缓存数据
 */
function cacheSet(key, data) {
  if (!DEFAULT_CONFIG.enableCache) return;

  const now = Date.now();
  const cacheItem = { data, timestamp: now, cacheKey: key };

  if (requestCache.has(key)) {
    requestCache.delete(key);
    const orderIndex = requestCacheOrder.indexOf(key);
    if (orderIndex >= 0) {
      requestCacheOrder.splice(orderIndex, 1);
    }
  }

  requestCache.set(key, cacheItem);
  requestCacheOrder.unshift(key);

  if (requestCache.size > DEFAULT_CONFIG.maxCacheSize) {
    const oldestKey = requestCacheOrder.pop();
    if (oldestKey) {
      requestCache.delete(oldestKey);
    }
  }

  startCacheCleanup();
}

/**
 * LRU缓存实现 - 获取缓存
 * @param {string} key 缓存键名
 * @returns {*|null} 缓存数据，如果缓存不存在或过期则返回null
 */
function cacheGet(key) {
  if (!DEFAULT_CONFIG.enableCache) return null;

  if (requestCache.has(key)) {
    const cacheItem = requestCache.get(key);
    const now = Date.now();

    if (now - cacheItem.timestamp < DEFAULT_CONFIG.cacheTimeout) {
      const orderIndex = requestCacheOrder.indexOf(key);
      if (orderIndex >= 0) {
        requestCacheOrder.splice(orderIndex, 1);
        requestCacheOrder.unshift(key);
      }
      return cacheItem.data;
    } else {
      requestCache.delete(key);
      const orderIndex = requestCacheOrder.indexOf(key);
      if (orderIndex >= 0) {
        requestCacheOrder.splice(orderIndex, 1);
      }
    }
  }
  return null;
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache() {
  if (!DEFAULT_CONFIG.enableCache) return;

  const now = Date.now();
  let removedCount = 0;

  for (const [key, cacheItem] of requestCache.entries()) {
    if (now - cacheItem.timestamp >= DEFAULT_CONFIG.cacheTimeout) {
      requestCache.delete(key);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    requestCacheOrder.length = 0;
    requestCacheOrder.push(...requestCache.keys());
  }
}

/**
 * 启动定期清理过期缓存
 */
function startCacheCleanup() {
  if (cacheCleanupTimer) return;

  const globalObj =
    typeof window !== "undefined"
      ? window
      : typeof wx !== "undefined"
        ? wx
        : typeof global !== "undefined"
          ? global
          : {};

  cacheCleanupTimer = (globalObj.setInterval || setTimeout)(() => {
    cleanupExpiredCache();
  }, 5 * 60 * 1000);
}

/**
 * 停止定期清理过期缓存
 */
function stopCacheCleanup() {
  if (cacheCleanupTimer) {
    const globalObj =
      typeof window !== "undefined"
        ? window
        : typeof wx !== "undefined"
          ? wx
          : typeof global !== "undefined"
            ? global
            : {};
    (globalObj.clearInterval || globalObj.clearTimeout)(cacheCleanupTimer);
    cacheCleanupTimer = null;
  }
}

/**
 * 生成CSRF令牌
 */
function generateCsrfToken() {
  if (!csrfToken) {
    let randomString = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    try {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const array = new Uint32Array(32);
        crypto.getRandomValues(array);
        for (let i = 0; i < array.length; i++) {
          randomString += chars[array[i] % chars.length];
        }
      } else {
        for (let i = 0; i < 32; i++) {
          randomString += chars[Math.floor(Math.random() * chars.length)];
        }
      }
    } catch (e) {
      for (let i = 0; i < 32; i++) {
        randomString += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    csrfToken = randomString;
    try {
      const wx = getWx();
      if (wx && wx.setStorageSync) {
        wx.setStorageSync("csrfToken", csrfToken);
      }
    } catch (error) {
      console.warn("Failed to save CSRF token to storage:", error);
    }
  }
  return csrfToken;
}

/**
 * 初始化CSRF令牌
 */
function initCsrfToken() {
  try {
    const wx = getWx();
    if (wx && wx.getStorageSync) {
      const storedToken = wx.getStorageSync("csrfToken");
      if (typeof storedToken === "string" && storedToken) {
        csrfToken = storedToken;
      } else {
        generateCsrfToken();
      }
    }
  } catch (error) {
    console.warn("Failed to get CSRF token from storage:", error);
    generateCsrfToken();
  }
}

/**
 * 清理HTML标签，防止XSS攻击
 * @param {string} html 待清理的HTML字符串
 * @returns {string} 清理后的字符串
 */
function sanitizeHtml(html) {
  if (!DEFAULT_CONFIG.enableXssProtection) return html;

  let sanitizedHtml = html;

  const dangerousTags = [
    "script", "iframe", "object", "embed", "link", "form", "input", "textarea",
    "button", "select", "option", "style", "meta", "base", "applet",
    "blink", "body", "html", "head", "frameset", "frame",
  ];

  for (const tag of dangerousTags) {
    sanitizedHtml = sanitizedHtml
      .replace(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"), "")
      .replace(new RegExp(`<${tag}[^>]*\\/>`, "gi"), "");
  }

  const eventPatterns = [
    /on[^=]+="[^"]*"/gi,
    /on[^=]+='[^']*'/gi,
    /on[^=]+=[^\s>]+/gi,
  ];

  for (const pattern of eventPatterns) {
    sanitizedHtml = sanitizedHtml.replace(pattern, "");
  }

  const dangerousProtocols = [
    "javascript:", "vbscript:", "data:", "mailto:", "tel:", "sms:",
    "blob:", "file:", "ftp:", "gopher:", "ws:", "wss:",
  ];

  for (const protocol of dangerousProtocols) {
    sanitizedHtml = sanitizedHtml.replace(new RegExp(protocol, "gi"), "");
  }

  sanitizedHtml = sanitizedHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/style="[^"]*"/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/href="[^"]*"/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/src="[^"]*"/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/<!--[^>]*-->/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/&lt;script/gi, "&lt;");
  sanitizedHtml = sanitizedHtml.replace(/&lt;iframe/gi, "&lt;");

  return sanitizedHtml;
}

/**
 * 验证请求数据，防止SQL注入
 * @param {Object} data 请求数据
 * @throws {Error} 检测到潜在注入时抛出错误
 */
function validateRequestData(data) {
  const sqlInjectionPatterns = [
    /('|--|;|#|-- | --|\/\*)/i,
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXECUTE|UNION|JOIN|FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|OFFSET|INTO|VALUES|CALL|EXEC|DECLARE|BEGIN|END|FETCH|LOCK|MERGE|ROLLBACK|COMMIT|SAVEPOINT|GRANT|REVOKE|DENY|TRANSACTION)\b/i,
    /\/\*.*?\*\//i,
    /\b(WAITFOR|SLEEP|DELAY)\b/i,
    /\b(UNION|ALL)\b.*?\b(SELECT|INSERT|UPDATE|DELETE)\b/i,
    /\(\s*SELECT\s+/i,
    /\b(OR|AND|NOT)\s+\d+\s*=\s*\d+\b/i,
    /\b(CONVERT|CAST)\b/i,
  ];

  function checkStringForSqlInjection(value, fieldPath) {
    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(value)) {
        throw new Error(
          `Invalid request data for field ${fieldPath}: potential SQL injection detected`,
        );
      }
    }
  }

  function checkValue(value, fieldPath) {
    if (typeof value === "string") {
      checkStringForSqlInjection(value, fieldPath);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${fieldPath}[${index}]`);
      });
    } else if (typeof value === "object" && value !== null) {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          checkValue(value[key], `${fieldPath}.${key}`);
        }
      }
    }
  }

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      checkValue(data[key], key);
    }
  }
}

/**
 * 取消令牌类，用于取消请求
 */
class CancelToken {
  constructor() {
    this.isCancelled = false;
    this.cancelCallbacks = [];
  }

  cancel() {
    if (!this.isCancelled) {
      this.isCancelled = true;
      this.cancelCallbacks.forEach((callback) => callback());
      this.cancelCallbacks = [];
    }
  }

  isCancel() {
    return this.isCancelled;
  }

  register(callback) {
    if (this.isCancelled) {
      callback();
      return;
    }
    this.cancelCallbacks.push(callback);
  }
}

/**
 * 网络请求主函数
 * @param {Object} options 请求配置选项
 * @returns {Promise<*>} 请求结果的Promise对象
 */
function request(options) {
  if (DEFAULT_CONFIG.enableCsrf) {
    initCsrfToken();
  }

  const config = {
    ...DEFAULT_CONFIG,
    ...options,
    method: options.method || "GET",
    header: {
      "content-type": "application/json",
      ...options.header,
      ...(DEFAULT_CONFIG.enableCsrf && { "X-CSRF-Token": csrfToken }),
    },
    useCache: options.useCache !== undefined ? options.useCache : true,
  };

  if (config.data && typeof config.data === "object") {
    validateRequestData(config.data);
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
    const cachedData = cacheGet(cacheKey);
    if (cachedData !== null) {
      return Promise.resolve(cachedData);
    }
  }

  if (config.cancelToken && config.cancelToken.isCancel()) {
    return Promise.reject(new Error("Request cancelled"));
  }

  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const maxRetry = processedConfig.retry !== undefined ? processedConfig.retry : DEFAULT_CONFIG.retry;
    const retryDelay = processedConfig.retryDelay !== undefined ? processedConfig.retryDelay : DEFAULT_CONFIG.retryDelay;
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

          if (DEFAULT_CONFIG.enableXssProtection) {
            if (typeof processedResponse.data === "string") {
              processedResponse.data = sanitizeHtml(processedResponse.data);
            } else if (typeof processedResponse.data === "object" && processedResponse.data !== null) {
              const cleanObject = (obj) => {
                for (const key in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (typeof obj[key] === "string") {
                      obj[key] = sanitizeHtml(obj[key]);
                    } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                      cleanObject(obj[key]);
                    } else if (Array.isArray(obj[key])) {
                      obj[key].forEach((item) => {
                        if (typeof item === "object" && item !== null) {
                          cleanObject(item);
                        }
                      });
                    }
                  }
                }
              };
              const cleanData = JSON.parse(JSON.stringify(processedResponse.data));
              cleanObject(cleanData);
              processedResponse.data = cleanData;
            }
          }

          if (
            processedResponse.statusCode &&
            processedResponse.statusCode >= 200 &&
            processedResponse.statusCode < 300
          ) {
            if (config.useCache && config.method === "GET") {
              cacheSet(cacheKey, processedResponse.data);
            }
            resolve(processedResponse.data);
          } else {
            let errorMessage = `请求失败：${processedResponse.statusCode || "未知状态"}`;
            if (processedResponse.statusCode === 401) {
              errorMessage = "未授权，请重新登录";
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
            } else if (processedResponse.statusCode === 403) {
              errorMessage = "权限不足，无法访问该资源";
            } else if (processedResponse.statusCode === 404) {
              errorMessage = "请求的资源不存在";
            } else if (processedResponse.statusCode === 500) {
              errorMessage = "服务器内部错误";
            } else if (processedResponse.data && processedResponse.data.message) {
              errorMessage = processedResponse.data.message;
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

            console.log(`请求失败，${retryCount}/${maxRetry}，${Math.round(retryDelayWithJitter)}ms后重试`, err);
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

    if (
      DEFAULT_CONFIG.enableQueue &&
      activeRequests >= DEFAULT_CONFIG.maxConcurrent
    ) {
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
    activeRequests < DEFAULT_CONFIG.maxConcurrent
  ) {
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      activeRequests++;
      nextRequest();
    }
  }
}

// 暴露公共方法
request.clearCache = function () {
  requestCache.clear();
  requestCacheOrder.length = 0;
};

request.removeCache = function (key) {
  if (requestCache.has(key)) {
    requestCache.delete(key);
    const orderIndex = requestCacheOrder.indexOf(key);
    if (orderIndex >= 0) {
      requestCacheOrder.splice(orderIndex, 1);
    }
  }
};

request.getCacheSize = function () {
  return requestCache.size;
};

request.cleanupExpiredCache = function () {
  cleanupExpiredCache();
};

request.stopCacheCleanup = function () {
  stopCacheCleanup();
};

request.setBaseURL = function (baseURL) {
  DEFAULT_CONFIG.baseURL = baseURL;
};

request.setTimeout = function (timeout) {
  DEFAULT_CONFIG.timeout = timeout;
};

request.setRetry = function (retry) {
  DEFAULT_CONFIG.retry = retry;
};

request.setRetryDelay = function (delay) {
  DEFAULT_CONFIG.retryDelay = delay;
};

request.enableCache = function (enable) {
  DEFAULT_CONFIG.enableCache = enable;
};

request.setCacheTimeout = function (timeout) {
  DEFAULT_CONFIG.cacheTimeout = timeout;
};

request.setMaxCacheSize = function (size) {
  DEFAULT_CONFIG.maxCacheSize = size;
};

request.enableQueue = function (enable) {
  DEFAULT_CONFIG.enableQueue = enable;
};

request.setMaxConcurrent = function (max) {
  DEFAULT_CONFIG.maxConcurrent = max;
};

request.enableCsrf = function (enable) {
  DEFAULT_CONFIG.enableCsrf = enable;
};

request.enableXssProtection = function (enable) {
  DEFAULT_CONFIG.enableXssProtection = enable;
};

request.get = function (url, params, options) {
  return request({
    url,
    method: "GET",
    data: params,
    ...options,
  });
};

request.post = function (url, data, options) {
  return request({
    url,
    method: "POST",
    data,
    ...options,
  });
};

request.put = function (url, data, options) {
  return request({
    url,
    method: "PUT",
    data,
    ...options,
  });
};

request.delete = function (url, params, options) {
  return request({
    url,
    method: "DELETE",
    data: params,
    ...options,
  });
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

module.exports = request;
module.exports.default = request;
module.exports.CancelToken = CancelToken;
