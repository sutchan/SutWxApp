/**
 * 鏂囦欢鍚? mall.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

// 缁夘垰鍨庨崯鍡楃厔妞ょ敻娼?const pointsService = require('../../../services/pointsService.js');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    // 閻劍鍩涚粔顖氬瀻娣団剝浼?    userPoints: 0,
    
    // 閸熷棗鎼ч崚鍡欒
    categories: [
      { id: 0, name: '閸忋劑鍎?, count: 0 },
      { id: 1, name: '娴兼ɑ鍎崚?, count: 0 },
      { id: 2, name: '鐎圭偟澧块崯鍡楁惂', count: 0 },
      { id: 3, name: '閾忔碍瀚欓崯鍡楁惂', count: 0 },
      { id: 4, name: '娴兼艾鎲抽悧瑙勬綀', count: 0 }
    ],
    currentCategory: 0,
    
    // 閹烘帒绨弬鐟扮础
    sortOptions: [
      { key: 'default', name: '缂佺厧鎮庨幒鎺戠碍' },
      { key: 'points_asc', name: '缁夘垰鍨庢禒搴濈秵閸掍即鐝? },
      { key: 'points_desc', name: '缁夘垰鍨庢禒搴ㄧ彯閸掗缍? },
      { key: 'popularity', name: '閻戭參妫导妯哄帥' }
    ],
    currentSort: 'default',
    showSortPopup: false,
    
    // 閸熷棗鎼ч崚妤勩€?    productList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 閹兼粎鍌ㄩ崗鎶芥暛鐠?    searchKeyword: '',
    
    // 閸忔垶宕茬拋鏉跨秿
    exchangeRecords: []
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    // 閸旂姾娴囬悽銊﹀煕缁夘垰鍨?    this.loadUserPoints();
    
    // 閸旂姾娴囬崯鍡楁惂閸掓銆?    this.loadProductList(true);
    
    // 閸旂姾娴囬崗鎴炲床鐠佹澘缍?    this.loadExchangeRecords();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {
    // 鐠佸墽鐤嗙€佃壈鍩呴弽蹇旂垼妫?    wx.setNavigationBarTitle({
      title: '缁夘垰鍨庨崯鍡楃厔'
    });
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鎵暏閹撮袧閸?    this.loadUserPoints();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨闂呮劘妫?   */
  onHide: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   */
  onUnload: function () {
    
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function () {
    this.loadUserPoints().then(() => {
      this.loadProductList(true).then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProductList(false);
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {
    return {
      title: '缁夘垰鍨庢總鐣屻仠缁涘缍橀弶銉﹀床',
      path: '/pages/user/points/mall/mall'
    };
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕缁夘垰鍨?   */
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
      console.error('閸旂姾娴囬悽銊﹀煕缁夘垰鍨庢径杈Е:', error);
    }
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂閸掓銆?   */
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
        
        // 閺囧瓨鏌婇崚鍡欒鐠佲剝鏆?        if (reset && result.data.categoryCounts) {
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
          title: result.message || '閸旂姾娴囬崯鍡楁惂婢惰精瑙?,
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('閸旂姾娴囬崯鍡楁惂閸掓銆冩径杈Е:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
        icon: 'none'
      });
    }
  },

  /**
   * 閸旂姾娴囬崗鎴炲床鐠佹澘缍?   */
  loadExchangeRecords: async function() {
    try {
      const result = await pointsService.getPointsExchangeRecords({ page: 1, pageSize: 3 });
      if (result.success) {
        this.setData({
          exchangeRecords: result.data.list || []
        });
      }
    } catch (error) {
      console.error('閸旂姾娴囬崗鎴炲床鐠佹澘缍嶆径杈Е:', error);
    }
  },

  /**
   * 閸掑洦宕查崯鍡楁惂閸掑棛琚?   */
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
   * 閺勫墽銇氶幒鎺戠碍瀵湱鐛?   */
  showSortPopup: function() {
    this.setData({
      showSortPopup: true
    });
  },

  /**
   * 闂呮劘妫岄幒鎺戠碍瀵湱鐛?   */
  hideSortPopup: function() {
    this.setData({
      showSortPopup: false
    });
  },

  /**
   * 闁瀚ㄩ幒鎺戠碍閺傜懓绱?   */
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
   * 鏉堟挸鍙嗛幖婊呭偍閸忔娊鏁拠?   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 閹笛嗩攽閹兼粎鍌?   */
  onSearch: function() {
    this.setData({
      productList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadProductList(true);
  },

  /**
   * 濞撳懐鈹栭幖婊呭偍
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
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   */
  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points/productDetail/productDetail?id=${productId}`
    });
  },

  /**
   * 閸忔垶宕查崯鍡楁惂
   */
  exchangeProduct: async function(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.productList.find(item => item.id === productId);
    
    if (!product) return;
    
    // 濡偓閺屻儳袧閸掑棙妲搁崥锕佸喕婢?    if (this.data.userPoints < product.points) {
      wx.showToast({
        title: '缁夘垰鍨庢稉宥堝喕',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '濮濓絽婀崗鎴炲床...',
      });
      
      const result = await pointsService.exchangeProduct(productId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '閸忔垶宕查幋鎰',
          icon: 'success'
        });
        
        // 閸掗攱鏌婇悽銊﹀煕缁夘垰鍨?        this.loadUserPoints();
        
        // 閸掗攱鏌婇崯鍡楁惂閸掓銆?        this.loadProductList(true);
        
        // 閸掗攱鏌婇崗鎴炲床鐠佹澘缍?        this.loadExchangeRecords();
      } else {
        wx.showToast({
          title: result.message || '閸忔垶宕叉径杈Е',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('閸忔垶宕查崯鍡楁惂婢惰精瑙?', error);
      wx.showToast({
        title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
        icon: 'none'
      });
    }
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡涖€夐棃?   */
  goToPoints: function() {
    wx.switchTab({
      url: '/pages/user/points/points'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鏉垮幀閹广垼顔囪ぐ鏇€夐棃?   */
  goToExchangeRecords: function() {
    wx.navigateTo({
      url: '/pages/user/points/exchangeRecords/exchangeRecords'
    });
  }
});
