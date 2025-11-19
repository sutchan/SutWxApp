/**
 * service-mock.js - 服务模块的通用模拟实现
 * 用于在测试环境中替代真实的服务模块
 */

// 创建基础服务模拟
const baseService = {
  // 初始化方法
  initialize: jest.fn().mockResolvedValue(true),
  
  // 默认的方法模拟
  get: jest.fn().mockResolvedValue({}),
  set: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(true),
  delete: jest.fn().mockResolvedValue(true),
  list: jest.fn().mockResolvedValue([]),
  
  // 事件系统
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
};

// 根据不同的服务名称返回特定的模拟
module.exports = (serviceName) => {
  // 服务名称映射
  const serviceMocks = {
    // 基础服务
    'api': {
      ...baseService,
      request: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
      get: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
      post: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
      put: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
      delete: jest.fn().mockResolvedValue({ data: {}, status: 200 })
    },
    
    'auth': {
      ...baseService,
      login: jest.fn().mockResolvedValue({ token: 'mock-token' }),
      logout: jest.fn().mockResolvedValue(true),
      getUserInfo: jest.fn().mockResolvedValue({ id: '1', name: 'Mock User' }),
      checkLoginStatus: jest.fn().mockResolvedValue(true)
    },
    
    'config': {
      ...baseService,
      load: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockReturnValue(null),
      set: jest.fn().mockReturnValue(true),
      has: jest.fn().mockReturnValue(false)
    },
    
    'cache': {
      ...baseService,
      get: jest.fn().mockReturnValue(null),
      set: jest.fn().mockReturnValue(true),
      remove: jest.fn().mockReturnValue(true),
      clear: jest.fn().mockReturnValue(true),
      has: jest.fn().mockReturnValue(false)
    },
    
    // 业务服务
    'user': {
      ...baseService,
      getUserInfo: jest.fn().mockResolvedValue({ id: '1', name: 'Mock User' }),
      updateUserInfo: jest.fn().mockResolvedValue({ id: '1', name: 'Updated Mock User' }),
      getUserStats: jest.fn().mockResolvedValue({ points: 100, level: 5 })
    },
    
    'article': {
      ...baseService,
      getArticleList: jest.fn().mockResolvedValue([]),
      getArticleDetail: jest.fn().mockResolvedValue({}),
      getArticleComments: jest.fn().mockResolvedValue([])
    },
    
    'points': {
      ...baseService,
      getPoints: jest.fn().mockResolvedValue({ total: 100, available: 100 }),
      getPointsHistory: jest.fn().mockResolvedValue([]),
      getPointsTasks: jest.fn().mockResolvedValue([]),
      claimPoints: jest.fn().mockResolvedValue({ success: true, points: 10 })
    },
    
    'coupon': {
      ...baseService,
      getCouponList: jest.fn().mockResolvedValue([]),
      getCouponDetail: jest.fn().mockResolvedValue({}),
      claimCoupon: jest.fn().mockResolvedValue({ success: true, couponId: '1' })
    }
  };
  
  // 返回对应服务的模拟，如果没有则返回基础模拟
  return serviceMocks[serviceName] || baseService;
};
