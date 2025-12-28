/**
 * 文件名: request.ts
 * 版本号: 1.0.1
 * 更新日期: 2025-12-28
 * 描述: 网络请求工具，封装wx.request，支持拦截器、重试机制等
 */

// 安全获取wx对象
function getWx() {
  if (typeof wx !== 'undefined') {
    return wx;
  }
  return null;
}

interface RequestConfig {
  baseURL: string;
  timeout: number;
  retry: number;
  retryDelay: number;
}

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  timeout?: number;
  needAuth?: boolean;
  retry?: number;
  retryDelay?: number;
}

interface Interceptor {
  (config: RequestOptions): RequestOptions | void;
}

const DEFAULT_CONFIG: RequestConfig = {
  baseURL: '',
  timeout: 10000,
  retry: 1,
  retryDelay: 1000
};

const requestInterceptors: Interceptor[] = [];
const responseInterceptors: Interceptor[] = [];

function request(options: RequestOptions): Promise<unknown> {
  const config: RequestOptions = {
    ...DEFAULT_CONFIG,
    ...options,
    method: options.method || 'GET',
    header: {
      'content-type': 'application/json',
      ...options.header
    }
  };

  if (config.needAuth !== false) {
    const wx = getWx();
    if (wx) {
      const token = wx.getStorageSync<string>('token');
      if (token) {
        config.header = {
          ...config.header,
          'Authorization': `Bearer ${token}`
        };
      }
    }
  }

  let processedConfig: RequestOptions = { ...config };
  for (const interceptor of requestInterceptors) {
    const result = interceptor(processedConfig);
    if (result) {
      processedConfig = result;
    }
  }

  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const wx = getWx();

    function sendRequest(): void {
      if (!wx || !wx.request) {
        reject(new Error('wx.request未定义'));
        return;
      }

      wx.request({
        ...processedConfig,
        success: (res: WechatMiniprogram.RequestSuccess<unknown>) => {
          let processedResponse: WechatMiniprogram.RequestSuccess<unknown> = res;
          for (const interceptor of responseInterceptors) {
            const result = interceptor(processedResponse);
            if (result) {
              processedResponse = result;
            }
          }

          if (processedResponse.statusCode && processedResponse.statusCode >= 200 && processedResponse.statusCode < 300) {
            resolve(processedResponse.data);
          } else if (processedResponse.statusCode === 401) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.navigateTo({ url: '/pages/login/login' });
            reject(new Error('未授权，请重新登录'));
          } else {
            const errorMessage = (processedResponse.data as { message?: string })?.message || `请求失败：${processedResponse.statusCode}`;
            reject(new Error(errorMessage));
          }
        },
        fail: (err: WechatMiniprogram.RequestFail) => {
          if (retryCount < processedConfig.retry!) {
            retryCount++;
            setTimeout(sendRequest, processedConfig.retryDelay);
          } else {
            reject(err);
          }
        }
      });
    }

    sendRequest();
  });
}

request.get = function (url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  });
};

request.post = function (url: string, data?: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

request.put = function (url: string, data?: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

request.delete = function (url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
  return request({
    url,
    method: 'DELETE',
    data: params,
    ...options
  });
};

request.addRequestInterceptor = function (interceptor: Interceptor): void {
  if (typeof interceptor === 'function') {
    requestInterceptors.push(interceptor);
  }
};

request.addResponseInterceptor = function (interceptor: Interceptor): void {
  if (typeof interceptor === 'function') {
    responseInterceptors.push(interceptor);
  }
};

request.setBaseURL = function (baseURL: string): void {
  DEFAULT_CONFIG.baseURL = baseURL;
};

export default request;
