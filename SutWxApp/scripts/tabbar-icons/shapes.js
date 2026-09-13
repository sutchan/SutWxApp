/**
 * 文件名: shapes.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 4 个 tabBar 图标的线性形状绘制（home/category/cart/user）
 */

const { drawLine, drawPolyline, drawRect, drawCircle } = require("./draw");

// 首页：房子（屋顶 + 墙体 + 门）
function drawHome(c, color) {
  const w = 5;
  drawPolyline(c, [
    [40, 14],
    [16, 40],
    [64, 40],
    [40, 14],
  ], color, w);
  drawRect(c, 22, 40, 36, 26, color, w);
  drawRect(c, 34, 54, 12, 12, color, w);
}

// 分类：2x2 网格
function drawCategory(c, color) {
  const s = 18;
  const gap = 9;
  const x0 = 18;
  const y0 = 18;
  for (let r = 0; r < 2; r++) {
    for (let col = 0; col < 2; col++) {
      drawRect(c, x0 + col * (s + gap), y0 + r * (s + gap), s, s, color, 4);
    }
  }
}

// 购物车：车斗 + 把手 + 双轮
function drawCart(c, color) {
  const w = 5;
  drawPolyline(c, [
    [20, 32],
    [58, 32],
    [54, 56],
    [24, 56],
    [20, 32],
  ], color, w);
  drawLine(c, 20, 32, 14, 26, color, w);
  drawLine(c, 14, 26, 14, 40, color, w);
  drawCircle(c, 32, 62, 5, color, w);
  drawCircle(c, 50, 62, 5, color, w);
}

// 我的：头 + 身体
function drawUser(c, color) {
  const w = 5;
  drawCircle(c, 40, 26, 13, color, w);
  drawPolyline(c, [
    [24, 66],
    [30, 46],
    [50, 46],
    [56, 66],
  ], color, w);
}

module.exports = {
  drawHome,
  drawCategory,
  drawCart,
  drawUser,
};
