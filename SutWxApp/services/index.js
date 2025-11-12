锘?/ services/index.js - 閺堝秴濮熺仦鍌氬弳閸欙絾鏋冩禒?// 閺佹潙鎮庨幍鈧張澶夌瑹閸斺剝婀囬崝鈽呯礉閹绘劒绶电紒鐔剁閻ㄥ嫭婀囬崝陇顔栭梻顔藉复閸?
/**
 * 閺堝秴濮熺仦鍌氬弳閸欙絾膩閸? * 鐠愮喕鐭楅弫鏉戞値閸滃苯顕遍崙鐑樺閺堝绗熼崝鈩冩箛閸? */

// 鐎电厧鍙嗛弽绋跨妇閺堝秴濮熷Ο鈥虫健
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
 * 閺堝秴濮熷▔銊ュ斀娑擃厼绺? * 闂嗗棔鑵戠粻锛勬倞閹碘偓閺堝绗熼崝鈩冩箛閸? */
const serviceRegistry = {
  // 閺嶇绺鹃張宥呭
  api: apiService,
  
  // 閻劍鍩涢惄绋垮彠閺堝秴濮?  auth: authService,
  user: userService,
  following: followingService,
  
  // 閸愬懎顔愰惄绋垮彠閺堝秴濮?  article: articleService,
  category: categoryService,
  comment: commentService,
  
  // 閻㈤潧鏅㈤惄绋垮彠閺堝秴濮?  product: productService,
  cart: cartService,
  order: orderService,
  address: addressService,
  payment: paymentService,
  points: pointsService,
  
  // 鏉堝懎濮崝鐔诲厴閺堝秴濮?  config: configService,
  cache: cacheService,
  file: fileService,
  feedback: feedbackService,
  analytics: analyticsService,
  notification: notificationService,
  search: searchService
};

/**
 * 閺堝秴濮熷銉ュ范缁? * 閹绘劒绶甸張宥呭閻ㄥ嫯骞忛崣鏍ф嫲閸掓繂顫愰崠鏍у閼? */
class ServiceFactory {
  /**
   * 閼惧嘲褰囬幐鍥х暰閻ㄥ嫭婀囬崝鈥崇杽娓?   * @param {string} serviceName - 閺堝秴濮熼崥宥囆?   * @returns {Object|null} 閺堝秴濮熺€圭偘绶ラ幋鏉梪ll
   */
  static getService(serviceName) {
    if (serviceRegistry[serviceName]) {
      return serviceRegistry[serviceName];
    }
    console.error(`閺堝秴濮?${serviceName} 娑撳秴鐡ㄩ崷鈺?;
    return null;
  }
  
  /**
   * 閼惧嘲褰囬幍鈧張澶婂嚒濞夈劌鍞介惃鍕箛閸?   * @returns {Object} 閹碘偓閺堝婀囬崝锛勬畱闂嗗棗鎮?   */
  static getAllServices() {
    return { ...serviceRegistry };
  }
  
  /**
   * 濡偓閺屻儲婀囬崝鈩冩Ц閸氾箑鐡ㄩ崷?   * @param {string} serviceName - 閺堝秴濮熼崥宥囆?   * @returns {boolean} 閺堝秴濮熼弰顖氭儊鐎涙ê婀?   */
  static hasService(serviceName) {
    return !!serviceRegistry[serviceName];
  }
}

// 鐎电厧鍤張宥呭瀹搞儱宸堕崪灞惧閺堝婀囬崝?exports.ServiceFactory = ServiceFactory;
exports.services = serviceRegistry;

// 鐎电厧鍤崡鏇氶嚋閺堝秴濮熸禒銉ょ┒娴滃海娲块幒銉ヮ嚤閸?module.exports = {
  ServiceFactory,
  services: serviceRegistry,
  ...serviceRegistry
};
\n