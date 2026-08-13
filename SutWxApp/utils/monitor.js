/**
 * 文件名: monitor.js
 * 版本号: 3.0.1
 * 更新日期: 2026-08-13
 * 描述: 性能监控工具，包含性能监控、错误收集、用户行为追踪和上传机制
 */

/**
 * 安全获取wx对象
 * @returns {any|null} 微信小程序wx对象，如果不存在则返回null
 */
function getWx() {
  if (typeof wx !== "undefined") {
    return wx;
  }
  return null;
}

/**
 * 检查wx对象是否存在，并抛出错误如果不存在
 * @returns {any} 微信小程序wx对象
 * @throws {Error} 如果wx对象未定义则抛出错误
 */
function checkWx() {
  const wx = getWx();
  if (!wx) {
    throw new Error("wx对象未定义");
  }
  return wx;
}

const REPORT_URL = "/api/monitor/data";
const APP_ID = "sut-wx-app";
const DEFAULT_CONFIG = {
  reportInterval: 5 * 60 * 1000,
  maxBatchSize: 20,
  enableAutoReport: true,
  enablePerformance: true,
  enableError: true,
  enableBehavior: true,
  samplingRate: 1,
  maxBufferSize: 1000,
  reportUrl: REPORT_URL,
  appId: APP_ID,
  enableNetworkMonitor: true,
  enableFPSMonitor: true,
  enableMemoryMonitor: true,
  enablePageLoadMonitor: true,
  enableApiMonitor: true,
};

const dataBuffer = [];
let reportTimer = null;
let lastReportTime = 0;
const sessionId = generateSessionId();
let behaviorMode = "normal";
let isOnline = true;
let networkType = "unknown";
let memoryMonitor = null;
let originalRequest = null;
const performanceMarks = new Map();
const routeObservers = [];

/**
 * 生成会话ID
 * @returns {string} 会话ID
 */
function generateSessionId() {
  const timestamp = Date.now();
  let randomStr = "";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `session_${timestamp}_${randomStr}`;
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息对象
 */
function getSystemInfo() {
  const wx = getWx();
  if (!wx) return {};
  try {
    return wx.getSystemInfoSync
      ? wx.getSystemInfoSync()
      : (wx.getWindowInfo ? wx.getWindowInfo() : {});
  } catch (e) {
    return {};
  }
}

/**
 * 获取当前页面路径
 * @returns {string} 当前页面路径，如果获取失败则返回空字符串
 */
function getCurrentPagePath() {
  const wx = getWx();
  if (!wx || !wx.getCurrentPages) return "";
  try {
    const pages = wx.getCurrentPages();
    if (pages && pages.length > 0) {
      return pages[pages.length - 1].route || "";
    }
  } catch (e) {
    return "";
  }
  return "";
}

/**
 * 获取当前时间戳
 * @returns {number} 当前时间戳（毫秒）
 */
function getCurrentTime() {
  return Date.now();
}

/**
 * 创建监控数据对象
 * @param {string} type 数据类型
 * @param {string} category 数据分类
 * @param {Object} data 数据内容
 * @returns {Object} 监控数据对象
 */
function createMonitorData(type, category, data) {
  const baseData = {
    type,
    category,
    timestamp: getCurrentTime(),
    page: getCurrentPagePath(),
    sessionId,
    appId: DEFAULT_CONFIG.appId,
    behaviorMode,
    networkType,
    lastReportTime,
  };
  return { ...baseData, data };
}

/**
 * 添加数据到缓冲区
 * @param {Object} data 监控数据对象
 */
function addToBuffer(data) {
  if (dataBuffer.length >= DEFAULT_CONFIG.maxBufferSize) {
    dataBuffer.shift();
  }
  dataBuffer.push(data);

  if (dataBuffer.length >= DEFAULT_CONFIG.maxBatchSize) {
    reportData();
  }
}

/**
 * 上报数据到服务器
 * @param {Object} [customData] 自定义上报数据，可选
 * @returns {Promise<boolean>} 上报结果Promise，成功返回true，失败返回false
 */
function reportData(customData) {
  if (typeof wx === "undefined") {
    return Promise.resolve(false);
  }

  if (!isOnline) {
    return Promise.resolve(false);
  }

  const wx = checkWx();
  const now = getCurrentTime();
  lastReportTime = now;

  let batch = [];
  if (customData) {
    batch = [customData];
  } else {
    batch = dataBuffer.splice(0, DEFAULT_CONFIG.maxBatchSize).map((item) => ({
      ...item,
      reportTime: now,
    }));
  }

  if (batch.length === 0) {
    return Promise.resolve(false);
  }

  const payload = {
    appId: DEFAULT_CONFIG.appId,
    sessionId,
    timestamp: now,
    data: batch,
  };

  return new Promise((resolve) => {
    if (!wx.request) {
      resolve(false);
      return;
    }
    wx.request({
      url: `${DEFAULT_CONFIG.reportUrl}`,
      method: "POST",
      data: payload,
      header: { "content-type": "application/json" },
      success: () => resolve(true),
      fail: () => resolve(false),
    });
  });
}

/**
 * 上报错误
 * @param {Error|string} error 错误对象或错误信息
 * @param {Object} [context] 错误上下文，可选
 */
function error(error, context) {
  if (!DEFAULT_CONFIG.enableError) return;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : "";
  const errorData = createMonitorData("error", "error", {
    message: errorMessage,
    stack,
    context: context || {},
    systemInfo: getSystemInfo(),
  });
  addToBuffer(errorData);
  if (typeof console !== "undefined" && console.error) {
    console.error("[Monitor]", errorMessage, context || "");
  }
}

/**
 * 上报性能数据
 * @param {string} name 性能指标名称
 * @param {number} value 性能指标值
 * @param {Object} [context] 性能数据上下文，可选
 */
function performance(name, value, context) {
  if (!DEFAULT_CONFIG.enablePerformance) return;
  const perfData = createMonitorData("performance", "performance", {
    name,
    value,
    context: context || {},
  });
  addToBuffer(perfData);
}

/**
 * 上报用户行为
 * @param {string} action 用户行为名称
 * @param {Object} [data] 行为相关数据，可选
 */
function behavior(action, data) {
  if (!DEFAULT_CONFIG.enableBehavior) return;
  const behaviorData = createMonitorData("behavior", "behavior", {
    action,
    data: data || {},
  });
  addToBuffer(behaviorData);
}

/**
 * 启动自动上报定时器
 */
function startAutoReport() {
  if (!DEFAULT_CONFIG.enableAutoReport) return;
  if (reportTimer) return;

  const globalObj =
    typeof window !== "undefined"
      ? window
      : typeof wx !== "undefined"
        ? wx
        : typeof global !== "undefined"
          ? global
          : {};

  reportTimer = (globalObj.setInterval || setTimeout)(
    () => {
      if (dataBuffer.length > 0) {
        reportData();
      }
    },
    DEFAULT_CONFIG.reportInterval,
  );
}

/**
 * 停止自动上报定时器
 */
function stopAutoReport() {
  if (reportTimer) {
    const globalObj =
      typeof window !== "undefined"
        ? window
        : typeof wx !== "undefined"
          ? wx
          : typeof global !== "undefined"
            ? global
            : {};
    (globalObj.clearInterval || globalObj.clearTimeout)(reportTimer);
    reportTimer = null;
  }
}

/**
 * 监控网络状态
 */
function monitorNetwork() {
  const wx = getWx();
  if (!wx || !wx.getNetworkType || !wx.onNetworkStatusChange) return;
  wx.getNetworkType({
    success: (res) => {
      networkType = res.networkType;
      isOnline = res.networkType !== "none";
    },
  });
  wx.onNetworkStatusChange((res) => {
    networkType = res.networkType;
    isOnline = res.isConnected && res.networkType !== "none";
    behavior("network_change", {
      networkType: res.networkType,
      isConnected: res.isConnected,
    });
  });
}

/**
 * 监控FPS
 */
function monitorFPS() {
  if (!DEFAULT_CONFIG.enableFPSMonitor) return;
  let lastTime = getCurrentTime();
  let frameCount = 0;
  const calcFPS = () => {
    const now = getCurrentTime();
    const delta = now - lastTime;
    if (delta >= 1000) {
      const fps = Math.round((frameCount * 1000) / delta);
      performance("fps", fps);
      frameCount = 0;
      lastTime = now;
    }
    frameCount++;
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(calcFPS);
    }
  };
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(calcFPS);
  }
}

/**
 * 监控内存
 */
function monitorMemory() {
  if (!DEFAULT_CONFIG.enableMemoryMonitor) return;
  const wx = getWx();
  if (!wx || !wx.getPerformance || !wx.getPerformance().getEntriesByName) return;
  const globalObj =
    typeof window !== "undefined"
      ? window
      : typeof wx !== "undefined"
        ? wx
        : typeof global !== "undefined"
          ? global
          : {};
  const timer = (globalObj.setInterval || setTimeout)(() => {
    try {
      const memory = wx.getPerformance().getEntriesByName("memory", "measure");
      if (memory && memory.length > 0) {
        performance("memory", memory[0].duration);
      }
    } catch (e) {}
  }, 10000);
  memoryMonitor = timer;
}

/**
 * 监控页面加载
 */
function monitorPageLoad() {
  if (!DEFAULT_CONFIG.enablePageLoadMonitor) return;
  const wx = getWx();
  if (!wx || !wx.getCurrentPages) return;
  const pages = wx.getCurrentPages();
  if (pages && pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    const originalOnLoad = currentPage.onLoad;
    if (originalOnLoad) {
      const startTime = getCurrentTime();
      currentPage.onLoad = function (...args) {
        const loadTime = getCurrentTime() - startTime;
        performance("page_load", loadTime, { page: currentPage.route });
        return originalOnLoad.apply(this, args);
      };
    }
  }
}

/**
 * 监控API请求
 */
function monitorApi() {
  if (!DEFAULT_CONFIG.enableApiMonitor) return;
  const wx = getWx();
  if (!wx || !wx.request) return;
  originalRequest = wx.request;
  wx.request = function (options) {
    const startTime = getCurrentTime();
    const url = options.url;
    const originalSuccess = options.success;
    const originalFail = options.fail;
    options.success = function (res) {
      const duration = getCurrentTime() - startTime;
      performance("api_request", duration, { url, status: res.statusCode });
      if (originalSuccess) originalSuccess(res);
    };
    options.fail = function (err) {
      const duration = getCurrentTime() - startTime;
      error(`API请求失败: ${url}`, { url, duration, err });
      if (originalFail) originalFail(err);
    };
    return originalRequest.call(this, options);
  };
}

/**
 * 设置行为模式
 * @param {string} mode 行为模式
 */
function setBehaviorMode(mode) {
  behaviorMode = mode;
  behavior("behavior_mode_change", { mode });
}

/**
 * 初始化监控
 * @param {Object} [config] 自定义配置，可选
 */
function init(config = {}) {
  Object.assign(DEFAULT_CONFIG, config);

  if (DEFAULT_CONFIG.enableNetworkMonitor) {
    monitorNetwork();
  }
  if (DEFAULT_CONFIG.enableFPSMonitor) {
    monitorFPS();
  }
  if (DEFAULT_CONFIG.enableMemoryMonitor) {
    monitorMemory();
  }
  if (DEFAULT_CONFIG.enablePageLoadMonitor) {
    monitorPageLoad();
  }
  if (DEFAULT_CONFIG.enableApiMonitor) {
    monitorApi();
  }
  if (DEFAULT_CONFIG.enableAutoReport) {
    startAutoReport();
  }

  behavior("monitor_init", {
    appId: DEFAULT_CONFIG.appId,
    sessionId,
  });
}

/**
 * 销毁监控
 */
function destroy() {
  stopAutoReport();
  if (memoryMonitor) {
    const globalObj =
      typeof window !== "undefined"
        ? window
        : typeof wx !== "undefined"
          ? wx
          : typeof global !== "undefined"
            ? global
            : {};
    (globalObj.clearInterval || globalObj.clearTimeout)(memoryMonitor);
    memoryMonitor = null;
  }
  if (originalRequest) {
    const wx = getWx();
    if (wx) wx.request = originalRequest;
  }
}

/**
 * 创建性能标记
 * @param {string} markName 标记名称
 */
function mark(markName) {
  performanceMarks.set(markName, getCurrentTime());
}

/**
 * 测量性能
 * @param {string} markName 标记名称
 * @param {string} measureName 测量名称
 * @returns {number} 测量值（毫秒），如果标记不存在则返回0
 */
function measure(markName, measureName) {
  const startTime = performanceMarks.get(markName);
  if (!startTime) return 0;
  const duration = getCurrentTime() - startTime;
  performance(measureName, duration);
  return duration;
}

/**
 * 添加路由观察者
 * @param {Function} observer 观察者函数
 */
function addRouteObserver(observer) {
  if (typeof observer === "function") {
    routeObservers.push(observer);
  }
}

/**
 * 移除路由观察者
 * @param {Function} observer 观察者函数
 */
function removeRouteObserver(observer) {
  const index = routeObservers.indexOf(observer);
  if (index >= 0) {
    routeObservers.splice(index, 1);
  }
}

const monitor = {
  init,
  destroy,
  error,
  performance,
  behavior,
  reportData,
  setBehaviorMode,
  mark,
  measure,
  addRouteObserver,
  removeRouteObserver,
  startAutoReport,
  stopAutoReport,
};

module.exports = monitor;
module.exports.default = monitor;
