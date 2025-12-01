/**
 * 鏂囦欢鍚? cartService.js
 * 鐗堟湰鍙? 1.0.2
 * 更新日期: 2025-11-29
 * 作者 Sut
 * 描述: 璐墿杞︽湇鍔? */

const request = require('../utils/request');

class CartService {
  /**
   * 鑾峰彇璐墿杞﹀垪琛?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @returns {Promise<Object>} 璐墿杞﹀垪琛ㄥ拰缁熻淇℃伅
   */
  static async getCartList(options = {}) {
    return request.get('/cart/list', {}, options);
  }

  /**
   * 娣诲姞鍟嗗搧鍒拌喘鐗╄溅
   * @param {Object} data - 娣诲姞鏁版嵁
   * @param {string} data.productId - 鍟嗗搧ID
   * @param {number} data.quantity - 鏁伴噺
   * @param {string} [data.skuId] - SKU ID
   * @param {Object} [data.specifications] - 瑙勬牸閫夋嫨
   * @returns {Promise<Object>} 娣诲姞缁撴灉
   */
  static async addToCart(data) {
    return request.post('/cart/add', data);
  }

  /**
   * 鏇存柊璐墿杞﹀晢鍝佹暟閲?   * @param {string} cartId - 璐墿杞﹂」ID
   * @param {number} quantity - 鏂版暟閲?   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  static async updateCartItemQuantity(cartId, quantity) {
    return request.put(`/cart/item/${cartId}`, { quantity });
  }

  /**
   * 鏇存柊璐墿杞﹀晢鍝佽鏍?   * @param {string} cartId - 璐墿杞﹂」ID
   * @param {Object} specifications - 鏂拌鏍?   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  static async updateCartItemSpecifications(cartId, specifications) {
    return request.put(`/cart/item/${cartId}/specifications`, { specifications });
  }

  /**
   * 鍒犻櫎璐墿杞﹀晢鍝?   * @param {string|Array} cartIds - 璐墿杞﹂」ID鎴朓D鏁扮粍
   * @returns {Promise<Object>} 鍒犻櫎缁撴灉
   */
  static async removeFromCart(cartIds) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.delete('/cart/remove', { cartIds: ids });
  }

  /**
   * 娓呯┖璐墿杞?   * @returns {Promise<Object>} 娓呯┖缁撴灉
   */
  static async clearCart() {
    return request.delete('/cart/clear');
  }

  /**
   * 閫夋嫨/鍙栨秷閫夋嫨璐墿杞﹀晢鍝?   * @param {string|Array} cartIds - 璐墿杞﹂」ID鎴朓D鏁扮粍
   * @param {boolean} selected - 鏄惁閫夋嫨
   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  static async updateCartItemSelection(cartIds, selected) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.put('/cart/selection', { cartIds: ids, selected });
  }

  /**
   * 鍏ㄩ€?鍙栨秷鍏ㄩ€夎喘鐗╄溅鍟嗗搧
   * @param {boolean} selected - 鏄惁鍏ㄩ€?   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  static async updateAllCartItemSelection(selected) {
    return request.put('/cart/selection/all', { selected });
  }

  /**
   * 鑾峰彇璐墿杞﹀晢鍝佹暟閲?   * @returns {Promise<Object>} 璐墿杞﹀晢鍝佹暟閲忕粺璁?   */
  static async getCartCount() {
    return request.get('/cart/count');
  }

  /**
   * 鑾峰彇閫変腑鍟嗗搧鎬婚噾棰?   * @returns {Promise<Object>} 閫変腑鍟嗗搧閲戦缁熻
   */
  static async getSelectedItemsTotal() {
    return request.get('/cart/total');
  }

  /**
   * 鎵归噺娣诲姞鍟嗗搧鍒拌喘鐗╄溅
   * @param {Array} items - 鍟嗗搧鍒楄〃
   * @param {string} items[].productId - 鍟嗗搧ID
   * @param {number} items[].quantity - 鏁伴噺
   * @param {string} [items[].skuId] - SKU ID
   * @param {Object} [items[].specifications] - 瑙勬牸閫夋嫨
   * @returns {Promise<Object>} 娣诲姞缁撴灉
   */
  static async batchAddToCart(items) {
    return request.post('/cart/batch-add', { items });
  }

  /**
   * 灏嗗晢鍝佺Щ鍒版敹钘忓す
   * @param {string|Array} cartIds - 璐墿杞﹂」ID鎴朓D鏁扮粍
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  static async moveToFavorite(cartIds) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.post('/cart/move-to-favorite', { cartIds: ids });
  }

  /**
   * 妫€鏌ュ晢鍝佸簱瀛?   * @param {string|Array} cartIds - 璐墿杞﹂」ID鎴朓D鏁扮粍
   * @returns {Promise<Object>} 搴撳瓨妫€鏌ョ粨鏋?   */
  static async checkCartItemsStock(cartIds) {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    return request.post('/cart/check-stock', { cartIds: ids });
  }

  /**
   * 鑾峰彇澶辨晥鍟嗗搧鍒楄〃
   * @returns {Promise<Object>} 澶辨晥鍟嗗搧鍒楄〃
   */
  static async getInvalidItems() {
    return request.get('/cart/invalid-items');
  }

  /**
   * 娓呴櫎澶辨晥鍟嗗搧
   * @returns {Promise<Object>} 娓呴櫎缁撴灉
   */
  static async clearInvalidItems() {
    return request.delete('/cart/invalid-items');
  }

  /**
   * 搴旂敤浼樻儬鍒稿埌璐墿杞?   * @param {string} couponId - 浼樻儬鍒窱D
   * @returns {Promise<Object>} 搴旂敤缁撴灉
   */
  static async applyCoupon(couponId) {
    return request.post('/cart/apply-coupon', { couponId });
  }

  /**
   * 绉婚櫎璐墿杞︿紭鎯犲埜
   * @returns {Promise<Object>} 绉婚櫎缁撴灉
   */
  static async removeCoupon() {
    return request.delete('/cart/coupon');
  }

  /**
   * 璁＄畻杩愯垂
   * @param {Object} options - 璁＄畻鍙傛暟
   * @param {string} [options.regionId] - 鍦板尯ID
   * @returns {Promise<Object>} 杩愯垂璁＄畻缁撴灉
   */
  static async calculateShipping(options = {}) {
    return request.get('/cart/shipping', options);
  }
}

module.exports = CartService;