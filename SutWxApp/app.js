/**
 * 鏂囦欢鍚? app.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-27
 * 浣滆€? Sut
 * 灏忕▼搴忓叆鍙ｆ枃浠讹紝璐熻矗鍒濆鍖栧叏灞€鏈嶅姟銆佺姸鎬佺鐞嗗拰缁勪欢娉ㄥ唽
 */

const i18n = require('./utils/i18n');
const store = require('./utils/store.js');
const componentManager = require('./components');
const cacheService = require('./utils/cacheService.js').instance;
const cacheConfig = require('./utils/cacheConfig.js').getConfig();
const webSocketService = require('./utils/webSocketService.js').instance;

/**
 * 搴旂敤鍏ュ彛
 * @returns {void}
 */
App({
  /**
   * 搴旂敤鍚姩鍥炶皟
   * @returns {void}
   */
  onLaunch() {
    // 鍒濆鍖栧叏灞€鐘舵€?    this.globalData = {
      startedAt: Date.now(),
      websocketConnected: false
    };
    
    // 鍒濆鍖栫姸鎬佺鐞?    this.initStore();
    
    // 鍒濆鍖栧浗闄呭寲
    this.initI18n();
    
    // 鍒濆鍖栫紦瀛樻湇鍔?    this.initCache();
    
    // 鍒濆鍖栫粍浠?    this.initComponents();
    
    // 鍒濆鍖朩ebSocket鏈嶅姟
    this.initWebSocket();
    
    // 鍒濆鍖栭敊璇鐞?    this.initErrorHandler();
  },

  /**
   * 鍒濆鍖栧叏灞€鐘舵€佺鐞?   * @returns {void}
   */
  initStore() {
    // 浠庢湰鍦板瓨鍌ㄦ仮澶嶇姸鎬?    store.restore();
    
    // 灏唖tore鎸傝浇鍒癮pp瀹炰緥涓婏紝鏂逛究璁块棶
    this.globalData.store = store;
  },
  
  /**
   * 鍒濆鍖栬瑷€璁剧疆
   * @returns {void}
   */
  initLanguage() {
    try {
      const sys = wx.getSystemInfoSync();
      const lang = (sys.language || '').toLowerCase();
      if (lang.startsWith('en')) {
        i18n.setLocale('en_US');
      } else {
        i18n.setLocale('zh_CN');
      }
    } catch {
      // 鍏煎鏃犵郴缁熶俊鎭殑鍦烘櫙锛屼繚鎸侀粯璁よ瑷€
    }
  },
  
  /**
   * 鍒濆鍖栧叏灞€閿欒澶勭悊
   * @returns {void}
   */
  initErrorHandler() {
    wx.onError((error) => {
      console.error('App Error:', error);
      
      // 鏇存柊store涓殑閿欒鐘舵€?      if (this.globalData.store) {
        store.commit('SET_ERROR', error);
      }
      
      try {
        wx.showToast({ title: '鍙戠敓閿欒', icon: 'none' });
      } catch {
        // 闈欓粯澶辫触
      }
    });
  },

  /**
   * 鍒濆鍖栧叏灞€缁勪欢
   * @returns {void}
   */
  initComponents() {
    componentManager.registerGlobalComponents(this);
  },
  
  /**
   * 鍒濆鍖栫紦瀛樻湇鍔?   * @returns {Promise<void>}
   */
  async initCache() {
    try {
      // 鍒濆鍖栫紦瀛樻湇鍔?      await cacheService.init(cacheConfig);
      console.log('缂撳瓨鏈嶅姟鍒濆鍖栨垚鍔?);
      
      // 鐩戝惉缃戠粶鐘舵€佸彉鍖栵紝鑷姩娓呯悊杩囨湡缂撳瓨
      wx.onNetworkStatusChange((res) => {
        if (res.isConnected) {
          console.log('缃戠粶宸茶繛鎺ワ紝寮€濮嬫竻鐞嗚繃鏈熺紦瀛?);
          cacheService.cleanupExpired();
          // 缃戠粶鎭㈠鏃讹紝灏濊瘯閲嶈繛WebSocket
          if (this.globalData.userInfo) {
            console.log('灏濊瘯閲嶆柊杩炴帴WebSocket...');
            webSocketService.connect();
          }
        } else {
          console.log('缃戠粶鏂紑杩炴帴');
        }
      });
    } catch (error) {
      console.error('缂撳瓨鏈嶅姟鍒濆鍖栧け璐?', error);
    }
  },
  
  /**
   * 鍒濆鍖栧浗闄呭寲
   * @returns {void}
   */
  initI18n() {
    this.initLanguage();
  },
  
  /**
   * 鍒濆鍖朩ebSocket鏈嶅姟
   * @returns {Promise<void>}
   */
  async initWebSocket() {
    try {
      // 鍙湁鍦ㄧ敤鎴峰凡鐧诲綍鐨勬儏鍐典笅鎵嶅垵濮嬪寲WebSocket
      const userInfo = store.getState('user.userInfo');
      const token = store.getState('user.token');
      
      if (userInfo && token) {
        // 鍙敞鍐屼竴娆＄洃鍚櫒
        if (!this._webSocketListenersRegistered) {
          // 娉ㄥ唽WebSocket浜嬩欢鐩戝惉鍣?          this._registerWebSocketListeners();
          this._webSocketListenersRegistered = true;
        }
        
        // 寤虹珛WebSocket杩炴帴
        await webSocketService.connect();
      }
    } catch (error) {
      console.error('WebSocket鍒濆鍖栧け璐?', error);
    }
  },
  
  /**
   * 娉ㄥ唽WebSocket浜嬩欢鐩戝惉鍣?   * @private
   * @returns {void}
   */
  _registerWebSocketListeners() {
    // 鐩戝惉杩炴帴鐘舵€佸彉鍖?    webSocketService.on('connected', () => {
      console.log('WebSocket杩炴帴鎴愬姛');
      this.globalData.websocketConnected = true;
    });
    
    webSocketService.on('disconnected', () => {
      console.log('WebSocket杩炴帴鏂紑');
      this.globalData.websocketConnected = false;
    });
    
    webSocketService.on('error', (error) => {
      console.error('WebSocket閿欒:', error);
      // 鍙互鍦ㄨ繖閲屾坊鍔犻敊璇鐞嗛€昏緫锛屼緥濡傛樉绀洪敊璇彁绀?    });
    
    // 鐩戝惉鐢ㄦ埛娑堟伅
    webSocketService.on('userMessage', (data) => {
      console.log('鏀跺埌鐢ㄦ埛娑堟伅:', data);
      // 澶勭悊鐢ㄦ埛娑堟伅锛屼緥濡傛洿鏂癠I鎴栧瓨鍌ㄥ埌娑堟伅鍒楄〃
      this._handleUserMessage(data);
    });
    
    // 鐩戝惉绯荤粺閫氱煡
    webSocketService.on('systemNotification', (data) => {
      console.log('鏀跺埌绯荤粺閫氱煡:', data);
      // 澶勭悊绯荤粺閫氱煡锛屼緥濡傛樉绀洪€氱煡鎻愮ず
      this._handleSystemNotification(data);
    });
    
    // 鐩戝惉閲嶈繛灏濊瘯杈惧埌鏈€澶ф鏁?    webSocketService.on('maxReconnectAttemptsReached', (info) => {
      console.warn(`WebSocket閲嶈繛澶辫触锛屽凡杈惧埌鏈€澶у皾璇曟鏁?${info.maxAttempts})`);
      // 鍙互鍦ㄨ繖閲屾坊鍔犵敤鎴锋彁绀猴紝渚嬪鎻愮ず鐢ㄦ埛妫€鏌ョ綉缁滆繛鎺?    });
  },
  
  /**
   * 澶勭悊鐢ㄦ埛娑堟伅
   * @private
   * @param {Object} messageData - 娑堟伅鏁版嵁
   * @returns {void}
   */
  _handleUserMessage(messageData) {
    // 鏍规嵁娑堟伅绫诲瀷杩涜涓嶅悓澶勭悊
    const { type, content, sender } = messageData;
    
    // 鏄剧ず娑堟伅鎻愮ず
    wx.showToast({
      title: `${sender}: ${content.substring(0, 20)}...`,
      icon: 'none',
      duration: 3000
    });
    
    // 杩欓噷鍙互娣诲姞鏇村鐨勬秷鎭鐞嗛€昏緫
    // 渚嬪鏇存柊娑堟伅鍒楄〃銆佸瓨鍌ㄦ秷鎭瓑
  },
  
  /**
   * 澶勭悊绯荤粺閫氱煡
   * @private
   * @param {Object} notificationData - 閫氱煡鏁版嵁
   * @returns {void}
   */
  _handleSystemNotification(notificationData) {
    const { title, content, priority = 'normal' } = notificationData;
    
    // 鏍规嵁閫氱煡浼樺厛绾ц繘琛屼笉鍚屽鐞?    if (priority === 'high') {
      // 楂樹紭鍏堢骇閫氱煡鏄剧ず寮圭獥
      wx.showModal({
        title: title || '绯荤粺閫氱煡',
        content: content,
        showCancel: false
      });
    } else {
      // 鏅€氫紭鍏堢骇閫氱煡鏄剧ずToast
      wx.showToast({
        title: content,
        icon: 'none',
        duration: 3000
      });
    }
    
    // 杩欓噷鍙互娣诲姞鏇村鐨勯€氱煡澶勭悊閫昏緫
    // 渚嬪鏇存柊閫氱煡鍒楄〃銆佸瓨鍌ㄩ€氱煡绛?  },
  
  /**
   * 鍏ㄥ眬閿欒澶勭悊
   * @param {string} error - 閿欒淇℃伅
   * @returns {void}
   */
  onError(error) {
    console.error('鍏ㄥ眬閿欒:', error);
    // 缁熶竴閿欒澶勭悊锛岄伩鍏嶉噸澶嶆敞鍐?    if (this.globalData.store) {
      this.globalData.store.commit('SET_ERROR', error);
    }
    
    try {
      wx.showToast({ title: '鍙戠敓閿欒', icon: 'none' });
    } catch {
      // 闈欓粯澶辫触
    }
  },
  
  /**
   * 搴旂敤鏄剧ず鏃剁殑澶勭悊
   * @returns {void}
   */
  onShow() {
    // 搴旂敤鏄剧ず鏃讹紝濡傛灉宸茬櫥褰曚笖WebSocket鏈繛鎺ワ紝灏濊瘯閲嶆柊杩炴帴
    const userInfo = store.getState('user.userInfo');
    const token = store.getState('user.token');
    
    if (userInfo && token && !this.globalData.websocketConnected) {
      console.log('搴旂敤鏄剧ず锛屽皾璇曢噸鏂拌繛鎺ebSocket');
      // 鐩存帴璋冪敤connect鏂规硶锛岄伩鍏嶉噸澶嶅垵濮嬪寲
      webSocketService.connect();
    }
  },
  
  /**
   * 搴旂敤闅愯棌鏃剁殑澶勭悊
   * @returns {void}
   */
  onHide() {
    // 搴旂敤闅愯棌鏃讹紝鍙互閫夋嫨鏄惁淇濇寔WebSocket杩炴帴
    // 杩欓噷鎴戜滑淇濇寔杩炴帴锛屼互鎺ユ敹閲嶈閫氱煡
    // 濡傛灉闇€瑕佹柇寮€杩炴帴锛屽彲浠ュ彇娑堟敞閲婁笅闈㈢殑浠ｇ爜
    // webSocketService.disconnect(1000, '搴旂敤闅愯棌');
  },
  
  /**
   * 鑾峰彇WebSocket鏈嶅姟瀹炰緥
   * @returns {Object} WebSocket鏈嶅姟瀹炰緥
   */
  getWebSocketService() {
    return webSocketService;
  }
});
