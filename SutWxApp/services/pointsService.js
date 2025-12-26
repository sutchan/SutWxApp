/**
 * 文件名: pointsService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 积分服务，处理积分获取、使用、查询等功能
 */

const request = require('../utils/request');
const store = require('../utils/store');

/**
 * 获取用户积分余额
 * @returns {Promise<Object>} 积分余额信息
 */
async function getPointsBalance() {
  try {
    const result = await request.get('/points/balance');
    // 更新本地积分缓存
    store.commit('SET_POINTS', result.balance);
    return result;
  } catch (error) {
    console.error('获取积分余额失败:', error);
    throw error;
  }
}

/**
 * 获取积分明细
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.type] - 积分类型：all/income/expense
 * @param {string} [params.startDate] - 开始日期
 * @param {string} [params.endDate] - 结束日期
 * @returns {Promise<Object>} 积分明细列表
 */
async function getPointsHistory(params = {}) {
  try {
    return request.get('/points/history', {
      page: 1,
      pageSize: 20,
      type: 'all',
      ...params
    });
  } catch (error) {
    console.error('获取积分明细失败:', error);
    throw error;
  }
}

/**
 * 获取积分任务列表
 * @param {Object} [params] - 查询参数
 * @param {string} [params.type='all'] - 任务类型：all/once/daily/weekly/monthly
 * @param {string} [params.status='all'] - 任务状态：all/pending/completed/unclaimed
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @returns {Promise<Object>} 积分任务列表
 */
async function getPointsTasks(params = {}) {
  try {
    return request.get('/points/tasks', {
      type: 'all',
      status: 'all',
      page: 1,
      pageSize: 20,
      ...params
    });
  } catch (error) {
    console.error('获取积分任务列表失败:', error);
    throw error;
  }
}

/**
 * 领取积分任务奖励
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 领取结果
 */
async function claimTaskReward(taskId) {
  try {
    const result = await request.post(`/points/tasks/${taskId}/claim`);
    // 更新本地积分缓存
    if (result.balance !== undefined) {
      store.commit('SET_POINTS', result.balance);
    }
    return result;
  } catch (error) {
    console.error('领取积分任务奖励失败:', error);
    throw error;
  }
}

/**
 * 完成积分任务
 * @param {string} taskId - 任务ID
 * @param {Object} [data] - 任务完成数据
 * @returns {Promise<Object>} 完成结果
 */
async function completeTask(taskId, data = {}) {
  try {
    return request.post(`/points/tasks/${taskId}/complete`, data);
  } catch (error) {
    console.error('完成积分任务失败:', error);
    throw error;
  }
}

/**
 * 使用积分
 * @param {number} amount - 积分数量
 * @param {string} reason - 使用原因
 * @param {Object} [data] - 额外数据
 * @returns {Promise<Object>} 使用结果
 */
async function usePoints(amount, reason, data = {}) {
  try {
    const result = await request.post('/points/use', {
      amount,
      reason,
      ...data
    });
    // 更新本地积分缓存
    if (result.balance !== undefined) {
      store.commit('SET_POINTS', result.balance);
    }
    return result;
  } catch (error) {
    console.error('使用积分失败:', error);
    throw error;
  }
}

/**
 * 积分兑换商品
 * @param {string} productId - 商品ID
 * @param {number} quantity - 兑换数量
 * @returns {Promise<Object>} 兑换结果
 */
async function exchangeProduct(productId, quantity = 1) {
  try {
    const result = await request.post('/points/exchange/product', {
      productId,
      quantity
    });
    // 更新本地积分缓存
    if (result.balance !== undefined) {
      store.commit('SET_POINTS', result.balance);
    }
    return result;
  } catch (error) {
    console.error('积分兑换商品失败:', error);
    throw error;
  }
}

/**
 * 获取积分兑换商品列表
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.category] - 商品分类
 * @param {string} [params.sort] - 排序方式：points_asc/points_desc/newest
 * @returns {Promise<Object>} 积分商品列表
 */
async function getExchangeProducts(params = {}) {
  try {
    return request.get('/points/exchange/products', {
      page: 1,
      pageSize: 20,
      ...params
    });
  } catch (error) {
    console.error('获取积分兑换商品列表失败:', error);
    throw error;
  }
}

/**
 * 获取积分规则
 * @returns {Promise<Object>} 积分规则
 */
async function getPointsRules() {
  try {
    return request.get('/points/rules');
  } catch (error) {
    console.error('获取积分规则失败:', error);
    throw error;
  }
}

/**
 * 获取积分统计
 * @param {Object} [params] - 查询参数
 * @param {string} [params.timeRange='month'] - 时间范围：week/month/quarter/year
 * @returns {Promise<Object>} 积分统计数据
 */
async function getPointsStats(params = {}) {
  try {
    return request.get('/points/stats', {
      timeRange: 'month',
      ...params
    });
  } catch (error) {
    console.error('获取积分统计失败:', error);
    throw error;
  }
}

module.exports = {
  getPointsBalance,
  getPointsHistory,
  getPointsTasks,
  claimTaskReward,
  completeTask,
  usePoints,
  exchangeProduct,
  getExchangeProducts,
  getPointsRules,
  getPointsStats
};
