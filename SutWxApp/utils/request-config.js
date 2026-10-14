/**
 * 文件名: request-config.js
 * 版本号: 3.5.1
 * 更新日期: 2026-09-12
 * 描述: request.js 的共享默认配置对象（单例引用，被缓存/安全/主模块共用）
 */

// 单例配置：被 request.js 主模块、request-cache.js、request-security.js 共享同一引用
module.exports = {
  baseURL: "",
  timeout: 10000,
  retry: 1,
  retryDelay: 1000,
  enableCache: true,
  cacheTimeout: 300000,
  enableOffline: false, // FE-003：断网时回退离线快照（默认关闭，按需开启）
  enableQueue: true,
  maxConcurrent: 5,
  maxCacheSize: 50,
  enableCsrf: true,
  enableXssProtection: true,
};
