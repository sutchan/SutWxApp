/**
 * 文件名: detail.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 鍟嗗搧璇︽儏椤甸潰
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.id - 鍟嗗搧ID
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊鎵€鏈夊畾鏃跺櫒锛岄槻姝㈠唴瀛樻硠婕?    if (this.data.timer) {
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
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 鍙互鍦ㄦ澶勫埛鏂伴儴鍒嗘暟鎹?  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadProductDetail(this.data.productId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 鍒嗕韩椤甸潰
   * @returns {Object} 鍒嗕韩閰嶇疆
   */
  onShareAppMessage() {
    return {
      title: this.data.product ? this.data.product.name : i18n.translate('鍟嗗搧璇︽儏'),
      path: `/pages/product/detail/detail?id=${this.data.productId}`
    };
  },

  /**
   * 鍔犺浇鍟嗗搧璇︽儏
   * @param {string} id - 鍟嗗搧ID
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadProductDetail(id, done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockProduct = {
        id: id,
        name: i18n.translate('浼樿川鍟嗗搧'),
        description: i18n.translate('杩欐槸涓€涓珮璐ㄩ噺鐨勫晢鍝侊紝閲囩敤浼樿川鏉愭枡鍒朵綔锛岃璁＄簿缇庯紝鍔熻兘瀹炵敤銆?),
        price: '99.00',
        originalPrice: '129.00',
        images: [
          '/images/placeholder.svg',
          '/images/placeholder.svg',
          '/images/placeholder.svg'
        ],
        specs: [
          {
            name: i18n.translate('棰滆壊'),
            options: [
              { id: 'red', name: i18n.translate('绾㈣壊') },
              { id: 'blue', name: i18n.translate('钃濊壊') },
              { id: 'black', name: i18n.translate('榛戣壊') }
            ]
          },
          {
            name: i18n.translate('灏哄'),
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

      // 鍒濆鍖栭€変腑瑙勬牸
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
   * 鍔犺浇鍟嗗搧璇勪环
   * @param {string} id - 鍟嗗搧ID
   * @returns {void}
   */
  loadProductReviews(id) {
    console.log('鍔犺浇鍟嗗搧璇勪环锛屽晢鍝両D:', id);
    const reviewsTimer = setTimeout(() => {
      const mockReviews = [
        {
          id: 1,
          user: {
            avatar: '/images/default-avatar.png',
            name: i18n.translate('鐢ㄦ埛A')
          },
          rating: 5,
          content: i18n.translate('鍟嗗搧璐ㄩ噺寰堝ソ锛岄潪甯告弧鎰忥紒'),
          images: ['/images/placeholder.svg'],
          createTime: '2023-10-01'
        },
        {
          id: 2,
          user: {
            avatar: '/images/default-avatar.png',
            name: i18n.translate('鐢ㄦ埛B')
          },
          rating: 4,
          content: i18n.translate('鏁翠綋涓嶉敊锛屽氨鏄墿娴佹湁鐐规參'),
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
   * 鍔犺浇鐩稿叧鍟嗗搧
   * @param {string} id - 鍟嗗搧ID
   * @returns {void}
   */
  loadRelatedProducts(id) {
    console.log('鍔犺浇鐩稿叧鍟嗗搧锛屽綋鍓嶅晢鍝両D:', id);
    const relatedProductsTimer = setTimeout(() => {
      const mockRelatedProducts = [
        { id: 1, name: i18n.translate('鐩稿叧鍟嗗搧A'), image: '/images/placeholder.svg', price: '89.00' },
        { id: 2, name: i18n.translate('鐩稿叧鍟嗗搧B'), image: '/images/placeholder.svg', price: '109.00' },
        { id: 3, name: i18n.translate('鐩稿叧鍟嗗搧C'), image: '/images/placeholder.svg', price: '79.00' }
      ];

      this.setData({ 
        relatedProducts: mockRelatedProducts,
        relatedProductsTimer: null
      });
    }, 500);
    
    this.setData({ relatedProductsTimer });
  },

  /**
   * 棰勮鍥剧墖
   * @param {Object} e - 浜嬩欢瀵硅薄
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
   * 鏄剧ず瑙勬牸閫夋嫨寮圭獥
   * @returns {void}
   */
  showSpecModal() {
    this.setData({ showSpecModal: true });
  },

  /**
   * 闅愯棌瑙勬牸閫夋嫨寮圭獥
   * @returns {void}
   */
  hideSpecModal() {
    this.setData({ showSpecModal: false });
  },

  /**
   * 閫夋嫨瑙勬牸
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  selectSpec(e) {
    const { specName, optionId } = e.currentTarget.dataset;
    this.setData({
      [`selectedSpecs.${specName}`]: optionId
    });
  },

  /**
   * 澧炲姞鏁伴噺
   * @returns {void}
   */
  increaseQuantity() {
    const { quantity, product } = this.data;
    if (quantity < product.stock) {
      this.setData({ quantity: quantity + 1 });
    }
  },

  /**
   * 鍑忓皯鏁伴噺
   * @returns {void}
   */
  decreaseQuantity() {
    const { quantity } = this.data;
    if (quantity > 1) {
      this.setData({ quantity: quantity - 1 });
    }
  },

  /**
   * 娣诲姞鍒拌喘鐗╄溅
   * @returns {void}
   */
  addToCart() {
    // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI娣诲姞鍒拌喘鐗╄溅
    wx.showToast({
      title: i18n.translate('宸叉坊鍔犲埌璐墿杞?),
      icon: 'success'
    });
    this.hideSpecModal();
  },

  /**
   * 绔嬪嵆购买
   * @returns {void}
   */
  buyNow() {
    // 瀹為檯椤圭洰涓簲璇ヨ烦杞埌订单纭椤甸潰
    this.hideSpecModal();
    wx.navigateTo({
      url: `/pages/order/confirm?productId=${this.data.productId}&quantity=${this.data.quantity}`
    });
  },

  /**
   * 鏀惰棌鍟嗗搧
   * @returns {void}
   */
  toggleFavorite() {
    // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI鏀惰棌/鍙栨秷鏀惰棌
    const { product } = this.data;
    const isFavorited = product.isFavorited;
    
    wx.showToast({
      title: isFavorited ? i18n.translate('宸插彇娑堟敹钘?) : i18n.translate('宸叉敹钘?),
      icon: 'success'
    });
    
    this.setData({
      'product.isFavorited': !isFavorited
    });
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
