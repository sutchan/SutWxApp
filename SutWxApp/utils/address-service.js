/**
 * address-service.js - 地址服务模块
 * 用于处理用户收货地址的增删改查等操作
 */
const api = require('./api');
const { showToast, showLoading, hideLoading } = require('./global');

/**
 * 获取地址列表
 * @returns {Promise<Array>} - 返回地址列表
 */
const getAddresses = async () => {
  try {
    const result = await api.get('/api/addresses');
    return result.addresses || [];
  } catch (error) {
    console.error('获取地址列表失败:', error);
    return [];
  }
};

/**
 * 获取默认地址
 * @returns {Promise<Object|null>} - 返回默认地址对象或null
 */
const getDefaultAddress = async () => {
  try {
    const result = await api.get('/api/addresses/default');
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
const getAddressDetail = async (addressId) => {
  try {
    const result = await api.get(`/api/addresses/${addressId}`);
    
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
 * @param {string} addressData.name - 收货人姓名
 * @param {string} addressData.phone - 联系电话
 * @param {string} addressData.province - 省份
 * @param {string} addressData.city - 城市
 * @param {string} addressData.district - 区县
 * @param {string} addressData.detail - 详细地址
 * @param {boolean} addressData.is_default - 是否默认地址
 * @returns {Promise<Object>} - 返回新增的地址对象
 */
const addAddress = async (addressData) => {
  try {
    // 验证数据
    if (!addressData.name || !addressData.phone || !addressData.detail) {
      throw new Error('请填写完整的地址信息');
    }
    
    showLoading('保存地址...');
    
    const result = await api.post('/api/addresses', addressData);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('地址添加成功', 'success');
      return result.address;
    } else {
      throw new Error(result.message || '保存地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('添加地址失败', error);
    showToast(error.message || '保存地址失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 更新地址
 * @param {number|string} addressId - 地址ID
 * @param {Object} addressData - 地址数据
 * @returns {Promise<Object>} - 返回更新后的地址对象
 */
const updateAddress = async (addressId, addressData) => {
  try {
    // 验证数据
    if (!addressData.name || !addressData.phone || !addressData.detail) {
      throw new Error('请填写完整的地址信息');
    }
    
    showLoading('更新地址...');
    
    const result = await api.put(`/api/addresses/${addressId}`, addressData);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('地址更新成功', 'success');
      return result.address;
    } else {
      throw new Error(result.message || '更新地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('更新地址失败', error);
    showToast(error.message || '更新地址失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 删除地址
 * @param {number|string} addressId - 地址ID
 * @returns {Promise<boolean>} - 是否删除成功
 */
const deleteAddress = async (addressId) => {
  try {
    showLoading('删除地址...');
    
    const result = await api.delete(`/api/addresses/${addressId}`);
    
    hideLoading();
    
    if (result.code === 200) {
      showToast('地址删除成功', 'success');
      return true;
    } else {
      throw new Error(result.message || '删除地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('删除地址失败', error);
    showToast(error.message || '删除地址失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 设置默认地址
 * @param {number|string} addressId - 地址ID
 * @returns {Promise<Object>} - 返回设置后的默认地址对象
 */
const setDefaultAddress = async (addressId) => {
  try {
    showLoading('设置默认地址...');
    
    const result = await api.post(`/api/addresses/${addressId}/default`);
    
    hideLoading();
    
    if (result.code === 200 && result.address) {
      showToast('默认地址设置成功', 'success');
      return result.address;
    } else {
      throw new Error(result.message || '设置默认地址失败');
    }
  } catch (error) {
    hideLoading();
    console.error('设置默认地址失败', error);
    showToast(error.message || '设置默认地址失败，请稍后重试', 'none');
    throw error;
  }
};

/**
 * 选择微信地址
 * @returns {Promise<Object>} - 返回选择的地址信息
 */
const chooseWechatAddress = async () => {
  return new Promise((resolve, reject) => {
    try {
      wx.chooseAddress({
        success: (res) => {
          const addressData = {
            name: res.userName,
            phone: res.telNumber,
            province: res.provinceName,
            city: res.cityName,
            district: res.countyName,
            detail: res.detailInfo,
            is_default: false
          };
          resolve(addressData);
        },
        fail: (error) => {
          console.error('选择地址失败:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('调用微信地址选择失败:', error);
      reject(error);
    }
  });
};

/**
 * 验证地址信息
 * @param {Object} addressData - 地址数据
 * @returns {Object} - 验证结果 {isValid: boolean, message: string}
 */
const validateAddress = (addressData) => {
  if (!addressData) {
    return { isValid: false, message: '地址信息不能为空' };
  }
  
  if (!addressData.name || addressData.name.trim() === '') {
    return { isValid: false, message: '收货人姓名不能为空' };
  }
  
  if (!addressData.phone) {
    return { isValid: false, message: '联系电话不能为空' };
  }
  
  // 简单的手机号格式验证
  if (!/^1[3-9]\d{9}$/.test(addressData.phone)) {
    return { isValid: false, message: '请输入正确的手机号' };
  }
  
  if (!addressData.detail || addressData.detail.trim() === '') {
    return { isValid: false, message: '详细地址不能为空' };
  }
  
  return { isValid: true, message: '验证通过' };
};

/**
 * 格式化地址显示
 * @param {Object} address - 地址对象
 * @returns {string} - 格式化后的地址字符串
 */
const formatAddress = (address) => {
  if (!address) return '';
  
  const { province, city, district, detail, name, phone } = address;
  return `${province}${city}${district}${detail} ${name} ${phone}`;
};

// 导出所有函数
module.exports = {
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