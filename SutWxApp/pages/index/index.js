// pages/index/index.js
/**
 * 棣栭〉椤甸潰 - 鐢靛晢搴旂敤棣栭〉锛屽睍绀鸿疆鎾浘銆佸晢鍝佸垎绫汇€佹帹鑽愬晢鍝佺瓑
 */
import { showToast } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    bannerList: [], // 杞挱鍥炬暟鎹?    categories: [], // 鍟嗗搧鍒嗙被鏁版嵁
    recommendedProducts: [], // 鎺ㄨ崘鍟嗗搧鍒楄〃
    hotProducts: [], // 鐑棬鍟嗗搧鍒楄〃
    newProducts: [], // 鏂板搧涓婂競鍒楄〃
    currentPage: 1, // 褰撳墠椤电爜
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    loading: false, // 鍔犺浇鐘舵€?    loadingMore: false, // 鍔犺浇鏇村鐘舵€?    refreshing: false, // 涓嬫媺鍒锋柊鐘舵€?    error: '', // 閿欒淇℃伅
    showSkeleton: true // 鏄惁鏄剧ず楠ㄦ灦灞?  },

  /**
   * 閲嶈瘯鍔犺浇鏁版嵁
   */
  onRetry: function() {
    this.setData({
      error: '',
      currentPage: 1,
      hasMore: true,
      recommendedProducts: []
    });
    this.loadAllData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function() {
    // 鍒濆鍖栭〉闈㈡暟鎹?    this.loadAllData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 椤甸潰鏄剧ず鏃讹紝濡傛灉闇€瑕佸埛鏂版暟鎹紝鍙互鍦ㄨ繖閲屾坊鍔犻€昏緫
    // 渚嬪妫€鏌ュ叏灞€鐘舵€佸彉鍖栵紝鎴栬€呭畾鏃跺埛鏂扮瓑
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function() {
    // 涓嬫媺鍒锋柊鏃堕噸缃暟鎹苟閲嶆柊鍔犺浇
    this.setData({
      refreshing: true,
      currentPage: 1,
      hasMore: true,
      recommendedProducts: [],
      showSkeleton: true,
      error: ''
    });
    
    this.loadAllData();
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function() {
    // 涓婃媺瑙﹀簳鍔犺浇鏇村鎺ㄨ崘鍟嗗搧
    if (!this.data.loading && !this.data.loadingMore && this.data.hasMore) {
      this.loadMoreProducts();
    }
  },

  /**
   * 鍔犺浇鎵€鏈夐〉闈㈡暟鎹?   * 鏍规嵁API鏂囨。锛屼娇鐢ㄧ粺涓€鎺ュ彛鑾峰彇棣栭〉鎵€闇€鏁版嵁
   */
  loadAllData: function() {
    // 浣跨敤棣栭〉缁熶竴鎺ュ彛鑾峰彇鏁版嵁锛屾彁楂樻€ц兘
    this.getHomeData();
  },

  /**
   * 鑾峰彇棣栭〉鏁版嵁锛堝寘鍚玝anner銆佸晢鍝佸垎绫汇€佹帹鑽愬晢鍝佺瓑锛?   */
  getHomeData: async function() {
    const app = getApp();
    if (!this.data.refreshing) {
      this.setData({ loading: true });
    }
    
    try {
      // 浣跨敤productService鑾峰彇棣栭〉鏁版嵁
      const res = await app.services.product.getHomeData();
      
      // 澶勭悊棣栭〉鏁版嵁
      this.setData({
        bannerList: res.banner || [],
        categories: res.categories || [],
        hotProducts: res.hot_products || [],
        newProducts: res.new_products || [],
        recommendedProducts: res.recommended_products || [],
        currentPage: 2,
        hasMore: res.pages ? res.pages > 1 : (res.recommended_products && res.recommended_products.length >= 10),
        error: ''
      });
      
      // 璁板綍椤甸潰娴忚浜嬩欢
      app.services.analytics.trackPageView('index', {
        content_type: 'homepage',
        banner_count: res.banner ? res.banner.length : 0,
        product_count: res.recommended_products ? res.recommended_products.length : 0,
        category_count: res.categories ? res.categories.length : 0
      });
    } catch (err) {
      console.error('鑾峰彇棣栭〉鏁版嵁澶辫触:', err);
      this.setData({
        error: err.message || '缃戠粶杩炴帴澶辫触锛岃妫€鏌ョ綉缁滆缃?
      });
      showToast(err.message || '鑾峰彇棣栭〉鏁版嵁澶辫触', 'none', 2000);
    } finally {
      this.setData({
        loading: false,
        refreshing: false,
        showSkeleton: false
      });
      if (this.data.refreshing) {
        wx.stopPullDownRefresh();
      }
    }
  },

  /**
   * 鑾峰彇杞挱鍥惧垪琛紙澶囩敤鏂规硶锛屾甯告儏鍐典笅宸插湪getHomeData涓幏鍙栵級
   */
  getBannerList: async function() {
    const app = getApp();
    try {
      const res = await app.services.product.getBannerList();
      this.setData({
        bannerList: res || []
      });
    } catch (error) {
      console.error('鑾峰彇杞挱鍥惧け璐?);
      showToast('鑾峰彇杞挱鍥惧け璐?, 'none', 2000);
    }
  },

  /**
   * 鑾峰彇鍟嗗搧鍒嗙被锛堝鐢ㄦ柟娉曪紝姝ｅ父鎯呭喌涓嬪凡鍦╣etHomeData涓幏鍙栵級
   */
  getCategories: async function() {
    const app = getApp();
    try {
      const categories = await app.services.category.getCategories({
        hide_empty: false,
        per_page: 10
      });
      
      this.setData({
        categories: categories || []
      });
    } catch (error) {
      console.error('鑾峰彇鍟嗗搧鍒嗙被澶辫触');
    }
  },

  /**
   * 鑾峰彇鎺ㄨ崘鍟嗗搧鍒楄〃锛堝鐢ㄦ柟娉曪紝姝ｅ父鎯呭喌涓嬪凡鍦╣etHomeData涓幏鍙栵級
   */
  getRecommendedProducts: async function() {
    const app = getApp();
    if (!this.data.refreshing) {
      this.setData({
        loading: true
      });
    }
    
    try {
      const res = await app.services.product.getProducts({
        page: 1,
        per_page: 10,
        order: 'desc',
        orderby: 'popularity'
      });
      
      this.setData({
        recommendedProducts: res.products || [],
        currentPage: 2,
        hasMore: res.products && res.products.length >= 10 && res.pages > 1
      });
    } catch (error) {
      console.error('鑾峰彇鎺ㄨ崘鍟嗗搧澶辫触');
      showToast('鑾峰彇鎺ㄨ崘鍟嗗搧澶辫触', 'none', 2000);
    } finally {
      this.setData({
        loading: false,
        refreshing: false,
        showSkeleton: false
      });
      
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 鍔犺浇鏇村鍟嗗搧
   */
  loadMoreProducts: async function() {
    if (this.data.loading || this.data.loadingMore || !this.data.hasMore) {
      return;
    }
    
    const app = getApp();
    this.setData({
      loadingMore: true
    });
    
    try {
      const res = await app.services.product.getProducts({
        page: this.data.currentPage,
        per_page: 10,
        order: 'desc',
        orderby: 'popularity'
      });
      
      if (res.products && res.products.length > 0) {
        // 鍚堝苟骞跺幓閲嶅晢鍝佸垪琛紝闃叉閲嶅鍔犺浇
        const existingIds = new Set(this.data.recommendedProducts.map(product => product.id));
        const newProducts = res.products.filter(product => !existingIds.has(product.id));
        
        this.setData({
          recommendedProducts: [...this.data.recommendedProducts, ...newProducts],
          currentPage: this.data.currentPage + 1,
          hasMore: res.pages && res.pages >= this.data.currentPage
        });
      } else {
        this.setData({
          hasMore: false
        });
      }
    } catch (error) {
      console.error('鍔犺浇鏇村鍟嗗搧澶辫触:', error);
      showToast('鍔犺浇鏇村澶辫触锛岃閲嶈瘯', 'none', 2000);
    } finally {
      this.setData({
        loadingMore: false
      });
    }
  },

  /**
   * 鑾峰彇鐑棬鍟嗗搧锛堝鐢ㄦ柟娉曪紝姝ｅ父鎯呭喌涓嬪凡鍦╣etHomeData涓幏鍙栵級
   */
  getHotProducts: async function() {
    const app = getApp();
    try {
      const res = await app.services.product.getHotProducts({
        per_page: 5
      });
      
      this.setData({
        hotProducts: res || []
      });
    } catch (error) {
      console.error('鑾峰彇鐑棬鍟嗗搧澶辫触');
    }
  },

  /**
   * 鑾峰彇鏂板搧涓婂競锛堝鐢ㄦ柟娉曪紝姝ｅ父鎯呭喌涓嬪凡鍦╣etHomeData涓幏鍙栵級
   */
  getNewProducts: async function() {
    const app = getApp();
    try {
      const res = await app.services.product.getNewProducts({
        per_page: 5
      });
      
      this.setData({
        newProducts: res || []
      });
    } catch (error) {
      console.error('鑾峰彇鏂板搧涓婂競澶辫触');
    }
  },
  
  /**
   * 鑾峰彇绯荤粺淇℃伅锛堢敤浜庤皟璇曪級
   * @private
   */
  _getSystemInfo: function() {
    try {
      return wx.getSystemInfoSync() || {};
    } catch (e) {
      console.error('鑾峰彇绯荤粺淇℃伅澶辫触:', e);
      return {};
    }
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯呴〉
   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    if (productId) {
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${productId}`
      });
    }
  },

  /**
   * 璺宠浆鍒板垎绫婚〉
   */
  navigateToCategories: function() {
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  /**
   * 璺宠浆鍒板垎绫诲晢鍝佸垪琛?   */
  navigateToCategoryProducts: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    if (categoryId) {
      // 璺宠浆鍒板垎绫讳富椤靛苟浼犲叆鍒嗙被ID鍙傛暟
      wx.switchTab({
        url: `/pages/category/category?category_id=${categoryId}&category_name=${encodeURIComponent(categoryName || '')}`
      });
    }
  },

  /**
   * 璺宠浆鍒版悳绱㈤〉闈?- 閲嶅畾鍚戝埌浜у搧鍒楄〃椤?   */
  navigateToSearch: function() {
    wx.navigateTo({
      url: '/pages/product/list/list?show_search=true'
    });
  },

  /**
   * 鐐瑰嚮杞挱鍥?   */
  onBannerClick: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    
    const app = getApp();
    // 璁板綍杞挱鍥剧偣鍑讳簨浠?    app.services.analytics.trackEvent('banner_click', {
      banner_id: item.id || item.product_id,
      banner_type: item.type || 'product',
      position: e.currentTarget.dataset.index
    });
    
    if (item.type === 'product' && item.product_id) {
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${item.product_id}`
      });
    } else if (item.url) {
      // WebView椤甸潰涓嶅瓨鍦紝鏄剧ず鎻愮ず
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(item.url)}`
      });
    } else if (item.id) {
      // 鍏煎鍏朵粬鍙兘鐨処D鏍煎紡
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${item.id}`
      });
    }
  },

  /**
   * 鍒嗕韩椤甸潰
   */
  onShareAppMessage: function() {
    return {
      title: 'SUT鐢靛晢灏忕▼搴?,
      path: '/pages/index/index',
      imageUrl: this.data.bannerList && this.data.bannerList.length > 0 ? this.data.bannerList[0].image_url : ''
    };
  }
});\n