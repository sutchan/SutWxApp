/**
 * search-service.js - 搜索服务模块
 * 提供文章搜索、用户搜索、产品搜索等功能
 */

const api = require('./api');
const { getStorage, setStorage } = require('./global');

// 搜索历史配置
const SEARCH_HISTORY_MAX_SIZE = 10;
const SEARCH_HISTORY_KEY = 'search_history';

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @param {string} params.orderby - 排序字段，默认为'relevance'
 * @param {string} params.order - 排序方式，默认为'desc'
 * @param {string} params.category - 分类筛选
 * @param {number} params.year - 年份筛选
 * @returns {Promise<Object>} - 返回搜索结果和分页信息
 */
const searchArticles = async (keyword, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'relevance',
      order: params.order || 'desc'
    };
    
    // 可选参数处理
    if (params.category) {
      queryParams.category = params.category;
    }
    
    if (params.year) {
      queryParams.year = params.year;
    }
    
    // 调用API
    const result = await api.get('/api/search/posts', queryParams);
    
    // 保存搜索关键词到搜索历史
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result.data;
  } catch (error) {
    console.error('搜索文章失败', error);
    throw error;
  }
};

/**
 * 搜索用户
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @returns {Promise<Object>} - 返回搜索结果和分页信息
 */
const searchUsers = async (keyword, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 调用API
    const result = await api.get('/api/search/users', queryParams);
    return result.data;
  } catch (error) {
    console.error('搜索用户失败', error);
    throw error;
  }
};

/**
 * 搜索产品
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @param {string} params.orderby - 排序字段，默认为'relevance'
 * @param {string} params.order - 排序方式，默认为'desc'
 * @param {string} params.category - 分类筛选
 * @param {string} params.min_price - 最低价格筛选
 * @param {string} params.max_price - 最高价格筛选
 * @returns {Promise<Object>} - 返回搜索结果和分页信息
 */
const searchProducts = async (keyword, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'relevance',
      order: params.order || 'desc'
    };
    
    // 可选参数处理
    if (params.category) {
      queryParams.category = params.category;
    }
    
    if (params.min_price) {
      queryParams.min_price = params.min_price;
    }
    
    if (params.max_price) {
      queryParams.max_price = params.max_price;
    }
    
    // 调用API
    const result = await api.get('/api/search/products', queryParams);
    
    // 保存搜索关键词到搜索历史
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result.data;
  } catch (error) {
    console.error('搜索产品失败', error);
    throw error;
  }
};

/**
 * 获取搜索建议
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回数量限制，默认为5
 * @returns {Promise<Array>} - 返回搜索建议列表
 */
const getSearchSuggestions = async (keyword, limit = 5) => {
  try {
    // 调用API获取搜索建议
    const result = await api.get('/api/search/suggestions', {
      s: keyword,
      limit
    });
    
    return result.data || [];
  } catch (error) {
    console.error('获取搜索建议失败', error);
    return [];
  }
};

/**
 * 保存搜索历史
 * @param {string} keyword - 搜索关键词
 */
const saveSearchHistory = (keyword) => {
  try {
    // 获取现有历史记录
    let history = getStorage(SEARCH_HISTORY_KEY) || [];
    
    // 确保history是数组
    if (!Array.isArray(history)) {
      history = [];
    }
    
    // 移除重复的关键词
    const index = history.indexOf(keyword);
    if (index > -1) {
      history.splice(index, 1);
    }
    
    // 添加到历史记录开头
    history.unshift(keyword);
    
    // 限制历史记录数量
    if (history.length > SEARCH_HISTORY_MAX_SIZE) {
      history = history.slice(0, SEARCH_HISTORY_MAX_SIZE);
    }
    
    // 保存到本地存储
    setStorage(SEARCH_HISTORY_KEY, history);
  } catch (error) {
    console.error('保存搜索历史失败', error);
  }
};

/**
 * 获取搜索历史
 * @returns {Array} - 返回搜索历史列表
 */
const getSearchHistory = () => {
  try {
    const history = getStorage(SEARCH_HISTORY_KEY);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('获取搜索历史失败', error);
    return [];
  }
};

/**
 * 清空搜索历史
 */
const clearSearchHistory = () => {
  try {
    setStorage(SEARCH_HISTORY_KEY, []);
  } catch (error) {
    console.error('清空搜索历史失败', error);
  }
};

/**
 * 删除搜索历史项
 * @param {string} keyword - 要删除的关键词
 */
const deleteSearchHistoryItem = (keyword) => {
  try {
    // 获取现有历史记录
    let history = getStorage(SEARCH_HISTORY_KEY) || [];
    
    // 确保history是数组
    if (!Array.isArray(history)) {
      history = [];
    }
    
    // 移除指定关键词
    const index = history.indexOf(keyword);
    if (index > -1) {
      history.splice(index, 1);
      
      // 保存到本地存储
      setStorage(SEARCH_HISTORY_KEY, history);
    }
  } catch (error) {
    console.error('删除搜索历史项失败', error);
  }
};

/**
 * 获取热门搜索词
 * @param {number} limit - 返回数量，默认10
 * @returns {Promise<Array>} - 返回热门搜索词列表
 */
const getHotSearchTerms = async (limit = 10) => {
  try {
    // 尝试从缓存获取
    const cacheKey = `cache_hot_search_terms_${limit}`;
    const cachedData = getStorage(cacheKey);
    
    // 缓存有效期为1小时
    if (cachedData && Date.now() - cachedData.timestamp < 60 * 60 * 1000) {
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/api/search/hot-terms', { limit });
    
    // 保存到缓存
    setStorage(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });
    
    return result.data || [];
  } catch (error) {
    console.error('获取热门搜索词失败', error);
    
    // 尝试使用缓存中的数据
    const cacheKey = `cache_hot_search_terms_${limit}`;
    const cachedData = getStorage(cacheKey);
    if (cachedData) {
      return cachedData.data;
    }
    
    return [];
  }
};

/**
 * 综合搜索（搜索所有内容）
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @returns {Promise<Object>} - 返回所有类型的搜索结果
 */
const searchAll = async (keyword, params = {}) => {
  try {
    // 并行发起多个搜索请求
    const [articles, products, users] = await Promise.all([
      searchArticles(keyword, { ...params, per_page: 5 }),
      searchProducts(keyword, { ...params, per_page: 5 }),
      searchUsers(keyword, { ...params, per_page: 5 })
    ]);
    
    // 保存搜索关键词到搜索历史
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return {
      articles,
      products,
      users,
      totalResults: (
        (articles.total || 0) + 
        (products.total || 0) + 
        (users.total || 0)
      )
    };
  } catch (error) {
    console.error('综合搜索失败', error);
    throw error;
  }
};

// 导出所有函数
module.exports = {
  searchArticles,
  searchUsers,
  searchProducts,
  getSearchSuggestions,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
  getHotSearchTerms,
  searchAll
};
