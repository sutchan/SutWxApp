/**
 * 文件名: i18n.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 浣滆€? Sut
 * 描述: 鍥介檯鍖栨湇鍔★紝鐢ㄤ簬绠＄悊寰俊灏忕▼搴忎腑鐨勫璇█鏂囨湰锛屼粠i18n鐩綍涓嬬殑JSON鏂囦欢鍔犺浇缈昏瘧鍐呭
 */
class I18n {
  constructor() {
    this.locale = 'zh_CN'; // 榛樿璇█
    this.translations = {}; // 鐢ㄤ簬鍔犺浇缈昏瘧鍐呭
  }

  /**
   * 浠庡瓧绗︿覆妯℃澘鏂囦欢鍔犺浇缈昏瘧鍐呭
   * @param {Object} poData - 瑙ｆ瀽鍚庣殑.po鏂囦欢鍐呭(鏋勫缓鏃舵寚瀹?
   */
  loadTranslations(poData) {
    this.translations = poData;
  }

  /**
   * 璁剧疆褰撳墠璇█
   * @param {string} locale - 璇█浠ｇ爜锛屼緥濡?'zh_CN', 'en_US'
   */
  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
    }
    // 濡傛灉鎵句笉鍒版寚瀹氱殑璇█锛屽皢淇濇寔榛樿璇█
  }

  /**
   * 鑾峰彇缈昏瘧鏂囨湰
   * @param {string} key - 缈昏瘧閿?   * @param {Object} params - 鏇挎崲鍙傛暟锛屼緥濡?{ price: '99.00' }
   * @returns {string} 缈昏瘧鍚庣殑鏂囨湰
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

// 浠巌18n鐩綍鍔犺浇缈昏瘧鏂囦欢
i18n.loadTranslations({
  'zh_CN': require('./i18n/sut-wechat-mini-zh_CN.json'),
  'en_US': require('./i18n/sut-wechat-mini-en_US.json')
});

// 瀵煎嚭瀹炰緥锛屾柟渚垮湪鍏朵粬鍦版柟浣跨敤
module.exports = i18n;
