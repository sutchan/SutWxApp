// pages/user/settings/settings.js
/**
 * 璁剧疆椤甸潰 - 鎻愪緵鐢ㄦ埛涓€у寲璁剧疆鍜屽簲鐢ㄩ厤缃€夐」
 */
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function() {
    this.loadUserInfo();
    this.calculateCacheSize();
  },

  /**
   * 鍔犺浇鐢ㄦ埛淇℃伅
   */
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
   * 璁＄畻缂撳瓨澶у皬
   */
  calculateCacheSize: function() {
    wx.getStorageInfoSync({
      success: (res) => {
        // 璁＄畻缂撳瓨澶у皬骞舵牸寮忓寲
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
   * 鏍煎紡鍖栧ぇ灏?   */
  formatSize: function(bytes) {
    if (bytes === 0) return '0MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  },

  /**
   * 閫氱煡璁剧疆寮€鍏?   */
  toggleNotification: function(e) {
    const enabled = e.detail.value;
    this.setData({
      notificationEnabled: enabled
    });
    
    // 淇濆瓨璁剧疆鍒版湰鍦?    wx.setStorageSync('notificationEnabled', enabled);
    
    // 杩欓噷鍙互璋冪敤API淇濆瓨鍒版湇鍔″櫒
    this.saveUserSetting('notification', enabled);
  },

  /**
   * 鑷姩鎾斁璁剧疆寮€鍏?   */
  toggleAutoPlay: function(e) {
    const enabled = e.detail.value;
    this.setData({
      autoPlayEnabled: enabled
    });
    
    // 淇濆瓨璁剧疆鍒版湰鍦?    wx.setStorageSync('autoPlayEnabled', enabled);
    
    // 杩欓噷鍙互璋冪敤API淇濆瓨鍒版湇鍔″櫒
    this.saveUserSetting('autoPlay', enabled);
  },

  /**
   * 娣辫壊妯″紡璁剧疆寮€鍏?   */
  toggleDarkMode: function(e) {
    const enabled = e.detail.value;
    this.setData({
      darkModeEnabled: enabled
    });
    
    // 淇濆瓨璁剧疆鍒版湰鍦?    wx.setStorageSync('darkModeEnabled', enabled);
    
    // 杩欓噷鍙互璋冪敤API淇濆瓨鍒版湇鍔″櫒
    this.saveUserSetting('darkMode', enabled);
    
    // 鍒囨崲涓婚
    this.switchTheme(enabled);
  },

  /**
   * 淇濆瓨鐢ㄦ埛璁剧疆鍒版湇鍔″櫒
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
          console.error('淇濆瓨璁剧疆澶辫触:', res.message);
        }
      },
      fail: (error) => {
        console.error('淇濆瓨璁剧疆缃戠粶澶辫触:', error);
      }
    });
  },

  /**
   * 鍒囨崲涓婚
   */
  switchTheme: function(isDark) {
    // 杩欓噷鍙互瀹炵幇涓婚鍒囨崲閫昏緫
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
   * 娓呴櫎缂撳瓨
   */
  clearCache: function() {
    wx.showModal({
      title: '娓呴櫎缂撳瓨',
      content: '纭畾瑕佹竻闄ゅ簲鐢ㄧ紦瀛樺悧锛?,
      success: (res) => {
        if (res.confirm) {
          // 娓呴櫎缂撳瓨
          wx.clearStorageSync();
          
          // 閲嶆柊鎭㈠鐢ㄦ埛淇℃伅鍜宼oken
          const app = getApp();
          if (app.globalData.userInfo && app.globalData.token) {
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            wx.setStorageSync('token', app.globalData.token);
          }
          
          this.setData({
            cacheSize: '0MB'
          });
          
          wx.showToast({
            title: '缂撳瓨宸叉竻闄?,
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 鏌ョ湅鐢ㄦ埛鍗忚
   */
  viewUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement?type=user'
    });
  },

  /**
   * 鏌ョ湅闅愮鏀跨瓥
   */
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement?type=privacy'
    });
  },

  /**
   * 鍏充簬鎴戜滑
   */
  viewAbout: function() {
    wx.navigateTo({
      url: '/pages/user/about/about'
    });
  },

  /**
   * 鑱旂郴瀹㈡湇
   */
  contactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      fail: () => {
        wx.showToast({
          title: '鎷ㄦ墦鐢佃瘽澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 妫€鏌ユ洿鏂?   */
  checkForUpdates: function() {
    const app = getApp();
    app.checkUpdate();
  }
});\n