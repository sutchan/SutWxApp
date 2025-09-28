// pages/user/profile/profile.js
Page({
  data: {
    userInfo: {},
    isLoggedIn: false,
    signinStatus: false,
    signinDays: 0,
    userStats: {
      favorites: 0,
      orders: 0,
      points: 0,
      signins: 0
    },
    loading: false
  },

  onLoad: function() {
    // 页面加载时初始化数据
    this.checkLoginStatus();
  },

  onShow: function() {
    // 每次页面显示时都检查登录状态和刷新数据
    this.checkLoginStatus();
  },

  onPullDownRefresh: function() {
    // 下拉刷新时重新加载数据
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const app = getApp();
    const isLoggedIn = app.isLoggedIn();
    
    this.setData({
      isLoggedIn: isLoggedIn
    });
    
    if (isLoggedIn) {
      // 已登录，获取用户信息和统计数据
      this.getUserInfo();
      this.getUserStats();
      this.getSigninStatus();
    }
  },

  // 获取用户信息
  getUserInfo: function() {
    const app = getApp();
    
    app.request({
      url: '/sut-wxapp-api/user/profile',
      success: (res) => {
        if (res.code === 0) {
          // 合并全局用户信息和API返回的用户信息
          const userInfo = { ...app.globalData.userInfo, ...res.data };
          
          this.setData({
            userInfo: userInfo
          });
          
          // 更新全局用户信息
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
        }
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  },

  // 获取用户统计数据
  getUserStats: function() {
    const app = getApp();
    
    app.request({
      url: '/sut-wxapp-api/user/stats',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            userStats: res.data
          });
        }
      }
    });
  },

  // 获取签到状态
  getSigninStatus: function() {
    const app = getApp();
    
    app.request({
      url: '/sut-wxapp-api/user/signin/status',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            signinStatus: res.data.is_signed,
            signinDays: res.data.continuous_days
          });
        }
      }
    });
  },

  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  // 执行签到
  doSignin: function() {
    if (this.data.signinStatus) {
      wx.showToast({
        title: '今天已经签到过了',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    this.setData({ loading: true });
    
    app.request({
      url: '/sut-wxapp-api/user/signin',
      method: 'POST',
      success: (res) => {
        if (res.code === 0) {
          wx.showToast({
            title: '签到成功',
            icon: 'success'
          });
          
          // 更新签到状态和积分
          this.setData({
            signinStatus: true,
            signinDays: res.data.continuous_days,
            'userStats.points': this.data.userStats.points + res.data.points_reward
          });
        } else {
          wx.showToast({
            title: res.message || '签到失败',
            icon: 'none'
          });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 跳转到签到历史页面
  navigateToSigninHistory: function() {
    wx.navigateTo({
      url: '/pages/user/signin/signin'
    });
  },

  // 跳转到地址管理页面
  navigateToAddressList: function() {
    wx.navigateTo({
      url: '/pages/user/address/list/list'
    });
  },

  // 跳转到收藏列表页面
  navigateToFavoriteList: function() {
    wx.navigateTo({
      url: '/pages/user/favorite/list/list'
    });
  },

  // 跳转到订单列表页面
  navigateToOrderList: function() {
    wx.navigateTo({
      url: '/pages/order/list/list'
    });
  },

  // 跳转到积分中心页面
  navigateToPointsCenter: function() {
    wx.navigateTo({
      url: '/pages/points/center/center'
    });
  },

  // 跳转到设置页面
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 跳转到意见反馈页面
  navigateToFeedback: function() {
    wx.navigateTo({
      url: '/pages/settings/feedback/feedback'
    });
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();
        }
      }
    });
  },

  // 刷新用户信息
  refreshUserInfo: function() {
    this.getUserInfo();
    this.getUserStats();
    this.getSigninStatus();
  }
});