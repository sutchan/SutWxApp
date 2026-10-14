/**
 * 文件名: package-plugin.js
 * 版本号: 1.0.0
 * 更新日期: 2026-10-14
 * 描述: WordPress 插件打包与发布脚本（OPS-003）：
 *   1. 解析并校验插件版本号（SUTWX_API_VERSION）；
 *   2. 清理测试代码（排除 tests/ 等开发目录）后生成标准 zip；
 *   3. 输出至 dist/sutwx-app-api-v<version>.zip（跨平台、自包含 ZIP 写器，无外部依赖）。
 *
 * 用法：node scripts/package-plugin.js [目标版本]   （不传则仅校验当前版本并打包）
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", ".."); // 仓库根
const PLUGIN_ROOT = path.join(REPO_ROOT, "sutwx-app-api");
const PLUGIN_MAIN = path.join(PLUGIN_ROOT, "sutwx-app-api.php");
const DIST_DIR = path.join(REPO_ROOT, "dist");

// 打包时应剔除的开发/产物目录与文件
const EXCLUDE_DIRS = new Set(["tests", ".git", "node_modules"]);
const EXCLUDE_FILES = new Set([".gitignore"]);

const SEMVER = /^\d+\.\d+\.\d+$/;

const errors = [];

/** 从插件主文件解析版本号 */
function readPluginVersion() {
  try {
    const text = fs.readFileSync(PLUGIN_MAIN, "utf8");
    const m = text.match(/define\(\s*'SUTWX_API_VERSION',\s*'([^']+)'/);
    if (!m) {
      errors.push("无法从 sutwx-app-api.php 解析 SUTWX_API_VERSION");
      return null;
    }
    return m[1];
  } catch (err) {
    errors.push(`读取插件主文件失败：${err.message}`);
    return null;
  }
}

// CRC32 查表法（确定性，便于跨平台生成合法 ZIP）
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const localParts = [];
const centralParts = [];
let offset = 0;
let entryCount = 0;

/** 向 ZIP 写入一个文件（store 方式，不压缩） */
function addFile(relName, data) {
  const nameBuf = Buffer.from(relName, "utf8");
  const crc = crc32(data);
  const size = data.length;

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8); // 压缩方式 0 = 仅存储
  local.writeUInt16LE(0, 10); // 修改时间
  local.writeUInt16LE(0, 12); // 修改日期
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(size, 18);
  local.writeUInt32LE(size, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);

  localParts.push(local, nameBuf, data);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(size, 20);
  central.writeUInt32LE(size, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(offset, 42);

  centralParts.push(central, nameBuf);

  offset += local.length + nameBuf.length + data.length;
  entryCount += 1;
}

/** 递归收集插件文件，排除开发与产物目录 */
function walk(dir, base) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(full, rel);
    } else if (!EXCLUDE_FILES.has(entry.name)) {
      addFile(rel.split(path.sep).join("/"), fs.readFileSync(full));
    }
  }
}

function main() {
  console.warn("插件打包与发布：");

  const version = readPluginVersion();
  if (!version) return finish();

  const target = process.argv[2];
  if (target) {
    if (!SEMVER.test(target)) {
      errors.push(`目标版本 "${target}" 不符合 SemVer（x.y.z）`);
    } else if (target !== version) {
      errors.push(`目标版本 ${target} 与插件当前版本 ${version} 不一致，请先同步 SUTWX_API_VERSION`);
    }
  }
  if (!SEMVER.test(version)) {
    errors.push(`插件版本 "${version}" 不符合 SemVer（x.y.z）`);
  }

  if (errors.length) return finish();

  walk(PLUGIN_ROOT, "sutwx-app-api");

  const localBuf = Buffer.concat(localParts);
  const centralBuf = Buffer.concat(centralParts);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entryCount, 8);
  eocd.writeUInt16LE(entryCount, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  const zipBuf = Buffer.concat([localBuf, centralBuf, eocd]);

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  const outZip = path.join(DIST_DIR, `sutwx-app-api-v${version}.zip`);
  fs.writeFileSync(outZip, zipBuf);

  console.warn(`  版本号           ${version}`);
  console.warn(`  打包文件数       ${entryCount}`);
  console.warn(`  产物             ${path.relative(REPO_ROOT, outZip)}`);
  console.warn(`  已排除测试代码   ${[...EXCLUDE_DIRS].join(", ")}`);
  console.warn(`\n打包完成：${version}`);
}

function finish() {
  if (errors.length) {
    console.error("\n打包未通过：");
    errors.forEach((m) => console.error(`  - ${m}`));
    process.exit(1);
  }
}

main();
