/**
 * 文件名: signature.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 浣滆€? Sut
 * 璇锋眰绛惧悕楠岃瘉宸ュ叿锛屾彁渚汚PI璇锋眰绛惧悕鐢熸垚銆侀獙璇佸拰璇锋眰澶存坊鍔犲姛鑳? */

const Crypto = require('./crypto.js');

/**
 * 绛惧悕鐢熸垚鍜岄獙璇佺被
 */
class Signature {
  /**
   * 鐢熸垚API璇锋眰绛惧悕
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {string} secretKey - 瀵嗛挜
   * @returns {string} 鐢熸垚鐨勭鍚?   */
  static generate(params, secretKey) {
    // 鍙傛暟鎺掑簭
    const sortedParams = this._sortParams(params);
    
    // 鎷兼帴鍙傛暟瀛楃涓?    const paramString = this._buildParamString(sortedParams);
    
    // 鍔犲叆鏃堕棿鎴抽槻姝㈤噸鏀炬敾鍑?    const timestamp = Date.now();
    const stringToSign = `${paramString}&timestamp=${timestamp}`;
    
    // 浣跨敤瀵嗛挜杩涜HMAC绛惧悕
    const signature = Crypto.hmacSHA256(stringToSign, secretKey);
    
    return {
      signature,
      timestamp
    };
  }
  
  /**
   * 楠岃瘉API璇锋眰绛惧悕
   * @param {Object} params - 璇锋眰鍙傛暟锛堝寘鍚玸ignature鍜宼imestamp锛?   * @param {string} secretKey - 瀵嗛挜
   * @param {number} expireTime - 绛惧悕杩囨湡鏃堕棿锛堟绉掞級锛岄粯璁?鍒嗛挓
   * @returns {boolean} 绛惧悕鏄惁鏈夋晥
   */
  static verify(params, secretKey, expireTime = 5 * 60 * 1000) {
    const { signature, timestamp, ...requestParams } = params;
    
    // 妫€鏌ユ椂闂存埑鏄惁杩囨湡
    if (Date.now() - timestamp > expireTime) {
      return false;
    }
    
    // 閲嶆柊鐢熸垚绛惧悕骞舵瘮瀵?    const generatedSign = this.generate(requestParams, secretKey);
    
    return generatedSign.signature === signature;
  }
  
  /**
   * 瀵瑰弬鏁拌繘琛屾帓搴?   * @private
   * @param {Object} params - 鍙傛暟瀵硅薄
   * @returns {Object} 鎺掑簭鍚庣殑鍙傛暟瀵硅薄
   */
  static _sortParams(params) {
    const sorted = {};
    const keys = Object.keys(params).sort();
    
    keys.forEach(key => {
      if (key !== 'signature' && key !== 'timestamp') {
        sorted[key] = params[key];
      }
    });
    
    return sorted;
  }
  
  /**
   * 鏋勫缓鍙傛暟瀛楃涓?   * @private
   * @param {Object} params - 鎺掑簭鍚庣殑鍙傛暟瀵硅薄
   * @returns {string} 鍙傛暟瀛楃涓?   */
  static _buildParamString(params) {
    return Object.entries(params)
      .map(([key, value]) => {
        // 澶勭悊宓屽瀵硅薄
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }
  
  /**
   * 娣诲姞绛惧悕鍒拌姹傚ご
   * @param {Object} options - 璇锋眰閫夐」
   * @param {string} secretKey - 瀵嗛挜
   * @returns {Object} 澧炲己鍚庣殑璇锋眰閫夐」
   */
  static addSignatureToHeaders(options, secretKey) {
    const { data, ...rest } = options;
    
    // 鐢熸垚绛惧悕
    const { signature, timestamp } = this.generate(data || {}, secretKey);
    
    // 娣诲姞鍒拌姹傚ご
    return {
      ...rest,
      data,
      header: {
        ...(options.header || {}),
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'X-App-Version': '1.0.1'
      }
    };
  }
}

module.exports = Signature;
