/**
 * 文件名: authService.js
 * 版本号: 3.5.10
 * 更新日期: 2026-10-13
 * 描述: 认证服务，处理登录、注册、登出、token刷新等认证相关功能。
 *       登录态存储统一委托 auth-token.js（saveAuth / clearAuth），避免与请求层重复实现。
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const authToken = require("../utils/auth-token");

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
      // 后端 rewrite 仅匹配 ^api/，端点必须带 /api 前缀。
      const raw = await request.post("/api/auth/login", params, {
        needAuth: false,
        useCache: false,
      });
      // request 层返回 {code,data} 包络，saveAuth 需要解包后的 token 对象。
      const result = unwrap(raw) || {};
      authToken.saveAuth(result);
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
      const raw = await request.post("/api/auth/logout", {}, { useCache: false });
      const result = unwrap(raw);
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    } finally {
      // 无论服务端登出成功与否，本地登录态必须清除，否则退出后仍带着旧 token。
      authToken.clearAuth();
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
      const raw = await request.post(
        "/api/auth/refresh-token",
        { refreshToken },
        { needAuth: false, useCache: false },
      );
      const result = unwrap(raw) || {};
      authToken.saveAuth(result);
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
      const raw = await request.get("/api/user/info", {}, { useCache: true });
      const result = unwrap(raw) || {};
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
   * 清除认证信息（委托 auth-token.js）
   */
  clearAuth() {
    authToken.clearAuth();
  },
};

module.exports = authService;
module.exports.default = authService;
