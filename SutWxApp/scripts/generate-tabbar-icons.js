/**
 * 文件名: generate-tabbar-icons.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 生成 8 个品牌线性 tabBar 图标（4 图标 × 未选中灰 / 选中绿）
 *       用法：node scripts/generate-tabbar-icons.js
 *       微信原生 tabBar 仅支持本地 PNG，故用无依赖脚本光栅化生成，覆盖占位图标。
 */

const fs = require("fs");
const path = require("path");
const { createCanvas, encodePNG } = require("./tabbar-icons/draw");
const { drawHome, drawCategory, drawCart, drawUser } = require("./tabbar-icons/shapes");

const SIZE = 81;
const INACTIVE = { r: 158, g: 158, b: 158, a: 255 }; // #9E9E9E 与 tabBar color 一致
const ACTIVE = { r: 46, g: 125, b: 50, a: 255 }; // #2E7D32 与 selectedColor 一致

function makeIcon(shapeFn, color) {
  const c = createCanvas(SIZE);
  shapeFn(c, color);
  return encodePNG(c);
}

const outDir = path.resolve(__dirname, "..", "images", "tabbar");
const tasks = [
  ["home", drawHome],
  ["category", drawCategory],
  ["cart", drawCart],
  ["user", drawUser],
];

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const [name, fn] of tasks) {
  fs.writeFileSync(path.join(outDir, `${name}.png`), makeIcon(fn, INACTIVE));
  fs.writeFileSync(path.join(outDir, `${name}-active.png`), makeIcon(fn, ACTIVE));
}

console.log("tabBar 图标已生成至", outDir);
