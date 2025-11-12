/**
 * auth-service.js - 身份认证服务模块
 * 负责用户登录、获取用户信息、绑定手机等认证相关功能
 */

const { api } = require('./api');
const { showToast, showLoading, hideLoading } = require('./global');
const { CACHE_KEYS, CACHE_DURATION, CacheManager, setCache, getCache, removeCache } = require('./cache');
const validator = require('./validator');

// 登录相关常量定义
const LOGIN_TOKEN_KEY = CACHE_KEYS.TOKEN || 'user_token';
const USER_INFO_KEY = CACHE_KEYS.USER_INFO;

// 缓存管理器实例
const cacheManager = new CacheManager();

/**
 * 微信登录
 * @returns {Promise<Object>} - 返回登录结果对象
 */
const wechatLogin = async () => {
  try {
    showLoading('登录中...');
    
    // 1. 获取微信登录code
    const wxLoginResult = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });

    if (!wxLoginResult.code || !validator.isValidString(wxLoginResult.code)) {
      throw new Error('获取登录code失败');
    }

    // 2. 发送code到服务器获取token
    const { code } = wxLoginResult;
    const loginResult = await api.post('/api/auth/login', { 
      code, 
      platform: 'wechat'
    }, { abortKey: 'auth_login' });

    // 3. 保存token和用户信息
    if (loginResult.token && validator.isValidString(loginResult.token)) {
      // 同时通过缓存管理器和原生存储保存信息
      await cacheManager.set(LOGIN_TOKEN_KEY, loginResult.token, CACHE_DURATION.LONG);
      await cacheManager.set(USER_INFO_KEY, loginResult.user || {}, CACHE_DURATION.LONG);
      
      // 兼容旧版存储方式
      wx.setStorageSync('userToken', loginResult.token);
      wx.setStorageSync('jwt_token', loginResult.token);
      wx.setStorageSync('userInfo', loginResult.user || {});
      
      // 设置API请求的token
      api.setToken(loginResult.token);
    }

    hideLoading();
    return loginResult;
  } catch (error) {
    hideLoading();
    console.error('微信登录失败', error);
    // 登录失败时执行退出登录操作
    logout();
    throw error;
  }
};

/**
 * 获取用户资料信息
 * @param {boolean} forceRefresh - 是否强制刷新用户资料
 * @returns {Promise<Object>} - 返回用户资料信息
 */
const getUserProfile = async (forceRefresh = false) => {
  try {
    // 首先尝试从缓存获取用户信息
    if (!forceRefresh) {
      const cachedUserInfo = await cacheManager.get(USER_INFO_KEY);
      if (cachedUserInfo && typeof cachedUserInfo === 'object') {
        return cachedUserInfo;
      }
      
      // 兼容旧版缓存获取
      const legacyUserInfo = wx.getStorageSync('userInfo');
      if (legacyUserInfo && typeof legacyUserInfo === 'object') {
        // 更新到新的缓存系统
        await cacheManager.set(USER_INFO_KEY, legacyUserInfo, CACHE_DURATION.LONG);
        return legacyUserInfo;
      }
    }

    // 验证是否已登录
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 1. 获取用户资料
    const userProfile = await new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料信息',
        success: resolve,
        fail: reject
      });
    });

    // 2. 更新用户资料到服务器
    const { userInfo } = userProfile;
    await api.post('/api/auth/update-profile', {
      nickname: userInfo.nickName,
      avatar_url: userInfo.avatarUrl,
      gender: userInfo.gender,
      language: userInfo.language,
      province: userInfo.province,
      city: userInfo.city,
      country: userInfo.country
    }, { abortKey: 'auth_update_profile' });

    // 3. 获取当前用户信息
    const currentUser = await getUserInfo();
    // 合并新的用户资料
    const updatedUser = { ...currentUser, ...userInfo };
    // 更新缓存和存储
    await cacheManager.set(USER_INFO_KEY, updatedUser, CACHE_DURATION.LONG);
    wx.setStorageSync('userInfo', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    // 如果是登录状态失效，执行退出登录
    if (error.message.includes('登录') || error.message.includes('token')) {
      await logout();
    }
    throw error;
  }
};

/**
 * 获取用户信息
 * @returns {Promise<Object>} - 返回用户信息对象
 */
const getUserInfo = async () => {
  try {
    // 先尝试从缓存获取
    const cachedUserInfo = await cacheManager.get(USER_INFO_KEY);
    if (cachedUserInfo && typeof cachedUserInfo === 'object') {
      return cachedUserInfo;
    }
    
    // 尝试从原生存储获取
    const legacyUserInfo = wx.getStorageSync('userInfo');
    if (legacyUserInfo && typeof legacyUserInfo === 'object') {
      // 更新到新的缓存系统
      await cacheManager.set(USER_INFO_KEY, legacyUserInfo, CACHE_DURATION.LONG);
      return legacyUserInfo;
    }
    
    // 验证登录状态
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 从服务器获取用户信息
    const userInfo = await api.get('/api/auth/user-info', { abortKey: 'auth_user_info' });
    
    // 更新缓存和存储
    await cacheManager.set(USER_INFO_KEY, userInfo, CACHE_DURATION.LONG);
    wx.setStorageSync('userInfo', userInfo);
    
    return userInfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否已登录
 * @returns {Promise<boolean>} - 返回登录状态
 */
const isLoggedIn = async () => {
  try {
    // 检查缓存中的token
    const cachedToken = await cacheManager.get(LOGIN_TOKEN_KEY);
    if (cachedToken && validator.isValidString(cachedToken)) {
      // 确保API请求使用正确的token
      if (api.token !== cachedToken) {
        api.setToken(cachedToken);
      }
      return true;
    }
    
    // 兼容检查旧版存储
    const legacyToken = wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token');
    if (legacyToken && validator.isValidString(legacyToken)) {
      // 更新到新的缓存系统
      await cacheManager.set(LOGIN_TOKEN_KEY, legacyToken, CACHE_DURATION.LONG);
      // 确保API请求使用正确的token
      if (api.token !== legacyToken) {
        api.setToken(legacyToken);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
};

/**
 * 检查并执行登录
 * @returns {Promise<Object>} - 返回登录结果
 */
const checkAndLogin = async () => {
  try {
    const isLogin = await isLoggedIn();
    if (!isLogin) {
      // 执行微信登录
      return await wechatLogin();
    }
    // 已登录状态下，刷新用户信息
    return await getUserInfo();
  } catch (error) {
    console.error('检查并登录失败:', error);
    // 登录失败时清除本地状态
    await logout();
    throw error;
  }
};

/**
 * 退出登录
 * @returns {Promise<void>}
 */
const logout = async () => {
  try {
    // 清除缓存中的token和用户信息
    await cacheManager.remove(LOGIN_TOKEN_KEY);
    await cacheManager.remove(USER_INFO_KEY);
    
    // 清除本地存储中的用户相关数据
    wx.removeStorageSync('userToken');
    wx.removeStorageSync('jwt_token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('phoneNumber');
    wx.removeStorageSync('session_key');
    
    // 清除API请求中的token
    api.setToken(null);
    
    console.log('退出登录成功');
  } catch (error) {
    console.error('退出登录失败:', error);
    // 即使出错也要尝试清除关键数据
    try {
      wx.removeStorageSync('userToken');
      wx.removeStorageSync('jwt_token');
      api.setToken(null);
    } catch (e) {
      // 忽略嵌套错误
    }
  }
};

/**
 * 绑定手机号
 * @param {Object} data - 手机号绑定数据
 * @returns {Promise<Object>} - 返回绑定结果
 */
const bindPhoneNumber = async (data) => {
  try {
    // 验证登录状态
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 发送绑定请求
    const result = await api.post('/api/auth/bind-phone', data, { 
      abortKey: 'auth_bind_phone' 
    });
    
    // 更新用户信息缓存
    if (result.user) {
      await cacheManager.set(USER_INFO_KEY, result.user, CACHE_DURATION.LONG);
      wx.setStorageSync('userInfo', result.user);
    }
    
    return result;
  } catch (error) {
    console.error('绑定手机号失败:', error);
    throw error;
  }
};

/**
 * 刷新Token
 * @returns {Promise<Object>} - 返回刷新结果
 */
const refreshToken = async () => {
  try {
    // 获取当前token
    const currentToken = await cacheManager.get(LOGIN_TOKEN_KEY) || 
                        wx.getStorageSync('userToken') || 
                        wx.getStorageSync('jwt_token');
    
    if (!currentToken) {
      throw new Error('没有找到可用的token');
    }
    
    // 发送刷新请求
    const result = await api.post('/api/auth/refresh-token', {
      token: currentToken
    }, { abortKey: 'auth_refresh_token' });
    
    // 更新token
    if (result.token) {
      await cacheManager.set(LOGIN_TOKEN_KEY, result.token, CACHE_DURATION.LONG);
      wx.setStorageSync('userToken', result.token);
      wx.setStorageSync('jwt_token', result.token);
      api.setToken(result.token);
    }
    
    return result;
  } catch (error) {
    console.error('刷新token失败:', error);
    // 刷新失败时退出登录
    await logout();
    throw error;
  }
};

/**
 * 绑定WordPress账号
 * @param {string} username - WordPress用户名
 * @param {string} password - WordPress密码
 * @returns {Promise<Object>} - 返回绑定结果
 */
const bindWordPressAccount = async (username, password) => {
  try {
    // 验证登录状态
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 验证参数
    if (!validator.isValidString(username) || !validator.isValidString(password)) {
      throw new Error('请输入有效的用户名和密码');
    }
    
    // 发送绑定请求
    const result = await api.post('/api/auth/bind-wordpress', {
      username,
      password
    }, { abortKey: 'auth_bind_wordpress' });
    
    // 更新用户信息缓存
    if (result.user) {
      await cacheManager.set(USER_INFO_KEY, result.user, CACHE_DURATION.LONG);
      wx.setStorageSync('userInfo', result.user);
    }
    
    return result;
  } catch (error) {
    console.error('绑定WordPress账号失败:', error);
    throw error;
  }
};

/**
 * 获取签到状态
 * @returns {Promise<Object>} - 返回签到状态信息
 */
const getSignInStatus = async () => {
  try {
    // 验证登录状态
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 获取签到状态
    const result = await api.get('/api/auth/sign-in-status', {
      abortKey: 'auth_sign_in_status'
    });
    
    return result;
  } catch (error) {
    console.error('获取签到状态失败:', error);
    throw error;
  }
};

/**
 * 执行签到
 * @returns {Promise<Object>} - 返回签到结果
 */
const signIn = async () => {
  try {
    // 验证登录状态
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 执行签到
    const result = await api.post('/api/auth/sign-in', {}, {
      abortKey: 'auth_sign_in'
    });
    
    return result;
  } catch (error) {
    console.error('签到失败:', error);
    throw error;
  }
};

// 导出模块
module.exports = {
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
