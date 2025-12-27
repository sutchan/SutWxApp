/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: 设置页面，处理用户账户安全、通知、隐私等设置
 */

const app = getApp();
const authService = require('../../../services/authService.js');

Page({
  data: {
    messagePush: true,
    emailNotify: false,
    privacyMode: false,
    locationAuth: true
  },

  onLoad: function() {
    this.loadSettings();
  },

  onShow: function() {
    if (app.globalData.needRefreshSettings) {
      this.loadSettings();
      app.globalData.needRefreshSettings = false;
    }
  },

  loadSettings: function() {
    const that = this;
    const settings = wx.getStorageSync('userSettings');

    if (settings) {
      this.setData({
        messagePush: settings.messagePush !== false,
        emailNotify: settings.emailNotify === true,
        privacyMode: settings.privacyMode === true,
        locationAuth: settings.locationAuth !== false
      });
    }
  },

  onSwitchChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;

    this.setData({
      [field]: value
    });

    const settings = wx.getStorageSync('userSettings') || {};
    settings[field] = value;
    wx.setStorageSync('userSettings', settings);

    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1000
    });
  },

  onNavigateTo: function(e) {
    const page = e.currentTarget.dataset.page;
    const pageMap = {
      password: '/pages/settings/password/index',
      phone: '/pages/settings/phone/index',
      about: '/pages/settings/about/index',
      help: '/pages/help/index',
      feedback: '/pages/settings/feedback/index'
    };

    if (pageMap[page]) {
      wx.navigateTo({
        url: pageMap[page]
      });
    }
  },

  onCheckVersion: function() {
    wx.showModal({
      title: '检查更新',
      content: '当前已是最新版本',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#ff4d4f'
    });
  },

  onLogout: function() {
    const that = this;

    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#ff4d4f',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({ title: '退出中...' });

          authService.logout({
            success: function() {
              wx.hideLoading();

              wx.removeStorageSync('token');
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('userSettings');

              app.globalData.userInfo = null;
              app.globalData.token = null;

              wx.showToast({
                title: '已退出登录',
                icon: 'success'
              });

              setTimeout(function() {
                wx.reLaunch({
                  url: '/pages/user/index'
                });
              }, 1500);
            },
            fail: function(err) {
              wx.hideLoading();
              console.error('退出登录失败:', err);

              wx.removeStorageSync('token');
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('userSettings');

              app.globalData.userInfo = null;
              app.globalData.token = null;

              wx.reLaunch({
                url: '/pages/user/index'
              });
            }
          });
        }
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: '苏铁商城 - 设置',
      path: '/pages/settings/index'
    };
  }
});
