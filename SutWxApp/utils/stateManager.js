/**
 * 鏂囦欢鍚? stateManager.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 浣滆€? Sut
 * 鎻忚堪: 缁嗙矑搴︾姸鎬佺鐞嗙郴缁燂紝鏀寔妯″潡鍖栫姸鎬併€佸紓姝ユ搷浣溿€佺粏绮掑害璁㈤槄鍜岀姸鎬佹寔涔呭寲閰嶇疆
 */

// 瀵煎叆棰勫畾涔夌殑鐘舵€佹ā鍧?const stateModules = require('./stateModules.js');

/**
 * 缁嗙矑搴︾姸鎬佺鐞嗗櫒
 * 鏀寔妯″潡鍖栫姸鎬併€佸紓姝ユ搷浣溿€佺簿纭闃呭拰楂樼骇鎸佷箙鍖栭厤缃? */
class StateManager {
  constructor(modules = {}) {
    // 鍚堝苟棰勫畾涔夋ā鍧楀拰浼犲叆鐨勬ā鍧?    this.modules = { ...stateModules, ...modules };
    
    this.state = {};
    this.mutations = new Map();
    this.actions = new Map();
    this.getters = new Map();
    this.listeners = new Map(); // 鍏ㄥ眬鐩戝惉鍣?    this.pathListeners = new Map(); // 璺緞绾х洃鍚櫒
    this.nextListenerId = 0;
    this.isPersisting = false;
    
    // 鍒濆鍖栨墍鏈夋ā鍧?    Object.keys(this.modules).forEach(moduleName => {
      this.registerModule(moduleName, this.modules[moduleName]);
    });
  }

  /**
   * 娉ㄥ唽鐘舵€佹ā鍧?   * @param {string} moduleName - 妯″潡鍚嶇О
   * @param {Object} moduleConfig - 妯″潡閰嶇疆
   * @param {Object} moduleConfig.state - 鍒濆鐘舵€?   * @param {Object} moduleConfig.mutations - 鍙樻洿鏂规硶
   * @param {Object} moduleConfig.actions - 寮傛鎿嶄綔鏂规硶
   * @param {Object} moduleConfig.getters - 璁＄畻灞炴€?   * @param {Object} moduleConfig.persist - 鎸佷箙鍖栭厤缃?   */
  registerModule(moduleName, moduleConfig) {
    const { state = {}, mutations = {}, actions = {}, getters = {}, persist = false } = moduleConfig;
    
    // 鍒濆鍖栨ā鍧楃姸鎬?    this.state[moduleName] = { ...state };
    this.modules[moduleName] = { state, persist };
    
    // 娉ㄥ唽妯″潡鐨刴utations
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
    
    // 娉ㄥ唽妯″潡鐨刟ctions
    Object.entries(actions).forEach(([key, action]) => {
      this.registerAction(`${moduleName}/${key}`, action);
    });
    
    // 娉ㄥ唽妯″潡鐨刧etters
    Object.entries(getters).forEach(([key, getter]) => {
      this.registerGetter(`${moduleName}/${key}`, (state) => {
        return getter(state[moduleName], state, this.gettersMap);
      });
    });
    
    console.log(`Module ${moduleName} registered successfully`);
  }

  /**
   * 娉ㄥ唽鍏ㄥ眬鐘舵€佹ā鍧?   * @param {Object} moduleConfig - 鍏ㄥ眬妯″潡閰嶇疆
   */
  registerGlobalModule(moduleConfig) {
    this.registerModule('global', moduleConfig);
  }

  /**
   * 鑾峰彇瀹屾暣鐘舵€?   * @returns {Object} 瀹屾暣鐘舵€佹爲
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 鏍规嵁璺緞鑾峰彇鐘舵€?   * @param {string} path - 鐘舵€佽矾寰勶紝濡?'user.userInfo' 鎴?'user'
   * @returns {*} 鐘舵€佸€?   */
  get(path) {
    if (!path) return this.getState();
    
    const [moduleName, ...restPath] = path.split('.');
    
    // 妫€鏌ユ槸鍚︽槸瀹屾暣鐨勬ā鍧?    if (restPath.length === 0 && this.state[moduleName] !== undefined) {
      return { ...this.state[moduleName] };
    }
    
    // 鑾峰彇鍏蜂綋璺緞鐨勫€?    let currentState = this.state;
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, currentState);
  }

  /**
   * 娉ㄥ唽mutation
   * @param {string} name - mutation鍚嶇О
   * @param {Function} mutation - mutation鍑芥暟
   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 娉ㄥ唽action
   * @param {string} name - action鍚嶇О
   * @param {Function} action - action鍑芥暟
   */
  registerAction(name, action) {
    if (typeof action !== 'function') {
      throw new Error(`Action for ${name} must be a function`);
    }
    this.actions.set(name, action);
  }

  /**
   * 娉ㄥ唽getter
   * @param {string} name - getter鍚嶇О
   * @param {Function} getter - getter鍑芥暟
   */
  registerGetter(name, getter) {
    if (typeof getter !== 'function') {
      throw new Error(`Getter for ${name} must be a function`);
    }
    this.getters.set(name, getter);
  }

  /**
   * 璁＄畻getters鏄犲皠
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
   * 鑾峰彇getter鍊?   * @param {string} name - getter鍚嶇О
   * @returns {*} getter璁＄畻缁撴灉
   */
  getGetter(name) {
    if (!this.getters.has(name)) {
      console.warn(`Getter ${name} not found`);
      return undefined;
    }
    
    return this.getters.get(name)(this.state);
  }

  /**
   * 鎻愪氦mutation
   * @param {string} name - mutation鍚嶇О锛屾敮鎸?'module/mutationName' 鏍煎紡
   * @param {*} payload - 杞借嵎
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      // 灏濊瘯瑙ｆ瀽鍙兘鐨勬ā鍧楄矾寰勬牸寮?      if (name.includes('/')) {
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
      // 鎵цmutation
      const changes = mutation(this.state, payload);
      if (changes) {
        // 搴旂敤鍙樻洿
        this.state = { ...this.state, ...changes };
        // 閫氱煡鐩戝惉鍣?        this.notify();
        // 瑙﹀彂鎸佷箙鍖?        this._handlePersist();
      }
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 鍒嗗彂action
   * @param {string} name - action鍚嶇О锛屾敮鎸?'module/actionName' 鏍煎紡
   * @param {*} payload - 杞借嵎
   * @returns {Promise} action鎵ц缁撴灉
   */
  async dispatch(name, payload) {
    if (!this.actions.has(name)) {
      // 灏濊瘯瑙ｆ瀽鍙兘鐨勬ā鍧楄矾寰勬牸寮?      if (name.includes('/')) {
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
   * 璁㈤槄鐘舵€佸彉鍖?   * @param {Function} callback - 鍥炶皟鍑芥暟
   * @returns {Function} 鍙栨秷璁㈤槄鍑芥暟
   */
  subscribe(callback) {
    const id = this.nextListenerId++;
    this.listeners.set(id, callback);
    
    // 杩斿洖鍙栨秷璁㈤槄鍑芥暟
    return () => {
      this.listeners.delete(id);
    };
  }

  /**
   * 璁㈤槄鐗瑰畾璺緞鐨勭姸鎬佸彉鍖?   * @param {string} path - 鐘舵€佽矾寰?   * @param {Function} callback - 鍥炶皟鍑芥暟
   * @returns {Function} 鍙栨秷璁㈤槄鍑芥暟
   */
  subscribePath(path, callback) {
    const id = this.nextListenerId++;
    
    if (!this.pathListeners.has(path)) {
      this.pathListeners.set(path, new Map());
    }
    
    this.pathListeners.get(path).set(id, callback);
    
    // 杩斿洖鍙栨秷璁㈤槄鍑芥暟
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
   * 閫氱煡鎵€鏈夌洃鍚櫒
   * @private
   */
  notify() {
    const newState = this.getState();
    
    // 閫氱煡鍏ㄥ眬鐩戝惉鍣?    this.listeners.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('Error in global state listener:', error);
      }
    });
    
    // 閫氱煡璺緞绾х洃鍚櫒
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
   * 澶勭悊鐘舵€佹寔涔呭寲
   * @private
   */
  _handlePersist() {
    if (this.isPersisting) return;
    
    this.isPersisting = true;
    
    // 浣跨敤寰换鍔￠伩鍏嶉绻佸啓鍏?    Promise.resolve().then(() => {
      try {
        // 鍙寔涔呭寲閰嶇疆浜唒ersist鐨勬ā鍧?        const stateToPersist = {};
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
   * 浠庢湰鍦板瓨鍌ㄦ仮澶嶇姸鎬?   * @returns {Promise<boolean>} 鏄惁鎴愬姛鎭㈠
   */
  async restoreState() {
    try {
      const savedState = wx.getStorageSync('sutwxapp_state');
      if (savedState) {
        // 鍙仮澶嶅凡娉ㄥ唽妯″潡鐨勭姸鎬?        Object.keys(savedState).forEach(moduleName => {
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
   * 鑾峰彇鎵€鏈夊凡娉ㄥ唽妯″潡鍚嶇О
   * @returns {Array} 妯″潡鍚嶇О鏁扮粍
   */
  getRegisteredModules() {
    return Object.keys(this.modules);
  }

  /**
   * 娓呴櫎鎸佷箙鍖栫姸鎬?   * @param {string} moduleName - 鍙€夛紝鎸囧畾瑕佹竻闄ょ殑妯″潡
   * @returns {Promise<boolean>} 鏄惁鎴愬姛娓呴櫎
   */
  async clearPersistedState(moduleName) {
    try {
      if (moduleName) {
        // 娓呴櫎鐗瑰畾妯″潡
        const savedState = wx.getStorageSync('sutwxapp_state') || {};
        delete savedState[moduleName];
        wx.setStorageSync('sutwxapp_state', savedState);
      } else {
        // 娓呴櫎鎵€鏈夌姸鎬?        wx.removeStorageSync('sutwxapp_state');
      }
      return true;
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      return false;
    }
  }

  /**
   * 閲嶇疆鎵€鏈夌姸鎬?   */
  resetState() {
    Object.keys(this.modules).forEach(moduleName => {
      this.state[moduleName] = { ...this.modules[moduleName].state };
    });
    this.notify();
  }
}

// 鍒涘缓骞跺鍑虹姸鎬佺鐞嗗櫒瀹炰緥
const stateManager = new StateManager();

// 瀵煎嚭宸ュ叿鍑芥暟
module.exports = {
  stateManager,
  // 杈呭姪鍑芥暟锛氬垱寤虹粍浠剁殑鐘舵€佹槧灏?  mapState: function(mapOptions) {
    const computed = {};
    
    if (typeof mapOptions === 'function') {
      // 鍑芥暟褰㈠紡锛屾帴鏀秙tate鍙傛暟
      return function() {
        return mapOptions(stateManager.getState());
      };
    }
    
    // 瀵硅薄褰㈠紡
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
  
  // 杈呭姪鍑芥暟锛氬垱寤虹粍浠剁殑getters鏄犲皠
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
  
  // 杈呭姪鍑芥暟锛氬垱寤虹粍浠剁殑mutations鏄犲皠
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
  
  // 杈呭姪鍑芥暟锛氬垱寤虹粍浠剁殑actions鏄犲皠
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
