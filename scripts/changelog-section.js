/**
 * 文件名: changelog-section.js
 * 版本号: 1.0.0
 * 更新日期: 2026-09-12
 * 描述: 从根目录 CHANGELOG.md 抽取指定版本的变更小节，用于生成 GitHub Release 说明
 * 用法: node scripts/changelog-section.js 3.0.8  或  node scripts/changelog-section.js v3.0.8
 */

const fs = require("fs");
const path = require("path");

const CHANGELOG_PATH = path.resolve(__dirname, "..", "CHANGELOG.md");

/** 抽取指定版本的变更小节正文 */
function extractSection(version) {
  const content = fs.readFileSync(CHANGELOG_PATH, "utf8");
  const lines = content.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => new RegExp(`^##\\s*\\[${version}\\]`).test(line));
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
    console.error("用法：node scripts/changelog-section.js <版本号>（如 3.0.8 或 v3.0.8）");
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
