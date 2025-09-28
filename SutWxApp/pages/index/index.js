// pages/index/index.js
Page({
  data: {
    bannerList: [],
    latestPosts: [],
    hotPosts: [],
    categories: [],
    currentPage: 1,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    // 初始化页面数据
    this.getBannerList();
    this.getLatestPosts();
    this.getHotPosts();
    this.getCategories();
  },

  onShow: function() {
    // 页面显示时，如果有更新需要刷新数据
  },

  onPullDownRefresh: function() {
    // 下拉刷新时重置数据并重新加载
    this.setData({
      currentPage: 1,
      hasMore: true,
      latestPosts: []
    });
    
    this.getBannerList();
    this.getLatestPosts();
    this.getHotPosts();
    this.getCategories();
  },

  onReachBottom: function() {
    // 上拉触底加载更多
    if (!this.data.loading && this.data.hasMore) {
      this.loadMorePosts();
    }
  },

  // 获取轮播图列表
  getBannerList: function() {
    const app = getApp();
    app.request({
      url: '/sut-wxapp-api/banners',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            bannerList: res.data
          });
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },

  // 获取最新文章列表
  getLatestPosts: function() {
    const app = getApp();
    this.setData({ loading: true });
    
    app.request({
      url: '/sut-wxapp-api/posts/latest',
      data: {
        page: this.data.currentPage,
        per_page: 10
      },
      success: (res) => {
        if (res.code === 0) {
          const posts = res.data.list || [];
          this.setData({
            latestPosts: posts,
            hasMore: posts.length === 10,
            currentPage: 2
          });
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
  },

  // 加载更多文章
  loadMorePosts: function() {
    const app = getApp();
    this.setData({ loading: true });
    
    app.request({
      url: '/sut-wxapp-api/posts/latest',
      data: {
        page: this.data.currentPage,
        per_page: 10
      },
      success: (res) => {
        if (res.code === 0) {
          const posts = res.data.list || [];
          this.setData({
            latestPosts: [...this.data.latestPosts, ...posts],
            hasMore: posts.length === 10,
            currentPage: this.data.currentPage + 1
          });
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 获取热门文章
  getHotPosts: function() {
    const app = getApp();
    app.request({
      url: '/sut-wxapp-api/posts/hot',
      data: {
        per_page: 5
      },
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            hotPosts: res.data.list || []
          });
        }
      }
    });
  },

  // 获取分类列表
  getCategories: function() {
    const app = getApp();
    app.request({
      url: '/sut-wxapp-api/categories',
      data: {
        hide_empty: false,
        per_page: 10
      },
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            categories: res.data || []
          });
        }
      }
    });
  },

  // 跳转到文章详情页
  navigateToPostDetail: function(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/posts/detail/detail?id=${postId}`
    });
  },

  // 跳转到分类页
  navigateToCategories: function() {
    wx.switchTab({
      url: '/pages/categories/categories'
    });
  },

  // 跳转到分类文章列表
  navigateToCategoryPosts: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/posts/list/list?category_id=${categoryId}`
    });
  },

  // 跳转到搜索页面
  navigateToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 点击轮播图
  onBannerClick: function(e) {
    const item = e.currentTarget.dataset.item;
    if (item.type === 'post' && item.post_id) {
      wx.navigateTo({
        url: `/pages/posts/detail/detail?id=${item.post_id}`
      });
    } else if (item.url) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(item.url)}`
      });
    }
  },

  // 分享页面
  onShareAppMessage: function() {
    return {
      title: 'SUT微信小程序',
      path: '/pages/index/index',
      imageUrl: ''
    };
  }
});