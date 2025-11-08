// 閫氱煡椤甸潰閫昏緫 - 閲嶅畾鍚戝埌缁熶竴鐨勯€氱煡涓績椤甸潰
const app = getApp();

Page({
  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function () {
    // 閲嶅畾鍚戝埌缁熶竴鐨勯€氱煡涓績椤甸潰
    wx.redirectTo({
      url: '/pages/notification/list'
    });
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
  loadNotifications: function (refresh = false) {
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

    const params = {
      page: refresh ? 1 : this.data.page,
      per_page: this.data.perPage
    };

    // 鏍规嵁绛涢€夋潯浠惰缃弬鏁?    if (this.data.activeFilter === 'unread') {
      params.unread_only = true;
    } else if (this.data.activeFilter !== 'all') {
      params.type = this.data.activeFilter;
    }

    app.services.notification.getNotifications(params)
      .then(res => {
        // 鏍煎紡鍖栨椂闂?        const formattedNotifications = res.notifications.map(item => ({
          ...item,
          time_ago: this.formatTimeAgo(item.created_at),
          type_text: this.getNotificationTypeText(item.type)
        }));

        this.setData({
          notifications: refresh ? formattedNotifications : [...this.data.notifications, ...formattedNotifications],
          loading: false,
          loadingMore: false,
          page: refresh ? 2 : this.data.page + 1,
          hasMore: res.notifications.length === this.data.perPage
        });

        // 鏇存柊鏈鏁伴噺
        if (refresh) {
          this.loadUnreadCount();
        }
      })
      .catch(err => {
        console.error('鍔犺浇閫氱煡澶辫触:', err);
        this.setData({
          loading: false,
          loadingMore: false
        });
        wx.showToast({
          title: '鍔犺浇澶辫触锛岃閲嶈瘯',
          icon: 'none'
        });
      });
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
            index: 3,
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
        this.setData({
          notifications: this.data.notifications.map(item => 
            item.id === notificationId ? { ...item, is_read: true } : item
          )
        });
        // 鏇存柊鏈鏁伴噺
        this.loadUnreadCount();
      })
      .catch(err => {
        console.error('鏍囪宸茶澶辫触:', err);
      });
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
            })
            .catch(err => {
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
});\n