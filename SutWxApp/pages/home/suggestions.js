/**
 * 文件名: suggestions.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 首页搜索建议词库、本地过滤与关键词 → 商品ID 匹配（纯逻辑）
 */

// 搜索建议候选词库
const ALL_SUGGESTION_NAMES = [
  "苏铁盆栽 铁树绿植",
  "琴叶榕 大叶观叶植物",
  "龟背竹 开背大苗",
  "多肉植物组合套装",
  "玉露 冰灯玉露盆栽",
  "蝴蝶兰 年宵花礼盒",
  "果汁阳台月季盆栽",
  "园艺工具三件套",
  "红陶花盆套装 素烧",
  "进口泥炭营养土 5L",
  "文竹 云竹盆栽",
  "自动浇水滴灌套装",
  "缓释肥 园艺通用肥",
];

// 搜索关键词 → 商品ID 映射（与词库顺序对应）
const SUGGESTIONS_TO_ID = {
  苏铁: 1, 铁树: 1,
  琴叶榕: 2,
  龟背竹: 3,
  多肉: 4, 组合: 4,
  玉露: 5, 冰灯: 5,
  蝴蝶兰: 6, 花礼: 6,
  果汁阳台: 7, 月季: 7,
  工具: 8, 不锈钢: 8,
  花盆: 9, 红陶: 9,
  泥炭: 10, 营养土: 10, "5L": 10,
  文竹: 11, 云竹: 11,
  自动浇水: 12, 滴灌: 12,
  缓释肥: 13, 通用肥: 13,
};

// 搜索加载动效展示时长（ms）
const SEARCH_DELAY_MS = 720;

// 建议列表最大条数
const SUGGESTION_LIMIT = 3;

/**
 * 按关键词过滤建议列表（严格匹配前 N 个）
 * @param {string} val 输入关键词
 * @returns {Array<{id: number, name: string}>}
 */
function filterSuggestions(val) {
  if (!val || !val.trim()) return [];
  const kw = val.trim().toLowerCase();
  return ALL_SUGGESTION_NAMES.filter(
    (name) => name.toLowerCase().indexOf(kw) !== -1,
  )
    .map((name, index) => ({ id: index, name }))
    .slice(0, SUGGESTION_LIMIT);
}

/**
 * 关键词 → 商品ID 匹配（双向包含：输入含关键词或关键词含输入）
 * @param {string} text 搜索词
 * @returns {number|null} 命中的商品ID，未命中返回 null
 */
function matchSuggestionId(text) {
  if (!text) return null;
  for (const key in SUGGESTIONS_TO_ID) {
    if (text.indexOf(key) !== -1 || key.indexOf(text) !== -1) {
      return SUGGESTIONS_TO_ID[key];
    }
  }
  return null;
}

module.exports = {
  ALL_SUGGESTION_NAMES,
  SUGGESTIONS_TO_ID,
  SEARCH_DELAY_MS,
  SUGGESTION_LIMIT,
  filterSuggestions,
  matchSuggestionId,
};
