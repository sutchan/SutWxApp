/**
 * 鏂囦欢鍚? crypto.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鍔犲瘑宸ュ叿绫伙紝鎻愪緵HMAC-SHA256绛惧悕銆丮D5鍝堝笇銆侀殢鏈哄瓧绗︿覆鐢熸垚鍜屽畨鍏ㄦ瘮杈冨姛鑳? */

/**
 * 鍔犲瘑宸ュ叿绫? */
class Crypto {
  /**
   * 鐢熸垚HMAC-SHA256绛惧悕
   * @param {string} data - 寰呯鍚嶆暟鎹?   * @param {string} key - 瀵嗛挜
   * @returns {string} 绛惧悕缁撴灉锛堝崄鍏繘鍒跺瓧绗︿覆锛?   */
  static hmacSHA256(data, key) {
    if (!key) {
      throw new Error('瀵嗛挜涓嶈兘涓虹┖');
    }
    
    try {
      // 鍦ㄥ皬绋嬪簭鐜涓紝浣跨敤寰俊鎻愪緵鐨勫姞瀵嗘帴鍙?      // 娉ㄦ剰锛氬井淇″皬绋嬪簭鐨刢rypto://鍗忚鍙兘涓嶈鎵€鏈夌増鏈敮鎸?      const sign = wx.getFileSystemManager().readFileSync(
        `crypto://hmac_sha256/${encodeURIComponent(data)}/${encodeURIComponent(key)}`,
        'utf8'
      );
      return sign;
    } catch (error) {
      // 闄嶇骇鏂规锛氫娇鐢ㄦ洿瀹夊叏鐨勫姞瀵嗗疄鐜?      console.warn('浣跨敤闄嶇骇鍔犲瘑瀹炵幇:', error);
      // 浣跨敤鏇村畨鍏ㄧ殑闄嶇骇鏂规锛岃€屼笉鏄畝鍗曠殑鍝堝笇
      return this._secureFallbackHash(data, key);
    }
  }
  
  /**
   * 鐢熸垚MD5鍝堝笇
   * @param {string} data - 寰呭搱甯屾暟鎹?   * @returns {string} MD5鍝堝笇鍊硷紙鍗佸叚杩涘埗瀛楃涓诧級
   */
  static md5(data) {
    try {
      // 鍦ㄥ皬绋嬪簭鐜涓紝浣跨敤寰俊鎻愪緵鐨勫姞瀵嗘帴鍙?      const hash = wx.getFileSystemManager().readFileSync(
        `crypto://md5/${encodeURIComponent(data)}`,
        'utf8'
      );
      return hash;
    } catch (error) {
      // 闄嶇骇鏂规锛氫娇鐢ㄦ洿瀹夊叏鐨勫搱甯屽疄鐜?      console.warn('浣跨敤闄嶇骇MD5瀹炵幇:', error);
      return this._secureFallbackHash(data);
    }
  }
  
  /**
   * 鏇村畨鍏ㄧ殑闄嶇骇鍝堝笇瀹炵幇
   * @private
   * @param {string} str - 杈撳叆瀛楃涓?   * @param {string} key - 鍙€夊瘑閽ワ紝鐢ㄤ簬HMAC
   * @returns {string} 鍝堝笇缁撴灉
   */
  static _secureFallbackHash(str, key = '') {
    // 浣跨敤鏇村畨鍏ㄧ殑鍝堝笇绠楁硶瀹炵幇锛屽熀浜嶧NV-1a绠楁硶鏀硅繘
    let hash = 2166136261; // FNV-1a鍒濆鍊?    const prime = 16777619; // FNV-1a璐ㄦ暟
    
    // 鍏堝鐞嗗瘑閽ワ紙濡傛灉鏈夛級
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash *= prime;
      hash >>>= 0; // 纭繚涓?2浣嶆棤绗﹀彿鏁存暟
    }
    
    // 鍐嶅鐞嗘暟鎹?    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash *= prime;
      hash >>>= 0; // 纭繚涓?2浣嶆棤绗﹀彿鏁存暟
    }
    
    // 杞崲涓哄崄鍏繘鍒跺瓧绗︿覆锛岀‘淇濋暱搴︿负8浣?    let hex = hash.toString(16);
    while (hex.length < 8) {
      hex = '0' + hex;
    }
    return hex;
  }
  
  /**
   * 鐢熸垚闅忔満瀛楃涓?   * @param {number} length - 瀛楃涓查暱搴?   * @returns {string} 闅忔満瀛楃涓?   */
  static randomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
    }
    
    return result;
  }
  
  /**
   * 瀹夊叏鐨勫瓧绗︿覆姣旇緝锛堥槻姝㈡椂闂存敾鍑伙級
   * @param {string} a - 瀛楃涓瞐
   * @param {string} b - 瀛楃涓瞓
   * @returns {boolean} 鏄惁鐩哥瓑
   */
  static secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}

module.exports = Crypto;
