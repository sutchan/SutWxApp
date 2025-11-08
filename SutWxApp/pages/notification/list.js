// 閫氱煡涓績椤甸潰閫昏緫
const app = getApp();

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    notifications: [], // 閫氱煡鍒楄〃
    activeFilter: 'all', // 褰撳墠婵€娲荤殑绛涢€夋潯浠?    loading: false, // 鍔犺浇鐘舵€?    loadingMore: false, // 鍔犺浇鏇村鐘舵€?    page: 1, // 褰撳墠椤电爜
    perPage: 10, // 姣忛〉鏁伴噺
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    unreadCount: 0 // 鏈閫氱煡鏁伴噺
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function () {
    this.checkLogin();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 姣忔椤甸潰鏄剧ず鏃堕噸鏂板姞杞芥暟鎹?    this.loadNotifications(true);
    this.loadUnreadCount();
  },

  /**
   * 妫€鏌ョ敤鎴风櫥褰曠姸鎬?   */
  checkLogin: function () {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '璇峰厛鐧诲綍',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/user/login/login'
        });
      }, 2000);
    }
  },

  /**
   * 鍔犺浇閫氱煡鍒楄〃
   * @param {boolean} refresh - 鏄惁鍒锋柊鏁版嵁
   */
  loadNotifications: async function (refresh = false) {
    if (this.data.loading || (this.data.loadingMore && !refresh)) {
      return;
    }

    if (refresh) {
      this.setData({
        loading: true,
        page: 1,
        hasMore: true,
        notifications: []
      });
    } else if (!refresh && this.data.hasMore) {
      this.setData({
        loadingMore: true
      });
    }

    try {
      // 鏋勫缓鏌ヨ鍙傛暟
      const queryParams = {
        page: refresh ? 1 : this.data.page,
        per_page: this.data.perPage
      };

      // 鏍规嵁绛涢€夋潯浠舵坊鍔犲弬鏁?      switch (this.data.activeFilter) {
        case 'unread':
          queryParams.unread_only = true;
          break;
        case 'system':
          queryParams.type = 'system';
          break;
        case 'interaction':
          queryParams.type = 'comment,follow,like';
          break;
        case 'points':
          queryParams.type = 'point';
          break;
      }

      // 璋冪敤閫氱煡鏈嶅姟鑾峰彇鍒楄〃
      const result = await app.services.notification.getNotifications(queryParams);

      // 鏍煎紡鍖栭€氱煡鏁版嵁
      const formattedNotifications = result.data.map(notification => {
        return {
          ...notification,
          time_ago: this.formatTimeAgo(notification.created_at),
          type_text: this.getNotificationTypeText(notification.type),
          is_read: notification.read || false
        };
      });

      // 鏇存柊鏁版嵁
      if (refresh) {
        this.setData({
          notifications: formattedNotifications,
          page: 2, // 涓嬫鍔犺浇绗?椤?          hasMore: formattedNotifications.length >= this.data.perPage
        });
      } else {
        this.setData({
          notifications: [...this.data.notifications, ...formattedNotifications],
          page: this.data.page + 1,
          hasMore: formattedNotifications.length >= this.data.perPage
        });
      }
    } catch (err) {
      console.error('鑾峰彇閫氱煡鍒楄〃澶辫触:', err);
      wx.showToast({
        title: '鑾峰彇閫氱煡澶辫触锛岃閲嶈瘯',
        icon: 'none'
      });
    } finally {
      this.setData({
        loading: false,
        loadingMore: false
      });
    }
  },

  /**
   * 鍔犺浇鏈閫氱煡鏁伴噺
   */
  loadUnreadCount: function () {
    app.services.notification.getUnreadNotificationCount()
      .then(count => {
        this.setData({
          unreadCount: count
        });
        // 鏇存柊tabBar鐨勮鏍?        if (count > 0) {
          wx.setTabBarBadge({
            index: 3, // 鍋囪閫氱煡tab鍦ㄧ储寮?浣嶇疆
            text: count > 99 ? '99+' : count.toString()
          });
        } else {
          wx.removeTabBarBadge({
            index: 3
          });
        }
      })
      .catch(err => {
        console.error('鑾峰彇鏈鏁伴噺澶辫触:', err);
      });
  },

  /**
   * 鏇存敼绛涢€夋潯浠?   */
  changeFilter: function (e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter: filter
    });
    this.loadNotifications(true);
  },

  /**
   * 鐐瑰嚮閫氱煡椤?   */
  onNotificationClick: function (e) {
    const notificationId = e.currentTarget.dataset.id;
    const notification = this.data.notifications.find(item => item.id === notificationId);
    
    // 濡傛灉鏄湭璇婚€氱煡锛屽厛鏍囪涓哄凡璇?    if (!notification.is_read) {
      this.markAsRead(notificationId);
    }
    
    // 澶勭悊閫氱煡鐐瑰嚮璺宠浆
    app.services.notification.handleNotificationClick(notification);
  },

  /**
   * 鏍囪閫氱煡涓哄凡璇?   * @param {string} notificationId - 閫氱煡ID
   */
  markAsRead: function (notificationId) {
    app.services.notification.markAsRead(notificationId)
      .then(() => {
        // 鏇存柊鏈湴鏁版嵁
        const updatedNotifications = this.data.notifications.map(item => {
          if (item.id === notificationId) {
            return { ...item, is_read: true };
          }
          return item;
        });
        
        this.setData({
          notifications: updatedNotifications
        });
        
        // 鏇存柊鏈鏁伴噺
        this.data.unreadCount = Math.max(0, this.data.unreadCount - 1);
        this.setData({ unreadCount: this.data.unreadCount });
        
        // 鏇存柊tabBar瑙掓爣
        if (this.data.unreadCount > 0) {
          wx.setTabBarBadge({
            index: 3, // 鍋囪閫氱煡tab鍦ㄧ储寮?浣嶇疆
            text: this.data.unreadCount > 99 ? '99+' : this.data.unreadCount.toString()
          });
        } else {
          wx.removeTabBarBadge({
            index: 3
          });
        }
      })
      .catch(err => {
        console.error('鏍囪宸茶澶辫触:', err);
      });
  },
  },

  /**
   * 鏍囪鍏ㄩ儴宸茶
   */
  markAllAsRead: function () {
    wx.showModal({
      title: '纭鎿嶄綔',
      content: '纭畾灏嗘墍鏈夐€氱煡鏍囪涓哄凡璇诲悧锛?,
      success: (res) => {
        if (res.confirm) {
          app.services.notification.markAllAsRead()
            .then(() => {
              // 鏇存柊鏈湴鏁版嵁
              this.setData({
                notifications: this.data.notifications.map(item => ({ ...item, is_read: true })),
                unreadCount: 0
              });
              // 绉婚櫎tabBar瑙掓爣
              wx.removeTabBarBadge({
                index: 3
              });
              wx.showToast({
                title: '宸插叏閮ㄦ爣璁颁负宸茶',
                icon: 'success'
              });
            } catch (err) {
              console.error('鏍囪鍏ㄩ儴宸茶澶辫触:', err);
              wx.showToast({
                title: '鎿嶄綔澶辫触锛岃閲嶈瘯',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  /**
   * 鏍煎紡鍖栨椂闂翠负鐩稿鏃堕棿
   * @param {string} time - 鏃堕棿瀛楃涓?   * @returns {string} 鐩稿鏃堕棿鏂囨湰
   */
  formatTimeAgo: function (time) {
    const now = new Date();
    const past = new Date(time);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return '鍒氬垰';
    } else if (diffMins < 60) {
      return `${diffMins}鍒嗛挓鍓峘;
    } else if (diffHours < 24) {
      return `${diffHours}灏忔椂鍓峘;
    } else if (diffDays < 7) {
      return `${diffDays}澶╁墠`;
    } else {
      return past.toLocaleDateString();
    }
  },

  /**
   * 鑾峰彇閫氱煡绫诲瀷鏂囨湰
   * @param {string} type - 閫氱煡绫诲瀷
   * @returns {string} 绫诲瀷鏂囨湰
   */
  getNotificationTypeText: function (type) {
    const typeMap = {
      system: '绯荤粺閫氱煡',
      comment: '璇勮閫氱煡',
      follow: '鍏虫敞閫氱煡',
      like: '鐐硅禐閫氱煡',
      point: '绉垎閫氱煡',
      order: '璁㈠崟閫氱煡'
    };
    return typeMap[type] || '鍏朵粬';
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function () {
    this.loadNotifications(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 涓婃媺鍔犺浇鏇村
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadNotifications(false);
    }
  }
});