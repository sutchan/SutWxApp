/**
 * 文件名: signature.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 请求签名验证工具，提供API请求签名生成、验证和请求头添加功能
 */

const Crypto = require('./crypto.js');

/**
 * 签名生成和验证类
 */
class Signature {
  /**
   * 生成API请求签名
   * @param {Object} params - 请求参数
   * @param {string} secretKey - 密钥
   * @returns {string} 生成的签名
   */
  static generate(params, secretKey) {
    // 参数排序
    const sortedParams = this._sortParams(params);
    
    // 拼接参数字符串
    const paramString = this._buildParamString(sortedParams);
    
    // 加入时间戳防止重放攻击
    const timestamp = Date.now();
    const stringToSign = `${paramString}&timestamp=${timestamp}`;
    
    // 使用密钥进行HMAC签名
    const signature = Crypto.hmacSHA256(stringToSign, secretKey);
    
    return {
      signature,
      timestamp
    };
  }
  
  /**
   * 验证API请求签名
   * @param {Object} params - 请求参数（包含signature和timestamp）
   * @param {string} secretKey - 密钥
   * @param {number} expireTime - 签名过期时间（毫秒），默认5分钟
   * @returns {boolean} 签名是否有效
   */
  static verify(params, secretKey, expireTime = 5 * 60 * 1000) {
    const { signature, timestamp, ...requestParams } = params;
    
    // 检查时间戳是否过期
    if (Date.now() - timestamp > expireTime) {
      return false;
    }
    
    // 重新生成签名并比对
    const generatedSign = this.generate(requestParams, secretKey);
    
    return generatedSign.signature === signature;
  }
  
  /**
   * 对参数进行排序
   * @private
   * @param {Object} params - 参数对象
   * @returns {Object} 排序后的参数对象
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
   * 构建参数字符串
   * @private
   * @param {Object} params - 排序后的参数对象
   * @returns {string} 参数字符串
   */
  static _buildParamString(params) {
    return Object.entries(params)
      .map(([key, value]) => {
        // 处理嵌套对象
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }
  
  /**
   * 添加签名到请求头
   * @param {Object} options - 请求选项
   * @param {string} secretKey - 密钥
   * @returns {Object} 增强后的请求选项
   */
  static addSignatureToHeaders(options, secretKey) {
    const { data, ...rest } = options;
    
    // 生成签名
    const { signature, timestamp } = this.generate(data || {}, secretKey);
    
    // 添加到请求头
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
