/**
 * 鏂囦欢鍚? category.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 閸掑棛琚い鐢告桨
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.id - 閸掑棛琚獻D
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ categoryId: options.id });
    }
    this.loadData();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婇幍鈧張澶婄暰閺冭泛娅掗敍宀勬Щ濮濄垹鍞寸€涙ɑ纭犲?    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadProductsTimer) {
      clearTimeout(this.data.loadProductsTimer);
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
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 鐟欙箑绨抽崝鐘烘祰閺囨潙顦?   * @returns {void}
   */
  onReachBottom() {
    // 妫板嫮鏆€閿涙艾鍨庢い闈涘鏉?  },

  /**
   * 閸旂姾娴囬崚鍡欒閺佺増宓?   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  loadData(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockCategories = [
        { id: 1, name: i18n.translate('閻㈤潧鐡欐禍褍鎼?), icon: '/assets/images/category_electronics.png' },
        { id: 2, name: i18n.translate('閺堝秷顥?), icon: '/assets/images/category_clothing.png' },
        { id: 3, name: i18n.translate('鐎硅泛鐪?), icon: '/assets/images/category_home.png' },
        { id: 4, name: i18n.translate('缂囧酣顥?), icon: '/assets/images/category_food.png' }
      ];
      
      const mockProducts = [
        { id: 1, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product2.jpg', price: '129.00' },
        { id: 3, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product3.jpg', price: '79.00' },
        { id: 4, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product4.jpg', price: '159.00' }
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
   * 閸掑洦宕查崚鍡欒
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  switchCategory(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ categoryId: id });
    // 閺嶈宓侀崚鍡欒ID閸旂姾娴囩€电懓绨查崯鍡楁惂
    this.loadProductsByCategory(id);
  },

  /**
   * 閺嶈宓侀崚鍡欒閸旂姾娴囬崯鍡楁惂
   * @param {string} categoryId - 閸掑棛琚獻D
   * @returns {void}
   */
  loadProductsByCategory(categoryId) {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I閼惧嘲褰囩€电懓绨查崚鍡欒閻ㄥ嫬鏅㈤崫?    this.setData({ loading: true });
    const loadProductsTimer = setTimeout(() => {
      // 閺嶈宓乧ategoryId閸旂姾娴囩€电懓绨查崚鍡欒閻ㄥ嫬鏅㈤崫?      const mockProducts = [
        { id: 1, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('閸熷棗鎼'), image: '/assets/images/product2.jpg', price: '129.00' }
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
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});
