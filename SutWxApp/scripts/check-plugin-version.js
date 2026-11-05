/**
 * 文件名: check-plugin-version.js
 * 版本号: 3.5.11
 * 更新日期: 2026-11-05
 * 描述: 插件版本一致性校验（OPS-006）：比对插件入口常量、插件头 Version、readme Stable tag 三处，
 *       任一不一致即退出非 0。CI 与 Release 工作流共用。
 *       用法：node SutWxApp/scripts/check-plugin-version.js [--print]
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "../..");
const PLUGIN_DIR = path.join(REPO_ROOT, "sutwx-app-api");
const ENTRY = path.join(PLUGIN_DIR, "sutwx-app-api.php");
const README = path.join(PLUGIN_DIR, "readme.txt");
const SEMVER = /^\d+\.\d+\.\d+$/;

const errors = [];

function readOrFail(file) {
  if (!fs.existsSync(file)) {
    errors.push(`缺少文件：${path.relative(REPO_ROOT, file)}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

const entryText = readOrFail(ENTRY);
const readmeText = readOrFail(README);

// 1. 入口常量 SUTWX_API_VERSION
const constMatch = entryText.match(/define\(\s*'SUTWX_API_VERSION',\s*'([^']+)'\s*\)/);
if (!constMatch) {
  errors.push("sutwx-app-api.php 未找到 define( 'SUTWX_API_VERSION', ... )");
}

// 2. 入口插件头 Version
const headerMatch = entryText.match(/^\s*\*?\s*Version:\s*([\d.]+)\s*$/m);

// 3. readme.txt Stable tag
const stableMatch = readmeText.match(/^Stable tag:\s*([\d.]+)\s*$/m);

const versions = [
  { name: "SUTWX_API_VERSION", value: constMatch ? constMatch[1] : null },
  { name: "插件头 Version", value: headerMatch ? headerMatch[1] : null },
  { name: "readme.txt Stable tag", value: stableMatch ? stableMatch[1] : null },
];

for (const v of versions) {
  if (!v.value) {
    if (!(v.name === "插件头 Version" && !headerMatch)) {
      errors.push(`${v.name} 未找到`);
    }
  } else if (!SEMVER.test(v.value)) {
    errors.push(`${v.name} 版本 "${v.value}" 不符合 SemVer（x.y.z）`);
  }
}

const values = [...new Set(versions.map((v) => v.value).filter(Boolean))];
if (values.length > 1) {
  errors.push(
    "插件版本不一致：" + versions.map((v) => `${v.name}=${v.value || "缺失"}`).join("，")
  );
}

if (process.argv.includes("--print") && values.length === 1) {
  process.stdout.write(values[0]);
}

if (errors.length) {
  console.error(`[FAIL] 插件版本校验未通过（${errors.length} 项）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`[PASS] 插件版本一致：${values[0]}（常量 / 插件头 / readme）`);
