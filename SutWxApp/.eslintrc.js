/**
 * 文件名: .eslintrc.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: ESLint配置文件
 * 为微信小程序项目提供代码规范检查
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  globals: {
    // 微信小程序全局对象
    wx: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    App: 'readonly',
    Behavior: 'readonly',
    requirePlugin: 'readonly',
    requireMiniProgram: 'readonly',
    // 控制台
    console: 'readonly',
    // 定时器
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly'
  },
  rules: {
    // 基础错误检查
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    'no-undef': 'error',
    'no-empty': 'error',
    'no-constant-condition': 'error',
    'no-control-regex': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty-character-class': 'error',
    'no-ex-assign': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-sparse-arrays': 'error',
    'no-template-curly-in-string': 'error',
    'no-unreachable': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',
    
    // 代码风格规则
    'indent': ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'brace-style': ['error', '1tbs'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'eol-last': ['error', 'always'],
    'func-call-spacing': ['error', 'never'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'keyword-spacing': ['error', { before: true, after: true }],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'],
    'semi-spacing': ['error', { before: false, after: true }],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never' }],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', { words: true, nonwords: false }],
    'spaced-comment': ['error', 'always'],
    
    // 变量和结构规则
    'camelcase': ['error', { properties: 'always' }],
    'consistent-this': ['error', 'self'],
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    
    // 微信小程序特定规则
    'no-restricted-globals': ['error', {
      name: 'onmessage',
      message: '使用 wx.onMessage 替代'
    }, {
      name: 'postMessage',
      message: '使用 wx.postMessage 替代'
    }]
  },
  overrides: [
    {
      files: ['**/*.js'],
      excludedFiles: ['node_modules/**']
    },
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true
      }
    }
  ]
};