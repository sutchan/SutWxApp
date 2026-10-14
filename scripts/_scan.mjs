import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("SutWxApp/package.json", "utf8"));
const rootPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const app = fs.readFileSync("SutWxApp/app.js", "utf8");
const m = app.match(/version:\s*["']([^"']+)["']/);
console.log("SutWxApp/package.json:", pkg.version);
console.log("root package.json:", rootPkg.version);
console.log("app.js globalData.version:", m && m[1]);
// 统计仍超 200 行的源文件
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === "__tests__" || f.name === "coverage" || f.name.startsWith(".")) continue;
    const fp = d + "/" + f.name;
    if (f.isDirectory()) walk(fp);
    else if (/\.(wxss|wxml|js)$/.test(f.name)) {
      const n = fs.readFileSync(fp, "utf8").split("\n").length;
      if (n > 200) console.log(n, fp);
    }
  }
}
walk("SutWxApp");
