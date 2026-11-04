/**
 * 文件名: monitor-scheduler.js
 * 版本号: 3.5.7
 * 更新日期: 2026-11-04
 * 描述: monitor.js 的自动上报定时器调度（从 monitor-core 抽离）
 */

const CONFIG = require("./monitor-config");
const core = require("./monitor-core");

let reportTimer = null;

/**
 * 启动自动上报定时器
 */
function startAutoReport() {
  if (!CONFIG.enableAutoReport) return;
  if (reportTimer) return;

  const globalObj =
    typeof window !== "undefined"
      ? window
      : typeof wx !== "undefined"
        ? wx
        : typeof global !== "undefined"
          ? global
          : {};

  // 优先使用全局 setInterval（小程序中 wx.setInterval 不存在，否则退化为一次性 setTimeout）
  reportTimer = (globalThis.setInterval || globalObj.setInterval || setTimeout)(() => {
    core.reportData();
  }, CONFIG.reportInterval);
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
    (globalThis.clearInterval || globalObj.clearInterval || globalObj.clearTimeout)(reportTimer);
    reportTimer = null;
  }
}

module.exports = { startAutoReport, stopAutoReport };
