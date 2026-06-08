
/**
 * 文件名: index.js
 * 版本号: 2.0.0
 * 更新日期: 2026-05-06
 * 描述: 购物车页面，展示购物车商品列表，支持数量调整、删除商品和结算功能
 */

const cartService = require('../../services/cartService');

Page({
  data: {
    cartList: [],
    totalPrice: 0,
    totalCount: 0,
    selectAll: false,
    loading: false,
    empty: false
  },

  onLoad() {
    this.loadCartList();
  },

  onShow() {
    this.loadCartList();
  },

  /**
   * 加载购物车列表
   */
  async loadCartList() {
    try {
      this.setData({ loading: true });
      const cartList = await cartService.getCartList();
      const totalPrice = this.calculateTotalPrice(cartList);
      const totalCount = this.calculateTotalCount(cartList);
      const selectAll = this.checkSelectAll(cartList);

      this.setData({
        cartList,
        totalPrice,
        totalCount,
        selectAll,
        empty: cartList.length === 0,
        loading: false
      });
    } catch (error) {
      console.error('加载购物车失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 计算选中商品的总价
   */
  calculateTotalPrice(cartList) {
    return cartList
      .filter(item =&gt; item.selected)
      .reduce((total, item) =&gt; {
        return total + (item.price * item.quantity);
      }, 0);
  },

  /**
   * 计算选中商品的总数量
   */
  calculateTotalCount(cartList) {
    return cartList
      .filter(item =&gt; item.selected)
      .reduce((total, item) =&gt; {
        return total + item.quantity;
      }, 0);
  },

  /**
   * 检查是否全选
   */
  checkSelectAll(cartList) {
    if (cartList.length === 0) return false;
    return cartList.every(item =&gt; item.selected);
  },

  /**
   * 选择商品
   */
  onSelectItem(e) {
    const { index } = e.currentTarget.dataset;
    const cartList = [...this.data.cartList];
    cartList[index].selected = !cartList[index].selected;

    const totalPrice = this.calculateTotalPrice(cartList);
    const totalCount = this.calculateTotalCount(cartList);
    const selectAll = this.checkSelectAll(cartList);

    this.setData({
      cartList,
      totalPrice,
      totalCount,
      selectAll
    });

    this.updateCartItem(cartList[index]);
  },

  /**
   * 全选/取消全选
   */
  onSelectAll() {
    const selectAll = !this.data.selectAll;
    const cartList = this.data.cartList.map(item =&gt; ({
      ...item,
      selected: selectAll
    }));

    const totalPrice = this.calculateTotalPrice(cartList);
    const totalCount = this.calculateTotalCount(cartList);

    this.setData({
      cartList,
      totalPrice,
      totalCount,
      selectAll
    });

    cartList.forEach(item =&gt; this.updateCartItem(item));
  },

  /**
   * 增加商品数量
   */
  onIncreaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const cartList = [...this.data.cartList];
    const item = cartList[index];
    item.quantity += 1;

    const totalPrice = this.calculateTotalPrice(cartList);
    const totalCount = this.calculateTotalCount(cartList);

    this.setData({
      cartList,
      totalPrice,
      totalCount
    });

    this.updateCartItem(item);
  },

  /**
   * 减少商品数量
   */
  onDecreaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const cartList = [...this.data.cartList];
    const item = cartList[index];

    if (item.quantity &lt;= 1) {
      this.onDeleteItem(e);
      return;
    }

    item.quantity -= 1;

    const totalPrice = this.calculateTotalPrice(cartList);
    const totalCount = this.calculateTotalCount(cartList);

    this.setData({
      cartList,
      totalPrice,
      totalCount
    });

    this.updateCartItem(item);
  },

  /**
   * 删除商品
   */
  async onDeleteItem(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.cartList[index];

    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: async (res) =&gt; {
        if (res.confirm) {
          try {
            await cartService.removeFromCart(item.id);
            this.loadCartList();
          } catch (error) {
            console.error('删除商品失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 更新购物车商品
   */
  async updateCartItem(item) {
    try {
      await cartService.updateCartItem(item);
    } catch (error) {
      console.error('更新购物车失败:', error);
    }
  },

  /**
   * 结算
   */
  onCheckout() {
    const selectedItems = this.data.cartList.filter(item =&gt; item.selected);

    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/order/confirm?items=' + encodeURIComponent(JSON.stringify(selectedItems))
    });
  },

  /**
   * 去逛逛
   */
  onGoShopping() {
    wx.switchTab({
      url: '/pages/home/index'
    });
  }
});

