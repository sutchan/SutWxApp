锘?/ 闁氨鐓℃稉顓炵妇妞ょ敻娼伴柅鏄忕帆
const app = getApp();

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    notifications: [], // 闁氨鐓￠崚妤勩€?    activeFilter: 'all', // 瑜版挸澧犲┑鈧ú鑽ゆ畱缁涙盯鈧娼禒?    loading: false, // 閸旂姾娴囬悩鑸碘偓?    loadingMore: false, // 閸旂姾娴囬弴鏉戭樋閻樿埖鈧?    page: 1, // 瑜版挸澧犳い鐢电垳
    perPage: 10, // 濮ｅ繘銆夐弫浼村櫤
    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    unreadCount: 0 // 閺堫亣顕伴柅姘辩叀閺佷即鍣?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function () {
    this.checkLogin();
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
      // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?      const queryParams = {
        page: refresh ? 1 : this.data.page,
        per_page: this.data.perPage
      };

      // 閺嶈宓佺粵娑⑩偓澶嬫蒋娴犺埖鍧婇崝鐘插棘閺?      switch (this.data.activeFilter) {
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

      // 鐠嬪啰鏁ら柅姘辩叀閺堝秴濮熼懢宄板絿閸掓銆?      const result = await app.services.notification.getNotifications(queryParams);

      // 閺嶇厧绱￠崠鏍偓姘辩叀閺佺増宓?      const formattedNotifications = result.data.map(notification => {
        return {
          ...notification,
          time_ago: this.formatTimeAgo(notification.created_at),
          type_text: this.getNotificationTypeText(notification.type),
          is_read: notification.read || false
        };
      });

      // 閺囧瓨鏌婇弫鐗堝祦
      if (refresh) {
        this.setData({
          notifications: formattedNotifications,
          page: 2, // 娑撳顐奸崝鐘烘祰缁?妞?          hasMore: formattedNotifications.length >= this.data.perPage
        });
      } else {
        this.setData({
          notifications: [...this.data.notifications, ...formattedNotifications],
          page: this.data.page + 1,
          hasMore: formattedNotifications.length >= this.data.perPage
        });
      }
    } catch (err) {
      console.error('閼惧嘲褰囬柅姘辩叀閸掓銆冩径杈Е:', err);
      wx.showToast({
        title: '閼惧嘲褰囬柅姘辩叀婢惰精瑙﹂敍宀冾嚞闁插秷鐦?,
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
            index: 3, // 閸嬪洩顔曢柅姘辩叀tab閸︺劎鍌ㄥ?娴ｅ秶鐤?            text: count > 99 ? '99+' : count.toString()
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
        const updatedNotifications = this.data.notifications.map(item => {
          if (item.id === notificationId) {
            return { ...item, is_read: true };
          }
          return item;
        });
        
        this.setData({
          notifications: updatedNotifications
        });
        
        // 閺囧瓨鏌婇張顏囶嚢閺佷即鍣?        this.data.unreadCount = Math.max(0, this.data.unreadCount - 1);
        this.setData({ unreadCount: this.data.unreadCount });
        
        // 閺囧瓨鏌妕abBar鐟欐帗鐖?        if (this.data.unreadCount > 0) {
          wx.setTabBarBadge({
            index: 3, // 閸嬪洩顔曢柅姘辩叀tab閸︺劎鍌ㄥ?娴ｅ秶鐤?            text: this.data.unreadCount > 99 ? '99+' : this.data.unreadCount.toString()
          });
        } else {
          wx.removeTabBarBadge({
            index: 3
          });
        }
      })
      .catch(err => {
        console.error('閺嶅洩顔囧鑼额嚢婢惰精瑙?', err);
      });
  },
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
            } catch (err) {
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
      like: '閻愮绂愰柅姘辩叀',
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