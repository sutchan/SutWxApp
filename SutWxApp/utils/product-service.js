// product-service.js - 浜у搧鐩稿叧鏈嶅姟妯″潡
// 澶勭悊浜у搧鍒楄〃銆佷骇鍝佽鎯呯瓑鍔熻兘鐨凙PI璋冪敤

import api from './api';
import { showToast, getStorage, setStorage } from './global';

// 缂撳瓨閰嶇疆
const CACHE_DURATION = {
  PRODUCTS: 5 * 60 * 1000, // 5鍒嗛挓
  PRODUCT_DETAIL: 10 * 60 * 1000 // 10鍒嗛挓
};

/**
 * 鑾峰彇浜у搧鍒楄〃
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {number} params.category_id - 鍒嗙被ID锛屽彲閫? * @param {string} params.keyword - 鎼滅储鍏抽敭璇嶏紝鍙€? * @param {string} params.sort - 鎺掑簭鏂瑰紡锛岄粯璁?latest'
 * @param {boolean} params.ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Object>} - 杩斿洖浜у搧鍒楄〃鍜屽垎椤典俊鎭? */
export const getProductList = async (params = {}) => {
  try {
    // 鏋勫缓榛樿鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      category_id: params.category_id || '',
      keyword: params.keyword || '',
      sort: params.sort || 'latest',
      ...params.filters
    };
    
    // 鐢熸垚缂撳瓨閿紙浠呯涓€椤靛拰闈炲垎绫婚潪鎼滅储椤典娇鐢ㄧ紦瀛橈級
    const cacheKey = params.page === 1 && !params.category_id && !params.keyword 
      ? `cache_products_${queryParams.sort}` 
      : null;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (cacheKey && !params.ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCTS)) {
        return cachedData.data;
      }
    }
    
    // 璋冪敤API
    const result = await api.get('/products', queryParams);
    
    // 缂撳瓨绗竴椤垫暟鎹?    if (cacheKey) {
      setStorage(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error('鑾峰彇浜у搧鍒楄〃澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁锛堜粎棣栭〉锛?    if (params.page === 1 && !params.category_id && !params.keyword) {
      const cacheKey = `cache_products_${params.sort || 'latest'}`;
      const cachedData = getStorage(cacheKey);
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鐨勪骇鍝佸垪琛ㄦ暟鎹?);
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇浜у搧璇︽儏
 * @param {number|string} id - 浜у搧ID
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Object>} - 杩斿洖浜у搧璇︽儏
 */
export const getProductDetail = async (id, ignoreCache = false) => {
  try {
    const cacheKey = `cache_product_${id}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCT_DETAIL)) {
        return cachedData.data;
      }
    }
    
    // 璋冪敤API
    const product = await api.get(`/products/${id}`);
    
    // 缂撳瓨鏁版嵁
    setStorage(cacheKey, {
      data: product,
      timestamp: Date.now()
    });
    
    return product;
  } catch (error) {
    console.error('鑾峰彇浜у搧璇︽儏澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁
    if (!ignoreCache) {
      const cachedData = getStorage(`cache_product_${id}`);
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鐨勪骇鍝佽鎯呮暟鎹?);
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鐩稿叧浜у搧
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.product_id - 浜у搧ID
 * @param {number} params.limit - 杩斿洖鏁伴噺锛岄粯璁?
 * @returns {Promise<Object>} - 杩斿洖鐩稿叧浜у搧鍒楄〃
 */
export const getRelatedProducts = async (params = {}) => {
  try {
    const queryParams = {
      product_id: params.product_id,
      limit: params.limit || 6
    };
    
    return await api.get('/products/related', queryParams);
  } catch (error) {
    console.error('鑾峰彇鐩稿叧浜у搧澶辫触:', error);
    return { products: [] };
  }
};

/**
 * 鎼滅储浜у搧
 * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {Object} params - 鍏朵粬鏌ヨ鍙傛暟
 * @returns {Promise<Object>} - 杩斿洖鎼滅储缁撴灉
 */
export const searchProducts = async (keyword, params = {}) => {
  return getProductList({
    ...params,
    keyword,
    page: params.page || 1,
    per_page: params.per_page || 10
  });
};

/**
 * 鑾峰彇鐑棬浜у搧
 * @param {number} limit - 杩斿洖鏁伴噺锛岄粯璁?0
 * @returns {Promise<Array>} - 杩斿洖鐑棬浜у搧鍒楄〃
 */
export const getHotProducts = async (limit = 10) => {
  try {
    const cacheKey = `cache_hot_products_${limit}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    const cachedData = getStorage(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.PRODUCTS)) {
      return cachedData.data;
    }
    
    const result = await api.get('/products/hot', { limit });
    
    // 缂撳瓨鏁版嵁
    setStorage(cacheKey, {
      data: result.products || [],
      timestamp: Date.now()
    });
    
    return result.products || [];
  } catch (error) {
    console.error('鑾峰彇鐑棬浜у搧澶辫触:', error);
    return [];
  }
};

/**
 * 鑾峰彇浜у搧搴撳瓨淇℃伅
 * @param {number|string} productId - 浜у搧ID
 * @param {number|string} skuId - SKU ID锛堝彲閫夛級
 * @returns {Promise<Object>} - 杩斿洖搴撳瓨淇℃伅
 */
export const getProductStock = async (productId, skuId = '') => {
  try {
    return await api.get('/products/stock', {
      product_id: productId,
      sku_id: skuId
    });
  } catch (error) {
    console.error('鑾峰彇浜у搧搴撳瓨澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇浜у搧璇勮
 * @param {number|string} productId - 浜у搧ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @returns {Promise<Object>} - 杩斿洖璇勮鍒楄〃
 */
export const getProductComments = async (productId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      ...params
    };
    
    return await api.get(`/products/${productId}/comments`, queryParams);
  } catch (error) {
    console.error('鑾峰彇浜у搧璇勮澶辫触:', error);
    return { comments: [], total: 0 };
  }
};

/**
 * 鎻愪氦浜у搧璇勮
 * @param {number|string} productId - 浜у搧ID
 * @param {Object} data - 璇勮鏁版嵁
 * @param {number} data.rating - 璇勫垎锛?-5
 * @param {string} data.content - 璇勮鍐呭
 * @param {string} data.images - 鍥剧墖鏁扮粍锛堝彲閫夛級
 * @returns {Promise<Object>} - 杩斿洖鎻愪氦缁撴灉
 */
export const submitProductComment = async (productId, data) => {
  try {
    return await api.post(`/products/${productId}/comments`, data);
  } catch (error) {
    console.error('鎻愪氦浜у搧璇勮澶辫触:', error);
    showToast('璇勮鎻愪氦澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鏀惰棌浜у搧
 * @param {number|string} productId - 浜у搧ID
 * @returns {Promise<Object>} - 杩斿洖鏀惰棌缁撴灉
 */
export const favoriteProduct = async (productId) => {
  try {
    return await api.post('/products/favorite', { product_id: productId });
  } catch (error) {
    console.error('鏀惰棌浜у搧澶辫触:', error);
    showToast('鏀惰棌澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鍙栨秷鏀惰棌浜у搧
 * @param {number|string} productId - 浜у搧ID
 * @returns {Promise<Object>} - 杩斿洖鍙栨秷鏀惰棌缁撴灉
 */
export const unfavoriteProduct = async (productId) => {
  try {
    return await api.post('/products/unfavorite', { product_id: productId });
  } catch (error) {
    console.error('鍙栨秷鏀惰棌浜у搧澶辫触:', error);
    showToast('鍙栨秷鏀惰棌澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 妫€鏌ヤ骇鍝佹敹钘忕姸鎬? * @param {number|string} productId - 浜у搧ID
 * @returns {Promise<boolean>} - 鏄惁宸叉敹钘? */
export const checkFavoriteStatus = async (productId) => {
  try {
    const result = await api.get('/products/favorite/check', { product_id: productId });
    return result.is_favorite || false;
  } catch (error) {
    console.error('妫€鏌ユ敹钘忕姸鎬佸け璐?', error);
    return false;
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getProductList,
  getProductDetail,
  getRelatedProducts,
  searchProducts,
  getHotProducts,
  getProductStock,
  getProductComments,
  submitProductComment,
  favoriteProduct,
  unfavoriteProduct,
  checkFavoriteStatus
};