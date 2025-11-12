锘?/ pages/index/index.js
/**
 * 妫ｆ牠銆夋い鐢告桨 - 閻㈤潧鏅㈡惔鏃傛暏妫ｆ牠銆夐敍灞界潔缁€楦跨枂閹绢厼娴橀妴浣告櫌閸濅礁鍨庣猾姹団偓浣瑰腹閼芥劕鏅㈤崫浣虹搼
 */
import { showToast } from '../../utils/global';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    bannerList: [], // 鏉烆喗鎸遍崶鐐殶閹?    categories: [], // 閸熷棗鎼ч崚鍡欒閺佺増宓?    recommendedProducts: [], // 閹恒劏宕橀崯鍡楁惂閸掓銆?    hotProducts: [], // 閻戭參妫崯鍡楁惂閸掓銆?    newProducts: [], // 閺傛澘鎼ф稉濠傜閸掓銆?    currentPage: 1, // 瑜版挸澧犳い鐢电垳
    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    loading: false, // 閸旂姾娴囬悩鑸碘偓?    loadingMore: false, // 閸旂姾娴囬弴鏉戭樋閻樿埖鈧?    refreshing: false, // 娑撳濯洪崚閿嬫煀閻樿埖鈧?    error: '', // 闁挎瑨顕ゆ穱鈩冧紖
    showSkeleton: true // 閺勵垰鎯侀弰鍓с仛妤犮劍鐏︾仦?  },

  /**
   * 闁插秷鐦崝鐘烘祰閺佺増宓?   */
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function() {
    // 閸掓繂顫愰崠鏍€夐棃銏℃殶閹?    this.loadAllData();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 妞ょ敻娼伴弰鍓с仛閺冭绱濇俊鍌涚亯闂団偓鐟曚礁鍩涢弬鐗堟殶閹诡噯绱濋崣顖欎簰閸︺劏绻栭柌灞惧潑閸旂娀鈧槒绶?    // 娓氬顩уΛ鈧弻銉ュ弿鐏炩偓閻樿埖鈧礁褰夐崠鏍电礉閹存牞鈧懎鐣鹃弮璺哄煕閺傛壆鐡?  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function() {
    // 娑撳濯洪崚閿嬫煀閺冨爼鍣哥純顔芥殶閹诡喖鑻熼柌宥嗘煀閸旂姾娴?    this.setData({
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
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function() {
    // 娑撳﹥濯虹憴锕€绨抽崝鐘烘祰閺囨潙顦块幒銊ㄥ礃閸熷棗鎼?    if (!this.data.loading && !this.data.loadingMore && this.data.hasMore) {
      this.loadMoreProducts();
    }
  },

  /**
   * 閸旂姾娴囬幍鈧張澶愩€夐棃銏℃殶閹?   * 閺嶈宓丄PI閺傚洦銆傞敍灞煎▏閻劎绮烘稉鈧幒銉ュ經閼惧嘲褰囨＃鏍€夐幍鈧棁鈧弫鐗堝祦
   */
  loadAllData: function() {
    // 娴ｈ法鏁ゆ＃鏍€夌紒鐔剁閹恒儱褰涢懢宄板絿閺佺増宓侀敍灞惧絹妤傛ɑ鈧嗗厴
    this.getHomeData();
  },

  /**
   * 閼惧嘲褰囨＃鏍€夐弫鐗堝祦閿涘牆瀵橀崥鐜漚nner閵嗕礁鏅㈤崫浣稿瀻缁眹鈧焦甯归懡鎰櫌閸濅胶鐡戦敍?   */
  getHomeData: async function() {
    const app = getApp();
    if (!this.data.refreshing) {
      this.setData({ loading: true });
    }
    
    try {
      // 娴ｈ法鏁roductService閼惧嘲褰囨＃鏍€夐弫鐗堝祦
      const res = await app.services.product.getHomeData();
      
      // 婢跺嫮鎮婃＃鏍€夐弫鐗堝祦
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
      
      // 鐠佹澘缍嶆い鐢告桨濞村繗顫嶆禍瀣╂
      app.services.analytics.trackPageView('index', {
        content_type: 'homepage',
        banner_count: res.banner ? res.banner.length : 0,
        product_count: res.recommended_products ? res.recommended_products.length : 0,
        category_count: res.categories ? res.categories.length : 0
      });
    } catch (err) {
      console.error('閼惧嘲褰囨＃鏍€夐弫鐗堝祦婢惰精瑙?', err);
      this.setData({
        error: err.message || '缂冩垹绮舵潻鐐村复婢惰精瑙﹂敍宀冾嚞濡偓閺屻儳缍夌紒婊嗩啎缂?
      });
      showToast(err.message || '閼惧嘲褰囨＃鏍€夐弫鐗堝祦婢惰精瑙?, 'none', 2000);
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
   * 閼惧嘲褰囨潪顔芥尡閸ユ儳鍨悰顭掔礄婢跺洨鏁ら弬瑙勭《閿涘本顒滅敮鍛婂剰閸愬吀绗呭鎻掓躬getHomeData娑擃叀骞忛崣鏍电礆
   */
  getBannerList: async function() {
    const app = getApp();
    try {
      const res = await app.services.product.getBannerList();
      this.setData({
        bannerList: res || []
      });
    } catch (error) {
      console.error('閼惧嘲褰囨潪顔芥尡閸ユ儳銇戠拹?);
      showToast('閼惧嘲褰囨潪顔芥尡閸ユ儳銇戠拹?, 'none', 2000);
    }
  },

  /**
   * 閼惧嘲褰囬崯鍡楁惂閸掑棛琚敍鍫濐槵閻劍鏌熷▔鏇礉濮濓絽鐖堕幆鍛枌娑撳鍑￠崷鈺tHomeData娑擃叀骞忛崣鏍电礆
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
      console.error('閼惧嘲褰囬崯鍡楁惂閸掑棛琚径杈Е');
    }
  },

  /**
   * 閼惧嘲褰囬幒銊ㄥ礃閸熷棗鎼ч崚妤勩€冮敍鍫濐槵閻劍鏌熷▔鏇礉濮濓絽鐖堕幆鍛枌娑撳鍑￠崷鈺tHomeData娑擃叀骞忛崣鏍电礆
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
      console.error('閼惧嘲褰囬幒銊ㄥ礃閸熷棗鎼ф径杈Е');
      showToast('閼惧嘲褰囬幒銊ㄥ礃閸熷棗鎼ф径杈Е', 'none', 2000);
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
   * 閸旂姾娴囬弴鏉戭樋閸熷棗鎼?   */
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
        // 閸氬牆鑻熼獮璺哄箵闁插秴鏅㈤崫浣稿灙鐞涱煉绱濋梼鍙夘剾闁插秴顦查崝鐘烘祰
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
      console.error('閸旂姾娴囬弴鏉戭樋閸熷棗鎼ф径杈Е:', error);
      showToast('閸旂姾娴囬弴鏉戭樋婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, 'none', 2000);
    } finally {
      this.setData({
        loadingMore: false
      });
    }
  },

  /**
   * 閼惧嘲褰囬悜顓㈡，閸熷棗鎼ч敍鍫濐槵閻劍鏌熷▔鏇礉濮濓絽鐖堕幆鍛枌娑撳鍑￠崷鈺tHomeData娑擃叀骞忛崣鏍电礆
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
      console.error('閼惧嘲褰囬悜顓㈡，閸熷棗鎼ф径杈Е');
    }
  },

  /**
   * 閼惧嘲褰囬弬鏉挎惂娑撳﹤绔堕敍鍫濐槵閻劍鏌熷▔鏇礉濮濓絽鐖堕幆鍛枌娑撳鍑￠崷鈺tHomeData娑擃叀骞忛崣鏍电礆
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
      console.error('閼惧嘲褰囬弬鏉挎惂娑撳﹤绔舵径杈Е');
    }
  },
  
  /**
   * 閼惧嘲褰囩化鑽ょ埠娣団剝浼呴敍鍫㈡暏娴滃氦鐨熺拠鏇礆
   * @private
   */
  _getSystemInfo: function() {
    try {
      return wx.getSystemInfoSync() || {};
    } catch (e) {
      console.error('閼惧嘲褰囩化鑽ょ埠娣団剝浼呮径杈Е:', e);
      return {};
    }
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    if (productId) {
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${productId}`
      });
    }
  },

  /**
   * 鐠哄疇娴嗛崚鏉垮瀻缁銆?   */
  navigateToCategories: function() {
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鏉垮瀻缁鏅㈤崫浣稿灙鐞?   */
  navigateToCategoryProducts: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    if (categoryId) {
      // 鐠哄疇娴嗛崚鏉垮瀻缁瀵屾い闈涜嫙娴肩姴鍙嗛崚鍡欒ID閸欏倹鏆?      wx.switchTab({
        url: `/pages/category/category?category_id=${categoryId}&category_name=${encodeURIComponent(categoryName || '')}`
      });
    }
  },

  /**
   * 鐠哄疇娴嗛崚鐗堟偝缁便垽銆夐棃?- 闁插秴鐣鹃崥鎴濆煂娴溠冩惂閸掓銆冩い?   */
  navigateToSearch: function() {
    wx.navigateTo({
      url: '/pages/product/list/list?show_search=true'
    });
  },

  /**
   * 閻愮懓鍤潪顔芥尡閸?   */
  onBannerClick: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    
    const app = getApp();
    // 鐠佹澘缍嶆潪顔芥尡閸ュ墽鍋ｉ崙璁崇皑娴?    app.services.analytics.trackEvent('banner_click', {
      banner_id: item.id || item.product_id,
      banner_type: item.type || 'product',
      position: e.currentTarget.dataset.index
    });
    
    if (item.type === 'product' && item.product_id) {
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${item.product_id}`
      });
    } else if (item.url) {
      // WebView妞ょ敻娼版稉宥呯摠閸︻煉绱濋弰鍓с仛閹绘劗銇?      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(item.url)}`
      });
    } else if (item.id) {
      // 閸忕厧顔愰崗鏈电铂閸欘垵鍏橀惃鍑閺嶇厧绱?      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${item.id}`
      });
    }
  },

  /**
   * 閸掑棔闊╂い鐢告桨
   */
  onShareAppMessage: function() {
    return {
      title: 'SUT閻㈤潧鏅㈢亸蹇曗柤鎼?,
      path: '/pages/index/index',
      imageUrl: this.data.bannerList && this.data.bannerList.length > 0 ? this.data.bannerList[0].image_url : ''
    };
  }
});\n