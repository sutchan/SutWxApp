/**
 * 文件名: detail.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 浣滆€? Sut
 * 描述: 鏂囩珷璇︽儏椤甸潰
 */

const articleService = require('../../../services/articleService');
const i18n = require('../../../utils/i18n');

Page({
  data: {
    articleId: null,
    article: null,
    loading: true,
    error: null
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
    // 椤甸潰鏄剧ず鏃跺彲浠ュ埛鏂版暟鎹?    if (this.data.articleId && !this.data.loading) {
      // 鍙互閫夋嫨鏄惁閲嶆柊鍔犺浇鏁版嵁
      // this.loadArticleDetail(this.data.articleId);
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
      
      // 璋冪敤鏈嶅姟灞傝幏鍙栨枃绔犺鎯?      const article = await articleService.getArticleDetail(id);
      
      // 鏇存柊椤甸潰鏁版嵁
      this.setData({ article, loading: false });
      
      // 鏇存柊瀵艰埅鏍忔爣棰?      wx.setNavigationBarTitle({
        title: article.title || i18n.t('article_detail.default_title')
      });
      
      // 寮傛澧炲姞闃呰娆℃暟
      articleService.increaseViewCount(id).catch(err => {
        console.warn('澧炲姞闃呰娆℃暟澶辫触:', err);
      });
      
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
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   * @returns {void}
   */
  onPullDownRefresh() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId).finally(() => {
        // 鍋滄涓嬫媺鍒锋柊
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   * @returns {Object} 鍒嗕韩閰嶇疆
   */
  onShareAppMessage() {
    const { article } = this.data;
    return {
      title: article?.title || i18n.t('article_detail.share_title'),
      path: `/pages/article/detail/detail?id=${this.data.articleId}`,
      imageUrl: '' // 鍙互璁剧疆鍒嗕韩鍥剧墖
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
  }
});