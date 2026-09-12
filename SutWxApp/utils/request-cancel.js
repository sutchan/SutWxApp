/**
 * 文件名: request-cancel.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: request.js 的请求取消令牌与判断工具
 */

/**
 * 取消令牌类，用于取消请求
 */
class CancelToken {
  constructor() {
    this.isCancelled = false;
    this.cancelCallbacks = [];
  }

  cancel() {
    if (!this.isCancelled) {
      this.isCancelled = true;
      this.cancelCallbacks.forEach((callback) => callback());
      this.cancelCallbacks = [];
    }
  }

  isCancel() {
    return this.isCancelled;
  }

  register(callback) {
    if (this.isCancelled) {
      callback();
      return;
    }
    this.cancelCallbacks.push(callback);
  }
}

/**
 * 判断一个错误是否由请求取消触发
 * @param {Error} error 待判断的错误
 * @returns {boolean}
 */
function isCancel(error) {
  return !!error && error.message === "Request cancelled";
}

module.exports = { CancelToken, isCancel };
