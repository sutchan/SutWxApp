/**
 * 文件名: dataSource.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 数据源判定（'mock' | 'woocommerce'），被各服务层复用
 */

/**
 * 读取当前数据源
 * @returns {'mock'|'woocommerce'}
 */
function getDataSource() {
  try {
    const app = typeof getApp === "function" ? getApp() : null;
    if (app && app.globalData && app.globalData.productSource) {
      return app.globalData.productSource;
    }
  } catch (e) {
    // 测试或非小程序环境：回退 mock
  }
  return "mock";
}

module.exports = { getDataSource };
