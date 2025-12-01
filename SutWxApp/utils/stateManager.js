/**
 * 鏂囦欢鍚? stateManager.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 鎻忚堪: 缂佸棛鐭戞惔锔惧Ц閹胶顓搁悶鍡欓兇缂佺噦绱濋弨顖涘瘮濡€虫健閸栨牜濮搁幀浣碘偓浣哥磽濮濄儲鎼锋担婧库偓浣虹矎缁帒瀹崇拋銏ゆ閸滃瞼濮搁幀浣瑰瘮娑斿懎瀵查柊宥囩枂
 */

// 鐎电厧鍙嗘０鍕暰娑斿娈戦悩鑸碘偓浣鼓侀崸?const stateModules = require('./stateModules.js');

/**
 * 缂佸棛鐭戞惔锔惧Ц閹胶顓搁悶鍡楁珤
 * 閺€顖涘瘮濡€虫健閸栨牜濮搁幀浣碘偓浣哥磽濮濄儲鎼锋担婧库偓浣虹翱绾喛顓归梼鍛嫲妤傛楠囬幐浣风畽閸栨牠鍘ょ純? */
class StateManager {
  constructor(modules = {}) {
    // 閸氬牆鑻熸０鍕暰娑斿膩閸ф鎷版导鐘插弳閻ㄥ嫭膩閸?    this.modules = { ...stateModules, ...modules };
    
    this.state = {};
    this.mutations = new Map();
    this.actions = new Map();
    this.getters = new Map();
    this.listeners = new Map(); // 閸忋劌鐪惄鎴濇儔閸?    this.pathListeners = new Map(); // 鐠侯垰绶炵痪褏娲冮崥顒€娅?    this.nextListenerId = 0;
    this.isPersisting = false;
    
    // 閸掓繂顫愰崠鏍ㄥ閺堝膩閸?    Object.keys(this.modules).forEach(moduleName => {
      this.registerModule(moduleName, this.modules[moduleName]);
    });
  }

  /**
   * 濞夈劌鍞介悩鑸碘偓浣鼓侀崸?   * @param {string} moduleName - 濡€虫健閸氬秶袨
   * @param {Object} moduleConfig - 濡€虫健闁板秶鐤?   * @param {Object} moduleConfig.state - 閸掓繂顫愰悩鑸碘偓?   * @param {Object} moduleConfig.mutations - 閸欐ɑ娲块弬瑙勭《
   * @param {Object} moduleConfig.actions - 瀵倹顒為幙宥勭稊閺傝纭?   * @param {Object} moduleConfig.getters - 鐠侊紕鐣荤仦鐐粹偓?   * @param {Object} moduleConfig.persist - 閹镐椒绠欓崠鏍帳缂?   */
  registerModule(moduleName, moduleConfig) {
    const { state = {}, mutations = {}, actions = {}, getters = {}, persist = false } = moduleConfig;
    
    // 閸掓繂顫愰崠鏍侀崸妤冨Ц閹?    this.state[moduleName] = { ...state };
    this.modules[moduleName] = { state, persist };
    
    // 濞夈劌鍞藉Ο鈥虫健閻ㄥ埓utations
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
    
    // 濞夈劌鍞藉Ο鈥虫健閻ㄥ垷ctions
    Object.entries(actions).forEach(([key, action]) => {
      this.registerAction(`${moduleName}/${key}`, action);
    });
    
    // 濞夈劌鍞藉Ο鈥虫健閻ㄥ埀etters
    Object.entries(getters).forEach(([key, getter]) => {
      this.registerGetter(`${moduleName}/${key}`, (state) => {
        return getter(state[moduleName], state, this.gettersMap);
      });
    });
    
    console.log(`Module ${moduleName} registered successfully`);
  }

  /**
   * 濞夈劌鍞介崗銊ョ湰閻樿埖鈧焦膩閸?   * @param {Object} moduleConfig - 閸忋劌鐪Ο鈥虫健闁板秶鐤?   */
  registerGlobalModule(moduleConfig) {
    this.registerModule('global', moduleConfig);
  }

  /**
   * 閼惧嘲褰囩€瑰本鏆ｉ悩鑸碘偓?   * @returns {Object} 鐎瑰本鏆ｉ悩鑸碘偓浣圭埐
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 閺嶈宓佺捄顖氱窞閼惧嘲褰囬悩鑸碘偓?   * @param {string} path - 閻樿埖鈧浇鐭惧鍕剁礉婵?'user.userInfo' 閹?'user'
   * @returns {*} 閻樿埖鈧礁鈧?   */
  get(path) {
    if (!path) return this.getState();
    
    const [moduleName, ...restPath] = path.split('.');
    
    // 濡偓閺屻儲妲搁崥锔芥Ц鐎瑰本鏆ｉ惃鍕侀崸?    if (restPath.length === 0 && this.state[moduleName] !== undefined) {
      return { ...this.state[moduleName] };
    }
    
    // 閼惧嘲褰囬崗铚傜秼鐠侯垰绶為惃鍕偓?    let currentState = this.state;
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, currentState);
  }

  /**
   * 濞夈劌鍞絤utation
   * @param {string} name - mutation閸氬秶袨
   * @param {Function} mutation - mutation閸戣姤鏆?   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 濞夈劌鍞絘ction
   * @param {string} name - action閸氬秶袨
   * @param {Function} action - action閸戣姤鏆?   */
  registerAction(name, action) {
    if (typeof action !== 'function') {
      throw new Error(`Action for ${name} must be a function`);
    }
    this.actions.set(name, action);
  }

  /**
   * 濞夈劌鍞絞etter
   * @param {string} name - getter閸氬秶袨
   * @param {Function} getter - getter閸戣姤鏆?   */
  registerGetter(name, getter) {
    if (typeof getter !== 'function') {
      throw new Error(`Getter for ${name} must be a function`);
    }
    this.getters.set(name, getter);
  }

  /**
   * 鐠侊紕鐣籫etters閺勭姴鐨?   * @private
   */
  get gettersMap() {
    const map = {};
    this.getters.forEach((getter, name) => {
      map[name] = getter(this.state);
    });
    return map;
  }

  /**
   * 閼惧嘲褰噂etter閸?   * @param {string} name - getter閸氬秶袨
   * @returns {*} getter鐠侊紕鐣荤紒鎾寸亯
   */
  getGetter(name) {
    if (!this.getters.has(name)) {
      console.warn(`Getter ${name} not found`);
      return undefined;
    }
    
    return this.getters.get(name)(this.state);
  }

  /**
   * 閹绘劒姘utation
   * @param {string} name - mutation閸氬秶袨閿涘本鏁幐?'module/mutationName' 閺嶇厧绱?   * @param {*} payload - 鏉炲€熷祹
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      // 鐏忔繆鐦憴锝嗙€介崣顖濆厴閻ㄥ嫭膩閸ф鐭惧鍕壐瀵?      if (name.includes('/')) {
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
      // 閹笛嗩攽mutation
      const changes = mutation(this.state, payload);
      if (changes) {
        // 鎼存梻鏁ら崣妯绘纯
        this.state = { ...this.state, ...changes };
        // 闁氨鐓￠惄鎴濇儔閸?        this.notify();
        // 鐟欙箑褰傞幐浣风畽閸?        this._handlePersist();
      }
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 閸掑棗褰俛ction
   * @param {string} name - action閸氬秶袨閿涘本鏁幐?'module/actionName' 閺嶇厧绱?   * @param {*} payload - 鏉炲€熷祹
   * @returns {Promise} action閹笛嗩攽缂佹挻鐏?   */
  async dispatch(name, payload) {
    if (!this.actions.has(name)) {
      // 鐏忔繆鐦憴锝嗙€介崣顖濆厴閻ㄥ嫭膩閸ф鐭惧鍕壐瀵?      if (name.includes('/')) {
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
   * 鐠併垽妲勯悩鑸碘偓浣稿綁閸?   * @param {Function} callback - 閸ョ偠鐨熼崙鑺ユ殶
   * @returns {Function} 閸欐牗绉风拋銏ゆ閸戣姤鏆?   */
  subscribe(callback) {
    const id = this.nextListenerId++;
    this.listeners.set(id, callback);
    
    // 鏉╂柨娲栭崣鏍ㄧХ鐠併垽妲勯崙鑺ユ殶
    return () => {
      this.listeners.delete(id);
    };
  }

  /**
   * 鐠併垽妲勯悧鐟扮暰鐠侯垰绶為惃鍕Ц閹礁褰夐崠?   * @param {string} path - 閻樿埖鈧浇鐭惧?   * @param {Function} callback - 閸ョ偠鐨熼崙鑺ユ殶
   * @returns {Function} 閸欐牗绉风拋銏ゆ閸戣姤鏆?   */
  subscribePath(path, callback) {
    const id = this.nextListenerId++;
    
    if (!this.pathListeners.has(path)) {
      this.pathListeners.set(path, new Map());
    }
    
    this.pathListeners.get(path).set(id, callback);
    
    // 鏉╂柨娲栭崣鏍ㄧХ鐠併垽妲勯崙鑺ユ殶
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
   * 闁氨鐓￠幍鈧張澶屾磧閸氼剙娅?   * @private
   */
  notify() {
    const newState = this.getState();
    
    // 闁氨鐓￠崗銊ョ湰閻╂垵鎯夐崳?    this.listeners.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('Error in global state listener:', error);
      }
    });
    
    // 闁氨鐓＄捄顖氱窞缁狙呮磧閸氼剙娅?    this.pathListeners.forEach((callbacks, path) => {
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
   * 婢跺嫮鎮婇悩鑸碘偓浣瑰瘮娑斿懎瀵?   * @private
   */
  _handlePersist() {
    if (this.isPersisting) return;
    
    this.isPersisting = true;
    
    // 娴ｈ法鏁ゅ顔绘崲閸旓繝浼╅崗宥夘暥缁讳礁鍟撻崗?    Promise.resolve().then(() => {
      try {
        // 閸欘亝瀵旀稊鍛闁板秶鐤嗘禍鍞抏rsist閻ㄥ嫭膩閸?        const stateToPersist = {};
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
   * 娴犲孩婀伴崷鏉跨摠閸屻劍浠径宥囧Ц閹?   * @returns {Promise<boolean>} 閺勵垰鎯侀幋鎰閹垹顦?   */
  async restoreState() {
    try {
      const savedState = wx.getStorageSync('sutwxapp_state');
      if (savedState) {
        // 閸欘亝浠径宥呭嚒濞夈劌鍞藉Ο鈥虫健閻ㄥ嫮濮搁幀?        Object.keys(savedState).forEach(moduleName => {
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
   * 閼惧嘲褰囬幍鈧張澶婂嚒濞夈劌鍞藉Ο鈥虫健閸氬秶袨
   * @returns {Array} 濡€虫健閸氬秶袨閺佹壆绮?   */
  getRegisteredModules() {
    return Object.keys(this.modules);
  }

  /**
   * 濞撳懘娅庨幐浣风畽閸栨牜濮搁幀?   * @param {string} moduleName - 閸欘垶鈧绱濋幐鍥х暰鐟曚焦绔婚梽銈囨畱濡€虫健
   * @returns {Promise<boolean>} 閺勵垰鎯侀幋鎰濞撳懘娅?   */
  async clearPersistedState(moduleName) {
    try {
      if (moduleName) {
        // 濞撳懘娅庨悧鐟扮暰濡€虫健
        const savedState = wx.getStorageSync('sutwxapp_state') || {};
        delete savedState[moduleName];
        wx.setStorageSync('sutwxapp_state', savedState);
      } else {
        // 濞撳懘娅庨幍鈧張澶屽Ц閹?        wx.removeStorageSync('sutwxapp_state');
      }
      return true;
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      return false;
    }
  }

  /**
   * 闁插秶鐤嗛幍鈧張澶屽Ц閹?   */
  resetState() {
    Object.keys(this.modules).forEach(moduleName => {
      this.state[moduleName] = { ...this.modules[moduleName].state };
    });
    this.notify();
  }
}

// 閸掓稑缂撻獮璺侯嚤閸戣櫣濮搁幀浣侯吀閻炲棗娅掔€圭偘绶?const stateManager = new StateManager();

// 鐎电厧鍤銉ュ徔閸戣姤鏆?module.exports = {
  stateManager,
  // 鏉堝懎濮崙鑺ユ殶閿涙艾鍨卞铏圭矋娴犲墎娈戦悩鑸碘偓浣规Ё鐏?  mapState: function(mapOptions) {
    const computed = {};
    
    if (typeof mapOptions === 'function') {
      // 閸戣姤鏆熻ぐ銏犵础閿涘本甯撮弨绉檛ate閸欏倹鏆?      return function() {
        return mapOptions(stateManager.getState());
      };
    }
    
    // 鐎电钖勮ぐ銏犵础
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
  
  // 鏉堝懎濮崙鑺ユ殶閿涙艾鍨卞铏圭矋娴犲墎娈慻etters閺勭姴鐨?  mapGetters: function(mapOptions) {
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
  
  // 鏉堝懎濮崙鑺ユ殶閿涙艾鍨卞铏圭矋娴犲墎娈憁utations閺勭姴鐨?  mapMutations: function(mapOptions) {
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
  
  // 鏉堝懎濮崙鑺ユ殶閿涙艾鍨卞铏圭矋娴犲墎娈慳ctions閺勭姴鐨?  mapActions: function(mapOptions) {
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
