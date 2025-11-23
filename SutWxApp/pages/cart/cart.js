/**
 * 文件名: cart.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 购物车页面
 */
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
   * 生命周期函数--监听页面加载
   * @returns {void}
   */
  onLoad() {
    this.loadCartData();
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 每次显示页面时刷新购物车数据
    this.loadCartData();
  },

  /**
   * 下拉刷新回调
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadCartData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载购物车数据
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadCartData(done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockCartItems = [
        { 
          id: 1, 
          name: i18n.translate('商品A'), 
          image: '/assets/images/product1.jpg', 
          price: '99.00',
          quantity: 1,
          selected: false
        },
        { 
          id: 2, 
          name: i18n.translate('商品B'), 
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
   * 计算总价
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
   * 切换商品选中状态
   * @param {Object} e - 事件对象
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
   * 全选/取消全选
   * @returns {void}
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
   * 增加商品数量
   * @param {Object} e - 事件对象
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
   * 减少商品数量
   * @param {Object} e - 事件对象
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
   * 删除商品
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  removeItem(e) {
    const { index } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    
    wx.showModal({
      title: i18n.translate('提示'),
      content: i18n.translate('确定要删除这个商品吗？'),
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
   * 跳转到结算页面
   * @returns {void}
   */
  goToCheckout() {
    const { selectedItems } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: i18n.translate('请选择商品'),
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/order/confirm?ids=${selectedItems.join(',')}`
    });
  },

  /**
   * 跳转到商品详情页
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});