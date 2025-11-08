// 鐢ㄦ埛璁剧疆椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'settings'
    });
    
    this.loadUserSettings();
  },

  /**
   * 鍔犺浇鐢ㄦ埛璁剧疆
   */
  async loadUserSettings() {
    try {
      this.setData({ isLoading: true, error: null });
      
      const userInfo = wx.getStorageSync('userInfo') || {};
      
      // 浣跨敤userService鑾峰彇鐢ㄦ埛璁剧疆
      const result = await app.services.user.getUserSettings();
      
      this.setData({
        userInfo: userInfo,
        notificationSettings: result.notifications || this.data.notificationSettings,
        error: null
      });
    } catch (err) {
      this.setData({ 
        userInfo: wx.getStorageSync('userInfo') || {},
        error: err.message || '鑾峰彇璁剧疆澶辫触' 
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 鏇存柊閫氱煡璁剧疆
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
    
    // 璁板綍閫氱煡璁剧疆鍙樻洿浜嬩欢
    app.analyticsService.track('notification_setting_changed', {
      type: type,
      enabled: checked
    });
    
    this.saveSettings(newSettings);
  },

  /**
   * 淇濆瓨璁剧疆
   */
  async saveSettings(settings) {
    try {
      // 浣跨敤userService淇濆瓨鐢ㄦ埛璁剧疆
      await app.services.user.updateUserSettings({ notifications: settings });
      
      // 璁剧疆淇濆瓨鎴愬姛锛屼笉鏄剧ず鎻愮ず锛屼繚鎸佹搷浣滄祦鐣?    } catch (err) {
      showToast(err.message || '淇濆瓨澶辫触锛岃閲嶈瘯', 'none');
    }
  },

  /**
   * 璺宠浆鍒颁釜浜鸿祫鏂欑紪杈戦〉闈?   */
  navigateToEditProfile: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_edit_profile');
    
    wx.navigateTo({ url: '/pages/user/edit-profile' });
  },

  /**
   * 璺宠浆鍒拌处鍙风粦瀹氶〉闈?   */
  navigateToBindAccount: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_bind_account');
    
    wx.navigateTo({ url: '/pages/user/bind-account' });
  },

  /**
   * 璺宠浆鍒伴殣绉佽缃〉闈?   */
  navigateToPrivacySettings: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_privacy_settings');
    
    wx.navigateTo({ url: '/pages/user/privacy-settings' });
  },

  /**
   * 娓呴櫎缂撳瓨
   */
  clearCache: function() {
    wx.showModal({
      title: '娓呴櫎缂撳瓨',
      content: '纭畾瑕佹竻闄ゆ墍鏈夌紦瀛樻暟鎹悧锛?,
      success: (res) => {
        if (res.confirm) {
          // 璁板綍娓呴櫎缂撳瓨浜嬩欢
          app.analyticsService.track('cache_cleared');
          
          wx.clearStorageSync();
          showToast('缂撳瓨宸叉竻闄?, 'success');
          // 閲嶆柊鍔犺浇鐢ㄦ埛鏁版嵁
          this.loadUserSettings();
        }
      }
    });
  },

  /**
   * 璺宠浆鍒板叧浜庢垜浠〉闈?   */
  navigateToAbout: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_about');
    
    wx.navigateTo({ url: '/pages/user/about' });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    // 璁板綍閲嶈瘯鍔犺浇浜嬩欢
    app.analyticsService.track('retry_loading', {
      page: 'settings'
    });
    
    this.loadUserSettings();
  }
});