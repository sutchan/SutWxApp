// notification-service.js - 娑堟伅閫氱煡鐩稿叧鏈嶅姟妯″潡
// 澶勭悊绯荤粺娑堟伅銆佽瘎璁洪€氱煡绛夊姛鑳?
// 鏄惁浣跨敤妯℃嫙鏁版嵁锛堝紑鍙戦樁娈典娇鐢級
const USE_MOCK_DATA = true;

import api from './api';
import { getStorage, setStorage } from './global';

// 濡傛灉浣跨敤妯℃嫙鏁版嵁锛屽垯瀵煎叆妯℃嫙鏁版嵁鏈嶅姟
let mockService;
if (USE_MOCK_DATA) {
  try {
    mockService = require('./notification-mock');
  } catch (e) {
    console.warn('鏃犳硶瀵煎叆妯℃嫙閫氱煡鏈嶅姟:', e);
  }
}

// 缂撳瓨閰嶇疆
const CACHE_DURATION = {
  NOTIFICATIONS: 1 * 60 * 1000 // 1鍒嗛挓
};

/**
 * 鑾峰彇閫氱煡鍒楄〃
 * @param {Object} params - 鏌ヨ鍙傛暟
 * @param {number} params.page - 椤电爜锛岄粯璁?
 * @param {number} params.per_page - 姣忛〉鏁伴噺锛岄粯璁?0
 * @param {string} params.type - 閫氱煡绫诲瀷绛涢€? * @param {boolean} params.unread_only - 鏄惁鍙幏鍙栨湭璇婚€氱煡锛岄粯璁alse
 * @returns {Promise<Object>} - 鍖呭惈閫氱煡鍒楄〃鍜屾€绘暟鐨勫璞? */
export const getNotifications = async (params = {}) => {
  try {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 娣诲姞鍙€夌瓫閫夊弬鏁?    if (params.type) {
      queryParams.type = params.type;
    }
    
    if (params.unread_only) {
      queryParams.unread_only = true;
    }
    
    // 鐢熸垚缂撳瓨閿紙浠呯涓€椤典娇鐢ㄧ紦瀛橈級
    const cacheKey = `cache_notifications_${JSON.stringify(queryParams)}`;
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹紙浠呯涓€椤典笖涓嶆槸鍙湅鏈鏃朵娇鐢ㄧ紦瀛橈級
    if (queryParams.page === 1 && !params.unread_only) {
      const cachedData = getStorage(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION.NOTIFICATIONS)) {
        return cachedData.data;
      }
    }
    
    // 璋冪敤API
    const result = await api.get('/notifications', queryParams);
    
    // 缂撳瓨绗竴椤垫暟鎹?    if (queryParams.page === 1 && !params.unread_only) {
      setStorage(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error('鑾峰彇閫氱煡鍒楄〃澶辫触:', error);
    // 濡傛灉鍚敤浜嗘ā鎷熸暟鎹笖鏈夊彲鐢ㄧ殑妯℃嫙鏈嶅姟锛屽垯浣跨敤妯℃嫙鏁版嵁
    if (USE_MOCK_DATA && mockService && mockService.getNotifications) {
      console.log('浣跨敤妯℃嫙鏁版嵁鑾峰彇閫氱煡鍒楄〃');
      return await mockService.getNotifications(params);
    }
    throw error;
  }
};

/**
 * 鑾峰彇鏈閫氱煡鏁伴噺
 * @returns {Promise<number>} - 鏈閫氱煡鏁伴噺
 */
export const getUnreadNotificationCount = async () => {
  try {
    // 璋冪敤API
    const result = await api.get('/notifications/unread-count');
    return result.count || 0;
  } catch (error) {
    console.error('鑾峰彇鏈閫氱煡鏁伴噺澶辫触:', error);
    // 濡傛灉鍚敤浜嗘ā鎷熸暟鎹笖鏈夊彲鐢ㄧ殑妯℃嫙鏈嶅姟锛屽垯浣跨敤妯℃嫙鏁版嵁
    if (USE_MOCK_DATA && mockService && mockService.getUnreadNotificationCount) {
      console.log('浣跨敤妯℃嫙鏁版嵁鑾峰彇鏈閫氱煡鏁伴噺');
      return await mockService.getUnreadNotificationCount();
    }
    // 澶辫触鏃惰繑鍥?锛屼笉褰卞搷鐢ㄦ埛浣撻獙
    return 0;
  }
};

/**
 * 鏍囪閫氱煡涓哄凡璇? * @param {number|string} notificationId - 閫氱煡ID
 * @returns {Promise<Object>} - 杩斿洖鏇存柊鍚庣殑閫氱煡瀵硅薄
 */
export const markAsRead = async (notificationId) => {
  try {
    // 璋冪敤API
    const result = await api.put(`/notifications/${notificationId}/read`);
    
    // 娓呴櫎缂撳瓨锛岀‘淇濅笅娆¤幏鍙栨渶鏂版暟鎹?    clearNotificationCache();
    
    // 纭繚缁撴灉涓寘鍚纭殑is_read瀛楁
    if (result && typeof result === 'object') {
      return { ...result, is_read: true };
    }
    
    return result;
  } catch (error) {
    console.error('鏍囪閫氱煡宸茶澶辫触:', error);
    // 濡傛灉鍚敤浜嗘ā鎷熸暟鎹笖鏈夊彲鐢ㄧ殑妯℃嫙鏈嶅姟锛屽垯浣跨敤妯℃嫙鏁版嵁
    if (USE_MOCK_DATA && mockService && mockService.markAsRead) {
      console.log('浣跨敤妯℃嫙鏁版嵁鏍囪閫氱煡宸茶');
      clearNotificationCache();
      const mockResult = await mockService.markAsRead(notificationId);
      // 纭繚妯℃嫙缁撴灉涔熷寘鍚纭殑is_read瀛楁
      if (mockResult && typeof mockResult === 'object') {
        return { ...mockResult, is_read: true };
      }
      return mockResult;
    }
    throw error;
  }
};

/**
 * 鏍囪鎵€鏈夐€氱煡涓哄凡璇? * @returns {Promise<boolean>} - 鏄惁鏍囪鎴愬姛
 */
export const markAllAsRead = async () => {
  try {
    // 璋冪敤API
    await api.put('/notifications/read-all');
    
    // 娓呴櫎缂撳瓨
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('鏍囪鎵€鏈夐€氱煡宸茶澶辫触:', error);
    // 濡傛灉鍚敤浜嗘ā鎷熸暟鎹笖鏈夊彲鐢ㄧ殑妯℃嫙鏈嶅姟锛屽垯浣跨敤妯℃嫙鏁版嵁
    if (USE_MOCK_DATA && mockService && mockService.markAllAsRead) {
      console.log('浣跨敤妯℃嫙鏁版嵁鏍囪鎵€鏈夐€氱煡宸茶');
      clearNotificationCache();
      await mockService.markAllAsRead();
      return true;
    }
    throw error;
  }
};

/**
 * 鍒犻櫎閫氱煡
 * @param {number|string} notificationId - 閫氱煡ID
 * @returns {Promise<boolean>} - 鏄惁鍒犻櫎鎴愬姛
 */
export const deleteNotification = async (notificationId) => {
  try {
    // 璋冪敤API
    await api.delete(`/notifications/${notificationId}`);
    
    // 娓呴櫎缂撳瓨
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('鍒犻櫎閫氱煡澶辫触:', error);
    throw error;
  }
};

/**
 * 鍒犻櫎鎵€鏈夐€氱煡
 * @returns {Promise<boolean>} - 鏄惁鍒犻櫎鎴愬姛
 */
export const deleteAllNotifications = async () => {
  try {
    // 璋冪敤API
    await api.delete('/notifications');
    
    // 娓呴櫎缂撳瓨
    clearNotificationCache();
    
    return true;
  } catch (error) {
    console.error('鍒犻櫎鎵€鏈夐€氱煡澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇閫氱煡璇︽儏
 * @param {number|string} notificationId - 閫氱煡ID
 * @returns {Promise<Object>} - 杩斿洖閫氱煡璇︽儏
 */
export const getNotificationDetail = async (notificationId) => {
  try {
    // 灏濊瘯浠庣紦瀛樿幏鍙?    const cacheKey = `notification_detail_${notificationId}`;
    const cachedData = getStorage(cacheKey);
    if (cachedData) {
      // 寮傛鏍囪涓哄凡璇?      if (!cachedData.is_read) {
        markAsRead(notificationId).catch(err => {
          console.error('寮傛鏍囪宸茶澶辫触:', err);
        });
      }
      return cachedData;
    }

    // 璋冪敤API
    const result = await api.get(`/notifications/${notificationId}`);
    
    // 缂撳瓨閫氱煡璇︽儏
    setStorage(cacheKey, result);
    
    // 鑷姩鏍囪涓哄凡璇?    if (!result.is_read) {
      await markAsRead(notificationId);
    }
    
    return result;
  } catch (error) {
    console.error('鑾峰彇閫氱煡璇︽儏澶辫触:', error);
    // 濡傛灉鍚敤浜嗘ā鎷熸暟鎹笖鏈夊彲鐢ㄧ殑妯℃嫙鏈嶅姟锛屽垯浣跨敤妯℃嫙鏁版嵁
    if (USE_MOCK_DATA && mockService && mockService.getNotificationDetail) {
      console.log('浣跨敤妯℃嫙鏁版嵁鑾峰彇閫氱煡璇︽儏');
      return await mockService.getNotificationDetail(notificationId);
    }
    throw error;
  }
};

/**
 * 璁㈤槄绯荤粺閫氱煡
 * @param {Object} options - 璁㈤槄閫夐」
 * @param {boolean} options.system - 鏄惁璁㈤槄绯荤粺閫氱煡
 * @param {boolean} options.comment - 鏄惁璁㈤槄璇勮閫氱煡
 * @param {boolean} options.follow - 鏄惁璁㈤槄鍏虫敞閫氱煡
 * @param {boolean} options.like - 鏄惁璁㈤槄鐐硅禐閫氱煡
 * @returns {Promise<Object>} - 杩斿洖鏇存柊鍚庣殑璁㈤槄璁剧疆
 */
export const updateNotificationSettings = async (options = {}) => {
  try {
    // 鏋勫缓璁㈤槄鏁版嵁
    const settingsData = {
      system: options.system !== undefined ? options.system : true,
      comment: options.comment !== undefined ? options.comment : true,
      follow: options.follow !== undefined ? options.follow : true,
      like: options.like !== undefined ? options.like : true
    };
    
    // 璋冪敤API
    return await api.put('/notifications/settings', settingsData);
  } catch (error) {
    console.error('鏇存柊閫氱煡璁剧疆澶辫触:', error);
    throw error;
  }
};

/**
 * 鑾峰彇閫氱煡璁剧疆
 * @returns {Promise<Object>} - 杩斿洖褰撳墠閫氱煡璁剧疆
 */
export const getNotificationSettings = async () => {
  try {
    // 璋冪敤API
    return await api.get('/notifications/settings');
  } catch (error) {
    console.error('鑾峰彇閫氱煡璁剧疆澶辫触:', error);
    // 杩斿洖榛樿璁剧疆
    return {
      system: true,
      comment: true,
      follow: true,
      like: true
    };
  }
};

/**
 * 澶勭悊閫氱煡鐐瑰嚮浜嬩欢
 * @param {Object} notification - 閫氱煡瀵硅薄
 * @returns {boolean} - 鏄惁鎴愬姛澶勭悊
 */
export const handleNotificationClick = (notification) => {
  try {
    // 鏍规嵁閫氱煡绫诲瀷璺宠浆鍒扮浉搴旈〉闈?    switch (notification.type) {
      case 'comment':
        // 璺宠浆鍒拌瘎璁烘墍鍦ㄧ殑鏂囩珷椤甸潰锛屽苟婊氬姩鍒拌瘎璁轰綅缃?        wx.navigateTo({
          url: `/pages/article/article?id=${notification.post_id}&comment_id=${notification.comment_id}`
        });
        break;
      
      case 'follow':
        // 璺宠浆鍒板叧娉ㄨ€呯殑鐢ㄦ埛椤甸潰
        wx.navigateTo({
          url: `/pages/user/profile?id=${notification.user_id}`
        });
        break;
      
      case 'system':
        // 璺宠浆鍒扮郴缁熼€氱煡璇︽儏椤?        wx.navigateTo({
          url: `/pages/notification/detail?id=${notification.id}`
        });
        break;
      
      case 'like':
        // 璺宠浆鍒扮偣璧炴墍鍦ㄧ殑鍐呭椤甸潰
        if (notification.post_id) {
          wx.navigateTo({
            url: `/pages/article/article?id=${notification.post_id}`
          });
        } else {
          // 榛樿璺宠浆鍒伴€氱煡鍒楄〃
          wx.navigateTo({
            url: '/pages/notification/list'
          });
        }
        break;
      
      default:
        // 榛樿璺宠浆鍒伴€氱煡鍒楄〃
        wx.navigateTo({
          url: '/pages/notification/list'
        });
    }
    
    // 鏍囪涓哄凡璇?    if (!notification.is_read) {
      markAsRead(notification.id).catch(err => {
        console.error('鑷姩鏍囪閫氱煡宸茶澶辫触:', err);
      });
    }
    
    return true;
  } catch (error) {
    console.error('澶勭悊閫氱煡鐐瑰嚮澶辫触:', error);
    return false;
  }
};

/**
 * 娓呴櫎閫氱煡鐩稿叧缂撳瓨
 */
export const clearNotificationCache = () => {
  try {
    const storage = wx.getStorageSync() || {};
    
    // 娓呴櫎鎵€鏈夐€氱煡鐩稿叧鐨勭紦瀛?    for (const key in storage) {
      if (key.startsWith('cache_notifications_') || key.startsWith('notification_detail_')) {
        wx.removeStorageSync(key);
      }
    }
  } catch (error) {
    console.error('娓呴櫎閫氱煡缂撳瓨澶辫触:', error);
  }
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationDetail,
  updateNotificationSettings,
  getNotificationSettings,
  handleNotificationClick,
  clearNotificationCache
};