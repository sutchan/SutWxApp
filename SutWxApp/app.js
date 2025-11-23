/**
 * 文件名: app.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

const i18n = require('./utils/i18n');

/**
 * 文件名: app.js
 * 应用入口
 * @returns {void}
 */
App({
  /**
   * 应用启动回调
   * @returns {void}
   */
  onLaunch() {
    try {
      const sys = wx.getSystemInfoSync();
      const lang = (sys.language || '').toLowerCase();
      if (lang.startsWith('en')) {
        i18n.setLocale('en_US');
      } else {
        i18n.setLocale('zh_CN');
      }
    } catch {
      // 兼容无系统信息的场景，保持默认语言
    }
    this.globalData = {
      startedAt: Date.now()
    };
  },

  /**
   * 应用显示回调
   * @returns {void}
   */
  onShow() {
    // 预留：可在此时上报数据或拉取全局配置
  },

  /**
   * 全局错误处理
   * @param {string} _err - 错误信息
   * @returns {void}
   */
  onError(_err) {
    try {
      // 生产环境可移除console，或发送到日志服务
      wx.showToast({ title: '发生错误', icon: 'none' });
    } catch {
      // 静默失败
    }
  }
});
