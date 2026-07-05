
/**
 * 文件名: categoryService.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 分类服务层，提供分类相关功能
 */

const mockCategories = [
  { id: 1, name: "热门推荐", icon: "" },
  { id: 2, name: "绿色植物", icon: "" },
  { id: 3, name: "多肉植物", icon: "" },
  { id: 4, name: "鲜花花卉", icon: "" },
  { id: 5, name: "花盆花器", icon: "" },
  { id: 6, name: "园艺工具", icon: "" },
  { id: 7, name: "营养土肥", icon: "" }
];

/**
 * 获取分类列表
 * @returns {Promise<Array>} 分类列表
 */
async function getCategoryList() {
  try {
    return mockCategories;
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return [];
  }
}

/**
 * 获取分类详情
 * @param {number} categoryId 分类ID
 * @returns {Promise<Object|null>} 分类详情
 */
async function getCategoryDetail(categoryId) {
  try {
    const category = mockCategories.find(c => c.id == categoryId);
    return category || null;
  } catch (error) {
    console.error("获取分类详情失败:", error);
    return null;
  }
}

module.exports = {
  getCategoryList,
  getCategoryDetail
};
