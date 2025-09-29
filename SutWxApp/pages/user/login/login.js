// pages/user/login/login.js
/**
 * 登录页面 - 处理用户授权和登录逻辑
 */
Page({
  data: {
    canIUseGetUserProfile: false, // 是否支持getUserProfile方法
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 是否支持开放数据
    isLoading: false, // 加载状态
    privacyPolicyAccepted: false // 隐私政策同意状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 检查是否支持getUserProfile方法（微信小程序基础库2.10.4及以上版本支持）
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }

    // 检查是否已经登录
    const app = getApp();
    if (app.isLoggedIn()) {
      wx.switchTab({
        url: '/pages/user/profile/profile'
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时的逻辑
  },

  /**
   * 获取用户信息并登录（使用getUserProfile方法，推荐使用）
   */
  getUserProfile: function() {
    // 检查是否同意隐私政策
    if (!this.data.privacyPolicyAccepted) {
      wx.showToast({
        title: '请先阅读并同意隐私政策和用户协议',
        icon: 'none'
      });
      return;
    }

    const that = this;
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        // 获取用户信息成功，调用登录方法
        that.userLogin(res.userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 传统的获取用户信息方法（兼容性处理）
   */
  bindGetUserInfo: function(e) {
    // 检查是否同意隐私政策
    if (!this.data.privacyPolicyAccepted) {
      wx.showToast({
        title: '请先阅读并同意隐私政策和用户协议',
        icon: 'none'
      });
      return;
    }

    if (e.detail.userInfo) {
      // 用户同意授权
      this.userLogin(e.detail.userInfo);
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '需要授权才能使用完整功能',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 执行登录操作
   * @param {Object} userInfo - 用户信息对象
   */
  userLogin: function(userInfo) {
    const that = this;
    const app = getApp();
    
    // 显示加载状态
    that.setData({
      isLoading: true
    });
    
    // 调用微信登录接口
    wx.login({
      success: function(loginRes) {
        if (loginRes.code) {
          // 发送code到服务器换取openid和session_key - API路径已修复
          app.request({
            url: '/login',
            method: 'POST',
            data: {
              code: loginRes.code,
              user_info: userInfo
            },
            loadingText: '登录中',
            success: function(res) {
              if (res.code === 0) {
                // 登录成功，保存token和用户信息
                app.globalData.token = res.data.token;
                app.globalData.userInfo = res.data;
                // 移除错误的属性设置
                // app.globalData.isLoggedIn = true;
                
                // 存入本地存储
                wx.setStorageSync('token', res.data.token);
                wx.setStorageSync('userInfo', res.data);
                
                // 提示登录成功
                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
                
                // 跳转到个人中心页面
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/user/profile/profile'
                  });
                }, 1500);
              } else {
                wx.showToast({
                  title: res.message || '登录失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            },
            fail: function(error) {
              console.error('登录失败:', error);
              wx.showToast({
                title: '网络错误，请重试',
                icon: 'none',
                duration: 2000
              });
            },
            complete: function() {
              that.setData({
                isLoading: false
              });
            }
          });
        } else {
          console.error('登录失败：', loginRes.errMsg);
          wx.showToast({
            title: '登录失败',
            icon: 'none',
            duration: 2000
          });
          that.setData({
            isLoading: false
          });
        }
      },
      fail: function(error) {
        console.error('wx.login失败:', error);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
        that.setData({
          isLoading: false
        });
      }
    });
  },

  /**
   * 处理用户取消授权的情况
   */
  onAuthCancel: function() {
    wx.showToast({
      title: '需要授权才能使用完整功能',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 联系客服
   */
  contactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567', // 替换为实际的客服电话
      fail: function() {
        wx.showToast({
          title: '拨打失败，请稍后再试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转协议页面
   */
  navigateToAgreement: function(e) {
    const type = e.currentTarget.dataset.type;
    let url = '';
    
    switch(type) {
      case 'privacy':
        // 隐私协议页面不存在，显示提示
        wx.showToast({
          title: '隐私协议页面尚未实现',
          icon: 'none',
          duration: 2000
        });
        break;
      case 'user':
        // 用户协议页面不存在，显示提示
        wx.showToast({
          title: '用户协议页面尚未实现',
          icon: 'none',
          duration: 2000
        });
        break;
      default:
        // 默认协议页面不存在，显示提示
        wx.showToast({
          title: '协议页面尚未实现',
          icon: 'none',
          duration: 2000
        });
    }
    // 移除导航代码，防止跳转到不存在的页面
    return;

    // 以下代码已被注释，因为协议页面不存在
    /*
    wx.navigateTo({
      url: url,
      fail: function() {
        wx.showToast({
          title: '跳转失败，请稍后再试',
          icon: 'none'
        });
      }
    });
    */
  },

  /**
   * 切换隐私政策同意状态
   */
  togglePrivacyPolicy: function() {
    this.setData({
      privacyPolicyAccepted: !this.data.privacyPolicyAccepted
    });
  }
});