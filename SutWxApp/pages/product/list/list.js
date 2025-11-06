// 商品列表页面逻辑
import { showToast } from '../../../utils/global';

Page({
  data: {
    productList: [], // 商品列表数据
    loading: true, // 加载状态
    error: false, // 错误状态
    errorMsg: '', // 错误信息
    page: 1, // 当前页码
    hasMore: true, // 是否有更多数据
    categoryId: '', // 分类ID
    keyword: '', // 搜索关键词
    sort: 'default', // 排序方式
    filters: {} // 筛选条件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 从页面参数获取分类ID和关键词
    if (options.categoryId) {
      this.setData({
        categoryId: options.categoryId
      });
    }
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      });
    }
    
    this.loadProductList();
    
    // 记录页面访问事件
    app.services.analytics.trackPageView('product_list', {
      category_id: options.categoryId || 'all',
      keyword: options.keyword || ''
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时的处理
  },

  /**
   * 监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      hasMore: true,
      productList: []
    });
    this.loadProductList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProductList();
    }
  },

  /**
   * 加载商品列表数据
   */
  loadProductList: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 构建请求参数
      const params = {
        page: this.data.page,
        category_id: this.data.categoryId,
        keyword: this.data.keyword,
        sort: this.data.sort,
        ...this.data.filters
      };

      // 使用productService获取商品列表
      const result = await app.services.product.getProductList(params);
      
      this.setData({
        productList: result.products,
        hasMore: result.has_more,
        loading: false
      });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '加载失败，请重试'
      });
      showToast('获取商品列表失败', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 加载更多商品
   */
  loadMoreProductList: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      page: this.data.page + 1
    });

    try {
      // 构建请求参数
      const params = {
        page: this.data.page,
        category_id: this.data.categoryId,
        keyword: this.data.keyword,
        sort: this.data.sort,
        ...this.data.filters
      };

      // 使用productService获取更多商品
      const result = await app.services.product.getProductList(params);
      
      this.setData({
        productList: this.data.productList.concat(result.products),
        hasMore: result.has_more,
        loading: false
      });
    } catch (error) {
      console.error('加载更多商品失败:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '加载更多失败，请重试'
      });
      showToast('加载更多失败', 'none');
    }
  },

  /**
   * 点击商品进入详情页
   */
  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 记录点击事件
    app.services.analytics.trackEvent('product_click', {
      product_id: productId
    });
    
    wx.navigateTo({
      url: '/pages/product/detail/detail?id=' + productId
    });
  },

  /**
   * 搜索商品
   */
  onSearch: function(e) {
    const app = getApp();
    const keyword = e.detail.value || '';
    
    // 记录搜索事件
    app.services.analytics.trackEvent('product_search', {
      keyword: keyword
    });
    
    this.setData({
      keyword: keyword,
      page: 1,
      productList: [],
      hasMore: true
    });
    this.loadProductList();
  },

  /**
   * 切换排序方式
   */
  onChangeSort: function(e) {
    const app = getApp();
    const sort = e.currentTarget.dataset.sort;
    
    // 记录排序事件
    app.services.analytics.trackEvent('product_sort_change', {
      sort: sort
    });
    
    this.setData({
      sort: sort,
      page: 1,
      productList: [],
      hasMore: true
    });
    this.loadProductList();
  },

  /**
   * 打开筛选面板
   */
  openFilterPanel: function() {
    const app = getApp();
    
    // 筛选面板逻辑
    wx.showActionSheet({
      itemList: ['价格从低到高', '价格从高到低', '销量优先', '最新上架'],
      success: (res) => {
        const sortOptions = ['price_asc', 'price_desc', 'sales', 'newest'];
        const selectedSort = sortOptions[res.tapIndex];
        
        // 记录筛选事件
        app.services.analytics.trackEvent('product_filter_change', {
          sort: selectedSort
        });
        
        this.setData({
          sort: selectedSort,
          page: 1,
          productList: [],
          hasMore: true
        });
        this.loadProductList();
      }
    });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    this.loadProductList();
  }
});