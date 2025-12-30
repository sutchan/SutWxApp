/**
 * 文件名: categoryService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-30 10:45
 * 描述: 商品分类服务，处理商品分类相关功能
 */

import request from "../utils/request";
import { ApiResponse } from "./authService";

/**
 * 商品分类接口
 */
export interface ProductCategory {
  id: number;
  name: string;
  parentId: number;
  level: number;
  sortOrder: number;
  icon: string;
  banner: string;
  description: string;
  isShow: boolean;
  children?: ProductCategory[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 分类统计接口
 */
export interface CategoryStats {
  totalCategories: number;
  rootCategories: number;
  leafCategories: number;
  avgProductsPerCategory: number;
}

/**
 * 分类管理服务类
 */
class CategoryService {
  /**
   * 获取全部分类（树形结构）
   * @returns Promise<ProductCategory[]> 分类列表
   */
  async getCategoriesTree(): Promise<ProductCategory[]> {
    try {
      const result = await request.get<ApiResponse<ProductCategory[]>>("/category/tree");
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[CategoryService] 获取分类树形结构失败:", error);
      throw error;
    }
  }

  /**
   * 获取一级分类列表
   * @returns Promise<ProductCategory[]> 一级分类列表
   */
  async getRootCategories(): Promise<ProductCategory[]> {
    try {
      const result = await request.get<ApiResponse<ProductCategory[]>>("/category/root");
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[CategoryService] 获取一级分类失败:", error);
      throw error;
    }
  }

  /**
   * 根据父分类ID获取子分类
   * @param parentId 父分类ID
   * @returns Promise<ProductCategory[]> 子分类列表
   */
  async getSubCategories(parentId: number): Promise<ProductCategory[]> {
    try {
      const result = await request.get<ApiResponse<ProductCategory[]>>(`/category/sub/${parentId}`);
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[CategoryService] 获取子分类失败:", error);
      throw error;
    }
  }

  /**
   * 根据分类ID获取分类详情
   * @param categoryId 分类ID
   * @returns Promise<ProductCategory> 分类详情
   */
  async getCategoryDetail(categoryId: number): Promise<ProductCategory> {
    try {
      const result = await request.get<ApiResponse<ProductCategory>>(`/category/detail/${categoryId}`);
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[CategoryService] 获取分类详情失败:", error);
      throw error;
    }
  }

  /**
   * 获取热门分类
   * @param limit 数量限制
   * @returns Promise<ProductCategory[]> 热门分类列表
   */
  async getHotCategories(limit: number = 10): Promise<ProductCategory[]> {
    try {
      const result = await request.get<ApiResponse<ProductCategory[]>>("/category/hot", { limit });
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[CategoryService] 获取热门分类失败:", error);
      throw error;
    }
  }

  /**
   * 获取分类统计信息
   * @returns Promise<CategoryStats> 分类统计信息
   */
  async getCategoryStats(): Promise<CategoryStats> {
    try {
      const result = await request.get<ApiResponse<CategoryStats>>("/category/stats");
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[CategoryService] 获取分类统计信息失败:", error);
      throw error;
    }
  }

  /**
   * 获取分类下的商品数量
   * @param categoryId 分类ID
   * @returns Promise<number> 商品数量
   */
  async getCategoryProductCount(categoryId: number): Promise<number> {
    try {
      const result = await request.get<ApiResponse<{ count: number }>>(`/category/product-count/${categoryId}`);
      this.validateResponse(result);
      return result.data?.count || 0;
    } catch (error) {
      console.error("[CategoryService] 获取分类商品数量失败:", error);
      throw error;
    }
  }

  /**
   * 搜索分类
   * @param keyword 搜索关键词
   * @returns Promise<ProductCategory[]> 分类列表
   */
  async searchCategories(keyword: string): Promise<ProductCategory[]> {
    try {
      const result = await request.get<ApiResponse<ProductCategory[]>>("/category/search", { keyword });
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[CategoryService] 搜索分类失败:", error);
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

const categoryService = new CategoryService();

export default categoryService;
