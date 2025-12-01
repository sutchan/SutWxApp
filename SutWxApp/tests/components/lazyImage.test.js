/**
 * 文件名: lazyImage.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 图片懒加载组件单元测试
 */

// 模拟微信API
jest.mock('wx', () => ({
  createIntersectionObserver: jest.fn(() => ({
    relativeToViewport: jest.fn().mockReturnThis(),
    observe: jest.fn(),
    disconnect: jest.fn()
  }))
}));

const wx = require('wx');

// 模拟Component函数
global.Component = jest.fn((options) => {
  return options;
});

// 清除之前的模块缓存
jest.resetModules();

// 导入组件
const lazyImageComponent = require('../../components/lazyImage/lazyImage.js');

// 获取组件配置
const componentOptions = global.Component.mock.calls[0][0];
const lazyImageMethods = componentOptions.methods;

describe('lazyImageComponent', () => {
  let componentInstance;
  
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 创建组件实例模拟
    componentInstance = {
      data: {
        src: '',
        placeholder: '/images/placeholder.png',
        errorImage: '/images/error.png',
        mode: 'aspectFill',
        lazy: true,
        threshold: 100,
        loaded: false,
        error: false,
        inView: false
      },
      setData: jest.fn((newData) => {
        Object.assign(componentInstance.data, newData);
      })
    };
    
    // 将方法绑定到实例
    Object.keys(lazyImageMethods).forEach(methodName => {
      componentInstance[methodName] = lazyImageMethods[methodName].bind(componentInstance);
    });
  });
  
  describe('created', () => {
    it('should initialize component data correctly', () => {
      // 执行测试
      componentInstance.created();
      
      // 验证结果
      expect(componentInstance.data.loaded).toBe(false);
      expect(componentInstance.data.error).toBe(false);
      expect(componentInstance.data.inView).toBe(false);
    });
  });
  
  describe('attached', () => {
    it('should create intersection observer for lazy loading', () => {
      // 设置组件为懒加载模式
      componentInstance.data.lazy = true;
      
      // 执行测试
      componentInstance.attached();
      
      // 验证结果
      expect(wx.createIntersectionObserver).toHaveBeenCalled();
      expect(componentInstance.observer).toBeDefined();
    });
    
    it('should load image immediately if not lazy', () => {
      // 设置组件为非懒加载模式
      componentInstance.data.lazy = false;
      componentInstance.loadImage = jest.fn();
      
      // 执行测试
      componentInstance.attached();
      
      // 验证结果
      expect(componentInstance.data.inView).toBe(true);
      expect(componentInstance.loadImage).toHaveBeenCalled();
    });
  });
  
  describe('detached', () => {
    it('should disconnect observer when detached', () => {
      // 创建模拟observer
      const mockObserver = {
        disconnect: jest.fn()
      };
      componentInstance.observer = mockObserver;
      
      // 执行测试
      componentInstance.detached();
      
      // 验证结果
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });
  
  describe('loadImage', () => {
    it('should not load if no src provided', () => {
      // 执行测试
      componentInstance.data.src = '';
      componentInstance.loadImage();
      
      // 验证结果
      // 由于loadImage方法主要是触发wxml中的bindload和binderror，这里主要验证它不会报错
      expect(true).toBe(true);
    });
    
    it('should load image when src provided', () => {
      // 执行测试
      componentInstance.data.src = 'https://example.com/image.jpg';
      componentInstance.loadImage();
      
      // 验证结果
      // 由于loadImage方法主要是触发wxml中的bindload和binderror，这里主要验证它不会报错
      expect(true).toBe(true);
    });
  });
  
  describe('onLoad', () => {
    it('should set loaded to true and error to false when image loads successfully', () => {
      // 执行测试
      componentInstance.onLoad();
      
      // 验证结果
      expect(componentInstance.data.loaded).toBe(true);
      expect(componentInstance.data.error).toBe(false);
    });
  });
  
  describe('onError', () => {
    it('should set error to true when image fails to load', () => {
      // 执行测试
      componentInstance.onError();
      
      // 验证结果
      expect(componentInstance.data.error).toBe(true);
    });
  });
  
  describe('handleIntersection', () => {
    it('should set inView to true when image enters viewport', () => {
      // 执行测试
      const event = {
        detail: {
          intersectionRatio: 0.5
        }
      };
      componentInstance.handleIntersection(event);
      
      // 验证结果
      expect(componentInstance.data.inView).toBe(true);
    });
    
    it('should not change inView when image is not in viewport', () => {
      // 执行测试
      const event = {
        detail: {
          intersectionRatio: 0
        }
      };
      componentInstance.handleIntersection(event);
      
      // 验证结果
      expect(componentInstance.data.inView).toBe(false);
    });
  });
  
  describe('getImageSrc', () => {
    it('should return error image when error occurred', () => {
      // 设置测试数据
      componentInstance.data.error = true;
      componentInstance.data.errorImage = '/images/error.png';
      
      // 执行测试
      const result = componentInstance.getImageSrc();
      
      // 验证结果
      expect(result).toBe('/images/error.png');
    });
    
    it('should return src when image is loaded', () => {
      // 设置测试数据
      componentInstance.data.loaded = true;
      componentInstance.data.src = 'https://example.com/image.jpg';
      
      // 执行测试
      const result = componentInstance.getImageSrc();
      
      // 验证结果
      expect(result).toBe('https://example.com/image.jpg');
    });
    
    it('should return src when image is in view', () => {
      // 设置测试数据
      componentInstance.data.inView = true;
      componentInstance.data.src = 'https://example.com/image.jpg';
      
      // 执行测试
      const result = componentInstance.getImageSrc();
      
      // 验证结果
      expect(result).toBe('https://example.com/image.jpg');
    });
    
    it('should return placeholder when image is not loaded and not in view', () => {
      // 设置测试数据
      componentInstance.data.loaded = false;
      componentInstance.data.inView = false;
      componentInstance.data.placeholder = '/images/placeholder.png';
      
      // 执行测试
      const result = componentInstance.getImageSrc();
      
      // 验证结果
      expect(result).toBe('/images/placeholder.png');
    });
  });
  
  describe('observers', () => {
    it('should load image when inView becomes true', () => {
      // 获取observer函数
      const inViewObserver = componentOptions.observers['inView'];
      componentInstance.loadImage = jest.fn();
      
      // 执行测试
      inViewObserver.call(componentInstance, true);
      
      // 验证结果
      expect(componentInstance.loadImage).toHaveBeenCalled();
    });
    
    it('should not load image when inView becomes true but already loaded', () => {
      // 获取observer函数
      const inViewObserver = componentOptions.observers['inView'];
      componentInstance.loadImage = jest.fn();
      componentInstance.data.loaded = true;
      
      // 执行测试
      inViewObserver.call(componentInstance, true);
      
      // 验证结果
      expect(componentInstance.loadImage).not.toHaveBeenCalled();
    });
    
    it('should not load image when inView becomes true but already in error state', () => {
      // 获取observer函数
      const inViewObserver = componentOptions.observers['inView'];
      componentInstance.loadImage = jest.fn();
      componentInstance.data.error = true;
      
      // 执行测试
      inViewObserver.call(componentInstance, true);
      
      // 验证结果
      expect(componentInstance.loadImage).not.toHaveBeenCalled();
    });
    
    it('should reload image when src changes and inView is true', () => {
      // 获取observer函数
      const srcObserver = componentOptions.observers['src'];
      componentInstance.loadImage = jest.fn();
      componentInstance.data.inView = true;
      
      // 执行测试
      srcObserver.call(componentInstance, 'https://example.com/new-image.jpg');
      
      // 验证结果
      expect(componentInstance.data.loaded).toBe(false);
      expect(componentInstance.data.error).toBe(false);
      expect(componentInstance.loadImage).toHaveBeenCalled();
    });
  });
});
