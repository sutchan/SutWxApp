/**
 * 文件名: productService.js
 * 版本号: 1.0.1
 * 更新日期: 2025-12-04
 * 描述: 产品服务，处理产品相关业务逻辑
 */

const request = require('../utils/request');

const productService = {
  /**
   * 获取产品列表
   * @param {Object} options - 查询参数
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @param {number} options.categoryId - 分类ID
   * @param {string} options.keyword - 搜索关键词
   * @returns {Promise<Object>} 产品列表和分页信息
   */
  async getProducts(options = {}) {
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      categoryId: options.categoryId,
      keyword: options.keyword
    };
    
    return request.get('/products', params);
  },

  /**
   * 根据ID获取产品信息
   * @param {string} id - 产品ID
   * @returns {Promise<Object>} 产品信息
   * @throws {Error} 当产品不存在时抛出错误
   */
  async getProductById(id) {
    if (!id) {
      throw new Error('产品ID不能为空');
    }
    
    return request.get(`/products/${id}`);
  },

  /**
   * 搜索产品
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 查询参数
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @param {string} options.sort - 排序方式
   * @returns {Promise<Object>} 搜索结果
   */
  async searchProducts(keyword, options = {}) {
    if (!keyword) {
      throw new Error('搜索关键词不能为空');
    }
    
    const params = {
      keyword,
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sort: options.sort || 'newest'
    };

    return request.get('/products/search', params);
  },

  /**
   * 获取产品分类
   * @returns {Promise<Object>} 产品分类列表
   */
  async getCategories() {
    return request.get('/categories');
  },

  /**
   * 获取推荐产品
   * @param {number} limit - 推荐数量，默认为10
   * @returns {Promise<Object>} 推荐产品列表
   */
  async getRecommendProducts(limit = 10) {
    return request.get('/products/recommend', { limit });
  },

  /**
   * 获取热门产品
   * @param {number} limit - 热门产品数量，默认为10
   * @returns {Promise<Object>} 热门产品列表
   */
  async getHotProducts(limit = 10) {
    return request.get('/products/hot', { limit });
  },

  /**
   * 获取产品详情
   * @param {string} id - 产品ID
   * @returns {Promise<Object>} 产品详情
   */
  async getProductDetail(id) {
    if (!id) {
      throw new Error('产品ID不能为空');
    }
    
    return request.get(`/products/${id}/detail`);
  },

  /**
   * 获取产品评价
   * @param {string} id - 产品ID
   * @param {Object} options - 查询参数
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 产品评价列表
   */
  async getProductReviews(id, options = {}) {
    if (!id) {
      throw new Error('产品ID不能为空');
    }
    
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get(`/products/${id}/reviews`, params);
  }
};

module.exports = productService;
