// validator.js - 数据验证工具类
// 基于技术设计文档实现的数据验证体系

/**
 * 验证工具对象，统一管理各种数据验证函数
 */
const validator = {
  /**
   * 验证是否为有效的数字ID
   * @param {*} id - 要验证的ID
   * @returns {boolean} 是否为有效的ID
   */
  isValidId(id) {
    return id !== undefined && id !== null && /^\d+$/.test(id.toString());
  },
  
  /**
   * 验证是否为有效的文章ID
   * @param {*} articleId - 文章ID
   * @returns {boolean} 是否为有效的文章ID
   */
  isValidArticleId(articleId) {
    return this.isValidId(articleId);
  },
  
  /**
   * 验证是否为有效的商品ID
   * @param {*} productId - 商品ID
   * @returns {boolean} 是否为有效的商品ID
   */
  isValidProductId(productId) {
    return this.isValidId(productId);
  },
  
  /**
   * 验证是否为有效的优惠券ID
   * @param {*} couponId - 优惠券ID
   * @returns {boolean} 是否为有效的优惠券ID
   */
  isValidCouponId(couponId) {
    return this.isValidId(couponId);
  },
  
  /**
   * 验证是否为有效的分类ID
   * @param {*} categoryId - 分类ID
   * @returns {boolean} 是否为有效的分类ID
   */
  isValidCategoryId(categoryId) {
    return this.isValidId(categoryId);
  },
  
  /**
   * 验证是否为有效的订单ID
   * @param {*} orderId - 订单ID
   * @returns {boolean} 是否为有效的订单ID
   */
  isValidOrderId(orderId) {
    return this.isValidId(orderId);
  },
  
  /**
   * 验证是否为有效的评论ID
   * @param {*} commentId - 评论ID
   * @returns {boolean} 是否为有效的评论ID
   */
  isValidCommentId(commentId) {
    return this.isValidId(commentId);
  },
  
  /**
   * 验证数量是否有效
   * @param {*} quantity - 数量
   * @param {Object} options - 验证选项
   * @param {number} options.min - 最小值
   * @param {number} options.max - 最大值
   * @returns {boolean} 是否为有效的数量
   */
  isValidQuantity(quantity, options = {}) {
    const num = Number(quantity);
    const { min = 1, max = Infinity } = options;
    
    return !isNaN(num) && Number.isInteger(num) && num >= min && num <= max;
  },
  
  /**
   * 验证价格是否有效
   * @param {*} price - 价格
   * @param {Object} options - 验证选项
   * @param {number} options.min - 最小值
   * @param {number} options.max - 最大值
   * @returns {boolean} 是否为有效的价格
   */
  isValidPrice(price, options = {}) {
    const num = Number(price);
    const { min = 0, max = Infinity } = options;
    
    return !isNaN(num) && num >= min && num <= max;
  },
  
  /**
   * 验证字符串是否为空
   * @param {*} str - 字符串
   * @returns {boolean} 是否为空字符串
   */
  isEmptyString(str) {
    return str === undefined || str === null || str.trim() === '';
  },
  
  /**
   * 验证是否为有效的字符串
   * @param {*} str - 字符串
   * @param {Object} options - 验证选项
   * @param {number} options.minLength - 最小长度
   * @param {number} options.maxLength - 最大长度
   * @returns {boolean} 是否为有效的字符串
   */
  isValidString(str, options = {}) {
    const { minLength = 1, maxLength = Infinity } = options;
    
    if (typeof str !== 'string') return false;
    
    const trimmed = str.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },
  
  /**
   * 验证是否为有效的用户名
   * @param {string} username - 用户名
   * @returns {boolean} 是否为有效的用户名
   */
  isValidUsername(username) {
    return this.isValidString(username, { minLength: 3, maxLength: 50 });
  },
  
  /**
   * 验证是否为有效的手机号
   * @param {string} phone - 手机号
   * @returns {boolean} 是否为有效的手机号
   */
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  
  /**
   * 验证是否为有效的邮箱
   * @param {string} email - 邮箱
   * @returns {boolean} 是否为有效的邮箱
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  /**
   * 验证是否为有效的URL
   * @param {string} url - URL
   * @returns {boolean} 是否为有效的URL
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * 验证是否为有效的图片URL
   * @param {string} url - 图片URL
   * @returns {boolean} 是否为有效的图片URL
   */
  isValidImageUrl(url) {
    if (!this.isValidUrl(url)) return false;
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return validExtensions.some(ext => lowerUrl.includes(ext));
  },
  
  /**
   * 验证是否为有效的优惠券状态
   * @param {string} status - 优惠券状态
   * @returns {boolean} 是否为有效的优惠券状态
   */
  isValidCouponStatus(status) {
    const validStatuses = ['available', 'used', 'expired'];
    return validStatuses.includes(status);
  },
  
  /**
   * 验证是否为有效的订单状态
   * @param {string} status - 订单状态
   * @returns {boolean} 是否为有效的订单状态
   */
  isValidOrderStatus(status) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    return validStatuses.includes(status);
  },
  
  /**
   * 验证是否为有效的日期
   * @param {*} date - 日期
   * @returns {boolean} 是否为有效的日期
   */
  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  },
  
  /**
   * 验证是否为有效的日期字符串（YYYY-MM-DD格式）
   * @param {string} dateStr - 日期字符串
   * @returns {boolean} 是否为有效的日期字符串
   */
  isValidDateString(dateStr) {
    if (typeof dateStr !== 'string') return false;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return !isNaN(date);
  },
  
  /**
   * 验证对象是否为空
   * @param {*} obj - 对象
   * @returns {boolean} 是否为空对象
   */
  isEmptyObject(obj) {
    return obj === undefined || obj === null || 
           (typeof obj === 'object' && Object.keys(obj).length === 0);
  },
  
  /**
   * 验证数组是否为空
   * @param {*} arr - 数组
   * @returns {boolean} 是否为空数组
   */
  isEmptyArray(arr) {
    return arr === undefined || arr === null || 
           (!Array.isArray(arr) || arr.length === 0);
  },
  
  /**
   * 验证是否为有效的评分（1-5分）
   * @param {*} rating - 评分
   * @returns {boolean} 是否为有效的评分
   */
  isValidRating(rating) {
    const num = Number(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
  },
  
  /**
   * 验证分页参数
   * @param {*} page - 页码
   * @param {*} pageSize - 每页数量
   * @returns {boolean} 是否为有效的分页参数
   */
  isValidPagination(page, pageSize) {
    return this.isValidQuantity(page, { min: 1 }) && 
           this.isValidQuantity(pageSize, { min: 1, max: 100 });
  },
  
  /**
   * 生成验证错误信息
   * @param {string} field - 字段名
   * @param {string} message - 错误信息
   * @returns {Object} 错误对象
   */
  createValidationError(field, message) {
    return {
      field,
      message,
      type: 'validation_error'
    };
  }
};

export default validator;
