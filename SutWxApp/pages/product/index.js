/**
 * 文件名: index.js
 * 版本号: 1.1.0
 * 更新日期: 2025-12-30 14:30
 * 描述: 产品详情页逻辑控制层
 */

const app = getApp();
const authService = require("../../services/authService");
const pointsService = require("../../services/pointsService");
const cartService = require("../../services/cartService");

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
    // 图片懒加载相关
    visibleImages: [],
    imageLoaded: {},
    // 优化性能
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
  },

  onHide: function () {
    this.setData({ isPageVisible: false });
    // 取消所有未完成的请求
    this.cancelAllRequests();
  },

  onUnload: function () {
    // 取消所有未完成的请求
    this.cancelAllRequests();
  },

  onShareAppMessage: function () {
    const { productInfo } = this.data;
    return {
      title: productInfo ? productInfo.name : "分享商品",
      path: `/pages/product/detail?id=${this.data.productId}`,
      imageUrl: productInfo ? productInfo.images[0] : "",
    };
  },

  onImageLoad: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      [`imageLoaded[${index}]`]: true
    });
  },

  onImageError: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      [`imageLoaded[${index}]`]: false
    });
  },

  checkLoginStatus: function () {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    const isLoggedIn = !!token;
    this.setData({ isLoggedIn, userInfo });
  },

  // 取消所有请求
  cancelAllRequests: function () {
    for (const key in this.requestTokens) {
      if (this.requestTokens[key]) {
        try {
          this.requestTokens[key].cancel();
        } catch (e) {
          console.warn(`取消请求失败: ${key}`);
        }
        this.requestTokens[key] = null;
      }
    }
  },

  loadProductDetail: function () {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });
    const that = this;

    // 取消之前的请求
    if (this.requestTokens.productDetail) {
      this.requestTokens.productDetail.cancel();
    }

    // 创建新的请求令牌
    this.requestTokens.productDetail = new app.globalData.request.CancelToken();

    wx.request({
      url: "/api/product/detail",
      method: "GET",
      data: { id: this.data.productId },
      header: {
        "X-CSRF-Token": wx.getStorageSync("csrfToken") || ""
      },
      cancelToken: this.requestTokens.productDetail,
      success: function (res) {
        if (!that.data.isPageVisible) return;
        
        if (res.data && res.data.success) {
          const productInfo = res.data.data;
          const defaultSpecIndex = 
            productInfo.specs && productInfo.specs.length > 0 ? 0 : 0;

          // 初始化可见图片数组
          const visibleImages = productInfo.images.map((_, index) => index < 2);

          that.setData({
            productInfo,
            selectedSpecIndex: defaultSpecIndex,
            isFavorite: productInfo.isFavorite || false,
            visibleImages,
            imageLoaded: productInfo.images.reduce((acc, _, index) => {
              acc[index] = index < 2; // 前两张图片初始化为已加载
              return acc;
            }, {})
          });

          wx.setNavigationBarTitle({ title: productInfo.name });
        }
      },
      fail: function (err) {
        if (!that.data.isPageVisible) return;
        if (err.errMsg && err.errMsg.includes("cancelled")) {
          console.log("产品详情请求已取消");
          return;
        }
        console.error("获取产品详情失败:", err);
        wx.showToast({ title: "加载失败", icon: "error" });
      },
      complete: function () {
        if (!that.data.isPageVisible) return;
        that.setData({ isLoading: false });
        that.requestTokens.productDetail = null;
      },
    });
  },

  loadRelatedProducts: function () {
    const that = this;

    // 取消之前的请求
    if (this.requestTokens.relatedProducts) {
      this.requestTokens.relatedProducts.cancel();
    }

    // 创建新的请求令牌
    this.requestTokens.relatedProducts = new app.globalData.request.CancelToken();

    wx.request({
      url: "/api/product/related",
      method: "GET",
      data: {
        productId: this.data.productId,
        categoryId: this.data.productInfo
          ? this.data.productInfo.categoryId
          : 0,
        limit: 6,
      },
      header: {
        "X-CSRF-Token": wx.getStorageSync("csrfToken") || ""
      },
      cancelToken: this.requestTokens.relatedProducts,
      success: function (res) {
        if (!that.data.isPageVisible) return;
        
        if (res.data && res.data.success) {
          that.setData({ relatedProducts: res.data.data || [] });
        }
      },
      fail: function (err) {
        if (!that.data.isPageVisible) return;
        if (err.errMsg && err.errMsg.includes("cancelled")) {
          console.log("相关商品请求已取消");
          return;
        }
        console.error("获取相关商品失败:", err);
      },
      complete: function () {
        if (!that.data.isPageVisible) return;
        that.requestTokens.relatedProducts = null;
      },
    });
  },

  loadReviews: function () {
    const that = this;

    // 取消之前的请求
    if (this.requestTokens.reviews) {
      this.requestTokens.reviews.cancel();
    }

    // 创建新的请求令牌
    this.requestTokens.reviews = new app.globalData.request.CancelToken();

    wx.request({
      url: "/api/product/reviews",
      method: "GET",
      data: {
        productId: this.data.productId,
        pageNum: this.data.reviewsPageNum,
        pageSize: this.data.reviewsPageSize,
      },
      header: {
        "X-CSRF-Token": wx.getStorageSync("csrfToken") || ""
      },
      cancelToken: this.requestTokens.reviews,
      success: function (res) {
        if (!that.data.isPageVisible) return;
        
        if (res.data && res.data.success) {
          const { list, hasMore } = res.data.data;
          const newReviews = 
            that.data.reviewsPageNum === 1
              ? list
              : [...that.data.reviews, ...list];
          that.setData({
            reviews: newReviews,
            hasMoreReviews: hasMore,
          });
        }
      },
      fail: function (err) {
        if (!that.data.isPageVisible) return;
        if (err.errMsg && err.errMsg.includes("cancelled")) {
          console.log("商品评价请求已取消");
          return;
        }
        console.error("获取商品评价失败:", err);
      },
      complete: function () {
        if (!that.data.isPageVisible) return;
        that.requestTokens.reviews = null;
      },
    });
  },

  updateFavoriteStatus: function () {
    if (!this.data.isLoggedIn) return;

    const that = this;

    // 取消之前的请求
    if (this.requestTokens.favoriteCheck) {
      this.requestTokens.favoriteCheck.cancel();
    }

    // 创建新的请求令牌
    this.requestTokens.favoriteCheck = new app.globalData.request.CancelToken();

    wx.request({
      url: "/api/favorite/check",
      method: "GET",
      data: { productId: this.data.productId },
      header: {
        "X-CSRF-Token": wx.getStorageSync("csrfToken") || ""
      },
      cancelToken: this.requestTokens.favoriteCheck,
      success: function (res) {
        if (!that.data.isPageVisible) return;
        
        if (res.data && res.data.success) {
          that.setData({ isFavorite: res.data.data.isFavorite });
        }
      },
      fail: function (err) {
        if (!that.data.isPageVisible) return;
        if (err.errMsg && err.errMsg.includes("cancelled")) {
          console.log("收藏状态检查请求已取消");
          return;
        }
        console.error("检查收藏状态失败:", err);
      },
      complete: function () {
        if (!that.data.isPageVisible) return;
        that.requestTokens.favoriteCheck = null;
      },
    });
  },

  handleImageChange: function (e) {
    const { current } = e.detail;
    this.setData({ currentImageIndex: current });
  },

  handleSpecTap: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedSpecIndex: index });
  },

  handleQuantityChange: function (e) {
    const { type } = e.currentTarget.dataset;
    let { selectedQuantity } = this.data;

    if (type === "minus") {
      selectedQuantity = Math.max(1, selectedQuantity - 1);
    } else if (type === "plus") {
      selectedQuantity = Math.min(
        this.data.productInfo.stock || 99,
        selectedQuantity + 1,
      );
    }

    this.setData({ selectedQuantity });
  },

  handleQuantityInput: function (e) {
    let quantity = parseInt(e.detail.value) || 1;
    quantity = Math.max(
      1,
      Math.min(this.data.productInfo.stock || 99, quantity),
    );
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

    this.setData({ isAddingToCart: true });
    const that = this;

    cartService
      .addToCart({
        productId: this.data.productId,
        specId: this.data.productInfo.specs[this.data.selectedSpecIndex].id,
        quantity: this.data.selectedQuantity,
      })
      .then(function (res) {
        if (res.success) {
          wx.showToast({ title: "加入购物车成功", icon: "success" });
          that.setData({ showSpecPopup: false });
        } else {
          wx.showToast({
            title: res.message || "加入购物车失败",
            icon: "error",
          });
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

    const { productInfo, selectedSpecIndex, selectedQuantity } = this.data;
    const spec = productInfo.specs[selectedSpecIndex];
    const cartItem = {
      productId: productInfo.id,
      productName: productInfo.name,
      productImage: productInfo.images[0],
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
      wx.navigateTo({ url: "/pages/auth/login" });
      return;
    }

    const that = this;
    const isFavorite = !this.data.isFavorite;

    wx.request({
      url: isFavorite ? "/api/favorite/add" : "/api/favorite/remove",
      method: "POST",
      data: { productId: this.data.productId },
      success: function (res) {
        if (res.data && res.data.success) {
          that.setData({ isFavorite });
          wx.showToast({
            title: isFavorite ? "收藏成功" : "取消收藏",
            icon: "success",
          });
        } else {
          wx.showToast({
            title: res.data.message || "操作失败",
            icon: "error",
          });
        }
      },
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
          wx.navigateTo({
            url: `/pages/product/poster?id=${that.data.productId}`,
          });
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

    this.setData({
      reviewsPageNum: this.data.reviewsPageNum + 1,
    });
    this.loadReviews();
  },

  handleContactService: function () {
    wx.openCustomerServiceChat({
      corpId: "",
      url: "",
      success: function () {},
      fail: function () {
        wx.showToast({ title: "无法联系客服", icon: "none" });
      },
    });
  },

  getCurrentSpecPrice: function () {
    const { productInfo, selectedSpecIndex } = this.data;
    if (
      productInfo &&
      productInfo.specs &&
      productInfo.specs[selectedSpecIndex]
    ) {
      return productInfo.specs[selectedSpecIndex].price;
    }
    return productInfo ? productInfo.price : 0;
  },
});
