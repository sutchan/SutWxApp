/**
 * 文件名: index.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 产品详情页逻辑控制层（编排层；加载见 product-loaders，交互见 product-actions）
 */

const { getCurrentSpecPrice } = require("./utils");
const { adjustQuantity, parseQuantity } = require("./parts");

const themeBehavior = require("../../behaviors/theme");
const productLoadersBehavior = require("../../behaviors/product-loaders");
const productActionsBehavior = require("../../behaviors/product-actions");

Page({
  behaviors: [themeBehavior, productLoadersBehavior, productActionsBehavior],
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
    visibleImages: [],
    imageLoaded: {},
    isPageVisible: true,
  },

  // 请求取消令牌
  requestTokens: {
    productDetail: null,
    relatedProducts: null,
    reviews: null,
    favoriteCheck: null,
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ productId: parseInt(options.id, 10) });
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
  },

  onHide: function () {
    this.setData({ isPageVisible: false });
    this.cancelAllRequests();
  },

  onUnload: function () {
    this.cancelAllRequests();
  },

  onShareAppMessage: function () {
    const { productInfo, productId } = this.data;
    return {
      title: productInfo ? productInfo.name : "分享商品",
      path: `/pages/product/detail?id=${productId}`,
      imageUrl: productInfo && productInfo.images ? productInfo.images[0] : "",
    };
  },

  onImageLoad: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`imageLoaded[${index}]`]: true });
  },

  onImageError: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`imageLoaded[${index}]`]: false });
  },

  handleImageChange: function (e) {
    const { current } = e.detail;
    this.setData({ currentImageIndex: current });
  },

  handleSpecTap: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedSpecIndex: parseInt(index, 10) });
  },

  handleQuantityChange: function (e) {
    const { type } = e.currentTarget.dataset;
    const stock = this.data.productInfo ? this.data.productInfo.stock : undefined;
    const next = adjustQuantity(this.data.selectedQuantity, type, stock);
    this.setData({ selectedQuantity: next });
  },

  handleQuantityInput: function (e) {
    const stock = this.data.productInfo ? this.data.productInfo.stock : undefined;
    const quantity = parseQuantity(e.detail.value, stock);
    this.setData({ selectedQuantity: quantity });
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

  getCurrentSpecPrice: function () {
    return getCurrentSpecPrice(this.data.productInfo, this.data.selectedSpecIndex);
  },
});
