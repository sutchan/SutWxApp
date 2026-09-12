/**
 * 文件名: product-loaders.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 商品详情页数据加载行为（详情/相关商品/评价/收藏/请求取消），从 pages/product/index.js 抽离
 */

const productService = require("../services/productService");
const request = require("../utils/request");
const { buildVisibleImages, buildImageLoadedMap } = require("../pages/product/utils");

module.exports = Behavior({
  methods: {
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

      const token = new request.CancelToken();
      this.requestTokens.productDetail = token;

      productService
        .getProductDetail(this.data.productId, { cancelToken: token })
        .then((productInfo) => {
          if (!this.data.isPageVisible) return;
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
  },
});
