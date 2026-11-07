/**
 * 文件名: generate-ui-icons.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 生成商城页面引用的本地 PNG 小图标（补齐 WXML 中缺失的资源）。
 *       微信 image 组件不支持 SVG，故复用 tabbar-icons/draw.js 光栅化为 PNG。
 *       用法：node scripts/generate-ui-icons.js
 */

const fs = require("fs");
const path = require("path");
const { createCanvas, encodePNG } = require("./tabbar-icons/draw");
const shapes = require("./ui-icons/shapes");

const SIZE = 81;
const C = shapes.COLORS;

/** 图标清单：[文件名, 绘制函数, 颜色]，含动态模板展开后的两种状态。 */
const ICONS = [
  ["arrow-right.png", (c, color) => shapes.drawArrowRight(c, color), C.gray],
  ["checked.png", (c, color) => shapes.drawChecked(c, color), C.green],
  ["close.png", (c, color) => shapes.drawClose(c, color), C.gray],
  ["star.png", (c, color) => shapes.drawStar(c, color, false), C.light],
  ["star-active.png", (c, color) => shapes.drawStar(c, color, true), C.gold],
  ["favorite-active.png", (c, color) => shapes.drawHeart(c, color, true), C.green],
  ["collect.png", (c, color) => shapes.drawHeart(c, color, false), C.white],
  ["collect-active.png", (c, color) => shapes.drawHeart(c, color, true), C.green],
  ["customer-service.png", (c, color) => shapes.drawService(c, color), C.gray],
  ["cart.png", (c, color) => shapes.drawCartIcon(c, color), C.gray],
  ["share-white.png", (c, color) => shapes.drawShare(c, color), C.white],
  ["search.png", (c, color) => shapes.drawSearch(c, color), C.light],
  ["category-all.png", (c, color) => shapes.drawCategoryAll(c, color), C.gray],
  ["empty.png", (c, color) => shapes.drawEmpty(c, color), C.light],
];

/** 校验目标目录存在并逐项生成。 */
function main() {
  const outDir = path.resolve(__dirname, "..", "images");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  ICONS.forEach(([name, draw, color]) => {
    const canvas = createCanvas(SIZE);
    draw(canvas, color);
    fs.writeFileSync(path.join(outDir, name), encodePNG(canvas));
  });
  console.log(`已生成 ${ICONS.length} 个 UI 图标至 ${outDir}`);
}

main();
