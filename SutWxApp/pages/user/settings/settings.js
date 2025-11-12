锘?/ pages/user/settings/settings.js
/**
 * 鐠佸墽鐤嗘い鐢告桨 - 閹绘劒绶甸悽銊﹀煕娑擃亝鈧冨鐠佸墽鐤嗛崪灞界安閻劑鍘ょ純顕€鈧銆? */
Page({
  data: {
    userInfo: null,
    notificationEnabled: true,
    autoPlayEnabled: false,
    darkModeEnabled: false,
    cacheSize: '0MB',
    appVersion: getApp().globalData.appVersion
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function() {
    this.loadUserInfo();
    this.calculateCacheSize();
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕娣団剝浼?   */
  loadUserInfo: function() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        appVersion: app.globalData.appVersion
      });
    }
  },

  /**
   * 鐠侊紕鐣荤紓鎾崇摠婢堆冪毈
   */
  calculateCacheSize: function() {
    wx.getStorageInfoSync({
      success: (res) => {
        // 鐠侊紕鐣荤紓鎾崇摠婢堆冪毈楠炶埖鐗稿蹇撳
        const cacheSize = this.formatSize(res.currentSize);
        this.setData({
          cacheSize: cacheSize
        });
      },
      fail: () => {
        this.setData({
          cacheSize: '0MB'
        });
      }
    });
  },

  /**
   * 閺嶇厧绱￠崠鏍с亣鐏?   */
  formatSize: function(bytes) {
    if (bytes === 0) return '0MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  },

  /**
   * 闁氨鐓＄拋鍓х枂瀵偓閸?   */
  toggleNotification: function(e) {
    const enabled = e.detail.value;
    this.setData({
      notificationEnabled: enabled
    });
    
    // 娣囨繂鐡ㄧ拋鍓х枂閸掔増婀伴崷?    wx.setStorageSync('notificationEnabled', enabled);
    
    // 鏉╂瑩鍣烽崣顖欎簰鐠嬪啰鏁PI娣囨繂鐡ㄩ崚鐗堟箛閸斺€虫珤
    this.saveUserSetting('notification', enabled);
  },

  /**
   * 閼奉亜濮╅幘顓熸杹鐠佸墽鐤嗗鈧崗?   */
  toggleAutoPlay: function(e) {
    const enabled = e.detail.value;
    this.setData({
      autoPlayEnabled: enabled
    });
    
    // 娣囨繂鐡ㄧ拋鍓х枂閸掔増婀伴崷?    wx.setStorageSync('autoPlayEnabled', enabled);
    
    // 鏉╂瑩鍣烽崣顖欎簰鐠嬪啰鏁PI娣囨繂鐡ㄩ崚鐗堟箛閸斺€虫珤
    this.saveUserSetting('autoPlay', enabled);
  },

  /**
   * 濞ｈ精澹婂Ο鈥崇础鐠佸墽鐤嗗鈧崗?   */
  toggleDarkMode: function(e) {
    const enabled = e.detail.value;
    this.setData({
      darkModeEnabled: enabled
    });
    
    // 娣囨繂鐡ㄧ拋鍓х枂閸掔増婀伴崷?    wx.setStorageSync('darkModeEnabled', enabled);
    
    // 鏉╂瑩鍣烽崣顖欎簰鐠嬪啰鏁PI娣囨繂鐡ㄩ崚鐗堟箛閸斺€虫珤
    this.saveUserSetting('darkMode', enabled);
    
    // 閸掑洦宕叉稉濠氼暯
    this.switchTheme(enabled);
  },

  /**
   * 娣囨繂鐡ㄩ悽銊﹀煕鐠佸墽鐤嗛崚鐗堟箛閸斺€虫珤
   */
  saveUserSetting: function(key, value) {
    const app = getApp();
    
    if (!app.isLoggedIn()) return;
    
    app.request({
      url: '/user/settings',
      method: 'POST',
      data: {
        key: key,
        value: value
      },
      success: (res) => {
        if (res.code !== 200) {
          console.error('娣囨繂鐡ㄧ拋鍓х枂婢惰精瑙?', res.message);
        }
      },
      fail: (error) => {
        console.error('娣囨繂鐡ㄧ拋鍓х枂缂冩垹绮舵径杈Е:', error);
      }
    });
  },

  /**
   * 閸掑洦宕叉稉濠氼暯
   */
  switchTheme: function(isDark) {
    // 鏉╂瑩鍣烽崣顖欎簰鐎圭偟骞囨稉濠氼暯閸掑洦宕查柅鏄忕帆
    if (isDark) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      });
    }
  },

  /**
   * 濞撳懘娅庣紓鎾崇摠
   */
  clearCache: function() {
    wx.showModal({
      title: '濞撳懘娅庣紓鎾崇摠',
      content: '绾喖鐣剧憰浣圭闂勩倕绨查悽銊х处鐎涙ê鎮ч敍?,
      success: (res) => {
        if (res.confirm) {
          // 濞撳懘娅庣紓鎾崇摠
          wx.clearStorageSync();
          
          // 闁插秵鏌婇幁銏狀槻閻劍鍩涙穱鈩冧紖閸滃oken
          const app = getApp();
          if (app.globalData.userInfo && app.globalData.token) {
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            wx.setStorageSync('token', app.globalData.token);
          }
          
          this.setData({
            cacheSize: '0MB'
          });
          
          wx.showToast({
            title: '缂傛挸鐡ㄥ鍙夌闂?,
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 閺屻儳婀呴悽銊﹀煕閸楀繗顔?   */
  viewUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement?type=user'
    });
  },

  /**
   * 閺屻儳婀呴梾鎰潌閺€璺ㄧ摜
   */
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement?type=privacy'
    });
  },

  /**
   * 閸忓厖绨幋鎴滄粦
   */
  viewAbout: function() {
    wx.navigateTo({
      url: '/pages/user/about/about'
    });
  },

  /**
   * 閼辨梻閮寸€广垺婀?   */
  contactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      fail: () => {
        wx.showToast({
          title: '閹枫劍澧﹂悽浣冪樈婢惰精瑙?,
          icon: 'none'
        });
      }
    });
  },

  /**
   * 濡偓閺屻儲娲块弬?   */
  checkForUpdates: function() {
    const app = getApp();
    app.checkUpdate();
  }
});\n