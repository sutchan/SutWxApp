/**
 * i18n 鍥介檯鍖栨湇鍔? * 鐢ㄤ簬绠＄悊寰俊灏忕▼搴忎腑鐨勫璇█鏂囨湰
 * 浣滆€? Sut
 * 鏃ユ湡: 2025-11-15
 */
class I18n {
  constructor() {
    this.locale = 'zh_CN'; // 榛樿璇█
    this.translations = {
      'zh_CN': {
        // 閫氱敤鏂囨湰
        'common.back': '杩斿洖',
        'common.loading': '鍔犺浇涓?..',
        'common.submit': '鎻愪氦',
        'common.cancel': '鍙栨秷',

        // 璁㈠崟璇勪环椤甸潰
        'review.title': '璇勪环璁㈠崟',
        'review.goodsName': '鍟嗗搧鍚嶇О',
        'review.goodsPrice': '楼 {price}',
        'review.ratingLabel': '鍟嗗搧璇勫垎',
        'review.placeholder': '璇磋鎮ㄧ殑浣跨敤浣撻獙鍚?..',
        'review.wordCount': '{current}/{total}',
        'review.anonymousLabel': '鍖垮悕璇勪环',
        'review.uploadLabel': '涓婁紶鍥剧墖 (鏈€澶歿count}寮?',
        'review.submitButton': '鎻愪氦璇勪环',
        'review.emptyContent': '璇勪环鍐呭涓嶈兘涓虹┖',
        'review.submitSuccess': '璇勪环鎻愪氦鎴愬姛',
        'review.shareTitle': '鍒嗕韩璁㈠崟璇勪环',
      },
      'en_US': {
        // 閫氱敤鏂囨湰
        'common.back': 'Back',
        'common.loading': 'Loading...', 
        'common.submit': 'Submit',
        'common.cancel': 'Cancel',

        // 璁㈠崟璇勪环椤甸潰
        'review.title': 'Order Review',
        'review.goodsName': 'Product Name',
        'review.goodsPrice': '$ {price}',
        'review.ratingLabel': 'Product Rating',
        'review.placeholder': 'Share your experience...', 
        'review.wordCount': '{current}/{total}',
        'review.anonymousLabel': 'Anonymous Review',
        'review.uploadLabel': 'Upload Images (Max {count})',
        'review.submitButton': 'Submit Review',
        'review.emptyContent': 'Review content cannot be empty',
        'review.submitSuccess': 'Review submitted successfully',
        'review.shareTitle': 'Share Order Review',
      }
    };
  }

  /**
   * 璁剧疆褰撳墠璇█
   * @param {string} locale - 璇█浠ｇ爜锛屼緥濡?'zh_CN', 'en_US'
   */
  setLocale(locale) {
    if (this.translations[locale]) {
      this.locale = locale;
    } else {
      // console.warn(`Locale ${locale} not found, falling back to ${this.locale}`);
    }
  }

  /**
   * 鑾峰彇缈昏瘧鏂囨湰
   * @param {string} key - 缈昏瘧閿?   * @param {Object} params - 鏇挎崲鍙傛暟锛屼緥濡?{ price: '99.00' }
   * @returns {string} 缈昏瘧鍚庣殑鏂囨湰
   */
  translate(key, params = {}) {
    let text = this.translations[this.locale][key] || key;
    for (const paramKey in params) {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    } 
    return text;
  }
}

const i18n = new I18n();

// 瀵煎嚭瀹炰緥锛屾柟渚垮湪鍏朵粬鍦版柟浣跨敤
module.exports = i18n;
