// 鐢ㄦ埛鏈嶅姟妯″潡
// 鎻愪緵鐢ㄦ埛鐩稿叧鐨凙PI璋冪敤鍔熻兘
import { request } from './api';
import { showToast } from './global';

// 甯搁噺瀹氫箟
const USER_INFO_KEY = 'user_info';
const USER_PREFERENCES_KEY = 'user_preferences';
const CACHE_PREFIX = 'user_cache_';
const DEFAULT_CACHE_EXPIRY = 300; // 榛樿缂撳瓨5鍒嗛挓

// 缂撳瓨閿畾涔?const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_COUPONS: 'user_coupons',
  USER_ADDRESSES: 'user_addresses',
  USER_POINTS: 'user_points',
  USER_SIGNIN_HISTORY: 'user_signin_history',
  USER_SIGNIN_STATUS: 'user_signin_status',
  USER_SETTINGS: 'user_settings',
  USER_PRIVACY_SETTINGS: 'user_privacy_settings',
  USER_STATS: 'user_stats',
  USER_NOTIFICATION_SETTINGS: 'user_notification_settings',
  USER_FOLLOWING: 'user_following',
  USER_FOLLOWERS: 'user_followers',
  USER_FAVORITES: 'user_favorites',
  USER_COMMENTS: 'user_comments',
  USER_POINTS_HISTORY: 'user_points_history',
  USER_RECOMMENDATIONS: 'user_recommendations',
  AVAILABLE_COUPONS: 'available_coupons'
};

// 缂撳瓨绠＄悊宸ュ叿鍑芥暟
const cacheManager = {
  // 璁剧疆缂撳瓨
  set(key, value, expiry = DEFAULT_CACHE_EXPIRY) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheData = {
        value,
        expiry: Date.now() + expiry * 1000
      };
      wx.setStorageSync(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('璁剧疆缂撳瓨澶辫触:', error);
    }
  },

  // 鑾峰彇缂撳瓨
  get(key) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheDataStr = wx.getStorageSync(cacheKey);
      if (!cacheDataStr) return null;

      const cacheData = JSON.parse(cacheDataStr);
      if (cacheData.expiry && Date.now() > cacheData.expiry) {
        // 缂撳瓨宸茶繃鏈燂紝娓呴櫎缂撳瓨
        this.remove(key);
        return null;
      }

      return cacheData.value;
    } catch (error) {
      console.error('鑾峰彇缂撳瓨澶辫触:', error);
      return null;
    }
  },

  // 绉婚櫎缂撳瓨
  remove(key) {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      wx.removeStorageSync(cacheKey);
    } catch (error) {
      console.error('绉婚櫎缂撳瓨澶辫触:', error);
    }
  },

  // 娓呴櫎鎵€鏈夌敤鎴风浉鍏崇紦瀛?  clearAll() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('娓呴櫎缂撳瓨澶辫触:', error);
    }
  }
};

// 閲嶈瘯璇锋眰鍑芥暟
const retryRequest = async (requestFn, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 濡傛灉鏄渶鍚庝竴娆￠噸璇曪紝鎶涘嚭閿欒
      if (i === maxRetries) break;
      
      // 鎸囨暟閫€閬?      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// 鏁版嵁楠岃瘉宸ュ叿
const validator = {
  isString(value) {
    return typeof value === 'string' && value.trim() !== '';
  },
  
  isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  },
  
  isArray(value) {
    return Array.isArray(value);
  },
  
  isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  },
  
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

const userService = {
  /**
   * 鑾峰彇鐢ㄦ埛涓汉璧勬枡
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛屼笉浣跨敤缂撳瓨
   * @returns {Promise} 杩斿洖鐢ㄦ埛璧勬枡
   */
  async getUserProfile(forceRefresh = false) {
    // 灏濊瘯浠庣紦瀛樿幏鍙?    if (!forceRefresh) {
      const cachedProfile = cacheManager.get(CACHE_KEYS.USER_PROFILE);
      if (cachedProfile) {
        return cachedProfile;
      }
    }

    try {
      const profile = await retryRequest(() => 
        request({
          url: '/user/profile',
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(CACHE_KEYS.USER_PROFILE, profile, 300); // 5鍒嗛挓缂撳瓨
      
      // 鏇存柊鐢ㄦ埛淇℃伅缂撳瓨
      this.cacheUserInfo(profile);
      
      return profile;
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛璧勬枡澶辫触:', error);
      // 濡傛灉璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      const cachedProfile = cacheManager.get(CACHE_KEYS.USER_PROFILE);
      if (cachedProfile) {
        console.log('浣跨敤缂撳瓨鐨勭敤鎴疯祫鏂?);
        return cachedProfile;
      }
      throw error;
    }
  },

  /**
   * 鏇存柊鐢ㄦ埛涓汉璧勬枡
   * @param {Object} profileData - 鐢ㄦ埛璧勬枡鏁版嵁
   * @returns {Promise} 杩斿洖鏇存柊缁撴灉
   */
  async updateUserProfile(profileData) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(profileData)) {
      throw new Error('鐢ㄦ埛璧勬枡鏁版嵁鏍煎紡涓嶆纭?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/profile',
          method: 'POST',
          data: profileData
        })
      );
      
      // 娓呴櫎缂撳瓨锛屼笅娆¤幏鍙栦細閲嶆柊鍔犺浇
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      // 鏇存柊鏈湴鐢ㄦ埛淇℃伅缂撳瓨
      const currentUser = this.getCachedUserInfo() || {};
      const updatedUser = { ...currentUser, ...profileData };
      this.cacheUserInfo(updatedUser);
      
      // 鏄剧ず鎴愬姛鎻愮ず
      showToast('鏇存柊鎴愬姛');
      
      return result;
    } catch (error) {
      console.error('鏇存柊鐢ㄦ埛璧勬枡澶辫触:', error);
      showToast(error.message || '鏇存柊澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛璁剧疆
   * @returns {Promise} 杩斿洖鐢ㄦ埛璁剧疆
   */
  async getUserSettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/user/settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛璁剧疆澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鏇存柊鐢ㄦ埛璁剧疆
   * @param {Object} settings - 璁剧疆鏁版嵁
   * @returns {Promise} 杩斿洖鏇存柊缁撴灉
   */
  async updateUserSettings(settings) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(settings)) {
      throw new Error('璁剧疆鏁版嵁鏍煎紡涓嶆纭?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/settings',
          method: 'POST',
          data: settings
        })
      );
      
      showToast('璁剧疆宸叉洿鏂?);
      return result;
    } catch (error) {
      console.error('鏇存柊鐢ㄦ埛璁剧疆澶辫触:', error);
      showToast(error.message || '鏇存柊澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛闅愮璁剧疆
   * @returns {Promise} 杩斿洖闅愮璁剧疆
   */
  async getUserPrivacySettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/user/privacy-settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('鑾峰彇闅愮璁剧疆澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鏇存柊鐢ㄦ埛闅愮璁剧疆
   * @param {Object} privacySettings - 闅愮璁剧疆鏁版嵁
   * @returns {Promise} 杩斿洖鏇存柊缁撴灉
   */
  async updateUserPrivacySettings(privacySettings) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(privacySettings)) {
      throw new Error('闅愮璁剧疆鏁版嵁鏍煎紡涓嶆纭?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/privacy-settings',
          method: 'POST',
          data: privacySettings
        })
      );
      
      showToast('闅愮璁剧疆宸叉洿鏂?);
      return result;
    } catch (error) {
      console.error('鏇存柊闅愮璁剧疆澶辫触:', error);
      showToast(error.message || '鏇存柊澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛缁熻鏁版嵁
   * @returns {Promise} 杩斿洖鐢ㄦ埛缁熻鏁版嵁
   */
  async getUserStats() {
    const cacheKey = 'user_stats';
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedStats = cacheManager.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    try {
      const stats = await retryRequest(() => 
        request({
          url: '/user/stats',
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(cacheKey, stats, 300); // 5鍒嗛挓缂撳瓨
      
      return stats;
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛缁熻鏁版嵁澶辫触:', error);
      throw error;
    }
  },

  /**
   * 涓婁紶鐢ㄦ埛澶村儚
   * @param {string} filePath - 澶村儚鏂囦欢璺緞
   * @returns {Promise} 杩斿洖涓婁紶缁撴灉
   */
  async uploadAvatar(filePath) {
    if (!validator.isString(filePath)) {
      throw new Error('澶村儚鏂囦欢璺緞涓嶈兘涓虹┖');
    }

    try {
      // 瀹氫箟涓婁紶鏂囦欢鍑芥暟锛岀敤浜庨噸璇曟満鍒?      const uploadFn = () => {
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            url: request.getBaseUrl() + '/user/avatar',
            filePath: filePath,
            name: 'avatar',
            header: {
              'content-type': 'multipart/form-data',
              'Authorization': `Bearer ${request.getToken()}`
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data);
                if (data.code === 200) {
                  resolve(data);
                } else {
                  reject(new Error(data.message || '涓婁紶澶村儚澶辫触'));
                }
              } catch (e) {
                reject(new Error('瑙ｆ瀽鍝嶅簲澶辫触'));
              }
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      };

      const result = await retryRequest(uploadFn);
      
      // 娓呴櫎鐢ㄦ埛璧勬枡缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      // 鏇存柊鏈湴鐢ㄦ埛淇℃伅缂撳瓨
      const currentUser = this.getCachedUserInfo() || {};
      if (result.data && result.data.avatar_url) {
        currentUser.avatar_url = result.data.avatar_url;
        this.cacheUserInfo(currentUser);
      }
      
      showToast('澶村儚涓婁紶鎴愬姛');
      return result;
    } catch (error) {
      console.error('涓婁紶澶村儚澶辫触:', error);
      showToast(error.message || '涓婁紶澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 缁戝畾鐢ㄦ埛璐﹀彿
   * @param {Object} bindData - 缁戝畾鏁版嵁
   * @param {string} bindData.type - 缁戝畾绫诲瀷 (phone, email)
   * @param {string} bindData.value - 缁戝畾鍊?   * @param {string} bindData.code - 楠岃瘉鐮?   * @returns {Promise} 杩斿洖缁戝畾缁撴灉
   */
  async bindAccount(bindData) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(bindData) || !bindData.type || !bindData.value) {
      throw new Error('缁戝畾鏁版嵁涓嶅畬鏁?);
    }
    
    // 楠岃瘉缁戝畾鍊兼牸寮?    if (bindData.type === 'phone' && !validator.isValidPhone(bindData.value)) {
      throw new Error('璇疯緭鍏ユ纭殑鎵嬫満鍙?);
    } else if (bindData.type === 'email' && !validator.isValidEmail(bindData.value)) {
      throw new Error('璇疯緭鍏ユ纭殑閭鍦板潃');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/bind-account',
          method: 'POST',
          data: bindData
        })
      );
      
      // 娓呴櫎鐢ㄦ埛璧勬枡缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      showToast('璐﹀彿缁戝畾鎴愬姛');
      return result;
    } catch (error) {
      console.error('缁戝畾璐﹀彿澶辫触:', error);
      showToast(error.message || '缁戝畾澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 瑙ｇ粦鐢ㄦ埛璐﹀彿
   * @param {string} type - 瑙ｇ粦绫诲瀷 (phone, email)
   * @returns {Promise} 杩斿洖瑙ｇ粦缁撴灉
   */
  async unbindAccount(type) {
    // 鏁版嵁楠岃瘉
    if (!validator.isString(type) || !['phone', 'email'].includes(type)) {
      throw new Error('瑙ｇ粦绫诲瀷涓嶆纭?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/unbind-account/${type}`,
          method: 'POST'
        })
      );
      
      // 娓呴櫎鐢ㄦ埛璧勬枡缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_PROFILE);
      
      showToast('璐﹀彿瑙ｇ粦鎴愬姛');
      return result;
    } catch (error) {
      console.error('瑙ｇ粦璐﹀彿澶辫触:', error);
      showToast(error.message || '瑙ｇ粦澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛娑堟伅閫氱煡璁剧疆
   * @returns {Promise} 杩斿洖閫氱煡璁剧疆
   */
  async getNotificationSettings() {
    try {
      return await retryRequest(() => 
        request({
          url: '/user/notification-settings',
          method: 'GET'
        })
      );
    } catch (error) {
      console.error('鑾峰彇閫氱煡璁剧疆澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鏇存柊鐢ㄦ埛娑堟伅閫氱煡璁剧疆
   * @param {Object} notificationSettings - 閫氱煡璁剧疆
   * @returns {Promise} 杩斿洖鏇存柊缁撴灉
   */
  async updateNotificationSettings(notificationSettings) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(notificationSettings)) {
      throw new Error('閫氱煡璁剧疆鏁版嵁鏍煎紡涓嶆纭?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/notification-settings',
          method: 'POST',
          data: notificationSettings
        })
      );
      
      showToast('閫氱煡璁剧疆宸叉洿鏂?);
      return result;
    } catch (error) {
      console.error('鏇存柊閫氱煡璁剧疆澶辫触:', error);
      showToast(error.message || '鏇存柊澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鏀惰棌鏂囩珷
   * @param {string} articleId - 鏂囩珷ID
   * @returns {Promise} 杩斿洖鏀惰棌缁撴灉
   */
  async favoriteArticle(articleId) {
    if (!articleId) {
      throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/favorite/article',
          method: 'POST',
          data: { article_id: articleId }
        })
      );
      
      // 娓呴櫎鏀惰棌鍒楄〃缂撳瓨
      cacheManager.remove('user_favorites_1');
      // 娓呴櫎鏂囩珷鏀惰棌鐘舵€佺紦瀛?      cacheManager.remove(`favorite_status_${articleId}`);
      
      showToast('鏀惰棌鎴愬姛');
      return result;
    } catch (error) {
      console.error('鏀惰棌鏂囩珷澶辫触:', error);
      showToast(error.message || '鏀惰棌澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鍙栨秷鏀惰棌鏂囩珷
   * @param {string} articleId - 鏂囩珷ID
   * @returns {Promise} 杩斿洖鍙栨秷鏀惰棌缁撴灉
   */
  async unfavoriteArticle(articleId) {
    if (!articleId) {
      throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/favorite/article',
          method: 'DELETE',
          data: { article_id: articleId }
        })
      );
      
      // 娓呴櫎鏀惰棌鍒楄〃缂撳瓨
      cacheManager.remove('user_favorites_1');
      // 娓呴櫎鏂囩珷鏀惰棌鐘舵€佺紦瀛?      cacheManager.remove(`favorite_status_${articleId}`);
      
      showToast('宸插彇娑堟敹钘?);
      return result;
    } catch (error) {
      console.error('鍙栨秷鏀惰棌澶辫触:', error);
      showToast(error.message || '鍙栨秷鏀惰棌澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 妫€鏌ユ枃绔犳槸鍚﹁鏀惰棌
   * @param {string} articleId - 鏂囩珷ID
   * @returns {Promise} 杩斿洖鏀惰棌鐘舵€?   */
  async checkFavorite(articleId) {
    if (!articleId) {
      throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
    }

    const cacheKey = `favorite_status_${articleId}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedStatus = cacheManager.get(cacheKey);
    if (cachedStatus !== undefined) {
      return cachedStatus;
    }

    try {
      const status = await retryRequest(() => 
        request({
          url: `/user/favorite/article/${articleId}/check`,
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(cacheKey, status, 300); // 5鍒嗛挓缂撳瓨
      
      return status;
    } catch (error) {
      console.error('妫€鏌ユ敹钘忕姸鎬佸け璐?', error);
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鏀惰棌鐨勬枃绔犲垪琛?   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @returns {Promise} 杩斿洖鏀惰棌鏂囩珷鍒楄〃
   */
  async getUserFavorites(params = { page: 1, page_size: 10 }) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(params)) {
      params = { page: 1, page_size: 10 };
    }
    
    // 鍙湁绗竴椤垫墠浣跨敤缂撳瓨
    const queryParams = { page: params.page || 1, page_size: params.page_size || 10 };
    const cacheKey = `user_favorites_${queryParams.page}`;
    
    if (queryParams.page === 1) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const favorites = await retryRequest(() => 
        request({
          url: '/user/favorites',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 鍙紦瀛樼涓€椤垫暟鎹?      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, favorites, 180); // 3鍒嗛挓缂撳瓨
      }
      
      return favorites;
    } catch (error) {
      console.error('鑾峰彇鏀惰棌鍒楄〃澶辫触:', error);
      // 濡傛灉鏄涓€椤典笖璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (queryParams.page === 1) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勬敹钘忓垪琛?);
          return cachedData;
        }
      }
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛璇勮鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @returns {Promise} 杩斿洖鐢ㄦ埛璇勮鍒楄〃
   */
  async getUserComments(params = { page: 1, page_size: 10 }) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(params)) {
      params = { page: 1, page_size: 10 };
    }
    
    // 鍙湁绗竴椤垫墠浣跨敤缂撳瓨
    const queryParams = { page: params.page || 1, page_size: params.page_size || 10 };
    const cacheKey = `user_comments_${queryParams.page}`;
    
    if (queryParams.page === 1) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const comments = await retryRequest(() => 
        request({
          url: '/user/comments',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 鍙紦瀛樼涓€椤垫暟鎹?      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, comments, 180); // 3鍒嗛挓缂撳瓨
      }
      
      return comments;
    } catch (error) {
      console.error('鑾峰彇璇勮鍒楄〃澶辫触:', error);
      // 濡傛灉鏄涓€椤典笖璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (queryParams.page === 1) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勮瘎璁哄垪琛?);
          return cachedData;
        }
      }
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鍦板潃鍒楄〃
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛屼笉浣跨敤缂撳瓨
   * @returns {Promise} 杩斿洖鍦板潃鍒楄〃
   */
  async getUserAddresses(forceRefresh = false) {
    // 灏濊瘯浠庣紦瀛樿幏鍙?    if (!forceRefresh) {
      const cachedAddresses = cacheManager.get(CACHE_KEYS.USER_ADDRESSES);
      if (cachedAddresses) {
        return cachedAddresses;
      }
    }

    try {
      const addresses = await retryRequest(() => 
        request({
          url: '/user/addresses',
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(CACHE_KEYS.USER_ADDRESSES, addresses, 300); // 5鍒嗛挓缂撳瓨
      
      return addresses;
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛鍦板潃鍒楄〃澶辫触:', error);
      // 濡傛灉璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      const cachedAddresses = cacheManager.get(CACHE_KEYS.USER_ADDRESSES);
      if (cachedAddresses) {
        console.log('浣跨敤缂撳瓨鐨勫湴鍧€鍒楄〃');
        return cachedAddresses;
      }
      throw error;
    }
  },

  /**
   * 娣诲姞鏂板湴鍧€
   * @param {Object} addressData - 鍦板潃鏁版嵁
   * @returns {Promise} 杩斿洖娣诲姞缁撴灉
   */
  async addAddress(addressData) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(addressData)) {
      throw new Error('鍦板潃鏁版嵁鏍煎紡涓嶆纭?);
    }
    
    // 鍩烘湰瀛楁楠岃瘉
    const requiredFields = ['name', 'phone', 'province', 'city', 'district', 'detail_address'];
    for (const field of requiredFields) {
      if (!addressData[field] || !validator.isString(addressData[field])) {
        throw new Error(`鍦板潃淇℃伅涓嶅畬鏁达紝璇峰～鍐?{field === 'detail_address' ? '璇︾粏鍦板潃' : field}`);
      }
    }
    
    // 鎵嬫満鍙烽獙璇?    if (!validator.isValidPhone(addressData.phone)) {
      throw new Error('璇疯緭鍏ユ纭殑鎵嬫満鍙?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/addresses',
          method: 'POST',
          data: addressData
        })
      );
      
      // 娓呴櫎鍦板潃鍒楄〃缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      // 鏄剧ず鎴愬姛鎻愮ず
      showToast('娣诲姞鍦板潃鎴愬姛');
      
      return result;
    } catch (error) {
      console.error('娣诲姞鍦板潃澶辫触:', error);
      showToast(error.message || '娣诲姞鍦板潃澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鏇存柊鍦板潃
   * @param {string} addressId - 鍦板潃ID
   * @param {Object} addressData - 鍦板潃鏁版嵁
   * @returns {Promise} 杩斿洖鏇存柊缁撴灉
   */
  async updateAddress(addressId, addressData) {
    // 鏁版嵁楠岃瘉
    if (!addressId) {
      throw new Error('鍦板潃ID涓嶈兘涓虹┖');
    }
    
    if (!validator.isObject(addressData)) {
      throw new Error('鍦板潃鏁版嵁鏍煎紡涓嶆纭?);
    }
    
    // 鍩烘湰瀛楁楠岃瘉
    const requiredFields = ['name', 'phone', 'province', 'city', 'district', 'detail_address'];
    for (const field of requiredFields) {
      if (addressData.hasOwnProperty(field) && (!addressData[field] || !validator.isString(addressData[field]))) {
        throw new Error(`鍦板潃淇℃伅涓嶅畬鏁达紝璇峰～鍐?{field === 'detail_address' ? '璇︾粏鍦板潃' : field}`);
      }
    }
    
    // 鎵嬫満鍙烽獙璇?    if (addressData.phone && !validator.isValidPhone(addressData.phone)) {
      throw new Error('璇疯緭鍏ユ纭殑鎵嬫満鍙?);
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/addresses/${addressId}`,
          method: 'PUT',
          data: addressData
        })
      );
      
      // 娓呴櫎鍦板潃鍒楄〃缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      showToast('鍦板潃鏇存柊鎴愬姛');
      return result;
    } catch (error) {
      console.error('鏇存柊鍦板潃澶辫触:', error);
      showToast(error.message || '鏇存柊鍦板潃澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鍒犻櫎鍦板潃
   * @param {string} addressId - 鍦板潃ID
   * @returns {Promise} 杩斿洖鍒犻櫎缁撴灉
   */
  async deleteAddress(addressId) {
    if (!addressId) {
      throw new Error('鍦板潃ID涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/addresses/${addressId}`,
          method: 'DELETE'
        })
      );
      
      // 娓呴櫎鍦板潃鍒楄〃缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      showToast('鍦板潃宸插垹闄?);
      return result;
    } catch (error) {
      console.error('鍒犻櫎鍦板潃澶辫触:', error);
      showToast(error.message || '鍒犻櫎鍦板潃澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 璁剧疆榛樿鍦板潃
   * @param {string} addressId - 鍦板潃ID
   * @returns {Promise} 杩斿洖璁剧疆缁撴灉
   */
  async setDefaultAddress(addressId) {
    if (!addressId) {
      throw new Error('鍦板潃ID涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: `/user/addresses/${addressId}/default`,
          method: 'POST'
        })
      );
      
      // 娓呴櫎鍦板潃鍒楄〃缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
      
      showToast('宸茶缃负榛樿鍦板潃');
      return result;
    } catch (error) {
      console.error('璁剧疆榛樿鍦板潃澶辫触:', error);
      showToast(error.message || '璁剧疆榛樿鍦板潃澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛绉垎淇℃伅
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛屼笉浣跨敤缂撳瓨
   * @returns {Promise} 杩斿洖绉垎淇℃伅
   */
  async getUserPoints(forceRefresh = false) {
    // 灏濊瘯浠庣紦瀛樿幏鍙?    if (!forceRefresh) {
      const cachedPoints = cacheManager.get(CACHE_KEYS.USER_POINTS);
      if (cachedPoints) {
        return cachedPoints;
      }
    }

    try {
      const points = await retryRequest(() => 
        request({
          url: '/user/points',
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(CACHE_KEYS.USER_POINTS, points, 180); // 3鍒嗛挓缂撳瓨
      
      return points;
    } catch (error) {
      console.error('鑾峰彇绉垎淇℃伅澶辫触:', error);
      // 濡傛灉璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      const cachedPoints = cacheManager.get(CACHE_KEYS.USER_POINTS);
      if (cachedPoints) {
        console.log('浣跨敤缂撳瓨鐨勭Н鍒嗕俊鎭?);
        return cachedPoints;
      }
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛绉垎鍘嗗彶
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @returns {Promise} 杩斿洖绉垎鍘嗗彶
   */
  async getUserPointsHistory(params = { page: 1, page_size: 10 }) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(params)) {
      params = { page: 1, page_size: 10 };
    }
    
    // 鍙湁绗竴椤垫墠浣跨敤缂撳瓨
    const queryParams = { page: params.page || 1, page_size: params.page_size || 10 };
    const cacheKey = `user_points_history_${queryParams.page}`;
    
    if (queryParams.page === 1) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const history = await retryRequest(() => 
        request({
          url: '/user/points/history',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 鍙紦瀛樼涓€椤垫暟鎹?      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, history, 180); // 3鍒嗛挓缂撳瓨
      }
      
      return history;
    } catch (error) {
      console.error('鑾峰彇绉垎鍘嗗彶澶辫触:', error);
      // 濡傛灉鏄涓€椤典笖璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (queryParams.page === 1) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('浣跨敤缂撳瓨鐨勭Н鍒嗗巻鍙?);
          return cachedData;
        }
      }
      throw error;
    }
  },

  /**
   * 绛惧埌鍔熻兘
   * @returns {Promise} 杩斿洖绛惧埌缁撴灉
   */
  async signIn() {
    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/signin',
          method: 'POST'
        })
      );
      
      // 娓呴櫎绛惧埌鐩稿叧缂撳瓨
      cacheManager.remove(CACHE_KEYS.USER_SIGNIN_HISTORY);
      cacheManager.remove('user_checkin_status');
      
      showToast(`绛惧埌鎴愬姛锛岃幏寰?{result.points || 0}绉垎`);
      return result;
    } catch (error) {
      console.error('鐢ㄦ埛绛惧埌澶辫触:', error);
      showToast(error.message || '绛惧埌澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鑾峰彇绛惧埌鐘舵€?   * @returns {Promise} 杩斿洖绛惧埌鐘舵€?   */
  async getSignInStatus() {
    const cacheKey = 'user_checkin_status';
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedStatus = cacheManager.get(cacheKey);
    if (cachedStatus) {
      return cachedStatus;
    }

    try {
      const status = await retryRequest(() => 
        request({
          url: '/user/signin/status',
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(cacheKey, status, 60); // 1鍒嗛挓缂撳瓨
      
      return status;
    } catch (error) {
      console.error('鑾峰彇绛惧埌鐘舵€佸け璐?', error);
      throw error;
    }
  },

  /**
   * 鑾峰彇绛惧埌鍘嗗彶
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛屼笉浣跨敤缂撳瓨
   * @returns {Promise} 杩斿洖绛惧埌鍘嗗彶
   */
  async getSignInHistory(params = { page: 1, page_size: 30 }, forceRefresh = false) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 30
    };

    // 鍙湁绗竴椤垫墠浣跨敤缂撳瓨
    if (!forceRefresh && queryParams.page === 1) {
      const cacheKey = `${CACHE_KEYS.USER_SIGNIN_HISTORY}`;
      const cachedHistory = cacheManager.get(cacheKey);
      if (cachedHistory) {
        return cachedHistory;
      }
    }

    try {
      const history = await retryRequest(() => 
        request({
          url: '/user/signin/history',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 鍙湁绗竴椤垫墠缂撳瓨
      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_SIGNIN_HISTORY}`;
        cacheManager.set(cacheKey, history, 180); // 3鍒嗛挓缂撳瓨
      }
      
      return history;
    } catch (error) {
      console.error('鑾峰彇绛惧埌鍘嗗彶澶辫触:', error);
      // 濡傛灉鏄涓€椤典笖璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_SIGNIN_HISTORY}`;
        const cachedHistory = cacheManager.get(cacheKey);
        if (cachedHistory) {
          console.log('浣跨敤缂撳瓨鐨勭鍒板巻鍙?);
          return cachedHistory;
        }
      }
      throw error;
    }
  },

  /**
   * 妫€鏌ョ敤鎴锋槸鍚﹀凡鐧诲綍
   * @returns {boolean} 鏄惁宸茬櫥褰?   */
  isLoggedIn() {
    return request.getToken() !== null;
  },

  /**
   * 鑾峰彇缂撳瓨鐨勭敤鎴蜂俊鎭?   * @returns {Object|null} 鐢ㄦ埛淇℃伅瀵硅薄鎴杗ull
   */
  getCachedUserInfo() {
    try {
      const userInfo = wx.getStorageSync(USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('鑾峰彇缂撳瓨鐢ㄦ埛淇℃伅澶辫触:', error);
      return null;
    }
  },

  /**
   * 缂撳瓨鐢ㄦ埛淇℃伅
   * @param {Object} userInfo - 鐢ㄦ埛淇℃伅
   */
  cacheUserInfo(userInfo) {
    try {
      wx.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error('缂撳瓨鐢ㄦ埛淇℃伅澶辫触:', error);
    }
  },

  /**
   * 娓呴櫎鐢ㄦ埛鐧诲綍鐘舵€佸拰缂撳瓨
   * @returns {boolean} 鎿嶄綔鏄惁鎴愬姛
   */
  clearLoginStatus() {
    try {
      // 娓呴櫎鐢ㄦ埛淇℃伅缂撳瓨
      wx.removeStorageSync(USER_INFO_KEY);
      
      // 娓呴櫎鐢ㄦ埛鍋忓ソ璁剧疆缂撳瓨
      wx.removeStorageSync(USER_PREFERENCES_KEY);
      
      // 娓呴櫎鐢ㄦ埛鐩稿叧缂撳瓨
      cacheManager.clearAll();
      
      // 娓呴櫎璁よ瘉浠ょ墝
      request.removeToken();
      
      console.log('鐢ㄦ埛鐧诲綍鐘舵€佸凡娓呴櫎');
      return true;
    } catch (error) {
      console.error('娓呴櫎鐧诲綍鐘舵€佸け璐?', error);
      // 灏濊瘯娓呯悊鐗瑰畾鐨勭紦瀛橀敭锛岀‘淇濆叧閿暟鎹娓呴櫎
      try {
        wx.removeStorageSync(USER_INFO_KEY);
        request.removeToken();
      } catch (e) {
        console.error('娓呴櫎鍏抽敭缂撳瓨澶辫触:', e);
      }
      return false;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鍏虫敞鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @returns {Promise} 杩斿洖鍏虫敞鍒楄〃
   */
  async getUserFollowing(params = { page: 1, page_size: 20 }) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 20
    };

    try {
      return await retryRequest(() => 
        request({
          url: '/user/following',
          method: 'GET',
          data: queryParams
        })
      );
    } catch (error) {
      console.error('鑾峰彇鍏虫敞鍒楄〃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛绮変笣鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @returns {Promise} 杩斿洖绮変笣鍒楄〃
   */
  async getUserFollowers(params = { page: 1, page_size: 20 }) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 20
    };

    try {
      return await retryRequest(() => 
        request({
          url: '/user/followers',
          method: 'GET',
          data: queryParams
        })
      );
    } catch (error) {
      console.error('鑾峰彇绮変笣鍒楄〃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鍏虫敞鐢ㄦ埛
   * @param {number|string} userId - 瑕佸叧娉ㄧ殑鐢ㄦ埛ID
   * @returns {Promise} 杩斿洖鍏虫敞缁撴灉
   */
  async followUser(userId) {
    if (!userId) {
      throw new Error('鐢ㄦ埛ID涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/follow',
          method: 'POST',
          data: { user_id: userId }
        })
      );
      
      showToast('鍏虫敞鎴愬姛');
      return result;
    } catch (error) {
      console.error('鍏虫敞鐢ㄦ埛澶辫触:', error);
      showToast(error.message || '鍏虫敞澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 鍙栨秷鍏虫敞
   * @param {number|string} userId - 瑕佸彇娑堝叧娉ㄧ殑鐢ㄦ埛ID
   * @returns {Promise} 杩斿洖鍙栨秷鍏虫敞缁撴灉
   */
  async unfollowUser(userId) {
    if (!userId) {
      throw new Error('鐢ㄦ埛ID涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/unfollow',
          method: 'POST',
          data: { user_id: userId }
        })
      );
      
      showToast('宸插彇娑堝叧娉?);
      return result;
    } catch (error) {
      console.error('鍙栨秷鍏虫敞澶辫触:', error);
      showToast(error.message || '鍙栨秷鍏虫敞澶辫触锛岃閲嶈瘯');
      throw error;
    }
  },

  /**
   * 妫€鏌ユ槸鍚﹀凡鍏虫敞鐢ㄦ埛
   * @param {number|string} userId - 鐢ㄦ埛ID
   * @returns {Promise} 杩斿洖鍏虫敞鐘舵€?   */
  async checkFollowing(userId) {
    if (!userId) {
      throw new Error('鐢ㄦ埛ID涓嶈兘涓虹┖');
    }

    const cacheKey = `following_status_${userId}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedStatus = cacheManager.get(cacheKey);
    if (cachedStatus !== undefined) {
      return cachedStatus;
    }

    try {
      const status = await retryRequest(() => 
        request({
          url: `/user/check-following/${userId}`,
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(cacheKey, status, 300); // 5鍒嗛挓缂撳瓨
      
      return status;
    } catch (error) {
      console.error('妫€鏌ュ叧娉ㄧ姸鎬佸け璐?', error);
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鎺ㄨ崘鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛屼笉浣跨敤缂撳瓨
   * @returns {Promise} 杩斿洖鎺ㄨ崘鐢ㄦ埛鍒楄〃
   */
  async getUserRecommendations(params = { page: 1, page_size: 20 }, forceRefresh = false) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 20
    };

    // 鍙湁绗竴椤垫墠浣跨敤缂撳瓨
    const cacheKey = `user_recommendations_${queryParams.page}`;
    
    if (!forceRefresh && queryParams.page === 1) {
      const cachedRecommendations = cacheManager.get(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
    }

    try {
      const recommendations = await retryRequest(() => 
        request({
          url: '/user/recommendations',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 鍙紦瀛樼涓€椤垫暟鎹?      if (queryParams.page === 1) {
        cacheManager.set(cacheKey, recommendations, 300); // 5鍒嗛挓缂撳瓨
      }
      
      return recommendations;
    } catch (error) {
      console.error('鑾峰彇鎺ㄨ崘鐢ㄦ埛澶辫触:', error);
      // 濡傛灉鏄涓€椤典笖璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (queryParams.page === 1) {
        const cachedRecommendations = cacheManager.get(cacheKey);
        if (cachedRecommendations) {
          console.log('浣跨敤缂撳瓨鐨勭敤鎴锋帹鑽?);
          return cachedRecommendations;
        }
      }
      throw error;
    }
  },

  /**
   * 娓呴櫎鎸囧畾绫诲瀷鐨勭紦瀛?   * @param {string} cacheType - 缂撳瓨绫诲瀷锛屽彲閫夊€硷細'profile', 'coupons', 'addresses', 'points'
   */
  clearCache(cacheType) {
    switch (cacheType) {
      case 'profile':
        cacheManager.remove(CACHE_KEYS.USER_PROFILE);
        break;
      case 'coupons':
        // 娓呴櫎鎵€鏈夌姸鎬佺殑浼樻儬鍒哥紦瀛?        ['valid', 'used', 'expired', 'all'].forEach(status => {
          cacheManager.remove(`${CACHE_KEYS.USER_COUPONS}_${status}`);
        });
        break;
      case 'addresses':
        cacheManager.remove(CACHE_KEYS.USER_ADDRESSES);
        break;
      case 'points':
        cacheManager.remove(CACHE_KEYS.USER_POINTS);
        break;
      default:
        // 娓呴櫎鎵€鏈夌紦瀛?        cacheManager.clearAll();
    }
  },
  
  /**
   * 娓呴櫎鎵€鏈夌紦瀛?   * @returns {boolean} 鎿嶄綔鏄惁鎴愬姛
   */
  clearAllCache() {
    try {
      cacheManager.clearAll();
      console.log('鎵€鏈夌紦瀛樺凡娓呴櫎');
      return true;
    } catch (error) {
      console.error('娓呴櫎缂撳瓨澶辫触:', error);
      return false;
    }
  },
  
  /**
   * 娓呴櫎鐗瑰畾绫诲瀷鐨勭紦瀛?   * @param {string|Array} cacheType - 缂撳瓨绫诲瀷锛屽彲浠ユ槸鍗曚釜閿悕鎴栭敭鍚嶆暟缁?   * @returns {boolean} 鎿嶄綔鏄惁鎴愬姛
   */
  clearSpecificCache(cacheType) {
    try {
      if (Array.isArray(cacheType)) {
        cacheType.forEach(key => {
          if (typeof key === 'string') {
            cacheManager.remove(key);
          }
        });
      } else if (typeof cacheType === 'string') {
        cacheManager.remove(cacheType);
      } else {
        throw new Error('缂撳瓨绫诲瀷蹇呴』鏄瓧绗︿覆鎴栧瓧绗︿覆鏁扮粍');
      }
      console.log(`缂撳瓨宸叉竻闄? ${cacheType}`);
      return true;
    } catch (error) {
      console.error('娓呴櫎鎸囧畾缂撳瓨澶辫触:', error);
      return false;
    }
  },
  
  /**
   * 娓呴櫎鐢ㄦ埛鐩稿叧鎵€鏈夌紦瀛?   * @returns {boolean} 鎿嶄綔鏄惁鎴愬姛
   */
  clearUserCache() {
    try {
      // 娓呴櫎鎵€鏈夐瀹氫箟鐨勭敤鎴风紦瀛橀敭
      Object.values(CACHE_KEYS).forEach(key => {
        cacheManager.remove(key);
      });
      
      // 娓呴櫎鍙兘鐨勫姩鎬佺紦瀛橀敭锛堝鏀惰棌鐘舵€併€佸叧娉ㄧ姸鎬佺瓑锛?      const cacheKeys = wx.getStorageInfoSync().keys || [];
      cacheKeys.forEach(key => {
        // 娓呴櫎浠ョ壒瀹氬墠缂€寮€澶寸殑缂撳瓨閿?        if (key.startsWith('favorite_status_') || 
            key.startsWith('following_status_') ||
            key.startsWith('coupon_detail_') ||
            key.startsWith('user_favorites_') ||
            key.startsWith('user_comments_') ||
            key.startsWith('user_points_history_') ||
            key.startsWith('user_recommendations_') ||
            key.startsWith('user_following_') ||
            key.startsWith('user_followers_')) {
          cacheManager.remove(key);
        }
      });
      
      console.log('鐢ㄦ埛鐩稿叧缂撳瓨宸叉竻闄?);
      return true;
    } catch (error) {
      console.error('娓呴櫎鐢ㄦ埛缂撳瓨澶辫触:', error);
      return false;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鍋忓ソ璁剧疆
   * @returns {Object} 鐢ㄦ埛鍋忓ソ璁剧疆
   */
  getUserPreferences() {
    try {
      const preferences = wx.getStorageSync(USER_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛鍋忓ソ璁剧疆澶辫触:', error);
      return {};
    }
  },

  /**
   * 璁剧疆鐢ㄦ埛鍋忓ソ璁剧疆
   * @param {Object} preferences - 鍋忓ソ璁剧疆瀵硅薄
   */
  setUserPreferences(preferences) {
    try {
      wx.setStorageSync(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('璁剧疆鐢ㄦ埛鍋忓ソ璁剧疆澶辫触:', error);
    }
  },

  /**
   * 鏇存柊鍗曚釜鐢ㄦ埛鍋忓ソ璁剧疆
   * @param {string} key - 鍋忓ソ璁剧疆閿悕
   * @param {*} value - 鍋忓ソ璁剧疆鍊?   */
  updateUserPreference(key, value) {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    this.setUserPreferences(preferences);
  },

  /**
   * 鑾峰彇鐢ㄦ埛浼樻儬鍒稿垪琛?   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.page_size - 姣忛〉鏁伴噺
   * @param {string} params.status - 浼樻儬鍒哥姸鎬?(all, valid, used, expired)
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛屼笉浣跨敤缂撳瓨
   * @returns {Promise} 杩斿洖浼樻儬鍒稿垪琛?   */
  async getUserCoupons(params = { page: 1, page_size: 10, status: 'valid' }, forceRefresh = false) {
    // 榛樿鍙傛暟澶勭悊
    const queryParams = {
      page: params.page || 1,
      page_size: params.page_size || 10,
      status: params.status || 'valid'
    };

    // 鍙湁绗竴椤垫墠浣跨敤缂撳瓨
    if (!forceRefresh && queryParams.page === 1) {
      const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${queryParams.status}`;
      const cachedCoupons = cacheManager.get(cacheKey);
      if (cachedCoupons) {
        return cachedCoupons;
      }
    }

    try {
      const coupons = await retryRequest(() => 
        request({
          url: '/user/coupons',
          method: 'GET',
          data: queryParams
        })
      );
      
      // 鍙湁绗竴椤垫墠缂撳瓨
      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${queryParams.status}`;
        cacheManager.set(cacheKey, coupons, 180); // 3鍒嗛挓缂撳瓨
      }
      
      return coupons;
    } catch (error) {
      console.error('鑾峰彇浼樻儬鍒稿垪琛ㄥけ璐?', error);
      // 濡傛灉鏄涓€椤典笖璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (queryParams.page === 1) {
        const cacheKey = `${CACHE_KEYS.USER_COUPONS}_${queryParams.status}`;
        const cachedCoupons = cacheManager.get(cacheKey);
        if (cachedCoupons) {
          console.log('浣跨敤缂撳瓨鐨勪紭鎯犲埜鍒楄〃');
          return cachedCoupons;
        }
      }
      throw error;
    }
  },

  /**
   * 鑾峰彇浼樻儬鍒歌鎯?   * @param {string} couponId - 浼樻儬鍒窱D
   * @returns {Promise} 杩斿洖浼樻儬鍒歌鎯?   */
  async getCouponDetail(couponId) {
    if (!couponId) {
      throw new Error('浼樻儬鍒窱D涓嶈兘涓虹┖');
    }

    const cacheKey = `coupon_detail_${couponId}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedDetail = cacheManager.get(cacheKey);
    if (cachedDetail) {
      return cachedDetail;
    }

    try {
      const detail = await retryRequest(() => 
        request({
          url: `/user/coupons/${couponId}`,
          method: 'GET'
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(cacheKey, detail, 300); // 5鍒嗛挓缂撳瓨
      
      return detail;
    } catch (error) {
      console.error('鑾峰彇浼樻儬鍒歌鎯呭け璐?', error);
      throw error;
    }
  },

  /**
   * 鍏戞崲浼樻儬鍒?   * @param {string} couponCode - 浼樻儬鍒稿厬鎹㈢爜
   * @returns {Promise} 杩斿洖鍏戞崲缁撴灉
   */
  async redeemCoupon(couponCode) {
    if (!validator.isString(couponCode) || couponCode.trim() === '') {
      throw new Error('浼樻儬鍒哥爜涓嶈兘涓虹┖');
    }

    try {
      const result = await retryRequest(() => 
        request({
          url: '/user/coupons/redeem',
          method: 'POST',
          data: { coupon_code: couponCode.trim() }
        })
      );
      
      // 娓呴櫎浼樻儬鍒稿垪琛ㄧ紦瀛?      cacheManager.remove(`${CACHE_KEYS.USER_COUPONS}_valid`);
      cacheManager.remove(`${CACHE_KEYS.USER_COUPONS}_all`);
      
      showToast('鍏戞崲鎴愬姛');
      return result;
    } catch (error) {
      console.error('鍏戞崲浼樻儬鍒稿け璐?', error);
      showToast(error.message || '鍏戞崲澶辫触锛岃妫€鏌ヤ紭鎯犲埜鐮佹槸鍚︽纭?);
      throw error;
    }
  },

  /**
   * 鑾峰彇鍙敤鐨勪紭鎯犲埜鍒楄〃锛堢敤浜庤鍗曢〉闈級
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.total - 璁㈠崟鎬婚噾棰?   * @param {Array} params.productIds - 浜у搧ID鍒楄〃
   * @returns {Promise} 杩斿洖鍙敤浼樻儬鍒稿垪琛?   */
  async getAvailableCoupons(params = {}) {
    // 鏁版嵁楠岃瘉
    if (!validator.isObject(params)) {
      params = {};
    }
    
    const cacheKey = 'available_coupons';
    
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cachedCoupons = cacheManager.get(cacheKey);
    if (cachedCoupons) {
      return cachedCoupons;
    }

    try {
      const coupons = await retryRequest(() => 
        request({
          url: '/user/coupons/available',
          method: 'GET',
          data: params
        })
      );
      
      // 鏇存柊缂撳瓨
      cacheManager.set(cacheKey, coupons, 120); // 2鍒嗛挓缂撳瓨
      
      return coupons;
    } catch (error) {
      console.error('鑾峰彇鍙敤浼樻儬鍒稿け璐?', error);
      // 濡傛灉璇锋眰澶辫触锛屽皾璇曡繑鍥炵紦瀛樻暟鎹?      if (cachedCoupons) {
        console.log('浣跨敤缂撳瓨鐨勫彲鐢ㄤ紭鎯犲埜');
        return cachedCoupons;
      }
      throw error;
    }
  }
};

export default userService;
