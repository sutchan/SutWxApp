/**
 * 文件名: .eslintrc.js
 * 版本号: 3.0.8
 * 更新日期: 2026-09-12
 * 描述: ESLint 配置（小程序 CommonJS 环境），含工程脚本与控制台输出豁免
 */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
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
    Behavior: "readonly",
    getCurrentPages: "readonly",
    requirePlugin: "readonly",
    module: "writable",
    exports: "writable",
    // H5 / 非小程序宿主环境下的能力探测分支（代码内以 typeof 判断后使用）
    window: "readonly",
    requestAnimationFrame: "readonly",
  },
  extends: "eslint:recommended",
  rules: {
    "no-unused-vars": ["error", { args: "none" }],
    "no-console": ["error", { allow: ["error", "warn"] }],
    "no-debugger": "error",
    "no-empty": ["error", { allowEmptyCatch: true }],
    eqeqeq: ["warn", "always", { null: "ignore" }],
  },
  ignorePatterns: ["node_modules/", "miniprogram_npm/", "dist/", "coverage/"],
  overrides: [
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
      env: {
        jest: true,
      },
    },
    {
      // 图片压缩工具为 Node ESM 脚本（构建期使用，不参与小程序打包）
      files: ["utils/compress-images.js"],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: "module",
      },
      rules: {
        "no-console": "off",
      },
    },
  ],
};
