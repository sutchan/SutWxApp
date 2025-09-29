// pages/user/profile/profile.js
/**
 * 个人中心页面 - 展示用户信息和提供用户相关功能
 */
Page({
  data: {
    userInfo: null, // 用户信息
    userStats: {}, // 用户统计数据
    signinStatus: false, // 签到状态
    signinDays: 0, // 连续签到天数
    isLoading: true, // 页面加载状态
    appVersion: '1.0.0' // 应用版本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 页面加载时获取用户信息
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时刷新用户信息
    this.loadUserInfo();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 下拉刷新时重新加载用户信息
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    const app = getApp();
    
    // 检查用户是否登录
    if (app.isLoggedIn()) {
      // 已登录，获取用户信息和统计数据
      this.getUserInfo();
      this.getUserStats();
      this.getSigninStatus();
    } else {
      // 未登录，停止下拉刷新
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 获取用户详细信息
   */
  getUserInfo: function() {
    const app = getApp();
    
    app.request({
      url: '/user/profile',
      loadingText: '加载中',
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
        } else {
          wx.showToast({
            title: res.message || '获取用户信息失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 获取用户统计数据
   */
  getUserStats: function() {
    const app = getApp();
    
    app.request({
      url: '/user/stats',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            userStats: res.data
          });
        } else {
          console.error('获取用户统计数据失败:', res);
        }
      },
      fail: (error) => {
        console.error('获取用户统计数据网络失败:', error);
      }
    });
  },

  /**
   * 获取用户签到状态
   */
  getSigninStatus: function() {
    const app = getApp();
    
    app.request({
      url: '/user/signin/status',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            signinStatus: res.data.is_signed,
            signinDays: res.data.continuous_days
          });
        } else {
          console.error('获取签到状态失败:', res);
        }
      },
      fail: (error) => {
        console.error('获取签到状态网络失败:', error);
      }
    });
  },

  /**
   * 跳转到登录页面
   */
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login',
      fail: function() {
        wx.showToast({
          title: '跳转登录页面失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 执行签到操作
   */
  doSignin: function() {
    if (this.data.signinStatus) {
      wx.showToast({
        title: '今天已经签到过了',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const app = getApp();
    
    app.request({
      url: '/user/signin',
      method: 'POST',
      loadingText: '签到中',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            signinStatus: true,
            signinDays: res.data.continuous_days
          });
          
          wx.showToast({
            title: '签到成功，获得' + res.data.points + '积分',
            icon: 'success',
            duration: 2000
          });
          
          // 刷新用户统计数据
          this.getUserStats();
        } else {
          wx.showToast({
            title: res.message || '签到失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('签到失败:', error);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 跳转到签到历史页面
   */
  navigateToSigninHistory: function() {
    wx.showToast({
      title: '签到历史功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到地址管理页面
   */
  navigateToAddressList: function() {
    wx.showToast({
      title: '地址管理功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到收藏列表页面
   */
  navigateToFavoriteList: function() {
    wx.showToast({
      title: '收藏列表功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到订单列表页面
   */
  navigateToOrderList: function() {
    wx.showToast({
      title: '订单列表功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到积分中心页面
   */
  navigateToPointsCenter: function() {
    wx.showToast({
      title: '积分中心功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到设置页面
   */
  navigateToSettings: function() {
    wx.showToast({
      title: '设置页面功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到意见反馈页面
   */
  navigateToFeedback: function() {
    wx.showToast({
      title: '意见反馈功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 退出登录
   */
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

  /**
   * 刷新用户信息（强制重新加载所有用户相关数据）
   */
  refreshUserInfo: function() {
    wx.showLoading({
      title: '刷新中',
    });
    
    this.getUserInfo();
    this.getUserStats();
    this.getSigninStatus();
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }, 800);
  }
});