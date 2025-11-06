// cart.js - 购物车页面

// 导入购物车服务
import cartService from '../../utils/cart-service';
import { showToast, showConfirm, showLoading, hideLoading } from '../../utils/global';
import { validateId, validateCartItemQuantity } from '../../utils/validator';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cartItems: [],
    totalPrice: 0,
    selectedCount: 0,
    allSelected: false,
    loading: false,
    refreshing: false,
    isEditing: false,
    checkedGoodsList: [],
    submitting: false // 防止重复提交
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadCartData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时重新加载购物车数据
    this.loadCartData();
  },

  /**
   * 页面卸载前清理请求
   */
  onUnload: function() {
    // 页面卸载时取消未完成的请求，避免内存泄漏
    cartService.clearCartCache();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true
    });
    // 强制刷新购物车数据
    this.loadCartData(true);
  },

  /**
   * 加载购物车数据
   */
  loadCartData: async function (forceRefresh = false) {
    try {
      this.setData({
        loading: true
      });
      
      const cartItems = await cartService.getCartItems({ forceRefresh });
      
      // 检查商品状态（下架、库存不足等）
      this.checkCartItemsStatus(cartItems);
      
      this.setData({
        cartItems: cartItems || []
      });
      
      // 初始化选中状态
      this.initSelectedState();
      
      // 计算总价和数量
      this.calculateTotal();
      
    } catch (error) {
      console.error('加载购物车数据失败:', error);
      showToast('加载购物车失败，请重试', { icon: 'none' });
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
    }
  },

  /**
   * 检查购物车商品状态
   */
  checkCartItemsStatus: function (cartItems) {
    // 检查商品是否可用、是否下架等
    cartItems.forEach(item => {
      // 重置状态标志
      item.unavailable = false;
      item.outOfStock = false;
      item.overStock = false;
      item.unavailableReason = '';
      
      if (!item.available || item.status !== 1) {
        item.unavailable = true;
        item.unavailableReason = item.statusText || '商品已下架或不可用';
      } else if (item.stock <= 0) {
        item.outOfStock = true;
        item.unavailableReason = '商品库存不足';
      } else if (item.quantity > item.stock) {
        item.overStock = true;
        item.availableQuantity = item.stock;
      }
    });
  },

  /**
   * 初始化选中状态
   */
  initSelectedState: function () {
    const cartItems = [...this.data.cartItems];
    
    // 默认选中可用的商品
    cartItems.forEach(item => {
      if (!item.unavailable && !item.outOfStock) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    
    this.setData({
      cartItems
    });
    
    // 检查是否全选
    this.checkAllSelected();
  },

  /**
   * 检查是否全选
   */
  checkAllSelected: function () {
    const availableItems = this.data.cartItems.filter(item => !item.unavailable && !item.outOfStock);
    
    if (availableItems.length === 0) {
      this.setData({
        allSelected: false
      });
      return;
    }
    
    const allSelected = availableItems.every(item => item.selected);
    
    this.setData({
      allSelected
    });
  },

  /**
   * 全选/取消全选
   */
  toggleAllSelected: function () {
    const allSelected = !this.data.allSelected;
    const cartItems = [...this.data.cartItems];
    
    // 更新选中状态
    cartItems.forEach(item => {
      if (!item.unavailable && !item.outOfStock) {
        item.selected = allSelected;
      }
    });
    
    this.setData({
      cartItems,
      allSelected
    });
    
    // 计算总价
    this.calculateTotal();
  },

  /**
   * 切换商品选中状态
   */
  toggleItemSelected: function (e) {
    const index = e.currentTarget.dataset.index;
    const cartItems = [...this.data.cartItems];
    
    // 切换选中状态
    cartItems[index].selected = !cartItems[index].selected;
    
    this.setData({
      cartItems
    });
    
    // 检查是否全选
    this.checkAllSelected();
    
    // 计算总价
    this.calculateTotal();
  },

  /**
   * 增加商品数量
   */
  increaseQuantity: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 检查商品是否可用
      if (item.unavailable || item.outOfStock) {
        return;
      }
      
      // 检查库存限制
      if (item.quantity >= item.stock) {
        showToast('已达到最大库存', { icon: 'none' });
        return;
      }
      
      const newQuantity = item.quantity + 1;
      
      // 数据验证
      validateCartItemQuantity(newQuantity);
      
      // 更新UI
      this.setData({
        [`cartItems[${index}].quantity`]: newQuantity,
        [`cartItems[${index}].loading`]: true
      });
      
      // 更新购物车
      await cartService.updateCartItem(item.id, newQuantity);
      
      // 计算总价
      this.calculateTotal();
      
    } catch (error) {
      console.error('增加商品数量失败:', error);
      showToast(error.message || '更新失败，请重试', { icon: 'none' });
      
      // 恢复原数量
      const index = e.currentTarget.dataset.index;
      this.setData({
        [`cartItems[${index}].loading`]: false
      });
      
      // 重新加载数据以确保准确性
      this.loadCartData();
    }
  },

  /**
   * 减少商品数量
   */
  decreaseQuantity: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 检查是否为最小值
      if (item.quantity <= 1) {
        return;
      }
      
      const newQuantity = item.quantity - 1;
      
      // 数据验证
      validateCartItemQuantity(newQuantity);
      
      // 更新UI
      this.setData({
        [`cartItems[${index}].quantity`]: newQuantity,
        [`cartItems[${index}].loading`]: true
      });
      
      // 更新购物车
      await cartService.updateCartItem(item.id, newQuantity);
      
      // 计算总价
      this.calculateTotal();
      
    } catch (error) {
      console.error('减少商品数量失败:', error);
      showToast(error.message || '更新失败，请重试', { icon: 'none' });
      
      // 恢复原数量
      const index = e.currentTarget.dataset.index;
      this.setData({
        [`cartItems[${index}].loading`]: false
      });
      
      // 重新加载数据以确保准确性
      this.loadCartData();
    }
  },

  /**
   * 删除购物车商品
   */
  deleteCartItem: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 显示确认对话框
      await showConfirm('确认从购物车中移除该商品吗？', '确认删除', '取消');
      
      showLoading('正在删除...');
      
      // 删除商品
      await cartService.deleteCartItem(item.id);
      
      // 更新本地数据
      const cartItems = [...this.data.cartItems];
      cartItems.splice(index, 1);
      
      this.setData({
        cartItems
      });
      
      // 计算总价
      this.calculateTotal();
      
      // 检查是否全选
      this.checkAllSelected();
      
      showToast('删除成功');
      
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '删除失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 批量删除选中的商品
   */
  deleteSelectedItems: async function () {
    try {
      // 获取选中的商品
      const selectedItems = this.data.cartItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        showToast('请选择要删除的商品', { icon: 'none' });
        return;
      }
      
      // 显示确认对话框
      await showConfirm(`确认删除选中的${selectedItems.length}件商品吗？`, '确认删除', '取消');
      
      showLoading('正在删除...');
      
      // 批量删除商品
      const itemIds = selectedItems.map(item => item.id);
      await cartService.deleteCartItems(itemIds);
      
      // 更新本地数据
      const cartItems = this.data.cartItems.filter(item => !item.selected);
      
      this.setData({
        cartItems,
        allSelected: false,
        isEditing: false
      });
      
      // 计算总价
      this.calculateTotal();
      
      showToast('删除成功');
      
    } catch (error) {
      console.error('批量删除购物车商品失败:', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '删除失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 清空购物车
   */
  clearCart: async function () {
    try {
      // 显示确认对话框
      await showConfirm('确认清空购物车吗？此操作不可恢复。', '确认清空', '取消');
      
      showLoading('正在清空购物车...');
      
      // 清空购物车
      await cartService.clearCart();
      
      // 更新本地数据
      this.setData({
        cartItems: [],
        totalPrice: 0,
        selectedCount: 0,
        allSelected: false,
        checkedGoodsList: []
      });
      
      showToast('购物车已清空');
      
    } catch (error) {
      console.error('清空购物车失败:', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '清空失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 将商品移至收藏
   */
  moveToFavorite: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 显示确认对话框
      await showConfirm('确认将此商品添加到收藏夹吗？添加后会从购物车中移除。', '确认添加', '取消');
      
      showLoading('正在添加到收藏夹...');
      
      // 移至收藏
      await cartService.moveToFavorite(item.id);
      
      // 更新本地数据
      const cartItems = [...this.data.cartItems];
      cartItems.splice(index, 1);
      
      this.setData({
        cartItems
      });
      
      // 计算总价
      this.calculateTotal();
      
      // 检查是否全选
      this.checkAllSelected();
      
      showToast('已添加到收藏夹');
      
    } catch (error) {
      console.error('移至收藏夹失败:', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '添加失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 计算总价和选中数量
   */
  calculateTotal: function () {
    const cartItems = this.data.cartItems;
    let totalPrice = 0;
    let selectedCount = 0;
    const checkedGoodsList = [];
    
    cartItems.forEach(item => {
      if (item.selected && !item.unavailable && !item.outOfStock) {
        totalPrice += item.price * item.quantity;
        selectedCount += item.quantity;
        checkedGoodsList.push(item);
      }
    });
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedCount,
      checkedGoodsList
    });
  },

  /**
   * 结算
   */
  checkout: async function () {
    try {
      // 防止重复提交
      if (this.data.submitting) {
        return;
      }
      
      this.setData({
        submitting: true
      });
      
      // 获取选中的商品
      const selectedItems = this.data.cartItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        showToast('请选择要结算的商品', { icon: 'none' });
        return;
      }
      
      // 检查选中商品是否可用
      const unavailableItems = selectedItems.filter(item => item.unavailable || item.outOfStock);
      if (unavailableItems.length > 0) {
        showToast('选中的商品中有不可用或库存不足的商品', { icon: 'none' });
        return;
      }
      
      // 检查库存
      const overStockItems = selectedItems.filter(item => item.overStock);
      if (overStockItems.length > 0) {
        showToast('部分商品库存不足，请调整数量后再结算', { icon: 'none' });
        return;
      }
      
      showLoading('正在检查库存...');
      
      // 二次检查库存（实时检查）
      const stockResult = await cartService.checkCartStock(selectedItems);
      
      if (stockResult.out_of_stock && stockResult.out_of_stock.length > 0) {
        showToast('部分商品库存不足，请刷新购物车后重试', { icon: 'none' });
        // 重新加载数据
        this.loadCartData(true);
        return;
      }
      
      // 构建订单数据
      const orderData = {
        items: selectedItems.map(item => ({
          cart_item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          sku_id: item.sku_id
        }))
      };
      
      // 跳转到结算页面
      wx.navigateTo({
        url: '/pages/checkout/checkout?orderData=' + encodeURIComponent(JSON.stringify(orderData)),
        fail: (err) => {
          console.error('跳转到结算页面失败:', err);
          showToast('跳转失败，请重试', { icon: 'none' });
        }
      });
      
    } catch (error) {
      console.error('结算失败:', error);
      showToast(error.message || '结算失败，请重试', { icon: 'none' });
    } finally {
      hideLoading();
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 编辑模式切换
   */
  toggleEditMode: function() {
    this.setData({
      isEditing: !this.data.isEditing
    });
  },

  /**
   * 跳转到商品详情
   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`
    });
  }
});