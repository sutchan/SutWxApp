/**
 * 文件名: utils.js
 * 版本号: 3.5.10
 * 更新日期: 2026-08-13
 * 描述: 首页纯函数工具（轮播图数据规整）
 */

/**
 * 将后端轮播图数据规整为展示结构
 * @param {Array|*} data 后端返回数据
 * @returns {Array<{image:string, link:string}>}
 */
function buildBannerList(data) {
  // 后端 list 端点返回 {list:[...]} 或直接数组，两种都兼容。
  const arr = Array.isArray(data)
    ? data
    : (data && Array.isArray(data.list) ? data.list : []);
  return arr.map((item) => ({
    id: item.id || item.imageUrl || item.image || "",
    // WXML 绑定的是 imageUrl，历史实现输出 image 导致图片恒空。
    imageUrl: item.imageUrl || item.image || item.img || "",
    link: item.link || item.url || "",
  }));
}

module.exports = {
  buildBannerList,
};
