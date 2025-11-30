/**
 * 文件名: result.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 鎼滅储缁撴灉椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    keyword: '', // 鎼滅储鍏抽敭璇?    searchHistory: [], // 鎼滅储鍘嗗彶
    hotSearches: [], // 鐑棬鎼滅储
    activeTab: 'all', // 褰撳墠婵€娲荤殑鏍囩锛歛ll(鍏ㄩ儴)銆乸roduct(鍟嗗搧)銆乤rticle(鏂囩珷)銆乽ser(鐢ㄦ埛)
    tabs: [
      { key: 'all', value: '鍏ㄩ儴' },
      { key: 'product', value: '鍟嗗搧' },
      { key: 'article', value: '鏂囩珷' },
      { key: 'user', value: '鐢ㄦ埛' }
    ],
    searchResults: [], // 鎼滅储缁撴灉
    loading: false, // 加载状态    page: 1, // 褰撳墠椤电爜
    pageSize: 20, // 姣忛〉鏁伴噺
    hasMore: true, // 鏄惁杩樻湁鏇村鏁版嵁
    showResult: false // 鏄惁鏄剧ず鎼滅储缁撴灉
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    // 鑾峰彇浼犲叆鐨勫叧閿瘝
    if (options.keyword) {
      this.setData({
        keyword: options.keyword,
        showResult: true
      }, () => {
        this.loadSearchResults();
      });
    }
    
    // 鍔犺浇鎼滅储鍘嗗彶鍜岀儹闂ㄦ悳绱?    this.loadSearchHistory();
    this.loadHotSearches();
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
    if (this.data.showResult) {
      this.setData({
        page: 1,
        searchResults: [],
        hasMore: true
      }, () => {
        this.loadSearchResults();
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.showResult && this.data.hasMore && !this.data.loading) {
      this.loadSearchResults();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: `鎼滅储"${this.data.keyword}"鐨勭粨鏋渀,
      path: `/pages/search/result/result?keyword=${this.data.keyword}`
    };
  },

  /**
   * 杈撳叆妗嗗唴瀹瑰彉鍖?   */
  onInputChange: function(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  /**
   * 娓呯┖杈撳叆妗?   */
  onClearInput: function() {
    this.setData({
      keyword: '',
      showResult: false,
      searchResults: []
    });
  },

  /**
   * 鐐瑰嚮鎼滅储鎸夐挳
   */
  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '璇疯緭鍏ユ悳绱㈠叧閿瘝',
        icon: 'none'
      });
      return;
    }
    
    // 淇濆瓨鎼滅储鍘嗗彶
    this.saveSearchHistory(keyword);
    
    // 鏄剧ず鎼滅储缁撴灉
    this.setData({
      showResult: true,
      page: 1,
      searchResults: [],
      hasMore: true,
      activeTab: 'all'
    }, () => {
      this.loadSearchResults();
    });
  },

  /**
   * 鍒囨崲鏍囩
   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      page: 1,
      searchResults: [],
      hasMore: true
    }, () => {
      this.loadSearchResults();
    });
  },

  /**
   * 鐐瑰嚮鎼滅储鍘嗗彶
   */
  onHistoryTap: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      keyword: keyword,
      showResult: true,
      page: 1,
      searchResults: [],
      hasMore: true,
      activeTab: 'all'
    }, () => {
      this.loadSearchResults();
    });
  },

  /**
   * 鐐瑰嚮鐑棬鎼滅储
   */
  onHotSearchTap: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      keyword: keyword,
      showResult: true,
      page: 1,
      searchResults: [],
      hasMore: true,
      activeTab: 'all'
    }, () => {
      this.loadSearchResults();
    });
  },

  /**
   * 娓呯┖鎼滅储鍘嗗彶
   */
  onClearHistory: function() {
    wx.showModal({
      title: '鎻愮ず',
      content: '纭畾瑕佹竻绌烘悳绱㈠巻鍙插悧锛?,
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({
            searchHistory: []
          });
        }
      }
    });
  },

  /**
   * 鐐瑰嚮鎼滅储缁撴灉椤?   */
  onResultTap: function(e) {
    const { type, id } = e.currentTarget.dataset;
    
    switch (type) {
      case 'product':
        wx.navigateTo({
          url: `/pages/product/detail/detail?id=${id}`
        });
        break;
      case 'article':
        wx.navigateTo({
          url: `/pages/article/detail/detail?id=${id}`
        });
        break;
      case 'user':
        wx.navigateTo({
          url: `/pages/user/userDetail?id=${id}`
        });
        break;
    }
  },

  /**
   * 鍔犺浇鎼滅储缁撴灉
   */
  loadSearchResults: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 杩欓噷搴旇璋冪敤鏈嶅姟杩涜鎼滅储
    // 妯℃嫙鏁版嵁
    setTimeout(() => {
      const mockResults = this.generateMockResults(
        this.data.keyword, 
        this.data.activeTab, 
        this.data.page, 
        this.data.pageSize
      );
      
      this.setData({
        searchResults: [...this.data.searchResults, ...mockResults],
        loading: false,
        page: this.data.page + 1,
        hasMore: mockResults.length >= this.data.pageSize
      });
    }, 1000);
  },

  /**
   * 鐢熸垚妯℃嫙鎼滅储缁撴灉
   */
  generateMockResults: function(keyword, type, page, pageSize) {
    const allProducts = [
      { id: 1, type: 'product', title: '浼樿川鑻规灉', desc: '鏂伴矞绾㈠瘜澹嫻鏋滐紝浜у湴鐩翠緵', image: '/images/product1.jpg', price: 29.9 },
      { id: 2, type: 'product', title: '鏈夋満钄彍', desc: '鏃犲啘鑽畫鐣欙紝鍋ュ悍瀹夊叏', image: '/images/product2.jpg', price: 18.8 },
      { id: 3, type: 'product', title: '绮鹃€夌墰鑲?, desc: '婢虫床杩涘彛锛岃倝璐ㄩ矞瀚?, image: '/images/product3.jpg', price: 89.9 }
    ];
    
    const allArticles = [
      { id: 1, type: 'article', title: '濡備綍閫夋嫨鏂伴矞姘存灉', desc: '鏁欎綘鎸戦€夋按鏋滅殑灏忔妧宸?, image: '/images/article1.jpg', publishTime: '2023-06-15' },
      { id: 2, type: 'article', title: '鍋ュ悍楗鎸囧崡', desc: '钀ュ吇鍧囪　鐨勯ギ椋熷缓璁?, image: '/images/article2.jpg', publishTime: '2023-06-14' },
      { id: 3, type: 'article', title: '澶忓鍏荤敓椋熻氨', desc: '娓呭噳瑙ｆ殤鐨勭編椋熸帹鑽?, image: '/images/article3.jpg', publishTime: '2023-06-13' }
    ];
    
    const allUsers = [
      { id: 1, type: 'user', title: '缇庨杈句汉', desc: '涓撴敞鍒嗕韩缇庨鍒朵綔鎶€宸?, image: '/images/user1.jpg', fans: 1280 },
      { id: 2, type: 'user', title: '钀ュ吇涓撳', desc: '涓撲笟钀ュ吇甯堬紝鍋ュ悍楗椤鹃棶', image: '/images/user2.jpg', fans: 3560 },
      { id: 3, type: 'user', title: '鐢熸椿灏忚兘鎵?, desc: '鍒嗕韩鐢熸椿灏忓鎷?, image: '/images/user3.jpg', fans: 980 }
    ];
    
    // 鏍规嵁绫诲瀷杩囨护鏁版嵁
    let filteredResults = [];
    if (type === 'all') {
      filteredResults = [...allProducts, ...allArticles, ...allUsers];
    } else if (type === 'product') {
      filteredResults = allProducts;
    } else if (type === 'article') {
      filteredResults = allArticles;
    } else if (type === 'user') {
      filteredResults = allUsers;
    }
    
    // 妯℃嫙鍏抽敭璇嶈繃婊?    filteredResults = filteredResults.filter(item => 
      item.title.includes(keyword) || item.desc.includes(keyword)
    );
    
    // 鍒嗛〉
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredResults.slice(start, end);
  },

  /**
   * 鍔犺浇鎼滅储鍘嗗彶
   */
  loadSearchHistory: function() {
    try {
      const history = wx.getStorageSync('searchHistory') || [];
      this.setData({
        searchHistory: history.slice(0, 10) // 鍙樉绀烘渶杩?0鏉?      });
    } catch (e) {
      console.error('鍔犺浇鎼滅储鍘嗗彶澶辫触', e);
    }
  },

  /**
   * 淇濆瓨鎼滅储鍘嗗彶
   */
  saveSearchHistory: function(keyword) {
    try {
      let history = wx.getStorageSync('searchHistory') || [];
      
      // 绉婚櫎閲嶅椤?      history = history.filter(item => item !== keyword);
      
      // 娣诲姞鍒板紑澶?      history.unshift(keyword);
      
      // 鏈€澶氫繚瀛?0鏉?      history = history.slice(0, 20);
      
      wx.setStorageSync('searchHistory', history);
      this.setData({
        searchHistory: history.slice(0, 10) // 鍙樉绀烘渶杩?0鏉?      });
    } catch (e) {
      console.error('淇濆瓨鎼滅储鍘嗗彶澶辫触', e);
    }
  },

  /**
   * 鍔犺浇鐑棬鎼滅储
   */
  loadHotSearches: function() {
    // 杩欓噷搴旇璋冪敤鏈嶅姟鑾峰彇鐑棬鎼滅储
    // 妯℃嫙鏁版嵁
    setTimeout(() => {
      this.setData({
        hotSearches: [
          '鏂伴矞姘存灉', '鏈夋満钄彍', '杩涘彛鐗涜倝', '鍋ュ悍楗', '缇庨鍒朵綔',
          '钀ュ吇鎼厤', '澶忓椋熻氨', '鍏荤敓鎸囧崡', '缇庨杈句汉', '鐢熸椿鎶€宸?
        ]
      });
    }, 500);
  }
});
