/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-04
 * 描述: 通知列表页面
 */

// pages/notification/list.js
const notificationService = require('../../services/notificationService.js');

/**
 * 通知列表页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    notifications: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20,
    empty: false,
    activeType: 'all' // 当前选中的通知类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadNotifications();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 返回页面时重新加载数据
    this.setData({
      page: 1,
      notifications: [],
      hasMore: true
    });
    this.loadNotifications();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      notifications: [],
      hasMore: true
    });
    this.loadNotifications(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNotifications();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '通知列表',
      path: '/pages/notification/list/list'
    };
  },

  /**
   * 加载通知列表
   * @param {boolean} isRefresh - 是否为下拉刷新
   */
  loadNotifications: function(isRefresh = false) {
    if (this.data.loading) return;
    
    this.setData({
      loading: true
    });

    notificationService.getNotificationList({
      page: this.data.page,
      pageSize: this.data.pageSize,
      type: this.data.activeType === 'all' ? '' : this.data.activeType
    })
      .then(res => {
        const newNotifications = res.data || [];
        const notifications = isRefresh ? newNotifications : [...this.data.notifications, ...newNotifications];
        const hasMore = newNotifications.length === this.data.pageSize;
        const empty = notifications.length === 0;

        this.setData({
          notifications,
          loading: false,
          hasMore,
          empty,
          page: hasMore ? this.data.page + 1 : this.data.page
        });
        
        // 停止下拉刷新
        if (isRefresh) {
          wx.stopPullDownRefresh();
        }
      })
      .catch(err => {
        this.setData({
          loading: false
        });
        
        wx.showToast({
          title: err.message || '加载通知失败',
          icon: 'none'
        });
        
        // 停止下拉刷新
        if (isRefresh) {
          wx.stopPullDownRefresh();
        }
      });
  },

  /**
   * 点击通知项
   * @param {Object} e - 事件对象
   */
  onNotificationTap: function(e) {
    const { id, type, url } = e.currentTarget.dataset;
    
    // 标记为已读
    notificationService.markAsRead(id)
      .then(() => {
        // 更新本地数据
        const notifications = this.data.notifications.map(item => {
          if (item.id === id) {
            return { ...item, isRead: true };
          }
          return item;
        });
        
        this.setData({
          notifications
        });
      })
      .catch(err => {
        console.error('标记通知已读失败', err);
      });
    
    // 根据通知类型跳转到对应页面
    if (type === 'article' && url) {
      wx.navigateTo({
        url: `/pages/article/detail/detail?id=${url}`
      });
    } else if (type === 'product' && url) {
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${url}`
      });
    } else if (type === 'order' && url) {
      wx.navigateTo({
        url: `/pages/order/detail/detail?id=${url}`
      });
    } else {
      // 跳转到通知详情页
      wx.navigateTo({
        url: `/pages/notification/detail/detail?id=${id}`
      });
    }
  },

  /**
   * 切换通知类型
   * @param {Object} e - 事件对象
   */
  onTypeChange: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      activeType: type,
      page: 1,
      notifications: [],
      hasMore: true,
      loading: true
    });
    this.loadNotifications();
  },

  /**
   * 跳转到设置页面
   */
  onSettingsTap: function() {
    wx.navigateTo({
      url: '/pages/notification/settings/settings'
    });
  },

  /**
   * 获取图标文本
   * @param {string} type - 通知类型
   * @returns {string} 图标文本
   */
  getIconText: function(type) {
    const iconMap = {
      system: '系',
      order: '订',
      promotion: '促',
      activity: '活',
      article: '文',
      product: '产',
      social: '社',
      distribute: '分',
      points: '积',
      message: '消'
    };
    return iconMap[type] || '通';
  },

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间
   */
  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  },

  /**
   * 标记全部已读
   */
  onMarkAllRead: function() {
    notificationService.markAsRead()
      .then(() => {
        // 更新本地数据
        const notifications = this.data.notifications.map(item => {
          return { ...item, isRead: true };
        });
        
        this.setData({
          notifications
        });
        
        wx.showToast({
          title: '全部已读',
          icon: 'success'
        });
      })
      .catch(err => {
        wx.showToast({
          title: err.message || '操作失败',
          icon: 'none'
        });
      });
  }
});
