/**
 * 文件名: monitor-report.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的错误/性能/行为上报实现（依赖 monitor-core 缓冲能力）
 */

const CONFIG = require("./monitor-config");
const core = require("./monitor-core");
const { getSystemInfo } = require("./monitor-utils");

/**
 * 上报错误
 * @param {Error|string} error 错误对象或错误信息
 * @param {Object} [context] 错误上下文，可选
 */
function error(error, context) {
  if (!CONFIG.enableError) return;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : "";
  const errorData = core.createMonitorData("error", "error", {
    message: errorMessage,
    stack,
    context: context || {},
    systemInfo: getSystemInfo(),
  });
  core.addToBuffer(errorData);
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
  if (!CONFIG.enablePerformance) return;
  const perfData = core.createMonitorData("performance", "performance", {
    name,
    value,
    context: context || {},
  });
  core.addToBuffer(perfData);
}

/**
 * 上报用户行为
 * @param {string} action 用户行为名称
 * @param {Object} [data] 行为相关数据，可选
 */
function behavior(action, data) {
  if (!CONFIG.enableBehavior) return;
  const behaviorData = core.createMonitorData("behavior", "behavior", {
    action,
    data: data || {},
  });
  core.addToBuffer(behaviorData);
}

module.exports = { error, performance, behavior };
