/**
 * 文件名: app.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 小程序入口文件，负责初始化全局服务、状态管理和组件注册
 */

const i18n = require('./utils/i18n');
const store = require('./utils/store.js');
const componentManager = require('./components/index.js');
const cacheService = require('./utils/cacheService.js').instance;
const cacheConfig = require('./utils/cacheConfig.js').getConfig();
const webSocketService = require('./utils/webSocketService.js').instance;
const WS_CONFIG = require('./utils/webSocketService.js').WS_CONFIG;

/**
 * 应用入口
 * @returns {void}
 */
App({
  /**
   * 应用启动回调
   * @returns {void}
   */
  onLaunch() {
    // 初始化全局状态
    this.globalData = {
      startedAt: Date.now(),
      websocketConnected: false
    };
    
    // 初始化状态管理
    this.initStore();
    
    // 初始化国际化
    this.initI18n();
    
    // 初始化缓存服务
    this.initCache();
    
    // 初始化组件
    this.initComponents();
    
    // 初始化WebSocket服务
    this.initWebSocket();
    
    // 初始化错误处理
    this.initErrorHandler();
  },

  /**
   * 初始化全局状态管理
   */
  initStore: function() {
    // 从本地存储恢复状态
    store.restore();
    
    // 将store挂载到app实例上，方便访问
    this.globalData.store = store;
  },
  
  /**
   * 初始化语言设置
   */
  initLanguage: function() {
    try {
      const sys = wx.getSystemInfoSync();
      const lang = (sys.language || '').toLowerCase();
      if (lang.startsWith('en')) {
        i18n.setLocale('en_US');
      } else {
        i18n.setLocale('zh_CN');
      }
    } catch {
      // 兼容无系统信息的场景，保持默认语言
    }
  },
  
  /**
   * 初始化全局错误处理
   */
  initErrorHandler: function() {
    wx.onError((error) => {
      console.error('App Error:', error);
      
      // 更新store中的错误状态
      if (this.globalData.store) {
        store.commit('SET_ERROR', error);
      }
      
      try {
        wx.showToast({ title: '发生错误', icon: 'none' });
      } catch {
        // 静默失败
      }
    });
  },

  /**
   * 初始化全局组件
   */
  initComponents: function() {
    componentManager.registerGlobalComponents(this);
  },
  
  /**
   * 初始化缓存服务
   */
  async initCache() {
    try {
      // 初始化缓存服务
      await cacheService.init(cacheConfig);
      console.log('缓存服务初始化成功');
      
      // 监听网络状态变化，自动清理过期缓存
      wx.onNetworkStatusChange((res) => {
        if (res.isConnected) {
          console.log('网络已连接，开始清理过期缓存');
          cacheService.cleanupExpired();
          // 网络恢复时，尝试重连WebSocket
          if (this.globalData.userInfo) {
            console.log('尝试重新连接WebSocket...');
            webSocketService.connect();
          }
        } else {
          console.log('网络断开连接');
        }
      });
    } catch (error) {
      console.error('缓存服务初始化失败:', error);
    }
  },
  
  /**
   * 初始化国际化
   */
  initI18n: function() {
    this.initLanguage();
  },
  
  /**
   * 初始化WebSocket服务
   */
  async initWebSocket() {
    try {
      // 只有在用户已登录的情况下才初始化WebSocket
      const userInfo = store.getState('user.userInfo');
      const token = store.getState('user.token');
      
      if (userInfo && token) {
        // 注册WebSocket事件监听器
        this._registerWebSocketListeners();
        
        // 建立WebSocket连接
        await webSocketService.connect();
      }
    } catch (error) {
      console.error('WebSocket初始化失败:', error);
    }
  },
  
  /**
   * 注册WebSocket事件监听器
   * @private
   */
  _registerWebSocketListeners() {
    // 监听连接状态变化
    webSocketService.on('connected', () => {
      console.log('WebSocket连接成功');
      this.globalData.websocketConnected = true;
    });
    
    webSocketService.on('disconnected', () => {
      console.log('WebSocket连接断开');
      this.globalData.websocketConnected = false;
    });
    
    webSocketService.on('error', (error) => {
      console.error('WebSocket错误:', error);
      // 可以在这里添加错误处理逻辑，例如显示错误提示
    });
    
    // 监听用户消息
    webSocketService.on(WS_CONFIG.MSG_TYPE.USER_MESSAGE, (data) => {
      console.log('收到用户消息:', data);
      // 处理用户消息，例如更新UI或存储到消息列表
      this._handleUserMessage(data);
    });
    
    // 监听系统通知
    webSocketService.on(WS_CONFIG.MSG_TYPE.SYSTEM_NOTIFICATION, (data) => {
      console.log('收到系统通知:', data);
      // 处理系统通知，例如显示通知提示
      this._handleSystemNotification(data);
    });
    
    // 监听重连尝试达到最大次数
    webSocketService.on('maxReconnectAttemptsReached', (info) => {
      console.warn(`WebSocket重连失败，已达到最大尝试次数(${info.maxAttempts})`);
      // 可以在这里添加用户提示，例如提示用户检查网络连接
    });
  },
  
  /**
   * 处理用户消息
   * @private
   * @param {Object} data - 消息数据
   */
  _handleUserMessage(data) {
    // 根据消息类型进行不同处理
    const { type, content, sender } = data;
    
    // 显示消息提示
    wx.showToast({
      title: `${sender}: ${content.substring(0, 20)}...`,
      icon: 'none',
      duration: 3000
    });
    
    // 这里可以添加更多的消息处理逻辑
    // 例如更新消息列表、存储消息等
  },
  
  /**
   * 处理系统通知
   * @private
   * @param {Object} data - 通知数据
   */
  _handleSystemNotification(data) {
    const { title, content, priority = 'normal' } = data;
    
    // 根据通知优先级进行不同处理
    if (priority === 'high') {
      // 高优先级通知显示弹窗
      wx.showModal({
        title: title || '系统通知',
        content: content,
        showCancel: false
      });
    } else {
      // 普通优先级通知显示Toast
      wx.showToast({
        title: content,
        icon: 'none',
        duration: 3000
      });
    }
    
    // 这里可以添加更多的通知处理逻辑
    // 例如更新通知列表、存储通知等
  },
  
  /**
   * 全局错误处理
   * @param {string} _err - 错误信息
   */
  onError(_err) {
    console.error('全局错误:', _err);
  },
  
  /**
   * 应用显示时的处理
   */
  onShow() {
    // 应用显示时，如果已登录且WebSocket未连接，尝试重新连接
    const userInfo = store.getState('user.userInfo');
    const token = store.getState('user.token');
    
    if (userInfo && token && !this.globalData.websocketConnected) {
      console.log('应用显示，尝试重新连接WebSocket');
      this.initWebSocket();
    }
  },
  
  /**
   * 应用隐藏时的处理
   */
  onHide() {
    // 应用隐藏时，可以选择是否保持WebSocket连接
    // 这里我们保持连接，以接收重要通知
    // 如果需要断开连接，可以取消注释下面的代码
    // webSocketService.disconnect(1000, '应用隐藏');
  },
  
  /**
   * 获取WebSocket服务实例
   * @returns {Object} WebSocket服务实例
   */
  getWebSocketService() {
    return webSocketService;
  }
});
