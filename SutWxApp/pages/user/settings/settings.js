// pages/user/settings/settings.js
/**
 * 设置页面 - 提供用户个性化设置和应用配置选项
 */
Page({
  data: {
    userInfo: null,
    notificationEnabled: true,
    autoPlayEnabled: false,
    darkModeEnabled: false,
    cacheSize: '0MB',
    appVersion: getApp().globalData.appVersion
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.loadUserInfo();
    this.calculateCacheSize();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        appVersion: app.globalData.appVersion
      });
    }
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize: function() {
    wx.getStorageInfoSync({
      success: (res) => {
        // 计算缓存大小并格式化
        const cacheSize = this.formatSize(res.currentSize);
        this.setData({
          cacheSize: cacheSize
        });
      },
      fail: () => {
        this.setData({
          cacheSize: '0MB'
        });
      }
    });
  },

  /**
   * 格式化大小
   */
  formatSize: function(bytes) {
    if (bytes === 0) return '0MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  },

  /**
   * 通知设置开关
   */
  toggleNotification: function(e) {
    const enabled = e.detail.value;
    this.setData({
      notificationEnabled: enabled
    });
    
    // 保存设置到本地
    wx.setStorageSync('notificationEnabled', enabled);
    
    // 这里可以调用API保存到服务器
    this.saveUserSetting('notification', enabled);
  },

  /**
   * 自动播放设置开关
   */
  toggleAutoPlay: function(e) {
    const enabled = e.detail.value;
    this.setData({
      autoPlayEnabled: enabled
    });
    
    // 保存设置到本地
    wx.setStorageSync('autoPlayEnabled', enabled);
    
    // 这里可以调用API保存到服务器
    this.saveUserSetting('autoPlay', enabled);
  },

  /**
   * 深色模式设置开关
   */
  toggleDarkMode: function(e) {
    const enabled = e.detail.value;
    this.setData({
      darkModeEnabled: enabled
    });
    
    // 保存设置到本地
    wx.setStorageSync('darkModeEnabled', enabled);
    
    // 这里可以调用API保存到服务器
    this.saveUserSetting('darkMode', enabled);
    
    // 切换主题
    this.switchTheme(enabled);
  },

  /**
   * 保存用户设置到服务器
   */
  saveUserSetting: function(key, value) {
    const app = getApp();
    
    if (!app.isLoggedIn()) return;
    
    app.request({
      url: '/user/settings',
      method: 'POST',
      data: {
        key: key,
        value: value
      },
      success: (res) => {
        if (res.code !== 200) {
          console.error('保存设置失败:', res.message);
        }
      },
      fail: (error) => {
        console.error('保存设置网络失败:', error);
      }
    });
  },

  /**
   * 切换主题
   */
  switchTheme: function(isDark) {
    // 这里可以实现主题切换逻辑
    if (isDark) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      });
    }
  },

  /**
   * 清除缓存
   */
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除应用缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存
          wx.clearStorageSync();
          
          // 重新恢复用户信息和token
          const app = getApp();
          if (app.globalData.userInfo && app.globalData.token) {
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            wx.setStorageSync('token', app.globalData.token);
          }
          
          this.setData({
            cacheSize: '0MB'
          });
          
          wx.showToast({
            title: '缓存已清除',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 查看用户协议
   */
  viewUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement?type=user'
    });
  },

  /**
   * 查看隐私政策
   */
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement?type=privacy'
    });
  },

  /**
   * 关于我们
   */
  viewAbout: function() {
    wx.navigateTo({
      url: '/pages/user/about/about'
    });
  },

  /**
   * 联系客服
   */
  contactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 检查更新
   */
  checkForUpdates: function() {
    const app = getApp();
    app.checkUpdate();
  }
});