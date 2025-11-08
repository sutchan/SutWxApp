// pages/user/agreement/agreement.js
/**
 * 鍗忚椤甸潰 - 鏄剧ず鐢ㄦ埛鍗忚鎴栭殣绉佹斂绛栧唴瀹? */
Page({
  data: {
    type: 'user', // 'user' 鎴?'privacy'
    title: '鐢ㄦ埛鍗忚',
    content: '',
    loading: true,
    error: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 鑾峰彇浼犲叆鐨勫崗璁被鍨?    const type = options.type || 'user';
    
    this.setData({
      type: type,
      title: type === 'privacy' ? '闅愮鏀跨瓥' : '鐢ㄦ埛鍗忚'
    });
    
    // 璁剧疆瀵艰埅鏍忔爣棰?    wx.setNavigationBarTitle({
      title: this.data.title
    });
    
    // 鍔犺浇鍗忚鍐呭
    this.loadAgreementContent();
  },

  /**
   * 鍔犺浇鍗忚鍐呭
   */
  loadAgreementContent: function() {
    const app = getApp();
    const url = this.data.type === 'privacy' ? '/agreement/privacy' : '/agreement/user';
    
    app.request({
      url: url,
      method: 'GET',
      success: (res) => {
        if (res.code === 200 && res.data && res.data.content) {
          this.setData({
            content: res.data.content,
            loading: false,
            error: false
          });
        } else {
          console.error('鑾峰彇鍗忚鍐呭澶辫触:', res.message);
          this.setData({
            loading: false,
            error: true,
            content: res.message || '鍐呭鍔犺浇澶辫触'
          });
        }
      },
      fail: (error) => {
        console.error('缃戠粶璇锋眰澶辫触:', error);
        this.setData({
          loading: false,
          error: true,
          content: '缃戠粶寮傚父锛屽唴瀹瑰姞杞藉け璐?
        });
      }
    });
  },

  /**
   * 閲嶆柊鍔犺浇
   */
  reloadContent: function() {
    this.setData({
      loading: true,
      error: false
    });
    this.loadAgreementContent();
  },

  /**
   * 澶嶅埗鍗忚鍐呭
   */
  copyContent: function() {
    wx.setClipboardData({
      data: this.data.content,
      success: () => {
        wx.showToast({
          title: '鍐呭宸插鍒?,
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '澶嶅埗澶辫触',
          icon: 'none'
        });
      }
    });
  }
});\n