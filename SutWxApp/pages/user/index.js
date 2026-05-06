/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 用户中心页面逻辑控制层
 */

const app = getApp();

Page({
  data: {
    userInfo: null,
    points: 0,
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

  onShareAppMessage: function () {
    return {
      title: "苏铁 - 发现更多好物",
      path: "/pages/home/index",
    };
  },
});
