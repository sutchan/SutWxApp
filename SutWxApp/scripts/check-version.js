/**
 * 文件名: check-version.js
 * 版本号: 1.0.0
 * 更新日期: 2026-09-12
 * 描述: 版本号单一来源一致性校验，比对 package.json / app.js / README 徽章 / CHANGELOG 首节 / Git Tag
 */

const fs = require("fs");
const path = require("path");

// 小程序工程根目录（SutWxApp/），仓库根为其上一级
const PROJECT_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(PROJECT_ROOT, "..");

const SEMVER = /^\d+\.\d+\.\d+$/;
const errors = [];

/** 读取文本文件，失败时记录错误并返回空串 */
function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    errors.push(`无法读取 ${path.relative(REPO_ROOT, filePath)}：${err.message}`);
    return "";
  }
}

/** 从文本中用正则抽取第一个版本号 */
function matchVersion(text, regex, label) {
  const matched = text.match(regex);
  if (!matched) {
    errors.push(`${label} 中未找到版本号（匹配规则 ${regex}）`);
    return null;
  }
  return matched[1];
}

/** 收集各展示位的版本号 */
function collectSources() {
  const pkg = require(path.join(PROJECT_ROOT, "package.json"));

  const appText = readText(path.join(PROJECT_ROOT, "app.js"));
  const appVersions = [...appText.matchAll(/version:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (appVersions.length !== 1) {
    errors.push(`app.js 中应存在且仅存在 1 处形如 version: "x.y.z" 的声明，实际 ${appVersions.length} 处`);
  }

  const readmeText = readText(path.join(REPO_ROOT, "README.md"));
  const changelogText = readText(path.join(REPO_ROOT, "CHANGELOG.md"));

  return [
    { name: "package.json", value: pkg.version },
    { name: "app.js globalData.version", value: appVersions[0] || null },
    { name: "README.md 版本徽章", value: matchVersion(readmeText, /badge\/version-([\d.]+)-/, "README.md") },
    { name: "CHANGELOG.md 首个版本小节", value: matchVersion(changelogText, /^##\s*\[([\d.]+)\]/m, "CHANGELOG.md") },
  ];
}

/** 校验发布 Tag 与版本号一致（CI 传入 RELEASE_TAG 或首个位置参数时生效） */
function collectTag() {
  const tagArg = process.argv.find((arg) => !arg.startsWith("--") && arg !== process.argv[0] && arg !== process.argv[1]);
  const raw = process.env.RELEASE_TAG || tagArg || "";
  if (!raw) return null;
  const tag = raw.replace(/^refs\/tags\//, "").replace(/^v/, "");
  return { raw, tag };
}

function main() {
  const sources = collectSources();
  const tag = collectTag();

  console.warn("版本号一致性校验：");
  sources.forEach((item) => {
    console.warn(`  ${item.name.padEnd(32)} ${item.value || "（缺失）"}`);
  });
  if (tag) console.warn(`  ${"Git Tag".padEnd(32)} ${tag.raw}`);

  sources.forEach((item) => {
    if (!item.value) {
      errors.push(`${item.name} 版本号缺失`);
    } else if (!SEMVER.test(item.value)) {
      errors.push(`${item.name} 版本号 "${item.value}" 不符合 SemVer（x.y.z）`);
    }
  });

  const values = sources.map((item) => item.value).filter(Boolean);
  const unique = [...new Set(values)];
  if (unique.length > 1) {
    errors.push(`版本号不一致：${sources.map((i) => `${i.name}=${i.value}`).join("，")}`);
  }
  if (tag && unique.length === 1 && tag.tag !== unique[0]) {
    errors.push(`Tag "${tag.raw}" 与当前版本号 ${unique[0]} 不匹配`);
  }

  if (errors.length) {
    console.error("\n版本校验未通过：");
    errors.forEach((msg) => console.error(`  - ${msg}`));
    console.error("\n请同步 package.json / app.js / README 徽章 / CHANGELOG 后再提交。");
    process.exit(1);
  }

  console.warn(`\n版本校验通过：${unique[0]}`);
}

main();
