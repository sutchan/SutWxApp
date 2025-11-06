// coupon-service.js - 优惠券相关服务模块
// 处理优惠券的查询、领取、使用等功能

import api from './api';
import { showToast, showLoading, hideLoading, setStorage, getStorage } from './global';

// 缓存键常量定义
const CACHE_KEYS = {
  USER_COUPONS_AVAILABLE: 'user_coupons_available',
  USER_COUPONS_USED: 'user_coupons_used',
  USER_COUPONS_EXPIRED: 'user_coupons_expired',
  COUPON_DETAIL_PREFIX: 'coupon_detail_',
  VALIDATE_RESULT_PREFIX: 'coupon_validate_' 
};

// 缓存持续时间常量（毫秒）
const CACHE_DURATION = {
  HIGH_FREQUENCY: 30000, // 30秒
  SHORT: 60000, // 1分钟
  MEDIUM: 300000, // 5分钟
  LONG: 1800000, // 30分钟
  ALL_DAY: 86400000 // 1天
};

/**
 * 设置缓存
 * @param {string} key - 缓存键
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
 * @param {string} key - 缓存键
 * @returns {Promise<any>} - 缓存数据，如果过期或不存在则返回null
 */
const getCache = async (key) => {
  try {
    const cacheStr = await getStorage(key);
    if (!cacheStr) return null;
    
    const cacheData = JSON.parse(cacheStr);
    // 检查是否过期
    if (Date.now() > cacheData.expireTime) {
      // 过期则清除缓存
      await setStorage(key, '');
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.error('获取缓存失败:', error);
    return null;
  }
};

/**
 * 移除缓存
 * @param {string} key - 缓存键
 * @returns {Promise<void>}
 */
const removeCache = async (key) => {
  await setStorage(key, '');
};

/**
 * 清除优惠券相关缓存
 * @param {string} status - 可选，特定状态的优惠券缓存（available, used, expired）
 * @returns {Promise<void>}
 */
const clearCouponCache = async (status = null) => {
  if (status) {
    // 清除特定状态的优惠券缓存
    await removeCache(CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`]);
  } else {
    // 清除所有状态的优惠券缓存
    await removeCache(CACHE_KEYS.USER_COUPONS_AVAILABLE);
    await removeCache(CACHE_KEYS.USER_COUPONS_USED);
    await removeCache(CACHE_KEYS.USER_COUPONS_EXPIRED);
  }
};

/**
 * 请求重试函数
 * @param {Function} requestFn - 要执行的请求函数
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
      
      // 最后一次尝试失败则直接抛出错误
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 指数退避策略
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError; // 理论上不会执行到这里，但为了类型安全保留
};

/**
 * 数据验证工具
 */
const validator = {
  /**
   * 验证优惠券ID
   * @param {number|string} id - 优惠券ID
   * @returns {boolean} - 是否有效
   */
  isValidCouponId: (id) => {
    return id !== null && id !== undefined && typeof id !== 'object' && id.toString().trim() !== '';
  },
  
  /**
   * 验证商品ID数组
   * @param {Array} productIds - 商品ID数组
   * @returns {boolean} - 是否有效
   */
  isValidProductIds: (productIds) => {
    return Array.isArray(productIds) && productIds.every(id => id !== null && id !== undefined);
  },
  
  /**
   * 验证金额
   * @param {number} amount - 金额
   * @returns {boolean} - 是否有效
   */
  isValidAmount: (amount) => {
    return typeof amount === 'number' && amount >= 0 && !isNaN(amount);
  },
  
  /**
   * 验证优惠券状态
   * @param {string} status - 优惠券状态
   * @returns {boolean} - 是否有效
   */
  isValidCouponStatus: (status) => {
    return ['available', 'used', 'expired'].includes(status);
  }
};

/**
 * 显示确认对话框
 * @param {string} message - 确认消息
 * @param {string} confirmText - 确认按钮文字
 * @param {string} cancelText - 取消按钮文字
 * @returns {Promise<void>} - 确认则resolve，取消则reject
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
          resolve();
        } else {
          reject(new Error('cancel'));
        }
      },
      fail: () => {
        reject(new Error('cancel'));
      }
    });
  });
};

/**
 * 获取可用优惠券列表
 * @param {Object} params - 查询参数
 * @param {number} params.total_amount - 订单总金额（用于筛选可用优惠券）
 * @param {Array} params.product_ids - 商品ID列表（用于筛选可用优惠券）
 * @returns {Promise<Array>} - 返回可用优惠券列表
 */
export const getAvailableCoupons = async (params = {}) => {
  try {
    // 数据验证
    if (params.total_amount && !validator.isValidAmount(params.total_amount)) {
      throw new Error('无效的订单金额');
    }
    
    if (params.product_ids && !validator.isValidProductIds(params.product_ids)) {
      throw new Error('无效的商品ID列表');
    }
    
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.USER_COUPONS_AVAILABLE}_${params.total_amount || 0}_${params.product_ids?.join('_') || 'all'}`;
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('获取可用优惠券...');
    const requestParams = {
      total_amount: params.total_amount || 0,
      product_ids: params.product_ids || [],
      status: 'available'
    };
    
    const result = await retryRequest(() => api.get('/coupons', { params: requestParams }));
    const coupons = result.coupons || [];
    
    // 设置缓存，有效期适中，因为可用优惠券状态可能会变化
    await setCache(cacheKey, coupons, CACHE_DURATION.SHORT);
    
    return coupons;
  } catch (error) {
    console.error('获取可用优惠券失败:', error);
    // 网络异常时，尝试获取基本可用优惠券的缓存
    if (error && error.message?.includes('network')) {
      const basicCacheKey = `${CACHE_KEYS.USER_COUPONS_AVAILABLE}_0_all`;
      const basicCachedData = await getCache(basicCacheKey);
      if (basicCachedData) {
        console.log('使用缓存的可用优惠券数据');
        return basicCachedData;
      }
    }
    return [];
  } finally {
    hideLoading();
  }
};

/**
 * 获取用户所有优惠券
 * @param {string} status - 优惠券状态（可选：available, used, expired）
 * @returns {Promise<Array>} - 返回优惠券列表
 */
export const getUserCoupons = async (status = 'available') => {
  try {
    // 数据验证
    if (!validator.isValidCouponStatus(status)) {
      throw new Error('无效的优惠券状态');
    }
    
    // 获取对应的缓存键
    const cacheKey = CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`];
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('获取优惠券...');
    const result = await retryRequest(() => api.get('/coupons/user', {
      params: { status: status }
    }));
    
    const coupons = result.coupons || [];
    
    // 根据状态设置不同的缓存时间
    let cacheDuration;
    switch (status) {
      case 'available':
        // 可用优惠券可能经常变化，缓存时间较短
        cacheDuration = CACHE_DURATION.SHORT;
        break;
      case 'used':
        // 已使用优惠券变化不频繁，缓存时间较长
        cacheDuration = CACHE_DURATION.MEDIUM;
        break;
      case 'expired':
        // 过期优惠券变化不频繁，缓存时间较长
        cacheDuration = CACHE_DURATION.MEDIUM;
        break;
      default:
        cacheDuration = CACHE_DURATION.SHORT;
    }
    
    // 设置缓存
    await setCache(cacheKey, coupons, cacheDuration);
    
    return coupons;
  } catch (error) {
    console.error('获取用户优惠券失败:', error);
    // 网络异常时，尝试使用缓存数据
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
 * @param {number|string} couponId - 优惠券ID
 * @returns {Promise<Object>} - 返回优惠券详情
 */
export const getCouponDetail = async (couponId) => {
  try {
    // 数据验证
    if (!validator.isValidCouponId(couponId)) {
      throw new Error('无效的优惠券ID');
    }
    
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${couponId}`;
    
    // 尝试从缓存获取
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('获取优惠券详情...');
    const result = await retryRequest(() => api.get(`/coupons/${couponId}`));
    
    if (result.code === 200 && result.coupon) {
      // 设置缓存，优惠券详情变化不频繁，缓存时间可以长一些
      await setCache(cacheKey, result.coupon, CACHE_DURATION.LONG);
      return result.coupon;
    } else {
      throw new Error(result.message || '获取优惠券详情失败');
    }
  } catch (error) {
    console.error('获取优惠券详情失败:', error);
    // 网络异常时，尝试使用缓存数据
    if (error && error.message?.includes('network')) {
      const cacheKey = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${couponId}`;
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`使用缓存的优惠券详情数据`);
        return cachedData;
      }
    }
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 领取优惠券
 * @param {number|string} couponId - 优惠券ID
 * @returns {Promise<boolean>} - 是否领取成功
 */
export const receiveCoupon = async (couponId) => {
  try {
    // 数据验证
    if (!validator.isValidCouponId(couponId)) {
      showToast('无效的优惠券ID', { icon: 'none' });
      return false;
    }
    
    showLoading('领取优惠券...');
    
    const result = await retryRequest(() => api.post(`/coupons/${couponId}/receive`));
    
    if (result.code === 200) {
      showToast('优惠券领取成功', { icon: 'success' });
      // 清除相关缓存
      await clearCouponCache('available');
      return true;
    } else {
      throw new Error(result.message || '领取优惠券失败');
    }
  } catch (error) {
    console.error('领取优惠券失败:', error);
    showToast(error.message || '领取优惠券失败，请重试', { icon: 'none' });
    return false;
  } finally {
    hideLoading();
  }
};

/**
 * 验证优惠券是否可用
 * @param {number|string} couponId - 优惠券ID
 * @param {Object} params - 验证参数
 * @param {number} params.total_amount - 订单总金额
 * @param {Array} params.product_ids - 商品ID列表
 * @returns {Promise<Object>} - 验证结果 { valid: boolean, message: string, discount: number }
 */
export const validateCoupon = async (couponId, params = {}) => {
  try {
    const result = await api.post(`/coupons/${couponId}/validate`, {
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
    console.error('验证优惠券失败:', error);
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
 * @param {number} totalAmount - 订单总金额
 * @returns {number} - 折扣金额
 */
export const calculateDiscount = (coupon, totalAmount) => {
  if (!coupon || totalAmount <= 0) {
    return 0;
  }
  
  // 根据优惠券类型计算折扣
  switch (coupon.type) {
    case 'cash':
      // 现金券：直接抵扣固定金额
      return Math.min(coupon.value, totalAmount);
    case 'percent':
      // 折扣券：按比例折扣
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
 * @returns {string} - 类型文本
 */
export const getCouponTypeText = (type) => {
  const typeMap = {
    'cash': '现金券',
    'percent': '折扣券',
    'shipping': '运费券'
  };
  
  return typeMap[type] || '优惠券';
};

/**
 * 格式化优惠券过期时间
 * @param {string} expireTime - 过期时间
 * @returns {string} - 格式化后的时间
 */
export const formatExpireTime = (expireTime) => {
  if (!expireTime) return '';
  
  const date = new Date(expireTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

// 导出所有方法
export default {
  getAvailableCoupons,
  getUserCoupons,
  getCouponDetail,
  receiveCoupon,
  validateCoupon,
  calculateDiscount,
  getCouponTypeText,
  formatExpireTime
};