/**
 * 文件名: helpers.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: App 入口的辅助逻辑（存储/主题/错误上报/登录/带鉴权请求），从 app.js 抽离
 */

const { CancelToken } = require("./utils/request");
const themeService = require("./services/themeService");
const monitorUtil = require("./utils/monitor").default;

// 基础库版本号比较（微信官方推荐实现）
function compareVersion(v1, v2) {
  const a = v1.split(".").map((n) => parseInt(n, 10));
  const b = v2.split(".").map((n) => parseInt(n, 10));
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/**
 * 从本地存储加载全局数据
 * @param {Object} globalData App 全局数据对象
 */
function loadStorageData(globalData) {
  try {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    const openid = wx.getStorageSync("openid");

    if (token) globalData.token = token;
    if (userInfo) globalData.userInfo = userInfo;
    if (openid) globalData.openid = openid;
  } catch (error) {
    console.error("[App] loadStorageData - 数据加载失败:", error);
  }
}

/**
 * 保存全局数据到本地存储
 * @param {Object} globalData App 全局数据对象
 * @param {string} key 键名
 * @param {*} data 数据
 */
function saveData(globalData, key, data) {
  try {
    wx.setStorageSync(key, data);
    if (key === "token") globalData.token = data;
    else if (key === "userInfo") globalData.userInfo = data;
    else if (key === "openid") globalData.openid = data;
  } catch (error) {
    console.error(`[App] saveData - 保存数据失败 [${key}]:`, error);
  }
}

/**
 * 清除本地存储与全局数据
 * @param {Object} globalData App 全局数据对象
 */
function clearData(globalData) {
  try {
    wx.removeStorageSync("token");
    wx.removeStorageSync("userInfo");
    wx.removeStorageSync("openid");
    wx.removeStorageSync("cart");

    globalData.token = null;
    globalData.userInfo = null;
    globalData.openid = null;
  } catch (error) {
    console.error("[App] clearData - 数据清除失败:", error);
  }
}

/**
 * 加载并应用主题
 * @param {Object} app App 实例
 */
function loadTheme(app) {
  themeService
    .loadAndApplyTheme(app)
    .catch((err) => {
      console.error("[App] loadTheme - 主题加载失败:", err);
    });
}

/**
 * 检查基础库版本
 * @param {Object} [globalData] App 全局数据对象
 */
function checkVersion(globalData) {
  const systemInfo = wx.getSystemInfoSync();
  const SDKVersion = systemInfo.SDKVersion;
  if (!SDKVersion || compareVersion(SDKVersion, "2.10.0") < 0) {
    console.error("[App] checkVersion - 基础库版本过低:", SDKVersion);
  }
}

/**
 * 上报分析（当前为空实现占位）
 * @param {Object} [globalData] App 全局数据对象
 */
function reportAnalytics(globalData) {
  // 预留：调试态下不采集
}

/**
 * 上报错误
 * @param {Object} globalData App 全局数据对象
 * @param {*} error 错误对象或信息
 */
function reportError(globalData, error) {
  console.error("[App] reportError - 错误上报:", error);
  monitorUtil.error("应用错误上报", error, { debug: globalData && globalData.debug });
}

/**
 * 获取用户信息
 * @param {Object} globalData App 全局数据对象
 * @returns {Promise<Object>}
 */
function getUserInfo(globalData) {
  return new Promise((resolve, reject) => {
    if (globalData.userInfo) {
      resolve(globalData.userInfo);
      return;
    }
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        saveData(globalData, "userInfo", res.userInfo);
        resolve(res.userInfo);
      },
      fail: (error) => {
        console.error("[App] getUserInfo - 获取用户信息失败:", error);
        reject(error);
      },
    });
  });
}

/**
 * 微信登录获取 code
 * @returns {Promise<string>}
 */
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          resolve(loginRes.code);
        } else {
          reject(new Error("登录凭证获取失败"));
        }
      },
      fail: (error) => {
        console.error("[App] login - 登录失败:", error);
        reject(error);
      },
    });
  });
}

/**
 * 带鉴权的请求
 * @param {Object} globalData App 全局数据对象
 * @param {string} url 接口路径
 * @param {string} [method] 请求方法
 * @param {Object} [data] 请求数据
 * @returns {Promise<*>}
 */
function requestWithToken(globalData, url, method = "GET", data = {}) {
  return new Promise((resolve, reject) => {
    const token = globalData.token;

    if (!token) {
      reject(new Error("未登录，请先登录"));
      return;
    }

    wx.request({
      url: globalData.baseUrl + url,
      method,
      data,
      header: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          console.warn("[App] requestWithToken - Token过期，需要重新登录");
          clearData(globalData);
          wx.redirectTo({ url: "/pages/home/index" });
          reject(new Error("登录已过期"));
        } else {
          reject(new Error(res.data.message || "请求失败"));
        }
      },
      fail: (error) => {
        console.error("[App] requestWithToken - 请求失败:", error);
        reject(error);
      },
    });
  });
}

module.exports = {
  CancelToken,
  compareVersion,
  loadStorageData,
  saveData,
  clearData,
  loadTheme,
  checkVersion,
  reportAnalytics,
  reportError,
  getUserInfo,
  login,
  requestWithToken,
};
