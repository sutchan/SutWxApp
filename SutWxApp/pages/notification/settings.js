/**
 * 文件名: settings.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-30
 * 描述: 通知设置页面
 */
const notificationService = require('../../services/notificationService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    settings: null,
    loading: true,
    unreadCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.loadNotificationSettings();
    this.loadUnreadCount();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadNotificationSettings();
    this.loadUnreadCount();
  },

  /**
   * 加载通知设置
   */
  loadNotificationSettings: function () {
    this.setData({
      loading: true
    });
    
    notificationService.getNotificationSettings()
      .then(res => {
        this.setData({
          settings: res,
          loading: false
        });
      })
      .catch(err => {
        this.setData({
          loading: false
        });
        
        wx.showToast({
          title: err.message || '加载通知设置失败',
          icon: 'none'
        });
      });
  },

  /**
   * 加载未读通知数量
   */
  loadUnreadCount: function () {
    notificationService.getUnreadCount()
      .then(res => {
        this.setData({
          unreadCount: res.count || 0
        });
      })
      .catch(err => {
        console.error('加载未读通知数量失败:', err);
      });
  },

  /**
   * 更新通知设置
   * @param {Object} newSettings - 新的设置
   */
  updateSettings: function (newSettings) {
    const settings = { ...this.data.settings, ...newSettings };
    
    this.setData({
      settings
    });
    
    notificationService.updateNotificationSettings(settings)
      .catch(err => {
        wx.showToast({
          title: err.message || '更新通知设置失败',
          icon: 'none'
        });
        
        // 恢复原设置
        this.loadNotificationSettings();
      });
  },

  /**
   * 系统通知开关变化
   * @param {Object} e - 事件对象
   */
  onSystemNotificationChange: function (e) {
    const { value } = e.detail;
    this.updateSettings({ systemNotification: value });
  },

  /**
   * 订单通知开关变化
   * @param {Object} e - 事件对象
   */
  onOrderNotificationChange: function (e) {
    const { value } = e.detail;
    this.updateSettings({ orderNotification: value });
  },

  /**
   * 促销通知开关变化
   * @param {Object} e - 事件对象
   */
  onPromotionNotificationChange: function (e) {
    const { value } = e.detail;
    this.updateSettings({ promotionNotification: value });
  },

  /**
   * 活动通知开关变化
   * @param {Object} e - 事件对象
   */
  onActivityNotificationChange: function (e) {
    const { value } = e.detail;
    this.updateSettings({ activityNotification: value });
  },

  /**
   * 清空所有通知
   */
  onClearNotifications: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有已读通知吗？',
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
                title: '清空成功',
                icon: 'success'
              });
              
              // 更新未读数量
              this.loadUnreadCount();
            })
            .catch(err => {
              this.setData({
                loading: false
              });
              
              wx.showToast({
                title: err.message || '清空通知失败',
                icon: 'none'
              });
            });
        }
      }
    });
  }
});