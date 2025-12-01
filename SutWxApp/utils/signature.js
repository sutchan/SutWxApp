/**
 * 文件名 signature.js
 * 版本号 1.0.1
 * 更新日期: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 鐠囬攱鐪扮粵鎯ф倳妤犲矁鐦夊銉ュ徔閿涘本褰佹笟姹歅I鐠囬攱鐪扮粵鎯ф倳閻㈢喐鍨氶妴渚€鐛欑拠浣告嫲鐠囬攱鐪版径瀛樺潑閸旂姴濮涢懗? */

const Crypto = require('./crypto.js');

/**
 * 缁涙儳鎮曢悽鐔稿灇閸滃矂鐛欑拠浣鸿
 */
class Signature {
  /**
   * 閻㈢喐鍨欰PI鐠囬攱鐪扮粵鎯ф倳
   * @param {Object} params - 鐠囬攱鐪伴崣鍌涙殶
   * @param {string} secretKey - 鐎靛棝鎸?   * @returns {string} 閻㈢喐鍨氶惃鍕劮閸?   */
  static generate(params, secretKey) {
    // 閸欏倹鏆熼幒鎺戠碍
    const sortedParams = this._sortParams(params);
    
    // 閹峰吋甯撮崣鍌涙殶鐎涙顑佹稉?    const paramString = this._buildParamString(sortedParams);
    
    // 閸旂姴鍙嗛弮鍫曟？閹存娊妲诲銏ゅ櫢閺€鐐暰閸?    const timestamp = Date.now();
    const stringToSign = `${paramString}&timestamp=${timestamp}`;
    
    // 娴ｈ法鏁ょ€靛棝鎸滄潻娑滎攽HMAC缁涙儳鎮?    const signature = Crypto.hmacSHA256(stringToSign, secretKey);
    
    return {
      signature,
      timestamp
    };
  }
  
  /**
   * 妤犲矁鐦堿PI鐠囬攱鐪扮粵鎯ф倳
   * @param {Object} params - 鐠囬攱鐪伴崣鍌涙殶閿涘牆瀵橀崥鐜竔gnature閸滃imestamp閿?   * @param {string} secretKey - 鐎靛棝鎸?   * @param {number} expireTime - 缁涙儳鎮曟潻鍥ㄦ埂閺冨爼妫块敍鍫燁嚑缁夋帪绱氶敍宀勭帛鐠?閸掑棝鎸?   * @returns {boolean} 缁涙儳鎮曢弰顖氭儊閺堝鏅?   */
  static verify(params, secretKey, expireTime = 5 * 60 * 1000) {
    const { signature, timestamp, ...requestParams } = params;
    
    // 濡偓閺屻儲妞傞梻瀛樺煈閺勵垰鎯佹潻鍥ㄦ埂
    if (Date.now() - timestamp > expireTime) {
      return false;
    }
    
    // 闁插秵鏌婇悽鐔稿灇缁涙儳鎮曢獮鑸电槷鐎?    const generatedSign = this.generate(requestParams, secretKey);
    
    return generatedSign.signature === signature;
  }
  
  /**
   * 鐎电懓寮弫鎷岀箻鐞涘本甯撴惔?   * @private
   * @param {Object} params - 閸欏倹鏆熺€电钖?   * @returns {Object} 閹烘帒绨崥搴ｆ畱閸欏倹鏆熺€电钖?   */
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
   * 閺嬪嫬缂撻崣鍌涙殶鐎涙顑佹稉?   * @private
   * @param {Object} params - 閹烘帒绨崥搴ｆ畱閸欏倹鏆熺€电钖?   * @returns {string} 閸欏倹鏆熺€涙顑佹稉?   */
  static _buildParamString(params) {
    return Object.entries(params)
      .map(([key, value]) => {
        // 婢跺嫮鎮婂畵灞筋殰鐎电钖?        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }
  
  /**
   * 濞ｈ濮炵粵鎯ф倳閸掓媽顕Ч鍌氥仈
   * @param {Object} options - 鐠囬攱鐪伴柅澶愩€?   * @param {string} secretKey - 鐎靛棝鎸?   * @returns {Object} 婢х偛宸遍崥搴ｆ畱鐠囬攱鐪伴柅澶愩€?   */
  static addSignatureToHeaders(options, secretKey) {
    const { data, ...rest } = options;
    
    // 閻㈢喐鍨氱粵鎯ф倳
    const { signature, timestamp } = this.generate(data || {}, secretKey);
    
    // 濞ｈ濮為崚鎷岊嚞濮瑰倸銇?    return {
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
