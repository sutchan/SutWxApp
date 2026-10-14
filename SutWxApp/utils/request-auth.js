/**
 * 文件名: request-auth.js
 * 版本号: 3.5.2
 * 更新日期: 2026-10-14
 * 描述: 401 无感刷新与请求重放（FE-001）。access token 过期时静默调用 refresh-token
 *       端点刷新并自动重放原请求一次；刷新失败或无刷新令牌则清除登录态并跳转登录页。
 *       与 auth-token.js 配合，刷新请求通过延迟 require 避免与 request.js 形成循环依赖。
 */

const authToken = require("./auth-token");

// 刷新锁：并发 401 时仅发起一次 refresh 请求，其余复用同一 Promise
let refreshPromise = null;

/**
 * 单飞刷新 access token（BE-002 /auth/refresh-token 端点）
 * @returns {Promise<Object>} 新登录态（含 token / refreshToken / userInfo）
 */
function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = authToken.getRefreshToken();
  if (!refreshToken) {
    return Promise.reject(new Error("no_refresh_token"));
  }

  // 延迟引入 request，避免与 request.js 形成循环依赖
  const request = require("./request");
  refreshPromise = request({
    url: "/api/auth/refresh-token",
    method: "POST",
    needAuth: false,
    useCache: false,
    data: { refreshToken },
    _authInternal: true,
  })
    .then((data) => {
      authToken.saveAuth(data);
      return data;
    })
    // 刷新请求本身失败（非「无刷新令牌」）→ 归一化为 token_refresh_failed，
    // 便于 request.js 统一展示「登录已过期，请重新登录」
    .catch(() => {
      throw new Error("token_refresh_failed");
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * 处理 401 未授权：尝试一次静默刷新并重放原请求。
 * @param {Object} config 原请求配置（processedConfig）
 * @param {Function} send 重新发起请求的回调（即 request 主函数）
 * @returns {Promise<*>}
 */
function handleUnauthorized(config, send) {
  if (config._authRetried || config._authInternal) {
    // 刷新请求自身 401 或已重试过 → 放弃，交由兜底清理
    return Promise.reject(new Error("token_refresh_failed"));
  }
  return refreshAccessToken().then(() => {
    return send(Object.assign({}, config, { _authRetried: true }));
  });
}

/**
 * 兜底：清除登录态并跳转登录页（刷新失败 / 无刷新令牌）。
 * @param {Object} [wxInstance] wx 实例（测试可注入，默认取全局 wx）
 */
function clearAndRedirect(wxInstance) {
  const wx =
    wxInstance ||
    (typeof globalThis !== "undefined" ? globalThis.wx : undefined) ||
    null;

  authToken.clearAuth();
  if (wx && wx.removeStorageSync) {
    try {
      wx.removeStorageSync("openid");
    } catch (e) {
      // 忽略存储异常
    }
  }
  if (wx && wx.reLaunch) {
    try {
      wx.reLaunch({ url: "/pages/home/index" });
    } catch (e) {
      // 忽略跳转异常
    }
  }
}

module.exports = {
  refreshAccessToken,
  handleUnauthorized,
  clearAndRedirect,
};
