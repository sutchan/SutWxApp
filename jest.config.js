/**
 * 文件名: jest.config.js
 * 版本号: 1.0.0
 * 更新日期: 2025-06-17
 * 描述: Jest 测试配置文件
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // 覆盖率收集
  collectCoverage: true,
  collectCoverageFrom: [
    'SutWxApp/**/*.js',
    '!SutWxApp/**/*.test.js',
    '!SutWxApp/**/__tests__/**',
    '!SutWxApp/**/node_modules/**'
  ],
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/SutWxApp/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 忽略的路径
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // 转换忽略模式
  transformIgnorePatterns: [
    '/node_modules/'
  ]
};