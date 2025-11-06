// pages/article/detail/detail.js
/**
 * 文章详情页面 - 展示文章内容、评论列表和互动功能
 */
import { showToast } from '../../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleId: 0, // 文章ID
    article: {}, // 文章详情
    loading: true, // 加载状态
    error: false, // 错误状态
    likeCount: 0, // 点赞数量
    isLiked: false, // 是否已点赞
    commentList: [], // 评论列表
    commentPage: 1, // 评论当前页码
    commentHasMore: true, // 评论是否有更多
    commentContent: '', // 评论内容
    showCommentInput: false, // 是否显示评论输入框
    isFavorite: false, // 是否已收藏
    favoriteCount: 0, // 收藏数量
    viewCount: 0, // 浏览量
    replyToCommentId: null, // 回复的评论ID
    replyToUsername: '', // 回复的用户名
    loadingComments: false, // 评论加载状态
    showSkeleton: true // 是否显示骨架屏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        articleId: parseInt(options.id)
      });
      this.getArticleDetail();
      this.getCommentList();
    } else {
      this.setData({
        loading: false,
        showSkeleton: false,
        error: true
      });
      wx.showToast({
        title: '文章ID不存在',
        icon: 'none'
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 可以在这里刷新文章数据，例如点赞、收藏状态
  },

  /**
   * 获取文章详情
   */
  getArticleDetail: async function() {
    const app = getApp();
    try {
      // 使用articleService获取文章详情
      const article = await app.services.article.getPostDetail(this.data.articleId);
      
      this.setData({
        article: article,
        likeCount: article.like_count || 0,
        isLiked: article.is_liked || false,
        isFavorite: article.is_favorite || false,
        favoriteCount: article.favorite_count || 0,
        viewCount: article.view_count || 0,
        loading: false,
        showSkeleton: false,
        error: false
      });
      
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: article.title || '文章详情'
      });
      
      // 记录文章浏览事件
      app.services.analytics.trackEvent('article_view', {
        article_id: this.data.articleId,
        article_title: article.title,
        category_id: article.category_id
      });
    } catch (err) {
      console.error('获取文章详情失败:', err);
      showToast(err.message || '网络错误，无法加载文章', 'none');
      this.setData({
        loading: false,
        showSkeleton: false,
        error: true
      });
    }
  },

  /**
   * 获取评论列表
   */
  getCommentList: async function() {
    if (!this.data.commentHasMore) return;

    const app = getApp();
    try {
      // 使用commentService获取评论列表
      const res = await app.services.comment.getComments(this.data.articleId, {
        page: this.data.commentPage,
        per_page: 10
      });
      
      const comments = res.comments || [];
      const pages = res.pages || 1;
      
      // 如果是第一页，则替换评论列表；否则追加
      if (this.data.commentPage === 1) {
        this.setData({
          commentList: comments
        });
      } else {
        this.setData({
          commentList: [...this.data.commentList, ...comments]
        });
      }
      
      // 判断是否还有更多评论
      this.setData({
        commentHasMore: this.data.commentPage < pages,
        loadingComments: false
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      this.setData({
        loadingComments: false
      });
      
      if (this.data.commentPage === 1) {
        showToast('评论加载失败', 'none');
      }
    }
  },

  /**
   * 点赞文章
   */
  likeArticle: async function() {
    const app = getApp();
    // 检查是否登录
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }

    const isLike = !this.data.isLiked;
    const successMsg = isLike ? '点赞成功' : '取消点赞成功';
    
    try {
      // 乐观更新UI
      this.setData({
        isLiked: isLike,
        likeCount: isLike ? this.data.likeCount + 1 : Math.max(0, this.data.likeCount - 1)
      });
      
      // 使用articleService进行点赞操作
      await app.services.article.toggleLike(this.data.articleId);
      
      showToast(successMsg, 'success');
      
      // 记录点赞事件
      app.services.analytics.trackEvent('article_like', {
        article_id: this.data.articleId,
        action: isLike ? 'like' : 'unlike'
      });
    } catch (error) {
      // 失败时回滚UI
      this.setData({
        isLiked: !isLike,
        likeCount: isLike ? this.data.likeCount - 1 : this.data.likeCount + 1
      });
      showToast(error.message || '操作失败', 'none');
    }
  },

  /**
   * 收藏文章
   */
  favoriteArticle: async function() {
    const app = getApp();
    // 检查是否登录
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }

    const isFavorite = !this.data.isFavorite;
    const successMsg = isFavorite ? '收藏成功' : '取消收藏成功';
    
    try {
      // 乐观更新UI
      this.setData({
        isFavorite: isFavorite,
        favoriteCount: isFavorite ? this.data.favoriteCount + 1 : Math.max(0, this.data.favoriteCount - 1)
      });
      
      // 使用articleService进行收藏操作
      await app.services.article.toggleFavorite(this.data.articleId);
      
      showToast(successMsg, 'success');
      
      // 记录收藏事件
      app.services.analytics.trackEvent('article_favorite', {
        article_id: this.data.articleId,
        action: isFavorite ? 'favorite' : 'unfavorite'
      });
    } catch (error) {
      // 失败时回滚UI
      this.setData({
        isFavorite: !isFavorite,
        favoriteCount: isFavorite ? this.data.favoriteCount - 1 : this.data.favoriteCount + 1
      });
      showToast(error.message || '操作失败', 'none');
    }
  },

  /**
   * 提交评论
   */
  submitComment: async function() {
    const content = this.data.commentContent.trim();
    if (!content) {
      showToast('评论内容不能为空', 'none');
      return;
    }

    const app = getApp();
    const isReply = !!this.data.replyToCommentId;
    
    try {
      // 使用commentService提交评论
      const newComment = await app.services.comment.addComment(this.data.articleId, {
        content: content,
        parent_id: this.data.replyToCommentId || undefined
      });
      
      // 重置状态
      this.setData({
        commentContent: '',
        showCommentInput: false,
        replyToCommentId: null,
        replyToUsername: ''
      });
      
      // 更新评论列表
      if (isReply) {
        // 回复评论时刷新整个评论列表
        this.setData({
          commentPage: 1,
          commentHasMore: true
        });
        this.getCommentList();
      } else {
        // 普通评论直接添加到列表开头
        this.setData({
          commentList: [newComment, ...this.data.commentList]
        });
      }
      
      showToast('评论成功', 'success');
      
      // 记录评论事件
      app.services.analytics.trackEvent('article_comment', {
        article_id: this.data.articleId,
        comment_id: newComment.id,
        is_reply: isReply
      });
    } catch (error) {
      showToast(error.message || '评论失败', 'none');
    }
  },

  /**
   * 输入评论内容
   */
  onCommentInput: function(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },

  /**
   * 显示评论输入框
   */
  showCommentBox: function() {
    const app = getApp();
    // 检查是否登录
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }

    // 清除回复状态，显示普通评论框
    this.setData({
      replyToCommentId: null,
      replyToUsername: '',
      showCommentInput: true
    });
  },
  
  /**
   * 加载更多评论
   */
  loadMoreComments: function() {
    if (!this.data.commentHasMore || this.data.loadingComments) return;
    
    this.setData({
      loadingComments: true,
      commentPage: this.data.commentPage + 1
    });
    
    this.getCommentList();
  },

  /**
   * 隐藏评论输入框
   */
  hideCommentBox: function() {
    this.setData({
      showCommentInput: false,
      replyToCommentId: null,
      replyToUsername: ''
    });
  },

  /**
   * 点赞评论
   */
  likeComment: async function(e) {
    const commentId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 获取当前评论对象和索引
    const commentIndex = this.data.commentList.findIndex(item => item.id === commentId);
    if (commentIndex === -1) return;
    
    const currentComment = this.data.commentList[commentIndex];
    const newIsLiked = !currentComment.is_liked;
    const newLikeCount = newIsLiked ? (currentComment.like_count || 0) + 1 : Math.max(0, (currentComment.like_count || 1) - 1);
    
    // 乐观更新UI
    const newCommentList = [...this.data.commentList];
    newCommentList[commentIndex] = {
      ...newCommentList[commentIndex],
      is_liked: newIsLiked,
      like_count: newLikeCount
    };
    this.setData({
      commentList: newCommentList
    });
    
    try {
      // 使用commentService进行评论点赞操作
      await app.services.comment.toggleLike(commentId);
      
      // 记录评论点赞事件
      app.services.analytics.trackEvent('comment_like', {
        comment_id: commentId,
        action: newIsLiked ? 'like' : 'unlike'
      });
    } catch (error) {
      // 请求失败，回滚UI
      newCommentList[commentIndex] = {
        ...newCommentList[commentIndex],
        is_liked: !newIsLiked,
        like_count: currentComment.like_count || 0
      };
      this.setData({
        commentList: newCommentList
      });
      showToast(error.message || '操作失败', 'none');
    }
  },

  /**
   * 回复评论
   */
  replyToComment: function(e) {
    const commentId = e.currentTarget.dataset.id;
    const username = e.currentTarget.dataset.username;
    const app = getApp();
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 设置回复状态并显示评论框
    this.setData({
      replyToCommentId: commentId,
      replyToUsername: username,
      showCommentInput: true,
      commentContent: `@${username} `
    });
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
   * 分享文章
   */
  onShareAppMessage: function() {
    return {
      title: this.data.article.title || '分享文章',
      path: '/pages/article/detail/detail?id=' + this.data.articleId,
      imageUrl: this.data.article.thumbnail
    };
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.commentHasMore) {
      this.setData({
        commentPage: this.data.commentPage + 1
      });
      this.getCommentList();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      showSkeleton: true,
      error: false
    });
    this.getArticleDetail();
    this.setData({
      commentPage: 1,
      commentHasMore: true
    });
    this.getCommentList();
    wx.stopPullDownRefresh();
  },

  /**
   * 重试加载数据
   */
  onRetry: function() {
    this.setData({
      loading: true,
      showSkeleton: true,
      error: false
    });
    this.getArticleDetail();
    this.setData({
      commentPage: 1,
      commentHasMore: true
    });
    this.getCommentList();
  },

  /**
   * 跳转到相关文章详情
   */
  goToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.id;
    if (!articleId) return;
    
    wx.navigateTo({
      url: '/pages/article/detail/detail?id=' + articleId,
      fail: function() {
        showToast('跳转文章详情失败', 'none');
      }
    });
  }
});