// product-service.js - 产品相关服务模块
// 处理产品列表、产品详情等功能的API调用

import api from './api';
import { showToast, getStorage, setStorage } from './global';

// 缓存配置
const CACHE_DURATION = {
  PRODUCTS: 5 * 60 * 1000, // 5分钟
  PRODUCT_DETAIL: 10 * 60 * 1000 // 10分钟
};

/**
 * 获取产品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {number} params.category_id - 分类ID，可选
 * @param {string} params.keyword - 搜索关键词，可选
 * @param {string} params.sort - 排序方式，默认'latest'
 * @param {boolean} params.ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Object>} - 返回产品列表和分页信息
 */
export const getProductList = async (params = {}) => {
  try {
    // 构建默认参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      category_id: params.category_id || '',
      keyword: params.keyword || '',
      sort: params.sort || 'latest',
      ...params.filters
    };
    
    // 生成缓存键（仅第一页和非分类非搜索页使用缓存）
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
    const result = await api.get('/products', queryParams);
    
    // 缓存第一页数据
    if (cacheKey) {
      setStorage(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error('获取产品列表失败:', error);
    
    // 尝试使用缓存数据（仅首页）
    if (params.page === 1 && !params.category_id && !params.keyword) {
      const cacheKey = `cache_products_${params.sort || 'latest'}`;
      const cachedData = getStorage(cacheKey);
      if (cachedData) {
        console.log('使用缓存的产品列表数据');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取产品详情
 * @param {number|string} id - 产品ID
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Object>} - 返回产品详情
 */
export const getProductDetail = async (id, ignoreCache = false) => {
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
    const product = await api.get(`/products/${id}`);
    
    // 缓存数据
    setStorage(cacheKey, {
      data: product,
      timestamp: Date.now()
    });
    
    return product;
  } catch (error) {
    console.error('获取产品详情失败:', error);
    
    // 尝试使用缓存数据
    if (!ignoreCache) {
      const cachedData = getStorage(`cache_product_${id}`);
      if (cachedData) {
        console.log('使用缓存的产品详情数据');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取相关产品
 * @param {Object} params - 查询参数
 * @param {number} params.product_id - 产品ID
 * @param {number} params.limit - 返回数量，默认6
 * @returns {Promise<Object>} - 返回相关产品列表
 */
export const getRelatedProducts = async (params = {}) => {
  try {
    const queryParams = {
      product_id: params.product_id,
      limit: params.limit || 6
    };
    
    return await api.get('/products/related', queryParams);
  } catch (error) {
    console.error('获取相关产品失败:', error);
    return { products: [] };
  }
};

/**
 * 搜索产品
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 其他查询参数
 * @returns {Promise<Object>} - 返回搜索结果
 */
export const searchProducts = async (keyword, params = {}) => {
  return getProductList({
    ...params,
    keyword,
    page: params.page || 1,
    per_page: params.per_page || 10
  });
};

/**
 * 获取热门产品
 * @param {number} limit - 返回数量，默认10
 * @returns {Promise<Array>} - 返回热门产品列表
 */
export const getHotProducts = async (limit = 10) => {
  try {
    const cacheKey = `cache_hot_products_${limit}`;
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCTS)) {
      return cachedData.data;
    }
    
    const result = await api.get('/products/hot', { limit });
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result.products || [],
      timestamp: Date.now()
    });
    
    return result.products || [];
  } catch (error) {
    console.error('获取热门产品失败:', error);
    return [];
  }
};

/**
 * 获取产品库存信息
 * @param {number|string} productId - 产品ID
 * @param {number|string} skuId - SKU ID（可选）
 * @returns {Promise<Object>} - 返回库存信息
 */
export const getProductStock = async (productId, skuId = '') => {
  try {
    return await api.get('/products/stock', {
      product_id: productId,
      sku_id: skuId
    });
  } catch (error) {
    console.error('获取产品库存失败:', error);
    throw error;
  }
};

/**
 * 获取产品评论
 * @param {number|string} productId - 产品ID
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 返回评论列表
 */
export const getProductComments = async (productId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      ...params
    };
    
    return await api.get(`/products/${productId}/comments`, queryParams);
  } catch (error) {
    console.error('获取产品评论失败:', error);
    return { comments: [], total: 0 };
  }
};

/**
 * 提交产品评论
 * @param {number|string} productId - 产品ID
 * @param {Object} data - 评论数据
 * @param {number} data.rating - 评分，1-5
 * @param {string} data.content - 评论内容
 * @param {string} data.images - 图片数组（可选）
 * @returns {Promise<Object>} - 返回提交结果
 */
export const submitProductComment = async (productId, data) => {
  try {
    return await api.post(`/products/${productId}/comments`, data);
  } catch (error) {
    console.error('提交产品评论失败:', error);
    showToast('评论提交失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 收藏产品
 * @param {number|string} productId - 产品ID
 * @returns {Promise<Object>} - 返回收藏结果
 */
export const favoriteProduct = async (productId) => {
  try {
    return await api.post('/products/favorite', { product_id: productId });
  } catch (error) {
    console.error('收藏产品失败:', error);
    showToast('收藏失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 取消收藏产品
 * @param {number|string} productId - 产品ID
 * @returns {Promise<Object>} - 返回取消收藏结果
 */
export const unfavoriteProduct = async (productId) => {
  try {
    return await api.post('/products/unfavorite', { product_id: productId });
  } catch (error) {
    console.error('取消收藏产品失败:', error);
    showToast('取消收藏失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 检查产品收藏状态
 * @param {number|string} productId - 产品ID
 * @returns {Promise<boolean>} - 是否已收藏
 */
export const checkFavoriteStatus = async (productId) => {
  try {
    const result = await api.get('/products/favorite/check', { product_id: productId });
    return result.is_favorite || false;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
};

// 导出所有方法
export default {
  getProductList,
  getProductDetail,
  getRelatedProducts,
  searchProducts,
  getHotProducts,
  getProductStock,
  getProductComments,
  submitProductComment,
  favoriteProduct,
  unfavoriteProduct,
  checkFavoriteStatus
};