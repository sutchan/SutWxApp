/**
 * 鏂囦欢鍚? componentFactory.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 缂佸嫪娆㈠銉ュ范 - 閹绘劒绶电紒鍕閸掓稑缂撻崪宀€鏁撻崨钘夋噯閺堢喓顓搁悶鍡楊杻瀵搫濮涢懗鏂ょ礉閼奉亜濮╅梿鍡樺灇閻樿埖鈧胶顓搁悶鍡楁嫲閸ヤ粙妾崠? */

const store = require('./store.js');
const i18n = require('./i18n.js');

/**
 * 缂佸嫪娆㈤悽鐔锋嚒閸涖劍婀￠柦鈺佺摍閸栧懓顥婇崳? * 閹绘劒绶电紒鐔剁閻ㄥ嫮鏁撻崨钘夋噯閺堢喎顦╅悶鍡楁嫲闁挎瑨顕ら幑鏇″箯
 * @param {Function} hook - 閸樼喎顫愰柦鈺佺摍閸戣姤鏆? * @param {string} hookName - 闁解晛鐡欓崥宥囆? * @param {Object} options - 闁銆嶉柊宥囩枂
 * @returns {Function} 閸栧懓顥婇崥搴ｆ畱闁解晛鐡欓崙鑺ユ殶
 */
function wrapHook(hook, hookName, options = {}) {
  return function(...args) {
    try {
      if (typeof hook === 'function') {
        return hook.apply(this, args);
      }
    } catch (error) {
      console.error(`缂佸嫪娆㈤悽鐔锋嚒閸涖劍婀￠柦鈺佺摍 ${hookName} 閹笛嗩攽婢惰精瑙?`, error);
      if (options.errorHandler && typeof options.errorHandler === 'function') {
        options.errorHandler(error, hookName);
      }
    }
    return undefined;
  };
}

/**
 * 閸掓稑缂撶紒鍕闁板秶鐤嗙€电钖? * 閼奉亜濮╅梿鍡樺灇閻樿埖鈧胶顓搁悶鍡愨偓浣告禇闂勫懎瀵查崪宀€鏁撻崨钘夋噯閺堢喖鎸€涙劕顦╅悶? * @param {Object} config - 缂佸嫪娆㈤柊宥囩枂
 * @returns {Object} 婢х偛宸遍惃鍕矋娴犲爼鍘ょ純? */
function createComponent(config = {}) {
  // 姒涙顓婚柊宥囩枂
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

  // 閸氬牆鑻熼柊宥囩枂
  const mergedConfig = { ...defaultConfig, ...config };
  
  // 閼奉亜濮╅梿鍡樺灇閻樿埖鈧胶顓搁悶?  if (config.mapState) {
    mergedConfig.data = { ...mergedConfig.data, ...mapStateToData(config.mapState) };
    mergedConfig.lifetimes = mergedConfig.lifetimes || {};
    
    // 婢х偛宸遍悽鐔锋嚒閸涖劍婀￠柦鈺佺摍娴犮儱鎼锋惔鏃傚Ц閹焦娲块弬?    const originalAttached = mergedConfig.lifetimes.attached || function() {};
    mergedConfig.lifetimes.attached = wrapHook(function() {
      // 閸掓繂顫愰崠鏍Ц閹焦妲х亸?      this._stateUnsubscribe = store.subscribe(() => {
        this.setData(mapStateToData(config.mapState));
      });
      originalAttached.call(this);
    }, 'attached');
    
    // 閸︹暊etached閺冭埖绔婚悶鍡氼吂闂?    const originalDetached = mergedConfig.lifetimes.detached || function() {};
    mergedConfig.lifetimes.detached = wrapHook(function() {
      if (this._stateUnsubscribe) {
        this._stateUnsubscribe();
      }
      originalDetached.call(this);
    }, 'detached');
  }
  
  // 閼奉亜濮╅梿鍡樺灇閸ヤ粙妾崠?  if (config.useI18n !== false) {
    mergedConfig.methods = mergedConfig.methods || {};
    mergedConfig.methods.__ = function(key, options) {
      return i18n.t(key, options);
    };
  }
  
  // 閸栧懓顥婇幍鈧張澶屾晸閸涜棄鎳嗛張鐔兼尙鐎?  const lifecycleHooks = [
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
  
  // 閸栧懓顥婃い鐢告桨閻㈢喎鎳￠崨銊︽埂闁解晛鐡?  const pageLifecycleHooks = [
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
  
  // 閸栧懓顥妋ethods娑擃厾娈戦弬瑙勭《
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
 * 鐏忓棛濮搁幀浣规Ё鐏忓嫯娴嗛幑顫礋data鐎电钖? * @param {Object|Function} mapState - 閻樿埖鈧焦妲х亸鍕帳缂? * @returns {Object} 鏉烆剚宕查崥搴ｆ畱data鐎电钖? */
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
        // 閺€顖涘瘮鐠侯垰绶炵拋鍧楁６閿涘苯顩?'user.info.name'
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
 * 缂佸嫪娆㈤柅姘繆閹崵鍤? * 閹绘劒绶电紒鍕闂傚娈戞禍瀣╂闁矮淇婇張鍝勫煑
 */
const eventBus = {
  _events: {},
  
  /**
   * 鐠併垽妲勬禍瀣╂
   * @param {string} eventName - 娴滃娆㈤崥宥囆?   * @param {Function} callback - 閸ョ偠鐨熼崙鑺ユ殶
   * @returns {Function} 閸欐牗绉风拋銏ゆ閻ㄥ嫬鍤遍弫?   */
  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
    
    // 鏉╂柨娲栭崣鏍ㄧХ鐠併垽妲勯崙鑺ユ殶
    return () => {
      this.off(eventName, callback);
    };
  },
  
  /**
   * 閸欐牗绉风拋銏ゆ
   * @param {string} eventName - 娴滃娆㈤崥宥囆?   * @param {Function} callback - 閸ョ偠鐨熼崙鑺ユ殶閿涘牆褰查柅澶涚礉娑撳秵褰佹笟娑樺灟閸欐牗绉风拠銉ょ皑娴犲墎娈戦幍鈧張澶庮吂闂冨拑绱?   */
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
   * 鐟欙箑褰傛禍瀣╂
   * @param {string} eventName - 娴滃娆㈤崥宥囆?   * @param {*} data - 娴滃娆㈤弫鐗堝祦
   */
  emit(eventName, data) {
    if (!this._events[eventName]) return;
    
    this._events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`娴滃娆?${eventName} 婢跺嫮鎮婃径杈Е:`, error);
      }
    });
  }
};

/**
 * 缂佸嫪娆㈠銉ュ徔闂? */
const componentUtils = {
  /**
   * 閼哄倹绁﹂崙鑺ユ殶
   * @param {Function} func - 鐟曚浇濡ù浣烘畱閸戣姤鏆?   * @param {number} delay - 瀵ゆ儼绻滈弮鍫曟？閿涘牊顕犵粔鎺炵礆
   * @returns {Function} 閼哄倹绁﹂崥搴ｆ畱閸戣姤鏆?   */
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
   * 闂冨弶濮堥崙鑺ユ殶
   * @param {Function} func - 鐟曚線妲婚幎鏍畱閸戣姤鏆?   * @param {number} delay - 瀵ゆ儼绻滈弮鍫曟？閿涘牊顕犵粔鎺炵礆
   * @returns {Function} 闂冨弶濮堥崥搴ｆ畱閸戣姤鏆?   */
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
   * 鐎瑰鍙忛崷鎷岊啎缂冾喗鏆熼幑顕嗙礉闁灝鍘ゆ稉宥呯箑鐟曚胶娈戦弴瀛樻煀
   * @param {Object} component - 缂佸嫪娆㈢€圭偘绶?   * @param {Object} data - 鐟曚浇顔曠純顔炬畱閺佺増宓?   */
  safeSetData(component, data) {
    if (!component || typeof component.setData !== 'function') return;
    
    // 鏉╁洦鎶ら幒澶夌瑢瑜版挸澧犻弫鐗堝祦閻╃鎮撻惃鍕偓?    const changedData = {};
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
