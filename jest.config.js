/**
 * Jest 配置文件
 * 用于配置测试环境、模块解析和依赖模拟
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json'],
  
  // 模块名称映射 - 用于模拟难以测试的模块
  moduleNameMapper: {
    // 模拟微信小程序的wx模块
    '^wx$': '<rootDir>/__mocks__/wx.js',
    
    // 模拟所有服务模块
    '^\./(.*)-service$': '<rootDir>/__mocks__/service-mock.js',
    
    // 模拟services/index
    '^\./index$': '<rootDir>/__mocks__/services-index-mock.js'
  },
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/**/__tests__/**/*.test.js',
    '<rootDir>/**/tests/**/*.test.js'
  ],
  
  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // 模拟文件的位置
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 收集覆盖率信息
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov']
};
