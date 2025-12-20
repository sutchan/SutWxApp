﻿﻿﻿/**
 * 文件名 cartService.js
 * 版本号 1.0.2
 * 更新日期: 2025-12-04
 * 作者 Sut
 * 描述: 购物车服务
 */

const request = require('../utils/request');

class CartService {
  /**
   * 获取购物车列表
   * @param {Object} options - 查询参数
   * @returns {Promise<Object>} 购物车列表和统计信息
   */
  static async getCartList(options = {}) {
    return request.get('/cart/list', {}, options);
  }

  /**
   * 添加商品到购物车
   * @param {Object} data - 添加数据
   * @param {string} data.productId - 商品ID
   * @param {number} data.quantity - 数量
   * @param {string} [data.skuId] - SKU ID
   * @param {Object} [data.specifications] - 规格选择
   * @returns {Promise<Object>} 添加结果
   */
  static async addToCart(data) {
    return request.post('/cart/add', data);
  }

  /**
   * 更新购物车商品数量
   * @param {string} cartId - 购物车项ID
   * @param {number} quantity - 新数量
   * @returns {Promise<Object>} 更新结果
   */
  static async updateCartItemQuantity(cartId, quantity) {
    return request.put(`/cart/item/${cartId}`, { quantity });
  }

  /**
   * 更新购物车商品规格
   * @param {string} cartId - 购物车项ID
   * @param {Object} specifications - 新规格
   * @returns {Promise<Object>} 更新结果
   */
  static async updateCartItemSpecifications(cartId, specifications) {
    return request.put(`/cart/item/${cartId}/specifications`, { specifications });
  }

  /**
   * 删除购物车商品
   * @param {string|Array} cartIds - 购物车项ID或ID数组
   * @returns {Promise<Object>} 删除结果
   */
  static async removeFromCart(cartIds) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.delete('/cart/remove', { cartIds: ids });
  }

  /**
   * 清空购物车
   * @returns {Promise<Object>} 清空结果
   */
  static async clearCart() {
    return request.delete('/cart/clear');
  }

  /**
   * 选择/取消选择购物车商品
   * @param {string|Array} cartIds - 购物车项ID或ID数组
   * @param {boolean} selected - 是否选择
   * @returns {Promise<Object>} 更新结果
   */
  static async updateCartItemSelection(cartIds, selected) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.put('/cart/selection', { cartIds: ids, selected });
  }

  /**
   * 全选/取消全选购物车商品
   * @param {boolean} selected - 是否全选
   * @returns {Promise<Object>} 更新结果
   */
  static async updateAllCartItemSelection(selected) {
    return request.put('/cart/selection/all', { selected });
  }

  /**
   * 获取购物车商品数量
   * @returns {Promise<Object>} 购物车商品数量统计
   */
  static async getCartCount() {
    return request.get('/cart/count');
  }

  /**
   * 获取选中商品总金额
   * @returns {Promise<Object>} 选中商品金额统计
   */
  static async getSelectedItemsTotal() {
    return request.get('/cart/total');
  }

  /**
   * 批量添加商品到购物车
   * @param {Array} items - 商品列表
   * @param {string} items[].productId - 商品ID
   * @param {number} items[].quantity - 数量
   * @param {string} [items[].skuId] - SKU ID
   * @param {Object} [items[].specifications] - 规格选择
   * @returns {Promise<Object>} 添加结果
   */
  static async batchAddToCart(items) {
    return request.post('/cart/batch-add', { items });
  }

  /**
   * 将商品移到收藏夹
   * @param {string|Array} cartIds - 购物车项ID或ID数组
   * @returns {Promise<Object>} 操作结果
   */
  static async moveToFavorite(cartIds) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.post('/cart/move-to-favorite', { cartIds: ids });
  }

  /**
   * 检查商品库存
   * @param {string|Array} cartIds - 购物车项ID或ID数组
   * @returns {Promise<Object>} 库存检查结果
   */
  static async checkCartItemsStock(cartIds) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.post('/cart/check-stock', { cartIds: ids });
  }

  /**
   * 获取失效商品列表
   * @returns {Promise<Object>} 失效商品列表
   */
  static async getInvalidItems() {
    return request.get('/cart/invalid-items');
  }

  /**
   * 清除失效商品
   * @returns {Promise<Object>} 清除结果
   */
  static async clearInvalidItems() {
    return request.delete('/cart/invalid-items');
  }

  /**
   * 应用优惠券到购物车
   * @param {string} couponId - 优惠券ID
   * @returns {Promise<Object>} 应用结果
   */
  static async applyCoupon(couponId) {
    return request.post('/cart/apply-coupon', { couponId });
  }

  /**
   * 移除购物车优惠券
   * @returns {Promise<Object>} 移除结果
   */
  static async removeCoupon() {
    return request.delete('/cart/coupon');
  }

  /**
   * 计算运费
   * @param {Object} options - 计算参数
   * @param {string} [options.regionId] - 地区ID
   * @returns {Promise<Object>} 运费计算结果
   */
  static async calculateShipping(options = {}) {
    return request.get('/cart/shipping', options);
  }
}

module.exports = CartService;