// 璐墿杞︽湇鍔″崟鍏冩祴璇?const cartService = require('../cart-service');
const api = require('../api');
const validator = require('../validator');

// 妯℃嫙渚濊禆
jest.mock('../api', () => ({
  request: jest.fn()
}));

jest.mock('../validator', () => ({
  validateCartItemQuantity: jest.fn(),
  validateId: jest.fn(),
  validateCartItems: jest.fn()
}));

// 鎻愬彇妯℃嫙鐨勬柟娉?const request = api.request;
const { validateCartItemQuantity, validateId, validateCartItems } = validator;

// 鍑嗗娴嬭瘯鏁版嵁
const mockCartItems = [
  {
    id: 1,
    product_id: 'prod001',
    name: '娴嬭瘯鍟嗗搧1',
    price: 99.99,
    quantity: 2,
    stock: 10,
    available: true,
    status: 1,
    selected: true
  },
  {
    id: 2,
    product_id: 'prod002',
    name: '娴嬭瘯鍟嗗搧2',
    price: 199.99,
    quantity: 1,
    stock: 5,
    available: true,
    status: 1,
    selected: false
  }
];

describe('璐墿杞︽湇鍔℃祴璇?, () => {
  beforeEach(() => {
    // 閲嶇疆鎵€鏈夋ā鎷?    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    test('姝ｅ父鑾峰彇璐墿杞︽暟鎹?, async () => {
      request.mockResolvedValue({ data: mockCartItems });

      const result = await cartService.getCartItems();

      expect(request).toHaveBeenCalledWith('/api/cart/items', {
        method: 'GET',
        signal: expect.anything(),
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
      expect(result).toEqual(mockCartItems);
    });

    test('寮哄埗鍒锋柊鏃跺拷鐣ョ紦瀛?, async () => {
      request.mockResolvedValue({ data: mockCartItems });

      const result = await cartService.getCartItems({ forceRefresh: true });

      expect(request).toHaveBeenCalled();
      expect(result).toEqual(mockCartItems);
    });

    test('璇锋眰澶辫触浣嗘湁缂撳瓨鏃惰繑鍥炵紦瀛樻暟鎹?, async () => {
      // 鍏堣皟鐢ㄤ竴娆¤幏鍙栫紦瀛?      request.mockResolvedValueOnce({ data: mockCartItems });
      await cartService.getCartItems();
      
      // 鐒跺悗妯℃嫙澶辫触
      request.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await cartService.getCartItems();

      expect(result).toEqual(mockCartItems);
    });

    test('璇锋眰澶辫触涓旀棤缂撳瓨鏃舵姏鍑洪敊璇?, async () => {
      request.mockRejectedValue(new Error('Network error'));

      await expect(cartService.getCartItems()).rejects.toThrow('Network error');
    });
  });

  describe('addToCart', () => {
    test('姝ｅ父娣诲姞鍟嗗搧鍒拌喘鐗╄溅', async () => {
      const mockResponse = { success: true, data: { cart_id: 123 } };
      request.mockResolvedValue(mockResponse);

      const result = await cartService.addToCart('prod001', 2, 'sku001');

      expect(validateId).toHaveBeenCalledWith('prod001', '鍟嗗搧ID');
      expect(validateCartItemQuantity).toHaveBeenCalledWith(2);
      expect(validateId).toHaveBeenCalledWith('sku001', '瑙勬牸ID');
      expect(request).toHaveBeenCalledWith('/api/cart/add', {
        method: 'POST',
        data: {
          product_id: 'prod001',
          quantity: 2,
          sku_id: 'sku001'
        },
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('娣诲姞鍟嗗搧鍒拌喘鐗╄溅鏃朵娇鐢ㄩ粯璁ゆ暟閲?, async () => {
      const mockResponse = { success: true, data: { cart_id: 123 } };
      request.mockResolvedValue(mockResponse);

      const result = await cartService.addToCart('prod001');

      expect(validateCartItemQuantity).toHaveBeenCalledWith(1);
      expect(request).toHaveBeenCalledWith('/api/cart/add', {
        method: 'POST',
        data: {
          product_id: 'prod001',
          quantity: 1,
          sku_id: null
        },
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
    });

    test('娣诲姞鍟嗗搧澶辫触鏃舵姏鍑洪敊璇?, async () => {
      request.mockRejectedValue(new Error('Add to cart failed'));

      await expect(cartService.addToCart('prod001', 2)).rejects.toThrow('Add to cart failed');
    });
  });

  describe('updateCartItem', () => {
    test('姝ｅ父鏇存柊璐墿杞﹀晢鍝佹暟閲?, async () => {
      const mockResponse = { success: true };
      request.mockResolvedValue(mockResponse);

      const result = await cartService.updateCartItem(1, 3);

      expect(validateId).toHaveBeenCalledWith(1, '璐墿杞﹂」ID');
      expect(validateCartItemQuantity).toHaveBeenCalledWith(3);
      expect(request).toHaveBeenCalledWith('/api/cart/update', {
        method: 'POST',
        data: {
          cart_item_id: 1,
          quantity: 3
        },
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('鏇存柊璐墿杞﹀晢鍝佸け璐ユ椂鎶涘嚭閿欒', async () => {
      request.mockRejectedValue(new Error('Update failed'));

      await expect(cartService.updateCartItem(1, 3)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteCartItem', () => {
    test('姝ｅ父鍒犻櫎璐墿杞﹀晢鍝?, async () => {
      const mockResponse = { success: true };
      request.mockResolvedValue(mockResponse);

      const result = await cartService.deleteCartItem(1);

      expect(validateId).toHaveBeenCalledWith(1, '璐墿杞﹂」ID');
      expect(request).toHaveBeenCalledWith('/api/cart/delete', {
        method: 'POST',
        data: {
          cart_item_id: 1
        },
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('鍒犻櫎璐墿杞﹀晢鍝佸け璐ユ椂鎶涘嚭閿欒', async () => {
      request.mockRejectedValue(new Error('Delete failed'));

      await expect(cartService.deleteCartItem(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteCartItems', () => {
    test('姝ｅ父鎵归噺鍒犻櫎璐墿杞﹀晢鍝?, async () => {
      const mockResponse = { success: true };
      request.mockResolvedValue(mockResponse);

      const result = await cartService.deleteCartItems([1, 2]);

      expect(validateCartItems).toHaveBeenCalledWith([1, 2]);
      expect(request).toHaveBeenCalledWith('/api/cart/delete-batch', {
        method: 'POST',
        data: {
          cart_item_ids: [1, 2]
        },
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('鎵归噺鍒犻櫎绌烘暟缁勬椂鎶涘嚭閿欒', async () => {
      validateCartItems.mockImplementation(() => {
        throw new Error('璐墿杞﹂」ID鍒楄〃涓嶈兘涓虹┖');
      });

      await expect(cartService.deleteCartItems([])).rejects.toThrow('璐墿杞﹂」ID鍒楄〃涓嶈兘涓虹┖');
    });
  });

  describe('clearCart', () => {
    test('姝ｅ父娓呯┖璐墿杞?, async () => {
      const mockResponse = { success: true };
      request.mockResolvedValue(mockResponse);

      const result = await cartService.clearCart();

      expect(request).toHaveBeenCalledWith('/api/cart/clear', {
        method: 'POST',
        retry: {
          attempts: 3,
          delay: 1000
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('娓呯┖璐墿杞﹀け璐ユ椂鎶涘嚭閿欒', async () => {
      request.mockRejectedValue(new Error('Clear cart failed'));

      await expect(cartService.clearCart()).rejects.toThrow('Clear cart failed');
    });
  });

  describe('缂撳瓨绠＄悊', () => {
    test('clearCartCache鑳芥纭竻闄ょ紦瀛?, () => {
      cartService.clearCartCache();
      // 鐢变簬缂撳瓨鏄唴閮ㄥ彉閲忥紝鎴戜滑閫氳繃闂存帴鏂瑰紡娴嬭瘯
      // 寮哄埗鍒锋柊鑾峰彇鏁版嵁
      request.mockResolvedValue({ data: mockCartItems });
      return cartService.getCartItems({ forceRefresh: true }).then(() => {
        // 楠岃瘉璇锋眰琚皟鐢?        expect(request).toHaveBeenCalled();
      });
    });
  });
});
