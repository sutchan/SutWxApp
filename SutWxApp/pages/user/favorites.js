/**
 * 文件名: favorites.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 鏀惰棌鍒楄〃椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    activeTab: 0, // 褰撳墠婵€娲荤殑鏍囩 0:鍟嗗搧 1:鏂囩珷
    tabs: ['鍟嗗搧', '鏂囩珷'],
    productFavorites: [], // 鍟嗗搧鏀惰棌鍒楄〃
    articleFavorites: [], // 鏂囩珷鏀惰棌鍒楄〃
    loading: false, // 加载状态    hasMore: {
      product: true, // 鍟嗗搧鏄惁杩樻湁鏇村鏁版嵁
      article: true  // 鏂囩珷鏄惁杩樻湁鏇村鏁版嵁
    },
    page: {
      product: 1, // 鍟嗗搧褰撳墠椤电爜
      article: 1  // 鏂囩珷褰撳墠椤电爜
    },
    pageSize: 10, // 姣忛〉鏁伴噺
    isEmpty: {
      product: false, // 鍟嗗搧鏀惰棌鏄惁涓虹┖
      article: false  // 鏂囩珷鏀惰棌鏄惁涓虹┖
    },
    editMode: false, // 鏄惁澶勪簬缂栬緫妯″紡
    selectedItems: {
      product: [], // 閫変腑鐨勫晢鍝?      article: []  // 閫変腑鐨勬枃绔?    },
    selectAll: {
      product: false, // 鍟嗗搧鏄惁鍏ㄩ€?      article: false  // 鏂囩珷鏄惁鍏ㄩ€?    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    // 鍔犺浇鏀惰棌鍒楄〃
    this.loadFavorites();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
   */
  onReady: function () {

  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 椤甸潰鏄剧ず鏃跺埛鏂版暟鎹?    this.refreshFavorites();
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
    this.refreshFavorites();
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    // 鍔犺浇鏇村鏁版嵁
    if (this.data.hasMore[this.data.activeTab === 0 ? 'product' : 'article'] && !this.data.loading) {
      this.loadMoreFavorites();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {

  },

  /**
   * 鍒囨崲鏍囩
   */
  onTabChange: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index,
      editMode: false // 鍒囨崲鏍囩鏃堕€€鍑虹紪杈戞ā寮?    });
    
    // 濡傛灉璇ユ爣绛捐繕娌℃湁鏁版嵁锛屽垯鍔犺浇鏁版嵁
    const tabType = index === 0 ? 'product' : 'article';
    if (this.data[`${tabType}Favorites`].length === 0 && !this.data.isEmpty[tabType]) {
      this.loadFavorites();
    }
  },

  /**
   * 鍒锋柊鏀惰棌鍒楄〃
   */
  refreshFavorites: function() {
    // 閲嶇疆鏁版嵁
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
    
    // 鍔犺浇鏁版嵁
    this.loadFavorites();
  },

  /**
   * 鍔犺浇鏀惰棌鍒楄〃
   */
  loadFavorites: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const page = this.data.page[tabType];
    const pageSize = this.data.pageSize;
    
    this.setData({ loading: true });
    
    // 妯℃嫙API璇锋眰
    setTimeout(() => {
      // 妯℃嫙鏁版嵁
      const mockData = tabType === 'product' ? this.generateMockProducts(page, pageSize) : this.generateMockArticles(page, pageSize);
      
      // 鏇存柊鏁版嵁
      this.setData({
        [`${tabType}Favorites`]: this.data[`${tabType}Favorites`].concat(mockData.list),
        [`hasMore.${tabType}`]: mockData.hasMore,
        [`isEmpty.${tabType}`]: this.data[`${tabType}Favorites`].length === 0 && mockData.list.length === 0,
        loading: false
      });
      
      // 鍋滄涓嬫媺鍒锋柊
      wx.stopPullDownRefresh();
    }, 500);
  },

  /**
   * 鍔犺浇鏇村鏀惰棌
   */
  loadMoreFavorites: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      [`page.${tabType}`]: this.data.page[tabType] + 1
    });
    this.loadFavorites();
  },

  /**
   * 鐢熸垚妯℃嫙鍟嗗搧鏁版嵁
   */
  generateMockProducts: function(page, pageSize) {
    const products = [];
    const total = 25; // 鎬诲叡25鏉℃暟鎹?    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    
    for (let i = start; i < end; i++) {
      products.push({
        id: `product_${i + 1}`,
        name: `绮鹃€夊晢鍝?${i + 1}`,
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
   * 鐢熸垚妯℃嫙鏂囩珷鏁版嵁
   */
  generateMockArticles: function(page, pageSize) {
    const articles = [];
    const total = 20; // 鎬诲叡20鏉℃暟鎹?    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    
    for (let i = start; i < end; i++) {
      articles.push({
        id: `article_${i + 1}`,
        title: `鐑棬鏂囩珷鏍囬 ${i + 1}`,
        summary: `杩欐槸鏂囩珷${i + 1}鐨勭畝浠嬪唴瀹癸紝浠嬬粛浜嗙浉鍏崇煡璇嗗拰鎶€宸?..`,
        image: `/images/article/article${(i % 4) + 1}.jpg`,
        author: `浣滆€?{(i % 3) + 1}`,
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
   * 鏍煎紡鍖栨椂闂?   */
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  },

  /**
   * 杩涘叆缂栬緫妯″紡
   */
  onEditMode: function() {
    this.setData({
      editMode: true
    });
  },

  /**
   * 閫€鍑虹紪杈戞ā寮?   */
  onCancelEdit: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      editMode: false,
      [`selectedItems.${tabType}`]: [],
      [`selectAll.${tabType}`]: false
    });
  },

  /**
   * 閫夋嫨/鍙栨秷閫夋嫨椤圭洰
   */
  onSelectItem: function(e) {
    const { id, type } = e.currentTarget.dataset;
    const tabType = type === 'product' ? 'product' : 'article';
    const selectedItems = this.data.selectedItems[tabType];
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      // 鍙栨秷閫夋嫨
      selectedItems.splice(index, 1);
    } else {
      // 娣诲姞閫夋嫨
      selectedItems.push(id);
    }
    
    this.setData({
      [`selectedItems.${tabType}`]: selectedItems,
      [`selectAll.${tabType}`]: selectedItems.length === this.data[`${tabType}Favorites`].length
    });
  },

  /**
   * 鍏ㄩ€?鍙栨秷鍏ㄩ€?   */
  onSelectAll: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const selectAll = !this.data.selectAll[tabType];
    
    this.setData({
      [`selectAll.${tabType}`]: selectAll,
      [`selectedItems.${tabType}`]: selectAll ? this.data[`${tabType}Favorites`].map(item => item.id) : []
    });
  },

  /**
   * 鍒犻櫎閫変腑鐨勬敹钘?   */
  onDeleteSelected: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const selectedItems = this.data.selectedItems[tabType];
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '璇烽€夋嫨瑕佸垹闄ょ殑椤圭洰',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '纭鍒犻櫎',
      content: `纭畾瑕佸垹闄ら€変腑鐨?{selectedItems.length}涓敹钘忓悧锛焋,
      success: (res) => {
        if (res.confirm) {
          // 浠庡垪琛ㄤ腑绉婚櫎閫変腑鐨勯」鐩?          const favorites = this.data[`${tabType}Favorites`].filter(item => !selectedItems.includes(item.id));
          
          this.setData({
            [`${tabType}Favorites`]: favorites,
            [`selectedItems.${tabType}`]: [],
            [`selectAll.${tabType}`]: false,
            editMode: false
          });
          
          wx.showToast({
            title: '鍒犻櫎鎴愬姛',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯?   */
  onProductTap: function(e) {
    if (this.data.editMode) return;
    
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 璺宠浆鍒版枃绔犺鎯?   */
  onArticleTap: function(e) {
    if (this.data.editMode) return;
    
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${id}`
    });
  }
});
