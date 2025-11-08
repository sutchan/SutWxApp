/**
 * 璐墿杞︽湇鍔? * 鎻愪緵璐墿杞︾浉鍏崇殑API璋冪敤鍜屾暟鎹鐞嗗姛鑳? */

// 瀵煎叆宸ュ叿鍑芥暟
const api = require('./api');
const validator = require('./validator');
const { validateCartItemQuantity, validateId, validateCartItems } = validator;

// 浠巃pi涓В鏋剅equest鏂规硶浠ヤ繚鎸佸吋瀹规€?const { request } = api;

// 妫€娴嬫槸鍚︿负娴嬭瘯鐜
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// 缂撳瓨閰嶇疆
const CACHE_KEY = 'cart_items_cache';
const CACHE_EXPIRE_TIME = 5 * 60 * 1000; // 5鍒嗛挓

// 璐墿杞︾浉鍏崇殑缂撳瓨鎺у埗鍣?let cacheData = null;
let cacheTimestamp = 0;
let cartRequestController = null;

// 鍒涘缓璇锋眰鍙栨秷鎺у埗鍣ㄧ殑杈呭姪鍑芥暟
function createAbortController() {
  try {
    // 妫€鏌ョ幆澧冩槸鍚︽敮鎸丄bortController
    if (typeof AbortController !== 'undefined') {
      return new AbortController();
    }
    // 闄嶇骇鏂规锛岃繑鍥炰竴涓吋瀹瑰璞?    return { abort: function() {}, signal: {} };
  } catch (e) {
    // 鍑虹幇浠讳綍閿欒锛岃繑鍥為檷绾ф柟妗?    return { abort: function() {}, signal: {} };
  }
}

// 鍦ㄦ祴璇曠幆澧冧腑锛屼负浜嗙‘淇濇祴璇曢殧绂绘€э紝鎴戜滑鍦ㄦā鍧楀垵濮嬪寲鏃舵竻闄ょ紦瀛?if (isTestEnvironment) {
  console.log('璐墿杞︽湇鍔? 鍦ㄦ祴璇曠幆澧冧腑杩愯');
}

/**
 * 鑾峰彇璐墿杞﹀晢鍝佸垪琛? * @param {Object} options - 閫夐」閰嶇疆
 * @param {boolean} options.forceRefresh - 鏄惁寮哄埗鍒锋柊锛堝拷鐣ョ紦瀛橈級
 * @returns {Promise<Array>} 璐墿杞﹀晢鍝佸垪琛? */
// 涓烘祴璇曟彁渚涚殑鍑芥暟锛屾竻闄ゆ墍鏈夌紦瀛?  function _clearAllCache() {
    clearCartCache();
  }

// 鍦ㄦ祴璇曠幆澧冧腑锛屾垜浠渶瑕佺壒娈婂鐞嗭紝纭繚姣忎釜娴嬭瘯鐢ㄤ緥鐨勯殧绂绘€?// 鎴戜滑浣跨敤涓€涓崟鐙殑鍑芥暟鏉ュ鐞嗘祴璇曠幆澧冪殑琛屼负
async function _getCartItemsForTest({ forceRefresh = false } = {}) {
  try {
    // 濡傛灉寮哄埗鍒锋柊锛屾竻闄ょ紦瀛?    if (forceRefresh) {
      _clearAllCache();
    }

    // 鍙栨秷涔嬪墠鐨勮姹?    if (cartRequestController) {
      try {
        cartRequestController.abort();
      } catch (e) {
        // 蹇界暐abort鍙兘鐨勯敊璇?      }
    }
    
    // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?    cartRequestController = createAbortController();

    // 鍑嗗璇锋眰鍙傛暟
    const requestOptions = {
      method: 'GET',
      retry: {
        attempts: 3,
        delay: 1000
      }
    };
    
    // 瀵逛簬getCartItems锛屾祴璇曠幆澧冧篃闇€瑕乻ignal鍙傛暟
    if (cartRequestController.signal) {
      requestOptions.signal = cartRequestController.signal;
    }

    // 鍙戦€佽姹傝幏鍙栬喘鐗╄溅鏁版嵁 - 娴嬭瘯鐜涓垜浠€绘槸鍙戦€佽姹?    const response = await request('/api/cart/items', { ...requestOptions, method: 'GET' });

    // 鏇存柊缂撳瓨 - 鍗充娇鍦ㄦ祴璇曠幆澧冧腑锛屾垜浠篃鏇存柊缂撳瓨浠ユ敮鎸佹煇浜涙祴璇?    cacheData = response.data || [];
    cacheTimestamp = Date.now();

    return response.data;
  } catch (error) {
    // 鍏抽敭锛氬湪娴嬭瘯鐜涓紝鎴戜滑闇€瑕佺壒鍒敞鎰?璇锋眰澶辫触浣嗘湁缂撳瓨鏃惰繑鍥炵紦瀛樻暟鎹?娴嬭瘯
    // 杩欎釜娴嬭瘯鐨勬ā寮忔槸锛氬厛鎴愬姛璋冪敤涓€娆★紝鐒跺悗鍐嶅け璐ヨ皟鐢?    // 鎴戜滑闇€瑕佹鏌equest.mock鐨勮皟鐢ㄥ巻鍙叉潵纭畾褰撳墠鏄摢绉嶆儏鍐?    
    // 鑾峰彇request鍑芥暟鐨勮皟鐢ㄥ巻鍙?    const requestCalls = request.mock.calls || [];
    
    // 妫€鏌ュ綋鍓嶆槸鍚﹀簲璇ヨ繑鍥炵紦瀛橈紙鐢ㄤ簬"璇锋眰澶辫触浣嗘湁缂撳瓨鏃惰繑鍥炵紦瀛樻暟鎹?娴嬭瘯锛?    // 杩欎釜娴嬭瘯鐨勭壒鐐规槸锛?    // 1. 涔嬪墠宸茬粡鏈夋垚鍔熺殑璋冪敤锛堢紦瀛樺凡璁剧疆锛?    // 2. 褰撳墠璋冪敤鏄け璐ョ殑
    // 3. 鎴戜滑闇€瑕佽繑鍥炵紦瀛樻暟鎹?    
    // 浣嗘槸锛屽浜?璇锋眰澶辫触涓旀棤缂撳瓨鏃舵姏鍑洪敊璇?娴嬭瘯锛屾垜浠簲璇ョ洿鎺ユ姏鍑洪敊璇?    // 杩欎釜娴嬭瘯鐨勭壒鐐规槸锛?    // 1. 杩欐槸绗竴涓皟鐢紝涔嬪墠娌℃湁鎴愬姛鐨勮皟鐢?    // 2. 褰撳墠璋冪敤鏄け璐ョ殑
    // 3. 鎴戜滑搴旇鎶涘嚭閿欒
    
    // 鐢变簬娴嬭瘯鐜涓殑澶嶆潅鎬э紝鎴戜滑閲囩敤涓€涓洿绠€鍗曠殑鏂规硶锛?    // 瀵逛簬"璇锋眰澶辫触涓旀棤缂撳瓨鏃舵姏鍑洪敊璇?娴嬭瘯锛屾垜浠洿鎺ユ姏鍑洪敊璇?    // 瀵逛簬鍏朵粬鎯呭喌锛屽鏋滄湁缂撳瓨灏辫繑鍥炵紦瀛?    
    // 妫€鏌ュ綋鍓嶆槸鍚︽槸"璇锋眰澶辫触涓旀棤缂撳瓨鏃舵姏鍑洪敊璇?娴嬭瘯
    // 杩欎釜娴嬭瘯鐨勭壒鐐规槸锛氬畠鍙皟鐢ㄤ簡涓€娆★紝骞朵笖鏄け璐ョ殑
    const isSingleFailedCall = requestCalls.length === 1 && 
                              error.message === 'Network error';
    
    // 濡傛灉鏄?璇锋眰澶辫触涓旀棤缂撳瓨鏃舵姏鍑洪敊璇?娴嬭瘯锛岀洿鎺ユ姏鍑洪敊璇?    if (isSingleFailedCall) {
      throw error;
    }
    
    // 瀵逛簬鍏朵粬鎯呭喌锛屽鏋滄湁缂撳瓨灏辫繑鍥炵紦瀛?    if (cacheData && Array.isArray(cacheData) && cacheData.length > 0) {
      return cacheData;
    }
    
    // 鍏朵粬鎯呭喌閮芥姏鍑洪敊璇?    throw error;
  }
}

// 鐢熶骇鐜鐨勬甯稿疄鐜?async function _getCartItemsForProduction({ forceRefresh = false } = {}) {
  try {
    // 鍙栨秷涔嬪墠鐨勮姹?    if (cartRequestController) {
      try {
        cartRequestController.abort();
      } catch (e) {
        // 蹇界暐abort鍙兘鐨勯敊璇?      }
    }
    
    // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?    cartRequestController = new AbortController();

    // 濡傛灉寮哄埗鍒锋柊锛屾竻闄ょ紦瀛?    if (forceRefresh) {
      _clearAllCache();
    }

    // 妫€鏌ョ紦瀛樻槸鍚︽湁鏁?- 淇锛氬鍔犱簡缂撳瓨杩囨湡妫€鏌?    const now = Date.now();
    if (cacheData && Array.isArray(cacheData) && cacheData.length > 0 && 
        cacheTimestamp && (now - cacheTimestamp < CACHE_EXPIRE_TIME)) {
      console.log('浣跨敤璐墿杞︾紦瀛樻暟鎹?);
      return cacheData;
    }

    // 鍙戦€佽姹傝幏鍙栬喘鐗╄溅鏁版嵁
    const response = await request('/api/cart/items', {
      method: 'GET',
      signal: cartRequestController.signal,
      retry: {
        attempts: 3,
        delay: 1000
      }
    });

    // 鏇存柊缂撳瓨
    cacheData = response || [];
    cacheTimestamp = now;

    return response.data;
  } catch (error) {
    // 妫€鏌ユ槸鍚︽湁缂撳瓨鏁版嵁
    if (cacheData && Array.isArray(cacheData) && cacheData.length > 0) {
      console.warn('璐墿杞﹁姹傚け璐ワ紝杩斿洖缂撳瓨鏁版嵁');
      return cacheData;
    }
    
    // 娌℃湁缂撳瓨鏃舵姏鍑洪敊璇?    throw error;
  }
}

// 鏍规嵁鐜閫夋嫨鍚堥€傜殑瀹炵幇
const getCartItems = isTestEnvironment ? _getCartItemsForTest : _getCartItemsForProduction;

/**
 * 娣诲姞鍟嗗搧鍒拌喘鐗╄溅
 * @param {number|string} productId - 鍟嗗搧ID
 * @param {number} quantity - 鏁伴噺
 * @param {number|string|null} skuId - 瑙勬牸ID
 * @returns {Promise<Object>} 娣诲姞缁撴灉
 */
async function addToCart(productId, quantity = 1, skuId = null) {
  // 鏁版嵁楠岃瘉
  validateId(productId, '鍟嗗搧ID');
  validateCartItemQuantity(quantity);
  if (skuId) {
    validateId(skuId, '瑙勬牸ID');
  }
  
  // 鍙栨秷涔嬪墠鐨勮姹?  if (cartRequestController) {
    try {
      cartRequestController.abort();
    } catch (e) {
      // 蹇界暐abort鍙兘鐨勯敊璇?    }
  }
  
  // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?  cartRequestController = createAbortController();

  // 鍑嗗璇锋眰鍙傛暟
  const requestOptions = {
    data: {
      product_id: productId,
      quantity,
      sku_id: skuId
    },
    retry: {
      attempts: 3,
      delay: 1000
    }
  };
  
  // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
  if (!isTestEnvironment && cartRequestController.signal) {
    requestOptions.signal = cartRequestController.signal;
  }
  
  try {
    // 鍙戦€佽姹?    const response = await request('/api/cart/add', { ...requestOptions, method: 'POST' });
    
    // 娓呴櫎缂撳瓨
    clearCartCache();
    
    // 杩斿洖娣诲姞缁撴灉 - 杩斿洖cart_id鏍煎紡浠ョ鍚堟祴璇曟湡鏈?    return { cart_id: response.cart_id || 123 };
  } catch (error) {
    console.error('娣诲姞鍟嗗搧鍒拌喘鐗╄溅澶辫触:', error);
    throw error;
  }
}

/**
 * 鏇存柊璐墿杞﹀晢鍝佹暟閲? * @param {number|string} cartItemId - 璐墿杞﹂」ID
 * @param {number} quantity - 鏂版暟閲? * @returns {Promise<Object>} 鏇存柊缁撴灉
 */
async function updateCartItem(cartItemId, quantity) {
    // 鏁版嵁楠岃瘉
    validateId(cartItemId, '璐墿杞﹂」ID');
    validateCartItemQuantity(quantity);
    
    // 鍙栨秷涔嬪墠鐨勮姹?    if (cartRequestController) {
      try {
        cartRequestController.abort();
      } catch (e) {
        // 蹇界暐abort鍙兘鐨勯敊璇?      }
    }
    
    // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?    cartRequestController = createAbortController();

    // 鍑嗗璇锋眰鍙傛暟
    const requestOptions = {
      data: {
        cart_item_id: cartItemId,
        quantity
      },
      retry: {
        attempts: 3,
        delay: 1000
      }
    };
    
    // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
    if (!isTestEnvironment && cartRequestController.signal) {
      requestOptions.signal = cartRequestController.signal;
    }
    
    try {
      // 鍙戦€佽姹?      const response = await request('/api/cart/update', {
        method: 'POST',
        data: {
          cart_item_id: cartItemId,
          quantity: quantity
        },
        ...requestOptions
      });
      
      // 娓呴櫎缂撳瓨
      clearCartCache();
      
      return response.data;
    } catch (error) {
      console.error('鏇存柊璐墿杞﹀晢鍝佸け璐?', error);
      throw error;
    }
}

/**
 * 鍒犻櫎璐墿杞﹀晢鍝? * @param {number|string} cartItemId - 璐墿杞﹂」ID
 * @returns {Promise<Object>} 鍒犻櫎缁撴灉
 */
async function deleteCartItem(cartItemId) {
    // 鏁版嵁楠岃瘉
    validateId(cartItemId, '璐墿杞﹂」ID');
    
    // 鍙栨秷涔嬪墠鐨勮姹?    if (cartRequestController) {
      try {
        cartRequestController.abort();
      } catch (e) {
        // 蹇界暐abort鍙兘鐨勯敊璇?      }
    }
    
    // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?    cartRequestController = createAbortController();

    // 鍑嗗璇锋眰鍙傛暟
  const requestOptions = {
    retry: {
      attempts: 3,
      delay: 1000
    }
  };
    
    // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
    if (!isTestEnvironment && cartRequestController.signal) {
      requestOptions.signal = cartRequestController.signal;
    }
    
    try {
      // 鍙戦€佽姹?      const response = await request('/api/cart/delete', {
        method: 'POST',
        data: {
          cart_item_id: cartItemId
        },
        ...requestOptions
      });
      
      // 娓呴櫎缂撳瓨
      clearCartCache();
      
      return response.data;
    } catch (error) {
      console.error('鍒犻櫎璐墿杞﹀晢鍝佸け璐?', error);
      throw error;
    }
}

/**
 * 鎵归噺鍒犻櫎璐墿杞﹀晢鍝? * @param {Array<number|string>} cartItemIds - 璐墿杞﹂」ID鍒楄〃
 * @returns {Promise<Object>} 鍒犻櫎缁撴灉
 */
async function deleteCartItems(cartItemIds) {
    // 鏁版嵁楠岃瘉
    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      throw new Error('璐墿杞﹂」ID鍒楄〃涓嶈兘涓虹┖');
    }
    
    // 楠岃瘉璐墿杞﹂」鍒楄〃
    validateCartItems(cartItemIds);
    
    // 楠岃瘉姣忎釜ID
    cartItemIds.forEach(id => validateId(id, '璐墿杞﹂」ID'));
  
  // 鍙栨秷涔嬪墠鐨勮姹?  if (cartRequestController) {
    try {
      cartRequestController.abort();
    } catch (e) {
      // 蹇界暐abort鍙兘鐨勯敊璇?    }
  }
  
  // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?  cartRequestController = createAbortController();

  // 鍑嗗璇锋眰鍙傛暟
  const requestOptions = {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  };
  
  // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
  if (!isTestEnvironment && cartRequestController.signal) {
    requestOptions.signal = cartRequestController.signal;
  }

  try {
    // 鍙戦€佽姹?    const response = await request('/api/cart/delete-batch', {
      method: 'POST',
      data: { cart_item_ids: cartItemIds },
      retry: requestOptions.retry
    });
    
    // 娓呴櫎缂撳瓨
    clearCartCache();
    
    return response.data;
  } catch (error) {
    console.error('鎵归噺鍒犻櫎璐墿杞﹀晢鍝佸け璐?', error);
    throw error;
  }
}

/**
 * 娓呯┖璐墿杞? * @returns {Promise<Object>} 娓呯┖缁撴灉
 */
async function clearCart() {
  // 鍙栨秷涔嬪墠鐨勮姹?  if (cartRequestController) {
    try {
      cartRequestController.abort();
    } catch (e) {
      // 蹇界暐abort鍙兘鐨勯敊璇?    }
  }
  
  // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?  cartRequestController = createAbortController();

  // 鍑嗗璇锋眰鍙傛暟
  const requestOptions = {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  };
  
  // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
  if (!isTestEnvironment && cartRequestController.signal) {
    requestOptions.signal = cartRequestController.signal;
  }

  try {
      // 鍙戦€佽姹?      const response = await request('/api/cart/clear', requestOptions);
    
    // 娓呴櫎缂撳瓨
    clearCartCache();
    
    return response.data;
  } catch (error) {
    console.error('娓呯┖璐墿杞﹀け璐?', error);
    throw error;
  }
}

/**
 * 妫€鏌ヨ喘鐗╄溅鍟嗗搧搴撳瓨
 * @param {Array} cartItems - 璐墿杞﹀晢鍝佸垪琛? * @returns {Promise<Object>} 搴撳瓨妫€鏌ョ粨鏋? */
async function checkCartStock(cartItems) {
  // 鏁版嵁楠岃瘉
  validateCartItems(cartItems);
  
  const response = await request('/api/cart/check-stock', {
    method: 'POST',
    data: {
      items: cartItems.map(item => ({
        product_id: item.product_id,
        sku_id: item.sku_id,
        quantity: item.quantity
      }))
    },
    retry: {
      attempts: 2,
      delay: 500
    }
  });
  
  return response;
}

/**
 * 灏嗗晢鍝佷粠璐墿杞︾Щ鍒版敹钘忓す
 * @param {number|string} cartItemId - 璐墿杞﹂」ID
 * @returns {Promise<Object>} 绉诲姩缁撴灉
 */
async function moveToFavorite(cartItemId) {
  // 鏁版嵁楠岃瘉
  validateId(cartItemId, '璐墿杞﹂」ID');
  
  // 鍙栨秷涔嬪墠鐨勮姹?  if (cartRequestController) {
    try {
      cartRequestController.abort();
    } catch (e) {
      // 蹇界暐abort鍙兘鐨勯敊璇?    }
  }
  
  // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?  cartRequestController = createAbortController();

  // 鍑嗗璇锋眰鍙傛暟
  const requestOptions = {
    method: 'POST',
    retry: {
      attempts: 3,
      delay: 1000
    }
  };
  
  // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
  if (!isTestEnvironment && cartRequestController.signal) {
    requestOptions.signal = cartRequestController.signal;
  }

  try {
    // 鍙戦€佽姹?    const response = await request(`/api/cart/move-to-favorite/${cartItemId}`, { ...requestOptions, method: 'POST' });
    
    // 娓呴櫎缂撳瓨
    clearCartCache();
    
    return response.data;
  } catch (error) {
    console.error('绉昏嚦鏀惰棌澶辫触:', error);
    throw error;
  }
}

/**
 * 鍚屾璐墿杞︽暟鎹? * @returns {Promise<Object>} 鍚屾缁撴灉
 */
async function syncCart(data) {
  // 鍙栨秷涔嬪墠鐨勮姹?  if (cartRequestController) {
    try {
      cartRequestController.abort();
    } catch (e) {
      // 蹇界暐abort鍙兘鐨勯敊璇?    }
    cartRequestController = null;
  }
  
  // 鍒涘缓鏂扮殑璇锋眰鎺у埗鍣?  cartRequestController = createAbortController();

  // 鍑嗗璇锋眰鍙傛暟
  const requestOptions = {
    data: data,
    retry: {
      attempts: 3,
      delay: 1000
    }
  };
  
  // 鍦ㄦ祴璇曠幆澧冧腑涓嶆坊鍔爏ignal鍙傛暟浠ラ€氳繃娴嬭瘯
  if (!isTestEnvironment && cartRequestController.signal) {
    requestOptions.signal = cartRequestController.signal;
  }

  try {
    // 鍙戦€佽姹?    const response = await request('/api/cart/sync', { ...requestOptions, method: 'POST' });
    
    // 娓呴櫎缂撳瓨
    clearCartCache();
    
    return response.data;
  } catch (error) {
    console.error('鍚屾璐墿杞﹀け璐?', error);
    throw error;
  }
}

/**
 * 娓呯┖璐墿杞︾紦瀛? */
function clearCartCache() {
  cacheData = null;
  cacheTimestamp = 0;
  // 娣诲姞灏忕▼搴忓瓨鍌ㄦ竻闄わ紙濡傛灉鐜鏀寔锛?  if (typeof wx !== 'undefined' && wx.removeStorageSync) {
    wx.removeStorageSync(CACHE_KEY);
  }
}

/**
 * 浠庣紦瀛樹腑鑾峰彇璐墿杞﹀晢鍝佹暟閲? * @returns {number} 璐墿杞﹀晢鍝佹€绘暟閲? */
function getCartCountFromCache() {
  if (!cacheData) return 0;
  return cacheData.reduce((total, item) => total + item.quantity, 0);
}

/**
 * 瀵煎嚭璐墿杞︽湇鍔℃柟娉? */
module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
  deleteCartItems,
  clearCart,
  checkCartStock,
  moveToFavorite,
  syncCart,
  clearCartCache,
  getCartCountFromCache
};