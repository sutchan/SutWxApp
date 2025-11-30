/**
 * 文件名: componentFactory.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 浣滆€? Sut
 * 缁勪欢宸ュ巶 - 鎻愪緵缁勪欢鍒涘缓鍜岀敓鍛藉懆鏈熺鐞嗗寮哄姛鑳斤紝鑷姩闆嗘垚鐘舵€佺鐞嗗拰鍥介檯鍖? */

const store = require('./store.js');
const i18n = require('./i18n.js');

/**
 * 缁勪欢鐢熷懡鍛ㄦ湡閽╁瓙鍖呰鍣? * 鎻愪緵缁熶竴鐨勭敓鍛藉懆鏈熷鐞嗗拰閿欒鎹曡幏
 * @param {Function} hook - 鍘熷閽╁瓙鍑芥暟
 * @param {string} hookName - 閽╁瓙鍚嶇О
 * @param {Object} options - 閫夐」閰嶇疆
 * @returns {Function} 鍖呰鍚庣殑閽╁瓙鍑芥暟
 */
function wrapHook(hook, hookName, options = {}) {
  return function(...args) {
    try {
      if (typeof hook === 'function') {
        return hook.apply(this, args);
      }
    } catch (error) {
      console.error(`缁勪欢鐢熷懡鍛ㄦ湡閽╁瓙 ${hookName} 鎵ц澶辫触:`, error);
      if (options.errorHandler && typeof options.errorHandler === 'function') {
        options.errorHandler(error, hookName);
      }
    }
    return undefined;
  };
}

/**
 * 鍒涘缓缁勪欢閰嶇疆瀵硅薄
 * 鑷姩闆嗘垚鐘舵€佺鐞嗐€佸浗闄呭寲鍜岀敓鍛藉懆鏈熼挬瀛愬鐞? * @param {Object} config - 缁勪欢閰嶇疆
 * @returns {Object} 澧炲己鐨勭粍浠堕厤缃? */
function createComponent(config = {}) {
  // 榛樿閰嶇疆
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

  // 鍚堝苟閰嶇疆
  const mergedConfig = { ...defaultConfig, ...config };
  
  // 鑷姩闆嗘垚鐘舵€佺鐞?  if (config.mapState) {
    mergedConfig.data = { ...mergedConfig.data, ...mapStateToData(config.mapState) };
    mergedConfig.lifetimes = mergedConfig.lifetimes || {};
    
    // 澧炲己鐢熷懡鍛ㄦ湡閽╁瓙浠ュ搷搴旂姸鎬佹洿鏂?    const originalAttached = mergedConfig.lifetimes.attached || function() {};
    mergedConfig.lifetimes.attached = wrapHook(function() {
      // 鍒濆鍖栫姸鎬佹槧灏?      this._stateUnsubscribe = store.subscribe(() => {
        this.setData(mapStateToData(config.mapState));
      });
      originalAttached.call(this);
    }, 'attached');
    
    // 鍦╠etached鏃舵竻鐞嗚闃?    const originalDetached = mergedConfig.lifetimes.detached || function() {};
    mergedConfig.lifetimes.detached = wrapHook(function() {
      if (this._stateUnsubscribe) {
        this._stateUnsubscribe();
      }
      originalDetached.call(this);
    }, 'detached');
  }
  
  // 鑷姩闆嗘垚鍥介檯鍖?  if (config.useI18n !== false) {
    mergedConfig.methods = mergedConfig.methods || {};
    mergedConfig.methods.__ = function(key, options) {
      return i18n.t(key, options);
    };
  }
  
  // 鍖呰鎵€鏈夌敓鍛藉懆鏈熼挬瀛?  const lifecycleHooks = [
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
  
  // 鍖呰椤甸潰鐢熷懡鍛ㄦ湡閽╁瓙
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
  
  // 鍖呰methods涓殑鏂规硶
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
 * 灏嗙姸鎬佹槧灏勮浆鎹负data瀵硅薄
 * @param {Object|Function} mapState - 鐘舵€佹槧灏勯厤缃? * @returns {Object} 杞崲鍚庣殑data瀵硅薄
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
        // 鏀寔璺緞璁块棶锛屽 'user.info.name'
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
 * 缁勪欢閫氫俊鎬荤嚎
 * 鎻愪緵缁勪欢闂寸殑浜嬩欢閫氫俊鏈哄埗
 */
const eventBus = {
  _events: {},
  
  /**
   * 璁㈤槄浜嬩欢
   * @param {string} eventName - 浜嬩欢鍚嶇О
   * @param {Function} callback - 鍥炶皟鍑芥暟
   * @returns {Function} 鍙栨秷璁㈤槄鐨勫嚱鏁?   */
  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
    
    // 杩斿洖鍙栨秷璁㈤槄鍑芥暟
    return () => {
      this.off(eventName, callback);
    };
  },
  
  /**
   * 鍙栨秷璁㈤槄
   * @param {string} eventName - 浜嬩欢鍚嶇О
   * @param {Function} callback - 鍥炶皟鍑芥暟锛堝彲閫夛紝涓嶆彁渚涘垯鍙栨秷璇ヤ簨浠剁殑鎵€鏈夎闃咃級
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
   * 瑙﹀彂浜嬩欢
   * @param {string} eventName - 浜嬩欢鍚嶇О
   * @param {*} data - 浜嬩欢鏁版嵁
   */
  emit(eventName, data) {
    if (!this._events[eventName]) return;
    
    this._events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`浜嬩欢 ${eventName} 澶勭悊澶辫触:`, error);
      }
    });
  }
};

/**
 * 缁勪欢宸ュ叿闆? */
const componentUtils = {
  /**
   * 鑺傛祦鍑芥暟
   * @param {Function} func - 瑕佽妭娴佺殑鍑芥暟
   * @param {number} delay - 寤惰繜鏃堕棿锛堟绉掞級
   * @returns {Function} 鑺傛祦鍚庣殑鍑芥暟
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
   * 闃叉姈鍑芥暟
   * @param {Function} func - 瑕侀槻鎶栫殑鍑芥暟
   * @param {number} delay - 寤惰繜鏃堕棿锛堟绉掞級
   * @returns {Function} 闃叉姈鍚庣殑鍑芥暟
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
   * 瀹夊叏鍦拌缃暟鎹紝閬垮厤涓嶅繀瑕佺殑鏇存柊
   * @param {Object} component - 缁勪欢瀹炰緥
   * @param {Object} data - 瑕佽缃殑鏁版嵁
   */
  safeSetData(component, data) {
    if (!component || typeof component.setData !== 'function') return;
    
    // 杩囨护鎺変笌褰撳墠鏁版嵁鐩稿悓鐨勫€?    const changedData = {};
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
