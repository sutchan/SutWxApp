/**
 * 文件名 componentFactory.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 组件工厂函数，用于创建和管理微信小程序组件，提供状态管理、国际化等功能的集成
 */

const store = require('./store.js');
const i18n = require('./i18n.js');

/**
 * 包装组件钩子函数，添加错误处理
 * @param {Function} hook - 钩子函数
 * @param {string} hookName - 钩子名称
 * @param {Object} options - 选项
 * @returns {Function} 包装后的钩子函数
 */
function wrapHook(hook, hookName, options = {}) {
  return function(...args) {
    try {
      if (typeof hook === 'function') {
        return hook.apply(this, args);
      }
    } catch (error) {
      console.error(`组件钩子函数 ${hookName} 执行出错`, error);
      if (options.errorHandler && typeof options.errorHandler === 'function') {
        options.errorHandler(error, hookName);
      }
    }
    return undefined;
  };
}

/**
 * 创建组件
 * 用于生成微信小程序组件配置，集成状态管理、国际化等功能
 * @param {Object} config - 组件配置
 * @returns {Object} 处理后的组件配置
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
  
  // 集成状态管理
  if (config.mapState) {
    mergedConfig.data = { ...mergedConfig.data, ...mapStateToData(config.mapState) };
    mergedConfig.lifetimes = mergedConfig.lifetimes || {};
    
    // 监听组件挂载和卸载生命周期
    const originalAttached = mergedConfig.lifetimes.attached || function() {};
    mergedConfig.lifetimes.attached = wrapHook(function() {
      // 订阅状态变化
      this._stateUnsubscribe = store.subscribe(() => {
        this.setData(mapStateToData(config.mapState));
      });
      originalAttached.call(this);
    }, 'attached');
    
    // 监听组件卸载
    const originalDetached = mergedConfig.lifetimes.detached || function() {};
    mergedConfig.lifetimes.detached = wrapHook(function() {
      if (this._stateUnsubscribe) {
        this._stateUnsubscribe();
      }
      originalDetached.call(this);
    }, 'detached');
  }
  
  // 集成国际化
  if (config.useI18n !== false) {
    mergedConfig.methods = mergedConfig.methods || {};
    mergedConfig.methods.__ = function(key, options) {
      return i18n.t(key, options);
    };
  }
  
  // 包装生命周期钩子
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
  
  // 包装方法
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
 * 将状态映射转换为组件数据
 * @param {Object|Function} mapState - 状态映射配置
 * @returns {Object} 组件数据
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
        // 解析路径，如'user.info.name'
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
 * 事件总线
 * 用于组件间通信
 */
const eventBus = {
  _events: {},
  
  /**
   * 监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
    
    // 返回取消监听函数
    return () => {
      this.off(eventName, callback);
    };
  },
  
  /**
   * 取消监听
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数，可选，不提供则取消所有该事件的监听
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
        console.error(`事件 ${eventName} 处理出错:`, error);
      }
    });
  }
};

/**
 * 组件工具函数
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
   * 安全设置组件数据
   * @param {Object} component - 组件实例
   * @param {Object} data - 要设置的数据
   */
  safeSetData(component, data) {
    if (!component || typeof component.setData !== 'function') return;
    
    // 只设置实际变化的数据
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