/**
 * 文件名: settings.js
 * 版本号: 1.0.1
 * 更新日期: 2025-12-03
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
    unreadCount: 0,
    notificationTypes: [
      { key: 'systemNotification', name: '系统通知', description: '接收系统重要通知和公告' },
      { key: 'orderNotification', name: '订单通知', description: '接收订单状态变更通知' },
      { key: 'promotionNotification', name: '促销通知', description: '接收商品促销和优惠信息' },
      { key: 'activityNotification', name: '活动通知', description: '接收平台活动和事件通知' },
      { key: 'socialNotification', name: '社交通知', description: '接收关注、点赞、评论等社交互动通知' }
    ]
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
        // 设置默认值
        const defaultSettings = {
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
      .then(() => {
        // 更新成功，显示提示
        wx.showToast({
          title: '设置已保存',
          icon: 'success',
          duration: 1000
        });
      })
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
   * 通知类型开关变化
   * @param {Object} e - 事件对象
   */
  onNotificationTypeChange: function (e) {
    const { key } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.updateSettings({ [key]: value });
  },

  /**
   * 通知提醒方式变化
   * @param {Object} e - 事件对象
   */
  onNotificationReminderChange: function (e) {
    const { key } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.updateSettings({ [key]: value });
  },

  /**
   * 推送通知开关变化
   * @param {Object} e - 事件对象
   */
  onPushNotificationChange: function (e) {
    const { value } = e.detail;
    this.updateSettings({ pushNotification: value });
  },

  /**
   * 全选/取消全选所有通知
   * @param {Object} e - 事件对象
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
  },

  /**
   * 跳转到通知列表
   */
  onNotificationListTap: function () {
    wx.navigateTo({
      url: '/pages/notification/list/list'
    });
  }
});
