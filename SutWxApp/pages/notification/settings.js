/**
 * 鏂囦欢鍚? settings.js
 * 鐗堟湰鍙? 1.0.1
 * 鏇存柊鏃ユ湡: 2025-12-03
 * 鎻忚堪: 閫氱煡璁剧疆椤甸潰
 */
const notificationService = require('../../services/notificationService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    settings: null,
    loading: true,
    unreadCount: 0,
    notificationTypes: [
      { key: 'systemNotification', name: '绯荤粺閫氱煡', description: '鎺ユ敹绯荤粺閲嶈閫氱煡鍜屽叕鍛? },
      { key: 'orderNotification', name: '璁㈠崟閫氱煡', description: '鎺ユ敹璁㈠崟鐘舵€佸彉鏇撮€氱煡' },
      { key: 'promotionNotification', name: '淇冮攢閫氱煡', description: '鎺ユ敹鍟嗗搧淇冮攢鍜屼紭鎯犱俊鎭? },
      { key: 'activityNotification', name: '娲诲姩閫氱煡', description: '鎺ユ敹骞冲彴娲诲姩鍜屼簨浠堕€氱煡' },
      { key: 'socialNotification', name: '绀句氦閫氱煡', description: '鎺ユ敹鍏虫敞銆佺偣璧炪€佽瘎璁虹瓑绀句氦浜掑姩閫氱煡' }
    ]
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function () {
    this.loadNotificationSettings();
    this.loadUnreadCount();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    this.loadNotificationSettings();
    this.loadUnreadCount();
  },

  /**
   * 鍔犺浇閫氱煡璁剧疆
   */
  loadNotificationSettings: function () {
    this.setData({
      loading: true
    });
    
    notificationService.getNotificationSettings()
      .then(res => {
        // 璁剧疆榛樿鍊?        const defaultSettings = {
          systemNotification: true,
          orderNotification: true,
          promotionNotification: true,
          activityNotification: true,
          socialNotification: true,
          notificationSound: true,
          notificationVibration: true,
          pushNotification: true
        };
        
        const settings = { ...defaultSettings, ...res };
        
        this.setData({
          settings,
          loading: false
        });
      })
      .catch(err => {
        this.setData({
          loading: false
        });
        
        wx.showToast({
          title: err.message || '鍔犺浇閫氱煡璁剧疆澶辫触',
          icon: 'none'
        });
      });
  },

  /**
   * 鍔犺浇鏈閫氱煡鏁伴噺
   */
  loadUnreadCount: function () {
    notificationService.getUnreadCount()
      .then(res => {
        this.setData({
          unreadCount: res.count || 0
        });
      })
      .catch(err => {
        console.error('鍔犺浇鏈閫氱煡鏁伴噺澶辫触:', err);
      });
  },

  /**
   * 鏇存柊閫氱煡璁剧疆
   * @param {Object} newSettings - 鏂扮殑璁剧疆
   */
  updateSettings: function (newSettings) {
    const settings = { ...this.data.settings, ...newSettings };
    
    this.setData({
      settings
    });
    
    notificationService.updateNotificationSettings(settings)
      .then(() => {
        // 鏇存柊鎴愬姛锛屾樉绀烘彁绀?        wx.showToast({
          title: '璁剧疆宸蹭繚瀛?,
          icon: 'success',
          duration: 1000
        });
      })
      .catch(err => {
        wx.showToast({
          title: err.message || '鏇存柊閫氱煡璁剧疆澶辫触',
          icon: 'none'
        });
        
        // 鎭㈠鍘熻缃?        this.loadNotificationSettings();
      });
  },

  /**
   * 閫氱煡绫诲瀷寮€鍏冲彉鍖?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onNotificationTypeChange: function (e) {
    const { key } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.updateSettings({ [key]: value });
  },

  /**
   * 閫氱煡鎻愰啋鏂瑰紡鍙樺寲
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onNotificationReminderChange: function (e) {
    const { key } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.updateSettings({ [key]: value });
  },

  /**
   * 鎺ㄩ€侀€氱煡寮€鍏冲彉鍖?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onPushNotificationChange: function (e) {
    const { value } = e.detail;
    this.updateSettings({ pushNotification: value });
  },

  /**
   * 鍏ㄩ€?鍙栨秷鍏ㄩ€夋墍鏈夐€氱煡
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onSelectAllChange: function (e) {
    const { value } = e.detail;
    const newSettings = {};
    
    this.data.notificationTypes.forEach(type => {
      newSettings[type.key] = value;
    });
    
    this.updateSettings(newSettings);
  },

  /**
   * 娓呯┖鎵€鏈夐€氱煡
   */
  onClearNotifications: function () {
    wx.showModal({
      title: '纭娓呯┖',
      content: '纭畾瑕佹竻绌烘墍鏈夊凡璇婚€氱煡鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            loading: true
          });
          
          notificationService.deleteNotification()
            .then(() => {
              this.setData({
                loading: false
              });
              
              wx.showToast({
                title: '娓呯┖鎴愬姛',
                icon: 'success'
              });
              
              // 鏇存柊鏈鏁伴噺
              this.loadUnreadCount();
            })
            .catch(err => {
              this.setData({
                loading: false
              });
              
              wx.showToast({
                title: err.message || '娓呯┖閫氱煡澶辫触',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  /**
   * 璺宠浆鍒伴€氱煡鍒楄〃
   */
  onNotificationListTap: function () {
    wx.navigateTo({
      url: '/pages/notification/list/list'
    });
  }
});\n