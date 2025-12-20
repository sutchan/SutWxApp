/**
 * 鏂囦欢鍚?detail.js
 * 鐗堟湰鍙?1.0.1
 * 鏇存柊鏃ユ湡: 2025-12-04
 * 浣滆€? Sut
 * 鎻忚堪: 鍟嗗搧璇︽儏椤甸潰锛屽睍绀哄晢鍝佷俊鎭€佽瘎浠峰拰鐩稿叧鍟嗗搧
 */
const i18n = require('../../../utils/i18n');
const socialService = require('../../../services/socialService');
const productService = require('../../../services/productService');

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
    reviewsPage: 1,
    reviewsPageSize: 10,
    hasMoreReviews: true,
    showReviewForm: false,
    reviewContent: '',
    reviewRating: 5,
    reviewImages: []
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
    // 娓呯悊瀹氭椂鍣?    if (this.loadTimer) {
      clearTimeout(this.loadTimer);
    }
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   * @returns {void}
   */
  onPullDownRefresh() {
    this.setData({ reviewsPage: 1, hasMoreReviews: true });
    this.loadProductDetail(this.data.productId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   * @returns {void}
   */
  onReachBottom() {
    if (this.data.hasMoreReviews && !this.data.loading) {
      this.setData({ reviewsPage: this.data.reviewsPage + 1 });
      this.loadProductReviews(this.data.productId, true);
    }
  },

  /**
   * 鍒嗕韩褰撳墠椤甸潰
   * @returns {Object} 鍒嗕韩閰嶇疆
   */
  onShareAppMessage() {
    const { product, productId } = this.data;
    const title = product ? product.name : i18n.translate('鍟嗗搧璇︽儏');
    const path = `/pages/product/detail/detail?id=${productId}`;
    
    // 鍒嗕韩鎴愬姛鏃跺鐞?    return {
      title,
      path,
      success: (res) => {
        // 澶勭悊鍒嗕韩鎴愬姛閫昏緫
        if (res.errMsg === 'shareAppMessage:ok') {
          // 澶勭悊鍒嗕韩鎴愬姛鍚庣殑涓氬姟閫昏緫
          const shareChannel = res.channel || 'wechat';
          
          // 璋冪敤鍒嗕韩鏈嶅姟
          socialService.shareProduct({
            productId,
            title,
            description: product ? product.description : '',
            imageUrl: product && product.images && product.images.length > 0 ? product.images[0] : '',
            shareChannel
          }).then(() => {
            console.log('鍟嗗搧鍒嗕韩璁板綍鎴愬姛');
          }).catch((err) => {
            console.error('鍟嗗搧鍒嗕韩璁板綍澶辫触:', err);
          });
        }
      },
      fail: (err) => {
        console.error('鍒嗕韩澶辫触:', err);
      }
    };
  },

  /**
   * 鍔犺浇鍟嗗搧璇︽儏
   * @param {string} id - 鍟嗗搧ID
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  async loadProductDetail(id, done) {
    try {
      this.setData({ loading: true });
      
      // 璋冪敤浜у搧鏈嶅姟鑾峰彇鍟嗗搧璇︽儏
      const product = await productService.getProductDetail(id);
      
      // 鍒濆鍖栭€変腑瑙勬牸
      const selectedSpecs = {};
      if (product.specs) {
        product.specs.forEach(spec => {
          if (spec.options && spec.options.length > 0) {
            selectedSpecs[spec.name] = spec.options[0].id;
          }
        });
      }

      this.setData({
        product,
        selectedSpecs,
        loading: false
      });
      
      if (typeof done === 'function') done();
    } catch (error) {
      console.error('鍔犺浇鍟嗗搧璇︽儏澶辫触:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '鍔犺浇澶辫触',
        icon: 'none'
      });
      if (typeof done === 'function') done();
    }
  },

  /**
   * 鍔犺浇鍟嗗搧璇勪环
   * @param {string} id - 鍟嗗搧ID
   * @param {boolean} isLoadMore - 鏄惁鍔犺浇鏇村
   * @returns {void}
   */
  async loadProductReviews(id, isLoadMore = false) {
    try {
      console.log('鍔犺浇鍟嗗搧璇勪环锛屽晢鍝両D:', id);
      
      // 璋冪敤绀句氦鏈嶅姟鑾峰彇鍟嗗搧璇勮
      const reviewsResponse = await socialService.getProductComments({
        productId: id,
        page: this.data.reviewsPage,
        pageSize: this.data.reviewsPageSize,
        sort: 'newest'
      });
      
      let reviews = [];
      if (isLoadMore) {
        reviews = [...this.data.reviews, ...reviewsResponse.data];
      } else {
        reviews = reviewsResponse.data;
      }

      this.setData({ 
        reviews,
        hasMoreReviews: reviews.length < reviewsResponse.total
      });
    } catch (error) {
      console.error('鍔犺浇鍟嗗搧璇勪环澶辫触:', error);
      wx.showToast({
        title: '鍔犺浇璇勪环澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 鍔犺浇鐩稿叧鍟嗗搧
   * @param {string} id - 鍟嗗搧ID
   * @returns {void}
   */
  async loadRelatedProducts(id) {
    try {
      console.log('鍔犺浇鐩稿叧鍟嗗搧锛屽晢鍝両D:', id);
      
      // 璋冪敤浜у搧鏈嶅姟鑾峰彇鐩稿叧鍟嗗搧
      const relatedProducts = await productService.getRecommendProducts(5);

      this.setData({ 
        relatedProducts: relatedProducts.data || []
      });
    } catch (error) {
      console.error('鍔犺浇鐩稿叧鍟嗗搧澶辫触:', error);
    }
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
    // 璋冪敤璐墿杞︽湇鍔℃坊鍔犲晢鍝佸埌璐墿杞?    wx.showToast({
      title: '宸插姞鍏ヨ喘鐗╄溅',
      icon: 'success'
    });
    this.hideSpecModal();
  },

  /**
   * 绔嬪嵆璐拱
   * @returns {void}
   */
  buyNow() {
    // 璺宠浆鍒拌鍗曠‘璁ら〉
    this.hideSpecModal();
    wx.navigateTo({
      url: `/pages/order/confirm/confirm?productId=${this.data.productId}&quantity=${this.data.quantity}`
    });
  },

  /**
   * 鍒囨崲鏀惰棌鐘舵€?   * @returns {void}
   */
  async toggleFavorite() {
    try {
      // 璋冪敤鏀惰棌鏈嶅姟鍒囨崲鏀惰棌鐘舵€?      const { product } = this.data;
      const isFavorited = product.isFavorited;
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬敹钘?鍙栨秷鏀惰棌API
      // await favoriteService.toggleFavorite(this.data.productId);
      
      wx.showToast({
        title: isFavorited ? '宸插彇娑堟敹钘? : '宸叉敹钘?,
        icon: 'success'
      });
      
      this.setData({
        'product.isFavorited': !isFavorited
      });
    } catch (error) {
      console.error('鍒囨崲鏀惰棌鐘舵€佸け璐?', error);
      wx.showToast({
        title: '鎿嶄綔澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 鏄剧ず璇勪环琛ㄥ崟
   * @returns {void}
   */
  showReviewForm() {
    this.setData({ showReviewForm: true });
  },

  /**
   * 闅愯棌璇勪环琛ㄥ崟
   * @returns {void}
   */
  hideReviewForm() {
    this.setData({ 
      showReviewForm: false,
      reviewContent: '',
      reviewRating: 5,
      reviewImages: []
    });
  },

  /**
   * 杈撳叆璇勪环鍐呭
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  inputReviewContent(e) {
    this.setData({ reviewContent: e.detail.value });
  },

  /**
   * 閫夋嫨璇勪环鏄熺骇
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  selectRating(e) {
    this.setData({ reviewRating: e.currentTarget.dataset.rating });
  },

  /**
   * 涓婁紶璇勪环鍥剧墖
   * @returns {void}
   */
  uploadReviewImage() {
    const { reviewImages } = this.data;
    
    if (reviewImages.length >= 5) {
      wx.showToast({
        title: '鏈€澶氫笂浼?寮犲浘鐗?,
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: 5 - reviewImages.length,
      success: (res) => {
        // 杩欓噷搴旇涓婁紶鍥剧墖鍒版湇鍔″櫒锛岀劧鍚庝繚瀛樺浘鐗嘦RL
        // 鐜板湪鍙槸妯℃嫙锛岀洿鎺ヤ娇鐢ㄤ复鏃舵枃浠惰矾寰?        const newImages = [...reviewImages, ...res.tempFilePaths];
        this.setData({ reviewImages: newImages });
      }
    });
  },

  /**
   * 鍒犻櫎璇勪环鍥剧墖
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  deleteReviewImage(e) {
    const { index } = e.currentTarget.dataset;
    const reviewImages = this.data.reviewImages;
    reviewImages.splice(index, 1);
    this.setData({ reviewImages });
  },

  /**
   * 鎻愪氦璇勪环
   * @returns {void}
   */
  async submitReview() {
    try {
      const { productId, reviewContent, reviewRating, reviewImages } = this.data;
      
      if (!reviewContent.trim()) {
        wx.showToast({
          title: '璇勪环鍐呭涓嶈兘涓虹┖',
          icon: 'none'
        });
        return;
      }
      
      this.setData({ loading: true });
      
      // 璋冪敤绀句氦鏈嶅姟鎻愪氦璇勮
      await socialService.addProductComment({
        productId,
        content: reviewContent.trim(),
        rating: reviewRating,
        images: reviewImages,
        anonymous: false
      });
      
      wx.showToast({
        title: '璇勪环鎴愬姛',
        icon: 'success'
      });
      
      // 闅愯棌璇勪环琛ㄥ崟锛屽埛鏂拌瘎浠峰垪琛?      this.hideReviewForm();
      this.setData({ reviewsPage: 1 });
      this.loadProductReviews(productId);
    } catch (error) {
      console.error('鎻愪氦璇勪环澶辫触:', error);
      wx.showToast({
        title: '璇勪环澶辫触',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 鐐硅禐璇勮
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  async likeComment(e) {
    try {
      const { commentId } = e.currentTarget.dataset;
      await socialService.likeComment(commentId);
      
      // 鏇存柊璇勮鐐硅禐鐘舵€?      const reviews = this.data.reviews.map(review => {
        if (review.id === commentId) {
          return {
            ...review,
            isLiked: true,
            likeCount: (review.likeCount || 0) + 1
          };
        }
        return review;
      });
      
      this.setData({ reviews });
    } catch (error) {
      console.error('鐐硅禐澶辫触:', error);
      wx.showToast({
        title: '鐐硅禐澶辫触',
        icon: 'none'
      });
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
