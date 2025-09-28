// pages/user/login/login.js
Page({
  data: {
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    isLoading: false
  },

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

  onShow: function() {
    // 页面显示时的逻辑
  },

  // 获取用户信息并登录（使用getUserProfile方法，推荐使用）
  getUserProfile: function() {
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
          icon: 'none'
        });
      }
    });
  },

  // 传统的获取用户信息方法（兼容性处理）
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      // 用户同意授权
      this.userLogin(e.detail.userInfo);
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '需要授权才能使用完整功能',
        icon: 'none'
      });
    }
  },

  // 执行登录操作
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
          // 发送code到服务器换取openid和session_key
          app.request({
            url: '/sut-wxapp-api/login',
            method: 'POST',
            data: {
              code: loginRes.code,
              user_info: userInfo
            },
            success: function(res) {
              if (res.code === 0) {
                // 登录成功，保存token和用户信息
                app.globalData.token = res.data.token;
                app.globalData.userInfo = res.data;
                
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
                  icon: 'none'
                });
              }
            },
            fail: function(error) {
              console.error('登录失败:', error);
              wx.showToast({
                title: '网络错误，请重试',
                icon: 'none'
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
            icon: 'none'
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
          icon: 'none'
        });
        that.setData({
          isLoading: false
        });
      }
    });
  },

  // 处理用户取消授权的情况
  onAuthCancel: function() {
    wx.showToast({
      title: '需要授权才能使用完整功能',
      icon: 'none'
    });
  },

  // 联系客服
  contactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567' // 替换为实际的客服电话
    });
  },

  // 跳转协议页面
  navigateToAgreement: function(e) {
    const type = e.currentTarget.dataset.type;
    let url = '';
    
    switch (type) {
      case 'privacy':
        url = '/pages/agreement/privacy';
        break;
      case 'user':
        url = '/pages/agreement/user';
        break;
      default:
        url = '/pages/agreement/user';
    }
    
    wx.navigateTo({
      url: url
    });
  }
});