/**
 * 鏂囦欢鍚? app.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-27
 * 娴ｆ粏鈧? Sut
 * 鐏忓繒鈻兼惔蹇撳弳閸欙絾鏋冩禒璁圭礉鐠愮喕鐭楅崚婵嗩潗閸栨牕鍙忕仦鈧張宥呭閵嗕胶濮搁幀浣侯吀閻炲棗鎷扮紒鍕濞夈劌鍞? */

const i18n = require('./utils/i18n');
const store = require('./utils/store.js');
const componentManager = require('./components');
const cacheService = require('./utils/cacheService.js').instance;
const cacheConfig = require('./utils/cacheConfig.js').getConfig();
const webSocketService = require('./utils/webSocketService.js').instance;

/**
 * 鎼存梻鏁ら崗銉ュ經
 * @returns {void}
 */
App({
  /**
   * 鎼存梻鏁ら崥顖氬З閸ョ偠鐨?   * @returns {void}
   */
  onLaunch() {
    // 閸掓繂顫愰崠鏍у弿鐏炩偓閻樿埖鈧?    this.globalData = {
      startedAt: Date.now(),
      websocketConnected: false
    };
    
    // 閸掓繂顫愰崠鏍Ц閹胶顓搁悶?    this.initStore();
    
    // 閸掓繂顫愰崠鏍ф禇闂勫懎瀵?    this.initI18n();
    
    // 閸掓繂顫愰崠鏍处鐎涙ɑ婀囬崝?    this.initCache();
    
    // 閸掓繂顫愰崠鏍矋娴?    this.initComponents();
    
    // 閸掓繂顫愰崠鏈〆bSocket閺堝秴濮?    this.initWebSocket();
    
    // 閸掓繂顫愰崠鏍晩鐠囶垰顦╅悶?    this.initErrorHandler();
  },

  /**
   * 閸掓繂顫愰崠鏍у弿鐏炩偓閻樿埖鈧胶顓搁悶?   * @returns {void}
   */
  initStore() {
    // 娴犲孩婀伴崷鏉跨摠閸屻劍浠径宥囧Ц閹?    store.restore();
    
    // 鐏忓敄tore閹稿倽娴囬崚鐧畃p鐎圭偘绶ユ稉濠忕礉閺傞€涚┒鐠佸潡妫?    this.globalData.store = store;
  },
  
  /**
   * 閸掓繂顫愰崠鏍嚔鐟封偓鐠佸墽鐤?   * @returns {void}
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
      // 閸忕厧顔愰弮鐘甸兇缂佺喍淇婇幁顖滄畱閸︾儤娅欓敍灞肩箽閹镐線绮拋銈堫嚔鐟封偓
    }
  },
  
  /**
   * 閸掓繂顫愰崠鏍у弿鐏炩偓闁挎瑨顕ゆ径鍕倞
   * @returns {void}
   */
  initErrorHandler() {
    wx.onError((error) => {
      console.error('App Error:', error);
      
      // 閺囧瓨鏌妔tore娑擃厾娈戦柨娆掝嚖閻樿埖鈧?      if (this.globalData.store) {
        store.commit('SET_ERROR', error);
      }
      
      try {
        wx.showToast({ title: '閸欐垹鏁撻柨娆掝嚖', icon: 'none' });
      } catch {
        // 闂堟瑩绮径杈Е
      }
    });
  },

  /**
   * 閸掓繂顫愰崠鏍у弿鐏炩偓缂佸嫪娆?   * @returns {void}
   */
  initComponents() {
    componentManager.registerGlobalComponents(this);
  },
  
  /**
   * 閸掓繂顫愰崠鏍处鐎涙ɑ婀囬崝?   * @returns {Promise<void>}
   */
  async initCache() {
    try {
      // 閸掓繂顫愰崠鏍处鐎涙ɑ婀囬崝?      await cacheService.init(cacheConfig);
      console.log('缂傛挸鐡ㄩ張宥呭閸掓繂顫愰崠鏍ㄥ灇閸?);
      
      // 閻╂垵鎯夌純鎴犵捕閻樿埖鈧礁褰夐崠鏍电礉閼奉亜濮╁〒鍛倞鏉╁洦婀＄紓鎾崇摠
      wx.onNetworkStatusChange((res) => {
        if (res.isConnected) {
          console.log('缂冩垹绮跺鑼剁箾閹恒儻绱濆鈧慨瀣閻炲棜绻冮張鐔虹处鐎?);
          cacheService.cleanupExpired();
          // 缂冩垹绮堕幁銏狀槻閺冭绱濈亸婵婄槸闁插秷绻沇ebSocket
          if (this.globalData.userInfo) {
            console.log('鐏忔繆鐦柌宥嗘煀鏉╃偞甯碬ebSocket...');
            webSocketService.connect();
          }
        } else {
          console.log('缂冩垹绮堕弬顓炵磻鏉╃偞甯?);
        }
      });
    } catch (error) {
      console.error('缂傛挸鐡ㄩ張宥呭閸掓繂顫愰崠鏍с亼鐠?', error);
    }
  },
  
  /**
   * 閸掓繂顫愰崠鏍ф禇闂勫懎瀵?   * @returns {void}
   */
  initI18n() {
    this.initLanguage();
  },
  
  /**
   * 閸掓繂顫愰崠鏈〆bSocket閺堝秴濮?   * @returns {Promise<void>}
   */
  async initWebSocket() {
    try {
      // 閸欘亝婀侀崷銊ф暏閹村嘲鍑￠惂璇茬秿閻ㄥ嫭鍎忛崘鍏哥瑓閹靛秴鍨垫慨瀣WebSocket
      const userInfo = store.getState('user.userInfo');
      const token = store.getState('user.token');
      
      if (userInfo && token) {
        // 閸欘亝鏁為崘灞肩濞嗭紕娲冮崥顒€娅?        if (!this._webSocketListenersRegistered) {
          // 濞夈劌鍞絎ebSocket娴滃娆㈤惄鎴濇儔閸?          this._registerWebSocketListeners();
          this._webSocketListenersRegistered = true;
        }
        
        // 瀵よ櫣鐝沇ebSocket鏉╃偞甯?        await webSocketService.connect();
      }
    } catch (error) {
      console.error('WebSocket閸掓繂顫愰崠鏍с亼鐠?', error);
    }
  },
  
  /**
   * 濞夈劌鍞絎ebSocket娴滃娆㈤惄鎴濇儔閸?   * @private
   * @returns {void}
   */
  _registerWebSocketListeners() {
    // 閻╂垵鎯夋潻鐐村复閻樿埖鈧礁褰夐崠?    webSocketService.on('connected', () => {
      console.log('WebSocket鏉╃偞甯撮幋鎰');
      this.globalData.websocketConnected = true;
    });
    
    webSocketService.on('disconnected', () => {
      console.log('WebSocket鏉╃偞甯撮弬顓炵磻');
      this.globalData.websocketConnected = false;
    });
    
    webSocketService.on('error', (error) => {
      console.error('WebSocket闁挎瑨顕?', error);
      // 閸欘垯浜掗崷銊ㄧ箹闁插本鍧婇崝鐘绘晩鐠囶垰顦╅悶鍡涒偓鏄忕帆閿涘奔绶ユ俊鍌涙▔缁€娲晩鐠囶垱褰佺粈?    });
    
    // 閻╂垵鎯夐悽銊﹀煕濞戝牊浼?    webSocketService.on('userMessage', (data) => {
      console.log('閺€璺哄煂閻劍鍩涘☉鍫熶紖:', data);
      // 婢跺嫮鎮婇悽銊﹀煕濞戝牊浼呴敍灞肩伐婵″倹娲块弬鐧營閹存牕鐡ㄩ崒銊ュ煂濞戝牊浼呴崚妤勩€?      this._handleUserMessage(data);
    });
    
    // 閻╂垵鎯夌化鑽ょ埠闁氨鐓?    webSocketService.on('systemNotification', (data) => {
      console.log('閺€璺哄煂缁崵绮洪柅姘辩叀:', data);
      // 婢跺嫮鎮婄化鑽ょ埠闁氨鐓￠敍灞肩伐婵″倹妯夌粈娲偓姘辩叀閹绘劗銇?      this._handleSystemNotification(data);
    });
    
    // 閻╂垵鎯夐柌宥堢箾鐏忔繆鐦潏鎯у煂閺堚偓婢堆勵偧閺?    webSocketService.on('maxReconnectAttemptsReached', (info) => {
      console.warn(`WebSocket闁插秷绻涙径杈Е閿涘苯鍑℃潏鎯у煂閺堚偓婢堆冪毦鐠囨洘顐奸弫?${info.maxAttempts})`);
      // 閸欘垯浜掗崷銊ㄧ箹闁插本鍧婇崝鐘垫暏閹撮攱褰佺粈鐚寸礉娓氬顩ч幓鎰仛閻劍鍩涘Λ鈧弻銉х秹缂佹粏绻涢幒?    });
  },
  
  /**
   * 婢跺嫮鎮婇悽銊﹀煕濞戝牊浼?   * @private
   * @param {Object} messageData - 濞戝牊浼呴弫鐗堝祦
   * @returns {void}
   */
  _handleUserMessage(messageData) {
    // 閺嶈宓佸☉鍫熶紖缁鐎锋潻娑滎攽娑撳秴鎮撴径鍕倞
    const { type, content, sender } = messageData;
    
    // 閺勫墽銇氬☉鍫熶紖閹绘劗銇?    wx.showToast({
      title: `${sender}: ${content.substring(0, 20)}...`,
      icon: 'none',
      duration: 3000
    });
    
    // 鏉╂瑩鍣烽崣顖欎簰濞ｈ濮為弴鏉戭樋閻ㄥ嫭绉烽幁顖氼槱閻炲棝鈧槒绶?    // 娓氬顩ч弴瀛樻煀濞戝牊浼呴崚妤勩€冮妴浣哥摠閸屻劍绉烽幁顖滅搼
  },
  
  /**
   * 婢跺嫮鎮婄化鑽ょ埠闁氨鐓?   * @private
   * @param {Object} notificationData - 闁氨鐓￠弫鐗堝祦
   * @returns {void}
   */
  _handleSystemNotification(notificationData) {
    const { title, content, priority = 'normal' } = notificationData;
    
    // 閺嶈宓侀柅姘辩叀娴兼ê鍘涚痪褑绻樼悰灞肩瑝閸氬苯顦╅悶?    if (priority === 'high') {
      // 妤傛ü绱崗鍫㈤獓闁氨鐓￠弰鍓с仛瀵湱鐛?      wx.showModal({
        title: title || '缁崵绮洪柅姘辩叀',
        content: content,
        showCancel: false
      });
    } else {
      // 閺咁噣鈧矮绱崗鍫㈤獓闁氨鐓￠弰鍓с仛Toast
      wx.showToast({
        title: content,
        icon: 'none',
        duration: 3000
      });
    }
    
    // 鏉╂瑩鍣烽崣顖欎簰濞ｈ濮為弴鏉戭樋閻ㄥ嫰鈧氨鐓℃径鍕倞闁槒绶?    // 娓氬顩ч弴瀛樻煀闁氨鐓￠崚妤勩€冮妴浣哥摠閸屻劑鈧氨鐓＄粵?  },
  
  /**
   * 閸忋劌鐪柨娆掝嚖婢跺嫮鎮?   * @param {string} error - 闁挎瑨顕ゆ穱鈩冧紖
   * @returns {void}
   */
  onError(error) {
    console.error('閸忋劌鐪柨娆掝嚖:', error);
    // 缂佺喍绔撮柨娆掝嚖婢跺嫮鎮婇敍宀勪缉閸忓秹鍣告径宥嗘暈閸?    if (this.globalData.store) {
      this.globalData.store.commit('SET_ERROR', error);
    }
    
    try {
      wx.showToast({ title: '閸欐垹鏁撻柨娆掝嚖', icon: 'none' });
    } catch {
      // 闂堟瑩绮径杈Е
    }
  },
  
  /**
   * 鎼存梻鏁ら弰鍓с仛閺冨墎娈戞径鍕倞
   * @returns {void}
   */
  onShow() {
    // 鎼存梻鏁ら弰鍓с仛閺冭绱濇俊鍌涚亯瀹歌尙娅ヨぐ鏇氱瑬WebSocket閺堫亣绻涢幒銉礉鐏忔繆鐦柌宥嗘煀鏉╃偞甯?    const userInfo = store.getState('user.userInfo');
    const token = store.getState('user.token');
    
    if (userInfo && token && !this.globalData.websocketConnected) {
      console.log('鎼存梻鏁ら弰鍓с仛閿涘苯鐨剧拠鏇㈠櫢閺傛媽绻涢幒顧漞bSocket');
      // 閻╁瓨甯寸拫鍐暏connect閺傝纭堕敍宀勪缉閸忓秹鍣告径宥呭灥婵瀵?      webSocketService.connect();
    }
  },
  
  /**
   * 鎼存梻鏁ら梾鎰閺冨墎娈戞径鍕倞
   * @returns {void}
   */
  onHide() {
    // 鎼存梻鏁ら梾鎰閺冭绱濋崣顖欎簰闁瀚ㄩ弰顖氭儊娣囨繃瀵擶ebSocket鏉╃偞甯?    // 鏉╂瑩鍣烽幋鎴滄粦娣囨繃瀵旀潻鐐村复閿涘奔浜掗幒銉︽暪闁插秷顩﹂柅姘辩叀
    // 婵″倹鐏夐棁鈧憰浣规焽瀵偓鏉╃偞甯撮敍灞藉讲娴犮儱褰囧☉鍫熸暈闁插﹣绗呴棃銏㈡畱娴狅絿鐖?    // webSocketService.disconnect(1000, '鎼存梻鏁ら梾鎰');
  },
  
  /**
   * 閼惧嘲褰嘩ebSocket閺堝秴濮熺€圭偘绶?   * @returns {Object} WebSocket閺堝秴濮熺€圭偘绶?   */
  getWebSocketService() {
    return webSocketService;
  }
});
