/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 订单列表页面
 */
const i18n = require('../../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    activeTab: 'all', // all, pending, paid, shipped, completed, cancelled
    orders: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    loadTimer: null,
    loadMoreTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.status - 订单状态
   * @returns {void}
   */
  onLoad(options) {
    if (options.status) {
      this.setData({ activeTab: options.status });
    }
    
    this.loadOrders();
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理所有定时器，防止内存泄漏
    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadMoreTimer) {
      clearTimeout(this.data.loadMoreTimer);
    }
  },

  /**
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 从其他页面返回时刷新订单列表
    this.loadOrders();
  },

  /**
   * 下拉刷新回调
   * @returns {void}
   */
  onPullDownRefresh() {
    this.setData({
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadOrders(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 触底加载更多
   * @returns {void}
   */
  onReachBottom() {
    if (this.data.pagination.hasMore) {
      this.loadMoreOrders();
    }
  },

  /**
   * 加载订单列表
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadOrders(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD20231001001',
          status: 'pending',
          statusText: i18n.translate('待付款'),
          createTime: '2023-10-01 10:30:00',
          totalAmount: '199.00',
          items: [
            {
              id: 1,
              name: i18n.translate('优质商品A'),
              image: '/images/placeholder.svg',
              price: '99.00',
              quantity: 1
            },
            {
              id: 2,
              name: i18n.translate('优质商品B'),
              image: '/images/placeholder.svg',
              price: '100.00',
              quantity: 1
            }
          ]
        },
        {
          id: 'ORD20230928001',
          status: 'shipped',
          statusText: i18n.translate('已发货'),
          createTime: '2023-09-28 14:20:00',
          totalAmount: '79.00',
          items: [
            {
              id: 3,
              name: i18n.translate('优质商品C'),
              image: '/images/placeholder.svg',
              price: '79.00',
              quantity: 1
            }
          ]
        },
        {
          id: 'ORD20230925001',
          status: 'completed',
          statusText: i18n.translate('已完成'),
          createTime: '2023-09-25 16:45:00',
          totalAmount: '129.00',
          items: [
            {
              id: 4,
              name: i18n.translate('优质商品D'),
              image: '/images/placeholder.svg',
              price: '129.00',
              quantity: 1
            }
          ]
        }
      ];

      // 根据当前选中的标签筛选订单
      const filteredOrders = this.data.activeTab === 'all' 
        ? mockOrders 
        : mockOrders.filter(order => order.status === this.data.activeTab);

      this.setData({
        orders: filteredOrders,
        'pagination.total': filteredOrders.length,
        loading: false,
        loadTimer: null
      });
      
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ loadTimer });
  },

  /**
   * 加载更多订单
   * @returns {void}
   */
  loadMoreOrders() {
    if (!this.data.pagination.hasMore) return;
    
    this.setData({ loading: true });
    const loadMoreTimer = setTimeout(() => {
      const { orders, pagination } = this.data;
      const newOrders = [
        {
          id: `ORD2023092000${pagination.page + 1}`,
          status: 'cancelled',
          statusText: i18n.translate('已取消'),
          createTime: '2023-09-20 11:15:00',
          totalAmount: '89.00',
          items: [
            {
              id: 5,
              name: i18n.translate('优质商品E'),
              image: '/images/placeholder.svg',
              price: '89.00',
              quantity: 1
            }
          ]
        }
      ];
      
      const updatedOrders = [...orders, ...newOrders];
      const hasMore = updatedOrders.length < pagination.total;
      
      this.setData({
        orders: updatedOrders,
        'pagination.page': pagination.page + 1,
        'pagination.hasMore': hasMore,
        loading: false,
        loadMoreTimer: null
      });
    }, 300);
    
    this.setData({ loadMoreTimer });
  },

  /**
   * 切换标签页
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  switchTab(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ 
      activeTab: tab,
      'pagination.page': 1,
      'pagination.hasMore': true
    });
    this.loadOrders();
  },

  /**
   * 跳转到订单详情页
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${id}`
    });
  },

  /**
   * 取消订单
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  cancelOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('取消订单，ID:', id);
    wx.showModal({
      title: i18n.translate('提示'),
      content: i18n.translate('确定要取消该订单吗？'),
      success: (res) => {
        if (res.confirm) {
          // 实际项目中应该调用API取消订单
          wx.showToast({
            title: i18n.translate('订单已取消'),
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  /**
   * 确认收货
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  confirmReceipt(e) {
    const { id } = e.currentTarget.dataset;
    console.log('确认收货，订单ID:', id);
    wx.showModal({
      title: i18n.translate('提示'),
      content: i18n.translate('确认已收到商品吗？'),
      success: (res) => {
        if (res.confirm) {
          // 实际项目中应该调用API确认收货
          wx.showToast({
            title: i18n.translate('已确认收货'),
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  /**
   * 立即付款
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  payOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('立即付款，订单ID:', id);
    // 实际项目中应该跳转到支付页面
    wx.showToast({
      title: i18n.translate('跳转到支付页面'),
      icon: 'none'
    });
  },

  /**
   * 查看物流
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  trackOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('查看物流，订单ID:', id);
    // 实际项目中应该跳转到物流页面
    wx.showToast({
      title: i18n.translate('跳转到物流页面'),
      icon: 'none'
    });
  }
});