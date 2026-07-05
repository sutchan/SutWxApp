
/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 分类页面，展示商品分类和分类下的商品列表
 */

const categoryService = require('../../services/categoryService');
const productService = require('../../services/productService');
const cartService = require('../../services/cartService');
const { formatProductListPrices } = require('../../utils/format');

Page({
  data: {
    categoryList: [],
    activeCategoryIndex: 0,
    productList: [],
    loading: false
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

      if (categoryList.length > 0) {
        this.loadProductList(categoryList[0].id);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 加载商品列表
   */
  async loadProductList(categoryId) {
    try {
      this.setData({ loading: true });
      const productList = await productService.getProductList({ categoryId });

      this.setData({
        productList: formatProductListPrices(productList),
        loading: false
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 切换分类
   */
  onCategoryChange(e) {
    const index = e.currentTarget.dataset.index;
    const category = this.data.categoryList[index];

    this.setData({
      activeCategoryIndex: index
    });

    this.loadProductList(category.id);
  },

  /**
   * 查看商品详情
   */
  onViewProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/product/index?id=' + id
    });
  },

  /**
   * 加入购物车
   */
  async onAddToCart(e) {
    const { id } = e.currentTarget.dataset;
    try {
      const result = await cartService.addToCart({ productId: id, quantity: 1 });
      wx.showToast({
        title: result.success ? '已加入购物车' : '添加失败',
        icon: result.success ? 'success' : 'none'
      });
    } catch (error) {
      console.error('加入购物车失败:', error);
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    }
  }
});
