const fs = require("fs");
const path = require("path");
const root = "e:/Github/SutWxApp";
const out = [];
function walk(dir, skip) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    if (skip && skip.includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, skip);
    else {
      const rel = path.relative(root, p).replace(/\\/g, "/");
      const lines = fs.readFileSync(p, "utf8").split(/\r?\n/).length;
      out.push(rel + "  (" + lines + "L)");
    }
  }
}
walk(path.join(root, "SutWxApp"), ["node_modules", "images", "coverage"]);
out.push("=== .github ===");
walk(path.join(root, ".github"), []);
out.push("=== tests ===");
walk(path.join(root, "tests"), []);
out.push("=== scripts ===");
walk(path.join(root, "scripts"), []);
fs.writeFileSync("e:/Github/SutWxApp/_tree.txt", out.join("\n"), "utf8");
console.log("ok");
