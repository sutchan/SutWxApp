/**
 * 文件名: auth-token-storage.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 登录态存储键与本地存储读写（wx 不可用时安全降级，便于 Node 单测）
 */

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_INFO_KEY = "userInfo";
const OPENID_KEY = "openid";

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

module.exports = {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO_KEY,
  OPENID_KEY,
  readStorage,
  writeStorage,
  removeStorage,
};
