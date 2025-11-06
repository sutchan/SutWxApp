// points-service.js - 积分系统相关服务模块
// 处理积分查询、积分任务、积分兑换等功能

import api from './api';
import { showToast, getStorage, setStorage } from './global';

// 缓存配置
const CACHE_DURATION = {
  USER_POINTS: 1 * 60 * 1000, // 1分钟
  POINTS_RULES: 5 * 60 * 1000, // 5分钟
  POINTS_TASKS: 30 * 60 * 1000 // 30分钟
};

/**
 * 获取用户积分余额
 * @returns {Promise<number>} - 用户当前积分余额
 */
export const getUserPoints = async () => {
  try {
    const cacheKey = 'cache_user_points';
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.USER_POINTS)) {
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/user/points');
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result.points || 0,
      timestamp: Date.now()
    });
    
    return result.points || 0;
  } catch (error) {
    console.error('获取用户积分失败:', error);
    throw error;
  }
};

/**
 * 获取积分规则设置
 * @returns {Promise<Object>} - 积分规则配置
 */
export const getPointsRules = async () => {
  try {
    const cacheKey = 'cache_points_rules';
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.POINTS_RULES)) {
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/points/rules');
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('获取积分规则失败:', error);
    throw error;
  }
};

/**
 * 获取积分任务列表
 * @returns {Promise<Array>} - 积分任务列表
 */
export const getPointsTasks = async () => {
  try {
    const cacheKey = 'cache_points_tasks';
    
    // 尝试从缓存获取数据
    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.POINTS_TASKS)) {
      return cachedData.data;
    }
    
    // 调用API
    const result = await api.get('/points/tasks');
    
    // 缓存数据
    setStorage(cacheKey, {
      data: result.tasks || [],
      timestamp: Date.now()
    });
    
    return result.tasks || [];
  } catch (error) {
    console.error('获取积分任务失败:', error);
    throw error;
  }
};

/**
 * 完成积分任务
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} - 任务完成结果
 */
export const completePointsTask = async (taskId) => {
  try {
    // 调用API
    const result = await api.post(`/points/tasks/${taskId}/complete`);
    
    // 清除积分缓存，确保下次获取最新数据
    clearPointsCache();
    
    return result;
  } catch (error) {
    console.error('完成积分任务失败:', error);
    throw error;
  }
};

/**
 * 获取积分明细记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认10
 * @param {string} params.type - 类型筛选：income(收入)、expense(支出)，可选
 * @returns {Promise<Object>} - 积分明细记录
 */
export const getPointsHistory = async (params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 10
    };
    
    // 添加可选筛选参数
    if (params.type) {
      queryParams.type = params.type;
    }
    
    // 调用API
    const result = await api.get('/points/history', queryParams);
    
    return result;
  } catch (error) {
    console.error('获取积分明细失败:', error);
    throw error;
  }
};

/**
 * 获取积分商城商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认10
 * @param {string} params.sort - 排序方式：default(默认)、price_asc(价格升序)、price_desc(价格降序)，可选
 * @returns {Promise<Object>} - 积分商品列表
 */
export const getPointsProducts = async (params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 10
    };
    
    // 添加可选筛选参数
    if (params.sort) {
      queryParams.sort = params.sort;
    }
    
    // 调用API
    const result = await api.get('/points/products', queryParams);
    
    return result;
  } catch (error) {
    console.error('获取积分商品失败:', error);
    throw error;
  }
};

/**
 * 获取积分商品详情
 * @param {string} productId - 积分商品ID
 * @returns {Promise<Object>} - 积分商品详情
 */
export const getPointsProductDetail = async (productId) => {
  try {
    // 调用API
    const result = await api.get(`/points/products/${productId}`);
    
    return result;
  } catch (error) {
    console.error('获取积分商品详情失败:', error);
    throw error;
  }
};

/**
 * 积分兑换商品
 * @param {string} productId - 积分商品ID
 * @param {Object} options - 兑换选项
 * @returns {Promise<Object>} - 兑换结果
 */
export const exchangePointsProduct = async (productId, options = {}) => {
  try {
    // 调用API
    const result = await api.post(`/points/products/${productId}/exchange`, options);
    
    // 清除积分缓存，确保下次获取最新数据
    clearPointsCache();
    
    return result;
  } catch (error) {
    console.error('积分兑换失败:', error);
    throw error;
  }
};

/**
 * 获取积分兑换记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认10
 * @returns {Promise<Object>} - 兑换记录
 */
export const getExchangeHistory = async (params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 10
    };
    
    // 调用API
    const result = await api.get('/points/exchange-history', queryParams);
    
    return result;
  } catch (error) {
    console.error('获取积分兑换记录失败:', error);
    throw error;
  }
};

/**
 * 用户签到
 * @returns {Promise<Object>} - 签到结果
 */
export const checkIn = async () => {
  try {
    // 调用API
    const result = await api.post('/points/check-in');
    
    // 清除积分缓存，确保下次获取最新数据
    clearPointsCache();
    
    return result;
  } catch (error) {
    console.error('签到失败:', error);
    throw error;
  }
};

/**
 * 获取签到记录
 * @returns {Promise<Object>} - 签到记录信息
 */
export const getCheckInHistory = async () => {
  try {
    // 调用API
    const result = await api.get('/points/check-in/history');
    
    return result;
  } catch (error) {
    console.error('获取签到记录失败:', error);
    throw error;
  }
};

/**
 * 积分兑换优惠券
 * @param {string} couponId - 优惠券ID
 * @returns {Promise<Object>} - 兑换结果
 */
export const exchangeCoupon = async (couponId) => {
  try {
    // 调用API
    const result = await api.post(`/points/coupons/${couponId}/exchange`);
    
    // 清除积分缓存，确保下次获取最新数据
    clearPointsCache();
    
    return result;
  } catch (error) {
    console.error('兑换优惠券失败:', error);
    throw error;
  }
};

/**
 * 清除积分相关缓存
 * @private
 */
const clearPointsCache = () => {
  try {
    const storage = wx.getStorageSync() || {};
    
    // 清除所有积分相关的缓存
    for (const key in storage) {
      if (key.startsWith('cache_user_points') || key.startsWith('cache_points_')) {
        wx.removeStorageSync(key);
      }
    }
  } catch (error) {
    console.error('清除积分缓存失败:', error);
  }
};

// 导出所有方法
export default {
  getUserPoints,
  getPointsRules,
  getPointsTasks,
  completePointsTask,
  getPointsHistory,
  getPointsProducts,
  getPointsProductDetail,
  exchangePointsProduct,
  getExchangeHistory,
  checkIn,
  getCheckInHistory,
  exchangeCoupon
};
