const fs = require("fs");
const p = require("path");
const cwd = process.cwd();
const big = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const fp = p.join(d, f);
    const s = fs.statSync(fp);
    if (s.isDirectory()) {
      if (["node_modules", "__tests__", "coverage", ".git"].includes(f)) continue;
      walk(fp);
    } else if (/\.(js|ts|tsx|jsx)$/.test(f)) {
      const n = fs.readFileSync(fp, "utf8").split("\n").length;
      if (n > 200) big.push([n, p.relative(cwd, fp)]);
    }
  }
}
walk(".");
big.sort((a, b) => b[0] - a[0]);
console.log("超 200 行源文件数:", big.length);
for (const [n, fp] of big) console.log(n + "\t" + fp);
