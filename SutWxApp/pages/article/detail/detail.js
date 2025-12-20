/**
 * 鏂囦欢鍚? detail.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-12-03
 * 浣滆€? Sut
 * 鎻忚堪: 鏂囩珷璇︽儏椤甸潰 */

const articleService = require('../../../services/articleService');
const socialService = require('../../../services/socialService');
const i18n = require('../../../utils/i18n');

Page({
  data: {
    articleId: null,
    article: null,
    loading: true,
    error: null,
    // 璇勮鐩稿叧鏁版嵁
    comments: [],
    commentLoading: false,
    hasMoreComments: true,
    commentPage: 1,
    commentPageSize: 20,
    commentInput: '',
    replyTo: null,
    showReplyInput: false,
    // 璇勮绛涢€夊拰鎺掑簭
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.id - 鏂囩珷ID
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   * @returns {void}
   */
  onShow() {
    // 椤甸潰鏄剧ず鏃跺埛鏂版暟鎹?    if (this.data.articleId && !this.data.loading) {
      // 鍙互閫夋嫨鎬у埛鏂版枃绔犳暟鎹?      // this.loadArticleDetail(this.data.articleId);
      this.loadComments(this.data.articleId, true);
    }
  },

  /**
   * 鍔犺浇鏂囩珷璇︽儏
   * @param {string} id - 鏂囩珷ID
   * @returns {Promise<void>}
   */
  async loadArticleDetail(id) {
    try {
      this.setData({ loading: true, error: null });
      
      // 鑾峰彇鏂囩珷璇︽儏
      const article = await articleService.getArticleDetail(id);
      
      // 鏇存柊鏁版嵁
      this.setData({ article, loading: false });
      
      // 璁剧疆瀵艰埅鏍忔爣棰?      wx.setNavigationBarTitle({
        title: article.title || i18n.t('article_detail.default_title')
      });
      
      // 澧炲姞娴忚閲?      articleService.increaseViewCount(id).catch(err => {
        console.warn('澧炲姞娴忚閲忓け璐?', err);
      });
      
      // 妫€鏌ョ偣璧炵姸鎬?      this.checkLikeStatus(id);
      
    } catch (error) {
      console.error('鍔犺浇鏂囩珷璇︽儏澶辫触:', error);
      this.setData({
        loading: false,
        error: error.message || i18n.t('article_detail.load_failed')
      });
      
      // 鏄剧ず閿欒鎻愮ず
      wx.showToast({
        title: i18n.t('article_detail.load_failed'),
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 鍔犺浇璇勮鍒楄〃
   * @param {string} articleId - 鏂囩珷ID
   * @param {boolean} isRefresh - 鏄惁涓哄埛鏂?   * @returns {Promise<void>}
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
      console.error('鍔犺浇璇勮澶辫触:', error);
      this.setData({
        commentLoading: false
      });
      
      wx.showToast({
        title: '鍔犺浇璇勮澶辫触',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 涓嬫媺鍒锋柊
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
   * 涓婃媺鍔犺浇鏇村璇勮
   * @returns {void}
   */
  onReachBottom() {
    if (this.data.hasMoreComments && this.data.articleId) {
      this.loadComments(this.data.articleId);
    }
  },

  /**
   * 鍒嗕韩鏂囩珷
   * @returns {Object} 鍒嗕韩閰嶇疆
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
   * 閲嶈瘯鍔犺浇
   * @returns {void}
   */
  handleRetry() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId);
    }
  },

  /**
   * 澶嶅埗鏂囩珷閾炬帴
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
        console.error('澶嶅埗閾炬帴澶辫触:', err);
        wx.showToast({
          title: i18n.t('common.copy_failed'),
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 鐐硅禐鏂囩珷
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
      console.error('鐐硅禐澶辫触:', error);
      wx.showToast({
        title: '鎿嶄綔澶辫触',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 妫€鏌ョ偣璧炵姸鎬?   * @param {string} articleId - 鏂囩珷ID
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
      console.error('妫€鏌ョ偣璧炵姸鎬佸け璐?', error);
    }
  },

  /**
   * 璇勮杈撳叆妗嗗彉鍖?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  onCommentInputChange(e) {
    this.setData({
      commentInput: e.detail.value
    });
  },

  /**
   * 鎻愪氦璇勮
   * @returns {void}
   */
  async submitComment() {
    const { commentInput, articleId, replyTo } = this.data;
    
    if (!commentInput.trim() || !articleId) return;
    
    try {
      if (replyTo) {
        // 鍥炲璇勮
        await socialService.replyComment({
          commentId: replyTo,
          content: commentInput.trim(),
          anonymous: false
        });
      } else {
        // 娣诲姞鏂拌瘎璁?        await socialService.addArticleComment({
          articleId,
          content: commentInput.trim(),
          anonymous: false
        });
      }
      
      // 娓呯┖杈撳叆妗?      this.setData({
        commentInput: '',
        replyTo: null,
        showReplyInput: false
      });
      
      // 閲嶆柊鍔犺浇璇勮
      this.loadComments(articleId, true);
      
      wx.showToast({
        title: '璇勮鎴愬姛',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('鎻愪氦璇勮澶辫触:', error);
      wx.showToast({
        title: '璇勮澶辫触',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 鍥炲璇勮
   * @param {Object} e - 浜嬩欢瀵硅薄
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
   * 鍙栨秷鍥炲
   * @returns {void}
   */
  cancelReply() {
    this.setData({
      replyTo: null,
      showReplyInput: false
    });
  },

  /**
   * 鐐硅禐璇勮
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  async likeComment(e) {
    const { commentId } = e.currentTarget.dataset;
    
    try {
      await socialService.likeComment(commentId);
      
      // 鏇存柊鏈湴璇勮鏁版嵁
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
      console.error('鐐硅禐璇勮澶辫触:', error);
      wx.showToast({
        title: '鎿嶄綔澶辫触',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 鎺掑簭绫诲瀷鍙樺寲
   * @param {Object} e - 浜嬩欢瀵硅薄
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
   * 涓炬姤璇勮
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  reportComment(e) {
    const { commentId } = e.currentTarget.dataset;
    
    wx.showActionSheet({
      itemList: ['鍨冨溇骞垮憡', '浜鸿韩鏀诲嚮', '鑹叉儏鍐呭', '鏆村姏鍐呭', '鍏朵粬'],
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
            title: '涓炬姤鎴愬姛',
            icon: 'success',
            duration: 2000
          });
        } catch (error) {
          console.error('涓炬姤璇勮澶辫触:', error);
          wx.showToast({
            title: '涓炬姤澶辫触',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 鏄剧ず/闅愯棌绛涢€夐潰鏉?   * @returns {void}
   */
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  /**
   * 绛涢€夋潯浠跺彉鍖?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  onFilterChange(e) {
    const { filterKey, value } = e.currentTarget.dataset;
    this.setData({
      [`filterOptions.${filterKey}`]: value
    });
  },

  /**
   * 搴旂敤绛涢€?   * @returns {void}
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
   * 閲嶇疆绛涢€?   * @returns {void}
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
