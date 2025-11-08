// services/index.js - 鏈嶅姟灞傚叆鍙ｆ枃浠?// 鏁村悎鎵€鏈変笟鍔℃湇鍔★紝鎻愪緵缁熶竴鐨勬湇鍔¤闂帴鍙?
/**
 * 鏈嶅姟灞傚叆鍙ｆā鍧? * 璐熻矗鏁村悎鍜屽鍑烘墍鏈変笟鍔℃湇鍔? */

// 瀵煎叆鏍稿績鏈嶅姟妯″潡
const apiService = require('../utils/api');
const authService = require('../utils/auth-service');
const articleService = require('../utils/article-service');
const categoryService = require('../utils/category-service');
const searchService = require('../utils/search-service');
const commentService = require('../utils/comment-service');
const notificationService = require('../utils/notification-service');
const analyticsService = require('../utils/analytics-service');
const followingService = require('../utils/following-service');
const userService = require('../utils/user-service');
const productService = require('../utils/product-service');
const cartService = require('../utils/cart-service');
const orderService = require('../utils/order-service');
const addressService = require('../utils/address-service');
const paymentService = require('../utils/payment-service');
const pointsService = require('../utils/points-service');
const configService = require('../utils/config-service');
const cacheService = require('../utils/cache-service');
const fileService = require('../utils/file-service');
const feedbackService = require('../utils/feedback-service');

/**
 * 鏈嶅姟娉ㄥ唽涓績
 * 闆嗕腑绠＄悊鎵€鏈変笟鍔℃湇鍔? */
const serviceRegistry = {
  // 鏍稿績鏈嶅姟
  api: apiService,
  
  // 鐢ㄦ埛鐩稿叧鏈嶅姟
  auth: authService,
  user: userService,
  following: followingService,
  
  // 鍐呭鐩稿叧鏈嶅姟
  article: articleService,
  category: categoryService,
  comment: commentService,
  
  // 鐢靛晢鐩稿叧鏈嶅姟
  product: productService,
  cart: cartService,
  order: orderService,
  address: addressService,
  payment: paymentService,
  points: pointsService,
  
  // 杈呭姪鍔熻兘鏈嶅姟
  config: configService,
  cache: cacheService,
  file: fileService,
  feedback: feedbackService,
  analytics: analyticsService,
  notification: notificationService,
  search: searchService
};

/**
 * 鏈嶅姟宸ュ巶绫? * 鎻愪緵鏈嶅姟鐨勮幏鍙栧拰鍒濆鍖栧姛鑳? */
class ServiceFactory {
  /**
   * 鑾峰彇鎸囧畾鐨勬湇鍔″疄渚?   * @param {string} serviceName - 鏈嶅姟鍚嶇О
   * @returns {Object|null} 鏈嶅姟瀹炰緥鎴杗ull
   */
  static getService(serviceName) {
    if (serviceRegistry[serviceName]) {
      return serviceRegistry[serviceName];
    }
    console.error(`鏈嶅姟 ${serviceName} 涓嶅瓨鍦╜);
    return null;
  }
  
  /**
   * 鑾峰彇鎵€鏈夊凡娉ㄥ唽鐨勬湇鍔?   * @returns {Object} 鎵€鏈夋湇鍔＄殑闆嗗悎
   */
  static getAllServices() {
    return { ...serviceRegistry };
  }
  
  /**
   * 妫€鏌ユ湇鍔℃槸鍚﹀瓨鍦?   * @param {string} serviceName - 鏈嶅姟鍚嶇О
   * @returns {boolean} 鏈嶅姟鏄惁瀛樺湪
   */
  static hasService(serviceName) {
    return !!serviceRegistry[serviceName];
  }
}

// 瀵煎嚭鏈嶅姟宸ュ巶鍜屾墍鏈夋湇鍔?exports.ServiceFactory = ServiceFactory;
exports.services = serviceRegistry;

// 瀵煎嚭鍗曚釜鏈嶅姟浠ヤ究浜庣洿鎺ュ鍏?module.exports = {
  ServiceFactory,
  services: serviceRegistry,
  ...serviceRegistry
};
