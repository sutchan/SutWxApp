/**
 * 文件名: articleService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 文章服务层 - 提供文章相关的API接口调用
 */

const request = require('../utils/request');
const cache = require('../utils/cache-service');

/**
 * 缓存键前缀
 * @type {string}
 */
const CACHE_KEY_PREFIX = 'article_';

/**
 * 缓存过期时间（毫秒）
 * @type {number}
 */
const CACHE_EXPIRE_TIME = 30 * 60 * 1000; // 30分钟

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.pageSize - 每页数量，默认为10
 * @param {string} params.category - 文章分类（可选）
 * @returns {Promise<Object>} 文章列表数据
 */
const getArticleList = async (params = {}) => {
  const { page = 1, pageSize = 10, category = '' } = params;
  
  try {
    // 构建缓存键
    const cacheKey = `${CACHE_KEY_PREFIX}list_${page}_${pageSize}_${category}`;
    
    // 尝试从缓存获取数据
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API获取文章列表
    const response = await request.get('/api/articles', {
      page,
      pageSize,
      category
    });
    
    // 缓存数据
    await cache.set(cacheKey, response.data, CACHE_EXPIRE_TIME);
    
    return response.data;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
};

/**
 * 获取文章详情
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 文章详情数据
 */
const getArticleDetail = async (articleId) => {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }
  
  try {
    // 构建缓存键
    const cacheKey = `${CACHE_KEY_PREFIX}detail_${articleId}`;
    
    // 尝试从缓存获取数据
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API获取文章详情
    const response = await request.get(`/api/articles/${articleId}`);
    
    // 缓存数据
    await cache.set(cacheKey, response.data, CACHE_EXPIRE_TIME);
    
    return response.data;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    
    // 开发环境下返回模拟数据
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: articleId,
        title: `文章标题 ${articleId}`,
        content: `这是文章 ${articleId} 的详细内容。\n\n这里是更多的文章内容示例，可以包含段落、列表等格式化内容。\n\n文章是信息传递的重要方式，通过清晰的结构和生动的描述，能够让读者更好地理解作者想要表达的观点。`,
        author: 'Sut',
        date: '2025-11-23',
        category: '技术',
        viewCount: 1234,
        likeCount: 45,
        commentCount: 12
      };
    }
    
    throw error;
  }
};

/**
 * 增加文章阅读次数
 * @param {string} articleId - 文章ID
 * @returns {Promise<void>}
 */
const increaseViewCount = async (articleId) => {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }
  
  try {
    await request.post(`/api/articles/${articleId}/view`);
  } catch (error) {
    console.error('增加阅读次数失败:', error);
    // 不抛出错误，避免影响用户阅读体验
  }
};

/**
 * 获取文章评论列表
 * @param {string} articleId - 文章ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.pageSize - 每页数量，默认为20
 * @returns {Promise<Object>} 评论列表数据
 */
const getArticleComments = async (articleId, params = {}) => {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }
  
  const { page = 1, pageSize = 20 } = params;
  
  try {
    const response = await request.get(`/api/articles/${articleId}/comments`, {
      page,
      pageSize
    });
    
    return response.data;
  } catch (error) {
    console.error('获取文章评论失败:', error);
    throw error;
  }
};

module.exports = {
  getArticleList,
  getArticleDetail,
  increaseViewCount,
  getArticleComments
};
