/**
 * 文件名 store.js
 * 版本号 1.0.2
 * 更新日期: 2025-11-29
 * 娴ｆ粏鈧? Sut
 * 閸忋劌鐪悩鑸碘偓浣侯吀閻炲棗娅掗敍灞界唨娴滃氦顫囩€电喕鈧懏膩瀵繐鐤勯悳鎵畱缁犫偓閺勬挾濮搁幀浣侯吀閻炲棙鏌熷鍫礉閹绘劒绶甸悩鑸碘偓浣侯吀閻炲棗鎷扮紒鍕闂傛挳鈧矮淇婇崝鐔诲厴
 */

/**
 * 閸忋劌鐪悩鑸碘偓浣侯吀閻炲棗娅? * 娴ｈ法鏁ょ憴鍌氱檪閼板懏膩瀵繐鐤勯悳鎵Ц閹胶娈戦梿鍡曡厬缁狅紕鎮婇崪宀€绮嶆禒鍫曟？闁矮淇? */
class Store {
  constructor() {
    this.state = {
      // 閻劍鍩涢惄绋垮彠閻樿埖鈧?      user: {
        isLoggedIn: false,
        userInfo: null,
        token: null
      },
      // 鐠愵厾澧挎潪锔惧Ц閹?      cart: {
        items: [],
        total: 0
      },
      // 閸忋劌鐪琔I閻樿埖鈧?      ui: {
        loading: false,
        error: null
      },
      // 缁夘垰鍨庨悩鑸碘偓?      points: {
        balance: 0,
        tasks: []
      }
    };
    this.listeners = new Map(); // 鐎涙ê鍋嶉悩鑸碘偓浣烘磧閸氼剙娅?    this.mutations = new Map(); // 鐎涙ê鍋嶉悩鑸碘偓浣稿綁閺囧瓨鏌熷▔?  }

  /**
   * 閼惧嘲褰囬悩鑸碘偓?   * @param {string} path - 閻樿埖鈧浇鐭惧鍕剁礉婵?'user.userInfo'
   * @returns {*} 閻樿埖鈧礁鈧?   */
  getState(path = '') {
    if (!path) return this.state;
    
    return path.split('.').reduce((state, key) => {
      return state && state[key] !== undefined ? state[key] : undefined;
    }, this.state);
  }

  /**
   * 濞夈劌鍞介悩鑸碘偓浣稿綁閺囧瓨鏌熷▔?   * @param {string} name - 閸欐ɑ娲块弬瑙勭《閸?   * @param {Function} mutation - 閸欐ɑ娲块弬瑙勭《
   */
  registerMutation(name, mutation) {
    if (typeof mutation !== 'function') {
      throw new Error(`Mutation for ${name} must be a function`);
    }
    this.mutations.set(name, mutation);
  }

  /**
   * 閹绘劒姘﹂悩鑸碘偓浣稿綁閺?   * @param {string} name - 閸欐ɑ娲块弬瑙勭《閸?   * @param {*} payload - 閸欐ɑ娲块崣鍌涙殶
   */
  commit(name, payload) {
    if (!this.mutations.has(name)) {
      console.warn(`Mutation ${name} not found`);
      return;
    }
    
    const mutation = this.mutations.get(name);
    try {
      // 閹笛嗩攽閻樿埖鈧礁褰夐弴?      const newState = mutation(this.state, payload);
      if (newState !== undefined) {
        const oldState = this.state;
        this.state = { ...this.state, ...newState };
        
        // 閸欘亝婀佽ぐ鎾跺Ц閹胶婀″锝嗘暭閸欐ɑ妞傞幍宥夆偓姘辩叀閻╂垵鎯夐崳?        if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
          this.notify();
        }
      }
    } catch (error) {
      console.error(`Error in mutation ${name}:`, error);
    }
  }

  /**
   * 濞夈劌鍞介悩鑸碘偓浣烘磧閸氼剙娅?   * @param {string} id - 閻╂垵鎯夐崳銊ユ暜娑撯偓閺嶅洩鐦?   * @param {Function} callback - 閻樿埖鈧礁褰夐崠鏍ф礀鐠嬪啫鍤遍弫?   */
  subscribe(id, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.listeners.set(id, callback);
  }

  /**
   * 閸欐牗绉烽悩鑸碘偓浣烘磧閸?   * @param {string} id - 閻╂垵鎯夐崳銊ユ暜娑撯偓閺嶅洩鐦?   */
  unsubscribe(id) {
    this.listeners.delete(id);
  }

  /**
   * 闁氨鐓￠幍鈧張澶屾磧閸氼剙娅掗悩鑸碘偓浣稿嚒閺囧瓨鏌?   */
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
   * 閹镐椒绠欓崠鏍Ц閹礁鍩岄張顒€婀寸€涙ê鍋?   * @param {string} key - 閺堫剙婀寸€涙ê鍋嶉柨顔兼倳
   */
  persist(key = 'sutwxapp_state') {
    try {
      wx.setStorageSync(key, this.state);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * 娴犲孩婀伴崷鏉跨摠閸屻劍浠径宥囧Ц閹?   * @param {string} key - 閺堫剙婀寸€涙ê鍋嶉柨顔兼倳
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

// 閸掓稑缂撻獮璺侯嚤閸戠皧tore鐎圭偘绶?const store = new Store();

// 濞夈劌鍞界敮鍝ユ暏閻ㄥ嫮濮搁幀浣稿綁閺囧瓨鏌熷▔?store.registerMutation('SET_USER_INFO', (state, userInfo) => ({
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
