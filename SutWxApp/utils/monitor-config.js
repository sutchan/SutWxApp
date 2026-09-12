/**
 * 文件名: monitor-config.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: monitor.js 的默认配置（单例引用，被 core / collectors 共用）
 */

const REPORT_URL = "/api/monitor/data";
const APP_ID = "sut-wx-app";

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
