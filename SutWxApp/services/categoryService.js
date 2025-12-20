/**
 * 文件名 categoryService.js
 * 版本号 1.0.3
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 分类服务，处理商品分类相关业务逻辑
 */

const request = require('../utils/request');

/**
 * 分类服务类
 */
class CategoryService {
  /**
   * 获取分类列表
   * @param {Object} options - 查询参数
   * @param {number} options.parentId - 父分类ID，0表示顶级分类
   * @param {boolean} options.includeChildren - 是否包含子分类
   * @param {boolean} options.includeProductCount - 是否包含产品数量
   * @returns {Promise<Object>} 分类列表
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
   * 获取分类详情
   * @param {string} id - 分类ID
   * @param {Object} options - 查询参数
   * @param {boolean} options.includeChildren - 是否包含子分类
   * @param {boolean} options.includeParent - 是否包含父分类
   * @param {boolean} options.includeProductCount - 是否包含产品数量
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

    return request.get(`/categories/${id}`, params);
  }

  /**
   * 获取分类树状结构
   * @param {Object} options - 查询参数
   * @param {number} options.maxLevel - 最大层级，默认3级
   * @param {boolean} options.includeEmpty - 是否包含空分类
   * @param {boolean} options.includeProductCount - 是否包含产品数量
   * @returns {Promise<Object>} 分类树状结构
   */
  async getCategoryTree(options = {}) {
    const params = {
      maxLevel: options.maxLevel || 3,
      includeEmpty: options.includeEmpty ? 1 : 0,
      includeProductCount: options.includeProductCount ? 1 : 0
    };

    return request.get('/categories/tree', params);
  }

  /**
   * 获取热门分类
   * @param {number} limit - 返回数量，默认10
   * @returns {Promise<Object>} 热门分类列表
   */
  async getHotCategories(limit = 10) {
    const params = {
      limit
    };

    return request.get('/categories/hot', params);
  }

  /**
   * 获取分类下的产品
   * @param {string} categoryId - 分类ID
   * @param {Object} options - 查询参数
   * @param {number} options.limit - 返回数量，默认10
   * @param {string} options.sort - 排序方式：sales(销量) price_asc(价格升序) price_desc(价格降序) newest(最新)
   * @returns {Promise<Object>} 分类下的产品列表
   */
  async getCategoryProducts(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('分类ID不能为空');
    }
    
    const params = {
      limit: options.limit || 10,
      sort: options.sort || 'sales'
    };

    return request.get(`/categories/${categoryId}/products`, params);
  }

  /**
   * 搜索分类
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 查询参数
   * @param {number} options.limit - 返回数量，默认10
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

    return request.get('/categories/search', params);
  }

  /**
   * 获取分类面包屑
   * @param {string} categoryId - 分类ID
   * @returns {Promise<Object>} 分类面包屑
   */
  async getCategoryBreadcrumb(categoryId) {
    if (!categoryId) {
      throw new Error('分类ID不能为空');
    }
    
    return request.get(`/categories/${categoryId}/breadcrumb`);
  }

  /**
   * 获取同级分类
   * @param {string} categoryId - 分类ID
   * @param {Object} options - 查询参数
   * @param {boolean} options.includeSelf - 是否包含自身
   * @returns {Promise<Object>} 同级分类列表
   */
  async getSiblingCategories(categoryId, options = {}) {
    if (!categoryId) {
      throw new Error('分类ID不能为空');
    }
    
    const params = {
      includeSelf: options.includeSelf ? 1 : 0
    };

    return request.get(`/categories/${categoryId}/siblings`, params);
  }
}

// 导出分类服务实例
const categoryService = new CategoryService();

module.exports = categoryService;