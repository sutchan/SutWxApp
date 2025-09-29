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
    currentCategoryId: 0, // 当前选中的分类ID
    currentSubCategoryId: 0, // 当前选中的子分类ID
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
    this.getCategories();
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
      this.getArticlesByCategory(this.data.currentCategoryId, this.data.currentSubCategoryId);
    }
  },

  /**
   * 获取分类列表
   */
  getCategories: function() {
    const app = getApp();
    
    app.request({
      url: '/categories',
      method: 'GET',
      loadingText: '加载分类中',
      success: (res) => {
        if (res.code === 0) {
          const categories = res.data;
          this.setData({
            categories: categories,
            loading: false
          });
          
          // 如果有分类，默认选中第一个分类
          if (categories && categories.length > 0) {
            this.setData({
              currentCategoryId: categories[0].id
            });
            // 如果第一个分类有子分类，默认选中第一个子分类
            if (categories[0].children && categories[0].children.length > 0) {
              this.setData({
                currentSubCategoryId: categories[0].children[0].id
              });
              this.getArticlesByCategory(categories[0].id, categories[0].children[0].id);
            } else {
              this.getArticlesByCategory(categories[0].id, 0);
            }
          }
        } else {
          wx.showToast({
            title: res.message || '获取分类失败',
            icon: 'none',
            duration: 2000
          });
          this.setData({
            loading: false
          });
        }
      },
      fail: (error) => {
        console.error('获取分类列表失败:', error);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        this.setData({
          loading: false
        });
      }
    });
  },

  /**
   * 根据分类获取文章列表
   * @param {number} categoryId - 分类ID
   * @param {number} subCategoryId - 子分类ID
   */
  getArticlesByCategory: function(categoryId, subCategoryId) {
    if (!this.data.hasMore) return;

    const app = getApp();
    
    const params = {
      category_id: categoryId,
      page: this.data.page,
      page_size: this.data.pageSize
    };

    // 如果有子分类，添加子分类参数
    if (subCategoryId && subCategoryId > 0) {
      params.sub_category_id = subCategoryId;
    }

    app.request({
      url: '/articles/category',
      method: 'GET',
      data: params,
      loadingText: '加载文章中',
      success: (res) => {
        if (res.code === 0) {
          const articles = res.data.list || [];
          const total = res.data.total || 0;
          
          // 如果是第一页，则替换文章列表；否则追加
          if (this.data.page === 1) {
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
            hasMore: this.data.articles.length < total
          });
          
          // 如果没有数据，显示提示
          if (articles.length === 0 && this.data.page === 1) {
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
        }
      },
      fail: (error) => {
        console.error('获取文章列表失败:', error);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
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
    
    this.setData({
      currentCategoryId: categoryId,
      currentSubCategoryId: category && category.children && category.children.length > 0 ? category.children[0].id : 0,
      articles: [],
      page: 1,
      hasMore: true
    });
    
    this.getArticlesByCategory(categoryId, this.data.currentSubCategoryId);
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
    
    this.getArticlesByCategory(this.data.currentCategoryId, subCategoryId);
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      });
      this.getArticlesByCategory(this.data.currentCategoryId, this.data.currentSubCategoryId);
    } else if (this.data.articles.length > 0) {
      wx.showToast({
        title: '没有更多文章了',
        icon: 'none',
        duration: 1500
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      articles: [],
      page: 1,
      hasMore: true
    });
    this.getArticlesByCategory(this.data.currentCategoryId, this.data.currentSubCategoryId);
  }
});