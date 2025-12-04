/**
 * 文件名: detail.js
 * 版本号: 1.0.1
 * 更新日期: 2025-12-03
 * 描述: 通知详情页面
 */
const notificationService = require('../../services/notificationService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    notification: null,
    loading: true,
    notificationId: null,
    error: false,
    errorMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        notificationId: options.id
      });
      this.loadNotificationDetail(options.id);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.notificationId) {
      this.loadNotificationDetail(this.data.notificationId);
    }
  },

  /**
   * 加载通知详情
   * @param {string} id - 通知ID
   */
  loadNotificationDetail: function (id) {
    if (!id) return;
    
    this.setData({
      loading: true,
      error: false,
      errorMessage: ''
    });
    
    notificationService.getNotificationDetail(id)
      .then(res => {
        this.setData({
          notification: res,
          loading: false
        });
        
        // 标记为已读
        if (!res.isRead) {
          notificationService.markAsRead(id)
            .catch(err => {
              console.error('标记通知已读失败', err);
            });
        }
      })
      .catch(err => {
        this.setData({
          loading: false,
          error: true,
          errorMessage: err.message || '加载通知详情失败'
        });
        
        wx.showToast({
          title: err.message || '加载通知详情失败',
          icon: 'none'
        });
      });
  },

  /**
   * 点击操作按钮
   */
  onActionTap: function () {
    const { notification } = this.data;
    if (notification && notification.actionUrl) {
      this.navigateToUrl(notification.actionUrl);
    }
  },

  /**
   * 点击相关链接
   * @param {Object} e - 事件对象
   */
  onLinkTap: function (e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      this.navigateToUrl(url);
    }
  },

  /**
   * 跳转至指定URL
   * @param {string} url - 目标URL
   */
  navigateToUrl: function (url) {
    if (!url) return;
    
    // 判断URL类型，进行相应的跳转
    if (url.startsWith('/')) {
      // 内部页面跳转
      wx.navigateTo({
        url: url
      });
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // 外部链接跳转
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
      });
    } else {
      // 其他类型链接
      console.error('不支持的URL类型:', url);
      wx.showToast({
        title: '不支持的链接类型',
        icon: 'none'
      });
    }
  },

  /**
   * 返回上一页
   */
  onBackTap: function () {
    wx.navigateBack();
  },

  /**
   * 重试加载
   */
  onRetryTap: function () {
    if (this.data.notificationId) {
      this.loadNotificationDetail(this.data.notificationId);
    }
  },

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间
   */
  formatTime: function(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function () {
    const { notification } = this.data;
    return {
      title: notification ? notification.title : '通知详情',
      path: `/pages/notification/detail/detail?id=${this.data.notificationId}`
    };
  }
});
