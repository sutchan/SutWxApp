/**
 * 文件名: index.js
 * 版本号: 2.1.0
 * 更新日期: 2026-06-09
 * 描述: 用户中心页面逻辑控制层
 */

const app = getApp();

Page({
  data: {
    userInfo: null,
    points: 0,
    followStats: {
      following: 0,
      followers: 0
    },
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
    const followStats = wx.getStorageSync("followStats") || { following: 0, followers: 0 };

    if (userInfo) {
      this.setData({
        userInfo,
        points,
        followStats,
        isLoggedIn: true,
      });
    } else {
      this.setData({
        userInfo: {
          nickName: "游客",
          avatarUrl: "/images/placeholder.svg"
        },
        points: 0,
        followStats: { following: 0, followers: 0 },
        isLoggedIn: false,
      });
    }
  },

  handleLogin: function () {
    wx.showToast({
      title: "登录功能开发中",
      icon: "none"
    });
  },

  handleLogout: function () {
    wx.removeStorageSync("userInfo");
    wx.removeStorageSync("points");
    wx.removeStorageSync("followStats");
    this.setData({
      userInfo: {
        nickName: "游客",
        avatarUrl: "/images/placeholder.svg"
      },
      points: 0,
      followStats: { following: 0, followers: 0 },
      isLoggedIn: false,
    });
    wx.showToast({
      title: "已退出登录",
      icon: "success"
    });
  },

  handlePointsTap: function () {
    wx.showToast({
      title: "积分功能开发中",
      icon: "none"
    });
  },

  handleFollowingTap: function () {
    wx.showToast({
      title: "关注功能开发中",
      icon: "none"
    });
  },

  handleFollowersTap: function () {
    wx.showToast({
      title: "粉丝功能开发中",
      icon: "none"
    });
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

  onShareAppMessage: function () {
    return {
      title: "苏铁 - 发现更多好物",
      path: "/pages/home/index",
    };
  },
});
