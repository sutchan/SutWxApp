// 测试环境设置

// 全局模拟微信小程序环境
if (typeof global.wx === "undefined") {
  global.wx = require("./__mocks__/wx");
}

// 模拟process.env
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}
