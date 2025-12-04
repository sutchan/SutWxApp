/**
 * 文件名 i18n.js
 * 版本号 1.0.2
 * 更新日期: 2025-11-29
 * 作者: Sut
 * 描述: 国际化处理类，用于管理多语言翻译
 */
class I18n {
  constructor() {
    this.locale = 'zh_CN'; // 默认语言
    this.translations = {}; // 翻译数据
  }

  /**
   * 加载翻译数据
   * @param {Object} poData - 翻译数据对象
   */
  loadTranslations(poData) {
    this.translations = poData;
  }

  /**
   * 设置语言
   * @param {string} locale - 语言代码，如'zh_CN', 'en_US'
   */
  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
    }
  }

  /**
   * 获取翻译
   * @param {string} key - 翻译键
   * @param {Object} params - 参数对象，用于替换翻译中的占位符
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

  /**
   * 翻译方法的简写
   * @param {string} key - 翻译键
   * @param {Object} params - 参数对象
   * @returns {string} 翻译后的文本
   */
  t(key, params = {}) {
    return this.translate(key, params);
  }
}

const i18n = new I18n();

// 初始化i18n翻译数据
try {
  i18n.loadTranslations({
    'zh_CN': require('./i18n/sut-wechat-mini-zh_CN.json'),
    'en_US': require('./i18n/sut-wechat-mini-en_US.json')
  });
} catch (error) {
  console.error('加载翻译数据失败:', error);
}

module.exports = i18n;