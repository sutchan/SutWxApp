/**
 * 文件名: eslint.config.js
 * 版本号: 3.0.10
 * 更新日期: 2026-09-13
 * 描述: ESLint 10 扁平配置（flat config）；经 FlatCompat 复用 .eslintrc.js 的原有规则、全局变量与 overrides
 */
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  ...compat.config(require(path.join(__dirname, ".eslintrc.js"))),
];
