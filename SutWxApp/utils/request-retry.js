/**
 * 文件名: request-retry.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 请求失败重试与离线降级（指数退避 + 抖动；GET 请求耗尽重试后回退离线快照）
 */

const CONFIG = require("./request-config");
const offline = require("./offline-snapshot");

/**
 * 创建 wx.request 的 fail 回调
 * @param {Object} deps 依赖
 * @param {Object} deps.config 请求配置
 * @param {number} deps.maxRetry 最大重试次数
 * @param {number} deps.retryDelay 重试基础延迟（ms）
 * @param {string} deps.cacheKey 缓存键（离线快照定位用）
 * @param {{count: number}} deps.retryState 重试计数状态
 * @param {Function} deps.sendRequest 重发函数
 * @param {Function} deps.resolve Promise resolve
 * @param {Function} deps.reject Promise reject
 * @returns {Function} fail 回调
 */
function createFailHandler(deps) {
  const {
    config,
    maxRetry,
    retryDelay,
    cacheKey,
    retryState,
    sendRequest,
    resolve,
    reject,
  } = deps;

  return function handleFail(err) {
    if (config.cancelToken && config.cancelToken.isCancel()) {
      reject(new Error("Request cancelled"));
      return;
    }

    if (retryState.count < maxRetry) {
      retryState.count++;
      const delay = retryDelay * Math.pow(2, retryState.count - 1);
      const jitter = Math.random() * delay * 0.5;
      const retryDelayWithJitter = delay + jitter;
      console.warn(
        `请求失败，${retryState.count}/${maxRetry}，${Math.round(retryDelayWithJitter)}ms后重试`,
      );
      setTimeout(sendRequest, retryDelayWithJitter);
      return;
    }

    // FE-003：断网降级——GET 请求失败时回退离线快照
    if (CONFIG.enableOffline && config.method === "GET" && config.useCache) {
      const snap = offline.getSnapshot(cacheKey);
      if (snap && snap.data !== undefined) {
        console.warn(`网络不可用，回退离线快照：${cacheKey}`);
        resolve(snap.data);
        return;
      }
    }

    let errorMessage = "网络请求失败";
    if (err.errMsg) {
      errorMessage = err.errMsg;
    } else if (err.message) {
      errorMessage = err.message;
    }
    reject(new Error(errorMessage));
  };
}

module.exports = {
  createFailHandler,
};
