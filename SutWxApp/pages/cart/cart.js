// 购物车页面逻辑
const app = getApp();
const { showToast, showConfirm, showLoading, hideLoading } = app.global;
const cartService = app.services.cart;

Page({
  data: {
    cartItems: [], // 购物车商品列表
    loading: true, // 加载状态
    error: false, // 错误状态
    errorMsg: '', // 错误信息
    isAllSelected: false, // 是否全选
    totalPrice: 0, // 总价
    totalCount: 0, // 总数量
    refreshing: false, // 下拉刷新状态
    updatingItems: new Set(), // 正在更新的商品ID集合，防止重复提交
    submitting: false // 防止重复提交结算
  },
    
  finally {
    hideLoading();
    this.setData({ submitting: false });
  }

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // 记录页面访问事件
    if (app.analyticsService) {
      app.analyticsService.track('page_view', {
        page: 'cart'
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.loadCartItems();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // 取消所有购物车相关请求，避免页面卸载后请求仍在进行
    cartService.cancelCartRequests();
  },

  /**
   * 监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({ refreshing: true });
    this.loadCartItems({ forceRefresh: true });
  },

  /**
   * 加载购物车数据
   * @param {Object} options - 加载选项
   * @param {boolean} options.forceRefresh - 是否强制刷新（不使用缓存）
   */
  async loadCartItems(options = {}) {
    try {
      // 检查是否登录
      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          refreshing: false,
          cartItems: [],
          isAllSelected: false,
          totalPrice: 0,
          totalCount: 0
        });
        wx.stopPullDownRefresh();
        return;
      }
      
      this.setData({
        loading: true,
        error: false
      });

      // 使用cartService获取购物车数据，支持强制刷新
      const res = await cartService.getCartItems(options.forceRefresh ? { useCache: false } : {});
      const cartItems = res.items || [];
      
      // 检查商品状态（库存、价格等）
      const itemsWithStatus = await cartService.checkCartItemStatus(cartItems);
      
      // 为每个商品添加选中状态
      const itemsWithSelection = itemsWithStatus.map(item => ({
        ...item,
        selected: true,
        // 添加商品状态标记
        isOutOfStock: !item.available || (item.sku && item.sku.stock <= 0) || (item.product && item.product.stock <= 0),
        hasPriceChanged: item.priceChanged
      }));
      
      this.setData({
        cartItems: itemsWithSelection,
        isAllSelected: itemsWithSelection.length > 0,
        loading: false,
        refreshing: false
      });
      
      // 计算总价和总数量
      this.calculateTotal();
      
      // 检查是否有商品状态异常，给出提示
      this.checkCartStatusAlert();
    } catch (err) {
      console.error('加载购物车失败:', err);
      this.setData({
        loading: false,
        refreshing: false,
        error: true,
        errorMsg: err.message || '加载失败，请重试'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 检查购物车商品状态并给出提示
   */
  checkCartStatusAlert() {
    const { cartItems } = this.data;
    const outOfStockItems = cartItems.filter(item => item.isOutOfStock);
    const priceChangedItems = cartItems.filter(item => item.hasPriceChanged);
    
    if (outOfStockItems.length > 0) {
      showToast(`有${outOfStockItems.length}件商品库存不足或已下架`, { icon: 'none' });
    } else if (priceChangedItems.length > 0) {
      showToast(`有${priceChangedItems.length}件商品价格已更新`, { icon: 'none' });
    }
  },

  /**
   * 计算总价和总数量
   */
  calculateTotal: function() {
    const { cartItems } = this.data;
    let totalPrice = 0;
    let totalCount = 0;
    
    cartItems.forEach(item => {
      if (item.selected && !item.isOutOfStock) {
        const price = item.sku ? item.sku.price : item.product.price;
        totalPrice += price * item.quantity;
        totalCount += item.quantity;
      }
    });
    
    this.setData({
      totalPrice: Number(totalPrice.toFixed(2)),
      totalCount
    });
  },

  /**
   * 切换商品选中状态
   */
  onToggleSelect: function(e) {
    const index = e.currentTarget.dataset.index;
    const cartItems = [...this.data.cartItems];
    
    // 如果商品已下架或库存不足，不允许选中
    if (cartItems[index].isOutOfStock) {
      showToast('该商品库存不足或已下架', { icon: 'none' });
      return;
    }
    
    cartItems[index].selected = !cartItems[index].selected;
    
    // 检查是否全选
    const isAllSelected = cartItems
      .filter(item => !item.isOutOfStock)
      .every(item => item.selected);
    
    this.setData({
      cartItems,
      isAllSelected
    });
    
    // 重新计算总价和总数量
    this.calculateTotal();
  },

  /**
   * 切换全选状态
   */
  onToggleAllSelect: function() {
    const isAllSelected = !this.data.isAllSelected;
    const cartItems = this.data.cartItems.map(item => ({
      ...item,
      selected: isAllSelected && !item.isOutOfStock // 已下架商品不参与全选
    }));
    
    this.setData({
      cartItems,
      isAllSelected
    });
    
    // 重新计算总价和总数量
    this.calculateTotal();
  },

  /**
   * 增加商品数量
   */
  onIncreaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const cartItems = [...this.data.cartItems];
    const item = cartItems[index];
    
    // 检查商品状态
    if (item.isOutOfStock) {
      showToast('该商品库存不足或已下架', { icon: 'none' });
      return;
    }
    
    // 检查是否正在更新，防止重复提交
    if (this.data.updatingItems.has(item.id)) {
      return;
    }
    
    const maxQuantity = item.sku ? item.sku.stock : item.product.stock || 99;
    
    if (item.quantity < maxQuantity) {
      item.quantity += 1;
      this.setData({
        cartItems
      });
      
      // 更新购物车数量
      this.updateCartItemQuantity(item.id, item.quantity);
      
      // 重新计算总价和总数量
      if (item.selected) {
        this.calculateTotal();
      }
    } else {
      showToast('已达到最大库存', 'none');
    }
  },

  /**
   * 减少商品数量
   */
  onDecreaseQuantity: function(e) {
    const index = e.currentTarget.dataset.index;
    const cartItems = [...this.data.cartItems];
    const item = cartItems[index];
    
    // 检查是否正在更新，防止重复提交
    if (this.data.updatingItems.has(item.id)) {
      return;
    }
    
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.setData({
        cartItems
      });
      
      // 更新购物车数量
      this.updateCartItemQuantity(item.id, item.quantity);
      
      // 重新计算总价和总数量
      if (item.selected) {
        this.calculateTotal();
      }
    }
  },

  /**
   * 更新购物车商品数量
   * @param {string|number} cartItemId - 购物车商品ID
   * @param {number} quantity - 新数量
   */
  async updateCartItemQuantity(cartItemId, quantity) {
    try {
      // 添加到正在更新的商品集合
      const updatingItems = new Set(this.data.updatingItems);
      updatingItems.add(cartItemId);
      this.setData({ updatingItems });
      
      await cartService.updateCartItem(cartItemId, quantity);
      
      // 仅在成功后更新本地缓存，避免重复刷新整个页面
      app.services.cart.clearCartCache();
      
      // 记录购物车更新事件
      if (app.analyticsService) {
        app.analyticsService.track('cart_update_quantity', {
          cart_item_id: cartItemId,
          quantity: quantity
        });
      }
    } catch (error) {
      console.error('更新购物车商品数量失败:', error);
      showToast(error.message || '更新失败，请重试', { icon: 'none' });
      // 失败时重新加载购物车数据以保持一致性
      this.loadCartItems({ forceRefresh: true });
    } finally {
      // 从正在更新的商品集合中移除
      const updatingItems = new Set(this.data.updatingItems);
      updatingItems.delete(cartItemId);
      this.setData({ updatingItems });
    }
  },

  /**
   * 删除单个商品
   */
  async onDeleteItem(e) {
    const cartItemId = e.currentTarget.dataset.id;
    const itemName = e.currentTarget.dataset.name || '商品';
    
    try {
      // 使用统一的确认对话框
      const confirmed = await showConfirm({
        title: '确认删除',
        content: `确定要删除"${itemName}"吗？`
      });
      
      if (!confirmed) return;
      
      showLoading('删除中...');
      await cartService.deleteCartItem(cartItemId);
      showToast('删除成功');
      
      // 重新加载购物车
      this.loadCartItems({ forceRefresh: true });
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      // 忽略用户取消操作的错误
      if (error.message !== '用户取消') {
        showToast(error.message || '删除失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 批量删除选中商品
   */
  async onDeleteSelectedItems() {
    const { cartItems } = this.data;
    const selectedItems = cartItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      showToast('请选择要删除的商品', { icon: 'none' });
      return;
    }
    
    try {
      // 使用统一的确认对话框
      const confirmed = await showConfirm({
        title: '确认删除',
        content: `确定要删除选中的${selectedItems.length}件商品吗？`
      });
      
      if (!confirmed) return;
      
      showLoading('删除中...');
      const selectedItemIds = selectedItems.map(item => item.id);
      await cartService.deleteCartItems(selectedItemIds);
      showToast('删除成功');
      
      // 重新加载购物车
      this.loadCartItems({ forceRefresh: true });
    } catch (error) {
      console.error('批量删除购物车商品失败:', error);
      if (error.message !== '用户取消') {
        showToast(error.message || '删除失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 清空购物车
   */
  async onClearCart() {
    try {
      // 使用统一的确认对话框
      const confirmed = await showConfirm({
        title: '确认清空',
        content: '确定要清空购物车吗？此操作不可恢复。',
        confirmText: '确认清空',
        confirmColor: '#FF4D4F'
      });
      
      if (!confirmed) return;
      
      showLoading('清空购物车...');
      await cartService.clearCart();
      
      // 记录清空事件
      if (app.analyticsService) {
        app.analyticsService.track('cart_clear', {
          item_count: this.data.cartItems.length
        });
      }
      
      showToast('购物车已清空');
      
      // 重新加载购物车
      this.loadCartItems({ forceRefresh: true });
    } catch (error) {
      console.error('清空购物车失败:', error);
      if (error.message !== '用户取消') {
        showToast(error.message || '清空失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 检查库存并去结算
   */
  async onCheckout() {
    // 防止重复提交
    if (this.data.submitting) {
      return;
    }
    
    this.setData({ submitting: true });
    const { cartItems, totalCount } = this.data;
    
    if (totalCount === 0) {
      showToast('请选择要结算的商品', { icon: 'none' });
      return;
    }
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', { icon: 'none' });
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 获取选中的商品
    const selectedItems = cartItems
      .filter(item => item.selected)
      .map(item => ({
        id: item.id,
        product_id: item.product.id,
        sku_id: item.sku ? item.sku.id : '',
        quantity: item.quantity,
        price: item.sku ? item.sku.price : item.product.price
      }));
    
    try {
      showLoading('准备结算...');
      
      // 再次检查选中商品的库存状态
      const stockCheckResult = await cartService.checkCartStock(selectedItems);
      
      if (!stockCheckResult.available) {
        showToast(stockCheckResult.message || '部分商品库存不足，请重新选择', { icon: 'none' });
        // 重新加载购物车以更新状态
        this.loadCartItems({ forceRefresh: true });
        return;
      }
      
      // 记录结算事件
      if (app.analyticsService) {
        app.analyticsService.track('cart_checkout', {
          selected_items_count: selectedItems.length,
          total_amount: this.data.totalPrice
        });
      }
      
      // 保存到全局数据，用于订单确认页
      if (!app.globalData) {
        app.globalData = {};
      }
      app.globalData.tempOrderItems = selectedItems;
      
      // 跳转到订单确认页
      wx.navigateTo({ 
        url: '/pages/order/confirm/confirm',
        fail: (err) => {
          console.error('跳转到订单确认页面失败:', err);
          showToast('跳转到订单确认页面失败，请重试', { icon: 'none' });
        }
      });
    } catch (error) {
      console.error('结算前检查失败:', error);
      showToast(error.message || '结算失败，请重试', { icon: 'none' });
    } finally {
      hideLoading();
    }
  },

  /**
   * 前往商品详情页
   */
  onProductTap(e) {
    const productId = e.currentTarget.dataset.id;
    if (!productId) {
      showToast('商品信息有误', { icon: 'none' });
      return;
    }
    
    // 记录商品点击事件
    if (app.analyticsService) {
      app.analyticsService.track('cart_product_click', {
        product_id: productId
      });
    }
    
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${productId}`,
      fail: (err) => {
        console.error('跳转到商品详情失败:', err);
        showToast('跳转到商品详情失败', { icon: 'none' });
      }
    });
  },

  /**
   * 去登录
   */
  onLogin: function() {
    wx.navigateTo({ 
      url: '/pages/user/login/login',
      fail: (err) => {
        console.error('跳转到登录页面失败:', err);
        showToast('跳转到登录页面失败', { icon: 'none' });
      }
    });
  },

  /**
   * 去逛逛
   */
  onGoShopping: function() {
    wx.switchTab({ 
      url: '/pages/index/index',
      fail: (err) => {
        console.error('跳转到首页失败:', err);
        showToast('跳转到首页失败', { icon: 'none' });
      }
    });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    this.loadCartItems({ forceRefresh: true });
  },
  
  /**
   * 将商品移至收藏
   */
  async onMoveToFavorite(e) {
    const cartItemId = e.currentTarget.dataset.id;
    const itemName = e.currentTarget.dataset.name || '商品';
    
    try {
      const confirmed = await showConfirm({
        title: '移至收藏',
        content: `确定要将"${itemName}"移至收藏并从购物车删除吗？`
      });
      
      if (!confirmed) return;
      
      showLoading('操作中...');
      await cartService.moveToFavorite(cartItemId);
      showToast('已添加到收藏');
      
      // 重新加载购物车
      this.loadCartItems({ forceRefresh: true });
    } catch (error) {
      console.error('移至收藏失败:', error);
      if (error.message !== '用户取消') {
        showToast(error.message || '操作失败，请重试', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  }
});