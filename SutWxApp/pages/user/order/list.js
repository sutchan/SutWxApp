/**
 * 文件名 list.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 璁㈠崟閸掓銆冩い鐢告桨
 */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    activeTab: 0,
    tabs: [
      { title: '閸忋劑鍎?, type: 'all' },
      { title: '瀵板懍绮▎?, type: 'pendingPayment' },
      { title: '瀵板懎褰傜拹?, type: 'pendingDelivery' },
      { title: '瀵板懏鏁圭拹?, type: 'pendingReceipt' },
      { title: '瀹告彃鐣幋?, type: 'completed' },
      { title: '瀹告彃褰囧☉?, type: 'cancelled' }
    ],
    orderList: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    timer: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad() {
    this.loadOrderList();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   */
  onUnload() {
    // 濞撳懐鎮婄€规碍妞傞崳顭掔礉闂冨弶顒涢崘鍛摠濞夊嫭绱?    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 婢跺嫮鎮?Tab 閸掑洦宕?   * @param {Object} e - 娴滃娆㈢€电钖?   */
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
   * 閸旂姾娴囪鍗曢崚妤勩€?   */
  loadOrderList() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    const { activeTab, tabs, page, pageSize } = this.data;
    const orderType = tabs[activeTab].type;

    // 濡剝瀚欓弫鐗堝祦閸旂姾娴?    const timer = setTimeout(() => {
      const mockOrders = [];
      for (let i = 0; i < pageSize; i++) {
        mockOrders.push({
          id: `ORDER_${orderType}_${(page - 1) * pageSize + i + 1}`,
          orderNo: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          status: tabs[activeTab].title,
          totalPrice: (Math.random() * 100 + 10).toFixed(2),
          items: [
            {
              name: `閸熷棗鎼ч崥宥囆?${i + 1}`,
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
        hasMore: mockOrders.length === pageSize, // 閸嬪洩顔曟俊鍌涚亯鏉╂柨娲栭惃鍕殶闁插繐鐨禍?pageSize閿涘苯鍨▽鈩冩箒閺囨潙顦块弫鐗堝祦娴?        loading: false,
        timer: null
      });
    }, 1000);
    
    this.setData({ timer });
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom() {
    this.loadOrderList();
  },

  /**
   * 鐠哄疇娴嗛崚鎷岊吂閸楁洝顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/order/detail/detail?id=${id}`
    });
  }
});
