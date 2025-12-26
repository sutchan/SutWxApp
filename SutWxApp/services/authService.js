/**
 * 文件名: authService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 认证服务，处理用户登录、注册、信息管理等功能
 */

const request = require('../utils/request');
const store = require('../utils/store');

/**
 * 微信授权登录
 * @returns {Promise<Object>} 登录结果，包含token和用户信息
 */
async function wechatLogin() {
  try {
    // 获取微信登录凭证
    const { code } = await wx.login();
    
    // 调用登录接口
    const result = await request.post('/auth/wechat-login', { code }, { needAuth: false });
    
    // 保存token
    if (result.token) {
      store.commit('SET_TOKEN', result.token);
    }
    
    // 如果返回了用户信息，保存用户信息
    if (result.user) {
      store.commit('SET_USER_INFO', result.user);
      return result;
    }
    
    // 如果没有返回用户信息，获取用户信息
    const userInfo = await getUserInfo();
    return {
      token: result.token,
      user: userInfo
    };
  } catch (error) {
    console.error('微信登录失败:', error);
    throw error;
  }
}

/**
 * 用户名密码登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<Object>} 登录结果，包含token和用户信息
 */
async function login(username, password) {
  try {
    const result = await request.post('/auth/login', {
      username,
      password
    }, { needAuth: false });
    
    // 保存token和用户信息
    store.commit('SET_TOKEN', result.token);
    store.commit('SET_USER_INFO', result.user);
    
    return result;
  } catch (error) {
    console.error('用户名密码登录失败:', error);
    throw error;
  }
}

/**
 * 手机号验证码登录
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise<Object>} 登录结果，包含token和用户信息
 */
async function loginWithPhone(phone, code) {
  try {
    const result = await request.post('/auth/login/phone', {
      phone,
      code
    }, { needAuth: false });
    
    // 保存token和用户信息
    store.commit('SET_TOKEN', result.token);
    store.commit('SET_USER_INFO', result.user);
    
    return result;
  } catch (error) {
    console.error('手机号验证码登录失败:', error);
    throw error;
  }
}

/**
 * 登出
 * @returns {Promise<void>}
 */
async function logout() {
  try {
    await request.post('/auth/logout');
  } catch (error) {
    console.error('登出失败:', error);
    // 登出失败不抛出错误，确保用户可以正常登出
  } finally {
    // 清除token和用户信息
    store.commit('SET_TOKEN', null);
    store.commit('SET_USER_INFO', null);
  }
}

/**
 * 获取用户信息
 * @returns {Promise<Object>} 用户信息
 */
async function getUserInfo() {
  try {
    const userInfo = await request.get('/user/info');
    store.commit('SET_USER_INFO', userInfo);
    return userInfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 更新用户信息
 * @param {Object} userInfo - 用户信息
 * @returns {Promise<Object>} 更新后的用户信息
 */
async function updateUserInfo(userInfo) {
  try {
    const updatedUserInfo = await request.put('/user/info', userInfo);
    store.commit('SET_USER_INFO', updatedUserInfo);
    return updatedUserInfo;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
}

/**
 * 获取用户地址列表
 * @returns {Promise<Array>} 地址列表
 */
async function getUserAddresses() {
  try {
    return await request.get('/user/addresses');
  } catch (error) {
    console.error('获取用户地址列表失败:', error);
    throw error;
  }
}

/**
 * 添加用户地址
 * @param {Object} address - 地址信息
 * @returns {Promise<Object>} 添加后的地址信息
 */
async function addUserAddress(address) {
  try {
    return await request.post('/user/addresses', address);
  } catch (error) {
    console.error('添加用户地址失败:', error);
    throw error;
  }
}

/**
 * 发送验证码
 * @param {string} phone - 手机号
 * @param {string} [type='login'] - 验证码类型：login/reset
 * @returns {Promise<Object>} 发送结果
 */
async function sendVerificationCode(phone, type = 'login') {
  try {
    return await request.post('/auth/send-code', {
      phone,
      type
    }, { needAuth: false });
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw error;
  }
}

/**
 * 验证重置密码验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise<Object>} 验证结果
 */
async function verifyResetCode(phone, code) {
  try {
    return await request.post('/auth/verify-reset-code', {
      phone,
      code
    }, { needAuth: false });
  } catch (error) {
    console.error('验证重置密码验证码失败:', error);
    throw error;
  }
}

/**
 * 重置密码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} newPassword - 新密码
 * @returns {Promise<Object>} 重置结果
 */
async function resetPassword(phone, code, newPassword) {
  try {
    return await request.post('/auth/reset-password', {
      phone,
      code,
      newPassword
    }, { needAuth: false });
  } catch (error) {
    console.error('重置密码失败:', error);
    throw error;
  }
}

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<Object>} 修改结果
 */
async function changePassword(oldPassword, newPassword) {
  try {
    return await request.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    throw error;
  }
}

/**
 * 获取token
 * @returns {string|null} token
 */
function getToken() {
  return store.getState().token;
}

/**
 * 判断是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
  return !!getToken();
}

module.exports = {
  wechatLogin,
  login,
  loginWithPhone,
  logout,
  getUserInfo,
  updateUserInfo,
  getUserAddresses,
  addUserAddress,
  sendVerificationCode,
  verifyResetCode,
  resetPassword,
  changePassword,
  getToken,
  isLoggedIn
};
