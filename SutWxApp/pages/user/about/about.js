锘?/ pages/user/about/about.js
/**
 * 閸忓厖绨幋鎴滄粦妞ょ敻娼?- 閺勫墽銇氭惔鏃傛暏閻ㄥ嫮娴夐崗鍏呬繆閹? */
Page({
  data: {
    appName: 'Sut瀵邦喕淇婄亸蹇曗柤鎼?,
    appVersion: '1.0.1',
    appDescription: '娑撶儤鍋嶉幓鎰返娴兼宸濋惃鍕敶鐎硅婀囬崝?,
    companyName: 'Sut Company',
    copyright: '婕?2024 Sut Company. 娣囨繄鏆€閹碘偓閺堝娼堥崚鈹库偓?,
    contactEmail: 'contact@sut.com',
    website: 'https://sutchan.github.io'
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function() {
    const app = getApp();
    
    this.setData({
      appVersion: app.globalData.appVersion || '1.0.0'
    });
    
    wx.setNavigationBarTitle({
      title: '閸忓厖绨幋鎴滄粦'
    });
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 閸欘垯浜掗崷銊ㄧ箹闁插本娲块弬浼淬€夐棃銏℃殶閹?  },

  /**
   * 婢跺秴鍩楅柇顔绢唸閸︽澘娼?   */
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactEmail,
      success: () => {
        wx.showToast({
          title: '闁喚顔堝鎻掝槻閸?,
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '婢跺秴鍩楁径杈Е',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 閹垫挸绱戠€规ɑ鏌熺純鎴犵彲
   */
  openWebsite: function() {
    wx.navigateToMiniProgram({
      appId: '', // 婵″倹鐏夐弰顖濈儲鏉烆剙鍩岄崗鏈电铂鐏忓繒鈻兼惔?      path: '',
      success: () => {
        console.log('鐠哄疇娴嗛幋鎰');
      },
      fail: () => {
        // 婵″倹鐏夊▽鈩冩箒閹稿洤鐣剧亸蹇曗柤鎼村骏绱濋崚娆愬ⅵ瀵偓缂冩垿銆?        wx.openLocation({
          latitude: 0,
          longitude: 0,
          name: this.data.appName,
          address: this.data.website,
          success: () => {
            console.log('閹垫挸绱戞担宥囩枂閹存劕濮?);
          },
          fail: () => {
            // 鐏忔繆鐦幍鎾崇磻缂冩垿銆?            wx.showModal({
              title: '閹垫挸绱戠純鎴犵彲',
              content: '閺勵垰鎯佺捄瀹犳祮閸掓澘鐣奸弬鍦秹缁旀瑱绱?,
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
   * 濡偓閺屻儲娲块弬?   */
  checkUpdate: function() {
    const app = getApp();
    app.checkUpdate();
  }
});\n