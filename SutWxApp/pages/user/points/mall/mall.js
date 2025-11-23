// 积分商城页面
const pointsService = require('../../../services/pointsService.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户积分信息
    userPoints: 0,
    
    // 商品分类
    categories: [
      { id: 0, name: '全部', count: 0 },
      { id: 1, name: '优惠券', count: 0 },
      { id: 2, name: '实物商品', count: 0 },
      { id: 3, name: '虚拟商品', count: 0 },
      { id: 4, name: '会员特权', count: 0 }
    ],
    currentCategory: 0,
    
    // 排序方式
    sortOptions: [
      { key: 'default', name: '综合排序' },
      { key: 'points_asc', name: '积分从低到高' },
      { key: 'points_desc', name: '积分从高到低' },
      { key: 'popularity', name: '热门优先' }
    ],
    currentSort: 'default',
    showSortPopup: false,
    
    // 商品列表
    productList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 搜索关键词
    searchKeyword: '',
    
    // 兑换记录
    exchangeRecords: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载用户积分
    this.loadUserPoints();
    
    // 加载商品列表
    this.loadProductList(true);
    
    // 加载兑换记录
    this.loadExchangeRecords();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '积分商城'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时刷新用户积分
    this.loadUserPoints();
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
    this.loadUserPoints().then(() => {
      this.loadProductList(true).then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProductList(false);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '积分好礼等你来换',
      path: '/pages/user/points/mall/mall'
    };
  },

  /**
   * 加载用户积分
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
      console.error('加载用户积分失败:', error);
    }
  },

  /**
   * 加载商品列表
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
        
        // 更新分类计数
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
          title: result.message || '加载商品失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载商品列表失败:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 加载兑换记录
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
      console.error('加载兑换记录失败:', error);
    }
  },

  /**
   * 切换商品分类
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
   * 显示排序弹窗
   */
  showSortPopup: function() {
    this.setData({
      showSortPopup: true
    });
  },

  /**
   * 隐藏排序弹窗
   */
  hideSortPopup: function() {
    this.setData({
      showSortPopup: false
    });
  },

  /**
   * 选择排序方式
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
   * 输入搜索关键词
   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 执行搜索
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
   * 清空搜索
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
   * 跳转到商品详情页
   */
  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points/productDetail/productDetail?id=${productId}`
    });
  },

  /**
   * 兑换商品
   */
  exchangeProduct: async function(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.productList.find(item => item.id === productId);
    
    if (!product) return;
    
    // 检查积分是否足够
    if (this.data.userPoints < product.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '正在兑换...',
      });
      
      const result = await pointsService.exchangeProduct(productId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '兑换成功',
          icon: 'success'
        });
        
        // 刷新用户积分
        this.loadUserPoints();
        
        // 刷新商品列表
        this.loadProductList(true);
        
        // 刷新兑换记录
        this.loadExchangeRecords();
      } else {
        wx.showToast({
          title: result.message || '兑换失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('兑换商品失败:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 跳转到积分页面
   */
  goToPoints: function() {
    wx.switchTab({
      url: '/pages/user/points/points'
    });
  },

  /**
   * 跳转到兑换记录页面
   */
  goToExchangeRecords: function() {
    wx.navigateTo({
      url: '/pages/user/points/exchangeRecords/exchangeRecords'
    });
  }
});