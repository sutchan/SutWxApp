const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = "e:/Github/SutWxApp";
function run(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  } catch (e) {
    return "ERR: " + (e.stdout || "") + (e.stderr || "");
  }
}
const out = [];
out.push("== git log ==");
out.push(run("git --no-pager log --oneline -15"));
out.push("== git status ==");
out.push(run("git status --porcelain"));
out.push("== versions ==");
out.push("SutWxApp/package.json: " + require(path.join(root, "SutWxApp/package.json")).version);
out.push("root package.json: " + require(path.join(root, "package.json")).version);
out.push("== plugin files ==");
function walk(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, prefix);
    else out.push(path.relative(root, p) + "  (" + fs.statSync(p).size + "B, " + fs.readFileSync(p, "utf8").split(/\r?\n/).length + " lines)");
  }
}
walk(path.join(root, "sutwx-app-api"), "");
fs.writeFileSync("e:/Github/SutWxApp/_state.txt", out.join("\n"), "utf8");
console.log("done");
