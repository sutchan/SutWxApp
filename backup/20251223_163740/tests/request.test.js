/**
 * 文件名: request.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-02
 * 描述: 网络请求工具单元测试
 */

// 模拟wx对象
jest.mock('wx', () => ({
  request: jest.fn(),
  getStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn()
}));

const wx = require('wx');

// 重置模块缓存
jest.resetModules();

// 导入要测试的模块
const request = require('../SutWxApp/utils/request');

describe('Request工具测试', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
    
    // 模拟getStorageSync返回空token
    wx.getStorageSync.mockReturnValue(null);
  });

  test('GET请求应正确调用wx.request', () => {
    // 模拟wx.request成功回调
    const mockResponse = {
      statusCode: 200,
      data: {
        success: true,
        data: 'test data'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.get
    return request.get('/test', { id: 1 }).then(response => {
      // 验证结果
      expect(response).toEqual(mockResponse.data);
      expect(wx.request).toHaveBeenCalledTimes(1);
      expect(wx.request.mock.calls[0][0]).toEqual(expect.objectContaining({
        url: expect.stringContaining('/test?id=1'),
        method: 'GET',
        header: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });
  });

  test('POST请求应正确调用wx.request', () => {
    // 模拟wx.request成功回调
    const mockResponse = {
      statusCode: 200,
      data: {
        success: true,
        data: 'test data'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.post
    return request.post('/test', { name: 'test' }).then(response => {
      // 验证结果
      expect(response).toEqual(mockResponse.data);
      expect(wx.request).toHaveBeenCalledTimes(1);
      expect(wx.request.mock.calls[0][0]).toEqual(expect.objectContaining({
        url: expect.stringContaining('/test'),
        method: 'POST',
        header: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        data: { name: 'test' }
      }));
    });
  });

  test('PUT请求应正确调用wx.request', () => {
    // 模拟wx.request成功回调
    const mockResponse = {
      statusCode: 200,
      data: {
        success: true,
        data: 'test data'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.put
    return request.put('/test/1', { name: 'updated' }).then(response => {
      // 验证结果
      expect(response).toEqual(mockResponse.data);
      expect(wx.request).toHaveBeenCalledTimes(1);
      expect(wx.request.mock.calls[0][0]).toEqual(expect.objectContaining({
        url: expect.stringContaining('/test/1'),
        method: 'PUT',
        header: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        data: { name: 'updated' }
      }));
    });
  });

  test('DELETE请求应正确调用wx.request', () => {
    // 模拟wx.request成功回调
    const mockResponse = {
      statusCode: 200,
      data: {
        success: true,
        data: 'test data'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.delete
    return request.delete('/test/1').then(response => {
      // 验证结果
      expect(response).toEqual(mockResponse.data);
      expect(wx.request).toHaveBeenCalledTimes(1);
      expect(wx.request.mock.calls[0][0]).toEqual(expect.objectContaining({
        url: expect.stringContaining('/test/1'),
        method: 'DELETE',
        header: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });
  });

  test('401错误应提示用户重新登录', () => {
    // 模拟wx.request返回401
    const mockResponse = {
      statusCode: 401,
      data: {
        success: false,
        message: 'Unauthorized'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.fail(mockResponse);
    });

    // 调用request.get
    return request.get('/test').catch(error => {
      // 验证结果
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Unauthorized');
      expect(wx.showToast).toHaveBeenCalled();
      expect(wx.showModal).toHaveBeenCalled();
    });
  });

  test('500错误应正确处理', () => {
    // 模拟wx.request返回500
    const mockResponse = {
      statusCode: 500,
      data: {
        success: false,
        message: 'Internal Server Error'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.fail(mockResponse);
    });

    // 调用request.get
    return request.get('/test').catch(error => {
      // 验证结果
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Internal Server Error');
    });
  });

  test('网络错误应正确处理', () => {
    // 模拟wx.request返回网络错误
    const mockError = {
      errMsg: 'request:fail network error'
    };
    
    wx.request.mockImplementation(options => {
      options.fail(mockError);
    });

    // 调用request.get
    return request.get('/test').catch(error => {
      // 验证结果
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('网络错误，请检查网络连接');
    });
  });

  test('请求超时应正确处理', () => {
    // 模拟wx.request返回超时错误
    const mockError = {
      errMsg: 'request:fail timeout'
    };
    
    wx.request.mockImplementation(options => {
      options.fail(mockError);
    });

    // 调用request.get
    return request.get('/test').catch(error => {
      // 验证结果
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('请求超时，请稍后重试');
    });
  });

  test('请求应自动添加token', () => {
    // 模拟getStorageSync返回token
    wx.getStorageSync.mockReturnValue('test-token-123');
    
    // 模拟wx.request成功回调
    const mockResponse = {
      statusCode: 200,
      data: {
        success: true,
        data: 'test data'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.get
    return request.get('/test').then(() => {
      // 验证结果
      expect(wx.request.mock.calls[0][0]).toEqual(expect.objectContaining({
        header: expect.objectContaining({
          'Authorization': 'Bearer test-token-123'
        })
      }));
    });
  });

  test('应正确处理请求参数', () => {
    // 模拟wx.request成功回调
    const mockResponse = {
      statusCode: 200,
      data: {
        success: true,
        data: 'test data'
      }
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.get，带复杂参数
    const params = {
      id: 1,
      name: 'test',
      tags: ['a', 'b', 'c'],
      active: true,
      price: 9.99
    };

    return request.get('/test', params).then(() => {
      // 验证URL包含正确的查询参数
      const url = wx.request.mock.calls[0][0].url;
      expect(url).toContain('id=1');
      expect(url).toContain('name=test');
      expect(url).toContain('tags%5B0%5D=a');
      expect(url).toContain('active=true');
      expect(url).toContain('price=9.99');
    });
  });

  test('应正确处理空响应数据', () => {
    // 模拟wx.request返回空数据
    const mockResponse = {
      statusCode: 200,
      data: null
    };
    
    wx.request.mockImplementation(options => {
      options.success(mockResponse);
    });

    // 调用request.get
    return request.get('/test').catch(error => {
      // 验证结果
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('服务器返回数据格式错误');
    });
  });
});
