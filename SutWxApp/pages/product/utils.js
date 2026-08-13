/**
 * 文件名: utils.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: 商品详情页纯函数工具（价格/库存/可见图片计算）
 */

/**
 * 根据商品信息与当前选中规格索引计算展示价格
 * @param {Object} productInfo 商品信息
 * @param {number} selectedSpecIndex 选中的规格索引
 * @returns {number} 价格（无规格时取商品基础价，异常为 0）
 */
function getCurrentSpecPrice(productInfo, selectedSpecIndex) {
  if (
    productInfo &&
    productInfo.specs &&
    productInfo.specs[selectedSpecIndex]
  ) {
    return productInfo.specs[selectedSpecIndex].price;
  }
  return productInfo ? productInfo.price : 0;
}

/**
 * 计算首屏可见图片索引数组（前两张预加载）
 * @param {Array<string>} images 图片列表
 * @returns {Array<boolean>} 与 images 等长的可见性数组
 */
function buildVisibleImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((_, index) => index < 2);
}

/**
 * 计算图片已加载状态映射（前两张初始化为已加载）
 * @param {Array<string>} images 图片列表
 * @returns {Object} 索引 -> 是否已加载
 */
function buildImageLoadedMap(images) {
  if (!Array.isArray(images)) return {};
  return images.reduce((acc, _, index) => {
    acc[index] = index < 2;
    return acc;
  }, {});
}

/**
 * 安全计算库存上限（缺省 99）
 * @param {number} [stock] 库存
 * @returns {number}
 */
function safeStock(stock) {
  return typeof stock === "number" && stock > 0 ? stock : 99;
}

module.exports = {
  getCurrentSpecPrice,
  buildVisibleImages,
  buildImageLoadedMap,
  safeStock,
};
