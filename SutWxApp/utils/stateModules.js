/**
 * 鏂囦欢鍚? stateModules.js
 * 鐗堟湰鍙? 1.1.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 浣滆€? Sut
 * 鎻忚堪: 棰勫畾涔夌姸鎬佹ā鍧楅泦鍚堬紝涓烘牳蹇冨姛鑳芥彁渚涙爣鍑嗗寲鐨勭姸鎬佺鐞嗘ā鍧? */

// 瀵煎叆WebSocket鏈嶅姟
const webSocketService = require('./webSocketService.js').instance;

// 鐢ㄦ埛妯″潡
exports.userModule = {
  state: {
    isLoggedIn: false,
    userInfo: null,
    token: null,
    permissions: [],
    profile: {
      nickname: '',
      avatar: '',
      phone: '',
      email: ''
    }
  },
  
  mutations: {
    SET_USER_INFO(state, userInfo) {
      return {
        ...state,
        userInfo,
        isLoggedIn: !!userInfo
      };
    },
    
    SET_TOKEN(state, token) {
      return {
        ...state,
        token
      };
    },
    
    SET_PERMISSIONS(state, permissions) {
      return {
        ...state,
        permissions
      };
    },
    
    UPDATE_PROFILE(state, profileData) {
      return {
        ...state,
        profile: {
          ...state.profile,
          ...profileData
        }
      };
    },
    
    LOGOUT() {
      return {
        isLoggedIn: false,
        userInfo: null,
        token: null,
        permissions: [],
        profile: {
          nickname: '',
          avatar: '',
          phone: '',
          email: ''
        }
      };
    }
  },
  
  actions: {
    async login({ commit }, { username, password }) {
      try {
        // 妯℃嫙API璋冪敤
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                token: 'mock_token_' + Date.now(),
                userInfo: {
                  id: '1',
                  username,
                  nickname: '鐢ㄦ埛' + username,
                  avatar: '/assets/images/default-avatar.png'
                },
                permissions: ['read', 'write']
              }
            });
          }, 500);
        });
        
        if (response.success) {
          commit('SET_USER_INFO', response.data.userInfo);
          commit('SET_TOKEN', response.data.token);
          commit('SET_PERMISSIONS', response.data.permissions);
          
          // 鐧诲綍鎴愬姛鍚庤繛鎺ebSocket
          try {
            console.log('鐢ㄦ埛鐧诲綍鎴愬姛锛岃繛鎺ebSocket...');
            await webSocketService.connect({
              userId: response.data.userInfo.id,
              token: response.data.token
            });
          } catch (wsError) {
            console.error('WebSocket杩炴帴澶辫触锛屼絾涓嶅奖鍝嶇櫥褰曟祦绋?', wsError);
          }
          
          return response.data;
        }
        throw new Error('Login failed');
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    async logout({ commit }) {
      try {
        // 鐧诲嚭鍓嶆柇寮€WebSocket杩炴帴
        console.log('鐢ㄦ埛鐧诲嚭锛屾柇寮€WebSocket杩炴帴...');
        await webSocketService.disconnect(1000, '鐢ㄦ埛鐧诲嚭');
      } catch (wsError) {
        console.error('WebSocket鏂紑杩炴帴澶辫触锛屼絾缁х画鐧诲嚭娴佺▼:', wsError);
      }
      
      // 娓呴櫎鐧诲綍鐘舵€?      commit('LOGOUT');
      // 鍙互鍦ㄨ繖閲岃皟鐢ㄧ櫥鍑篈PI
    },
    
    async updateProfile({ commit, state }, profileData) {
      try {
        // 妯℃嫙API璋冪敤
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: { ...profileData }
            });
          }, 500);
        });
        
        if (response.success) {
          commit('UPDATE_PROFILE', response.data);
          return response.data;
        }
        throw new Error('Update profile failed');
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    }
  },
  
  getters: {
    isAdmin(state) {
      return state.permissions.includes('admin');
    },
    displayName(state) {
      return state.profile.nickname || state.userInfo?.nickname || '鏈櫥褰曠敤鎴?;
    },
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission);
    }
  },
  
  persist: true // 鎸佷箙鍖栬妯″潡
};

// UI妯″潡
exports.uiModule = {
  state: {
    loading: false,
    error: null,
    theme: 'light',
    language: 'zh_CN',
    toast: {
      show: false,
      message: '',
      type: 'info', // info, success, warning, error
      duration: 3000
    },
    modal: {
      show: false,
      title: '',
      content: '',
      confirmText: '纭畾',
      cancelText: '鍙栨秷'
    }
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      return {
        ...state,
        loading
      };
    },
    
    SET_ERROR(state, error) {
      return {
        ...state,
        error: error || null
      };
    },
    
    SET_THEME(state, theme) {
      return {
        ...state,
        theme
      };
    },
    
    SET_LANGUAGE(state, language) {
      return {
        ...state,
        language
      };
    },
    
    SHOW_TOAST(state, toastOptions) {
      return {
        ...state,
        toast: {
          show: true,
          message: '',
          type: 'info',
          duration: 3000,
          ...toastOptions
        }
      };
    },
    
    HIDE_TOAST(state) {
      return {
        ...state,
        toast: {
          ...state.toast,
          show: false
        }
      };
    },
    
    SHOW_MODAL(state, modalOptions) {
      return {
        ...state,
        modal: {
          show: true,
          title: '',
          content: '',
          confirmText: '纭畾',
          cancelText: '鍙栨秷',
          ...modalOptions
        }
      };
    },
    
    HIDE_MODAL(state) {
      return {
        ...state,
        modal: {
          ...state.modal,
          show: false
        }
      };
    }
  },
  
  actions: {
    showToast({ commit, dispatch }, toastOptions) {
      commit('SHOW_TOAST', toastOptions);
      // 鑷姩闅愯棌
      setTimeout(() => {
        commit('HIDE_TOAST');
      }, toastOptions.duration || 3000);
    },
    
    async showModal({ commit }, modalOptions) {
      return new Promise((resolve) => {
        commit('SHOW_MODAL', {
          ...modalOptions,
          onConfirm: () => {
            commit('HIDE_MODAL');
            resolve(true);
          },
          onCancel: () => {
            commit('HIDE_MODAL');
            resolve(false);
          }
        });
      });
    },
    
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme);
      // 鍙互鍦ㄨ繖閲屽簲鐢ㄤ富棰樺埌椤甸潰
      wx.setNavigationBarColor({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      });
    }
  },
  
  getters: {
    isDarkTheme(state) {
      return state.theme === 'dark';
    },
    toastVisible(state) {
      return state.toast.show;
    },
    modalVisible(state) {
      return state.modal.show;
    }
  },
  
  persist: true // 鎸佷箙鍖栬妯″潡
};

// 璐墿杞︽ā鍧?exports.cartModule = {
  state: {
    items: [],
    total: 0,
    totalQuantity: 0
  },
  
  mutations: {
    SET_CART_ITEMS(state, items) {
      return {
        ...state,
        items
      };
    },
    
    ADD_TO_CART(state, product) {
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      let newItems;
      
      if (existingItemIndex >= 0) {
        // 鍟嗗搧宸插瓨鍦紝澧炲姞鏁伴噺
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += product.quantity || 1;
      } else {
        // 娣诲姞鏂板晢鍝?        newItems = [...state.items, {
          ...product,
          quantity: product.quantity || 1
        }];
      }
      
      return {
        ...state,
        items: newItems
      };
    },
    
    REMOVE_FROM_CART(state, productId) {
      return {
        ...state,
        items: state.items.filter(item => item.id !== productId)
      };
    },
    
    UPDATE_QUANTITY(state, { productId, quantity }) {
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== productId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item => 
          item.id === productId ? { ...item, quantity } : item
        )
      };
    },
    
    CLEAR_CART() {
      return {
        items: [],
        total: 0,
        totalQuantity: 0
      };
    },
    
    UPDATE_TOTALS(state) {
      const total = state.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      const totalQuantity = state.items.reduce((sum, item) => {
        return sum + item.quantity;
      }, 0);
      
      return {
        ...state,
        total,
        totalQuantity
      };
    }
  },
  
  actions: {
    addToCart({ commit, dispatch }, product) {
      commit('ADD_TO_CART', product);
      commit('UPDATE_TOTALS');
      // 鏄剧ず娣诲姞鎴愬姛鎻愮ず
      dispatch('ui/SHOW_TOAST', {
        message: '宸叉坊鍔犲埌璐墿杞?,
        type: 'success'
      }, { root: true });
    },
    
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
      commit('UPDATE_TOTALS');
    },
    
    updateQuantity({ commit }, payload) {
      commit('UPDATE_QUANTITY', payload);
      commit('UPDATE_TOTALS');
    },
    
    clearCart({ commit }) {
      commit('CLEAR_CART');
    },
    
    async checkout({ commit, state, dispatch }) {
      try {
        commit('ui/SET_LOADING', true, { root: true });
        
        // 妯℃嫙API璋冪敤
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, orderId: 'ORD' + Date.now() });
          }, 1000);
        });
        
        if (response.success) {
          // 娓呯┖璐墿杞?          commit('CLEAR_CART');
          
          // 鏄剧ず鎴愬姛鎻愮ず
          dispatch('ui/SHOW_TOAST', {
            message: '璁㈠崟鍒涘缓鎴愬姛',
            type: 'success'
          }, { root: true });
          
          return response.orderId;
        }
        throw new Error('Checkout failed');
      } catch (error) {
        console.error('Checkout error:', error);
        
        dispatch('ui/SHOW_TOAST', {
          message: '璁㈠崟鍒涘缓澶辫触',
          type: 'error'
        }, { root: true });
        
        throw error;
      } finally {
        commit('ui/SET_LOADING', false, { root: true });
      }
    }
  },
  
  getters: {
    cartItems: state => state.items,
    cartTotal: state => state.total,
    cartQuantity: state => state.totalQuantity,
    isEmpty: state => state.items.length === 0,
    getItemById: state => id => state.items.find(item => item.id === id)
  },
  
  persist: true // 鎸佷箙鍖栬妯″潡
};

// 鍟嗗搧妯″潡
exports.productModule = {
  state: {
    products: [],
    currentProduct: null,
    categories: [],
    filters: {
      category: '',
      priceRange: [0, 99999],
      search: ''
    },
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    }
  },
  
  mutations: {
    SET_PRODUCTS(state, products) {
      return {
        ...state,
        products
      };
    },
    
    SET_CURRENT_PRODUCT(state, product) {
      return {
        ...state,
        currentProduct: product
      };
    },
    
    SET_CATEGORIES(state, categories) {
      return {
        ...state,
        categories
      };
    },
    
    UPDATE_FILTERS(state, filters) {
      return {
        ...state,
        filters: {
          ...state.filters,
          ...filters
        },
        pagination: {
          ...state.pagination,
          page: 1 // 閲嶇疆椤电爜
        }
      };
    },
    
    SET_PAGINATION(state, pagination) {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...pagination
        }
      };
    },
    
    RESET_FILTERS(state) {
      return {
        ...state,
        filters: {
          category: '',
          priceRange: [0, 99999],
          search: ''
        },
        pagination: {
          ...state.pagination,
          page: 1
        }
      };
    }
  },
  
  actions: {
    async fetchProducts({ commit, state }) {
      try {
        commit('ui/SET_LOADING', true, { root: true });
        
        // 妯℃嫙API璋冪敤
        const response = await new Promise(resolve => {
          setTimeout(() => {
            const mockProducts = Array.from({ length: state.pagination.pageSize }, (_, i) => ({
              id: String((state.pagination.page - 1) * state.pagination.pageSize + i + 1),
              name: `鍟嗗搧 ${(state.pagination.page - 1) * state.pagination.pageSize + i + 1}`,
              price: Math.floor(Math.random() * 1000) + 100,
              image: '/assets/images/product-placeholder.png',
              description: '杩欐槸涓€涓ず渚嬪晢鍝佹弿杩?
            }));
            
            resolve({
              success: true,
              data: mockProducts,
              total: 100
            });
          }, 800);
        });
        
        if (response.success) {
          commit('SET_PRODUCTS', response.data);
          commit('SET_PAGINATION', { total: response.total });
          return response.data;
        }
        throw new Error('Fetch products failed');
      } catch (error) {
        console.error('Fetch products error:', error);
        commit('ui/SET_ERROR', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/SET_LOADING', false, { root: true });
      }
    },
    
    async fetchProductById({ commit }, productId) {
      try {
        commit('ui/SET_LOADING', true, { root: true });
        
        // 妯℃嫙API璋冪敤
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                id: productId,
                name: `鍟嗗搧 ${productId}`,
                price: Math.floor(Math.random() * 1000) + 100,
                image: '/assets/images/product-placeholder.png',
                description: '杩欐槸涓€涓缁嗙殑鍟嗗搧鎻忚堪淇℃伅',
                specifications: [
                  { name: '鍝佺墝', value: '鍝佺墝A' },
                  { name: '瑙勬牸', value: '鏍囧噯鍨? }
                ]
              }
            });
          }, 500);
        });
        
        if (response.success) {
          commit('SET_CURRENT_PRODUCT', response.data);
          return response.data;
        }
        throw new Error('Fetch product failed');
      } catch (error) {
        console.error('Fetch product error:', error);
        commit('ui/SET_ERROR', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/SET_LOADING', false, { root: true });
      }
    },
    
    async fetchCategories({ commit }) {
      try {
        // 妯℃嫙API璋冪敤
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: [
                { id: '1', name: '鐢靛瓙浜у搧' },
                { id: '2', name: '瀹跺眳鐢ㄥ搧' },
                { id: '3', name: '鏈嶈闉嬪附' },
                { id: '4', name: '椋熷搧楗枡' }
              ]
            });
          }, 300);
        });
        
        if (response.success) {
          commit('SET_CATEGORIES', response.data);
          return response.data;
        }
        throw new Error('Fetch categories failed');
      } catch (error) {
        console.error('Fetch categories error:', error);
        throw error;
      }
    },
    
    changePage({ commit, dispatch }, page) {
      commit('SET_PAGINATION', { page });
      return dispatch('fetchProducts');
    }
  },
  
  getters: {
    filteredProducts: (state) => {
      return state.products.filter(product => {
        // 鍒嗙被杩囨护
        if (state.filters.category && product.categoryId !== state.filters.category) {
          return false;
        }
        
        // 浠锋牸鑼冨洿杩囨护
        if (product.price < state.filters.priceRange[0] || 
            product.price > state.filters.priceRange[1]) {
          return false;
        }
        
        // 鎼滅储杩囨护
        if (state.filters.search && 
            !product.name.toLowerCase().includes(state.filters.search.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    },
    
    currentPage: state => state.pagination.page,
    
    totalPages: state => Math.ceil(state.pagination.total / state.pagination.pageSize),
    
    hasMore: state => state.pagination.page < Math.ceil(state.pagination.total / state.pagination.pageSize)
  },
  
  persist: false // 涓嶆寔涔呭寲鍟嗗搧鏁版嵁
};