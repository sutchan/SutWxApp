// 鍟嗗搧璇︽儏椤甸潰閫昏緫
import { showToast } from '../../../utils/global';

Page({
  data: {
    product: null, // 鍟嗗搧璇︽儏鏁版嵁
    loading: true, // 鍔犺浇鐘舵€?    error: false, // 閿欒鐘舵€?    errorMsg: '', // 閿欒淇℃伅
    selectedSku: {}, // 閫変腑鐨勫晢鍝佽鏍?    quantity: 1, // 璐拱鏁伴噺
    images: [], // 鍟嗗搧鍥剧墖鍒楄〃
    currentImageIndex: 0, // 褰撳墠鏄剧ず鐨勫浘鐗囩储寮?    isFavorite: false, // 鏄惁宸叉敹钘?    relatedProducts: [] // 鐩稿叧鍟嗗搧
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    const app = getApp();
    
    if (options.id) {
      this.productId = options.id;
      this.loadProductDetail();
      
      // 璁板綍椤甸潰璁块棶浜嬩欢
      app.services.analytics.trackPageView('product_detail', {
        product_id: options.id
      });
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '鍟嗗搧ID涓嶅瓨鍦?
      });
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 椤甸潰鏄剧ず鏃剁殑澶勭悊
  },

  /**
   * 鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function() {
    this.loadProductDetail();
  },

  /**
   * 鍔犺浇鍟嗗搧璇︽儏鏁版嵁
   */
  loadProductDetail: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 浣跨敤productService鑾峰彇鍟嗗搧璇︽儏
      const product = await app.services.product.getProductDetail(this.productId);
      
      this.setData({
        product: product,
        images: product.images || [],
        selectedSku: product.skus && product.skus.length > 0 ? product.skus[0] : {},
        loading: false
      });
      
      // 妫€鏌ュ晢鍝佹槸鍚﹀凡鏀惰棌
      this.checkFavoriteStatus();
      // 鍔犺浇鐩稿叧鍟嗗搧
      this.loadRelatedProducts();
    } catch (error) {
      console.error('鑾峰彇鍟嗗搧璇︽儏澶辫触:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '鍔犺浇澶辫触锛岃閲嶈瘯'
      });
      showToast('鑾峰彇鍟嗗搧璇︽儏澶辫触', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 鍔犺浇鐩稿叧鍟嗗搧
   */
  loadRelatedProducts: async function() {
    const app = getApp();
    
    try {
      // 浣跨敤productService鑾峰彇鐩稿叧鍟嗗搧
      const result = await app.services.product.getRelatedProducts({
        product_id: this.productId,
        limit: 6
      });
      
      this.setData({
        relatedProducts: result.products || []
      });
    } catch (error) {
      console.error('鑾峰彇鐩稿叧鍟嗗搧澶辫触:', error);
    }
  },

  /**
   * 妫€鏌ュ晢鍝佹敹钘忕姸鎬?   */
  checkFavoriteStatus: async function() {
    const app = getApp();
    
    try {
      // 妫€鏌ョ敤鎴锋槸鍚︾櫥褰?      if (app.isLoggedIn()) {
        // 浣跨敤favoriteService妫€鏌ユ敹钘忕姸鎬?        const result = await app.services.favorite.checkFavorite({
          product_id: this.productId
        });
        
        this.setData({
          isFavorite: result.is_favorite
        });
      }
    } catch (error) {
      console.error('妫€鏌ユ敹钘忕姸鎬佸け璐?', error);
    }
  },

  /**
   * 鍒囨崲鍥剧墖
   */
  onImageChange: function(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  /**
   * 鍒囨崲鍟嗗搧瑙勬牸
   */
  onSkuSelect: function(e) {
    const skuId = e.currentTarget.dataset.id;
    const sku = this.data.product.skus.find(s => s.id === skuId);
    if (sku) {
      this.setData({
        selectedSku: sku
      });
    }
  },

  /**
   * 澧炲姞璐拱鏁伴噺
   */
  onIncreaseQuantity: function() {
    const maxQuantity = this.data.selectedSku.stock || this.data.product.stock || 99;
    if (this.data.quantity < maxQuantity) {
      this.setData({
        quantity: this.data.quantity + 1
      });
    } else {
      showToast('宸茶揪鍒版渶澶у簱瀛?, 'none');
    }
  },

  /**
   * 鍑忓皯璐拱鏁伴噺
   */
  onDecreaseQuantity: function() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  /**
   * 娣诲姞鍒拌喘鐗╄溅
   */
  addToCart: async function() {
    const app = getApp();
    
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      showToast('璇峰厛鐧诲綍', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    try {
      // 浣跨敤cartService娣诲姞鍒拌喘鐗╄溅
      await app.services.cart.addToCart({
        product_id: this.productId,
        sku_id: this.data.selectedSku.id || '',
        quantity: this.data.quantity
      });
      
      // 璁板綍娣诲姞璐墿杞︿簨浠?      app.services.analytics.trackEvent('add_to_cart', {
        product_id: this.productId,
        quantity: this.data.quantity,
        sku_id: this.data.selectedSku.id || ''
      });
      
      showToast('娣诲姞鎴愬姛', 'success');
    } catch (error) {
      console.error('娣诲姞鍒拌喘鐗╄溅澶辫触:', error);
      showToast(error.message || '娣诲姞澶辫触锛岃閲嶈瘯', 'none');
    }
  },

  /**
   * 绔嬪嵆璐拱
   */
  buyNow: function() {
    const app = getApp();
    
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      showToast('璇峰厛鐧诲綍', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 璁板綍绔嬪嵆璐拱浜嬩欢
    app.services.analytics.trackEvent('buy_now', {
      product_id: this.productId,
      quantity: this.data.quantity,
      sku_id: this.data.selectedSku.id || ''
    });
    
    // 鏋勯€犺鍗曞弬鏁?    const orderItem = {
      product_id: this.productId,
      sku_id: this.data.selectedSku.id || '',
      quantity: this.data.quantity,
      product: this.data.product,
      selectedSku: this.data.selectedSku
    };
    
    // 淇濆瓨鍒板叏灞€鏁版嵁锛岀敤浜庤鍗曠‘璁ら〉
    app.globalData.tempOrderItems = [orderItem];
    
    // 璺宠浆鍒拌鍗曠‘璁ら〉
    wx.navigateTo({
      url: '/pages/order/confirm/confirm'
    });
  },

  /**
   * 鏀惰棌/鍙栨秷鏀惰棌鍟嗗搧
   */
  onToggleFavorite: async function() {
    const app = getApp();
    
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      showToast('璇峰厛鐧诲綍', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    const isFavorite = this.data.isFavorite;
    const action = isFavorite ? 'remove' : 'add';
    
    try {
      // 涔愯鏇存柊UI
      this.setData({
        isFavorite: !isFavorite
      });
      
      // 浣跨敤favoriteService鎿嶄綔鏀惰棌
      if (isFavorite) {
        await app.services.favorite.removeFavorite({
          product_id: this.productId
        });
      } else {
        await app.services.favorite.addFavorite({
          product_id: this.productId
        });
      }
      
      // 璁板綍鏀惰棌浜嬩欢
      app.services.analytics.trackEvent(action === 'add' ? 'favorite_add' : 'favorite_remove', {
        product_id: this.productId
      });
      
      showToast(isFavorite ? '鍙栨秷鏀惰棌鎴愬姛' : '鏀惰棌鎴愬姛', 'success');
    } catch (error) {
      console.error('鎿嶄綔鏀惰棌澶辫触:', error);
      // 澶辫触鏃跺洖婊歎I
      this.setData({
        isFavorite: isFavorite
      });
      showToast(error.message || '鎿嶄綔澶辫触锛岃閲嶈瘯', 'none');
    }
  },

  /**
   * 鏌ョ湅鐩稿叧鍟嗗搧
   */
  onRelatedProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 璁板綍鐐瑰嚮鐩稿叧鍟嗗搧浜嬩欢
    app.services.analytics.trackEvent('related_product_click', {
      product_id: productId,
      from_product_id: this.productId
    });
    
    wx.navigateTo({
      url: '/pages/product/detail/detail?id=' + productId
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadProductDetail();
  },

  /**
   * 鍒嗕韩鍔熻兘
   */
  onShareAppMessage: function() {
    const app = getApp();
    
    // 璁板綍鍒嗕韩浜嬩欢
    app.services.analytics.trackEvent('product_share', {
      product_id: this.productId
    });
    
    return {
      title: this.data.product ? this.data.product.title : '鍟嗗搧璇︽儏',
      path: '/pages/product/detail/detail?id=' + this.productId,
      imageUrl: this.data.images[0] || ''
    };
  }
});