/**
 * 文件名: utils.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: 首页纯函数工具（轮播图数据规整）
 */

/**
 * 将后端轮播图数据规整为展示结构
 * @param {Array|*} data 后端返回数据
 * @returns {Array<{image:string, link:string}>}
 */
function buildBannerList(data) {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    image: item.image || item.img || "",
    link: item.link || item.url || "",
  }));
}

module.exports = {
  buildBannerList,
};
