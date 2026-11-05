/**
 * 文件名: check-docs.js
 * 版本号: 3.5.11
 * 更新日期: 2026-11-05
 * 描述: 文档与代码一致性巡检（OPS-008）。机械校验三类偏差，任一失败即退出非 0：
 *   1. 端点：后端 register_rest_route 注册的每个端点都必须出现在 docs/specs/api/spec.md；
 *   2. 免鉴权：permission_callback 为 __return_true 的端点必须登记在 ops/spec.md 免鉴权清单；
 *   3. 版本：tasks.md 声明的前端/插件版本必须与 package.json、SUTWX_API_VERSION 一致。
 * 用法：node SutWxApp/scripts/check-docs.js
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "../..");
const REST_DIR = path.join(REPO_ROOT, "sutwx-app-api/includes/rest");
const API_SPEC = path.join(REPO_ROOT, "docs/specs/api/spec.md");
const OPS_SPEC = path.join(REPO_ROOT, "docs/specs/ops/spec.md");
const TASKS = path.join(REPO_ROOT, "docs/tasks.md");
const PKG = path.join(REPO_ROOT, "SutWxApp/package.json");
const PLUGIN_ENTRY = path.join(REPO_ROOT, "sutwx-app-api/sutwx-app-api.php");

const errors = [];
const warnings = [];

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

// ---------------------------------------------------------------------------
// 1. 端点清单
// ---------------------------------------------------------------------------
const files = fs.readdirSync(REST_DIR).filter((f) => f.endsWith(".php"));
const codeRoutes = []; // { path, file, openAuth }

for (const name of files) {
  const text = read(path.join(REST_DIR, name));
  const marks = [...text.matchAll(/register_rest_route\(/g)].map((m) => m.index);

  // 路由级判定：截取本次 register_rest_route 到下一次调用之间的代码块，
  // 块内 permission_callback 为 __return_true 才视为免鉴权（同文件可混合）。
  marks.forEach((start, i) => {
    const end = i + 1 < marks.length ? marks[i + 1] : text.length;
    const block = text.slice(start, end);
    const route = block.match(/SUTWX_API_REST_NS,\s*'([^']+)'/);
    if (!route) return;
    codeRoutes.push({
      path: "/api" + route[1],
      file: name,
      openAuth: /'permission_callback'\s*=>\s*'__return_true'/.test(block),
    });
  });
}

const apiSpec = read(API_SPEC);
const specRoutes = new Set(
  [...apiSpec.matchAll(/\/api\/[a-z0-9/-]+/gi)].map((m) => m[0].replace(/\/+$/, ""))
);

for (const r of codeRoutes) {
  if (!specRoutes.has(r.path)) {
    errors.push(`端点未在 api/spec.md 登记：${r.path}（${r.file}）`);
  }
}

// ---------------------------------------------------------------------------
// 2. 免鉴权端点清单
// ---------------------------------------------------------------------------
const opsSpec = read(OPS_SPEC);
const openRoutes = codeRoutes.filter((r) => r.openAuth);
for (const r of openRoutes) {
  if (!opsSpec.includes(r.path)) {
    errors.push(`免鉴权端点未在 ops/spec.md 安全基线清单登记：${r.path}（${r.file}）`);
  }
}

// ---------------------------------------------------------------------------
// 3. 版本一致性
// ---------------------------------------------------------------------------
const pkgVersion = (() => {
  try {
    return JSON.parse(read(PKG)).version || null;
  } catch (e) {
    errors.push("无法解析 SutWxApp/package.json");
    return null;
  }
})();

const pluginVersion = (read(PLUGIN_ENTRY).match(/define\(\s*'SUTWX_API_VERSION',\s*'([^']+)'/) || [])[1] || null;
if (!pluginVersion) errors.push("无法从 sutwx-app-api.php 解析 SUTWX_API_VERSION");

const tasksText = read(TASKS);
const declared = tasksText.match(
  /\*\*当前状态\*\*:\s*小程序前端\s*`v?([\d.]+)`\s*·\s*WordPress 插件\s*`v?([\d.]+)`/
);
if (!declared) {
  warnings.push("tasks.md 未找到「当前状态」版本声明行，跳过版本比对");
} else {
  const [, front, plugin] = declared;
  if (pkgVersion && front !== pkgVersion) {
    errors.push(`tasks.md 前端版本 ${front} ≠ package.json ${pkgVersion}`);
  }
  if (pluginVersion && plugin !== pluginVersion) {
    errors.push(`tasks.md 插件版本 ${plugin} ≠ SUTWX_API_VERSION ${pluginVersion}`);
  }
}

// ---------------------------------------------------------------------------
// 输出
// ---------------------------------------------------------------------------
console.log(`扫描端点 ${codeRoutes.length} 个（免鉴权 ${openRoutes.length} 个）`);
console.log(`文档端点引用 ${specRoutes.size} 条`);
if (warnings.length) {
  for (const w of warnings) console.warn(`[WARN] ${w}`);
}
if (errors.length) {
  console.error(`[FAIL] 文档与代码不一致（${errors.length} 项）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("[PASS] 端点、免鉴权清单与版本声明一致");
