// analytics-service.js - 统计分析相关服务模块
// 处理页面访问统计、用户行为分析等功能

import api from './api';
import { getStorage, setStorage } from './global';

// 会话配置
const SESSION_KEY = 'analytics_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟

/**
 * 初始化统计会话
 * @private
 */
const initSession = () => {
  try {
    let session = getStorage(SESSION_KEY);
    const now = Date.now();
    
    // 检查会话是否存在或已过期
    if (!session || (now - session.lastActivity > SESSION_TIMEOUT)) {
      // 创建新会话
      session = {
        sessionId: generateSessionId(),
        startTime: now,
        lastActivity: now,
        pageViews: 0,
        events: []
      };
      
      // 保存新会话
      setStorage(SESSION_KEY, session);
      
      // 发送会话开始事件
      trackEvent('session_start', {
        session_id: session.sessionId,
        timestamp: now
      });
    } else {
      // 更新最后活动时间
      session.lastActivity = now;
      setStorage(SESSION_KEY, session);
    }
    
    return session;
  } catch (error) {
    console.error('初始化统计会话失败:', error);
    return null;
  }
};

/**
 * 生成会话ID
 * @private
 * @returns {string} - 唯一的会话ID
 */
const generateSessionId = () => {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
};

/**
 * 记录页面访问
 * @param {string} pagePath - 页面路径
 * @param {Object} params - 页面参数
 * @param {string} params.title - 页面标题
 * @param {number} params.duration - 页面停留时间（毫秒）
 */
export const trackPageView = async (pagePath, params = {}) => {
  try {
    // 初始化会话
    const session = initSession();
    if (!session) return;
    
    // 更新页面访问数
    session.pageViews++;
    setStorage(SESSION_KEY, session);
    
    // 构建页面访问数据
    const pageData = {
      session_id: session.sessionId,
      page_path: pagePath,
      page_title: params.title || '',
      timestamp: Date.now(),
      duration: params.duration || 0,
      referrer: params.referrer || '',
      page_params: params.page_params || {}
    };
    
    // 异步发送到服务器（不阻塞主流程）
    api.post('/analytics/pageview', pageData).catch(err => {
      console.error('发送页面访问统计失败:', err);
    });
  } catch (error) {
    console.error('记录页面访问失败:', error);
  }
};

/**
 * 记录用户事件
 * @param {string} eventName - 事件名称
 * @param {Object} eventData - 事件相关数据
 */
export const trackEvent = async (eventName, eventData = {}) => {
  try {
    // 初始化会话
    const session = initSession();
    if (!session) return;
    
    // 构建事件数据
    const event = {
      session_id: session.sessionId,
      event_name: eventName,
      timestamp: Date.now(),
      data: eventData
    };
    
    // 添加到会话事件列表（用于批量发送）
    session.events.push(event);
    setStorage(SESSION_KEY, session);
    
    // 如果事件数量超过阈值，批量发送
    if (session.events.length >= 10) {
      flushEvents();
    }
    
    // 异步发送到服务器（不阻塞主流程）
    api.post('/analytics/event', event).catch(err => {
      console.error('发送事件统计失败:', err);
    });
  } catch (error) {
    console.error('记录事件失败:', error);
  }
};

/**
 * 批量发送事件
 * @private
 */
const flushEvents = async () => {
  try {
    const session = getStorage(SESSION_KEY);
    if (!session || session.events.length === 0) return;
    
    // 复制事件列表并清空
    const eventsToSend = [...session.events];
    session.events = [];
    setStorage(SESSION_KEY, session);
    
    // 批量发送
    await api.post('/analytics/events/batch', {
      events: eventsToSend
    });
  } catch (error) {
    console.error('批量发送事件失败:', error);
    // 如果发送失败，可以考虑将事件放回队列
  }
};

/**
 * 记录文章阅读进度
 * @param {string} articleId - 文章ID
 * @param {number} progress - 阅读进度（0-100）
 */
export const trackArticleProgress = async (articleId, progress) => {
  try {
    // 确保进度在有效范围内
    const validProgress = Math.max(0, Math.min(100, Math.round(progress)));
    
    // 记录进度事件
    trackEvent('article_progress', {
      article_id: articleId,
      progress: validProgress
    });
    
    // 特殊处理阅读完成事件
    if (validProgress >= 95) {
      trackEvent('article_read_complete', {
        article_id: articleId
      });
    }
  } catch (error) {
    console.error('记录文章阅读进度失败:', error);
  }
};

/**
 * 记录用户搜索
 * @param {string} keyword - 搜索关键词
 * @param {boolean} hasResults - 是否有结果
 */
export const trackSearch = async (keyword, hasResults = false) => {
  try {
    trackEvent('search', {
      keyword,
      has_results: hasResults
    });
  } catch (error) {
    console.error('记录搜索失败:', error);
  }
};

/**
 * 记录分享行为
 * @param {string} contentId - 分享的内容ID
 * @param {string} contentType - 内容类型（article, product等）
 * @param {string} shareChannel - 分享渠道
 */
export const trackShare = async (contentId, contentType, shareChannel) => {
  try {
    trackEvent('share', {
      content_id: contentId,
      content_type: contentType,
      share_channel: shareChannel
    });
  } catch (error) {
    console.error('记录分享失败:', error);
  }
};

/**
 * 记录用户登录
 * @param {string} loginMethod - 登录方式
 * @param {boolean} success - 是否成功
 */
export const trackLogin = async (loginMethod, success = true) => {
  try {
    trackEvent('login', {
      method: loginMethod,
      success
    });
  } catch (error) {
    console.error('记录登录失败:', error);
  }
};

/**
 * 记录用户注册
 * @param {string} registerMethod - 注册方式
 * @param {boolean} success - 是否成功
 */
export const trackRegister = async (registerMethod, success = true) => {
  try {
    trackEvent('register', {
      method: registerMethod,
      success
    });
  } catch (error) {
    console.error('记录注册失败:', error);
  }
};

/**
 * 结束当前会话
 */
export const endSession = async () => {
  try {
    const session = getStorage(SESSION_KEY);
    if (!session) return;
    
    const now = Date.now();
    const sessionDuration = now - session.startTime;
    
    // 发送会话结束事件
    trackEvent('session_end', {
      session_id: session.sessionId,
      duration: sessionDuration,
      page_views: session.pageViews,
      events_count: session.events.length
    });
    
    // 确保所有事件都已发送
    flushEvents();
    
    // 清除会话
    wx.removeStorageSync(SESSION_KEY);
  } catch (error) {
    console.error('结束会话失败:', error);
  }
};

/**
 * 获取用户设备信息
 * @returns {Object} - 设备信息
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
    console.error('获取设备信息失败:', error);
    return {};
  }
};

/**
 * 记录错误信息
 * @param {string} errorMessage - 错误消息
 * @param {Object} errorInfo - 错误详情
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
    
    // 发送错误日志到服务器
    api.post('/analytics/error', errorData).catch(err => {
      console.error('发送错误日志失败:', err);
    });
  } catch (error) {
    console.error('记录错误失败:', error);
  }
};

// 导出所有方法
export default {
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