﻿/**
 * 鏂囦欢鍚? authService.test.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-30
 * 浣滆€? Sut
 * 鎻忚堪: 璁よ瘉鏈嶅姟鍗曞厓娴嬭瘯
 */

// 妯℃嫙渚濊禆椤?jest.mock('../../utils/request', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../../utils/store.js', () => ({
  commit: jest.fn()
}));

// 妯℃嫙寰俊API
jest.mock('wx', () => ({
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn()
}));

const request = require('../../utils/request');
const store = require('../../utils/store.js');
const wx = require('wx');
const authService = require('../../services/authService');
const TOKEN_KEY = 'authToken';

describe('authService', () => {
  beforeEach(() => {
    // 娓呴櫎鎵€鏈夋ā鎷熻皟鐢?    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockUser = { id: 1, username: 'testuser' };
      const mockToken = 'test-token-123';
      const mockResponse = { token: mockToken, user: mockUser };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await authService.login('testuser', 'password123');
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith(
        '/auth/login',
        { username: 'testuser', password: 'password123' },
        { needAuth: false }
      );
      expect(wx.setStorageSync).toHaveBeenCalledWith(TOKEN_KEY, mockToken);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', mockToken);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', mockUser);
    });

    it('should handle login failure', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      const mockError = new Error('Invalid credentials');
      request.post.mockRejectedValue(mockError);
      
      // 鎵ц娴嬭瘯骞堕獙璇佺粨鏋?      await expect(authService.login('testuser', 'wrongpassword')).rejects.toThrow(mockError);
      expect(request.post).toHaveBeenCalled();
      expect(wx.setStorageSync).not.toHaveBeenCalled();
      expect(store.commit).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue({});
      
      // 鎵ц娴嬭瘯
      await authService.logout();
      
      // 楠岃瘉缁撴灉
      expect(request.post).toHaveBeenCalledWith('/auth/logout');
      expect(wx.removeStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });

    it('should clear local data even if API call fails', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockRejectedValue(new Error('Logout failed'));
      
      // 鎵ц娴嬭瘯
      await authService.logout();
      
      // 楠岃瘉缁撴灉
      expect(request.post).toHaveBeenCalledWith('/auth/logout');
      expect(wx.removeStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });
  });

  describe('getToken', () => {
    it('should return token from storage', () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      const mockToken = 'test-token-123';
      wx.getStorageSync.mockReturnValue(mockToken);
      
      // 鎵ц娴嬭瘯
      const result = authService.getToken();
      
      // 楠岃瘉缁撴灉
      expect(result).toBe(mockToken);
      expect(wx.getStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('should return null if no token in storage', () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      wx.getStorageSync.mockReturnValue(null);
      
      // 鎵ц娴嬭瘯
      const result = authService.getToken();
      
      // 楠岃瘉缁撴灉
      expect(result).toBeNull();
      expect(wx.getStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      wx.getStorageSync.mockReturnValue('test-token-123');
      
      // 鎵ц娴嬭瘯
      const result = authService.isLoggedIn();
      
      // 楠岃瘉缁撴灉
      expect(result).toBe(true);
    });

    it('should return false if no token exists', () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      wx.getStorageSync.mockReturnValue(null);
      
      // 鎵ц娴嬭瘯
      const result = authService.isLoggedIn();
      
      // 楠岃瘉缁撴灉
      expect(result).toBe(false);
    });
  });

  describe('checkSession', () => {
    it('should return true if session is valid', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      wx.getStorageSync.mockReturnValue('test-token-123');
      request.get.mockResolvedValue({});
      
      // 鎵ц娴嬭瘯
      const result = await authService.checkSession();
      
      // 楠岃瘉缁撴灉
      expect(result).toBe(true);
      expect(request.get).toHaveBeenCalledWith('/auth/check-session');
    });

    it('should return false if no token exists', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      wx.getStorageSync.mockReturnValue(null);
      
      // 鎵ц娴嬭瘯
      const result = await authService.checkSession();
      
      // 楠岃瘉缁撴灉
      expect(result).toBe(false);
      expect(request.get).not.toHaveBeenCalled();
    });

    it('should logout and return false if session is invalid', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      wx.getStorageSync.mockReturnValue('test-token-123');
      request.get.mockRejectedValue(new Error('Session expired'));
      
      // 鎵ц娴嬭瘯
      const result = await authService.checkSession();
      
      // 楠岃瘉缁撴灉
      expect(result).toBe(false);
      expect(request.get).toHaveBeenCalledWith('/auth/check-session');
      expect(wx.removeStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorites successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockFavorites = [{ id: 1, productId: 100 }, { id: 2, productId: 200 }];
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockFavorites);
      
      // 鎵ц娴嬭瘯
      const result = await authService.getUserFavorites();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockFavorites);
      expect(request.get).toHaveBeenCalledWith('/user/favorites');
    });

    it('should handle failure when getting user favorites', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      const mockError = new Error('Failed to get favorites');
      request.get.mockRejectedValue(mockError);
      
      // 鎵ц娴嬭瘯骞堕獙璇佺粨鏋?      await expect(authService.getUserFavorites()).rejects.toThrow(mockError);
      expect(request.get).toHaveBeenCalledWith('/user/favorites');
    });
  });

  describe('getUserAddresses', () => {
    it('should return user addresses successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockAddresses = [{ id: 1, name: 'Test Address 1' }, { id: 2, name: 'Test Address 2' }];
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.get.mockResolvedValue(mockAddresses);
      
      // 鎵ц娴嬭瘯
      const result = await authService.getUserAddresses();
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockAddresses);
      expect(request.get).toHaveBeenCalledWith('/user/addresses');
    });

    it('should handle failure when getting user addresses', async () => {
      // 璁剧疆妯℃嫙杩斿洖鍊?      const mockError = new Error('Failed to get addresses');
      request.get.mockRejectedValue(mockError);
      
      // 鎵ц娴嬭瘯骞堕獙璇佺粨鏋?      await expect(authService.getUserAddresses()).rejects.toThrow(mockError);
      expect(request.get).toHaveBeenCalledWith('/user/addresses');
    });
  });

  describe('addUserAddress', () => {
    it('should add user address successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockAddress = { name: 'Test User', phone: '13800138000', address: 'Test Address' };
      const mockResponse = { id: 1, ...mockAddress };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await authService.addUserAddress(mockAddress);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/user/addresses', mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '娣诲姞鎴愬姛',
        icon: 'success'
      });
    });

    it('should handle failure when adding user address', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const mockAddress = { name: 'Test User', phone: '13800138000', address: 'Test Address' };
      const mockError = new Error('Failed to add address');
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.post.mockRejectedValue(mockError);
      
      // 鎵ц娴嬭瘯骞堕獙璇佺粨鏋?      await expect(authService.addUserAddress(mockAddress)).rejects.toThrow(mockError);
      expect(request.post).toHaveBeenCalledWith('/user/addresses', mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '娣诲姞澶辫触',
        icon: 'none'
      });
    });
  });

  describe('updateUserAddress', () => {
    it('should update user address successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const addressId = 1;
      const mockAddress = { name: 'Updated User', phone: '13900139000', address: 'Updated Address' };
      const mockResponse = { id: addressId, ...mockAddress };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await authService.updateUserAddress(addressId, mockAddress);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/user/addresses/${addressId}`, mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '鏇存柊鎴愬姛',
        icon: 'success'
      });
    });

    it('should handle failure when updating user address', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const addressId = 1;
      const mockAddress = { name: 'Updated User', phone: '13900139000', address: 'Updated Address' };
      const mockError = new Error('Failed to update address');
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.put.mockRejectedValue(mockError);
      
      // 鎵ц娴嬭瘯骞堕獙璇佺粨鏋?      await expect(authService.updateUserAddress(addressId, mockAddress)).rejects.toThrow(mockError);
      expect(request.put).toHaveBeenCalledWith(`/user/addresses/${addressId}`, mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '鏇存柊澶辫触',
        icon: 'none'
      });
    });
  });

  describe('deleteUserAddress', () => {
    it('should delete user address successfully', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const addressId = 1;
      const mockResponse = { success: true };
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockResolvedValue(mockResponse);
      
      // 鎵ц娴嬭瘯
      const result = await authService.deleteUserAddress(addressId);
      
      // 楠岃瘉缁撴灉
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith(`/user/addresses/${addressId}`);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '鍒犻櫎鎴愬姛',
        icon: 'success'
      });
    });

    it('should handle failure when deleting user address', async () => {
      // 鍑嗗娴嬭瘯鏁版嵁
      const addressId = 1;
      const mockError = new Error('Failed to delete address');
      
      // 璁剧疆妯℃嫙杩斿洖鍊?      request.delete.mockRejectedValue(mockError);
      
      // 鎵ц娴嬭瘯骞堕獙璇佺粨鏋?      await expect(authService.deleteUserAddress(addressId)).rejects.toThrow(mockError);
      expect(request.delete).toHaveBeenCalledWith(`/user/addresses/${addressId}`);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '鍒犻櫎澶辫触',
        icon: 'none'
      });
    });
  });
});
