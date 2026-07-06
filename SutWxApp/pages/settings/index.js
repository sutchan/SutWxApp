/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: 设置页面，处理用户账户安全、通知、隐私等设置
 */

const app = getApp();
const authService = require("../../../services/authService");

Page({
  data: {
    messagePush: true,
    emailNotify: false,
    privacyMode: false,
    locationAuth: true,
  },

  onLoad: function () {
    this.loadSettings();
  },

  onShow: function () {
    if (app.globalData.needRefreshSettings) {
      this.loadSettings();
      app.globalData.needRefreshSettings = false;
    }
  },

  loadSettings: function () {
    const that = this;
    const settings = wx.getStorageSync("userSettings");

    if (settings) {
      this.setData({
        messagePush: settings.messagePush !== false,
        emailNotify: settings.emailNotify === true,
        privacyMode: settings.privacyMode === true,
        locationAuth: settings.locationAuth !== false,
      });
    }
  },

  onSwitchChange: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;

    this.setData({
      [field]: value,
    });

    const settings = wx.getStorageSync("userSettings") || {};
    settings[field] = value;
    wx.setStorageSync("userSettings", settings);

    wx.showToast({
      title: "设置已保存",
      icon: "success",
      duration: 1000,
    });
  },

  // 导航到子页面：仅 help 已注册，其余提示开发中
  onNavigateTo: function (e) {
    const page = e.currentTarget.dataset.page;
    if (page === "help") {
      wx.navigateTo({ url: "/pages/help/index" });
      return;
    }
    // password/phone/about/feedback 等页面未注册
    wx.showToast({ title: "功能开发中", icon: "none" });
  },

  onCheckVersion: function () {
    wx.showModal({
      title: "检查更新",
      content: "当前已是最新版本",
      showCancel: false,
      confirmText: "知道了",
      confirmColor: "#F44336",
    });
  },

  onLogout: function () {
    const that = this;

    wx.showModal({
      title: "确认退出",
      content: "确定要退出登录吗？",
      confirmColor: "#F44336",
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: "退出中..." });

          authService.logout({
            success: function () {
              wx.hideLoading();

              wx.removeStorageSync("token");
              wx.removeStorageSync("userInfo");
              wx.removeStorageSync("userSettings");

              app.globalData.userInfo = null;
              app.globalData.token = null;

              wx.showToast({
                title: "已退出登录",
                icon: "success",
              });

              setTimeout(function () {
                wx.reLaunch({
                  url: "/pages/user/index",
                });
              }, 1500);
            },
            fail: function (err) {
              wx.hideLoading();
              console.error("退出登录失败:", err);

              wx.removeStorageSync("token");
              wx.removeStorageSync("userInfo");
              wx.removeStorageSync("userSettings");

              app.globalData.userInfo = null;
              app.globalData.token = null;

              wx.reLaunch({
                url: "/pages/user/index",
              });
            },
          });
        }
      },
    });
  },

  onShareAppMessage: function () {
    return {
      title: "苏铁商城 - 设置",
      path: "/pages/settings/index",
    };
  },
});
