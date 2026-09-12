/**
 * 文件名: monitor-scheduler.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
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

  reportTimer = (globalObj.setInterval || setTimeout)(() => {
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
    (globalObj.clearInterval || globalObj.clearTimeout)(reportTimer);
    reportTimer = null;
  }
}

module.exports = { startAutoReport, stopAutoReport };
