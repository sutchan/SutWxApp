/**
 * 文件名: check-site-dist.js
 * 版本号: 1.0.0
 * 更新日期: 2026-11-14
 * 描述: 校验 build.js 产物完整性与首页元信息，供 CI、Pages 部署与本地复用。
 *       根 package.json 声明 "type": "module"，本脚本必须使用 ESM。
 * 用法: node scripts/check-site-dist.js
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 产物清单：build.js 同时生成根目录单文件入口与 dist/ 下的完整站点
const REQUIRED_FILES = [
  "index.html",
  "dist/index.html",
  "dist/prototype.html",
  "dist/prototype-extra.html",
  "dist/wireframes.html",
  "dist/docs/PROJECT_OVERVIEW.md",
];

/** 校验必填文件均存在，返回缺失清单 */
function missingFiles() {
  return REQUIRED_FILES.filter((file) => !fs.existsSync(path.join(REPO_ROOT, file)));
}

/** 校验首页注入了标题与 OG 元信息，防止 build.js 静默漏注入 */
function hasMeta() {
  const html = fs.readFileSync(path.join(REPO_ROOT, "dist/index.html"), "utf8");
  return html.includes("<title>") && html.includes("og:title");
}

const missing = missingFiles();
if (missing.length) {
  console.error(`站点产物缺失：${missing.join("，")}`);
  process.exit(1);
}
if (!hasMeta()) {
  console.error("dist/index.html 缺少 title / og 元信息，build.js 注入可能失败");
  process.exit(1);
}
console.log(`站点产物校验通过：${REQUIRED_FILES.length} 个文件，首页元信息完整`);
