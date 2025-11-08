// article-service.js - 鏂囩珷鐩稿叧鏈嶅姟妯″潡
// 澶勭悊鏂囩珷鍒楄〃銆佹枃绔犺鎯呯瓑鍔熻兘鐨凙PI璋冪敤

import { api } from './api';
import { showToast, getStorage, setStorage } from './global';
import cache, { CACHE_DURATION, CACHE_KEYS } from './cache';
import validator from './validator';
import { throttle } from './utils';

// 缂撳瓨閿父閲?const ARTICLE_LIST_KEY_PREFIX = CACHE_KEYS.ARTICLE_LIST || 'cache_articles';
const ARTICLE_DETAIL_KEY_PREFIX = CACHE_KEYS.ARTICLE_DETAIL || 'cache_article';
const HOT_ARTICLES_KEY = CACHE_KEYS.HOT_ARTICLES || 'cache_hot_articles';
const CATEGORIES_KEY = CACHE_KEYS.ARTICLE_CATEGORIES || 'cache_article_categories';

// 缂撳瓨閰嶇疆
const ARTICLE_CACHE_CONFIG = {
  ARTICLES: CACHE_DURATION.SHORT || 5 * 60 * 1000, // 5鍒嗛挓
  ARTICLE_DETAIL: CACHE_DURATION.MEDIUM || 10 * 60 * 1000, // 10鍒嗛挓
  HOT_ARTICLES: CACHE_DURATION.MEDIUM || 15 * 60 * 1000, // 15鍒嗛挓
  CATEGORIES: CACHE_DURATION.LONG || 30 * 60 * 1000 // 30鍒嗛挓
};

/**
 * 鑾峰彇鏂囩珷鍒楄〃
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {number} params.category - 鍒嗙被ID锛屽彲閫? * @param {string} params.orderby - 鎺掑簭瀛楁锛岄粯璁?date'
 * @param {string} params.order - 鎺掑簭鏂瑰悜锛岄粯璁?desc'
 * @param {boolean} params.ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} - 杩斿洖鏂囩珷鍒楄〃
 */
export const getArticles = async (params = {}) => {
  try {
    // 鏋勫缓榛樿鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      category: params.category || '',
      orderby: params.orderby || 'date',
      order: params.order || 'desc'
    };
    
    // 鍙傛暟楠岃瘉
    if (validator && validator.isValidPagination) {
      if (!validator.isValidPagination(queryParams.page, queryParams.per_page)) {
        throw new Error('鍒嗛〉鍙傛暟鏃犳晥');
      }
    }
    
    // 鐢熸垚缂撳瓨閿?    const cacheKey = `${ARTICLE_LIST_KEY_PREFIX}_${JSON.stringify(queryParams)}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!params.ignoreCache) {
      // 浼樺厛浣跨敤cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('浠庣紦瀛樿幏鍙栨枃绔犲垪琛?);
          return cachedData;
        }
      } 
      // 闄嶇骇浣跨敤鍏ㄥ眬瀛樺偍锛堜粎绗竴椤靛拰闈炲垎绫婚〉锛?      else if (queryParams.page === 1 && !queryParams.category) {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.ARTICLES)) {
          return cachedData.data;
        }
      }
    }
    
    // 璋冪敤API
    const articles = await api.get('/posts', queryParams, {
      abortKey: `article_list_${queryParams.category || 'all'}_${queryParams.page}`,
      useCache: !params.ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.ARTICLES
    });
    
    // API妯″潡宸插鐞嗙紦瀛橈紝鏃犻渶鍦ㄦ閲嶅澶勭悊
    
    return articles;
  } catch (error) {
    console.error('鑾峰彇鏂囩珷鍒楄〃澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁锛堜粎绗竴椤碉級
    if (params.page === 1 && !params.ignoreCache) {
      const cacheKey = `${ARTICLE_LIST_KEY_PREFIX}_${JSON.stringify({ page: 1, per_page: params.per_page || 10, category: '', orderby: 'date', order: 'desc' })}`;
      
      // 浼樺厛浣跨敤cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勬枃绔犲垪琛ㄦ暟鎹?);
          return cachedData;
        }
      }
      // 闄嶇骇浣跨敤鍏ㄥ眬瀛樺偍
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勬枃绔犲垪琛ㄦ暟鎹?);
          return cachedData.data;
        }
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鏂囩珷鍒嗙被鍒楄〃
 * @param {boolean} [ignoreCache] - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} 鍒嗙被鍒楄〃
 */
export const getCategories = async (ignoreCache = false) => {
  try {
    const cacheKey = CATEGORIES_KEY;
    
    // 濡傛灉涓嶅拷鐣ョ紦瀛樹笖缂撳瓨瀛樺湪锛屽垯杩斿洖缂撳瓨鏁版嵁
    if (!ignoreCache) {
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
          console.log('浠庣紦瀛樿幏鍙栨枃绔犲垎绫?);
          return cachedData;
        }
      } else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.CATEGORIES)) {
          return cachedData.data;
        }
      }
    }
    
    // 璋冪敤API鑾峰彇鍒嗙被鍒楄〃
    const response = await api.get('/categories', {}, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.CATEGORIES,
      abortKey: 'article_categories'
    });
    const categories = response.data || response;
    
    // 楠岃瘉杩斿洖鏁版嵁
    if (!Array.isArray(categories)) {
      throw new Error('鑾峰彇鏂囩珷鍒嗙被澶辫触锛氳繑鍥炴暟鎹棤鏁?);
    }
    
    // API妯″潡宸插鐞嗙紦瀛橈紝鏃犻渶鍦ㄦ閲嶅澶勭悊
    
    return categories;
  } catch (error) {
    console.error('鑾峰彇鏂囩珷鍒嗙被澶辫触:', error);
    throw new Error(error.message || '鑾峰彇鏂囩珷鍒嗙被澶辫触');
  }
};

/**
 * 娓呴櫎鏂囩珷鐩稿叧缂撳瓨
 * @returns {Promise<void>}
 */
export const clearArticleCache = async () => {
  try {
    if (cache && cache.clear) {
      // 浣跨敤cache.js娓呴櫎缂撳瓨
      await cache.clear([ARTICLE_LIST_KEY_PREFIX, ARTICLE_DETAIL_KEY_PREFIX, HOT_ARTICLES_KEY, CATEGORIES_KEY]);
    } else {
      // 闄嶇骇娓呴櫎鍏ㄥ眬瀛樺偍涓殑缂撳瓨
      const keys = wx.getStorageInfoSync().keys;
      const articleCacheKeys = keys.filter(key => 
        key.startsWith('cache_articles_') || 
        key.startsWith('cache_article_') || 
        key.startsWith('cache_hot_articles') || 
        key === 'cache_article_categories'
      );
      
      articleCacheKeys.forEach(key => {
        wx.removeStorageSync(key);
      });
    }
    console.log('鏂囩珷缂撳瓨宸叉竻闄?);
  } catch (error) {
    console.error('娓呴櫎鏂囩珷缂撳瓨澶辫触:', error);
    throw new Error('娓呴櫎鏂囩珷缂撳瓨澶辫触');
  }
};

/**
 * 鑾峰彇鏂囩珷璇︽儏
 * @param {number|string} id - 鏂囩珷ID
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Object>} - 杩斿洖鏂囩珷璇︽儏
 */
export const getArticleDetail = async (id, ignoreCache = false) => {
  try {
    // 鍙傛暟楠岃瘉
    if (validator && validator.isValidArticleId) {
      if (!validator.isValidArticleId(id)) {
        throw new Error('鏂囩珷ID鏃犳晥');
      }
    }
    
    const cacheKey = `${ARTICLE_DETAIL_KEY_PREFIX}_${id}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!ignoreCache) {
      // 浼樺厛浣跨敤cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('浠庣紦瀛樿幏鍙栨枃绔犺鎯?);
          return cachedData;
        }
      }
      // 闄嶇骇浣跨敤鍏ㄥ眬瀛樺偍
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.ARTICLE_DETAIL)) {
          return cachedData.data;
        }
      }
    }
    
    // 璋冪敤API
    const article = await api.get(`/posts/${id}`, {}, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.ARTICLE_DETAIL,
      abortKey: `article_detail_${id}`
    });
    
    // API妯″潡宸插鐞嗙紦瀛橈紝鏃犻渶鍦ㄦ閲嶅澶勭悊
    
    return article;
  } catch (error) {
    console.error('鑾峰彇鏂囩珷璇︽儏澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁
    if (!ignoreCache) {
      const cacheKey = `${ARTICLE_DETAIL_KEY_PREFIX}_${id}`;
      
      // 浼樺厛浣跨敤cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勬枃绔犺鎯呮暟鎹?);
          return cachedData;
        }
      }
      // 闄嶇骇浣跨敤鍏ㄥ眬瀛樺偍
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勬枃绔犺鎯呮暟鎹?);
          return cachedData.data;
        }
      }
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鐑棬鏂囩珷
 * @param {number} limit - 鑾峰彇鏁伴噺锛岄粯璁?0
 * @param {boolean} ignoreCache - 鏄惁蹇界暐缂撳瓨锛岄粯璁alse
 * @returns {Promise<Array>} - 杩斿洖鐑棬鏂囩珷鍒楄〃
 */
export const getHotArticles = async (limit = 10, ignoreCache = false) => {
  try {
    // 鍙傛暟楠岃瘉
    if (validator && validator.isValidQuantity) {
      if (!validator.isValidQuantity(limit, { min: 1, max: 50 })) {
        throw new Error('鏁伴噺鍙傛暟鏃犳晥');
      }
    }
    
    const cacheKey = `${HOT_ARTICLES_KEY}_${limit}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    if (!ignoreCache) {
      // 浼樺厛浣跨敤cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData && Array.isArray(cachedData)) {
          console.log('浠庣紦瀛樿幏鍙栫儹闂ㄦ枃绔?);
          return cachedData;
        }
      }
      // 闄嶇骇浣跨敤鍏ㄥ眬瀛樺偍
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.HOT_ARTICLES)) {
          return cachedData.data;
        }
      }
    }
    
    // 璋冪敤API
    const articles = await api.get('/posts/hot', { limit }, {
      useCache: !ignoreCache,
      cacheDuration: ARTICLE_CACHE_CONFIG.HOT_ARTICLES,
      abortKey: `hot_articles_${limit}`
    });
    
    // API妯″潡宸插鐞嗙紦瀛橈紝鏃犻渶鍦ㄦ閲嶅澶勭悊
    
    return articles;
  } catch (error) {
    console.error('鑾峰彇鐑棬鏂囩珷澶辫触:', error);
    
    // 灏濊瘯浣跨敤缂撳瓨鏁版嵁
    if (!ignoreCache) {
      const cacheKey = `${HOT_ARTICLES_KEY}_${limit}`;
      
      // 浼樺厛浣跨敤cache.js
      if (cache && cache.get) {
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勭儹闂ㄦ枃绔犳暟鎹?);
          return cachedData;
        }
      }
      // 闄嶇骇浣跨敤鍏ㄥ眬瀛樺偍
      else {
        const cachedData = getStorage(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勭儹闂ㄦ枃绔犳暟鎹?);
          return cachedData.data;
        }
      }
    }
    
    throw error;
  }
};

/**
 * 鎼滅储鏂囩珷
 * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {Object} params - 鎼滅储鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @returns {Promise<Array>} - 杩斿洖鎼滅储缁撴灉
 */
export const searchArticles = async (keyword, params = {}) => {
  try {
    // 鍙傛暟楠岃瘉
    if (!keyword || keyword.trim() === '') {
      throw new Error('鎼滅储鍏抽敭璇嶄笉鑳戒负绌?);
    }
    
    // 浣跨敤validator杩涜鍏抽敭璇嶉獙璇?    if (validator && validator.isValidString) {
      if (!validator.isValidString(keyword.trim())) {
        throw new Error('鎼滅储鍏抽敭璇嶆棤鏁?);
      }
    }
    
    // 鏋勫缓鎼滅储鍙傛暟
    const searchParams = {
      keyword: keyword.trim(),
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 璋冪敤API
    const results = await api.get('/posts/search', searchParams, {
      abortKey: `article_search_${encodeURIComponent(keyword)}_${searchParams.page}`
    });
    
    return results;
  } catch (error) {
    console.error('鎼滅储鏂囩珷澶辫触:', error);
    throw error;
  }
};

/**
 * 鍙栨秷鐐硅禐鏂囩珷
 * @param {number|string} postId - 鏂囩珷ID
 * @returns {Promise<Object>} - 杩斿洖鎿嶄綔缁撴灉
 */
export const unlikeArticle = async (postId) => {
  try {
    // 鍙傛暟楠岃瘉
    if (validator && validator.isValidArticleId) {
      if (!validator.isValidArticleId(postId)) {
        throw new Error('鏂囩珷ID鏃犳晥');
      }
    }
    
    // 璋冪敤API
    const result = await api.delete(`/posts/${postId}/like`, {}, {
      abortKey: `unlike_article_${postId}`
    });
    
    // 娓呴櫎鐩稿叧缂撳瓨
    api.clearCache(`/posts/${postId}`);
    
    return result;
  } catch (error) {
    console.error('鍙栨秷鐐硅禐鏂囩珷澶辫触:', error);
    throw new Error(error.message || '鍙栨秷鐐硅禐鏂囩珷澶辫触');
  }
};

/**
 * 鑾峰彇鏂囩珷璇勮
 * @param {number|string} postId - 鏂囩珷ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @returns {Promise<Array>} - 杩斿洖璇勮鍒楄〃
 */
export const getArticleComments = async (postId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    return await api.get(`/posts/${postId}/comments`, queryParams, {
    abortKey: `article_comments_${postId}_${queryParams.page}`
  });
  } catch (error) {
    console.error('鑾峰彇鏂囩珷璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鍙戣〃鏂囩珷璇勮
 * @param {number|string} postId - 鏂囩珷ID
 * @param {string} content - 璇勮鍐呭
 * @param {number} parentId - 鐖惰瘎璁篒D锛岀敤浜庡洖澶嶏紝鍙€? * @returns {Promise<Object>} - 杩斿洖璇勮缁撴灉
 */
export const submitComment = async (postId, content, parentId = 0) => {
  try {
    if (!content || content.trim() === '') {
      throw new Error('璇勮鍐呭涓嶈兘涓虹┖');
    }
    
    const data = {
      post_id: postId,
      content: content.trim(),
      parent_id: parentId
    };
    
    const result = await api.post('/comments', data, {
      abortKey: `submit_comment_${postId}`
    });
    showToast('璇勮鎴愬姛', { icon: 'success' });
    
    return result;
  } catch (error) {
    console.error('鍙戣〃璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鐐硅禐鏂囩珷
 * @param {number|string} postId - 鏂囩珷ID
 * @returns {Promise<Object>} - 杩斿洖鐐硅禐缁撴灉
 */
export const likeArticle = async (postId) => {
  try {
    const result = await api.post(`/posts/${postId}/like`, {}, {
      abortKey: `like_article_${postId}`
    });
    return result;
  } catch (error) {
    console.error('鐐硅禐鏂囩珷澶辫触:', error);
    throw error;
  }
};

/**
 * 鏀惰棌鏂囩珷
 * @param {number|string} postId - 鏂囩珷ID
 * @returns {Promise<Object>} - 杩斿洖鏀惰棌缁撴灉
 */
export const favoriteArticle = async (postId) => {
  try {
    const result = await api.post(`/posts/${postId}/favorite`, {}, {
      abortKey: `favorite_article_${postId}`
    });
    showToast('鏀惰棌鎴愬姛', { icon: 'success' });
    return result;
  } catch (error) {
    console.error('鏀惰棌鏂囩珷澶辫触:', error);
    throw error;
  }
};

/**
 * 鍙栨秷鏀惰棌鏂囩珷
 * @param {number|string} postId - 鏂囩珷ID
 * @returns {Promise<Object>} - 杩斿洖鍙栨秷鏀惰棌缁撴灉
 */
export const unfavoriteArticle = async (postId) => {
  try {
    const result = await api.delete(`/posts/${postId}/favorite`, {}, {
      abortKey: `unfavorite_article_${postId}`
    });
    showToast('宸插彇娑堟敹钘?, { icon: 'success' });
    return result;
  } catch (error) {
    console.error('鍙栨秷鏀惰棌澶辫触:', error);
    throw error;
  }
};

/**
 * 妫€鏌ユ枃绔犳槸鍚﹀凡鏀惰棌
 * @param {number|string} postId - 鏂囩珷ID
 * @returns {Promise<boolean>} - 鏄惁宸叉敹钘? */
export const checkFavoriteStatus = async (postId) => {
  try {
    const result = await api.get(`/posts/${postId}/favorite/status`, {}, {
      abortKey: `check_favorite_${postId}`,
      useCache: true,
      cacheDuration: CACHE_DURATION.SHORT
    });
    return result.is_favorited || false;
  } catch (error) {
    console.error('妫€鏌ユ敹钘忕姸鎬佸け璐?', error);
    return false;
  }
};

/**
 * 澧炲姞鏂囩珷闃呰閲? * @param {number|string} postId - 鏂囩珷ID
 */
// 浣跨敤鑺傛祦鍑芥暟闃叉鐭椂闂村唴閲嶅澧炲姞闃呰閲?export const increaseViewCount = throttle(async (postId) => {
  try {
    // 浣跨敤API妯″潡鍙戦€佽姹?    await api.post(`/posts/${postId}/view`, {}, {
      abortKey: `increase_view_${postId}`,
      // 鍗充娇璇锋眰澶辫触涔熶笉鎶涘嚭寮傚父锛岄伩鍏嶅奖鍝嶇敤鎴蜂綋楠?      silent: true
    });
  } catch (error) {
    // 蹇界暐澧炲姞闃呰閲忓け璐ョ殑閿欒
    console.error('澧炲姞闃呰閲忓け璐?', error);
  }
}, 5000); // 5绉掑唴鍙墽琛屼竴娆?
// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getArticles,
  getArticleDetail,
  getHotArticles,
  searchArticles,
  getArticleComments,
  submitComment,
  likeArticle,
  unlikeArticle,
  favoriteArticle,
  unfavoriteArticle,
  checkFavoriteStatus,
  increaseViewCount,
  getCategories,
  clearArticleCache
};\n