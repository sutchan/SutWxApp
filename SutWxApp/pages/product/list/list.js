/**
 * 文件名 list.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 閸熷棗鎼ч崚妤勩€冩い鐢告桨
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.categoryId - 閸掑棛琚獻D
   * @param {string} options.keyword - 閹兼粎鍌ㄩ崗鎶芥暛鐠?   * @returns {void}
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婄€规碍妞傞崳顭掔礉闂冨弶顒涢崘鍛摠濞夊嫭绱?    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadMoreTimer) {
      clearTimeout(this.data.loadMoreTimer);
    }
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 閸欘垯浜掗崷銊︻劃婢跺嫬鍩涢弬浼村劥閸掑棙鏆熼幑?  },

  /**
   * 娑撳濯洪崚閿嬫煀閸ョ偠鐨?   * @returns {void}
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
   * 鐟欙箑绨抽崝状态烘祰閺囨潙顦?   * @returns {void}
   */
  onReachBottom() {
    if (this.data.pagination.hasMore) {
      this.loadMoreProducts();
    }
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂閸掓銆?   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  loadProducts(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockProducts = [
        { id: 1, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product1.jpg', price: '99.00', sales: 100 },
        { id: 2, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product2.jpg', price: '129.00', sales: 80 },
        { id: 3, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product3.jpg', price: '79.00', sales: 120 },
        { id: 4, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product4.jpg', price: '159.00', sales: 60 }
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
   * 閸旂姾娴囬弴鏉戭樋閸熷棗鎼?   * @returns {void}
   */
  loadMoreProducts() {
    if (!this.data.pagination.hasMore) return;
    
    this.setData({ loading: true });
    const loadMoreTimer = setTimeout(() => {
      const { products, pagination } = this.data;
      const newProducts = [
        { id: products.length + 1, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product5.jpg', price: '89.00', sales: 40 },
        { id: products.length + 2, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product6.jpg', price: '109.00', sales: 70 }
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
   * 閸掑洦宕查幒鎺戠碍閺傜懓绱?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
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
   * 缁涙盯鈧鏅㈤崫?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  filterProducts(e) {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉﹀ⅵ瀵偓缁涙盯鈧鑴婄粣?    this.setData({
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadProducts();
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 濞ｈ濮為崚鎷屽枠閻椻晞婧?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  addToCart(e) {
    const { id } = e.currentTarget.dataset;
    console.log('濞ｈ濮為崚鎷屽枠閻椻晞婧呴敍灞芥櫌閸濅浮D:', id);
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I濞ｈ濮為崚鎷屽枠閻椻晞婧?    wx.showToast({
      title: i18n.translate('瀹稿弶鍧婇崝状态插煂鐠愵厾澧挎潪?),
      icon: 'success'
    });
  }
});
