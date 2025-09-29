// pages/index/index.js
/**
 * 首页页面 - 展示轮播图、分类导航和文章列表
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    latestPosts: [], // 最新文章列表
    hotPosts: [], // 热门文章列表
    categories: [], // 分类数据
    currentPage: 1, // 当前页码
    hasMore: true, // 是否有更多数据
    loading: false, // 加载状态
    refreshing: false // 下拉刷新状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 初始化页面数据
    this.loadAllData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时，如果有更新需要刷新数据
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 下拉刷新时重置数据并重新加载
    this.setData({
      refreshing: true,
      currentPage: 1,
      hasMore: true,
      latestPosts: []
    });
    
    this.loadAllData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 上拉触底加载更多
    if (!this.data.loading && this.data.hasMore) {
      this.loadMorePosts();
    }
  },

  /**
   * 加载所有页面数据
   */
  loadAllData: function() {
    this.getBannerList();
    this.getLatestPosts();
    this.getHotPosts();
    this.getCategories();
  },

  /**
   * 获取轮播图列表
   */
  getBannerList: function() {
    const app = getApp();
    app.request({
      url: '/banners',
      method: 'GET',
      hideLoading: true,
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            bannerList: res.data || []
          });
        } else {
          wx.showToast({
            title: res.message || '获取轮播图失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        console.error('获取轮播图失败');
        wx.showToast({
          title: '获取轮播图失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 获取最新文章列表
   */
  getLatestPosts: function() {
    const app = getApp();
    this.setData({
      loading: true
    });
    
    app.request({
      url: '/posts/latest',
      method: 'GET',
      data: {
        page: 1,
        per_page: 10
      },
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            latestPosts: res.data.list || [],
            currentPage: 2,
            hasMore: res.data.list && res.data.list.length >= 10
          });
        } else {
          wx.showToast({
            title: res.message || '获取最新文章失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        console.error('获取最新文章失败');
        wx.showToast({
          title: '获取最新文章失败',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({
          loading: false,
          refreshing: false
        });
        
        if (this.data.refreshing) {
          wx.stopPullDownRefresh();
        }
      }
    });
  },

  /**
   * 加载更多文章
   */
  loadMorePosts: function() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }
    
    const app = getApp();
    this.setData({
      loading: true
    });
    
    app.request({
      url: '/posts/latest',
      method: 'GET',
      data: {
        page: this.data.currentPage,
        per_page: 10
      },
      hideLoading: true,
      success: (res) => {
        if (res.code === 0 && res.data.list && res.data.list.length > 0) {
          this.setData({
            latestPosts: [...this.data.latestPosts, ...res.data.list],
            currentPage: this.data.currentPage + 1,
            hasMore: res.data.list.length >= 10
          });
        } else {
          this.setData({
            hasMore: false
          });
        }
      },
      fail: () => {
        console.error('加载更多文章失败');
      },
      complete: () => {
        this.setData({
          loading: false
        });
      }
    });
  },

  /**
   * 获取热门文章
   */
  getHotPosts: function() {
    const app = getApp();
    app.request({
      url: '/posts/hot',
      method: 'GET',
      data: {
        per_page: 5
      },
      hideLoading: true,
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            hotPosts: res.data.list || []
          });
        }
      },
      fail: () => {
        console.error('获取热门文章失败');
      }
    });
  },

  /**
   * 获取分类列表
   */
  getCategories: function() {
    const app = getApp();
    app.request({
      url: '/categories',
      method: 'GET',
      data: {
        hide_empty: false,
        per_page: 10
      },
      hideLoading: true,
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            categories: res.data || []
          });
        }
      },
      fail: () => {
        console.error('获取分类列表失败');
      }
    });
  },

  /**
   * 跳转到文章详情页
   */
  navigateToPostDetail: function(e) {
    const postId = e.currentTarget.dataset.id;
    if (postId) {
      wx.navigateTo({
        url: `/pages/article/detail/detail?id=${postId}`
      });
    }
  },

  /**
   * 跳转到分类页
   */
  navigateToCategories: function() {
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  /**
   * 跳转到分类文章列表
   */
  navigateToCategoryPosts: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId) {
      // 分类文章列表页面不存在，跳转到分类主页
      wx.switchTab({
        url: '/pages/category/category'
      });
    }
  },

  /**
   * 跳转到搜索页面
   */
  navigateToSearch: function() {
    // 搜索页面不存在，显示提示
    wx.showToast({
      title: '搜索功能尚未实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 点击轮播图
   */
  onBannerClick: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    
    if (item.type === 'post' && item.post_id) {
      wx.navigateTo({
        url: `/pages/article/detail/detail?id=${item.post_id}`
      });
    } else if (item.url) {
      // WebView页面不存在，显示提示
      wx.showToast({
        title: '外部链接浏览功能尚未实现',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 分享页面
   */
  onShareAppMessage: function() {
    return {
      title: 'SUT微信小程序',
      path: '/pages/index/index',
      imageUrl: ''
    };
  }
});