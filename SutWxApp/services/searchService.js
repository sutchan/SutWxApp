﻿/**
 * 鏂囦欢鍚? searchService.js
 * 鐗堟湰鍙? 1.0.1
 * 更新日期: 2025-11-28
 * 描述: 鎼滅储鏈嶅姟
 */

const request = require('../utils/request');

/**
 * 鎼滅储鏈嶅姟
 */
const searchService = {
  /**
   * 閫氱敤鎼滅储鎺ュ彛
   * @param {Object} options - 鎼滅储鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order
   * @param {Object} options.filters - 绛涢€夋潯浠?   * @param {string} options.sort - 鎺掑簭鏂瑰紡
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鎼滅储缁撴灉鍜屽垎椤典俊鎭?   */
  async search(options = {}) {
    const {
      keyword = '',
      type = 'all',
      filters = {},
      sort = '',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/search', {
      keyword,
      type,
      ...filters,
      sort,
      page,
      pageSize
    });
  },

  /**
   * 鎼滅储鍟嗗搧
   * @param {Object} options - 鎼滅储鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.categoryId - 鍒嗙被ID
   * @param {string} options.brandId - 鍝佺墝ID
   * @param {string} options.minPrice - 鏈€浣庝环鏍?   * @param {string} options.maxPrice - 鏈€楂樹环鏍?   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歱rice_asc/price_desc/sales_desc/newest/default
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鎼滅储缁撴灉鍜屽垎椤典俊鎭?   */
  async searchProducts(options = {}) {
    const {
      keyword = '',
      categoryId = '',
      brandId = '',
      minPrice = '',
      maxPrice = '',
      sort = 'default',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/search/products', {
      keyword,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort,
      page,
      pageSize
    });
  },

  /**
   * 鎼滅储鏂囩珷
   * @param {Object} options - 鎼滅储鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.categoryId - 鍒嗙被ID
   * @param {string} options.tag - 鏍囩
   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歱ublish_desc/views_desc/likes_desc/default
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鎼滅储缁撴灉鍜屽垎椤典俊鎭?   */
  async searchArticles(options = {}) {
    const {
      keyword = '',
      categoryId = '',
      tag = '',
      sort = 'default',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/search/articles', {
      keyword,
      categoryId,
      tag,
      sort,
      page,
      pageSize
    });
  },

  /**
   * 鎼滅储鐢ㄦ埛
   * @param {Object} options - 鎼滅储鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歠ans_desc/follows_desc/articles_desc/default
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鎼滅储缁撴灉鍜屽垎椤典俊鎭?   */
  async searchUsers(options = {}) {
    const {
      keyword = '',
      sort = 'default',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/search/users', {
      keyword,
      sort,
      page,
      pageSize
    });
  },

  /**
   * 鎼滅储璁㈠崟
   * @param {Object} options - 鎼滅储鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.status - 璁㈠崟鐘舵€?   * @param {string} options.startDate - 寮€濮嬫棩鏈?   * @param {string} options.endDate - 缁撴潫鏃ユ湡
   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歝reate_desc/amount_asc/amount_desc/default
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鎼滅储缁撴灉鍜屽垎椤典俊鎭?   */
  async searchOrders(options = {}) {
    const {
      keyword = '',
      status = '',
      startDate = '',
      endDate = '',
      sort = 'default',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/search/orders', {
      keyword,
      status,
      startDate,
      endDate,
      sort,
      page,
      pageSize
    });
  },

  /**
   * 鑾峰彇鎼滅储鍘嗗彶
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order
   * @param {number} options.limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @returns {Promise<Array>} 鎼滅储鍘嗗彶鍒楄〃
   */
  async getSearchHistory(options = {}) {
    const { type = 'all', limit = 10 } = options;

    return request.get('/search/history', {
      type,
      limit
    });
  },

  /**
   * 娣诲姞鎼滅储鍘嗗彶
   * @param {Object} options - 鎼滅储鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async addSearchHistory(options = {}) {
    const { keyword, type = 'all' } = options;

    return request.post('/search/history', {
      keyword,
      type
    });
  },

  /**
   * 鍒犻櫎鎼滅储鍘嗗彶
   * @param {Object} options - 鍒犻櫎鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async removeSearchHistory(options = {}) {
    const { keyword, type = 'all' } = options;

    return request.delete('/search/history', {
      keyword,
      type
    });
  },

  /**
   * 娓呯┖鎼滅储鍘嗗彶
   * @param {Object} options - 娓呯┖鍙傛暟
   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order锛屼笉浼犲垯娓呯┖鎵€鏈?   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async clearSearchHistory(options = {}) {
    const { type } = options;

    return request.delete('/search/history/clear', type ? { type } : {});
  },

  /**
   * 鑾峰彇鐑棬鎼滅储鍏抽敭璇?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order
   * @param {number} options.limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @returns {Promise<Array>} 鐑棬鎼滅储鍏抽敭璇嶅垪琛?   */
  async getHotKeywords(options = {}) {
    const { type = 'all', limit = 10 } = options;

    return request.get('/search/hot-keywords', {
      type,
      limit
    });
  },

  /**
   * 鑾峰彇鎼滅储寤鸿
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.keyword - 鎼滅储鍏抽敭璇?   * @param {string} options.type - 鎼滅储绫诲瀷锛歛ll/product/article/user/order
   * @param {number} options.limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负5
   * @returns {Promise<Array>} 鎼滅储寤鸿鍒楄〃
   */
  async getSearchSuggestions(options = {}) {
    const {
      keyword = '',
      type = 'all',
      limit = 5
    } = options;

    return request.get('/search/suggestions', {
      keyword,
      type,
      limit
    });
  },

  /**
   * 鑾峰彇鎼滅储绛涢€夋潯浠?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 鎼滅储绫诲瀷锛歱roduct/article
   * @returns {Promise<Object>} 绛涢€夋潯浠舵暟鎹?   */
  async getSearchFilters(options = {}) {
    const { type = 'product' } = options;

    return request.get('/search/filters', {
      type
    });
  },

  /**
   * 淇濆瓨鎼滅储绛涢€夋潯浠?   * @param {Object} options - 绛涢€夋潯浠跺弬鏁?   * @param {string} options.type - 鎼滅储绫诲瀷锛歱roduct/article
   * @param {Object} options.filters - 绛涢€夋潯浠?   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async saveSearchFilters(options = {}) {
    const { type = 'product', filters = {} } = options;

    return request.post('/search/filters', {
      type,
      filters
    });
  },

  /**
   * 鑾峰彇淇濆瓨鐨勬悳绱㈢瓫閫夋潯浠?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 鎼滅储绫诲瀷锛歱roduct/article
   * @returns {Promise<Object>} 淇濆瓨鐨勭瓫閫夋潯浠?   */
  async getSavedSearchFilters(options = {}) {
    const { type = 'product' } = options;

    return request.get('/search/filters/saved', {
      type
    });
  }
};

module.exports = searchService;