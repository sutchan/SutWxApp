/**
 * 文件名: eslint.config.js
 * 版本号: 3.4.1
 * 更新日期: 2026-09-19
 * 描述: ESLint 10 扁平配置（flat config），完全自包含、不依赖任何外部包。
 *       规则集与全局变量常量见 eslint.presets.js，以保证本文件保持精简。
 */
const {
  recommendedRules,
  nodeGlobals,
  wxGlobals,
} = require("./eslint.presets.js");

module.exports = [
  {
    ignores: ["node_modules/", "miniprogram_npm/", "dist/", "coverage/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...nodeGlobals,
        ...wxGlobals,
      },
    },
    rules: {
      ...recommendedRules,
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-console": ["error", { allow: ["error", "warn"] }],
      "no-debugger": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
      eqeqeq: ["warn", "always", { null: "ignore" }],
    },
  },
  {
    // 工程脚本（校验/部署）属 CLI 工具，需要直接向控制台输出结果
    files: ["scripts/**/*.js"],
    rules: {
      "no-console": "off",
    },
  },
  {
    // 单元测试运行于 Jest 环境（复刻 env.jest 提供的全局变量）
    files: ["__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...wxGlobals,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
  },
  {
    // 图片压缩工具为 Node ESM 脚本（构建期使用，不参与小程序打包）
    files: ["utils/compress-images.js"],
    languageOptions: {
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
    },
  },
];
