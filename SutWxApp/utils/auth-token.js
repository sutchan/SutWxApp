/**
 * 文件名: auth-token.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 登录态令牌主模块（编排层）。存储读写见 auth-token-storage.js，
 *       JWT 过期解析见 auth-token-jwt.js；公开导出契约保持不变。
 */

const {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO_KEY,
  OPENID_KEY,
  readStorage,
  writeStorage,
  removeStorage,
} = require("./auth-token-storage");
const {
  REFRESH_SKEW,
  base64UrlDecode,
  decodeExp,
  isExpired,
  willExpireSoon,
} = require("./auth-token-jwt");

/**
 * 读取当前 access token
 * @returns {string} token，不存在返回空串
 */
function getToken() {
  const token = readStorage(TOKEN_KEY);
  return typeof token === "string" ? token : "";
}

/**
 * 读取 refresh token
 * @returns {string} refreshToken，不存在返回空串
 */
function getRefreshToken() {
  const token = readStorage(REFRESH_TOKEN_KEY);
  return typeof token === "string" ? token : "";
}

/**
 * 是否已登录（有 access token 且未过期）
 * @returns {boolean}
 */
function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  return !isExpired(token);
}

/**
 * 保存登录结果（登录 / 刷新接口返回体）
 * @param {Object} result 接口返回的业务数据
 * @returns {Object} 归一化后的登录态
 */
function saveAuth(result) {
  const data = result && typeof result === "object" ? result : {};
  const token = typeof data.token === "string" ? data.token : "";
  const refreshToken =
    typeof data.refreshToken === "string" ? data.refreshToken : "";

  if (token) {
    writeStorage(TOKEN_KEY, token);
  }
  if (refreshToken) {
    writeStorage(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (data.userInfo) {
    writeStorage(USER_INFO_KEY, data.userInfo);
  }
  if (data.openid) {
    writeStorage(OPENID_KEY, data.openid);
  }
  if (data.userInfo && data.userInfo.openid) {
    writeStorage(OPENID_KEY, data.userInfo.openid);
  }

  return {
    token,
    refreshToken,
    userInfo: data.userInfo || null,
    expiresAt: decodeExp(token),
  };
}

/**
 * 清除登录态
 */
function clearAuth() {
  removeStorage(TOKEN_KEY);
  removeStorage(REFRESH_TOKEN_KEY);
  removeStorage(USER_INFO_KEY);
}

/**
 * 读取缓存的用户信息
 * @returns {Object|null}
 */
function getUserInfo() {
  return readStorage(USER_INFO_KEY);
}

module.exports = {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO_KEY,
  OPENID_KEY,
  REFRESH_SKEW,
  base64UrlDecode,
  decodeExp,
  isExpired,
  willExpireSoon,
  getToken,
  getRefreshToken,
  isLoggedIn,
  saveAuth,
  clearAuth,
  getUserInfo,
};
