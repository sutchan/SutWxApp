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

module.exports = {
  pickCategory,
};
