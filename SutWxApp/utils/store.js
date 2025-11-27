/**
 * 文件名: store.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 全局状态管理器，基于观察者模式实现的简易状态管理方案，提供状态管理和组件间通信功能
 */

/**
 * 全局状态管理器
 * 使用观察者模式实现状态的集中管理和组件间通信
 */
class Store {
  constructor() {
    this.state = {
      // 用户相关状态
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
      // 全局UI状态
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
    this.listeners = new Map(); // 存储状态监听器
    this.mutations = new Map(); // 存储状态变更方法
  }

  /**
   * 获取状态
   * @param {string} path - 状态路径，如 'user.userInfo'
   * @returns {*} 状态值
   */
  getState(path = '') {
    if (!path) return this.state;
    
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, this.state);
  }

  /**
   * 注册状态变更方法
   * @param {string} name - 变更方法名
   * @param {Function} mutation - 变更方法
   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 提交状态变更
   * @param {string} name - 变更方法名
   * @param {*} payload - 变更参数
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      console.warn(`Mutation ${name} not found`);
      return;
    }
    
    const mutation = this.mutations.get(name);
    try {
      // 执行状态变更
      const newState = mutation(this.state, payload);
      if (newState !== undefined) {
        this.state = { ...this.state, ...newState };
      }
      // 通知所有监听器
      this.notify();
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 注册状态监听器
   * @param {string} id - 监听器唯一标识
   * @param {Function} callback - 状态变化回调函数
   */
  subscribe(id, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.listeners.set(id, callback);
  }

  /**
   * 取消状态监听
   * @param {string} id - 监听器唯一标识
   */
  unsubscribe(id) {
    this.listeners.delete(id);
  }

  /**
   * 通知所有监听器状态已更新
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
   * 持久化状态到本地存储
   * @param {string} key - 本地存储键名
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
   * @param {string} key - 本地存储键名
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

// 创建并导出store实例
const store = new Store();

// 注册常用的状态变更方法
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
