/**
 * 文件名: eslint.config.js
 * 版本号: 3.0.10
 * 更新日期: 2026-09-13
 * 描述: ESLint 10 扁平配置（flat config），纯声明式、无 @eslint/eslintrc 依赖；
 *       recommended 规则来自 eslint 自带的 @eslint/js，node 全局变量就地声明。
 */
const js = require("@eslint/js");

// node 运行环境全局变量（等价于 env.node，避免额外依赖 globals 包）
const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  global: "readonly",
  globalThis: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  setImmediate: "readonly",
  clearImmediate: "readonly",
  queueMicrotask: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  module: "writable",
  exports: "writable",
  require: "readonly",
  TextEncoder: "readonly",
  TextDecoder: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  AbortController: "readonly",
  AbortSignal: "readonly",
  Blob: "readonly",
  File: "readonly",
  FormData: "readonly",
  Headers: "readonly",
  Request: "readonly",
  Response: "readonly",
  fetch: "readonly",
  structuredClone: "readonly",
  performance: "readonly",
};

// 微信小程序宿主环境全局变量
const wxGlobals = {
  wx: "readonly",
  App: "readonly",
  Page: "readonly",
  getApp: "readonly",
  getPage: "readonly",
  Component: "readonly",
  Behavior: "readonly",
  getCurrentPages: "readonly",
  requirePlugin: "readonly",
  window: "readonly",
  requestAnimationFrame: "readonly",
};

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
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { args: "none" }],
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
    // 单元测试运行于 Jest 环境
    files: ["__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...wxGlobals,
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
