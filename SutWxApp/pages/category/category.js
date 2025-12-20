/**
 * 鏂囦欢鍚?category.js
 * 鐗堟湰鍙?1.0.1
 * 鏇存柊鏃ユ湡: 2025-12-04
 * 浣滆€? Sut
 * 鎻忚堪: 鍒嗙被椤甸潰锛屽睍绀哄晢鍝佸垎绫诲拰鍒嗙被涓嬬殑鍟嗗搧
 */
const i18n = require('../../utils/i18n');
const categoryService = require('../../services/categoryService');
const productService = require('../../services/productService');

Page({
  data: {
    i18n: i18n,
    loading: false,
    categories: [],
    products: [],
    categoryId: '',
    activeCategoryId: '',
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.id - 鍒嗙被ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ 
        categoryId: options.id,
        activeCategoryId: options.id
      });
    }
    this.loadCategories();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣?    if (this.loadTimer) {
      clearTimeout(this.loadTimer);
    }
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   * @returns {void}
   */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadCategories(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   * @returns {void}
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadProductsByCategory(this.data.activeCategoryId, true);
    }
  },

  /**
   * 鍔犺浇鍒嗙被鍒楄〃
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  async loadCategories(done) {
    try {
      this.setData({ loading: true });
      
      // 浣跨敤鍒嗙被鏈嶅姟鑾峰彇鍒嗙被鍒楄〃
      const categoriesResponse = await categoryService.getCategoryList({
        includeChildren: true,
        includeProductCount: true
      });
      
      this.setData({ categories: categoriesResponse.data || [] });
      
      // 濡傛灉鏈夋寚瀹氬垎绫籌D锛屽姞杞藉搴斿垎绫荤殑鍟嗗搧
      if (this.data.categoryId) {
        this.loadProductsByCategory(this.data.categoryId);
      } else if (categoriesResponse.data && categoriesResponse.data.length > 0) {
        // 鍚﹀垯鍔犺浇绗竴涓垎绫荤殑鍟嗗搧
        const firstCategoryId = categoriesResponse.data[0].id;
        this.setData({ activeCategoryId: firstCategoryId });
        this.loadProductsByCategory(firstCategoryId);
      }
    } catch (error) {
      console.error('鍔犺浇鍒嗙被澶辫触:', error);
      wx.showToast({
        title: '鍔犺浇鍒嗙被澶辫触',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      if (typeof done === 'function') done();
    }
  },

  /**
   * 鍒囨崲鍒嗙被
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  switchCategory(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ 
      activeCategoryId: id,
      page: 1,
      hasMore: true,
      products: []
    });
    // 鏍规嵁鍒嗙被ID鍔犺浇鍒嗙被鍟嗗搧
    this.loadProductsByCategory(id);
  },

  /**
   * 鏍规嵁鍒嗙被鍔犺浇鍟嗗搧
   * @param {string} categoryId - 鍒嗙被ID
   * @param {boolean} isLoadMore - 鏄惁鍔犺浇鏇村
   * @returns {void}
   */
  async loadProductsByCategory(categoryId, isLoadMore = false) {
    try {
      this.setData({ loading: true });
      
      // 浣跨敤浜у搧鏈嶅姟鑾峰彇鍒嗙被涓嬬殑鍟嗗搧
      const productsResponse = await productService.getProducts({
        categoryId: categoryId,
        page: this.data.page,
        pageSize: this.data.pageSize
      });
      
      let products = [];
      if (isLoadMore) {
        products = [...this.data.products, ...productsResponse.data];
      } else {
        products = productsResponse.data;
      }
      
      this.setData({
        products: products,
        hasMore: products.length < productsResponse.total,
        loading: false
      });
    } catch (error) {
      console.error('鍔犺浇鍟嗗搧澶辫触:', error);
      wx.showToast({
        title: '鍔犺浇鍟嗗搧澶辫触',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});
