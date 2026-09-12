/**
 * 文件名: monitor-utils.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的基础工具函数（会话ID、系统信息、页面路径、时间戳）
 */

const { getWx } = require("./request-platform");

/**
 * 生成会话ID
 * @returns {string} 会话ID
 */
function generateSessionId() {
  const timestamp = Date.now();
  let randomStr = "";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `session_${timestamp}_${randomStr}`;
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息对象
 */
function getSystemInfo() {
  const wx = getWx();
  if (!wx) return {};
  try {
    return wx.getSystemInfoSync
      ? wx.getSystemInfoSync()
      : wx.getWindowInfo
        ? wx.getWindowInfo()
        : {};
  } catch (e) {
    return {};
  }
}

/**
 * 获取当前页面路径
 * @returns {string} 当前页面路径，如果获取失败则返回空字符串
 */
function getCurrentPagePath() {
  const wx = getWx();
  if (!wx || !wx.getCurrentPages) return "";
  try {
    const pages = wx.getCurrentPages();
    if (pages && pages.length > 0) {
      return pages[pages.length - 1].route || "";
    }
  } catch (e) {
    return "";
  }
  return "";
}

/**
 * 获取当前时间戳
 * @returns {number} 当前时间戳（毫秒）
 */
function getCurrentTime() {
  return Date.now();
}

module.exports = {
  generateSessionId,
  getSystemInfo,
  getCurrentPagePath,
  getCurrentTime,
};
