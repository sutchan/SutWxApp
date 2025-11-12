锘?/ 闁氨鐓℃い鐢告桨闁槒绶?- 闁插秴鐣鹃崥鎴濆煂缂佺喍绔撮惃鍕偓姘辩叀娑擃厼绺炬い鐢告桨
const app = getApp();

Page({
  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function () {
    // 闁插秴鐣鹃崥鎴濆煂缂佺喍绔撮惃鍕偓姘辩叀娑擃厼绺炬い鐢告桨
    wx.redirectTo({
      url: '/pages/notification/list'
    });
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 濮ｅ繑顐兼い鐢告桨閺勫墽銇氶弮鍫曞櫢閺傛澘濮炴潪鑺ユ殶閹?    this.loadNotifications(true);
    this.loadUnreadCount();
  },

  /**
   * 濡偓閺屻儳鏁ら幋椋庢瑜版洜濮搁幀?   */
  checkLogin: function () {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '鐠囧嘲鍘涢惂璇茬秿',
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
   * 閸旂姾娴囬柅姘辩叀閸掓銆?   * @param {boolean} refresh - 閺勵垰鎯侀崚閿嬫煀閺佺増宓?   */
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

    // 閺嶈宓佺粵娑⑩偓澶嬫蒋娴犳儼顔曠純顔煎棘閺?    if (this.data.activeFilter === 'unread') {
      params.unread_only = true;
    } else if (this.data.activeFilter !== 'all') {
      params.type = this.data.activeFilter;
    }

    app.services.notification.getNotifications(params)
      .then(res => {
        // 閺嶇厧绱￠崠鏍ㄦ闂?        const formattedNotifications = res.notifications.map(item => ({
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

        // 閺囧瓨鏌婇張顏囶嚢閺佷即鍣?        if (refresh) {
          this.loadUnreadCount();
        }
      })
      .catch(err => {
        console.error('閸旂姾娴囬柅姘辩叀婢惰精瑙?', err);
        this.setData({
          loading: false,
          loadingMore: false
        });
        wx.showToast({
          title: '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸',
          icon: 'none'
        });
      });
  },

  /**
   * 閸旂姾娴囬張顏囶嚢闁氨鐓￠弫浼村櫤
   */
  loadUnreadCount: function () {
    app.services.notification.getUnreadNotificationCount()
      .then(count => {
        this.setData({
          unreadCount: count
        });
        // 閺囧瓨鏌妕abBar閻ㄥ嫯顫楅弽?        if (count > 0) {
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
        console.error('閼惧嘲褰囬張顏囶嚢閺佷即鍣烘径杈Е:', err);
      });
  },

  /**
   * 閺囧瓨鏁肩粵娑⑩偓澶嬫蒋娴?   */
  changeFilter: function (e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter: filter
    });
    this.loadNotifications(true);
  },

  /**
   * 閻愮懓鍤柅姘辩叀妞?   */
  onNotificationClick: function (e) {
    const notificationId = e.currentTarget.dataset.id;
    const notification = this.data.notifications.find(item => item.id === notificationId);
    
    // 婵″倹鐏夐弰顖涙弓鐠囧鈧氨鐓￠敍灞藉帥閺嶅洩顔囨稉鍝勫嚒鐠?    if (!notification.is_read) {
      this.markAsRead(notificationId);
    }
    
    // 婢跺嫮鎮婇柅姘辩叀閻愮懓鍤捄瀹犳祮
    app.services.notification.handleNotificationClick(notification);
  },

  /**
   * 閺嶅洩顔囬柅姘辩叀娑撳搫鍑＄拠?   * @param {string} notificationId - 闁氨鐓D
   */
  markAsRead: function (notificationId) {
    app.services.notification.markAsRead(notificationId)
      .then(() => {
        // 閺囧瓨鏌婇張顒€婀撮弫鐗堝祦
        this.setData({
          notifications: this.data.notifications.map(item => 
            item.id === notificationId ? { ...item, is_read: true } : item
          )
        });
        // 閺囧瓨鏌婇張顏囶嚢閺佷即鍣?        this.loadUnreadCount();
      })
      .catch(err => {
        console.error('閺嶅洩顔囧鑼额嚢婢惰精瑙?', err);
      });
  },

  /**
   * 閺嶅洩顔囬崗銊╁劥瀹歌尪顕?   */
  markAllAsRead: function () {
    wx.showModal({
      title: '绾喛顓婚幙宥勭稊',
      content: '绾喖鐣剧亸鍡樺閺堝鈧氨鐓￠弽鍥唶娑撳搫鍑＄拠璇叉偋閿?,
      success: (res) => {
        if (res.confirm) {
          app.services.notification.markAllAsRead()
            .then(() => {
              // 閺囧瓨鏌婇張顒€婀撮弫鐗堝祦
              this.setData({
                notifications: this.data.notifications.map(item => ({ ...item, is_read: true })),
                unreadCount: 0
              });
              // 缁夊娅巘abBar鐟欐帗鐖?              wx.removeTabBarBadge({
                index: 3
              });
              wx.showToast({
                title: '瀹告彃鍙忛柈銊︾垼鐠侀璐熷鑼额嚢',
                icon: 'success'
              });
            })
            .catch(err => {
              console.error('閺嶅洩顔囬崗銊╁劥瀹歌尪顕版径杈Е:', err);
              wx.showToast({
                title: '閹垮秳缍旀径杈Е閿涘矁顕柌宥堢槸',
                icon: 'none'
              });
            });
        }
      }
    });
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
      point: '缁夘垰鍨庨柅姘辩叀',
      order: '鐠併垹宕熼柅姘辩叀'
    };
    return typeMap[type] || '閸忔湹绮?;
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function () {
    this.loadNotifications(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 娑撳﹥濯洪崝鐘烘祰閺囨潙顦?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadNotifications(false);
    }
  }
});\n