/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 订单鍒楄〃椤甸潰
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.status - 订单鐘舵€?   * @returns {void}
   */
  onLoad(options) {
    if (options.status) {
      this.setData({ activeTab: options.status });
    }
    
    this.loadOrders();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊鎵€鏈夊畾鏃跺櫒锛岄槻姝㈠唴瀛樻硠婕?    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadMoreTimer) {
      clearTimeout(this.data.loadMoreTimer);
    }
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 浠庡叾浠栭〉闈㈣繑鍥炴椂鍒锋柊订单鍒楄〃
    this.loadOrders();
  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
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
   * 瑙﹀簳鍔犺浇鏇村
   * @returns {void}
   */
  onReachBottom() {
    if (this.data.pagination.hasMore) {
      this.loadMoreOrders();
    }
  },

  /**
   * 鍔犺浇订单鍒楄〃
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadOrders(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD20231001001',
          status: 'pending',
          statusText: i18n.translate('寰呬粯娆?),
          createTime: '2023-10-01 10:30:00',
          totalAmount: '199.00',
          items: [
            {
              id: 1,
              name: i18n.translate('浼樿川鍟嗗搧A'),
              image: '/images/placeholder.svg',
              price: '99.00',
              quantity: 1
            },
            {
              id: 2,
              name: i18n.translate('浼樿川鍟嗗搧B'),
              image: '/images/placeholder.svg',
              price: '100.00',
              quantity: 1
            }
          ]
        },
        {
          id: 'ORD20230928001',
          status: 'shipped',
          statusText: i18n.translate('宸插彂璐?),
          createTime: '2023-09-28 14:20:00',
          totalAmount: '79.00',
          items: [
            {
              id: 3,
              name: i18n.translate('浼樿川鍟嗗搧C'),
              image: '/images/placeholder.svg',
              price: '79.00',
              quantity: 1
            }
          ]
        },
        {
          id: 'ORD20230925001',
          status: 'completed',
          statusText: i18n.translate('宸插畬鎴?),
          createTime: '2023-09-25 16:45:00',
          totalAmount: '129.00',
          items: [
            {
              id: 4,
              name: i18n.translate('浼樿川鍟嗗搧D'),
              image: '/images/placeholder.svg',
              price: '129.00',
              quantity: 1
            }
          ]
        }
      ];

      // 鏍规嵁褰撳墠閫変腑鐨勬爣绛剧瓫閫夎鍗?      const filteredOrders = this.data.activeTab === 'all' 
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
   * 鍔犺浇鏇村订单
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
          statusText: i18n.translate('宸插彇娑?),
          createTime: '2023-09-20 11:15:00',
          totalAmount: '89.00',
          items: [
            {
              id: 5,
              name: i18n.translate('浼樿川鍟嗗搧E'),
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
   * 鍒囨崲鏍囩椤?   * @param {Object} e - 浜嬩欢瀵硅薄
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
   * 璺宠浆鍒拌鍗曡鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${id}`
    });
  },

  /**
   * 鍙栨秷订单
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  cancelOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('鍙栨秷订单锛孖D:', id);
    wx.showModal({
      title: i18n.translate('鎻愮ず'),
      content: i18n.translate('纭畾瑕佸彇娑堣订单鍚楋紵'),
      success: (res) => {
        if (res.confirm) {
          // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI鍙栨秷订单
          wx.showToast({
            title: i18n.translate('订单宸插彇娑?),
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  /**
   * 纭鏀惰揣
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  confirmReceipt(e) {
    const { id } = e.currentTarget.dataset;
    console.log('纭鏀惰揣锛岃鍗旾D:', id);
    wx.showModal({
      title: i18n.translate('鎻愮ず'),
      content: i18n.translate('纭宸叉敹鍒板晢鍝佸悧锛?),
      success: (res) => {
        if (res.confirm) {
          // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI纭鏀惰揣
          wx.showToast({
            title: i18n.translate('宸茬‘璁ゆ敹璐?),
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  /**
   * 绔嬪嵆浠樻
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  payOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('绔嬪嵆浠樻锛岃鍗旾D:', id);
    // 瀹為檯椤圭洰涓簲璇ヨ烦杞埌鏀粯椤甸潰
    wx.showToast({
      title: i18n.translate('璺宠浆鍒版敮浠橀〉闈?),
      icon: 'none'
    });
  },

  /**
   * 鏌ョ湅鐗╂祦
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  trackOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('鏌ョ湅鐗╂祦锛岃鍗旾D:', id);
    // 瀹為檯椤圭洰涓簲璇ヨ烦杞埌鐗╂祦椤甸潰
    wx.showToast({
      title: i18n.translate('璺宠浆鍒扮墿娴侀〉闈?),
      icon: 'none'
    });
  }
});
