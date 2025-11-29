/**
 * 文件名: searchService.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-28
 * 描述: 搜索服务
 */

const request = require('../utils/request');

/**
 * 搜索服务
 */
const searchService = {
  /**
   * 通用搜索接口
   * @param {Object} options - 搜索参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.type - 搜索类型：all/product/article/user/order
   * @param {Object} options.filters - 筛选条件
   * @param {string} options.sort - 排序方式
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 搜索结果和分页信息
   */
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
   * 搜索商品
   * @param {Object} options - 搜索参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.categoryId - 分类ID
   * @param {string} options.brandId - 品牌ID
   * @param {string} options.minPrice - 最低价格
   * @param {string} options.maxPrice - 最高价格
   * @param {string} options.sort - 排序方式：price_asc/price_desc/sales_desc/newest/default
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 搜索结果和分页信息
   */
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
   * 搜索文章
   * @param {Object} options - 搜索参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.categoryId - 分类ID
   * @param {string} options.tag - 标签
   * @param {string} options.sort - 排序方式：publish_desc/views_desc/likes_desc/default
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 搜索结果和分页信息
   */
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
   * 搜索用户
   * @param {Object} options - 搜索参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.sort - 排序方式：fans_desc/follows_desc/articles_desc/default
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 搜索结果和分页信息
   */
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
   * 搜索订单
   * @param {Object} options - 搜索参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.status - 订单状态
   * @param {string} options.startDate - 开始日期
   * @param {string} options.endDate - 结束日期
   * @param {string} options.sort - 排序方式：create_desc/amount_asc/amount_desc/default
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 搜索结果和分页信息
   */
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
   * 获取搜索历史
   * @param {Object} options - 查询参数
   * @param {string} options.type - 搜索类型：all/product/article/user/order
   * @param {number} options.limit - 返回数量限制，默认为10
   * @returns {Promise<Array>} 搜索历史列表
   */
  async getSearchHistory(options = {}) {
    const { type = 'all', limit = 10 } = options;

    return request.get('/search/history', {
      type,
      limit
    });
  },

  /**
   * 添加搜索历史
   * @param {Object} options - 搜索参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.type - 搜索类型：all/product/article/user/order
   * @returns {Promise<Object>} 操作结果
   */
  async addSearchHistory(options = {}) {
    const { keyword, type = 'all' } = options;

    return request.post('/search/history', {
      keyword,
      type
    });
  },

  /**
   * 删除搜索历史
   * @param {Object} options - 删除参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.type - 搜索类型：all/product/article/user/order
   * @returns {Promise<Object>} 操作结果
   */
  async removeSearchHistory(options = {}) {
    const { keyword, type = 'all' } = options;

    return request.delete('/search/history', {
      keyword,
      type
    });
  },

  /**
   * 清空搜索历史
   * @param {Object} options - 清空参数
   * @param {string} options.type - 搜索类型：all/product/article/user/order，不传则清空所有
   * @returns {Promise<Object>} 操作结果
   */
  async clearSearchHistory(options = {}) {
    const { type } = options;

    return request.delete('/search/history/clear', type ? { type } : {});
  },

  /**
   * 获取热门搜索关键词
   * @param {Object} options - 查询参数
   * @param {string} options.type - 搜索类型：all/product/article/user/order
   * @param {number} options.limit - 返回数量限制，默认为10
   * @returns {Promise<Array>} 热门搜索关键词列表
   */
  async getHotKeywords(options = {}) {
    const { type = 'all', limit = 10 } = options;

    return request.get('/search/hot-keywords', {
      type,
      limit
    });
  },

  /**
   * 获取搜索建议
   * @param {Object} options - 查询参数
   * @param {string} options.keyword - 搜索关键词
   * @param {string} options.type - 搜索类型：all/product/article/user/order
   * @param {number} options.limit - 返回数量限制，默认为5
   * @returns {Promise<Array>} 搜索建议列表
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
   * 获取搜索筛选条件
   * @param {Object} options - 查询参数
   * @param {string} options.type - 搜索类型：product/article
   * @returns {Promise<Object>} 筛选条件数据
   */
  async getSearchFilters(options = {}) {
    const { type = 'product' } = options;

    return request.get('/search/filters', {
      type
    });
  },

  /**
   * 保存搜索筛选条件
   * @param {Object} options - 筛选条件参数
   * @param {string} options.type - 搜索类型：product/article
   * @param {Object} options.filters - 筛选条件
   * @returns {Promise<Object>} 操作结果
   */
  async saveSearchFilters(options = {}) {
    const { type = 'product', filters = {} } = options;

    return request.post('/search/filters', {
      type,
      filters
    });
  },

  /**
   * 获取保存的搜索筛选条件
   * @param {Object} options - 查询参数
   * @param {string} options.type - 搜索类型：product/article
   * @returns {Promise<Object>} 保存的筛选条件
   */
  async getSavedSearchFilters(options = {}) {
    const { type = 'product' } = options;

    return request.get('/search/filters/saved', {
      type
    });
  }
};

module.exports = searchService;