/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 首页逻辑控制层
 */

const app = getApp();
const authService = require("../../services/authService");
const pointsService = require("../../services/pointsService");

Page({
  data: {
    userInfo: null,
    points: 0,
    bannerList: [
      {
        id: 1,
        imageUrl: "/images/banner-1.png",
        link: "/pages/product/detail?id=1",
      },
      {
        id: 2,
        imageUrl: "/images/banner-2.png",
        link: "/pages/product/detail?id=2",
      },
      {
        id: 3,
        imageUrl: "/images/banner-3.png",
        link: "/pages/article/detail?id=1",
      },
    ],
    categoryList: [
      { id: 1, name: "全部", icon: "/images/category-all.png" },
      { id: 2, name: "电子产品", icon: "/images/category-electronics.png" },
      { id: 3, name: "服装", icon: "/images/category-clothing.png" },
      { id: 4, name: "家居", icon: "/images/category-home.png" },
      { id: 5, name: "美妆", icon: "/images/category-beauty.png" },
    ],
    productList: [],
    searchKeyword: "",
    currentCategory: 0,
    isLoading: false,
    isRefreshing: false,
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
  },

  onLoad: function (options) {
    this.initPageData();
  },

  onShow: function () {
    this.updateUserInfo();
  },

  onPullDownRefresh: function () {
    this.handleRefresh();
  },

  onReachBottom: function () {
    this.handleLoadMore();
  },

  initPageData: function () {
    this.loadBanners();
    this.loadCategories();
    this.loadProductList();
    this.updateUserInfo();
  },

  updateUserInfo: function () {
    const userInfo = wx.getStorageSync("userInfo");
    const points = wx.getStorageSync("points") || 0;
    if (userInfo) {
      this.setData({ userInfo, points });
    }
  },

  loadBanners: function () {
    const that = this;
    wx.request({
      url: "/api/banner/list",
      method: "GET",
      success: function (res) {
        if (res.data && res.data.success) {
          that.setData({ bannerList: res.data.data });
        }
      },
      fail: function () {
        console.error("获取轮播图失败");
      },
    });
  },

  loadCategories: function () {
    const that = this;
    wx.request({
      url: "/api/category/list",
      method: "GET",
      success: function (res) {
        if (res.data && res.data.success) {
          const defaultCategory = {
            id: 0,
            name: "全部",
            icon: "/images/category-all.png",
          };
          const categories = [defaultCategory, ...res.data.data];
          that.setData({ categoryList: categories });
        }
      },
      fail: function () {
        console.error("获取分类失败");
      },
    });
  },

  loadProductList: function () {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });
    const that = this;

    wx.request({
      url: "/api/product/list",
      method: "GET",
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        categoryId: this.data.currentCategory,
        keyword: this.data.searchKeyword,
      },
      success: function (res) {
        if (res.data && res.data.success) {
          const { list, hasMore } = res.data.data;
          const newList =
            that.data.pageNum === 1
              ? list
              : [...that.data.productList, ...list];
          that.setData({
            productList: newList,
            hasMore,
            isLoading: false,
          });
        }
      },
      fail: function () {
        console.error("获取产品列表失败");
        that.setData({ isLoading: false });
      },
      complete: function () {
        wx.stopPullDownRefresh();
        that.setData({ isRefreshing: false });
      },
    });
  },

  handleRefresh: function () {
    this.setData({
      isRefreshing: true,
      pageNum: 1,
      hasMore: true,
    });
    this.loadProductList();
  },

  handleLoadMore: function () {
    if (!this.data.hasMore || this.data.isLoading) return;

    this.setData({
      pageNum: this.data.pageNum + 1,
    });
    this.loadProductList();
  },

  handleCategoryTap: function (e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.currentCategory) return;

    this.setData({
      currentCategory: id,
      pageNum: 1,
      hasMore: true,
      productList: [],
    });
    this.loadProductList();
  },

  handleSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  handleSearch: function () {
    this.setData({
      pageNum: 1,
      hasMore: true,
      productList: [],
    });
    this.loadProductList();
  },

  handleClearSearch: function () {
    this.setData({
      searchKeyword: "",
      pageNum: 1,
      hasMore: true,
      productList: [],
    });
    this.loadProductList();
  },

  handleProductTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail?id=${id}`,
    });
  },

  handleBannerTap: function (e) {
    const { link } = e.currentTarget.dataset;
    if (link) {
      wx.navigateTo({ url: link });
    }
  },

  handleSearchBarTap: function () {
    wx.navigateTo({
      url: "/pages/search/search",
    });
  },

  handlePointsTap: function () {
    wx.navigateTo({
      url: "/pages/points/points",
    });
  },
});
