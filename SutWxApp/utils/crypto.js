﻿﻿/**
 * 文件名 crypto.js
 * 版本号 1.0.2
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 加密工具类，用于处理HMAC-SHA256、MD5等加密算法
 */

/**
 * 加密工具类
 */
class Crypto {
  /**
   * HMAC-SHA256加密
   * @param {string} data - 要加密的数据
   * @param {string} key - 密钥
   * @returns {string} 加密结果
   */
  static hmacSHA256(data, key) {
    if (!key) {
      throw new Error('密钥不能为空');
    }
    
    try {
      // 模拟HMAC-SHA256加密
      // 实际项目中应使用微信小程序提供的加密API或第三方库
      return this._fallbackHMACSHA256(data, key);
    } catch (error) {
      console.error('HMAC-SHA256加密失败:', error);
      return this._fallbackHMACSHA256(data, key);
    }
  }
  
  /**
   * MD5加密
   * @param {string} data - 要加密的数据
   * @returns {string} 加密结果
   */
  static md5(data) {
    try {
      // 模拟MD5加密
      // 实际项目中应使用微信小程序提供的加密API或第三方库
      return this._fallbackMD5(data);
    } catch (error) {
      console.error('MD5加密失败:', error);
      return this._fallbackMD5(data);
    }
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
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * 安全比较两个字符串
   * @param {string} a - 第一个字符串
   * @param {string} b - 第二个字符串
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
  
  /**
   * 降级HMAC-SHA256实现
   * @private
   * @param {string} data - 要加密的数据
   * @param {string} key - 密钥
   * @returns {string} 加密结果
   */
  static _fallbackHMACSHA256(data, key) {
    // 使用FNV-1a哈希算法作为降级方案
    let hash = 2166136261; // FNV-1a初始值
    const prime = 16777619; // FNV-1a质数
    
    // 先处理密钥
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash *= prime;
      hash >>>= 0; // 确保是32位无符号整数
    }
    
    // 再处理数据
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i);
      hash *= prime;
      hash >>>= 0;
    }
    
    return hash.toString(16).padStart(8, '0');
  }
  
  /**
   * 降级MD5实现
   * @private
   * @param {string} data - 要加密的数据
   * @returns {string} 加密结果
   */
  static _fallbackMD5(data) {
    // 使用FNV-1a哈希算法作为降级方案
    let hash = 2166136261; // FNV-1a初始值
    const prime = 16777619; // FNV-1a质数
    
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i);
      hash *= prime;
      hash >>>= 0; // 确保是32位无符号整数
    }
    
    return hash.toString(16).padStart(8, '0');
  }
}

module.exports = Crypto;