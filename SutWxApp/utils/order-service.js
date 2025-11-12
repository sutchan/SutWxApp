/**
 * order-service.js - 订单服务模块
 * 处理订单的创建、查询、取消、支付等相关功能
 */

const api = require('./api');
const { showToast, showLoading, hideLoading, setStorage, getStorage, removeStorage } = require('./global');

// 缓存键名定义
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

// 缓存过期时间（毫秒）
const CACHE_DURATION = {
  // 短时间缓存（3分钟）
  SHORT: 3 * 60 * 1000,
  // 中时间缓存（10分钟）
  MEDIUM: 10 * 60 * 1000,
  // 长时间缓存（30分钟）
  LONG: 30 * 60 * 1000
};

/**
 * 缓存操作 - 设置缓存
 * @param {string} key - 缓存键
 * @param {*} data - 缓存数据
 * @param {number} duration - 缓存过期时间
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
 * 缓存操作 - 获取缓存
 * @param {string} key - 缓存键
 * @returns {*} - 缓存数据或null
 */
const getCache = (key) => {
  try {
    const cacheData = getStorage(key);
    if (cacheData && cacheData.expire > Date.now()) {
      return cacheData.data;
    }
    // 缓存过期，清除缓存
    removeStorage(key);
    return null;
  } catch (error) {
    console.error('获取缓存失败', error);
    return null;
  }
};

/**
 * 缓存操作 - 删除缓存
 * @param {string} key - 缓存键
 */
const removeCache = (key) => {
  try {
    removeStorage(key);
  } catch (error) {
    console.error('删除缓存失败', error);
  }
};

/**
 * 请求重试工具函数
 * @param {Function} fn - 要重试的函数
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
      
      // 只有服务器错误或者无状态码时才重试
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
  // 验证页码
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
 * @param {string} orderId - 订单ID，可选
 */
const clearOrderCache = (orderId) => {
  try {
    // 清除订单列表缓存
    const cacheKeys = Object.keys(getStorage() || {});
    for (const key of cacheKeys) {
      // 清除订单列表缓存
      if (key.startsWith(CACHE_KEYS.ORDER_LIST)) {
        removeStorage(key);
      }
      
      // 清除订单详情缓存
      if (orderId && key === `${CACHE_KEYS.ORDER_DETAIL}${orderId}`) {
        removeStorage(key);
      }
    }
    
    // 清除订单统计缓存
    removeStorage(CACHE_KEYS.ORDER_STATS);
  } catch (error) {
    console.error('清除订单缓存失败', error);
  }
};

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} 订单创建结果
 */
const createOrder = async (orderData) => {
  try {
    // 验证订单数据
    if (!validator.isValidOrderData(orderData)) {
      throw new Error('订单数据不完整');
    }

    showLoading('创建订单中...');
    
    // 调用API创建订单
    const result = await retryRequest(() => 
      api.post('/api/orders', orderData)
    );
    
    // 清除订单相关缓存
    clearOrderCache();
    
    return result.data;
  } catch (error) {
    console.error('创建订单失败', error);
    showToast(error.message || '创建订单失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @param {string} params.status - 订单状态筛选
 * @returns {Promise<Object>} 订单列表和分页信息
 */
const getOrders = async (params = {}) => {
  try {
    const { page = 1, pageSize = 10, status } = params;
    
    // 构建请求参数
    const requestParams = { page, pageSize };
    if (status) {
      requestParams.status = status;
    }
    
    // 生成缓存键
    const cacheKey = `${CACHE_KEYS.ORDER_LIST}${JSON.stringify(requestParams)}`;
    
    // 尝试从缓存获取
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API获取订单列表
    const result = await retryRequest(() => 
      api.get('/api/orders', requestParams)
    );
    
    // 缓存结果
    setCache(cacheKey, result.data, CACHE_DURATION.SHORT);
    
    return result.data;
  } catch (error) {
    console.error('获取订单列表失败', error);
    showToast(error.message || '获取订单列表失败');
    throw error;
  }
};

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 订单详情
 */
const getOrderDetail = async (orderId) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    // 生成缓存键
    const cacheKey = `${CACHE_KEYS.ORDER_DETAIL}${orderId}`;
    
    // 尝试从缓存获取
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API获取订单详情
    const result = await retryRequest(() => 
      api.get(`/api/orders/${orderId}`)
    );
    
    // 缓存结果
    setCache(cacheKey, result.data, CACHE_DURATION.MEDIUM);
    
    return result.data;
  } catch (error) {
    console.error('获取订单详情失败', error);
    showToast(error.message || '获取订单详情失败');
    throw error;
  }
};

/**
 * 取消订单
 * @param {string} orderId - 订单ID
 * @param {string} reason - 取消原因
 * @returns {Promise<Object>} 取消结果
 */
const cancelOrder = async (orderId, reason = '') => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('取消订单中...');
    
    // 调用API取消订单
    const result = await retryRequest(() => 
      api.put(`/api/orders/${orderId}/cancel`, { reason })
    );
    
    // 清除相关缓存
    clearOrderCache(orderId);
    
    return result.data;
  } catch (error) {
    console.error('取消订单失败', error);
    showToast(error.message || '取消订单失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 确认收货
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 确认结果
 */
const confirmReceipt = async (orderId) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('确认收货中...');
    
    // 调用API确认收货
    const result = await retryRequest(() => 
      api.put(`/api/orders/${orderId}/confirm`)
    );
    
    // 清除相关缓存
    clearOrderCache(orderId);
    
    return result.data;
  } catch (error) {
    console.error('确认收货失败', error);
    showToast(error.message || '确认收货失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 获取支付信息
 * @param {string} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式
 * @returns {Promise<Object>} 支付信息
 */
const getPaymentInfo = async (orderId, paymentMethod) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('获取支付信息中...');
    
    // 调用API获取支付信息
    const result = await retryRequest(() => 
      api.get(`/api/orders/${orderId}/payment`, { payment_method: paymentMethod })
    );
    
    return result.data;
  } catch (error) {
    console.error('获取支付信息失败', error);
    showToast(error.message || '获取支付信息失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 检查支付状态
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 支付状态
 */
const checkPaymentStatus = async (orderId) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    // 生成缓存键
    const cacheKey = `${CACHE_KEYS.PAYMENT_STATUS}${orderId}`;
    
    // 尝试从缓存获取（只缓存未支付状态）
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API检查支付状态
    const result = await retryRequest(() => 
      api.get(`/api/orders/${orderId}/payment/status`)
    );
    
    // 如果未支付，则缓存状态（短期缓存，防止频繁查询）
    if (!result.data.paid) {
      setCache(cacheKey, result.data, 10 * 1000); // 10秒缓存
    } else {
      // 支付成功，清除订单缓存
      clearOrderCache(orderId);
    }
    
    return result.data;
  } catch (error) {
    console.error('检查支付状态失败', error);
    // 不显示错误提示，让上层业务决定如何处理
    throw error;
  }
};

/**
 * 申请退款
 * @param {string} orderId - 订单ID
 * @param {Object} refundData - 退款数据
 * @returns {Promise<Object>} 退款申请结果
 */
const applyRefund = async (orderId, refundData) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('申请退款中...');
    
    // 调用API申请退款
    const result = await retryRequest(() => 
      api.post(`/api/orders/${orderId}/refund`, refundData)
    );
    
    // 清除相关缓存
    clearOrderCache(orderId);
    
    return result.data;
  } catch (error) {
    console.error('申请退款失败', error);
    showToast(error.message || '申请退款失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 获取订单统计信息
 * @returns {Promise<Object>} 订单统计信息
 */
const getOrderStats = async () => {
  try {
    // 尝试从缓存获取
    const cachedData = getCache(CACHE_KEYS.ORDER_STATS);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API获取订单统计
    const result = await retryRequest(() => 
      api.get('/api/orders/stats')
    );
    
    // 缓存结果
    setCache(CACHE_KEYS.ORDER_STATS, result.data, CACHE_DURATION.MEDIUM);
    
    return result.data;
  } catch (error) {
    console.error('获取订单统计失败', error);
    // 返回默认值，不影响页面展示
    return {
      total: 0,
      pending_payment: 0,
      pending_shipping: 0,
      pending_receipt: 0,
      completed: 0
    };
  }
};

/**
 * 申请发票
 * @param {string} orderId - 订单ID
 * @param {Object} invoiceData - 发票信息
 * @returns {Promise<Object>} 申请结果
 */
const applyInvoice = async (orderId, invoiceData) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('申请发票中...');
    
    // 调用API申请发票
    const result = await retryRequest(() => 
      api.post(`/api/orders/${orderId}/invoice`, invoiceData)
    );
    
    return result.data;
  } catch (error) {
    console.error('申请发票失败', error);
    showToast(error.message || '申请发票失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 再次购买
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 操作结果
 */
const buyAgain = async (orderId) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('添加商品到购物车中...');
    
    // 调用API再次购买
    const result = await retryRequest(() => 
      api.post(`/api/orders/${orderId}/buy-again`)
    );
    
    return result.data;
  } catch (error) {
    console.error('再次购买失败', error);
    showToast(error.message || '再次购买失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 评价订单
 * @param {string} orderId - 订单ID
 * @param {Object} ratings - 评价信息
 * @returns {Promise<Object>} 评价结果
 */
const rateOrder = async (orderId, ratings) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    showLoading('提交评价中...');
    
    // 调用API评价订单
    const result = await retryRequest(() => 
      api.post(`/api/orders/${orderId}/rating`, ratings)
    );
    
    // 清除相关缓存
    clearOrderCache(orderId);
    
    return result.data;
  } catch (error) {
    console.error('评价订单失败', error);
    showToast(error.message || '评价订单失败');
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 获取订单物流信息
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 物流信息
 */
const getOrderTracking = async (orderId) => {
  try {
    // 验证订单ID
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('无效的订单ID');
    }
    
    // 生成缓存键
    const cacheKey = `${CACHE_KEYS.ORDER_TRACKING}${orderId}`;
    
    // 尝试从缓存获取
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 调用API获取物流信息
    const result = await retryRequest(() => 
      api.get(`/api/orders/${orderId}/tracking`)
    );
    
    // 缓存结果
    setCache(cacheKey, result.data, CACHE_DURATION.MEDIUM);
    
    return result.data;
  } catch (error) {
    console.error('获取物流信息失败', error);
    showToast(error.message || '获取物流信息失败');
    throw error;
  }
};

// 导出模块
module.exports = {
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
