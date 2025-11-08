// search-service.js - 鎼滅储鐩稿叧鏈嶅姟妯″潡
// 澶勭悊鏂囩珷鎼滅储銆佺敤鎴锋悳绱㈢瓑鍔熻兘

import api from './api';
import { getStorage, setStorage } from './global';

// 鎼滅储鍘嗗彶閰嶇疆
const SEARCH_HISTORY_MAX_SIZE = 10;
const SEARCH_HISTORY_KEY = 'search_history';

/**
 * 鎼滅储鏂囩珷
 * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {Object} params - 鎼滅储鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {string} params.orderby - 鎺掑簭瀛楁锛岄粯璁?relevance'
 * @param {string} params.order - 鎺掑簭鏂瑰悜锛岄粯璁?desc'
 * @param {string} params.category - 鍒嗙被杩囨护
 * @param {number} params.year - 骞翠唤杩囨护
 * @returns {Promise<Object>} - 鍖呭惈鏂囩珷鍒楄〃鍜屾€绘暟鐨勫璞? */
export const searchArticles = async (keyword, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'relevance',
      order: params.order || 'desc'
    };
    
    // 娣诲姞鍙€夎繃婊ゅ弬鏁?    if (params.category) {
      queryParams.category = params.category;
    }
    
    if (params.year) {
      queryParams.year = params.year;
    }
    
    // 璋冪敤API
    const result = await api.get('/search/posts', queryParams);
    
    // 濡傛灉鎼滅储鎴愬姛涓旀湁鍏抽敭璇嶏紝淇濆瓨鎼滅储鍘嗗彶
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result;
  } catch (error) {
    console.error('鎼滅储鏂囩珷澶辫触:', error);
    throw error;
  }
};

/**
 * 鎼滅储鐢ㄦ埛
 * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {Object} params - 鎼滅储鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @returns {Promise<Object>} - 鍖呭惈鐢ㄦ埛鍒楄〃鍜屾€绘暟鐨勫璞? */
export const searchUsers = async (keyword, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 璋冪敤API
    return await api.get('/search/users', queryParams);
  } catch (error) {
    console.error('鎼滅储鐢ㄦ埛澶辫触:', error);
    throw error;
  }
};

/**
 * 鎼滅储鍟嗗搧锛堝鏋滄湁鐢靛晢鍔熻兘锛? * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {Object} params - 鎼滅储鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {string} params.orderby - 鎺掑簭瀛楁锛岄粯璁?relevance'
 * @param {string} params.order - 鎺掑簭鏂瑰悜锛岄粯璁?desc'
 * @param {string} params.category - 鍟嗗搧鍒嗙被杩囨护
 * @param {string} params.min_price - 鏈€浣庝环鏍艰繃婊? * @param {string} params.max_price - 鏈€楂樹环鏍艰繃婊? * @returns {Promise<Object>} - 鍖呭惈鍟嗗搧鍒楄〃鍜屾€绘暟鐨勫璞? */
export const searchProducts = async (keyword, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      s: keyword,
      page: params.page || 1,
      per_page: params.per_page || 10,
      orderby: params.orderby || 'relevance',
      order: params.order || 'desc'
    };
    
    // 娣诲姞鍙€夎繃婊ゅ弬鏁?    if (params.category) {
      queryParams.category = params.category;
    }
    
    if (params.min_price) {
      queryParams.min_price = params.min_price;
    }
    
    if (params.max_price) {
      queryParams.max_price = params.max_price;
    }
    
    // 璋冪敤API
    const result = await api.get('/search/products', queryParams);
    
    // 濡傛灉鎼滅储鎴愬姛涓旀湁鍏抽敭璇嶏紝淇濆瓨鎼滅储鍘嗗彶
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result;
  } catch (error) {
    console.error('鎼滅储鍟嗗搧澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇鎼滅储寤鸿
 * @param {string} keyword - 鍏抽敭璇嶅墠缂€
 * @param {number} limit - 杩斿洖鏁伴噺闄愬埗锛岄粯璁?
 * @returns {Promise<Array>} - 杩斿洖鎼滅储寤鸿鍒楄〃
 */
export const getSearchSuggestions = async (keyword, limit = 5) => {
  try {
    if (!keyword || !keyword.trim()) {
      return [];
    }
    
    // 璋冪敤API
    return await api.get('/search/suggestions', {
      s: keyword.trim(),
      limit
    });
  } catch (error) {
    console.error('鑾峰彇鎼滅储寤鸿澶辫触:', error);
    // 澶辫触鏃惰繑鍥炵┖鏁扮粍锛屼笉褰卞搷鐢ㄦ埛浣撻獙
    return [];
  }
};

/**
 * 淇濆瓨鎼滅储鍘嗗彶
 * @param {string} keyword - 鎼滅储鍏抽敭璇? */
export const saveSearchHistory = (keyword) => {
  try {
    // 鑾峰彇鐜版湁鍘嗗彶璁板綍
    let history = getStorage(SEARCH_HISTORY_KEY) || [];
    
    // 绉婚櫎閲嶅椤?    history = history.filter(item => item !== keyword);
    
    // 娣诲姞鍒板巻鍙茶褰曞紑澶?    history.unshift(keyword);
    
    // 闄愬埗鍘嗗彶璁板綍鏁伴噺
    if (history.length > SEARCH_HISTORY_MAX_SIZE) {
      history = history.slice(0, SEARCH_HISTORY_MAX_SIZE);
    }
    
    // 淇濆瓨鍒版湰鍦板瓨鍌?    setStorage(SEARCH_HISTORY_KEY, history);
  } catch (error) {
    console.error('淇濆瓨鎼滅储鍘嗗彶澶辫触:', error);
  }
};

/**
 * 鑾峰彇鎼滅储鍘嗗彶
 * @returns {Array} - 鎼滅储鍘嗗彶璁板綍
 */
export const getSearchHistory = () => {
  try {
    return getStorage(SEARCH_HISTORY_KEY) || [];
  } catch (error) {
    console.error('鑾峰彇鎼滅储鍘嗗彶澶辫触:', error);
    return [];
  }
};

/**
 * 娓呯┖鎼滅储鍘嗗彶
 */
export const clearSearchHistory = () => {
  try {
    setStorage(SEARCH_HISTORY_KEY, []);
  } catch (error) {
    console.error('娓呯┖鎼滅储鍘嗗彶澶辫触:', error);
  }
};

/**
 * 鍒犻櫎鍗曟潯鎼滅储鍘嗗彶
 * @param {string} keyword - 瑕佸垹闄ょ殑鍏抽敭璇? */
export const deleteSearchHistoryItem = (keyword) => {
  try {
    // 鑾峰彇鐜版湁鍘嗗彶璁板綍
    let history = getStorage(SEARCH_HISTORY_KEY) || [];
    
    // 杩囨护鎺夋寚瀹氬叧閿瘝
    history = history.filter(item => item !== keyword);
    
    // 淇濆瓨鍒版湰鍦板瓨鍌?    setStorage(SEARCH_HISTORY_KEY, history);
  } catch (error) {
    console.error('鍒犻櫎鎼滅储鍘嗗彶椤瑰け璐?', error);
  }
};

/**
 * 鑾峰彇鐑棬鎼滅储璇? * @param {number} limit - 鑾峰彇鏁伴噺锛岄粯璁?0
 * @returns {Promise<Array>} - 鐑棬鎼滅储璇嶅垪琛? */
export const getHotSearchTerms = async (limit = 10) => {
  try {
    // 灏濊瘯浠庢湇鍔″櫒鑾峰彇鐑棬鎼滅储璇?    return await api.get('/search/hot', { limit });
  } catch (error) {
    console.error('鑾峰彇鐑棬鎼滅储璇嶅け璐?', error);
    // 杩斿洖榛樿鐑棬鎼滅储璇嶏紙鐢ㄤ簬绂荤嚎鐘舵€佹垨API璋冪敤澶辫触鏃讹級
    return [
      '鏈€鏂拌祫璁?,
      '鐑棬鏂囩珷',
      '鎶€鏈暀绋?,
      '寮€鍙戠粡楠?,
      '鍓嶇寮€鍙?,
      '鍚庣寮€鍙?,
      '灏忕▼搴忓紑鍙?,
      'WordPress鏁欑▼',
      '鎶€鏈垎浜?,
      '瀹炵敤宸ュ叿'
    ].slice(0, limit);
  }
};

/**
 * 缁煎悎鎼滅储锛堟枃绔犮€佺敤鎴枫€佸晢鍝佺瓑锛? * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {Object} params - 鎼滅储鍙傛暟
 * @param {Array} params.types - 鎼滅储绫诲瀷鍒楄〃锛屽['posts', 'users', 'products']
 * @param {number} params.limit - 姣忕绫诲瀷杩斿洖鏁伴噺闄愬埗
 * @returns {Promise<Object>} - 鍖呭惈鍚勭被鍨嬫悳绱㈢粨鏋滅殑瀵硅薄
 */
export const searchAll = async (keyword, params = {}) => {
  try {
    // 璁剧疆榛樿鍊?    const searchTypes = params.types || ['posts'];
    const limit = params.limit || 5;
    
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      s: keyword,
      types: searchTypes.join(','),
      limit
    };
    
    // 璋冪敤API
    const result = await api.get('/search/all', queryParams);
    
    // 濡傛灉鎼滅储鎴愬姛涓旀湁鍏抽敭璇嶏紝淇濆瓨鎼滅储鍘嗗彶
    if (keyword && keyword.trim()) {
      saveSearchHistory(keyword.trim());
    }
    
    return result;
  } catch (error) {
    console.error('缁煎悎鎼滅储澶辫触:', error);
    // 濡傛灉API璋冪敤澶辫触锛屽皾璇曞垎鍒悳绱㈠悇绫诲瀷锛堝鐢ㄦ柟妗堬級
    const fallbackResults = {};
    const searchTypes = params.types || ['posts'];
    
    // 浠呭湪绂荤嚎鎯呭喌涓嬪皾璇曞鐢ㄦ柟妗?    if (error && error.name === 'NetworkError') {
      // 杩欓噷鍙互娣诲姞绂荤嚎鎼滅储閫昏緫锛屼絾閫氬父闇€瑕佹湰鍦板瓨鍌ㄧ殑绱㈠紩鏁版嵁
    }
    
    throw error;
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  searchArticles,
  searchUsers,
  searchProducts,
  getSearchSuggestions,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
  getHotSearchTerms,
  searchAll
};\n