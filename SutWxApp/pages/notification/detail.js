// 閫氱煡璇︽儏椤甸潰閫昏緫
const app = getApp();

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    notification: {}, // 閫氱煡璇︽儏
    loading: true, // 鍔犺浇鐘舵€?    error: '', // 閿欒淇℃伅
    relatedContent: [], // 鐩稿叧鍐呭
    showActions: false, // 鏄惁鏄剧ず鎿嶄綔鎸夐挳
    primaryActionName: '', // 涓昏鎿嶄綔鏂规硶鍚?    primaryActionText: '', // 涓昏鎿嶄綔鏂囨湰
    secondaryActionName: '', // 娆¤鎿嶄綔鏂规硶鍚?    secondaryActionText: '' // 娆¤鎿嶄綔鏂囨湰
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    if (options.id) {
      this.notificationId = options.id;
      this.loadNotificationDetail();
    } else {
      this.setData({
        loading: false,
        error: '閫氱煡ID涓嶅瓨鍦?
      });
    }
  },

  /**
   * 鍔犺浇閫氱煡璇︽儏
   */
  loadNotificationDetail: function () {
    this.setData({
      loading: true,
      error: ''
    });

    app.services.notification.getNotificationDetail(this.notificationId)
      .then(notification => {
        // 鏍囪涓哄凡璇?        if (!notification.is_read) {
          app.services.notification.markAsRead(this.notificationId)
            .then(() => {
              // 鏇存柊閫氱煡鐘舵€?              notification.is_read = true;
              
              // 鏇存柊鏈湴瀛樺偍涓殑鏈鏁伴噺
              const unreadCount = wx.getStorageSync('unreadNotificationCount') || 0;
              if (unreadCount > 0) {
                wx.setStorageSync('unreadNotificationCount', unreadCount - 1);
              }
            })
            .catch(err => {
              console.error('鏍囪宸茶澶辫触:', err);
            });
        }
        
        // 鏍煎紡鍖栭€氱煡鏁版嵁
        const formattedNotification = this.formatNotification(notification);
        
        // 鏍规嵁閫氱煡绫诲瀷鍔犺浇鐩稿叧鍐呭
        this.loadRelatedContent(notification);
        
        // 璁剧疆鎿嶄綔鎸夐挳
        this.setupActions(notification);
        
        this.setData({
          notification: formattedNotification,
          loading: false
        });
      })
      .catch(err => {
        console.error('鑾峰彇閫氱煡璇︽儏澶辫触:', err);
        this.setData({
          loading: false,
          error: '鑾峰彇閫氱煡璇︽儏澶辫触锛岃閲嶈瘯'
        });
      });
  },

  /**
   * 鏍煎紡鍖栭€氱煡鏁版嵁
   * @param {Object} notification - 鍘熷閫氱煡鏁版嵁
   * @returns {Object} 鏍煎紡鍖栧悗鐨勯€氱煡鏁版嵁
   */
  formatNotification: function (notification) {
    // 鏍煎紡鍖栨椂闂?    const timeAgo = this.formatTimeAgo(notification.created_at);
    
    // 鑾峰彇閫氱煡绫诲瀷鏂囨湰
    const typeText = this.getNotificationTypeText(notification.type);
    
    return {
      ...notification,
      time_ago: timeAgo,
      type_text: typeText
    };
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
   * 鍔犺浇鐩稿叧鍐呭
   * @param {Object} notification - 閫氱煡鏁版嵁
   */
  loadRelatedContent: function (notification) {
    const relatedContent = [];
    
    // 鏍规嵁閫氱煡绫诲瀷鍔犺浇鐩稿叧鍐呭
    switch (notification.type) {
      case 'comment':
        // 娣诲姞鐩稿叧鏂囩珷
        if (notification.post_id) {
          relatedContent.push({
            id: notification.post_id,
            type: 'article',
            title: '鏌ョ湅鐩稿叧鏂囩珷',
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        // 娣诲姞璇勮鑰呬俊鎭?        if (notification.user_id) {
          relatedContent.push({
            id: notification.user_id,
            type: 'user',
            title: '鏌ョ湅璇勮鑰呬俊鎭?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'follow':
        // 娣诲姞鍏虫敞鑰呬俊鎭?        if (notification.follower_id) {
          relatedContent.push({
            id: notification.follower_id,
            type: 'user',
            title: '鏌ョ湅鍏虫敞鑰呬富椤?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'like':
        // 娣诲姞鐩稿叧鍐呭
        if (notification.post_id) {
          relatedContent.push({
            id: notification.post_id,
            type: 'article',
            title: '鏌ョ湅琚偣璧炲唴瀹?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'order':
        // 娣诲姞璁㈠崟淇℃伅
        if (notification.order_id) {
          relatedContent.push({
            id: notification.order_id,
            type: 'order',
            title: '鏌ョ湅璁㈠崟璇︽儏',
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
   * 璁剧疆鎿嶄綔鎸夐挳
   * @param {Object} notification - 閫氱煡鏁版嵁
   */
  setupActions: function (notification) {
    // 鏍规嵁閫氱煡绫诲瀷璁剧疆涓嶅悓鐨勬搷浣滄寜閽?    switch (notification.type) {
      case 'follow':
        this.setData({
          showActions: true,
          primaryActionName: 'followBack',
          primaryActionText: '鍥炲叧',
          secondaryActionName: 'ignoreFollow',
          secondaryActionText: '蹇界暐'
        });
        break;
      
      case 'comment':
        this.setData({
          showActions: true,
          primaryActionName: 'replyComment',
          primaryActionText: '鍥炲',
          secondaryActionName: '',
          secondaryActionText: ''
        });
        break;
      
      case 'point':
        // 绉垎鍙樺姩閫氱煡鍙兘鏈夌浉鍏虫搷浣?        if (notification.action && notification.action.link) {
          this.setData({
            showActions: true,
            primaryActionName: 'goToAction',
            primaryActionText: notification.action.text || '鏌ョ湅璇︽儏',
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
   * 鍥炲叧鐢ㄦ埛
   */
  followBack: function () {
    if (this.data.notification.follower_id) {
      // 璋冪敤鍏虫敞鏈嶅姟
      app.services.following.followUser(this.data.notification.follower_id)
        .then(() => {
          wx.showToast({
            title: '鍥炲叧鎴愬姛',
            icon: 'success'
          });
          
          // 鏇存柊鎿嶄綔鎸夐挳鐘舵€?          this.setData({
            showActions: false
          });
        })
        .catch(err => {
          console.error('鍥炲叧澶辫触:', err);
          wx.showToast({
            title: '鍥炲叧澶辫触锛岃閲嶈瘯',
            icon: 'none'
          });
        });
    }
  },

  /**
   * 蹇界暐鍏虫敞璇锋眰
   */
  ignoreFollow: function () {
    wx.showModal({
      title: '纭蹇界暐',
      content: '纭畾瑕佸拷鐣ヨ繖涓叧娉ㄨ姹傚悧锛?,
      success: (res) => {
        if (res.confirm) {
          this.setData({
            showActions: false
          });
          wx.showToast({
            title: '宸插拷鐣?,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 鍥炲璇勮
   */
  replyComment: function () {
    if (this.data.notification.post_id && this.data.notification.comment_id) {
      wx.navigateTo({
        url: `/pages/article/article?id=${this.data.notification.post_id}&comment_id=${this.data.notification.comment_id}&reply=true`
      });
    }
  },

  /**
   * 璺宠浆鍒扮浉鍏虫搷浣滈〉闈?   */
  goToAction: function () {
    if (this.data.notification.action && this.data.notification.action.link) {
      wx.navigateTo({
        url: this.data.notification.action.link
      });
    }
  },

  /**
   * 鐐瑰嚮鐩稿叧鍐呭
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
   * 杩斿洖涓婁竴椤?   */
  onBackPress: function () {
    wx.navigateBack();
    return true;
  }
});