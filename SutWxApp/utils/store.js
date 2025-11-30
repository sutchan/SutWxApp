/**
 * 文件名: store.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 浣滆€? Sut
 * 鍏ㄥ眬鐘舵€佺鐞嗗櫒锛屽熀浜庤瀵熻€呮ā寮忓疄鐜扮殑绠€鏄撶姸鎬佺鐞嗘柟妗堬紝鎻愪緵鐘舵€佺鐞嗗拰缁勪欢闂撮€氫俊鍔熻兘
 */

/**
 * 鍏ㄥ眬鐘舵€佺鐞嗗櫒
 * 浣跨敤瑙傚療鑰呮ā寮忓疄鐜扮姸鎬佺殑闆嗕腑绠＄悊鍜岀粍浠堕棿閫氫俊
 */
class Store {
  constructor() {
    this.state = {
      // 鐢ㄦ埛鐩稿叧鐘舵€?      user: {
        isLoggedIn: false,
        userInfo: null,
        token: null
      },
      // 璐墿杞︾姸鎬?      cart: {
        items: [],
        total: 0
      },
      // 鍏ㄥ眬UI鐘舵€?      ui: {
        loading: false,
        error: null
      },
      // 绉垎鐘舵€?      points: {
        balance: 0,
        tasks: []
      }
    };
    this.listeners = new Map(); // 瀛樺偍鐘舵€佺洃鍚櫒
    this.mutations = new Map(); // 瀛樺偍鐘舵€佸彉鏇存柟娉?  }

  /**
   * 鑾峰彇鐘舵€?   * @param {string} path - 鐘舵€佽矾寰勶紝濡?'user.userInfo'
   * @returns {*} 鐘舵€佸€?   */
  getState(path = '') {
    if (!path) return this.state;
    
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, this.state);
  }

  /**
   * 娉ㄥ唽鐘舵€佸彉鏇存柟娉?   * @param {string} name - 鍙樻洿鏂规硶鍚?   * @param {Function} mutation - 鍙樻洿鏂规硶
   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 鎻愪氦鐘舵€佸彉鏇?   * @param {string} name - 鍙樻洿鏂规硶鍚?   * @param {*} payload - 鍙樻洿鍙傛暟
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      console.warn(`Mutation ${name} not found`);
      return;
    }
    
    const mutation = this.mutations.get(name);
    try {
      // 鎵ц鐘舵€佸彉鏇?      const newState = mutation(this.state, payload);
      if (newState !== undefined) {
        const oldState = this.state;
        this.state = { ...this.state, ...newState };
        
        // 鍙湁褰撶姸鎬佺湡姝ｆ敼鍙樻椂鎵嶉€氱煡鐩戝惉鍣?        if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
          this.notify();
        }
      }
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 娉ㄥ唽鐘舵€佺洃鍚櫒
   * @param {string} id - 鐩戝惉鍣ㄥ敮涓€鏍囪瘑
   * @param {Function} callback - 鐘舵€佸彉鍖栧洖璋冨嚱鏁?   */
  subscribe(id, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.listeners.set(id, callback);
  }

  /**
   * 鍙栨秷鐘舵€佺洃鍚?   * @param {string} id - 鐩戝惉鍣ㄥ敮涓€鏍囪瘑
   */
  unsubscribe(id) {
    this.listeners.delete(id);
  }

  /**
   * 閫氱煡鎵€鏈夌洃鍚櫒鐘舵€佸凡鏇存柊
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
   * 鎸佷箙鍖栫姸鎬佸埌鏈湴瀛樺偍
   * @param {string} key - 鏈湴瀛樺偍閿悕
   */
  persist(key = 'sutwxapp_state') {
    try {
      wx.setStorageSync(key, this.state);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * 浠庢湰鍦板瓨鍌ㄦ仮澶嶇姸鎬?   * @param {string} key - 鏈湴瀛樺偍閿悕
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

// 鍒涘缓骞跺鍑簊tore瀹炰緥
const store = new Store();

// 娉ㄥ唽甯哥敤鐨勭姸鎬佸彉鏇存柟娉?store.registerMutation('SET_USER_INFO', (state, userInfo) => ({
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
