/**
 * 文件名: request-auth-header.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 请求鉴权头注入（从本地存储读取 token 挂载 Authorization，无 token 时返回错误）
 */

const { checkWx } = require("./request-platform");

/**
 * 为需要鉴权的请求注入 Authorization 头
 * @param {Object} config 请求配置
 * @returns {{ok: true, header: Object} | {ok: false, error: Error}}
 */
function applyAuthHeader(config) {
  try {
    const wx = checkWx();
    const token = wx.getStorageSync("token");
    if (typeof token === "string" && token.length > 0) {
      return {
        ok: true,
        header: { ...config.header, Authorization: `Bearer ${token}` },
      };
    }
    // 返回 rejected Promise，避免同步 throw 破坏 .rejects 契约
    return { ok: false, error: new Error("未授权，请重新登录") };
  } catch (error) {
    return { ok: false, error: new Error("未授权，请重新登录") };
  }
}

module.exports = {
  applyAuthHeader,
};
