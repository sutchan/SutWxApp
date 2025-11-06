// pages/category/category.js
/**
 * 分类页面 - 展示文章分类列表及各分类下的文章内容
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categories: [], // 分类列表
    loading: true, // 加载状态
    loadingMore: false, // 加载更多状态
    error: '', // 错误信息
    showSkeleton: true, // 是否显示骨架屏
    currentCategoryId: 0, // 当前选中的分类ID
    currentSubCategoryId: 0, // 当前选中的子分类ID
    currentCategory: null, // 当前选中的分类对象
    articles: [], // 当前分类下的文章列表
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    needRefresh: false // 是否需要刷新数据（从其他页面返回时）
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
    // 如果从其他页面返回，可以重新加载数据
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
            showSkeleton: false,
            error: ''
          });
          
          // 如果有分类，默认选中第一个分类
          if (categories && categories.length > 0) {
            const firstCategory = categories[0];
            this.setData({
              currentCategoryId: firstCategory.id,
              currentCategory: firstCategory
            });
            // 如果第一个分类有子分类，默认选中第一个子分类
            if (firstCategory.children && firstCategory.children.length > 0) {
              this.setData({
                currentSubCategoryId: firstCategory.children[0].id
              });
              this.loadCategoryArticles(firstCategory.id, firstCategory.children[0].id);
            } else {
              this.loadCategoryArticles(firstCategory.id, 0);
            }
          }
        } else {
          const errorMsg = res.message || '获取分类失败';
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          this.setData({
            loading: false,
            showSkeleton: false,
            error: errorMsg
          });
        }
      },
      fail: (error) => {
        console.error('获取分类列表失败:', error);
        const errorMsg = '网络错误，请重试';
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
        
        // 记录错误信息，包含系统环境
        const systemInfo = this._getSystemInfo();
        console.error('分类页面加载失败详情:', {
          error: error,
          system: {
            platform: systemInfo.platform,
            version: systemInfo.version
          }
        });
        
        this.setData({
          loading: false,
          showSkeleton: false,
          error: errorMsg
        });
      }
    });
  },
  
  /**
   * 加载分类文章
   */
  loadCategoryArticles: function(categoryId, subCategoryId) {
    this.setData({
      articles: [],
      page: 1,
      hasMore: true,
      loadingMore: false
    });
    this.getCategoryArticles(categoryId, subCategoryId, 1);
  },
  
  /**
   * 获取系统信息，用于调试和错误跟踪
   * @private
   */
  _getSystemInfo: function() {
    try {
      return wx.getSystemInfoSync();
    } catch (e) {
      console.error('获取系统信息失败:', e);
      return {};
    }
  },

  /**
   * 获取分类文章列表
   * @param {number} categoryId - 分类ID
   * @param {number} subCategoryId - 子分类ID
   * @param {number} page - 页码
   */
  getCategoryArticles: function(categoryId, subCategoryId, page) {
    if (!this.data.hasMore && page > 1) return;

    const app = getApp();
    
    const params = {
      category: categoryId,
      page: page,
      per_page: this.data.pageSize,
      orderby: 'date',
      order: 'desc'
    };

    // 如果有子分类，添加子分类参数
    if (subCategoryId && subCategoryId > 0) {
      // 注意：根据API文档，这里可能需要特殊处理子分类，可能需要调整参数名
      params.sub_category = subCategoryId;
    }

    app.request({
      url: '/content/posts',
      method: 'GET',
      data: params,
      loadingText: '加载文章中',
      success: (res) => {
        if (res.code === 200) {
          const articles = res.data.posts || [];
          const total = res.data.total || 0;
          const pages = res.data.pages || 1;
          
          // 如果是第一页，则替换文章列表；否则追加
          if (page === 1) {
            this.setData({
              articles: articles
            });
          } else {
            this.setData({
              articles: [...this.data.articles, ...articles]
            });
          }
          
          // 判断是否还有更多数据
          this.setData({
            hasMore: page < pages,
            page: page + 1,
            loadingMore: false
          });
          
          // 如果没有数据，显示提示
          if (articles.length === 0 && page === 1) {
            wx.showToast({
              title: '当前分类暂无文章',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: res.message || '获取文章失败',
            icon: 'none',
            duration: 2000
          });
          this.setData({
            loadingMore: false
          });
        }
      },
      fail: (error) => {
        console.error('获取文章列表失败:', error);
        
        // 加载更多时的错误处理不同于初始加载
        if (page > 1) {
          // 加载更多失败，不显示全局错误，但显示toast提示
          wx.showToast({
            title: '加载更多失败，请重试',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 初始加载失败，显示错误提示
          wx.showToast({
            title: '加载文章失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
        
        this.setData({
          loadingMore: false
        });
      },
      complete: () => {
        // 确保下拉刷新停止
        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 切换分类
   * @param {Object} e - 事件对象
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId === this.data.currentCategoryId) return; // 防止重复点击
    
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (category) {
      this.setData({
        currentCategoryId: categoryId,
        currentCategory: category,
        currentSubCategoryId: category.children && category.children.length > 0 ? category.children[0].id : 0,
        articles: [],
        page: 1,
        hasMore: true
      });
      
      this.loadCategoryArticles(categoryId, this.data.currentSubCategoryId);
    }
  },

  /**
   * 切换子分类
   * @param {Object} e - 事件对象
   */
  switchSubCategory: function(e) {
    const subCategoryId = e.currentTarget.dataset.id;
    if (subCategoryId === this.data.currentSubCategoryId) return; // 防止重复点击
    
    this.setData({
      currentSubCategoryId: subCategoryId,
      articles: [],
      page: 1,
      hasMore: true
    });
    
    this.loadCategoryArticles(this.data.currentCategoryId, subCategoryId);
  },

  /**
   * 跳转到文章详情页
   * @param {Object} e - 事件对象
   */
  goToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.id;
    if (!articleId) {
      wx.showToast({
        title: '文章ID不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/article/detail/detail?id=' + articleId,
      fail: function() {
        wx.showToast({
          title: '跳转文章详情失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 加载更多文章
   */
  loadMoreArticles: function() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({
      loadingMore: true
    });
    
    const nextPage = this.data.page;
    this.getCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId, nextPage);
  },
  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.loadMoreArticles();
  },

  /**
   * 页面下拉刷新事件的处理函数
   */
  onPullDownRefresh: function() {
    this.setData({
      showSkeleton: true,
      error: ''
    });
    this.loadCategories();
    wx.stopPullDownRefresh();
  },
  
  /**
   * 重试加载数据
   */
  onRetry: function() {
    this.setData({
      loading: true,
      showSkeleton: true,
      error: ''
    });
    this.loadCategories();
  }
});