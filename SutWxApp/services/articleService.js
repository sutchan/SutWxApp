/**
 * 文件名: articleService.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 文章服务层，提供文章相关的API接口调用 */

const request = require('../utils/request');
const cacheService = require('../utils/cacheService.js').instance;
const CACHE_POLICY = require('../utils/cacheService.js').CACHE_POLICY;

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
    // 调用API获取文章列表
    const response = await request.get('/articles', {
      page,
      pageSize,
      category
    }, {
      cache: {
        policy: CACHE_POLICY.NETWORK_FIRST,
        maxAge: 30 * 60 * 1000 // 30分钟
      }
    });
    
    return response;
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
    // 调用API获取文章详情
    const response = await request.get(`/articles/${articleId}`, {}, {
      cache: {
        policy: CACHE_POLICY.STALE_WHILE_REVALIDATE,
        maxAge: 60 * 60 * 1000 // 1小时
      }
    });
    
    return response;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
};

/**
 * 增加文章浏览次数
 * @param {string} articleId - 文章ID
 * @returns {Promise<void>}
 */
const increaseViewCount = async (articleId) => {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }
  
  try {
    await request.post(`/articles/${articleId}/view`);
  } catch (error) {
    console.error('增加浏览次数失败:', error);
    // 不抛出错误，避免影响用户浏览体验
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
    const response = await request.get(`/articles/${articleId}/comments`, {
      page,
      pageSize
    }, {
      cache: {
        policy: CACHE_POLICY.NETWORK_FIRST,
        maxAge: 5 * 60 * 1000 // 5分钟
      }
    });
    
    return response;
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