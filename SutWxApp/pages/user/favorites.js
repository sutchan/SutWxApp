/**
 * 收藏列表页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0, // 当前激活的标签 0:商品 1:文章
    tabs: ['商品', '文章'],
    productFavorites: [], // 商品收藏列表
    articleFavorites: [], // 文章收藏列表
    loading: false, // 加载状态
    hasMore: {
      product: true, // 商品是否还有更多数据
      article: true  // 文章是否还有更多数据
    },
    page: {
      product: 1, // 商品当前页码
      article: 1  // 文章当前页码
    },
    pageSize: 10, // 每页数量
    isEmpty: {
      product: false, // 商品收藏是否为空
      article: false  // 文章收藏是否为空
    },
    editMode: false, // 是否处于编辑模式
    selectedItems: {
      product: [], // 选中的商品
      article: []  // 选中的文章
    },
    selectAll: {
      product: false, // 商品是否全选
      article: false  // 文章是否全选
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载收藏列表
    this.loadFavorites();
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
    // 页面显示时刷新数据
    this.refreshFavorites();
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
    this.refreshFavorites();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 加载更多数据
    if (this.data.hasMore[this.data.activeTab === 0 ? 'product' : 'article'] && !this.data.loading) {
      this.loadMoreFavorites();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 切换标签
   */
  onTabChange: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index,
      editMode: false // 切换标签时退出编辑模式
    });
    
    // 如果该标签还没有数据，则加载数据
    const tabType = index === 0 ? 'product' : 'article';
    if (this.data[`${tabType}Favorites`].length === 0 && !this.data.isEmpty[tabType]) {
      this.loadFavorites();
    }
  },

  /**
   * 刷新收藏列表
   */
  refreshFavorites: function() {
    // 重置数据
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
    
    // 加载数据
    this.loadFavorites();
  },

  /**
   * 加载收藏列表
   */
  loadFavorites: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const page = this.data.page[tabType];
    const pageSize = this.data.pageSize;
    
    this.setData({ loading: true });
    
    // 模拟API请求
    setTimeout(() => {
      // 模拟数据
      const mockData = tabType === 'product' ? this.generateMockProducts(page, pageSize) : this.generateMockArticles(page, pageSize);
      
      // 更新数据
      this.setData({
        [`${tabType}Favorites`]: this.data[`${tabType}Favorites`].concat(mockData.list),
        [`hasMore.${tabType}`]: mockData.hasMore,
        [`isEmpty.${tabType}`]: this.data[`${tabType}Favorites`].length === 0 && mockData.list.length === 0,
        loading: false
      });
      
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    }, 500);
  },

  /**
   * 加载更多收藏
   */
  loadMoreFavorites: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      [`page.${tabType}`]: this.data.page[tabType] + 1
    });
    this.loadFavorites();
  },

  /**
   * 生成模拟商品数据
   */
  generateMockProducts: function(page, pageSize) {
    const products = [];
    const total = 25; // 总共25条数据
    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    
    for (let i = start; i < end; i++) {
      products.push({
        id: `product_${i + 1}`,
        name: `精选商品 ${i + 1}`,
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
   * 生成模拟文章数据
   */
  generateMockArticles: function(page, pageSize) {
    const articles = [];
    const total = 20; // 总共20条数据
    
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    
    for (let i = start; i < end; i++) {
      articles.push({
        id: `article_${i + 1}`,
        title: `热门文章标题 ${i + 1}`,
        summary: `这是文章${i + 1}的简介内容，介绍了相关知识和技巧...`,
        image: `/images/article/article${(i % 4) + 1}.jpg`,
        author: `作者${(i % 3) + 1}`,
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
   * 格式化时间
   */
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  },

  /**
   * 进入编辑模式
   */
  onEditMode: function() {
    this.setData({
      editMode: true
    });
  },

  /**
   * 退出编辑模式
   */
  onCancelEdit: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    this.setData({
      editMode: false,
      [`selectedItems.${tabType}`]: [],
      [`selectAll.${tabType}`]: false
    });
  },

  /**
   * 选择/取消选择项目
   */
  onSelectItem: function(e) {
    const { id, type } = e.currentTarget.dataset;
    const tabType = type === 'product' ? 'product' : 'article';
    const selectedItems = this.data.selectedItems[tabType];
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      // 取消选择
      selectedItems.splice(index, 1);
    } else {
      // 添加选择
      selectedItems.push(id);
    }
    
    this.setData({
      [`selectedItems.${tabType}`]: selectedItems,
      [`selectAll.${tabType}`]: selectedItems.length === this.data[`${tabType}Favorites`].length
    });
  },

  /**
   * 全选/取消全选
   */
  onSelectAll: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const selectAll = !this.data.selectAll[tabType];
    
    this.setData({
      [`selectAll.${tabType}`]: selectAll,
      [`selectedItems.${tabType}`]: selectAll ? this.data[`${tabType}Favorites`].map(item => item.id) : []
    });
  },

  /**
   * 删除选中的收藏
   */
  onDeleteSelected: function() {
    const tabType = this.data.activeTab === 0 ? 'product' : 'article';
    const selectedItems = this.data.selectedItems[tabType];
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要删除的项目',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的${selectedItems.length}个收藏吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从列表中移除选中的项目
          const favorites = this.data[`${tabType}Favorites`].filter(item => !selectedItems.includes(item.id));
          
          this.setData({
            [`${tabType}Favorites`]: favorites,
            [`selectedItems.${tabType}`]: [],
            [`selectAll.${tabType}`]: false,
            editMode: false
          });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 跳转到商品详情
   */
  onProductTap: function(e) {
    if (this.data.editMode) return;
    
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 跳转到文章详情
   */
  onArticleTap: function(e) {
    if (this.data.editMode) return;
    
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${id}`
    });
  }
});