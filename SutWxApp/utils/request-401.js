/**
 * 文件名: request-401.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 401 无感刷新兜底：需要鉴权的请求遇 401 时静默刷新 token 并重放一次，
 *       刷新失败则清理登录态并跳转；内部刷新请求 / 已重试请求短路不递归。
 */

const requestAuth = require("./request-auth");
const { checkWx } = require("./request-platform");

/**
 * 为请求 Promise 挂载 401 无感刷新兜底
 * @param {Promise} promise 原始请求 Promise
 * @param {Object} options 原始请求配置
 * @param {Object} processedConfig 经拦截器处理后的配置
 * @param {Function} request 请求主函数（重放用）
 * @returns {Promise}
 */
function withUnauthorizedFallback(promise, options, processedConfig, request) {
  // 公开请求 / 内部刷新 / 已重试请求不触发兜底，避免递归
  if (
    options &&
    (options.needAuth === false || options._authInternal || options._authRetried)
  ) {
    return promise;
  }

  return promise.catch((err) => {
    if (err && err.statusCode === 401) {
      return requestAuth
        .handleUnauthorized(processedConfig, request)
        .catch((refreshErr) => {
          requestAuth.clearAndRedirect(checkWx());
          const msg =
            refreshErr && refreshErr.message === "token_refresh_failed"
              ? "登录已过期，请重新登录"
              : (refreshErr && refreshErr.message) || "登录已过期，请重新登录";
          throw new Error(msg);
        });
    }
    throw err;
  });
}

module.exports = {
  withUnauthorizedFallback,
};
