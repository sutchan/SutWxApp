/**
 * 鏂囦欢鍚? detail.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-30
 * 鎻忚堪: 閫氱煡璇︽儏椤甸潰
 */
const notificationService = require('../../services/notificationService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?
   */
  data: {
    notification: null,
    loading: true,
    notificationId: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        notificationId: options.id
      });
      this.loadNotificationDetail(options.id);
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    if (this.data.notificationId) {
      this.loadNotificationDetail(this.data.notificationId);
    }
  },

  /**
   * 鍔犺浇閫氱煡璇︽儏
   * @param {string} id - 閫氱煡ID
   */
  loadNotificationDetail: function (id) {
    if (!id) return;
    
    this.setData({
      loading: true
    });
    
    notificationService.getNotificationDetail(id)
      .then(res => {
        this.setData({
          notification: res,
          loading: false
        });
        
        // 鏍囪涓哄凡璇?
        if (!res.isRead) {
          notificationService.markAsRead(id)
            .catch(err => {
              console.error('鏍囪閫氱煡涓哄凡璇诲け璐?', err);
            });
        }
      })
      .catch(err => {
        this.setData({
          loading: false
        });
        
        wx.showToast({
          title: err.message || '鍔犺浇閫氱煡璇︽儏澶辫触',
          icon: 'none'
        });
        
        // 寤惰繜杩斿洖涓婁竴椤?
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      });
  },

  /**
   * 鐐瑰嚮鎿嶄綔鎸夐挳
   */
  onActionTap: function () {
    const { notification } = this.data;
    if (notification && notification.actionUrl) {
      this.navigateToUrl(notification.actionUrl);
    }
  },

  /**
   * 鐐瑰嚮鐩稿叧閾炬帴
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onLinkTap: function (e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      this.navigateToUrl(url);
    }
  },

  /**
   * 璺宠浆鍒版寚瀹歎RL
   * @param {string} url - 鐩爣URL
   */
  navigateToUrl: function (url) {
    if (!url) return;
    
    // 鍒ゆ柇URL绫诲瀷锛岃繘琛岀浉搴旂殑璺宠浆
    if (url.startsWith('/')) {
      // 鍐呴儴椤甸潰璺宠浆
      wx.navigateTo({
        url: url
      });
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // 澶栭儴閾炬帴璺宠浆
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
      });
    } else {
      // 鍏朵粬绫诲瀷閾炬帴
      console.error('涓嶆敮鎸佺殑URL绫诲瀷:', url);
      wx.showToast({
        title: '涓嶆敮鎸佺殑閾炬帴绫诲瀷',
        icon: 'none'
      });
    }
  },

  /**
   * 鍒嗕韩鍔熻兘
   */
  onShareAppMessage: function () {
    const { notification } = this.data;
    return {
      title: notification ? notification.title : '閫氱煡璇︽儏',
      path: `/pages/notification/detail/detail?id=${this.data.notificationId}`
    };
  }
});