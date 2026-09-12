/**
 * 文件名: index.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 购物车页面，展示购物车商品列表，支持数量调整、删除商品和结算（计算见 calc.js）
 */

const cartService = require('../../services/cartService');
const { buildCartState } = require('./calc');

const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    cartList: [],
    totalPrice: 0,
    totalPriceText: '0.00',
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
      this.setData({ ...buildCartState(cartList), loading: false });
    } catch (error) {
      console.error('加载购物车失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  /**
   * 选择商品
   */
  onSelectItem(e) {
    const { index } = e.currentTarget.dataset;
    const cartList = [...this.data.cartList];
    cartList[index].selected = !cartList[index].selected;
    this.setData(buildCartState(cartList));
    this.updateCartItem(cartList[index]);
  },

  /**
   * 全选/取消全选
   */
  onSelectAll() {
    const selectAll = !this.data.selectAll;
    const cartList = this.data.cartList.map((item) => ({ ...item, selected: selectAll }));
    this.setData(buildCartState(cartList));
    cartList.forEach((item) => this.updateCartItem(item));
  },

  /**
   * 增加商品数量
   */
  onIncreaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const cartList = [...this.data.cartList];
    cartList[index].quantity += 1;
    this.setData(buildCartState(cartList));
    this.updateCartItem(cartList[index]);
  },

  /**
   * 减少商品数量
   */
  onDecreaseQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const cartList = [...this.data.cartList];
    const item = cartList[index];

    if (item.quantity <= 1) {
      this.onDeleteItem(e);
      return;
    }

    item.quantity -= 1;
    this.setData(buildCartState(cartList));
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
      success: async (res) => {
        if (res.confirm) {
          try {
            await cartService.removeFromCart(item.id);
            this.loadCartList();
          } catch (error) {
            console.error('删除商品失败:', error);
            wx.showToast({ title: '删除失败', icon: 'none' });
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
    const selectedItems = this.data.cartList.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      wx.showToast({ title: '请选择要结算的商品', icon: 'none' });
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
    wx.switchTab({ url: '/pages/home/index' });
  }
});
