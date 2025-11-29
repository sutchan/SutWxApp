/**
 * 鏂囦欢鍚? list.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鎻忚堪: 
 */

// pages/notification/list.js
const notificationService = require('../../services/notificationService.js');

/**
 * 閫氱煡鍒楄〃椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    notifications: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20,
    empty: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadNotifications();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
   */
  onReady: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 姣忔鏄剧ず椤甸潰鏃跺埛鏂版暟鎹?    this.setData({
      page: 1,
      notifications: [],
      hasMore: true
    });
    this.loadNotifications();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰闅愯棌
   */
  onHide: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload: function () {
    
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
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
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNotifications();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: '閫氱煡涓績',
      path: '/pages/notification/list/list'
    };
  },

  /**
   * 鍔犺浇閫氱煡鍒楄〃
   * @param {boolean} isRefresh - 鏄惁鏄埛鏂版搷浣?   */
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
        
        // 鍋滄涓嬫媺鍒锋柊
        if (isRefresh) {
          wx.stopPullDownRefresh();
        }
      })
      .catch(err => {
        this.setData({
          loading: false
        });
        
        wx.showToast({
          title: err.message || '鍔犺浇閫氱煡澶辫触',
          icon: 'none'
        });
        
        // 鍋滄涓嬫媺鍒锋柊
        if (isRefresh) {
          wx.stopPullDownRefresh();
        }
      });
  },

  /**
   * 鐐瑰嚮閫氱煡椤?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onNotificationTap: function(e) {
    const { id, type, url } = e.currentTarget.dataset;
    
    // 鏍囪閫氱煡涓哄凡璇?    notificationService.markAsRead(id)
      .then(() => {
        // 鏇存柊鏈湴鏁版嵁涓殑宸茶鐘舵€?        const notifications = this.data.notifications.map(item => {
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
        console.error('鏍囪宸茶澶辫触:', err);
      });
    
    // 鏍规嵁閫氱煡绫诲瀷璺宠浆
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
      // 绯荤粺閫氱煡璺宠浆鍒伴€氱煡璇︽儏椤?      wx.navigateTo({
        url: `/pages/notification/detail/detail?id=${id}`
      });
    }
  },

  /**
   * 鍏ㄩ儴鏍囪涓哄凡璇?   */
  markAllAsRead: function() {
    notificationService.markAllAsRead()
      .then(() => {
        // 鏇存柊鏈湴鏁版嵁涓殑宸茶鐘舵€?        const notifications = this.data.notifications.map(item => {
          return { ...item, isRead: true };
        });
        
        this.setData({
          notifications
        });
        
        wx.showToast({
          title: '宸插叏閮ㄦ爣璁颁负宸茶',
          icon: 'success'
        });
      })
      .catch(err => {
        wx.showToast({
          title: err.message || '鎿嶄綔澶辫触',
          icon: 'none'
        });
      });
  }
});