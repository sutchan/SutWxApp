// list.js - 璁㈠崟鍒楄〃椤甸潰

// 瀵煎叆鏈嶅姟鍜屽伐鍏?import orderService from '../../utils/order-service';
import { showToast, showLoading, hideLoading, showConfirm } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 璁㈠崟鐘舵€佹爣绛?    tabs: [
      { key: 'all', title: '鍏ㄩ儴' },
      { key: 'pending_payment', title: '寰呬粯娆? },
      { key: 'pending_shipment', title: '寰呭彂璐? },
      { key: 'pending_receipt', title: '寰呮敹璐? },
      { key: 'completed', title: '宸插畬鎴? },
      { key: 'cancelled', title: '宸插彇娑? }
    ],
    // 褰撳墠閫変腑鐨勬爣绛?    activeTab: 'all',
    // 璁㈠崟鍒楄〃
    orderList: [],
    // 鍔犺浇鐘舵€?    loading: false,
    // 鍔犺浇鏇村鐘舵€?    loadingMore: false,
    // 鏄惁鏈夋洿澶氭暟鎹?    hasMore: true,
    // 椤电爜
    page: 1,
    // 姣忛〉鏁伴噺
    pageSize: 10,
    // 绌虹姸鎬?    empty: false,
    // 涓嬫媺鍒锋柊鐘舵€?    refreshing: false,
    // 璁㈠崟鐘舵€佹槧灏?    orderStatusMap: {
      'pending_payment': '寰呬粯娆?,
      'pending_shipment': '寰呭彂璐?,
      'pending_receipt': '寰呮敹璐?,
      'completed': '宸插畬鎴?,
      'cancelled': '宸插彇娑?,
      'refunding': '閫€娆句腑'
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    // 濡傛灉鏈変紶鍏ヨ鍗曠姸鎬侊紝鍒囨崲鍒板搴旀爣绛?    if (options.status) {
      const tab = this.data.tabs.find(t => t.key === options.status);
      if (tab) {
        this.setData({ activeTab: options.status });
      }
    }
    
    // 鍔犺浇璁㈠崟鍒楄〃
    this.loadOrders();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 濡傛灉鏄粠鍏朵粬椤甸潰杩斿洖锛屽埛鏂板綋鍓嶅垪琛?    if (this.data.orderList.length > 0) {
      this.refreshOrders();
    }
  },

  /**
   * 鍒囨崲鏍囩
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
      
      // 鍔犺浇瀵瑰簲鐘舵€佺殑璁㈠崟
      this.loadOrders();
    }
  },

  /**
   * 鍔犺浇璁㈠崟鍒楄〃
   */
  loadOrders: async function () {
    try {
      // 濡傛灉娌℃湁鏇村鏁版嵁鎴栨鍦ㄥ姞杞斤紝鍒欎笉缁х画鍔犺浇
      if (!this.data.hasMore || this.data.loading || this.data.loadingMore) {
        return;
      }
      
      // 璁剧疆鍔犺浇鐘舵€?      if (this.data.page === 1) {
        this.setData({ loading: true });
      } else {
        this.setData({ loadingMore: true });
      }
      
      // 鏋勫缓璇锋眰鍙傛暟
      const params = {
        page: this.data.page,
        page_size: this.data.pageSize
      };
      
      // 濡傛灉涓嶆槸鍏ㄩ儴璁㈠崟锛屾坊鍔犵姸鎬佺瓫閫?      if (this.data.activeTab !== 'all') {
        params.status = this.data.activeTab;
      }
      
      // 鑾峰彇璁㈠崟鍒楄〃
      const result = await orderService.getOrderList(params);
      
      if (result && result.orders) {
        // 澶勭悊璁㈠崟鏁版嵁
        const orders = result.orders.map(order => ({
          ...order,
          status_text: this.data.orderStatusMap[order.status] || '鏈煡鐘舵€?,
          formatted_created_at: this.formatDate(order.created_at)
        }));
        
        // 鍚堝苟璁㈠崟鍒楄〃
        const newOrderList = this.data.page === 1 ? orders : [...this.data.orderList, ...orders];
        
        // 鍒ゆ柇鏄惁杩樻湁鏇村鏁版嵁
        const hasMore = orders.length === this.data.pageSize;
        
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
      console.error('鍔犺浇璁㈠崟鍒楄〃澶辫触:', error);
      showToast(error.message || '鍔犺浇璁㈠崟澶辫触锛岃閲嶈瘯', { icon: 'none' });
    } finally {
      // 娓呴櫎鍔犺浇鐘舵€?      this.setData({ 
        loading: false, 
        loadingMore: false,
        refreshing: false 
      });
    }
  },

  /**
   * 鍒锋柊璁㈠崟鍒楄〃
   */
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
   * 鍔犺浇鏇村璁㈠崟
   */
  loadMoreOrders: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadOrders();
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function () {
    this.refreshOrders();
  },

  /**
   * 涓婃媺鍔犺浇鏇村
   */
  onReachBottom: function () {
    this.loadMoreOrders();
  },

  /**
   * 鏌ョ湅璁㈠崟璇︽儏
   */
  viewOrderDetail: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    });
  },

  /**
   * 鍘绘敮浠?   */
  goToPay: function (e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({
      url: `/pages/payment/pay?orderId=${order.id}&amount=${order.total_amount}`
    });
  },

  /**
   * 鍙栨秷璁㈠崟
   */
  cancelOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    
    showConfirm('纭畾瑕佸彇娑堣璁㈠崟鍚楋紵', async (res) => {
      if (res.confirm) {
        try {
          showLoading('姝ｅ湪鍙栨秷璁㈠崟...');
          await orderService.cancelOrder(orderId);
          hideLoading();
          showToast('璁㈠崟宸插彇娑?, { icon: 'success' });
          
          // 鍒锋柊璁㈠崟鍒楄〃
          this.refreshOrders();
        } catch (error) {
          hideLoading();
          console.error('鍙栨秷璁㈠崟澶辫触:', error);
          showToast(error.message || '鍙栨秷璁㈠崟澶辫触锛岃閲嶈瘯', { icon: 'none' });
        }
      }
    });
  },

  /**
   * 纭鏀惰揣
   */
  confirmReceipt: function (e) {
    const orderId = e.currentTarget.dataset.id;
    
    showConfirm('纭宸叉敹鍒板晢鍝佸悧锛?, async (res) => {
      if (res.confirm) {
        try {
          showLoading('姝ｅ湪纭鏀惰揣...');
          await orderService.confirmReceipt(orderId);
          hideLoading();
          showToast('纭鏀惰揣鎴愬姛', { icon: 'success' });
          
          // 鍒锋柊璁㈠崟鍒楄〃
          this.refreshOrders();
        } catch (error) {
          hideLoading();
          console.error('纭鏀惰揣澶辫触:', error);
          showToast(error.message || '纭鏀惰揣澶辫触锛岃閲嶈瘯', { icon: 'none' });
        }
      }
    });
  },

  /**
   * 鍒犻櫎璁㈠崟
   */
  deleteOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    
    showConfirm('纭畾瑕佸垹闄よ璁㈠崟鍚楋紵鍒犻櫎鍚庝笉鍙仮澶嶃€?, async (res) => {
      if (res.confirm) {
        try {
          showLoading('姝ｅ湪鍒犻櫎璁㈠崟...');
          await orderService.deleteOrder(orderId);
          hideLoading();
          showToast('璁㈠崟宸插垹闄?, { icon: 'success' });
          
          // 鍒锋柊璁㈠崟鍒楄〃
          this.refreshOrders();
        } catch (error) {
          hideLoading();
          console.error('鍒犻櫎璁㈠崟澶辫触:', error);
          showToast(error.message || '鍒犻櫎璁㈠崟澶辫触锛岃閲嶈瘯', { icon: 'none' });
        }
      }
    });
  },

  /**
   * 璇勪环璁㈠崟
   */
  reviewOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/review?id=${orderId}`
    });
  },

  /**
   * 鍐嶆璐拱
   */
  buyAgain: function (e) {
    const order = e.currentTarget.dataset.order;
    
    // 灏嗚鍗曞晢鍝佹坊鍔犲埌璐墿杞?    if (order.items && order.items.length > 0) {
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
   * 鏌ョ湅鐗╂祦
   */
  viewLogistics: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/logistics?id=${orderId}`
    });
  },

  /**
   * 鏍煎紡鍖栨棩鏈?   */
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
   * 杩斿洖棣栭〉
   */
  backToHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});