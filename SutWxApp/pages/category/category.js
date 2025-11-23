/**
 * 文件名: category.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 分类页面
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
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.id - 分类ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ categoryId: options.id });
    }
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理所有定时器，防止内存泄漏
    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadProductsTimer) {
      clearTimeout(this.data.loadProductsTimer);
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
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 触底加载更多
   * @returns {void}
   */
  onReachBottom() {
    // 预留：分页加载
  },

  /**
   * 加载分类数据
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadData(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockCategories = [
        { id: 1, name: i18n.translate('电子产品'), icon: '/assets/images/category_electronics.png' },
        { id: 2, name: i18n.translate('服装'), icon: '/assets/images/category_clothing.png' },
        { id: 3, name: i18n.translate('家居'), icon: '/assets/images/category_home.png' },
        { id: 4, name: i18n.translate('美食'), icon: '/assets/images/category_food.png' }
      ];
      
      const mockProducts = [
        { id: 1, name: i18n.translate('商品A'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('商品B'), image: '/assets/images/product2.jpg', price: '129.00' },
        { id: 3, name: i18n.translate('商品C'), image: '/assets/images/product3.jpg', price: '79.00' },
        { id: 4, name: i18n.translate('商品D'), image: '/assets/images/product4.jpg', price: '159.00' }
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
   * 切换分类
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  switchCategory(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ categoryId: id });
    // 根据分类ID加载对应商品
    this.loadProductsByCategory(id);
  },

  /**
   * 根据分类加载商品
   * @param {string} categoryId - 分类ID
   * @returns {void}
   */
  loadProductsByCategory(categoryId) {
    // 实际项目中应该调用API获取对应分类的商品
    this.setData({ loading: true });
    const loadProductsTimer = setTimeout(() => {
      // 根据categoryId加载对应分类的商品
      const mockProducts = [
        { id: 1, name: i18n.translate('商品A'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('商品B'), image: '/assets/images/product2.jpg', price: '129.00' }
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
   * 跳转到商品详情页
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});