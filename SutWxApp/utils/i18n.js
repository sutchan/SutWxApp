/**
 * 鏂囦欢鍚? i18n.js
 * 鐗堟湰鍙? 1.0.2
 * 更新日期: 2025-11-29
 * 娴ｆ粏鈧? Sut
 * 描述: 閸ヤ粙妾崠鏍ㄦ箛閸斺槄绱濋悽銊ょ艾缁狅紕鎮婂顔讳繆鐏忓繒鈻兼惔蹇庤厬閻ㄥ嫬顦跨拠顓♀枅閺傚洦婀伴敍灞肩矤i18n閻╊喖缍嶆稉瀣畱JSON閺傚洣娆㈤崝鐘烘祰缂堟槒鐦ч崘鍛啇
 */
class I18n {
  constructor() {
    this.locale = 'zh_CN'; // 姒涙顓荤拠顓♀枅
    this.translations = {}; // 閻劋绨崝鐘烘祰缂堟槒鐦ч崘鍛啇
  }

  /**
   * 娴犲骸鐡х粭锔胯濡剝婢橀弬鍥︽閸旂姾娴囩紙鏄忕槯閸愬懎顔?   * @param {Object} poData - 鐟欙絾鐎介崥搴ｆ畱.po閺傚洣娆㈤崘鍛啇(閺嬪嫬缂撻弮鑸靛瘹鐎?
   */
  loadTranslations(poData) {
    this.translations = poData;
  }

  /**
   * 鐠佸墽鐤嗚ぐ鎾冲鐠囶叀鈻?   * @param {string} locale - 鐠囶叀鈻堟禒锝囩垳閿涘奔绶ユ俊?'zh_CN', 'en_US'
   */
  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
    }
    // 婵″倹鐏夐幍鍙ョ瑝閸掔増瀵氱€规氨娈戠拠顓♀枅閿涘苯鐨㈡穱婵囧瘮姒涙顓荤拠顓♀枅
  }

  /**
   * 閼惧嘲褰囩紙鏄忕槯閺傚洦婀?   * @param {string} key - 缂堟槒鐦ч柨?   * @param {Object} params - 閺囨寧宕查崣鍌涙殶閿涘奔绶ユ俊?{ price: '99.00' }
   * @returns {string} 缂堟槒鐦ч崥搴ｆ畱閺傚洦婀?   */
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

// 娴犲穼18n閻╊喖缍嶉崝鐘烘祰缂堟槒鐦ч弬鍥︽
i18n.loadTranslations({
  'zh_CN': require('./i18n/sut-wechat-mini-zh_CN.json'),
  'en_US': require('./i18n/sut-wechat-mini-en_US.json')
});

// 鐎电厧鍤€圭偘绶ラ敍灞炬煙娓氬灝婀崗鏈电铂閸︾増鏌熸担璺ㄦ暏
module.exports = i18n;
