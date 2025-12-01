﻿/**
 * 文件名 settingsService.js
 * 版本号 1.0.1
 * 更新日期: 2025-11-28
 * 描述: 璁剧疆鏈嶅姟
 */

const request = require('../utils/request');

/**
 * 璁剧疆鏈嶅姟
 */
const settingsService = {
  /**
   * 鑾峰彇绯荤粺璁剧疆
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 璁剧疆绫诲瀷锛歛ll/app/user/push/privacy/security
   * @returns {Promise<Object>} 绯荤粺璁剧疆淇℃伅
   */
  async getSettings(options = {}) {
    const { type = 'all' } = options;

    return request.get('/settings', {
      type
    });
  },

  /**
   * 鏇存柊绯荤粺璁剧疆
   * @param {Object} options - 璁剧疆鍙傛暟
   * @param {string} options.type - 璁剧疆绫诲瀷锛歛pp/user/push/privacy/security
   * @param {Object} options.settings - 璁剧疆鍐呭
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async updateSettings(options = {}) {
    const { type = 'user', settings = {} } = options;

    return request.put('/settings', {
      type,
      ...settings
    });
  },

  /**
   * 鑾峰彇搴旂敤璁剧疆
   * @returns {Promise<Object>} 搴旂敤璁剧疆淇℃伅
   */
  async getAppSettings() {
    return request.get('/settings/app');
  },

  /**
   * 鏇存柊搴旂敤璁剧疆
   * @param {Object} options - 搴旂敤璁剧疆鍙傛暟
   * @param {string} options.language - 璇█璁剧疆
   * @param {string} options.theme - 涓婚璁剧疆
   * @param {string} options.fontSize - 瀛椾綋澶у皬
   * @param {boolean} options.autoPlay - 鑷姩鎾斁
   * @param {boolean} options.cacheImages - 缂撳瓨鍥剧墖
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async updateAppSettings(options = {}) {
    const {
      language = '',
      theme = '',
      fontSize = '',
      autoPlay,
      cacheImages
    } = options;

    return request.put('/settings/app', {
      language,
      theme,
      fontSize,
      autoPlay,
      cacheImages
    });
  },

  /**
   * 鑾峰彇鐢ㄦ埛璁剧疆
   * @returns {Promise<Object>} 鐢ㄦ埛璁剧疆淇℃伅
   */
  async getUserSettings() {
    return request.get('/settings/user');
  },

  /**
   * 鏇存柊鐢ㄦ埛璁剧疆
   * @param {Object} options - 鐢ㄦ埛璁剧疆鍙傛暟
   * @param {string} options.nickname - 鏄电О
   * @param {string} options.avatar - 澶村儚
   * @param {string} options.gender - 鎬у埆
   * @param {string} options.birthday - 鐢熸棩
   * @param {string} options.signature - 涓€х鍚?   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async updateUserSettings(options = {}) {
    const {
      nickname = '',
      avatar = '',
      gender = '',
      birthday = '',
      signature = ''
    } = options;

    return request.put('/settings/user', {
      nickname,
      avatar,
      gender,
      birthday,
      signature
    });
  },

  /**
   * 鑾峰彇鎺ㄩ€佽缃?   * @returns {Promise<Object>} 鎺ㄩ€佽缃俊鎭?   */
  async getPushSettings() {
    return request.get('/settings/push');
  },

  /**
   * 鏇存柊鎺ㄩ€佽缃?   * @param {Object} options - 鎺ㄩ€佽缃弬鏁?   * @param {boolean} options.orderNotification - 璁㈠崟閫氱煡
   * @param {boolean} options.promotionNotification - 淇冮攢閫氱煡
   * @param {boolean} options.systemNotification - 绯荤粺閫氱煡
   * @param {boolean} options.commentNotification - 璇勮閫氱煡
   * @param {boolean} options.followNotification - 鍏虫敞閫氱煡
   * @param {string} options.pushTime - 鎺ㄩ€佹椂闂存
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async updatePushSettings(options = {}) {
    const {
      orderNotification,
      promotionNotification,
      systemNotification,
      commentNotification,
      followNotification,
      pushTime = ''
    } = options;

    return request.put('/settings/push', {
      orderNotification,
      promotionNotification,
      systemNotification,
      commentNotification,
      followNotification,
      pushTime
    });
  },

  /**
   * 鑾峰彇闅愮璁剧疆
   * @returns {Promise<Object>} 闅愮璁剧疆淇℃伅
   */
  async getPrivacySettings() {
    return request.get('/settings/privacy');
  },

  /**
   * 鏇存柊闅愮璁剧疆
   * @param {Object} options - 闅愮璁剧疆鍙傛暟
   * @param {boolean} options.showProfile - 鏄剧ず涓汉璧勬枡
   * @param {boolean} options.showOrders - 鏄剧ず璁㈠崟淇℃伅
   * @param {boolean} options.showFavorites - 鏄剧ず鏀惰棌鍐呭
   * @param {boolean} options.allowFollow - 鍏佽鍏虫敞
   * @param {boolean} options.allowMessage - 鍏佽绉佷俊
   * @param {boolean} options.allowComment - 鍏佽璇勮
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async updatePrivacySettings(options = {}) {
    const {
      showProfile,
      showOrders,
      showFavorites,
      allowFollow,
      allowMessage,
      allowComment
    } = options;

    return request.put('/settings/privacy', {
      showProfile,
      showOrders,
      showFavorites,
      allowFollow,
      allowMessage,
      allowComment
    });
  },

  /**
   * 鑾峰彇瀹夊叏璁剧疆
   * @returns {Promise<Object>} 瀹夊叏璁剧疆淇℃伅
   */
  async getSecuritySettings() {
    return request.get('/settings/security');
  },

  /**
   * 鏇存柊瀹夊叏璁剧疆
   * @param {Object} options - 瀹夊叏璁剧疆鍙傛暟
   * @param {boolean} options.loginNotification - 鐧诲綍閫氱煡
   * @param {boolean} options.twoFactorAuth - 鍙屽洜绱犺璇?   * @param {boolean} options.bindPhone - 缁戝畾鎵嬫満
   * @param {boolean} options.bindEmail - 缁戝畾閭
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async updateSecuritySettings(options = {}) {
    const {
      loginNotification,
      twoFactorAuth,
      bindPhone,
      bindEmail
    } = options;

    return request.put('/settings/security', {
      loginNotification,
      twoFactorAuth,
      bindPhone,
      bindEmail
    });
  },

  /**
   * 鑾峰彇鍏充簬淇℃伅
   * @returns {Promise<Object>} 鍏充簬淇℃伅
   */
  async getAboutInfo() {
    return request.get('/settings/about');
  },

  /**
   * 鑾峰彇鐢ㄦ埛鍗忚
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 鍗忚绫诲瀷锛歶ser/privacy
   * @returns {Promise<Object>} 鐢ㄦ埛鍗忚鍐呭
   */
  async getAgreement(options = {}) {
    const { type = 'user' } = options;

    return request.get('/settings/agreement', {
      type
    });
  },

  /**
   * 鑾峰彇甯姪淇℃伅
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.category - 甯姪鍒嗙被
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 甯姪淇℃伅鍒楄〃
   */
  async getHelpInfo(options = {}) {
    const {
      category = '',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/settings/help', {
      category,
      page,
      pageSize
    });
  },

  /**
   * 鑾峰彇鍙嶉鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 鍙嶉绫诲瀷锛歛ll/bug/suggestion/other
   * @param {string} options.status - 鍙嶉鐘舵€侊細all/pending/processing/resolved
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鍙嶉鍒楄〃鍜屽垎椤典俊鎭?   */
  async getFeedbackList(options = {}) {
    const {
      type = 'all',
      status = 'all',
      page = 1,
      pageSize = 20
    } = options;

    return request.get('/settings/feedback', {
      type,
      status,
      page,
      pageSize
    });
  },

  /**
   * 鎻愪氦鍙嶉
   * @param {Object} options - 鍙嶉鍙傛暟
   * @param {string} options.type - 鍙嶉绫诲瀷锛歜ug/suggestion/other
   * @param {string} options.title - 鍙嶉鏍囬
   * @param {string} options.content - 鍙嶉鍐呭
   * @param {Array} options.images - 鍙嶉鍥剧墖
   * @param {string} options.contact - 鑱旂郴鏂瑰紡
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async submitFeedback(options = {}) {
    const {
      type = 'other',
      title = '',
      content = '',
      images = [],
      contact = ''
    } = options;

    return request.post('/settings/feedback', {
      type,
      title,
      content,
      images,
      contact
    });
  },

  /**
   * 鑾峰彇鍙嶉璇︽儏
   * @param {string} feedbackId - 鍙嶉ID
   * @returns {Promise<Object>} 鍙嶉璇︽儏
   */
  async getFeedbackDetail(feedbackId) {
    return request.get(`/settings/feedback/${feedbackId}`);
  },

  /**
   * 鑾峰彇娓呯悊缂撳瓨淇℃伅
   * @returns {Promise<Object>} 缂撳瓨淇℃伅
   */
  async getCacheInfo() {
    return request.get('/settings/cache');
  },

  /**
   * 娓呯悊缂撳瓨
   * @param {Object} options - 娓呯悊鍙傛暟
   * @param {Array} options.types - 娓呯悊绫诲瀷锛歩mages/files/logs/data
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async clearCache(options = {}) {
    const { types = [] } = options;

    return request.delete('/settings/cache', {
      types
    });
  },

  /**
   * 閲嶇疆璁剧疆
   * @param {Object} options - 閲嶇疆鍙傛暟
   * @param {string} options.type - 閲嶇疆绫诲瀷锛歛ll/app/user/push/privacy/security
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async resetSettings(options = {}) {
    const { type = 'all' } = options;

    return request.post('/settings/reset', {
      type
    });
  },

  /**
   * 瀵煎嚭鐢ㄦ埛鏁版嵁
   * @param {Object} options - 瀵煎嚭鍙傛暟
   * @param {Array} options.types - 瀵煎嚭绫诲瀷锛歱rofile/orders/favorites/points
   * @param {string} options.format - 瀵煎嚭鏍煎紡锛歫son/csv/excel
   * @returns {Promise<Object>} 瀵煎嚭缁撴灉
   */
  async exportUserData(options = {}) {
    const {
      types = [],
      format = 'json'
    } = options;

    return request.post('/settings/export', {
      types,
      format
    });
  },

  /**
   * 鍒犻櫎璐﹀彿
   * @param {Object} options - 鍒犻櫎鍙傛暟
   * @param {string} options.password - 瀵嗙爜
   * @param {string} options.reason - 鍒犻櫎鍘熷洜
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async deleteAccount(options = {}) {
    const {
      password = '',
      reason = ''
    } = options;

    return request.post('/settings/delete-account', {
      password,
      reason
    });
  }
};

module.exports = settingsService;