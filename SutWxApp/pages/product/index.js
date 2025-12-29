/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
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
    this.checkLoginStatus();
    this.updateFavoriteStatus();
  },

  onShareAppMessage: function () {
    const { productInfo } = this.data;
    return {
      title: productInfo ? productInfo.name : "分享商品",
      path: `/pages/product/detail?id=${this.data.productId}`,
      imageUrl: productInfo ? productInfo.images[0] : "",
    };
  },

  checkLoginStatus: function () {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    const isLoggedIn = !!token;
    this.setData({ isLoggedIn, userInfo });
  },

  loadProductDetail: function () {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });
    const that = this;

    wx.request({
      url: "/api/product/detail",
      method: "GET",
      data: { id: this.data.productId },
      success: function (res) {
        if (res.data && res.data.success) {
          const productInfo = res.data.data;
          const defaultSpecIndex =
            productInfo.specs && productInfo.specs.length > 0 ? 0 : 0;

          that.setData({
            productInfo,
            selectedSpecIndex: defaultSpecIndex,
            isFavorite: productInfo.isFavorite || false,
          });

          wx.setNavigationBarTitle({ title: productInfo.name });
        }
      },
      fail: function () {
        console.error("获取产品详情失败");
        wx.showToast({ title: "加载失败", icon: "error" });
      },
      complete: function () {
        that.setData({ isLoading: false });
      },
    });
  },

  loadRelatedProducts: function () {
    const that = this;

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
      success: function (res) {
        if (res.data && res.data.success) {
          that.setData({ relatedProducts: res.data.data || [] });
        }
      },
    });
  },

  loadReviews: function () {
    const that = this;

    wx.request({
      url: "/api/product/reviews",
      method: "GET",
      data: {
        productId: this.data.productId,
        pageNum: this.data.reviewsPageNum,
        pageSize: this.data.reviewsPageSize,
      },
      success: function (res) {
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
    });
  },

  updateFavoriteStatus: function () {
    if (!this.data.isLoggedIn) return;

    const that = this;
    wx.request({
      url: "/api/favorite/check",
      method: "GET",
      data: { productId: this.data.productId },
      success: function (res) {
        if (res.data && res.data.success) {
          that.setData({ isFavorite: res.data.data.isFavorite });
        }
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
