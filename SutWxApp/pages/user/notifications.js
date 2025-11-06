// 通知页面逻辑 - 重定向到统一的通知中心页面
const app = getApp();

Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 重定向到统一的通知中心页面
    wx.redirectTo({
      url: '/pages/notification/list'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时重新加载数据
    this.loadNotifications(true);
    this.loadUnreadCount();
  },

  /**
   * 检查用户登录状态
   */
  checkLogin: function () {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
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
   * 加载通知列表
   * @param {boolean} refresh - 是否刷新数据
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

    // 根据筛选条件设置参数
    if (this.data.activeFilter === 'unread') {
      params.unread_only = true;
    } else if (this.data.activeFilter !== 'all') {
      params.type = this.data.activeFilter;
    }

    app.services.notification.getNotifications(params)
      .then(res => {
        // 格式化时间
        const formattedNotifications = res.notifications.map(item => ({
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

        // 更新未读数量
        if (refresh) {
          this.loadUnreadCount();
        }
      })
      .catch(err => {
        console.error('加载通知失败:', err);
        this.setData({
          loading: false,
          loadingMore: false
        });
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 加载未读通知数量
   */
  loadUnreadCount: function () {
    app.services.notification.getUnreadNotificationCount()
      .then(count => {
        this.setData({
          unreadCount: count
        });
        // 更新tabBar的角标
        if (count > 0) {
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
        console.error('获取未读数量失败:', err);
      });
  },

  /**
   * 更改筛选条件
   */
  changeFilter: function (e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter: filter
    });
    this.loadNotifications(true);
  },

  /**
   * 点击通知项
   */
  onNotificationClick: function (e) {
    const notificationId = e.currentTarget.dataset.id;
    const notification = this.data.notifications.find(item => item.id === notificationId);
    
    // 如果是未读通知，先标记为已读
    if (!notification.is_read) {
      this.markAsRead(notificationId);
    }
    
    // 处理通知点击跳转
    app.services.notification.handleNotificationClick(notification);
  },

  /**
   * 标记通知为已读
   * @param {string} notificationId - 通知ID
   */
  markAsRead: function (notificationId) {
    app.services.notification.markAsRead(notificationId)
      .then(() => {
        // 更新本地数据
        this.setData({
          notifications: this.data.notifications.map(item => 
            item.id === notificationId ? { ...item, is_read: true } : item
          )
        });
        // 更新未读数量
        this.loadUnreadCount();
      })
      .catch(err => {
        console.error('标记已读失败:', err);
      });
  },

  /**
   * 标记全部已读
   */
  markAllAsRead: function () {
    wx.showModal({
      title: '确认操作',
      content: '确定将所有通知标记为已读吗？',
      success: (res) => {
        if (res.confirm) {
          app.services.notification.markAllAsRead()
            .then(() => {
              // 更新本地数据
              this.setData({
                notifications: this.data.notifications.map(item => ({ ...item, is_read: true })),
                unreadCount: 0
              });
              // 移除tabBar角标
              wx.removeTabBarBadge({
                index: 3
              });
              wx.showToast({
                title: '已全部标记为已读',
                icon: 'success'
              });
            })
            .catch(err => {
              console.error('标记全部已读失败:', err);
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  /**
   * 格式化时间为相对时间
   * @param {string} time - 时间字符串
   * @returns {string} 相对时间文本
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
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return past.toLocaleDateString();
    }
  },

  /**
   * 获取通知类型文本
   * @param {string} type - 通知类型
   * @returns {string} 类型文本
   */
  getNotificationTypeText: function (type) {
    const typeMap = {
      system: '系统通知',
      comment: '评论通知',
      follow: '关注通知',
      point: '积分通知',
      order: '订单通知'
    };
    return typeMap[type] || '其他';
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.loadNotifications(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadNotifications(false);
    }
  }
});