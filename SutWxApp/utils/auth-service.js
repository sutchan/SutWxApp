// auth-service.js - 鐢ㄦ埛璁よ瘉鏈嶅姟妯″潡
// 澶勭悊寰俊鐧诲綍銆佺敤鎴蜂俊鎭巿鏉冪瓑鍔熻兘

const { api } = require('./api');
const { showToast, showLoading, hideLoading } = require('./global');
const { CACHE_KEYS, CACHE_DURATION, CacheManager, setCache, getCache, removeCache } = require('./cache');
const validator = require('./validator');

// 鐧诲綍鐘舵€佺紦瀛橀敭
const LOGIN_TOKEN_KEY = CACHE_KEYS.TOKEN || 'user_token';
const USER_INFO_KEY = CACHE_KEYS.USER_INFO;

// 鍒涘缓缂撳瓨绠＄悊鍣?const cacheManager = new CacheManager();

/**
 * 寰俊鐧诲綍
 * @returns {Promise<Object>} - 杩斿洖鐧诲綍缁撴灉
 */
export const wechatLogin = async () => {
  try {
    showLoading('鐧诲綍涓?..');
    
    // 1. 鑾峰彇寰俊鐧诲綍code
    const wxLoginResult = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });

    if (!wxLoginResult.code || !validator.isValidString(wxLoginResult.code)) {
      throw new Error('鑾峰彇鐧诲綍鍑瘉澶辫触');
    }

    // 2. 鍙戦€乧ode鍒版湇鍔″櫒鎹㈠彇token鍜岀敤鎴蜂俊鎭?    const { code } = wxLoginResult;
    const loginResult = await api.post('/auth/login', { 
      code, 
      platform: 'wechat'
    }, { abortKey: 'auth_login' });

    // 3. 淇濆瓨token鍜岀敤鎴蜂俊鎭?    if (loginResult.token && validator.isValidString(loginResult.token)) {
      // 浣跨敤缂撳瓨绠＄悊鍣ㄥ瓨鍌紝骞朵繚鐣欏師鏈夌殑瀛樺偍鏂瑰紡浠ュ吋瀹规棫浠ｇ爜
      await cacheManager.set(LOGIN_TOKEN_KEY, loginResult.token, CACHE_DURATION.LONG);
      await cacheManager.set(USER_INFO_KEY, loginResult.user || {}, CACHE_DURATION.LONG);
      
      // 鍏煎涓ょtoken瀛樺偍鏂瑰紡
      wx.setStorageSync('userToken', loginResult.token);
      wx.setStorageSync('jwt_token', loginResult.token);
      wx.setStorageSync('userInfo', loginResult.user || {});
      
      // 璁剧疆API璇锋眰鐨勯粯璁oken
      api.setToken(loginResult.token);
    }

    hideLoading();
    return loginResult;
  } catch (error) {
    hideLoading();
    console.error('寰俊鐧诲綍澶辫触:', error);
    // 鐧诲綍澶辫触锛屾竻闄ゆ湰鍦扮紦瀛樼殑鐧诲綍鐘舵€?    logout();
    throw error;
  }
};

/**
 * 鑾峰彇鐢ㄦ埛鎺堟潈淇℃伅
 * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊鐢ㄦ埛淇℃伅
 * @returns {Promise<Object>} - 杩斿洖鐢ㄦ埛淇℃伅
 */
export const getUserProfile = async (forceRefresh = false) => {
  try {
    // 濡傛灉涓嶅己鍒跺埛鏂颁笖鏈湴宸叉湁鐢ㄦ埛淇℃伅锛屽垯鐩存帴杩斿洖
  if (!forceRefresh) {
    const cachedUserInfo = await cacheManager.get(USER_INFO_KEY);
    if (cachedUserInfo && typeof cachedUserInfo === 'object') {
      return cachedUserInfo;
    }
    
    // 涔熸鏌ヤ紶缁熷瓨鍌ㄦ柟寮?    const legacyUserInfo = wx.getStorageSync('userInfo');
    if (legacyUserInfo && typeof legacyUserInfo === 'object') {
      // 杩佺Щ鍒扮紦瀛樼鐞嗗櫒
      await cacheManager.set(USER_INFO_KEY, legacyUserInfo, CACHE_DURATION.LONG);
      return legacyUserInfo;
    }
  }

    // 妫€鏌ョ櫥褰曠姸鎬?    if (!await isLoggedIn()) {
      throw new Error('璇峰厛鐧诲綍');
    }
    
    // 1. 鑾峰彇鐢ㄦ埛鎺堟潈
    const userProfile = await new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '鐢ㄤ簬瀹屽杽鐢ㄦ埛璧勬枡',
        success: resolve,
        fail: reject
      });
    });

    // 2. 鏇存柊鐢ㄦ埛淇℃伅鍒版湇鍔″櫒
    const { userInfo } = userProfile;
    await api.post('/auth/update-profile', {
      nickname: userInfo.nickName,
      avatar_url: userInfo.avatarUrl,
      gender: userInfo.gender,
      language: userInfo.language,
      province: userInfo.province,
      city: userInfo.city,
      country: userInfo.country
    }, { abortKey: 'auth_update_profile' });

    // 3. 鏇存柊鏈湴瀛樺偍鐨勭敤鎴蜂俊鎭?    const currentUser = wx.getStorageSync('userInfo') || {};
    const updatedUser = { ...currentUser, ...userInfo };
    
    // 鍚屾椂鏇存柊缂撳瓨绠＄悊鍣ㄥ拰浼犵粺瀛樺偍
    await cacheManager.set(USER_INFO_KEY, updatedUser, CACHE_DURATION.LONG);
    wx.setStorageSync('userInfo', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
    
    // 濡傛灉鏄湭鎺堟潈閿欒锛屾竻闄ょ櫥褰曠姸鎬?    if (error.message?.includes('鏈巿鏉?) || error.status === 401) {
      await logout();
    }
    
    throw error;
  }
};

/**
 * 鑾峰彇鐢ㄦ埛淇℃伅锛堝吋瀹规柊鐗圓PI锛? * @returns {Promise<Object>} - 杩斿洖鐢ㄦ埛淇℃伅
 */
export const getUserInfo = async () => {
  try {
    // 妫€鏌ユ槸鍚﹀凡鎺堟潈
    const authSetting = wx.getStorageSync('authSetting') || {};
    
    if (authSetting['scope.userInfo']) {
      // 濡傛灉宸茬粡鎺堟潈锛岀洿鎺ヨ幏鍙栫敤鎴蜂俊鎭?      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        return userInfo;
      }
    }
    
    // 浣跨敤鏂扮増API鑾峰彇鐢ㄦ埛淇℃伅
    const { userInfo } = await wx.getUserProfile({
      desc: '鐢ㄤ簬瀹屽杽浼氬憳璧勬枡'
    });
    
    // 淇濆瓨鎺堟潈鐘舵€?    wx.setStorageSync('authSetting', {
      ...authSetting,
      'scope.userInfo': true
    });
    
    // 淇濆瓨鐢ㄦ埛淇℃伅
    wx.setStorageSync('userInfo', userInfo);
    
    return userInfo;
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
    throw error;
  }
};

/**
 * 妫€鏌ョ敤鎴锋槸鍚﹀凡鐧诲綍
 * @returns {boolean} - 鏄惁宸茬櫥褰? */
export const isLoggedIn = async () => {
  try {
    // 浠庣紦瀛樼鐞嗗櫒鑾峰彇token
    const token = await cacheManager.get(LOGIN_TOKEN_KEY);
    
    // 鍚屾椂妫€鏌ヤ紶缁熷瓨鍌ㄦ柟寮?    if (!token) {
      const legacyToken = wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token');
      if (legacyToken && validator.isValidString(legacyToken)) {
        // 濡傛灉鍙戠幇浼犵粺瀛樺偍鐨則oken锛岃縼绉诲埌缂撳瓨绠＄悊鍣?        await cacheManager.set(LOGIN_TOKEN_KEY, legacyToken, CACHE_DURATION.LONG);
        api.setToken(legacyToken);
        return true;
      }
      return false;
    }
    
    // 妫€鏌oken鏄惁鏈夋晥
    if (!validator.isValidString(token)) {
      return false;
    }
    
    // 璁剧疆API璇锋眰鐨則oken
    api.setToken(token);
    
    // 妫€鏌oken鏄惁杩囨湡锛堝彲閫夛細杩欓噷鍙互娣诲姞token鏈夋晥鎬ф鏌ワ級
    const tokenExpiry = getCache('token_expiry');
    if (tokenExpiry && Date.now() > tokenExpiry) {
      // token宸茶繃鏈燂紝灏濊瘯鍒锋柊
      try {
        await refreshToken();
        return true;
      } catch (error) {
        // 鍒锋柊澶辫触锛岀櫥褰曠姸鎬佹棤鏁?        await logout();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('妫€鏌ョ櫥褰曠姸鎬佸け璐?', error);
    return false;
  }
};

/**
 * 妫€鏌ュ苟寮哄埗鐧诲綍
 * @returns {Promise<boolean>} - 鏄惁鐧诲綍鎴愬姛
 */
export const checkAndLogin = async () => {
  if (await isLoggedIn()) {
    return true;
  }
  
  try {
    await wechatLogin();
    return true;
  } catch (error) {
    showToast('鐧诲綍澶辫触锛岃閲嶈瘯', { icon: 'none' });
    return false;
  }
};

/**
 * 鐢ㄦ埛鐧诲嚭
 */
export const logout = async () => {
  try {
    // 鍙栨秷鎵€鏈夎繘琛屼腑鐨勮璇佺浉鍏宠姹?    api.cancelRequest('auth_login');
    api.cancelRequest('auth_refresh_token');
    api.cancelRequest('auth_update_profile');
    
    // 璋冪敤鍚庣鐧诲嚭鎺ュ彛锛堝彲閫夛級
    try {
      await api.post('/auth/logout', {}, { abortKey: 'auth_logout' });
    } catch (error) {
      // 鍗充娇鍚庣鐧诲嚭澶辫触锛屼篃缁х画鎵ц鏈湴鐧诲嚭閫昏緫
      console.warn('鍚庣鐧诲嚭澶辫触锛岀户缁墽琛屾湰鍦扮櫥鍑?', error);
    }
    
    // 浣跨敤缂撳瓨绠＄悊鍣ㄦ竻闄ょ櫥褰曠姸鎬?    await cacheManager.remove(LOGIN_TOKEN_KEY);
    await cacheManager.remove(USER_INFO_KEY);
    await cacheManager.clearByPrefix('auth_');
    
    // 娓呴櫎浼犵粺瀛樺偍鏁版嵁
    wx.removeStorageSync('userToken');
    wx.removeStorageSync('jwt_token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('authSetting');
    removeCache('token_expiry');
    
    // 娓呴櫎API璇锋眰鐨則oken
    api.setToken('');
    
    // 娓呴櫎璁よ瘉鐩稿叧鐨凙PI缂撳瓨
    api.clearCacheByPrefix('user_');
    api.clearCacheByPrefix('auth_');
    
    // 璺宠浆鍒伴椤?    wx.reLaunch({ url: '/pages/index/index' });
  } catch (error) {
    console.error('鐧诲嚭澶辫触:', error);
    showToast('鐧诲嚭澶辫触锛岃閲嶈瘯', { icon: 'none' });
  }
};

/**
 * 缁戝畾鎵嬫満鍙? * @param {Object} data - 鍖呭惈encryptedData鍜宨v鐨勫璞? * @returns {Promise<Object>} - 缁戝畾缁撴灉
 */
export const bindPhoneNumber = async (data) => {
  try {
    if (!await isLoggedIn()) {
      throw new Error('璇峰厛鐧诲綍');
    }
    
    if (!data || !data.encryptedData || !data.iv) {
      throw new Error('鎵嬫満鍙锋暟鎹笉瀹屾暣');
    }
    
    const result = await api.post('/auth/bind-phone', data, { abortKey: 'auth_bind_phone' });
    
    // 鏇存柊鐢ㄦ埛淇℃伅
    if (result.user) {
      await cacheManager.set(USER_INFO_KEY, result.user, CACHE_DURATION.LONG);
      wx.setStorageSync('userInfo', result.user);
    }
    
    return result;
  } catch (error) {
    console.error('缁戝畾鎵嬫満鍙峰け璐?', error);
    showToast('缁戝畾鎵嬫満鍙峰け璐?, { icon: 'none' });
    throw error;
  }
};

/**
 * 鍒锋柊token
 * @returns {Promise<Object>} - 鍒锋柊缁撴灉
 */
export const refreshToken = async () => {
  try {
    const currentToken = await cacheManager.get(LOGIN_TOKEN_KEY) || 
                        wx.getStorageSync('userToken') || 
                        wx.getStorageSync('jwt_token');
    
    if (!currentToken) {
      throw new Error('鏈壘鍒皌oken');
    }
    
    const result = await api.post('/auth/refresh-token', {
      token: currentToken
    }, { abortKey: 'auth_refresh_token' });
    
    if (result.token && validator.isValidString(result.token)) {
      // 鏇存柊token
      await cacheManager.set(LOGIN_TOKEN_KEY, result.token, CACHE_DURATION.LONG);
      wx.setStorageSync('userToken', result.token);
      wx.setStorageSync('jwt_token', result.token);
      
      // 瀛樺偍token杩囨湡鏃堕棿锛堝鏋滃悗绔彁渚涳級
      if (result.expires_in) {
        const expiryTime = Date.now() + (result.expires_in * 1000);
        setCache('token_expiry', expiryTime, CACHE_DURATION.LONG);
      }
      
      // 鏇存柊API璇锋眰鐨則oken
      api.setToken(result.token);
    }
    
    return result;
  } catch (error) {
    console.error('鍒锋柊token澶辫触:', error);
    
    // 鍒锋柊澶辫触锛屽彲鑳芥槸token宸茶繃鏈熸垨鏃犳晥锛屾竻闄ょ櫥褰曠姸鎬?    await logout();
    
    throw error;
  }
};

/**
 * 缁戝畾WordPress璐﹀彿
 * @param {string} username - WordPress鐢ㄦ埛鍚? * @param {string} password - WordPress瀵嗙爜
 * @returns {Promise<Object>} - 杩斿洖缁戝畾缁撴灉
 */
export const bindWordPressAccount = async (username, password) => {
  try {
    showLoading('缁戝畾涓?..');
    
    const result = await api.post('/auth/bind-wordpress', {
      username, 
      password
    }, { abortKey: 'auth_bind_wordpress' });
    
    hideLoading();
    showToast('缁戝畾鎴愬姛', { icon: 'success' });
    
    // 鏇存柊鐢ㄦ埛淇℃伅
    if (result.user) {
      const currentUser = wx.getStorageSync('userInfo') || {};
      const updatedUser = { ...currentUser, ...result.user };
      wx.setStorageSync('userInfo', updatedUser);
    }
    
    return result;
  } catch (error) {
    hideLoading();
    console.error('缁戝畾WordPress璐﹀彿澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇鐢ㄦ埛绛惧埌鐘舵€? * @returns {Promise<Object>} - 杩斿洖绛惧埌鐘舵€? */
export const getSignInStatus = async () => {
  try {
    // 鑾峰彇绛惧埌鐘舵€侊紝浣跨敤鐭椂闂寸紦瀛?    return await api.get('/user/signin/status', {}, { 
      useCache: true, 
      cacheDuration: CACHE_DURATION.SHORT 
    });
  } catch (error) {
    console.error('鑾峰彇绛惧埌鐘舵€佸け璐?', error);
    return { signed: false, consecutive_days: 0 };
  }
};

/**
 * 鐢ㄦ埛绛惧埌
 * @returns {Promise<Object>} - 杩斿洖绛惧埌缁撴灉
 */
export const signIn = async () => {
  try {
    showLoading('绛惧埌涓?..');
    
    const result = await api.post('/user/signin', {}, { abortKey: 'user_signin' });
    
    // 绛惧埌鎴愬姛鍚庢竻闄ょ鍒扮姸鎬佺紦瀛?    api.clearCache('/user/signin/status');
    
    hideLoading();
    showToast('绛惧埌鎴愬姛锛岃幏寰? + result.points + '绉垎', { icon: 'success' });
    
    return result;
  } catch (error) {
    hideLoading();
    console.error('绛惧埌澶辫触:', error);
    throw error;
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?module.exports = {
  wechatLogin,
  getUserProfile,
  getUserInfo,
  isLoggedIn,
  checkAndLogin,
  logout,
  bindWordPressAccount,
  getSignInStatus,
  signIn,
  bindPhoneNumber,
  refreshToken
};

// 鍚屾椂瀵煎嚭鏂规硶浠ヤ究浜庡崟鐙鍏?module.exports.wechatLogin = wechatLogin;
module.exports.getUserProfile = getUserProfile;
module.exports.getUserInfo = getUserInfo;
module.exports.isLoggedIn = isLoggedIn;
module.exports.checkAndLogin = checkAndLogin;
module.exports.logout = logout;
module.exports.bindWordPressAccount = bindWordPressAccount;
module.exports.getSignInStatus = getSignInStatus;
module.exports.signIn = signIn;
module.exports.bindPhoneNumber = bindPhoneNumber;
module.exports.refreshToken = refreshToken;