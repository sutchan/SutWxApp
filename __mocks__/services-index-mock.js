/**
 * services-index-mock.js - 服务索引模块的模拟实现
 * 用于在测试环境中替代真实的services/index.js模块
 */

// 导入服务模拟工厂
const createServiceMock = require('../__mocks__/service-mock');

// 创建所有服务的模拟实例
const mockServices = {
  api: createServiceMock('api'),
  auth: createServiceMock('auth'),
  config: createServiceMock('config'),
  cache: createServiceMock('cache'),
  user: createServiceMock('user'),
  article: createServiceMock('article'),
  points: createServiceMock('points'),
  coupon: createServiceMock('coupon')
};

// 模拟ServiceFactory类
class MockServiceFactory {
  constructor() {
    this.services = { ...mockServices };
    this.isInitialized = false;
  }

  initialize() {
    this.isInitialized = true;
    // 模拟初始化所有服务
    Object.values(this.services).forEach(service => {
      if (service.initialize) {
        service.initialize();
      }
    });
    return Promise.resolve(true);
  }

  getService(serviceName) {
    return this.services[serviceName] || null;
  }

  getAllServices() {
    return { ...this.services };
  }
}

// 创建服务工厂实例
const serviceFactory = new MockServiceFactory();

// 导出与实际模块相同的结构
module.exports = {
  ServiceFactory: MockServiceFactory,
  serviceFactory,
  ...mockServices
};
