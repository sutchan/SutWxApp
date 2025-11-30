/**
 * 文件名: mall.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

// 绉垎鍟嗗煄椤甸潰
const pointsService = require('../../../services/pointsService.js');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 鐢ㄦ埛绉垎淇℃伅
    userPoints: 0,
    
    // 鍟嗗搧鍒嗙被
    categories: [
      { id: 0, name: '鍏ㄩ儴', count: 0 },
      { id: 1, name: '浼樻儬鍒?, count: 0 },
      { id: 2, name: '瀹炵墿鍟嗗搧', count: 0 },
      { id: 3, name: '铏氭嫙鍟嗗搧', count: 0 },
      { id: 4, name: '浼氬憳鐗规潈', count: 0 }
    ],
    currentCategory: 0,
    
    // 鎺掑簭鏂瑰紡
    sortOptions: [
      { key: 'default', name: '缁煎悎鎺掑簭' },
      { key: 'points_asc', name: '绉垎浠庝綆鍒伴珮' },
      { key: 'points_desc', name: '绉垎浠庨珮鍒颁綆' },
      { key: 'popularity', name: '鐑棬浼樺厛' }
    ],
    currentSort: 'default',
    showSortPopup: false,
    
    // 鍟嗗搧鍒楄〃
    productList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 鎼滅储鍏抽敭璇?    searchKeyword: '',
    
    // 鍏戞崲璁板綍
    exchangeRecords: []
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    // 鍔犺浇鐢ㄦ埛绉垎
    this.loadUserPoints();
    
    // 鍔犺浇鍟嗗搧鍒楄〃
    this.loadProductList(true);
    
    // 鍔犺浇鍏戞崲璁板綍
    this.loadExchangeRecords();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
   */
  onReady: function () {
    // 璁剧疆瀵艰埅鏍忔爣棰?    wx.setNavigationBarTitle({
      title: '绉垎鍟嗗煄'
    });
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 椤甸潰鏄剧ず鏃跺埛鏂扮敤鎴风Н鍒?    this.loadUserPoints();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰闅愯棌
   */
  onHide: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload: function () {
    
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function () {
    this.loadUserPoints().then(() => {
      this.loadProductList(true).then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProductList(false);
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: '绉垎濂界ぜ绛変綘鏉ユ崲',
      path: '/pages/user/points/mall/mall'
    };
  },

  /**
   * 鍔犺浇鐢ㄦ埛绉垎
   */
  loadUserPoints: async function() {
    try {
      const result = await pointsService.getUserPoints();
      if (result.success) {
        this.setData({
          userPoints: result.data.availablePoints
        });
        return result;
      }
    } catch (error) {
      console.error('鍔犺浇鐢ㄦ埛绉垎澶辫触:', error);
    }
  },

  /**
   * 鍔犺浇鍟嗗搧鍒楄〃
   */
  loadProductList: async function(reset = false) {
    if (this.data.loading) return;
    
    this.setData({
      loading: true
    });
    
    try {
      const page = reset ? 1 : this.data.page;
      const options = {
        categoryId: this.data.currentCategory,
        sort: this.data.currentSort,
        keyword: this.data.searchKeyword,
        page: page,
        pageSize: this.data.pageSize
      };
      
      const result = await pointsService.getPointsMallProducts(options);
      
      if (result.success) {
        const newProducts = result.data.list || [];
        const hasMore = newProducts.length === this.data.pageSize;
        
        // 鏇存柊鍒嗙被璁℃暟
        if (reset && result.data.categoryCounts) {
          const categories = this.data.categories.map(category => {
            const count = category.id === 0 ? result.data.total : (result.data.categoryCounts[category.id] || 0);
            return { ...category, count };
          });
          this.setData({ categories });
        }
        
        this.setData({
          productList: reset ? newProducts : [...this.data.productList, ...newProducts],
          page: hasMore ? page + 1 : page,
          hasMore: hasMore,
          loading: false
        });
      } else {
        this.setData({
          loading: false
        });
        wx.showToast({
          title: result.message || '鍔犺浇鍟嗗搧澶辫触',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('鍔犺浇鍟嗗搧鍒楄〃澶辫触:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '缃戠粶閿欒锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 鍔犺浇鍏戞崲璁板綍
   */
  loadExchangeRecords: async function() {
    try {
      const result = await pointsService.getPointsExchangeRecords({ page: 1, pageSize: 3 });
      if (result.success) {
        this.setData({
          exchangeRecords: result.data.list || []
        });
      }
    } catch (error) {
      console.error('鍔犺浇鍏戞崲璁板綍澶辫触:', error);
    }
  },

  /**
   * 鍒囨崲鍟嗗搧鍒嗙被
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId === this.data.currentCategory) return;
    
    this.setData({
      currentCategory: categoryId,
      productList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadProductList(true);
  },

  /**
   * 鏄剧ず鎺掑簭寮圭獥
   */
  showSortPopup: function() {
    this.setData({
      showSortPopup: true
    });
  },

  /**
   * 闅愯棌鎺掑簭寮圭獥
   */
  hideSortPopup: function() {
    this.setData({
      showSortPopup: false
    });
  },

  /**
   * 閫夋嫨鎺掑簭鏂瑰紡
   */
  selectSort: function(e) {
    const sort = e.currentTarget.dataset.sort;
    if (sort === this.data.currentSort) {
      this.hideSortPopup();
      return;
    }
    
    this.setData({
      currentSort: sort,
      showSortPopup: false,
      productList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadProductList(true);
  },

  /**
   * 杈撳叆鎼滅储鍏抽敭璇?   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 鎵ц鎼滅储
   */
  onSearch: function() {
    this.setData({
      productList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadProductList(true);
  },

  /**
   * 娓呯┖鎼滅储
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      productList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadProductList(true);
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯呴〉
   */
  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points/productDetail/productDetail?id=${productId}`
    });
  },

  /**
   * 鍏戞崲鍟嗗搧
   */
  exchangeProduct: async function(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.productList.find(item => item.id === productId);
    
    if (!product) return;
    
    // 妫€鏌ョН鍒嗘槸鍚﹁冻澶?    if (this.data.userPoints < product.points) {
      wx.showToast({
        title: '绉垎涓嶈冻',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '姝ｅ湪鍏戞崲...',
      });
      
      const result = await pointsService.exchangeProduct(productId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '鍏戞崲鎴愬姛',
          icon: 'success'
        });
        
        // 鍒锋柊鐢ㄦ埛绉垎
        this.loadUserPoints();
        
        // 鍒锋柊鍟嗗搧鍒楄〃
        this.loadProductList(true);
        
        // 鍒锋柊鍏戞崲璁板綍
        this.loadExchangeRecords();
      } else {
        wx.showToast({
          title: result.message || '鍏戞崲澶辫触',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('鍏戞崲鍟嗗搧澶辫触:', error);
      wx.showToast({
        title: '缃戠粶閿欒锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 璺宠浆鍒扮Н鍒嗛〉闈?   */
  goToPoints: function() {
    wx.switchTab({
      url: '/pages/user/points/points'
    });
  },

  /**
   * 璺宠浆鍒板厬鎹㈣褰曢〉闈?   */
  goToExchangeRecords: function() {
    wx.navigateTo({
      url: '/pages/user/points/exchangeRecords/exchangeRecords'
    });
  }
});