/**
 * 文件名: authService.ts
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: 认证服务，处理用户登录、注册、信息管理等功能
 */

import request, { CancelToken } from "../utils/request";
import securityUtil from "../utils/security";

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
   * 检查是否为生产环境
   */
  private isProduction(): boolean {
    try {
      if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
        return process.env.NODE_ENV === "production";
      }
    } catch (e) {
      // 忽略
    }
    return false;
  }

  /**
   * 安全日志
   * 修复 M-002：生产环境下不输出敏感信息
   */
  private safeLog(level: "log" | "warn" | "error", message: string, ...args: unknown[]): void {
    if (this.isProduction()) {
      if (level === "error" || level === "warn") {
        console.error(`[AuthService] ${message}`);
      }
      return;
    }
    const prefix = "[AuthService]";
    switch (level) {
      case "log":
        console.log(prefix, message, ...args);
        break;
      case "warn":
        console.warn(prefix, message, ...args);
        break;
      case "error":
        console.error(prefix, message, ...args);
        break;
    }
  }

  /**
   * 验证用户名格式
   * 修复 M-003：添加输入验证
   * @param username 用户名
   * @returns boolean 是否有效
   */
  private validateUsername(username: string): boolean {
    if (!username || typeof username !== "string") {
      return false;
    }
    // 用户名：4-20位字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * 验证密码强度
   * 修复 M-003：添加输入验证
   * @param password 密码
   * @returns boolean 是否有效
   */
  private validatePassword(password: string): boolean {
    if (!password || typeof password !== "string") {
      return false;
    }
    // 密码：至少6位，包含字母和数字
    if (password.length < 6 || password.length > 32) {
      return false;
    }
    // 至少包含一个字母和一个数字
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }

  /**
   * 验证手机号格式
   * 修复 M-003：添加输入验证
   * @param phone 手机号
   * @returns boolean 是否有效
   */
  private validatePhone(phone: string): boolean {
    if (!phone || typeof phone !== "string") {
      return false;
    }
    // 中国大陆手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证验证码格式
   * 修复 M-003：添加输入验证
   * @param code 验证码
   * @returns boolean 是否有效
   */
  private validateCode(code: string): boolean {
    if (!code || typeof code !== "string") {
      return false;
    }
    // 验证码：4-6位数字
    const codeRegex = /^\d{4,6}$/;
    return codeRegex.test(code);
  }

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
      this.safeLog("error", "微信登录失败");
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
    // 修复 M-003：添加输入验证
    if (!this.validateUsername(username)) {
      throw new Error("用户名格式不正确，需4-20位字母、数字或下划线");
    }
    if (!this.validatePassword(password)) {
      throw new Error("密码格式不正确，需6-32位且包含字母和数字");
    }

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
      this.safeLog("error", "用户名密码登录失败");
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
    // 修复 M-003：添加输入验证
    if (!this.validatePhone(phone)) {
      throw new Error("请输入正确的手机号");
    }
    if (!this.validateCode(code)) {
      throw new Error("验证码格式不正确");
    }

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
      this.safeLog("error", "手机号验证码登录失败");
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
      this.safeLog("warn", "登出请求失败");
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * 获取当前用户信息
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<UserInfo> 用户信息
   */
  async getUserInfo(options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<UserInfo> {
    try {
      const result = await request.get<ApiResponse<UserInfo>>("/user/info", undefined, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: "user_info"
      });
      this.validateResponse(result);

      if (result.data) {
        this.saveUserInfo(result.data);
      }

      return result.data;
    } catch (error) {
      this.safeLog("error", "获取用户信息失败");
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param userInfo 用户信息
   * @returns Promise<UserInfo> 更新后的用户信息
   */
  async updateUserInfo(userInfo: Partial<UserInfo>): Promise<UserInfo> {
    // 修复 M-003：添加输入验证
    if (userInfo.phone && !this.validatePhone(userInfo.phone)) {
      throw new Error("请输入正确的手机号");
    }
    if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      throw new Error("请输入正确的邮箱地址");
    }

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
      this.safeLog("error", "更新用户信息失败");
      throw error;
    }
  }

  /**
   * 获取用户地址列表
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<Address[]> 地址列表
   */
  async getUserAddresses(options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<Address[]> {
    try {
      const result = await request.get<ApiResponse<Address[]>>("/user/addresses", undefined, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: "user_addresses"
      });
      this.validateResponse(result);

      return result.data || [];
    } catch (error) {
      this.safeLog("error", "获取用户地址列表失败");
      throw error;
    }
  }

  /**
   * 添加用户地址
   * @param address 地址信息
   * @returns Promise<Address> 添加的地址
   */
  async addUserAddress(address: Omit<Address, "id">): Promise<Address> {
    // 修复 M-003：添加输入验证
    if (!address.name || address.name.trim().length === 0) {
      throw new Error("请输入收货人姓名");
    }
    if (!this.validatePhone(address.phone)) {
      throw new Error("请输入正确的手机号");
    }
    if (!address.province || !address.city || !address.district) {
      throw new Error("请选择完整的地区信息");
    }
    if (!address.detail || address.detail.trim().length === 0) {
      throw new Error("请输入详细地址");
    }

    try {
      const result = await request.post<ApiResponse<Address>>(
        "/user/addresses",
        address,
      );
      this.validateResponse(result);

      return result.data as Address;
    } catch (error) {
      this.safeLog("error", "添加用户地址失败");
      throw error;
    }
  }

  /**
   * 获取地址列表（兼容旧版API）
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<AddressOperationResult> 地址列表结果
   */
  async getAddressList(options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<AddressOperationResult> {
    try {
      const result = await request.get<AddressOperationResult>("/user/addresses", undefined, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: "user_addresses_compat"
      });
      return result;
    } catch (error) {
      this.safeLog("error", "获取地址列表失败");
      throw error;
    }
  }

  /**
   * 删除地址
   * @param id 地址ID
   * @returns Promise<AddressOperationResult> 删除结果
   */
  async deleteAddress(id: string): Promise<AddressOperationResult> {
    if (!id) {
      throw new Error("地址ID不能为空");
    }
    try {
      const result = await request.delete<AddressOperationResult>(
        `/user/addresses/${id}`,
      );
      return result;
    } catch (error) {
      this.safeLog("error", "删除地址失败");
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
    if (!data.id) {
      throw new Error("地址ID不能为空");
    }
    // 修复 M-003：添加输入验证
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error("请输入正确的手机号");
    }

    try {
      const result = await request.put<AddressOperationResult>(
        `/user/addresses/${data.id}`,
        data,
      );
      return result;
    } catch (error) {
      this.safeLog("error", "更新地址失败");
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
    // 修复 M-003：添加输入验证
    if (!this.validatePhone(phone)) {
      throw new Error("请输入正确的手机号");
    }

    try {
      const result = await request.post<ApiResponse<VerificationCodeResult>>(
        "/auth/send-code",
        { phone, type },
        { needAuth: false },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      this.safeLog("error", "发送验证码失败");
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
    // 修复 M-003：添加输入验证
    if (!this.validatePhone(phone)) {
      throw new Error("请输入正确的手机号");
    }
    if (!this.validateCode(code)) {
      throw new Error("验证码格式不正确");
    }

    try {
      const result = await request.post<ApiResponse<VerificationCodeResult>>(
        "/auth/verify-reset-code",
        { phone, code },
        { needAuth: false },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      this.safeLog("error", "验证重置密码验证码失败");
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
    // 修复 M-003：添加输入验证
    if (!this.validatePhone(phone)) {
      throw new Error("请输入正确的手机号");
    }
    if (!this.validateCode(code)) {
      throw new Error("验证码格式不正确");
    }
    if (!this.validatePassword(newPassword)) {
      throw new Error("密码格式不正确，需6-32位且包含字母和数字");
    }

    try {
      const result = await request.post<ApiResponse<PasswordResetResult>>(
        "/auth/reset-password",
        { phone, code, newPassword },
        { needAuth: false },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      this.safeLog("error", "重置密码失败");
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
    // 修复 M-003：添加输入验证
    if (!oldPassword || oldPassword.length === 0) {
      throw new Error("请输入旧密码");
    }
    if (!this.validatePassword(newPassword)) {
      throw new Error("新密码格式不正确，需6-32位且包含字母和数字");
    }

    try {
      const result = await request.post<ApiResponse<PasswordResetResult>>(
        "/auth/change-password",
        { oldPassword, newPassword },
      );
      this.validateResponse(result);

      return result.data || { success: false };
    } catch (error) {
      this.safeLog("error", "修改密码失败");
      throw error;
    }
  }

  /**
   * 获取存储的Token
   * @returns string | null Token字符串
   */
  getToken(): string | null {
    try {
      // 修复 H-002：从加密存储中读取 token
      const encryptedToken = wx.getStorageSync("token");
      if (!encryptedToken || typeof encryptedToken !== "string") {
        return null;
      }

      try {
        // 尝试解密（兼容旧版本明文存储）
        const decrypted = securityUtil.decrypt(encryptedToken);
        if (decrypted && typeof decrypted.token === "string") {
          return decrypted.token;
        }
      } catch (e) {
        // 解密失败，说明是旧版本明文存储，直接返回
        if (typeof encryptedToken === "string" && encryptedToken.length > 0) {
          // 迁移到加密存储
          this.saveToken(encryptedToken);
          return encryptedToken;
        }
      }
      return null;
    } catch (error) {
      this.safeLog("error", "获取Token失败");
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
          this.safeLog("error", "wx.login调用失败");
          reject(new Error("微信登录失败"));
        },
      });
    });
  }

  /**
   * 保存Token到存储（加密存储）
   * 修复 H-002：使用 AES 加密存储敏感数据
   * @param token Token字符串
   */
  private saveToken(token: string): void {
    try {
      if (!token || typeof token !== "string") {
        this.safeLog("warn", "无效的Token格式");
        return;
      }
      // 修复 H-002：使用 securityUtil.encrypt 加密存储
      const encrypted = securityUtil.encrypt({ token });
      wx.setStorageSync("token", encrypted);
    } catch (error) {
      this.safeLog("error", "保存Token失败");
    }
  }

  /**
   * 保存用户信息到存储（加密存储）
   * 修复 H-002：使用 AES 加密存储敏感数据
   * @param userInfo 用户信息
   */
  private saveUserInfo(userInfo: UserInfo): void {
    try {
      if (!userInfo || typeof userInfo !== "object") {
        this.safeLog("warn", "无效的用户信息格式");
        return;
      }
      // 修复 H-002：使用 securityUtil.encrypt 加密存储
      const encrypted = securityUtil.encrypt({ userInfo });
      wx.setStorageSync("userInfo", encrypted);
    } catch (error) {
      this.safeLog("error", "保存用户信息失败");
    }
  }

  /**
   * 获取存储的用户信息（解密读取）
   * @returns UserInfo | null 用户信息
   */
  getUserInfoFromStorage(): UserInfo | null {
    try {
      const encryptedData = wx.getStorageSync("userInfo");
      if (!encryptedData || typeof encryptedData !== "string") {
        return null;
      }

      try {
        // 尝试解密（兼容旧版本明文存储）
        const decrypted = securityUtil.decrypt(encryptedData);
        if (decrypted && decrypted.userInfo) {
          return decrypted.userInfo as UserInfo;
        }
      } catch (e) {
        // 解密失败，说明是旧版本明文存储
        if (encryptedData && typeof encryptedData === "object") {
          // 旧版本可能是对象，尝试迁移
          this.saveUserInfo(encryptedData as unknown as UserInfo);
          return encryptedData as unknown as UserInfo;
        }
      }
      return null;
    } catch (error) {
      this.safeLog("error", "获取用户信息失败");
      return null;
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
      this.safeLog("error", "清除认证数据失败");
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
