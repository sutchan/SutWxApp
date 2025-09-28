// pages/category/category.js
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
    pageSize: 10 // 每页数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCategories();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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
    wx.request({
      url: getApp().globalData.apiBaseUrl + '/categories',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const categories = res.data.data;
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
            title: '获取分类失败',
            icon: 'none'
          });
          this.setData({
            loading: false
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.setData({
          loading: false
        });
      }
    });
  },

  /**
   * 根据分类获取文章列表
   */
  getArticlesByCategory: function(categoryId, subCategoryId) {
    if (!this.data.hasMore) return;

    wx.showLoading({
      title: '加载中',
    });

    const params = {
      category_id: categoryId,
      page: this.data.page,
      page_size: this.data.pageSize
    };

    // 如果有子分类，添加子分类参数
    if (subCategoryId && subCategoryId > 0) {
      params.sub_category_id = subCategoryId;
    }

    wx.request({
      url: getApp().globalData.apiBaseUrl + '/articles/category',
      method: 'GET',
      data: params,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.code === 0) {
          const articles = res.data.data.list;
          const total = res.data.data.total;
          
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
        } else {
          wx.showToast({
            title: '获取文章失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 切换分类
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
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
   */
  switchSubCategory: function(e) {
    const subCategoryId = e.currentTarget.dataset.id;
    
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
   */
  goToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/article/detail/detail?id=' + articleId
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      });
      this.getArticlesByCategory(this.data.currentCategoryId, this.data.currentSubCategoryId);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      articles: [],
      page: 1,
      hasMore: true
    });
    this.getArticlesByCategory(this.data.currentCategoryId, this.data.currentSubCategoryId);
    wx.stopPullDownRefresh();
  }
})