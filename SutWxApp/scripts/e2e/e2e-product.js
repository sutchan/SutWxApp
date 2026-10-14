/**
 * 文件名: e2e-product.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 商品详情 E2E 流程（QA-003）：从首页进入详情、加购行为。
 */

/**
 * 执行商品详情流程
 * @param {Object} ctx { miniProgram, config, step }
 * @returns {Promise<Array<string>>} 已执行步骤描述
 */
async function runProductFlows(ctx) {
  const { miniProgram, config, step } = ctx;
  const steps = [];

  steps.push(await step("进入商品详情", async () => {
    const home = await miniProgram.reLaunch("/pages/home/index");
    await home.waitFor(config.timeout);
    const card = await home.$$(".product-card, .product-item");
    if (!card.length) throw new Error("首页无商品卡片");
    await card[0].tap();
    await miniProgram.sleep(1000);
    const current = await miniProgram.currentPage();
    const route = await current.route();
    if (!String(route).includes("/pages/product/")) {
      throw new Error(`未跳转到商品详情，当前路由: ${route}`);
    }
  }));

  steps.push(await step("商品详情核心信息", async () => {
    const page = await miniProgram.currentPage();
    const data = await page.data();
    if (!data.product || !data.product.name) throw new Error("商品详情数据为空");
  }));

  steps.push(await step("加入购物车", async () => {
    const page = await miniProgram.currentPage();
    const btn = await page.$$(".add-cart-btn, .cart-btn, button");
    if (!btn.length) throw new Error("未找到加购按钮");
    await btn[0].tap();
    await miniProgram.sleep(800);
    const cart = await miniProgram.navigateTo("/pages/cart/index");
    await cart.waitFor(config.timeout);
    const cartData = await cart.data();
    const list = cartData.cartList || cartData.carts || [];
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error("加购后购物车为空");
    }
  }));

  return steps;
}

module.exports = { runProductFlows };
