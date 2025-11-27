/**
 * 文件名: webSocketService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-25
 * 作者: Sut
 * WebSocket服务，用于实时消息推送，实现连接管理、消息处理和心跳检测
 */

const store = require('./store.js');
const i18n = require('./i18n.js');

// WebSocket配置常量
const WS_CONFIG = {
  // WebSocket服务器地址
  WS_URL: 'wss://api.example.com/ws',
  WS_TEST_URL: 'wss://test-api.example.com/ws',
  USE_TEST: false,
  
  // 连接配置
  RECONNECT_DELAY: 3000, // 重连延迟(ms)
  MAX_RECONNECT_ATTEMPTS: 5, // 最大重连次数
  HEARTBEAT_INTERVAL: 30000, // 心跳间隔(ms)
  
  // 消息类型
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
  
  // 连接状态
  CONNECTION_STATUS: {
    CONNECTING: 'connecting',
    OPEN: 'open',
    CLOSING: 'closing',
    CLOSED: 'closed'
  }
};

/**
 * WebSocket服务类
 */
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
   * 获取WebSocket URL
   * @private
   * @returns {string} WebSocket URL
   */
  _getWebSocketUrl() {
    const baseUrl = WS_CONFIG.USE_TEST ? WS_CONFIG.WS_TEST_URL : WS_CONFIG.WS_URL;
    const token = store.getState('user.token') || '';
    return `${baseUrl}?token=${token}`;
  }
  
  /**
   * 建立WebSocket连接
   * @returns {Promise} 连接结果
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // 已经连接或正在连接中
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
        
        // 监听连接成功
        this.socket.onOpen(() => {
          console.log('WebSocket连接已打开');
          this.connected = true;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.OPEN;
          this.reconnectAttempts = 0;
          
          // 开始心跳检测
          this._startHeartbeat();
          
          // 发送离线消息
          this._sendOfflineMessages();
          
          // 通知监听器连接成功
          this._notifyListeners('connected', true);
          
          resolve(true);
        });
        
        // 监听接收消息
        this.socket.onMessage((res) => {
          try {
            const data = JSON.parse(res.data);
            this._handleMessage(data);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        });
        
        // 监听连接关闭
        this.socket.onClose(() => {
          console.log('WebSocket连接已关闭');
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          
          // 停止心跳检测
          this._stopHeartbeat();
          
          // 通知监听器连接关闭
          this._notifyListeners('disconnected', true);
          
          // 尝试重连
          this._reconnect();
        });
        
        // 监听连接错误
        this.socket.onError((error) => {
          console.error('WebSocket连接错误:', error);
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          
          // 停止心跳检测
          this._stopHeartbeat();
          
          // 通知监听器连接错误
          this._notifyListeners('error', error);
          
          reject(error);
          
          // 尝试重连
          this._reconnect();
        });
        
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 断开WebSocket连接
   * @param {number} code - 关闭码
   * @param {string} reason - 关闭原因
   */
  disconnect(code = 1000, reason = '正常关闭') {
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 停止心跳检测
    this._stopHeartbeat();
    
    // 关闭连接
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
   * 发送消息
   * @param {Object} message - 消息对象
   * @param {string} message.type - 消息类型
   * @param {Object} message.data - 消息数据
   * @returns {boolean} 是否发送成功
   */
  send(message) {
    // 添加消息ID和时间戳
    const messageWithMeta = {
      id: this._generateMessageId(),
      timestamp: Date.now(),
      ...message
    };
    
    // 如果已连接，直接发送
    if (this.connected && this.socket) {
      try {
        this.socket.send({
          data: JSON.stringify(messageWithMeta)
        });
        return true;
      } catch (error) {
        console.error('发送WebSocket消息失败:', error);
        // 保存到离线消息队列
        this._saveOfflineMessage(messageWithMeta);
        return false;
      }
    } else {
      // 未连接，保存到离线消息队列
      this._saveOfflineMessage(messageWithMeta);
      // 尝试连接
      this.connect();
      return false;
    }
  }
  
  /**
   * 订阅消息
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }
  
  /**
   * 取消订阅
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数（可选，如果不提供则取消该事件类型的所有订阅）
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
   * 生成消息ID
   * @private
   * @returns {string} 消息ID
   */
  _generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * 处理接收到的消息
   * @private
   * @param {Object} message - 消息对象
   */
  _handleMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case WS_CONFIG.MSG_TYPE.HEARTBEAT_RESPONSE:
        // 收到心跳响应，更新最后活跃时间
        break;
        
      case WS_CONFIG.MSG_TYPE.USER_MESSAGE:
      case WS_CONFIG.MSG_TYPE.SYSTEM_NOTIFICATION:
        // 通知对应的消息监听器
        this._notifyListeners(type, data);
        // 通用消息监听器
        this._notifyListeners('message', { type, data });
        break;
        
      case WS_CONFIG.MSG_TYPE.ERROR:
        console.error('WebSocket错误消息:', data);
        this._notifyListeners('error', data);
        break;
        
      default:
        // 通知未知消息类型的监听器
        this._notifyListeners('unknown', message);
    }
  }
  
  /**
   * 开始心跳检测
   * @private
   */
  _startHeartbeat() {
    this._stopHeartbeat(); // 先停止之前的心跳
    
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
   * 停止心跳检测
   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * 尝试重连
   * @private
   */
  _reconnect() {
    // 清除之前的重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    // 检查重连次数是否超过限制
    if (this.reconnectAttempts < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = WS_CONFIG.RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1); // 指数退避
      
      console.log(`WebSocket将在${delay}ms后进行第${this.reconnectAttempts}次重连`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error(`WebSocket重连失败 (${this.reconnectAttempts}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS}):`, error);
        });
      }, delay);
    } else {
      console.error('WebSocket重连次数已达最大限制，停止重连');
      this._notifyListeners('maxReconnectAttemptsReached', {
        maxAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS
      });
    }
  }
  
  /**
   * 通知监听器
   * @private
   * @param {string} eventType - 事件类型
   * @param {...any} args - 传递给监听器的参数
   */
  _notifyListeners(eventType, ...args) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`WebSocket监听器执行错误 (${eventType}):`, error);
        }
      });
    }
  }
  
  /**
   * 保存离线消息
   * @private
   * @param {Object} message - 消息对象
   */
  _saveOfflineMessage(message) {
    this.offlineMessages.push(message);
    // 限制离线消息数量，防止内存溢出
    if (this.offlineMessages.length > 100) {
      this.offlineMessages.shift();
    }
  }
  
  /**
   * 发送离线消息
   * @private
   */
  _sendOfflineMessages() {
    if (this.offlineMessages.length > 0 && this.connected) {
      console.log(`开始发送${this.offlineMessages.length}条离线消息`);
      
      // 复制消息队列，避免在发送过程中修改
      const messagesToSend = [...this.offlineMessages];
      this.offlineMessages = [];
      
      // 批量发送消息
      messagesToSend.forEach(message => {
        this.send({
          ...message,
          isOfflineMessage: true
        });
      });
      
      console.log('离线消息发送完成');
    }
  }
  
  /**
   * 获取连接状态
   * @returns {Object} 连接状态信息
   */
  getConnectionStatus() {
    return {
      connected: this.connected,
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      offlineMessagesCount: this.offlineMessages.length
    };
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    this.disconnect();
    this.listeners.clear();
    this.offlineMessages = [];
  }
}

// 创建单例实例
const webSocketService = new WebSocketService();

// 导出
module.exports = {
  instance: webSocketService,
  WS_CONFIG,
  WebSocketService
};
