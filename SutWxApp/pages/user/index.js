/**
 * 文件名: index.js
 * 版本号: 3.0.13
 * 更新日期: 2026-09-12
 * 描述: 用户中心页面逻辑控制层
 */

const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    userInfo: null,
    points: 0,
    followStats: { following: 0, followers: 0 },
    menuList: [
      {
        groupName: "我的订单",
        items: [
          {
            id: "orders",
            name: "我的订单",
            icon: "/images/placeholder.svg",
            url: "/pages/order/index",
          },
        ],
      },
      {
        groupName: "我的服务",
        items: [
          {
            id: "addresses",
            name: "收货地址",
            icon: "/images/placeholder.svg",
            url: "/pages/address/index",
          },
          {
            id: "help",
            name: "帮助中心",
            icon: "/images/placeholder.svg",
            url: "/pages/help/index",
          },
          {
            id: "settings",
            name: "设置",
            icon: "/images/placeholder.svg",
            url: "/pages/settings/index",
          },
        ],
      },
    ],
    isLoggedIn: false,
  },

  onLoad: function (options) {
    this.loadUserInfo();
  },

  onShow: function () {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = wx.getStorageSync("userInfo");
    const points = wx.getStorageSync("points") || 0;

    if (userInfo) {
      this.setData({
        userInfo,
        points,
        isLoggedIn: true,
      });
    } else {
      // 设置默认用户信息
      this.setData({
        userInfo: {
          nickName: "游客",
          avatarUrl: "/images/placeholder.svg"
        },
        isLoggedIn: false,
      });
    }
  },

  handleMenuTap: function (e) {
    const { url } = e.currentTarget.dataset;

    if (!url) return;

    wx.navigateTo({ url });
  },

  handleAvatarTap: function () {
    wx.showToast({
      title: "登录功能开发中",
      icon: "none"
    });
  },

  handleLogin: function () {
    this.handleAvatarTap();
  },

  handlePointsTap: function () {
    wx.showToast({ title: "积分功能开发中", icon: "none" });
  },

  handleFollowingTap: function () {
    wx.showToast({ title: "关注功能开发中", icon: "none" });
  },

  handleFollowersTap: function () {
    wx.showToast({ title: "粉丝功能开发中", icon: "none" });
  },

  handleLogout: function () {
    const that = this;
    wx.showModal({
      title: "提示",
      content: "确定退出登录？",
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync("token");
          wx.removeStorageSync("userInfo");
          that.setData({ userInfo: null, isLoggedIn: false, points: 0 });
        }
      },
    });
  },

  onShareAppMessage: function () {
    return {
      title: "苏铁 - 发现更多好物",
      path: "/pages/home/index",
    };
  },
});
