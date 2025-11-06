// payment-service.js - 支付系统相关服务模块
// 处理微信支付、支付结果查询、退款等功能

import api from './api';
import { showToast } from './global';

/**
 * 创建订单支付
 * @param {string} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式，默认为微信支付
 * @returns {Promise<Object>} - 支付参数
 */
export const createPayment = async (orderId, paymentMethod = 'wechat') => {
  try {
    // 调用API获取支付参数
    const result = await api.post('/payment/create', {
      order_id: orderId,
      payment_method: paymentMethod
    });
    
    if (!result || !result.pay_params) {
      throw new Error('获取支付参数失败');
    }
    
    return result.pay_params;
  } catch (error) {
    console.error('创建支付失败:', error);
    throw error;
  }
};

/**
 * 发起微信支付
 * @param {Object} payParams - 微信支付参数
 * @returns {Promise<Object>} - 支付结果
 */
export const requestWechatPayment = async (payParams) => {
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
      console.error('发起微信支付失败:', error);
      reject(error);
    }
  });
};

/**
 * 查询支付状态
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} - 支付状态信息
 */
export const queryPaymentStatus = async (orderId) => {
  try {
    // 调用API查询支付状态
    const result = await api.get(`/payment/query/${orderId}`);
    return result;
  } catch (error) {
    console.error('查询支付状态失败:', error);
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
export const applyRefund = async (orderId, refundData) => {
  try {
    // 调用API申请退款
    const result = await api.post(`/payment/refund/${orderId}`, refundData);
    return result;
  } catch (error) {
    console.error('申请退款失败:', error);
    throw error;
  }
};

/**
 * 查询退款状态
 * @param {string} refundId - 退款ID
 * @returns {Promise<Object>} - 退款状态信息
 */
export const queryRefundStatus = async (refundId) => {
  try {
    // 调用API查询退款状态
    const result = await api.get(`/payment/refund/query/${refundId}`);
    return result;
  } catch (error) {
    console.error('查询退款状态失败:', error);
    throw error;
  }
};

/**
 * 获取支持的支付方式列表
 * @returns {Promise<Array>} - 支付方式列表
 */
export const getAvailablePaymentMethods = async () => {
  try {
    // 调用API获取支付方式列表
    const result = await api.get('/payment/methods');
    return result.methods || [];
  } catch (error) {
    console.error('获取支付方式列表失败:', error);
    // 返回默认支持的支付方式
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
 * @returns {Promise<Object>} - 处理结果
 */
export const handlePaymentCallback = async (orderId) => {
  try {
    // 调用API处理支付回调
    const result = await api.post(`/payment/callback/${orderId}`);
    return result;
  } catch (error) {
    console.error('处理支付回调失败:', error);
    throw error;
  }
};

/**
 * 预支付（用于生成支付二维码等场景）
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 预支付结果
 */
export const createPrePayment = async (orderData) => {
  try {
    // 调用API创建预支付
    const result = await api.post('/payment/pre-create', orderData);
    return result;
  } catch (error) {
    console.error('创建预支付失败:', error);
    throw error;
  }
};

/**
 * 支付订单（一站式支付流程）
 * @param {string} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式，默认为微信支付
 * @returns {Promise<Object>} - 支付结果
 */
export const payOrder = async (orderId, paymentMethod = 'wechat') => {
  try {
    // 1. 获取支付参数
    const payParams = await createPayment(orderId, paymentMethod);
    
    // 2. 发起支付请求
    const paymentResult = await requestWechatPayment(payParams);
    
    // 3. 处理支付回调，确认支付状态
    const callbackResult = await handlePaymentCallback(orderId);
    
    return {
      paymentResult,
      callbackResult,
      orderId
    };
  } catch (error) {
    console.error('支付订单失败:', error);
    
    // 如果是用户取消支付，不抛出错误
    if (error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
      throw new Error('用户取消支付');
    }
    
    throw error;
  }
};

/**
 * 生成支付签名（内部使用）
 * @param {Object} data - 需要签名的数据
 * @param {string} key - 签名密钥
 * @returns {string} - 生成的签名
 * @private
 */
const generatePaySign = (data, key) => {
  try {
    // 按照参数名ASCII码从小到大排序
    const sortedKeys = Object.keys(data).sort();
    let signStr = '';
    
    // 拼接字符串
    sortedKeys.forEach(key => {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        signStr += `${key}=${data[key]}&`;
      }
    });
    
    // 添加API密钥
    signStr += `key=${key}`;
    
    // 生成MD5签名
    // 注意：这里使用微信小程序环境的crypto库或其他方式实现MD5
    // 实际实现可能需要根据项目环境调整
    
    return signStr; // 返回示例，实际应返回MD5后的结果
  } catch (error) {
    console.error('生成支付签名失败:', error);
    return '';
  }
};

/**
 * 验证支付参数（内部使用）
 * @param {Object} payParams - 支付参数
 * @returns {boolean} - 是否有效
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

// 导出所有方法
export default {
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
