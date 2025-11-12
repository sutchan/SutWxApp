/**
 * 用户个人中心页面控制器
 */
Page({
  data: {
    userInfo: null, // 用户信息
    userStats: {}, // 用户统计数据
    signinStatus: false, // 签到状态
    signinDays: 0, // 连续签到天数
    isLoading: true, // 加载状态
    error: null, // 错误信息
    appVersion: getApp().globalData.appVersion, // 应用版本
    showStatsCard: true, // 是否显示统计卡片
    showHelpCenter: true, // 是否显示帮助中心
    showSkeleton: true // 是否显示骨架屏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 设置初始状态
    this.setData({
      isLoggedIn: getApp().isLoggedIn(),
      showSkeleton: true
    });
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 每次显示页面时加载用户信息
    this.loadUserInfo();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 下拉刷新时重置状态
    this.setData({
      showSkeleton: true,
      error: null
    });
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    const app = getApp();
    
    // 设置登录状态
    this.setData({
      isLoggedIn: app.isLoggedIn()
    });
    
    // 如果已登录
    if (app.isLoggedIn()) {
      // 异步加载用户信息、统计数据和签到状态
      this.getUserInfo();
      this.getUserStats();
      this.getSigninStatus();
    } else {
      // 未登录状态
      this.setData({
        isLoading: false,
        showSkeleton: false
      });
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    const app = getApp();
    
    wx.showLoading({ title: '加载中' });
    
    app.services.user.getUserProfile()
      .then(res => {
        wx.hideLoading();
        if (res.code === 200) {
          // 合并用户信息并更新状态
          const userInfo = { ...app.globalData.user, ...res.data };
          
          this.setData({
            userInfo: userInfo,
            error: null,
            showSkeleton: false
          });
          
          // 更新全局用户信息
          app.globalData.user = userInfo;
          wx.setStorageSync('user', userInfo);
        } else {
          this.setData({
            error: res.message || '获取用户信息失败',
            showSkeleton: false
          });
          wx.showToast({
            title: res.message || '获取用户信息失败',
            icon: 'none',
            duration: 2000
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('获取用户信息失败:', error);
        this.setData({
          error: '网络请求失败，请稍后重试',
          showSkeleton: false
        });
        wx.showToast({
          title: '网络请求失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      })
      .finally(() => {
        wx.stopPullDownRefresh();
        this.setData({ 
          isLoading: false,
          showSkeleton: false 
        });
      });
  },

  /**
   * 获取用户统计数据
   */
  getUserStats: function() {
    const app = getApp();
    
    app.services.user.getUserStats()
      .then(res => {
        if (res.code === 200) {
          this.setData({
            userStats: res.data,
            error: null
          });
        } else {
          console.error('获取用户统计数据失败', res);
        }
      })
      .catch(error => {
        console.error('获取用户统计数据失败', error);
      });
  },

  /**
   * 获取签到状态
   */
  getSigninStatus: function() {
    const app = getApp();
    
    app.services.user.getSignInStatus()
      .then(res => {
        if (res.code === 200) {
          this.setData({
            signinStatus: res.data.is_signed || false,
            signinDays: res.data.continuous_days || 0
          });
        } else {
          console.error('获取签到状态失败', res);
        }
      })
      .catch(error => {
        console.error('获取签到状态失败', error);
      });
  },
  
  /**
   * 头像点击事件处理
   */
  onAvatarTap: function() {
    const upload = require('../../utils/upload.js');
    
    // 显示选择菜单
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        if (!res.cancel) {
          const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
          
          // 选择并上传图片
          upload.chooseAndUploadImage({
            count: 1,
            sourceType: sourceType,
            sizeType: ['compressed'],
            uploadParams: {
              url: '/user/avatar', // 上传地址
              name: 'avatar',
              formData: {
                type: 'avatar'
              }
            },
            success: (uploadRes) => {
              // 上传成功后更新头像
              if (uploadRes.code === 200) {
                // 更新用户信息
                const app = getApp();
                const updatedUserInfo = {
                  ...this.data.userInfo,
                  avatar: uploadRes.data.url
                };
                
                this.setData({
                  userInfo: updatedUserInfo
                });
                
                // 更新全局用户信息
                app.globalData.userInfo = updatedUserInfo;
                wx.setStorageSync('userInfo', updatedUserInfo);
                
                wx.showToast({
                  title: '头像保存成功',
                  icon: 'success',
                  duration: 2000
                });
              } else {
                wx.showToast({
                  title: uploadRes.message || '头像上传失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            },
            fail: (error) => {
              console.error('头像上传失败', error);
              if (error.message !== '用户取消选择') {
                wx.showToast({
                  title: '头像上传失败，请稍后重试',
                  icon: 'none',
                  duration: 2000
                });
              }
            }
          });
        }
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
   * 执行签到
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
    
    // 显示加载状态
    wx.showLoading({
      title: '签到中',
      mask: true
    });
    
    app.services.user.signIn()
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 200) {
          // 更新签到状态
          this.setData({
            signinStatus: true,
            signinDays: res.data.continuous_days || 0
          });
          
          // 显示签到成功提示
          wx.showToast({
            title: '签到成功，获得' + res.data.points + '积分',
            icon: 'success',
            duration: 2000
          });
          
          // 刷新用户统计数据
          this.getUserStats();
        } else if (res.code === 400 && res.message.includes('已经签到')) {
          // 已经签到过的情况
          this.setData({
            signinStatus: true
          });
          
          wx.showToast({
            title: '今天已经签到过了',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 其他错误情况
          wx.showToast({
            title: res.message || '签到失败',
            icon: 'none',
            duration: 2000
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('签到失败:', error);
        
        wx.showToast({
          title: '网络请求失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 跳转到签到历史页面
   */
  navigateToSigninHistory: function() {
    wx.showToast({
      title: '签到历史功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到地址列表页面
   */
  navigateToAddressList: function() {
    wx.showToast({
      title: '地址管理功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到收藏列表页面
   */
  navigateToFavoriteList: function() {
    wx.showToast({
      title: '收藏功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到订单列表页面
   */
  navigateToOrderList: function() {
    wx.showToast({
      title: '订单功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到积分中心页面
   */
  navigateToPointsCenter: function() {
    wx.showToast({
      title: '积分中心功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到设置页面
   */
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/user/settings/settings'
    });
  },

  /**
   * 跳转到意见反馈页面
   */
  navigateToFeedback: function() {
    wx.showToast({
      title: '意见反馈功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 退出登录
   */
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          
          app.request({
            url: '/user/logout',
            method: 'POST',
            success: (res) => {
              // 清除用户数据和token
              app.clearUserData();
              
              // 跳转到登录页面
              wx.reLaunch({
                url: '/pages/user/login/login'
              });
            },
            fail: (error) => {
              console.error('退出登录失败:', error);
              
              // 即使请求失败也清除本地数据
              app.clearUserData();
              
              wx.reLaunch({
                url: '/pages/user/login/login'
              });
            }
          });
        }
      }
    });
  },

  /**
   * 手动刷新用户信息
   */
  refreshUserInfo: function() {
    wx.showLoading({
      title: '刷新中',
    });
    
    this.setData({
      isLoading: true,
      error: null
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
  },
  
  /**
   * 错误重试
   */
  onRetry: function() {
    this.setData({
      isLoading: true,
      error: null,
      showSkeleton: true
    });
    this.loadUserInfo();
  },
  
  /**
   * 跳转到帮助中心
   */
  navigateToHelpCenter: function() {
    wx.showToast({
      title: '帮助中心功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
});