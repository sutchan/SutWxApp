/**
 * 文件名: authService.js
 * 版本号: 3.0.1
 * 更新日期: 2026-08-13
 * 描述: 认证服务，处理登录、注册、登出、token刷新等认证相关功能
 */

const request = require("../utils/request");

/**
 * 认证服务模块
 */
const authService = {
  /**
   * 微信登录
   * @param {Object} params 登录参数，包含code、userInfo、encryptedData、iv等
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 登录结果Promise
   */
  async login(params, success, fail) {
    try {
      const result = await request.post("/auth/login", params, {
        needAuth: false,
        useCache: false,
      });
      if (result && result.token) {
        wx.setStorageSync("token", result.token);
        if (result.userInfo) {
          wx.setStorageSync("userInfo", result.userInfo);
        }
      }
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 微信静默登录（仅获取code）
   * @returns {Promise} 包含code的Promise
   */
  async silentLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error("获取登录code失败"));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },

  /**
   * 注册新用户
   * @param {Object} params 注册参数，包含手机号、验证码等
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 注册结果Promise
   */
  async register(params, success, fail) {
    try {
      const result = await request.post("/auth/register", params, {
        needAuth: false,
        useCache: false,
      });
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 登出
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 登出结果Promise
   */
  async logout(success, fail) {
    try {
      const result = await request.post("/auth/logout", {}, { useCache: false });
      wx.removeStorageSync("token");
      wx.removeStorageSync("userInfo");
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 刷新token
   * @param {string} refreshToken 刷新令牌
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 刷新结果Promise
   */
  async refreshToken(refreshToken, success, fail) {
    try {
      const result = await request.post(
        "/auth/refresh-token",
        { refreshToken },
        { needAuth: false, useCache: false },
      );
      if (result && result.token) {
        wx.setStorageSync("token", result.token);
      }
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 获取当前用户信息
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 用户信息Promise
   */
  async getUserInfo(success, fail) {
    try {
      const result = await request.get("/user/info", {}, { useCache: true });
      wx.setStorageSync("userInfo", result);
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 检查登录状态
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    try {
      const token = wx.getStorageSync("token");
      const userInfo = wx.getStorageSync("userInfo");
      return typeof token === "string" && token.length > 0 && !!userInfo;
    } catch (e) {
      return false;
    }
  },

  /**
   * 获取存储的token
   * @returns {string} token字符串，不存在时返回空字符串
   */
  getToken() {
    try {
      return wx.getStorageSync("token") || "";
    } catch (e) {
      return "";
    }
  },

  /**
   * 清除认证信息
   */
  clearAuth() {
    try {
      wx.removeStorageSync("token");
      wx.removeStorageSync("userInfo");
    } catch (e) {}
  },
};

module.exports = authService;
module.exports.default = authService;
