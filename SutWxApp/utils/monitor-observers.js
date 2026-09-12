/**
 * 文件名: monitor-observers.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的性能标记与路由观察者（依赖 monitor-core 上报能力）
 */

const core = require("./monitor-core");
const { getCurrentTime } = require("./monitor-utils");

const performanceMarks = new Map();
const routeObservers = [];

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
 * @returns {number} 测量值（毫秒），如果标记不存在则返回 0
 */
function measure(markName, measureName) {
  const startTime = performanceMarks.get(markName);
  if (!startTime) return 0;
  const duration = getCurrentTime() - startTime;
  core.performance(measureName, duration);
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

module.exports = { mark, measure, addRouteObserver, removeRouteObserver };
