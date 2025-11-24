/**
 * 文件名: favoriteService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: favoriteService 的单元测试
 */

// 模拟请求模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const favoriteService = require('../favoriteService');

describe('favoriteService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('getUserFavorites', () => {
    it('should call request.get with correct endpoint for current user', async () => {
      const mockData = { favorites: [], total: 0 };
      const options = { type: 'product', sort: 'oldest' };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFavorites(options);

      expect(request.get).toHaveBeenCalledWith('/user/favorites', {
        params: {
          page: 1,
          pageSize: 20,
          type: 'product',
          sort: 'oldest'
        }
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint for specific user', async () => {
      const mockData = { favorites: [], total: 0 };
      const options = { userId: 'user123', page: 2, pageSize: 10 };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFavorites(options);

      expect(request.get).toHaveBeenCalledWith('/users/user123/favorites', {
        params: {
          page: 2,
          pageSize: 10,
          type: 'all',
          sort: 'newest'
        }
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('addProductFavorite', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const productId = 'prod123';
      request.post.mockResolvedValue(mockData);

      const result = await favoriteService.addProductFavorite(productId);

      expect(request.post).toHaveBeenCalledWith('/user/favorites/product', { productId });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when productId is empty', async () => {
      await expect(favoriteService.addProductFavorite('')).rejects.toThrow('商品ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('removeProductFavorite', () => {
    it('should call request.delete with correct endpoint', async () => {
      const mockData = { success: true };
      const productId = 'prod123';
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.removeProductFavorite(productId);

      expect(request.delete).toHaveBeenCalledWith(`/user/favorites/product/${productId}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when productId is empty', async () => {
      await expect(favoriteService.removeProductFavorite('')).rejects.toThrow('商品ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkProductFavorite', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { isFavorited: true };
      const productId = 'prod123';
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.checkProductFavorite(productId);

      expect(request.get).toHaveBeenCalledWith(`/user/favorites/product/${productId}/check`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when productId is empty', async () => {
      await expect(favoriteService.checkProductFavorite('')).rejects.toThrow('商品ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('addArticleFavorite', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const articleId = 'article123';
      request.post.mockResolvedValue(mockData);

      const result = await favoriteService.addArticleFavorite(articleId);

      expect(request.post).toHaveBeenCalledWith('/user/favorites/article', { articleId });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when articleId is empty', async () => {
      await expect(favoriteService.addArticleFavorite('')).rejects.toThrow('文章ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('removeArticleFavorite', () => {
    it('should call request.delete with correct endpoint', async () => {
      const mockData = { success: true };
      const articleId = 'article123';
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.removeArticleFavorite(articleId);

      expect(request.delete).toHaveBeenCalledWith(`/user/favorites/article/${articleId}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when articleId is empty', async () => {
      await expect(favoriteService.removeArticleFavorite('')).rejects.toThrow('文章ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkArticleFavorite', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { isFavorited: true };
      const articleId = 'article123';
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.checkArticleFavorite(articleId);

      expect(request.get).toHaveBeenCalledWith(`/user/favorites/article/${articleId}/check`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when articleId is empty', async () => {
      await expect(favoriteService.checkArticleFavorite('')).rejects.toThrow('文章ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('batchRemoveFavorites', () => {
    it('should call request.delete with correct endpoint and data', async () => {
      const mockData = { success: true };
      const favoriteIds = ['fav1', 'fav2', 'fav3'];
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.batchRemoveFavorites(favoriteIds);

      expect(request.delete).toHaveBeenCalledWith('/user/favorites/batch', { data: { favoriteIds } });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when favoriteIds is empty', async () => {
      await expect(favoriteService.batchRemoveFavorites([])).rejects.toThrow('收藏ID列表不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUserFollowing', () => {
    it('should call request.get with correct endpoint for current user', async () => {
      const mockData = { users: [], total: 0 };
      const options = { page: 2, pageSize: 10, sort: 'oldest' };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFollowing(options);

      expect(request.get).toHaveBeenCalledWith('/user/following', {
        params: {
          page: 2,
          pageSize: 10,
          sort: 'oldest'
        }
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint for specific user', async () => {
      const mockData = { users: [], total: 0 };
      const options = { userId: 'user123' };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFollowing(options);

      expect(request.get).toHaveBeenCalledWith('/users/user123/following', {
        params: {
          page: 1,
          pageSize: 20,
          sort: 'newest'
        }
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('getUserFollowers', () => {
    it('should call request.get with correct endpoint for current user', async () => {
      const mockData = { users: [], total: 0 };
      const options = { page: 2, pageSize: 10, sort: 'oldest' };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFollowers(options);

      expect(request.get).toHaveBeenCalledWith('/user/followers', {
        params: {
          page: 2,
          pageSize: 10,
          sort: 'oldest'
        }
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint for specific user', async () => {
      const mockData = { users: [], total: 0 };
      const options = { userId: 'user123' };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFollowers(options);

      expect(request.get).toHaveBeenCalledWith('/users/user123/followers', {
        params: {
          page: 1,
          pageSize: 20,
          sort: 'newest'
        }
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('followUser', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const targetUserId = 'user123';
      request.post.mockResolvedValue(mockData);

      const result = await favoriteService.followUser(targetUserId);

      expect(request.post).toHaveBeenCalledWith('/user/following', { targetUserId });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when targetUserId is empty', async () => {
      await expect(favoriteService.followUser('')).rejects.toThrow('目标用户ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('should call request.delete with correct endpoint', async () => {
      const mockData = { success: true };
      const targetUserId = 'user123';
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.unfollowUser(targetUserId);

      expect(request.delete).toHaveBeenCalledWith(`/user/following/${targetUserId}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when targetUserId is empty', async () => {
      await expect(favoriteService.unfollowUser('')).rejects.toThrow('目标用户ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkUserFollowing', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { isFollowing: true };
      const targetUserId = 'user123';
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.checkUserFollowing(targetUserId);

      expect(request.get).toHaveBeenCalledWith(`/user/following/${targetUserId}/check`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when targetUserId is empty', async () => {
      await expect(favoriteService.checkUserFollowing('')).rejects.toThrow('目标用户ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('removeFollower', () => {
    it('should call request.delete with correct endpoint', async () => {
      const mockData = { success: true };
      const followerId = 'user123';
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.removeFollower(followerId);

      expect(request.delete).toHaveBeenCalledWith(`/user/followers/${followerId}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when followerId is empty', async () => {
      await expect(favoriteService.removeFollower('')).rejects.toThrow('粉丝ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('getRecommendedUsers', () => {
    it('should call request.get with correct endpoint and default limit', async () => {
      const mockData = { users: [] };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getRecommendedUsers();

      expect(request.get).toHaveBeenCalledWith('/users/recommended', {
        params: { limit: 10 }
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom limit', async () => {
      const mockData = { users: [] };
      const limit = 5;
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getRecommendedUsers(limit);

      expect(request.get).toHaveBeenCalledWith('/users/recommended', {
        params: { limit }
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('getUserFollowStats', () => {
    it('should call request.get with correct endpoint for current user', async () => {
      const mockData = { followingCount: 10, followersCount: 20 };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFollowStats();

      expect(request.get).toHaveBeenCalledWith('/user/follow-stats');
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint for specific user', async () => {
      const mockData = { followingCount: 10, followersCount: 20 };
      const userId = 'user123';
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getUserFollowStats(userId);

      expect(request.get).toHaveBeenCalledWith(`/users/${userId}/follow-stats`);
      expect(result).toEqual(mockData);
    });
  });

  describe('getFavoriteFolders', () => {
    it('should call request.get with correct endpoint and default parameters', async () => {
      const mockData = { folders: [], total: 0 };
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getFavoriteFolders();

      expect(request.get).toHaveBeenCalledWith('/user/favorite-folders', {
        params: { page: 1, pageSize: 20 }
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom parameters', async () => {
      const mockData = { folders: [], total: 0 };
      const page = 2;
      const pageSize = 10;
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getFavoriteFolders(page, pageSize);

      expect(request.get).toHaveBeenCalledWith('/user/favorite-folders', {
        params: { page, pageSize }
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('createFavoriteFolder', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { id: 'folder1', name: 'Test Folder' };
      const data = { name: 'Test Folder', description: 'Test Description', isPublic: true };
      request.post.mockResolvedValue(mockData);

      const result = await favoriteService.createFavoriteFolder(data);

      expect(request.post).toHaveBeenCalledWith('/user/favorite-folders', {
        name: 'Test Folder',
        description: 'Test Description',
        isPublic: true
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.post with trimmed name and description', async () => {
      const mockData = { id: 'folder1', name: 'Test Folder' };
      const data = { name: '  Test Folder  ', description: '  Test Description  ' };
      request.post.mockResolvedValue(mockData);

      const result = await favoriteService.createFavoriteFolder(data);

      expect(request.post).toHaveBeenCalledWith('/user/favorite-folders', {
        name: 'Test Folder',
        description: 'Test Description',
        isPublic: false
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when name is empty', async () => {
      const data = { name: '', description: 'Test Description' };
      
      await expect(favoriteService.createFavoriteFolder(data)).rejects.toThrow('收藏夹名称不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should reject with error when name is too long', async () => {
      const data = { name: 'a'.repeat(21), description: 'Test Description' };
      
      await expect(favoriteService.createFavoriteFolder(data)).rejects.toThrow('收藏夹名称不能超过20个字符');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should reject with error when description is too long', async () => {
      const data = { name: 'Test Folder', description: 'a'.repeat(101) };
      
      await expect(favoriteService.createFavoriteFolder(data)).rejects.toThrow('收藏夹描述不能超过100个字符');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('updateFavoriteFolder', () => {
    it('should call request.put with correct endpoint and data', async () => {
      const mockData = { id: 'folder1', name: 'Updated Folder' };
      const folderId = 'folder1';
      const data = { name: 'Updated Folder', description: 'Updated Description', isPublic: false };
      request.put.mockResolvedValue(mockData);

      const result = await favoriteService.updateFavoriteFolder(folderId, data);

      expect(request.put).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}`, {
        name: 'Updated Folder',
        description: 'Updated Description',
        isPublic: false
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.put with trimmed name and description', async () => {
      const mockData = { id: 'folder1', name: 'Updated Folder' };
      const folderId = 'folder1';
      const data = { name: '  Updated Folder  ', description: '  Updated Description  ' };
      request.put.mockResolvedValue(mockData);

      const result = await favoriteService.updateFavoriteFolder(folderId, data);

      expect(request.put).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}`, {
        name: 'Updated Folder',
        description: 'Updated Description'
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when folderId is empty', async () => {
      const data = { name: 'Updated Folder' };
      
      await expect(favoriteService.updateFavoriteFolder('', data)).rejects.toThrow('收藏夹ID不能为空');
      expect(request.put).not.toHaveBeenCalled();
    });

    it('should reject with error when name is empty', async () => {
      const folderId = 'folder1';
      const data = { name: '' };
      
      await expect(favoriteService.updateFavoriteFolder(folderId, data)).rejects.toThrow('收藏夹名称不能为空');
      expect(request.put).not.toHaveBeenCalled();
    });

    it('should reject with error when name is too long', async () => {
      const folderId = 'folder1';
      const data = { name: 'a'.repeat(21) };
      
      await expect(favoriteService.updateFavoriteFolder(folderId, data)).rejects.toThrow('收藏夹名称不能超过20个字符');
      expect(request.put).not.toHaveBeenCalled();
    });

    it('should reject with error when description is too long', async () => {
      const folderId = 'folder1';
      const data = { description: 'a'.repeat(101) };
      
      await expect(favoriteService.updateFavoriteFolder(folderId, data)).rejects.toThrow('收藏夹描述不能超过100个字符');
      expect(request.put).not.toHaveBeenCalled();
    });
  });

  describe('deleteFavoriteFolder', () => {
    it('should call request.delete with correct endpoint', async () => {
      const mockData = { success: true };
      const folderId = 'folder1';
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.deleteFavoriteFolder(folderId);

      expect(request.delete).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when folderId is empty', async () => {
      await expect(favoriteService.deleteFavoriteFolder('')).rejects.toThrow('收藏夹ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('getFavoriteFolderContent', () => {
    it('should call request.get with correct endpoint and default parameters', async () => {
      const mockData = { content: [], total: 0 };
      const folderId = 'folder1';
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getFavoriteFolderContent(folderId);

      expect(request.get).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}/content`, {
        params: { page: 1, pageSize: 20 }
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom parameters', async () => {
      const mockData = { content: [], total: 0 };
      const folderId = 'folder1';
      const page = 2;
      const pageSize = 10;
      request.get.mockResolvedValue(mockData);

      const result = await favoriteService.getFavoriteFolderContent(folderId, page, pageSize);

      expect(request.get).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}/content`, {
        params: { page, pageSize }
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when folderId is empty', async () => {
      await expect(favoriteService.getFavoriteFolderContent('')).rejects.toThrow('收藏夹ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('addToFavoriteFolder', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const folderId = 'folder1';
      const favoriteId = 'fav1';
      request.post.mockResolvedValue(mockData);

      const result = await favoriteService.addToFavoriteFolder(folderId, favoriteId);

      expect(request.post).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}/add`, { favoriteId });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when folderId is empty', async () => {
      const favoriteId = 'fav1';
      
      await expect(favoriteService.addToFavoriteFolder('', favoriteId)).rejects.toThrow('收藏夹ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should reject with error when favoriteId is empty', async () => {
      const folderId = 'folder1';
      
      await expect(favoriteService.addToFavoriteFolder(folderId, '')).rejects.toThrow('收藏ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('removeFromFavoriteFolder', () => {
    it('should call request.delete with correct endpoint', async () => {
      const mockData = { success: true };
      const folderId = 'folder1';
      const favoriteId = 'fav1';
      request.delete.mockResolvedValue(mockData);

      const result = await favoriteService.removeFromFavoriteFolder(folderId, favoriteId);

      expect(request.delete).toHaveBeenCalledWith(`/user/favorite-folders/${folderId}/favorites/${favoriteId}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when folderId is empty', async () => {
      const favoriteId = 'fav1';
      
      await expect(favoriteService.removeFromFavoriteFolder('', favoriteId)).rejects.toThrow('收藏夹ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });

    it('should reject with error when favoriteId is empty', async () => {
      const folderId = 'folder1';
      
      await expect(favoriteService.removeFromFavoriteFolder(folderId, '')).rejects.toThrow('收藏ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });
});