// 微信小程序入口文件
// 导入服务模块
import api from './utils/api';
import authService from './utils/auth-service';
import articleService from './utils/article-service';
import categoryService from './utils/category-service';
import searchService from './utils/search-service';
import commentService from './utils/comment-service';
import notificationService from './utils/notification-service';
import notificationMockService from './utils/notification-mock';
import analyticsService from './utils/analytics-service';
import followingService from './utils/following-service';
import userService from './utils/user-service';
import productService from './utils/product-service';
import cartService from './utils/cart-service';
import orderService from './utils/order-service';
import addressService from './utils/address-service';
import paymentService from './utils/payment-service';
import pointsService from './utils/points-service';
import { setStorage, getStorage } from './utils/global';

App({
  // 全局服务实例
  services: {
    api,
    auth: authService,
    article: articleService,
    category: categoryService,
    search: searchService,
    comment: commentService,
    notification: notificationService,
    notificationMock: notificationMockService,
    analytics: analyticsService,
    following: followingService,
    user: userService,
    product: productService,
    cart: cartService,
    order: orderService,
    address: addressService,
    payment: paymentService,
    points: pointsService
  },
  
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: '',
    appName: 'SUT微信小程序',
    appVersion: '1.0.9',
    isLoading: false,
    networkStatus: 'unknown'
  },

  onLaunch: function() {
    // 从本地存储获取配置和用户信息
    try {
      const token = getStorage('token');
      const apiBaseUrl = getStorage('apiBaseUrl');
      const userInfo = getStorage('userInfo');
      
      if (token) {
        this.globalData.token = token;
        // 设置API模块的token
        api.setToken(token);
      }
      
      if (apiBaseUrl) {
        this.globalData.apiBaseUrl = apiBaseUrl;
      } else {
        // 默认API地址
        this.globalData.apiBaseUrl = 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1';
      }
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
      
      // 设置API基础URL
      api.setBaseUrl(this.globalData.apiBaseUrl);
    } catch (e) {
      console.error('读取本地存储失败:', e);
    }

    // 检查网络状态
    this.checkNetworkStatus();
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkStatus = res.isConnected ? res.networkType : 'none';
      console.log('网络状态变化:', this.globalData.networkStatus);
    });

    // 检查小程序更新
    this.checkUpdate();
    
    // 记录小程序启动事件
    analyticsService.trackEvent('app_launch', {
      version: this.globalData.appVersion,
      timestamp: Date.now()
    });

    // 初始化云开发环境（如果需要）
    // wx.cloud.init({
    //   env: 'your-env-id',
    //   traceUser: true
    // });
  },

  onShow: function() {
    // 小程序启动或从后台进入前台时触发
    console.log('小程序启动或从后台进入前台');
    // 记录页面显示事件
    analyticsService.trackEvent('app_show');
  },

  onHide: function() {
    // 小程序从前台进入后台时触发
    console.log('小程序从前台进入后台');
    // 记录页面隐藏事件
    analyticsService.trackEvent('app_hide');
  },

  onError: function(error) {
    // 小程序发生脚本错误或API调用失败时触发
    console.error('小程序错误:', error);
    // 记录错误信息
    analyticsService.trackError('小程序错误', {
      stack: error.stack || '',
      message: error.message || error
    });
  },
  
  /**
   * 检查网络状态
   */
  checkNetworkStatus: function() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkStatus = res.networkType;
      },
      fail: () => {
        this.globalData.networkStatus = 'unknown';
      }
    });
  },

  /**
   * 全局请求方法
   * 使用新的api模块处理所有网络请求
   */
  request: async function(options) {
    const { url, method = 'GET', data = {}, header = {}, success, fail, complete, hideLoading, loadingText, errorMsg } = options;
    
    // 显示加载中
    if (!hideLoading) {
      this.globalData.isLoading = true;
      wx.showLoading({
        title: loadingText || '加载中',
        mask: true
      });
    }

    try {
      // 调用api模块的请求方法
      const response = await api.request({
        url,
        method,
        data,
        header
      });
      
      // 调用成功回调
      if (typeof success === 'function') {
        success(response);
      }
      
      return response;
    } catch (error) {
      // 增强错误处理
      const msg = errorMsg || error.message || '网络请求失败，请检查网络连接';
      
      // 处理登录失效的情况
      if (error.code === 401 || error.code === 101 || error.code === 102) {
        this.logout();
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        });
      }
      
      // 调用失败回调
      if (typeof fail === 'function') {
        fail(error);
      }
      
      throw error;
    } finally {
      // 隐藏加载提示
      if (!hideLoading) {
        this.globalData.isLoading = false;
        wx.hideLoading();
      }
      
      // 调用完成回调
      if (typeof complete === 'function') {
        complete();
      }
    }
  },

  // checkUpdate方法定义移至下方，避免重复定义

  /**
   * 微信登录方法
   * @param {Object} userInfo - 用户信息对象
   * @returns {Promise} - 返回Promise对象
   */
  login: async function(userInfo = null) {
    try {
      // 调用登录API
      const loginResult = await this.services.auth.login(userInfo);
      
      if (loginResult && loginResult.token) {
        // 保存token到全局和本地存储
        this.globalData.token = loginResult.token;
        setStorage('token', loginResult.token);
        
        // 设置API模块的token
        this.services.api.setToken(loginResult.token);
        
        // 如果有用户信息，保存到全局和本地存储
        if (loginResult.userInfo) {
          this.globalData.userInfo = loginResult.userInfo;
          setStorage('userInfo', loginResult.userInfo);
          // 使用userService缓存用户信息
          this.services.user.cacheUserInfo(loginResult.userInfo);
        }
        
        // 记录登录成功事件
        this.services.analytics.trackEvent('user_login', {
          success: true,
          timestamp: Date.now()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      
      // 记录登录失败事件
      this.services.analytics.trackEvent('user_login', {
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
      
      return false;
    }
  },
  
  /**
   * 检查用户是否已登录
   */
  isLoggedIn: function() {
    // 使用userService中的isLoggedIn方法
    return this.services.user.isLoggedIn();
  },
  
  /**
   * 清除用户数据
   */
  clearUserData: function() {
    try {
      // 使用userService中的clearLoginStatus方法
      this.services.user.clearLoginStatus();
      
      // 清除全局数据
      this.globalData.userInfo = null;
      this.globalData.token = '';
      
      console.log('用户数据已清除');
    } catch (error) {
      console.error('清除用户数据失败:', error);
    }
  },
  
  /**
   * 检查应用更新
   */
  checkUpdate: function() {
    // 检查是否支持更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      // 检查更新
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          wx.showModal({
            title: '新版本可用',
            content: '发现新版本，是否更新？',
            success: function(resModal) {
              if (resModal.confirm) {
                // 用户同意更新后，当新版本下载完成时进行提示
                updateManager.onUpdateReady(function() {
                  wx.showModal({
                    title: '更新提示',
                    content: '新版本已下载完成，是否重启应用？',
                    success: function(resConfirm) {
                      if (resConfirm.confirm) {
                        // 强制重启并应用新版本
                        updateManager.applyUpdate();
                      }
                    }
                  });
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '已是最新版本',
            icon: 'success',
            duration: 2000
          });
        }
      });
      
      // 新版本下载失败
      updateManager.onUpdateFailed(function() {
        wx.showToast({
          title: '更新失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      });
    } else {
      wx.showToast({
        title: '当前微信版本不支持更新',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  /**
   * 从本地存储恢复用户数据
   */
  restoreUserData: function() {
    try {
      const userInfo = getStorage('userInfo');
      const token = getStorage('token');
      
      if (userInfo && token) {
        this.globalData.userInfo = userInfo;
        this.globalData.token = token;
        // 设置API模块的token
        api.setToken(token);
        return true;
      }
    } catch (e) {
      console.error('恢复用户数据失败:', e);
    }
    return false;
  },

  /**
   * 登出方法
   */
  logout: async function() {
    try {
      // 调用登出API
      await this.services.auth.logout();
      
      // 清除用户数据
      this.clearUserData();
      
      // 记录登出事件
      this.services.analytics.trackEvent('user_logout', {
        timestamp: Date.now()
      });
      
      // 跳转到登录页面
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      
      return true;
    } catch (error) {
      console.error('登出失败:', error);
      
      // 即使API调用失败，也清除本地数据
      this.clearUserData();
      
      // 跳转到登录页面
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      
      return false;
    }
  },

  /**
   * 获取设备信息
   * @returns {Object} 设备信息对象
   */
  getDeviceInfo: function() {
    try {
      return wx.getSystemInfoSync() || {};
    } catch (e) {
      console.error('获取设备信息失败:', e);
      return {};
    }
  }
});