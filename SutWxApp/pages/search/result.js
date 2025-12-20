/**
 * 文件名 result.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 描述: 閹兼粎鍌ㄧ紒鎾寸亯妞ょ敻娼? */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    keyword: '', // 閹兼粎鍌ㄩ崗鎶芥暛鐠?    searchHistory: [], // 閹兼粎鍌ㄩ崢鍡楀蕉
    hotSearches: [], // 閻戭參妫幖婊呭偍
    activeTab: 'all', // 注释
    tabs: [
      { key: 'all', value: '閸忋劑鍎? },
      { key: 'product', value: '閸熷棗鎼? },
      { key: 'article', value: '閺傚洨鐝? },
      { key: 'user', value: '閻劍鍩? }
    ],
    searchResults: [], // 閹兼粎鍌ㄧ紒鎾寸亯
    loading: false, // 加载状态   page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 20, // 濮ｅ繘銆夐弫浼村櫤
    hasMore: true, // 閺勵垰鎯佹潻妯绘箒閺囨潙顦块弫鐗堝祦
    showResult: false // 閺勵垰鎯侀弰鍓с仛閹兼粎鍌ㄧ紒鎾寸亯
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    // 閼惧嘲褰囨导状态插弳閻ㄥ嫬鍙ч柨顔跨槤
    if (options.keyword) {
      this.setData({
        keyword: options.keyword,
        showResult: true
      }, () => {
        this.loadSearchResults();
      });
    }
    
    // 閸旂姾娴囬幖婊呭偍閸樺棗褰堕崪宀€鍎归梻銊︽偝缁?    this.loadSearchHistory();
    this.loadHotSearches();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    
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
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (this.data.showResult && this.data.hasMore && !this.data.loading) {
      this.loadSearchResults();
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {
    return {
      title: `閹兼粎鍌?${this.data.keyword}"閻ㄥ嫮绮ㄩ弸娓€,
      path: `/pages/search/result/result?keyword=${this.data.keyword}`
    };
  },

  /**
   * 鏉堟挸鍙嗗鍡楀敶鐎圭懓褰夐崠?   */
  onInputChange: function(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  /**
   * 濞撳懐鈹栨潏鎾冲弳濡?   */
  onClearInput: function() {
    this.setData({
      keyword: '',
      showResult: false,
      searchResults: []
    });
  },

  /**
   * 閻愮懓鍤幖婊呭偍閹稿鎸?   */
  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '鐠囩柉绶崗銉︽偝缁便垹鍙ч柨顔跨槤',
        icon: 'none'
      });
      return;
    }
    
    // 娣囨繂鐡ㄩ幖婊呭偍閸樺棗褰?    this.saveSearchHistory(keyword);
    
    // 閺勫墽銇氶幖婊呭偍缂佹挻鐏?    this.setData({
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
   * 閸掑洦宕查弽鍥╊劮
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
   * 閻愮懓鍤幖婊呭偍閸樺棗褰?   */
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
   * 閻愮懓鍤悜顓㈡，閹兼粎鍌?   */
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
   * 濞撳懐鈹栭幖婊呭偍閸樺棗褰?   */
  onClearHistory: function() {
    wx.showModal({
      title: '閹绘劗銇?,
      content: '绾喖鐣剧憰浣圭缁岀儤鎮崇槐銏犲坊閸欐彃鎮ч敍?,
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
   * 閻愮懓鍤幖婊呭偍缂佹挻鐏夋い?   */
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
   * 閸旂姾娴囬幖婊呭偍缂佹挻鐏?   */
  loadSearchResults: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ら張宥呭鏉╂稖顢戦幖婊呭偍
    // 濡剝瀚欓弫鐗堝祦
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
   * 閻㈢喐鍨氬Ο鈩冨珯閹兼粎鍌ㄧ紒鎾寸亯
   */
  generateMockResults: function(keyword, type, page, pageSize) {
    const allProducts = [
      { id: 1, type: 'product', title: '娴兼宸濋懟瑙勭亯', desc: '閺備即鐭炵痪銏犵槣婢诡偉瀚婚弸婊愮礉娴溠冩勾閻╃繝绶?, image: '/images/product1.jpg', price: 29.9 },
      { id: 2, type: 'product', title: '閺堝婧€閽勵剝褰?, desc: '閺冪姴鍟橀懡顖涚暙閻ｆ瑱绱濋崑銉ユ倣鐎瑰鍙?, image: '/images/product2.jpg', price: 18.8 },
      { id: 3, type: 'product', title: '缁箖鈧澧伴懖?, desc: '濠㈣櫕搴婃潻娑樺經閿涘矁鍊濈拹銊╃煘鐎?, image: '/images/product3.jpg', price: 89.9 }
    ];
    
    const allArticles = [
      { id: 1, type: 'article', title: '婵″倷缍嶉柅澶嬪閺備即鐭炲瀛樼亯', desc: '閺佹瑤缍橀幐鎴︹偓澶嬫寜閺嬫粎娈戠亸蹇斿Η瀹?, image: '/images/article1.jpg', publishTime: '2023-06-15' },
      { id: 2, type: 'article', title: '閸嬨儱鎮嶆顕€顥ら幐鍥у础', desc: '閽€銉ュ悋閸у洩銆€閻ㄥ嫰銈鐔风紦鐠?, image: '/images/article2.jpg', publishTime: '2023-06-14' },
      { id: 3, type: 'article', title: '婢跺繐顒滈崗鑽ゆ晸妞嬬喕姘?, desc: '濞撳懎鍣崇憴锝嗘閻ㄥ嫮绶ㄦ鐔稿腹閼?, image: '/images/article3.jpg', publishTime: '2023-06-13' }
    ];
    
    const allUsers = [
      { id: 1, type: 'user', title: '缂囧酣顥ゆ潏鍙ユ眽', desc: '娑撴挻鏁為崚鍡曢煩缂囧酣顥ら崚鏈电稊閹垛偓瀹?, image: '/images/user1.jpg', fans: 1280 },
      { id: 2, type: 'user', title: '閽€銉ュ悋娑撴挸顔?, desc: '娑撴挷绗熼拃銉ュ悋鐢牞绱濋崑銉ユ倣妤楊噣顥ゆい楣冩６', image: '/images/user2.jpg', fans: 3560 },
      { id: 3, type: 'user', title: '閻㈢喐妞跨亸蹇氬厴閹?, desc: '閸掑棔闊╅悽鐔告た鐏忓繐顩鹃幏?, image: '/images/user3.jpg', fans: 980 }
    ];
    
    // 閺嶈宓佺猾璇茬€锋潻鍥ㄦ姢閺佺増宓?    let filteredResults = [];
    if (type === 'all') {
      filteredResults = [...allProducts, ...allArticles, ...allUsers];
    } else if (type === 'product') {
      filteredResults = allProducts;
    } else if (type === 'article') {
      filteredResults = allArticles;
    } else if (type === 'user') {
      filteredResults = allUsers;
    }
    
    // 濡剝瀚欓崗鎶芥暛鐠囧秷绻冨?    filteredResults = filteredResults.filter(item => 
      item.title.includes(keyword) || item.desc.includes(keyword)
    );
    
    // 閸掑棝銆?    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredResults.slice(start, end);
  },

  /**
   * 閸旂姾娴囬幖婊呭偍閸樺棗褰?   */
  loadSearchHistory: function() {
    try {
      const history = wx.getStorageSync('searchHistory') || [];
      this.setData({
        searchHistory: history.slice(0, 10) // 閸欘亝妯夌粈鐑樻付鏉?0閺?      });
    } catch (e) {
      console.error('閸旂姾娴囬幖婊呭偍閸樺棗褰舵径杈Е', e);
    }
  },

  /**
   * 娣囨繂鐡ㄩ幖婊呭偍閸樺棗褰?   */
  saveSearchHistory: function(keyword) {
    try {
      let history = wx.getStorageSync('searchHistory') || [];
      
      // 缁夊娅庨柌宥咁槻妞?      history = history.filter(item => item !== keyword);
      
      // 濞ｈ濮為崚鏉跨磻婢?      history.unshift(keyword);
      
      // 閺堚偓婢舵矮绻氱€?0閺?      history = history.slice(0, 20);
      
      wx.setStorageSync('searchHistory', history);
      this.setData({
        searchHistory: history.slice(0, 10) // 閸欘亝妯夌粈鐑樻付鏉?0閺?      });
    } catch (e) {
      console.error('娣囨繂鐡ㄩ幖婊呭偍閸樺棗褰舵径杈Е', e);
    }
  },

  /**
   * 閸旂姾娴囬悜顓㈡，閹兼粎鍌?   */
  loadHotSearches: function() {
    // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ら張宥呭閼惧嘲褰囬悜顓㈡，閹兼粎鍌?    // 濡剝瀚欓弫鐗堝祦
    setTimeout(() => {
      this.setData({
        hotSearches: [
          '閺備即鐭炲瀛樼亯', '閺堝婧€閽勵剝褰?, '鏉╂稑褰涢悧娑滃€?, '閸嬨儱鎮嶆顕€顥?, '缂囧酣顥ら崚鏈电稊',
          '閽€銉ュ悋閹碱參鍘?, '婢跺繐顒滄鐔绘皑', '閸忚崵鏁撻幐鍥у础', '缂囧酣顥ゆ潏鍙ユ眽', '閻㈢喐妞块幎鈧?
        ]
      });
    }, 500);
  }
});
