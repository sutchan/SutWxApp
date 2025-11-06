// order-service.js - 订单相关服务模块
// 处理订单的创建、查询、支付、取消等功能

import api from './api';
import { showToast, showLoading, hideLoading, setStorage, getStorage, removeStorage } from './global';

// 缓存键常量定义
const CACHE_KEYS = {
  // 订单列表缓存
  ORDER_LIST: 'order_list_',
  // 订单详情缓存
  ORDER_DETAIL: 'order_detail_',
  // 订单统计缓存
  ORDER_STATS: 'order_stats',
  // 订单物流信息缓存
  ORDER_TRACKING: 'order_tracking_',
  // 支付状态缓存
  PAYMENT_STATUS: 'payment_status_'
};

// 缓存时间常量（毫秒）
const CACHE_DURATION = {
  // 短期缓存，3分钟
  SHORT: 3 * 60 * 1000,
  // 中期缓存，10分钟
  MEDIUM: 10 * 60 * 1000,
  // 长期缓存，30分钟
  LONG: 30 * 60 * 1000
};

/**
 * 缓存管理器 - 设置缓存
 * @param {string} key - 缓存键
 * @param {*} data - 缓存数据
 * @param {number} duration - 缓存时间（毫秒）
 */
const setCache = (key, data, duration = CACHE_DURATION.SHORT) => {
  const cacheData = {
    data,
    timestamp: Date.now(),
    expire: Date.now() + duration
  };
  setStorage(key, cacheData);
};

/**
 * 缓存管理器 - 获取缓存
 * @param {string} key - 缓存键
 * @returns {*} - 缓存数据或null
 */
const getCache = (key) => {
  try {
    const cacheData = getStorage(key);
    if (cacheData && cacheData.expire > Date.now()) {
      return cacheData.data;
    }
    // 缓存过期，清除
    removeStorage(key);
    return null;
  } catch (error) {
    console.error('获取缓存失败:', error);
    return null;
  }
};

/**
 * 缓存管理器 - 移除缓存
 * @param {string} key - 缓存键
 */
const removeCache = (key) => {
  try {
    removeStorage(key);
  } catch (error) {
    console.error('移除缓存失败:', error);
  }
};

/**
 * 请求重试机制
 * @param {Function} fn - 请求函数
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise} - 返回Promise对象
 */
const retryRequest = async (fn, maxRetries = 2) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 只对网络错误和服务器错误进行重试
      if (i < maxRetries && (error.statusCode >= 500 || !error.statusCode)) {
        // 指数退避策略
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
};

/**
 * 数据验证工具
 */
const validator = {
  // 验证订单ID
  isValidOrderId: (id) => {
    return id && (typeof id === 'string' || typeof id === 'number');
  },
  // 验证页码参数
  isValidPage: (page) => {
    return typeof page === 'number' && page > 0;
  },
  // 验证订单数据
  isValidOrderData: (data) => {
    return data && 
           Array.isArray(data.items) && 
           data.items.length > 0 && 
           data.address && 
           data.payment_method;
  }
};

/**
 * 清除订单相关缓存
 * @param {string|number} orderId - 可选，指定订单ID
 */
const clearOrderCache = (orderId) => {
  try {
    // 清除订单统计缓存
    removeCache(CACHE_KEYS.ORDER_STATS);
    
    // 如果指定了订单ID，清除特定订单缓存
    if (orderId) {
      removeCache(`${CACHE_KEYS.ORDER_DETAIL}${orderId}`);
      removeCache(`${CACHE_KEYS.ORDER_TRACKING}${orderId}`);
      removeCache(`${CACHE_KEYS.PAYMENT_STATUS}${orderId}`);
    }
    
    // 清除所有订单列表缓存（简单实现，实际可能需要更精确的清除）
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.ORDER_LIST)) {
        removeStorage(key);
      }
    });
  } catch (error) {
    console.error('清除订单缓存失败:', error);
  }
};

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @param {Array} orderData.items - 订单商品列表
 * @param {Object} orderData.address - 收货地址
 * @param {string} orderData.payment_method - 支付方式
 * @param {string} orderData.remark - 订单备注
 * @returns {Promise<Object>} - 返回创建的订单信息
 */
export const createOrder = async (orderData) => {
  try {
    // 数据验证
    if (!validator.isValidOrderData(orderData)) {
      throw new Error('订单数据格式不正确');
    }
    
    showLoading('创建订单中...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post('/orders/create', orderData)
    );
    
    hideLoading();
    
    if (result.code === 200 && result.order) {
      // 创建成功后清除订单相关缓存
      clearOrderCache();
      return result.order;
    } else {
      throw new Error(result.message || '创建订单失败');
    }
  } catch (error) {
    hideLoading();
    console.error('创建订单失败:', error);
    showToast(error.message || '创建订单失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @param {string} params.status - 订单状态（可选）
 * @returns {Promise<Object>} - 返回订单列表数据
 */
export const getOrders = async (params = {}) => {
  try {
    const requestParams = {
      page: validator.isValidPage(params.page) ? params.page : 1,
      page_size: params.pageSize || 10,
      status: params.status || ''
    };
    
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.ORDER_LIST}${requestParams.page}_${requestParams.page_size}_${requestParams.status}`;
    
    // 尝试获取缓存，仅对第一页使用缓存
    if (requestParams.page === 1) {
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.get('/orders', { params: requestParams })
    );
    
    // 缓存第一页数据
    if (requestParams.page === 1) {
      setCache(cacheKey, result, CACHE_DURATION.SHORT);
    }
    
    return result;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    
    // 如果是第一页且有缓存，返回缓存数据
    if ((params.page === 1 || !params.page) && params.pageSize === undefined) {
      const cacheKey = `${CACHE_KEYS.ORDER_LIST}1_10_${params.status || ''}`;
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        console.log('使用缓存的订单列表数据');
        return cachedData;
      }
    }
    
    throw error;
  }
};

/**
 * 获取订单详情
 * @param {number|string} orderId - 订单ID
 * @returns {Promise<Object>} - 返回订单详情数据
 */
export const getOrderDetail = async (orderId) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.ORDER_DETAIL}${orderId}`;
    
    // 尝试获取缓存
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.get(`/orders/${orderId}`)
    );
    
    if (result.code === 200 && result.order) {
      // 缓存订单详情
      setCache(cacheKey, result.order, CACHE_DURATION.MEDIUM);
      return result.order;
    } else {
      throw new Error(result.message || '获取订单详情失败');
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    
    // 尝试返回缓存数据
    const cacheKey = `${CACHE_KEYS.ORDER_DETAIL}${orderId}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('使用缓存的订单详情数据');
      return cachedData;
    }
    
    throw error;
  }
};

/**
 * 取消订单
 * @param {number|string} orderId - 订单ID
 * @param {string} reason - 取消原因
 * @returns {Promise<Object>} - 返回取消结果
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    showLoading('取消订单中...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/cancel`, {
        reason: reason
      })
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 清除相关缓存
      clearOrderCache(orderId);
      showToast('订单已取消', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '取消订单失败');
    }
  } catch (error) {
    hideLoading();
    console.error('取消订单失败:', error);
    showToast(error.message || '取消订单失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 确认收货
 * @param {number|string} orderId - 订单ID
 * @returns {Promise<Object>} - 返回确认结果
 */
export const confirmReceipt = async (orderId) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    showLoading('确认收货中...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/confirm`)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 清除相关缓存
      clearOrderCache(orderId);
      showToast('收货成功', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '确认收货失败');
    }
  } catch (error) {
    hideLoading();
    console.error('确认收货失败:', error);
    showToast(error.message || '确认收货失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 获取订单支付信息
 * @param {number|string} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式
 * @returns {Promise<Object>} - 返回支付信息
 */
export const getPaymentInfo = async (orderId, paymentMethod) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      throw new Error('支付方式不能为空');
    }
    
    showLoading('获取支付信息...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post('/orders/pay', {
        order_id: orderId,
        payment_method: paymentMethod
      })
    );
    
    hideLoading();
    
    if (result.code === 200 && result.pay_params) {
      return result.pay_params;
    } else {
      throw new Error(result.message || '获取支付信息失败');
    }
  } catch (error) {
    hideLoading();
    console.error('获取支付信息失败:', error);
    showToast(error.message || '获取支付信息失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 查询订单支付状态
 * @param {number|string} orderId - 订单ID
 * @returns {Promise<boolean>} - 是否已支付
 */
export const checkPaymentStatus = async (orderId) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.PAYMENT_STATUS}${orderId}`;
    
    // 尝试获取缓存（支付状态缓存时间较短）
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.get(`/orders/${orderId}/payment-status`)
    );
    
    const isPaid = result.paid || false;
    
    // 缓存支付状态，使用较短的缓存时间
    setCache(cacheKey, isPaid, 30000); // 30秒
    
    return isPaid;
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return false;
  }
};

/**
 * 申请退款
 * @param {number|string} orderId - 订单ID
 * @param {Object} refundData - 退款信息
 * @param {string} refundData.reason - 退款原因
 * @param {string} refundData.description - 退款说明
 * @param {Array} refundData.images - 退款凭证图片
 * @returns {Promise<Object>} - 返回退款申请结果
 */
export const applyRefund = async (orderId, refundData) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    if (!refundData || !refundData.reason) {
      throw new Error('退款原因不能为空');
    }
    
    showLoading('提交退款申请...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/refund`, refundData)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 清除相关缓存
      clearOrderCache(orderId);
      showToast('退款申请已提交', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '提交退款申请失败');
    }
  } catch (error) {
    hideLoading();
    console.error('申请退款失败:', error);
    showToast(error.message || '申请退款失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 获取订单状态统计
 * @returns {Promise<Object>} - 返回各状态订单数量
 */
export const getOrderStats = async () => {
  try {
    // 尝试获取缓存
    const cachedData = getCache(CACHE_KEYS.ORDER_STATS);
    if (cachedData) {
      return cachedData;
    }
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.get('/orders/stats')
    );
    
    const stats = result.stats || {
      pending_pay: 0,
      pending_ship: 0,
      pending_receipt: 0,
      completed: 0,
      cancelled: 0
    };
    
    // 缓存统计数据
    setCache(CACHE_KEYS.ORDER_STATS, stats, CACHE_DURATION.MEDIUM);
    
    return stats;
  } catch (error) {
    console.error('获取订单统计失败:', error);
    
    // 尝试返回缓存数据
    const cachedData = getCache(CACHE_KEYS.ORDER_STATS);
    if (cachedData) {
      console.log('使用缓存的订单统计数据');
      return cachedData;
    }
    
    return {
      pending_pay: 0,
      pending_ship: 0,
      pending_receipt: 0,
      completed: 0,
      cancelled: 0
    };
  }
};

/**
 * 申请发票
 * @param {number|string} orderId - 订单ID
 * @param {Object} invoiceData - 发票信息
 * @returns {Promise<Object>} - 返回申请结果
 */
export const applyInvoice = async (orderId, invoiceData) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    if (!invoiceData) {
      throw new Error('发票信息不能为空');
    }
    
    showLoading('提交发票申请...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/invoice`, invoiceData)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 清除订单详情缓存，因为发票信息会更新订单状态
      removeCache(`${CACHE_KEYS.ORDER_DETAIL}${orderId}`);
      showToast('发票申请已提交', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '提交发票申请失败');
    }
  } catch (error) {
    hideLoading();
    console.error('申请发票失败:', error);
    showToast(error.message || '申请发票失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 再次购买订单商品
 * @param {number|string} orderId - 订单ID
 * @returns {Promise<boolean>} - 是否添加成功
 */
export const buyAgain = async (orderId) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    showLoading('添加到购物车...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/buy-again`)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('已添加到购物车', { icon: 'success' });
      return true;
    } else {
      throw new Error(result.message || '添加失败');
    }
  } catch (error) {
    hideLoading();
    console.error('再次购买失败:', error);
    showToast(error.message || '添加失败，请重试', { icon: 'none' });
    return false;
  }
};

/**
 * 评价订单
 * @param {number|string} orderId - 订单ID
 * @param {Array} ratings - 评价数据
 * @returns {Promise<Object>} - 返回评价结果
 */
export const rateOrder = async (orderId, ratings) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    if (!Array.isArray(ratings) || ratings.length === 0) {
      throw new Error('评价数据不能为空');
    }
    
    showLoading('提交评价...');
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/rate`, {
        ratings: ratings
      })
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 清除订单详情缓存
      removeCache(`${CACHE_KEYS.ORDER_DETAIL}${orderId}`);
      showToast('评价成功', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '评价失败');
    }
  } catch (error) {
    hideLoading();
    console.error('评价订单失败:', error);
    showToast(error.message || '评价失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 获取订单物流信息
 * @param {number|string} orderId - 订单ID
 * @returns {Promise<Object>} - 返回物流信息
 */
export const getOrderTracking = async (orderId) => {
  try {
    // 数据验证
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('订单ID格式不正确');
    }
    
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.ORDER_TRACKING}${orderId}`;
    
    // 尝试获取缓存
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 使用重试机制
    const result = await retryRequest(() => 
      api.get(`/orders/${orderId}/tracking`)
    );
    
    if (result.code === 200) {
      const tracking = result.tracking || {};
      // 缓存物流信息
      setCache(cacheKey, tracking, CACHE_DURATION.MEDIUM);
      return tracking;
    } else {
      throw new Error(result.message || '获取物流信息失败');
    }
  } catch (error) {
    console.error('获取物流信息失败:', error);
    
    // 尝试返回缓存数据
    const cacheKey = `${CACHE_KEYS.ORDER_TRACKING}${orderId}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('使用缓存的物流信息');
      return cachedData;
    }
    
    throw error;
  }
};

// 导出所有方法
export default {
  createOrder,
  getOrders,
  getOrderDetail,
  cancelOrder,
  confirmReceipt,
  getPaymentInfo,
  checkPaymentStatus,
  applyRefund,
  getOrderStats,
  applyInvoice,
  buyAgain,
  rateOrder,
  getOrderTracking
};