/**
 * 文件名: eslint.config.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

// eslint.config.js
module.exports = [
  {
    files: ['SutWxApp/**/*.js', 'sut-wechat-mini/**/*.js'],
    ignores: ['coverage/**', '**/__mocks__/**', 'fix_*.js', 'check_*.js', 'test_fixes.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs'
    },
    rules: {
      'no-console': 'warn',
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single']
    }
  }
];
