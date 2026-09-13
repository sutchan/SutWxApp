/**
 * 文件名: product-actions.js
 * 版本号: 3.0.13
 * 更新日期: 2026-09-12
 * 描述: 商品详情页交互行为（加购/立即购买/收藏/分享/客服/相关点击），从 pages/product/index.js 抽离
 */

const cartService = require("../services/cartService");
const request = require("../utils/request");
const { buildBuyNowItem } = require("../pages/product/utils");

module.exports = Behavior({
  methods: {
    handleAddToCart: function () {
      if (!this.data.isLoggedIn) {
        wx.navigateTo({ url: "/pages/user/index" });
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
        wx.navigateTo({ url: "/pages/user/index" });
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
        wx.navigateTo({ url: "/pages/user/index" });
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
      this.setData({ reviewsPageNum: this.data.reviewsPageNum + 1 });
      this.loadReviews();
    },

    handleContactService: function () {
      const app = typeof getApp === "function" ? getApp() : null;
      const { corpId, kfUrl } = app ? app.globalData : {};
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
  },
});
