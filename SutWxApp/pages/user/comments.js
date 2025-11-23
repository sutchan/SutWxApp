/**
 * 文件名: comments.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 用户评论页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    commentList: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadCommentList();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 加载评论列表
   */
  loadCommentList() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    const { page, pageSize } = this.data;

    // 模拟数据加载
    const timer = setTimeout(() => {
      const mockComments = [];
      for (let i = 0; i < pageSize; i++) {
        mockComments.push({
          id: `COMMENT_${(page - 1) * pageSize + i + 1}`,
          avatarUrl: '/assets/images/default_avatar.png',
          nickName: `用户${(page - 1) * pageSize + i + 1}`,
          time: new Date().toLocaleString(),
          content: `这是用户${(page - 1) * pageSize + i + 1}对商品${(page - 1) * pageSize + i + 1}的评论内容。`,
          productName: `商品名称${(page - 1) * pageSize + i + 1}`
        });
      }

      this.setData({
        commentList: [...this.data.commentList, ...mockComments],
        page: page + 1,
        hasMore: mockComments.length === pageSize,
        loading: false,
        timer: null
      });
    }, 1000);
    
    this.setData({ timer });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadCommentList();
  }
});