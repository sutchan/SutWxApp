/**
 * 鏂囦欢鍚? favorites.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 閺€鎯版閸掓銆冩い鐢告桨
 */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    activeTab: 0, // 瑜版挸澧犲┑鈧ú鑽ゆ畱閺嶅洨顒?0:閸熷棗鎼?1:閺傚洨鐝?    tabs: ['閸熷棗鎼?, '閺傚洨鐝?],
    productFavorites: [], // 閸熷棗鎼ч弨鎯版閸掓銆?    articleFavorites: [], // 閺傚洨鐝烽弨鎯版閸掓銆?    loading: false, // 加载状态   hasMore: {
      product: true, // 閸熷棗鎼ч弰顖氭儊鏉╂ɑ婀侀弴鏉戭樋閺佺増宓?      article: true  // 閺傚洨鐝烽弰顖氭儊鏉╂ɑ婀侀弴鏉戭樋閺佺増宓?    },
    page: {
      product: 1, // 閸熷棗鎼цぐ鎾冲妞ょ數鐖?      article: 1  // 閺傚洨鐝疯ぐ鎾冲妞ょ數鐖?    },
    pageSize: 10, // 濮ｅ繘銆夐弫浼村櫤
    isEmpty: {
      product: false, // 閸熷棗鎼ч弨鎯版閺勵垰鎯佹稉铏光敄
      article: false  // 閺傚洨鐝烽弨鎯版閺勵垰鎯佹稉铏光敄
    },
    editMode: false, // 閺勵垰鎯佹径鍕艾缂傛牞绶Ο鈥崇础
    selectedItems: {
      product: [], // 闁鑵戦惃鍕櫌閸?      article: []  // 闁鑵戦惃鍕瀮缁?    },
    selectAll: {
      product: false, // 閸熷棗鎼ч弰顖氭儊閸忋劑鈧?      article: false  // 閺傚洨鐝烽弰顖氭儊閸忋劑鈧?    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    // 閸旂姾娴囬弨鎯版閸掓銆?    this.loadFavorites();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {

  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鐗堟殶閹?    this.refreshFavorites();
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
    this.refreshFavorites();
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    // 閸旂姾娴囬弴鏉戭樋閺佺増宓?    if (this.data.hasMore[this.data.activeTab === 0 ? 'product' : 'article'] && !this.data.loading) {
      this.loadMoreFavorites();
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {

  },

  /**
   * 閸掑洦宕查弽鍥╊劮
   */
  onTabChange: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index,
      editMode: false // 閸掑洦宕查弽鍥╊劮閺冨爼鈧偓閸戣櫣绱潏鎴災佸?    });
    
    // 婵″倹鐏夌拠銉︾垼缁涙崘绻曞▽鈩冩箒閺佺増宓侀敍灞藉灟閸旂姾娴囬弫鐗堝祦
    const tabType = index === 0 ? 'product' : 'article';
    if (this.data[`${tabType}Favorites`].length === 0 && !this.data.isEmpty[tabType]) {
      this.loadFavorites();
    }
  },

  /**
   * 閸掗攱鏌婇弨鎯版閸掓銆?   */
  refreshFavorites: function() {
    // 闁插秶鐤嗛弫鐗堝祦
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      [`page.${tabType}`]: 1,
      [`${tabType}Favorites`]: [],
      [`hasMore.${tabType}`]: true,
      [`isEmpty.${tabType}`]: false,
      editMode: false,
      [`selectedItems.${tabType}`]: [],
      [`selectAll.${tabType}`]: false
    });
    
    // 閸旂姾娴囬弫鐗堝祦
    this.loadFavorites();
  },

  /**
   * 閸旂姾娴囬弨鎯版閸掓銆?   */
  loadFavorites: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const page = this.data.page[tabType];
    const pageSize = this.data.pageSize;
    
    this.setData({ loading: true });
    
    // 濡剝瀚橝PI鐠囬攱鐪?    setTimeout(() => {
      // 濡剝瀚欓弫鐗堝祦
      const mockData = tabType === 'product' ? this.generateMockProducts(page, pageSize) : this.generateMockArticles(page, pageSize);
      
      // 閺囧瓨鏌婇弫鐗堝祦
      this.setData({
        [`${tabType}Favorites`]: this.data[`${tabType}Favorites`].concat(mockData.list),
        [`hasMore.${tabType}`]: mockData.hasMore,
        [`isEmpty.${tabType}`]: this.data[`${tabType}Favorites`].length === 0 && mockData.list.length === 0,
        loading: false
      });
      
      // 閸嬫粍顒涙稉瀣閸掗攱鏌?      wx.stopPullDownRefresh();
    }, 500);
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋閺€鎯版
   */
  loadMoreFavorites: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      [`page.${tabType}`]: this.data.page[tabType] + 1
    });
    this.loadFavorites();
  },

  /**
   * 閻㈢喐鍨氬Ο鈩冨珯閸熷棗鎼ч弫鐗堝祦
   */
  generateMockProducts: function(page, pageSize) {
    const products = [];
    const total = 25; // 閹鍙?5閺夆剝鏆熼幑?    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    
    for (let i = start; i < end; i++) {
      products.push({
        id: `product_${i + 1}`,
        name: `缁箖鈧鏅㈤崫?${i + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        originalPrice: Math.floor(Math.random() * 1200) + 200,
        image: `/images/product/product${(i % 5) + 1}.jpg`,
        sales: Math.floor(Math.random() * 1000),
        collectTime: this.formatTime(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000))
      });
    }
    
    return {
      list: products,
      hasMore: end < total
    };
  },

  /**
   * 閻㈢喐鍨氬Ο鈩冨珯閺傚洨鐝烽弫鐗堝祦
   */
  generateMockArticles: function(page, pageSize) {
    const articles = [];
    const total = 20; // 閹鍙?0閺夆剝鏆熼幑?    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    
    for (let i = start; i < end; i++) {
      articles.push({
        id: `article_${i + 1}`,
        title: `閻戭參妫弬鍥╃彿閺嶅洭顣?${i + 1}`,
        summary: `鏉╂瑦妲搁弬鍥╃彿${i + 1}閻ㄥ嫮鐣濇禒瀣敶鐎圭櫢绱濇禒瀣矝娴滃棛娴夐崗宕囩叀鐠囧棗鎷伴幎鈧?..`,
        image: `/images/article/article${(i % 4) + 1}.jpg`,
        author: `娴ｆ粏鈧?{(i % 3) + 1}`,
        publishTime: this.formatTime(new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)),
        collectTime: this.formatTime(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
        readCount: Math.floor(Math.random() * 5000) + 100
      });
    }
    
    return {
      list: articles,
      hasMore: end < total
    };
  },

  /**
   * 閺嶇厧绱￠崠鏍ㄦ闂?   */
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  },

  /**
   * 鏉╂稑鍙嗙紓鏍帆濡€崇础
   */
  onEditMode: function() {
    this.setData({
      editMode: true
    });
  },

  /**
   * 闁偓閸戣櫣绱潏鎴災佸?   */
  onCancelEdit: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      editMode: false,
      [`selectedItems.${tabType}`]: [],
      [`selectAll.${tabType}`]: false
    });
  },

  /**
   * 闁瀚?閸欐牗绉烽柅澶嬪妞ゅ湱娲?   */
  onSelectItem: function(e) {
    const { id, type } = e.currentTarget.dataset;
    const tabType = type === 'product' ? 'product' : 'article';
    const selectedItems = this.data.selectedItems[tabType];
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      // 閸欐牗绉烽柅澶嬪
      selectedItems.splice(index, 1);
    } else {
      // 濞ｈ濮為柅澶嬪
      selectedItems.push(id);
    }
    
    this.setData({
      [`selectedItems.${tabType}`]: selectedItems,
      [`selectAll.${tabType}`]: selectedItems.length === this.data[`${tabType}Favorites`].length
    });
  },

  /**
   * 閸忋劑鈧?閸欐牗绉烽崗銊┾偓?   */
  onSelectAll: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const selectAll = !this.data.selectAll[tabType];
    
    this.setData({
      [`selectAll.${tabType}`]: selectAll,
      [`selectedItems.${tabType}`]: selectAll ? this.data[`${tabType}Favorites`].map(item => item.id) : []
    });
  },

  /**
   * 閸掔娀娅庨柅澶夎厬閻ㄥ嫭鏁归挊?   */
  onDeleteSelected: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const selectedItems = this.data.selectedItems[tabType];
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '鐠囩兘鈧瀚ㄧ憰浣稿灩闂勩倗娈戞い鍦窗',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '绾喛顓婚崚鐘绘珟',
      content: `绾喖鐣剧憰浣稿灩闂勩倝鈧鑵戦惃?{selectedItems.length}娑擃亝鏁归挊蹇撴偋閿涚剫,
      success: (res) => {
        if (res.confirm) {
          // 娴犲骸鍨悰銊よ厬缁夊娅庨柅澶夎厬閻ㄥ嫰銆嶉惄?          const favorites = this.data[`${tabType}Favorites`].filter(item => !selectedItems.includes(item.id));
          
          this.setData({
            [`${tabType}Favorites`]: favorites,
            [`selectedItems.${tabType}`]: [],
            [`selectAll.${tabType}`]: false,
            editMode: false
          });
          
          wx.showToast({
            title: '閸掔娀娅庨幋鎰',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆?   */
  onProductTap: function(e) {
    if (this.data.editMode) return;
    
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鐗堟瀮缁旂姾顕涢幆?   */
  onArticleTap: function(e) {
    if (this.data.editMode) return;
    
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${id}`
    });
  }
});
