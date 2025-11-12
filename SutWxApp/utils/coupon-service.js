/**
 * coupon-service.js - 优惠券服务模块
 * 提供优惠券相关的操作和功能
 */

const api = require('./api');
const { showToast, showLoading, hideLoading, setStorage, getStorage } = require('./global');

// 缓存键名常量定义
const CACHE_KEYS = {
  USER_COUPONS_AVAILABLE: 'user_coupons_available',
  USER_COUPONS_USED: 'user_coupons_used',
  USER_COUPONS_EXPIRED: 'user_coupons_expired',
  COUPON_DETAIL_PREFIX: 'coupon_detail_',
  VALIDATE_RESULT_PREFIX: 'coupon_validate_' 
};

// 缓存时长配置（毫秒）
const CACHE_DURATION = {
  HIGH_FREQUENCY: 30000, // 30秒
  SHORT: 60000, // 1分钟
  MEDIUM: 300000, // 5分钟
  LONG: 1800000, // 30分钟
  ALL_DAY: 86400000 // 1天
};

/**
 * 设置缓存
 * @param {string} key - 缓存键名
 * @param {*} data - 缓存数据
 * @param {number} expireTime - 过期时间（毫秒）
 * @returns {Promise<void>}
 */
const setCache = async (key, data, expireTime) => {
  const cacheData = {
    data: data,
    expireTime: Date.now() + expireTime
  };
  await setStorage(key, JSON.stringify(cacheData));
};

/**
 * 获取缓存
 * @param {string} key - 缓存键名
 * @returns {Promise<any>} - 缓存数据，如果已过期或不存在则返回null
 */
const getCache = async (key) => {
  try {
    const cacheStr = await getStorage(key);
    if (!cacheStr) return null;
    
    const cacheData = JSON.parse(cacheStr);
    // 检查是否过期
    if (Date.now() > cacheData.expireTime) {
      // 过期则清除
      await setStorage(key, '');
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.error('获取缓存失败', error);
    return null;
  }
};

/**
 * 清除缓存
 * @param {string} key - 缓存键名
 * @returns {Promise<void>}
 */
const removeCache = async (key) => {
  await setStorage(key, '');
};

/**
 * 清除优惠券缓存
 * @param {string} status - 优惠券状态：available, used, expired，为null时清除所有状态的优惠券缓存
 * @returns {Promise<void>}
 */
const clearCouponCache = async (status = null) => {
  if (status) {
    // 清除指定状态的优惠券缓存
    await removeCache(CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`]);
  } else {
    // 清除所有状态的优惠券缓存
    await removeCache(CACHE_KEYS.USER_COUPONS_AVAILABLE);
    await removeCache(CACHE_KEYS.USER_COUPONS_USED);
    await removeCache(CACHE_KEYS.USER_COUPONS_EXPIRED);
  }
};

/**
 * 请求重试工具函数
 * @param {Function} requestFn - 需要重试的请求函数
 * @param {number} maxRetries - 最大重试次数，默认2次
 * @param {number} initialDelay - 初始延迟时间（毫秒），默认1000ms
 * @returns {Promise<any>} - 请求结果
 */
const retryRequest = async (requestFn, maxRetries = 2, initialDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试则不再重试
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 指数退避策略
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError; // 所有重试都失败时抛出最后一个错误
};

// 数据验证器
const validator = {
  // 验证优惠券ID
  isValidCouponId: (id) => {
    return id && (typeof id === 'string' || typeof id === 'number') && id.toString().trim().length > 0;
  },
  
  // 验证产品ID列表
  isValidProductIds: (productIds) => {
    return Array.isArray(productIds) && productIds.length > 0;
  },
  
  // 验证金额
  isValidAmount: (amount) => {
    return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
  },
  
  // 验证优惠券状态
  isValidCouponStatus: (status) => {
    return ['available', 'used', 'expired'].includes(status);
  }
};

/**
 * 显示确认对话框
 * @param {string} message - 提示信息
 * @param {string} confirmText - 确认按钮文本，默认为'确定'
 * @param {string} cancelText - 取消按钮文本，默认为'取消'
 * @returns {Promise<boolean>}
 */
const showConfirm = (message, confirmText = '确定', cancelText = '取消') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '提示',
      content: message,
      confirmText: confirmText,
      cancelText: cancelText,
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else if (res.cancel) {
          resolve(false);
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * 获取可用优惠券列表
 * @param {Object} params - 查询参数
 * @param {number} params.total_amount - 商品总价
 * @param {Array} params.product_ids - 商品ID列表
 * @returns {Promise<Array>} 优惠券列表
 */
const getAvailableCoupons = async (params = {}) => {
  try {
    // 检查是否有缓存
    const cacheKey = `${CACHE_KEYS.VALIDATE_RESULT_PREFIX}${params.total_amount || 0}_${(params.product_ids || []).join('_')}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('获取优惠券中...');
    
    const requestParams = {
      total_amount: params.total_amount || 0,
      product_ids: params.product_ids || []
    };
    
    const result = await api.get('/api/coupons/available', { params: requestParams });
    const coupons = result.coupons || [];
    
    // 设置缓存
    await setCache(cacheKey, coupons, CACHE_DURATION.SHORT);
    
    return coupons;
  } catch (error) {
    console.error('获取可用优惠券失败', error);
    showToast('获取优惠券失败', { icon: 'none' });
    return [];
  } finally {
    hideLoading();
  }
};

/**
 * 获取用户优惠券列表
 * @param {string} status - 优惠券状态：available, used, expired
 * @returns {Promise<Array>} 优惠券列表
 */
const getUserCoupons = async (status = 'available') => {
  try {
    // 验证状态参数
    if (!validator.isValidCouponStatus(status)) {
      throw new Error('无效的优惠券状态');
    }
    
    const cacheKey = CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`];
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('获取优惠券中...');
    
    // 根据状态选择适当的缓存时长
    let cacheDuration = CACHE_DURATION.MEDIUM;
    switch (status) {
      case 'available':
        cacheDuration = CACHE_DURATION.SHORT; // 可用优惠券缓存时间较短
        break;
      case 'used':
      case 'expired':
        cacheDuration = CACHE_DURATION.LONG; // 已使用和过期的优惠券缓存时间较长
        break;
    }
    
    const result = await api.get(`/api/user/coupons/${status}`);
    const coupons = result.coupons || [];
    
    await setCache(cacheKey, coupons, cacheDuration);
    
    return coupons;
  } catch (error) {
    console.error('获取用户优惠券失败', error);
    showToast(error.message || '获取优惠券失败', { icon: 'none' });
    
    // 尝试从缓存获取
    const cacheKey = CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`];
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`使用缓存的${status}优惠券数据`);
      return cachedData;
    }
    
    return [];
  } finally {
    hideLoading();
  }
};

/**
 * 获取优惠券详情
 * @param {string|number} couponId - 优惠券ID
 * @returns {Promise<Object>} 优惠券详情
 */
const getCouponDetail = async (couponId) => {
  try {
    // 验证优惠券ID
    if (!validator.isValidCouponId(couponId)) {
      throw new Error('无效的优惠券ID');
    }
    
    const cacheKey = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${couponId}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('获取优惠券详情...');
    const result = await retryRequest(() => api.get(`/api/coupons/${couponId}`));

    if (result.code === 200 && result.coupon) {
      // 设置缓存
      await setCache(cacheKey, result.coupon, CACHE_DURATION.MEDIUM);
      return result.coupon;
    } else {
      throw new Error(result.message || '获取优惠券详情失败');
    }
  } catch (error) {
    console.error('获取优惠券详情失败', error);
    showToast(error.message || '获取优惠券详情失败', { icon: 'none' });
    
    // 尝试从缓存获取
    try {
      const cacheKey = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${couponId}`;
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`使用缓存的优惠券详情数据`);
        return cachedData;
      }
    } catch (e) {
      console.error('获取缓存的优惠券详情失败', e);
    }
    
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 领取优惠券
 * @param {string|number} couponId - 优惠券ID
 * @returns {Promise<boolean>} 是否领取成功
 */
const receiveCoupon = async (couponId) => {
  try {
    // 验证优惠券ID
    if (!validator.isValidCouponId(couponId)) {
      showToast('无效的优惠券ID', { icon: 'none' });
      return false;
    }
    
    showLoading('领取优惠券中...');

    const result = await retryRequest(() => api.post(`/api/coupons/${couponId}/receive`));

    if (result.code === 200) {
      showToast('优惠券领取成功', { icon: 'success' });
      // 清除可用优惠券缓存
      await removeCache(CACHE_KEYS.USER_COUPONS_AVAILABLE);
      return true;
    } else {
      throw new Error(result.message || '领取优惠券失败');
    }
  } catch (error) {
    console.error('领取优惠券失败', error);
    showToast(error.message || '领取优惠券失败，请稍后重试', { icon: 'none' });
    return false;
  } finally {
    hideLoading();
  }
};

/**
 * 验证优惠券是否可用
 * @param {string|number} couponId - 优惠券ID
 * @param {Object} params - 验证参数
 * @param {number} params.total_amount - 订单总金额
 * @param {Array} params.product_ids - 商品ID列表
 * @returns {Promise<Object>} 验证结果
 */
const validateCoupon = async (couponId, params = {}) => {
  try {
    const result = await api.post(`/api/coupons/${couponId}/validate`, {
      total_amount: params.total_amount || 0,
      product_ids: params.product_ids || []
    });

    if (result.code === 200) {
      return {
        valid: result.valid,
        message: result.message || '',
        discount: result.discount || 0
      };
    } else {
      return {
        valid: false,
        message: result.message || '优惠券验证失败',
        discount: 0
      };
    }
  } catch (error) {
    console.error('验证优惠券失败', error);
    return {
      valid: false,
      message: '优惠券验证失败',
      discount: 0
    };
  }
};

/**
 * 计算优惠券折扣金额
 * @param {Object} coupon - 优惠券信息
 * @param {number} totalAmount - 总金额
 * @returns {number} 折扣金额
 */
const calculateDiscount = (coupon, totalAmount) => {
  if (!coupon || totalAmount <= 0) {
    return 0;
  }

  // 根据优惠券类型计算折扣
  switch (coupon.type) {
    case 'cash':
      // 现金券直接抵扣固定金额
      return Math.min(coupon.value, totalAmount);
    case 'percent':
      // 折扣券按百分比计算，有最大折扣上限
      const maxDiscount = coupon.max_discount || totalAmount;
      const discount = totalAmount * (coupon.value / 100);
      return Math.min(discount, maxDiscount);
    default:
      return 0;
  }
};

/**
 * 获取优惠券类型文本
 * @param {string} type - 优惠券类型
 * @returns {string} 优惠券类型文本
 */
const getCouponTypeText = (type) => {
  const typeMap = {
    'cash': '现金券',
    'percent': '折扣券',
    'shipping': '运费券'
  };
  
  return typeMap[type] || '优惠券';
};

/**
 * 格式化优惠券过期时间
 * @param {string|number} expireTime - 过期时间戳或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
const formatExpireTime = (expireTime) => {
  if (!expireTime) return '';
  
  const date = new Date(expireTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

// 导出所有函数
module.exports = {
  getAvailableCoupons,
  getUserCoupons,
  getCouponDetail,
  receiveCoupon,
  validateCoupon,
  calculateDiscount,
  getCouponTypeText,
  formatExpireTime
};
