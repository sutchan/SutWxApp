/**
 * 鏂囦欢鍚? detail.js
 * 鐗堟湰鍙? 1.0.1
 * 更新日期: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 描述: 閺傚洨鐝风拠锔藉剰妞ょ敻娼? */

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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.id - 閺傚洨鐝稩D
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   * @returns {void}
   */
  onShow() {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛褰叉禒銉ュ煕閺傜増鏆熼幑?    if (this.data.articleId && !this.data.loading) {
      // 閸欘垯浜掗柅澶嬪閺勵垰鎯侀柌宥嗘煀閸旂姾娴囬弫鐗堝祦
      // this.loadArticleDetail(this.data.articleId);
    }
  },

  /**
   * 閸旂姾娴囬弬鍥╃彿鐠囷附鍎?   * @param {string} id - 閺傚洨鐝稩D
   * @returns {Promise<void>}
   */
  async loadArticleDetail(id) {
    try {
      this.setData({ loading: true, error: null });
      
      // 鐠嬪啰鏁ら張宥呭鐏炲倽骞忛崣鏍ㄦ瀮缁旂姾顕涢幆?      const article = await articleService.getArticleDetail(id);
      
      // 閺囧瓨鏌婃い鐢告桨閺佺増宓?      this.setData({ article, loading: false });
      
      // 閺囧瓨鏌婄€佃壈鍩呴弽蹇旂垼妫?      wx.setNavigationBarTitle({
        title: article.title || i18n.t('article_detail.default_title')
      });
      
      // 瀵倹顒炴晶鐐插闂冨懓顕板▎鈩冩殶
      articleService.increaseViewCount(id).catch(err => {
        console.warn('婢х偛濮為梼鍛邦嚢濞嗏剝鏆熸径杈Е:', err);
      });
      
    } catch (error) {
      console.error('閸旂姾娴囬弬鍥╃彿鐠囷附鍎忔径杈Е:', error);
      this.setData({
        loading: false,
        error: error.message || i18n.t('article_detail.load_failed')
      });
      
      // 閺勫墽銇氶柨娆掝嚖閹绘劗銇?      wx.showToast({
        title: i18n.t('article_detail.load_failed'),
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   * @returns {void}
   */
  onPullDownRefresh() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId).finally(() => {
        // 閸嬫粍顒涙稉瀣閸掗攱鏌?        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   * @returns {Object} 閸掑棔闊╅柊宥囩枂
   */
  onShareAppMessage() {
    const { article } = this.data;
    return {
      title: article?.title || i18n.t('article_detail.share_title'),
      path: `/pages/article/detail/detail?id=${this.data.articleId}`,
      imageUrl: '' // 閸欘垯浜掔拋鍓х枂閸掑棔闊╅崶鍓у
    };
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   * @returns {void}
   */
  handleRetry() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId);
    }
  },

  /**
   * 婢跺秴鍩楅弬鍥╃彿闁剧偓甯?   * @returns {void}
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
        console.error('婢跺秴鍩楅柧鐐复婢惰精瑙?', err);
        wx.showToast({
          title: i18n.t('common.copy_failed'),
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});
