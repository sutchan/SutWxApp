// address-service.js - 地址管理服务模块
// 处理收货地址的增删改查等功能

import api from './api';
import { showToast, showLoading, hideLoading } from './global';

/**
 * 获取地址列表
 * @returns {Promise<Array>} - 返回地址列表
 */
export const getAddresses = async () => {
  try {
    const result = await api.get('/addresses');
    return result.addresses || [];
  } catch (error) {
    console.error('获取地址列表失败:', error);
    return [];
  }
};

/**
 * 获取默认地址
 * @returns {Promise<Object|null>} - 返回默认地址或null
 */
export const getDefaultAddress = async () => {
  try {
    const result = await api.get('/addresses/default');
    return result.address || null;
  } catch (error) {
    console.error('获取默认地址失败:', error);
    return null;
  }
};

/**
 * 获取地址详情
 * @param {number|string} addressId - 地址ID
 * @returns {Promise<Object>} - 返回地址详情
 */
export const getAddressDetail = async (addressId) => {
  try {
    const result = await api.get(`/addresses/${addressId}`);
    
    if (result.code === 200 && result.address) {
      return result.address;
    } else {
      throw new Error(result.message || '获取地址详情失败');
    }
  } catch (error) {
    console.error('获取地址详情失败:', error);
    throw error;
  }
};

/**
 * 添加新地址
 * @param {Object} addressData - 地址数据
 * @param {string} addressData.name - 收件人姓名
 * @param {string} addressData.phone - 联系电话
 * @param {string} addressData.province - 省份
 * @param {string} addressData.city - 城市
 * @param {string} addressData.district - 区县
 * @param {string} addressData.detail - 详细地址
 * @param {boolean} addressData.is_default - 是否默认地址
 * @returns {Promise<Object>} - 返回创建的地址信息
 */
export const addAddress = async (addressData) => {
  try {
    // 验证必填字段
    if (!addressData.name || !addressData.phone || !addressData.detail) {
      throw new Error('请填写完整的地址信息');
    }
    
    showLoading('保存地址...');
    
    const result = await api.post('/addresses', addressData);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('地址保存成功', { icon: 'success' });
      return result.address;
    } else {
      throw new Error(result.message || '保存地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('添加地址失败:', error);
    showToast(error.message || '保存地址失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 更新地址
 * @param {number|string} addressId - 地址ID
 * @param {Object} addressData - 地址数据
 * @returns {Promise<Object>} - 返回更新后的地址信息
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    // 验证必填字段
    if (!addressData.name || !addressData.phone || !addressData.detail) {
      throw new Error('请填写完整的地址信息');
    }
    
    showLoading('更新地址...');
    
    const result = await api.put(`/addresses/${addressId}`, addressData);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('地址更新成功', { icon: 'success' });
      return result.address;
    } else {
      throw new Error(result.message || '更新地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('更新地址失败:', error);
    showToast(error.message || '更新地址失败，请重试', { icon: 'none' });
    throw error;
  }
};

/**
 * 删除地址
 * @param {number|string} addressId - 地址ID
 * @returns {Promise<boolean>} - 是否删除成功
 */
export const deleteAddress = async (addressId) => {
  try {
    showLoading('删除地址...');
    
    const result = await api.delete(`/addresses/${addressId}`);
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('地址已删除', { icon: 'success' });
      return true;
    } else {
      throw new Error(result.message || '删除地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('删除地址失败:', error);
    showToast(error.message || '删除地址失败，请重试', { icon: 'none' });
    return false;
  }
};

/**
 * 设置默认地址
 * @param {number|string} addressId - 地址ID
 * @returns {Promise<boolean>} - 是否设置成功
 */
export const setDefaultAddress = async (addressId) => {
  try {
    showLoading('设置默认地址...');
    
    const result = await api.post(`/addresses/${addressId}/set-default`);
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('默认地址设置成功', { icon: 'success' });
      return true;
    } else {
      throw new Error(result.message || '设置默认地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('设置默认地址失败:', error);
    showToast(error.message || '设置默认地址失败，请重试', { icon: 'none' });
    return false;
  }
};

/**
 * 使用微信地址API选择地址
 * @returns {Promise<Object|null>} - 返回选择的地址信息或null
 */
export const chooseWechatAddress = async () => {
  try {
    // 检查是否有权限
    const setting = await wx.getSetting();
    
    if (!setting.authSetting['scope.address']) {
      // 申请权限
      const authResult = await wx.authorize({ scope: 'scope.address' });
      
      if (!authResult) {
        throw new Error('用户拒绝授权地址信息');
      }
    }
    
    // 调用微信地址选择
    const address = await wx.chooseAddress();
    
    // 格式化地址数据
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
    console.error('选择地址失败:', error);
    
    // 用户取消选择不算错误
    if (!error.errMsg || !error.errMsg.includes('cancel')) {
      showToast('选择地址失败', { icon: 'none' });
    }
    
    return null;
  }
};

/**
 * 验证地址信息
 * @param {Object} addressData - 地址数据
 * @returns {Object} - 验证结果 { valid: boolean, message: string }
 */
export const validateAddress = (addressData) => {
  // 验证姓名
  if (!addressData.name || addressData.name.trim().length === 0) {
    return { valid: false, message: '请输入收件人姓名' };
  }
  
  // 验证手机号（简单验证）
  if (!addressData.phone || !/^1[3-9]\d{9}$/.test(addressData.phone)) {
    return { valid: false, message: '请输入正确的手机号' };
  }
  
  // 验证省市区
  if (!addressData.province || !addressData.city || !addressData.district) {
    return { valid: false, message: '请选择完整的省市区' };
  }
  
  // 验证详细地址
  if (!addressData.detail || addressData.detail.trim().length < 5) {
    return { valid: false, message: '请输入详细地址（至少5个字符）' };
  }
  
  return { valid: true, message: '验证通过' };
};

/**
 * 格式化地址为字符串
 * @param {Object} address - 地址对象
 * @returns {string} - 格式化后的地址字符串
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  return `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || ''}`;
};

// 导出所有方法
export default {
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
};