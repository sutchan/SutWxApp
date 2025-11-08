// validator.js - 鏁版嵁楠岃瘉宸ュ叿绫?// 鍩轰簬鎶€鏈璁℃枃妗ｅ疄鐜扮殑鏁版嵁楠岃瘉浣撶郴

/**
 * 楠岃瘉宸ュ叿瀵硅薄锛岀粺涓€绠＄悊鍚勭鏁版嵁楠岃瘉鍑芥暟
 */
const validator = {
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鏁板瓧ID
   * @param {*} id - 瑕侀獙璇佺殑ID
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑ID
   */
  isValidId(id) {
    return id !== undefined && id !== null && /^\d+$/.test(id.toString());
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鏂囩珷ID
   * @param {*} articleId - 鏂囩珷ID
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鏂囩珷ID
   */
  isValidArticleId(articleId) {
    return this.isValidId(articleId);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鍟嗗搧ID
   * @param {*} productId - 鍟嗗搧ID
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鍟嗗搧ID
   */
  isValidProductId(productId) {
    return this.isValidId(productId);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑浼樻儬鍒窱D
   * @param {*} couponId - 浼樻儬鍒窱D
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑浼樻儬鍒窱D
   */
  isValidCouponId(couponId) {
    return this.isValidId(couponId);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鍒嗙被ID
   * @param {*} categoryId - 鍒嗙被ID
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鍒嗙被ID
   */
  isValidCategoryId(categoryId) {
    return this.isValidId(categoryId);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑璁㈠崟ID
   * @param {*} orderId - 璁㈠崟ID
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑璁㈠崟ID
   */
  isValidOrderId(orderId) {
    return this.isValidId(orderId);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑璇勮ID
   * @param {*} commentId - 璇勮ID
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑璇勮ID
   */
  isValidCommentId(commentId) {
    return this.isValidId(commentId);
  },
  
  /**
   * 楠岃瘉鏁伴噺鏄惁鏈夋晥
   * @param {*} quantity - 鏁伴噺
   * @param {Object} options - 楠岃瘉閫夐」
   * @param {number} options.min - 鏈€灏忓€?   * @param {number} options.max - 鏈€澶у€?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鏁伴噺
   */
  isValidQuantity(quantity, options = {}) {
    const num = Number(quantity);
    const { min = 1, max = Infinity } = options;
    
    return !isNaN(num) && Number.isInteger(num) && num >= min && num <= max;
  },
  
  /**
   * 楠岃瘉浠锋牸鏄惁鏈夋晥
   * @param {*} price - 浠锋牸
   * @param {Object} options - 楠岃瘉閫夐」
   * @param {number} options.min - 鏈€灏忓€?   * @param {number} options.max - 鏈€澶у€?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑浠锋牸
   */
  isValidPrice(price, options = {}) {
    const num = Number(price);
    const { min = 0, max = Infinity } = options;
    
    return !isNaN(num) && num >= min && num <= max;
  },
  
  /**
   * 楠岃瘉瀛楃涓叉槸鍚︿负绌?   * @param {*} str - 瀛楃涓?   * @returns {boolean} 鏄惁涓虹┖瀛楃涓?   */
  isEmptyString(str) {
    return str === undefined || str === null || str.trim() === '';
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑瀛楃涓?   * @param {*} str - 瀛楃涓?   * @param {Object} options - 楠岃瘉閫夐」
   * @param {number} options.minLength - 鏈€灏忛暱搴?   * @param {number} options.maxLength - 鏈€澶ч暱搴?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑瀛楃涓?   */
  isValidString(str, options = {}) {
    const { minLength = 1, maxLength = Infinity } = options;
    
    if (typeof str !== 'string') return false;
    
    const trimmed = str.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鐢ㄦ埛鍚?   * @param {string} username - 鐢ㄦ埛鍚?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鐢ㄦ埛鍚?   */
  isValidUsername(username) {
    return this.isValidString(username, { minLength: 3, maxLength: 50 });
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鎵嬫満鍙?   * @param {string} phone - 鎵嬫満鍙?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鎵嬫満鍙?   */
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑閭
   * @param {string} email - 閭
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑閭
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑URL
   * @param {string} url - URL
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑URL
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
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鍥剧墖URL
   * @param {string} url - 鍥剧墖URL
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鍥剧墖URL
   */
  isValidImageUrl(url) {
    if (!this.isValidUrl(url)) return false;
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return validExtensions.some(ext => lowerUrl.includes(ext));
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑浼樻儬鍒哥姸鎬?   * @param {string} status - 浼樻儬鍒哥姸鎬?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑浼樻儬鍒哥姸鎬?   */
  isValidCouponStatus(status) {
    const validStatuses = ['available', 'used', 'expired'];
    return validStatuses.includes(status);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑璁㈠崟鐘舵€?   * @param {string} status - 璁㈠崟鐘舵€?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑璁㈠崟鐘舵€?   */
  isValidOrderStatus(status) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    return validStatuses.includes(status);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鏃ユ湡
   * @param {*} date - 鏃ユ湡
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鏃ユ湡
   */
  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑鏃ユ湡瀛楃涓诧紙YYYY-MM-DD鏍煎紡锛?   * @param {string} dateStr - 鏃ユ湡瀛楃涓?   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鏃ユ湡瀛楃涓?   */
  isValidDateString(dateStr) {
    if (typeof dateStr !== 'string') return false;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return !isNaN(date);
  },
  
  /**
   * 楠岃瘉瀵硅薄鏄惁涓虹┖
   * @param {*} obj - 瀵硅薄
   * @returns {boolean} 鏄惁涓虹┖瀵硅薄
   */
  isEmptyObject(obj) {
    return obj === undefined || obj === null || 
           (typeof obj === 'object' && Object.keys(obj).length === 0);
  },
  
  /**
   * 楠岃瘉鏁扮粍鏄惁涓虹┖
   * @param {*} arr - 鏁扮粍
   * @returns {boolean} 鏄惁涓虹┖鏁扮粍
   */
  isEmptyArray(arr) {
    return arr === undefined || arr === null || 
           (!Array.isArray(arr) || arr.length === 0);
  },
  
  /**
   * 楠岃瘉鏄惁涓烘湁鏁堢殑璇勫垎锛?-5鍒嗭級
   * @param {*} rating - 璇勫垎
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑璇勫垎
   */
  isValidRating(rating) {
    const num = Number(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
  },
  
  /**
   * 楠岃瘉鍒嗛〉鍙傛暟
   * @param {*} page - 椤电爜
   * @param {*} pageSize - 姣忛〉鏁伴噺
   * @returns {boolean} 鏄惁涓烘湁鏁堢殑鍒嗛〉鍙傛暟
   */
  isValidPagination(page, pageSize) {
    return this.isValidQuantity(page, { min: 1 }) && 
           this.isValidQuantity(pageSize, { min: 1, max: 100 });
  },
  
  /**
   * 鐢熸垚楠岃瘉閿欒淇℃伅
   * @param {string} field - 瀛楁鍚?   * @param {string} message - 閿欒淇℃伅
   * @returns {Object} 閿欒瀵硅薄
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
