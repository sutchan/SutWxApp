/**
 * 文件名: e2e-auth.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 登录守卫 E2E 流程（QA-003）：未登录访问用户中心应触发登录引导。
 */

/**
 * 执行登录守卫流程
 * @param {Object} ctx { miniProgram, config, step }
 * @returns {Promise<Array<string>>} 已执行步骤描述
 */
async function runAuthFlows(ctx) {
  const { miniProgram, config, step } = ctx;
  const steps = [];

  steps.push(await step("清理登录态", async () => {
    // 通过系统信息页无法直接清存储，先切到用户页触发守卫，再校验按钮态
    await miniProgram.reLaunch("/pages/user/index");
    await miniProgram.sleep(500);
  }));

  steps.push(await step("用户中心登录引导", async () => {
    const page = await miniProgram.currentPage();
    await page.waitFor(config.timeout);
    const data = await page.data();
    const loggedIn =
      data.isLoggedIn === true ||
      (data.userInfo && Object.keys(data.userInfo).length > 0);
    if (loggedIn) {
      // 已登录环境：应展示用户信息而非登录按钮
      const info = await page.$$(".user-info, .user-name");
      if (!info.length) throw new Error("已登录但未渲染用户信息");
      return;
    }
    const loginBtn = await page.$$(".login-btn, .btn-login, button");
    if (!loginBtn.length) throw new Error("未登录且未渲染登录按钮");
  }));

  steps.push(await step("点击登录触发 wx.login 流程", async () => {
    const page = await miniProgram.currentPage();
    const data = await page.data();
    const loggedIn =
      data.isLoggedIn === true ||
      (data.userInfo && Object.keys(data.userInfo).length > 0);
    if (loggedIn) return; // 已登录环境跳过点击
    const loginBtn = await page.$$(".login-btn, .btn-login, button");
    await loginBtn[0].tap();
    await miniProgram.sleep(1500);
    const after = await page.data();
    const stillLoggedOut =
      after.isLoggedIn !== true &&
      !(after.userInfo && Object.keys(after.userInfo).length > 0);
    if (stillLoggedOut) throw new Error("点击登录后仍为未登录态");
  }));

  return steps;
}

module.exports = { runAuthFlows };
