/**
 * 文件名: logisticsService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-30 11:00
 * 描述: 物流服务，处理物流信息查询相关功能
 */

import request from "../utils/request";
import { ApiResponse } from "./authService";

/**
 * 物流轨迹节点接口
 */
export interface LogisticsTrack {
  time: string;
  description: string;
  location: string;
  operator?: string;
}

/**
 * 物流公司接口
 */
export interface LogisticsCompany {
  code: string;
  name: string;
  logo?: string;
  isRecommended: boolean;
}

/**
 * 物流信息接口
 */
export interface LogisticsInfo {
  id: string;
  orderId: string;
  trackingNumber: string;
  companyCode: string;
  companyName: string;
  status: "pending" | "in_transit" | "delivered" | "exception" | "cancelled";
  statusText: string;
  estimatedDeliveryTime?: string;
  deliveredTime?: string;
  tracks: LogisticsTrack[];
  lastUpdateTime: string;
  createdAt: string;
}

/**
 * 物流服务类
 */
class LogisticsService {
  /**
   * 查询物流信息
   * @param orderId 订单ID
   * @returns Promise<LogisticsInfo> 物流信息
   */
  async getLogisticsInfo(orderId: string): Promise<LogisticsInfo> {
    try {
      const result = await request.get<ApiResponse<LogisticsInfo>>(`/logistics/order/${orderId}`);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[LogisticsService] 查询物流信息失败:", error);
      throw error;
    }
  }

  /**
   * 通过物流单号查询物流信息
   * @param trackingNumber 物流单号
   * @param companyCode 物流公司代码
   * @returns Promise<LogisticsInfo> 物流信息
   */
  async getLogisticsByTrackingNumber(trackingNumber: string, companyCode: string): Promise<LogisticsInfo> {
    try {
      const result = await request.get<ApiResponse<LogisticsInfo>>("/logistics/tracking", {
        trackingNumber,
        companyCode
      });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[LogisticsService] 通过物流单号查询物流信息失败:", error);
      throw error;
    }
  }

  /**
   * 获取物流公司列表
   * @returns Promise<LogisticsCompany[]> 物流公司列表
   */
  async getLogisticsCompanies(): Promise<LogisticsCompany[]> {
    try {
      const result = await request.get<ApiResponse<LogisticsCompany[]>>("/logistics/companies");
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[LogisticsService] 获取物流公司列表失败:", error);
      throw error;
    }
  }

  /**
   * 推荐物流公司
   * @returns Promise<LogisticsCompany[]> 推荐物流公司列表
   */
  async getRecommendedLogisticsCompanies(): Promise<LogisticsCompany[]> {
    try {
      const result = await request.get<ApiResponse<LogisticsCompany[]>>("/logistics/companies/recommended");
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[LogisticsService] 获取推荐物流公司失败:", error);
      throw error;
    }
  }

  /**
   * 订阅物流状态更新
   * @param orderId 订单ID
   * @returns Promise<boolean> 订阅结果
   */
  async subscribeLogisticsUpdates(orderId: string): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/logistics/subscribe", {
        orderId
      });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[LogisticsService] 订阅物流状态更新失败:", error);
      throw error;
    }
  }

  /**
   * 取消物流状态更新订阅
   * @param orderId 订单ID
   * @returns Promise<boolean> 取消订阅结果
   */
  async unsubscribeLogisticsUpdates(orderId: string): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/logistics/unsubscribe", {
        orderId
      });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[LogisticsService] 取消物流状态更新订阅失败:", error);
      throw error;
    }
  }

  /**
   * 查询物流状态是否已更新
   * @param orderId 订单ID
   * @param lastUpdateTime 上次更新时间
   * @returns Promise<boolean> 是否已更新
   */
  async checkLogisticsUpdate(orderId: string, lastUpdateTime: string): Promise<boolean> {
    try {
      const result = await request.get<ApiResponse<{ hasUpdate: boolean }>>("/logistics/check-update", {
        orderId,
        lastUpdateTime
      });
      this.validateResponse(result);
      return result.data?.hasUpdate || false;
    } catch (error) {
      console.error("[LogisticsService] 查询物流状态更新失败:", error);
      throw error;
    }
  }

  /**
   * 验证物流单号格式
   * @param trackingNumber 物流单号
   * @returns Promise<boolean> 验证结果
   */
  async validateTrackingNumber(trackingNumber: string): Promise<boolean> {
    try {
      const result = await request.get<ApiResponse<{ isValid: boolean }>>("/logistics/validate-tracking", {
        trackingNumber
      });
      this.validateResponse(result);
      return result.data?.isValid || false;
    } catch (error) {
      console.error("[LogisticsService] 验证物流单号格式失败:", error);
      throw error;
    }
  }

  /**
   * 自动识别物流公司
   * @param trackingNumber 物流单号
   * @returns Promise<LogisticsCompany> 识别结果
   */
  async autoIdentifyLogisticsCompany(trackingNumber: string): Promise<LogisticsCompany> {
    try {
      const result = await request.get<ApiResponse<LogisticsCompany>>("/logistics/identify-company", {
        trackingNumber
      });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[LogisticsService] 自动识别物流公司失败:", error);
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

const logisticsService = new LogisticsService();

export default logisticsService;
