// pages/user/about/about.js
/**
 * 鍏充簬鎴戜滑椤甸潰 - 鏄剧ず搴旂敤鐨勭浉鍏充俊鎭? */
Page({
  data: {
    appName: 'Sut寰俊灏忕▼搴?,
    appVersion: '1.0.1',
    appDescription: '涓烘偍鎻愪緵浼樿川鐨勫唴瀹规湇鍔?,
    companyName: 'Sut Company',
    copyright: '漏 2024 Sut Company. 淇濈暀鎵€鏈夋潈鍒┿€?,
    contactEmail: 'contact@sut.com',
    website: 'https://sutchan.github.io'
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function() {
    const app = getApp();
    
    this.setData({
      appVersion: app.globalData.appVersion || '1.0.0'
    });
    
    wx.setNavigationBarTitle({
      title: '鍏充簬鎴戜滑'
    });
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 鍙互鍦ㄨ繖閲屾洿鏂伴〉闈㈡暟鎹?  },

  /**
   * 澶嶅埗閭鍦板潃
   */
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactEmail,
      success: () => {
        wx.showToast({
          title: '閭宸插鍒?,
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
  },

  /**
   * 鎵撳紑瀹樻柟缃戠珯
   */
  openWebsite: function() {
    wx.navigateToMiniProgram({
      appId: '', // 濡傛灉鏄烦杞埌鍏朵粬灏忕▼搴?      path: '',
      success: () => {
        console.log('璺宠浆鎴愬姛');
      },
      fail: () => {
        // 濡傛灉娌℃湁鎸囧畾灏忕▼搴忥紝鍒欐墦寮€缃戦〉
        wx.openLocation({
          latitude: 0,
          longitude: 0,
          name: this.data.appName,
          address: this.data.website,
          success: () => {
            console.log('鎵撳紑浣嶇疆鎴愬姛');
          },
          fail: () => {
            // 灏濊瘯鎵撳紑缃戦〉
            wx.showModal({
              title: '鎵撳紑缃戠珯',
              content: '鏄惁璺宠浆鍒板畼鏂圭綉绔欙紵',
              success: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/common/webview/webview?url=' + encodeURIComponent(this.data.website)
                  });
                }
              }
            });
          }
        });
      }
    });
  },

  /**
   * 妫€鏌ユ洿鏂?   */
  checkUpdate: function() {
    const app = getApp();
    app.checkUpdate();
  }
});\n