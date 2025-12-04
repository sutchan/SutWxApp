/**
 * 文件名 stateModules.js
 * 版本号 1.1.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 应用状态模块定义，包含用户、UI、购物车和产品等模块的状态管理
 */

// 导入WebSocket服务
const webSocketService = require('./webSocketService.js').instance;

// 用户模块
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
        // 模拟API请求
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                token: 'mock_token_' + Date.now(),
                userInfo: {
                  id: '1',
                  username,
                  nickname: '用户 ' + username,
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
          
          // 登录成功后连接WebSocket
          try {
            console.log('登录成功，正在连接WebSocket...');
            await webSocketService.connect({
              userId: response.data.userInfo.id,
              token: response.data.token
            });
          } catch (wsError) {
            console.error('WebSocket连接失败，将在后台重试:', wsError);
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
        // 登出时断开WebSocket连接
        console.log('登出中，正在断开WebSocket连接...');
        await webSocketService.disconnect(1000, '用户登出');
      } catch (wsError) {
        console.error('WebSocket断开失败:', wsError);
      }
      
      // 清除用户状态
      commit('LOGOUT');
      // 可以在这里调用登出API
    },
    
    async updateProfile({ commit, state }, profileData) {
      try {
        // 模拟API请求
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
      return state.profile.nickname || state.userInfo?.nickname || '未登录用户';
    },
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission);
    }
  },
  
  persist: true // 持久化用户模块
};

// UI模块
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
      confirmText: '确认',
      cancelText: '取消'
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
          confirmText: '确认',
          cancelText: '取消',
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
      // 自动隐藏
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
      // 更新导航栏颜色
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
  
  persist: true // 持久化UI模块
};

// 购物车模块
exports.cartModule = {
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
        // 商品已存在，增加数量
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += product.quantity || 1;
      } else {
        // 新商品，添加到购物车
        newItems = [...state.items, {
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
      // 显示添加成功提示
      dispatch('ui/SHOW_TOAST', {
        message: '已添加到购物车',
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
        
        // 模拟API请求
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, orderId: 'ORD' + Date.now() });
          }, 1000);
        });
        
        if (response.success) {
          // 清空购物车
          commit('CLEAR_CART');
          
          // 显示成功提示
          dispatch('ui/SHOW_TOAST', {
            message: '下单成功',
            type: 'success'
          }, { root: true });
          
          return response.orderId;
        }
        throw new Error('Checkout failed');
      } catch (error) {
        console.error('Checkout error:', error);
        
        dispatch('ui/SHOW_TOAST', {
          message: '下单失败',
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
  
  persist: true // 持久化购物车模块
};

// 产品模块
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
          page: 1 // 筛选条件变化时重置页码
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
        
        // 模拟API请求
        const response = await new Promise(resolve => {
          setTimeout(() => {
            const mockProducts = Array.from({ length: state.pagination.pageSize }, (_, i) => ({
              id: String((state.pagination.page - 1) * state.pagination.pageSize + i + 1),
              name: `产品 ${(state.pagination.page - 1) * state.pagination.pageSize + i + 1}`,
              price: Math.floor(Math.random() * 1000) + 100,
              image: '/assets/images/product-placeholder.png',
              description: '这是产品的详细描述，包含产品的功能、特点等信息。'
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
        
        // 模拟API请求
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                id: productId,
                name: `产品 ${productId}`,
                price: Math.floor(Math.random() * 1000) + 100,
                image: '/assets/images/product-placeholder.png',
                description: '这是产品的详细描述，包含产品的功能、特点等信息。',
                specifications: [
                  { name: '品牌', value: '品牌A' },
                  { name: '型号', value: '型号X' }
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
        // 模拟API请求
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: [
                { id: '1', name: '电子产品' },
                { id: '2', name: '家居用品' },
                { id: '3', name: '服装鞋帽' },
                { id: '4', name: '食品饮料' }
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
        // 分类筛选
        if (state.filters.category && product.categoryId !== state.filters.category) {
          return false;
        }
        
        // 价格范围筛选
        if (product.price < state.filters.priceRange[0] || 
            product.price > state.filters.priceRange[1]) {
          return false;
        }
        
        // 搜索筛选
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
  
  persist: false // 不持久化产品模块
};