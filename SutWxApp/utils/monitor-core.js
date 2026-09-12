/**
 * 文件名: monitor-core.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的核心状态与缓冲/上报能力（错误/性能/行为见 monitor-report，标记/观察者见 monitor-observers）
 */

const CONFIG = require("./monitor-config");
const { checkWx } = require("./request-platform");
const { generateSessionId, getCurrentPagePath, getCurrentTime } = require("./monitor-utils");

const dataBuffer = [];
let lastReportTime = 0;
const sessionId = generateSessionId();
let behaviorMode = "normal";
let isOnline = true;
let networkType = "unknown";
let originalRequest = null;

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
    appId: CONFIG.appId,
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
  if (dataBuffer.length >= CONFIG.maxBufferSize) {
    dataBuffer.shift();
  }
  dataBuffer.push(data);

  if (dataBuffer.length >= CONFIG.maxBatchSize) {
    reportData().catch(() => {});
  }
}

/**
 * 上报数据到服务器
 * @param {Object} [customData] 自定义上报数据，可选
 * @returns {Promise<boolean>} 上报结果 Promise
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
    batch = dataBuffer.splice(0, CONFIG.maxBatchSize).map((item) => ({
      ...item,
      reportTime: now,
    }));
  }

  if (batch.length === 0) {
    return Promise.resolve(false);
  }

  const payload = {
    appId: CONFIG.appId,
    sessionId,
    timestamp: now,
    data: batch,
  };

  return new Promise((resolve) => {
    const realRequest = originalRequest || wx.request;
    if (!realRequest) {
      resolve(false);
      return;
    }
    realRequest({
      url: CONFIG.reportUrl,
      method: "POST",
      data: payload,
      header: { "content-type": "application/json" },
      success: () => resolve(true),
      fail: () => resolve(false),
    });
  });
}

/**
 * 设置行为模式
 * @param {string} mode 行为模式
 */
function setBehaviorMode(mode) {
  behaviorMode = mode;
}

/**
 * 获取当前原始请求引用（避免上报递归）
 * @returns {Function|null}
 */
function getOriginalRequest() {
  return originalRequest;
}

/**
 * 设置当前原始请求引用
 * @param {Function|null} req
 */
function setOriginalRequest(req) {
  originalRequest = req;
}

/**
 * 更新网络状态（由采集器写入核心状态，供上报数据携带）
 * @param {string} networkTypeValue 网络类型
 * @param {boolean} isOnlineValue 是否在线
 */
function setNetworkStatus(networkTypeValue, isOnlineValue) {
  networkType = networkTypeValue;
  isOnline = isOnlineValue;
}

/**
 * 获取会话ID
 * @returns {string}
 */
function getSessionId() {
  return sessionId;
}

module.exports = {
  createMonitorData,
  addToBuffer,
  reportData,
  setBehaviorMode,
  getOriginalRequest,
  setOriginalRequest,
  setNetworkStatus,
  getSessionId,
};
