/**
 * payment-service.js - 支付服务模块
 * 处理支付创建、查询、退款等相关功能
 */

const api = require('./api');
const { showToast } = require('./global');

/**
 * 创建支付参数
 * @param {string} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式，默认为微信支付
 * @returns {Promise<Object>} - 支付参数
 */
const createPayment = async (orderId, paymentMethod = 'wechat') => {
  try {
    // 调用API创建支付参数
    const result = await api.post('/api/payment/create', {
      order_id: orderId,
      payment_method: paymentMethod
    });
    
    if (!result || !result.pay_params) {
      throw new Error('创建支付参数失败');
    }
    
    return result.pay_params;
  } catch (error) {
    console.error('创建支付参数失败', error);
    throw error;
  }
};

/**
 * 请求微信支付
 * @param {Object} payParams - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
const requestWechatPayment = async (payParams) => {
  return new Promise((resolve, reject) => {
    try {
      // 调用微信支付API
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
      console.error('请求微信支付失败', error);
      reject(error);
    }
  });
};

/**
 * 查询支付状态
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} - 支付状态信息
 */
const queryPaymentStatus = async (orderId) => {
  try {
    // 调用API查询支付状态
    const result = await api.get(`/api/payment/query/${orderId}`);
    return result;
  } catch (error) {
    console.error('查询支付状态失败', error);
    throw error;
  }
};

/**
 * 申请退款
 * @param {string} orderId - 订单ID
 * @param {Object} refundData - 退款数据
 * @param {number} refundData.amount - 退款金额
 * @param {string} refundData.reason - 退款原因
 * @returns {Promise<Object>} - 退款结果
 */
const applyRefund = async (orderId, refundData) => {
  try {
    // 调用API申请退款
    const result = await api.post(`/api/payment/refund/${orderId}`, refundData);
    return result;
  } catch (error) {
    console.error('申请退款失败', error);
    throw error;
  }
};

/**
 * 查询退款状态
 * @param {string} refundId - 退款ID
 * @returns {Promise<Object>} - 退款状态信息
 */
const queryRefundStatus = async (refundId) => {
  try {
    // 调用API查询退款状态
    const result = await api.get(`/api/payment/refund/query/${refundId}`);
    return result;
  } catch (error) {
    console.error('查询退款状态失败', error);
    throw error;
  }
};

/**
 * 获取可用支付方式列表
 * @returns {Promise<Array>} - 支付方式列表
 */
const getAvailablePaymentMethods = async () => {
  try {
    // 调用API获取支付方式列表
    const result = await api.get('/api/payment/methods');
    return result.methods || [];
  } catch (error) {
    console.error('获取支付方式列表失败:', error);
    // 返回默认支付方式
    return [{
      id: 'wechat',
      name: '微信支付',
      enabled: true
    }];
  }
};

/**
 * 处理支付回调
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} - 回调结果
 */
const handlePaymentCallback = async (orderId) => {
  try {
    // 调用API处理支付回调
    const result = await api.post(`/api/payment/callback/${orderId}`);
    return result;
  } catch (error) {
    console.error('处理支付回调失败:', error);
    throw error;
  }
};

/**
 * 创建预支付订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 预支付结果
 */
const createPrePayment = async (orderData) => {
  try {
    // 调用API创建预支付
    const result = await api.post('/api/payment/pre-create', orderData);
    return result;
  } catch (error) {
    console.error('创建预支付失败', error);
    throw error;
  }
};

/**
 * 支付订单主流程
 * @param {string} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式，默认为微信支付
 * @returns {Promise<Object>} - 支付结果
 */
const payOrder = async (orderId, paymentMethod = 'wechat') => {
  try {
    // 1. 创建支付参数
    const payParams = await createPayment(orderId, paymentMethod);
    
    // 2. 发起支付请求
    const paymentResult = await requestWechatPayment(payParams);
    
    // 3. 处理支付回调
    const callbackResult = await handlePaymentCallback(orderId);
    
    return {
      paymentResult,
      callbackResult,
      orderId
    };
  } catch (error) {
    console.error('支付订单失败:', error);
    
    // 判断是否是用户取消支付
    if (error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
      throw new Error('用户取消支付');
    }
    
    throw error;
  }
};

/**
 * 生成支付签名
 * @param {Object} data - 待签名数据
 * @param {string} key - 签名密钥
 * @returns {string} - 生成的签名
 */
const generatePaySign = (data, key) => {
  // 对数据进行排序
  const sortedKeys = Object.keys(data).sort();
  let signStr = '';
  
  for (const k of sortedKeys) {
    if (data[k] !== null && data[k] !== undefined && data[k] !== '') {
      signStr += `${k}=${data[k]}&`;
    }
  }
  
  // 添加密钥并去除末尾的&符号
  signStr = signStr.substring(0, signStr.length - 1) + '&key=' + key;
  
  // 生成MD5签名
  // 注意：在小程序环境中，可能需要引入crypto模块或使用其他方式计算MD5
  // 这里返回一个示例，实际使用时需要替换为真实的签名计算逻辑
  return 'sample_sign_' + new Date().getTime();
};

/**
 * 验证支付参数
 * @param {Object} payParams - 支付参数
 * @returns {boolean} - 是否有效
 */
const validatePayParams = (payParams) => {
  if (!payParams || typeof payParams !== 'object') {
    return false;
  }
  
  // 检查必要的支付参数
  const requiredFields = ['timeStamp', 'nonceStr', 'package', 'signType', 'paySign'];
  
  for (const field of requiredFields) {
    if (!payParams[field]) {
      return false;
    }
  }
  
  return true;
};

/**
 * 支付服务模块
 */
module.exports = {
  createPayment,
  requestWechatPayment,
  queryPaymentStatus,
  applyRefund,
  queryRefundStatus,
  getAvailablePaymentMethods,
  handlePaymentCallback,
  createPrePayment,
  payOrder,
  generatePaySign,
  validatePayParams
};
