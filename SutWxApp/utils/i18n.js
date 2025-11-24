/**
 * 文件名: i18n.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * i18n 国际化服务
 * 用于管理微信小程序中的多语言文本
 * 作者: Sut
 * 更新日期: 2025-11-24
 * 描述: 从i18n目录下的JSON文件加载翻译内容
 */
class I18n {
  constructor() {
    this.locale = 'zh_CN'; // 默认语言
    this.translations = {}; // 用于加载翻译内容
  }

  /**
   * 从字符串模板文件加载翻译内容
   * @param {Object} poData - 解析后的.po文件内容(构建时指定)
   */
  loadTranslations(poData) {
    this.translations = poData;
  }

  /**
   * 设置当前语言
   * @param {string} locale - 语言代码，例如 'zh_CN', 'en_US'
   */
  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
    }
    // 如果找不到指定的语言，将保持默认语言
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @param {Object} params - 替换参数，例如 { price: '99.00' }
   * @returns {string} 翻译后的文本
   */
  translate(key, params = {}) {
    if (!this.translations[this.locale]) {
      return key;
    }
    let text = this.translations[this.locale][key] || key;
    for (const paramKey in params) {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    } 
    return text;
  }
}

const i18n = new I18n();

// 从i18n目录加载翻译文件
i18n.loadTranslations({
  'zh_CN': require('./i18n/sut-wechat-mini-zh_CN.json'),
  'en_US': require('./i18n/sut-wechat-mini-en_US.json')
});

// 导出实例，方便在其他地方使用
module.exports = i18n;
