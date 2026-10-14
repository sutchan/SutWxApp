/**
 * 文件名: offline-snapshot.js
 * 版本号: 3.5.1
 * 更新日期: 2026-10-14
 * 描述: 离线快照持久化（FE-003）。将最近一次成功的 GET 响应持久化到本地存储，
 *       网络异常时回退为离线快照，避免白屏。与 request-cache.js（内存 LRU）互补：
 *       后者用于同会话内的快速命中，本模块用于跨会话/断网兜底。
 */

const SNAPSHOT_PREFIX = "sutwx_snap:";
const MAX_SNAPSHOTS = 100;

/** 安全获取 wx 对象 */
function getWx() {
  if (typeof wx !== "undefined") return wx;
  return null;
}

/**
 * 保存离线快照
 * @param {string} key 缓存键（与请求 cacheKey 对齐）
 * @param {*} data 响应数据
 */
function saveSnapshot(key, data) {
  const wx = getWx();
  if (!wx || !key) return;
  try {
    wx.setStorageSync(SNAPSHOT_PREFIX + key, {
      data,
      ts: Date.now(),
    });
  } catch (e) {
    // 存储空间不足等异常忽略，不影响主流程
  }
}

/**
 * 读取离线快照
 * @param {string} key 缓存键
 * @returns {Object|null} { data, ts } 或 null（无快照/读取失败）
 */
function getSnapshot(key) {
  const wx = getWx();
  if (!wx || !key) return null;
  try {
    const snap = wx.getStorageSync(SNAPSHOT_PREFIX + key);
    if (snap && typeof snap === "object" && "data" in snap) {
      return snap;
    }
  } catch (e) {
    // 忽略读取异常
  }
  return null;
}

/**
 * 删除指定离线快照
 * @param {string} key 缓存键
 */
function removeSnapshot(key) {
  const wx = getWx();
  if (!wx || !key) return;
  try {
    wx.removeStorageSync(SNAPSHOT_PREFIX + key);
  } catch (e) {
    // 忽略
  }
}

/**
 * 清空全部离线快照（登出 / 清理时调用）
 */
function clearSnapshots() {
  const wx = getWx();
  if (!wx) return;
  try {
    const keys = wx.getStorageInfoSync
      ? wx.getStorageInfoSync().keys
      : [];
    keys.forEach((k) => {
      if (k.indexOf(SNAPSHOT_PREFIX) === 0) wx.removeStorageSync(k);
    });
  } catch (e) {
    // 忽略
  }
}

module.exports = {
  saveSnapshot,
  getSnapshot,
  removeSnapshot,
  clearSnapshots,
  MAX_SNAPSHOTS,
};
