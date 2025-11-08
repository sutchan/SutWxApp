// address-service.js - 鍦板潃绠＄悊鏈嶅姟妯″潡
// 澶勭悊鏀惰揣鍦板潃鐨勫鍒犳敼鏌ョ瓑鍔熻兘

import api from './api';
import { showToast, showLoading, hideLoading } from './global';

/**
 * 鑾峰彇鍦板潃鍒楄〃
 * @returns {Promise<Array>} - 杩斿洖鍦板潃鍒楄〃
 */
export const getAddresses = async () => {
  try {
    const result = await api.get('/addresses');
    return result.addresses || [];
  } catch (error) {
    console.error('鑾峰彇鍦板潃鍒楄〃澶辫触:', error);
    return [];
  }
};

/**
 * 鑾峰彇榛樿鍦板潃
 * @returns {Promise<Object|null>} - 杩斿洖榛樿鍦板潃鎴杗ull
 */
export const getDefaultAddress = async () => {
  try {
    const result = await api.get('/addresses/default');
    return result.address || null;
  } catch (error) {
    console.error('鑾峰彇榛樿鍦板潃澶辫触:', error);
    return null;
  }
};

/**
 * 鑾峰彇鍦板潃璇︽儏
 * @param {number|string} addressId - 鍦板潃ID
 * @returns {Promise<Object>} - 杩斿洖鍦板潃璇︽儏
 */
export const getAddressDetail = async (addressId) => {
  try {
    const result = await api.get(`/addresses/${addressId}`);
    
    if (result.code === 200 && result.address) {
      return result.address;
    } else {
      throw new Error(result.message || '鑾峰彇鍦板潃璇︽儏澶辫触');
    }
  } catch (error) {
    console.error('鑾峰彇鍦板潃璇︽儏澶辫触:', error);
    throw error;
  }
};

/**
 * 娣诲姞鏂板湴鍧€
 * @param {Object} addressData - 鍦板潃鏁版嵁
 * @param {string} addressData.name - 鏀朵欢浜哄鍚? * @param {string} addressData.phone - 鑱旂郴鐢佃瘽
 * @param {string} addressData.province - 鐪佷唤
 * @param {string} addressData.city - 鍩庡競
 * @param {string} addressData.district - 鍖哄幙
 * @param {string} addressData.detail - 璇︾粏鍦板潃
 * @param {boolean} addressData.is_default - 鏄惁榛樿鍦板潃
 * @returns {Promise<Object>} - 杩斿洖鍒涘缓鐨勫湴鍧€淇℃伅
 */
export const addAddress = async (addressData) => {
  try {
    // 楠岃瘉蹇呭～瀛楁
    if (!addressData.name || !addressData.phone || !addressData.detail) {
      throw new Error('璇峰～鍐欏畬鏁寸殑鍦板潃淇℃伅');
    }
    
    showLoading('淇濆瓨鍦板潃...');
    
    const result = await api.post('/addresses', addressData);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('鍦板潃淇濆瓨鎴愬姛', { icon: 'success' });
      return result.address;
    } else {
      throw new Error(result.message || '淇濆瓨鍦板潃澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('娣诲姞鍦板潃澶辫触:', error);
    showToast(error.message || '淇濆瓨鍦板潃澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鏇存柊鍦板潃
 * @param {number|string} addressId - 鍦板潃ID
 * @param {Object} addressData - 鍦板潃鏁版嵁
 * @returns {Promise<Object>} - 杩斿洖鏇存柊鍚庣殑鍦板潃淇℃伅
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    // 楠岃瘉蹇呭～瀛楁
    if (!addressData.name || !addressData.phone || !addressData.detail) {
      throw new Error('璇峰～鍐欏畬鏁寸殑鍦板潃淇℃伅');
    }
    
    showLoading('鏇存柊鍦板潃...');
    
    const result = await api.put(`/addresses/${addressId}`, addressData);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('鍦板潃鏇存柊鎴愬姛', { icon: 'success' });
      return result.address;
    } else {
      throw new Error(result.message || '鏇存柊鍦板潃澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鏇存柊鍦板潃澶辫触:', error);
    showToast(error.message || '鏇存柊鍦板潃澶辫触锛岃閲嶈瘯', { icon: 'none' });
    throw error;
  }
};

/**
 * 鍒犻櫎鍦板潃
 * @param {number|string} addressId - 鍦板潃ID
 * @returns {Promise<boolean>} - 鏄惁鍒犻櫎鎴愬姛
 */
export const deleteAddress = async (addressId) => {
  try {
    showLoading('鍒犻櫎鍦板潃...');
    
    const result = await api.delete(`/addresses/${addressId}`);
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('鍦板潃宸插垹闄?, { icon: 'success' });
      return true;
    } else {
      throw new Error(result.message || '鍒犻櫎鍦板潃澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('鍒犻櫎鍦板潃澶辫触:', error);
    showToast(error.message || '鍒犻櫎鍦板潃澶辫触锛岃閲嶈瘯', { icon: 'none' });
    return false;
  }
};

/**
 * 璁剧疆榛樿鍦板潃
 * @param {number|string} addressId - 鍦板潃ID
 * @returns {Promise<boolean>} - 鏄惁璁剧疆鎴愬姛
 */
export const setDefaultAddress = async (addressId) => {
  try {
    showLoading('璁剧疆榛樿鍦板潃...');
    
    const result = await api.post(`/addresses/${addressId}/set-default`);
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('榛樿鍦板潃璁剧疆鎴愬姛', { icon: 'success' });
      return true;
    } else {
      throw new Error(result.message || '璁剧疆榛樿鍦板潃澶辫触');
    }
  } catch (error) {
    hideLoading();
    console.error('璁剧疆榛樿鍦板潃澶辫触:', error);
    showToast(error.message || '璁剧疆榛樿鍦板潃澶辫触锛岃閲嶈瘯', { icon: 'none' });
    return false;
  }
};

/**
 * 浣跨敤寰俊鍦板潃API閫夋嫨鍦板潃
 * @returns {Promise<Object|null>} - 杩斿洖閫夋嫨鐨勫湴鍧€淇℃伅鎴杗ull
 */
export const chooseWechatAddress = async () => {
  try {
    // 妫€鏌ユ槸鍚︽湁鏉冮檺
    const setting = await wx.getSetting();
    
    if (!setting.authSetting['scope.address']) {
      // 鐢宠鏉冮檺
      const authResult = await wx.authorize({ scope: 'scope.address' });
      
      if (!authResult) {
        throw new Error('鐢ㄦ埛鎷掔粷鎺堟潈鍦板潃淇℃伅');
      }
    }
    
    // 璋冪敤寰俊鍦板潃閫夋嫨
    const address = await wx.chooseAddress();
    
    // 鏍煎紡鍖栧湴鍧€鏁版嵁
    return {
      name: address.userName,
      phone: address.telNumber,
      province: address.provinceName,
      city: address.cityName,
      district: address.countyName,
      detail: address.detailInfo,
      is_default: false
    };
  } catch (error) {
    console.error('閫夋嫨鍦板潃澶辫触:', error);
    
    // 鐢ㄦ埛鍙栨秷閫夋嫨涓嶇畻閿欒
    if (!error.errMsg || !error.errMsg.includes('cancel')) {
      showToast('閫夋嫨鍦板潃澶辫触', { icon: 'none' });
    }
    
    return null;
  }
};

/**
 * 楠岃瘉鍦板潃淇℃伅
 * @param {Object} addressData - 鍦板潃鏁版嵁
 * @returns {Object} - 楠岃瘉缁撴灉 { valid: boolean, message: string }
 */
export const validateAddress = (addressData) => {
  // 楠岃瘉濮撳悕
  if (!addressData.name || addressData.name.trim().length === 0) {
    return { valid: false, message: '璇疯緭鍏ユ敹浠朵汉濮撳悕' };
  }
  
  // 楠岃瘉鎵嬫満鍙凤紙绠€鍗曢獙璇侊級
  if (!addressData.phone || !/^1[3-9]\d{9}$/.test(addressData.phone)) {
    return { valid: false, message: '璇疯緭鍏ユ纭殑鎵嬫満鍙? };
  }
  
  // 楠岃瘉鐪佸競鍖?  if (!addressData.province || !addressData.city || !addressData.district) {
    return { valid: false, message: '璇烽€夋嫨瀹屾暣鐨勭渷甯傚尯' };
  }
  
  // 楠岃瘉璇︾粏鍦板潃
  if (!addressData.detail || addressData.detail.trim().length < 5) {
    return { valid: false, message: '璇疯緭鍏ヨ缁嗗湴鍧€锛堣嚦灏?涓瓧绗︼級' };
  }
  
  return { valid: true, message: '楠岃瘉閫氳繃' };
};

/**
 * 鏍煎紡鍖栧湴鍧€涓哄瓧绗︿覆
 * @param {Object} address - 鍦板潃瀵硅薄
 * @returns {string} - 鏍煎紡鍖栧悗鐨勫湴鍧€瀛楃涓? */
export const formatAddress = (address) => {
  if (!address) return '';
  
  return `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || ''}`;
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  getAddresses,
  getDefaultAddress,
  getAddressDetail,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  chooseWechatAddress,
  validateAddress,
  formatAddress
};\n