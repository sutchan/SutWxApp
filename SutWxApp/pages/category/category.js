/**
 * 鏂囦欢鍚? category.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鍒嗙被椤甸潰
 */
const i18n = require('../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    categories: [],
    products: [],
    loadTimer: null,
    loadProductsTimer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.id - 鍒嗙被ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ categoryId: options.id });
    }
    this.loadData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊鎵€鏈夊畾鏃跺櫒锛岄槻姝㈠唴瀛樻硠婕?    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadProductsTimer) {
      clearTimeout(this.data.loadProductsTimer);
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
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 瑙﹀簳鍔犺浇鏇村
   * @returns {void}
   */
  onReachBottom() {
    // 棰勭暀锛氬垎椤靛姞杞?  },

  /**
   * 鍔犺浇鍒嗙被鏁版嵁
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadData(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockCategories = [
        { id: 1, name: i18n.translate('鐢靛瓙浜у搧'), icon: '/assets/images/category_electronics.png' },
        { id: 2, name: i18n.translate('鏈嶈'), icon: '/assets/images/category_clothing.png' },
        { id: 3, name: i18n.translate('瀹跺眳'), icon: '/assets/images/category_home.png' },
        { id: 4, name: i18n.translate('缇庨'), icon: '/assets/images/category_food.png' }
      ];
      
      const mockProducts = [
        { id: 1, name: i18n.translate('鍟嗗搧A'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('鍟嗗搧B'), image: '/assets/images/product2.jpg', price: '129.00' },
        { id: 3, name: i18n.translate('鍟嗗搧C'), image: '/assets/images/product3.jpg', price: '79.00' },
        { id: 4, name: i18n.translate('鍟嗗搧D'), image: '/assets/images/product4.jpg', price: '159.00' }
      ];

      this.setData({
        categories: mockCategories,
        products: mockProducts,
        loading: false,
        loadTimer: null
      });
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ loadTimer });
  },

  /**
   * 鍒囨崲鍒嗙被
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  switchCategory(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ categoryId: id });
    // 鏍规嵁鍒嗙被ID鍔犺浇瀵瑰簲鍟嗗搧
    this.loadProductsByCategory(id);
  },

  /**
   * 鏍规嵁鍒嗙被鍔犺浇鍟嗗搧
   * @param {string} categoryId - 鍒嗙被ID
   * @returns {void}
   */
  loadProductsByCategory(categoryId) {
    // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI鑾峰彇瀵瑰簲鍒嗙被鐨勫晢鍝?    this.setData({ loading: true });
    const loadProductsTimer = setTimeout(() => {
      // 鏍规嵁categoryId鍔犺浇瀵瑰簲鍒嗙被鐨勫晢鍝?      const mockProducts = [
        { id: 1, name: i18n.translate('鍟嗗搧A'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('鍟嗗搧B'), image: '/assets/images/product2.jpg', price: '129.00' }
      ];
      
      this.setData({
        products: mockProducts,
        loading: false,
        loadProductsTimer: null
      });
    }, 300);
    
    this.setData({ loadProductsTimer });
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
  }
});