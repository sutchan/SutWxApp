/**
 * 文件名: componentFactory.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: 组件工厂 - 提供组件创建和生命周期管理增强功能
 */

const store = require('./store.js');
const i18n = require('./i18n.js');

/**
 * 组件生命周期钩子包装器
 * 提供统一的生命周期处理和错误捕获
 * @param {Function} hook - 原始钩子函数
 * @param {string} hookName - 钩子名称
 * @param {Object} options - 选项配置
 * @returns {Function} 包装后的钩子函数
 */
function wrapHook(hook, hookName, options = {}) {
  return function(...args) {
    try {
      if (typeof hook === 'function') {
        return hook.apply(this, args);
      }
    } catch (error) {
      console.error(`组件生命周期钩子 ${hookName} 执行失败:`, error);
      if (options.errorHandler && typeof options.errorHandler === 'function') {
        options.errorHandler(error, hookName);
      }
    }
    return undefined;
  };
}

/**
 * 创建组件配置对象
 * 自动集成状态管理、国际化和生命周期钩子处理
 * @param {Object} config - 组件配置
 * @returns {Object} 增强的组件配置
 */
function createComponent(config = {}) {
  // 默认配置
  const defaultConfig = {
    data: {},
    properties: {},
    methods: {},
    lifetimes: {},
    pageLifetimes: {},
    options: {},
    relations: {},
    observers: {},
    externalClasses: []
  };

  // 合并配置
  const mergedConfig = { ...defaultConfig, ...config };
  
  // 自动集成状态管理
  if (config.mapState) {
    mergedConfig.data = { ...mergedConfig.data, ...mapStateToData(config.mapState) };
    mergedConfig.lifetimes = mergedConfig.lifetimes || {};
    
    // 增强生命周期钩子以响应状态更新
    const originalAttached = mergedConfig.lifetimes.attached || function() {};
    mergedConfig.lifetimes.attached = wrapHook(function() {
      // 初始化状态映射
      this._stateUnsubscribe = store.subscribe(() => {
        this.setData(mapStateToData(config.mapState));
      });
      originalAttached.call(this);
    }, 'attached');
    
    // 在detached时清理订阅
    const originalDetached = mergedConfig.lifetimes.detached || function() {};
    mergedConfig.lifetimes.detached = wrapHook(function() {
      if (this._stateUnsubscribe) {
        this._stateUnsubscribe();
      }
      originalDetached.call(this);
    }, 'detached');
  }
  
  // 自动集成国际化
  if (config.useI18n !== false) {
    mergedConfig.methods = mergedConfig.methods || {};
    mergedConfig.methods.__ = function(key, options) {
      return i18n.t(key, options);
    };
  }
  
  // 包装所有生命周期钩子
  const lifecycleHooks = [
    'created', 'attached', 'ready', 'moved', 'detached', 'error'
  ];
  
  lifecycleHooks.forEach(hookName => {
    if (mergedConfig.lifetimes[hookName]) {
      mergedConfig.lifetimes[hookName] = wrapHook(
        mergedConfig.lifetimes[hookName], 
        hookName,
        { errorHandler: config.errorHandler }
      );
    }
  });
  
  // 包装页面生命周期钩子
  const pageLifecycleHooks = [
    'show', 'hide', 'resize', 'routeDone'
  ];
  
  pageLifecycleHooks.forEach(hookName => {
    if (mergedConfig.pageLifetimes[hookName]) {
      mergedConfig.pageLifetimes[hookName] = wrapHook(
        mergedConfig.pageLifetimes[hookName], 
        hookName,
        { errorHandler: config.errorHandler }
      );
    }
  });
  
  // 包装methods中的方法
  if (mergedConfig.methods) {
    Object.keys(mergedConfig.methods).forEach(methodName => {
      if (typeof mergedConfig.methods[methodName] === 'function' && 
          !methodName.startsWith('_') && 
          methodName !== '__') {
        mergedConfig.methods[methodName] = wrapHook(
          mergedConfig.methods[methodName], 
          methodName,
          { errorHandler: config.errorHandler }
        );
      }
    });
  }
  
  return mergedConfig;
}

/**
 * 将状态映射转换为data对象
 * @param {Object|Function} mapState - 状态映射配置
 * @returns {Object} 转换后的data对象
 */
function mapStateToData(mapState) {
  const state = store.state;
  const data = {};
  
  if (typeof mapState === 'function') {
    return mapState(state) || {};
  }
  
  if (typeof mapState === 'object') {
    Object.keys(mapState).forEach(key => {
      if (typeof mapState[key] === 'function') {
        data[key] = mapState[key](state);
      } else if (typeof mapState[key] === 'string') {
        // 支持路径访问，如 'user.info.name'
        const pathParts = mapState[key].split('.');
        let value = state;
        for (const part of pathParts) {
          if (value === undefined || value === null) break;
          value = value[part];
        }
        data[key] = value;
      }
    });
  }
  
  return data;
}

/**
 * 组件通信总线
 * 提供组件间的事件通信机制
 */
const eventBus = {
  _events: {},
  
  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅的函数
   */
  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
    
    // 返回取消订阅函数
    return () => {
      this.off(eventName, callback);
    };
  },
  
  /**
   * 取消订阅
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数（可选，不提供则取消该事件的所有订阅）
   */
  off(eventName, callback) {
    if (!this._events[eventName]) return;
    
    if (callback) {
      this._events[eventName] = this._events[eventName].filter(
        cb => cb !== callback
      );
    } else {
      delete this._events[eventName];
    }
  },
  
  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  emit(eventName, data) {
    if (!this._events[eventName]) return;
    
    this._events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件 ${eventName} 处理失败:`, error);
      }
    });
  }
};

/**
 * 组件工具集
 */
const componentUtils = {
  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  },
  
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  },
  
  /**
   * 安全地设置数据，避免不必要的更新
   * @param {Object} component - 组件实例
   * @param {Object} data - 要设置的数据
   */
  safeSetData(component, data) {
    if (!component || typeof component.setData !== 'function') return;
    
    // 过滤掉与当前数据相同的值
    const changedData = {};
    Object.keys(data).forEach(key => {
      if (component.data[key] !== data[key]) {
        changedData[key] = data[key];
      }
    });
    
    if (Object.keys(changedData).length > 0) {
      component.setData(changedData);
    }
  }
};

module.exports = {
  createComponent,
  eventBus,
  componentUtils,
  wrapHook
};
