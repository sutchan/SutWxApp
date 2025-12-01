/**
 * 文件名 jest.config.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: Jest 娴嬭瘯閰嶇疆鏂囦欢
 */

module.exports = {
  // 娴嬭瘯鐜
  testEnvironment: 'node',
  
  // 测试文件鍖归厤妯″紡
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // 瑕嗙洊鐜囨敹闆?  collectCoverage: true,
  collectCoverageFrom: [
    'SutWxApp/**/*.js',
    '!SutWxApp/**/*.test.js',
    '!SutWxApp/**/__tests__/**',
    '!SutWxApp/**/node_modules/**'
  ],
  
  // 瑕嗙洊鐜囨姤鍛婃牸寮?  coverageReporters: ['text', 'lcov', 'json', 'html'],
  
  // 瑕嗙洊鐜囪緭鍑虹洰褰?  coverageDirectory: 'coverage',
  
  // 鏆傛椂绉婚櫎瑕嗙洊鐜囬槇鍊硷紝闅忕潃娴嬭瘯鐢ㄤ緥澧炲姞鍐嶉€愭鎻愰珮
  // coverageThreshold: {
  //   global: {
  //     branches: 5,
  //     functions: 5,
  //     lines: 5,
  //     statements: 5
  //   }
  // },
  
  // 妯″潡璺緞鏄犲皠
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/SutWxApp/$1'
  },
  
  // 璁剧疆鏂囦欢
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 蹇界暐鐨勮矾寰?  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // 杞崲蹇界暐妯″紡
  transformIgnorePatterns: [
    '/node_modules/'
  ]
};