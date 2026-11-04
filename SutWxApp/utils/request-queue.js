/**
 * 文件名: request-queue.js
 * 版本号: 3.5.10
 * 更新日期: 2026-09-19
 * 描述: 请求队列并发控制（从 request.js 抽离，保持主文件精简）
 */

/**
 * 创建并发队列控制器
 * @param {Object} config 共享配置（enableQueue / maxConcurrent）
 * @returns {{ acquire: Function, release: Function }}
 */
function createQueueController(config) {
  let activeRequests = 0;
  const requestQueue = [];

  function processQueue() {
    while (requestQueue.length > 0 && activeRequests < config.maxConcurrent) {
      const nextRequest = requestQueue.shift();
      if (nextRequest) {
        activeRequests++;
        nextRequest();
      }
    }
  }

  /**
   * 申请一个并发名额；超出上限则入队等待，否则立即执行
   * @param {Function} send 实际发起请求的函数
   */
  function acquire(send) {
    if (config.enableQueue && activeRequests >= config.maxConcurrent) {
      requestQueue.push(send);
    } else {
      activeRequests++;
      send();
    }
  }

  /**
   * 释放一个并发名额并调度队列中等待的请求。
   * 下限保护：重复释放（取消 + fail 双触发）不能让计数变负，否则并发上限会失效。
   */
  function release() {
    activeRequests = Math.max(0, activeRequests - 1);
    processQueue();
  }

  return { acquire, release };
}

module.exports = { createQueueController };
