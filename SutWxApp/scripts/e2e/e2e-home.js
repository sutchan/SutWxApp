/**
 * 文件名: e2e-home.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 首页 E2E 流程（QA-003）：启动加载、轮播/分类渲染、搜索交互。
 */

/**
 * 执行首页流程
 * @param {Object} ctx { miniProgram, page, config, step }
 * @returns {Promise<Array<string>>} 已执行步骤描述
 */
async function runHomeFlows(ctx) {
  const { miniProgram, config, step } = ctx;
  const steps = [];

  const page = await miniProgram.reLaunch("/pages/home/index");
  steps.push(await step("首页启动加载", async () => {
    await page.waitFor(config.timeout);
    const data = await page.data();
    if (!data || typeof data !== "object") throw new Error("首页无数据");
  }));

  steps.push(await step("首页核心区域渲染", async () => {
    const banner = await page.$$(".banner, .swiper");
    if (!banner.length) throw new Error("未渲染轮播/横幅区域");
  }));

  steps.push(await step("搜索输入与联想", async () => {
    const input = await page.$$("#search, .search-input, input");
    if (!input.length) throw new Error("未找到搜索框");
    await input[0].input("绿萝");
    await page.waitFor(800);
    const data = await page.data();
    const hasSuggestion =
      (Array.isArray(data.searchSuggestions) && data.searchSuggestions.length > 0) ||
      (Array.isArray(data.suggestions) && data.suggestions.length > 0) ||
      (data.searchKeyword === "绿萝");
    if (!hasSuggestion) throw new Error("搜索输入后无联想/关键词回显");
  }));

  return steps;
}

module.exports = { runHomeFlows };
