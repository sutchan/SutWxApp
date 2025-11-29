/**
 * 鏂囦欢鍚? cart.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 璐墿杞﹂〉闈? */
const i18n = require('../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    cartItems: [],
    totalPrice: '0.00',
    selectedAll: false,
    selectedItems: [],
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @returns {void}
   */
  onLoad() {
    this.loadCartData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣紝闃叉鍐呭瓨娉勬紡
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 姣忔鏄剧ず椤甸潰鏃跺埛鏂拌喘鐗╄溅鏁版嵁
    this.loadCartData();
  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadCartData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 鍔犺浇璐墿杞︽暟鎹?   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadCartData(done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockCartItems = [
        { 
          id: 1, 
          name: i18n.translate('鍟嗗搧A'), 
          image: '/assets/images/product1.jpg', 
          price: '99.00',
          quantity: 1,
          selected: false
        },
        { 
          id: 2, 
          name: i18n.translate('鍟嗗搧B'), 
          image: '/assets/images/product2.jpg', 
          price: '129.00',
          quantity: 2,
          selected: false
        }
      ];

      this.setData({
        cartItems: mockCartItems,
        loading: false,
        timer: null
      });
      
      this.calculateTotal();
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ timer });
  },

  /**
   * 璁＄畻鎬讳环
   * @returns {void}
   */
  calculateTotal() {
    const { cartItems } = this.data;
    let totalPrice = 0;
    let selectedItems = [];
    
    cartItems.forEach(item => {
      if (item.selected) {
        totalPrice += parseFloat(item.price) * item.quantity;
        selectedItems.push(item.id);
      }
    });
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedItems,
      selectedAll: cartItems.length > 0 && cartItems.every(item => item.selected)
    });
  },

  /**
   * 鍒囨崲鍟嗗搧閫変腑鐘舵€?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  toggleItemSelection(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    cartItems[index].selected = !cartItems[index].selected;
    
    this.setData({ cartItems });
    this.calculateTotal();
  },

  /**
   * 鍏ㄩ€?鍙栨秷鍏ㄩ€?   * @returns {void}
   */
  toggleSelectAll() {
    const { cartItems, selectedAll } = this.data;
    const newSelectedAll = !selectedAll;
    
    cartItems.forEach(item => {
      item.selected = newSelectedAll;
    });
    
    this.setData({ 
      cartItems,
      selectedAll: newSelectedAll
    });
    
    this.calculateTotal();
  },

  /**
   * 澧炲姞鍟嗗搧鏁伴噺
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  increaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    cartItems[index].quantity += 1;
    
    this.setData({ cartItems });
    this.calculateTotal();
  },

  /**
   * 鍑忓皯鍟嗗搧鏁伴噺
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  decreaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity -= 1;
      this.setData({ cartItems });
      this.calculateTotal();
    }
  },

  /**
   * 鍒犻櫎鍟嗗搧
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  removeItem(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    wx.showModal({
      title: i18n.translate('鎻愮ず'),
      content: i18n.translate('纭畾瑕佸垹闄よ繖涓晢鍝佸悧锛?),
      success: (res) => {
        if (res.confirm) {
          cartItems.splice(index, 1);
          this.setData({ cartItems });
          this.calculateTotal();
        }
      }
    });
  },

  /**
   * 璺宠浆鍒扮粨绠楅〉闈?   * @returns {void}
   */
  goToCheckout() {
    const { selectedItems } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: i18n.translate('璇烽€夋嫨鍟嗗搧'),
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/order/confirm?ids=${selectedItems.join(',')}`
    });
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});