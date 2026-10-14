/**
 * 文件名: e2e-config.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: E2E 运行配置（QA-003）：自动化端口、项目路径、超时与重试策略。
 *       路径基于本文件位置推导，兼容不同克隆目录。
 */

const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", ".."); // SutWxApp/
const REPO_ROOT = path.resolve(PROJECT_ROOT, ".."); // 仓库根

const config = {
  // 微信开发者工具「安全模式」下 CLI 自动化端口（命令行启动时 --auto ... 或设置里开启服务端口）
  cliPath: process.env.WECHAT_CLI_PATH || undefined,
  port: Number(process.env.WECHAT_AUTOMATOR_PORT || 9420),
  projectPath: PROJECT_ROOT,
  // 单步操作超时（毫秒）
  timeout: Number(process.env.E2E_TIMEOUT || 20000),
  // 失败重试次数
  retry: Number(process.env.E2E_RETRY || 0),
  // 是否在结束后自动关闭开发者工具
  autoClose: process.env.E2E_AUTO_CLOSE !== "false",
};

/** E2E 用例集定义（供 run-e2e.js 编排） */
const SUITES = [
  { name: "首页与搜索", file: "./e2e-home.js", export: "runHomeFlows" },
  { name: "商品详情", file: "./e2e-product.js", export: "runProductFlows" },
  { name: "购物车", file: "./e2e-cart.js", export: "runCartFlows" },
  { name: "登录守卫", file: "./e2e-auth.js", export: "runAuthFlows" },
];

module.exports = { config, SUITES, PROJECT_ROOT, REPO_ROOT };
