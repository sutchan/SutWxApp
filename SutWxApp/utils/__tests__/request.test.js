/**
 * 文件名: request.test.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 描述: Request工具类的单元测试
 */

// 模拟微信API
const mockWx = {
  request: jest.fn(),
  uploadFile: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn()
};

// 模拟依赖
jest.mock('../signature.js', () => ({
  addSignatureToHeaders: jest.fn((options) => ({
    ...options,
    header: {
      ...options.header,
      'X-Signature': 'mocked-signature'
    }
  }))
}));

jest.mock('../i18n.js', () => ({
  translate: jest.fn((key) => {
    const translations = {
      'login_required': '请登录',
      'network_error': '网络请求失败'
    };
    return translations[key] || key;
  })
}));

jest.mock('../store.js', () => ({
  getState: jest.fn(),
  commit: jest.fn()
}));

// 保存原始的wx对象
const originalWx = global.wx;

// 测试前设置
beforeEach(() => {
  // 模拟wx全局对象
  global.wx = mockWx;
  
  // 重置所有模拟函数
  Object.keys(mockWx).forEach(key => {
    if (mockWx[key].mock) {
      mockWx[key].mockClear();
    }
  });
  
  // 重置其他模拟
  const signature = require('../signature.js');
  const i18n = require('../i18n.js');
  const store = require('../store.js');
  
  signature.addSignatureToHeaders.mockClear();
  i18n.translate.mockClear();
  store.getState.mockClear();
  store.commit.mockClear();
  
  // 默认的store.getState行为
  store.getState.mockImplementation((key) => {
    if (key === 'user.token') {
      return 'mocked-token';
    }
    return null;
  });
});

// 测试后清理
afterEach(() => {
  // 恢复原始的wx对象
  global.wx = originalWx;
});

// 导入要测试的模块
const Request = require('../request.js');

describe('Request工具类', () => {
  describe('request方法', () => {
    it('应该成功发起请求并返回数据', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        options.success({
          statusCode: 200,
          data: { success: true, result: 'test data' }
        });
      });
      
      const result = await Request.request({
        url: '/test',
        method: 'GET'
      });
      
      expect(result).toEqual({ success: true, result: 'test data' });
      expect(mockWx.request).toHaveBeenCalledTimes(1);
    });
    
    it('应该在401响应时处理未授权情况', async () => {
      const store = require('../store.js');
      
      // 模拟401响应
      mockWx.request.mockImplementation(options => {
        options.success({
          statusCode: 401
        });
      });
      
      await expect(Request.request({
        url: '/test',
        method: 'GET'
      })).rejects.toThrow('请登录');
      
      // 验证是否清除了token和用户信息
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('token');
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('userInfo');
    });
    
    it('应该在请求失败时抛出错误', async () => {
      // 模拟失败响应
      mockWx.request.mockImplementation(options => {
        options.success({
          statusCode: 400,
          data: { message: '请求参数错误' }
        });
      });
      
      await expect(Request.request({
        url: '/test',
        method: 'GET'
      })).rejects.toThrow('请求参数错误');
    });
    
    it('应该在网络错误时进行重试', async () => {
      // 模拟三次失败然后成功
      let callCount = 0;
      mockWx.request.mockImplementation(options => {
        callCount++;
        if (callCount <= 3) {
          options.fail(new Error('网络错误'));
        } else {
          options.success({
            statusCode: 200,
            data: { success: true }
          });
        }
      });
      
      // 使用jest.useFakeTimers来模拟setTimeout
      jest.useFakeTimers();
      
      const promise = Request.request({
        url: '/test',
        method: 'GET'
      });
      
      // 快进所有定时器
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result).toEqual({ success: true });
      expect(mockWx.request).toHaveBeenCalledTimes(4); // 1次初始请求 + 3次重试
      
      // 恢复真实的定时器
      jest.useRealTimers();
    });
    
    it('应该在重试次数用完后抛出错误', async () => {
      // 模拟全部失败
      mockWx.request.mockImplementation(options => {
        options.fail(new Error('网络错误'));
      });
      
      // 使用jest.useFakeTimers来模拟setTimeout
      jest.useFakeTimers();
      
      const promise = Request.request({
        url: '/test',
        method: 'GET'
      });
      
      // 快进所有定时器
      jest.runAllTimers();
      
      await expect(promise).rejects.toThrow('网络请求失败');
      
      // 恢复真实的定时器
      jest.useRealTimers();
    });
    
    it('应该在需要认证时添加Authorization头', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        expect(options.header['Authorization']).toBe('Bearer mocked-token');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.request({
        url: '/test',
        method: 'GET',
        needAuth: true
      });
    });
    
    it('应该在不需要认证时不添加Authorization头', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        expect(options.header['Authorization']).toBeUndefined();
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.request({
        url: '/test',
        method: 'GET',
        needAuth: false
      });
    });
    
    it('应该在需要签名时调用addSignatureToHeaders', async () => {
      const signature = require('../signature.js');
      
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.request({
        url: '/test',
        method: 'GET',
        needSign: true
      });
      
      expect(signature.addSignatureToHeaders).toHaveBeenCalled();
    });
  });
  
  describe('HTTP方法快捷函数', () => {
    it('应该正确调用GET方法', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        expect(options.method).toBe('GET');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.get('/test', { id: 1 });
    });
    
    it('应该正确调用POST方法', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        expect(options.method).toBe('POST');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.post('/test', { name: 'test' });
    });
    
    it('应该正确调用PUT方法', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        expect(options.method).toBe('PUT');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.put('/test', { id: 1, name: 'updated' });
    });
    
    it('应该正确调用DELETE方法', async () => {
      // 模拟成功响应
      mockWx.request.mockImplementation(options => {
        expect(options.method).toBe('DELETE');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.delete('/test', { id: 1 });
    });
  });
  
  describe('_buildUrl方法', () => {
    it('应该正确构建相对URL', () => {
      // 由于_buildUrl是私有方法，我们通过测试request方法来间接测试它
      mockWx.request.mockImplementation(options => {
        expect(options.url).toBe('https://api.example.com/v1/test');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      return Request.get('test');
    });
    
    it('应该正确处理以/开头的相对URL', () => {
      mockWx.request.mockImplementation(options => {
        expect(options.url).toBe('https://api.example.com/v1/test');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      return Request.get('/test');
    });
    
    it('应该直接返回完整URL', () => {
      mockWx.request.mockImplementation(options => {
        expect(options.url).toBe('https://custom-domain.com/api');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      return Request.get('https://custom-domain.com/api');
    });
  });
  
  describe('_getAuthToken方法', () => {
    it('应该从store获取token', async () => {
      const store = require('../store.js');
      store.getState.mockReturnValue('store-token');
      
      mockWx.request.mockImplementation(options => {
        expect(options.header['Authorization']).toBe('Bearer store-token');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.get('/test');
    });
    
    it('应该在store没有token时从本地存储获取', async () => {
      const store = require('../store.js');
      store.getState.mockReturnValue(null);
      mockWx.getStorageSync.mockReturnValue('local-storage-token');
      
      mockWx.request.mockImplementation(options => {
        expect(options.header['Authorization']).toBe('Bearer local-storage-token');
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.get('/test');
    });
    
    it('应该在出错时返回null', async () => {
      const store = require('../store.js');
      store.getState.mockImplementation(() => {
        throw new Error('store error');
      });
      
      mockWx.request.mockImplementation(options => {
        expect(options.header['Authorization']).toBeUndefined();
        options.success({
          statusCode: 200,
          data: { success: true }
        });
      });
      
      await Request.get('/test');
    });
  });
  
  describe('uploadFile方法', () => {
    it('应该成功上传文件', async () => {
      // 模拟上传成功
      mockWx.uploadFile.mockImplementation(options => {
        options.success({
          statusCode: 200,
          data: JSON.stringify({ success: true, url: 'uploaded-url' })
        });
      });
      
      const result = await Request.uploadFile(
        '/upload',
        '/path/to/file.jpg'
      );
      
      expect(result).toEqual({ success: true, url: 'uploaded-url' });
      expect(mockWx.uploadFile).toHaveBeenCalledTimes(1);
    });
    
    it('应该在上传失败时抛出错误', async () => {
      // 模拟上传失败
      mockWx.uploadFile.mockImplementation(options => {
        options.success({
          statusCode: 400,
          data: JSON.stringify({ message: '上传失败' })
        });
      });
      
      await expect(Request.uploadFile(
        '/upload',
        '/path/to/file.jpg'
      )).rejects.toThrow('上传失败');
    });
    
    it('应该在解析响应失败时抛出错误', async () => {
      // 模拟响应不是有效的JSON
      mockWx.uploadFile.mockImplementation(options => {
        options.success({
          statusCode: 200,
          data: 'invalid json'
        });
      });
      
      await expect(Request.uploadFile(
        '/upload',
        '/path/to/file.jpg'
      )).rejects.toThrow('解析响应失败');
    });
    
    it('应该在网络错误时抛出错误', async () => {
      // 模拟网络错误
      mockWx.uploadFile.mockImplementation(options => {
        options.fail(new Error('网络错误'));
      });
      
      await expect(Request.uploadFile(
        '/upload',
        '/path/to/file.jpg'
      )).rejects.toThrow('上传文件失败');
    });
    
    it('应该在需要认证时添加Authorization头', async () => {
      // 模拟上传成功
      mockWx.uploadFile.mockImplementation(options => {
        expect(options.header['Authorization']).toBe('Bearer mocked-token');
        options.success({
          statusCode: 200,
          data: JSON.stringify({ success: true })
        });
      });
      
      await Request.uploadFile(
        '/upload',
        '/path/to/file.jpg',
        { needAuth: true }
      );
    });
  });
});
