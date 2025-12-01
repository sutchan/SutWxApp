/**
 * 閺傚洣娆㈤崥? categoryService.js
 * 閻楀牊婀伴崣? 1.0.2
 * 閺囧瓨鏌婇弮銉︽埂: 2025-11-29
 * 娴ｆ粏鈧? Sut
 * 閹诲繗鍫? 閸掑棛琚張宥呭
 */

const request = require('../utils/request');

/**
 * 閸掑棛琚張宥呭缁? */
class CategoryService {
  /**
   * 閼惧嘲褰囬崚鍡欒閸掓銆?   * @param {Object} options - 閺屻儴顕楅崣鍌涙殶
   * @param {number} options.parentId - 閻栬泛鍨庣猾绫孌閿涘奔璐?閹存牜鈹栭弮鎯板箯閸欐牠銆婄痪褍鍨庣猾?   * @param {boolean} options.includeChildren - 閺勵垰鎯侀崠鍛儓鐎涙劕鍨庣猾?   * @param {boolean} options.includeProductCount - 閺勵垰鎯侀崠鍛儓閸熷棗鎼ч弫浼村櫤
   * @returns {Promise<Object>} 閸掑棛琚崚妤勩€?   */
  async getCategoryList(options = {}) {
    const params = {
      parentId: options.parentId || 0,
      includeChildren: options.includeChildren ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/categories', params);
  }

  /**
   * 閼惧嘲褰囬崚鍡欒鐠囷附鍎?   * @param {string} id - 閸掑棛琚獻D
   * @param {Object} options - 閺屻儴顕楅崣鍌涙殶
   * @param {boolean} options.includeChildren - 閺勵垰鎯侀崠鍛儓鐎涙劕鍨庣猾?   * @param {boolean} options.includeParent - 閺勵垰鎯侀崠鍛儓閻栬泛鍨庣猾璁充繆閹?   * @param {boolean} options.includeProductCount - 閺勵垰鎯侀崠鍛儓閸熷棗鎼ч弫浼村櫤
   * @returns {Promise<Object>} 閸掑棛琚拠锔藉剰
   */
  async getCategoryDetail(id, options = {}) {
    if (!id) {
      throw new Error('閸掑棛琚獻D娑撳秷鍏樻稉铏光敄');
    }
    
    const params = {
      includeChildren: options.includeChildren ? 1 : 0,
      includeParent: options.includeParent ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get(`/categories/${id}`, params);
  }

  /**
   * 閼惧嘲褰囬崚鍡欒閺嶆垵鑸扮紒鎾寸€?   * @param {Object} options - 閺屻儴顕楅崣鍌涙殶
   * @param {number} options.maxLevel - 閺堚偓婢堆冪湴缁狙嶇礉姒涙顓绘稉?
   * @param {boolean} options.includeEmpty - 閺勵垰鎯侀崠鍛儓濞屸剝婀侀崯鍡楁惂閻ㄥ嫬鍨庣猾?   * @param {boolean} options.includeProductCount - 閺勵垰鎯侀崠鍛儓閸熷棗鎼ч弫浼村櫤
   * @returns {Promise<Object>} 閸掑棛琚弽?   */
  async getCategoryTree(options = {}) {
    const params = {
      maxLevel: options.maxLevel || 3,
      includeEmpty: options.includeEmpty ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/categories/tree', params);
  }

  /**
   * 閼惧嘲褰囬悜顓㈡，閸掑棛琚?   * @param {number} limit - 鏉╂柨娲栭弫浼村櫤闂勬劕鍩楅敍宀勭帛鐠併倓璐?0
   * @returns {Promise<Object>} 閻戭參妫崚鍡欒閸掓銆?   */
  async getHotCategories(limit = 10) {
    const params = {
      limit
    };

    return request.get('/categories/hot', params);
  }

  /**
   * 閺嶈宓侀崚鍡欒閼惧嘲褰囬幒銊ㄥ礃閸熷棗鎼?   * @param {string} categoryId - 閸掑棛琚獻D
   * @param {Object} options - 閺屻儴顕楅崣鍌涙殶
   * @param {number} options.limit - 鏉╂柨娲栭弫浼村櫤闂勬劕鍩楅敍宀勭帛鐠併倓璐?0
   * @param {string} options.sort - 閹烘帒绨弬鐟扮础閿涙ales(闁库偓闁?閵嗕垢rice_asc(娴犻攱鐗搁崡鍥х碍)閵嗕垢rice_desc(娴犻攱鐗搁梽宥呯碍)閵嗕苟ewest(閺堚偓閺?
   * @returns {Promise<Object>} 閹恒劏宕橀崯鍡楁惂閸掓銆?   */
  async getCategoryProducts(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('閸掑棛琚獻D娑撳秷鍏樻稉铏光敄');
    }
    
    const params = {
      limit: options.limit || 10,
      sort: options.sort || 'sales'
    };

    return request.get(`/categories/${categoryId}/products`, params);
  }

  /**
   * 閹兼粎鍌ㄩ崚鍡欒
   * @param {string} keyword - 閹兼粎鍌ㄩ崗鎶芥暛鐠?   * @param {Object} options - 閺屻儴顕楅崣鍌涙殶
   * @param {number} options.limit - 鏉╂柨娲栭弫浼村櫤闂勬劕鍩楅敍宀勭帛鐠併倓璐?0
   * @param {boolean} options.includeChildren - 閺勵垰鎯侀崠鍛儓鐎涙劕鍨庣猾?   * @returns {Promise<Object>} 閹兼粎鍌ㄧ紒鎾寸亯
   */
  async searchCategories(keyword, options = {}) {
    if (!keyword) {
      throw new Error('閹兼粎鍌ㄩ崗鎶芥暛鐠囧秳绗夐懗鎴掕礋缁?);
    }
    
    const params = {
      keyword,
      limit: options.limit || 10,
      includeChildren: options.includeChildren ? 1 : 0
    };

    return request.get('/categories/search', params);
  }

  /**
   * 閼惧嘲褰囬崚鍡欒闂堛垹瀵樼仦鎴濐嚤閼?   * @param {string} categoryId - 閸掑棛琚獻D
   * @returns {Promise<Object>} 闂堛垹瀵樼仦鎴濐嚤閼割亝鏆熼幑?   */
  async getCategoryBreadcrumb(categoryId) {
    if (!categoryId) {
      throw new Error('閸掑棛琚獻D娑撳秷鍏樻稉铏光敄');
    }
    
    return request.get(`/categories/${categoryId}/breadcrumb`);
  }

  /**
   * 閼惧嘲褰囬崥宀€楠囬崚鍡欒
   * @param {string} categoryId - 閸掑棛琚獻D
   * @param {Object} options - 閺屻儴顕楅崣鍌涙殶
   * @param {boolean} options.includeSelf - 閺勵垰鎯侀崠鍛儓瑜版挸澧犻崚鍡欒
   * @returns {Promise<Object>} 閸氬瞼楠囬崚鍡欒閸掓銆?   */
  async getSiblingCategories(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('閸掑棛琚獻D娑撳秷鍏樻稉铏光敄');
    }
    
    const params = {
      includeSelf: options.includeSelf ? 1 : 0
    };

    return request.get(`/categories/${categoryId}/siblings`, params);
  }
}

// 閸掓稑缂撻崡鏇氱伐鐎圭偘绶?const categoryService = new CategoryService();

module.exports = categoryService;