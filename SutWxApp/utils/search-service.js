// search-service.js - 搜索相关服务模块
// 处理文章搜索、用户搜索等功能

import api from './api';
import { getStorage, setStorage } from './global';

// 搜索历史配置
const SEARCH_HISTORY_MAX_SIZE = 10;
const SEARCH_HISTORY_KEY = 'search_history';

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {string} params.orderby - 排序字段，默认'relevance'
 * @param {string} params.order - 排序方向，默认'desc'
 * @param {string} params.category - 分类过滤
 * @param {number} params.year - 年份过滤
 * @returns {Promise<Object>} - 包含文章列表和总数的对象
 */
export const searchArticles = async (keyword, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'relevance',
      order: params.order || 'desc'
    };
    
    // 添加可选过滤参数
    if (params.category) {
      queryParams.category = params.category;
    }
    
    if (params.year) {
      queryParams.year = params.year;
    }
    
    // 调用API
    const result = await api.get('/search/posts', queryParams);
    
    // 如果搜索成功且有关键词，保存搜索历史
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result;
  } catch (error) {
    console.error('搜索文章失败:', error);
    throw error;
  }
};

/**
 * 搜索用户
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @returns {Promise<Object>} - 包含用户列表和总数的对象
 */
export const searchUsers = async (keyword, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 调用API
    return await api.get('/search/users', queryParams);
  } catch (error) {
    console.error('搜索用户失败:', error);
    throw error;
  }
};

/**
 * 搜索商品（如果有电商功能）
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {string} params.orderby - 排序字段，默认'relevance'
 * @param {string} params.order - 排序方向，默认'desc'
 * @param {string} params.category - 商品分类过滤
 * @param {string} params.min_price - 最低价格过滤
 * @param {string} params.max_price - 最高价格过滤
 * @returns {Promise<Object>} - 包含商品列表和总数的对象
 */
export const searchProducts = async (keyword, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'relevance',
      order: params.order || 'desc'
    };
    
    // 添加可选过滤参数
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
    const result = await api.get('/search/products', queryParams);
    
    // 如果搜索成功且有关键词，保存搜索历史
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result;
  } catch (error) {
    console.error('搜索商品失败:', error);
    throw error;
  }
};

/**
 * 获取搜索建议
 * @param {string} keyword - 关键词前缀
 * @param {number} limit - 返回数量限制，默认5
 * @returns {Promise<Array>} - 返回搜索建议列表
 */
export const getSearchSuggestions = async (keyword, limit = 5) => {
  try {
    if (!keyword || !keyword.trim()) {
      return [];
    }
    
    // 调用API
    return await api.get('/search/suggestions', {
      s: keyword.trim(),
      limit
    });
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    // 失败时返回空数组，不影响用户体验
    return [];
  }
};

/**
 * 保存搜索历史
 * @param {string} keyword - 搜索关键词
 */
export const saveSearchHistory = (keyword) => {
  try {
    // 获取现有历史记录
    let history = getStorage(SEARCH_HISTORY_KEY) || [];
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到历史记录开头
    history.unshift(keyword);
    
    // 限制历史记录数量
    if (history.length > SEARCH_HISTORY_MAX_SIZE) {
      history = history.slice(0, SEARCH_HISTORY_MAX_SIZE);
    }
    
    // 保存到本地存储
    setStorage(SEARCH_HISTORY_KEY, history);
  } catch (error) {
    console.error('保存搜索历史失败:', error);
  }
};

/**
 * 获取搜索历史
 * @returns {Array} - 搜索历史记录
 */
export const getSearchHistory = () => {
  try {
    return getStorage(SEARCH_HISTORY_KEY) || [];
  } catch (error) {
    console.error('获取搜索历史失败:', error);
    return [];
  }
};

/**
 * 清空搜索历史
 */
export const clearSearchHistory = () => {
  try {
    setStorage(SEARCH_HISTORY_KEY, []);
  } catch (error) {
    console.error('清空搜索历史失败:', error);
  }
};

/**
 * 删除单条搜索历史
 * @param {string} keyword - 要删除的关键词
 */
export const deleteSearchHistoryItem = (keyword) => {
  try {
    // 获取现有历史记录
    let history = getStorage(SEARCH_HISTORY_KEY) || [];
    
    // 过滤掉指定关键词
    history = history.filter(item => item !== keyword);
    
    // 保存到本地存储
    setStorage(SEARCH_HISTORY_KEY, history);
  } catch (error) {
    console.error('删除搜索历史项失败:', error);
  }
};

/**
 * 获取热门搜索词
 * @param {number} limit - 获取数量，默认10
 * @returns {Promise<Array>} - 热门搜索词列表
 */
export const getHotSearchTerms = async (limit = 10) => {
  try {
    // 尝试从服务器获取热门搜索词
    return await api.get('/search/hot', { limit });
  } catch (error) {
    console.error('获取热门搜索词失败:', error);
    // 返回默认热门搜索词（用于离线状态或API调用失败时）
    return [
      '最新资讯',
      '热门文章',
      '技术教程',
      '开发经验',
      '前端开发',
      '后端开发',
      '小程序开发',
      'WordPress教程',
      '技术分享',
      '实用工具'
    ].slice(0, limit);
  }
};

/**
 * 综合搜索（文章、用户、商品等）
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 搜索参数
 * @param {Array} params.types - 搜索类型列表，如['posts', 'users', 'products']
 * @param {number} params.limit - 每种类型返回数量限制
 * @returns {Promise<Object>} - 包含各类型搜索结果的对象
 */
export const searchAll = async (keyword, params = {}) => {
  try {
    // 设置默认值
    const searchTypes = params.types || ['posts'];
    const limit = params.limit || 5;
    
    // 构建查询参数
    const queryParams = {
      s: keyword,
      types: searchTypes.join(','),
      limit
    };
    
    // 调用API
    const result = await api.get('/search/all', queryParams);
    
    // 如果搜索成功且有关键词，保存搜索历史
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result;
  } catch (error) {
    console.error('综合搜索失败:', error);
    // 如果API调用失败，尝试分别搜索各类型（备用方案）
    const fallbackResults = {};
    const searchTypes = params.types || ['posts'];
    
    // 仅在离线情况下尝试备用方案
    if (error && error.name === 'NetworkError') {
      // 这里可以添加离线搜索逻辑，但通常需要本地存储的索引数据
    }
    
    throw error;
  }
};

// 导出所有方法
export default {
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