/**
 * 文件名: index.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-06-17
 * 描述: 首页页面的单元测试
 */

// 模拟微信小程序的 Page 和 API
global.Page = (options) => {
  const pageInstance = {
    data: { ...options.data },
    methods: options.methods || {},
    onLoad: options.onLoad,
    onUnload: options.onUnload,
    onShow: options.onShow,
    onPullDownRefresh: options.onPullDownRefresh,
    onReachBottom: options.onReachBottom,
    setData(newData) {
      Object.assign(pageInstance.data, newData);
    }
  };

  // 将方法合并到实例上
  Object.assign(pageInstance, options.methods || {});
  
  return pageInstance;
};

global.wx = {
  navigateTo: jest.fn(),
  stopPullDownRefresh: jest.fn()
};

// 模拟 i18n 模块
jest.mock('../../utils/i18n', () => ({
  translate: jest.fn((key) => key)
}));

const i18n = require('../../utils/i18n');

// 获取页面实例
const indexPage = require('../index');

describe('index page', () => {
  let page;

  beforeEach(() => {
    // 创建新的页面实例
    page = global.Page(indexPage);
    
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('data initialization', () => {
    it('should initialize with correct default data', () => {
      expect(page.data.i18n).toBe(i18n);
      expect(page.data.loading).toBe(false);
      expect(page.data.banners).toEqual([]);
      expect(page.data.categories).toEqual([]);
      expect(page.data.products).toEqual([]);
      expect(page.data.timer).toBeNull();
    });
  });

  describe('loadData', () => {
    it('should set loading to true and load mock data', (done) => {
      page.loadData(() => {
        expect(page.data.loading).toBe(false);
        expect(page.data.banners).toHaveLength(3);
        expect(page.data.categories).toHaveLength(4);
        expect(page.data.products).toHaveLength(4);
        expect(page.data.timer).toBeNull();
        done();
      });

      // 验证 loading 状态
      expect(page.data.loading).toBe(true);
    });

    it('should work without callback', (done) => {
      page.loadData();
      
      setTimeout(() => {
        expect(page.data.loading).toBe(false);
        expect(page.data.banners).toHaveLength(3);
        expect(page.data.categories).toHaveLength(4);
        expect(page.data.products).toHaveLength(4);
        expect(page.data.timer).toBeNull();
        done();
      }, 350);
    });
  });

  describe('onLoad', () => {
    it('should call loadData when page loads', () => {
      const loadDataSpy = jest.spyOn(page, 'loadData');
      
      page.onLoad();
      
      expect(loadDataSpy).toHaveBeenCalled();
    });
  });

  describe('onUnload', () => {
    it('should clear timer when page unloads', () => {
      // 设置一个定时器
      const timer = setTimeout(() => {}, 1000);
      page.setData({ timer });
      
      page.onUnload();
      
      // 验证定时器被清除（这里我们只能验证 timer 被设置为 null）
      expect(page.data.timer).toBeNull();
    });

    it('should handle case when timer is null', () => {
      page.setData({ timer: null });
      
      // 不应该抛出错误
      expect(() => page.onUnload()).not.toThrow();
    });
  });

  describe('onPullDownRefresh', () => {
    it('should call loadData and stop pull down refresh', () => {
      const loadDataSpy = jest.fn((callback) => {
        callback();
      });
      page.loadData = loadDataSpy;
      
      page.onPullDownRefresh();
      
      expect(loadDataSpy).toHaveBeenCalled();
      expect(wx.stopPullDownRefresh).toHaveBeenCalled();
    });
  });

  describe('goToCategory', () => {
    it('should navigate to category page with correct id', () => {
      const mockEvent = {
        currentTarget: {
          dataset: { id: '123' }
        }
      };
      
      page.goToCategory(mockEvent);
      
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/category/category?id=123'
      });
    });
  });

  describe('goToProductDetail', () => {
    it('should navigate to product detail page with correct id', () => {
      const mockEvent = {
        currentTarget: {
          dataset: { id: '456' }
        }
      };
      
      page.goToProductDetail(mockEvent);
      
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/product/detail/detail?id=456'
      });
    });
  });
});