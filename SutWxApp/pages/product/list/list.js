/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 鍟嗗搧鍒楄〃椤甸潰
 */
const i18n = require('../../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    products: [],
    categoryId: null,
    keyword: '',
    sortType: 'default', // default, price-asc, price-desc, sales
    filters: {
      priceRange: [0, 1000],
      brand: '',
      hasStock: true
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    loadTimer: null,
    loadMoreTimer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.categoryId - 鍒嗙被ID
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @returns {void}
   */
  onLoad(options) {
    if (options.categoryId) {
      this.setData({ categoryId: options.categoryId });
    }
    if (options.keyword) {
      this.setData({ keyword: options.keyword });
    }
    
    this.loadProducts();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣紝闃叉鍐呭瓨娉勬紡
    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadMoreTimer) {
      clearTimeout(this.data.loadMoreTimer);
    }
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 鍙互鍦ㄦ澶勫埛鏂伴儴鍒嗘暟鎹?  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   * @returns {void}
   */
  onPullDownRefresh() {
    this.setData({
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadProducts(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 瑙﹀簳鍔犺浇鏇村
   * @returns {void}
   */
  onReachBottom() {
    if (this.data.pagination.hasMore) {
      this.loadMoreProducts();
    }
  },

  /**
   * 鍔犺浇鍟嗗搧鍒楄〃
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadProducts(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockProducts = [
        { id: 1, name: i18n.translate('鍟嗗搧A'), image: '/assets/images/product1.jpg', price: '99.00', sales: 100 },
        { id: 2, name: i18n.translate('鍟嗗搧B'), image: '/assets/images/product2.jpg', price: '129.00', sales: 80 },
        { id: 3, name: i18n.translate('鍟嗗搧C'), image: '/assets/images/product3.jpg', price: '79.00', sales: 120 },
        { id: 4, name: i18n.translate('鍟嗗搧D'), image: '/assets/images/product4.jpg', price: '159.00', sales: 60 }
      ];

      this.setData({
        products: mockProducts,
        'pagination.total': mockProducts.length,
        loading: false,
        loadTimer: null
      });
      
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ loadTimer });
  },

  /**
   * 鍔犺浇鏇村鍟嗗搧
   * @returns {void}
   */
  loadMoreProducts() {
    if (!this.data.pagination.hasMore) return;
    
    this.setData({ loading: true });
    const loadMoreTimer = setTimeout(() => {
      const { products, pagination } = this.data;
      const newProducts = [
        { id: products.length + 1, name: i18n.translate('鍟嗗搧E'), image: '/assets/images/product5.jpg', price: '89.00', sales: 40 },
        { id: products.length + 2, name: i18n.translate('鍟嗗搧F'), image: '/assets/images/product6.jpg', price: '109.00', sales: 70 }
      ];
      
      const updatedProducts = [...products, ...newProducts];
      const hasMore = updatedProducts.length < pagination.total;
      
      this.setData({
        products: updatedProducts,
        'pagination.page': pagination.page + 1,
        'pagination.hasMore': hasMore,
        loading: false,
        loadMoreTimer: null
      });
    }, 300);
    
    this.setData({ loadMoreTimer });
  },

  /**
   * 鍒囨崲鎺掑簭鏂瑰紡
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  changeSortType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ sortType: type });
    this.setData({
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadProducts();
  },

  /**
   * 绛涢€夊晢鍝?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  filterProducts(e) {
    // 瀹為檯椤圭洰涓簲璇ユ墦寮€绛涢€夊脊绐?    this.setData({
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadProducts();
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 娣诲姞鍒拌喘鐗╄溅
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  addToCart(e) {
    const { id } = e.currentTarget.dataset;
    console.log('娣诲姞鍒拌喘鐗╄溅锛屽晢鍝両D:', id);
    // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI娣诲姞鍒拌喘鐗╄溅
    wx.showToast({
      title: i18n.translate('宸叉坊鍔犲埌璐墿杞?),
      icon: 'success'
    });
  }
});
