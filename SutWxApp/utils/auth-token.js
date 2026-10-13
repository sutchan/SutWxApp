/**
 * 文件名: auth-token.js
 * 版本号: 3.5.0
 * 更新日期: 2026-10-13
 * 描述: 登录态令牌的存储、过期解析与读写（纯逻辑，不依赖服务层，避免循环引用）
 */

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_INFO_KEY = "userInfo";
const OPENID_KEY = "openid";

// 过期预判提前量（秒）：token 剩余有效期小于该值时提前刷新，避免请求途中过期
const REFRESH_SKEW = 120;

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * 读取本地存储（wx 不可用时返回 null，便于 Node 单测）
 * @param {string} key 存储键
 * @returns {*}
 */
function readStorage(key) {
  try {
    if (typeof wx === "undefined" || !wx.getStorageSync) return null;
    const value = wx.getStorageSync(key);
    return value === "" || value === undefined ? null : value;
  } catch (e) {
    return null;
  }
}

/**
 * 写入本地存储
 * @param {string} key 存储键
 * @param {*} value 值
 */
function writeStorage(key, value) {
  try {
    if (typeof wx === "undefined" || !wx.setStorageSync) return;
    wx.setStorageSync(key, value);
  } catch (e) {
    // 存储失败不影响主流程
  }
}

/**
 * 移除本地存储
 * @param {string} key 存储键
 */
function removeStorage(key) {
  try {
    if (typeof wx === "undefined" || !wx.removeStorageSync) return;
    wx.removeStorageSync(key);
  } catch (e) {
    // 忽略
  }
}

/**
 * Base64URL 解码（不依赖 atob / Buffer，兼容小程序基础库）
 * @param {string} input 编码字符串
 * @returns {string} 解码后的字符串，失败返回空串
 */
function base64UrlDecode(input) {
  if (typeof input !== "string") return "";

  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) {
    str += "=";
  }

  let output = "";
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === "=") break;

    const index = BASE64_ALPHABET.indexOf(char);
    if (index < 0) return "";

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

/**
 * 解析 JWT 的 exp（过期时间戳，秒）
 * @param {string} token token 字符串
 * @returns {number} 过期时间戳；无法解析时返回 0
 */
function decodeExp(token) {
  if (typeof token !== "string") return 0;

  const parts = token.split(".");
  if (parts.length !== 3) return 0;

  const payloadText = base64UrlDecode(parts[1]);
  if (!payloadText) return 0;

  try {
    const payload = JSON.parse(payloadText);
    const exp = Number(payload && payload.exp);
    return Number.isFinite(exp) && exp > 0 ? exp : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * token 是否已过期
 * @param {string} token token 字符串
 * @param {number} [skew] 提前量（秒）
 * @returns {boolean} 无法解析 exp 时视为未过期（兼容非 JWT 的本地 token）
 */
function isExpired(token, skew = 0) {
  const exp = decodeExp(token);
  if (!exp) return false;
  return Math.floor(Date.now() / 1000) >= exp - skew;
}

/**
 * token 是否即将过期（需提前刷新）
 * @param {string} token token 字符串
 * @param {number} [skew] 提前量（秒），默认 REFRESH_SKEW
 * @returns {boolean}
 */
function willExpireSoon(token, skew = REFRESH_SKEW) {
  return isExpired(token, skew);
}

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
