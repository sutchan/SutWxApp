/**
 * 搜索结果页面
 * 显示搜索结果列表
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    keyword: '', // 搜索关键词
    searchHistory: [], // 搜索历史
    hotSearches: [], // 热门搜索
    activeTab: 'all', // 当前激活的标签：all(全部)、product(商品)、article(文章)、user(用户)
    tabs: [
      { key: 'all', value: '全部' },
      { key: 'product', value: '商品' },
      { key: 'article', value: '文章' },
      { key: 'user', value: '用户' }
    ],
    searchResults: [], // 搜索结果
    loading: false, // 加载状态
    page: 1, // 当前页码
    pageSize: 20, // 每页数量
    hasMore: true, // 是否还有更多数据
    showResult: false // 是否显示搜索结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取传入的关键词
    if (options.keyword) {
      this.setData({
        keyword: options.keyword,
        showResult: true
      }, () => {
        this.loadSearchResults();
      });
    }
    
    // 加载搜索历史和热门搜索
    this.loadSearchHistory();
    this.loadHotSearches();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.showResult && this.data.hasMore && !this.data.loading) {
      this.loadSearchResults();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `搜索"${this.data.keyword}"的结果`,
      path: `/pages/search/result/result?keyword=${this.data.keyword}`
    };
  },

  /**
   * 输入框内容变化
   */
  onInputChange: function(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  /**
   * 清空输入框
   */
  onClearInput: function() {
    this.setData({
      keyword: '',
      showResult: false,
      searchResults: []
    });
  },

  /**
   * 点击搜索按钮
   */
  onSearch: function() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    // 保存搜索历史
    this.saveSearchHistory(keyword);
    
    // 显示搜索结果
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
   * 切换标签
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
   * 点击搜索历史
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
   * 点击热门搜索
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
   * 清空搜索历史
   */
  onClearHistory: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
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
   * 点击搜索结果项
   */
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
   * 加载搜索结果
   */
  loadSearchResults: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 这里应该调用服务进行搜索
    // 模拟数据
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
   * 生成模拟搜索结果
   */
  generateMockResults: function(keyword, type, page, pageSize) {
    const allProducts = [
      { id: 1, type: 'product', title: '优质苹果', desc: '新鲜红富士苹果，产地直供', image: '/images/product1.jpg', price: 29.9 },
      { id: 2, type: 'product', title: '有机蔬菜', desc: '无农药残留，健康安全', image: '/images/product2.jpg', price: 18.8 },
      { id: 3, type: 'product', title: '精选牛肉', desc: '澳洲进口，肉质鲜嫩', image: '/images/product3.jpg', price: 89.9 }
    ];
    
    const allArticles = [
      { id: 1, type: 'article', title: '如何选择新鲜水果', desc: '教你挑选水果的小技巧', image: '/images/article1.jpg', publishTime: '2023-06-15' },
      { id: 2, type: 'article', title: '健康饮食指南', desc: '营养均衡的饮食建议', image: '/images/article2.jpg', publishTime: '2023-06-14' },
      { id: 3, type: 'article', title: '夏季养生食谱', desc: '清凉解暑的美食推荐', image: '/images/article3.jpg', publishTime: '2023-06-13' }
    ];
    
    const allUsers = [
      { id: 1, type: 'user', title: '美食达人', desc: '专注分享美食制作技巧', image: '/images/user1.jpg', fans: 1280 },
      { id: 2, type: 'user', title: '营养专家', desc: '专业营养师，健康饮食顾问', image: '/images/user2.jpg', fans: 3560 },
      { id: 3, type: 'user', title: '生活小能手', desc: '分享生活小妙招', image: '/images/user3.jpg', fans: 980 }
    ];
    
    // 根据类型过滤数据
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
    
    // 模拟关键词过滤
    filteredResults = filteredResults.filter(item => 
      item.title.includes(keyword) || item.desc.includes(keyword)
    );
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredResults.slice(start, end);
  },

  /**
   * 加载搜索历史
   */
  loadSearchHistory: function() {
    try {
      const history = wx.getStorageSync('searchHistory') || [];
      this.setData({
        searchHistory: history.slice(0, 10) // 只显示最近10条
      });
    } catch (e) {
      console.error('加载搜索历史失败', e);
    }
  },

  /**
   * 保存搜索历史
   */
  saveSearchHistory: function(keyword) {
    try {
      let history = wx.getStorageSync('searchHistory') || [];
      
      // 移除重复项
      history = history.filter(item => item !== keyword);
      
      // 添加到开头
      history.unshift(keyword);
      
      // 最多保存20条
      history = history.slice(0, 20);
      
      wx.setStorageSync('searchHistory', history);
      this.setData({
        searchHistory: history.slice(0, 10) // 只显示最近10条
      });
    } catch (e) {
      console.error('保存搜索历史失败', e);
    }
  },

  /**
   * 加载热门搜索
   */
  loadHotSearches: function() {
    // 这里应该调用服务获取热门搜索
    // 模拟数据
    setTimeout(() => {
      this.setData({
        hotSearches: [
          '新鲜水果', '有机蔬菜', '进口牛肉', '健康饮食', '美食制作',
          '营养搭配', '夏季食谱', '养生指南', '美食达人', '生活技巧'
        ]
      });
    }, 500);
  }
});