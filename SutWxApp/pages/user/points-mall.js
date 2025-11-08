// 绉垎鍟嗗煄椤甸潰閫昏緫
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    tabs: [
      { key: 'all', name: '鍏ㄩ儴' },
      { key: 'coupon', name: '浼樻儬鍒? },
      { key: 'gift', name: '绀煎搧' }
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'points_mall'
    });
    
    // 鍔犺浇绉垎鍟嗗搧鏁版嵁
    this.loadProducts();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 濡傛灉鏄粠鍏戞崲椤甸潰杩斿洖锛屽埛鏂版暟鎹?    if (this.data.needRefresh) {
      this.setData({ needRefresh: false, page: 1, hasMore: true });
      this.loadProducts(true);
    }
  },

  /**
   * 鍔犺浇绉垎鍟嗗搧鏁版嵁
   */
  async loadProducts(refresh = false) {
    try {
      if (refresh) {
        this.setData({ products: [], page: 1, hasMore: true, refreshing: true });
      } else if (!this.data.refreshing) {
        this.setData({ loading: true, error: null });
      }

      // 璋冪敤绉垎鏈嶅姟鑾峰彇鍟嗗搧鍒楄〃
      const result = await app.services.points.getPointsMallProducts({
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
      console.error('鍔犺浇绉垎鍟嗗搧澶辫触:', err);
      let errorMsg = '鑾峰彇绉垎鍟嗗搧澶辫触';
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
   * 鍒囨崲鏍囩椤?   */
  onTabChange: function(e) {
    const key = e.currentTarget.dataset.key;
    if (key !== this.data.activeTab) {
      this.setData({ activeTab: key, page: 1, hasMore: true });
      this.loadProducts(true);
    }
  },

  /**
   * 鍔犺浇鏇村鍟嗗搧
   */
  onLoadMore: function() {
    if (this.data.hasMore && !this.data.loading && !this.data.refreshing) {
      this.setData({ page: this.data.page + 1 });
      this.loadProducts();
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    this.loadProducts(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯呴〉
   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points-mall-detail?id=${productId}`
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadProducts(true);
  }
});
