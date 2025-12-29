/**
 * 文件名: app.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-29 19:30
 * 描述: 微信小程序端到端测试，覆盖核心用户场景
 */

const automator = require("miniprogram-automator");

/**
 * 主测试套件
 */
describe("苏铁微信小程序端到端测试", () => {
  let miniProgram;
  let page;

  /**
   * 在所有测试开始前启动小程序
   */
  beforeAll(async () => {
    miniProgram = await automator.launch({
      // 小程序的项目目录
      projectPath: "E:\\Dropbox\\GitHub\\SutWxApp\\SutWxApp",
      // 启用调试模式
      show: true,
      // 调试端口
      port: 9999,
    });
  });

  /**
   * 在所有测试结束后关闭小程序
   */
  afterAll(async () => {
    await miniProgram.close();
  });

  /**
   * 在每个测试开始前进入首页
   */
  beforeEach(async () => {
    // 进入首页
    page = await miniProgram.reLaunch("/pages/home/index");
    // 等待页面加载完成
    await page.waitFor(1000);
  });

  /**
   * 测试首页加载
   */
  test("首页应该能够正常加载", async () => {
    // 检查页面标题
    const title = await page.$(".page-title");
    expect(title).toBeTruthy();

    // 检查首页轮播图
    const swiper = await page.$(".home-swiper");
    expect(swiper).toBeTruthy();

    // 检查商品列表
    const productList = await page.$(".product-list");
    expect(productList).toBeTruthy();
  });

  /**
   * 测试商品分类页面
   */
  test("应该能够进入商品分类页面", async () => {
    // 点击底部TabBar的分类按钮
    await page.tabBar.tap(1); // 分类是第二个Tab

    // 等待页面加载
    await page.waitFor(1000);

    // 检查分类页面的标题
    const categoryTitle = await page.$(".category-title");
    expect(categoryTitle).toBeTruthy();

    // 检查分类列表
    const categoryList = await page.$(".category-list");
    expect(categoryList).toBeTruthy();
  });

  /**
   * 测试用户中心页面
   */
  test("应该能够进入用户中心页面", async () => {
    // 点击底部TabBar的我的按钮
    await page.tabBar.tap(2); // 我的是第三个Tab

    // 等待页面加载
    await page.waitFor(1000);

    // 检查用户中心页面的标题
    const userTitle = await page.$(".user-title");
    expect(userTitle).toBeTruthy();

    // 检查用户信息区域
    const userInfo = await page.$(".user-info");
    expect(userInfo).toBeTruthy();
  });

  /**
   * 测试商品详情页面
   */
  test("应该能够进入商品详情页面", async () => {
    // 点击第一个商品
    await page.$(".product-item").tap();

    // 等待页面加载
    await page.waitFor(1000);

    // 检查商品详情页面的标题
    const detailTitle = await page.$(".product-detail-title");
    expect(detailTitle).toBeTruthy();

    // 检查商品价格
    const price = await page.$(".product-price");
    expect(price).toBeTruthy();
  });

  /**
   * 测试地址管理页面
   */
  test("应该能够进入地址管理页面", async () => {
    // 首先进入用户中心
    await page.tabBar.tap(2);
    await page.waitFor(1000);

    // 点击地址管理入口
    await page.$(".address-entry").tap();
    await page.waitFor(1000);

    // 检查地址管理页面的标题
    const addressTitle = await page.$(".address-title");
    expect(addressTitle).toBeTruthy();
  });

  /**
   * 测试设置页面
   */
  test("应该能够进入设置页面", async () => {
    // 首先进入用户中心
    await page.tabBar.tap(2);
    await page.waitFor(1000);

    // 点击设置入口
    await page.$(".settings-entry").tap();
    await page.waitFor(1000);

    // 检查设置页面的标题
    const settingsTitle = await page.$(".settings-title");
    expect(settingsTitle).toBeTruthy();
  });

  /**
   * 测试帮助页面
   */
  test("应该能够进入帮助页面", async () => {
    // 首先进入用户中心
    await page.tabBar.tap(2);
    await page.waitFor(1000);

    // 点击帮助入口
    await page.$(".help-entry").tap();
    await page.waitFor(1000);

    // 检查帮助页面的标题
    const helpTitle = await page.$(".help-title");
    expect(helpTitle).toBeTruthy();
  });
});
