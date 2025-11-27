/**
 * 文件名: detail.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 文章详情页面
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
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.id - 文章ID
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
   * 生命周期函数--监听页面显示
   * @returns {void}
   */
  onShow() {
    // 页面显示时可以刷新数据
    if (this.data.articleId && !this.data.loading) {
      // 可以选择是否重新加载数据
      // this.loadArticleDetail(this.data.articleId);
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
      
      // 调用服务层获取文章详情
      const article = await articleService.getArticleDetail(id);
      
      // 更新页面数据
      this.setData({ article, loading: false });
      
      // 更新导航栏标题
      wx.setNavigationBarTitle({
        title: article.title || i18n.t('article_detail.default_title')
      });
      
      // 异步增加阅读次数
      articleService.increaseViewCount(id).catch(err => {
        console.warn('增加阅读次数失败:', err);
      });
      
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
   * 页面相关事件处理函数--监听用户下拉动作
   * @returns {void}
   */
  onPullDownRefresh() {
    if (this.data.articleId) {
      this.loadArticleDetail(this.data.articleId).finally(() => {
        // 停止下拉刷新
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 用户点击右上角分享
   * @returns {Object} 分享配置
   */
  onShareAppMessage() {
    const { article } = this.data;
    return {
      title: article?.title || i18n.t('article_detail.share_title'),
      path: `/pages/article/detail/detail?id=${this.data.articleId}`,
      imageUrl: '' // 可以设置分享图片
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
  }
});