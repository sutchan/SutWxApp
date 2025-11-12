锘?/ 閸熷棗鎼ч崚妤勩€冩い鐢告桨闁槒绶?import { showToast } from '../../../utils/global';

Page({
  data: {
    productList: [], // 閸熷棗鎼ч崚妤勩€冮弫鐗堝祦
    loading: true, // 閸旂姾娴囬悩鑸碘偓?    error: false, // 闁挎瑨顕ら悩鑸碘偓?    errorMsg: '', // 闁挎瑨顕ゆ穱鈩冧紖
    page: 1, // 瑜版挸澧犳い鐢电垳
    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    categoryId: '', // 閸掑棛琚獻D
    keyword: '', // 閹兼粎鍌ㄩ崗鎶芥暛鐠?    sort: 'default', // 閹烘帒绨弬鐟扮础
    filters: {} // 缁涙盯鈧娼禒?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    const app = getApp();
    
    // 娴犲酣銆夐棃銏犲棘閺佹媽骞忛崣鏍у瀻缁睂D閸滃苯鍙ч柨顔跨槤
    if (options.categoryId) {
      this.setData({
        categoryId: options.categoryId
      });
    }
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      });
    }
    
    this.loadProductList();
    
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.services.analytics.trackPageView('product_list', {
      category_id: options.categoryId || 'all',
      keyword: options.keyword || ''
    });
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
    this.setData({
      page: 1,
      hasMore: true,
      productList: []
    });
    this.loadProductList();
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProductList();
    }
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂閸掓銆冮弫鐗堝祦
   */
  loadProductList: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 閺嬪嫬缂撶拠閿嬬湴閸欏倹鏆?      const params = {
        page: this.data.page,
        category_id: this.data.categoryId,
        keyword: this.data.keyword,
        sort: this.data.sort,
        ...this.data.filters
      };

      // 娴ｈ法鏁roductService閼惧嘲褰囬崯鍡楁惂閸掓銆?      const result = await app.services.product.getProductList(params);
      
      this.setData({
        productList: result.products,
        hasMore: result.has_more,
        loading: false
      });
    } catch (error) {
      console.error('閼惧嘲褰囬崯鍡楁惂閸掓銆冩径杈Е:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸'
      });
      showToast('閼惧嘲褰囬崯鍡楁惂閸掓銆冩径杈Е', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋閸熷棗鎼?   */
  loadMoreProductList: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      page: this.data.page + 1
    });

    try {
      // 閺嬪嫬缂撶拠閿嬬湴閸欏倹鏆?      const params = {
        page: this.data.page,
        category_id: this.data.categoryId,
        keyword: this.data.keyword,
        sort: this.data.sort,
        ...this.data.filters
      };

      // 娴ｈ法鏁roductService閼惧嘲褰囬弴鏉戭樋閸熷棗鎼?      const result = await app.services.product.getProductList(params);
      
      this.setData({
        productList: this.data.productList.concat(result.products),
        hasMore: result.has_more,
        loading: false
      });
    } catch (error) {
      console.error('閸旂姾娴囬弴鏉戭樋閸熷棗鎼ф径杈Е:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '閸旂姾娴囬弴鏉戭樋婢惰精瑙﹂敍宀冾嚞闁插秷鐦?
      });
      showToast('閸旂姾娴囬弴鏉戭樋婢惰精瑙?, 'none');
    }
  },

  /**
   * 閻愮懓鍤崯鍡楁惂鏉╂稑鍙嗙拠锔藉剰妞?   */
  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 鐠佹澘缍嶉悙鐟板毊娴滃娆?    app.services.analytics.trackEvent('product_click', {
      product_id: productId
    });
    
    wx.navigateTo({
      url: '/pages/product/detail/detail?id=' + productId
    });
  },

  /**
   * 閹兼粎鍌ㄩ崯鍡楁惂
   */
  onSearch: function(e) {
    const app = getApp();
    const keyword = e.detail.value || '';
    
    // 鐠佹澘缍嶉幖婊呭偍娴滃娆?    app.services.analytics.trackEvent('product_search', {
      keyword: keyword
    });
    
    this.setData({
      keyword: keyword,
      page: 1,
      productList: [],
      hasMore: true
    });
    this.loadProductList();
  },

  /**
   * 閸掑洦宕查幒鎺戠碍閺傜懓绱?   */
  onChangeSort: function(e) {
    const app = getApp();
    const sort = e.currentTarget.dataset.sort;
    
    // 鐠佹澘缍嶉幒鎺戠碍娴滃娆?    app.services.analytics.trackEvent('product_sort_change', {
      sort: sort
    });
    
    this.setData({
      sort: sort,
      page: 1,
      productList: [],
      hasMore: true
    });
    this.loadProductList();
  },

  /**
   * 閹垫挸绱戠粵娑⑩偓澶愭桨閺?   */
  openFilterPanel: function() {
    const app = getApp();
    
    // 缁涙盯鈧娼伴弶鍧椻偓鏄忕帆
    wx.showActionSheet({
      itemList: ['娴犻攱鐗告禒搴濈秵閸掍即鐝?, '娴犻攱鐗告禒搴ㄧ彯閸掗缍?, '闁库偓闁插繋绱崗?, '閺堚偓閺傞绗傞弸?],
      success: (res) => {
        const sortOptions = ['price_asc', 'price_desc', 'sales', 'newest'];
        const selectedSort = sortOptions[res.tapIndex];
        
        // 鐠佹澘缍嶇粵娑⑩偓澶夌皑娴?        app.services.analytics.trackEvent('product_filter_change', {
          sort: selectedSort
        });
        
        this.setData({
          sort: selectedSort,
          page: 1,
          productList: [],
          hasMore: true
        });
        this.loadProductList();
      }
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadProductList();
  }
});\n