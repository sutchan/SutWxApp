/**
 * 文件名: stateManager.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: 细粒度状态管理系统
 * 支持模块化状态、异步操作、细粒度订阅和状态持久化配置
 */

// 导入预定义的状态模块
const stateModules = require('./stateModules.js');

/**
 * 细粒度状态管理器
 * 支持模块化状态、异步操作、精确订阅和高级持久化配置
 */
class StateManager {
  constructor(modules = {}) {
    // 合并预定义模块和传入的模块
    this.modules = { ...stateModules, ...modules };
    
    this.state = {};
    this.mutations = new Map();
    this.actions = new Map();
    this.getters = new Map();
    this.listeners = new Map(); // 全局监听器
    this.pathListeners = new Map(); // 路径级监听器
    this.nextListenerId = 0;
    this.isPersisting = false;
    
    // 初始化所有模块
    Object.keys(this.modules).forEach(moduleName => {
      this.registerModule(moduleName, this.modules[moduleName]);
    });
  }

  /**
   * 注册状态模块
   * @param {string} moduleName - 模块名称
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} moduleConfig.state - 初始状态
   * @param {Object} moduleConfig.mutations - 变更方法
   * @param {Object} moduleConfig.actions - 异步操作方法
   * @param {Object} moduleConfig.getters - 计算属性
   * @param {Object} moduleConfig.persist - 持久化配置
   */
  registerModule(moduleName, moduleConfig) {
    const { state = {}, mutations = {}, actions = {}, getters = {}, persist = false } = moduleConfig;
    
    // 初始化模块状态
    this.state[moduleName] = { ...state };
    this.modules[moduleName] = { state, persist };
    
    // 注册模块的mutations
    Object.entries(mutations).forEach(([key, mutation]) => {
      this.registerMutation(`${moduleName}/${key}`, (rootState, payload) => {
        const newState = mutation(this.state[moduleName], payload, rootState);
        if (newState !== undefined) {
          return {
            [moduleName]: { ...this.state[moduleName], ...newState }
          };
        }
      });
    });
    
    // 注册模块的actions
    Object.entries(actions).forEach(([key, action]) => {
      this.registerAction(`${moduleName}/${key}`, action);
    });
    
    // 注册模块的getters
    Object.entries(getters).forEach(([key, getter]) => {
      this.registerGetter(`${moduleName}/${key}`, (state) => {
        return getter(state[moduleName], state, this.gettersMap);
      });
    });
    
    console.log(`Module ${moduleName} registered successfully`);
  }

  /**
   * 注册全局状态模块
   * @param {Object} moduleConfig - 全局模块配置
   */
  registerGlobalModule(moduleConfig) {
    this.registerModule('global', moduleConfig);
  }

  /**
   * 获取完整状态
   * @returns {Object} 完整状态树
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 根据路径获取状态
   * @param {string} path - 状态路径，如 'user.userInfo' 或 'user'
   * @returns {*} 状态值
   */
  get(path) {
    if (!path) return this.getState();
    
    const [moduleName, ...restPath] = path.split('.');
    
    // 检查是否是完整的模块
    if (restPath.length === 0 && this.state[moduleName] !== undefined) {
      return { ...this.state[moduleName] };
    }
    
    // 获取具体路径的值
    let currentState = this.state;
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, currentState);
  }

  /**
   * 注册mutation
   * @param {string} name - mutation名称
   * @param {Function} mutation - mutation函数
   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 注册action
   * @param {string} name - action名称
   * @param {Function} action - action函数
   */
  registerAction(name, action) {
    if (typeof action !== 'function') {
      throw new Error(`Action for ${name} must be a function`);
    }
    this.actions.set(name, action);
  }

  /**
   * 注册getter
   * @param {string} name - getter名称
   * @param {Function} getter - getter函数
   */
  registerGetter(name, getter) {
    if (typeof getter !== 'function') {
      throw new Error(`Getter for ${name} must be a function`);
    }
    this.getters.set(name, getter);
  }

  /**
   * 计算getters映射
   * @private
   */
  get gettersMap() {
    const map = {};
    this.getters.forEach((getter, name) => {
      map[name] = getter(this.state);
    });
    return map;
  }

  /**
   * 获取getter值
   * @param {string} name - getter名称
   * @returns {*} getter计算结果
   */
  getGetter(name) {
    if (!this.getters.has(name)) {
      console.warn(`Getter ${name} not found`);
      return undefined;
    }
    
    return this.getters.get(name)(this.state);
  }

  /**
   * 提交mutation
   * @param {string} name - mutation名称，支持 'module/mutationName' 格式
   * @param {*} payload - 载荷
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      // 尝试解析可能的模块路径格式
      if (name.includes('/')) {
        const [moduleName, mutationName] = name.split('/');
        const fullName = `${moduleName}/${mutationName}`;
        
        if (this.mutations.has(fullName)) {
          name = fullName;
        } else {
          console.warn(`Mutation ${name} not found`);
          return;
        }
      } else {
        console.warn(`Mutation ${name} not found`);
        return;
      }
    }
    
    const mutation = this.mutations.get(name);
    try {
      // 执行mutation
      const changes = mutation(this.state, payload);
      if (changes) {
        // 应用变更
        this.state = { ...this.state, ...changes };
        // 通知监听器
        this.notify();
        // 触发持久化
        this._handlePersist();
      }
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 分发action
   * @param {string} name - action名称，支持 'module/actionName' 格式
   * @param {*} payload - 载荷
   * @returns {Promise} action执行结果
   */
  async dispatch(name, payload) {
    if (!this.actions.has(name)) {
      // 尝试解析可能的模块路径格式
      if (name.includes('/')) {
        const [moduleName, actionName] = name.split('/');
        const fullName = `${moduleName}/${actionName}`;
        
        if (this.actions.has(fullName)) {
          name = fullName;
        } else {
          console.warn(`Action ${name} not found`);
          return Promise.reject(new Error(`Action ${name} not found`));
        }
      } else {
        console.warn(`Action ${name} not found`);
        return Promise.reject(new Error(`Action ${name} not found`));
      }
    }
    
    const action = this.actions.get(name);
    const context = {
      state: this.getState(),
      commit: this.commit.bind(this),
      dispatch: this.dispatch.bind(this),
      getters: this.gettersMap
    };
    
    try {
      return await action(context, payload);
    } catch (error) {
      console.error(`Error in action ${name}:`, error);
      return Promise.reject(error);
    }
  }

  /**
   * 订阅状态变化
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(callback) {
    const id = this.nextListenerId++;
    this.listeners.set(id, callback);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(id);
    };
  }

  /**
   * 订阅特定路径的状态变化
   * @param {string} path - 状态路径
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribePath(path, callback) {
    const id = this.nextListenerId++;
    
    if (!this.pathListeners.has(path)) {
      this.pathListeners.set(path, new Map());
    }
    
    this.pathListeners.get(path).set(id, callback);
    
    // 返回取消订阅函数
    return () => {
      const pathMap = this.pathListeners.get(path);
      if (pathMap) {
        pathMap.delete(id);
        if (pathMap.size === 0) {
          this.pathListeners.delete(path);
        }
      }
    };
  }

  /**
   * 通知所有监听器
   * @private
   */
  notify() {
    const newState = this.getState();
    
    // 通知全局监听器
    this.listeners.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('Error in global state listener:', error);
      }
    });
    
    // 通知路径级监听器
    this.pathListeners.forEach((callbacks, path) => {
      callbacks.forEach(callback => {
        try {
          const value = this.get(path);
          callback(value, path, newState);
        } catch (error) {
          console.error(`Error in path listener for ${path}:`, error);
        }
      });
    });
  }

  /**
   * 处理状态持久化
   * @private
   */
  _handlePersist() {
    if (this.isPersisting) return;
    
    this.isPersisting = true;
    
    // 使用微任务避免频繁写入
    Promise.resolve().then(() => {
      try {
        // 只持久化配置了persist的模块
        const stateToPersist = {};
        Object.entries(this.modules).forEach(([moduleName, module]) => {
          if (module.persist) {
            stateToPersist[moduleName] = this.state[moduleName];
          }
        });
        
        if (Object.keys(stateToPersist).length > 0) {
          wx.setStorageSync('sutwxapp_state', stateToPersist);
        }
      } catch (error) {
        console.error('Failed to persist state:', error);
      } finally {
        this.isPersisting = false;
      }
    });
  }

  /**
   * 从本地存储恢复状态
   * @returns {Promise<boolean>} 是否成功恢复
   */
  async restoreState() {
    try {
      const savedState = wx.getStorageSync('sutwxapp_state');
      if (savedState) {
        // 只恢复已注册模块的状态
        Object.keys(savedState).forEach(moduleName => {
          if (this.state[moduleName] !== undefined) {
            this.state[moduleName] = { ...this.state[moduleName], ...savedState[moduleName] };
          }
        });
        this.notify();
        return true;
      }
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
    return false;
  }
  
  /**
   * 获取所有已注册模块名称
   * @returns {Array} 模块名称数组
   */
  getRegisteredModules() {
    return Object.keys(this.modules);
  }

  /**
   * 清除持久化状态
   * @param {string} moduleName - 可选，指定要清除的模块
   * @returns {Promise<boolean>} 是否成功清除
   */
  async clearPersistedState(moduleName) {
    try {
      if (moduleName) {
        // 清除特定模块
        const savedState = wx.getStorageSync('sutwxapp_state') || {};
        delete savedState[moduleName];
        wx.setStorageSync('sutwxapp_state', savedState);
      } else {
        // 清除所有状态
        wx.removeStorageSync('sutwxapp_state');
      }
      return true;
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      return false;
    }
  }

  /**
   * 重置所有状态
   */
  resetState() {
    Object.keys(this.modules).forEach(moduleName => {
      this.state[moduleName] = { ...this.modules[moduleName].state };
    });
    this.notify();
  }
}

// 创建并导出状态管理器实例
const stateManager = new StateManager();

// 导出工具函数
module.exports = {
  stateManager,
  // 辅助函数：创建组件的状态映射
  mapState: function(mapOptions) {
    const computed = {};
    
    if (typeof mapOptions === 'function') {
      // 函数形式，接收state参数
      return function() {
        return mapOptions(stateManager.getState());
      };
    }
    
    // 对象形式
    Object.keys(mapOptions).forEach(key => {
      const path = mapOptions[key];
      if (typeof path === 'function') {
        computed[key] = function() {
          return path(stateManager.getState());
        };
      } else {
        computed[key] = function() {
          return stateManager.get(path);
        };
      }
    });
    
    return computed;
  },
  
  // 辅助函数：创建组件的getters映射
  mapGetters: function(mapOptions) {
    const computed = {};
    
    if (Array.isArray(mapOptions)) {
      mapOptions.forEach(getterName => {
        computed[getterName] = function() {
          return stateManager.getGetter(getterName);
        };
      });
    } else if (typeof mapOptions === 'object') {
      Object.keys(mapOptions).forEach(key => {
        const getterName = mapOptions[key];
        computed[key] = function() {
          return stateManager.getGetter(getterName);
        };
      });
    }
    
    return computed;
  },
  
  // 辅助函数：创建组件的mutations映射
  mapMutations: function(mapOptions) {
    const methods = {};
    
    if (Array.isArray(mapOptions)) {
      mapOptions.forEach(mutationName => {
        methods[mutationName] = function(payload) {
          return stateManager.commit(mutationName, payload);
        };
      });
    } else if (typeof mapOptions === 'object') {
      Object.keys(mapOptions).forEach(key => {
        const mutationName = mapOptions[key];
        methods[key] = function(payload) {
          return stateManager.commit(mutationName, payload);
        };
      });
    }
    
    return methods;
  },
  
  // 辅助函数：创建组件的actions映射
  mapActions: function(mapOptions) {
    const methods = {};
    
    if (Array.isArray(mapOptions)) {
      mapOptions.forEach(actionName => {
        methods[actionName] = function(payload) {
          return stateManager.dispatch(actionName, payload);
        };
      });
    } else if (typeof mapOptions === 'object') {
      Object.keys(mapOptions).forEach(key => {
        const actionName = mapOptions[key];
        methods[key] = function(payload) {
          return stateManager.dispatch(actionName, payload);
        };
      });
    }
    
    return methods;
  }
};
