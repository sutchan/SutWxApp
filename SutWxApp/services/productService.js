﻿/**
 * 鏂囦欢鍚? productService.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 鍟嗗搧鏈嶅姟 - 鎻愪緵鍟嗗搧鐩稿叧鐨凙PI鎺ュ彛璋冪敤
 */

const request = require('../utils/request');

/**
 * 鍟嗗搧鏈嶅姟绫? */
class ProductService {
  /**
   * 鑾峰彇鍟嗗搧鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.categoryId - 鍒嗙被ID
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {number} options.minPrice - 鏈€浣庝环鏍?   * @param {number} options.maxPrice - 鏈€楂樹环鏍?   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歱rice_asc(浠锋牸鍗囧簭)銆乸rice_desc(浠锋牸闄嶅簭)銆乻ales(閿€閲?銆乶ewest(鏈€鏂?
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鍟嗗搧鍒楄〃鍜屽垎椤典俊鎭?   */
  async getProductList(options = {}) {
    const params = {
      categoryId: options.categoryId || '',
      keyword: options.keyword || '',
      minPrice: options.minPrice || '',
      maxPrice: options.maxPrice || '',
      sort: options.sort || 'newest',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };

    return request.get('/products', params);
  }

  /**
   * 鑾峰彇鍟嗗搧璇︽儏
   * @param {string} id - 鍟嗗搧ID
   * @returns {Promise<Object>} 鍟嗗搧璇︾粏淇℃伅
   */
  async getProductDetail(id) {
    if (!id) {
      throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
    }
    
    return request.get(`/products/${id}`);
  }

  /**
   * 鎼滅储鍟嗗搧
   * @param {string} keyword - 鎼滅储鍏抽敭璇?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @param {string} options.sort - 鎺掑簭鏂瑰紡
   * @returns {Promise<Object>} 鎼滅储缁撴灉
   */
  async searchProducts(keyword, options = {}) {
    if (!keyword) {
      throw new Error('鎼滅储鍏抽敭璇嶄笉鑳戒负绌?);
    }
    
    const params = {
      keyword,
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sort: options.sort || 'newest'
    };

    return request.get('/products/search', params);
  }

  /**
   * 鑾峰彇鍟嗗搧鍒嗙被
   * @returns {Promise<Object>} 鍟嗗搧鍒嗙被鍒楄〃
   */
  async getProductCategories() {
    return request.get('/products/categories');
  }

  /**
   * 鑾峰彇鍟嗗搧璇勮鍒楄〃
   * @param {string} productId - 鍟嗗搧ID
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负10
   * @param {number} options.rating - 璇勫垎绛涢€夛細1-5鏄?   * @param {boolean} options.hasImage - 鏄惁鏈夊浘鐗?   * @returns {Promise<Object>} 璇勮鍒楄〃鍜屽垎椤典俊鎭?   */
  async getProductReviews(productId, options = {}) {
    if (!productId) {
      throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
    }
    
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 10,
      rating: options.rating || '',
      hasImage: options.hasImage ? 1 : ''
    };

    return request.get(`/products/${productId}/reviews`, params);
  }

  /**
   * 鑾峰彇鍟嗗搧鎺ㄨ崘鍒楄〃
   * @param {string} productId - 鍟嗗搧ID锛岀敤浜庤幏鍙栫浉鍏虫帹鑽?   * @param {number} limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @returns {Promise<Object>} 鎺ㄨ崘鍟嗗搧鍒楄〃
   */
  async getProductRecommendations(productId, limit = 10) {
    const params = {
      limit
    };

    return request.get(`/products/${productId}/recommendations`, params);
  }

  /**
   * 鑾峰彇鐑棬鍟嗗搧鍒楄〃
   * @param {number} limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @returns {Promise<Object>} 鐑棬鍟嗗搧鍒楄〃
   */
  async getHotProducts(limit = 10) {
    const params = {
      limit
    };

    return request.get('/products/hot', params);
  }

  /**
   * 鑾峰彇鏂板搧鍒楄〃
   * @param {number} limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @returns {Promise<Object>} 鏂板搧鍒楄〃
   */
  async getNewProducts(limit = 10) {
    const params = {
      limit
    };

    return request.get('/products/new', params);
  }

  /**
   * 鑾峰彇鍟嗗搧鎼滅储鍘嗗彶
   * @returns {Promise<Object>} 鎼滅储鍘嗗彶鍒楄〃
   */
  async getSearchHistory() {
    return request.get('/products/search-history');
  }

  /**
   * 娓呯┖鍟嗗搧鎼滅储鍘嗗彶
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async clearSearchHistory() {
    return request.delete('/products/search-history');
  }

  /**
   * 娣诲姞鍟嗗搧鍒版悳绱㈠巻鍙?   * @param {string} keyword - 鎼滅储鍏抽敭璇?   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async addSearchHistory(keyword) {
    if (!keyword) {
      throw new Error('鎼滅储鍏抽敭璇嶄笉鑳戒负绌?);
    }
    
    return request.post('/products/search-history', { keyword });
  }

  /**
   * 鑾峰彇鍟嗗搧鏀惰棌鐘舵€?   * @param {string} productId - 鍟嗗搧ID
   * @returns {Promise<Object>} 鏀惰棌鐘舵€?   */
  async getFavoriteStatus(productId) {
    if (!productId) {
      throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
    }
    
    return request.get(`/products/${productId}/favorite-status`);
  }

  /**
   * 娣诲姞鍟嗗搧鍒版敹钘忓す
   * @param {string} productId - 鍟嗗搧ID
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async addToFavorites(productId) {
    if (!productId) {
      throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
    }
    
    return request.post('/favorites', { productId });
  }

  /**
   * 浠庢敹钘忓す绉婚櫎鍟嗗搧
   * @param {string} productId - 鍟嗗搧ID
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async removeFromFavorites(productId) {
    if (!productId) {
      throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
    }
    
    return request.delete(`/favorites/${productId}`);
  }

  /**
   * 鑾峰彇鍟嗗搧搴撳瓨
   * @param {string} productId - 鍟嗗搧ID
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.skuId - SKU ID锛屽鏋滄湁
   * @returns {Promise<Object>} 搴撳瓨淇℃伅
   */
  async getProductStock(productId, options = {}) {
    if (!productId) {
      throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
    }
    
    const params = {
      skuId: options.skuId || ''
    };

    return request.get(`/products/${productId}/stock`, params);
  }
}

// 鍒涘缓鍗曚緥瀹炰緥
const productService = new ProductService();

module.exports = productService;