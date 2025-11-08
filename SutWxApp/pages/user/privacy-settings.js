// 鐢ㄦ埛闅愮璁剧疆椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    privacySettings: {
      allowComments: true, // 鍏佽璇勮
      allowFollow: true, // 鍏佽鍏虫敞
      showActivity: true, // 鏄剧ず娲诲姩
      receiveNotifications: true, // 鎺ユ敹閫氱煡
      showLocation: false, // 鏄剧ず浣嶇疆淇℃伅
      shareDataWithPartners: false // 涓庡悎浣滀紮浼村叡浜暟鎹?    },
    loading: true, // 鏄惁姝ｅ湪鍔犺浇
    saving: false, // 鏄惁姝ｅ湪淇濆瓨
    error: false, // 鏄惁鍔犺浇澶辫触
    saveSuccess: false // 淇濆瓨鏄惁鎴愬姛
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'privacy_settings'
    });
    
    // 鍔犺浇闅愮璁剧疆
    this.loadPrivacySettings();
  },

  /**
   * 鍔犺浇闅愮璁剧疆
   */
  async loadPrivacySettings() {
    try {
      // 鏄剧ず鍔犺浇鐘舵€?      this.setData({
        loading: true,
        error: false
      });

      // 妫€鏌ョ櫥褰曠姸鎬?      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          error: true
        });
        showToast('璇峰厛鐧诲綍', 'none');
        return;
      }

      // 浣跨敤userService鑾峰彇闅愮璁剧疆
      const result = await app.services.user.getUserPrivacySettings();
      
      // 鏇存柊闅愮璁剧疆鏁版嵁
      this.setData({
        privacySettings: result || this.data.privacySettings,
        loading: false,
        error: false
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: true
      });
      console.error('鍔犺浇闅愮璁剧疆澶辫触:', err);
    }
  },

  /**
   * 澶勭悊璇锋眰閿欒
   * @param {Object} err 閿欒瀵硅薄
   */
  handleRequestError(err) {
    let errorMsg = '璇锋眰澶辫触';
    
    if (err.message) {
      errorMsg = err.message;
    } else if (err.data && err.data.message) {
      errorMsg = err.data.message;
    }
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      saving: false
    });
  },

  /**
   * 鍒囨崲璁剧疆椤?   * @param {Object} e 浜嬩欢瀵硅薄
   */
  toggleSetting(e) {
    const { setting } = e.currentTarget.dataset;
    const { privacySettings } = this.data;
    const previousValue = privacySettings[setting];
    
    // 鏇存柊璁剧疆鍊?    privacySettings[setting] = !previousValue;
    
    this.setData({
      privacySettings,
      saveSuccess: false // 閲嶇疆淇濆瓨鎴愬姛鐘舵€?    });
    
    // 璁板綍璁剧疆鍙樻洿浜嬩欢
    app.analyticsService.track('privacy_setting_toggled', {
      setting: setting,
      value: privacySettings[setting]
    });
  },

  /**
   * 淇濆瓨闅愮璁剧疆
   */
  async savePrivacySettings() {
    try {
      // 鏄剧ず淇濆瓨鐘舵€?      this.setData({
        saving: true,
        saveSuccess: false
      });

      // 妫€鏌ョ櫥褰曠姸鎬?      if (!app.isLoggedIn()) {
        this.setData({
          saving: false
        });
        showToast('璇峰厛鐧诲綍', 'none');
        return;
      }

      // 璁板綍淇濆瓨璁剧疆浜嬩欢
      app.analyticsService.track('privacy_settings_saved', {
        settings: this.data.privacySettings
      });
      
      // 浣跨敤userService淇濆瓨闅愮璁剧疆
      await app.services.user.updateUserPrivacySettings(this.data.privacySettings);
      
      this.setData({
        saving: false,
        saveSuccess: true
      });
      
      // 鏄剧ず淇濆瓨鎴愬姛鎻愮ず
      showToast('璁剧疆淇濆瓨鎴愬姛', 'success');
    } catch (err) {
      this.setData({
        saving: false
      });
      showToast(err.message || '淇濆瓨澶辫触锛岃閲嶈瘯', 'none');
    }
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    // 璁板綍閲嶈瘯鍔犺浇浜嬩欢
    app.analyticsService.track('retry_loading', {
      page: 'privacy_settings'
    });
    
    this.loadPrivacySettings();
  }
});