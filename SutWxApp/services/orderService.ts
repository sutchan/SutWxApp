/**
 * 文件名: orderService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-30 11:15
 * 描述: 订单管理服务，处理订单创建、查询、评价等功能
 */

import request from "../utils/request";
import { ApiResponse } from "./authService";

/**
 * 订单商品接口
 */
export interface OrderItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  sku: string;
  specs: Record<string, string>;
  isReviewed: boolean;
}

/**
 * 订单地址接口
 */
export interface OrderAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  zipCode?: string;
}

/**
 * 订单评价接口
 */
export interface OrderReview {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  items: OrderItemReview[];
}

/**
 * 订单商品评价接口
 */
export interface OrderItemReview {
  id: string;
  orderId: string;
  orderItemId: string;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
}

/**
 * 订单状态枚举
 */
export type OrderStatus = 
  | "pending_payment" 
  | "pending_shipment" 
  | "shipped" 
  | "delivered" 
  | "completed" 
  | "cancelled" 
  | "refunded" 
  | "returned" 
  | "failed";

/**
 * 订单接口
 */
export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  status: OrderStatus;
  statusText: string;
  totalAmount: number;
  actualPayment: number;
  paymentMethod: string;
  paymentTime?: string;
  shipmentTime?: string;
  deliveredTime?: string;
  completedTime?: string;
  cancelledTime?: string;
  refundedTime?: string;
  returnedTime?: string;
  items: OrderItem[];
  address: OrderAddress;
  remark?: string;
  trackingNumber?: string;
  logisticsCompany?: string;
  isReviewed: boolean;
  reviews?: OrderReview;
  createdAt: string;
  updatedAt: string;
}

/**
 * 订单列表查询参数
 */
export interface OrderQueryParams {
  status?: OrderStatus;
  pageNum?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  keyword?: string;
  [key: string]: unknown;
}

/**
 * 订单列表结果
 */
export interface OrderListResult {
  list: Order[];
  total: number;
  pageNum: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 退换货申请接口
 */
export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  type: "refund" | "return";
  reason: string;
  description?: string;
  images: string[];
  amount: number;
  status: "pending" | "approved" | "rejected" | "processed" | "completed";
  statusText: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 订单服务类
 */
class OrderService {
  /**
   * 获取订单列表
   * @param params 查询参数
   * @returns Promise<OrderListResult> 订单列表
   */
  async getOrderList(params?: OrderQueryParams): Promise<OrderListResult> {
    try {
      const result = await request.get<ApiResponse<OrderListResult>>("/orders", params);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[OrderService] 获取订单列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   * @param orderId 订单ID
   * @returns Promise<Order> 订单详情
   */
  async getOrderDetail(orderId: string): Promise<Order> {
    try {
      const result = await request.get<ApiResponse<Order>>(`/orders/${orderId}`);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[OrderService] 获取订单详情失败:", error);
      throw error;
    }
  }

  /**
   * 创建订单
   * @param data 订单数据
   * @returns Promise<{ orderId: string; payUrl: string }> 创建结果
   */
  async createOrder(data: {
    items: Array<{
      productId: number;
      specId: number;
      quantity: number;
    }>;
    addressId: string;
    paymentMethod: string;
    remark?: string;
    couponId?: string;
    points?: number;
  }): Promise<{ orderId: string; payUrl: string }> {
    try {
      const result = await request.post<ApiResponse<{ orderId: string; payUrl: string }>>("/orders", data);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[OrderService] 创建订单失败:", error);
      throw error;
    }
  }

  /**
   * 取消订单
   * @param orderId 订单ID
   * @returns Promise<boolean> 取消结果
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>(`/orders/${orderId}/cancel`);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[OrderService] 取消订单失败:", error);
      throw error;
    }
  }

  /**
   * 确认收货
   * @param orderId 订单ID
   * @returns Promise<boolean> 确认结果
   */
  async confirmReceipt(orderId: string): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>(`/orders/${orderId}/confirm`);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[OrderService] 确认收货失败:", error);
      throw error;
    }
  }

  /**
   * 删除订单
   * @param orderId 订单ID
   * @returns Promise<boolean> 删除结果
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const result = await request.delete<ApiResponse<{ success: boolean }>>(`/orders/${orderId}`);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[OrderService] 删除订单失败:", error);
      throw error;
    }
  }

  /**
   * 提交订单评价
   * @param orderId 订单ID
   * @param data 评价数据
   * @returns Promise<boolean> 提交结果
   */
  async submitOrderReview(orderId: string, data: {
    rating: number;
    content: string;
    images?: string[];
    items: Array<{
      orderItemId: string;
      productId: number;
      rating: number;
      content: string;
      images?: string[];
    }>;
  }): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>(`/orders/${orderId}/reviews`, data);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[OrderService] 提交订单评价失败:", error);
      throw error;
    }
  }

  /**
   * 获取订单评价
   * @param orderId 订单ID
   * @returns Promise<OrderReview> 订单评价
   */
  async getOrderReview(orderId: string): Promise<OrderReview> {
    try {
      const result = await request.get<ApiResponse<OrderReview>>(`/orders/${orderId}/reviews`);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[OrderService] 获取订单评价失败:", error);
      throw error;
    }
  }

  /**
   * 申请退换货
   * @param data 退换货数据
   * @returns Promise<{ returnId: string }> 申请结果
   */
  async applyReturn(data: {
    orderId: string;
    orderItemId: string;
    type: "refund" | "return";
    reason: string;
    description?: string;
    images: string[];
    amount: number;
  }): Promise<{ returnId: string }> {
    try {
      const result = await request.post<ApiResponse<{ returnId: string }>>("/returns", data);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[OrderService] 申请退换货失败:", error);
      throw error;
    }
  }

  /**
   * 获取退换货申请列表
   * @param params 查询参数
   * @returns Promise<ReturnRequest[]> 退换货申请列表
   */
  async getReturnRequests(params?: {
    status?: string;
    pageNum?: number;
    pageSize?: number;
  }): Promise<ReturnRequest[]> {
    try {
      const result = await request.get<ApiResponse<ReturnRequest[]>>("/returns", params);
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[OrderService] 获取退换货申请列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取退换货申请详情
   * @param returnId 退换货申请ID
   * @returns Promise<ReturnRequest> 退换货申请详情
   */
  async getReturnRequestDetail(returnId: string): Promise<ReturnRequest> {
    try {
      const result = await request.get<ApiResponse<ReturnRequest>>(`/returns/${returnId}`);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[OrderService] 获取退换货申请详情失败:", error);
      throw error;
    }
  }

  /**
   * 取消退换货申请
   * @param returnId 退换货申请ID
   * @returns Promise<boolean> 取消结果
   */
  async cancelReturnRequest(returnId: string): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>(`/returns/${returnId}/cancel`);
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[OrderService] 取消退换货申请失败:", error);
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

const orderService = new OrderService();

export default orderService;
