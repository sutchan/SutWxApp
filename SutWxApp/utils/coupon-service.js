// coupon-service.js - 浼樻儬鍒哥浉鍏虫湇鍔℃ā鍧?// 澶勭悊浼樻儬鍒哥殑鏌ヨ銆侀鍙栥€佷娇鐢ㄧ瓑鍔熻兘

import api from './api';
import { showToast, showLoading, hideLoading, setStorage, getStorage } from './global';

// 缂撳瓨閿父閲忓畾涔?const CACHE_KEYS = {
  USER_COUPONS_AVAILABLE: 'user_coupons_available',
  USER_COUPONS_USED: 'user_coupons_used',
  USER_COUPONS_EXPIRED: 'user_coupons_expired',
  COUPON_DETAIL_PREFIX: 'coupon_detail_',
  VALIDATE_RESULT_PREFIX: 'coupon_validate_' 
};

// 缂撳瓨鎸佺画鏃堕棿甯搁噺锛堟绉掞級
const CACHE_DURATION = {
  HIGH_FREQUENCY: 30000, // 30绉?  SHORT: 60000, // 1鍒嗛挓
  MEDIUM: 300000, // 5鍒嗛挓
  LONG: 1800000, // 30鍒嗛挓
  ALL_DAY: 86400000 // 1澶?};

/**
 * 璁剧疆缂撳瓨
 * @param {string} key - 缂撳瓨閿? * @param {*} data - 缂撳瓨鏁版嵁
 * @param {number} expireTime - 杩囨湡鏃堕棿锛堟绉掞級
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
 * 鑾峰彇缂撳瓨
 * @param {string} key - 缂撳瓨閿? * @returns {Promise<any>} - 缂撳瓨鏁版嵁锛屽鏋滆繃鏈熸垨涓嶅瓨鍦ㄥ垯杩斿洖null
 */
const getCache = async (key) => {
  try {
    const cacheStr = await getStorage(key);
    if (!cacheStr) return null;
    
    const cacheData = JSON.parse(cacheStr);
    // 妫€鏌ユ槸鍚﹁繃鏈?    if (Date.now() > cacheData.expireTime) {
      // 杩囨湡鍒欐竻闄ょ紦瀛?      await setStorage(key, '');
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.error('鑾峰彇缂撳瓨澶辫触:', error);
    return null;
  }
};

/**
 * 绉婚櫎缂撳瓨
 * @param {string} key - 缂撳瓨閿? * @returns {Promise<void>}
 */
const removeCache = async (key) => {
  await setStorage(key, '');
};

/**
 * 娓呴櫎浼樻儬鍒哥浉鍏崇紦瀛? * @param {string} status - 鍙€夛紝鐗瑰畾鐘舵€佺殑浼樻儬鍒哥紦瀛橈紙available, used, expired锛? * @returns {Promise<void>}
 */
const clearCouponCache = async (status = null) => {
  if (status) {
    // 娓呴櫎鐗瑰畾鐘舵€佺殑浼樻儬鍒哥紦瀛?    await removeCache(CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`]);
  } else {
    // 娓呴櫎鎵€鏈夌姸鎬佺殑浼樻儬鍒哥紦瀛?    await removeCache(CACHE_KEYS.USER_COUPONS_AVAILABLE);
    await removeCache(CACHE_KEYS.USER_COUPONS_USED);
    await removeCache(CACHE_KEYS.USER_COUPONS_EXPIRED);
  }
};

/**
 * 璇锋眰閲嶈瘯鍑芥暟
 * @param {Function} requestFn - 瑕佹墽琛岀殑璇锋眰鍑芥暟
 * @param {number} maxRetries - 鏈€澶ч噸璇曟鏁帮紝榛樿2娆? * @param {number} initialDelay - 鍒濆寤惰繜鏃堕棿锛堟绉掞級锛岄粯璁?000ms
 * @returns {Promise<any>} - 璇锋眰缁撴灉
 */
const retryRequest = async (requestFn, maxRetries = 2, initialDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 鏈€鍚庝竴娆″皾璇曞け璐ュ垯鐩存帴鎶涘嚭閿欒
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 鎸囨暟閫€閬跨瓥鐣?      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError; // 鐞嗚涓婁笉浼氭墽琛屽埌杩欓噷锛屼絾涓轰簡绫诲瀷瀹夊叏淇濈暀
};

/**
 * 鏁版嵁楠岃瘉宸ュ叿
 */
const validator = {
  /**
   * 楠岃瘉浼樻儬鍒窱D
   * @param {number|string} id - 浼樻儬鍒窱D
   * @returns {boolean} - 鏄惁鏈夋晥
   */
  isValidCouponId: (id) => {
    return id !== null && id !== undefined && typeof id !== 'object' && id.toString().trim() !== '';
  },
  
  /**
   * 楠岃瘉鍟嗗搧ID鏁扮粍
   * @param {Array} productIds - 鍟嗗搧ID鏁扮粍
   * @returns {boolean} - 鏄惁鏈夋晥
   */
  isValidProductIds: (productIds) => {
    return Array.isArray(productIds) && productIds.every(id => id !== null && id !== undefined);
  },
  
  /**
   * 楠岃瘉閲戦
   * @param {number} amount - 閲戦
   * @returns {boolean} - 鏄惁鏈夋晥
   */
  isValidAmount: (amount) => {
    return typeof amount === 'number' && amount >= 0 && !isNaN(amount);
  },
  
  /**
   * 楠岃瘉浼樻儬鍒哥姸鎬?   * @param {string} status - 浼樻儬鍒哥姸鎬?   * @returns {boolean} - 鏄惁鏈夋晥
   */
  isValidCouponStatus: (status) => {
    return ['available', 'used', 'expired'].includes(status);
  }
};

/**
 * 鏄剧ず纭瀵硅瘽妗? * @param {string} message - 纭娑堟伅
 * @param {string} confirmText - 纭鎸夐挳鏂囧瓧
 * @param {string} cancelText - 鍙栨秷鎸夐挳鏂囧瓧
 * @returns {Promise<void>} - 纭鍒檙esolve锛屽彇娑堝垯reject
 */
const showConfirm = (message, confirmText = '纭畾', cancelText = '鍙栨秷') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '鎻愮ず',
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
 * 鑾峰彇鍙敤浼樻儬鍒稿垪琛? * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.total_amount - 璁㈠崟鎬婚噾棰濓紙鐢ㄤ簬绛涢€夊彲鐢ㄤ紭鎯犲埜锛? * @param {Array} params.product_ids - 鍟嗗搧ID鍒楄〃锛堢敤浜庣瓫閫夊彲鐢ㄤ紭鎯犲埜锛? * @returns {Promise<Array>} - 杩斿洖鍙敤浼樻儬鍒稿垪琛? */
export const getAvailableCoupons = async (params = {}) => {
  try {
    // 鏁版嵁楠岃瘉
    if (params.total_amount && !validator.isValidAmount(params.total_amount)) {
      throw new Error('鏃犳晥鐨勮鍗曢噾棰?);
    }
    
    if (params.product_ids && !validator.isValidProductIds(params.product_ids)) {
      throw new Error('鏃犳晥鐨勫晢鍝両D鍒楄〃');
    }
    
    // 鏋勫缓缂撳瓨閿?    const cacheKey = `${CACHE_KEYS.USER_COUPONS_AVAILABLE}_${params.total_amount || 0}_${params.product_ids?.join('_') || 'all'}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('鑾峰彇鍙敤浼樻儬鍒?..');
    const requestParams = {
      total_amount: params.total_amount || 0,
      product_ids: params.product_ids || [],
      status: 'available'
    };
    
    const result = await retryRequest(() => api.get('/coupons', { params: requestParams }));
    const coupons = result.coupons || [];
    
    // 璁剧疆缂撳瓨锛屾湁鏁堟湡閫備腑锛屽洜涓哄彲鐢ㄤ紭鎯犲埜鐘舵€佸彲鑳戒細鍙樺寲
    await setCache(cacheKey, coupons, CACHE_DURATION.SHORT);
    
    return coupons;
  } catch (error) {
    console.error('鑾峰彇鍙敤浼樻儬鍒稿け璐?', error);
    // 缃戠粶寮傚父鏃讹紝灏濊瘯鑾峰彇鍩烘湰鍙敤浼樻儬鍒哥殑缂撳瓨
    if (error && error.message?.includes('network')) {
      const basicCacheKey = `${CACHE_KEYS.USER_COUPONS_AVAILABLE}_0_all`;
      const basicCachedData = await getCache(basicCacheKey);
      if (basicCachedData) {
        console.log('浣跨敤缂撳瓨鐨勫彲鐢ㄤ紭鎯犲埜鏁版嵁');
        return basicCachedData;
      }
    }
    return [];
  } finally {
    hideLoading();
  }
};

/**
 * 鑾峰彇鐢ㄦ埛鎵€鏈変紭鎯犲埜
 * @param {string} status - 浼樻儬鍒哥姸鎬侊紙鍙€夛細available, used, expired锛? * @returns {Promise<Array>} - 杩斿洖浼樻儬鍒稿垪琛? */
export const getUserCoupons = async (status = 'available') => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidCouponStatus(status)) {
      throw new Error('鏃犳晥鐨勪紭鎯犲埜鐘舵€?);
    }
    
    // 鑾峰彇瀵瑰簲鐨勭紦瀛橀敭
    const cacheKey = CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`];
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('鑾峰彇浼樻儬鍒?..');
    const result = await retryRequest(() => api.get('/coupons/user', {
      params: { status: status }
    }));
    
    const coupons = result.coupons || [];
    
    // 鏍规嵁鐘舵€佽缃笉鍚岀殑缂撳瓨鏃堕棿
    let cacheDuration;
    switch (status) {
      case 'available':
        // 鍙敤浼樻儬鍒稿彲鑳界粡甯稿彉鍖栵紝缂撳瓨鏃堕棿杈冪煭
        cacheDuration = CACHE_DURATION.SHORT;
        break;
      case 'used':
        // 宸蹭娇鐢ㄤ紭鎯犲埜鍙樺寲涓嶉绻侊紝缂撳瓨鏃堕棿杈冮暱
        cacheDuration = CACHE_DURATION.MEDIUM;
        break;
      case 'expired':
        // 杩囨湡浼樻儬鍒稿彉鍖栦笉棰戠箒锛岀紦瀛樻椂闂磋緝闀?        cacheDuration = CACHE_DURATION.MEDIUM;
        break;
      default:
        cacheDuration = CACHE_DURATION.SHORT;
    }
    
    // 璁剧疆缂撳瓨
    await setCache(cacheKey, coupons, cacheDuration);
    
    return coupons;
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛浼樻儬鍒稿け璐?', error);
    // 缃戠粶寮傚父鏃讹紝灏濊瘯浣跨敤缂撳瓨鏁版嵁
    const cacheKey = CACHE_KEYS[`USER_COUPONS_${status.toUpperCase()}`];
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`浣跨敤缂撳瓨鐨?{status}浼樻儬鍒告暟鎹甡);
      return cachedData;
    }
    return [];
  } finally {
    hideLoading();
  }
};

/**
 * 鑾峰彇浼樻儬鍒歌鎯? * @param {number|string} couponId - 浼樻儬鍒窱D
 * @returns {Promise<Object>} - 杩斿洖浼樻儬鍒歌鎯? */
export const getCouponDetail = async (couponId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidCouponId(couponId)) {
      throw new Error('鏃犳晥鐨勪紭鎯犲埜ID');
    }
    
    // 鏋勫缓缂撳瓨閿?    const cacheKey = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${couponId}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    showLoading('鑾峰彇浼樻儬鍒歌鎯?..');
    const result = await retryRequest(() => api.get(`/coupons/${couponId}`));
    
    if (result.code === 200 && result.coupon) {
      // 璁剧疆缂撳瓨锛屼紭鎯犲埜璇︽儏鍙樺寲涓嶉绻侊紝缂撳瓨鏃堕棿鍙互闀夸竴浜?      await setCache(cacheKey, result.coupon, CACHE_DURATION.LONG);
      return result.coupon;
    } else {
      throw new Error(result.message || '鑾峰彇浼樻儬鍒歌鎯呭け璐?);
    }
  } catch (error) {
    console.error('鑾峰彇浼樻儬鍒歌鎯呭け璐?', error);
    // 缃戠粶寮傚父鏃讹紝灏濊瘯浣跨敤缂撳瓨鏁版嵁
    if (error && error.message?.includes('network')) {
      const cacheKey = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${couponId}`;
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        console.log(`浣跨敤缂撳瓨鐨勪紭鎯犲埜璇︽儏鏁版嵁`);
        return cachedData;
      }
    }
    throw error;
  } finally {
    hideLoading();
  }
};

/**
 * 棰嗗彇浼樻儬鍒? * @param {number|string} couponId - 浼樻儬鍒窱D
 * @returns {Promise<boolean>} - 鏄惁棰嗗彇鎴愬姛
 */
export const receiveCoupon = async (couponId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidCouponId(couponId)) {
      showToast('鏃犳晥鐨勪紭鎯犲埜ID', { icon: 'none' });
      return false;
    }
    
    showLoading('棰嗗彇浼樻儬鍒?..');
    
    const result = await retryRequest(() => api.post(`/coupons/${couponId}/receive`));
    
    if (result.code === 200) {
      showToast('浼樻儬鍒搁鍙栨垚鍔?, { icon: 'success' });
      // 娓呴櫎鐩稿叧缂撳瓨
      await clearCouponCache('available');
      return true;
    } else {
      throw new Error(result.message || '棰嗗彇浼樻儬鍒稿け璐?);
    }
  } catch (error) {
    console.error('棰嗗彇浼樻儬鍒稿け璐?', error);
    showToast(error.message || '棰嗗彇浼樻儬鍒稿け璐ワ紝璇烽噸璇?, { icon: 'none' });
    return false;
  } finally {
    hideLoading();
  }
};

/**
 * 楠岃瘉浼樻儬鍒告槸鍚﹀彲鐢? * @param {number|string} couponId - 浼樻儬鍒窱D
 * @param {Object} params - 楠岃瘉鍙傛暟
 * @param {number} params.total_amount - 璁㈠崟鎬婚噾棰? * @param {Array} params.product_ids - 鍟嗗搧ID鍒楄〃
 * @returns {Promise<Object>} - 楠岃瘉缁撴灉 { valid: boolean, message: string, discount: number }
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
        message: result.message || '浼樻儬鍒搁獙璇佸け璐?,
        discount: 0
      };
    }
  } catch (error) {
    console.error('楠岃瘉浼樻儬鍒稿け璐?', error);
    return {
      valid: false,
      message: '浼樻儬鍒搁獙璇佸け璐?,
      discount: 0
    };
  }
};

/**
 * 璁＄畻浼樻儬鍒告姌鎵ｉ噾棰? * @param {Object} coupon - 浼樻儬鍒镐俊鎭? * @param {number} totalAmount - 璁㈠崟鎬婚噾棰? * @returns {number} - 鎶樻墸閲戦
 */
export const calculateDiscount = (coupon, totalAmount) => {
  if (!coupon || totalAmount <= 0) {
    return 0;
  }
  
  // 鏍规嵁浼樻儬鍒哥被鍨嬭绠楁姌鎵?  switch (coupon.type) {
    case 'cash':
      // 鐜伴噾鍒革細鐩存帴鎶垫墸鍥哄畾閲戦
      return Math.min(coupon.value, totalAmount);
    case 'percent':
      // 鎶樻墸鍒革細鎸夋瘮渚嬫姌鎵?      const maxDiscount = coupon.max_discount || totalAmount;
      const discount = totalAmount * (coupon.value / 100);
      return Math.min(discount, maxDiscount);
    default:
      return 0;
  }
};

/**
 * 鑾峰彇浼樻儬鍒哥被鍨嬫枃鏈? * @param {string} type - 浼樻儬鍒哥被鍨? * @returns {string} - 绫诲瀷鏂囨湰
 */
export const getCouponTypeText = (type) => {
  const typeMap = {
    'cash': '鐜伴噾鍒?,
    'percent': '鎶樻墸鍒?,
    'shipping': '杩愯垂鍒?
  };
  
  return typeMap[type] || '浼樻儬鍒?;
};

/**
 * 鏍煎紡鍖栦紭鎯犲埜杩囨湡鏃堕棿
 * @param {string} expireTime - 杩囨湡鏃堕棿
 * @returns {string} - 鏍煎紡鍖栧悗鐨勬椂闂? */
export const formatExpireTime = (expireTime) => {
  if (!expireTime) return '';
  
  const date = new Date(expireTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getAvailableCoupons,
  getUserCoupons,
  getCouponDetail,
  receiveCoupon,
  validateCoupon,
  calculateDiscount,
  getCouponTypeText,
  formatExpireTime
};