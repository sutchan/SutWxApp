/**
 * 文件名: .eslintrc.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: ESLint 配置（小程序 CommonJS 环境）
 */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    "wechat-app": true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "script",
  },
  globals: {
    wx: "readonly",
    App: "readonly",
    Page: "readonly",
    getApp: "readonly",
    getPage: "readonly",
    Component: "readonly",
    requirePlugin: "readonly",
    module: "writable",
    exports: "writable",
  },
  extends: "eslint:recommended",
  rules: {
    "no-unused-vars": ["error", { args: "none" }],
    "no-console": ["error", { allow: ["error", "warn"] }],
    "no-debugger": "error",
    "no-empty": ["error", { allowEmptyCatch: true }],
    eqeqeq: ["warn", "always", { null: "ignore" }],
  },
  ignorePatterns: ["node_modules/", "miniprogram_npm/", "dist/"],
};
