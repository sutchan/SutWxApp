// 用户评论页面逻辑
import { showToast } from '../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    commentsList: [], // 评论列表
    loading: true, // 是否正在加载
    error: false, // 是否加载失败
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10, // 每页数据量
    refreshing: false // 是否正在刷新
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
    
    // 加载评论数据
    this.loadCommentsData();
    
    // 记录页面访问事件
    app.services.analytics.trackPageView('user_comments');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 每次显示页面时可以刷新数据，特别是从其他页面返回时
    if (!this.data.loading && !this.data.refreshing) {
      this.loadCommentsData(true);
    }
  },

  /**
   * 加载评论数据
   * @param {boolean} refresh 是否刷新数据（重置页码）
   */
  loadCommentsData: async function(refresh = false) {
    const app = getApp();
    
    if (refresh) {
      // 重置状态
      this.setData({
        page: 1,
        commentsList: [],
        hasMore: true
      });
    }

    if (!this.data.hasMore && !refresh) {
      return;
    }

    // 显示加载状态
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 使用commentService获取用户评论
      const result = await app.services.comment.getUserComments({
        page: this.data.page,
        per_page: this.data.pageSize
      });
      
      const newData = result.comments || [];
      const updatedList = refresh ? newData : [...this.data.commentsList, ...newData];
      
      this.setData({
        commentsList: updatedList,
        hasMore: newData.length === this.data.pageSize,
        page: this.data.page + 1,
        loading: false,
        error: false,
        refreshing: false
      });
    } catch (error) {
      console.error('获取用户评论失败:', error);
      this.setData({
        loading: false,
        error: true,
        refreshing: false
      });
      showToast(error.message || '获取评论失败', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 处理请求错误
   * @param {Object} error 错误对象
   */
  handleRequestError: function(error) {
    const errorMsg = error.message || '获取评论数据失败';
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      refreshing: false
    });
  },

  /**
   * 跳转到文章详情页
   * @param {Object} e 事件对象
   */
  navigateToArticleDetail: function(e) {
    const { articleId } = e.currentTarget.dataset;
    const app = getApp();
    
    // 记录跳转事件
    app.services.analytics.trackEvent('user_comment_article_click', {
      article_id: articleId
    });
    
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${articleId}`
    });
  },

  /**
   * 删除评论
   * @param {Object} e 事件对象
   */
  deleteComment: async function(e) {
    const { commentId, index } = e.currentTarget.dataset;
    const app = getApp();
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 使用commentService删除评论
            await app.services.comment.deleteComment(commentId);
            
            // 从列表中移除评论
            const updatedList = this.data.commentsList.filter((item, i) => i !== index);
            this.setData({
              commentsList: updatedList
            });
            
            showToast('删除成功', 'success');
            
            // 记录删除评论事件
            app.services.analytics.trackEvent('user_comment_delete', {
              comment_id: commentId
            });
          } catch (error) {
            console.error('删除评论失败:', error);
            showToast(error.message || '删除失败', 'none');
          }
        }
      }
    });
  }

  /**
   * 加载更多数据
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore && !this.data.error) {
      this.loadCommentsData(false);
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true
    });
    this.loadCommentsData(true);
  },

  /**
   * 上拉触底
   */
  onReachBottom: function() {
    this.loadMore();
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    this.loadCommentsData(true);
  }
});