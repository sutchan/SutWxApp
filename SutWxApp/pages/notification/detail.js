// 通知详情页面逻辑
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    notification: {}, // 通知详情
    loading: true, // 加载状态
    error: '', // 错误信息
    relatedContent: [], // 相关内容
    showActions: false, // 是否显示操作按钮
    primaryActionName: '', // 主要操作方法名
    primaryActionText: '', // 主要操作文本
    secondaryActionName: '', // 次要操作方法名
    secondaryActionText: '' // 次要操作文本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.notificationId = options.id;
      this.loadNotificationDetail();
    } else {
      this.setData({
        loading: false,
        error: '通知ID不存在'
      });
    }
  },

  /**
   * 加载通知详情
   */
  loadNotificationDetail: function () {
    this.setData({
      loading: true,
      error: ''
    });

    app.services.notification.getNotificationDetail(this.notificationId)
      .then(notification => {
        // 标记为已读
        if (!notification.is_read) {
          app.services.notification.markAsRead(this.notificationId)
            .then(() => {
              // 更新通知状态
              notification.is_read = true;
              
              // 更新本地存储中的未读数量
              const unreadCount = wx.getStorageSync('unreadNotificationCount') || 0;
              if (unreadCount > 0) {
                wx.setStorageSync('unreadNotificationCount', unreadCount - 1);
              }
            })
            .catch(err => {
              console.error('标记已读失败:', err);
            });
        }
        
        // 格式化通知数据
        const formattedNotification = this.formatNotification(notification);
        
        // 根据通知类型加载相关内容
        this.loadRelatedContent(notification);
        
        // 设置操作按钮
        this.setupActions(notification);
        
        this.setData({
          notification: formattedNotification,
          loading: false
        });
      })
      .catch(err => {
        console.error('获取通知详情失败:', err);
        this.setData({
          loading: false,
          error: '获取通知详情失败，请重试'
        });
      });
  },

  /**
   * 格式化通知数据
   * @param {Object} notification - 原始通知数据
   * @returns {Object} 格式化后的通知数据
   */
  formatNotification: function (notification) {
    // 格式化时间
    const timeAgo = this.formatTimeAgo(notification.created_at);
    
    // 获取通知类型文本
    const typeText = this.getNotificationTypeText(notification.type);
    
    return {
      ...notification,
      time_ago: timeAgo,
      type_text: typeText
    };
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
      like: '点赞通知',
      point: '积分通知',
      order: '订单通知'
    };
    return typeMap[type] || '其他';
  },

  /**
   * 加载相关内容
   * @param {Object} notification - 通知数据
   */
  loadRelatedContent: function (notification) {
    const relatedContent = [];
    
    // 根据通知类型加载相关内容
    switch (notification.type) {
      case 'comment':
        // 添加相关文章
        if (notification.post_id) {
          relatedContent.push({
            id: notification.post_id,
            type: 'article',
            title: '查看相关文章',
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        // 添加评论者信息
        if (notification.user_id) {
          relatedContent.push({
            id: notification.user_id,
            type: 'user',
            title: '查看评论者信息',
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'follow':
        // 添加关注者信息
        if (notification.follower_id) {
          relatedContent.push({
            id: notification.follower_id,
            type: 'user',
            title: '查看关注者主页',
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'like':
        // 添加相关内容
        if (notification.post_id) {
          relatedContent.push({
            id: notification.post_id,
            type: 'article',
            title: '查看被点赞内容',
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'order':
        // 添加订单信息
        if (notification.order_id) {
          relatedContent.push({
            id: notification.order_id,
            type: 'order',
            title: '查看订单详情',
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
    }
    
    this.setData({
      relatedContent: relatedContent
    });
  },

  /**
   * 设置操作按钮
   * @param {Object} notification - 通知数据
   */
  setupActions: function (notification) {
    // 根据通知类型设置不同的操作按钮
    switch (notification.type) {
      case 'follow':
        this.setData({
          showActions: true,
          primaryActionName: 'followBack',
          primaryActionText: '回关',
          secondaryActionName: 'ignoreFollow',
          secondaryActionText: '忽略'
        });
        break;
      
      case 'comment':
        this.setData({
          showActions: true,
          primaryActionName: 'replyComment',
          primaryActionText: '回复',
          secondaryActionName: '',
          secondaryActionText: ''
        });
        break;
      
      case 'point':
        // 积分变动通知可能有相关操作
        if (notification.action && notification.action.link) {
          this.setData({
            showActions: true,
            primaryActionName: 'goToAction',
            primaryActionText: notification.action.text || '查看详情',
            secondaryActionName: '',
            secondaryActionText: ''
          });
        }
        break;
      
      default:
        this.setData({
          showActions: false
        });
    }
  },

  /**
   * 回关用户
   */
  followBack: function () {
    if (this.data.notification.follower_id) {
      // 调用关注服务
      app.services.following.followUser(this.data.notification.follower_id)
        .then(() => {
          wx.showToast({
            title: '回关成功',
            icon: 'success'
          });
          
          // 更新操作按钮状态
          this.setData({
            showActions: false
          });
        })
        .catch(err => {
          console.error('回关失败:', err);
          wx.showToast({
            title: '回关失败，请重试',
            icon: 'none'
          });
        });
    }
  },

  /**
   * 忽略关注请求
   */
  ignoreFollow: function () {
    wx.showModal({
      title: '确认忽略',
      content: '确定要忽略这个关注请求吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            showActions: false
          });
          wx.showToast({
            title: '已忽略',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 回复评论
   */
  replyComment: function () {
    if (this.data.notification.post_id && this.data.notification.comment_id) {
      wx.navigateTo({
        url: `/pages/article/article?id=${this.data.notification.post_id}&comment_id=${this.data.notification.comment_id}&reply=true`
      });
    }
  },

  /**
   * 跳转到相关操作页面
   */
  goToAction: function () {
    if (this.data.notification.action && this.data.notification.action.link) {
      wx.navigateTo({
        url: this.data.notification.action.link
      });
    }
  },

  /**
   * 点击相关内容
   */
  onRelatedItemClick: function (e) {
    const { id, type } = e.currentTarget.dataset;
    
    switch (type) {
      case 'article':
        wx.navigateTo({
          url: `/pages/article/article?id=${id}`
        });
        break;
      
      case 'user':
        wx.navigateTo({
          url: `/pages/user/profile?id=${id}`
        });
        break;
      
      case 'order':
        wx.navigateTo({
          url: `/pages/order/detail?id=${id}`
        });
        break;
    }
  },

  /**
   * 返回上一页
   */
  onBackPress: function () {
    wx.navigateBack();
    return true;
  }
});