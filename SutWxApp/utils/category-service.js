// category-service.js - 分类相关服务模块
// 处理分类列表和分类下的文章等功能

import api from './api';
import { getStorage, setStorage } from './global';

// 缓存配置
const CACHE_DURATION = {
  CATEGORIES: 30 * 60 * 1000, // 30分钟
  CATEGORY_ARTICLES: 5 * 60 * 1000 // 5分钟
};

/**
 * 获取分类列表
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @param {Object} params - 查询参数
 * @param {boolean} params.hide_empty - 是否隐藏空分类，默认true
 * @returns {Promise<Array>} - 返回分类列表
 */
export const getCategories = async (ignoreCache = false, params = {}) => {
  try {
    const cacheKey = 'cache_categories';
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 构建查询参数
    const queryParams = {
      hide_empty: params.hide_empty !== undefined ? params.hide_empty : true
    };
    
    // 调用API
    const categories = await api.get('/categories', queryParams);
    
    // 缓存数据
    setStorage(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });
    
    return categories;
  } catch (error) {
    console.error('获取分类列表失败:', error);
    
    // 尝试使用缓存数据
    if (!ignoreCache) {
      const cachedData = getStorage('cache_categories');
      if (cachedData) {
        console.log('使用缓存的分类数据');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取分类详情
 * @param {number|string} id - 分类ID
 * @returns {Promise<Object>} - 返回分类详情
 */
export const getCategoryDetail = async (id) => {
  try {
    return await api.get(`/categories/${id}`);
  } catch (error) {
    console.error('获取分类详情失败:', error);
    throw error;
  }
};

/**
 * 获取分类下的文章列表
 * @param {number|string} categoryId - 分类ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {string} params.orderby - 排序字段，默认'date'
 * @param {string} params.order - 排序方向，默认'desc'
 * @param {boolean} params.ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 返回文章列表
 */
export const getCategoryArticles = async (categoryId, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'date',
      order: params.order || 'desc'
    };
    
    // 生成缓存键
    const cacheKey = `cache_category_articles_${categoryId}_${JSON.stringify(queryParams)}`;
    
    // 尝试从缓存获取数据（仅第一页使用缓存）
    if (!params.ignoreCache && queryParams.page === 1) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORY_ARTICLES)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const articles = await api.get(`/categories/${categoryId}/posts`, queryParams);
    
    // 缓存第一页数据
    if (queryParams.page === 1) {
      setStorage(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });
    }
    
    return articles;
  } catch (error) {
    console.error('获取分类文章列表失败:', error);
    
    // 尝试使用缓存数据（仅第一页）
    if (!params.ignoreCache && params.page === 1) {
      const cacheKey = `cache_category_articles_${categoryId}_${JSON.stringify({ page: 1, per_page: params.per_page || 10, orderby: 'date', order: 'desc' })}`;
      const cachedData = getStorage(cacheKey);
      if (cachedData) {
        console.log('使用缓存的分类文章数据');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取分类的子分类
 * @param {number|string} parentId - 父分类ID
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 返回子分类列表
 */
export const getSubCategories = async (parentId, ignoreCache = false) => {
  try {
    // 先获取所有分类
    const allCategories = await getCategories(ignoreCache);
    
    // 过滤出子分类
    const subCategories = allCategories.filter(category => category.parent === parentId);
    
    return subCategories;
  } catch (error) {
    console.error('获取子分类失败:', error);
    throw error;
  }
};

/**
 * 获取分类树结构
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 返回分类树结构
 */
export const getCategoryTree = async (ignoreCache = false) => {
  try {
    // 获取所有分类
    const allCategories = await getCategories(ignoreCache);
    
    // 构建分类树
    const categoryMap = {};
    const rootCategories = [];
    
    // 先创建所有分类的映射
    allCategories.forEach(category => {
      categoryMap[category.id] = {
        ...category,
        children: []
      };
    });
    
    // 构建树结构
    allCategories.forEach(category => {
      if (category.parent === 0 || !categoryMap[category.parent]) {
        // 根分类
        rootCategories.push(categoryMap[category.id]);
      } else {
        // 子分类
        categoryMap[category.parent].children.push(categoryMap[category.id]);
      }
    });
    
    return rootCategories;
  } catch (error) {
    console.error('获取分类树失败:', error);
    throw error;
  }
};

/**
 * 获取热门分类
 * @param {number} limit - 获取数量，默认10
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 返回热门分类列表
 */
export const getHotCategories = async (limit = 10, ignoreCache = false) => {
  try {
    const cacheKey = `cache_hot_categories_${limit}`;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const categories = await api.get('/categories/hot', { limit });
    
    // 缓存数据
    setStorage(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });
    
    return categories;
  } catch (error) {
    console.error('获取热门分类失败:', error);
    
    // 如果API调用失败，尝试从所有分类中按文章数量排序获取
    if (!ignoreCache) {
      try {
        const allCategories = await getCategories(false);
        // 按文章数量排序
        const sortedCategories = allCategories
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, limit);
        
        return sortedCategories;
      } catch (innerError) {
        console.error('获取所有分类失败:', innerError);
      }
    }
    
    throw error;
  }
};

/**
 * 获取标签列表
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 获取数量，默认30
 * @returns {Promise<Array>} - 返回标签列表
 */
export const getTags = async (ignoreCache = false, params = {}) => {
  try {
    const cacheKey = 'cache_tags';
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 构建查询参数
    const queryParams = {
      limit: params.limit || 30
    };
    
    // 调用API
    const tags = await api.get('/tags', queryParams);
    
    // 缓存数据
    setStorage(cacheKey, {
      data: tags,
      timestamp: Date.now()
    });
    
    return tags;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    
    // 尝试使用缓存数据
    if (!ignoreCache) {
      const cachedData = getStorage('cache_tags');
      if (cachedData) {
        console.log('使用缓存的标签数据');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取标签下的文章列表
 * @param {number|string} tagId - 标签ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @returns {Promise<Array>} - 返回文章列表
 */
export const getTagArticles = async (tagId, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 调用API
    return await api.get(`/tags/${tagId}/posts`, queryParams);
  } catch (error) {
    console.error('获取标签文章列表失败:', error);
    throw error;
  }
};

// 导出所有方法
export default {
  getCategories,
  getCategoryDetail,
  getCategoryArticles,
  getSubCategories,
  getCategoryTree,
  getHotCategories,
  getTags,
  getTagArticles
};