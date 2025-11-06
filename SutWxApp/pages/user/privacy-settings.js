// 用户隐私设置页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    privacySettings: {
      allowComments: true, // 允许评论
      allowFollow: true, // 允许关注
      showActivity: true, // 显示活动
      receiveNotifications: true, // 接收通知
      showLocation: false, // 显示位置信息
      shareDataWithPartners: false // 与合作伙伴共享数据
    },
    loading: true, // 是否正在加载
    saving: false, // 是否正在保存
    error: false, // 是否加载失败
    saveSuccess: false // 保存是否成功
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'privacy_settings'
    });
    
    // 加载隐私设置
    this.loadPrivacySettings();
  },

  /**
   * 加载隐私设置
   */
  async loadPrivacySettings() {
    try {
      // 显示加载状态
      this.setData({
        loading: true,
        error: false
      });

      // 检查登录状态
      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          error: true
        });
        showToast('请先登录', 'none');
        return;
      }

      // 使用userService获取隐私设置
      const result = await app.services.user.getUserPrivacySettings();
      
      // 更新隐私设置数据
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
      console.error('加载隐私设置失败:', err);
    }
  },

  /**
   * 处理请求错误
   * @param {Object} err 错误对象
   */
  handleRequestError(err) {
    let errorMsg = '请求失败';
    
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
   * 切换设置项
   * @param {Object} e 事件对象
   */
  toggleSetting(e) {
    const { setting } = e.currentTarget.dataset;
    const { privacySettings } = this.data;
    const previousValue = privacySettings[setting];
    
    // 更新设置值
    privacySettings[setting] = !previousValue;
    
    this.setData({
      privacySettings,
      saveSuccess: false // 重置保存成功状态
    });
    
    // 记录设置变更事件
    app.analyticsService.track('privacy_setting_toggled', {
      setting: setting,
      value: privacySettings[setting]
    });
  },

  /**
   * 保存隐私设置
   */
  async savePrivacySettings() {
    try {
      // 显示保存状态
      this.setData({
        saving: true,
        saveSuccess: false
      });

      // 检查登录状态
      if (!app.isLoggedIn()) {
        this.setData({
          saving: false
        });
        showToast('请先登录', 'none');
        return;
      }

      // 记录保存设置事件
      app.analyticsService.track('privacy_settings_saved', {
        settings: this.data.privacySettings
      });
      
      // 使用userService保存隐私设置
      await app.services.user.updateUserPrivacySettings(this.data.privacySettings);
      
      this.setData({
        saving: false,
        saveSuccess: true
      });
      
      // 显示保存成功提示
      showToast('设置保存成功', 'success');
    } catch (err) {
      this.setData({
        saving: false
      });
      showToast(err.message || '保存失败，请重试', 'none');
    }
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    // 记录重试加载事件
    app.analyticsService.track('retry_loading', {
      page: 'privacy_settings'
    });
    
    this.loadPrivacySettings();
  }
});