// auth-service.js - 用户认证服务模块
// 处理微信登录、用户信息授权等功能

import { api } from './api';
import { showToast, showLoading, hideLoading } from './global';
import { CACHE_KEYS, CACHE_DURATION, CacheManager } from './cache';
import { setCache, getCache, removeCache } from './cache';
import validator from './validator';

// 登录状态缓存键
const LOGIN_TOKEN_KEY = CACHE_KEYS.TOKEN || 'user_token';
const USER_INFO_KEY = CACHE_KEYS.USER_INFO;

// 创建缓存管理器
const cacheManager = new CacheManager();

/**
 * 微信登录
 * @returns {Promise<Object>} - 返回登录结果
 */
export const wechatLogin = async () => {
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
      throw new Error('获取登录凭证失败');
    }

    // 2. 发送code到服务器换取token和用户信息
    const { code } = wxLoginResult;
    const loginResult = await api.post('/auth/login', { 
      code, 
      platform: 'wechat'
    }, { abortKey: 'auth_login' });

    // 3. 保存token和用户信息
    if (loginResult.token && validator.isValidString(loginResult.token)) {
      // 使用缓存管理器存储，并保留原有的存储方式以兼容旧代码
      await cacheManager.set(LOGIN_TOKEN_KEY, loginResult.token, CACHE_DURATION.LONG);
      await cacheManager.set(USER_INFO_KEY, loginResult.user || {}, CACHE_DURATION.LONG);
      
      // 兼容两种token存储方式
      wx.setStorageSync('userToken', loginResult.token);
      wx.setStorageSync('jwt_token', loginResult.token);
      wx.setStorageSync('userInfo', loginResult.user || {});
      
      // 设置API请求的默认token
      api.setToken(loginResult.token);
    }

    hideLoading();
    return loginResult;
  } catch (error) {
    hideLoading();
    console.error('微信登录失败:', error);
    // 登录失败，清除本地缓存的登录状态
    logout();
    throw error;
  }
};

/**
 * 获取用户授权信息
 * @param {boolean} forceRefresh - 是否强制刷新用户信息
 * @returns {Promise<Object>} - 返回用户信息
 */
export const getUserProfile = async (forceRefresh = false) => {
  try {
    // 如果不强制刷新且本地已有用户信息，则直接返回
  if (!forceRefresh) {
    const cachedUserInfo = await cacheManager.get(USER_INFO_KEY);
    if (cachedUserInfo && typeof cachedUserInfo === 'object') {
      return cachedUserInfo;
    }
    
    // 也检查传统存储方式
    const legacyUserInfo = wx.getStorageSync('userInfo');
    if (legacyUserInfo && typeof legacyUserInfo === 'object') {
      // 迁移到缓存管理器
      await cacheManager.set(USER_INFO_KEY, legacyUserInfo, CACHE_DURATION.LONG);
      return legacyUserInfo;
    }
  }

    // 检查登录状态
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    // 1. 获取用户授权
    const userProfile = await new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      });
    });

    // 2. 更新用户信息到服务器
    const { userInfo } = userProfile;
    await api.post('/auth/update-profile', {
      nickname: userInfo.nickName,
      avatar_url: userInfo.avatarUrl,
      gender: userInfo.gender,
      language: userInfo.language,
      province: userInfo.province,
      city: userInfo.city,
      country: userInfo.country
    }, { abortKey: 'auth_update_profile' });

    // 3. 更新本地存储的用户信息
    const currentUser = wx.getStorageSync('userInfo') || {};
    const updatedUser = { ...currentUser, ...userInfo };
    
    // 同时更新缓存管理器和传统存储
    await cacheManager.set(USER_INFO_KEY, updatedUser, CACHE_DURATION.LONG);
    wx.setStorageSync('userInfo', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    
    // 如果是未授权错误，清除登录状态
    if (error.message?.includes('未授权') || error.status === 401) {
      await logout();
    }
    
    throw error;
  }
};

/**
 * 获取用户信息（兼容新版API）
 * @returns {Promise<Object>} - 返回用户信息
 */
export const getUserInfo = async () => {
  try {
    // 检查是否已授权
    const authSetting = wx.getStorageSync('authSetting') || {};
    
    if (authSetting['scope.userInfo']) {
      // 如果已经授权，直接获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        return userInfo;
      }
    }
    
    // 使用新版API获取用户信息
    const { userInfo } = await wx.getUserProfile({
      desc: '用于完善会员资料'
    });
    
    // 保存授权状态
    wx.setStorageSync('authSetting', {
      ...authSetting,
      'scope.userInfo': true
    });
    
    // 保存用户信息
    wx.setStorageSync('userInfo', userInfo);
    
    return userInfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
export const isLoggedIn = async () => {
  try {
    // 从缓存管理器获取token
    const token = await cacheManager.get(LOGIN_TOKEN_KEY);
    
    // 同时检查传统存储方式
    if (!token) {
      const legacyToken = wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token');
      if (legacyToken && validator.isValidString(legacyToken)) {
        // 如果发现传统存储的token，迁移到缓存管理器
        await cacheManager.set(LOGIN_TOKEN_KEY, legacyToken, CACHE_DURATION.LONG);
        api.setToken(legacyToken);
        return true;
      }
      return false;
    }
    
    // 检查token是否有效
    if (!validator.isValidString(token)) {
      return false;
    }
    
    // 设置API请求的token
    api.setToken(token);
    
    // 检查token是否过期（可选：这里可以添加token有效性检查）
    const tokenExpiry = getCache('token_expiry');
    if (tokenExpiry && Date.now() > tokenExpiry) {
      // token已过期，尝试刷新
      try {
        await refreshToken();
        return true;
      } catch (error) {
        // 刷新失败，登录状态无效
        await logout();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
};

/**
 * 检查并强制登录
 * @returns {Promise<boolean>} - 是否登录成功
 */
export const checkAndLogin = async () => {
  if (await isLoggedIn()) {
    return true;
  }
  
  try {
    await wechatLogin();
    return true;
  } catch (error) {
    showToast('登录失败，请重试', { icon: 'none' });
    return false;
  }
};

/**
 * 用户登出
 */
export const logout = async () => {
  try {
    // 取消所有进行中的认证相关请求
    api.cancelRequest('auth_login');
    api.cancelRequest('auth_refresh_token');
    api.cancelRequest('auth_update_profile');
    
    // 调用后端登出接口（可选）
    try {
      await api.post('/auth/logout', {}, { abortKey: 'auth_logout' });
    } catch (error) {
      // 即使后端登出失败，也继续执行本地登出逻辑
      console.warn('后端登出失败，继续执行本地登出:', error);
    }
    
    // 使用缓存管理器清除登录状态
    await cacheManager.remove(LOGIN_TOKEN_KEY);
    await cacheManager.remove(USER_INFO_KEY);
    await cacheManager.clearByPrefix('auth_');
    
    // 清除传统存储数据
    wx.removeStorageSync('userToken');
    wx.removeStorageSync('jwt_token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('authSetting');
    removeCache('token_expiry');
    
    // 清除API请求的token
    api.setToken('');
    
    // 清除认证相关的API缓存
    api.clearCacheByPrefix('user_');
    api.clearCacheByPrefix('auth_');
    
    // 跳转到首页
    wx.reLaunch({ url: '/pages/index/index' });
  } catch (error) {
    console.error('登出失败:', error);
    showToast('登出失败，请重试', { icon: 'none' });
  }
};

/**
 * 绑定手机号
 * @param {Object} data - 包含encryptedData和iv的对象
 * @returns {Promise<Object>} - 绑定结果
 */
export const bindPhoneNumber = async (data) => {
  try {
    if (!await isLoggedIn()) {
      throw new Error('请先登录');
    }
    
    if (!data || !data.encryptedData || !data.iv) {
      throw new Error('手机号数据不完整');
    }
    
    const result = await api.post('/auth/bind-phone', data, { abortKey: 'auth_bind_phone' });
    
    // 更新用户信息
    if (result.user) {
      await cacheManager.set(USER_INFO_KEY, result.user, CACHE_DURATION.LONG);
      wx.setStorageSync('userInfo', result.user);
    }
    
    return result;
  } catch (error) {
    console.error('绑定手机号失败:', error);
    showToast('绑定手机号失败', { icon: 'none' });
    throw error;
  }
};

/**
 * 刷新token
 * @returns {Promise<Object>} - 刷新结果
 */
export const refreshToken = async () => {
  try {
    const currentToken = await cacheManager.get(LOGIN_TOKEN_KEY) || 
                        wx.getStorageSync('userToken') || 
                        wx.getStorageSync('jwt_token');
    
    if (!currentToken) {
      throw new Error('未找到token');
    }
    
    const result = await api.post('/auth/refresh-token', {
      token: currentToken
    }, { abortKey: 'auth_refresh_token' });
    
    if (result.token && validator.isValidString(result.token)) {
      // 更新token
      await cacheManager.set(LOGIN_TOKEN_KEY, result.token, CACHE_DURATION.LONG);
      wx.setStorageSync('userToken', result.token);
      wx.setStorageSync('jwt_token', result.token);
      
      // 存储token过期时间（如果后端提供）
      if (result.expires_in) {
        const expiryTime = Date.now() + (result.expires_in * 1000);
        setCache('token_expiry', expiryTime, CACHE_DURATION.LONG);
      }
      
      // 更新API请求的token
      api.setToken(result.token);
    }
    
    return result;
  } catch (error) {
    console.error('刷新token失败:', error);
    
    // 刷新失败，可能是token已过期或无效，清除登录状态
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
export const bindWordPressAccount = async (username, password) => {
  try {
    showLoading('绑定中...');
    
    const result = await api.post('/auth/bind-wordpress', {
      username, 
      password
    }, { abortKey: 'auth_bind_wordpress' });
    
    hideLoading();
    showToast('绑定成功', { icon: 'success' });
    
    // 更新用户信息
    if (result.user) {
      const currentUser = wx.getStorageSync('userInfo') || {};
      const updatedUser = { ...currentUser, ...result.user };
      wx.setStorageSync('userInfo', updatedUser);
    }
    
    return result;
  } catch (error) {
    hideLoading();
    console.error('绑定WordPress账号失败:', error);
    throw error;
  }
};

/**
 * 获取用户签到状态
 * @returns {Promise<Object>} - 返回签到状态
 */
export const getSignInStatus = async () => {
  try {
    // 获取签到状态，使用短时间缓存
    return await api.get('/user/signin/status', {}, { 
      useCache: true, 
      cacheDuration: CACHE_DURATION.SHORT 
    });
  } catch (error) {
    console.error('获取签到状态失败:', error);
    return { signed: false, consecutive_days: 0 };
  }
};

/**
 * 用户签到
 * @returns {Promise<Object>} - 返回签到结果
 */
export const signIn = async () => {
  try {
    showLoading('签到中...');
    
    const result = await api.post('/user/signin', {}, { abortKey: 'user_signin' });
    
    // 签到成功后清除签到状态缓存
    api.clearCache('/user/signin/status');
    
    hideLoading();
    showToast('签到成功，获得' + result.points + '积分', { icon: 'success' });
    
    return result;
  } catch (error) {
    hideLoading();
    console.error('签到失败:', error);
    throw error;
  }
};

// 导出所有方法
export default {
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