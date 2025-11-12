/**
 * ServiceManager测试用例
 */
const { ServiceManager } = require('../service-manager');

describe('ServiceManager', () => {
  let serviceManager;

  beforeEach(() => {
    // 每个测试用例前初始化serviceManager实例
    serviceManager = new ServiceManager();
  });

  describe('registerService', () => {
    test('should register a service successfully', () => {
      const mockService = { name: 'testService', initialize: jest.fn() };
      serviceManager.registerService(mockService, []);
      
      // 验证服务是否成功注册
      expect(serviceManager.serviceRegistry.testService).toBeDefined();
      expect(serviceManager.serviceRegistry.testService.service).toBe(mockService);
    });

    test('should register a service with dependencies', () => {
      const mockDependency = { name: 'dependency', initialize: jest.fn() };
      const mockService = { name: 'testService', initialize: jest.fn() };
      
      serviceManager.registerService(mockDependency, []);
      serviceManager.registerService(mockService, ['dependency']);
      
      expect(serviceManager.serviceRegistry.testService.dependencies).toEqual(['dependency']);
    });

    test('should throw error when registering a service with non-existent dependencies', () => {
      const mockService = { name: 'testService', initialize: jest.fn() };
      
      expect(() => {
        serviceManager.registerService(mockService, ['nonExistentDependency']);
      }).toThrow('服务依赖 nonExistentDependency 不存在');
    });
  });

  describe('initializeServices', () => {
    test('should initialize services in correct order based on dependencies', async () => {
      const initOrder = [];
      
      const dependency1 = { 
        name: 'dependency1', 
        initialize: jest.fn().mockImplementation(() => {
          initOrder.push('dependency1');
          return Promise.resolve();
        })
      };
      
      const dependency2 = { 
        name: 'dependency2', 
        initialize: jest.fn().mockImplementation(() => {
          initOrder.push('dependency2');
          return Promise.resolve();
        })
      };
      
      const service = { 
        name: 'testService', 
        initialize: jest.fn().mockImplementation(() => {
          initOrder.push('testService');
          return Promise.resolve();
        })
      };
      
      serviceManager.registerService(dependency1, []);
      serviceManager.registerService(dependency2, []);
      serviceManager.registerService(service, ['dependency1', 'dependency2']);
      
      await serviceManager.initializeServices();
      
      // 验证初始化顺序
      expect(initOrder).toEqual(['dependency1', 'dependency2', 'testService']);
      expect(dependency1.initialize).toHaveBeenCalled();
      expect(dependency2.initialize).toHaveBeenCalled();
      expect(service.initialize).toHaveBeenCalled();
    });

    test('should handle circular dependencies correctly', () => {
      const serviceA = { name: 'serviceA', initialize: jest.fn() };
      const serviceB = { name: 'serviceB', initialize: jest.fn() };
      
      serviceManager.registerService(serviceA, ['serviceB']);
      serviceManager.registerService(serviceB, ['serviceA']);
      
      expect(serviceManager.initializeServices()).rejects.toThrow('检测到循环依赖');
    });

    test('should handle initialization errors', async () => {
      const failingService = { 
        name: 'failingService', 
        initialize: jest.fn().mockRejectedValue(new Error('Initialization failed'))
      };
      
      serviceManager.registerService(failingService, []);
      
      await expect(serviceManager.initializeServices()).rejects.toThrow('Initialization failed');
    });
  });

  describe('getService', () => {
    test('should return a registered service instance', () => {
      const mockService = { name: 'testService', initialize: jest.fn() };
      serviceManager.registerService(mockService, []);
      
      const result = serviceManager.getService('testService');
      expect(result).toBe(mockService);
    });

    test('should return null for non-registered services', () => {
      const result = serviceManager.getService('nonExistentService');
      expect(result).toBeNull();
    });
  });

  describe('resolveDependencies', () => {
    test('should resolve dependencies correctly', () => {
      const dependency = { name: 'dependency', initialize: jest.fn() };
      const service = { name: 'testService', initialize: jest.fn() };
      
      serviceManager.registerService(dependency, []);
      serviceManager.registerService(service, ['dependency']);
      
      const dependencies = serviceManager.resolveDependencies('testService');
      expect(dependencies).toEqual([dependency]);
    });

    test('should throw error for non-registered service dependencies', () => {
      const service = { name: 'testService', initialize: jest.fn() };
      serviceManager.registerService(service, ['nonExistentDependency']);
      
      expect(() => {
        serviceManager.resolveDependencies('testService');
      }).toThrow('服务依赖 nonExistentDependency 不存在');
    });
  });

  describe('sortServicesByDependencies', () => {
    test('should sort services in topological order', () => {
      const serviceA = { name: 'serviceA' };
      const serviceB = { name: 'serviceB' };
      const serviceC = { name: 'serviceC' };
      
      serviceManager.registerService(serviceA, []);
      serviceManager.registerService(serviceB, ['serviceA']);
      serviceManager.registerService(serviceC, ['serviceB']);
      
      const sorted = serviceManager.sortServicesByDependencies();
      const sortedNames = sorted.map(s => s.name);
      
      // 验证服务是否按依赖顺序排序
      expect(sortedNames.indexOf('serviceA')).toBeLessThan(sortedNames.indexOf('serviceB'));
      expect(sortedNames.indexOf('serviceB')).toBeLessThan(sortedNames.indexOf('serviceC'));
    });
  });

  describe('getAllServices', () => {
    test('should return all registered services', () => {
      const serviceA = { name: 'serviceA', initialize: jest.fn() };
      const serviceB = { name: 'serviceB', initialize: jest.fn() };
      
      serviceManager.registerService(serviceA, []);
      serviceManager.registerService(serviceB, []);
      
      const services = serviceManager.getAllServices();
      expect(services).toHaveLength(2);
      expect(services).toContain(serviceA);
      expect(services).toContain(serviceB);
    });
  });
});