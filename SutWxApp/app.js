// 应用程序入口文件
// 初始化应用配置和服务
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
import configService from './utils/config-service';
import { setStorage, getStorage } from './utils/global';

App({
  // 全局服务配置，初始化后在整个应用中可用
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
    points: pointsService,
    config: configService
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
    // 初始化应用配置，从本地存储获取token和用户信息    try {
      const token = getStorage('token');
      const apiBaseUrl = getStorage('apiBaseUrl');
      const userInfo = getStorage('userInfo');
      
      if (token) {
        this.globalData.token = token;
        // 设置API服务的token
        api.setToken(token);
      }
      
      if (apiBaseUrl) {
        this.globalData.apiBaseUrl = apiBaseUrl;
      } else {
        // 设置默认API基础路径        this.globalData.apiBaseUrl = 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1';
      }
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
      
      // 设置API服务的基础路径
      api.setBaseUrl(this.globalData.apiBaseUrl);
    } catch (e) {
      console.error('初始化配置失败:', e);
    }

    // 检查网络状态    this.checkNetworkStatus();
    
    // 监听网络状态变化    wx.onNetworkStatusChange((res) => {
      this.globalData.networkStatus = res.isConnected ? res.networkType : 'none';
      console.log('网络状态改变:', this.globalData.networkStatus);
    });

    // 检查应用更新    this.checkUpdate();
    
    // 记录应用启动事件    analyticsService.trackEvent('app_launch', {
      version: this.globalData.appVersion,
      timestamp: Date.now()
    });
    
    // 初始化系统配置    this.initSystemConfig();

    // 云开发环境初始化（可选）
    // wx.cloud.init({
    //   env: 'your-env-id',
    //   traceUser: true
    // });
  },

  onShow: function() {
    // 应用显示时执行    console.log('应用显示');
    // 记录应用显示事件    analyticsService.trackEvent('app_show');
  },

  onHide: function() {
    // 应用隐藏时执行    console.log('应用隐藏');
    // 记录应用隐藏事件    analyticsService.trackEvent('app_hide');
  },

  onError: function(error) {
    // 应用错误处理    console.error('应用错误:', error);
    // 记录错误事件    analyticsService.trackError('应用错误', {
      stack: error.stack || '',
      message: error.message || error
    });
  },
  
  /**
   * 检查网络状态   */
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
   * 全局请求封装
   * 统一处理请求配置、错误处理和加载状态   */
  /**
   * 发送网络请求
   * @param {Object} options - 请求配置参数
   * @returns {Promise<any>} 请求响应数据   */
  request: async function(options) {
    try {
      // 检查网络状态      if (this.globalData.networkStatus === 'none') {
        throw new Error('网络连接失败');
      }
      
      // 获取API服务实例      const apiService = this.getService('api');
      if (!apiService) {
        throw new Error('API服务初始化失败');
      }
      
      // 合并默认请求配置      const defaultOptions = {
        method: 'GET',
        data: {},
        header: {
          'content-type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
        }
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      // 显示加载提示      if (mergedOptions.showLoading !== false) {
        wx.showLoading({
          title: mergedOptions.loadingText || '加载中',
        });
      }
      
      // 发送API请求
      const result = await apiService.request(mergedOptions);
      
      // 处理请求响应      if (result && result.code === 200) {
        return result.data;
      } else if (result && result.code === 401) {
        // 未授权错误处理，清除用户数据并重定向到登录页        this.clearUserData();
        throw new Error('登录状态过期，请重新登录');
      } else {
        throw new Error(result?.message || '请求失败');
      }
    } catch (e) {
      console.error('请求失败:', e);
      
      // 显示错误提示      if (options?.showError !== false) {
        wx.showToast({
          title: e.message || '请求失败',
          icon: 'none'
        });
      }
      
      throw e;
    } finally {
      // 隐藏加载提示      if (options?.showLoading !== false) {
        wx.hideLoading();
      }
    }
  },

  // checkUpdate方法在后面已定义，这里不再重复
  /**
   * 用户登录方法
   * @param {Object} userInfo - 用户信息对象
   * @returns {Promise} - 登录结果Promise对象   */
  login: async function(userInfo = null) {
    try {
      this.globalData.isLoading = true;
      
      // 获取认证服务实例      const authService = this.getService('auth');
      if (!authService) {
        throw new Error('认证服务初始化失败');
      }
      
      // 执行登录操作      const result = await authService.login(userInfo);
      
      if (result && result.success) {
        // 保存用户信息和token
        this.globalData.userInfo = result.userInfo || userInfo;
        this.globalData.token = result.token;
        
        // 设置API服务的token
        const apiService = this.getService('api');
        if (apiService && apiService.setToken) {
          apiService.setToken(result.token);
        }
        
        // 存储到本地缓存        setStorage('token', result.token);
        setStorage('userInfo', result.userInfo || userInfo);
        
        // 记录登录成功事件        const analyticsService = this.getService('analytics');
        if (analyticsService) {
          analyticsService.trackEvent('login_success', {
            userId: result.userInfo?.id || 'unknown',
            timestamp: Date.now()
          });
        }
        
        return result;
      } else {
        // 记录登录失败事件        const analyticsService = this.getService('analytics');
        if (analyticsService) {
          analyticsService.trackEvent('login_failure', {
            error: result?.message || 'Unknown error',
            timestamp: Date.now()
          });
        }
        
        throw new Error(result?.message || '登录失败');
      }
    } catch (e) {
      console.error('登录失败:', e);
      throw e;
    } finally {
      this.globalData.isLoading = false;
    }
  },
  
  /**
   * 检查用户是否已登录
   */
  isLoggedIn: function() {
    // 委托给userService检查登录状态    return this.services.user.isLoggedIn();
  },
  
  /**
   * 初始化系统配置   */
  async initSystemConfig() {
    try {
      // 获取配置服务实例      const configService = this.getService('config');
      if (configService && configService.load) {
        // 加载基础配置        const config = await configService.load('base');
        console.log('基础配置加载完成:', config);
        
        // 更新API基础路径        if (config && config.apiBaseUrl) {
          this.globalData.apiBaseUrl = config.apiBaseUrl;
          // 设置API服务的基础路径
          const apiService = this.getService('api');
          if (apiService && apiService.setBaseUrl) {
            apiService.setBaseUrl(config.apiBaseUrl);
          }
        }
      }
    } catch (e) {
      console.error('初始化系统配置失败:', e);
    }
  },
  
  /**
   * 清除用户数据   */
  clearUserData: function() {
    try {
      // 委托给userService清除登录状态      this.services.user.clearLoginStatus();
      
      // 清除全局数据      this.globalData.userInfo = null;
      this.globalData.token = '';
      
      console.log('用户数据已清除');
    } catch (error) {
      console.error('清除用户数据失败:', error);
    }
  },
  
  /**
   * 检查应用更新   */
  checkUpdate: function() {
    // 检查是否支持更新管理器    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      // 检查是否有新版本      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          wx.showModal({
            title: '发现新版本',
            content: '有新版本可用，是否更新？',
            success: function(resModal) {
              if (resModal.confirm) {
                // 监听更新就绪事件                updateManager.onUpdateReady(function() {
                  wx.showModal({
                    title: '更新已准备',
                    content: '新版本已下载完成，是否立即应用？',
                    success: function(resConfirm) {
                      if (resConfirm.confirm) {
                        // 应用更新                        updateManager.applyUpdate();
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
      
      // 监听更新失败事件      updateManager.onUpdateFailed(function() {
        wx.showToast({
          title: '更新失败，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      });
    } else {
      wx.showToast({
        title: '当前微信版本不支持更新功能',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  /**
   * 恢复用户数据   */
  restoreUserData: function() {
    try {
      const token = getStorage('token');
      const userInfo = getStorage('userInfo');
      
      if (token) {
        this.globalData.token = token;
        const apiService = this.getService('api');
        if (apiService && apiService.setToken) {
          apiService.setToken(token);
        }
      }
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        const authService = this.getService('auth');
        if (authService && authService.setUserInfo) {
          authService.setUserInfo(userInfo);
        }
      }
      
      console.log('用户数据恢复成功');
      return true;
    } catch (e) {
      console.error('恢复用户数据失败:', e);
      return false;
    }
  },

  /**
   * 用户登出方法   */
  logout: async function() {
    try {
      // 获取认证服务实例      const authService = this.getService('auth');
      if (authService && authService.logout) {
        // 调用登出接口        await authService.logout();
      }
      
      // 清除用户数据      this.clearUserData();
      
      // 记录登出事件      const analyticsService = this.getService('analytics');
      if (analyticsService) {
        analyticsService.trackEvent('logout', {
          timestamp: Date.now()
        });
      }
      
      // 跳转到登录页      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      
      console.log('登出成功');
      return true;
    } catch (e) {
      console.error('登出失败:', e);
      // 即使失败也清除本地数据      this.clearUserData();
      
      // 跳转到登录页      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      
      return false;
    }
  },

  /**
   * 获取服务实例
   * @param {string} serviceName - 服务名称
   * @returns {Object|null} 服务实例或null
   */
  getService: function(serviceName) {
    try {
      return this.services[serviceName] || null;
    } catch (e) {
      console.error('获取服务失败:', e);
      return null;
    }
  },
  
  /**
   * 获取设备信息
   * @returns {Object} 设备信息对象   */
  getDeviceInfo: function() {
    try {
      return wx.getSystemInfoSync() || {};
    } catch (e) {
      console.error('获取设备信息失败:', e);
      return {};
    }
  }
});
