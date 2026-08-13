/**
 * 文件名: index.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: 产品详情页逻辑控制层（编排层，业务细节见 parts.js / utils.js）
 */

const app = getApp();
const cartService = require("../../services/cartService");
const request = require("../../utils/request");
const { getCurrentSpecPrice, buildVisibleImages, buildImageLoadedMap } = require("./utils");
const { adjustQuantity, parseQuantity, buildBuyNowItem } = require("./parts");

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

  checkLoginStatus: function () {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({ isLoggedIn: !!token, userInfo });
  },

  cancelAllRequests: function () {
    for (const key in this.requestTokens) {
      if (this.requestTokens[key]) {
        try {
          this.requestTokens[key].cancel();
        } catch (e) {
          // 取消失败不影响页面卸载流程
        }
        this.requestTokens[key] = null;
      }
    }
  },

  // 统一请求封装：使用 request.js 的真实取消令牌，并自动携带鉴权与 CSRF 头
  doRequest: function (key, options) {
    if (this.requestTokens[key]) {
      this.requestTokens[key].cancel();
    }
    const token = new request.CancelToken();
    this.requestTokens[key] = token;
    const config = Object.assign({}, options, { cancelToken: token, needAuth: false });
    return request(config).finally(() => {
      if (this.requestTokens[key] === token) {
        this.requestTokens[key] = null;
      }
    });
  },

  loadProductDetail: function () {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });

    this.doRequest("productDetail", {
      url: "/api/product/detail",
      method: "GET",
      data: { id: this.data.productId },
    })
      .then((data) => {
        if (!this.data.isPageVisible) return;
        const productInfo = data;
        this.setData({
          productInfo,
          selectedSpecIndex: 0,
          isFavorite: productInfo.isFavorite || false,
          visibleImages: buildVisibleImages(productInfo.images),
          imageLoaded: buildImageLoadedMap(productInfo.images),
        });
        wx.setNavigationBarTitle({ title: productInfo.name });
      })
      .catch((err) => {
        if (!this.data.isPageVisible || request.isCancel(err)) return;
        console.error("获取产品详情失败:", err);
        wx.showToast({ title: "加载失败", icon: "error" });
      })
      .finally(() => {
        if (!this.data.isPageVisible) return;
        this.setData({ isLoading: false });
      });
  },

  loadRelatedProducts: function () {
    this.doRequest("relatedProducts", {
      url: "/api/product/related",
      method: "GET",
      data: {
        productId: this.data.productId,
        categoryId: this.data.productInfo ? this.data.productInfo.categoryId : 0,
        limit: 6,
      },
    })
      .then((data) => {
        if (!this.data.isPageVisible) return;
        this.setData({ relatedProducts: data || [] });
      })
      .catch((err) => {
        if (!this.data.isPageVisible || request.isCancel(err)) return;
        console.error("获取相关商品失败:", err);
      });
  },

  loadReviews: function () {
    this.doRequest("reviews", {
      url: "/api/product/reviews",
      method: "GET",
      data: {
        productId: this.data.productId,
        pageNum: this.data.reviewsPageNum,
        pageSize: this.data.reviewsPageSize,
      },
    })
      .then((data) => {
        if (!this.data.isPageVisible) return;
        const list = (data && data.list) || [];
        const hasMore = data ? data.hasMore : false;
        const newReviews =
          this.data.reviewsPageNum === 1 ? list : [...this.data.reviews, ...list];
        this.setData({ reviews: newReviews, hasMoreReviews: hasMore });
      })
      .catch((err) => {
        if (!this.data.isPageVisible || request.isCancel(err)) return;
        console.error("获取商品评价失败:", err);
      });
  },

  updateFavoriteStatus: function () {
    if (!this.data.isLoggedIn) return;

    this.doRequest("favoriteCheck", {
      url: "/api/favorite/check",
      method: "GET",
      data: { productId: this.data.productId },
    })
      .then((data) => {
        if (!this.data.isPageVisible) return;
        this.setData({ isFavorite: !!(data && data.isFavorite) });
      })
      .catch((err) => {
        if (!this.data.isPageVisible || request.isCancel(err)) return;
        console.error("检查收藏状态失败:", err);
      });
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

  handleAddToCart: function () {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/auth/login" });
      return;
    }
    this.setData({ showSpecPopup: true });
  },

  handleConfirmAddToCart: function () {
    if (this.data.isAddingToCart) return;
    if (!this.data.productInfo || !this.data.productInfo.specs) return;

    const spec = this.data.productInfo.specs[this.data.selectedSpecIndex];
    if (!spec) {
      wx.showToast({ title: "请选择规格", icon: "none" });
      return;
    }

    this.setData({ isAddingToCart: true });
    const that = this;

    cartService
      .addToCart({
        productId: this.data.productId,
        specId: spec.id,
        quantity: this.data.selectedQuantity,
      })
      .then(function (res) {
        if (res.success) {
          wx.showToast({ title: "加入购物车成功", icon: "success" });
          that.setData({ showSpecPopup: false });
        } else {
          wx.showToast({ title: res.message || "加入购物车失败", icon: "error" });
        }
      })
      .catch(function () {
        wx.showToast({ title: "加入购物车失败", icon: "error" });
      })
      .finally(function () {
        that.setData({ isAddingToCart: false });
      });
  },

  handleBuyNow: function () {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/auth/login" });
      return;
    }

    const item = buildBuyNowItem(
      this.data.productInfo,
      this.data.selectedSpecIndex,
      this.data.selectedQuantity,
    );
    if (!item) {
      wx.showToast({ title: "商品信息缺失", icon: "error" });
      return;
    }
    wx.setStorageSync("buyNowItem", item);
    wx.navigateTo({ url: "/pages/order/confirm" });
  },

  handleToggleFavorite: function () {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/auth/login" });
      return;
    }

    const that = this;
    const isFavorite = !this.data.isFavorite;

    request({
      url: isFavorite ? "/api/favorite/add" : "/api/favorite/remove",
      method: "POST",
      data: { productId: this.data.productId },
    })
      .then((data) => {
        if (data && data.success !== false) {
          that.setData({ isFavorite });
          wx.showToast({ title: isFavorite ? "收藏成功" : "取消收藏", icon: "success" });
        } else {
          wx.showToast({ title: (data && data.message) || "操作失败", icon: "error" });
        }
      })
      .catch((err) => {
        if (request.isCancel(err)) return;
        console.error("收藏操作失败:", err);
        wx.showToast({ title: "操作失败", icon: "error" });
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
          wx.navigateTo({ url: `/pages/product/poster?id=${that.data.productId}` });
        } else if (index === 2) {
          wx.setClipboardData({
            data: `/pages/product/detail?id=${that.data.productId}`,
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
    wx.redirectTo({ url: `/pages/product/detail?id=${id}` });
  },

  handleLoadMoreReviews: function () {
    if (!this.data.hasMoreReviews) return;
    this.setData({ reviewsPageNum: this.data.reviewsPageNum + 1 });
    this.loadReviews();
  },

  handleContactService: function () {
    const { corpId, kfUrl } = app.globalData;
    if (!corpId || !kfUrl) {
      wx.showToast({ title: "客服暂未配置", icon: "none" });
      return;
    }
    wx.openCustomerServiceChat({
      corpId,
      url: kfUrl,
      success: function () {},
      fail: function () {
        wx.showToast({ title: "无法联系客服", icon: "none" });
      },
    });
  },

  getCurrentSpecPrice: function () {
    return getCurrentSpecPrice(this.data.productInfo, this.data.selectedSpecIndex);
  },
});
