/**
 * 文件名: detail.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-03
 * 作者: Sut
 * 描述: 文章详情页面 */

const articleService = require('../../../services/articleService');
const socialService = require('../../../services/socialService');
const i18n = require('../../../utils/i18n');

Page({
  data: {
    articleId: null,
    article: null,
    loading: true,
    error: null,
    // 评论相关数据
    comments: [],
    commentLoading: false,
    hasMoreComments: true,
    commentPage: 1,
    commentPageSize: 20,
    commentInput: '',
    replyTo: null,
    showReplyInput: false,
    // 评论筛选和排序
    sortType: 'newest',
    filterOptions: {
      withImages: false,
      withReplies: false
    },
    showFilterPanel: false,
    likeStatus: false,
    likeCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.id - 文章ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ articleId: options.id });
      this.loadArticleDetail(options.id);
      this.loadComments(options.id);
    } else {
      this.setData({
        loading: false,
        error: i18n.t('article_detail.missing_id')
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   * @returns {void}
   */
  onShow() {
    // 页面显示时刷新数据
    if (this.data.articleId && !this.data.loading) {
      // 可以选择性刷新文章数据
      // this.loadArticleDetail(this.data.articleId);
      this.loadComments(this.data.articleId, true);
    }
  },

  /**
   * 加载文章详情
   * @param {string} id - 文章ID
   * @returns {Promise<void>}
   */
  async loadArticleDetail(id) {
    try {
      this.setData({ loading: true, error: null });
      
      // 获取文章详情
      const article = await articleService.getArticleDetail(id);
      
      // 更新数据
      this.setData({ article, loading: false });
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: article.title || i18n.t('article_detail.default_title')
      });
      
      // 增加浏览量
      articleService.increaseViewCount(id).catch(err => {
        console.warn('增加浏览量失败:', err);
      });
      
      // 检查点赞状态
      this.checkLikeStatus(id);
      
    } catch (error) {
      console.error('加载文章详情失败:', error);
      this.setData({
        loading: false,
        error: error.message || i18n.t('article_detail.load_failed')
      });
      
      // 显示错误提示
      wx.showToast({
        title: i18n.t('article_detail.load_failed'),
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 加载评论列表
   * @param {string} articleId - 文章ID
   * @param {boolean} isRefresh - 是否为刷新
   * @returns {Promise<void>}
   */
  async loadComments(articleId, isRefresh = false) {
    if (!articleId || this.data.commentLoading) return;
    
    this.setData({
      commentLoading: true
    });
    
    try {
      const page = isRefresh ? 1 : this.data.commentPage;
      const { sortType, filterOptions } = this.data;
      const result = await socialService.getArticleComments({
        articleId,
        page,
        pageSize: this.data.commentPageSize,
        sort: sortType,
        withImages: filterOptions.withImages,
        withReplies: filterOptions.withReplies
      });
      
      const newComments = result.data || [];
      const comments = isRefresh ? newComments : [...this.data.comments, ...newComments];
      const hasMoreComments = newComments.length === this.data.commentPageSize;
      
      this.setData({
        comments,
        commentLoading: false,
        hasMoreComments,
        commentPage: hasMoreComments ? page + 1 : page
      });
    } catch (error) {
      console.error('加载评论失败:', error);
      this.setData({
        commentLoading: false
      });
      
      wx.showToast({
        title: '加载评论失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 下拉刷新
   * @returns {void}
   */
  onPullDownRefresh() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId).finally(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 上拉加载更多评论
   * @returns {void}
   */
  onReachBottom() {
    if (this.data.hasMoreComments && this.data.articleId) {
      this.loadComments(this.data.articleId);
    }
  },

  /**
   * 分享文章
   * @returns {Object} 分享配置
   */
  onShareAppMessage() {
    const { article } = this.data;
    return {
      title: article?.title || i18n.t('article_detail.share_title'),
      path: `/pages/article/detail/detail?id=${this.data.articleId}`,
      imageUrl: article?.coverImage || ''
    };
  },

  /**
   * 重试加载
   * @returns {void}
   */
  handleRetry() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId);
    }
  },

  /**
   * 复制文章链接
   * @returns {void}
   */
  copyArticleLink() {
    const link = `https://sutwxapp.com/articles/${this.data.articleId}`;
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({
          title: i18n.t('common.copy_success'),
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        console.error('复制链接失败:', err);
        wx.showToast({
          title: i18n.t('common.copy_failed'),
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 点赞文章
   * @returns {void}
   */
  async likeArticle() {
    if (!this.data.articleId) return;
    
    try {
      if (this.data.likeStatus) {
        await socialService.unlikeArticle(this.data.articleId);
        this.setData({
          likeStatus: false,
          likeCount: Math.max(0, this.data.likeCount - 1)
        });
      } else {
        await socialService.likeArticle(this.data.articleId);
        this.setData({
          likeStatus: true,
          likeCount: this.data.likeCount + 1
        });
      }
    } catch (error) {
      console.error('点赞失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 检查点赞状态
   * @param {string} articleId - 文章ID
   * @returns {void}
   */
  async checkLikeStatus(articleId) {
    try {
      const result = await socialService.checkLikeStatus({
        targetId: articleId,
        targetType: 'article'
      });
      
      this.setData({
        likeStatus: result.isLiked || false,
        likeCount: result.likeCount || 0
      });
    } catch (error) {
      console.error('检查点赞状态失败:', error);
    }
  },

  /**
   * 评论输入框变化
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onCommentInputChange(e) {
    this.setData({
      commentInput: e.detail.value
    });
  },

  /**
   * 提交评论
   * @returns {void}
   */
  async submitComment() {
    const { commentInput, articleId, replyTo } = this.data;
    
    if (!commentInput.trim() || !articleId) return;
    
    try {
      if (replyTo) {
        // 回复评论
        await socialService.replyComment({
          commentId: replyTo,
          content: commentInput.trim(),
          anonymous: false
        });
      } else {
        // 添加新评论
        await socialService.addArticleComment({
          articleId,
          content: commentInput.trim(),
          anonymous: false
        });
      }
      
      // 清空输入框
      this.setData({
        commentInput: '',
        replyTo: null,
        showReplyInput: false
      });
      
      // 重新加载评论
      this.loadComments(articleId, true);
      
      wx.showToast({
        title: '评论成功',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('提交评论失败:', error);
      wx.showToast({
        title: '评论失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 回复评论
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onReplyComment(e) {
    const { commentId } = e.currentTarget.dataset;
    this.setData({
      replyTo: commentId,
      showReplyInput: true
    });
  },

  /**
   * 取消回复
   * @returns {void}
   */
  cancelReply() {
    this.setData({
      replyTo: null,
      showReplyInput: false
    });
  },

  /**
   * 点赞评论
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  async likeComment(e) {
    const { commentId } = e.currentTarget.dataset;
    
    try {
      await socialService.likeComment(commentId);
      
      // 更新本地评论数据
      const comments = this.data.comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: true,
            likeCount: (comment.likeCount || 0) + 1
          };
        }
        return comment;
      });
      
      this.setData({ comments });
    } catch (error) {
      console.error('点赞评论失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 排序类型变化
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onSortTypeChange(e) {
    const { sortType } = e.currentTarget.dataset;
    this.setData({
      sortType,
      commentPage: 1,
      comments: [],
      hasMoreComments: true
    });
    
    if (this.data.articleId) {
      this.loadComments(this.data.articleId, true);
    }
  },

  /**
   * 举报评论
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  reportComment(e) {
    const { commentId } = e.currentTarget.dataset;
    
    wx.showActionSheet({
      itemList: ['垃圾广告', '人身攻击', '色情内容', '暴力内容', '其他'],
      success: async (res) => {
        const reasons = ['spam', 'abuse', 'pornography', 'violence', 'other'];
        const reason = reasons[res.tapIndex];
        
        try {
          await socialService.reportComment({
            commentId,
            reason,
            description: ''
          });
          
          wx.showToast({
            title: '举报成功',
            icon: 'success',
            duration: 2000
          });
        } catch (error) {
          console.error('举报评论失败:', error);
          wx.showToast({
            title: '举报失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 显示/隐藏筛选面板
   * @returns {void}
   */
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  /**
   * 筛选条件变化
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onFilterChange(e) {
    const { filterKey, value } = e.currentTarget.dataset;
    this.setData({
      [`filterOptions.${filterKey}`]: value
    });
  },

  /**
   * 应用筛选
   * @returns {void}
   */
  applyFilter() {
    this.setData({
      showFilterPanel: false,
      commentPage: 1,
      comments: [],
      hasMoreComments: true
    });
    
    if (this.data.articleId) {
      this.loadComments(this.data.articleId, true);
    }
  },

  /**
   * 重置筛选
   * @returns {void}
   */
  resetFilter() {
    this.setData({
      filterOptions: {
        withImages: false,
        withReplies: false
      }
    });
  }
});
