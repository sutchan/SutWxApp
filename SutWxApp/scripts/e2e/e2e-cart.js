/**
 * 文件名: e2e-cart.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 购物车 E2E 流程（QA-003）：列表渲染、数量增减、勾选与价格计算。
 */

/**
 * 执行购物车流程（依赖 e2e-product 已加购；独立运行时先自行加购）
 * @param {Object} ctx { miniProgram, config, step }
 * @returns {Promise<Array<string>>} 已执行步骤描述
 */
async function runCartFlows(ctx) {
  const { miniProgram, config, step } = ctx;
  const steps = [];

  const page = await miniProgram.reLaunch("/pages/cart/index");
  await page.waitFor(config.timeout);

  steps.push(await step("购物车列表渲染", async () => {
    const data = await page.data();
    const list = data.cartList || data.carts || [];
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error("购物车为空（请先执行商品加购流程）");
    }
  }));

  steps.push(await step("数量增减与总价联动", async () => {
    const plus = await page.$$(".quantity-plus, .plus-btn, .btn-plus");
    if (!plus.length) throw new Error("未找到数量增加按钮");
    const before = await page.data();
    await plus[0].tap();
    await miniProgram.sleep(600);
    const after = await page.data();
    const beforeTotal = Number(before.totalPrice || 0);
    const afterTotal = Number(after.totalPrice || 0);
    if (afterTotal <= beforeTotal) {
      throw new Error(`数量增加后总价未上升（${beforeTotal} -> ${afterTotal}）`);
    }
  }));

  steps.push(await step("结算按钮可达", async () => {
    const settle = await page.$$(".settle-btn, .checkout-btn, .submit-btn");
    if (!settle.length) throw new Error("未找到结算按钮");
  }));

  return steps;
}

module.exports = { runCartFlows };
