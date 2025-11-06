// pages/index/index.js
/**
 * 首页页面 - 展示轮播图、分类导航和文章列表
 */
import { showToast } from '../../utils/global';

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
    loadingMore: false, // 加载更多状态
    refreshing: false, // 下拉刷新状态
    error: '', // 错误信息
    showSkeleton: true // 是否显示骨架屏
  },

  /**
   * 重试加载数据
   */
  onRetry: function() {
    this.setData({
      error: '',
      currentPage: 1,
      hasMore: true,
      latestPosts: []
    });
    this.loadAllData();
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
    // 页面显示时，如果需要刷新数据，可以在这里添加逻辑
    // 例如检查全局状态变化，或者定时刷新等
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
      latestPosts: [],
      showSkeleton: true,
      error: ''
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
   * 根据API文档，使用/content/home接口一次性获取首页所需数据
   */
  loadAllData: function() {
    // 使用首页统一接口获取数据，提高性能
    this.getHomeData();
  },

  /**
   * 获取首页数据（包含banner、精选文章、最新文章等）
   */
  getHomeData: async function() {
    const app = getApp();
    if (!this.data.refreshing) {
      this.setData({ loading: true });
    }
    
    try {
      // 使用articleService获取首页数据
      const res = await app.services.article.getHomeData();
      
      // 处理首页数据
      this.setData({
        bannerList: res.banner || [],
        hotPosts: res.featured_posts || [],
        latestPosts: res.latest_posts || [],
        categories: res.categories || [],
        currentPage: 2,
        hasMore: res.pages ? res.pages > 1 : (res.latest_posts && res.latest_posts.length >= 10),
        error: ''
      });
      
      // 记录页面浏览事件
      app.services.analytics.trackPageView('index', {
        content_type: 'homepage',
        banner_count: res.banner ? res.banner.length : 0,
        post_count: res.latest_posts ? res.latest_posts.length : 0
      });
    } catch (err) {
      console.error('获取首页数据失败:', err);
      this.setData({
        error: err.message || '网络连接失败，请检查网络设置'
      });
      showToast(err.message || '获取首页数据失败', 'none', 2000);
    } finally {
      this.setData({
        loading: false,
        refreshing: false,
        showSkeleton: false
      });
      if (this.data.refreshing) {
        wx.stopPullDownRefresh();
      }
    }
  },

  /**
   * 获取轮播图列表（备用方法，正常情况下已在getHomeData中获取）
   */
  getBannerList: async function() {
    const app = getApp();
    try {
      const res = await app.services.article.getBannerList();
      this.setData({
        bannerList: res || []
      });
    } catch (error) {
      console.error('获取轮播图失败');
      showToast('获取轮播图失败', 'none', 2000);
    }
  },

  /**
   * 获取最新文章列表（备用方法，正常情况下已在getHomeData中获取）
   */
  getLatestPosts: async function() {
    const app = getApp();
    if (!this.data.refreshing) {
      this.setData({
        loading: true
      });
    }
    
    try {
      const res = await app.services.article.getPosts({
        page: 1,
        per_page: 10,
        order: 'desc',
        orderby: 'date'
      });
      
      this.setData({
        latestPosts: res.posts || [],
        currentPage: 2,
        hasMore: res.posts && res.posts.length >= 10 && res.pages > 1
      });
    } catch (error) {
      console.error('获取最新文章失败');
      showToast('获取最新文章失败', 'none', 2000);
    } finally {
      this.setData({
        loading: false,
        refreshing: false,
        showSkeleton: false
      });
      
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 加载更多文章
   */
  loadMorePosts: async function() {
    if (this.data.loading || this.data.loadingMore || !this.data.hasMore) {
      return;
    }
    
    const app = getApp();
    this.setData({
      loadingMore: true
    });
    
    try {
      const res = await app.services.article.getPosts({
        page: this.data.currentPage,
        per_page: 10,
        order: 'desc',
        orderby: 'date'
      });
      
      if (res.posts && res.posts.length > 0) {
        // 合并并去重文章列表，防止重复加载
        const existingIds = new Set(this.data.latestPosts.map(post => post.id));
        const newPosts = res.posts.filter(post => !existingIds.has(post.id));
        
        this.setData({
          latestPosts: [...this.data.latestPosts, ...newPosts],
          currentPage: this.data.currentPage + 1,
          hasMore: res.pages && res.pages >= this.data.currentPage
        });
      } else {
        this.setData({
          hasMore: false
        });
      }
    } catch (error) {
      console.error('加载更多文章失败:', error);
      showToast('加载更多失败，请重试', 'none', 2000);
    } finally {
      this.setData({
        loadingMore: false
      });
    }
  },

  /**
   * 获取热门文章（备用方法，正常情况下已在getHomeData中获取）
   */
  getHotPosts: async function() {
    const app = getApp();
    try {
      const res = await app.services.article.getHotPosts({
        per_page: 5
      });
      
      this.setData({
        hotPosts: res || []
      });
    } catch (error) {
      console.error('获取热门文章失败');
    }
  },

  /**
   * 获取分类列表（备用方法，正常情况下已在getHomeData中获取）
   */
  getCategories: async function() {
    const app = getApp();
    try {
      const categories = await app.services.category.getCategories({
        hide_empty: false,
        per_page: 10
      });
      
      this.setData({
        categories: categories || []
      });
    } catch (error) {
      console.error('获取分类列表失败');
    }
  },
  
  /**
   * 获取系统信息（用于调试）
   * @private
   */
  _getSystemInfo: function() {
    try {
      return wx.getSystemInfoSync() || {};
    } catch (e) {
      console.error('获取系统信息失败:', e);
      return {};
    }
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
    const categoryName = e.currentTarget.dataset.name;
    if (categoryId) {
      // 跳转到分类主页并传入分类ID参数
      wx.switchTab({
        url: `/pages/category/category?category_id=${categoryId}&category_name=${encodeURIComponent(categoryName || '')}`
      });
    }
  },

  /**
   * 跳转到搜索页面
   */
  navigateToSearch: function() {
    // 搜索页面不存在，显示提示
    showToast('搜索功能尚未实现', 'none', 2000);
  },

  /**
   * 点击轮播图
   */
  onBannerClick: function(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    
    const app = getApp();
    // 记录轮播图点击事件
    app.services.analytics.trackEvent('banner_click', {
      banner_id: item.id || item.post_id,
      banner_type: item.type || 'post',
      position: e.currentTarget.dataset.index
    });
    
    if (item.type === 'post' && item.post_id) {
      wx.navigateTo({
        url: `/pages/article/detail/detail?id=${item.post_id}`
      });
    } else if (item.url) {
      // WebView页面不存在，显示提示
      showToast('外部链接浏览功能尚未实现', 'none', 2000);
    } else if (item.id) {
      // 兼容其他可能的ID格式
      wx.navigateTo({
        url: `/pages/article/detail/detail?id=${item.id}`
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
      imageUrl: this.data.bannerList && this.data.bannerList.length > 0 ? this.data.bannerList[0].image_url : ''
    };
  }
});