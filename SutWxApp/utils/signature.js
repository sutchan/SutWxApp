﻿﻿/**
 * 文件名 signature.js
 * 版本号 1.0.1
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 签名生成工具，用于生成API请求签名
 */

const Crypto = require('./crypto.js');

/**
 * 签名生成类
 */
class Signature {
  /**
   * 生成API签名
   * @param {Object} params - 请求参数
   * @param {string} secretKey - 密钥
   * @returns {Object} 包含签名和时间戳的对象
   */
  static generate(params, secretKey) {
    // 对参数进行排序
    const sortedParams = this._sortParams(params);
    
    // 构建参数字符串
    const paramString = this._buildParamString(sortedParams);
    
    // 生成时间戳
    const timestamp = Date.now();
    const stringToSign = `${paramString}&timestamp=${timestamp}`;
    
    // 使用HMAC-SHA256生成签名
    const signature = Crypto.hmacSHA256(stringToSign, secretKey);
    
    return {
      signature,
      timestamp
    };
  }
  
  /**
   * 验证API签名
   * @param {Object} params - 请求参数，包含signature和timestamp
   * @param {string} secretKey - 密钥
   * @param {number} expireTime - 签名过期时间（毫秒）
   * @returns {boolean} 签名是否有效
   */
  static verify(params, secretKey, expireTime = 5 * 60 * 1000) {
    const { signature, timestamp, ...requestParams } = params;
    
    // 检查签名是否过期
    if (Date.now() - timestamp > expireTime) {
      return false;
    }
    
    // 生成签名并比较
    const generatedSign = this.generate(requestParams, secretKey);
    
    return generatedSign.signature === signature;
  }
  
  /**
   * 对参数进行排序
   * @private
   * @param {Object} params - 请求参数
   * @returns {Object} 排序后的参数
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
   * @param {Object} params - 排序后的参数
   * @returns {string} 参数字符串
   */
  static _buildParamString(params) {
    return Object.entries(params)
      .map(([key, value]) => {
        // 处理对象类型的参数
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }
  
  /**
   * 为请求头添加签名
   * @param {Object} options - 请求选项
   * @param {string} secretKey - 密钥
   * @returns {Object} 添加签名后的请求选项
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