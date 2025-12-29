/**
 * 文件名: pointsService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 积分服务，处理积分获取、使用、查询等功能
 */

import request from "../utils/request";

interface PointsBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface PointsHistoryParams {
  page?: number;
  pageSize?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}

interface PointsHistoryResult {
  list: PointsHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface PointsHistoryItem {
  id: string;
  type: string;
  amount: number;
  balance: number;
  reason: string;
  createdAt: string;
  orderId?: string;
}

interface PointsTasksParams {
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

interface PointsTask {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  reward: number;
  deadline?: string;
  progress: number;
  maxProgress: number;
}

interface PointsTasksResult {
  list: PointsTask[];
  total: number;
  page: number;
  pageSize: number;
}

interface ClaimResult {
  success: boolean;
  reward: number;
  balance: number;
  message?: string;
}

interface CompleteResult {
  success: boolean;
  taskId: string;
  message?: string;
}

interface UsePointsParams {
  amount: number;
  reason: string;
  orderId?: string;
  [key: string]: unknown;
}

interface UsePointsResult {
  success: boolean;
  amount: number;
  balance: number;
  orderId?: string;
}

interface ExchangeProductParams {
  productId: string;
  quantity?: number;
}

interface ExchangeProductResult {
  success: boolean;
  orderId: string;
  amount: number;
  balance: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface ExchangeProductsParams {
  page?: number;
  pageSize?: number;
  category?: string;
  sort?: string;
}

interface ExchangeProduct {
  id: string;
  name: string;
  image: string;
  points: number;
  stock: number;
  exchangeCount: number;
}

interface ExchangeProductsResult {
  list: ExchangeProduct[];
  total: number;
  page: number;
  pageSize: number;
}

interface PointsRules {
  exchangeRate: number;
  expireDays: number;
  maxPointsPerOrder: number;
  rules: {
    id: string;
    name: string;
    description: string;
    points: number;
    type: string;
  }[];
}

interface PointsStatsParams {
  timeRange?: string;
}

interface PointsStatsResult {
  totalEarned: number;
  totalSpent: number;
  netChange: number;
  dailyStats: {
    date: string;
    earned: number;
    spent: number;
  }[];
}

async function getPointsBalance(): Promise<PointsBalance> {
  try {
    const result = (await request.get<PointsBalance>(
      "/points/balance",
    )) as PointsBalance;
    return result;
  } catch (error) {
    console.error("获取积分余额失败:", error);
    throw error;
  }
}

async function getPointsHistory(
  params: PointsHistoryParams = {},
): Promise<PointsHistoryResult> {
  try {
    return (await request.get<PointsHistoryResult>("/points/history", {
      page: 1,
      pageSize: 20,
      type: "all",
      ...params,
    })) as PointsHistoryResult;
  } catch (error) {
    console.error("获取积分明细失败:", error);
    throw error;
  }
}

async function getPointsTasks(
  params: PointsTasksParams = {},
): Promise<PointsTasksResult> {
  try {
    return (await request.get<PointsTasksResult>("/points/tasks", {
      type: "all",
      status: "all",
      page: 1,
      pageSize: 20,
      ...params,
    })) as PointsTasksResult;
  } catch (error) {
    console.error("获取积分任务列表失败:", error);
    throw error;
  }
}

async function claimTaskReward(taskId: string): Promise<ClaimResult> {
  try {
    return (await request.post<ClaimResult>(
      `/points/tasks/${taskId}/claim`,
    )) as ClaimResult;
  } catch (error) {
    console.error("领取积分任务奖励失败:", error);
    throw error;
  }
}

async function completeTask(
  taskId: string,
  data: Record<string, unknown> = {},
): Promise<CompleteResult> {
  try {
    return (await request.post<CompleteResult>(
      `/points/tasks/${taskId}/complete`,
      data,
    )) as CompleteResult;
  } catch (error) {
    console.error("完成积分任务失败:", error);
    throw error;
  }
}

async function usePoints(
  amount: number,
  reason: string,
  data?: Omit<UsePointsParams, "amount" | "reason">,
): Promise<UsePointsResult> {
  try {
    return (await request.post<UsePointsResult>("/points/use", {
      amount,
      reason,
      ...data,
    })) as UsePointsResult;
  } catch (error) {
    console.error("使用积分失败:", error);
    throw error;
  }
}

async function exchangeProduct(
  productId: string,
  quantity = 1,
): Promise<ExchangeProductResult> {
  try {
    return (await request.post<ExchangeProductResult>(
      "/points/exchange/product",
      {
        productId,
        quantity,
      },
    )) as ExchangeProductResult;
  } catch (error) {
    console.error("积分兑换商品失败:", error);
    throw error;
  }
}

async function getExchangeProducts(
  params: ExchangeProductsParams = {},
): Promise<ExchangeProductsResult> {
  try {
    return (await request.get<ExchangeProductsResult>(
      "/points/exchange/products",
      {
        page: 1,
        pageSize: 20,
        ...params,
      },
    )) as ExchangeProductsResult;
  } catch (error) {
    console.error("获取积分兑换商品列表失败:", error);
    throw error;
  }
}

async function getPointsRules(): Promise<PointsRules> {
  try {
    return (await request.get<PointsRules>("/points/rules")) as PointsRules;
  } catch (error) {
    console.error("获取积分规则失败:", error);
    throw error;
  }
}

async function getPointsStats(
  params: PointsStatsParams = {},
): Promise<PointsStatsResult> {
  try {
    return (await request.get<PointsStatsResult>("/points/stats", {
      timeRange: "month",
      ...params,
    })) as PointsStatsResult;
  } catch (error) {
    console.error("获取积分统计失败:", error);
    throw error;
  }
}

export {
  getPointsBalance,
  getPointsHistory,
  getPointsTasks,
  claimTaskReward,
  completeTask,
  usePoints,
  exchangeProduct,
  getExchangeProducts,
  getPointsRules,
  getPointsStats,
};

export type {
  PointsBalance,
  PointsHistoryParams,
  PointsHistoryResult,
  PointsTasksParams,
  PointsTasksResult,
  PointsTask,
  ClaimResult,
  CompleteResult,
  UsePointsParams,
  UsePointsResult,
  ExchangeProductParams,
  ExchangeProductResult,
  ExchangeProductsParams,
  ExchangeProductsResult,
  ExchangeProduct,
  PointsRules,
  PointsStatsParams,
  PointsStatsResult,
};
