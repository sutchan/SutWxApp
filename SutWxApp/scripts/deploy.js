/**
 * 文件名: deploy.js
 * 版本号: 1.0.0
 * 更新日期: 2026-09-12
 * 描述: 经 miniprogram-ci 生成预览二维码或上传体验版，供 GitHub Actions 与本地复用
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const projectConfig = require(path.join(PROJECT_ROOT, "project.config.json"));
const pkg = require(path.join(PROJECT_ROOT, "package.json"));

// 上传时忽略的开发文件，与 project.config.json 的 packOptions.ignore 保持一致
const IGNORE_RULES = [
  { type: "folder", value: "__tests__" },
  { type: "folder", value: "scripts" },
  { type: "folder", value: "node_modules" },
  { type: "folder", value: "coverage" },
  { type: "file", value: "package.json" },
  { type: "file", value: "package-lock.json" },
  { type: "file", value: ".eslintrc.js" },
  { type: "file", value: "utils/compress-images.js" },
];

/** 读取命令行参数 --name=value */
function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

/** 打印进度（避免 CI 日志刷屏，仅输出百分比变化） */
function createProgressLogger() {
  let lastPercent = -1;
  return (task) => {
    if (!task || typeof task.percentage !== "number") return;
    const percent = Math.floor(task.percentage);
    if (percent === lastPercent) return;
    lastPercent = percent;
    console.warn(`  ${task.message || "处理中"} ${percent}%`);
  };
}

/** 校验部署所需参数，缺失时终止 */
function resolveOptions() {
  const action = argValue("action", process.env.DEPLOY_ACTION || "preview");
  const version = argValue("version", process.env.DEPLOY_VERSION || pkg.version);
  const desc = argValue("desc", process.env.DEPLOY_DESC || `微信小程序 v${version}`);
  const appid = process.env.MINIPROGRAM_APPID || projectConfig.appid;
  const privateKeyPath = process.env.MINIPROGRAM_PRIVATE_KEY_PATH || path.join(PROJECT_ROOT, "private.key");

  if (!["preview", "upload"].includes(action)) {
    throw new Error(`不支持的动作 "${action}"，仅支持 preview 或 upload`);
  }
  if (!appid || appid === "touristappid") {
    throw new Error("AppID 无效：请设置环境变量 MINIPROGRAM_APPID，或在 project.config.json 中填写真实 AppID");
  }
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`未找到上传私钥：${privateKeyPath}（设置 MINIPROGRAM_PRIVATE_KEY_PATH 指定路径）`);
  }

  return { action, version, desc, appid, privateKeyPath };
}

/** 加载 miniprogram-ci（未安装时给出安装提示） */
function loadCi() {
  try {
    return require("miniprogram-ci");
  } catch (err) {
    throw new Error("未安装 miniprogram-ci，请先执行：npm install --no-save miniprogram-ci@^2");
  }
}

async function main() {
  const options = resolveOptions();
  const ci = loadCi();
  const onProgressUpdate = createProgressLogger();

  const project = new ci.Project({
    appid: options.appid,
    type: "miniProgram",
    projectPath: PROJECT_ROOT,
    privateKeyPath: options.privateKeyPath,
    ignores: IGNORE_RULES.map((rule) => (rule.type === "folder" ? `${rule.value}/**/*` : rule.value)),
  });

  const setting = { es6: true, es7: true, minify: true, autoPrefixWXSS: true, codeProtect: false };
  console.warn(`部署动作：${options.action}｜版本：${options.version}｜AppID：${options.appid}`);

  if (options.action === "preview") {
    const qrcodeOutputDest = path.join(PROJECT_ROOT, "preview.jpg");
    await ci.preview({ project, desc: options.desc, setting, qrcodeFormat: "image", qrcodeOutputDest, onProgressUpdate });
    console.warn(`预览二维码已生成：${qrcodeOutputDest}`);
    return;
  }

  await ci.upload({ project, version: options.version, desc: options.desc, setting, robot: 1, onProgressUpdate });
  console.warn("上传成功，请到微信公众平台「版本管理 > 开发版本」提交审核。");
}

main().catch((err) => {
  console.error(`\n部署失败：${err.message}`);
  console.error("排查建议：确认私钥与 AppID 匹配、上传 IP 已在公众平台加入白名单、当前账号具备代码上传权限。");
  process.exit(1);
});
