// category-service.js - 鍒嗙被鐩稿叧鏈嶅姟妯″潡
// 澶勭悊鍒嗙被鍒楄〃鍜屽垎绫讳笅鐨勬枃绔犵瓑鍔熻兘

import api from './api';
import { getStorage, setStorage } from './global';

// 缂撳瓨閰嶇疆
const CACHE_DURATION = {
  CATEGORIES: 30 * 60 * 1000, // 30鍒嗛挓
  CATEGORY_ARTICLES: 5 * 60 * 1000 // 5鍒嗛挓
};

/**
 * 鑾峰彇鍒嗙被鍒楄〃
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {boolean} params.hide_empty - 鏄惁闅愯棌绌哄垎绫伙紝榛樿true
 * @returns {Promise<Array>} - 杩斿洖鍒嗙被鍒楄〃
 */
export const getCategories = async (ignoreCache = false, params = {}) => {
  try {
    const cacheKey = 'cache_categories';
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      hide_empty: params.hide_empty !== undefined ? params.hide_empty : true
    };
    
    // 璋冪敤API
    const categories = await api.get('/categories', queryParams);
    
    // 缂撳瓨鏁版嵁
    setStorage(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });
    
    return categories;
  } catch (error) {
    console.error('鑾峰彇鍒嗙被鍒楄〃澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁
    if (!ignoreCache) {
      const cachedData = getStorage('cache_categories');
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鐨勫垎绫绘暟鎹?);
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鍒嗙被璇︽儏
 * @param {number|string} id - 鍒嗙被ID
 * @returns {Promise<Object>} - 杩斿洖鍒嗙被璇︽儏
 */
export const getCategoryDetail = async (id) => {
  try {
    return await api.get(`/categories/${id}`);
  } catch (error) {
    console.error('鑾峰彇鍒嗙被璇︽儏澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇鍒嗙被涓嬬殑鏂囩珷鍒楄〃
 * @param {number|string} categoryId - 鍒嗙被ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {string} params.orderby - 鎺掑簭瀛楁锛岄粯璁?date'
 * @param {string} params.order - 鎺掑簭鏂瑰悜锛岄粯璁?desc'
 * @param {boolean} params.ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} - 杩斿洖鏂囩珷鍒楄〃
 */
export const getCategoryArticles = async (categoryId, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'date',
      order: params.order || 'desc'
    };
    
    // 鐢熸垚缂撳瓨閿?    const cacheKey = `cache_category_articles_${categoryId}_${JSON.stringify(queryParams)}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹紙浠呯涓€椤典娇鐢ㄧ紦瀛橈級
    if (!params.ignoreCache && queryParams.page === 1) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORY_ARTICLES)) {
        return cachedData.data;
      }
    }
    
    // 璋冪敤API
    const articles = await api.get(`/categories/${categoryId}/posts`, queryParams);
    
    // 缂撳瓨绗竴椤垫暟鎹?    if (queryParams.page === 1) {
      setStorage(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });
    }
    
    return articles;
  } catch (error) {
    console.error('鑾峰彇鍒嗙被鏂囩珷鍒楄〃澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁锛堜粎绗竴椤碉級
    if (!params.ignoreCache && params.page === 1) {
      const cacheKey = `cache_category_articles_${categoryId}_${JSON.stringify({ page: 1, per_page: params.per_page || 10, orderby: 'date', order: 'desc' })}`;
      const cachedData = getStorage(cacheKey);
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鐨勫垎绫绘枃绔犳暟鎹?);
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鍒嗙被鐨勫瓙鍒嗙被
 * @param {number|string} parentId - 鐖跺垎绫籌D
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} - 杩斿洖瀛愬垎绫诲垪琛? */
export const getSubCategories = async (parentId, ignoreCache = false) => {
  try {
    // 鍏堣幏鍙栨墍鏈夊垎绫?    const allCategories = await getCategories(ignoreCache);
    
    // 杩囨护鍑哄瓙鍒嗙被
    const subCategories = allCategories.filter(category => category.parent === parentId);
    
    return subCategories;
  } catch (error) {
    console.error('鑾峰彇瀛愬垎绫诲け璐?', error);
    throw error;
  }
};

/**
 * 鑾峰彇鍒嗙被鏍戠粨鏋? * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} - 杩斿洖鍒嗙被鏍戠粨鏋? */
export const getCategoryTree = async (ignoreCache = false) => {
  try {
    // 鑾峰彇鎵€鏈夊垎绫?    const allCategories = await getCategories(ignoreCache);
    
    // 鏋勫缓鍒嗙被鏍?    const categoryMap = {};
    const rootCategories = [];
    
    // 鍏堝垱寤烘墍鏈夊垎绫荤殑鏄犲皠
    allCategories.forEach(category => {
      categoryMap[category.id] = {
        ...category,
        children: []
      };
    });
    
    // 鏋勫缓鏍戠粨鏋?    allCategories.forEach(category => {
      if (category.parent === 0 || !categoryMap[category.parent]) {
        // 鏍瑰垎绫?        rootCategories.push(categoryMap[category.id]);
      } else {
        // 瀛愬垎绫?        categoryMap[category.parent].children.push(categoryMap[category.id]);
      }
    });
    
    return rootCategories;
  } catch (error) {
    console.error('鑾峰彇鍒嗙被鏍戝け璐?', error);
    throw error;
  }
};

/**
 * 鑾峰彇鐑棬鍒嗙被
 * @param {number} limit - 鑾峰彇鏁伴噺锛岄粯璁?0
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} - 杩斿洖鐑棬鍒嗙被鍒楄〃
 */
export const getHotCategories = async (limit = 10, ignoreCache = false) => {
  try {
    const cacheKey = `cache_hot_categories_${limit}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 璋冪敤API
    const categories = await api.get('/categories/hot', { limit });
    
    // 缂撳瓨鏁版嵁
    setStorage(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });
    
    return categories;
  } catch (error) {
    console.error('鑾峰彇鐑棬鍒嗙被澶辫触:', error);
    
    // 濡傛灉API璋冪敤澶辫触锛屽皾璇曚粠鎵€鏈夊垎绫讳腑鎸夋枃绔犳暟閲忔帓搴忚幏鍙?    if (!ignoreCache) {
      try {
        const allCategories = await getCategories(false);
        // 鎸夋枃绔犳暟閲忔帓搴?        const sortedCategories = allCategories
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, limit);
        
        return sortedCategories;
      } catch (innerError) {
        console.error('鑾峰彇鎵€鏈夊垎绫诲け璐?', innerError);
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鏍囩鍒楄〃
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.limit - 鑾峰彇鏁伴噺锛岄粯璁?0
 * @returns {Promise<Array>} - 杩斿洖鏍囩鍒楄〃
 */
export const getTags = async (ignoreCache = false, params = {}) => {
  try {
    const cacheKey = 'cache_tags';
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!ignoreCache) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
        return cachedData.data;
      }
    }
    
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      limit: params.limit || 30
    };
    
    // 璋冪敤API
    const tags = await api.get('/tags', queryParams);
    
    // 缂撳瓨鏁版嵁
    setStorage(cacheKey, {
      data: tags,
      timestamp: Date.now()
    });
    
    return tags;
  } catch (error) {
    console.error('鑾峰彇鏍囩鍒楄〃澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁
    if (!ignoreCache) {
      const cachedData = getStorage('cache_tags');
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鐨勬爣绛炬暟鎹?);
        return cachedData.data;
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鏍囩涓嬬殑鏂囩珷鍒楄〃
 * @param {number|string} tagId - 鏍囩ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @returns {Promise<Array>} - 杩斿洖鏂囩珷鍒楄〃
 */
export const getTagArticles = async (tagId, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 璋冪敤API
    return await api.get(`/tags/${tagId}/posts`, queryParams);
  } catch (error) {
    console.error('鑾峰彇鏍囩鏂囩珷鍒楄〃澶辫触:', error);
    throw error;
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getCategories,
  getCategoryDetail,
  getCategoryArticles,
  getSubCategories,
  getCategoryTree,
  getHotCategories,
  getTags,
  getTagArticles
};