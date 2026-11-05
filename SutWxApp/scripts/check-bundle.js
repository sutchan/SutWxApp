/**
 * 文件名: check-bundle.js
 * 版本号: 3.5.11
 * 更新日期: 2026-11-05
 * 描述: 包体预算校验（FE-008）：统计主包源码体积（不含分包/测试/脚本），超阈值退出非 0。
 *       用法：node scripts/check-bundle.js [--max=1.5]（单位 MB）
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// 微信主包上限 2M，此处预算线 1.5M 留出余量（CI 门禁）。
const DEFAULT_MAX_MB = 1.5;
const argMax = (process.argv.find((a) => a.startsWith("--max=")) || "").split("=")[1];
const MAX_MB = Number(argMax) > 0 ? Number(argMax) : DEFAULT_MAX_MB;

// 不参与上传包体的目录与文件模式。
const EXCLUDE_DIRS = new Set([
  "node_modules", "__tests__", "scripts", ".git", "coverage",
  "miniprogram_npm", ".miniprogram-ci",
]);
const EXCLUDE_FILE = /\.(md|lock|log|cjs|mjs|map|bak|tmp)$/i;
// 分包页面目录（app.json subpackages 的 root 内、且不在主包 pages 列表中的页面）。
const SUBPACKAGE_PAGE_DIRS = [
  path.join(ROOT, "pages", "address"),
  path.join(ROOT, "pages", "settings"),
  path.join(ROOT, "pages", "help"),
  path.join(ROOT, "pages", "article"),
];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (!EXCLUDE_FILE.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const all = walk(ROOT, []);
const isSubpackage = (f) => SUBPACKAGE_PAGE_DIRS.some((d) => f.startsWith(d + path.sep));
const mainFiles = all.filter((f) => !isSubpackage(f));
const subFiles = all.filter(isSubpackage);

const sizeOf = (files) => files.reduce((s, f) => s + fs.statSync(f).size, 0);
const mainBytes = sizeOf(mainFiles);
const subBytes = sizeOf(subFiles);
const mb = (b) => (b / 1024 / 1024).toFixed(2);

console.log(`主包源码体积: ${mb(mainBytes)} MB（预算 ${MAX_MB} MB）`);
console.log(`分包源码体积: ${mb(subBytes)} MB`);

if (mainBytes > MAX_MB * 1024 * 1024) {
  console.error(`[FAIL] 主包体积超出预算：${mb(mainBytes)} MB > ${MAX_MB} MB`);
  // 列出主包体积 Top 10，辅助定位膨胀点。
  const top = mainFiles
    .map((f) => ({ f: path.relative(ROOT, f), s: fs.statSync(f).size }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 10);
  for (const t of top) console.error(`  ${(t.s / 1024).toFixed(0)} KB  ${t.f}`);
  process.exit(1);
}
console.log("[PASS] 包体预算校验通过");