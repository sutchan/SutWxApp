/**
 * 鏂囦欢鍚? webSocketService.js
 * 鐗堟湰鍙? 1.0.2
 * 更新日期: 2025-11-29
 * 娴ｆ粏鈧? Sut
 * WebSocket閺堝秴濮熼敍宀€鏁ゆ禍搴＄杽閺冭埖绉烽幁顖涘腹闁緤绱濈€圭偟骞囨潻鐐村复缁狅紕鎮婇妴浣圭Х閹垰顦╅悶鍡楁嫲韫囧啳鐑﹀Λ鈧ù? */

const store = require('./store.js');
const i18n = require('./i18n.js');

// WebSocket闁板秶鐤嗙敮鎼佸櫤
const WS_CONFIG = {
  // WebSocket閺堝秴濮熼崳銊ユ勾閸р偓
  WS_URL: 'wss://api.example.com/ws',
  WS_TEST_URL: 'wss://test-api.example.com/ws',
  USE_TEST: false,
  
  // 鏉╃偞甯撮柊宥囩枂
  RECONNECT_DELAY: 3000, // 闁插秷绻涘鎯扮箿(ms)
  MAX_RECONNECT_ATTEMPTS: 5, // 閺堚偓婢堆囧櫢鏉╃偞顐奸弫?  HEARTBEAT_INTERVAL: 30000, // 韫囧啳鐑﹂梻鎾(ms)
  
  // 濞戝牊浼呯猾璇茬€?  MSG_TYPE: {
    HEARTBEAT: 'heartbeat',
    HEARTBEAT_RESPONSE: 'heartbeat_response',
    USER_MESSAGE: 'user_message',
    SYSTEM_NOTIFICATION: 'system_notification',
    ERROR: 'error',
    AUTHENTICATE: 'authenticate',
    AUTHENTICATE_SUCCESS: 'authenticate_success',
    AUTHENTICATE_FAILURE: 'authenticate_failure'
  },
  
  // 鏉╃偞甯撮悩鑸碘偓?  CONNECTION_STATUS: {
    CONNECTING: 'connecting',
    OPEN: 'open',
    CLOSING: 'closing',
    CLOSED: 'closed'
  }
};

/**
 * WebSocket閺堝秴濮熺猾? */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.offlineMessages = [];
    this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
  }
  
  /**
   * 閼惧嘲褰嘩ebSocket URL
   * @private
   * @returns {string} WebSocket URL
   */
  _getWebSocketUrl() {
    const baseUrl = WS_CONFIG.USE_TEST ? WS_CONFIG.WS_TEST_URL : WS_CONFIG.WS_URL;
    const token = store.getState('user.token') || '';
    return `${baseUrl}?token=${token}`;
  }
  
  /**
   * 瀵よ櫣鐝沇ebSocket鏉╃偞甯?   * @returns {Promise} 鏉╃偞甯寸紒鎾寸亯
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // 瀹歌尙绮℃潻鐐村复閹存牗顒滈崷銊ㄧ箾閹恒儰鑵?        if (this.connectionStatus === WS_CONFIG.CONNECTION_STATUS.OPEN || 
            this.connectionStatus === WS_CONFIG.CONNECTION_STATUS.CONNECTING) {
          resolve(this.connected);
          return;
        }
        
        this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CONNECTING;
        this.socket = wx.connectSocket({
          url: this._getWebSocketUrl(),
          header: {
            'content-type': 'application/json'
          },
          protocols: ['protocol1']
        });
        
        // 閻╂垵鎯夋潻鐐村复閹存劕濮?        this.socket.onOpen(() => {
          console.log('WebSocket鏉╃偞甯村鍙夊ⅵ瀵偓');
          this.connected = true;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.OPEN;
          this.reconnectAttempts = 0;
          
          // 瀵偓婵绺剧捄铏梾濞?          this._startHeartbeat();
          
          // 閸欐垿鈧胶顬囩痪鎸庣Х閹?          this._sendOfflineMessages();
          
          // 闁氨鐓￠惄鎴濇儔閸ｃ劏绻涢幒銉﹀灇閸?          this._notifyListeners('connected', true);
          
          resolve(true);
        });
        
        // 閻╂垵鎯夐幒銉︽暪濞戝牊浼?        this.socket.onMessage((res) => {
          try {
            const data = JSON.parse(res.data);
            this._handleMessage(data);
          } catch (error) {
            console.error('鐟欙絾鐎絎ebSocket濞戝牊浼呮径杈Е:', error);
          }
        });
        
        // 閻╂垵鎯夋潻鐐村复閸忔娊妫?        this.socket.onClose(() => {
          console.log('WebSocket鏉╃偞甯村鎻掑彠闂?);
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          
          // 閸嬫粍顒涜箛鍐儲濡偓濞?          this._stopHeartbeat();
          
          // 闁氨鐓￠惄鎴濇儔閸ｃ劏绻涢幒銉ュ彠闂?          this._notifyListeners('disconnected', true);
          
          // 鐏忔繆鐦柌宥堢箾
          this._reconnect();
        });
        
        // 閻╂垵鎯夋潻鐐村复闁挎瑨顕?        this.socket.onError((error) => {
          console.error('WebSocket鏉╃偞甯撮柨娆掝嚖:', error);
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          
          // 閸嬫粍顒涜箛鍐儲濡偓濞?          this._stopHeartbeat();
          
          // 闁氨鐓￠惄鎴濇儔閸ｃ劏绻涢幒銉╂晩鐠?          this._notifyListeners('error', error);
          
          reject(error);
          
          // 鐏忔繆鐦柌宥堢箾
          this._reconnect();
        });
        
      } catch (error) {
        console.error('閸掓稑缂揥ebSocket鏉╃偞甯存径杈Е:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 閺傤厼绱慦ebSocket鏉╃偞甯?   * @param {number} code - 閸忔娊妫撮惍?   * @param {string} reason - 閸忔娊妫撮崢鐔锋礈
   */
  disconnect(code = 1000, reason = '濮濓絽鐖堕崗鎶芥４') {
    // 濞撳懘娅庨柌宥堢箾鐎规碍妞傞崳?    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 閸嬫粍顒涜箛鍐儲濡偓濞?    this._stopHeartbeat();
    
    // 閸忔娊妫存潻鐐村复
    if (this.socket && this.connectionStatus !== WS_CONFIG.CONNECTION_STATUS.CLOSED) {
      this.socket.close({
        code,
        reason
      });
      this.connected = false;
      this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
    }
  }
  
  /**
   * 閸欐垿鈧焦绉烽幁?   * @param {Object} message - 濞戝牊浼呯€电钖?   * @param {string} message.type - 濞戝牊浼呯猾璇茬€?   * @param {Object} message.data - 濞戝牊浼呴弫鐗堝祦
   * @returns {boolean} 閺勵垰鎯侀崣鎴︹偓浣瑰灇閸?   */
  send(message) {
    // 濞ｈ濮炲☉鍫熶紖ID閸滃本妞傞梻瀛樺煈
    const messageWithMeta = {
      id: this._generateMessageId(),
      timestamp: Date.now(),
      ...message
    };
    
    // 婵″倹鐏夊鑼剁箾閹恒儻绱濋惄瀛樺复閸欐垿鈧?    if (this.connected && this.socket) {
      try {
        this.socket.send({
          data: JSON.stringify(messageWithMeta)
        });
        return true;
      } catch (error) {
        console.error('閸欐垿鈧箘ebSocket濞戝牊浼呮径杈Е:', error);
        // 娣囨繂鐡ㄩ崚鎵瀲缁炬寧绉烽幁顖炴Е閸?        this._saveOfflineMessage(messageWithMeta);
        return false;
      }
    } else {
      // 閺堫亣绻涢幒銉礉娣囨繂鐡ㄩ崚鎵瀲缁炬寧绉烽幁顖炴Е閸?      this._saveOfflineMessage(messageWithMeta);
      // 鐏忔繆鐦潻鐐村复
      this.connect();
      return false;
    }
  }
  
  /**
   * 鐠併垽妲勫☉鍫熶紖
   * @param {string} eventType - 娴滃娆㈢猾璇茬€?   * @param {Function} callback - 閸ョ偠鐨熼崙鑺ユ殶
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }
  
  /**
   * 閸欐牗绉风拋銏ゆ
   * @param {string} eventType - 娴滃娆㈢猾璇茬€?   * @param {Function} callback - 閸ョ偠鐨熼崙鑺ユ殶閿涘牆褰查柅澶涚礉婵″倹鐏夋稉宥嗗絹娓氭稑鍨崣鏍ㄧХ鐠囥儰绨ㄦ禒鍓佽閸ㄥ娈戦幍鈧張澶庮吂闂冨拑绱?   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      if (callback) {
        this.listeners.get(eventType).delete(callback);
      } else {
        this.listeners.delete(eventType);
      }
    }
  }
  
  /**
   * 閻㈢喐鍨氬☉鍫熶紖ID
   * @private
   * @returns {string} 濞戝牊浼匢D
   */
  _generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * 婢跺嫮鎮婇幒銉︽暪閸掓壆娈戝☉鍫熶紖
   * @private
   * @param {Object} message - 濞戝牊浼呯€电钖?   */
  _handleMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case WS_CONFIG.MSG_TYPE.HEARTBEAT_RESPONSE:
        // 閺€璺哄煂韫囧啳鐑﹂崫宥呯安閿涘本娲块弬鐗堟付閸氬孩妞跨捄鍐╂闂?        break;
        
      case WS_CONFIG.MSG_TYPE.USER_MESSAGE:
      case WS_CONFIG.MSG_TYPE.SYSTEM_NOTIFICATION:
        // 闁氨鐓＄€电懓绨查惃鍕Х閹垳娲冮崥顒€娅?        this._notifyListeners(type, data);
        // 闁氨鏁ゅ☉鍫熶紖閻╂垵鎯夐崳?        this._notifyListeners('message', { type, data });
        break;
        
      case WS_CONFIG.MSG_TYPE.ERROR:
        console.error('WebSocket闁挎瑨顕ゅ☉鍫熶紖:', data);
        this._notifyListeners('error', data);
        break;
        
      default:
        // 闁氨鐓￠張顏嗙叀濞戝牊浼呯猾璇茬€烽惃鍕磧閸氼剙娅?        this._notifyListeners('unknown', message);
    }
  }
  
  /**
   * 瀵偓婵绺剧捄铏梾濞?   * @private
   */
  _startHeartbeat() {
    this._stopHeartbeat(); // 閸忓牆浠犲顫閸撳秶娈戣箛鍐儲
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connected && this.socket) {
        this.send({
          type: WS_CONFIG.MSG_TYPE.HEARTBEAT,
          data: { timestamp: Date.now() }
        });
      }
    }, WS_CONFIG.HEARTBEAT_INTERVAL);
  }
  
  /**
   * 閸嬫粍顒涜箛鍐儲濡偓濞?   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * 鐏忔繆鐦柌宥堢箾
   * @private
   */
  _reconnect() {
    // 濞撳懘娅庢稊瀣閻ㄥ嫰鍣告潻鐐茬暰閺冭泛娅?    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 濡偓閺屻儵鍣告潻鐐搭偧閺佺増妲搁崥锕佺Т鏉╁洭妾洪崚?    if (this.reconnectAttempts < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      // 娴兼ê瀵查柌宥堢箾缁涙牜鏆愰敍姘辩波閸氬牊瀵氶弫浼粹偓鈧柆鍨嫲闂呭繑婧€瀵ゆ儼绻滈敍宀勪缉閸忓秴顦挎稉顏勵吂閹撮顏崥灞炬闁插秷绻?      const baseDelay = WS_CONFIG.RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1);
      const randomDelay = Math.random() * 1000; // 0-1缁夋帞娈戦梾蹇旀簚瀵ゆ儼绻?      const delay = baseDelay + randomDelay;
      
      console.log(`WebSocket鐏忓棗婀?{Math.round(delay)}ms閸氬氦绻樼悰宀€顑?{this.reconnectAttempts}濞嗭繝鍣告潻鐎?;
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error(`WebSocket闁插秷绻涙径杈Е (${this.reconnectAttempts}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS}):`, error);
        });
      }, delay);
    } else {
      console.error('WebSocket闁插秷绻涘▎鈩冩殶瀹歌尪鎻張鈧径褔妾洪崚璁圭礉閸嬫粍顒涢柌宥堢箾');
      this._notifyListeners('maxReconnectAttemptsReached', {
        maxAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS
      });
    }
  }
  
  /**
   * 闁氨鐓￠惄鎴濇儔閸?   * @private
   * @param {string} eventType - 娴滃娆㈢猾璇茬€?   * @param {...any} args - 娴肩娀鈧帞绮伴惄鎴濇儔閸ｃ劎娈戦崣鍌涙殶
   */
  _notifyListeners(eventType, ...args) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`WebSocket閻╂垵鎯夐崳銊﹀⒔鐞涘矂鏁婄拠?(${eventType}):`, error);
        }
      });
    }
  }
  
  /**
   * 娣囨繂鐡ㄧ粋鑽ゅ殠濞戝牊浼?   * @private
   * @param {Object} message - 濞戝牊浼呯€电钖?   */
  _saveOfflineMessage(message) {
    this.offlineMessages.push(message);
    // 闂勬劕鍩楃粋鑽ゅ殠濞戝牊浼呴弫浼村櫤閿涘矂妲诲銏犲敶鐎涙ɑ瀛╅崙?    if (this.offlineMessages.length > 100) {
      this.offlineMessages.shift();
    }
  }
  
  /**
   * 閸欐垿鈧胶顬囩痪鎸庣Х閹?   * @private
   */
  _sendOfflineMessages() {
    if (this.offlineMessages.length > 0 && this.connected) {
      console.log(`瀵偓婵褰傞柅?{this.offlineMessages.length}閺夛紕顬囩痪鎸庣Х閹棎);
      
      // 婢跺秴鍩楀☉鍫熶紖闂冪喎鍨敍宀勪缉閸忓秴婀崣鎴︹偓浣界箖缁嬪鑵戞穱顔芥暭
      const messagesToSend = [...this.offlineMessages];
      this.offlineMessages = [];
      
      // 閹靛綊鍣洪崣鎴︹偓浣圭Х閹?      messagesToSend.forEach(message => {
        this.send({
          ...message,
          isOfflineMessage: true
        });
      });
      
      console.log('缁傝崵鍤庡☉鍫熶紖閸欐垿鈧礁鐣幋?);
    }
  }
  
  /**
   * 閼惧嘲褰囨潻鐐村复閻樿埖鈧?   * @returns {Object} 鏉╃偞甯撮悩鑸碘偓浣蜂繆閹?   */
  getConnectionStatus() {
    return {
      connected: this.connected,
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      offlineMessagesCount: this.offlineMessages.length
    };
  }
  
  /**
   * 濞撳懐鎮婄挧鍕爱
   */
  cleanup() {
    this.disconnect();
    this.listeners.clear();
    this.offlineMessages = [];
  }
}

// 閸掓稑缂撻崡鏇氱伐鐎圭偘绶?const webSocketService = new WebSocketService();

// 鐎电厧鍤?module.exports = {
  instance: webSocketService,
  WS_CONFIG,
  WebSocketService
};
