/**
 * 文件名: text.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 文本处理公共函数（安全数字转换、HTML 标签清洗），被各数据模型复用以消除重复
 */

/**
 * 安全转为数字
 * @param {*} value 原始值
 * @param {number} fallback 失败回退值
 * @returns {number}
 */
function toNumber(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = parseFloat(value);
  return Number.isNaN(n) ? fallback : n;
}

/**
 * 去除 HTML 标签（用于摘要/短描述）
 * @param {string} html 原始 HTML
 * @returns {string}
 */
function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { toNumber, stripHtml };
