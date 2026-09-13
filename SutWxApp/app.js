/**
 * 文件名: app.js
 * 版本号: 3.2.0
 * 更新日期: 2026-09-13
 * 描述: 微信小程序应用入口文件，处理应用生命周期事件和全局数据（逻辑见 helpers.js）
 */

// 引入监控工具和请求取消令牌
const monitorUtil = require("./utils/monitor").default;
const helpers = require("./helpers");
const request = require("./utils/request");

App({
  onLaunch(options) {
    this.initApp();
  },

  onShow(options) {},

  onHide() {},

  onError(msg) {
    console.error("[App] onError - 小程序错误:", msg);
    monitorUtil.error("小程序全局错误", new Error(msg), { msg });
    this.reportError(msg);
  },

  onPageNotFound(res) {
    console.warn("[App] onPageNotFound - 页面不存在:", res);
    wx.redirectTo({ url: "/pages/home/index" });
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
    productSource: "mock", // 'mock'（默认）| 'woocommerce'：商品数据源（WooCommerce 需配套 WP 插件）
    theme: null, // 当前主题色值（由 themeService 加载）
    themeStyle: "", // 当前主题 CSS 变量声明字符串（供页面根容器绑定）
    version: "3.2.0",
    debug: false,
    request: {
      CancelToken: helpers.CancelToken,
    },
  },

  initApp() {
    // 将全局 baseUrl 注入请求层（request-api 的 setBaseURL 修改共享 CONFIG）
    request.setBaseURL(this.globalData.baseUrl);
    helpers.loadStorageData(this.globalData);
    helpers.checkVersion(this.globalData);
    helpers.reportAnalytics(this.globalData);
    helpers.loadTheme(this);
  },

  loadTheme() {
    helpers.loadTheme(this);
  },

  loadStorageData() {
    helpers.loadStorageData(this.globalData);
  },

  saveData(key, data) {
    helpers.saveData(this.globalData, key, data);
  },

  clearData() {
    helpers.clearData(this.globalData);
  },

  checkVersion() {
    helpers.checkVersion(this.globalData);
  },

  reportAnalytics() {
    helpers.reportAnalytics(this.globalData);
  },

  reportError(error) {
    helpers.reportError(this.globalData, error);
  },

  getUserInfo() {
    return helpers.getUserInfo(this.globalData);
  },

  login() {
    return helpers.login();
  },

  requestWithToken(url, method = "GET", data = {}) {
    return helpers.requestWithToken(this.globalData, url, method, data);
  },
});
