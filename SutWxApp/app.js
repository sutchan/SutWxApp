/**
 * 文件名: app.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-29
 * 描述: 微信小程序应用入口文件，处理应用生命周期事件和全局数据
 */

// 引入监控工具
const monitorUtil = require("./utils/monitor").default;

App({
  onLaunch(options) {
    console.log("[App] onLaunch - 小程序初始化");
    this.initApp();
  },

  onShow(options) {
    console.log("[App] onShow - 小程序显示");
  },

  onHide() {
    console.log("[App] onHide - 小程序隐藏");
  },

  onError(msg) {
    console.error("[App] onError - 小程序错误:", msg);
    monitorUtil.error("小程序全局错误", new Error(msg), { msg });
    this.reportError(msg);
  },

  onPageNotFound(res) {
    console.warn("[App] onPageNotFound - 页面不存在:", res);
    wx.redirectTo({
      url: "/pages/home/index",
    });
  },

  onUnhandledRejection(res) {
    console.error("[App] onUnhandledRejection - 未处理的Promise拒绝:", res);
    monitorUtil.error("未处理的Promise拒绝", res.reason, { res });
    this.reportError(res.reason);
  },

  globalData: {
    userInfo: null,
    token: null,
    openid: null,
    appId: "",
    baseUrl: "https://api.example.com",
    version: "1.0.0",
    debug: true,
  },

  initApp() {
    this.loadStorageData();
    this.checkVersion();
    this.reportAnalytics();
  },

  loadStorageData() {
    try {
      const token = wx.getStorageSync("token");
      const userInfo = wx.getStorageSync("userInfo");
      const openid = wx.getStorageSync("openid");

      if (token) {
        this.globalData.token = token;
      }
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
      if (openid) {
        this.globalData.openid = openid;
      }

      console.log("[App] loadStorageData - 数据加载完成");
    } catch (error) {
      console.error("[App] loadStorageData - 数据加载失败:", error);
    }
  },

  saveData(key, data) {
    try {
      wx.setStorageSync(key, data);
      if (key === "token") {
        this.globalData.token = data;
      } else if (key === "userInfo") {
        this.globalData.userInfo = data;
      } else if (key === "openid") {
        this.globalData.openid = data;
      }
    } catch (error) {
      console.error(`[App] saveData - 保存数据失败 [${key}]:`, error);
    }
  },

  clearData() {
    try {
      wx.removeStorageSync("token");
      wx.removeStorageSync("userInfo");
      wx.removeStorageSync("openid");
      wx.removeStorageSync("cart");

      this.globalData.token = null;
      this.globalData.userInfo = null;
      this.globalData.openid = null;

      console.log("[App] clearData - 数据清除完成");
    } catch (error) {
      console.error("[App] clearData - 数据清除失败:", error);
    }
  },

  checkVersion() {
    const systemInfo = wx.getSystemInfoSync();
    const SDKVersion = systemInfo.SDKVersion;

    console.log("[App] checkVersion - SDK版本:", SDKVersion);
  },

  reportAnalytics() {
    if (this.globalData.debug) {
      console.log("[App] reportAnalytics - 调试模式，跳过数据上报");
      return;
    }
  },

  reportError(error) {
    console.error("[App] reportError - 错误上报:", error);
    // 使用监控工具上报错误
    monitorUtil.error("应用错误上报", error, { debug: this.globalData.debug });
    if (this.globalData.debug) {
      return;
    }
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
        return;
      }

      wx.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          this.saveData("userInfo", res.userInfo);
          resolve(res.userInfo);
        },
        fail: (error) => {
          console.error("[App] getUserInfo - 获取用户信息失败:", error);
          reject(error);
        },
      });
    });
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            console.log("[App] login - 登录凭证获取成功:", loginRes.code);
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
  },

  requestWithToken(url, method = "GET", data = {}) {
    return new Promise((resolve, reject) => {
      const token = this.globalData.token;

      if (!token) {
        reject(new Error("未登录，请先登录"));
        return;
      }

      wx.request({
        url: this.globalData.baseUrl + url,
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
            this.clearData();
            wx.redirectTo({
              url: "/pages/home/index",
            });
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
  },
});
