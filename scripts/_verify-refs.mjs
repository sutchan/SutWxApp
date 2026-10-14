import fs from "node:fs";
import path from "node:path";

let bad = 0;

// 1. 仍超 200 行的源文件
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", "__tests__", "coverage"].includes(f.name) || f.name.startsWith(".")) continue;
    const fp = path.join(d, f.name);
    if (f.isDirectory()) walk(fp);
    else if (/\.(wxss|wxml|js)$/.test(f.name)) {
      const n = fs.readFileSync(fp, "utf8").split("\n").length;
      if (n > 200) { console.log("OVER-200:", n, fp); bad++; }
    }
  }
}
walk("SutWxApp");

// 2. wxss @import 目标存在性
function walkCss(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", "__tests__", "coverage"].includes(f.name) || f.name.startsWith(".")) continue;
    const fp = path.join(d, f.name);
    if (f.isDirectory()) walkCss(fp);
    else if (f.name.endsWith(".wxss")) {
      const text = fs.readFileSync(fp, "utf8");
      const re = /@import\s+"([^"]+)"/g;
      let m;
      while ((m = re.exec(text))) {
        const target = path.resolve(path.dirname(fp), m[1]);
        if (!fs.existsSync(target)) { console.log("MISSING-CSS:", fp, "->", m[1]); bad++; }
      }
    }
  }
}
walkCss("SutWxApp");

// 3. wxml include 目标存在性
function walkWxml(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", "__tests__", "coverage"].includes(f.name) || f.name.startsWith(".")) continue;
    const fp = path.join(d, f.name);
    if (f.isDirectory()) walkWxml(fp);
    else if (f.name.endsWith(".wxml")) {
      const text = fs.readFileSync(fp, "utf8");
      const re = /<include\s+src="([^"]+)"/g;
      let m;
      while ((m = re.exec(text))) {
        const target = path.resolve(path.dirname(fp), m[1]);
        if (!fs.existsSync(target)) { console.log("MISSING-WXML:", fp, "->", m[1]); bad++; }
      }
    }
  }
}
walkWxml("SutWxApp");

// 4. 孤儿 wxml 片段检测（product-*.wxml 未被任何 include 引用）
function orphanCheck() {
  const dir = "SutWxApp/pages/product";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".wxml") && f !== "index.wxml");
  const index = fs.readFileSync(path.join(dir, "index.wxml"), "utf8");
  for (const f of files) {
    if (!index.includes(`src="./${f}"`)) console.log("ORPHAN-WXML:", f);
  }
}
orphanCheck();

console.log(bad === 0 ? "ALL-REFS-OK" : `BAD=${bad}`);
