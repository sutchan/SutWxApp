/**
 * 鏂囦欢鍚? cart.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 鐠愵厾澧挎潪锕傘€夐棃? */
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @returns {void}
   */
  onLoad() {
    this.loadCartData();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婄€规碍妞傞崳顭掔礉闂冨弶顒涢崘鍛摠濞夊嫭绱?    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮璺哄煕閺傛媽鍠橀悧鈺勬簠閺佺増宓?    this.loadCartData();
  },

  /**
   * 娑撳濯洪崚閿嬫煀閸ョ偠鐨?   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadCartData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 閸旂姾娴囩拹顓犲⒖鏉烇附鏆熼幑?   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  loadCartData(done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockCartItems = [
        { 
          id: 1, 
          name: i18n.translate('閸熷棗鎼'), 
          image: '/assets/images/product1.jpg', 
          price: '99.00',
          quantity: 1,
          selected: false
        },
        { 
          id: 2, 
          name: i18n.translate('閸熷棗鎼'), 
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
   * 鐠侊紕鐣婚幀璁崇幆
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
   * 閸掑洦宕查崯鍡楁惂闁鑵戦悩鑸碘偓?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  toggleItemSelection(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    cartItems[index].selected = !cartItems[index].selected;
    
    this.setData({ cartItems });
    this.calculateTotal();
  },

  /**
   * 閸忋劑鈧?閸欐牗绉烽崗銊┾偓?   * @returns {void}
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
   * 婢х偛濮為崯鍡楁惂閺佷即鍣?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  increaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    cartItems[index].quantity += 1;
    
    this.setData({ cartItems });
    this.calculateTotal();
  },

  /**
   * 閸戝繐鐨崯鍡楁惂閺佷即鍣?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
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
   * 閸掔娀娅庨崯鍡楁惂
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  removeItem(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    wx.showModal({
      title: i18n.translate('閹绘劗銇?),
      content: i18n.translate('绾喖鐣剧憰浣稿灩闂勩倛绻栨稉顏勬櫌閸濅礁鎮ч敍?),
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
   * 鐠哄疇娴嗛崚鎵波缁犳銆夐棃?   * @returns {void}
   */
  goToCheckout() {
    const { selectedItems } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: i18n.translate('鐠囩兘鈧瀚ㄩ崯鍡楁惂'),
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/order/confirm?ids=${selectedItems.join(',')}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});
