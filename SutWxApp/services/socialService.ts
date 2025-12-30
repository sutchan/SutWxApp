/**
 * 文件名: socialService.ts
 * 版本号: 1.0.1
 * 更新日期: 2025-12-30 11:30
 * 描述: 社交服务，处理分享、评论、点赞、关注等社交功能
 */

import request from "../utils/request";
import { ApiResponse } from "./authService";

/**
 * 分享参数接口
 */
export interface ShareParams {
  productId?: string;
  articleId?: string;
  activityId?: string;
  title: string;
  description: string;
  imageUrl: string;
  shareChannel: string;
  extra?: Record<string, unknown>;
}

/**
 * 分享记录接口
 */
export interface ShareRecord {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  shareChannel: string;
  createdAt: string;
  reward: number;
}

/**
 * 分享记录查询参数
 */
export interface ShareRecordsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  targetType?: string;
  shareChannel?: string;
}

/**
 * 分享记录结果接口
 */
export interface ShareRecordsResult {
  list: ShareRecord[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 分享统计参数接口
 */
export interface ShareStatsParams {
  targetId: string;
  targetType: string;
  timeRange?: string;
  shareChannel?: string;
}

/**
 * 分享统计接口
 */
export interface ShareStats {
  totalShares: number;
  totalRewards: number;
  channelStats: {
    channel: string;
    count: number;
  }[];
}

/**
 * 分享渠道接口
 */
export interface ShareChannel {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

/**
 * 分享奖励接口
 */
export interface ShareReward {
  id: string;
  shareId: string;
  points: number;
  status: string;
  createdAt: string;
}

/**
 * 分享奖励查询参数接口
 */
export interface ShareRewardsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

/**
 * 分享奖励结果接口
 */
export interface ShareRewardsResult {
  list: ShareReward[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 分享奖励规则接口
 */
export interface ShareRewardRule {
  id: string;
  name: string;
  description: string;
  reward: number;
  maxRewardsPerDay: number;
  conditions: {
    type: string;
    value: string | number;
  }[];
}

/**
 * 分享奖励状态接口
 */
export interface ShareRewardStatus {
  shareId: string;
  eligible: boolean;
  reason?: string;
  potentialReward: number;
}

/**
 * 评论参数接口
 */
export interface CommentParams {
  productId: string;
  content: string;
  rating: number;
  images?: string[];
  anonymous?: boolean;
}

/**
 * 评论接口
 */
export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  rating: number;
  images: string[];
  anonymous: boolean;
  createdAt: string;
  likedCount: number;
  replyCount: number;
}

/**
 * 点赞结果接口
 */
export interface LikeResult {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

/**
 * 关注结果接口
 */
export interface FollowResult {
  success: boolean;
  followed: boolean;
  followingCount: number;
  followerCount: number;
}

/**
 * 关注用户信息接口
 */
export interface FollowUserInfo {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  followingCount: number;
  followerCount: number;
  isFollowing: boolean;
}

/**
 * 关注列表查询参数接口
 */
export interface FollowingParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  userId?: string;
}

/**
 * 关注列表结果接口
 */
export interface FollowingResult {
  list: FollowUserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 粉丝列表查询参数接口
 */
export interface FollowerParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  userId?: string;
}

/**
 * 粉丝列表结果接口
 */
export interface FollowerResult {
  list: FollowUserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 删除粉丝结果接口
 */
export interface RemoveFollowerResult {
  success: boolean;
  message: string;
}

/**
 * 推荐用户接口
 */
export interface RecommendedUser {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  reason: string;
}

/**
 * 关注统计接口
 */
export interface FollowStats {
  followingCount: number;
  followerCount: number;
  mutualFollowCount: number;
}

/**
 * 搜索用户参数接口
 */
export interface SearchUsersParams {
  keyword: string;
  page?: number;
  pageSize?: number;
}

/**
 * 搜索用户结果接口
 */
export interface SearchUserResult {
  list: FollowUserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 社交服务类
 */
class SocialService {
  /**
   * 分享商品
   * @param params 分享参数
   * @returns Promise<{ success: boolean; reward?: number }> 分享结果
   */
  async shareProduct(params: ShareParams): Promise<{ success: boolean; reward?: number }> {
    if (!params.productId) {
      throw new Error("产品ID不能为空");
    }

    const result = await request.post<ApiResponse<{ success: boolean; reward?: number }>>("/social/share/product", {
      ...params,
      extra: params.extra || {},
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 分享文章
   * @param params 分享参数
   * @returns Promise<{ success: boolean; reward?: number }> 分享结果
   */
  async shareArticle(params: ShareParams): Promise<{ success: boolean; reward?: number }> {
    if (!params.articleId) {
      throw new Error("文章ID不能为空");
    }

    const result = await request.post<ApiResponse<{ success: boolean; reward?: number }>>("/social/share/article", {
      ...params,
      extra: params.extra || {},
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 分享活动
   * @param params 分享参数
   * @returns Promise<{ success: boolean; reward?: number }> 分享结果
   */
  async shareActivity(params: ShareParams): Promise<{ success: boolean; reward?: number }> {
    if (!params.activityId) {
      throw new Error("活动ID不能为空");
    }

    const result = await request.post<ApiResponse<{ success: boolean; reward?: number }>>("/social/share/activity", {
      ...params,
      extra: params.extra || {},
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取分享记录
   * @param params 查询参数
   * @returns Promise<ShareRecordsResult> 分享记录结果
   */
  async getShareRecords(params: ShareRecordsParams = {}): Promise<ShareRecordsResult> {
    const result = await request.get<ApiResponse<ShareRecordsResult>>("/social/share/records", {
      page: 1,
      pageSize: 20,
      sort: "newest",
      ...params,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取分享统计
   * @param params 查询参数
   * @returns Promise<ShareStats> 分享统计结果
   */
  async getShareStats(params: ShareStatsParams): Promise<ShareStats> {
    const result = await request.get<ApiResponse<ShareStats>>(`/social/share/stats/${params.targetType}/${params.targetId}`, {
      timeRange: "month",
      ...params,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取分享渠道
   * @returns Promise<ShareChannel[]> 分享渠道列表
   */
  async getShareChannels(): Promise<ShareChannel[]> {
    const result = await request.get<ApiResponse<ShareChannel[]>>("/social/share/channels");
    this.validateResponse(result);
    return result.data || [];
  }

  /**
   * 获取分享奖励
   * @param params 查询参数
   * @returns Promise<ShareRewardsResult> 分享奖励结果
   */
  async getShareRewards(params: ShareRewardsParams = {}): Promise<ShareRewardsResult> {
    const result = await request.get<ApiResponse<ShareRewardsResult>>("/social/share/rewards", {
      page: 1,
      pageSize: 20,
      sort: "newest",
      ...params,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取分享奖励规则
   * @returns Promise<ShareRewardRule[]> 分享奖励规则列表
   */
  async getShareRewardRules(): Promise<ShareRewardRule[]> {
    const result = await request.get<ApiResponse<ShareRewardRule[]>>("/social/share/reward-rules");
    this.validateResponse(result);
    return result.data || [];
  }

  /**
   * 检查分享奖励状态
   * @param shareId 分享记录ID
   * @returns Promise<ShareRewardStatus> 分享奖励状态
   */
  async checkShareRewardStatus(shareId: string): Promise<ShareRewardStatus> {
    if (!shareId) {
      throw new Error("分享记录ID不能为空");
    }

    const result = await request.get<ApiResponse<ShareRewardStatus>>(`/social/share/rewards/check/${shareId}`);
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 提交商品评论
   * @param params 评论参数
   * @returns Promise<Comment> 评论结果
   */
  async addProductComment(params: CommentParams): Promise<Comment> {
    if (!params.content) {
      throw new Error("评论内容不能为空");
    }

    if (params.rating < 1 || params.rating > 5) {
      throw new Error("评分必须在1-5之间");
    }

    const result = await request.post<ApiResponse<Comment>>("/social/comments/product", {
      anonymous: false,
      images: [],
      ...params,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 点赞商品
   * @param productId 商品ID
   * @returns Promise<LikeResult> 点赞结果
   */
  async likeProduct(productId: string): Promise<LikeResult> {
    const result = await request.post<ApiResponse<LikeResult>>("/social/like/product", {
      productId,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 取消点赞商品
   * @param productId 商品ID
   * @returns Promise<LikeResult> 取消点赞结果
   */
  async unlikeProduct(productId: string): Promise<LikeResult> {
    const result = await request.post<ApiResponse<LikeResult>>("/social/unlike/product", {
      productId,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 关注用户
   * @param userId 用户ID
   * @returns Promise<FollowResult> 关注结果
   */
  async followUser(userId: string): Promise<FollowResult> {
    const result = await request.post<ApiResponse<FollowResult>>("/social/follow", {
      userId,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 取消关注用户
   * @param userId 用户ID
   * @returns Promise<FollowResult> 取消关注结果
   */
  async unfollowUser(userId: string): Promise<FollowResult> {
    const result = await request.delete<ApiResponse<FollowResult>>(`/social/follow/${userId}`);
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取用户关注列表
   * @param params 查询参数
   * @returns Promise<FollowingResult> 关注列表结果
   */
  async getUserFollowing(params: FollowingParams = {}): Promise<FollowingResult> {
    let url = "/social/following";
    if (params.userId) {
      url = `/users/${params.userId}/following`;
    }

    const result = await request.get<ApiResponse<FollowingResult>>(url, {
      page: 1,
      pageSize: 20,
      sort: "newest",
      ...params,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取用户粉丝列表
   * @param params 查询参数
   * @returns Promise<FollowerResult> 粉丝列表结果
   */
  async getUserFollowers(params: FollowerParams = {}): Promise<FollowerResult> {
    let url = "/social/followers";
    if (params.userId) {
      url = `/users/${params.userId}/followers`;
    }

    const result = await request.get<ApiResponse<FollowerResult>>(url, {
      page: 1,
      pageSize: 20,
      sort: "newest",
      ...params,
    });
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 删除粉丝
   * @param userId 用户ID
   * @returns Promise<RemoveFollowerResult> 删除粉丝结果
   */
  async removeFollower(userId: string): Promise<RemoveFollowerResult> {
    const result = await request.delete<ApiResponse<RemoveFollowerResult>>(`/user/followers/${userId}`);
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 获取推荐用户
   * @param limit 数量限制
   * @returns Promise<RecommendedUser[]> 推荐用户列表
   */
  async getRecommendedUsers(limit = 10): Promise<RecommendedUser[]> {
    const result = await request.get<ApiResponse<RecommendedUser[]>>("/users/recommended", {
      limit,
    });
    this.validateResponse(result);
    return result.data || [];
  }

  /**
   * 获取用户关注统计
   * @param userId 用户ID（可选，不填则获取当前用户）
   * @returns Promise<FollowStats> 关注统计结果
   */
  async getUserFollowStats(userId?: string): Promise<FollowStats> {
    let url = "/user/follow-stats";
    if (userId) {
      url = `/users/${userId}/follow-stats`;
    }

    const result = await request.get<ApiResponse<FollowStats>>(url);
    this.validateResponse(result);
    return result.data;
  }

  /**
   * 搜索用户
   * @param params 查询参数
   * @returns Promise<SearchUserResult> 搜索结果
   */
  async searchUsers(params: SearchUsersParams): Promise<SearchUserResult> {
    if (!params.keyword) {
      throw new Error("搜索关键词不能为空");
    }

    const result = await request.get<ApiResponse<SearchUserResult>>("/social/users/search", {
      page: 1,
      pageSize: 20,
      ...params,
    });
    this.validateResponse(result);
    return result.data;
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

const socialService = new SocialService();

export default socialService;
