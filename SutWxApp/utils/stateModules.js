/**
 * 鏂囦欢鍚? stateModules.js
 * 鐗堟湰鍙? 1.1.0
 * 更新日期: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 描述: 妫板嫬鐣炬稊澶屽Ц閹焦膩閸ф娉﹂崥鍫礉娑撶儤鐗宠箛鍐ㄥ閼宠姤褰佹笟娑欑垼閸戝棗瀵查惃鍕Ц閹胶顓搁悶鍡樐侀崸? */

// 鐎电厧鍙哤ebSocket閺堝秴濮?const webSocketService = require('./webSocketService.js').instance;

// 閻劍鍩涘Ο鈥虫健
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
        // 濡剝瀚橝PI鐠嬪啰鏁?        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                token: 'mock_token_' + Date.now(),
                userInfo: {
                  id: '1',
                  username,
                  nickname: '閻劍鍩? + username,
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
          
          // 閻ц缍嶉幋鎰閸氬氦绻涢幒顧漞bSocket
          try {
            console.log('閻劍鍩涢惂璇茬秿閹存劕濮涢敍宀冪箾閹侯櫇ebSocket...');
            await webSocketService.connect({
              userId: response.data.userInfo.id,
              token: response.data.token
            });
          } catch (wsError) {
            console.error('WebSocket鏉╃偞甯存径杈Е閿涘奔绲炬稉宥呭閸濆秶娅ヨぐ鏇熺ウ缁?', wsError);
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
        // 閻ц鍤崜宥嗘焽瀵偓WebSocket鏉╃偞甯?        console.log('閻劍鍩涢惂璇插毉閿涘本鏌囧鈧琖ebSocket鏉╃偞甯?..');
        await webSocketService.disconnect(1000, '閻劍鍩涢惂璇插毉');
      } catch (wsError) {
        console.error('WebSocket閺傤厼绱戞潻鐐村复婢惰精瑙﹂敍灞肩稻缂佈呯敾閻ц鍤ù浣衡柤:', wsError);
      }
      
      // 濞撳懘娅庨惂璇茬秿閻樿埖鈧?      commit('LOGOUT');
      // 閸欘垯浜掗崷銊ㄧ箹闁插矁鐨熼悽銊ф閸戠瘓PI
    },
    
    async updateProfile({ commit, state }, profileData) {
      try {
        // 濡剝瀚橝PI鐠嬪啰鏁?        const response = await new Promise(resolve => {
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
      return state.profile.nickname || state.userInfo?.nickname || '閺堫亞娅ヨぐ鏇犳暏閹?;
    },
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission);
    }
  },
  
  persist: true // 閹镐椒绠欓崠鏍嚉濡€虫健
};

// UI濡€虫健
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
      confirmText: '绾喖鐣?,
      cancelText: '閸欐牗绉?
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
          confirmText: '绾喖鐣?,
          cancelText: '閸欐牗绉?,
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
      // 閼奉亜濮╅梾鎰
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
      // 閸欘垯浜掗崷銊ㄧ箹闁插苯绨查悽銊ゅ瘜妫版ê鍩屾い鐢告桨
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
  
  persist: true // 閹镐椒绠欓崠鏍嚉濡€虫健
};

// 鐠愵厾澧挎潪锔侥侀崸?exports.cartModule = {
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
        // 閸熷棗鎼у鎻掔摠閸︻煉绱濇晶鐐插閺佷即鍣?        newItems = [...state.items];
        newItems[existingItemIndex].quantity += product.quantity || 1;
      } else {
        // 濞ｈ濮為弬鏉挎櫌閸?        newItems = [...state.items, {
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
      // 閺勫墽銇氬ǎ璇插閹存劕濮涢幓鎰仛
      dispatch('ui/SHOW_TOAST', {
        message: '瀹稿弶鍧婇崝鐘插煂鐠愵厾澧挎潪?,
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
        
        // 濡剝瀚橝PI鐠嬪啰鏁?        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, orderId: 'ORD' + Date.now() });
          }, 1000);
        });
        
        if (response.success) {
          // 濞撳懐鈹栫拹顓犲⒖鏉?          commit('CLEAR_CART');
          
          // 閺勫墽銇氶幋鎰閹绘劗銇?          dispatch('ui/SHOW_TOAST', {
            message: '鐠併垹宕熼崚娑樼紦閹存劕濮?,
            type: 'success'
          }, { root: true });
          
          return response.orderId;
        }
        throw new Error('Checkout failed');
      } catch (error) {
        console.error('Checkout error:', error);
        
        dispatch('ui/SHOW_TOAST', {
          message: '鐠併垹宕熼崚娑樼紦婢惰精瑙?,
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
  
  persist: true // 閹镐椒绠欓崠鏍嚉濡€虫健
};

// 閸熷棗鎼уΟ鈥虫健
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
          page: 1 // 闁插秶鐤嗘い鐢电垳
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
        
        // 濡剝瀚橝PI鐠嬪啰鏁?        const response = await new Promise(resolve => {
          setTimeout(() => {
            const mockProducts = Array.from({ length: state.pagination.pageSize }, (_, i) => ({
              id: String((state.pagination.page - 1) * state.pagination.pageSize + i + 1),
              name: `閸熷棗鎼?${(state.pagination.page - 1) * state.pagination.pageSize + i + 1}`,
              price: Math.floor(Math.random() * 1000) + 100,
              image: '/assets/images/product-placeholder.png',
              description: '鏉╂瑦妲告稉鈧稉顏嗐仛娓氬鏅㈤崫浣瑰伎鏉?
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
        
        // 濡剝瀚橝PI鐠嬪啰鏁?        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                id: productId,
                name: `閸熷棗鎼?${productId}`,
                price: Math.floor(Math.random() * 1000) + 100,
                image: '/assets/images/product-placeholder.png',
                description: '鏉╂瑦妲告稉鈧稉顏囶嚊缂佸棛娈戦崯鍡楁惂閹诲繗鍫穱鈩冧紖',
                specifications: [
                  { name: '閸濅胶澧?, value: '閸濅胶澧滱' },
                  { name: '鐟欏嫭鐗?, value: '閺嶅洤鍣崹? }
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
        // 濡剝瀚橝PI鐠嬪啰鏁?        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: [
                { id: '1', name: '閻㈤潧鐡欐禍褍鎼? },
                { id: '2', name: '鐎硅泛鐪抽悽銊ユ惂' },
                { id: '3', name: '閺堝秷顥婇棄瀣檮' },
                { id: '4', name: '妞嬬喎鎼ф顔芥灐' }
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
        // 閸掑棛琚潻鍥ㄦ姢
        if (state.filters.category && product.categoryId !== state.filters.category) {
          return false;
        }
        
        // 娴犻攱鐗搁懠鍐ㄦ纯鏉╁洦鎶?        if (product.price < state.filters.priceRange[0] || 
            product.price > state.filters.priceRange[1]) {
          return false;
        }
        
        // 閹兼粎鍌ㄦ潻鍥ㄦ姢
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
  
  persist: false // 娑撳秵瀵旀稊鍛閸熷棗鎼ч弫鐗堝祦
};