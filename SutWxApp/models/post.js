/**
 * 文件名: post.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 文章数据模型与 WordPress 文章映射层
 *       将 WordPress REST 返回的文章对象映射为小程序统一的文章 DTO（正文经 rich-text 安全清洗）。
 */

const { sanitizeArticleHtml } = require("../utils/richtext");
const { stripHtml } = require("../utils/text");

/**
 * 由 WP _embedded 中提取封面图地址
 * @param {Object} post WP 文章对象
 * @returns {string}
 */
function pickCover(post) {
  try {
    const media = post._embedded && post._embedded["wp:featuredmedia"];
    if (Array.isArray(media) && media[0] && media[0].source_url) {
      return media[0].source_url;
    }
  } catch (e) {
    // 忽略
  }
  return post.featured_image || "";
}

/**
 * 将 WordPress 文章对象映射为小程序文章 DTO
 * @param {Object} p WP 文章
 * @returns {Object|null}
 */
function mapWpPost(p) {
  if (!p || !p.id) return null;

  const title = (p.title && p.title.rendered) || p.title || "";
  const content = sanitizeArticleHtml(
    (p.content && p.content.rendered) || p.content || "",
  );
  const excerpt = stripHtml(
    (p.excerpt && p.excerpt.rendered) || p.excerpt || p.content || "",
  );

  return {
    id: p.id,
    title: stripHtml(title),
    content,
    excerpt: excerpt.slice(0, 60),
    cover: pickCover(p),
    date: p.date ? String(p.date).slice(0, 10) : "",
    link: p.link || "",
    author: p.author || "",
    category: Array.isArray(p.categories) ? p.categories[0] || 0 : 0,
  };
}

/**
 * 批量映射文章列表
 * @param {Array<Object>} arr 原始文章数组
 * @returns {Array<Object>}
 */
function mapWpPosts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(mapWpPost).filter(Boolean);
}

module.exports = {
  stripHtmlToText: stripHtml,
  mapWpPost,
  mapWpPosts,
  pickCover,
};
