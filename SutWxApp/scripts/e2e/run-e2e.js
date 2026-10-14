/**
 * 文件名: run-e2e.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: E2E 运行入口（QA-003）：启动 miniprogram-automator 并按套件执行核心流程。
 *
 * 前置条件：
 *   1. 安装依赖：npm install（含 devDependency miniprogram-automator）
 *   2. 微信开发者工具开启「安全模式」下的服务端口（设置 → 安全 → 服务端口）
 *   3. 环境变量（可选）：WECHAT_CLI_PATH / WECHAT_AUTOMATOR_PORT / E2E_TIMEOUT
 *
 * 运行：npm run test:e2e
 */

const { config, SUITES } = require("./e2e-config");

/** 简单步骤包装：记录耗时与结果 */
function createStepReporter(results) {
  return async function step(name, fn) {
    const started = Date.now();
    try {
      await fn();
      results.push({ name, ok: true, ms: Date.now() - started });
      console.log(`  ✓ ${name} (${Date.now() - started}ms)`);
      return name;
    } catch (err) {
      results.push({ name, ok: false, ms: Date.now() - started, error: err.message });
      console.error(`  ✗ ${name}: ${err.message}`);
      throw err;
    }
  };
}

/** 依次执行全部套件，单套件失败不中断后续（汇总后统一退出码） */
async function runSuites(miniProgram) {
  const results = [];
  let failedSuites = 0;

  for (const suite of SUITES) {
    console.log(`\n[套件] ${suite.name}`);
    const mod = require(suite.file);
    const run = mod[suite.export];
    if (typeof run !== "function") {
      console.error(`  ✗ 套件 ${suite.file} 未导出 ${suite.export}`);
      failedSuites += 1;
      continue;
    }
    try {
      await run({ miniProgram, config, step: createStepReporter(results) });
    } catch (err) {
      failedSuites += 1;
    }
  }

  return { results, failedSuites };
}

async function main() {
  let automator;
  try {
    automator = require("miniprogram-automator");
  } catch (err) {
    console.error(
      "未安装 miniprogram-automator，请先在 SutWxApp/ 执行：npm install",
    );
    process.exit(2);
  }

  console.log("启动微信开发者工具自动化…");
  console.log(`  项目路径: ${config.projectPath}`);
  console.log(`  自动化端口: ${config.port}`);

  let miniProgram;
  try {
    miniProgram = await automator.launch({
      cliPath: config.cliPath,
      projectPath: config.projectPath,
      timeout: config.timeout,
    });
  } catch (err) {
    console.error(`\n启动失败：${err.message}`);
    console.error(
      "请确认：① 微信开发者工具已登录；② 设置 → 安全 → 服务端口已开启；" +
        "③ 必要时设置 WECHAT_CLI_PATH 指向开发者工具 cli 目录。",
    );
    process.exit(2);
  }

  const { results, failedSuites } = await runSuites(miniProgram);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log(`\n========== E2E 结果 ==========`);
  console.log(`步骤: ${passed} 通过 / ${failed} 失败；失败套件: ${failedSuites}`);

  if (config.autoClose) {
    try {
      await miniProgram.close();
      if (automator.closeAll) await automator.closeAll();
    } catch (err) {
      console.error(`关闭开发者工具失败: ${err.message}`);
    }
  }

  process.exit(failed > 0 || failedSuites > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`E2E 运行异常: ${err && err.message}`);
  process.exit(2);
});
