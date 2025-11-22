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
