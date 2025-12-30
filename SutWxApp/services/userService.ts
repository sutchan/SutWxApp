/**
 * 文件名: userService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-30 10:00
 * 描述: 用户管理服务，处理用户等级、用户成长值等功能
 */

import request from "../utils/request";
import { ApiResponse, UserInfo } from "./authService";

/**
 * 用户等级信息接口
 */
export interface UserLevel {
  id: number;
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  privileges: string[];
  icon?: string;
}

/**
 * 用户成长值记录接口
 */
export interface GrowthRecord {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

/**
 * 用户成长值统计接口
 */
export interface GrowthStats {
  totalPoints: number;
  currentLevel: UserLevel;
  nextLevel: UserLevel;
  pointsToNextLevel: number;
  recentRecords: GrowthRecord[];
}

/**
 * 用户管理服务类
 */
class UserService {
  /**
   * 获取用户成长值统计信息
   * @returns Promise<GrowthStats> 成长值统计信息
   */
  async getGrowthStats(): Promise<GrowthStats> {
    try {
      const result = await request.get<ApiResponse<GrowthStats>>("/user/growth/stats");
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[UserService] 获取用户成长值统计失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户成长值记录列表
   * @param params 查询参数
   * @returns Promise<GrowthRecord[]> 成长值记录列表
   */
  async getGrowthRecords(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
  }): Promise<GrowthRecord[]> {
    try {
      const result = await request.get<ApiResponse<GrowthRecord[]>>("/user/growth/records", params);
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[UserService] 获取用户成长值记录失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户等级列表
   * @returns Promise<UserLevel[]> 用户等级列表
   */
  async getUserLevels(): Promise<UserLevel[]> {
    try {
      const result = await request.get<ApiResponse<UserLevel[]>>("/user/levels");
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[UserService] 获取用户等级列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取当前用户等级
   * @returns Promise<UserLevel> 当前用户等级
   */
  async getCurrentLevel(): Promise<UserLevel> {
    try {
      const result = await request.get<ApiResponse<UserLevel>>("/user/level");
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[UserService] 获取当前用户等级失败:", error);
      throw error;
    }
  }

  /**
   * 验证用户等级权限
   * @param privilege 权限名称
   * @returns Promise<boolean> 是否拥有该权限
   */
  async checkLevelPrivilege(privilege: string): Promise<boolean> {
    try {
      const result = await request.get<ApiResponse<{ hasPrivilege: boolean }>>("/user/check-privilege", { privilege });
      this.validateResponse(result);
      return result.data?.hasPrivilege || false;
    } catch (error) {
      console.error("[UserService] 验证用户等级权限失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户积分明细
   * @param params 查询参数
   * @returns Promise<any[]> 积分明细列表
   */
  async getPointsRecords(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
  }): Promise<any[]> {
    try {
      const result = await request.get<ApiResponse<any[]>>("/user/points/records", params);
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[UserService] 获取用户积分明细失败:", error);
      throw error;
    }
  }

  /**
   * 绑定手机号
   * @param phone 手机号
   * @param code 验证码
   * @returns Promise<UserInfo> 更新后的用户信息
   */
  async bindPhone(phone: string, code: string): Promise<UserInfo> {
    try {
      const result = await request.post<ApiResponse<UserInfo>>("/user/bind-phone", { phone, code });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[UserService] 绑定手机号失败:", error);
      throw error;
    }
  }

  /**
   * 解绑手机号
   * @returns Promise<UserInfo> 更新后的用户信息
   */
  async unbindPhone(): Promise<UserInfo> {
    try {
      const result = await request.post<ApiResponse<UserInfo>>("/user/unbind-phone");
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[UserService] 解绑手机号失败:", error);
      throw error;
    }
  }

  /**
   * 设置用户偏好
   * @param preferences 用户偏好设置
   * @returns Promise<boolean> 设置结果
   */
  async setPreferences(preferences: Record<string, any>): Promise<boolean> {
    try {
      const result = await request.put<ApiResponse<{ success: boolean }>>("/user/preferences", preferences);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[UserService] 设置用户偏好失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户偏好
   * @returns Promise<Record<string, any>> 用户偏好设置
   */
  async getPreferences(): Promise<Record<string, any>> {
    try {
      const result = await request.get<ApiResponse<Record<string, any>>>("/user/preferences");
      this.validateResponse(result);
      return result.data || {};
    } catch (error) {
      console.error("[UserService] 获取用户偏好失败:", error);
      throw error;
    }
  }

  /**
   * 验证API响应
   * @param response API响应对象
   * @throws 响应无效时抛出错误
   */
  private validateResponse<T>(response: ApiResponse<T>): void {
    if (!response || typeof response !== "object") {
      throw new Error("无效的API响应");
    }

    if (response.code !== undefined && response.code !== 200) {
      throw new Error(response.message || "API请求失败");
    }

    if (response.success === false) {
      throw new Error(response.message || "API请求失败");
    }
  }
}

const userService = new UserService();

export default userService;
