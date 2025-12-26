module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  moduleNameMapping: {
    '^wx$': '<rootDir>/__mocks__/wx.js'
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js']
};
