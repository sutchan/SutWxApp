﻿/**
 * 文件名: app.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-27
 * 作者: Sut
 * 描述: 小程序入口文件，负责初始化应用、配置全局状态、管理组件和服务等 */

const i18n = require('./utils/i18n');
const store = require('./utils/store.js');
const componentManager = require('./components');
const cacheService = require('./utils/cacheService.js').instance;
const cacheConfig = require('./utils/cacheConfig.js').getConfig();
const webSocketService = require('./utils/webSocketService.js').instance;

/**
 * 小程序应用实例
 * @returns {void}
 */
App({
  /**
   * 应用启动时执行
   * @returns {void}
   */
  onLaunch() {
    // 初始化全局数据
    this.globalData = {
      startedAt: Date.now(),
      websocketConnected: false
    };
    
    // 初始化状态管理
    this.initStore();
    
    // 初始化国际化
    this.initI18n();
    
    // 初始化缓存
    this.initCache();
    
    // 初始化组件
    this.initComponents();
    
    // 初始化WebSocket
    this.initWebSocket();
    
    // 初始化错误处理器
    this.initErrorHandler();
  },

  /**
   * 初始化状态管理
   * @returns {void}
   */
  initStore() {
    // 恢复状态
    store.restore();
    
    // 将store实例添加到全局数据中
    this.globalData.store = store;
  },
  
  /**
   * 初始化语言设置
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
      // 语言设置失败时的容错处理
    }
  },
  
  /**
   * 初始化错误处理器
   * @returns {void}
   */
  initErrorHandler() {
    wx.onError((error) => {
      console.error('App Error:', error);
      
      // 如果store可用，保存错误信息
      if (this.globalData.store) {
        store.commit('SET_ERROR', error);
      }
      
      try {
        wx.showToast({ title: '系统出错了', icon: 'none' });
      } catch {
        // 显示提示失败时的容错处理
      }
    });
  },

  /**
   * 初始化组件
   * @returns {void}
   */
  initComponents() {
    componentManager.registerGlobalComponents(this);
  },
  
  /**
   * 初始化缓存
   * @returns {Promise<void>}
   */
  async initCache() {
    try {
      // 初始化缓存服务
      await cacheService.init(cacheConfig);
      console.log('缓存服务初始化成功');
      
      // 监听网络状态变化
      wx.onNetworkStatusChange((res) => {
        if (res.isConnected) {
          console.log('网络已连接，清理过期缓存');
          cacheService.cleanupExpired();
          // 如果用户已登录，重新连接WebSocket
          if (this.globalData.userInfo) {
            console.log('用户已登录，重新连接WebSocket...');
            webSocketService.connect();
          }
        } else {
          console.log('网络已断开');
        }
      });
    } catch (error) {
      console.error('缓存服务初始化失败:', error);
    }
  },
  
  /**
   * 初始化国际化
   * @returns {void}
   */
  initI18n() {
    this.initLanguage();
  },
  
  /**
   * 初始化WebSocket
   * @returns {Promise<void>}
   */
  async initWebSocket() {
    try {
      // 获取用户信息和令牌
      const userInfo = store.getState('user.userInfo');
      const token = store.getState('user.token');
      
      if (userInfo && token) {
        // 注册WebSocket监听器
        if (!this._webSocketListenersRegistered) {
          // 注册WebSocket事件监听器
          this._registerWebSocketListeners();
          this._webSocketListenersRegistered = true;
        }
        
        // 连接WebSocket
        await webSocketService.connect();
      }
    } catch (error) {
      console.error('WebSocket初始化失败:', error);
    }
  },
  
  /**
   * 注册WebSocket监听器
   * @private
   * @returns {void}
   */
  _registerWebSocketListeners() {
    // 连接成功事件
    webSocketService.on('connected', () => {
      console.log('WebSocket连接成功');
      this.globalData.websocketConnected = true;
    });
    
    // 断开连接事件
    webSocketService.on('disconnected', () => {
      console.log('WebSocket连接断开');
      this.globalData.websocketConnected = false;
    });
    
    // 错误事件
    webSocketService.on('error', (error) => {
      console.error('WebSocket错误:', error);
      // 错误处理逻辑
    });
    
    // 用户消息事件
    webSocketService.on('userMessage', (data) => {
      console.log('收到用户消息:', data);
      // 处理用户消息
      this._handleUserMessage(data);
    });
    
    // 系统通知事件
    webSocketService.on('systemNotification', (data) => {
      console.log('收到系统通知:', data);
      // 处理系统通知
      this._handleSystemNotification(data);
    });
    
    // 最大重连尝试次数达到事件
    webSocketService.on('maxReconnectAttemptsReached', (info) => {
      console.warn(`WebSocket重连失败，已达到最大尝试次数(${info.maxAttempts})`);
      // 重连失败处理逻辑
    });
  },
  
  /**
   * 处理用户消息
   * @private
   * @param {Object} messageData - 消息数据
   * @returns {void}
   */
  _handleUserMessage(messageData) {
    // 解构消息数据
    const { type, content, sender } = messageData;
    
    // 显示消息提示
    wx.showToast({
      title: `${sender}: ${content.substring(0, 20)}...`,
      icon: 'none',
      duration: 3000
    });
    
    // 可以在这里添加更多消息处理逻辑
  },
  
  /**
   * 处理系统通知
   * @private
   * @param {Object} notificationData - 通知数据
   * @returns {void}
   */
  _handleSystemNotification(notificationData) {
    const { title, content, priority = 'normal' } = notificationData;
    
    // 根据优先级显示不同的提示
    if (priority === 'high') {
      // 高优先级通知使用模态框
      wx.showModal({
        title: title || '系统通知',
        content: content,
        showCancel: false
      });
    } else {
      // 普通优先级通知使用Toast
      wx.showToast({
        title: content,
        icon: 'none',
        duration: 3000
      });
    }
    
    // 可以在这里添加更多通知处理逻辑
  },
  
  /**
   * 应用错误事件处理
   * @param {string} error - 错误信息
   * @returns {void}
   */
  onError(error) {
    console.error('应用错误:', error);
    // 保存错误信息到store
    if (this.globalData.store) {
      this.globalData.store.commit('SET_ERROR', error);
    }
    
    try {
      wx.showToast({ title: '系统出错了', icon: 'none' });
    } catch {
      // 显示提示失败时的容错处理
    }
  },
  
  /**
   * 应用显示事件处理
   * @returns {void}
   */
  onShow() {
    // 检查用户登录状态和WebSocket连接状态
    const userInfo = store.getState('user.userInfo');
    const token = store.getState('user.token');
    
    if (userInfo && token && !this.globalData.websocketConnected) {
      console.log('用户已登录但WebSocket未连接，尝试重新连接');
      // 重新连接WebSocket
      webSocketService.connect();
    }
  },
  
  /**
   * 应用隐藏事件处理
   * @returns {void}
   */
  onHide() {
    // 应用隐藏时的处理逻辑
    // 通常不建议在这里断开WebSocket连接，除非有特殊需求
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
