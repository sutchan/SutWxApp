
/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-01
 * 描述: 分类页面，展示商品分类和分类下的商品列表
 */

const categoryService = require('../../services/categoryService');
const productService = require('../../services/productService');
const { formatProductListPrices } = require('../../utils/format');

const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    categoryGroups: [
      {
        title: "热门分类",
        items: [
          { id: 0, name: "全部商品" },
          { id: 1, name: "观叶植物" },
          { id: 2, name: "多肉植物" },
        ],
      },
      {
        title: "特色绿植",
        items: [
          { id: 3, name: "花卉绿植" },
        ],
      },
      {
        title: "园艺资材",
        items: [
          { id: 4, name: "园艺工具" },
          { id: 5, name: "花盆资材" },
        ],
      },
    ],
    categoryList: [],
    activeCategoryId: 0,
    productList: [],
    loading: false,
    fadeIn: true,
  },

  onLoad() {
    this.loadCategoryList();
  },

  /**
   * 加载分类列表
   */
  async loadCategoryList() {
    try {
      this.setData({ loading: true });
      const categoryList = await categoryService.getCategoryList();
      
      this.setData({
        categoryList,
        loading: false
      });

      this.loadProductList(this.data.activeCategoryId);
    } catch (error) {
      console.error('加载分类失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载商品列表（含淡入切换）
   */
  async loadProductList(categoryId) {
    try {
      this.setData({ loading: true, fadeIn: false });
      const productList = await productService.getProductList({ categoryId });
      
      this.setData({
        productList: formatProductListPrices(productList),
        loading: false,
        fadeIn: true,
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      this.setData({ loading: false, fadeIn: true });
    }
  },

  /**
   * 切换分类
   */
  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeCategoryId) return;

    this.setData({
      activeCategoryId: id,
    });

    this.loadProductList(id);
  },

  /**
   * 查看商品详情
   */
  onViewProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/product/index?id=' + id
    });
  }
});

