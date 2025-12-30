/**
 * 文件名: productService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-30 10:30
 * 描述: 商品管理服务，处理商品列表、详情、评价等功能
 */

import request, { CancelToken } from "../utils/request";
import { ApiResponse } from "./authService";

/**
 * 商品基础信息接口
 */
export interface ProductBase {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: number;
  categoryName?: string;
  brand?: string;
  sales: number;
  stock: number;
  isFavorite?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 商品规格接口
 */
export interface ProductSpec {
  id: number;
  productId: number;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  sku: string;
}

/**
 * 商品详情接口
 */
export interface ProductDetail extends ProductBase {
  description: string;
  specs: ProductSpec[];
  details: string[];
  isFavorite: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  weight?: number;
  dimensions?: string;
  warranty?: string;
}

/**
 * 商品评价接口
 */
export interface ProductReview {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 商品评价分页结果
 */
export interface ProductReviewResult {
  list: ProductReview[];
  total: number;
  pageNum: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 商品查询参数
 */
export interface ProductQueryParams {
  categoryId?: number;
  keyword?: string;
  sortBy?: "price" | "sales" | "rating" | "newest";
  sortOrder?: "asc" | "desc";
  pageNum?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  [key: string]: unknown;
}

/**
 * 商品列表分页结果
 */
export interface ProductListResult {
  list: ProductBase[];
  total: number;
  pageNum: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 商品管理服务类
 */
class ProductService {
  /**
   * 获取商品详情
   * @param productId 商品ID
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<ProductDetail> 商品详情
   */
  async getProductDetail(productId: number, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<ProductDetail> {
    try {
      const result = await request.get<ApiResponse<ProductDetail>>(`/product/detail`, { id: productId }, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: `product_detail_${productId}`
      });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[ProductService] 获取商品详情失败:", error);
      throw error;
    }
  }

  /**
   * 获取商品列表
   * @param params 查询参数
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<ProductListResult> 商品列表
   */
  async getProductList(params?: ProductQueryParams, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<ProductListResult> {
    try {
      // 生成缓存键
      const cacheKey = params 
        ? `product_list_${JSON.stringify(params)}` 
        : `product_list_default`;
        
      const result = await request.get<ApiResponse<ProductListResult>>("/product/list", params, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey
      });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[ProductService] 获取商品列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取相关商品
   * @param productId 商品ID
   * @param limit 数量限制
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<ProductBase[]> 相关商品列表
   */
  async getRelatedProducts(productId: number, limit: number = 6, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<ProductBase[]> {
    try {
      const result = await request.get<ApiResponse<ProductBase[]>>("/product/related", { productId, limit }, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: `product_related_${productId}_${limit}`
      });
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[ProductService] 获取相关商品失败:", error);
      throw error;
    }
  }

  /**
   * 获取商品评价列表
   * @param productId 商品ID
   * @param params 查询参数
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<ProductReviewResult> 商品评价列表
   */
  async getProductReviews(productId: number, params?: {
    pageNum?: number;
    pageSize?: number;
    rating?: number;
  }, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<ProductReviewResult> {
    try {
      const result = await request.get<ApiResponse<ProductReviewResult>>("/product/reviews", { productId, ...params }, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: `product_reviews_${productId}_${JSON.stringify(params)}`
      });
      this.validateResponse(result);
      return result.data;
    } catch (error) {
      console.error("[ProductService] 获取商品评价列表失败:", error);
      throw error;
    }
  }

  /**
   * 提交商品评价
   * @param data 评价数据
   * @param options 请求选项，包含cancelToken
   * @returns Promise<boolean> 提交结果
   */
  async submitProductReview(data: {
    productId: number;
    rating: number;
    content: string;
    images?: string[];
    anonymous?: boolean;
  }, options?: {
    cancelToken?: CancelToken;
  }): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/product/reviews", data, {
        cancelToken: options?.cancelToken
      });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[ProductService] 提交商品评价失败:", error);
      throw error;
    }
  }

  /**
   * 点赞商品评价
   * @param reviewId 评价ID
   * @param options 请求选项，包含cancelToken
   * @returns Promise<{ likes: number; isLiked: boolean }> 点赞结果
   */
  async likeProductReview(reviewId: string, options?: {
    cancelToken?: CancelToken;
  }): Promise<{ likes: number; isLiked: boolean }> {
    try {
      const result = await request.post<ApiResponse<{ likes: number; isLiked: boolean }>>(`/product/reviews/${reviewId}/like`, {}, {
        cancelToken: options?.cancelToken
      });
      this.validateResponse(result);
      return result.data || { likes: 0, isLiked: false };
    } catch (error) {
      console.error("[ProductService] 点赞商品评价失败:", error);
      throw error;
    }
  }

  /**
   * 取消点赞商品评价
   * @param reviewId 评价ID
   * @param options 请求选项，包含cancelToken
   * @returns Promise<{ likes: number; isLiked: boolean }> 取消点赞结果
   */
  async unlikeProductReview(reviewId: string, options?: {
    cancelToken?: CancelToken;
  }): Promise<{ likes: number; isLiked: boolean }> {
    try {
      const result = await request.post<ApiResponse<{ likes: number; isLiked: boolean }>>(`/product/reviews/${reviewId}/unlike`, {}, {
        cancelToken: options?.cancelToken
      });
      this.validateResponse(result);
      return result.data || { likes: 0, isLiked: false };
    } catch (error) {
      console.error("[ProductService] 取消点赞商品评价失败:", error);
      throw error;
    }
  }

  /**
   * 商品收藏
   * @param productId 商品ID
   * @param options 请求选项，包含cancelToken
   * @returns Promise<boolean> 收藏结果
   */
  async favoriteProduct(productId: number, options?: {
    cancelToken?: CancelToken;
  }): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/product/favorite", { productId }, {
        cancelToken: options?.cancelToken
      });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[ProductService] 商品收藏失败:", error);
      throw error;
    }
  }

  /**
   * 取消商品收藏
   * @param productId 商品ID
   * @param options 请求选项，包含cancelToken
   * @returns Promise<boolean> 取消收藏结果
   */
  async unfavoriteProduct(productId: number, options?: {
    cancelToken?: CancelToken;
  }): Promise<boolean> {
    try {
      const result = await request.post<ApiResponse<{ success: boolean }>>("/product/unfavorite", { productId }, {
        cancelToken: options?.cancelToken
      });
      this.validateResponse(result);
      return result.data?.success || false;
    } catch (error) {
      console.error("[ProductService] 取消商品收藏失败:", error);
      throw error;
    }
  }

  /**
   * 检查商品是否已收藏
   * @param productId 商品ID
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<boolean> 是否已收藏
   */
  async checkProductFavorite(productId: number, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<boolean> {
    try {
      const result = await request.get<ApiResponse<{ isFavorite: boolean }>>("/product/check-favorite", { productId }, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: `product_favorite_${productId}`
      });
      this.validateResponse(result);
      return result.data?.isFavorite || false;
    } catch (error) {
      console.error("[ProductService] 检查商品收藏状态失败:", error);
      throw error;
    }
  }

  /**
   * 获取商品搜索建议
   * @param keyword 搜索关键词
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<string[]> 搜索建议列表
   */
  async getSearchSuggestions(keyword: string, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<string[]> {
    try {
      const result = await request.get<ApiResponse<string[]>>("/product/search-suggestions", { keyword }, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: `product_suggestions_${keyword}`
      });
      this.validateResponse(result);
      return result.data || [];
    } catch (error) {
      console.error("[ProductService] 获取商品搜索建议失败:", error);
      throw error;
    }
  }

  /**
   * 商品分享
   * @param productId 商品ID
   * @param options 请求选项，包含cancelToken和缓存配置
   * @returns Promise<{ shareUrl: string; shareImage: string }> 分享信息
   */
  async getShareInfo(productId: number, options?: {
    cancelToken?: CancelToken;
    useCache?: boolean;
  }): Promise<{ shareUrl: string; shareImage: string }> {
    try {
      const result = await request.get<ApiResponse<{ shareUrl: string; shareImage: string }>>("/product/share-info", { productId }, {
        cancelToken: options?.cancelToken,
        useCache: options?.useCache ?? true,
        cacheKey: `product_share_${productId}`
      });
      this.validateResponse(result);
      return result.data || { shareUrl: "", shareImage: "" };
    } catch (error) {
      console.error("[ProductService] 获取商品分享信息失败:", error);
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

const productService = new ProductService();

export default productService;
