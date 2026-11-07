/**
 * 文件名: ui-icons/shapes.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 商城 UI 图标的线性/填充形状（复用 tabbar-icons/draw.js 光栅化），
 *       供 generate-ui-icons.js 生成缺失的本地 PNG 图标。
 */

const { setPixel, drawLine, drawPolyline, drawRect, drawCircle } = require("../tabbar-icons/draw");

/** 调色板：与 design/spec.md 设计令牌一致。 */
const COLORS = {
  gray: { r: 134, g: 134, b: 139, a: 255 },
  light: { r: 158, g: 158, b: 158, a: 255 },
  green: { r: 46, g: 125, b: 50, a: 255 },
  gold: { r: 245, g: 166, b: 35, a: 255 },
  white: { r: 255, g: 255, b: 255, a: 255 },
};

/**
 * 扫描线填充多边形（奇偶规则，适用于星形等自交多边形）。
 * @param {Object} c 画布
 * @param {Array<Array<number>>} pts 顶点数组
 * @param {Object} color 颜色
 */
function fillPolygon(c, pts, color) {
  const ys = pts.map((p) => p[1]);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  for (let y = top; y <= bottom; y += 1) {
    const xs = [];
    for (let i = 0; i < pts.length; i += 1) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x += 1) {
        setPixel(c, x, y, color);
      }
    }
  }
}

/**
 * 生成五角星顶点。
 * @param {number} cx 中心 x
 * @param {number} cy 中心 y
 * @param {number} outer 外径
 * @param {number} inner 内径
 * @returns {Array<Array<number>>}
 */
function starPoints(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const rad = ((i * 36 - 90) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
  }
  return pts;
}

/**
 * 生成心形顶点（参数方程采样）。
 * @param {number} cx 中心 x
 * @param {number} cy 中心 y
 * @param {number} scale 缩放
 * @returns {Array<Array<number>>}
 */
function heartPoints(cx, cy, scale) {
  const pts = [];
  for (let i = 0; i < 48; i += 1) {
    const t = (i / 48) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + x * scale, cy - y * scale]);
  }
  return pts;
}

/** 右箭头（chevron）。 */
function drawArrowRight(c, color) {
  drawPolyline(c, [[30, 18], [52, 40], [30, 62]], color, 6);
}

/** 勾选。 */
function drawChecked(c, color) {
  drawPolyline(c, [[16, 42], [34, 60], [66, 22]], color, 6);
}

/** 关闭叉。 */
function drawClose(c, color) {
  drawPolyline(c, [[22, 22], [58, 58]], color, 6);
  drawPolyline(c, [[58, 22], [22, 58]], color, 6);
}

/** 星形（空心 / 实心）。 */
function drawStar(c, color, filled) {
  const pts = starPoints(40, 40, 30, 13);
  const closed = [...pts, pts[0]];
  drawPolyline(c, closed, color, 4);
  if (filled) fillPolygon(c, pts, color);
}

/** 收藏心形（空心 / 实心）。 */
function drawHeart(c, color, filled) {
  const pts = heartPoints(40, 40, 1.75);
  const closed = [...pts, pts[0]];
  drawPolyline(c, closed, color, 4);
  if (filled) fillPolygon(c, pts, color);
}

/** 放大镜。 */
function drawSearch(c, color) {
  drawCircle(c, 35, 35, 18, color, 5);
  drawPolyline(c, [[48, 48], [66, 66]], color, 5);
}

/** 分类网格。 */
function drawCategoryAll(c, color) {
  for (let r = 0; r < 2; r += 1) {
    for (let col = 0; col < 2; col += 1) {
      drawRect(c, 18 + col * 27, 18 + r * 27, 20, 20, color, 4);
    }
  }
}

/** 购物车。 */
function drawCartIcon(c, color) {
  drawPolyline(c, [[20, 30], [58, 30], [54, 56], [24, 56], [20, 30]], color, 5);
  drawPolyline(c, [[20, 30], [14, 24], [14, 38]], color, 5);
  drawCircle(c, 32, 62, 5, color, 4);
  drawCircle(c, 50, 62, 5, color, 4);
}

/** 客服耳机。 */
function drawService(c, color) {
  drawPolyline(c, [[16, 46], [16, 34], [22, 22], [59, 22], [65, 34], [65, 46]], color, 5);
  drawRect(c, 12, 44, 10, 18, color, 5);
  drawRect(c, 59, 44, 10, 18, color, 5);
  drawPolyline(c, [[65, 60], [65, 66], [56, 66]], color, 4);
}

/** 分享（三节点连线）。 */
function drawShare(c, color) {
  drawCircle(c, 58, 20, 8, color, 4);
  drawCircle(c, 20, 40, 8, color, 4);
  drawCircle(c, 58, 60, 8, color, 4);
  drawPolyline(c, [[27, 36], [51, 24]], color, 4);
  drawPolyline(c, [[27, 44], [51, 56]], color, 4);
}

/** 空状态盒子。 */
function drawEmpty(c, color) {
  drawPolyline(c, [[14, 30], [40, 20], [67, 30], [40, 40], [14, 30]], color, 4);
  drawPolyline(c, [[14, 30], [14, 58], [40, 68], [40, 40]], color, 4);
  drawPolyline(c, [[67, 30], [67, 58], [40, 68]], color, 4);
}

module.exports = {
  COLORS,
  drawArrowRight,
  drawChecked,
  drawClose,
  drawStar,
  drawHeart,
  drawSearch,
  drawCategoryAll,
  drawCartIcon,
  drawService,
  drawShare,
  drawEmpty,
  drawLine,
};
