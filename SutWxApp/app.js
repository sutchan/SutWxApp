const i18n = require('./utils/i18n');

/**
 * 搴旂敤鍏ュ彛
 * @returns {void}
 */
App({
  /**
   * 搴旂敤鍚姩鍥炶皟
   * @returns {void}
   */
  onLaunch() {
    try {
      const sys = wx.getSystemInfoSync();
      const lang = (sys.language || '').toLowerCase();
      if (lang.startsWith('en')) {
        i18n.setLocale('en_US');
      } else {
        i18n.setLocale('zh_CN');
      }
    } catch (e) {
      // 鍏煎鐜鏃犵郴缁熶俊鎭殑鍦烘櫙锛屼繚鎸侀粯璁よ瑷€
    }
    this.globalData = {
      startedAt: Date.now()
    };
  },

  /**
   * 搴旂敤鏄剧ず鍥炶皟
   * @returns {void}
   */
  onShow() {
    // 棰勭暀锛氬彲鍦ㄦ涓婃姤鏇濆厜鎴栨媺鍙栧叏灞€閰嶇疆
  },

  /**
   * 鍏ㄥ眬閿欒澶勭悊
   * @param {string} err - 閿欒淇℃伅
   * @returns {void}
   */
  onError(_err) {
    try {
      // 生产环境可移除console，或发送到日志服务
      wx.showToast({ title: '鍙戠敓閿欒', icon: 'none' });
    } catch (_) {
      // 瀹夐潤澶辫触
    }
  }
  }
});
