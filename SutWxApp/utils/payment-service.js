// payment-service.js - 鏀粯绯荤粺鐩稿叧鏈嶅姟妯″潡
// 澶勭悊寰俊鏀粯銆佹敮浠樼粨鏋滄煡璇€侀€€娆剧瓑鍔熻兘

import api from './api';
import { showToast } from './global';

/**
 * 鍒涘缓璁㈠崟鏀粯
 * @param {string} orderId - 璁㈠崟ID
 * @param {string} paymentMethod - 鏀粯鏂瑰紡锛岄粯璁や负寰俊鏀粯
 * @returns {Promise<Object>} - 鏀粯鍙傛暟
 */
export const createPayment = async (orderId, paymentMethod = 'wechat') => {
  try {
    // 璋冪敤API鑾峰彇鏀粯鍙傛暟
    const result = await api.post('/payment/create', {
      order_id: orderId,
      payment_method: paymentMethod
    });
    
    if (!result || !result.pay_params) {
      throw new Error('鑾峰彇鏀粯鍙傛暟澶辫触');
    }
    
    return result.pay_params;
  } catch (error) {
    console.error('鍒涘缓鏀粯澶辫触:', error);
    throw error;
  }
};

/**
 * 鍙戣捣寰俊鏀粯
 * @param {Object} payParams - 寰俊鏀粯鍙傛暟
 * @returns {Promise<Object>} - 鏀粯缁撴灉
 */
export const requestWechatPayment = async (payParams) => {
  return new Promise((resolve, reject) => {
    try {
      // 璋冪敤寰俊鏀粯API
      wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign,
        success: function(res) {
          resolve(res);
        },
        fail: function(err) {
          reject(err);
        }
      });
    } catch (error) {
      console.error('鍙戣捣寰俊鏀粯澶辫触:', error);
      reject(error);
    }
  });
};

/**
 * 鏌ヨ鏀粯鐘舵€? * @param {string} orderId - 璁㈠崟ID
 * @returns {Promise<Object>} - 鏀粯鐘舵€佷俊鎭? */
export const queryPaymentStatus = async (orderId) => {
  try {
    // 璋冪敤API鏌ヨ鏀粯鐘舵€?    const result = await api.get(`/payment/query/${orderId}`);
    return result;
  } catch (error) {
    console.error('鏌ヨ鏀粯鐘舵€佸け璐?', error);
    throw error;
  }
};

/**
 * 鐢宠閫€娆? * @param {string} orderId - 璁㈠崟ID
 * @param {Object} refundData - 閫€娆炬暟鎹? * @param {number} refundData.amount - 閫€娆鹃噾棰? * @param {string} refundData.reason - 閫€娆惧師鍥? * @returns {Promise<Object>} - 閫€娆剧粨鏋? */
export const applyRefund = async (orderId, refundData) => {
  try {
    // 璋冪敤API鐢宠閫€娆?    const result = await api.post(`/payment/refund/${orderId}`, refundData);
    return result;
  } catch (error) {
    console.error('鐢宠閫€娆惧け璐?', error);
    throw error;
  }
};

/**
 * 鏌ヨ閫€娆剧姸鎬? * @param {string} refundId - 閫€娆綢D
 * @returns {Promise<Object>} - 閫€娆剧姸鎬佷俊鎭? */
export const queryRefundStatus = async (refundId) => {
  try {
    // 璋冪敤API鏌ヨ閫€娆剧姸鎬?    const result = await api.get(`/payment/refund/query/${refundId}`);
    return result;
  } catch (error) {
    console.error('鏌ヨ閫€娆剧姸鎬佸け璐?', error);
    throw error;
  }
};

/**
 * 鑾峰彇鏀寔鐨勬敮浠樻柟寮忓垪琛? * @returns {Promise<Array>} - 鏀粯鏂瑰紡鍒楄〃
 */
export const getAvailablePaymentMethods = async () => {
  try {
    // 璋冪敤API鑾峰彇鏀粯鏂瑰紡鍒楄〃
    const result = await api.get('/payment/methods');
    return result.methods || [];
  } catch (error) {
    console.error('鑾峰彇鏀粯鏂瑰紡鍒楄〃澶辫触:', error);
    // 杩斿洖榛樿鏀寔鐨勬敮浠樻柟寮?    return [{
      id: 'wechat',
      name: '寰俊鏀粯',
      enabled: true
    }];
  }
};

/**
 * 澶勭悊鏀粯鍥炶皟
 * @param {string} orderId - 璁㈠崟ID
 * @returns {Promise<Object>} - 澶勭悊缁撴灉
 */
export const handlePaymentCallback = async (orderId) => {
  try {
    // 璋冪敤API澶勭悊鏀粯鍥炶皟
    const result = await api.post(`/payment/callback/${orderId}`);
    return result;
  } catch (error) {
    console.error('澶勭悊鏀粯鍥炶皟澶辫触:', error);
    throw error;
  }
};

/**
 * 棰勬敮浠橈紙鐢ㄤ簬鐢熸垚鏀粯浜岀淮鐮佺瓑鍦烘櫙锛? * @param {Object} orderData - 璁㈠崟鏁版嵁
 * @returns {Promise<Object>} - 棰勬敮浠樼粨鏋? */
export const createPrePayment = async (orderData) => {
  try {
    // 璋冪敤API鍒涘缓棰勬敮浠?    const result = await api.post('/payment/pre-create', orderData);
    return result;
  } catch (error) {
    console.error('鍒涘缓棰勬敮浠樺け璐?', error);
    throw error;
  }
};

/**
 * 鏀粯璁㈠崟锛堜竴绔欏紡鏀粯娴佺▼锛? * @param {string} orderId - 璁㈠崟ID
 * @param {string} paymentMethod - 鏀粯鏂瑰紡锛岄粯璁や负寰俊鏀粯
 * @returns {Promise<Object>} - 鏀粯缁撴灉
 */
export const payOrder = async (orderId, paymentMethod = 'wechat') => {
  try {
    // 1. 鑾峰彇鏀粯鍙傛暟
    const payParams = await createPayment(orderId, paymentMethod);
    
    // 2. 鍙戣捣鏀粯璇锋眰
    const paymentResult = await requestWechatPayment(payParams);
    
    // 3. 澶勭悊鏀粯鍥炶皟锛岀‘璁ゆ敮浠樼姸鎬?    const callbackResult = await handlePaymentCallback(orderId);
    
    return {
      paymentResult,
      callbackResult,
      orderId
    };
  } catch (error) {
    console.error('鏀粯璁㈠崟澶辫触:', error);
    
    // 濡傛灉鏄敤鎴峰彇娑堟敮浠橈紝涓嶆姏鍑洪敊璇?    if (error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
      throw new Error('鐢ㄦ埛鍙栨秷鏀粯');
    }
    
    throw error;
  }
};

/**
 * 鐢熸垚鏀粯绛惧悕锛堝唴閮ㄤ娇鐢級
 * @param {Object} data - 闇€瑕佺鍚嶇殑鏁版嵁
 * @param {string} key - 绛惧悕瀵嗛挜
 * @returns {string} - 鐢熸垚鐨勭鍚? * @private
 */
const generatePaySign = (data, key) => {
  try {
    // 鎸夌収鍙傛暟鍚岮SCII鐮佷粠灏忓埌澶ф帓搴?    const sortedKeys = Object.keys(data).sort();
    let signStr = '';
    
    // 鎷兼帴瀛楃涓?    sortedKeys.forEach(key => {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        signStr += `${key}=${data[key]}&`;
      }
    });
    
    // 娣诲姞API瀵嗛挜
    signStr += `key=${key}`;
    
    // 鐢熸垚MD5绛惧悕
    // 娉ㄦ剰锛氳繖閲屼娇鐢ㄥ井淇″皬绋嬪簭鐜鐨刢rypto搴撴垨鍏朵粬鏂瑰紡瀹炵幇MD5
    // 瀹為檯瀹炵幇鍙兘闇€瑕佹牴鎹」鐩幆澧冭皟鏁?    
    return signStr; // 杩斿洖绀轰緥锛屽疄闄呭簲杩斿洖MD5鍚庣殑缁撴灉
  } catch (error) {
    console.error('鐢熸垚鏀粯绛惧悕澶辫触:', error);
    return '';
  }
};

/**
 * 楠岃瘉鏀粯鍙傛暟锛堝唴閮ㄤ娇鐢級
 * @param {Object} payParams - 鏀粯鍙傛暟
 * @returns {boolean} - 鏄惁鏈夋晥
 * @private
 */
const validatePayParams = (payParams) => {
  if (!payParams) return false;
  
  const requiredFields = ['timeStamp', 'nonceStr', 'package', 'signType', 'paySign'];
  
  for (const field of requiredFields) {
    if (!payParams[field]) {
      return false;
    }
  }
  
  return true;
};

// 瀵煎嚭鎵€鏈夋柟娉?export default {
  createPayment,
  requestWechatPayment,
  queryPaymentStatus,
  applyRefund,
  queryRefundStatus,
  getAvailablePaymentMethods,
  handlePaymentCallback,
  createPrePayment,
  payOrder
};
\n