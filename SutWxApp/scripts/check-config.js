/**
 * 文件名: check-config.js
 * 版本号: 1.0.0
 * 更新日期: 2026-09-12
 * 描述: 小程序配置完整性校验：JSON 可解析、页面四件套齐全、tabBar 图标存在、分包与 sitemap 合法
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", "miniprogram_npm", "coverage", ".git"]);
const TABBAR_ICON_LIMIT = 40 * 1024; // 微信官方限制：tabBar 图标不超过 40KB

const errors = [];
const warnings = [];

/** 统一输出相对路径，便于在 CI 日志中定位 */
function rel(target) {
  return path.relative(PROJECT_ROOT, target).split(path.sep).join("/");
}

/** 递归收集文件（跳过依赖与产物目录） */
function walkFiles(dir, ext, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, ext, result);
    else if (entry.name.endsWith(ext)) result.push(full);
  }
  return result;
}

/** 校验所有 JSON 文件可被解析 */
function checkJsonFiles() {
  const files = walkFiles(PROJECT_ROOT, ".json");
  let checked = 0;
  files.forEach((file) => {
    try {
      JSON.parse(fs.readFileSync(file, "utf8"));
      checked += 1;
    } catch (err) {
      errors.push(`JSON 解析失败：${rel(file)}（${err.message}）`);
    }
  });
  return checked;
}

/** 读取并解析 app.json */
function loadAppJson() {
  const appJsonPath = path.join(PROJECT_ROOT, "app.json");
  try {
    return JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  } catch (err) {
    errors.push(`app.json 无法解析：${err.message}`);
    return null;
  }
}

/** 校验单个页面目录下的文件完整度 */
function checkPage(pagePath) {
  const base = path.join(PROJECT_ROOT, pagePath);
  [".js", ".wxml"].forEach((ext) => {
    if (!fs.existsSync(base + ext)) errors.push(`页面缺少必需文件：${pagePath}${ext}`);
  });
  [".json", ".wxss"].forEach((ext) => {
    if (!fs.existsSync(base + ext)) warnings.push(`页面缺少可选文件：${pagePath}${ext}`);
  });
}

/** 汇总 app.json 中的主包与分包页面路径 */
function collectPagePaths(appJson) {
  const mainPages = appJson.pages || [];
  const duplicates = mainPages.filter((p, i) => mainPages.indexOf(p) !== i);
  if (duplicates.length) errors.push(`app.json pages 存在重复项：${[...new Set(duplicates)].join("，")}`);

  const subPackages = appJson.subPackages || appJson.subpackages || [];
  const subPages = [];
  subPackages.forEach((sub) => {
    if (!sub.root) {
      errors.push(`app.json 分包缺少 root 字段：${JSON.stringify(sub)}`);
      return;
    }
    (sub.pages || []).forEach((p) => subPages.push(path.posix.join(sub.root.replace(/\/$/, ""), p)));
  });
  return { mainPages, subPages };
}

/** 校验 tabBar 图标与 sitemap 配置指向的文件真实存在 */
function checkStaticResources(appJson) {
  const list = (appJson.tabBar && appJson.tabBar.list) || [];
  list.forEach((item) => {
    ["iconPath", "selectedIconPath"].forEach((key) => {
      const value = item[key];
      if (!value) return;
      const full = path.join(PROJECT_ROOT, value);
      if (!fs.existsSync(full)) {
        errors.push(`tabBar「${item.text}」的 ${key} 指向的文件不存在：${value}`);
        return;
      }
      const size = fs.statSync(full).size;
      if (size > TABBAR_ICON_LIMIT) {
        errors.push(`tabBar 图标超过 40KB 限制：${value}（${Math.round(size / 1024)}KB）`);
      }
    });
  });

  const sitemap = appJson.sitemapLocation || "sitemap.json";
  if (!fs.existsSync(path.join(PROJECT_ROOT, sitemap))) {
    errors.push(`sitemapLocation 指向的文件不存在：${sitemap}`);
  }
  return list.length;
}

/** 反向校验：pages 目录下存在 index.js 但未被 app.json 引用的页面 */
function checkUnreferencedPages(referenced) {
  const pagesDir = path.join(PROJECT_ROOT, "pages");
  if (!fs.existsSync(pagesDir)) return;
  const referencedDirs = new Set(referenced.map((p) => path.posix.dirname(p)));
  fs.readdirSync(pagesDir, { withFileTypes: true }).forEach((entry) => {
    if (!entry.isDirectory()) return;
    const pageDir = `pages/${entry.name}`;
    if (!fs.existsSync(path.join(PROJECT_ROOT, pageDir, "index.js"))) return;
    if (!referencedDirs.has(pageDir)) warnings.push(`页面未被 app.json 引用：${pageDir}`);
  });
}

function main() {
  const jsonCount = checkJsonFiles();
  const appJson = loadAppJson();
  let pageCount = 0;
  let iconCount = 0;

  if (appJson) {
    const { mainPages, subPages } = collectPagePaths(appJson);
    [...mainPages, ...subPages].forEach(checkPage);
    pageCount = mainPages.length + subPages.length;
    iconCount = checkStaticResources(appJson);
    checkUnreferencedPages([...mainPages, ...subPages]);
  }

  console.warn("小程序配置校验：");
  console.warn(`  JSON 文件解析     ${jsonCount} 个`);
  console.warn(`  页面文件三件套    ${pageCount} 个页面`);
  console.warn(`  tabBar 图标       ${iconCount} 项`);

  warnings.forEach((msg) => console.warn(`  [警告] ${msg}`));

  if (errors.length) {
    console.error("\n配置校验未通过：");
    errors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }
  console.warn(`\n配置校验通过${warnings.length ? `（${warnings.length} 条警告）` : ""}`);
}

main();
