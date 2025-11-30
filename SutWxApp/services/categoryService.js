/**
 * 鏂囦欢鍚? categoryService.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 鍒嗙被鏈嶅姟
 */

const request = require('../utils/request');

/**
 * 鍒嗙被鏈嶅姟绫? */
class CategoryService {
  /**
   * 鑾峰彇鍒嗙被鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} options.parentId - 鐖跺垎绫籌D锛屼负0鎴栫┖鏃惰幏鍙栭《绾у垎绫?   * @param {boolean} options.includeChildren - 鏄惁鍖呭惈瀛愬垎绫?   * @param {boolean} options.includeProductCount - 鏄惁鍖呭惈鍟嗗搧鏁伴噺
   * @returns {Promise<Object>} 鍒嗙被鍒楄〃
   */
  async getCategoryList(options = {}) {
    const params = {
      parentId: options.parentId || 0,
      includeChildren: options.includeChildren ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/categories', params);
  }

  /**
   * 鑾峰彇鍒嗙被璇︽儏
   * @param {string} id - 鍒嗙被ID
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {boolean} options.includeChildren - 鏄惁鍖呭惈瀛愬垎绫?   * @param {boolean} options.includeParent - 鏄惁鍖呭惈鐖跺垎绫讳俊鎭?   * @param {boolean} options.includeProductCount - 鏄惁鍖呭惈鍟嗗搧鏁伴噺
   * @returns {Promise<Object>} 鍒嗙被璇︽儏
   */
  async getCategoryDetail(id, options = {}) {
    if (!id) {
      throw new Error('鍒嗙被ID涓嶈兘涓虹┖');
    }
    
    const params = {
      includeChildren: options.includeChildren ? 1 : 0,
      includeParent: options.includeParent ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get(`/categories/${id}`, params);
  }

  /**
   * 鑾峰彇鍒嗙被鏍戝舰缁撴瀯
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} options.maxLevel - 鏈€澶у眰绾э紝榛樿涓?
   * @param {boolean} options.includeEmpty - 鏄惁鍖呭惈娌℃湁鍟嗗搧鐨勫垎绫?   * @param {boolean} options.includeProductCount - 鏄惁鍖呭惈鍟嗗搧鏁伴噺
   * @returns {Promise<Object>} 鍒嗙被鏍?   */
  async getCategoryTree(options = {}) {
    const params = {
      maxLevel: options.maxLevel || 3,
      includeEmpty: options.includeEmpty ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/categories/tree', params);
  }

  /**
   * 鑾峰彇鐑棬鍒嗙被
   * @param {number} limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @returns {Promise<Object>} 鐑棬鍒嗙被鍒楄〃
   */
  async getHotCategories(limit = 10) {
    const params = {
      limit
    };

    return request.get('/categories/hot', params);
  }

  /**
   * 鏍规嵁鍒嗙被鑾峰彇鎺ㄨ崘鍟嗗搧
   * @param {string} categoryId - 鍒嗙被ID
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} options.limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歴ales(閿€閲?銆乸rice_asc(浠锋牸鍗囧簭)銆乸rice_desc(浠锋牸闄嶅簭)銆乶ewest(鏈€鏂?
   * @returns {Promise<Object>} 鎺ㄨ崘鍟嗗搧鍒楄〃
   */
  async getCategoryProducts(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('鍒嗙被ID涓嶈兘涓虹┖');
    }
    
    const params = {
      limit: options.limit || 10,
      sort: options.sort || 'sales'
    };

    return request.get(`/categories/${categoryId}/products`, params);
  }

  /**
   * 鎼滅储鍒嗙被
   * @param {string} keyword - 鎼滅储鍏抽敭璇?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} options.limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁や负10
   * @param {boolean} options.includeChildren - 鏄惁鍖呭惈瀛愬垎绫?   * @returns {Promise<Object>} 鎼滅储缁撴灉
   */
  async searchCategories(keyword, options = {}) {
    if (!keyword) {
      throw new Error('鎼滅储鍏抽敭璇嶄笉鑳戒负绌?);
    }
    
    const params = {
      keyword,
      limit: options.limit || 10,
      includeChildren: options.includeChildren ? 1 : 0
    };

    return request.get('/categories/search', params);
  }

  /**
   * 鑾峰彇鍒嗙被闈㈠寘灞戝鑸?   * @param {string} categoryId - 鍒嗙被ID
   * @returns {Promise<Object>} 闈㈠寘灞戝鑸暟鎹?   */
  async getCategoryBreadcrumb(categoryId) {
    if (!categoryId) {
      throw new Error('鍒嗙被ID涓嶈兘涓虹┖');
    }
    
    return request.get(`/categories/${categoryId}/breadcrumb`);
  }

  /**
   * 鑾峰彇鍚岀骇鍒嗙被
   * @param {string} categoryId - 鍒嗙被ID
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {boolean} options.includeSelf - 鏄惁鍖呭惈褰撳墠鍒嗙被
   * @returns {Promise<Object>} 鍚岀骇鍒嗙被鍒楄〃
   */
  async getSiblingCategories(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('鍒嗙被ID涓嶈兘涓虹┖');
    }
    
    const params = {
      includeSelf: options.includeSelf ? 1 : 0
    };

    return request.get(`/categories/${categoryId}/siblings`, params);
  }
}

// 鍒涘缓鍗曚緥瀹炰緥
const categoryService = new CategoryService();

module.exports = categoryService;