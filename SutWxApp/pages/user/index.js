/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 用户中心页面逻辑控制层
 */

const app = getApp();

Page({
  data: {
    userInfo: null,
    points: 0,
    // 关注/粉丝统计
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
    if (!this.data.isLoggedIn) {
      this.handleLogin();
    } else {
      wx.showToast({ title: "个人资料开发中", icon: "none" });
    }
  },

  // 登录入口
  handleLogin: function () {
    if (this.data.isLoggedIn) return;
    // 调用 app.login（若存在），否则 toast 提示
    if (typeof app.login === "function") {
      app.login();
    } else {
      wx.showToast({ title: "登录功能开发中", icon: "none" });
    }
  },

  // 积分入口（页面未注册）
  handlePointsTap: function () {
    wx.showToast({ title: "积分功能开发中", icon: "none" });
  },

  // 关注列表入口（页面未注册）
  handleFollowingTap: function () {
    wx.showToast({ title: "功能开发中", icon: "none" });
  },

  // 粉丝列表入口（页面未注册）
  handleFollowersTap: function () {
    wx.showToast({ title: "功能开发中", icon: "none" });
  },

  // 退出登录
  handleLogout: function () {
    const that = this;
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: function (res) {
        if (res.confirm) {
          // 清除本地登录信息
          wx.removeStorageSync("token");
          wx.removeStorageSync("userInfo");
          wx.removeStorageSync("points");
          // 重置页面数据
          that.setData({
            userInfo: {
              nickName: "游客",
              avatarUrl: "/images/placeholder.svg",
            },
            isLoggedIn: false,
            points: 0,
            followStats: { following: 0, followers: 0 },
          });
          wx.showToast({ title: "已退出登录", icon: "success" });
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
