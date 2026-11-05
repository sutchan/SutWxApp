/**
 * 文件名: monitor-config.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的默认配置（单例引用，被 core / collectors 共用）
 */

const env = require("./env");

const APP_ID = "sut-wx-app";

// FE-006：上报地址必须是绝对 URL（wx.request 不接受相对路径），
// 由多环境配置表（FE-007）按 develop/trial/release 组合出目标端点（BE-013）。
const REPORT_URL = env.apiUrl("/api/monitor/data");

module.exports = {
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
