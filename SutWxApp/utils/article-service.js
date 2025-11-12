/**
 * article-service.js - 文章服务模块
 * 提供文章相关的数据获取和操作功能
 */
const { api } = require('./api');
const { showToast, getStorage, setStorage } = require('./global');
const cache = require('./cache');
const CACHE_DURATION = cache.CACHE_DURATION;
const CACHE_KEYS = cache.CACHE_KEYS;
const validator = require('./validator');
const { throttle } = require('./utils');

// 缓存键名前缀
const ARTICLE_LIST_KEY_PREFIX = CACHE_KEYS.ARTICLE_LIST || 'cache_articles';
const ARTICLE_DETAIL_KEY_PREFIX = CACHE_KEYS.ARTICLE_DETAIL || 'cache_article';
const HOT_ARTICLES_KEY = CACHE_KEYS.HOT_ARTICLES || 'cache_hot_articles';
const CATEGORIES_KEY = CACHE_KEYS.ARTICLE_CATEGORIES || 'cache_article_categories';

// 缓存配置
const ARTICLE_CACHE_CONFIG = {
  ARTICLES: CACHE_DURATION.SHORT || 5 * 60 * 1000, // 5分钟缓存
  ARTICLE_DETAIL: CACHE_DURATION.MEDIUM || 10 * 60 * 1000, // 10分钟缓存
  HOT_ARTICLES: CACHE_DURATION.MEDIUM || 15 * 60 * 1000, // 15分钟缓存
  CATEGORIES: CACHE_DURATION.LONG || 30 * 60 * 1000 // 30分钟缓存
};

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.per_page - 每页数量，默认10
 * @param {number} params.category - 分类ID
 * @param {string} params.orderby - 排序字段，默认'date'
 * @param {string} params.order - 排序方向，默认'desc'
 * @param {boolean} params.ignoreCache - 是否忽略缓存，默认false
 * @returns {Promise<Array>} - 文章列表数据
 */
const getArticles = async (params = {}) => {
  try {
    // 构建查询参数
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
        throw new Error('分页参数错误');
      }
    }
    
    // 生成缓存键
    const cacheKey = `${ARTICLE_LIST_KEY_PREFIX}_${JSON.stringify(queryParams)}`;
    
    // 尝试从缓存获取数据
    if (!params.ignoreCache) {
      // 优先从cache.js获取
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('从缓存获取文章列表数据');
          return cachedData;
        }
      } 
      // 降级从global存储获取
      else if (queryParams.page === 1 && !queryParams.category) {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.ARTICLES)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const articles = await api.get('/api/posts', queryParams, {
      abortKey: `article_list_${queryParams.category || 'all'}_${queryParams.page}`,
      useCache: !params.ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.ARTICLES
    });
    
    // API调用成功，返回数据
    return articles;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    
    // 尝试从缓存获取默认列表作为降级方案
    if (params.page === 1 && !params.ignoreCache) {
      const cacheKey = `${ARTICLE_LIST_KEY_PREFIX}_${JSON.stringify({ page: 1, per_page: params.per_page || 10, category: '', orderby: 'date', order: 'desc' })}`;
      
      // 优先从cache.js获取
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('降级从缓存获取文章列表');
          return cachedData;
        }
      }
      // 降级从global存储获取
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('降级从缓存获取文章列表');
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
const getCategories = async (ignoreCache = false) => {
  try {
    const cacheKey = CATEGORIES_KEY;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      // 优先从cache.js获取
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      // 降级从global存储获取
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const response = await api.get('/api/categories', {}, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.CATEGORIES
    });
    const categories = response.data || response;
    
    // 数据验证
    if (!Array.isArray(categories)) {
      throw new Error('获取文章分类失败，返回数据格式错误');
    }
    
    return categories;
  } catch (error) {
    console.error('获取文章分类失败:', error);
    throw new Error(error.message || '获取文章分类失败');
  }
};

/**
 * 清除文章相关缓存
 */
const clearArticleCache = async () => {
  try {
    // 清除cache.js中的缓存
    if (cache && cache.clear) {
      // 清除文章列表缓存
      const keys = await cache.keys();
      const articleKeys = keys.filter(key => 
        key.startsWith(ARTICLE_LIST_KEY_PREFIX) ||
        key.startsWith(ARTICLE_DETAIL_KEY_PREFIX) ||
        key.startsWith(HOT_ARTICLES_KEY) ||
        key.startsWith(CATEGORIES_KEY)
      );
      
      await Promise.all(articleKeys.map(key => cache.delete(key)));
    }
    
    // 清除global存储中的缓存
    const globalKeys = Object.keys(getStorage());
    const articleGlobalKeys = globalKeys.filter(key => 
      key.startsWith(ARTICLE_LIST_KEY_PREFIX) ||
      key.startsWith(ARTICLE_DETAIL_KEY_PREFIX) ||
      key.startsWith(HOT_ARTICLES_KEY) ||
      key.startsWith(CATEGORIES_KEY)
    );
    
    articleGlobalKeys.forEach(key => {
      wx.removeStorageSync(key);
    });
    
  } catch (error) {
    console.error('清除文章缓存失败:', error);
  }
};

/**
 * 获取文章详情
 * @param {number|string} id - 文章ID
 * @param {boolean} [ignoreCache] - 是否忽略缓存，默认false
 * @returns {Promise<Object>} 文章详情数据
 */
const getArticleDetail = async (id, ignoreCache = false) => {
  try {
    // 参数验证
    if (!id) {
      throw new Error('文章ID不能为空');
    }
    
    const cacheKey = `${ARTICLE_DETAIL_KEY_PREFIX}_${id}`;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      // 优先从cache.js获取
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('从缓存获取文章详情');
          return cachedData;
        }
      }
      // 降级从global存储获取
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.ARTICLE_DETAIL)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const response = await api.get(`/api/posts/${id}`, {}, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.ARTICLE_DETAIL
    });
    const article = response.data || response;
    
    // 数据验证
    if (!article || !article.id) {
      throw new Error('获取文章详情失败，返回数据格式错误');
    }
    
    return article;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
};

/**
 * 获取热门文章
 * @param {number} limit - 数量限制，默认10
 * @param {boolean} [ignoreCache] - 是否忽略缓存，默认false
 * @returns {Promise<Array>} 热门文章列表
 */
const getHotArticles = async (limit = 10, ignoreCache = false) => {
  try {
    const cacheKey = `${HOT_ARTICLES_KEY}_${limit}`;
    
    // 尝试从缓存获取数据
    if (!ignoreCache) {
      // 优先从cache.js获取
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      // 降级从global存储获取
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.HOT_ARTICLES)) {
          return cachedData.data;
        }
      }
    }
    
    // 调用API
    const response = await api.get('/api/posts/hot', { limit }, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.HOT_ARTICLES
    });
    const articles = response.data || response;
    
    // 数据验证
    if (!Array.isArray(articles)) {
      throw new Error('获取热门文章失败，返回数据格式错误');
    }
    
    return articles;
  } catch (error) {
    console.error('获取热门文章失败:', error);
    throw error;
  }
};

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 查询参数
 * @returns {Promise<Array>} 搜索结果
 */
const searchArticles = async (keyword, params = {}) => {
  try {
    // 参数验证
    if (!keyword || keyword.trim() === '') {
      throw new Error('搜索关键词不能为空');
    }
    
    // 构建查询参数
    const queryParams = {
      keyword: keyword.trim(),
      page: params.page || 1,
      per_page: params.per_page || 10,
      ...params
    };
    
    // 调用API
    const response = await api.get('/api/posts/search', queryParams);
    
    return response.data || response;
  } catch (error) {
    console.error('搜索文章失败:', error);
    throw error;
  }
};

/**
 * 取消点赞文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} 操作结果
 */
const unlikeArticle = async (postId) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    
    // 调用API
    const response = await api.delete(`/api/posts/${postId}/like`);
    
    return response;
  } catch (error) {
    console.error('取消点赞失败:', error);
    throw error;
  }
};

/**
 * 获取文章评论
 * @param {number|string} postId - 文章ID
 * @param {Object} params - 查询参数
 * @returns {Promise<Array>} 评论列表
 */
const getArticleComments = async (postId, params = {}) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 20,
      ...params
    };
    
    // 调用API
    const response = await api.get(`/api/posts/${postId}/comments`, queryParams);
    
    return response.data || response;
  } catch (error) {
    console.error('获取文章评论失败:', error);
    throw error;
  }
};

/**
 * 提交评论
 * @param {number|string} postId - 文章ID
 * @param {string} content - 评论内容
 * @param {number|string} parentId - 父评论ID，默认为0（顶级评论）
 * @returns {Promise<Object>} 评论结果
 */
const submitComment = async (postId, content, parentId = 0) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }
    
    // 调用API
    const response = await api.post(`/api/posts/${postId}/comments`, {
      content: content.trim(),
      parent_id: parentId
    });
    
    // 成功提示
    if (response.code === 200 || response.success) {
      showToast('评论成功', 'success');
    }
    
    return response;
  } catch (error) {
    console.error('提交评论失败:', error);
    showToast(error.message || '评论失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 点赞文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} 操作结果
 */
const likeArticle = async (postId) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    
    // 调用API
    const response = await api.post(`/api/posts/${postId}/like`);
    
    // 成功提示
    if (response.code === 200 || response.success) {
      showToast('点赞成功', 'success');
    }
    
    return response;
  } catch (error) {
    console.error('点赞失败:', error);
    showToast(error.message || '点赞失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 收藏文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} 操作结果
 */
const favoriteArticle = async (postId) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    
    // 调用API
    const response = await api.post(`/api/posts/${postId}/favorite`);
    
    // 成功提示
    if (response.code === 200 || response.success) {
      showToast('收藏成功', 'success');
    }
    
    return response;
  } catch (error) {
    console.error('收藏失败:', error);
    showToast(error.message || '收藏失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 取消收藏文章
 * @param {number|string} postId - 文章ID
 * @returns {Promise<Object>} 操作结果
 */
const unfavoriteArticle = async (postId) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    
    // 调用API
    const response = await api.delete(`/api/posts/${postId}/favorite`);
    
    // 成功提示
    if (response.code === 200 || response.success) {
      showToast('已取消收藏', 'success');
    }
    
    return response;
  } catch (error) {
    console.error('取消收藏失败:', error);
    showToast(error.message || '操作失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 检查文章收藏状态
 * @param {number|string} postId - 文章ID
 * @returns {Promise<boolean>} 是否已收藏
 */
const checkFavoriteStatus = async (postId) => {
  try {
    // 参数验证
    if (!postId) {
      throw new Error('文章ID不能为空');
    }
    
    // 调用API
    const response = await api.get(`/api/posts/${postId}/favorite/status`);
    
    return response.favorite || false;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
};

/**
 * 增加文章浏览量（节流处理，5秒内只执行一次）
 * @param {number|string} postId - 文章ID
 */
const increaseViewCount = throttle(async (postId) => {
  try {
    if (!postId) return;
    
    // 调用API
    await api.post(`/api/posts/${postId}/view`);
  } catch (error) {
    // 浏览量统计失败不影响用户体验，静默处理错误
    console.error('增加浏览量失败:', error);
  }
}, 5000); // 5秒内重复调用只执行一次

// 导出所有函数
module.exports = {
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