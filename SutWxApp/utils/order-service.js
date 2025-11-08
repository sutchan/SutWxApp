// order-service.js - 璁㈠崟鐩稿叧鏈嶅姟妯″潡
// 澶勭悊璁㈠崟鐨勫垱寤恒€佹煡璇€佹敮浠樸€佸彇娑堢瓑鍔熻兘

import api from './api';
import { showToast, showLoading, hideLoading, setStorage, getStorage, removeStorage } from './global';

// 缂撳瓨閿父閲忓畾涔?const CACHE_KEYS = {
  // 璁㈠崟鍒楄〃缂撳瓨
  ORDER_LIST: 'order_list_',
  // 璁㈠崟璇︽儏缂撳瓨
  ORDER_DETAIL: 'order_detail_',
  // 璁㈠崟缁熻缂撳瓨
  ORDER_STATS: 'order_stats',
  // 璁㈠崟鐗╂祦淇℃伅缂撳瓨
  ORDER_TRACKING: 'order_tracking_',
  // 鏀粯鐘舵€佺紦瀛?  PAYMENT_STATUS: 'payment_status_'
};

// 缂撳瓨鏃堕棿甯搁噺锛堟绉掞級
const CACHE_DURATION = {
  // 鐭湡缂撳瓨锛?鍒嗛挓
  SHORT: 3 * 60 * 1000,
  // 涓湡缂撳瓨锛?0鍒嗛挓
  MEDIUM: 10 * 60 * 1000,
  // 闀挎湡缂撳瓨锛?0鍒嗛挓
  LONG: 30 * 60 * 1000
};

/**
 * 缂撳瓨绠＄悊鍣?- 璁剧疆缂撳瓨
 * @param {string} key - 缂撳瓨閿? * @param {*} data - 缂撳瓨鏁版嵁
 * @param {number} duration - 缂撳瓨鏃堕棿锛堟绉掞級
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
 * 缂撳瓨绠＄悊鍣?- 鑾峰彇缂撳瓨
 * @param {string} key - 缂撳瓨閿? * @returns {*} - 缂撳瓨鏁版嵁鎴杗ull
 */
const getCache = (key) => {
  try {
    const cacheData = getStorage(key);
    if (cacheData && cacheData.expire > Date.now()) {
      return cacheData.data;
    }
    // 缂撳瓨杩囨湡锛屾竻闄?    removeStorage(key);
    return null;
  } catch (error) {
    console.error('鑾峰彇缂撳瓨澶辫触:', error);
    return null;
  }
};

/**
 * 缂撳瓨绠＄悊鍣?- 绉婚櫎缂撳瓨
 * @param {string} key - 缂撳瓨閿? */
const removeCache = (key) => {
  try {
    removeStorage(key);
  } catch (error) {
    console.error('绉婚櫎缂撳瓨澶辫触:', error);
  }
};

/**
 * 璇锋眰閲嶈瘯鏈哄埗
 * @param {Function} fn - 璇锋眰鍑芥暟
 * @param {number} maxRetries - 鏈€澶ч噸璇曟鏁? * @returns {Promise} - 杩斿洖Promise瀵硅薄
 */
const retryRequest = async (fn, maxRetries = 2) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 鍙缃戠粶閿欒鍜屾湇鍔″櫒閿欒杩涜閲嶈瘯
      if (i < maxRetries && (error.statusCode >= 500 || !error.statusCode)) {
        // 鎸囨暟閫€閬跨瓥鐣?        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
};

/**
 * 鏁版嵁楠岃瘉宸ュ叿
 */
const validator = {
  // 楠岃瘉璁㈠崟ID
  isValidOrderId: (id) => {
    return id && (typeof id === 'string' || typeof id === 'number');
  },
  // 楠岃瘉椤电爜鍙傛暟
  isValidPage: (page) => {
    return typeof page === 'number' && page > 0;
  },
  // 楠岃瘉璁㈠崟鏁版嵁
  isValidOrderData: (data) => {
    return data && 
           Array.isArray(data.items) && 
           data.items.length > 0 && 
           data.address && 
           data.payment_method;
  }
};

/**
 * 娓呴櫎璁㈠崟鐩稿叧缂撳瓨
 * @param {string|number} orderId - 鍙€夛紝鎸囧畾璁㈠崟ID
 */
const clearOrderCache = (orderId) => {
  try {
    // 娓呴櫎璁㈠崟缁熻缂撳瓨
    removeCache(CACHE_KEYS.ORDER_STATS);
    
    // 濡傛灉鎸囧畾浜嗚鍗旾D锛屾竻闄ょ壒瀹氳鍗曠紦瀛?    if (orderId) {
      removeCache(`${CACHE_KEYS.ORDER_DETAIL}${orderId}`);
      removeCache(`${CACHE_KEYS.ORDER_TRACKING}${orderId}`);
      removeCache(`${CACHE_KEYS.PAYMENT_STATUS}${orderId}`);
    }
    
    // 娓呴櫎鎵€鏈夎鍗曞垪琛ㄧ紦瀛橈紙绠€鍗曞疄鐜帮紝瀹為檯鍙兘闇€瑕佹洿绮剧‘鐨勬竻闄わ級
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.ORDER_LIST)) {
        removeStorage(key);
      }
    });
  } catch (error) {
    console.error('娓呴櫎璁㈠崟缂撳瓨澶辫触:', error);
  }
};

/**
 * 鍒涘缓璁㈠崟
 * @param {Object} orderData - 璁㈠崟鏁版嵁
 * @param {Array} orderData.items - 璁㈠崟鍟嗗搧鍒楄〃
 * @param {Object} orderData.address - 鏀惰揣鍦板潃
 * @param {string} orderData.payment_method - 鏀粯鏂瑰紡
 * @param {string} orderData.remark - 璁㈠崟澶囨敞
 * @returns {Promise<Object>} - 杩斿洖鍒涘缓鐨勮鍗曚俊鎭? */
export const createOrder = async (orderData) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderData(orderData)) {
      throw new Error('璁㈠崟鏁版嵁鏍煎紡涓嶆纭?);
    }
    
    showLoading('鍒涘缓璁㈠崟涓?..');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post('/orders/create', orderData)
    );
    
    hideLoading();
    
    if (result.code === 200 && result.order) {
      // 鍒涘缓鎴愬姛鍚庢竻闄よ鍗曠浉鍏崇紦瀛?      clearOrderCache();
      return result.order;
    } else {
      throw new Error(result.message || '鍒涘缓璁㈠崟澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鍒涘缓璁㈠崟澶辫触:', error);
    showToast(error.message || '鍒涘缓璁㈠崟澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鑾峰彇璁㈠崟鍒楄〃
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.pageSize - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {string} params.status - 璁㈠崟鐘舵€侊紙鍙€夛級
 * @returns {Promise<Object>} - 杩斿洖璁㈠崟鍒楄〃鏁版嵁
 */
export const getOrders = async (params = {}) => {
  try {
    const requestParams = {
      page: validator.isValidPage(params.page) ? params.page : 1,
      page_size: params.pageSize || 10,
      status: params.status || ''
    };
    
    // 鏋勫缓缂撳瓨閿?    const cacheKey = `${CACHE_KEYS.ORDER_LIST}${requestParams.page}_${requestParams.page_size}_${requestParams.status}`;
    
    // 灏濊瘯鑾峰彇缂撳瓨锛屼粎瀵圭涓€椤典娇鐢ㄧ紦瀛?    if (requestParams.page === 1) {
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.get('/orders', { params: requestParams })
    );
    
    // 缂撳瓨绗竴椤垫暟鎹?    if (requestParams.page === 1) {
      setCache(cacheKey, result, CACHE_DURATION.SHORT);
    }
    
    return result;
  } catch (error) {
    console.error('鑾峰彇璁㈠崟鍒楄〃澶辫触:', error);
    
    // 濡傛灉鏄涓€椤典笖鏈夌紦瀛橈紝杩斿洖缂撳瓨鏁版嵁
    if ((params.page === 1 || !params.page) && params.pageSize === undefined) {
      const cacheKey = `${CACHE_KEYS.ORDER_LIST}1_10_${params.status || ''}`;
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鐨勮鍗曞垪琛ㄦ暟鎹?);
        return cachedData;
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇璁㈠崟璇︽儏
 * @param {number|string} orderId - 璁㈠崟ID
 * @returns {Promise<Object>} - 杩斿洖璁㈠崟璇︽儏鏁版嵁
 */
export const getOrderDetail = async (orderId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    // 鏋勫缓缂撳瓨閿?    const cacheKey = `${CACHE_KEYS.ORDER_DETAIL}${orderId}`;
    
    // 灏濊瘯鑾峰彇缂撳瓨
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.get(`/orders/${orderId}`)
    );
    
    if (result.code === 200 && result.order) {
      // 缂撳瓨璁㈠崟璇︽儏
      setCache(cacheKey, result.order, CACHE_DURATION.MEDIUM);
      return result.order;
    } else {
      throw new Error(result.message || '鑾峰彇璁㈠崟璇︽儏澶辫触');
    }
  } catch (error) {
    console.error('鑾峰彇璁㈠崟璇︽儏澶辫触:', error);
    
    // 灏濊瘯杩斿洖缂撳瓨鏁版嵁
    const cacheKey = `${CACHE_KEYS.ORDER_DETAIL}${orderId}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('浣跨敤缂撳瓨鐨勮鍗曡鎯呮暟鎹?);
      return cachedData;
    }
    
    throw error;
  }
};

/**
 * 鍙栨秷璁㈠崟
 * @param {number|string} orderId - 璁㈠崟ID
 * @param {string} reason - 鍙栨秷鍘熷洜
 * @returns {Promise<Object>} - 杩斿洖鍙栨秷缁撴灉
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    showLoading('鍙栨秷璁㈠崟涓?..');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/cancel`, {
        reason: reason
      })
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 娓呴櫎鐩稿叧缂撳瓨
      clearOrderCache(orderId);
      showToast('璁㈠崟宸插彇娑?, { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '鍙栨秷璁㈠崟澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鍙栨秷璁㈠崟澶辫触:', error);
    showToast(error.message || '鍙栨秷璁㈠崟澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 纭鏀惰揣
 * @param {number|string} orderId - 璁㈠崟ID
 * @returns {Promise<Object>} - 杩斿洖纭缁撴灉
 */
export const confirmReceipt = async (orderId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    showLoading('纭鏀惰揣涓?..');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/confirm`)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 娓呴櫎鐩稿叧缂撳瓨
      clearOrderCache(orderId);
      showToast('鏀惰揣鎴愬姛', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '纭鏀惰揣澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('纭鏀惰揣澶辫触:', error);
    showToast(error.message || '纭鏀惰揣澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鑾峰彇璁㈠崟鏀粯淇℃伅
 * @param {number|string} orderId - 璁㈠崟ID
 * @param {string} paymentMethod - 鏀粯鏂瑰紡
 * @returns {Promise<Object>} - 杩斿洖鏀粯淇℃伅
 */
export const getPaymentInfo = async (orderId, paymentMethod) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      throw new Error('鏀粯鏂瑰紡涓嶈兘涓虹┖');
    }
    
    showLoading('鑾峰彇鏀粯淇℃伅...');
    
    // 浣跨敤閲嶈瘯鏈哄埗
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
      throw new Error(result.message || '鑾峰彇鏀粯淇℃伅澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鑾峰彇鏀粯淇℃伅澶辫触:', error);
    showToast(error.message || '鑾峰彇鏀粯淇℃伅澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鏌ヨ璁㈠崟鏀粯鐘舵€? * @param {number|string} orderId - 璁㈠崟ID
 * @returns {Promise<boolean>} - 鏄惁宸叉敮浠? */
export const checkPaymentStatus = async (orderId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    // 鏋勫缓缂撳瓨閿?    const cacheKey = `${CACHE_KEYS.PAYMENT_STATUS}${orderId}`;
    
    // 灏濊瘯鑾峰彇缂撳瓨锛堟敮浠樼姸鎬佺紦瀛樻椂闂磋緝鐭級
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.get(`/orders/${orderId}/payment-status`)
    );
    
    const isPaid = result.paid || false;
    
    // 缂撳瓨鏀粯鐘舵€侊紝浣跨敤杈冪煭鐨勭紦瀛樻椂闂?    setCache(cacheKey, isPaid, 30000); // 30绉?    
    return isPaid;
  } catch (error) {
    console.error('鏌ヨ鏀粯鐘舵€佸け璐?', error);
    return false;
  }
};

/**
 * 鐢宠閫€娆? * @param {number|string} orderId - 璁㈠崟ID
 * @param {Object} refundData - 閫€娆句俊鎭? * @param {string} refundData.reason - 閫€娆惧師鍥? * @param {string} refundData.description - 閫€娆捐鏄? * @param {Array} refundData.images - 閫€娆惧嚟璇佸浘鐗? * @returns {Promise<Object>} - 杩斿洖閫€娆剧敵璇风粨鏋? */
export const applyRefund = async (orderId, refundData) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    if (!refundData || !refundData.reason) {
      throw new Error('閫€娆惧師鍥犱笉鑳戒负绌?);
    }
    
    showLoading('鎻愪氦閫€娆剧敵璇?..');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/refund`, refundData)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 娓呴櫎鐩稿叧缂撳瓨
      clearOrderCache(orderId);
      showToast('閫€娆剧敵璇峰凡鎻愪氦', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '鎻愪氦閫€娆剧敵璇峰け璐?);
    }
  } catch (error) {
    hideLoading();
    console.error('鐢宠閫€娆惧け璐?', error);
    showToast(error.message || '鐢宠閫€娆惧け璐ワ紝璇烽噸璇?, { icon: 'none' });
    throw error;
  }
};

/**
 * 鑾峰彇璁㈠崟鐘舵€佺粺璁? * @returns {Promise<Object>} - 杩斿洖鍚勭姸鎬佽鍗曟暟閲? */
export const getOrderStats = async () => {
  try {
    // 灏濊瘯鑾峰彇缂撳瓨
    const cachedData = getCache(CACHE_KEYS.ORDER_STATS);
    if (cachedData) {
      return cachedData;
    }
    
    // 浣跨敤閲嶈瘯鏈哄埗
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
    
    // 缂撳瓨缁熻鏁版嵁
    setCache(CACHE_KEYS.ORDER_STATS, stats, CACHE_DURATION.MEDIUM);
    
    return stats;
  } catch (error) {
    console.error('鑾峰彇璁㈠崟缁熻澶辫触:', error);
    
    // 灏濊瘯杩斿洖缂撳瓨鏁版嵁
    const cachedData = getCache(CACHE_KEYS.ORDER_STATS);
    if (cachedData) {
      console.log('浣跨敤缂撳瓨鐨勮鍗曠粺璁℃暟鎹?);
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
 * 鐢宠鍙戠エ
 * @param {number|string} orderId - 璁㈠崟ID
 * @param {Object} invoiceData - 鍙戠エ淇℃伅
 * @returns {Promise<Object>} - 杩斿洖鐢宠缁撴灉
 */
export const applyInvoice = async (orderId, invoiceData) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    if (!invoiceData) {
      throw new Error('鍙戠エ淇℃伅涓嶈兘涓虹┖');
    }
    
    showLoading('鎻愪氦鍙戠エ鐢宠...');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/invoice`, invoiceData)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 娓呴櫎璁㈠崟璇︽儏缂撳瓨锛屽洜涓哄彂绁ㄤ俊鎭細鏇存柊璁㈠崟鐘舵€?      removeCache(`${CACHE_KEYS.ORDER_DETAIL}${orderId}`);
      showToast('鍙戠エ鐢宠宸叉彁浜?, { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '鎻愪氦鍙戠エ鐢宠澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鐢宠鍙戠エ澶辫触:', error);
    showToast(error.message || '鐢宠鍙戠エ澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鍐嶆璐拱璁㈠崟鍟嗗搧
 * @param {number|string} orderId - 璁㈠崟ID
 * @returns {Promise<boolean>} - 鏄惁娣诲姞鎴愬姛
 */
export const buyAgain = async (orderId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    showLoading('娣诲姞鍒拌喘鐗╄溅...');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/buy-again`)
    );
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('宸叉坊鍔犲埌璐墿杞?, { icon: 'success' });
      return true;
    } else {
      throw new Error(result.message || '娣诲姞澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鍐嶆璐拱澶辫触:', error);
    showToast(error.message || '娣诲姞澶辫触锛岃閲嶈瘯', { icon: 'none' });
    return false;
  }
};

/**
 * 璇勪环璁㈠崟
 * @param {number|string} orderId - 璁㈠崟ID
 * @param {Array} ratings - 璇勪环鏁版嵁
 * @returns {Promise<Object>} - 杩斿洖璇勪环缁撴灉
 */
export const rateOrder = async (orderId, ratings) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    if (!Array.isArray(ratings) || ratings.length === 0) {
      throw new Error('璇勪环鏁版嵁涓嶈兘涓虹┖');
    }
    
    showLoading('鎻愪氦璇勪环...');
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.post(`/orders/${orderId}/rate`, {
        ratings: ratings
      })
    );
    
    hideLoading();
    
    if (result.code === 200) {
      // 娓呴櫎璁㈠崟璇︽儏缂撳瓨
      removeCache(`${CACHE_KEYS.ORDER_DETAIL}${orderId}`);
      showToast('璇勪环鎴愬姛', { icon: 'success' });
      return result;
    } else {
      throw new Error(result.message || '璇勪环澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('璇勪环璁㈠崟澶辫触:', error);
    showToast(error.message || '璇勪环澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鑾峰彇璁㈠崟鐗╂祦淇℃伅
 * @param {number|string} orderId - 璁㈠崟ID
 * @returns {Promise<Object>} - 杩斿洖鐗╂祦淇℃伅
 */
export const getOrderTracking = async (orderId) => {
  try {
    // 鏁版嵁楠岃瘉
    if (!validator.isValidOrderId(orderId)) {
      throw new Error('璁㈠崟ID鏍煎紡涓嶆纭?);
    }
    
    // 鏋勫缓缂撳瓨閿?    const cacheKey = `${CACHE_KEYS.ORDER_TRACKING}${orderId}`;
    
    // 灏濊瘯鑾峰彇缂撳瓨
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 浣跨敤閲嶈瘯鏈哄埗
    const result = await retryRequest(() => 
      api.get(`/orders/${orderId}/tracking`)
    );
    
    if (result.code === 200) {
      const tracking = result.tracking || {};
      // 缂撳瓨鐗╂祦淇℃伅
      setCache(cacheKey, tracking, CACHE_DURATION.MEDIUM);
      return tracking;
    } else {
      throw new Error(result.message || '鑾峰彇鐗╂祦淇℃伅澶辫触');
    }
  } catch (error) {
    console.error('鑾峰彇鐗╂祦淇℃伅澶辫触:', error);
    
    // 灏濊瘯杩斿洖缂撳瓨鏁版嵁
    const cacheKey = `${CACHE_KEYS.ORDER_TRACKING}${orderId}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('浣跨敤缂撳瓨鐨勭墿娴佷俊鎭?);
      return cachedData;
    }
    
    throw error;
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
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
};\n