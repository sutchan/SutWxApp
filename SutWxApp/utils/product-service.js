/**
 * product-service.js - 产品服务模块
 * 处理产品的查询、搜索、详情获取等相关功能
 */

const api = require('./api');
const { showToast, getStorage, setStorage } = require('./global');

// 缓存时间设置
const CACHE_DURATION = {
  PRODUCTS: 5 * 60 * 1000, // 5分钟
  PRODUCT_DETAIL: 10 * 60 * 1000 // 10分钟
};

/**
 * 获取产品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @param {number} params.category_id - 分类ID，可选
 * @param {string} params.keyword - 搜索关键词，可选
 * @param {string} params.sort - 排序方式，默认为'latest'
 * @param {boolean} params.ignoreCache - 是否忽略缓存，默认为false
 * @returns {Promise<Object>} - 返回产品列表和分页信息
 */
const getProductList = async (params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      category_id: params.category_id || '',
      keyword: params.keyword || '',
      sort: params.sort || 'latest',
      ...params.filters
    };
    
    // 生成缓存键名（只有第一页、没有分类ID和关键词时才缓存）
    const cacheKey = params.page === 1 && !params.category_id && !params.keyword 
      ? `cache_products_${queryParams.sort}` 
      : null;
    
    // 尝试从缓存获取数据
    if (cacheKey && !params.ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCTS)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const result = await api.get('/api/products', queryParams);
    
    // 缓存数据
    if (cacheKey) {
      setStorage(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
    }
    
    return result.data;
  } catch (error) {
    console.error('获取产品列表失败:', error);
    
    // 尝试使用过期的缓存数据
    if (params.page === 1 && !params.category_id && !params.keyword) {
      const cacheKey = `cache_products_${params.sort || 'latest'}`;
      const cachedData = getStorage(cacheKey);
      if (cachedData) {
        console.log('使用缓存中的产品数据');
        return cachedData.data;
      }
    }
    
    showToast('获取产品列表失败');
    throw error;
  }
};

/**
 * 获取产品详情
 * @param {number|string} id - 产品ID
 * @param {boolean} ignoreCache - 是否忽略缓存，默认为false
 * @returns {Promise<Object>} - 返回产品详情
 */
const getProductDetail = async (id, ignoreCache = false) => {
  try {
    const cacheKey = `cache_product_${id}`;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCT_DETAIL)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const product = await api.get(`/api/products/${id}`);
    
    // 缓存数据
    setStorage(cacheKey, {
      data: product.data,
      timestamp: Date.now()
    });
    
    return product.data;
  } catch (error) {
    console.error('获取产品详情失败', error);
    
    // 尝试使用缓存中的数据
    if (!ignoreCache) {
      const cachedData = getStorage(`cache_product_${id}`);
      if (cachedData) {
        console.log('使用缓存中的产品详情数据');
        return cachedData.data;
      }
    }
    
    showToast('获取产品详情失败');
    throw error;
  }
};

/**
 * 获取相关产品
 * @param {Object} params - 查询参数
 * @param {string|number} params.product_id - 产品ID
 * @param {number} params.limit - 返回数量，默认6个
 * @returns {Promise<Array>} - 返回相关产品列表
 */
const getRelatedProducts = async (params = {}) => {
  try {
    const queryParams = {
      product_id: params.product_id,
      limit: params.limit || 6
    };
    
    const result = await api.get('/api/products/related', queryParams);
    return result.data;
  } catch (error) {
    console.error('获取相关产品失败:', error);
    showToast('获取相关产品失败');
    return [];
  }
};

/**
 * 搜索产品
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 附加参数
 * @returns {Promise<Object>} - 返回搜索结果
 */
const searchProducts = async (keyword, params = {}) => {
  return getProductList({
    ...params,
    keyword,
    page: params.page || 1,
    per_page: params.per_page || 10,
    ignoreCache: true // 搜索结果不使用缓存
  });
};

/**
 * 获取热门产品
 * @param {number} limit - 返回数量，默认10个
 * @returns {Promise<Array>} - 返回热门产品列表
 */
const getHotProducts = async (limit = 10) => {
  try {
    const cacheKey = `cache_hot_products_${limit}`;
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCTS)) {
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/api/products/hot', { limit });
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });
    
    return result.data;
  } catch (error) {
    console.error('获取热门产品失败:', error);
    
    // 尝试使用缓存中的数据
    const cacheKey = `cache_hot_products_${limit}`;
    const cachedData = getStorage(cacheKey);
    if (cachedData) {
      console.log('使用缓存中的热门产品数据');
      return cachedData.data;
    }
    
    return [];
  }
};

/**
 * 获取推荐产品
 * @param {number} limit - 返回数量，默认10个
 * @returns {Promise<Array>} - 返回推荐产品列表
 */
const getRecommendedProducts = async (limit = 10) => {
  try {
    const cacheKey = `cache_recommended_products_${limit}`;
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCTS)) {
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/api/products/recommended', { limit });
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });
    
    return result.data;
  } catch (error) {
    console.error('获取推荐产品失败:', error);
    
    // 尝试使用缓存中的数据
    const cacheKey = `cache_recommended_products_${limit}`;
    const cachedData = getStorage(cacheKey);
    if (cachedData) {
      console.log('使用缓存中的推荐产品数据');
      return cachedData.data;
    }
    
    return [];
  }
};

/**
 * 获取产品分类列表
 * @returns {Promise<Array>} - 返回产品分类列表
 */
const getProductCategories = async () => {
  try {
    const cacheKey = 'cache_product_categories';
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < 30 * 60 * 1000)) { // 30分钟缓存
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/api/product-categories');
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });
    
    return result.data;
  } catch (error) {
    console.error('获取产品分类失败:', error);
    
    // 尝试使用缓存中的数据
    const cachedData = getStorage('cache_product_categories');
    if (cachedData) {
      console.log('使用缓存中的产品分类数据');
      return cachedData.data;
    }
    
    return [];
  }
};

/**
 * 清除产品缓存
 */
const clearProductCache = () => {
  try {
    const cacheKeys = Object.keys(getStorage());
    cacheKeys.forEach(key => {
      if (key.startsWith('cache_products_') || 
          key.startsWith('cache_product_') || 
          key.startsWith('cache_hot_products_') ||
          key.startsWith('cache_recommended_products_') ||
          key === 'cache_product_categories') {
        setStorage(key, null);
      }
    });
    console.log('产品缓存已清除');
  } catch (error) {
    console.error('清除产品缓存失败:', error);
  }
};

/**
 * 检查产品是否收藏
 * @param {string|number} productId - 产品ID
 * @returns {Promise<boolean>} - 返回是否收藏
 */
const checkFavoriteStatus = async (productId) => {
  try {
    const result = await api.get(`/api/products/${productId}/favorite`);
    return result.data.isFavorite || false;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
};

/**
 * 添加/移除产品收藏
 * @param {string|number} productId - 产品ID
 * @param {boolean} isFavorite - 是否收藏
 * @returns {Promise<boolean>} - 返回操作结果
 */
const toggleFavorite = async (productId, isFavorite) => {
  try {
    const action = isFavorite ? 'add' : 'remove';
    const result = await api.post(`/api/products/${productId}/favorite`, {
      action
    });
    
    if (result.data.success) {
      showToast(isFavorite ? '收藏成功' : '取消收藏成功', { icon: 'success' });
      return true;
    } else {
      throw new Error(result.data.message || '操作失败');
    }
  } catch (error) {
    console.error('操作收藏失败:', error);
    showToast(error.message || '操作失败');
    return false;
  }
};

// 导出所有函数
module.exports = {
  getProductList,
  getProductDetail,
  getRelatedProducts,
  searchProducts,
  getHotProducts,
  getRecommendedProducts,
  getProductCategories,
  clearProductCache,
  checkFavoriteStatus,
  toggleFavorite
};