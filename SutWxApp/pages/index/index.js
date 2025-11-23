/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 首页
 */
const i18n = require('../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    banners: [],
    categories: [],
    products: [],
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   * @returns {void}
   */
  onLoad() {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
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
   * 加载首页数据
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadData(done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockBanners = [
        { id: 1, image: '/assets/images/banner1.jpg' },
        { id: 2, image: '/assets/images/banner2.jpg' },
        { id: 3, image: '/assets/images/banner3.jpg' }
      ];
      const mockCategories = [
        { id: 1, name: i18n.translate('新品'), icon: '/assets/images/icon_new.png' },
        { id: 2, name: i18n.translate('推荐'), icon: '/assets/images/icon_recommend.png' },
        { id: 3, name: i18n.translate('热卖'), icon: '/assets/images/icon_hot.png' },
        { id: 4, name: i18n.translate('分类'), icon: '/assets/images/icon_category.png' }
      ];
      const mockProducts = [
        { id: 1, name: i18n.translate('商品A'), image: '/assets/images/product1.jpg', price: '99.00' },
        { id: 2, name: i18n.translate('商品B'), image: '/assets/images/product2.jpg', price: '129.00' },
        { id: 3, name: i18n.translate('商品C'), image: '/assets/images/product3.jpg', price: '79.00' },
        { id: 4, name: i18n.translate('商品D'), image: '/assets/images/product4.jpg', price: '159.00' }
      ];

      this.setData({
        banners: mockBanners,
        categories: mockCategories,
        products: mockProducts,
        loading: false,
        timer: null
      });
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ timer });
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
  }
});