/**
 * 文件名: index.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 首页页面脚本
 */

const i18n = require('../../utils/i18n');
const { createPage } = require('../../utils/useStore.js');

// 使用状态管理创建页面配置
Page(createPage(
  // 映射的状态
  ['user.isLoggedIn', 'ui.loading'],
  // 映射的mutations
  {
    setLoading: 'SET_LOADING'
  }
)({
  data: {
    i18n: i18n,
    banners: [],
    categories: [],
    products: [],
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    // 可以在此处刷新部分数据
  },

  /**
   * 下拉刷新回调
   */
  onPullDownRefresh() {
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    // 预留：分页加载
  },

  /**
   * 数据缓存键
   */
  cacheKeys: {
    BANNERS: 'index_banners',
    CATEGORIES: 'index_categories',
    PRODUCTS: 'index_products'
  },

  /**
   * 缓存过期时间(毫秒)
   */
  cacheExpireTime: 5 * 60 * 1000, // 5分钟

  /**
   * 加载首页数据
   * @param {Function} done - 完成回调
   */
  loadData(done) {
    // 使用store设置加载状态
    this.setLoading(true);
    
    // 尝试从缓存获取数据
    const cachedData = this.getCachedData();
    
    if (cachedData && Object.keys(cachedData).length > 0) {
      // 有缓存数据，先显示缓存
      this.setData(cachedData);
      this.setLoading(false);
      
      if (typeof done === 'function') done();
    }
    
    // 异步加载最新数据
    const timer = setTimeout(() => {
      const mockBanners = [
        { id: 1, image: '/images/placeholder.svg' },
        { id: 2, image: '/images/placeholder.svg' },
        { id: 3, image: '/images/placeholder.svg' }
      ];
      const mockCategories = [
        { id: 1, name: i18n.translate('新品') || '新品', icon: '/images/placeholder.svg' },
        { id: 2, name: i18n.translate('推荐') || '推荐', icon: '/images/placeholder.svg' },
        { id: 3, name: i18n.translate('热卖') || '热卖', icon: '/images/placeholder.svg' },
        { id: 4, name: i18n.translate('分类') || '分类', icon: '/images/placeholder.svg' }
      ];
      const mockProducts = [
        { id: 1, name: i18n.translate('商品A') || '商品A', image: '/images/placeholder.svg', price: '99.00' },
        { id: 2, name: i18n.translate('商品B') || '商品B', image: '/images/placeholder.svg', price: '129.00' },
        { id: 3, name: i18n.translate('商品C') || '商品C', image: '/images/placeholder.svg', price: '79.00' },
        { id: 4, name: i18n.translate('商品D') || '商品D', image: '/images/placeholder.svg', price: '159.00' }
      ];
      
      // 预加载图片
      this.preloadImages([
        ...mockBanners.map(item => item.image),
        ...mockCategories.map(item => item.icon),
        ...mockProducts.map(item => item.image)
      ]);

      this.setData({
        banners: mockBanners,
        categories: mockCategories,
        products: mockProducts,
        timer: null
      });
      
      // 缓存数据
      this.cacheData({
        banners: mockBanners,
        categories: mockCategories,
        products: mockProducts
      });
      
      // 使用store设置加载状态为false
      this.setLoading(false);
      
      // 如果没有缓存数据，则调用回调
      if (!cachedData && typeof done === 'function') {
        done();
      }
    }, 300);
    
    this.setData({ timer });
  },

  /**
   * 从缓存获取数据
   * @returns {Object|null} 缓存的数据
   */
  getCachedData() {
    try {
      const now = Date.now();
      const cachedData = {};
      let hasValidCache = false;
      
      // 检查每个缓存项
      Object.values(this.cacheKeys).forEach(key => {
        const cached = wx.getStorageSync(key);
        if (cached && now - cached.timestamp < this.cacheExpireTime) {
          // 根据缓存键获取对应的字段名
          if (key === this.cacheKeys.BANNERS) {
            cachedData.banners = cached.data;
          } else if (key === this.cacheKeys.CATEGORIES) {
            cachedData.categories = cached.data;
          } else if (key === this.cacheKeys.PRODUCTS) {
            cachedData.products = cached.data;
          }
          hasValidCache = true;
        }
      });
      
      return hasValidCache ? cachedData : null;
    } catch (error) {
      console.error('获取缓存数据失败:', error);
      return null;
    }
  },

  /**
   * 缓存数据
   * @param {Object} data - 要缓存的数据
   */
  cacheData(data) {
    try {
      const timestamp = Date.now();
      
      // 缓存各个数据项
      if (data.banners) {
        wx.setStorageSync(this.cacheKeys.BANNERS, {
          data: data.banners,
          timestamp
        });
      }
      
      if (data.categories) {
        wx.setStorageSync(this.cacheKeys.CATEGORIES, {
          data: data.categories,
          timestamp
        });
      }
      
      if (data.products) {
        wx.setStorageSync(this.cacheKeys.PRODUCTS, {
          data: data.products,
          timestamp
        });
      }
    } catch (error) {
      console.error('缓存数据失败:', error);
    }
  },

  /**
   * 预加载图片
   * @param {Array} imageUrls - 图片URL数组
   */
  preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      wx.getImageInfo({
        src: url,
        success: () => {},
        fail: () => {}
      });
    });
  },

  /**
   * 跳转到分类页面
   * @param {Object} e - 事件对象
   */
  goToCategory(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/category/category?id=${id}`
    });
  },

  /**
   * 跳转到商品详情页
   * @param {Object} e - 事件对象
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },
  
  /**
   * 跳转到用户中心
   */
  goToUserCenter() {
    wx.navigateTo({
      url: '/pages/user/user'
    });
  },
  
  /**
   * 跳转到购物车
   */
  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  }
}));