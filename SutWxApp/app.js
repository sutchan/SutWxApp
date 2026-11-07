/**
 * 文件名: app.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 微信小程序应用入口文件，处理应用生命周期事件和全局数据（逻辑见 helpers.js）
 */

// 引入监控工具和请求取消令牌
const monitorUtil = require("./utils/monitor").default;
const helpers = require("./helpers");
const request = require("./utils/request");
const i18n = require("./utils/i18n");
const env = require("./utils/env");
const privacy = require("./utils/privacy");

App({
  onLaunch(options) {
    this.initApp();
    this.registerPrivacyGuard();
    this.checkBaseLibrary();
  },

  onShow(options) { },

  onHide() { },

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
    version: "3.5.14",
    locale: "zh-CN", // 当前界面语言（由 i18n 初始化）
    debug: false,
    privacyResolve: null, // COM-001：官方 onNeedPrivacyAuthorization 回调，由隐私授权页消费
    request: {
      CancelToken: helpers.CancelToken,
    },
  },

  initApp() {
    // FE-007：按运行环境（develop/trial/release）注入 baseURL
    const envConfig = env.getEnvConfig();
    this.globalData.baseUrl = envConfig.baseUrl;
    // 将全局 baseUrl 注入请求层（request-api 的 setBaseURL 修改共享 CONFIG）
    request.setBaseURL(this.globalData.baseUrl);
    // FE-002：依据系统语言 / 本地偏好初始化界面语言
    this.globalData.locale = i18n.initLocale();
    helpers.loadStorageData(this.globalData);
    helpers.checkVersion(this.globalData);
    helpers.reportAnalytics(this.globalData);
    helpers.loadTheme(this);
    // FE-006：启用客户端监控链路（采集器 + 自动上报，目标 /api/monitor/data）。
    // develop 环境不上报（enableMonitor=false 时仅本地采集，见 monitor-config）。
    if (envConfig.enableMonitor) {
      monitorUtil.init({
        reportUrl: env.apiUrl("/api/monitor/data"),
        appId: "sut-wx-app",
      });
    }
  },

  /**
   * COM-001：注册全局隐私授权监听。隐私接口被调用且用户未授权时，
   * 跳转隐私授权页，由该页的 agreePrivacyAuthorization 按钮释放官方 resolve。
   * 基础库 < 2.32.3 时能力缺失，registerNeedPrivacyAuthorization 返回 false，业务走降级。
   */
  registerPrivacyGuard() {
    const registered = privacy.registerNeedPrivacyAuthorization((resolve) => {
      this.globalData.privacyResolve = resolve;
      wx.navigateTo({
        url: "/pages/privacy/index",
        fail: () => {
          this.globalData.privacyResolve = null;
          resolve({ event: "disagree" });
        },
      });
    });
    if (!registered) {
      console.warn("[App] 隐私校验接口不可用（基础库过低），走兼容逻辑");
    }
  },

  /** FE-009：隐私接口与头像选择器要求基础库 2.32.3+，低版本给出升级提示。 */
  checkBaseLibrary() {
    try {
      const info = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
      if (privacy.compareVersion(info.SDKVersion, privacy.MIN_SDK_VERSION) < 0) {
        wx.showModal({
          title: "版本提示",
          content: "当前微信版本过低，请升级微信后使用完整功能",
          showCancel: false,
        });
      }
    } catch (e) {
      console.warn("[App] 基础库版本读取失败", e);
    }
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
