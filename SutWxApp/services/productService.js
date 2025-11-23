/**
 * 商品服务
 * 提供商品相关的API调用
 */

const request = require('../utils/request.js');

/**
 * 商品服务类
 */
class ProductService {
  /**
   * 获取商品列表
   * @param {Object} options - 查询参数
   * @param {string} options.categoryId - 分类ID
   * @param {string} options.keyword - 搜索关键词
   * @param {number} options.minPrice - 最低价格
   * @param {number} options.maxPrice - 最高价格
   * @param {string} options.sort - 排序方式：price_asc(价格升序)、price_desc(价格降序)、sales(销量)、newest(最新)
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 商品列表和分页信息
   */
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

    return request.get('/api/products', params);
  }

  /**
   * 获取商品详情
   * @param {string} id - 商品ID
   * @returns {Promise<Object>} 商品详情信息
   */
  async getProductDetail(id) {
    if (!id) {
      throw new Error('商品ID不能为空');
    }
    
    return request.get(`/api/products/${id}`);
  }

  /**
   * 获取商品评价列表
   * @param {string} productId - 商品ID
   * @param {Object} options - 查询参数
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为10
   * @param {number} options.rating - 评分筛选：1-5星
   * @param {boolean} options.hasImage - 是否有图片
   * @returns {Promise<Object>} 评价列表和分页信息
   */
  async getProductReviews(productId, options = {}) {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 10,
      rating: options.rating || '',
      hasImage: options.hasImage ? 1 : ''
    };

    return request.get(`/api/products/${productId}/reviews`, params);
  }

  /**
   * 获取商品推荐列表
   * @param {string} productId - 商品ID，用于获取相关推荐
   * @param {number} limit - 返回数量限制，默认为10
   * @returns {Promise<Object>} 推荐商品列表
   */
  async getProductRecommendations(productId, limit = 10) {
    const params = {
      limit
    };

    return request.get(`/api/products/${productId}/recommendations`, params);
  }

  /**
   * 获取热门商品列表
   * @param {number} limit - 返回数量限制，默认为10
   * @returns {Promise<Object>} 热门商品列表
   */
  async getHotProducts(limit = 10) {
    const params = {
      limit
    };

    return request.get('/api/products/hot', params);
  }

  /**
   * 获取新品列表
   * @param {number} limit - 返回数量限制，默认为10
   * @returns {Promise<Object>} 新品列表
   */
  async getNewProducts(limit = 10) {
    const params = {
      limit
    };

    return request.get('/api/products/new', params);
  }

  /**
   * 获取商品搜索历史
   * @returns {Promise<Object>} 搜索历史列表
   */
  async getSearchHistory() {
    return request.get('/api/products/search-history');
  }

  /**
   * 清空商品搜索历史
   * @returns {Promise<Object>} 操作结果
   */
  async clearSearchHistory() {
    return request.delete('/api/products/search-history');
  }

  /**
   * 添加商品到搜索历史
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Object>} 操作结果
   */
  async addSearchHistory(keyword) {
    if (!keyword) {
      throw new Error('搜索关键词不能为空');
    }
    
    return request.post('/api/products/search-history', { keyword });
  }

  /**
   * 获取商品收藏状态
   * @param {string} productId - 商品ID
   * @returns {Promise<Object>} 收藏状态
   */
  async getFavoriteStatus(productId) {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    
    return request.get(`/api/products/${productId}/favorite-status`);
  }

  /**
   * 添加商品到收藏
   * @param {string} productId - 商品ID
   * @returns {Promise<Object>} 操作结果
   */
  async addToFavorites(productId) {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    
    return request.post('/api/favorites', { productId });
  }

  /**
   * 从收藏中移除商品
   * @param {string} productId - 商品ID
   * @returns {Promise<Object>} 操作结果
   */
  async removeFromFavorites(productId) {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    
    return request.delete(`/api/favorites/${productId}`);
  }

  /**
   * 获取商品库存
   * @param {string} productId - 商品ID
   * @param {Object} options - 查询参数
   * @param {string} options.skuId - SKU ID，如果有
   * @returns {Promise<Object>} 库存信息
   */
  async getProductStock(productId, options = {}) {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    
    const params = {
      skuId: options.skuId || ''
    };

    return request.get(`/api/products/${productId}/stock`, params);
  }

  /**
   * 获取商品SKU信息
   * @param {string} productId - 商品ID
   * @returns {Promise<Object>} SKU信息
   */
  async getProductSkus(productId) {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    
    return request.get(`/api/products/${productId}/skus`);
  }
}

// 创建单例实例
const productService = new ProductService();

module.exports = productService;