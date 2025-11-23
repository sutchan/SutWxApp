/**
 * 设置服务
 * 提供系统设置相关的API封装
 */

const request = require('../utils/request');

/**
 * 设置服务
 */
const settingsService = {
  /**
   * 获取系统设置
   * @param {Object} options - 查询参数
   * @param {string} options.type - 设置类型：all/app/user/push/privacy/security
   * @returns {Promise<Object>} 系统设置信息
   */
  async getSettings(options = {}) {
    const { type = 'all' } = options;

    return request.get('/settings', {
      type
    });
  },

  /**
   * 更新系统设置
   * @param {Object} options - 设置参数
   * @param {string} options.type - 设置类型：app/user/push/privacy/security
   * @param {Object} options.settings - 设置内容
   * @returns {Promise<Object>} 操作结果
   */
  async updateSettings(options = {}) {
    const { type = 'user', settings = {} } = options;

    return request.put('/settings', {
      type,
      ...settings
    });
  },

  /**
   * 获取应用设置
   * @returns {Promise<Object>} 应用设置信息
   */
  async getAppSettings() {
    return request.get('/settings/app');
  },

  /**
   * 更新应用设置
   * @param {Object} options - 应用设置参数
   * @param {string} options.language - 语言设置
   * @param {string} options.theme - 主题设置
   * @param {string} options.fontSize - 字体大小
   * @param {boolean} options.autoPlay - 自动播放
   * @param {boolean} options.cacheImages - 缓存图片
   * @returns {Promise<Object>} 操作结果
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
   * 获取用户设置
   * @returns {Promise<Object>} 用户设置信息
   */
  async getUserSettings() {
    return request.get('/settings/user');
  },

  /**
   * 更新用户设置
   * @param {Object} options - 用户设置参数
   * @param {string} options.nickname - 昵称
   * @param {string} options.avatar - 头像
   * @param {string} options.gender - 性别
   * @param {string} options.birthday - 生日
   * @param {string} options.signature - 个性签名
   * @returns {Promise<Object>} 操作结果
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
   * 获取推送设置
   * @returns {Promise<Object>} 推送设置信息
   */
  async getPushSettings() {
    return request.get('/settings/push');
  },

  /**
   * 更新推送设置
   * @param {Object} options - 推送设置参数
   * @param {boolean} options.orderNotification - 订单通知
   * @param {boolean} options.promotionNotification - 促销通知
   * @param {boolean} options.systemNotification - 系统通知
   * @param {boolean} options.commentNotification - 评论通知
   * @param {boolean} options.followNotification - 关注通知
   * @param {string} options.pushTime - 推送时间段
   * @returns {Promise<Object>} 操作结果
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
   * 获取隐私设置
   * @returns {Promise<Object>} 隐私设置信息
   */
  async getPrivacySettings() {
    return request.get('/settings/privacy');
  },

  /**
   * 更新隐私设置
   * @param {Object} options - 隐私设置参数
   * @param {boolean} options.showProfile - 显示个人资料
   * @param {boolean} options.showOrders - 显示订单信息
   * @param {boolean} options.showFavorites - 显示收藏内容
   * @param {boolean} options.allowFollow - 允许关注
   * @param {boolean} options.allowMessage - 允许私信
   * @param {boolean} options.allowComment - 允许评论
   * @returns {Promise<Object>} 操作结果
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
   * 获取安全设置
   * @returns {Promise<Object>} 安全设置信息
   */
  async getSecuritySettings() {
    return request.get('/settings/security');
  },

  /**
   * 更新安全设置
   * @param {Object} options - 安全设置参数
   * @param {boolean} options.loginNotification - 登录通知
   * @param {boolean} options.twoFactorAuth - 双因素认证
   * @param {boolean} options.bindPhone - 绑定手机
   * @param {boolean} options.bindEmail - 绑定邮箱
   * @returns {Promise<Object>} 操作结果
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
   * 获取关于信息
   * @returns {Promise<Object>} 关于信息
   */
  async getAboutInfo() {
    return request.get('/settings/about');
  },

  /**
   * 获取用户协议
   * @param {Object} options - 查询参数
   * @param {string} options.type - 协议类型：user/privacy
   * @returns {Promise<Object>} 用户协议内容
   */
  async getAgreement(options = {}) {
    const { type = 'user' } = options;

    return request.get('/settings/agreement', {
      type
    });
  },

  /**
   * 获取帮助信息
   * @param {Object} options - 查询参数
   * @param {string} options.category - 帮助分类
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 帮助信息列表
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
   * 获取反馈列表
   * @param {Object} options - 查询参数
   * @param {string} options.type - 反馈类型：all/bug/suggestion/other
   * @param {string} options.status - 反馈状态：all/pending/processing/resolved
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 反馈列表和分页信息
   */
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
   * 提交反馈
   * @param {Object} options - 反馈参数
   * @param {string} options.type - 反馈类型：bug/suggestion/other
   * @param {string} options.title - 反馈标题
   * @param {string} options.content - 反馈内容
   * @param {Array} options.images - 反馈图片
   * @param {string} options.contact - 联系方式
   * @returns {Promise<Object>} 操作结果
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
   * 获取反馈详情
   * @param {string} feedbackId - 反馈ID
   * @returns {Promise<Object>} 反馈详情
   */
  async getFeedbackDetail(feedbackId) {
    return request.get(`/settings/feedback/${feedbackId}`);
  },

  /**
   * 获取清理缓存信息
   * @returns {Promise<Object>} 缓存信息
   */
  async getCacheInfo() {
    return request.get('/settings/cache');
  },

  /**
   * 清理缓存
   * @param {Object} options - 清理参数
   * @param {Array} options.types - 清理类型：images/files/logs/data
   * @returns {Promise<Object>} 操作结果
   */
  async clearCache(options = {}) {
    const { types = [] } = options;

    return request.delete('/settings/cache', {
      types
    });
  },

  /**
   * 重置设置
   * @param {Object} options - 重置参数
   * @param {string} options.type - 重置类型：all/app/user/push/privacy/security
   * @returns {Promise<Object>} 操作结果
   */
  async resetSettings(options = {}) {
    const { type = 'all' } = options;

    return request.post('/settings/reset', {
      type
    });
  },

  /**
   * 导出用户数据
   * @param {Object} options - 导出参数
   * @param {Array} options.types - 导出类型：profile/orders/favorites/points
   * @param {string} options.format - 导出格式：json/csv/excel
   * @returns {Promise<Object>} 导出结果
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
   * 删除账户
   * @param {Object} options - 删除参数
   * @param {string} options.password - 密码
   * @param {string} options.reason - 删除原因
   * @returns {Promise<Object>} 操作结果
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