/**
 * 鏂囦欢鍚? .eslintrc.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: ESLint閰嶇疆鏂囦欢
 * 涓哄井淇″皬绋嬪簭椤圭洰鎻愪緵浠ｇ爜瑙勮寖妫€鏌? */
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'standard'
  ],
  plugins: [
    // 寰俊灏忕▼搴忕壒瀹氳鍒欐彃浠?  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  globals: {
    // 寰俊灏忕▼搴忓叏灞€瀵硅薄
    wx: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    App: 'readonly',
    Behavior: 'readonly',
    requirePlugin: 'readonly',
    requireMiniProgram: 'readonly',
    // 鎺у埗鍙?    console: 'readonly',
    // 瀹氭椂鍣?    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly'
  },
  rules: {
    // 鍩虹閿欒妫€鏌?    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
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
    
    // 浠ｇ爜椋庢牸瑙勫垯
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
    
    // 鍙橀噺鍜岀粨鏋勮鍒?    'camelcase': ['error', { properties: 'always' }],
    'consistent-this': ['error', 'self'],
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    
    // 寰俊灏忕▼搴忕壒瀹氳鍒?    'no-restricted-globals': ['error', {
      name: 'onmessage',
      message: '浣跨敤 wx.onMessage 鏇夸唬'
    }, {
      name: 'postMessage',
      message: '浣跨敤 wx.postMessage 鏇夸唬'
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