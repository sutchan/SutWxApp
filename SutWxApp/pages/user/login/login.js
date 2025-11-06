// pages/user/login/login.js
/**
 * 登录页面 - 处理用户授权和登录逻辑
 */
import { showToast } from '../../../utils/global';

Page({
  data: {
    canIUseGetUserProfile: false, // 是否支持getUserProfile方法
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 是否支持开放数据
    isLoading: false, // 加载状态
    showSkeleton: true, // 骨架屏显示状态
    privacyPolicyAccepted: false, // 隐私政策同意状态
    errorMessage: '', // 错误提示信息
    appVersion: '', // 应用版本号
    showFeatures: true // 是否显示功能说明
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 初始化骨架屏
    this.setData({
      showSkeleton: true
    });

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
      return;
    }
    
    // 获取应用版本号
    try {
      const { version } = wx.getAccountInfoSync();
      this.setData({
        appVersion: version
      });
    } catch (e) {
      console.error('获取版本号失败:', e);
    } finally {
      // 页面初始化完成后隐藏骨架屏
      setTimeout(() => {
        this.setData({
          showSkeleton: false
        });
      }, 800);
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
        this.setData({
          isLoading: false,
          errorMessage: '获取用户信息失败'
        });
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
  userLogin: async function(userInfo) {
    const that = this;
    const app = getApp();
    
    // 显示加载状态
    that.setData({
      isLoading: true,
      errorMessage: ''
    });
    
    try {
      // 使用auth-service进行登录
      const result = await app.services.auth.login(userInfo);
      
      if (result.success) {
        // 提示登录成功
        showToast('登录成功', 'success');
        
        // 跳转到个人中心页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/user/profile/profile'
          });
        }, 1500);
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      const errorMsg = error.message || '登录失败，请稍后重试';
      this.setData({
        errorMessage: errorMsg
      });
      showToast(errorMsg, 'none', 2000);
      // 5秒后清除错误消息
      setTimeout(() => {
        this.setData({
          errorMessage: ''
        });
      }, 5000);
    } finally {
      that.setData({
        isLoading: false
      });
    }
  },

  /**
   * 处理用户取消授权的情况
   */
  onAuthCancel: function() {
    showToast('需要授权才能使用完整功能', 'none', 2000);
  },

  /**
   * 联系客服
   */
  contactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567', // 替换为实际的客服电话
      fail: function() {
        showToast('拨打失败，请稍后再试', 'none');
      }
    });
  },

  /**
   * 重试登录
   */
  onRetry: function() {
    this.setData({
      errorMessage: '',
      showSkeleton: true
    });
    
    // 模拟重新加载页面
    setTimeout(() => {
      this.setData({
        showSkeleton: false
      });
    }, 500);
  },

  /**
   * 跳转协议页面
   */
  navigateToAgreement: function(e) {
    const type = e.currentTarget.dataset.type;
    
    // 跳转到已经创建的协议页面
    wx.navigateTo({
      url: `/pages/user/agreement/agreement?type=${type}`,
      fail: function() {
        wx.showToast({
          title: '跳转失败，请稍后再试',
          icon: 'none'
        });
      }
    });
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