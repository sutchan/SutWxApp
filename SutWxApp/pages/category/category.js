/**
 * category.js - 分类页面逻辑处理
 * 负责加载分类数据、文章列表展示等功能
 */
Page({
  /**
   * 页面数据
   */
  data: {
    categories: [], // 分类列表
    loading: true, // 加载状态
    loadingMore: false, // 加载更多状态
    error: '', // 错误信息
    showSkeleton: true, // 是否显示骨架屏
    currentCategoryId: 0, // 当前选中的分类ID
    currentSubCategoryId: 0, // 当前选中的子分类ID
    currentCategory: null, // 当前分类对象
    articles: [], // 当前分类下的文章列表
    hasMore: true, // 是否还有更多数据
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    needRefresh: false // 是否需要刷新（从其他页面返回时）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadCategories();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 当从其他页面返回时，如果需要刷新则重新加载数据
    if (this.data.needRefresh) {
      this.setData({
        needRefresh: false,
        articles: [],
        page: 1,
        hasMore: true
      });
      this.loadCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId);
    }
  },

  /**
   * 加载分类列表
   */
  loadCategories: function() {
    const app = getApp();
    
    app.request({
      url: '/content/categories',
      method: 'GET',
      loadingText: '加载分类中',
      success: (res) => {
        if (res.code === 200) {
          const categories = res.data.categories || [];
          this.setData({
            categories: categories,
            loading: false,
            showSkeleton: false
          });
          
          // 如果有分类，默认选中第一个
          if (categories.length > 0) {
            const firstCategory = categories[0];
            this.setData({
              currentCategoryId: firstCategory.id,
              currentCategory: firstCategory
            });
            
            // 加载默认分类的文章
            this.loadCategoryArticles(firstCategory.id, 0);
          }
        } else {
          this.setData({
            error: res.message || '加载分类失败',
            loading: false,
            showSkeleton: false
          });
          wx.showToast({
            title: this.data.error,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        this.setData({
          error: err.errMsg || '网络请求失败',
          loading: false,
          showSkeleton: false
        });
        wx.showToast({
          title: this.data.error,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 切换分类
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId === this.data.currentCategoryId) return;
    
    // 查找对应的分类对象
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    this.setData({
      currentCategoryId: categoryId,
      currentSubCategoryId: 0,
      currentCategory: category,
      articles: [],
      page: 1,
      hasMore: true,
      loading: true
    });
    
    // 加载新分类的文章
    this.loadCategoryArticles(categoryId, 0);
  },

  /**
   * 切换子分类
   */
  switchSubCategory: function(e) {
    const subCategoryId = e.currentTarget.dataset.id;
    if (subCategoryId === this.data.currentSubCategoryId) return;
    
    this.setData({
      currentSubCategoryId: subCategoryId,
      articles: [],
      page: 1,
      hasMore: true,
      loading: true
    });
    
    // 加载子分类的文章
    this.loadCategoryArticles(this.data.currentCategoryId, subCategoryId);
  },

  /**
   * 加载分类下的文章
   */
  loadCategoryArticles: function(categoryId, subCategoryId) {
    const app = getApp();
    const params = {
      category_id: categoryId,
      sub_category_id: subCategoryId,
      page: this.data.page,
      page_size: this.data.pageSize
    };
    
    app.request({
      url: '/content/posts',
      method: 'GET',
      data: params,
      loadingText: '加载文章中',
      success: (res) => {
        if (res.code === 200) {
          const newArticles = res.data.posts || [];
          const total = res.data.total || 0;
          const allArticles = this.data.page === 1 ? newArticles : [...this.data.articles, ...newArticles];
          
          this.setData({
            articles: allArticles,
            hasMore: allArticles.length < total,
            loading: false,
            loadingMore: false
          });
          
          // 如果没有文章，显示提示
          if (allArticles.length === 0 && !this.data.loadingMore) {
            this.setData({ error: '该分类暂无文章' });
          } else {
            this.setData({ error: '' });
          }
        } else {
          this.setData({
            error: res.message || '加载文章失败',
            loading: false,
            loadingMore: false
          });
          wx.showToast({
            title: this.data.error,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        this.setData({
          error: err.errMsg || '网络请求失败',
          loading: false,
          loadingMore: false
        });
        wx.showToast({
          title: '加载文章失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 加载更多文章
   */
  onReachBottom: function() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      page: this.data.page + 1,
      loadingMore: true
    });
    
    this.loadCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId);
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.setData({
      articles: [],
      page: 1,
      hasMore: true,
      loading: true
    });
    
    this.loadCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId);
    
    // 停止下拉刷新动画
    wx.stopPullDownRefresh();
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    this.setData({
      error: '',
      loading: true,
      articles: [],
      page: 1,
      hasMore: true
    });
    
    this.loadCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId);
  },

  /**
   * 跳转到文章详情
   */
  goToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${articleId}`,
      events: {
        // 接收详情页返回的事件
        articleUpdated: () => {
          // 标记需要刷新
          this.setData({ needRefresh: true });
        }
      }
    });
  }
});