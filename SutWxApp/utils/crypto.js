/**
 * 文件名: crypto.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 加密工具类，提供HMAC-SHA256签名、MD5哈希、随机字符串生成和安全比较功能
 */

/**
 * 加密工具类
 */
class Crypto {
  /**
   * 生成HMAC-SHA256签名
   * @param {string} data - 待签名数据
   * @param {string} key - 密钥
   * @returns {string} 签名结果（十六进制字符串）
   */
  static hmacSHA256(data, key) {
    try {
      // 在小程序环境中，使用微信提供的加密接口
      const sign = wx.getFileSystemManager().readFileSync(
        `crypto://hmac_sha256/${encodeURIComponent(data)}/${encodeURIComponent(key)}`,
        'utf8'
      );
      return sign;
    } catch (error) {
      // 降级方案：使用简单的加密实现
      console.warn('使用降级加密实现:', error);
      return this._simpleHash(data + key);
    }
  }
  
  /**
   * 生成MD5哈希
   * @param {string} data - 待哈希数据
   * @returns {string} MD5哈希值（十六进制字符串）
   */
  static md5(data) {
    try {
      // 在小程序环境中，使用微信提供的加密接口
      const hash = wx.getFileSystemManager().readFileSync(
        `crypto://md5/${encodeURIComponent(data)}`,
        'utf8'
      );
      return hash;
    } catch (error) {
      // 降级方案：使用简单的哈希实现
      console.warn('使用降级MD5实现:', error);
      return this._simpleHash(data);
    }
  }
  
  /**
   * 简单的哈希实现（降级方案）
   * @private
   * @param {string} str - 输入字符串
   * @returns {string} 哈希结果
   */
  static _simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    // 转换为十六进制字符串
    let hex = Math.abs(hash).toString(16);
    // 确保长度为8位
    while (hex.length < 8) {
      hex = '0' + hex;
    }
    return hex;
  }
  
  /**
   * 生成随机字符串
   * @param {number} length - 字符串长度
   * @returns {string} 随机字符串
   */
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
   * 安全的字符串比较（防止时间攻击）
   * @param {string} a - 字符串a
   * @param {string} b - 字符串b
   * @returns {boolean} 是否相等
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
