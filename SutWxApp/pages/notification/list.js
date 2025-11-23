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
    empty: false
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
    // 每次显示页面时刷新数据
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
      title: '通知中心',
      path: '/pages/notification/list/list'
    };
  },

  /**
   * 加载通知列表
   * @param {boolean} isRefresh - 是否是刷新操作
   */
  loadNotifications: function(isRefresh = false) {
    if (this.data.loading) return;
    
    this.setData({
      loading: true
    });

    notificationService.getNotificationList({
      page: this.data.page,
      pageSize: this.data.pageSize
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
    
    // 标记通知为已读
    notificationService.markAsRead(id)
      .then(() => {
        // 更新本地数据中的已读状态
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
        console.error('标记已读失败:', err);
      });
    
    // 根据通知类型跳转
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
        url: `/pages/user/order/detail/detail?id=${url}`
      });
    } else if (type === 'system') {
      // 系统通知跳转到通知详情页
      wx.navigateTo({
        url: `/pages/notification/detail/detail?id=${id}`
      });
    }
  },

  /**
   * 全部标记为已读
   */
  markAllAsRead: function() {
    notificationService.markAllAsRead()
      .then(() => {
        // 更新本地数据中的已读状态
        const notifications = this.data.notifications.map(item => {
          return { ...item, isRead: true };
        });
        
        this.setData({
          notifications
        });
        
        wx.showToast({
          title: '已全部标记为已读',
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