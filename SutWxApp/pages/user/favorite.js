/**
 * 文件名: favorite.js
 * 用户收藏页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    favoriteList: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadFavoriteList();
  },

  /**
   * 加载收藏列表
   */
  loadFavoriteList() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    const { page, pageSize } = this.data;

    // 模拟数据加载
    setTimeout(() => {
      const mockFavorites = [];
      for (let i = 0; i < pageSize; i++) {
        mockFavorites.push({
          id: `FAV_${(page - 1) * pageSize + i + 1}`,
          image: '/assets/images/product_placeholder.png',
          name: `收藏商品名称${(page - 1) * pageSize + i + 1}`,
          price: (Math.random() * 100 + 10).toFixed(2)
        });
      }

      this.setData({
        favoriteList: [...this.data.favoriteList, ...mockFavorites],
        page: page + 1,
        hasMore: mockFavorites.length === pageSize,
        loading: false
      });
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadFavoriteList();
  },

  /**
   * 跳转到商品详情页
   * @param {Object} e - 事件对象
   */
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },

  /**
   * 取消收藏
   * @param {Object} e - 事件对象
   */
  deleteFavorite(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const newFavoriteList = this.data.favoriteList.filter(item => item.id !== id);
          this.setData({
            favoriteList: newFavoriteList
          });
          wx.showToast({
            title: '取消成功',
            icon: 'success'
          });
          // 实际取消收藏逻辑，可能需要调用API
        }
      }
    });
  }
});