/**
 * 文件名: draw.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 极简位图画布与 PNG 编码器（无外部依赖，用于生成 tabBar 线性图标）
 *       微信原生 tabBar 仅支持本地 PNG 图标（不支持 SVG），故用纯 Node 光栅化品牌线性图标。
 */

const zlib = require("zlib");

// PNG CRC32 表
const CRC_TABLE = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createCanvas(size) {
  return { size, buf: Buffer.alloc(size * size * 4) }; // 全透明 RGBA
}

function setPixel(c, x, y, color) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  c.buf[i] = color.r;
  c.buf[i + 1] = color.g;
  c.buf[i + 2] = color.b;
  c.buf[i + 3] = color.a;
}

// 以 (x,y) 为中心的方形笔触
function stamp(c, x, y, color, width) {
  const half = Math.floor(width / 2);
  for (let oy = -half; oy <= half; oy++) {
    for (let ox = -half; ox <= half; ox++) {
      setPixel(c, x + ox, y + oy, color);
    }
  }
}

function drawLine(c, x0, y0, x1, y1, color, width) {
  width = width || 4;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    stamp(c, x0, y0, color, width);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function drawPolyline(c, pts, color, width) {
  for (let i = 0; i < pts.length - 1; i++) {
    drawLine(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], color, width);
  }
}

function drawRect(c, x, y, w, h, color, width) {
  width = width || 4;
  drawLine(c, x, y, x + w, y, color, width);
  drawLine(c, x + w, y, x + w, y + h, color, width);
  drawLine(c, x, y + h, x + w, y + h, color, width);
  drawLine(c, x, y, x, y + h, color, width);
}

function drawCircle(c, cx, cy, r, color, width) {
  width = width || 4;
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    stamp(c, x, y, color, width);
  }
}

function encodePNG(c) {
  const stride = c.size * 4 + 1;
  const raw = Buffer.alloc(c.size * stride);
  for (let y = 0; y < c.size; y++) {
    raw[y * stride] = 0; // filter: none
    c.buf.copy(raw, y * stride + 1, y * c.size * 4, y * c.size * 4 + c.size * 4);
  }
  const compressed = zlib.deflateSync(raw);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.size, 0);
  ihdr.writeUInt32BE(c.size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

module.exports = {
  createCanvas,
  setPixel,
  drawLine,
  drawPolyline,
  drawRect,
  drawCircle,
  encodePNG,
};
