/**
 * 生成购物车 tabBar 图标（cart.png / cart-active.png）
 * 纯 Node 实现，无第三方依赖，使用 zlib 编码 PNG
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const SIZE = 81;

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // 每行前置 filter byte 0
  const stride = SIZE * 4;
  const raw = Buffer.alloc((stride + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makePixels(color) {
  const [r, g, b] = hexToRgb(color);
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  const set = (x, y, a) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    const i = (y * SIZE + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  };
  const fillRect = (x0, y0, x1, y1, a) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, a);
  };
  const line = (x0, y0, x1, y1, a, thick) => {
    const t = thick || 1;
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + (x1 - x0) * s / steps);
      const y = Math.round(y0 + (y1 - y0) * s / steps);
      for (let dy = -t; dy <= t; dy++)
        for (let dx = -t; dx <= t; dx++) set(x + dx, y + dy, a);
    }
  };
  const circle = (cx, cy, rad, a) => {
    for (let y = -rad; y <= rad; y++)
      for (let x = -rad; x <= rad; x++)
        if (x * x + y * y <= rad * rad) set(cx + x, cy + y, a);
  };
  const A = 255;

  // 购物车把手
  line(18, 22, 28, 22, A, 1);
  line(28, 22, 34, 52, A, 1);
  // 购物车筐（梯形）
  line(34, 30, 62, 30, A, 1);
  line(62, 30, 58, 52, A, 1);
  line(34, 30, 36, 52, A, 1);
  line(36, 52, 58, 52, A, 1);
  // 筐内分隔线
  line(40, 30, 41, 52, 160, 0);
  line(50, 30, 49, 52, 160, 0);
  // 车轮
  circle(40, 60, 5, A);
  set(40, 60, 0); // 中心镂空感
  circle(56, 60, 5, A);
  set(56, 60, 0);
  return buf;
}

const outDir = path.join(__dirname, "..", "SutWxApp", "images", "tabbar");
fs.writeFileSync(path.join(outDir, "cart.png"), encodePng(makePixels("#999999")));
fs.writeFileSync(path.join(outDir, "cart-active.png"), encodePng(makePixels("#2E7D32")));
console.log("cart icons generated:", fs.readdirSync(outDir));
