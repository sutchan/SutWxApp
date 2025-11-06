// article-service.js - 文章相关服务模块
// 处理文章列表、文章详情等功能的API调用

import { api } from './api';
import { showToast, getStorage, setStorage } from './global';
import cache, { CACHE_DURATION, CACHE_KEYS } from './cache';
import validator from './validator';
import { throttle } from './utils';

// 缓存键常量
const ARTICLE_LIST_KEY_PREFIX = CACHE_KEYS.ARTICLE_LIST || 'cache_articles';
const ARTICLE_DETAIL_KEY_PREFIX = CACHE_KEYS.ARTICLE_DETAIL || 'cache_article';
const HOT_ARTICLES_KEY = CACHE_KEYS.HOT_ARTICLES || 'cache_hot_articles';
const CATEGORIES_KEY = CACHE_KEYS.ARTICLE_CATEGORIES || 'cache_article_categories';

// 缓存配置
const ARTICLE_CACHE_CONFIG = {
  ARTICLES: CACHE_DURATION.SHORT || 5 * 60 * 1000, // 5分钟
  ARTICLE_DETAIL: CACHE_DURATION.MEDIUM || 10 * 60 * 1000, // 10分钟
  HOT_ARTICLES: CACHE_DURATION.MEDIUM || 15 * 60 * 1000, // 15分钟
  CATEGORIES: CACHE_DURATION.LONG || 30 * 60 * 1000 // 30分钟
};

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {number} params.category - 分类ID，可选
 * @param {string} params.orderby - 排序字段，默认'date'
 * @param {string} params.order - 排序方向，默认'desc'
 * @param {boolean} params.ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 返回文章列表
 */
export const getArticles = async (params = {}) => {
  try {
    // 构建默认参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      category: params.category || '',
      orderby: params.orderby || 'date',
      order: params.order || 'desc'
    };
    
    // 参数验证
    if (validator && validator.isValidPagination) {
      if (!validator.isValidPagination(queryParams.page, queryParams.per_page)) {
        throw new Error('分页参数无效');
      }
    }
    
    // 生成缓存键
    const cacheKey = `${ARTICLE_LIST_KEY_PREFIX}_${JSON.stringify(queryParams)}`;
    
    // 尝试从缓存获取数据
    if (!params.ignoreCache) {
      // 优先使用cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('从缓存获取文章列表');
          return cachedData;
        }
      } 
      // 降级使用全局存储（仅第一页和非分类页）
      else if (queryParams.page === 1 && !queryParams.category) {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.ARTICLES)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const articles = await api.get('/posts', queryParams, {
      abortKey: `article_list_${queryParams.category || 'all'}_${queryParams.page}`,
      useCache: !params.ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.ARTICLES
    });
    
    // API模块已处理缓存，无需在此重复处理
    
    return articles;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    
    // 尝试使用缓存数据（仅第一页）
    if (params.page === 1 && !params.ignoreCache) {
      const cacheKey = `${ARTICLE_LIST_KEY_PREFIX}_${JSON.stringify({ page: 1, per_page: params.per_page || 10, category: '', orderby: 'date', order: 'desc' })}`;
      
      // 优先使用cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的文章列表数据');
          return cachedData;
        }
      }
      // 降级使用全局存储
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('使用缓存的文章列表数据');
          return cachedData.data;
        }
      }
    }
    
    throw error;
  }
};

/**
 * 获取文章分类列表
 * @param {boolean} [ignoreCache] - 是否忽略缓存，默认false
 * @returns {Promise<Array>} 分类列表
 */
export const getCategories = async (ignoreCache = false) => {
  try {
    const cacheKey = CATEGORIES_KEY;
    
    // 如果不忽略缓存且缓存存在，则返回缓存数据
    if (!ignoreCache) {
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
          console.log('从缓存获取文章分类');
          return cachedData;
        }
      } else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API获取分类列表
    const response = await api.get('/categories', {}, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.CATEGORIES,
      abortKey: 'article_categories'
    });
    const categories = response.data || response;
    
    // 验证返回数据
    if (!Array.isArray(categories)) {
      throw new Error('获取文章分类失败：返回数据无效');
    }
    
    // API模块已处理缓存，无需在此重复处理
    
    return categories;
  } catch (error) {
    console.error('获取文章分类失败:', error);
    throw new Error(error.message || '获取文章分类失败');
  }
};

/**
 * 清除文章相关缓存
 * @returns {Promise<void>}
 */
export const clearArticleCache = async () => {
  try {
    if (cache && cache.clear) {
      // 使用cache.js清除缓存
      await cache.clear([ARTICLE_LIST_KEY_PREFIX, ARTICLE_DETAIL_KEY_PREFIX, HOT_ARTICLES_KEY, CATEGORIES_KEY]);
    } else {
      // 降级清除全局存储中的缓存
      const keys = wx.getStorageInfoSync().keys;
      const articleCacheKeys = keys.filter(key => 
        key.startsWith('cache_articles_') || 
        key.startsWith('cache_article_') || 
        key.startsWith('cache_hot_articles') || 
        key === 'cache_article_categories'
      );
      
      articleCacheKeys.forEach(key => {
        wx.removeStorageSync(key);
      });
    }
    console.log('文章缓存已清除');
  } catch (error) {
    console.error('清除文章缓存失败:', error);
    throw new Error('清除文章缓存失败');
  }
};

/**
 * 获取文章详情
 * @param {number|string} id - 文章ID
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Object>} - 返回文章详情
 */
export const getArticleDetail = async (id, ignoreCache = false) => {
  try {
    // 参数验证
    if (validator && validator.isValidArticleId) {
      if (!validator.isValidArticleId(id)) {
        throw new Error('文章ID无效');
      }
    }
    
    const cacheKey = `${ARTICLE_DETAIL_KEY_PREFIX}_${id}`;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      // 优先使用cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('从缓存获取文章详情');
          return cachedData;
        }
      }
      // 降级使用全局存储
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.ARTICLE_DETAIL)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const article = await api.get(`/posts/${id}`, {}, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.ARTICLE_DETAIL,
      abortKey: `article_detail_${id}`
    });
    
    // API模块已处理缓存，无需在此重复处理
    
    return article;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    
    // 尝试使用缓存数据
    if (!ignoreCache) {
      const cacheKey = `${ARTICLE_DETAIL_KEY_PREFIX}_${id}`;
      
      // 优先使用cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的文章详情数据');
          return cachedData;
        }
      }
      // 降级使用全局存储
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('使用缓存的文章详情数据');
          return cachedData.data;
        }
      }
    }
    
    throw error;
  }
};

/**
 * 获取热门文章
 * @param {number} limit - 获取数量，默认10
 * @param {boolean} ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 返回热门文章列表
 */
export const getHotArticles = async (limit = 10, ignoreCache = false) => {
  try {
    // 参数验证
    if (validator && validator.isValidQuantity) {
      if (!validator.isValidQuantity(limit, { min: 1, max: 50 })) {
        throw new Error('数量参数无效');
      }
    }
    
    const cacheKey = `${HOT_ARTICLES_KEY}_${limit}`;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      // 优先使用cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
          console.log('从缓存获取热门文章');
          return cachedData;
        }
      }
      // 降级使用全局存储
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.HOT_ARTICLES)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const articles = await api.get('/posts/hot', { limit }, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.HOT_ARTICLES,
      abortKey: `hot_articles_${limit}`
    });
    
    // API模块已处理缓存，无需在此重复处理
    
    return articles;
  } catch (error) {
    console.error('获取热门文章失败:', error);
    
    // 尝试使用缓存数据
    if (!ignoreCache) {
      const cacheKey = `${HOT_ARTICLES_KEY}_${limit}`;
      
      // 优先使用cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的热门文章数据');
          return cachedData;
        }
      }
      // 降级使用全局存储
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('使用缓存的热门文章数据');
          return cachedData.data;
        }
      }
    }
    
    throw error;
  }
};

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @returns {Promise<Array>} - 返回搜索结果
 */
export const searchArticles = async (keyword, params = {}) => {
  try {
    // 参数验证
    if (!keyword || keyword.trim() === '') {
      throw new Error('搜索关键词不能为空');
    }
    
    // 使用validator进行关键词验证
    if (validator && validator.isValidString) {
      if (!validator.isValidString(keyword.trim())) {
        throw new Error('搜索关键词无效');
      }
    }
    
    // 构建搜索参数
    const searchParams = {
      keyword: keyword.trim(),
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 调用API
    const results = await api.get('/posts/search', searchParams, {
      abortKey: `article_search_${encodeURIComponent(keyword)}_${searchParams.page}`
    });
    
    return results;
  } catch (error) {
    console.error('搜索文章失败:', error);
    throw error;
  }
};

/**
 * 取消点赞文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} - 返回操作结果
 */
export const unlikeArticle = async (postId) => {
  try {
    // 参数验证
    if (validator && validator.isValidArticleId) {
      if (!validator.isValidArticleId(postId)) {
        throw new Error('文章ID无效');
      }
    }
    
    // 调用API
    const result = await api.delete(`/posts/${postId}/like`, {}, {
      abortKey: `unlike_article_${postId}`
    });
    
    // 清除相关缓存
    api.clearCache(`/posts/${postId}`);
    
    return result;
  } catch (error) {
    console.error('取消点赞文章失败:', error);
    throw new Error(error.message || '取消点赞文章失败');
  }
};

/**
 * 获取文章评论
 * @param {number|string} postId - 文章ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @returns {Promise<Array>} - 返回评论列表
 */
export const getArticleComments = async (postId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    return await api.get(`/posts/${postId}/comments`, queryParams, {
    abortKey: `article_comments_${postId}_${queryParams.page}`
  });
  } catch (error) {
    console.error('获取文章评论失败:', error);
    throw error;
  }
};

/**
 * 发表文章评论
 * @param {number|string} postId - 文章ID
 * @param {string} content - 评论内容
 * @param {number} parentId - 父评论ID，用于回复，可选
 * @returns {Promise<Object>} - 返回评论结果
 */
export const submitComment = async (postId, content, parentId = 0) => {
  try {
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }
    
    const data = {
      post_id: postId,
      content: content.trim(),
      parent_id: parentId
    };
    
    const result = await api.post('/comments', data, {
      abortKey: `submit_comment_${postId}`
    });
    showToast('评论成功', { icon: 'success' });
    
    return result;
  } catch (error) {
    console.error('发表评论失败:', error);
    throw error;
  }
};

/**
 * 点赞文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} - 返回点赞结果
 */
export const likeArticle = async (postId) => {
  try {
    const result = await api.post(`/posts/${postId}/like`, {}, {
      abortKey: `like_article_${postId}`
    });
    return result;
  } catch (error) {
    console.error('点赞文章失败:', error);
    throw error;
  }
};

/**
 * 收藏文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} - 返回收藏结果
 */
export const favoriteArticle = async (postId) => {
  try {
    const result = await api.post(`/posts/${postId}/favorite`, {}, {
      abortKey: `favorite_article_${postId}`
    });
    showToast('收藏成功', { icon: 'success' });
    return result;
  } catch (error) {
    console.error('收藏文章失败:', error);
    throw error;
  }
};

/**
 * 取消收藏文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} - 返回取消收藏结果
 */
export const unfavoriteArticle = async (postId) => {
  try {
    const result = await api.delete(`/posts/${postId}/favorite`, {}, {
      abortKey: `unfavorite_article_${postId}`
    });
    showToast('已取消收藏', { icon: 'success' });
    return result;
  } catch (error) {
    console.error('取消收藏失败:', error);
    throw error;
  }
};

/**
 * 检查文章是否已收藏
 * @param {number|string} postId - 文章ID
 * @returns {Promise<boolean>} - 是否已收藏
 */
export const checkFavoriteStatus = async (postId) => {
  try {
    const result = await api.get(`/posts/${postId}/favorite/status`, {}, {
      abortKey: `check_favorite_${postId}`,
      useCache: true,
      cacheDuration: CACHE_DURATION.SHORT
    });
    return result.is_favorited || false;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
};

/**
 * 增加文章阅读量
 * @param {number|string} postId - 文章ID
 */
// 使用节流函数防止短时间内重复增加阅读量
export const increaseViewCount = throttle(async (postId) => {
  try {
    // 使用API模块发送请求
    await api.post(`/posts/${postId}/view`, {}, {
      abortKey: `increase_view_${postId}`,
      // 即使请求失败也不抛出异常，避免影响用户体验
      silent: true
    });
  } catch (error) {
    // 忽略增加阅读量失败的错误
    console.error('增加阅读量失败:', error);
  }
}, 5000); // 5秒内只执行一次

// 导出所有方法
export default {
  getArticles,
  getArticleDetail,
  getHotArticles,
  searchArticles,
  getArticleComments,
  submitComment,
  likeArticle,
  unlikeArticle,
  favoriteArticle,
  unfavoriteArticle,
  checkFavoriteStatus,
  increaseViewCount,
  getCategories,
  clearArticleCache
};