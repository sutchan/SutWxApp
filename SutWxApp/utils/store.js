﻿﻿/**
 * 文件名 store.js
 * 版本号 1.0.2
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 状态管理类，用于管理应用的全局状态
 */

/**
 * 状态管理类
 * 用于管理应用的全局状态，支持状态订阅、状态变更等功能
 */
class Store {
  constructor() {
    this.state = {
      // 用户状态
      user: {
        isLoggedIn: false,
        userInfo: null,
        token: null
      },
      // 购物车状态
      cart: {
        items: [],
        total: 0
      },
      // UI状态
      ui: {
        loading: false,
        error: null
      },
      // 积分状态
      points: {
        balance: 0,
        tasks: []
      }
    };
    this.listeners = new Map(); // 状态监听器
    this.mutations = new Map(); // 状态变更函数
  }

  /**
   * 获取状态
   * @param {string} path - 状态路径，如'user.userInfo'
   * @returns {*} 状态值
   */
  getState(path = '') {
    if (!path) return this.state;
    
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, this.state);
  }

  /**
   * 注册状态变更函数
   * @param {string} name - 变更函数名称
   * @param {Function} mutation - 变更函数
   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 提交状态变更
   * @param {string} name - 变更函数名称
   * @param {*} payload - 变更数据
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      console.warn(`Mutation ${name} not found`);
      return;
    }
    
    const mutation = this.mutations.get(name);
    try {
      // 执行变更函数
      const newState = mutation(this.state, payload);
      if (newState !== undefined) {
        const oldState = this.state;
        this.state = { ...this.state, ...newState };
        
        // 通知监听器
        if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
          this.notify();
        }
      }
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 订阅状态变化
   * @param {string} id - 订阅者ID
   * @param {Function} callback - 回调函数
   */
  subscribe(id, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.listeners.set(id, callback);
  }

  /**
   * 取消订阅
   * @param {string} id - 订阅者ID
   */
  unsubscribe(id) {
    this.listeners.delete(id);
  }

  /**
   * 通知所有监听器
   */
  notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  }

  /**
   * 持久化状态
   * @param {string} key - 存储键名
   */
  persist(key = 'sutwxapp_state') {
    try {
      wx.setStorageSync(key, this.state);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * 从本地存储恢复状态
   * @param {string} key - 存储键名
   */
  restore(key = 'sutwxapp_state') {
    try {
      const savedState = wx.getStorageSync(key);
      if (savedState) {
        this.state = { ...this.state, ...savedState };
        this.notify();
      }
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
  }
}

// 导出单例实例
const store = new Store();

// 注册默认的mutations
store.registerMutation('SET_USER_INFO', (state, userInfo) => ({
  user: {
    ...state.user,
    userInfo,
    isLoggedIn: !!userInfo
  }
}));

store.registerMutation('SET_TOKEN', (state, token) => ({
  user: {
    ...state.user,
    token
  }
}));

store.registerMutation('LOGOUT', () => ({
  user: {
    isLoggedIn: false,
    userInfo: null,
    token: null
  }
}));

store.registerMutation('SET_LOADING', (state, loading) => ({
  ui: {
    ...state.ui,
    loading
  }
}));

store.registerMutation('SET_ERROR', (state, error) => ({
  ui: {
    ...state.ui,
    error
  }
}));

store.registerMutation('SET_POINTS_BALANCE', (state, balance) => ({
  points: {
    ...state.points,
    balance
  }
}));

module.exports = store;