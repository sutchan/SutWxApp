/**
 * 文件名: changelog-section.js
 * 版本号: 1.1.0
 * 更新日期: 2026-11-14
 * 描述: 从根目录 CHANGELOG.md 抽取指定版本的变更小节，用于生成 GitHub Release 说明。
 *       根 package.json 声明 "type": "module"，本脚本必须使用 ESM，否则 release.yml
 *       执行时会报 `require is not defined` 并中断发布。
 * 用法: node scripts/changelog-section.js 3.5.17  或  node scripts/changelog-section.js v3.5.17
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CHANGELOG_PATH = path.resolve(SCRIPT_DIR, "..", "CHANGELOG.md");

/** 转义正则元字符，避免版本号中的 . 被当作通配符 */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 抽取指定版本的变更小节正文 */
function extractSection(version) {
  const content = fs.readFileSync(CHANGELOG_PATH, "utf8");
  const lines = content.split(/\r?\n/);
  const heading = new RegExp(`^##\\s*\\[${escapeRegExp(version)}\\]`);
  const startIndex = lines.findIndex((line) => heading.test(line));
  if (startIndex === -1) return null;

  const rest = lines.slice(startIndex + 1);
  const endOffset = rest.findIndex((line) => /^##\s*\[/.test(line));
  const body = (endOffset === -1 ? rest : rest.slice(0, endOffset)).join("\n").trim();
  return body;
}

function main() {
  const input = (process.argv[2] || process.env.RELEASE_TAG || "").trim();
  const version = input.replace(/^refs\/tags\//, "").replace(/^v/, "");

  if (!version) {
    console.error("用法：node scripts/changelog-section.js <版本号>（如 3.5.17 或 v3.5.17）");
    process.exit(1);
  }

  const body = extractSection(version);
  if (!body) {
    console.error(`CHANGELOG.md 中未找到版本 ${version} 的小节，请先补齐变更记录。`);
    process.exit(1);
  }

  process.stdout.write(body + "\n");
}

main();
