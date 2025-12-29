/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 用户中心页面逻辑控制层
 */

const app = getApp();
const authService = require("../../services/authService");
const pointsService = require("../../services/pointsService");
const socialService = require("../../services/socialService");

Page({
  data: {
    userInfo: null,
    points: 0,
    followStats: {
      following: 0,
      followers: 0,
    },
    menuList: [
      {
        groupName: "我的内容",
        items: [
          {
            id: "favorites",
            name: "我的收藏",
            icon: "/images/favorite.png",
            url: "/pages/user/favorites",
          },
          {
            id: "following",
            name: "我的关注",
            icon: "/images/following.png",
            url: "/pages/user/following",
          },
          {
            id: "share",
            name: "我的分享",
            icon: "/images/share.png",
            url: "/pages/user/share",
          },
        ],
      },
      {
        groupName: "订单服务",
        items: [
          {
            id: "orders",
            name: "我的订单",
            icon: "/images/orders.png",
            url: "/pages/orders/list",
          },
          {
            id: "addresses",
            name: "收货地址",
            icon: "/images/address.png",
            url: "/pages/user/addresses",
          },
          {
            id: "coupons",
            name: "优惠券",
            icon: "/images/coupon.png",
            url: "/pages/user/coupons",
          },
        ],
      },
      {
        groupName: "账户设置",
        items: [
          {
            id: "profile",
            name: "个人资料",
            icon: "/images/profile.png",
            url: "/pages/user/profile",
          },
          {
            id: "security",
            name: "账户安全",
            icon: "/images/security.png",
            url: "/pages/user/security",
          },
          {
            id: "settings",
            name: "设置",
            icon: "/images/settings.png",
            url: "/pages/user/settings",
          },
        ],
      },
    ],
    isLoggedIn: false,
    isLoading: false,
  },

  onLoad: function (options) {
    this.checkLoginStatus();
  },

  onShow: function () {
    this.updateUserInfo();
  },

  checkLoginStatus: function () {
    const isLoggedIn = authService.isLoggedIn();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      this.loadUserData();
    } else {
      this.goToLogin();
    }
  },

  loadUserData: function () {
    this.updateUserInfo();
    this.loadFollowStats();
  },

  updateUserInfo: function () {
    const userInfo = wx.getStorageSync("userInfo");
    const points = wx.getStorageSync("points") || 0;

    if (userInfo) {
      this.setData({
        userInfo,
        points,
        isLoggedIn: true,
      });
    }
  },

  loadFollowStats: function () {
    const that = this;
    socialService
      .getUserFollowStats()
      .then(function (res) {
        if (res.success) {
          that.setData({
            followStats: res.data || { following: 0, followers: 0 },
          });
        }
      })
      .catch(function (err) {
        console.error("获取关注统计失败", err);
      });
  },

  goToLogin: function () {
    wx.navigateTo({
      url: "/pages/login/login?redirect=/pages/user/index",
    });
  },

  handleLogin: function () {
    this.goToLogin();
  },

  handleMenuTap: function (e) {
    const { id, url } = e.currentTarget.dataset;

    if (!url) return;

    if (!authService.isLoggedIn() && id !== "settings") {
      this.goToLogin();
      return;
    }

    wx.navigateTo({ url });
  },

  handleAvatarTap: function () {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }

    wx.navigateTo({
      url: "/pages/user/profile",
    });
  },

  handlePointsTap: function () {
    if (!authService.isLoggedIn()) {
      this.goToLogin();
      return;
    }

    wx.navigateTo({
      url: "/pages/points/points",
    });
  },

  handleFollowingTap: function () {
    if (!authService.isLoggedIn()) {
      this.goToLogin();
      return;
    }

    wx.navigateTo({
      url: "/pages/user/following",
    });
  },

  handleFollowersTap: function () {
    if (!authService.isLoggedIn()) {
      this.goToLogin();
      return;
    }

    wx.navigateTo({
      url: "/pages/user/followers",
    });
  },

  handleLogout: function () {
    const that = this;
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: function (res) {
        if (res.confirm) {
          authService
            .logout()
            .then(function () {
              that.setData({
                userInfo: null,
                points: 0,
                followStats: { following: 0, followers: 0 },
                isLoggedIn: false,
              });
              wx.showToast({
                title: "已退出登录",
                icon: "success",
              });
            })
            .catch(function (err) {
              console.error("退出登录失败", err);
            });
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
