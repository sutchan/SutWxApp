/**
 * 文件名: monitor-collectors.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的采集器（网络/FPS/内存/页面加载/API 请求），依赖 core 上报能力
 */

const CONFIG = require("./monitor-config");
const { getWx } = require("./request-platform");
const { getCurrentTime } = require("./monitor-utils");
const core = require("./monitor-core");

let memoryMonitor = null;

/**
 * 监控网络状态
 */
function monitorNetwork() {
  const wx = getWx();
  if (!wx || !wx.getNetworkType || !wx.onNetworkStatusChange) return;
  wx.getNetworkType({
    success: (res) => {
      core.setNetworkStatus(res.networkType, res.networkType !== "none");
    },
  });
  wx.onNetworkStatusChange((res) => {
    core.setNetworkStatus(res.networkType, res.isConnected && res.networkType !== "none");
    core.behavior("network_change", {
      networkType: res.networkType,
      isConnected: res.isConnected,
    });
  });
}

/**
 * 监控 FPS
 */
function monitorFPS() {
  if (!CONFIG.enableFPSMonitor) return;
  let lastTime = getCurrentTime();
  let frameCount = 0;
  const calcFPS = () => {
    const now = getCurrentTime();
    const delta = now - lastTime;
    if (delta >= 1000) {
      const fps = Math.round((frameCount * 1000) / delta);
      core.performance("fps", fps);
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
  if (!CONFIG.enableMemoryMonitor) return;
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
  memoryMonitor = (globalObj.setInterval || setTimeout)(() => {
    try {
      const memory = wx.getPerformance().getEntriesByName("memory", "measure");
      if (memory && memory.length > 0) {
        core.performance("memory", memory[0].duration);
      }
    } catch (e) {}
  }, 10000);
}

/**
 * 监控页面加载
 */
function monitorPageLoad() {
  if (!CONFIG.enablePageLoadMonitor) return;
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
        core.performance("page_load", loadTime, { page: currentPage.route });
        return originalOnLoad.apply(this, args);
      };
    }
  }
}

/**
 * 监控 API 请求
 */
function monitorApi() {
  if (!CONFIG.enableApiMonitor) return;
  const wx = getWx();
  if (!wx || !wx.request) return;
  core.setOriginalRequest(wx.request);
  wx.request = function (options) {
    const startTime = getCurrentTime();
    const url = options.url;
    const originalSuccess = options.success;
    const originalFail = options.fail;
    options.success = function (res) {
      const duration = getCurrentTime() - startTime;
      core.performance("api_request", duration, { url, status: res.statusCode });
      if (originalSuccess) originalSuccess(res);
    };
    options.fail = function (err) {
      const duration = getCurrentTime() - startTime;
      core.error(`API请求失败: ${url}`, { url, duration, err });
      if (originalFail) originalFail(err);
    };
    const realRequest = core.getOriginalRequest();
    return realRequest.call(this, options);
  };
}

/**
 * 清理采集器内部状态（定时器、恢复原请求引用）
 */
function resetCollectors() {
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
  const orig = core.getOriginalRequest();
  if (orig) {
    const wx = getWx();
    if (wx) wx.request = orig;
    core.setOriginalRequest(null);
  }
}

module.exports = {
  monitorNetwork,
  monitorFPS,
  monitorMemory,
  monitorPageLoad,
  monitorApi,
  resetCollectors,
};
