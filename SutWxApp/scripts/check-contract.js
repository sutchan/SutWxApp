/**
 * 文件名: check-contract.js
 * 版本号: 1.0.0
 * 更新日期: 2026-10-14
 * 描述: 接口契约一致性校验（QA-004）：比对 WordPress 插件 DTO 映射字段与小程序
 *       models/ 期望字段，确保前后端字段契约不漂移。纯 node，无需 PHP 运行时。
 *
 * 校验项：
 *   1. 各资源（product/post/category）后端映射返回的字段 ⊇ 前端 models 期望字段；
 *   2. 列表端点返回包络含 list/total/page/pageSize 分页字段。
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, ".."); // SutWxApp/
const REPO_ROOT = path.resolve(PROJECT_ROOT, ".."); // 仓库根
const MAPPING_DIR = path.join(REPO_ROOT, "sutwx-app-api", "includes", "mappings");
const REST_DIR = path.join(REPO_ROOT, "sutwx-app-api", "includes", "rest");

// 前端 models 期望字段（与 SutWxApp/models/*.js 映射输出严格对齐）
const EXPECTED = {
  product: [
    "id", "name", "price", "originPrice", "image", "images", "categoryId",
    "categoryName", "sales", "stock", "stockStatus", "sku", "desc",
    "description", "isFavorite", "rating", "reviewCount", "specs", "type",
    "permalink", "onSale", "featured",
  ],
  post: [
    "id", "title", "content", "excerpt", "cover", "date", "link", "author", "category",
  ],
  category: [
    "id", "name", "icon", "count", "description", "parentId", "slug", "permalink",
  ],
};

const MAPPING_FILE = {
  product: "map-product.php",
  post: "map-post.php",
  category: "map-category.php",
};

const REST_FILE = {
  product: "class-rest-products.php",
  post: "class-rest-posts.php",
  category: "class-rest-categories.php",
};

const ENVELOPE_KEYS = ["list", "total", "page", "pageSize"];

const errors = [];

/** 从 PHP 映射文件抽取所有 'field' => 键名 */
function extractKeys(phpText) {
  const keys = new Set();
  const re = /'([A-Za-z_][A-Za-z0-9_]*)'\s*=>/g;
  let m;
  while ((m = re.exec(phpText)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

/** 校验单个资源字段契约 */
function checkResource(resource) {
  const mapFile = path.join(MAPPING_DIR, MAPPING_FILE[resource]);
  const text = readText(mapFile);
  const backendKeys = extractKeys(text);

  const missing = EXPECTED[resource].filter((k) => !backendKeys.has(k));
  if (missing.length) {
    errors.push(
      `${resource} 契约缺失：后端映射未返回前端期望字段 [${missing.join(", ")}]`,
    );
  } else {
    console.warn(`  ${`${resource} 字段契约`.padEnd(22)} ✓ (${EXPECTED[resource].length} 字段一致)`);
  }
}

/** 校验列表端点分页包络 */
function checkEnvelope(resource) {
  const restFile = path.join(REST_DIR, REST_FILE[resource]);
  const text = readText(restFile);
  const missing = ENVELOPE_KEYS.filter((k) => !text.includes(`'${k}'`));
  if (missing.length) {
    errors.push(
      `${resource} 列表端点包络缺失分页字段 [${missing.join(", ")}]`,
    );
  } else {
    console.warn(`  ${`${resource} 分页包络`.padEnd(22)} ✓ (list/total/page/pageSize)`);
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    errors.push(`无法读取 ${path.relative(REPO_ROOT, filePath)}：${err.message}`);
    return "";
  }
}

function main() {
  console.warn("接口契约一致性校验：");
  Object.keys(EXPECTED).forEach((resource) => {
    checkResource(resource);
    checkEnvelope(resource);
  });

  if (errors.length) {
    console.error("\n契约校验未通过：");
    errors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }
  console.warn("\n契约校验通过：前后端 DTO 字段一致。");
}

main();
