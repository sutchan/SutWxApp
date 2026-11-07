/**
 * 文件名: check-images.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 校验 WXML 中引用的本地 /images/* 资源真实存在（含 {{}} 动态模板展开）。
 *       用法：node scripts/check-images.js
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(PROJECT_ROOT, "pages");
const errors = [];

// 路径片段：允许普通字符，或把 {{...}} 当作一个整体占位符。
const REF_RE = /\/images\/(?:[A-Za-z0-9_.-]+|\{\{[^}]*\}\})+\.(?:png|svg|jpe?g|gif)/g;

/** 递归收集 WXML 文件。 */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".wxml")) out.push(full);
  }
  return out;
}

/**
 * 将含 {{}} 的引用展开为可能的候选文件名。
 * @param {string} ref 原始引用
 * @returns {Array<string>}
 */
function expand(ref) {
  const tpls = ref.match(/\{\{[^}]*\}\}/g);
  if (!tpls) return [ref];
  const base = ref.replace(/\{\{[^}]*\}\}/g, "");
  const variants = [base];
  // 仅当模板字面量里出现 "-active" 时才追加激活态变体。
  if (tpls.some((t) => t.includes("-active"))) {
    variants.push(ref.replace(/\{\{[^}]*\}\}/g, "-active"));
  }
  return [...new Set(variants)];
}

/** 校验单个 WXML 的所有本地图片引用。 */
function checkFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(PROJECT_ROOT, file).split(path.sep).join("/");
  let match;
  const re = new RegExp(REF_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    expand(match[0]).forEach((ref) => {
      const target = path.join(PROJECT_ROOT, ref.replace(/^\//, ""));
      if (!fs.existsSync(target)) {
        errors.push(`${rel} 引用不存在的资源：${ref}`);
      }
    });
  }
}

function main() {
  const files = walk(PAGES_DIR);
  files.forEach(checkFile);
  console.warn(`图片资源校验：扫描 ${files.length} 个 WXML`);
  if (errors.length) {
    console.error("\n资源校验未通过：");
    errors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }
  console.warn("资源校验通过：所有本地图片引用均存在");
}

main();
