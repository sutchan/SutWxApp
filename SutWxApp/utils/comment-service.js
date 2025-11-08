// comment-service.js - 璇勮鐩稿叧鏈嶅姟妯″潡
// 澶勭悊鏂囩珷璇勮銆佸洖澶嶇瓑鍔熻兘

import api from './api';
import { getStorage } from './global';

/**
 * 鑾峰彇鏂囩珷璇勮鍒楄〃
 * @param {number|string} postId - 鏂囩珷ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {string} params.order - 鎺掑簭鏂瑰悜锛岄粯璁?desc'
 * @returns {Promise<Object>} - 鍖呭惈璇勮鍒楄〃鍜屾€绘暟鐨勫璞? */
export const getComments = async (postId, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      order: params.order || 'desc'
    };
    
    // 璋冪敤API
    return await api.get(`/posts/${postId}/comments`, queryParams);
  } catch (error) {
    console.error('鑾峰彇璇勮鍒楄〃澶辫触:', error);
    throw error;
  }
};

/**
 * 鍙戣〃璇勮
 * @param {number|string} postId - 鏂囩珷ID
 * @param {string} content - 璇勮鍐呭
 * @param {Object} options - 鍏朵粬閫夐」
 * @param {number|string} options.parent - 鐖惰瘎璁篒D锛堢敤浜庡洖澶嶏級锛岄粯璁?琛ㄧず椤剁骇璇勮
 * @param {string} options.author_name - 璇勮鑰呭悕绉帮紙鏈櫥褰曠敤鎴蜂娇鐢級
 * @param {string} options.author_email - 璇勮鑰呴偖绠憋紙鏈櫥褰曠敤鎴蜂娇鐢級
 * @returns {Promise<Object>} - 杩斿洖鍒涘缓鐨勮瘎璁哄璞? */
export const createComment = async (postId, content, options = {}) => {
  try {
    // 妫€鏌ュ唴瀹规槸鍚︿负绌?    if (!content || content.trim() === '') {
      throw new Error('璇勮鍐呭涓嶈兘涓虹┖');
    }
    
    // 鏋勫缓璇勮鏁版嵁
    const commentData = {
      content: content.trim(),
      parent: options.parent || 0
    };
    
    // 濡傛灉鐢ㄦ埛鏈櫥褰曪紝闇€瑕佹彁渚涘悕绉板拰閭
    const userInfo = getStorage('userInfo');
    if (!userInfo || !userInfo.token) {
      if (!options.author_name || !options.author_email) {
        throw new Error('璇锋彁渚涜瘎璁鸿€呭悕绉板拰閭');
      }
      commentData.author_name = options.author_name;
      commentData.author_email = options.author_email;
    }
    
    // 璋冪敤API
    return await api.post(`/posts/${postId}/comments`, commentData);
  } catch (error) {
    console.error('鍙戣〃璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鍥炲璇勮
 * @param {number|string} postId - 鏂囩珷ID
 * @param {number|string} commentId - 瑕佸洖澶嶇殑璇勮ID
 * @param {string} content - 鍥炲鍐呭
 * @returns {Promise<Object>} - 杩斿洖鍒涘缓鐨勫洖澶嶈瘎璁哄璞? */
export const replyComment = async (postId, commentId, content) => {
  try {
    // 鐩存帴璋冪敤createComment锛岃缃畃arent鍙傛暟
    return await createComment(postId, content, { parent: commentId });
  } catch (error) {
    console.error('鍥炲璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鍒犻櫎璇勮
 * @param {number|string} commentId - 璇勮ID
 * @returns {Promise<boolean>} - 鏄惁鍒犻櫎鎴愬姛
 */
export const deleteComment = async (commentId) => {
  try {
    // 璋冪敤API
    await api.delete(`/comments/${commentId}`);
    return true;
  } catch (error) {
    console.error('鍒犻櫎璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鐐硅禐璇勮
 * @param {number|string} commentId - 璇勮ID
 * @returns {Promise<Object>} - 杩斿洖鐐硅禐鍚庣殑璇勮瀵硅薄锛屽寘鍚偣璧炴暟
 */
export const likeComment = async (commentId) => {
  try {
    // 璋冪敤API
    return await api.post(`/comments/${commentId}/like`);
  } catch (error) {
    console.error('鐐硅禐璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鍙栨秷鐐硅禐璇勮
 * @param {number|string} commentId - 璇勮ID
 * @returns {Promise<Object>} - 杩斿洖鍙栨秷鐐硅禐鍚庣殑璇勮瀵硅薄锛屽寘鍚偣璧炴暟
 */
export const unlikeComment = async (commentId) => {
  try {
    // 璋冪敤API
    return await api.delete(`/comments/${commentId}/like`);
  } catch (error) {
    console.error('鍙栨秷鐐硅禐璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 涓炬姤璇勮
 * @param {number|string} commentId - 璇勮ID
 * @param {string} reason - 涓炬姤鍘熷洜
 * @returns {Promise<boolean>} - 鏄惁涓炬姤鎴愬姛
 */
export const reportComment = async (commentId, reason) => {
  try {
    // 妫€鏌ュ師鍥犳槸鍚︿负绌?    if (!reason || reason.trim() === '') {
      throw new Error('璇锋彁渚涗妇鎶ュ師鍥?);
    }
    
    // 璋冪敤API
    await api.post(`/comments/${commentId}/report`, {
      reason: reason.trim()
    });
    
    return true;
  } catch (error) {
    console.error('涓炬姤璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇璇勮鍥炲鍒楄〃
 * @param {number|string} commentId - 鐖惰瘎璁篒D
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @returns {Promise<Object>} - 鍖呭惈鍥炲鍒楄〃鍜屾€绘暟鐨勫璞? */
export const getCommentReplies = async (commentId, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 璋冪敤API
    return await api.get(`/comments/${commentId}/replies`, queryParams);
  } catch (error) {
    console.error('鑾峰彇璇勮鍥炲澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇鐢ㄦ埛璇勮鍒楄〃
 * @param {number|string} userId - 鐢ㄦ埛ID
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @returns {Promise<Object>} - 鍖呭惈璇勮鍒楄〃鍜屾€绘暟鐨勫璞? */
export const getUserComments = async (userId, params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 璋冪敤API
    return await api.get(`/users/${userId}/comments`, queryParams);
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 缂栬緫璇勮
 * @param {number|string} commentId - 璇勮ID
 * @param {string} content - 鏂扮殑璇勮鍐呭
 * @returns {Promise<Object>} - 杩斿洖鏇存柊鍚庣殑璇勮瀵硅薄
 */
export const updateComment = async (commentId, content) => {
  try {
    // 妫€鏌ュ唴瀹规槸鍚︿负绌?    if (!content || content.trim() === '') {
      throw new Error('璇勮鍐呭涓嶈兘涓虹┖');
    }
    
    // 璋冪敤API
    return await api.put(`/comments/${commentId}`, {
      content: content.trim()
    });
  } catch (error) {
    console.error('缂栬緫璇勮澶辫触:', error);
    throw error;
  }
};

/**
 * 璇勮鍐呭杩囨护锛堝鎴风棰勮繃婊わ紝鍑忚交鏈嶅姟鍣ㄥ帇鍔涳級
 * @param {string} content - 寰呰繃婊ょ殑璇勮鍐呭
 * @returns {Object} - 鍖呭惈杩囨护鍚庣殑鍐呭鍜屾槸鍚﹂渶瑕佽繘涓€姝ユ鏌ョ殑鏍囧織
 */
export const filterCommentContent = (content) => {
  // 鍩烘湰鐨勫唴瀹硅繃婊ら€昏緫
  // 1. 闀垮害闄愬埗
  let filteredContent = content.trim();
  const MAX_LENGTH = 2000;
  
  if (filteredContent.length > MAX_LENGTH) {
    filteredContent = filteredContent.substring(0, MAX_LENGTH);
  }
  
  // 2. 妫€鏌ユ槸鍚﹀寘鍚槑鏄剧殑鍨冨溇鍐呭鐗瑰緛锛堢畝鍗曠ず渚嬶級
  const spamPatterns = [
    /(http|https):\/\/[^\s]+/gi,  // URL妫€娴?    /([\u4e00-\u9fa5])\1{4,}/g,   // 涓枃閲嶅瀛楃
    /([a-zA-Z])\1{4,}/g,           // 鑻辨枃閲嶅瀛楃
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}/g  // 鐗规畩瀛楃鍫嗙爩
  ];
  
  let needsReview = false;
  for (const pattern of spamPatterns) {
    if (pattern.test(filteredContent)) {
      needsReview = true;
      break;
    }
  }
  
  return {
    content: filteredContent,
    needsReview
  };
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getComments,
  createComment,
  replyComment,
  deleteComment,
  likeComment,
  unlikeComment,
  reportComment,
  getCommentReplies,
  getUserComments,
  updateComment,
  filterCommentContent
};\n