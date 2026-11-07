/**
 * 文件名: check-ids.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 语义化 ID 门禁：校验小程序每个 WXML 具备页面级根容器 id（禁止通用 page-root /
 *       container），同一模板内 id 不重复，原型单文件 HTML 内 id 亦不重复。
 *       用法：node scripts/check-ids.js
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PAGES_DIR = path.join(REPO_ROOT, "SutWxApp", "pages");
const PROTOTYPES = [
  "prototype/prototype.html",
  "prototype/wireframes.html",
  "prototype/prototype-extra.html",
];
const GENERIC_ROOTS = new Set(["page-root", "container", "root", "app"]);

const errors = [];

/** 递归收集指定扩展名的文件。 */
function walk(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, out);
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

/** 提取模板中所有静态 id。 */
function collectIds(text) {
  return [...text.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
}

/** 校验单个文件内 id 唯一性。 */
function checkUnique(file, text) {
  const ids = collectIds(text);
  const dups = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dups.length) {
    errors.push(`${path.relative(REPO_ROOT, file)} 存在重复 id：${dups.join(", ")}`);
  }
  return ids;
}

/** 校验小程序 WXML：根容器必须有语义化 id。 */
function checkWxml(file) {
  const text = fs.readFileSync(file, "utf8");
  const ids = checkUnique(file, text);
  const lines = text.split("\n");
  const firstTag = lines.find((line) => /^\s*<[a-z]/i.test(line) && !/^\s*<!--/.test(line)) || "";
  const rootId = (firstTag.match(/\sid="([^"]+)"/) || [])[1];
  const rel = path.relative(REPO_ROOT, file).split(path.sep).join("/");
  if (!rootId) {
    errors.push(`${rel} 根容器缺少语义化 id`);
  } else if (GENERIC_ROOTS.has(rootId)) {
    errors.push(`${rel} 根 id「${rootId}」为通用名，应改为页面级语义 id`);
  }
  return ids.length;
}

function main() {
  const wxmlFiles = walk(PAGES_DIR, ".wxml").sort();
  let idCount = 0;
  wxmlFiles.forEach((file) => { idCount += checkWxml(file); });

  let prototypeCount = 0;
  PROTOTYPES.forEach((rel) => {
    const file = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(file)) return;
    prototypeCount += checkUnique(file, fs.readFileSync(file, "utf8")).length;
  });

  console.warn(`语义化 ID 校验：${wxmlFiles.length} 个 WXML / ${idCount} 个 id，原型 ${prototypeCount} 个 id`);
  if (errors.length) {
    console.error("\nID 校验未通过：");
    errors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }
  console.warn("ID 校验通过：根容器语义化且 id 全局无重复");
}

main();
