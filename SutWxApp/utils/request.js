/**
 * 文件名: request.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 网络请求工具模块
 */

/**
 * 发起网络请求
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址
 * @param {string} options.method - 请求方法，默认为GET
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 * @returns {Promise} 请求结果
 */
function request(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      url = '',
      method = 'GET',
      data = {},
      header = {}
    } = options;

    // 模拟微信小程序wx.request API
    const mockRequest = {
      success: (response) => {
        resolve(response);
      },
      fail: (error) => {
        reject(error);
      }
    };

    // 模拟网络请求
    setTimeout(() => {
      if (url.includes('error')) {
        mockRequest.fail({ errMsg: 'request:fail' });
      } else {
        mockRequest.success({
          data: { success: true, ...data },
          statusCode: 200,
          header: { 'content-type': 'application/json' }
        });
      }
    }, 100);
  });
}

/**
 * GET请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 * @returns {Promise} 请求结果
 */
function get(url, data = {}, header = {}) {
  return request({
    url,
    method: 'GET',
    data,
    header
  });
}

/**
 * POST请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 * @returns {Promise} 请求结果
 */
function post(url, data = {}, header = {}) {
  return request({
    url,
    method: 'POST',
    data,
    header
  });
}

/**
 * PUT请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 * @returns {Promise} 请求结果
 */
function put(url, data = {}, header = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    header
  });
}

/**
 * DELETE请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 * @returns {Promise} 请求结果
 */
function del(url, data = {}, header = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    header
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del
};