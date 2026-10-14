/**
 * 文件名: index.js
 * 版本号: 3.5.1
 * 更新日期: 2026-10-14
 * 描述: 用户中心页面逻辑控制层（FE-005：登录态下拉取真实 /user/info 资料与积分）
 */

const themeBehavior = require("../../behaviors/theme");
const authService = require("../../services/authService");

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
    loading: false,
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
    const token = wx.getStorageSync("token");

    if (userInfo && token) {
      this.setData({ userInfo, points, isLoggedIn: true });
      // FE-005：登录态下从 /user/info 拉取真实资料与积分，本地缓存作为兜底
      this.setData({ loading: true });
      const that = this;
      authService
        .getUserInfo()
        .then(function (remote) {
          const remotePoints =
            remote && typeof remote.points !== "undefined"
              ? remote.points
              : that.data.points;
          that.setData({
            userInfo: remote || userInfo,
            points: remotePoints,
            isLoggedIn: true,
            loading: false,
          });
        })
        .catch(function () {
          // 网络异常时保留本地缓存，不阻断页面
          that.setData({ loading: false });
        });
    } else {
      // 设置默认用户信息
      this.setData({
        userInfo: {
          nickName: "游客",
          avatarUrl: "/images/placeholder.svg",
        },
        isLoggedIn: false,
        loading: false,
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
      icon: "none",
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
          // FE-005：通过 authService 统一清理登录态（token / refreshToken / userInfo）
          authService.logout();
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
