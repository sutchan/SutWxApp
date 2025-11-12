// 用户设置页面控制器
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    notificationSettings: {
      pushEnabled: true,
      commentEnabled: true,
      systemEnabled: true
    },
    isLoading: false,
    error: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问统计
    app.analyticsService.track('page_view', {
      page: 'settings'
    });
    
    this.loadUserSettings();
  },

  /**
   * 加载用户设置
   */
  async loadUserSettings() {
    try {
      this.setData({ isLoading: true, error: null });
      
      const userInfo = wx.getStorageSync('userInfo') || {};
      
      // 调用userService获取用户设置
      const result = await app.services.user.getUserSettings();
      
      this.setData({
        userInfo: userInfo,
        notificationSettings: result.notifications || this.data.notificationSettings,
        error: null
      });
    } catch (err) {
      this.setData({ 
        userInfo: wx.getStorageSync('userInfo') || {},
        error: err.message || '加载设置失败'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 更新通知设置
   */
  updateNotificationSetting(e) {
    const { type, checked } = e.detail;
    const newSettings = { ...this.data.notificationSettings };
    
    if (type === 'push') {
      newSettings.pushEnabled = checked;
    } else if (type === 'comment') {
      newSettings.commentEnabled = checked;
    } else if (type === 'system') {
      newSettings.systemEnabled = checked;
    }
    
    this.setData({ notificationSettings: newSettings });
    
    // 记录设置变更统计
    app.analyticsService.track('notification_setting_changed', {
      type: type,
      enabled: checked
    });
    
    this.saveSettings(newSettings);
  },

  /**
   * 保存设置
   */
  async saveSettings(settings) {
    try {
      // 调用userService保存用户设置
      await app.services.user.updateUserSettings({ notifications: settings });
      
      // 保存成功后显示提示
    } catch (err) {
      showToast(err.message || '保存失败，请重试', 'none');
    }
  },

  /**
   * 跳转到编辑个人资料页面
   */
  navigateToEditProfile: function() {
    // 记录导航统计
    app.analyticsService.track('navigate_to_edit_profile');
    
    wx.navigateTo({ url: '/pages/user/edit-profile' });
  },

  /**
   * 跳转到账号绑定页面
   */
  navigateToBindAccount: function() {
    // 记录导航统计
    app.analyticsService.track('navigate_to_bind_account');
    
    wx.navigateTo({ url: '/pages/user/bind-account' });
  },

  /**
   * 跳转到隐私设置页面
   */
  navigateToPrivacySettings: function() {
    // 记录导航统计
    app.analyticsService.track('navigate_to_privacy_settings');
    
    wx.navigateTo({ url: '/pages/user/privacy-settings' });
  },

  /**
   * 清除缓存
   */
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 记录缓存清除统计
          app.analyticsService.track('cache_cleared');
          
          wx.clearStorageSync();
          showToast('缓存清理成功', 'success');
          // 重新加载用户设置
          this.loadUserSettings();
        }
      }
    });
  },

  /**
   * 跳转到关于页面
   */
  navigateToAbout: function() {
    // 记录导航统计
    app.analyticsService.track('navigate_to_about');
    
    wx.navigateTo({ url: '/pages/user/about' });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    // 记录重试加载统计
    app.analyticsService.track('retry_loading', {
      page: 'settings'
    });
    
    this.loadUserSettings();
  }
});