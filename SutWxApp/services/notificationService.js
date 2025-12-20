/**
 * 鏂囦欢鍚? notificationService.js
 * 鐗堟湰鍙? 1.0.3
 * 鏇存柊鏃ユ湡: 2025-12-03
 * 鎻忚堪: 閫氱煡鏈嶅姟锛屽寘鍚敤鎴烽€氱煡閲嶈瘯鏈哄埗 */

const request = require('../utils/request');

// 璁㈤槄娑堟伅閲嶈瘯閰嶇疆
const RETRY_CONFIG = {
  MAX_RETRIES: 3, // 鏈€澶ч噸璇曟鏁?  INITIAL_DELAY: 1000, // 鍒濆閲嶈瘯寤惰繜锛堟绉掞級
  BACKOFF_FACTOR: 2, // 鎸囨暟閫€閬垮洜瀛?  MAX_DELAY: 30000 // 鏈€澶ч噸璇曞欢杩燂紙姣锛?};

// 閲嶈瘯闃熷垪
let retryQueue = [];
// 閲嶈瘯闃熷垪鏄惁姝ｅ湪澶勭悊
let isProcessingRetryQueue = false;

const notificationService = {
  /**
   * 鑾峰彇閫氱煡鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 閫氱煡绫诲瀷锛歛ll/system/order/promotion/activity/article/product/social
   * @param {string} options.status - 閫氱煡鐘舵€侊細all/read/unread
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 閫氱煡鍒楄〃鍜屽垎椤典俊鎭?   */
  getNotificationList(options = {}) {
    const params = {
      type: options.type || 'all',
      status: options.status || 'all',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get('/notifications', params);
  },

  /**
   * 鑾峰彇閫氱煡璇︽儏
   * @param {string} id - 閫氱煡ID
   * @returns {Promise<Object>} 閫氱煡璇︽儏
   */
  getNotificationDetail(id) {
    if (!id) {
      return Promise.reject(new Error('閫氱煡ID涓嶈兘涓虹┖'));
    }
    
    return request.get(`/notifications/${id}`);
  },

  /**
   * 鏍囪閫氱煡涓哄凡璇?   * @param {string} id - 閫氱煡ID锛屽鏋滀笉鎻愪緵鍒欐爣璁版墍鏈夋湭璇婚€氱煡涓哄凡璇?   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  markAsRead(id) {
    if (id) {
      return request.put(`/notifications/${id}/read`);
    } else {
      return request.put('/notifications/read-all');
    }
  },

  /**
   * 鍒犻櫎閫氱煡
   * @param {string} id - 閫氱煡ID锛屽鏋滀笉鎻愪緵鍒欏垹闄ゆ墍鏈夊凡璇婚€氱煡
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  deleteNotification(id) {
    if (id) {
      return request.delete(`/notifications/${id}`);
    } else {
      return request.delete('/notifications/clear-read');
    }
  },

  /**
   * 鑾峰彇鏈閫氱煡鏁伴噺
   * @returns {Promise<Object>} 鏈閫氱煡鏁伴噺
   */
  getUnreadCount() {
    return request.get('/notifications/unread-count');
  },

  /**
   * 鑾峰彇閫氱煡璁剧疆
   * @returns {Promise<Object>} 閫氱煡璁剧疆
   */
  getNotificationSettings() {
    return request.get('/notifications/settings');
  },

  /**
   * 鏇存柊閫氱煡璁剧疆
   * @param {Object} settings - 閫氱煡璁剧疆
   * @param {boolean} settings.systemNotification - 鏄惁鎺ユ敹绯荤粺閫氱煡
   * @param {boolean} settings.orderNotification - 鏄惁鎺ユ敹璁㈠崟閫氱煡
   * @param {boolean} settings.promotionNotification - 鏄惁鎺ユ敹淇冮攢閫氱煡
   * @param {boolean} settings.activityNotification - 鏄惁鎺ユ敹娲诲姩閫氱煡
   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  updateNotificationSettings(settings) {
    return request.put('/notifications/settings', settings);
  },

  /**
   * 璁㈤槄鎺ㄩ€侀€氱煡
   * @param {Object} subscription - 璁㈤槄淇℃伅
   * @param {string} subscription.platform - 骞冲彴锛歩os/android/web
   * @param {string} subscription.token - 璁惧浠ょ墝
   * @param {string} subscription.userId - 鐢ㄦ埛ID
   * @returns {Promise<Object>} 璁㈤槄缁撴灉
   */
  subscribePushNotification(subscription) {
    if (!subscription.platform || !subscription.token) {
      return Promise.reject(new Error('骞冲彴鍜岃澶囦护鐗屼笉鑳戒负绌?));
    }
    
    return request.post('/notifications/subscribe', subscription);
  },

  /**
   * 鍙栨秷璁㈤槄鎺ㄩ€侀€氱煡
   * @param {string} token - 璁惧浠ょ墝
   * @returns {Promise<Object>} 鍙栨秷璁㈤槄缁撴灉
   */
  unsubscribePushNotification(token) {
    if (!token) {
      return Promise.reject(new Error('璁惧浠ょ墝涓嶈兘涓虹┖'));
    }
    
    return request.post('/notifications/unsubscribe', { token });
  },

  /**
   * 鍙戦€佽嚜瀹氫箟閫氱煡锛堢鐞嗗憳鍔熻兘锛?   * @param {Object} notification - 閫氱煡鍐呭
   * @param {string} notification.title - 閫氱煡鏍囬
   * @param {string} notification.content - 閫氱煡鍐呭
   * @param {string} notification.type - 閫氱煡绫诲瀷
   * @param {Array} notification.targetUsers - 鐩爣鐢ㄦ埛ID鍒楄〃锛屼负绌哄垯鍙戦€佺粰鎵€鏈夌敤鎴?   * @returns {Promise<Object>} 鍙戦€佺粨鏋?   */
  sendNotification(notification) {
    if (!notification.title || !notification.content || !notification.type) {
      return Promise.reject(new Error('閫氱煡鏍囬銆佸唴瀹瑰拰绫诲瀷涓嶈兘涓虹┖'));
    }
    
    return request.post('/notifications/send', notification);
  },

  /**
   * 鍙戦€佽闃呮秷鎭?   * @param {Object} message - 娑堟伅鍐呭
   * @param {string} message.templateId - 妯℃澘ID
   * @param {Object} message.data - 娑堟伅鏁版嵁
   * @param {string} message.openId - 鐢ㄦ埛openId
   * @param {number} retries - 褰撳墠閲嶈瘯娆℃暟
   * @returns {Promise<Object>} 鍙戦€佺粨鏋?   */
  sendSubscribeMessage(message, retries = 0) {
    if (!message.templateId || !message.data || !message.openId) {
      return Promise.reject(new Error('妯℃澘ID銆佹秷鎭暟鎹拰鐢ㄦ埛openId涓嶈兘涓虹┖'));
    }
    
    return request.post('/notifications/subscribe-message', message)
      .catch(error => {
        // 濡傛灉閲嶈瘯娆℃暟鏈揪鍒版渶澶у€硷紝灏嗘秷鎭姞鍏ラ噸璇曢槦鍒?        if (retries < RETRY_CONFIG.MAX_RETRIES) {
          this.addToRetryQueue(message, retries + 1);
          return Promise.resolve({ success: false, retry: true, retryCount: retries + 1 });
        }
        // 閲嶈瘯娆℃暟杈惧埌鏈€澶у€硷紝杩斿洖閿欒
        return Promise.reject(new Error(`鍙戦€佽闃呮秷鎭け璐ワ紝宸查噸璇?{retries}娆? ${error.message}`));
      });
  },

  /**
   * 灏嗘秷鎭姞鍏ラ噸璇曢槦鍒?   * @param {Object} message - 娑堟伅鍐呭
   * @param {number} retries - 褰撳墠閲嶈瘯娆℃暟
   */
  addToRetryQueue(message, retries) {
    const delay = Math.min(
      RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retries - 1),
      RETRY_CONFIG.MAX_DELAY
    );
    
    retryQueue.push({
      message,
      retries,
      delay,
      timestamp: Date.now() + delay
    });
    
    // 濡傛灉閲嶈瘯闃熷垪鏈湪澶勭悊涓紝鍚姩澶勭悊
    if (!isProcessingRetryQueue) {
      this.processRetryQueue();
    }
  },

  /**
   * 澶勭悊閲嶈瘯闃熷垪
   */
  processRetryQueue() {
    if (isProcessingRetryQueue || retryQueue.length === 0) {
      return;
    }
    
    isProcessingRetryQueue = true;
    
    // 鎸夋椂闂存埑鎺掑簭锛屽厛澶勭悊鏈€鏃╅渶瑕侀噸璇曠殑娑堟伅
    retryQueue.sort((a, b) => a.timestamp - b.timestamp);
    
    const processNext = () => {
      if (retryQueue.length === 0) {
        isProcessingRetryQueue = false;
        return;
      }
      
      // 妫€鏌ラ槦鍒楁槸鍚﹀凡琚竻绌?      if (retryQueue.length === 0) {
        isProcessingRetryQueue = false;
        return;
      }
      
      const now = Date.now();
      const nextItem = retryQueue[0];
      
      // 濡傛灉闃熷垪宸茶娓呯┖锛屽仠姝㈠鐞?      if (!nextItem) {
        isProcessingRetryQueue = false;
        return;
      }
      
      // 濡傛灉杩樻病鍒伴噸璇曟椂闂达紝璁剧疆瀹氭椂鍣?      if (nextItem.timestamp > now) {
        const timeoutId = setTimeout(() => {
          // 鍐嶆妫€鏌ラ槦鍒楁槸鍚﹀凡琚竻绌?          if (retryQueue.length === 0) {
            isProcessingRetryQueue = false;
            return;
          }
          
          this.sendSubscribeMessage(nextItem.message, nextItem.retries)
            .finally(() => {
              // 妫€鏌ラ槦鍒楁槸鍚﹀凡琚竻绌?              if (retryQueue.length === 0) {
                isProcessingRetryQueue = false;
                return;
              }
              processNext();
            });
          retryQueue.shift();
        }, nextItem.timestamp - now);
        
        // 淇濆瓨timeoutId浠ヤ究鍚庣画娓呯悊
        this._currentTimeout = timeoutId;
      } else {
        // 鍒颁簡閲嶈瘯鏃堕棿锛岀珛鍗冲彂閫?        this.sendSubscribeMessage(nextItem.message, nextItem.retries)
          .finally(() => {
            // 妫€鏌ラ槦鍒楁槸鍚﹀凡琚竻绌?            if (retryQueue.length === 0) {
              isProcessingRetryQueue = false;
              return;
            }
            processNext();
          });
        retryQueue.shift();
      }
    };
    
    processNext();
  },

  /**
   * 鑾峰彇閲嶈瘯闃熷垪鐘舵€?   * @returns {Object} 閲嶈瘯闃熷垪鐘舵€?   */
  getRetryQueueStatus() {
    return {
      queueLength: retryQueue.length,
      isProcessing: isProcessingRetryQueue
    };
  },

  /**
   * 娓呯┖閲嶈瘯闃熷垪
   */
  clearRetryQueue() {
    retryQueue = [];
    isProcessingRetryQueue = false;
    
    // 娓呴櫎褰撳墠瀹氭椂鍣?    if (this._currentTimeout) {
      clearTimeout(this._currentTimeout);
      this._currentTimeout = null;
    }
  }
};

module.exports = notificationService;