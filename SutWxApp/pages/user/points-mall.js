锘?/ 缁夘垰鍨庨崯鍡楃厔妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    tabs: [
      { key: 'all', name: '閸忋劑鍎? },
      { key: 'coupon', name: '娴兼ɑ鍎崚? },
      { key: 'gift', name: '缁€鐓庢惂' }
    ],
    activeTab: 'all',
    products: [],
    loading: true,
    error: null,
    page: 1,
    pageSize: 20,
    hasMore: true,
    refreshing: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'points_mall'
    });
    
    // 閸旂姾娴囩粔顖氬瀻閸熷棗鎼ч弫鐗堝祦
    this.loadProducts();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 婵″倹鐏夐弰顖欑矤閸忔垶宕叉い鐢告桨鏉╂柨娲栭敍灞藉煕閺傜増鏆熼幑?    if (this.data.needRefresh) {
      this.setData({ needRefresh: false, page: 1, hasMore: true });
      this.loadProducts(true);
    }
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻閸熷棗鎼ч弫鐗堝祦
   */
  async loadProducts(refresh = false) {
    try {
      if (refresh) {
        this.setData({ products: [], page: 1, hasMore: true, refreshing: true });
      } else if (!this.data.refreshing) {
        this.setData({ loading: true, error: null });
      }

      // 鐠嬪啰鏁ょ粔顖氬瀻閺堝秴濮熼懢宄板絿閸熷棗鎼ч崚妤勩€?      const result = await app.services.points.getPointsMallProducts({
        page: this.data.page,
        pageSize: this.data.pageSize,
        type: this.data.activeTab !== 'all' ? this.data.activeTab : ''
      });
      
      const newProducts = result.list || [];
      const updatedProducts = refresh ? newProducts : [...this.data.products, ...newProducts];
      
      this.setData({
        products: updatedProducts,
        hasMore: newProducts.length >= this.data.pageSize,
        error: null
      });
    } catch (err) {
      console.error('閸旂姾娴囩粔顖氬瀻閸熷棗鎼ф径杈Е:', err);
      let errorMsg = '閼惧嘲褰囩粔顖氬瀻閸熷棗鎼ф径杈Е';
      if (err.message) {
        errorMsg = err.message;
      }
      
      this.setData({ error: errorMsg });
      showToast({ title: errorMsg, icon: 'none' });
    } finally {
      this.setData({ loading: false, refreshing: false });
    }
  },

  /**
   * 閸掑洦宕查弽鍥╊劮妞?   */
  onTabChange: function(e) {
    const key = e.currentTarget.dataset.key;
    if (key !== this.data.activeTab) {
      this.setData({ activeTab: key, page: 1, hasMore: true });
      this.loadProducts(true);
    }
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋閸熷棗鎼?   */
  onLoadMore: function() {
    if (this.data.hasMore && !this.data.loading && !this.data.refreshing) {
      this.setData({ page: this.data.page + 1 });
      this.loadProducts();
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    this.loadProducts(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points-mall-detail?id=${productId}`
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadProducts(true);
  }
});
\n