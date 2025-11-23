/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 商品列表页面
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
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.categoryId - 分类ID
   * @param {string} options.keyword - 搜索关键词
   * @returns {void}
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
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadMoreTimer) {
      clearTimeout(this.data.loadMoreTimer);
    }
  },

  /**
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 可以在此处刷新部分数据
  },

  /**
   * 下拉刷新回调
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
   * 触底加载更多
   * @returns {void}
   */
  onReachBottom() {
    if (this.data.pagination.hasMore) {
      this.loadMoreProducts();
    }
  },

  /**
   * 加载商品列表
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadProducts(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockProducts = [
        { id: 1, name: i18n.translate('商品A'), image: '/assets/images/product1.jpg', price: '99.00', sales: 100 },
        { id: 2, name: i18n.translate('商品B'), image: '/assets/images/product2.jpg', price: '129.00', sales: 80 },
        { id: 3, name: i18n.translate('商品C'), image: '/assets/images/product3.jpg', price: '79.00', sales: 120 },
        { id: 4, name: i18n.translate('商品D'), image: '/assets/images/product4.jpg', price: '159.00', sales: 60 }
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
   * 加载更多商品
   * @returns {void}
   */
  loadMoreProducts() {
    if (!this.data.pagination.hasMore) return;
    
    this.setData({ loading: true });
    const loadMoreTimer = setTimeout(() => {
      const { products, pagination } = this.data;
      const newProducts = [
        { id: products.length + 1, name: i18n.translate('商品E'), image: '/assets/images/product5.jpg', price: '89.00', sales: 40 },
        { id: products.length + 2, name: i18n.translate('商品F'), image: '/assets/images/product6.jpg', price: '109.00', sales: 70 }
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
   * 切换排序方式
   * @param {Object} e - 事件对象
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
   * 筛选商品
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  filterProducts(e) {
    // 实际项目中应该打开筛选弹窗
    this.setData({
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadProducts();
  },

  /**
   * 跳转到商品详情页
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 添加到购物车
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  addToCart(e) {
    const { id } = e.currentTarget.dataset;
    console.log('添加到购物车，商品ID:', id);
    // 实际项目中应该调用API添加到购物车
    wx.showToast({
      title: i18n.translate('已添加到购物车'),
      icon: 'success'
    });
  }
});