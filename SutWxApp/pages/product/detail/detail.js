锘?/ 閸熷棗鎼х拠锔藉剰妞ょ敻娼伴柅鏄忕帆
import { showToast } from '../../../utils/global';

Page({
  data: {
    product: null, // 閸熷棗鎼х拠锔藉剰閺佺増宓?    loading: true, // 閸旂姾娴囬悩鑸碘偓?    error: false, // 闁挎瑨顕ら悩鑸碘偓?    errorMsg: '', // 闁挎瑨顕ゆ穱鈩冧紖
    selectedSku: {}, // 闁鑵戦惃鍕櫌閸濅浇顫夐弽?    quantity: 1, // 鐠愵厺鎷遍弫浼村櫤
    images: [], // 閸熷棗鎼ч崶鍓у閸掓銆?    currentImageIndex: 0, // 瑜版挸澧犻弰鍓с仛閻ㄥ嫬娴橀悧鍥╁偍瀵?    isFavorite: false, // 閺勵垰鎯佸鍙夋暪閽?    relatedProducts: [] // 閻╃鍙ч崯鍡楁惂
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    const app = getApp();
    
    if (options.id) {
      this.productId = options.id;
      this.loadProductDetail();
      
      // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
      app.services.analytics.trackPageView('product_detail', {
        product_id: options.id
      });
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '閸熷棗鎼D娑撳秴鐡ㄩ崷?
      });
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 妞ょ敻娼伴弰鍓с仛閺冨墎娈戞径鍕倞
  },

  /**
   * 閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function() {
    this.loadProductDetail();
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂鐠囷附鍎忛弫鐗堝祦
   */
  loadProductDetail: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 娴ｈ法鏁roductService閼惧嘲褰囬崯鍡楁惂鐠囷附鍎?      const product = await app.services.product.getProductDetail(this.productId);
      
      this.setData({
        product: product,
        images: product.images || [],
        selectedSku: product.skus && product.skus.length > 0 ? product.skus[0] : {},
        loading: false
      });
      
      // 濡偓閺屻儱鏅㈤崫浣规Ц閸氾箑鍑￠弨鎯版
      this.checkFavoriteStatus();
      // 閸旂姾娴囬惄绋垮彠閸熷棗鎼?      this.loadRelatedProducts();
    } catch (error) {
      console.error('閼惧嘲褰囬崯鍡楁惂鐠囷附鍎忔径杈Е:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸'
      });
      showToast('閼惧嘲褰囬崯鍡楁惂鐠囷附鍎忔径杈Е', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 閸旂姾娴囬惄绋垮彠閸熷棗鎼?   */
  loadRelatedProducts: async function() {
    const app = getApp();
    
    try {
      // 娴ｈ法鏁roductService閼惧嘲褰囬惄绋垮彠閸熷棗鎼?      const result = await app.services.product.getRelatedProducts({
        product_id: this.productId,
        limit: 6
      });
      
      this.setData({
        relatedProducts: result.products || []
      });
    } catch (error) {
      console.error('閼惧嘲褰囬惄绋垮彠閸熷棗鎼ф径杈Е:', error);
    }
  },

  /**
   * 濡偓閺屻儱鏅㈤崫浣规暪閽樺繒濮搁幀?   */
  checkFavoriteStatus: async function() {
    const app = getApp();
    
    try {
      // 濡偓閺屻儳鏁ら幋閿嬫Ц閸氾妇娅ヨぐ?      if (app.isLoggedIn()) {
        // 娴ｈ法鏁avoriteService濡偓閺屻儲鏁归挊蹇曞Ц閹?        const result = await app.services.favorite.checkFavorite({
          product_id: this.productId
        });
        
        this.setData({
          isFavorite: result.is_favorite
        });
      }
    } catch (error) {
      console.error('濡偓閺屻儲鏁归挊蹇曞Ц閹礁銇戠拹?', error);
    }
  },

  /**
   * 閸掑洦宕查崶鍓у
   */
  onImageChange: function(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  /**
   * 閸掑洦宕查崯鍡楁惂鐟欏嫭鐗?   */
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
   * 婢х偛濮炵拹顓濇嫳閺佷即鍣?   */
  onIncreaseQuantity: function() {
    const maxQuantity = this.data.selectedSku.stock || this.data.product.stock || 99;
    if (this.data.quantity < maxQuantity) {
      this.setData({
        quantity: this.data.quantity + 1
      });
    } else {
      showToast('瀹歌尪鎻崚鐗堟付婢堆冪氨鐎?, 'none');
    }
  },

  /**
   * 閸戝繐鐨拹顓濇嫳閺佷即鍣?   */
  onDecreaseQuantity: function() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  /**
   * 濞ｈ濮為崚鎷屽枠閻椻晞婧?   */
  addToCart: async function() {
    const app = getApp();
    
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    try {
      // 娴ｈ法鏁artService濞ｈ濮為崚鎷屽枠閻椻晞婧?      await app.services.cart.addToCart({
        product_id: this.productId,
        sku_id: this.data.selectedSku.id || '',
        quantity: this.data.quantity
      });
      
      // 鐠佹澘缍嶅ǎ璇插鐠愵厾澧挎潪锔跨皑娴?      app.services.analytics.trackEvent('add_to_cart', {
        product_id: this.productId,
        quantity: this.data.quantity,
        sku_id: this.data.selectedSku.id || ''
      });
      
      showToast('濞ｈ濮為幋鎰', 'success');
    } catch (error) {
      console.error('濞ｈ濮為崚鎷屽枠閻椻晞婧呮径杈Е:', error);
      showToast(error.message || '濞ｈ濮炴径杈Е閿涘矁顕柌宥堢槸', 'none');
    }
  },

  /**
   * 缁斿宓嗙拹顓濇嫳
   */
  buyNow: function() {
    const app = getApp();
    
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 鐠佹澘缍嶇粩瀣祮鐠愵厺鎷辨禍瀣╂
    app.services.analytics.trackEvent('buy_now', {
      product_id: this.productId,
      quantity: this.data.quantity,
      sku_id: this.data.selectedSku.id || ''
    });
    
    // 閺嬪嫰鈧姾顓归崡鏇炲棘閺?    const orderItem = {
      product_id: this.productId,
      sku_id: this.data.selectedSku.id || '',
      quantity: this.data.quantity,
      product: this.data.product,
      selectedSku: this.data.selectedSku
    };
    
    // 娣囨繂鐡ㄩ崚鏉垮弿鐏炩偓閺佺増宓侀敍宀€鏁ゆ禍搴ゎ吂閸楁洜鈥樼拋銈夈€?    app.globalData.tempOrderItems = [orderItem];
    
    // 鐠哄疇娴嗛崚鎷岊吂閸楁洜鈥樼拋銈夈€?    wx.navigateTo({
      url: '/pages/order/confirm/confirm'
    });
  },

  /**
   * 閺€鎯版/閸欐牗绉烽弨鎯版閸熷棗鎼?   */
  onToggleFavorite: async function() {
    const app = getApp();
    
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    const isFavorite = this.data.isFavorite;
    const action = isFavorite ? 'remove' : 'add';
    
    try {
      // 娑旀劘顫囬弴瀛樻煀UI
      this.setData({
        isFavorite: !isFavorite
      });
      
      // 娴ｈ法鏁avoriteService閹垮秳缍旈弨鎯版
      if (isFavorite) {
        await app.services.favorite.removeFavorite({
          product_id: this.productId
        });
      } else {
        await app.services.favorite.addFavorite({
          product_id: this.productId
        });
      }
      
      // 鐠佹澘缍嶉弨鎯版娴滃娆?      app.services.analytics.trackEvent(action === 'add' ? 'favorite_add' : 'favorite_remove', {
        product_id: this.productId
      });
      
      showToast(isFavorite ? '閸欐牗绉烽弨鎯版閹存劕濮? : '閺€鎯版閹存劕濮?, 'success');
    } catch (error) {
      console.error('閹垮秳缍旈弨鎯版婢惰精瑙?', error);
      // 婢惰精瑙﹂弮璺烘礀濠婃瓗I
      this.setData({
        isFavorite: isFavorite
      });
      showToast(error.message || '閹垮秳缍旀径杈Е閿涘矁顕柌宥堢槸', 'none');
    }
  },

  /**
   * 閺屻儳婀呴惄绋垮彠閸熷棗鎼?   */
  onRelatedProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 鐠佹澘缍嶉悙鐟板毊閻╃鍙ч崯鍡楁惂娴滃娆?    app.services.analytics.trackEvent('related_product_click', {
      product_id: productId,
      from_product_id: this.productId
    });
    
    wx.navigateTo({
      url: '/pages/product/detail/detail?id=' + productId
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadProductDetail();
  },

  /**
   * 閸掑棔闊╅崝鐔诲厴
   */
  onShareAppMessage: function() {
    const app = getApp();
    
    // 鐠佹澘缍嶉崚鍡曢煩娴滃娆?    app.services.analytics.trackEvent('product_share', {
      product_id: this.productId
    });
    
    return {
      title: this.data.product ? this.data.product.title : '閸熷棗鎼х拠锔藉剰',
      path: '/pages/product/detail/detail?id=' + this.productId,
      imageUrl: this.data.images[0] || ''
    };
  }
});\n