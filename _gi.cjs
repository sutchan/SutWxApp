const fs = require("fs");
const path = require("path");
const root = "e:/Github/SutWxApp";
const out = [];
const gi = path.join(root, ".gitignore");
out.push("== .gitignore ==");
out.push(fs.existsSync(gi) ? fs.readFileSync(gi, "utf8") : "(none)");
out.push("== root package.json ==");
out.push(fs.readFileSync(path.join(root, "package.json"), "utf8"));
out.push("== SutWxApp/.gitignore? ==");
const gi2 = path.join(root, "SutWxApp/.gitignore");
out.push(fs.existsSync(gi2) ? fs.readFileSync(gi2, "utf8") : "(none)");
out.push("== git check-ignore tests ==");
const { execSync } = require("child_process");
try {
  out.push(execSync("git check-ignore -v tests/integration.test.js tests/authService.test.ts", { cwd: root, encoding: "utf8" }));
} catch (e) { out.push("not ignored (exit " + e.status + ")"); }
out.push("== git ls-files tests ==");
try { out.push(execSync("git ls-files tests", { cwd: root, encoding: "utf8" })); } catch (e) { out.push("err"); }
fs.writeFileSync(root + "/_gi.txt", out.join("\n"), "utf8");
console.log("ok");
