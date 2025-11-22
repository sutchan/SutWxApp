/**
 * 文件名: list.js
 * 订单列表页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0,
    tabs: [
      { title: '全部', type: 'all' },
      { title: '待付款', type: 'pendingPayment' },
      { title: '待发货', type: 'pendingDelivery' },
      { title: '待收货', type: 'pendingReceipt' },
      { title: '已完成', type: 'completed' },
      { title: '已取消', type: 'cancelled' }
    ],
    orderList: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadOrderList();
  },

  /**
   * 处理 Tab 切换
   * @param {Object} e - 事件对象
   */
  onTabChange(e) {
    const index = e.detail.index;
    this.setData({
      activeTab: index,
      orderList: [],
      page: 1,
      hasMore: true
    });
    this.loadOrderList();
  },

  /**
   * 加载订单列表
   */
  loadOrderList() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    const { activeTab, tabs, page, pageSize } = this.data;
    const orderType = tabs[activeTab].type;

    // 模拟数据加载
    setTimeout(() => {
      const mockOrders = [];
      for (let i = 0; i < pageSize; i++) {
        mockOrders.push({
          id: `ORDER_${orderType}_${(page - 1) * pageSize + i + 1}`,
          orderNo: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          status: tabs[activeTab].title,
          totalPrice: (Math.random() * 100 + 10).toFixed(2),
          items: [
            {
              name: `商品名称 ${i + 1}`,
              price: (Math.random() * 50 + 5).toFixed(2),
              quantity: Math.floor(Math.random() * 3) + 1,
              image: '/assets/images/product_placeholder.png'
            }
          ],
          createTime: new Date().toLocaleString()
        });
      }

      this.setData({
        orderList: [...this.data.orderList, ...mockOrders],
        page: page + 1,
        hasMore: mockOrders.length === pageSize, // 假设如果返回的数量小于 pageSize，则没有更多数据了
        loading: false
      });
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadOrderList();
  },

  /**
   * 跳转到订单详情页
   * @param {Object} e - 事件对象
   */
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/order/detail/detail?id=${id}`
    });
  }
});