/**
 * 用户收藏页面
 * 展示用户收藏的文章列表，支持取消收藏和跳转到文章详情
 */
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    favorites: [], // 收藏列表数据
    loading: false, // 加载状态
    refreshing: false, // 下拉刷新状态
    error: null, // 错误信息
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10 // 每页数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'favorites'
    });
    
    // 加载收藏数据
    this.loadFavorites();
  },

  /**
   * 生命周期函数--监听页面显示
   * 每次显示页面时刷新数据
   */
  onShow: function() {
    // 检查是否需要刷新
    if (this.data.hasDataChanged) {
      this.setData({
        hasDataChanged: false,
        page: 1,
        hasMore: true
      });
      this.loadFavorites(true);
    }
  },

  /**
   * 加载收藏数据
   * @param {boolean} refresh - 是否为刷新操作
   */
  async loadFavorites(refresh = false) {
    try {
      // 如果是刷新，重置页码
      if (refresh) {
        this.setData({
          refreshing: true,
          page: 1,
          hasMore: true,
          error: null
        });
      } else {
        // 如果不是刷新且已经没有更多数据，不执行加载
        if (!this.data.hasMore || this.data.loading) {
          return;
        }
        
        this.setData({
          loading: true,
          error: null
        });
      }

      // 使用favoriteService获取收藏列表
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      };
      const result = await app.services.favorite.getFavoriteList(params);
      
      const newItems = result.items || [];
      const favoritesList = refresh ? newItems : [...this.data.favorites, ...newItems];
      
      this.setData({
        favorites: favoritesList,
        hasMore: favoritesList.length < result.total || false,
        page: this.data.page + 1
      });
    } catch (err) {
      this.handleError(err);
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
      // 停止下拉刷新
      if (refresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  /**
   * 处理错误
   * @param {Object} error - 错误对象
   */
  handleError(error) {
    let errorMessage = '获取收藏列表失败';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.errMsg) {
      errorMessage = error.errMsg;
    }
    
    this.setData({
      error: errorMessage
    });
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    // 记录重试加载事件
    app.analyticsService.track('retry_loading', {
      page: 'favorites'
    });
    
    this.loadFavorites(true);
  },

  /**
   * 取消收藏
   * @param {Object} e - 事件对象
   */
  cancelFavorite(e) {
    const favoriteId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const articleId = e.currentTarget.dataset.articleId;
    
    // 显示确认对话框
    wx.showModal({
      title: '确认取消收藏',
      content: '确定要取消收藏这篇文章吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 乐观UI更新
            const updatedFavorites = [...this.data.favorites];
            updatedFavorites.splice(index, 1);
            
            this.setData({
              favorites: updatedFavorites
            });
            
            // 记录取消收藏事件
            app.analyticsService.track('favorite_removed', {
              favorite_id: favoriteId,
              article_id: articleId
            });
            
            // 使用favoriteService取消收藏
            await app.services.favorite.removeFavorite(favoriteId);
            
            this.setData({
              hasDataChanged: true
            });
            
            showToast('取消收藏成功', 'success');
          } catch (err) {
            // 失败时回滚UI
            this.loadFavorites(true);
            showToast(err.message || '取消收藏失败，请重试', 'none');
          }
        }
      }
    });
  },

  /**
   * 跳转到文章详情
   * @param {Object} e - 事件对象
   */
  navigateToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.articleId;
    
    // 记录文章点击事件
    app.analyticsService.track('favorite_article_clicked', {
      article_id: articleId
    });
    
    wx.navigateTo({
      url: `/pages/article/detail?id=${articleId}`
    });
  },

  /**
   * 加载更多
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFavorites();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.loadFavorites(true);
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function() {
    this.loadMore();
  }
});