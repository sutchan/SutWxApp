/**
 * 分类服务
 * 提供分类相关的API调用和缓存管理功能
 */

const api = require('./api');
const { getStorage, setStorage } = require('./global');

// 缓存时长配置
const CACHE_DURATION = {
  CATEGORIES: 30 * 60 * 1000, // 30分钟缓存
  CATEGORY_ARTICLES: 5 * 60 * 1000 // 5分钟缓存
};

/**
 * 获取分类列表
 * @param {boolean} ignoreCache - 是否忽略缓存，默认为false
 * @param {Object} params - 请求参数
 * @param {boolean} params.hide_empty - 是否隐藏空分类，默认为true
 * @returns {Promise<Array>} - 返回分类列表
 */
const getCategories = async (ignoreCache = false, params = {}) => {
  try {
    const cacheKey = 'cache_categories';
    
    // 检查缓存
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 准备请求参数
    const queryParams = {
      hide_empty: params.hide_empty !== undefined ? params.hide_empty : true
    };
    
    // 调用API
    const categories = await api.get('/api/categories', queryParams);
    
    // 更新缓存
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
        console.log('使用缓存数据返回分类列表');
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
const getCategoryDetail = async (id) => {
  try {
    return await api.get(`/api/categories/${id}`);
  } catch (error) {
    console.error('获取分类详情失败:', error);
    throw error;
  }
};

/**
 * 获取分类下的文章列表
 * @param {number|string} categoryId - 分类ID
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @param {string} params.orderby - 排序字段，默认为'date'
 * @param {string} params.order - 排序方向，默认为'desc'
 * @param {boolean} params.ignoreCache - 是否忽略缓存，默认为false
 * @returns {Promise<Array>} - 返回文章列表
 */
const getCategoryArticles = async (categoryId, params = {}) => {
  try {
    // 准备请求参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'date',
      order: params.order || 'desc'
    };
    
    // 缓存键名
    const cacheKey = `cache_category_articles_${categoryId}_${JSON.stringify(queryParams)}`;
    
    // 首页数据尝试从缓存获取
    if (!params.ignoreCache && queryParams.page === 1) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORY_ARTICLES)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const articles = await api.get(`/api/categories/${categoryId}/posts`, queryParams);
    
    // 缓存首页数据
    if (queryParams.page === 1) {
      setStorage(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });
    }
    
    return articles;
  } catch (error) {
    console.error('获取分类文章失败:', error);
    
    // 尝试使用缓存
    if (!params.ignoreCache && params.page === 1) {
      const cacheKey = `cache_category_articles_${categoryId}_${JSON.stringify({ page: 1, per_page: params.per_page || 10, orderby: 'date', order: 'desc' })}`;
      const cachedData = getStorage(cacheKey);
      if (cachedData) {
        console.log('使用缓存数据返回分类文章列表');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取子分类
 * @param {number|string} parentId - 父分类ID
 * @param {boolean} ignoreCache - 是否忽略缓存，默认为false
 * @returns {Promise<Array>} - 返回子分类列表
 */
const getSubCategories = async (parentId, ignoreCache = false) => {
  try {
    // 复用getCategories方法获取所有分类，然后过滤出子分类
    const allCategories = await getCategories(ignoreCache);
    return allCategories.filter(category => category.parent === parentId);
  } catch (error) {
    console.error('获取子分类失败:', error);
    throw error;
  }
};

/**
 * 获取分类树结构
 * @param {boolean} ignoreCache - 是否忽略缓存，默认为false
 * @returns {Promise<Array>} - 返回分类树
 */
const getCategoryTree = async (ignoreCache = false) => {
  try {
    const cacheKey = 'cache_category_tree';
    
    // 检查缓存
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 获取所有分类
    const allCategories = await getCategories(ignoreCache);
    
    // 构建分类树
    const categoryMap = {};
    const rootCategories = [];
    
    // 首先将所有分类存入map中
    allCategories.forEach(category => {
      category.children = [];
      categoryMap[category.id] = category;
    });
    
    // 构建树结构
    allCategories.forEach(category => {
      if (category.parent === 0) {
        rootCategories.push(category);
      } else if (categoryMap[category.parent]) {
        categoryMap[category.parent].children.push(category);
      }
    });
    
    // 更新缓存
    setStorage(cacheKey, {
      data: rootCategories,
      timestamp: Date.now()
    });
    
    return rootCategories;
  } catch (error) {
    console.error('获取分类树失败:', error);
    
    // 尝试使用缓存
    if (!ignoreCache) {
      const cachedData = getStorage('cache_category_tree');
      if (cachedData) {
        console.log('使用缓存数据返回分类树');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取热门分类
 * @param {number} limit - 返回数量限制，默认为10
 * @param {boolean} ignoreCache - 是否忽略缓存，默认为false
 * @returns {Promise<Array>} - 返回热门分类列表
 */
const getHotCategories = async (limit = 10, ignoreCache = false) => {
  try {
    const cacheKey = `cache_hot_categories_${limit}`;
    
    // 检查缓存
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const categories = await api.get('/api/categories/hot', { limit });
    
    // 更新缓存
    setStorage(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });
    
    return categories;
  } catch (error) {
    console.error('获取热门分类失败:', error);
    
    // 尝试使用缓存
    if (!ignoreCache) {
      const cachedData = getStorage(`cache_hot_categories_${limit}`);
      if (cachedData) {
        console.log('使用缓存数据返回热门分类');
        return cachedData.data;
      }
    }
    
    // 如果API调用失败且没有缓存，尝试从所有分类中获取前N个
    try {
      const allCategories = await getCategories(ignoreCache);
      return allCategories.slice(0, limit);
    } catch (e) {
      throw error;
    }
  }
};

/**
 * 获取标签列表
 * @param {boolean} ignoreCache - 是否忽略缓存，默认为false
 * @param {Object} params - 请求参数
 * @param {number} params.limit - 返回数量限制，默认为50
 * @returns {Promise<Array>} - 返回标签列表
 */
const getTags = async (ignoreCache = false, params = {}) => {
  try {
    const cacheKey = 'cache_tags';
    
    // 检查缓存
    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 调用API
    const tags = await api.get('/api/tags', {
      limit: params.limit || 50
    });
    
    // 更新缓存
    setStorage(cacheKey, {
      data: tags,
      timestamp: Date.now()
    });
    
    return tags;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    
    // 尝试使用缓存
    if (!ignoreCache) {
      const cachedData = getStorage('cache_tags');
      if (cachedData) {
        console.log('使用缓存数据返回标签列表');
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 获取标签下的文章列表
 * @param {number|string} tagId - 标签ID
 * @param {Object} params - 请求参数
 * @returns {Promise<Array>} - 返回文章列表
 */
const getTagArticles = async (tagId, params = {}) => {
  try {
    // 复用分类文章的查询逻辑
    return await getCategoryArticles(tagId, { ...params, endpoint: 'tags' });
  } catch (error) {
    console.error('获取标签文章失败:', error);
    throw error;
  }
};

// 导出模块
module.exports = {
  getCategories,
  getCategoryDetail,
  getCategoryArticles,
  getSubCategories,
  getCategoryTree,
  getHotCategories,
  getTags,
  getTagArticles
};
