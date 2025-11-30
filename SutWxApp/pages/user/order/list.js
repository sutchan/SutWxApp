/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 璁㈠崟鍒楄〃椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    activeTab: 0,
    tabs: [
      { title: '鍏ㄩ儴', type: 'all' },
      { title: '寰呬粯娆?, type: 'pendingPayment' },
      { title: '寰呭彂璐?, type: 'pendingDelivery' },
      { title: '寰呮敹璐?, type: 'pendingReceipt' },
      { title: '宸插畬鎴?, type: 'completed' },
      { title: '宸插彇娑?, type: 'cancelled' }
    ],
    orderList: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad() {
    this.loadOrderList();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣紝闃叉鍐呭瓨娉勬紡
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 澶勭悊 Tab 鍒囨崲
   * @param {Object} e - 浜嬩欢瀵硅薄
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
   * 鍔犺浇璁㈠崟鍒楄〃
   */
  loadOrderList() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    const { activeTab, tabs, page, pageSize } = this.data;
    const orderType = tabs[activeTab].type;

    // 妯℃嫙鏁版嵁鍔犺浇
    const timer = setTimeout(() => {
      const mockOrders = [];
      for (let i = 0; i < pageSize; i++) {
        mockOrders.push({
          id: `ORDER_${orderType}_${(page - 1) * pageSize + i + 1}`,
          orderNo: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          status: tabs[activeTab].title,
          totalPrice: (Math.random() * 100 + 10).toFixed(2),
          items: [
            {
              name: `鍟嗗搧鍚嶇О ${i + 1}`,
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
        hasMore: mockOrders.length === pageSize, // 鍋囪濡傛灉杩斿洖鐨勬暟閲忓皬浜?pageSize锛屽垯娌℃湁鏇村鏁版嵁浜?        loading: false,
        timer: null
      });
    }, 1000);
    
    this.setData({ timer });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom() {
    this.loadOrderList();
  },

  /**
   * 璺宠浆鍒拌鍗曡鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/order/detail/detail?id=${id}`
    });
  }
});