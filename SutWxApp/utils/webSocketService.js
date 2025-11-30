/**
 * 文件名: webSocketService.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 浣滆€? Sut
 * WebSocket鏈嶅姟锛岀敤浜庡疄鏃舵秷鎭帹閫侊紝瀹炵幇杩炴帴绠＄悊銆佹秷鎭鐞嗗拰蹇冭烦妫€娴? */

const store = require('./store.js');
const i18n = require('./i18n.js');

// WebSocket閰嶇疆甯搁噺
const WS_CONFIG = {
  // WebSocket鏈嶅姟鍣ㄥ湴鍧€
  WS_URL: 'wss://api.example.com/ws',
  WS_TEST_URL: 'wss://test-api.example.com/ws',
  USE_TEST: false,
  
  // 杩炴帴閰嶇疆
  RECONNECT_DELAY: 3000, // 閲嶈繛寤惰繜(ms)
  MAX_RECONNECT_ATTEMPTS: 5, // 鏈€澶ч噸杩炴鏁?  HEARTBEAT_INTERVAL: 30000, // 蹇冭烦闂撮殧(ms)
  
  // 娑堟伅绫诲瀷
  MSG_TYPE: {
    HEARTBEAT: 'heartbeat',
    HEARTBEAT_RESPONSE: 'heartbeat_response',
    USER_MESSAGE: 'user_message',
    SYSTEM_NOTIFICATION: 'system_notification',
    ERROR: 'error',
    AUTHENTICATE: 'authenticate',
    AUTHENTICATE_SUCCESS: 'authenticate_success',
    AUTHENTICATE_FAILURE: 'authenticate_failure'
  },
  
  // 杩炴帴鐘舵€?  CONNECTION_STATUS: {
    CONNECTING: 'connecting',
    OPEN: 'open',
    CLOSING: 'closing',
    CLOSED: 'closed'
  }
};

/**
 * WebSocket鏈嶅姟绫? */
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
   * 鑾峰彇WebSocket URL
   * @private
   * @returns {string} WebSocket URL
   */
  _getWebSocketUrl() {
    const baseUrl = WS_CONFIG.USE_TEST ? WS_CONFIG.WS_TEST_URL : WS_CONFIG.WS_URL;
    const token = store.getState('user.token') || '';
    return `${baseUrl}?token=${token}`;
  }
  
  /**
   * 寤虹珛WebSocket杩炴帴
   * @returns {Promise} 杩炴帴缁撴灉
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // 宸茬粡杩炴帴鎴栨鍦ㄨ繛鎺ヤ腑
        if (this.connectionStatus === WS_CONFIG.CONNECTION_STATUS.OPEN || 
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
        
        // 鐩戝惉杩炴帴鎴愬姛
        this.socket.onOpen(() => {
          console.log('WebSocket杩炴帴宸叉墦寮€');
          this.connected = true;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.OPEN;
          this.reconnectAttempts = 0;
          
          // 寮€濮嬪績璺虫娴?          this._startHeartbeat();
          
          // 鍙戦€佺绾挎秷鎭?          this._sendOfflineMessages();
          
          // 閫氱煡鐩戝惉鍣ㄨ繛鎺ユ垚鍔?          this._notifyListeners('connected', true);
          
          resolve(true);
        });
        
        // 鐩戝惉鎺ユ敹娑堟伅
        this.socket.onMessage((res) => {
          try {
            const data = JSON.parse(res.data);
            this._handleMessage(data);
          } catch (error) {
            console.error('瑙ｆ瀽WebSocket娑堟伅澶辫触:', error);
          }
        });
        
        // 鐩戝惉杩炴帴鍏抽棴
        this.socket.onClose(() => {
          console.log('WebSocket杩炴帴宸插叧闂?);
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          
          // 鍋滄蹇冭烦妫€娴?          this._stopHeartbeat();
          
          // 閫氱煡鐩戝惉鍣ㄨ繛鎺ュ叧闂?          this._notifyListeners('disconnected', true);
          
          // 灏濊瘯閲嶈繛
          this._reconnect();
        });
        
        // 鐩戝惉杩炴帴閿欒
        this.socket.onError((error) => {
          console.error('WebSocket杩炴帴閿欒:', error);
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          
          // 鍋滄蹇冭烦妫€娴?          this._stopHeartbeat();
          
          // 閫氱煡鐩戝惉鍣ㄨ繛鎺ラ敊璇?          this._notifyListeners('error', error);
          
          reject(error);
          
          // 灏濊瘯閲嶈繛
          this._reconnect();
        });
        
      } catch (error) {
        console.error('鍒涘缓WebSocket杩炴帴澶辫触:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 鏂紑WebSocket杩炴帴
   * @param {number} code - 鍏抽棴鐮?   * @param {string} reason - 鍏抽棴鍘熷洜
   */
  disconnect(code = 1000, reason = '姝ｅ父鍏抽棴') {
    // 娓呴櫎閲嶈繛瀹氭椂鍣?    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 鍋滄蹇冭烦妫€娴?    this._stopHeartbeat();
    
    // 鍏抽棴杩炴帴
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
   * 鍙戦€佹秷鎭?   * @param {Object} message - 娑堟伅瀵硅薄
   * @param {string} message.type - 娑堟伅绫诲瀷
   * @param {Object} message.data - 娑堟伅鏁版嵁
   * @returns {boolean} 鏄惁鍙戦€佹垚鍔?   */
  send(message) {
    // 娣诲姞娑堟伅ID鍜屾椂闂存埑
    const messageWithMeta = {
      id: this._generateMessageId(),
      timestamp: Date.now(),
      ...message
    };
    
    // 濡傛灉宸茶繛鎺ワ紝鐩存帴鍙戦€?    if (this.connected && this.socket) {
      try {
        this.socket.send({
          data: JSON.stringify(messageWithMeta)
        });
        return true;
      } catch (error) {
        console.error('鍙戦€乄ebSocket娑堟伅澶辫触:', error);
        // 淇濆瓨鍒扮绾挎秷鎭槦鍒?        this._saveOfflineMessage(messageWithMeta);
        return false;
      }
    } else {
      // 鏈繛鎺ワ紝淇濆瓨鍒扮绾挎秷鎭槦鍒?      this._saveOfflineMessage(messageWithMeta);
      // 灏濊瘯杩炴帴
      this.connect();
      return false;
    }
  }
  
  /**
   * 璁㈤槄娑堟伅
   * @param {string} eventType - 浜嬩欢绫诲瀷
   * @param {Function} callback - 鍥炶皟鍑芥暟
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }
  
  /**
   * 鍙栨秷璁㈤槄
   * @param {string} eventType - 浜嬩欢绫诲瀷
   * @param {Function} callback - 鍥炶皟鍑芥暟锛堝彲閫夛紝濡傛灉涓嶆彁渚涘垯鍙栨秷璇ヤ簨浠剁被鍨嬬殑鎵€鏈夎闃咃級
   */
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
   * 鐢熸垚娑堟伅ID
   * @private
   * @returns {string} 娑堟伅ID
   */
  _generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * 澶勭悊鎺ユ敹鍒扮殑娑堟伅
   * @private
   * @param {Object} message - 娑堟伅瀵硅薄
   */
  _handleMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case WS_CONFIG.MSG_TYPE.HEARTBEAT_RESPONSE:
        // 鏀跺埌蹇冭烦鍝嶅簲锛屾洿鏂版渶鍚庢椿璺冩椂闂?        break;
        
      case WS_CONFIG.MSG_TYPE.USER_MESSAGE:
      case WS_CONFIG.MSG_TYPE.SYSTEM_NOTIFICATION:
        // 閫氱煡瀵瑰簲鐨勬秷鎭洃鍚櫒
        this._notifyListeners(type, data);
        // 閫氱敤娑堟伅鐩戝惉鍣?        this._notifyListeners('message', { type, data });
        break;
        
      case WS_CONFIG.MSG_TYPE.ERROR:
        console.error('WebSocket閿欒娑堟伅:', data);
        this._notifyListeners('error', data);
        break;
        
      default:
        // 閫氱煡鏈煡娑堟伅绫诲瀷鐨勭洃鍚櫒
        this._notifyListeners('unknown', message);
    }
  }
  
  /**
   * 寮€濮嬪績璺虫娴?   * @private
   */
  _startHeartbeat() {
    this._stopHeartbeat(); // 鍏堝仠姝箣鍓嶇殑蹇冭烦
    
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
   * 鍋滄蹇冭烦妫€娴?   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * 灏濊瘯閲嶈繛
   * @private
   */
  _reconnect() {
    // 娓呴櫎涔嬪墠鐨勯噸杩炲畾鏃跺櫒
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 妫€鏌ラ噸杩炴鏁版槸鍚﹁秴杩囬檺鍒?    if (this.reconnectAttempts < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      // 浼樺寲閲嶈繛绛栫暐锛氱粨鍚堟寚鏁伴€€閬垮拰闅忔満寤惰繜锛岄伩鍏嶅涓鎴风鍚屾椂閲嶈繛
      const baseDelay = WS_CONFIG.RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1);
      const randomDelay = Math.random() * 1000; // 0-1绉掔殑闅忔満寤惰繜
      const delay = baseDelay + randomDelay;
      
      console.log(`WebSocket灏嗗湪${Math.round(delay)}ms鍚庤繘琛岀${this.reconnectAttempts}娆￠噸杩瀈);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error(`WebSocket閲嶈繛澶辫触 (${this.reconnectAttempts}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS}):`, error);
        });
      }, delay);
    } else {
      console.error('WebSocket閲嶈繛娆℃暟宸茶揪鏈€澶ч檺鍒讹紝鍋滄閲嶈繛');
      this._notifyListeners('maxReconnectAttemptsReached', {
        maxAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS
      });
    }
  }
  
  /**
   * 閫氱煡鐩戝惉鍣?   * @private
   * @param {string} eventType - 浜嬩欢绫诲瀷
   * @param {...any} args - 浼犻€掔粰鐩戝惉鍣ㄧ殑鍙傛暟
   */
  _notifyListeners(eventType, ...args) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`WebSocket鐩戝惉鍣ㄦ墽琛岄敊璇?(${eventType}):`, error);
        }
      });
    }
  }
  
  /**
   * 淇濆瓨绂荤嚎娑堟伅
   * @private
   * @param {Object} message - 娑堟伅瀵硅薄
   */
  _saveOfflineMessage(message) {
    this.offlineMessages.push(message);
    // 闄愬埗绂荤嚎娑堟伅鏁伴噺锛岄槻姝㈠唴瀛樻孩鍑?    if (this.offlineMessages.length > 100) {
      this.offlineMessages.shift();
    }
  }
  
  /**
   * 鍙戦€佺绾挎秷鎭?   * @private
   */
  _sendOfflineMessages() {
    if (this.offlineMessages.length > 0 && this.connected) {
      console.log(`寮€濮嬪彂閫?{this.offlineMessages.length}鏉＄绾挎秷鎭痐);
      
      // 澶嶅埗娑堟伅闃熷垪锛岄伩鍏嶅湪鍙戦€佽繃绋嬩腑淇敼
      const messagesToSend = [...this.offlineMessages];
      this.offlineMessages = [];
      
      // 鎵归噺鍙戦€佹秷鎭?      messagesToSend.forEach(message => {
        this.send({
          ...message,
          isOfflineMessage: true
        });
      });
      
      console.log('绂荤嚎娑堟伅鍙戦€佸畬鎴?);
    }
  }
  
  /**
   * 鑾峰彇杩炴帴鐘舵€?   * @returns {Object} 杩炴帴鐘舵€佷俊鎭?   */
  getConnectionStatus() {
    return {
      connected: this.connected,
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      offlineMessagesCount: this.offlineMessages.length
    };
  }
  
  /**
   * 娓呯悊璧勬簮
   */
  cleanup() {
    this.disconnect();
    this.listeners.clear();
    this.offlineMessages = [];
  }
}

// 鍒涘缓鍗曚緥瀹炰緥
const webSocketService = new WebSocketService();

// 瀵煎嚭
module.exports = {
  instance: webSocketService,
  WS_CONFIG,
  WebSocketService
};
