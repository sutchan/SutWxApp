// analytics-service.js - 缁熻鍒嗘瀽鐩稿叧鏈嶅姟妯″潡
// 澶勭悊椤甸潰璁块棶缁熻銆佺敤鎴疯涓哄垎鏋愮瓑鍔熻兘

import api from './api';
import { getStorage, setStorage } from './global';

// 浼氳瘽閰嶇疆
const SESSION_KEY = 'analytics_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30鍒嗛挓

/**
 * 鍒濆鍖栫粺璁′細璇? * @private
 */
const initSession = () => {
  try {
    let session = getStorage(SESSION_KEY);
    const now = Date.now();
    
    // 妫€鏌ヤ細璇濇槸鍚﹀瓨鍦ㄦ垨宸茶繃鏈?    if (!session || (now - session.lastActivity > SESSION_TIMEOUT)) {
      // 鍒涘缓鏂颁細璇?      session = {
        sessionId: generateSessionId(),
        startTime: now,
        lastActivity: now,
        pageViews: 0,
        events: []
      };
      
      // 淇濆瓨鏂颁細璇?      setStorage(SESSION_KEY, session);
      
      // 鍙戦€佷細璇濆紑濮嬩簨浠?      trackEvent('session_start', {
        session_id: session.sessionId,
        timestamp: now
      });
    } else {
      // 鏇存柊鏈€鍚庢椿鍔ㄦ椂闂?      session.lastActivity = now;
      setStorage(SESSION_KEY, session);
    }
    
    return session;
  } catch (error) {
    console.error('鍒濆鍖栫粺璁′細璇濆け璐?', error);
    return null;
  }
};

/**
 * 鐢熸垚浼氳瘽ID
 * @private
 * @returns {string} - 鍞竴鐨勪細璇滻D
 */
const generateSessionId = () => {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
};

/**
 * 璁板綍椤甸潰璁块棶
 * @param {string} pagePath - 椤甸潰璺緞
 * @param {Object} params - 椤甸潰鍙傛暟
 * @param {string} params.title - 椤甸潰鏍囬
 * @param {number} params.duration - 椤甸潰鍋滅暀鏃堕棿锛堟绉掞級
 */
export const trackPageView = async (pagePath, params = {}) => {
  try {
    // 鍒濆鍖栦細璇?    const session = initSession();
    if (!session) return;
    
    // 鏇存柊椤甸潰璁块棶鏁?    session.pageViews++;
    setStorage(SESSION_KEY, session);
    
    // 鏋勫缓椤甸潰璁块棶鏁版嵁
    const pageData = {
      session_id: session.sessionId,
      page_path: pagePath,
      page_title: params.title || '',
      timestamp: Date.now(),
      duration: params.duration || 0,
      referrer: params.referrer || '',
      page_params: params.page_params || {}
    };
    
    // 寮傛鍙戦€佸埌鏈嶅姟鍣紙涓嶉樆濉炰富娴佺▼锛?    api.post('/analytics/pageview', pageData).catch(err => {
      console.error('鍙戦€侀〉闈㈣闂粺璁″け璐?', err);
    });
  } catch (error) {
    console.error('璁板綍椤甸潰璁块棶澶辫触:', error);
  }
};

/**
 * 璁板綍鐢ㄦ埛浜嬩欢
 * @param {string} eventName - 浜嬩欢鍚嶇О
 * @param {Object} eventData - 浜嬩欢鐩稿叧鏁版嵁
 */
export const trackEvent = async (eventName, eventData = {}) => {
  try {
    // 鍒濆鍖栦細璇?    const session = initSession();
    if (!session) return;
    
    // 鏋勫缓浜嬩欢鏁版嵁
    const event = {
      session_id: session.sessionId,
      event_name: eventName,
      timestamp: Date.now(),
      data: eventData
    };
    
    // 娣诲姞鍒颁細璇濅簨浠跺垪琛紙鐢ㄤ簬鎵归噺鍙戦€侊級
    session.events.push(event);
    setStorage(SESSION_KEY, session);
    
    // 濡傛灉浜嬩欢鏁伴噺瓒呰繃闃堝€硷紝鎵归噺鍙戦€?    if (session.events.length >= 10) {
      flushEvents();
    }
    
    // 寮傛鍙戦€佸埌鏈嶅姟鍣紙涓嶉樆濉炰富娴佺▼锛?    api.post('/analytics/event', event).catch(err => {
      console.error('鍙戦€佷簨浠剁粺璁″け璐?', err);
    });
  } catch (error) {
    console.error('璁板綍浜嬩欢澶辫触:', error);
  }
};

/**
 * 鎵归噺鍙戦€佷簨浠? * @private
 */
const flushEvents = async () => {
  try {
    const session = getStorage(SESSION_KEY);
    if (!session || session.events.length === 0) return;
    
    // 澶嶅埗浜嬩欢鍒楄〃骞舵竻绌?    const eventsToSend = [...session.events];
    session.events = [];
    setStorage(SESSION_KEY, session);
    
    // 鎵归噺鍙戦€?    await api.post('/analytics/events/batch', {
      events: eventsToSend
    });
  } catch (error) {
    console.error('鎵归噺鍙戦€佷簨浠跺け璐?', error);
    // 濡傛灉鍙戦€佸け璐ワ紝鍙互鑰冭檻灏嗕簨浠舵斁鍥為槦鍒?  }
};

/**
 * 璁板綍鏂囩珷闃呰杩涘害
 * @param {string} articleId - 鏂囩珷ID
 * @param {number} progress - 闃呰杩涘害锛?-100锛? */
export const trackArticleProgress = async (articleId, progress) => {
  try {
    // 纭繚杩涘害鍦ㄦ湁鏁堣寖鍥村唴
    const validProgress = Math.max(0, Math.min(100, Math.round(progress)));
    
    // 璁板綍杩涘害浜嬩欢
    trackEvent('article_progress', {
      article_id: articleId,
      progress: validProgress
    });
    
    // 鐗规畩澶勭悊闃呰瀹屾垚浜嬩欢
    if (validProgress >= 95) {
      trackEvent('article_read_complete', {
        article_id: articleId
      });
    }
  } catch (error) {
    console.error('璁板綍鏂囩珷闃呰杩涘害澶辫触:', error);
  }
};

/**
 * 璁板綍鐢ㄦ埛鎼滅储
 * @param {string} keyword - 鎼滅储鍏抽敭璇? * @param {boolean} hasResults - 鏄惁鏈夌粨鏋? */
export const trackSearch = async (keyword, hasResults = false) => {
  try {
    trackEvent('search', {
      keyword,
      has_results: hasResults
    });
  } catch (error) {
    console.error('璁板綍鎼滅储澶辫触:', error);
  }
};

/**
 * 璁板綍鍒嗕韩琛屼负
 * @param {string} contentId - 鍒嗕韩鐨勫唴瀹笽D
 * @param {string} contentType - 鍐呭绫诲瀷锛坅rticle, product绛夛級
 * @param {string} shareChannel - 鍒嗕韩娓犻亾
 */
export const trackShare = async (contentId, contentType, shareChannel) => {
  try {
    trackEvent('share', {
      content_id: contentId,
      content_type: contentType,
      share_channel: shareChannel
    });
  } catch (error) {
    console.error('璁板綍鍒嗕韩澶辫触:', error);
  }
};

/**
 * 璁板綍鐢ㄦ埛鐧诲綍
 * @param {string} loginMethod - 鐧诲綍鏂瑰紡
 * @param {boolean} success - 鏄惁鎴愬姛
 */
export const trackLogin = async (loginMethod, success = true) => {
  try {
    trackEvent('login', {
      method: loginMethod,
      success
    });
  } catch (error) {
    console.error('璁板綍鐧诲綍澶辫触:', error);
  }
};

/**
 * 璁板綍鐢ㄦ埛娉ㄥ唽
 * @param {string} registerMethod - 娉ㄥ唽鏂瑰紡
 * @param {boolean} success - 鏄惁鎴愬姛
 */
export const trackRegister = async (registerMethod, success = true) => {
  try {
    trackEvent('register', {
      method: registerMethod,
      success
    });
  } catch (error) {
    console.error('璁板綍娉ㄥ唽澶辫触:', error);
  }
};

/**
 * 缁撴潫褰撳墠浼氳瘽
 */
export const endSession = async () => {
  try {
    const session = getStorage(SESSION_KEY);
    if (!session) return;
    
    const now = Date.now();
    const sessionDuration = now - session.startTime;
    
    // 鍙戦€佷細璇濈粨鏉熶簨浠?    trackEvent('session_end', {
      session_id: session.sessionId,
      duration: sessionDuration,
      page_views: session.pageViews,
      events_count: session.events.length
    });
    
    // 纭繚鎵€鏈変簨浠堕兘宸插彂閫?    flushEvents();
    
    // 娓呴櫎浼氳瘽
    wx.removeStorageSync(SESSION_KEY);
  } catch (error) {
    console.error('缁撴潫浼氳瘽澶辫触:', error);
  }
};

/**
 * 鑾峰彇鐢ㄦ埛璁惧淇℃伅
 * @returns {Object} - 璁惧淇℃伅
 */
export const getDeviceInfo = () => {
  try {
    const systemInfo = wx.getSystemInfoSync();
    const networkType = wx.getNetworkTypeSync();
    
    return {
      app_version: systemInfo.version,
      platform: systemInfo.platform,
      system: systemInfo.system,
      model: systemInfo.model,
      network_type: networkType.networkType,
      screen_width: systemInfo.windowWidth,
      screen_height: systemInfo.windowHeight,
      pixel_ratio: systemInfo.pixelRatio
    };
  } catch (error) {
    console.error('鑾峰彇璁惧淇℃伅澶辫触:', error);
    return {};
  }
};

/**
 * 璁板綍閿欒淇℃伅
 * @param {string} errorMessage - 閿欒娑堟伅
 * @param {Object} errorInfo - 閿欒璇︽儏
 */
export const trackError = async (errorMessage, errorInfo = {}) => {
  try {
    const errorData = {
      message: errorMessage,
      stack: errorInfo.stack || '',
      context: errorInfo.context || {},
      device: getDeviceInfo(),
      timestamp: Date.now()
    };
    
    // 鍙戦€侀敊璇棩蹇楀埌鏈嶅姟鍣?    api.post('/analytics/error', errorData).catch(err => {
      console.error('鍙戦€侀敊璇棩蹇楀け璐?', err);
    });
  } catch (error) {
    console.error('璁板綍閿欒澶辫触:', error);
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  trackPageView,
  trackEvent,
  trackArticleProgress,
  trackSearch,
  trackShare,
  trackLogin,
  trackRegister,
  endSession,
  getDeviceInfo,
  trackError
};