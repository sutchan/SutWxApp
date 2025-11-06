// 用户收藏页面
import { showToast } from '../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    favoriteList: [], // 收藏列表
    loading: false, // 加载状态
    refreshing: false, // 下拉刷新状态
    error: '', // 错误信息
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10 // 每页数据量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 检查登录状态
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 加载收藏数据
    this.loadFavoriteData();
    
    // 记录页面访问事件
    app.services.analytics.trackPageView('user_favorite');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const app = getApp();
    
    // 检查登录状态
    if (!app.isLoggedIn()) {
      return;
    }
    
    // 页面显示时刷新数据
    this.setData({
      page: 1,
      favoriteList: [],
      hasMore: true
    });
    this.loadFavoriteData();
  },

  /**
   * 加载收藏数据
   * @param {boolean} refresh - 是否为刷新操作
   */
  loadFavoriteData: async function(refresh = false) {
    const app = getApp();
    
    // 如果正在加载，直接返回
    if (this.data.loading) return;

    // 显示加载状态
    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 构建请求参数
      const page = refresh ? 1 : this.data.page;
      
      // 使用收藏服务获取收藏列表
      const result = await app.services.favorite.getUserFavorites({
        page: page,
        per_page: this.data.pageSize
      });
      
      const newList = result.list || [];
      const newFavoriteList = refresh ? newList : [...this.data.favoriteList, ...newList];
      
      // 判断是否还有更多数据
      const hasMore = newList.length === this.data.pageSize;
      const nextPage = refresh ? 2 : this.data.page + 1;

      this.setData({
        favoriteList: newFavoriteList,
        hasMore: hasMore,
        page: nextPage,
        error: ''
      });
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      this.setData({
        error: error.message || '加载失败，请重试'
      });
      showToast('获取收藏失败', 'none');
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 处理请求成功
   * @param {Object} result - 响应数据
   * @param {boolean} refresh - 是否为刷新操作
   */
  handleRequestSuccess: function(result, refresh) {
    const newList = result.list || [];
    const newFavoriteList = refresh ? newList : [...this.data.favoriteList, ...newList];
    
    // 判断是否还有更多数据
    const hasMore = newList.length === this.data.pageSize;
    const nextPage = refresh ? 2 : this.data.page + 1;

    this.setData({
      favoriteList: newFavoriteList,
      hasMore: hasMore,
      page: nextPage,
      error: ''
    });
  },

  /**
   * 处理请求错误
   * @param {Object} error - 错误信息
   */
  handleRequestError: function(error) {
    console.error('获取收藏列表失败:', error);
    this.setData({
      error: error.message || '网络异常，请检查网络连接后重试'
    });
    showToast('获取收藏失败', 'none');
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    this.setData({
      page: 1,
      favoriteList: [],
      hasMore: true
    });
    this.loadFavoriteData();
  },

  /**
   * 加载更多
   */
  loadMore: function() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadFavoriteData(false);
  },

  /**
   * 取消收藏
   * @param {Object} e - 事件对象
   */
  unfavorite: function(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const productId = e.currentTarget.dataset.productId;

    wx.showModal({
      title: '确认操作',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          this.executeUnfavorite(id, index, productId);
        }
      }
    });
  },

  /**
   * 执行取消收藏操作
   * @param {number} id - 收藏ID
   * @param {number} index - 列表索引
   * @param {number} productId - 商品ID
   */
  executeUnfavorite: async function(id, index, productId) {
    const app = getApp();
    
    try {
      // 使用收藏服务取消收藏
      await app.services.favorite.removeFavorite({
        id: id
      });
      
      // 从列表中移除该收藏项
      const newFavoriteList = [...this.data.favoriteList];
      newFavoriteList.splice(index, 1);
      
      this.setData({
        favoriteList: newFavoriteList
      });
      
      showToast('取消收藏成功', 'success');
      
      // 记录取消收藏事件
      app.services.analytics.trackEvent('user_unfavorite', {
        favorite_id: id,
        product_id: productId
      });
    } catch (error) {
      console.error('取消收藏失败:', error);
      showToast(error.message || '取消收藏失败', 'none');
    }
  },

  /**
   * 跳转到商品详情页
   * @param {Object} e - 事件对象
   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.productId;
    const app = getApp();
    
    // 记录跳转事件
    app.services.analytics.trackEvent('user_favorite_product_click', {
      product_id: productId
    });
    
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${productId}`
    });
  }

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadFavoriteData(true);
  },

  /**
   * 上拉触底加载更多
   */
  onReachBottom: function() {
    this.loadMore();
  }
});