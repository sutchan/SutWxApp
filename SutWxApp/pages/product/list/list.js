// 鍟嗗搧鍒楄〃椤甸潰閫昏緫
import { showToast } from '../../../utils/global';

Page({
  data: {
    productList: [], // 鍟嗗搧鍒楄〃鏁版嵁
    loading: true, // 鍔犺浇鐘舵€?    error: false, // 閿欒鐘舵€?    errorMsg: '', // 閿欒淇℃伅
    page: 1, // 褰撳墠椤电爜
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    categoryId: '', // 鍒嗙被ID
    keyword: '', // 鎼滅储鍏抽敭璇?    sort: 'default', // 鎺掑簭鏂瑰紡
    filters: {} // 绛涢€夋潯浠?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 浠庨〉闈㈠弬鏁拌幏鍙栧垎绫籌D鍜屽叧閿瘝
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
    
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.services.analytics.trackPageView('product_list', {
      category_id: options.categoryId || 'all',
      keyword: options.keyword || ''
    });
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
    this.setData({
      page: 1,
      hasMore: true,
      productList: []
    });
    this.loadProductList();
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProductList();
    }
  },

  /**
   * 鍔犺浇鍟嗗搧鍒楄〃鏁版嵁
   */
  loadProductList: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 鏋勫缓璇锋眰鍙傛暟
      const params = {
        page: this.data.page,
        category_id: this.data.categoryId,
        keyword: this.data.keyword,
        sort: this.data.sort,
        ...this.data.filters
      };

      // 浣跨敤productService鑾峰彇鍟嗗搧鍒楄〃
      const result = await app.services.product.getProductList(params);
      
      this.setData({
        productList: result.products,
        hasMore: result.has_more,
        loading: false
      });
    } catch (error) {
      console.error('鑾峰彇鍟嗗搧鍒楄〃澶辫触:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '鍔犺浇澶辫触锛岃閲嶈瘯'
      });
      showToast('鑾峰彇鍟嗗搧鍒楄〃澶辫触', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 鍔犺浇鏇村鍟嗗搧
   */
  loadMoreProductList: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      page: this.data.page + 1
    });

    try {
      // 鏋勫缓璇锋眰鍙傛暟
      const params = {
        page: this.data.page,
        category_id: this.data.categoryId,
        keyword: this.data.keyword,
        sort: this.data.sort,
        ...this.data.filters
      };

      // 浣跨敤productService鑾峰彇鏇村鍟嗗搧
      const result = await app.services.product.getProductList(params);
      
      this.setData({
        productList: this.data.productList.concat(result.products),
        hasMore: result.has_more,
        loading: false
      });
    } catch (error) {
      console.error('鍔犺浇鏇村鍟嗗搧澶辫触:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '鍔犺浇鏇村澶辫触锛岃閲嶈瘯'
      });
      showToast('鍔犺浇鏇村澶辫触', 'none');
    }
  },

  /**
   * 鐐瑰嚮鍟嗗搧杩涘叆璇︽儏椤?   */
  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 璁板綍鐐瑰嚮浜嬩欢
    app.services.analytics.trackEvent('product_click', {
      product_id: productId
    });
    
    wx.navigateTo({
      url: '/pages/product/detail/detail?id=' + productId
    });
  },

  /**
   * 鎼滅储鍟嗗搧
   */
  onSearch: function(e) {
    const app = getApp();
    const keyword = e.detail.value || '';
    
    // 璁板綍鎼滅储浜嬩欢
    app.services.analytics.trackEvent('product_search', {
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
   * 鍒囨崲鎺掑簭鏂瑰紡
   */
  onChangeSort: function(e) {
    const app = getApp();
    const sort = e.currentTarget.dataset.sort;
    
    // 璁板綍鎺掑簭浜嬩欢
    app.services.analytics.trackEvent('product_sort_change', {
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
   * 鎵撳紑绛涢€夐潰鏉?   */
  openFilterPanel: function() {
    const app = getApp();
    
    // 绛涢€夐潰鏉块€昏緫
    wx.showActionSheet({
      itemList: ['浠锋牸浠庝綆鍒伴珮', '浠锋牸浠庨珮鍒颁綆', '閿€閲忎紭鍏?, '鏈€鏂颁笂鏋?],
      success: (res) => {
        const sortOptions = ['price_asc', 'price_desc', 'sales', 'newest'];
        const selectedSort = sortOptions[res.tapIndex];
        
        // 璁板綍绛涢€変簨浠?        app.services.analytics.trackEvent('product_filter_change', {
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
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadProductList();
  }
});