锘?/ list.js - 鐠併垹宕熼崚妤勩€冩い鐢告桨

// 鐎电厧鍙嗛張宥呭閸滃苯浼愰崗?import orderService from '../../utils/order-service';
import { showToast, showLoading, hideLoading, showConfirm } from '../../utils/global';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    // 鐠併垹宕熼悩鑸碘偓浣圭垼缁?    tabs: [
      { key: 'all', title: '閸忋劑鍎? },
      { key: 'pending_payment', title: '瀵板懍绮▎? },
      { key: 'pending_shipment', title: '瀵板懎褰傜拹? },
      { key: 'pending_receipt', title: '瀵板懏鏁圭拹? },
      { key: 'completed', title: '瀹告彃鐣幋? },
      { key: 'cancelled', title: '瀹告彃褰囧☉? }
    ],
    // 瑜版挸澧犻柅澶夎厬閻ㄥ嫭鐖ｇ粵?    activeTab: 'all',
    // 鐠併垹宕熼崚妤勩€?    orderList: [],
    // 閸旂姾娴囬悩鑸碘偓?    loading: false,
    // 閸旂姾娴囬弴鏉戭樋閻樿埖鈧?    loadingMore: false,
    // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    hasMore: true,
    // 妞ょ數鐖?    page: 1,
    // 濮ｅ繘銆夐弫浼村櫤
    pageSize: 10,
    // 缁岃櫣濮搁幀?    empty: false,
    // 娑撳濯洪崚閿嬫煀閻樿埖鈧?    refreshing: false,
    // 鐠併垹宕熼悩鑸碘偓浣规Ё鐏?    orderStatusMap: {
      'pending_payment': '瀵板懍绮▎?,
      'pending_shipment': '瀵板懎褰傜拹?,
      'pending_receipt': '瀵板懏鏁圭拹?,
      'completed': '瀹告彃鐣幋?,
      'cancelled': '瀹告彃褰囧☉?,
      'refunding': '闁偓濞嗗彞鑵?
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    // 婵″倹鐏夐張澶夌炊閸忋儴顓归崡鏇犲Ц閹緤绱濋崚鍥ㄥ床閸掓澘顕惔鏃€鐖ｇ粵?    if (options.status) {
      const tab = this.data.tabs.find(t => t.key === options.status);
      if (tab) {
        this.setData({ activeTab: options.status });
      }
    }
    
    // 閸旂姾娴囩拋銏犲礋閸掓銆?    this.loadOrders();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 婵″倹鐏夐弰顖欑矤閸忔湹绮い鐢告桨鏉╂柨娲栭敍灞藉煕閺傛澘缍嬮崜宥呭灙鐞?    if (this.data.orderList.length > 0) {
      this.refreshOrders();
    }
  },

  /**
   * 閸掑洦宕查弽鍥╊劮
   */
  switchTab: function (e) {
    const tabKey = e.currentTarget.dataset.key;
    
    if (this.data.activeTab !== tabKey) {
      this.setData({
        activeTab: tabKey,
        orderList: [],
        page: 1,
        hasMore: true,
        empty: false
      });
      
      // 閸旂姾娴囩€电懓绨查悩鑸碘偓浣烘畱鐠併垹宕?      this.loadOrders();
    }
  },

  /**
   * 閸旂姾娴囩拋銏犲礋閸掓銆?   */
  loadOrders: async function () {
    try {
      // 婵″倹鐏夊▽鈩冩箒閺囨潙顦块弫鐗堝祦閹存牗顒滈崷銊ュ鏉炴枻绱濋崚娆庣瑝缂佈呯敾閸旂姾娴?      if (!this.data.hasMore || this.data.loading || this.data.loadingMore) {
        return;
      }
      
      // 鐠佸墽鐤嗛崝鐘烘祰閻樿埖鈧?      if (this.data.page === 1) {
        this.setData({ loading: true });
      } else {
        this.setData({ loadingMore: true });
      }
      
      // 閺嬪嫬缂撶拠閿嬬湴閸欏倹鏆?      const params = {
        page: this.data.page,
        page_size: this.data.pageSize
      };
      
      // 婵″倹鐏夋稉宥嗘Ц閸忋劑鍎寸拋銏犲礋閿涘本鍧婇崝鐘靛Ц閹胶鐡柅?      if (this.data.activeTab !== 'all') {
        params.status = this.data.activeTab;
      }
      
      // 閼惧嘲褰囩拋銏犲礋閸掓銆?      const result = await orderService.getOrderList(params);
      
      if (result && result.orders) {
        // 婢跺嫮鎮婄拋銏犲礋閺佺増宓?        const orders = result.orders.map(order => ({
          ...order,
          status_text: this.data.orderStatusMap[order.status] || '閺堫亞鐓￠悩鑸碘偓?,
          formatted_created_at: this.formatDate(order.created_at)
        }));
        
        // 閸氬牆鑻熺拋銏犲礋閸掓銆?        const newOrderList = this.data.page === 1 ? orders : [...this.data.orderList, ...orders];
        
        // 閸掋倖鏌囬弰顖氭儊鏉╂ɑ婀侀弴鏉戭樋閺佺増宓?        const hasMore = orders.length === this.data.pageSize;
        
        this.setData({
          orderList: newOrderList,
          hasMore,
          empty: newOrderList.length === 0,
          page: this.data.page + 1
        });
      } else {
        this.setData({
          empty: true,
          hasMore: false
        });
      }
      
    } catch (error) {
      console.error('閸旂姾娴囩拋銏犲礋閸掓銆冩径杈Е:', error);
      showToast(error.message || '閸旂姾娴囩拋銏犲礋婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, { icon: 'none' });
    } finally {
      // 濞撳懘娅庨崝鐘烘祰閻樿埖鈧?      this.setData({ 
        loading: false, 
        loadingMore: false,
        refreshing: false 
      });
    }
  },

  /**
   * 閸掗攱鏌婄拋銏犲礋閸掓銆?   */
  refreshOrders: function () {
    this.setData({
      page: 1,
      orderList: [],
      hasMore: true,
      empty: false,
      refreshing: true
    });
    
    this.loadOrders();
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋鐠併垹宕?   */
  loadMoreOrders: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadOrders();
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function () {
    this.refreshOrders();
  },

  /**
   * 娑撳﹥濯洪崝鐘烘祰閺囨潙顦?   */
  onReachBottom: function () {
    this.loadMoreOrders();
  },

  /**
   * 閺屻儳婀呯拋銏犲礋鐠囷附鍎?   */
  viewOrderDetail: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    });
  },

  /**
   * 閸樼粯鏁禒?   */
  goToPay: function (e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({
      url: `/pages/payment/pay?orderId=${order.id}&amount=${order.total_amount}`
    });
  },

  /**
   * 閸欐牗绉风拋銏犲礋
   */
  cancelOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    
    showConfirm('绾喖鐣剧憰浣稿絿濞戝牐顕氱拋銏犲礋閸氭绱?, async (res) => {
      if (res.confirm) {
        try {
          showLoading('濮濓絽婀崣鏍ㄧХ鐠併垹宕?..');
          await orderService.cancelOrder(orderId);
          hideLoading();
          showToast('鐠併垹宕熷鎻掑絿濞?, { icon: 'success' });
          
          // 閸掗攱鏌婄拋銏犲礋閸掓銆?          this.refreshOrders();
        } catch (error) {
          hideLoading();
          console.error('閸欐牗绉风拋銏犲礋婢惰精瑙?', error);
          showToast(error.message || '閸欐牗绉风拋銏犲礋婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, { icon: 'none' });
        }
      }
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   */
  confirmReceipt: function (e) {
    const orderId = e.currentTarget.dataset.id;
    
    showConfirm('绾喛顓诲鍙夋暪閸掓澘鏅㈤崫浣告偋閿?, async (res) => {
      if (res.confirm) {
        try {
          showLoading('濮濓絽婀涵顔款吇閺€鎯版彛...');
          await orderService.confirmReceipt(orderId);
          hideLoading();
          showToast('绾喛顓婚弨鎯版彛閹存劕濮?, { icon: 'success' });
          
          // 閸掗攱鏌婄拋銏犲礋閸掓銆?          this.refreshOrders();
        } catch (error) {
          hideLoading();
          console.error('绾喛顓婚弨鎯版彛婢惰精瑙?', error);
          showToast(error.message || '绾喛顓婚弨鎯版彛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, { icon: 'none' });
        }
      }
    });
  },

  /**
   * 閸掔娀娅庣拋銏犲礋
   */
  deleteOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    
    showConfirm('绾喖鐣剧憰浣稿灩闂勩倛顕氱拋銏犲礋閸氭绱甸崚鐘绘珟閸氬簼绗夐崣顖涗划婢跺秲鈧?, async (res) => {
      if (res.confirm) {
        try {
          showLoading('濮濓絽婀崚鐘绘珟鐠併垹宕?..');
          await orderService.deleteOrder(orderId);
          hideLoading();
          showToast('鐠併垹宕熷鎻掑灩闂?, { icon: 'success' });
          
          // 閸掗攱鏌婄拋銏犲礋閸掓銆?          this.refreshOrders();
        } catch (error) {
          hideLoading();
          console.error('閸掔娀娅庣拋銏犲礋婢惰精瑙?', error);
          showToast(error.message || '閸掔娀娅庣拋銏犲礋婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, { icon: 'none' });
        }
      }
    });
  },

  /**
   * 鐠囧嫪鐜拋銏犲礋
   */
  reviewOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/review?id=${orderId}`
    });
  },

  /**
   * 閸愬秵顐肩拹顓濇嫳
   */
  buyAgain: function (e) {
    const order = e.currentTarget.dataset.order;
    
    // 鐏忓棜顓归崡鏇炴櫌閸濅焦鍧婇崝鐘插煂鐠愵厾澧挎潪?    if (order.items && order.items.length > 0) {
      const items = order.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        sku_id: item.sku_id
      }));
      
      wx.navigateTo({
        url: `/pages/cart/cart?buyAgain=true&items=${encodeURIComponent(JSON.stringify(items))}`
      });
    }
  },

  /**
   * 閺屻儳婀呴悧鈺傜ウ
   */
  viewLogistics: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/logistics?id=${orderId}`
    });
  },

  /**
   * 閺嶇厧绱￠崠鏍ㄦ）閺?   */
  formatDate: function (dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  },

  /**
   * 鏉╂柨娲栨＃鏍€?   */
  backToHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});\n