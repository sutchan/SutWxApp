// 用户设置页面逻辑
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
    // 记录页面访问事件
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
      
      // 使用userService获取用户设置
      const result = await app.services.user.getUserSettings();
      
      this.setData({
        userInfo: userInfo,
        notificationSettings: result.notifications || this.data.notificationSettings,
        error: null
      });
    } catch (err) {
      this.setData({ 
        userInfo: wx.getStorageSync('userInfo') || {},
        error: err.message || '获取设置失败' 
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
    
    // 记录通知设置变更事件
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
      // 使用userService保存用户设置
      await app.services.user.updateUserSettings({ notifications: settings });
      
      // 设置保存成功，不显示提示，保持操作流畅
    } catch (err) {
      showToast(err.message || '保存失败，请重试', 'none');
    }
  },

  /**
   * 跳转到个人资料编辑页面
   */
  navigateToEditProfile: function() {
    // 记录导航事件
    app.analyticsService.track('navigate_to_edit_profile');
    
    wx.navigateTo({ url: '/pages/user/edit-profile' });
  },

  /**
   * 跳转到账号绑定页面
   */
  navigateToBindAccount: function() {
    // 记录导航事件
    app.analyticsService.track('navigate_to_bind_account');
    
    wx.navigateTo({ url: '/pages/user/bind-account' });
  },

  /**
   * 跳转到隐私设置页面
   */
  navigateToPrivacySettings: function() {
    // 记录导航事件
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
          // 记录清除缓存事件
          app.analyticsService.track('cache_cleared');
          
          wx.clearStorageSync();
          showToast('缓存已清除', 'success');
          // 重新加载用户数据
          this.loadUserSettings();
        }
      }
    });
  },

  /**
   * 跳转到关于我们页面
   */
  navigateToAbout: function() {
    // 记录导航事件
    app.analyticsService.track('navigate_to_about');
    
    wx.navigateTo({ url: '/pages/user/about' });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    // 记录重试加载事件
    app.analyticsService.track('retry_loading', {
      page: 'settings'
    });
    
    this.loadUserSettings();
  }
});