// 微信小程序入口文件
App({
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: '',
    appName: 'SUT微信小程序'
  },

  onLaunch: function() {
    // 从本地存储获取配置和用户信息
    try {
      const token = wx.getStorageSync('token');
      const apiBaseUrl = wx.getStorageSync('apiBaseUrl');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (token) {
        this.globalData.token = token;
      }
      
      if (apiBaseUrl) {
        this.globalData.apiBaseUrl = apiBaseUrl;
      } else {
        // 默认API地址 - 已修复
        this.globalData.apiBaseUrl = 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1';
      }
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
    } catch (e) {
      console.error('读取本地存储失败:', e);
    }

    // 检查小程序更新
    this.checkUpdate();

    // 初始化云开发环境（如果需要）
    // wx.cloud.init({
    //   env: 'your-env-id',
    //   traceUser: true
    // });
  },

  onShow: function() {
    // 小程序启动或从后台进入前台时触发
    console.log('小程序启动或从后台进入前台');
  },

  onHide: function() {
    // 小程序从前台进入后台时触发
    console.log('小程序从前台进入后台');
  },

  onError: function(error) {
    // 小程序发生脚本错误或API调用失败时触发
    console.error('小程序错误:', error);
    // 可以在这里上报错误信息到服务器
  },

  checkUpdate: function() {
    // 检查小程序更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function(res) {
        // 有新版本可以更新
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  // 重启并应用新版本
                  updateManager.applyUpdate();
                }
              }
            });
          });
          
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请检查网络后重新尝试',
              showCancel: false
            });
          });
        }
      });
    }
  },

  // 封装登录方法
  login: function() {
    const that = this;
    return new Promise((resolve, reject) => {
      // 调用微信登录接口
      wx.login({
        success: function(res) {
          if (res.code) {
            // 发送code到服务器换取openid和session_key - API路径已修复
            that.request({
              url: '/login',
              method: 'POST',
              data: {
                code: res.code
              },
              success: function(response) {
                if (response.code === 0) {
                  // 保存token和用户信息
                  that.globalData.token = response.data.token;
                  that.globalData.userInfo = response.data;
                  
                  // 存入本地存储
                  wx.setStorageSync('token', response.data.token);
                  wx.setStorageSync('userInfo', response.data);
                  
                  resolve(response.data);
                } else {
                  reject(new Error(response.message));
                }
              },
              fail: function(error) {
                reject(error);
              }
            });
          } else {
            reject(new Error('登录失败：' + res.errMsg));
          }
        },
        fail: function(error) {
          reject(error);
        }
      });
    });
  },

  /**
   * 发起网络请求 - 统一的请求处理方法
   */
  request: function(options) {
    const that = this;
    const { url, method = 'GET', data = {}, header = {}, success, fail, complete, hideLoading, loadingText, errorMsg } = options;
    
    // 显示加载中
    if (!hideLoading) {
      wx.showLoading({
        title: loadingText || '加载中',
        mask: true
      });
    }

    // 构建完整的请求URL
    const requestUrl = that.globalData.apiBaseUrl + url;
    
    // 设置默认请求头
    const requestHeader = {
      'content-type': 'application/json',
      ...header
    };
    
    // 如果有token，添加到请求头
    if (that.globalData.token) {
      requestHeader['Authorization'] = 'Bearer ' + that.globalData.token;
    }
    
    // 发送请求
    return wx.request({
      url: requestUrl,
      method: method,
      data: data,
      header: requestHeader,
      success: function(res) {
        // 隐藏加载提示
        if (!hideLoading) {
          wx.hideLoading();
        }
        
        // 处理登录失效的情况
        if (res.statusCode === 401 || res.data.code === 101 || res.data.code === 102) {
          that.logout();
          return;
        }
        
        // 调用成功回调
        if (typeof success === 'function') {
          success(res.data);
        }
      },
      fail: function(error) {
        // 隐藏加载提示
        if (!hideLoading) {
          wx.hideLoading();
        }
        
        // 增强错误处理
        const msg = errorMsg || '网络请求失败，请检查网络连接';
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        });
        
        // 调用失败回调
        if (typeof fail === 'function') {
          fail(error);
        }
      },
      complete: function(res) {
        // 隐藏加载提示
        if (!hideLoading) {
          wx.hideLoading();
        }
        
        // 调用完成回调
        if (typeof complete === 'function') {
          complete(res);
        }
      }
    });
  },

  // 获取系统信息
  getSystemInfo: function() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: function(res) {
          resolve(res);
        },
        fail: function(error) {
          reject(error);
        }
      });
    });
  },

  // 判断用户是否登录
  isLoggedIn: function() {
    return !!this.globalData.token;
  },

  /**
   * 退出登录
   */
  logout: function() {
    // 清除本地存储的token和用户信息
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = '';
    this.globalData.userInfo = null;
    
    // 跳转到登录页面
    wx.redirectTo({
      url: '/pages/login/login'
    });
  }
});