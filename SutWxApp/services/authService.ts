/**
 * 文件名: authService.ts
 * 版本号: 1.0.2
 * 更新日期: 2025-12-29 15:00
 * 描述: 认证服务，处理用户登录、注册、信息管理等功能
 */

import request from "../utils/request";

/**
 * 用户基本信息接口
 */
export interface UserInfo {
  id?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  gender?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * 用户地址接口
 */
export interface Address {
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

/**
 * 登录结果接口
 */
export interface LoginResult {
  token: string;
  user: UserInfo;
  expiresIn?: number;
}

/**
 * API响应基础接口
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * 验证码发送结果接口
 */
export interface VerificationCodeResult {
  success: boolean;
  message?: string;
  expiresIn?: number;
}

/**
 * 密码重置结果接口
 */
export interface PasswordResetResult {
  success: boolean;
  message?: string;
}

/**
 * 地址操作结果接口
 */
export interface AddressOperationResult {
  code: number;
  message?: string;
  data?: Address;
}

/**
 * 登录参数接口
 */
interface LoginParams {
  username?: string;
  password?: string;
  phone?: string;
  code?: string;
}

/**
 * 认证服务类
 */
class AuthService {
  /**
   * 微信登录
   * @returns Promise<LoginResult> 登录结果
   * @throws 登录失败时抛出错误
   */
  async wechatLogin(): Promise<LoginResult> {
    try {
      const loginResult = await this.wxLogin();
      const result = await request.post<ApiResponse<LoginResult>>(
        "/auth/wechat-login",
        { code: loginResult },
        { needAuth: false },
      );

      this.validateResponse(result);

      if (result.data.token) {
        this.saveToken(result.data.token);
      }
      if (result.data.user) {
        this.saveUserInfo(result.data.user);
      }

      return result.data;
    } catch (error) {
      console.error("[AuthService] 微信登录失败:", error);
      throw error;
    }
  }

  /**
   * 用户名密码登录
   * @param username 用户名
   * @param password 密码
   * @returns Promise<LoginResult> 登录结果
   */
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const result = await request.post<ApiResponse<LoginResult>>(
        "/auth/login",
        { username, password },
        { needAuth: false },
      );

      this.validateResponse(result);

      if (result.data.token) {
        this.saveToken(result.data.token);
      }
      if (result.data.user) {
        this.saveUserInfo(result.data.user);
      }

      return result.data;
    } catch (error) {
      console.error("[AuthService] 用户名密码登录失败:", error);
      throw error;
    }
  }

  /**
   * 手机号验证码登录
   * @param phone 手机号
   * @param code 验证码
   * @returns Promise<LoginResult> 登录结果
   */
  async loginWithPhone(phone: string, code: string): Promise<LoginResult> {
    try {
      const result = await request.post<ApiResponse<LoginResult>>(
        "/auth/login/phone",
        { phone, code },
        { needAuth: false },
      );

      this.validateResponse(result);

      if (result.data.token) {
        this.saveToken(result.data.token);
      }
      if (result.data.user) {
        this.saveUserInfo(result.data.user);
      }

      return result.data;
    } catch (error) {
      console.error("[AuthService] 手机号验证码登录失败:", error);
      throw error;
    }
  }

  /**
   * 用户登出
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      await request.post("/auth/logout");
    } catch (error) {
      console.warn("[AuthService] 登出请求失败:", error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * 获取当前用户信息
   * @returns Promise<UserInfo> 用户信息
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      const result = await request.get<ApiResponse<UserInfo>>("/user/info");
      this.validateResponse(result);

      if (result.data) {
        this.saveUserInfo(result.data);
      }

      return result.data;
    } catch (error) {
      console.error("[AuthService] 获取用户信息失败:", error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param userInfo 用户信息
   * @returns Promise<UserInfo> 更新后的用户信息
   */
  async updateUserInfo(userInfo: Partial<UserInfo>): Promise<UserInfo> {
    try {
      const result = await request.put<ApiResponse<UserInfo>>(
        "/user/info",
        userInfo,
      );
      this.validateResponse(result);

      if (result.data) {
        this.saveUserInfo(result.data);
      }

      return result.data;
    } catch (error) {
      console.error("[AuthService] 更新用户信息失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户地址列表
   * @returns Promise<Address[]> 地址列表
   */
  async getUserAddresses(): Promise<Address[]> {
    try {
      const result =
        await request.get<ApiResponse<Address[]>>("/user/addresses");
      this.validateResponse(result);

      return result.data || [];
    } catch (error) {
      console.error("[AuthService] 获取用户地址列表失败:", error);
      throw error;
    }
  }

  /**
   * 添加用户地址
   * @param address 地址信息
   * @returns Promise<Address> 添加的地址
   */
  async addUserAddress(address: Omit<Address, "id">): Promise<Address> {
    try {
      const result = await request.post<ApiResponse<Address>>(
        "/user/addresses",
        address,
      );
      this.validateResponse(result);

      return result.data as Address;
    } catch (error) {
      console.error("[AuthService] 添加用户地址失败:", error);
      throw error;
    }
  }

  /**
   * 获取地址列表（兼容旧版API）
   * @returns Promise<AddressOperationResult> 地址列表结果
   */
  async getAddressList(): Promise<AddressOperationResult> {
    try {
      const result =
        await request.get<AddressOperationResult>("/user/addresses");
      return result;
    } catch (error) {
      console.error("[AuthService] 获取地址列表失败:", error);
      throw error;
    }
  }

  /**
   * 删除地址
   * @param id 地址ID
   * @returns Promise<AddressOperationResult> 删除结果
   */
  async deleteAddress(id: string): Promise<AddressOperationResult> {
    try {
      const result = await request.delete<AddressOperationResult>(
        `/user/addresses/${id}`,
      );
      return result;
    } catch (error) {
      console.error("[AuthService] 删除地址失败:", error);
      throw error;
    }
  }

  /**
   * 更新地址
   * @param data 地址更新数据
   * @returns Promise<AddressOperationResult> 更新结果
   */
  async updateAddress(
    data: Partial<Address> & { id: string },
  ): Promise<AddressOperationResult> {
    try {
      const result = await request.put<AddressOperationResult>(
        `/user/addresses/${data.id}`,
        data,
      );
      return result;
    } catch (error) {
      console.error("[AuthService] 更新地址失败:", error);
      throw error;
    }
  }

  /**
   * 发送验证码
   * @param phone 手机号
   * @param type 验证码类型
   * @returns Promise<VerificationCodeResult> 发送结果
   */
  async sendVerificationCode(
    phone: string,
    type = "login",
  ): Promise<VerificationCodeResult> {
    try {
      const result = await request.post<ApiResponse<VerificationCodeResult>>(
        "/auth/send-code",
        { phone, type },
        { needAuth: false },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      console.error("[AuthService] 发送验证码失败:", error);
      throw error;
    }
  }

  /**
   * 验证重置密码验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns Promise<VerificationCodeResult> 验证结果
   */
  async verifyResetCode(
    phone: string,
    code: string,
  ): Promise<VerificationCodeResult> {
    try {
      const result = await request.post<ApiResponse<VerificationCodeResult>>(
        "/auth/verify-reset-code",
        { phone, code },
        { needAuth: false },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      console.error("[AuthService] 验证重置密码验证码失败:", error);
      throw error;
    }
  }

  /**
   * 重置密码
   * @param phone 手机号
   * @param code 验证码
   * @param newPassword 新密码
   * @returns Promise<PasswordResetResult> 重置结果
   */
  async resetPassword(
    phone: string,
    code: string,
    newPassword: string,
  ): Promise<PasswordResetResult> {
    try {
      const result = await request.post<ApiResponse<PasswordResetResult>>(
        "/auth/reset-password",
        { phone, code, newPassword },
        { needAuth: false },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      console.error("[AuthService] 重置密码失败:", error);
      throw error;
    }
  }

  /**
   * 修改密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns Promise<PasswordResetResult> 修改结果
   */
  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<PasswordResetResult> {
    try {
      const result = await request.post<ApiResponse<PasswordResetResult>>(
        "/auth/change-password",
        { oldPassword, newPassword },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      console.error("[AuthService] 修改密码失败:", error);
      throw error;
    }
  }

  /**
   * 获取存储的Token
   * @returns string | null Token字符串
   */
  getToken(): string | null {
    try {
      const token = wx.getStorageSync("token");
      return typeof token === "string" && token.length > 0 ? token : null;
    } catch (error) {
      console.error("[AuthService] 获取Token失败:", error);
      return null;
    }
  }

  /**
   * 检查是否已登录
   * @returns boolean 是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * 微信登录凭证获取
   * @returns Promise<string> 登录凭证code
   * @throws 获取失败时抛出错误
   */
  private async wxLogin(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            resolve(loginRes.code);
          } else {
            reject(new Error("微信登录凭证获取失败"));
          }
        },
        fail: (error) => {
          console.error("[AuthService] wx.login调用失败:", error);
          reject(new Error("微信登录失败"));
        },
      });
    });
  }

  /**
   * 保存Token到存储
   * @param token Token字符串
   */
  private saveToken(token: string): void {
    try {
      if (!token || typeof token !== "string") {
        console.warn("[AuthService] 无效的Token格式");
        return;
      }
      wx.setStorageSync("token", token);
    } catch (error) {
      console.error("[AuthService] 保存Token失败:", error);
    }
  }

  /**
   * 保存用户信息到存储
   * @param userInfo 用户信息
   */
  private saveUserInfo(userInfo: UserInfo): void {
    try {
      if (!userInfo || typeof userInfo !== "object") {
        console.warn("[AuthService] 无效的用户信息格式");
        return;
      }
      wx.setStorageSync("userInfo", userInfo);
    } catch (error) {
      console.error("[AuthService] 保存用户信息失败:", error);
    }
  }

  /**
   * 清除认证数据
   */
  private clearAuthData(): void {
    try {
      wx.removeStorageSync("token");
      wx.removeStorageSync("userInfo");
      wx.removeStorageSync("openid");
    } catch (error) {
      console.error("[AuthService] 清除认证数据失败:", error);
    }
  }

  /**
   * 验证API响应
   * @param response API响应对象
   * @throws 响应无效时抛出错误
   */
  private validateResponse<T>(response: T): void {
    if (!response || typeof response !== "object") {
      throw new Error("无效的API响应");
    }

    const resp = response as {
      code?: number;
      success?: boolean;
      message?: string;
    };

    if (resp.code !== undefined && resp.code !== 200) {
      throw new Error(resp.message || "API请求失败");
    }

    if (resp.success === false) {
      throw new Error(resp.message || "API请求失败");
    }
  }
}

const authService = new AuthService();

export default authService;
