/**
 * 文件名: detail.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 商品详情页面
 */
const i18n = require('../../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    productId: null,
    product: null,
    selectedSpecs: {},
    quantity: 1,
    showSpecModal: false,
    reviews: [],
    relatedProducts: [],
    timer: null,
    reviewsTimer: null,
    relatedProductsTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.id - 商品ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id });
      this.loadProductDetail(options.id);
      this.loadProductReviews(options.id);
      this.loadRelatedProducts(options.id);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理所有定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    if (this.data.reviewsTimer) {
      clearTimeout(this.data.reviewsTimer);
    }
    if (this.data.relatedProductsTimer) {
      clearTimeout(this.data.relatedProductsTimer);
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
    this.loadProductDetail(this.data.productId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 分享页面
   * @returns {Object} 分享配置
   */
  onShareAppMessage() {
    return {
      title: this.data.product ? this.data.product.name : i18n.translate('商品详情'),
      path: `/pages/product/detail/detail?id=${this.data.productId}`
    };
  },

  /**
   * 加载商品详情
   * @param {string} id - 商品ID
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadProductDetail(id, done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockProduct = {
        id: id,
        name: i18n.translate('优质商品'),
        description: i18n.translate('这是一个高质量的商品，采用优质材料制作，设计精美，功能实用。'),
        price: '99.00',
        originalPrice: '129.00',
        images: [
          '/assets/images/product1.jpg',
          '/assets/images/product2.jpg',
          '/assets/images/product3.jpg'
        ],
        specs: [
          {
            name: i18n.translate('颜色'),
            options: [
              { id: 'red', name: i18n.translate('红色') },
              { id: 'blue', name: i18n.translate('蓝色') },
              { id: 'black', name: i18n.translate('黑色') }
            ]
          },
          {
            name: i18n.translate('尺寸'),
            options: [
              { id: 's', name: 'S' },
              { id: 'm', name: 'M' },
              { id: 'l', name: 'L' }
            ]
          }
        ],
        stock: 100,
        sales: 500,
        rating: 4.5
      };

      // 初始化选中规格
      const selectedSpecs = {};
      mockProduct.specs.forEach(spec => {
        selectedSpecs[spec.name] = spec.options[0].id;
      });

      this.setData({
        product: mockProduct,
        selectedSpecs,
        loading: false,
        timer: null
      });
      
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ timer });
  },

  /**
   * 加载商品评价
   * @param {string} id - 商品ID
   * @returns {void}
   */
  loadProductReviews(id) {
    console.log('加载商品评价，商品ID:', id);
    const reviewsTimer = setTimeout(() => {
      const mockReviews = [
        {
          id: 1,
          user: {
            avatar: '/assets/images/avatar1.jpg',
            name: i18n.translate('用户A')
          },
          rating: 5,
          content: i18n.translate('商品质量很好，非常满意！'),
          images: ['/assets/images/review1.jpg'],
          createTime: '2023-10-01'
        },
        {
          id: 2,
          user: {
            avatar: '/assets/images/avatar2.jpg',
            name: i18n.translate('用户B')
          },
          rating: 4,
          content: i18n.translate('整体不错，就是物流有点慢'),
          images: [],
          createTime: '2023-09-28'
        }
      ];

      this.setData({ 
        reviews: mockReviews,
        reviewsTimer: null
      });
    }, 500);
    
    this.setData({ reviewsTimer });
  },

  /**
   * 加载相关商品
   * @param {string} id - 商品ID
   * @returns {void}
   */
  loadRelatedProducts(id) {
    console.log('加载相关商品，当前商品ID:', id);
    const relatedProductsTimer = setTimeout(() => {
      const mockRelatedProducts = [
        { id: 1, name: i18n.translate('相关商品A'), image: '/assets/images/product4.jpg', price: '89.00' },
        { id: 2, name: i18n.translate('相关商品B'), image: '/assets/images/product5.jpg', price: '109.00' },
        { id: 3, name: i18n.translate('相关商品C'), image: '/assets/images/product6.jpg', price: '79.00' }
      ];

      this.setData({ 
        relatedProducts: mockRelatedProducts,
        relatedProductsTimer: null
      });
    }, 500);
    
    this.setData({ relatedProductsTimer });
  },

  /**
   * 预览图片
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current
    });
  },

  /**
   * 显示规格选择弹窗
   * @returns {void}
   */
  showSpecModal() {
    this.setData({ showSpecModal: true });
  },

  /**
   * 隐藏规格选择弹窗
   * @returns {void}
   */
  hideSpecModal() {
    this.setData({ showSpecModal: false });
  },

  /**
   * 选择规格
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  selectSpec(e) {
    const { specName, optionId } = e.currentTarget.dataset;
    this.setData({
      [`selectedSpecs.${specName}`]: optionId
    });
  },

  /**
   * 增加数量
   * @returns {void}
   */
  increaseQuantity() {
    const { quantity, product } = this.data;
    if (quantity < product.stock) {
      this.setData({ quantity: quantity + 1 });
    }
  },

  /**
   * 减少数量
   * @returns {void}
   */
  decreaseQuantity() {
    const { quantity } = this.data;
    if (quantity > 1) {
      this.setData({ quantity: quantity - 1 });
    }
  },

  /**
   * 添加到购物车
   * @returns {void}
   */
  addToCart() {
    // 实际项目中应该调用API添加到购物车
    wx.showToast({
      title: i18n.translate('已添加到购物车'),
      icon: 'success'
    });
    this.hideSpecModal();
  },

  /**
   * 立即购买
   * @returns {void}
   */
  buyNow() {
    // 实际项目中应该跳转到订单确认页面
    this.hideSpecModal();
    wx.navigateTo({
      url: `/pages/order/confirm?productId=${this.data.productId}&quantity=${this.data.quantity}`
    });
  },

  /**
   * 收藏商品
   * @returns {void}
   */
  toggleFavorite() {
    // 实际项目中应该调用API收藏/取消收藏
    const { product } = this.data;
    const isFavorited = product.isFavorited;
    
    wx.showToast({
      title: isFavorited ? i18n.translate('已取消收藏') : i18n.translate('已收藏'),
      icon: 'success'
    });
    
    this.setData({
      'product.isFavorited': !isFavorited
    });
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