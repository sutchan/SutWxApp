/**
 * 文件名: socialService.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 社交服务，处理分享、评论、点赞、关注等社交功能
 */

import request from '../utils/request';

interface ShareParams {
  productId?: string;
  articleId?: string;
  activityId?: string;
  title: string;
  description: string;
  imageUrl: string;
  shareChannel: string;
  extra?: Record<string, unknown>;
}

interface ShareRecord {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  shareChannel: string;
  createdAt: string;
  reward: number;
}

interface ShareRecordsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  targetType?: string;
  shareChannel?: string;
}

interface ShareRecordsResult {
  list: ShareRecord[];
  total: number;
  page: number;
  pageSize: number;
}

interface ShareStatsParams {
  targetId: string;
  targetType: string;
  timeRange?: string;
  shareChannel?: string;
}

interface ShareStats {
  totalShares: number;
  totalRewards: number;
  channelStats: {
    channel: string;
    count: number;
  }[];
}

interface ShareChannel {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

interface ShareReward {
  id: string;
  shareId: string;
  points: number;
  status: string;
  createdAt: string;
}

interface ShareRewardsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

interface ShareRewardsResult {
  list: ShareReward[];
  total: number;
  page: number;
  pageSize: number;
}

interface ShareRewardRule {
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

interface ShareRewardStatus {
  shareId: string;
  eligible: boolean;
  reason?: string;
  potentialReward: number;
}

interface CommentParams {
  productId: string;
  content: string;
  rating: number;
  images?: string[];
  anonymous?: boolean;
}

interface Comment {
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

interface LikeResult {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

interface FollowResult {
  success: boolean;
  followed: boolean;
  followingCount: number;
  followerCount: number;
}

interface FollowUserInfo {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  followingCount: number;
  followerCount: number;
  isFollowing: boolean;
}

interface FollowingParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  userId?: string;
}

interface FollowingResult {
  list: FollowUserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

interface FollowerParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  userId?: string;
}

interface FollowerResult {
  list: FollowUserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

interface RemoveFollowerResult {
  success: boolean;
  message: string;
}

interface RecommendedUser {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  reason: string;
}

interface FollowStats {
  followingCount: number;
  followerCount: number;
  mutualFollowCount: number;
}

interface SearchUsersParams {
  keyword: string;
  page?: number;
  pageSize?: number;
}

interface SearchUserResult {
  list: FollowUserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

async function shareProduct(params: ShareParams): Promise<{ success: boolean; reward?: number }> {
  if (!params.productId) {
    throw new Error('产品ID不能为空');
  }

  return await request.post<{ success: boolean; reward?: number }>('/social/share/product', {
    ...params,
    extra: params.extra || {}
  }) as { success: boolean; reward?: number };
}

async function shareArticle(params: ShareParams): Promise<{ success: boolean; reward?: number }> {
  if (!params.articleId) {
    throw new Error('文章ID不能为空');
  }

  return await request.post<{ success: boolean; reward?: number }>('/social/share/article', {
    ...params,
    extra: params.extra || {}
  }) as { success: boolean; reward?: number };
}

async function shareActivity(params: ShareParams): Promise<{ success: boolean; reward?: number }> {
  if (!params.activityId) {
    throw new Error('活动ID不能为空');
  }

  return await request.post<{ success: boolean; reward?: number }>('/social/share/activity', {
    ...params,
    extra: params.extra || {}
  }) as { success: boolean; reward?: number };
}

async function getShareRecords(params: ShareRecordsParams = {}): Promise<ShareRecordsResult> {
  return await request.get<ShareRecordsResult>('/social/share/records', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  }) as ShareRecordsResult;
}

async function getShareStats(params: ShareStatsParams): Promise<ShareStats> {
  return await request.get<ShareStats>(`/social/share/stats/${params.targetType}/${params.targetId}`, {
    timeRange: 'month',
    ...params
  }) as ShareStats;
}

async function getShareChannels(): Promise<ShareChannel[]> {
  return await request.get<ShareChannel[]>('/social/share/channels', {}) as ShareChannel[];
}

async function getShareRewards(params: ShareRewardsParams = {}): Promise<ShareRewardsResult> {
  return await request.get<ShareRewardsResult>('/social/share/rewards', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  }) as ShareRewardsResult;
}

async function getShareRewardRules(): Promise<ShareRewardRule[]> {
  return await request.get<ShareRewardRule[]>('/social/share/reward-rules', {}) as ShareRewardRule[];
}

async function checkShareRewardStatus(shareId: string): Promise<ShareRewardStatus> {
  if (!shareId) {
    throw new Error('分享记录ID不能为空');
  }

  return await request.get<ShareRewardStatus>(`/social/share/rewards/check/${shareId}`, {}) as ShareRewardStatus;
}

async function addProductComment(params: CommentParams): Promise<Comment> {
  if (!params.content) {
    throw new Error('评论内容不能为空');
  }

  if (params.rating < 1 || params.rating > 5) {
    throw new Error('评分必须在1-5之间');
  }

  return await request.post<Comment>('/social/comments/product', {
    anonymous: false,
    images: [],
    ...params
  }) as Comment;
}

async function likeProduct(productId: string): Promise<LikeResult> {
  return await request.post<LikeResult>('/social/like/product', {
    productId
  }) as LikeResult;
}

async function unlikeProduct(productId: string): Promise<LikeResult> {
  return await request.post<LikeResult>('/social/unlike/product', {
    productId
  }) as LikeResult;
}

async function followUser(userId: string): Promise<FollowResult> {
  return await request.post<FollowResult>('/social/follow', {
    userId
  }) as FollowResult;
}

async function unfollowUser(userId: string): Promise<FollowResult> {
  return await request.delete<FollowResult>(`/social/follow/${userId}`) as FollowResult;
}

async function getUserFollowing(params: FollowingParams = {}): Promise<FollowingResult> {
  if (params.userId) {
    return await request.get<FollowingResult>(`/users/${params.userId}/following`, {
      page: 1,
      pageSize: 20,
      sort: 'newest',
      ...params
    }) as FollowingResult;
  }

  return await request.get<FollowingResult>('/social/following', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  }) as FollowingResult;
}

async function getUserFollowers(params: FollowerParams = {}): Promise<FollowerResult> {
  if (params.userId) {
    return await request.get<FollowerResult>(`/users/${params.userId}/followers`, {
      page: 1,
      pageSize: 20,
      sort: 'newest',
      ...params
    }) as FollowerResult;
  }

  return await request.get<FollowerResult>('/social/followers', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  }) as FollowerResult;
}

async function removeFollower(userId: string): Promise<RemoveFollowerResult> {
  return await request.delete<RemoveFollowerResult>(`/user/followers/${userId}`) as RemoveFollowerResult;
}

async function getRecommendedUsers(limit = 10): Promise<RecommendedUser[]> {
  return await request.get<RecommendedUser[]>('/users/recommended', { limit }) as RecommendedUser[];
}

async function getUserFollowStats(userId?: string): Promise<FollowStats> {
  if (userId) {
    return await request.get<FollowStats>(`/users/${userId}/follow-stats`, {}) as FollowStats;
  }

  return await request.get<FollowStats>('/user/follow-stats', {}) as FollowStats;
}

async function searchUsers(params: SearchUsersParams): Promise<SearchUserResult> {
  if (!params.keyword) {
    throw new Error('搜索关键词不能为空');
  }

  return await request.get<SearchUserResult>('/social/users/search', {
    page: 1,
    pageSize: 20,
    ...params
  }) as SearchUserResult;
}

export {
  shareProduct,
  shareArticle,
  shareActivity,
  getShareRecords,
  getShareStats,
  getShareChannels,
  getShareRewards,
  getShareRewardRules,
  checkShareRewardStatus,
  addProductComment,
  likeProduct,
  unlikeProduct,
  followUser,
  unfollowUser,
  getUserFollowing,
  getUserFollowers,
  removeFollower,
  getRecommendedUsers,
  getUserFollowStats,
  searchUsers,
  ShareParams,
  ShareRecord,
  ShareRecordsParams,
  ShareRecordsResult,
  ShareStatsParams,
  ShareStats,
  ShareChannel,
  ShareReward,
  ShareRewardsParams,
  ShareRewardsResult,
  ShareRewardRule,
  ShareRewardStatus,
  CommentParams,
  Comment,
  LikeResult,
  FollowResult,
  FollowUserInfo,
  FollowingParams,
  FollowingResult,
  FollowerParams,
  FollowerResult,
  RemoveFollowerResult,
  RecommendedUser,
  FollowStats,
  SearchUsersParams,
  SearchUserResult
};
