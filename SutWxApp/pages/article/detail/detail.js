/**
 * 文件名: detail.js
 * 文章详情页面
 */
Page({
  data: {
    articleId: null,
    article: null,
    loading: true,
    timer: null
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
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 加载文章详情
   * @param {string} id - 文章ID
   * @returns {void}
   */
  loadArticleDetail(id) {
    this.setData({ loading: true });
    // 模拟数据请求
    const timer = setTimeout(() => {
      const mockArticle = {
        id: id,
        title: `文章标题 ${id}`,
        content: `这是文章 ${id} 的详细内容。`,
        author: 'Sut',
        date: '2023-11-22'
      };
      this.setData({
        article: mockArticle,
        loading: false,
        timer: null
      });
    }, 1000);
    
    this.setData({ timer });
  }
});