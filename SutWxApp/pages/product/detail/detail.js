// 商品详情页面逻辑
import { showToast } from '../../../utils/global';

Page({
  data: {
    product: null, // 商品详情数据
    loading: true, // 加载状态
    error: false, // 错误状态
    errorMsg: '', // 错误信息
    selectedSku: {}, // 选中的商品规格
    quantity: 1, // 购买数量
    images: [], // 商品图片列表
    currentImageIndex: 0, // 当前显示的图片索引
    isFavorite: false, // 是否已收藏
    relatedProducts: [] // 相关商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const app = getApp();
    
    if (options.id) {
      this.productId = options.id;
      this.loadProductDetail();
      
      // 记录页面访问事件
      app.services.analytics.trackPageView('product_detail', {
        product_id: options.id
      });
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '商品ID不存在'
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时的处理
  },

  /**
   * 监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.loadProductDetail();
  },

  /**
   * 加载商品详情数据
   */
  loadProductDetail: async function() {
    const app = getApp();
    this.setData({
      loading: true,
      error: false
    });

    try {
      // 使用productService获取商品详情
      const product = await app.services.product.getProductDetail(this.productId);
      
      this.setData({
        product: product,
        images: product.images || [],
        selectedSku: product.skus && product.skus.length > 0 ? product.skus[0] : {},
        loading: false
      });
      
      // 检查商品是否已收藏
      this.checkFavoriteStatus();
      // 加载相关商品
      this.loadRelatedProducts();
    } catch (error) {
      console.error('获取商品详情失败:', error);
      this.setData({
        loading: false,
        error: true,
        errorMsg: error.message || '加载失败，请重试'
      });
      showToast('获取商品详情失败', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 加载相关商品
   */
  loadRelatedProducts: async function() {
    const app = getApp();
    
    try {
      // 使用productService获取相关商品
      const result = await app.services.product.getRelatedProducts({
        product_id: this.productId,
        limit: 6
      });
      
      this.setData({
        relatedProducts: result.products || []
      });
    } catch (error) {
      console.error('获取相关商品失败:', error);
    }
  },

  /**
   * 检查商品收藏状态
   */
  checkFavoriteStatus: async function() {
    const app = getApp();
    
    try {
      // 检查用户是否登录
      if (app.isLoggedIn()) {
        // 使用favoriteService检查收藏状态
        const result = await app.services.favorite.checkFavorite({
          product_id: this.productId
        });
        
        this.setData({
          isFavorite: result.is_favorite
        });
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  /**
   * 切换图片
   */
  onImageChange: function(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  /**
   * 切换商品规格
   */
  onSkuSelect: function(e) {
    const skuId = e.currentTarget.dataset.id;
    const sku = this.data.product.skus.find(s => s.id === skuId);
    if (sku) {
      this.setData({
        selectedSku: sku
      });
    }
  },

  /**
   * 增加购买数量
   */
  onIncreaseQuantity: function() {
    const maxQuantity = this.data.selectedSku.stock || this.data.product.stock || 99;
    if (this.data.quantity < maxQuantity) {
      this.setData({
        quantity: this.data.quantity + 1
      });
    } else {
      showToast('已达到最大库存', 'none');
    }
  },

  /**
   * 减少购买数量
   */
  onDecreaseQuantity: function() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  /**
   * 添加到购物车
   */
  addToCart: async function() {
    const app = getApp();
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    try {
      // 使用cartService添加到购物车
      await app.services.cart.addToCart({
        product_id: this.productId,
        sku_id: this.data.selectedSku.id || '',
        quantity: this.data.quantity
      });
      
      // 记录添加购物车事件
      app.services.analytics.trackEvent('add_to_cart', {
        product_id: this.productId,
        quantity: this.data.quantity,
        sku_id: this.data.selectedSku.id || ''
      });
      
      showToast('添加成功', 'success');
    } catch (error) {
      console.error('添加到购物车失败:', error);
      showToast(error.message || '添加失败，请重试', 'none');
    }
  },

  /**
   * 立即购买
   */
  buyNow: function() {
    const app = getApp();
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 记录立即购买事件
    app.services.analytics.trackEvent('buy_now', {
      product_id: this.productId,
      quantity: this.data.quantity,
      sku_id: this.data.selectedSku.id || ''
    });
    
    // 构造订单参数
    const orderItem = {
      product_id: this.productId,
      sku_id: this.data.selectedSku.id || '',
      quantity: this.data.quantity,
      product: this.data.product,
      selectedSku: this.data.selectedSku
    };
    
    // 保存到全局数据，用于订单确认页
    app.globalData.tempOrderItems = [orderItem];
    
    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order/confirm/confirm'
    });
  },

  /**
   * 收藏/取消收藏商品
   */
  onToggleFavorite: async function() {
    const app = getApp();
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', 'none');
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    const isFavorite = this.data.isFavorite;
    const action = isFavorite ? 'remove' : 'add';
    
    try {
      // 乐观更新UI
      this.setData({
        isFavorite: !isFavorite
      });
      
      // 使用favoriteService操作收藏
      if (isFavorite) {
        await app.services.favorite.removeFavorite({
          product_id: this.productId
        });
      } else {
        await app.services.favorite.addFavorite({
          product_id: this.productId
        });
      }
      
      // 记录收藏事件
      app.services.analytics.trackEvent(action === 'add' ? 'favorite_add' : 'favorite_remove', {
        product_id: this.productId
      });
      
      showToast(isFavorite ? '取消收藏成功' : '收藏成功', 'success');
    } catch (error) {
      console.error('操作收藏失败:', error);
      // 失败时回滚UI
      this.setData({
        isFavorite: isFavorite
      });
      showToast(error.message || '操作失败，请重试', 'none');
    }
  },

  /**
   * 查看相关商品
   */
  onRelatedProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    const app = getApp();
    
    // 记录点击相关商品事件
    app.services.analytics.trackEvent('related_product_click', {
      product_id: productId,
      from_product_id: this.productId
    });
    
    wx.navigateTo({
      url: '/pages/product/detail/detail?id=' + productId
    });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    this.loadProductDetail();
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    const app = getApp();
    
    // 记录分享事件
    app.services.analytics.trackEvent('product_share', {
      product_id: this.productId
    });
    
    return {
      title: this.data.product ? this.data.product.title : '商品详情',
      path: '/pages/product/detail/detail?id=' + this.productId,
      imageUrl: this.data.images[0] || ''
    };
  }
});