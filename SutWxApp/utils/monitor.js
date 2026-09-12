/**
 * 文件名: monitor.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 性能监控主模块，组装采集器与核心上报能力（实现见 monitor-core / monitor-collectors）
 */

const CONFIG = require("./monitor-config");
const core = require("./monitor-core");
const report = require("./monitor-report");
const observers = require("./monitor-observers");
const scheduler = require("./monitor-scheduler");
const collectors = require("./monitor-collectors");

/**
 * 初始化监控
 * @param {Object} [config] 自定义配置，可选
 */
function init(config = {}) {
  Object.assign(CONFIG, config);

  if (CONFIG.enableNetworkMonitor) {
    collectors.monitorNetwork();
  }
  if (CONFIG.enableFPSMonitor) {
    collectors.monitorFPS();
  }
  if (CONFIG.enableMemoryMonitor) {
    collectors.monitorMemory();
  }
  if (CONFIG.enablePageLoadMonitor) {
    collectors.monitorPageLoad();
  }
  if (CONFIG.enableApiMonitor) {
    collectors.monitorApi();
  }
  if (CONFIG.enableAutoReport) {
    scheduler.startAutoReport();
  }

  report.behavior("monitor_init", {
    appId: CONFIG.appId,
    sessionId: core.getSessionId(),
  });
}

/**
 * 销毁监控
 */
function destroy() {
  scheduler.stopAutoReport();
  collectors.resetCollectors();
}

const monitor = {
  init,
  destroy,
  error: report.error,
  performance: report.performance,
  behavior: report.behavior,
  reportData: core.reportData,
  setBehaviorMode: core.setBehaviorMode,
  mark: observers.mark,
  measure: observers.measure,
  addRouteObserver: observers.addRouteObserver,
  removeRouteObserver: observers.removeRouteObserver,
  startAutoReport: scheduler.startAutoReport,
  stopAutoReport: scheduler.stopAutoReport,
};

module.exports = monitor;
module.exports.default = monitor;
