/**
 * 文件名: request-cache.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: request.js 的 LRU 请求缓存实现（独立维护缓存状态，与请求主逻辑解耦）
 */

const CONFIG = require("./request-config");

// 使用 Map 和数组结合实现更高效的 LRU 缓存
const requestCache = new Map();
const requestCacheOrder = [];
let cacheCleanupTimer = null;

/**
 * LRU缓存实现 - 设置缓存
 * @param {string} key 缓存键名
 * @param {*} data 缓存数据
 */
function cacheSet(key, data) {
  if (!CONFIG.enableCache) return;

  const now = Date.now();
  const cacheItem = { data, timestamp: now, cacheKey: key };

  if (requestCache.has(key)) {
    requestCache.delete(key);
    const orderIndex = requestCacheOrder.indexOf(key);
    if (orderIndex >= 0) {
      requestCacheOrder.splice(orderIndex, 1);
    }
  }

  requestCache.set(key, cacheItem);
  requestCacheOrder.unshift(key);

  if (requestCache.size > CONFIG.maxCacheSize) {
    const oldestKey = requestCacheOrder.pop();
    if (oldestKey) {
      requestCache.delete(oldestKey);
    }
  }

  startCacheCleanup();
}

/**
 * LRU缓存实现 - 获取缓存
 * @param {string} key 缓存键名
 * @returns {*|null} 缓存数据，如果缓存不存在或过期则返回 null
 */
function cacheGet(key) {
  if (!CONFIG.enableCache) return null;

  if (requestCache.has(key)) {
    const cacheItem = requestCache.get(key);
    const now = Date.now();

    if (now - cacheItem.timestamp < CONFIG.cacheTimeout) {
      const orderIndex = requestCacheOrder.indexOf(key);
      if (orderIndex >= 0) {
        requestCacheOrder.splice(orderIndex, 1);
        requestCacheOrder.unshift(key);
      }
      return cacheItem.data;
    } else {
      requestCache.delete(key);
      const orderIndex = requestCacheOrder.indexOf(key);
      if (orderIndex >= 0) {
        requestCacheOrder.splice(orderIndex, 1);
      }
    }
  }
  return null;
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache() {
  if (!CONFIG.enableCache) return;

  const now = Date.now();
  let removedCount = 0;

  for (const [key, cacheItem] of requestCache.entries()) {
    if (now - cacheItem.timestamp >= CONFIG.cacheTimeout) {
      requestCache.delete(key);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    requestCacheOrder.length = 0;
    requestCacheOrder.push(...requestCache.keys());
  }
}

/**
 * 启动定期清理过期缓存
 */
function startCacheCleanup() {
  if (cacheCleanupTimer) return;

  const globalObj =
    typeof window !== "undefined"
      ? window
      : typeof wx !== "undefined"
        ? wx
        : typeof global !== "undefined"
          ? global
          : {};

  cacheCleanupTimer = (globalObj.setInterval || setTimeout)(() => {
    cleanupExpiredCache();
  }, 5 * 60 * 1000);
}

/**
 * 停止定期清理过期缓存
 */
function stopCacheCleanup() {
  if (cacheCleanupTimer) {
    const globalObj =
      typeof window !== "undefined"
        ? window
        : typeof wx !== "undefined"
          ? wx
          : typeof global !== "undefined"
            ? global
            : {};
    (globalObj.clearInterval || globalObj.clearTimeout)(cacheCleanupTimer);
    cacheCleanupTimer = null;
  }
}

/**
 * 清空缓存
 */
function clearCache() {
  requestCache.clear();
  requestCacheOrder.length = 0;
}

/**
 * 移除指定缓存
 * @param {string} key 缓存键名
 */
function removeCache(key) {
  if (requestCache.has(key)) {
    requestCache.delete(key);
    const orderIndex = requestCacheOrder.indexOf(key);
    if (orderIndex >= 0) {
      requestCacheOrder.splice(orderIndex, 1);
    }
  }
}

/**
 * 获取当前缓存条目数
 * @returns {number}
 */
function getCacheSize() {
  return requestCache.size;
}

module.exports = {
  cacheSet,
  cacheGet,
  cleanupExpiredCache,
  startCacheCleanup,
  stopCacheCleanup,
  clearCache,
  removeCache,
  getCacheSize,
};
