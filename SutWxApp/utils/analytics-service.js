/**
 * analytics-service.js - 数据分析服务模块
 * 用于收集用户行为数据、页面访问数据等分析指标
 */

const api = require('./api');
const { getStorage, setStorage } = require('./global');

// 会话相关常量
const SESSION_KEY = 'analytics_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟超时

/**
 * 初始化会话数据
 * @private
 */
const initSession = () => {
  try {
    let session = getStorage(SESSION_KEY);
    const now = Date.now();
    
    // 如果会话不存在或已超时，创建新会话
    if (!session || (now - session.lastActivity > SESSION_TIMEOUT)) {
      // 创建会话数据
      session = {
        sessionId: generateSessionId(),
        startTime: now,
        lastActivity: now,
        pageViews: 0,
        events: []
      };
      
      // 保存会话数据
      setStorage(SESSION_KEY, session);
      
      // 记录会话开始事件
      trackEvent('session_start', {
        session_id: session.sessionId,
        timestamp: now
      });
    } else {
      // 更新会话最后活动时间
      session.lastActivity = now;
      setStorage(SESSION_KEY, session);
    }
    
    return session;
  } catch (error) {
    console.error('初始化会话数据失败:', error);
    return null;
  }
};

/**
 * 生成会话ID
 * @private
 * @returns {string} - 生成的会话ID
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
 * @param {string} params.referrer - 来源页面
 * @param {Object} params.page_params - 页面参数
 */
const trackPageView = async (pagePath, params = {}) => {
  try {
    // 初始化会话
    const session = initSession();
    if (!session) return;
    
    // 更新页面访问次数
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
    
    // 异步发送页面访问数据
    api.post('/analytics/pageview', pageData).catch(err => {
      console.error('发送页面访问数据失败:', err);
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
const trackEvent = async (eventName, eventData = {}) => {
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
    
    // 添加到事件队列，稍后批量处理
    session.events.push(event);
    setStorage(SESSION_KEY, session);
    
    // 尝试批量发送事件数据
    if (session.events.length >= 10) {
      await flushEvents();
    } else {
      // 延迟发送，合并更多事件
      setTimeout(flushEvents, 1000);
    }
  } catch (error) {
    console.error('记录用户事件失败:', error);
  }
};

/**
 * 批量发送事件数据
 * @private
 */
const flushEvents = async () => {
  try {
    const session = getStorage(SESSION_KEY);
    if (!session || session.events.length === 0) return;
    
    // 复制当前事件队列并清空
    const eventsToSend = [...session.events];
    session.events = [];
    setStorage(SESSION_KEY, session);
    
    // 发送事件数据
    const result = await api.post('/analytics/events', {
      session_id: session.sessionId,
      events: eventsToSend
    });
    
    if (result.code !== 200) {
      // 如果发送失败，将事件放回队列
      session.events = [...eventsToSend, ...session.events];
      setStorage(SESSION_KEY, session);
    }
  } catch (error) {
    console.error('发送事件数据失败:', error);
  }
};

/**
 * 记录文章阅读进度
 * @param {string|number} articleId - 文章ID
 * @param {number} progress - 阅读进度百分比 (0-100)
 */
const trackArticleProgress = async (articleId, progress) => {
  try {
    // 确保进度在有效范围内
    const validProgress = Math.max(0, Math.min(100, progress));
    
    // 只在特定进度点记录
    const checkpoints = [25, 50, 75, 100];
    const shouldTrack = checkpoints.some(checkpoint => Math.floor(validProgress) >= checkpoint);
    
    if (shouldTrack) {
      await trackEvent('article_progress', {
        article_id: articleId,
        progress: validProgress
      });
    }
  } catch (error) {
    console.error('记录文章阅读进度失败:', error);
  }
};

/**
 * 记录搜索行为
 * @param {string} keyword - 搜索关键词
 * @param {boolean} hasResults - 是否有搜索结果
 */
const trackSearch = async (keyword, hasResults = false) => {
  try {
    await trackEvent('search', {
      keyword: keyword,
      has_results: hasResults
    });
  } catch (error) {
    console.error('记录搜索行为失败:', error);
  }
};

/**
 * 记录分享行为
 * @param {string|number} contentId - 分享内容ID
 * @param {string} contentType - 内容类型 (article, page, etc.)
 * @param {string} shareChannel - 分享渠道 (wechat, moments, etc.)
 */
const trackShare = async (contentId, contentType, shareChannel) => {
  try {
    await trackEvent('share', {
      content_id: contentId,
      content_type: contentType,
      channel: shareChannel
    });
  } catch (error) {
    console.error('记录分享行为失败:', error);
  }
};

/**
 * 记录登录行为
 * @param {string} loginMethod - 登录方式 (wechat, phone, etc.)
 * @param {boolean} success - 是否登录成功
 */
const trackLogin = async (loginMethod, success = true) => {
  try {
    await trackEvent('login', {
      method: loginMethod,
      success: success
    });
  } catch (error) {
    console.error('记录登录行为失败:', error);
  }
};

/**
 * 记录注册行为
 * @param {string} registerMethod - 注册方式 (wechat, phone, etc.)
 * @param {boolean} success - 是否注册成功
 */
const trackRegister = async (registerMethod, success = true) => {
  try {
    await trackEvent('register', {
      method: registerMethod,
      success: success
    });
  } catch (error) {
    console.error('记录注册行为失败:', error);
  }
};

/**
 * 结束当前会话
 */
const endSession = async () => {
  try {
    const session = getStorage(SESSION_KEY);
    if (!session) return;
    
    // 计算会话时长
    const sessionDuration = Date.now() - session.startTime;
    
    // 记录会话结束事件
    await trackEvent('session_end', {
      session_id: session.sessionId,
      duration: sessionDuration,
      page_views: session.pageViews,
      event_count: session.events.length
    });
    
    // 确保所有事件都被发送
    await flushEvents();
    
    // 清除会话数据
    setStorage(SESSION_KEY, null);
  } catch (error) {
    console.error('结束会话失败:', error);
  }
};

/**
 * 获取设备信息
 * @returns {Object} - 设备信息对象
 */
const getDeviceInfo = () => {
  try {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    
    // 获取网络信息
    const networkType = wx.getNetworkTypeSync().networkType;
    
    return {
      app_version: systemInfo.version || '',
      system_version: systemInfo.system || '',
      device_model: systemInfo.model || '',
      screen_width: systemInfo.windowWidth || 0,
      screen_height: systemInfo.windowHeight || 0,
      pixel_ratio: systemInfo.pixelRatio || 1,
      language: systemInfo.language || 'zh-CN',
      network_type: networkType || 'unknown',
      platform: systemInfo.platform || ''
    };
  } catch (error) {
    console.error('获取设备信息失败:', error);
    return {};
  }
};

/**
 * 记录错误信息
 * @param {string} errorMessage - 错误消息
 * @param {Object} errorInfo - 错误相关信息
 */
const trackError = async (errorMessage, errorInfo = {}) => {
  try {
    // 获取设备信息
    const deviceInfo = getDeviceInfo();
    
    // 构建错误数据
    const errorData = {
      message: errorMessage,
      stack: errorInfo.stack || '',
      component: errorInfo.component || '',
      page_url: errorInfo.page_url || '',
      device_info: deviceInfo
    };
    
    // 发送错误数据到服务器
    await api.post('/analytics/error', errorData);
  } catch (error) {
    console.error('记录错误信息失败:', error);
  }
};

// 导出所有函数
module.exports = {
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