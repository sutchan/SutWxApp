/**
 * 文件名 webSocketService.js
 * 版本号 1.0.2
 * 更新日期: 2025-11-29
 * 作者: Sut
 * WebSocket服务类，用于处理WebSocket连接、消息发送和接收
 */

const store = require('./store.js');
const i18n = require('./i18n.js');

// WebSocket配置
const WS_CONFIG = {
  // WebSocket服务器地址
  WS_URL: 'wss://api.example.com/ws',
  WS_TEST_URL: 'wss://test-api.example.com/ws',
  USE_TEST: false,
  
  // 连接配置
  RECONNECT_DELAY: 3000, // 重连延迟（毫秒）
  MAX_RECONNECT_ATTEMPTS: 5, // 最大重连次数
  HEARTBEAT_INTERVAL: 30000, // 心跳间隔（毫秒）
  
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
    this.listeners = new Map();
    this.offlineMessages = [];
    this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
  }

  /**
   * 连接WebSocket服务器
   * @returns {Promise} 连接结果
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // 如果已经连接或正在连接，直接返回
        if (this.connectionStatus === WS_CONFIG.CONNECTION_STATUS.OPEN || 
            this.connectionStatus === WS_CONFIG.CONNECTION_STATUS.CONNECTING) {
          resolve(this.connected);
          return;
        }

        // 获取WebSocket URL
        const baseUrl = WS_CONFIG.USE_TEST ? WS_CONFIG.WS_TEST_URL : WS_CONFIG.WS_URL;
        const token = store.getState('user.token') || '';
        const url = `${baseUrl}?token=${token}`;

        // 更新连接状态
        this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CONNECTING;

        // 创建WebSocket连接
        this.socket = wx.connectSocket({
          url,
          header: {
            'content-type': 'application/json'
          },
          protocols: ['protocol1']
        });

        // 监听连接打开
        this.socket.onOpen(() => {
          console.log('WebSocket连接已打开');
          this.connected = true;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.OPEN;
          this.reconnectAttempts = 0;
          
          // 发送离线消息
          this._sendOfflineMessages();
          
          // 启动心跳
          this._startHeartbeat();
          
          resolve(true);
        });

        // 监听连接关闭
        this.socket.onClose(() => {
          console.log('WebSocket连接已关闭');
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          this._stopHeartbeat();
          this._handleReconnect();
        });

        // 监听错误
        this.socket.onError((error) => {
          console.error('WebSocket连接错误:', error);
          this.connected = false;
          this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
          reject(error);
        });

        // 监听消息
        this.socket.onMessage((res) => {
          this._handleMessage(res.data);
        });

      } catch (error) {
        console.error('WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   * @param {number} code - 关闭代码
   * @param {string} reason - 关闭原因
   */
  disconnect(code = 1000, reason = '正常关闭') {
    // 取消重连
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // 停止心跳
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
   * @param {Object} message - 消息内容
   * @returns {boolean} 发送结果
   */
  send(message) {
    if (!this.connected) {
      // 离线消息处理
      this.offlineMessages.push(message);
      // 尝试重新连接
      this.connect();
      return false;
    }

    try {
      this.socket.send({
        data: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('WebSocket发送消息失败:', error);
      return false;
    }
  }

  /**
   * 监听消息
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // 返回取消监听函数
    return () => {
      this.off(eventType, callback);
    };
  }

  /**
   * 取消监听
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * 处理接收到的消息
   * @private
   * @param {string} message - 消息内容
   */
  _handleMessage(message) {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, data } = parsedMessage;

      // 心跳响应
      if (type === WS_CONFIG.MSG_TYPE.HEARTBEAT_RESPONSE) {
        // 心跳响应，无需处理
        return;
      }

      // 通知所有监听器
      if (this.listeners.has(type)) {
        this.listeners.get(type).forEach(callback => {
          try {
            callback(data, parsedMessage);
          } catch (error) {
            console.error(`WebSocket消息处理错误 (${type}):`, error);
          }
        });
      }

      // 通知通用消息监听器
      if (this.listeners.has('message')) {
        this.listeners.get('message').forEach(callback => {
          try {
            callback({ type, data });
          } catch (error) {
            console.error('WebSocket通用消息处理错误:', error);
          }
        });
      }
    } catch (error) {
      console.error('WebSocket消息解析错误:', error, message);
    }
  }

  /**
   * 启动心跳
   * @private
   */
  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.send({
          type: WS_CONFIG.MSG_TYPE.HEARTBEAT,
          timestamp: Date.now()
        });
      }
    }, WS_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * 停止心跳
   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 处理重连
   * @private
   */
  _handleReconnect() {
    if (this.reconnectAttempts >= WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.error('WebSocket重连失败，已达到最大重连次数');
      this.connectionStatus = WS_CONFIG.CONNECTION_STATUS.CLOSED;
      return;
    }

    // 计算重连延迟（指数退避）
    const baseDelay = WS_CONFIG.RECONNECT_DELAY;
    const randomDelay = Math.random() * 1000; // 0-1秒随机延迟
    const delay = baseDelay * Math.pow(1.5, this.reconnectAttempts) + randomDelay;

    console.log(`WebSocket将在 ${Math.round(delay / 1000)} 秒后尝试重连...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`WebSocket尝试重连 (${this.reconnectAttempts}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
      this.connect();
    }, delay);
  }

  /**
   * 发送离线消息
   * @private
   */
  _sendOfflineMessages() {
    if (this.offlineMessages.length > 0 && this.connected) {
      console.log(`发送 ${this.offlineMessages.length} 条离线消息`);
      
      // 逐个发送离线消息
      this.offlineMessages.forEach(message => {
        this.send(message);
      });
      
      // 清空离线消息
      this.offlineMessages = [];
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
}

// 导出单例实例
const instance = new WebSocketService();

module.exports = {
  instance,
  WebSocketService,
  WS_CONFIG
};