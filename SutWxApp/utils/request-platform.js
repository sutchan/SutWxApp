/**
 * 文件名: request-platform.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 安全获取微信小程序 wx 环境的辅助函数（request / monitor 共用，避免重复实现）
 */

/**
 * 安全获取 wx 对象
 * @returns {any|null} 微信小程序 wx 对象，如果不存在则返回 null
 */
function getWx() {
  if (typeof wx !== "undefined") {
    return wx;
  }
  return null;
}

/**
 * 检查 wx 对象是否存在，并抛出错误如果不存在
 * @returns {any} 微信小程序 wx 对象
 * @throws {Error} 如果 wx 对象未定义则抛出错误
 */
function checkWx() {
  const wx = getWx();
  if (!wx) {
    throw new Error("wx对象未定义");
  }
  return wx;
}

module.exports = { getWx, checkWx };
