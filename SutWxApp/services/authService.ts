/**
 * 文件名: authService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 认证服务，处理用户登录、注册、信息管理等功能
 */

import request from '../utils/request';

interface UserInfo {
  id?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  [key: string]: unknown;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  [key: string]: unknown;
}

interface LoginResult {
  token: string;
  user: UserInfo;
}

async function wechatLogin(): Promise<LoginResult> {
  try {
    const loginResult = await wx.login<{ code: string }>();
    const { code } = loginResult;
    
    const result = await request.post<{ token: string; user?: UserInfo }>('/auth/wechat-login', { code }, { needAuth: false }) as { token: string; user?: UserInfo };
    
    if (result.token) {
      wx.setStorageSync('token', result.token);
    }
    
    if (result.user) {
      wx.setStorageSync('userInfo', result.user);
      return result as LoginResult;
    }
    
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

async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const result = await request.post<LoginResult>('/auth/login', {
      username,
      password
    }, { needAuth: false }) as LoginResult;
    
    wx.setStorageSync('token', result.token);
    wx.setStorageSync('userInfo', result.user);
    
    return result;
  } catch (error) {
    console.error('用户名密码登录失败:', error);
    throw error;
  }
}

async function loginWithPhone(phone: string, code: string): Promise<LoginResult> {
  try {
    const result = await request.post<LoginResult>('/auth/login/phone', {
      phone,
      code
    }, { needAuth: false }) as LoginResult;
    
    wx.setStorageSync('token', result.token);
    wx.setStorageSync('userInfo', result.user);
    
    return result;
  } catch (error) {
    console.error('手机号验证码登录失败:', error);
    throw error;
  }
}

async function logout(): Promise<void> {
  try {
    await request.post('/auth/logout');
  } catch (error) {
    console.error('登出失败:', error);
  } finally {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  }
}

async function getUserInfo(): Promise<UserInfo> {
  try {
    const userInfo = await request.get<UserInfo>('/user/info') as UserInfo;
    wx.setStorageSync('userInfo', userInfo);
    return userInfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

async function updateUserInfo(userInfo: UserInfo): Promise<UserInfo> {
  try {
    const updatedUserInfo = await request.put<UserInfo>('/user/info', userInfo) as UserInfo;
    wx.setStorageSync('userInfo', updatedUserInfo);
    return updatedUserInfo;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
}

async function getUserAddresses(): Promise<Address[]> {
  try {
    return await request.get<Address[]>('/user/addresses') as Address[];
  } catch (error) {
    console.error('获取用户地址列表失败:', error);
    throw error;
  }
}

async function addUserAddress(address: Omit<Address, 'id'>): Promise<Address> {
  try {
    return await request.post<Address>('/user/addresses', address) as Address;
  } catch (error) {
    console.error('添加用户地址失败:', error);
    throw error;
  }
}

async function sendVerificationCode(phone: string, type = 'login'): Promise<{ success: boolean }> {
  try {
    return await request.post<{ success: boolean }>('/auth/send-code', {
      phone,
      type
    }, { needAuth: false }) as { success: boolean };
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw error;
  }
}

async function verifyResetCode(phone: string, code: string): Promise<{ success: boolean }> {
  try {
    return await request.post<{ success: boolean }>('/auth/verify-reset-code', {
      phone,
      code
    }, { needAuth: false }) as { success: boolean };
  } catch (error) {
    console.error('验证重置密码验证码失败:', error);
    throw error;
  }
}

async function resetPassword(phone: string, code: string, newPassword: string): Promise<{ success: boolean }> {
  try {
    return await request.post<{ success: boolean }>('/auth/reset-password', {
      phone,
      code,
      newPassword
    }, { needAuth: false }) as { success: boolean };
  } catch (error) {
    console.error('重置密码失败:', error);
    throw error;
  }
}

async function changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
  try {
    return await request.post<{ success: boolean }>('/auth/change-password', {
      oldPassword,
      newPassword
    }) as { success: boolean };
  } catch (error) {
    console.error('修改密码失败:', error);
    throw error;
  }
}

function getToken(): string | null {
  return wx.getStorageSync<string>('token');
}

function isLoggedIn(): boolean {
  return !!getToken();
}

export {
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
  isLoggedIn,
  UserInfo,
  Address,
  LoginResult
};
