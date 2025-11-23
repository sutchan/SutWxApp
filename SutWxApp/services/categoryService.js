/**
 * 分类服务
 * 提供商品分类相关的API调用
 */

const request = require('../utils/request.js');

/**
 * 分类服务类
 */
class CategoryService {
  /**
   * 获取分类列表
   * @param {Object} options - 查询参数
   * @param {number} options.parentId - 父分类ID，为0或空时获取顶级分类
   * @param {boolean} options.includeChildren - 是否包含子分类
   * @param {boolean} options.includeProductCount - 是否包含商品数量
   * @returns {Promise<Object>} 分类列表
   */
  async getCategoryList(options = {}) {
    const params = {
      parentId: options.parentId || 0,
      includeChildren: options.includeChildren ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/api/categories', params);
  }

  /**
   * 获取分类详情
   * @param {string} id - 分类ID
   * @param {Object} options - 查询参数
   * @param {boolean} options.includeChildren - 是否包含子分类
   * @param {boolean} options.includeParent - 是否包含父分类信息
   * @param {boolean} options.includeProductCount - 是否包含商品数量
   * @returns {Promise<Object>} 分类详情
   */
  async getCategoryDetail(id, options = {}) {
    if (!id) {
      throw new Error('分类ID不能为空');
    }
    
    const params = {
      includeChildren: options.includeChildren ? 1 : 0,
      includeParent: options.includeParent ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get(`/api/categories/${id}`, params);
  }

  /**
   * 获取分类树形结构
   * @param {Object} options - 查询参数
   * @param {number} options.maxLevel - 最大层级，默认为3
   * @param {boolean} options.includeEmpty - 是否包含没有商品的分类
   * @param {boolean} options.includeProductCount - 是否包含商品数量
   * @returns {Promise<Object>} 分类树
   */
  async getCategoryTree(options = {}) {
    const params = {
      maxLevel: options.maxLevel || 3,
      includeEmpty: options.includeEmpty ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/api/categories/tree', params);
  }

  /**
   * 获取热门分类
   * @param {number} limit - 返回数量限制，默认为10
   * @returns {Promise<Object>} 热门分类列表
   */
  async getHotCategories(limit = 10) {
    const params = {
      limit
    };

    return request.get('/api/categories/hot', params);
  }

  /**
   * 根据分类获取推荐商品
   * @param {string} categoryId - 分类ID
   * @param {Object} options - 查询参数
   * @param {number} options.limit - 返回数量限制，默认为10
   * @param {string} options.sort - 排序方式：sales(销量)、price_asc(价格升序)、price_desc(价格降序)、newest(最新)
   * @returns {Promise<Object>} 推荐商品列表
   */
  async getCategoryProducts(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('分类ID不能为空');
    }
    
    const params = {
      limit: options.limit || 10,
      sort: options.sort || 'sales'
    };

    return request.get(`/api/categories/${categoryId}/products`, params);
  }

  /**
   * 搜索分类
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 查询参数
   * @param {number} options.limit - 返回数量限制，默认为10
   * @param {boolean} options.includeChildren - 是否包含子分类
   * @returns {Promise<Object>} 搜索结果
   */
  async searchCategories(keyword, options = {}) {
    if (!keyword) {
      throw new Error('搜索关键词不能为空');
    }
    
    const params = {
      keyword,
      limit: options.limit || 10,
      includeChildren: options.includeChildren ? 1 : 0
    };

    return request.get('/api/categories/search', params);
  }

  /**
   * 获取分类面包屑导航
   * @param {string} categoryId - 分类ID
   * @returns {Promise<Object>} 面包屑导航数据
   */
  async getCategoryBreadcrumb(categoryId) {
    if (!categoryId) {
      throw new Error('分类ID不能为空');
    }
    
    return request.get(`/api/categories/${categoryId}/breadcrumb`);
  }

  /**
   * 获取同级分类
   * @param {string} categoryId - 分类ID
   * @param {Object} options - 查询参数
   * @param {boolean} options.includeSelf - 是否包含当前分类
   * @returns {Promise<Object>} 同级分类列表
   */
  async getSiblingCategories(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('分类ID不能为空');
    }
    
    const params = {
      includeSelf: options.includeSelf ? 1 : 0
    };

    return request.get(`/api/categories/${categoryId}/siblings`, params);
  }
}

// 创建单例实例
const categoryService = new CategoryService();

module.exports = categoryService;