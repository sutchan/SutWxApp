/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 产品详情页逻辑控制层
 */

const app = getApp();
const authService = require("../../services/authService");
const pointsService = require("../../services/pointsService");
const cartService = require("../../services/cartService");
const productService = require("../../services/productService");
const { formatPrice, formatProductListPrices } = require("../../utils/format");

Page({
  data: {
    productId: null,
    productInfo: null,
    currentImageIndex: 0,
    selectedSpecIndex: 0,
    selectedQuantity: 1,
    isLoading: false,
    isAddingToCart: false,
    isFavorite: false,
    relatedProducts: [],
    reviews: [],
    reviewsPageNum: 1,
    reviewsPageSize: 5,
    hasMoreReviews: true,
    showSpecPopup: false,
    showReviewPopup: false,
    isLoggedIn: false,
    userInfo: null,
    // 当前规格价格文本（WXML 不能调用 JS 方法，预格式化）
    currentSpecPriceText: "0.00",
    // 购物车数量
    cartCount: 0,
    // 图片懒加载相关
    visibleImages: [],
    imageLoaded: {},
    // 优化性能
    isPageVisible: true,
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ productId: parseInt(options.id) });
      this.loadProductDetail();
      this.loadRelatedProducts();
      this.loadReviews();
    } else {
      wx.showToast({ title: "参数错误", icon: "error" });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  onShow: function () {
    this.setData({ isPageVisible: true });
    this.checkLoginStatus();
    this.updateFavoriteStatus();
    this.updateCartCount();
  },

  onHide: function () {
    this.setData({ isPageVisible: false });
  },

  onUnload: function () {
    // 页面卸载时的清理工作
  },

  onShareAppMessage: function () {
    const { productInfo } = this.data;
    return {
      title: productInfo ? productInfo.name : "分享商品",
      path: `/pages/product/index?id=${this.data.productId}`,
      imageUrl: productInfo && productInfo.images ? productInfo.images[0] : "",
    };
  },

  onImageLoad: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      [`imageLoaded[${index}]`]: true,
    });
  },

  onImageError: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      [`imageLoaded[${index}]`]: false,
    });
  },

  checkLoginStatus: function () {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    const isLoggedIn = !!token;
    this.setData({ isLoggedIn, userInfo });
  },

  // 更新购物车数量角标
  updateCartCount: function () {
    const cartCount = wx.getStorageSync("cartCount") || 0;
    this.setData({ cartCount });
  },

  // 加载产品详情（使用 productService，无后端）
  loadProductDetail: async function () {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    try {
      const productInfo = await productService.getProductDetail(
        this.data.productId
      );
      if (!this.data.isPageVisible) return;
      if (!productInfo) {
        wx.showToast({ title: "商品不存在", icon: "error" });
        return;
      }
      const defaultSpecIndex =
        productInfo.specs && productInfo.specs.length > 0 ? 0 : 0;
      const visibleImages = (productInfo.images || []).map(
        (_, index) => index < 2
      );
      // 预格式化价格字段
      const formatted = {
        ...productInfo,
        priceText: formatPrice(productInfo.price),
        originPriceText: productInfo.originPrice
          ? formatPrice(productInfo.originPrice)
          : "",
        specs: (productInfo.specs || []).map((spec) => ({
          ...spec,
          priceText: formatPrice(spec.price),
        })),
      };
      this.setData({
        productInfo: formatted,
        selectedSpecIndex: defaultSpecIndex,
        isFavorite: productInfo.isFavorite || false,
        visibleImages,
        imageLoaded: (productInfo.images || []).reduce((acc, _, index) => {
          acc[index] = index < 2;
          return acc;
        }, {}),
      });
      this.updateCurrentSpecPriceText();
      wx.setNavigationBarTitle({ title: productInfo.name });
    } catch (e) {
      console.error("获取产品详情失败:", e);
      wx.showToast({ title: "加载失败", icon: "error" });
    } finally {
      if (this.data.isPageVisible) {
        this.setData({ isLoading: false });
      }
    }
  },

  // 加载相关商品（使用 productService）
  loadRelatedProducts: async function () {
    try {
      const list = await productService.getRelatedProducts(
        this.data.productId,
        6
      );
      if (!this.data.isPageVisible) return;
      this.setData({
        relatedProducts: formatProductListPrices(list || []),
      });
    } catch (e) {
      console.error("获取相关商品失败:", e);
    }
  },

  // 加载商品评价（无后端，使用空数组占位）
  loadReviews: function () {
    this.setData({ reviews: [], hasMoreReviews: false });
  },

  // 更新收藏状态（基于 productInfo 本地数据）
  updateFavoriteStatus: function () {
    if (!this.data.isLoggedIn) return;
    if (this.data.productInfo) {
      this.setData({
        isFavorite: !!this.data.productInfo.isFavorite,
      });
    }
  },

  // 计算当前规格价格文本
  updateCurrentSpecPriceText: function () {
    const { productInfo, selectedSpecIndex } = this.data;
    if (
      productInfo &&
      productInfo.specs &&
      productInfo.specs[selectedSpecIndex]
    ) {
      const spec = productInfo.specs[selectedSpecIndex];
      this.setData({
        currentSpecPriceText: spec.priceText || formatPrice(spec.price),
      });
    } else if (productInfo) {
      this.setData({
        currentSpecPriceText: productInfo.priceText || formatPrice(productInfo.price),
      });
    } else {
      this.setData({ currentSpecPriceText: "0.00" });
    }
  },

  handleImageChange: function (e) {
    const { current } = e.detail;
    this.setData({ currentImageIndex: current });
  },

  handleSpecTap: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedSpecIndex: index });
    this.updateCurrentSpecPriceText();
  },

  handleQuantityChange: function (e) {
    const { type } = e.currentTarget.dataset;
    let { selectedQuantity } = this.data;
    const stock =
      this.data.productInfo && this.data.productInfo.specs
        ? this.data.productInfo.specs[this.data.selectedSpecIndex].stock || 99
        : 99;

    if (type === "minus") {
      selectedQuantity = Math.max(1, selectedQuantity - 1);
    } else if (type === "plus") {
      selectedQuantity = Math.min(stock, selectedQuantity + 1);
    }

    this.setData({ selectedQuantity });
    this.updateCurrentSpecPriceText();
  },

  handleQuantityInput: function (e) {
    let quantity = parseInt(e.detail.value) || 1;
    const stock =
      this.data.productInfo && this.data.productInfo.specs
        ? this.data.productInfo.specs[this.data.selectedSpecIndex].stock || 99
        : 99;
    quantity = Math.max(1, Math.min(stock, quantity));
    this.setData({ selectedQuantity: quantity });
    this.updateCurrentSpecPriceText();
  },

  handleShowSpecPopup: function () {
    this.setData({ showSpecPopup: true });
  },

  handleHideSpecPopup: function () {
    this.setData({ showSpecPopup: false });
  },

  handleShowReviewPopup: function () {
    this.setData({ showReviewPopup: true });
  },

  handleHideReviewPopup: function () {
    this.setData({ showReviewPopup: false });
  },

  handleAddToCart: function () {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      return;
    }
    this.setData({ showSpecPopup: true });
  },

  handleConfirmAddToCart: function () {
    if (this.data.isAddingToCart) return;
    if (
      !this.data.productInfo ||
      !this.data.productInfo.specs ||
      !this.data.productInfo.specs[this.data.selectedSpecIndex]
    ) {
      wx.showToast({ title: "规格信息错误", icon: "none" });
      return;
    }

    this.setData({ isAddingToCart: true });
    const that = this;

    cartService
      .addToCart({
        productId: this.data.productId,
        specId: this.data.productInfo.specs[this.data.selectedSpecIndex].id,
        quantity: this.data.selectedQuantity,
      })
      .then(function (res) {
        if (res && res.success) {
          wx.showToast({ title: "加入购物车成功", icon: "success" });
          that.setData({ showSpecPopup: false });
          // 更新购物车数量
          const newCount = (that.data.cartCount || 0) + that.data.selectedQuantity;
          that.setData({ cartCount: newCount });
          wx.setStorageSync("cartCount", newCount);
        } else {
          wx.showToast({
            title: (res && res.message) || "加入购物车失败",
            icon: "none",
          });
        }
      })
      .catch(function () {
        wx.showToast({ title: "加入购物车失败", icon: "none" });
      })
      .finally(function () {
        that.setData({ isAddingToCart: false });
      });
  },

  handleBuyNow: function () {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    const { productInfo, selectedSpecIndex, selectedQuantity } = this.data;
    if (!productInfo || !productInfo.specs || !productInfo.specs[selectedSpecIndex]) {
      wx.showToast({ title: "规格信息错误", icon: "none" });
      return;
    }
    const spec = productInfo.specs[selectedSpecIndex];
    const cartItem = {
      productId: productInfo.id,
      productName: productInfo.name,
      productImage: productInfo.images ? productInfo.images[0] : "",
      specName: spec.name,
      specPrice: spec.price,
      quantity: selectedQuantity,
      selected: true,
    };

    wx.setStorageSync("buyNowItem", cartItem);
    wx.navigateTo({ url: "/pages/order/confirm" });
  },

  handleToggleFavorite: function () {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    const that = this;
    const isFavorite = !this.data.isFavorite;
    // 本地切换收藏状态
    const productInfo = this.data.productInfo
      ? { ...this.data.productInfo, isFavorite }
      : this.data.productInfo;
    this.setData({ isFavorite, productInfo });
    wx.showToast({
      title: isFavorite ? "收藏成功" : "取消收藏",
      icon: "success",
    });
  },

  handleShare: function () {
    this.handleShowShareMenu();
  },

  handleShowShareMenu: function () {
    const that = this;
    wx.showActionSheet({
      itemList: ["分享给好友", "生成海报", "复制链接"],
      success: function (res) {
        const index = res.tapIndex;
        if (index === 0) {
          wx.showShareMenu();
        } else if (index === 1) {
          // 海报页面未注册，使用 toast 提示
          wx.showToast({ title: "海报功能开发中", icon: "none" });
        } else if (index === 2) {
          wx.setClipboardData({
            data: `/pages/product/index?id=${that.data.productId}`,
            success: function () {
              wx.showToast({ title: "链接已复制", icon: "success" });
            },
          });
        }
      },
    });
  },

  handleRelatedProductTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.redirectTo({ url: `/pages/product/index?id=${id}` });
  },

  handleLoadMoreReviews: function () {
    if (!this.data.hasMoreReviews) return;
    this.setData({
      reviewsPageNum: this.data.reviewsPageNum + 1,
    });
    this.loadReviews();
  },

  handleContactService: function () {
    // 客服功能未配置 corpId，使用 toast 占位
    wx.showToast({ title: "客服功能开发中", icon: "none" });
  },
});
