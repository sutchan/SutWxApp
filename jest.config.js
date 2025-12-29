module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.js", "**/*.test.ts"],
  moduleNameMapping: {
    "^wx$": "<rootDir>/__mocks__/wx.js",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
