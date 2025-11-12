锘?/ 闁氨鐓＄拠锔藉剰妞ょ敻娼伴柅鏄忕帆
const app = getApp();

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    notification: {}, // 闁氨鐓＄拠锔藉剰
    loading: true, // 閸旂姾娴囬悩鑸碘偓?    error: '', // 闁挎瑨顕ゆ穱鈩冧紖
    relatedContent: [], // 閻╃鍙ч崘鍛啇
    showActions: false, // 閺勵垰鎯侀弰鍓с仛閹垮秳缍旈幐澶愭尦
    primaryActionName: '', // 娑撴槒顩﹂幙宥勭稊閺傝纭堕崥?    primaryActionText: '', // 娑撴槒顩﹂幙宥勭稊閺傚洦婀?    secondaryActionName: '', // 濞喡ゎ洣閹垮秳缍旈弬瑙勭《閸?    secondaryActionText: '' // 濞喡ゎ洣閹垮秳缍旈弬鍥ㄦ拱
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    if (options.id) {
      this.notificationId = options.id;
      this.loadNotificationDetail();
    } else {
      this.setData({
        loading: false,
        error: '闁氨鐓D娑撳秴鐡ㄩ崷?
      });
    }
  },

  /**
   * 閸旂姾娴囬柅姘辩叀鐠囷附鍎?   */
  loadNotificationDetail: function () {
    this.setData({
      loading: true,
      error: ''
    });

    app.services.notification.getNotificationDetail(this.notificationId)
      .then(notification => {
        // 閺嶅洩顔囨稉鍝勫嚒鐠?        if (!notification.is_read) {
          app.services.notification.markAsRead(this.notificationId)
            .then(() => {
              // 閺囧瓨鏌婇柅姘辩叀閻樿埖鈧?              notification.is_read = true;
              
              // 閺囧瓨鏌婇張顒€婀寸€涙ê鍋嶆稉顓犳畱閺堫亣顕伴弫浼村櫤
              const unreadCount = wx.getStorageSync('unreadNotificationCount') || 0;
              if (unreadCount > 0) {
                wx.setStorageSync('unreadNotificationCount', unreadCount - 1);
              }
            })
            .catch(err => {
              console.error('閺嶅洩顔囧鑼额嚢婢惰精瑙?', err);
            });
        }
        
        // 閺嶇厧绱￠崠鏍偓姘辩叀閺佺増宓?        const formattedNotification = this.formatNotification(notification);
        
        // 閺嶈宓侀柅姘辩叀缁鐎烽崝鐘烘祰閻╃鍙ч崘鍛啇
        this.loadRelatedContent(notification);
        
        // 鐠佸墽鐤嗛幙宥勭稊閹稿鎸?        this.setupActions(notification);
        
        this.setData({
          notification: formattedNotification,
          loading: false
        });
      })
      .catch(err => {
        console.error('閼惧嘲褰囬柅姘辩叀鐠囷附鍎忔径杈Е:', err);
        this.setData({
          loading: false,
          error: '閼惧嘲褰囬柅姘辩叀鐠囷附鍎忔径杈Е閿涘矁顕柌宥堢槸'
        });
      });
  },

  /**
   * 閺嶇厧绱￠崠鏍偓姘辩叀閺佺増宓?   * @param {Object} notification - 閸樼喎顫愰柅姘辩叀閺佺増宓?   * @returns {Object} 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫰鈧氨鐓￠弫鐗堝祦
   */
  formatNotification: function (notification) {
    // 閺嶇厧绱￠崠鏍ㄦ闂?    const timeAgo = this.formatTimeAgo(notification.created_at);
    
    // 閼惧嘲褰囬柅姘辩叀缁鐎烽弬鍥ㄦ拱
    const typeText = this.getNotificationTypeText(notification.type);
    
    return {
      ...notification,
      time_ago: timeAgo,
      type_text: typeText
    };
  },

  /**
   * 閺嶇厧绱￠崠鏍ㄦ闂傜繝璐熼惄绋款嚠閺冨爼妫?   * @param {string} time - 閺冨爼妫跨€涙顑佹稉?   * @returns {string} 閻╃顕弮鍫曟？閺傚洦婀?   */
  formatTimeAgo: function (time) {
    const now = new Date();
    const past = new Date(time);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return '閸掓艾鍨?;
    } else if (diffMins < 60) {
      return `${diffMins}閸掑棝鎸撻崜宄?
    } else if (diffHours < 24) {
      return `${diffHours}鐏忓繑妞傞崜宄?
    } else if (diffDays < 7) {
      return `${diffDays}婢垛晛澧燻;
    } else {
      return past.toLocaleDateString();
    }
  },

  /**
   * 閼惧嘲褰囬柅姘辩叀缁鐎烽弬鍥ㄦ拱
   * @param {string} type - 闁氨鐓＄猾璇茬€?   * @returns {string} 缁鐎烽弬鍥ㄦ拱
   */
  getNotificationTypeText: function (type) {
    const typeMap = {
      system: '缁崵绮洪柅姘辩叀',
      comment: '鐠囧嫯顔戦柅姘辩叀',
      follow: '閸忚櫕鏁為柅姘辩叀',
      like: '閻愮绂愰柅姘辩叀',
      point: '缁夘垰鍨庨柅姘辩叀',
      order: '鐠併垹宕熼柅姘辩叀'
    };
    return typeMap[type] || '閸忔湹绮?;
  },

  /**
   * 閸旂姾娴囬惄绋垮彠閸愬懎顔?   * @param {Object} notification - 闁氨鐓￠弫鐗堝祦
   */
  loadRelatedContent: function (notification) {
    const relatedContent = [];
    
    // 閺嶈宓侀柅姘辩叀缁鐎烽崝鐘烘祰閻╃鍙ч崘鍛啇
    switch (notification.type) {
      case 'comment':
        // 濞ｈ濮為惄绋垮彠閺傚洨鐝?        if (notification.post_id) {
          relatedContent.push({
            id: notification.post_id,
            type: 'article',
            title: '閺屻儳婀呴惄绋垮彠閺傚洨鐝?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        // 濞ｈ濮炵拠鍕啈閼板懍淇婇幁?        if (notification.user_id) {
          relatedContent.push({
            id: notification.user_id,
            type: 'user',
            title: '閺屻儳婀呯拠鍕啈閼板懍淇婇幁?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'follow':
        // 濞ｈ濮為崗铏暈閼板懍淇婇幁?        if (notification.follower_id) {
          relatedContent.push({
            id: notification.follower_id,
            type: 'user',
            title: '閺屻儳婀呴崗铏暈閼板懍瀵屾い?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'like':
        // 濞ｈ濮為惄绋垮彠閸愬懎顔?        if (notification.post_id) {
          relatedContent.push({
            id: notification.post_id,
            type: 'article',
            title: '閺屻儳婀呯悮顐ゅ仯鐠х偛鍞寸€?,
            time_ago: this.formatTimeAgo(notification.created_at)
          });
        }
        break;
      
      case 'order':
        // 濞ｈ濮炵拋銏犲礋娣団剝浼?        if (notification.order_id) {
          relatedContent.push({
            id: notification.order_id,
            type: 'order',
            title: '閺屻儳婀呯拋銏犲礋鐠囷附鍎?,
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
   * 鐠佸墽鐤嗛幙宥勭稊閹稿鎸?   * @param {Object} notification - 闁氨鐓￠弫鐗堝祦
   */
  setupActions: function (notification) {
    // 閺嶈宓侀柅姘辩叀缁鐎风拋鍓х枂娑撳秴鎮撻惃鍕惙娴ｆ粍瀵滈柦?    switch (notification.type) {
      case 'follow':
        this.setData({
          showActions: true,
          primaryActionName: 'followBack',
          primaryActionText: '閸ョ偛鍙?,
          secondaryActionName: 'ignoreFollow',
          secondaryActionText: '韫囩晫鏆?
        });
        break;
      
      case 'comment':
        this.setData({
          showActions: true,
          primaryActionName: 'replyComment',
          primaryActionText: '閸ョ偛顦?,
          secondaryActionName: '',
          secondaryActionText: ''
        });
        break;
      
      case 'point':
        // 缁夘垰鍨庨崣妯哄З闁氨鐓￠崣顖濆厴閺堝娴夐崗铏惙娴?        if (notification.action && notification.action.link) {
          this.setData({
            showActions: true,
            primaryActionName: 'goToAction',
            primaryActionText: notification.action.text || '閺屻儳婀呯拠锔藉剰',
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
   * 閸ョ偛鍙ч悽銊﹀煕
   */
  followBack: function () {
    if (this.data.notification.follower_id) {
      // 鐠嬪啰鏁ら崗铏暈閺堝秴濮?      app.services.following.followUser(this.data.notification.follower_id)
        .then(() => {
          wx.showToast({
            title: '閸ョ偛鍙ч幋鎰',
            icon: 'success'
          });
          
          // 閺囧瓨鏌婇幙宥勭稊閹稿鎸抽悩鑸碘偓?          this.setData({
            showActions: false
          });
        })
        .catch(err => {
          console.error('閸ョ偛鍙ф径杈Е:', err);
          wx.showToast({
            title: '閸ョ偛鍙ф径杈Е閿涘矁顕柌宥堢槸',
            icon: 'none'
          });
        });
    }
  },

  /**
   * 韫囩晫鏆愰崗铏暈鐠囬攱鐪?   */
  ignoreFollow: function () {
    wx.showModal({
      title: '绾喛顓昏箛鐣屾殣',
      content: '绾喖鐣剧憰浣告嫹閻ｃ儴绻栨稉顏勫彠濞夈劏顕Ч鍌氭偋閿?,
      success: (res) => {
        if (res.confirm) {
          this.setData({
            showActions: false
          });
          wx.showToast({
            title: '瀹告彃鎷烽悾?,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 閸ョ偛顦茬拠鍕啈
   */
  replyComment: function () {
    if (this.data.notification.post_id && this.data.notification.comment_id) {
      wx.navigateTo({
        url: `/pages/article/article?id=${this.data.notification.post_id}&comment_id=${this.data.notification.comment_id}&reply=true`
      });
    }
  },

  /**
   * 鐠哄疇娴嗛崚鎵祲閸忚櫕鎼锋担婊堛€夐棃?   */
  goToAction: function () {
    if (this.data.notification.action && this.data.notification.action.link) {
      wx.navigateTo({
        url: this.data.notification.action.link
      });
    }
  },

  /**
   * 閻愮懓鍤惄绋垮彠閸愬懎顔?   */
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
   * 鏉╂柨娲栨稉濠佺妞?   */
  onBackPress: function () {
    wx.navigateBack();
    return true;
  }
});\n