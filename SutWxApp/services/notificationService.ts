/**
 * 文件名: notificationService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-30 11:45
 * 描述: 通知服务，处理系统通知、订单通知等功能
 */

import request from "../utils/request";
import { ApiResponse } from "./authService";

/**
 * 通知类型枚举
 */
export type NotificationType = 
  | "order" 
  | "system" 
  | "activity" 
  | "message" 
  | "reward" 
  | "follow" 
  | "comment" 
  | "like";

/**
 * 通知状态枚举
 */
export type NotificationStatus = "unread" | "read" | "deleted";

/**
 * 通知接口
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data: Record<string, unknown>;
  status: NotificationStatus;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

/**
 * 通知查询参数接口
 */
export interface NotificationParams {
  page?: number;
  pageSize?: number;
  type?: NotificationType;
  status?: NotificationStatus;
  sort?: string;
}

/**
 * 通知结果接口
 */
export interface NotificationResult {
  list: Notification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

/**
 * 通知设置接口
 */
export interface NotificationSetting {
  id: string;
  userId: string;
  type: NotificationType;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 通知服务类
 */
class NotificationService {
  /**
   * 获取通知列表
   * @param params 查询参数
   * @returns Promise<NotificationResult> 通知列表结果
   */
  async getNotifications(params: NotificationParams = {}): Promise<NotificationResult> {
    try {
      const result = await request.get<ApiResponse<NotificationResult>>("/notifications", {
        page: 1,
        pageSize: 20,
        sort: "newest",
        ...params,
      });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[NotificationService] 获取通知列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取未读通知数量
   * @returns Promise<number> 未读通知数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      const result = await request.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
      this.validateResponse(result);
      return result.data?.count || 0;
    } catch (error) {
      console.error("[NotificationService] 获取未读通知数量失败:", error);
      throw error;
    }
  }

  /**
   * 标记通知为已读
   * @param notificationId 通知ID
   * @returns Promise<boolean> 操作结果
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>(`/notifications/${notificationId}/read`);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 标记通知为已读失败:", error);
      throw error;
    }
  }

  /**
   * 标记所有通知为已读
   * @returns Promise<boolean> 操作结果
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/notifications/read-all");
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 标记所有通知为已读失败:", error);
      throw error;
    }
  }

  /**
   * 删除通知
   * @param notificationId 通知ID
   * @returns Promise<boolean> 操作结果
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await request.delete<ApiResponse<{ success: boolean }>>(`/notifications/${notificationId}`);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 删除通知失败:", error);
      throw error;
    }
  }

  /**
   * 获取通知详情
   * @param notificationId 通知ID
   * @returns Promise<Notification> 通知详情
   */
  async getNotificationDetail(notificationId: string): Promise<Notification> {
    try {
      const result = await request.get<ApiResponse<Notification>>(`/notifications/${notificationId}`);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[NotificationService] 获取通知详情失败:", error);
      throw error;
    }
  }

  /**
   * 获取通知设置
   * @returns Promise<NotificationSetting[]> 通知设置列表
   */
  async getNotificationSettings(): Promise<NotificationSetting[]> {
    try {
      const result = await request.get<ApiResponse<NotificationSetting[]>>("/notifications/settings");
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[NotificationService] 获取通知设置失败:", error);
      throw error;
    }
  }

  /**
   * 更新通知设置
   * @param settings 通知设置列表
   * @returns Promise<boolean> 操作结果
   */
  async updateNotificationSettings(settings: Partial<NotificationSetting>[]): Promise<boolean> {
    try {
      const result = await request.put<ApiResponse<{ success: boolean }>>("/notifications/settings", { settings });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 更新通知设置失败:", error);
      throw error;
    }
  }

  /**
   * 订阅通知
   * @param types 通知类型列表
   * @returns Promise<boolean> 订阅结果
   */
  async subscribeNotifications(types: NotificationType[]): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/notifications/subscribe", { types });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 订阅通知失败:", error);
      throw error;
    }
  }

  /**
   * 取消订阅通知
   * @param types 通知类型列表
   * @returns Promise<boolean> 取消订阅结果
   */
  async unsubscribeNotifications(types: NotificationType[]): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/notifications/unsubscribe", { types });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 取消订阅通知失败:", error);
      throw error;
    }
  }

  /**
   * 获取通知统计
   * @returns Promise<Record<NotificationType, number>> 通知统计结果
   */
  async getNotificationStats(): Promise<Record<NotificationType, number>> {
    try {
      const result = await request.get<ApiResponse<Record<NotificationType, number>>>("/notifications/stats");
      this.validateResponse(result);
      return result.data || {};
    } catch (error) {
      console.error("[NotificationService] 获取通知统计失败:", error);
      throw error;
    }
  }

  /**
   * 接收推送通知
   * @param payload 通知载荷
   * @returns Promise<boolean> 接收结果
   */
  async receivePushNotification(payload: Record<string, unknown>): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/notifications/push/receive", payload);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[NotificationService] 接收推送通知失败:", error);
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

const notificationService = new NotificationService();

export default notificationService;
