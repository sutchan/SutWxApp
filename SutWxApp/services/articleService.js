﻿/**
 * 鏂囦欢鍚? articleService.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 鏂囩珷鏈嶅姟灞?- 鎻愪緵鏂囩珷鐩稿叧鐨凙PI鎺ュ彛璋冪敤
 */

const request = require('../utils/request');
const cacheService = require('../utils/cacheService.js').instance;
const CACHE_POLICY = require('../utils/cacheService.js').CACHE_POLICY;

/**
 * 鑾峰彇鏂囩珷鍒楄〃
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁や负1
 * @param {number} params.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负10
 * @param {string} params.category - 鏂囩珷鍒嗙被锛堝彲閫夛級
 * @returns {Promise<Object>} 鏂囩珷鍒楄〃鏁版嵁
 */
const getArticleList = async (params = {}) => {
  const { page = 1, pageSize = 10, category = '' } = params;
  
  try {
    // 璋冪敤API鑾峰彇鏂囩珷鍒楄〃
    const response = await request.get('/articles', {
      page,
      pageSize,
      category
    }, {
      cache: {
        policy: CACHE_POLICY.NETWORK_FIRST,
        maxAge: 30 * 60 * 1000 // 30鍒嗛挓
      }
    });
    
    return response;
  } catch (error) {
    console.error('鑾峰彇鏂囩珷鍒楄〃澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇鏂囩珷璇︽儏
 * @param {string} articleId - 鏂囩珷ID
 * @returns {Promise<Object>} 鏂囩珷璇︽儏鏁版嵁
 */
const getArticleDetail = async (articleId) => {
  if (!articleId) {
    throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
  }
  
  try {
    // 璋冪敤API鑾峰彇鏂囩珷璇︽儏
    const response = await request.get(`/articles/${articleId}`, {}, {
      cache: {
        policy: CACHE_POLICY.STALE_WHILE_REVALIDATE,
        maxAge: 60 * 60 * 1000 // 1灏忔椂
      }
    });
    
    return response;
  } catch (error) {
    console.error('鑾峰彇鏂囩珷璇︽儏澶辫触:', error);
    throw error;
  }
};

/**
 * 澧炲姞鏂囩珷娴忚娆℃暟
 * @param {string} articleId - 鏂囩珷ID
 * @returns {Promise<void>}
 */
const increaseViewCount = async (articleId) => {
  if (!articleId) {
    throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
  }
  
  try {
    await request.post(`/articles/${articleId}/view`);
  } catch (error) {
    console.error('澧炲姞娴忚娆℃暟澶辫触:', error);
    // 涓嶆姏鍑洪敊璇紝閬垮厤褰卞搷鐢ㄦ埛娴忚浣撻獙
  }
};

/**
 * 鑾峰彇鏂囩珷璇勮鍒楄〃
 * @param {string} articleId - 鏂囩珷ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁や负1
 * @param {number} params.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
 * @returns {Promise<Object>} 璇勮鍒楄〃鏁版嵁
 */
const getArticleComments = async (articleId, params = {}) => {
  if (!articleId) {
    throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
  }
  
  const { page = 1, pageSize = 20 } = params;
  
  try {
    const response = await request.get(`/articles/${articleId}/comments`, {
      page,
      pageSize
    }, {
      cache: {
        policy: CACHE_POLICY.NETWORK_FIRST,
        maxAge: 5 * 60 * 1000 // 5鍒嗛挓
      }
    });
    
    return response;
  } catch (error) {
    console.error('鑾峰彇鏂囩珷璇勮澶辫触:', error);
    throw error;
  }
};

module.exports = {
  getArticleList,
  getArticleDetail,
  increaseViewCount,
  getArticleComments
};