/**
 * 鏂囦欢鍚? list.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 璁㈠崟閸掓銆冩い鐢告桨
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.status - 璁㈠崟閻樿埖鈧?   * @returns {void}
   */
  onLoad(options) {
    if (options.status) {
      this.setData({ activeTab: options.status });
    }
    
    this.loadOrders();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婇幍鈧張澶婄暰閺冭泛娅掗敍宀勬Щ濮濄垹鍞寸€涙ɑ纭犲?    if (this.data.loadTimer) {
      clearTimeout(this.data.loadTimer);
    }
    if (this.data.loadMoreTimer) {
      clearTimeout(this.data.loadMoreTimer);
    }
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 娴犲骸鍙炬禒鏍€夐棃銏ｇ箲閸ョ偞妞傞崚閿嬫煀璁㈠崟閸掓銆?    this.loadOrders();
  },

  /**
   * 娑撳濯洪崚閿嬫煀閸ョ偠鐨?   * @returns {void}
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
   * 鐟欙箑绨抽崝鐘烘祰閺囨潙顦?   * @returns {void}
   */
  onReachBottom() {
    if (this.data.pagination.hasMore) {
      this.loadMoreOrders();
    }
  },

  /**
   * 閸旂姾娴囪鍗曢崚妤勩€?   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  loadOrders(done) {
    this.setData({ loading: true });
    const loadTimer = setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD20231001001',
          status: 'pending',
          statusText: i18n.translate('瀵板懍绮▎?),
          createTime: '2023-10-01 10:30:00',
          totalAmount: '199.00',
          items: [
            {
              id: 1,
              name: i18n.translate('娴兼宸濋崯鍡楁惂A'),
              image: '/images/placeholder.svg',
              price: '99.00',
              quantity: 1
            },
            {
              id: 2,
              name: i18n.translate('娴兼宸濋崯鍡楁惂B'),
              image: '/images/placeholder.svg',
              price: '100.00',
              quantity: 1
            }
          ]
        },
        {
          id: 'ORD20230928001',
          status: 'shipped',
          statusText: i18n.translate('瀹告彃褰傜拹?),
          createTime: '2023-09-28 14:20:00',
          totalAmount: '79.00',
          items: [
            {
              id: 3,
              name: i18n.translate('娴兼宸濋崯鍡楁惂C'),
              image: '/images/placeholder.svg',
              price: '79.00',
              quantity: 1
            }
          ]
        },
        {
          id: 'ORD20230925001',
          status: 'completed',
          statusText: i18n.translate('瀹告彃鐣幋?),
          createTime: '2023-09-25 16:45:00',
          totalAmount: '129.00',
          items: [
            {
              id: 4,
              name: i18n.translate('娴兼宸濋崯鍡楁惂D'),
              image: '/images/placeholder.svg',
              price: '129.00',
              quantity: 1
            }
          ]
        }
      ];

      // 閺嶈宓佽ぐ鎾冲闁鑵戦惃鍕垼缁涘墽鐡柅澶庮吂閸?      const filteredOrders = this.data.activeTab === 'all' 
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
   * 閸旂姾娴囬弴鏉戭樋璁㈠崟
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
          statusText: i18n.translate('瀹告彃褰囧☉?),
          createTime: '2023-09-20 11:15:00',
          totalAmount: '89.00',
          items: [
            {
              id: 5,
              name: i18n.translate('娴兼宸濋崯鍡楁惂E'),
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
   * 閸掑洦宕查弽鍥╊劮妞?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
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
   * 鐠哄疇娴嗛崚鎷岊吂閸楁洝顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${id}`
    });
  },

  /**
   * 閸欐牗绉疯鍗?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  cancelOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('閸欐牗绉疯鍗曢敍瀛朌:', id);
    wx.showModal({
      title: i18n.translate('閹绘劗銇?),
      content: i18n.translate('绾喖鐣剧憰浣稿絿濞戝牐顕氳鍗曢崥妤嬬吹'),
      success: (res) => {
        if (res.confirm) {
          // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I閸欐牗绉疯鍗?          wx.showToast({
            title: i18n.translate('璁㈠崟瀹告彃褰囧☉?),
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  confirmReceipt(e) {
    const { id } = e.currentTarget.dataset;
    console.log('绾喛顓婚弨鎯版彛閿涘矁顓归崡鏃綝:', id);
    wx.showModal({
      title: i18n.translate('閹绘劗銇?),
      content: i18n.translate('绾喛顓诲鍙夋暪閸掓澘鏅㈤崫浣告偋閿?),
      success: (res) => {
        if (res.confirm) {
          // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I绾喛顓婚弨鎯版彛
          wx.showToast({
            title: i18n.translate('瀹歌尙鈥樼拋銈嗘暪鐠?),
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    });
  },

  /**
   * 缁斿宓嗘禒妯活儥
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  payOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('缁斿宓嗘禒妯活儥閿涘矁顓归崡鏃綝:', id);
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ儲鏉烆剙鍩岄弨顖欑帛妞ょ敻娼?    wx.showToast({
      title: i18n.translate('鐠哄疇娴嗛崚鐗堟暜娴犳﹢銆夐棃?),
      icon: 'none'
    });
  },

  /**
   * 閺屻儳婀呴悧鈺傜ウ
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  trackOrder(e) {
    const { id } = e.currentTarget.dataset;
    console.log('閺屻儳婀呴悧鈺傜ウ閿涘矁顓归崡鏃綝:', id);
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ儲鏉烆剙鍩岄悧鈺傜ウ妞ょ敻娼?    wx.showToast({
      title: i18n.translate('鐠哄疇娴嗛崚鎵⒖濞翠線銆夐棃?),
      icon: 'none'
    });
  }
});
