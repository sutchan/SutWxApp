/**
 * 文件名: parts.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: 首页业务子逻辑（分类索引校验等）
 */

/**
 * 安全解析选中的分类索引
 * @param {string|number} index 原始索引
 * @returns {number}
 */
function pickCategory(index) {
  const num = parseInt(index, 10);
  return Number.isNaN(num) || num < 0 ? 0 : num;
}

const SEARCH_HISTORY_KEY = "sut_search_history_v1";
const DEFAULT_SEARCH_HISTORY = ["琴叶榕", "龟背竹", "虎皮兰"];

function loadSearchHistory() {
  try {
    const list = wx.getStorageSync(SEARCH_HISTORY_KEY);
    if (Array.isArray(list)) return list.slice(0, 3);
  } catch (e) {}
  return DEFAULT_SEARCH_HISTORY.slice(0, 3);
}

function saveSearchHistory(list) {
  try {
    wx.setStorageSync(SEARCH_HISTORY_KEY, list.slice(0, 3));
  } catch (e) {}
}

function appendSearchKeyword(kw, currentList) {
  if (!kw || typeof kw !== "string") return currentList || [];
  const trimmed = kw.trim();
  if (!trimmed) return currentList || [];
  const filtered = (currentList || []).filter((item) => item !== trimmed);
  const next = [trimmed, ...filtered].slice(0, 3);
  saveSearchHistory(next);
  return next;
}

module.exports = {
  pickCategory,
  loadSearchHistory,
  saveSearchHistory,
  appendSearchKeyword,
};
