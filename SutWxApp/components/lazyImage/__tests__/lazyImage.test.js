/**
 * 文件名: lazyImage.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 懒加载图片组件单元测试
 */

const lazyImage = require('../lazyImage');

// 模拟微信小程序API
const mockWx = {
  createSelectorQuery: jest.fn(() => ({
    select: jest.fn(() => ({
      boundingClientRect: jest.fn((callback) => {
        callback({
          top: 100,
          left: 0,
          width: 100,
          height: 100,
          right: 100,
          bottom: 200
        });
        return {
          exec: jest.fn()
        };
      })
    })),
    selectViewport: jest.fn(() => ({
      scrollOffset: jest.fn((callback) => {
        callback({
          scrollTop: 0,
          scrollLeft: 0
        });
        return {
          exec: jest.fn()
        };
      })
    })),
    getSystemInfoSync: jest.fn(() => ({
      windowWidth: 375,
      windowHeight: 667
    })),
    createIntersectionObserver: jest.fn(() => ({
      relativeToViewport: jest.fn(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
      }))
    }))
  }))
};

// 设置全局变量
global.wx = mockWx;

describe('LazyImage Component', () => {
  let component;
  
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 创建组件实例
    component = {
      data: {
        src: '',
        loaded: false,
        error: false,
        inView: false,
        placeholder: '/images/placeholder.png',
        errorImage: '/images/error.png',
        mode: 'aspectFill',
        lazy: true,
        threshold: 100
      },
      properties: {
        src: {
          type: String,
          value: ''
        },
        placeholder: {
          type: String,
          value: '/images/placeholder.png'
        },
        errorImage: {
          type: String,
          value: '/images/error.png'
        },
        mode: {
          type: String,
          value: 'aspectFill'
        },
        lazy: {
          type: Boolean,
          value: true
        },
        threshold: {
          type: Number,
          value: 100
        }
      },
      setData: jest.fn((newData) => {
        Object.assign(component.data, newData);
      })
    };
    
    // 初始化组件
    lazyImage.created.call(component);
  });
  
  describe('created', () => {
    it('应该初始化组件数据', () => {
      expect(component.data.loaded).toBe(false);
      expect(component.data.error).toBe(false);
      expect(component.data.inView).toBe(false);
    });
  });
  
  describe('attached', () => {
    it('应该在懒加载模式下创建交叉观察器', () => {
      lazyImage.attached.call(component);
      
      expect(mockWx.createIntersectionObserver).toHaveBeenCalledTimes(1);
      expect(mockWx.createIntersectionObserver().relativeToViewport).toHaveBeenCalledTimes(1);
    });
    
    it('应该在非懒加载模式下直接加载图片', () => {
      component.data.lazy = false;
      
      lazyImage.attached.call(component);
      
      expect(mockWx.createIntersectionObserver).not.toHaveBeenCalled();
      expect(component.data.inView).toBe(true);
    });
  });
  
  describe('detached', () => {
    it('应该断开交叉观察器连接', () => {
      // 先附加组件
      lazyImage.attached.call(component);
      
      // 然后分离组件
      lazyImage.detached.call(component);
      
      expect(mockWx.createIntersectionObserver().relativeToViewport().observe).toHaveBeenCalledTimes(1);
      expect(mockWx.createIntersectionObserver().relativeToViewport().disconnect).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('onSrcChange', () => {
    it('应该在src改变时重置状态', () => {
      component.data.src = 'https://example.com/image.jpg';
      component.data.loaded = true;
      component.data.error = true;
      
      lazyImage.onSrcChange.call(component, { value: 'https://example.com/new-image.jpg' });
      
      expect(component.data.loaded).toBe(false);
      expect(component.data.error).toBe(false);
      expect(component.data.src).toBe('https://example.com/new-image.jpg');
      
      // 如果图片在视口中，应该重新加载
      if (component.data.inView) {
        expect(component.setData).toHaveBeenCalledWith({ loaded: false, error: false });
      }
    });
  });
  
  describe('onLoad', () => {
    it('应该在图片加载成功时设置loaded状态', () => {
      lazyImage.onLoad.call(component);
      
      expect(component.setData).toHaveBeenCalledWith({ loaded: true, error: false });
    });
  });
  
  describe('onError', () => {
    it('应该在图片加载失败时设置error状态', () => {
      lazyImage.onError.call(component);
      
      expect(component.setData).toHaveBeenCalledWith({ error: true });
    });
  });
  
  describe('handleIntersection', () => {
    it('应该在图片进入视口时设置inView状态', () => {
      const mockEvent = {
        detail: {
          intersectionRatio: 0.5
        }
      };
      
      lazyImage.handleIntersection.call(component, mockEvent);
      
      expect(component.setData).toHaveBeenCalledWith({ inView: true });
    });
    
    it('应该在图片离开视口时不改变状态', () => {
      const mockEvent = {
        detail: {
          intersectionRatio: 0
        }
      };
      
      component.data.inView = false;
      
      lazyImage.handleIntersection.call(component, mockEvent);
      
      expect(component.setData).not.toHaveBeenCalledWith({ inView: true });
    });
  });
  
  describe('getImageSrc', () => {
    it('应该在图片未加载且在视口中返回原始src', () => {
      component.data.src = 'https://example.com/image.jpg';
      component.data.loaded = false;
      component.data.error = false;
      component.data.inView = true;
      
      const result = lazyImage.getImageSrc.call(component);
      
      expect(result).toBe('https://example.com/image.jpg');
    });
    
    it('应该在图片加载出错时返回错误图片', () => {
      component.data.src = 'https://example.com/image.jpg';
      component.data.loaded = false;
      component.data.error = true;
      component.data.errorImage = '/images/error.png';
      
      const result = lazyImage.getImageSrc.call(component);
      
      expect(result).toBe('/images/error.png');
    });
    
    it('应该在图片不在视口时返回占位图', () => {
      component.data.src = 'https://example.com/image.jpg';
      component.data.loaded = false;
      component.data.error = false;
      component.data.inView = false;
      component.data.placeholder = '/images/placeholder.png';
      
      const result = lazyImage.getImageSrc.call(component);
      
      expect(result).toBe('/images/placeholder.png');
    });
    
    it('应该在图片已加载时返回原始src', () => {
      component.data.src = 'https://example.com/image.jpg';
      component.data.loaded = true;
      component.data.error = false;
      component.data.inView = true;
      
      const result = lazyImage.getImageSrc.call(component);
      
      expect(result).toBe('https://example.com/image.jpg');
    });
  });
});